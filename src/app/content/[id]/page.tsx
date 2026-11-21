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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [fav, setFav] = useState(false);
  const [score, setScore] = useState(0);
  const [average, setAverage] = useState("—");
  const [trailer, setTrailer] = useState(false);
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");
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
      setItem(content as Content);
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

  const toggleFavorite = useCallback(async () => {
    const currentUserId = userId.current;
    if (!currentUserId) return;
    const previous = fav;
    setFav(!previous);
    const result = previous
      ? await client.from("favorites").delete().eq("user_id", currentUserId).eq("content_id", id)
      : await client.from("favorites").insert({ user_id: currentUserId, content_id: id });
    if (result.error) setFav(previous);
  }, [client, fav, id]);

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
    if (!currentUserId || video.duration <= 0 || progressSaving.current) return;
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
          <div className="aspect-video bg-black">
            {source ? (
              <video key={source} src={source} poster={item.poster_url || undefined} controls className="h-full w-full"
                onTimeUpdate={(event) => void saveProgress(event)}
                onPause={(event) => void saveProgress(event, true)}
                onEnded={(event) => void saveProgress(event, true)} />
            ) : item.embed_url ? (
              <iframe src={item.embed_url} title={item.title} allowFullScreen className="h-full w-full" />
            ) : (
              <div className="flex h-full items-center justify-center text-white/45">Video is not available yet.</div>
            )}
          </div>
          <div className="p-6 sm:p-9">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.2em] text-[#ef6875]">{type} {category && "· " + category}</p>
                <h1 className="mt-3 text-3xl font-black sm:text-5xl">{item.title}</h1>
                <p className="mt-3 text-sm text-white/45">{[item.release_year, item.duration_minutes ? item.duration_minutes + " min" : null, item.language, item.age_rating].filter(Boolean).join(" · ")}</p>
              </div>
              <button onClick={() => void toggleFavorite()} aria-pressed={fav} className="rounded-xl border border-white/15 px-4 py-3 text-sm font-bold">{fav ? "★ In watchlist" : "☆ Add to watchlist"}</button>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {item.trailer_url && <button onClick={() => setTrailer(!trailer)} className="rounded-lg bg-white/10 px-4 py-2 text-sm">{trailer ? "Watch full title" : "Watch trailer"}</button>}
              <span className="rounded-lg bg-white/5 px-4 py-2 text-sm text-white/60">Average rating: {average}/5</span>
            </div>
            <p className="mt-6 max-w-3xl leading-7 text-white/65">{item.description}</p>
            <div className="mt-6 grid gap-2 text-sm text-white/50 sm:grid-cols-2">
              {item.director && <p>Director: {item.director}</p>}
              {item.cast?.length && <p>Cast: {item.cast.join(", ")}</p>}
              {item.genres?.length && <p>Genres: {item.genres.join(", ")}</p>}
            </div>
            <div className="mt-8 border-t border-white/10 pt-6">
              <p className="mb-3 text-sm font-bold">Rate this title</p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} onClick={() => void rate(value)} aria-label={"Rate " + value + " stars"}
                    aria-pressed={score === value} className={"text-2xl " + (value <= score ? "text-amber-400" : "text-white/25")}>★</button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
