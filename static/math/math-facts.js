// Cached Elements
let upper = null;
let lower = null;
let op = null;
let answer = null;
let progress = null;
let progressOuter = null;

// Sound Effects
let oneComplete = null;
let setComplete = null;
const sounds = ["air-horn", "applause", "birthday-party"];

// State
let currentProblem = null; // { answer: null, startTime: null, wasEverIncorrect: null };

let settings = { goal: 40, pauseMs: 500, op: '+', sounds: true, volume: 0.25, oneSound: 0, setSound: 2 };
let today = { date: dateString(now()), count: 0, telemetry: [] };
let history = {};
let telemetry = { count: 0, accuracy: {}, speed: {} };


// Return this moment as a Date
function now() {
  return new Date();
}

// Return an ISO 8601 string for the given date in the local timezone (not UTC) (ex: '2022-08-31')
function dateString(date) {
  // "sv" locale (Sweden) uses ISO 8601 date formatting
  return date.toLocaleDateString("sv");
}

// Compute the date 'days' after 'date'
function addDays(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Return the date of Sunday in the same week as 'date'
function startOfWeek(date) {
  return addDays(date, -date.getDay());
}

// Choose a value between min and max, except last.
function randomish(min, max, last) {
  let range = max - min;
  if (last >= min && last <= max) { range--; }

  let result = min + Math.floor(Math.random() * range);
  if (result === last) { result = max; }

  return result;
}

// Randomly choose the next math problem
function nextProblem() {
  let o = op.innerText;
  let u = +(upper.innerText);
  let l = +(lower.innerText);
  let a = null;

  if (o === '+') {
    u = randomish(0, 12, u);
    l = randomish(0, 12, l);
    a = u + l;
  } else if (o === '-') {
    u = randomish(0, 20, u);
    l = randomish(0, u, l);
    a = u - l;
  } else if (o === 'x' || o === '*') {
    u = randomish(0, 12, u);
    l = randomish(0, 12, l);
    a = u * l;
  } else { // (o === '/' || o === '÷')
    // Choose *factors* and compute product; no zero.
    a = randomish(1, 12, a);
    l = randomish(1, 12, l);
    u = a * l;
  }

  // Update current problem state
  currentProblem = { answer: a, startTime: now(), wasEverIncorrect: false };

  // Update UI
  upper.innerText = u;
  lower.innerText = l;
  answer.value = "";
}

// Toggle to the next math operation
function nextOperation() {
  let o = op.innerText;

  if (o === '+') {
    o = '-';
  } else if (o === '-') {
    o = 'x';
  } else if (o === 'x' || o === '*') {
    o = '÷';
  } else { // (o === '/' || o === '÷')
    o = '+';
  }

  op.innerText = o;
  settings.op = o;

  try {
    window.localStorage.setItem('settings', JSON.stringify(settings));
  } catch { }

  nextProblem();
  answer.focus();
}

// Check the answer
function checkAnswer() {
  let a = +(answer.value);

  // Stop if we are in between problems right now
  if (currentProblem === null) { return; }

  // If correct, track progress, celebrate, and pick the next one
  if (a === currentProblem.answer) {
    const msToAnswer = (now() - currentProblem.startTime);
    today.count++;

    if (msToAnswer < 60 * 1000) {
      const entry = [upper.innerText, op.innerText, lower.innerText, msToAnswer, currentProblem.wasEverIncorrect];
      today.telemetry ??= [];
      today.telemetry.push(entry);
      addTelemetryEntry(entry);
    }

    try {
      window.localStorage.setItem('today', JSON.stringify(today));
    } catch { }

    currentProblem = null;
    showProgress();
    setTimeout(nextProblem, settings.pauseMs ?? 250);

    if (settings.sounds) {
      if (today.count > 0 && today.count <= 3 * settings.goal && (today.count % settings.goal) === 0) {
        setComplete.load();
        setComplete.play();
      } else {
        oneComplete.load();
        oneComplete.play();
      }
    }
  } else {
    // If incorrect, and the right length, mark wasEverIncorrect
    if (currentProblem.answer.toString().length <= answer.value.length) {
      currentProblem.wasEverIncorrect = true;
    }
  }
}

// Render progress on top bar
function showProgress() {
  // https://uigradients.com/; https://cssgradient.io/
  const first = "linear-gradient(to right, #ca7345, #732100)";
  const second = "linear-gradient(to right, #d7dde8, #757f9a)";
  const third = "linear-gradient(to right, #eecd3f, #99771f)";

  if (today.count < settings.goal) {
    progress.style.backgroundImage = first;
    progressOuter.style.backgroundImage = '';
  } else if (today.count < 2 * settings.goal) {
    progress.style.backgroundImage = second;
    progressOuter.style.backgroundImage = first;
  } else if (today.count < 3 * settings.goal) {
    progress.style.backgroundImage = third;
    progressOuter.style.backgroundImage = second;
  } else {
    progress.style.backgroundImage = '';
    progressOuter.style.backgroundImage = third;
  }

  const portionDone = (today.count % settings.goal) / settings.goal;
  progress.style.backgroundSize = `${Math.floor(100 * portionDone)}% 100%`;
}

// Compute telemetry summary for today and last 60 days of history
function computeTelemetry() {
  for (const entry of today.telemetry) {
    addTelemetryEntry(entry);
  }

  const cutoff = dateString(addDays(now(), -60));
  for (let date in history) {
    if (date >= cutoff) {
      let dayTelemetry = history[date].telemetry;
      if (dayTelemetry) {
        for (const entry of dayTelemetry) {
          addTelemetryEntry(entry);
        }
      }
    }
  }
}

// Add telemetry for a single problem entry
function addTelemetryEntry(entry) {
  const accuracy = telemetry.accuracy;
  const speed = telemetry.speed;

  const u = entry[0];
  const o = entry[1];
  const l = entry[2];
  const timeInMs = entry[3];
  const wasEverIncorrect = entry[4];

  // accuracy["2"]["+"]["3"] = [20, 22]  (means "2 + 3" asked 22 times, correct on first try 20/22 times.)
  accuracy[o] ??= {};
  accuracy[o][u] ??= {};
  accuracy[o][u][l] ??= [0, 0];
  accuracy[o][u][l][0] += (wasEverIncorrect ? 0 : 1);
  accuracy[o][u][l][1] += 1;

  // speed["2"]["x"]["4"] = [1640, 2160, 850]  (means "2 x 4" asked three times and correct answer recieved in 1.64s, 2.16s, and 850 ms)
  speed[o] ??= {};
  speed[o][u] ??= {};
  speed[o][u][l] = [];
  speed[o][u][l].push(timeInMs);

  telemetry.count++;
}

// Load stored settings, progress today, and historical progress.
function loadState() {
  const storage = window.localStorage;
  try {
    settings = { ...settings, ...JSON.parse(storage.getItem('settings')) };
    history = JSON.parse(storage.getItem('history')) ?? history;

    const lastToday = JSON.parse(storage.getItem('today'));
    if (lastToday) {
      if (lastToday.date === today.date) {
        today = lastToday;
      } else {
        // On a new day, add most recent day to history
        history[lastToday.date] = lastToday;
        storage.setItem("history", JSON.stringify(history));

        // TODO: Delete very old data?
      }
    }
  }
  catch { }

  computeTelemetry();
}

window.onload = async function () {
  // Cache controls from DOM we'll be manipulating
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");
  progress = document.getElementById("progress");
  progressOuter = document.getElementById("progress-outer");

  loadState();

  // Reflect loaded state in UI
  op.innerText = settings.op;
  showProgress();

  // Load sounds
  if (settings.sounds) {
    oneComplete = new Audio(`${sounds[(settings.oneSound ?? 0) % sounds.length]}.mp3`);
    setComplete = new Audio(`${sounds[(settings.setSound ?? 1) % sounds.length]}.mp3`);

    oneComplete.volume = settings.volume ?? 1;
    setComplete.volume = settings.volume ?? 1;
  }

  // Hook up to check answer
  answer.focus();
  answer.addEventListener("input", checkAnswer);

  // Hook up to toggle operation
  op.addEventListener("click", nextOperation);

  // Choose the first problem
  nextProblem();
};