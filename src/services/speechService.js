import wx from 'wx';
import { startMockQuestionStream } from '../mock/mockQuestions.js';
import mockInterviewTranscript, { getFullTranscriptText } from '../mock/mockInterviewTranscript.js';

/**
 * 语音识别服务类
 */
class SpeechService {
  constructor() {
    this.isRecognizing = false;
    this.recognitionAdapter = null;
    this.onTextCallback = null;
    this.mockStreamStopper = null;
    this.isAvailable = false;
    this.initRecognition();
  }

  initRecognition() {
    try {
      if (
        wx &&
        wx.speech &&
        typeof wx.speech.startRecognition === 'function' &&
        typeof wx.speech.stopRecognition === 'function'
      ) {
        this.recognitionAdapter = {
          async start(onText) {
            // TODO: 根据 Rokid 实际 ASR 事件协议接入稳定回调。
            await wx.speech.startRecognition({
              lang: 'zh-CN',
              success(result) {
                if (result && result.text && onText) {
                  onText(result.text, true);
                }
              },
            });
          },
          async stop() {
            await wx.speech.stopRecognition();
          },
        };
        this.isAvailable = true;
        return;
      }

      console.warn('[SpeechService] 当前环境未检测到原生 ASR，使用 Mock 模式');
      this.isAvailable = false;
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
    return true;
  }

  async startRealtimeTranscription(onText) {
    try {
      if (this.isRecognizing) {
        return false;
      }

      this.onTextCallback = onText;

      if (this.isAvailable && this.recognitionAdapter) {
        await this.recognitionAdapter.start((text, isFinal) => {
          if (this.onTextCallback) {
            this.onTextCallback(text, isFinal);
          }
        });
        this.isRecognizing = true;
        return true;
      }

      this.isRecognizing = true;
      this.mockStreamStopper = startMockQuestionStream((question) => {
        if (this.onTextCallback) {
          this.onTextCallback(question.text, true);
        }
      }, 8000);

      return true;
    } catch (error) {
      console.error('[SpeechService] 开始识别失败:', error);
      return false;
    }
  }

  async stopRealtimeTranscription() {
    try {
      if (!this.isRecognizing) {
        return false;
      }

      if (this.recognitionAdapter) {
        await this.recognitionAdapter.stop();
      }

      if (this.mockStreamStopper) {
        this.mockStreamStopper();
        this.mockStreamStopper = null;
      }

      this.isRecognizing = false;
      this.onTextCallback = null;
      return true;
    } catch (error) {
      console.error('[SpeechService] 停止识别失败:', error);
      return false;
    }
  }

  async transcribeAudio(audioFilePath) {
    try {
      console.warn('[SpeechService] 使用 Mock 转写数据');
      console.warn('[SpeechService] 待转写音频:', audioFilePath);
      // TODO: 接入真实音频上传和后端转写接口。
      return getFullTranscriptText(mockInterviewTranscript);
    } catch (error) {
      console.error('[SpeechService] 转写失败:', error);
      throw error;
    }
  }

  getStatus() {
    return {
      isRecognizing: this.isRecognizing,
      isAvailable: this.isAvailable,
      mode: this.isAvailable ? 'native' : 'mock',
    };
  }

  reset() {
    this.isRecognizing = false;
    this.onTextCallback = null;
    if (this.mockStreamStopper) {
      this.mockStreamStopper();
      this.mockStreamStopper = null;
    }
  }

  dispose() {
    this.reset();
    this.recognitionAdapter = null;
  }
}

const speechService = new SpeechService();
export default speechService;
