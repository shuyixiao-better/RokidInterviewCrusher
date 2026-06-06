# 安全政策

## 报告安全漏洞

如果你发现安全漏洞，请**不要**通过公开的 GitHub Issues 报告。

请通过以下方式联系我们：

- 邮箱：security@example.com
- GitHub Security Advisories：https://github.com/yourusername/RokidInterviewCrusher/security/advisories

我们会尽快回复你，并与你合作解决问题。

## 安全更新

安全更新会在发布说明中标记为 `[Security]`。建议用户尽快更新到最新版本。

## 支持的版本

| 版本 | 支持状态 |
|------|----------|
| 1.0.x | ✅ 支持 |
| < 1.0 | ❌ 不支持 |

## 安全最佳实践

### 1. API Key 安全

**问题**：API Key 可能被泄露

**建议**：
- 不要将 API Key 硬编码在代码中
- 使用用户配置存储 API Key
- 定期轮换 API Key
- 使用环境变量或配置文件

**示例**：

```javascript
// ✅ 好的：从用户配置读取
const apiKey = storageService.getAIConfig().apiKey;

// ❌ 不好的：硬编码
const apiKey = 'sk-...';
```

### 2. 数据安全

**问题**：录音数据可能包含敏感信息

**建议**：
- 录音数据本地存储
- 不自动上传到云端
- 用户可随时清空数据
- 加密存储敏感数据

**示例**：

```javascript
// ✅ 好的：本地存储
storageService.saveInterviewRecord(record);

// ❌ 不好的：自动上传
await fetch('/api/upload', { body: record });
```

### 3. 权限控制

**问题**：应用可能请求过多权限

**建议**：
- 只请求必要的权限
- 明确说明权限用途
- 提供权限拒绝的降级方案

**示例**：

```json
{
  "features": [
    { "name": "system.audio" },
    { "name": "system.speech" }
  ]
}
```

### 4. 输入验证

**问题**：用户输入可能包含恶意内容

**建议**：
- 验证所有用户输入
- 使用参数化查询
- 避免直接执行用户输入

**示例**：

```javascript
// ✅ 好的：验证输入
const validateInput = (input) => {
  if (typeof input !== 'string') return false;
  if (input.length > 1000) return false;
  return true;
};

// ❌ 不好的：直接使用
eval(userInput);
```

### 5. 网络安全

**问题**：API 请求可能被拦截

**建议**：
- 使用 HTTPS
- 验证 SSL 证书
- 不在 URL 中传递敏感信息

**示例**：

```javascript
// ✅ 好的：使用 HTTPS
const response = await fetch('https://api.example.com/data');

// ❌ 不好的：使用 HTTP
const response = await fetch('http://api.example.com/data');
```

## 安全审计

### 定期检查

- 依赖包漏洞：`npm audit`
- 代码安全扫描：ESLint Security Plugin
- 密钥泄露检测：GitGuardian

### 安全工具

```bash
# 检查依赖漏洞
npm audit

# 修复漏洞
npm audit fix

# 检查代码安全
npx eslint --plugin security .
```

## 事件响应

### 事件分类

| 严重程度 | 描述 | 响应时间 |
|----------|------|----------|
| 严重 | 数据泄露、远程代码执行 | 24 小时内 |
| 高 | 权限提升、身份验证绕过 | 48 小时内 |
| 中 | 信息泄露、拒绝服务 | 7 天内 |
| 低 | 代码质量、最佳实践 | 下个版本 |

### 响应流程

1. **接收报告**：确认收到安全报告
2. **评估影响**：分析漏洞影响范围
3. **开发修复**：开发安全补丁
4. **测试验证**：验证修复有效性
5. **发布更新**：发布安全更新
6. **通知用户**：通知用户更新

## 安全配置

### 环境变量

```bash
# .env 文件（不要提交到 Git）
API_KEY=sk-...
DATABASE_URL=postgres://...
SECRET_KEY=...
```

### 配置文件

```javascript
// config.js
const config = {
  api: {
    baseUrl: process.env.API_BASE_URL || 'https://api.example.com',
    timeout: 30000,
  },
  security: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedOrigins: ['https://example.com'],
  },
};
```

## 合规性

### 数据保护

- 遵守 GDPR（欧盟通用数据保护条例）
- 遵守 CCPA（加州消费者隐私法案）
- 用户有权访问、修改、删除其数据

### 录音合规

- 录音前必须获得用户授权
- 明确提示用户遵守当地法律法规
- 不提供隐蔽录音功能

### 使用场景

- ✅ 模拟面试训练
- ✅ 面试复盘分析
- ✅ 表达能力提升
- ❌ 正式面试作弊
- ❌ 隐蔽录音录像

## 安全相关资源

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [Rokid AIUI Security Guidelines](https://developer.rokid.com/docs/security)

## 联系方式

- 安全邮箱：security@example.com
- GitHub Security：https://github.com/yourusername/RokidInterviewCrusher/security

---

**感谢你帮助我们保持项目的安全性！**
