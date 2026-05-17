import { type Locale } from "@/i18n/locale";

export type LocalizedString = {
  id: string;
  en: string;
};

export type LocalizedStringArray = {
  id: string[];
  en: string[];
};

export function pick(locale: Locale, value: LocalizedString): string {
  return value[locale];
}

export function pickArray(locale: Locale, value: LocalizedStringArray): string[] {
  return value[locale];
}

