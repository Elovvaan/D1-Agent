"use client";

import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";

const buttonClasses =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-4 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#F7F9FC]";

function resolveShareUrl(profileUrl: string) {
  return new URL(profileUrl, window.location.origin).toString();
}

export function PublicProfileShareControls({
  profileUrl,
  title
}: {
  profileUrl: string;
  title: string;
}) {
  const [copied, setCopied] = useState(false);
  const [message, setMessage] = useState("");

  async function copyLink() {
    const absoluteUrl = resolveShareUrl(profileUrl);
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard API unavailable");
      }
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setMessage("Public profile link copied.");
      window.setTimeout(() => {
        setCopied(false);
        setMessage("");
      }, 1800);
      return true;
    } catch {
      setMessage(`Copy failed. Public URL: ${absoluteUrl}`);
      return false;
    }
  }

  async function shareProfile() {
    const absoluteUrl = resolveShareUrl(profileUrl);
    try {
      if (navigator.share) {
        await navigator.share({ title, url: absoluteUrl });
        setMessage("Share sheet opened.");
        window.setTimeout(() => setMessage(""), 1800);
        return;
      }
    } catch {
      setMessage("Share was not completed. Copying the link instead.");
    }

    await copyLink();
  }

  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <button className={buttonClasses} onClick={shareProfile} type="button">
          <Share2 size={16} />
          Share Profile
        </button>
        <button className={buttonClasses} onClick={copyLink} type="button">
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? "Copied" : "Copy Link"}
        </button>
      </div>
      {message ? <p className="mt-2 text-xs font-black text-[#DDE8FF]">{message}</p> : null}
    </div>
  );
}
