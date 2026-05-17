"use client";

import {
  type ElementType,
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

type TypingTextProps<T extends ElementType> = {
  as?: T;
  text: string;
  className?: string;
  speedMs?: number;
  startDelayMs?: number;
  caret?: boolean;
  children?: ReactNode;
};

export function TypingText<T extends ElementType = "p">({
  as,
  text,
  className,
  speedMs = 16,
  startDelayMs = 150,
  caret = true,
}: TypingTextProps<T>) {
  const Component = (as ?? "p") as ElementType;
  const [count, setCount] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(Boolean(media.matches));
    onChange();
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    let intervalId: number | undefined;
    const resetId = window.setTimeout(() => {
      setCount(0);
    }, 0);
    const startId = window.setTimeout(() => {
      intervalId = window.setInterval(() => {
        setCount((prev) => {
          const next = prev + 1;
          return next >= text.length ? text.length : next;
        });
      }, speedMs);
    }, startDelayMs);

    return () => {
      window.clearTimeout(resetId);
      window.clearTimeout(startId);
      if (intervalId) window.clearInterval(intervalId);
    };
  }, [reducedMotion, speedMs, startDelayMs, text]);

  const visible = useMemo(
    () => (reducedMotion ? text : text.slice(0, count)),
    [count, reducedMotion, text],
  );
  const showCaret = caret && !reducedMotion && count < text.length;

  return (
    <Component
      className={[className, showCaret ? "typing-caret" : ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={text}>
      <span aria-hidden>{visible}</span>
    </Component>
  );
}
