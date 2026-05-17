"use client";

import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function LoginForm() {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;
  const toggleLabel = visible ? "Sembunyikan password" : "Tampilkan password";

  return (
    <form action="/api/admin/login" method="post" className="mt-6 space-y-4">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-on-surface-variant">
          Username
        </span>
        <input
          className="h-10 rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 text-sm outline-none focus:border-primary-container"
          name="username"
          autoComplete="username"
        />
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-xs font-semibold text-on-surface-variant">
          Password
        </span>
        <div className="relative">
          <input
            className="h-10 w-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest px-3 pr-10 text-sm outline-none focus:border-primary-container"
            name="password"
            type={visible ? "text" : "password"}
            autoComplete="current-password"
          />
          <button
            type="button"
            aria-label={toggleLabel}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg p-1 text-on-surface-variant hover:text-on-surface"
            onClick={() => setVisible((v) => !v)}
          >
            <Icon className="h-4 w-4" />
          </button>
        </div>
      </label>

      <button
        type="submit"
        className="h-11 w-full rounded-xl bg-primary-container px-5 text-sm font-bold text-white shadow-sm"
      >
        Masuk
      </button>
    </form>
  );
}

