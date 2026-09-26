import type { CSSProperties } from "react";
import type { TextStyle } from "@/lib/menuStorage";

export const MENU_FONTS = [
  "Inter",
  "Playfair Display",
  "Cormorant Garamond",
  "Libre Baskerville",
  "Caveat",
  "Cairo",
  "Roboto",
  "Open Sans",
  "Lato",
  "Montserrat",
];

export const textStyleToCss = (style?: TextStyle): CSSProperties => {
  if (!style) return {};
  const css: CSSProperties = {};
  if (style.fontSize) css.fontSize = `${style.fontSize}px`;
  if (style.fontWeight) css.fontWeight = style.fontWeight;
  if (style.color) css.color = style.color;
  if (style.lineHeight) css.lineHeight = String(style.lineHeight);
  if (typeof style.letterSpacing === "number") css.letterSpacing = `${style.letterSpacing}px`;
  if (style.italic) css.fontStyle = "italic";
  if (style.underline) css.textDecoration = "underline";
  if (style.align) css.textAlign = style.align;
  if (style.transform && style.transform !== "none") css.textTransform = style.transform;
  return css;
};
