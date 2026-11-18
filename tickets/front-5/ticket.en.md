# CB-105: Make the patient menu close on a click outside and with Esc

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | Medium |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Patients (menu of a patient) |
| Labels | `patients`, `menu`, `keyboard` |
| Sprint | CB Sprint 2 |
| Created | 11/03/2026 09:20 |

## Description

Each patient in the list has a "⋯" button that opens a small menu: **Open record**, **Book appointment**, **Remove patient**. The menu opens, and that is all it does: the only way to close it is to click the same button again.

So we click somewhere else, the menu stays, we open the menu of another patient, and now two menus are open, one on top of the names. Marlene, who works only with the keyboard, presses Esc out of habit and nothing happens.

The menu was delivered half done. Please finish the closing.

## What is already there

- `client/src/components/PatientMenu.tsx` renders the button and, while its `open` state is true, the menu. The button already has `aria-haspopup`, `aria-expanded` and the label `Actions for <patient name>`; the menu has `role="menu"` and the same label.
- The button toggles the menu, the two links navigate, and **Remove patient** closes the menu and asks the page to remove the patient.
- The styles are in `client/src/components/PatientMenu.module.css`. Nothing in them needs to change.

## What to build

- **A click outside closes the menu.** Any click or tap on the page that is not on the button or inside the menu closes it. A click inside the menu, on an item or on its padding, does not.
- **Opening another menu closes this one.** At most one menu is open on the page.
- **Esc closes the menu** wherever the focus is, and the focus goes back to the "⋯" button of that menu, so the keyboard user continues from where they were.
- **A closed menu listens to nothing.** The page reacts to clicks and keys only while a menu is open; Esc with every menu closed changes nothing on the screen.
- The button keeps `aria-expanded` in step with the menu in every case above.

## Acceptance criteria

- [ ] A click anywhere else on the page closes the open menu.
- [ ] A click inside the menu does not close it, and its items still work.
- [ ] Opening the menu of another patient leaves one menu open.
- [ ] Esc closes the menu and the focus returns to its button.
- [ ] `aria-expanded` of the button is `false` whenever the menu is closed.

## Environment

- ClinicBook 1.0, Chrome
- Mouse and keyboard

## Activity

**Renata Siqueira** · 11/03/2026 09:41
> No animation, please. It only has to behave like every other menu we know.
