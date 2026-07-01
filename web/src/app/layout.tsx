import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { brandConfig, getMarketingBaseUrl } from "@/lib/domain-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

const siteUrl = getMarketingBaseUrl();
const shareTitle = "MyD1 | The Athlete Profile. The Public Sports Network.";
const shareDescription = "Verified athletic profiles, public sports search, film, recruiting workflows, and career tools powered by the D1 Agent.";
const shareImage = "/opengraph-image";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: shareTitle,
    template: `%s | ${brandConfig.primaryBrand}`
  },
  description: shareDescription,
  alternates: {
    canonical: siteUrl
  },
  openGraph: {
    title: shareTitle,
    description: shareDescription,
    siteName: brandConfig.primaryBrand,
    url: siteUrl,
    images: [
      {
        url: shareImage,
        width: 1200,
        height: 630,
        alt: "MyD1 athlete platform share preview"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: shareTitle,
    description: shareDescription,
    images: [shareImage]
  },
  icons: {
    icon: "/brand/MYD1 LOGO.png",
    apple: "/brand/MYD1 LOGO.png"
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
