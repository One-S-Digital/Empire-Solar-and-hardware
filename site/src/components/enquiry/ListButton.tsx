"use client";

import { ClipboardList } from "lucide-react";
import { setDrawer, useListCount } from "@/lib/enquiry";
import styles from "./enquiry.module.css";

/** Header button that opens the list drawer, with the item count. */
export function ListButton({ className = "" }: { className?: string }) {
  const count = useListCount();
  return (
    <button
      type="button"
      className={`${styles.listButton} ${className}`.trim()}
      onClick={() => setDrawer(true)}
      aria-haspopup="dialog"
    >
      <ClipboardList size={22} aria-hidden="true" />
      <span className={styles.listLabel}>List</span>
      {count > 0 && (
        <span className={styles.badge} key={count}>
          {count}
          <span className="visually-hidden"> items on your list</span>
        </span>
      )}
    </button>
  );
}
