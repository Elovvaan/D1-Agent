import { redirect } from "next/navigation";

export default function SchoolImportWizardPage() {
  redirect("/operations?tab=data-intake");
}
