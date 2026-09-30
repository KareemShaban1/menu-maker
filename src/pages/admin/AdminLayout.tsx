import { NavLink, Navigate, Outlet } from "react-router-dom";
import {
  CreditCard,
  LayoutDashboard,
  LayoutTemplate,
  Loader2,
  LogOut,
  Shield,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import BrandLogo from "@/components/BrandLogo";
import { useSiteSettings } from "@/contexts/SiteSettingsContext";
import { Paintbrush } from "lucide-react";

const nav = [
  { to: "/admin", end: true, label: "Overview", icon: LayoutDashboard },
  { to: "/admin/site", label: "Site & branding", icon: Paintbrush },
  { to: "/admin/users", label: "Users", icon: Users },
  { to: "/admin/plans", label: "Plans", icon: CreditCard },
  { to: "/admin/subscriptions", label: "Subscriptions", icon: Shield },
  { to: "/admin/templates", label: "Templates", icon: LayoutTemplate },
  { to: "/admin/menus", label: "Menus", icon: UtensilsCrossed },
];

export default function AdminLayout() {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const { settings } = useSiteSettings();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login?next=/admin" replace />;
  }

  if (user?.role !== "super_admin") {
    return <Navigate to="/profile" replace />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-secondary/80 via-background to-background">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-60 shrink-0 border-r border-border/70 bg-background/70 backdrop-blur-xl md:flex md:flex-col">
          <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border/70">
            <BrandLogo className="h-9 w-9" />
            <div>
              <p className="font-display font-bold leading-tight">{settings.brand.name}</p>
              <p className="text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <nav className="flex-1 space-y-1 p-3">
            {nav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <div className="border-t border-border/70 p-3 space-y-2">
            <p className="px-3 text-xs text-muted-foreground truncate">{user.email}</p>
            <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
              <a href="/">Back to site</a>
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={logout}>
              <LogOut className="h-4 w-4" />
              Sign out
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-20 border-b border-border/70 bg-background/80 backdrop-blur-xl px-4 py-3 md:px-6">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h1 className="font-display text-lg font-semibold md:text-xl">Control center</h1>
                <p className="text-xs text-muted-foreground md:text-sm">
                  Manage users, plans, subscriptions, templates, and menus
                </p>
              </div>
              <div className="flex gap-1 overflow-x-auto md:hidden">
                {nav.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap",
                        isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
            </div>
          </header>
          <main className="flex-1 p-4 md:p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
