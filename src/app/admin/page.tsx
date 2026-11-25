"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Stats = { content: number; users: number; requests: number; categories: number };
const workspaces = [
  ["Library", "Browse and manage every title in your catalogue.", "/admin/content", "▣"],
  ["Post a movie", "Add a film or series to STREAM UG.", "/admin/content/new", "+"],
  ["Categories", "Keep the catalogue organised.", "/admin/categories", "◈"],
  ["Movie requests", "Review what viewers want to watch.", "/admin/requests", "✉"],
  ["Users & admins", "Manage member access and administrator roles.", "/admin/users", "♙"],
  ["Analytics", "Understand viewing and community activity.", "/admin/analytics", "▥"],
];

export default function Admin() {
  const [stats, setStats] = useState<Stats>({ content: 0, users: 0, requests: 0, categories: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    const supabase = createClient(); let live = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
      if (!profile?.is_admin) { window.location.replace("/browse"); return; }
      const [content, users, requests, categories] = await Promise.all([
        supabase.from("content").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("movie_requests").select("*", { count: "exact", head: true }),
        supabase.from("categories").select("*", { count: "exact", head: true }),
      ]);
      if (!live) return;
      setStats({ content: content.count || 0, users: users.count || 0, requests: requests.count || 0, categories: categories.count || 0 });
      setError([content.error, users.error, requests.error, categories.error].filter(Boolean).map(x => x?.message).join(" · "));
      setReady(true);
    })();
    return () => { live = false; };
  }, []);
  async function logout() { await createClient().auth.signOut(); window.location.assign("/"); }
  const cards: [string, number][] = [["Titles in library", stats.content], ["Registered members", stats.users], ["Movie requests", stats.requests], ["Categories", stats.categories]];
  return <main className="min-h-screen bg-[#0a0b0f] text-white">
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-4 border-b border-white/10 bg-[#101116]/95 px-5 py-4 backdrop-blur sm:px-8">
      <Link href="/" className="flex items-center gap-3"><span className="grid h-10 w-10 place-items-center rounded-xl bg-[#e73545] text-xl font-black">S</span><span className="text-lg font-black tracking-[.15em]">STREAM<span className="text-[#e73545]"> UG</span><small className="mt-0.5 block text-[9px] font-bold tracking-[.25em] text-white/40">ADMIN CONTROL ROOM</small></span></Link>
      <div className="flex items-center gap-4 text-sm"><Link href="/browse" className="text-white/60 transition hover:text-white">View streaming site ↗</Link><button onClick={logout} className="rounded-lg border border-white/10 px-3 py-2 text-white/70 transition hover:border-white/30 hover:text-white">Log out</button></div>
    </header>
    <div className="mx-auto max-w-7xl px-5 py-9 sm:px-8 sm:py-12">
      <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-[11px] font-black tracking-[.28em] text-[#f16b78]">STREAM UG / CONTROL ROOM</p><h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">Good to see you, Admin.</h1><p className="mt-2 text-sm text-white/45">Your platform at a glance. Manage the library, members and requests.</p></div><Link href="/admin/content/new" className="rounded-xl bg-[#e73545] px-5 py-3.5 text-sm font-bold shadow-lg shadow-[#e73545]/10 transition hover:bg-[#f04454]">＋ Add a title</Link></div>
      <section className="mt-9 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label,value],i)=><div key={label} className="rounded-2xl border border-white/10 bg-[#12141b] p-5"><div className="flex items-center justify-between"><p className="text-sm text-white/50">{label}</p><span className="text-xs text-[#f16b78]">{["▣","♙","✉","◈"][i]}</span></div><p className="mt-4 text-3xl font-black tabular-nums">{ready?value:"—"}</p><div className="mt-4 h-1 rounded-full bg-white/5"><div className="h-1 w-1/3 rounded-full bg-[#e73545]"/></div></div>)}</section>
      {error&&<p role="alert" className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/5 p-3 text-sm text-amber-200">{error}</p>}
      <div className="mt-12 flex items-center justify-between"><div><p className="text-[11px] font-bold tracking-[.24em] text-white/35">YOUR TOOLS</p><h2 className="mt-2 text-xl font-bold">Workspace</h2></div><span className="rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/45">6 workspaces</span></div>
      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{workspaces.map(([title,desc,href,icon])=><Link key={href} href={href} className="group rounded-2xl border border-white/10 bg-[#12141b] p-5 transition duration-200 hover:-translate-y-0.5 hover:border-[#e73545]/50 hover:bg-[#171922]"><div className="flex items-center justify-between"><span className="grid h-10 w-10 place-items-center rounded-xl bg-white/5 text-lg text-[#f16b78]">{icon}</span><span className="text-white/25 transition group-hover:translate-x-1 group-hover:text-[#f16b78]">↗</span></div><h3 className="mt-5 font-bold">{title}</h3><p className="mt-2 min-h-10 text-sm leading-6 text-white/45">{desc}</p><p className="mt-4 text-[10px] font-black tracking-[.18em] text-white/35 group-hover:text-[#f16b78]">OPEN WORKSPACE →</p></Link>)}</section>
      <footer className="mt-12 border-t border-white/10 pt-5 text-xs text-white/30">STREAM UG · Engineered by Vision</footer>
    </div>
  </main>;
}
