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
  const [showRequest, setShowRequest] = useState(false);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [poster, setPoster] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");

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

  async function submitRequest(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setRequestMessage("");
    const { data: { user } } = await client.auth.getUser();
    if (!user) { window.location.replace("/login"); return; }
    let posterUrl: string | null = null;
    if (poster) {
      const ext = poster.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = user.id + "/" + crypto.randomUUID() + "." + ext;
      const { error: uploadError } = await client.storage.from("movie-request-posters").upload(path, poster, { contentType: poster.type, upsert: false });
      if (uploadError) { setBusy(false); setRequestMessage("Poster upload failed: " + uploadError.message); return; }
      const { data } = client.storage.from("movie-request-posters").getPublicUrl(path);
      posterUrl = data.publicUrl;
    }
    const { error } = await client.from("movie_requests").insert({
      title: title.trim(), note: note.trim() || null, poster_url: posterUrl, requested_by: user.id
    });
    setBusy(false);
    if (error) { setRequestMessage("Request failed: " + error.message); return; }
    setTitle("");
    setNote("");
    setPoster(null);
    setRequestMessage("Your movie request has been submitted. Thank you!");
  }

  return (
    <main className="min-h-screen bg-[#090a0e] px-5 py-10 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-3xl">
        <Link href="/browse" className="text-sm text-white/45">← Browse</Link>
        <h1 className="mt-8 text-3xl font-black">Notifications</h1>
        <section className="mt-6 rounded-2xl border border-white/10 bg-[#14161d] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div><h2 className="text-lg font-bold">Have a movie in mind?</h2><p className="mt-1 text-sm text-white/45">Suggest a movie or series you would love to watch.</p></div>
            <button type="button" onClick={() => { setShowRequest(v => !v); setRequestMessage(""); }} className="rounded-xl bg-[#e73545] px-5 py-3 text-sm font-bold hover:bg-[#c92737]">
              {showRequest ? "Close form" : "＋ Request a movie"}
            </button>
          </div>
          {showRequest && (
            <form onSubmit={submitRequest} className="mt-5 space-y-4 border-t border-white/10 pt-5">
              <label className="block text-sm font-medium">Movie or series title
                <input required maxLength={160} value={title} onChange={e => setTitle(e.target.value)} placeholder="Enter the movie title" className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#e73545]" />
              </label>
              <label className="block text-sm font-medium">Description or details
                <textarea maxLength={2000} value={note} onChange={e => setNote(e.target.value)} rows={4} placeholder="Tell us the actors, release year, story, or any details that can help us identify it." className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 outline-none focus:border-[#e73545]" />
              </label>
              <label className="block text-sm font-medium">Movie poster (optional)
                <input type="file" accept="image/jpeg,image/png,image/webp" onChange={e => setPoster(e.target.files?.[0] || null)} className="mt-2 block w-full text-sm text-white/60 file:mr-4 file:rounded-lg file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white" />
                <span className="mt-1 block text-xs text-white/35">JPG, PNG or WebP · maximum 5 MB</span>
              </label>
              {poster && <p className="text-xs text-white/50">Selected: {poster.name}</p>}
              <button disabled={busy || !title.trim()} className="rounded-xl bg-[#e73545] px-5 py-3 text-sm font-bold disabled:opacity-50">{busy ? "Submitting…" : "Submit movie request"}</button>
              {requestMessage && <p role="status" className="text-sm text-white/70">{requestMessage}</p>}
            </form>
          )}
        </section>
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
