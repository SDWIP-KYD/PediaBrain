"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, FileText, CalendarCheck, Pin, Users, User } from "lucide-react";
import { globalSearch } from "@/app/actions";

interface SearchResult {
  notes: { id: string; title: string; tags: string[]; content: string; isPinned: boolean }[];
  followUps: { id: string; title: string; content: string | null; dueDate: string; status: string }[];
  patients: { id: string; name: string; medicalRecordNo: string | null; birthDate: string | null; sex: string | null; diagnosis: string | null }[];
}

function highlightMatch(text: string, query: string): { text: string; highlight: boolean }[] {
  if (!query.trim()) return [{ text, highlight: false }];
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
  const parts = text.split(regex);
  return parts.map((part) => ({
    text: part,
    highlight: regex.test(part),
  }));
}

function getSnippet(content: string, query: string, radius = 40): string {
  if (!query.trim() || !content) return content.slice(0, 120);
  const idx = content.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return content.slice(0, 120);
  const start = Math.max(0, idx - radius);
  const end = Math.min(content.length, idx + query.length + radius);
  let snippet = content.slice(start, end);
  if (start > 0) snippet = "..." + snippet;
  if (end < content.length) snippet = snippet + "...";
  return snippet;
}

export function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ notes: [], followUps: [], patients: [] });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults({ notes: [], followUps: [], patients: [] }); return; }
    setLoading(true);
    const data = await globalSearch(q);
    setResults(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => doSearch(query), 200);
    return () => clearTimeout(timer);
  }, [query, doSearch]);

  function handleSelect(path: string) {
    setOpen(false);
    setQuery("");
    setResults({ notes: [], followUps: [], patients: [] });
    router.push(path);
  }

  const totalResults = results.notes.length + results.followUps.length + results.patients.length;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border bg-card/50 text-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-all"
      >
        <Search className="h-4 w-4" />
        <span className="hidden sm:inline">Cari...</span>
        <kbd className="hidden sm:inline text-xs bg-muted px-1.5 py-0.5 rounded">⌘K</kbd>
      </button>

      <Dialog open={open} onOpenChange={(v) => { if (!v) { setQuery(""); setResults({ notes: [], followUps: [], patients: [] }); } setOpen(v); }}>
        <DialogContent className="sm:max-w-lg max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="sr-only">Global Search</DialogTitle>
          </DialogHeader>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari catatan, pasien, follow-up..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9"
              autoFocus
            />
          </div>
          <div className="overflow-y-auto flex-1 min-h-0 space-y-3 mt-2">
            {loading && <p className="text-xs text-muted-foreground text-center py-4">Mencari...</p>}
            {!loading && query && totalResults === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">Tidak ditemukan hasil untuk &quot;{query}&quot;</p>
            )}

            {/* Patients */}
            {!loading && results.patients.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Pasien</p>
                <div className="space-y-0.5">
                  {results.patients.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelect(`/pasien/${p.id}`)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-accent transition-colors"
                    >
                      <Users className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        <HighlightedText text={p.name} query={query} />
                      </span>
                      {p.medicalRecordNo && (
                        <span className="text-muted-foreground text-xs">
                          RM: <HighlightedText text={p.medicalRecordNo} query={query} />
                        </span>
                      )}
                      {p.diagnosis && (
                        <span className="text-xs text-muted-foreground/70 truncate max-w-[150px]">
                          <HighlightedText text={p.diagnosis} query={query} />
                        </span>
                      )}
                      {p.sex && <Badge variant="outline" className="text-xs shrink-0">{p.sex === "L" ? "♂" : "♀"}</Badge>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Notes with content snippets */}
            {!loading && results.notes.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Catatan</p>
                <div className="space-y-0.5">
                  {results.notes.map((n) => {
                    const snippet = getSnippet(n.content, query);
                    return (
                      <button
                        key={n.id}
                        onClick={() => handleSelect(`/notes?open=${n.id}`)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {n.isPinned && <Pin className="h-3 w-3 text-neon shrink-0" />}
                          <span className="font-medium truncate flex-1">
                            <HighlightedText text={n.title} query={query} />
                          </span>
                          <div className="flex gap-0.5 shrink-0">
                            {n.tags.slice(0, 2).map((t) => (
                              <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>
                            ))}
                          </div>
                        </div>
                        {snippet && (
                          <p className="text-xs text-muted-foreground mt-0.5 pl-5 line-clamp-2">
                            <HighlightedText text={snippet} query={query} />
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Follow-ups */}
            {!loading && results.followUps.length > 0 && (
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 px-1">Follow-up</p>
                <div className="space-y-0.5">
                  {results.followUps.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => handleSelect("/follow-ups")}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-left hover:bg-accent transition-colors"
                    >
                      <CalendarCheck className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      <span className="font-medium truncate">
                        <HighlightedText text={f.title} query={query} />
                      </span>
                      <span className="text-muted-foreground text-xs truncate flex-1">
                        <HighlightedText text={f.content || ""} query={query} />
                      </span>
                      <Badge variant="outline" className="text-xs shrink-0">{f.status}</Badge>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function HighlightedText({ text, query }: { text: string; query: string }) {
  if (!query.trim()) return <>{text}</>;
  const parts = highlightMatch(text, query);
  return (
    <>
      {parts.map((p, i) =>
        p.highlight ? (
          <mark key={i} className="bg-yellow-500/30 text-yellow-200 rounded px-0.5">{p.text}</mark>
        ) : (
          <span key={i}>{p.text}</span>
        )
      )}
    </>
  );
}
