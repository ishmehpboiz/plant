import type { Metadata } from "next";
import { DM_Sans, Fraunces } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["SOFT", "WONK", "opsz"],
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant — Smart Watering",
  description:
    "Simulated irrigation for Kanyakumari garden plants, driven by local weather and FAO-56 crop coefficients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${fraunces.variable} ${dmSans.variable} h-full`}>
      <body className="min-h-full antialiased">
        <div className="shell">
          <header className="site-header">
            <Link href="/" className="brand">
              <span>Kanyakumari · water balance</span>
              Plant
            </Link>
            <Link href="/plants/new" className="nav-link">
              Add plant
            </Link>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
