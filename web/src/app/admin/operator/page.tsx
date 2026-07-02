import { redirect } from "next/navigation";

export default function OperatorBackendPage() {
  redirect("/operations?tab=reviews");
}
