# 吊打面试官

基于 Rokid 智能眼镜 AIUI 框架的 AI 面试训练与复盘辅助工具。

## 项目介绍

`RokidInterviewCrusher` 用于模拟面试、面试训练、复盘分析和表达优化。产品只提供训练提示，不提供偷拍、偷录、隐藏录音、绕过规则或隐蔽作弊能力。

## 功能特性

- 实时面试关键词提示，只输出适合眼镜小屏的短提示卡片。
- 用户主动点击后开始录音，结束后生成完整复盘。
- 结构化复盘报告，包含评分、逐题分析、主要问题和下次准备重点。
- 在未配置 API Key 或原生能力不足时自动降级为 Mock，保证 MVP 可演示。

## 技术架构

- 框架：Rokid AIUI
- 页面：`.ink` 单文件组件
- 服务分层：
  - `src/services/audioService.js`
  - `src/services/speechService.js`
  - `src/services/aiService.js`
  - `src/services/interviewService.js`
  - `src/services/storageService.js`
- Prompt：
  - `src/prompts/realtimeHintPrompt.js`
  - `src/prompts/reviewPrompt.js`
- 配置：
  - `app.json` 只负责页面路由和窗口
  - `AGENTS.md` 声明权限和技能

## 快速启动

```bash
npm install
npm run build
npm run deploy
```

如果本地没有 `rokid-cli`，需要在已配置好的 Rokid AIUI 环境中执行真实构建和安装。

## 配置说明

设置页支持配置：

- 目标岗位
- 技术栈关键词
- 简历关键词
- OpenAI-compatible `baseUrl`
- `apiKey`
- `model`

默认配置：

- `baseUrl`: `https://api.openai.com/v1`
- `model`: `gpt-3.5-turbo`

## AI Prompt 说明

- `realtimeHintPrompt`
  - 最多 6 条
  - 每条不超过 18 个中文字符
  - 优先输出答题框架、技术关键词、量化结果、风险点、追问方向
- `reviewPrompt`
  - 输出结构化 JSON
  - 包含整体评价、4 项评分、逐题分析、主要问题、准备计划

## 合规说明

- 录音前必须由用户主动点击开始。
- 页面明确提示“请确保获得面试相关方授权后再录音”。
- 不提供隐藏录音、后台偷录、绕过系统检测等能力。
- 实时提示只给关键词，不生成完整照读答案。
- 不鼓励用户在不被允许的正式面试中使用该工具。

## 后续 Roadmap

- 接入 Rokid 原生 ASR 回调，替换当前 mock 识别适配层。
- 接入真实音频上传与转写服务。
- 增加历史记录列表与复盘详情页。
- 增加多轮训练对比与更细粒度的岗位 Prompt 策略。
- [ ] 添加语音合成功能
- [ ] 优化复盘报告展示

### v2.0.0
- [ ] 支持模拟面试模式
- [ ] 添加面试题库
- [ ] 支持团队协作和分享

---

## 许可证

MIT License

---

## 联系方式

如有问题或建议，请提交 Issue 或 Pull Request。
