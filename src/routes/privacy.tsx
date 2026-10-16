import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy policy", "How Ready Too Mingle handles your data."),
  component: () => (
    <InfoPage title="Privacy policy">
      <p><strong>Placeholder — needs legal review before launch.</strong></p>
      <h2>What we collect</h2>
      <p>Account details, ad content and photos, messages, and payment records. We never store card numbers.</p>
      <h2>What's public</h2>
      <p>Only your ad, first name, age, and the city and area you choose.</p>
      <h2>Deleting your data</h2>
      <p>You can delete your account at any time. Retention periods will be listed here.</p>
    </InfoPage>
  ),
});
