/**
 * 语音识别服务
 * 负责实时语音转写和音频文件转文本
 *
 * 注意：
 * 1. 优先使用 Rokid AIUI 提供的语音识别能力
 * 2. 如果不可用，使用 Web Speech API 或 mock 实现
 * 3. 实时识别通过 WebSocket 或回调方式返回结果
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

    // Rokid AIUI 语音识别适配器
    // TODO: 接入 Rokid AIUI 真实语音识别 API
    this.rokidRecognizer = null;
  }

  /**
   * 初始化语音识别
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async init() {
    try {
      // TODO: 检查 Rokid AIUI 语音识别能力是否可用
      // if (window.RokidAIUI && window.RokidAIUI.Speech) {
      //   this.rokidRecognizer = new window.RokidAIUI.Speech.Recognizer();
      //   return true;
      // }

      // 使用 Web Speech API 作为备选方案
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = true;
        this.recognition.interimResults = true;
        this.recognition.lang = 'zh-CN';

        this.recognition.onresult = (event) => {
          const last = event.results[event.results.length - 1];
          const text = last[0].transcript;
          if (this.onTextCallback) {
            this.onTextCallback(text, last.isFinal);
          }
        };

        this.recognition.onerror = (event) => {
          console.error('[SpeechService] 识别错误:', event.error);
        };

        return true;
      }

      console.warn('[SpeechService] 无法初始化语音识别，将使用 Mock 模式');
      return true;
    } catch (error) {
      console.error('[SpeechService] 初始化失败:', error);
      return false;
    }
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

      // TODO: 使用 Rokid AIUI 语音识别 API
      // if (this.rokidRecognizer) {
      //   this.rokidRecognizer.onResult = (result) => {
      //     onText(result.text, result.isFinal);
      //   };
      //   await this.rokidRecognizer.start();
      //   this.isRecognizing = true;
      //   return true;
      // }

      // 使用 Web Speech API
      if (this.recognition) {
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

      // TODO: 使用 Rokid AIUI 语音识别 API
      // if (this.rokidRecognizer) {
      //   await this.rokidRecognizer.stop();
      //   this.isRecognizing = false;
      //   return true;
      // }

      // 使用 Web Speech API
      if (this.recognition) {
        this.recognition.stop();
      }

      // 停止 Mock 流
      if (this.mockStreamStopper) {
        this.mockStreamStopper();
        this.mockStreamStopper = null;
      }

      this.isRecognizing = false;
      console.log('[SpeechService] 停止实时语音识别');
      return true;
    } catch (error) {
      console.error('[SpeechService] 停止识别失败:', error);
      return false;
    }
  }

  /**
   * 将完整录音转写成文本
   * @param {Blob|File} audioFile - 音频文件
   * @returns {Promise<string>} 转写文本
   */
  async transcribeAudio(audioFile) {
    try {
      // TODO: 使用 Rokid AIUI 语音识别 API
      // if (this.rokidRecognizer) {
      //   const result = await this.rokidRecognizer.transcribe(audioFile);
      //   return result.text;
      // }

      // 使用 Web Speech API（需要重新识别）
      // 注意：Web Speech API 不支持直接转写文件，需要实时识别
      console.warn('[SpeechService] Web Speech API 不支持文件转写，使用 Mock 数据');

      // Mock 模式：返回模拟转写文本
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
      mode: this.rokidRecognizer ? 'rokid' : this.recognition ? 'web-speech' : 'mock',
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
    this.recognition = null;
    this.rokidRecognizer = null;
  }
}

// 导出单例
const speechService = new SpeechService();
export default speechService;
