"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { GripVertical, Loader2, StickyNote, LogOut, X, Check, User } from "lucide-react";
import { movePatientToRoom, getPatientsByRoom, updatePatientNotes, dischargePatient } from "@/app/actions";
import { cn } from "@/lib/utils";

interface KanbanPatient {
  id: string;
  name: string;
  medicalRecordNo: string | null;
  bed: string | null;
  room: string | null;
  birthDate: string | null;
  sex: string | null;
  status: string | null;
  notes: string | null;
  diagnosis: string | null;
}

const ROOMS = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"] as const;

const ROOM_THEME: Record<string, { bg: string; border: string; header: string; badge: string; glow: string }> = {
  DAHLIA: {
    bg: "bg-rose-500/5",
    border: "border-rose-500/30",
    header: "from-rose-500/20 to-rose-500/5",
    badge: "bg-rose-500/20 text-rose-300",
    glow: "hover:shadow-rose-500/10",
  },
  ANGGREK: {
    bg: "bg-violet-500/5",
    border: "border-violet-500/30",
    header: "from-violet-500/20 to-violet-500/5",
    badge: "bg-violet-500/20 text-violet-300",
    glow: "hover:shadow-violet-500/10",
  },
  MELATI: {
    bg: "bg-amber-500/5",
    border: "border-amber-500/30",
    header: "from-amber-500/20 to-amber-500/5",
    badge: "bg-amber-500/20 text-amber-300",
    glow: "hover:shadow-amber-500/10",
  },
  SERUNI: {
    bg: "bg-cyan-500/5",
    border: "border-cyan-500/30",
    header: "from-cyan-500/20 to-cyan-500/5",
    badge: "bg-cyan-500/20 text-cyan-300",
    glow: "hover:shadow-cyan-500/10",
  },
};

export function PatientKanban() {
  const [patients, setPatients] = useState<KanbanPatient[]>([]);
  const [loading, setLoading] = useState(true);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverRoom, setDragOverRoom] = useState<string | null>(null);
  const [movingId, setMovingId] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<string | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [dischargingId, setDischargingId] = useState<string | null>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (editingNotes && notesInputRef.current) {
      notesInputRef.current.focus();
      notesInputRef.current.setSelectionRange(
        notesInputRef.current.value.length,
        notesInputRef.current.value.length
      );
    }
  }, [editingNotes]);

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
  }, {} as Record<string, KanbanPatient[]>);

  const unassigned = patients.filter((p) => !p.room || !ROOMS.includes(p.room as typeof ROOMS[number]));

  function handleDragStart(e: React.DragEvent, id: string) {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.4";
    target.style.transform = "rotate(2deg) scale(1.02)";
  }

  function handleDragEnd(e: React.DragEvent) {
    setDraggedId(null);
    setDragOverRoom(null);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "1";
    target.style.transform = "";
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

  async function handleSaveNotes(patientId: string) {
    try {
      await updatePatientNotes(patientId, notesDraft || null);
      setPatients((prev) =>
        prev.map((p) => (p.id === patientId ? { ...p, notes: notesDraft || null } : p))
      );
      setEditingNotes(null);
    } catch (error) {
      console.error("Failed to save notes:", error);
    }
  }

  async function handleDischarge(patientId: string) {
    setDischargingId(patientId);
    try {
      await dischargePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (error) {
      console.error("Failed to discharge patient:", error);
    } finally {
      setDischargingId(null);
    }
  }

  function startEditingNotes(patient: KanbanPatient) {
    setEditingNotes(patient.id);
    setNotesDraft(patient.notes || "");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        <span className="ml-3 text-sm text-muted-foreground">Memuat data pasien...</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-fit">
        {ROOMS.map((room) => {
          const items = byRoom[room] ?? [];
          const isOver = dragOverRoom === room;
          const theme = ROOM_THEME[room];
          return (
            <div
              key={room}
              onDragOver={(e) => handleDragOver(e, room)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, room)}
              className={cn(
                "w-72 shrink-0 rounded-xl border bg-card/50 backdrop-blur-sm transition-all duration-200",
                theme.border,
                isOver && "ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-background scale-[1.01]",
                theme.glow,
                "hover:shadow-lg"
              )}
            >
              <div className={cn(
                "px-4 py-3 rounded-t-xl bg-gradient-to-b border-b",
                theme.header,
                theme.border
              )}>
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm tracking-wide">{room}</h3>
                  <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", theme.badge)}>
                    {items.length}
                  </span>
                </div>
              </div>
              <div className="p-3 space-y-2.5 min-h-[140px] max-h-[calc(100vh-260px)] overflow-y-auto scrollbar-thin">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground/50">
                    <User className="h-8 w-8 mb-2" />
                    <p className="text-xs">Kosong</p>
                  </div>
                ) : (
                  items.map((p) => (
                    <PatientCard
                      key={p.id}
                      patient={p}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      isDragging={draggedId === p.id}
                      isMoving={movingId === p.id}
                      isEditingNotes={editingNotes === p.id}
                      notesDraft={notesDraft}
                      onNotesDraftChange={setNotesDraft}
                      onStartEditNotes={() => startEditingNotes(p)}
                      onSaveNotes={() => handleSaveNotes(p.id)}
                      onCancelNotes={() => setEditingNotes(null)}
                      onDischarge={() => handleDischarge(p.id)}
                      isDischarging={dischargingId === p.id}
                      notesInputRef={editingNotes === p.id ? notesInputRef : undefined}
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
              "w-72 shrink-0 rounded-xl border border-dashed border-muted-foreground/30 bg-card/30 transition-all duration-200",
              dragOverRoom === "__unassigned__" && "ring-2 ring-emerald-400/50 ring-offset-2 ring-offset-background"
            )}
          >
            <div className="px-4 py-3 rounded-t-xl border-b border-muted-foreground/10">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-muted-foreground">Belum Ditempatkan</h3>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  {unassigned.length}
                </span>
              </div>
            </div>
            <div className="p-3 space-y-2.5 min-h-[140px]">
              {unassigned.map((p) => (
                <PatientCard
                  key={p.id}
                  patient={p}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  isDragging={draggedId === p.id}
                  isMoving={movingId === p.id}
                  isEditingNotes={editingNotes === p.id}
                  notesDraft={notesDraft}
                  onNotesDraftChange={setNotesDraft}
                  onStartEditNotes={() => startEditingNotes(p)}
                  onSaveNotes={() => handleSaveNotes(p.id)}
                  onCancelNotes={() => setEditingNotes(null)}
                  onDischarge={() => handleDischarge(p.id)}
                  isDischarging={dischargingId === p.id}
                  notesInputRef={editingNotes === p.id ? notesInputRef : undefined}
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
  isEditingNotes,
  notesDraft,
  onNotesDraftChange,
  onStartEditNotes,
  onSaveNotes,
  onCancelNotes,
  onDischarge,
  isDischarging,
  notesInputRef,
}: {
  patient: KanbanPatient;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragEnd: (e: React.DragEvent) => void;
  isDragging: boolean;
  isMoving: boolean;
  isEditingNotes: boolean;
  notesDraft: string;
  onNotesDraftChange: (v: string) => void;
  onStartEditNotes: () => void;
  onSaveNotes: () => void;
  onCancelNotes: () => void;
  onDischarge: () => void;
  isDischarging: boolean;
  notesInputRef?: React.RefObject<HTMLTextAreaElement | null>;
}) {
  return (
    <div
      draggable={!isEditingNotes}
      onDragStart={(e) => onDragStart(e, patient.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-lg border border-border/60 bg-background/80 p-3 transition-all duration-200",
        !isEditingNotes && "cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:bg-accent/50 hover:shadow-md",
        isDragging && "opacity-30 rotate-1 scale-95",
        isMoving && "opacity-50 animate-pulse",
        isEditingNotes && "cursor-default border-emerald-500/30"
      )}
    >
      <div className="flex items-start gap-2">
        {!isEditingNotes && (
          <GripVertical className="h-4 w-4 text-muted-foreground/40 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1">
            <Link href={`/pasien/${patient.id}`} className="font-semibold text-sm truncate hover:text-emerald-400 transition-colors">
              {patient.name}
            </Link>
            {patient.sex && (
              <span className={cn(
                "text-[10px] font-bold px-1 py-0.5 rounded",
                patient.sex === "L" ? "bg-blue-500/20 text-blue-300" : "bg-pink-500/20 text-pink-300"
              )}>
                {patient.sex === "L" ? "L" : "P"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-1.5">
            {patient.bed && (
              <span className="font-mono bg-muted/80 px-1.5 py-0.5 rounded text-[10px]">
                {patient.bed}
              </span>
            )}
            {patient.medicalRecordNo && (
              <span className="font-mono truncate text-[10px]">RM: {patient.medicalRecordNo}</span>
            )}
          </div>

          {patient.diagnosis && (
            <p className="text-[11px] text-muted-foreground/80 line-clamp-2 leading-relaxed mb-2 bg-muted/30 rounded px-2 py-1">
              {patient.diagnosis}
            </p>
          )}

          {/* Notes section */}
          {isEditingNotes ? (
            <div className="mt-2 space-y-1.5">
              <textarea
                ref={notesInputRef}
                value={notesDraft}
                onChange={(e) => onNotesDraftChange(e.target.value)}
                placeholder="Catatan pasien..."
                rows={3}
                className="w-full text-xs rounded-md border border-emerald-500/30 bg-background/90 px-2.5 py-2 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-muted-foreground/40"
              />
              <div className="flex gap-1.5">
                <button
                  onClick={onSaveNotes}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  <Check className="h-3 w-3" />
                  Simpan
                </button>
                <button
                  onClick={onCancelNotes}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <X className="h-3 w-3" />
                  Batal
                </button>
              </div>
            </div>
          ) : (
            <>
              {patient.notes && (
                <div className="mt-1.5 mb-2 bg-emerald-500/5 border border-emerald-500/10 rounded-md px-2 py-1.5">
                  <p className="text-[10px] text-emerald-300/80 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                    {patient.notes}
                  </p>
                </div>
              )}
            </>
          )}

          {/* Action buttons */}
          {!isEditingNotes && (
            <div className="flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => { e.stopPropagation(); onStartEditNotes(); }}
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md transition-colors",
                  patient.notes
                    ? "bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                )}
                title="Catatan"
              >
                <StickyNote className="h-3 w-3" />
                {patient.notes ? "Edit" : "Catatan"}
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onDischarge(); }}
                disabled={isDischarging}
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-1 rounded-md bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
                title="Pulangkan"
              >
                {isDischarging ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <LogOut className="h-3 w-3" />
                )}
                Pulang
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
