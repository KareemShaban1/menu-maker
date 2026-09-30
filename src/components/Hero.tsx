import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { resolveIcon } from "@/lib/iconMap";
import { Link } from "react-router-dom";

const Hero = () => {
  const { language } = useLanguage();
  const { settings } = useSiteSettings();
  const copy = language === "ar" ? settings.home.ar : settings.home.en;
  const icons = settings.icons;

  const BadgeIcon = resolveIcon(icons.heroBadge);
  const StatIcons = [
    resolveIcon(icons.heroStat1),
    resolveIcon(icons.heroStat2),
    resolveIcon(icons.heroStat3),
  ];
  const CtaIcon = resolveIcon(icons.heroCtaSecondary);
  const QrIcon = resolveIcon("QrCode");

  const titleParts = copy.titleHighlight
    ? copy.title.split(copy.titleHighlight)
    : [copy.title, ""];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <div className="absolute inset-0 bg-gradient-to-br from-background via-cream-dark/40 to-background" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div
        className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-golden/15 rounded-full blur-3xl animate-float"
        style={{ animationDelay: "1s" }}
      />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center py-5">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-card border border-border shadow-soft mb-8"
          >
            <BadgeIcon className="w-4 h-4 text-golden" />
            <span className="text-sm font-medium text-secondary-foreground">{copy.badge}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6"
          >
            {titleParts[0]}
            {copy.titleHighlight ? <span className="text-gradient">{copy.titleHighlight}</span> : null}
            {titleParts[1] || ""}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10"
          >
            {copy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/templates">
              <Button variant="hero" size="xl" className="group">
                {copy.ctaStart}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="outline" size="xl" className="bg-card">
                <CtaIcon className="w-5 h-5" />
                {copy.ctaView}
              </Button>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mt-16"
          >
            {settings.home.statsValues.map((value, i) => {
              const Icon = StatIcons[i] || BadgeIcon;
              return (
                <div key={`${value}-${i}`} className="text-center">
                  <Icon className="w-4 h-4 mx-auto mb-2 text-primary" />
                  <div className="font-display text-3xl md:text-4xl font-bold text-gradient">{value}</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {copy.statsLabels[i] || ""}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="mt-16 max-w-3xl mx-auto"
        >
          <div className="relative rounded-3xl overflow-hidden shadow-card border border-border bg-card p-3 sm:p-5">
            <div className="rounded-2xl bg-gradient-to-br from-secondary via-cream-dark to-secondary p-4 sm:p-8">
              <div className="mx-auto max-w-md rounded-2xl bg-card border border-border shadow-soft overflow-hidden">
                <div className="bg-gradient-hero px-5 py-4 flex items-center justify-between text-primary-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                      {(() => {
                        const Icon = resolveIcon(icons.categories.restaurant);
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div className="text-left rtl:text-right">
                      <p className="font-display font-semibold leading-tight">
                        {settings.home.previewName}
                      </p>
                      <p className="text-xs text-primary-foreground/80">{copy.previewLabel}</p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-white/95 text-foreground flex items-center justify-center">
                    <QrIcon className="w-6 h-6" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {settings.home.previewItems.map((item) => {
                    const Icon = resolveIcon(item.icon);
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 rounded-xl bg-secondary/60 px-3 py-2.5"
                      >
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-sm font-medium text-foreground text-left rtl:text-right">
                          {item.name}
                        </span>
                        <span className="text-sm font-semibold text-primary">{item.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
