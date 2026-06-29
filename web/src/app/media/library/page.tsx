import { ExternalLink, FolderOpen, Upload } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";
import { getMediaPartnerLibrary } from "@/lib/data/media-partner";

function badgeTone(status: string) {
  if (status.includes("approved") || status === "published") return "green" as const;
  if (status.includes("pending") || status.includes("required")) return "yellow" as const;
  return "silver" as const;
}

export default function MediaPartnerLibraryPage() {
  const library = getMediaPartnerLibrary();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Media Partner"
        title="Media Library"
        description="Manage media uploaded by this partner. Library items remain private/review-gated unless the approval pipeline publishes them."
        action={<Button href="/media/upload" variant="primary"><Upload size={17} /> Upload</Button>}
      />
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Owned Media" caption="Media Partner Uploads keep uploader, licensing, attachment, visibility, approval, and audit history." action={<Badge tone="blue">{library.length}</Badge>} />
          {library.length ? (
            <div className="grid gap-3">
              {library.map((item) => (
                <article className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4" key={item.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-base font-black text-[#0A1A3F]">{item.title}</h2>
                      <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">{item.uploaderOrganizationName} - {item.mediaType} - {item.uploadedAt}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={badgeTone(item.approvalStatus)}>{item.approvalStatus.replaceAll("_", " ")}</Badge>
                      <Badge tone={item.licenseState === "paid_license_required" ? "yellow" : "blue"}>{item.licenseState.replaceAll("_", " ")}</Badge>
                    </div>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#66718F]">Visibility: <span className="font-black text-[#0A1A3F]">{item.visibility.replaceAll("_", " ")}</span></div>
                    <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#66718F]">Tagged: <span className="font-black text-[#0A1A3F]">{item.taggedAthletes.join(", ") || "None"}</span></div>
                    <div className="rounded-xl bg-white p-3 text-xs font-semibold text-[#66718F]">Attached: <span className="font-black text-[#0A1A3F]">{item.attachedGameName || item.attachedTeamName || item.attachedSchoolName || "Not attached"}</span></div>
                  </div>
                  {item.fileUrl ? (
                    <a className="mt-4 inline-flex items-center gap-2 text-sm font-black text-[#1B3FA0]" href={item.fileUrl} target="_blank" rel="noreferrer">
                      Open uploaded file <ExternalLink size={15} />
                    </a>
                  ) : null}
                </article>
              ))}
            </div>
          ) : (
            <p className="text-sm font-semibold leading-6 text-[#66718F]">No media partner uploads yet.</p>
          )}
        </Card>

        <div className="grid h-fit gap-6">
          <StatCard label="Total Media" value={`${library.length}`} detail="Owned media partner uploads." icon={FolderOpen} />
          <Card>
            <SectionTitle title="Ownership Rules" />
            <ObjectList
              items={[
                { title: "Media partner owns upload management", detail: "Can manage library, tags, licensing notes, and submissions.", icon: FolderOpen, tone: "blue" },
                { title: "Athlete owns public presentation", detail: "Public profile placement requires athlete or guardian approval.", icon: Upload, tone: "yellow" }
              ]}
            />
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
