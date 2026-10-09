"use client";

import { useRef } from "react";
import { CameraScreen } from "@/components/screens/CameraScreen";
import { LookCard } from "@/components/LookCard";
import { ETHNICS, getEthnic, getLook } from "@/lib/ethnics";
import { feedbackFor } from "@/lib/demoQr";
import { easeProgress } from "@/lib/useFaceSwap";
import { usePhoneSession, useTicker } from "@/lib/useDemoQr";
import { ChoiceRow, PhoneChoiceScreen } from "./PhoneChoiceScreen";
import { PRIMARY_BUTTON, SECONDARY_BUTTON, StatusScreen } from "./StatusScreen";

/**
 * The visitor's phone in phone-controlled mode: every choice, and the camera.
 * The kiosk mirrors each tap; the finished portrait appears on the kiosk,
 * whose own QR code is how it gets saved.
 */
export function PhoneController({ id }: { id: string }) {
  const { conn, selection: sel, choose, submitPhoto, sending, finish, serverNow } =
    usePhoneSession(id);
  // Kept so a failed attempt can be retried without retaking the photo.
  const photo = useRef<string | null>(null);

  const session = conn.status === "live" ? conn.session : null;
  const waiting = sending || session?.phase === "processing";
  useTicker(waiting);

  switch (conn.status) {
    case "joining":
      return <StatusScreen eyebrow="Phone mode" title="Connecting to the screen…" busy />;
    case "taken":
      return (
        <StatusScreen
          eyebrow="Screen in use"
          title="Someone else is using this screen"
          body="Wait for them to finish — a new code appears on the big screen when it's free."
        />
      );
    case "expired":
      return (
        <StatusScreen
          eyebrow="Phone mode"
          title="This code has expired"
          body="Scan the QR code on the big screen again to start."
        />
      );
    case "unavailable":
      return (
        <StatusScreen eyebrow="Phone mode" title="Can't connect right now" body={conn.error} />
      );
  }

  if (!session) return null;

  if (waiting) {
    const progress =
      session.phase === "processing" && session.submittedAt !== null
        ? easeProgress(serverNow() - session.submittedAt)
        : 4;
    return (
      <StatusScreen
        eyebrow={sending ? "Sending your photo" : "Photo received"}
        title="Look up at the big screen"
        body="We're creating your portrait there now — it takes under a minute."
        progress={progress}
      />
    );
  }

  if (session.phase === "done") {
    return (
      <StatusScreen
        eyebrow="Your portrait is ready"
        title="Scan the code on the big screen"
        body="Point your phone camera at the QR code under your portrait to save it."
      >
        <button type="button" onClick={() => void finish()} className={SECONDARY_BUTTON}>
          I&rsquo;m done
        </button>
        <p className="text-xs text-muted">Clears the screen for the next visitor.</p>
      </StatusScreen>
    );
  }

  if (session.phase === "error") {
    return (
      <StatusScreen
        eyebrow="Something went wrong"
        title="That didn’t work"
        body={session.error ?? "Please try again."}
      >
        {photo.current ? (
          <button
            type="button"
            onClick={() => photo.current && void submitPhoto(photo.current)}
            className={PRIMARY_BUTTON}
          >
            Try again
          </button>
        ) : null}
        <button
          type="button"
          onClick={() => choose({ ...sel, step: "camera" })}
          className={photo.current ? SECONDARY_BUTTON : PRIMARY_BUTTON}
        >
          Retake photo
        </button>
      </StatusScreen>
    );
  }

  if (session.phase === "ended") {
    return session.endedReason === "finished" ? (
      <StatusScreen
        eyebrow="Terima kasih"
        title="Thanks for visiting"
        body="Now come and see the real thing — Sarawak is the gateway to Borneo."
      />
    ) : (
      <StatusScreen
        eyebrow="Session ended"
        title={
          session.endedReason === "timeout"
            ? "This session timed out"
            : "The big screen was reset"
        }
        body="Scan the new QR code on the big screen to start again."
      />
    );
  }

  // Selecting — the phone renders its own optimistic copy of the choices.
  const ethnic = sel.ethnicId ? getEthnic(sel.ethnicId) : undefined;
  const look = sel.ethnicId && sel.gender ? getLook(sel.ethnicId, sel.gender) : undefined;
  const feedback = feedbackFor(sel, "phone");

  if (sel.step === "camera" && look) {
    return (
      <CameraScreen
        onBack={() => choose({ ...sel, step: "learn" })}
        onCapture={(shot) => {
          photo.current = shot;
          void submitPhoto(shot);
        }}
      />
    );
  }

  if (sel.step === "learn" && ethnic && look) {
    return (
      <PhoneChoiceScreen
        step={2}
        label="Meet the dress"
        title="Meet the dress"
        prompt={`Tap a detail of the ${look.name} to see what it means on the big screen.`}
        feedback={feedback}
        onBack={() => choose({ ...sel, step: "look", hotspotId: null })}
        onNext={() => choose({ ...sel, step: "camera", hotspotId: null })}
        nextLabel="Take photo"
      >
        <div className="flex flex-col gap-2.5">
          {look.hotspots.map((h) => (
            <ChoiceRow
              key={h.id}
              eyebrow={h.label}
              title={h.name}
              live={h.status === "live"}
              selected={sel.hotspotId === h.id}
              onSelect={() =>
                choose(
                  // A second tap closes it again on the big screen.
                  { ...sel, hotspotId: sel.hotspotId === h.id ? null : h.id },
                  { type: "detail", id: h.id },
                )
              }
            />
          ))}
        </div>
      </PhoneChoiceScreen>
    );
  }

  if (sel.step === "look" && ethnic) {
    return (
      <PhoneChoiceScreen
        step={1}
        label="Choose your look"
        title="Choose your look"
        prompt={`Pick the ${ethnic.name} dress you'd like to wear.`}
        feedback={feedback}
        onBack={() => choose({ ...sel, step: "ethnic" })}
        onNext={() => choose({ ...sel, step: "learn", hotspotId: null })}
        nextDisabled={!sel.gender}
      >
        <div className="grid grid-cols-2 gap-3">
          {ethnic.looks.map((l) => (
            <LookCard
              key={l.gender}
              ethnic={ethnic}
              look={l}
              selected={sel.gender === l.gender}
              onSelect={(picked) =>
                choose(
                  { ...sel, gender: picked.gender, hotspotId: null },
                  { type: "look", id: picked.gender },
                )
              }
            />
          ))}
        </div>
      </PhoneChoiceScreen>
    );
  }

  return (
    <PhoneChoiceScreen
      step={0}
      label="Choose an ethnic group"
      title="Choose an ethnic group"
      prompt="Tap one — your choice shows up on the big screen."
      feedback={feedback}
      onNext={() => choose({ ...sel, step: "look" })}
      nextDisabled={!sel.ethnicId}
    >
      <div className="flex flex-col gap-2.5">
        {ETHNICS.map((e) => (
          <ChoiceRow
            key={e.id}
            title={e.name}
            subtitle={e.tagline}
            live={e.status === "live"}
            selected={sel.ethnicId === e.id}
            onSelect={() =>
              choose(
                e.status === "live"
                  ? {
                      ...sel,
                      step: "ethnic",
                      ethnicId: e.id,
                      // Keep the look only if it still belongs to this group.
                      gender: e.id === sel.ethnicId ? sel.gender : null,
                      hotspotId: null,
                    }
                  : sel,
                // A coming-soon tap changes nothing, but still gets an answer.
                { type: "ethnic", id: e.id },
              )
            }
          />
        ))}
      </div>
    </PhoneChoiceScreen>
  );
}
