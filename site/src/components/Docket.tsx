import type { ReactNode } from "react";
import styles from "./Docket.module.css";

type DocketProps = {
  /** Docket number, for example ESH-0142. Omit for a plain notice docket. */
  number?: string;
  date?: string;
  children: ReactNode;
  className?: string;
};

/** The slip you get at a trade counter: paper, perforated top edge, mono codes. */
export function Docket({ number, date, children, className }: DocketProps) {
  return (
    <div className={[styles.docket, className ?? ""].join(" ").trim()}>
      {(number || date) && (
        <div className={styles.head}>
          {number && <span className="mono">{number}</span>}
          {date && <span className="mono">{date}</span>}
        </div>
      )}
      {children}
    </div>
  );
}
