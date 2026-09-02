import { dealer } from "@/lib/config";

/* Dealer-neutral template. Everything dealer-specific interpolates from
   dealer-config.json — review with counsel before launch. */
export const smsDisclosure = `
<h2>Program description</h2>
<p>
  ${dealer.name} operates a text messaging program for customers and prospective customers who provide their mobile
  number and opt in. The program is used to answer vehicle inquiries, confirm test drive appointments, share vehicle
  availability and financing updates, and — where separately consented to — send offers and promotions.
</p>

<h2>How you opt in</h2>
<p>
  You opt in by checking the applicable consent box on a form on this website, by submitting your mobile number to us in
  person or by phone and agreeing to receive texts, or by texting us first. There are two separate consents and you may
  give either, both, or neither:
</p>
<ul>
  <li>
    <strong>Non-marketing (conversational) messages</strong> — vehicle inquiries, vehicle availability, financing
    updates, appointment reminders, and service-related updates.
  </li>
  <li>
    <strong>Marketing messages</strong> — special offers, discounts, and promotional updates.
  </li>
</ul>
<p>
  <strong>Consent is not a condition of purchase.</strong> You do not have to agree to receive text messages in order to
  buy a vehicle, obtain financing, or use any other service we offer.
</p>

<h2>Message frequency</h2>
<p>
  <strong>Message frequency varies.</strong> Conversational messages depend on the pace of your inquiry. Marketing
  messages, if you have opted in to them, are sent occasionally and are not on a fixed schedule.
</p>

<h2>Cost</h2>
<p>
  <strong>Message and data rates may apply.</strong> ${dealer.name} does not charge for text messages, but your mobile
  carrier's standard messaging and data charges apply to every message you send and receive. Check your plan with your
  carrier if you are unsure of your rates.
</p>

<h2>How to opt out</h2>
<p>
  <strong>Reply STOP to opt out</strong> to any message from us at any time. You will receive one final message
  confirming that you have been unsubscribed, and we will send no further texts to that number unless you opt in again.
  You may also opt out by calling us at <a href="tel:${dealer.phoneTel}">${dealer.phoneDisplay}</a> or emailing
  <a href="mailto:${dealer.email}">${dealer.email}</a>. Opting out of texts does not remove you from phone or email contact, which
  you can request separately.
</p>

<h2>How to get help</h2>
<p>
  <strong>Reply HELP for help</strong> to any message from us and you will receive our contact information. You can also
  reach us at <a href="tel:${dealer.phoneTel}">${dealer.phoneDisplay}</a> or <a href="mailto:${dealer.email}">${dealer.email}</a>.
</p>

<h2>Carriers and delivery</h2>
<p>
  Supported carriers include AT&amp;T, Verizon Wireless, T-Mobile, Sprint, Boost, U.S. Cellular, MetroPCS, Cricket, and
  most other US carriers. Carriers are not liable for delayed or undelivered messages. Delivery is not guaranteed, and
  message delivery may be affected by your carrier, device, or coverage.
</p>

<h2>Your privacy and your mobile information</h2>
<p>
  <strong>No mobile information will be shared with third parties or affiliates for marketing purposes.</strong>
  Information sharing to subcontractors in support services, such as customer service and messaging platform providers,
  is permitted. All other use case categories exclude text messaging originator opt-in data and consent; this
  information will not be shared with any third parties.
</p>
<p>
  Our full <a href="/privacy-policy">Privacy Policy</a> explains what we collect and how we use it. Our
  <a href="/terms-of-service">Terms of Service</a> govern your use of this site.
</p>

<h2>Changes to this disclosure</h2>
<p>
  We may update this disclosure from time to time. The revised version takes effect when posted on this page, and the
  "last updated" date above will change to reflect it.
</p>
`;

export default smsDisclosure;
