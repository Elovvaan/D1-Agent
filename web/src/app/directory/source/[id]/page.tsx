import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function SourceDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DirectoryRecordView entityType="source" entityId={id} />;
}
