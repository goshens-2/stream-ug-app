import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim().replace(/\/$/, "") || "https://bwzbtwclfvdgezyqvswr.supabase.co";
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() || "sb_publishable_fb8HkxyfjD0HGwthYXxYNA_riP2qpp1";

  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const password = typeof body.password === "string" ? body.password : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    if (!email || !password || !name) {
      return NextResponse.json({ error: "Enter your name, email and password." }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Use at least 6 characters for your password." }, { status: 400 });
    }

    const upstream = await fetch(`${url}/auth/v1/signup`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, data: { name } }),
      cache: "no-store",
      signal: AbortSignal.timeout(15000),
    });
    const result = await upstream.json().catch(() => ({}));
    if (!upstream.ok) {
      return NextResponse.json({ error: result.msg || result.message || result.error_description || result.error || "We couldn't create your account. Please try again." }, { status: upstream.status });
    }
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("[STREAM UG auth] Supabase request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? (error as Error & { cause?: unknown }).cause : undefined,
    });
    const timedOut = error instanceof Error && (error.name === "TimeoutError" || error.name === "AbortError");
    return NextResponse.json(
      { error: timedOut ? "Account creation took too long. Please try again." : "STREAM UG couldn't reach its secure account service. Please try again in a moment." },
      { status: 502 },
    );
  }
}
