# Math Facts

[MathFacts](https://relentlessoptimizer.com/math) is a free, ad-free, privacy respecting app to help kids practice math facts. 

* Supports addition, subtraction, multiplication, and division.

* Low stress - no timer, no response to wrong answers.

* Locally saves work history and speed and accuracy per problem.

* Fun sounds

* Use 'Share' to send your practice record to your teacher easily.

  

## 'Share' Icon Reference

The 'Share' button generates text like this:

```
2022-09-12 | 40 | +

📅
⬛⬛⬛🟨⬛🟨⬛
⬛⬛

🎯 🟦🟦🟨🟦🟩🟩🟨🟦🟦🟦🟩🟩🟦
⚡ 🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟦🟩🟦
```

This is designed to be something you can email to a teacher to quickly show proof of practice time and to give your teacher a very brief summary of your speed and accuracy over the last two weeks. Sending an email or photo of your results makes it easy to send them to your teacher without anyone having to create accounts or manage passwords.

Here is what each part of the report means:

### Top Line

```
2022-09-12: The report was generated on September 12th, 2022.
40: The current goal (problems per day) is 40.
+: The current operation being practiced is addition.
```

### 📅 Shows work on this device in the last two weeks.
```
⬛: No goals reached. (< 40 problems solved)
🟧: 1x Goal Reached (40 problems; 'Bronze').
⬜: 2x Goal Reached (80 problems; 'Silver').
🟨: 3x Goal Reached (120 problems; 'Gold').
```
In the above example, I did at least 120 problems last Wednesday and Friday.



### 🎯 Accuracy per Group \[0-12\]

The first box is for zero facts (N+0 and 0+N). The second is for one facts (N+1, 1+N), all the way up to 12.

```
⬛: No problems done for group
🟦: >= 95% correct
🟩: >= 90% correct
🟨: >= 75% correct
🟥: < 75% correct
```
Some answers will be incorrect just due to typing errors. Each problem given is marked "initially incorrect" if the first answer with the right number of digits was not the correct answer. (So, "4 x 3" is incorrect if the first time two digits are in the answer box, the value wasn't "12".)

The example above shows accuracy between 75% and 90% for +2 facts and +6 facts, though in my case, they were just typing mistakes.



### ⚡ Speed per Group \[0-12\]

The first box is for zero facts (N+0 and 0+N). The second is for one facts (N+1, 1+N), all the way up to 12.
The 75th percentile time-to-correct-answer is chosen. This indicates how quickly the student solved most problems for the fact group.

```
⬛: No problems done for group
🟦: Under two seconds
🟩: Under three seconds
🟨: Under six seconds
🟥: Longer
```
The example above shows that all groups were solved in under two seconds except +11 facts, which took between two and three seconds.



## US "Common Core" Math Fact Standards

http://www.corestandards.org/Math/Content/OA/

"2.OA.B.2
Fluently add and subtract within 20 using mental strategies. By end of Grade 2,
know from memory **all sums of two one-digit numbers**."

"3.OA.C.7 
Fluently multiply and divide within 100, using strategies such as the relationship
between multiplication and division (e.g., knowing that 8 × 5 = 40, one knows 40
÷ 5 = 8) or properties of operations. By the end of Grade 3, know from memory
**all products of two one-digit numbers.**"

---

## Attribution

All sounds are from http://www.freesoundslibrary.com, some with (slight) editing.
License: Attribution 4.0 International (CC BY 4.0).

Icons are from https://fonts.google.com/icons.
LICENSE: Apache License 2.0 [http://www.apache.org/licenses/LICENSE-2.0]

## Cheat Sheet

#### Audio Transcoding

'MPG Air Horn' from http://www.freesoundslibrary.com
Transcoding: ffmpeg -i \<inFile\> -c:a mp3 -b:a 96k -ac 1 \<outFile\>
-t 00:00:01 [transcode from start offset; place before -i argument]
-ss 00:00:05 [transcode this duration]
