"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LayoutGrid, List } from "lucide-react";
import { FILTER_KEYS, toQuery, type ListState, type Sort } from "@/lib/filters";
import styles from "./listControls.module.css";

/** Sort and the grid/list switch. The view is remembered in a cookie, so the server can render it on the next visit. */
export function ListControls({ basePath, state }: { basePath: string; state: ListState }) {
  const router = useRouter();
  const remember = (view: string) => {
    document.cookie = `empire_view=${view}; path=/; max-age=31536000; samesite=lax`;
  };
  return (
    <div className={styles.controls}>
      <form action={basePath} method="get" className={styles.sort}>
        {FILTER_KEYS.map((k) => state.filters[k].length > 0 && <input key={k} type="hidden" name={k} value={state.filters[k].join(",")} />)}
        {state.view === "list" && <input type="hidden" name="view" value="list" />}
        <label htmlFor="sort">Sort</label>
        <select
          id="sort"
          name="sort"
          value={state.sort}
          onChange={(e) => router.push(basePath + toQuery(state, { sort: e.target.value as Sort, page: 1 }), { scroll: false })}
        >
          <option value="az">A to Z</option>
          <option value="brand">Brand</option>
        </select>
        <noscript>
          <button type="submit">Sort</button>
        </noscript>
      </form>

      <div role="group" aria-label="View" className={styles.views}>
        <Link
          href={basePath + toQuery(state, { view: "grid", page: 1 })}
          scroll={false}
          aria-current={state.view === "grid" ? "true" : undefined}
          onClick={() => remember("grid")}
        >
          <LayoutGrid size={18} aria-hidden="true" /> Grid
        </Link>
        <Link
          href={basePath + toQuery(state, { view: "list", page: 1 })}
          scroll={false}
          aria-current={state.view === "list" ? "true" : undefined}
          onClick={() => remember("list")}
        >
          <List size={18} aria-hidden="true" /> List
        </Link>
      </div>
    </div>
  );
}
