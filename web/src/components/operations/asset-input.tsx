"use client";

import { useState } from "react";
import { ImageIcon } from "lucide-react";

type AssetInputProps = {
  label: string;
  fieldName: string;
  currentUrl?: string;
  accept: string;
  helper: string;
};

export function AssetInput({ label, fieldName, currentUrl, accept, helper }: AssetInputProps) {
  const [assetValue, setAssetValue] = useState(currentUrl ?? "");
  const [fileName, setFileName] = useState("");
  const isImage = assetValue && assetValue.startsWith("data:image/") || Boolean(assetValue && !assetValue.match(/\.(mp4|mov|webm|m4v)$/i));

  function handleFile(file?: File) {
    if (!file) return;
    if (accept.startsWith("image") && !file.type.startsWith("image/")) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => setAssetValue(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4">
      <input type="hidden" name={fieldName} value={assetValue} />
      <div className="flex gap-4">
        <div className="grid h-20 w-28 shrink-0 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-[#061331]">
          {isImage ? <img src={assetValue} alt="Selected asset" className="h-full w-full object-cover" /> : <ImageIcon className="text-[#F2C200]" />}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-black text-white">{label}</p>
          <p className="mt-1 text-xs font-semibold leading-5 text-[#AFC1F7]">{helper}</p>
          <label className="mt-3 inline-flex cursor-pointer rounded-2xl bg-[#F2C200] px-4 py-2 text-xs font-black text-[#061331]">
            Choose file
            <input className="hidden" type="file" accept={accept} onChange={(event) => handleFile(event.target.files?.[0])} />
          </label>
          {fileName ? <p className="mt-2 truncate text-[11px] font-semibold text-[#9DB5FF]">Selected: {fileName}</p> : null}
          {!fileName && assetValue ? <p className="mt-2 truncate text-[11px] font-semibold text-[#9DB5FF]">Current asset loaded</p> : null}
          {!fileName && !assetValue ? <p className="mt-2 text-[11px] font-semibold text-[#9DB5FF]">No asset selected yet.</p> : null}
        </div>
      </div>
    </div>
  );
}
