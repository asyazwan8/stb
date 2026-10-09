"use client";

import { AttractScreen } from "@/components/screens/AttractScreen";
import { EthnicSelectScreen } from "@/components/screens/EthnicSelectScreen";
import { LookSelectScreen } from "@/components/screens/LookSelectScreen";
import { LearnScreen } from "@/components/screens/LearnScreen";
import { ProcessingScreen } from "@/components/screens/ProcessingScreen";
import { ResultScreen } from "@/components/screens/ResultScreen";
import { QrPanel } from "@/components/QrPanel";
import { getEthnic, getLook } from "@/lib/ethnics";
import { feedbackFor, phonePath } from "@/lib/demoQr";
import { easeProgress } from "@/lib/useFaceSwap";
import { useKioskSession, useTicker } from "@/lib/useDemoQr";
import { PhoneCameraWaitScreen } from "./PhoneCameraWaitScreen";
import { RemoteFooter } from "./RemoteFooter";
import { StatusScreen } from "./StatusScreen";

const noop = () => undefined;

/**
 * The big screen in phone-controlled mode. It asks; the phone answers. Nothing
 * here needs a touch — the whole stage ignores pointer input — so it works
 * on a plain display as well as a touch panel.
 */
export function DemoQrKiosk() {
  const { conn, end, serverNow } = useKioskSession();
  const session = conn.status === "live" ? conn.session : null;
  useTicker(session?.phase === "processing");

  return (
    <div className="kiosk-no-select pointer-events-none h-full">
      {renderScreen()}
    </div>
  );

  // A plain function, not a nested component: a component defined in here
  // would be a new type on every render and remount the whole screen.
  function renderScreen() {
    if (conn.status === "unavailable") {
      return (
        <StatusScreen
          eyebrow="Phone mode"
          title="This screen isn't connected yet"
          body={conn.error}
          busy
        />
      );
    }

    if (!session || session.phase === "waiting" || session.phase === "ended") {
      const id = conn.status === "live" && session?.phase === "waiting" ? conn.id : null;
      return (
        <AttractScreen
          cta={
            <div className="animate-fade-up mt-9">
              <QrPanel
                path={id ? phonePath(id) : null}
                size="lg"
                title="Scan to start"
                caption="Point your phone camera here — no app needed"
                alt="QR code to start on your phone"
              />
            </div>
          }
        />
      );
    }

    const ethnic = session.ethnicId ? getEthnic(session.ethnicId) : undefined;
    const look =
      session.ethnicId && session.gender
        ? getLook(session.ethnicId, session.gender)
        : undefined;

    switch (session.phase) {
      case "processing":
        return (
          <ProcessingScreen
            state={{
              phase: "processing",
              imageUrl: null,
              error: null,
              progress:
                session.submittedAt === null
                  ? 4
                  : easeProgress(serverNow() - session.submittedAt),
            }}
          />
        );

      case "error":
        return (
          <ProcessingScreen
            state={{
              phase: "error",
              imageUrl: null,
              error: session.error ?? "Something went wrong.",
              progress: 0,
            }}
            errorHint="Try again on your phone"
          />
        );

      case "done":
        if (ethnic && look && session.imageUrl) {
          return (
            <ResultScreen
              imageUrl={session.imageUrl}
              ethnic={ethnic}
              look={look}
              onRestart={end}
              showRestart={false}
            />
          );
        }
        break;

      case "selecting":
        break;
    }

    const footer = <RemoteFooter feedback={feedbackFor(session, "kiosk")} />;

    if (session.step === "camera" && ethnic && look) {
      return <PhoneCameraWaitScreen ethnic={ethnic} look={look} />;
    }

    if (session.step === "learn" && ethnic && look) {
      return (
        <LearnScreen
          ethnic={ethnic}
          look={look}
          openHotspotId={session.hotspotId}
          hint="Pick a detail on your phone to learn what it means."
          onBack={noop}
          onNext={noop}
          footer={footer}
        />
      );
    }

    if (session.step === "look" && ethnic) {
      return (
        <LookSelectScreen
          ethnic={ethnic}
          selected={session.gender}
          onSelect={noop}
          onBack={noop}
          onNext={noop}
          footer={footer}
        />
      );
    }

    return (
      <EthnicSelectScreen
        selectedId={session.ethnicId}
        onSelect={noop}
        onBack={noop}
        onNext={noop}
        footer={footer}
      />
    );
  }
}
