"use server";

import { randomUUID } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { basename, extname, resolve } from "node:path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { MediaPartnerProfile, MediaPartnerSubmission } from "@d1/shared";
import { defaultAthleteId } from "@/lib/data/services";

const mediaPartnerDir = resolve(process.cwd(), "..", "data", "media-partner");
const uploadDir = resolve(process.cwd(), "public", "media-partner-uploads");

function value(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

function safeFileName(name: string) {
  const ext = extname(name);
  const base = basename(name, ext).replace(/[^a-z0-9_-]+/gi, "-").replace(/^-|-$/g, "") || "media";
  return `${base.slice(0, 48)}${ext.slice(0, 12)}`;
}

async function writeSubmission(submission: MediaPartnerSubmission) {
  await mkdir(mediaPartnerDir, { recursive: true });
  await writeFile(resolve(mediaPartnerDir, `${submission.id}.json`), `${JSON.stringify(submission, null, 2)}\n`, "utf8");
}

async function readSubmission(id: string) {
  const path = resolve(mediaPartnerDir, `${id}.json`);
  if (!existsSync(path)) return null;
  return JSON.parse(await readFile(path, "utf8")) as MediaPartnerSubmission;
}

function partnerDisplayName() {
  return {
    uploaderName: "Media Partner",
    uploaderOrganizationName: "Independent Media Partner"
  };
}

export async function saveMediaPartnerProfile(formData: FormData) {
  await mkdir(mediaPartnerDir, { recursive: true });
  const now = new Date().toISOString();
  const profile: MediaPartnerProfile = {
    id: `profile-${randomUUID()}`,
    userId: "user-media-partner",
    organizationName: value(formData, "organizationName"),
    displayName: value(formData, "displayName"),
    partnerType: value(formData, "partnerType") as MediaPartnerProfile["partnerType"],
    approved: true,
    createdAt: now
  };
  await writeFile(resolve(mediaPartnerDir, `${profile.id}.json`), `${JSON.stringify(profile, null, 2)}\n`, "utf8");
  revalidatePath("/media");
  redirect("/media?status=profile-saved");
}

export async function uploadMediaPartnerSubmission(formData: FormData) {
  await mkdir(mediaPartnerDir, { recursive: true });
  await mkdir(uploadDir, { recursive: true });
  const file = formData.get("mediaFile");
  let fileName = "";
  let fileUrl = "";

  if (file instanceof File && file.size > 0) {
    if (file.size > 900_000) redirect("/media/upload?status=upload-too-large");
    fileName = `${randomUUID()}-${safeFileName(file.name)}`;
    await writeFile(resolve(uploadDir, fileName), Buffer.from(await file.arrayBuffer()));
    fileUrl = `/media-partner-uploads/${fileName}`;
  }

  const now = new Date().toISOString();
  const uploader = partnerDisplayName();
  const taggedAthletes = value(formData, "taggedAthletes").split(",").map((item) => item.trim()).filter(Boolean);
  const attachedAthleteIds = taggedAthletes.length ? [defaultAthleteId] : [];
  const licenseState = value(formData, "licenseState") as MediaPartnerSubmission["licenseState"];
  const submission: MediaPartnerSubmission = {
    id: `submission-${randomUUID()}`,
    uploaderRole: "media_partner",
    uploaderName: uploader.uploaderName,
    uploaderOrganizationName: value(formData, "organizationName") || uploader.uploaderOrganizationName,
    mediaType: value(formData, "mediaType") as MediaPartnerSubmission["mediaType"],
    title: value(formData, "title"),
    fileName,
    fileUrl,
    sourceLabel: licenseState === "paid_license_required" ? "License Required" : "Review Pending",
    uploadedAt: now,
    attachedGameId: value(formData, "gameId"),
    attachedGameName: value(formData, "gameName"),
    attachedTeamId: value(formData, "teamId"),
    attachedTeamName: value(formData, "teamName"),
    attachedSchoolId: value(formData, "schoolId"),
    attachedSchoolName: value(formData, "schoolName"),
    attachedAthleteIds,
    taggedAthletes,
    sport: value(formData, "sport"),
    licensingNotes: value(formData, "licensingNotes"),
    licenseState,
    visibility: "review_pending",
    approvalStatus: "review_pending",
    requiresGuardianApproval: value(formData, "requiresGuardianApproval") === "on",
    auditHistory: [
      {
        action: "submitted_to_review",
        actor: "media_partner",
        occurredAt: now,
        note: "Media Partner Upload entered review queue. It is not public."
      }
    ]
  };
  await writeSubmission(submission);
  revalidatePath("/media");
  revalidatePath("/media/library");
  revalidatePath("/media/submissions");
  redirect("/media/submissions?status=submitted");
}

export async function recordMediaPartnerReviewAction(formData: FormData) {
  const submissionId = value(formData, "submissionId");
  const action = value(formData, "action");
  const submission = await readSubmission(submissionId);
  if (!submission) redirect("/media/submissions?status=not-found");
  const now = new Date().toISOString();

  if (action === "admin_ready_for_athlete") {
    submission.approvalStatus = "athlete_approval_required";
    submission.visibility = "athlete_approval_required";
    submission.sourceLabel = "Media Partner Upload";
  } else if (action === "admin_reject") {
    submission.approvalStatus = "declined";
    submission.visibility = "private";
  } else if (action === "athlete_approve") {
    submission.approvalStatus = submission.requiresGuardianApproval ? "guardian_approved" : "athlete_approved";
    submission.visibility = "published";
    submission.sourceLabel = submission.requiresGuardianApproval ? "Guardian Approved" : "Athlete Approved";
  } else if (action === "decline") {
    submission.approvalStatus = "declined";
    submission.visibility = "private";
  } else if (action === "save_private") {
    submission.approvalStatus = "saved_private";
    submission.visibility = "private";
  } else if (action === "request_removal") {
    submission.approvalStatus = "removal_requested";
    submission.visibility = "private";
  }

  submission.auditHistory = [
    ...submission.auditHistory,
    {
      action,
      actor: action.startsWith("admin") ? "admin" : submission.requiresGuardianApproval ? "guardian" : "athlete",
      occurredAt: now,
      note: value(formData, "note")
    }
  ];
  await writeSubmission(submission);
  revalidatePath("/media/submissions");
  revalidatePath("/media/library");
  revalidatePath(`/athletes/${defaultAthleteId}`);
  redirect("/media/submissions?status=updated");
}
