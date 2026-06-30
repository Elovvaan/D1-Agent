import { Building2, Camera, GraduationCap, ShieldCheck, UserRound, Users } from "lucide-react";
import { Badge, Button, Card, PageHeader } from "@/components/design-system";
import { PublicSiteShell } from "@/components/public-site-shell";

const roles = [
  {
    title: "Athlete",
    detail: "Create or claim your athlete profile, connect school data, upload film, and enter Command Center.",
    icon: UserRound,
    href: "/sign-in?role=athlete&next=/onboarding/athlete"
  },
  {
    title: "Parent / Guardian",
    detail: "Support a minor athlete with consent, safety controls, profile approvals, and contact requests.",
    icon: ShieldCheck,
    href: "/sign-in?role=athlete&next=/onboarding/athlete"
  },
  {
    title: "Coach",
    detail: "Find your school, verify coaching affiliation, and manage athlete verification queues.",
    icon: Users,
    href: "/sign-in?role=coach&next=/coach"
  },
  {
    title: "Recruiter",
    detail: "Sign in to discover athletes, review verified profiles, and manage recruiting boards.",
    icon: GraduationCap,
    href: "/sign-in?role=recruiter&next=/recruiter"
  },
  {
    title: "Media Partner",
    detail: "Create a media profile, upload photos or video, tag athletes, and submit to review.",
    icon: Camera,
    href: "/sign-in?role=media_partner&next=/media"
  },
  {
    title: "School / Organization",
    detail: "Set up school data, import public athletics pages, and prepare team workflows.",
    icon: Building2,
    href: "/sign-in?role=admin&next=/admin/import-school"
  }
] as const;

export default function GetStartedPage() {
  return (
    <PublicSiteShell>
      <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 lg:px-8">
        <PageHeader
          eyebrow="Get Started"
          title="Choose your role"
          description="MyD1 routes every visitor to the right onboarding path. There is one platform, but each role starts with the workflow that matches their responsibility."
        />
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {roles.map((role) => (
            <Card key={role.title}>
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#EAF0FF] text-[#1B3FA0]">
                  <role.icon size={23} />
                </span>
                <Badge tone="silver">Onboarding</Badge>
              </div>
              <h2 className="mt-5 text-xl font-black text-[#0A1A3F]">{role.title}</h2>
              <p className="mt-3 min-h-20 text-sm font-semibold leading-6 text-[#66718F]">{role.detail}</p>
              <Button href={role.href} variant="primary" className="mt-5 w-full">Continue</Button>
            </Card>
          ))}
        </div>
      </section>
    </PublicSiteShell>
  );
}
