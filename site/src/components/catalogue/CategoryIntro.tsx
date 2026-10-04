import { categoryIntro } from "@/lib/seo";
import styles from "./CategoryIntro.module.css";

/** The written intro above a category's products. Shown on the plain first page only, so filtered and paged views do not repeat it. */
export function CategoryIntro({ path, plain }: { path: string; plain: boolean }) {
  const text = categoryIntro(path);
  if (!text || !plain) return null;
  return <p className={styles.intro}>{text}</p>;
}
