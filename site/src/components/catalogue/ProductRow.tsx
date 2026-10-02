import Link from "next/link";
import type { Family } from "@/lib/catalogue";
import { displayName } from "@/lib/catalogue-display";
import { AddToList } from "../enquiry/AddToList";
import { ProductTile } from "./ProductTile";
import styles from "./catalogue.module.css";

/** List view: one compact row per listing, for trade customers scanning by code. */
export function ProductRow({ family }: { family: Family }) {
  const codes = family.variants
    .map((v) => v.code)
    .filter((c): c is string => Boolean(c));
  const count = Math.max(
    family.variants.length,
    ...family.variants.map((v) => v.statedVariants ?? 0),
  );
  return (
    <article className={styles.row}>
      <div className={styles.rowThumb}>
        <ProductTile family={family} />
      </div>
      <div className={styles.rowMain}>
        <p className={styles.brand}>{family.brand}</p>
        <h3 className={styles.rowName}>
          <Link href={`/p/${family.slug}`} className={styles.stretch}>
            {displayName(family.name)}
          </Link>
        </h3>
      </div>
      <p className={`${styles.rowCodes} mono`}>
        {codes.slice(0, 3).join("  ")}
        {codes.length > 3 ? `  +${codes.length - 3}` : ""}
      </p>
      <p className={styles.rowCount}>
        {count > 1 ? `${count} sizes or packs` : ""}
      </p>
      <div className={styles.rowAdd}>
        {count > 1 ? (
          <Link href={`/p/${family.slug}`} className={styles.chooseLink}>
            Choose a size
          </Link>
        ) : (
          <AddToList
            item={{
              key: codes[0] ?? family.slug,
              name: displayName(family.name),
              brand: family.brand,
              code: codes[0],
              slug: family.slug,
            }}
            compact
          />
        )}
      </div>
    </article>
  );
}
