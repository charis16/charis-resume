type DividerProps = {
  className?: string;
};

export function Divider({ className }: DividerProps) {
  return (
    <hr
      className={["border-0 border-t border-outline-variant", className]
        .filter(Boolean)
        .join(" ")}
    />
  );
}
