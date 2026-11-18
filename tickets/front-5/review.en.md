# Code review: CB-105, a menu that closes like a menu

Opening a menu is one line of state. Closing it well is where the web platform comes in. Here is the reference approach, so you can compare it with yours.

## What this ticket was about

- Events that happen outside a component: the component has to listen on `document`, and it has to stop.
- Telling "inside" from "outside" with the DOM itself (`contains`), not with coordinates.
- Leaving the keyboard user where they were: closing with Esc and putting the focus back on the button.

## Why the reference is built this way

- One effect, tied to `open`. The listeners exist only while the menu is open, and the cleanup of the effect removes them when it closes or when the row disappears. A list of 200 patients adds zero listeners until someone opens a menu.
- `pointerdown` and not `click`: it fires for mouse, touch and pen, and it fires before the click, so the old menu is gone by the time the new one opens.
- `containerRef.current.contains(event.target)` covers the button and everything inside the menu, padding included, with one check.
- After Esc the focus goes to the button. Without that, the focus stays on an element that no longer exists and the next Tab starts from the top of the page.
- "One menu open at a time" needed no code of its own: a click on another button is a click outside.

## Compare with what you built

- Did you add the listeners once, for every menu, open or closed? It works and it makes every click on the page run one function per patient.
- Did you forget to remove them in the cleanup? Each open-and-close leaves a listener behind, and a removed row keeps answering.
- Did you close the menu on `blur`? Clicking an item of the menu blurs the button first, and the menu can close before the click arrives.
- Did you use a transparent layer over the page to catch the click? It also eats that click: the user has to click twice to reach what is under it.
- Did you keep "which menu is open" in the page, one state for the whole list? That is a good design too, and it makes "one at a time" explicit.

## Watch for next time

- Whenever a component adds a listener to `document` or `window`, write the removal in the same sitting.
- Try every new widget with the keyboard alone: open it, move inside it, leave it, and see where the focus lands.
