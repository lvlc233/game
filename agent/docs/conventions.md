# Agent 工作约定（项目级）

> 仅记录在本仓库内、用户给我的工作流约束。不写入全局 `~/.claude` 的记忆。

## C-1 · 对话记录
每次对话（用户消息 → 我的执行）记入 `agent/docs/YYYY-MM-DD-session-NN.md`，内容：用户输入、我的理解、执行计划、过程、结果。

## C-2 · 会话结束自动 commit + push
完成用户分配的修改任务并通过 `npm run build` + `npm run test:smoke` 后，**主动**：
- `git add` 改动文件（不含 .env / credentials / 大型二进制 / node_modules / dist）
- 写 commit message（保留仓库现有英文风格 + 必要时中英混合，结尾按通用约束加 Co-Authored-By）
- `git push origin <当前分支>`（目前为 `master`，禁止 force push）

不需要再问授权。同一项任务的中间步骤不 commit；只在收尾时一次性提交。

## C-3 · 破坏性修改授权
用户已明确允许「全部删了推倒重来」。遇到现存代码不便利时，可以直接重写而不必逐行兼容老逻辑。

## C-4 · 工作模式
- 减少提问，自主推进
- 用用户的反馈作为后续调整的依据
- 不请求二次授权（除非涉及超出本项目范围或不可逆的系统级操作）
