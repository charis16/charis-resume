import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  validateAdminSessionToken,
} from "@/data/admin-auth-store";

type AdminLoginPageProps = {
  searchParams?:
    | Promise<Record<string, string | string[] | undefined>>
    | Record<string, string | string[] | undefined>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE)?.value;
  const isAuthed = await validateAdminSessionToken(token);
  if (isAuthed) redirect("/admin");

  const sp = await Promise.resolve(searchParams);
  const error = sp?.error === "1";

  return (
    <main className='mx-auto w-full max-w-[var(--container-max)] px-[var(--gutter)] py-10 max-md:px-[var(--margin-mobile)]'>
      <div className='glass-card mx-auto max-w-lg rounded-2xl border border-outline-variant/30 p-6 shadow-card md:p-8'>
        <div className='flex flex-col gap-1'>
          <h1 className='text-xl font-bold text-on-surface'>Admin Login</h1>
          <p className='text-sm text-on-surface-variant'>
            Masuk untuk mengedit data resume.
          </p>
        </div>

        {error ? (
          <div className='mt-4 rounded-xl border border-error/30 bg-error-container/50 px-4 py-3'>
            <p className='text-sm font-semibold text-error'>
              Username / password salah.
            </p>
          </div>
        ) : null}

        <form
          action='/api/admin/login'
          method='post'
          className='mt-6 space-y-4'>
          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              Username
            </span>
            <input
              className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
              name='username'
              autoComplete='username'
            />
          </label>

          <label className='flex flex-col gap-2'>
            <span className='text-xs font-semibold text-on-surface-variant'>
              Password
            </span>
            <input
              className='h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container'
              name='password'
              type='password'
              autoComplete='current-password'
            />
          </label>

          <button
            type='submit'
            className='h-11 w-full rounded-xl bg-primary-container px-5 text-sm font-bold text-white shadow-sm'>
            Masuk
          </button>
        </form>
      </div>
    </main>
  );
}
