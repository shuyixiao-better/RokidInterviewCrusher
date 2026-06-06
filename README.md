# RokidInterviewCrusher

**吊打面试官** - 基于 Rokid 智能眼镜的 AI 面试训练与复盘辅助工具

## 📖 项目介绍

RokidInterviewCrusher 是一款基于 Rokid 智能眼镜 AIUI 框架开发的面试训练工具。它利用 AI 技术帮助用户在面试过程中获得实时关键词提示，并在面试后提供详细的复盘分析，帮助用户提升面试表现。

### 核心价值

- **实时提示**：面试官提问时，眼镜上显示关键词和答题结构
- **智能分析**：AI 自动分析面试表现，提供改进建议
- **隐私保护**：所有功能需用户主动触发，不提供隐蔽功能
- **便携体验**：基于智能眼镜，无需额外设备

## ✨ 功能特性

### 1. 实时面试关键词提示
- 语音识别获取面试官问题
- AI 分析问题并生成关键词提示
- 适合眼镜小屏幕的简短展示
- 支持多种问题类型识别

### 2. 面试过程录音
- 用户主动控制开始/结束
- 高质量音频录制
- 合规提示和授权确认

### 3. 面试文本转写
- 实时语音识别
- 完整录音转文本
- 支持多种识别引擎

### 4. 面试复盘分析
- 综合评分（技术深度、表达清晰度、逻辑结构、岗位匹配度）
- 问题逐条分析
- 优点和不足识别
- 改进建议和下一步计划

### 5. 个性化配置
- 目标岗位设置
- 技术栈配置
- 简历关键词
- AI API 配置

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────────────┐
│                    UI 层 (Pages)                     │
├─────────────────────────────────────────────────────┤
│  HomePage  │  InterviewPage  │  ReviewPage  │  SettingsPage  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                 业务逻辑层 (Services)                 │
├─────────────────────────────────────────────────────┤
│  interviewService (面试流程控制)                      │
├─────────────────────────────────────────────────────┤
│  audioService  │  speechService  │  aiService  │  storageService  │
└─────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────┐
│                   基础设施层                          │
├─────────────────────────────────────────────────────┤
│  Rokid AIUI SDK  │  Web Audio API  │  LLM API  │  LocalStorage  │
└─────────────────────────────────────────────────────┘
```

### 技术栈

- **前端框架**：原生 JavaScript（可扩展为 TypeScript）
- **AI 框架**：Rokid AIUI
- **语音识别**：Rokid AIUI / Web Speech API
- **大模型**：OpenAI 兼容接口
- **存储**：LocalStorage / Rokid 存储 API

## 🚀 快速启动

### 环境要求

- Node.js >= 18.0.0
- 现代浏览器（支持 Web Speech API）
- Rokid 智能眼镜（可选，支持 Mock 模式开发）

### 安装依赖

```bash
npm install
```

### 运行项目

```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

### 浏览器访问

打开浏览器访问项目根目录的 `index.html` 文件，或使用本地服务器：

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .
```

## ⚙️ 配置说明

### AI API 配置

在设置页面配置大模型 API：

| 配置项 | 说明 | 示例 |
|--------|------|------|
| API 地址 | OpenAI 兼容接口地址 | `https://api.openai.com/v1` |
| API Key | API 密钥 | `sk-...` |
| 模型 | 模型名称 | `gpt-3.5-turbo` |

**支持的模型**：
- OpenAI GPT-3.5/GPT-4
- 其他 OpenAI 兼容接口（如 Claude、文心一言等）

### 用户配置

| 配置项 | 说明 |
|--------|------|
| 目标岗位 | Java 后端、AI 应用开发、解决方案架构师、前端、产品经理 |
| 技术栈 | 用户掌握的技术栈关键词 |
| 简历关键词 | 简历中的项目关键词 |

## 📝 AI Prompt 说明

### 实时提示 Prompt

**用途**：面试官提问时生成关键词提示

**特点**：
- 只输出关键词和答题结构
- 不超过 6 条提示
- 每条不超过 18 个中文字符
- 适合眼镜小屏幕展示

**输出格式**：
```json
{
  "questionType": "项目经历",
  "hints": ["STAR法则", "量化数据", "技术深度"],
  "warning": "注意不要夸大"
}
```

### 复盘分析 Prompt

**用途**：面试结束后生成复盘报告

**特点**：
- 综合评分（1-10 分）
- 逐条问题分析
- 具体改进建议
- 专业、直接、鼓励的语气

**输出格式**：
```json
{
  "summary": "整体评价",
  "scores": {
    "technicalDepth": 7.5,
    "communication": 6.8,
    "logic": 7.0,
    "jobMatch": 7.2
  },
  "questions": [...],
  "topProblems": [...],
  "nextPreparationPlan": [...]
}
```

## 🔒 合规说明

本项目严格遵守以下合规要求：

### 1. 用户授权
- 所有录音功能必须由用户主动点击开始
- 页面明确提示用户获得相关方授权
- 不提供隐藏录音或后台偷录功能

### 2. 功能限制
- 实时提示只提供关键词，不生成完整答案
- 不鼓励在未授权的正式面试中使用
- 不提供绕过系统检测的功能

### 3. 数据安全
- 录音数据本地存储
- 不自动上传到云端
- 用户可随时清空数据

### 4. 使用场景
- ✅ 模拟面试训练
- ✅ 面试复盘分析
- ✅ 表达能力提升
- ❌ 正式面试作弊
- ❌ 隐蔽录音录像

## 🗺️ 后续 Roadmap

### Phase 1 - MVP（当前）
- [x] 基础项目结构
- [x] 实时关键词提示
- [x] 面试录音
- [x] 复盘分析
- [x] 用户配置

### Phase 2 - 功能增强
- [ ] 多轮面试支持
- [ ] 面试历史统计
- [ ] 更多问题类型识别
- [ ] 自定义 Prompt 模板

### Phase 3 - 平台扩展
- [ ] Rokid AIUI 真实 API 接入
- [ ] 多语言支持
- [ ] 云端数据同步
- [ ] 社区分享功能

### Phase 4 - 高级功能
- [ ] 面试模拟对话
- [ ] 语音情感分析
- [ ] 个性化学习路径
- [ ] 企业版功能

## 📁 项目结构

```
RokidInterviewCrusher/
├── README.md                    # 项目说明
├── package.json                 # 项目配置
├── src/
│   ├── app.js                   # 主应用入口
│   ├── pages/                   # 页面层
│   │   ├── HomePage.js          # 首页
│   │   ├── InterviewPage.js     # 面试页面
│   │   ├── ReviewPage.js        # 复盘页面
│   │   └── SettingsPage.js      # 设置页面
│   ├── services/                # 服务层
│   │   ├── audioService.js      # 音频录音服务
│   │   ├── speechService.js     # 语音识别服务
│   │   ├── aiService.js         # AI 大模型服务
│   │   ├── interviewService.js  # 面试业务服务
│   │   └── storageService.js    # 本地存储服务
│   ├── prompts/                 # Prompt 模板
│   │   ├── realtimeHintPrompt.js
│   │   └── reviewPrompt.js
│   ├── utils/                   # 工具函数
│   │   ├── format.js
│   │   └── constants.js
│   └── mock/                    # Mock 数据
│       ├── mockQuestions.js
│       └── mockInterviewTranscript.js
└── docs/                        # 文档
    ├── product-design.md
    └── api-design.md
```

## 🤝 贡献指南

欢迎贡献代码、报告问题或提出建议！

### 贡献方式

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

### 开发规范

- 代码添加中文注释
- 遵循现有代码风格
- 测试新功能
- 更新文档

## 📄 许可证

本项目采用 MIT 许可证 - 详见 [LICENSE](LICENSE) 文件

## 📧 联系方式

- 项目主页：[GitHub](https://github.com/yourusername/RokidInterviewCrusher)
- 问题反馈：[Issues](https://github.com/yourusername/RokidInterviewCrusher/issues)

## 🙏 致谢

- [Rokid](https://www.rokid.com/) - 提供智能眼镜平台
- [OpenAI](https://openai.com/) - 提供大模型 API
- 所有贡献者和用户

---

**⚠️ 免责声明**：本工具仅用于面试训练和学习目的。用户在使用本工具时应遵守当地法律法规和面试规则。开发者不对用户的使用行为承担责任。
