export async function publicFetchPort(url) {
  try {
    const response = await fetch(url, {
      cache: "no-store",
      redirect: "follow",
      headers: { "user-agent": "MyD1RosterBackfill/1.0 (+https://myd1.sports)" }
    });
    const contentType = response.headers.get("content-type") ?? "";
    if (!response.ok || (!contentType.includes("text/html") && !contentType.includes("application/xhtml"))) {
      return { ok: false, html: "", status: response.status };
    }
    return { ok: true, html: await response.text(), status: response.status };
  } catch {
    return { ok: false, html: "", status: 0 };
  }
}
