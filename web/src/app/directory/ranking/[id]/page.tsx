import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function RankingDirectoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <DirectoryRecordView entityType="ranking" entityId={id} />;
}
