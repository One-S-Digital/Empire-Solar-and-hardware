import type { Metadata } from "next";
import { ProductCard } from "@/components/catalogue/ProductCard";
import Link from "next/link";
import { searchCategories, searchFamilies } from "@/lib/search";
import { formatCount } from "@/lib/catalogue-display";
import styles from "./search.module.css";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const q = ((await searchParams).q ?? "").trim().slice(0, 100);
  const { total, results } = searchFamilies(q);
  const categories = searchCategories(q);
  return (
    <div className="container">
      <header className={styles.head}>
        <h1>Search</h1>
        <form action="/search" role="search" className={styles.form}>
          <label htmlFor="q">Search products, brands or codes</label>
          <div className={styles.row}>
            <input id="q" type="search" name="q" defaultValue={q} placeholder="e.g. RCSB18540 or 15mm ball valve" autoComplete="off" />
            <button type="submit">Search</button>
          </div>
        </form>
      </header>

      {q === "" && <p>Type a product name, a brand or a code.</p>}

      {categories.length > 0 && (
        <section aria-labelledby="cats" className={styles.cats}>
          <h2 id="cats">Categories</h2>
          <ul>
            {categories.map(([name, href, context]) => (
              <li key={href}>
                <Link href={href}>
                  <strong>{name}</strong>
                  <span>{context}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {q !== "" && total > 0 && (
        <>
          <p className={styles.count}>
            <strong>
              {formatCount(total)} {total === 1 ? "result" : "results"}
            </strong>{" "}
            for &ldquo;{q}&rdquo;{total > results.length ? `. Showing the first ${results.length}.` : ""} Stock varies. Anything listed can be ordered in.
          </p>
          <div className={styles.grid}>
            {results.map((f) => (
              <ProductCard key={f.id} family={f} code={f.variants.find((v) => [v.code, v.supplierCode].some((c) => c?.toLowerCase() === q.toLowerCase()))?.code} />
            ))}
          </div>
        </>
      )}

      {q !== "" && total === 0 && (
        <div className={styles.none}>
          <h2>Nothing found for &ldquo;{q}&rdquo;</h2>
          <p>We might still have it, or we can order it. Try fewer words, or browse the catalogue by department.</p>
        </div>
      )}
    </div>
  );
}
