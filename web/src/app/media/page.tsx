import { Camera, FolderOpen, Upload, Users } from "lucide-react";
import { saveMediaPartnerProfile } from "@/app/actions/media-partner-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getMediaPartnerDashboard } from "@/lib/data/media-partner";

const statusMessages: Record<string, string> = {
  "profile-saved": "Media partner profile saved.",
};

export default async function MediaPartnerHomePage({
  searchParams
}: {
  searchParams?: Promise<{ status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const dashboard = getMediaPartnerDashboard();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Media Partner"
        title="Media Partner Portal"
        description="Approved photographers, videographers, livestream crews, newspapers, and creators can contribute media into a review and athlete-approval pipeline."
        action={<Button href="/media/upload" variant="primary"><Upload size={17} /> Upload Media</Button>}
      />
      {params.status ? (
        <div className="mb-6 rounded-2xl border border-[#C7CDD6] bg-white px-4 py-3 text-sm font-black text-[#0A1A3F] shadow-[0_12px_30px_rgba(10,26,63,0.08)]">
          {statusMessages[params.status] ?? params.status}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-4">
            <StatCard label="Library" value={`${dashboard.submissions.length}`} detail="Media uploaded by this partner." icon={FolderOpen} />
            <StatCard label="Review Pending" value={`${dashboard.reviewPending}`} detail="Not visible publicly." icon={Camera} tone="yellow" />
            <StatCard label="Athlete Approval" value={`${dashboard.athleteApprovalRequired}`} detail="Awaiting athlete or guardian decision." icon={Users} tone="yellow" />
            <StatCard label="Published" value={`${dashboard.published}`} detail="Approved for public profile use." icon={Upload} tone="green" />
          </div>

          <Card>
            <SectionTitle title="Contribution Pipeline" caption="Media partners submit into review. Athletes own public presentation." />
            <ObjectList
              items={[
                { title: "Upload media", detail: "Add photos, clips, highlight videos, licensing notes, and tags.", badge: "Media Partner Upload", icon: Upload, tone: "blue" },
                { title: "Review queue", detail: "Admin/operator checks source, tags, safety, licensing, and fit.", badge: "Review Pending", icon: Camera, tone: "yellow" },
                { title: "Athlete control", detail: "Athlete or guardian can approve, decline, save private, or request removal.", badge: "Approval Required", icon: Users, tone: "yellow" },
                { title: "Public profile", detail: "Only approved media can appear on athlete public profile/feed.", badge: "Athlete Approved", icon: FolderOpen, tone: "green" }
              ]}
            />
          </Card>
        </div>

        <div className="grid h-fit gap-6">
          <Card>
            <SectionTitle title="Partner Profile" action={dashboard.profile ? <Badge tone="green">Approved</Badge> : <Badge tone="yellow">Setup</Badge>} />
            {dashboard.profile ? (
              <ObjectList
                items={[
                  { title: dashboard.profile.organizationName, detail: dashboard.profile.displayName, badge: dashboard.profile.partnerType.replaceAll("_", " "), icon: Camera, tone: "green" }
                ]}
              />
            ) : (
              <form action={saveMediaPartnerProfile} className="grid gap-3">
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Organization</span>
                  <input className="min-h-11 rounded-2xl border border-[#C7CDD6] px-4 text-sm font-semibold outline-none" name="organizationName" placeholder="Peak Sports Media" required />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Display Name</span>
                  <input className="min-h-11 rounded-2xl border border-[#C7CDD6] px-4 text-sm font-semibold outline-none" name="displayName" placeholder="Jordan Avery" required />
                </label>
                <label className="grid gap-2">
                  <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Partner Type</span>
                  <select className="min-h-11 rounded-2xl border border-[#C7CDD6] px-4 text-sm font-semibold outline-none" name="partnerType">
                    <option value="photographer">Photographer</option>
                    <option value="videographer">Videographer</option>
                    <option value="livestream_crew">Livestream Crew</option>
                    <option value="newspaper">Newspaper</option>
                    <option value="independent_creator">Independent Creator</option>
                  </select>
                </label>
                <Button variant="cta">Save Partner Profile</Button>
              </form>
            )}
          </Card>
          <Card>
            <SectionTitle title="Permissions" />
            <ObjectList
              items={[
                { title: "Allowed", detail: "Upload, tag, license, manage own media, and submit to review.", icon: Upload, tone: "green" },
                { title: "Blocked", detail: "Cannot edit athlete profiles, verify stats, expose contact info, or publish directly.", icon: Users, tone: "yellow" }
              ]}
            />
          </Card>
          <div className="grid gap-3">
            <Button href="/media/library" variant="secondary">Open Library</Button>
            <Button href="/media/submissions" variant="secondary">Review Submissions</Button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
