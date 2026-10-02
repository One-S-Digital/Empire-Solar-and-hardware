"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutGrid, MapPin, Search } from "lucide-react";
import styles from "./MobileTabBar.module.css";

// Plan 5.2 also has List. It is added with its page (phase 6).
const TABS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/catalogue", label: "Catalogue", icon: LayoutGrid, match: (p: string) => p.startsWith("/catalogue") || p.startsWith("/p/") },
  { href: "/search", label: "Search", icon: Search, match: (p: string) => p.startsWith("/search") },
  { href: "/contact", label: "Contact", icon: MapPin, match: (p: string) => p.startsWith("/contact") },
];

export function MobileTabBar() {
  const pathname = usePathname();
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
    </nav>
  );
}
