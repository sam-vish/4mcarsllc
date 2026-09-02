import type { Metadata } from "next";

import LegalPage from "@/components/legal-page";
import { privacyPolicy } from "@/content/legal/privacyPolicy";
import { dealer } from "@/lib/config";

export const metadata: Metadata = {
  title: `Privacy Policy — ${dealer.name}`,
  description: `How ${dealer.name} collects, uses and protects your information.`,
  alternates: { canonical: "/privacy-policy" },
};

export default function Page() {
  return <LegalPage title="Privacy Policy" body={privacyPolicy} />;
}
