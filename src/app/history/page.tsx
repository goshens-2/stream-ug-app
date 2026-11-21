"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SiteHeader from "@/src/components/site-header";
type Row = { id: string; progress_seconds: number; duration_seconds: number; updated_at: string; content: { id: string; title: string; poster_url: string | null } | null };
export default function History() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const client = createClient();
    void (async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      const { data } = await client.from("view_history").select("id,progress_seconds,duration_seconds,updated_at,content(id,title,poster_url)").eq("user_id", session.user.id).order("updated_at", { ascending: false });
      setRows(((data || []) as unknown as Row[]).filter((row) => row.content && row.duration_seconds > 0 && row.progress_seconds < row.duration_seconds * 0.95));
      setLoading(false);
    })();
  }, []);
  return <main className="min-h-screen bg-[#090a0e] px-5 py-10 text-white"><SiteHeader /><div className="mx-auto max-w-5xl"><Link href="/browse" className="text-sm text-white/45">← Browse</Link><h1 className="mt-8 text-3xl font-black">Continue watching</h1>{loading ? <p className="mt-8 text-white/40">Loading…</p> : rows.length === 0 ? <p className="mt-8 text-white/40">Movies and shows you start but do not finish will appear here.</p> : <div className="mt-7 space-y-3">{rows.map((row) => row.content && <Link key={row.id} href={"/content/" + row.content.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-[#14161d] p-3 transition hover:border-white/25"><div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-white/5">{row.content.poster_url && <img src={row.content.poster_url} alt="" loading="lazy" className="h-full w-full object-cover"/>}</div><div className="min-w-0 flex-1"><p className="font-bold">{row.content.title}</p><div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-[#e73545]" style={{ width: Math.min(100, row.progress_seconds / row.duration_seconds * 100) + "%" }}/></div><p className="mt-1 text-xs text-white/40">{Math.floor(row.progress_seconds / 60)} min watched</p></div><span className="text-sm text-white/50">Resume →</span></Link>)}</div>}</div></main>;
}
