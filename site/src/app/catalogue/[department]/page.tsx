import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AisleSign } from "@/components/AisleSign";
import { Breadcrumb } from "@/components/catalogue/Breadcrumb";
import { CategoryTile } from "@/components/catalogue/CategoryTile";
import { getDepartment, getDepartments } from "@/lib/catalogue";
import { formatCount } from "@/lib/catalogue-display";
import { DEPARTMENT_SEO } from "@/lib/seo";
import styles from "./department.module.css";

type Props = { params: Promise<{ department: string }> };

export const generateStaticParams = () => getDepartments().map((d) => ({ department: d.slug }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const dept = getDepartment((await params).department);
  if (!dept) return {};
  const seo = DEPARTMENT_SEO[dept.slug];
  return { title: { absolute: seo.title }, description: `${seo.intro} Not on the shelf? We'll order it in.` };
}

export default async function DepartmentPage({ params }: Props) {
  const dept = getDepartment((await params).department);
  if (!dept) notFound();
  const seo = DEPARTMENT_SEO[dept.slug];
  return (
    <div className="container">
      <div className={styles.head}>
        <Breadcrumb items={[{ label: "Catalogue", href: "/catalogue" }, { label: dept.name }]} />
        <AisleSign as="h1" swing>
          {dept.name}
        </AisleSign>
        <p className={styles.intro}>{seo.intro}</p>
        <p className={`${styles.count} mono`}>
          {formatCount(dept.rows)} products in {dept.categories.length} categories. Stock varies. Anything listed can be ordered in.
        </p>
      </div>
      <div className={styles.grid}>
        {dept.categories.map((c) => (
          <CategoryTile key={c.slug} deptSlug={dept.slug} cat={c} />
        ))}
      </div>
    </div>
  );
}
