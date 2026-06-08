import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { notes, followUps, stickyNotes } from "@/lib/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CalendarCheck,
  Plus,
  Clock,
  AlertCircle,
  StickyNote,
} from "lucide-react";
import { DashboardCalendar, DashboardTodayFollowUpActions } from "./dashboard-calendar";
import { StickyNotesSection } from "./sticky-notes";
import { CreateFollowUpDialogWrapper } from "./follow-ups/create-dialog-wrapper";
import { DashboardNotesClient, DashboardPinned } from "./dashboard-notes-client";
import { AIChatbox } from "@/components/ai-chatbox";

export const dynamic = "force-dynamic";

async function isLoggedIn() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const token = (await cookies()).get("session")?.value;
  return token ? verifySessionToken(token, secret).valid : false;
}

export default async function DashboardPage() {
  if (!(await isLoggedIn())) {
    redirect("/notes");
  }

  let todayFollowUps: (typeof followUps.$inferSelect)[] = [];
  let allFollowUps: (typeof followUps.$inferSelect)[] = [];
  let pinnedNotes: (typeof notes.$inferSelect)[] = [];
  let recentNotes: (typeof notes.$inferSelect)[] = [];
  let latestSticky: { id: string; content: string; createdAt: Date; updatedAt: Date } | null = null;
  let dbError: string | null = null;

  try {
    const today = new Date().toISOString().split("T")[0];

    const [todayFu, allFu, pinned, recent, stickyArr] = await Promise.all([
      db
        .select()
        .from(followUps)
        .where(and(eq(followUps.status, "PENDING"), eq(followUps.dueDate, today)))
        .orderBy(followUps.dueDate),
      db
        .select()
        .from(followUps)
        .where(eq(followUps.status, "PENDING"))
        .orderBy(followUps.dueDate),
      db
        .select()
        .from(notes)
        .where(eq(notes.isPinned, true))
        .orderBy(desc(notes.updatedAt)),
      db.select().from(notes).orderBy(desc(notes.updatedAt)).limit(12),
      db.select().from(stickyNotes).orderBy(desc(stickyNotes.updatedAt)).limit(1),
    ]);

    todayFollowUps = todayFu;
    allFollowUps = allFu;
    pinnedNotes = pinned;
    recentNotes = recent;
    latestSticky = stickyArr[0] ?? null;
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Gagal memuat data dari database";
  }

  if (dbError) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <AlertCircle className="h-5 w-5 text-destructive" />
        <div>
          <p className="font-medium text-destructive">Database tidak tersedia</p>
          <p className="text-sm text-muted-foreground">{dbError}</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Pastikan PostgreSQL berjalan dan database &quot;pediabrain&quot; sudah dibuat.
          </p>
        </div>
      </div>
    );
  }

  const serializedFollowUps = allFollowUps.map((f) => ({
    id: f.id,
    title: f.title,
    content: f.content,
    dueDate: f.dueDate,
    status: f.status,
    recurrence: f.recurrence,
  }));

  const serializedSticky = latestSticky
    ? { id: latestSticky.id, content: latestSticky.content }
    : null;

  const serializedPinned = pinnedNotes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    tags: n.tags as string[],
    isPinned: n.isPinned,
    updatedAt: n.updatedAt.toISOString(),
  }));

  const serializedRecent = recentNotes.map((n) => ({
    id: n.id,
    title: n.title,
    content: n.content,
    tags: n.tags as string[],
    isPinned: n.isPinned,
    updatedAt: n.updatedAt.toISOString(),
  }));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Ringkasan aktivitas medis hari ini</p>
      </div>

      <DashboardPinned pinned={serializedPinned} />

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <StickyNote className="h-3.5 w-3.5 text-neon" />
            Sticky Notes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <StickyNotesSection note={serializedSticky} />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="overflow-hidden">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
                <CalendarCheck className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">Kalender Follow-up</span>
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href="/follow-ups"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Lihat semua →
                </a>
                <CreateFollowUpDialogWrapper iconOnly />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <DashboardCalendar items={serializedFollowUps} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2 min-w-0">
                <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="truncate">Follow-up Hari Ini</span>
              </CardTitle>
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href="/follow-ups"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Lihat semua →
                </a>
                <CreateFollowUpDialogWrapper iconOnly />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {todayFollowUps.length === 0 ? (
              <div className="text-center py-6">
                <CalendarCheck className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Tidak ada follow-up hari ini
                </p>
                <div className="mt-3 flex justify-center">
                  <CreateFollowUpDialogWrapper />
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {todayFollowUps.map((fu) => {
                  const item = {
                    id: fu.id,
                    title: fu.title,
                    content: fu.content,
                    dueDate: fu.dueDate,
                    status: fu.status,
                    recurrence: fu.recurrence ?? "none",
                  };
                  return (
                    <div
                      key={fu.id}
                      className="rounded-lg border bg-muted/30 overflow-hidden"
                    >
                      <div className="flex items-start justify-between gap-2 p-2.5">
                        <p className="font-medium text-sm flex-1 min-w-0">{fu.title}</p>
                        <DashboardTodayFollowUpActions item={item} />
                      </div>
                      {fu.content && (
                        <div className="px-2.5 pb-2.5 max-h-[80px] overflow-y-auto border-t border-border/30">
                          <p className="text-xs text-muted-foreground whitespace-pre-wrap break-words leading-relaxed pt-1.5">
                            {fu.content}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <DashboardNotesClient recent={serializedRecent} />

      <AIChatbox />
    </div>
  );
}
