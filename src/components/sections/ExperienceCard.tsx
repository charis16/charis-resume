import { Card } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";
import { type Experience } from "@/data/profile";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";
import { pickArray } from "@/i18n/value";

type ExperienceCardProps = {
  items: Experience[];
  locale: Locale;
};

export function ExperienceCard({ items, locale }: ExperienceCardProps) {
  return (
    <Card className='p-6'>
      <h2 className='text-sm font-semibold text-on-surface'>
        {t(locale, "navExperience")}
      </h2>
      <div className='mt-4'>
        {items.map((item, idx) => {
          const highlights = pickArray(locale, item.highlights);

          return (
            <div key={`${item.company}-${item.role}-${item.start}`}>
              {idx > 0 ? <Divider className='my-4' /> : null}
              <div className='flex flex-col gap-2'>
                <div className='flex flex-col gap-0.5 md:flex-row md:items-baseline md:justify-between'>
                  <div className='min-w-0'>
                    <p className='text-sm font-semibold text-on-surface md:text-base'>
                      {item.role}
                    </p>
                    <p className='text-sm text-on-surface-variant'>
                      {item.company} • {item.location}
                    </p>
                  </div>
                  <p className='text-xs font-semibold text-on-surface-variant md:text-sm'>
                    {item.start} — {item.end}
                  </p>
                </div>
                <ul className='list-disc pl-4 text-sm leading-6 text-on-surface'>
                  {highlights.map((h) => (
                    <li
                      key={h}
                      className='pl-1'>
                      {h}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
