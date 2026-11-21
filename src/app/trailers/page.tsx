"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import SiteHeader from "@/src/components/site-header";
import { createClient } from "@/lib/supabase/client";

type Trailer = { id: string; title: string; description: string | null; poster_url: string | null; trailer_url: string; release_year: number | null; duration_minutes: number | null; category_id?: string | null; category?: string; attribution?: string; is_demo?: boolean };
type Category = { id: string; name: string };

const sampleTrailers: Trailer[] = [
  { id: "open-bbb", title: "Big Buck Bunny", description: "A gentle giant rabbit faces three mischievous forest troublemakers.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.mp4", release_year: 2008, duration_minutes: 10, category: "Animation", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-sintel", title: "Sintel", description: "A lone wanderer crosses a frozen world in search of a dragon she once befriended.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.mp4", release_year: 2010, duration_minutes: 15, category: "Fantasy", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-tears-steel", title: "Tears of Steel", description: "A science-fiction battle unfolds across a futuristic Amsterdam.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.png", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.mp4", release_year: 2012, duration_minutes: 12, category: "Sci-Fi", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-elephants-dream", title: "Elephants Dream", description: "Two characters explore a surreal mechanical world in this open animated short.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.mp4", release_year: 2006, duration_minutes: 11, category: "Adventure", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
];

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [mutedByTrailer, setMutedByTrailer] = useState<Record<string, boolean>>({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("all");
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    void (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      const [{ data, error }, { data: categoryRows }] = await Promise.all([
        supabase.from("content").select("id,title,description,poster_url,trailer_url,release_year,duration_minutes,category_id").not("trailer_url", "is", null).neq("trailer_url", "").order("created_at", { ascending: false }),
        supabase.from("categories").select("id,name").order("name"),
      ]);
      if (!active) return;
      const categoryList = (categoryRows || []) as Category[];
      setCategories(categoryList);
      const categoryIdsByName = new Map(categoryList.map((category) => [category.name.toLowerCase(), category.id]));
      const databaseTrailers = error ? [] : ((data || []) as Trailer[]).map((item) => ({ ...item, category: categoryList.find((c) => c.id === item.category_id)?.name || "Uncategorised" }));
      const fallbackTrailers = sampleTrailers
        .filter((sample) => !databaseTrailers.some((item) => item.title.toLowerCase() === sample.title.toLowerCase()))
        .map((sample) => ({ ...sample, category_id: categoryIdsByName.get((sample.category || "").toLowerCase()) || null }));
      setTrailers([...databaseTrailers, ...fallbackTrailers]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const visibleTrailers = useMemo(() => {
    const term = query.trim().toLowerCase();
    return trailers.filter((item) =>
      (categoryId === "all" || item.category_id === categoryId) &&
      (!term || item.title.toLowerCase().includes(term) || (item.description || "").toLowerCase().includes(term) || (item.category || "").toLowerCase().includes(term) || String(item.release_year || "").includes(term))
    );
  }, [trailers, query, categoryId]);

  useEffect(() => { setActiveIndex(0); }, [query, categoryId]);
  const activeTrailer = visibleTrailers[activeIndex];
  const nextTrailer = () => { if (visibleTrailers.length) setActiveIndex((current) => (current + 1) % visibleTrailers.length); };

  useEffect(() => {
    setIsPlaying(false);
    setNeedsTap(false);
    setPlaybackError(false);
  }, [activeTrailer?.id]);

  useEffect(() => {
    if (!isPlaying || visibleTrailers.length < 2) return;
    const timer = window.setTimeout(nextTrailer, 30000);
    return () => window.clearTimeout(timer);
  }, [isPlaying, activeTrailer?.id, visibleTrailers.length]);

  useEffect(() => {
    const node = playerRef.current;
    if (!node || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.25) {
        if (videoRef.current) videoRef.current.muted = true;
        setMuted(true);
        if (activeTrailer) setMutedByTrailer((previous) => ({ ...previous, [activeTrailer.id]: true }));
      }
    }, { threshold: [0, 0.25, 0.5] });
    observer.observe(node);
    return () => observer.disconnect();
  }, [activeTrailer?.id, activeTrailer]);

  return <main className="min-h-screen bg-[#08090c] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-[#ff8791]">STREAM UG · Previews</p>
        <h1 className="mt-2 text-3xl font-black sm:text-4xl">Movie trailers</h1>
        <p className="mt-2 text-sm text-white/50">Search every available trailer or choose a category to explore.</p>
      </div>
      <div className="mb-6 grid gap-3 sm:grid-cols-[minmax(0,1fr)_260px]">
        <label className="flex min-h-12 items-center gap-3 rounded-xl border border-white/15 bg-[#141720] px-4 focus-within:border-[#f04455]">
          <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-white/45" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search trailers by movie title…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-white/40" />
          {query && <button type="button" onClick={() => setQuery("")} className="text-xs text-white/50 hover:text-white">Clear</button>}
        </label>
        <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} aria-label="Filter trailers by category" className="min-h-12 rounded-xl border border-white/15 bg-[#141720] px-4 text-sm text-white outline-none focus:border-[#f04455]">
          <option value="all">All categories</option>
          {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
        </select>
      </div>
      {loading ? <div className="aspect-video animate-pulse rounded-3xl bg-white/5" />
      : activeTrailer ? <>
        <section ref={playerRef} className="relative isolate aspect-video max-h-[min(68vw,620px)] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,.45)]">
          <video ref={videoRef} key={activeTrailer.id} src={activeTrailer.trailer_url} poster={activeTrailer.poster_url || undefined} autoPlay muted={activeTrailer ? (mutedByTrailer[activeTrailer.id] ?? muted) : muted} playsInline loop controls preload="metadata" controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} onCanPlay={() => { videoRef.current?.play().catch(() => setNeedsTap(true)); }} onPlaying={() => { setIsPlaying(true); setNeedsTap(false); setPlaybackError(false); }} onError={() => { setIsPlaying(false); setPlaybackError(true); }} className="absolute inset-0 h-full w-full object-contain" />
          {(needsTap || playbackError) && <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 px-6 text-center"><div><p className="text-sm font-bold text-white">{playbackError ? "This preview could not be loaded." : "Tap to start the preview."}</p><button type="button" onClick={() => { if (playbackError) nextTrailer(); else videoRef.current?.play().then(() => setNeedsTap(false)).catch(() => setNeedsTap(true)); }} className="mt-4 rounded-full bg-[#e73545] px-5 py-3 text-xs font-bold text-white">{playbackError ? "Try next preview" : "Play preview"}</button></div></div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-7">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff9ba4]">{activeTrailer.category || "Uncategorised"} · Playing now</p>
            <h2 className="mt-2 text-2xl font-black sm:text-4xl">{activeTrailer.title}</h2>
            <p className="mt-2 max-w-2xl text-xs text-white/75 sm:text-sm">{activeTrailer.description}</p>
            <p className="mt-2 text-[10px] text-white/45">{activeTrailer.attribution || "STREAM UG"} · Next preview in about 30 seconds</p>
          </div>
          <button type="button" aria-label={(activeTrailer ? (mutedByTrailer[activeTrailer.id] ?? muted) : muted) ? "Turn preview sound on" : "Mute preview"} title={(activeTrailer ? (mutedByTrailer[activeTrailer.id] ?? muted) : muted) ? "Turn sound on" : "Mute sound"} onClick={() => { const current = activeTrailer ? (mutedByTrailer[activeTrailer.id] ?? muted) : muted; const next = !current; setMuted(next); if (activeTrailer) setMutedByTrailer((previous) => ({ ...previous, [activeTrailer.id]: next })); if (videoRef.current) { videoRef.current.muted = next; if (!next) videoRef.current.play().catch(() => setNeedsTap(true)); } }} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{(activeTrailer ? (mutedByTrailer[activeTrailer.id] ?? muted) : muted) ? <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></> : <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m2.5-9.5a8.5 8.5 0 0 1 0 12"/></>}</svg>
          </button>
          <button type="button" onClick={nextTrailer} aria-label="Next trailer" title="Next trailer" className="absolute right-4 top-16 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
        </section>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">More trailers</h2><p className="mt-1 text-xs text-white/40">Category: {categories.find((category) => category.id === categoryId)?.name || "All categories"}</p></div><p className="text-xs text-white/40">{visibleTrailers.length} results</p></div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {visibleTrailers.map((item, index) => <button key={item.id} type="button" onClick={() => { setActiveIndex(index); }} className={"overflow-hidden rounded-2xl border text-left transition " + (index === activeIndex ? "border-[#f04455] bg-[#21151a]" : "border-white/10 bg-[#12151d] hover:border-white/30")}>
            <div className="relative aspect-video bg-black"><img src={item.poster_url || "/placeholder-movie.png"} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-75"/><span className="absolute inset-0 grid place-items-center text-2xl text-white drop-shadow">▶</span></div>
            <div className="p-3"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{item.category || "Uncategorised"}{item.is_demo ? " · SAMPLE" : ""}</p></div>
          </button>)}
        </div>
      </> : <div className="rounded-2xl border border-white/10 p-10 text-center text-white/60">{loading ? "Loading trailers…" : "No trailers match that search or category."} <button type="button" onClick={() => { setQuery(""); setCategoryId("all"); }} className="ml-2 text-[#ff8791]">Clear filters</button> · <Link href="/browse" className="text-[#ff8791]">Browse movies</Link></div>}
    </div>
  </main>;
}
