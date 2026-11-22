"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const slides = [
  {
    eyebrow: "EXPLORE THE GENRES",
    title: "Action & adventure",
    copy: "Big moments, bold heroes and stories that stay with you.",
  },
  {
    eyebrow: "FIND YOUR NEXT STORY",
    title: "Drama & romance",
    copy: "Emotional stories and unforgettable connections.",
  },
  {
    eyebrow: "GOOD TIMES START HERE",
    title: "Comedy & family",
    copy: "Feel-good entertainment for every kind of night.",
  },
  {
    eyebrow: "YOUR NEXT FAVOURITE IS WAITING",
    title: "Discover more on STREAM",
    copy: "Your next great watch is only a click away.",
  },
];

export default function Home() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setActive((current) => (current + 1) % slides.length),
      4200,
    );
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    void createClient()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) window.location.replace("/browse");
      });
  }, []);

  const slide = slides[active];

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[#08090c] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_72%_24%,rgba(231,53,69,.2),transparent_42%),radial-gradient(ellipse_at_8%_82%,rgba(57,70,110,.14),transparent_38%)]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-10">
        <Link href="/" className="text-lg font-black tracking-[.2em] sm:text-xl">
          STREAM<span className="text-[#e73545]"> UG</span>
        </Link>
        <nav className="flex items-center gap-2.5 text-sm sm:gap-3">
          <Link
            href="/login"
            className="rounded-full border border-[#e73545]/70 px-4 py-2 font-semibold text-white transition hover:border-[#ff6876] hover:bg-[#e73545]/10 sm:px-5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-[#e73545] px-4 py-2 font-bold text-white shadow-md shadow-red-950/40 transition hover:bg-[#f04454] sm:px-5"
          >
            Join STREAM
          </Link>
        </nav>
      </header>

      <section className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col px-5 pb-7 pt-5 sm:px-8 sm:pt-7 lg:px-10">
        <h1 className="mb-6 max-w-4xl text-4xl font-black leading-[1.08] tracking-[-.045em] sm:mb-8 sm:text-5xl lg:text-6xl">
          Entertainment you can stream with.
        </h1>

        <section
          aria-label="Featured entertainment"
          aria-live="polite"
          className="relative flex min-h-[330px] flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(115deg,rgba(231,53,69,.2),rgba(20,22,30,.94)_52%,rgba(42,48,67,.88))] p-6 shadow-2xl shadow-black/30 sm:min-h-[390px] sm:p-10 lg:min-h-[430px] lg:p-12"
        >
          <div className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full border border-white/10 sm:h-96 sm:w-96" />
          <div className="pointer-events-none absolute -right-8 -top-12 h-56 w-56 rounded-full border border-white/10 sm:h-72 sm:w-72" />

          <div className="relative max-w-2xl" key={slide.title}>
            <p className="text-[10px] font-black tracking-[.3em] text-[#ff8791] sm:text-xs">
              {slide.eyebrow}
            </p>
            <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-.035em] sm:mt-6 sm:text-5xl lg:text-6xl">
              {slide.title}
            </h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-white/70 sm:mt-5 sm:text-base sm:leading-8">
              {slide.copy}
            </p>
          </div>

          <div className="relative mt-10 flex items-center justify-between gap-4">
            <p className="text-xl font-extrabold tracking-[.025em] text-white sm:text-2xl lg:text-3xl">Engineered by <span className="font-black text-blue-400">Vision</span></p>
            <div className="flex items-center gap-2" aria-label="Choose featured slide">
              {slides.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActive(index)}
                  aria-label={"Show " + item.title}
                  aria-pressed={active === index}
                  className={
                    "h-1.5 rounded-full transition-all " +
                    (active === index
                      ? "w-10 bg-[#f04454]"
                      : "w-5 bg-white/30 hover:bg-white/60")
                  }
                />
              ))}
            </div>
          </div>
        </section>
      </section>

    </main>
  );
}
