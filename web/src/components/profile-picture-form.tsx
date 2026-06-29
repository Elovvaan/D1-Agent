"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfilePicture, type ProfilePictureActionState } from "@/app/actions/public-profile-actions";
import { Button } from "./design-system";

const PROFILE_PICTURE_MAX_BYTES = 5 * 1024 * 1024;

const initialState: ProfilePictureActionState = {
  status: "idle",
  message: ""
};

export function ProfilePictureForm({
  athleteName,
  currentAvatarUrl,
  initials
}: {
  athleteName: string;
  currentAvatarUrl?: string;
  initials: string;
}) {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(saveProfilePicture, initialState);
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentAvatarUrl);
  const [clientError, setClientError] = useState("");

  useEffect(() => {
    if (state.status === "success" && state.avatarUrl) {
      setPreviewUrl(state.avatarUrl);
      router.refresh();
    }
  }, [router, state]);

  const previewSrc = useMemo(() => previewUrl ?? currentAvatarUrl, [currentAvatarUrl, previewUrl]);
  const visibleMessage = clientError || state.message;
  const visibleStatus = clientError ? "error" : state.status;

  return (
    <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
      <div className="grid h-24 w-24 place-items-center overflow-hidden rounded-full border-4 border-white bg-[#1B3FA0] text-2xl font-black text-white shadow-[0_14px_34px_rgba(10,26,63,0.16)]">
        {previewSrc ? <img src={previewSrc} alt={`${athleteName} profile`} className="h-full w-full object-cover" /> : initials}
      </div>
      <form
        action={formAction}
        className="grid flex-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end"
        onSubmit={(event) => {
          if (clientError) {
            event.preventDefault();
          }
        }}
      >
        <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
          Upload profile picture
          <input
            className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]"
            name="profilePicture"
            type="file"
            accept="image/*"
            required
            onChange={(event) => {
              const file = event.target.files?.[0];
              setClientError("");
              if (!file) {
                return;
              }
              if (!file.type.startsWith("image/")) {
                event.target.value = "";
                setPreviewUrl(currentAvatarUrl);
                setClientError("Choose an image file for the profile picture.");
                return;
              }
              if (file.size > PROFILE_PICTURE_MAX_BYTES) {
                event.target.value = "";
                setPreviewUrl(currentAvatarUrl);
                setClientError("Choose an image under 5 MB.");
                return;
              }
              setPreviewUrl(URL.createObjectURL(file));
            }}
          />
        </label>
        <Button variant="secondary">{isPending ? "Saving..." : "Upload Photo"}</Button>
        {visibleStatus !== "idle" ? (
          <p
            className={
              visibleStatus === "success"
                ? "sm:col-span-2 rounded-xl border border-[#BDECCB] bg-[#EAF8F0] px-3 py-2 text-sm font-black text-[#17833F]"
                : "sm:col-span-2 rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-sm font-black text-[#B42318]"
            }
            role={visibleStatus === "error" ? "alert" : "status"}
          >
            {visibleMessage}
          </p>
        ) : null}
      </form>
    </div>
  );
}
