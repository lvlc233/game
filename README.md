# 第一学院规则档案

一个使用 SugarCube/Twine 制作的纯文字解谜游戏框架。玩家通过英文命令检索损坏硬盘中的档案，逐步发现校园规则、故事真相和隐藏命令。

## 开发命令

```powershell
npm install
npm run build
npm run watch
npm run serve
npm run test:smoke
```

构建后的游戏位于 `dist/index.html`。`.twee` 是正式源文件，Twine GUI 只作为地图查看和临时编辑辅助；如果在 GUI 中修改内容，请把最终改动同步回 `.twee` 再提交 Git。

项目内置 `storyformats/sugarcube-2/format.js`，所以构建不依赖本机 Twine GUI。

## 分工

- 框架与命令系统：`src/twee/system/`（widget、命令逻辑、状态机、CSS）
- 故事剧情入口与档案文本：`src/twee/story/`
  - `Start.twee`：Start / Game / About 三个壳 passage
  - `archives.twee`：每份档案的正文，带 `[archive]` 标签
- 档案 metadata（id / title / keywords / links / unlocked / unlocksCommands / passage）：`src/twee/system/StoryInit.twee` 的 `setup.archive` 数组
- 写作规范：`docs/writing-guide.md`
- UI 骨架说明：`docs/ui-notes.md`
- Agent 工作约定：`agent/docs/conventions.md`

## 剧情作者：用 Twine GUI 编辑档案

档案正文集中在 `src/twee/story/archives.twee`，每份档案 = 一个带 `[archive]` 标签的 passage（passage 名 = `archive_<id>`）。剧情作者可以用 Twine GUI 改正文，不需要碰任何 JavaScript / SugarCube 宏。

### 用 Twinery 网页版

1. 跑 `npm run build && npm run serve`（http-server 起在 `127.0.0.1:4173`）
2. 打开 https://twinery.org/2/
3. **首次配置 SugarCube format**（每个浏览器只做一次）：
   - 主页 → 右下 ⚙ → Story Formats → Add a New Format
   - URL：`http://127.0.0.1:4173/storyformats/sugarcube-2/format.js` → Add
4. 主页 → Import From File → 选 `dist/index.html`
5. 节点图里**只编辑带 `archive` 标签的 passage**（其它是系统层，请勿改动）
6. 同步回 `archives.twee`：
   - 推荐：Twine 桌面版（同源[下载](https://twinery.org/)）打开 HTML → Publish → **Export Story As Twee** → 从导出 `.twee` 里把 `[archive]` 段落复制回 `src/twee/story/archives.twee`
   - 退路：在网页版逐个打开 archive passage，复制文字回 `archives.twee` 对应位置
7. 跑 `npm run build && npm run test:smoke`，通过即可提交

### archive passage 格式

```twee
:: archive_iv-000-opening [archive]
段落 1（行内不要换行）。

段落 2。可以用 //斜体// 或 ''粗体''。
```

段落用空行分隔。SugarCube 宏（`<<>>`、`[[]]`）不要写在档案正文里——它们会被运行时解析。

### 新增档案

1. `archives.twee` 加 `:: archive_<新 id> [archive]` passage
2. `setup.archive` 加 metadata：
   ```js
   {
     id: "新 id",
     type: "...",
     chapter: "...",
     title: "...",
     keywords: [...],
     unlocked: false,
     links: [...],
     passage: "archive_<新 id>"
   }
   ```
3. 在某个已有档案的 `links` 加上新档案 id（这样 `find` 命中那个档案时新档案才会被恢复）
4. 如果新档案要解锁某个命令族，加 `unlocksCommands: ["save"|"note"|"rule"|"link"]`
