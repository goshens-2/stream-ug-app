import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "STREAM UG — Movies, series & more", description: "Discover movies, series and entertainment on STREAM UG." };
export default function RootLayout({children}:{children:React.ReactNode}) { return <html lang="en"><body>{children}</body></html>; }
