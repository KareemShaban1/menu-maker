// Utility functions for storing and retrieving menu data

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
  image?: string; // Base64 encoded image or URL
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

export type DesignElementType = 'image' | 'line' | 'divider' | 'shape' | 'spacer' | 'text';

export interface DesignElement {
  id: string;
  type: DesignElementType;
  position: number; // Order in the menu (between categories)
  // Image properties
  imageUrl?: string; // Base64 or URL
  imageAlt?: string;
  imageWidth?: string; // e.g., "100%", "300px"
  imageHeight?: string;
  imageAlign?: 'left' | 'center' | 'right';
  // Line/Divider properties
  lineStyle?: 'solid' | 'dashed' | 'dotted' | 'double';
  lineWidth?: string; // e.g., "1px", "2px"
  lineColor?: string;
  lineThickness?: string; // e.g., "1px", "2px"
  // Shape properties
  shapeType?: 'circle' | 'square' | 'rectangle' | 'triangle';
  shapeColor?: string;
  shapeSize?: string;
  // Spacer properties
  spacerHeight?: string; // e.g., "20px", "2rem"
  // Text properties
  text?: string;
  textAlign?: 'left' | 'center' | 'right';
  textSize?: string;
  textColor?: string;
  textBold?: boolean;
  textItalic?: boolean;
}

export interface MenuData {
  id: string;
  name: string;
  nameAr?: string;
  titleStyle?: TextStyle;
  vendorStyle?: TextStyle;
  categories: MenuCategory[];
  designElements?: DesignElement[]; // Design elements positioned between categories
  vendorName?: string;
  vendorLogo?: string; // Base64 encoded image or URL
  theme?: MenuTheme;
  pages?: number;
  currency?: string;
  language?: "en" | "ar";
  createdAt?: string;
  updatedAt?: string;
}

const STORAGE_KEY = "savedMenus";

/**
 * Save a menu to localStorage
 */
export const saveMenu = (menu: MenuData): void => {
  try {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    const menus: Record<string, MenuData> = savedMenus ? JSON.parse(savedMenus) : {};
    
    menus[menu.id] = {
      ...menu,
      updatedAt: new Date().toISOString(),
      createdAt: menus[menu.id]?.createdAt || new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  } catch (error) {
    console.error("Error saving menu:", error);
    throw new Error("Failed to save menu");
  }
};

/**
 * Get a menu by ID from localStorage
 */
export const getMenu = (menuId: string): MenuData | null => {
  try {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (!savedMenus) return null;
    
    const menus: Record<string, MenuData> = JSON.parse(savedMenus);
    return menus[menuId] || null;
  } catch (error) {
    console.error("Error getting menu:", error);
    return null;
  }
};

/**
 * Get all saved menus
 */
export const getAllMenus = (): MenuData[] => {
  try {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (!savedMenus) return [];
    
    const menus: Record<string, MenuData> = JSON.parse(savedMenus);
    return Object.values(menus);
  } catch (error) {
    console.error("Error getting all menus:", error);
    return [];
  }
};

/**
 * Delete a menu by ID
 */
export const deleteMenu = (menuId: string): void => {
  try {
    const savedMenus = localStorage.getItem(STORAGE_KEY);
    if (!savedMenus) return;
    
    const menus: Record<string, MenuData> = JSON.parse(savedMenus);
    delete menus[menuId];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(menus));
  } catch (error) {
    console.error("Error deleting menu:", error);
    throw new Error("Failed to delete menu");
  }
};

/**
 * Generate a unique menu ID
 */
export const generateMenuId = (): string => {
  return `menu_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

