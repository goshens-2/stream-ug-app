"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SiteHeader from "@/src/components/site-header";
type Row = { id: string; title: string; poster_url: string | null; release_year: number | null; content_id: string; planned_watch_at: string | null };
export default function Favorites() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createClient();
    void (async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      const { data } = await client.from("favorites").select("content_id,planned_watch_at,content(id,title,poster_url,release_year)").eq("user_id", session.user.id).order("created_at", { ascending: false });
      setRows((data || []).map((entry: any) => ({ ...entry.content, content_id: entry.content_id, planned_watch_at: entry.planned_watch_at })).filter((entry: any) => entry.id));
      setLoading(false);
    })();
  }, []);
  async function remove(contentId: string) {
    const client = createClient();
    const { data: { session } } = await client.auth.getSession();
    if (!session) return;
    const previous = rows;
    setRows((current) => current.filter((row) => row.content_id !== contentId));
    const { error } = await client.from("favorites").delete().eq("user_id", session.user.id).eq("content_id", contentId);
    if (error) setRows(previous);
  }
  return <main className="min-h-screen bg-[#090a0e] px-5 py-10 text-white"><SiteHeader /><div className="mx-auto max-w-6xl"><Link href="/browse" className="text-sm text-white/45">← Browse</Link><h1 className="mt-8 text-3xl font-black">My watchlist</h1><p className="mt-2 text-sm text-white/45">Your saved titles, ready whenever you are.</p>
    {loading ? <p className="mt-8 text-white/40">Loading…</p> : rows.length === 0 ? <div className="mt-8 rounded-2xl border border-white/10 bg-[#14161d] p-8 text-center"><p className="font-bold">Your watchlist is empty.</p><p className="mt-2 text-sm text-white/45">Save titles as you browse and they will appear here.</p><Link href="/browse" className="mt-5 inline-flex rounded-full bg-[#e73545] px-5 py-3 text-sm font-bold">Explore movies</Link></div> :
    <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-5">{rows.map((row) => <article key={row.content_id} className="overflow-hidden rounded-xl border border-white/10 bg-[#14161d]"><Link href={"/content/" + row.id} className="block"><div className="aspect-[2/3] bg-white/5">{row.poster_url && <img src={row.poster_url} alt={row.title} loading="lazy" decoding="async" className="h-full w-full object-cover"/>}</div><div className="p-3"><p className="font-bold">{row.title}</p><p className="mt-1 text-xs text-white/40">{row.release_year || "STREAM UG"}</p>{row.planned_watch_at && <p className="mt-2 text-xs text-[#ff9ba4]">Planned: {new Date(row.planned_watch_at).toLocaleString()}</p>}</div></Link><div className="px-3 pb-3"><button type="button" onClick={() => void remove(row.content_id)} className="w-full rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-white/65 transition hover:border-red-400/50 hover:text-red-200">Remove from watchlist</button></div></article>)}</div>}</div></main>;
}
