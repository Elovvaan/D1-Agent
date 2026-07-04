import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sports | MYD1",
  description: "Discover sports, competitions, teams, athlete profiles, and MYD1 event opportunities.",
  openGraph: {
    title: "Sports | MYD1",
    description: "Discover sports, competitions, teams, athlete profiles, and MYD1 event opportunities.",
    images: [{ url: "/api/og?theme=sports&title=MYD1%20SPORTS&subtitle=Sports,%20teams,%20events,%20profiles,%20and%20competition%20opportunities.", width: 1200, height: 630, alt: "MYD1 Sports social preview" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Sports | MYD1",
    description: "Discover sports, competitions, teams, athlete profiles, and MYD1 event opportunities.",
    images: ["/api/og?theme=sports&title=MYD1%20SPORTS&subtitle=Sports,%20teams,%20events,%20profiles,%20and%20competition%20opportunities."]
  }
};

export default function SportsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
