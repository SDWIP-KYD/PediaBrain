"use client";

import { useState, useTransition, useOptimistic } from "react";
import Link from "next/link";
import { GripVertical, User, Calendar } from "lucide-react";
import { movePatientToRoom } from "@/app/actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface KanbanPatient {
  id: string;
  name: string;
  medicalRecordNo: string | null;
  bed: string | null;
  room: string | null;
  birthDate: string | null;
  sex: string | null;
  diagnosis: string | null;
}

const ROOM_COLORS: Record<string, string> = {
  DAHLIA: "border-t-pink-500",
  ANGGREK: "border-t-purple-500",
  MELATI: "border-t-yellow-500",
  SERUNI: "border-t-blue-500",
};

export function PatientKanban({
  rooms,
  patients: initial,
}: {
  rooms: string[];
  patients: KanbanPatient[];
}) {
  const router = useRouter();
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverRoom, setDragOverRoom] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const [optimisticPatients, applyOptimistic] = useOptimistic(
    initial,
    (state, action: { id: string; room: string | null }) =>
      state.map((p) => (p.id === action.id ? { ...p, room: action.room } : p))
  );

  const byRoom = rooms.reduce<Record<string, KanbanPatient[]>>((acc, room) => {
    acc[room] = optimisticPatients.filter((p) => p.room === room);
    return acc;
  }, {});

  const unassigned = optimisticPatients.filter((p) => !p.room || !rooms.includes(p.room));

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  }

  function handleDragOver(e: React.DragEvent, room: string | null) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverRoom(room ?? "__unassigned__");
  }

  function handleDragLeave() {
    setDragOverRoom(null);
  }

  function handleDrop(e: React.DragEvent, targetRoom: string | null) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;
    setDraggedId(null);
    setDragOverRoom(null);

    const patient = optimisticPatients.find((p) => p.id === id);
    if (!patient || patient.room === targetRoom) return;

    startTransition(async () => {
      applyOptimistic({ id, room: targetRoom });
      await movePatientToRoom(id, targetRoom);
      router.refresh();
    });
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-fit">
        {rooms.map((room) => {
          const items = byRoom[room] ?? [];
          const isOver = dragOverRoom === room;
          return (
            <div
              key={room}
              onDragOver={(e) => handleDragOver(e, room)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, room)}
              className={cn(
                "w-64 shrink-0 rounded-lg border border-t-4 bg-card transition-all",
                ROOM_COLORS[room] ?? "border-t-gray-500",
                isOver && "ring-2 ring-neon ring-offset-2 ring-offset-background"
              )}
            >
              <div className="flex items-center justify-between px-3 py-2 border-b">
                <h3 className="font-semibold text-sm">{room}</h3>
                <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                  {items.length}
                </span>
              </div>
              <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-260px)] overflow-y-auto">
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Taruh pasien di sini
                  </p>
                ) : (
                  items.map((p) => (
                    <PatientCard
                      key={p.id}
                      patient={p}
                      onDragStart={handleDragStart}
                      isDragging={draggedId === p.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {unassigned.length > 0 && (
          <div
            onDragOver={(e) => handleDragOver(e, null)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, null)}
            className={cn(
              "w-64 shrink-0 rounded-lg border border-t-4 border-t-gray-400 bg-card transition-all",
              dragOverRoom === "__unassigned__" && "ring-2 ring-neon ring-offset-2 ring-offset-background"
            )}
          >
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <h3 className="font-semibold text-sm">Belum ditempatkan</h3>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {unassigned.length}
              </span>
            </div>
            <div className="p-2 space-y-2 min-h-[120px] max-h-[calc(100vh-260px)] overflow-y-auto">
              {unassigned.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  onDragStart={handleDragStart}
                  isDragging={draggedId === p.id}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PatientCard({
  patient,
  onDragStart,
  isDragging,
}: {
  patient: KanbanPatient;
  onDragStart: (e: React.DragEvent, id: string) => void;
  isDragging: boolean;
}) {
  return (
    <Link href={`/pasien/${patient.id}`}>
      <div
        draggable
        onDragStart={(e) => onDragStart(e, patient.id)}
        className={cn(
          "rounded-md border border-border bg-background p-2 cursor-grab active:cursor-grabbing hover:border-neon/40 transition-all",
          isDragging && "opacity-40"
        )}
      >
        <div className="flex items-start gap-1.5">
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <p className="font-medium text-xs truncate">{patient.name}</p>
              {patient.sex && (
                <span className="text-[10px] text-muted-foreground shrink-0">
                  {patient.sex === "L" ? "♂" : "♀"}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              {patient.bed && (
                <span className="font-mono bg-muted px-1 rounded">{patient.bed}</span>
              )}
              {patient.medicalRecordNo && (
                <span className="font-mono truncate">{patient.medicalRecordNo}</span>
              )}
            </div>
            {patient.diagnosis && (
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2 leading-tight">
                {patient.diagnosis}
              </p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
