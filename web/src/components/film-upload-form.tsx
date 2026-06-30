"use client";

import { useRef, useState } from "react";
import { CloudUpload } from "lucide-react";
import { saveFilmUpload } from "@/app/actions/public-profile-actions";

const FILM_MAX_BYTES = 10 * 1024 * 1024;
const FILM_MAX_LABEL = "10 MB";

export function FilmUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [selectedName, setSelectedName] = useState("");

  return (
    <form
      ref={formRef}
      action={saveFilmUpload}
      className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end"
      onSubmit={(event) => {
        const form = formRef.current;
        const input = form?.elements.namedItem("film") as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file) {
          event.preventDefault();
          setError("Choose a video file before uploading.");
          return;
        }
        if (file.size > FILM_MAX_BYTES) {
          event.preventDefault();
          setError(`This V1 local upload flow supports videos up to ${FILM_MAX_LABEL}. Larger film needs the object-storage upload pipeline before it can be accepted.`);
          return;
        }
        setError("");
      }}
    >
      <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
        Film title
        <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="title" placeholder="Game film title" required />
      </label>
      <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
        Video file
        <input
          className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold text-[#66718F]"
          name="film"
          type="file"
          accept="video/*"
          required
          onChange={(event) => {
            const file = event.currentTarget.files?.[0];
            setSelectedName(file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)` : "");
            setError(file && file.size > FILM_MAX_BYTES ? `Choose a video under ${FILM_MAX_LABEL}.` : "");
          }}
        />
        <span className="text-xs font-semibold text-[#66718F]">Current V1 limit: {FILM_MAX_LABEL}. Larger uploads are blocked before submit.</span>
        {selectedName ? <span className="text-xs font-semibold text-[#1B3FA0]">{selectedName}</span> : null}
      </label>
      <button className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.28)] transition hover:brightness-95" type="submit">
        <CloudUpload size={17} /> Upload
      </button>
      {error ? (
        <div className="rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318] md:col-span-3" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
