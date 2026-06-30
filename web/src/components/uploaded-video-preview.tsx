"use client";

import { useMemo, useState } from "react";

type UploadedVideoPreviewProps = {
  src: string;
  title: string;
};

export function UploadedVideoPreview({ src, title }: UploadedVideoPreviewProps) {
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const cacheSafeSrc = useMemo(() => (src ? `${src}${src.includes("?") ? "&" : "?"}preview=1` : ""), [src]);

  if (!src || failed) {
    return (
      <div className="mt-3 grid aspect-video place-items-center rounded-xl border border-[#DDE3EC] bg-[#FAFBFD] p-6 text-center">
        <div>
          <p className="text-sm font-black text-[#0A1A3F]">Preview unavailable</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#66718F]">The file is saved. Open the original if this browser cannot play the video codec.</p>
          {src ? <a className="mt-4 inline-flex rounded-xl bg-[#1B3FA0] px-4 py-2 text-sm font-black text-white" href={src}>Open Original Video</a> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-3 overflow-hidden rounded-xl border border-[#DDE3EC] bg-[#0A1A3F]">
      {!ready ? (
        <div className="absolute inset-0 z-10 grid place-items-center bg-[#0A1A3F] text-white">
          <p className="text-sm font-black">Preparing playback</p>
        </div>
      ) : null}
      <video
        className="aspect-video w-full bg-[#0A1A3F]"
        src={cacheSafeSrc}
        controls
        muted
        playsInline
        preload="auto"
        aria-label={title}
        onCanPlay={() => setReady(true)}
        onLoadedData={() => setReady(true)}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
