import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";

const CATEGORY_META = [
  { id: "restaurant", nameKey: "category.restaurant", descKey: "category.restaurant.desc", tone: "bg-primary text-primary-foreground" },
  { id: "cafe", nameKey: "category.cafe", descKey: "category.cafe.desc", tone: "bg-accent text-foreground" },
  { id: "supermarket", nameKey: "category.supermarket", descKey: "category.supermarket.desc", tone: "bg-foreground text-primary-foreground" },
  { id: "bakery", nameKey: "category.bakery", descKey: "category.bakery.desc", tone: "bg-primary text-primary-foreground" },
  { id: "bar", nameKey: "category.bar", descKey: "category.bar.desc", tone: "bg-accent text-foreground" },
  { id: "fastfood", nameKey: "category.fastfood", descKey: "category.fastfood.desc", tone: "bg-foreground text-primary-foreground" },
] as const;

const Categories = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.home.ar : settings.home.en;

  return (
    <section className="py-20 md:py-24 border-t-2 border-foreground bg-muted/40">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="overline-label text-primary mb-3">Catalog</p>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-[0.04em] mb-4">
            {copy.categoriesTitle}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{copy.categoriesSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {CATEGORY_META.map((category, index) => {
            const Icon = resolveIcon(settings.icons.categories[category.id]);
            const count = settings.home.categoryCounts[category.id] ?? 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.06 }}
              >
                <Link to={`/templates/${category.id}`} className="group block h-full">
                  <div className="relative h-full bg-card rounded-xl border-2 border-foreground p-6 shadow-offset hover:-translate-y-1 hover:shadow-offset-lg transition-all duration-200">
                    <div
                      className={`w-14 h-14 rounded-lg border-2 border-foreground ${category.tone} flex items-center justify-center mb-4 group-hover:-rotate-3 transition-transform duration-200`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <h3 className="font-display text-2xl tracking-[0.04em] text-foreground mb-2">
                      {t(category.nameKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-5 leading-relaxed">{t(category.descKey)}</p>
                    <div className="flex items-center justify-between">
                      <span className="chip-retro !py-1.5 !px-3 !text-xs !shadow-none">
                        {count} {copy.categoriesTemplatesLabel}
                      </span>
                      <span className="w-9 h-9 rounded-md border-2 border-foreground bg-primary text-primary-foreground flex items-center justify-center group-hover:bg-foreground transition-colors">
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Categories;
