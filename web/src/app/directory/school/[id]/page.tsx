import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function SchoolDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DirectoryRecordView entityType="school" entityId={id} />;
}
