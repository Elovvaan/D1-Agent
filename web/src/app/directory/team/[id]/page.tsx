import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function TeamDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DirectoryRecordView entityType="team" entityId={id} />;
}
