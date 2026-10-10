import type { Feedback } from "@/lib/demoQr";

/**
 * The answer to a tap — "You chose Iban". A white pill with a gold check
 * (gold stays a fill, never text), or a dark lock for something coming soon.
 * Keyed by the caller on `feedback.key`, so every tap replays the fade-up.
 */
export function ChoiceFeedback({
  feedback,
  size = "md",
}: {
  feedback: Feedback;
  size?: "md" | "lg";
}) {
  const lg = size === "lg";
  const soon = feedback.tone === "soon";

  return (
    <p
      role="status"
      className={`animate-fade-up inline-flex max-w-full items-center rounded-full bg-white shadow-lg shadow-black/10 ring-1 ring-line ${
        lg ? "gap-4 py-3 pl-3 pr-7" : "gap-3 py-2 pl-2 pr-5"
      }`}
    >
      <span
        aria-hidden
        className={`flex shrink-0 items-center justify-center rounded-full ${
          soon ? "bg-ink/80 text-white" : "bg-gold text-ink"
        } ${lg ? "h-12 w-12" : "h-9 w-9"}`}
      >
        {soon ? (
          <svg width={lg ? 20 : 15} height={lg ? 20 : 15} className={lg ? "size-[calc(20*var(--px))]" : "size-[calc(15*var(--px))]"} viewBox="0 0 24 24" fill="none">
            <rect x="4" y="10" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="2.5" />
            <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width={lg ? 22 : 16} height={lg ? 22 : 16} className={lg ? "size-[calc(22*var(--px))]" : "size-[calc(16*var(--px))]"} viewBox="0 0 24 24" fill="none">
            <path
              d="M5 12l5 5L19 7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
      <span
        className={`min-w-0 leading-snug text-ink ${
          lg ? "text-[1.375rem] font-semibold" : "text-[0.9375rem] font-medium"
        }`}
      >
        {feedback.before}
        <strong className="font-extrabold tracking-tight">{feedback.name}</strong>
        {feedback.after}
      </span>
    </p>
  );
}
