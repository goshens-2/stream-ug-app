"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Movie = { id: string; title: string; description: string | null; poster_url: string | null; trailer_url?: string | null; video_url?: string | null; embed_url?: string | null; release_year: number | null; duration_minutes: number | null; category_id: string | null; is_demo?: boolean };
type Category = { id: string; name: string; slug: string };
type VJ = { id: string; name: string; slug: string };
const demoCategories: Category[] = [
  { id: "demo-action", name: "Action (Sample)", slug: "demo-action" },
  { id: "demo-drama", name: "Drama (Sample)", slug: "demo-drama" },
  { id: "demo-comedy", name: "Comedy (Sample)", slug: "demo-comedy" },
  { id: "demo-animation", name: "Animation (Sample)", slug: "demo-animation" },
  { id: "sample-animation", name: "Animation (Open Sample)", slug: "sample-animation" },
  { id: "sample-fantasy", name: "Fantasy (Open Sample)", slug: "sample-fantasy" },
  { id: "sample-scifi", name: "Sci-Fi (Open Sample)", slug: "sample-scifi" },
  { id: "sample-adventure", name: "Adventure (Open Sample)", slug: "sample-adventure" },
];
const demoMovies: Movie[] = [
  { id: "demo-movie-1", title: "The Last Mission", description: "A fearless team races against time to protect their city. Sample movie for dashboard testing.", poster_url: "https://picsum.photos/seed/stream-last-mission/480/720", release_year: 2025, duration_minutes: 116, category_id: "demo-action", is_demo: true },
  { id: "demo-movie-2", title: "Kampala Dreams", description: "A young creative follows an unexpected opportunity through the streets of Kampala.", poster_url: "https://picsum.photos/seed/stream-kampala-dreams/480/720", release_year: 2024, duration_minutes: 104, category_id: "demo-drama", is_demo: true },
  { id: "demo-movie-3", title: "Laugh Out Loud", description: "A lively comedy about friendship, family and one very chaotic weekend.", poster_url: "https://picsum.photos/seed/stream-laugh-out-loud/480/720", release_year: 2023, duration_minutes: 92, category_id: "demo-comedy", is_demo: true },
  { id: "demo-movie-4", title: "Beyond the Horizon", description: "Two strangers discover that a fresh start can come from the most unexpected place.", poster_url: "https://picsum.photos/seed/stream-beyond-horizon/480/720", release_year: 2025, duration_minutes: 121, category_id: "demo-drama", is_demo: true },
  { id: "demo-movie-5", title: "Jungle Quest", description: "An animated adventure filled with curious creatures and surprising discoveries.", poster_url: "https://picsum.photos/seed/stream-jungle-quest/480/720", release_year: 2024, duration_minutes: 88, category_id: "demo-animation", is_demo: true },
  { id: "demo-movie-6", title: "Code Red", description: "A suspense-filled thriller where every decision changes the outcome.", poster_url: "https://picsum.photos/seed/stream-code-red/480/720", release_year: 2022, duration_minutes: 109, category_id: "demo-action", is_demo: true },
];

const sampleTrailerMovies: Movie[] = [
  { id: "open-bbb", title: "Big Buck Bunny", description: "A gentle giant rabbit faces three mischievous forest troublemakers.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.mp4", release_year: 2008, duration_minutes: 10, category_id: "sample-animation", is_demo: true },
  { id: "open-sintel", title: "Sintel", description: "A lone wanderer crosses a frozen world in search of a dragon she once befriended.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.mp4", release_year: 2010, duration_minutes: 15, category_id: "sample-fantasy", is_demo: true },
  { id: "open-tears-steel", title: "Tears of Steel", description: "A science-fiction battle unfolds across a futuristic Amsterdam.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.png", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.mp4", release_year: 2012, duration_minutes: 12, category_id: "sample-scifi", is_demo: true },
  { id: "open-elephants-dream", title: "Elephants Dream", description: "Two characters explore a surreal mechanical world in this open animated short.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.mp4", release_year: 2006, duration_minutes: 11, category_id: "sample-adventure", is_demo: true },
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
  const [vjs, setVjs] = useState<VJ[]>([]);
  const [vjAssignments, setVjAssignments] = useState<Record<string, string[]>>({});
  const [selectedVj, setSelectedVj] = useState("all");
  const [name, setName] = useState("there");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [continueCount, setContinueCount] = useState(0);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoriesOpenAt, setCategoriesOpenAt] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeTrailerIndex, setActiveTrailerIndex] = useState(0);

  const [trailerMuted, setTrailerMuted] = useState(true);
  const [trailerPlaying, setTrailerPlaying] = useState(false);
  const [trailerNeedsTap, setTrailerNeedsTap] = useState(false);
  const [trailerFailed, setTrailerFailed] = useState(false);
  const trailerVideoRef = useRef<HTMLVideoElement | null>(null);
  const trailerHeroRef = useRef<HTMLDivElement | null>(null);
  const userId = useRef<string | null>(null);

  useEffect(() => {
    const s = createClient();
    let live = true;
    void (async () => {
      const { data: { session } } = await s.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      userId.current = session.user.id;
      const [{ data: p }, { data: c }, { data: k }, { count }, { data: historyRows }] = await Promise.all([
        s.from("profiles").select("name,is_admin").eq("id", session.user.id).maybeSingle(),
        s.from("content").select("id,title,description,poster_url,trailer_url,video_url,embed_url,release_year,duration_minutes,category_id").order("created_at", { ascending: false }),
        s.from("categories").select("id,name,slug").order("name"),
        s.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", session.user.id).eq("read", false),
        s.from("view_history").select("progress_seconds,duration_seconds,updated_at").eq("user_id", session.user.id),
      ]);
      if (!live) return;
      if (p?.is_admin) { window.location.replace("/admin"); return; }
      setName(p?.name || session.user.email?.split("@")[0] || "there");
      setItems((c || []) as Movie[]);
      setCats((k || []) as Category[]);
      const [{ data: vjRows }, { data: assignmentRows }] = await Promise.all([
        s.from("vjs").select("id,name,slug").eq("is_active", true).order("name"),
        s.from("content_vjs").select("content_id,vj_id"),
      ]);
      if (!live) return;
      setVjs((vjRows || []) as VJ[]);
      const assignments: Record<string, string[]> = {};
      (assignmentRows || []).forEach((row: { content_id: string; vj_id: string }) => {
        (assignments[row.content_id] ||= []).push(row.vj_id);
      });
      setVjAssignments(assignments);
      setUnread(count || 0);
      const lastSeenAt = window.localStorage.getItem("stream-ug-continue-seen:" + session.user.id);
      setContinueCount((historyRows || []).filter((row) =>
        row.duration_seconds > 0 &&
        row.progress_seconds < row.duration_seconds * 0.95 &&
        (!lastSeenAt || new Date(row.updated_at).getTime() > new Date(lastSeenAt).getTime())
      ).length);
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const allCategories = useMemo(() => [...cats, ...demoCategories.filter((demo) => !cats.some((real) => real.name.toLowerCase() === demo.name.toLowerCase()))], [cats]);
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 6);
  const allMovies = useMemo(() => [
    ...items,
    ...demoMovies,
    ...sampleTrailerMovies.filter((sample) => !items.some((item) => item.title.toLowerCase() === sample.title.toLowerCase())),
  ], [items]);
  const selectedCategoryName = cat === "all"
    ? "All categories"
    : allCategories.find((category) => category.id === cat)?.name || "Selected category";
  const filtered = useMemo(() => allMovies.filter((x) => {
    const categoryName = cats.find((category) => category.id === x.category_id)?.name
      || demoCategories.find((category) => category.id === x.category_id)?.name || "";
    const term = q.trim().toLowerCase();
    return (cat === "all" || x.category_id === cat)
      && (!term || x.title.toLowerCase().includes(term) || (x.description || "").toLowerCase().includes(term) || categoryName.toLowerCase().includes(term));
  }), [allMovies, cat, q, cats]);
  const suggestions = useMemo(() => {
    const term = q.trim().toLowerCase();
    return allMovies.filter((movie) => !term || movie.title.toLowerCase().includes(term) || (movie.description || "").toLowerCase().includes(term)).slice(0, 7);
  }, [allMovies, q]);
  const trailerMovies = useMemo(() => [
    ...items.filter((movie) => !!movie.trailer_url).map((movie) => ({ ...movie, category_name: cats.find((category) => category.id === movie.category_id)?.name || "STREAM UG", attribution: "STREAM UG" })),
    ...sampleTrailerMovies.filter((sample) => !items.some((item) => item.title.toLowerCase() === sample.title.toLowerCase())).map((movie) => ({ ...movie, category_name: movie.category_id === "sample-animation" ? "Animation" : movie.category_id === "sample-fantasy" ? "Fantasy" : movie.category_id === "sample-scifi" ? "Sci-Fi" : "Adventure", attribution: "Blender Foundation · CC BY 3.0" })),
  ], [items, cats]);
  const activeTrailer = trailerMovies[activeTrailerIndex % Math.max(1, trailerMovies.length)];
  const rotatingSuggestions = useMemo(() => allMovies.slice(0, 8), [allMovies]);
  useEffect(() => {
    setTrailerPlaying(false);
    setTrailerNeedsTap(false);
    setTrailerFailed(false);
  }, [activeTrailer?.id]);
  useEffect(() => {
    if (!trailerPlaying || trailerMovies.length < 2) return;
    const timer = window.setTimeout(() => {
      setActiveTrailerIndex((value) => (value + 1) % trailerMovies.length);
      
    }, 30000);
    return () => window.clearTimeout(timer);
  }, [trailerPlaying, activeTrailer?.id, trailerMovies.length]);
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
        const match = items.find((x) => x.title.toLowerCase().includes(q.trim().toLowerCase()));
        await s.from("search_logs").insert({ user_id: userId.current, query: q.trim(), matched_content_id: match?.id || null });
      })();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [q, items]);

  useEffect(() => {
    const node = trailerHeroRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
        if (trailerVideoRef.current) trailerVideoRef.current.muted = true;
        setTrailerMuted(true);
      }
    }, { threshold: [0, 0.25, 0.5] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTrailer?.id]);

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#08090c]/95 shadow-[0_8px_35px_rgba(0,0,0,.28)] backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="shrink-0 text-lg font-black tracking-[.18em] text-white sm:text-xl">STREAM<span className="text-[#f04455]"> UG</span></Link>
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-semibold text-white/90 lg:flex">
            <Link href="/browse" className="transition hover:text-white">Home</Link>
            <Link href="/trailers" className="transition hover:text-white">Trailers</Link>
            <Link href="/watch-with-me" className="transition hover:text-white">Watch With Me</Link>
            <Link href="/favorites" className="transition hover:text-white">Watchlist</Link>
            <Link href="/history" className="transition hover:text-white">Continue watching{continueCount > 0 ? " (" + continueCount + ")" : ""}</Link>
          </nav>
          <div className="ml-auto flex items-center gap-2 sm:gap-3">
            <div className="relative hidden md:block">
              <label htmlFor="vj-filter" className="sr-only">Choose a VJ</label>
              <select id="vj-filter" value={selectedVj} onChange={(event) => { setSelectedVj(event.target.value); document.getElementById("library-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} className="max-w-[190px] rounded-full border border-white/15 bg-[#151821] px-4 py-2.5 text-xs font-semibold text-white outline-none transition hover:border-[#f04455]/70 focus:border-[#f04455]">
                <option value="all">All VJs</option>
                {vjs.map((vj) => <option key={vj.id} value={vj.id}>{vj.name}</option>)}
              </select>
            </div>
            <div className="relative">
              {searchOpen && (
                <div className="absolute right-0 top-[calc(100%+14px)] z-50 w-[min(92vw,390px)] overflow-hidden rounded-2xl border border-white/15 bg-[#151821] p-4 shadow-[0_24px_70px_rgba(0,0,0,.6)]">
                  <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-black/35 px-3 py-2.5 focus-within:border-[#f04455]">
                    <SearchGlyph />
                    <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Escape") setSearchOpen(false); if (e.key === "Enter") { setSearchOpen(false); document.getElementById("library-results")?.scrollIntoView({ behavior: "smooth", block: "start" }); } }} placeholder="Search movies, shows…" className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/40" />
                    {q && <button type="button" onClick={() => setQ("")} className="text-xs text-white/55 hover:text-white">Clear</button>}
                  </div>
                  <p className="px-1 pb-2 pt-4 text-[10px] font-bold uppercase tracking-[.2em] text-white/45">{q.trim() ? "Search suggestions" : "Popular titles"}</p>
                  {suggestions.length ? suggestions.map((movie) => (
                    <button key={movie.id} type="button" onClick={() => { setQ(movie.title); setSearchOpen(false); window.setTimeout(() => document.getElementById("library-results")?.scrollIntoView({ behavior: "smooth", block: "start" }), 80); }} className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-white/10">
                      <span className="h-11 w-8 shrink-0 overflow-hidden rounded-md bg-white/10">{movie.poster_url && <img src={movie.poster_url} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover" />}</span>
                      <span className="min-w-0 flex-1 truncate text-sm font-semibold text-white">{movie.title}</span>
                      <span className="text-xs text-white/35">View</span>
                    </button>
                  )) : <p className="px-2 py-3 text-sm text-white/45">No matching titles. Try another search.</p>}
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
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-5 pb-3 md:hidden">
          <label htmlFor="vj-filter-mobile" className="text-xs font-semibold text-white/60">VJ</label>
          <select id="vj-filter-mobile" value={selectedVj} onChange={(event) => setSelectedVj(event.target.value)} className="min-w-0 max-w-[180px] rounded-full border border-white/15 bg-[#151821] px-3 py-2 text-xs font-semibold text-white outline-none focus:border-[#f04455]">
            <option value="all">All VJs</option>
            {vjs.map((vj) => <option key={vj.id} value={vj.id}>{vj.name}</option>)}
          </select>
        </div>
        <div className="mx-auto flex max-w-7xl items-center gap-4 px-5 pb-3 lg:hidden">
          <Link href="/trailers" className="text-xs font-semibold text-white/75">Trailers</Link>
          <Link href="/watch-with-me" className="text-xs font-semibold text-white/75">Watch With Me</Link>
          <Link href="/favorites" className="text-xs font-semibold text-white/75">Watchlist</Link>
          <Link href="/history" className="text-xs font-semibold text-white/75">Continue watching{continueCount > 0 ? " (" + continueCount + ")" : ""}</Link>
          <span className="ml-auto max-w-[42%] truncate text-xs text-white/60">Hi, {name}</span>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 pt-6">
        <div ref={trailerHeroRef} className="relative h-[clamp(260px,42vw,420px)] overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#11151e] shadow-[0_22px_70px_rgba(0,0,0,.42)]">
          {activeTrailer?.trailer_url && <video ref={trailerVideoRef} key={activeTrailer.id} src={activeTrailer.trailer_url} poster={activeTrailer.poster_url || undefined} autoPlay muted={trailerMuted} playsInline loop preload="metadata" controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} onCanPlay={() => { const playPromise = trailerVideoRef.current?.play(); playPromise?.catch(() => setTrailerNeedsTap(true)); }} onPlaying={() => { setTrailerPlaying(true); setTrailerNeedsTap(false); setTrailerFailed(false); }} onError={() => { setTrailerPlaying(false); setTrailerFailed(true); }} className="absolute inset-0 h-full w-full object-cover" /> }
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/15" />
          <span className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 text-[10px] font-black tracking-[.18em] text-white/85 shadow-lg backdrop-blur-sm">STREAM UG</span>
          <div className="absolute right-4 top-4 z-10 rounded-full border border-white/25 bg-black/60 px-4 py-2 text-[10px] font-black uppercase tracking-[.18em] text-white backdrop-blur-md sm:right-6 sm:top-6">{activeTrailer?.category_name || "Featured preview"}</div>
          <button type="button" aria-label={trailerMuted ? "Turn preview sound on" : "Mute preview"} title={trailerMuted ? "Turn sound on" : "Mute sound"} onClick={() => { setTrailerMuted((value) => { const next = !value; if (trailerVideoRef.current) { trailerVideoRef.current.muted = next; if (!next) void trailerVideoRef.current.play().catch(() => setTrailerNeedsTap(true)); } return next; }); }} className="absolute left-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/60 text-white shadow-lg backdrop-blur-md transition hover:bg-black/80 sm:left-6 sm:top-6"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{trailerMuted ? <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></> : <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m2.5-9.5a8.5 8.5 0 0 1 0 12"/></>}</svg></button>
          {(trailerNeedsTap || trailerFailed) && <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 px-6 text-center"><div><p className="text-sm font-bold text-white">{trailerFailed ? "This preview could not be loaded." : "Tap to start the preview."}</p><button type="button" onClick={() => { if (trailerFailed) { setActiveTrailerIndex((value) => (value + 1) % trailerMovies.length); } else { const playPromise = trailerVideoRef.current?.play(); playPromise?.then(() => setTrailerNeedsTap(false)).catch(() => setTrailerNeedsTap(true)); } }} className="mt-4 rounded-full bg-[#e73545] px-5 py-3 text-xs font-bold text-white">{trailerFailed ? "Try next preview" : "Play preview"}</button></div></div>}
          <div className="absolute inset-0 z-[1] flex items-center justify-center px-6 text-center">
            <div className="max-w-2xl">
              <p className="text-[10px] font-black uppercase tracking-[.28em] text-[#ff9ba4]">STREAM UG · Featured preview</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white drop-shadow-lg sm:text-5xl">{activeTrailer?.title || "Discover your next movie"}</h1>
              <p className="mx-auto mt-3 max-w-xl text-xs leading-6 text-white/80 sm:text-sm">{activeTrailer?.description}</p>
              <p className="mt-3 text-[9px] font-semibold uppercase tracking-[.16em] text-white/55">{activeTrailer?.attribution || "STREAM UG"} · Preview plays automatically</p>
            </div>
          </div>
          <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
            {trailerMovies.map((movie, index) => <button key={movie.id} type="button" aria-label={"Show " + movie.title + " preview"} onClick={() => { setActiveTrailerIndex(index); setTrailerMuted(true); }} className={"h-1.5 rounded-full transition-all " + (index === activeTrailerIndex % trailerMovies.length ? "w-8 bg-[#ff6473]" : "w-3 bg-white/45 hover:bg-white")} />)}
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

        <div id="library-results" className="mt-8 flex items-center justify-between scroll-mt-28">
          <div><h2 className="text-xl font-bold text-white">Explore the library</h2><p className="mt-1 text-xs text-[#ff9ba4]">Showing: {selectedVj === "all" ? "All VJs" : vjs.find((vj) => vj.id === selectedVj)?.name || "Selected VJ"} · {selectedCategoryName}</p></div><span className="text-xs text-white/55">{filtered.length} titles</span>
        </div>
        <p className="mt-2 text-xs text-white/45">Sample titles are for testing only and are not saved to your account.</p>
        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading ? Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/5" />) : filtered.map((x) => {
            const categoryLabel = cats.find((category) => category.id === x.category_id)?.name
              || demoCategories.find((category) => category.id === x.category_id)?.name || "Uncategorised";
            const card = <><div className="relative aspect-[2/3] overflow-hidden bg-[#1c2029]">{x.poster_url ? <img src={x.poster_url} alt={x.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-end bg-gradient-to-br from-slate-700 to-slate-950 p-4"><span className="text-lg font-black">{x.title}</span></div>}{x.is_demo && <span className="absolute left-3 top-3 rounded-full bg-[#e73545] px-2.5 py-1 text-[10px] font-bold tracking-wide">DEMO</span>}</div><div className="p-4"><h3 className="line-clamp-1 text-sm font-bold">{x.title}</h3><p className="mt-1 text-xs text-white/50">{x.release_year || "New"}{x.duration_minutes ? " · " + x.duration_minutes + " min" : ""}</p><p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-[#ff9ba4]">{categoryLabel}</p><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/50">{x.description}</p><p className="mt-3 text-xs font-bold text-[#ff8791]">{x.is_demo ? "Sample preview" : x.video_url || x.embed_url ? "Play movie" : x.trailer_url ? "Watch preview" : "View details"}</p></div></>;
            return x.is_demo && x.trailer_url ? <button key={x.id} type="button" onClick={() => { const index = trailerMovies.findIndex((movie) => movie.id === x.id); if (index >= 0) { setActiveTrailerIndex(index); setTrailerMuted(true); window.scrollTo({ top: 0, behavior: "smooth" }); } }} className="group overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#111319] text-left transition hover:-translate-y-1 hover:border-[#ff8791]/60">{card}</button> : x.is_demo ? <div key={x.id} className="group overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#111319]">{card}</div> : <article key={x.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111319] transition hover:-translate-y-1 hover:border-white/25"><Link href={"/content/" + x.id} className="block">{card}</Link><div className="px-4 pb-4"><Link href={"/content/" + x.id + "?watchlist=add"} className="block rounded-lg border border-white/15 px-3 py-2.5 text-center text-xs font-bold text-white/80 transition hover:border-[#f04455]/70 hover:bg-[#f04455]/10 hover:text-white">＋ Add to watchlist</Link></div></article>;
          })}
        </div>
        {!loading && filtered.length === 0 && <p className="py-20 text-center text-sm text-white/50">No titles found. Check back soon.</p>}
      </section>
    </main>
  );
}


