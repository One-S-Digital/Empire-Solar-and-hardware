import type { Metadata, Viewport } from "next";
import { Archivo, Big_Shoulders, IBM_Plex_Mono } from "next/font/google";
import { ListDrawer } from "@/components/enquiry/ListDrawer";
import { MobileTabBar } from "@/components/site/MobileTabBar";
import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { UtilityStrip } from "@/components/site/UtilityStrip";
import { getDepartments } from "@/lib/catalogue";
import "../styles/globals.css";

// Three families, each with a job (Website Plan, 2.2): subset to Latin, swap, display font preloaded.
// Google Fonts now ships "Big Shoulders Display" as one "Big Shoulders" family with an optical-size
// axis; at heading sizes the browser picks the display cut, so this is the same face as the plan.
const display = Big_Shoulders({
  subsets: ["latin"],
  axes: ["opsz"],
  display: "swap",
  // Next cannot work out fallback-font metrics for this family. Tune a size-adjusted fallback in QA (CLS target).
  adjustFontFallback: false,
  variable: "--font-big-shoulders",
  preload: true,
});
const body = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  display: "swap",
  variable: "--font-archivo",
});
const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-plex-mono",
});

export const metadata: Metadata = {
  title: {
    default: "Empire Solar & Hardware, Brits",
    template: "%s | Empire Solar & Hardware, Brits",
  },
  description:
    "Solar, tools, plumbing and electrical supplies at Kremetart Centre, Brits. Browse the catalogue, build a list, and we'll confirm stock and price.",
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
};

// Backstop: pages are rebuilt at least hourly even if a WordPress save never reaches /api/revalidate
export const revalidate = 3600;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The mega menu shows each department's first four categories, in the plan's order (Website Plan 6.3)
  const menu = (await getDepartments()).map((d) => ({
    slug: d.slug,
    name: d.name,
    top: d.categories.slice(0, 4).map((c) => ({ slug: c.slug, name: c.name })),
  }));

  return (
    <html lang="en-ZA" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <UtilityStrip />
        <SiteHeader departments={menu} />
        <main id="main">{children}</main>
        <SiteFooter />
        <MobileTabBar />
        <ListDrawer />
        <WhatsAppButton />
      </body>
    </html>
  );
}
