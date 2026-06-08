"use client";

import { useMemo } from "react";
import { doctors, schedule, weekDays, khanzaAccounts } from "@/lib/jadwal-dpjp-data";

function parseStartTime(timeStr: string): number {
  const start = timeStr.split("–")[0].trim();
  const [h, m] = start.split(".").map(Number);
  return h * 60 + (m || 0);
}

export default function JadwalDPJP() {
  const today = useMemo(() => {
    const d = new Date().getDay();
    const map = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
    return map[d];
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Jadwal Poli DPJP</h1>
        <p className="text-sm text-muted-foreground mt-1">Jadwal praktik dokter — RS Akademis</p>
      </div>

      {/* Doctor chips */}
      <div className="flex flex-wrap gap-2">
        {doctors.map((doc) => (
          <span
            key={doc.id}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border bg-card border-border"
          >
            <span className={`w-2 h-2 rounded-full ${doc.dotColor}`} />
            {doc.name}
          </span>
        ))}
      </div>

      {/* Schedule grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {weekDays.map((day) => {
          const daySlots = schedule[day] || [];
          const isToday = day === today;

          const sorted = [...daySlots].sort(
            (a, b) => parseStartTime(a.time) - parseStartTime(b.time)
          );

          return (
            <div
              key={day}
              className={`rounded-2xl border p-4 min-h-[160px] transition-colors ${
                isToday
                  ? "bg-amber-500/5 border-amber-500/30"
                  : "bg-card border-border"
              }`}
            >
              <div
                className={`text-xs font-bold uppercase tracking-wider mb-3 pb-2 border-b ${
                  isToday
                    ? "text-amber-400 border-amber-500/30"
                    : "text-muted-foreground border-border"
                }`}
              >
                {day}
                {isToday && (
                  <span className="ml-2 inline-block bg-amber-400 text-amber-950 text-[10px] font-bold px-1.5 py-0.5 rounded">
                    HARI INI
                  </span>
                )}
              </div>

              {sorted.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Tidak ada jadwal</p>
              ) : (
                <div className="space-y-2">
                  {sorted.map((slot, i) => {
                    const doc = doctors.find((d) => d.id === slot.doctorId);
                    if (!doc) return null;
                    return (
                      <div
                        key={i}
                        className={`rounded-xl px-3 py-2 text-xs border ${doc.colorClass}`}
                      >
                        <div className="font-bold text-foreground">{doc.name}</div>
                        <div className="text-muted-foreground mt-0.5 tabular-nums">
                          {slot.time}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Khanza accounts */}
      <div className="bg-card border border-border rounded-2xl p-4">
        <h3 className="text-sm font-bold text-foreground mb-2">Akun Khanza RS Akademis</h3>
        <div className="space-y-1">
          {khanzaAccounts.map((acc, i) => (
            <p key={i} className="text-xs text-muted-foreground">
              <span className="text-foreground font-medium">{acc.doctor}</span> :{" "}
              <code className="bg-muted px-1.5 py-0.5 rounded text-foreground">{acc.username}</code>
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
