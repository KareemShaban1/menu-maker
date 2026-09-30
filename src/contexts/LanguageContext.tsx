import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "ar";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  isRTL: boolean;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

// Translations
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.templates": "Templates",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.signIn": "Sign In",
    "nav.signOut": "Sign Out",
    "nav.profile": "Profile",
    "nav.getStarted": "Get Started",

    // Auth
    "auth.loginTitle": "Welcome back",
    "auth.loginSubtitle": "Sign in to save and share your menus from any device.",
    "auth.registerTitle": "Create your account",
    "auth.registerSubtitle": "Start building digital menus for your venue.",
    "auth.email": "Email",
    "auth.password": "Password",
    "auth.confirmPassword": "Confirm password",
    "auth.name": "Name",
    "auth.namePlaceholder": "Your name or venue",
    "auth.passwordHint": "At least 8 characters",
    "auth.showPassword": "Show password",
    "auth.hidePassword": "Hide password",
    "auth.signingIn": "Signing in…",
    "auth.creatingAccount": "Creating account…",
    "auth.noAccount": "Don't have an account?",
    "auth.hasAccount": "Already have an account?",
    "auth.createAccount": "Create account",
    "auth.secureNote": "Your menus stay on your account.",
    "auth.loginSuccess": "Signed in successfully",
    "auth.loginError": "Could not sign in",
    "auth.registerSuccess": "Account created",
    "auth.registerError": "Could not create account",
    "auth.passwordMismatch": "Passwords do not match",
    "auth.logoutSuccess": "Signed out",

    // Profile
    "profile.eyebrow": "Account",
    "profile.title": "Your profile",
    "profile.subtitle": "Manage your subscription and menus.",
    "profile.account": "Account details",
    "profile.saveName": "Save name",
    "profile.nameRequired": "Name is required",
    "profile.nameSaved": "Name updated",
    "profile.nameSaveError": "Could not update name",
    "profile.usage": "Plan usage",
    "profile.currentPlan": "Current plan",
    "profile.menusUsed": "menus used",
    "profile.atLimit": "You reached your plan limit. Upgrade to create more menus.",
    "profile.createMenu": "Create a menu",
    "profile.upgradeToCreate": "Upgrade to create more",
    "profile.plansTitle": "Subscription",
    "profile.plansSubtitle": "Choose a plan. Limits apply as soon as you switch.",
    "profile.currentBadge": "Current plan",
    "profile.upgrade": "Upgrade",
    "profile.switchFree": "Switch to Free",
    "profile.planUpdated": "Subscription updated",
    "profile.planUpdateError": "Could not update plan",
    "profile.planChangeDisabled": "Plan changes are disabled on the server",
    "profile.billingNote": "Card payments are not connected yet — plan changes apply immediately for testing.",
    "profile.yourMenus": "Your menus",
    "profile.noMenus": "No menus yet. Pick a template to start.",
    "profile.menusLoadError": "Could not load menus",
    "profile.deleteConfirm": "Delete this menu permanently?",
    "profile.menuDeleted": "Menu deleted",
    "profile.deleteError": "Could not delete menu",
    "profile.pages": "pages",
    "profile.published": "Published",
    "profile.draft": "Draft",
    
    // Hero
    "hero.badge": "Digital menus for restaurants, cafés, and shops anywhere",
    "hero.title": "Create Beautiful Digital Menus in Minutes",
    "hero.titleHighlight": "Digital Menus",
    "hero.subtitle": "Design stunning menus for your restaurant, café, or supermarket with our easy-to-use templates. No design skills needed – just pick, customize, and publish!",
    "hero.cta.start": "Start Creating Free",
    "hero.cta.view": "View Templates",
    "hero.stats.templates": "Templates",
    "hero.stats.users": "Users",
    "hero.stats.menus": "Menus Created",
    "hero.preview": "Menu Preview Area",
    
    // Categories
    "categories.title": "Choose Your Category",
    "categories.subtitle": "Select from our specialized menu templates designed for different business types",
    "categories.templates": "templates",
    "category.restaurant": "Restaurant",
    "category.restaurant.desc": "Full dining menus with appetizers, mains, and desserts",
    "category.cafe": "Café",
    "category.cafe.desc": "Coffee shops, tea houses, and light bites",
    "category.supermarket": "Supermarket",
    "category.supermarket.desc": "Product catalogs and price lists",
    "category.bakery": "Bakery",
    "category.bakery.desc": "Pastries, cakes, and fresh baked goods",
    "category.bar": "Bar & Lounge",
    "category.bar.desc": "Cocktails, wines, and beverages",
    "category.fastfood": "Fast Food",
    "category.fastfood.desc": "Quick service and takeaway menus",
    
    // Features
    "features.title": "Everything You Need",
    "features.subtitle": "Everything you need to publish a menu guests can open on any phone",
    "feature.templates.title": "Beautiful Templates",
    "feature.templates.desc": "Choose from 50+ professionally designed templates for every business type",
    "feature.variants.title": "Item Variants",
    "feature.variants.desc": "Add sizes, types, and options to your items - perfect for drinks, pizzas, and more",
    "feature.qr.title": "QR Code Ready",
    "feature.qr.desc": "Generate QR codes instantly so customers can scan and view your menu",
    "feature.bilingual.title": "Arabic & English",
    "feature.bilingual.desc": "Full RTL support for Arabic menus with seamless bilingual options",
    "feature.mobile.title": "Mobile Optimized",
    "feature.mobile.desc": "Menus look perfect on any device - phones, tablets, or desktop",
    "feature.updates.title": "Real-time Updates",
    "feature.updates.desc": "Update prices and items instantly - changes go live immediately",
    
    // Footer
    "footer.description": "Create a digital menu for any restaurant, café, bakery, or shop.",
    "footer.product": "Product",
    "footer.features": "Features",
    "footer.examples": "Examples",
    "footer.categories": "Categories",
    "footer.support": "Support",
    "footer.help": "Help Center",
    "footer.contact": "Contact Us",
    "footer.privacy": "Privacy Policy",
    "footer.terms": "Terms of Service",
    "footer.rights": "All rights reserved.",
    
    // Builder
    "builder.title": "Menu Builder",
    "builder.menuName": "Menu Name",
    "builder.vendorName": "Vendor/Provider Name",
    "builder.vendorLogo": "Vendor Logo",
    "builder.uploadLogo": "Upload Logo",
    "builder.removeLogo": "Remove Logo",
    "builder.addCategory": "Add Category",
    "builder.categoryName": "Category name",
    "builder.addItem": "Add Item",
    "builder.editItem": "Edit Item",
    "builder.itemName": "Item Name",
    "builder.itemNameAr": "Item Name (Arabic)",
    "builder.description": "Description",
    "builder.price": "Price (EGP)",
    "builder.hasSizes": "Has Multiple Sizes",
    "builder.sizeName": "Size Name",
    "builder.sizePrice": "Size Price (EGP)",
    "builder.addSize": "Add Size",
    "builder.removeSize": "Remove Size",
    "builder.save": "Save",
    "builder.cancel": "Cancel",
    "builder.delete": "Delete",
    "builder.saveMenu": "Save Menu",
    "builder.viewMenu": "View Menu",
    "builder.customize": "Customize",
    "builder.preview": "Live Preview",
    "builder.noItems": "No items yet. Click \"Add Item\" to get started.",
    "builder.categoryAdded": "Category added!",
    "builder.categoryDeleted": "Category deleted",
    "builder.itemSaved": "Item saved",
    "builder.itemDeleted": "Item deleted",
    "builder.menuSaved": "Menu saved successfully!",
    "builder.saveError": "Could not save menu",
    "builder.planLimitTitle": "Plan limit reached",
    "builder.planLimitDesc": "Your subscription does not allow more menus. Upgrade on your profile.",
    "builder.itemsReordered": "Items reordered",
    "builder.categoriesReordered": "Categories reordered",
    
    // Templates
    "templates.back": "Back to Categories",
    "templates.title": "Choose a Template",
    "templates.preview": "Preview",
    "templates.edit": "Edit",
    
    // Menu View
    "menuView.pdf": "PDF",
    "menuView.downloadPDF": "Download PDF",
    "menuView.pdfDownloaded": "PDF downloaded successfully!",
    "menuView.pdfError": "Failed to download PDF",
    
    // NotFound
    "notFound.title": "404",
    "notFound.message": "Oops! Page not found",
    "notFound.return": "Return to Home",
  },
  ar: {
    // Navigation
    "nav.home": "الرئيسية",
    "nav.templates": "القوالب",
    "nav.pricing": "الأسعار",
    "nav.about": "من نحن",
    "nav.signIn": "تسجيل الدخول",
    "nav.signOut": "تسجيل الخروج",
    "nav.profile": "الملف الشخصي",
    "nav.getStarted": "ابدأ الآن",

    // Auth
    "auth.loginTitle": "مرحباً بعودتك",
    "auth.loginSubtitle": "سجّل الدخول لحفظ قوائمك ومشاركتها من أي جهاز.",
    "auth.registerTitle": "إنشاء حساب",
    "auth.registerSubtitle": "ابدأ ببناء قوائم رقمية لمكان عملك.",
    "auth.email": "البريد الإلكتروني",
    "auth.password": "كلمة المرور",
    "auth.confirmPassword": "تأكيد كلمة المرور",
    "auth.name": "الاسم",
    "auth.namePlaceholder": "اسمك أو اسم المكان",
    "auth.passwordHint": "٨ أحرف على الأقل",
    "auth.showPassword": "إظهار كلمة المرور",
    "auth.hidePassword": "إخفاء كلمة المرور",
    "auth.signingIn": "جارٍ تسجيل الدخول…",
    "auth.creatingAccount": "جارٍ إنشاء الحساب…",
    "auth.noAccount": "ليس لديك حساب؟",
    "auth.hasAccount": "لديك حساب بالفعل؟",
    "auth.createAccount": "إنشاء حساب",
    "auth.secureNote": "قوائمك تبقى مرتبطة بحسابك.",
    "auth.loginSuccess": "تم تسجيل الدخول بنجاح",
    "auth.loginError": "تعذّر تسجيل الدخول",
    "auth.registerSuccess": "تم إنشاء الحساب",
    "auth.registerError": "تعذّر إنشاء الحساب",
    "auth.passwordMismatch": "كلمتا المرور غير متطابقتين",
    "auth.logoutSuccess": "تم تسجيل الخروج",

    // Profile
    "profile.eyebrow": "الحساب",
    "profile.title": "ملفك الشخصي",
    "profile.subtitle": "أدر اشتراكك وقوائمك.",
    "profile.account": "بيانات الحساب",
    "profile.saveName": "حفظ الاسم",
    "profile.nameRequired": "الاسم مطلوب",
    "profile.nameSaved": "تم تحديث الاسم",
    "profile.nameSaveError": "تعذّر تحديث الاسم",
    "profile.usage": "استخدام الخطة",
    "profile.currentPlan": "الخطة الحالية",
    "profile.menusUsed": "قوائم مستخدمة",
    "profile.atLimit": "وصلت لحد خطتك. رقِّ لإنشاء المزيد من القوائم.",
    "profile.createMenu": "إنشاء قائمة",
    "profile.upgradeToCreate": "رقِّ لإنشاء المزيد",
    "profile.plansTitle": "الاشتراك",
    "profile.plansSubtitle": "اختر خطة. تُطبَّق الحدود فور التبديل.",
    "profile.currentBadge": "خطتك الحالية",
    "profile.upgrade": "ترقية",
    "profile.switchFree": "الانتقال للمجاني",
    "profile.planUpdated": "تم تحديث الاشتراك",
    "profile.planUpdateError": "تعذّر تحديث الخطة",
    "profile.planChangeDisabled": "تغيير الخطط معطّل على الخادم",
    "profile.billingNote": "الدفع بالبطاقة غير متصل بعد — تغيير الخطة يعمل فوراً للاختبار.",
    "profile.yourMenus": "قوائمك",
    "profile.noMenus": "لا توجد قوائم بعد. اختر قالباً للبدء.",
    "profile.menusLoadError": "تعذّر تحميل القوائم",
    "profile.deleteConfirm": "حذف هذه القائمة نهائياً؟",
    "profile.menuDeleted": "تم حذف القائمة",
    "profile.deleteError": "تعذّر حذف القائمة",
    "profile.pages": "صفحات",
    "profile.published": "منشورة",
    "profile.draft": "مسودة",
    
    // Hero
    "hero.badge": "قوائم رقمية للمطاعم والمقاهي والمتاجر في أي مكان",
    "hero.title": "أنشئ قوائم رقمية جميلة في دقائق",
    "hero.titleHighlight": "القوائم الرقمية",
    "hero.subtitle": "صمم قوائم مذهلة لمطعمك أو مقهاك أو متجرك باستخدام قوالبنا سهلة الاستخدام. لا حاجة لمهارات التصميم – فقط اختر، خصص، وانشر!",
    "hero.cta.start": "ابدأ مجاناً",
    "hero.cta.view": "عرض القوالب",
    "hero.stats.templates": "قالب",
    "hero.stats.users": "مستخدم",
    "hero.stats.menus": "قائمة تم إنشاؤها",
    "hero.preview": "منطقة معاينة القائمة",
    
    // Categories
    "categories.title": "اختر فئتك",
    "categories.subtitle": "اختر من قوالب القوائم المتخصصة المصممة لأنواع مختلفة من الأعمال",
    "categories.templates": "قالب",
    "category.restaurant": "مطعم",
    "category.restaurant.desc": "قوائم طعام كاملة مع المقبلات والأطباق الرئيسية والحلويات",
    "category.cafe": "مقهى",
    "category.cafe.desc": "مقاهي ومتاجر شاي ووجبات خفيفة",
    "category.supermarket": "سوبر ماركت",
    "category.supermarket.desc": "كتالوجات المنتجات وقوائم الأسعار",
    "category.bakery": "مخبز",
    "category.bakery.desc": "المعجنات والكعك والخبز الطازج",
    "category.bar": "بار وصالة",
    "category.bar.desc": "الكوكتيلات والنبيذ والمشروبات",
    "category.fastfood": "وجبات سريعة",
    "category.fastfood.desc": "خدمة سريعة وقوائم للوجبات الجاهزة",
    
    // Features
    "features.title": "كل ما تحتاجه",
    "features.subtitle": "كل ما تحتاجه لنشر قائمة يفتحها الضيف من هاتفه",
    "feature.templates.title": "قوالب جميلة",
    "feature.templates.desc": "اختر من بين أكثر من 50 قالباً مصمماً بشكل احترافي لكل نوع من أنواع الأعمال",
    "feature.variants.title": "متغيرات العناصر",
    "feature.variants.desc": "أضف الأحجام والأنواع والخيارات لعناصرك - مثالي للمشروبات والبيتزا والمزيد",
    "feature.qr.title": "جاهز لرمز QR",
    "feature.qr.desc": "قم بإنشاء رموز QR على الفور حتى يتمكن العملاء من المسح الضوئي وعرض قائمتك",
    "feature.bilingual.title": "عربي وإنجليزي",
    "feature.bilingual.desc": "دعم كامل للاتجاه من اليمين لليسار للقوائم العربية مع خيارات ثنائية اللغة سلسة",
    "feature.mobile.title": "محسّن للجوال",
    "feature.mobile.desc": "تبدو القوائم مثالية على أي جهاز - الهواتف أو الأجهزة اللوحية أو سطح المكتب",
    "feature.updates.title": "تحديثات فورية",
    "feature.updates.desc": "قم بتحديث الأسعار والعناصر على الفور - التغييرات تصبح نشطة فوراً",
    
    // Footer
    "footer.description": "أنشئ قائمة رقمية لأي مطعم أو مقهى أو مخبز أو متجر.",
    "footer.product": "المنتج",
    "footer.features": "الميزات",
    "footer.examples": "أمثلة",
    "footer.categories": "الفئات",
    "footer.support": "الدعم",
    "footer.help": "مركز المساعدة",
    "footer.contact": "اتصل بنا",
    "footer.privacy": "سياسة الخصوصية",
    "footer.terms": "شروط الخدمة",
    "footer.rights": "جميع الحقوق محفوظة.",
    
    // Builder
    "builder.title": "منشئ القوائم",
    "builder.menuName": "اسم القائمة",
    "builder.vendorName": "اسم المزود/المورد",
    "builder.vendorLogo": "شعار المزود",
    "builder.uploadLogo": "رفع الشعار",
    "builder.removeLogo": "إزالة الشعار",
    "builder.addCategory": "إضافة فئة",
    "builder.categoryName": "اسم الفئة",
    "builder.addItem": "إضافة عنصر",
    "builder.editItem": "تعديل عنصر",
    "builder.itemName": "اسم العنصر",
    "builder.itemNameAr": "اسم العنصر (عربي)",
    "builder.description": "الوصف",
    "builder.price": "السعر (جنيه)",
    "builder.hasSizes": "له أحجام متعددة",
    "builder.sizeName": "اسم الحجم",
    "builder.sizePrice": "سعر الحجم (جنيه)",
    "builder.addSize": "إضافة حجم",
    "builder.removeSize": "إزالة الحجم",
    "builder.save": "حفظ",
    "builder.cancel": "إلغاء",
    "builder.delete": "حذف",
    "builder.saveMenu": "حفظ القائمة",
    "builder.viewMenu": "عرض القائمة",
    "builder.customize": "تخصيص",
    "builder.preview": "معاينة مباشرة",
    "builder.noItems": "لا توجد عناصر بعد. انقر على \"إضافة عنصر\" للبدء.",
    "builder.categoryAdded": "تمت إضافة الفئة!",
    "builder.categoryDeleted": "تم حذف الفئة",
    "builder.itemSaved": "تم حفظ العنصر",
    "builder.itemDeleted": "تم حذف العنصر",
    "builder.menuSaved": "تم حفظ القائمة بنجاح!",
    "builder.saveError": "تعذّر حفظ القائمة",
    "builder.planLimitTitle": "وصلت لحد الخطة",
    "builder.planLimitDesc": "اشتراكك لا يسمح بمزيد من القوائم. رقِّ من ملفك الشخصي.",
    "builder.itemsReordered": "تم إعادة ترتيب العناصر",
    "builder.categoriesReordered": "تم إعادة ترتيب الفئات",
    
    // Templates
    "templates.back": "العودة إلى الفئات",
    "templates.title": "اختر قالباً",
    "templates.preview": "معاينة",
    "templates.edit": "تعديل",
    
    // Menu View
    "menuView.pdf": "PDF",
    "menuView.downloadPDF": "تحميل PDF",
    "menuView.pdfDownloaded": "تم تحميل PDF بنجاح!",
    "menuView.pdfError": "فشل تحميل PDF",
    
    // NotFound
    "notFound.title": "404",
    "notFound.message": "عذراً! الصفحة غير موجودة",
    "notFound.return": "العودة إلى الرئيسية",
  },
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider = ({ children }: LanguageProviderProps) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Load from localStorage or default to 'en'
    const saved = localStorage.getItem("language") as Language;
    return saved && (saved === "en" || saved === "ar") ? saved : "en";
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("language", lang);
    // Update document direction and language
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  };

  useEffect(() => {
    // Set initial direction and language
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string): string => {
    return translations[language]?.[key] || key;
  };

  const isRTL = language === "ar";

  return (
    <LanguageContext.Provider value={{ language, setLanguage, isRTL, t }}>
      {children}
    </LanguageContext.Provider>
  );
};



