import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  validateAdminSessionToken,
} from "@/data/admin-auth-store";
import { LoginForm } from "./LoginForm";
import { ToastTrigger } from "@/components/ui/Toast";

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
      <ToastTrigger
        toastKey={error ? "admin-login-error" : ""}
        toast={
          error
            ? { variant: "error", message: "Username / password salah." }
            : null
        }
      />
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

        <LoginForm />
      </div>
    </main>
  );
}
