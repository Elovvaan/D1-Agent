"use server";

import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { revalidatePath } from "next/cache";

export type WorkspacePhotoState = { status: "idle" | "success" | "error"; message: string; photoUrl?: string };

export async function saveWorkspacePicture(_prevState: WorkspacePhotoState, formData: FormData): Promise<WorkspacePhotoState> {
  try {
    const workspace = String(formData.get("role") ?? "").trim();
    const allowed = ["athlete", "family", "coach", "recruiter", "media", "organization", "admin"];
    if (!allowed.includes(workspace)) throw new Error("Unknown workspace.");

    const file = formData.get("profilePicture");
    if (!(file instanceof File) || file.size === 0) throw new Error("Choose an image before saving.");
    if (!file.type.startsWith("image/")) throw new Error("Choose an image file.");
    if (file.size > 5 * 1024 * 1024) throw new Error("Choose an image under 5 MB.");

    const uploadedAt = new Date().toISOString();
    const safeName = `${workspace}-profile-${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-")}`;
    const root = resolve(process.cwd(), "..", "data", "user-state");
    const uploadDir = resolve(root, "uploads");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(resolve(uploadDir, safeName), Buffer.from(await file.arrayBuffer()));

    const statePath = resolve(root, "role-workspaces.json");
    let existing: Record<string, Record<string, unknown>> = {};
    try { existing = JSON.parse(await readFile(statePath, "utf8")); } catch {}
    const current = existing[workspace] ?? {};
    const imageUrl = `/api/uploads/${safeName}`;
    existing[workspace] = { ...current, profilePhotoUrl: imageUrl, profilePhotoName: file.name, profilePhotoType: file.type, profilePhotoSize: file.size, profilePhotoStorage: "served-data", profilePhotoUpdatedAt: uploadedAt };
    await mkdir(root, { recursive: true });
    await writeFile(statePath, `${JSON.stringify(existing, null, 2)}\n`, "utf8");

    const base = workspace === "organization" ? "/organization" : workspace === "admin" ? "/operations" : `/${workspace}`;
    revalidatePath(base);
    revalidatePath("/search");

    return { status: "success", message: "Profile picture saved and updated across the app.", photoUrl: `${imageUrl}?v=${encodeURIComponent(uploadedAt)}` };
  } catch (error) {
    return { status: "error", message: error instanceof Error ? error.message : "Profile picture could not be saved." };
  }
}
