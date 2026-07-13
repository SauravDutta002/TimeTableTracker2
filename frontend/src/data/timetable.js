// ---------------------------------------------------------------------------
// HARDCODED TIMETABLE DATA
// Transcribed from the real college timetable screenshots.
// Each day is an array of 8 slots that map 1:1 to PERIODS below.
// type: "class" | "lab" | "free" | "off"
// ---------------------------------------------------------------------------

export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const PERIODS = [
  { start: "09:30", end: "10:20" },
  { start: "10:20", end: "11:10" },
  { start: "11:20", end: "12:10" },
  { start: "12:10", end: "13:00" },
  { start: "13:05", end: "13:55" },
  { start: "13:55", end: "14:45" },
  { start: "14:45", end: "15:35" },
  { start: "15:35", end: "16:25" },
];

const FREE = { subject: "Free Period", room: "", faculty: "", type: "free" };

// session-type letter -> P (Practical) = lab, L (Lecture) / T (Tutorial) = class
function cls(subject, faculty, room) {
  return { subject, faculty, room, type: "class" };
}
function lab(subject, faculty, room) {
  return { subject, faculty, room, type: "lab" };
}

export const PEOPLE = {
  you: {
    id: "you",
    name: "Saurav",
    shortName: "Saurav",
    initials: "S",
    gradient: "from-rose-500 via-pink-500 to-fuchsia-600",
    ring: "#fb7185",
    schedule: {
      Mon: [
        lab("24CSP-305", "Charnpreet Kaur", "Block-B3-506"),
        lab("24CSP-305", "Charnpreet Kaur", "Block-B3-506"),
        lab("24CSP-304", "Megha Sharma", "Block-B3-402-A"),
        lab("24CSP-304", "Megha Sharma", "Block-B3-402-A"),
        FREE,
        lab("24CSH-310", "Rahul Durgapal", "Block-B3-508"),
        lab("24CSH-310", "Rahul Durgapal", "Block-B3-508"),
        cls("24CST-331", "Nongmeikapam Thoiba Singh", "Block-B3-303"),
      ],
      Tue: [
        lab("24CSP-304", "Megha Sharma", "Block-B3-403-A"),
        lab("24CSP-304", "Megha Sharma", "Block-B3-403-A"),
        cls("24SMT-341", "Kiran Utreja", "Block-B3-303"),
        FREE,
        lab("24CSP-305", "Charnpreet Kaur", "Block-B3-402"),
        lab("24CSP-305", "Charnpreet Kaur", "Block-B3-402"),
        lab("24TDP-311", "Jagpal Singh Kang", "Block-B3-102"),
        lab("24TDP-311", "Jagpal Singh Kang", "Block-B3-102"),
      ],
      Wed: [
        cls("24CSH-301", "Namrta Tanwar", "Block-B3-303"),
        cls("24SMT-341", "Kiran Utreja", "Block-B3-303"),
        cls("24CST-302", "Sukhvir Kaur", "Block-B3-303"),
        FREE,
        lab("24CSH-301", "Namrta Tanwar", "Block-B3-402-A"),
        lab("24CSH-301", "Namrta Tanwar", "Block-B3-402-A"),
        FREE,
        FREE,
      ],
      Thu: [
        cls("24CST-302", "Sukhvir Kaur", "Block-B3-303"),
        cls("24SMT-341", "Kiran Utreja", "Block-B3-303"),
        lab("24TDP-311", "Jagpal Singh Kang", "Block-B3-107-A"),
        lab("24TDP-311", "Jagpal Singh Kang", "Block-B3-107-A"),
        FREE,
        cls("24CSH-310", "Rahul Durgapal", "Block-B3-303"),
        lab("24CSH-310", "Rahul Durgapal", "Block-B3-508"),
        lab("24CSH-310", "Rahul Durgapal", "Block-B3-508"),
      ],
      Fri: [
        FREE,
        FREE,
        cls("24TDT-312", "Anmol", "Block-B3-303"),
        cls("24TDT-312", "Anmol", "Block-B3-303"),
        FREE,
        cls("24CST-302", "Sukhvir Kaur", "Block-B3-303"),
        cls("24SMT-341", "Kiran Utreja", "Block-B3-303"),
        cls("24CSH-301", "Namrta Tanwar", "Block-B3-303"),
      ],
      Sat: [
        lab("24CSI-305", "Staff", "Block-B3-22"),
        FREE,
        FREE,
        FREE,
        FREE,
        FREE,
        FREE,
        FREE,
      ],
    },
  },
  friend: {
    id: "friend",
    name: "Parvaaz",
    shortName: "Parvaaz",
    initials: "P",
    gradient: "from-sky-500 via-cyan-500 to-emerald-500",
    ring: "#38bdf8",
    schedule: {
      Mon: [
        FREE,
        FREE,
        cls("24CSH-324", "Shivani Sharma", "Block-C2-507"),
        FREE,
        lab("24CSH-301", "Vishal Sharma", "Block-C2-507"),
        lab("24CSH-301", "Vishal Sharma", "Block-C2-507"),
        lab("24CSP-305", "MD Tauseef", "Block-C2-301"),
        lab("24CSP-305", "MD Tauseef", "Block-C2-301"),
      ],
      Tue: [
        lab("24CSP-305", "MD Tauseef", "Block-C2-302"),
        lab("24CSP-305", "MD Tauseef", "Block-C2-302"),
        lab("24CSP-304", "Girish Dilip Chitte", "Block-C2-302"),
        lab("24CSP-304", "Girish Dilip Chitte", "Block-C2-302"),
        FREE,
        cls("24CSH-301", "Vishal Sharma", "Block-C2-404"),
        lab("24TDP-311", "Saniya", "Block-C2-307"),
        lab("24TDP-311", "Saniya", "Block-C2-307"),
      ],
      Wed: [
        cls("24TDT-312", "Ashwani Choubey", "Block-C2-507"),
        cls("24TDT-312", "Ashwani Choubey", "Block-C2-507"),
        cls("24CST-302", "Azhar Ashraf Gadoo", "Block-C2-507"),
        cls("24CSH-301", "Vishal Sharma", "Block-C2-507"),
        FREE,
        cls("24CST-302", "Azhar Ashraf Gadoo", "Block-C2-507"),
        lab("24CSP-304", "Girish Dilip Chitte", "Block-C2-301"),
        lab("24CSP-304", "Girish Dilip Chitte", "Block-C2-301"),
      ],
      Thu: [
        cls("24SMT-341", "Rekha Rani", "Block-C2-507"),
        cls("24SMT-341", "Ram Narain Prajapati", "Block-C2-507"),
        cls("24SMT-341", "Rekha Rani", "Block-C2-507"),
        FREE,
        FREE,
        lab("24CSH-324", "Shivani Sharma", "Block-C2-507"),
        lab("24CSH-324", "Shivani Sharma", "Block-C2-507"),
        cls("24CSH-324", "Shivani Sharma", "Block-C2-507"),
      ],
      Fri: [
        lab("24TDP-311", "Saniya", "Block-C2-308"),
        lab("24TDP-311", "Saniya", "Block-C2-308"),
        cls("24CST-302", "Azhar Ashraf Gadoo", "Block-C2-507"),
        cls("24CST-341", "Daljeet Kaur", "Block-C2-507"),
        FREE,
        cls("24SMT-341", "Rekha Rani", "Block-C2-507"),
        FREE,
        FREE,
      ],
      Sat: [FREE, FREE, FREE, FREE, FREE, FREE, FREE, FREE],
    },
  },
};
