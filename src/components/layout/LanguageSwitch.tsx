"use client";

import { LANG_COOKIE, type Locale } from "@/i18n/locale";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

type LanguageSwitchProps = {
  locale: Locale;
};

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const router = useRouter();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LANG_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      router.refresh();
    },
    [router],
  );

  return (
    <div className="flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest/70 p-1">
      <button
        type="button"
        onClick={() => setLocale("id")}
        className={[
          "h-8 rounded-full px-3 text-xs font-bold tracking-wider transition-colors",
          locale === "id"
            ? "bg-primary-container text-white shadow-sm"
            : "text-on-surface-variant hover:bg-surface-container-low",
        ].join(" ")}
      >
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={[
          "h-8 rounded-full px-3 text-xs font-bold tracking-wider transition-colors",
          locale === "en"
            ? "bg-primary-container text-white shadow-sm"
            : "text-on-surface-variant hover:bg-surface-container-low",
        ].join(" ")}
      >
        EN
      </button>
    </div>
  );
}

