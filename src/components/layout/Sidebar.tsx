import {
  Award,
  Bolt,
  BriefcaseBusiness,
  GraduationCap,
  Mail,
  Link2,
  User,
} from "lucide-react";
import Image from "next/image";
import { type ProfileLink } from "@/data/profile";
import { type Locale } from "@/i18n/locale";
import { t } from "@/i18n/messages";
import { type ReactNode } from "react";
import { DownloadResumeButton } from "@/components/layout/DownloadResumeButton";

type SidebarProps = {
  name: string;
  role: string;
  tagline: string;
  links: ProfileLink[];
  avatarUrl?: string;
  locale: Locale;
};

function initials(name: string) {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  const letters = parts.map((p) => p[0]?.toUpperCase()).join("");
  return letters || "U";
}

export function Sidebar({
  name,
  role,
  tagline,
  links,
  avatarUrl,
  locale,
}: SidebarProps) {
  const emailLink = links.find(
    (l) => l.href.startsWith("mailto:") || l.label.toLowerCase() === "email",
  );
  const emailText = emailLink?.href.startsWith("mailto:")
    ? emailLink.href.replace("mailto:", "")
    : emailLink?.href;
  const linkedin = links.find((l) =>
    l.label.toLowerCase().includes("linkedin"),
  );

  return (
    <div className='space-y-6'>
      <div className='glass-card overflow-hidden rounded-xl shadow-card'>
        <div
          className='relative h-24 bg-primary-container'
          style={{ background: "linear-gradient(to right, #0077b5, #005d8f)" }}>
          <div className='absolute -bottom-12 left-1/2 -translate-x-1/2'>
            {avatarUrl ? (
              <Image
                alt={name}
                src={avatarUrl}
                width={96}
                height={96}
                sizes='96px'
                className='h-24 w-24 rounded-2xl border-4 border-white bg-white object-cover shadow-lg'
              />
            ) : (
              <div className='grid h-24 w-24 place-items-center rounded-2xl border-4 border-white bg-white shadow-lg'>
                <span className='text-xl font-bold text-on-surface'>
                  {initials(name)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className='border-b border-outline-variant/20 px-6 pb-6 pt-16 text-center'>
          <h1 className='text-xl font-bold text-on-surface'>{name}</h1>
          <p className='mt-1 text-sm font-semibold text-primary-container'>
            {role}
          </p>
          <p className='mt-3 text-[12px] italic leading-relaxed text-on-surface-variant'>
            {tagline}
          </p>
          <DownloadResumeButton locale={locale} />
        </div>

        <nav className='flex flex-col py-2'>
          <SidebarNavItem
            href='#about'
            icon={<User className='h-5 w-5' />}>
            {t(locale, "navAbout")}
          </SidebarNavItem>
          <SidebarNavItem
            href='#experience'
            icon={<BriefcaseBusiness className='h-5 w-5' />}>
            {t(locale, "navExperience")}
          </SidebarNavItem>
          <SidebarNavItem
            href='#skills'
            icon={<Bolt className='h-5 w-5' />}>
            {t(locale, "navSkills")}
          </SidebarNavItem>
          <SidebarNavItem
            href='#certifications'
            icon={<Award className='h-5 w-5' />}>
            {t(locale, "navCertifications")}
          </SidebarNavItem>
          <SidebarNavItem
            href='#education'
            icon={<GraduationCap className='h-5 w-5' />}>
            {t(locale, "navEducation")}
          </SidebarNavItem>
        </nav>
      </div>

      <div
        className='glass-card space-y-4 rounded-xl p-6 shadow-card'
        id='contact'>
        <div className='flex items-start gap-3'>
          <Mail className='mt-0.5 h-5 w-5 text-primary-container' />
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase text-on-surface-variant'>
              {t(locale, "contactEmail")}
            </p>
            {emailLink?.href ? (
              <a
                className='block truncate text-sm font-medium text-on-surface transition-colors hover:text-primary-container'
                href={
                  emailLink.href.startsWith("mailto:")
                    ? emailLink.href
                    : `mailto:${emailLink.href}`
                }>
                {emailText ?? "-"}
              </a>
            ) : (
              <p className='truncate text-sm font-medium text-on-surface'>-</p>
            )}
          </div>
        </div>
        <div className='flex items-start gap-3'>
          <Link2 className='mt-0.5 h-5 w-5 text-primary-container' />
          <div className='min-w-0'>
            <p className='text-[10px] font-bold uppercase text-on-surface-variant'>
              {t(locale, "contactLinkedIn")}
            </p>
            {linkedin ? (
              <a
                className='block truncate text-sm font-medium transition-colors hover:text-primary-container'
                href={linkedin.href}
                target='_blank'
                rel='noreferrer'>
                {linkedin.href
                  .replace(/^https?:\/\//, "")
                  .replace(/^www\./, "")}
              </a>
            ) : (
              <p className='truncate text-sm font-medium text-on-surface'>-</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function SidebarNavItem({
  href,
  icon,
  children,
}: {
  href: string;
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <a
      href={href}
      className='flex items-center gap-3 px-6 py-3.5 text-sm font-medium text-on-surface-variant transition-all hover:bg-black/5'>
      <span
        className='text-primary-container'
        aria-hidden>
        {icon}
      </span>
      <span>{children}</span>
    </a>
  );
}
