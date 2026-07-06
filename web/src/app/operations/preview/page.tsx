import { InlinePreviewEditor } from "./inline-preview-editor";

type PreviewPageKey = "home" | "discover" | "search" | "about" | "schools" | "sports" | "games" | "events" | "locked-in";

const editablePages = new Set<PreviewPageKey>(["home", "discover", "search", "about", "schools", "sports", "games", "events", "locked-in"]);

function pathToPageKey(path: string): PreviewPageKey {
  const noQuery = path.split("?")[0];
  const firstSegment = noQuery.split("/").filter(Boolean)[0] || "home";
  return editablePages.has(firstSegment as PreviewPageKey) ? firstSegment as PreviewPageKey : "home";
}

export default async function OperationsPreviewPage({ searchParams }: { searchParams?: Promise<{ path?: string; back?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const rawPath = params.path || "/";
  const safePath = rawPath.startsWith("/") && !rawPath.startsWith("//") ? rawPath : "/";
  const back = params.back && params.back.startsWith("/operations") ? params.back : "/operations";
  const pageKey = pathToPageKey(safePath);
  return <InlinePreviewEditor pageKey={pageKey} safePath={safePath} back={back} status={params.status} />;
}
