/** Shared by the form (in the browser) and the send endpoint (on the server). Website Plan section 8. */

export type Reply = "whatsapp" | "call" | "email";

export type Details = {
  name: string;
  phone: string;
  email: string;
  reply: Reply;
  orderIn: boolean;
  message: string;
};

export type Errors = Partial<Record<keyof Details | "consent", string>>;

/** South African numbers: 082 123 4567, 0821234567 or +27 82 123 4567. Returns national format (10 digits) or undefined. */
export function normalisePhone(raw: string): string | undefined {
  const digits = raw.replace(/[^\d+]/g, "");
  let national = digits;
  if (digits.startsWith("+27")) national = "0" + digits.slice(3);
  else if (digits.startsWith("27") && digits.length === 11) national = "0" + digits.slice(2);
  return /^0\d{9}$/.test(national) ? national : undefined;
}

/** "0821234567" becomes "082 123 4567" as the person types; anything else is left alone. */
export function formatPhone(raw: string): string {
  if (!/^[\d\s]*$/.test(raw)) return raw;
  const d = raw.replace(/\s/g, "").slice(0, 10);
  return [d.slice(0, 3), d.slice(3, 6), d.slice(6)].filter(Boolean).join(" ");
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateField(key: keyof Details, d: Details): string | undefined {
  switch (key) {
    case "name":
      return d.name.trim().length < 2 ? "Enter your name." : undefined;
    case "phone":
      return normalisePhone(d.phone) ? undefined : "Enter a 10-digit number starting with 0.";
    case "email":
      if (!d.email.trim()) return d.reply === "email" ? "Enter your email, or choose another way to reply." : undefined;
      return EMAIL.test(d.email.trim()) ? undefined : "Check the email address.";
    default:
      return undefined;
  }
}

export function validateDetails(d: Details): Errors {
  const errors: Errors = {};
  for (const k of ["name", "phone", "email"] as const) {
    const e = validateField(k, d);
    if (e) errors[k] = e;
  }
  return errors;
}

export const emptyDetails: Details = { name: "", phone: "", email: "", reply: "whatsapp", orderIn: true, message: "" };
