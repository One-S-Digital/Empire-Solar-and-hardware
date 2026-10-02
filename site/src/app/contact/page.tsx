import type { Metadata } from "next";
import { MapPin, Phone, Clock } from "lucide-react";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/Button";
import { store, type OpeningHours } from "@/lib/store";
import styles from "./contact.module.css";

export const metadata: Metadata = {
  title: "Contact and opening hours",
  description: `Visit Empire Solar & Hardware at ${store.address.oneLine}. Opening hours, phone number and directions.`,
};

const days: [keyof OpeningHours, string][] = [
  ["mon", "Monday"],
  ["tue", "Tuesday"],
  ["wed", "Wednesday"],
  ["thu", "Thursday"],
  ["fri", "Friday"],
  ["sat", "Saturday"],
  ["sun", "Sunday"],
];

/** "17:30" becomes "5:30 pm", "09:00" becomes "9 am" */
function time(t: string) {
  const [h, m] = t.split(":").map(Number);
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}${m ? `:${String(m).padStart(2, "0")}` : ""} ${h < 12 ? "am" : "pm"}`;
}

const dayOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function ContactPage() {
  const hours = store.hours;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "HardwareStore",
    name: store.name,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kremetart Centre, Van Velden St",
      addressLocality: "Brits",
      postalCode: "0250",
      addressCountry: "ZA",
    },
    geo: { "@type": "GeoCoordinates", latitude: -25.6322143, longitude: 27.781813 },
    telephone: store.phone,
    hasMap: store.mapsUrl,
    openingHoursSpecification: hours
      ? days.flatMap(([k, name]) => {
          const h = hours[k];
          return h ? [{ "@type": "OpeningHoursSpecification", dayOfWeek: name, opens: h.open, closes: h.close }] : [];
        })
      : undefined,
  };

  return (
    <div className="container">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <header className={styles.head}>
        <SectionHeading as="h1" eyebrow="Visit us" line="Solar, electrical and hardware under one roof in Brits.">
          Contact and opening hours
        </SectionHeading>
      </header>

      <div className={styles.grid}>
        <section aria-labelledby="find" className={styles.card}>
          <h2 id="find" className={styles.h}>
            <MapPin size={20} aria-hidden="true" /> Find us
          </h2>
          <address className={styles.address}>
            {store.address.lines.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>
          <p className={styles.note}>Plus code: {store.plusCode}</p>
          <Button href={store.mapsUrl} external>
            Get directions
          </Button>
        </section>

        {store.phone && (
          <section aria-labelledby="call" className={styles.card}>
            <h2 id="call" className={styles.h}>
              <Phone size={20} aria-hidden="true" /> Call us
            </h2>
            <p className={styles.phone}>
              <a href={`tel:${store.phone.replace(/\s/g, "")}`}>{store.phoneDisplay}</a>
            </p>
            <p className={styles.note}>Call during opening hours for stock, prices and quotes.</p>
            <Button href={`tel:${store.phone.replace(/\s/g, "")}`} variant="secondary">
              Call now
            </Button>
          </section>
        )}

        {hours && (
          <section aria-labelledby="hours" className={styles.card}>
            <h2 id="hours" className={styles.h}>
              <Clock size={20} aria-hidden="true" /> Opening hours
            </h2>
            <table className={styles.hours}>
              <tbody>
                {days.map(([k, name]) => (
                  <tr key={k}>
                    <th scope="row">{name}</th>
                    <td>{hours[k] ? `${time(hours[k].open)} to ${time(hours[k].close)}` : "Closed"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className={styles.note}>Hours as shown on our Google Business profile. Public holidays may differ.</p>
          </section>
        )}
      </div>
    </div>
  );
}
