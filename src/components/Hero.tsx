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
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24 pb-16 paper-grain">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-28 left-[8%] w-24 h-24 border-2 border-foreground/15 rotate-12 rounded-lg" />
        <div className="absolute bottom-32 right-[10%] w-16 h-16 bg-accent border-2 border-foreground rounded-md shadow-offset rotate-6" />
        <div className="absolute top-1/3 right-[6%] w-3 h-28 bg-primary border-2 border-foreground" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center py-8 md:py-[4.5rem]">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="chip-retro mb-8"
          >
            <BadgeIcon className="w-4 h-4" />
            <span>{copy.badge}</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground tracking-[0.06em] mb-3"
          >
            {settings.brand.name}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="font-display text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] leading-[0.95] tracking-[0.04em] text-foreground mb-6"
          >
            {titleParts[0]}
            {copy.titleHighlight ? <span className="text-primary">{copy.titleHighlight}</span> : null}
            {titleParts[1] || ""}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
            className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            {copy.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.25 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link to="/templates">
              <Button variant="hero" size="xl" className="group">
                {copy.ctaStart}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 rtl:group-hover:-translate-x-1 transition-transform rtl:rotate-180" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button variant="outline" size="xl">
                <CtaIcon className="w-5 h-5" />
                {copy.ctaView}
              </Button>
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.35 }}
          className="mt-4 md:mt-8 max-w-3xl mx-auto"
        >
          <div className="relative rounded-xl overflow-hidden border-2 border-foreground bg-card shadow-offset-lg p-3 sm:p-5">
            <div className="rounded-lg border-2 border-foreground bg-muted p-4 sm:p-8">
              <div className="mx-auto max-w-md rounded-lg bg-card border-2 border-foreground shadow-offset overflow-hidden">
                <div className="bg-primary px-5 py-4 flex items-center justify-between text-primary-foreground border-b-2 border-foreground">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-md bg-accent border-2 border-foreground text-foreground flex items-center justify-center">
                      {(() => {
                        const Icon = resolveIcon(icons.categories.restaurant);
                        return <Icon className="w-5 h-5" />;
                      })()}
                    </div>
                    <div className="text-left rtl:text-right">
                      <p className="font-display text-xl tracking-[0.04em] leading-tight">
                        {settings.home.previewName}
                      </p>
                      <p className="text-xs uppercase tracking-[0.08em] font-bold text-primary-foreground/85">
                        {copy.previewLabel}
                      </p>
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-md bg-card border-2 border-foreground text-foreground flex items-center justify-center">
                    <QrIcon className="w-5 h-5" />
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  {settings.home.previewItems.map((item) => {
                    const Icon = resolveIcon(item.icon);
                    return (
                      <div
                        key={item.name}
                        className="flex items-center gap-3 rounded-md border-2 border-foreground bg-muted px-3 py-2.5"
                      >
                        <div className="w-9 h-9 rounded-md bg-primary text-primary-foreground border-2 border-foreground flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="flex-1 text-sm font-semibold text-foreground text-left rtl:text-right">
                          {item.name}
                        </span>
                        <span className="text-sm font-bold text-primary">{item.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.45 }}
          className="grid grid-cols-3 gap-3 sm:gap-5 max-w-lg mx-auto mt-12"
        >
          {settings.home.statsValues.map((value, i) => {
            const Icon = StatIcons[i] || BadgeIcon;
            return (
              <div
                key={`${value}-${i}`}
                className="text-center rounded-lg border-2 border-foreground bg-card p-3 shadow-offset"
              >
                <Icon className="w-4 h-4 mx-auto mb-2 text-primary" />
                <div className="font-display text-3xl md:text-4xl text-primary tracking-[0.04em]">{value}</div>
                <div className="text-[11px] uppercase tracking-[0.06em] font-bold text-muted-foreground mt-1">
                  {copy.statsLabels[i] || ""}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
