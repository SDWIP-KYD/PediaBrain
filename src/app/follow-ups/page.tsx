import { db } from "@/lib/db";
import { followUps } from "@/lib/db/schema";
import { asc } from "drizzle-orm";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LayoutGrid, CalendarDays } from "lucide-react";
import { KanbanColumn } from "./kanban-column";
import { CalendarView } from "./calendar-view";
import { CreateFollowUpDialogWrapper } from "./create-dialog-wrapper";

export default async function FollowUpsPage() {
  let allItems: {
    id: string;
    title: string;
    content: string | null;
    dueDate: string;
    status: string;
    recurrence: string;
  }[] = [];
  let dbError: string | null = null;

  try {
    const rows = await db.select().from(followUps).orderBy(asc(followUps.dueDate));
    allItems = rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      dueDate: r.dueDate,
      status: r.status,
      recurrence: r.recurrence,
    }));
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Gagal memuat data follow-up";
  }

  const pending = allItems.filter((i) => i.status === "PENDING");
  const completed = allItems.filter((i) => i.status === "COMPLETED");
  const cancelled = allItems.filter((i) => i.status === "CANCELLED");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Follow-up Tracker</h1>
          <p className="text-sm text-muted-foreground">
            Kelola jadwal tindak lanjut pasien
          </p>
        </div>
        <CreateFollowUpDialogWrapper />
      </div>

      {dbError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{dbError}</p>
        </div>
      ) : (
        <Tabs defaultValue="kanban">
          <TabsList>
            <TabsTrigger value="kanban">
              <LayoutGrid className="h-4 w-4" />
              Kanban
            </TabsTrigger>
            <TabsTrigger value="calendar">
              <CalendarDays className="h-4 w-4" />
              Kalender
            </TabsTrigger>
          </TabsList>
          <TabsContent value="kanban">
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mt-4">
              <KanbanColumn title="Pending" status="PENDING" items={pending} />
              <KanbanColumn title="Selesai" status="COMPLETED" items={completed} />
              <KanbanColumn title="Dibatalkan" status="CANCELLED" items={cancelled} />
            </div>
          </TabsContent>
          <TabsContent value="calendar">
            <div className="mt-4">
              <CalendarView items={pending} />
            </div>
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}
