import { MapPin } from "lucide-react";
import { store } from "@/lib/store";
import styles from "./UtilityStrip.module.css";

/** Thin strip above the header. Open-now, phone and WhatsApp join it once the client supplies them. */
export function UtilityStrip() {
  return (
    <div className={`${styles.strip} on-ink`}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.item}>
          <MapPin size={14} aria-hidden="true" />
          {store.address.oneLine}
        </span>
        <a href={store.mapsSearchUrl} target="_blank" rel="noopener noreferrer" className={styles.link}>
          Get directions
        </a>
      </div>
    </div>
  );
}
