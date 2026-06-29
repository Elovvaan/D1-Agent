import { Award, BookOpen, CheckCircle2, Film, ShieldCheck, Users } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { saveSupportingDocument, saveTranscriptUpload } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard, Timeline } from "@/components/design-system";
import { getSupportingDocuments, getTimelineEvents, getTrustScore, toTitle } from "@/lib/data/services";

const statusCopy: Record<string, string> = {
  "transcript-uploaded": "Transcript uploaded and attached to verification.",
  "transcript-error": "Transcript could not be uploaded. Choose a file and try again.",
  "supporting-document-uploaded": "Supporting document uploaded and queued for review.",
  "supporting-document-error": "Supporting document could not be uploaded. Please try again."
};

function readSavedDocuments() {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "documents.json");
    if (!existsSync(filePath)) return {};
    return JSON.parse(readFileSync(filePath, "utf8")) as { transcript?: { name: string; url: string; uploadedAt: string } };
  } catch {
    return {};
  }
}

export default async function TrustPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const trust = getTrustScore();
  const timeline = getTimelineEvents();
  const savedDocuments = readSavedDocuments();
  const supportingDocuments = getSupportingDocuments();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Verification moat"
        title="Trust Score"
        description="A transparent, weighted credibility score built from coach verification, multi-source data, public records, film, recommendations, and academics."
        action={<Button href="/coach/imported-verification" variant="cta">Request Verification</Button>}
      />
      {params.status && statusCopy[params.status] ? (
        <div
          className={
            params.status.endsWith("-error")
              ? "mb-6 rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]"
              : "mb-6 rounded-2xl border border-[#BDECCB] bg-[#EAF8F0] px-4 py-3 text-sm font-black text-[#17833F]"
          }
          role={params.status.endsWith("-error") ? "alert" : "status"}
        >
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <Card>
          <SectionTitle title="Current Score" action={<Badge tone="green">{trust.tier}</Badge>} />
          <div className="grid place-items-center py-8">
            <div className="grid h-56 w-56 place-items-center rounded-full border-[24px] border-[#F2C200] bg-white shadow-inner">
              <div className="text-center">
                <div className="text-6xl font-black">{trust.score}</div>
                <div className="text-base font-black text-[#17833F]">{toTitle(trust.tier)}</div>
              </div>
            </div>
          </div>
          <Button href="/profile" variant="primary" className="w-full">View Full Breakdown</Button>
        </Card>
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard label={trust.factors[0]?.label ?? "Coach Verified"} value={trust.factors[0]?.displayWeight ?? "65%"} detail="Strongest trust source." icon={Users} tone="green" />
            <StatCard label={trust.factors[1]?.label ?? "AI Verified"} value={trust.factors[1]?.displayWeight ?? "15%"} detail="AI and public stats agree." icon={ShieldCheck} />
            <StatCard label={trust.factors[2]?.label ?? "Public Records"} value={trust.factors[2]?.displayWeight ?? "10%"} detail="Imported records matched." icon={BookOpen} tone="yellow" />
          </div>
          <Card>
            <SectionTitle title="Trust Factors" />
            <ObjectList
              items={[
                ...trust.factors.map((factor) => ({
                  title: factor.label,
                  detail: factor.detail,
                  badge: toTitle(factor.status),
                  tone: factor.status === "met" ? ("green" as const) : factor.status === "partial" ? ("yellow" as const) : ("silver" as const),
                  icon: factor.factor === "film_uploaded" ? Film : factor.factor === "recommendations" ? Award : factor.factor === "gpa_verified" ? BookOpen : CheckCircle2
                }))
              ]}
            />
          </Card>
          <Card>
            <SectionTitle title="Audit Trail" />
            <Timeline
              items={[
                ...timeline.slice(0, 3).map((event) => ({
                  title: event.title,
                  detail: event.detail,
                  state: event.state,
                  meta: event.meta
                }))
              ]}
            />
          </Card>
          <Card>
            <SectionTitle title="Verification Documents" caption="Documents, transcript evidence, coach/public/admin review status, and source labels live on Trust." />
            <ObjectList
              items={[
                { title: "Parent Consent", detail: "Signed and stored for outreach approval.", badge: "Active", tone: "green", icon: ShieldCheck },
                { title: "Coach Connection", detail: "Coach Marcus Davis linked.", badge: "Connected", tone: "green", icon: Users },
                { title: "Transcript", detail: savedDocuments.transcript ? "Document uploaded / pending review" : "Upload needed before academic verification.", badge: savedDocuments.transcript ? "Uploaded" : "Pending", tone: savedDocuments.transcript ? "green" : "yellow", icon: BookOpen }
              ]}
            />
            <form action={saveTranscriptUpload} className="mt-6 grid gap-3">
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Transcript upload
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="transcript" type="file" accept=".pdf,.png,.jpg,.jpeg" required />
              </label>
              {savedDocuments.transcript ? (
                <a className="text-sm font-black text-[#1B3FA0]" href={savedDocuments.transcript.url} rel="noreferrer" target="_blank">
                  View uploaded transcript: {savedDocuments.transcript.name}
                </a>
              ) : null}
              <Button variant="cta" className="w-fit">Upload Transcript</Button>
            </form>
            <form action={saveSupportingDocument} className="mt-6 grid gap-3 border-t border-[#E4E9F1] pt-5">
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Supporting document type
                <select className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="documentKind" defaultValue="Stat sheet">
                  <option>Stat sheet</option>
                  <option>Camp results</option>
                  <option>Combine sheet</option>
                  <option>School document</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
                Supporting document upload
                <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]" name="supportingDocument" type="file" accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx" required />
              </label>
              <Button variant="secondary" className="w-fit">Upload Supporting Document</Button>
            </form>
            {supportingDocuments.length ? (
              <div className="mt-5 grid gap-2">
                {supportingDocuments.map((document) => (
                  <a className="rounded-xl border border-[#E4E9F1] bg-[#FAFBFD] px-3 py-2 text-sm font-black text-[#1B3FA0]" href={document.url} key={`${document.url}-${document.uploadedAt}`} rel="noreferrer" target="_blank">
                    {document.kind ?? "Document"}: {document.name} - Document uploaded / pending review
                  </a>
                ))}
              </div>
            ) : null}
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
