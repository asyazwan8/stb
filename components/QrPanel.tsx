"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";

/**
 * The QR points at our own /p page carrying the fal image URL as a query
 * param — stateless, so the demo needs no database or blob storage, and the
 * origin stays on the STB deployment.
 */
export function QrPanel({ imageUrl }: { imageUrl: string }) {
  const [qr, setQr] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const target = `${window.location.origin}/p?src=${encodeURIComponent(imageUrl)}`;

    QRCode.toDataURL(target, {
      errorCorrectionLevel: "M",
      margin: 1,
      width: 460,
      color: { dark: "#1a1512", light: "#ffffff" },
    })
      .then((url) => {
        if (!cancelled) setQr(url);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
    };
  }, [imageUrl]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl border-2 border-bark/10 bg-white p-5 shadow-sm">
      <div className="flex h-[168px] w-[168px] items-center justify-center overflow-hidden rounded-xl bg-white">
        {qr ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={qr} alt="QR code to download your portrait" className="h-full w-full" />
        ) : failed ? (
          <span className="px-3 text-center text-xs text-muted">
            QR unavailable
          </span>
        ) : (
          <span className="h-full w-full animate-pulse rounded-xl bg-sand" />
        )}
      </div>
      <div className="text-center">
        <p className="text-[15px] font-bold tracking-tight text-ink">Scan to download</p>
        <p className="mt-0.5 text-xs leading-snug text-muted">
          Point your phone camera here
        </p>
      </div>
    </div>
  );
}
