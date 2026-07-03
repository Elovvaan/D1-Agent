import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { saveProfileDetails } from "@/app/actions/public-profile-actions";
import { AppShell } from "@/components/app-shell";
import { Button, Card, SectionTitle } from "@/components/design-system";
import { HeroPlayerPhotoForm } from "@/components/hero-player-photo-form";
import { ProfilePictureForm } from "@/components/profile-picture-form";
import { PublicProfileShareControls } from "@/components/public-profile-share";
import { publicProfileUrl as buildPublicProfileUrl } from "@/lib/domain-config";
import { getAthleteHeroMedia, toTitle } from "@/lib/data/services";
import { athleteSkillOptions } from "@/lib/athlete-skills";

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SavedProfile = { fullName?: string; sport?: string; primaryPosition?: string; secondaryPosition?: string; jerseyNumber?: string; schoolName?: string; classYear?: number; hometown?: string; bio?: string; avatarUrl?: string; avatarUpdatedAt?: string; skills?: string[] };
type Session = { fullName?: string };

function readJson<T>(parts: string[], fallback: T): T { try { const p = resolve(process.cwd(), "..", ...parts); if (!existsSync(p)) return fallback; return JSON.parse(readFileSync(p, "utf8")) as T; } catch { return fallback; } }
function text(v?: string | number) { return v === undefined || v === null ? "" : String(v); }
function initials(name: string) { return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase(); }
function cacheSafeUrl(url?: string, version?: string) { if (!url) return ""; return `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version || "current")}`; }
function Field({ label, name, value, type = "text" }: { label: string; name: string; value?: string | number; type?: string }) { return <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">{label}<input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name={name} defaultValue={text(value)} type={type} /></label>; }
function Blank({ title, detail }: { title: string; detail: string }) { return <div className="rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4"><div className="text-sm font-black text-[#0A1A3F]">{title}</div><p className="mt-1 text-xs font-semibold text-[#66718F]">{detail}</p></div>; }
function StatusBanner({ status }: { status?: string }) {
  if (!status) return null;
  const isError = status.endsWith("error");
  const verb = status.endsWith("uploaded") ? "uploaded" : "saved";
  const label = toTitle(status.replace(/-(saved|uploaded|error)$/, ""));
  return (
    <div
      className={
        isError
          ? "rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]"
          : "rounded-2xl border border-[#BDECCB] bg-[#EAF8F0] px-4 py-3 text-sm font-black text-[#17833F]"
      }
      role={isError ? "alert" : "status"}
    >
      {isError ? `${label} could not be ${verb}. Please try again.` : `${label} ${verb}.`}
    </div>
  );
}

export default async function ProfilePage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const saved = readJson<SavedProfile>(["data", "user-state", "profile.json"], {});
  const session = readJson<Session>(["data", "session", "current-user.json"], {});
  const hero = getAthleteHeroMedia();
  const fullName = text(saved.fullName || session.fullName).trim();
  const identity = [saved.primaryPosition, saved.sport, saved.schoolName, saved.classYear ? `Class of ${saved.classYear}` : ""].filter(Boolean).join(" • ");
  const publicPath = "/athletes/athlete-current";
  const avatarUrl = cacheSafeUrl(saved.avatarUrl, saved.avatarUpdatedAt);

  return <AppShell><div className="grid gap-6"><StatusBanner status={params.status} /><section className="overflow-hidden rounded-[28px] border border-[#DDE3EC] bg-white shadow-[0_18px_55px_rgba(10,26,63,0.08)]"><div className="relative min-h-[330px] bg-[linear-gradient(135deg,#061331,#123B91_62%,#071634)] px-6 py-6 text-white lg:px-8"><div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:22px_22px]" /><div className="relative z-10 flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#F2C200]">Profile Studio</p><h1 className="mt-3 min-h-12 text-4xl font-black tracking-tight lg:text-5xl">{fullName}</h1><p className="mt-3 min-h-6 text-sm font-semibold text-[#DDE8FF]">{identity}</p></div><div className="flex flex-wrap gap-2"><Button href={publicPath} variant="cta">View Public Profile</Button><PublicProfileShareControls profileUrl={buildPublicProfileUrl(publicPath)} title="Public athlete profile" /></div></div><div className="absolute bottom-0 right-4 hidden h-[106%] w-[38%] lg:block"><HeroPlayerPhotoForm athleteName={fullName || "Athlete"} currentPlayerCutoutUrl={hero.playerCutoutUrl} /></div></div><div className="relative z-20 -mt-14 px-6 pb-6 lg:px-8"><div className="rounded-[24px] border border-[#DDE3EC] bg-white p-5 shadow-[0_18px_55px_rgba(10,26,63,0.08)]"><ProfilePictureForm athleteName={fullName || "Athlete"} currentAvatarUrl={avatarUrl} initials={initials(fullName)} /></div></div></section><div className="grid gap-6 xl:grid-cols-[1fr_380px]"><div className="grid gap-6"><Card><SectionTitle title="Profile Details" caption="Only information entered by the athlete appears here." /><form action={saveProfileDetails} className="grid gap-4"><div className="grid gap-4 md:grid-cols-2"><Field label="Display name" name="fullName" value={fullName} /><Field label="School / team" name="schoolName" value={saved.schoolName} /><Field label="Sport" name="sport" value={saved.sport} /><Field label="Class year" name="classYear" value={saved.classYear} type="number" /><Field label="Primary position" name="primaryPosition" value={saved.primaryPosition} /><Field label="Secondary position" name="secondaryPosition" value={saved.secondaryPosition} /><Field label="Jersey number" name="jerseyNumber" value={saved.jerseyNumber} /><Field label="Location" name="hometown" value={saved.hometown} /></div><label className="grid gap-2 text-sm font-black text-[#0A1A3F]">Bio<textarea className="min-h-28 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="bio" defaultValue={text(saved.bio)} /></label><div className="grid gap-2"><span className="text-sm font-black text-[#0A1A3F]">Skills</span><div className="grid grid-cols-2 gap-2 sm:grid-cols-3">{athleteSkillOptions.map((skill) => <label key={skill} className="flex items-center gap-2 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-xs font-bold text-[#0A1A3F]"><input type="checkbox" name="skills" value={skill} defaultChecked={saved.skills?.includes(skill)} />{skill}</label>)}</div></div><Button variant="primary" className="w-fit">Save Profile</Button></form></Card><Card><SectionTitle title="Media" caption="Upload real film, highlights, photos, and profile media from one workspace." /><div className="grid gap-4 md:grid-cols-3"><Blank title="Film" detail="No film uploaded yet." /><Blank title="Highlights" detail="No highlights uploaded yet." /><Blank title="Photos" detail="No photos uploaded yet." /></div></Card><Card><SectionTitle title="Activity" caption="Posts and updates will appear after real activity exists." /><Blank title="Updates" detail="No updates posted yet." /></Card></div><aside className="grid content-start gap-6"><Card><SectionTitle title="Quick Actions" /><div className="grid gap-2"><Button href="/film" variant="secondary">Upload Film</Button><Button href="/highlights" variant="secondary">Upload Highlight</Button><Button href="/opportunities" variant="secondary">Find Opportunities</Button><Button href="/messages" variant="secondary">Messages</Button></div></Card><Card><SectionTitle title="Status" /><div className="grid gap-3"><Blank title="Trust Score" detail="No verified signals yet." /><Blank title="Completion" detail="Profile is blank until saved." /><Blank title="Recruiting" detail="No recruiting activity yet." /></div></Card></aside></div></div></AppShell>;
}
