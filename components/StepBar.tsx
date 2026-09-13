"use client";

type Props = {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  /** Optional hint shown between the two buttons. */
  hint?: string;
};

export function StepBar({
  onBack,
  onNext,
  backLabel = "Back",
  nextLabel = "Next",
  nextDisabled = false,
  hint,
}: Props) {
  return (
    <footer className="kiosk-no-select w-full shrink-0 border-t border-line bg-white/90 kiosk-reach-bottom px-5 pt-4 backdrop-blur">
      <div className="mx-auto flex w-full max-w-3xl items-center gap-4">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="flex h-16 min-w-32 items-center justify-center gap-2 rounded-full border border-ink/20 px-6 text-lg font-semibold text-muted transition active:scale-[0.97] active:bg-surface"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M15 18l-6-6 6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {backLabel}
          </button>
        ) : (
          <div className="min-w-32" />
        )}

        {hint ? (
          <p className="flex-1 text-center text-sm font-medium text-muted">{hint}</p>
        ) : (
          <div className="flex-1" />
        )}

        {onNext ? (
          <button
            type="button"
            onClick={onNext}
            disabled={nextDisabled}
            className="flex h-16 min-w-40 items-center justify-center gap-2 rounded-full bg-gold px-8 text-lg font-bold text-white shadow-lg shadow-black/10 transition active:scale-[0.97] disabled:cursor-not-allowed disabled:bg-ink/20 disabled:text-muted disabled:shadow-none"
          >
            {nextLabel}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : (
          <div className="min-w-40" />
        )}
      </div>
    </footer>
  );
}
