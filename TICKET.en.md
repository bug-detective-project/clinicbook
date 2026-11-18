# CB-101: Clicking "Book" twice books two appointments

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | High |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Booking form |
| Labels | `booking`, `form` |
| Sprint | CB Sprint 2 |
| Created | 09/03/2026 08:40 |

## Description

The mouse of the second desk double-clicks by itself now and then, and the internet of the clinic is slow in the morning. Put the two together and we get the same patient twice in the agenda, at the same time, with the same doctor.

I found three of these pairs last week. Each time we had to cancel one by hand, and one patient got two reminders and called us to ask which appointment was the real one.

## Steps to reproduce

1. Open **Book appointment** and choose a patient, a doctor, a day and a time.
2. Click **Book** twice, quickly (or double-click it).
3. Look at the agenda of that day.

It is easier to see with a slow connection: in the browser DevTools, the Network tab can slow the page down.

## Expected result

One appointment, however many times I click.

## Actual result

Two appointments for the same patient, at the same time. The Network tab shows two requests to book.

## Acceptance criteria

- [ ] A double click on **Book** sends one request and books one appointment.
- [ ] While the booking is being sent, more clicks on **Book** do nothing.
- [ ] When the server refuses the booking, the form shows the reason and I can send it again.

## Environment

- ClinicBook 1.0, Chrome
- More frequent on the slow connection of the morning

## Activity

**Renata Siqueira** · 09/03/2026 09:05
> We also press Enter in the form when we are in a hurry. Same result as the double click.
