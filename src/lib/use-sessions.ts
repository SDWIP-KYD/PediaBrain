"use client";

import { useState, useCallback, useEffect } from "react";

export type ChatMessage = { role: "user" | "ai"; content: string };

export type Session<T = Record<string, unknown>> = {
  id: string;
  title: string;
  messages: ChatMessage[];
  draft: T | null;
  createdAt: number;
};

type StorageAdapter<T> = {
  loadAll: () => Session<T>[];
  saveAll: (sessions: Session<T>[]) => void;
};

function localStorageAdapter<T>(key: string): StorageAdapter<T> {
  return {
    loadAll: () => {
      try { return JSON.parse(localStorage.getItem(key) || "[]"); } catch { return []; }
    },
    saveAll: (sessions) => {
      localStorage.setItem(key, JSON.stringify(sessions.slice(-30)));
    },
  };
}

function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function autoTitle(messages: ChatMessage[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "Sesi baru";
  const text = firstUser.content.slice(0, 40);
  return text.length < firstUser.content.length ? text + "..." : text;
}

export function useSessions<T = Record<string, unknown>>(storageKey: string) {
  const [sessions, setSessions] = useState<Session<T>[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [inited, setInited] = useState(false);
  const adapter = localStorageAdapter<T>(storageKey);

  useEffect(() => {
    const loaded = adapter.loadAll();
    setSessions(loaded);
    if (loaded.length > 0) setActiveId(loaded[0].id);
    setInited(true);
  }, []);

  useEffect(() => {
    if (inited) adapter.saveAll(sessions);
  }, [sessions, inited]);

  const activeSession = sessions.find((s) => s.id === activeId) ?? null;

  const createSession = useCallback(() => {
    const id = generateId();
    const newSession: Session<T> = { id, title: "Sesi baru", messages: [], draft: null, createdAt: Date.now() };
    setSessions((prev) => [newSession, ...prev]);
    setActiveId(id);
    return id;
  }, []);

  const deleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const next = prev.filter((s) => s.id !== id);
      if (activeId === id) {
        setActiveId(next.length > 0 ? next[0].id : null);
      }
      return next;
    });
  }, [activeId]);

  const updateMessages = useCallback((id: string, msgs: ChatMessage[]) => {
    setSessions((prev) => prev.map((s) => {
      if (s.id !== id) return s;
      const updated = { ...s, messages: msgs };
      if (s.title === "Sesi baru" || s.title === "") {
        updated.title = autoTitle(msgs);
      }
      return updated;
    }));
  }, []);

  const updateDraft = useCallback((id: string, draft: T | null) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, draft } : s));
  }, []);

  const renameSession = useCallback((id: string, title: string) => {
    setSessions((prev) => prev.map((s) => s.id === id ? { ...s, title } : s));
  }, []);

  return {
    sessions,
    activeSession,
    activeId,
    setActiveId,
    createSession,
    deleteSession,
    updateMessages,
    updateDraft,
    renameSession,
  };
}
