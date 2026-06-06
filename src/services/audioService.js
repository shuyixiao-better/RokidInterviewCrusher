/**
 * 音频录音服务
 * 负责面试过程中的音频录制
 *
 * 注意：
 * 1. 优先使用 Rokid AIUI 提供的录音能力
 * 2. 如果不可用，使用 Web Audio API 或 mock 实现
 * 3. 所有录音操作必须在用户明确授权后进行
 */

import { INTERVIEW_STATUS } from '../utils/constants.js';

/**
 * 音频服务类
 */
class AudioService {
  constructor() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.startTime = null;
    this.audioBlob = null;

    // Rokid AIUI 录音适配器
    // TODO: 接入 Rokid AIUI 真实录音 API
    this.rokidRecorder = null;
  }

  /**
   * 初始化录音设备
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async init() {
    try {
      // TODO: 检查 Rokid AIUI 录音能力是否可用
      // if (window.RokidAIUI && window.RokidAIUI.Audio) {
      //   this.rokidRecorder = new window.RokidAIUI.Audio.Recorder();
      //   return true;
      // }

      // 使用 Web Audio API 作为备选方案
      if (typeof navigator !== 'undefined' && navigator.mediaDevices) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });

        this.mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            this.audioChunks.push(event.data);
          }
        };

        this.mediaRecorder.onstop = () => {
          this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        };

        return true;
      }

      console.warn('[AudioService] 无法初始化录音设备，将使用 Mock 模式');
      return true;
    } catch (error) {
      console.error('[AudioService] 初始化失败:', error);
      return false;
    }
  }

  /**
   * 开始录音
   * @returns {Promise<boolean>} 是否开始成功
   */
  async startRecording() {
    try {
      if (this.status === INTERVIEW_STATUS.RECORDING) {
        console.warn('[AudioService] 已在录音中');
        return false;
      }

      // 清空之前的录音数据
      this.audioChunks = [];
      this.audioBlob = null;
      this.startTime = Date.now();

      // TODO: 使用 Rokid AIUI 录音 API
      // if (this.rokidRecorder) {
      //   await this.rokidRecorder.start();
      //   this.status = INTERVIEW_STATUS.RECORDING;
      //   return true;
      // }

      // 使用 Web Audio API
      if (this.mediaRecorder) {
        this.mediaRecorder.start(1000); // 每秒收集一次数据
        this.status = INTERVIEW_STATUS.RECORDING;
        console.log('[AudioService] 开始录音');
        return true;
      }

      // Mock 模式
      this.status = INTERVIEW_STATUS.RECORDING;
      console.log('[AudioService] Mock 模式：开始录音');
      return true;
    } catch (error) {
      console.error('[AudioService] 开始录音失败:', error);
      return false;
    }
  }

  /**
   * 停止录音
   * @returns {Promise<Blob|null>} 录音文件 Blob
   */
  async stopRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.RECORDING) {
        console.warn('[AudioService] 当前未在录音');
        return null;
      }

      // TODO: 使用 Rokid AIUI 录音 API
      // if (this.rokidRecorder) {
      //   const audioData = await this.rokidRecorder.stop();
      //   this.status = INTERVIEW_STATUS.COMPLETED;
      //   return audioData;
      // }

      // 使用 Web Audio API
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        return new Promise((resolve) => {
          this.mediaRecorder.onstop = () => {
            this.audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
            this.status = INTERVIEW_STATUS.COMPLETED;
            console.log('[AudioService] 停止录音');
            resolve(this.audioBlob);
          };
          this.mediaRecorder.stop();
        });
      }

      // Mock 模式
      this.status = INTERVIEW_STATUS.COMPLETED;
      console.log('[AudioService] Mock 模式：停止录音');
      return new Blob(['mock audio data'], { type: 'audio/webm' });
    } catch (error) {
      console.error('[AudioService] 停止录音失败:', error);
      return null;
    }
  }

  /**
   * 获取录音状态
   * @returns {Object} 录音状态信息
   */
  getRecordingStatus() {
    return {
      status: this.status,
      isRecording: this.status === INTERVIEW_STATUS.RECORDING,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      hasAudio: this.audioBlob !== null,
    };
  }

  /**
   * 获取录音时长（毫秒）
   * @returns {number} 录音时长
   */
  getDuration() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  /**
   * 获取录音 Blob
   * @returns {Blob|null} 录音 Blob
   */
  getAudioBlob() {
    return this.audioBlob;
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.audioChunks = [];
    this.startTime = null;
    this.audioBlob = null;
  }

  /**
   * 释放资源
   */
  dispose() {
    if (this.mediaRecorder && this.mediaRecorder.stream) {
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
    this.reset();
  }
}

// 导出单例
const audioService = new AudioService();
export default audioService;
