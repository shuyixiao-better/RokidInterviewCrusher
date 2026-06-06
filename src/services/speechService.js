/**
 * 语音识别服务
 * 负责实时语音转写和音频文件转文本
 *
 * 使用 Web SpeechRecognition API 进行语音识别
 */

import { mockQuestions, startMockQuestionStream } from '../mock/mockQuestions.js';
import { getFullTranscriptText } from '../mock/mockInterviewTranscript.js';

/**
 * 语音识别服务类
 */
class SpeechService {
  constructor() {
    this.isRecognizing = false;
    this.recognition = null;
    this.onTextCallback = null;
    this.mockStreamStopper = null;

    // 语音识别可用性
    this.isAvailable = false;

    // 初始化语音识别
    this.initRecognition();
  }

  /**
   * 初始化语音识别
   */
  initRecognition() {
    try {
      // 检查 SpeechRecognition 是否可用
      if (typeof SpeechRecognition === 'undefined' && typeof webkitSpeechRecognition === 'undefined') {
        console.warn('[SpeechService] SpeechRecognition 不可用，将使用 Mock 模式');
        this.isAvailable = false;
        return;
      }

      const SpeechRecognitionClass = SpeechRecognition || webkitSpeechRecognition;
      this.recognition = new SpeechRecognitionClass();

      // 配置语音识别
      this.recognition.lang = 'zh-CN';
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.maxAlternatives = 1;

      // 监听识别结果
      this.recognition.onresult = (event) => {
        const last = event.results[event.results.length - 1];
        const text = last[0].transcript;
        const isFinal = last.isFinal;

        if (this.onTextCallback) {
          this.onTextCallback(text, isFinal);
        }
      };

      // 监听识别开始
      this.recognition.onstart = () => {
        console.log('[SpeechService] 语音识别开始');
      };

      // 监听识别结束
      this.recognition.onend = () => {
        console.log('[SpeechService] 语音识别结束');
        // 如果仍在识别状态，重新启动
        if (this.isRecognizing) {
          try {
            this.recognition.start();
          } catch (error) {
            console.error('[SpeechService] 重新启动识别失败:', error);
            this.isRecognizing = false;
          }
        }
      };

      // 监听识别错误
      this.recognition.onerror = (event) => {
        console.error('[SpeechService] 识别错误:', event.error);
        if (event.error === 'not-allowed') {
          this.isRecognizing = false;
        }
      };

      this.isAvailable = true;
      console.log('[SpeechService] SpeechRecognition 初始化成功');
    } catch (error) {
      console.error('[SpeechService] 初始化失败:', error);
      this.isAvailable = false;
    }
  }

  /**
   * 初始化语音识别服务
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async init() {
    // 已在构造函数中初始化
    return true;
  }

  /**
   * 开始实时语音识别
   * @param {Function} onText - 文本回调函数 (text, isFinal)
   * @returns {Promise<boolean>} 是否开始成功
   */
  async startRealtimeTranscription(onText) {
    try {
      if (this.isRecognizing) {
        console.warn('[SpeechService] 已在识别中');
        return false;
      }

      this.onTextCallback = onText;

      // 使用 SpeechRecognition
      if (this.isAvailable && this.recognition) {
        this.recognition.start();
        this.isRecognizing = true;
        console.log('[SpeechService] 开始实时语音识别');
        return true;
      }

      // Mock 模式：模拟问题流
      this.isRecognizing = true;
      console.log('[SpeechService] Mock 模式：开始模拟问题流');

      this.mockStreamStopper = startMockQuestionStream((question) => {
        if (this.onTextCallback) {
          this.onTextCallback(question.text, true);
        }
      }, 8000); // 每 8 秒一个模拟问题

      return true;
    } catch (error) {
      console.error('[SpeechService] 开始识别失败:', error);
      return false;
    }
  }

  /**
   * 停止实时语音识别
   * @returns {Promise<boolean>} 是否停止成功
   */
  async stopRealtimeTranscription() {
    try {
      if (!this.isRecognizing) {
        console.warn('[SpeechService] 当前未在识别');
        return false;
      }

      // 使用 SpeechRecognition
      if (this.recognition) {
        this.recognition.stop();
      }

      // 停止 Mock 流
      if (this.mockStreamStopper) {
        this.mockStreamStopper();
        this.mockStreamStopper = null;
      }

      this.isRecognizing = false;
      this.onTextCallback = null;
      console.log('[SpeechService] 停止实时语音识别');
      return true;
    } catch (error) {
      console.error('[SpeechService] 停止识别失败:', error);
      return false;
    }
  }

  /**
   * 将完整录音转写成文本
   * @param {string} audioFilePath - 音频文件路径
   * @returns {Promise<string>} 转写文本
   */
  async transcribeAudio(audioFilePath) {
    try {
      // TODO: 使用真实的语音转写 API
      // 当前使用 Mock 数据
      console.warn('[SpeechService] 使用 Mock 转写数据');

      const mockTranscript = {
        startTime: Date.now() - 600000,
        endTime: Date.now(),
        transcript: [
          { speaker: 'interviewer', time: 0, text: '介绍一下你做过的最有挑战性的项目？' },
          { speaker: 'candidate', time: 30000, text: '我最有挑战的项目是电商平台订单系统重构...' },
          { speaker: 'interviewer', time: 60000, text: '你在这个项目中遇到过哪些技术难点？' },
          { speaker: 'candidate', time: 90000, text: '最大的难点是分布式事务的一致性问题...' },
        ],
      };

      return getFullTranscriptText(mockTranscript);
    } catch (error) {
      console.error('[SpeechService] 转写失败:', error);
      throw error;
    }
  }

  /**
   * 获取识别状态
   * @returns {Object} 识别状态信息
   */
  getStatus() {
    return {
      isRecognizing: this.isRecognizing,
      isAvailable: this.isAvailable,
      mode: this.isAvailable ? 'speech-recognition' : 'mock',
    };
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.isRecognizing = false;
    this.onTextCallback = null;
    if (this.mockStreamStopper) {
      this.mockStreamStopper();
      this.mockStreamStopper = null;
    }
  }

  /**
   * 释放资源
   */
  dispose() {
    this.reset();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_) {}
      this.recognition = null;
    }
  }
}

// 导出单例
const speechService = new SpeechService();
export default speechService;
