import { FormEvent, useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Search, Trash2 } from "lucide-react";
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
  adminDeleteMenuRequest,
  adminListMenusRequest,
  adminUpdateMenuRequest,
  type AdminMenuRow,
} from "@/lib/adminApi";
import { getAuthErrorMessage } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function AdminMenus() {
  const [q, setQ] = useState("");
  const [published, setPublished] = useState("all");
  const [items, setItems] = useState<AdminMenuRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(
    async (nextPage = page, query = q, pub = published) => {
      setLoading(true);
      try {
        const data = await adminListMenusRequest({
          q: query || undefined,
          page: nextPage,
          pageSize: 20,
          published: pub === "all" ? undefined : pub === "true",
        });
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
      } catch (err) {
        toast.error(getAuthErrorMessage(err, "Failed to load menus"));
      } finally {
        setLoading(false);
      }
    },
    [page, q, published]
  );

  useEffect(() => {
    void load(1, "", "all");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    void load(1, q, published);
  };

  const togglePublished = async (menu: AdminMenuRow) => {
    setBusyId(menu.id);
    try {
      await adminUpdateMenuRequest(menu.id, { isPublished: !menu.isPublished });
      toast.success(menu.isPublished ? "Unpublished" : "Published");
      await load(page, q, published);
    } catch (err) {
      toast.error(getAuthErrorMessage(err, "Update failed"));
    } finally {
      setBusyId(null);
    }
  };

  const onDelete = async (id: string) => {
    if (!confirm("Permanently delete this menu?")) return;
    setBusyId(id);
    try {
      await adminDeleteMenuRequest(id);
      toast.success("Menu deleted");
      await load(page, q, published);
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
            placeholder="Search name, slug, or owner email"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <Select value={published} onValueChange={setPublished}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="true">Published</SelectItem>
            <SelectItem value="false">Unpublished</SelectItem>
          </SelectContent>
        </Select>
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
                <TableHead>Menu</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Updated</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((m) => (
                <TableRow key={m.id}>
                  <TableCell>
                    <div className="font-medium">{m.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {m.slug || m.id.slice(0, 10)} · {m.currency}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{m.owner.name || "—"}</div>
                    <div className="text-xs text-muted-foreground">{m.owner.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={m.isPublished ? "default" : "secondary"}>
                      {m.isPublished ? "published" : "draft"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {new Date(m.updatedAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`/menu/${m.slug || m.id}`} target="_blank" rel="noreferrer">
                        <ExternalLink className="h-3.5 w-3.5" />
                        View
                      </a>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busyId === m.id}
                      onClick={() => void togglePublished(m)}
                    >
                      {m.isPublished ? "Unpublish" : "Publish"}
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={busyId === m.id}
                      onClick={() => void onDelete(m.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {items.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-10">
                    No menus found
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
            onClick={() => void load(page - 1, q, published)}
          >
            Prev
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={page >= pageCount || loading}
            onClick={() => void load(page + 1, q, published)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
