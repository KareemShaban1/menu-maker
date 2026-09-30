import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  adminCreateSubscriptionRequest,
  adminDeleteSubscriptionRequest,
  adminListSubscriptionsRequest,
  adminListUsersRequest,
  adminUpdateSubscriptionRequest,
  type AdminUserRow,
  type SubscriptionRow,
} from "@/lib/adminApi";
import type { ApiUser } from "@/lib/api";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";

const statuses: SubscriptionRow["status"][] = ["active", "trial", "past_due", "canceled", "expired"];

export default function AdminSubscriptions() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [items, setItems] = useState<SubscriptionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [form, setForm] = useState({
    userId: "",
    plan: "restaurant" as ApiUser["plan"],
    status: "active" as SubscriptionRow["status"],
    notes: "",
  });

  const load = useCallback(
    async (nextPage = page, query = q, st = status) => {
      setLoading(true);
      try {
        const data = await adminListSubscriptionsRequest({
          q: query || undefined,
          page: nextPage,
          pageSize: 20,
          status: st === "all" ? undefined : (st as SubscriptionRow["status"]),
        });
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "Failed to load subscriptions"));
      } finally {
        setLoading(false);
      }
    },
    [page, q, status]
  );

  useEffect(() => {
    void load(1, "", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openCreate = async () => {
    setCreateOpen(true);
    try {
      const data = await adminListUsersRequest({ page: 1, pageSize: 100 });
      setUsers(data.items);
      if (data.items[0]) setForm((f) => ({ ...f, userId: data.items[0].id }));
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Failed to load users"));
    }
  };

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    void load(1, q, status);
  };

  const patchStatus = async (id: string, next: SubscriptionRow["status"]) => {
    setBusyId(id);
    try {
      await adminUpdateSubscriptionRequest(id, { status: next, syncUserPlan: next === "active" });
      toast.success("Subscription updated");
      await load(page, q, status);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this subscription record?")) return;
    setBusyId(id);
    try {
      await adminDeleteSubscriptionRequest(id);
      toast.success("Deleted");
      await load(page, q, status);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Delete failed"));
    } finally {
      setBusyId(null);
    }
  };

  const onCreate = async () => {
    if (!form.userId) {
      toast.error("Select a user");
      return;
    }
    setBusyId("create");
    try {
      await adminCreateSubscriptionRequest({
        userId: form.userId,
        plan: form.plan,
        status: form.status,
        notes: form.notes || null,
        syncUserPlan: true,
      });
      toast.success("Subscription created");
      setCreateOpen(false);
      await load(1, q, status);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Create failed"));
    } finally {
      setBusyId(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={onSearch} className="flex flex-1 flex-wrap gap-2">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              placeholder="Search by user email/name"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {statuses.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit" variant="secondary">
            Search
          </Button>
        </form>
        <Button onClick={() => void openCreate()}>
          <Plus className="h-4 w-4" />
          New
        </Button>
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
                <TableHead>User</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Starts</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.user?.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{s.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.plan}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={s.status}
                      disabled={busyId === s.id}
                      onValueChange={(v) => void patchStatus(s.id, v as SubscriptionRow["status"])}
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {statuses.map((st) => (
                          <SelectItem key={st} value={st}>
                            {st}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(s.startsAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                    {s.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === s.id}
                      onClick={() => void onDelete(s.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No subscriptions found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} total · page {page}/{pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => void load(page - 1, q, status)}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount || loading}
            onClick={() => void load(page + 1, q, status)}
          >
            Next
          </Button>
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create subscription</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1.5">
              <Label>User</Label>
              <Select value={form.userId} onValueChange={(userId) => setForm((f) => ({ ...f, userId }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Plan</Label>
                <Select
                  value={form.plan}
                  onValueChange={(plan) => setForm((f) => ({ ...f, plan: plan as ApiUser["plan"] }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">free</SelectItem>
                    <SelectItem value="restaurant">restaurant</SelectItem>
                    <SelectItem value="business">business</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Status</Label>
                <Select
                  value={form.status}
                  onValueChange={(st) =>
                    setForm((f) => ({ ...f, status: st as SubscriptionRow["status"] }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statuses.map((st) => (
                      <SelectItem key={st} value={st}>
                        {st}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Input
                value={form.notes}
                onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button disabled={busyId === "create"} onClick={() => void onCreate()}>
              {busyId === "create" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
