export interface Doctor {
  id: string;
  name: string;
  credentials: string;
  color: string; // tailwind color key
  colorHex: string;
}

export interface TimeSlot {
  doctorId: string;
  start: string; // "09.00"
  end: string;   // "12.00"
}

export interface DaySchedule {
  day: string;
  slots: TimeSlot[];
}

export const doctors: Doctor[] = [
  {
    id: "jusli",
    name: "dr. Jusli, M.Kes, Sp.A(K)",
    credentials: "Sp.A(K)",
    color: "purple",
    colorHex: "#a78bfa",
  },
  {
    id: "syarif",
    name: "Prof. dr. Syarifuddin Rauf, M.Kes, Sp.A(K)",
    credentials: "Sp.A(K)",
    color: "blue",
    colorHex: "#38bdf8",
  },
  {
    id: "aizah",
    name: "Dr. dr. St. Aizah Lawang, M.Kes, Sp.A(K)",
    credentials: "Sp.A(K)",
    color: "amber",
    colorHex: "#fbbf24",
  },
];

export const weekDays = [
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
  "Minggu",
] as const;

export const schedule: DaySchedule[] = [
  {
    day: "Senin",
    slots: [
      { doctorId: "syarif", start: "09.00", end: "12.00" },
      { doctorId: "jusli", start: "18.00", end: "20.00" },
    ],
  },
  {
    day: "Selasa",
    slots: [
      { doctorId: "aizah", start: "09.00", end: "12.00" },
      { doctorId: "jusli", start: "17.00", end: "20.00" },
    ],
  },
  {
    day: "Rabu",
    slots: [
      { doctorId: "syarif", start: "09.00", end: "12.00" },
      { doctorId: "jusli", start: "18.00", end: "20.00" },
    ],
  },
  {
    day: "Kamis",
    slots: [
      { doctorId: "jusli", start: "09.00", end: "12.00" },
      { doctorId: "jusli", start: "13.00", end: "16.00" },
      { doctorId: "jusli", start: "18.00", end: "20.00" },
    ],
  },
  {
    day: "Jumat",
    slots: [{ doctorId: "jusli", start: "18.00", end: "20.00" }],
  },
  {
    day: "Sabtu",
    slots: [{ doctorId: "jusli", start: "08.00", end: "13.00" }],
  },
  {
    day: "Minggu",
    slots: [],
  },
];

export const accounts = [
  { doctor: "dr. Jusli", username: "dr-777" },
  { doctor: "Prof. Syarifuddin", username: "D0194" },
  { doctor: "dr. Nina", username: "D0000206" },
];
