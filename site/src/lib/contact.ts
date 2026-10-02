/** Contact form topics and their extra questions (Website Plan 7.8). Shared by the form and the endpoint. */
export type Topic = "question" | "solar" | "order" | "part" | "other";

export const TOPICS: { value: Topic; label: string }[] = [
  { value: "question", label: "Product question" },
  { value: "solar", label: "Solar & backup quote" },
  { value: "order", label: "Order something in" },
  { value: "part", label: "Match a part" },
  { value: "other", label: "Something else" },
];

export const PROPERTY = ["House", "Business", "Farm"];
export const KEEP_ON = ["Lights", "Fridge", "TV and Wi-Fi", "Geyser", "Pool pump", "Whole house"];
export const EXISTING = ["Nothing yet", "I have an inverter", "I have panels"];

export const MAX_IMAGES = 3;
export const MAX_IMAGE_CHARS = 2_000_000; // base64 length of one resized photo
