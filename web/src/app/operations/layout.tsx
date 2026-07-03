import type { ReactNode } from "react";
import { OperatorToolCleaner } from "@/components/operations/operator-tool-cleaner";

export default function OperationsLayout({ children }: { children: ReactNode }) {
  return <><OperatorToolCleaner />{children}</>;
}
