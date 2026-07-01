"use client";

import { useEffect, useState } from "react";

const LOCAL_HERO_PLAYER_KEY = "myd1-hero-player-photo-preview";

function HeroFallback() {
  return (
    <div className="absolute bottom-0 right-12 h-64 w-44">
      <div className="absolute bottom-0 left-1/2 h-48 w-28 -translate-x-1/2 rounded-t-[80px] bg-white/15 shadow-[0_24px_50px_rgba(0,0,0,0.32)]" />
      <div className="absolute left-1/2 top-0 h-20 w-20 -translate-x-1/2 rounded-full bg-white/20" />
      <div className="absolute bottom-16 left-0 h-20 w-12 rotate-[-18deg] rounded-full bg-white/12" />
      <div className="absolute bottom-16 right-0 h-20 w-12 rotate-[18deg] rounded-full bg-white/12" />
    </div>
  );
}

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

  if (!clientSrc) return <HeroFallback />;
  return <img src={clientSrc} alt={label} className={className} />;
}
