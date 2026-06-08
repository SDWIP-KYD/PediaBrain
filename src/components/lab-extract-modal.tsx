"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, X, Check, Loader2, AlertCircle } from "lucide-react";

interface LabResult {
  testName: string;
  result: string;
  unit: string;
  referenceRange: string;
  flag: string;
}

interface LabExtractModalProps {
  visitId: string;
  trigger: React.ReactNode;
  onSave?: () => void;
}

export function LabExtractModal({ visitId, trigger, onSave }: LabExtractModalProps) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "manual">("upload");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [labResults, setLabResults] = useState<LabResult[]>([]);
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("visitId", visitId);

    try {
      const res = await fetch("/api/lab-extract", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setImageUrl(data.imageUrl);

      if (data.extracted && data.extracted.length > 0) {
        setLabResults(data.extracted);
        setStep("preview");
      } else {
        // No data extracted, go to manual entry
        setLabResults([emptyRow()]);
        setStep("manual");
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to process image. Try manual entry.");
      setLabResults([emptyRow()]);
      setStep("manual");
    } finally {
      setLoading(false);
    }
  };

  const emptyRow = (): LabResult => ({
    testName: "",
    result: "",
    unit: "",
    referenceRange: "",
    flag: "normal",
  });

  const addRow = () => setLabResults([...labResults, emptyRow()]);

  const removeRow = (idx: number) => {
    if (labResults.length <= 1) return;
    setLabResults(labResults.filter((_, i) => i !== idx));
  };

  const updateRow = (idx: number, field: keyof LabResult, value: string) => {
    const updated = [...labResults];
    updated[idx] = { ...updated[idx], [field]: value };
    setLabResults(updated);
  };

  const flagColor = (flag: string) => {
    switch (flag) {
      case "high": return "destructive";
      case "low": return "outline";
      default: return "secondary";
    }
  };

  const flagIcon = (flag: string) => {
    switch (flag) {
      case "high": return "⬆️";
      case "low": return "⬇️";
      default: return "✅";
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const valid = labResults.filter((r) => r.testName && r.result);
      await fetch("/api/lab-extract/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ visitId, results: valid }),
      });
      setOpen(false);
      onSave?.();
      resetModal();
    } catch {
      setError("Gagal menyimpan data lab");
    } finally {
      setSaving(false);
    }
  };

  const resetModal = () => {
    setStep("upload");
    setImageUrl(null);
    setLabResults([]);
    setError(null);
  };

  return (
    <>
      <div onClick={() => setOpen(true)}>{trigger}</div>
      <Dialog open={open} onOpenChange={(o) => { if (!o) resetModal(); setOpen(o); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              {step === "upload" ? "Upload Lab Result" : step === "preview" ? "Preview Hasil" : "Input Manual"}
            </DialogTitle>
          </DialogHeader>

          {loading && (
            <div className="flex flex-col items-center py-12 gap-3">
              <Loader2 className="h-8 w-8 animate-spin text-neon" />
              <p className="text-sm text-muted-foreground">Memproses gambar...</p>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm">
              <AlertCircle className="h-4 w-4 text-destructive" />
              <span>{error}</span>
            </div>
          )}

          {step === "upload" && !loading && (
            <div className="space-y-4">
              {imageUrl && (
                <img src={imageUrl} alt="Lab result" className="w-full rounded-lg border" />
              )}
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-neon/50 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">Tap untuk upload foto lab</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG, atau PDF</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFile(file);
                }}
              />

              <div className="text-xs text-muted-foreground bg-muted rounded-lg p-3">
                <strong>Tips ambil foto:</strong>
                <ul className="mt-1 space-y-1 list-disc list-inside">
                  <li>Pastikan teks terbaca jelas</li>
                  <li>Hindari bayangan & silau</li>
                  <li>Foto seluruh area hasil lab</li>
                </ul>
              </div>

              <Button variant="outline" onClick={() => { setLabResults([emptyRow()]); setStep("manual"); }}>
                Input Manual
              </Button>
            </div>
          )}

          {(step === "preview" || step === "manual") && !loading && (
            <div className="space-y-3">
              {imageUrl && (
                <img src={imageUrl} alt="Lab result" className="w-full rounded-lg border max-h-48 object-contain" />
              )}

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {/* Header */}
                <div className="grid grid-cols-12 gap-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                  <div className="col-span-4">Parameter</div>
                  <div className="col-span-2">Nilai</div>
                  <div className="col-span-2">Unit</div>
                  <div className="col-span-2">Range</div>
                  <div className="col-span-1"></div>
                </div>

                {labResults.map((row, i) => (
                  <div key={i} className="grid grid-cols-12 gap-1 items-center">
                    <div className="col-span-4">
                      <Input
                        value={row.testName}
                        onChange={(e) => updateRow(i, "testName", e.target.value)}
                        placeholder="Hemoglobin"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={row.result}
                        onChange={(e) => updateRow(i, "result", e.target.value)}
                        placeholder="10.5"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={row.unit}
                        onChange={(e) => updateRow(i, "unit", e.target.value)}
                        placeholder="g/dL"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        value={row.referenceRange}
                        onChange={(e) => updateRow(i, "referenceRange", e.target.value)}
                        placeholder="12-16"
                        className="h-8 text-xs"
                      />
                    </div>
                    <div className="col-span-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeRow(i)}>
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                    <div className="col-span-1">
                      {row.flag && row.flag !== "normal" && (
                        <span className="text-xs">{flagIcon(row.flag)}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <Button variant="outline" size="sm" onClick={addRow} className="w-full">
                + Tambah Parameter
              </Button>

              {/* Flag summary */}
              <div className="flex gap-2 flex-wrap">
                {["high", "low"].map((f) => {
                  const count = labResults.filter((r) => r.flag === f).length;
                  if (count === 0) return null;
                  return (
                    <Badge key={f} variant={flagColor(f) as "destructive" | "outline"}>
                      {flagIcon(f)} {f}: {count}
                    </Badge>
                  );
                })}
              </div>

              <Button onClick={handleSave} disabled={saving || labResults.every((r) => !r.testName)} className="w-full">
                {saving ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Menyimpan...</>
                ) : (
                  <><Check className="h-4 w-4 mr-2" /> Simpan ke Kunjungan</>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
