import type { Metadata } from "next";
import { KioskStage } from "@/components/KioskStage";
import { DemoQrKiosk } from "@/components/demo-qr/DemoQrKiosk";

export const metadata: Metadata = {
  title: "Sarawak — Gateway to Borneo",
  robots: { index: false },
};

/** The kiosk in phone-controlled mode: it shows a QR, then follows the phone. */
export default function DemoQrPage() {
  return (
    <KioskStage>
      <DemoQrKiosk />
    </KioskStage>
  );
}
