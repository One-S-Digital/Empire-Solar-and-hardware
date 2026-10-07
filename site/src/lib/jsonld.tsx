import type { Family } from "./catalogue";
import { absolute, siteUrl } from "./site-url";
import { store } from "./store";

/** One JSON-LD block. "<" is escaped so catalogue text can never close the script tag. */
export function JsonLd({ data }: { data: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

const DAYS = { mon: "Monday", tue: "Tuesday", wed: "Wednesday", thu: "Thursday", fri: "Friday", sat: "Saturday", sun: "Sunday" } as const;

// The service area from SEO plan 1.3 (core and near rings)
const AREA_SERVED = ["Brits", "Oukasie", "Letlhabile", "Mothotlung", "Mooinooi", "Hartbeespoort", "Schoemansville", "Kosmos", "Ifafi", "Meerhof", "Skeerpoort", "Marikana", "Madibeng"];

/** The store, on every page (SEO plan 3.6). Fields with no real value yet are left out, never guessed. */
export function storeSchema(brandNames: string[]) {
  return {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    "@id": `${siteUrl}/#store`,
    name: store.name,
    url: siteUrl,
    logo: absolute("/brand/empire-icon-512.png"),
    image: absolute("/brand/empire-horizontal.png"),
    slogan: store.tagline,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kremetart Centre, Van Velden St",
      addressLocality: "Brits",
      addressRegion: "North West",
      postalCode: "0250",
      addressCountry: "ZA",
    },
    geo: { "@type": "GeoCoordinates", latitude: -25.6322143, longitude: 27.781813 },
    hasMap: store.mapsUrl,
    telephone: store.phone ?? undefined,
    email: store.email ?? undefined,
    openingHoursSpecification: store.hours
      ? (Object.keys(DAYS) as (keyof typeof DAYS)[]).flatMap((k) => {
          const h = k === "sun" ? null : store.hours?.[k]; // Sunday may be closed: left out until the client confirms
          return h ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: DAYS[k], opens: h.open, closes: h.close }] : [];
        })
      : undefined,
    areaServed: AREA_SERVED.map((name) => ({ "@type": "Place", name })),
    brand: brandNames.map((name) => ({ "@type": "Brand", name })),
    currenciesAccepted: "ZAR",
    sameAs: [store.mapsUrl],
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}/#website`,
    name: store.name,
    url: siteUrl,
    publisher: { "@id": `${siteUrl}/#store` },
    potentialAction: { "@type": "SearchAction", target: `${siteUrl}/search?q={search_term_string}`, "query-input": "required name=search_term_string" },
  };
}

export function breadcrumbSchema(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      // the last crumb is the page itself, which Google allows to have no URL
      ...(c.href && i < items.length - 1 ? { item: absolute(c.href) } : {}),
    })),
  };
}

/**
 * A product family (SEO plan 3.6): a ProductGroup with a variant per code, or a plain Product when it has one.
 * No offers: there are no prices, and fake ones are against Google's rules.
 */
export function productSchema(f: Family, categoryName: string) {
  const url = absolute(`/p/${f.slug}`);
  const image = f.image ? absolute(f.image) : undefined;
  const coded = f.variants.filter((v) => v.code);
  const base = { "@context": "https://schema.org", name: f.name, url, brand: { "@type": "Brand", name: f.brand }, image, category: categoryName };
  const variant = (v: Family["variants"][number]) => ({
    "@type": "Product",
    name: v.label ? `${f.name} ${v.label}` : f.name,
    sku: v.code,
    ...(v.size ? { size: v.size } : {}),
    image,
    url: v.code ? `${url}?code=${encodeURIComponent(v.code)}` : url,
  });
  if (coded.length > 1) {
    return { ...base, "@type": "ProductGroup", "@id": `${url}#group`, productGroupID: f.id, hasVariant: coded.map(variant) };
  }
  return { ...base, "@type": "Product", ...(coded[0] ? { sku: coded[0].code } : {}), ...(coded[0]?.size ? { size: coded[0].size } : {}) };
}

export function faqSchema(items: { q: string; a: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };
}
