import Link from "next/link";
import type { Category } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { categoryImage } from "@/lib/images";
import { DepartmentIcon } from "../site/DepartmentIcon";
import styles from "./catalogue.module.css";

/** A category tile on a department page: cover art (or icon), name, count, sub-categories as links. */
export function CategoryTile({ deptSlug, cat }: { deptSlug: string; cat: Category }) {
  const img = categoryImage(deptSlug, cat.slug);
  return (
    <article className={styles.catTile}>
      <div className={styles.catPhoto}>
        {img ? (
          <img
            srcSet={img.srcSet}
            sizes="(min-width: 900px) 25vw, 50vw"
            src={img.src}
            width={img.width}
            height={img.height}
            alt=""
            loading="lazy"
          />
        ) : (
          <DepartmentIcon dept={deptSlug} size={32} strokeWidth={1.25} />
        )}
      </div>
      <h2 className={styles.catName}>
        <Link href={`/catalogue/${deptSlug}/${cat.slug}`} className={styles.stretch}>
          {cat.name}
        </Link>
      </h2>
      <p className={`${styles.meta} mono`}>{formatCount(cat.rows)} products</p>
      {cat.subs && cat.subs.length > 0 && (
        <ul className={styles.catSubs}>
          {cat.subs.slice(0, 6).map((s) => (
            <li key={s.slug}>
              <Link href={`/catalogue/${deptSlug}/${cat.slug}/${s.slug}`}>{s.name}</Link>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
