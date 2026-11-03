import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import PageHero from "@/components/store/PageHero";
import { Eyebrow, Sprig } from "@/components/store/Decor";
import { SplitText } from "@/components/store/Motion";

export const metadata: Metadata = {
  title: "Blog",
  description: "Stories, recipes and news from Naucera – tea, coffee and cooler premixes from Assam.",
};

/** Placeholder until blog posts are added. */
export default function BlogPage() {
  return (
    <>
      <PageHero eyebrow="The Naucera Journal" title="Stories, recipes & news" image="/lifestyle/mascot-cafe.webp"
        text="Chai rituals, coffee recipes, cooler ideas for summer and news from our facility in Assam – coming soon." />
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block top-10 -left-4 h-72 text-brand-700/25" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-[auto_1fr]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-reveal="scale" src="/mascot/mascot-cup-chin.webp" alt="Naucera mascot with a cup of tea" className="float-slow mx-auto h-72 w-auto sm:h-96" />
          <div>
            <Eyebrow>Coming soon</Eyebrow>
            <SplitText text="Our first stories are brewing" className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
            <p data-reveal="" className="mt-5 max-w-xl text-lg text-neutral-600">
              While we put the kettle on, explore our premixes or find out how Naucera powers vending machines across India.
            </p>
            <div data-reveal="" className="mt-8 flex flex-wrap gap-3">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-semibold text-white transition hover:bg-brand-800">Explore premixes <ArrowRight size={18} /></Link>
              <Link href="/vending-machines" className="inline-flex items-center gap-2 rounded-full border border-forest px-7 py-3.5 font-semibold text-forest transition hover:bg-forest hover:text-white">Vending machines</Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
