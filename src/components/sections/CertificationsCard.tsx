import { SectionTitle } from "@/components/ui/SectionTitle";
import { type Certification } from "@/data/profile";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";

type CertificationsCardProps = {
  locale: Locale;
  items: Certification[];
};

export function CertificationsCard({ locale, items }: CertificationsCardProps) {
  return (
    <section
      className='glass-card rounded-xl p-8 shadow-card'
      id='certifications'>
      <SectionTitle
        highlight={t(locale, "certifications")}
        className='mb-8'
      />
      {items.length === 0 ? (
        <p className='mt-4 text-sm leading-7 text-on-surface-variant'>
          {t(locale, "certPlaceholder")}
        </p>
      ) : (
        <div className='space-y-4'>
          {items.map((c) => {
            const meta = [c.issuer, c.date].filter(Boolean).join(" • ");
            const key = `${c.title}-${c.issuer ?? ""}-${c.date ?? ""}-${c.url ?? ""}`;
            return (
              <div
                key={key}
                className='rounded-xl border border-outline-variant/20 bg-surface-container-low p-4'>
                <p className='text-sm font-bold text-on-surface'>{c.title}</p>
                {meta ? (
                  <p className='mt-1 text-sm text-on-surface-variant'>{meta}</p>
                ) : null}
                {c.url ? (
                  <a
                    className='mt-2 block truncate text-sm font-semibold text-primary-container hover:underline'
                    href={c.url}
                    target='_blank'
                    rel='noreferrer'>
                    {c.url}
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
