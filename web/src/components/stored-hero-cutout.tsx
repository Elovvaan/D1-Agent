"use client";

import { useEffect, useState } from "react";

export const HERO_PLAYER_PHOTO_PREVIEW_KEY = "myd1-hero-player-photo-preview";
export const HERO_PLAYER_PHOTO_UPDATED_EVENT = "myd1-hero-player-photo-updated";

function isUsableImageSrc(value: string | null) {
  return Boolean(value && (/^data:image\//.test(value) || value.startsWith("/") || /^https?:\/\//.test(value)));
}

function SilhouettePlaceholder() {
  return (
    <div className="absolute bottom-0 right-12 h-64 w-44" aria-hidden="true">
      <div className="absolute bottom-0 left-1/2 h-48 w-28 -translate-x-1/2 rounded-t-[80px] bg-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.32)]" />
      <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-white/20" />
      <div className="absolute bottom-16 left-0 h-20 w-12 rotate-[-18deg] rounded-full bg-white/12" />
      <div className="absolute bottom-16 right-0 h-20 w-12 rotate-[18deg] rounded-full bg-white/12" />
    </div>
  );
}

export function readStoredHeroPlayerPhoto() {
  if (typeof window === "undefined") return "";
  const storedSrc = localStorage.getItem(HERO_PLAYER_PHOTO_PREVIEW_KEY);
  return isUsableImageSrc(storedSrc) ? storedSrc ?? "" : "";
}

export function writeStoredHeroPlayerPhoto(src: string) {
  localStorage.setItem(HERO_PLAYER_PHOTO_PREVIEW_KEY, src);
  window.dispatchEvent(new Event(HERO_PLAYER_PHOTO_UPDATED_EVENT));
}

export function clearStoredHeroPlayerPhoto() {
  localStorage.removeItem(HERO_PLAYER_PHOTO_PREVIEW_KEY);
  window.dispatchEvent(new Event(HERO_PLAYER_PHOTO_UPDATED_EVENT));
}

export function StoredHeroCutout({ athleteName }: { athleteName: string }) {
  const [mounted, setMounted] = useState(false);
  const [cutoutSrc, setCutoutSrc] = useState("");

  useEffect(() => {
    const syncCutout = () => {
      const nextSrc = readStoredHeroPlayerPhoto();
      setCutoutSrc(isUsableImageSrc(nextSrc) ? nextSrc : "");
    };

    setMounted(true);
    syncCutout();
    window.addEventListener("storage", syncCutout);
    window.addEventListener(HERO_PLAYER_PHOTO_UPDATED_EVENT, syncCutout);

    return () => {
      window.removeEventListener("storage", syncCutout);
      window.removeEventListener(HERO_PLAYER_PHOTO_UPDATED_EVENT, syncCutout);
    };
  }, []);

  if (!mounted) {
    return null;
  }

  if (!cutoutSrc) {
    return <SilhouettePlaceholder />;
  }

  return (
    <img
      src={cutoutSrc}
      alt={`${athleteName} player cutout`}
      className="absolute bottom-0 right-3 h-full max-h-[390px] w-full object-contain object-bottom drop-shadow-[0_24px_36px_rgba(0,0,0,0.45)]"
      onError={() => {
        clearStoredHeroPlayerPhoto();
        setCutoutSrc("");
      }}
    />
  );
}
