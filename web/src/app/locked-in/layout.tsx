import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Locked In | MYD1 Sports",
  description: "MYD1 Locked In competitions with team registration, custom colors, uniforms, brackets, highlights, and prize events.",
  openGraph: {
    title: "Locked In | MYD1 Sports",
    description: "Community competitions, team registration, custom colors, uniforms, brackets, highlights, and prize events.",
    images: [
      {
        url: "/api/og?theme=locked-in&title=LOCKED%20IN&subtitle=Community%20competitions,%20team%20registration,%20uniforms,%20brackets,%20and%20prize%20events.",
        width: 1200,
        height: 630,
        alt: "MYD1 Locked In social preview"
      }
    ],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Locked In | MYD1 Sports",
    description: "Community competitions, team registration, custom colors, uniforms, brackets, highlights, and prize events.",
    images: ["/api/og?theme=locked-in&title=LOCKED%20IN&subtitle=Community%20competitions,%20team%20registration,%20uniforms,%20brackets,%20and%20prize%20events."]
  }
};

export default function LockedInLayout({ children }: { children: React.ReactNode }) {
  return children;
}
