export function ComingSoonBadge({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full bg-ink/80 px-3 py-1 text-[0.6875rem] font-bold uppercase tracking-[0.14em] text-white ${className}`}
    >
      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect
          x="4"
          y="10"
          width="16"
          height="11"
          rx="2"
          stroke="currentColor"
          strokeWidth="2.5"
        />
        <path
          d="M8 10V7a4 4 0 018 0v3"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
      Coming soon
    </span>
  );
}
