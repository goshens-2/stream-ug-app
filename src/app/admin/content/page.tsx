"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ContentRow = {
  id: string;
  title: string;
  release_year: number | null;
  created_at: string;
  category_id: string | null;
  poster_url: string | null;
};
type Category = { id: string; name: string };
type SortMode = "newest" | "oldest" | "category" | "title";

export default function ContentLibrary() {
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sort, setSort] = useState<SortMode>("newest");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { window.location.replace("/login"); return; }

    const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).maybeSingle();
    if (!profile?.is_admin) { window.location.replace("/browse"); return; }

    const [{ data: categoryRows, error: categoryError }, firstPage] = await Promise.all([
      supabase.from("categories").select("id,name").order("name"),
      supabase.from("content").select("id,title,release_year,created_at,category_id,poster_url").order("created_at", { ascending: false }).range(0, 499),
    ]);

    if (categoryError) setError(categoryError.message);
    setCategories((categoryRows || []) as Category[]);
    if (firstPage.error) {
      setError(firstPage.error.message);
      setRows([]);
      setLoading(false);
      return;
    }

    const allRows = [...((firstPage.data || []) as ContentRow[])];
    let offset = 500;
    while ((firstPage.data || []).length === 500 && allRows.length >= offset) {
      const { data, error: pageError } = await supabase
        .from("content")
        .select("id,title,release_year,created_at,category_id,poster_url")
        .order("created_at", { ascending: false })
        .range(offset, offset + 499);
      if (pageError) { setError(pageError.message); break; }
      const page = (data || []) as ContentRow[];
      allRows.push(...page);
      if (page.length < 500) break;
      offset += 500;
    }
    setRows(allRows);
    setLoading(false);
  }

  useEffect(() => { void load(); }, []);

  const categoryNames = useMemo(
    () => new Map(categories.map((category) => [category.id, category.name])),
    [categories],
  );

  const filteredRows = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    const result = rows.filter((row) => {
      const matchesSearch = !term || row.title.toLocaleLowerCase().includes(term);
      const matchesCategory = categoryFilter === "all" || row.category_id === categoryFilter;
      return matchesSearch && matchesCategory;
    });
    return result.sort((a, b) => {
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "category") {
        const compare = (categoryNames.get(a.category_id || "") || "Uncategorised").localeCompare(categoryNames.get(b.category_id || "") || "Uncategorised");
        return compare || a.title.localeCompare(b.title);
      }
      if (sort === "title") return a.title.localeCompare(b.title);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [rows, search, categoryFilter, sort, categoryNames]);

  async function remove(id: string) {
    if (!window.confirm("Permanently delete this title?")) return;
    const { error: deleteError } = await createClient().from("content").delete().eq("id", id);
    if (deleteError) setError(deleteError.message);
    else await load();
  }

  const controlClass = "w-full rounded-xl border border-white/10 bg-[#0c0e13] px-4 py-3 text-sm text-white outline-none transition focus:border-[#e73545]";

  return (
    <main className="min-h-screen bg-[#0a0b0f] px-5 py-8 text-white sm:py-10">
      <div className="mx-auto max-w-6xl">
        <Link href="/admin" className="text-sm text-white/45 transition hover:text-white">← Admin dashboard</Link>
        <div className="mt-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-bold tracking-[.22em] text-[#f16b78]">CONTENT MANAGEMENT</p>
            <h1 className="mt-2 text-3xl font-black sm:text-4xl">Library</h1>
            <p className="mt-2 text-sm text-white/45">Browse all your uploaded content.</p>
          </div>
          <Link href="/admin/content/new" className="rounded-xl bg-[#e73545] px-5 py-3 text-sm font-bold transition hover:bg-[#f04454]">＋ Post a movie</Link>
        </div>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-300">{error}</p>}

        <section className="mt-7 rounded-2xl border border-white/10 bg-[#12141b] p-4 sm:p-5">
          <label className="block">
            <span className="mb-2 block text-xs font-semibold text-white/55">Search library</span>
            <input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by movie or title name…" className={controlClass} />
          </label>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">Filter by category</span>
              <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)} className={controlClass}>
                <option value="all">All categories</option>
                {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
              </select>
            </label>
            <label>
              <span className="mb-2 block text-xs font-semibold text-white/55">Sort library</span>
              <select value={sort} onChange={(event) => setSort(event.target.value as SortMode)} className={controlClass}>
                <option value="newest">Recently uploaded</option>
                <option value="oldest">Oldest uploads</option>
                <option value="category">Category (A–Z)</option>
                <option value="title">Title (A–Z)</option>
              </select>
            </label>
          </div>
        </section>

        <div className="mt-6 flex items-center justify-between gap-3">
          <h2 className="text-lg font-bold">All uploaded content</h2>
          <span className="text-xs tabular-nums text-white/40">{loading ? "Loading…" : filteredRows.length + " of " + rows.length + " titles"}</span>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-[#12141b]">
          {loading ? <p className="p-6 text-sm text-white/45">Loading your full library…</p> :
            filteredRows.length === 0 ? <p className="p-6 text-sm text-white/45">{rows.length === 0 ? "No titles have been uploaded yet." : "No titles match your search or selected filters."}</p> :
            filteredRows.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center gap-3 border-b border-white/10 px-4 py-4 last:border-0 sm:px-5">
                {item.poster_url ? <img src={item.poster_url} alt="" className="h-16 w-11 rounded-lg bg-black/30 object-cover" /> :
                  <div className="flex h-16 w-11 items-center justify-center rounded-lg bg-white/5 text-[10px] font-bold text-white/25">UG</div>}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-white/40">{categoryNames.get(item.category_id || "") || "Uncategorised"} · {item.release_year || "Year not set"}</p>
                  <p className="mt-1 text-[11px] text-white/30">Uploaded {new Date(item.created_at).toLocaleString()}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={"/admin/content/" + item.id} className="rounded-lg border border-white/15 px-3 py-2 text-xs transition hover:bg-white/5">Edit</Link>
                  <button onClick={() => void remove(item.id)} className="rounded-lg border border-red-400/30 px-3 py-2 text-xs text-red-300 transition hover:bg-red-400/10">Delete</button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </main>
  );
}
