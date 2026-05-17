import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, validateAdminSessionToken } from "@/data/admin-auth-store";
import { ChangePasswordForm } from "./ChangePasswordForm";

type AdminSettingsPageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminSettingsPage({ searchParams }: AdminSettingsPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAuthed = await validateAdminSessionToken(token);
  if (!isAuthed) redirect("/admin/login");

  const sp = await Promise.resolve(searchParams);
  const success = sp?.success === "1";
  const error =
    typeof sp?.error === "string" ? sp?.error : undefined;

  return (
    <main className="mx-auto w-full max-w-[var(--container-max)] px-[var(--gutter)] py-8 max-md:px-[var(--margin-mobile)]">
      <div className="glass-card rounded-2xl border border-outline-variant/30 p-6 shadow-card md:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="text-xl font-bold text-on-surface">Admin</h1>
            <p className="text-sm text-on-surface-variant">Pengaturan admin.</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/admin"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm font-bold text-on-surface-variant hover:border-outline-variant/70"
            >
              Edit Resume
            </Link>
            <a
              href="/api/admin/logout"
              className="inline-flex h-10 items-center justify-center whitespace-nowrap rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-4 text-sm font-bold text-on-surface-variant hover:border-error hover:text-error"
            >
              Logout
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-6">
          <section className="rounded-2xl border border-outline-variant/30 bg-surface-container-lowest/70 p-5">
            <div className="flex flex-col gap-1">
              <h2 className="text-sm font-bold tracking-wider text-on-surface">Ganti Password</h2>
              <p className="text-sm text-on-surface-variant">
                Password baru minimal 8 karakter.
              </p>
            </div>

            {success ? (
              <div className="mt-4 rounded-xl border border-outline-variant/30 bg-surface-container-low px-4 py-3">
                <p className="text-sm font-semibold text-primary-container">Password berhasil diganti.</p>
              </div>
            ) : null}
            {error ? (
              <div className="mt-4 rounded-xl border border-error/30 bg-error-container/50 px-4 py-3">
                <p className="text-sm font-semibold text-error">{error}</p>
              </div>
            ) : null}

            <ChangePasswordForm />
          </section>
        </div>
      </div>
    </main>
  );
}
