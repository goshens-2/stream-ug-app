"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import SiteHeader from "@/src/components/site-header";
import { createClient } from "@/lib/supabase/client";

type Title = {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  release_year: number | null;
};

export default function WatchWithMePage() {
  const [titles, setTitles] = useState<Title[]>([]);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const client = createClient();
    void (async () => {
      const { data: { user } } = await client.auth.getUser();
      if (!user) {
        window.location.replace("/login");
        return;
      }
      const { data, error } = await client
        .from("content")
        .select("id,title,description,poster_url,release_year")
        .order("created_at", { ascending: false })
        .limit(60);
      if (!error) setTitles((data || []) as Title[]);
      setLoading(false);
    })();
  }, []);

  async function invite(title: Title) {
    const url = window.location.origin + "/content/" + title.id;
    const message = "Watch " + title.title + " with me on STREAM UG: " + url;
    setSharing(title.id);
    setNotice("");
    try {
      if (navigator.share) {
        await navigator.share({ title: "Watch with me on STREAM UG", text: message, url });
        setNotice("Invite shared. Send it to your friends so they can join you.");
      } else {
        await navigator.clipboard.writeText(message);
        setNotice("Invite link copied. Share it with your friends.");
      }
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") {
        try {
          await navigator.clipboard.writeText(message);
          setNotice("Invite link copied. Share it with your friends.");
        } catch {
          setNotice("Could not share automatically. Open the title and copy its address to invite friends.");
        }
      }
    } finally {
      setSharing("");
    }
  }

  return (
    <main className="min-h-screen bg-[#090a0e] px-5 pb-16 text-white sm:px-8">
      <SiteHeader />
      <section className="mx-auto max-w-6xl pt-10 sm:pt-14">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_85%_15%,rgba(231,53,69,.28),transparent_42%),linear-gradient(120deg,#191b24,#101117_65%,#24151b)] p-7 sm:p-12">
          <p className="text-xs font-black tracking-[.28em] text-[#ff8791]">MAKE IT A MOVIE NIGHT</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black tracking-[-.04em] sm:text-6xl">Watch With Me</h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 sm:text-base">
            Good stories are better shared. Pick a movie or series, invite your people, and enjoy STREAM UG together.
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-xs font-bold text-white/75">
            <span className="rounded-full border border-white/15 bg-black/20 px-4 py-2">01 · Choose a title</span>
            <span className="rounded-full border border-white/15 bg-black/20 px-4 py-2">02 · Share an invite</span>
            <span className="rounded-full border border-white/15 bg-black/20 px-4 py-2">03 · Enjoy together</span>
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.2em] text-[#f16b78]">PICK YOUR FEATURE</p>
            <h2 className="mt-2 text-2xl font-black sm:text-3xl">What are we watching?</h2>
          </div>
          <Link href="/browse" className="text-sm font-semibold text-white/55 transition hover:text-white">Browse all titles →</Link>
        </div>

        {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-200">{notice}</p>}
        {loading ? (
          <p className="mt-8 text-sm text-white/45">Finding something good to watch…</p>
        ) : titles.length === 0 ? (
          <div className="mt-7 rounded-2xl border border-white/10 bg-[#14161d] p-8 text-center">
            <p className="font-bold">The watch party is waiting for its first title.</p>
            <p className="mt-2 text-sm text-white/45">There are no published titles to share yet.</p>
            <Link href="/browse" className="mt-5 inline-flex rounded-full bg-[#e73545] px-5 py-3 text-sm font-bold">Explore STREAM UG</Link>
          </div>
        ) : (
          <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {titles.map((title) => (
              <article key={title.id} className="overflow-hidden rounded-2xl border border-white/10 bg-[#14161d]">
                <Link href={"/content/" + title.id} className="group block">
                  <div className="aspect-[2/3] overflow-hidden bg-white/5">
                    {title.poster_url ? (
                      <img src={title.poster_url} alt={title.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-[radial-gradient(ellipse_at_top,rgba(231,53,69,.22),transparent_65%)] p-5 text-center text-lg font-black">{title.title}</div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="truncate text-sm font-bold">{title.title}</h3>
                    <p className="mt-1 text-xs text-white/40">{title.release_year || "STREAM UG"}</p>
                  </div>
                </Link>
                <div className="px-3 pb-3">
                  <button
                    type="button"
                    disabled={sharing === title.id}
                    onClick={() => void invite(title)}
                    className="w-full rounded-lg bg-[#e73545] px-3 py-2.5 text-xs font-bold transition hover:bg-[#f04454] disabled:opacity-60"
                  >
                    {sharing === title.id ? "Preparing invite…" : "↗ Invite to watch"}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
