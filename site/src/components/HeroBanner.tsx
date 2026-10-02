import type { ReactNode } from "react";
import { imageSet } from "@/lib/images";
import styles from "./HeroBanner.module.css";

type HeroBannerProps = {
  eyebrow: string;
  title: string;
  line: string;
  /** Search, chips and actions */
  children: ReactNode;
};

/** Full-bleed banner with the text on the dark side. The picture is decoration: the text carries the meaning. */
export function HeroBanner({ eyebrow, title, line, children }: HeroBannerProps) {
  const img = imageSet("hero-banner");
  return (
    <section className={`${styles.hero} on-ink`} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        <img
          srcSet={img.srcSet}
          sizes="100vw"
          src={img.src}
          width={img.width}
          height={img.height}
          alt=""
          fetchPriority="high"
        />
        <div className={styles.scrim} />
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={styles.text}>
          <p className={styles.eyebrow}>{eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            {title}
          </h1>
          <p className={styles.line}>{line}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
