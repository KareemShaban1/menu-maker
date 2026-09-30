import { FormEvent, useCallback, useEffect, useState } from "react";
import { Loader2, Search, Trash2 } from "lucide-react";
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
  adminDeleteUserRequest,
  adminListUsersRequest,
  adminUpdateUserRequest,
  type AdminUserRow,
} from "@/lib/adminApi";
import type { ApiUser } from "@/lib/api";
import { getAuthErrorMessage, useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [q, setQ] = useState("");
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async (nextPage = page, query = q) => {
    setLoading(true);
    try {
      const data = await adminListUsersRequest({ q: query || undefined, page: nextPage, pageSize: 20 });
      setItems(data.items);
      setTotal(data.total);
      setPage(data.page);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Failed to load users"));
    } finally {
      setLoading(false);
    }
  }, [page, q]);

  useEffect(() => {
    void load(1, "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    void load(1, q);
  };

  const patchUser = async (id: string, body: Parameters<typeof adminUpdateUserRequest>[1]) => {
    setBusyId(id);
    try {
      await adminUpdateUserRequest(id, body);
      toast.success("User updated");
      await load(page, q);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Delete this user and all their menus?")) return;
    setBusyId(id);
    try {
      await adminDeleteUserRequest(id);
      toast.success("User deleted");
      await load(page, q);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Delete failed"));
    } finally {
      setBusyId(null);
    }
  };

  const pageCount = Math.max(1, Math.ceil(total / 20));

  return (
    <div className="space-y-4">
      <form onSubmit={onSearch} className="flex flex-wrap gap-2">
        <div className="relative min-w-[220px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by email or name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary">
          Search
        </Button>
      </form>

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
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Menus</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="font-medium">{u.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{u.email}</div>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.plan}
                      disabled={busyId === u.id}
                      onValueChange={(plan) =>
                        void patchUser(u.id, { plan: plan as ApiUser["plan"] })
                      }
                    >
                      <SelectTrigger className="w-[130px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">free</SelectItem>
                        <SelectItem value="restaurant">restaurant</SelectItem>
                        <SelectItem value="business">business</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={u.role}
                      disabled={busyId === u.id || u.id === me?.id}
                      onValueChange={(role) =>
                        void patchUser(u.id, { role: role as ApiUser["role"] })
                      }
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">user</SelectItem>
                        <SelectItem value="super_admin">super_admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Badge variant={u.isActive ? "default" : "secondary"}>
                      {u.isActive ? "active" : "disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{u.menuCount}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === u.id || u.id === me?.id}
                      onClick={() => void patchUser(u.id, { isActive: !u.isActive })}
                    >
                      {u.isActive ? "Disable" : "Enable"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === u.id || u.id === me?.id}
                      onClick={() => void onDelete(u.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-10">
                    No users found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">
          {total} user{total === 1 ? "" : "s"} · page {page}/{pageCount}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page <= 1 || loading}
            onClick={() => void load(page - 1, q)}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount || loading}
            onClick={() => void load(page + 1, q)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
