import Link from "next/link";
import { MapPin } from "lucide-react";
import { getBrands, getDepartments } from "@/lib/catalogue";
import { store } from "@/lib/store";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  const departments = getDepartments();
  const brands = getBrands();
  return (
    <footer className={`${styles.footer} on-ink`}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.about}>
          <img src="/brand/empire-logo-compact-120h.webp" width={491} height={120} alt="Empire Solar & Hardware" className={styles.logo} />
          <p className={styles.tagline}>{store.tagline}</p>
          <address className={styles.address}>
            <MapPin size={16} aria-hidden="true" />
            <span>
              {store.address.lines.map((line) => (
                <span key={line}>
                  {line}
                  <br />
                </span>
              ))}
            </span>
          </address>
          <a href={store.mapsSearchUrl} target="_blank" rel="noopener noreferrer">
            Get directions
          </a>
          <Link href="/contact">Contact and opening hours</Link>
        </div>

        <nav aria-label="Departments">
          <h2 className={styles.heading}>Departments</h2>
          <ul>
            {departments.map((d) => (
              <li key={d.slug}>
                <Link href={`/catalogue/${d.slug}`}>{d.name}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Brands">
          <h2 className={styles.heading}>Brands we stock</h2>
          <ul className={styles.brands}>
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={`/search?q=${encodeURIComponent(b.name)}`}>{b.name}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </footer>
  );
}
