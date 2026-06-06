/**
 * 音频录音服务
 * 负责面试过程中的音频录制
 *
 * 使用 Rokid AIUI 的 wx.media.getRecorderManager() API
 */

import wx from 'wx';
import { INTERVIEW_STATUS } from '../utils/constants.js';

/**
 * 音频服务类
 */
class AudioService {
  constructor() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.recorderManager = null;
    this.startTime = null;
    this.audioFilePath = null;

    // 初始化录音管理器
    this.initRecorderManager();
  }

  /**
   * 初始化录音管理器
   */
  initRecorderManager() {
    try {
      this.recorderManager = wx.media.getRecorderManager();

      if (!this.recorderManager) {
        console.warn('[AudioService] 无法获取 RecorderManager');
        return;
      }

      // 监听录音开始事件
      this.recorderManager.onStart(() => {
        console.log('[AudioService] 录音开始');
        this.status = INTERVIEW_STATUS.RECORDING;
        this.startTime = Date.now();
      });

      // 监听录音停止事件
      this.recorderManager.onStop((payload) => {
        console.log('[AudioService] 录音停止', payload);
        this.status = INTERVIEW_STATUS.COMPLETED;
        if (payload && payload.tempFilePath) {
          this.audioFilePath = payload.tempFilePath;
        }
      });

      // 监听录音错误事件
      this.recorderManager.onError((payload) => {
        console.error('[AudioService] 录音错误', payload);
        this.status = INTERVIEW_STATUS.IDLE;
      });

      // 监听录音暂停事件
      this.recorderManager.onPause(() => {
        console.log('[AudioService] 录音暂停');
        this.status = INTERVIEW_STATUS.PAUSED;
      });

      // 监听录音恢复事件
      this.recorderManager.onResume(() => {
        console.log('[AudioService] 录音恢复');
        this.status = INTERVIEW_STATUS.RECORDING;
      });

      console.log('[AudioService] RecorderManager 初始化成功');
    } catch (error) {
      console.error('[AudioService] 初始化 RecorderManager 失败:', error);
    }
  }

  /**
   * 初始化录音设备
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async init() {
    // RecorderManager 已在构造函数中初始化
    return this.recorderManager !== null;
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

      if (!this.recorderManager) {
        console.error('[AudioService] RecorderManager 不可用');
        return false;
      }

      // 清空之前的录音数据
      this.audioFilePath = null;
      this.startTime = Date.now();

      // 开始录音
      this.recorderManager.start({
        sampleRate: 16000,
        numberOfChannels: 1,
        format: 'pcm',
      });

      console.log('[AudioService] 开始录音');
      return true;
    } catch (error) {
      console.error('[AudioService] 开始录音失败:', error);
      return false;
    }
  }

  /**
   * 停止录音
   * @returns {Promise<string|null>} 录音文件路径
   */
  async stopRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.RECORDING && this.status !== INTERVIEW_STATUS.PAUSED) {
        console.warn('[AudioService] 当前未在录音');
        return null;
      }

      if (!this.recorderManager) {
        console.error('[AudioService] RecorderManager 不可用');
        return null;
      }

      return new Promise((resolve) => {
        // 监听停止事件获取文件路径
        const originalOnStop = this.recorderManager.onStop;
        this.recorderManager.onStop((payload) => {
          this.status = INTERVIEW_STATUS.COMPLETED;
          if (payload && payload.tempFilePath) {
            this.audioFilePath = payload.tempFilePath;
          }
          console.log('[AudioService] 停止录音');
          resolve(this.audioFilePath);
        });

        // 停止录音
        this.recorderManager.stop();
      });
    } catch (error) {
      console.error('[AudioService] 停止录音失败:', error);
      return null;
    }
  }

  /**
   * 暂停录音
   * @returns {Promise<boolean>} 是否暂停成功
   */
  async pauseRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.RECORDING) {
        console.warn('[AudioService] 当前未在录音');
        return false;
      }

      if (!this.recorderManager) {
        return false;
      }

      this.recorderManager.pause();
      return true;
    } catch (error) {
      console.error('[AudioService] 暂停录音失败:', error);
      return false;
    }
  }

  /**
   * 恢复录音
   * @returns {Promise<boolean>} 是否恢复成功
   */
  async resumeRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.PAUSED) {
        console.warn('[AudioService] 当前未暂停');
        return false;
      }

      if (!this.recorderManager) {
        return false;
      }

      this.recorderManager.resume();
      return true;
    } catch (error) {
      console.error('[AudioService] 恢复录音失败:', error);
      return false;
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
      isPaused: this.status === INTERVIEW_STATUS.PAUSED,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      hasAudio: this.audioFilePath !== null,
      audioFilePath: this.audioFilePath,
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
   * 获取录音文件路径
   * @returns {string|null} 录音文件路径
   */
  getAudioFilePath() {
    return this.audioFilePath;
  }

  /**
   * 重置服务状态
   */
  reset() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.startTime = null;
    this.audioFilePath = null;
  }

  /**
   * 释放资源
   */
  dispose() {
    if (this.recorderManager && this.status === INTERVIEW_STATUS.RECORDING) {
      this.recorderManager.stop();
    }
    this.reset();
  }
}

// 导出单例
const audioService = new AudioService();
export default audioService;
