import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  title: "CampusCurrents - Stay Informed, Stay Safe",
  description:
    "Real-time campus communication for San Sebastian College - Recoletos, Manila. Instant class suspension alerts, emergency notifications, and school updates delivered to your phone.",
  keywords: [
    "CampusCurrents",
    "SSC-R Manila",
    "campus alerts",
    "class suspension",
    "emergency notifications",
    "school app",
  ],
  openGraph: {
    title: "CampusCurrents - Stay Informed, Stay Safe",
    description:
      "Real-time campus communication for SSC-R Manila students.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <body className="bg-warm-100 text-text-dark antialiased">{children}</body>
    </html>
  );
}
