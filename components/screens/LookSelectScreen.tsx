"use client";

import type { ReactNode } from "react";
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";
import { LookCard } from "@/components/LookCard";
import type { Ethnic, Gender } from "@/lib/ethnics";
import { Hornbill } from "@/components/Hornbill";

export function LookSelectScreen({
  ethnic,
  selected,
  onSelect,
  onBack,
  onNext,
  footer,
}: {
  ethnic: Ethnic;
  selected: Gender | null;
  onSelect: (gender: Gender) => void;
  onBack: () => void;
  onNext: () => void;
  /** Replaces the Back/Next bar — the phone-controlled kiosk shows feedback here. */
  footer?: ReactNode;
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
            {ethnic.looks.map((look) => (
              <LookCard
                key={look.gender}
                ethnic={ethnic}
                look={look}
                selected={selected === look.gender}
                onSelect={(l) => onSelect(l.gender)}
              />
            ))}
          </div>
        </div>
      </main>

      <div className="pointer-events-none absolute bottom-[11%] right-[-3%] w-[22%]">
        <Hornbill pose={4} className="w-full" />
      </div>

      {footer ?? (
        <StepBar
          onBack={onBack}
          onNext={onNext}
          nextDisabled={!selected}
          hint={selected ? undefined : "Pick one to continue"}
        />
      )}
    </div>
  );
}
