import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { ArrowDown, Award, BadgeCheck, BarChart3, GraduationCap, Handshake, Headphones, MapPin, Megaphone, Network, Package, Rocket, ShieldCheck, Sparkles, TestTube2 } from "lucide-react";
import PageHero from "@/components/store/PageHero";
import DistributorForm from "@/components/store/DistributorForm";
import { Eyebrow, Sprig, Wave } from "@/components/store/Decor";
import { CountUp, SplitText } from "@/components/store/Motion";

export const metadata: Metadata = {
  title: "Become a Distributor",
  description: "Become a Naucera distributor – 57+ active distributors, 9,000+ active vending machines and end-to-end business support from East India's leading instant beverages brand.",
};

/* Copy from naucera.in/distributors, the Distributor Opportunity Deck and naucera.in/lp. */

const REASONS = [
  { icon: Award, t: "Proven Excellence", b: "4Cr+ cups sold per year across 117+ cities." },
  { icon: ShieldCheck, t: "Built on Consistency & Trust", b: "120+ Crore in Cumulative Business. 4500+ MT of production delivered in last 10 years." },
  { icon: Network, t: "PAN India networking", b: "57+ active distributors & 9000+ active vending machines." },
  { icon: Package, t: "High Demand SKU's", b: "30+ High-Demand SKUs Across (Tea, Coffee, Lemon & More)." },
  { icon: Sparkles, t: "Comprehensive Solutions", b: "End-to-end support for all marketing and promotional needs with dedicated CRM." },
  { icon: MapPin, t: "The Only Premix Manufacturer in the Northeast", b: "Fresh from Assam, delivered with optimized logistics to preserve the freshness in every sip." },
];

const SUPPORT = [
  { icon: GraduationCap, t: "Sales team training" },
  { icon: TestTube2, t: "Samples support" },
  { icon: Megaphone, t: "Digital sales support" },
  { icon: Headphones, t: "Dedicated CRM support" },
  { icon: Rocket, t: "High-impact, low-cost launch" },
];

const SYSTEMS = ["Production Management System (PMS)", "Flow Chart Management System (FMS)", "Checklist (CL) & Delegation Sheet (DS)", "Inventory Management System (IMS)"];

const STATS = [
  { v: "57+", l: "Active distributors" },
  { v: "9,000+", l: "Active vending machines" },
  { v: "117+", l: "Cities" },
  { v: "30+", l: "High-demand SKUs" },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function DistributorsPage() {
  return (
    <>
      <PageHero
        eyebrow="Franchise & Distributors"
        title="Become Our Distributor"
        image="/story/banner-range-2.webp"
        text="Partner with East India’s leading instant beverages brand – strength in every sip, soul in every cup."
        aside={
          // eslint-disable-next-line @next/next/no-img-element
          <img src="/mascot/mascot-thumbsup.webp" alt="Naucera mascot" className="float-slow h-[24rem] w-auto drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]" />
        }
      >
        <a href="#enquire" className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white">
          Enquire now <ArrowDown size={18} />
        </a>
      </PageHero>

      {/* Stats */}
      <section className="bg-forest text-white">
        <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-4 py-12 sm:px-6 md:grid-cols-4">
          {STATS.map((s, i) => (
            <div key={s.l} data-reveal="" style={d(i * 90)} className="text-center">
              <dt className="font-serif text-4xl font-semibold text-gold sm:text-5xl"><CountUp value={s.v} /></dt>
              <dd className="mt-1 text-sm text-white/65">{s.l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Network */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block top-12 -left-4 h-72 text-brand-700/25" />
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:gap-20 lg:py-28">
          <div>
            <Eyebrow>Our network</Eyebrow>
            <SplitText text="Serving every corner of the Northeast" className="mt-4 font-serif text-4xl leading-tight font-semibold text-forest sm:text-5xl" />
            <p data-reveal="" className="mt-6 text-lg leading-relaxed text-neutral-600">
              Our Distributors, Sub-Distributors channels from Different corners of North Eastern Region helps in providing quality services to our ultimate customers.
            </p>
            <p data-reveal="" className="mt-4 text-lg leading-relaxed text-neutral-600">
              Fast-Track Onboarding: Silver, Gold &amp; Platinum distributor partnership options available.
            </p>
          </div>
          <div data-reveal="scale" className="rounded-[3rem] bg-white p-6 shadow-[0_30px_80px_-40px_rgba(22,58,43,0.45)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/distributor/ne-map.webp" alt="Map of Naucera's distributor network across North East India" className="w-full" />
          </div>
        </div>
        <Wave color="#ffffff" accent="#efe3c8" />
      </section>

      {/* Why become a distributor */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
        <div className="text-center">
          <div className="flex justify-center"><Eyebrow>Why partner with us</Eyebrow></div>
          <SplitText text="Why Become a Naucera Distributor?" className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
        </div>
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {REASONS.map((r, i) => (
            <div key={r.t} data-reveal="" style={d((i % 3) * 110)}
              className="group relative overflow-hidden rounded-[2rem] rounded-tr-[4rem] border border-neutral-200 p-8 transition duration-500 hover:-translate-y-1.5 hover:border-brand-200 hover:shadow-[0_30px_60px_-30px_rgba(22,58,43,0.4)]">
              <span className="absolute top-6 right-8 font-serif text-6xl text-neutral-100 transition group-hover:text-brand-50">{i + 1}</span>
              <span className="relative grid size-14 place-items-center rounded-2xl bg-forest text-gold"><r.icon size={24} /></span>
              <h3 className="relative mt-6 font-serif text-2xl font-semibold text-forest">{r.t}</h3>
              <p className="relative mt-2 leading-relaxed text-neutral-600">{r.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Business support + systems */}
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax="0.15" src="/story/office-vending.webp" alt="" className="h-full w-full scale-[1.15] object-cover will-change-transform" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-forest/95 via-forest/80 to-forest/40" />
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-32">
          <div>
            <Eyebrow tone="text-gold">End-to-end business support</Eyebrow>
            <SplitText text="We grow alongside the people who sell Naucera" className="mt-4 font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
            <ul className="mt-10 grid gap-3 sm:grid-cols-2">
              {SUPPORT.map((s, i) => (
                <li key={s.t} data-reveal="" style={d(i * 80)} className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
                  <s.icon size={20} className="text-gold" /> {s.t}
                </li>
              ))}
            </ul>
          </div>
          <div className="lg:pt-8">
            <div data-reveal="" className="rounded-[2.5rem] bg-white/95 p-8 text-ink shadow-2xl sm:p-10">
              <p className="flex items-center gap-2 text-sm font-semibold tracking-[0.2em] text-brand-700 uppercase"><BarChart3 size={18} /> Smart systems – seamless scaling</p>
              <p className="mt-3 font-serif text-2xl text-forest">Your brand, backed by advanced frameworks for 100% precision and transparency.</p>
              <ul className="mt-6 space-y-3">
                {SYSTEMS.map((s) => <li key={s} className="flex gap-3 text-neutral-700"><BadgeCheck size={20} className="shrink-0 text-brand-600" />{s}</li>)}
              </ul>
              <div className="mt-8 flex items-center gap-4 rounded-2xl bg-cream p-4">
                <Handshake className="shrink-0 text-forest" size={28} />
                <p className="text-sm text-neutral-700"><b className="text-forest">Packs we deal in:</b> 1 kg and 500 gm packs, plus single-serve sachets.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enquiry form */}
      <section id="enquire" className="scroll-mt-20 bg-night text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:py-28">
          <div>
            <Eyebrow tone="text-gold">Enquire now</Eyebrow>
            <SplitText text="Become Our Distributor" className="mt-4 font-serif text-5xl leading-tight font-semibold sm:text-6xl" />
            <p data-reveal="" className="mt-6 max-w-md text-lg text-white/75">Share a few details and our team will call you to talk about the right partnership plan for your area.</p>
            <div data-reveal="" className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <p className="text-sm font-semibold tracking-[0.2em] text-gold uppercase">Naucera · Vardhman Foods and Beverages</p>
              <p className="mt-3 flex gap-3 text-white/75"><MapPin size={20} className="mt-0.5 shrink-0 text-gold" />House No 03, Ground Floor, Shree Niwas House, By Lane Number 03, AK Azad Rd, Sarabbhati, Rehabari, Guwahati, Assam 781008</p>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img data-reveal="scale" src="/mascot/mascot-support.webp" alt="" className="float-slow mt-10 hidden h-64 w-auto lg:block" />
          </div>
          <div data-reveal="" className="flex flex-col justify-center rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-forest to-night p-6 shadow-2xl sm:p-10">
            <DistributorForm />
          </div>
        </div>
      </section>
    </>
  );
}
