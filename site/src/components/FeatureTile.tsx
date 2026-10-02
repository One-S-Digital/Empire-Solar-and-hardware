import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { imageSet } from "@/lib/images";
import styles from "./FeatureTile.module.css";

/** Portrait department feature. The picture is decoration: the link text names the destination. */
export function FeatureTile({ href, image, children }: { href: string; image: string; children: string }) {
  const img = imageSet(image);
  return (
    <Link href={href} className={`${styles.tile} on-ink`}>
      <img
        srcSet={img.srcSet}
        sizes="(min-width: 900px) 25vw, 50vw"
        src={img.src}
        width={img.width}
        height={img.height}
        alt=""
        loading="lazy"
      />
      <span className={styles.label}>
        <span className={styles.name}>{children}</span>
        <span className={styles.arrow} aria-hidden="true">
          <ArrowRight size={18} />
        </span>
      </span>
    </Link>
  );
}
