import { SectionTitle } from "@/components/ui/SectionTitle";
import { TypingText } from "@/components/ui/TypingText";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";

type AboutMeCardProps = {
  about: string;
  locale: Locale;
};

export function AboutMeCard({ about, locale }: AboutMeCardProps) {
  return (
    <section
      className='glass-card rounded-xl p-8 shadow-card'
      id='about'>
      <SectionTitle
        prefix={t(locale, "aboutMePrefix")}
        highlight={t(locale, "aboutMeHighlight")}
        className='mb-6'
      />
      <TypingText
        text={about}
        className='text-[15px] leading-relaxed text-on-surface-variant'
        speedMs={14}
        startDelayMs={150}
      />
    </section>
  );
}
