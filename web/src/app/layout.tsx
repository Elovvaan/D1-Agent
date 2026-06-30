import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { brandConfig, getAppBaseUrl, getMarketingBaseUrl } from "@/lib/domain-config";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"]
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  metadataBase: new URL(getAppBaseUrl()),
  title: {
    default: brandConfig.primaryBrand,
    template: `%s | ${brandConfig.primaryBrand}`
  },
  description: `${brandConfig.primaryBrand} is the athlete platform powered by ${brandConfig.agentProductName}.`,
  openGraph: {
    title: brandConfig.primaryBrand,
    description: `${brandConfig.primaryBrand} is the athlete platform powered by ${brandConfig.agentProductName}.`,
    siteName: brandConfig.primaryBrand,
    url: getMarketingBaseUrl(),
    images: ["/brand/MYD1 Cover photo.png"],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: brandConfig.primaryBrand,
    description: `${brandConfig.primaryBrand} is the athlete platform powered by ${brandConfig.agentProductName}.`,
    images: ["/brand/MYD1 Cover photo.png"]
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
