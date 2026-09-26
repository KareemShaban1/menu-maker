import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronDown, ChevronUp, Download, Globe, Share2 } from "lucide-react";
import { getMenu, DesignElement, type TextStyle } from "@/lib/menuStorage";
import RealMenuDesign from "@/components/RealMenuDesign";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { brand } from "@/lib/brand";

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

interface MenuTheme {
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

interface MenuData {
  id: string;
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

// Utility to get menu data (can be extended to fetch from API)
const getMenuData = (menuId: string): MenuData | null => {
  // Try to get from localStorage first
  const savedMenu = getMenu(menuId);
  if (savedMenu) {
    return savedMenu;
  }

  // Fallback to sample data for demo
  return {
    id: menuId,
    name: "Restaurant Menu",
    vendorName: "Sample Restaurant",
    categories: [
      {
        id: "1",
        name: "Appetizers",
        nameAr: "المقبلات",
        items: [
          {
            id: "1",
            name: "Hummus",
            nameAr: "حمص",
            description: "Creamy chickpea dip with olive oil and spices",
            price: 35,
            hasSizes: false,
            sizes: [],
            category: "1",
          },
          {
            id: "2",
            name: "Falafel",
            nameAr: "فلافل",
            description: "Crispy fried chickpea patties",
            price: 25,
            hasSizes: true,
            sizes: [
              { name: "Small (3 pcs)", price: 25 },
              { name: "Medium (5 pcs)", price: 40 },
              { name: "Large (8 pcs)", price: 60 },
            ],
            category: "1",
          },
          {
            id: "3",
            name: "Baba Ganoush",
            nameAr: "بابا غنوج",
            description: "Smoky roasted eggplant dip",
            price: 30,
            hasSizes: false,
            sizes: [],
            category: "1",
          },
        ],
      },
      {
        id: "2",
        name: "Main Dishes",
        nameAr: "الأطباق الرئيسية",
        items: [
          {
            id: "4",
            name: "Grilled Kofta",
            nameAr: "كفتة مشوية",
            description: "Seasoned minced meat skewers with rice and grilled vegetables",
            price: 85,
            hasSizes: false,
            sizes: [],
            category: "2",
          },
          {
            id: "5",
            name: "Shish Tawook",
            nameAr: "شيش طاووق",
            description: "Marinated chicken breast skewers with garlic sauce",
            price: 75,
            hasSizes: false,
            sizes: [],
            category: "2",
          },
          {
            id: "6",
            name: "Mixed Grill",
            nameAr: "مشاوي مشكلة",
            description: "Assorted grilled meats with rice and salad",
            price: 120,
            hasSizes: false,
            sizes: [],
            category: "2",
          },
        ],
      },
      {
        id: "3",
        name: "Beverages",
        nameAr: "المشروبات",
        items: [
          {
            id: "7",
            name: "Fresh Juice",
            nameAr: "عصير طازج",
            description: "Orange, Mango, or Mixed",
            price: 20,
            hasSizes: true,
            sizes: [
              { name: "Regular", price: 20 },
              { name: "Large", price: 30 },
            ],
            category: "3",
          },
          {
            id: "8",
            name: "Turkish Coffee",
            nameAr: "قهوة تركية",
            description: "Traditional strong coffee",
            price: 15,
            hasSizes: false,
            sizes: [],
            category: "3",
          },
          {
            id: "9",
            name: "Mint Lemonade",
            nameAr: "ليمون بالنعناع",
            description: "Refreshing mint and lemon drink",
            price: 18,
            hasSizes: true,
            sizes: [
              { name: "Regular", price: 18 },
              { name: "Large", price: 25 },
            ],
            category: "3",
          },
        ],
      },
      {
        id: "4",
        name: "Desserts",
        nameAr: "الحلويات",
        items: [
          {
            id: "10",
            name: "Baklava",
            nameAr: "بقلاوة",
            description: "Layered pastry with nuts and honey",
            price: 25,
            hasSizes: false,
            sizes: [],
            category: "4",
          },
          {
            id: "11",
            name: "Umm Ali",
            nameAr: "أم علي",
            description: "Traditional Egyptian bread pudding",
            price: 20,
            hasSizes: false,
            sizes: [],
            category: "4",
          },
        ],
      },
    ],
  };
};

const MenuView = () => {
  const { menuId } = useParams<{ menuId: string }>();
  const [menuData, setMenuData] = useState<MenuData | null>(null);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const menuRef = useRef<HTMLDivElement>(null);
  
  // Load language preference from localStorage or default to English
  const [language, setLanguage] = useState<"en" | "ar">(() => {
    const savedLang = localStorage.getItem("menuLanguage");
    return (savedLang === "ar" || savedLang === "en") ? savedLang : "en";
  });

  useEffect(() => {
    if (menuId) {
      const data = getMenuData(menuId);
      setMenuData(data);
      if (data?.language === "ar" || data?.language === "en") {
        setLanguage(data.language);
      }
      // Expand all categories by default
      if (data) {
        setExpandedCategories(new Set(data.categories.map((cat) => cat.id)));
      }
    }
  }, [menuId]);

  // Update HTML lang attribute and save language preference
  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    localStorage.setItem("menuLanguage", language);
  }, [language]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const downloadPDF = async () => {
    if (!menuRef.current || !menuData) return;

    try {
      // Dynamic import of html2pdf.js
      const html2pdf = (await import("html2pdf.js")).default;
      
      // Expand all categories for PDF
      const allCategoryIds = menuData.categories.map(cat => cat.id);
      setExpandedCategories(new Set(allCategoryIds));
      
      // Wait a bit for categories to expand and render
      await new Promise(resolve => setTimeout(resolve, 800));

      // Create a clone of the menu content for PDF (hide header and buttons)
      const printContent = menuRef.current.cloneNode(true) as HTMLElement;
      const header = printContent.querySelector("header");
      const pdfButton = printContent.querySelector("button[aria-label*='Switch']");
      const downloadButton = printContent.querySelector("button:has(svg)");
      
      if (header) header.style.display = "none";
      if (pdfButton) (pdfButton as HTMLElement).style.display = "none";
      if (downloadButton) (downloadButton as HTMLElement).style.display = "none";

      const opt = {
        margin: [10, 10, 10, 10],
        filename: `${menuData.name || "menu"}.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          logging: false,
          backgroundColor: "#ffffff"
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      };

      await html2pdf().set(opt).from(printContent).save();
      
      toast({
        title: "PDF Downloaded",
        description: "Your menu has been downloaded as PDF",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isRTL = language === "ar";

  // Apply theme if available
  const theme = menuData?.theme;
  const cardStyle = theme ? {
    backgroundColor: theme.cardColor || '#ffffff',
    borderColor: theme.borderColor || '#e5e5e5',
  } as React.CSSProperties : {};

  const primaryColor = theme?.primaryColor || '#d97706';
  const textColor = theme?.textColor || '#1a1a1a';
  const borderColor = theme?.borderColor || '#e5e5e5';

  if (!menuData) {
    return (
      <div 
        className="min-h-screen bg-background"
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Header with Language Switcher - Always Visible */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
          <div className="container mx-auto px-4 py-4">
            <div className={`flex items-center ${isRTL ? "flex-row-reverse" : ""} justify-between gap-4`}>
              <h1 className={`font-display text-xl md:text-2xl font-bold text-foreground ${isRTL ? "text-right" : "text-left"}`}>
                {language === "en" ? "Loading..." : "جاري التحميل..."}
              </h1>
              <button
                onClick={() => setLanguage(language === "en" ? "ar" : "en")}
                className={`px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all active:scale-95 flex items-center gap-2 shadow-soft ${isRTL ? "flex-row-reverse" : ""}`}
                aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
                title={language === "en" ? "Switch to Arabic" : "Switch to English"}
              >
                <Globe className="w-4 h-4" />
                <span>{language === "en" ? "عربي" : "English"}</span>
              </button>
            </div>
          </div>
        </header>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className={`text-center ${isRTL ? "text-right" : "text-left"}`}>
            <p className="text-muted-foreground">
              {language === "en" ? "Loading menu..." : "جاري تحميل القائمة..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-[#efeae2] pb-10"
      dir={isRTL ? "rtl" : "ltr"}
      ref={menuRef}
    >
      <header className="sticky top-0 z-50 border-b border-black/5 bg-[#efeae2]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
          <div className="flex min-w-0 items-center gap-3">
            {menuData.vendorLogo ? (
              <img
                src={menuData.vendorLogo}
                alt={menuData.vendorName || menuData.name}
                className="h-10 w-10 shrink-0 rounded-full bg-white object-contain p-1 shadow-soft"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white font-display text-sm font-bold text-foreground shadow-soft">
                {(language === "ar" ? menuData.nameAr || menuData.name : menuData.name).slice(0, 1)}
              </div>
            )}
            <div className="min-w-0">
              {menuData.vendorName && (
                <p className="truncate text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  {menuData.vendorName}
                </p>
              )}
              <h1 className="truncate font-display text-base font-semibold text-foreground md:text-lg">
                {language === "ar" ? menuData.nameAr || menuData.name : menuData.name}
              </h1>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="bg-white/80"
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(window.location.href);
                  toast({
                    title: language === "en" ? "Link copied" : "تم نسخ الرابط",
                    description: language === "en" ? "Share this menu with your guests." : "شارك هذه القائمة مع ضيوفك.",
                  });
                } catch {
                  toast({
                    title: language === "en" ? "Could not copy" : "تعذر النسخ",
                    variant: "destructive",
                  });
                }
              }}
            >
              <Share2 className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "en" ? "Share" : "مشاركة"}</span>
            </Button>
            <Button type="button" onClick={downloadPDF} variant="outline" size="sm" className="bg-white/80">
              <Download className="h-4 w-4" />
              <span className="hidden sm:inline">{language === "en" ? "PDF" : "ملف"}</span>
            </Button>
            <button
              type="button"
              onClick={() => setLanguage(language === "en" ? "ar" : "en")}
              className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-3 text-sm font-semibold text-background shadow-soft"
              aria-label={language === "en" ? "Switch to Arabic" : "Switch to English"}
            >
              <Globe className="h-4 w-4" />
              {language === "en" ? "عربي" : "EN"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 pt-8">
        <div className="space-y-10">
          {Array.from({ length: Math.max(menuData.pages || 1, ...menuData.categories.map((category) => category.page || 1)) }, (_, index) => {
            const page = index + 1;
            const pageCount = Math.max(menuData.pages || 1, ...menuData.categories.map((category) => category.page || 1));
            const pageCategories = menuData.categories.filter((category) => (category.page || 1) === page);
            return (
              <div key={page}>
                {pageCount > 1 && (
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                      {language === "en" ? `Page ${page}` : `صفحة ${page}`}
                    </p>
                    <p className="text-xs text-muted-foreground">{page} / {pageCount}</p>
                  </div>
                )}
                <div className="overflow-hidden rounded-2xl bg-white shadow-[0_24px_60px_-28px_rgba(42,28,12,0.55)] ring-1 ring-black/5">
                  <RealMenuDesign
                    layout={theme?.layout}
                    dir={isRTL ? "rtl" : "ltr"}
                    currency={menuData.currency || "EGP"}
                    titleStyle={menuData.titleStyle}
                    vendorStyle={menuData.vendorStyle}
                    name={language === "ar" ? menuData.nameAr || menuData.name : menuData.name}
                    vendorName={menuData.vendorName}
                    vendorLogo={menuData.vendorLogo}
                    categories={pageCategories.map((category) => ({
                      name: language === "en" ? category.name : category.nameAr || category.name,
                      nameStyle: category.nameStyle,
                      items: category.items.map((item) => ({
                        name: language === "en" ? item.name : item.nameAr || item.name,
                        description: language === "en" ? item.description : item.descriptionAr || item.description,
                        price: item.price,
                        prices: item.hasSizes ? item.sizes : undefined,
                        nameStyle: item.nameStyle,
                        descriptionStyle: item.descriptionStyle,
                        priceStyle: item.priceStyle,
                      })),
                    }))}
                  />
                </div>
              </div>
            );
          })}
        </div>
        {menuData.designElements && menuData.designElements.length > 0 && (() => {
          const allItems: Array<{ type: 'category' | 'element'; data: MenuCategory | DesignElement; index: number }> = [];

          menuData.designElements.forEach((element) => {
            allItems.push({ type: 'element', data: element, index: element.position });
          });
          
          // Sort by index
          allItems.sort((a, b) => a.index - b.index);
          
          return allItems.map((item, idx) => {
            if (item.type === 'element') {
              const element = item.data as DesignElement;
              return (
                <motion.div
                  key={element.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="my-4"
                >
                  {element.type === 'image' && element.imageUrl && (
                    <div style={{ textAlign: element.imageAlign || 'center' }}>
                      <img
                        src={element.imageUrl}
                        alt={element.imageAlt || ''}
                        style={{
                          width: element.imageWidth || '100%',
                          height: element.imageHeight || 'auto',
                          maxWidth: '100%',
                        }}
                        className="rounded-lg"
                      />
                    </div>
                  )}
                  {element.type === 'line' && (
                    <hr
                      style={{
                        borderStyle: element.lineStyle || 'solid',
                        borderWidth: element.lineThickness || '2px',
                        borderColor: element.lineColor || primaryColor,
                        width: element.lineWidth || '100%',
                        margin: '0 auto',
                      }}
                    />
                  )}
                  {element.type === 'divider' && (
                    <hr
                      style={{
                        borderStyle: element.lineStyle || 'solid',
                        borderWidth: element.lineThickness || '1px',
                        borderColor: element.lineColor || borderColor,
                        width: element.lineWidth || '100%',
                        margin: '0 auto',
                      }}
                    />
                  )}
                  {element.type === 'shape' && (
                    <div style={{ textAlign: 'center', margin: '10px 0' }}>
                      <div
                        style={{
                          width: element.shapeSize || '50px',
                          height: element.shapeSize || '50px',
                          backgroundColor: element.shapeColor || primaryColor,
                          borderRadius: element.shapeType === 'circle' ? '50%' : element.shapeType === 'triangle' ? '0' : '4px',
                          clipPath: element.shapeType === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : undefined,
                          display: 'inline-block',
                        }}
                      />
                    </div>
                  )}
                  {element.type === 'spacer' && (
                    <div style={{ height: element.spacerHeight || '20px' }} />
                  )}
                  {element.type === 'text' && (
                    <div
                      style={{
                        textAlign: element.textAlign || 'center',
                        fontSize: element.textSize || '16px',
                        color: element.textColor || textColor,
                        fontWeight: element.textBold ? 'bold' : 'normal',
                        fontStyle: element.textItalic ? 'italic' : 'normal',
                      }}
                    >
                      {element.text || 'Your text here'}
                    </div>
                  )}
                </motion.div>
              );
            } else {
              const category = item.data as MenuCategory;
              const categoryIndex = menuData.categories.findIndex(c => c.id === category.id);
              const isExpanded = expandedCategories.has(category.id);
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: categoryIndex * 0.1 }}
                  className="mb-4"
                >
              {/* Category Header */}
              <div>
                {category.image && (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-40 md:h-48 object-cover rounded-t-2xl mb-0"
                  />
                )}
                <button
                  onClick={() => toggleCategory(category.id)}
                  className={`w-full flex items-center ${isRTL ? "flex-row-reverse" : ""} justify-between p-4 md:p-5 rounded-2xl shadow-soft hover:shadow-card active:scale-[0.98] transition-all duration-300 ${category.image ? 'rounded-t-none' : ''}`}
                  style={cardStyle}
                >
                  <h2 className={`font-display text-lg md:text-xl font-semibold text-foreground flex-1 ${isRTL ? "text-right" : "text-left"}`}>
                    {language === "en" ? category.name : category.nameAr || category.name}
                  </h2>
                  <div className={`flex-shrink-0 ${isRTL ? "ml-2" : "mr-2"}`}>
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </button>
              </div>

              {/* Category Items */}
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="px-1 flex flex-col"
                  style={{
                    marginTop: theme?.spacing ? `${parseInt(theme.spacing) * 2}px` : undefined,
                    gap: theme?.spacing ? `${parseInt(theme.spacing) * 3}px` : '12px',
                  }}
                >
                  {category.items.map((item, itemIndex) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: itemIndex * 0.05 }}
                      className="rounded-xl border shadow-soft hover:shadow-card transition-all duration-300 active:scale-[0.98]"
                      style={{
                        ...cardStyle,
                        padding: theme?.spacing ? `${parseInt(theme.spacing) * 4}px ${parseInt(theme.spacing) * 5}px` : undefined,
                        marginBottom: theme?.spacing ? `${parseInt(theme.spacing) * 2}px` : undefined,
                      }}
                    >
                      <div className={`flex ${isRTL ? "flex-row-reverse" : ""} justify-between items-start gap-4 mb-2`}>
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-semibold text-foreground text-base md:text-lg mb-1.5 ${isRTL ? "text-right" : "text-left"}`}>
                            {language === "en" ? item.name : item.nameAr || item.name}
                          </h3>
                          <p className={`text-sm text-muted-foreground leading-relaxed ${isRTL ? "text-right" : "text-left"}`}>
                            {language === "en" ? item.description : item.descriptionAr || item.description}
                          </p>
                        </div>
                        {!item.hasSizes && (
                          <div 
                            className={`text-lg md:text-xl font-bold whitespace-nowrap flex-shrink-0 ${isRTL ? "mr-2" : "ml-2"}`}
                            style={{ color: primaryColor }}
                          >
                            {item.price} {menuData.currency || "EGP"}
                          </div>
                        )}
                      </div>

                      {/* Sizes */}
                      {item.hasSizes && item.sizes.length > 0 && (
                        <div className={`mt-3 pt-3 border-t border-border`}>
                          <div className={`flex ${isRTL ? "flex-row-reverse" : ""} flex-wrap gap-3 items-center`}>
                            {item.sizes.map((size, sizeIndex) => (
                              <div
                                key={sizeIndex}
                                className={`flex ${isRTL ? "flex-row-reverse" : ""} items-center gap-2 px-3 py-1.5 rounded-lg border`}
                                style={{
                                  backgroundColor: theme?.backgroundColor ? `${theme.backgroundColor}80` : undefined,
                                  borderColor: borderColor,
                                }}
                              >
                                <span className={`text-sm font-medium text-foreground ${isRTL ? "text-right" : "text-left"}`}>
                                  {size.name}
                                </span>
                                <span 
                                  className={`text-sm font-semibold whitespace-nowrap ${isRTL ? "mr-1" : "ml-1"}`}
                                  style={{ color: primaryColor }}
                                >
                                  {size.price} {menuData.currency || "EGP"}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </motion.div>
              );
            }
          });
        })()}
      </main>

      {/* Footer Note */}
      <footer className="mx-auto mt-12 max-w-3xl px-4 text-center">
        <p className="text-sm text-muted-foreground">
          {language === "en" ? "Made with" : "صُنع بواسطة"}{" "}
          <Link to="/" className="font-semibold text-foreground hover:text-primary">
            {brand.name}
          </Link>
        </p>
      </footer>
    </div>
  );
};

export default MenuView;

