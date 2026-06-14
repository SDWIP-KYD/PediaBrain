import { db } from "@/lib/db";
import { patients, patientVisits } from "@/lib/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserPlus, Users, Calendar, Phone, User, LayoutGrid, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { PatientSearch } from "../patient-search";
import { CreatePatientDialogWrapper } from "../create-dialog-wrapper";
import { PasienAIInput } from "../pasien-ai-input";

const PAGE_SIZE_DEFAULT = 25;

export default async function PasienListPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string; q?: string }>;
}) {
  const { page, size, q } = await searchParams;
  const pageSize = Math.min(100, Math.max(10, Number(size) || PAGE_SIZE_DEFAULT));
  const pageNum = Math.max(1, Number(page) || 1);
  const offset = (pageNum - 1) * pageSize;
  const searchQuery = (q ?? "").trim();

  let list: {
    id: string;
    name: string;
    birthDate: string | null;
    sex: string | null;
    parentName: string | null;
    phone: string | null;
    medicalRecordNo: string | null;
    visitCount: number;
    lastVisit: string | null;
    createdAt: string;
  }[] = [];
  let total = 0;
  let dbError: string | null = null;

  try {
    const whereClause = searchQuery
      ? or(
          ilike(patients.name, `%${searchQuery}%`),
          ilike(patients.parentName, `%${searchQuery}%`),
          ilike(patients.medicalRecordNo, `%${searchQuery}%`),
          ilike(patients.phone, `%${searchQuery}%`)
        )
      : undefined;

    const [countRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(patients)
      .where(whereClause);
    total = Number(countRow?.count ?? 0);

    const rows = await db
      .select({
        id: patients.id,
        name: patients.name,
        birthDate: patients.birthDate,
        sex: patients.sex,
        parentName: patients.parentName,
        phone: patients.phone,
        medicalRecordNo: patients.medicalRecordNo,
        createdAt: patients.createdAt,
        visitCount: sql<number>`(SELECT COUNT(*)::int FROM ${patientVisits} WHERE ${patientVisits.patientId} = ${patients.id})`,
        lastVisit: sql<string | null>`(SELECT MAX(${patientVisits.visitDate}) FROM ${patientVisits} WHERE ${patientVisits.patientId} = ${patients.id})`,
      })
      .from(patients)
      .where(whereClause)
      .orderBy(desc(patients.updatedAt))
      .limit(pageSize)
      .offset(offset);

    list = rows.map((r) => ({
      id: r.id,
      name: r.name,
      birthDate: r.birthDate,
      sex: r.sex,
      parentName: r.parentName,
      phone: r.phone,
      medicalRecordNo: r.medicalRecordNo,
      visitCount: Number(r.visitCount ?? 0),
      lastVisit: r.lastVisit,
      createdAt: r.createdAt.toISOString(),
    }));
  } catch (error) {
    dbError = error instanceof Error ? error.message : "Gagal memuat data pasien";
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startItem = total === 0 ? 0 : (pageNum - 1) * pageSize + 1;
  const endItem = Math.min(pageNum * pageSize, total);

  function buildHref(p?: number) {
    const params = new URLSearchParams();
    if (p && p > 1) params.set("page", String(p));
    if (pageSize !== 25) params.set("size", String(pageSize));
    if (searchQuery) params.set("q", searchQuery);
    const qs = params.toString();
    return qs ? `/pasien/list?${qs}` : "/pasien/list";
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link
            href="/pasien"
            className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl flex items-center gap-2">
              <Users className="h-5 w-5 text-neon" />
              Semua Pasien
            </h1>
            <p className="text-sm text-muted-foreground">
              Database lengkap semua pasien dan riwayat kunjungan
              {searchQuery && <span className="ml-2 text-neon">· &ldquo;{searchQuery}&rdquo;</span>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/pasien"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border hover:bg-accent text-sm"
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Board
          </Link>
          <CreatePatientDialogWrapper />
        </div>
      </div>

      {dbError ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          <p className="text-sm text-destructive">{dbError}</p>
        </div>
      ) : (
        <Card>
          <CardHeader className="pb-3">
            <PatientSearch initialQuery={searchQuery} />
          </CardHeader>
          <CardContent className="space-y-3">
            {list.length === 0 ? (
              <div className="text-center py-12">
                <UserPlus className="mx-auto h-10 w-10 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  {searchQuery ? "Tidak ada pasien yang cocok" : "Belum ada pasien"}
                </p>
                {!searchQuery && <CreatePatientDialogWrapper />}
              </div>
            ) : (
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
                              <Badge variant="secondary" className="text-xs font-mono">
                                RM: {p.medicalRecordNo}
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
                                <Phone className="h-3 w-3" />
                                {p.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge variant={p.visitCount > 0 ? "default" : "outline"} className="text-xs">
                            {p.visitCount} visit
                          </Badge>
                          {p.lastVisit && (
                            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
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
            )}

            {total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 text-xs text-muted-foreground">
                <span>
                  {startItem}–{endItem} dari {total} pasien{searchQuery ? ` untuk "${searchQuery}"` : ""}
                </span>
                <div className="flex items-center gap-1">
                  <Link
                    href={buildHref(1)}
                    className={`px-2 py-1 rounded border ${pageNum <= 1 ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    «
                  </Link>
                  <Link
                    href={buildHref(pageNum - 1)}
                    className={`px-2 py-1 rounded border ${pageNum <= 1 ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    ‹
                  </Link>
                  <span className="px-2 font-mono">
                    {pageNum} / {totalPages}
                  </span>
                  <Link
                    href={buildHref(pageNum + 1)}
                    className={`px-2 py-1 rounded border ${pageNum >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    ›
                  </Link>
                  <Link
                    href={buildHref(totalPages)}
                    className={`px-2 py-1 rounded border ${pageNum >= totalPages ? "pointer-events-none opacity-50" : "hover:bg-accent"}`}
                  >
                    »
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      <PasienAIInput />
    </div>
  );
}

function calculateAge(birthDate: string): string {
  const birth = new Date(birthDate);
  const now = new Date();
  const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
  if (months < 1) return `${Math.max(0, Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24)))} hari`;
  if (months < 24) return `${months} bulan`;
  const years = Math.floor(months / 12);
  const remMonths = months % 12;
  return remMonths > 0 ? `${years} thn ${remMonths} bln` : `${years} tahun`;
}
