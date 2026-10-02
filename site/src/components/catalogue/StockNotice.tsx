import { Docket } from "../Docket";
import { formatCount } from "@/lib/catalogue-display";
import styles from "./catalogue.module.css";

/** The main stock notice (Website Plan 6.6): the only large docket on the Catalogue page. */
export function StockNotice({ totalProducts, supplierCount }: { totalProducts: number; supplierCount: number }) {
  const rounded = Math.floor(totalProducts / 1000) * 1000;
  return (
    <Docket className={styles.notice}>
      <h2 className={styles.noticeHead}>Not on the shelf? We&apos;ll order it in.</h2>
      <p>
        This catalogue lists over {formatCount(rounded)} products from our {supplierCount} suppliers. Not everything is in
        store every day, but if it&apos;s here, we can get it for you. Add it to your list and we&apos;ll confirm stock,
        price and how long it takes.
      </p>
    </Docket>
  );
}
