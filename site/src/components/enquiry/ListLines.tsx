"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { removeItem, restoreItem, setNote, setQty, type ListItem } from "@/lib/enquiry";
import styles from "./enquiry.module.css";

type Undo = { item: ListItem; index: number };

/** Editable lines of the list, shared by the drawer and the /enquiry page. Remove offers a 5 second Undo. */
export function ListLines({ list }: { list: ListItem[] }) {
  const [undo, setUndo] = useState<Undo>();
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout>>();
  const [noteOpen, setNoteOpen] = useState<string>();

  const remove = (key: string) => {
    const gone = removeItem(key);
    if (!gone) return;
    clearTimeout(timer);
    setUndo(gone);
    setTimer(setTimeout(() => setUndo(undefined), 5000));
  };

  return (
    <>
      <ul className={styles.lines}>
        {list.map((i) => (
          <li key={i.key} className={styles.line}>
            <div className={styles.lineMain}>
              <p className={styles.lineName}>
                {i.brand && <span className={styles.lineBrand}>{i.brand} </span>}
                {i.name}
                {i.label ? ` ${i.label}` : ""}
              </p>
              {i.code && <p className="mono">{i.code}</p>}
              {i.custom && <p className={styles.customTag}>Not in the catalogue</p>}
              {i.note && noteOpen !== i.key && <p className={styles.noteText}>Note: {i.note}</p>}
              {noteOpen === i.key ? (
                <label className={styles.noteEdit}>
                  <span className="visually-hidden">Note for {i.name}</span>
                  <input
                    type="text"
                    defaultValue={i.note ?? ""}
                    maxLength={300}
                    placeholder="e.g. black, left-hand"
                    autoFocus
                    onBlur={(e) => {
                      setNote(i.key, e.target.value.trim());
                      setNoteOpen(undefined);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && e.currentTarget.blur()}
                  />
                </label>
              ) : (
                <button type="button" className={styles.textBtn} onClick={() => setNoteOpen(i.key)}>
                  {i.note ? "Edit note" : "Add a note"}
                </button>
              )}
            </div>
            <div className={styles.lineSide}>
              <span className={styles.stepper} role="group" aria-label={`Quantity of ${i.name}`}>
                <button type="button" onClick={() => setQty(i.key, i.qty - 1)} disabled={i.qty <= 1} aria-label="One fewer">
                  <Minus size={16} aria-hidden="true" />
                </button>
                <output>{i.qty}</output>
                <button type="button" onClick={() => setQty(i.key, i.qty + 1)} aria-label="One more">
                  <Plus size={16} aria-hidden="true" />
                </button>
              </span>
              <button type="button" className={styles.iconBtn} onClick={() => remove(i.key)} aria-label={`Remove ${i.name}`}>
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </div>
          </li>
        ))}
      </ul>
      {undo && (
        <p className={styles.toast} role="status">
          <span>Removed {undo.item.name}.</span>
          <button
            type="button"
            className={styles.textBtn}
            onClick={() => {
              restoreItem(undo.item, undo.index);
              clearTimeout(timer);
              setUndo(undefined);
            }}
          >
            Undo
          </button>
        </p>
      )}
    </>
  );
}
