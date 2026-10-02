import type { Metadata } from "next";
import { AisleSign } from "@/components/AisleSign";
import { Button } from "@/components/Button";
import { Docket } from "@/components/Docket";
import { Gear } from "@/components/Gear";
import { GearNotchDemo } from "@/components/GearNotchDemo";
import { Reveal } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { contrast } from "@/lib/contrast";
import styles from "./styleguide.module.css";

export const metadata: Metadata = {
  title: "Styleguide",
  robots: { index: false, follow: false },
};

const COLOURS = [
  { token: "--red-logo", hex: "#FB040A", use: "Logo and large decorative fills only", against: null },
  { token: "--red", hex: "#D0101B", use: "The one accent: buttons, links, active states, aisle signs", against: "#FFFFFF" },
  { token: "--red-deep", hex: "#B30E18", use: "Hover and pressed state for red", against: "#FFFFFF" },
  { token: "--ink", hex: "#161514", use: "Text, dark bands, footer", against: "#F4F2EE" },
  { token: "--steel-700", hex: "#3B3E42", use: "Secondary text, icons", against: "#F4F2EE" },
  { token: "--steel-500", hex: "#5A5E63", use: "Muted and helper text", against: "#F4F2EE" },
  { token: "--steel-200", hex: "#D5D7D9", use: "Borders and dividers", against: null },
  { token: "--concrete", hex: "#F4F2EE", use: "Page background", against: "#161514" },
  { token: "--paper", hex: "#FBFAF7", use: "Dockets, cards, the enquiry list", against: "#161514" },
  { token: "--ok", hex: "#1E7A46", use: "Added-to-list confirmation only", against: "#FBFAF7" },
  { token: "--on-ink-muted", hex: "#A9ADB1", use: "Muted text on ink (added in build: red and steel-500 fail on ink)", against: "#161514" },
  { token: "--ink-950", hex: "#0E0D0C", use: "Overhaul: deepest dark band (concrete text on it)", against: "#F4F2EE" },
  { token: "--ink-800", hex: "#1E1D1B", use: "Overhaul: raised dark surface (concrete text on it)", against: "#F4F2EE" },
  { token: "--steel-900", hex: "#26292D", use: "Overhaul: dark cards (concrete text on it)", against: "#F4F2EE" },
  { token: "--red-on-ink", hex: "#FF5A5F", use: "Overhaul: red as small text on the dark surfaces (eyebrows). Shown on steel-900, the lowest of the three", against: "#26292D" },
] as const;

export default function StyleguidePage() {
  return (
    <div className={styles.page}>
      <div className="container">
        <header className={styles.intro}>
          <AisleSign as="h1" swing>
            Styleguide
          </AisleSign>
          <p>
            Tokens, type, shapes and the six hardware elements from the website plan. This page is
            not linked from the site and is kept out of search engines.
          </p>
        </header>

        <section className={styles.section} aria-labelledby="sg-colour">
          <h2 id="sg-colour">Colour</h2>
          <p>Contrast is worked out live from the hex values, against the background shown.</p>
          <ul className={styles.swatches}>
            {COLOURS.map((c) => {
              const ratio = c.against ? contrast(c.hex, c.against) : null;
              const pass = ratio !== null && ratio >= 4.5;
              return (
                <li key={c.token} className={styles.swatch}>
                  <span className={styles.chip} style={{ background: c.hex }} />
                  <span className={styles.swatchText}>
                    <strong className="mono">{c.token}</strong>
                    <span className="mono">{c.hex}</span>
                    <span>{c.use}</span>
                    <span className={styles.ratio}>
                      {ratio === null
                        ? "Not used for text"
                        : `${ratio.toFixed(2)}:1 against ${c.against}, ${pass ? "passes AA" : "fails AA"}`}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className={styles.section} aria-labelledby="sg-type">
          <h2 id="sg-type">Type</h2>
          <div className={styles.typeRow}>
            <p className={styles.label}>Display: Big Shoulders Display, uppercase (H1, H2, aisle signs)</p>
            <h1 className={styles.specimenH1}>Solar, tools and plumbing.</h1>
            <h2>One counter in Brits</h2>
          </div>
          <div className={styles.typeRow}>
            <p className={styles.label}>Body and UI: Archivo, sentence case</p>
            <h3>Not on the shelf? We&apos;ll order it in.</h3>
            <p>
              This catalogue lists over 6,000 products from our 15 suppliers. Not everything is in
              store every day, but if it&apos;s here, we can get it for you.
            </p>
          </div>
          <div className={styles.typeRow}>
            <p className={styles.label}>Codes: IBM Plex Mono</p>
            <p className="mono">RCSB18540 &nbsp; GPCV400/15 &nbsp; SUN-LYNKS-8.0 &nbsp; ESH-0142</p>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sg-shape">
          <h2 id="sg-shape">Buttons, shape and the gear</h2>
          <div className={styles.row}>
            <Button>Browse the catalogue</Button>
            <Button variant="secondary">Keep browsing</Button>
            <Button variant="link">Visit the store</Button>
            <Button disabled>
              <Gear size={18} spinning /> Sending
            </Button>
          </div>
          <p className={styles.label}>
            Gear notch: the gear turns one tooth (30 degrees) each time an item is added. Try it. Tab to
            any button to see the focus ring.
          </p>
          <GearNotchDemo />
        </section>

        <section className={styles.section} aria-labelledby="sg-signs">
          <h2 id="sg-signs">Aisle signs</h2>
          <div className={styles.row}>
            <AisleSign size="sm">Plumbing</AisleSign>
            <AisleSign size="sm">Solar &amp; Backup Power</AisleSign>
            <AisleSign size="sm">Hand Tools</AisleSign>
          </div>
        </section>

        <section className={`${styles.section} pegboard ${styles.peg}`} aria-labelledby="sg-docket">
          <h2 id="sg-docket">Counter docket and pegboard</h2>
          <div className={styles.row}>
            <Docket number="ESH-0142" date="30 Sep 2026" className={styles.docketDemo}>
              <ul className={styles.lines}>
                <li>
                  <span>Brass ball valve 15mm</span>
                  <span className="mono">BLBVFB15FF</span>
                </li>
                <li>
                  <span>Circular saw blade 185mm</span>
                  <span className="mono">RCSB18540</span>
                </li>
              </ul>
            </Docket>
            <Docket className={styles.docketDemo}>
              <h3>Not on the shelf? We&apos;ll order it in.</h3>
              <p>Add it to your list and we&apos;ll confirm stock, price and how long it takes.</p>
            </Docket>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="sg-heading">
          <h2 id="sg-heading">Section heading</h2>
          <SectionHeading
            as="h2"
            eyebrow="Kremetart Centre, Brits"
            line="Eyebrow, display heading with the logo's red bar, and one supporting line."
          >
            Shop by department
          </SectionHeading>
        </section>

        <section className={`${styles.section} ${styles.deep} on-ink`} aria-labelledby="sg-deep">
          <h2 id="sg-deep" className="visually-hidden">
            Display heading on the deepest band
          </h2>
          <SectionHeading
            as="h2"
            display
            tone="dark"
            eyebrow="Backup power"
            line="Display size at 3.5 to 8rem with leading 0.9, on --ink-950."
          >
            Solar, sorted.
          </SectionHeading>
        </section>

        <section className={styles.section} aria-labelledby="sg-reveal">
          <h2 id="sg-reveal">Reveal</h2>
          <p className={styles.label}>
            Scroll down: the block below fades up once, in 350 ms. With reduced motion it is simply there.
          </p>
          <div style={{ height: "60vh" }} aria-hidden="true" />
          <Reveal>
            <div className={styles.revealDemo}>I arrived when you scrolled to me.</div>
          </Reveal>
        </section>

        <section className={`${styles.section} ${styles.ink} on-ink`} aria-labelledby="sg-ink">
          <h2 id="sg-ink">Dark band</h2>
          <p>
            Ink background, concrete text. Muted text uses <span className="mono">--on-ink-muted</span>.
            Red is not used for small text on ink.
          </p>
          <p className={styles.muted}>Muted line: Kremetart Centre, Van Velden St, Brits</p>
          <div className={styles.row}>
            <Button>Primary on ink</Button>
            <a href="#sg-ink" className={styles.inkLink}>
              A link on ink
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
