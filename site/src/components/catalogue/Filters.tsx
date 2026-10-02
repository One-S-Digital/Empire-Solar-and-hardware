"use client";

import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState, useTransition } from "react";
import { SlidersHorizontal, X } from "lucide-react";
import { FILTER_KEYS, toQuery, type Facet, type Filters, type ListState } from "@/lib/filters";
import styles from "./filters.module.css";

type Props = {
  facets: Facet[];
  basePath: string;
  state: ListState;
  resultCount: number;
};

/**
 * Filter panel. On a laptop it sits in the left rail and applies as you tick. On a phone it is a bottom sheet
 * behind a "Filters (2)" button, with focus held inside while it is open (Website Plan 7.4, section 10).
 * With JavaScript off, the ticks submit as a normal form and the page reloads with the same URL format.
 */
export function Filters({ facets, basePath, state, resultCount }: Props) {
  const router = useRouter();
  const panelId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();
  const [sel, setSel] = useState<Filters>(state.filters);
  const active = FILTER_KEYS.reduce((n, k) => n + sel[k].length, 0);

  // Follow the URL when it changes (back button, chip removed, "Clear all")
  const urlKey = JSON.stringify(state.filters);
  useEffect(() => setSel(state.filters), [urlKey, state.filters]);

  const close = () => {
    setOpen(false);
    openBtnRef.current?.focus();
  };

  useEffect(() => {
    if (!open) return;
    const first = panelRef.current?.querySelector<HTMLElement>("button, input:not(:disabled), a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") return close();
      if (e.key !== "Tab") return;
      const items = [...(panelRef.current?.querySelectorAll<HTMLElement>("button, input:not(:disabled), a") ?? [])];
      if (!items.length) return;
      const [head, tail] = [items[0], items[items.length - 1]];
      if (e.shiftKey && document.activeElement === head) {
        e.preventDefault();
        tail.focus();
      } else if (!e.shiftKey && document.activeElement === tail) {
        e.preventDefault();
        head.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  const toggle = (key: (typeof FILTER_KEYS)[number], value: string, on: boolean) => {
    const next: Filters = { ...sel, [key]: on ? [...sel[key], value] : sel[key].filter((v) => v !== value) };
    setSel(next);
    startTransition(() => router.push(basePath + toQuery(state, { filters: next, page: 1 }), { scroll: false }));
  };

  if (!facets.length && !active) return null;

  return (
    <div className={styles.wrap}>
      <button
        ref={openBtnRef}
        type="button"
        className={styles.openBtn}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(true)}
      >
        <SlidersHorizontal size={18} aria-hidden="true" /> Filters{active ? ` (${active})` : ""}
      </button>

      {open && <div className={styles.backdrop} onClick={close} aria-hidden="true" />}

      <div
        id={panelId}
        ref={panelRef}
        className={`${styles.panel} ${open ? styles.open : ""}`}
        role={open ? "dialog" : undefined}
        aria-modal={open || undefined}
        aria-label="Filters"
      >
        <div className={styles.head}>
          <h2>Filters</h2>
          <button type="button" className={styles.closeBtn} onClick={close} aria-label="Close filters">
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <form action={basePath} method="get">
          {facets.map((facet) => (
            <fieldset key={facet.key} className={styles.group}>
              <legend>{facet.title}</legend>
              {facet.options.map((o) => {
                const off = o.count === 0 && !o.checked;
                return (
                  <label key={o.value} className={`${styles.option} ${off ? styles.off : ""}`}>
                    <input
                      type="checkbox"
                      name={facet.key}
                      value={o.value}
                      checked={sel[facet.key].includes(o.value)}
                      disabled={off}
                      onChange={(e) => toggle(facet.key, o.value, e.target.checked)}
                    />
                    <span>{o.label}</span>
                    <span className={`${styles.count} mono`}>{o.count}</span>
                  </label>
                );
              })}
            </fieldset>
          ))}
          <noscript>
            <button type="submit" className={styles.apply}>
              Apply filters
            </button>
          </noscript>
        </form>

        {active > 0 && (
          <a className={styles.clear} href={basePath + toQuery(state, { filters: { brand: [], size: [], power: [], range: [] }, page: 1 })}>
            Clear all filters
          </a>
        )}
        <button type="button" className={styles.show} onClick={close}>
          Show {resultCount.toLocaleString("en-GB")} {resultCount === 1 ? "listing" : "listings"}
        </button>
      </div>
    </div>
  );
}
