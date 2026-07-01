"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "./design-system";

const HERO_IMAGE_MAX_BYTES = 5 * 1024 * 1024;
const LOCAL_HERO_PLAYER_KEY = "myd1-hero-player-photo-preview";

export function HeroPlayerPhotoForm({ athleteName, currentUrl }: { athleteName: string; currentUrl?: string }) {
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(currentUrl);
  const [clientError, setClientError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedPreview = window.localStorage.getItem(LOCAL_HERO_PLAYER_KEY);
    if (savedPreview) setPreviewUrl(savedPreview);
  }, []);

  const previewSrc = useMemo(() => previewUrl ?? currentUrl, [currentUrl, previewUrl]);

  function saveHeroPreview(nextPreview: string) {
    window.localStorage.setItem(LOCAL_HERO_PLAYER_KEY, nextPreview);
    window.dispatchEvent(new Event("myd1-hero-player-updated"));
    setMessage("Hero player photo saved and applied to your Command Center.");
  }

  return (
    <div className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
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
            saveHeroPreview(nextPreview);
          };
          reader.onerror = () => setClientError("Hero player photo could not be loaded in the browser.");
          reader.readAsDataURL(file);
        }}
      />
      <Button variant="secondary" className="w-fit">Saved Locally</Button>
      {clientError || message ? <p className={clientError ? "rounded-xl border border-[#FFD0D0] bg-[#FFF0F0] px-3 py-2 text-sm font-black text-[#B42318]" : "rounded-xl border border-[#BDECCB] bg-[#EAF8F0] px-3 py-2 text-sm font-black text-[#17833F]"}>{clientError || message}</p> : null}
    </div>
  );
}
