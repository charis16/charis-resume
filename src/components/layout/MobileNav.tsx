import { BadgeCheck, Bolt, BriefcaseBusiness, Home } from "lucide-react";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";

type MobileNavProps = {
  locale: Locale;
};

export function MobileNav({ locale }: MobileNavProps) {
  return (
    <nav className='glass-card fixed bottom-0 left-0 z-50 flex w-full justify-around border-t border-outline-variant/30 py-2.5 shadow-glass md:hidden'>
      <a
        className='flex flex-col items-center text-primary-container'
        href='#'>
        <Home className='h-[22px] w-[22px]' />
        <span className='mt-0.5 text-[10px] font-bold'>
          {t(locale, "home")}
        </span>
      </a>
      <a
        className='flex flex-col items-center text-on-surface-variant'
        href='#experience'>
        <BriefcaseBusiness className='h-[22px] w-[22px]' />
        <span className='mt-0.5 text-[10px] font-bold'>
          {t(locale, "expShort")}
        </span>
      </a>
      <a
        className='flex flex-col items-center text-on-surface-variant'
        href='#skills'>
        <Bolt className='h-[22px] w-[22px]' />
        <span className='mt-0.5 text-[10px] font-bold'>
          {t(locale, "navSkills")}
        </span>
      </a>
      <a
        className='flex flex-col items-center text-on-surface-variant'
        href='#certifications'>
        <BadgeCheck className='h-[22px] w-[22px]' />
        <span className='mt-0.5 text-[10px] font-bold'>
          {t(locale, "certShort")}
        </span>
      </a>
    </nav>
  );
}
