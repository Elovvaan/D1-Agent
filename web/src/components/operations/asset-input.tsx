"use client";

import { useEffect, useRef, useState } from "react";
import { ImageIcon, X } from "lucide-react";

type AssetInputProps = {
  label: string;
  fieldName: string;
  currentUrl?: string;
  accept: string;
  helper: string;
};

function fileFieldName(fieldName: string) {
  if (fieldName === "coverImageUrl") return "coverImageFile";
  if (fieldName === "badgeImageUrl") return "badgeImageFile";
  if (fieldName === "featureVideoUrl") return "featureVideoFile";
  return `${fieldName}File`;
}

function previewUrl(url: string) {
  if (!url || url.startsWith("data:")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(url)}`;
}

export function AssetInput({ label, fieldName, currentUrl, accept, helper }: AssetInputProps) {
  const [assetValue, setAssetValue] = useState(currentUrl ?? "");
  const [fallbackValue, setFallbackValue] = useState(currentUrl ?? "");
  const [fileName, setFileName] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const isImage = assetValue.startsWith("data:image/") || Boolean(assetValue && !assetValue.match(/\.(mp4|mov|webm|m4v)$/i));

  useEffect(() => {
    setAssetValue(currentUrl ?? "");
    setFallbackValue(currentUrl ?? "");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }, [currentUrl]);

  function handleFile(file?: File) {
    if (!file) return;
    if (accept.startsWith("image") && !file.type.startsWith("image/")) return;
    if (accept.startsWith("video") && !file.type.startsWith("video/")) return;
    setFileName(file.name);
    setFallbackValue("");
    const reader = new FileReader();
    reader.onload = () => setAssetValue(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  function clearAsset() {
    setAssetValue("");
    setFallbackValue("");
    setFileName("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
      <input type="hidden" name={fieldName} value={fallbackValue} />
      <div className="flex gap-4">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#061331]">
          {isImage ? <img src={previewUrl(assetValue)} alt="Selected asset" className="h-full w-full object-cover" /> : <ImageIcon className="text-[#F2C200]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#AFC1F7]">{helper}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <label className="inline-flex cursor-pointer rounded-2xl bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331]">
              Choose file
              <input ref={inputRef} className="hidden" type="file" name={fileFieldName(fieldName)} accept={accept} onChange={(event) => handleFile(event.target.files?.[0])} />
            </label>
            {assetValue ? <button className="inline-flex items-center gap-1 rounded-2xl border border-white/15 bg-black/30 px-4 py-2 text-xs font-black text-white" type="button" onClick={clearAsset}><X size={13} /> Clear</button> : null}
          </div>
          {fileName ? <p className="mt-2 truncate text-[11px] font-semibold text-[#8CFF00]">Selected new asset: {fileName}</p> : null}
          {!fileName && assetValue ? <p className="mt-2 truncate text-[11px] font-semibold text-[#9DB5FF]">Current asset loaded</p> : null}
          {!fileName && !assetValue ? <p className="mt-2 text-[11px] font-semibold text-[#9DB5FF]">No asset selected. Save to clear this slot.</p> : null}
        </div>
      </div>
    </div>
  );
}
