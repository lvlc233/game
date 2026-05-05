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

- 框架与命令系统：`src/twee/system`
- 剧情、档案和章节入口：`src/twee/story`
- 写作规范：`docs/writing-guide.md`
- UI 骨架说明：`docs/ui-notes.md`
