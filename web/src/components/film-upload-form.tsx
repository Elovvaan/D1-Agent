"use client";

import { useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { CloudUpload } from "lucide-react";
import { saveFilmUpload } from "@/app/actions/public-profile-actions";

const FILM_MAX_BYTES = 10 * 1024 * 1024;
const FILM_MAX_LABEL = "10 MB";

function UploadButton() {
  const { pending } = useFormStatus();

  return (
    <button
      className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.28)] transition hover:brightness-95 disabled:cursor-wait disabled:opacity-75"
      disabled={pending}
      type="submit"
    >
      <CloudUpload size={17} /> {pending ? "Uploading..." : "Upload"}
    </button>
  );
}

export function FilmUploadForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const previewUrl = useMemo(() => (selectedFile ? URL.createObjectURL(selectedFile) : ""), [selectedFile]);

  return (
    <form
      ref={formRef}
      action={saveFilmUpload}
      className="grid gap-4"
      onSubmit={(event) => {
        const form = formRef.current;
        const input = form?.elements.namedItem("film") as HTMLInputElement | null;
        const file = input?.files?.[0];
        if (!file) {
          event.preventDefault();
          setError("Choose a video file before uploading.");
          return;
        }
        if (!file.type.startsWith("video/")) {
          event.preventDefault();
          setError("Choose a video file.");
          return;
        }
        if (file.size > FILM_MAX_BYTES) {
          event.preventDefault();
          setError(`Choose a video under ${FILM_MAX_LABEL}.`);
          return;
        }
        setError("");
      }}
    >
      <div className="grid gap-4 md:grid-cols-[1fr_1fr_auto] md:items-end">
        <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
          Film title
          <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="title" required />
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
              const file = event.currentTarget.files?.[0] ?? null;
              setSelectedFile(file);
              setError(file && file.size > FILM_MAX_BYTES ? `Choose a video under ${FILM_MAX_LABEL}.` : "");
            }}
          />
          <span className="text-xs font-semibold text-[#66718F]">Limit: {FILM_MAX_LABEL}.</span>
        </label>
        <UploadButton />
      </div>
      {selectedFile ? (
        <div className="rounded-2xl border border-[#DDE3EC] bg-[#FAFBFD] p-3">
          <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-black text-[#0A1A3F]">Ready to upload</span>
            <span className="text-xs font-semibold text-[#66718F]">{selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(1)} MB)</span>
          </div>
          <video className="aspect-video w-full rounded-xl bg-[#0A1A3F]" src={previewUrl} controls muted playsInline preload="metadata" />
        </div>
      ) : null}
      {error ? (
        <div className="rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]" role="alert">
          {error}
        </div>
      ) : null}
    </form>
  );
}
