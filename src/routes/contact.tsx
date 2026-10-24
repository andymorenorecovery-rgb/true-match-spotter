import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";


export const Route = createFileRoute("/contact")({
  head: () => meta("Contact", "Get in touch with the Ready Too Mingle team."),
  component: () => (
    <InfoPage title="Contact us">
      <p>Questions, reports or billing help? Email {BUSINESS_NAME} at <a href={CONTACT_MAILTO} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>
      <p>To report an ad, use the report option on the ad, or email us and we'll take a look.</p>


    </InfoPage>
  ),
});
