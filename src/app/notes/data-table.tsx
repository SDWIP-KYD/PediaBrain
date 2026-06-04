"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useReactTable, getCoreRowModel, getFilteredRowModel, getSortedRowModel, flexRender, type ColumnDef, type SortingState, type ColumnFiltersState } from "@tanstack/react-table";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Search, Pencil, Trash2, Plus, X, Pin, Download, ChevronLeft, ChevronRight } from "lucide-react";
import { deleteNote, togglePinNote } from "@/app/actions";
import { NoteDialog } from "./note-dialog";
import { MarkdownContent } from "@/components/markdown-content";

interface NoteRow {
  id: string;
  title: string;
  content: string;
  tags: string[];
  isPinned: boolean;
  updatedAt: string;
}

function NoteViewDialog({
  note,
  open,
  onOpenChange,
  onEdit,
}: {
  note: NoteRow;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="max-w-3xl w-[95vw] max-h-[85vh] p-0 gap-0 flex flex-col"
      >
          <div className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4 border-b border-border bg-card/95 backdrop-blur">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {note.isPinned && <Pin className="h-3.5 w-3.5 text-neon shrink-0" />}
              <DialogTitle className="font-semibold text-base truncate">{note.title}</DialogTitle>
              <div className="hidden sm:flex gap-1 shrink-0">
                {(note.tags as string[]).slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-[10px]">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  const blob = new Blob([`# ${note.title}\n\n${note.content}`], { type: "text/markdown" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `${note.title.replace(/[^a-zA-Z0-9]/g, "_")}.md`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}
              >
                <Download className="h-3.5 w-3.5" />
              </Button>
              <Button size="sm" variant="outline" onClick={onEdit}>
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <DialogClose render={<Button size="sm" variant="ghost"><X className="h-4 w-4" /></Button>} />
            </div>
          </div>
          <div className="p-4 overflow-y-auto flex-1 min-h-0">
            <MarkdownContent content={note.content} />
          </div>
          <div className="flex justify-center p-2 border-t border-border bg-muted/20">
            <DialogClose render={<Button size="sm" variant="secondary" className="text-xs"><X className="h-3.5 w-3.5 mr-1" />Tutup</Button>} />
          </div>
      </DialogContent>
    </Dialog>
  );
}

const columns: ColumnDef<NoteRow>[] = [
  {
    accessorKey: "title",
    header: "Judul",
    cell: ({ row }) => {
      const isPinned = row.original.isPinned;
      return (
        <span className="font-medium flex items-center gap-1.5">
          {isPinned && <Pin className="h-3 w-3 text-neon shrink-0" />}
          {row.getValue("title")}
        </span>
      );
    },
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => {
      const tags = row.getValue("tags") as string[];
      return (
        <div className="hidden sm:flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              {tag}
            </Badge>
          ))}
          {tags.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{tags.length - 3}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    header: "Diupdate",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      return (
        <span className="hidden sm:inline text-muted-foreground text-xs">
          {date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row, table }) => {
      const note = row.original;
      return (
        <div className="flex items-center gap-0.5">
          <Button
            variant="ghost"
            size="icon"
            className={note.isPinned ? "text-neon" : ""}
            onClick={async (e) => {
              e.stopPropagation();
              await togglePinNote(note.id);
            }}
          >
            <Pin className={`h-3.5 w-3.5 ${note.isPinned ? "fill-neon" : ""}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              (table.options.meta as { onEdit: (note: NoteRow) => void })?.onEdit(note);
            }}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={async (e) => {
              e.stopPropagation();
              if (confirm(`Hapus catatan "${note.title}"?`)) {
                await deleteNote(note.id);
              }
            }}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      );
    },
  },
];

export function DataTable({
  data,
  total,
  page,
  pageSize,
  totalPages,
  initialOpenId,
  searchQuery,
}: {
  data: NoteRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  initialOpenId?: string | null;
  searchQuery?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState(searchQuery ?? "");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<NoteRow | null>(null);
  const [viewingNote, setViewingNote] = useState<NoteRow | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);

  useEffect(() => {
    if (initialOpenId && data.length > 0) {
      const note = data.find((n) => n.id === initialOpenId);
      if (note) {
        setViewingNote(note);
        setViewDialogOpen(true);
      }
    }
  }, [initialOpenId, data]);

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    globalFilterFn: (row, _columnId, filterValue: string) => {
      const search = filterValue.toLowerCase();
      const title = (row.getValue("title") as string).toLowerCase();
      const tags = (row.getValue("tags") as string[]) || [];
      const content = row.original.content.toLowerCase();
      return title.includes(search) || tags.some((t) => t.toLowerCase().includes(search)) || content.includes(search);
    },
    manualPagination: true,
    pageCount: totalPages,
    meta: {
      onEdit: (note: NoteRow) => {
        setEditingNote(note);
        setDialogOpen(true);
      },
    },
  });

  function navigate(newPage?: number, newSize?: number, newSearch?: string) {
    const params = new URLSearchParams();
    if (newPage && newPage > 1) params.set("page", String(newPage));
    const effectiveSize = newSize ?? pageSize;
    if (effectiveSize !== 25) params.set("size", String(effectiveSize));
    const effectiveSearch = newSearch !== undefined ? newSearch : globalFilter;
    if (effectiveSearch) params.set("q", effectiveSearch);
    if (initialOpenId) params.set("open", initialOpenId);
    const qs = params.toString();
    startTransition(() => {
      router.push(qs ? `${pathname}?${qs}` : pathname);
    });
  }

  function handleRowClick(note: NoteRow) {
    setViewingNote(note);
    setViewDialogOpen(true);
  }

  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari catatan..."
            value={globalFilter}
            onChange={(e) => setGlobalFilter(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") navigate(1, undefined, globalFilter);
            }}
            className="pl-8"
          />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => navigate(1, undefined, globalFilter)}
            variant="outline"
            className="flex-1 sm:flex-none"
          >
            <Search className="h-4 w-4 mr-1" />
            Cari
          </Button>
          <Button
            onClick={() => {
              setEditingNote(null);
              setDialogOpen(true);
            }}
            className="flex-1 sm:flex-none"
          >
            <Plus className="h-4 w-4 mr-1" />
            <span className="sm:hidden">Baru</span>
            <span className="hidden sm:inline">Catatan Baru</span>
          </Button>
        </div>
      </div>

      {viewingNote && (
        <NoteViewDialog
          note={viewingNote}
          open={viewDialogOpen}
          onOpenChange={(o) => {
            setViewDialogOpen(o);
            if (!o) {
              setViewingNote(null);
              if (initialOpenId) {
                const params = new URLSearchParams();
                if (globalFilter) params.set("q", globalFilter);
                if (pageSize !== 25) params.set("size", String(pageSize));
                if (page > 1) params.set("page", String(page));
                const qs = params.toString();
                startTransition(() => {
                  router.push(qs ? `${pathname}?${qs}` : pathname);
                });
              }
            }
          }}
          onEdit={() => {
            setEditingNote(viewingNote);
            setDialogOpen(true);
            setViewDialogOpen(false);
          }}
        />
      )}

      <div className="rounded-md border overflow-x-auto">
        <Table className="min-w-[400px]">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {searchQuery ? "Tidak ada catatan yang cocok" : "Belum ada catatan"}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  onClick={() => handleRowClick(row.original)}
                  className="cursor-pointer"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm">
        <div className="flex items-center gap-3 text-muted-foreground">
          <span className="text-xs">
            {total === 0 ? "0" : `${startItem}–${endItem}`} dari {total} catatan{searchQuery ? ` untuk "${searchQuery}"` : ""}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-muted-foreground">Per halaman:</span>
            <select
              value={pageSize}
              onChange={(e) => navigate(1, Number(e.target.value))}
              className="h-7 rounded-md border border-border bg-background px-2 text-xs font-mono focus:border-neon focus:outline-none"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => navigate(1)} disabled={page <= 1} title="Halaman pertama">«</Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(page - 1)} disabled={page <= 1} title="Sebelumnya">
            <ChevronLeft className="h-3.5 w-3.5" />
          </Button>
          <span className="text-xs px-2 font-mono">{page} / {totalPages}</span>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => navigate(page + 1)} disabled={page >= totalPages} title="Selanjutnya">
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate(totalPages)} disabled={page >= totalPages} title="Halaman terakhir">»</Button>
        </div>
      </div>

      <NoteDialog open={dialogOpen} onOpenChange={setDialogOpen} note={editingNote} />
    </div>
  );
}
