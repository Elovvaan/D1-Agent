import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Schools | MYD1",
  description: "Explore school pages, teams, athletes, coaches, and public sports data across MYD1.",
  openGraph: {
    title: "Schools | MYD1",
    description: "Explore school pages, teams, athletes, coaches, and public sports data across MYD1.",
    images: [{ url: "/api/og?theme=schools&title=MYD1%20SCHOOLS&subtitle=School%20pages,%20teams,%20athletes,%20coaches,%20and%20sports%20data.", width: 1200, height: 630, alt: "MYD1 Schools social preview" }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Schools | MYD1",
    description: "Explore school pages, teams, athletes, coaches, and public sports data across MYD1.",
    images: ["/api/og?theme=schools&title=MYD1%20SCHOOLS&subtitle=School%20pages,%20teams,%20athletes,%20coaches,%20and%20sports%20data."]
  }
};

export default function SchoolsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
