import { Activity, ArrowRight, Clapperboard, Search, Trophy, Users } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const boysSports = ["Football", "Basketball", "Baseball", "Soccer", "Track & Field", "Wrestling", "Volleyball", "Tennis", "Golf", "Lacrosse", "Swimming", "Cross Country"];
const girlsSports = ["Basketball", "Volleyball", "Softball", "Soccer", "Track & Field", "Tennis", "Golf", "Swimming", "Cross Country", "Wrestling", "Lacrosse", "Cheer"];
const coedSports = ["Archery", "Band", "Bass Fishing", "Bowling", "Dance Team", "Esports", "Flag Football", "Rifle", "Speech", "Unified Sports"];

function SportPill({ label }: { label: string }) {
  return (
    <a className="group rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] px-4 py-3 text-sm font-black text-[#0A1A3F] transition hover:border-[#1B3FA0] hover:bg-white" href={`/search?q=${encodeURIComponent(label)}`}>
      <span className="flex items-center justify-between gap-3">{label}<ArrowRight className="text-[#1B3FA0] opacity-0 transition group-hover:translate-x-1 group-hover:opacity-100" size={15} /></span>
    </a>
  );
}

function SportSection({ title, sports }: { title: string; sports: string[] }) {
  return (
    <Card>
      <SectionTitle title={title} caption="Click a sport to search athletes, schools, teams, rankings, and public records." />
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sports.map((sport) => <SportPill key={sport} label={sport} />)}
      </div>
    </Card>
  );
}

export default function SportsPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Sports"
          title="Browse every athlete path by sport."
          description="The public sports page should act like a clean sports directory. Pick a sport, search the network, and move into schools, teams, rankings, athletes, or film."
          action={<Button href="/search" variant="cta"><Search size={17} /> Search Sports</Button>}
        />

        <Card className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2"><Badge tone="blue">Sports</Badge><Badge tone="green">Schools</Badge><Badge tone="yellow">Athletes</Badge></div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A1A3F] sm:text-4xl">Sports are the front door to discovery.</h2>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-[#66718F]">A visitor should be able to start with basketball, football, soccer, or any other sport and keep moving through public MyD1 pages without entering the private app.</p>
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">Progression</div>
              <div className="mt-3 text-2xl font-black">Youth to elite.</div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">Stats, film, school records, verified profiles, and recruiting tools connect after the public discovery layer.</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Performance" value="Stats" detail="Public stats and verified records." icon={Activity} />
          <StatCard label="Film" value="Highlights" detail="Public media discovery layer." icon={Clapperboard} tone="blue" />
          <StatCard label="Path" value="A1-D1" detail="Progression from foundation to elite." icon={Trophy} tone="yellow" />
          <StatCard label="Network" value="Teams" detail="Schools, rosters, and teams." icon={Users} tone="green" />
        </div>

        <div className="mt-6 grid gap-6">
          <SportSection title="Boys Sports" sports={boysSports} />
          <SportSection title="Girls Sports" sports={girlsSports} />
          <SportSection title="Co-ed and Emerging Sports" sports={coedSports} />
        </div>
      </section>
    </PublicSiteShell>
  );
}
