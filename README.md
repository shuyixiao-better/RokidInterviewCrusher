# 吊打面试官

> 基于 Rokid 智能眼镜 AIUI 框架的 AI 面试训练与复盘辅助工具

## 项目简介

**吊打面试官**是一款专为 Rokid 智能眼镜设计的 AI 面试训练工具。它能够在面试过程中提供实时关键词提示，帮助候选人更好地组织回答，并在面试后提供详细的复盘分析。

### 核心特性

- **实时关键词提示**：面试官提问时，眼镜屏幕显示简短的答题结构和关键词
- **面试录音**：用户主动控制录音开始和结束
- **AI 复盘分析**：面试结束后生成详细的分析报告
- **隐私合规**：所有录音功能需用户明确授权，不提供隐蔽录音功能

### 合规声明

本项目定位为"面试训练、模拟面试、复盘分析、表达优化"工具，**不开发**以下功能：
- 偷拍、偷录功能
- 隐蔽作弊功能
- 绕过面试规则的功能

所有录音功能必须在用户明确点击开始后进行，并且界面会提示用户遵守当地法律法规与面试规则。

---

## 技术架构

### 技术栈

- **框架**：Rokid AIUI
- **语言**：JavaScript
- **文件格式**：SFC `.ink` 文件
- **样式**：WXSS + AIUI 主题 Token
- **AI 接口**：OpenAI 兼容 API

### 项目结构

```
RokidInterviewCrusher/
├── app.json                    # 应用配置
├── app.js                      # 应用入口
├── pages/                      # 页面目录
│   ├── HomePage/
│   │   └── index.ink          # 首页
│   ├── InterviewPage/
│   │   └── index.ink          # 面试中页面
│   ├── ReviewPage/
│   │   └── index.ink          # 复盘页面
│   └── SettingsPage/
│       └── index.ink          # 设置页面
├── src/
│   ├── services/              # 服务层
│   │   ├── aiService.js       # AI 大模型服务
│   │   ├── audioService.js    # 录音服务
│   │   ├── speechService.js   # 语音识别服务
│   │   ├── interviewService.js # 面试业务服务
│   │   └── storageService.js  # 本地存储服务
│   ├── prompts/               # Prompt 模板
│   │   ├── realtimeHintPrompt.js
│   │   └── reviewPrompt.js
│   ├── utils/                 # 工具函数
│   │   ├── constants.js
│   │   └── format.js
│   └── mock/                  # Mock 数据
│       ├── mockQuestions.js
│       └── mockInterviewTranscript.js
└── docs/                      # 文档
    ├── product-design.md
    └── api-design.md
```

---

## 快速开始

### 环境要求

- Node.js >= 18.0.0
- Rokid AIUI 开发环境

### 安装依赖

```bash
npm install
```

### 配置 AI 服务

在设置页面配置以下信息：

1. **API Key**：你的大模型 API Key
2. **Base URL**：API 服务地址（默认：`https://api.openai.com/v1`）
3. **模型名称**：使用的模型（默认：`gpt-3.5-turbo`）

如果未配置 API Key，应用会使用 Mock 数据运行。

### 运行项目

```bash
# 构建项目
npm run build

# 安装到设备
npm run deploy
```

---

## 功能说明

### 1. 首页

- 显示应用名称和版本
- 提供"开始面试"、"查看复盘"、"设置"三个功能入口
- 显示最近一次面试记录摘要

### 2. 面试中页面

- **合规提示**：开始前显示录音授权提示
- **录音控制**：用户主动点击开始/结束录音
- **实时识别**：识别面试官问题
- **关键词提示**：显示答题结构和关键词

### 3. 复盘页面

- **综合评分**：技术深度、表达清晰度、逻辑结构、岗位匹配度
- **问题分析**：每个问题的回答摘要、优点、不足、改进建议
- **改进计划**：针对性的准备建议

### 4. 设置页面

- **目标岗位**：Java 后端、AI 应用开发、解决方案架构师、前端、产品经理
- **技术栈**：个人技术栈关键词
- **简历关键词**：项目经历关键词
- **AI 配置**：API Key、Base URL、模型名称

---

## AI Prompt 说明

### 实时提示 Prompt

实时提示采用以下策略：
- 只输出关键词和答题结构
- 不超过 6 条提示
- 每条不超过 18 个中文字符
- 不生成完整段落
- 优先提示：答题框架、技术关键词、量化结果

### 复盘分析 Prompt

复盘分析包含：
- 整体评价
- 四个维度评分（1-10 分）
- 每个问题的详细分析
- 主要问题和改进计划

---

## 设计规范

### 屏幕适配

- **宽度**：480px
- **高度**：120px - 380px
- **布局**：Card Style 卡片式布局
- **背景**：黑色默认背景

### 样式规范

- 使用 AIUI 内置主题 Token
- 优先使用 `var(--color-primary)`、`var(--color-text-primary)` 等语义化 Token
- 边框宽度：2px（默认）
- 圆角：12px（推荐）

### 交互规范

- 不使用 emoji（除非明确要求）
- 不使用大面积纯色块
- 提示内容必须短、快、准

---

## 开发指南

### 添加新页面

1. 在 `pages/` 目录下创建新文件夹
2. 创建 `index.ink` 文件
3. 在 `app.json` 的 `pages` 数组中添加路径

### .ink 文件结构

```html
<script def>
{
  "navigationBarTitleText": "页面标题"
}
</script>

<script setup>
import wx from 'wx';

export default {
  data: {},
  onLoad() {},
  methods: {}
}
</script>

<page>
  <view class="container">
    <!-- 页面内容 -->
  </view>
</page>

<style>
.container {
  /* 使用 AIUI 主题 Token */
  background-color: var(--color-background);
}
</style>
```

### 使用主题 Token

```css
/* 颜色 */
color: var(--color-primary);
color: var(--color-text-primary);
color: var(--color-text-secondary);

/* 背景 */
background-color: var(--color-background);
background-color: var(--color-surface);

/* 间距 */
padding: var(--spacing-md);
gap: var(--spacing-sm);

/* 圆角 */
border-radius: var(--radius-md);

/* 边框 */
border-width: var(--border-width-default);
border-color: var(--border-color-default);
```

---

## 后续 Roadmap

### v1.1.0
- [ ] 支持更多岗位方向
- [ ] 优化问题识别准确率
- [ ] 添加面试历史列表页面

### v1.2.0
- [ ] 支持多轮面试记录对比
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
