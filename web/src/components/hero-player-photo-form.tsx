"use client";

import { Upload } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { clearStoredHeroPlayerPhoto, readStoredHeroPlayerPhoto, writeStoredHeroPlayerPhoto } from "@/components/stored-hero-cutout";

const HERO_PLAYER_PHOTO_MAX_BYTES = 5 * 1024 * 1024;

type HeroPlayerPhotoFormProps = {
  athleteName: string;
  variant?: "profile" | "command-center";
};

export function HeroPlayerPhotoForm({ athleteName, variant = "profile" }: HeroPlayerPhotoFormProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewSrc, setPreviewSrc] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setPreviewSrc(readStoredHeroPlayerPhoto());
  }, []);

  const chooseLabel = previewSrc ? "Change Player Photo" : "Upload Player Photo";
  const isCommandCenter = variant === "command-center";

  return (
    <div className={isCommandCenter ? "relative z-20 mt-5 flex flex-wrap items-center gap-3" : "grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4"}>
      {!isCommandCenter ? (
        <div>
          <div className="text-sm font-black text-[#0A1A3F]">Hero Player Photo</div>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Transparent PNG or cutout image preferred. Stored in this browser for now.</p>
        </div>
      ) : null}

      {!isCommandCenter ? (
        previewSrc ? (
          <img
            src={previewSrc}
            alt={`${athleteName} Command Center cutout preview`}
            className="h-32 w-fit rounded-xl object-contain"
            onError={() => {
              clearStoredHeroPlayerPhoto();
              setPreviewSrc("");
            }}
          />
        ) : (
          <div className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2 text-xs font-semibold text-[#66718F]">No player photo uploaded.</div>
        )
      ) : null}

      <input
        ref={inputRef}
        className="sr-only"
        type="file"
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

            writeStoredHeroPlayerPhoto(result);
            setPreviewSrc(result);
            setStatus("success");
            setMessage("Hero player photo updated in this browser.");
          });
          reader.addEventListener("error", () => {
            setStatus("error");
            setMessage("That image could not be previewed.");
          });
          reader.readAsDataURL(file);
          event.target.value = "";
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
        {chooseLabel}
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
    </div>
  );
}
