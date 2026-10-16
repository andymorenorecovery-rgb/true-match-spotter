import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => meta("Terms of service", "Rules for using Ready Too Mingle."),
  component: () => (
    <InfoPage title="Terms of service">
      <p><strong>Placeholder — needs legal review before launch.</strong></p>
      <h2>Who can use it</h2>
      <p>You must be 18 or older.</p>
      <h2>Allowed ads</h2>
      <p>Dating, friendship and activity-partner ads only. No paid services, adult content, spam or impersonation.</p>
      <h2>Payments</h2>
      <p>Ads and Featured boosts are paid placement. We don't guarantee views or replies.</p>
    </InfoPage>
  ),
});
