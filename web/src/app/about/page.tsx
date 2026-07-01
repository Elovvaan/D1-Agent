import { ArrowRight, Bot, Building2, Clapperboard, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

export default function AboutPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="About MyD1"
          title="A public sports discovery layer with a private career command center behind it."
          description="MyD1 helps athletes, families, coaches, schools, media partners, and recruiters move through one connected sports ecosystem without exposing private tools on the public side."
          action={<Button href="/get-started" variant="cta">Get Started <ArrowRight size={16} /></Button>}
        />

        <Card className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_360px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">Public Discovery</Badge>
                <Badge tone="green">Verified Profiles</Badge>
                <Badge tone="yellow">D1 Agent</Badge>
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A1A3F] sm:text-4xl">The athlete profile should not live in pieces.</h2>
              <p className="mt-4 max-w-3xl text-sm font-semibold leading-6 text-[#66718F]">
                Film, stats, school records, public discovery, coach verification, recruiting activity, and communication should work together. MyD1 keeps the public experience clean while giving each signed-in role the tools they actually need.
              </p>
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">What MyD1 separates</div>
              <div className="mt-3 text-2xl font-black">Discovery from management.</div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">Visitors search and explore. Athletes manage careers. Operators support the whole platform privately.</p>
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-4">
          <StatCard label="Public" value="Search" detail="Athletes, schools, teams, rankings, and sports." icon={Search} />
          <StatCard label="Athlete" value="Profile" detail="Identity, film, stats, and recruiting path." icon={Users} tone="blue" />
          <StatCard label="School" value="Directory" detail="Teams, schedules, rosters, and public records." icon={Building2} tone="green" />
          <StatCard label="Agent" value="Support" detail="Guided next steps behind the scenes." icon={Bot} tone="yellow" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <SectionTitle title="What the public sees" caption="A clean sports website that does not expose backend records or private dashboards." />
            <ObjectList
              items={[
                { title: "Public sports search", detail: "Search athletes, schools, teams, sports, rankings, and public pages without signing in.", icon: Search, tone: "blue" },
                { title: "Clean public profiles", detail: "Public profile pages show only appropriate public-facing details, film, stats, and source context.", icon: ShieldCheck, tone: "green" },
                { title: "Sports discovery", detail: "Browse by sport, state, school, team, ranking, and eventually game or tournament.", icon: Trophy, tone: "yellow" }
              ]}
            />
          </Card>

          <Card>
            <SectionTitle title="What happens after sign in" caption="The platform becomes role-specific while keeping the same MyD1 identity." />
            <ObjectList
              items={[
                { title: "Athletes manage careers", detail: "Profiles, film, highlights, recruiting progress, coach connection, and trust score.", icon: Clapperboard, tone: "blue" },
                { title: "Schools and media stay limited", detail: "School admins and media partners upload or tag content without controlling athlete identity.", icon: Building2, tone: "green" },
                { title: "Operators support the system", detail: "Private Operations Center handles inbox, uploads, search issues, support, and fixes.", icon: Bot, tone: "yellow" }
              ]}
            />
          </Card>
        </div>
      </section>
    </PublicSiteShell>
  );
}
