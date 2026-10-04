import { imageSet } from "@/lib/images";
import { Breadcrumb, type Crumb } from "./Breadcrumb";
import styles from "./ListingHeader.module.css";

/** Slim band for category and sub-category pages: the department's cover art under a scrim, breadcrumb and H1. */
export function ListingHeader({
  deptSlug,
  crumbs,
  title,
  lead,
}: {
  deptSlug: string;
  crumbs: Crumb[];
  title: string;
  /** One line under the title, from the keyword map */
  lead?: string;
}) {
  const img = imageSet(`cover-${deptSlug}`);
  return (
    <header className={`${styles.band} on-ink`}>
      <div className={styles.photo} aria-hidden="true">
        <img
          srcSet={img.srcSet}
          sizes="100vw"
          src={img.src}
          width={img.width}
          height={img.height}
          alt=""
        />
      </div>
      <div className={`container ${styles.body}`}>
        <Breadcrumb items={crumbs} />
        <h1>{title}</h1>
        {lead && <p className={styles.lead}>{lead}</p>}
      </div>
    </header>
  );
}
