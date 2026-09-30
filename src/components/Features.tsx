import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";

const Features = () => {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.home.ar : settings.home.en;

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
            {copy.featuresTitle}
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{copy.featuresSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {copy.features.map((feature, index) => {
            const Icon = resolveIcon(settings.icons.features[index]);
            return (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
                className="group h-full"
              >
                <div className="h-full p-6 rounded-2xl bg-card border border-border shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-300">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 ring-1 ring-primary/15 flex items-center justify-center mb-4 group-hover:bg-gradient-hero group-hover:ring-0 transition-all duration-300">
                    <Icon className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <h3 className="font-display text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
