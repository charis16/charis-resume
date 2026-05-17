import { PrintToolbar } from "@/components/PrintToolbar";
import { getProfile } from "@/data/profile-store";
import { getLocale } from "@/i18n/server-locale";
import { t } from "@/i18n/messages";
import { pick, pickArray } from "@/i18n/value";
import Image from "next/image";

type PrintPageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function PrintPage({ searchParams }: PrintPageProps) {
  const locale = await getLocale();
  const profile = await getProfile();
  const sp = await Promise.resolve(searchParams);
  const autoPrint = sp?.download === "1";
  const emailHref = profile.links.find((l) =>
    l.href.startsWith("mailto:"),
  )?.href;
  const emailText = emailHref?.replace("mailto:", "");
  const linkedinHref = profile.links.find((l) =>
    l.label.toLowerCase().includes("linkedin"),
  )?.href;

  return (
    <div className='min-h-full bg-white text-[#111]'>
      <PrintToolbar autoPrint={autoPrint} />
      <main className='mx-auto w-full max-w-[980px] px-6 py-8 print:max-w-none print:px-10 print:py-10'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-[300px_1fr] print:grid-cols-[300px_1fr] print:gap-10'>
          <aside className='space-y-8'>
            <div className='rounded-2xl bg-[#f4f4f4] p-7 print:rounded-none'>
              <div className='flex justify-center'>
                {profile.avatarUrl ? (
                  <Image
                    src={profile.avatarUrl}
                    alt={profile.name}
                    width={176}
                    height={176}
                    sizes='176px'
                    className='h-44 w-44 rounded-full object-cover'
                  />
                ) : (
                  <div className='grid h-44 w-44 place-items-center rounded-full bg-white text-3xl font-extrabold'>
                    {profile.name
                      .split(/\s+/)
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((p) => p[0]?.toUpperCase())
                      .join("")}
                  </div>
                )}
              </div>

              <div className='mt-8'>
                <h2 className='text-xl font-extrabold tracking-tight'>
                  Profile Info
                </h2>
                <div className='mt-3 h-px w-full bg-black/50' />
                <p className='mt-4 text-[12.5px] leading-6 text-black/80'>
                  {pick(locale, profile.about)}
                </p>
                <p className='mt-5 text-[12.5px] font-semibold text-black/70'>
                  {profile.location}
                </p>
              </div>
            </div>

            <div className='rounded-2xl bg-[#f4f4f4] p-7 print:rounded-none'>
              <h2 className='text-xl font-extrabold tracking-tight'>Skills</h2>
              <div className='mt-3 h-px w-full bg-black/50' />
              <ul className='mt-4 space-y-2 text-[12.5px] font-semibold text-black/70'>
                {profile.skills.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          </aside>

          <section>
            <header className='border-b border-black/70 pb-5'>
              <h1 className='text-[34px] font-extrabold leading-[1.05] tracking-tight'>
                {profile.name}
              </h1>
              <p className='mt-2 text-[12px] font-bold uppercase tracking-[0.28em] text-black/70'>
                {profile.headline}
              </p>

              <div className='mt-5 grid grid-cols-2 gap-6 text-[12px] text-black/70'>
                <div>
                  <p className='text-[11px] font-extrabold tracking-wide text-black/60'>
                    {t(locale, "contactEmail")}
                  </p>
                  {emailHref ? (
                    <a
                      className='mt-1 block break-all font-semibold text-black/75 underline'
                      href={emailHref}>
                      {emailText ?? emailHref}
                    </a>
                  ) : (
                    <p className='mt-1 font-semibold text-black/75'>-</p>
                  )}
                </div>
                <div>
                  <p className='text-[11px] font-extrabold tracking-wide text-black/60'>
                    {t(locale, "contactLinkedIn")}
                  </p>
                  {linkedinHref ? (
                    <a
                      className='mt-1 block break-all font-semibold text-black/75 underline'
                      href={linkedinHref}>
                      {linkedinHref
                        .replace(/^https?:\/\//, "")
                        .replace(/^www\./, "")}
                    </a>
                  ) : (
                    <p className='mt-1 font-semibold text-black/75'>-</p>
                  )}
                </div>
              </div>
            </header>

            <div className='mt-8'>
              <h2 className='text-2xl font-extrabold tracking-tight'>
                Experience
              </h2>
              <div className='mt-3 h-px w-full bg-black/60' />

              <div className='mt-6 space-y-7'>
                {profile.experience.map((item) => (
                  <div key={`${item.company}-${item.role}-${item.start}`}>
                    <div className='flex items-baseline justify-between gap-6'>
                      <div className='min-w-0'>
                        <p className='text-[14px] font-extrabold text-black/85'>
                          {item.role}
                        </p>
                        <p className='mt-1 text-[12px] font-semibold text-black/70'>
                          {item.company} | {item.location}
                        </p>
                      </div>
                      <p className='shrink-0 text-[12px] font-semibold text-black/65'>
                        {item.start} -{" "}
                        {item.current || !item.end
                          ? t(locale, "present")
                          : item.end}
                      </p>
                    </div>

                    <ul className='mt-3 list-disc space-y-1 pl-5 text-[12.5px] leading-6 text-black/80'>
                      {pickArray(locale, item.highlights).map((h) => (
                        <li key={h}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-10'>
              <h2 className='text-2xl font-extrabold tracking-tight'>
                Educations
              </h2>
              <div className='mt-3 h-px w-full bg-black/60' />

              <div className='mt-6 space-y-6'>
                {profile.education.map((e) => (
                  <div key={`${e.school}-${e.start}-${e.end}`}>
                    <div className='flex items-baseline justify-between gap-6'>
                      <div className='min-w-0'>
                        <p className='text-[14px] font-extrabold text-black/85'>
                          {e.major}
                        </p>
                        <p className='mt-1 text-[12px] font-semibold text-black/70'>
                          {e.school}
                        </p>
                      </div>
                      <p className='shrink-0 text-[12px] font-semibold text-black/65'>
                        {e.start} - {e.end}
                      </p>
                    </div>
                    {e.note ? (
                      <p className='mt-2 text-[12.5px] leading-6 text-black/80'>
                        {e.note}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>

            <div className='mt-10 rounded-xl border border-black/15 bg-white p-5'>
              <p className='text-[12.5px] leading-6 text-black/80'>
                {pick(locale, profile.summary)}
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
