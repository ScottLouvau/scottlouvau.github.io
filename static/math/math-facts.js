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

// State
let nextAnswer = null;

let settings = { goal: 40, pauseMs: 500, op: '+', sounds: true, volume: 0.25, oneSound: 0, setSound: 2 };
let today = { date: dateString(now()), count: 0 };
let history = {};

const sounds = ["air-horn", "applause", "birthday-party"];

/* LocalStorage saved data 'shape':
{ 
  settings: { goal: 5, op: '+', ... },
  today: { date: "2022-09-01", count: 15, set: [
    ["5", "+", "3", 2640, true], ...
    [upper, op, lower, timeToSolveMs, firstAnswerCorrect]
  ] },
  historyCount: {
    "2022-08-31": [ 28 ], ...
  },
  historyAccuracy: {
    "+": { 
      "1": { 
        "1": { 45, 49 }, // For 1+1, correct on first try 45/49 times.
        "2", { 21, 22 }, // For 1+2, correct on first try 21/22 times.
        ...
      }, ...
    }, ... 
  },
  historySpeed: {
    "+": {
      "1": { 
        "1": { 2640, 1420, 2130, 22000, ... }, // Time in Ms to correct answer for every 1+1 attempt.
      }
    }
  }
}

 historyAccuracy will only capture the first attempt each time a problem is presented.
 historyAccuracy triggers when the answer is as many digits as the correct answer for the first time.

 historySpeed excludes attempts over 60 seconds.
 A time percentile (50th? 67th? 75th?) should be used to get a typical solution speed while excluding large outliers.
 This excludes very long solve times due to interruptions, and gives room for reported speed to improve as newer, faster times accumulate.

 TODO
 ====
   Should history be segmented by month to allow easily excluding older data? By week?
     Issue: We need thousands of attempts to get tens per problem, likely taking months to accumulate.
     
   Should speed be sorted to allow quick percentile extraction? (Probably)
   Alternatively, speed could be sorted by time and include only the most recent N attempts per problem, to get a "recent" sample.
   Accuracy could not be similarly filtered, however.
*/

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

  if (o === '+') {
    u = randomish(0, 12, u);
    l = randomish(0, 12, l);
    nextAnswer = u + l;
  } else if (o === '-') {
    u = randomish(0, 20, u);
    l = randomish(0, u, l);
    nextAnswer = u - l;
  } else if (o === 'x' || o === '*') {
    u = randomish(0, 12, u);
    l = randomish(0, 12, l);
    nextAnswer = u * l;
  } else { // (o === '/' || o === '÷')
    // Choose *factors* and compute product; no zero.
    nextAnswer = randomish(1, 12, nextAnswer);
    l = randomish(1, 12, l);
    u = nextAnswer * l;
  }

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

  // If correct, track progress, celebrate, and pick the next one
  if (a === nextAnswer) {
    today.count++;

    try {
      window.localStorage.setItem('today', JSON.stringify(today));
    } catch { }

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

        // Remove too-old entries
        const cutoff = dateString(addDays(new Date(), -60));
        for (let date in history) {
          if (date < cutoff) {
            delete history[date];
          }
        }

        storage.setItem("history", JSON.stringify(history));
      }
    }
  }
  catch { }
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