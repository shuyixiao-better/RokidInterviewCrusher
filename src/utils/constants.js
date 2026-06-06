/**
 * 项目常量定义
 * 包含配置、状态码、默认值等
 */

// 应用配置
export const APP_CONFIG = {
  name: '吊打面试官',
  subtitle: 'Rokid AI 面试训练助手',
  version: '1.0.0',
  maxRecordingDuration: 60 * 60 * 1000, // 最大录音时长 1 小时
  questionCheckDelay: 500, // 问题检测延迟（毫秒）
};

// 面试状态
export const INTERVIEW_STATUS = {
  IDLE: 'idle',
  RECORDING: 'recording',
  ANALYZING: 'analyzing',
  WAITING: 'waiting',
  COMPLETED: 'completed',
};

// 页面路由
export const ROUTES = {
  HOME: 'home',
  INTERVIEW: 'interview',
  REVIEW: 'review',
  SETTINGS: 'settings',
};

// 问题类型
export const QUESTION_TYPES = {
  PROJECT_EXPERIENCE: '项目经历',
  TECHNICAL_PRINCIPLE: '技术原理',
  SYSTEM_DESIGN: '系统设计',
  BASIC_KNOWLEDGE: '八股基础',
  BEHAVIORAL: '行为面试',
  SALARY: '薪资沟通',
  OTHER: '其他',
};

// 岗位方向
export const TARGET_ROLES = [
  { id: 'java-backend', name: 'Java 后端', keywords: ['Spring', '微服务', '分布式', '数据库'] },
  { id: 'ai-developer', name: 'AI 应用开发', keywords: ['机器学习', '深度学习', 'NLP', '大模型'] },
  { id: 'solution-architect', name: '解决方案架构师', keywords: ['架构设计', '技术选型', '系统设计', '性能优化'] },
  { id: 'frontend', name: '前端开发', keywords: ['React', 'Vue', 'TypeScript', '性能优化'] },
  { id: 'product-manager', name: '产品经理', keywords: ['需求分析', '产品设计', '用户研究', '数据分析'] },
];

// 默认技术栈
export const DEFAULT_TECH_STACK = {
  'java-backend': ['Java', 'Spring Boot', 'Spring Cloud', 'MySQL', 'Redis', 'Kafka', 'Docker', 'Kubernetes'],
  'ai-developer': ['Python', 'PyTorch', 'TensorFlow', 'LangChain', 'Hugging Face', 'CUDA', 'FastAPI'],
  'solution-architect': ['微服务', '分布式系统', '云原生', 'DevOps', 'CI/CD', '监控告警'],
  'frontend': ['React', 'Vue', 'TypeScript', 'Webpack', 'Vite', 'Node.js', 'CSS3'],
  'product-manager': ['Axure', 'Figma', 'SQL', '数据分析', '用户画像', 'A/B测试'],
};

// 问题识别关键词
export const QUESTION_KEYWORDS = [
  '什么', '为什么', '如何', '怎么', '介绍一下', '说一下', '讲一下',
  '你做过', '你了解', '区别', '原理', '场景', '项目', '优化', '排查', '设计',
];

// 评分维度
export const SCORE_DIMENSIONS = {
  TECHNICAL_DEPTH: 'technicalDepth',
  COMMUNICATION: 'communication',
  LOGIC: 'logic',
  JOB_MATCH: 'jobMatch',
};

// 评分维度中文名
export const SCORE_DIMENSION_NAMES = {
  [SCORE_DIMENSIONS.TECHNICAL_DEPTH]: '技术深度',
  [SCORE_DIMENSIONS.COMMUNICATION]: '表达清晰度',
  [SCORE_DIMENSIONS.LOGIC]: '逻辑结构',
  [SCORE_DIMENSIONS.JOB_MATCH]: '岗位匹配度',
};

// 存储键名
export const STORAGE_KEYS = {
  INTERVIEW_RECORDS: 'interview_records',
  USER_PROFILE: 'user_profile',
  AI_CONFIG: 'ai_config',
};

// 默认 AI 配置
export const DEFAULT_AI_CONFIG = {
  baseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
};

// Mock 延迟（毫秒）
export const MOCK_DELAY = 500;
