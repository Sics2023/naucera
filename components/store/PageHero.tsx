import type { CSSProperties, ReactNode } from "react";
import { SplitText } from "./Motion";

/**
 * Full-screen storefront hero: photo or looping video at full strength, with a soft gradient only
 * behind the text (no heavy tint over the whole image).
 */
export default function PageHero({ eyebrow, title, text, image, video, poster, children, aside }: {
  eyebrow?: string; title: string; text?: ReactNode; image?: string; video?: string; poster?: string; children?: ReactNode; aside?: ReactNode;
}) {
  const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
  return (
    <section className="relative isolate flex min-h-[calc(100svh-4rem)] items-center overflow-hidden bg-night text-white sm:min-h-[calc(100svh-5rem)]">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {video ? (
          <video data-parallax="0.08" autoPlay muted loop playsInline preload="metadata" poster={poster} className="h-full w-full scale-[1.15] object-cover will-change-transform">
            <source src={video} type="video/mp4" />
          </video>
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          image && <img data-parallax="0.1" src={image} alt="" className="h-full w-full scale-[1.15] object-cover will-change-transform" />
        )}
      </div>
      {/* Soft scrim: darker only on the text side and at the very bottom */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
      {/* On phones the text spans the whole photo, so add a moderate even tint there only */}
      <div className="absolute inset-0 -z-10 bg-black/35 lg:hidden" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-black/45 to-transparent" />

      <div className="mx-auto grid w-full max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          {eyebrow && <p data-reveal="" className="text-sm font-medium tracking-[0.3em] text-gold uppercase">{eyebrow}</p>}
          <SplitText as="h1" text={title} delay={120} className="mt-4 max-w-3xl font-serif text-5xl leading-[1.02] font-semibold drop-shadow-sm sm:text-7xl" />
          {text && <div data-reveal="" style={d(450)} className="mt-6 max-w-xl text-lg leading-relaxed text-white/85 sm:text-xl">{text}</div>}
          {children && <div data-reveal="" style={d(650)} className="mt-9 flex flex-wrap gap-3">{children}</div>}
        </div>
        {aside && <div data-reveal="scale" style={d(400)} className="hidden justify-center lg:flex">{aside}</div>}
      </div>

      <div className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] tracking-[0.3em] text-white/70 uppercase sm:flex">
        Scroll
        <span className="h-10 w-px animate-pulse bg-white/60" />
      </div>
    </section>
  );
}
