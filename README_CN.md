# RokidInterviewCrusher - 吊打面试官

## 🎉 项目完成！

项目已成功创建，可以进行 AIX 打包。

## 📦 快速开始

### 1. 验证项目结构

```bash
npm run structure
```

### 2. 运行测试

```bash
npm test
```

### 3. 浏览器预览

```bash
# 使用 Python
python -m http.server 8080

# 或使用 Node.js
npx serve .
```

打开浏览器访问 `http://localhost:8080`

### 4. AIX 打包

```bash
# 安装 Rokid AIUI CLI
npm install -g @rokid/aiui-cli

# 登录开发者账号
rokid-cli login

# 打包为 AIX
rokid-cli build

# 安装到设备
rokid-cli install dist/*.aix
```

## 📁 项目结构

```
RokidInterviewCrusher/
├── app.json                    # 应用配置（AIX 打包必需）
├── app.ux                      # 应用入口
├── pages/                      # 页面文件
│   ├── HomePage/index.ux
│   ├── InterviewPage/index.ux
│   ├── ReviewPage/index.ux
│   └── SettingsPage/index.ux
├── src/                        # 源代码
│   ├── services/               # 服务层
│   ├── prompts/                # Prompt 模板
│   ├── utils/                  # 工具函数
│   └── mock/                   # Mock 数据
└── assets/                     # 资源文件
```

## ✨ 核心功能

1. **实时面试关键词提示** - AI 分析问题并生成关键词
2. **面试过程录音** - 用户主动控制，合规提示
3. **面试文本转写** - 语音识别转文本
4. **面试复盘分析** - 综合评分和改进建议
5. **个性化配置** - 岗位、技术栈、API 配置

## 🔧 技术栈

- Rokid AIUI 框架
- JavaScript / TypeScript
- OpenAI 兼容接口
- LocalStorage

## 📚 文档

- [README.md](README.md) - 项目说明
- [DEPLOYMENT.md](DEPLOYMENT.md) - 部署说明
- [CONTRIBUTING.md](CONTRIBUTING.md) - 贡献指南
- [CHANGELOG.md](CHANGELOG.md) - 更新日志
- [SECURITY.md](SECURITY.md) - 安全政策

## 🧪 测试

```bash
# 运行单元测试
npm test

# 运行项目结构测试
npm run structure

# 运行代码规范检查
npm run lint
```

## 📞 支持

- GitHub Issues：https://github.com/yourusername/RokidInterviewCrusher/issues

## 📄 许可证

MIT License

---

**项目状态**：✅ 完成，可以进行 AIX 打包
