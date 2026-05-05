# 剧情写作指南

本项目采用混合模式：`.twee` 是正式源文件，Twine GUI 用来查看地图和临时调整。

## 推荐流程

1. 在 `src/twee/story` 新增或编辑 `.twee` 文件。
2. 运行 `npm run build` 生成 `dist/index.html`。
3. 如需可视化地图，把 `dist/index.html` 导入 Twine GUI。
4. 如果在 GUI 里做了修改，把最终文本同步回 `.twee`。
5. 提交 Git 时提交 `.twee`、文档和配置，不提交 `dist/`。

## 存档与继续

框架会在每次命令后把当前页面、已解锁档案、笔记和规则填写内容保存到浏览器 `localStorage`。首次进入没有存档时显示开场；之后关闭浏览器再打开，会直接恢复到上次游玩的页面。

开发调试时可以输入 `reset` 清除当前浏览器进度，重新播放首次介绍。

## 首次介绍

首次介绍文本目前写在 `src/twee/system/StoryInit.twee` 的 `setup.introPages`。每个介绍页是一个 `lines` 数组，后续只需要替换这些占位文案即可。

## 档案格式

首版档案数据集中写在 `src/twee/system/StoryInit.twee` 的 `setup.archive` 中。后续剧情扩展稳定后，可以再拆到独立数据文件。

每个档案包含：

- `id`：档案编号，建议使用 `type-编号-短名`，例如 `sc-001-code`。
- `type`：档案类型，例如 `invitation`、`school-code`、`note`、`report`、`diary`。
- `chapter`：所属章节，例如 `第零章`、`故事一`。
- `title`：显示标题。
- `keywords`：可被 `find <keyword>` 搜到的关键词。
- `unlocked`：是否开局可见。
- `links`：相关档案编号。
- `body`：正文段落数组。

玩家可以输入完整编号，也可以输入唯一前缀，例如 `open sc-001`。

## 写作约定

- 角色代称沿用动物名，例如“羊”。
- 指令保持英文，正文可以中文。
- 线索优先放在档案正文、标题、关键词和关联档案里。
- 不要把谜题答案只藏在代码里；玩家应能从文本推理出来。
- 如果新档案需要通过搜索解锁，请把关键字写进 `keywords`，并让正文里有合理提示。
