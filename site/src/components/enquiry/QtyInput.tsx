"use client";

import { Minus, Plus } from "lucide-react";
import { useEffect, useId, useState } from "react";
import styles from "./enquiry.module.css";

export const MIN_QTY = 1;
export const MAX_QTY = 999;

export const clampQty = (n: number) =>
  Math.min(MAX_QTY, Math.max(MIN_QTY, Math.round(n) || MIN_QTY));

/**
 * Minus, a quantity you can type, and plus. The typed text is only turned into a number when the field is left or
 * Enter is pressed, so someone can clear it and type "12" without it jumping back to 1 on the way.
 */
export function QtyInput({
  value,
  onChange,
  label,
  compact = false,
}: {
  value: number;
  onChange: (n: number) => void;
  label: string;
  compact?: boolean;
}) {
  const id = useId();
  const [text, setText] = useState(String(value));
  useEffect(() => setText(String(value)), [value]);

  const commit = (raw: string) => {
    const n = clampQty(Number(raw));
    setText(String(n));
    if (n !== value) onChange(n);
  };

  return (
    <span
      className={`${styles.qty} ${compact ? styles.qtyCompact : ""}`}
      role="group"
      aria-label={label}
    >
      <button
        type="button"
        onClick={() => commit(String(value - 1))}
        disabled={value <= MIN_QTY}
        aria-label="One fewer"
      >
        <Minus size={16} aria-hidden="true" />
      </button>
      <input
        id={id}
        name="qty"
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={text}
        aria-label={`${label}, quantity`}
        onChange={(e) => setText(e.target.value.replace(/\D/g, "").slice(0, 3))}
        onBlur={(e) => commit(e.target.value)}
        onFocus={(e) => e.target.select()}
        onKeyDown={(e) => {
          if (e.key === "Enter") commit(e.currentTarget.value);
        }}
      />
      <button
        type="button"
        onClick={() => commit(String(value + 1))}
        disabled={value >= MAX_QTY}
        aria-label="One more"
      >
        <Plus size={16} aria-hidden="true" />
      </button>
    </span>
  );
}
