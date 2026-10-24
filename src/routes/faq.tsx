import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { PRICING, formatPrice } from "@/lib/pricing";

export const Route = createFileRoute("/faq")({
  head: () => meta("FAQ", "Answers about posting, pricing and safety on Ready Too Mingle."),
  component: () => (
    <InfoPage title="Frequently asked questions">
      <h2>How much does an ad cost?</h2>
      <p>{formatPrice(PRICING.dayAd.priceCents)} lists your ad for 24 hours, or {formatPrice(PRICING.weekAd.priceCents)} for a full week.</p>
      <h2>What is a boost?</h2>
      <p>{formatPrice(PRICING.boost.priceCents)} moves an active ad to the top of local listings for {PRICING.boost.durationHours} hours with a light-green glow. The most recent boost goes first, so as others boost, your ad moves down — boost again to get back on top. Week ads include a free boost for their first {PRICING.weekAd.includedBoostHours} hours; 24-hour ads get a purple frame. It's paid placement, not a promise of replies.</p>
      <h2>What can I post?</h2>
      <p>Ads looking for dating, friendship, casual encounters or activity partners. Everyone must be 18 or older. Ads offering paid services or adult content are not allowed.</p>
      <h2>Is my location shown?</h2>
      <p>Only the city and area you choose. Your exact address is never shown.</p>
    </InfoPage>
  ),
});
