import wx from 'wx';
import { INTERVIEW_STATUS } from '../utils/constants.js';

class AudioService {
  constructor() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.recorderManager = null;
    this.startTime = null;
    this.audioFilePath = null;
    this.pendingStopResolve = null;
    this.mockRecordingCounter = 0;
    this.initRecorderManager();
  }

  initRecorderManager() {
    try {
      if (!wx || !wx.media || typeof wx.media.getRecorderManager !== 'function') {
        console.warn('[AudioService] 当前环境不支持 RecorderManager，将启用 Mock 录音');
        return;
      }

      this.recorderManager = wx.media.getRecorderManager();
      if (!this.recorderManager) {
        console.warn('[AudioService] 无法获取 RecorderManager');
        return;
      }

      this.recorderManager.onStart(() => {
        this.status = INTERVIEW_STATUS.RECORDING;
        this.startTime = Date.now();
      });

      this.recorderManager.onPause(() => {
        this.status = INTERVIEW_STATUS.PAUSED;
      });

      this.recorderManager.onResume(() => {
        this.status = INTERVIEW_STATUS.RECORDING;
      });

      this.recorderManager.onStop((payload) => {
        this.status = INTERVIEW_STATUS.COMPLETED;
        this.audioFilePath = payload && payload.tempFilePath ? payload.tempFilePath : this.audioFilePath;
        if (this.pendingStopResolve) {
          this.pendingStopResolve(this.audioFilePath);
          this.pendingStopResolve = null;
        }
      });

      this.recorderManager.onError((payload) => {
        console.error('[AudioService] 录音错误', payload);
        this.status = INTERVIEW_STATUS.IDLE;
        if (this.pendingStopResolve) {
          this.pendingStopResolve(this.audioFilePath);
          this.pendingStopResolve = null;
        }
      });
    } catch (error) {
      console.error('[AudioService] 初始化 RecorderManager 失败:', error);
      this.recorderManager = null;
    }
  }

  async init() {
    return true;
  }

  async startRecording() {
    try {
      if (this.status === INTERVIEW_STATUS.RECORDING) {
        return false;
      }

      this.audioFilePath = null;
      this.startTime = Date.now();

      if (!this.recorderManager) {
        this.status = INTERVIEW_STATUS.RECORDING;
        return true;
      }

      await this.recorderManager.start({
        sampleRate: 16000,
        numberOfChannels: 1,
        format: 'pcm',
      });
      return true;
    } catch (error) {
      console.error('[AudioService] 开始录音失败:', error);
      return false;
    }
  }

  async stopRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.RECORDING && this.status !== INTERVIEW_STATUS.PAUSED) {
        return this.audioFilePath;
      }

      if (!this.recorderManager) {
        this.status = INTERVIEW_STATUS.COMPLETED;
        this.mockRecordingCounter += 1;
        this.audioFilePath = `mock://recordings/interview-${this.mockRecordingCounter}.pcm`;
        return this.audioFilePath;
      }

      return await new Promise((resolve) => {
        this.pendingStopResolve = resolve;
        this.recorderManager.stop().catch((error) => {
          console.error('[AudioService] 停止录音失败:', error);
          this.pendingStopResolve = null;
          resolve(this.audioFilePath);
        });
      });
    } catch (error) {
      console.error('[AudioService] 停止录音失败:', error);
      return this.audioFilePath;
    }
  }

  async pauseRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.RECORDING) {
        return false;
      }
      if (!this.recorderManager) {
        this.status = INTERVIEW_STATUS.PAUSED;
        return true;
      }
      await this.recorderManager.pause();
      return true;
    } catch (error) {
      console.error('[AudioService] 暂停录音失败:', error);
      return false;
    }
  }

  async resumeRecording() {
    try {
      if (this.status !== INTERVIEW_STATUS.PAUSED) {
        return false;
      }
      if (!this.recorderManager) {
        this.status = INTERVIEW_STATUS.RECORDING;
        return true;
      }
      await this.recorderManager.resume();
      return true;
    } catch (error) {
      console.error('[AudioService] 恢复录音失败:', error);
      return false;
    }
  }

  getRecordingStatus() {
    return {
      status: this.status,
      isRecording: this.status === INTERVIEW_STATUS.RECORDING,
      isPaused: this.status === INTERVIEW_STATUS.PAUSED,
      duration: this.startTime ? Date.now() - this.startTime : 0,
      hasAudio: this.audioFilePath !== null,
      audioFilePath: this.audioFilePath,
      mode: this.recorderManager ? 'native' : 'mock',
    };
  }

  getDuration() {
    if (!this.startTime) return 0;
    return Date.now() - this.startTime;
  }

  getAudioFilePath() {
    return this.audioFilePath;
  }

  reset() {
    this.status = INTERVIEW_STATUS.IDLE;
    this.startTime = null;
    this.audioFilePath = null;
    this.pendingStopResolve = null;
  }

  dispose() {
    if (this.recorderManager && this.status === INTERVIEW_STATUS.RECORDING) {
      this.recorderManager.stop().catch(() => {});
    }
    this.reset();
  }
}

const audioService = new AudioService();
export default audioService;
