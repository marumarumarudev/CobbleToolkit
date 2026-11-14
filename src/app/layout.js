import "./globals.css";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientNav from "@/components/layout/ClientNav";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";

import { SharedFilesProvider } from "@/contexts/SharedFilesContext";

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
    "Explore Cobblemon datapacks in your browser. Your packs stay local. Species lookups, images, video, and comments use external services.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="restore-page-theme" strategy="beforeInteractive">
          {`try { const theme = localStorage.getItem("cobbletoolkit-theme"); if (["retro", "pokedex", "rotom", "dark", "light"].includes(theme)) document.documentElement.dataset.theme = theme; } catch {}`}
        </Script>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-base text-text-primary`}
      >
        <SharedFilesProvider>

          <div className="flex min-h-screen flex-col">
            <a href="#main-content" className="skip-link">Skip to content</a>
            <ClientNav />
            <main id="main-content" tabIndex={-1} className="mx-auto w-full min-w-0 max-w-[100rem] flex-1 px-4 py-6 sm:px-6 sm:py-8 xl:px-8">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </SharedFilesProvider>

        <Toaster
          position="top-right"
          containerStyle={{ zIndex: 55, top: 64 }}
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "var(--color-bg-surface)",
              color: "var(--color-text-primary)",
              border: "1px solid var(--color-border)",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "13px",
            },
            iconTheme: {
              primary: "#a8e6b0",
              secondary: "#192b29",
            },
          }}
        />
      </body>
    </html>
  );
}
