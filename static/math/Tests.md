# Testcases

- [ ] Open Page in InPrivate Tab (no saved data)
- [ ] Verify focus is on answer box immediately.
- [ ] Click each toolbar icon and verify the modals come up (no errors).
  - [ ] Close modals by clicking outside or clicking X; verify both work.
  - [ ] Verify focus back on answer box after modals closed.

- [ ] Click Settings
  - [ ] Set goal to 20 problems.
  - [ ] Change a sound and verify the new sound is played immediately.
  - [ ] Change the volume and verify the current sound is played at the new volume.
  - [ ] Change each setting; refresh page, verify all settings restored.

- [ ] Solve a Problem
  - [ ] Does bar draw longer?
  - [ ] Correct problem sound at correct volume?
  - [ ] Green checkmark animation?
- [ ] Solve ten problems correctly.
- [ ] Get one problem of each operation wrong
  - [ ] Click operator to toggle through.

- [ ] Check LocalStorage
  - [ ] Settings, including changes.
  - [ ] Today with problems to do (and redo).
- [ ] Finish problem set to reach goal.
  - [ ] Verify wrong problems given to you again just before the goal.
  - [ ] Verify getting a problem wrong again leaves it for the next end-of-goal.
  - [ ] Verify goal sound.
  - [ ] Verify operation flips back to the one from before the redos.

- [ ] Speed/Accuracy
  - [ ] Confirm values shown for problems answered.
  - [ ] Confirm colors correct for time/accuracy ranges.

- [ ] Share
  - [ ] Click mail icon; confirm email comes up with text populated.
  - [ ] Click clipboard; confirm text on clipboard and popup notification shown.
  - [ ] Click clipboard; confirm popup re-shows and re-hides.

- [ ] Reload page with Network Tools open
  - [ ] Confirm only selected sounds loaded (and nothing for 'None')
  - [ ] Confirm sounds are loaded asynchronously.
  - [ ] Does bar redraw for problem count previously done?
  - [ ] Solve a problem. Verify sound not reloaded each time.


- [ ] Browser Resize
  - [ ] Confirm top bar resizes for space with reasonable minimum.
  - [ ] Confirm top bar icons big enough to touch on Mobile Phones.
  - [ ] Confirm problem stays centered under top bar
  - [ ] Confirm problem is big but never overflows available space.
  - [ ] Click each modal from toolbar icons; confirm popups are big enough but don't overflow screen.
  - [ ] Test landscape and portrait dimensions.

- [ ] In LocalStorage, change "today" entry date back.
  - [ ] Reload, confirm moved to history, fresh "today" started.
  - [ ] Change today date again. Do a problem.
    - [ ] Verify today stored again.
    - [ ] Verify bar reset to one problem done for today.

- [ ] Disable all Cookies
  - [ ] Verify no error when site first loaded.
  - [ ] Verify warning message when doing a problem or changing a setting.
  - [ ] Verify settings changes work for this session.

- [ ] QueryString: Try index.html?o=x&g=20&v=0
  - [ ] Verify volume off; goal 20; operation = x
  - [ ] Verify session changes >> URL >> localStorage

- [ ] JavaScript turned off (need fallback error)
 
### Environments

- [ ] Chrome / Windows
- [ ] Edge / Windows
- [ ] Edge / MacOS
- [ ] Safari / MacOS
- [ ] Firefox / MacOS
- [ ] Chrome / Android
- [ ] Edge / Android
- [ ] Safari / iOS
- [ ] Edge / iOS