import type { Metadata } from "next";
import { EnquiryFlow } from "./EnquiryFlow";

export const metadata: Metadata = {
  title: "Send your list",
  description: "Send your list to Empire Solar & Hardware in Brits. We confirm stock, price and timing.",
  robots: { index: false, follow: true },
};

export default function EnquiryPage() {
  return (
    <div className="container">
      <EnquiryFlow />
    </div>
  );
}
