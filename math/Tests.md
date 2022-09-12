# Testcases

- [ ] Page loads without errors; problem is not 0+0.
  - [ ] Focus on answer box immediately.
  - [ ] Popup keyboard is a number keyboard, if supported (GBoard)
- [ ] Solve a Problem
  - [ ] Does bar draw longer?
  - [ ] Correct problem sound?
  - [ ] Green checkmark animation?
- [ ] Get a Problem wrong (write down what problem)
  - [ ] No sound/bar/animation
- [ ] Take over six seconds for a problem (write down what problem)
- [ ] Solve ten problems correctly.
- [ ] Click each toolbar icon
  - [ ] Do modals show?
  - [ ] Is rendering ok? (Good width, font size ok, no text over edges)
  - [ ] Does clicking anywhere outside close the modal?
  - [ ] Does clicking the close X work?
- [ ] Speed/Accuracy
  - [ ] Confirm values shown for problems answered.
  - [ ] Confirm colors correct for time/accuracy ranges.
- [ ] Settings
  - [ ] When changing sounds, do you hear them immediately?
  - [ ] When operaiton changes, is a new problem picked?
  - [ ] When goal changes, is goal bar redrawn?
  - [ ] Turn Volume to 0 and confirm respected. Change back.
  - [ ] Select 'None' and confirm no sound played, no errors.
- [ ] Share
  - [ ] Click mail icon; confirm email comes up with text populated.
  - [ ] Click clipboard; confirm text on clipboard and popup notification shown.
  - [ ] Click clipboar; confirm popup re-shows and re-hides.
- [ ] Click operation and confirm toggles through +, -, x, /.
- [ ] Check LocalStorage
  - [ ] Settings, including changes.
  - [ ] Today with problems to do (and redo).
- [ ] Reload page with Network Tools open
  - [ ] Confirm only selected sounds loaded (and nothing for 'None')
  - [ ] Confirm sounds are loaded asynchronously.
  - [ ] Does bar redraw for problem count previously done?
  - [ ] Do problems to goal. Were slow and incorrect problems re-given just before goal reached?



- [ ] Browser Resize
  - [ ] Confirm top bar resizes for space with reasonable minimum.
  - [ ] Confirm top bar icons big enough to touch on Mobile Phones.
  - [ ] Confirm problem stays centered under top bar
  - [ ] Confirm problem is big but never overflows available space.
  - [ ] Click each toolbar icon; confirm popups are big enough but don't overflow screen.



- [ ] In LocalStorage, change "today" entry date back.
  - [ ] Reload, confirm moved to history, fresh "today" started.

- [ ] Delete all LocalStorage

  - [ ] Confirm Page loads; bar empty; setting defaults reasonable.

  - [ ] Get a Problem Wrong; confirm "redo" populated, no error.

    

### Environments

- [ ] Chrome / Windows
- [ ] Edge / Windows
- [ ] Firefox / Windows
- [ ] Edge / MacOS
- [ ] Safari / MacOS
- [ ] Chrome / Android
- [ ] Edge / Android
- [ ] Safari / iOS
- [ ] Edge / iOS