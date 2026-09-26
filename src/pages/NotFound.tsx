import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const location = useLocation();
  const { t } = useLanguage();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <BrandLogo className="mx-auto mb-6 h-16 w-16 shadow-glow" />
        <p className="text-sm font-semibold tracking-widest text-primary mb-2">404</p>
        <h1 className="mb-3 font-display text-4xl font-bold text-foreground">{t("notFound.title")}</h1>
        <p className="mb-8 text-lg text-muted-foreground">{t("notFound.message")}</p>
        <Button variant="hero" asChild>
          <Link to="/">
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            {t("notFound.return")}
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
