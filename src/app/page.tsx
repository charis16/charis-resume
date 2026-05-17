import { MobileNav } from "@/components/layout/MobileNav";
import { Sidebar } from "@/components/layout/Sidebar";
import { TopNav } from "@/components/layout/TopNav";
import { AboutMeCard } from "@/components/sections/AboutMeCard";
import { CertificationsCard } from "@/components/sections/CertificationsCard";
import { EducationPanelCard } from "@/components/sections/EducationPanelCard";
import { ExperienceTimelineCard } from "@/components/sections/ExperienceTimelineCard";
import { SkillsPanelCard } from "@/components/sections/SkillsPanelCard";
import { Reveal } from "@/components/ui/Reveal";
import { getProfile } from "@/data/profile-store";
import { getLocale } from "@/i18n/server-locale";
import { pick } from "@/i18n/value";

export default async function Home() {
  const locale = await getLocale();
  const profile = await getProfile();
  const hireHref =
    profile.links.find((l) => l.href.startsWith("mailto:"))?.href ?? "#contact";

  return (
    <div className='min-h-full bg-background text-on-surface antialiased'>
      <TopNav
        name={profile.name}
        role={profile.headline}
        hireHref={hireHref}
        locale={locale}
      />
      <main className='mx-auto max-w-[var(--container-max)] pb-24 pt-24 max-md:px-[var(--margin-mobile)] md:px-[var(--gutter)]'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
          <aside className='space-y-6 md:col-span-4 md:sticky md:top-24 md:self-start md:max-h-[calc(100vh-6rem)] md:overflow-auto lg:col-span-3'>
            <Reveal delayMs={0}>
              <Sidebar
                name={profile.name}
                role={profile.headline}
                tagline={pick(locale, profile.summary)}
                links={profile.links}
                avatarUrl={profile.avatarUrl}
                locale={locale}
              />
            </Reveal>
          </aside>

          <div className='space-y-6 md:col-span-8 lg:col-span-9'>
            <Reveal delayMs={60}>
              <AboutMeCard
                locale={locale}
                about={pick(locale, profile.about)}
              />
            </Reveal>
            <Reveal delayMs={120}>
              <ExperienceTimelineCard
                locale={locale}
                items={profile.experience}
              />
            </Reveal>
            <Reveal delayMs={180}>
              <SkillsPanelCard
                locale={locale}
                items={profile.skills}
              />
            </Reveal>
            <Reveal delayMs={240}>
              <CertificationsCard
                locale={locale}
                items={profile.certifications}
              />
            </Reveal>
            <Reveal delayMs={300}>
              <EducationPanelCard
                locale={locale}
                items={profile.education}
              />
            </Reveal>
          </div>
        </div>
      </main>
      <MobileNav locale={locale} />
    </div>
  );
}
