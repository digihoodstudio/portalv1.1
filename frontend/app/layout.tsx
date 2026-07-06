import React from "react";
import "../styles/globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import AuthProvider from "@/components/AuthProvider";
import ThemeProvider from "@/components/ThemeProvider";
import FloatingAssistant from "@/components/FloatingAssistant";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Portal | Digihood Studio",
  description:
    "Enterprise AI automation for appointments, missed calls, and lead reactivation.",
  icons: [{ rel: "icon", url: "/digilogo.png", type: "image/png" }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable}`}
    >
      <body
        className="bg-background text-foreground antialiased font-sans"
        suppressHydrationWarning
      >
        <ThemeProvider>
          <AuthProvider>
            <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
              <Navbar />
              {children}
              <FloatingAssistant />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
