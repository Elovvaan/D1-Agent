import { submitDevAuth } from "@/app/actions/auth-actions";
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
  return "min-h-12 rounded-2xl border border-white/12 bg-white px-4 text-sm font-semibold text-[#061331] outline-none placeholder:text-[#8A94AA]";
}

export default async function SignInPage({ searchParams }: { searchParams?: Promise<{ role?: string; next?: string; status?: string }> }) {
  const params = searchParams ? await searchParams : {};
  const selectedRole = params.role && roleLabels[params.role] ? params.role : "athlete";
  const nextPath = params.next?.startsWith("/") ? params.next : selectedRole === "athlete" ? "/onboarding/athlete" : "";

  return (
    <PublicSiteShell variant="dark">
      <section className="relative overflow-hidden bg-[#061331] text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_18%,rgba(27,63,160,0.45),transparent_34%),linear-gradient(135deg,#061331,#08245B_55%,#061331)]" />
        <div className="absolute -left-20 top-0 h-full w-72 skew-x-[-12deg] bg-[#F2C200]" />
        <div className="relative mx-auto max-w-[960px] px-4 py-14 sm:px-6 lg:px-8">
          <img src="/brand/MYD1 LOGO.png" alt="MyD1" className="mb-6 h-14 w-auto rounded-xl bg-white p-1 object-contain" />
          <header className="mb-6 border-b border-white/12 pb-6">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#F2C200]">Sign In</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white">Create or access your MyD1 account</h1>
            <p className="mt-3 max-w-3xl text-sm font-semibold leading-6 text-[#C8D6FF]">Choose your role, enter your account details, and continue into the correct setup flow.</p>
          </header>
          {params.status ? <div className="mb-6 rounded-2xl border border-red-300/30 bg-red-500/15 px-4 py-3 text-sm font-black text-red-200">{statusMessages[params.status] ?? params.status}</div> : null}
          <section className="rounded-[28px] border border-white/12 bg-white/[0.075] p-5 shadow-[0_24px_70px_rgba(0,0,0,0.22)] backdrop-blur">
            <form action={submitDevAuth} className="grid gap-4">
              <input name="next" type="hidden" value={nextPath} />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">First Name</span><input className={inputClass()} name="firstName" /></label>
                <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">Last Name</span><input className={inputClass()} name="lastName" /></label>
              </div>
              <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">Email</span><input className={inputClass()} name="email" required type="email" /></label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">Password</span><input className={inputClass()} name="password" required type="password" /></label>
                <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">Confirm Password</span><input className={inputClass()} name="confirmPassword" type="password" /></label>
              </div>
              <label className="grid gap-2"><span className="text-xs font-black uppercase tracking-[0.12em] text-[#F2C200]">Role</span><select className={inputClass()} defaultValue={selectedRole} name="role">{Object.entries(roleLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
              <div className="flex flex-col gap-3 sm:flex-row"><button className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#F2C200] px-4 py-2 text-sm font-black text-[#061331] shadow-[0_14px_28px_rgba(242,194,0,0.28)] sm:min-w-44" name="intent" type="submit" value="create">Create Account</button><button className="inline-flex min-h-11 items-center justify-center rounded-xl border border-white/14 bg-white/[0.08] px-4 py-2 text-sm font-black text-white transition hover:border-[#F2C200]/60 sm:min-w-44" name="intent" type="submit" value="login">Log In</button></div>
            </form>
          </section>
        </div>
      </section>
    </PublicSiteShell>
  );
}
