import { createFileRoute } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { BUSINESS_NAME, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";


export const Route = createFileRoute("/privacy")({
  head: () => meta("Privacy policy", "How Ready Too Mingle keeps your information private and safe."),
  component: () => (
    <InfoPage title="Privacy policy">
      <p>This Site is operated by {BUSINESS_NAME}. Your privacy matters — here's what we keep and what other people can see.</p>
      <h2>What other people see</h2>
      <p>Only what you put in your ad: your first name, age, photos, details you chose to fill in, and your city and area. Never your last name, email or street address.</p>
      <h2>Your phone number</h2>
      <p>Your number stays hidden unless you tick "Show my number on my ad". You can turn it off any time.</p>
      <h2>What we keep</h2>
      <p>Your account email, your ads and photos, payment records, and reports made about ads. We never see or store your full card number — payments are handled by our payment provider.</p>
      <h2>We never sell your information</h2>
      <p>We don't sell or rent your details to anyone. We only share information when the law requires it, or to report illegal activity such as anything involving minors or trafficking.</p>
      <h2>Staying safe</h2>
      <p>Meet in public places, tell a friend where you're going, and never send money to someone you met on the site.</p>
      <h2>Deleting your data</h2>
      <p>You can delete your ads and account at any time, and your information will be removed.</p>
      <h2>Questions about your data</h2>
      <p>To ask what we hold about you, or to request deletion, email {BUSINESS_NAME} at <a href={CONTACT_MAILTO} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>

      <p className="text-xs">This policy should be reviewed by a lawyer before launch.</p>
    </InfoPage>
  ),
});
