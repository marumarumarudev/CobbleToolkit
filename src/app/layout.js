import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import ClientNav from "@/components/layout/ClientNav";
import Footer from "@/components/layout/Footer";
import PageTransition from "@/components/layout/PageTransition";
import GlobalErrorFilters from "@/components/GlobalErrorFilters";
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
    "Browser-based tools for inspecting and understanding Cobblemon datapacks — nothing leaves your machine.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-bg-base text-text-primary`}
      >
        <SharedFilesProvider>
          <GlobalErrorFilters />
          <div className="flex min-h-screen flex-col">
            <ClientNav />
            <main className="max-w-6xl mx-auto w-full flex-1 px-4 py-6 sm:py-8">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
          </div>
        </SharedFilesProvider>

        <Toaster
          position="top-right"
          reverseOrder={false}
          toastOptions={{
            style: {
              background: "#15171c",
              color: "#f2f3f5",
              border: "1px solid #262a33",
              fontFamily: "var(--font-geist-mono)",
              fontSize: "13px",
            },
            iconTheme: {
              primary: "#e6b800",
              secondary: "#15171c",
            },
          }}
        />
      </body>
    </html>
  );
}
