import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";

export const Route = createFileRoute("/terms")({
  head: () => meta("Rules & terms", "Ready Too Mingle is a dating and friendship site. No nudity, no escorts, no selling sex."),
  component: () => (
    <InfoPage title="Rules & terms">
      <p><strong>Ready Too Mingle is a dating and friendship site. It is not an escort site or a sex site.</strong></p>
      <h2>Who can post</h2>
      <p>You must be 18 or older. Post only yourself — no fake profiles, no posting someone else's photos or number.</p>
      <h2>What's allowed</h2>
      <p>Ads looking for dating, friendship or someone to share an activity with.</p>
      <h2>Not allowed — ever</h2>
      <ul className="list-disc space-y-1 pl-6">
        <li>Naked, sexual or see-through photos.</li>
        <li>Selling or buying sex, escort services, "companionship" for money, or hourly rates of any kind.</li>
        <li>Sexual or explicit wording in your ad.</li>
        <li>Anyone under 18, in photos or in ads.</li>
        <li>Harassment, threats, hate, scams, spam or asking people for money.</li>
      </ul>
      <h2>Reports and removal</h2>
      <p>Every ad has a Report button. If your ad is reported and breaks these rules, it is taken down and you are removed from the site. Paid ads that break the rules are not refunded. Anything involving minors or trafficking is reported to the authorities.</p>
      <h2>Payments</h2>
      <p>Ads and boosts are paid placement. We don't guarantee views, replies or dates.</p>
      <p>See also our <Link to="/privacy" className="text-primary">privacy policy</Link>.</p>
      <p className="text-xs">These rules should be reviewed by a lawyer before launch.</p>
    </InfoPage>
  ),
});
