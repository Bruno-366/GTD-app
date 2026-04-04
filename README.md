# ✓ GTD App

A free, offline-first **Getting Things Done** app built with SvelteKit. Capture every thought, organise by context, and focus on what matters — no account or internet connection required.

![Landing page](https://github.com/user-attachments/assets/eea1dd7b-2cdb-44cb-a068-581af46a5769)

## Features

| View | Description |
|---|---|
| 📥 **Inbox** | Capture everything. Process it later with a clear mind. |
| ⚡ **Next Actions** | Tasks tagged with a `#context` — what you can do right now. |
| ⏱ **Do it Now** | All tasks estimated at ≤ 2 minutes, across every list. |
| 📁 **Projects** | Top-level tasks. Break them down with subtasks. |
| ⏳ **Waiting For** | Delegated tasks tracked with `@person`. |
| 🌟 **Someday / Maybe** | Ideas you're not ready to commit to yet. |
| 📅 **Calendar** | Time-sensitive tasks sorted by due date. |
| 📴 **Offline** | Works as a PWA — data stored locally in IndexedDB. |

### Smart task input

Add tasks using inline shortcuts as you type:

- `#context` → tags the task for **Next Actions**
- `@person` → tags the task for **Waiting For**
- `~5m` / `~2h` → sets an **estimated duration**

## Routes

| Path | Description |
|---|---|
| `/` | Landing page |
| `/app` | Inbox |
| `/app/next` | Next Actions |
| `/app/projects` | Projects |
| `/app/waiting` | Waiting For |
| `/app/someday` | Someday / Maybe |
| `/app/calendar` | Calendar |

> **Do it Now** tasks (≤ 2 minutes) appear as an inline banner on every view — no separate route.

## Accessibility

This app is built with [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/) guidelines in mind:

- All navigation links use `aria-current="page"` to indicate the active view.
- The sidebar `<nav>` is a labelled landmark (`aria-label="Main navigation"`).
- The **Do it Now** banner is a named region (`role="region" aria-label="Do it Now"`).
- Every form input and textarea has an accessible label (`aria-label` or `<label for>`).
- Task row interactive divs carry a descriptive `aria-label="Edit task: …"`.
- Decorative emoji are hidden from assistive technology with `aria-hidden="true"`.
- The completed-tasks toggle exposes its open/closed state via `aria-expanded`.
- Task lists are labelled (`aria-label="Active tasks"` / `"Completed tasks"`).

## Testing

Run the test suite (unit and component tests powered by [Vitest](https://vitest.dev) and [@testing-library/svelte](https://testing-library.com/docs/svelte-testing-library/intro/)):

```sh
npm test
```

Watch mode (re-runs on file changes):

```sh
npm run test:watch
```

Coverage report:

```sh
npm run test:coverage
```

## Developing

```sh
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Building

```sh
npm run build
```

Preview the production build:

```sh
npm run preview
```

### GitHub Pages deployment

Set the `BASE_PATH` environment variable to the repository name when building:

```sh
BASE_PATH=/GTD-app npm run build
```

## Type-checking

```sh
npm run check
```
