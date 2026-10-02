/**
 * Store details (Website Plan 12.3, "Store details" options page). In production these come from
 * WordPress. Only the address is known so far: the other fields are client items 3, 4 and 7
 * (Website Plan section 13), so they are null and the site shows nothing for them rather than a guess.
 */
export type OpeningHours = Record<"mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun", { open: string; close: string } | null>;

export const store = {
  name: "Empire Solar & Hardware",
  tagline: "Innovation & Hardware. All in one place.",
  address: {
    lines: ["Kremetart Centre", "Van Velden St", "Brits", "0250"],
    oneLine: "Kremetart Centre, Van Velden St, Brits, 0250",
  },
  // From the Google Business profile (2 Oct 2026). WhatsApp and email are still unknown.
  phone: "+27 67 383 2527" as string | null,
  phoneDisplay: "067 383 2527",
  whatsapp: "27673832527" as string | null, // wa.me format: digits only, country code first
  email: null as string | null,
  hours: {
    mon: { open: "08:30", close: "17:30" },
    tue: { open: "08:30", close: "17:30" },
    wed: { open: "08:30", close: "17:30" },
    thu: { open: "08:30", close: "17:30" },
    fri: { open: "08:30", close: "17:30" },
    sat: { open: "08:30", close: "15:00" },
    sun: { open: "09:00", close: "13:00" },
  } as OpeningHours | null,
  plusCode: "9Q9J+4P Brits",
  mapsUrl:
    "https://www.google.com/maps/place/Empire+Solar+%26+Hardware/@-25.6322143,27.781813,17z/data=!4m6!3m5!1s0x1ebe31662c8d10cb:0x20fc1548dafe757c!8m2!3d-25.6322143!4d27.781813!16s%2Fg%2F11kpl6j7hv",
  mapsSearchUrl:
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent("Empire Solar & Hardware, Kremetart Centre, Van Velden St, Brits, 0250"),
};
