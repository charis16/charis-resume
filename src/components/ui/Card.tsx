import { type ElementType, type ReactNode } from "react";

type CardProps<T extends ElementType> = {
  as?: T;
  className?: string;
  children: ReactNode;
};

export function Card<T extends ElementType = "section">({
  as,
  className,
  children,
}: CardProps<T>) {
  const Component = (as ?? "section") as ElementType;

  return (
    <Component
      className={[
        "rounded-[var(--radius)] border border-outline-variant bg-surface-container-lowest shadow-[var(--shadow-ambient)] transition-shadow hover:shadow-[var(--shadow-hover)]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}>
      {children}
      {children}
    </Component>
  );
}
