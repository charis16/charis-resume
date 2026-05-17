import { type ReactNode } from "react";

type SectionHeadingProps = {
  children: ReactNode;
  className?: string;
};

export function SectionHeading({ children, className }: SectionHeadingProps) {
  return (
    <div
      className={["flex items-center gap-3", className]
        .filter(Boolean)
        .join(" ")}>
      <span
        className='h-6 w-1.5 rounded-full bg-primary-container'
        style={{ background: "linear-gradient(to right, #0077b5, #005d8f)" }}
        aria-hidden
      />
      <h2 className='text-sm font-bold uppercase tracking-wider text-on-surface'>
        {children}
      </h2>
    </div>
  );
}
