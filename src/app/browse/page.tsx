"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Movie = {
  id: string;
  title: string;
  description: string | null;
  poster_url: string | null;
  release_year: number | null;
  duration_minutes: number | null;
  category_id: string | null;
  is_demo?: boolean;
};
type Category = { id: string; name: string; slug: string };

const demoCategories: Category[] = [
  { id: "demo-action", name: "Action (Sample)", slug: "demo-action" },
  { id: "demo-drama", name: "Drama (Sample)", slug: "demo-drama" },
  { id: "demo-comedy", name: "Comedy (Sample)", slug: "demo-comedy" },
  { id: "demo-animation", name: "Animation (Sample)", slug: "demo-animation" },
];

const demoMovies: Movie[] = [
  {
    id: "demo-movie-1",
    title: "The Last Mission",
    description: "A fearless team races against time to protect their city. Sample movie for dashboard testing.",
    poster_url: "https://picsum.photos/seed/stream-last-mission/480/720",
    release_year: 2025,
    duration_minutes: 116,
    category_id: "demo-action",
    is_demo: true,
  },
  {
    id: "demo-movie-2",
    title: "Kampala Dreams",
    description: "A young creative follows an unexpected opportunity through the streets of Kampala.",
    poster_url: "https://picsum.photos/seed/stream-kampala-dreams/480/720",
    release_year: 2024,
    duration_minutes: 104,
    category_id: "demo-drama",
    is_demo: true,
  },
  {
    id: "demo-movie-3",
    title: "Laugh Out Loud",
    description: "A lively comedy about friendship, family and one very chaotic weekend.",
    poster_url: "https://picsum.photos/seed/stream-laugh-out-loud/480/720",
    release_year: 2023,
    duration_minutes: 92,
    category_id: "demo-comedy",
    is_demo: true,
  },
  {
    id: "demo-movie-4",
    title: "Beyond the Horizon",
    description: "Two strangers discover that a fresh start can come from the most unexpected place.",
    poster_url: "https://picsum.photos/seed/stream-beyond-horizon/480/720",
    release_year: 2025,
    duration_minutes: 121,
    category_id: "demo-drama",
    is_demo: true,
  },
  {
    id: "demo-movie-5",
    title: "Jungle Quest",
    description: "An animated adventure filled with curious creatures and surprising discoveries.",
    poster_url: "https://picsum.photos/seed/stream-jungle-quest/480/720",
    release_year: 2024,
    duration_minutes: 88,
    category_id: "demo-animation",
    is_demo: true,
  },
  {
    id: "demo-movie-6",
    title: "Code Red",
    description: "A suspense-filled thriller where every decision changes the outcome.",
    poster_url: "https://picsum.photos/seed/stream-code-red/480/720",
    release_year: 2022,
    duration_minutes: 109,
    category_id: "demo-action",
    is_demo: true,
  },
];

export default function Browse() {
  const [items, setItems] = useState<Movie[]>([]);
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState("there");
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [loading, setLoading] = useState(true);
  const [unread, setUnread] = useState(0);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [categoriesOpenAt, setCategoriesOpenAt] = useState(0);

  useEffect(() => {
    const s = createClient();
    let live = true;
    void (async () => {
      const { data: { user } } = await s.auth.getUser();
      if (!user) {
        window.location.replace("/login");
        return;
      }
      const [{ data: p }, { data: c }, { data: k }, { count }] = await Promise.all([
        s.from("profiles").select("name,is_admin").eq("id", user.id).maybeSingle(),
        s.from("content").select("id,title,description,poster_url,release_year,duration_minutes,category_id").order("created_at", { ascending: false }),
        s.from("categories").select("id,name,slug").order("name"),
        s.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("read", false),
      ]);
      if (!live) return;
      if (p?.is_admin) {
        window.location.replace("/admin");
        return;
      }
      setName(p?.name || user.email?.split("@")[0] || "there");
      setItems((c || []) as Movie[]);
      setCats((k || []) as Category[]);
      setUnread(count || 0);
      setLoading(false);
    })();
    return () => { live = false; };
  }, []);

  const allCategories = useMemo(
    () => [...cats, ...demoCategories.filter((demo) => !cats.some((real) => real.name.toLowerCase() === demo.name.toLowerCase()))],
    [cats],
  );
  const visibleCategories = showAllCategories ? allCategories : allCategories.slice(0, 6);
  const allMovies = useMemo(() => [...items, ...demoMovies], [items]);
  const filtered = useMemo(
    () => allMovies.filter((x) =>
      (cat === "all" || x.category_id === cat) &&
      (x.title.toLowerCase().includes(q.toLowerCase()) || (x.description || "").toLowerCase().includes(q.toLowerCase()))
    ),
    [allMovies, cat, q],
  );

  useEffect(() => {
    if (!categoriesOpen) return;
    const closeWhenScrolledAway = () => {
      if (window.scrollY > categoriesOpenAt + 260) {
        setCategoriesOpen(false);
        setShowAllCategories(false);
      }
    };
    window.addEventListener("scroll", closeWhenScrolledAway, { passive: true });
    return () => window.removeEventListener("scroll", closeWhenScrolledAway);
  }, [categoriesOpen, categoriesOpenAt]);

  useEffect(() => {
    if (q.trim().length < 3) return;
    const timer = window.setTimeout(() => {
      void (async () => {
        const s = createClient();
        const { data: { user } } = await s.auth.getUser();
        // Only real database titles may be attached to search-log foreign keys.
        const match = items.find((x) => x.title.toLowerCase().includes(q.trim().toLowerCase()));
        await s.from("search_logs").insert({
          user_id: user?.id || null,
          query: q.trim(),
          matched_content_id: match?.id || null,
        });
      })();
    }, 650);
    return () => window.clearTimeout(timer);
  }, [q, items]);

  async function logout() {
    await createClient().auth.signOut();
    window.location.assign("/");
  }

  return (
    <main className="min-h-screen bg-[#08090c] text-white">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#08090c]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4">
          <Link href="/" className="text-lg font-black tracking-[.18em]">STREAM<span className="text-[#e73545]"> UG</span></Link>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search movies and series…" className="order-3 w-full rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm outline-none focus:border-[#e73545] sm:order-none sm:max-w-md" />
          <nav className="flex flex-wrap items-center gap-4 text-xs text-white/55">
            <Link href="/favorites">Watchlist</Link>
            <Link href="/history">Continue watching</Link>
            <Link href="/requests">Request a movie</Link>
            <Link href="/account">Account</Link>
            <Link href="/notifications">Alerts{unread > 0 && <span className="ml-1 text-[#f16b78]">({unread})</span>}</Link>
            <span className="hidden text-white/50 md:inline">Hi, {name}</span>
            <button onClick={logout} className="text-white/60 hover:text-white">Log out</button>
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-12">
        <div className="rounded-3xl border border-white/10 bg-[radial-gradient(ellipse_at_80%_0%,rgba(231,53,69,.22),transparent_45%),linear-gradient(120deg,#171922,#0e1016)] p-8 sm:p-12">
          <p className="text-xs font-bold tracking-[.25em] text-[#f16b78]">YOUR STREAM STARTS HERE</p>
          <h1 className="mt-4 max-w-2xl text-4xl font-black sm:text-6xl">Find something <span className="text-white/45">worth watching.</span></h1>
          <p className="mt-4 max-w-xl text-sm leading-7 text-white/50">Explore movies, series and entertainment in the STREAM UG library.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/history" className="rounded-full bg-white px-5 py-3 text-xs font-bold text-black">Continue watching</Link>
            <Link href="/requests" className="rounded-full border border-white/20 px-5 py-3 text-xs font-bold">Request a title</Link>
          </div>
        </div>

        <div className="mt-10 flex justify-center text-center">
          <button
            type="button"
            aria-expanded={categoriesOpen}
            aria-controls="browse-categories"
            onClick={() => {
              setCategoriesOpen((open) => {
                const next = !open;
                if (next) setCategoriesOpenAt(window.scrollY);
                else setShowAllCategories(false);
                return next;
              });
            }}
            className="group inline-flex items-center gap-3 rounded-full border border-white/15 bg-white px-6 py-3 text-xs font-extrabold uppercase tracking-[.16em] text-black transition hover:-translate-y-0.5 hover:bg-[#f16b78]"
          >
            Browse
            <span className={"text-base transition-transform duration-300 " + (categoriesOpen ? "rotate-180" : "")}>⌄</span>
          </button>
          {categoriesOpen && (
            <div id="browse-categories" className="mt-5 rounded-2xl border border-white/10 bg-white/[.035] p-4 sm:p-5">
              <div className="flex flex-wrap gap-3">
                {visibleCategories.map((x, index) => (
                  <button
                    key={x.id}
                    onClick={() => {
                      setCat(x.id);
                      setCategoriesOpen(false);
                      setShowAllCategories(false);
                    }}
                    style={{ animationDelay: `${index * 65}ms` }}
                    className={"category-chip-enter rounded-full px-5 py-3 text-xs font-semibold transition duration-200 hover:-translate-y-1 hover:border-white/40 " + (cat === x.id ? "bg-white text-black" : "border border-white/15 bg-white/5 text-white/75")}
                  >
                    {x.name}
                  </button>
                ))}
                {cat !== "all" && (
                  <button
                    onClick={() => { setCat("all"); setCategoriesOpen(false); setShowAllCategories(false); }}
                    className="rounded-full border border-white/15 px-5 py-3 text-xs font-semibold text-white/65 transition hover:bg-white/10"
                  >
                    All content
                  </button>
                )}
              </div>
              {allCategories.length > 6 && (
                <button
                  type="button"
                  onClick={() => setShowAllCategories((value) => !value)}
                  className="mt-5 text-xs font-bold text-[#f16b78] transition hover:text-white"
                >
                  {showAllCategories ? "See less ↑" : "See more ↓"}
                </button>
              )}
            </div>
          )}
        </div>
        <style jsx>{`
          @keyframes categoryChipEnter {
            from { opacity: 0; transform: translateY(14px) scale(.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .category-chip-enter {
            animation: categoryChipEnter .42s cubic-bezier(.2,.8,.2,1) both;
          }
        `}</style>

        <div className="mt-8 flex items-center justify-between">
          <h2 className="text-xl font-bold">Explore the library</h2>
          <span className="text-xs text-white/35">{filtered.length} titles</span>
        </div>
        <p className="mt-2 text-xs text-white/35">Sample titles are for testing only and are not saved to your account.</p>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {loading
            ? Array.from({ length: 10 }, (_, i) => <div key={i} className="aspect-[2/3] animate-pulse rounded-2xl bg-white/5" />)
            : filtered.map((x) => {
              const card = (
                <>
                  <div className="relative aspect-[2/3] overflow-hidden bg-[#1c2029]">
                    {x.poster_url
                      ? <img src={x.poster_url} alt={x.title} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      : <div className="flex h-full items-end bg-gradient-to-br from-slate-700 to-slate-950 p-4"><span className="text-lg font-black">{x.title}</span></div>}
                    {x.is_demo && <span className="absolute left-3 top-3 rounded-full bg-[#e73545] px-2.5 py-1 text-[10px] font-bold tracking-wide">DEMO</span>}
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-sm font-bold">{x.title}</h3>
                    <p className="mt-1 text-xs text-white/40">{x.release_year || "New"}{x.duration_minutes ? " · " + x.duration_minutes + " min" : ""}</p>
                    <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">{x.description}</p>
                    <p className="mt-3 text-xs font-bold text-[#f16b78]">{x.is_demo ? "Sample title · Preview only" : "View title →"}</p>
                  </div>
                </>
              );
              return x.is_demo
                ? <div key={x.id} className="group overflow-hidden rounded-2xl border border-dashed border-white/15 bg-[#111319]">{card}</div>
                : <Link key={x.id} href={"/content/" + x.id} className="group overflow-hidden rounded-2xl border border-white/10 bg-[#111319] transition hover:-translate-y-1 hover:border-white/25">{card}</Link>;
            })}
        </div>
        {!loading && filtered.length === 0 && <p className="py-20 text-center text-sm text-white/40">No titles found. Check back soon.</p>}
      </section>
    </main>
  );
}
