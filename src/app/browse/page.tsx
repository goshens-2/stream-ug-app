"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Movie = { id: string; title: string; description: string | null; poster_url: string | null; release_year: number | null; duration_minutes: number | null; category_id: string | null; is_demo?: boolean };
type Category = { id: string; name: string; slug: string };
const demoCategories: Category[] = [
  { id: "demo-action", name: "Action (Sample)", slug: "demo-action" },
  { id: "demo-drama", name: "Drama (Sample)", slug: "demo-drama" },
  { id: "demo-comedy", name: "Comedy (Sample)", slug: "demo-comedy" },
  { id: "demo-animation", name: "Animation (Sample)", slug: "demo-animation" },
];
const demoMovies: Movie[] = [
  { id: "demo-movie-1", title: "The Last Mission", description: "A fearless team races against time to protect their city. Sample movie for dashboard testing.", poster_url: "https://picsum.photos/seed/stream-last-mission/480/720", release_year: 2025, duration_minutes: 116, category_id: "demo-action", is_demo: true },
  { id: "demo-movie-2", title: "Kampala Dreams", description: "A young creative follows an unexpected opportunity through the streets of Kampala.", poster_url: "https://picsum.photos/seed/stream-kampala-dreams/480/720", release_year: 2024, duration_minutes: 104, category_id: "demo-drama", is_demo: true },
  { id: "demo-movie-3", title: "Laugh Out Loud", description: "A lively comedy about friendship, family and one very chaotic weekend.", poster_url: "https://picsum.photos/seed/stream-laugh-out-loud/480/720", release_year: 2023, duration_minutes: 92, category_id: "demo-comedy", is_demo: true },
  { id: "demo-movie-4", title: "Beyond the Horizon", description: "Two strangers discover that a fresh start can come from the most unexpected place.", poster_url: "https://picsum.photos/seed/stream-beyond-horizon/480/720", release_year: 2025, duration_minutes: 121, category_id: "demo-drama", is_demo: true },
  { id: "demo-movie-5", title: "Jungle Quest", description: "An animated adventure filled with curious creatures and surprising discoveries.", poster_url: "https://picsum.photos/seed/stream-jungle-quest/480/720", release_year: 2024, duration_minutes: 88, category_id: "demo-animation", is_demo: true },
  { id: "demo-movie-6", title: "Code Red", description: "A suspense-filled thriller where every decision changes the outcome.", poster_url: "https://picsum.photos/seed/stream-code-red/480/720", release_year: 2022, duration_minutes: 109, category_id: "demo-action", is_demo: true },
];

function SearchGlyph() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>;
}
function ProfileGlyph() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"><circle cx="12" cy="8" r="3.4"/><path d="M4.8 20c.8-3.4 3.3-5.2 7.2-5.2s6.4 1.8 7.2 5.2"/></svg>;
}
function BellGlyph() {
  return <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>;
}

export default function Browse() {
  const [items, setItems] = useState<Movie[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState("there");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoriesOpenAt, setCategoriesOpenAt] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const s = createClient();
    let live = true;
    void (async () => {
      const { data: { user } } = await s.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      const [{ data: p }, { data: c }, { data: k }, { count }] = await Promise.all([
        s.from("profiles").select("name,is_admin").eq("id", user.id).maybeSingle(),
        s.from("content").select("id,title,description,poster_url,release_year,duration_minutes,category_id").order("created_at", { ascending: false }),
        s.from("categories").select("id,name,slug").order("name"),
        s.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);
      if (!live) return;
      if (p?.is_admin) { window.location.replace("/admin"); return; }
      setName(p?.name || user.email?.split("@")[0] || "there");
      setItems((c || []) as Movie[]);
      setCats((k || []) as Category[]);
      setUnread(count || 0);
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const allCategories = useMemo(() => [...cats, ...demoCategories.filter((demo) => !cats.some((real) => real.name.toLowerCase() === demo.name.toLowerCase()))], [cats]);
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 6);
  const allMovies = useMemo(() => [...items, ...demoMovies], [items]);
  const filtered = useMemo(() => allMovies.filter((x) =>
    (cat === "all" || x.category_id === cat) &&
    (x.title.toLowerCase().includes(q.toLowerCase()) || (x.description || "").toLowerCase().includes(q.toLowerCase()))
  ), [allMovies, cat, q]);
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allMovies.filter((movie) => !term || movie.title.toLowerCase().includes(term))
      .slice(0, 5);
  }, [allMovies, q]);

  useEffect(() => {
    if (!categoriesOpen) return;
    const closeWhenScrolledAway = () => {
      if (window.scrollY > categoriesOpenAt + 260) { setCategoriesOpen(false); setShowAllCategories(false); }
    };
    window.addEventListener("scroll", closeWhenScrolledAway, { passive: true });
    return () => window.removeEventListener("scroll", closeWhenScrolledAway);
  }, [categoriesOpen, categoriesOpenAt]);

  useEffect(() => {
    if (q.trim().length < 3) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        const s = createClient();
        const { data: { user } } = await s.auth.getUser();
        const match = items.find((x) => x.title.toLowerCase().includes(q.trim().toLowerCase()));
        await s.from("search_logs").insert({ user_id: user?.id || null, query: q.trim(), matched_content_id: match?.id || null });
      })();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [q, items]);

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090c]/95 shadow-[0_8px_35px_rgba(0,0,0,.28)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="shrink-0 text-lg font-black tracking-[.18em] text-white sm:text-xl">STREAM<span className="text-[#f04455]"> UG</span></Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-white/80 lg:flex">
            <Link href="/browse" className="text-white transition hover:text-white">Home</Link>
            <Link href="/trailers" className="transition hover:text-white">Trailers</Link>
            <Link href="/favorites" className="transition hover:text-white">Watchlist</Link>
            <Link href="/history" className="transition hover:text-white">Continue watching</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative">
              {searchOpen && (
                <div className="absolute bottom-[calc(100%+14px)] right-0 w-[min(88vw,350px)] overflow-hidden rounded-2xl border border-white/15 bg-[#151821] p-3 shadow-2xl">
                  <p className="px-2 pb-2 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">{q.trim() ? "Matching titles" : "Popular searches"}</p>
                  {suggestions.length ? suggestions.map((movie) => (
                    <button key={movie.id} onClick={() => { setQ(movie.title); setSearchOpen(false); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/10">
                      <span className="h-10 w-8 shrink-0 overflow-hidden rounded-md bg-white/10">{movie.poster_url && <img src={movie.poster_url} alt="" className="h-full w-full object-cover" />}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{movie.title}</span>
                      <span className="text-xs text-white/35">Search</span>
                    </button>
                  )) : <p className="px-2 py-3 text-sm text-white/45">No matching titles yet.</p>}
                  <div className="mt-2 border-t border-white/10 pt-3">
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); }} placeholder="Search movies and series…" className="w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/35 focus:border-[#f04455]" />
                  </div>
                </div>
              )}
              <button type="button" aria-label="Search movies" aria-expanded={searchOpen} onClick={() => { setSearchOpen((v) => !v); setProfileOpen(false); }} className="search-pulse grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[.06] text-white transition hover:border-[#f04455]/70 hover:bg-[#f04455]/15"><SearchGlyph /></button>
            </div>
            <Link href="/notifications" aria-label="Notifications" className="relative grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-white/[.06] text-white transition hover:border-[#f04455]/70 hover:bg-[#f04455]/15">
              <BellGlyph />{unread > 0 && <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#ff5264] ring-2 ring-[#08090c]" />}
            </Link>
            <div className="relative">
              <button type="button" aria-label="Profile menu" aria-expanded={profileOpen} onClick={() => { setProfileOpen((v) => !v); setSearchOpen(false); }} className="grid h-11 w-11 place-items-center rounded-full border border-white/15 bg-gradient-to-br from-white/15 to-white/[.03] text-white transition hover:border-[#f04455]/70 hover:text-[#ff8b96]"><ProfileGlyph /></button>
              {profileOpen && <div className="absolute right-0 top-[calc(100%+12px)] w-56 overflow-hidden rounded-2xl border border-white/15 bg-[#151821] p-2 shadow-2xl">
                <div className="border-b border-white/10 px-3 py-3"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-white/40">Signed in as</p><p className="mt-1 truncate text-sm font-semibold text-white">{name}</p></div>
                <Link href="/account" className="block rounded-xl px-3 py-3 text-sm font-medium text-white/80 transition hover:bg-white/10">Account settings</Link>
                <Link href="/account#delete-account" onClick={() => setProfileOpen(false)} className="block rounded-xl px-3 py-3 text-sm font-medium text-red-300 transition hover:bg-red-400/10">Delete account</Link>
                <button onClick={() => void logout()} className="w-full rounded-xl px-3 py-3 text-left text-sm font-semibold text-white transition hover:bg-white/10">Log out</button>
              </div>}
            </div>
          </div>
        </div>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 pb-3 lg:hidden">
          <Link href="/trailers" className="text-xs font-semibold text-white/75">Trailers</Link>
          <Link href="/favorites" className="text-xs font-semibold text-white/75">Watchlist</Link>
          <Link href="/history" className="text-xs font-semibold text-white/75">Continue watching</Link>
          <span className="ml-auto max-w-[42%] truncate text-xs text-white/60">Hi, {name}</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(231,53,69,.28),transparent_45%),linear-gradient(120deg,#1b1e29,#0e1016)] p-8 shadow-[0_25px_80px_rgba(0,0,0,.25)] sm:p-12">
          <p className="text-xs font-bold tracking-[.25em] text-[#ff8791]">YOUR STREAM STARTS HERE</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black leading-[1.05] text-white sm:text-6xl">Find something <span className="text-white/65">worth watching.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/70">Explore movies, series and entertainment in the STREAM UG library.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/history" className="rounded-full bg-white px-5 py-3 text-xs font-extrabold text-black shadow-lg shadow-black/20 transition hover:-translate-y-0.5 hover:bg-[#ffb2b9]">Continue watching</Link>
            <Link href="/trailers" className="rounded-full border border-white/30 bg-white/[.06] px-5 py-3 text-xs font-bold text-white transition hover:border-white/60 hover:bg-white/15">Watch trailers</Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center text-center">
          <button type="button" aria-expanded={categoriesOpen} aria-controls="browse-categories" onClick={() => {
            setCategoriesOpen((open) => { const next = !open; if (next) setCategoriesOpenAt(window.scrollY); else setShowAllCategories(false); return next; });
          }} className="browse-premium group inline-flex items-center gap-3 rounded-full px-8 py-4 text-xs font-black uppercase tracking-[.2em] text-white transition duration-300">
            Browse library <span className={"text-base transition-transform duration-300 " + (categoriesOpen ? "rotate-180" : "")}>⌄</span>
          </button>
          {categoriesOpen && <div id="browse-categories" className="mt-5 w-full rounded-3xl border border-white/10 bg-gradient-to-b from-white/[.07] to-white/[.025] p-4 shadow-2xl sm:p-6">
            <div className="flex flex-wrap justify-center gap-3">
              {visibleCategories.map((x, index) => <button key={x.id} onClick={() => { setCat(x.id); setCategoriesOpen(false); setShowAllCategories(false); }} style={{ animationDelay: `${index * 65}ms` }} className={"category-chip-enter rounded-full px-5 py-3 text-xs font-semibold transition duration-200 hover:-translate-y-1 hover:border-white/40 " + (cat === x.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/80")}>{x.name}</button>)}
              {cat !== "all" && <button onClick={() => { setCat("all"); setCategoriesOpen(false); setShowAllCategories(false); }} className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold text-white/75 transition hover:bg-white/10">All content</button>}
            </div>
            {allCategories.length > 6 && <button type="button" onClick={() => setShowAllCategories((value) => !value)} className="mt-5 text-xs font-bold text-[#ff8791] transition hover:text-white">{showAllCategories ? "See less ↑" : "See more ↓"}</button>}
          </div>}
        </div>
        <style jsx>{`
          @keyframes categoryChipEnter { from { opacity: 0; transform: translateY(14px) scale(.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
          .category-chip-enter { animation: categoryChipEnter .42s cubic-bezier(.2,.8,.2,1) both; }
          @keyframes searchPulse { 0%,100% { opacity: 1; box-shadow: 0 0 0 0 rgba(240,68,85,0); } 50% { opacity: .48; box-shadow: 0 0 0 7px rgba(240,68,85,.08); } }
          .search-pulse { animation: searchPulse 2.1s ease-in-out infinite; }
          .browse-premium { background: linear-gradient(115deg,#f04455,#b91f38 58%,#79152b); border: 1px solid rgba(255,255,255,.28); box-shadow: 0 12px 35px rgba(231,53,69,.25), inset 0 1px 0 rgba(255,255,255,.25); }
          .browse-premium:hover { transform: translateY(-3px); box-shadow: 0 17px 42px rgba(231,53,69,.38), inset 0 1px 0 rgba(255,255,255,.3); }
          @media (prefers-reduced-motion: reduce) { .search-pulse, .category-chip-enter { animation: none; } }
        `}</style>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Explore the library</h2><span className="text-xs text-white/55">{filtered.length} titles</span>
        </div>
        <p className="mt-2 text-xs text-white/45">Sample titles are for testing only and are not saved to your account.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading ? Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/5" />) : filtered.map((x) => {
            const card = <><div className="relative aspect-[2/3] overflow-hidden bg-[#1c2029]">{x.poster_url ? <img src={x.poster_url} alt={x.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-end bg-gradient-to-br from-slate-700 to-slate-950 p-4"><span className="text-lg font-black">{x.title}</span></div>}{x.is_demo && <span className="absolute left-3 top-3 rounded-full bg-[#e73545] px-2.5 py-1 text-[10px] font-bold tracking-wide">DEMO</span>}</div><div className="p-4"><h3 className="line-clamp-1 text-sm font-bold">{x.title}</h3><p className="mt-1 text-xs text-white/50">{x.release_year || "New"}{x.duration_minutes ? " · " + x.duration_minutes + " min" : ""}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{x.description}</p><p className="mt-3 text-xs font-bold text-[#ff8791]">{x.is_demo ? "Sample title · Preview only" : "View title →"}</p></div></>;
            return x.is_demo ? <div key={x.id} className="group overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#111319]">{card}</div> : <Link key={x.id} href={"/content/" + x.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111319] transition hover:-translate-y-1 hover:border-white/25">{card}</Link>;
          })}
        </div>
        {!loading && filtered.length === 0 && <p className="py-20 text-center text-sm text-white/50">No titles found. Check back soon.</p>}
      </section>
    </main>
  );
}
