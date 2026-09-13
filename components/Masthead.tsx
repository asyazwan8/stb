/* eslint-disable @next/next/no-img-element */

export function Masthead({
  compact = false,
  step,
}: {
  compact?: boolean;
  step?: { current: number; total: number; label: string };
}) {
  return (
    <header className="kiosk-no-select w-full shrink-0">
      <div
        className={`flex items-center justify-between gap-4 px-6 ${
          compact ? "py-3" : "py-5"
        }`}
      >
        <img
          src="/brand/stb-masthead.png"
          alt="Sarawak — Gateway to Borneo"
          className={compact ? "h-9 w-auto" : "h-12 w-auto"}
        />
        {step ? (
          <div className="flex items-center gap-3">
            <span className="hidden text-sm font-semibold tracking-wide text-muted sm:inline">
              {step.label}
            </span>
            <div className="flex items-center gap-1.5" aria-hidden>
              {Array.from({ length: step.total }, (_, i) => (
                <span
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    i === step.current
                      ? "w-6 bg-gold"
                      : i < step.current
                        ? "w-2 bg-gold/40"
                        : "w-2 bg-ink/15"
                  }`}
                />
              ))}
            </div>
            <span className="sr-only">
              Step {step.current + 1} of {step.total}: {step.label}
            </span>
          </div>
        ) : null}
      </div>
    </header>
  );
}
