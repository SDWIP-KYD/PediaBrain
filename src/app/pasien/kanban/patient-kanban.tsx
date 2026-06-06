"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import Link from "next/link";
import {
  GripVertical, Loader2, StickyNote, LogOut, X, Check, User,
  Bot, Send, Bell, Trash2, Plus, ArrowRightLeft, Undo2,
  Stethoscope, ChevronDown, Settings, Pencil, Check as CheckIcon, X as XIcon,
} from "lucide-react";
import {
  movePatientToRoom, getPatientsByRoom, updatePatientNotes, dischargePatient,
  bulkSyncPatients, bulkEditPatients, undoBulkSync, type BulkSyncChange,
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
  dpjp: string | null;
  diagnosis: string | null;
}

const DEFAULT_ROOMS = ["DAHLIA", "ANGGREK", "MELATI", "SERUNI"];

const ROOM_COLORS: Record<string, { border: string; headerBg: string; badge: string; ring: string; dot: string }> = {
  DAHLIA: { border: "border-rose-500/40 hover:border-rose-500/60", headerBg: "bg-gradient-to-r from-rose-500/15 to-rose-500/5", badge: "bg-rose-500/20 text-rose-300", ring: "ring-rose-500/50", dot: "bg-rose-500" },
  ANGGREK: { border: "border-violet-500/40 hover:border-violet-500/60", headerBg: "bg-gradient-to-r from-violet-500/15 to-violet-500/5", badge: "bg-violet-500/20 text-violet-300", ring: "ring-violet-500/50", dot: "bg-violet-500" },
  MELATI: { border: "border-amber-500/40 hover:border-amber-500/60", headerBg: "bg-gradient-to-r from-amber-500/15 to-amber-500/5", badge: "bg-amber-500/20 text-amber-300", ring: "ring-amber-500/50", dot: "bg-amber-500" },
  SERUNI: { border: "border-cyan-500/40 hover:border-cyan-500/60", headerBg: "bg-gradient-to-r from-cyan-500/15 to-cyan-500/5", badge: "bg-cyan-500/20 text-cyan-300", ring: "ring-cyan-500/50", dot: "bg-cyan-500" },
};

const GENERIC_ROOM_COLORS = [
  { border: "border-emerald-500/40 hover:border-emerald-500/60", headerBg: "bg-gradient-to-r from-emerald-500/15 to-emerald-500/5", badge: "bg-emerald-500/20 text-emerald-300", ring: "ring-emerald-500/50", dot: "bg-emerald-500" },
  { border: "border-orange-500/40 hover:border-orange-500/60", headerBg: "bg-gradient-to-r from-orange-500/15 to-orange-500/5", badge: "bg-orange-500/20 text-orange-300", ring: "ring-orange-500/50", dot: "bg-orange-500" },
  { border: "border-teal-500/40 hover:border-teal-500/60", headerBg: "bg-gradient-to-r from-teal-500/15 to-teal-500/5", badge: "bg-teal-500/20 text-teal-300", ring: "ring-teal-500/50", dot: "bg-teal-500" },
  { border: "border-indigo-500/40 hover:border-indigo-500/60", headerBg: "bg-gradient-to-r from-indigo-500/15 to-indigo-500/5", badge: "bg-indigo-500/20 text-indigo-300", ring: "ring-indigo-500/50", dot: "bg-indigo-500" },
];

function getRoomTheme(room: string) {
  if (ROOM_COLORS[room]) return ROOM_COLORS[room];
  const idx = Math.abs(room.split("").reduce((h, c) => ((h << 5) - h + c.charCodeAt(0)) | 0, 0)) % GENERIC_ROOM_COLORS.length;
  return GENERIC_ROOM_COLORS[idx];
}

const HIGHLIGHT_STYLES: Record<ChangeType, { ring: string; bg: string; label: string; icon: typeof Plus }> = {
  created: { ring: "ring-2 ring-emerald-400", bg: "bg-emerald-500/5", label: "Baru", icon: Plus },
  moved: { ring: "ring-2 ring-blue-400", bg: "bg-blue-500/5", label: "Pindah", icon: ArrowRightLeft },
  updated: { ring: "ring-2 ring-amber-400", bg: "bg-amber-500/5", label: "Update", icon: ArrowRightLeft },
  discharged: { ring: "ring-2 ring-rose-400", bg: "bg-rose-500/5", label: "Pulang", icon: LogOut },
};

function normalizeDpjp(s: string | null | undefined): string {
  return (s || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function getDpjpShort(s: string | null | undefined): string {
  const n = (s || "").trim();
  if (!n) return "";
  return n.length > 24 ? n.slice(0, 22) + "…" : n;
}

function loadRooms(): string[] {
  if (typeof window === "undefined") return DEFAULT_ROOMS;
  try {
    const saved = localStorage.getItem("pedibrain_rooms");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_ROOMS;
}

function saveRooms(rooms: string[]) {
  try { localStorage.setItem("pedibrain_rooms", JSON.stringify(rooms)); } catch {}
}

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
  const [chatOpen, setChatOpen] = useState(false);
  const [dpjpFilter, setDpjpFilter] = useState<string>("__all__");
  const [dpjpOpen, setDpjpOpen] = useState(false);
  const [rooms, setRooms] = useState<string[]>(DEFAULT_ROOMS);
  const [roomsOpen, setRoomsOpen] = useState(false);
  const [newRoom, setNewRoom] = useState("");
  const [editingRoom, setEditingRoom] = useState<string | null>(null);
  const [editRoomDraft, setEditRoomDraft] = useState("");
  const [mobileMoveId, setMobileMoveId] = useState<string | null>(null);
  const notesInputRef = useRef<HTMLTextAreaElement>(null);
  const dpjpRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRooms(loadRooms());
  }, []);

  useEffect(() => {
    loadPatients();
  }, []);

  useEffect(() => {
    if (editingNotes && notesInputRef.current) notesInputRef.current.focus();
  }, [editingNotes]);

  useEffect(() => {
    if (!dpjpOpen) return;
    function onClick(e: MouseEvent) {
      if (dpjpRef.current && !dpjpRef.current.contains(e.target as Node)) setDpjpOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [dpjpOpen]);

  useEffect(() => {
    if (!roomsOpen) return;
    function onClick(e: MouseEvent) {
      if (roomsRef.current && !roomsRef.current.contains(e.target as Node)) setRoomsOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [roomsOpen]);

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

  const dpjpList = useMemo(() => {
    const set = new Set<string>();
    for (const p of patients) {
      if (p.dpjp) set.add(p.dpjp.trim());
    }
    return Array.from(set).sort();
  }, [patients]);

  const filteredPatients = useMemo(() => {
    if (dpjpFilter === "__all__") return patients;
    const target = normalizeDpjp(dpjpFilter);
    return patients.filter((p) => normalizeDpjp(p.dpjp) === target);
  }, [patients, dpjpFilter]);

  const roomColumns = useMemo(() => {
    const half = Math.ceil(rooms.length / 2);
    return { left: rooms.slice(0, half), right: rooms.slice(half) };
  }, [rooms]);

  const byRoom = useMemo(() => {
    const map: Record<string, KanbanPatient[]> = {};
    for (const r of rooms) {
      map[r] = filteredPatients
        .filter((p) => p.room === r)
        .sort((a, b) => (a.bed || "").localeCompare(b.bed || "", undefined, { numeric: true }));
    }
    return map;
  }, [filteredPatients, rooms]);

  const unassigned = filteredPatients.filter(
    (p) => !p.room || !rooms.includes(p.room)
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

  function handleDragLeave() { setDragOverRoom(null); }

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
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, room: targetRoom || null } : p)));
    try { await movePatientToRoom(id, targetRoom || null); } catch {
      setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, room: patient.room } : p)));
    } finally { setMovingId(null); }
  }

  async function handleMoveToRoom(id: string, targetRoom: string) {
    setMobileMoveId(null);
    const patient = patients.find((p) => p.id === id);
    if (!patient || (patient.room || "") === (targetRoom || "")) return;
    setMovingId(id);
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, room: targetRoom || null } : p)));
    try { await movePatientToRoom(id, targetRoom || null); } catch {
      setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, room: patient.room } : p)));
    } finally { setMovingId(null); }
  }

  async function handleSaveNotes(patientId: string) {
    try {
      await updatePatientNotes(patientId, notesDraft || null);
      setPatients((prev) => prev.map((p) => (p.id === patientId ? { ...p, notes: notesDraft || null } : p)));
      setEditingNotes(null);
    } catch (error) { console.error("Failed to save notes:", error); }
  }

  async function handleDischarge(patientId: string) {
    setDischargingId(patientId);
    try {
      await dischargePatient(patientId);
      setPatients((prev) => prev.filter((p) => p.id !== patientId));
    } catch (error) { console.error("Failed to discharge patient:", error); }
    finally { setDischargingId(null); }
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
      if (change.patientId) newHighlights.set(change.patientId, { type: change.type, timestamp: ts });
      newNotifs.push({ change, timestamp: ts });
    }
    setHighlights(newHighlights);
    setNotifications((prev) => [...newNotifs, ...prev].slice(0, 50));
    loadPatients();
  }

  function handleAddRoom() {
    const name = newRoom.trim().toUpperCase();
    if (!name || rooms.includes(name)) return;
    const updated = [...rooms, name];
    setRooms(updated);
    saveRooms(updated);
    setNewRoom("");
  }

  function handleDeleteRoom(room: string) {
    if (rooms.length <= 1) return;
    const updated = rooms.filter((r) => r !== room);
    setRooms(updated);
    saveRooms(updated);
  }

  function handleRenameRoom(oldName: string) {
    const newName = editRoomDraft.trim().toUpperCase();
    if (!newName || newName === oldName || rooms.includes(newName)) return;
    const updated = rooms.map((r) => r === oldName ? newName : r);
    setRooms(updated);
    saveRooms(updated);
    setEditingRoom(null);
    // Also rename patients in this room
    setPatients((prev) => prev.map((p) => p.room === oldName ? { ...p, room: newName } : p));
  }

  const totalInRooms = rooms.reduce((sum, r) => sum + (byRoom[r]?.length || 0), 0);
  const notifCount = notifications.length;
  const currentDpjpLabel = dpjpFilter === "__all__" ? "Semua DPJP" : getDpjpShort(dpjpFilter);

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
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        {/* DPJP Filter */}
        <div className="relative" ref={dpjpRef}>
          <button onClick={() => setDpjpOpen(!dpjpOpen)} className={cn(
            "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all",
            dpjpFilter !== "__all__" ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" : "border border-border hover:bg-accent"
          )}>
            <Stethoscope className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{currentDpjpLabel}</span>
            <span className="sm:hidden">DPJP</span>
            <ChevronDown className={cn("h-3 w-3 transition-transform", dpjpOpen && "rotate-180")} />
          </button>
          {dpjpOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-64 max-h-72 overflow-y-auto rounded-lg border border-border bg-card shadow-xl">
              <button onClick={() => { setDpjpFilter("__all__"); setDpjpOpen(false); }} className={cn("block w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors", dpjpFilter === "__all__" && "bg-emerald-500/10 text-emerald-300")}>
                <span className="font-semibold">Semua DPJP</span>
                <span className="text-muted-foreground ml-1">({patients.length})</span>
              </button>
              <div className="border-t border-border" />
              {dpjpList.length === 0 ? (
                <p className="px-3 py-3 text-[11px] text-muted-foreground text-center">Belum ada DPJP</p>
              ) : dpjpList.map((dpjp) => {
                const count = patients.filter((p) => normalizeDpjp(p.dpjp) === normalizeDpjp(dpjp)).length;
                return (
                  <button key={dpjp} onClick={() => { setDpjpFilter(dpjp); setDpjpOpen(false); }} className={cn("block w-full text-left px-3 py-1.5 text-xs hover:bg-accent transition-colors", dpjpFilter === dpjp && "bg-emerald-500/10 text-emerald-300")}>
                    <span className="truncate">{dpjp}</span>
                    <span className="text-muted-foreground ml-1">({count})</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Room Management */}
        <div className="relative" ref={roomsRef}>
          <button onClick={() => setRoomsOpen(!roomsOpen)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-all">
            <Settings className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ruangan</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1 py-0.5 rounded">{rooms.length}</span>
          </button>
          {roomsOpen && (
            <div className="absolute top-full left-0 mt-1 z-30 w-64 max-h-80 overflow-y-auto rounded-lg border border-border bg-card shadow-xl p-2">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1 mb-2">Kelola Ruangan</p>
              <div className="space-y-1 mb-2">
                {rooms.map((room) => (
                  <div key={room} className="flex items-center gap-1.5 px-1.5 py-1 rounded bg-muted/30 group">
                    {editingRoom === room ? (
                      <>
                        <input
                          autoFocus
                          value={editRoomDraft}
                          onChange={(e) => setEditRoomDraft(e.target.value)}
                          onKeyDown={(e) => { if (e.key === "Enter") handleRenameRoom(room); if (e.key === "Escape") setEditingRoom(null); }}
                          className="flex-1 text-xs bg-background border border-border rounded px-1.5 py-0.5 focus:outline-none focus:border-emerald-500"
                        />
                        <button onClick={() => handleRenameRoom(room)} className="p-0.5 text-emerald-400 hover:bg-emerald-500/20 rounded"><CheckIcon className="h-3 w-3" /></button>
                        <button onClick={() => setEditingRoom(null)} className="p-0.5 text-muted-foreground hover:bg-muted rounded"><XIcon className="h-3 w-3" /></button>
                      </>
                    ) : (
                      <>
                        <div className={cn("h-2 w-2 rounded-full shrink-0", getRoomTheme(room).dot)} />
                        <span className="flex-1 text-xs truncate">{room}</span>
                        <button onClick={() => { setEditingRoom(room); setEditRoomDraft(room); }} className="p-0.5 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"><Pencil className="h-3 w-3" /></button>
                        <button onClick={() => handleDeleteRoom(room)} className="p-0.5 text-rose-400 hover:bg-rose-500/20 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-3 w-3" /></button>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-1 pt-1 border-t border-border">
                <input
                  value={newRoom}
                  onChange={(e) => setNewRoom(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleAddRoom(); }}
                  placeholder="Nama ruangan baru..."
                  className="flex-1 text-xs bg-background border border-border rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                />
                <button onClick={handleAddRoom} disabled={!newRoom.trim()} className="px-2 py-1 rounded bg-emerald-500 text-white text-xs hover:bg-emerald-600 disabled:opacity-50 transition-colors">
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            </div>
          )}
        </div>

        <button onClick={() => setChatOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-border hover:bg-accent transition-all">
          <Bot className="h-3.5 w-3.5 text-emerald-400" />
          <span className="hidden sm:inline">AI Sync</span>
          <span className="sm:hidden">AI</span>
        </button>

        {notifCount > 0 && (
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Bell className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{notifCount} perubahan</span>
          </div>
        )}

        <span className="text-xs text-muted-foreground ml-auto">
          {totalInRooms} pasien
          {dpjpFilter !== "__all__" && <span className="text-emerald-400 ml-1">(filtered)</span>}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 min-w-0">
          {roomColumns.left.map((room) => (
            <RoomSection key={room} room={room} theme={getRoomTheme(room)} items={byRoom[room] ?? []} isOver={dragOverRoom === room} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onPatientDragStart={handleDragStart} onPatientDragEnd={handleDragEnd} highlights={highlights} draggedId={draggedId} movingId={movingId} editingNotes={editingNotes} notesDraft={notesDraft} setNotesDraft={setNotesDraft} setEditingNotes={setEditingNotes} startEditingNotes={startEditingNotes} handleSaveNotes={handleSaveNotes} handleDischarge={handleDischarge} dischargingId={dischargingId} notesInputRef={editingNotes ? notesInputRef : undefined} rooms={rooms} mobileMoveId={mobileMoveId} setMobileMoveId={setMobileMoveId} onMoveToRoom={handleMoveToRoom} />
          ))}
          {roomColumns.right.map((room) => (
            <RoomSection key={room} room={room} theme={getRoomTheme(room)} items={byRoom[room] ?? []} isOver={dragOverRoom === room} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onPatientDragStart={handleDragStart} onPatientDragEnd={handleDragEnd} highlights={highlights} draggedId={draggedId} movingId={movingId} editingNotes={editingNotes} notesDraft={notesDraft} setNotesDraft={setNotesDraft} setEditingNotes={setEditingNotes} startEditingNotes={startEditingNotes} handleSaveNotes={handleSaveNotes} handleDischarge={handleDischarge} dischargingId={dischargingId} notesInputRef={editingNotes ? notesInputRef : undefined} rooms={rooms} mobileMoveId={mobileMoveId} setMobileMoveId={setMobileMoveId} onMoveToRoom={handleMoveToRoom} />
          ))}
        </div>

        {/* RIGHT: Sidebar */}
        <div className="flex flex-col gap-3 min-w-0">
          <div className={cn("rounded-xl border bg-card/50 flex flex-col overflow-hidden transition-all duration-200", chatOpen ? "border-emerald-500/40 max-h-[60vh]" : "border-border")}>
            <button onClick={() => setChatOpen(!chatOpen)} className="flex items-center justify-between px-3 py-2 hover:bg-accent/30 transition-colors">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20"><Bot className="h-3 w-3 text-emerald-400" /></div>
                <span className="text-sm font-semibold">AI Sync</span>
              </div>
              <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", chatOpen && "rotate-180")} />
            </button>
            {chatOpen && <KanbanAIChat onClose={() => setChatOpen(false)} onSyncComplete={(result) => { applyChanges(result); setChatOpen(false); }} />}
          </div>

          <div onDragOver={(e) => handleDragOver(e, "__unassigned__")} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, "")} className={cn("rounded-xl border-2 border-dashed border-muted-foreground/30 bg-card/30 p-3 transition-all duration-200", dragOverRoom === "__unassigned__" && "ring-2 ring-emerald-500/50 border-emerald-500/50")}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Belum Ditempatkan</h3>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground">{unassigned.length}</span>
            </div>
            <div className="space-y-1.5 max-h-[280px] overflow-y-auto pr-1">
              {unassigned.length === 0 ? (
                <p className="text-[10px] text-muted-foreground/50 text-center py-4 italic">Semua pasien sudah ditempatkan</p>
              ) : unassigned.map((p) => (
                <PatientRow key={p.id} patient={p} onDragStart={handleDragStart} onDragEnd={handleDragEnd} isDragging={draggedId === p.id} isMoving={movingId === p.id} isEditingNotes={editingNotes === p.id} notesDraft={notesDraft} onNotesDraftChange={setNotesDraft} onStartEditNotes={() => startEditingNotes(p)} onSaveNotes={() => handleSaveNotes(p.id)} onCancelNotes={() => setEditingNotes(null)} onDischarge={() => handleDischarge(p.id)} isDischarging={dischargingId === p.id} notesInputRef={editingNotes === p.id ? notesInputRef : undefined} highlight={highlights.get(p.id)} rooms={rooms} mobileMoveId={mobileMoveId} setMobileMoveId={setMobileMoveId} onMoveToRoom={handleMoveToRoom} />
              ))}
            </div>
          </div>

          <NotificationPanel notifications={notifications} onClear={() => { setNotifications([]); setHighlights(new Map()); }} />
        </div>
      </div>

      {!chatOpen && (
        <button onClick={() => setChatOpen(true)} className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full bg-emerald-500 text-white px-4 py-3 shadow-lg hover:bg-emerald-600 transition-all hover:scale-105 lg:hidden">
          <Bot className="h-4 w-4" />
          <span className="text-sm font-medium">AI Sync</span>
        </button>
      )}
    </>
  );
}

function RoomSection({ room, theme, items, isOver, onDragOver, onDragLeave, onDrop, onPatientDragStart, onPatientDragEnd, highlights, draggedId, movingId, editingNotes, notesDraft, setNotesDraft, setEditingNotes, startEditingNotes, handleSaveNotes, handleDischarge, dischargingId, notesInputRef, rooms, mobileMoveId, setMobileMoveId, onMoveToRoom }: {
  room: string;
  theme: typeof ROOM_COLORS[string];
  items: KanbanPatient[];
  isOver: boolean;
  onDragOver: (e: React.DragEvent, room: string) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, targetRoom: string) => void;
  onPatientDragStart: (e: React.DragEvent, id: string) => void;
  onPatientDragEnd: (e: React.DragEvent) => void;
  highlights: Map<string, ChangeHighlight>;
  draggedId: string | null;
  movingId: string | null;
  editingNotes: string | null;
  notesDraft: string;
  setNotesDraft: (v: string) => void;
  setEditingNotes: (v: string | null) => void;
  startEditingNotes: (p: KanbanPatient) => void;
  handleSaveNotes: (id: string) => Promise<void>;
  handleDischarge: (id: string) => Promise<void>;
  dischargingId: string | null;
  notesInputRef?: React.RefObject<HTMLTextAreaElement | null>;
  rooms: string[];
  mobileMoveId: string | null;
  setMobileMoveId: (id: string | null) => void;
  onMoveToRoom: (id: string, room: string) => void;
}) {
  return (
    <div onDragOver={(e) => onDragOver(e, room)} onDragLeave={onDragLeave} onDrop={(e) => onDrop(e, room)} className={cn("rounded-lg border bg-background/50 transition-all duration-200 flex flex-col", theme.border, isOver && `ring-2 ${theme.ring}`)}>
      <div className={cn("flex items-center justify-between px-3 py-2 rounded-t-lg border-b shrink-0", theme.headerBg, theme.border)}>
        <div className="flex items-center gap-2">
          <div className={cn("h-2 w-2 rounded-full", theme.dot)} />
          <h3 className="font-bold text-xs tracking-wider">{room}</h3>
        </div>
        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded-full", theme.badge)}>{items.length}</span>
      </div>
      <div className="p-2 space-y-1.5 min-h-[80px] max-h-[420px] overflow-y-auto">
        {items.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 text-center py-4 italic">Taruh pasien di sini</p>
        ) : items.map((p) => (
          <PatientRow key={p.id} patient={p} onDragStart={onPatientDragStart} onDragEnd={onPatientDragEnd} isDragging={draggedId === p.id} isMoving={movingId === p.id} isEditingNotes={editingNotes === p.id} notesDraft={notesDraft} onNotesDraftChange={setNotesDraft} onStartEditNotes={() => startEditingNotes(p)} onSaveNotes={() => handleSaveNotes(p.id)} onCancelNotes={() => setEditingNotes(null)} onDischarge={() => handleDischarge(p.id)} isDischarging={dischargingId === p.id} notesInputRef={editingNotes === p.id ? notesInputRef : undefined} highlight={highlights.get(p.id)} rooms={rooms} mobileMoveId={mobileMoveId} setMobileMoveId={setMobileMoveId} onMoveToRoom={onMoveToRoom} />
        ))}
      </div>
    </div>
  );
}

function PatientRow({ patient, onDragStart, onDragEnd, isDragging, isMoving, isEditingNotes, notesDraft, onNotesDraftChange, onStartEditNotes, onSaveNotes, onCancelNotes, onDischarge, isDischarging, notesInputRef, highlight, rooms, mobileMoveId, setMobileMoveId, onMoveToRoom }: {
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
  rooms: string[];
  mobileMoveId: string | null;
  setMobileMoveId: (id: string | null) => void;
  onMoveToRoom: (id: string, room: string) => void;
}) {
  const hlStyle = highlight ? HIGHLIGHT_STYLES[highlight.type] : null;
  const dpjpShort = getDpjpShort(patient.dpjp);
  const showMobileMove = mobileMoveId === patient.id;
  const otherRooms = rooms.filter((r) => r !== patient.room);

  return (
    <div
      draggable={!isEditingNotes && !showMobileMove}
      onDragStart={(e) => onDragStart(e, patient.id)}
      onDragEnd={onDragEnd}
      className={cn(
        "group rounded-md border border-border/50 bg-background/70 p-2 transition-all duration-200",
        !isEditingNotes && !showMobileMove && "cursor-grab active:cursor-grabbing hover:border-emerald-500/40 hover:bg-accent/40",
        isDragging && "opacity-30",
        isMoving && "opacity-50 animate-pulse",
        isEditingNotes && "border-emerald-500/40 cursor-default",
        showMobileMove && "border-blue-500/40",
        hlStyle?.ring, hlStyle?.bg,
        "animate-in fade-in-50"
      )}
    >
      {hlStyle && (
        <div className={cn("flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider mb-1 px-1",
          highlight?.type === "created" && "text-emerald-400",
          highlight?.type === "moved" && "text-blue-400",
          highlight?.type === "updated" && "text-amber-400",
          highlight?.type === "discharged" && "text-rose-400",
        )}>
          <hlStyle.icon className="h-2.5 w-2.5" />
          {hlStyle.label}
          {highlight?.type === "moved" && patient.room && <span className="text-muted-foreground normal-case">→ {patient.room}{patient.bed ? ` ${patient.bed}` : ""}</span>}
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isEditingNotes && (
          <GripVertical className="h-3.5 w-3.5 text-muted-foreground/30 shrink-0 hidden md:block" />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            {patient.bed && <span className="font-mono text-[10px] bg-muted/80 px-1.5 py-0.5 rounded shrink-0">{patient.bed}</span>}
            <Link href={`/pasien/${patient.id}`} className="font-semibold text-xs truncate hover:text-emerald-400 transition-colors">{patient.name}</Link>
            {patient.sex && <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded shrink-0", patient.sex === "L" ? "bg-blue-500/20 text-blue-300" : "bg-pink-500/20 text-pink-300")}>{patient.sex === "L" ? "L" : "P"}</span>}
          </div>

          {dpjpShort && (
            <div className="flex items-center gap-1 mt-0.5">
              <Stethoscope className="h-2.5 w-2.5 text-purple-400 shrink-0" />
              <span className="text-[10px] text-purple-300/80 truncate" title={patient.dpjp || ""}>{dpjpShort}</span>
            </div>
          )}

          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground/70 mt-0.5">
            {patient.medicalRecordNo && <span className="font-mono">RM: {patient.medicalRecordNo}</span>}
            {patient.diagnosis && <>{patient.medicalRecordNo && <span>·</span>}<span className="truncate">{patient.diagnosis}</span></>}
          </div>

          {patient.notes && !isEditingNotes && (
            <div className="mt-1 bg-emerald-500/5 border border-emerald-500/10 rounded px-1.5 py-1">
              <p className="text-[10px] text-emerald-300/80 line-clamp-2 leading-relaxed whitespace-pre-wrap">{patient.notes}</p>
            </div>
          )}

          {isEditingNotes && (
            <div className="mt-1.5 space-y-1">
              <textarea ref={notesInputRef} value={notesDraft} onChange={(e) => onNotesDraftChange(e.target.value)} placeholder="Catatan pasien..." rows={2} className="w-full text-[11px] rounded border border-emerald-500/30 bg-background/90 px-2 py-1.5 resize-none focus:outline-none focus:ring-1 focus:ring-emerald-500/50 placeholder:text-muted-foreground/40" />
              <div className="flex gap-1">
                <button onClick={onSaveNotes} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors"><Check className="h-2.5 w-2.5" /> Simpan</button>
                <button onClick={onCancelNotes} className="inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"><X className="h-2.5 w-2.5" /> Batal</button>
              </div>
            </div>
          )}

          {/* Mobile move selector */}
          {showMobileMove && (
            <div className="mt-2 p-2 rounded-md border border-blue-500/30 bg-blue-500/5 space-y-1">
              <p className="text-[10px] font-semibold text-blue-300 mb-1">Pindah ke ruangan:</p>
              <div className="flex flex-wrap gap-1">
                {otherRooms.map((r) => (
                  <button key={r} onClick={() => onMoveToRoom(patient.id, r)} className="text-[10px] font-semibold px-2 py-1 rounded bg-blue-500/15 text-blue-300 hover:bg-blue-500/30 transition-colors">
                    {r}
                  </button>
                ))}
                <button onClick={() => onMoveToRoom(patient.id, "")} className="text-[10px] font-semibold px-2 py-1 rounded bg-rose-500/15 text-rose-300 hover:bg-rose-500/30 transition-colors">
                  Lepas
                </button>
              </div>
              <button onClick={() => setMobileMoveId(null)} className="text-[10px] text-muted-foreground hover:text-foreground mt-1">Batal</button>
            </div>
          )}
        </div>

        {!isEditingNotes && (
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onStartEditNotes(); }}
              className={cn(
                "p-1.5 rounded transition-colors",
                patient.notes ? "text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20" : "text-muted-foreground/60 bg-muted/50 hover:bg-muted hover:text-foreground"
              )}
              title="Catatan"
            >
              <StickyNote className="h-3 w-3" />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDischarge(); }}
              disabled={isDischarging}
              className="p-1.5 rounded bg-rose-500/10 text-rose-300/70 hover:text-rose-300 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
              title="Pulangkan"
            >
              {isDischarging ? <Loader2 className="h-3 w-3 animate-spin" /> : <LogOut className="h-3 w-3" />}
            </button>
            {/* Mobile move button (hidden on desktop, DnD works there) */}
            <button
              onClick={(e) => { e.stopPropagation(); setMobileMoveId(showMobileMove ? null : patient.id); }}
              className={cn(
                "p-1.5 rounded md:hidden transition-colors",
                showMobileMove ? "bg-blue-500/20 text-blue-300" : "text-muted-foreground/60 bg-muted/50 hover:bg-muted hover:text-foreground"
              )}
              title="Pindah ruangan"
            >
              <ArrowRightLeft className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NotificationPanel({ notifications, onClear }: { notifications: { change: BulkSyncChange; timestamp: number }[]; onClear: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card/50 p-3 flex flex-col max-h-[300px] overflow-hidden">
      <div className="flex items-center justify-between mb-2 px-1 shrink-0">
        <h3 className="text-sm font-bold flex items-center gap-1.5">
          <Bell className="h-3.5 w-3.5 text-blue-400" />
          Notifikasi
          {notifications.length > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300">{notifications.length}</span>}
        </h3>
        {notifications.length > 0 && (
          <button onClick={onClear} className="p-1 rounded hover:bg-muted text-muted-foreground" title="Hapus semua"><Trash2 className="h-3.5 w-3.5" /></button>
        )}
      </div>
      <div className="space-y-1.5 overflow-y-auto pr-1 flex-1">
        {notifications.length === 0 ? (
          <p className="text-[10px] text-muted-foreground/50 text-center py-4 italic">Belum ada perubahan. Kirim list via AI Sync.</p>
        ) : notifications.map((n, i) => {
          const hlStyle = HIGHLIGHT_STYLES[n.change.type];
          const Icon = hlStyle.icon;
          return (
            <div key={i} className={cn("rounded-md border p-1.5 text-[11px] transition-all",
              n.change.type === "created" && "border-emerald-500/30 bg-emerald-500/5",
              n.change.type === "moved" && "border-blue-500/30 bg-blue-500/5",
              n.change.type === "updated" && "border-amber-500/30 bg-amber-500/5",
              n.change.type === "discharged" && "border-rose-500/30 bg-rose-500/5"
            )}>
              <div className="flex items-start gap-1.5">
                <Icon className={cn("h-3 w-3 mt-0.5 shrink-0",
                  n.change.type === "created" && "text-emerald-400",
                  n.change.type === "moved" && "text-blue-400",
                  n.change.type === "updated" && "text-amber-400",
                  n.change.type === "discharged" && "text-rose-400"
                )} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold truncate">{n.change.patientName}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-snug">
                    {n.change.type === "created" && `+ ${n.change.toRoom}${n.change.toBed ? ` ${n.change.toBed}` : ""}`}
                    {n.change.type === "moved" && `${n.change.fromRoom || "-"} → ${n.change.toRoom}${n.change.toBed ? ` ${n.change.toBed}` : ""}`}
                    {n.change.type === "updated" && (n.change.changes?.join(", ") || "Update")}
                    {n.change.type === "discharged" && `Pulang dari ${n.change.fromRoom || "-"}`}
                  </p>
                  <p className="text-[9px] text-muted-foreground/60 mt-0.5">{formatTimeAgo(n.timestamp)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function KanbanAIChat({ onClose, onSyncComplete }: {
  onClose: () => void;
  onSyncComplete: (result: Awaited<ReturnType<typeof bulkSyncPatients>>) => void;
}) {
  const [mode, setMode] = useState<"sync" | "edit">("sync");
  const [messages, setMessages] = useState<{ role: "user" | "assistant" | "system"; content: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedPatients, setParsedPatients] = useState<any[] | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [lastDischargedIds, setLastDischargedIds] = useState<string[]>([]);
  const [undoing, setUndoing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loading, parsedPatients]);

  function handleSwitchMode(newMode: "sync" | "edit") {
    setMode(newMode);
    setMessages([]);
    setParsedPatients(null);
  }

  async function handleParse() {
    const content = input.trim();
    if (!content || loading) return;
    setInput("");
    const userMsg = content.slice(0, 200) + (content.length > 200 ? "..." : "");
    setMessages((prev) => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);
    setParsedPatients(null);
    try {
      const history = messages
        .filter(m => m.role === "user" || m.role === "assistant")
        .map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/ai/kanban-parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: content, mode, history }),
      });
      const data = await res.json();
      if (data.error) {
        setMessages((prev) => [...prev, { role: "system", content: "❌ " + data.error }]);
      } else if (data.patients) {
        setParsedPatients(data.patients);
        const prefix = mode === "edit" ? "Terdeteksi" : "Terdeteksi";
        const suffix = mode === "edit" ? "Klik 'Simpan' untuk update. Pasien lain tidak akan terhapus." : "Review lalu klik Sinkronkan.";
        setMessages((prev) => [...prev, { role: "assistant", content: `${prefix} ${data.patients.length} pasien. ${suffix}` }]);
      }
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ " + (e instanceof Error ? e.message : "Error") }]);
    } finally { setLoading(false); }
  }

  async function handleSync() {
    if (!parsedPatients || syncing) return;
    setSyncing(true);
    try {
      let result: Awaited<ReturnType<typeof bulkSyncPatients>>;
      if (mode === "edit") {
        result = await bulkEditPatients({ patients: parsedPatients });
        const dischargedIds = result.changes.filter(c => c.type === "discharged" && c.patientId).map(c => c.patientId!);
        setLastDischargedIds(dischargedIds);
        const parts: string[] = [];
        if (result.summary.created) parts.push(`${result.summary.created} baru`);
        if (result.summary.moved) parts.push(`${result.summary.moved} pindah`);
        if (result.summary.updated) parts.push(`${result.summary.updated} update`);
        if (result.summary.discharged) parts.push(`${result.summary.discharged} pulang`);
        setMessages((prev) => [...prev, { role: "system", content: `✅ ${parts.join(", ") || "Tidak ada perubahan"}. Pasien lain aman.` }]);
      } else {
        result = await bulkSyncPatients({ patients: parsedPatients });
        const dischargedIds = result.changes.filter(c => c.type === "discharged" && c.patientId).map(c => c.patientId!);
        setLastDischargedIds(dischargedIds);
        setMessages((prev) => [...prev, { role: "system", content: `✅ ${result.summary.created} baru, ${result.summary.moved} pindah, ${result.summary.updated} update, ${result.summary.discharged} pulang` }]);
      }
      setParsedPatients(null);
      setTimeout(() => onSyncComplete(result), 800);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ " + (e instanceof Error ? e.message : "Error") }]);
    } finally { setSyncing(false); }
  }

  async function handleUndo() {
    if (!lastDischargedIds.length || undoing) return;
    setUndoing(true);
    try {
      const { restored } = await undoBulkSync(lastDischargedIds);
      setMessages((prev) => [...prev, { role: "system", content: `↩️ ${restored} pasien dikembalikan.` }]);
      setLastDischargedIds([]);
      setTimeout(() => onSyncComplete({ changes: [], summary: { created: 0, moved: 0, updated: 0, discharged: 0, total: 0 } }), 800);
    } catch (e) {
      setMessages((prev) => [...prev, { role: "system", content: "❌ Gagal undo: " + (e instanceof Error ? e.message : "Error") }]);
    } finally { setUndoing(false); }
  }

  return (
    <div className="flex flex-col border-t border-border bg-background/30 max-h-[55vh]">
      <div className="flex border-b border-border bg-muted/20">
        <button onClick={() => handleSwitchMode("sync")} className={cn("flex-1 text-[10px] font-semibold py-1.5 transition-colors", mode === "sync" ? "bg-emerald-500/15 text-emerald-300 border-b-2 border-emerald-400" : "text-muted-foreground hover:text-foreground")}>Sync Semua</button>
        <button onClick={() => handleSwitchMode("edit")} className={cn("flex-1 text-[10px] font-semibold py-1.5 transition-colors", mode === "edit" ? "bg-blue-500/15 text-blue-300 border-b-2 border-blue-400" : "text-muted-foreground hover:text-foreground")}>AI Edit Pasien</button>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-2 space-y-2 min-h-[120px]">
        {messages.length === 0 && !parsedPatients && (
          <div className="space-y-2">
            {mode === "sync" ? (
              <>
                <p className="text-[11px] text-muted-foreground text-center pt-1">Paste <b>list lengkap</b> pasien. AI extract + sync semua.</p>
                <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-1.5 text-[10px] text-emerald-300/80 space-y-0.5">
                  <p>• Pasien baru: otomatis dibuat</p>
                  <p>• Pasien lama: di-update / pindah kamar</p>
                  <p>• Hilang dari list: otomatis pulang</p>
                </div>
              </>
            ) : (
              <>
                <p className="text-[11px] text-muted-foreground text-center pt-1">Edit pasien: tambah, update, atau pulangkan.</p>
                <div className="rounded-md border border-blue-500/20 bg-blue-500/5 p-1.5 text-[10px] text-blue-300/80 space-y-0.5">
                  <p>• "Tambah K.07 / Ani / ISPA di SERUNI"</p>
                  <p>• "Budi pindah ke ANGGREK K.02"</p>
                  <p>• "Pulangkan Siti"</p>
                  <p>• Hanya pasien yang disebut yang berubah</p>
                </div>
              </>
            )}
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div className={cn("max-w-[90%] rounded-lg p-1.5 text-[11px]",
              m.role === "user" ? "bg-emerald-500/15 text-foreground" :
              m.content.startsWith("✅") ? "border border-emerald-500/30 bg-emerald-500/5 text-emerald-200" :
              m.content.startsWith("❌") ? "border border-rose-500/30 bg-rose-500/5 text-rose-200" :
              m.content.startsWith("↩️") ? "border border-amber-500/30 bg-amber-500/5 text-amber-200" :
              "bg-muted/40"
            )}>
              <div className="flex items-center gap-1 mb-0.5">
                {m.role === "user" ? <User className="h-2.5 w-2.5 text-emerald-400" /> : <Bot className="h-2.5 w-2.5 text-emerald-400" />}
                <span className="text-[9px] font-semibold">{m.role === "user" ? "Anda" : "AI"}</span>
              </div>
              <p className="whitespace-pre-wrap break-words">{m.content}</p>
            </div>
          </div>
        ))}

        {parsedPatients && (
          <div className={cn("rounded-lg border p-2 text-[11px] space-y-1.5",
            mode === "edit" ? "border-blue-500/30 bg-blue-500/5" : "border-emerald-500/30 bg-emerald-500/5"
          )}>
            <p className={cn("text-[10px] font-semibold uppercase tracking-wider",
              mode === "edit" ? "text-blue-300" : "text-emerald-300"
            )}>{parsedPatients.length} pasien</p>
            <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
              {parsedPatients.map((p, i) => (
                <div key={i} className="flex items-center gap-1 text-[10px] bg-background/50 rounded px-1.5 py-0.5">
                  <span className="font-mono text-muted-foreground w-14 shrink-0">{p.room}{p.bed ? ` ${p.bed}` : ""}</span>
                  <span className="truncate flex-1">{p.name}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-1 pt-0.5">
              <button onClick={handleSync} disabled={syncing} className={cn("flex-1 inline-flex items-center justify-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md text-white transition-colors disabled:opacity-50",
                mode === "edit" ? "bg-blue-500 hover:bg-blue-600" : "bg-emerald-500 hover:bg-emerald-600"
              )}>
                {syncing ? <><Loader2 className="h-3 w-3 animate-spin" />Simpan...</> : <><Check className="h-3 w-3" />Simpan</>}
              </button>
              <button onClick={() => setParsedPatients(null)} className="px-2 py-1 rounded-md bg-muted text-muted-foreground hover:bg-muted/80 text-[11px]">Batal</button>
            </div>
          </div>
        )}

        {lastDischargedIds.length > 0 && !parsedPatients && (
          <button onClick={handleUndo} disabled={undoing} className="w-full flex items-center justify-center gap-1.5 text-[11px] font-medium px-2 py-1.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors disabled:opacity-50">
            {undoing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Undo2 className="h-3 w-3" />}
            Undo {lastDischargedIds.length} pasien pulang
          </button>
        )}

        {loading && (
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin text-emerald-400" />
            <span>Parsing...</span>
          </div>
        )}
      </div>

      <div className="border-t border-border p-1.5 flex gap-1.5">
        <textarea value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleParse(); } }}
          placeholder={mode === "sync" ? "Paste list lengkap pasien..." : "Tambah/Edit/Pulang pasien. Contoh: 'Tambah K.07 / Ani / ISPA di SERUNI' atau 'Pulangkan Budi'"}
          rows={2}
          className={cn("flex-1 min-h-[36px] max-h-20 resize-none rounded-md border bg-background px-2 py-1 text-[11px] focus:outline-none",
            mode === "edit" ? "border-border focus:border-blue-500" : "border-border focus:border-emerald-500"
          )}
        />
        <button onClick={handleParse} disabled={loading || !input.trim()} className={cn("h-auto px-2 rounded-md text-white transition-colors disabled:opacity-50",
          mode === "edit" ? "bg-blue-500 hover:bg-blue-600" : "bg-emerald-500 hover:bg-emerald-600"
        )}>
          <Send className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

function formatTimeAgo(ts: number): string {
  const seconds = Math.floor((Date.now() - ts) / 1000);
  if (seconds < 60) return `${seconds}d`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  return `${hours}j`;
}
