import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/contact")({
  head: () => meta("Contact", "Get in touch with the Ready Too Mingle team."),
  component: () => (
    <InfoPage title="Contact us">
      <p>Questions, reports or billing help? Email us at <span className="text-primary">support@readytoomingle.com</span> (placeholder — replace with your real address).</p>
      <p>To report an ad, use the report option on the ad once accounts are live.</p>
    </InfoPage>
  ),
});
