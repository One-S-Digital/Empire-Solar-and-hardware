import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type Variant = "primary" | "secondary" | "link";

type CommonProps = {
  variant?: Variant;
  children: ReactNode;
  className?: string;
};

type LinkProps = CommonProps & { href: string; external?: boolean };
type NativeProps = CommonProps & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

export function Button(props: LinkProps | NativeProps) {
  const { variant = "primary", className, children } = props;
  const cls = [styles.btn, styles[variant], className ?? ""].join(" ").trim();

  if (props.href !== undefined) {
    const { href, external } = props as LinkProps;
    if (external || href.startsWith("tel:") || href.startsWith("mailto:") || href.startsWith("http")) {
      return (
        <a
          className={cls}
          href={href}
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {children}
        </a>
      );
    }
    return (
      <Link className={cls} href={href}>
        {children}
      </Link>
    );
  }

  const { variant: _v, className: _c, children: _ch, href: _h, ...rest } = props as NativeProps;
  return (
    <button className={cls} type="button" {...rest}>
      {children}
    </button>
  );
}
