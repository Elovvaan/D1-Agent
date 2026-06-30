import { submitDevAuth } from "@/app/actions/auth-actions";
import { Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const roleLabels: Record<string, string> = {
  athlete: "Athlete",
  coach: "Coach",
  recruiter: "Recruiter",
  media_partner: "Media Partner",
  admin: "Admin / School"
};

const statusMessages: Record<string, string> = {
  "invalid-role": "Choose a valid role.",
  "missing-fields": "Email and password are required.",
  "missing-name": "First and last name are required to create an account.",
  "password-mismatch": "Passwords do not match.",
  "account-exists": "An account already exists for that email and role. Use Log In.",
  "login-not-found": "No local dev account was found for that email and role."
};

function inputClass() {
  return "min-h-11 rounded-2xl border border-[#C7CDD6] bg-white px-4 text-sm font-semibold text-[#0A1A3F] outline-none placeholder:text-[#8A94AA]";
}

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ role?: string; next?: string; status?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedRole = params.role && roleLabels[params.role] ? params.role : "athlete";
  const nextPath = params.next?.startsWith("/") ? params.next : selectedRole === "athlete" ? "/onboarding/athlete" : "";

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Sign In"
          title="Create or access your MyD1 account"
          description="Choose your role, enter your account details, and continue into the correct setup flow. New accounts start blank."
        />
        {params.status ? (
          <div className="mb-6 rounded-2xl border border-[#FFD0D0] bg-[#FFF0F0] px-4 py-3 text-sm font-black text-[#B42318]">
            {statusMessages[params.status] ?? params.status}
          </div>
        ) : null}
        <Card>
          <form action={submitDevAuth} className="grid gap-4">
            <input name="next" type="hidden" value={nextPath} />
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">First Name</span>
                <input className={inputClass()} name="firstName" placeholder="First name" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Last Name</span>
                <input className={inputClass()} name="lastName" placeholder="Last name" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Email</span>
              <input className={inputClass()} name="email" placeholder="you@example.com" required type="email" />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Password</span>
                <input className={inputClass()} name="password" required type="password" />
              </label>
              <label className="grid gap-2">
                <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Confirm Password</span>
                <input className={inputClass()} name="confirmPassword" type="password" />
              </label>
            </div>
            <label className="grid gap-2">
              <span className="text-xs font-black uppercase tracking-[0.12em] text-[#66718F]">Role</span>
              <select className={inputClass()} defaultValue={selectedRole} name="role">
                {Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="inline-flex min-h-10 items-center justify-center rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#0A1A3F] shadow-[0_14px_28px_rgba(242,194,0,0.28)] transition hover:brightness-95 sm:min-w-44" name="intent" type="submit" value="create">Create Account</button>
              <button className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#C7CDD6] bg-white px-4 py-2 text-sm font-black text-[#0A1A3F] transition hover:bg-[#F7F9FC] sm:min-w-44" name="intent" type="submit" value="login">Log In</button>
            </div>
          </form>
        </Card>
      </section>
    </PublicSiteShell>
  );
}
