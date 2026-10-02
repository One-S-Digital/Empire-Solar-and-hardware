import type { Family } from "@/lib/catalogue";
import { displayName } from "@/lib/catalogue-display";
import { DepartmentIcon } from "../site/DepartmentIcon";
import styles from "./catalogue.module.css";

/**
 * The picture slot on a product card or page: the supplier photo at its real size on a paper tile,
 * or a designed fallback (brand name, department icon, faint pegboard). Never a broken image or grey box.
 */
export function ProductTile({ family, eager = false }: { family: Family; eager?: boolean }) {
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
  return (
    <div className={`${styles.tile} ${styles.fallback} pegboard`} role="img" aria-label={`${family.brand} ${displayName(family.name)}, photo to come`}>
      <DepartmentIcon dept={family.dept} size={36} strokeWidth={1.5} />
      <span className={styles.fallbackBrand}>{family.brand}</span>
    </div>
  );
}
