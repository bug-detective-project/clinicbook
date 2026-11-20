# CB-103: An appointment booked for the 10th shows on the 9th

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Bug |
| Status | To Do |
| Priority | Highest |
| Reporter | Renata Siqueira (Front desk lead) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Agenda, patient record |
| Labels | `dates`, `agenda` |
| Sprint | CB Sprint 2 |
| Created | 10/03/2026 08:10 |

## Description

Every date on our screens is one day behind. I book an appointment for Tuesday the 10th; the agenda opens with the title "Monday, March 9", and the record of the patient says the appointment is on the 9th. The appointment itself sits in the right place: it is in the list of the 10th, under the wrong title.

Yesterday a patient came a day early because I read the date to her from the screen.

The strange part: Otávio opened the same agenda from the office in Lisbon and his screen was right. Here in São Paulo, on every computer of the front desk, it is wrong.

## Steps to reproduce

On a computer set to the time of São Paulo (UTC-3):

1. Open the agenda and click **Next day** until the address ends in `day=2026-03-10`.
2. Read the title of the page.
3. Open the record of a patient and look at the days of the appointments and at the birth date.

If your computer is in another time zone: the browser DevTools can pretend to be somewhere else (the **Sensors** panel, "Location", has "São Paulo").

## Expected result

The agenda of `2026-03-10` is titled "Tuesday, March 10", and every screen shows a day as the day it is, in São Paulo, in Lisbon or anywhere else.

## Actual result

In São Paulo, every date is shown as the day before: the title of the agenda, the days in the record of the patient, the birth date.

## Acceptance criteria

- [ ] On a computer in São Paulo, the agenda of a day is titled with that day.
- [ ] The record of a patient shows the days of the appointments and the birth date as they were registered.
- [ ] The first day of a month stays in its month.
- [ ] The dates stay right on computers ahead of UTC.

## Environment

- ClinicBook 1.0, Chrome
- Front desk computers: São Paulo (UTC-3). Wrong on all of them
- Lisbon office (UTC+0): right

## Activity

**Otávio Brandt** · 10/03/2026 08:47
> I checked the database with the support team: the appointment is stored as `2026-03-10`. The server sends `2026-03-10` too. Whatever happens, happens after that.
