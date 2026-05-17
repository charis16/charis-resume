import { SectionTitle } from "@/components/ui/SectionTitle";
import { type Experience } from "@/data/profile";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";
import { pickArray } from "@/i18n/value";

type ExperienceTimelineCardProps = {
  items: Experience[];
  locale: Locale;
};

export function ExperienceTimelineCard({
  items,
  locale,
}: ExperienceTimelineCardProps) {
  return (
    <section
      className='glass-card rounded-xl p-8 shadow-card'
      id='experience'>
      <SectionTitle
        prefix={t(locale, "professionalPrefix")}
        highlight={t(locale, "experienceHighlight")}
        className='mb-8'
      />

      <div className='space-y-10'>
        {items.map((item, idx) => {
          const isFirst = idx === 0;
          const hasLine = idx < items.length - 1;
          const highlights = pickArray(locale, item.highlights);
          const isCurrent = Boolean(item.current) || !item.end;
          const endLabel = isCurrent ? t(locale, "present") : item.end;

          return (
            <div
              key={`${item.company}-${item.role}-${item.start}`}
              className={["relative pl-8", hasLine ? "timeline-line" : ""]
                .filter(Boolean)
                .join(" ")}>
              <div
                className={[
                  "absolute left-0 top-1.5 h-4 w-4 rounded-full z-10",
                  isFirst
                    ? "bg-primary-container ring-4 ring-primary-container/20"
                    : "bg-outline-variant",
                ].join(" ")}
                style={
                  isFirst
                    ? {
                        background:
                          "linear-gradient(to right, #0077b5, #005d8f)",
                      }
                    : undefined
                }
                aria-hidden
              />

              <div className='mb-1 flex flex-col justify-between gap-2 md:flex-row md:items-center'>
                <h3 className='text-lg font-bold text-on-surface'>
                  {item.role}
                </h3>
                <span
                  className={[
                    "rounded-full px-3 py-1 text-[11px] font-bold uppercase",
                    isFirst
                      ? "bg-primary-container/10 text-primary-container"
                      : "bg-surface-container-high text-on-surface-variant",
                  ].join(" ")}>
                  {item.start} - {endLabel}
                </span>
              </div>

              <p className='mb-3 text-sm font-semibold text-primary-container'>
                {item.company} | {item.location}
              </p>

              {highlights.length <= 1 ? (
                <p className='text-sm leading-relaxed text-on-surface-variant'>
                  {highlights[0]}
                </p>
              ) : (
                <div className='space-y-2'>
                  <p className='text-sm leading-relaxed text-on-surface-variant'>
                    {highlights[0]}
                  </p>
                  <ul className='ml-4 list-disc space-y-1 text-sm leading-relaxed text-on-surface-variant'>
                    {highlights.slice(1).map((h) => (
                      <li key={h}>{h}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
