---
name: electron-react-vite
description: Desktop application development with Electron, React, and Vite. Use when building cross-platform desktop apps that combine web technologies with native OS integration, packaging web apps as .exe/.dmg/.AppImage, implementing IPC between main and renderer processes, or managing Electron security best practices. Covers the complete stack from Vite dev server to electron-builder distribution.
---

# Electron + React + Vite Skill

Expert knowledge for building cross-platform desktop applications using Electron with React and Vite, based on production patterns from the Twine 2 editor architecture.

## Architecture

```
Electron App
├── Main Process (Node.js + Electron APIs)
│   ├── Window management
│   ├── Native menus, dialogs, file system
│   ├── Auto-updater, notifications
│   └── IPC handlers
├── Renderer Process (React + Vite)
│   ├── React UI components
│   ├── Vite dev server / bundled assets
│   └── IPC invokers
└── Preload Script (bridge layer)
    └── Secure context bridge
```

## Tech Stack

- **Electron 41** (latest stable from 2.5 branch)
- **React 16** (class/functional components, hooks)
- **TypeScript** (strict mode)
- **Vite** (dev server + bundler, with @vitejs/plugin-react-swc)
- **electron-builder** (packaging for win/mac/linux)
- **@electron/notarize** (macOS notarization)

## Project Setup

### File Structure

```
project/
├── src/
│   ├── index.tsx              # React entry
│   ├── app.tsx                # Root component
│   ├── components/            # React components
│   ├── electron/
│   │   ├── main-process/
│   │   │   ├── index.ts       # Main bootstrap
│   │   │   ├── init-app.ts    # Window creation
│   │   │   ├── menu-bar.ts    # Application menus
│   │   │   ├── ipc.ts         # IPC handlers
│   │   │   ├── story-file.ts  # FS operations
│   │   │   └── preload.ts     # Preload script
│   │   └── shared/            # Shared types
│   └── store/                 # State management
├── index.html                 # Vite HTML entry
├── vite.config.mts            # Vite config
├── tsconfig.json              # TS config (renderer)
├── tsconfig.electron.json     # TS config (main)
├── electron-builder.config.js # Packaging config
└── package.json
```

### Vite Configuration

```typescript
// vite.config.mts
import react from '@vitejs/plugin-react-swc';
import browserslistToEsbuild from 'browserslist-to-esbuild';
import {defineConfig} from 'vite';
import checker from 'vite-plugin-checker';
import {nodePolyfills} from 'vite-plugin-node-polyfills';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist/web',
    target: browserslistToEsbuild(['>0.2%', 'not dead', 'not op_mini all'])
  },
  define: {
    'process.env.VITE_APP_NAME': JSON.stringify(packageJson.name),
    'process.env.VITE_APP_VERSION': JSON.stringify(packageJson.version)
  },
  plugins: [
    checker({
      eslint: {lintCommand: 'eslint src'},
      overlay: {initialIsOpen: false},
      typescript: true
    }),
    nodePolyfills({include: [], globals: {global: true}}),
    react()
  ],
  server: {open: true}
});
```

### TypeScript Configs

```json
// tsconfig.json (renderer)
{
  "compilerOptions": {
    "target": "ESNext",
    "module": "esnext",
    "jsx": "react-jsx",
    "lib": ["dom", "dom.iterable", "esnext"],
    "strict": true,
    "moduleResolution": "node",
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "skipLibCheck": true,
    "noEmit": true
  },
  "include": ["src"]
}
```

```json
// tsconfig.electron.json (main)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "electron-build/main",
    "strict": true,
    "esModuleInterop": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/electron"]
}
```

## Electron Main Process

### Bootstrap

```typescript
// src/electron/main-process/index.ts
import {app} from 'electron';
import {initApp} from './init-app';
import {loadAppPrefs} from './app-prefs';
import {initHardwareAcceleration} from './hardware-acceleration';

// Must load prefs before app ready for hardware acceleration setting
loadAppPrefs();
initHardwareAcceleration();

app.whenReady().then(initApp);
app.on('window-all-closed', () => app.quit());
```

### Window Creation

```typescript
// src/electron/main-process/init-app.ts
import {BrowserWindow} from 'electron';
import * as path from 'path';

export function initApp() {
  const mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  // Load Vite dev server in development, bundled files in production
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../../renderer/index.html'));
  }
}
```

### Preload Script (Security Bridge)

```typescript
// src/electron/main-process/preload.ts
import {contextBridge, ipcRenderer} from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (path: string) => ipcRenderer.invoke('read-file', path),
  writeFile: (path: string, data: string) => ipcRenderer.invoke('write-file', path, data),

  // Dialogs
  showOpenDialog: (options: any) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options: any) => ipcRenderer.invoke('show-save-dialog', options),

  // Events
  onFileChanged: (callback: (path: string) => void) => {
    ipcRenderer.on('file-changed', (_, path) => callback(path));
  },

  // App lifecycle
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  relaunch: () => ipcRenderer.send('relaunch-app')
});
```

### IPC Handlers

```typescript
// src/electron/main-process/ipc.ts
import {ipcMain, dialog, shell} from 'electron';

ipcMain.handle('read-file', async (_, filePath: string) => {
  const fs = await import('fs-extra');
  return fs.readFile(filePath, 'utf-8');
});

ipcMain.handle('show-open-dialog', async (_, options) => {
  const result = await dialog.showOpenDialog(options);
  return result;
});

ipcMain.handle('show-save-dialog', async (_, options) => {
  const result = await dialog.showSaveDialog(options);
  return result;
});
```

## Renderer Process (React)

### Using Electron API in React

```typescript
// src/hooks/use-electron.ts
export function useElectronAPI() {
  return (window as any).electronAPI;
}

// In a component:
const electron = useElectronAPI();
const handleOpen = async () => {
  const result = await electron.showOpenDialog({
    properties: ['openFile'],
    filters: [{name: 'Stories', extensions: ['html', 'tw']}
  ]});
  if (!result.canceled && result.filePaths.length > 0) {
    const content = await electron.readFile(result.filePaths[0]);
    // ...
  }
};
```

### Type Declarations

```typescript
// src/externals.d.ts
declare global {
  interface Window {
    electronAPI: {
      readFile(path: string): Promise<string>;
      writeFile(path: string, data: string): Promise<void>;
      showOpenDialog(options: any): Promise<any>;
      showSaveDialog(options: any): Promise<any>;
      getAppVersion(): Promise<string>;
      relaunch(): void;
      onFileChanged(callback: (path: string) => void): void;
    };
  }
}
```

## Build Scripts

```json
{
  "scripts": {
    "start": "vite",
    "build:web": "tsc && vite build",
    "build:electron-main": "tsc --project tsconfig.electron.json",
    "build:electron-bundle": "electron-builder --config electron-builder.config.js",
    "build:electron": "npm-run-all --parallel build:web build:electron-main --serial build:electron-bundle",
    "build": "run-s clean build:electron",
    "start:electron": "NODE_ENV=development npm-run-all --serial clean --parallel build:web build:electron-main --serial start:electron:boot",
    "start:electron:boot": "electron electron-build/main/src/electron/main-process/index.js",
    "clean": "rimraf dist electron-build"
  }
}
```

## Electron Builder Config

```javascript
// electron-builder.config.js
module.exports = {
  appId: 'com.example.myapp',
  productName: 'MyApp',
  directories: {
    output: 'dist',
    buildResources: 'build-resources'
  },
  files: [
    'electron-build/main/**/*',
    'dist/web/**/*'
  ],
  mac: {
    category: 'public.app-category.games',
    target: ['dmg', 'zip'],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    entitlements: 'build-resources/entitlements.mac.plist',
    entitlementsInherit: 'build-resources/entitlements.mac.plist'
  },
  win: {
    target: ['nsis', 'portable']
  },
  linux: {
    target: ['AppImage', 'deb'],
    category: 'Game'
  },
  afterSign: async (context) => {
    const {electronPlatformName, appOutDir} = context;
    if (electronPlatformName !== 'darwin') return;

    const appName = context.packager.appInfo.productFilename;
    const {notarize} = require('@electron/notarize');

    await notarize({
      appBundleId: 'com.example.myapp',
      appPath: `${appOutDir}/${appName}.app`,
      appleId: process.env.APPLE_ID,
      appleIdPassword: process.env.APPLE_ID_PASSWORD,
      teamId: process.env.APPLE_TEAM_ID
    });
  }
};
```

## Security Best Practices

1. **Context Isolation**: Always use `contextIsolation: true` with preload scripts
2. **Node Integration**: Keep `nodeIntegration: false` in renderer
3. **Sandbox**: Enable `sandbox: true` for renderer processes
4. **IPC Validation**: Validate all IPC arguments in main process
5. **Content Security Policy**: Set CSP headers in HTML
6. **Remote Content**: Avoid loading remote URLs; use loadFile

```html
<!-- In index.html -->
<meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';">
```

## Testing

### Unit Tests (Jest)

```json
{
  "devDependencies": {
    "jest": "^29",
    "@testing-library/react": "^14",
    "@testing-library/jest-dom": "^6",
    "jest-environment-jsdom": "^29"
  }
}
```

```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  moduleNameMapper: {
    '\\.(css|less|scss)$': 'identity-obj-proxy'
  }
};
```

### E2E Tests (Playwright)

```typescript
// playwright.config.ts
import {defineConfig} from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5173'
  },
  webServer: {
    command: 'npm start',
    port: 5173
  }
});
```

## Common Patterns

### Auto-Updater

Use `electron-updater` or `electron-builder`'s auto-update:

```typescript
// In main process
import {autoUpdater} from 'electron-updater';

autoUpdater.checkForUpdatesAndNotify();

autoUpdater.on('update-available', () => {
  dialog.showMessageBox({
    type: 'info',
    title: 'Update available',
    message: 'A new version is available. It will be downloaded in the background.'
  });
});
```

### Native Menus

```typescript
// src/electron/main-process/menu-bar.ts
import {Menu, MenuItem} from 'electron';

export function createMenuBar() {
  const template: (MenuItemConstructorOptions | MenuItem)[] = [
    {
      label: 'File',
      submenu: [
        {label: 'New', accelerator: 'CmdOrCtrl+N', click: () => {/* ... */}},
        {label: 'Open', accelerator: 'CmdOrCtrl+O', click: () => {/* ... */}},
        {type: 'separator'},
        {role: 'quit'}
      ]
    },
    {
      label: 'Edit',
      submenu: [
        {role: 'undo'},
        {role: 'redo'},
        {type: 'separator'},
        {role: 'cut'},
        {role: 'copy'},
        {role: 'paste'}
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
```

### File System Watcher

```typescript
// src/electron/main-process/track-file-changes.ts
import {watch} from 'chokidar';
import {BrowserWindow} from 'electron';

export function trackFileChanges(windows: BrowserWindow[], filePath: string) {
  const watcher = watch(filePath);

  watcher.on('change', () => {
    windows.forEach(win => {
      if (!win.isDestroyed()) {
        win.webContents.send('file-changed', filePath);
      }
    });
  });

  return watcher;
}
```
