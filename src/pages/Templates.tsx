import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft, Eye, Pencil,
  UtensilsCrossed, Coffee, ShoppingCart, Cake, Wine, Pizza,
  Salad, Soup, Fish, CookingPot, Sparkles, Palette, Moon, Waves, Home, Gem,
  CupSoda, Factory, Leaf, Sprout, Croissant, Flag,
  ClipboardList, Apple, Briefcase,
  CakeSlice, Wheat, Donut,
  Martini, Beer, Trophy,
  Sandwich, Beef,
} from "lucide-react";

type LucideIcon = typeof UtensilsCrossed;
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import RealMenuDesign, { templateLayout } from "@/components/RealMenuDesign";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { listMenusRequest } from "@/lib/api";
import { publicListTemplatesRequest } from "@/lib/adminApi";
import { canCreateMenu } from "@/lib/plans";
import { getAuthErrorMessage } from "@/contexts/AuthContext";

// Professional design configurations for each template
interface TemplateDesign {
  id: number;
  name: string;
  style: string;
  preview: LucideIcon;
  gradient: string;
  accentColor: string;
  icon: LucideIcon;
  pattern?: string;
}

const templatesByCategory: Record<string, TemplateDesign[]> = {
  restaurant: [
    { 
      id: 1, 
      name: "Elegant Dining", 
      style: "Classic & Refined", 
      preview: UtensilsCrossed,
      gradient: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      accentColor: "#d4af37",
      icon: Sparkles,
      pattern: "radial-gradient(circle at 20% 50%, rgba(212, 175, 55, 0.1) 0%, transparent 50%)"
    },
    { 
      id: 2, 
      name: "Modern Bistro", 
      style: "Contemporary", 
      preview: Salad,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      accentColor: "#667eea",
      icon: Palette,
    },
    { 
      id: 3, 
      name: "Oriental Feast", 
      style: "Middle Eastern", 
      preview: Soup,
      gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)",
      accentColor: "#f5576c",
      icon: Moon,
      pattern: "radial-gradient(circle at 50% 0%, rgba(245, 87, 108, 0.15) 0%, transparent 70%)"
    },
    { 
      id: 4, 
      name: "Seafood Harbor", 
      style: "Maritime", 
      preview: Fish,
      gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
      accentColor: "#4facfe",
      icon: Waves,
      pattern: "radial-gradient(ellipse at top, rgba(79, 172, 254, 0.2) 0%, transparent 50%)"
    },
    { 
      id: 5, 
      name: "Rustic Kitchen", 
      style: "Homestyle", 
      preview: CookingPot,
      gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      accentColor: "#d97706",
      icon: Home,
    },
    { 
      id: 6, 
      name: "Fine Dining", 
      style: "Luxury", 
      preview: Wine,
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      accentColor: "#d4af37",
      icon: Gem,
      pattern: "radial-gradient(circle at 30% 30%, rgba(212, 175, 55, 0.2) 0%, transparent 60%)"
    },
  ],
  cafe: [
    { 
      id: 1, 
      name: "Coffee House", 
      style: "Cozy & Warm", 
      preview: Coffee,
      gradient: "linear-gradient(135deg, #8b4513 0%, #d2691e 50%, #cd853f 100%)",
      accentColor: "#8b4513",
      icon: Coffee,
      pattern: "radial-gradient(circle at 50% 50%, rgba(139, 69, 19, 0.15) 0%, transparent 70%)"
    },
    { 
      id: 2, 
      name: "Urban Brew", 
      style: "Modern Industrial", 
      preview: CupSoda,
      gradient: "linear-gradient(135deg, #2c3e50 0%, #34495e 50%, #2c3e50 100%)",
      accentColor: "#3498db",
      icon: Factory,
    },
    { 
      id: 3, 
      name: "Garden Café", 
      style: "Fresh & Natural", 
      preview: Leaf,
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      accentColor: "#11998e",
      icon: Sprout,
      pattern: "radial-gradient(ellipse at bottom, rgba(17, 153, 142, 0.2) 0%, transparent 50%)"
    },
    { 
      id: 4, 
      name: "Parisian", 
      style: "French Elegance", 
      preview: Croissant,
      gradient: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
      accentColor: "#e91e63",
      icon: Flag,
    },
  ],
  supermarket: [
    { 
      id: 1, 
      name: "Clean Catalog", 
      style: "Minimal", 
      preview: ShoppingCart,
      gradient: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      accentColor: "#4a5568",
      icon: ClipboardList,
    },
    { 
      id: 2, 
      name: "Fresh Market", 
      style: "Vibrant", 
      preview: Apple,
      gradient: "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
      accentColor: "#10b981",
      icon: Apple,
      pattern: "radial-gradient(circle at 20% 80%, rgba(16, 185, 129, 0.2) 0%, transparent 50%)"
    },
    { 
      id: 3, 
      name: "Price List Pro", 
      style: "Professional", 
      preview: ClipboardList,
      gradient: "linear-gradient(135deg, #434343 0%, #000000 100%)",
      accentColor: "#3b82f6",
      icon: Briefcase,
    },
  ],
  bakery: [
    { 
      id: 1, 
      name: "Sweet Treats", 
      style: "Playful", 
      preview: CakeSlice,
      gradient: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)",
      accentColor: "#ec4899",
      icon: Cake,
      pattern: "radial-gradient(circle at 50% 50%, rgba(236, 72, 153, 0.15) 0%, transparent 70%)"
    },
    { 
      id: 2, 
      name: "Artisan Bread", 
      style: "Rustic", 
      preview: Wheat,
      gradient: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
      accentColor: "#92400e",
      icon: Croissant,
    },
    { 
      id: 3, 
      name: "Pastry Shop", 
      style: "Elegant", 
      preview: Donut,
      gradient: "linear-gradient(135deg, #fbc2eb 0%, #a6c1ee 100%)",
      accentColor: "#a855f7",
      icon: CakeSlice,
    },
  ],
  bar: [
    { 
      id: 1, 
      name: "Cocktail Lounge", 
      style: "Sophisticated", 
      preview: Martini,
      gradient: "linear-gradient(135deg, #1e3c72 0%, #2a5298 50%, #1e3c72 100%)",
      accentColor: "#fbbf24",
      icon: Martini,
      pattern: "radial-gradient(circle at 50% 0%, rgba(251, 191, 36, 0.1) 0%, transparent 70%)"
    },
    { 
      id: 2, 
      name: "Wine Cellar", 
      style: "Classic", 
      preview: Wine,
      gradient: "linear-gradient(135deg, #6b2c3e 0%, #8b3a4d 50%, #6b2c3e 100%)",
      accentColor: "#dc2626",
      icon: Wine,
    },
    { 
      id: 3, 
      name: "Sports Bar", 
      style: "Casual", 
      preview: Beer,
      gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      accentColor: "#f59e0b",
      icon: Trophy,
    },
  ],
  fastfood: [
    { 
      id: 1, 
      name: "Quick Bites", 
      style: "Bold & Fun", 
      preview: Sandwich,
      gradient: "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 50%, #ff6b6b 100%)",
      accentColor: "#dc2626",
      icon: Sandwich,
      pattern: "radial-gradient(circle at 30% 30%, rgba(255, 107, 107, 0.2) 0%, transparent 60%)"
    },
    { 
      id: 2, 
      name: "Street Food", 
      style: "Urban", 
      preview: Beef,
      gradient: "linear-gradient(135deg, #fad961 0%, #f76b1c 100%)",
      accentColor: "#f76b1c",
      icon: CookingPot,
    },
    { 
      id: 3, 
      name: "Pizza Place", 
      style: "Italian", 
      preview: Pizza,
      gradient: "linear-gradient(135deg, #c94b4b 0%, #4b134f 100%)",
      accentColor: "#dc2626",
      icon: Pizza,
      pattern: "radial-gradient(ellipse at top, rgba(201, 75, 75, 0.2) 0%, transparent 50%)"
    },
  ],
};

// Category names will be translated in the component using useLanguage
const categoryKeys: Record<string, string> = {
  restaurant: "category.restaurant",
  cafe: "category.cafe",
  supermarket: "category.supermarket",
  bakery: "category.bakery",
  bar: "category.bar",
  fastfood: "category.fastfood",
};

const categoryIcons: Record<string, LucideIcon> = {
  restaurant: UtensilsCrossed,
  cafe: Coffee,
  supermarket: ShoppingCart,
  bakery: Cake,
  bar: Wine,
  fastfood: Pizza,
};

const getPreviewLayout = (category: string, templateId: number): string => {
  return templateLayout(category, templateId);
};

interface MenuItem {
  name: string;
  description: string;
  price: number;
}

interface MenuCategory {
  name: string;
  items: MenuItem[];
}

// Generate sample menu data for each template
const getTemplatePreview = (category: string, templateId: number): { name: string; categories: MenuCategory[] } => {
  const template = templatesByCategory[category as keyof typeof templatesByCategory]?.find(t => t.id === templateId);
  const templateName = template?.name || "Menu";

  const menus: Record<string, Record<number, { name: string; categories: MenuCategory[] }>> = {
    restaurant: {
      1: {
        name: "Elegant Dining",
        categories: [
          {
            name: "Appetizers",
            items: [
              { name: "Truffle Arancini", description: "Crispy risotto balls with truffle oil", price: 18 },
              { name: "Foie Gras Terrine", description: "Served with brioche and fig compote", price: 32 },
              { name: "Oysters Rockefeller", description: "Fresh oysters with spinach and Pernod", price: 24 },
            ],
          },
          {
            name: "Main Courses",
            items: [
              { name: "Wagyu Beef Tenderloin", description: "8oz with red wine reduction", price: 68 },
              { name: "Pan-Seared Duck Breast", description: "With cherry gastrique and root vegetables", price: 42 },
              { name: "Lobster Thermidor", description: "Classic preparation with gruyère", price: 58 },
            ],
          },
          {
            name: "Desserts",
            items: [
              { name: "Crème Brûlée", description: "Vanilla bean with fresh berries", price: 14 },
              { name: "Chocolate Soufflé", description: "Warm with vanilla ice cream", price: 16 },
            ],
          },
        ],
      },
      2: {
        name: "Modern Bistro",
        categories: [
          {
            name: "Small Plates",
            items: [
              { name: "Burrata & Prosciutto", description: "With arugula and balsamic", price: 16 },
              { name: "Beef Tartare", description: "With capers and quail egg", price: 18 },
              { name: "Roasted Beet Salad", description: "Goat cheese and walnuts", price: 14 },
            ],
          },
          {
            name: "Mains",
            items: [
              { name: "Braised Short Rib", description: "With polenta and gremolata", price: 28 },
              { name: "Pan-Roasted Salmon", description: "With lentils and herb butter", price: 26 },
              { name: "Mushroom Risotto", description: "Parmesan and white wine", price: 22 },
            ],
          },
        ],
      },
      3: {
        name: "Oriental Feast",
        categories: [
          {
            name: "Mezze",
            items: [
              { name: "Hummus", description: "Creamy chickpea dip with olive oil", price: 8 },
              { name: "Baba Ganoush", description: "Smoky eggplant dip", price: 8 },
              { name: "Falafel", description: "Crispy chickpea patties", price: 10 },
            ],
          },
          {
            name: "Main Dishes",
            items: [
              { name: "Lamb Shawarma", description: "Marinated lamb with tahini", price: 22 },
              { name: "Chicken Kebab", description: "Grilled with rice and salad", price: 20 },
              { name: "Mixed Grill", description: "Lamb, chicken, and kofta", price: 28 },
            ],
          },
        ],
      },
      4: {
        name: "Seafood Harbor",
        categories: [
          {
            name: "Starters",
            items: [
              { name: "Lobster Bisque", description: "Rich and creamy with cognac", price: 14 },
              { name: "Crab Cakes", description: "Jumbo lump crab with remoulade", price: 16 },
              { name: "Oyster Sampler", description: "6 fresh oysters on the half shell", price: 18 },
            ],
          },
          {
            name: "From the Sea",
            items: [
              { name: "Grilled Swordfish", description: "With lemon butter and capers", price: 32 },
              { name: "Seafood Paella", description: "Saffron rice with mixed seafood", price: 36 },
              { name: "Whole Branzino", description: "Roasted with herbs and olive oil", price: 38 },
            ],
          },
        ],
      },
      5: {
        name: "Rustic Kitchen",
        categories: [
          {
            name: "Starters",
            items: [
              { name: "Tomato Soup", description: "Creamy with fresh basil", price: 8 },
              { name: "Mac & Cheese", description: "Three cheese blend", price: 12 },
              { name: "Fried Green Tomatoes", description: "With remoulade sauce", price: 10 },
            ],
          },
          {
            name: "Comfort Food",
            items: [
              { name: "Chicken Pot Pie", description: "Flaky crust, creamy filling", price: 18 },
              { name: "Meatloaf", description: "With mashed potatoes and gravy", price: 20 },
              { name: "Shepherd's Pie", description: "Ground lamb with vegetables", price: 19 },
            ],
          },
        ],
      },
      6: {
        name: "Fine Dining",
        categories: [
          {
            name: "Amuse-Bouche",
            items: [
              { name: "Caviar Service", description: "Beluga with blinis and crème fraîche", price: 85 },
              { name: "Wagyu Carpaccio", description: "Thinly sliced with truffle", price: 45 },
            ],
          },
          {
            name: "Tasting Menu",
            items: [
              { name: "7-Course Tasting", description: "Chef's selection", price: 145 },
              { name: "Wine Pairing", description: "Add wine pairing", price: 85 },
            ],
          },
        ],
      },
    },
    cafe: {
      1: {
        name: "Coffee House",
        categories: [
          {
            name: "Hot Beverages",
            items: [
              { name: "Espresso", description: "Single shot", price: 3 },
              { name: "Cappuccino", description: "Espresso with steamed milk foam", price: 4.5 },
              { name: "Latte", description: "Espresso with steamed milk", price: 5 },
            ],
          },
          {
            name: "Pastries",
            items: [
              { name: "Croissant", description: "Buttery and flaky", price: 3.5 },
              { name: "Blueberry Muffin", description: "Fresh baked daily", price: 4 },
              { name: "Chocolate Chip Cookie", description: "Warm and gooey", price: 3 },
            ],
          },
        ],
      },
      2: {
        name: "Urban Brew",
        categories: [
          {
            name: "Specialty Coffee",
            items: [
              { name: "Cold Brew", description: "Smooth and bold", price: 5 },
              { name: "Nitro Coffee", description: "Creamy and smooth", price: 6 },
              { name: "Matcha Latte", description: "Japanese green tea", price: 5.5 },
            ],
          },
          {
            name: "Light Bites",
            items: [
              { name: "Avocado Toast", description: "Sourdough with feta", price: 8 },
              { name: "Breakfast Burrito", description: "Egg, cheese, and bacon", price: 9 },
            ],
          },
        ],
      },
      3: {
        name: "Garden Café",
        categories: [
          {
            name: "Teas & Infusions",
            items: [
              { name: "Green Tea", description: "Organic jasmine", price: 4 },
              { name: "Herbal Blend", description: "Chamomile and mint", price: 4.5 },
              { name: "Chai Latte", description: "Spiced with steamed milk", price: 5 },
            ],
          },
          {
            name: "Healthy Options",
            items: [
              { name: "Acai Bowl", description: "With fresh fruit and granola", price: 10 },
              { name: "Quinoa Salad", description: "Mixed vegetables and tahini", price: 11 },
            ],
          },
        ],
      },
      4: {
        name: "Parisian",
        categories: [
          {
            name: "Café Classics",
            items: [
              { name: "Café au Lait", description: "French press coffee with milk", price: 4 },
              { name: "Café Crème", description: "Espresso with cream", price: 4.5 },
            ],
          },
          {
            name: "French Pastries",
            items: [
              { name: "Pain au Chocolat", description: "Buttery chocolate croissant", price: 4.5 },
              { name: "Éclair", description: "Chocolate or vanilla", price: 5 },
              { name: "Madeleine", description: "Traditional shell-shaped cake", price: 3.5 },
            ],
          },
        ],
      },
    },
    supermarket: {
      1: {
        name: "Clean Catalog",
        categories: [
          {
            name: "Produce",
            items: [
              { name: "Organic Tomatoes", description: "Per lb", price: 4.99 },
              { name: "Fresh Spinach", description: "10 oz bag", price: 3.49 },
              { name: "Avocados", description: "Each", price: 1.99 },
            ],
          },
          {
            name: "Dairy",
            items: [
              { name: "Organic Milk", description: "1 gallon", price: 6.99 },
              { name: "Greek Yogurt", description: "32 oz", price: 5.49 },
            ],
          },
        ],
      },
      2: {
        name: "Fresh Market",
        categories: [
          {
            name: "Fresh Fruits",
            items: [
              { name: "Strawberries", description: "1 lb container", price: 4.99 },
              { name: "Blueberries", description: "6 oz container", price: 3.99 },
              { name: "Mangoes", description: "Each", price: 2.49 },
            ],
          },
          {
            name: "Vegetables",
            items: [
              { name: "Bell Peppers", description: "Per lb", price: 3.99 },
              { name: "Broccoli", description: "Per lb", price: 2.99 },
            ],
          },
        ],
      },
      3: {
        name: "Price List Pro",
        categories: [
          {
            name: "Meat & Seafood",
            items: [
              { name: "Chicken Breast", description: "Per lb", price: 7.99 },
              { name: "Salmon Fillet", description: "Per lb", price: 12.99 },
              { name: "Ground Beef", description: "Per lb", price: 6.99 },
            ],
          },
          {
            name: "Pantry Staples",
            items: [
              { name: "Pasta", description: "1 lb box", price: 2.49 },
              { name: "Olive Oil", description: "500ml", price: 8.99 },
            ],
          },
        ],
      },
    },
    bakery: {
      1: {
        name: "Sweet Treats",
        categories: [
          {
            name: "Cupcakes",
            items: [
              { name: "Vanilla Cupcake", description: "With buttercream frosting", price: 3.5 },
              { name: "Chocolate Cupcake", description: "With chocolate ganache", price: 3.5 },
              { name: "Red Velvet", description: "Cream cheese frosting", price: 4 },
            ],
          },
          {
            name: "Cookies",
            items: [
              { name: "Chocolate Chip", description: "Classic recipe", price: 2.5 },
              { name: "Sugar Cookie", description: "Decorated", price: 2 },
            ],
          },
        ],
      },
      2: {
        name: "Artisan Bread",
        categories: [
          {
            name: "Bread Loaves",
            items: [
              { name: "Sourdough", description: "Traditional fermentation", price: 6 },
              { name: "Whole Wheat", description: "Stone ground flour", price: 5.5 },
              { name: "Rye Bread", description: "Caraway seeds", price: 6.5 },
            ],
          },
          {
            name: "Specialty",
            items: [
              { name: "Focaccia", description: "With rosemary and sea salt", price: 7 },
              { name: "Baguette", description: "French style", price: 4.5 },
            ],
          },
        ],
      },
      3: {
        name: "Pastry Shop",
        categories: [
          {
            name: "Éclairs",
            items: [
              { name: "Chocolate Éclair", description: "Choux pastry with cream", price: 5 },
              { name: "Coffee Éclair", description: "Coffee cream filling", price: 5.5 },
            ],
          },
          {
            name: "Tarts",
            items: [
              { name: "Lemon Tart", description: "Tangy and sweet", price: 6 },
              { name: "Apple Tart", description: "With cinnamon", price: 6.5 },
            ],
          },
        ],
      },
    },
    bar: {
      1: {
        name: "Cocktail Lounge",
        categories: [
          {
            name: "Signature Cocktails",
            items: [
              { name: "Old Fashioned", description: "Bourbon, bitters, sugar", price: 14 },
              { name: "Negroni", description: "Gin, Campari, vermouth", price: 13 },
              { name: "Espresso Martini", description: "Vodka, coffee liqueur", price: 15 },
            ],
          },
          {
            name: "Classics",
            items: [
              { name: "Mojito", description: "Rum, mint, lime", price: 12 },
              { name: "Margarita", description: "Tequila, triple sec, lime", price: 13 },
            ],
          },
        ],
      },
      2: {
        name: "Wine Cellar",
        categories: [
          {
            name: "Red Wines",
            items: [
              { name: "Cabernet Sauvignon", description: "Glass / Bottle", price: 12 },
              { name: "Pinot Noir", description: "Glass / Bottle", price: 11 },
              { name: "Merlot", description: "Glass / Bottle", price: 10 },
            ],
          },
          {
            name: "White Wines",
            items: [
              { name: "Chardonnay", description: "Glass / Bottle", price: 11 },
              { name: "Sauvignon Blanc", description: "Glass / Bottle", price: 10 },
            ],
          },
        ],
      },
      3: {
        name: "Sports Bar",
        categories: [
          {
            name: "Beer",
            items: [
              { name: "Draft Beer", description: "Pint", price: 6 },
              { name: "Craft IPA", description: "Bottle", price: 7 },
              { name: "Lager", description: "Bottle", price: 5 },
            ],
          },
          {
            name: "Bar Food",
            items: [
              { name: "Wings", description: "10 pieces", price: 12 },
              { name: "Nachos", description: "Loaded with toppings", price: 11 },
            ],
          },
        ],
      },
    },
    fastfood: {
      1: {
        name: "Quick Bites",
        categories: [
          {
            name: "Burgers",
            items: [
              { name: "Classic Burger", description: "Beef patty, lettuce, tomato", price: 8 },
              { name: "Cheeseburger", description: "With American cheese", price: 9 },
              { name: "Bacon Burger", description: "Crispy bacon and cheese", price: 10 },
            ],
          },
          {
            name: "Sides",
            items: [
              { name: "French Fries", description: "Crispy golden fries", price: 4 },
              { name: "Onion Rings", description: "Beer battered", price: 5 },
            ],
          },
        ],
      },
      2: {
        name: "Street Food",
        categories: [
          {
            name: "Tacos",
            items: [
              { name: "Beef Taco", description: "Seasoned ground beef", price: 4 },
              { name: "Chicken Taco", description: "Grilled chicken", price: 4 },
              { name: "Fish Taco", description: "Battered fish", price: 5 },
            ],
          },
          {
            name: "Extras",
            items: [
              { name: "Guacamole", description: "Fresh avocado dip", price: 3 },
              { name: "Salsa", description: "Spicy tomato salsa", price: 2 },
            ],
          },
        ],
      },
      3: {
        name: "Pizza Place",
        categories: [
          {
            name: "Pizzas",
            items: [
              { name: "Margherita", description: "Tomato, mozzarella, basil", price: 12 },
              { name: "Pepperoni", description: "Classic pepperoni", price: 14 },
              { name: "Hawaiian", description: "Ham and pineapple", price: 15 },
            ],
          },
          {
            name: "Sides",
            items: [
              { name: "Garlic Bread", description: "Buttery and garlicky", price: 5 },
              { name: "Caesar Salad", description: "Fresh romaine", price: 7 },
            ],
          },
        ],
      },
    },
  };

  return menus[category]?.[templateId] || {
    name: templateName,
    categories: [
      {
        name: "Sample Category",
        items: [
          { name: "Sample Item", description: "Description here", price: 10 },
        ],
      },
    ],
  };
};

// Menu Preview Content Component with different layouts
interface MenuPreviewContentProps {
  data: { name: string; categories: MenuCategory[] };
  layout: string;
}

const MenuPreviewContent = ({ data, layout }: MenuPreviewContentProps) => {
  return (
    <RealMenuDesign
      layout={layout}
      name={data.name}
      categories={data.categories.map((category) => ({
        name: category.name,
        items: category.items.map((item) => ({
          name: item.name,
          description: item.description,
          price: item.price,
        })),
      }))}
    />
  );
};

const Templates = () => {
  const { category } = useParams<{ category?: string }>();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState(category || "restaurant");
  const [previewTemplate, setPreviewTemplate] = useState<{ category: string; id: number } | null>(null);
  const [checkingPlan, setCheckingPlan] = useState(false);
  const [activeKeys, setActiveKeys] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const rows = await publicListTemplatesRequest();
        if (cancelled || !rows.length) return;
        setActiveKeys(new Set(rows.filter((r) => r.isActive).map((r) => `${r.category}:${r.localId}`)));
      } catch {
        // Keep static catalog if API is unavailable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const allTemplates = templatesByCategory[selectedCategory as keyof typeof templatesByCategory] || [];
  const templates =
    activeKeys === null
      ? allTemplates
      : allTemplates.filter((tpl) => activeKeys.has(`${selectedCategory}:${tpl.id}`));

  const handlePreview = (templateId: number) => {
    setPreviewTemplate({ category: selectedCategory, id: templateId });
  };

  const handleEdit = async (templateId: number) => {
    const path = `/builder/${selectedCategory}/${templateId}`;
    if (!isAuthenticated) {
      navigate(`/login?next=${encodeURIComponent(path)}`);
      return;
    }
    if (!user) return;
    setCheckingPlan(true);
    try {
      const menus = await listMenusRequest();
      if (!canCreateMenu(user.plan, menus.length)) {
        toast.error(t("builder.planLimitDesc"));
        navigate("/profile#plans");
        return;
      }
      navigate(path);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t("profile.menusLoadError")));
    } finally {
      setCheckingPlan(false);
    }
  };

  const previewData = previewTemplate
    ? getTemplatePreview(previewTemplate.category, previewTemplate.id)
    : null;

  return (
    <div className="min-h-screen bg-background paper-grain">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Back Link */}
          <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-8 transition-colors label-shout text-xs">
            <ArrowLeft className="w-4 h-4" />
            {t("nav.home")}
          </Link>

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <p className="overline-label text-primary mb-3">Studio</p>
            <h1 className="font-display text-5xl md:text-6xl tracking-[0.04em] text-foreground mb-4">
              {category ? `${t(categoryKeys[category] || "category.restaurant")} ${t("nav.templates")}` : t("nav.templates")}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
              {t("templates.title")}
            </p>
          </motion.div>

          {/* Category Tabs */}
          <div className="flex flex-wrap gap-2 mb-10">
            {Object.entries(categoryKeys).map(([key, nameKey]) => {
              const CategoryIcon = categoryIcons[key];
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold uppercase tracking-[0.06em] border-2 border-foreground transition-all duration-150 ${
                    selectedCategory === key
                      ? "bg-foreground text-primary-foreground shadow-offset"
                      : "bg-card text-foreground hover:bg-muted shadow-offset"
                  }`}
                >
                  <CategoryIcon className="w-4 h-4" />
                  {t(nameKey)}
                </button>
              );
            })}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {templates.map((template, index) => {
              const sample = getTemplatePreview(selectedCategory, template.id);
              return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-xl border-2 border-foreground overflow-hidden shadow-offset hover:-translate-y-1 hover:shadow-offset-lg transition-all duration-200">
                  <div className="aspect-[4/3] relative overflow-hidden border-b-2 border-foreground">
                    <div className="absolute top-0 left-0 h-[100%] w-[250%] origin-top-left scale-[0.4] pointer-events-none">
                      <RealMenuDesign
                        compact
                        layout={templateLayout(selectedCategory, template.id)}
                        name={sample.name}
                        categories={sample.categories}
                      />
                    </div>
                    <div className="absolute bottom-3 right-3 z-10 w-8 h-8 rounded-md border-2 border-foreground bg-accent shadow-offset flex items-center justify-center">
                      <template.icon className="w-4 h-4 text-foreground" strokeWidth={2.5} />
                    </div>
                  </div>

                  <div className="p-5 bg-card">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <div className="flex-1">
                        <h3 className="font-display text-xl tracking-[0.04em] text-foreground mb-1">
                          {template.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{template.style}</p>
                      </div>
                      <div 
                        className="w-3 h-3 rounded-sm flex-shrink-0 mt-2 border-2 border-foreground"
                        style={{ backgroundColor: template.accentColor }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePreview(template.id)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4" />
                        {t("templates.preview")}
                      </Button>
                      <Button
                        variant="hero"
                        size="sm"
                        className="flex-1"
                        disabled={checkingPlan}
                        onClick={() => void handleEdit(template.id)}
                      >
                        <Pencil className="w-4 h-4" />
                        {t("templates.edit")}
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
              );
            })}
          </div>
        </div>
      </main>
      <Footer />

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={(open) => !open && setPreviewTemplate(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0 border-2 border-foreground shadow-offset-lg rounded-xl">
          <DialogHeader className="px-6 pt-6 pb-4 border-b-2 border-foreground">
            <DialogTitle className="text-2xl font-display tracking-[0.04em] flex items-center gap-3">
              <span>{previewData?.name}</span>
              <span className="text-sm font-normal text-muted-foreground">—</span>
              <span className="text-sm font-normal text-muted-foreground label-shout">{t("templates.preview")}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
            {previewData && previewTemplate && (
              <MenuPreviewContent 
                data={previewData} 
                layout={getPreviewLayout(previewTemplate.category, previewTemplate.id)} 
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Templates;
