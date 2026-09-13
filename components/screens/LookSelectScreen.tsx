"use client";

/* eslint-disable @next/next/no-img-element */
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";
import type { Ethnic, Gender } from "@/lib/ethnics";
import { Hornbill } from "@/components/Hornbill";

export function LookSelectScreen({
  ethnic,
  selected,
  onSelect,
  onBack,
  onNext,
}: {
  ethnic: Ethnic;
  selected: Gender | null;
  onSelect: (gender: Gender) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Masthead compact step={{ current: 1, total: 4, label: "Choose your look" }} />

      <main className="flex flex-1 flex-col justify-center overflow-y-auto px-6 pb-6">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="animate-fade-up font-display tracking-tight text-4xl font-extrabold text-ink">
            Choose your look
          </h1>
          <p className="animate-fade-up mt-2 text-[1.0625rem] leading-relaxed text-muted">
            The {ethnic.name} have distinct ceremonial dress for women and men.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-4">
            {ethnic.looks.map((look) => {
              const isSelected = selected === look.gender;
              return (
                <button
                  key={look.gender}
                  type="button"
                  onClick={() => onSelect(look.gender)}
                  aria-pressed={isSelected}
                  className={`group overflow-hidden rounded-3xl border-2 text-left transition duration-200 active:scale-[0.98] ${
                    isSelected
                      ? "border-gold shadow-xl shadow-black/10"
                      : "border-line shadow-sm"
                  }`}
                >
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-surface">
                    <img
                      src={look.image}
                      alt={`${ethnic.name} ${look.label.toLowerCase()} traditional dress`}
                      className="h-full w-full object-cover"
                    />
                    {isSelected ? (
                      <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-gold text-ink shadow-lg">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                          <path
                            d="M5 12l5 5L19 7"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    ) : null}
                  </div>

                  <div className="bg-white px-4 py-3.5">
                    <p className="font-display tracking-tight text-xl font-bold text-ink">
                      {look.label}
                    </p>
                    <p className="mt-0.5 text-sm italic text-muted">{look.name}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute bottom-[12%] right-[-4%] w-[30%]">
        <Hornbill pose={7} flip rotate={-4} className="w-full" />
      </div>

      <StepBar
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selected}
        hint={selected ? undefined : "Pick one to continue"}
      />
    </div>
  );
}
