import type { Metadata } from "next";
import Link from "next/link";
import { AisleSign } from "@/components/AisleSign";
import { DepartmentCover } from "@/components/catalogue/DepartmentCover";
import { StockNotice } from "@/components/catalogue/StockNotice";
import { SearchBox } from "@/components/site/SearchBox";
import { getBrands, getDepartments, getTotals } from "@/lib/catalogue";
import { brandDisplayName, brandPath } from "@/lib/brands";
import { formatCount } from "@/lib/catalogue-display";
import { imageSet } from "@/lib/images";
import styles from "./catalogue.module.css";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Search over 6,000 products from 15 suppliers: solar, tools, plumbing, electrical, lighting, paint and more. Not on the shelf? We'll order it in.",
};

export default async function CataloguePage() {
  const departments = await getDepartments();
  const totals = await getTotals();
  const brands = await getBrands();
  const hero = imageSet("hero-banner");
  return (
    <>
      <header className={`${styles.banner} on-ink`}>
        <div className={styles.bannerImg} aria-hidden="true">
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
        <div className={`container ${styles.head}`}>
          <AisleSign as="h1">Catalogue</AisleSign>
          <SearchBox
            id="catalogue-search"
            variant="page"
            label="Search products, brands or codes"
            placeholder="e.g. RCSB18540 or 15mm ball valve"
          />
        </div>
      </header>
      <div className="container">
        <StockNotice
          totalProducts={totals.rows}
          supplierCount={totals.suppliers}
        />

        <section
          className={`${styles.departments} pegboard`}
          aria-labelledby="depts"
        >
          <h2 id="depts" className="visually-hidden">
            Departments
          </h2>
          <div className={styles.deptGrid}>
            {departments.map((d) => (
              <DepartmentCover key={d.slug} dept={d} />
            ))}
          </div>
        </section>

        <section aria-labelledby="brands" className={styles.brands}>
          <h2 id="brands">Shop by brand</h2>
          <p>
            {totals.brands} brands, from {totals.suppliers} suppliers. Pick one
            to see everything we can get.
          </p>
          <ul>
            {brands.map((b) => (
              <li key={b.slug}>
                <Link href={brandPath(b.slug)}>
                  <strong>{brandDisplayName(b.slug, b.name)}</strong>
                  <span className="mono">{formatCount(b.rows)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
