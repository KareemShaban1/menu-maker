import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  adminListTemplatesRequest,
  adminUpdateTemplateRequest,
  type TemplateRow,
} from "@/lib/adminApi";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminTemplates() {
  const [items, setItems] = useState<TemplateRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminListTemplatesRequest();
      setItems(data);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Failed to load templates"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const patch = async (id: string, body: Partial<TemplateRow>) => {
    setBusyId(id);
    try {
      const updated = await adminUpdateTemplateRequest(id, body);
      setItems((prev) => prev.map((t) => (t.id === id ? updated : t)));
      toast.success("Template updated");
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const categories = Array.from(new Set(items.map((t) => t.category)));
  const visible = filter === "all" ? items : items.filter((t) => t.category === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant={filter === "all" ? "default" : "outline"}
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        {categories.map((c) => (
          <Button
            key={c}
            size="sm"
            variant={filter === c ? "default" : "outline"}
            onClick={() => setFilter(c)}
          >
            {c}
          </Button>
        ))}
      </div>

      <div className="rounded-2xl border border-border/80 bg-background/80 shadow-soft overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Preview</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Layout</TableHead>
                <TableHead>Order</TableHead>
                <TableHead>Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visible.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div
                      className="h-12 w-20 rounded-md border border-border/60"
                      style={{ background: t.gradient }}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      className="h-8 max-w-[180px]"
                      defaultValue={t.name}
                      disabled={busyId === t.id}
                      onBlur={(e) => {
                        if (e.target.value.trim() && e.target.value !== t.name) {
                          void patch(t.id, { name: e.target.value.trim() });
                        }
                      }}
                    />
                    <p className="mt-1 text-xs text-muted-foreground">{t.style}</p>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {t.category} #{t.localId}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs font-mono">{t.layoutKey}</TableCell>
                  <TableCell>
                    <Input
                      className="h-8 w-16"
                      type="number"
                      defaultValue={t.sortOrder}
                      disabled={busyId === t.id}
                      onBlur={(e) => {
                        const sortOrder = Number(e.target.value);
                        if (!Number.isNaN(sortOrder) && sortOrder !== t.sortOrder) {
                          void patch(t.id, { sortOrder });
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={t.isActive}
                      disabled={busyId === t.id}
                      onCheckedChange={(isActive) => void patch(t.id, { isActive })}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {visible.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No templates found — run seed to populate
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>
    </div>
  );
}
