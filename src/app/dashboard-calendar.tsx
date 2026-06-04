"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface FollowUpItem {
  id: string;
  title: string;
  content: string | null;
  dueDate: string;
  status: string;
}

export function DashboardCalendar({ items }: { items: FollowUpItem[] }) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );

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

  return (
    <div className="space-y-4">
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="rounded-lg border w-full max-w-sm"
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
      <div>
        <h3 className="font-semibold text-sm mb-2">
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
                className="flex items-start justify-between gap-2 p-2 rounded-lg border text-sm"
              >
                <div className="min-w-0">
                  <p className="font-medium">{item.title}</p>
                  {item.content && (
                    <p className="text-xs text-muted-foreground">
                      {item.content}
                    </p>
                  )}
                </div>
                <Badge
                  variant={
                    item.status === "PENDING"
                      ? "default"
                      : item.status === "COMPLETED"
                        ? "secondary"
                        : "outline"
                  }
                  className="text-xs shrink-0"
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
