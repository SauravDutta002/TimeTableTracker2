// Sweet, time-of-day greetings for Parvaaz. Rotates daily (seeded by date +
// time-of-day block) so it stays fresh without changing on every re-render.

const GREETINGS = {
  lateNight: [
    "Still up, Parvaaz?",
    "Can't sleep, beautiful?",
    "Late-night thoughts again, gorgeous?",
  ],
  morning: [
    "Good morning, Parvaaz",
    "Morning, beautiful",
    "Rise and shine, gorgeous",
    "Good morning to the best part of my day",
  ],
  afternoon: [
    "Good afternoon, Parvaaz",
    "Hey there, beautiful",
    "Hope today's treating you well, gorgeous",
  ],
  evening: [
    "Good evening, Parvaaz",
    "Evening, gorgeous",
    "Hey beautiful, how was your day?",
  ],
  night: [
    "Good night, Parvaaz",
    "Sweet dreams, beautiful",
    "Good night to the best there is",
  ],
};

const COMPLIMENTS = [
  "You're beautiful, inside and out.",
  "You're the best thing that's happened to me.",
  "Smart, kind, and absolutely stunning.",
  "You make everything better.",
  "Simply the best. No competition.",
  "Still the prettiest person in every room.",
];

function timeBlock(hour) {
  if (hour < 5) return "lateNight";
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  if (hour < 21) return "evening";
  return "night";
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function pick(pool, seed) {
  return pool[hashString(seed) % pool.length];
}

// Returns { greeting, compliment } — stable for a given date + hour block,
// varies from day to day.
export function parvaazGreeting(date = new Date()) {
  const block = timeBlock(date.getHours());
  const dateKey = date.toDateString();
  return {
    greeting: pick(GREETINGS[block], `${dateKey}-${block}-g`),
    compliment: pick(COMPLIMENTS, `${dateKey}-${block}-c`),
  };
}
