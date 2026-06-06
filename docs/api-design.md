# API 设计文档

## 1. 概述

本文档描述了 RokidInterviewCrusher 项目的内部 API 设计，包括各服务层的接口定义和数据结构。

## 2. 服务层 API

### 2.1 AudioService（音频录音服务）

#### startRecording()
开始录音。

**返回值**：`Promise<boolean>` - 是否开始成功

**示例**：
```javascript
const success = await audioService.startRecording();
if (success) {
  console.log('录音已开始');
}
```

#### stopRecording()
停止录音。

**返回值**：`Promise<Blob|null>` - 录音文件 Blob

**示例**：
```javascript
const audioBlob = await audioService.stopRecording();
if (audioBlob) {
  console.log('录音已停止，文件大小:', audioBlob.size);
}
```

#### getRecordingStatus()
获取录音状态。

**返回值**：`Object`
```javascript
{
  status: 'recording',  // 状态：idle/recording/completed
  isRecording: true,    // 是否正在录音
  duration: 120000,     // 录音时长（毫秒）
  hasAudio: true        // 是否有录音数据
}
```

#### getDuration()
获取录音时长。

**返回值**：`number` - 录音时长（毫秒）

#### getAudioBlob()
获取录音 Blob。

**返回值**：`Blob|null` - 录音 Blob

#### reset()
重置服务状态。

---

### 2.2 SpeechService（语音识别服务）

#### startRealtimeTranscription(onText)
开始实时语音识别。

**参数**：
- `onText: Function` - 文本回调函数 `(text: string, isFinal: boolean) => void`

**返回值**：`Promise<boolean>` - 是否开始成功

**示例**：
```javascript
await speechService.startRealtimeTranscription((text, isFinal) => {
  console.log('识别文本:', text, '是否最终:', isFinal);
});
```

#### stopRealtimeTranscription()
停止实时语音识别。

**返回值**：`Promise<boolean>` - 是否停止成功

#### transcribeAudio(audioFile)
将完整录音转写成文本。

**参数**：
- `audioFile: Blob|File` - 音频文件

**返回值**：`Promise<string>` - 转写文本

**示例**：
```javascript
const text = await speechService.transcribeAudio(audioBlob);
console.log('转写文本:', text);
```

#### getStatus()
获取识别状态。

**返回值**：`Object`
```javascript
{
  isRecognizing: true,  // 是否正在识别
  mode: 'web-speech'    // 识别模式：rokid/web-speech/mock
}
```

#### reset()
重置服务状态。

---

### 2.3 AIService（AI 大模型服务）

#### generateRealtimeHint(question, userProfile)
生成实时面试关键词提示。

**参数**：
- `question: string` - 面试官问题
- `userProfile: Object` - 用户画像

**返回值**：`Promise<Object>` - 关键词提示

**示例**：
```javascript
const hints = await aiService.generateRealtimeHint(
  '介绍一下你做过的 Spring Cloud 项目',
  { targetRole: 'Java 后端', techStack: ['Spring Cloud'] }
);
console.log('提示:', hints);
// 输出:
// {
//   questionType: '项目经历',
//   hints: ['STAR法则', '项目规模', '技术点', '亮点', '量化结果'],
//   warning: '注意不要夸大项目规模'
// }
```

#### generateInterviewReview(transcript, userProfile)
生成面试复盘报告。

**参数**：
- `transcript: string` - 面试完整转写文本
- `userProfile: Object` - 用户画像

**返回值**：`Promise<Object>` - 复盘报告

**示例**：
```javascript
const review = await aiService.generateInterviewReview(
  '面试官：介绍一下你的项目...',
  { targetRole: 'Java 后端', techStack: ['Spring Cloud'] }
);
console.log('复盘报告:', review);
// 输出:
// {
//   summary: '本次面试整体表现良好...',
//   scores: { technicalDepth: 7.5, communication: 6.8, logic: 7.0, jobMatch: 7.2 },
//   questions: [...],
//   topProblems: [...],
//   nextPreparationPlan: [...]
// }
```

#### callLLM(prompt)
调用大模型接口。

**参数**：
- `prompt: string` - Prompt 文本

**返回值**：`Promise<string>` - 模型返回的文本

#### hasApiKey()
检查是否配置了 API Key。

**返回值**：`boolean`

#### refreshConfig()
刷新配置。

---

### 2.4 InterviewService（面试业务服务）

#### startInterview(userProfile)
开始面试。

**参数**：
- `userProfile: Object` - 用户画像

**返回值**：`Promise<boolean>` - 是否开始成功

**示例**：
```javascript
const userProfile = storageService.getUserProfile();
const success = await interviewService.startInterview(userProfile);
if (success) {
  console.log('面试已开始');
}
```

#### endInterview()
结束面试。

**返回值**：`Promise<Object|null>` - 面试记录

**示例**：
```javascript
const record = await interviewService.endInterview();
if (record) {
  console.log('面试记录:', record);
  console.log('复盘报告:', record.review);
}
```

#### handleRecognizedText(text, isFinal, userProfile)
处理识别到的文本。

**参数**：
- `text: string` - 识别到的文本
- `isFinal: boolean` - 是否是最终结果
- `userProfile: Object` - 用户画像

#### isInterviewQuestion(text)
判断文本是否是面试问题。

**参数**：
- `text: string` - 识别到的文本

**返回值**：`boolean` - 是否是面试问题

#### getStatus()
获取当前面试状态。

**返回值**：`Object`
```javascript
{
  status: 'recording',      // 状态
  isRecording: true,        // 是否正在录音
  currentQuestion: '...',   // 当前问题
  currentHints: {...},      // 当前提示
  questionCount: 3,         // 问题数量
  duration: 120000          // 录音时长
}
```

#### getCurrentHints()
获取当前提示。

**返回值**：`Object|null` - 当前提示

#### getQuestions()
获取问题列表。

**返回值**：`Array` - 问题列表

#### registerCallbacks(callbacks)
注册回调函数。

**参数**：
- `callbacks: Object` - 回调函数集合
  - `onStatusChange: Function` - 状态变化回调
  - `onQuestionDetected: Function` - 问题检测回调
  - `onHintsGenerated: Function` - 提示生成回调
  - `onError: Function` - 错误回调

#### reset()
重置服务状态。

---

### 2.5 StorageService（本地存储服务）

#### saveInterviewRecord(record)
保存面试记录。

**参数**：
- `record: Object` - 面试记录

**返回值**：`Object` - 保存后的记录（包含 ID）

**示例**：
```javascript
const record = {
  startTime: Date.now(),
  targetRole: 'Java 后端',
  techStack: ['Spring Boot'],
  // ...
};
const saved = storageService.saveInterviewRecord(record);
console.log('记录 ID:', saved.id);
```

#### getInterviewRecords()
获取所有面试记录。

**返回值**：`Array` - 面试记录数组

#### getLatestInterviewRecord()
获取最近一次面试记录。

**返回值**：`Object|null` - 最近的面试记录

#### getInterviewRecordById(id)
根据 ID 获取面试记录。

**参数**：
- `id: string` - 记录 ID

**返回值**：`Object|null` - 面试记录

#### deleteInterviewRecord(id)
删除面试记录。

**参数**：
- `id: string` - 记录 ID

**返回值**：`boolean` - 是否删除成功

#### clearInterviewRecords()
清空所有面试记录。

#### saveUserProfile(profile)
保存用户配置。

**参数**：
- `profile: Object` - 用户配置

#### getUserProfile()
获取用户配置。

**返回值**：`Object` - 用户配置

#### saveAIConfig(config)
保存 AI 配置。

**参数**：
- `config: Object` - AI 配置

#### getAIConfig()
获取 AI 配置。

**返回值**：`Object` - AI 配置

#### set(key, value)
保存数据。

**参数**：
- `key: string` - 存储键
- `value: any` - 要保存的值

#### get(key, defaultValue)
获取数据。

**参数**：
- `key: string` - 存储键
- `defaultValue: any` - 默认值

**返回值**：`any` - 存储的值

#### remove(key)
删除数据。

**参数**：
- `key: string` - 存储键

#### clear()
清空所有数据。

---

## 3. Prompt API

### 3.1 generateRealtimeHintPrompt(question, userProfile)
生成实时提示 Prompt。

**参数**：
- `question: string` - 面试官问题
- `userProfile: Object` - 用户画像

**返回值**：`string` - Prompt 文本

### 3.2 generateReviewPrompt(transcript, userProfile)
生成复盘分析 Prompt。

**参数**：
- `transcript: string` - 面试完整转写文本
- `userProfile: Object` - 用户画像

**返回值**：`string` - Prompt 文本

### 3.3 generateQuestionTypePrompt(text)
生成问题类型判断 Prompt。

**参数**：
- `text: string` - 识别到的文本

**返回值**：`string` - Prompt 文本

### 3.4 generateQuickFeedbackPrompt(question, answer)
生成快速评价 Prompt。

**参数**：
- `question: string` - 面试官问题
- `answer: string` - 候选人回答

**返回值**：`string` - Prompt 文本

### 3.5 generateSummaryReportPrompt(interviews)
生成总结报告 Prompt。

**参数**：
- `interviews: Array` - 面试记录数组

**返回值**：`string` - Prompt 文本

---

## 4. 工具函数 API

### 4.1 formatTime(timestamp)
格式化时间为可读字符串。

**参数**：
- `timestamp: Date|number` - 时间戳或 Date 对象

**返回值**：`string` - 格式化后的时间字符串

**示例**：
```javascript
formatTime(Date.now()); // "2024-01-15 14:30:00"
```

### 4.2 formatDuration(durationMs)
格式化时长。

**参数**：
- `durationMs: number` - 时长（毫秒）

**返回值**：`string` - 格式化后的时长字符串

**示例**：
```javascript
formatDuration(1800000); // "30:00"
```

### 4.3 formatScore(score)
格式化分数。

**参数**：
- `score: number` - 分数

**返回值**：`string` - 格式化后的分数

**示例**：
```javascript
formatScore(7.5); // "7.5"
```

### 4.4 truncateText(text, maxLength)
截断文本。

**参数**：
- `text: string` - 原始文本
- `maxLength: number` - 最大长度，默认 50

**返回值**：`string` - 截断后的文本

### 4.5 formatHints(hints, maxHints)
格式化提示列表。

**参数**：
- `hints: string[]` - 提示数组
- `maxHints: number` - 最大提示数，默认 6

**返回值**：`string` - 格式化后的提示文本

### 4.6 getScoreLevel(score)
获取评分等级。

**参数**：
- `score: number` - 分数（0-10）

**返回值**：`string` - 评分等级

**示例**：
```javascript
getScoreLevel(8); // "良好"
```

### 4.7 formatDateShort(timestamp)
格式化日期为简短形式。

**参数**：
- `timestamp: Date|number` - 时间戳或 Date 对象

**返回值**：`string` - 简短日期字符串

**示例**：
```javascript
formatDateShort(Date.now()); // "01-15 14:30"
```

### 4.8 generateId()
生成唯一 ID。

**返回值**：`string` - 唯一 ID

### 4.9 deepClone(obj)
深拷贝对象。

**参数**：
- `obj: any` - 要拷贝的对象

**返回值**：`any` - 拷贝后的对象

### 4.10 sleep(ms)
延迟执行。

**参数**：
- `ms: number` - 延迟毫秒数

**返回值**：`Promise<void>`

---

## 5. Mock API

### 5.1 getRandomQuestions(count)
获取随机问题。

**参数**：
- `count: number` - 获取问题数量，默认 1

**返回值**：`Array` - 随机问题数组

### 5.2 getQuestionsByType(type)
根据类型获取问题。

**参数**：
- `type: string` - 问题类型

**返回值**：`Array` - 该类型的问题数组

### 5.3 startMockQuestionStream(onQuestion, interval)
模拟问题流。

**参数**：
- `onQuestion: Function` - 问题回调函数
- `interval: number` - 问题间隔（毫秒），默认 5000

**返回值**：`Function` - 停止函数

### 5.4 getFullTranscriptText(transcript)
获取完整的面试文本。

**参数**：
- `transcript: Object` - 面试转写对象

**返回值**：`string` - 完整的面试文本

### 5.5 getCandidateAnswers(transcript)
获取候选人回答摘要。

**参数**：
- `transcript: Object` - 面试转写对象

**返回值**：`Array` - 回答摘要数组

### 5.6 getInterviewerQuestions(transcript)
获取面试官问题列表。

**参数**：
- `transcript: Object` - 面试转写对象

**返回值**：`Array` - 问题列表

### 5.7 calculateDuration(transcript)
计算面试时长。

**参数**：
- `transcript: Object` - 面试转写对象

**返回值**：`number` - 时长（毫秒）

---

## 6. 数据结构

### 6.1 UserProfile（用户配置）
```typescript
interface UserProfile {
  targetRole: string;      // 目标岗位
  techStack: string[];     // 技术栈
  resumeKeywords: string[]; // 简历关键词
}
```

### 6.2 AIConfig（AI 配置）
```typescript
interface AIConfig {
  baseUrl: string;  // API 地址
  apiKey: string;   // API 密钥
  model: string;    // 模型名称
}
```

### 6.3 InterviewRecord（面试记录）
```typescript
interface InterviewRecord {
  id: string;                    // 记录 ID
  createdAt: number;             // 创建时间
  startTime: number;             // 开始时间
  endTime: number;               // 结束时间
  targetRole: string;            // 目标岗位
  techStack: string[];           // 技术栈
  duration: number;              // 时长（毫秒）
  questions: Question[];         // 问题列表
  transcript: TranscriptItem[];  // 转写记录
  review: ReviewReport;          // 复盘报告
  status: string;                // 状态
}
```

### 6.4 Question（问题）
```typescript
interface Question {
  question: string;    // 问题文本
  hints: Hints;        // 提示
  timestamp: number;   // 时间戳
}
```

### 6.5 Hints（提示）
```typescript
interface Hints {
  questionType: string;   // 问题类型
  hints: string[];        // 提示列表
  warning: string;        // 注意事项
}
```

### 6.6 TranscriptItem（转写项）
```typescript
interface TranscriptItem {
  speaker: string;  // 说话人：interviewer/candidate
  time: number;     // 时间戳
  text: string;     // 文本内容
}
```

### 6.7 ReviewReport（复盘报告）
```typescript
interface ReviewReport {
  summary: string;           // 整体评价
  scores: Scores;            // 评分
  questions: QuestionReview[]; // 问题分析
  topProblems: string[];     // 主要问题
  nextPreparationPlan: string[]; // 下一步计划
}
```

### 6.8 Scores（评分）
```typescript
interface Scores {
  technicalDepth: number;  // 技术深度
  communication: number;   // 表达清晰度
  logic: number;           // 逻辑结构
  jobMatch: number;        // 岗位匹配度
}
```

### 6.9 QuestionReview（问题分析）
```typescript
interface QuestionReview {
  question: string;            // 问题
  answerSummary: string;       // 回答摘要
  strengths: string[];         // 优点
  weaknesses: string[];        // 不足
  betterAnswerStructure: string[]; // 建议结构
}
```

---

## 7. 错误处理

### 7.1 错误类型
- `AudioError`：音频相关错误
- `SpeechError`：语音识别错误
- `AIError`：AI 调用错误
- `StorageError`：存储错误

### 7.2 错误回调
```javascript
interviewService.registerCallbacks({
  onError: (error) => {
    console.error('错误:', error);
    // 显示错误提示
  }
});
```

### 7.3 降级策略
- AI API 不可用时，使用 Mock 数据
- 语音识别不可用时，使用 Mock 问题流
- 录音不可用时，使用 Mock 模式

---

## 8. 扩展点

### 8.1 Rokid AIUI 适配
在各服务中预留了 Rokid AIUI 适配器接口：

```javascript
// TODO: 接入 Rokid AIUI 真实 API
if (window.RokidAIUI && window.RokidAIUI.Audio) {
  this.rokidRecorder = new window.RokidAIUI.Audio.Recorder();
}
```

### 8.2 自定义 Prompt
支持通过配置自定义 Prompt 模板。

### 8.3 多语言支持
预留多语言接口，可扩展支持英文等语言。

### 8.4 云端同步
预留云端数据同步接口，可扩展支持数据备份和恢复。
