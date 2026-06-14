import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";
import { notes } from "@/lib/db/schema";
import { desc, eq, or, ilike, sql } from "drizzle-orm";
import { DataTable } from "./data-table";
import { toArray } from "@/lib/utils";

const PAGE_SIZE_DEFAULT = 25;

export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ open?: string; page?: string; size?: string; q?: string }>;
}) {
  const { open, page, size, q } = await searchParams;

  const pageSize = Math.min(100, Math.max(10, Number(size) || PAGE_SIZE_DEFAULT));
  const pageNum = Math.max(1, Number(page) || 1);
  const offset = (pageNum - 1) * pageSize;
  const searchQuery = (q ?? "").trim();
  const secret = process.env.SESSION_SECRET;
  const token = (await cookies()).get("session")?.value;
  const canEdit = Boolean(secret && token && verifySessionToken(token, secret).valid);

  let data: {
    id: string;
    title: string;
    content: string;
    tags: string[];
    isPinned: boolean;
    updatedAt: string;
  }[] = [];
  let total = 0;
  let dbError: string | null = null;

  try {
    const whereClause = searchQuery
      ? or(
          ilike(notes.title, `%${searchQuery}%`),
          ilike(notes.content, `%${searchQuery}%`),
          sql`${notes.tags}::text ILIKE ${`%${searchQuery}%`}`
        )
      : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(notes)
      .where(whereClause);
    total = Number(countRow?.count ?? 0);

    const baseQuery = db
      .select()
      .from(notes)
      .orderBy(sql`is_pinned DESC, updated_at DESC`)
      .limit(pageSize)
      .offset(offset);

    const rows = searchQuery
      ? await baseQuery.where(whereClause)
      : await baseQuery;

    data = rows.map((r) => ({
      id: r.id,
      title: r.title,
      content: r.content,
      tags: toArray(r.tags),
      isPinned: r.isPinned,
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    dbError =
      error instanceof Error ? error.message : "Gagal memuat data catatan";
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="space-y-4 sm:space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">Notes</h1>
        <p className="text-sm text-muted-foreground">
          Kelola catatan medis dan knowledge base
          {searchQuery && (
            <span className="ml-2 text-neon">· Hasil pencarian: "{searchQuery}"</span>
          )}
        </p>
      </div>
      {dbError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{dbError}</p>
        </div>
      ) : (
        <DataTable
          data={data}
          total={total}
          page={pageNum}
          pageSize={pageSize}
          totalPages={totalPages}
          initialOpenId={open ?? null}
          searchQuery={searchQuery}
          canEdit={canEdit}
        />
      )}
    </div>
  );
}
