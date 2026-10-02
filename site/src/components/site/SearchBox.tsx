"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import type MiniSearch from "minisearch";
import { Search } from "lucide-react";
import { displayName } from "@/lib/catalogue-display";
import { matchCategories, runSearch, SEARCH_OPTIONS, type CategoryEntry, type SearchDoc } from "@/lib/search-config";
import { expandQuery } from "@/lib/synonyms";
import { DepartmentIcon } from "./DepartmentIcon";
import styles from "./SearchBox.module.css";

type Doc = [slug: string, name: string, brand: string, image: string, code: string, home: string];
type Loaded = { mini: MiniSearch<SearchDoc>; docs: Doc[]; categories: CategoryEntry[] };

// The index is fetched once, the first time anyone focuses a search box, and kept for every box on the page
let loading: Promise<Loaded> | null = null;
function loadIndex(): Promise<Loaded> {
  if (!loading) {
    loading = Promise.all([import("minisearch"), fetch("/search-index.json").then((r) => r.json())]).then(
      ([{ default: MiniSearchClass }, payload]) => ({
        mini: MiniSearchClass.loadJS(payload.index, SEARCH_OPTIONS),
        docs: payload.docs as Doc[],
        categories: payload.categories as CategoryEntry[],
      }),
    );
    loading.catch(() => (loading = null)); // try again on the next focus if the file could not be fetched
  }
  return loading;
}

type Option = { key: string; href: string; node: React.ReactNode };

type Props = {
  id: string;
  /** header: compact with the "/" hint. hero and page: larger, with a Search button */
  variant: "header" | "hero" | "page";
  placeholder: string;
  label: string;
  /** Focus with "/" or Ctrl/Cmd + K (the header box only) */
  shortcut?: boolean;
  defaultValue?: string;
};

export function SearchBox({ id, variant, placeholder, label, shortcut = false, defaultValue = "" }: Props) {
  const router = useRouter();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState(defaultValue);
  const [data, setData] = useState<Loaded | null>(null);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);

  const ensure = () => {
    loadIndex().then(setData).catch(() => {});
  };

  useEffect(() => {
    if (!shortcut) return;
    const onKey = (e: KeyboardEvent) => {
      const typing = /^(input|textarea|select)$/i.test((e.target as HTMLElement)?.tagName ?? "");
      if ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [shortcut]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, []);

  const q = query.trim();
  let options: Option[] = [];
  let categories: CategoryEntry[] = [];
  let productCount = 0;
  if (data && q.length >= 2) {
    const ranked = runSearch(
      data.mini,
      q,
      (i) => {
        const [d, c, s] = data.docs[i][5].split("/");
        return [`/catalogue/${d}/${c}`, s ? `/catalogue/${d}/${c}/${s}` : ""];
      },
      data.categories,
    );
    productCount = ranked.length;
    categories = matchCategories(expandQuery(q), data.categories, 3);
    options = [
      ...categories.map(([name, href, context]): Option => ({
        key: `c-${href}`,
        href,
        node: (
          <span className={styles.catRow}>
            <strong>{name}</strong>
            <span>{context}</span>
          </span>
        ),
      })),
      ...ranked.slice(0, 6).map(({ id: docId }): Option => {
        const [slug, name, brand, image, code, home] = data.docs[docId];
        return {
          key: `p-${slug}`,
          href: `/p/${slug}`,
          node: (
            <span className={styles.prodRow}>
              <span className={styles.thumb}>
                {image ? <img src={image} alt="" loading="lazy" /> : <DepartmentIcon dept={home.split("/")[0]} size={20} strokeWidth={1.5} />}
              </span>
              <span className={styles.prodText}>
                <span className={styles.prodBrand}>{brand}</span>
                <span className={styles.prodName}>{displayName(name)}</span>
              </span>
              {code && <span className={`${styles.prodCode} mono`}>{code}</span>}
            </span>
          ),
        };
      }),
    ];
  }
  const seeAll: Option | null =
    q.length >= 2 && data ? { key: "all", href: `/search?q=${encodeURIComponent(q)}`, node: <span className={styles.seeAll}>See all results for &ldquo;{q}&rdquo;</span> } : null;
  const all = seeAll ? [...options, seeAll] : options;
  const showPanel = open && q.length >= 2 && data !== null;

  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" && all.length) {
      e.preventDefault();
      setOpen(true);
      setActive((a) => (a + 1) % all.length);
    } else if (e.key === "ArrowUp" && all.length) {
      e.preventDefault();
      setActive((a) => (a <= 0 ? all.length - 1 : a - 1));
    } else if (e.key === "Enter" && active >= 0 && all[active]) {
      e.preventDefault();
      go(all[active].href);
    } else if (e.key === "Escape") {
      setOpen(false);
      setActive(-1);
    }
  };

  return (
    <div ref={wrapRef} className={`${styles.wrap} ${styles[variant]}`}>
      <form action="/search" role="search" onSubmit={() => setOpen(false)}>
        <label htmlFor={id} className={variant === "header" ? "visually-hidden" : styles.label}>
          {label}
        </label>
        <div className={styles.row}>
          <Search size={variant === "header" ? 18 : 20} aria-hidden="true" className={styles.icon} />
          <input
            ref={inputRef}
            id={id}
            name="q"
            type="search"
            role="combobox"
            aria-expanded={showPanel}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
            value={query}
            placeholder={placeholder}
            autoComplete="off"
            enterKeyHint="search"
            onFocus={() => {
              ensure();
              setOpen(true);
            }}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(-1);
              setOpen(true);
              ensure();
            }}
            onKeyDown={onKeyDown}
          />
          {variant === "header" ? <kbd aria-hidden="true">/</kbd> : <button type="submit">Search</button>}
        </div>
      </form>

      <p className="visually-hidden" aria-live="polite">
        {showPanel ? (productCount ? `${productCount} products found` : "No products found") : ""}
      </p>

      {showPanel && (
        <div className={styles.panel}>
          {all.length > 0 ? (
            <ul id={listId} role="listbox" aria-label="Search results">
              {all.map((o, i) => (
                <li key={o.key} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
                  <Link
                    href={o.href}
                    tabIndex={-1}
                    className={i === active ? styles.active : undefined}
                    onClick={() => setOpen(false)}
                    onMouseEnter={() => setActive(i)}
                  >
                    {o.node}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div id={listId} role="listbox" aria-label="Search results" className={styles.none}>
              <strong>Nothing found for &ldquo;{q}&rdquo;</strong>
              <span>We might still have it, or we can order it.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
