"use client";

import { useEffect, useState } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export function InstallMyd1Card() {
  const [show, setShow] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("myd1-install-dismissed");
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const userAgent = window.navigator.userAgent;
    const mobile = /Android|iPhone|iPad|iPod/i.test(userAgent);
    const ios = /iPhone|iPad|iPod/i.test(userAgent);
    setIsIos(ios);
    setShow(mobile && !standalone && dismissed !== "1");

    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as BeforeInstallPromptEvent);
      if (mobile && !standalone && dismissed !== "1") setShow(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      window.localStorage.setItem("myd1-install-dismissed", "1");
      setShow(false);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function installApp() {
    if (promptEvent) {
      await promptEvent.prompt();
      const choice = await promptEvent.userChoice;
      if (choice.outcome === "accepted") {
        window.localStorage.setItem("myd1-install-dismissed", "1");
        setShow(false);
      }
      return;
    }
    setShow(true);
  }

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md rounded-[26px] border border-[#8CFF00]/40 bg-[#061331] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8CFF00]">Install MYD1</p>
      <h2 className="mt-2 text-2xl font-black uppercase">Put MYD1 on your phone</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Get faster access to events, check-in, teams, uniforms, brackets, and your athlete profile.</p>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-xs font-semibold leading-5 text-white">
        {promptEvent ? "Tap Install to add MYD1 to your home screen." : isIos ? "iPhone: tap Share, then Add to Home Screen." : "Android: tap Install, or use browser menu, then Add to Home screen."}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-[#8CFF00] px-4 py-3 text-sm font-black uppercase text-black" type="button" onClick={installApp}>{promptEvent ? "Install" : isIos ? "Show Steps" : "Install"}</button>
        <button className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black uppercase text-white" type="button" onClick={() => { window.localStorage.setItem("myd1-install-dismissed", "1"); setShow(false); }}>Not Now</button>
      </div>
    </div>
  );
}
