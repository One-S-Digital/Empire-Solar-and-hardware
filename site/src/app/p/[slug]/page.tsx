import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { ProductCard } from "@/components/catalogue/ProductCard";
import { ProductTile } from "@/components/catalogue/ProductTile";
import { getCategory, getFamily, relatedFamilies } from "@/lib/catalogue";
import { JsonLd, productSchema } from "@/lib/jsonld";
import { displayName } from "@/lib/catalogue-display";
import styles from "./product.module.css";
import { AddToList } from "@/components/enquiry/AddToList";
import { VariantTable } from "./VariantTable";

type Props = { params: Promise<{ slug: string }> };

// Only the core pages are pre-built. A product page is built the first time someone opens it, then cached (Website Plan 12.4).
export const dynamicParams = true;
export const generateStaticParams = () => [];

const fullName = (brand: string, name: string) => {
  const n = displayName(name);
  return n.toLowerCase().startsWith(brand.toLowerCase()) ? n : `${brand} ${n}`;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const family = await getFamily((await params).slug);
  if (!family) return {};
  // SEO plan 4.4: {Brand} {Product} ({Main code}) | Empire, Brits. Drop the suffix before the spec if it runs long.
  const name = fullName(family.brand, family.name);
  const code = family.variants[0]?.code;
  const withCode = code ? `${name} (${code})` : name;
  const title = `${withCode} | Empire, Brits`.length <= 60 ? `${withCode} | Empire, Brits` : withCode;
  return {
    title: { absolute: title },
    // ?code=... only highlights a size: the family page is the one that counts (SEO plan 3.2)
    alternates: { canonical: `/p/${family.slug}` },
    description: `${name}. Available through our counter at Kremetart Centre, Brits. If it's not on the shelf, we'll order it in.`,
    // Thin families (no photo, no specs) stay searchable on the site but out of search engines (SEO plan 3.3)
    robots: family.tier === "C" ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductPage({ params }: Props) {
  const family = await getFamily((await params).slug);
  if (!family) notFound();
  const found = await getCategory(family.dept, family.cat);
  if (!found) notFound();
  const { dept, cat } = found;
  const sub = cat.subs?.find((s) => s.slug === family.sub);
  const related = await relatedFamilies(family, 8);
  const hasTable = family.variants.some((v) => v.code || v.label);
  const stated = Math.max(0, ...family.variants.map((v) => v.statedVariants ?? 0));

  return (
    <div className="container">
      <JsonLd data={productSchema(family, `${dept.name} > ${cat.name}`)} />
      <div className={styles.crumbs}>
        <Breadcrumb
          items={[
            { label: "Catalogue", href: "/catalogue" },
            { label: dept.name, href: `/catalogue/${dept.slug}` },
            { label: cat.name, href: `/catalogue/${dept.slug}/${cat.slug}` },
            ...(sub ? [{ label: sub.name, href: `/catalogue/${dept.slug}/${cat.slug}/${sub.slug}` }] : []),
            { label: displayName(family.name) },
          ]}
        />
      </div>

      <div className={styles.layout}>
        <div className={styles.media}>
          <ProductTile family={family} eager />
        </div>

        <div className={styles.info}>
          <p className={styles.brand}>{family.brand}</p>
          <h1 className={styles.title}>{fullName(family.brand, family.name)}</h1>
          {family.range && <p className={styles.range}>Range: {family.range}</p>}
          {family.aka && family.aka.length > 0 && (
            <p className={styles.range}>Also listed as: {family.aka.map(displayName).join(", ")}</p>
          )}

          {hasTable ? (
            <VariantTable variants={family.variants} product={{ slug: family.slug, brand: family.brand, name: displayName(family.name) }} />
          ) : (
            <div>
              <AddToList item={{ key: family.slug, name: displayName(family.name), brand: family.brand, slug: family.slug }} />
            </div>
          )}
          {stated > family.variants.length && (
            <p className={styles.note}>
              This range comes in {stated} sizes. We list the first {family.variants.length} here. Ask at the counter if yours
              isn&apos;t shown.
            </p>
          )}

          <p className={styles.stock}>
            Availability confirmed when you send your enquiry. If it&apos;s not in store, we&apos;ll order it.
          </p>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="more" className={styles.more}>
          <h2 id="more">More in {sub?.name ?? cat.name}</h2>
          <div className={styles.grid}>
            {related.map((f) => (
              <ProductCard key={f.id} family={f} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
