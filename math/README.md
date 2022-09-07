Math Target References:

https://www.k12.wa.us/sites/default/files/public/mathematics/assessment/grade2/mathstandards_grade2.pdf
http://www.corestandards.org/Math/Content/OA/

"2.OA.B.2
Fluently add and subtract within 20 using mental strategies. By end of Grade 2,
know from memory **all sums of two one-digit numbers**."

"3.OA.C.7 
Fluently multiply and divide within 100, using strategies such as the relationship
between multiplication and division (e.g., knowing that 8 × 5 = 40, one knows 40
÷ 5 = 8) or properties of operations. By the end of Grade 3, know from memory
**all products of two one-digit numbers.**"

-> WA Math Goals are for one digit numbers (0-9). Only addition and multiplication seem to be listed as memorized facts.

---

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
  <div id="control-bar">
    <!-- 
    Google Material Design Icons [https://fonts.google.com/icons]
    LICENSE: Apache License 2.0 [http://www.apache.org/licenses/LICENSE-2.0]
    -->
    <svg id="calendar" viewBox="0 0 40 40">    
      <path d="M7.792 36.667q-1.125 0-1.959-.834Q5 35 5 33.875v-25q0-1.125.833-1.937.834-.813 1.959-.813h2.333V3.333h2.917v2.792h13.916V3.333h2.917v2.792h2.333q1.125 0 1.959.813Q35 7.75 35 8.875v25q0 1.125-.833 1.958-.834.834-1.959.834Zm0-2.792h24.416v-17.5H7.792v17.5Zm0-20.25h24.416v-4.75H7.792Zm0 0v-4.75 4.75ZM20 23.333q-.708 0-1.188-.479-.479-.479-.479-1.187 0-.709.479-1.188Q19.292 20 20 20t1.188.479q.479.479.479 1.188 0 .708-.479 1.187-.48.479-1.188.479Zm-6.667 0q-.708 0-1.187-.479-.479-.479-.479-1.187 0-.709.479-1.188T13.333 20q.709 0 1.188.479T15 21.667q0 .708-.479 1.187-.479.479-1.188.479Zm13.334 0q-.709 0-1.188-.479T25 21.667q0-.709.479-1.188T26.667 20q.708 0 1.187.479.479.479.479 1.188 0 .708-.479 1.187-.479.479-1.187.479ZM20 30q-.708 0-1.188-.479-.479-.479-.479-1.188 0-.708.479-1.187.48-.479 1.188-.479t1.188.479q.479.479.479 1.187 0 .709-.479 1.188Q20.708 30 20 30Zm-6.667 0q-.708 0-1.187-.479-.479-.479-.479-1.188 0-.708.479-1.187.479-.479 1.187-.479.709 0 1.188.479T15 28.333q0 .709-.479 1.188T13.333 30Zm13.334 0q-.709 0-1.188-.479T25 28.333q0-.708.479-1.187.479-.479 1.188-.479.708 0 1.187.479.479.479.479 1.187 0 .709-.479 1.188T26.667 30Z" />
    </svg>
    <svg id="speed-chart" viewBox="0 0 40 40">
      <path d="M17.125 26.25q.958.958 2.687.917 1.73-.042 2.563-1.292l9.083-14.083L17.5 21q-1.208.792-1.292 2.542-.083 1.75.917 2.708Zm2.833-19.542q2.375 0 4.854.73 2.48.729 4.73 2.437l-2.5 1.708q-1.709-1.083-3.625-1.604-1.917-.521-3.459-.521-5.75 0-9.791 4.084-4.042 4.083-4.042 9.916 0 1.834.5 3.667.5 1.833 1.417 3.417h23.75q.958-1.5 1.458-3.417.5-1.917.5-3.792 0-1.666-.458-3.479-.459-1.812-1.584-3.396l1.75-2.5q1.459 2.209 2.23 4.5.77 2.292.854 4.667.041 2.458-.542 4.667-.583 2.208-1.708 4.083-.459.917-1.104 1.187-.646.271-1.48.271H8.167q-.75 0-1.479-.375-.73-.375-1.105-1.083-1.083-1.958-1.666-4.021-.584-2.062-.584-4.396 0-3.458 1.313-6.52 1.312-3.063 3.562-5.334 2.25-2.271 5.292-3.583 3.042-1.313 6.458-1.313Zm-.166 13.542Z"/>
    </svg>
    <svg id="accuracy-chart" viewBox="0 0 40 40">
      <path d="m14.375 37.5-3.167-5.375-6.166-1.333.666-6.125L1.667 20l4.041-4.625-.666-6.167 6.166-1.291L14.375 2.5 20 5.042 25.625 2.5l3.167 5.417 6.166 1.291-.666 6.167L38.333 20l-4.041 4.667.666 6.125-6.166 1.333-3.167 5.375L20 34.958Zm1.25-3.625L20 32.042l4.5 1.833 2.625-4.083 4.792-1.209-.459-4.875L34.708 20l-3.25-3.792.459-4.875-4.792-1.125-2.708-4.083L20 7.958l-4.5-1.833-2.625 4.083-4.792 1.125.459 4.875L5.292 20l3.25 3.708-.459 4.959 4.792 1.125ZM20 20Zm-1.792 5.667 9.459-9.375-2.042-1.959-7.417 7.375-3.833-3.916-2.042 2Z"/>
    </svg>
    <svg id="sound-is-on" viewBox="0 0 40 40">
      <path d="M23.333 34.542v-2.875q3.959-1.125 6.417-4.355 2.458-3.229 2.458-7.354t-2.458-7.375q-2.458-3.25-6.417-4.333V5.375q5.167 1.167 8.417 5.229Q35 14.667 35 19.958q0 5.292-3.25 9.354-3.25 4.063-8.417 5.23ZM5 25V15h6.667L20 6.667v26.666L11.667 25Zm17.792 1.875V13.042q2.166.791 3.437 2.708Q27.5 17.667 27.5 20q0 2.292-1.292 4.208-1.291 1.917-3.416 2.667Zm-5.584-13.292-4.333 4.209H7.792v4.416h5.083l4.333 4.25Zm-4 6.417Z"/>
    </svg>
    <svg id="sound-is-off" viewBox="0 0 40 40">
      <path d="m33.583 37.667-5.333-5.334q-1.125.75-2.417 1.313-1.291.562-2.708.896v-2.875q.833-.25 1.625-.563.792-.312 1.5-.771l-6.458-6.458v9.458L11.458 25H4.792V15h6.125L2.125 6.208l2-1.958 31.417 31.417ZM32.458 28l-2-2q.792-1.375 1.188-2.896.396-1.521.396-3.146 0-4.166-2.438-7.458-2.437-3.292-6.479-4.25V5.375q5.167 1.167 8.417 5.229 3.25 4.063 3.25 9.354 0 2.167-.584 4.209-.583 2.041-1.75 3.833Zm-5.583-5.583-3.75-3.75V13.25q1.958.917 3.063 2.75 1.104 1.833 1.104 4 0 .625-.104 1.229-.105.604-.313 1.188Zm-7.083-7.084L15.458 11l4.334-4.333Zm-2.75 11.25v-5.458l-3.334-3.333H7.583v4.416h5.084Zm-1.667-7.125Z"/>
    </svg>
    <svg id="settings" viewBox="0 0 40 40">
      <path d="m15.917 36.667-.792-5.292q-.708-.25-1.437-.687-.73-.438-1.355-.896L7.417 32l-4.125-7.208L7.75 21.5q-.083-.333-.104-.75-.021-.417-.021-.75t.021-.75q.021-.417.104-.75l-4.458-3.292L7.417 8l4.916 2.208q.625-.458 1.375-.896.75-.437 1.417-.687l.792-5.292h8.166l.792 5.292q.708.25 1.458.667.75.416 1.334.916L32.583 8l4.125 7.208-4.458 3.209q.083.375.104.791.021.417.021.792 0 .375-.021.771t-.104.771l4.417 3.25L32.583 32l-4.916-2.208q-.625.458-1.355.916-.729.459-1.437.667l-.792 5.292Zm4.125-11.125q2.291 0 3.916-1.625T25.583 20q0-2.292-1.625-3.917t-3.916-1.625q-2.334 0-3.959 1.625T14.458 20q0 2.292 1.625 3.917t3.959 1.625Z"/>
    </svg>
  </div>
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