import { Camera, GraduationCap, ShieldCheck, UserRound, Users } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const roleLabels: Record<string, string> = {
  athlete: "Athlete",
  coach: "Coach",
  recruiter: "Recruiter",
  media_partner: "Media Partner",
  admin: "Admin / School"
};

const signInRoles = [
  { label: "Athlete", href: "/command-center?role=athlete", icon: UserRound },
  { label: "Coach", href: "/coach?role=coach", icon: Users },
  { label: "Recruiter", href: "/recruiter?role=recruiter", icon: GraduationCap },
  { label: "Media Partner", href: "/media?role=media_partner", icon: Camera },
  { label: "Admin / School", href: "/admin?role=admin", icon: ShieldCheck }
] as const;

export default async function SignInPage({
  searchParams
}: {
  searchParams?: Promise<{ role?: string; next?: string }>;
}) {
  const params = searchParams ? await searchParams : {};
  const selectedRole = params.role && roleLabels[params.role] ? params.role : "";
  const nextPath = params.next?.startsWith("/") ? params.next : selectedRole === "athlete" ? "/command-center" : "";
  const continueHref = selectedRole ? `${nextPath || "/command-center"}?role=${selectedRole}` : "";

  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Sign In" title="Continue to your MyD1 workspace" description="Auth is still being connected. For local development, choose a role to enter the correct portal with role-aware routing." />
        {continueHref ? (
          <Card className="mb-6">
            <h2 className="text-lg font-black text-[#0A1A3F]">{roleLabels[selectedRole]}</h2>
            <p className="mt-2 text-sm font-semibold leading-6 text-[#66718F]">Continue to the requested MyD1 flow. This creates a local dev session for access testing.</p>
            <Button href={continueHref} variant="cta" className="mt-4">Continue</Button>
          </Card>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          {signInRoles.map((role) => (
            <Card key={role.label}>
              <role.icon className="text-[#1B3FA0]" size={26} />
              <h2 className="mt-4 text-lg font-black">{role.label}</h2>
              <Button href={role.href} variant="primary" className="mt-4 w-full">Continue</Button>
            </Card>
          ))}
        </div>
      </section>
    </PublicSiteShell>
  );
}
