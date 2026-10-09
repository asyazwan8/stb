/* eslint-disable @next/next/no-img-element */
import { Masthead } from "@/components/Masthead";
import type { Ethnic, Look } from "@/lib/ethnics";
import { PhoneIcon } from "./PhoneIcon";
import { RemoteFooter } from "./RemoteFooter";

/**
 * The kiosk while the visitor takes their selfie on the phone. It shows the
 * portrait they are about to step into, laid out like the learn screen.
 */
export function PhoneCameraWaitScreen({ ethnic, look }: { ethnic: Ethnic; look: Look }) {
  return (
    <div className="relative flex h-full flex-col bg-white">
      <Masthead compact step={{ current: 3, total: 4, label: "Take your photo" }} />

      <main className="flex min-h-0 flex-1 flex-col px-6 pb-4">
        <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col">
          <div className="shrink-0">
            <h1 className="animate-fade-up font-display tracking-tight text-4xl font-extrabold text-ink">
              Smile at your phone
            </h1>
            <p className="animate-fade-up mt-2 text-base leading-relaxed text-muted">
              Take your photo on your phone. We&rsquo;ll place your face into this
              portrait, right here on the big screen.
            </p>
          </div>

          <div className="flex min-h-0 flex-1 justify-center py-4">
            <div
              className="animate-fade relative h-full max-w-full overflow-hidden rounded-3xl bg-ink shadow-xl"
              style={{ aspectRatio: `${look.aspect.w} / ${look.aspect.h}` }}
            >
              <img
                src={look.image}
                alt={`${ethnic.name} ${look.label.toLowerCase()} in ${look.name}`}
                className="h-full w-full object-cover"
              />
              <span className="absolute right-4 top-4 flex items-center gap-2 rounded-full bg-white/90 py-2 pl-3 pr-4 text-sm font-bold text-ink shadow-lg">
                <PhoneIcon size={18} />
                On your phone
              </span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/75 to-transparent px-5 pb-4 pt-12">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">
                  {ethnic.name}
                </p>
                <p className="mt-0.5 font-display text-2xl font-extrabold tracking-tight text-white">
                  {look.name}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <RemoteFooter prompt="Waiting for your photo…" />
    </div>
  );
}
