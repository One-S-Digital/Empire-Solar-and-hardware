import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { StandardPage } from "@/components/StandardPage";
import { getBrands, getDepartments } from "@/lib/catalogue";
import { brandDisplayName, brandPath } from "@/lib/brands";
import { faqSchema, JsonLd } from "@/lib/jsonld";
import { store, type OpeningHours } from "@/lib/store";

export const metadata: Metadata = {
  title: "Store FAQ: hours, location, ordering in",
  description: `Where Empire Solar & Hardware is, when we are open, what we sell, and how ordering in works. ${store.address.oneLine}.`,
  alternates: { canonical: "/faq" },
};

const DAY_NAMES: [keyof OpeningHours, string][] = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

/** "Monday to Friday 08:30 to 17:30, Saturday 08:30 to 15:00, Sunday 09:00 to 13:00", worked out from the store hours. */
function hoursSentence(hours: OpeningHours) {
  const groups: { from: string; to: string; time: string }[] = [];
  for (const [key, name] of DAY_NAMES) {
    const h = hours[key];
    if (!h) continue;
    const time = `${h.open} to ${h.close}`;
    const last = groups[groups.length - 1];
    if (last && last.time === time && last.to === DAY_NAMES[DAY_NAMES.findIndex(([, n]) => n === name) - 1]?.[1]) last.to = name;
    else groups.push({ from: name, to: name, time });
  }
  return groups.map((g) => `${g.from === g.to ? g.from : `${g.from} to ${g.to}`} ${g.time}`).join(", ");
}

type Item = { q: string; text: string; body: ReactNode };

export default async function FaqPage() {
  const [departments, brands] = await Promise.all([getDepartments(), getBrands()]);
  const brandList = brands.map((b) => brandDisplayName(b.slug, b.name));
  const departmentList = departments.map((d) => d.name);
  const hours = store.hours ? hoursSentence(store.hours) : null;

  const items: Item[] = [
    {
      q: "Where is Empire Solar & Hardware?",
      text: `We are at ${store.address.oneLine}. Plus code ${store.plusCode}.`,
      body: (
        <p>
          We are at {store.address.oneLine}. Plus code <span className="mono">{store.plusCode}</span>.{" "}
          <a href={store.mapsSearchUrl} rel="noopener">
            Get directions
          </a>
          .
        </p>
      ),
    },
    ...(hours
      ? [
          {
            q: "What are your opening hours?",
            text: `We are open ${hours}.`,
            body: (
              <p>
                We are open {hours}. The full week is on the <Link href="/contact">contact page</Link>.
              </p>
            ),
          },
        ]
      : []),
    {
      q: "What do you sell?",
      text: `Our catalogue has ${departmentList.join(", ")}. We carry ${brandList.join(", ")}.`,
      body: (
        <>
          <p>
            Our catalogue has {departmentList.length} departments:{" "}
            {departments.map((d, i) => (
              <span key={d.slug}>
                {i > 0 && ", "}
                <Link href={`/catalogue/${d.slug}`}>{d.name}</Link>
              </span>
            ))}
            .
          </p>
          <p>
            We carry{" "}
            {brands.map((b, i) => (
              <span key={b.slug}>
                {i > 0 && ", "}
                <Link href={brandPath(b.slug)}>{brandDisplayName(b.slug, b.name)}</Link>
              </span>
            ))}
            .
          </p>
        </>
      ),
    },
    {
      q: "What if something is not in stock?",
      text: "If a product is in our catalogue but not on the shelf, we order it in. Send us your list and we will tell you what is in stock and how long the rest will take.",
      body: (
        <p>
          If a product is in our catalogue but not on the shelf, we order it in. Send us your list and we will tell you what is in stock and how long the rest will take.
        </p>
      ),
    },
    {
      q: "How do I ask for a product or a price?",
      text: "Add products to your list on the website, then send it to us. We confirm stock and price. The website does not show prices.",
      body: (
        <p>
          Add products to your <Link href="/enquiry">list</Link> on the website, then send it to us. We confirm stock and price. The website does not show prices.
        </p>
      ),
    },
    {
      q: "How can I contact you?",
      text: `${store.phone ? `Phone ${store.phoneDisplay}. ` : ""}${store.whatsapp ? "WhatsApp is on the same number. " : ""}You can also use the contact form on the website, or come into the store.`,
      body: (
        <p>
          {store.phone && (
            <>
              Phone <a href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phoneDisplay}</a>.{" "}
            </>
          )}
          {store.whatsapp && (
            <>
              <a href={`https://wa.me/${store.whatsapp}`} rel="noopener">
                WhatsApp
              </a>{" "}
              is on the same number.{" "}
            </>
          )}
          You can also use the <Link href="/contact">contact form</Link>, or come into the store.
        </p>
      ),
    },
    {
      q: "Can you match a broken part from a photo?",
      text: "You can send photos with the contact form on the website, and we will help you find the part.",
      body: (
        <p>
          You can send photos with the <Link href="/contact">contact form</Link>, and we will help you find the part.
        </p>
      ),
    },
  ];

  return (
    <StandardPage title="Store FAQ" intro="The questions people ask us most, answered in plain words.">
      <JsonLd data={faqSchema(items.map((i) => ({ q: i.q, a: i.text })))} />
      {items.map((i) => (
        <section key={i.q}>
          <h2>{i.q}</h2>
          {i.body}
        </section>
      ))}
    </StandardPage>
  );
}
