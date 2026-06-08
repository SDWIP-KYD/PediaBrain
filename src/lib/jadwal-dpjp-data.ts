export const weekDays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];

export const doctors = [
  { id: "jusli", name: "dr. Jusli, M.Kes, Sp.A(K)", colorClass: "bg-[#7c3aed18] border-l-[3px] border-[#a78bfa]", dotColor: "bg-[#a78bfa]" },
  { id: "syarif", name: "Prof. dr. Syarifuddin Rauf, M.Kes, Sp.A(K)", colorClass: "bg-[#0ea5e918] border-l-[3px] border-[#38bdf8]", dotColor: "bg-[#38bdf8]" },
  { id: "aizah", name: "Dr. dr. St. Aizah Lawang, M.Kes, Sp.A(K)", colorClass: "bg-[#f59e0b18] border-l-[3px] border-[#fbbf24]", dotColor: "bg-[#fbbf24]" },
];

export const schedule: Record<string, { doctorId: string; time: string }[]> = {
  "Senin": [
    { doctorId: "syarif", time: "09.00 – 12.00" },
    { doctorId: "jusli", time: "18.00 – 20.00" },
  ],
  "Selasa": [
    { doctorId: "aizah", time: "09.00 – 12.00" },
    { doctorId: "jusli", time: "17.00 – 20.00" },
  ],
  "Rabu": [
    { doctorId: "syarif", time: "09.00 – 12.00" },
    { doctorId: "jusli", time: "18.00 – 20.00" },
  ],
  "Kamis": [
    { doctorId: "aizah", time: "09.00 – 12.00" },
    { doctorId: "jusli", time: "13.00 – 16.00" },
    { doctorId: "jusli", time: "18.00 – 20.00" },
  ],
  "Jumat": [
    { doctorId: "jusli", time: "18.00 – 20.00" },
  ],
  "Sabtu": [
    { doctorId: "jusli", time: "08.00 – 13.00" },
  ],
  "Minggu": [],
};

export const khanzaAccounts = [
  { doctor: "dr. Jusli", username: "dr-777" },
  { doctor: "Prof. Syarifuddin", username: "D0194" },
  { doctor: "dr. Nina", username: "D0000206" },
];
