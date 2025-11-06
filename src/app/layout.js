import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientNav from "@/components/ClientNav";
import GlobalErrorFilters from "@/components/GlobalErrorFilters";

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
    "A collection of browser-based tools for analyzing and understanding Cobblemon datapacks",
  icons: {
    icon: "/teto.jpg",
    shortcut: "/teto.jpg",
    apple: "/teto.jpg",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/teto.jpg" />
        <link rel="shortcut icon" href="/teto.jpg" />
        <link rel="apple-touch-icon" href="/teto.jpg" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#1a1a1a] text-white`}
      >
        <GlobalErrorFilters />
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
      </body>
    </html>
  );
}
