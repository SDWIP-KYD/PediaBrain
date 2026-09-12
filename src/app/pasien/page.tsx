import { db } from "@/lib/db";
import { patients, patientVisits } from "@/lib/db/schema";
import { and, desc, ilike, isNotNull, or, sql } from "drizzle-orm";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users, Search, Calendar, User, LayoutGrid, Activity,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

const PAGE_SIZE_DEFAULT = 25;

type MyPatient = {
  id: string;
  name: string;
  medicalRecordNo: string | null;
  birthDate: string | null;
  sex: string | null;
  parentName: string | null;
  phone: string | null;
  room: string | null;
  bed: string | null;
  dpjp: string | null;
  visitCount: number;
  lastVisit: string | null;
  createdAt: string;
  updatedAt: string;
};

export default async function PasienPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; q?: string }>;
}) {
  const { page, size, q } = await searchParams;
  const pageSize = Math.min(100, Math.max(10, Number(size) || PAGE_SIZE_DEFAULT));
  const pageNum = Math.max(1, Number(page) || 1);
  const offset = (pageNum - 1) * pageSize;
  const searchQuery = (q ?? "").trim();

  let list: MyPatient[] = [];
  let total = 0;
  let dbError: string | null = null;

  try {
    const whereClause = searchQuery
      ? or(
          ilike(patients.name, `%${searchQuery}%`),
          ilike(patients.parentName, `%${searchQuery}%`),
          ilike(patients.medicalRecordNo, `%${searchQuery}%`)
        )
      : undefined;

    // Only "My Patients" — those pulled from SIMRS via Lab Lookup (have medical_record_no)
    const conditions = [isNotNull(patients.medicalRecordNo)];
    if (whereClause) conditions.push(whereClause);
    const baseWhere = and(...conditions);

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(patients)
      .where(baseWhere);
    total = Number(countRow?.count ?? 0);

    const rows = await db
      .select({
        id: patients.id,
        name: patients.name,
        medicalRecordNo: patients.medicalRecordNo,
        birthDate: patients.birthDate,
        sex: patients.sex,
        parentName: patients.parentName,
        phone: patients.phone,
        room: patients.room,
        bed: patients.bed,
        dpjp: patients.dpjp,
        createdAt: patients.createdAt,
        updatedAt: patients.updatedAt,
        visitCount: sql<number>`(SELECT COUNT(*)::int FROM ${patientVisits} WHERE ${patientVisits.patientId} = ${patients.id})`,
        lastVisit: sql<string | null>`(SELECT MAX(${patientVisits.visitDate}) FROM ${patientVisits} WHERE ${patientVisits.patientId} = ${patients.id})`,
      })
      .from(patients)
      .where(baseWhere)
      .orderBy(desc(patients.updatedAt))
      .limit(pageSize)
      .offset(offset);

    list = rows.map((r) => ({
      id: r.id,
      name: r.name,
      medicalRecordNo: r.medicalRecordNo,
      birthDate: r.birthDate ?? null,
      sex: r.sex,
      parentName: r.parentName,
      phone: r.phone,
      room: r.room,
      bed: r.bed,
      dpjp: r.dpjp,
      visitCount: Number(r.visitCount ?? 0),
      lastVisit: r.lastVisit,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Gagal memuat data pasien";
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const endItem = Math.min(pageNum * pageSize, total);

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
            <Users className="h-5 w-5 text-neon" />
            My Patients
          </h1>
          <p className="text-sm text-muted-foreground">
            Pasien yang pernah Anda tambahkan dari Lab Lookup
            {searchQuery && (
              <span className="ml-2 text-neon">· &ldquo;{searchQuery}&rdquo;</span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pasien/kanban"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-sm"
          >
            <Activity className="h-3.5 w-3.5" />
            Board
          </Link>
          <Link
            href="/pasien/list"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-sm"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Semua Pasien
          </Link>
        </div>
      </div>

      {/* Search */}
      <form className="relative max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          name="q"
          defaultValue={searchQuery}
          placeholder="Cari nama pasien, RM, atau orang tua..."
          className="w-full pl-8 h-9 rounded-md border border-border bg-background text-sm focus:border-neon focus:outline-none"
        />
      </form>

      {dbError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{dbError}</p>
        </div>
      ) : list.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <User className="mx-auto h-10 w-10 text-muted-foreground/30" />
              <p className="mt-3 text-sm text-muted-foreground">
                {searchQuery
                  ? "Tidak ada pasien yang cocok dengan pencarian."
                  : "Belum ada pasien di My Patients."}
              </p>
              {!searchQuery && (
                <p className="text-xs text-muted-foreground mt-2">
                  Cari pasien dari{" "}
                  <Link href="/lab-lookup" className="text-neon hover:underline">
                    Lab Lookup
                  </Link>{" "}
                  lalu klik &ldquo;Tambah&rdquo; untuk menambahkannya ke sini.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="space-y-2">
            {list.map((p) => {
              const age = p.birthDate ? calculateAge(p.birthDate) : null;
              return (
                <Link
                  key={p.id}
                  href={`/pasien/${p.id}`}
                  className="block rounded-lg border border-border hover:border-neon/30 hover:bg-accent/30 p-3 transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm">{p.name}</h3>
                        {p.sex && (
                          <Badge variant="outline" className="text-xs">
                            {p.sex === "L" ? "♂" : "♀"} {p.sex}
                          </Badge>
                        )}
                        {age && (
                          <span className="text-xs text-muted-foreground">{age}</span>
                        )}
                        {p.medicalRecordNo && (
                          <Badge
                            variant="secondary"
                            className="text-xs font-mono"
                          >
                            RM: {p.medicalRecordNo}
                          </Badge>
                        )}
                        {p.room && (
                          <Badge
                            variant="outline"
                            className="text-xs border-blue-500/40 text-blue-300"
                          >
                            {p.room} {p.bed || ""}
                          </Badge>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-muted-foreground">
                        {p.parentName && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            Ortu: {p.parentName}
                          </span>
                        )}
                        {p.phone && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            HP: {p.phone}
                          </span>
                        )}
                        {p.dpjp && (
                          <span className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            DPJP: {p.dpjp}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <Badge
                        variant={p.visitCount > 0 ? "default" : "outline"}
                        className="text-xs"
                      >
                        {p.visitCount} visit
                      </Badge>
                      {p.lastVisit && (
                        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 justify-end">
                          <Calendar className="h-3 w-3" />
                          {p.lastVisit}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          {total > 0 && (
            <div className="flex items-center justify-between pt-2 text-xs text-muted-foreground">
              <span>
                {startItem}–{endItem} dari {total} pasien
                {searchQuery ? ` untuk &ldquo;${searchQuery}&rdquo;` : ""}
              </span>
              {totalPages > 1 && (
                <span className="flex items-center gap-1">
                  Halaman {pageNum} / {totalPages}
                </span>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months =
    (now.getFullYear() - birth.getFullYear()) * 12 +
    (now.getMonth() - birth.getMonth());
  if (months < 1)
    return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
  if (months < 24) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} tahun`;
}
