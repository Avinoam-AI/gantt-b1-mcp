# B1 Project Gantt

An interactive project-management Gantt app for **SAP Business One**, backed by the B1 MCP server. Browse B1 projects, view their stages on a drag/resize Gantt chart, edit stage details, and (where B1 permits) save changes back.

**Stack:** React 19 + TypeScript + Vite · `@ui5/webcomponents-react` (SAP Fiori) · Express backend · SAP B1 Service Layer via MCP.

## Architecture

```
gantt-b1-mcp/
├── server/
│   ├── index.ts     Express API (port 3001): /api/projects, /api/projects/:id (GET, PATCH)
│   └── b1mcp.ts     MCP Streamable-HTTP client (session init, tool calls, JSON extraction)
└── src/
    ├── App.tsx              Shell, toolbar, project header KPIs, save/error bars, theme toggle
    ├── api/client.ts        Typed fetch wrappers
    ├── hooks/               useProjects, useProject (load + local edits + save)
    ├── types/b1.ts          B1 DTOs, status colors/labels
    └── components/          ProjectPicker, GanttChart, GanttBar, StageEditor, IssueList
```

The frontend talks only to the local Express API (`/api/*`, proxied by Vite). The Express layer translates between our DTOs and B1 Service Layer entities through the MCP tools `b1_read` / `b1_write`.

## Running

Two processes. From `C:\Users\I025037\gantt-b1-mcp`:

```powershell
# Backend (port 3001) — discovers B1 MCP tools on startup and logs them
.\node_modules\.bin\tsx.cmd server/index.ts

# Frontend (port 5173) — in a second terminal
.\node_modules\.bin\vite.cmd
```

Then open http://localhost:5173. If the B1 MCP server is unreachable the backend falls back to mock data so the UI still runs.

- B1 MCP endpoint: `http://b1x.only.sap:3000/mcp` (configured in `~/.claude/settings.json`).
- Type-check: `.\node_modules\.bin\tsc.cmd --noEmit -p tsconfig.app.json`

## B1 data model (ProjectManagements)

- Project: `AbsEntry`, `ProjectName`, `BusinessPartnerName`, `StartDate`, `DueDate`, `FinishedPercent`, `ProjectStatus`
- `PM_StagesCollection`: `LineID`, `StageID`, `Description`, `StartDate`, `CloseDate`, `PercentualCompletness` (contribution weight, sums ≤ 100%), `IsFinished` (`tYES`/`tNO`), `DependsOnStage1`, `ExpectedCosts`
- `PM_OpenIssuesCollection`: `StageID`, `Remarks`, `Priority`, `Closed`

## Known limitation — finished stages block saves

**SAP B1 rejects any write to a ProjectManagement document that contains a finished stage** (`IsFinished: tYES`), with:

```
-5002  [PM_StagesCollection.FinishedDate][line: N]  'Finished stages cannot be changed.'
```

This fires for *every* payload shape — full/partial collection, `FinishedDate` stripped or key-only, and even a top-level field change with no collection at all. It is a whole-document server-side re-validation, not a payload problem, and cannot be worked around from the client. Projects with **no** finished stages save normally.

The app handles this gracefully: the backend returns HTTP 409 with a clear message, the UI shows it in a dismissible red bar, and a blue info bar warns up front when the selected project contains a finished stage (explore-only).
