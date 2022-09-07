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

// Define an order for the mathematical functions
function nextOperation(o) {
  if (o === '+') {
    return '-';
  } else if (o === '-') {
    return 'x';
  } else if (o === 'x') {
    return '÷';
  } else {
    return '+';
  }
}

// Choose a value between min and max, except last.
function randomish(min, max, last) {
  let range = max - min;
  if (last >= min && last <= max) { range--; }
  if (range <= 0) { return min; }

  let result = min + Math.floor(Math.random() * (range + 1));
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
  } else if (o === 'x') {
    u = randomish(0, 12, u);
    l = randomish(0, 12, l);
    a = u * l;
  } else { // (o === '÷')
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

// Check the answer
function checkAnswer() {
  let a = +(answer.value);

  // Stop if we are in between problems right now
  if (currentProblem === null) { return; }

  // If correct, track progress, celebrate, and pick the next one
  if (a === currentProblem.answer) {
    const newNow = now();

    // If it's a new day, push old data to history and swap to a new 'today'
    if (dateString(newNow) !== today.date) {
      loadState();
    }

    // Add just solved problem to telemetry
    const msToAnswer = (newNow - currentProblem.startTime);
    today.count++;

    if (msToAnswer < 60 * 1000) {
      const entry = [upper.innerText, op.innerText, lower.innerText, msToAnswer, currentProblem.wasEverIncorrect];
      today.telemetry ??= [];
      today.telemetry.push(entry);
      addTelemetryEntry(entry);
    }

    // Save new telemetry
    try {
      window.localStorage.setItem('today', JSON.stringify(today));
    } catch { }

    // Update UI
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

// Toggle to the next math operation
function nextProblemOperation() {
  const o = nextOperation(op.innerText);
  op.innerText = o;
  settings.op = o;

  try {
    window.localStorage.setItem('settings', JSON.stringify(settings));
  } catch { }

  nextProblem();
  answer.focus();
}

// Render progress on top bar
function showProgress() {
  if (today.count < settings.goal) {
    progress.className = "bronze";
    progressOuter.className = '';
  } else if (today.count < 2 * settings.goal) {
    progress.className = "silver";
    progressOuter.className = "bronze";
  } else if (today.count < 3 * settings.goal) {
    progress.className = "gold";
    progressOuter.className = "silver";
  } else {
    progress.className = '';
    progressOuter.className = "gold";
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
  speed[o][u][l] ??= [];
  speed[o][u][l].push(timeInMs);

  telemetry.count++;
}

// Load stored settings, progress today, and historical progress.
function loadState() {
  const storage = window.localStorage;
  try {
    settings = { ...settings, ...JSON.parse(storage.getItem('settings')) };
    history = JSON.parse(storage.getItem('history')) ?? history;

    const currentToday = dateString(now());
    const lastToday = JSON.parse(storage.getItem('today'));
    if (lastToday) {
      if (lastToday.date === currentToday) {
        today = lastToday;
      } else {
        // On a new day, add most recent day to history
        history[lastToday.date] = lastToday;
        storage.setItem("history", JSON.stringify(history));

        // TODO: Delete very old data?

        // Reset 'today' data
        today = { date: currentToday, count: 0, telemetry: [] };
      }
    }
  }
  catch { }

  // Reflect loaded state in UI
  op.innerText = settings.op;
  showProgress();

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

  // Load localStorage state (Settings, work per day, ...)
  loadState();

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
  op.addEventListener("click", nextProblemOperation);


  // Hook up hiding modal popups
  document.querySelectorAll(".overlay").forEach((o) => o.addEventListener("click", hide));
  document.querySelectorAll(".contents").forEach((o) => o.addEventListener("click", suppressHide));

  // Hook up bar icons
  document.getElementById("help-button").addEventListener("click", () => show("help-box"));
  document.getElementById("speed-button").addEventListener("click", () => drawTelemetryTable(op.innerText, getSpeedCell));
  document.getElementById("accuracy-button").addEventListener("click", () => drawTelemetryTable(op.innerText, getAccuracyCell));
  document.getElementById("calendar-button").addEventListener("click", drawCalendar);

  // Choose the first problem
  nextProblem();
};

// ---- Control Bar Icons ----

function show(id) {
  const container = document.getElementById(id);
  container.style.display = "";
}

function hide(args) {
  args.target.style.display = "none";
}

function suppressHide(args) {
  args.stopPropagation();
}

// ---- Speed and Accuracy Reports ----

function getSpeedCell(column, operation, row) {
  // For subtraction, only create cells for non-negative results
  if (operation === '-' && column - row < 0) { return null; }

  // Look up telemetry for problem
  const u = (operation === '÷' ? (column * row) : column);
  const current = telemetry.speed?.[operation]?.[`${u}`]?.[`${row}`];

  const td = document.createElement("td");
  td.title = `${u} ${operation} ${row}`;

  if (current) {
    current.sort((l, r) => l - r);
    const medianMs = current[Math.floor(current.length / 2)];
    const medianS = medianMs / 1000;
    td.innerText = medianS.toLocaleString("en-US", { minimumFractionDigits: (medianS < 9.5 ? 1 : 0), maximumFractionDigits: 1 });
    td.className = speedClass(medianMs);
  }

  return td;
}

function getAccuracyCell(column, operation, row) {
  // For subtraction, only create cells for non-negative results
  if (operation === '-' && column - row < 0) { return null; }

  // Look up telemetry for problem
  const u = (operation === '÷' ? (column * row) : column);
  const current = telemetry.accuracy?.[operation]?.[`${u}`]?.[`${row}`];

  const td = document.createElement("td");
  td.title = `${u} ${operation} ${row}`;

  if (current) {
    const accuracyPct = 100 * (current[0] / current[1]);
    td.innerText = `${accuracyPct.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
    td.className = accuracyClass(accuracyPct);
  }

  return td;
}

function drawTelemetryTable(operation, getTableCell) {
  operation ??= '+';

  let colHeadings = null;
  let rowHeadings = null;

  if (operation === '-') {
    colHeadings = [20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0];
    rowHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];
  } else if (operation === '÷') {
    colHeadings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    rowHeadings = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  } else {
    colHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    rowHeadings = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  }

  const table = drawTable(operation, colHeadings, rowHeadings, getTableCell);
  const container = document.getElementById("contents");
  container.innerHTML = "";
  container.appendChild(table);
  show("box");
}

function drawTable(operation, colHeadings, rowHeadings, getTableCell) {
  const table = document.createElement("table");
  table.classList.add("stats");
  if (operation === '-') { table.classList.add("subtraction"); }

  let tr = null;
  let td = null;

  tr = document.createElement("tr");

  // Corner Cell
  td = document.createElement("th");
  td.innerText = operation;
  td.addEventListener('click', () => drawTelemetryTable(nextOperation(operation), getTableCell));
  tr.appendChild(td);

  // First Row (column headings)
  for (let x = 0; x < colHeadings.length; ++x) {
    td = document.createElement("th");
    td.innerText = colHeadings[x];
    tr.appendChild(td);
  }

  table.appendChild(tr);

  for (let y = 0; y < rowHeadings.length; ++y) {
    tr = document.createElement("tr");

    td = document.createElement("td");
    td.innerText = rowHeadings[y];
    tr.appendChild(td);

    for (let x = 0; x < colHeadings.length; ++x) {
      const td = getTableCell(colHeadings[x], operation, rowHeadings[y]);
      if (td) { tr.appendChild(td); }
    }

    table.appendChild(tr);
  }

  return table;
}

function speedClass(timeMs) {
  if (!timeMs) {
    return "unknown";
  } else if (timeMs < 2000) {
    return "great";
  } else if (timeMs < 3000) {
    return "good";
  } else if (timeMs < 6000) {
    return "ok";
  } else {
    return "bad";
  }
}

function accuracyClass(accuracyPct) {
  if (!accuracyPct) {
    return "unknown";
  } else if (accuracyPct >= 95) {
    return "great";
  } else if (accuracyPct >= 90) {
    return "good";
  } else if (accuracyPct >= 75) {
    return "ok";
  } else {
    return "bad";
  }
}

// ---- Consistency Calendar ----

function drawCalendar() {
  const table = document.createElement("table");
  table.className = "calendar";

  let tr = null;
  let td = null;

  // Header Row (day names)
  const colHeadings = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  tr = document.createElement("tr");
  for (let x = 0; x < colHeadings.length; ++x) {
    td = document.createElement("th");
    td.innerText = colHeadings[x];
    tr.appendChild(td);
  }
  table.appendChild(tr);

  const end = now();
  const startDate = addDays(startOfWeek(end), -21);
  let current = startDate;

  while (current <= end) {
    tr = document.createElement("tr");

    for (let x = 0; x < 7; ++x) {
      const td = document.createElement("td");
      const date = dateString(current);
      const historyDay = (date === today.date ? today : history[date]);
      const color = starColor(historyDay);
      const showMonth = (current === startDate || current.getDate() === 1);

      let contents = `<div class="date">${(showMonth ? current.toLocaleString('en-US', { month: "short" }) : "")} ${current.toLocaleString('en-US', { day: "numeric" })}</div>`;
      if (color) {
        contents += `<svg class="fill-${color}"><use href="#star"></use</svg>`;
      }

      td.innerHTML = contents;
      tr.appendChild(td);
      current = addDays(current, 1);
      if (current > end) { break; }
    }

    table.appendChild(tr);
  }

  const container = document.getElementById("contents");
  container.innerHTML = "";
  container.appendChild(table);
  show("box");
}

function starColor(historyDay) {
  if (!historyDay) { return null; }

  const count = historyDay.count;
  if (count >= 3 * settings.goal) {
    return "gold";
  } else if (count >= 2 * settings.goal) {
    return "silver";
  } else if (count >= settings.goal) {
    return "bronze";
  } else {
    return null;
  }
}