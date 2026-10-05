import { NextRequest } from "next/server";
import { isBackupShape } from "@/lib/backupData";
import { readSession } from "@/lib/server/session";
import { loadSync, saveSync, syncConfigured } from "@/lib/server/store";

const MAX_BODY_BYTES = 4_000_000;

export async function GET() {
  if (!syncConfigured()) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const stored = await loadSync(session.sub);
    if (!stored) {
      return Response.json({ updatedAt: null, data: null });
    }
    return Response.json({
      updatedAt: stored.updatedAt,
      data: stored.data ?? null,
    });
  } catch {
    return Response.json({ error: "store" }, { status: 502 });
  }
}

export async function PUT(request: NextRequest) {
  if (!syncConfigured()) {
    return Response.json({ error: "not-configured" }, { status: 503 });
  }
  const session = await readSession();
  if (!session) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > MAX_BODY_BYTES) {
    return Response.json({ error: "too-large" }, { status: 413 });
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid-json" }, { status: 400 });
  }
  const data = (body as { data?: unknown } | null)?.data;
  if (!isBackupShape(data)) {
    return Response.json({ error: "invalid-backup" }, { status: 400 });
  }
  try {
    const updatedAt = await saveSync(session.sub, data);
    return Response.json({ updatedAt });
  } catch {
    return Response.json({ error: "store" }, { status: 502 });
  }
}
