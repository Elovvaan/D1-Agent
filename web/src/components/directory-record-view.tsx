import { ArrowLeft, ExternalLink, MapPin, Search, ShieldCheck, Trophy, Users } from "lucide-react";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";
import { getPublicDirectoryRecord, toTitle } from "@/lib/data/services";

function sourceNameFromUrl(url?: string) {
  if (!url) return "Public source";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "Public source";
  }
}

function publicEntityLabel(typeLabel: string) {
  const normalized = typeLabel.toLowerCase();
  if (normalized.includes("school")) return "School";
  if (normalized.includes("team")) return "Team";
  if (normalized.includes("athlete")) return "Athlete";
  if (normalized.includes("ranking")) return "Ranking";
  if (normalized.includes("game")) return "Game";
  if (normalized.includes("coach")) return "Coach";
  if (normalized.includes("aggregator") || normalized.includes("source")) return "Source";
  return toTitle(typeLabel);
}

export function DirectoryRecordView({ entityType, entityId }: { entityType: string; entityId: string }) {
  const record = getPublicDirectoryRecord(entityId);

  if (!record) {
    return (
      <PublicSiteShell>
        <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
          <PageHeader
            eyebrow="Public Sports Search"
            title={`${toTitle(entityType)} not found`}
            description="This public result is not available yet. Search again or browse schools, sports, and rankings from the public discovery page."
            action={<Button href="/search" variant="secondary"><ArrowLeft size={16} /> Back to Search</Button>}
          />
          <Card>
            <SectionTitle title="No Public Page Available" caption="This result may have been merged, removed, or held for operator review." />
          </Card>
        </section>
      </PublicSiteShell>
    );
  }

  const linked = record.graphNode?.linked ?? [];
  const sourceUrl = record.entity.sourceUrl;
  const publicType = publicEntityLabel(record.typeLabel);
  const schools = linked.filter((item) => item.type === "school").slice(0, 6);
  const teams = linked.filter((item) => item.type === "team").slice(0, 6);
  const related = linked.filter((item) => item.type !== "school" && item.type !== "team").slice(0, 8);
  const nameField = record.fields.find((field) => field.name.toLowerCase() === "name")?.value ?? record.title;
  const locationField = record.fields.find((field) => ["state", "city", "location", "hometown"].includes(field.name.toLowerCase()))?.value;
  const sportField = record.fields.find((field) => field.name.toLowerCase().includes("sport"))?.value;

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="MyD1 Public Discovery"
          title={nameField}
          description={record.detail || `${publicType} page in the MyD1 sports directory.`}
          action={<Button href="/search" variant="secondary"><ArrowLeft size={16} /> Back to Search</Button>}
        />

        <Card className="overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[1fr_320px] lg:items-center">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge tone="blue">{publicType}</Badge>
                {sportField ? <Badge tone="yellow">{sportField}</Badge> : null}
                {locationField ? <Badge tone="silver">{locationField}</Badge> : null}
              </div>
              <h2 className="mt-5 text-3xl font-black tracking-tight text-[#0A1A3F] sm:text-4xl">{record.title}</h2>
              <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#66718F]">
                Explore this public sports result, related schools or teams, and verified source context without entering the private MyD1 app.
              </p>
              <form className="mt-6 grid gap-3 md:grid-cols-[1fr_auto]" action="/search">
                <label className="sr-only" htmlFor="detail-search">Search MyD1</label>
                <div className="flex min-h-12 items-center gap-3 rounded-2xl border border-[#C7CDD6] bg-white px-4">
                  <Search size={18} className="text-[#66718F]" />
                  <input className="min-h-10 flex-1 bg-transparent text-sm font-semibold text-[#0A1A3F] outline-none" id="detail-search" name="q" type="search" />
                </div>
                <Button variant="primary">Search</Button>
              </form>
            </div>
            <div className="rounded-[28px] bg-[#0A1A3F] p-5 text-white shadow-[0_24px_60px_rgba(10,26,63,0.22)]">
              <div className="text-xs font-black uppercase tracking-[0.18em] text-[#9DB5FF]">Public source</div>
              <div className="mt-3 text-2xl font-black">{sourceNameFromUrl(sourceUrl)}</div>
              <p className="mt-3 text-sm font-semibold leading-6 text-[#DCE7FF]">Source attribution is shown for transparency. Import review tools stay in Operations Center.</p>
              {sourceUrl ? <a className="mt-5 inline-flex rounded-2xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F]" href={sourceUrl} rel="noreferrer" target="_blank">Visit Source <ExternalLink size={15} className="ml-2" /></a> : null}
            </div>
          </div>
        </Card>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Result Type" value={publicType} detail="Public directory category." icon={ShieldCheck} />
          <StatCard label="Related Schools" value={`${schools.length}`} detail="Schools connected by source data." icon={MapPin} tone="green" />
          <StatCard label="Related Teams" value={`${teams.length}`} detail="Teams connected by source data." icon={Users} tone="yellow" />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <Card>
            <SectionTitle title="Overview" caption="Clean public details only. Internal import metadata is hidden from visitors." />
            {record.fields.length ? (
              <ObjectList
                items={record.fields
                  .filter((field) => !["sourceUrl", "reviewStatus", "imported", "orgType"].includes(field.name))
                  .slice(0, 8)
                  .map((field) => ({ title: toTitle(field.name), detail: "Public detail", value: field.value, icon: ShieldCheck, tone: "green" }))}
              />
            ) : <p className="text-sm font-semibold leading-6 text-[#66718F]">Public details are being prepared.</p>}
          </Card>

          <Card>
            <SectionTitle title="Related Discovery" caption="Keep exploring without entering the private app." />
            {linked.length ? (
              <ObjectList
                items={[...schools, ...teams, ...related].slice(0, 8).map((item) => ({
                  title: item.name,
                  detail: toTitle(item.label),
                  badge: toTitle(item.type),
                  icon: item.type === "school" ? MapPin : item.type === "team" ? Users : Trophy,
                  tone: item.type === "school" ? "green" : item.type === "team" ? "blue" : "yellow"
                }))}
              />
            ) : <p className="text-sm font-semibold leading-6 text-[#66718F]">Related public results will appear here as the directory grows.</p>}
          </Card>
        </div>
      </section>
    </PublicSiteShell>
  );
}
