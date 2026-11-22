"use client";

import Link from "next/link";
import SiteHeader from "@/src/components/site-header";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Content = {
  id: string; title: string; description: string | null; poster_url: string | null;
  video_url: string | null; trailer_url: string | null; embed_url: string | null;
  release_year: number | null; duration_minutes: number | null; director: string | null;
  cast: string[] | null; genres: string[] | null; language: string | null;
  age_rating: string | null; category_id: string | null; content_type_id: string | null;
  watermark_enabled: boolean; watermark_text: string; watermark_opacity: number;
  watermark_position: string;
};

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<Content | null>(null);
  const [similar, setSimilar] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fav, setFav] = useState(false);
  const [score, setScore] = useState(0);
  const [average, setAverage] = useState("—");
  const [trailer, setTrailer] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [scheduleChoice, setScheduleChoice] = useState<"today" | "tomorrow" | "other">("today");
  const [scheduleDate, setScheduleDate] = useState(() => new Date().toLocaleDateString("en-CA"));
  const [scheduleTime, setScheduleTime] = useState("20:00");
  const [savingFavorite, setSavingFavorite] = useState(false);
  const [client] = useState(() => createClient());
  const userId = useRef<string | null>(null);
  const lastProgressSave = useRef(0);
  const progressSaving = useRef(false);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) { window.location.replace("/login"); return; }
      userId.current = user.id;

      const { data: content, error: contentError } = await client
        .from("content").select("*").eq("id", id).maybeSingle();
      if (!live) return;
      if (contentError) setError(contentError.message);
      if (!content) { setLoading(false); return; }

      // Fetch all title-related data together once the content IDs are known.
      const [{ data: favorite }, { data: ratings }, { data: categoryRow }, { data: typeRow }] = await Promise.all([
        client.from("favorites").select("id").eq("content_id", id).eq("user_id", user.id).maybeSingle(),
        client.from("ratings").select("score,user_id").eq("content_id", id),
        content.category_id
          ? client.from("categories").select("name").eq("id", content.category_id).maybeSingle()
          : Promise.resolve({ data: null }),
        content.content_type_id
          ? client.from("content_types").select("name").eq("id", content.content_type_id).maybeSingle()
          : Promise.resolve({ data: null }),
      ]);
      if (!live) return;
      let relatedQuery = client.from("content")
        .select("id,title,description,poster_url,video_url,trailer_url,embed_url,release_year,duration_minutes,director,cast,genres,language,age_rating,category_id,content_type_id,watermark_enabled,watermark_text,watermark_opacity,watermark_position")
        .neq("id", id)
        .limit(8);
      if (Array.isArray(content.genres) && content.genres.length) {
        relatedQuery = relatedQuery.overlaps("genres", content.genres);
      } else if (content.category_id) {
        relatedQuery = relatedQuery.eq("category_id", content.category_id);
      } else if (content.content_type_id) {
        relatedQuery = relatedQuery.eq("content_type_id", content.content_type_id);
      }
      const { data: related } = await relatedQuery;
      if (!live) return;
      setSimilar((related || []) as Content[]);
      setItem(content as Content);
      setTrailer(Boolean(content.trailer_url));
      setFav(Boolean(favorite));
      const ownRating = (ratings || []).find((row) => row.user_id === user.id);
      setScore(ownRating?.score || 0);
      if (ratings?.length) {
        setAverage((ratings.reduce((sum, row) => sum + row.score, 0) / ratings.length).toFixed(1));
      }
      setCategory(categoryRow?.name || "");
      setType(typeRow?.name || "");
      setLoading(false);
    })();
    return () => { live = false; };
  }, [id, client]);

  useEffect(() => {
    if (item && !fav && new URLSearchParams(window.location.search).get("watchlist") === "add") setScheduleOpen(true);
  }, [item, fav]);

  const toggleFavorite = useCallback(async () => {
    const currentUserId = userId.current;
    if (!currentUserId) return;
    if (fav) {
      setFav(false);
      const { error: deleteError } = await client.from("favorites").delete().eq("user_id", currentUserId).eq("content_id", id);
      if (deleteError) setFav(true);
      return;
    }
    setScheduleOpen(true);
  }, [client, fav, id]);

  const saveFavorite = useCallback(async (plannedAt: string | null) => {
    const currentUserId = userId.current;
    if (!currentUserId || savingFavorite) return;
    setSavingFavorite(true);
    const { error: insertError } = await client.from("favorites").insert({
      user_id: currentUserId,
      content_id: id,
      planned_watch_at: plannedAt,
    });
    setSavingFavorite(false);
    if (!insertError) {
      setFav(true);
      setScheduleOpen(false);
    } else {
      setError("Could not add this title to your watchlist. Please try again.");
    }
  }, [client, id, savingFavorite]);

  const saveScheduledFavorite = useCallback(() => {
    const today = new Date();
    const target = new Date(today);
    if (scheduleChoice === "tomorrow") target.setDate(target.getDate() + 1);
    if (scheduleChoice === "other") {
      if (!scheduleDate) return;
      const [year, month, day] = scheduleDate.split("-").map(Number);
      target.setFullYear(year, month - 1, day);
    }
    const [hours, minutes] = scheduleTime.split(":").map(Number);
    target.setHours(hours || 0, minutes || 0, 0, 0);
    void saveFavorite(target.toISOString());
  }, [scheduleChoice, scheduleDate, scheduleTime, saveFavorite]);

  const rate = useCallback(async (nextScore: number) => {
    const currentUserId = userId.current;
    if (!currentUserId) return;
    const previous = score;
    setScore(nextScore);
    const { error: ratingError } = await client.from("ratings").upsert(
      { user_id: currentUserId, content_id: id, score: nextScore },
      { onConflict: "content_id,user_id" },
    );
    if (ratingError) { setScore(previous); return; }
    const { data } = await client.from("ratings").select("score").eq("content_id", id);
    if (data?.length) setAverage((data.reduce((sum, row) => sum + row.score, 0) / data.length).toFixed(1));
  }, [client, id, score]);

  const saveProgress = useCallback(async (event: React.SyntheticEvent<HTMLVideoElement>, force = false) => {
    const video = event.currentTarget;
    const currentUserId = userId.current;
    const now = Date.now();
    // Persist at most once every 15 seconds, plus pause/end checkpoints.
    if (!currentUserId || trailer || video.duration <= 0 || progressSaving.current) return;
    if (!force && now - lastProgressSave.current < 15000) return;
    progressSaving.current = true;
    const { error: saveError } = await client.from("view_history").upsert({
      user_id: currentUserId,
      content_id: id,
      progress_seconds: Math.floor(video.currentTime),
      duration_seconds: Math.floor(video.duration),
      updated_at: new Date().toISOString(),
    }, { onConflict: "user_id,content_id" });
    if (!saveError) lastProgressSave.current = Date.now();
    progressSaving.current = false;
  }, [client, id, trailer]);

  const clearCompletedProgress = useCallback(async () => {
    const currentUserId = userId.current;
    if (!currentUserId) return;
    await client.from("view_history").delete().eq("user_id", currentUserId).eq("content_id", id);
    lastProgressSave.current = 0;
  }, [client, id]);

  if (loading) return <main className="min-h-screen bg-[#090a0e] p-10 text-white"><SiteHeader />Loading title…</main>;
  if (!item) return <main className="min-h-screen bg-[#090a0e] p-10 text-white"><p>{error || "Title not found."}</p><Link href="/browse">Back to browse</Link></main>;

  const source = trailer ? item.trailer_url : item.video_url;
  return (
    <main className="min-h-screen bg-[#090a0e] px-5 py-8 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <Link href="/browse" className="text-sm text-white/50">← Browse</Link>
          <Link href="/favorites" className="text-sm text-white/50">My watchlist</Link>
        </div>
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#12141b]">
          <div className="relative aspect-video bg-black">
            {source ? (
              <video key={source} src={source} poster={item.poster_url || undefined} controls autoPlay={trailer} muted={trailer} playsInline controlsList="nodownload noremoteplayback" disablePictureInPicture onContextMenu={(event) => event.preventDefault()} className="h-full w-full"
                onTimeUpdate={(event) => void saveProgress(event)}
                onPause={(event) => { if (!trailer) void saveProgress(event, true); }}
                onEnded={() => { if (trailer) setTrailer(false); else void clearCompletedProgress(); }} />
            ) : item.embed_url ? (
              <iframe src={item.embed_url} title={item.title} allowFullScreen className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/45">Video is not available yet.</div>
            )}
            {(source || item.embed_url) && <span className="pointer-events-none absolute right-4 top-4 z-10 rounded-md border border-white/20 bg-black/55 px-3 py-1.5 text-[10px] font-black tracking-[.18em] text-white/85 shadow-lg backdrop-blur-sm">STREAM UG</span>}
            {trailer && item.trailer_url && <button type="button" onClick={() => setTrailer(false)} className="absolute left-4 top-4 z-20 rounded-full border border-white/25 bg-black/70 px-4 py-2.5 text-xs font-bold text-white shadow-lg backdrop-blur transition hover:bg-black/90">Skip trailer</button>}
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ef6875]">{type} {category && "· " + category}</p>
                <h1 className="mt-3 text-3xl font-black sm:text-5xl">{item.title}</h1>
                <p className="mt-3 text-sm text-white/45">{[item.release_year, item.duration_minutes ? item.duration_minutes + " min" : null, item.language, item.age_rating].filter(Boolean).join(" · ")}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[.03] px-3 py-2.5">
                  <span className="mr-1 text-xs font-semibold text-white/55">Rate</span>
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button key={value} onClick={() => void rate(value)} aria-label={"Rate " + value + " stars"}
                      aria-pressed={score === value} className={"text-xl " + (value <= score ? "text-amber-400" : "text-white/25")}>★</button>
                  ))}
                </div>
                <button onClick={() => void toggleFavorite()} aria-pressed={fav} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold">{fav ? "★ In watchlist · Remove" : "＋ Add to watchlist"}</button>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {item.trailer_url && !trailer && <button onClick={() => setTrailer(true)} className="rounded-lg bg-white/10 px-4 py-2 text-sm">Watch trailer again</button>}
              <span className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60">Average rating: {average}/5</span>
            </div>
            <p className="mt-6 max-w-3xl leading-7 text-white/65">{item.description}</p>
            <div className="mt-6 grid gap-2 text-sm text-white/50 sm:grid-cols-2">
              {item.director && <p>Director: {item.director}</p>}
              {item.cast?.length && <p>Cast: {item.cast.join(", ")}</p>}
              {item.genres?.length && <p>Genres: {item.genres.join(", ")}</p>}
            </div>
          </div>
        </div>
        {similar.length > 0 && (
          <section className="mt-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ef6875]">MORE TO EXPLORE</p>
                <h2 className="mt-2 text-2xl font-black sm:text-3xl">Similar Movies</h2>
                <p className="mt-1 text-sm text-white/45">More titles related to {item.title}</p>
              </div>
              <Link href="/browse" className="text-sm font-semibold text-white/55 hover:text-white">Browse all →</Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {similar.map((movie) => (
                <Link key={movie.id} href={"/content/" + movie.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#12141b] transition hover:-translate-y-1 hover:border-white/25">
                  <div className="aspect-[2/3] overflow-hidden bg-white/5">
                    {movie.poster_url ? (
                      <img src={movie.poster_url} alt={movie.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center p-4 text-center text-sm font-bold text-white/35">{movie.title}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-2 font-bold text-white">{movie.title}</h3>
                    <p className="mt-1 text-xs text-white/45">{[movie.release_year, movie.duration_minutes ? movie.duration_minutes + " min" : null].filter(Boolean).join(" · ") || "Movie"}</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
      {scheduleOpen && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="watchlist-schedule-title">
        <div className="w-full max-w-md rounded-2xl border border-white/15 bg-[#151821] p-6 shadow-2xl">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ff8791]">MY WATCHLIST</p>
          <h2 id="watchlist-schedule-title" className="mt-2 text-2xl font-black">When would you like to watch?</h2>
          <p className="mt-2 text-sm text-white/55">Choose a reminder time, or skip this step and save the title now.</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {(["today", "tomorrow", "other"] as const).map((choice) => <button key={choice} type="button" onClick={() => setScheduleChoice(choice)} className={"rounded-xl border px-3 py-3 text-sm font-semibold capitalize " + (scheduleChoice === choice ? "border-[#f04455] bg-[#f04455]/15 text-white" : "border-white/15 text-white/65")}>{choice === "other" ? "Another day" : choice}</button>)}
          </div>
          {scheduleChoice === "other" && <label className="mt-4 block text-xs font-semibold text-white/65">Choose a date<input type="date" min={new Date().toLocaleDateString("en-CA")} value={scheduleDate} onChange={(event) => setScheduleDate(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm text-white [color-scheme:dark]"/></label>}
          <label className="mt-4 block text-xs font-semibold text-white/65">Choose a time<input type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} className="mt-2 w-full rounded-xl border border-white/15 bg-black/30 px-3 py-3 text-sm text-white [color-scheme:dark]"/></label>
          <div className="mt-6 flex flex-col gap-2 sm:flex-row">
            <button type="button" disabled={savingFavorite} onClick={() => void saveFavorite(null)} className="flex-1 rounded-xl border border-white/15 px-4 py-3 text-sm font-semibold text-white/75 disabled:opacity-50">Skip and save now</button>
            <button type="button" disabled={savingFavorite || (scheduleChoice === "other" && !scheduleDate)} onClick={saveScheduledFavorite} className="flex-1 rounded-xl bg-[#e73545] px-4 py-3 text-sm font-bold text-white disabled:opacity-50">{savingFavorite ? "Saving…" : "Save watch time"}</button>
          </div>
          <button type="button" onClick={() => setScheduleOpen(false)} className="mt-4 w-full text-xs text-white/40 hover:text-white">Cancel</button>
        </div>
      </div>}
    </main>
  );
}
