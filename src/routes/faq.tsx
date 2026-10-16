import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { PRICING, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/faq")({
  head: () => meta("FAQ", "Answers about posting, pricing and safety on Ready Too Mingle."),
  component: () => (
    <InfoPage title="Frequently asked questions">
      <h2>How much does an ad cost?</h2>
      <p>{formatPrice(PRICING.standardAd.priceCents)} for one ad, listed for {PRICING.standardAd.durationDays} days.</p>
      <h2>What is a Featured boost?</h2>
      <p>{formatPrice(PRICING.featuredBoost.priceCents)} puts an active ad near the top of local listings for {PRICING.featuredBoost.durationDays} days, rotating fairly with other featured ads. It's paid placement, not extra ads.</p>
      <h2>What can I post?</h2>
      <p>Ads looking for dating, friendship or activity partners. Ads offering paid services or adult content are not allowed.</p>
      <h2>Is my location shown?</h2>
      <p>Only the city and area you choose. Your exact address is never shown.</p>
    </InfoPage>
  ),
});
