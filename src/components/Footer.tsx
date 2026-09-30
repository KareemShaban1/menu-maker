import { Link } from "react-router-dom";
import { Facebook, Instagram, Twitter } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import BrandLogo from "@/components/BrandLogo";

const Footer = () => {
  const { t, language } = useLanguage();
  const { settings } = useSiteSettings();
  const footerDesc =
    language === "ar" ? settings.home.ar.footerDescription : settings.home.en.footerDescription;

  const socials = [
    { href: "#", label: "Facebook", icon: Facebook },
    { href: "#", label: "Instagram", icon: Instagram },
    { href: "#", label: "Twitter", icon: Twitter },
  ];

  return (
    <footer className="bg-foreground text-primary-foreground py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2.5 mb-4 group">
              <BrandLogo className="h-10 w-10" />
              <span className="font-display text-xl font-bold">
                {settings.brand.name}
              </span>
            </Link>
            <p className="text-primary-foreground/70 text-sm mb-5 leading-relaxed">
              {footerDesc}
            </p>
            <div className="flex gap-2">
              {socials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  aria-label={social.label}
                  className="w-9 h-9 rounded-lg bg-primary-foreground/10 text-primary-foreground/80 hover:bg-golden hover:text-foreground flex items-center justify-center transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.product")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/templates" className="hover:text-golden transition-colors">{t("nav.templates")}</Link></li>
              <li><Link to="/pricing" className="hover:text-golden transition-colors">{t("nav.pricing")}</Link></li>
              <li><Link to="/features" className="hover:text-golden transition-colors">{t("footer.features")}</Link></li>
              <li><Link to="/examples" className="hover:text-golden transition-colors">{t("footer.examples")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.categories")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/templates/restaurant" className="hover:text-golden transition-colors">{t("category.restaurant")}</Link></li>
              <li><Link to="/templates/cafe" className="hover:text-golden transition-colors">{t("category.cafe")}</Link></li>
              <li><Link to="/templates/supermarket" className="hover:text-golden transition-colors">{t("category.supermarket")}</Link></li>
              <li><Link to="/templates/bakery" className="hover:text-golden transition-colors">{t("category.bakery")}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">{t("footer.support")}</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><Link to="/help" className="hover:text-golden transition-colors">{t("footer.help")}</Link></li>
              <li><Link to="/contact" className="hover:text-golden transition-colors">{t("footer.contact")}</Link></li>
              <li><Link to="/privacy" className="hover:text-golden transition-colors">{t("footer.privacy")}</Link></li>
              <li><Link to="/terms" className="hover:text-golden transition-colors">{t("footer.terms")}</Link></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-primary-foreground/10 text-center text-sm text-primary-foreground/50">
          <p>© {new Date().getFullYear()} {settings.brand.name}. {t("footer.rights")}</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
