"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import type { Variant } from "@/lib/catalogue";
import { variantAnchor } from "@/lib/catalogue-display";
import styles from "./product.module.css";

function packText(v: Variant): string {
  if (v.prePacked) return "Packed in a branded bag";
  if (v.packQty && v.packQty > 1) return `Pack of ${v.packQty}`;
  return "";
}

/**
 * Every size, pack and code of a family, as visible text. Long tables get a box to narrow them down, and a code in
 * the URL (?code=RCSB18540) highlights its row, so a search for a code lands on the right size.
 *
 * The page itself is pre-built and cached, so it cannot read the URL on the server. The table is in the static HTML
 * (so every code is crawlable), and the browser then reads ?code= and highlights the row.
 */
export function VariantTable({ variants }: { variants: Variant[] }) {
  return (
    <Suspense fallback={<Table variants={variants} />}>
      <TableWithSelection variants={variants} />
    </Suspense>
  );
}

function TableWithSelection({ variants }: { variants: Variant[] }) {
  return <Table variants={variants} selected={useSearchParams().get("code") ?? undefined} />;
}

function Table({ variants, selected }: { variants: Variant[]; selected?: string }) {
  const [find, setFind] = useState("");
  const hasCodes = variants.some((v) => v.code);
  const hasLabels = variants.some((v) => v.label);
  const hasPacks = variants.some((v) => packText(v));
  const hasDetails = variants.some((v) => v.details);
  const words = find.toLowerCase().split(/\s+/).filter(Boolean);
  const shown = words.length
    ? variants.filter((v) => words.every((w) => `${v.label ?? ""} ${v.code ?? ""} ${v.supplierCode ?? ""} ${packText(v)}`.toLowerCase().includes(w)))
    : variants;
  const want = selected?.toLowerCase();

  return (
    <div>
      {variants.length > 12 && (
        <div className={styles.find}>
          <label htmlFor="find-variant">Find a size or code</label>
          <input id="find-variant" type="search" value={find} onChange={(e) => setFind(e.target.value)} placeholder="e.g. 15mm" autoComplete="off" />
          <p className="visually-hidden" aria-live="polite">
            {shown.length} of {variants.length} shown
          </p>
        </div>
      )}
      <div className={styles.tableWrap}>
        <table className={styles.variants}>
          <caption className="visually-hidden">Sizes, packs and codes</caption>
          <thead>
            <tr>
              {hasLabels && <th scope="col">Option</th>}
              {hasCodes && <th scope="col">Code</th>}
              {hasPacks && <th scope="col">Pack</th>}
              {hasDetails && <th scope="col">Details</th>}
            </tr>
          </thead>
          <tbody>
            {shown.map((v, i) => {
              const isSelected = Boolean(want && [v.code, v.supplierCode].some((c) => c?.toLowerCase() === want));
              return (
                <tr key={v.code ?? i} id={v.code ? variantAnchor(v.code) : undefined} className={isSelected ? styles.selected : undefined} aria-current={isSelected || undefined}>
                  {hasLabels && <td>{v.label ?? ""}</td>}
                  {hasCodes && <td className="mono">{v.code ?? ""}</td>}
                  {hasPacks && <td>{packText(v)}</td>}
                  {hasDetails && <td>{v.details ?? ""}</td>}
                </tr>
              );
            })}
            {shown.length === 0 && (
              <tr>
                <td colSpan={4}>Nothing matches &ldquo;{find}&rdquo;. Ask at the counter and we&apos;ll check.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
