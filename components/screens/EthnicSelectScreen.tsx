"use client";

import { useState } from "react";
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";
import { EthnicCard } from "@/components/EthnicCard";
import { ETHNICS, type Ethnic } from "@/lib/ethnics";
import { Hornbill } from "@/components/Hornbill";

export function EthnicSelectScreen({
  selectedId,
  onSelect,
  onBack,
  onNext,
}: {
  selectedId: string | null;
  onSelect: (id: string) => void;
  onBack: () => void;
  onNext: () => void;
}) {
  const [toast, setToast] = useState<string | null>(null);

  const handleSelect = (ethnic: Ethnic) => {
    if (ethnic.status !== "live") {
      setToast(`${ethnic.name} is coming soon`);
      window.setTimeout(() => setToast(null), 1800);
      return;
    }
    onSelect(ethnic.id);
  };

  return (
    <div className="relative flex h-full flex-col overflow-hidden bg-white">
      <Masthead compact step={{ current: 0, total: 4, label: "Choose an ethnic group" }} />

      <main className="flex flex-1 flex-col justify-center overflow-y-auto px-6 pb-6">
        <div className="mx-auto w-full max-w-3xl">
          <h1 className="animate-fade-up font-display tracking-tight text-4xl font-extrabold text-ink">
            Choose an ethnic group
          </h1>
          <p className="animate-fade-up mt-2 text-[1.0625rem] leading-relaxed text-muted">
            Sarawak is home to more than 30 ethnic groups. Pick one to see its
            traditional dress up close.
          </p>

          <div className="mt-7 grid grid-cols-2 gap-4">
            {ETHNICS.map((ethnic) => (
              <EthnicCard
                key={ethnic.id}
                ethnic={ethnic}
                selected={selectedId === ethnic.id}
                onSelect={handleSelect}
              />
            ))}
          </div>

          <p className="mt-6 text-center text-sm text-muted">
            More ethnic groups are being added for the full experience.
          </p>
        </div>
      </main>

      {toast ? (
        <div
          role="status"
          className="animate-fade pointer-events-none fixed inset-x-0 bottom-32 z-40 flex justify-center px-6"
        >
          <span className="rounded-full bg-ink px-5 py-3 text-sm font-semibold text-white shadow-xl">
            {toast}
          </span>
        </div>
      ) : null}

      <div className="pointer-events-none absolute -bottom-[1%] -left-[5%] w-[34%]">
        <Hornbill pose={6} rotate={3} className="w-full" />
      </div>
      <div className="pointer-events-none absolute bottom-[14%] right-[-3%] w-[24%]">
        <Hornbill pose={3} flip className="w-full" />
      </div>

      <StepBar
        onBack={onBack}
        onNext={onNext}
        nextDisabled={!selectedId}
        hint={selectedId ? undefined : "Select an ethnic group to continue"}
      />
    </div>
  );
}
