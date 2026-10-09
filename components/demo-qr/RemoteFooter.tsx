import { ChoiceFeedback } from "@/components/ChoiceFeedback";
import type { Feedback } from "@/lib/demoQr";
import { PhoneIcon } from "./PhoneIcon";

/**
 * Takes the place of the Back/Next bar on the phone-controlled kiosk: the
 * kiosk asks, the phone answers, and the answer lands here.
 */
export function RemoteFooter({
  feedback,
  prompt = "Make your choice on your phone",
}: {
  feedback?: Feedback | null;
  prompt?: string;
}) {
  return (
    <footer className="kiosk-no-select kiosk-reach-bottom w-full shrink-0 border-t border-line bg-white/90 px-5 pt-4 backdrop-blur">
      <div className="mx-auto flex min-h-[4.5rem] w-full max-w-3xl items-center justify-center">
        {feedback ? (
          <ChoiceFeedback key={feedback.key} feedback={feedback} size="lg" />
        ) : (
          <p className="animate-fade flex items-center gap-3 text-lg font-semibold text-muted">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink">
              <PhoneIcon />
            </span>
            {prompt}
          </p>
        )}
      </div>
    </footer>
  );
}
