# 贡献指南

感谢你对 RokidInterviewCrusher 项目的关注！我们欢迎任何形式的贡献。

## 📋 目录

- [行为准则](#行为准则)
- [如何贡献](#如何贡献)
  - [报告 Bug](#报告-bug)
  - [提交功能建议](#提交功能建议)
  - [提交代码](#提交代码)
- [开发环境](#开发环境)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [Pull Request 流程](#pull-request-流程)

## 行为准则

本项目遵循 [Contributor Covenant 行为准则](https://www.contributor-covenant.org/version/2/0/code_of_conduct/)。参与本项目即表示你同意遵守该准则。

## 如何贡献

### 报告 Bug

如果你发现了 Bug，请通过 [GitHub Issues](https://github.com/yourusername/RokidInterviewCrusher/issues) 报告。

**Bug 报告应包含**：

1. **清晰的标题**：简要描述问题
2. **环境信息**：
   - 操作系统
   - Node.js 版本
   - Rokid AIUI 版本
   - 浏览器版本（如果适用）
3. **重现步骤**：详细的操作步骤
4. **期望行为**：你期望发生什么
5. **实际行为**：实际发生了什么
6. **截图/日志**：如果有的话

**示例**：

```
标题：录音功能在 Rokid Air 上无法启动

环境：
- macOS 14.0
- Node.js 18.0.0
- Rokid AIUI 1000

重现步骤：
1. 打开应用
2. 点击"开始面试"
3. 点击"开始录音"按钮
4. 无响应

期望行为：
录音应该开始，按钮变为"停止录音"

实际行为：
点击按钮后无任何反应，控制台报错：xxx

截图：
[附加截图]
```

### 提交功能建议

如果你有功能建议，请通过 [GitHub Issues](https://github.com/yourusername/RokidInterviewCrusher/issues) 提交。

**功能建议应包含**：

1. **问题描述**：这个功能解决什么问题？
2. **解决方案**：你希望如何实现？
3. **替代方案**：有没有其他实现方式？
4. **上下文**：为什么这个功能重要？

### 提交代码

1. **Fork 项目**
2. **创建功能分支**：`git checkout -b feature/your-feature`
3. **提交更改**：`git commit -m 'Add some feature'`
4. **推送到分支**：`git push origin feature/your-feature`
5. **创建 Pull Request**

## 开发环境

### 前置条件

- Node.js >= 18.0.0
- Git
- Rokid AIUI CLI（可选）

### 安装步骤

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/RokidInterviewCrusher.git
cd RokidInterviewCrusher

# 2. 安装依赖
npm install

# 3. 启动开发服务器
npm run dev

# 4. 运行测试
npm test
```

### 项目结构

```
RokidInterviewCrusher/
├── app.json              # 应用配置
├── app.ux                # 应用入口
├── pages/                # 页面文件
├── src/                  # 源代码
│   ├── services/         # 服务层
│   ├── prompts/          # Prompt 模板
│   ├── utils/            # 工具函数
│   └── mock/             # Mock 数据
├── assets/               # 资源文件
└── docs/                 # 文档
```

## 代码规范

### JavaScript/TypeScript

- 使用 ES6+ 语法
- 使用 `const` 和 `let`，避免 `var`
- 使用箭头函数
- 使用模板字符串
- 使用解构赋值
- 使用 async/await

**示例**：

```javascript
// ✅ 好的
const getUserProfile = async (userId) => {
  const response = await fetch(`/api/users/${userId}`);
  const data = await response.json();
  return data;
};

// ❌ 不好的
var getUserProfile = function(userId) {
  return fetch('/api/users/' + userId)
    .then(function(response) {
      return response.json();
    });
};
```

### 命名规范

- **变量和函数**：camelCase
- **类名**：PascalCase
- **常量**：UPPER_SNAKE_CASE
- **文件名**：camelCase 或 kebab-case

**示例**：

```javascript
// 变量和函数
const userName = 'John';
const getUserById = (id) => { ... };

// 类名
class InterviewService { ... }

// 常量
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';
```

### 注释规范

- **文件头注释**：描述文件用途
- **函数注释**：使用 JSDoc 格式
- **行内注释**：解释复杂逻辑

**示例**：

```javascript
/**
 * 面试业务服务
 * 负责串联完整的面试流程：录音 -> 语音识别 -> AI 分析 -> 保存记录
 */
class InterviewService {
  /**
   * 开始面试
   * @param {Object} userProfile - 用户画像
   * @returns {Promise<boolean>} 是否开始成功
   */
  async startInterview(userProfile) {
    // 初始化面试记录
    this.currentInterview = {
      id: generateId(),
      startTime: Date.now(),
      // ...
    };
    // ...
  }
}
```

### 代码格式

- 使用 2 空格缩进
- 使用单引号
- 行尾不加分号（可选）
- 最大行长度：100 字符

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范。

### 提交格式

```
<type>(<scope>): <subject>

<body>

<footer>
```

### 类型（type）

- `feat`：新功能
- `fix`：Bug 修复
- `docs`：文档更新
- `style`：代码格式（不影响代码运行的变动）
- `refactor`：重构（既不是新增功能，也不是修改 bug 的代码变动）
- `perf`：性能优化
- `test`：增加测试
- `chore`：构建过程或辅助工具的变动
- `revert`：回滚

### 示例

```bash
# 新功能
git commit -m "feat(audio): 添加录音暂停功能"

# Bug 修复
git commit -m "fix(speech): 修复语音识别在安静环境下失效的问题"

# 文档更新
git commit -m "docs(readme): 更新 AIX 打包说明"

# 重构
git commit -m "refactor(service): 重构 AI 服务调用逻辑"
```

## Pull Request 流程

### 1. 准备工作

- 确保你的代码符合代码规范
- 运行测试确保没有破坏现有功能
- 更新文档（如果需要）

### 2. 创建 PR

- 使用清晰的标题
- 描述你做了什么更改
- 关联相关的 Issue

**PR 模板**：

```markdown
## 描述

简要描述你的更改。

## 更改类型

- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 重构
- [ ] 其他

## 测试

描述你如何测试你的更改。

## 截图（如果适用）

[附加截图]

## 相关 Issue

Closes #123
```

### 3. 代码审查

- 至少需要一位维护者审查
- 解决所有审查意见
- 确保 CI 通过

### 4. 合并

- 使用 "Squash and Merge" 合并
- 删除功能分支

## 开发技巧

### 调试

```bash
# 启用调试日志
DEBUG=* npm run dev

# 查看网络请求
DEBUG=network npm run dev
```

### 测试

```bash
# 运行所有测试
npm test

# 运行特定测试
npm test -- --grep "InterviewService"

# 生成覆盖率报告
npm run test:coverage
```

### 构建

```bash
# 构建 AIX 包
rokid-cli build

# 构建并安装到设备
rokid-cli build && rokid-cli install dist/*.aix
```

## 常见问题

### Q: 如何在本地测试 Rokid AIUI 功能？

A: 项目支持 Mock 模式，未配置 API Key 时会自动降级到 Mock 数据。你也可以使用浏览器的 Web Speech API 进行测试。

### Q: 如何添加新的页面？

A: 
1. 在 `pages/` 目录下创建新目录
2. 创建 `index.ux` 文件
3. 在 `app.json` 的 `router.pages` 中添加路由
4. 在 `app.ux` 中添加页面引用

### Q: 如何修改 AI 提示词？

A: 编辑 `src/prompts/` 目录下的 Prompt 模板文件。

## 联系方式

- GitHub Issues：https://github.com/yourusername/RokidInterviewCrusher/issues
- 邮箱：your-email@example.com

## 致谢

感谢所有为本项目做出贡献的人！

---

**参与贡献即表示你同意本项目的贡献指南。**
