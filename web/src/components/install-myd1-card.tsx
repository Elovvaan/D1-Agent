"use client";

import { useEffect, useState } from "react";

export function InstallMyd1Card() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const dismissed = window.localStorage.getItem("myd1-install-dismissed");
    const standalone = window.matchMedia("(display-mode: standalone)").matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
    const mobile = /Android|iPhone|iPad|iPod/i.test(window.navigator.userAgent);
    setShow(mobile && !standalone && dismissed !== "1");
  }, []);

  if (!show) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-50 mx-auto max-w-md rounded-[26px] border border-[#8CFF00]/40 bg-[#061331] p-4 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#8CFF00]">Install MYD1</p>
      <h2 className="mt-2 text-2xl font-black uppercase">Put MYD1 on your phone</h2>
      <p className="mt-2 text-sm font-semibold leading-6 text-[#C8D6FF]">Get faster access to events, check-in, teams, uniforms, brackets, and your athlete profile.</p>
      <div className="mt-4 rounded-2xl border border-white/10 bg-white/[0.07] p-3 text-xs font-semibold leading-5 text-white">
        iPhone: Share → Add to Home Screen<br />Android: Menu → Install app / Add to Home screen
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button className="rounded-2xl bg-[#8CFF00] px-4 py-3 text-sm font-black uppercase text-black" type="button" onClick={() => setShow(false)}>Got It</button>
        <button className="rounded-2xl border border-white/10 bg-white/[0.08] px-4 py-3 text-sm font-black uppercase text-white" type="button" onClick={() => { window.localStorage.setItem("myd1-install-dismissed", "1"); setShow(false); }}>Not Now</button>
      </div>
    </div>
  );
}
