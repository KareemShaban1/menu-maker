import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Home, LayoutTemplate, BadgeDollarSign, Info, ArrowRight, LogOut, UserRound, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import BrandLogo from "@/components/BrandLogo";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import LanguageSwitcher from "./LanguageSwitcher";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const { settings } = useSiteSettings();
  const navigate = useNavigate();

  const navLinks = [
    { name: t("nav.home"), href: "/", key: "home", icon: Home },
    { name: t("nav.templates"), href: "/templates", key: "templates", icon: LayoutTemplate },
    { name: t("nav.pricing"), href: "/pricing", key: "pricing", icon: BadgeDollarSign },
    { name: t("nav.about"), href: "/about", key: "about", icon: Info },
  ];

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    toast.success(t("auth.logoutSuccess"));
    navigate("/");
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b-2 border-foreground bg-card">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link to="/" className="flex items-center gap-2.5 group">
            <BrandLogo className="h-10 w-10 border-2 border-foreground shadow-offset transition-transform duration-200 group-hover:-translate-y-0.5" />
            <span className="font-display text-2xl md:text-3xl text-foreground tracking-[0.04em] uppercase">
              {settings.brand.name}
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <NavLink
                key={link.key}
                to={link.href}
                end={link.href === "/"}
                className={({ isActive }) =>
                  cn(
                    "inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-bold uppercase tracking-[0.06em] border-2 transition-colors duration-150",
                    isActive
                      ? "border-foreground bg-foreground text-primary-foreground"
                      : "border-transparent text-foreground hover:border-foreground hover:bg-muted"
                  )
                }
              >
                <link.icon className="w-3.5 h-3.5" />
                {link.name}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <LanguageSwitcher />
            {!loading && isAuthenticated ? (
              <>
                {user?.role === "super_admin" && (
                  <Button variant="ghost" size="sm" asChild>
                    <Link to="/admin">
                      <Shield className="w-4 h-4" />
                      Admin
                    </Link>
                  </Button>
                )}
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/profile" className="max-w-[12rem] truncate">
                    <UserRound className="w-4 h-4" />
                    <span className="truncate">{user?.name || user?.email}</span>
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="w-4 h-4" />
                  {t("nav.signOut")}
                </Button>
              </>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link to="/login">{t("nav.signIn")}</Link>
              </Button>
            )}
            <Button variant="hero" size="sm" asChild>
              <Link to="/templates">
                {t("nav.getStarted")}
                <ArrowRight className="w-4 h-4 rtl:rotate-180" />
              </Link>
            </Button>
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-md border-2 border-foreground bg-card text-foreground shadow-offset hover:bg-muted transition-colors"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden overflow-hidden bg-card border-b-2 border-foreground"
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navLinks.map((link) => (
                <NavLink
                  key={link.key}
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "inline-flex items-center gap-3 rounded-md px-3 py-3 text-sm font-bold uppercase tracking-[0.06em] border-2 transition-colors",
                      isActive
                        ? "border-foreground bg-foreground text-primary-foreground"
                        : "border-transparent text-foreground hover:border-foreground hover:bg-muted"
                    )
                  }
                  onClick={() => setIsMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5 text-primary" />
                  {link.name}
                </NavLink>
              ))}
              <div className="flex flex-col gap-2 pt-4 mt-2 border-t-2 border-foreground">
                <div className="flex justify-center pb-2">
                  <LanguageSwitcher />
                </div>
                {!loading && isAuthenticated ? (
                  <>
                    {user?.role === "super_admin" && (
                      <Button variant="ghost" className="w-full" asChild>
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>
                          <Shield className="w-4 h-4" />
                          Admin
                        </Link>
                      </Button>
                    )}
                    <Button variant="ghost" className="w-full" asChild>
                      <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                        <UserRound className="w-4 h-4" />
                        {t("nav.profile")}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full" onClick={handleLogout}>
                      <LogOut className="w-4 h-4" />
                      {t("nav.signOut")}
                    </Button>
                  </>
                ) : (
                  <Button variant="ghost" className="w-full" asChild>
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      {t("nav.signIn")}
                    </Link>
                  </Button>
                )}
                <Button variant="hero" className="w-full" asChild>
                  <Link to="/templates" onClick={() => setIsMenuOpen(false)}>
                    {t("nav.getStarted")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
