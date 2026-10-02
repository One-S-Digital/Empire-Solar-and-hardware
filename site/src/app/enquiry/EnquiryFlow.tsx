"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CustomItemForm } from "@/components/enquiry/CustomItemForm";
import { ListLines } from "@/components/enquiry/ListLines";
import { Docket } from "@/components/Docket";
import { clearList, listAsText, useList } from "@/lib/enquiry";
import {
  emptyDetails,
  formatPhone,
  validateDetails,
  validateField,
  type Details,
  type Errors,
  type Reply,
} from "@/lib/enquiry-validate";
import { store } from "@/lib/store";
import styles from "./enquiry.module.css";

const DETAILS_KEY = "empire_enquiry_details_v1";
const STEPS = ["Your list", "Your details", "Review & send"];
const REPLY: { value: Reply; label: string }[] = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "call", label: "Call" },
  { value: "email", label: "Email" },
];

type Sent = { docket: string; text: string; name: string };

export function EnquiryFlow() {
  const list = useList();
  const [step, setStep] = useState(1);
  const [details, setDetails] = useState<Details>(emptyDetails);
  const [errors, setErrors] = useState<Errors>({});
  const [consent, setConsent] = useState(false);
  const [honey, setHoney] = useState("");
  const [sending, setSending] = useState(false);
  const [failure, setFailure] = useState<string>();
  const [sent, setSent] = useState<Sent>();
  const heading = useRef<HTMLHeadingElement>(null);
  const restored = useRef(false);

  // Details survive leaving and coming back; cleared after a successful send
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(DETAILS_KEY);
      if (raw) setDetails({ ...emptyDetails, ...JSON.parse(raw) });
    } catch {
      /* nothing saved */
    }
    restored.current = true;
  }, []);
  useEffect(() => {
    if (!restored.current || sent) return;
    try {
      window.localStorage.setItem(DETAILS_KEY, JSON.stringify(details));
    } catch {
      /* the form still works */
    }
  }, [details, sent]);
  useEffect(() => heading.current?.focus(), [step, sent]);

  const set = <K extends keyof Details>(k: K, v: Details[K]) =>
    setDetails((d) => ({ ...d, [k]: v }));
  const blur = (k: keyof Details) =>
    setErrors((e) => ({ ...e, [k]: validateField(k, details) }));

  const next = () => {
    if (step === 2) {
      const e = validateDetails(details);
      setErrors(e);
      if (Object.keys(e).length) return;
    }
    setStep((s) => Math.min(3, s + 1));
  };

  const send = async () => {
    setFailure(undefined);
    setSending(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ items: list, details, consent, website: honey }),
      });
      const out = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        docket?: string;
        error?: string;
      };
      if (!res.ok || !out.ok) {
        setFailure(out.error ?? "Something went wrong.");
        return;
      }
      setSent({
        docket: out.docket ?? "",
        text: listAsText(list),
        name: details.name,
      });
      clearList();
      try {
        window.localStorage.removeItem(DETAILS_KEY);
      } catch {
        /* ignore */
      }
    } catch {
      setFailure(
        "We could not reach the store's system. Check your connection.",
      );
    } finally {
      setSending(false);
    }
  };

  const waText = (text: string, name: string) =>
    `Hi Empire Solar & Hardware, it's ${name}. Please can you check these:\n${text}`;
  const waHref = (text: string, name: string) =>
    store.whatsapp
      ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent(waText(text, name))}`
      : undefined;

  if (sent) {
    const wa = waHref(sent.text, sent.name);
    return (
      <section className={styles.wrap} aria-labelledby="sent-title">
        <Docket number={sent.docket || undefined} className={styles.receipt}>
          <span className={styles.stamp} aria-hidden="true">
            Received
          </span>
          <h1 id="sent-title" ref={heading} tabIndex={-1}>
            Thank you, {sent.name.split(" ")[0]}.
          </h1>
          <p>
            We have your list. We&apos;ll confirm stock, price and timing and
            get back to you.
          </p>
          <pre className={`${styles.pre} mono`}>{sent.text}</pre>
          <div className={styles.actions}>
            {wa && (
              <a
                className={styles.secondary}
                href={wa}
                target="_blank"
                rel="noopener noreferrer"
              >
                Send a copy on WhatsApp
              </a>
            )}
            <Link
              className={styles.primary}
              href="/catalogue"
              onClick={() => setSent(undefined)}
            >
              Start a new list
            </Link>
          </div>
        </Docket>
      </section>
    );
  }

  if (list.length === 0) {
    return (
      <section className={styles.wrap}>
        <h1 ref={heading} tabIndex={-1}>
          Your list is empty
        </h1>
        <p>
          Search or browse, then tap Add to list. Or tell us what you need here.
        </p>
        <CustomItemForm />
        <p>
          <Link href="/catalogue" className={styles.link}>
            Browse the catalogue
          </Link>
        </p>
      </section>
    );
  }

  const fail = (k: keyof Details) => errors[k];
  const field = (
    k: keyof Details,
    label: string,
    hint: string,
    input: React.ReactNode,
  ) => (
    <div className={styles.field}>
      <label htmlFor={`f-${k}`}>
        {label} <span className={styles.req}>{hint}</span>
      </label>
      {input}
      {fail(k) && (
        <p id={`e-${k}`} className={styles.error} role="alert">
          {fail(k)}
        </p>
      )}
    </div>
  );

  return (
    <section className={styles.wrap} aria-labelledby="enq-title">
      <ol className={styles.steps} aria-label="Progress">
        {STEPS.map((s, i) => (
          <li
            key={s}
            aria-current={step === i + 1 ? "step" : undefined}
            className={step > i + 1 ? styles.done : undefined}
          >
            <span>{i + 1}</span> {s}
          </li>
        ))}
      </ol>
      <h1 id="enq-title" ref={heading} tabIndex={-1}>
        {STEPS[step - 1]}
      </h1>

      {step === 1 && (
        <>
          <Docket>
            <ListLines list={list} />
          </Docket>
          <CustomItemForm />
        </>
      )}

      {step === 2 && (
        <form
          className={styles.form}
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            next();
          }}
        >
          {field(
            "name",
            "Your name",
            "Required",
            <input
              id="f-name"
              autoComplete="name"
              value={details.name}
              onChange={(e) => set("name", e.target.value)}
              onBlur={() => blur("name")}
              aria-invalid={Boolean(fail("name"))}
              aria-describedby={fail("name") ? "e-name" : undefined}
            />,
          )}
          {field(
            "phone",
            "Phone",
            "Required",
            <input
              id="f-phone"
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="e.g. 082 123 4567"
              value={details.phone}
              onChange={(e) => set("phone", formatPhone(e.target.value))}
              onBlur={() => blur("phone")}
              aria-invalid={Boolean(fail("phone"))}
              aria-describedby={fail("phone") ? "e-phone" : undefined}
            />,
          )}
          {field(
            "email",
            "Email",
            "Optional",
            <input
              id="f-email"
              type="email"
              autoComplete="email"
              placeholder="e.g. name@example.com"
              value={details.email}
              onChange={(e) => set("email", e.target.value)}
              onBlur={() => blur("email")}
              aria-invalid={Boolean(fail("email"))}
              aria-describedby={fail("email") ? "e-email" : undefined}
            />,
          )}
          <fieldset className={styles.chips}>
            <legend>How should we reply?</legend>
            {REPLY.map((r) => (
              <label
                key={r.value}
                className={
                  details.reply === r.value ? styles.chipOn : undefined
                }
              >
                <input
                  type="radio"
                  name="reply"
                  value={r.value}
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
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={details.orderIn}
              onChange={(e) => set("orderIn", e.target.checked)}
            />
            If it&apos;s not in store, order it in for me
          </label>
          {field(
            "message",
            "Message",
            "Optional",
            <textarea
              id="f-message"
              rows={3}
              maxLength={1000}
              value={details.message}
              onChange={(e) => set("message", e.target.value)}
            />,
          )}
          {/* Honeypot: hidden from people, tempting to bots */}
          <div className={styles.honey} aria-hidden="true">
            <label>
              Website
              <input
                tabIndex={-1}
                autoComplete="off"
                value={honey}
                onChange={(e) => setHoney(e.target.value)}
              />
            </label>
          </div>
        </form>
      )}

      {step === 3 && (
        <>
          <Docket>
            <ul className={styles.summary}>
              {list.map((i) => (
                <li key={i.key}>
                  <span>
                    {i.qty} x{" "}
                    {[i.brand, i.name, i.label].filter(Boolean).join(" ")}
                    {i.note ? ` (${i.note})` : ""}
                  </span>
                  {i.code && <span className="mono">{i.code}</span>}
                </li>
              ))}
            </ul>
            <dl className={styles.who}>
              <dt>Name</dt>
              <dd>{details.name}</dd>
              <dt>Phone</dt>
              <dd>{details.phone}</dd>
              {details.email && (
                <>
                  <dt>Email</dt>
                  <dd>{details.email}</dd>
                </>
              )}
              <dt>Reply by</dt>
              <dd>{REPLY.find((r) => r.value === details.reply)?.label}</dd>
              <dt>Not in store</dt>
              <dd>
                {details.orderIn ? "Order it in" : "Don't order, just tell me"}
              </dd>
              {details.message && (
                <>
                  <dt>Message</dt>
                  <dd>{details.message}</dd>
                </>
              )}
            </dl>
          </Docket>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
            />
            <span>
              I agree that Empire Solar &amp; Hardware may use these details to
              reply to this enquiry, and keep a record of it.
            </span>
          </label>
          {failure && (
            <div className={styles.fail} role="alert">
              <p>
                <strong>Your list was not sent.</strong> {failure} Everything
                you entered is still here.
              </p>
              {waHref(listAsText(list), details.name) && (
                <a
                  className={styles.secondary}
                  href={waHref(listAsText(list), details.name)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Send it on WhatsApp instead
                </a>
              )}
            </div>
          )}
        </>
      )}

      <div className={styles.actions}>
        {step > 1 ? (
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setStep(step - 1)}
            disabled={sending}
          >
            Back
          </button>
        ) : (
          <Link href="/catalogue" className={styles.secondary}>
            Keep browsing
          </Link>
        )}
        {step < 3 ? (
          <button type="button" className={styles.primary} onClick={next}>
            Next
          </button>
        ) : (
          <button
            type="button"
            className={styles.primary}
            onClick={send}
            disabled={!consent || sending}
            aria-busy={sending}
          >
            {sending ? "Sending..." : "Send enquiry"}
          </button>
        )}
      </div>
    </section>
  );
}
