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

let settings = { goal: 40, pauseMs: 500, op: '+' };
let today = { date: dateString(new Date()), count: 0 };
let history = { };


/* LocalStorage saved data 'shape':
{ 
  settings: { goal: 5, op: '+' },
  today: { date: today, count: 0 },
  history: {
    "2022-08-31": { date: "2022-08-31", count: 28 }, ... [>= 60 days ago]
  }
}
*/

function dateString(date) {
  // 2022-08-31
  return date.toISOString().slice(0, 10);
}

function daysAgo(date, days) {
  let result = new Date(date);
  result.setDate(result.getDate() - days);
  return result;
}

function nextProblem() {
  let o = op.innerText;
  let u = null;
  let l = null;

  if (o === '+') {
    u = Math.floor(Math.random() * 12);
    l = Math.floor(Math.random() * 12);

    nextAnswer = u + l;
  } else if (o === '-') {
    u = Math.floor(Math.random() * 20);
    l = Math.floor(Math.random() * u);

    nextAnswer = u - l;
  } else if (o === 'x' || o === '*') {
    u = Math.floor(Math.random() * 12);
    l = Math.floor(Math.random() * 12);

    nextAnswer = u * l;
  } else { // (o === '/' || o === '÷')
    // No divide zero or divide by zero
    nextAnswer = Math.floor(Math.random() * 11) + 1;
    l = Math.floor(Math.random() * 11) + 1;
    
    u = nextAnswer * l;
  }

  upper.innerText = u;
  lower.innerText = l;
  answer.value = "";
}

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
}

function checkAnswer() {
  let a = +(answer.value);

  if (a === nextAnswer) {
    today.count++;

    try {
      window.localStorage.setItem('today', JSON.stringify(today));
    } catch { }

    showProgress();
    setTimeout(nextProblem, settings.pauseMs ?? 250);

    if (today.count > 0 && today.count <= 3 * settings.goal && (today.count % settings.goal) === 0) {
      setComplete.load();
      setComplete.play();
    } else {
      oneComplete.load();
      //oneComplete.play();
    }
  }
}

function showProgress() {
  // const first =  "linear-gradient(90deg, #c7e9c0, #41ab5d)";
  // const second = "linear-gradient(90deg, #fee6ce, #fd8d3c)";
  // const third = "linear-gradient(90deg, #fc9272, #ef3b2c)";

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

function loadState() {
  // Load stored settings, progress today, and historical progress.
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
        const cutoff = dateString(daysAgo(new Date(), 60));
        for (let date in history) {
          if(date < cutoff) {
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
  upper = document.getElementById("upper");
  lower = document.getElementById("lower");
  op = document.getElementById("op");
  answer = document.getElementById("answer");

  progress = document.getElementById("progress");
  progressOuter = document.getElementById("progress-outer");

  oneComplete = new Audio("mlg-air-horn.mp3");
  setComplete = new Audio("applause-sound-effect.mp3");

  loadState();

  // Reflect loaded state in UI
  op.innerText = settings.op;
  showProgress();

  // Hook up to check answer
  answer.focus();
  answer.addEventListener("input", checkAnswer);

  // Hook up to toggle operation
  op.addEventListener("click", nextOperation);

  nextProblem();
};