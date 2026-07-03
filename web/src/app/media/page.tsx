import { RoleProfileForm } from "@/components/role-profile-form";
import { RoleWorkspace } from "@/components/role-workspace";

export default function MediaWorkspacePage() {
  return <div><RoleWorkspace role="media" /><div className="bg-[#061331] px-4 pb-10 lg:pl-[292px]"><div className="mx-auto max-w-[1680px]"><RoleProfileForm role="media" /></div></div></div>;
}
