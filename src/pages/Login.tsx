import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BrandLogo from "@/components/BrandLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthErrorMessage, useAuth } from "@/contexts/AuthContext";
import { brand } from "@/lib/brand";
import { toast } from "sonner";

const Login = () => {
  const { t } = useLanguage();
  const { login, user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirectTo = params.get("next") || "/templates";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      const explicitNext = params.get("next");
      const dest =
        user.role === "super_admin" && (!explicitNext || explicitNext === "/templates")
          ? "/admin"
          : redirectTo;
      navigate(dest, { replace: true });
    }
  }, [loading, isAuthenticated, user, navigate, redirectTo, params]);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const nextUser = await login(email.trim(), password);
      toast.success(t("auth.loginSuccess"));
      const explicitNext = params.get("next");
      const dest =
        nextUser.role === "super_admin" && (!explicitNext || explicitNext === "/templates")
          ? "/admin"
          : redirectTo;
      navigate(dest, { replace: true });
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t("auth.loginError")));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-24 pb-16 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-70"
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 10% 0%, hsl(20 60% 50% / 0.12), transparent 55%), radial-gradient(ellipse 60% 40% at 90% 20%, hsl(38 80% 55% / 0.14), transparent 50%)",
          }}
        />
        <div className="container relative mx-auto px-4 flex justify-center">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full max-w-md"
          >
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center mb-4">
                <BrandLogo className="h-12 w-12 shadow-soft" />
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground tracking-tight">
                {t("auth.loginTitle")}
              </h1>
              <p className="mt-2 text-muted-foreground">{t("auth.loginSubtitle")}</p>
            </div>

            <form
              onSubmit={onSubmit}
              className="rounded-2xl border border-border/80 bg-card/90 backdrop-blur-sm p-6 md:p-8 shadow-soft space-y-5"
            >
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@restaurant.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password")}</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    minLength={8}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pe-10"
                  />
                  <button
                    type="button"
                    className="absolute end-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? t("auth.hidePassword") : t("auth.showPassword")}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button type="submit" variant="hero" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("auth.signingIn")}
                  </>
                ) : (
                  <>
                    {t("nav.signIn")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                {t("auth.noAccount")}{" "}
                <Link to="/register" className="font-medium text-primary hover:underline">
                  {t("auth.createAccount")}
                </Link>
              </p>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              {brand.name} — {t("auth.secureNote")}
            </p>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Login;
