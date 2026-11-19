"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Trailer = { id: string; title: string; description: string | null; poster_url: string | null; trailer_url: string; release_year: number | null; duration_minutes: number | null; category?: string; attribution?: string; is_demo?: boolean };

const sampleTrailers: Trailer[] = [
  { id: "open-bbb", title: "Big Buck Bunny", description: "A gentle giant rabbit faces three mischievous forest troublemakers.", poster_url: "https://picsum.photos/seed/stream-buck-bunny/960/540", trailer_url: "https://video.blender.org/static/webseed/bf1f3fb5-b119-4f9f-9930-8e20e892b898-720.mp4", release_year: 2008, duration_minutes: 10, category: "Animation", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-sintel", title: "Sintel", description: "A lone wanderer crosses a frozen world in search of a dragon she once befriended.", poster_url: "https://picsum.photos/seed/stream-sintel/960/540", trailer_url: "https://video.blender.org/static/webseed/0eb052d0-fd51-43e6-aa33-ecdbf77a5d40-720.mp4", release_year: 2010, duration_minutes: 15, category: "Fantasy", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-tears-steel", title: "Tears of Steel", description: "A science-fiction battle unfolds across a futuristic Amsterdam.", poster_url: "https://picsum.photos/seed/stream-tears-steel/960/540", trailer_url: "https://video.blender.org/static/webseed/8533ea43-4271-4a57-9694-e9d0b35e1aa1-720.mp4", release_year: 2012, duration_minutes: 12, category: "Sci-Fi", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
  { id: "open-caminandes", title: "Caminandes: Gran Dillama", description: "A determined llama discovers that greener pastures come with a few surprises.", poster_url: "https://picsum.photos/seed/stream-caminandes/960/540", trailer_url: "https://video.blender.org/static/webseed/fb70d459-48d2-4db5-adba-813c84f9200a-720.mp4", release_year: 2013, duration_minutes: 2, category: "Adventure", attribution: "Blender Foundation · CC BY 3.0", is_demo: true },
];

export default function TrailersPage() {
  const [trailers, setTrailers] = useState<Trailer[]>([]);
  const [loading, setLoading] = useState(true);
  const [playing, setPlaying] = useState<string | null>(null);

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

  return <main className="min-h-screen bg-[#08090c] px-5 py-9 text-white">
    <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <Link href="/browse" className="text-sm font-semibold text-white/60 transition hover:text-white">← Back to STREAM UG</Link>
        <span className="text-xs font-bold uppercase tracking-[.2em] text-[#ff8791]">STREAM UG · Previews</span>
      </div>
      <section className="mt-8 rounded-[2rem] border border-white/10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(231,53,69,.25),transparent_45%),linear-gradient(120deg,#1b1e29,#0e1016)] p-8 sm:p-12">
        <p className="text-xs font-bold uppercase tracking-[.25em] text-[#ff8791]">First look</p>
        <h1 className="mt-3 text-4xl font-black sm:text-6xl">Movie trailers.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/65">Discover previews from STREAM UG and play sample films while our own trailer library grows.</p>
      </section>
      <div className="mt-9 flex items-center justify-between"><h2 className="text-xl font-bold">Available trailers</h2><span className="text-xs text-white/45">{trailers.length} previews</span></div>
      {loading ? <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({length:6},(_,i)=><div key={i} className="aspect-video animate-pulse rounded-2xl bg-white/5"/>)}</div>
      : trailers.length === 0 ? <div className="mt-5 rounded-3xl border border-dashed border-white/15 bg-white/[.025] px-6 py-16 text-center"><p className="text-lg font-bold">No trailers uploaded yet</p><p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/50">Trailers added to movie listings by the STREAM UG team will appear here automatically.</p><Link href="/browse" className="mt-6 inline-flex rounded-full bg-white px-5 py-3 text-xs font-bold text-black transition hover:bg-[#ffb2b9]">Explore the library</Link></div>
      : <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{trailers.map((item)=><article key={item.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#12151d]">
        <div className="relative aspect-video bg-black">{playing === item.id ? <video src={item.trailer_url} poster={item.poster_url || undefined} controls autoPlay className="h-full w-full"/> : <><img src={item.poster_url || "/placeholder-movie.png"} alt={item.title} className="h-full w-full object-cover opacity-80"/><button onClick={()=>setPlaying(item.id)} aria-label={"Play trailer for "+item.title} className="absolute inset-0 grid place-items-center bg-black/20 transition hover:bg-black/40"><span className="grid h-16 w-16 place-items-center rounded-full border border-white/50 bg-white/20 text-2xl text-white backdrop-blur">▶</span></button></>}</div>
        <div className="p-5"><div className="flex items-center justify-between gap-2"><span className="text-[10px] font-bold uppercase tracking-[.16em] text-[#ff8791]">{item.category || (item.is_demo ? "Sample preview" : "STREAM UG")}</span>{item.is_demo && <span className="rounded-full border border-white/15 px-2 py-1 text-[9px] font-bold text-white/50">DEMO</span>}</div><h3 className="mt-2 text-lg font-bold">{item.title}</h3><p className="mt-1 text-xs text-white/45">{[item.release_year,item.duration_minutes ? item.duration_minutes+" min" : null].filter(Boolean).join(" · ")}</p><p className="mt-3 line-clamp-3 text-sm leading-6 text-white/60">{item.description}</p><p className="mt-3 text-[10px] text-white/40">{item.attribution || "STREAM UG"}</p>{!item.is_demo && <Link href={"/content/"+item.id} className="mt-4 inline-flex text-xs font-bold text-[#ff8791] hover:text-white">View movie details →</Link>}</div>
      </article>)}</div>}
    </div>
  </main>;
}
