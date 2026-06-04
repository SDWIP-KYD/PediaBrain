"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface FollowUpItem {
  id: string;
  title: string;
  content: string | null;
  dueDate: string;
  status: string;
}

export function CalendarView({ items }: { items: FollowUpItem[] }) {
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
          className="rounded-lg border w-full max-w-md"
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
      <div className="max-w-md mx-auto">
        <h3 className="font-semibold text-sm mb-3">
          {selectedDate
            ? selectedDate.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })
            : "Pilih tanggal"}
        </h3>
        {dayItems.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-xs text-muted-foreground">
              Tidak ada follow-up pada tanggal ini
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {dayItems.map((item) => (
              <Card key={item.id} className="p-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{item.title}</p>
                    <Badge
                      variant={
                        item.status === "PENDING"
                          ? "default"
                          : item.status === "COMPLETED"
                            ? "secondary"
                            : "outline"
                      }
                      className="text-xs"
                    >
                      {item.status}
                    </Badge>
                  </div>
                  {item.content && (
                    <p className="text-xs text-muted-foreground">
                      {item.content}
                    </p>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
