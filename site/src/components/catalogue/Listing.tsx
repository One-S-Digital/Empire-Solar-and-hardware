import Link from "next/link";
import type { Family } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { activeFilterCount, FILTER_KEYS, toQuery, without, type Facet, type ListState } from "@/lib/filters";
import { Filters } from "./Filters";
import { ListControls } from "./ListControls";
import { ProductCard } from "./ProductCard";
import { ProductRow } from "./ProductRow";
import styles from "./listing.module.css";

export const PAGE_SIZE = 36;

type RailCategory = { slug: string; name: string; rows: number; subs?: { slug: string; name: string; rows: number }[] };

type ListingProps = {
  /** Every listing in this category, before filters */
  all: Family[];
  /** After filters and sort */
  families: Family[];
  facets: Facet[];
  state: ListState;
  basePath: string;
  deptSlug: string;
  deptName: string;
  rail: RailCategory[];
  activeCat?: string;
  activeSub?: string;
};

const FILTER_NAMES = { brand: "Brand", size: "Size", power: "Power", range: "Range" } as const;

/**
 * Product grid or list, with the category rail, filters, sort and removable chips. "Show more" is a real link
 * (?page=2) so products stay crawlable without JavaScript (SEO plan 3.4).
 */
export function Listing({ all, families, facets, state, basePath, deptSlug, deptName, rail, activeCat, activeSub }: ListingProps) {
  const active = activeFilterCount(state.filters);
  // "Products" means orderable sizes and codes, as on the tiles. Each card is one listing that holds its sizes.
  const products = all.reduce((sum, f) => sum + f.rows.length, 0);
  const shown = families.slice(0, state.page * PAGE_SIZE);
  const left = families.length - shown.length;
  const labelFor = (key: (typeof FILTER_KEYS)[number], value: string) =>
    facets.find((f) => f.key === key)?.options.find((o) => o.value === value)?.label ?? value;

  return (
    <div className={styles.layout}>
      <aside className={styles.side}>
        <Filters facets={facets} basePath={basePath} state={state} resultCount={families.length} />
        <nav className={styles.rail} aria-label={`${deptName} categories`}>
          <h2 className={styles.railHead}>
            <Link href={`/catalogue/${deptSlug}`}>{deptName}</Link>
          </h2>
          <ul>
            {rail.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/catalogue/${deptSlug}/${c.slug}`}
                  aria-current={c.slug === activeCat && !activeSub ? "page" : undefined}
                  className={c.slug === activeCat ? styles.activeCat : undefined}
                >
                  <span>{c.name}</span>
                  <span className="mono">{formatCount(c.rows)}</span>
                </Link>
                {c.slug === activeCat && c.subs && c.subs.length > 0 && (
                  <ul className={styles.subs}>
                    {c.subs.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/catalogue/${deptSlug}/${c.slug}/${s.slug}`}
                          aria-current={s.slug === activeSub ? "page" : undefined}
                        >
                          <span>{s.name}</span>
                          <span className="mono">{formatCount(s.rows)}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <section aria-label="Products" className={styles.results}>
        <p className={styles.count}>
          {active > 0 ? (
            <>
              <strong>
                {formatCount(families.length)} {families.length === 1 ? "listing" : "listings"}
              </strong>
              <span>of {formatCount(all.length)} match your filters. Stock varies. Anything listed can be ordered in.</span>
            </>
          ) : (
            <>
              <strong>{formatCount(products)} products</strong>
              <span>
                {all.length < products && `Shown as ${formatCount(all.length)} listings. Open one to see its sizes and codes. `}
                Stock varies. Anything listed can be ordered in.
              </span>
            </>
          )}
        </p>

        {active > 0 && (
          <ul className={styles.chips} aria-label="Applied filters">
            {FILTER_KEYS.flatMap((key) =>
              state.filters[key].map((value) => (
                <li key={`${key}-${value}`}>
                  <Link href={basePath + toQuery(state, { filters: without(state.filters, key, value), page: 1 })} scroll={false}>
                    {FILTER_NAMES[key]}: {labelFor(key, value)} <span aria-hidden="true">&times;</span>
                    <span className="visually-hidden"> remove filter</span>
                  </Link>
                </li>
              )),
            )}
          </ul>
        )}

        <ListControls basePath={basePath} state={state} />

        {families.length === 0 ? (
          <div className={styles.empty}>
            <h3>No listings match these filters</h3>
            <p>Try taking one off, or clear them all to see everything in this category.</p>
            <Link href={basePath + toQuery({ ...state, filters: { brand: [], size: [], power: [], range: [] } }, { page: 1 })}>
              Clear all filters
            </Link>
          </div>
        ) : state.view === "list" ? (
          <div className={styles.rows}>
            {shown.map((f) => (
              <ProductRow key={f.id} family={f} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {shown.map((f) => (
              <ProductCard key={f.id} family={f} />
            ))}
          </div>
        )}

        {left > 0 && (
          <p className={styles.more}>
            <Link href={`${basePath}${toQuery(state, { page: state.page + 1 })}`} scroll={false} className={styles.moreLink}>
              Show {Math.min(PAGE_SIZE, left)} more ({formatCount(left)} left)
            </Link>
          </p>
        )}
      </section>
    </div>
  );
}
