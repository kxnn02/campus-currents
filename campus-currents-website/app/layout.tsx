import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://campuscurrents.app"),
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
    url: "https://campuscurrents.app",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusCurrents - Stay Informed, Stay Safe",
    description:
      "Real-time campus communication for SSC-R Manila students.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={geist.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "CampusCurrents",
              operatingSystem: "Android",
              applicationCategory: "EducationalApplication",
              description:
                "Real-time campus communication app for San Sebastian College - Recoletos, Manila. Instant class suspension alerts, emergency notifications, and school updates.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "PHP",
              },
            }),
          }}
        />
      </head>
      <body className="bg-warm-100 text-text-dark antialiased">{children}</body>
    </html>
  );
}
