import type { Metadata } from "next";
import { Instrument_Serif, Syne } from "next/font/google";
import { DashboardShell } from "@/components/dashboard-shell";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
  weight: ["400", "600", "700"],
});

const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument",
});

export const metadata: Metadata = {
  title: "PMO Portfolio Intelligence",
  description: "Portfolio governance dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${syne.variable} ${instrument.variable} font-sans antialiased`}>
        <DashboardShell>{children}</DashboardShell>
      </body>
    </html>
  );
}
