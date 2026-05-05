# 第一学院规则档案

SugarCube/Twine 文字解谜项目。玩家通过英文命令检索损坏硬盘中的档案、整理规则怪谈，并逐步还原第一学院的故事。

## 常用命令

```powershell
npm install
npm run build
npm run watch
```

构建后的游戏在 `dist/index.html`。

## 分工建议

- 框架与系统：`src/twee/system`
- 剧情与档案：`src/twee/story`
- 样式：`src/twee/system/StoryStylesheet.twee`
- 设计草稿记录：`docs/ui-notes.md`

剧情作者主要新增或修改 `src/twee/story/*.twee` 中的 `passage` 和 `setup.archive` 数据即可。
