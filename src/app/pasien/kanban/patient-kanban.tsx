"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  GripVertical, Loader2, StickyNote, LogOut, X, Check, User,
  Bot, Send, Sparkles, Bell, ArrowLeft, ChevronRight, ChevronDown,
  Trash2, Plus, ArrowRightLeft,
} from "lucide-react";
import {
  movePatientToRoom, getPatientsByRoom, updatePatientNotes, dischargePatient,
  bulkSyncPatients, type BulkSyncChange,
} from "@/app/actions";
import { cn } from "@/lib/utils";

type ChangeType = "created" | "moved" | "updated" | "discharged";
type ChangeHighlight = { type: ChangeType; timestamp: number };

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

const ROOM_THEME: Record<string, { border: string; headerBg: string; badge: string; ring: string; dot: string; text: string }> = {
  DAHLIA: {
    border: "border-rose-500/40 hover:border-rose-500/60",
    headerBg: "bg-gradient-to-r from-rose-500/15 to-rose-500/5",
    badge: "bg-rose-500/20 text-rose-300",
    ring: "ring-rose-500/50",
    dot: "bg-rose-500",
    text: "text-rose-300",
  },
  ANGGREK: {
    border: "border-violet-500/40 hover:border-violet-500/60",
    headerBg: "bg-gradient-to-r from-violet-500/15 to-violet-500/5",
    badge: "bg-violet-500/20 text-violet-300",
    ring: "ring-violet-500/50",
    dot: "bg-violet-500",
    text: "text-violet-300",
  },
  MELATI: {
    border: "border-amber-500/40 hover:border-amber-500/60",
    headerBg: "bg-gradient-to-r from-amber-500/15 to-amber-500/5",
    badge: "bg-amber-500/20 text-amber-300",
    ring: "ring-amber-500/50",
    dot: "bg-amber-500",
    text: "text-amber-300",
  },
  SERUNI: {
    border: "border-cyan-500/40 hover:border-cyan-500/60",
    headerBg: "bg-gradient-to-r from-cyan-500/15 to-cyan-500/5",
    badge: "bg-cyan-500/20 text-cyan-300",
    ring: "ring-cyan-500/50",
    dot: "bg-cyan-500",
    text: "text-cyan-300",
  },
};

const HIGHLIGHT_STYLES: Record<ChangeType, { ring: string; bg: string; label: string; icon: typeof Plus }> = {
  created: { ring: "ring-2 ring-emerald-400", bg: "bg-emerald-500/5", label: "Baru", icon: Plus },
  moved: { ring: "ring-2 ring-blue-400", bg: "bg-blue-500/5", label: "Pindah", icon: ArrowRightLeft },
  updated: { ring: "ring-2 ring-amber-400", bg: "bg-amber-500/5", label: "Update", icon: ArrowRightLeft },
  discharged: { ring: "ring-2 ring-rose-400", bg: "bg-rose-500/5", label: "Pulang", icon: LogOut },
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
  const [highlights, setHighlights] = useState<Map<string, ChangeHighlight>>(new Map());
  const [notifications, setNotifications] = useState<{ change: BulkSyncChange; timestamp: number }[]>([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (editingNotes && notesInputRef.current) {
      notesInputRef.current.focus();
    }
  }, [editingNotes]);

  // Auto-clear highlights after 30s
  useEffect(() => {
    if (highlights.size === 0) return;
    const timer = setTimeout(() => setHighlights(new Map()), 30000);
    return () => clearTimeout(timer);
  }, [highlights]);

  const loadPatients = useCallback(async () => {
    try {
      const data = await getPatientsByRoom();
      setPatients(data);
    } catch (error) {
      console.error("Failed to load patients:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const byRoom = ROOMS.reduce<Record<string, KanbanPatient[]>>((acc, room) => {
    acc[room] = patients
      .filter((p) => p.room === room)
      .sort((a, b) => (a.bed || "").localeCompare(b.bed || "", undefined, { numeric: true }));
    return acc;
  }, {} as Record<string, KanbanPatient[]>);

  const unassigned = patients.filter(
    (p) => !p.room || !ROOMS.includes(p.room as typeof ROOMS[number])
  );

  function handleDragStart(e: React.DragEvent, id: string) {
    if (editingNotes) { e.preventDefault(); return; }
    setDraggedId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
    const target = e.currentTarget as HTMLElement;
    target.style.opacity = "0.4";
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
    if (!patient) return;
    if ((patient.room || "") === (targetRoom || "")) return;

    setMovingId(id);
    setPatients((prev) =>
      prev.map((p) => (p.id === id ? { ...p, room: targetRoom || null } : p))
    );

    try {
      await movePatientToRoom(id, targetRoom || null);
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

  function applyChanges(result: Awaited<ReturnType<typeof bulkSyncPatients>>) {
    const ts = Date.now();
    const newHighlights = new Map<string, ChangeHighlight>();
    const newNotifs: { change: BulkSyncChange; timestamp: number }[] = [];

    for (const change of result.changes) {
      if (change.patientId) {
        newHighlights.set(change.patientId, { type: change.type, timestamp: ts });
      }
      newNotifs.push({ change, timestamp: ts });
    }

    setHighlights(newHighlights);
    setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
    if (newNotifs.length > 0) setNotifOpen(true);
    loadPatients();
  }

  const totalInRooms = ROOMS.reduce((sum, r) => sum + (byRoom[r]?.length || 0), 0);
  const notifCount = notifications.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-emerald-400" />
        <span className="ml-3 text-sm text-muted-foreground">Memuat data pasien...</span>
      </div>
    );
  }

  return (
    <>
      {/* Mobile/secondary action bar */}
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <button
          onClick={() => setChatOpen(!chatOpen)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            chatOpen
              ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
              : "border border-border hover:bg-accent"
          )}
        >
          <Bot className="h-3.5 w-3.5" />
          AI Sync
        </button>
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative",
            notifOpen
              ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
              : "border border-border hover:bg-accent"
          )}
        >
          <Bell className="h-3.5 w-3.5" />
          Notifikasi
          {notifCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 h-4 min-w-4 px-1 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
              {notifCount > 99 ? "99+" : notifCount}
            </span>
          )}
        </button>
        <span className="text-xs text-muted-foreground ml-auto">
          {totalInRooms} pasien di {ROOMS.length} ruangan
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        {/* Main kanban area - 2 columns: rooms (left) + unassigned (right) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* LEFT COLUMN: All rooms (vertical list) */}
          <div className="rounded-xl border border-border bg-card/30 p-3 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 pb-1">
              Ruangan Rawat Inap
            </h2>
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
                    "rounded-lg border bg-background/50 transition-all duration-200",
                    theme.border,
                    isOver && `ring-2 ${theme.ring}`
                  )}
                >
                  <div className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-t-lg border-b",
                    theme.headerBg,
                    theme.border
                  )}>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-2 w-2 rounded-full", theme.dot)} />
                      <h3 className="font-bold text-xs tracking-wider">{room}</h3>
                    </div>
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", theme.badge)}>
                      {items.length}
                    </span>
                  </div>
                  <div className="p-2 space-y-1.5 min-h-[60px]">
                    {items.length === 0 ? (
                      <p className="text-[10px] text-muted-foreground/50 text-center py-3 italic">
                        Taruh pasien di sini
                      </p>
                    ) : (
                      items.map((p) => {
                        const hl = highlights.get(p.id);
                        return (
                          <PatientRow
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
                            highlight={hl}
                          />
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* RIGHT COLUMN: Unassigned */}
          <div
            onDragOver={(e) => handleDragOver(e, "__unassigned__")}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, "")}
            className={cn(
              "rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/20 p-3 space-y-2 transition-all duration-200",
              dragOverRoom === "__unassigned__" && "ring-2 ring-emerald-500/50 border-emerald-500/50"
            )}
          >
            <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground px-1 pb-1">
              Belum Ditempatkan
            </h2>
            <div className="rounded-lg border border-muted-foreground/20 bg-background/30">
              <div className="px-3 py-2 border-b border-muted-foreground/10">
                <p className="text-[10px] text-muted-foreground/70">
                  Drag pasien ke sini untuk menghapus dari ruangan
                </p>
              </div>
              <div className="p-2 space-y-1.5 min-h-[200px] max-h-[calc(100vh-320px)] overflow-y-auto">
                {unassigned.length === 0 ? (
                  <p className="text-[10px] text-muted-foreground/50 text-center py-6 italic">
                    Semua pasien sudah ditempatkan
                  </p>
                ) : (
                  unassigned.map((p) => {
                    const hl = highlights.get(p.id);
                    return (
                      <PatientRow
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
                        highlight={hl}
                      />
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NOTIFICATION SIDEBAR */}
        {notifOpen && (
          <NotificationPanel
            notifications={notifications}
            onClear={() => {
              setNotifications([]);
              setHighlights(new Map());
            }}
            onClose={() => setNotifOpen(false)}
          />
        )}
      </div>

      {/* AI CHATBOX */}
      {chatOpen && (
        <KanbanAIChat
          onClose={() => setChatOpen(false)}
          onSyncComplete={(result) => {
            applyChanges(result);
            setChatOpen(false);
          }}
        />
      )}

      {/* Floating AI Sync button (mobile) */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-500 text-white px-4 py-3 shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 lg:hidden"
        >
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">AI Sync</span>
        </button>
      )}
    </>
  );
}

function PatientRow({
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
  highlight,
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
  highlight?: ChangeHighlight;
}) {
  const hlStyle = highlight ? HIGHLIGHT_STYLES[highlight.type] : null;

  return (
    <div
      draggable={!isEditingNotes}
      onDragStart={(e) => onDragStart(e, patient.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-md border border-border/50 bg-background/70 p-2 transition-all duration-200",
        !isEditingNotes && "cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:bg-accent/40",
        isDragging && "opacity-30",
        isMoving && "opacity-50 animate-pulse",
        isEditingNotes && "border-emerald-500/40 cursor-default",
        hlStyle?.ring,
        hlStyle?.bg,
        "animate-in fade-in-50"
      )}
    >
      {hlStyle && (
        <div className={cn(
          "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mb-1 px-1",
          highlight?.type === "created" && "text-emerald-400",
          highlight?.type === "moved" && "text-blue-400",
          highlight?.type === "updated" && "text-amber-400",
          highlight?.type === "discharged" && "text-rose-400",
        )}>
          <hlStyle.icon className="h-2.5 w-2.5" />
          {hlStyle.label}
          {highlight?.type === "moved" && patient.room && (
            <span className="text-muted-foreground normal-case">→ {patient.room}{patient.bed ? ` ${patient.bed}` : ""}</span>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isEditingNotes && (
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {patient.bed && (
              <span className="font-mono text-[10px] bg-muted/80 px-1.5 py-0.5 rounded shrink-0">
                {patient.bed}
              </span>
            )}
            <Link
              href={`/pasien/${patient.id}`}
              className="font-semibold text-xs truncate hover:text-emerald-400 transition-colors"
            >
              {patient.name}
            </Link>
            {patient.sex && (
              <span className={cn(
                "text-[9px] font-bold px-1 py-0.5 rounded shrink-0",
                patient.sex === "L" ? "bg-blue-500/20 text-blue-300" : "bg-pink-500/20 text-pink-300"
              )}>
                {patient.sex === "L" ? "L" : "P"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-0.5">
            {patient.medicalRecordNo && (
              <span className="font-mono">RM: {patient.medicalRecordNo}</span>
            )}
            {patient.diagnosis && (
              <>
                {patient.medicalRecordNo && <span>·</span>}
                <span className="truncate">{patient.diagnosis}</span>
              </>
            )}
          </div>

          {patient.notes && !isEditingNotes && (
            <div className="mt-1 bg-emerald-500/5 border border-emerald-500/10 rounded px-1.5 py-1">
              <p className="text-[10px] text-emerald-300/80 line-clamp-2 leading-relaxed whitespace-pre-wrap">
                {patient.notes}
              </p>
            </div>
          )}

          {isEditingNotes && (
            <div className="mt-1.5 space-y-1">
              <textarea
                ref={notesInputRef}
                value={notesDraft}
                onChange={(e) => onNotesDraftChange(e.target.value)}
                placeholder="Catatan pasien..."
                rows={2}
                className="w-full text-[11px] rounded border border-emerald-500/30 bg-background/90 px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-muted-foreground/40"
              />
              <div className="flex gap-1">
                <button
                  onClick={onSaveNotes}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"
                >
                  <Check className="h-2.5 w-2.5" />
                  Simpan
                </button>
                <button
                  onClick={onCancelNotes}
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                >
                  <X className="h-2.5 w-2.5" />
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {!isEditingNotes && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onStartEditNotes(); }}
              className={cn(
                "p-1 rounded transition-colors",
                patient.notes
                  ? "text-emerald-300 hover:bg-emerald-500/20"
                  : "text-muted-foreground hover:bg-muted"
              )}
              title="Catatan"
            >
              <StickyNote className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDischarge(); }}
              disabled={isDischarging}
              className="p-1 rounded text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
              title="Pulangkan"
            >
              {isDischarging ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationPanel({
  notifications,
  onClear,
  onClose,
}: {
  notifications: { change: BulkSyncChange; timestamp: number }[];
  onClear: () => void;
  onClose: () => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-card/50 p-4 h-fit">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold flex items-center gap-1.5">
            <Bell className="h-4 w-4" />
            Notifikasi
          </h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center py-6">
          Belum ada perubahan. Kirim list pasien via AI Sync untuk melihat notifikasi.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border bg-card/50 p-3 h-fit max-h-[calc(100vh-200px)] overflow-hidden flex flex-col">
      <div className="flex items-center justify-between mb-2 px-1">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Bell className="h-4 w-4 text-blue-400" />
          Notifikasi
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">
            {notifications.length}
          </span>
        </h3>
        <div className="flex items-center gap-1">
          <button
            onClick={onClear}
            className="p-1 rounded hover:bg-muted text-muted-foreground"
            title="Hapus semua"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
          <button onClick={onClose} className="p-1 rounded hover:bg-muted">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
      <div className="space-y-1.5 overflow-y-auto pr-1">
        {notifications.map((n, i) => {
          const hlStyle = HIGHLIGHT_STYLES[n.change.type];
          const Icon = hlStyle.icon;
          const timeAgo = formatTimeAgo(n.timestamp);
          return (
            <div
              key={i}
              className={cn(
                "rounded-md border p-2 text-[11px] transition-all",
                n.change.type === "created" && "border-emerald-500/30 bg-emerald-500/5",
                n.change.type === "moved" && "border-blue-500/30 bg-blue-500/5",
                n.change.type === "updated" && "border-amber-500/30 bg-amber-500/5",
                n.change.type === "discharged" && "border-rose-500/30 bg-rose-500/5"
              )}
            >
              <div className="flex items-start gap-1.5">
                <Icon className={cn(
                  "h-3 w-3 mt-0.5 shrink-0",
                  n.change.type === "created" && "text-emerald-400",
                  n.change.type === "moved" && "text-blue-400",
                  n.change.type === "updated" && "text-amber-400",
                  n.change.type === "discharged" && "text-rose-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">
                    {n.change.patientName}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {n.change.type === "created" && `Ditambahkan ke ${n.change.toRoom}${n.change.toBed ? ` ${n.change.toBed}` : ""}`}
                    {n.change.type === "moved" && `Pindah: ${n.change.fromRoom || "-"}${n.change.fromBed ? ` ${n.change.fromBed}` : ""} → ${n.change.toRoom}${n.change.toBed ? ` ${n.change.toBed}` : ""}`}
                    {n.change.type === "updated" && (n.change.changes?.join(", ") || "Data diperbarui")}
                    {n.change.type === "discharged" && `Dipulangkan dari ${n.change.fromRoom || "-"}`}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">{timeAgo}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanAIChat({
  onClose,
  onSyncComplete,
}: {
  onClose: () => void;
  onSyncComplete: (result: Awaited<ReturnType<typeof bulkSyncPatients>>) => void;
}) {
  const [messages, setMessages] = useState<{ role: "user" | "assistant" | "system"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedPatients, setParsedPatients] = useState<Awaited<ReturnType<typeof bulkSyncPatients>>["changes"] extends never ? never : any[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, parsedPatients]);

  async function handleParse() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: content.slice(0, 200) + (content.length > 200 ? "..." : "") }]);
    setLoading(true);
    setParsedPatients(null);
    try {
      const res = await fetch("/api/ai/kanban-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: "❌ " + data.error }]);
      } else if (data.patients) {
        setParsedPatients(data.patients);
        setMessages((prev) => [...prev, { role: "assistant", content: `Terdeteksi ${data.patients.length} pasien. Review lalu klik Sinkronkan.` }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ " + (e instanceof Error ? e.message : "Error") }]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSync() {
    if (!parsedPatients || syncing) return;
    setSyncing(true);
    try {
      const result = await bulkSyncPatients({ patients: parsedPatients });
      setMessages((prev) => [
        ...prev,
        { role: "system", content: `✅ Sinkron selesai: ${result.summary.created} baru, ${result.summary.moved} pindah, ${result.summary.updated} update, ${result.summary.discharged} pulang` },
      ]);
      setParsedPatients(null);
      setTimeout(() => onSyncComplete(result), 800);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal sinkron: " + (e instanceof Error ? e.message : "Error") }]);
    } finally {
      setSyncing(false);
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(420px,calc(100vw-2rem))] h-[min(640px,calc(100vh-2rem))] rounded-xl border border-emerald-500/30 bg-card shadow-2xl flex flex-col overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-3 border-b border-border bg-gradient-to-r from-emerald-500/10 to-transparent">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/20">
            <Bot className="h-3.5 w-3.5 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate">AI Sync Kanban</p>
            <p className="text-[10px] text-muted-foreground">Paste list pasien → auto-assign ruangan</p>
          </div>
        </div>
        <button onClick={onClose} className="p-1 rounded hover:bg-muted">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {messages.length === 0 && !parsedPatients && (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground text-center pt-2">
              Kirim list pasien (format bebas). AI akan extract nama, ruangan, bed, diagnosis, dan otomatis assign ke kanban.
            </p>
            <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2 text-[10px] text-emerald-300/80 space-y-1">
              <p className="font-bold">💡 Tips:</p>
              <ul className="list-disc list-inside space-y-0.5 ml-1">
                <li>Format RTF/text bebas, AI yang parsing</li>
                <li>Pasien lama: di-update (pindah kamar/ruangan)</li>
                <li>Pasien baru: otomatis dibuat</li>
                <li>Pasien hilang dari list: otomatis dipulangkan</li>
              </ul>
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={cn(
              "max-w-[90%] rounded-lg p-2 text-xs",
              m.role === "user" ? "bg-emerald-500/15 text-foreground" :
              m.content.startsWith("✅") ? "border border-emerald-500/30 bg-emerald-500/5 text-emerald-200" :
              m.content.startsWith("❌") ? "border border-rose-500/30 bg-rose-500/5 text-rose-200" :
              "bg-muted/40"
            )}>
              <div className="flex items-center gap-1.5 mb-0.5">
                {m.role === "user" ? <User className="h-2.5 w-2.5 text-emerald-400" /> : <Bot className="h-3 w-3 text-emerald-400" />}
                <span className="text-[10px] font-semibold">{m.role === "user" ? "Anda" : "AI"}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          </div>
        ))}

        {parsedPatients && (
          <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2.5 text-xs space-y-2">
            <p className="text-[10px] font-semibold text-emerald-300 uppercase tracking-wider">
              Preview: {parsedPatients.length} pasien
            </p>
            <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
              {parsedPatients.map((p, i) => (
                <div key={i} className="flex items-center gap-1.5 text-[10px] bg-background/50 rounded px-2 py-1">
                  <span className="font-mono text-muted-foreground w-16 shrink-0">{p.room}{p.bed ? ` ${p.bed}` : ""}</span>
                  <span className="truncate flex-1">{p.name}</span>
                  {p.diagnosis && <span className="text-muted-foreground truncate hidden sm:inline">· {p.diagnosis}</span>}
                </div>
              ))}
            </div>
            <div className="flex gap-1.5 pt-1">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex-1 inline-flex items-center justify-center gap-1 text-xs font-medium px-2 py-1.5 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
              >
                {syncing ? <><Loader2 className="h-3 w-3 animate-spin" />Sinkron...</> : <><Check className="h-3 w-3" />Sinkronkan ke Kanban</>}
              </button>
              <button
                onClick={() => setParsedPatients(null)}
                className="px-2 py-1.5 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 text-xs"
              >
                Batal
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-400" />
            <span>AI mem-parse list pasien...</span>
          </div>
        )}
      </div>

      <div className="border-t border-border p-2 flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleParse(); } }}
          placeholder="Paste list pasien rawat inap..."
          rows={3}
          className="flex-1 min-h-[60px] max-h-32 resize-none rounded-md border border-border bg-background px-2 py-1.5 text-xs focus:border-emerald-500 focus:outline-none"
        />
        <button
          onClick={handleParse}
          disabled={loading || !input.trim()}
          className="h-auto px-3 rounded-md bg-emerald-500 text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}d lalu`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m lalu`;
  const hours = Math.floor(minutes / 60);
  return `${hours}j lalu`;
}
