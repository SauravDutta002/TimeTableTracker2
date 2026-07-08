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
  "You are beautiful.",
  "You are gorgeous.",
  "You're beautiful, inside and out.",
  "You're the best thing that's happened to me.",
  "Smart, kind, and absolutely stunning.",
  "You make everything better.",
  "Simply the best. No competition.",
  "Still the prettiest person in every room.",
];

const SIMPLE_GREETINGS = {
  lateNight: "Still up?",
  morning: "Good morning",
  afternoon: "Good afternoon",
  evening: "Good evening",
  night: "Good night",
};

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

let currentCompliment = null;

function initParvaazGreeting() {
  if (typeof window === 'undefined' || !window.localStorage) return;

  const identity = localStorage.getItem("user_identity");
  if (identity !== "friend") return; // Only track for Parvaaz

  const nowTime = Date.now();
  let count = parseInt(localStorage.getItem('parvaaz_refresh_count') || '0', 10);
  let angaaaStart = parseInt(localStorage.getItem('parvaaz_angaaa_start') || '0', 10);

  if (angaaaStart > 0) {
    if (nowTime - angaaaStart < 2 * 60 * 1000) { // 2 minutes window
      currentCompliment = "angaaa";
      return;
    } else {
      count = 0;
      localStorage.removeItem('parvaaz_angaaa_start');
    }
  }

  // Pick a random compliment for this refresh
  currentCompliment = COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)];
  count++;

  if (count >= 5) {
    localStorage.setItem('parvaaz_angaaa_start', nowTime.toString());
    localStorage.setItem('parvaaz_refresh_count', '0');
  } else {
    localStorage.setItem('parvaaz_refresh_count', count.toString());
  }
}

// Run once when the module is loaded (on page refresh)
initParvaazGreeting();

// Returns { greeting, compliment } — stable for a given date + hour block,
// varies from day to day.
export function parvaazGreeting(date = new Date()) {
  const block = timeBlock(date.getHours());
  const dateKey = date.toDateString();
  
  let comp = currentCompliment;
  if (!comp) {
    comp = pick(COMPLIMENTS, `${dateKey}-${block}-c`);
  }

  return {
    greeting: pick(GREETINGS[block], `${dateKey}-${block}-g`),
    compliment: comp,
  };
}

// Plain time-of-day greeting, no compliments — used for Saurav's own profile.
export function simpleGreeting(date = new Date()) {
  return { greeting: SIMPLE_GREETINGS[timeBlock(date.getHours())], compliment: null };
}
