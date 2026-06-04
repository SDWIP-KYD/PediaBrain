"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { CreateFollowUpDialog } from "./create-dialog";

export function CreateFollowUpDialogWrapper({ iconOnly = false }: { iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {iconOnly ? (
        <Button
          size="icon-sm"
          variant="outline"
          onClick={() => setOpen(true)}
          title="Tambah Follow-up"
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      ) : (
        <Button onClick={() => setOpen(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Follow-up Baru
        </Button>
      )}
      <CreateFollowUpDialog open={open} onOpenChange={setOpen} />
    </>
  );
}
