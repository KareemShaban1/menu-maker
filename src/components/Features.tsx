import { motion } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";

const Features = () => {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.home.ar : settings.home.en;

  return (
    <section className="py-20 md:py-24 relative overflow-hidden border-t-2 border-foreground paper-grain">
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.45 }}
          className="text-center mb-14"
        >
          <p className="overline-label text-primary mb-3">Why Carta</p>
          <h2 className="font-display text-4xl md:text-6xl text-foreground tracking-[0.04em] mb-4">
            {copy.featuresTitle}
          </h2>
          <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto">{copy.featuresSubtitle}</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {copy.features.map((feature, index) => {
            const Icon = resolveIcon(settings.icons.features[index]);
            return (
              <motion.div
                key={`${feature.title}-${index}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group h-full"
              >
                <div className="h-full p-6 rounded-xl bg-card border-2 border-foreground shadow-offset hover:-translate-y-1 hover:shadow-offset-lg transition-all duration-200">
                  <div className="w-12 h-12 rounded-lg border-2 border-foreground bg-accent flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-display text-xl tracking-[0.04em] text-foreground mb-2">
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
