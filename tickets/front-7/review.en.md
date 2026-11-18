# Code review: CB-107, the patient record and its tabs

Tabs look like a piece of state, and the ticket asked for something stronger: each tab is a place with an address. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- A route with a parameter (`:id`) and a page that loads what the parameter names.
- Routes inside a route: one page that stays, and a part of it that changes with the rest of the address.
- Links that know whether they point at the current address.

## Why the reference is built this way

- The app declares one route, `patients/:id/*`. The `*` hands the rest of the address to `PatientRecord`, which decides between its tabs with a nested `<Routes>`. The page is the same component for both addresses, so changing tabs does not load the patient again.
- The tabs are `NavLink`s. Each is a real link (it can be opened in a new tab, copied, sent to a colleague), and React Router sets `aria-current="page"` on the current one. `end` on **Details** stops it from matching `/patients/1/appointments` as well.
- The patient is loaded once, by the page, and handed to the tabs as a prop. A third tab is one more `NavLink` and one more `<Route>`.
- The three outcomes of loading are explicit: loading, found, not found. The tabs are not rendered until there is a patient to show.

## Compare with what you built

- Did you keep the current tab in `useState`? It switches, and the address stays the same: no link to a tab, Back leaves the record, and a reload returns to the first tab. The ticket asked for an address per tab.
- Did you declare two separate routes in `App.tsx`, both rendering `PatientRecord` with a prop that says which tab? It works and the address is right. Every new tab is then a third copy of the route and of the prop, and the page has to be told from outside what its own address already says.
- Did you use a parent route with `<Outlet />` and child routes? That is the other standard way, as good as the nested `<Routes>`; the patient then travels through the outlet context.
- Did you use buttons with `navigate()` for the tabs? The address changes, and the tabs stop being links: no "open in new tab", and `aria-current` is yours to maintain.
- Did you forget `end`? Both tabs are then marked as current on the Appointments address.

## Watch for next time

- If a user could want to link to it, go back to it or reload on it, it belongs in the address.
- Load data at the level that stays on the screen, and pass it down to the parts that change.
