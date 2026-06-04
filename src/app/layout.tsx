import type { Metadata } from "next";
import { Sintony, Caveat } from "next/font/google";
import "./globals.css";

const sintony = Sintony({
  variable: "--font-sintony",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FocusFlow - Master Your Time",
  description: "A free, simple tool to log your work and build habits.",
};

import InteractiveParticles from "@/components/interactive-particles";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${sintony.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#FAF6E3] text-slate-800 selection:bg-[#7B52AB]/20 selection:text-[#3E2361] relative">
        <InteractiveParticles />
        {/* Persistent background glows wrapped to prevent overflow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#EADBF7]/40 blur-[120px]" />
          <div className="absolute bottom-[-10%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#FAF6E3]/40 blur-[120px]" />
        </div>

        {/* Root content wrapper */}
        <div className="relative z-10 flex-1 flex flex-col min-h-screen">
          {children}
        </div>
      </body>
    </html>
  );
}
