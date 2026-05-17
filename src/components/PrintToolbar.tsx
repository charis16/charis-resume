"use client";

import Link from "next/link";
import { useCallback, useEffect } from "react";

type PrintToolbarProps = {
  autoPrint?: boolean;
};

export function PrintToolbar({ autoPrint }: PrintToolbarProps) {
  const onPrint = useCallback(() => {
    window.print();
  }, []);

  useEffect(() => {
    if (!autoPrint) return;
    const id = window.setTimeout(() => window.print(), 250);
    return () => window.clearTimeout(id);
  }, [autoPrint]);

  return (
    <div className='sticky top-0 z-10 border-b border-outline-variant bg-surface-container-lowest/90 backdrop-blur px-4 py-3 print:hidden'>
      <div className='mx-auto flex w-full max-w-[var(--container-max)] items-center justify-between gap-3'>
        <Link
          href='/'
          className='text-sm font-semibold text-primary-container hover:underline'>
          Kembali
        </Link>
        <button
          type='button'
          onClick={onPrint}
          className='h-9 rounded-[var(--radius)] bg-primary-container px-4 text-sm font-semibold text-on-primary hover:bg-surface-tint focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-container'>
          Download PDF
        </button>
      </div>
    </div>
  );
}
