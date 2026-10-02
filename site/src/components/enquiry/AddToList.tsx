"use client";

import { Minus, Plus } from "lucide-react";
import { addItem, setQty, removeItem, useList, type ListItem } from "@/lib/enquiry";
import styles from "./enquiry.module.css";

/** "Add to list", which becomes a quantity stepper once the item is on the list. */
export function AddToList({ item, compact = false }: { item: Omit<ListItem, "qty">; compact?: boolean }) {
  const line = useList().find((i) => i.key === item.key);
  const what = [item.name, item.label].filter(Boolean).join(" ");
  if (!line) {
    return (
      <button type="button" className={`${styles.add} ${compact ? styles.addCompact : ""}`} onClick={() => addItem(item)} aria-label={`Add ${what} to list`}>
        <Plus size={16} aria-hidden="true" />
        <span>Add to list</span>
      </button>
    );
  }
  return (
    <span className={styles.stepper} role="group" aria-label={`Quantity of ${what}`}>
      <button type="button" onClick={() => (line.qty > 1 ? setQty(item.key, line.qty - 1) : removeItem(item.key))} aria-label={line.qty > 1 ? "One fewer" : "Remove from list"}>
        <Minus size={16} aria-hidden="true" />
      </button>
      <output aria-live="polite">{line.qty}</output>
      <button type="button" onClick={() => setQty(item.key, line.qty + 1)} aria-label="One more">
        <Plus size={16} aria-hidden="true" />
      </button>
    </span>
  );
}
