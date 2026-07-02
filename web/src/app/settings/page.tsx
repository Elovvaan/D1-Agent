import { Bell, LockKeyhole, LogOut, Mail, ShieldCheck } from "lucide-react";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { recordUnavailableAction, saveAccountPreferences } from "@/app/actions/public-profile-actions";
import { signOutUser } from "@/app/actions/auth-actions";
import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, ObjectList, PageHeader, SectionTitle, StatCard } from "@/components/design-system";

type AccountSettings = {
  email?: string;
  recruitingDigest?: boolean;
  messageAlerts?: boolean;
  profilePrivacySummary?: string;
};

const statusCopy: Record<string, string> = {
  "settings-saved": "Account settings saved.",
  "settings-error": "Account settings could not be saved. Please try again.",
  "password-security-unavailable": "Password and security changes are gated until authentication is connected.",
  "logout-unavailable": "Logout is gated until authentication is connected."
};

function readAccountSettings(): AccountSettings {
  try {
    const filePath = resolve(process.cwd(), "..", "data", "user-state", "account-settings.json");
    if (!existsSync(filePath)) return {};
    return JSON.parse(readFileSync(filePath, "utf8")) as AccountSettings;
  } catch {
    return {};
  }
}

function GatedSettingsAction({ action, children }: { action: string; children: React.ReactNode }) {
  return (
    <form action={recordUnavailableAction}>
      <input name="returnTo" type="hidden" value="/settings" />
      <input name="action" type="hidden" value={action} />
      <Button variant="secondary">{children}</Button>
    </form>
  );
}

export default async function SettingsPage({ searchParams }: { searchParams?: Promise<{ status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const settings = readAccountSettings();

  return (
    <AppShell>
      <PageHeader
        eyebrow="Account"
        title="Settings"
        description="Account-level email, notification, privacy, security, and session preferences. Athlete profile data stays on Profile."
        action={<Badge tone="silver">Account settings</Badge>}
      />
      {params.status && statusCopy[params.status] ? (
        <div
          className={
            params.status.endsWith("-error")
              ? "mb-6 rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]"
              : "mb-6 rounded-2xl border border-[#F7DC67] bg-[#FFF5C7] px-4 py-3 text-sm font-black text-[#745E00]"
          }
          role={params.status.endsWith("-error") ? "alert" : "status"}
        >
          {statusCopy[params.status]}
        </div>
      ) : null}
      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <Card>
          <SectionTitle title="Account Preferences" caption="These settings do not edit athlete recruiting profile data." />
          <form action={saveAccountPreferences} className="grid gap-4">
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
              Account email
              <input className="rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold" name="email" defaultValue={settings.email ?? "jayden@example.com"} type="email" />
            </label>
            <div className="grid gap-3 rounded-2xl border border-[#E4E9F1] bg-[#FAFBFD] p-4">
              <label className="flex items-center justify-between gap-3 text-sm font-black text-[#0A1A3F]">
                Recruiting digest emails
                <input name="recruitingDigest" type="checkbox" defaultChecked={settings.recruitingDigest ?? true} />
              </label>
              <label className="flex items-center justify-between gap-3 text-sm font-black text-[#0A1A3F]">
                Message alerts
                <input name="messageAlerts" type="checkbox" defaultChecked={settings.messageAlerts ?? true} />
              </label>
            </div>
            <label className="grid gap-2 text-sm font-black text-[#0A1A3F]">
              Privacy preference summary
              <textarea className="min-h-24 rounded-xl border border-[#C7CDD6] bg-white px-3 py-2 text-sm font-semibold leading-6" name="profilePrivacySummary" defaultValue={settings.profilePrivacySummary ?? "Keep direct contact information private and route recruiting interest through D1."} />
            </label>
            <Button variant="primary" className="w-fit">Save Account Settings</Button>
          </form>
        </Card>
        <div className="grid h-fit gap-6">
          <div className="grid gap-4">
            <StatCard label="Security" value="Gated" detail="Password/security requires connected auth." icon={LockKeyhole} tone="yellow" />
            <StatCard label="Notifications" value={settings.messageAlerts === false ? "Limited" : "Active"} detail="Message and recruiting notifications." icon={Bell} />
          </div>
          <Card>
            <SectionTitle title="Account Actions" />
            <ObjectList
              items={[
                { title: "Email", detail: settings.email ?? "jayden@example.com", badge: "Account", icon: Mail, tone: "blue" },
                { title: "Privacy", detail: "Private contact info remains gated.", badge: "Active", icon: ShieldCheck, tone: "green" }
              ]}
            />
            <div className="mt-5 grid gap-3">
              <GatedSettingsAction action="password-security"><LockKeyhole size={16} /> Password / Security</GatedSettingsAction>
              <form action={signOutUser}>
                <Button variant="secondary"><LogOut size={16} /> Logout</Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
