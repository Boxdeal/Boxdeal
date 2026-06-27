import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronRight,
  Wallet,
  ShieldCheck,
  Sparkles,
  Leaf,
  PackageOpen,
  CheckCircle2,
  Heart,
  ArrowRight,
  Instagram,
  Send,
} from "lucide-react";

const social = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/smartaccessorieshub_?igsh=dnBnNHphYzUzcjZu&utm_source=qr",
    icon: Instagram,
  },
  {
    label: "Telegram",
    href: "https://t.me/smartaccessorieshub",
    icon: Send,
  },
];

export const metadata: Metadata = {
  title: "About Us | BoxDeal",
  description:
    "BoxDeal brings you genuine open-box products in like-new condition at 30–60% off retail — backed by an 8-step quality check, brand warranty and BoxDeal Assurance. Good for your pocket, good for the planet.",
};

const values = [
  {
    icon: Wallet,
    emoji: "💰",
    title: "Maximum value, every single time",
    body: "Our mission is simple — squeeze out every bit of value we can for you. Every open-box product comes with a minimum 30% off prevailing retail prices, running all the way up to 60%. So why buy one new when you can have two open-box for the same price?",
  },
  {
    icon: ShieldCheck,
    emoji: "⭐",
    title: "Never compromise on quality",
    body: "Every product passes a stringent 8-step quality check before it reaches your doorstep. It's almost impossible for a defective unit to slip past our team — which is why we maintain an industry-leading defect rate of under 2%, even lower than a brand-new product's average.",
  },
  {
    icon: Sparkles,
    emoji: "👌",
    title: "Only the best products make the cut",
    body: "You'll notice our catalogue is deliberately small. We only stock the best SKUs out there — hand-picked by our product team on the basis of build quality, reliability and brand after-sales support. No clutter, just gadgets worth owning.",
  },
  {
    icon: Leaf,
    emoji: "🌱",
    title: "Good for the environment",
    body: "While you take care of your pocket, you take care of the planet too. Manufacturing a new device produces about 86 kg of CO₂e. An open-box product? Just 6 kg. Lose the weight — no extra effort, just extra savings.",
  },
];

const stats = [
  { value: "30–60%", label: "Off retail prices" },
  { value: "8-step", label: "Quality check process" },
  { value: "<2%", label: "Defect rate" },
  { value: "Since 2017", label: "In e-commerce" },
];

const promises = [
  {
    title: "Open-box, never refurbished",
    body: "Our products are genuine e-commerce returns with little to no usage — seal-opened but in mint, like-new condition. They are not used or repaired refurbished units.",
  },
  {
    title: "Brand warranty included",
    body: "Most products carry 6–12 months of brand warranty, and every order is additionally covered by BoxDeal Assurance for delivery and as-described issues.",
  },
  {
    title: "Honest condition grading",
    body: "Every listing is transparently graded A to D so you know exactly what you're getting before you buy — no surprises at the door.",
  },
];

export default function AboutPage() {
  return (
    <div className="bg-gray-50">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-700 text-white">
        {/* decorative blobs */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-brand-300/20 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <nav className="mb-6 flex items-center gap-1 text-sm text-white/80">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-white">About Us</span>
          </nav>

          <div className="grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Open-box, like-new, up to 60% off
              </span>
              <h1 className="mt-4 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">
                Oh, hello there! 👋
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-relaxed text-white/90 sm:text-base">
                We&rsquo;re <strong className="font-semibold">BoxDeal</strong> — a
                team of e-commerce and gadget enthusiasts on a mission to deliver
                the best possible value to you. We give perfectly good, like-new
                products a second life, so you get premium gadgets at a fraction
                of the price. It&rsquo;s really nice to have you here.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link
                  href="/products"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-5 py-2.5 text-sm font-bold text-brand-700 shadow-sm transition-transform hover:scale-[1.03] sm:w-auto"
                >
                  Shop Now <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-white/40 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
                >
                  Talk to Us
                </Link>
              </div>
            </div>

            {/* Hero image */}
            <div className="relative">
              <div className="overflow-hidden rounded-2xl bg-white/10 shadow-2xl ring-1 ring-white/20 backdrop-blur">
                <Image
                  src="/about1.png"
                  alt="A curated spread of premium BoxDeal open-box gadgets"
                  width={1440}
                  height={500}
                  priority
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:py-14">
        {/* What is open-box */}
        <section className="rounded-2xl border border-brand-100 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <PackageOpen className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
              So, what exactly is &ldquo;open-box&rdquo;?
            </h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
            Every year, e-commerce returns run into hundreds of billions of
            dollars. Many of these devices are barely used and in spotless,
            like-new condition — but because their seal was opened, they can no
            longer be sold as new. Most people confuse open-box with{" "}
            <em>refurbished</em> or <em>used</em>, which it absolutely is not.
            These products often end up in grey markets or, worse, in landfills.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
            BoxDeal exists to rescue these mint-condition products, put them
            through a rigorous quality check, and pass the savings on to you —
            keeping good gadgets out of bad markets and away from landfills.
          </p>
        </section>

        {/* Values */}
        <section className="mt-12">
          <h2 className="text-center text-2xl font-black text-gray-900 sm:text-3xl">
            What we believe in
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-center text-sm text-gray-500">
            Four simple ideas guide everything we do at BoxDeal.
          </p>
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div
                  key={v.title}
                  className="group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-200 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-sm transition-transform group-hover:scale-110">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold text-gray-900">
                    {v.title} <span aria-hidden>{v.emoji}</span>
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">
                    {v.body}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Feature image band */}
        <section className="relative mt-12 overflow-hidden rounded-2xl shadow-sm">
          <Image
            src="/about2.png"
            alt="BoxDeal smart accessories — cameras, audio gear and more"
            width={1440}
            height={500}
            className="h-56 w-full object-cover sm:h-72"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/50 to-transparent" />
          <div className="absolute inset-0 flex items-center">
            <div className="max-w-md px-6 sm:px-10">
              <h2 className="text-2xl font-black text-white sm:text-3xl">
                Premium gadgets. Open-box prices.
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-white/85 sm:text-base">
                From audio to cameras to everyday smart accessories — every piece
                is hand-picked, quality-checked and priced to make you smile.
              </p>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          <div className="grid grid-cols-2 gap-px sm:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/5 px-3 py-6 text-center sm:px-4 sm:py-8">
                <p className="text-xl font-black sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-white/80 sm:text-sm">
                  {s.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our story */}
        <section className="mt-12 grid items-center gap-8 lg:grid-cols-2">
          <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
            <Image
              src="/founder.webp"
              alt="Mohit and Sahib, founders of BoxDeal"
              width={1100}
              height={778}
              className="h-full w-full object-cover"
            />
            <div className="px-5 py-4">
              <p className="text-sm font-bold text-gray-900">Mohit &amp; Sahib</p>
              <p className="text-xs text-gray-500">Founders, BoxDeal</p>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-black text-gray-900 sm:text-3xl">
              A little about our journey
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-gray-600 sm:text-base">
              It started in 2017, when{" "}
              <strong className="font-semibold text-gray-900">Mohit</strong> and{" "}
              <strong className="font-semibold text-gray-900">Sahib</strong> —
              two friends obsessed with gadgets — began selling online. We started
              small, packing every order ourselves, and earned top-rated seller
              status through thousands of happy orders. Along the way, one thing
              kept bothering us: perfectly good, like-new products were being
              written off for one silly reason — someone had opened the box.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-gray-600 sm:text-base">
              BoxDeal is our answer to that — a home for open-box gadgets that are
              rescued, put through an 8-step quality check, honestly graded A to D,
              and priced to actually make sense. Every order is backed by brand
              warranty and BoxDeal Assurance, and every box we ship carries the
              same care we put into our very first one. Try us once, and
              we&rsquo;re pretty sure you&rsquo;ll know exactly where to come the
              next time you need a gadget. ❤️
            </p>
          </div>
        </section>

        {/* Promises */}
        <section className="mt-8 grid gap-4 sm:grid-cols-3">
          {promises.map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <CheckCircle2 className="h-6 w-6 text-brand-500" />
              <p className="mt-3 text-sm font-bold text-gray-900">{p.title}</p>
              <p className="mt-1 text-sm leading-relaxed text-gray-600">
                {p.body}
              </p>
            </div>
          ))}
        </section>

        {/* Social good */}
        <section className="mt-12 rounded-2xl border border-brand-100 bg-gradient-to-br from-brand-50 to-white p-6 sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-brand-600 shadow-sm">
              <Heart className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-xl font-bold text-gray-900 sm:text-2xl">
              Good for your pocket, the planet, and society too 🫶
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-brand-900/80 sm:text-base">
              Every open-box product you buy saves roughly 80 kg of CO₂e from our
              collective carbon footprint. And a part of our proceeds goes toward
              human causes — mid-day meals, relief work and support for those in
              need. So take pride in your purchase: you&rsquo;re taking care of
              your wallet, the environment, and your community, all at once.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section className="relative mt-12 overflow-hidden rounded-2xl bg-gray-900 p-8 text-center text-white shadow-sm sm:p-12">
          <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-brand-600/20 blur-3xl" />
          <div className="relative">
            <h2 className="text-2xl font-black sm:text-3xl">
              Ready to shop smarter?
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-gray-300 sm:text-base">
              Premium, like-new gadgets at open-box prices — backed by warranty
              and BoxDeal Assurance. See you on the other side. Ciao! 🚀
            </p>
            <div className="mt-6 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
              <Link
                href="/products"
                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand-500 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 sm:w-auto"
              >
                Browse Products
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/contact"
                className="w-full rounded-lg border border-gray-700 bg-transparent px-6 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-white/10 sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
            <div className="mt-8 flex flex-col items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                Follow us
              </p>
              <div className="flex gap-3">
                {social.map((s) => {
                  const Icon = s.icon;
                  return (
                    <a
                      key={s.label}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={s.label}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-brand-500"
                    >
                      <Icon className="h-5 w-5" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
