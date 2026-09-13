"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AttractScreen } from "@/components/screens/AttractScreen";
import { EthnicSelectScreen } from "@/components/screens/EthnicSelectScreen";
import { LookSelectScreen } from "@/components/screens/LookSelectScreen";
import { LearnScreen } from "@/components/screens/LearnScreen";
import { CameraScreen } from "@/components/screens/CameraScreen";
import { ProcessingScreen } from "@/components/screens/ProcessingScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { getEthnic, getLook, type Gender } from "@/lib/ethnics";
import { useFaceSwap } from "@/lib/useFaceSwap";

type Step =
  | "attract"
  | "ethnic"
  | "look"
  | "learn"
  | "camera"
  | "processing"
  | "result";

function Photobooth() {
  const params = useSearchParams();
  const calibrate = params.get("calibrate") === "1";

  const [step, setStep] = useState<Step>("attract");
  const [ethnicId, setEthnicId] = useState<string | null>(null);
  const [gender, setGender] = useState<Gender | null>(null);
  const [photo, setPhoto] = useState<string | null>(null);

  const { state: swap, run, reset } = useFaceSwap();

  const ethnic = ethnicId ? getEthnic(ethnicId) : undefined;
  const look = ethnicId && gender ? getLook(ethnicId, gender) : undefined;

  const restart = useCallback(() => {
    reset();
    setPhoto(null);
    setGender(null);
    setEthnicId(null);
    setStep("attract");
  }, [reset]);

  const startSwap = useCallback(
    (captured: string) => {
      if (!ethnicId || !gender) return;
      setPhoto(captured);
      setStep("processing");
      void run({ photo: captured, ethnic: ethnicId, gender });
    },
    [ethnicId, gender, run],
  );

  const retry = useCallback(() => {
    if (!photo || !ethnicId || !gender) {
      restart();
      return;
    }
    void run({ photo, ethnic: ethnicId, gender });
  }, [photo, ethnicId, gender, run, restart]);

  // Advance to the result the moment the portrait lands.
  useEffect(() => {
    if (swap.phase === "done" && swap.imageUrl) setStep("result");
  }, [swap.phase, swap.imageUrl]);

  switch (step) {
    case "ethnic":
      return (
        <EthnicSelectScreen
          selectedId={ethnicId}
          onSelect={(id) => {
            setEthnicId(id);
            setGender(null);
          }}
          onBack={restart}
          onNext={() => setStep("look")}
        />
      );

    case "look":
      if (!ethnic) return <Fallback onRestart={restart} />;
      return (
        <LookSelectScreen
          ethnic={ethnic}
          selected={gender}
          onSelect={setGender}
          onBack={() => setStep("ethnic")}
          onNext={() => setStep("learn")}
        />
      );

    case "learn":
      if (!ethnic || !look) return <Fallback onRestart={restart} />;
      return (
        <LearnScreen
          ethnic={ethnic}
          look={look}
          calibrate={calibrate}
          onBack={() => setStep("look")}
          onNext={() => setStep("camera")}
        />
      );

    case "camera":
      return (
        <CameraScreen onBack={() => setStep("learn")} onCapture={startSwap} />
      );

    case "processing":
      return (
        <ProcessingScreen
          state={swap}
          onCancel={restart}
          onRetry={retry}
        />
      );

    case "result":
      if (!ethnic || !look || !swap.imageUrl) return <Fallback onRestart={restart} />;
      return (
        <ResultScreen
          imageUrl={swap.imageUrl}
          ethnic={ethnic}
          look={look}
          onRestart={restart}
        />
      );

    case "attract":
    default:
      return <AttractScreen onStart={() => setStep("ethnic")} />;
  }
}

/** Only reachable if state is torn mid-flow (a reload, say). */
function Fallback({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-5 bg-cream px-8 text-center">
      <p className="font-display text-2xl font-bold text-ink">
        Let&rsquo;s start again
      </p>
      <button
        type="button"
        onClick={onRestart}
        className="h-16 rounded-2xl bg-stb-hornbill px-10 text-lg font-bold text-white transition active:scale-95"
      >
        Start over
      </button>
    </div>
  );
}

export default function Page() {
  return (
    <div className="h-dvh w-full overflow-hidden">
      <Suspense fallback={<div className="h-full bg-cream" />}>
        <Photobooth />
      </Suspense>
    </div>
  );
}
