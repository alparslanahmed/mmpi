import {
  BarChart3,
  Check,
  ChevronLeft,
  RotateCcw,
  Save,
  SkipForward,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties, FormEvent, PointerEvent } from "react";
import { QUESTIONS, QUESTION_COUNT } from "../shared/questions";
import {
  getDisplayScales,
  sanitizeAnswers,
  scoreMmpi,
  type AnswerMap,
  type ScoreResult
} from "../shared/scoring";
import type { NormMode } from "../shared/scoringData";

type Screen = "start" | "test" | "results";
type SaveState = "idle" | "saving" | "saved" | "offline";
type TestStatus = "active" | "completed";
type AnswerValue = "D" | "Y";
type DragPhase = "idle" | "dragging" | "exiting";

interface ApiSession {
  id: string;
  name: string;
  status: TestStatus;
  currentIndex: number;
  answers: AnswerMap;
  result: ScoreResult | null;
}

interface ClientSession extends ApiSession {
  updatedLocallyAt: string;
}

interface DragState {
  x: number;
  y: number;
  phase: DragPhase;
  exitAnswer: AnswerValue | null;
}

const STORAGE_KEY = "mmpi-active-session-v1";
const DRAG_THRESHOLD = 92;
const EXIT_DISTANCE = 560;
const IDLE_DRAG: DragState = { x: 0, y: 0, phase: "idle", exitAnswer: null };

function saveLocalSession(session: ClientSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function readLocalSession(): ClientSession | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as ClientSession;
    if (!parsed.id || !parsed.name) return null;
    return {
      ...parsed,
      answers: sanitizeAnswers(parsed.answers),
      currentIndex: Math.max(0, Math.min(QUESTION_COUNT - 1, parsed.currentIndex ?? 0)),
      result: parsed.result ?? null,
      status: parsed.status === "completed" ? "completed" : "active",
      updatedLocallyAt: parsed.updatedLocallyAt ?? new Date().toISOString()
    };
  } catch {
    return null;
  }
}

async function apiJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    }
  });

  const body = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(body.error ?? "İstek başarısız.");
  }
  return body;
}

function toClientSession(session: ApiSession): ClientSession {
  return {
    ...session,
    answers: sanitizeAnswers(session.answers),
    currentIndex: Math.max(0, Math.min(QUESTION_COUNT - 1, session.currentIndex)),
    updatedLocallyAt: new Date().toISOString()
  };
}

function completionText(answered: number): string {
  return `${answered}/${QUESTION_COUNT}`;
}

export function App() {
  const [screen, setScreen] = useState<Screen>("start");
  const [name, setName] = useState("");
  const [session, setSession] = useState<ClientSession | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [normMode, setNormMode] = useState<NormMode>("general");
  const swipeStart = useRef<{ x: number; y: number } | null>(null);
  const swipeTimer = useRef<number | null>(null);
  const [drag, setDrag] = useState<DragState>(IDLE_DRAG);

  useEffect(() => {
    const local = readLocalSession();
    if (!local) return;

    setSession(local);
    setName(local.name);
    setScreen(local.status === "completed" ? "results" : "test");

    apiJson<ApiSession>(`/api/tests/${encodeURIComponent(local.id)}`)
      .then((remote) => {
        const next = toClientSession(remote);
        setSession(next);
        saveLocalSession(next);
        setScreen(next.status === "completed" ? "results" : "test");
      })
      .catch(() => setSaveState("offline"));
  }, []);

  useEffect(() => {
    return () => {
      if (swipeTimer.current !== null) {
        window.clearTimeout(swipeTimer.current);
      }
    };
  }, []);

  const currentQuestion = session ? QUESTIONS[session.currentIndex] : QUESTIONS[0];
  const answeredCount = session ? Object.keys(sanitizeAnswers(session.answers)).length : 0;
  const progress = session ? ((session.currentIndex + 1) / QUESTION_COUNT) * 100 : 0;
  const activeAnswer = session ? session.answers[String(currentQuestion.id)] : undefined;
  const dragAnswer = drag.exitAnswer ?? (drag.x > 26 ? "D" : drag.x < -26 ? "Y" : null);
  const dragProgress = Math.min(Math.abs(drag.x) / DRAG_THRESHOLD, 1);
  const isSwipeLocked = drag.phase === "exiting";
  const questionCardStyle = {
    transform: `translate3d(${drag.x}px, ${drag.y}px, 0) rotate(${drag.x / 18}deg)`,
    "--yes-opacity": dragAnswer === "D" ? dragProgress : 0,
    "--no-opacity": dragAnswer === "Y" ? dragProgress : 0
  } as CSSProperties;
  const result = useMemo(() => {
    if (!session || session.status !== "completed") return null;
    return session.result ?? scoreMmpi(session.answers);
  }, [session]);

  async function persistProgress(next: ClientSession): Promise<void> {
    setSaveState("saving");
    try {
      const remote = await apiJson<ApiSession>(`/api/tests/${encodeURIComponent(next.id)}`, {
        method: "PATCH",
        body: JSON.stringify({
          answers: next.answers,
          currentIndex: next.currentIndex
        })
      });
      const synced = toClientSession(remote);
      setSession((current) => (current?.id === synced.id ? synced : current));
      saveLocalSession(synced);
      setSaveState("saved");
    } catch {
      setSaveState("offline");
    }
  }

  async function complete(next: ClientSession): Promise<void> {
    setSaveState("saving");
    const fallback: ClientSession = {
      ...next,
      status: "completed",
      result: scoreMmpi(next.answers),
      updatedLocallyAt: new Date().toISOString()
    };

    setSession(fallback);
    saveLocalSession(fallback);
    setScreen("results");

    try {
      const remote = await apiJson<ApiSession>(`/api/tests/${encodeURIComponent(next.id)}/complete`, {
        method: "POST",
        body: JSON.stringify({
          answers: next.answers,
          currentIndex: next.currentIndex
        })
      });
      const synced = toClientSession(remote);
      setSession(synced);
      saveLocalSession(synced);
      setSaveState("saved");
    } catch {
      setSaveState("offline");
    }
  }

  function commit(next: ClientSession, shouldComplete = false): void {
    setSession(next);
    saveLocalSession(next);
    if (shouldComplete) {
      void complete(next);
      return;
    }
    void persistProgress(next);
  }

  async function startTest(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setError(null);
    const cleanName = name.trim().replace(/\s+/g, " ");
    if (!cleanName) {
      setError("İsim girin.");
      return;
    }

    setSaveState("saving");
    try {
      const created = await apiJson<ApiSession>("/api/tests", {
        method: "POST",
        body: JSON.stringify({ name: cleanName })
      });
      const next = toClientSession(created);
      setSession(next);
      saveLocalSession(next);
      setScreen("test");
      setSaveState("saved");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Test başlatılamadı.");
      setSaveState("offline");
    }
  }

  function answerCurrent(answer: AnswerValue): void {
    if (!session || session.status === "completed") return;
    const answers = { ...session.answers, [String(currentQuestion.id)]: answer };
    const isLast = session.currentIndex >= QUESTION_COUNT - 1;
    const next: ClientSession = {
      ...session,
      answers,
      currentIndex: isLast ? session.currentIndex : session.currentIndex + 1,
      updatedLocallyAt: new Date().toISOString()
    };
    commit(next, isLast);
  }

  function skipCurrent(): void {
    if (!session || session.status === "completed") return;
    const isLast = session.currentIndex >= QUESTION_COUNT - 1;
    const next = {
      ...session,
      currentIndex: isLast ? session.currentIndex : session.currentIndex + 1,
      updatedLocallyAt: new Date().toISOString()
    };
    commit(next, isLast);
  }

  function goBack(): void {
    if (!session || session.currentIndex === 0 || isSwipeLocked) return;
    const next = {
      ...session,
      currentIndex: session.currentIndex - 1,
      updatedLocallyAt: new Date().toISOString()
    };
    commit(next);
  }

  function returnToCurrentQuestion(): void {
    if (!session || isSwipeLocked) return;
    const next: ClientSession = {
      ...session,
      status: "active",
      result: null,
      currentIndex: Math.max(0, Math.min(QUESTION_COUNT - 1, session.currentIndex)),
      updatedLocallyAt: new Date().toISOString()
    };

    setDrag(IDLE_DRAG);
    setSession(next);
    saveLocalSession(next);
    setScreen("test");
    void persistProgress(next);
  }

  function animateAnswer(answer: AnswerValue): void {
    if (!session || session.status === "completed" || isSwipeLocked) return;
    const direction = answer === "D" ? 1 : -1;
    const exitY = drag.phase === "dragging" ? drag.y : 0;

    setDrag({
      x: direction * EXIT_DISTANCE,
      y: exitY,
      phase: "exiting",
      exitAnswer: answer
    });

    if (swipeTimer.current !== null) {
      window.clearTimeout(swipeTimer.current);
    }

    swipeTimer.current = window.setTimeout(() => {
      swipeTimer.current = null;
      setDrag(IDLE_DRAG);
      answerCurrent(answer);
    }, 230);
  }

  function resetTest(): void {
    localStorage.removeItem(STORAGE_KEY);
    setSession(null);
    setName("");
    setScreen("start");
    setSaveState("idle");
    setError(null);
  }

  function handlePointerDown(event: PointerEvent<HTMLElement>): void {
    if (!session || session.status === "completed" || isSwipeLocked) return;
    swipeStart.current = { x: event.clientX, y: event.clientY };
    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ x: 0, y: 0, phase: "dragging", exitAnswer: null });
  }

  function handlePointerMove(event: PointerEvent<HTMLElement>): void {
    const start = swipeStart.current;
    if (!start || drag.phase !== "dragging") return;

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    setDrag({
      x: dx,
      y: Math.max(-90, Math.min(90, dy * 0.42)),
      phase: "dragging",
      exitAnswer: null
    });
  }

  function handlePointerUp(event: PointerEvent<HTMLElement>): void {
    const start = swipeStart.current;
    swipeStart.current = null;
    if (!start) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) >= DRAG_THRESHOLD && Math.abs(dx) >= Math.abs(dy) * 1.15) {
      animateAnswer(dx > 0 ? "D" : "Y");
      return;
    }

    setDrag(IDLE_DRAG);
  }

  function handlePointerCancel(event: PointerEvent<HTMLElement>): void {
    swipeStart.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    if (!isSwipeLocked) setDrag(IDLE_DRAG);
  }

  return (
    <main className="app-shell">
      {screen === "start" && (
        <section className="start-view" aria-labelledby="start-title">
          <div className="brand-row">
            <div className="brand-mark"><BarChart3 size={22} /></div>
            <span>MMPI</span>
          </div>
          <h1 id="start-title">Mobil test oturumu</h1>
          <form className="name-form" onSubmit={startTest}>
            <label htmlFor="participant-name">İsim</label>
            <div className="name-input-row">
              <UserRound size={20} aria-hidden="true" />
              <input
                id="participant-name"
                value={name}
                maxLength={80}
                autoComplete="name"
                onChange={(event) => setName(event.target.value)}
              />
            </div>
            {error && <p className="error-text">{error}</p>}
            <button className="primary-button" type="submit" disabled={saveState === "saving"}>
              <Check size={20} aria-hidden="true" />
              Başlat
            </button>
          </form>
        </section>
      )}

      {screen === "test" && session && (
        <section className="test-view" aria-label="Test">
          <header className="test-header">
            <div className="progress-block">
              <div className="meta-row">
                <span>{session.name}</span>
                <span>{completionText(answeredCount)}</span>
              </div>
              <div className="progress-track" aria-hidden="true">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
            <div className={`save-pill save-${saveState}`}>
              <Save size={15} aria-hidden="true" />
              <span>{saveState === "saving" ? "Kaydediliyor" : saveState === "offline" ? "Yerel" : "Kayıtlı"}</span>
            </div>
          </header>

          <div className="question-stack">
            <article
              className={`question-panel question-card-${drag.phase}`}
              style={questionCardStyle}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerCancel}
            >
              <div className="swipe-badge yes" aria-hidden="true">Doğru</div>
              <div className="swipe-badge no" aria-hidden="true">Yanlış</div>
              <div className="question-number">{currentQuestion.id}</div>
              <p>{currentQuestion.text}</p>
              <div className="answer-state">
                {activeAnswer === "D" && <span className="answer-chip true">Doğru</span>}
                {activeAnswer === "Y" && <span className="answer-chip false">Yanlış</span>}
                {!activeAnswer && <span className="answer-chip empty">Boş</span>}
              </div>
            </article>
          </div>

          <nav className="answer-dock" aria-label="Cevaplar">
            <button className="answer-button false" type="button" onClick={() => animateAnswer("Y")} disabled={isSwipeLocked}>
              <X size={24} aria-hidden="true" />
              Yanlış
            </button>
            <button className="mini-button" type="button" onClick={goBack} disabled={session.currentIndex === 0 || isSwipeLocked} title="Geri" aria-label="Geri">
              <ChevronLeft size={21} />
              Geri
            </button>
            <button className="mini-button" type="button" onClick={skipCurrent} disabled={isSwipeLocked} title="Boş bırak" aria-label="Boş bırak">
              <SkipForward size={21} />
              Boş
            </button>
            <button className="answer-button true" type="button" onClick={() => animateAnswer("D")} disabled={isSwipeLocked}>
              <Check size={24} aria-hidden="true" />
              Doğru
            </button>
          </nav>
        </section>
      )}

      {screen === "results" && session && result && (
        <ResultsView
          result={result}
          normMode={normMode}
          onNormModeChange={setNormMode}
          onBackToTest={returnToCurrentQuestion}
          onReset={resetTest}
        />
      )}
    </main>
  );
}

function ResultsView({
  result,
  normMode,
  onNormModeChange,
  onBackToTest,
  onReset
}: {
  result: ScoreResult;
  normMode: NormMode;
  onNormModeChange: (mode: NormMode) => void;
  onBackToTest: () => void;
  onReset: () => void;
}) {
  const rows = getDisplayScales(result, normMode);
  const elevated = rows
    .filter((row) => row.category === "clinical" && row.displayT >= 65)
    .sort((a, b) => b.displayT - a.displayT)
    .slice(0, 4);

  return (
    <section className="results-view" aria-label="Sonuçlar">
      <header className="results-header">
        <div>
          <p className="eyebrow">Profil</p>
          <h1>Sonuç grafiği</h1>
        </div>
        <button className="icon-button" type="button" onClick={onBackToTest} title="Son soruya dön" aria-label="Son soruya dön">
          <ChevronLeft size={21} />
        </button>
        <button className="icon-button" type="button" onClick={onReset} title="Yeni test" aria-label="Yeni test">
          <RotateCcw size={21} />
        </button>
      </header>

      <div className="notice">
        Bu çıktı klinik tanı değildir. MMPI uygulama, puanlama ve yorumlama süreci yetkin uzman değerlendirmesi gerektirir.
      </div>

      <div className="segmented" role="tablist" aria-label="Norm">
        {(["general", "male", "female"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            className={normMode === mode ? "active" : ""}
            onClick={() => onNormModeChange(mode)}
          >
            {mode === "general" ? "Genel" : mode === "male" ? "Erkek" : "Kadın"}
          </button>
        ))}
      </div>

      <ProfileChart rows={rows} />

      <div className="summary-grid">
        <div className="summary-tile">
          <span>Yanıt</span>
          <strong>{result.answeredCount}</strong>
        </div>
        <div className="summary-tile">
          <span>Boş</span>
          <strong>{result.unansweredCount}</strong>
        </div>
        <div className="summary-tile">
          <span>Kod</span>
          <strong>{result.codeType ?? "-"}</strong>
        </div>
      </div>

      <section className="notes">
        {result.notes.map((note) => (
          <p key={note}>{note}</p>
        ))}
      </section>

      {elevated.length > 0 && (
        <section className="elevations">
          <h2>Yükselen ölçekler</h2>
          {elevated.map((row) => (
            <div className="scale-line" key={row.id}>
              <div>
                <strong>{row.code} {row.id}</strong>
                <span>{row.label}</span>
              </div>
              <b>{Math.round(row.displayT)}</b>
            </div>
          ))}
        </section>
      )}

      <section className="scale-table">
        <h2>Cetvel</h2>
        {rows.map((row) => (
          <details key={row.id}>
            <summary>
              <span>{row.code} {row.id} · {row.label}</span>
              <b>{Math.round(row.displayT)}</b>
            </summary>
            <div className="scale-detail">
              <span>Ham: {row.displayRaw}</span>
              <span>K ekli: {row.displayCorrected}</span>
              <p>{row.description}</p>
            </div>
          </details>
        ))}
      </section>
    </section>
  );
}

function ProfileChart({ rows }: { rows: ReturnType<typeof getDisplayScales> }) {
  const width = 720;
  const height = 340;
  const left = 44;
  const right = 18;
  const top = 18;
  const bottom = 64;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxT = 120;
  const xStep = chartWidth / Math.max(1, rows.length - 1);
  const yFor = (value: number) => top + chartHeight - (Math.max(0, Math.min(maxT, value)) / maxT) * chartHeight;
  const points = rows.map((row, index) => ({
    row,
    x: left + index * xStep,
    y: yFor(row.displayT)
  }));
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const guides = [30, 50, 65, 70, 90, 120];

  return (
    <div className="chart-scroll" role="img" aria-label="MMPI profil grafiği">
      <svg className="profile-chart" viewBox={`0 0 ${width} ${height}`}>
        <rect x={left} y={yFor(70)} width={chartWidth} height={yFor(50) - yFor(70)} className="chart-band" />
        {guides.map((guide) => (
          <g key={guide}>
            <line x1={left} x2={width - right} y1={yFor(guide)} y2={yFor(guide)} className={guide === 65 || guide === 70 ? "guide-line strong" : "guide-line"} />
            <text x={12} y={yFor(guide) + 4} className="axis-label">{guide}</text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={height - bottom} className="axis-line" />
        <line x1={left} x2={width - right} y1={height - bottom} y2={height - bottom} className="axis-line" />
        <path d={path} className="chart-path" />
        {points.map((point) => (
          <g key={point.row.id}>
            <circle cx={point.x} cy={point.y} r={6} className={point.row.category === "validity" ? "chart-dot validity" : "chart-dot"} />
            <text x={point.x} y={height - 40} textAnchor="middle" className="scale-code">{point.row.id}</text>
            <text x={point.x} y={height - 20} textAnchor="middle" className="scale-score">{Math.round(point.row.displayT)}</text>
          </g>
        ))}
      </svg>
    </div>
  );
}
