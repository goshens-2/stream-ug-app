"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SiteHeader from "@/src/components/site-header";

type Row = { id: string; message: string; read: boolean; created_at: string; content_id: string | null };

export default function Notifications() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [client] = useState(() => createClient());

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      const { data } = await client.from("notifications").select("*")
        .eq("user_id", session.user.id).order("created_at", { ascending: false });
      if (!live) return;
      setRows((data || []) as Row[]);
      setLoading(false);
    })();
    return () => { live = false; };
  }, [client]);

  async function mark(id: string) {
    const previous = rows;
    setRows((current) => current.map((row) => row.id === id ? { ...row, read: true } : row));
    const { error } = await client.from("notifications").update({ read: true }).eq("id", id);
    if (error) setRows(previous);
  }

  return (
    <main className="min-h-screen bg-[#090a0e] px-5 py-10 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-3xl">
        <Link href="/browse" className="text-sm text-white/45">← Browse</Link>
        <h1 className="mt-8 text-3xl font-black">Notifications</h1>
        {loading ? <p className="mt-8 text-white/40">Loading…</p> : rows.length === 0 ? (
          <p className="mt-8 text-white/40">You're all caught up.</p>
        ) : (
          <div className="mt-7 space-y-2">
            {rows.map((row) => (
              <div key={row.id} className="flex items-start justify-between gap-3 rounded-xl border border-white/10 bg-[#14161d] p-4">
                <div>
                  <p className="text-sm">{row.message}</p>
                  <p className="mt-2 text-xs text-white/35">{new Date(row.created_at).toLocaleString()}</p>
                  {row.content_id && <Link href={"/content/" + row.content_id} className="mt-2 inline-block text-xs text-[#f16b78]">Watch title →</Link>}
                </div>
                {!row.read && <button onClick={() => void mark(row.id)} className="shrink-0 text-xs text-white/50">Mark read</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
