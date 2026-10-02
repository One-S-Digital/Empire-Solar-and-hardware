"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { AisleSign } from "../AisleSign";
import { ListButton } from "../enquiry/ListButton";
import { SearchBox } from "./SearchBox";
import styles from "./SiteHeader.module.css";

export type MenuDepartment = {
  slug: string;
  name: string;
  top: { slug: string; name: string }[];
};

export function SiteHeader({ departments }: { departments: MenuDepartment[] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const menuRef = useRef<HTMLDivElement>(null);
  const hoverTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the menu when the page changes
  useEffect(() => setOpen(false), [pathname]);

  // Escape closes the menu ("/" and Ctrl/Cmd+K for search live in SearchBox)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Hover opens after 150ms so the menu never opens by accident (section 9)
  const hoverOpen = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(true), 150);
  };
  const hoverClose = () => {
    clearTimeout(hoverTimer.current);
    hoverTimer.current = setTimeout(() => setOpen(false), 200);
  };

  return (
    <header className={`${styles.header} on-ink ${scrolled ? styles.small : ""}`}>
      <div className={`container ${styles.bar}`}>
        <Link href="/" className={styles.logo} aria-label="Empire Solar & Hardware, home">
          <picture>
            <source media="(max-width: 767px)" srcSet="/brand/empire-logo-compact-80h.webp" />
            <img
              src="/brand/empire-logo-compact-120h.webp"
              width={491}
              height={120}
              alt="Empire Solar & Hardware"
              fetchPriority="high"
            />
          </picture>
        </Link>

        <nav className={styles.nav} aria-label="Main">
          <div
            ref={menuRef}
            className={styles.menuWrap}
            onMouseEnter={hoverOpen}
            onMouseLeave={hoverClose}
          >
            <button
              type="button"
              className={styles.navLink}
              aria-expanded={open}
              aria-controls="mega-menu"
              onClick={() => setOpen((o) => !o)}
            >
              Catalogue <ChevronDown size={16} aria-hidden="true" className={open ? styles.flip : ""} />
            </button>
            <div id="mega-menu" className={styles.mega} hidden={!open}>
              <ul className={styles.megaGrid}>
                {departments.map((d) => (
                  <li key={d.slug} className={styles.megaItem}>
                    <Link href={`/catalogue/${d.slug}`} className={styles.megaSign}>
                      <AisleSign size="sm">{d.name}</AisleSign>
                    </Link>
                    <ul className={styles.megaCats}>
                      {d.top.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/catalogue/${d.slug}/${c.slug}`}>{c.name}</Link>
                        </li>
                      ))}
                      <li>
                        <Link href={`/catalogue/${d.slug}`} className={styles.megaAll}>
                          All {d.name}
                        </Link>
                      </li>
                    </ul>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <Link
            href="/contact"
            className={styles.navLink}
            aria-current={pathname === "/contact" ? "page" : undefined}
          >
            Contact
          </Link>
        </nav>

        <div className={styles.search}>
          <SearchBox
            id="header-search"
            variant="header"
            label="Search products, brands or codes"
            placeholder="Search products, brands or codes"
            shortcut
          />
        </div>

        <Link href="/search" className={styles.searchLink} aria-label="Search">
          <Search size={22} aria-hidden="true" />
        </Link>
        <ListButton className={styles.listBtn} />
      </div>
    </header>
  );
}
