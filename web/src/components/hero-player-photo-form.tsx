"use client";

import { Upload } from "lucide-react";
import { useRef, useState } from "react";
import { saveHeroPlayerPhoto } from "@/app/actions/public-profile-actions";

const HERO_PLAYER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

type HeroPlayerPhotoFormProps = {
  athleteName: string;
  currentPlayerCutoutUrl?: string;
  variant?: "profile" | "command-center";
};

export function HeroPlayerPhotoForm({ athleteName, currentPlayerCutoutUrl, variant = "profile" }: HeroPlayerPhotoFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState(currentPlayerCutoutUrl ?? "");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "error">("idle");

  const chooseLabel = previewSrc ? "Change Player Photo" : "Upload Player Photo";
  const isCommandCenter = variant === "command-center";

  return (
    <form
      ref={formRef}
      action={saveHeroPlayerPhoto}
      className={isCommandCenter ? "relative z-20 mt-5 flex flex-wrap items-center gap-3" : "grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4"}
    >
      {!isCommandCenter ? (
        <div>
          <div className="text-sm font-black text-[#0A1A3F]">Hero Player Photo</div>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Transparent PNG or cutout image preferred.</p>
        </div>
      ) : null}

      {!isCommandCenter ? (
        previewSrc ? (
          <img
            src={previewSrc}
            alt={`${athleteName} Command Center cutout preview`}
            className="h-32 w-fit rounded-xl object-contain"
            onError={() => setPreviewSrc("")}
          />
        ) : (
          <div className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2 text-xs font-semibold text-[#66718F]">No player photo uploaded.</div>
        )
      ) : null}

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        name="heroPlayerPhoto"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          setMessage("");
          setStatus("idle");

          if (!file) {
            return;
          }
          if (!file.type.startsWith("image/")) {
            event.target.value = "";
            setStatus("error");
            setMessage("Choose an image file for the hero player photo.");
            return;
          }
          if (file.size > HERO_PLAYER_PHOTO_MAX_BYTES) {
            event.target.value = "";
            setStatus("error");
            setMessage("Choose an image under 5 MB.");
            return;
          }

          const reader = new FileReader();
          reader.addEventListener("load", () => {
            const result = typeof reader.result === "string" ? reader.result : "";
            if (!result.startsWith("data:image/")) {
              setStatus("error");
              setMessage("That image could not be previewed.");
              return;
            }
            setPreviewSrc(result);
            setStatus("saving");
            formRef.current?.requestSubmit();
          });
          reader.addEventListener("error", () => {
            setStatus("error");
            setMessage("That image could not be previewed.");
          });
          reader.readAsDataURL(file);
        }}
      />

      <button
        className={
          isCommandCenter
            ? "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm font-black text-white transition hover:bg-white/15"
            : "inline-flex min-h-10 w-fit items-center justify-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-4 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#F7F9FC]"
        }
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={16} />
        {status === "saving" ? "Saving..." : chooseLabel}
      </button>

      {message ? (
        <p
          className={
            status === "error"
              ? isCommandCenter
                ? "rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-xs font-black text-[#B42318]"
                : "rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-sm font-black text-[#B42318]"
              : isCommandCenter
                ? "rounded-xl border border-white/15 bg-white/10 px-3 py-2 text-xs font-black text-white"
                : "rounded-xl border border-[#BDECCB] bg-[#EAF8F0] px-3 py-2 text-sm font-black text-[#17833F]"
          }
          role={status === "error" ? "alert" : "status"}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
