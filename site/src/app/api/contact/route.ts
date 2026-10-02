import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { MAX_IMAGES, MAX_IMAGE_CHARS, TOPICS } from "@/lib/contact";
import { normalisePhone, validateDetails, type Details } from "@/lib/enquiry-validate";

/**
 * Receives a Contact form message. Same rules as /api/enquiry: forward to CONTACT_ENDPOINT (WordPress, phase 1)
 * when set; in development write data/out/dev-contact.jsonl; in production without an endpoint answer 503 so the
 * form shows its failure state instead of pretending to have sent. Photos go to the endpoint as data URLs and are
 * never written to disk in development (only a count is logged).
 */
const bad = (error: string, status = 400) => NextResponse.json({ ok: false, error }, { status });

export async function POST(req: Request) {
  let body: { topic?: string; extra?: Record<string, unknown>; details?: Details; images?: string[]; consent?: boolean; website?: string };
  try {
    body = await req.json();
  } catch {
    return bad("Could not read the message.");
  }
  if (body.website) return NextResponse.json({ ok: true });

  const { topic, details, images = [] } = body;
  if (!TOPICS.some((t) => t.value === topic)) return bad("Choose what we can help with.");
  if (!details || Object.keys(validateDetails(details)).length) return bad("Check your details.");
  if (!body.consent) return bad("Please agree to the privacy line.");
  if (!Array.isArray(images) || images.length > MAX_IMAGES || !images.every((i) => typeof i === "string" && i.startsWith("data:image/jpeg;base64,") && i.length <= MAX_IMAGE_CHARS)) {
    return bad("Check the photos.");
  }

  const payload = { topic, extra: body.extra ?? {}, details: { ...details, phone: normalisePhone(details.phone) }, images, receivedAt: new Date().toISOString() };

  const endpoint = process.env.CONTACT_ENDPOINT;
  if (endpoint) {
    try {
      const res = await fetch(endpoint, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(payload) });
      return res.ok ? NextResponse.json({ ok: true }) : bad("The store's system did not accept it.", 502);
    } catch {
      return bad("Could not reach the store's system.", 502);
    }
  }

  if (process.env.NODE_ENV !== "production") {
    const file = path.join(process.cwd(), "..", "data", "out", "dev-contact.jsonl");
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, JSON.stringify({ ...payload, images: images.length }) + "\n");
    return NextResponse.json({ ok: true });
  }

  return bad("Online sending is not switched on yet.", 503);
}
