"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { updateFollowUpStatus, deleteFollowUp } from "@/app/actions";
import { Check, X, Clock, Trash2, Pencil, Repeat } from "lucide-react";
import { EditFollowUpDialog } from "./edit-dialog";

interface FollowUpItem {
  id: string;
  title: string;
  content: string | null;
  dueDate: string;
  status: string;
  recurrence: string;
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  PENDING: { label: "Pending", variant: "default" },
  COMPLETED: { label: "Selesai", variant: "secondary" },
  CANCELLED: { label: "Dibatalkan", variant: "outline" },
};

const recurrenceLabels: Record<string, string> = {
  weekly: "Mingguan",
  monthly: "Bulanan",
};

export function KanbanColumn({
  title,
  status,
  items,
}: {
  title: string;
  status: string;
  items: FollowUpItem[];
}) {
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  function handleEdit(item: FollowUpItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-semibold text-sm">{title}</h3>
        <Badge variant="outline" className="text-xs">
          {items.length}
        </Badge>
      </div>
      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">Tidak ada item</p>
          </div>
        ) : (
          items.map((item) => (
            <Card key={item.id} className="p-3">
              <div className="space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-sm">{item.title}</p>
                  <div className="flex items-center gap-1 shrink-0">
                    {item.recurrence && item.recurrence !== "none" && (
                      <span title={`Berulang: ${recurrenceLabels[item.recurrence]}`}>
                        <Repeat className="h-3.5 w-3.5 text-neon" />
                      </span>
                    )}
                    <Badge variant={statusConfig[item.status]?.variant ?? "outline"} className="text-xs">
                      {item.status}
                    </Badge>
                  </div>
                </div>
                {item.content && <p className="text-sm text-muted-foreground">{item.content}</p>}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {new Date(item.dueDate).toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                  <div className="flex items-center gap-0.5">
                    {status === "PENDING" && (
                      <>
                        <form action={updateFollowUpStatus.bind(null, item.id, "COMPLETED")}>
                          <Button type="submit" variant="ghost" size="icon" className="h-9 w-9" title="Selesai">
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                        </form>
                        <form action={updateFollowUpStatus.bind(null, item.id, "CANCELLED")}>
                          <Button type="submit" variant="ghost" size="icon" className="h-9 w-9" title="Batal">
                            <X className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </form>
                      </>
                    )}
                    {status === "COMPLETED" && (
                      <form action={updateFollowUpStatus.bind(null, item.id, "PENDING")}>
                        <Button type="submit" variant="ghost" size="icon" className="h-9 w-9" title="Buka lagi">
                          <Clock className="h-4 w-4" />
                        </Button>
                      </form>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-9 w-9"
                      onClick={() => handleEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <form action={deleteFollowUp.bind(null, item.id)}>
                      <Button type="submit" variant="ghost" size="icon" className="h-9 w-9" title="Hapus">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </form>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <EditFollowUpDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        item={editingItem}
      />
    </div>
  );
}
