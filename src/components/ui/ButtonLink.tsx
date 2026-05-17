import Link from "next/link";
import { type ReactNode } from "react";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  className?: string;
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className,
}: ButtonLinkProps) {
  const base =
    "inline-flex h-10 items-center justify-center gap-2 rounded-[var(--radius)] px-4 text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container";
  const styles =
    variant === "primary"
      ? "bg-primary-container text-on-primary hover:bg-surface-tint"
      : "border border-primary-container text-primary-container hover:bg-surface-container-low";

  return (
    <Link
      href={href}
      className={[base, styles, className].filter(Boolean).join(" ")}>
      {children}
    </Link>
  );
}
