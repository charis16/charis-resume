"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type ToastVariant = "success" | "error" | "info";

export type ToastInput = {
  variant?: ToastVariant;
  message: string;
  durationMs?: number;
};

type ToastItem = {
  id: string;
  variant: ToastVariant;
  message: string;
  durationMs: number;
};

type ToastContextValue = {
  push: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function makeId() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const timers = useRef(new Map<string, number>());

  const remove = useCallback((id: string) => {
    const t = timers.current.get(id);
    if (typeof t === "number") window.clearTimeout(t);
    timers.current.delete(id);
    setItems((prev) => prev.filter((x) => x.id !== id));
  }, []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = makeId();
      const item: ToastItem = {
        id,
        variant: input.variant ?? "info",
        message: input.message,
        durationMs: input.durationMs ?? 3500,
      };
      setItems((prev) => [item, ...prev].slice(0, 4));
      const timeout = window.setTimeout(() => remove(id), item.durationMs);
      timers.current.set(id, timeout);
    },
    [remove],
  );

  useEffect(() => {
    const currentTimers = timers.current;
    return () => {
      for (const t of currentTimers.values()) window.clearTimeout(t);
      currentTimers.clear();
    };
  }, []);

  const value = useMemo(() => ({ push }), [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className='fixed right-4 top-4 z-50 flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2'>
        {items.map((t) => (
          <ToastCard
            key={t.id}
            item={t}
            onClose={() => remove(t.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return ctx;
}

export function ToastTrigger({
  toastKey,
  toast,
}: {
  toastKey: string;
  toast: ToastInput | null;
}) {
  const { push } = useToast();
  useEffect(() => {
    if (!toastKey || !toast) return;
    push(toast);
  }, [push, toast, toastKey]);
  return null;
}

function ToastCard({
  item,
  onClose,
}: {
  item: ToastItem;
  onClose: () => void;
}) {
  const Icon =
    item.variant === "success"
      ? CircleCheck
      : item.variant === "error"
        ? CircleAlert
        : Info;

  const accent =
    item.variant === "success"
      ? "border-primary-container/30"
      : item.variant === "error"
        ? "border-error/30"
        : "border-outline-variant/30";

  const iconColor =
    item.variant === "success"
      ? "text-primary-container"
      : item.variant === "error"
        ? "text-error"
        : "text-on-surface-variant";

  return (
    <div
      role='status'
      className={[
        "glass-card flex items-start gap-3 rounded-2xl border bg-surface-container-lowest/90 px-4 py-3 shadow-card",
        accent,
      ].join(" ")}>
      <Icon className={["mt-0.5 h-5 w-5 shrink-0", iconColor].join(" ")} />
      <p className='min-w-0 flex-1 text-sm font-semibold text-on-surface'>
        {item.message}
      </p>
      <button
        type='button'
        aria-label='Tutup'
        className='shrink-0 rounded-lg p-1 text-on-surface-variant hover:text-on-surface'
        onClick={onClose}>
        <X className='h-4 w-4' />
      </button>
    </div>
  );
}
