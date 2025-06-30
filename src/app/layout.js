import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Image from "next/image";
import ClientNav from "@/components/ClientNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CobbleToolkit",
  description:
    "A collection of browser-based tools for analyzing and understanding Cobblemon datapacks.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1a1a] text-white`}
      >
        {/* Navbar */}
        <ClientNav />

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
