import "server-only";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { familiesIn } from "./catalogue";
import { activeFilterCount, applyFilters, buildFacets, parseListState, sortFamilies, type ListState } from "./filters";

type RawParams = Record<string, string | string[] | undefined>;

/** Everything a listing page needs: the list in this category, what the URL has filtered and sorted it to, and the filter panel. */
export async function loadList(dept: string, cat: string, sub: string | undefined, searchParams: Promise<RawParams>) {
  const cookieView = (await cookies()).get("empire_view")?.value;
  const state = parseListState(await searchParams, cookieView);
  const all = familiesIn(dept, cat, sub);
  const families = sortFamilies(applyFilters(all, state.filters), state.sort);
  const facets = buildFacets(all, state.filters);
  return { state, all, families, facets };
}

/**
 * SEO plan 3.4: a filtered or sorted URL points at the plain category and stays out of the index.
 * Plain pagination keeps its own canonical, and the grid/list choice never changes the canonical.
 */
export function listMetadata(basePath: string, state: ListState, base: Metadata): Metadata {
  const variant = activeFilterCount(state.filters) > 0 || state.sort !== "az";
  return {
    ...base,
    alternates: { canonical: variant || state.page === 1 ? basePath : `${basePath}?page=${state.page}` },
    robots: variant ? { index: false, follow: true } : undefined,
  };
}
