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
| `/app/doitnow` | Do it Now |
| `/app/projects` | Projects |
| `/app/waiting` | Waiting For |
| `/app/someday` | Someday / Maybe |
| `/app/calendar` | Calendar |

## Developing

Install dependencies and start the dev server:

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
