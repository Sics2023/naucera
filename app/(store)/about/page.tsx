import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowRight, ArrowUpRight, MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/queries";
import { whatsappLink } from "@/lib/store";
import { CountUp, Marquee, SplitText } from "@/components/store/Motion";
import PageHero from "@/components/store/PageHero";
import { Eyebrow, Sprig } from "@/components/store/Decor";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Naucera is manufactured by Vardhman Foods & Beverages out of Nalbari, Assam – tea, coffee and cooler premixes and vending machines, with 9,000+ active vending machines and 57+ distributors across 117+ cities.",
};

/* Copy: "Naucera_About_Us_Page_Copy.docx" (client), used verbatim. */

const STATS = [
  { value: "9,000+", label: "Active vending machines" },
  { value: "57+", label: "Distributors" },
  { value: "117+", label: "Cities" },
  { value: "40,000+", label: "Sq. ft. automated facility" },
  { value: "4,500+", label: "MT of production delivered" },
  { value: "₹120 Cr+", label: "Cumulative business" },
  { value: "4 Cr+", label: "Cups served annually" },
  { value: "23+", label: "White-label brands" },
];

const RANGE = [
  { t: "Tea Premix", b: "Select, Kadak, Gold, Plain, Lemon, Cappuccino, and Express blends, made with authentic Assam tea extracts.", img: "/products/kadak-tea.webp", tint: "#f4eedc" },
  { t: "Coffee Premix", b: "Select, Kadak, Gold, Espresso, and Coffee-Tea blends, built from South Indian coffee extracts.", img: "/products/kadak-coffee.webp", tint: "#f1e9e2" },
  { t: "Cooler Premix", b: "Moh Maya, Lemon Iced Tea, Cold Coffee, Jalwa Lemonade, and Aam Panna, for instant cold refreshment.", img: "/products/lemon-iced-tea.webp", tint: "#e6f2ee" },
  { t: "Low-Sugar Ranges", b: "the Kadak range with up to 50% less sugar, and the Select range with up to 70% less sugar, for buyers who want bold or premium taste without the full sugar load.", img: "/products/select-tea.webp", tint: "#e3ece4" },
  { t: "Tea & Coffee Vending Machines", b: "2, 3, and 4-lane models, built for a 1 kg premix capacity per lane, a 10-litre water tank, and a dispensing rate of 5 cups per minute, so machine capacity can be matched to actual footfall rather than guessed at.", img: "/vending/select-vm.webp", tint: "#f6efd6" },
  { t: "Pack Formats", b: "standard 500 g and 1 kg packs for bulk and institutional use, plus single-serve sachets for on-the-go and low-volume settings.", img: "/products/special-coffee.webp", tint: "#efe6dc" },
];

const AUDIENCES = [
  {
    t: "For end users",
    sub: "Offices, hospitals, hotels, institutions, factories, schools",
    b: "the question is rarely \"does the premix taste good on day one.\" It’s whether it still tastes the same on day 300, and whether the machine behind it is still running without drama. Naucera’s answer to both is production scale and process: 4,500+ MT of production delivered over the last 10 years, run through four internal management systems (Production, Flow Chart, Inventory, and Checklist & Delegation) built to guarantee precision and transparency on every order, not just the first one.",
  },
  {
    t: "For distributors, dealers, and wholesalers",
    b: "the question is different. It’s whether a manufacturer treats a distributor relationship as a line item or as a business to help build. Naucera’s distributor model includes sales team training, product samples, digital marketing assets, dedicated CRM support, and launch support, organised into Silver, Gold, and Platinum partnership tiers depending on scale and ambition. That structure exists because 57+ active distributors are already running on it.",
  },
  {
    t: "For HORECA buyers and vending operators",
    b: "bulk 500 g and 1 kg packs, consistent batch quality, and a supplier whose production scale means a seasonal spike in demand doesn’t become a seasonal supply problem.",
  },
  {
    t: "For white-label and private-label buyers",
    b: "23+ businesses already manufacture their own tea or coffee brand on Naucera’s production line, drawing on the same 40,000+ sq. ft. facility and quality systems that run Naucera’s own range.",
  },
];

const VALUES = [
  { t: "Origin over shortcuts.", b: "Real Assam tea extract and South Indian coffee extract cost more to source consistently than a generic flavour base. Naucera uses them anyway, because the mission is a brand people trust with every cup, not just the first one." },
  { t: "Consistency as the actual product.", b: "A premix brand isn’t really selling flavour once. It’s selling the same flavour a thousand times over. The internal systems (Production Management, Flow Chart Management, Inventory Management, Checklist & Delegation) exist to make that possible at scale, not just in small batches." },
  { t: "Partnership, not just supply.", b: "A distributor, dealer, or white-label buyer isn’t a one-time transaction. The training, CRM, marketing support, and tiered partnership structure reflect a business built to grow alongside the people who sell it, not just ship to them." },
  { t: "Regional strength, national reach.", b: "Naucera’s Assam manufacturing base is a deliberate anchor, not a limitation. It’s what lets the brand claim real origin credibility while still running a pan-India distribution and vending network." },
];

const SYSTEMS = ["Production Management", "Flow Chart Management", "Inventory Management", "Checklist & Delegation Sheet"];

const PACKS = ["select-tea", "kadak-tea", "cardamom-tea-gold", "lemon-tea", "select-coffee", "kadak-coffee", "coffee-gold", "moh-maya", "jalwa-lemonade", "cold-coffee", "lemon-iced-tea", "aam-panna"];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default async function AboutPage() {
  const settings = await getSettings();
  const talk = whatsappLink(settings.whatsapp, "Hi Naucera team, I'd like to talk about your premixes and vending machines.") ?? "#contact";

  return (
    <>
      <PageHero
        eyebrow="Vardhman Foods & Beverages · Nalbari, Assam"
        title="About Naucera"
        image="/story/tea-garden.webp"
        text="Instantly refreshing. Anytime, anywhere."
        aside={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/mascot/mascot-cup.webp" alt="Naucera mascot" className="float-slow h-[28rem] w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]" />
        }
      />

      {/* Our Story */}
      <section className="relative overflow-hidden bg-cream">
      <Sprig className="absolute hidden lg:block top-16 -left-4 h-80 text-brand-700/25" />
      <Sprig flip className="absolute hidden lg:block -right-4 bottom-10 h-96 text-brand-700/25" />
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div className="lg:col-span-5">
          <Eyebrow>01 — About Naucera</Eyebrow>
          <SplitText text="Our Story" className="mt-4 font-serif text-5xl leading-tight font-semibold text-forest sm:text-6xl" />
          <div data-reveal="clip" className="mt-10 overflow-hidden rounded-[3rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/lifestyle/kadak-tea-scene.webp" alt="Naucera Kadak Tea" className="aspect-[4/5] w-full object-cover" />
          </div>
        </div>
        <div className="space-y-6 text-lg leading-relaxed text-neutral-600 lg:col-span-7 lg:pt-40">
          <p data-reveal="" className="font-serif text-2xl leading-snug text-forest sm:text-3xl">
            Naucera started with a straightforward problem to solve: India drinks a lot of tea and coffee, but very little of it travels well from source to cup. A premix made far from where its tea or coffee actually grows loses something on the way, in freshness, in consistency, sometimes in both.
          </p>
          <p data-reveal="">
            Naucera is manufactured by Vardhman Foods &amp; Beverages out of Nalbari, Assam, in the heart of Northeast India’s tea belt. That location isn’t incidental. It’s the reason the tea premix starts with authentic Assam tea extracts instead of a flattened, well-traveled approximation, and why the coffee range draws on South Indian coffee extracts for the same reason: real origin, real flavour.
          </p>
          <p data-reveal="">
            Ten years in, that approach has built a business that now runs 9,000+ active vending machines and supplies 57+ distributors across 117+ cities, manufacturing out of a 40,000+ sq. ft. automated facility.
          </p>
        </div>
      </div>
      </section>

      {/* Numbers */}
      <section className="relative overflow-hidden bg-night py-20 text-white sm:py-24">
        <div className="pointer-events-none absolute -top-32 -left-32 size-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-32 -bottom-32 size-96 rounded-full bg-gold/15 blur-3xl" />
        <dl className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-4 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.label} data-reveal="" style={d((i % 4) * 90)} className="border-l border-white/15 pl-5">
              <dt className="font-serif text-4xl font-semibold text-gold sm:text-5xl"><CountUp value={s.value} /></dt>
              <dd className="mt-2 text-sm text-white/65">{s.label}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Our Mission */}
      <section className="mx-auto max-w-5xl px-4 py-24 text-center sm:px-6 lg:py-32">
        <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-olive uppercase">02</p>
        <SplitText text="Our Mission" className="mt-3 font-serif text-4xl font-semibold sm:text-5xl" />
        <p data-reveal="blur" className="mt-8 font-serif text-3xl leading-snug font-medium sm:text-5xl sm:leading-tight">
          Naucera’s stated goal is to become India’s most loved and trusted instant beverage brand, serving consistent, flavourful, and instantly enjoyable drinks that connect people everywhere.
        </p>
        <p data-reveal="" style={d(150)} className="mx-auto mt-10 max-w-3xl text-lg leading-relaxed text-neutral-600">
          That mission shows up in a specific operating decision: optimised logistics that preserve quality in every sip, rather than treating freshness as something to compromise on for the sake of distribution reach. For a business, a hospital, a dealer, or a distributor, that decision is what actually gets measured. It is why the same cup tastes the same whether it’s served from a machine in Guwahati or a canteen counter 1,000 kilometres away.
        </p>
      </section>

      {/* Pack strip */}
      <Marquee speed={55} className="border-y border-neutral-200 bg-neutral-50 py-8">
        {PACKS.map((s) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={s} src={`/products/${s}.webp`} alt="" loading="lazy" className="mx-6 h-36 w-auto object-contain drop-shadow-xl transition duration-500 hover:-translate-y-2 sm:h-44" />
        ))}
      </Marquee>

      {/* What We Manufacture */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
          <div>
            <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-brand-700 uppercase">03</p>
            <SplitText text="What We Manufacture" className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
          </div>
          <p data-reveal="" className="text-lg text-neutral-600 lg:text-right">
            Naucera’s range covers over 30 SKUs, built around a few clear categories rather than an undifferentiated catalogue:
          </p>
        </div>
        <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {RANGE.map((r, i) => (
            <article key={r.t} data-reveal="" style={d((i % 3) * 110)}
              className="group relative flex flex-col overflow-hidden rounded-[2rem] p-7 transition duration-500 hover:-translate-y-1.5 hover:shadow-2xl" >
              <div className="absolute inset-0 -z-10 transition duration-500 group-hover:scale-105" style={{ background: r.tint }} />
              <div className="relative grid h-56 place-items-center">
                <div className="absolute bottom-3 h-6 w-2/3 rounded-[50%] bg-black/10 blur-md" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.img} alt="" loading="lazy" className="relative h-full w-auto object-contain transition duration-700 group-hover:-translate-y-2 group-hover:rotate-[-3deg] group-hover:scale-105" />
              </div>
              <h3 className="mt-6 font-serif text-2xl font-semibold">{r.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-neutral-700">{r.b.charAt(0).toUpperCase() + r.b.slice(1)}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Why Businesses and Distributors Choose Naucera */}
      <section className="bg-teal text-white">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 py-24 sm:px-6 lg:grid-cols-12 lg:py-32">
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-32">
              <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-gold uppercase">04</p>
              <SplitText text="Why Businesses and Distributors Choose Naucera" className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
              <div data-reveal="clip" className="mt-10 hidden overflow-hidden rounded-[2rem] lg:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/story/office-vending.webp" alt="Naucera vending machine in an office" className="aspect-[4/3] w-full object-cover" />
              </div>
            </div>
          </div>
          <div className="space-y-5 lg:col-span-7">
            {AUDIENCES.map((a, i) => (
              <article key={a.t} data-reveal="right" style={d(i * 60)} className="rounded-3xl border border-white/10 bg-white/[0.04] p-7 backdrop-blur transition duration-500 hover:border-gold/40 hover:bg-white/[0.07] sm:p-9">
                <div className="flex items-start gap-5">
                  <span className="font-serif text-4xl text-gold/70">0{i + 1}</span>
                  <div>
                    <h3 className="font-serif text-2xl font-semibold">{a.t}</h3>
                    {a.sub && <p className="mt-1 text-xs tracking-wide text-white/50 uppercase">{a.sub}</p>}
                    <p className="mt-4 leading-relaxed text-white/75">{a.b.charAt(0).toUpperCase() + a.b.slice(1)}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-brand-700 uppercase">05</p>
        <SplitText text="Our Values" className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
        <div className="mt-14 divide-y divide-neutral-200 border-y border-neutral-200">
          {VALUES.map((v, i) => (
            <article key={v.t} data-reveal="" className="group grid gap-4 py-10 transition md:grid-cols-12 md:gap-10">
              <span className="font-serif text-5xl text-neutral-300 transition duration-500 group-hover:text-brand-500 md:col-span-2">0{i + 1}</span>
              <h3 className="font-serif text-3xl leading-tight font-semibold md:col-span-4">{v.t}</h3>
              <p className="leading-relaxed text-neutral-600 md:col-span-6">{v.b}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Our Manufacturing Capability */}
      <section className="relative isolate overflow-hidden bg-ink text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax="0.18" src="/story/banner-range.webp" alt="" className="h-full w-full scale-[1.15] object-cover opacity-35 will-change-transform" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink via-ink/90 to-ink/40" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
          <div className="max-w-3xl">
            <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-gold uppercase">06</p>
            <SplitText text="Our Manufacturing Capability" className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
            <p data-reveal="" className="mt-8 text-lg leading-relaxed text-white/75">
              Naucera runs out of a 40,000+ sq. ft. automated manufacturing facility in Nalbari, Assam. Every order, whether it’s a single office’s premix top-up or a distributor’s bulk shipment, moves through the same four tracked systems: Production Management, Flow Chart Management, Inventory Management, and a Checklist &amp; Delegation Sheet, covering the order from production to delivery.
            </p>
            <ul className="mt-8 flex flex-wrap gap-3">
              {SYSTEMS.map((s, i) => (
                <li key={s} data-reveal="scale" style={d(i * 90)} className="rounded-full border border-gold/40 bg-gold/10 px-4 py-2 text-sm text-gold">{s}</li>
              ))}
            </ul>
            <p data-reveal="" className="mt-8 text-lg leading-relaxed text-white/75">
              That infrastructure is what sits behind the numbers: ₹120 Cr+ in cumulative business, 4,500+ MT of production delivered, and 4 crore+ cups served annually across 117+ cities, all over the last 10 years.
            </p>
          </div>
        </div>
      </section>

      {/* Work With Us */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-brand-800 via-brand-900 to-teal px-6 py-16 text-white sm:px-14 sm:py-20">
          <div className="pointer-events-none absolute -top-24 -right-24 size-80 rounded-full bg-gold/20 blur-3xl" />
          <div className="relative grid items-center gap-10 lg:grid-cols-[1fr_auto]">
            <div>
              <p data-reveal="" className="text-sm font-semibold tracking-[0.25em] text-gold uppercase">07</p>
              <SplitText text="Work With Us" className="mt-4 max-w-2xl font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
              <p data-reveal="" className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
                Whether you’re sourcing a tea or coffee vending machine for your business, looking for a tea premix manufacturer or coffee premix manufacturer you can actually depend on, or exploring a distributor, dealer, or white-label partnership, Naucera’s manufacturing scale and partner support are built to back that decision up, not just sell into it.
              </p>
              <div data-reveal="" className="mt-10 flex flex-wrap gap-3">
                <a href={talk} target={talk.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white">
                  <MessageCircle size={18} /> Talk to the Naucera Team
                </a>
                <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-white/30 px-7 py-3.5 font-semibold transition hover:-translate-y-0.5 hover:bg-white/10">
                  Explore Our Product Range <ArrowRight size={18} />
                </Link>
              </div>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-reveal="scale" src="/mascot/mascot-pouring.webp" alt="" className="float-slow mx-auto hidden h-80 w-auto drop-shadow-2xl lg:block" />
          </div>
        </div>
        <p className="mt-6 text-center text-sm text-neutral-500">
          Looking for vending machines? <Link href="/vending-machines" className="inline-flex items-center gap-1 font-medium text-brand-700 hover:underline">See our vending solutions <ArrowUpRight size={14} /></Link>
        </p>
      </section>
    </>
  );
}
