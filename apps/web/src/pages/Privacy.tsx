import { Link } from "react-router-dom";
import { LegalPage, LegalSection, LegalList } from "@/components/housemate/LegalPage";
import { LEGAL_LAST_UPDATED } from "@/lib/legal";

const Privacy = () => {
  return (
    <LegalPage
      title="Privacy Policy"
      updated={LEGAL_LAST_UPDATED}
      intro="This Privacy Policy explains how Housemates Finder collects, uses, and protects your personal information when you use our platform. We are committed to protecting your privacy and handling your data transparently."
    >
      <LegalSection title="1. Information we collect">
        <LegalList
          items={[
            <>
              <strong>Account information:</strong> name, email address, and password (stored
              securely) when you create an account.
            </>,
            <>
              <strong>Profile information:</strong> details you add voluntarily, such as a photo,
              phone number, WhatsApp number, school, and bio.
            </>,
            <>
              <strong>Listing information:</strong> content you post, such as accommodation
              descriptions, prices, locations, and photos.
            </>,
            <>
              <strong>Usage information:</strong> pages visited, listings viewed, and interactions
              with other users, used to operate and improve the platform.
            </>,
            <>
              <strong>Technical information:</strong> device type, browser, approximate location,
              and log data, used for security and performance.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="2. How we use your information">
        <LegalList
          items={[
            "To provide, maintain, and improve the platform and its features.",
            "To let you create and manage listings and connect with other users.",
            "To verify accounts and enforce our Terms and acceptable-use rules.",
            "To communicate with you about your account, the platform, and support requests.",
            "To detect, prevent, and respond to fraud, abuse, and security incidents.",
            "To comply with legal obligations.",
          ]}
        />
      </LegalSection>

      <LegalSection title="3. Contact sharing">
        <p>
          The platform has an optional contact-sharing feature. If you enable it, your contact
          details will be shown to users you match with so you can arrange accommodation handovers.
          Please only share information you are comfortable making visible to other users.
        </p>
      </LegalSection>

      <LegalSection title="4. How we share information">
        <LegalList
          items={[
            <>
              We do not sell your personal information.
            </>,
            <>
              Your public profile and listings are visible to other users of the platform, as
              intended by the service.
            </>,
            <>
              We may share data with trusted service providers (for example, hosting and analytics)
              who process it on our behalf under strict confidentiality obligations.
            </>,
            <>
              We may disclose information where required by law, legal process, or a valid request
              from a government authority, or to protect the rights, property, or safety of
              Housemates Finder, our users, or the public.
            </>,
          ]}
        />
      </LegalSection>

      <LegalSection title="5. Cookies and local storage">
        <p>
          We use cookies and similar local-storage technologies to keep you signed in, remember your
          preferences, and understand how the platform is used. You can adjust your browser
          settings to refuse cookies, but some parts of the platform may not function properly
          without them.
        </p>
      </LegalSection>

      <LegalSection title="6. Data retention">
        <p>
          We keep your information for as long as your account is active or as needed to provide the
          service, comply with legal obligations, resolve disputes, and enforce agreements. When
          your account is closed, we delete or anonymise your personal data where possible, subject
          to our legal and operational obligations.
        </p>
      </LegalSection>

      <LegalSection title="7. Your rights">
        <LegalList
          items={[
            <>
              <strong>Access and correction:</strong> you can view and update most of your profile
              information from your account settings.
            </>,
            <>
              <strong>Deletion:</strong> you can request deletion of your account and personal data
              by contacting us.
            </>,
            <>
              <strong>Objection and restriction:</strong> you can ask us to stop or restrict certain
              processing where applicable by law.
            </>,
            <>
              <strong>Withdrawing consent:</strong> where we rely on consent, you may withdraw it at
              any time without affecting the lawfulness of prior processing.
            </>,
          ]}
        />
        <p>
          To exercise any of these rights, contact us at{" "}
          <a href="mailto:support@housemates.ng" className="text-teal-700 underline underline-offset-2">
            support@housemates.ng
          </a>
          . We will respond within a reasonable timeframe.
        </p>
      </LegalSection>

      <LegalSection title="8. Security">
        <p>
          We use appropriate technical and organisational measures to protect your information,
          including encrypted transmission (HTTPS) and secure storage of passwords. However, no
          method of transmission or storage is completely secure, and we cannot guarantee absolute
          security.
        </p>
      </LegalSection>

      <LegalSection title="9. Children’s privacy">
        <p>
          The platform is intended for users aged 18 and older. We do not knowingly collect personal
          information from anyone under 18. If you believe a minor has provided us with personal
          information, please contact us so we can delete it.
        </p>
      </LegalSection>

      <LegalSection title="10. Changes to this policy">
        <p>
          We may update this Privacy Policy from time to time. We will revise the “Last updated”
          date at the top of this page when changes are made. Material changes will be communicated
          through the platform where appropriate.
        </p>
      </LegalSection>

      <LegalSection title="11. Contact us">
        <p>
          If you have questions about this Privacy Policy or how we handle your data, contact us at{" "}
          <a href="mailto:support@housemates.ng" className="text-teal-700 underline underline-offset-2">
            support@housemates.ng
          </a>
          . For details on using the service, see our{" "}
          <Link to="/terms" className="text-teal-700 underline underline-offset-2">
            Terms and Conditions
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
};

export default Privacy;
