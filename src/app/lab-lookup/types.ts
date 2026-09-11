// Shared types for Lab Lookup feature

export type LabParam = {
  name: string;
  hasil: string;
  normal: string;
  satuan: string;
};

export type LabVisit = {
  tgl: string;
  params: LabParam[];
};

export type SpecialItem = {
  tanggal?: string;
  klinis?: string;
  kesan?: string;
  kesimpulan?: string;
  hasil?: string;
  jenis?: string;
};

export type SpecialResult = {
  pa: SpecialItem[];
  rad: SpecialItem[];
  bmp: SpecialItem[];
  lcs: SpecialItem[];
  immuno: SpecialItem[];
  ihc: SpecialItem[];
};

export type APIResponse = {
  success: boolean;
  norm?: string;
  name?: string;
  visits?: LabVisit[];
  special?: SpecialResult;
  total_records?: number;
  is_partial?: boolean;
  full_estimate?: number;
  error?: string;
  cached?: boolean;
  // job-related fields
  job_id?: string;
  status?: string;
  result?: APIResponse;
};

/** Per-patient state within a (possibly multi-RM) search. */
export type PatientState = {
  norm: string;
  loading: boolean; // quick fetch in flight
  fullLoading: boolean; // background full job polling
  data: APIResponse | null; // latest known (quick preview or full)
  error: string | null; // localized failure, never blocks other patients
  opened: boolean; // patient card expand state
  fullNote?: string;
};
