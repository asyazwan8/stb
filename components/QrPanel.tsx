"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * A QR code for a path on this deployment. The download code points at our
 * own /p page carrying the fal image URL as a query param — stateless, so the
 * demo needs no blob storage, and the origin stays on the STB deployment.
 */
export function QrPanel({
  path,
  title = "Scan to download",
  caption = "Point your phone camera here",
  alt = "QR code to download your portrait",
  size = "md",
}: {
  /** Same-origin path, e.g. `/p?src=…`. Null shows a placeholder. */
  path: string | null;
  title?: string;
  caption?: string;
  alt?: string;
  size?: "md" | "lg";
}) {
  const [qr, setQr] = useState<{ path: string; url: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const [target, setTarget] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    if (!path) {
      setTarget(null);
      return;
    }
    const url = `${window.location.origin}${path}`;
    setTarget(url);

    QRCode.toDataURL(url, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: size === "lg" ? 640 : 460,
      color: { dark: "#1a1512", light: "#ffffff" },
    })
      .then((data) => {
        if (!cancelled) setQr({ path, url: data });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [path, size]);

  const lg = size === "lg";
  // Never show the previous code while the next one renders.
  const current = qr?.path === path ? qr.url : null;

  return (
    <div
      data-qr-target={target ?? undefined}
      className={`flex flex-col items-center rounded-3xl border-2 border-line bg-white shadow-sm ${
        lg ? "gap-4 p-6" : "gap-3 p-5"
      }`}
    >
      <div
        className={`flex items-center justify-center overflow-hidden rounded-xl bg-white ${
          lg ? "h-[15rem] w-[15rem]" : "h-[10.5rem] w-[10.5rem]"
        }`}
      >
        {current ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={current} alt={alt} className="h-full w-full" />
        ) : failed ? (
          <span className="px-3 text-center text-xs text-muted">QR unavailable</span>
        ) : (
          <span className="h-full w-full animate-pulse rounded-xl bg-surface" />
        )}
      </div>
      <div className="text-center">
        <p
          className={`font-bold tracking-tight text-ink ${
            lg ? "text-xl" : "text-[0.9375rem]"
          }`}
        >
          {title}
        </p>
        <p className={`mt-0.5 leading-snug text-muted ${lg ? "text-sm" : "text-xs"}`}>
          {caption}
        </p>
      </div>
    </div>
  );
}
