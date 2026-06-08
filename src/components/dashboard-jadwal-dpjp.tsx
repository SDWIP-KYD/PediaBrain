"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from "lucide-react";
import Link from "next/link";
import { schedule, doctors } from "@/lib/jadwal-dpjp-data";

function getTodayDayName(): string {
  const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
  return days[new Date().getDay()];
}

function parseTimeToMinutes(timeStr: string): number {
  const start = timeStr.split("–")[0].trim();
  const [h, m] = start.split(".").map(Number);
  return h * 60 + (m || 0);
}

function parseEndMinutes(timeStr: string): number {
  const parts = timeStr.split("–");
  const end = parts[1]?.trim() || parts[0].trim();
  const [h, m] = end.split(".").map(Number);
  return h * 60 + (m || 0);
}

export function DashboardJadwalDPJP() {
  const todayName = getTodayDayName();
  const todaySlots = useMemo(() => {
    const slots = schedule[todayName] || [];
    return [...slots].sort((a, b) => parseTimeToMinutes(a.time) - parseTimeToMinutes(b.time));
  }, [todayName]);

  const noSchedule = todaySlots.length === 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
            <CalendarDays className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="truncate">Jadwal DPJP Hari Ini</span>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
              {todayName}
            </Badge>
          </CardTitle>
          <Link
            href="/jadwal-dpjp"
            className="text-xs text-muted-foreground hover:text-foreground shrink-0"
          >
            Lihat semua →
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {noSchedule ? (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Tidak ada jadwal praktik hari ini
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {todaySlots.map((slot, i) => {
              const doctor = doctors.find((d) => d.id === slot.doctorId);
              if (!doctor) return null;

              const now = new Date();
              const currentMinutes = now.getHours() * 60 + now.getMinutes();
              const startMinutes = parseTimeToMinutes(slot.time);
              const endMinutes = parseEndMinutes(slot.time);
              const isNow = currentMinutes >= startMinutes && currentMinutes <= endMinutes;
              const isPast = currentMinutes > endMinutes;

              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors ${
                    isNow
                      ? "border-neon/30 bg-neon/5"
                      : isPast
                      ? "border-border/50 bg-muted/20 opacity-60"
                      : "border-border bg-muted/30"
                  }`}
                >
                  <div className={`w-0.5 h-8 rounded-full shrink-0 ${doctor.dotColor}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isPast ? "line-through text-muted-foreground" : "text-foreground"}`}>
                      {doctor.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {slot.time}
                    </p>
                  </div>
                  {isNow && (
                    <Badge variant="outline" className="text-[10px] border-neon/50 text-neon shrink-0">
                      🟢 PRAKTIK
                    </Badge>
                  )}
                  {isPast && !isNow && (
                    <Badge variant="outline" className="text-[10px] text-muted-foreground/50 shrink-0">
                      Selesai
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
