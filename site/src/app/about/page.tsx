import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Docket } from "@/components/Docket";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import {
  getBrands,
  getDepartments,
  getTotals,
  getFamilies,
} from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { imageSet } from "@/lib/images";
import { store } from "@/lib/store";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About us",
  description: `Empire Solar & Hardware is a trade counter at ${store.address.oneLine}: solar, electrical, plumbing, tools and paint. Not on the shelf? We'll order it in.`,
};

export default async function AboutPage() {
  const departments = await getDepartments();
  const totals = await getTotals();
  const hero = imageSet("hero-banner");
  const cover = imageSet("cover-solar-backup-power");

  // Each brand's main departments, worked out from the catalogue (never typed by hand): the biggest, plus the
  // second when it holds at least 30% as much, so a brand split across two departments is not mislabelled
  const deptName = new Map(departments.map((d) => [d.slug, d.name]));
  const tally = new Map<string, Map<string, number>>();
  for (const f of await getFamilies()) {
    const m = tally.get(f.brandSlug) ?? new Map<string, number>();
    m.set(f.dept, (m.get(f.dept) ?? 0) + 1);
    tally.set(f.brandSlug, m);
  }
  const brands = (await getBrands()).map((b) => {
    const ranked = [...(tally.get(b.slug) ?? [])].sort((a, z) => z[1] - a[1]);
    const main = ranked
      .filter(([, n], i) => i === 0 || (i === 1 && n >= ranked[0][1] * 0.3))
      .map(([d]) => deptName.get(d));
    return { ...b, main: main.join(" and ") };
  });

  const wa = store.whatsapp
    ? `https://wa.me/${store.whatsapp}?text=${encodeURIComponent("Hi Empire Solar & Hardware, ")}`
    : undefined;

  return (
    <>
      <header className={`${styles.hero} on-ink`}>
        <div className={styles.heroImg} aria-hidden="true">
          <img
            srcSet={hero.srcSet}
            sizes="100vw"
            src={hero.src}
            width={hero.width}
            height={hero.height}
            alt=""
            fetchPriority="high"
          />
        </div>
        <div className={`container ${styles.heroBody}`}>
          <SectionHeading
            as="h1"
            display
            tone="dark"
            eyebrow="About Empire"
            line="A trade counter at Kremetart Centre. Solar, electrical, plumbing, tools and paint, all in one place."
          >
            Built in Brits.
          </SectionHeading>
          <div className={styles.actions}>
            <Button href="/catalogue">Browse the catalogue</Button>
            <Button href="/contact" variant="secondary">
              Visit the store
            </Button>
          </div>
        </div>
      </header>

      <section
        className={`container ${styles.section}`}
        aria-labelledby="stock"
      >
        <Reveal>
          <SectionHeading
            id="stock"
            eyebrow="What we stock"
            line={`Over ${formatCount(Math.floor(totals.rows / 1000) * 1000)} products from ${totals.suppliers} suppliers, sorted by what you are fixing.`}
          >
            Nine departments, one counter
          </SectionHeading>
          <ul className={styles.depts}>
            {departments.map((d) => (
              <li key={d.slug}>
                <Link href={`/catalogue/${d.slug}`}>
                  <span>{d.name}</span>
                  <span className="mono">{formatCount(d.rows)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className={`${styles.how} on-ink`} aria-labelledby="how">
        <div className={`container ${styles.howInner}`}>
          <Reveal>
            <div className={styles.howText}>
              <SectionHeading
                id="how"
                tone="dark"
                eyebrow="How we work"
                line="Stock changes every day, so we don't promise what we can't see. If it's on the shelf, you walk out with it. If it isn't, we'll order it in."
              >
                Not on the shelf? We&apos;ll order it in.
              </SectionHeading>
              <ol className={styles.steps}>
                <li>
                  <strong>Add what you need.</strong> Search or browse, then add
                  items to your list. Anything we can&apos;t find, you can type
                  in.
                </li>
                <li>
                  <strong>Send the list.</strong> It reaches the counter. You
                  can also send it on WhatsApp.
                </li>
                <li>
                  <strong>We confirm.</strong> Stock, price and timing, by
                  WhatsApp, phone or email, whichever you choose.
                </li>
              </ol>
              <p className={styles.note}>
                The people behind the counter know the trade. Ask them which
                size, which fitting, or what goes with what.
              </p>
            </div>
          </Reveal>
          <Reveal>
            <Docket number="ESH-0142" className={styles.docket}>
              <p className={styles.docketLine}>
                <span>Your list</span>
                <span className="mono">3 items</span>
              </p>
              <p className={styles.docketLine}>
                <span>Stock, price, timing</span>
                <span className="mono">Confirmed by us</span>
              </p>
              <p className={styles.docketLine}>
                <span>Not in store</span>
                <span className="mono">Ordered in</span>
              </p>
            </Docket>
          </Reveal>
        </div>
      </section>

      <section
        className={`container ${styles.section}`}
        aria-labelledby="suppliers"
      >
        <Reveal>
          <SectionHeading
            id="suppliers"
            eyebrow="Our suppliers"
            line={`We stock ${totals.brands} brands. Pick one to see everything we can get.`}
          >
            Brands on our shelves
          </SectionHeading>
          <ul className={styles.brands}>
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={`/search?q=${encodeURIComponent(b.name)}`}>
                  <strong>{b.name}</strong>
                  <span>{b.main}</span>
                  <span className="mono">{formatCount(b.rows)} products</span>
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>
      </section>

      <section className={`${styles.visit} on-ink`} aria-labelledby="visit">
        <div className={styles.visitImg} aria-hidden="true">
          <img
            srcSet={cover.srcSet}
            sizes="100vw"
            src={cover.src}
            width={cover.width}
            height={cover.height}
            alt=""
            loading="lazy"
          />
        </div>
        <div className={`container ${styles.visitBody}`}>
          <Reveal>
            <SectionHeading
              id="visit"
              tone="dark"
              eyebrow="Visit us"
              line={store.address.oneLine}
            >
              Come to the counter
            </SectionHeading>
            <div className={styles.actions}>
              <Button href={store.mapsUrl} external>
                Get directions
              </Button>
              {wa && (
                <Button href={wa} external variant="secondary">
                  WhatsApp us
                </Button>
              )}
              <Link href="/contact" className={styles.hoursLink}>
                Opening hours and phone
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
