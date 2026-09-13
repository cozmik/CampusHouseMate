import { Link } from "react-router-dom";
import { LegalPage, LegalSection, LegalList } from "@/components/housemate/LegalPage";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

const Terms = () => {
  return (
    <LegalPage
      title="Terms and Conditions"
      updated={LEGAL_LAST_UPDATED}
      intro="Welcome to Housemates Finder. These Terms and Conditions (“Terms”) govern your use of the Housemates Finder platform, including our website and any related services. By creating an account or using the platform, you agree to be bound by these Terms. If you do not agree, please do not use the platform."
    >
      <LegalSection title="1. About the service">
        <p>
          Housemates Finder is a free marketplace that helps students discover, list, and hand over
          hostel and accommodation spaces near Nigerian campuses. The platform is currently free to
          use and does not process payments. Any rent, deposit, or other money transfers between
          users happen directly between the parties and are not handled, held, or guaranteed by
          Housemates Finder.
        </p>
      </LegalSection>

      <LegalSection title="2. Eligibility">
        <p>
          You must be at least 18 years old to use the platform. By using the platform you confirm
          that you meet this requirement and that any information you provide is accurate and
          complete. Housemates Finder may verify accounts and reserves the right to refuse or close
          accounts at its discretion.
        </p>
      </LegalSection>

      <LegalSection title="3. Accounts and security">
        <LegalList
          items={[
            <>
              You are responsible for keeping your login credentials confidential and for all
              activity that occurs under your account.
            </>,
            <>
              You must not share your password, allow others to use your account, or create accounts
              under false or misleading identities.
            </>,
            <>
              Notify us immediately at{" "}
              <a href="mailto:support@housemates.ng" className="text-teal-700 underline underline-offset-2">
                support@housemates.ng
              </a>{" "}
              if you suspect unauthorised access to your account.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="4. Posting listings">
        <LegalList
          items={[
            <>
              Listings must relate to genuine student accommodation and must be accurate, current,
              and not misleading. Prices, locations, and descriptions must reflect reality.
            </>,
            <>
              You must have the right to list a space — for example, because you own it, manage it,
              or are a tenant subletting with permission.
            </>,
            <>
              You may not post duplicate, spam, illegal, or fraudulent listings, or listings for
              anything other than student accommodation.
            </>,
            <>
              We may edit, hide, or remove listings that violate these Terms, applicable law, or our
              moderation guidelines.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="5. User conduct">
        <p>
          You agree not to use the platform to harass, threaten, defraud, or harm others; to post
          content that is unlawful, obscene, or infringing; to attempt to gain unauthorised access
          to the platform or other users’ accounts; or to interfere with the proper operation of the
          platform.
        </p>
      </LegalSection>

      <LegalSection title="6. Contact sharing and safety">
        <p>
          Housemates Finder offers an optional feature that shares your contact details with users
          you match with. By enabling contact sharing, you consent to your contact information being
          visible to other users of the platform. You are responsible for your own safety when
          meeting other users, viewing properties, or entering into accommodation arrangements.
          Always verify identities and properties, and never send money to someone you have not met.
        </p>
      </LegalSection>

      <LegalSection title="7. Moderation, suspension, and termination">
        <p>
          We may suspend or terminate accounts, remove content, or restrict access where we
          reasonably believe there is a breach of these Terms, a risk to other users, or a legal
          requirement. We may also allow other users to report listings and conduct that violates
          these Terms. You may close your account at any time.
        </p>
      </LegalSection>

      <LegalSection title="8. Intellectual property">
        <p>
          The Housemates Finder name, logo, design, and all content on the platform (excluding
          user-generated content) are owned by or licensed to Housemates Finder and are protected by
          applicable intellectual property laws. You may not copy, reproduce, or reuse them without
          our prior written consent. You retain all rights to the content you post, and you grant us
          a non-exclusive licence to host, display, and distribute that content on the platform.
        </p>
      </LegalSection>

      <LegalSection title="9. Disclaimer of warranties">
        <p>
          The platform is provided “as is” and “as available” without warranties of any kind,
          whether express or implied. While we work to keep the platform safe and reliable, we do
          not warrant that it will be uninterrupted, error-free, or free of harmful components, and
          we do not guarantee the accuracy, reliability, or completeness of any user-generated
          content.
        </p>
      </LegalSection>

      <LegalSection title="10. Limitation of liability">
        <p>
          To the maximum extent permitted by law, Housemates Finder shall not be liable for any
          indirect, incidental, special, or consequential damages, or for any loss of profits,
          data, or goodwill, arising out of or in connection with your use of the platform,
          including any disputes, injuries, or financial losses that occur between users.
        </p>
      </LegalSection>

      <LegalSection title="11. Changes to these terms">
        <p>
          We may update these Terms from time to time. When we do, we will revise the “Last
          updated” date at the top of this page. Continued use of the platform after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </LegalSection>

      <LegalSection title="12. Governing law">
        <p>
          These Terms are governed by the laws of the Federal Republic of Nigeria. Any disputes
          arising out of these Terms will be subject to the exclusive jurisdiction of the Nigerian
          courts.
        </p>
      </LegalSection>

      <LegalSection title="13. Contact us">
        <p>
          Questions about these Terms can be sent to{" "}
          <a href="mailto:support@housemates.ng" className="text-teal-700 underline underline-offset-2">
            support@housemates.ng
          </a>
          . You can also review how we handle your information in our{" "}
          <Link to="/privacy" className="text-teal-700 underline underline-offset-2">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default Terms;
