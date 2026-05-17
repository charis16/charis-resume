import { getProfile } from "@/data/profile-store";
import {
  ADMIN_COOKIE,
  validateAdminSessionToken,
} from "@/data/admin-auth-store";
import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminEditor } from "./AdminEditor";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAuthed = await validateAdminSessionToken(token);
  if (!isAuthed) redirect("/admin/login");

  const profile = await getProfile();
  const menu = [
    { label: "Kontak", href: "#contact" },
    { label: "About", href: "#about" },
    { label: "Skills", href: "#skills" },
    { label: "Experience", href: "#experience" },
    { label: "Certifications", href: "#certifications" },
    { label: "Education", href: "#education" },
  ];

  return (
    <main className='mx-auto w-full max-w-[var(--container-max)] px-[var(--gutter)] py-8 max-md:px-[var(--margin-mobile)]'>
      <div className='glass-card rounded-2xl border border-outline-variant/30 p-6 shadow-card md:p-8'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div className='flex min-w-0 flex-col gap-1'>
            <h1 className='text-xl font-bold text-on-surface'>Editor Resume</h1>
            <p className='text-sm text-on-surface-variant'>
              Perubahan disimpan ke file{" "}
              <span className='font-semibold'>src/data/profile.store.json</span>
              .
            </p>
          </div>
          <div className='flex shrink-0 items-center gap-2'>
            <Link
              href='/admin/settings'
              className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm font-bold text-on-surface-variant hover:border-outline-variant/70'>
              Admin
            </Link>
            <Link
              href='/'
              className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm font-bold text-on-surface-variant hover:border-outline-variant/70'>
              Lihat Resume
            </Link>
            <a
              href='/api/admin/logout'
              className='inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm font-bold text-on-surface-variant hover:border-error hover:text-error'>
              Logout
            </a>
          </div>
        </div>
        <nav className='mt-6 flex gap-2 overflow-x-auto pb-2 lg:hidden'>
          {menu.map((m) => (
            <a
              key={m.href}
              href={m.href}
              className='shrink-0 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-xs font-bold text-on-surface-variant'>
              {m.label}
            </a>
          ))}
        </nav>

        <div className='mt-4 grid gap-6 lg:grid-cols-[220px_1fr]'>
          <aside className='hidden lg:block'>
            <div className='sticky top-6 rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-4'>
              <p className='text-xs font-bold uppercase tracking-widest text-on-surface-variant'>
                Menu
              </p>
              <div className='mt-3 flex flex-col gap-2'>
                {menu.map((m) => (
                  <a
                    key={m.href}
                    href={m.href}
                    className='rounded-xl border border-transparent px-3 py-2 text-sm font-semibold text-on-surface-variant hover:border-outline-variant/40 hover:bg-surface-container-low'>
                    {m.label}
                  </a>
                ))}
              </div>
            </div>
          </aside>
          <div>
            <AdminEditor initialProfile={profile} />
          </div>
        </div>
      </div>
    </main>
  );
}
