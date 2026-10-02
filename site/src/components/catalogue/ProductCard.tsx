import Link from "next/link";
import type { Family } from "@/lib/catalogue";
import { displayName, variantAnchor } from "@/lib/catalogue-display";
import { AddToList } from "../enquiry/AddToList";
import { ProductTile } from "./ProductTile";
import styles from "./catalogue.module.css";

/** `code`: a size to jump to on the product page, when the search was for that code. */
export function ProductCard({
  family,
  code: wantCode,
}: {
  family: Family;
  code?: string;
}) {
  const count = Math.max(
    family.variants.length,
    ...family.variants.map((v) => v.statedVariants ?? 0),
  );
  const code = family.variants[0]?.code;
  return (
    <article className={styles.card}>
      <ProductTile family={family} />
      <p className={styles.brand}>{family.brand}</p>
      <h3 className={styles.cardName}>
        <Link
          href={
            wantCode
              ? `/p/${family.slug}?code=${encodeURIComponent(wantCode)}#${variantAnchor(wantCode)}`
              : `/p/${family.slug}`
          }
          className={styles.stretch}
        >
          {displayName(family.name)}
        </Link>
      </h3>
      {count > 1 ? (
        <p className={`${styles.meta} mono`}>{count} sizes or packs</p>
      ) : code ? (
        <p className={`${styles.meta} mono`}>{code}</p>
      ) : null}
      <div className={styles.cardAdd}>
        {count > 1 ? (
          <Link href={`/p/${family.slug}`} className={styles.chooseLink}>
            Choose a size
          </Link>
        ) : (
          <AddToList
            item={{
              key: code ?? family.slug,
              name: displayName(family.name),
              brand: family.brand,
              code,
              slug: family.slug,
            }}
            compact
          />
        )}
      </div>
    </article>
  );
}
