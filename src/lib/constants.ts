export const CATEGORIES = [
  "Food",
  "Medical",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Wifi Bill",
  "TV Bill",
  "Electricity Bill",
  "Petrol",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
