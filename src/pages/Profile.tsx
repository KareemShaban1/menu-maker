import { FormEvent, useCallback, useEffect, useState } from "react";
import { Link, Navigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Check,
  ExternalLink,
  Loader2,
  Trash2,
  UserRound,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { getAuthErrorMessage, useAuth } from "@/contexts/AuthContext";
import {
  ApiError,
  deleteMenuRequest,
  listMenusRequest,
  type MenuSummary,
  updatePlanRequest,
  updateProfileRequest,
} from "@/lib/api";
import { PLANS, canCreateMenu, formatPlanLimit, getPlanInfo, type PlanId } from "@/lib/plans";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const Profile = () => {
  const { t, language } = useLanguage();
  const ar = language === "ar";
  const { user, loading, isAuthenticated, setUser } = useAuth();
  const [params] = useSearchParams();
  const highlightPlan = (params.get("plan") as PlanId | null) || null;

  const [name, setName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [changingPlan, setChangingPlan] = useState<PlanId | null>(null);
  const [menus, setMenus] = useState<MenuSummary[]>([]);
  const [menusLoading, setMenusLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadMenus = useCallback(async () => {
    setMenusLoading(true);
    try {
      const data = await listMenusRequest();
      setMenus(data);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t("profile.menusLoadError")));
    } finally {
      setMenusLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      void loadMenus();
    }
  }, [user, loadMenus]);

  if (!loading && !isAuthenticated) {
    return <Navigate to="/login?next=/profile" replace />;
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="flex-1 pt-28 pb-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  const plan = getPlanInfo(user.plan);
  const limit = plan.maxMenus;
  const used = menus.length;
  const atLimit = !canCreateMenu(user.plan, used);

  const onSaveName = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(t("profile.nameRequired"));
      return;
    }
    setSavingName(true);
    try {
      const { user: next } = await updateProfileRequest(name.trim());
      setUser(next);
      toast.success(t("profile.nameSaved"));
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t("profile.nameSaveError")));
    } finally {
      setSavingName(false);
    }
  };

  const onSelectPlan = async (planId: PlanId) => {
    if (planId === user.plan) return;
    setChangingPlan(planId);
    try {
      const { user: next } = await updatePlanRequest(planId);
      setUser(next);
      toast.success(t("profile.planUpdated"));
    } catch (err) {
      if (err instanceof ApiError && err.code === "PLAN_CHANGE_DISABLED") {
        toast.error(t("profile.planChangeDisabled"));
      } else {
        toast.error(getAuthErrorMessage(err, t("profile.planUpdateError")));
      }
    } finally {
      setChangingPlan(null);
    }
  };

  const onDeleteMenu = async (id: string) => {
    if (!window.confirm(t("profile.deleteConfirm"))) return;
    setDeletingId(id);
    try {
      await deleteMenuRequest(id);
      setMenus((prev) => prev.filter((m) => m.id !== id));
      toast.success(t("profile.menuDeleted"));
    } catch (err) {
      toast.error(getAuthErrorMessage(err, t("profile.deleteError")));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 pt-28 pb-20">
        <div className="container mx-auto px-4 max-w-5xl space-y-10">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="text-sm font-semibold tracking-widest text-primary uppercase">
              {t("profile.eyebrow")}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold text-foreground">
              {t("profile.title")}
            </h1>
            <p className="mt-2 text-muted-foreground">{t("profile.subtitle")}</p>
            {user.role === "super_admin" && (
              <Button asChild className="mt-4" variant="secondary">
                <Link to="/admin">Open super admin dashboard</Link>
              </Button>
            )}
          </motion.div>

          <section className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <div className="flex items-center gap-3 mb-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <UserRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-semibold">{t("profile.account")}</h2>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <form onSubmit={onSaveName} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="profile-name">{t("auth.name")}</Label>
                  <Input
                    id="profile-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={t("auth.namePlaceholder")}
                  />
                </div>
                <Button type="submit" disabled={savingName}>
                  {savingName ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {t("profile.saveName")}
                </Button>
              </form>
            </div>

            <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
              <h2 className="font-display text-xl font-semibold">{t("profile.usage")}</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {t("profile.currentPlan")}:{" "}
                <span className="font-medium text-foreground">{ar ? plan.nameAr : plan.nameEn}</span>
              </p>
              <div className="mt-6">
                <div className="flex items-end justify-between gap-2">
                  <p className="font-display text-4xl font-bold text-foreground">
                    {used}
                    <span className="ms-1 text-lg font-medium text-muted-foreground">
                      / {formatPlanLimit(user.plan, ar)}
                    </span>
                  </p>
                  <p className="text-sm text-muted-foreground pb-1">{t("profile.menusUsed")}</p>
                </div>
                {limit !== null && (
                  <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", atLimit ? "bg-destructive" : "bg-primary")}
                      style={{ width: `${Math.min(100, (used / limit) * 100)}%` }}
                    />
                  </div>
                )}
                {atLimit && (
                  <p className="mt-3 text-sm text-destructive">{t("profile.atLimit")}</p>
                )}
              </div>
              {atLimit ? (
                <Button variant="hero" className="mt-6" asChild>
                  <Link to="/profile#plans">
                    {t("profile.upgradeToCreate")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </Button>
              ) : (
                <Button variant="hero" className="mt-6" asChild>
                  <Link to="/templates">
                    {t("profile.createMenu")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </Button>
              )}
            </div>
          </section>

          <section id="plans" className="scroll-mt-28">
            <h2 className="font-display text-2xl font-bold text-foreground">{t("profile.plansTitle")}</h2>
            <p className="mt-2 text-muted-foreground">{t("profile.plansSubtitle")}</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {PLANS.map((p) => {
                const current = p.id === user.plan;
                const highlighted = highlightPlan === p.id || p.id === "restaurant";
                return (
                  <article
                    key={p.id}
                    className={cn(
                      "flex flex-col rounded-2xl border p-5 shadow-soft",
                      current ? "border-primary ring-2 ring-primary/30 bg-card" : "border-border bg-card",
                      highlightPlan === p.id && !current && "border-accent"
                    )}
                  >
                    <h3 className="font-display text-lg font-semibold">{ar ? p.nameAr : p.nameEn}</h3>
                    <p className="mt-3 font-display text-3xl font-bold">
                      {ar ? p.priceAr : p.priceEn}
                      <span className="ms-2 text-xs font-medium text-muted-foreground">
                        {ar ? p.periodAr : p.periodEn}
                      </span>
                    </p>
                    <ul className="mt-4 flex-1 space-y-2">
                      {(ar ? p.featuresAr : p.featuresEn).map((f) => (
                        <li key={f} className="flex items-start gap-2 text-sm">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-5"
                      variant={current ? "secondary" : highlighted ? "hero" : "outline"}
                      disabled={current || changingPlan === p.id}
                      onClick={() => void onSelectPlan(p.id)}
                    >
                      {changingPlan === p.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : null}
                      {current
                        ? t("profile.currentBadge")
                        : p.id === "free"
                          ? t("profile.switchFree")
                          : t("profile.upgrade")}
                    </Button>
                  </article>
                );
              })}
            </div>
            <p className="mt-4 text-xs text-muted-foreground">{t("profile.billingNote")}</p>
          </section>

          <section>
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="font-display text-2xl font-bold text-foreground">{t("profile.yourMenus")}</h2>
              {!atLimit && (
                <Button variant="outline" size="sm" asChild>
                  <Link to="/templates">{t("profile.createMenu")}</Link>
                </Button>
              )}
            </div>

            {menusLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : menus.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/60 p-10 text-center">
                <p className="text-muted-foreground">{t("profile.noMenus")}</p>
                <Button variant="hero" className="mt-4" asChild>
                  <Link to="/templates">
                    {t("profile.createMenu")}
                    <ArrowRight className="w-4 h-4 rtl:rotate-180" />
                  </Link>
                </Button>
              </div>
            ) : (
              <ul className="space-y-3">
                {menus.map((menu) => (
                  <li
                    key={menu.id}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground truncate">{menu.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {menu.currency} · {menu.pages} {t("profile.pages")} ·{" "}
                        {menu.isPublished ? t("profile.published") : t("profile.draft")}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/menu/${menu.slug || menu.id}`}>
                          <ExternalLink className="w-4 h-4" />
                          {t("builder.viewMenu")}
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        disabled={deletingId === menu.id}
                        onClick={() => void onDeleteMenu(menu.id)}
                      >
                        {deletingId === menu.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Profile;
