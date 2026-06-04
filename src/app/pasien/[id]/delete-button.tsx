"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deletePatient } from "@/app/actions";
import { useRouter } from "next/navigation";

export function DeletePatientButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Hapus pasien "${name}"? Semua visit, lab, dan obat akan ikut terhapus.`)) return;
        startTransition(async () => {
          await deletePatient(id);
          router.push("/pasien");
        });
      }}
      title="Hapus pasien"
    >
      <Trash2 className="h-3.5 w-3.5 text-destructive" />
    </Button>
  );
}
