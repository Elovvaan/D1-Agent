import { Camera, GraduationCap, ShieldCheck, UserRound, Users } from "lucide-react";
import { Button, Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const signInRoles = [
  { label: "Athlete", href: "/command-center?role=athlete", icon: UserRound },
  { label: "Coach", href: "/coach?role=coach", icon: Users },
  { label: "Recruiter", href: "/recruiter?role=recruiter", icon: GraduationCap },
  { label: "Media Partner", href: "/media?role=media_partner", icon: Camera },
  { label: "Admin / School", href: "/admin?role=admin", icon: ShieldCheck }
] as const;

export default function SignInPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[960px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader eyebrow="Sign In" title="Continue to your MyD1 workspace" description="Auth is still being connected. For local development, choose a role to enter the correct portal with role-aware routing." />
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
