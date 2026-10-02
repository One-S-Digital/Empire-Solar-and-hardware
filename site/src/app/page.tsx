import Link from "next/link";
import { AisleSign } from "@/components/AisleSign";
import { Button } from "@/components/Button";
import { DepartmentCover } from "@/components/catalogue/DepartmentCover";
import { FeatureTile } from "@/components/FeatureTile";
import { HeroBanner } from "@/components/HeroBanner";
import { SectionHeading } from "@/components/SectionHeading";
import { SearchBox } from "@/components/site/SearchBox";
import { Docket } from "@/components/Docket";
import { getDepartments, getFamily, getTotals } from "@/lib/catalogue";
import { displayName, formatCount } from "@/lib/catalogue-display";
import { imageSet } from "@/lib/images";
import { store } from "@/lib/store";
import styles from "./home.module.css";

// The four hero blocks are department features, not products: an AI picture must never pose as a real product (Overhaul Plan 3.1)
const FEATURES = [
  { href: "/catalogue/solar-backup-power", image: "feature-solar", label: "Solar & backup" },
  { href: "/catalogue/power-tools", image: "feature-power-tools", label: "Power tools" },
  { href: "/catalogue/plumbing/taps-mixers", image: "feature-taps", label: "Taps & mixers" },
  { href: "/catalogue/paint-waterproofing", image: "feature-paint", label: "Paint & waterproofing" },
];
// Real products for the sample docket in "How ordering works"
const DOCKET_SAMPLE: { slug: string; qty: number }[] = [
  { slug: "geo-full-bore-lever-ball-valve-fxf", qty: 2 },
  { slug: "ruwag-industrial-circular-saw-combination-blade", qty: 1 },
  { slug: "sunsynk-16kw-hybrid-inverter", qty: 1 },
];
const EXAMPLES = ["Sunsynk inverter", "15mm ball valve", "angle grinder"];

export default function HomePage() {
  const totals = getTotals();
  const departments = getDepartments();
  const sample = DOCKET_SAMPLE.flatMap(({ slug, qty }) => {
    const f = getFamily(slug);
    return f ? [{ family: f, qty }] : [];
  });
  const solar = departments.find((d) => d.slug === "solar-backup-power");
  const solarImg = imageSet("cover-solar-backup-power");

  return (
    <>
      <HeroBanner
        eyebrow="Kremetart Centre, Brits"
        title="Solar, tools and plumbing. One counter in Brits."
        line={`Browse over ${formatCount(Math.floor(totals.rows / 1000) * 1000)} products, build a list, and we'll have it ready.`}
      >
        <SearchBox id="hero-search" variant="hero" label="Search products, brands or codes" placeholder="e.g. RCSB18540" />
        <ul className={styles.chips} aria-label="Example searches">
          {EXAMPLES.map((e) => (
            <li key={e}>
              <Link href={`/search?q=${encodeURIComponent(e)}`}>{e}</Link>
            </li>
          ))}
        </ul>
        <div className={styles.actions}>
          <Button href="/catalogue">Browse the catalogue</Button>
          <Button href={store.mapsSearchUrl} variant="secondary" external>
            Visit the store
          </Button>
        </div>
      </HeroBanner>

      <div className={`${styles.featureBand} on-ink`}>
        <div className="container">
          <h2 className="visually-hidden">Featured departments</h2>
          <ul className={styles.featureGrid}>
            {FEATURES.map((f) => (
              <li key={f.href}>
                <FeatureTile href={f.href} image={f.image}>
                  {f.label}
                </FeatureTile>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <section className={`container ${styles.section}`} aria-labelledby="shop-title">
        <SectionHeading id="shop-title" eyebrow="Nine departments" line="Everything is sorted by what you're fixing, not by supplier.">
          Shop by department
        </SectionHeading>
        <div className={styles.deptGrid}>
          {departments.map((d, i) => (
            <div key={d.slug} className={i < 2 ? styles.deptLarge : i < 5 ? styles.deptMedium : styles.deptSmall}>
              <DepartmentCover dept={d} size={i < 2 ? "large" : "small"} />
            </div>
          ))}
        </div>
      </section>

      <section className={`${styles.order} on-ink`} aria-labelledby="order-title">
        <div className={`container ${styles.orderInner}`}>
          <Docket number="ESH-0142" className={styles.docket}>
            <ul className={styles.docketLines}>
              {sample.map(({ family, qty }) => (
                <li key={family.id}>
                  <span>{displayName(family.name)}</span>
                  <span className="mono">{family.variants[0]?.code}</span>
                  <span className="mono">Qty {qty}</span>
                </li>
              ))}
            </ul>
          </Docket>
          <div className={styles.orderText}>
            <h2 id="order-title">Not on the shelf? We&apos;ll order it in.</h2>
            <ol className={styles.steps}>
              <li>Add what you need.</li>
              <li>Send the list.</li>
              <li>We confirm stock, price and timing.</li>
            </ol>
            <Button href="/catalogue" variant="secondary">
              Browse the catalogue
            </Button>
          </div>
        </div>
      </section>

      <section className={`${styles.solar} on-ink`} aria-labelledby="solar-title">
        <div className={styles.solarMedia} aria-hidden="true">
          <img
            srcSet={solarImg.srcSet}
            sizes="100vw"
            src={solarImg.src}
            width={solarImg.width}
            height={solarImg.height}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={`container ${styles.solarInner}`}>
          <SectionHeading
            id="solar-title"
            tone="dark"
            eyebrow="Solar & backup power"
            line="Hybrid inverters, lithium batteries and ready-made backup kits from Sunsynk, Deye, Luxpower and Hanchu, with the panels and accessories to go with them."
          >
            Backup power, sorted.
          </SectionHeading>
          {solar && (
            <div className={styles.actions}>
              <Button href="/catalogue/solar-backup-power">See solar &amp; backup</Button>
            </div>
          )}
        </div>
      </section>

      <section className={`container ${styles.visitSection}`} aria-labelledby="visit-title">
        <div className={styles.visit}>
          <AisleSign as="h2" size="sm">
            Visit us
          </AisleSign>
          <address className={styles.visitAddress}>
            {store.address.lines.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>
          <Button href={store.mapsSearchUrl} external>
            Get directions
          </Button>
        </div>
      </section>
    </>
  );
}
