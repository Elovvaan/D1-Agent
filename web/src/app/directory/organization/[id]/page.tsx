import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function OrganizationDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DirectoryRecordView entityType="organization" entityId={id} />;
}
