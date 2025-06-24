import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";

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
        {children}
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
      </body>
    </html>
  );
}
