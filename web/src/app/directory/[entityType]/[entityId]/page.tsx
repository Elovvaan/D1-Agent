import { DirectoryRecordView } from "@/components/directory-record-view";

export default async function PublicDirectoryRecordPage({
  params
}: {
  params: Promise<{ entityType: string; entityId: string }>;
}) {
  const { entityType, entityId } = await params;
  return <DirectoryRecordView entityType={entityType} entityId={entityId} />;
}
