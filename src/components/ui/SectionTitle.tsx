import { type ReactNode } from "react";

type SectionTitleProps = {
  prefix?: ReactNode;
  highlight: ReactNode;
  className?: string;
};

export function SectionTitle({ prefix, highlight, className }: SectionTitleProps) {
  return (
    <h2
      className={[
        "text-[22px] font-extrabold leading-[1.12] tracking-tight text-on-surface md:text-[28px]",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {prefix ? <span className="mr-3">{prefix}</span> : null}
      <span
        className="bg-gradient-to-r from-primary-container to-primary bg-clip-text text-transparent"
      >
        {highlight}
      </span>
    </h2>
  );
}
