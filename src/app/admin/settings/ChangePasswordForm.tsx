"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useId, useState } from "react";

type PasswordFieldProps = {
  label: string;
  name: string;
};

function PasswordField({ label, name }: PasswordFieldProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  const toggleLabel = visible ? "Sembunyikan password" : "Tampilkan password";

  return (
    <label className='flex flex-col gap-2'>
      <span className='text-xs font-semibold text-on-surface-variant'>
        {label}
      </span>
      <div className='relative'>
        <input
          id={id}
          className='h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 pr-10 text-sm outline-none focus:border-primary-container'
          name={name}
          type={visible ? "text" : "password"}
          autoComplete='new-password'
        />
        <button
          type='button'
          aria-label={toggleLabel}
          className='absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-on-surface-variant hover:text-on-surface'
          onClick={() => setVisible((v) => !v)}>
          <Icon className='h-4 w-4' />
        </button>
      </div>
    </label>
  );
}

export function ChangePasswordForm() {
  const [submitting, setSubmitting] = useState(false);

  return (
    <form
      action='/api/admin/change-password'
      method='post'
      className='mt-4'
      onSubmit={() => setSubmitting(true)}>
      <div className='grid gap-4 md:grid-cols-2'>
        <PasswordField
          label='Password Baru'
          name='newPassword'
        />
        <PasswordField
          label='Konfirmasi Password'
          name='confirmPassword'
        />
      </div>

      <button
        type='submit'
        disabled={submitting}
        aria-busy={submitting}
        className={[
          "mt-4 inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-primary-container px-4 text-sm font-bold text-white shadow-sm",
          submitting ? "opacity-60" : "",
        ].join(" ")}>
        {submitting ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Menyimpan...
          </>
        ) : (
          "Simpan"
        )}
      </button>
    </form>
  );
}
