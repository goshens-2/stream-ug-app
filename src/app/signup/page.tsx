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
    const interval = window.setInterval(() => setActiveImage((current) => (current + 1) % demoImages.length), 5000);
    return () => window.clearInterval(interval);
  }, []);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 6) { setError("Use at least 6 characters for your password."); return; }
    setBusy(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
        cache: "no-store",
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setError(result.error || "We couldn't create your account. Please try again.");
        setBusy(false);
        return;
      }
      if (result.access_token && result.refresh_token) {
        const { error: sessionError } = await createClient().auth.setSession({
          access_token: result.access_token,
          refresh_token: result.refresh_token,
        });
        if (sessionError) {
          setError("Your account was created, but we couldn't save your sign-in. Please log in.");
          setBusy(false);
          return;
        }
        window.location.assign("/browse");
        return;
      }
      setError("Account created. Check your email to verify your address, then log in.");
      setBusy(false);
    } catch (err) {
      setError(err instanceof TypeError ? "STREAM UG couldn't connect securely. Check your internet connection and try again." : err instanceof Error ? err.message : "We couldn't create your account. Please try again.");
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#08090c] lg:h-screen lg:min-h-0 lg:grid-cols-[1.05fr_.95fr]">
      <section className="relative flex min-h-[390px] flex-col justify-center overflow-hidden border-b border-white/10 px-7 py-9 sm:px-12 lg:h-screen lg:border-b-0 lg:border-r lg:px-14 lg:py-8">
        {demoImages.map((src, index) => (
          <div key={src} aria-hidden="true" className="absolute inset-0 bg-cover bg-center transition-opacity duration-[1800ms] ease-in-out" style={{ backgroundImage: `url("${src}")`, opacity: activeImage === index ? 1 : 0 }} />
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-[#08090c]/90 via-[#08090c]/65 to-[#08090c]/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090c]/85 via-transparent to-[#08090c]/55" />
        <Link href="/" className="absolute left-7 top-7 z-10 text-lg font-black tracking-[.2em] text-white sm:left-12 sm:top-8">STREAM<span className="text-[#e73545]"> UG</span></Link>
        <div className="relative z-10 mx-auto w-full max-w-xl py-5 lg:py-0">
          <h1 className="text-4xl font-black leading-[1.04] tracking-[-.05em] sm:text-5xl xl:text-6xl">Stories worth staying up for.</h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-white/75 sm:mt-4 sm:text-base sm:leading-7">Join STREAM UG and discover movies, series and unforgettable moments.</p>
          <div className="mt-6 border-l-[3px] border-[#e73545] pl-4 sm:mt-8 sm:pl-5">
            <p className="text-3xl font-black tracking-[-.04em] text-white sm:text-4xl xl:text-5xl">ENGINEERED BY <span className="text-blue-500">VISION</span></p>
            <a href="https://visiongrow.vercel.app" target="_blank" rel="noopener noreferrer" className="group mt-4 inline-flex items-center gap-3 rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2.5 text-left shadow-lg shadow-blue-950/20 backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:border-blue-300/70 hover:bg-blue-500/20">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-sm font-black text-blue-300">V</span>
              <span className="flex flex-col">
                <span className="text-[9px] font-bold uppercase tracking-[.22em] text-white/55">Explore Vision</span>
                <span className="text-xs font-semibold tracking-wide text-blue-200 group-hover:text-white sm:text-sm">visiongrow.vercel.app</span>
              </span>
              <span aria-hidden="true" className="ml-1 text-blue-300 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5">↗</span>
            </a>
          </div>
        </div>
        <p className="absolute bottom-5 left-7 z-10 text-[9px] tracking-[.16em] text-white/55 sm:left-12 sm:bottom-7 sm:text-xs">STREAM UG · ENTERTAINMENT WITHOUT LIMITS</p>
      </section>

      <section className="flex items-center justify-center px-6 py-7 sm:py-9 lg:h-screen lg:overflow-y-auto lg:px-10 lg:py-5">
        <div className="w-full max-w-md">
          <Link href="/" className="text-sm text-white/45 transition hover:text-white">← Back to home</Link>
          <p className="mt-5 text-xs font-bold tracking-[.25em] text-[#f16b78] sm:mt-6">JOIN THE STREAM</p>
          <h2 className="mt-2 text-3xl font-black sm:text-4xl">Create your account</h2>
          <p className="mt-2 text-sm text-white/45">One account. A world of stories.</p>
          <form onSubmit={submit} className="mt-5 space-y-3">
            <label className="block text-sm text-white/70">Username<input required type="text" autoComplete="username" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-3 text-white outline-none transition focus:border-[#e73545]" /></label>
            <label className="block text-sm text-white/70">Email<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-3 text-white outline-none transition focus:border-[#e73545]" /></label>
            <label className="block text-sm text-white/70">Password<input required type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Create a password" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-3 text-white outline-none transition focus:border-[#e73545]" /></label>
            <label className="block text-sm text-white/70">Confirm password<input required type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Enter your password again" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#111319] px-4 py-3 text-white outline-none transition focus:border-[#e73545]" /></label>
            {error && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{error}</p>}
            <button disabled={busy} className="w-full rounded-xl bg-[#e73545] py-3.5 text-sm font-bold transition hover:bg-[#f04454] disabled:opacity-50">{busy ? "Creating account…" : "Create account"}</button>
          </form>
          <p className="mt-4 text-center text-sm text-white/45">Already have an account? <Link href="/login" className="font-semibold text-white hover:text-[#ff8791]">Log in</Link></p>
        </div>
      </section>
    </main>
  );
}
