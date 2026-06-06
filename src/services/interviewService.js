/**
 * 面试业务服务
 * 负责串联完整的面试流程：录音 -> 语音识别 -> AI 分析 -> 保存记录
 *
 * 职责：
 * 1. 管理面试生命周期
 * 2. 协调各子服务（录音、语音识别、AI）
 * 3. 维护面试状态
 * 4. 保存面试记录
 */

import audioService from './audioService.js';
import speechService from './speechService.js';
import aiService from './aiService.js';
import storageService from './storageService.js';
import { INTERVIEW_STATUS, QUESTION_KEYWORDS } from '../utils/constants.js';
import { generateId } from '../utils/format.js';

/**
 * 面试业务服务类
 */
class InterviewService {
  constructor() {
    this.currentInterview = null;
    this.status = INTERVIEW_STATUS.IDLE;
    this.questions = [];
    this.currentQuestion = null;
    this.currentHints = null;
    this.userProfile = null;
    this.lastErrorMessage = '';

    // 状态变化回调
    this.onStatusChange = null;
    this.onQuestionDetected = null;
    this.onHintsGenerated = null;
    this.onError = null;

    // 问题识别回调（用于 InterviewPage）
    this._questionRecognizedCallback = null;
  }

  /**
   * 初始化服务
   * @param {Object} userProfile - 用户画像
   */
  async init(userProfile) {
    this.userProfile = userProfile || storageService.getUserProfile();
    await audioService.init();
    await speechService.init();
  }

  /**
   * 注册回调函数
   * @param {Object} callbacks - 回调函数集合
   */
  registerCallbacks(callbacks) {
    this.onStatusChange = callbacks.onStatusChange || null;
    this.onQuestionDetected = callbacks.onQuestionDetected || null;
    this.onHintsGenerated = callbacks.onHintsGenerated || null;
    this.onError = callbacks.onError || null;
  }

  /**
   * 更新状态
   * @param {string} newStatus - 新状态
   */
  updateStatus(newStatus) {
    this.status = newStatus;
    if (this.onStatusChange) {
      this.onStatusChange(newStatus);
    }
  }

  setLastError(error) {
    if (!error) {
      this.lastErrorMessage = '';
      return;
    }
    this.lastErrorMessage = error.message || String(error);
  }

  /**
   * 开始面试
   * @param {Object} userProfile - 用户画像（可选，默认使用已初始化的用户画像）
   * @returns {Promise<boolean>} 是否开始成功
   */
  async startInterview(userProfile) {
    const profile = userProfile || this.userProfile;
    if (!profile) {
      console.error('[InterviewService] 未提供用户画像');
      this.setLastError(new Error('未提供用户画像'));
      return false;
    }

    try {
      this.setLastError('');
      // 初始化面试记录
      this.currentInterview = {
        id: generateId(),
        startTime: Date.now(),
        endTime: null,
        targetRole: profile.targetRole,
        techStack: profile.techStack,
        resumeKeywords: profile.resumeKeywords || [],
        questions: [],
        transcript: [],
        transcriptText: '',
        audioFilePath: '',
        status: 'recording',
      };

      this.questions = [];
      this.currentQuestion = null;
      this.currentHints = null;

      // 开始录音
      const audioStarted = await audioService.startRecording();
      if (!audioStarted) {
        throw new Error('无法开始录音');
      }

      // 开始实时语音识别
      const speechStarted = await speechService.startRealtimeTranscription(
        (text, isFinal) => this.handleRecognizedText(text, isFinal, profile)
      );
      if (!speechStarted) {
        throw new Error('无法开始语音识别');
      }

      this.updateStatus(INTERVIEW_STATUS.RECORDING);
      console.log('[InterviewService] 面试开始');
      return true;
    } catch (error) {
      console.error('[InterviewService] 开始面试失败:', error);
      this.setLastError(error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }

  /**
   * 注册问题识别回调（用于 InterviewPage）
   * @param {Function} callback - 回调函数，参数为 (question, hintData)
   */
  onQuestionRecognized(callback) {
    this._questionRecognizedCallback = callback;
  }

  /**
   * 处理识别到的文本
   * @param {string} text - 识别到的文本
   * @param {boolean} isFinal - 是否是最终结果
   * @param {Object} userProfile - 用户画像
   */
  async handleRecognizedText(text, isFinal, userProfile) {
    if (!isFinal) return;
    const isQuestion = this.isInterviewQuestion(text);

    if (this.currentInterview) {
      this.currentInterview.transcript.push({
        speaker: isQuestion ? 'interviewer' : 'candidate',
        time: Date.now() - this.currentInterview.startTime,
        text: text,
      });
    }

    if (isQuestion) {
      console.log('[InterviewService] 检测到面试问题:', text);

      this.currentQuestion = text;
      this.updateStatus(INTERVIEW_STATUS.ANALYZING);

      // 通知检测到问题
      if (this.onQuestionDetected) {
        this.onQuestionDetected(text);
      }

      // 调用 AI 生成关键词提示
      try {
        const hints = await aiService.generateRealtimeHint(text, userProfile);
        this.currentHints = hints;

        // 保存问题和提示
        this.questions.push({
          question: text,
          hints: hints,
          timestamp: Date.now(),
        });

        // 通知提示已生成
        if (this.onHintsGenerated) {
          this.onHintsGenerated(hints);
        }

        // 调用问题识别回调（InterviewPage 使用）
        if (this._questionRecognizedCallback) {
          this._questionRecognizedCallback(text, hints);
        }

        if (hints && Array.isArray(hints.hints) && hints.hints.length > 0) {
          const ttsText = hints.hints.slice(0, 3).join('，');
          aiService.speakText(ttsText);
        }

        this.updateStatus(INTERVIEW_STATUS.WAITING);
      } catch (error) {
        console.error('[InterviewService] 生成提示失败:', error);
        this.setLastError(error);
        if (this.onError) {
          this.onError(error);
        }
      }
    }
  }

  /**
   * 判断文本是否是面试问题
   * @param {string} text - 识别到的文本
   * @returns {boolean} 是否是面试问题
   */
  isInterviewQuestion(text) {
    if (!text || text.length < 4) return false;

    // 检查是否包含问题关键词
    return QUESTION_KEYWORDS.some(keyword => text.includes(keyword));
  }

  /**
   * 结束面试
   * @returns {Promise<Object>} 面试记录
   */
  async endInterview() {
    try {
      this.updateStatus(INTERVIEW_STATUS.ANALYZING);

      const audioFilePath = await audioService.stopRecording();
      await speechService.stopRealtimeTranscription();

      if (this.currentInterview) {
        this.currentInterview.endTime = Date.now();
        this.currentInterview.duration = this.currentInterview.endTime - this.currentInterview.startTime;
        this.currentInterview.questions = this.questions;
        this.currentInterview.audioFilePath = audioFilePath || '';
        this.currentInterview.status = 'completed';
      }

      let transcriptText = '';
      if (this.currentInterview && this.currentInterview.transcript.length) {
        transcriptText = this.currentInterview.transcript
          .map((item) => `${item.speaker === 'interviewer' ? '面试官' : '候选人'}：${item.text}`)
          .join('\n\n');
      }

      if (!transcriptText) {
        transcriptText = await speechService.transcribeAudio(audioFilePath);
      }

      if (this.currentInterview) {
        this.currentInterview.transcriptText = transcriptText;
      }

      let review = null;
      if (transcriptText) {
        try {
          const userProfile = storageService.getUserProfile();
          review = await aiService.generateInterviewReview(transcriptText, userProfile);
        } catch (error) {
          console.error('[InterviewService] 生成复盘报告失败:', error);
        }
      }

      // 保存面试记录
      const record = {
        ...this.currentInterview,
        review: review,
      };

      storageService.saveInterviewRecord(record);

      this.updateStatus(INTERVIEW_STATUS.COMPLETED);
      console.log('[InterviewService] 面试结束');

      return record;
    } catch (error) {
      console.error('[InterviewService] 结束面试失败:', error);
      this.setLastError(error);
      if (this.onError) {
        this.onError(error);
      }
      return null;
    }
  }

  /**
   * 获取当前面试状态
   * @returns {Object} 面试状态信息
   */
  getStatus() {
    return {
      status: this.status,
      isRecording: this.status === INTERVIEW_STATUS.RECORDING,
      currentQuestion: this.currentQuestion,
      currentHints: this.currentHints,
      questionCount: this.questions.length,
      duration: this.currentInterview
        ? Date.now() - this.currentInterview.startTime
        : 0,
    };
  }

  /**
   * 获取当前提示
   * @returns {Object|null} 当前提示
   */
  getCurrentHints() {
    return this.currentHints;
  }

  /**
   * 获取问题列表
   * @returns {Array} 问题列表
   */
  getQuestions() {
    return this.questions;
  }

  getSpeechStatus() {
    return speechService.getStatus();
  }

  getLastErrorMessage() {
    return this.lastErrorMessage;
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.currentInterview = null;
    this.status = INTERVIEW_STATUS.IDLE;
    this.questions = [];
    this.currentQuestion = null;
    this.currentHints = null;
    this.lastErrorMessage = '';
    this._questionRecognizedCallback = null;
    audioService.reset();
    speechService.reset();
  }

  /**
   * 清理资源
   */
  cleanup() {
    this.reset();
    audioService.dispose();
    speechService.dispose();
  }
}

// 导出单例
const interviewService = new InterviewService();
export default interviewService;
