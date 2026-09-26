import { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
	ArrowLeft, Plus, Trash2, Save, Eye, GripVertical, X, Upload, Download,
	ChevronLeft, ChevronRight,
	Building2, ExternalLink, Palette, Settings, Type, Layout, Move,
	Image, Minus, Square, Circle, SeparatorHorizontal, Type as TypeIcon, Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	DndContext,
	closestCenter,
	KeyboardSensor,
	PointerSensor,
	useSensor,
	useSensors,
	DragEndEvent,
} from "@dnd-kit/core";
import {
	arrayMove,
	SortableContext,
	sortableKeyboardCoordinates,
	verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { toast } from "@/hooks/use-toast";
import { saveMenu, generateMenuId, MenuData, MenuTheme, DesignElement, DesignElementType, type TextStyle } from "@/lib/menuStorage";
import RealMenuDesign, { templateLayout, type MenuTextChange, type MenuTextTarget } from "@/components/RealMenuDesign";
import TextStyleFields from "@/components/TextStyleFields";
import { SortableCategory } from "@/components/SortableCategory";
import { SortableItem } from "@/components/SortableItem";
import { useLanguage } from "@/contexts/LanguageContext";

interface ItemSize {
	name: string;
	price: number;
}

interface MenuItem {
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

interface MenuCategory {
	id: string;
	name: string;
	nameAr?: string;
	nameStyle?: TextStyle;
	image?: string; // Base64 encoded image or URL
	items: MenuItem[];
	page?: number;
}

const CURRENCIES = ["EGP", "USD", "EUR", "GBP", "SAR", "AED", "KWD", "QAR"];

// Get default theme for each template
const getTemplateTheme = (category: string | undefined, templateId: string | undefined): MenuTheme => {
	if (!category || !templateId) {
		return {
			primaryColor: "#d97706",
			backgroundColor: "#faf8f5",
			textColor: "#1a1a1a",
			cardColor: "#ffffff",
			borderColor: "#e5e5e5",
			fontFamily: "Inter",
			fontSize: "16",
			spacing: "4",
		};
	}

	const templateIdNum = parseInt(templateId, 10);

	// Default themes matching template designs
	const themes: Record<string, Record<number, MenuTheme>> = {
		restaurant: {
			1: { // Elegant Dining
				primaryColor: "#d4af37",
				backgroundColor: "#1a1a2e",
				textColor: "#ffffff",
				cardColor: "#16213e",
				borderColor: "#d4af37",
				fontFamily: "Playfair Display",
				fontSize: "16",
				spacing: "5",
			},
			2: { // Modern Bistro
				primaryColor: "#667eea",
				backgroundColor: "#f8f9fa",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#667eea",
				fontFamily: "Inter",
				fontSize: "16",
				spacing: "4",
			},
			3: { // Oriental Feast
				primaryColor: "#f5576c",
				backgroundColor: "#fff5f5",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#f5576c",
				fontFamily: "Inter",
				fontSize: "16",
				spacing: "4",
			},
			4: { // Seafood Harbor
				primaryColor: "#4facfe",
				backgroundColor: "#f0f9ff",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#4facfe",
				fontFamily: "Inter",
				fontSize: "16",
				spacing: "4",
			},
			5: { // Rustic Kitchen
				primaryColor: "#d97706",
				backgroundColor: "#fff7ed",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#d97706",
				fontFamily: "Lato",
				fontSize: "16",
				spacing: "5",
			},
			6: { // Fine Dining
				primaryColor: "#d4af37",
				backgroundColor: "#1a1a2e",
				textColor: "#ffffff",
				cardColor: "#16213e",
				borderColor: "#d4af37",
				fontFamily: "Playfair Display",
				fontSize: "17",
				spacing: "6",
			},
		},
		cafe: {
			1: { // Coffee House
				primaryColor: "#8b4513",
				backgroundColor: "#fef3e7",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#8b4513",
				fontFamily: "Lato",
				fontSize: "16",
				spacing: "4",
			},
			2: { // Urban Brew
				primaryColor: "#3498db",
				backgroundColor: "#2c3e50",
				textColor: "#ffffff",
				cardColor: "#34495e",
				borderColor: "#3498db",
				fontFamily: "Roboto",
				fontSize: "15",
				spacing: "4",
			},
			3: { // Garden Café
				primaryColor: "#11998e",
				backgroundColor: "#f0fdf4",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#11998e",
				fontFamily: "Open Sans",
				fontSize: "16",
				spacing: "4",
			},
			4: { // Parisian
				primaryColor: "#e91e63",
				backgroundColor: "#fff5f7",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#e91e63",
				fontFamily: "Playfair Display",
				fontSize: "16",
				spacing: "5",
			},
		},
		supermarket: {
			1: { // Clean Catalog
				primaryColor: "#4a5568",
				backgroundColor: "#f5f7fa",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#e2e8f0",
				fontFamily: "Inter",
				fontSize: "15",
				spacing: "3",
			},
			2: { // Fresh Market
				primaryColor: "#10b981",
				backgroundColor: "#f0fdf4",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#10b981",
				fontFamily: "Open Sans",
				fontSize: "16",
				spacing: "4",
			},
			3: { // Price List Pro
				primaryColor: "#3b82f6",
				backgroundColor: "#1f2937",
				textColor: "#ffffff",
				cardColor: "#374151",
				borderColor: "#3b82f6",
				fontFamily: "Roboto",
				fontSize: "15",
				spacing: "4",
			},
		},
		bakery: {
			1: { // Sweet Treats
				primaryColor: "#ec4899",
				backgroundColor: "#fdf2f8",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#ec4899",
				fontFamily: "Lato",
				fontSize: "16",
				spacing: "4",
			},
			2: { // Artisan Bread
				primaryColor: "#92400e",
				backgroundColor: "#fef3e7",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#92400e",
				fontFamily: "Lato",
				fontSize: "16",
				spacing: "5",
			},
			3: { // Pastry Shop
				primaryColor: "#a855f7",
				backgroundColor: "#faf5ff",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#a855f7",
				fontFamily: "Playfair Display",
				fontSize: "16",
				spacing: "5",
			},
		},
		bar: {
			1: { // Cocktail Lounge
				primaryColor: "#fbbf24",
				backgroundColor: "#1e3c72",
				textColor: "#ffffff",
				cardColor: "#2a5298",
				borderColor: "#fbbf24",
				fontFamily: "Playfair Display",
				fontSize: "16",
				spacing: "5",
			},
			2: { // Wine Cellar
				primaryColor: "#dc2626",
				backgroundColor: "#6b2c3e",
				textColor: "#ffffff",
				cardColor: "#8b3a4d",
				borderColor: "#dc2626",
				fontFamily: "Playfair Display",
				fontSize: "16",
				spacing: "5",
			},
			3: { // Sports Bar
				primaryColor: "#f59e0b",
				backgroundColor: "#fff7ed",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#f59e0b",
				fontFamily: "Roboto",
				fontSize: "16",
				spacing: "4",
			},
		},
		fastfood: {
			1: { // Quick Bites
				primaryColor: "#dc2626",
				backgroundColor: "#fff1f2",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#dc2626",
				fontFamily: "Roboto",
				fontSize: "16",
				spacing: "4",
			},
			2: { // Street Food
				primaryColor: "#f76b1c",
				backgroundColor: "#fff7ed",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#f76b1c",
				fontFamily: "Roboto",
				fontSize: "16",
				spacing: "4",
			},
			3: { // Pizza Place
				primaryColor: "#dc2626",
				backgroundColor: "#fff1f2",
				textColor: "#1a1a1a",
				cardColor: "#ffffff",
				borderColor: "#dc2626",
				fontFamily: "Lato",
				fontSize: "16",
				spacing: "4",
			},
		},
	};

	const theme = themes[category]?.[templateIdNum] || {
		primaryColor: "#d97706",
		backgroundColor: "#faf8f5",
		textColor: "#1a1a1a",
		cardColor: "#ffffff",
		borderColor: "#e5e5e5",
		fontFamily: "Inter",
		fontSize: "16",
		spacing: "4",
	};

	return { ...theme, layout: templateLayout(category, templateIdNum) };
};

// Helper function to get template-specific initial data
const getTemplateData = (category: string | undefined, templateId: string | undefined): { name: string; categories: MenuCategory[] } => {
	if (!category || !templateId) {
		return {
			name: "My Restaurant Menu",
			categories: [],
		};
	}

	const templateIdNum = parseInt(templateId, 10);

	// Template data structure (same as in Templates.tsx)
	const templateData: Record<string, Record<number, { name: string; categories: Array<{ name: string; items: Array<{ name: string; description: string; price: number }> }> }>> = {
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

	const data = templateData[category]?.[templateIdNum];
	if (!data) {
		return {
			name: "My Restaurant Menu",
			categories: [],
		};
	}

	// Convert to Builder's MenuCategory format with proper IDs
	const convertedCategories: MenuCategory[] = data.categories.map((cat, catIndex) => {
		const categoryId = `${Date.now()}-${catIndex}`;
		return {
			id: categoryId,
			name: cat.name,
			items: cat.items.map((item, itemIndex) => ({
				id: `${categoryId}-${itemIndex}`,
				name: item.name,
				description: item.description,
				price: item.price,
				hasSizes: false,
				sizes: [],
				category: categoryId,
			})),
		};
	});

	return {
		name: data.name,
		categories: convertedCategories,
	};
};

const Builder = () => {
	const { category, templateId } = useParams();
	const navigate = useNavigate();
	const { t } = useLanguage();

	// Load template-specific data
	const templateData = getTemplateData(category, templateId);
	const defaultTheme = getTemplateTheme(category, templateId);

	const [menuName, setMenuName] = useState(templateData.name);
	const [menuNameAr, setMenuNameAr] = useState("");
	const [currency, setCurrency] = useState("EGP");
	const [menuLanguage, setMenuLanguage] = useState<"en" | "ar">("en");
	const [titleStyle, setTitleStyle] = useState<TextStyle | undefined>();
	const [vendorStyle, setVendorStyle] = useState<TextStyle | undefined>();
	const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
	const [vendorName, setVendorName] = useState("");
	const [vendorLogo, setVendorLogo] = useState<string>("");
	const [savedMenuId, setSavedMenuId] = useState<string | null>(null);
	const [showCustomizePanel, setShowCustomizePanel] = useState(false);
	const logoInputRef = useRef<HTMLInputElement>(null);

	// Theme customization state - initialized with template default
	const [theme, setTheme] = useState<MenuTheme>(defaultTheme);

	// Drag and drop sensors
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	const [categories, setCategories] = useState<MenuCategory[]>(templateData.categories);
	const [pageCount, setPageCount] = useState(1);
	const [activePage, setActivePage] = useState(1);
	const [designElements, setDesignElements] = useState<DesignElement[]>([]);
	const [showDesignPanel, setShowDesignPanel] = useState(false);
	const [editingElement, setEditingElement] = useState<DesignElement | null>(null);
	const [isElementDialogOpen, setIsElementDialogOpen] = useState(false);
	const imageInputRef = useRef<HTMLInputElement>(null);

	// Reload template data and theme when route params change
	useEffect(() => {
		const newTemplateData = getTemplateData(category, templateId);
		const newDefaultTheme = getTemplateTheme(category, templateId);
		setMenuName(newTemplateData.name);
		setCategories(newTemplateData.categories);
		setTheme(newDefaultTheme); // Apply template's default theme
		setPageCount(1);
		setActivePage(1);
		setMenuNameAr("");
		setCurrency("EGP");
		setMenuLanguage("en");
		setTitleStyle(undefined);
		setVendorStyle(undefined);
		setSelectedTextId(null);
	}, [category, templateId]);

	// Cleanup function to ensure items belong to correct categories
	const cleanupCategories = (cats: MenuCategory[]): MenuCategory[] => {
		return cats.map(cat => ({
			...cat,
			items: cat.items.filter(item => item.category === cat.id),
		}));
	};

	const categoryPage = (cat: MenuCategory) => {
		const page = cat.page && cat.page > 0 ? cat.page : 1;
		return Math.min(pageCount, page);
	};

	const visibleCategories = categories.filter((cat) => categoryPage(cat) === activePage);

	const inArabic = menuLanguage === "ar";
	const shownMenuName = inArabic ? (menuNameAr || menuName) : menuName;
	const textOf = (english?: string, arabic?: string) => inArabic ? (arabic || english || "") : (english || "");

	const applyMenuText = (pageCategories: MenuCategory[], change: MenuTextChange) => {
		if (change.kind === "title") {
			if (inArabic) setMenuNameAr(change.value);
			else setMenuName(change.value);
			return;
		}
		if (change.kind === "vendor") {
			setVendorName(change.value);
			return;
		}
		const cat = pageCategories[change.categoryIndex ?? -1];
		if (!cat) return;
		if (change.kind === "category") {
			setCategories((current) => current.map((entry) => entry.id === cat.id
				? { ...entry, ...(inArabic ? { nameAr: change.value } : { name: change.value }) }
				: entry));
			return;
		}
		const item = cat.items.filter((entry) => entry.category === cat.id)[change.itemIndex ?? -1];
		if (!item) return;
		setCategories((current) => current.map((entry) => {
			if (entry.id !== cat.id) return entry;
			return {
				...entry,
				items: entry.items.map((existing) => {
					if (existing.id !== item.id) return existing;
					if (change.kind === "item-name") {
						return inArabic ? { ...existing, nameAr: change.value } : { ...existing, name: change.value };
					}
					if (change.kind === "item-description") {
						return inArabic ? { ...existing, descriptionAr: change.value } : { ...existing, description: change.value };
					}
					const price = Number(change.value.replace(/[^\d.]/g, ""));
					return { ...existing, price: Number.isFinite(price) ? price : existing.price };
				}),
			};
		}));
	};

	const toDesignCategories = (cats: MenuCategory[]) =>
		cats.map((cat) => ({
			name: textOf(cat.name, cat.nameAr),
			nameStyle: cat.nameStyle,
			items: cat.items
				.filter((item) => item.category === cat.id)
				.map((item) => ({
					name: textOf(item.name, item.nameAr),
					description: textOf(item.description, item.descriptionAr),
					price: item.price,
					prices: item.hasSizes ? item.sizes : undefined,
					nameStyle: item.nameStyle,
					descriptionStyle: item.descriptionStyle,
					priceStyle: item.priceStyle,
				})),
		}));

	const textTargetFromId = (id: string): MenuTextTarget => {
		if (id === "vendor") return { kind: "vendor" };
		if (id.startsWith("cat:")) return { kind: "category", categoryIndex: Number(id.slice(4)) };
		const [kind, categoryIndex, itemIndex] = id.split(":");
		if (kind === "name" || kind === "desc" || kind === "price") {
			return {
				kind: kind === "name" ? "item-name" : kind === "desc" ? "item-description" : "item-price",
				categoryIndex: Number(categoryIndex),
				itemIndex: Number(itemIndex),
			};
		}
		return { kind: "title" };
	};

	const textIdFromTarget = (target: MenuTextTarget) => {
		if (target.kind === "title") return "title";
		if (target.kind === "vendor") return "vendor";
		if (target.kind === "category") return `cat:${target.categoryIndex ?? 0}`;
		const prefix = target.kind === "item-name" ? "name" : target.kind === "item-description" ? "desc" : "price";
		return `${prefix}:${target.categoryIndex ?? 0}:${target.itemIndex ?? 0}`;
	};

	const readTextStyle = (id: string): TextStyle | undefined => {
		const target = textTargetFromId(id);
		if (target.kind === "title") return titleStyle;
		if (target.kind === "vendor") return vendorStyle;
		const cat = visibleCategories[target.categoryIndex ?? -1];
		if (!cat) return undefined;
		if (target.kind === "category") return cat.nameStyle;
		const item = cat.items.filter((entry) => entry.category === cat.id)[target.itemIndex ?? -1];
		if (!item) return undefined;
		if (target.kind === "item-name") return item.nameStyle;
		if (target.kind === "item-description") return item.descriptionStyle;
		return item.priceStyle;
	};

	const writeTextStyle = (id: string, style: TextStyle | undefined) => {
		const target = textTargetFromId(id);
		if (target.kind === "title") {
			setTitleStyle(style);
			return;
		}
		if (target.kind === "vendor") {
			setVendorStyle(style);
			return;
		}
		const cat = visibleCategories[target.categoryIndex ?? -1];
		if (!cat) return;
		if (target.kind === "category") {
			setCategories((current) => current.map((entry) => entry.id === cat.id ? { ...entry, nameStyle: style } : entry));
			return;
		}
		const item = cat.items.filter((entry) => entry.category === cat.id)[target.itemIndex ?? -1];
		if (!item) return;
		setCategories((current) => current.map((entry) => {
			if (entry.id !== cat.id) return entry;
			return {
				...entry,
				items: entry.items.map((existing) => {
					if (existing.id !== item.id) return existing;
					if (target.kind === "item-name") return { ...existing, nameStyle: style };
					if (target.kind === "item-description") return { ...existing, descriptionStyle: style };
					return { ...existing, priceStyle: style };
				}),
			};
		}));
	};

	const textChoices = [
		{ id: "title", label: "Menu title" },
		{ id: "vendor", label: "Vendor name" },
		...visibleCategories.flatMap((cat, categoryIndex) => {
			const section = textOf(cat.name, cat.nameAr) || "Section";
			const items = cat.items.filter((item) => item.category === cat.id);
			return [
				{ id: `cat:${categoryIndex}`, label: `Section: ${section}` },
				...items.flatMap((item, itemIndex) => {
					const label = textOf(item.name, item.nameAr) || "Item";
					return [
						{ id: `name:${categoryIndex}:${itemIndex}`, label: `Item: ${label}` },
						{ id: `desc:${categoryIndex}:${itemIndex}`, label: `Description: ${label}` },
						{ id: `price:${categoryIndex}:${itemIndex}`, label: `Price: ${label}` },
					];
				}),
			];
		}),
	];

	const addPage = () => {
		const next = pageCount + 1;
		setPageCount(next);
		setActivePage(next);
	};

	const removePage = (page: number) => {
		if (pageCount <= 1) return;
		setCategories((current) =>
			current.map((cat) => {
				const currentPage = cat.page && cat.page > 0 ? cat.page : 1;
				if (currentPage === page) return { ...cat, page: Math.max(1, page - 1) };
				if (currentPage > page) return { ...cat, page: currentPage - 1 };
				return cat;
			})
		);
		setPageCount((count) => count - 1);
		setActivePage((current) => {
			if (current === page) return Math.max(1, page - 1);
			if (current > page) return current - 1;
			return current;
		});
	};

	const moveCategoryToPage = (categoryId: string, page: number) => {
		setCategories((current) =>
			current.map((cat) => (cat.id === categoryId ? { ...cat, page } : cat))
		);
	};

	const [newCategoryName, setNewCategoryName] = useState("");
	const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
	const [isItemDialogOpen, setIsItemDialogOpen] = useState(false);
	const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
	const [editingCategory, setEditingCategory] = useState<MenuCategory | null>(null);
	const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
	const categoryImageInputRef = useRef<HTMLInputElement>(null);
	const [showMenuPreview, setShowMenuPreview] = useState(false);

	const addCategory = () => {
		if (!newCategoryName.trim()) return;
		const newCategory: MenuCategory = {
			id: Date.now().toString(),
			name: newCategoryName,
			items: [],
			page: activePage,
		};
		setCategories(cleanupCategories([...categories, newCategory]));
		setNewCategoryName("");
		toast({ title: t("builder.categoryAdded"), description: `${newCategoryName} ${t("builder.categoryAdded")}` });
	};

	const deleteCategory = (categoryId: string) => {
		setCategories(cleanupCategories(categories.filter((c) => c.id !== categoryId)));
		toast({ title: t("builder.categoryDeleted") });
	};

	const openEditCategoryDialog = (category: MenuCategory) => {
		setEditingCategory({ ...category });
		setIsCategoryDialogOpen(true);
	};

	const saveCategory = () => {
		if (!editingCategory) return;
		setCategories(categories.map(c =>
			c.id === editingCategory.id ? editingCategory : c
		));
		setEditingCategory(null);
		setIsCategoryDialogOpen(false);
		toast({ title: "Category updated", description: "Category image and details saved" });
	};

	const handleCategoryImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && editingCategory) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditingCategory({
					...editingCategory,
					image: reader.result as string,
				});
			};
			reader.readAsDataURL(file);
		}
	};

	const openAddItemDialog = (categoryId: string) => {
		setSelectedCategoryId(categoryId);
		setEditingItem({
			id: "",
			name: "",
			description: "",
			price: 0,
			hasSizes: false,
			sizes: [],
			category: categoryId,
		});
		setIsItemDialogOpen(true);
	};

	const openEditItemDialog = (item: MenuItem) => {
		setEditingItem({ ...item });
		setSelectedCategoryId(item.category);
		setIsItemDialogOpen(true);
	};

	const saveItem = () => {
		if (!editingItem || !selectedCategoryId) return;

		const cleanedCategories = cleanupCategories(categories);

		setCategories(
			cleanedCategories.map((cat) => {
				if (cat.id !== selectedCategoryId) {
					// Remove item from other categories if it exists (in case category was changed)
					if (editingItem.id) {
						return {
							...cat,
							items: cat.items.filter((item) => item.id !== editingItem.id),
						};
					}
					return cat;
				}

				// Ensure the item's category field matches
				const updatedItem = { ...editingItem, category: selectedCategoryId };

				if (editingItem.id) {
					// Edit existing - make sure we're updating the right item
					return {
						...cat,
						items: cat.items.map((item) =>
							item.id === editingItem.id ? updatedItem : item
						),
					};
				} else {
					// Add new - generate unique ID and ensure category is set
					const newItem = {
						...updatedItem,
						id: `${selectedCategoryId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
					};
					return {
						...cat,
						items: [...cat.items, newItem],
					};
				}
			})
		);

		setIsItemDialogOpen(false);
		setEditingItem(null);
		setSelectedCategoryId(null);
		toast({ title: t("builder.itemSaved") });
	};

	const deleteItem = (categoryId: string, itemId: string) => {
		setCategories(
			categories.map((cat) => {
				if (cat.id !== categoryId) return cat;
				return { ...cat, items: cat.items.filter((item) => item.id !== itemId) };
			})
		);
		toast({ title: t("builder.itemDeleted") });
	};

	const addSize = () => {
		if (!editingItem) return;
		setEditingItem({
			...editingItem,
			sizes: [...editingItem.sizes, { name: "", price: 0 }],
		});
	};

	const updateSize = (index: number, field: "name" | "price", value: string | number) => {
		if (!editingItem) return;
		const newSizes = [...editingItem.sizes];
		newSizes[index] = { ...newSizes[index], [field]: value };
		setEditingItem({ ...editingItem, sizes: newSizes });
	};

	const removeSize = (index: number) => {
		if (!editingItem) return;
		setEditingItem({
			...editingItem,
			sizes: editingItem.sizes.filter((_, i) => i !== index),
		});
	};

	// Design Elements Functions
	const addDesignElement = (type: DesignElementType, position?: number) => {
		const newElement: DesignElement = {
			id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
			type,
			position: position !== undefined ? position : categories.length,
			// Default values based on type
			...(type === 'image' && {
				imageUrl: '',
				imageAlt: '',
				imageWidth: '100%',
				imageHeight: 'auto',
				imageAlign: 'center' as const,
			}),
			...(type === 'line' && {
				lineStyle: 'solid' as const,
				lineWidth: '100%',
				lineThickness: '2px',
				lineColor: theme.primaryColor || '#d97706',
			}),
			...(type === 'divider' && {
				lineStyle: 'solid' as const,
				lineWidth: '100%',
				lineThickness: '1px',
				lineColor: theme.borderColor || '#e5e5e5',
			}),
			...(type === 'shape' && {
				shapeType: 'circle' as const,
				shapeColor: theme.primaryColor || '#d97706',
				shapeSize: '50px',
			}),
			...(type === 'spacer' && {
				spacerHeight: '20px',
			}),
			...(type === 'text' && {
				text: 'Your text here',
				textAlign: 'center' as const,
				textSize: '16px',
				textColor: theme.textColor || '#1a1a1a',
				textBold: false,
				textItalic: false,
			}),
		};

		setEditingElement(newElement);
		setIsElementDialogOpen(true);
	};

	const saveDesignElement = () => {
		if (!editingElement) return;

		if (editingElement.id && designElements.find(e => e.id === editingElement.id)) {
			// Update existing
			setDesignElements(designElements.map(e => e.id === editingElement.id ? editingElement : e));
		} else {
			// Add new
			setDesignElements([...designElements, editingElement]);
		}

		setEditingElement(null);
		setIsElementDialogOpen(false);
		toast({ title: "Design element added", description: `${editingElement.type} element added successfully` });
	};

	const deleteDesignElement = (elementId: string) => {
		setDesignElements(designElements.filter(e => e.id !== elementId));
		toast({ title: "Design element deleted" });
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && editingElement) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setEditingElement({
					...editingElement,
					imageUrl: reader.result as string,
				});
			};
			reader.readAsDataURL(file);
		}
	};

	const moveElementUp = (elementId: string) => {
		const element = designElements.find(e => e.id === elementId);
		if (element && element.position > 0) {
			setDesignElements(designElements.map(e =>
				e.id === elementId
					? { ...e, position: e.position - 1 }
					: e.position === element.position - 1
						? { ...e, position: e.position + 1 }
						: e
			));
		}
	};

	const moveElementDown = (elementId: string) => {
		const element = designElements.find(e => e.id === elementId);
		if (element && element.position < categories.length) {
			setDesignElements(designElements.map(e =>
				e.id === elementId
					? { ...e, position: e.position + 1 }
					: e.position === element.position + 1
						? { ...e, position: e.position - 1 }
						: e
			));
		}
	};

	// Drag and drop handler for design elements
	const handleElementDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeElement = designElements.find(e => e.id === active.id);
		const overElement = designElements.find(e => e.id === over.id);

		if (!activeElement || !overElement) return;

		// Swap positions
		const newPosition = overElement.position;
		const oldPosition = activeElement.position;

		setDesignElements(designElements.map(e => {
			if (e.id === active.id) {
				return { ...e, position: newPosition };
			} else if (e.id === over.id) {
				return { ...e, position: oldPosition };
			}
			return e;
		}));

		toast({ title: "Element position updated" });
	};

	// Combined drag handler for preview (categories and elements)
	const handlePreviewDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (!over || active.id === over.id) return;

		const activeId = String(active.id);
		const overId = String(over.id);

		// Check if dragging a category
		const activeCategory = categories.find(c => c.id === activeId);
		const overCategory = categories.find(c => c.id === overId);

		if (activeCategory && overCategory) {
			// Reorder categories
			const oldIndex = categories.findIndex(c => c.id === activeId);
			const newIndex = categories.findIndex(c => c.id === overId);
			setCategories(arrayMove(categories, oldIndex, newIndex));
			toast({ title: "Category position updated" });
			return;
		}

		// Check if dragging a design element
		const activeElement = designElements.find(e => e.id === activeId);
		const overElement = designElements.find(e => e.id === overId);

		if (activeElement && overElement) {
			// Swap element positions
			const newPosition = overElement.position;
			const oldPosition = activeElement.position;
			setDesignElements(designElements.map(e => {
				if (e.id === activeId) {
					return { ...e, position: newPosition };
				} else if (e.id === overId) {
					return { ...e, position: oldPosition };
				}
				return e;
			}));
			toast({ title: "Element position updated" });
			return;
		}

		// Check if dragging element over a category (insert before/after category)
		if (activeElement && overCategory) {
			const categoryIndex = categories.findIndex(c => c.id === overId);
			setDesignElements(designElements.map(e =>
				e.id === activeId ? { ...e, position: categoryIndex } : e
			));
			toast({ title: "Element position updated" });
			return;
		}

		// Check if dragging category over an element (insert before/after element)
		if (activeCategory && overElement) {
			const elementPosition = overElement.position;
			// Move category to element's position
			const oldIndex = categories.findIndex(c => c.id === activeId);
			const newIndex = Math.min(elementPosition, categories.length - 1);
			if (oldIndex !== newIndex) {
				setCategories(arrayMove(categories, oldIndex, newIndex));
				toast({ title: "Category position updated" });
			}
		}
	};

	// Drag and drop handlers
	const handleCategoryDragEnd = (event: DragEndEvent) => {
		const { active, over } = event;
		if (over && active.id !== over.id) {
			setCategories((items) => {
				const oldIndex = items.findIndex((item) => item.id === active.id);
				const newIndex = items.findIndex((item) => item.id === over.id);
				return arrayMove(items, oldIndex, newIndex);
			});
			toast({ title: "Categories reordered" });
		}
	};

	const handleItemDragEnd = (event: DragEndEvent, categoryId: string) => {
		const { active, over } = event;
		if (!over) return;

		// Ensure we're only moving within the same category
		const sourceCategory = categories.find(cat =>
			cat.items.some(item => item.id === active.id)
		);

		if (!sourceCategory || sourceCategory.id !== categoryId) {
			return; // Prevent cross-category dragging
		}

		if (active.id !== over.id) {
			setCategories((categories) =>
				categories.map((cat) => {
					if (cat.id !== categoryId) return cat;
					const oldIndex = cat.items.findIndex((item) => item.id === active.id);
					const newIndex = cat.items.findIndex((item) => item.id === over.id);
					if (oldIndex === -1 || newIndex === -1) return cat;
					return {
						...cat,
						items: arrayMove(cat.items, oldIndex, newIndex),
					};
				})
			);
		}
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-border shadow-soft">
				<div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
					<div className="flex items-center gap-3 min-w-0">
						<Link
							to="/templates"
							aria-label="Back to templates"
							className="shrink-0 w-9 h-9 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/40 flex items-center justify-center transition-colors"
						>
							<ArrowLeft className="w-4 h-4 rtl:rotate-180" />
						</Link>
						<Input
							value={inArabic ? menuNameAr : menuName}
							onChange={(e) => inArabic ? setMenuNameAr(e.target.value) : setMenuName(e.target.value)}
							dir={inArabic ? "rtl" : "ltr"}
							placeholder={inArabic ? menuName || "اسم القائمة" : undefined}
							className="text-lg font-display font-semibold bg-transparent border-none focus-visible:ring-0 max-w-xs"
						/>
					</div>
					<div className="flex items-center gap-2 flex-wrap justify-end">
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowDesignPanel(!showDesignPanel)}
							aria-label="Design Elements"
							className={showDesignPanel ? "border-primary bg-primary/10 text-primary" : ""}
						>
							<Sparkles className="w-4 h-4" />
							<span className="hidden xl:inline">Design Elements</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowCustomizePanel(!showCustomizePanel)}
							aria-label={t("builder.customize")}
							className={showCustomizePanel ? "border-primary bg-primary/10 text-primary" : ""}
						>
							<Palette className="w-4 h-4" />
							<span className="hidden xl:inline">{t("builder.customize")}</span>
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => setShowMenuPreview(true)}
							aria-label={t("templates.preview")}
						>
							<Eye className="w-4 h-4" />
							<span className="hidden xl:inline">{t("templates.preview")}</span>
						</Button>
						<Button
							variant="default"
							size="sm"
							className="bg-primary hover:bg-primary/90 text-primary-foreground"
							aria-label={t("builder.saveMenu")}
							onClick={() => {
								const menuId = generateMenuId();
								const menuData: MenuData = {
									id: menuId,
									name: menuName,
									categories,
									designElements: designElements.length > 0 ? designElements : undefined,
									vendorName: vendorName || undefined,
									vendorLogo: vendorLogo || undefined,
									theme: theme,
									pages: pageCount,
									currency,
									language: menuLanguage,
									nameAr: menuNameAr,
									titleStyle,
									vendorStyle,
								};
								saveMenu(menuData);
								setSavedMenuId(menuId);
								toast({
									title: t("builder.menuSaved"),
									description: `${t("builder.viewMenu")} ${t("builder.viewMenu")}`,
								});
							}}
						>
							<Save className="w-4 h-4" />
							<span className="hidden sm:inline">{t("builder.saveMenu")}</span>
						</Button>
						{savedMenuId && (
							<Button
								variant="default"
								size="sm"
								onClick={() => navigate(`/menu/${savedMenuId}`)}
								aria-label={t("builder.viewMenu")}
								className="bg-primary hover:bg-primary/90 text-primary-foreground"
							>
								<ExternalLink className="w-4 h-4" />
								<span className="hidden sm:inline">{t("builder.viewMenu")}</span>
							</Button>
						)}
					</div>
				</div>
			</header>

			<main className="container mx-auto px-4 py-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Editor Panel */}
					<div className="lg:col-span-2 space-y-6">
						<div id="text-style-panel" className="bg-card rounded-2xl border border-border p-4 shadow-soft">
							<h3 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
								<Type className="w-5 h-5 text-primary" />
								Editable text
							</h3>
							<p className="text-xs text-muted-foreground mt-1 mb-3">
								Choose a text, or click it in the preview, to edit its font and color.
							</p>
							<div className="max-h-64 overflow-y-auto space-y-1 pr-1">
								{textChoices.map((choice) => {
									const selected = choice.id === selectedTextId;
									const nested = choice.id.startsWith("name:") || choice.id.startsWith("desc:") || choice.id.startsWith("price:");
									return (
										<button
											key={choice.id}
											id={`text-choice-${choice.id}`}
											type="button"
											onClick={() => setSelectedTextId(choice.id)}
											className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${nested ? "pl-8" : ""} ${selected ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
										>
											{choice.label}
										</button>
									);
								})}
							</div>
							{selectedTextId && textChoices.some((choice) => choice.id === selectedTextId) && (
								<div className="mt-3">
									<TextStyleFields
										label={textChoices.find((choice) => choice.id === selectedTextId)?.label ?? "Text style"}
										value={readTextStyle(selectedTextId)}
										onChange={(style) => writeTextStyle(selectedTextId, style)}
									/>
								</div>
							)}
						</div>

						{/* Vendor Info Section */}
						<div className="bg-card rounded-2xl border border-border p-6 shadow-soft">
							<div className="flex items-center gap-2 mb-4">
								<Building2 className="w-5 h-5 text-primary" />
								<h3 className="font-display text-xl font-semibold text-foreground">
									{t("builder.vendorName")}
								</h3>
							</div>
							<div className="space-y-4">
								<div>
									<Label htmlFor="vendorName">{t("builder.vendorName")}</Label>
									<Input
										id="vendorName"
										value={vendorName}
										onChange={(e) => setVendorName(e.target.value)}
										placeholder="e.g., Al-Ahram Restaurant"
										className="mt-1"
									/>
								</div>
								<div>
									<Label htmlFor="vendorLogo">{t("builder.vendorLogo")}</Label>
									<div className="mt-1 flex items-center gap-4">
										<input
											ref={logoInputRef}
											type="file"
											accept="image/*"
											onChange={(e) => {
												const file = e.target.files?.[0];
												if (file) {
													const reader = new FileReader();
													reader.onloadend = () => {
														setVendorLogo(reader.result as string);
													};
													reader.readAsDataURL(file);
												}
											}}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => logoInputRef.current?.click()}
										>
											<Upload className="w-4 h-4 mr-2" />
											{vendorLogo ? t("builder.uploadLogo") : t("builder.uploadLogo")}
										</Button>
										{vendorLogo && (
											<div className="flex items-center gap-2">
												<img
													src={vendorLogo}
													alt="Vendor logo"
													className="w-16 h-16 object-contain rounded-lg border border-border"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													onClick={() => setVendorLogo("")}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* Pages */}
						<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-soft">
							<div className="flex items-center gap-2">
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-8 w-8"
									aria-label="Previous page"
									disabled={activePage <= 1}
									onClick={() => setActivePage((page) => Math.max(1, page - 1))}
								>
									<ChevronLeft className="w-4 h-4" />
								</Button>
								<span className="text-sm font-medium text-foreground min-w-[88px] text-center">
									Page {activePage} of {pageCount}
								</span>
								<Button
									type="button"
									variant="outline"
									size="icon"
									className="h-8 w-8"
									aria-label="Next page"
									disabled={activePage >= pageCount}
									onClick={() => setActivePage((page) => Math.min(pageCount, page + 1))}
								>
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
							<div className="flex items-center gap-2">
								<Button type="button" variant="outline" size="sm" onClick={addPage}>
									<Plus className="w-4 h-4" />
									Add page
								</Button>
								{pageCount > 1 && (
									<Button
										type="button"
										variant="ghost"
										size="sm"
										className="text-destructive hover:text-destructive"
										onClick={() => removePage(activePage)}
									>
										<Trash2 className="w-4 h-4" />
										Remove page
									</Button>
								)}
							</div>
							<div className="flex flex-wrap items-center gap-2">
								<label htmlFor="menu-currency" className="text-xs text-muted-foreground">Currency</label>
								<select
									id="menu-currency"
									value={currency}
									onChange={(e) => setCurrency(e.target.value)}
									className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
								>
									{CURRENCIES.map((code) => (
										<option key={code} value={code}>{code}</option>
									))}
								</select>
								<div className="flex overflow-hidden rounded-md border border-border">
									<button
										type="button"
										onClick={() => setMenuLanguage("en")}
										className={`h-8 px-3 text-xs font-medium ${menuLanguage === "en" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
									>
										EN
									</button>
									<button
										type="button"
										onClick={() => setMenuLanguage("ar")}
										className={`h-8 px-3 text-xs font-medium ${menuLanguage === "ar" ? "bg-primary text-primary-foreground" : "bg-background text-foreground"}`}
									>
										عربي
									</button>
								</div>
							</div>
						</div>

						{/* Categories with Drag and Drop */}
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleCategoryDragEnd}
						>
							<SortableContext items={visibleCategories.map(c => c.id)} strategy={verticalListSortingStrategy}>
								{visibleCategories.length === 0 && (
									<p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center">
										Page {activePage} is empty. Add a category, or move one here from another page.
									</p>
								)}
								{visibleCategories.map((cat) => (
									<SortableCategory key={cat.id} id={cat.id}>
										<motion.div
											initial={{ opacity: 0, y: 10 }}
											animate={{ opacity: 1, y: 0 }}
											className="bg-card rounded-2xl border border-border p-6 shadow-soft ml-8"
										>
											<div className="flex flex-col-reverse gap-5 justify-between mb-4">
												<div className="flex items-center gap-3 flex-1">
													{cat.image && (
														<img
															src={cat.image}
															alt={cat.name}
															className="w-12 h-12 object-cover rounded-lg border border-border"
														/>
													)}
													<div className="flex-1">
														<Input
															value={inArabic ? (cat.nameAr || "") : cat.name}
															onChange={(e) => {
																const value = e.target.value;
																setCategories(categories.map(c =>
																	c.id === cat.id
																		? { ...c, ...(inArabic ? { nameAr: value } : { name: value }) }
																		: c
																));
															}}
															dir={inArabic ? "rtl" : "ltr"}
															className="font-display text-xl font-semibold border-none bg-transparent p-0 h-auto focus-visible:ring-1"
															placeholder={inArabic ? cat.name || "اسم القسم" : t("builder.categoryName")}
														/>
														{(inArabic ? cat.name : cat.nameAr) && (
															<span className="text-muted-foreground text-sm">({inArabic ? cat.name : cat.nameAr})</span>
														)}
													</div>
												</div>
												<div className="flex items-center gap-2">
													<select
														aria-label={`Page for ${cat.name}`}
														value={categoryPage(cat)}
														onChange={(e) => moveCategoryToPage(cat.id, Number(e.target.value))}
														className="h-8 rounded-md border border-border bg-background px-2 text-xs text-foreground"
													>
														{Array.from({ length: pageCount }, (_, index) => (
															<option key={index + 1} value={index + 1}>
																Page {index + 1}
															</option>
														))}
													</select>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openEditCategoryDialog(cat)}
													>
														<Image className="w-4 h-4 mr-1" />
														Edit
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={() => openAddItemDialog(cat.id)}
													>
														<Plus className="w-4 h-4 mr-1" />
														{t("builder.addItem")}
													</Button>
													<Button
														variant="ghost"
														size="icon"
														onClick={() => deleteCategory(cat.id)}
														className="text-destructive hover:text-destructive"
													>
														<Trash2 className="w-4 h-4" />
													</Button>
												</div>
											</div>

											{/* Items with Drag and Drop */}
											<DndContext
												sensors={sensors}
												collisionDetection={closestCenter}
												onDragEnd={(e) => handleItemDragEnd(e, cat.id)}
											>
												<SortableContext items={cat.items.filter(i => i.category === cat.id).map(i => i.id)} strategy={verticalListSortingStrategy}>
													<div className="space-y-3">
														{cat.items
															.filter(item => item.category === cat.id) // Only show items that belong to this category
															.map((item) => (
																<SortableItem key={`${cat.id}-${item.id}`} id={item.id}>
																	<div
																		onClick={() => openEditItemDialog(item)}
																		className="flex items-start justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary cursor-pointer transition-colors ml-6"
																	>
																		<div className="flex-1" dir={inArabic ? "rtl" : "ltr"}>
																			<div className="flex items-center gap-2 mb-1">
																				<h4 className="font-medium text-foreground">{inArabic ? (item.nameAr || item.name) : item.name}</h4>
																				{item.hasSizes && (
																					<span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full">
																						{t("builder.hasSizes")}
																					</span>
																				)}
																			</div>
																			<p className="text-sm text-muted-foreground">{inArabic ? (item.descriptionAr || item.description) : item.description}</p>
																			{item.hasSizes ? (
																				<div className="flex flex-wrap gap-2 mt-2">
																					{item.sizes.map((size, i) => (
																						<span key={i} className="text-xs text-muted-foreground">
																							{size.name}: {size.price} {currency}
																						</span>
																					))}
																				</div>
																			) : (
																				<p className="text-primary font-semibold mt-1">{item.price} {currency}</p>
																			)}
																		</div>
																		<Button
																			variant="ghost"
																			size="icon"
																			onClick={(e) => {
																				e.stopPropagation();
																				deleteItem(cat.id, item.id);
																			}}
																			className="text-destructive hover:text-destructive shrink-0"
																		>
																			<Trash2 className="w-4 h-4" />
																		</Button>
																	</div>
																</SortableItem>
															))}
													</div>
												</SortableContext>
											</DndContext>

											{cat.items.length === 0 && (
												<p className="text-center text-muted-foreground py-8">
													{t("builder.noItems")}
												</p>
											)}
										</motion.div>
									</SortableCategory>
								))}
							</SortableContext>
						</DndContext>

						{/* Add Category */}
						<div className="flex items-center gap-3">
							<Input
								placeholder={t("builder.categoryName")}
								value={newCategoryName}
								onChange={(e) => setNewCategoryName(e.target.value)}
								onKeyPress={(e) => e.key === "Enter" && addCategory()}
								className="max-w-xs"
							/>
							<Button onClick={addCategory} variant="outline">
								<Plus className="w-4 h-4 mr-2" />
								{t("builder.addCategory")}
							</Button>
						</div>
					</div>

					{/* Preview Panel */}
					<div className="lg:col-span-1">
						<div className="sticky top-24 space-y-4">
							<div className="flex items-center justify-between mb-4">
								<h3 className="font-display text-lg font-semibold text-foreground">
									{t("builder.preview")}
								</h3>
								<div className="flex items-center gap-1">
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="h-8 w-8"
										aria-label="Previous page"
										disabled={activePage <= 1}
										onClick={() => setActivePage((page) => Math.max(1, page - 1))}
									>
										<ChevronLeft className="w-4 h-4" />
									</Button>
									<span className="text-xs font-medium text-muted-foreground px-1">
										{activePage}/{pageCount}
									</span>
									<Button
										type="button"
										variant="outline"
										size="icon"
										className="h-8 w-8"
										aria-label="Next page"
										disabled={activePage >= pageCount}
										onClick={() => setActivePage((page) => Math.min(pageCount, page + 1))}
									>
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							</div>
							<div className="bg-primary/10 border border-primary/20 rounded-lg p-2.5 mb-4 flex items-start gap-2">
								<Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
								<p className="text-xs text-primary font-medium">
									Click any menu text to edit the words. Its style opens in the list on the left.
								</p>
							</div>
							<div className="rounded-2xl border shadow-card overflow-hidden max-h-[680px] overflow-y-auto">
								<RealMenuDesign
									layout={theme.layout}
									name={shownMenuName}
									vendorName={vendorName}
									vendorLogo={vendorLogo}
									dir={inArabic ? "rtl" : "ltr"}
									currency={currency}
									titleStyle={titleStyle}
									vendorStyle={vendorStyle}
									categories={toDesignCategories(visibleCategories)}
									onTextChange={(change) => applyMenuText(visibleCategories, change)}
									onTextSelect={(target) => {
										const id = textIdFromTarget(target);
										setSelectedTextId(id);
										requestAnimationFrame(() => {
											document.getElementById("text-style-panel")?.scrollIntoView({ block: "nearest", behavior: "smooth" });
										});
									}}
								/>
							</div>
						</div>
					</div>
				</div>
			</main>

			{/* Customization Panel */}
			{showCustomizePanel && (
				<div className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
								<Palette className="w-6 h-6" />
								{t("builder.customize")}
							</h2>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowCustomizePanel(false)}
							>
								<X className="w-5 h-5" />
							</Button>
						</div>

						<Tabs defaultValue="colors" className="w-full">
							<TabsList className="grid w-full grid-cols-3">
								<TabsTrigger value="colors">
									<Palette className="w-4 h-4 mr-1" />
									Colors
								</TabsTrigger>
								<TabsTrigger value="typography">
									<Type className="w-4 h-4 mr-1" />
									Font
								</TabsTrigger>
								<TabsTrigger value="layout">
									<Layout className="w-4 h-4 mr-1" />
									Layout
								</TabsTrigger>
							</TabsList>

							<TabsContent value="colors" className="space-y-4 mt-4">
								<div>
									<Label>Primary Color</Label>
									<div className="flex items-center gap-3 mt-2">
										<input
											type="color"
											value={theme.primaryColor}
											onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
											className="w-16 h-10 rounded border border-border cursor-pointer"
										/>
										<Input
											value={theme.primaryColor}
											onChange={(e) => setTheme({ ...theme, primaryColor: e.target.value })}
											className="flex-1"
										/>
									</div>
								</div>
								<div>
									<Label>Background Color</Label>
									<div className="flex items-center gap-3 mt-2">
										<input
											type="color"
											value={theme.backgroundColor}
											onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
											className="w-16 h-10 rounded border border-border cursor-pointer"
										/>
										<Input
											value={theme.backgroundColor}
											onChange={(e) => setTheme({ ...theme, backgroundColor: e.target.value })}
											className="flex-1"
										/>
									</div>
								</div>
								<div>
									<Label>Text Color</Label>
									<div className="flex items-center gap-3 mt-2">
										<input
											type="color"
											value={theme.textColor}
											onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
											className="w-16 h-10 rounded border border-border cursor-pointer"
										/>
										<Input
											value={theme.textColor}
											onChange={(e) => setTheme({ ...theme, textColor: e.target.value })}
											className="flex-1"
										/>
									</div>
								</div>
								<div>
									<Label>Card Color</Label>
									<div className="flex items-center gap-3 mt-2">
										<input
											type="color"
											value={theme.cardColor}
											onChange={(e) => setTheme({ ...theme, cardColor: e.target.value })}
											className="w-16 h-10 rounded border border-border cursor-pointer"
										/>
										<Input
											value={theme.cardColor}
											onChange={(e) => setTheme({ ...theme, cardColor: e.target.value })}
											className="flex-1"
										/>
									</div>
								</div>
								<div>
									<Label>Border Color</Label>
									<div className="flex items-center gap-3 mt-2">
										<input
											type="color"
											value={theme.borderColor}
											onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
											className="w-16 h-10 rounded border border-border cursor-pointer"
										/>
										<Input
											value={theme.borderColor}
											onChange={(e) => setTheme({ ...theme, borderColor: e.target.value })}
											className="flex-1"
										/>
									</div>
								</div>
							</TabsContent>

							<TabsContent value="typography" className="space-y-4 mt-4">
								<div>
									<Label>Font Family</Label>
									<select
										value={theme.fontFamily}
										onChange={(e) => setTheme({ ...theme, fontFamily: e.target.value })}
										className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
									>
										<option value="Inter">Inter</option>
										<option value="Playfair Display">Playfair Display</option>
										<option value="Roboto">Roboto</option>
										<option value="Open Sans">Open Sans</option>
										<option value="Lato">Lato</option>
										<option value="Montserrat">Montserrat</option>
									</select>
								</div>
								<div>
									<Label>Font Size: {theme.fontSize}px</Label>
									<Slider
										value={[parseInt(theme.fontSize || "16")]}
										onValueChange={(value) => setTheme({ ...theme, fontSize: value[0].toString() })}
										min={12}
										max={24}
										step={1}
										className="mt-2"
									/>
								</div>
							</TabsContent>

							<TabsContent value="layout" className="space-y-4 mt-4">
								<div>
									<Label>Spacing: {theme.spacing}</Label>
									<Slider
										value={[parseInt(theme.spacing || "4")]}
										onValueChange={(value) => setTheme({ ...theme, spacing: value[0].toString() })}
										min={2}
										max={8}
										step={1}
										className="mt-2"
									/>
								</div>
								<div className="p-4 bg-secondary rounded-lg flex items-start gap-2">
									<GripVertical className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
									<p className="text-sm text-muted-foreground">
										Drag and drop categories and items to reorder them. Use the grip handle to drag.
									</p>
								</div>
							</TabsContent>
						</Tabs>
					</div>
				</div>
			)}

			{/* Design Elements Panel */}
			{showDesignPanel && (
				<div className="fixed left-0 top-0 h-full w-80 bg-card border-r border-border shadow-2xl z-50 overflow-y-auto">
					<div className="p-6">
						<div className="flex items-center justify-between mb-6">
							<h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
								<Sparkles className="w-6 h-6" />
								Design Elements
							</h2>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setShowDesignPanel(false)}
							>
								<X className="w-5 h-5" />
							</Button>
						</div>

						<div className="space-y-3">
							<p className="text-sm text-muted-foreground mb-4">
								Add images, lines, shapes, and more to enhance your menu design
							</p>

							<div className="grid grid-cols-2 gap-2">
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('image')}
								>
									<Image className="w-5 h-5 text-primary" />
									<span className="text-xs">Image</span>
								</Button>
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('line')}
								>
									<Minus className="w-5 h-5 text-primary" />
									<span className="text-xs">Line</span>
								</Button>
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('divider')}
								>
									<SeparatorHorizontal className="w-5 h-5 text-primary" />
									<span className="text-xs">Divider</span>
								</Button>
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('shape')}
								>
									<Circle className="w-5 h-5 text-primary" />
									<span className="text-xs">Shape</span>
								</Button>
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('spacer')}
								>
									<Square className="w-5 h-5 text-primary" />
									<span className="text-xs">Spacer</span>
								</Button>
								<Button
									variant="outline"
									className="h-20 flex flex-col items-center justify-center gap-2 rounded-xl hover:border-primary/40 hover:bg-primary/5"
									onClick={() => addDesignElement('text')}
								>
									<TypeIcon className="w-5 h-5 text-primary" />
									<span className="text-xs">Text</span>
								</Button>
							</div>

							{/* List of added elements with drag and drop */}
							{designElements.length > 0 && (
								<div className="mt-6 space-y-2">
									<h3 className="font-semibold text-sm text-foreground mb-3">Added Elements (Drag to reorder)</h3>
									<DndContext
										sensors={sensors}
										collisionDetection={closestCenter}
										onDragEnd={handleElementDragEnd}
									>
										<SortableContext
											items={designElements.map(e => e.id)}
											strategy={verticalListSortingStrategy}
										>
											<div className="space-y-2">
												{designElements
													.sort((a, b) => a.position - b.position)
													.map((element) => (
														<SortableItem key={element.id} id={element.id}>
															<div className="p-3 bg-secondary rounded-lg flex items-center justify-between gap-2 ml-6">
																<div className="flex items-center gap-2 flex-1 min-w-0">
																	<span className="text-xs font-medium capitalize">{element.type}</span>
																	<span className="text-xs text-muted-foreground">
																		(Pos: {element.position})
																	</span>
																	{element.type === 'image' && element.imageUrl && (
																		<img src={element.imageUrl} alt="" className="w-8 h-8 object-cover rounded" />
																	)}
																</div>
																<div className="flex items-center gap-1">
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-6 w-6"
																		onClick={() => {
																			setEditingElement(element);
																			setIsElementDialogOpen(true);
																		}}
																	>
																		<Eye className="w-3 h-3" />
																	</Button>
																	<Button
																		variant="ghost"
																		size="icon"
																		className="h-6 w-6"
																		onClick={() => deleteDesignElement(element.id)}
																	>
																		<Trash2 className="w-3 h-3" />
																	</Button>
																</div>
															</div>
														</SortableItem>
													))}
											</div>
										</SortableContext>
									</DndContext>
								</div>
							)}
						</div>
					</div>
				</div>
			)}

			{/* Design Element Dialog */}
			<Dialog open={isElementDialogOpen} onOpenChange={setIsElementDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-display">
							{editingElement ? `Edit ${editingElement.type}` : "Add Design Element"}
						</DialogTitle>
					</DialogHeader>

					{editingElement && (
						<div className="space-y-4">
							{/* Image Element */}
							{editingElement.type === 'image' && (
								<>
									<div>
										<Label>Upload Image</Label>
										<input
											ref={imageInputRef}
											type="file"
											accept="image/*"
											onChange={handleImageUpload}
											className="hidden"
										/>
										<Button
											type="button"
											variant="outline"
											onClick={() => imageInputRef.current?.click()}
											className="w-full mt-2"
										>
											<Upload className="w-4 h-4 mr-2" />
											{editingElement.imageUrl ? "Change Image" : "Upload Image"}
										</Button>
										{editingElement.imageUrl && (
											<div className="mt-4">
												<img
													src={editingElement.imageUrl}
													alt="Preview"
													className="w-full max-h-64 object-contain rounded-lg border border-border"
												/>
											</div>
										)}
									</div>
									<div>
										<Label>Alt Text</Label>
										<Input
											value={editingElement.imageAlt || ''}
											onChange={(e) => setEditingElement({ ...editingElement, imageAlt: e.target.value })}
											placeholder="Image description"
										/>
									</div>
									<div className="grid grid-cols-3 gap-4">
										<div>
											<Label>Width</Label>
											<Input
												value={editingElement.imageWidth || '100%'}
												onChange={(e) => setEditingElement({ ...editingElement, imageWidth: e.target.value })}
												placeholder="100%"
											/>
										</div>
										<div>
											<Label>Height</Label>
											<Input
												value={editingElement.imageHeight || 'auto'}
												onChange={(e) => setEditingElement({ ...editingElement, imageHeight: e.target.value })}
												placeholder="auto"
											/>
										</div>
										<div>
											<Label>Align</Label>
											<select
												value={editingElement.imageAlign || 'center'}
												onChange={(e) => setEditingElement({ ...editingElement, imageAlign: e.target.value as 'left' | 'center' | 'right' })}
												className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
											>
												<option value="left">Left</option>
												<option value="center">Center</option>
												<option value="right">Right</option>
											</select>
										</div>
									</div>
								</>
							)}

							{/* Line/Divider Element */}
							{(editingElement.type === 'line' || editingElement.type === 'divider') && (
								<>
									<div>
										<Label>Style</Label>
										<select
											value={editingElement.lineStyle || 'solid'}
											onChange={(e) => setEditingElement({ ...editingElement, lineStyle: e.target.value as 'solid' | 'dashed' | 'dotted' | 'double' })}
											className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
										>
											<option value="solid">Solid</option>
											<option value="dashed">Dashed</option>
											<option value="dotted">Dotted</option>
											<option value="double">Double</option>
										</select>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label>Thickness</Label>
											<Input
												value={editingElement.lineThickness || '2px'}
												onChange={(e) => setEditingElement({ ...editingElement, lineThickness: e.target.value })}
												placeholder="2px"
											/>
										</div>
										<div>
											<Label>Color</Label>
											<div className="flex items-center gap-2 mt-2">
												<input
													type="color"
													value={editingElement.lineColor || '#d97706'}
													onChange={(e) => setEditingElement({ ...editingElement, lineColor: e.target.value })}
													className="w-16 h-10 rounded border border-border cursor-pointer"
												/>
												<Input
													value={editingElement.lineColor || '#d97706'}
													onChange={(e) => setEditingElement({ ...editingElement, lineColor: e.target.value })}
													className="flex-1"
												/>
											</div>
										</div>
									</div>
								</>
							)}

							{/* Shape Element */}
							{editingElement.type === 'shape' && (
								<>
									<div>
										<Label>Shape Type</Label>
										<select
											value={editingElement.shapeType || 'circle'}
											onChange={(e) => setEditingElement({ ...editingElement, shapeType: e.target.value as 'circle' | 'square' | 'rectangle' | 'triangle' })}
											className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
										>
											<option value="circle">Circle</option>
											<option value="square">Square</option>
											<option value="rectangle">Rectangle</option>
											<option value="triangle">Triangle</option>
										</select>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label>Size</Label>
											<Input
												value={editingElement.shapeSize || '50px'}
												onChange={(e) => setEditingElement({ ...editingElement, shapeSize: e.target.value })}
												placeholder="50px"
											/>
										</div>
										<div>
											<Label>Color</Label>
											<div className="flex items-center gap-2 mt-2">
												<input
													type="color"
													value={editingElement.shapeColor || '#d97706'}
													onChange={(e) => setEditingElement({ ...editingElement, shapeColor: e.target.value })}
													className="w-16 h-10 rounded border border-border cursor-pointer"
												/>
												<Input
													value={editingElement.shapeColor || '#d97706'}
													onChange={(e) => setEditingElement({ ...editingElement, shapeColor: e.target.value })}
													className="flex-1"
												/>
											</div>
										</div>
									</div>
								</>
							)}

							{/* Spacer Element */}
							{editingElement.type === 'spacer' && (
								<div>
									<Label>Height</Label>
									<Input
										value={editingElement.spacerHeight || '20px'}
										onChange={(e) => setEditingElement({ ...editingElement, spacerHeight: e.target.value })}
										placeholder="20px"
									/>
								</div>
							)}

							{/* Text Element */}
							{editingElement.type === 'text' && (
								<>
									<div>
										<Label>Text</Label>
										<Textarea
											value={editingElement.text || ''}
											onChange={(e) => setEditingElement({ ...editingElement, text: e.target.value })}
											placeholder="Your text here"
											rows={3}
										/>
									</div>
									<div className="grid grid-cols-2 gap-4">
										<div>
											<Label>Align</Label>
											<select
												value={editingElement.textAlign || 'center'}
												onChange={(e) => setEditingElement({ ...editingElement, textAlign: e.target.value as 'left' | 'center' | 'right' })}
												className="w-full mt-2 px-3 py-2 rounded-md border border-border bg-background"
											>
												<option value="left">Left</option>
												<option value="center">Center</option>
												<option value="right">Right</option>
											</select>
										</div>
										<div>
											<Label>Size</Label>
											<Input
												value={editingElement.textSize || '16px'}
												onChange={(e) => setEditingElement({ ...editingElement, textSize: e.target.value })}
												placeholder="16px"
											/>
										</div>
									</div>
									<div>
										<Label>Color</Label>
										<div className="flex items-center gap-2 mt-2">
											<input
												type="color"
												value={editingElement.textColor || '#1a1a1a'}
												onChange={(e) => setEditingElement({ ...editingElement, textColor: e.target.value })}
												className="w-16 h-10 rounded border border-border cursor-pointer"
											/>
											<Input
												value={editingElement.textColor || '#1a1a1a'}
												onChange={(e) => setEditingElement({ ...editingElement, textColor: e.target.value })}
												className="flex-1"
											/>
										</div>
									</div>
									<div className="flex items-center gap-4">
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={editingElement.textBold || false}
												onChange={(e) => setEditingElement({ ...editingElement, textBold: e.target.checked })}
											/>
											<span className="text-sm">Bold</span>
										</label>
										<label className="flex items-center gap-2">
											<input
												type="checkbox"
												checked={editingElement.textItalic || false}
												onChange={(e) => setEditingElement({ ...editingElement, textItalic: e.target.checked })}
											/>
											<span className="text-sm">Italic</span>
										</label>
									</div>
								</>
							)}

							<div>
								<Label>Position (between categories)</Label>
								<div className="space-y-2">
									<Input
										type="number"
										min={0}
										max={categories.length}
										value={editingElement.position}
										onChange={(e) => setEditingElement({ ...editingElement, position: parseInt(e.target.value) || 0 })}
										className="mb-2"
									/>
									<div className="p-3 bg-secondary rounded-lg text-xs space-y-1">
										<p className="font-semibold mb-2">Position Guide:</p>
										{editingElement.position === 0 && (
											<p className="text-primary font-medium">→ Will appear BEFORE the first category</p>
										)}
										{editingElement.position > 0 && editingElement.position < categories.length && (
											<p className="text-primary font-medium">
												→ Will appear BETWEEN category {editingElement.position} and {editingElement.position + 1}
											</p>
										)}
										{editingElement.position === categories.length && (
											<p className="text-primary font-medium">→ Will appear AFTER the last category</p>
										)}
										{categories.length === 0 && (
											<p className="text-muted-foreground">Add categories first to position elements</p>
										)}
										{categories.length > 0 && (
											<div className="mt-2 pt-2 border-t border-border">
												<p className="text-muted-foreground mb-1">Categories:</p>
												{categories.map((cat, idx) => (
													<div key={cat.id} className="flex items-center gap-2 text-xs">
														<span className={editingElement.position === idx ? "text-primary font-bold" : ""}>
															{idx}. {cat.name}
														</span>
														{editingElement.position === idx && (
															<span className="text-primary">← Element here</span>
														)}
													</div>
												))}
												{editingElement.position === categories.length && (
													<div className="flex items-center gap-2 text-xs mt-1">
														<span className="text-primary font-bold">After all categories</span>
														<span className="text-primary">← Element here</span>
													</div>
												)}
											</div>
										)}
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button variant="outline" onClick={() => setIsElementDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={saveDesignElement}>
									Save Element
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Menu Preview Dialog */}
			<Dialog open={showMenuPreview} onOpenChange={setShowMenuPreview}>
				<DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden p-0">
					<DialogHeader className="px-6 pt-6 pb-4 border-b border-border">
						<DialogTitle className="text-2xl font-display flex items-center gap-3">
							<span>{menuName}</span>
							<span className="text-sm font-normal text-muted-foreground">—</span>
							<span className="text-sm font-normal text-muted-foreground">{t("templates.preview")}</span>
						</DialogTitle>
					</DialogHeader>
										<div className="overflow-y-auto max-h-[calc(90vh-80px)] bg-muted/40 p-6 space-y-8">
						{Array.from({ length: pageCount }, (_, index) => {
							const page = index + 1;
							const pageCategories = categories.filter((cat) => categoryPage(cat) === page);
							return (
								<div key={page}>
									<p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-2">
										Page {page}
									</p>
									<div className="overflow-hidden rounded-2xl border shadow-card">
										<RealMenuDesign
											layout={theme.layout}
											name={shownMenuName}
											vendorName={vendorName}
											vendorLogo={vendorLogo}
											dir={inArabic ? "rtl" : "ltr"}
											currency={currency}
											titleStyle={titleStyle}
											vendorStyle={vendorStyle}
											categories={toDesignCategories(pageCategories)}
											onTextChange={(change) => applyMenuText(pageCategories, change)}
										/>
									</div>
								</div>
							);
						})}
					</div>
				</DialogContent>
			</Dialog>

			{/* Category Edit Dialog */}
			<Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-display">
							Edit Category
						</DialogTitle>
					</DialogHeader>

					{editingCategory && (
						<div className="space-y-4">
							<div>
								<Label>Category Name</Label>
								<Input
									value={editingCategory.name}
									onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
									placeholder="Category name"
									className="mt-2"
								/>
							</div>

							<div>
								<Label>Category Name (Arabic)</Label>
								<Input
									value={editingCategory.nameAr || ''}
									onChange={(e) => setEditingCategory({ ...editingCategory, nameAr: e.target.value })}
									placeholder="اسم الفئة"
									dir="rtl"
									className="mt-2"
								/>
							</div>

							<TextStyleFields
								label="Category name style"
								value={editingCategory.nameStyle}
								onChange={(nameStyle) => setEditingCategory({ ...editingCategory, nameStyle })}
							/>

							<div>
								<Label>Category Image</Label>
								<div className="mt-2 space-y-3">
									<input
										ref={categoryImageInputRef}
										type="file"
										accept="image/*"
										onChange={handleCategoryImageUpload}
										className="hidden"
									/>
									<Button
										type="button"
										variant="outline"
										onClick={() => categoryImageInputRef.current?.click()}
										className="w-full"
									>
										<Upload className="w-4 h-4 mr-2" />
										{editingCategory.image ? "Change Image" : "Upload Image"}
									</Button>

									{editingCategory.image && (
										<div className="space-y-2">
											<p className="text-sm text-muted-foreground">Preview:</p>
											<div className="relative">
												<img
													src={editingCategory.image}
													alt={editingCategory.name}
													className="w-full max-h-64 object-cover rounded-lg border border-border"
												/>
												<Button
													type="button"
													variant="ghost"
													size="icon"
													className="absolute top-2 right-2 bg-background/90 hover:bg-background"
													onClick={() => setEditingCategory({ ...editingCategory, image: undefined })}
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										</div>
									)}
								</div>
							</div>

							<div className="flex justify-end gap-2 pt-4">
								<Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
									Cancel
								</Button>
								<Button onClick={saveCategory}>
									Save Category
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>

			{/* Item Dialog */}
			<Dialog open={isItemDialogOpen} onOpenChange={setIsItemDialogOpen}>
				<DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<DialogTitle className="font-display">
							{editingItem?.id ? t("builder.editItem") : t("builder.addItem")}
						</DialogTitle>
					</DialogHeader>

					{editingItem && (
						<div className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div>
									<Label>{t("builder.itemName")}</Label>
									<Input
										value={editingItem.name}
										onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
										placeholder="e.g., Grilled Chicken"
									/>
								</div>
								<div>
									<Label>{t("builder.itemNameAr")}</Label>
									<Input
										value={editingItem.nameAr || ""}
										onChange={(e) => setEditingItem({ ...editingItem, nameAr: e.target.value })}
										placeholder="e.g., دجاج مشوي"
										dir="rtl"
									/>
								</div>
							</div>
							<TextStyleFields
								label="Item name style"
								value={editingItem.nameStyle}
								onChange={(nameStyle) => setEditingItem({ ...editingItem, nameStyle })}
							/>

							<div>
								<Label>{t("builder.description")}</Label>
								<Textarea
									value={editingItem.description}
									onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
									placeholder="Brief description of the item..."
									rows={2}
								/>
							</div>
							<div>
								<Label>Arabic description</Label>
								<Textarea
									value={editingItem.descriptionAr || ""}
									onChange={(e) => setEditingItem({ ...editingItem, descriptionAr: e.target.value })}
									placeholder="وصف مختصر للصنف"
									dir="rtl"
									rows={2}
								/>
							</div>
							<TextStyleFields
								label="Description style"
								value={editingItem.descriptionStyle}
								onChange={(descriptionStyle) => setEditingItem({ ...editingItem, descriptionStyle })}
							/>

							<div className="flex items-center gap-2">
								<input
									type="checkbox"
									id="hasSizes"
									checked={editingItem.hasSizes}
									onChange={(e) =>
										setEditingItem({ ...editingItem, hasSizes: e.target.checked })
									}
									className="rounded border-border"
								/>
								<Label htmlFor="hasSizes">{t("builder.hasSizes")}</Label>
							</div>

							{!editingItem.hasSizes && (
								<div>
									<Label>Price ({currency})</Label>
									<Input
										type="number"
										value={editingItem.price}
										onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
										placeholder="0"
									/>
								</div>
							)}

							{editingItem.hasSizes && (
								<div>
									<div className="flex items-center justify-between mb-2">
										<Label>{t("builder.hasSizes")}</Label>
										<Button variant="ghost" size="sm" onClick={addSize}>
											<Plus className="w-4 h-4 mr-1" />
											{t("builder.addSize")}
										</Button>
									</div>
									<div className="space-y-2">
										{editingItem.sizes.map((size, index) => (
											<div key={index} className="flex items-center gap-2">
												<Input
													placeholder={t("builder.sizeName")}
													value={size.name}
													onChange={(e) => updateSize(index, "name", e.target.value)}
													className="flex-1"
												/>
												<Input
													type="number"
													placeholder={currency}
													value={size.price}
													onChange={(e) => updateSize(index, "price", Number(e.target.value))}
													className="w-24"
												/>
												<Button
													variant="ghost"
													size="icon"
													onClick={() => removeSize(index)}
													className="text-destructive hover:text-destructive"
												>
													<X className="w-4 h-4" />
												</Button>
											</div>
										))}
									</div>
								</div>
							)}

							<TextStyleFields
								label="Price style"
								value={editingItem.priceStyle}
								onChange={(priceStyle) => setEditingItem({ ...editingItem, priceStyle })}
							/>

							<div className="flex justify-end gap-2 pt-4">
								<Button variant="outline" onClick={() => setIsItemDialogOpen(false)}>
									{t("builder.cancel")}
								</Button>
								<Button variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground" onClick={saveItem}>
									{editingItem.id ? t("builder.save") : t("builder.addItem")}
								</Button>
							</div>
						</div>
					)}
				</DialogContent>
			</Dialog>
		</div>
	);
};

export default Builder;
