---
name: twinejs-core
description: Twine 2 (twinejs) interactive story editor development. Use when working with the Twine 2 editor codebase, building custom story formats, extending the Twine GUI, or developing interactive narrative tools with passage-based editing, story maps, and format integration. Covers the React/TypeScript/Electron/Vite architecture of the Twine 2 editor.
---

# Twine 2 (twinejs) Core Skill

Expert knowledge for developing with and extending the Twine 2 interactive story editor (klembot/twinejs).

## Architecture Overview

Twine 2 is a browser-based and Electron-packaged GUI for creating nonlinear stories. The codebase uses:

- **React 16** with TypeScript for UI components
- **Vite** as the build tool (migrated from create-react-app)
- **react-hook-thunk-reducer** for state management (custom reducer with thunk support)
- **react-router-dom v5** for routing
- **i18next + react-i18next** for localization
- **CodeMirror 5** (via react-codemirror2) for passage editing
- **Electron 41** for desktop packaging
- **Jest + React Testing Library + Playwright** for testing

## Project Structure

```
src/
├── app.tsx              # Root application component
├── index.tsx            # Entry point (ReactDOM.render)
├── components/          # Reusable UI components
├── dialogs/              # Modal dialogs (passage editor, etc.)
├── routes/               # Route-level pages
│   ├── story-edit/       # Story map editor
│   ├── story-list/       # Story library view
│   ├── story-play/       # Play mode
│   ├── story-proof/      # Proofing mode
│   └── welcome/          # Welcome screen
├── store/                # State management
│   ├── stories/          # Story/passage state
│   ├── prefs/            # User preferences
│   ├── story-formats/    # Installed format management
│   ├── persistence/      # LocalStorage persistence layer
│   └── undoable-stories/ # Undo/redo logic
├── electron/             # Desktop app code
│   ├── main-process/     # Electron main process
│   └── shared/           # Shared types/utils
├── codemirror/           # CodeMirror customizations
├── util/                 # Utilities (color, i18n, etc.)
└── styles/               # Global CSS
```

## State Management Pattern

Twine uses a custom reducer pattern via `react-hook-thunk-reducer`:

```typescript
// Store structure uses React Context + useReducer with thunk support
const [state, dispatch] = useThunkReducer(reducer, initialState);

// Actions support both sync and async (thunk) patterns
dispatch({ type: 'createStory', props: { name: 'My Story' } });

// Thunk actions for async operations
dispatch((dispatch, getState) => {
  // async logic here
});
```

Key stores:
- **stories**: Story[] array with passage management
- **prefs**: User preferences, theme, locale
- **story-formats**: Available story formats (Harlowe, SugarCube, Snowman, etc.)

## Story Format Integration

Story formats are JavaScript files that define how stories are rendered. Twine 2 bundles:
- **Harlowe**: Default format (foss.heptapod.net/games/harlowe)
- **SugarCube**: Twine 1 legacy + advanced features (github.com/tmedwards/sugarcube-2)
- **Snowman**: Minimalist programmer format (github.com/klembot/snowman)
- **Paperthin**: Proofing format (github.com/klembot/paperthin)
- **Chapbook**: Second-generation format

Format files live in `public/story-formats/` as minified `format.js` files.

## Key Concepts

### Passage
The atomic unit of a story:
- `id`: GUID
- `name`: Display name (unique within story)
- `text`: Body content (format-specific markup)
- `tags`: string[]
- `left`, `top`, `width`, `height`: Position on story map

### Story
Container for passages:
- `ifid`: Interactive Fiction ID (stable across imports)
- `storyFormat`, `storyFormatVersion`: Target format
- `startPassage`: Entry point passage ID
- `script`: Custom JavaScript
- `stylesheet`: Custom CSS
- `snapToGrid`, `zoom`: Editor preferences

### Story Map
The visual node editor where users arrange passages and draw connections. Implemented with:
- `react-draggable` for passage dragging
- SVG or DOM-based link rendering between passages
- Zoom/pan controls

## Electron Integration

The desktop app adds:
- File system access for story library storage
- Native menus and dialogs
- Auto-updater support
- Hardware acceleration toggle
- `user.css` customization

Main process responsibilities:
- `init-app.ts`: Window creation, protocol handling
- `story-file.ts`: Story import/export (HTML, Twee, JSON)
- `story-directory.ts`: Library folder management
- `menu-bar.ts`: Application menus
- `ipc.ts`: IPC channel definitions

## Building and Development

```bash
# Web dev server
npm start

# Electron dev
npm run start:electron

# Production build (web + electron)
npm run build

# Tests
npm test
npm run test:coverage

# E2E tests
npm run e2e
```

## PWA Support

VitePWA plugin configures service worker with:
- Auto-update strategy
- Icon manifest
- Asset caching for locales, story formats, PWA assets

## Extending Twine

To add features:
1. **New dialog**: Add to `src/dialogs/` with route integration
2. **New preference**: Extend `src/store/prefs/prefs.types.ts` and reducer
3. **New story format**: Place format.js in `public/story-formats/`
4. **Custom toolbar**: Modify `src/components/` or `src/routes/story-edit/`

## Important File Locations

- Entry: `src/index.tsx`
- Routes: `src/routes/index.tsx`
- Story types: `src/store/stories/stories.types.ts`
- Passage editor: `src/dialogs/passage-edit/`
- Story map: `src/routes/story-edit/`
- Persistence: `src/store/persistence/`
- Electron main: `src/electron/main-process/`
