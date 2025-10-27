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
  authors: [{ name: "Festus Idowu", url: "https://medisphere.up.railway.app" }],
  keywords: [
    "MediSphere",
    "Decentralized Healthcare",
    "Hedera",
    "Blockchain Health",
    "Health dApps",
    "Patient Data Security",
    "Africa Health Tech",
    "Web3 Healthcare",
    "Health Ecosystem",
    "Digital Health Records",
  ],
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
