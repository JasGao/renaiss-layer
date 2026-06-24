"use client";

import { useState } from "react";

type CopyInlineButtonProps = {
  value: string;
  label?: string;
};

export function CopyInlineButton({ value, label = "Copy value" }: CopyInlineButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label={label}
      title={copied ? "Copied" : label}
      className="inline-flex h-6 w-6 items-center justify-center rounded border border-white/20 text-white/60 transition hover:border-white/40 hover:text-white"
    >
      {copied ? (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <path
            d="M3 8l3 3 7-7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" aria-hidden="true">
          <rect x="6" y="2.5" width="7.5" height="10.5" rx="1.5" stroke="currentColor" />
          <rect x="2.5" y="6" width="7.5" height="7.5" rx="1.5" stroke="currentColor" />
        </svg>
      )}
    </button>
  );
}
