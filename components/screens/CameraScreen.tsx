"use client";

/* eslint-disable @next/next/no-img-element */
import { useCallback, useEffect, useRef, useState } from "react";
import { Masthead } from "@/components/Masthead";
import { StepBar } from "@/components/StepBar";

type CameraState = "starting" | "ready" | "denied" | "error";

/** Long edge of the captured JPEG. Keeps the upload well inside Vercel's
 *  request body limit while staying detailed enough for a good likeness. */
const CAPTURE_LONG_EDGE = 1280;
const CAPTURE_ASPECT = 3 / 4;

export function CameraScreen({
  onBack,
  onCapture,
}: {
  onBack: () => void;
  onCapture: (dataUrl: string) => void;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [state, setState] = useState<CameraState>("starting");
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [flash, setFlash] = useState(false);
  const [shot, setShot] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const start = useCallback(async () => {
    setState("starting");
    setErrorDetail(null);
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("This browser has no camera API. Try Safari or Chrome over HTTPS.");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1440 },
          height: { ideal: 1920 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setState("ready");
    } catch (err) {
      const name = err instanceof DOMException ? err.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") {
        setState("denied");
      } else {
        setState("error");
        setErrorDetail(err instanceof Error ? err.message : "Camera unavailable.");
      }
    }
  }, []);

  useEffect(() => {
    void start();
    return stop;
  }, [start, stop]);

  const capture = useCallback(() => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;

    // Centre-crop to the portrait framing the visitor actually saw.
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    let sw = vw;
    let sh = Math.round(vw / CAPTURE_ASPECT);
    if (sh > vh) {
      sh = vh;
      sw = Math.round(vh * CAPTURE_ASPECT);
    }
    const sx = Math.round((vw - sw) / 2);
    const sy = Math.round((vh - sh) / 2);

    const scale = Math.min(1, CAPTURE_LONG_EDGE / sh);
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(sw * scale);
    canvas.height = Math.round(sh * scale);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // Drawn unmirrored: the preview is flipped for comfort, but the model
    // should get the face as the camera actually saw it.
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);

    setFlash(true);
    window.setTimeout(() => setFlash(false), 220);
    setShot(canvas.toDataURL("image/jpeg", 0.86));
  }, []);

  // 3 - 2 - 1 - snap
  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      capture();
      setCountdown(null);
      return;
    }
    const id = window.setTimeout(() => setCountdown((c) => (c ?? 1) - 1), 900);
    return () => window.clearTimeout(id);
  }, [countdown, capture]);

  const retake = () => {
    setShot(null);
    setCountdown(null);
  };

  const confirm = () => {
    if (!shot) return;
    stop();
    onCapture(shot);
  };

  const busy = countdown !== null;

  return (
    <div className="flex h-full flex-col bg-white">
      <Masthead compact step={{ current: 3, total: 4, label: "Take your photo" }} />

      <main className="flex min-h-0 flex-1 flex-col px-6 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
          <div className="shrink-0">
            <h1 className="animate-fade-up font-display tracking-tight text-4xl font-extrabold text-ink">
              {shot ? "Happy with this?" : "Look at the camera"}
            </h1>
            <p className="animate-fade-up mt-2 text-base leading-relaxed text-muted">
              {shot
                ? "We'll place your face into the portrait you chose."
                : "Centre your face in the oval, then tap the button below."}
            </p>
          </div>

          {/* Height-driven: the capture button must never fall below the fold. */}
          <div className="flex min-h-0 flex-1 justify-center py-4">
            <div className="relative h-full max-w-full overflow-hidden rounded-3xl bg-ink shadow-xl aspect-[3/4]">
              {shot ? (
                <img src={shot} alt="Your photo" className="h-full w-full object-cover" />
              ) : (
                <>
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    autoPlay
                    className="h-full w-full scale-x-[-1] object-cover"
                  />

                  {/* Face guide */}
                  {state === "ready" ? (
                    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                      <div className="h-[62%] w-[52%] -translate-y-[6%] rounded-[50%] border-[0.1875rem] border-dashed border-white/65" />
                    </div>
                  ) : null}

                  {state === "starting" ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink">
                      <p className="text-sm font-semibold text-white/80">
                        Starting camera&hellip;
                      </p>
                    </div>
                  ) : null}

                  {state === "denied" || state === "error" ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-ink px-8 text-center">
                      <p className="font-display tracking-tight text-2xl font-bold text-white">
                        {state === "denied" ? "Camera blocked" : "Camera unavailable"}
                      </p>
                      <p className="text-sm leading-relaxed text-white/70">
                        {state === "denied"
                          ? "Allow camera access for this site in your browser settings, then try again."
                          : (errorDetail ?? "Something went wrong reaching the camera.")}
                      </p>
                      <button
                        type="button"
                        onClick={() => void start()}
                        className="mt-1 h-12 rounded-xl bg-white px-6 font-bold text-ink transition active:scale-95"
                      >
                        Try again
                      </button>
                    </div>
                  ) : null}

                  {countdown !== null && countdown > 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/35">
                      <span
                        key={countdown}
                        className="animate-fade font-display tracking-tight text-[9rem] font-bold leading-none text-white drop-shadow-2xl"
                      >
                        {countdown}
                      </span>
                    </div>
                  ) : null}
                </>
              )}

              {flash ? <div className="absolute inset-0 bg-white" /> : null}
            </div>
          </div>

          {shot ? (
            <div className="grid shrink-0 grid-cols-2 gap-3">
              <button
                type="button"
                onClick={retake}
                className="h-16 rounded-full border border-ink/20 text-lg font-semibold text-muted transition active:scale-[0.97] active:bg-surface"
              >
                Retake
              </button>
              <button
                type="button"
                onClick={confirm}
                className="h-16 rounded-full bg-gold text-lg font-bold text-white shadow-lg shadow-black/10 transition active:scale-[0.97]"
              >
                Use this photo
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCountdown(3)}
              disabled={state !== "ready" || busy}
              className="h-20 w-full shrink-0 rounded-full bg-gold text-2xl font-bold text-white shadow-xl shadow-black/10 transition active:scale-[0.97] disabled:bg-ink/20 disabled:text-muted disabled:shadow-none"
            >
              {busy ? "Hold still…" : "Take photo"}
            </button>
          )}

          <p className="mt-3 shrink-0 text-center text-xs leading-relaxed text-muted">
            Your photo is sent once to create your portrait and is not stored by
            this kiosk.
          </p>
        </div>
      </main>

      <StepBar onBack={onBack} backLabel={shot ? "Back" : "Back"} />
    </div>
  );
}
