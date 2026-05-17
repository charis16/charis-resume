"use client";

import { LanguageSwitch } from "@/components/layout/LanguageSwitch";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";
import { useEffect, useState } from "react";

type TopNavProps = {
  name: string;
  role: string;
  hireHref: string;
  locale: Locale;
};

export function TopNav({ name, role, hireHref, locale }: TopNavProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className='fixed left-0 top-0 z-50 w-full pt-[calc(env(safe-area-inset-top)+10px)] md:pt-0'>
      <div
        className={[
          "mx-auto flex h-14 max-w-[var(--container-max)] items-center justify-between gap-3 rounded-full border px-3 backdrop-blur-xl md:hidden",
          scrolled
            ? "border-outline-variant/30 bg-white/85 shadow-sm"
            : "border-outline-variant/20 bg-white/70 shadow-none",
        ].join(" ")}>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div
            className='flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-container'
            style={{
              background: "linear-gradient(to right, #0077b5, #005d8f)",
            }}>
            <span className='text-lg font-bold text-white'>M</span>
          </div>
          <div className='min-w-0'>
            <span className='block truncate text-[15px] font-bold leading-none text-primary-container'>
              {name}
            </span>
            <span className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant max-[360px]:hidden'>
              {role}
            </span>
          </div>
        </div>

        <div className='flex shrink-0 items-center gap-2'>
          <LanguageSwitch locale={locale} />
          <a
            href={hireHref}
            className='shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-xs font-semibold text-white shadow-md'
            style={{
              background: "linear-gradient(to right, #0077b5, #005d8f)",
            }}>
            {t(locale, "hireMe")}
          </a>
        </div>
      </div>

      <div
        className={[
          "mx-auto mt-3 hidden h-16 max-w-[var(--container-max)] items-center justify-between px-[var(--gutter)] transition-all md:flex",
          scrolled
            ? "glass-card rounded-full border border-outline-variant/30 shadow-sm"
            : "bg-transparent",
        ].join(" ")}>
        <div className='flex min-w-0 flex-1 items-center gap-3'>
          <div
            className='flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-container'
            style={{
              background: "linear-gradient(to right, #0077b5, #005d8f)",
            }}>
            <span className='text-xl font-bold text-white'>M</span>
          </div>
          <div className='min-w-0'>
            <span className='block truncate text-lg font-bold leading-none text-primary-container'>
              {name}
            </span>
            <span className='text-[10px] font-bold uppercase tracking-widest text-on-surface-variant'>
              {role}
            </span>
          </div>
        </div>

        <nav className='hidden items-center gap-8 md:flex'>
          <a
            className='text-sm font-medium text-on-surface-variant transition-colors hover:text-primary-container'
            href='#experience'>
            {t(locale, "navExperience")}
          </a>
          <a
            className='text-sm font-medium text-on-surface-variant transition-colors hover:text-primary-container'
            href='#skills'>
            {t(locale, "navSkills")}
          </a>
          <LanguageSwitch locale={locale} />
          <a
            className='shrink-0 whitespace-nowrap rounded-full px-6 py-2 text-sm font-semibold text-white shadow-md transition-all'
            href={hireHref}
            style={{
              background: "linear-gradient(to right, #0077b5, #005d8f)",
            }}>
            {t(locale, "hireMe")}
          </a>
        </nav>
      </div>
    </header>
  );
}
