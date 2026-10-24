import { createFileRoute, Link } from "@tanstack/react-router";
import { InfoPage, meta } from "@/components/InfoPage";
import { BRAND_NAME, BUSINESS_NAME, CONTACT_EMAIL, CONTACT_MAILTO } from "@/lib/contact";


export const Route = createFileRoute("/terms")({
  head: () => meta("Terms of service", "The terms for using Ready Too Mingle, a dating and friendship site."),
  component: () => (
    <InfoPage title="Terms of service">
      <p>This Site is operated by {BUSINESS_NAME} ("the Site", "we", "us"). By using the Site you agree to these Terms of Service. If you do not agree, do not use the Site.</p>

      <h2>1. About the Site</h2>
      <p>Ready Too Mingle, operated by {BUSINESS_NAME}, is a personal-ads site for dating, friendship and activity partners. It is not an escort service, adult site, or marketplace for sexual services. We provide a place to post ads only; we do not screen, introduce, or match members.</p>


      <h2>2. Eligibility</h2>
      <p>You must be at least 18 years old and legally able to agree to these Terms. You may only post ads about yourself, using your own photos and accurate information.</p>

      <h2>3. Prohibited content and conduct</h2>
      <p>You may not post, send, or request any of the following:</p>
      <ul className="list-disc space-y-1 pl-6">
        <li>Nude, sexual, or sexually suggestive photos or wording.</li>
        <li>Any offer or request for sex, sexual services, escort services, or companionship in exchange for money, gifts, or anything of value.</li>
        <li>Any request for money, payment apps, gift cards, loans, or financial help.</li>
        <li>Harassment, threats, stalking, bullying, hate speech, or abusive, obscene, or threatening language.</li>
        <li>Content involving anyone under 18.</li>
        <li>Fake profiles, impersonation, scams, spam, or advertising.</li>
        <li>Anything illegal under federal, state, or local law.</li>
      </ul>

      <h2>4. Termination</h2>
      <p>Any ad or behavior involving sex for money, solicitation, or other money-related activity will result in immediate and permanent termination of your profile. We may also remove any ad or account, at any time and without notice, if we believe it violates these Terms or puts others at risk. Fees paid for removed ads are non-refundable. We report suspected illegal activity, including anything involving minors or human trafficking, to law enforcement.</p>

      <h2>5. Reporting</h2>
      <p>Every ad has a "Report" option. We review reports and take action at our sole discretion.</p>

      <h2>6. Privacy</h2>
      <p>Your personal information is not sold, rented, or shared with anyone, except where required by law or to report illegal activity. See our <Link to="/privacy" className="text-primary">Privacy Policy</Link>.</p>

      <h2>7. Meeting other members — your responsibility</h2>
      <p>You are solely responsible for your interactions with other members, online and in person. We do not conduct background checks and do not verify the identity, age, or statements of members. Any meeting, communication, or relationship that happens outside the Site is entirely between you and the other person and has nothing to do with {BUSINESS_NAME}. Always meet in public and use caution.</p>

      <h2>8. Disclaimer of warranties</h2>
      <p>The Site is provided "as is" and "as available", without warranties of any kind. We do not guarantee views, replies, dates, matches, or that the Site will be uninterrupted or error-free.</p>

      <h2>9. Limitation of liability</h2>
      <p>To the fullest extent permitted by law, {BUSINESS_NAME} and its owners, employees, and partners are not liable for any injury, loss, damage, or harm of any kind — including personal injury, emotional distress, property loss, or death — arising from your use of the Site or from any contact or meeting with another member, on or off the Site. Our total liability for any claim will not exceed the amount you paid us in the 30 days before the claim.</p>

      <h2>10. Release and indemnification</h2>
      <p>You release {BUSINESS_NAME} from any claims arising from disputes or interactions with other members. You agree to defend and hold {BUSINESS_NAME} harmless from any claims, losses, or costs (including legal fees) caused by your ads, your conduct, or your violation of these Terms.</p>


      <h2>11. Payments</h2>
      <p>Ads and boosts are paid placement for the listed time period. All sales are final unless required otherwise by law.</p>

      <h2>12. Reporting human trafficking</h2>
      <p>{BUSINESS_NAME} has zero tolerance for human trafficking, sexual exploitation, or any content involving minors. Any account connected to it is removed immediately and reported to law enforcement, and we cooperate fully with investigations. If you suspect someone is being trafficked or is in danger:</p>
      <ul>
        <li><strong>Emergency:</strong> call <a href="tel:911" className="text-primary underline underline-offset-4">911</a>.</li>
        <li><strong>National Human Trafficking Hotline</strong> (24/7, confidential): call <a href="tel:18883737888" className="text-primary underline underline-offset-4">1-888-373-7888</a>, text 233733, or visit <a href="https://humantraffickinghotline.org" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">humantraffickinghotline.org</a>.</li>
        <li><strong>Minors:</strong> report to the NCMEC CyberTipline at <a href="https://report.cybertip.org" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">report.cybertip.org</a> or 1-800-843-5678.</li>
        <li><strong>FBI tips:</strong> <a href="https://tips.fbi.gov" target="_blank" rel="noopener noreferrer" className="text-primary underline underline-offset-4">tips.fbi.gov</a>.</li>
        <li>Also use the "Report" button on the ad and email us at <a href={CONTACT_MAILTO} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</li>
      </ul>

      <h2>13. Trademarks and intellectual property</h2>
      <p>"{BRAND_NAME}", its logo, site design, text, graphics, and software are the property of {BUSINESS_NAME} and are protected by trademark, copyright, and other intellectual property laws. You may not copy, reproduce, scrape, modify, or use them without our written permission.</p>
      <p>You keep ownership of the photos, video, and text you post. By posting, you grant {BUSINESS_NAME} a non-exclusive, royalty-free license to host, display, and format that content on the Site for as long as your ad is live. You confirm you own or have the right to post everything in your ad. If you believe content on the Site infringes your copyright or trademark, email <a href={CONTACT_MAILTO} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a> with a description of the work, where it appears, and your contact details, and we will review and remove infringing content.</p>

      <h2>14. Advertiser agreement</h2>
      <p>Everyone who posts an ad is an advertiser and agrees that:</p>
      <ul>
        <li>You are at least 18, the person shown in the photos and video selfie, and all information in your ad is true.</li>
        <li>Your ad is for dating, friendship, or activity partners only — never sex for money, escort, or paid-companionship services.</li>
        <li>You are solely responsible for your ad's content and for complying with all applicable laws.</li>
        <li>{BUSINESS_NAME} may edit, reject, or remove any ad at any time, without refund, if it breaks these Terms.</li>
        <li>Paid ads and boosts buy placement time only. They do not guarantee views, replies, contacts, or dates, and ranking may change as other members boost.</li>
        <li>You will not post on behalf of another person or a business without their consent.</li>
      </ul>

      <h2>15. Changes</h2>
      <p>We may update these Terms at any time. Continuing to use the Site after changes means you accept them.</p>

      <h2>16. Contact</h2>
      <p>Notices, reports and questions about these Terms should be sent to {BUSINESS_NAME} at <a href={CONTACT_MAILTO} className="text-primary underline underline-offset-4">{CONTACT_EMAIL}</a>.</p>

      <p className="text-xs">These terms should be reviewed by a licensed attorney before launch.</p>

    </InfoPage>
  ),
});
