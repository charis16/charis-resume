"use client";

import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  const toggleLabel = visible ? "Sembunyikan password" : "Tampilkan password";

  return (
    <form
      action='/api/admin/login'
      method='post'
      className='mt-6 space-y-4'
      onSubmit={() => setSubmitting(true)}>
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
        <div className='relative'>
          <input
            className='h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 pr-10 text-sm outline-none focus:border-primary-container'
            name='password'
            type={visible ? "text" : "password"}
            autoComplete='current-password'
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

      <button
        type='submit'
        disabled={submitting}
        aria-busy={submitting}
        className={[
          "inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-primary-container px-5 text-sm font-bold text-white shadow-sm",
          submitting ? "opacity-60" : "",
        ].join(" ")}>
        {submitting ? (
          <>
            <Loader2 className='h-4 w-4 animate-spin' />
            Masuk...
          </>
        ) : (
          "Masuk"
        )}
      </button>
    </form>
  );
}
