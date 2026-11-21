"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const demoImages = [
  "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=85",
  "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=1600&q=85",
];

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setActiveImage((current) => (current + 1) % demoImages.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters for your password.");
      return;
    }
    setBusy(true);
    try {
      const { data, error: authError } = await createClient().auth.signUp({
        email: email.trim(),
        password,
        options: { data: { name: name.trim() } },
      });
      if (authError) {
        setError(authError.message);
        setBusy(false);
        return;
      }
      if (data.session) {
        window.location.assign("/browse");
        return;
      }
      setError("Account created. Check your email to complete sign-in.");
      setBusy(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reach STREAM UG authentication. Check your internet connection and try again.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#08090c] lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative hidden min-h-screen flex-col justify-between overflow-hidden border-r border-white/10 p-12 lg:flex">
        {demoImages.map((src, index) => (
          <div
            key={src}
            aria-hidden="true"
            className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out"
            style={{ backgroundImage: `url("${src}")`, opacity: activeImage === index ? 1 : 0 }}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c]/90 via-[#08090c]/55 to-[#08090c]/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c] via-transparent to-[#08090c]/35" />
        <Link href="/" className="relative z-10 text-xl font-black tracking-[.2em] text-white">
          STREAM<span className="text-[#e73545]"> UG</span>
        </Link>
        <div className="relative z-10 max-w-xl py-16">
          <p className="text-xs font-bold tracking-[.3em] text-[#ff8791]">YOUR NEXT MOVIE NIGHT STARTS HERE</p>
          <h1 className="mt-5 text-6xl font-black leading-[1.05] tracking-[-.05em] xl:text-7xl">
            Stories worth staying up for.
          </h1>
          <p className="mt-6 max-w-md text-base leading-8 text-white/70">
            Join STREAM UG and discover movies, series and unforgettable moments.
          </p>
          <div className="mt-12 border-l-4 border-[#e73545] pl-5">
            <p className="text-xs font-bold uppercase tracking-[.35em] text-white/55">Proudly crafted</p>
            <p className="mt-2 text-4xl font-black tracking-[-.04em] text-white xl:text-5xl">
              ENGINEERED BY <span className="text-[#f04455]">VISION</span>
            </p>
          </div>
        </div>
        <p className="relative z-10 text-xs tracking-[.18em] text-white/45">STREAM UG · ENTERTAINMENT WITHOUT LIMITS</p>
      </section>

      <section className="flex items-center justify-center px-6 py-12 sm:py-16">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm text-white/45 transition hover:text-white">← Back to home</Link>
          <p className="mt-12 text-xs font-bold tracking-[.25em] text-[#f16b78]">JOIN THE STREAM</p>
          <h2 className="mt-3 text-4xl font-black">Create your account</h2>
          <p className="mt-3 text-sm text-white/45">One account. A world of stories.</p>
          <form onSubmit={submit} className="mt-8 space-y-4">
            <label className="block text-sm text-white/70">
              Username
              <input required type="text" autoComplete="username" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-2 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-4 text-white outline-none transition focus:border-[#e73545]" />
            </label>
            <label className="block text-sm text-white/70">
              Email
              <input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-2 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-4 text-white outline-none transition focus:border-[#e73545]" />
            </label>
            <label className="block text-sm text-white/70">
              Password
              <input required type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="mt-2 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-4 text-white outline-none transition focus:border-[#e73545]" />
            </label>
            <label className="block text-sm text-white/70">
              Confirm password
              <input required type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Enter your password again" className="mt-2 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-4 text-white outline-none transition focus:border-[#e73545]" />
            </label>
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#e73545] py-4 text-sm font-bold transition hover:bg-[#f04454] disabled:opacity-50">
              {busy ? "Creating account…" : "Create account"}
            </button>
          </form>
          <p className="mt-7 text-center text-sm text-white/45">
            Already have an account? <Link href="/login" className="font-semibold text-white hover:text-[#ff8791]">Log in</Link>
          </p>
        </div>
      </section>
    </main>
  );
}
