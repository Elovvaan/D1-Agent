"use client";

import { useEffect, useRef, useState } from "react";

const LOCAL_HERO_PLAYER_KEY = "myd1-hero-player-photo-preview";
const HERO_IMAGE_MAX_BYTES = 5 * 1024 * 1024;

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
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const saveSrc = (nextSrc: string) => {
    try {
      window.localStorage.setItem(LOCAL_HERO_PLAYER_KEY, nextSrc);
      setClientSrc(nextSrc);
      setMessage("Player photo applied.");
      window.dispatchEvent(new Event("myd1-hero-player-updated"));
    } catch {
      setMessage("Image is too large for browser save. Choose a smaller cutout PNG.");
    }
  };

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

  return (
    <>
      {clientSrc ? <img src={clientSrc} alt={label} className={className} /> : <HeroFallback />}
      <div className="absolute bottom-4 right-4 z-20 flex flex-col items-end gap-2">
        <input
          ref={inputRef}
          className="hidden"
          type="file"
          accept="image/*"
          onChange={(event) => {
            const file = event.target.files?.[0];
            setMessage("");
            if (!file) return;
            if (!file.type.startsWith("image/")) {
              setMessage("Choose an image file.");
              return;
            }
            if (file.size > HERO_IMAGE_MAX_BYTES) {
              setMessage("Choose an image under 5 MB.");
              return;
            }
            const reader = new FileReader();
            reader.onload = () => saveSrc(String(reader.result ?? ""));
            reader.onerror = () => setMessage("Could not load that image.");
            reader.readAsDataURL(file);
          }}
        />
        {message ? <span className="rounded-full bg-white px-3 py-1 text-xs font-black text-[#061331] shadow-lg">{message}</span> : null}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="rounded-full bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331] shadow-[0_14px_28px_rgba(242,194,0,0.25)] transition hover:-translate-y-0.5"
        >
          {clientSrc ? "Change Player Photo" : "Upload Player Photo"}
        </button>
      </div>
    </>
  );
}
