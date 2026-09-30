import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CreditCard, LayoutTemplate, Loader2, Shield, Users, UtensilsCrossed } from "lucide-react";
import { adminStatsRequest, type AdminStats } from "@/lib/adminApi";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";

const cards = [
  { key: "users", label: "Users", href: "/admin/users", icon: Users, color: "text-sky-600" },
  { key: "menus", label: "Menus", href: "/admin/menus", icon: UtensilsCrossed, color: "text-amber-600" },
  {
    key: "subscriptions",
    label: "Subscriptions",
    href: "/admin/subscriptions",
    icon: Shield,
    color: "text-emerald-600",
  },
  {
    key: "templates",
    label: "Templates",
    href: "/admin/templates",
    icon: LayoutTemplate,
    color: "text-rose-600",
  },
] as const;

export default function AdminOverview() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminStatsRequest();
        if (!cancelled) setStats(data);
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "Failed to load stats"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  const values: Record<(typeof cards)[number]["key"], { total: number; sub: string }> = {
    users: { total: stats.users.total, sub: `${stats.users.active} active` },
    menus: { total: stats.menus.total, sub: `${stats.menus.published} published` },
    subscriptions: {
      total: stats.subscriptions.total,
      sub: `${stats.subscriptions.active} active`,
    },
    templates: { total: stats.templates.total, sub: `${stats.templates.active} active` },
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <Link
            key={card.key}
            to={card.href}
            className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft transition hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
            <p className="mt-3 font-display text-3xl font-semibold">{values[card.key].total}</p>
            <p className="mt-1 text-xs text-muted-foreground">{values[card.key].sub}</p>
          </Link>
        ))}
      </div>

      <section className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft">
        <div className="mb-4 flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="font-display text-lg font-semibold">Users by plan</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          {stats.usersByPlan.map((row) => (
            <div key={row.plan} className="rounded-xl bg-secondary/60 px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.plan}</p>
              <p className="mt-1 text-2xl font-semibold">{row.count}</p>
            </div>
          ))}
          {stats.usersByPlan.length === 0 && (
            <p className="text-sm text-muted-foreground">No users yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
