"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/browse", label: "Home" },
  { href: "/trailers", label: "Trailers" },
  { href: "/watch-with-me", label: "Watch With Me" },
  { href: "/favorites", label: "Watchlist" },
  { href: "/history", label: "Continue watching" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const active = (href: string) => pathname === href || (href === "/browse" && pathname === "/");
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#08090c]/95 shadow-[0_8px_35px_rgba(0,0,0,.28)] backdrop-blur-2xl">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
        <Link href="/browse" className="shrink-0 text-lg font-black tracking-[.18em] text-white sm:text-xl">
          STREAM<span className="text-[#f04455]"> UG</span>
        </Link>
        <nav aria-label="Main navigation" className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 text-sm font-semibold lg:flex">
          {links.map((link) => <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={"whitespace-nowrap transition hover:text-white " + (active(link.href) ? "text-white" : "text-white/65")}>{link.label}</Link>)}
        </nav>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link href="/browse#library-results" aria-label="Search movies" title="Search movies" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.045] text-white/80 transition hover:border-[#f04455]/60 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="10.8" cy="10.8" r="6.8"/><path d="m16 16 4.2 4.2"/></svg>
          </Link>
          <Link href="/notifications" aria-label="Notifications" title="Notifications" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.045] text-white/80 transition hover:border-[#f04455]/60 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></svg>
          </Link>
          <Link href="/account" aria-label="Account" title="Account" className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/[.045] text-white/80 transition hover:border-[#f04455]/60 hover:text-white">
            <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/></svg>
          </Link>
        </div>
      </div>
      <nav aria-label="Mobile navigation" className="mx-auto flex max-w-7xl items-center justify-center gap-5 overflow-x-auto px-4 pb-3 text-xs font-semibold lg:hidden">
        {links.map((link) => <Link key={link.href} href={link.href} aria-current={active(link.href) ? "page" : undefined} className={"whitespace-nowrap transition " + (active(link.href) ? "text-white" : "text-white/55")}>{link.label}</Link>)}
      </nav>
    </header>
  );
}
