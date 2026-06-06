/**
 * Mock 面试转写数据
 * 用于模拟完整的面试对话记录，开发测试阶段使用
 */

// 模拟面试转写记录
export const mockInterviewTranscript = {
  id: 'interview_001',
  startTime: Date.now() - 1800000, // 30 分钟前
  endTime: Date.now(),
  targetRole: 'Java 后端',
  techStack: ['Spring Boot', 'Spring Cloud', 'MySQL', 'Redis', 'Kafka'],
  duration: 1800000, // 30 分钟
  transcript: [
    {
      speaker: 'interviewer',
      time: 0,
      text: '你好，请先简单介绍一下自己。',
    },
    {
      speaker: 'candidate',
      time: 30000,
      text: '您好，我叫张三，有 5 年 Java 后端开发经验。目前在一家互联网公司担任高级工程师，主要负责微服务架构设计和核心业务系统开发。熟悉 Spring Cloud 全家桶，有丰富的分布式系统设计经验。',
    },
    {
      speaker: 'interviewer',
      time: 60000,
      text: '好的，请介绍一下你做过的最有挑战性的项目。',
    },
    {
      speaker: 'candidate',
      time: 90000,
      text: '我最有挑战的项目是去年负责的电商平台订单系统重构。原来是一个单体应用，日订单量 10 万，但随着业务增长，系统经常出现性能瓶颈。我负责将其拆分为微服务架构，使用 Spring Cloud 实现服务治理，引入 Kafka 进行异步处理，最终将系统吞吐量提升了 3 倍，订单处理延迟从 500ms 降低到 100ms。',
    },
    {
      speaker: 'interviewer',
      time: 120000,
      text: '在这个项目中，你遇到过哪些技术难点？是如何解决的？',
    },
    {
      speaker: 'candidate',
      time: 150000,
      text: '最大的难点是分布式事务的一致性问题。订单、库存、支付三个服务需要保证数据一致性。我们最终采用了 Seata 的 AT 模式，结合本地消息表的方式。对于核心链路，使用 TCC 模式保证强一致性。同时设计了补偿机制和告警系统，确保异常情况下的数据修复。',
    },
    {
      speaker: 'interviewer',
      time: 180000,
      text: '你对 Spring Cloud 的哪些组件比较熟悉？',
    },
    {
      speaker: 'candidate',
      time: 210000,
      text: '我比较熟悉 Nacos、Gateway、OpenFeign、Sentinel 这几个组件。Nacos 用于服务注册发现和配置管理，Gateway 做网关路由和限流，OpenFeign 做服务间调用，Sentinel 做熔断降级。在实际项目中，我深入研究过 Nacos 的源码，了解其一致性协议 Raft 的实现原理。',
    },
    {
      speaker: 'interviewer',
      time: 240000,
      text: '说说你对微服务架构的理解，什么时候适合用微服务？',
    },
    {
      speaker: 'candidate',
      time: 270000,
      text: '微服务适合业务复杂、团队规模大、需要独立部署和扩展的场景。它的优势是松耦合、独立部署、技术栈灵活。但也会带来分布式事务、服务治理、链路追踪等复杂性。我的经验是，如果团队小于 10 人，业务复杂度不高，单体应用可能更合适。微服务不是银弹，要根据实际业务场景来选择。',
    },
    {
      speaker: 'interviewer',
      time: 300000,
      text: '你有什么问题想问我的吗？',
    },
    {
      speaker: 'candidate',
      time: 330000,
      text: '请问这个岗位的主要职责是什么？团队的技术栈是怎样的？',
    },
  ],
};

/**
 * 获取完整的面试文本
 * @param {Object} transcript - 面试转写对象
 * @returns {string} 完整的面试文本
 */
export function getFullTranscriptText(transcript) {
  if (!transcript || !transcript.transcript) return '';
  return transcript.transcript
    .map(item => `${item.speaker === 'interviewer' ? '面试官' : '候选人'}：${item.text}`)
    .join('\n\n');
}

/**
 * 获取候选人回答摘要
 * @param {Object} transcript - 面试转写对象
 * @returns {Array} 回答摘要数组
 */
export function getCandidateAnswers(transcript) {
  if (!transcript || !transcript.transcript) return [];
  return transcript.transcript
    .filter(item => item.speaker === 'candidate')
    .map(item => item.text);
}

/**
 * 获取面试官问题列表
 * @param {Object} transcript - 面试转写对象
 * @returns {Array} 问题列表
 */
export function getInterviewerQuestions(transcript) {
  if (!transcript || !transcript.transcript) return [];
  return transcript.transcript
    .filter(item => item.speaker === 'interviewer')
    .map(item => item.text);
}

/**
 * 计算面试时长
 * @param {Object} transcript - 面试转写对象
 * @returns {number} 时长（毫秒）
 */
export function calculateDuration(transcript) {
  if (!transcript) return 0;
  return transcript.endTime - transcript.startTime;
}

export default mockInterviewTranscript;
