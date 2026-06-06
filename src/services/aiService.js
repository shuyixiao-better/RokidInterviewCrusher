/**
 * AI 大模型服务
 * 负责调用大模型接口进行问题分析和复盘生成
 *
 * 注意：
 * 1. 优先使用用户配置的 API
 * 2. 如果未配置 API Key，返回 Mock 数据
 * 3. 支持 OpenAI 兼容接口
 */

import { generateRealtimeHintPrompt } from '../prompts/realtimeHintPrompt.js';
import { generateReviewPrompt } from '../prompts/reviewPrompt.js';
import storageService from './storageService.js';
import { MOCK_DELAY } from '../utils/constants.js';
import { sleep } from '../utils/format.js';

/**
 * AI 服务类
 */
class AIService {
  constructor() {
    this.config = null;
    this.session = null;
  }

  /**
   * 获取 AI 配置
   * @returns {Object} AI 配置
   */
  getConfig() {
    if (!this.config) {
      this.config = storageService.getAIConfig();
    }
    return this.config;
  }

  /**
   * 刷新配置
   */
  refreshConfig() {
    this.config = storageService.getAIConfig();
  }

  async hasNativeLanguageModel() {
    try {
      if (typeof LanguageModel === 'undefined' || typeof LanguageModel.availability !== 'function') {
        return false;
      }
      const status = await LanguageModel.availability();
      return status === 'available';
    } catch (error) {
      console.warn('[AIService] LanguageModel availability 检测失败:', error);
      return false;
    }
  }

  async ensureNativeSession() {
    if (this.session) {
      return this.session;
    }

    const config = this.getConfig();
    const options = {
      initialPrompts: [
        {
          role: 'system',
          content: '你是一个专业的面试辅导助手。严格按用户要求输出 JSON，不要输出 JSON 之外的内容。',
        },
      ],
    };

    if (config.model && config.model.trim()) {
      options.model = config.model.trim();
    }

    this.session = await LanguageModel.create(options);
    return this.session;
  }

  /**
   * 检查是否配置了 API Key
   * @returns {boolean}
   */
  hasApiKey() {
    const config = this.getConfig();
    return config.apiKey && config.apiKey.trim() !== '';
  }

  /**
   * 调用大模型接口
   * @param {string} prompt - Prompt 文本
   * @returns {Promise<string>} 模型返回的文本
   */
  async callLLM(prompt) {
    const config = this.getConfig();

    if (await this.hasNativeLanguageModel()) {
      try {
        const session = await this.ensureNativeSession();
        return await session.prompt(prompt);
      } catch (error) {
        console.error('[AIService] 调用原生 LanguageModel 失败:', error);
      }
    }

    if (!this.hasApiKey()) {
      console.log('[AIService] 未配置 API Key，使用 Mock 数据');
      await sleep(MOCK_DELAY);
      return this.getMockResponse(prompt);
    }

    try {
      const response = await fetch(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`,
        },
        body: JSON.stringify({
          model: config.model,
          messages: [
            {
              role: 'system',
              content: '你是一个专业的面试辅导助手，请按照要求输出 JSON 格式。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' },
        }),
      });

      if (!response.ok) {
        throw new Error(`API 请求失败: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('[AIService] 调用大模型失败:', error);
      console.log('[AIService] 降级使用 Mock 数据');
      return this.getMockResponse(prompt);
    }
  }

  async speakText(text) {
    if (!text) {
      return false;
    }

    try {
      if (typeof speechSynthesis === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined') {
        return false;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      speechSynthesis.speak(utterance);
      return true;
    } catch (error) {
      console.warn('[AIService] TTS 播放失败:', error);
      return false;
    }
  }

  /**
   * 生成实时面试关键词提示
   * @param {string} question - 面试官问题
   * @param {Object} userProfile - 用户画像
   * @returns {Promise<Object>} 关键词提示 JSON
   */
  async generateRealtimeHint(question, userProfile) {
    const prompt = generateRealtimeHintPrompt(question, userProfile);
    const response = await this.callLLM(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('[AIService] 解析提示 JSON 失败:', error);
      return this.getMockHintResponse(question);
    }
  }

  /**
   * 生成面试复盘报告
   * @param {string} transcript - 面试完整转写文本
   * @param {Object} userProfile - 用户画像
   * @returns {Promise<Object>} 复盘报告 JSON
   */
  async generateInterviewReview(transcript, userProfile) {
    const prompt = generateReviewPrompt(transcript, userProfile);
    const response = await this.callLLM(prompt);

    try {
      return JSON.parse(response);
    } catch (error) {
      console.error('[AIService] 解析复盘 JSON 失败:', error);
      return this.getMockReviewResponse();
    }
  }

  /**
   * 获取 Mock 响应（根据 Prompt 内容返回对应的 Mock 数据）
   * @param {string} prompt - Prompt 文本
   * @returns {string} Mock JSON 字符串
   */
  getMockResponse(prompt) {
    if (prompt.includes('实时面试辅导') || prompt.includes('关键词提示')) {
      return JSON.stringify(this.getMockHintResponse());
    }
    if (prompt.includes('复盘') || prompt.includes('面试官')) {
      return JSON.stringify(this.getMockReviewResponse());
    }
    return JSON.stringify({ message: 'Mock 响应' });
  }

  /**
   * 获取 Mock 提示响应
   * @param {string} question - 问题（可选）
   * @returns {Object} Mock 提示数据
   */
  getMockHintResponse(question = '') {
    // 根据问题内容返回不同的提示
    if (question.includes('Spring Cloud') || question.includes('微服务')) {
      return {
        questionType: '项目经历',
        hints: [
          'STAR：背景/任务/行动/结果',
          '项目规模：用户量、QPS、数据量',
          '技术点：Nacos、Gateway、OpenFeign',
          '亮点：稳定性、性能优化',
          '结尾：量化结果',
        ],
        warning: '注意不要夸大项目规模',
      };
    }

    if (question.includes('HashMap') || question.includes('原理')) {
      return {
        questionType: '技术原理',
        hints: [
          '底层结构：数组+链表+红黑树',
          '扩容机制：负载因子0.75',
          '线程安全：ConcurrentHashMap',
          '哈希冲突：链地址法',
        ],
        warning: '',
      };
    }

    if (question.includes('设计') || question.includes('架构')) {
      return {
        questionType: '系统设计',
        hints: [
          '需求分析：功能性/非功能性',
          '技术选型：数据库、缓存、消息队列',
          '架构图：分层、模块、接口',
          '高可用：冗余、降级、限流',
          '扩展性：水平扩展、垂直扩展',
        ],
        warning: '注意讨论权衡取舍',
      };
    }

    // 默认提示
    return {
      questionType: '其他',
      hints: [
        'STAR法则：情境-任务-行动-结果',
        '量化数据：具体数字更有说服力',
        '技术深度：原理+实践',
        '表达清晰：逻辑分明',
      ],
      warning: '',
    };
  }

  /**
   * 获取 Mock 复盘响应
   * @returns {Object} Mock 复盘数据
   */
  getMockReviewResponse() {
    return {
      summary: '本次面试整体表现良好，候选人展示了扎实的技术基础和项目经验。在系统设计和技术原理方面表现出色，但在表达清晰度和逻辑结构上还有提升空间。',
      scores: {
        technicalDepth: 7.5,
        communication: 6.8,
        logic: 7.0,
        jobMatch: 7.2,
      },
      questions: [
        {
          question: '介绍一下你做过的最有挑战性的项目',
          answerSummary: '候选人介绍了电商平台订单系统重构项目，涉及微服务拆分、性能优化等技术点。',
          strengths: ['项目描述清晰', '技术点突出', '有量化结果'],
          weaknesses: ['缺少具体数据支撑', '未提及团队协作'],
          betterAnswerStructure: ['背景：业务痛点', '任务：个人职责', '行动：技术方案', '结果：量化收益'],
        },
        {
          question: '你在项目中遇到过哪些技术难点',
          answerSummary: '候选人提到分布式事务一致性问题，并介绍了 Seata 和本地消息表的解决方案。',
          strengths: ['问题定位准确', '解决方案合理', '有备选方案'],
          weaknesses: ['未说明踩坑过程', '缺少性能对比数据'],
          betterAnswerStructure: ['难点描述', '尝试方案', '最终方案', '效果对比'],
        },
      ],
      topProblems: [
        '回答缺少具体数据支撑，建议准备更多量化指标',
        '表达时逻辑不够清晰，建议使用 STAR 法则结构化回答',
      ],
      nextPreparationPlan: [
        '整理项目中的关键数据指标，如 QPS、延迟、成功率等',
        '练习使用 STAR 法则回答行为面试问题',
        '深入研究分布式事务的多种解决方案及其适用场景',
      ],
    };
  }
}

// 导出单例
const aiService = new AIService();
export default aiService;
