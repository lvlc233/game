---
name: twine-project-master
description: Master orchestration skill for Twine 2 interactive narrative projects using SugarCube story format, built on Electron+React+Vite architecture. Use when starting or managing a complete Twine-based interactive fiction project that spans story editing, SugarCube scripting, and desktop app distribution. Coordinates twinejs-core, twine-sugarcube, and electron-react-vite skills.
---

# Twine Project Master Skill

Orchestration guide for projects that combine Twine 2 editor technology, SugarCube interactive narratives, and Electron desktop deployment.

## Project Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Twine 2 Editor (GUI)                       │
│                  (twinejs-core skill)                       │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │ Story List  │  │ Story Map   │  │ Passage Editor      │  │
│  │  (React)    │  │  (React)    │  │  (CodeMirror 5)       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│                                                             │
│  State: react-hook-thunk-reducer  Routing: react-router v5 │
│  Build: Vite                      i18n: i18next             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               SugarCube Story Format Runtime                   │
│                  (twine-sugarcube skill)                     │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ Passages (HTML)                                      │    │
│  │  • Macro system (<<if>>, <<set>>, <<goto>>, etc.)   │    │
│  │  • Variable state ($story, _temp)                   │    │
│  │  • Save/load system                                  │    │
│  │  • Custom CSS + JavaScript                           │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                             │
│  Story Data Format: <tw-storydata> + <tw-passagedata>     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│               Electron Desktop Application                   │
│              (electron-react-vite skill)                   │
│  ┌─────────────────┐  ┌─────────────────────────────────┐   │
│  │ Main Process    │  │ Renderer Process (React UI)     │   │
│  │ • File I/O        │  │ • Twine GUI                     │   │
│  │ • Native menus    │  │ • Story preview                 │   │
│  │ • Auto-updater    │  │ • Format integration            │   │
│  │ • IPC bridge      │  │                                 │   │
│  └─────────────────┘  └─────────────────────────────────┘   │
│                                                             │
│  Packaging: electron-builder  Security: contextBridge      │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack Summary

| Layer | Technology | Purpose | Skill |
|-------|-----------|---------|-------|
| **UI Framework** | React 16 + TypeScript | Component-based GUI | `twinejs-core` |
| **Build System** | Vite + SWC | Fast dev/bundling | `electron-react-vite` |
| **State** | react-hook-thunk-reducer | Story/passage state | `twinejs-core` |
| **Routing** | react-router-dom v5 | Story editor routes | `twinejs-core` |
| **Editor** | CodeMirror 5 | Passage text editing | `twinejs-core` |
| **i18n** | i18next | Multi-language UI | `twinejs-core` |
| **Story Runtime** | SugarCube v2 | Interactive narrative engine | `twine-sugarcube` |
| **Desktop Shell** | Electron 41 | Native app wrapper | `electron-react-vite` |
| **Packaging** | electron-builder | .exe/.dmg/.AppImage | `electron-react-vite` |

## Development Workflow

### 1. Story Authoring (SugarCube)

Create interactive narrative content using SugarCube macros in Twine 2 or Twee format.

**Entry**: Load `twine-sugarcube` skill.

Key deliverables:
- `.html` (Twine archive) or `.tw` (Twee source)
- Custom `<<macros>>` for game mechanics
- `StoryJavaScript` for runtime config
- `StoryStylesheet` for visual styling

### 2. Editor Enhancement (twinejs)

Extend the Twine 2 editor to support custom workflows.

**Entry**: Load `twinejs-core` skill.

Common extensions:
- Custom passage editor toolbar buttons
- New dialogs for story metadata
- Additional story format loaders
- Custom story map interactions

### 3. Desktop Distribution (Electron)

Package the Twine editor or a standalone story player as a desktop app.

**Entry**: Load `electron-react-vite` skill.

Distribution targets:
- Windows (.exe, .msi via NSIS)
- macOS (.dmg, .zip with notarization)
- Linux (.AppImage, .deb)

## Data Flow

```
Author creates story in Twine GUI
        │
        ▼
┌──────────────────┐
│ Twine saves HTML │
│ (story + format) │
└──────────────────┘
        │
        ▼
SugarCube runtime loads in browser/Electron
        │
        ▼
Player interacts with passages via macro system
        │
        ▼
State changes trigger saves via SugarCube API
        │
        ▼
Electron main process handles file I/O (desktop only)
```

## Integration Points

### Story Format Loading

Twine 2 loads SugarCube as a `format.js` file:

```
public/
└── story-formats/
    └── sugarcube-2/
        └── format.js    <- SugarCube runtime bundle
```

The format object exposes:
- `name`: "SugarCube"
- `version": "2.36.1"
- `source`: HTML template with `{{STORY_NAME}}` and `{{STORY_DATA}}` placeholders

### HTML Output Structure

Twine compiles stories to a single HTML file:

```html
<!DOCTYPE html>
<html>
<head>
  <title>Story Title</title>
  <!-- SugarCube core libraries (jQuery, ES5/6 shims, etc.) -->
  <script>...</script>
  <!-- Normalization + UI styles -->
  <style>...</style>
</head>
<body>
  <div id="init-screen">...</div>
  <tw-storydata name="..." startnode="..." ...>
    <style role="stylesheet" id="twine-user-stylesheet">...</style>
    <script role="script" id="twine-user-script">...</script>
    <tw-passagedata pid="1" name="Start" ...>...</tw-passagedata>
    <tw-passagedata pid="2" name="Help" ...>...</tw-passagedata>
    <!-- ... more passages -->
  </tw-storydata>
</body>
</html>
```

### Electron IPC for Story Files

When running as Electron app:

```typescript
// Renderer requests file load
electronAPI.readFile(storyPath)
  .then(html => loadStory(html))
  .catch(err => showError(err));

// Main process handles native dialogs
ipcMain.handle('show-open-dialog', async (_, options) => {
  return dialog.showOpenDialog(options);
});
```

## Project File Organization

```
my-twine-project/
├── story/
│   ├── source.tw           # Twee source (optional)
│   ├── story.html          # Compiled Twine HTML
│   ├── custom.css          # Story Stylesheet
│   └── custom.js           # Story JavaScript
├── editor/                   # Twine editor extensions (optional)
│   └── src/
├── desktop/                  # Electron app (optional)
│   ├── src/
│   ├── electron/
│   ├── vite.config.mts
│   └── package.json
└── docs/
```

## Related Skills

| Skill | When to Use |
|-------|-------------|
| `twinejs-core` | Working with Twine 2 editor source, React components, story map, passage editing, state management |
| `twine-sugarcube` | Writing SugarCube macros, managing story variables, implementing save/load, styling passages |
| `electron-react-vite` | Packaging as desktop app, implementing native file dialogs, auto-updater, IPC communication |

## Common Tasks

### Task: Convert Twee to Twine HTML

Use `tweego` compiler:

```bash
tweego -o story.html story.tw --format=./sugarcube-2/format.js
```

### Task: Add Custom Story Format

1. Build SugarCube from source (`npm install && npm run build`)
2. Copy `dist/sugarcube-2/format.js` to `public/story-formats/sugarcube-2/`
3. Register in Twine format loader

### Task: Debug SugarCube Runtime

```javascript
// In StoryJavaScript
Config.debug = true;

// Access debug bar in running story
// View State.variables in browser console
console.log(State.variables);
```

### Task: Export for Desktop

```bash
cd desktop/
npm run build:electron
# Output in dist/:
#   MyApp.exe (Windows)
#   MyApp.dmg (macOS)
#   MyApp.AppImage (Linux)
```

### Task: Localize Editor

1. Add locale JSON in `public/locales/{lang}/translation.json`
2. Register in `src/util/i18n.ts`
3. Use `useTranslation()` hook in components

## Important Notes

- **Node >= 20, npm >= 10** required for twinejs development
- **Hardware acceleration** can be disabled in Electron prefs for compatibility
- **Context isolation** is mandatory for Electron security; use preload bridge
- **Story IFID** should remain stable across imports/exports
- **Save compatibility** depends on SugarCube version; do not downgrade mid-project
- **History states**: Use `Config.history.maxStates` carefully in command-loop games

## Version Reference

| Component | Version Used in Reference Project |
|-----------|-----------------------------------|
| Twine | 2.5.1 |
| SugarCube | 2.36.1 |
| twinejs (editor) | 2.12.0 |
| React | 16.14.0 |
| Electron | 41.2.0 |
| Vite | 5.x |
| TypeScript | 5.x |
| CodeMirror | 5.65 |
