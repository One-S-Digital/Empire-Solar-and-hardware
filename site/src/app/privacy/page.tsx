import type { Metadata } from "next";
import { StandardPage } from "@/components/StandardPage";
import { store } from "@/lib/store";

export const metadata: Metadata = {
  title: "Privacy policy",
  description:
    "What Empire Solar & Hardware collects when you send an enquiry or message, why, and your rights under POPIA.",
};

/**
 * DRAFT for the client to review (Website Plan 13, POPIA). It describes only what this site really does today.
 * Open points are listed in HANDOVER.md: retention period, Information Officer, and the email provider once chosen.
 */
export default function PrivacyPage() {
  return (
    <StandardPage
      title="Privacy policy"
      intro="What we collect when you contact us, why, and what you can ask us to do about it."
      helpBand={false}
    >
      <p>
        This policy applies to this website and is written for the Protection of
        Personal Information Act (POPIA). The responsible party is {store.name},{" "}
        {store.address.oneLine}.
      </p>

      <h2>What we collect</h2>
      <p>We collect personal information only when you send it to us:</p>
      <ul>
        <li>
          <strong>An enquiry list.</strong> The items and quantities on your
          list, any notes, your name, your phone number, your email address if
          you give one, how you want us to reply, and any message you add.
        </li>
        <li>
          <strong>The contact form.</strong> What you are asking about, the
          details you give for that question (for example a quantity, or what
          needs to stay on in a solar quote), your name, phone number, email
          address if you give one, your message, and up to three photos if you
          send a part to match.
        </li>
      </ul>
      <p>
        You never have to give us more than the form asks for. Fields marked
        optional can be left empty.
      </p>

      <h2>Why we collect it</h2>
      <p>
        To reply to your enquiry: to confirm stock, price and timing, to order
        items in for you, and to quote for solar and backup power. We do not use
        it for anything else, and we do not sell it.
      </p>

      <h2>Who sees it</h2>
      <p>
        The staff at the store who answer enquiries. If you choose to send your
        list on WhatsApp, that message goes through WhatsApp under its own
        terms. The website and its hosting providers handle the information on
        our behalf so the form can work.
      </p>

      <h2>Cookies and what is saved on your device</h2>
      <p>
        This site does not use advertising or tracking cookies. It saves a few
        things in your browser so it works the way you expect:
      </p>
      <ul>
        <li>
          your enquiry list, so it is still there if you refresh the page or
          come back later,
        </li>
        <li>
          the details you started typing into the enquiry form, until you send
          it,
        </li>
        <li>
          whether you prefer the grid or list view of products (a cookie called
          empire_view).
        </li>
      </ul>
      <p>
        These stay on your device. You can clear them in your browser settings
        at any time.
      </p>

      <h2>How long we keep it</h2>
      <p>
        We keep an enquiry only as long as we need it to reply and to deal with
        your request, and then delete it.
      </p>

      <h2>Your rights</h2>
      <p>Under POPIA you can ask us to:</p>
      <ul>
        <li>tell you what personal information we hold about you,</li>
        <li>correct it if it is wrong,</li>
        <li>delete it.</li>
      </ul>
      <p>
        To do any of these, call us on {store.phoneDisplay} or visit the store
        and ask at the counter. If you are not happy with how we handled your
        information, you may complain to the Information Regulator of South
        Africa at inforegulator.org.za.
      </p>

      <h2>Changes</h2>
      <p>If we change what the site collects, we will update this page.</p>
    </StandardPage>
  );
}
