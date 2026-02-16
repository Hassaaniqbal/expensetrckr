export const CATEGORIES = [
  "Food",
  "Medical",
  "Transportation",
  "Utilities",
  "Entertainment",
  "Shopping",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
