import { z } from "zod";
import { CURRENCIES, MENU_LAYOUTS } from "../../types/menu";

export const textStyleSchema = z
  .object({
    fontFamily: z.string().optional(),
    fontSize: z.number().optional(),
    fontWeight: z.string().optional(),
    color: z.string().optional(),
    lineHeight: z.number().optional(),
    letterSpacing: z.number().optional(),
    italic: z.boolean().optional(),
    underline: z.boolean().optional(),
    align: z.enum(["left", "center", "right"]).optional(),
    transform: z.enum(["none", "uppercase", "lowercase", "capitalize"]).optional(),
  })
  .strict()
  .optional();

export const menuItemSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  nameAr: z.string().optional(),
  description: z.string(),
  descriptionAr: z.string().optional(),
  price: z.number(),
  nameStyle: textStyleSchema,
  descriptionStyle: textStyleSchema,
  priceStyle: textStyleSchema,
  hasSizes: z.boolean(),
  sizes: z.array(z.object({ name: z.string(), price: z.number() })),
  category: z.string(),
});

export const menuCategorySchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  nameAr: z.string().optional(),
  image: z.string().optional(),
  nameStyle: textStyleSchema,
  items: z.array(menuItemSchema),
  page: z.number().int().positive().optional(),
});

export const designElementSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["image", "line", "divider", "shape", "spacer", "text"]),
  position: z.number(),
  imageUrl: z.string().optional(),
  imageAlt: z.string().optional(),
  imageWidth: z.string().optional(),
  imageHeight: z.string().optional(),
  imageAlign: z.enum(["left", "center", "right"]).optional(),
  lineStyle: z.enum(["solid", "dashed", "dotted", "double"]).optional(),
  lineWidth: z.string().optional(),
  lineColor: z.string().optional(),
  lineThickness: z.string().optional(),
  shapeType: z.enum(["circle", "square", "rectangle", "triangle"]).optional(),
  shapeColor: z.string().optional(),
  shapeSize: z.string().optional(),
  spacerHeight: z.string().optional(),
  text: z.string().optional(),
  textAlign: z.enum(["left", "center", "right"]).optional(),
  textSize: z.string().optional(),
  textColor: z.string().optional(),
  textBold: z.boolean().optional(),
  textItalic: z.boolean().optional(),
});

export const menuThemeSchema = z
  .object({
    primaryColor: z.string().optional(),
    backgroundColor: z.string().optional(),
    textColor: z.string().optional(),
    cardColor: z.string().optional(),
    borderColor: z.string().optional(),
    fontFamily: z.string().optional(),
    fontSize: z.string().optional(),
    spacing: z.string().optional(),
    layout: z.enum(MENU_LAYOUTS).optional(),
  })
  .strict()
  .optional();

const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase kebab-case");

export const menuUpsertSchema = z.object({
  name: z.string().min(1).max(200),
  nameAr: z.string().max(200).optional(),
  slug: slugSchema.optional().nullable(),
  titleStyle: textStyleSchema,
  vendorStyle: textStyleSchema,
  categories: z.array(menuCategorySchema).default([]),
  designElements: z.array(designElementSchema).optional(),
  vendorName: z.string().max(200).optional(),
  vendorLogo: z.string().optional(),
  theme: menuThemeSchema,
  pages: z.number().int().positive().optional(),
  currency: z.enum(CURRENCIES).optional(),
  language: z.enum(["en", "ar"]).optional(),
  isPublished: z.boolean().optional(),
  templateCategory: z
    .enum(["restaurant", "cafe", "supermarket", "bakery", "bar", "fastfood"])
    .optional()
    .nullable(),
  templateId: z.number().int().positive().optional().nullable(),
});

export const menuPatchSchema = menuUpsertSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  { message: "At least one field is required" }
);

export const menuIdParamsSchema = z.object({
  id: z.string().min(1),
});

export type MenuUpsertInput = z.infer<typeof menuUpsertSchema>;
export type MenuPatchInput = z.infer<typeof menuPatchSchema>;
