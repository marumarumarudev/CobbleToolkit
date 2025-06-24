import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cobblemon Spawn Pool Scanner",
  description:
    "Analyze the spawn data inside Cobblemon (.zip & .jar) to view Pokémon rarities, biomes, structures, and more. This tool runs 100% client-side — your files are never uploaded anywhere.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1a1a] text-white`}
      >
        {/* Navbar */}
        <nav className="sticky top-0 z-50 bg-[#121212] border-b border-[#333] px-4 py-4 shadow-md">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <Link
              href="/"
              className="font-mono text-lg font-semibold hover:text-yellow-400"
            >
              Cobblemon Toolkit
            </Link>
            <div className="flex space-x-6 text-sm font-mono">
              <Link href="/spawn-scanner" className="hover:text-yellow-400">
                Spawn Scanner
              </Link>
              <Link href="/species-scanner" className="hover:text-yellow-400">
                Species Scanner
              </Link>
            </div>
          </div>
        </nav>

        {children}

        {/* Toaster notifications */}
        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#1e1e1e",
              color: "#ffcb05",
              border: "2px solid #3b4cca",
              fontFamily: "monospace",
            },
            iconTheme: {
              primary: "#ffcb05",
              secondary: "#3b4cca",
            },
          }}
        />

        {/* Decorative Images */}
        <Image
          src="/gravoyle.png"
          alt="soyle pointing"
          width={128}
          height={128}
          className="fixed bottom-4 right-4 w-32 pointer-events-none select-none opacity-30 z-50"
        />

        <Image
          src="/celebi.png"
          alt="soyebi pointing"
          width={128}
          height={128}
          className="fixed bottom-4 left-4 w-32 pointer-events-none select-none opacity-30 z-50"
        />
      </body>
    </html>
  );
}
