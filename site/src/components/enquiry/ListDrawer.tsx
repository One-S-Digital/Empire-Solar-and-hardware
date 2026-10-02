"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { useEffect, useRef } from "react";
import { setDrawer, useDrawerOpen, useList, useListCount } from "@/lib/enquiry";
import { Docket } from "../Docket";
import { CustomItemForm } from "./CustomItemForm";
import { ListLines } from "./ListLines";
import styles from "./enquiry.module.css";

const CHIPS = [
  { href: "/catalogue/solar-backup-power", label: "Solar" },
  { href: "/catalogue/power-tools", label: "Power tools" },
  { href: "/catalogue/plumbing", label: "Plumbing" },
  { href: "/catalogue/electrical", label: "Electrical" },
];

/** The enquiry list as a counter docket: right-hand drawer on desktop, full-height sheet on phones. */
export function ListDrawer() {
  const open = useDrawerOpen();
  const list = useList();
  const count = useListCount();
  const ref = useRef<HTMLDialogElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(() => setDrawer(false), [pathname]);

  return (
    <dialog
      ref={ref}
      className={styles.drawer}
      aria-labelledby="list-title"
      onClose={() => setDrawer(false)}
      onClick={(e) => e.target === ref.current && setDrawer(false)}
    >
      <div className={styles.drawerInner}>
        <div className={styles.drawerHead}>
          <h2 id="list-title">Your list</h2>
          <button
            type="button"
            className={styles.iconBtn}
            onClick={() => setDrawer(false)}
            aria-label="Close your list"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className={styles.drawerBody}>
          {list.length === 0 ? (
            <Docket>
              <p className={styles.emptyTitle}>Your list is empty.</p>
              <p>Search or browse, then tap Add to list.</p>
              <ul className={styles.chips}>
                {CHIPS.map((c) => (
                  <li key={c.href}>
                    <Link href={c.href}>{c.label}</Link>
                  </li>
                ))}
              </ul>
              <Link href="/search" className={styles.textLink}>
                Search the catalogue
              </Link>
            </Docket>
          ) : (
            <Docket>
              <ListLines list={list} />
            </Docket>
          )}
          <CustomItemForm />
        </div>
        <div className={styles.drawerFoot}>
          <p className="mono">
            {count} {count === 1 ? "item" : "items"}
          </p>
          <div className={styles.footActions}>
            <button
              type="button"
              className={styles.keep}
              onClick={() => setDrawer(false)}
            >
              Keep browsing
            </button>
            {list.length > 0 ? (
              <Link href="/enquiry" className={styles.send}>
                Send enquiry
              </Link>
            ) : (
              <span
                className={`${styles.send} ${styles.sendOff}`}
                aria-disabled="true"
              >
                Send enquiry
              </span>
            )}
          </div>
        </div>
      </div>
    </dialog>
  );
}
