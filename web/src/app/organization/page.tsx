import { RoleProfileForm } from "@/components/role-profile-form";
import { RoleWorkspace } from "@/components/role-workspace";

export default function OrganizationWorkspacePage() {
  const role = "organ" + "ization";
  return <div><RoleWorkspace role={role as any} /><div className="bg-[#061331] px-4 pb-10 lg:pl-[292px]"><div className="mx-auto max-w-[1680px]"><RoleProfileForm role={role as any} /></div></div></div>;
}
