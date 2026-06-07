import { QUESTION_COUNT } from "./shared/questions";
import { sanitizeAnswers, scoreMmpi, type AnswerMap } from "./shared/scoring";

type TestStatus = "active" | "completed";

interface TestSessionRow {
  id: string;
  participant_name: string;
  status: TestStatus;
  current_index: number;
  answers_json: string;
  started_at: string;
  updated_at: string;
  completed_at: string | null;
}

interface UpdatePayload {
  answers?: unknown;
  currentIndex?: unknown;
}

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function errorResponse(message: string, status = 400): Response {
  return jsonResponse({ error: message }, status);
}

async function readJson(request: Request): Promise<unknown> {
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 250_000) {
    throw new Error("payload-too-large");
  }
  return request.json();
}

function normalizeName(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().replace(/\s+/g, " ");
  if (normalized.length < 1 || normalized.length > 80) return null;
  return normalized;
}

function normalizeIndex(value: unknown, fallback: number): number {
  if (typeof value !== "number" || !Number.isInteger(value)) return fallback;
  return Math.max(0, Math.min(QUESTION_COUNT - 1, value));
}

function parseAnswers(json: string): AnswerMap {
  try {
    return sanitizeAnswers(JSON.parse(json));
  } catch {
    return {};
  }
}

function serializeSession(row: TestSessionRow) {
  const answers = parseAnswers(row.answers_json);

  return {
    id: row.id,
    name: row.participant_name,
    status: row.status,
    currentIndex: row.current_index,
    answers,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at,
    result: row.status === "completed" ? scoreMmpi(answers) : null
  };
}

async function getSession(env: Env, id: string): Promise<TestSessionRow | null> {
  return env.DB.prepare(
    `SELECT id, participant_name, status, current_index, answers_json, started_at, updated_at, completed_at
     FROM test_sessions
     WHERE id = ?`
  )
    .bind(id)
    .first<TestSessionRow>();
}

async function createSession(request: Request, env: Env): Promise<Response> {
  const payload = (await readJson(request)) as { name?: unknown };
  const name = normalizeName(payload.name);
  if (!name) return errorResponse("Geçerli bir isim girin.");

  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await env.DB.prepare(
    `INSERT INTO test_sessions (id, participant_name, status, current_index, answers_json, started_at, updated_at)
     VALUES (?, ?, 'active', 0, '{}', ?, ?)`
  )
    .bind(id, name, now, now)
    .run();

  const row = await getSession(env, id);
  if (!row) return errorResponse("Test oluşturulamadı.", 500);
  return jsonResponse(serializeSession(row), 201);
}

async function updateSession(request: Request, env: Env, id: string): Promise<Response> {
  const existing = await getSession(env, id);
  if (!existing) return errorResponse("Test bulunamadı.", 404);

  const payload = (await readJson(request)) as UpdatePayload;
  const answers = sanitizeAnswers(payload.answers ?? parseAnswers(existing.answers_json));
  const currentIndex = normalizeIndex(payload.currentIndex, existing.current_index);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE test_sessions
     SET answers_json = ?, current_index = ?, status = 'active', updated_at = ?, completed_at = NULL
     WHERE id = ?`
  )
    .bind(JSON.stringify(answers), currentIndex, now, id)
    .run();

  const row = await getSession(env, id);
  if (!row) return errorResponse("Test güncellenemedi.", 500);
  return jsonResponse(serializeSession(row));
}

async function completeSession(request: Request, env: Env, id: string): Promise<Response> {
  const existing = await getSession(env, id);
  if (!existing) return errorResponse("Test bulunamadı.", 404);

  const payload = (await readJson(request)) as UpdatePayload;
  const answers = sanitizeAnswers(payload.answers ?? parseAnswers(existing.answers_json));
  const currentIndex = normalizeIndex(payload.currentIndex, existing.current_index);
  const now = new Date().toISOString();

  await env.DB.prepare(
    `UPDATE test_sessions
     SET answers_json = ?, current_index = ?, status = 'completed', updated_at = ?, completed_at = ?
     WHERE id = ?`
  )
    .bind(JSON.stringify(answers), currentIndex, now, now, id)
    .run();

  const row = await getSession(env, id);
  if (!row) return errorResponse("Test tamamlanamadı.", 500);
  return jsonResponse(serializeSession(row));
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  try {
    if (pathname === "/api/health" && request.method === "GET") {
      return jsonResponse({ ok: true, questionCount: QUESTION_COUNT });
    }

    if (pathname === "/api/tests" && request.method === "POST") {
      return createSession(request, env);
    }

    const completeMatch = pathname.match(/^\/api\/tests\/([^/]+)\/complete$/);
    if (completeMatch && request.method === "POST") {
      return completeSession(request, env, decodeURIComponent(completeMatch[1]));
    }

    const sessionMatch = pathname.match(/^\/api\/tests\/([^/]+)$/);
    if (sessionMatch && request.method === "GET") {
      const row = await getSession(env, decodeURIComponent(sessionMatch[1]));
      if (!row) return errorResponse("Test bulunamadı.", 404);
      return jsonResponse(serializeSession(row));
    }

    if (sessionMatch && request.method === "PATCH") {
      return updateSession(request, env, decodeURIComponent(sessionMatch[1]));
    }

    return errorResponse("Endpoint bulunamadı.", 404);
  } catch (error) {
    const message = error instanceof Error && error.message === "payload-too-large"
      ? "İstek gövdesi çok büyük."
      : "İstek işlenemedi.";
    return errorResponse(message, error instanceof Error && error.message === "payload-too-large" ? 413 : 500);
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    return env.ASSETS.fetch(request);
  }
} satisfies ExportedHandler<Env>;
