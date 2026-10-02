import type { ReactNode } from "react";
import { store } from "@/lib/store";
import { AisleSign } from "./AisleSign";
import { Button } from "./Button";
import { Breadcrumb } from "./catalogue/Breadcrumb";
import styles from "./StandardPage.module.css";

type Props = {
  title: string;
  /** One line under the title */
  intro?: string;
  /** Optional header photo. Left out entirely when absent: no empty frame. */
  image?: { src: string; alt: string; width: number; height: number };
  /** Staff can switch the help band off per page (Website Plan 7.9) */
  helpBand?: boolean;
  children: ReactNode;
};

/**
 * The one design for every plain content page (Website Plan 7.9): breadcrumb, aisle-sign title, optional intro and photo,
 * one readable column, help band, visit card. Content authors only supply the body; layout, type and colour are fixed.
 * Once WordPress is connected, its page editor renders into `children`.
 */
export function StandardPage({ title, intro, image, helpBand = true, children }: Props) {
  const wa = store.whatsapp ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent("Hi Empire Solar & Hardware, ")}` : undefined;
  return (
    <div className="container">
      <div className={styles.crumbs}>
        <Breadcrumb items={[{ label: "Home", href: "/" }, { label: title }]} />
      </div>
      <header className={styles.head}>
        <AisleSign as="h1">{title}</AisleSign>
        {intro && <p className={styles.intro}>{intro}</p>}
      </header>
      {image && (
        <div className={styles.frame}>
          <img src={image.src} width={image.width} height={image.height} alt={image.alt} />
        </div>
      )}
      <div className={`${styles.body}`}>{children}</div>

      {helpBand && (
        <aside className={`${styles.help} on-ink`} aria-labelledby="help-title">
          <h2 id="help-title">Need something for this?</h2>
          <p>Add it to your list, or WhatsApp us.</p>
          <div className={styles.actions}>
            <Button href="/catalogue">Browse the catalogue</Button>
            {wa && (
              <Button href={wa} external variant="secondary">
                WhatsApp us
              </Button>
            )}
          </div>
        </aside>
      )}

      <section className={styles.visit} aria-label="Visit us">
        <AisleSign as="h2" size="sm">
          Visit us
        </AisleSign>
        <address>
          {store.address.lines.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </address>
        <Button href={store.mapsSearchUrl} external>
          Get directions
        </Button>
      </section>
    </div>
  );
}
