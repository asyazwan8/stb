import type { Metadata } from "next";
import { PhoneController } from "@/components/demo-qr/PhoneController";

export const metadata: Metadata = {
  title: "Sarawak — your photobooth controls",
  robots: { index: false },
};

/** Where the kiosk's start QR lands. `.phone-stage` sets the phone's type scale. */
export default async function DemoQrPhonePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="flex h-dvh w-full justify-center bg-surface">
      <div className="phone-stage relative h-dvh w-full max-w-[32rem] overflow-hidden bg-white">
        <PhoneController id={id} />
      </div>
    </div>
  );
}
