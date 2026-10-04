import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ListingHeader } from "@/components/catalogue/ListingHeader";
import listing from "@/components/catalogue/listing.module.css";
import { getBrands, getDepartments, familiesOfBrand } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { brandDisplayName, brandNote, brandPath, brandSlugFromUrl } from "@/lib/brands";
import { faqSchema, JsonLd } from "@/lib/jsonld";
import { store } from "@/lib/store";
import styles from "./brand.module.css";

const lowerFirst = (s: string) => s.charAt(0).toLowerCase() + s.slice(1);

type Props = { params: Promise<{ brand: string }> };

export const generateStaticParams = async () => (await getBrands()).map((b) => ({ brand: brandPath(b.slug).split("/").pop()! }));

async function load(urlSlug: string) {
  const slug = brandSlugFromUrl(urlSlug);
  const brand = slug ? (await getBrands()).find((b) => b.slug === slug) : undefined;
  if (!slug || !brand) return undefined;
  return { slug, brand, name: brandDisplayName(slug, brand.name), note: brandNote(slug) };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const found = await load((await params).brand);
  if (!found) return {};
  const { slug, name, note } = found;
  return {
    // SEO plan keyword map: "{Brand} Stockist in Brits | Empire Solar & Hardware"
    title: { absolute: `${name} Stockist in Brits | Empire Solar & Hardware` },
    description: `${name} at Empire Solar & Hardware, Kremetart Centre, Brits: ${lowerFirst(note.carries)}. Not on the shelf? We'll order it in.`,
    alternates: { canonical: brandPath(slug) },
  };
}

export default async function BrandPage({ params }: Props) {
  const found = await load((await params).brand);
  if (!found) notFound();
  const { slug, name, note, brand } = found;
  const [families, departments] = await Promise.all([familiesOfBrand(slug), getDepartments()]);

  // Where the brand's range sits: each category it appears in, biggest first (home category only)
  const tally = new Map<string, { dept: string; deptName: string; cat: string; catName: string; families: number; rows: number }>();
  for (const f of families) {
    const d = departments.find((x) => x.slug === f.dept);
    const c = d?.categories.find((x) => x.slug === f.cat);
    if (!d || !c) continue;
    const key = `${d.slug}/${c.slug}`;
    const t = tally.get(key) ?? { dept: d.slug, deptName: d.name, cat: c.slug, catName: c.name, families: 0, rows: 0 };
    t.families += 1;
    t.rows += f.rows.length;
    tally.set(key, t);
  }
  const ranges = [...tally.values()].sort((a, b) => b.rows - a.rows);
  const homeDept = ranges[0]?.dept ?? departments[0].slug;

  // A taste of the range: ones with a photo first
  const featured = [...families.filter((f) => f.image), ...families.filter((f) => !f.image)].slice(0, 12);

  const faq = [
    {
      q: note.question ?? `Where can I buy ${name} in Brits?`,
      a: `${name} is available through Empire Solar & Hardware at ${store.address.oneLine}. Browse the ${formatCount(brand.rows)} ${name} products on this page, add what you need to your list, and we will confirm stock and price.`,
    },
    {
      q: `Can you order in ${name} products that are not on the shelf?`,
      a: `Yes. If a ${name} product is in our catalogue but not on the shelf, we order it in for you. Send us your list and we will tell you what is in stock and how long the rest will take.`,
    },
  ];

  return (
    <>
      <JsonLd data={faqSchema(faq)} />
      <ListingHeader deptSlug={homeDept} crumbs={[{ label: "Catalogue", href: "/catalogue" }, { label: name }]} title={`${name} stockist in Brits`} />
      <div className="container">
        <section className={styles.intro} aria-labelledby="about-brand">
          <h2 id="about-brand">{name} at Empire Solar &amp; Hardware</h2>
          <p>
            We carry {name} at our counter in {store.address.lines[0]}, Brits: {lowerFirst(note.carries)}. That is{" "}
            <strong className="mono">{formatCount(brand.rows)}</strong> products in {ranges.length} {ranges.length === 1 ? "category" : "categories"}. If it is
            not on the shelf, we will order it in.
          </p>
        </section>

        <section className={styles.block} aria-labelledby="range">
          <h2 id="range">The {name} range, by category</h2>
          <ul className={styles.ranges}>
            {ranges.map((r) => (
              <li key={`${r.dept}/${r.cat}`}>
                <Link href={`/catalogue/${r.dept}/${r.cat}?brand=${slug}`}>
                  <strong>{r.catName}</strong>
                  <span>{r.deptName}</span>
                  <span className="mono">{formatCount(r.rows)} products</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block} aria-labelledby="featured">
          <h2 id="featured">Some of our {name} products</h2>
          <div className={listing.grid}>
            {featured.map((f) => (
              <ProductCard key={f.id} family={f} />
            ))}
          </div>
          {families.length > featured.length && (
            <p className={styles.note}>
              Showing {featured.length} of {formatCount(families.length)} {name} listings. Pick a category above to see them all.
            </p>
          )}
        </section>

        <section className={styles.block} aria-labelledby="faq">
          <h2 id="faq">Questions about {name}</h2>
          <dl className={styles.faq}>
            {faq.map((i) => (
              <div key={i.q}>
                <dt>{i.q}</dt>
                <dd>{i.a}</dd>
              </div>
            ))}
          </dl>
        </section>
      </div>
    </>
  );
}
