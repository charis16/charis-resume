"use client";

import { LANG_COOKIE, type Locale } from "@/i18n/locale";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useCallback, useTransition } from "react";

type LanguageSwitchProps = {
  locale: Locale;
};

export function LanguageSwitch({ locale }: LanguageSwitchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const setLocale = useCallback(
    (next: Locale) => {
      document.cookie = `${LANG_COOKIE}=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
      startTransition(() => router.refresh());
    },
    [router, startTransition],
  );

  return (
    <div className="flex items-center gap-1 rounded-full border border-outline-variant/40 bg-surface-container-lowest/70 p-1">
      <button
        type="button"
        onClick={() => setLocale("id")}
        disabled={isPending}
        aria-busy={isPending}
        className={[
          "inline-flex h-8 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold tracking-wider transition-colors",
          locale === "id"
            ? "bg-primary-container text-white shadow-sm"
            : "text-on-surface-variant hover:bg-surface-container-low",
          isPending ? "opacity-60" : "",
        ].join(" ")}
      >
        {isPending && locale === "id" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        ID
      </button>
      <button
        type="button"
        onClick={() => setLocale("en")}
        disabled={isPending}
        aria-busy={isPending}
        className={[
          "inline-flex h-8 items-center justify-center gap-2 rounded-full px-3 text-xs font-bold tracking-wider transition-colors",
          locale === "en"
            ? "bg-primary-container text-white shadow-sm"
            : "text-on-surface-variant hover:bg-surface-container-low",
          isPending ? "opacity-60" : "",
        ].join(" ")}
      >
        {isPending && locale === "en" ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : null}
        EN
      </button>
    </div>
  );
}
