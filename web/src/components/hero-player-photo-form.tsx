"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./design-system";

const HERO_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const LOCAL_HERO_PLAYER_KEY = "myd1-hero-player-photo-preview";

export function HeroPlayerPhotoForm({ athleteName, currentUrl }: { athleteName: string; currentUrl?: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [clientError, setClientError] = useState("");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedPreview = window.localStorage.getItem(LOCAL_HERO_PLAYER_KEY);
    if (savedPreview) setPreviewUrl(savedPreview);
  }, []);

  const previewSrc = useMemo(() => previewUrl ?? currentUrl, [currentUrl, previewUrl]);

  return (
    <form
      className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (clientError || !previewSrc) return;
        setIsSaving(true);
        window.localStorage.setItem(LOCAL_HERO_PLAYER_KEY, previewSrc);
        window.dispatchEvent(new Event("myd1-hero-player-updated"));
        setMessage("Hero player photo saved and applied to your Command Center.");
        window.setTimeout(() => setIsSaving(false), 250);
      }}
    >
      <div>
        <div className="text-sm font-black text-[#0A1A3F]">Hero Player Photo</div>
        <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">Transparent PNG or cutout image preferred.</p>
      </div>
      {previewSrc ? (
        <img src={previewSrc} alt={`${athleteName} Command Center cutout`} className="h-32 w-fit rounded-xl object-contain" />
      ) : (
        <div className="rounded-xl border border-[#DDE3EC] bg-white px-3 py-2 text-xs font-semibold text-[#66718F]">No player photo uploaded.</div>
      )}
      <input
        className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]"
        name="heroPlayerPhoto"
        type="file"
        accept="image/*"
        required
        onChange={(event) => {
          const file = event.target.files?.[0];
          setClientError("");
          setMessage("");
          if (!file) return;
          if (!file.type.startsWith("image/")) {
            event.target.value = "";
            setClientError("Choose an image file for the hero player photo.");
            return;
          }
          if (file.size > HERO_IMAGE_MAX_BYTES) {
            event.target.value = "";
            setClientError("Choose an image under 5 MB.");
            return;
          }
          const reader = new FileReader();
          reader.onload = () => {
            const nextPreview = String(reader.result ?? "");
            setPreviewUrl(nextPreview);
            window.localStorage.setItem(LOCAL_HERO_PLAYER_KEY, nextPreview);
            window.dispatchEvent(new Event("myd1-hero-player-updated"));
          };
          reader.readAsDataURL(file);
        }}
      />
      <Button variant="secondary" className="w-fit">{isSaving ? "Saving..." : "Upload Player Photo"}</Button>
      {clientError || message ? <p className={clientError ? "rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-sm font-black text-[#B42318]" : "rounded-xl border border-[#BDECCB] bg-[#EAF8F0] px-3 py-2 text-sm font-black text-[#17833F]"}>{clientError || message}</p> : null}
    </form>
  );
}
