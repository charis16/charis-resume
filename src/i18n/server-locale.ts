import "server-only";

import { cookies } from "next/headers";
import { LANG_COOKIE, type Locale } from "@/i18n/locale";

function parseLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : "id";
}

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  return parseLocale(store.get(LANG_COOKIE)?.value);
}

