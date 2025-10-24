import type React from "react";
import type { Metadata } from "next";
import { Fredoka } from "next/font/google";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
});

export const metadata: Metadata = {
  title: "MediSphere™ - The Decentralized Health Ecosystem on Hedera",
  description:
    "A trustless, borderless, patient-first healthcare grid for Africa. Built on Hedera blockchain technology.",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={fredoka.variable}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
