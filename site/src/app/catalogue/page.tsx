import type { Metadata } from "next";
import Link from "next/link";
import { AisleSign } from "@/components/AisleSign";
import { DepartmentCover } from "@/components/catalogue/DepartmentCover";
import { StockNotice } from "@/components/catalogue/StockNotice";
import { SearchBox } from "@/components/site/SearchBox";
import { getBrands, getDepartments, getTotals } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import styles from "./catalogue.module.css";

export const metadata: Metadata = {
  title: "Catalogue",
  description:
    "Search over 6,000 products from 15 suppliers: solar, tools, plumbing, electrical, lighting, paint and more. Not on the shelf? We'll order it in.",
};

export default function CataloguePage() {
  const departments = getDepartments();
  const totals = getTotals();
  const brands = getBrands();
  return (
    <div className="container">
      <header className={styles.head}>
        <AisleSign as="h1">Catalogue</AisleSign>
        <SearchBox id="catalogue-search" variant="page" label="Search products, brands or codes" placeholder="e.g. RCSB18540 or 15mm ball valve" />
      </header>

      <StockNotice totalProducts={totals.rows} supplierCount={totals.suppliers} />

      <section className={`${styles.departments} pegboard`} aria-labelledby="depts">
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
        <p>{totals.brands} brands, from {totals.suppliers} suppliers. Pick one to see everything we can get.</p>
        <ul>
          {brands.map((b) => (
            <li key={b.slug}>
              <Link href={`/search?q=${encodeURIComponent(b.name)}`}>
                <strong>{b.name}</strong>
                <span className="mono">{formatCount(b.rows)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
