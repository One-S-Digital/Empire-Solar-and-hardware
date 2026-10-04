import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHeader } from "@/components/catalogue/ListingHeader";
import { Listing } from "@/components/catalogue/Listing";
import { CategoryIntro } from "@/components/catalogue/CategoryIntro";
import { activeFilterCount } from "@/lib/filters";
import { getCategory, getDepartments } from "@/lib/catalogue";
import { listMetadata, loadList } from "@/lib/list-page";
import { categorySeo } from "@/lib/seo";

type Props = {
  params: Promise<{ department: string; category: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateStaticParams = async () =>
  (await getDepartments()).flatMap((d) =>
    d.categories.map((c) => ({ department: d.slug, category: c.slug })),
  );

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { department, category } = await params;
  const found = await getCategory(department, category);
  if (!found) return {};
  const { state } = await loadList(
    department,
    category,
    undefined,
    searchParams,
  );
  const copy = categorySeo(`/catalogue/${department}/${category}`);
  return listMetadata(`/catalogue/${department}/${category}`, state, {
    title: copy ? { absolute: copy.title } : `${found.cat.name} in Brits`,
    description: copy?.description ?? `${found.cat.name} from ${found.dept.name}. Not on the shelf? We'll order it in. Kremetart Centre, Brits.`,
  });
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { department, category } = await params;
  const found = await getCategory(department, category);
  if (!found) notFound();
  const { dept, cat } = found;
  const { state, all, families, facets } = await loadList(
    dept.slug,
    cat.slug,
    undefined,
    searchParams,
  );
  return (
    <>
      <ListingHeader
        deptSlug={dept.slug}
        crumbs={[
          { label: "Catalogue", href: "/catalogue" },
          { label: dept.name, href: `/catalogue/${dept.slug}` },
          { label: cat.name },
        ]}
        title={cat.name}
        lead={categorySeo(`/catalogue/${dept.slug}/${cat.slug}`)?.description}
      />
      <div className="container">
        <CategoryIntro path={`/catalogue/${dept.slug}/${cat.slug}`} plain={state.page === 1 && state.sort === "az" && activeFilterCount(state.filters) === 0} />
        <Listing
          all={all}
          families={families}
          facets={facets}
          state={state}
          basePath={`/catalogue/${dept.slug}/${cat.slug}`}
          deptSlug={dept.slug}
          deptName={dept.name}
          rail={dept.categories}
          activeCat={cat.slug}
        />
      </div>
    </>
  );
}
