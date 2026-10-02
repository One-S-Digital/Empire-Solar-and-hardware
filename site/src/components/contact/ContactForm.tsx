"use client";

import Link from "next/link";
import { Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { EXISTING, KEEP_ON, MAX_IMAGES, PROPERTY, TOPICS, type Topic } from "@/lib/contact";
import { emptyDetails, formatPhone, validateDetails, validateField, type Details, type Errors, type Reply } from "@/lib/enquiry-validate";
import styles from "./ContactForm.module.css";

const REPLY: { value: Reply; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
];

/** Shrinks a photo in the browser (longest side 1600 px, JPEG) so a phone camera shot is a few hundred KB, not several MB. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.8);
}

export function ContactForm() {
  const [topic, setTopic] = useState<Topic>();
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [errors, setErrors] = useState<Errors>({});
  const [property, setProperty] = useState("");
  const [keepOn, setKeepOn] = useState<string[]>([]);
  const [hours, setHours] = useState("");
  const [existing, setExisting] = useState("");
  const [product, setProduct] = useState("");
  const [qty, setQty] = useState("1");
  const [needed, setNeeded] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [imageNote, setImageNote] = useState<string>();
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [done, setDone] = useState<string>();
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof Details>(k: K, v: Details[K]) => setDetails((d) => ({ ...d, [k]: v }));
  const blur = (k: keyof Details) => setErrors((e) => ({ ...e, [k]: validateField(k, details) }));
  const toggle = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const addFiles = async (files: FileList | null) => {
    if (!files) return;
    setImageNote(undefined);
    const room = MAX_IMAGES - images.length;
    const picked = [...files].filter((f) => f.type.startsWith("image/")).slice(0, room);
    if (files.length > room) setImageNote(`Up to ${MAX_IMAGES} photos. Extra ones were left out.`);
    try {
      const out = await Promise.all(picked.map(shrink));
      setImages((i) => [...i, ...out]);
    } catch {
      setImageNote("We could not read that photo. Try a different one.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const send = async () => {
    const e = validateDetails(details);
    setErrors(e);
    if (!topic || Object.keys(e).length || !consent) return;
    setFailure(undefined);
    setSending(true);
    try {
      const extra =
        topic === "solar" ? { property, keepOn, hours, existing } : topic === "order" ? { product, qty, needed } : {};
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ topic, extra, details, images: topic === "part" ? images : [], consent, website: honey }),
      });
      const out = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !out.ok) {
        setFailure(out.error ?? "Something went wrong.");
        return;
      }
      setDone(details.name.split(" ")[0]);
    } catch {
      setFailure("We could not reach the store's system. Check your connection.");
    } finally {
      setSending(false);
    }
  };

  if (done) {
    const via = details.reply === "whatsapp" ? "WhatsApp" : details.reply === "call" ? "a call" : "email";
    return (
      <div className={styles.done} role="status">
        <h2>Thanks, {done}.</h2>
        <p>We&apos;ll reply by {via} during shop hours.</p>
      </div>
    );
  }

  const err = (k: keyof Details) =>
    errors[k] && (
      <p id={`c-e-${k}`} className={styles.error} role="alert">
        {errors[k]}
      </p>
    );

  return (
    <form
      className={styles.form}
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        send();
      }}
    >
      <fieldset className={styles.topics}>
        <legend>What can we help with?</legend>
        {TOPICS.map((t) => (
          <label key={t.value} className={topic === t.value ? styles.on : undefined}>
            <input type="radio" name="topic" value={t.value} checked={topic === t.value} onChange={() => setTopic(t.value)} />
            {t.label}
          </label>
        ))}
      </fieldset>

      {topic === "solar" && (
        <div className={styles.extra}>
          <fieldset className={styles.chips}>
            <legend>Property</legend>
            {PROPERTY.map((p) => (
              <label key={p} className={property === p ? styles.on : undefined}>
                <input type="radio" name="property" checked={property === p} onChange={() => setProperty(p)} />
                {p}
              </label>
            ))}
          </fieldset>
          <fieldset className={styles.chips}>
            <legend>What needs to stay on?</legend>
            {KEEP_ON.map((k) => (
              <label key={k} className={keepOn.includes(k) ? styles.on : undefined}>
                <input type="checkbox" checked={keepOn.includes(k)} onChange={() => setKeepOn(toggle(keepOn, k))} />
                {k}
              </label>
            ))}
          </fieldset>
          <div className={styles.field}>
            <label htmlFor="c-hours">
              Roughly how many hours? <span className={styles.req}>Optional</span>
            </label>
            <input id="c-hours" inputMode="numeric" placeholder="e.g. 4" value={hours} onChange={(e) => setHours(e.target.value)} />
          </div>
          <fieldset className={styles.chips}>
            <legend>What do you have now?</legend>
            {EXISTING.map((x) => (
              <label key={x} className={existing === x ? styles.on : undefined}>
                <input type="radio" name="existing" checked={existing === x} onChange={() => setExisting(x)} />
                {x}
              </label>
            ))}
          </fieldset>
        </div>
      )}

      {topic === "order" && (
        <div className={styles.extra}>
          <div className={styles.field}>
            <label htmlFor="c-product">
              Product name or code <span className={styles.req}>Required</span>
            </label>
            <input id="c-product" value={product} onChange={(e) => setProduct(e.target.value)} maxLength={200} />
          </div>
          <div className={styles.row}>
            <div className={styles.field}>
              <label htmlFor="c-qty">Quantity</label>
              <input id="c-qty" type="number" min={1} max={999} value={qty} onChange={(e) => setQty(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label htmlFor="c-needed">
                When do you need it? <span className={styles.req}>Optional</span>
              </label>
              <input id="c-needed" placeholder="e.g. by Friday" value={needed} onChange={(e) => setNeeded(e.target.value)} maxLength={100} />
            </div>
          </div>
        </div>
      )}

      {topic === "part" && (
        <div className={styles.extra}>
          <p className={styles.legend}>Upload a photo of the part</p>
          <p className={styles.hint}>Up to {MAX_IMAGES} photos. A photo saves a trip.</p>
          <ul className={styles.thumbs}>
            {images.map((src, i) => (
              <li key={i}>
                <img src={src} alt={`Photo ${i + 1} of the part`} />
                <button type="button" onClick={() => setImages(images.filter((_, j) => j !== i))} aria-label={`Remove photo ${i + 1}`}>
                  <X size={16} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          {images.length < MAX_IMAGES && (
            <button type="button" className={styles.upload} onClick={() => fileRef.current?.click()}>
              <Camera size={20} aria-hidden="true" /> Add a photo
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" multiple className="visually-hidden" tabIndex={-1} onChange={(e) => addFiles(e.target.files)} aria-label="Choose photos of the part" />
          {imageNote && <p className={styles.hint}>{imageNote}</p>}
        </div>
      )}

      {topic && (
        <>
          <div className={styles.field}>
            <label htmlFor="c-message">
              Message <span className={styles.req}>Optional</span>
            </label>
            <textarea id="c-message" rows={4} maxLength={1000} value={details.message} onChange={(e) => set("message", e.target.value)} />
          </div>

          <div className={styles.field}>
            <label htmlFor="c-name">
              Your name <span className={styles.req}>Required</span>
            </label>
            <input id="c-name" autoComplete="name" value={details.name} onChange={(e) => set("name", e.target.value)} onBlur={() => blur("name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "c-e-name" : undefined} />
            {err("name")}
          </div>
          <div className={styles.field}>
            <label htmlFor="c-phone">
              Phone <span className={styles.req}>Required</span>
            </label>
            <input id="c-phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="e.g. 082 123 4567" value={details.phone} onChange={(e) => set("phone", formatPhone(e.target.value))} onBlur={() => blur("phone")} aria-invalid={Boolean(errors.phone)} aria-describedby={errors.phone ? "c-e-phone" : undefined} />
            {err("phone")}
          </div>
          <div className={styles.field}>
            <label htmlFor="c-email">
              Email <span className={styles.req}>Optional</span>
            </label>
            <input id="c-email" type="email" autoComplete="email" placeholder="e.g. name@example.com" value={details.email} onChange={(e) => set("email", e.target.value)} onBlur={() => blur("email")} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? "c-e-email" : undefined} />
            {err("email")}
          </div>
          <fieldset className={styles.chips}>
            <legend>How should we reply?</legend>
            {REPLY.map((r) => (
              <label key={r.value} className={details.reply === r.value ? styles.on : undefined}>
                <input
                  type="radio"
                  name="reply"
                  checked={details.reply === r.value}
                  onChange={() => {
                    set("reply", r.value);
                    setErrors((e) => ({ ...e, email: undefined }));
                  }}
                />
                {r.label}
              </label>
            ))}
          </fieldset>

          <div className={styles.honey} aria-hidden="true">
            <label>
              Website
              <input tabIndex={-1} autoComplete="off" value={honey} onChange={(e) => setHoney(e.target.value)} />
            </label>
          </div>

          <label className={styles.check}>
            <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
            <span>
              I agree that Empire Solar &amp; Hardware may use these details to reply to me. <Link href="/privacy">Privacy policy</Link>
            </span>
          </label>

          {failure && (
            <p className={styles.fail} role="alert">
              <strong>Your message was not sent.</strong> {failure} Everything you entered is still here. You can also call or WhatsApp us.
            </p>
          )}
          <button type="submit" className={styles.send} disabled={!consent || sending || (topic === "order" && !product.trim())} aria-busy={sending}>
            {sending ? "Sending..." : "Send"}
          </button>
        </>
      )}
    </form>
  );
}
