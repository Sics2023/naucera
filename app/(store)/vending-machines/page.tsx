import Link from "next/link";
import type { Metadata } from "next";
import type { CSSProperties } from "react";
import {
  AlertTriangle, ArrowRight, BadgeCheck, Boxes, Building2, ClipboardCheck, Factory, Gift, Headphones, Hourglass, MapPinned,
  MessageCircle, PackageCheck, Rocket, Search, ShieldCheck, Star, TrendingDown, Truck, Users, Wrench,
} from "lucide-react";
import { getSettings } from "@/lib/queries";
import { whatsappLink } from "@/lib/store";
import PageHero from "@/components/store/PageHero";
import { Eyebrow, Sprig, Wave } from "@/components/store/Decor";
import { CountUp, Marquee, SplitText } from "@/components/store/Motion";

export const metadata: Metadata = {
  title: "Tea & Coffee Vending Machines",
  description:
    "Tea and coffee vending machines, premix supply and distributor support from Naucera – trusted by 57+ active distributors and powering 9,000+ active vending machines.",
};

/* Copy and figures from naucera.in/lp; machine specification from the Naucera Brand Catalogue. */

const PAINS = [
  { icon: Wrench, t: "Tired of unreliable hardware?", b: "Dealing with a tea or coffee vending machine that jams, breaks down, or runs out of stock at the worst time?" },
  { icon: Headphones, t: "Ghosted by support?", b: "Stuck with a vending machine dealer who disappears after installation and never answers service calls?" },
  { icon: AlertTriangle, t: "Facing customer complaints?", b: "Getting inconsistent taste from your current coffee premix because every batch is different?" },
  { icon: Truck, t: "Dealing with supply chain nightmares?", b: "Struggling to find a genuine tea premix manufacturer who delivers on time, every time?" },
  { icon: TrendingDown, t: "Squeezed margins?", b: "Paying more for less—smaller SKUs, poor margins, and zero real distributor support?" },
];

const LOSSES = [
  { t: "Repeat Footfall", b: "Employees, guests, and patients who stop trusting the machine stop using it." },
  { t: "Brand Reputation", b: "A bad cup served in your office, hotel lobby, or hospital waiting room reflects on you, not just the machine." },
  { t: "Margins", b: "Cheap, inconsistent premix means more wastage, more complaints, and more replacements." },
  { t: "Time", b: "Chasing an unresponsive vending machine supplier for service, spares, or restocking is time you don't get back." },
  { t: "Growth", b: "If you're a distributor or dealer, working with a manufacturer who can't scale with you means you hit a ceiling fast." },
];

const STATS = [
  { v: "4 Crore+", l: "Cups sold per year across 117+ cities" },
  { v: "₹120+", l: "Crore Cumulative business delivered" },
  { v: "4,500+", l: "MT Production delivered (last 10 years)" },
  { v: "57+", l: "Active distributors pan-India" },
  { v: "9,000+", l: "Active vending machines" },
  { v: "30+", l: "High-Demand SKUs" },
  { v: "23+", l: "Successful white-labelling / private-label clients" },
  { v: "93.7%", l: "On-time delivery rate" },
  { v: "88.3%", l: "Client retention rate" },
  { v: "40,000+", l: "sq. ft. Automated manufacturing facility" },
];

const WHY = [
  { icon: MapPinned, t: "The Only Premix Manufacturer in the Northeast", b: "Fresh production, optimized logistics, and faster delivery than any pan-India supplier trying to reach Assam and the Northeast." },
  { icon: Factory, t: "Unmatched Manufacturing Scale", b: "4,500+ MT of production delivered in the last 10 years guarantees consistent quality, batch after batch." },
  { icon: Boxes, t: "30+ High-Demand SKUs", b: "Giving distributors and vending machine operators a full range to work with." },
  { icon: Users, t: "End-to-End Business Support", b: "Sales team training, sample support, digital sales materials, dedicated CRM, and high-impact launch support for every distributor we onboard." },
  { icon: ClipboardCheck, t: "Smart Systems for Total Transparency", b: "Our Production Management System (PMS) and Inventory Management System (IMS) ensure every order is tracked and delivered right." },
  { icon: PackageCheck, t: "Flexible Pack Formats", b: "1 Kg packets and pouches designed specifically for vending machines, plus single-serve sachets for on-the-go consumption." },
];

const SEGMENTS = [
  { t: "The Naucera Kadak Segment", b: "Bold, authentic taste with up to 50% less sugar.", img: "/products/kadak-tea.webp" },
  { t: "The Naucera Select Segment", b: "Premium blends crafted with up to 70% less sugar.", img: "/products/select-coffee.webp" },
  { t: "The Naucera Coolers Segment", b: "Iced, Bold & Beautiful!", img: "/products/lemon-iced-tea.webp" },
];

const SPECS = [
  ["Options available", "2 / 3 / 4 lane"],
  ["Weight", "17.2 / 21 / 22 kg"],
  ["Machine dimensions", "12.99 × 17.32 × 27.17 in"],
  ["Premix capacity", "1 kg per lane"],
  ["Water tank capacity", "10 litres"],
  ["Dispensing rate", "5 cups per minute"],
  ["Start-up time", "10–15 mins"],
  ["Power", "2 kW"],
  ["Warranty period", "1 year"],
];

const REVIEWS = [
  { q: "Naucera masala tea is soo amazing and unique in taste", n: "Vivek Singha" },
  { q: "Best and refreshing tea for every morning", n: "Lovita Das" },
  { q: "Naucera is not just a tea for me every morning, it is an emotion for my family. Feeling refreshed!", n: "Rana Balmiki" },
  { q: "Loved the tea,perfect refreshing taste,Instant teas are the best, also tea powder is really good,must try", n: "Abhilasha Choudhury" },
];

const ADVANTAGES = [
  { icon: Search, t: "Free Site Assessment", b: "Identify the perfect tea or coffee vending machine for your space." },
  { icon: Gift, t: "Free Premix Sample Kit", b: "Taste our 100% Pure Taste instant tea and coffee ranges before you commit." },
  { icon: Headphones, t: "Dedicated CRM Support", b: "From day one, for end-users, dealers, and distributors alike." },
  { icon: Rocket, t: "Fast-Track Onboarding", b: "Silver, Gold & Platinum distributor partnership options available." },
  { icon: Hourglass, t: "30-Day Private Label Launch", b: "Full white-label manufacturing support to launch your own brand." },
];

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default async function VendingPage() {
  const settings = await getSettings();
  const wa = (text: string) => whatsappLink(settings.whatsapp, text) ?? "#contact";
  const ext = (href: string) => (href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {});
  const consult = wa("Hi Naucera, I'd like a free consultation on vending machines and premix supply.");
  const HELP = [
    { icon: Building2, t: "I need a machine for my office/hospital/hotel", cta: "Get a Free Quote", href: wa("Hi Naucera, I need a vending machine for my office/hospital/hotel. Please share a quote.") },
    { icon: Users, t: "I want to become a Naucera distributor/dealer", cta: "Explore Distributor Plans", href: wa("Hi Naucera, I want to become a Naucera distributor/dealer.") },
    { icon: Boxes, t: "I want bulk tea/coffee premix supply", cta: "Request Bulk Pricing", href: wa("Hi Naucera, I want bulk tea/coffee premix supply. Please share pricing.") },
    { icon: Star, t: "I want to launch my own beverage brand", cta: "Book a White Label Consultation", href: wa("Hi Naucera, I want to launch my own beverage brand (white label).") },
  ];

  return (
    <>
      <PageHero
        video="/video/vending-hero.mp4"
        poster="/video/vending-hero.jpg"
        eyebrow="Tea & coffee vending · Premix supply"
        title="More than just a machine."
        text={
          <>
            <p className="font-medium text-white">Looking for a Tea Vending Machine Supplier or Coffee Vending Machine Supplier That Delivers More Than Just a Machine?</p>
            <p className="mt-3">From Premium Instant Tea &amp; Coffee Premixes to Complete Supply &amp; Business Support—We’ve Got You Covered.</p>
          </>
        }
      >
        <a href={consult} {...ext(consult)} className="inline-flex items-center gap-2 rounded-full bg-gold px-7 py-3.5 font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-white">
          Get my free consultation <ArrowRight size={18} />
        </a>
        <a href="#machines" className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-7 py-3.5 font-semibold backdrop-blur transition hover:-translate-y-0.5 hover:bg-white/20">See the machines</a>
      </PageHero>

      {/* Trust strip + "I am looking for" */}
      <section className="bg-forest text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-center">
          <p data-reveal="" className="max-w-xl text-white/85">Trusted by <b className="text-gold">57+ active distributors</b> and powering <b className="text-gold">9,000+ active vending machines</b> across North East India.</p>
          <div data-reveal="" className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-sm text-white/60">I am looking for</span>
            {["White Label", "Distributorship", "Premix Supply", "Vending Machine"].map((x) => {
              const h = wa(`Hi Naucera, I am looking for: ${x}. I'd like a free consultation.`);
              return <a key={x} href={h} {...ext(h)} className="rounded-full border border-white/25 px-4 py-2 text-sm transition hover:border-gold hover:bg-gold hover:text-ink">{x}</a>;
            })}
          </div>
        </div>
      </section>

      {/* Splash machine */}
      <section id="machines" className="relative scroll-mt-20 overflow-hidden bg-white">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div data-reveal="scale" className="relative">
            <video autoPlay muted loop playsInline preload="metadata" poster="/video/vending-splash.jpg" className="mx-auto w-full max-w-xl" aria-label="Naucera instant hot and cold beverage vending machine">
              <source src="/video/vending-splash.mp4" type="video/mp4" />
            </video>
          </div>
          <div>
            <Eyebrow>Our Range of Vending Machines</Eyebrow>
            <SplitText text="Fresh drinks at the touch of a button" className="mt-4 font-serif text-4xl leading-tight font-semibold text-forest sm:text-5xl" />
            <p data-reveal="" className="mt-5 text-lg leading-relaxed text-neutral-600">
              Streamline your drink service with our versatile beverage vending machines. Engineered for fast, hassle-free operation and consistent quality – effortless refreshment instantly every time.
            </p>
            <dl data-reveal="" className="mt-8 grid grid-cols-2 overflow-hidden rounded-3xl border border-neutral-200 sm:grid-cols-3">
              {SPECS.map(([k, v]) => (
                <div key={k} className="border-b border-r border-neutral-200 p-4 last:border-r-0">
                  <dt className="text-xs tracking-wide text-neutral-500 uppercase">{k}</dt>
                  <dd className="mt-1 font-semibold text-forest">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Ask yourself */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block top-12 -left-4 h-72 text-brand-700/25" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
          <div className="text-center">
            <div className="flex justify-center"><Eyebrow>Before you sign up with another vendor</Eyebrow></div>
            <SplitText text="Ask yourself" className="mt-4 font-serif text-5xl font-semibold text-forest sm:text-6xl" />
          </div>
          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {PAINS.map((x, i) => (
              <div key={x.t} data-reveal="" style={d(i * 90)} className="rounded-[2rem] bg-white p-6 shadow-[0_20px_50px_-30px_rgba(22,58,43,0.35)] transition duration-500 hover:-translate-y-1.5">
                <x.icon className="text-brand-600" size={26} />
                <h3 className="mt-4 font-serif text-xl font-semibold text-forest">{x.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">{x.b}</p>
              </div>
            ))}
          </div>
          <p data-reveal="" className="mx-auto mt-12 max-w-2xl text-center text-lg text-neutral-700">
            If any of this sounds familiar, you&apos;re not alone—and it&apos;s costing you more than you think.
          </p>
          <div data-reveal="" className="mt-6 flex justify-center">
            <a href={consult} {...ext(consult)} className="inline-flex items-center gap-2 rounded-full bg-forest px-7 py-3.5 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800">
              Talk to a beverage business consultant <ArrowRight size={18} />
            </a>
          </div>
        </div>
        <Wave color="#1d2827" accent="#eadfc4" />
      </section>

      {/* The real cost */}
      <section className="bg-night text-white">
        <div className="mx-auto grid max-w-7xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:py-28">
          <div>
            <SplitText text="Choosing the Wrong Vending Machine or Premix Partner Doesn't Just Cost You Money. It Costs You Customers." className="font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
            <p data-reveal="" className="mt-6 text-lg text-white/75">Every day you run with an unreliable tea vending machine or coffee vending machine, you’re losing more than a cup of tea or coffee. You’re losing:</p>
            <div data-reveal="" className="mt-10 rounded-[2rem] border border-gold/30 bg-gold/10 p-7">
              <p className="font-serif text-2xl text-gold">The Pricing Trap</p>
              <p className="mt-3 text-white/80">If you’ve been evaluating tea premix powder suppliers or a tea coffee premix supplier purely on price, beware. The cheapest premix is almost always the one with the highest customer complaints, the shortest shelf life, and the least consistent taste.</p>
              <p className="mt-4 font-medium text-white">The real cost of the wrong partner isn’t the invoice. It’s the customers who quietly stop drinking from your machine.</p>
            </div>
          </div>
          <ol className="space-y-4 lg:pt-4">
            {LOSSES.map((x, i) => (
              <li key={x.t} data-reveal="right" style={d(i * 90)} className="flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
                <span className="font-serif text-4xl text-gold/70">0{i + 1}</span>
                <div>
                  <p className="font-serif text-xl font-semibold">{x.t}</p>
                  <p className="mt-1 text-white/70">{x.b}</p>
                </div>
              </li>
            ))}
            <li data-reveal="" className="pt-4 text-white/70">This is exactly why businesses across Assam, the Northeast, and pan-India are switching to a single, accountable partner who manufactures the premix, supports the machines, and stands behind both—Naucera.</li>
          </ol>
        </div>
      </section>

      {/* Meet Naucera */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <div data-reveal="clip" className="overflow-hidden rounded-[3rem]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/vending/bakery.webp" alt="Naucera vending machine in a bakery café" className="aspect-[4/5] w-full object-cover" />
          </div>
          <div>
            <Eyebrow>Meet Naucera</Eyebrow>
            <SplitText text="The Only Premix Manufacturer in the Northeast, Now Powering Vending Machines & Bulk Supply Pan-India" className="mt-4 font-serif text-3xl leading-tight font-semibold text-forest sm:text-4xl" />
            <p data-reveal="" className="mt-6 text-lg leading-relaxed text-neutral-600">
              At Naucera, we don’t just sell instant tea premix and instant coffee premix—we build complete, accountable beverage systems. Whether you need a single machine for your office pantry or a bulk supply contract as a vending machine operator, distributor, or HORECA buyer, we are built to serve you end-to-end.
            </p>
            <div data-reveal="" className="mt-6 rounded-3xl bg-cream p-6">
              <p className="font-serif text-xl font-semibold text-forest">Authentic Regional Extracts</p>
              <p className="mt-2 text-neutral-600">We believe a great cup starts at the source. Our tea premixes deliver that signature kadak punch using genuine Assam tea extracts, while our coffee blends boast the rich, aromatic depth of premium South Indian coffee extracts. Real regional flavors, zero compromises.</p>
            </div>
          </div>
        </div>
        <div className="mt-16 grid gap-5 md:grid-cols-2">
          {[
            { t: "For End Users", s: "Offices, Hospitals, Hotels, Factories, Schools", items: ["Vending machine installation, AMC & consumables", "Bulk tea/coffee premix for canteens & cafeterias", "Consistent taste, every cup, every time"], dark: false },
            { t: "For the Trade", s: "Distributors, Dealers, Wholesalers", items: ["Vending machine dealer & supplier programs", "Coffee premix manufacturer for private label", "White-label & own-brand manufacturing"], dark: true },
          ].map((c, i) => (
            <div key={c.t} data-reveal="" style={d(i * 120)} className={`rounded-[2.5rem] p-8 sm:p-10 ${c.dark ? "rounded-br-[5rem] bg-forest text-white" : "rounded-bl-[5rem] bg-cream"}`}>
              <h3 className={`font-serif text-3xl font-semibold ${c.dark ? "" : "text-forest"}`}>{c.t}</h3>
              <p className={`mt-1 text-sm ${c.dark ? "text-white/60" : "text-neutral-500"}`}>{c.s}</p>
              <ul className="mt-6 space-y-3">
                {c.items.map((x) => <li key={x} className="flex gap-3"><BadgeCheck size={20} className={`shrink-0 ${c.dark ? "text-gold" : "text-brand-600"}`} />{x}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Numbers */}
      <section className="relative overflow-hidden bg-forest py-24 text-white">
        <div className="pointer-events-none absolute -top-32 left-1/3 size-96 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
          <SplitText text="Real Numbers. Real Business Growth. Real Reliability." className="max-w-3xl font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-5">
            {STATS.map((s, i) => (
              <div key={s.l} data-reveal="" style={d((i % 5) * 80)} className="border-l border-white/15 pl-5">
                <dt className="font-serif text-4xl font-semibold text-gold"><CountUp value={s.v} /></dt>
                <dd className="mt-2 text-sm text-white/65">{s.l}</dd>
              </div>
            ))}
          </dl>
          <p data-reveal="" className="mt-14 max-w-3xl text-white/75">
            Whether you’re an instant coffee vending machine operator managing 5 sites or a buyer sourcing on behalf of a hotel chain, these aren’t just marketing numbers—they’re the operational track record that lets you plan your business with confidence.
          </p>
        </div>
      </section>

      {/* Why Naucera */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig flip className="absolute hidden lg:block top-20 -right-4 h-80 text-brand-700/25" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
          <Eyebrow>Why Naucera</Eyebrow>
          <SplitText text="Why Businesses Choose Naucera Over Any Other Supplier" className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-semibold text-forest sm:text-5xl" />
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {SEGMENTS.map((s, i) => (
              <div key={s.t} data-reveal="" style={d(i * 110)} className="group flex items-center gap-5 rounded-[2rem] bg-white p-5 shadow-[0_20px_50px_-30px_rgba(22,58,43,0.35)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={s.img} alt="" loading="lazy" className="h-28 w-auto shrink-0 object-contain drop-shadow-lg transition duration-500 group-hover:-rotate-6" />
                <div>
                  <p className="font-serif text-lg font-semibold text-forest">{s.t}</p>
                  <p className="mt-1 text-sm text-neutral-600">{s.b}</p>
                </div>
              </div>
            ))}
          </div>
          <p data-reveal="" className="mt-4 text-sm text-neutral-500">Our Premium Core Segments – we focus on health-conscious innovation and unbeatable refreshment.</p>
          <div className="mt-10 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {WHY.map((x, i) => (
              <div key={x.t} data-reveal="" style={d((i % 3) * 100)}>
                <span className="grid size-12 place-items-center rounded-2xl bg-forest text-gold"><x.icon size={22} /></span>
                <h3 className="mt-4 font-serif text-xl font-semibold text-forest">{x.t}</h3>
                <p className="mt-2 leading-relaxed text-neutral-600">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Backed by */}
      <section className="relative isolate overflow-hidden text-white">
        <div className="absolute inset-0 -z-10 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-parallax="0.15" src="/story/vending-range.webp" alt="" className="h-full w-full scale-[1.15] object-cover will-change-transform" />
        </div>
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/75 via-black/45 to-black/10" />
        <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:py-36">
          <Eyebrow tone="text-gold">East India&apos;s Leading Instant Beverages Brand</Eyebrow>
          <SplitText text="Backed by Assam & the Northeast's Most Established Instant Beverage Manufacturer" className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-semibold sm:text-5xl" />
          <p data-reveal="" className="mt-4 text-white/75">Naucera by Vardhman Foods and Beverages</p>
          <div className="mt-10 grid max-w-3xl gap-5 sm:grid-cols-2">
            {[
              { icon: ShieldCheck, t: "Certified & Quality-Controlled", b: "Full production traceability with expiry-labelled, batch-tracked SKUs across every range." },
              { icon: MapPinned, t: "PAN India Network", b: "Ready to serve institutional, HORECA, and retail buyers anywhere in India." },
            ].map((x, i) => (
              <div key={x.t} data-reveal="" style={d(i * 120)} className="rounded-3xl border border-white/15 bg-white/10 p-6 backdrop-blur">
                <x.icon className="text-gold" size={24} />
                <p className="mt-3 font-serif text-xl font-semibold">{x.t}</p>
                <p className="mt-1 text-sm text-white/75">{x.b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-cream py-20">
        <div className="mx-auto mb-10 max-w-7xl px-4 text-center sm:px-6">
          <div className="flex justify-center"><Eyebrow>What people say</Eyebrow></div>
          <SplitText text="Loved in homes and offices" className="mt-4 font-serif text-4xl font-semibold text-forest sm:text-5xl" />
        </div>
        <Marquee speed={45}>
          {REVIEWS.map((r) => (
            <figure key={r.n} className="mx-3 w-80 shrink-0 rounded-[2rem] bg-white p-7 shadow-[0_20px_50px_-30px_rgba(22,58,43,0.35)] sm:w-96">
              <div className="flex gap-1 text-gold">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={16} fill="currentColor" />)}</div>
              <blockquote className="mt-4 font-serif text-lg leading-snug text-forest">“{r.q}”</blockquote>
              <figcaption className="mt-4 text-sm font-medium text-neutral-500">{r.n}</figcaption>
            </figure>
          ))}
        </Marquee>
      </section>

      {/* Partnership advantage + how can we help */}
      <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_auto]">
          <div>
            <Eyebrow>The Naucera Partnership Advantage</Eyebrow>
            <SplitText text="Get Set Up With the Right Vending Machine & Premix Partner" className="mt-4 max-w-3xl font-serif text-4xl leading-tight font-semibold text-forest sm:text-5xl" />
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img data-reveal="scale" src="/mascot/mascot-support.webp" alt="Naucera support mascot" className="float-slow mx-auto h-56 w-auto sm:h-64" />
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {ADVANTAGES.map((x, i) => (
            <div key={x.t} data-reveal="" style={d(i * 90)} className="rounded-[2rem] border border-neutral-200 p-6 transition duration-500 hover:-translate-y-1.5 hover:border-brand-300 hover:shadow-xl">
              <x.icon className="text-brand-600" size={26} />
              <h3 className="mt-4 font-serif text-lg font-semibold text-forest">{x.t}</h3>
              <p className="mt-2 text-sm text-neutral-600">{x.b}</p>
            </div>
          ))}
        </div>

        <h2 data-reveal="" className="mt-24 text-center font-serif text-4xl font-semibold text-forest">How Can We Help You Today?</h2>
        <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {HELP.map((h, i) => (
            <a key={h.t} href={h.href} {...ext(h.href)} data-reveal="" style={d(i * 90)}
              className="group flex flex-col rounded-[2rem] rounded-tr-[4rem] bg-forest p-7 text-white transition duration-500 hover:-translate-y-2 hover:shadow-2xl">
              <h.icon className="text-gold" size={28} />
              <p className="mt-5 flex-1 font-serif text-xl leading-snug">{h.t}</p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-gold">{h.cta} <ArrowRight size={16} className="transition group-hover:translate-x-1" /></span>
            </a>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative overflow-hidden bg-cream">
        <Sprig className="absolute hidden lg:block bottom-0 -left-4 h-72 text-brand-700/25" />
        <Sprig flip className="absolute hidden lg:block top-0 -right-4 h-72 text-brand-700/25" />
        <div className="mx-auto max-w-4xl px-4 py-24 text-center sm:px-6 lg:py-28">
          <SplitText text="Ready to Stop Losing Customers to a Bad Cup?" className="font-serif text-4xl leading-tight font-semibold text-forest sm:text-6xl" />
          <p data-reveal="" className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            Whether you&apos;re sourcing an instant coffee vending machine for your workplace, searching for a dependable vending machine manufacturer, or evaluating your next coffee premix manufacturer partnership—Naucera gives you the product, the machines, the systems, and the support to get it right the first time.
          </p>
          <div data-reveal="" className="mt-10 flex flex-wrap justify-center gap-3">
            <a href={consult} {...ext(consult)} className="inline-flex items-center gap-2 rounded-full bg-forest px-8 py-4 font-semibold text-white transition hover:-translate-y-0.5 hover:bg-brand-800">
              <MessageCircle size={18} /> Talk to a Naucera beverage consultant today
            </a>
            <Link href="/products" className="inline-flex items-center gap-2 rounded-full border border-forest px-8 py-4 font-semibold text-forest transition hover:-translate-y-0.5 hover:bg-forest hover:text-white">
              View premixes <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
