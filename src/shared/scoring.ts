import {
  K_CORRECTIONS,
  NORM_STATS,
  PROFILE_SCALES,
  SCALE_KEYS,
  type KeyedAnswer,
  type NormMode,
  type ScaleCategory,
  type ScaleKeyId
} from "./scoringData";
import { QUESTION_COUNT } from "./questions";

export type AnswerMap = Record<string, KeyedAnswer>;

export interface ScaleScore {
  id: string;
  code: string;
  label: string;
  description: string;
  category: ScaleCategory;
  raw: number;
  corrected: number;
  rawMale?: number;
  rawFemale?: number;
  correctedMale?: number;
  correctedFemale?: number;
  correctionLabel?: string;
  t: {
    general: number;
    male: number;
    female: number;
  };
}

export interface DisplayScaleScore extends ScaleScore {
  displayRaw: number;
  displayCorrected: number;
  displayT: number;
}

export interface ScoreResult {
  version: "mmpi-566-tr-v1";
  totalQuestions: number;
  answeredCount: number;
  unansweredCount: number;
  rawByKey: Record<ScaleKeyId, number>;
  scales: ScaleScore[];
  notes: string[];
  codeType: string | null;
  createdAt: string;
}

type NormId = keyof typeof NORM_STATS.male;
type KCorrectionKind = "half" | "point4" | "point2" | "full";

function answerAt(answers: AnswerMap, item: number): KeyedAnswer | undefined {
  const value = answers[String(item)];
  return value === "D" || value === "Y" ? value : undefined;
}

function scoreKey(keyId: ScaleKeyId, answers: AnswerMap): number {
  const key = SCALE_KEYS[keyId];
  let score = 0;

  for (const item of key.D) {
    if (answerAt(answers, item) === "D") score += 1;
  }
  for (const item of key.Y) {
    if (answerAt(answers, item) === "Y") score += 1;
  }

  return score;
}

function getKCorrection(kRaw: number) {
  return K_CORRECTIONS.find((entry) => entry.k === kRaw) ?? K_CORRECTIONS[K_CORRECTIONS.length - 1];
}

function applyKCorrection(raw: number, kRaw: number, kind?: KCorrectionKind): number {
  if (!kind) return raw;
  if (kind === "full") return raw + kRaw;

  const correction = getKCorrection(kRaw);
  if (kind === "half") return raw + correction.half;
  if (kind === "point4") return raw + correction.point4;
  return raw + correction.point2;
}

function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

function tScore(norm: "male" | "female", normId: NormId, score: number): number {
  const stats = NORM_STATS[norm][normId];
  return round1(50 + (10 * (score - stats.mean)) / stats.sd);
}

function clampChartT(value: number): number {
  return Math.max(0, Math.min(120, value));
}

function buildNotes(scales: ScaleScore[], unansweredCount: number): string[] {
  const notes: string[] = [];
  const byId = new Map(scales.map((scale) => [scale.id, scale]));
  const f = byId.get("F");
  const l = byId.get("L");
  const k = byId.get("K");

  if (unansweredCount >= 30) {
    notes.push("Boş bırakılan madde sayısı yüksek; profil dikkatle değerlendirilmelidir.");
  } else if (unansweredCount >= 10) {
    notes.push("Boş bırakılan madde sayısı orta düzeyde; bazı ölçekler eksik yanıtlardan etkilenebilir.");
  }

  if (f && f.t.general >= 70) {
    notes.push("F ölçeği yüksek; yanıt örüntüsü nadir cevaplar, dikkatsizlik, abartma ya da yoğun sıkıntı açısından uzman yorumu gerektirir.");
  }

  if ((l && l.t.general >= 65) || (k && k.t.general >= 65)) {
    notes.push("L/K tarafında yükselme var; kişi sorunları olduğundan iyi göstermiş veya savunucu yanıtlamış olabilir.");
  }

  if (k && k.t.general <= 40) {
    notes.push("K ölçeği düşük; savunuculuk az olabilir, ancak profil tek başına tanısal yorum için yeterli değildir.");
  }

  if (notes.length === 0) {
    notes.push("Geçerlilik ölçeklerinde belirgin uyarı yok; yine de bu çıktı klinik değerlendirme yerine geçmez.");
  }

  return notes;
}

function buildCodeType(scales: ScaleScore[]): string | null {
  const elevated = scales
    .filter((scale) => scale.category === "clinical" && scale.id !== "Mf")
    .filter((scale) => scale.t.general >= 65)
    .sort((a, b) => b.t.general - a.t.general)
    .slice(0, 2);

  if (elevated.length < 2) return null;
  return elevated.map((scale) => scale.code).join("-");
}

export function sanitizeAnswers(input: unknown): AnswerMap {
  if (!input || typeof input !== "object") return {};
  const result: AnswerMap = {};

  for (const [key, value] of Object.entries(input as Record<string, unknown>)) {
    const item = Number(key);
    if (!Number.isInteger(item) || item < 1 || item > QUESTION_COUNT) continue;
    if (value === "D" || value === "Y") result[String(item)] = value;
  }

  return result;
}

export function scoreMmpi(answersInput: unknown): ScoreResult {
  const answers = sanitizeAnswers(answersInput);
  const rawByKey = Object.keys(SCALE_KEYS).reduce<Record<ScaleKeyId, number>>((acc, key) => {
    const keyId = key as ScaleKeyId;
    acc[keyId] = scoreKey(keyId, answers);
    return acc;
  }, {} as Record<ScaleKeyId, number>);

  const kRaw = rawByKey.K;
  const scales = PROFILE_SCALES.map<ScaleScore>((scale) => {
    if ("maleKey" in scale) {
      const rawMale = rawByKey[scale.maleKey];
      const rawFemale = rawByKey[scale.femaleKey];
      const male = tScore("male", scale.normId, rawMale);
      const female = tScore("female", scale.normId, rawFemale);

      return {
        id: scale.id,
        code: scale.code,
        label: scale.label,
        description: scale.description,
        category: scale.category,
        raw: round1((rawMale + rawFemale) / 2),
        corrected: round1((rawMale + rawFemale) / 2),
        rawMale,
        rawFemale,
        correctedMale: rawMale,
        correctedFemale: rawFemale,
        t: {
          male: clampChartT(male),
          female: clampChartT(female),
          general: clampChartT(round1((male + female) / 2))
        }
      };
    }

    const raw = rawByKey[scale.key];
    const correctionKind = "kCorrection" in scale ? scale.kCorrection : undefined;
    const corrected = applyKCorrection(raw, kRaw, correctionKind as KCorrectionKind | undefined);
    const male = tScore("male", scale.normId, corrected);
    const female = tScore("female", scale.normId, corrected);

    return {
      id: scale.id,
      code: scale.code,
      label: scale.label,
      description: scale.description,
      category: scale.category,
      raw,
      corrected,
      correctionLabel: correctionKind,
      t: {
        male: clampChartT(male),
        female: clampChartT(female),
        general: clampChartT(round1((male + female) / 2))
      }
    };
  });

  const answeredCount = Object.keys(answers).length;

  return {
    version: "mmpi-566-tr-v1",
    totalQuestions: QUESTION_COUNT,
    answeredCount,
    unansweredCount: QUESTION_COUNT - answeredCount,
    rawByKey,
    scales,
    notes: buildNotes(scales, QUESTION_COUNT - answeredCount),
    codeType: buildCodeType(scales),
    createdAt: new Date().toISOString()
  };
}

export function getDisplayScales(result: ScoreResult, normMode: NormMode): DisplayScaleScore[] {
  return result.scales.map((scale) => {
    if (scale.id === "Mf") {
      if (normMode === "male") {
        return {
          ...scale,
          displayRaw: scale.rawMale ?? scale.raw,
          displayCorrected: scale.correctedMale ?? scale.corrected,
          displayT: scale.t.male
        };
      }
      if (normMode === "female") {
        return {
          ...scale,
          displayRaw: scale.rawFemale ?? scale.raw,
          displayCorrected: scale.correctedFemale ?? scale.corrected,
          displayT: scale.t.female
        };
      }
    }

    return {
      ...scale,
      displayRaw: scale.raw,
      displayCorrected: scale.corrected,
      displayT: scale.t[normMode]
    };
  });
}
