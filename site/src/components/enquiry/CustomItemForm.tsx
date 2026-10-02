"use client";

import { useState } from "react";
import { addCustom } from "@/lib/enquiry";
import styles from "./enquiry.module.css";

/** The catalogue will never be complete: a free-text line for anything that is not listed. */
export function CustomItemForm() {
  const [text, setText] = useState("");
  const [qty, setQty] = useState(1);
  return (
    <form
      className={styles.custom}
      onSubmit={(e) => {
        e.preventDefault();
        if (!text.trim()) return;
        addCustom(text, qty);
        setText("");
        setQty(1);
      }}
    >
      <label htmlFor="custom-item" className={styles.customLabel}>
        Can&apos;t find it? Add it yourself
      </label>
      <div className={styles.customRow}>
        <input id="custom-item" type="text" value={text} maxLength={200} onChange={(e) => setText(e.target.value)} placeholder="What do you need? e.g. 3m garden hose" />
        <label className="visually-hidden" htmlFor="custom-qty">
          Quantity
        </label>
        <input id="custom-qty" type="number" min={1} max={999} value={qty} onChange={(e) => setQty(Number(e.target.value))} className={styles.qtyInput} />
        <button type="submit" disabled={!text.trim()}>
          Add
        </button>
      </div>
    </form>
  );
}
