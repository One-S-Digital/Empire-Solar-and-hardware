import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ListingHeader } from "@/components/catalogue/ListingHeader";
import { Listing } from "@/components/catalogue/Listing";
import { getDepartments, getSub } from "@/lib/catalogue";
import { listMetadata, loadList } from "@/lib/list-page";
import { categorySeo } from "@/lib/seo";

type Props = {
  params: Promise<{ department: string; category: string; sub: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateStaticParams = async () =>
  (await getDepartments()).flatMap((d) =>
    d.categories.flatMap((c) =>
      (c.subs ?? []).map((s) => ({
        department: d.slug,
        category: c.slug,
        sub: s.slug,
      })),
    ),
  );

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  const { department, category, sub } = await params;
  const found = await getSub(department, category, sub);
  if (!found) return {};
  const { state } = await loadList(department, category, sub, searchParams);
  const copy = categorySeo(`/catalogue/${department}/${category}/${sub}`);
  return listMetadata(`/catalogue/${department}/${category}/${sub}`, state, {
    title: copy ? { absolute: copy.title } : `${found.sub.name} in Brits`,
    description: copy?.description ?? `${found.sub.name}: ${found.cat.name}, ${found.dept.name}. Not on the shelf? We'll order it in. Kremetart Centre, Brits.`,
  });
}

export default async function SubCategoryPage({ params, searchParams }: Props) {
  const { department, category, sub } = await params;
  const found = await getSub(department, category, sub);
  if (!found) notFound();
  const { dept, cat, sub: subcat } = found;
  const { state, all, families, facets } = await loadList(
    dept.slug,
    cat.slug,
    subcat.slug,
    searchParams,
  );
  return (
    <>
      <ListingHeader
        deptSlug={dept.slug}
        crumbs={[
          { label: "Catalogue", href: "/catalogue" },
          { label: dept.name, href: `/catalogue/${dept.slug}` },
          { label: cat.name, href: `/catalogue/${dept.slug}/${cat.slug}` },
          { label: subcat.name },
        ]}
        title={subcat.name}
        lead={categorySeo(`/catalogue/${dept.slug}/${cat.slug}/${subcat.slug}`)?.description}
      />
      <div className="container">
        <Listing
          all={all}
          families={families}
          facets={facets}
          state={state}
          basePath={`/catalogue/${dept.slug}/${cat.slug}/${subcat.slug}`}
          deptSlug={dept.slug}
          deptName={dept.name}
          rail={dept.categories}
          activeCat={cat.slug}
          activeSub={subcat.slug}
        />
      </div>
    </>
  );
}
