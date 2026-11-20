# CB-106: Build the time slot picker of the booking form

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | High |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Booking form |
| Labels | `booking`, `component` |
| Sprint | CB Sprint 2 |
| Created | 11/03/2026 13:10 |

## Description

To book or reschedule an appointment we type the time in a text field, "HH:MM". We have to know by heart when each doctor works and look at the agenda to see what is taken. We get it wrong: the server refuses a time outside the working hours, and nothing stops us from typing a time that another patient already has.

The server already knows the free times of each doctor on each day. We want the form to show them as options and let us pick one. The text field was always meant to be temporary.

## What is already there

- `listSlots(doctorId, day)` in `client/src/api/doctors.ts` asks `GET /api/doctors/:id/slots?day=` and gives the free times as texts, in order: `['08:00', '08:30', '10:00']`. A day the doctor does not work gives an empty list.
- `client/src/pages/BookingPage.tsx` is the form for booking and for rescheduling. It keeps the chosen time in the `time` state (`''` while none is chosen), which may come filled from the address (`&time=10:30`), and it sends `time` to the server. The temporary text field is marked there.
- The styles of forms are in `client/src/components/ui.module.css`; a component has its own `*.module.css` next to it (see `PatientMenu`).

## What to build

**The component.** `TimeSlotPicker` in `client/src/components/TimeSlotPicker.tsx`, exported by name, with the props:

| Prop | Type | Meaning |
| --- | --- | --- |
| `slots` | `string[]` | The free times, as `HH:MM`, in the order to show them |
| `value` | `string` | The chosen time, or `''` while none is chosen |
| `onChange` | `(time: string) => void` | Called with the time the user chooses |

- It shows one option per slot: a radio button (`<input type="radio">`) whose `value` is the time and whose label is the time. All of them belong to one group for the keyboard: the arrow keys move from one to the next.
- The options are inside an element with `role="radiogroup"` and the accessible name `Time`.
- The option equal to `value` is the checked one; with `value` equal to `''`, none is.
- The component does not keep the chosen time itself: it calls `onChange` and shows what it gets in `value`.
- With an empty `slots`, it shows the text `No free times on this day.` and no group.

**In the form.** `BookingPage` shows the picker in place of the text field, for booking and for rescheduling:

- it asks for the free times whenever the doctor or the day changes, and shows the picker with them;
- a time that came in the address, or that was chosen before the doctor or the day changed, stays chosen only if it is among the new free times;
- while no doctor or no day is chosen, there is nothing to pick from: a short text in the place of the picker is enough, and so is one while the times are loading.

## Acceptance criteria

- [ ] The form offers one option per free time of the chosen doctor on the chosen day, in order, in a group named `Time`.
- [ ] A time that is already taken is not offered.
- [ ] Choosing an option marks that one only, and **Book** books that time.
- [ ] A time in the address (`&time=10:30`) arrives chosen.
- [ ] The options work with the keyboard (Space chooses, the arrows move).
- [ ] A day the doctor does not work shows `No free times on this day.`
- [ ] Changing the doctor or the day changes the options.
- [ ] The reschedule form uses the same picker.

## Environment

- ClinicBook 1.0, Chrome

## Activity

**Renata Siqueira** · 11/03/2026 13:36
> Buttons side by side would be perfect, like the ones of the days in the agenda. The look is up to you; we care that we can only pick what is free.
