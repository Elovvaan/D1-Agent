"use client";

import { useEffect, useState } from "react";

const LOCAL_AVATAR_KEY = "myd1-profile-picture-preview";

export function StoredAvatar({ src, label, initials, className = "h-full w-full object-cover" }: { src?: string; label: string; initials: string; className?: string }) {
  const [clientSrc, setClientSrc] = useState<string | undefined>(src);

  useEffect(() => {
    const stored = window.localStorage.getItem(LOCAL_AVATAR_KEY);
    if (stored) setClientSrc(stored);
  }, []);

  if (clientSrc) return <img src={clientSrc} alt={label} className={className} />;
  return <>{initials}</>;
}
