# CB-107: Build the route of the patient record, with tabs

| Field | Value |
| --- | --- |
| Project | ClinicBook (CB) |
| Issue type | Story |
| Status | To Do |
| Priority | High |
| Reporter | Dr. Helena Prado (Clinical director) |
| Track | Front-end |
| Affects version | 1.0 |
| Component | Patients (record) |
| Labels | `patients`, `routes`, `tabs` |
| Sprint | CB Sprint 2 |
| Created | 12/03/2026 08:30 |

## Description

Every name in the agenda and every **Open record** in the list of patients leads to "Page not found". The record of a patient was planned from the start, its two parts are written, and the page that holds them never was.

I want to open a patient and see their data, and switch to their appointments, past and future. And I want to send a colleague the link to exactly what I am looking at: "look at the appointments of this patient" has to be an address, not a set of instructions.

## What is already there

- `PatientDetails` (`client/src/components/PatientDetails.tsx`) shows the CPF, the health plan, the phone, the e-mail and the birth date of a patient, and has **Edit** and **Remove**. It takes the `patient` and `onChange`, which it calls with the patient as saved after an edit. `PatientAppointments` (`client/src/components/PatientAppointments.tsx`) loads and lists the appointments of a patient, with **Book appointment**. It takes the `patient`.
- `getPatient(id)` in `client/src/api/patients.ts` gives one patient, and fails with an `ApiError` whose `status` is 404 when the patient does not exist.
- The routes of the app are in `client/src/App.tsx`. The links to `/patients/<id>` already exist in the agenda, in the menu of each patient and nowhere else.
- `client/src/components/Layout.tsx` shows how the main navigation marks the current page: `NavLink` of React Router sets `aria-current="page"` on the link of the current address.

## What to build

A page for the record of a patient, `PatientRecord` in `client/src/pages/PatientRecord.tsx`, and its routes:

| Address | Shows |
| --- | --- |
| `/patients/:id` | The record on the **Details** tab (`PatientDetails`) |
| `/patients/:id/appointments` | The record on the **Appointments** tab (`PatientAppointments`) |

- The page loads the patient of the address and shows the name as the title of the page (a heading of level 2, like the other screens).
- Under the title, a navigation with the accessible name `Patient record` has two links, **Details** and **Appointments**, each to its address. The link of the tab on the screen has `aria-current="page"`; the other one does not.
- Changing tabs changes the address and keeps the title; the patient is not loaded again for it. Back and Forward of the browser move between the tabs, and reloading the page stays on the same tab.
- Another id in the address shows another patient.
- For a patient that does not exist, on either address, the page shows the heading `Patient not found` and a link `Back to the patients` to `/patients`, with no tabs.
- While the patient is loading, a short text is enough.

## Acceptance criteria

- [ ] `/patients/:id` shows the name of the patient and the Details tab.
- [ ] `/patients/:id/appointments` opens straight on the appointments of the patient, also after a reload.
- [ ] The two tabs are links inside a navigation named `Patient record`, and only the current one has `aria-current="page"`.
- [ ] Back and Forward of the browser move between the tabs.
- [ ] A patient that does not exist shows `Patient not found` and the way back.
- [ ] **Open record** in the list of patients and the names in the agenda open the record.
- [ ] The other addresses of the app work as before, including "Page not found" for an unknown address.

## Environment

- ClinicBook 1.0, Chrome

## Activity

**Dr. Helena Prado** · 12/03/2026 08:52
> Two tabs for now. We will ask for a third one (exams) later, so please make it easy to add.
