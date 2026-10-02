import type { ReactNode } from "react";
import styles from "./SectionHeading.module.css";

type SectionHeadingProps = {
  children: ReactNode;
  /** Small red label above the heading */
  eyebrow?: string;
  /** One supporting line below the heading */
  line?: ReactNode;
  /** Heading level: h1 for a page opener, h2 for a section */
  as?: "h1" | "h2";
  /** Hero and section-opener size (Overhaul Plan, section 4) */
  display?: boolean;
  /** On an ink band: light text, brighter red for the eyebrow */
  tone?: "light" | "dark";
  id?: string;
};

/** Eyebrow, display heading with the logo's red bar underneath, and one line of support. */
export function SectionHeading({
  children,
  eyebrow,
  line,
  as: Tag = "h2",
  display = false,
  tone = "light",
  id,
}: SectionHeadingProps) {
  return (
    <div className={[styles.wrap, tone === "dark" ? styles.dark : ""].join(" ").trim()}>
      {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
      <Tag id={id} className={[styles.heading, display ? styles.display : ""].join(" ").trim()}>
        {children}
      </Tag>
      {line ? <p className={styles.line}>{line}</p> : null}
    </div>
  );
}
