"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClipboardList, Home, LayoutGrid, MapPin, Search } from "lucide-react";
import { setDrawer, useListCount } from "@/lib/enquiry";
import styles from "./MobileTabBar.module.css";

const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/catalogue", label: "Catalogue", icon: LayoutGrid, match: (p: string) => p.startsWith("/catalogue") || p.startsWith("/p/") },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/contact", label: "Contact", icon: MapPin, match: (p: string) => p.startsWith("/contact") },
];

export function MobileTabBar() {
  const pathname = usePathname();
  const count = useListCount();
  return (
    <nav className={styles.bar} aria-label="Quick links">
      {TABS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} className={styles.tab} aria-current={active ? "page" : undefined}>
            <Icon size={22} aria-hidden="true" />
            <span>{label}</span>
          </Link>
        );
      })}
      <button type="button" className={styles.tab} onClick={() => setDrawer(true)} aria-haspopup="dialog">
        <span className={styles.iconWrap}>
          <ClipboardList size={22} aria-hidden="true" />
          {count > 0 && <span className={styles.count}>{count}</span>}
        </span>
        <span>List</span>
      </button>
    </nav>
  );
}
