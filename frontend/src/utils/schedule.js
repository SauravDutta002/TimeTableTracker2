import { PERIODS, DAYS } from "../data/timetable.js";

export const SUBJECT_MAP = {
  "24CSH-301": "Project Based Learning in Java",
  "24CSH-310": "Advanced C Programming",
  "24CSI-305": "Institute/Industrial Summer Training",
  "24CSP-304": "Full Stack Development - II",
  "24CSP-305": "Competitive Coding-II",
  "24CST-302": "Computer Networks",
  "24CST-331": "Big Data Fundamentals",
  "24SMT-341": "Probability and Statistics",
  "24TDP-311": "Soft Skills-III",
  "24TDT-312": "Aptitude-III",
};

export function getSubjectName(subject) {
  return SUBJECT_MAP[subject] || subject;
}

export function timeToMinutes(time) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function timeToSeconds(time) {
  return timeToMinutes(time) * 60;
}

// "8h 03m 12s" / "3m 40s" / "27s" — always counts down to the second.
export function countdownLabel(totalSeconds) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m ${String(sec).padStart(2, "0")}s`;
  if (m > 0) return `${m}m ${String(sec).padStart(2, "0")}s`;
  return `${sec}s`;
}

export function minutesToLabel(mins) {
  const h24 = Math.floor(mins / 60) % 24;
  const m = mins % 60;
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  const ampm = h24 < 12 ? "AM" : "PM";
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export function courseNumber(subject) {
  const match = subject?.match(/(\d+)\s*$/);
  return match ? match[1] : subject;
}

export function durationLabel(mins) {
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function todayKey(date = new Date()) {
  // JS getDay(): 0=Sun..6=Sat -> map to our DAYS (Mon..Sat), Sunday -> "Sun" (off)
  const idx = date.getDay();
  return idx === 0 ? "Sun" : DAYS[idx - 1];
}

export function nowMinutes(date = new Date()) {
  return date.getHours() * 60 + date.getMinutes();
}

export function nowSeconds(date = new Date()) {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

// Returns the slot (with type/subject) a person is in at a given day + second offset,
// along with period index and timing info. Returns an "off" status outside college hours.
// `seconds` is seconds-since-midnight, so progress/left/toStart are second-precise.
export function getStatusAt(person, day, seconds) {
  const daySchedule = person.schedule[day];

  if (!daySchedule) {
    return { type: "off", label: "No College", periodIndex: -1 };
  }

  for (let i = 0; i < PERIODS.length; i++) {
    const period = PERIODS[i];
    const slot = daySchedule[i];
    if (!slot) continue;

    const start = timeToSeconds(period.start);
    const end = timeToSeconds(period.end);

    if (seconds >= start && seconds < end) {
      const progress = (seconds - start) / (end - start);
      return {
        type: slot.type,
        subject: slot.subject,
        room: slot.room,
        faculty: slot.faculty,
        periodIndex: i,
        start: start / 60,
        end: end / 60,
        progress,
        secondsLeft: end - seconds,
      };
    }
  }

  const firstSlotIdx = daySchedule.findIndex(Boolean);
  const lastSlotIdx = daySchedule.reduce((acc, s, i) => (s ? i : acc), -1);

  if (firstSlotIdx === -1) {
    return { type: "off", label: "No College", periodIndex: -1 };
  }

  const dayStart = timeToSeconds(PERIODS[firstSlotIdx].start);

  if (seconds < dayStart) {
    return { type: "off", label: "Before College", periodIndex: -1, secondsToStart: dayStart - seconds };
  }
  return { type: "off", label: "College Over", periodIndex: -1 };
}

export function getNextSlot(person, day, minutes) {
  const daySchedule = person.schedule[day];
  if (!daySchedule) return null;

  for (let i = 0; i < PERIODS.length; i++) {
    const slot = daySchedule[i];
    if (!slot) continue;
    const start = timeToMinutes(PERIODS[i].start);
    if (start > minutes) {
      return { ...slot, periodIndex: i, start, end: timeToMinutes(PERIODS[i].end) };
    }
  }
  return null;
}

const MUTUAL_FREE_TYPES = new Set(["free", "lunch", "off"]);

// Builds merged blocks of time in a day where BOTH people are simultaneously
// free (free period, lunch, or no college), based on the shared period grid.
export function getMutualFreeBlocks(you, friend, day) {
  const blocks = [];
  let current = null;

  for (let i = 0; i < PERIODS.length; i++) {
    const period = PERIODS[i];
    const yourSlot = you.schedule[day]?.[i] ?? null;
    const friendSlot = friend.schedule[day]?.[i] ?? null;

    const yourType = yourSlot ? yourSlot.type : "off";
    const friendType = friendSlot ? friendSlot.type : "off";

    const isMutualFree = MUTUAL_FREE_TYPES.has(yourType) && MUTUAL_FREE_TYPES.has(friendType);

    if (isMutualFree) {
      const isLunch = yourType === "lunch" && friendType === "lunch";
      const start = timeToMinutes(period.start);
      const end = timeToMinutes(period.end);

      if (current && current.end === start && current.isLunch === isLunch) {
        current.end = end;
        current.periods.push(i);
      } else {
        if (current) blocks.push(current);
        current = { start, end, isLunch, periods: [i] };
      }
    } else if (current) {
      blocks.push(current);
      current = null;
    }
  }
  if (current) blocks.push(current);

  return blocks.map((b) => ({
    ...b,
    duration: b.end - b.start,
    label: b.isLunch ? "Lunch Break" : "Both Free",
  }));
}

export function getNextMutualFree(you, friend, day, minutes) {
  const blocks = getMutualFreeBlocks(you, friend, day);
  return blocks.find((b) => b.end > minutes) ?? null;
}

export const STATUS_META = {
  class: { label: "In Class", color: "#fb7185" },
  lab: { label: "In Lab", color: "#a855f7" },
  lunch: { label: "Lunch", color: "#f59e0b" },
  free: { label: "Free", color: "#34d399" },
  off: { label: "Free", color: "#34d399" },
};
