# 部署说明

本文档说明如何将 RokidInterviewCrusher 项目部署到 Rokid 智能眼镜。

## 📋 前置条件

### 1. 开发环境

- Node.js >= 18.0.0
- Rokid AIUI CLI 工具
- Rokid 开发者账号

### 2. 安装 Rokid AIUI CLI

```bash
npm install -g @rokid/aiui-cli
```

### 3. 登录开发者账号

```bash
rokid-cli login
```

## 🚀 部署步骤

### 步骤 1：验证项目结构

运行项目结构测试脚本：

```bash
node test-structure.js
```

确保所有文件都通过验证。

### 步骤 2：安装依赖

```bash
npm install
```

### 步骤 3：构建项目

```bash
# 构建 AIX 包
rokid-cli build
```

构建完成后，会在 `dist/` 目录生成 `.aix` 文件。

### 步骤 4：安装到设备

#### 方式一：通过 USB 安装

1. 将 Rokid 智能眼镜通过 USB 连接到电脑
2. 确保设备已开启开发者模式
3. 运行安装命令：

```bash
rokid-cli install dist/rokid-interview-crusher.aix
```

#### 方式二：通过 ADB 安装

```bash
adb install dist/rokid-interview-crusher.aix
```

#### 方式三：通过 Rokid Studio 安装

1. 打开 Rokid Studio
2. 连接设备
3. 导入 `.aix` 文件
4. 点击安装

### 步骤 5：启动应用

在 Rokid 智能眼镜上找到"吊打面试官"应用，点击启动。

## 🔧 开发模式

### 本地开发

```bash
# 启动开发服务器
npm run dev
```

### 浏览器预览

```bash
# 使用 Python
python -m http.server 8080

# 使用 Node.js
npx serve .
```

打开浏览器访问 `http://localhost:8080`

### 调试模式

```bash
# 启用调试日志
DEBUG=* npm run dev
```

## 📦 打包配置

### app.json 配置

```json
{
  "package": "com.rokid.interview.crusher",
  "name": "吊打面试官",
  "versionName": "1.0.0",
  "versionCode": 1,
  "minPlatformVersion": 1000,
  "icon": "/assets/icon.png",
  "features": [
    { "name": "system.audio" },
    { "name": "system.speech" },
    { "name": "system.storage" },
    { "name": "system.network" },
    { "name": "system.prompt" }
  ]
}
```

### 版本更新

更新 `app.json` 中的版本信息：

```json
{
  "versionName": "1.1.0",
  "versionCode": 2
}
```

然后重新打包：

```bash
rokid-cli build
```

## 🐛 常见问题

### 1. 打包失败：缺少 app.json

确保项目根目录包含 `app.json` 文件。

### 2. 打包失败：页面文件格式错误

确保所有页面文件使用 `.ux` 格式，并包含 `<template>`、`<script>`、`<style>` 标签。

### 3. 安装失败：设备未连接

检查 USB 连接，确保设备已开启开发者模式：

```bash
# 检查设备连接
adb devices
```

### 4. 应用崩溃：权限不足

确保 `app.json` 中声明了所需的系统能力：

```json
{
  "features": [
    { "name": "system.audio" },
    { "name": "system.speech" }
  ]
}
```

### 5. 语音识别不工作

检查设备麦克风权限，确保 `system.speech` 能力已声明。

## 📊 性能优化

### 1. 减少包体积

- 压缩图片资源
- 移除未使用的代码
- 使用 Tree Shaking

### 2. 优化启动速度

- 延迟加载非关键资源
- 减少初始化时的网络请求
- 使用缓存

### 3. 优化内存使用

- 及时释放不用的资源
- 避免内存泄漏
- 使用弱引用

## 🔒 安全注意事项

1. **API Key 安全**：不要将 API Key 硬编码在代码中，使用用户配置
2. **数据安全**：录音数据本地存储，不自动上传
3. **权限控制**：只请求必要的系统权限
4. **合规提示**：录音前必须获得用户授权

## 📞 技术支持

- 官方文档：https://js.rokid.com/AIUI/
- 开发者社区：https://developer.rokid.com
- 问题反馈：https://github.com/yourusername/RokidInterviewCrusher/issues

## 📝 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 实时面试关键词提示
- 面试录音和转写
- 面试复盘分析
- 用户配置管理
