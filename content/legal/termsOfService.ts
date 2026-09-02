import { config, dealer } from "@/lib/config";

/* Dealer-neutral template. Everything dealer-specific interpolates from
   dealer-config.json — review with counsel before launch. */
export const termsOfService = `
<h2>Agreement to these terms</h2>
<p>
  These Terms of Service govern your use of this website, operated by ${dealer.name} ("we", "us", "our"). By using the
  site you agree to them. If you do not agree, please do not use the site.
</p>

<h2>What this site is</h2>
<p>
  This site is an information and contact page for our dealership. Our vehicle listings, vehicle detail pages, vehicle
  history reports, warranty terms, and credit application are hosted on a separate dealer platform, and links here open
  that platform in a new tab. Submitting a form on this site starts a conversation — it does not reserve a vehicle,
  create a purchase agreement, or constitute an offer to sell.
</p>

<h2>Vehicle information, pricing, and availability</h2>
<ul>
  <li>
    Vehicle details, mileage, equipment, photos, and prices shown here are a snapshot and may be out of date. The
    listing on our inventory site controls, and we correct errors when we find them.
  </li>
  <li>
    All vehicles are subject to prior sale. A vehicle shown here may already be sold or committed by the time you
    contact us.
  </li>
  <li>
    Advertised prices exclude tax, tag, title, registration, electronic filing, and dealer fees unless the listing says
    otherwise. Payment and down payment figures are illustrations, not offers of credit.
  </li>
  <li>
    We are not responsible for typographical, photographic, or data errors in listings or advertising.
  </li>
</ul>

<h2>Warranties</h2>
<p>
  Any warranty offered on a vehicle is described in the warranty documents and the Buyers Guide provided at the time of
  sale, and those documents control. Nothing on this website extends, modifies, or replaces them. Statements on this
  site are not a warranty of any individual vehicle's condition.
</p>

<h2>Financing</h2>
<p>
  We work with third-party lenders. Submitting an inquiry or a credit application does not guarantee approval, a
  particular rate, a particular down payment, or particular terms. All financing is subject to lender approval,
  verification of the information you provide, and applicable law.
</p>

<h2>Communications and consent</h2>
<p>
  By providing your contact information you agree that we may contact you by phone and email about your inquiry. Text
  message consent is optional, separate, and not a condition of purchase — see our
  <a href="/sms-disclosure">SMS Disclosure</a>. Message frequency varies. Message and data rates may apply. Reply
  STOP to opt out or HELP for help. How we handle your information is described in our
  <a href="/privacy-policy">Privacy Policy</a>.
</p>

<h2>Acceptable use</h2>
<p>You agree not to use this site to:</p>
<ul>
  <li>Submit false, misleading, or another person's information.</li>
  <li>Scrape, harvest, or bulk-copy content or listings, or use automated tools to submit forms.</li>
  <li>Attempt to gain unauthorized access to the site or interfere with its operation or security.</li>
  <li>Use the site for any unlawful purpose or in violation of these terms.</li>
</ul>

<h2>Intellectual property</h2>
<p>
  The content, layout, and design of this site, and the ${dealer.name} name and logo, belong to us or our licensors.
  You may view and print pages for your own use in shopping for a vehicle. Any other copying, redistribution, or
  commercial use requires our written permission. Vehicle manufacturer names and marks belong to their owners and are
  used only to identify vehicles.
</p>

<h2>Third-party links and services</h2>
<p>
  This site links to our dealer platform, mapping, chat, messaging, and social services we do not control. We are not
  responsible for their content, availability, or practices, and your use of them is governed by their own terms.
</p>

<h2>Disclaimer</h2>
<p>
  The site is provided "as is" and "as available", without warranties of any kind, express or implied, including
  merchantability, fitness for a particular purpose, and non-infringement. We do not warrant that the site will be
  uninterrupted, error-free, or free of harmful components.
</p>

<h2>Limitation of liability</h2>
<p>
  To the fullest extent permitted by law, ${dealer.name} is not liable for indirect, incidental, special,
  consequential, or punitive damages, or for lost profits or lost data, arising out of your use of this site. Nothing in
  these terms limits any right you have under ${config.legal.governingState} consumer protection law or affects the terms of an
  actual vehicle purchase or financing agreement.
</p>

<h2>Indemnification</h2>
<p>
  You agree to indemnify and hold ${dealer.name} harmless from claims arising out of your misuse of this site or your
  violation of these terms.
</p>

<h2>Governing law</h2>
<p>
  These terms are governed by the laws of the State of ${config.legal.governingState}, without regard to its conflict of laws
  rules. Any dispute will be brought in the state or federal courts located in ${config.legal.governingVenue}.
</p>

<h2>Changes to these terms</h2>
<p>
  We may update these terms from time to time. The revised version takes effect when posted on this page, and the "last
  updated" date above will change to reflect it. Continuing to use the site means you accept the change.
</p>
`;

export default termsOfService;
