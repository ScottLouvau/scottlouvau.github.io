http://www.freesoundslibrary.com
"Free Sounds Library"
Free Sound Effects Site.
License: Attribution 4.0 International (CC BY 4.0). You are allowed to use sound effects free of charge and royalty free in your multimedia projects for commercial or non-commercial purposes.

'MPG Air Horn' from http://www.freesoundslibrary.com
Transcoding: ffmpeg -i mlg-air-horn.mp3 -c:a mp3 -b:a 96k -ac 1 -t 00:00:03 

ffmpeg -i applause-sound-effect.mp3 -c:a mp3 -b:a 96k -ac 1 -t 00:00:10 -af "afade=t=out:st=5:d=5" applause-sound-effect.96k.mp3

```
function toggleCalendar() {
  let calendar = document.getElementById("history-calendar");
  if (calendar) {
    document.body.removeChild(calendar);
  } else {
    // TODO: Decide how to combine HTML parts.
    //  - Month (1st and cell[0]) and Day
    //  - Value (Star icon or numeric value)
    // TODO: Consider developing Calendar layout and CSS separately first.

    let html = `<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>`;

    let endDate = now();
    let currentDate = addDays(startOfWeek(endDate), -21);

    html += `<tr>`;

    while (currentDate <= endDate) {      
      html += '<td>...</td>';

      if(currentDate.getDay() === 0) {
        html += `</tr><tr>`;
      }

      currentDate = addDays(currentDate, 1);
    }

    html += `</tr>`;

    calendar = document.createElement("table");
    calendar.id = "history-calendar";
    calendar.innerHTML = html;
    document.body.appendChild(calendar);
  }
}
```

```
/* Calendar to show recent history */

#history-calendar {
    border-collapse: collapse;    
    position: absolute;
    left: 1vw;
    right: 1vw;
    top: calc(var(--control-size) + 6px);
    bottom: 1vh;
    width: 98vw;
    background-color: white;
    border: solid 2px #888;
}

#history-calendar  tr th {
    font-weight: normal;
    font-size: 14px;
    background-color: #888;
    
}

#history-calendar  tr td, th {
    margin: 0;
    padding: 4px;
    width: 14%;
    border: solid 1px #BBB;
    vertical-align: top;
    font-size: 16px;
}

```

```
  <body>
  <svg style="display: none">
    <symbol id="calendar" viewBox="0 0 40 40">
      <path
        d="M7.792 36.667q-1.125 0-1.959-.834Q5 35 5 33.875v-25q0-1.125.833-1.937.834-.813 1.959-.813h2.333V3.333h2.917v2.792h13.916V3.333h2.917v2.792h2.333q1.125 0 1.959.813Q35 7.75 35 8.875v25q0 1.125-.833 1.958-.834.834-1.959.834Zm0-2.792h24.416v-17.5H7.792v17.5Zm0-20.25h24.416v-4.75H7.792Zm0 0v-4.75 4.75ZM20 23.333q-.708 0-1.188-.479-.479-.479-.479-1.187 0-.709.479-1.188Q19.292 20 20 20t1.188.479q.479.479.479 1.188 0 .708-.479 1.187-.48.479-1.188.479Zm-6.667 0q-.708 0-1.187-.479-.479-.479-.479-1.187 0-.709.479-1.188T13.333 20q.709 0 1.188.479T15 21.667q0 .708-.479 1.187-.479.479-1.188.479Zm13.334 0q-.709 0-1.188-.479T25 21.667q0-.709.479-1.188T26.667 20q.708 0 1.187.479.479.479.479 1.188 0 .708-.479 1.187-.479.479-1.187.479ZM20 30q-.708 0-1.188-.479-.479-.479-.479-1.188 0-.708.479-1.187.48-.479 1.188-.479t1.188.479q.479.479.479 1.187 0 .709-.479 1.188Q20.708 30 20 30Zm-6.667 0q-.708 0-1.187-.479-.479-.479-.479-1.188 0-.708.479-1.187.479-.479 1.187-.479.709 0 1.188.479T15 28.333q0 .709-.479 1.188T13.333 30Zm13.334 0q-.709 0-1.188-.479T25 28.333q0-.708.479-1.187.479-.479 1.188-.479.708 0 1.187.479.479.479.479 1.187 0 .709-.479 1.188T26.667 30Z" />
    </symbol>
  </svg>

  <div id="progress-outer">
    <div id="progress">
      <div id="controls">
        <svg id="toggle-history">
          <use href="#calendar"></use>
        </svg>
      </div>
    </div>
  </div>
  <div id="container">
    <div id="problem">
      <div id="upper">0</div>
      <div id="op">x</div>
      <div id="lower">0</div>
      <div id="line"></div>
      <div id="answer-box">
        <input id="answer" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="3" tabindex="0" title="answer" />
      </div>
    </div>    
  </div>
</body>
```

```
{ 
  settings: { goal: 5, op: '+', ... },
  today: { date: "2022-09-01", count: 15, telemetry: [
    ["5", "+", "3", 2640, true], ...
    [upper, op, lower, timeToSolveMs, wasEverIncorrect]
  ] },
  history: {
    "2022-08-31": { [same as 'today' for that date] }
  },

  telemetry: { 
    count: 120,    // Count of problems in telemetry data
    accuracy: {
      "+": { 
        "1": { 
          "1": { 45, 49 }, // 1+1 done 49 times, correct on first try 45/49 times.
          "2", { 21, 22 }, // 1+2 done 22 times, correct on first try 21/22 times.
          ...
        }, ...
      }, ... 
    },
    speed: {
      "+": {
        "1": { 
          "1": { 2640, 1420, 2130, 22000, ... }, // Time in Ms to correct answer for every 1+1 attempt.
        }
      }
    }
  }
}

 historyAccuracy will only capture the first attempt each time a problem is presented.
 historyAccuracy triggers when the answer is as many digits as the correct answer for the first time.

 historySpeed excludes attempts over 60 seconds.
 A time percentile (50th? 67th? 75th?) should be used to get a typical solution speed while excluding large outliers.
 This excludes very long solve times due to interruptions, and gives room for reported speed to improve as newer, faster times accumulate.
```