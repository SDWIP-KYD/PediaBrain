"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, ExternalLink, Check, X, Clock } from "lucide-react";
import { EditFollowUpDialog } from "./follow-ups/edit-dialog";
import { updateFollowUpStatus } from "@/app/actions";

interface FollowUpItem {
  id: string;
  title: string;
  content: string | null;
  dueDate: string;
  status: string;
  recurrence: string;
}

export function DashboardTodayFollowUpActions({ item }: { item: FollowUpItem }) {
  const [editing, setEditing] = useState(false);
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      {item.status === "PENDING" && (
        <>
          <form action={updateFollowUpStatus.bind(null, item.id, "COMPLETED")}>
            <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Selesai">
              <Check className="h-3.5 w-3.5 text-green-600" />
            </Button>
          </form>
          <form action={updateFollowUpStatus.bind(null, item.id, "CANCELLED")}>
            <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Batal">
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </Button>
          </form>
        </>
      )}
      {item.status === "COMPLETED" && (
        <form action={updateFollowUpStatus.bind(null, item.id, "PENDING")}>
          <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Buka lagi">
            <Clock className="h-3.5 w-3.5" />
          </Button>
        </form>
      )}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={() => setEditing(true)}
        title="Edit / Buka"
      >
        <Pencil className="h-3.5 w-3.5" />
      </Button>
      <EditFollowUpDialog open={editing} onOpenChange={setEditing} item={item} />
    </div>
  );
}

export function DashboardCalendar({ items }: { items: FollowUpItem[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [editingItem, setEditingItem] = useState<FollowUpItem | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  const toLocalDateStr = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const selectedDateStr = selectedDate ? toLocalDateStr(selectedDate) : null;

  const dayItems = selectedDateStr
    ? items.filter((item) => item.dueDate === selectedDateStr)
    : [];

  const datesWithItems = new Set(items.map((item) => item.dueDate));

  function handleEdit(item: FollowUpItem) {
    setEditingItem(item);
    setEditOpen(true);
  }

  return (
    <div className="space-y-3">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border pointer-events-auto"
          modifiers={{
            hasItem: (date: Date) => {
              const dateStr = toLocalDateStr(date);
              return datesWithItems.has(dateStr);
            },
          }}
          modifiersClassNames={{
            hasItem: "bg-primary/20 font-bold",
          }}
        />
      </div>
      <div className="max-h-[200px] overflow-y-auto">
        <h3 className="font-semibold text-sm mb-2 sticky top-0 bg-card pb-1 z-10">
          {selectedDate
            ? selectedDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })
            : "Pilih tanggal"}
        </h3>
        {dayItems.length === 0 ? (
          <p className="text-xs text-muted-foreground py-2">
            Tidak ada follow-up pada tanggal ini
          </p>
        ) : (
          <div className="space-y-2">
            {dayItems.map((item) => (
              <div
                key={item.id}
                className="rounded-lg border text-sm overflow-hidden"
              >
                <div className="flex items-start justify-between gap-2 p-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium truncate">{item.title}</p>
                      <Badge
                        variant={
                          item.status === "PENDING"
                            ? "default"
                            : item.status === "COMPLETED"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] shrink-0"
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {item.status === "PENDING" && (
                      <>
                        <form action={updateFollowUpStatus.bind(null, item.id, "COMPLETED")}>
                          <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Selesai">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </Button>
                        </form>
                        <form action={updateFollowUpStatus.bind(null, item.id, "CANCELLED")}>
                          <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Batal">
                            <X className="h-3.5 w-3.5 text-muted-foreground" />
                          </Button>
                        </form>
                      </>
                    )}
                    {item.status === "COMPLETED" && (
                      <form action={updateFollowUpStatus.bind(null, item.id, "PENDING")}>
                        <Button type="submit" variant="ghost" size="icon" className="h-7 w-7" title="Buka lagi">
                          <Clock className="h-3.5 w-3.5" />
                        </Button>
                      </form>
                    )}
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleEdit(item)}
                      title="Edit"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
                {item.content && (
                  <div className="px-2 pb-2 max-h-[100px] overflow-y-auto border-t border-border/50 bg-muted/20">
                    <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed pt-1.5">
                      {item.content}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
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
