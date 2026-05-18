"use client";

import { Loader2, Download } from "lucide-react";
import { useCallback, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { t } from "@/i18n/messages";
import { type Locale } from "@/i18n/locale";

function filenameFromContentDisposition(value: string | null): string | null {
  if (!value) return null;
  const match = value.match(/filename\*?=(?:UTF-8''|")?([^";\n]+)"?/i);
  if (!match?.[1]) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

export function DownloadResumeButton({ locale }: { locale: Locale }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const onDownload = useCallback(async () => {
    if (loading) return;
    setLoading(true);
    try {
      const res = await fetch("/api/resume", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Gagal download (HTTP ${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const filename =
        filenameFromContentDisposition(res.headers.get("content-disposition")) ??
        "resume.pdf";

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.rel = "noreferrer";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 2_000);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Gagal download";
      toast.push({ variant: "error", message });
    } finally {
      setLoading(false);
    }
  }, [loading, toast]);

  return (
    <button
      type="button"
      onClick={onDownload}
      disabled={loading}
      aria-busy={loading}
      className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white shadow-md transition-all hover:bg-primary"
      style={{
        background: "linear-gradient(to right, #0077b5, #005d8f)",
      }}
    >
      {loading ? (
        <Loader2 className="h-[18px] w-[18px] animate-spin" />
      ) : (
        <Download className="h-[18px] w-[18px]" />
      )}
      {loading ? "Mengunduh..." : t(locale, "downloadResume")}
    </button>
  );
}

