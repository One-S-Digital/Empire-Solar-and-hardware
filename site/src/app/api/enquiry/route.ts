import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { normalisePhone, validateDetails, type Details } from "@/lib/enquiry-validate";

/**
 * Receives an enquiry. In production this forwards to the WordPress endpoint (Website Plan 12.5, phase 1), which saves
 * the Enquiry, emails the store and returns the docket number. Until WordPress exists there is nowhere to send it:
 * - ENQUIRY_ENDPOINT set: forward to it.
 * - otherwise in development: write data/out/dev-enquiries.jsonl so the whole flow can be tested.
 * - otherwise: answer 503, so the form keeps everything and offers WhatsApp. It never pretends to have sent.
 */
type Line = { name: string; qty: number; brand?: string; code?: string; label?: string; note?: string; custom?: boolean };

const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let body: { items?: Line[]; details?: Details; website?: string; consent?: boolean };
  try {
    body = await req.json();
  } catch {
    return bad("Could not read the enquiry.");
  }
  // Honeypot: real people never fill this in. Pretend it worked.
  if (body.website) return NextResponse.json({ ok: true, docket: "ESH-0000" });

  const { items, details } = body;
  if (!Array.isArray(items) || items.length === 0 || items.length > 100) return bad("The list is empty.");
  if (!items.every((i) => i && typeof i.name === "string" && i.name.length <= 200 && Number.isInteger(i.qty) && i.qty >= 1 && i.qty <= 999)) return bad("Check the quantities on your list.");
  if (!details || Object.keys(validateDetails(details)).length) return bad("Check your details.");
  if (!body.consent) return bad("Please agree to the privacy line.");

  const payload = { items, details: { ...details, phone: normalisePhone(details.phone) }, receivedAt: new Date().toISOString() };

  const endpoint = process.env.ENQUIRY_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      if (!res.ok) return bad("The store's system did not accept it.", 502);
      const out = (await res.json()) as { docket?: string };
      return NextResponse.json({ ok: true, docket: out.docket ?? "ESH-0000" });
    } catch {
      return bad("Could not reach the store's system.", 502);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const file = path.join(process.cwd(), "..", "data", "out", "dev-enquiries.jsonl");
    await mkdir(path.dirname(file), { recursive: true });
    const n = (await readFile(file, "utf8").catch(() => "")).split("\n").filter(Boolean).length + 1;
    const docket = `ESH-${String(n).padStart(4, "0")}`;
    await appendFile(file, JSON.stringify({ docket, ...payload }) + "\n");
    return NextResponse.json({ ok: true, docket });
  }

  return bad("Online sending is not switched on yet.", 503);
}
