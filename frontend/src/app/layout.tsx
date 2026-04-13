import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MediCare Hub - Your Health, Our Priority",
  description:
    "Connect with top doctors, book appointments, and manage your health records securely. Experience the future of telemedicine with MediCare Hub.",
  keywords: [
    "healthcare",
    "medical",
    "telehealth",
    "doctor",
    "consultation",
    "appointment",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body
        className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}
      >
        <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/40 via-background to-background"></div>
        <Navbar />
        {children}
        <Footer />
      </body>
    </html>
  );
}
