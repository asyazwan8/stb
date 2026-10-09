"use client";

import type { ReactNode } from "react";
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";
import { ChoiceFeedback } from "@/components/ChoiceFeedback";
import { ComingSoonBadge } from "@/components/ComingSoonBadge";
import type { Feedback } from "@/lib/demoQr";

/**
 * The phone's half of a question. The big screen carries the copy and the
 * pictures; the phone carries the choices, and echoes each tap back.
 */
export function PhoneChoiceScreen({
  step,
  label,
  title,
  prompt,
  feedback,
  children,
  onBack,
  onNext,
  nextLabel = "Continue",
  nextDisabled = false,
}: {
  /** 0-based, for the masthead's progress dots. */
  step: number;
  label: string;
  title: string;
  prompt: string;
  feedback: Feedback | null;
  children: ReactNode;
  onBack?: () => void;
  onNext: () => void;
  nextLabel?: string;
  nextDisabled?: boolean;
}) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      <Masthead compact step={{ current: step, total: 4, label }} />

      {/* my-auto centres the block like the kiosk screens, yet still
          scrolls from the top if a small phone can't fit it. */}
      <main className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 pb-4">
        <div className="my-auto">
          <h1 className="animate-fade-up font-display text-3xl font-extrabold tracking-tight text-ink">
            {title}
          </h1>
          <p className="animate-fade-up mt-1.5 text-[0.9375rem] leading-relaxed text-muted">
            {prompt}
          </p>
          <div className="mt-5">{children}</div>
        </div>
      </main>

      <div className="flex min-h-[3.75rem] shrink-0 items-center justify-center px-5 pb-3">
        {feedback ? (
          <ChoiceFeedback key={feedback.key} feedback={feedback} />
        ) : (
          <p className="text-sm font-medium text-muted">Tap one to choose</p>
        )}
      </div>

      <StepBar
        onBack={onBack}
        onNext={onNext}
        nextLabel={nextLabel}
        nextDisabled={nextDisabled}
      />
    </div>
  );
}

/**
 * One choice on the phone, full width so it is easy to hit with a thumb. The
 * kiosk's cards are drawn for a wide panel; this is the same language —
 * hairline border, gold when chosen, the lock badge for "coming soon" —
 * sized for a hand.
 */
export function ChoiceRow({
  eyebrow,
  title,
  subtitle,
  live,
  selected,
  onSelect,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  live: boolean;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={live ? selected : undefined}
      className={`flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left transition duration-200 active:scale-[0.98] ${
        selected
          ? "border-gold bg-white shadow-lg shadow-black/10"
          : live
            ? "border-line bg-white"
            : "border-line bg-surface"
      }`}
    >
      <span className={`min-w-0 ${live ? "" : "opacity-45"}`}>
        {eyebrow ? (
          <span className="mb-0.5 block text-xs font-bold uppercase tracking-[0.14em] text-muted">
            {eyebrow}
          </span>
        ) : null}
        <span className="block font-display text-xl font-extrabold tracking-tight text-ink">
          {title}
        </span>
        {subtitle ? (
          <span className="mt-0.5 block text-sm leading-snug text-muted">{subtitle}</span>
        ) : null}
      </span>

      {live ? (
        <span
          aria-hidden
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition ${
            selected ? "bg-gold text-ink" : "bg-surface text-muted"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>
      ) : (
        <ComingSoonBadge className="shrink-0" />
      )}
    </button>
  );
}
