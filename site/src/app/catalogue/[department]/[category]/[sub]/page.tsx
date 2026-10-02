import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { Listing } from "@/components/catalogue/Listing";
import { getDepartments, getSub } from "@/lib/catalogue";
import { listMetadata, loadList } from "@/lib/list-page";
import styles from "../../department.module.css";

type Props = {
  params: Promise<{ department: string; category: string; sub: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const generateStaticParams = () =>
  getDepartments().flatMap((d) =>
    d.categories.flatMap((c) => (c.subs ?? []).map((s) => ({ department: d.slug, category: c.slug, sub: s.slug }))),
  );

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { department, category, sub } = await params;
  const found = getSub(department, category, sub);
  if (!found) return {};
  const { state } = await loadList(department, category, sub, searchParams);
  return listMetadata(`/catalogue/${department}/${category}/${sub}`, state, {
    title: `${found.sub.name} in Brits`,
    description: `${found.sub.name}: ${found.cat.name}, ${found.dept.name}. Not on the shelf? We'll order it in. Kremetart Centre, Brits.`,
  });
}

export default async function SubCategoryPage({ params, searchParams }: Props) {
  const { department, category, sub } = await params;
  const found = getSub(department, category, sub);
  if (!found) notFound();
  const { dept, cat, sub: subcat } = found;
  const { state, all, families, facets } = await loadList(dept.slug, cat.slug, subcat.slug, searchParams);
  return (
    <div className="container">
      <div className={styles.head}>
        <Breadcrumb
          items={[
            { label: "Catalogue", href: "/catalogue" },
            { label: dept.name, href: `/catalogue/${dept.slug}` },
            { label: cat.name, href: `/catalogue/${dept.slug}/${cat.slug}` },
            { label: subcat.name },
          ]}
        />
        <h1>{subcat.name}</h1>
      </div>
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
  );
}
