import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { adminListPlansRequest, adminUpdatePlanRequest, type PlanConfig } from "@/lib/adminApi";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";

function featuresToText(list: string[]) {
  return list.join("\n");
}

function textToFeatures(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function AdminPlans() {
  const [plans, setPlans] = useState<PlanConfig[]>([]);
  const [drafts, setDrafts] = useState<Record<string, PlanConfig>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminListPlansRequest();
        if (cancelled) return;
        setPlans(data);
        setDrafts(Object.fromEntries(data.map((p) => [p.key, { ...p }])));
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "Failed to load plans"));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateDraft = (key: string, patch: Partial<PlanConfig>) => {
    setDrafts((prev) => ({ ...prev, [key]: { ...prev[key], ...patch } }));
  };

  const save = async (key: PlanConfig["key"]) => {
    const draft = drafts[key];
    if (!draft) return;
    setSaving(key);
    try {
      const updated = await adminUpdatePlanRequest(key, {
        nameEn: draft.nameEn,
        nameAr: draft.nameAr,
        priceMonthly: draft.priceMonthly,
        maxMenus: draft.maxMenus,
        featuresEn: draft.featuresEn,
        featuresAr: draft.featuresAr,
        isActive: draft.isActive,
        sortOrder: draft.sortOrder,
      });
      setPlans((prev) => prev.map((p) => (p.key === key ? updated : p)));
      setDrafts((prev) => ({ ...prev, [key]: updated }));
      toast.success(`${key} plan saved`);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Save failed"));
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {plans.map((plan) => {
        const draft = drafts[plan.key] ?? plan;
        return (
          <section
            key={plan.key}
            className="rounded-2xl border border-border/80 bg-background/80 p-5 shadow-soft space-y-4"
          >
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{plan.key}</p>
                <h2 className="font-display text-xl font-semibold">{draft.nameEn}</h2>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`active-${plan.key}`} className="text-xs">
                  Active
                </Label>
                <Switch
                  id={`active-${plan.key}`}
                  checked={draft.isActive}
                  onCheckedChange={(isActive) => updateDraft(plan.key, { isActive })}
                />
              </div>
            </div>

            <div className="grid gap-3">
              <div className="space-y-1.5">
                <Label>Name (EN)</Label>
                <Input
                  value={draft.nameEn}
                  onChange={(e) => updateDraft(plan.key, { nameEn: e.target.value })}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Name (AR)</Label>
                <Input
                  value={draft.nameAr}
                  onChange={(e) => updateDraft(plan.key, { nameAr: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Price / month (EGP)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.priceMonthly}
                    onChange={(e) =>
                      updateDraft(plan.key, { priceMonthly: Number(e.target.value) || 0 })
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Max menus (blank = ∞)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={draft.maxMenus ?? ""}
                    onChange={(e) =>
                      updateDraft(plan.key, {
                        maxMenus: e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Features (EN, one per line)</Label>
                <Textarea
                  rows={4}
                  value={featuresToText(draft.featuresEn)}
                  onChange={(e) =>
                    updateDraft(plan.key, { featuresEn: textToFeatures(e.target.value) })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label>Features (AR, one per line)</Label>
                <Textarea
                  rows={4}
                  value={featuresToText(draft.featuresAr)}
                  onChange={(e) =>
                    updateDraft(plan.key, { featuresAr: textToFeatures(e.target.value) })
                  }
                />
              </div>
            </div>

            <Button className="w-full" disabled={saving === plan.key} onClick={() => void save(plan.key)}>
              {saving === plan.key ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save {plan.key}
            </Button>
          </section>
        );
      })}
    </div>
  );
}
