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

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
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
