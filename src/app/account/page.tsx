"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import SiteHeader from "@/src/components/site-header";

export default function Account() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [client] = useState(() => createClient());
  const userId = useRef<string | null>(null);

  useEffect(() => {
    let live = true;
    void (async () => {
      const { data: { session } } = await client.auth.getSession();
      if (!session) { window.location.replace("/login"); return; }
      userId.current = session.user.id;
      if (!live) return;
      setEmail(session.user.email || "");
      const { data } = await client.from("profiles").select("name").eq("id", session.user.id).maybeSingle();
      if (live) setName(data?.name || "");
    })();
    return () => { live = false; };
  }, [client]);

  async function saveName(event: React.FormEvent) {
    event.preventDefault();
    if (!userId.current) return;
    setBusy(true);
    const { error } = await client.from("profiles").update({ name: name.trim() }).eq("id", userId.current);
    setBusy(false);
    setMessage(error?.message || "Username updated.");
  }

  async function savePassword(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) { setMessage("Passwords do not match."); return; }
    if (password.length < 6) { setMessage("Use at least 6 characters."); return; }
    setBusy(true);
    const { error } = await client.auth.updateUser({ password });
    setBusy(false);
    if (!error) { setPassword(""); setConfirm(""); }
    setMessage(error?.message || "Password changed.");
  }

  async function logout() {
    await client.auth.signOut();
    window.location.assign("/");
  }

  async function deleteAccount() {
    if (!window.confirm("Permanently delete your STREAM UG profile? This cannot be undone.")) return;
    if (!userId.current) return;
    setBusy(true);
    const { error } = await client.from("profiles").delete().eq("id", userId.current);
    if (error) { setBusy(false); setMessage(error.message); return; }
    await client.auth.signOut();
    window.location.assign("/");
  }

  return (
    <main className="min-h-screen bg-[#090a0e] px-5 py-10 text-white">
      <SiteHeader />
      <div className="mx-auto max-w-2xl">
        <Link href="/browse" className="text-sm text-white/45">← Browse</Link>
        <h1 className="mt-8 text-3xl font-black">Account settings</h1>
        <p className="mt-2 text-sm text-white/45">{email}</p>
        <form onSubmit={saveName} className="mt-7 space-y-4 rounded-2xl border border-white/10 bg-[#14161d] p-6">
          <h2 className="text-lg font-bold">Change username</h2>
          <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full rounded-lg bg-black/30 p-3 text-sm" />
          <button disabled={busy} className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-black">Save username</button>
        </form>
        <form onSubmit={savePassword} className="mt-4 space-y-4 rounded-2xl border border-white/10 bg-[#14161d] p-6">
          <h2 className="text-lg font-bold">Change password</h2>
          <input required type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" className="w-full rounded-lg bg-black/30 p-3 text-sm" />
          <input required type="password" value={confirm} onChange={(event) => setConfirm(event.target.value)} placeholder="Confirm new password" className="w-full rounded-lg bg-black/30 p-3 text-sm" />
          <button disabled={busy} className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-black">Update password</button>
        </form>
        {message && <p className="mt-4 text-sm text-white/60" role="status">{message}</p>}
        <div id="delete-account" className="mt-6 flex flex-wrap gap-3">
          <button onClick={logout} className="rounded-lg border border-white/15 px-4 py-3 text-sm">Log out</button>
          <button disabled={busy} onClick={() => void deleteAccount()} className="rounded-lg border border-red-400/30 px-4 py-3 text-sm text-red-300">Delete my account</button>
        </div>
        <p className="mt-3 text-xs text-white/30">Deleting removes your STREAM UG profile and signs you out. Authentication cleanup may require administrator support.</p>
      </div>
    </main>
  );
}
