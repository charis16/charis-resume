import { Divider } from "@/components/ui/Divider";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { type Education } from "@/data/profile";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";

type EducationPanelCardProps = {
  items: Education[];
  locale: Locale;
};

export function EducationPanelCard({ items, locale }: EducationPanelCardProps) {
  return (
    <section
      className='glass-card rounded-xl p-8 shadow-card'
      id='education'>
      <SectionTitle
        highlight={t(locale, "education")}
        className='mb-8'
      />
      <div className='mt-5'>
        {items.map((e, idx) => (
          <div key={`${e.school}-${e.start}-${e.end}`}>
            {idx > 0 ? <Divider className='my-4' /> : null}
            <div className='flex flex-col gap-1'>
              <div className='flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between'>
                <div className='min-w-0'>
                  <p className='text-sm font-bold text-on-surface'>
                    {e.school}
                  </p>
                  <p className='text-sm text-on-surface-variant'>{e.major}</p>
                </div>
                <p className='text-xs font-semibold text-on-surface-variant'>
                  {e.start} - {e.end}
                </p>
              </div>
              {e.note ? (
                <p className='text-sm leading-7 text-on-surface-variant'>
                  {e.note}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
