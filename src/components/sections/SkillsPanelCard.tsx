import { SectionTitle } from "@/components/ui/SectionTitle";
import { Code2 } from "lucide-react";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";

type SkillsPanelCardProps = {
  items: string[];
  locale: Locale;
};

export function SkillsPanelCard({ items, locale }: SkillsPanelCardProps) {
  return (
    <section
      className='glass-card rounded-xl p-8 shadow-card'
      id='skills'>
      <div className='mb-8 flex items-center justify-between'>
        <SectionTitle
          prefix={t(locale, "skillsPrefix")}
          highlight={t(locale, "proficiencyHighlight")}
        />
      </div>

      <div>
        <h3 className='mb-4 flex items-center gap-2 text-sm font-bold text-on-surface'>
          <Code2 className='h-5 w-5 text-primary-container' />
          {t(locale, "technicalProficiency")}
        </h3>
        <div className='flex flex-wrap gap-2'>
          {items.map((s) => (
            <span
              key={s}
              className='cursor-default rounded-full border border-outline-variant/30 bg-surface-container-low px-4 py-1.5 text-[13px] font-medium text-on-surface-variant transition-all hover:bg-primary-container hover:text-white'>
              {s}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
