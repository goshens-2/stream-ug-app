"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import SiteHeader from "@/src/components/site-header";
import { createClient } from "@/lib/supabase/client";

type Trailer = { id: string; title: string; description: string | null; poster_url: string | null; trailer_url: string; release_year: number | null; duration_minutes: number | null; category?: string; attribution?: string; is_demo?: boolean };

const sampleTrailers: Trailer[] = [
  { id: "open-bbb", title: "Big Buck Bunny", description: "A gentle giant rabbit faces three mischievous forest troublemakers.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/big_buck_bunny.mp4", release_year: 2008, duration_minutes: 10, category: "Animation", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-sintel", title: "Sintel", description: "A lone wanderer crosses a frozen world in search of a dragon she once befriended.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/sintel.mp4", release_year: 2010, duration_minutes: 15, category: "Fantasy", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-tears-steel", title: "Tears of Steel", description: "A science-fiction battle unfolds across a futuristic Amsterdam.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.png", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/tears_of_steel.mp4", release_year: 2012, duration_minutes: 12, category: "Sci-Fi", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-elephants-dream", title: "Elephants Dream", description: "Two characters explore a surreal mechanical world in this open animated short.", poster_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.jpg", trailer_url: "https://raw.githubusercontent.com/andreasbotsikas/DemoVideos/master/elephants_dream.mp4", release_year: 2006, duration_minutes: 11, category: "Adventure", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
];

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [muted, setMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [needsTap, setNeedsTap] = useState(false);
  const [playbackError, setPlaybackError] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    void (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      const { data, error } = await supabase.from("content")
        .select("id,title,description,poster_url,trailer_url,release_year,duration_minutes")
        .not("trailer_url", "is", null)
        .neq("trailer_url", "")
        .order("created_at", { ascending: false });
      if (!active) return;
      setTrailers([...(error ? [] : ((data || []) as Trailer[])), ...sampleTrailers]);
      setLoading(false);
    })();
    return () => { active = false; };
  }, []);

  const activeTrailer = trailers[activeIndex % Math.max(1, trailers.length)];
  const nextTrailer = () => {
    if (trailers.length) {
      setActiveIndex((current) => (current + 1) % trailers.length);
      
    }
  };

  useEffect(() => {
    setIsPlaying(false);
    setNeedsTap(false);
    setPlaybackError(false);
  }, [activeTrailer?.id]);

  useEffect(() => {
    if (!isPlaying || trailers.length < 2) return;
    const timer = window.setTimeout(nextTrailer, 30000);
    return () => window.clearTimeout(timer);
  }, [isPlaying, activeTrailer?.id, trailers.length]);

  return <main className="min-h-screen bg-[#08090c] text-white">
    <SiteHeader />
    <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div><p className="text-xs font-bold uppercase tracking-[.25em] text-[#ff8791]">STREAM UG · Previews</p><h1 className="mt-2 text-3xl font-black sm:text-4xl">Movie trailers</h1><p className="mt-2 text-sm text-white/50">Watch each preview as it plays, then the next title takes over automatically.</p></div>
        <span className="text-xs text-white/45">{loading ? "Loading previews…" : trailers.length + " previews"}</span>
      </div>
      {loading ? <div className="aspect-video animate-pulse rounded-3xl bg-white/5" />
      : activeTrailer ? <>
        <section className="relative isolate aspect-video max-h-[min(68vw,620px)] overflow-hidden rounded-3xl border border-white/10 bg-black shadow-[0_24px_80px_rgba(0,0,0,.45)]">
          <video ref={videoRef} key={activeTrailer.id} src={activeTrailer.trailer_url} poster={activeTrailer.poster_url || undefined} autoPlay muted={muted} playsInline loop controls preload="auto" onCanPlay={() => { const playPromise = videoRef.current?.play(); playPromise?.catch(() => setNeedsTap(true)); }} onPlaying={() => { setIsPlaying(true); setNeedsTap(false); setPlaybackError(false); }} onError={() => { setIsPlaying(false); setPlaybackError(true); }} className="absolute inset-0 h-full w-full object-contain" />
          {(needsTap || playbackError) && <div className="absolute inset-0 z-20 grid place-items-center bg-black/75 px-6 text-center"><div><p className="text-sm font-bold text-white">{playbackError ? "This preview could not be loaded." : "Tap to start the preview."}</p><button type="button" onClick={() => { if (playbackError) nextTrailer(); else { const playPromise = videoRef.current?.play(); playPromise?.then(() => setNeedsTap(false)).catch(() => setNeedsTap(true)); } }} className="mt-4 rounded-full bg-[#e73545] px-5 py-3 text-xs font-bold text-white">{playbackError ? "Try next preview" : "Play preview"}</button></div></div>}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent px-5 pb-5 pt-16 sm:px-8 sm:pb-7">
            <p className="text-[10px] font-black uppercase tracking-[.2em] text-[#ff9ba4]">{activeTrailer.category || "STREAM UG preview"} · Playing now</p>
            <h2 className="mt-2 text-2xl font-black sm:text-4xl">{activeTrailer.title}</h2>
            <p className="mt-2 max-w-2xl text-xs text-white/75 sm:text-sm">{activeTrailer.description}</p>
            <p className="mt-2 text-[10px] text-white/45">{activeTrailer.attribution || "STREAM UG"} · Next preview in about 30 seconds</p>
          </div>
          <button type="button" aria-label={muted ? "Turn preview sound on" : "Mute preview"} title={muted ? "Turn sound on" : "Mute sound"} onClick={() => { setMuted((value) => { const next = !value; if (videoRef.current) { videoRef.current.muted = next; if (!next) void videoRef.current.play().catch(() => setNeedsTap(true)); } return next; }); }} className="absolute right-4 top-4 z-10 grid h-11 w-11 place-items-center rounded-full border border-white/25 bg-black/65 text-white shadow-lg backdrop-blur transition hover:bg-black/85"><svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{muted ? <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="m16 9 5 6m0-6-5 6"/></> : <><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7m2.5-9.5a8.5 8.5 0 0 1 0 12"/></>}</svg></button>
          <button type="button" onClick={nextTrailer} className="absolute bottom-5 right-5 z-10 rounded-full bg-[#e73545] px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:bg-[#f04455]">Next trailer →</button>
        </section>
        <div className="mt-8 flex items-center justify-between gap-3"><h2 className="text-lg font-bold">Up next</h2><p className="text-xs text-white/40">Choose a title to play it now</p></div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {trailers.map((item, index) => <button key={item.id} type="button" onClick={() => { setActiveIndex(index); setMuted(true); }} className={"overflow-hidden rounded-2xl border text-left transition " + (index === activeIndex ? "border-[#f04455] bg-[#21151a]" : "border-white/10 bg-[#12151d] hover:border-white/30")}>
            <div className="relative aspect-video bg-black"><img src={item.poster_url || "/placeholder-movie.png"} alt="" className="h-full w-full object-cover opacity-75"/><span className="absolute inset-0 grid place-items-center text-2xl text-white drop-shadow">▶</span></div>
            <div className="p-3"><p className="truncate text-sm font-bold">{item.title}</p><p className="mt-1 text-[10px] uppercase tracking-wider text-white/45">{item.category || "STREAM UG"}{item.is_demo ? " · SAMPLE" : ""}</p></div>
          </button>)}
        </div>
      </> : <div className="rounded-2xl border border-white/10 p-10 text-center text-white/60">No previews are available yet. <Link href="/browse" className="text-[#ff8791]">Browse movies</Link></div>}
    </div>
  </main>;
}
