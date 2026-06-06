/**
 * Mock 面试问题数据
 * 用于模拟面试官提问，开发测试阶段使用
 */

// 模拟面试问题列表
export const mockQuestions = [
  // 项目经历类
  {
    id: 'q001',
    text: '介绍一下你做过的最有挑战性的项目？',
    type: '项目经历',
    category: 'project',
  },
  {
    id: 'q002',
    text: '你在项目中遇到过哪些技术难点，是如何解决的？',
    type: '项目经历',
    category: 'project',
  },
  {
    id: 'q003',
    text: '你做过哪些 Spring Cloud 项目？',
    type: '项目经历',
    category: 'project',
  },

  // 技术原理类
  {
    id: 'q004',
    text: 'HashMap 的底层原理是什么？',
    type: '技术原理',
    category: 'technical',
  },
  {
    id: 'q005',
    text: 'JVM 的垃圾回收机制是如何工作的？',
    type: '技术原理',
    category: 'technical',
  },
  {
    id: 'q006',
    text: 'Redis 的持久化方式有哪些？',
    type: '技术原理',
    category: 'technical',
  },

  // 系统设计类
  {
    id: 'q007',
    text: '如何设计一个高并发的秒杀系统？',
    type: '系统设计',
    category: 'design',
  },
  {
    id: 'q008',
    text: '如何设计一个分布式锁？',
    type: '系统设计',
    category: 'design',
  },
  {
    id: 'q009',
    text: '微服务架构下如何保证数据一致性？',
    type: '系统设计',
    category: 'design',
  },

  // 八股基础类
  {
    id: 'q010',
    text: 'MySQL 的索引原理是什么？',
    type: '八股基础',
    category: 'basic',
  },
  {
    id: 'q011',
    text: 'TCP 三次握手的过程是怎样的？',
    type: '八股基础',
    category: 'basic',
  },
  {
    id: 'q012',
    text: '什么是 RESTful API？',
    type: '八股基础',
    category: 'basic',
  },

  // 行为面试类
  {
    id: 'q013',
    text: '你如何处理与团队成员的意见分歧？',
    type: '行为面试',
    category: 'behavioral',
  },
  {
    id: 'q014',
    text: '描述一次你在压力下工作的经历。',
    type: '行为面试',
    category: 'behavioral',
  },
  {
    id: 'q015',
    text: '你最近学习了什么新技术？',
    type: '行为面试',
    category: 'behavioral',
  },
];

/**
 * 获取随机问题
 * @param {number} count - 获取问题数量
 * @returns {Array} 随机问题数组
 */
export function getRandomQuestions(count = 1) {
  const shuffled = [...mockQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

/**
 * 根据类型获取问题
 * @param {string} type - 问题类型
 * @returns {Array} 该类型的问题数组
 */
export function getQuestionsByType(type) {
  return mockQuestions.filter(q => q.type === type);
}

/**
 * 模拟问题流（用于开发测试）
 * 每隔一段时间返回一个问题
 * @param {Function} onQuestion - 问题回调函数
 * @param {number} interval - 问题间隔（毫秒）
 * @returns {Function} 停止函数
 */
export function startMockQuestionStream(onQuestion, interval = 5000) {
  let index = 0;
  const questions = getRandomQuestions(10);

  const timer = setInterval(() => {
    if (index < questions.length) {
      onQuestion(questions[index]);
      index++;
    } else {
      clearInterval(timer);
    }
  }, interval);

  return () => clearInterval(timer);
}

export default mockQuestions;
