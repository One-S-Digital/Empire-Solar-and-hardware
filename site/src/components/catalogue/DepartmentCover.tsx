import Link from "next/link";
import type { Department } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { imageSet } from "@/lib/images";
import { AisleSign } from "../AisleSign";
import styles from "./DepartmentCover.module.css";

/** A department as an image card: cover art, aisle sign, real count, three category links. */
export function DepartmentCover({ dept, size = "small" }: { dept: Department; size?: "large" | "small" }) {
  const img = imageSet(`cover-${dept.slug}`);
  const top = dept.categories.slice(0, 3); // first three in the plan's order
  return (
    <article className={`${styles.cover} on-ink ${size === "large" ? styles.large : ""}`}>
      <div className={styles.photo} aria-hidden="true">
        <img
          srcSet={img.srcSet}
          sizes={size === "large" ? "(min-width: 900px) 50vw, 100vw" : "(min-width: 900px) 33vw, 50vw"}
          src={img.src}
          width={img.width}
          height={img.height}
          alt=""
          loading="lazy"
        />
      </div>
      <div className={styles.body}>
        <Link href={`/catalogue/${dept.slug}`} className={`${styles.sign} ${styles.stretch}`}>
          <AisleSign size="sm">{dept.name}</AisleSign>
        </Link>
        <p className={styles.count}>{formatCount(dept.rows)} products</p>
        <ul className={styles.cats}>
          {top.map((c) => (
            <li key={c.slug}>
              <Link href={`/catalogue/${dept.slug}/${c.slug}`}>{c.name}</Link>
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
