import type { Metadata } from "next";

import LegalPage from "@/components/legal-page";
import { smsDisclosure } from "@/content/legal/smsDisclosure";
import { dealer } from "@/lib/config";

export const metadata: Metadata = {
  title: `SMS Disclosure — ${dealer.name}`,
  description: `Text messaging program terms for ${dealer.name}: opt-in, frequency, rates, STOP and HELP.`,
  alternates: { canonical: "/sms-disclosure" },
};

export default function Page() {
  return <LegalPage title="SMS Disclosure" body={smsDisclosure} />;
}
