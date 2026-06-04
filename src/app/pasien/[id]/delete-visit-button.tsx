"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteVisit } from "@/app/actions";

export function DeleteVisitButton({ id, patientId }: { id: string; patientId: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-7 w-7"
      disabled={pending}
      onClick={() => {
        if (!confirm("Hapus kunjungan ini?")) return;
        startTransition(async () => {
          await deleteVisit(id, patientId);
        });
      }}
      title="Hapus kunjungan"
    >
      <Trash2 className="h-3 w-3 text-destructive" />
    </Button>
  );
}
