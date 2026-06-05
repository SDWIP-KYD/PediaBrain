"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GripVertical, Loader2 } from "lucide-react";
import { movePatientToRoom, getPatientsByRoom } from "@/app/actions";
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

const ROOMS = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"];

const ROOM_COLORS: Record<string, string> = {
  DAHLIA: "border-t-pink-500",
  ANGGREK: "border-t-purple-500",
  MELATI: "border-t-yellow-500",
  SERUNI: "border-t-blue-500",
};

export function PatientKanban() {
  const [patients, setPatients] = useState<KanbanPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverRoom, setDragOverRoom] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  async function loadPatients() {
    try {
      const data = await getPatientsByRoom();
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  }

  const byRoom = ROOMS.reduce<Record<string, KanbanPatient[]>>((acc, room) => {
    acc[room] = patients.filter((p) => p.room === room);
    return acc;
  }, {});

  const unassigned = patients.filter((p) => !p.room || !ROOMS.includes(p.room));

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.5";
  }

  function handleDragEnd(e: React.DragEvent) {
    setDraggedId(null);
    setDragOverRoom(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
  }

  function handleDragOver(e: React.DragEvent, room: string) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverRoom(room);
  }

  function handleDragLeave() {
    setDragOverRoom(null);
  }

  async function handleDrop(e: React.DragEvent, targetRoom: string) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    if (!id) return;

    setDraggedId(null);
    setDragOverRoom(null);

    const patient = patients.find((p) => p.id === id);
    if (!patient || patient.room === targetRoom) return;

    setMovingId(id);

    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, room: targetRoom } : p))
    );

    try {
      await movePatientToRoom(id, targetRoom);
    } catch (error) {
      console.error("Failed to move patient:", error);
      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, room: patient.room } : p))
      );
    } finally {
      setMovingId(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Memuat data pasien...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-fit">
        {ROOMS.map((room) => {
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
                      onDragEnd={handleDragEnd}
                      isDragging={draggedId === p.id}
                      isMoving={movingId === p.id}
                    />
                  ))
                )}
              </div>
            </div>
          );
        })}

        {unassigned.length > 0 && (
          <div
            onDragOver={(e) => handleDragOver(e, "__unassigned__")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "")}
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
                  onDragEnd={handleDragEnd}
                  isDragging={draggedId === p.id}
                  isMoving={movingId === p.id}
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
  onDragEnd,
  isDragging,
  isMoving,
}: {
  patient: KanbanPatient;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
  isMoving: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, patient.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "rounded-md border border-border bg-background p-2 cursor-grab active:cursor-grabbing hover:border-neon/40 transition-all",
        isDragging && "opacity-40",
        isMoving && "opacity-60 animate-pulse"
      )}
    >
      <div className="flex items-start gap-1.5">
        <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <Link href={`/pasien/${patient.id}`} className="font-medium text-xs truncate hover:text-neon transition-colors">
              {patient.name}
            </Link>
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
  );
}
