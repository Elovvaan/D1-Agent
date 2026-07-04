import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search | MYD1",
  description: "Search athletes, schools, sports, profiles, teams, and MYD1 public sports data.",
  openGraph: {
    title: "Search | MYD1",
    description: "Search athletes, schools, sports, profiles, teams, and MYD1 public sports data.",
    images: [{ url: "/api/og?theme=search&title=MYD1%20SEARCH&subtitle=Find%20athletes,%20schools,%20teams,%20sports,%20profiles,%20and%20events.", width: 1200, height: 630, alt: "MYD1 Search social preview" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Search | MYD1",
    description: "Search athletes, schools, sports, profiles, teams, and MYD1 public sports data.",
    images: ["/api/og?theme=search&title=MYD1%20SEARCH&subtitle=Find%20athletes,%20schools,%20teams,%20sports,%20profiles,%20and%20events."]
  }
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
