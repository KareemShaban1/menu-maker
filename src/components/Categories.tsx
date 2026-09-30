import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";

const CATEGORY_META = [
  { id: "restaurant", nameKey: "category.restaurant", descKey: "category.restaurant.desc", color: "from-terracotta to-terracotta-dark" },
  { id: "cafe", nameKey: "category.cafe", descKey: "category.cafe.desc", color: "from-burgundy to-burgundy-light" },
  { id: "supermarket", nameKey: "category.supermarket", descKey: "category.supermarket.desc", color: "from-golden to-golden-light" },
  { id: "bakery", nameKey: "category.bakery", descKey: "category.bakery.desc", color: "from-terracotta-light to-golden" },
  { id: "bar", nameKey: "category.bar", descKey: "category.bar.desc", color: "from-burgundy-light to-terracotta" },
  { id: "fastfood", nameKey: "category.fastfood", descKey: "category.fastfood.desc", color: "from-golden-light to-terracotta-light" },
] as const;

const Categories = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.home.ar : settings.home.en;

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {copy.categoriesTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.categoriesSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORY_META.map((category, index) => {
            const Icon = resolveIcon(settings.icons.categories[category.id]);
            const count = settings.home.categoryCounts[category.id] ?? 0;
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link to={`/templates/${category.id}`} className="group block h-full">
                  <div className="relative h-full bg-card rounded-2xl border border-border p-6 shadow-soft hover:shadow-card hover:-translate-y-1 hover:border-primary/30 transition-all duration-300 overflow-hidden">
                    <div
                      className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${category.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`}
                    />
                    <div
                      className={`w-14 h-14 rounded-xl bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 shadow-soft group-hover:scale-110 transition-transform duration-300`}
                    >
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                      {t(category.nameKey)}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-4">{t(category.descKey)}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-primary">
                        {count} {copy.categoriesTemplatesLabel}
                      </span>
                      <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
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
