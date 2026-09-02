import type { Metadata } from "next";

import LegalPage from "@/components/legal-page";
import { termsOfService } from "@/content/legal/termsOfService";
import { dealer } from "@/lib/config";

export const metadata: Metadata = {
  title: `Terms of Service — ${dealer.name}`,
  description: `The terms that govern your use of the ${dealer.name} website.`,
  alternates: { canonical: "/terms-of-service" },
};

export default function Page() {
  return <LegalPage title="Terms of Service" body={termsOfService} />;
}
