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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
