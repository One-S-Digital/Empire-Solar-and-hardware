"use client";

import { Check, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { addItem, useList, type ListItem } from "@/lib/enquiry";
import { clampQty, QtyInput } from "./QtyInput";
import styles from "./enquiry.module.css";

/** Quantity (minus, typed number, plus) and an Add to list button, like any shop. Adding again adds to the line already on the list. */
export function AddToList({
  item,
  compact = false,
}: {
  item: Omit<ListItem, "qty">;
  compact?: boolean;
}) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [resetKey, setResetKey] = useState(0); // remounts the quantity box so it shows 1 again
  const inList = useList().find((i) => i.key === item.key)?.qty;
  const what = [item.name, item.label].filter(Boolean).join(" ");

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 1800);
    return () => clearTimeout(t);
  }, [added]);

  return (
    <form
      className={`${styles.addForm} ${compact ? styles.addFormCompact : ""}`}
      onSubmit={(e) => {
        e.preventDefault();
        // Read what is typed right now: Enter submits in the same moment the box commits, so state may be one step behind
        const typed = clampQty(Number((e.currentTarget.elements.namedItem("qty") as HTMLInputElement).value));
        addItem(item, typed);
        setQty(1);
        setResetKey((k) => k + 1);
        setAdded(true);
      }}
    >
      <QtyInput key={resetKey} value={qty} onChange={setQty} label={what} compact={compact} />
      <button
        type="submit"
        className={`${styles.add} ${compact ? styles.addCompact : ""}`}
        aria-label={`Add ${qty} of ${what} to list`}
      >
        {added ? (
          <Check size={16} aria-hidden="true" />
        ) : (
          <Plus size={16} aria-hidden="true" />
        )}
        <span>{added ? "Added" : "Add to list"}</span>
      </button>
      <span className={styles.inList} aria-live="polite">
        {added
          ? `Added. ${inList ?? qty} on your list.`
          : inList
            ? `${inList} on your list`
            : ""}
      </span>
    </form>
  );
}
