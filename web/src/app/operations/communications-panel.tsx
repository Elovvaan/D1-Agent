import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { ExternalLink, Inbox, Mail, MessageSquare, Send } from "lucide-react";
import { myd1SocialChannels } from "@/lib/social-channels";
import { recordInboundMessage } from "./actions";

type InboundMessage = {
  id: string;
  senderName?: string;
  senderContact?: string;
  source?: string;
  subject?: string;
  body?: string;
  status?: string;
  receivedAt?: string;
};

function readUserState<T>(fileName: string, fallback: T): T {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", fileName);
    if (!existsSync(filePath)) return fallback;
    return JSON.parse(readFileSync(filePath, "utf8")) as T;
  } catch {
    return fallback;
  }
}

export function OperationsCommunicationsPanel() {
  const inbox = readUserState<{ items?: InboundMessage[] }>("operator-inbox.json", { items: [] }).items ?? [];
  const unread = inbox.filter((item) => item.status !== "closed").length;
  const connectedChannels = myd1SocialChannels.filter((channel) => channel.status === "connected-url" && channel.url);
  const pendingChannels = myd1SocialChannels.filter((channel) => channel.status !== "connected-url");

  return (
    <section className="mt-6 rounded-[28px] border border-white/10 bg-white/[0.08] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)]" id="communications">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9DB5FF]">Communications intake</p>
          <h2 className="mt-2 text-2xl font-black text-white">Email, Facebook, website, and contact requests</h2>
          <p className="mt-2 max-w-3xl text-sm font-semibold leading-6 text-[#CAD7FF]">This is the private inbox for people trying to reach you. Connected social URLs appear here now; Meta API message sync is the next layer.</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#F2C200] text-[#061331]">
          <Inbox size={22} />
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-3">
        {connectedChannels.map((channel) => (
          <a className="rounded-2xl border border-white/10 bg-[#071A43] p-4 transition hover:border-[#F2C200]" href={channel.url} key={channel.id} rel="noreferrer" target="_blank">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-black text-white">{channel.label}</div>
                <div className="mt-1 text-xs font-semibold text-[#80F0A6]">Connected URL</div>
              </div>
              <ExternalLink className="text-[#F2C200]" size={18} />
            </div>
          </a>
        ))}
        {pendingChannels.map((channel) => (
          <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4" key={channel.id}>
            <div className="text-sm font-black text-white">{channel.label}</div>
            <div className="mt-1 text-xs font-semibold text-[#FFCE73]">URL needed</div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
        <form action={recordInboundMessage} className="grid gap-3 rounded-2xl border border-white/10 bg-[#071A43] p-4">
          <div className="flex items-center gap-2 text-sm font-black text-white"><Mail size={18} className="text-[#F2C200]" /> Capture message</div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-white">Name<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="senderName" /></label>
            <label className="grid gap-2 text-sm font-black text-white">Contact<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="senderContact" /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-black text-white">Source<select className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="source" defaultValue="facebook"><option value="email">Email</option><option value="facebook">Facebook</option><option value="website">Website</option><option value="instagram">Instagram</option><option value="phone">Phone</option><option value="other">Other</option></select></label>
            <label className="grid gap-2 text-sm font-black text-white">Subject<input className="rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="subject" required /></label>
          </div>
          <label className="grid gap-2 text-sm font-black text-white">Message<textarea className="min-h-28 rounded-2xl border border-white/10 bg-white px-4 py-3 text-sm font-black text-[#061331]" name="body" required /></label>
          <button className="w-fit rounded-2xl bg-[#F2C200] px-5 py-3 text-sm font-black text-[#061331]" type="submit"><Send className="mr-2 inline" size={16} /> Save Message</button>
        </form>

        <div className="rounded-2xl border border-white/10 bg-[#071A43] p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white">Inbox</div>
              <div className="mt-1 text-xs font-semibold text-[#CAD7FF]">{unread} open messages</div>
            </div>
            <MessageSquare className="text-[#F2C200]" size={22} />
          </div>
          <div className="mt-4 grid gap-3">
            {inbox.slice(0, 6).map((item) => (
              <div className="rounded-2xl border border-white/10 bg-[#061331] p-4" key={item.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-black text-white">{item.subject || "Message"}</div>
                    <div className="mt-1 text-xs font-semibold text-[#9DB5FF]">{item.source || "source"} {item.senderName ? `- ${item.senderName}` : ""}</div>
                  </div>
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-black text-[#F2C200]">{item.status || "open"}</span>
                </div>
                <p className="mt-3 line-clamp-3 text-sm font-semibold leading-6 text-[#CAD7FF]">{item.body}</p>
                <div className="mt-3 text-xs font-semibold text-[#7F94D6]">{item.receivedAt ? new Date(item.receivedAt).toLocaleString() : ""}</div>
              </div>
            ))}
            {!inbox.length ? <div className="rounded-2xl border border-white/10 bg-[#061331] p-4 text-sm font-semibold text-[#CAD7FF]">No inbound messages captured yet.</div> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
