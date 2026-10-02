import type { Family } from "@/lib/catalogue";
import { displayName } from "@/lib/catalogue-display";
import { imageSet } from "@/lib/images";
import styles from "./catalogue.module.css";

/**
 * The picture slot on a product card or page: the supplier photo at its real size on a paper tile,
 * or a designed fallback (department cover art at low opacity on ink, brand name set large). Never a broken image or grey box.
 */
export function ProductTile({
  family,
  eager = false,
}: {
  family: Family;
  eager?: boolean;
}) {
  if (family.image && family.imageSize) {
    const [w, h] = family.imageSize;
    return (
      <div className={styles.tile}>
        {/* Small photos are never enlarged: width and height are the file's own size */}
        <img
          src={family.image}
          width={w}
          height={h}
          alt={`${family.brand} ${displayName(family.name)}`}
          loading={eager ? "eager" : "lazy"}
          decoding="async"
          className={styles.photo}
        />
      </div>
    );
  }
  const art = imageSet(`cover-${family.dept}`);
  return (
    <div
      className={`${styles.tile} ${styles.fallback}`}
      role="img"
      aria-label={`${family.brand} ${displayName(family.name)}, photo to come`}
    >
      <img
        src={art.src}
        srcSet={art.srcSet}
        sizes="(min-width: 900px) 25vw, 50vw"
        width={art.width}
        height={art.height}
        alt=""
        loading="lazy"
        decoding="async"
        className={styles.fallbackArt}
      />
      <span className={styles.fallbackBrand}>{family.brand}</span>
    </div>
  );
}
