export const APP_NAME = "Mini Freds Collection Tracker";
export const APP_TAGLINE = "A collector's archive";
export const DEFAULT_USER_ID = "default-user";

export const NAV_ITEMS = [
  { href: "/", label: "Dashboard" },
  { href: "/catalogue", label: "Catalogue" },
  { href: "/collection", label: "My Collection" },
  { href: "/missing", label: "Missing" },
] as const;

export const ITEMS_PER_PAGE = 48;
export const MANUFACTURERS = [
  "Vanguards",
  "Corgi Classics",
  "Corgi",
  "Days Gone",
  "Lledo",
  "SRC Models",
  "Promod",
  "Pocketbond",
] as const;
