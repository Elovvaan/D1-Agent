"use client";

import { useEffect, useState } from "react";

const LOCAL_HERO_PLAYER_KEY = "myd1-hero-player-photo-preview";

export function StoredHeroCutout({ src, label, className }: { src?: string; label: string; className: string }) {
  const [clientSrc, setClientSrc] = useState<string | undefined>(src);

  useEffect(() => {
    const readStored = () => {
      const stored = window.localStorage.getItem(LOCAL_HERO_PLAYER_KEY);
      setClientSrc(stored || src);
    };
    readStored();
    window.addEventListener("storage", readStored);
    window.addEventListener("myd1-hero-player-updated", readStored);
    return () => {
      window.removeEventListener("storage", readStored);
      window.removeEventListener("myd1-hero-player-updated", readStored);
    };
  }, [src]);

  if (!clientSrc) return null;
  return <img src={clientSrc} alt={label} className={className} />;
}
