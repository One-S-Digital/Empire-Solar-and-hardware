import type { ElementType, ReactNode } from "react";
import styles from "./AisleSign.module.css";

type AisleSignProps = {
  children: ReactNode;
  /** Heading element: the page title is an h1, a mega menu sign is not a heading */
  as?: ElementType;
  size?: "lg" | "sm";
  /** One small swing on load (department page header only) */
  swing?: boolean;
};

/** Red plate, white condensed text, two hanger rods. Wayfinding for the store, online. */
export function AisleSign({ children, as: Tag = "p", size = "lg", swing = false }: AisleSignProps) {
  return (
    <div className={[styles.sign, styles[size], swing ? styles.swing : ""].join(" ").trim()}>
      <span className={styles.rod} aria-hidden="true" />
      <span className={styles.rod} aria-hidden="true" />
      <Tag className={styles.plate}>{children}</Tag>
    </div>
  );
}
