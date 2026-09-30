export interface TextStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string;
  color?: string;
  lineHeight?: number;
  letterSpacing?: number;
  italic?: boolean;
  underline?: boolean;
  align?: "left" | "center" | "right";
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
}

export interface ItemSize {
  name: string;
  price: number;
}

export interface MenuItem {
  id: string;
  name: string;
  nameAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  nameStyle?: TextStyle;
  descriptionStyle?: TextStyle;
  priceStyle?: TextStyle;
  hasSizes: boolean;
  sizes: ItemSize[];
  category: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  nameAr?: string;
  image?: string;
  nameStyle?: TextStyle;
  items: MenuItem[];
  page?: number;
}

export interface MenuTheme {
  primaryColor?: string;
  backgroundColor?: string;
  textColor?: string;
  cardColor?: string;
  borderColor?: string;
  fontFamily?: string;
  fontSize?: string;
  spacing?: string;
  layout?: string;
}

export type DesignElementType =
  | "image"
  | "line"
  | "divider"
  | "shape"
  | "spacer"
  | "text";

export interface DesignElement {
  id: string;
  type: DesignElementType;
  position: number;
  imageUrl?: string;
  imageAlt?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageAlign?: "left" | "center" | "right";
  lineStyle?: "solid" | "dashed" | "dotted" | "double";
  lineWidth?: string;
  lineColor?: string;
  lineThickness?: string;
  shapeType?: "circle" | "square" | "rectangle" | "triangle";
  shapeColor?: string;
  shapeSize?: string;
  spacerHeight?: string;
  text?: string;
  textAlign?: "left" | "center" | "right";
  textSize?: string;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
}

/** Nested document stored in Menu.data JSON */
export interface MenuPayload {
  name: string;
  nameAr?: string;
  titleStyle?: TextStyle;
  vendorStyle?: TextStyle;
  categories: MenuCategory[];
  designElements?: DesignElement[];
  vendorName?: string;
  vendorLogo?: string;
  theme?: MenuTheme;
  pages?: number;
  currency?: string;
  language?: "en" | "ar";
}

/** API response shape compatible with frontend MenuData */
export interface MenuData extends MenuPayload {
  id: string;
  slug?: string | null;
  isPublished?: boolean;
  templateCategory?: string | null;
  templateId?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export const PLAN_LIMITS: Record<"free" | "restaurant" | "business", number | null> = {
  free: 1,
  restaurant: 5,
  business: null,
};

export const CURRENCIES = ["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD", "QAR"] as const;

export const MENU_LAYOUTS = [
  "fine-print",
  "bistro",
  "levantine",
  "harbor",
  "tavern",
  "tasting",
  "chalkboard",
  "brew-board",
  "garden",
  "bistrot",
  "shelf-tags",
  "market",
  "price-sheet",
  "patisserie",
  "kraft-bakery",
  "cake-card",
  "speakeasy",
  "wine-list",
  "sports-board",
  "combo-board",
  "street-stall",
  "pizzeria",
] as const;
