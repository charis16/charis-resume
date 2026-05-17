import { type ReactNode } from "react";

type BadgeProps = {
  children: ReactNode;
  className?: string;
};

export function Badge({ children, className }: BadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full bg-secondary-container px-2.5 py-1 text-xs font-semibold leading-4 text-primary-container",
        className,
      ]
        .filter(Boolean)
        .join(" ")}>
      {children}
    </span>
  );
}
