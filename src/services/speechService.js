import { startMockQuestionStream } from '../mock/mockQuestions.js';
import mockInterviewTranscript, { getFullTranscriptText } from '../mock/mockInterviewTranscript.js';

/**
 * 语音识别服务类
 */
class SpeechService {
  constructor() {
    this.isRecognizing = false;
    this.shouldKeepListening = false;
    this.recognitionAdapter = null;
    this.recognition = null;
    this.onTextCallback = null;
    this.mockStreamStopper = null;
    this.isAvailable = false;
    this.lastFinalTranscript = '';
    this.initRecognition();
  }

  initRecognition() {
    try {
      this.recognitionAdapter = null;
      this.recognition = null;
      this.isAvailable = false;

      if (typeof SpeechRecognition === 'undefined') {
        console.warn('[SpeechService] 当前环境未检测到 SpeechRecognition，使用 Mock 模式');
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'zh-CN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;
      this.recognition = recognition;

      recognition.onresult = (event) => {
        if (!event || !event.results || !event.results.length) {
          return;
        }

        const transcripts = [];
        let hasFinal = false;
        const startIndex = typeof event.resultIndex === 'number' ? event.resultIndex : 0;
        for (let index = startIndex; index < event.results.length; index += 1) {
          const result = event.results[index];
          const alternative = result && result[0];
          if (!alternative || !alternative.transcript) {
            continue;
          }
          if (result.isFinal) {
            transcripts.push(alternative.transcript);
            hasFinal = true;
          }
        }

        const transcript = transcripts.join('').trim();
        if (!transcript || !hasFinal) {
          return;
        }

        if (transcript === this.lastFinalTranscript) {
          return;
        }

        this.lastFinalTranscript = transcript;
        if (this.onTextCallback) {
          this.onTextCallback(transcript, true);
        }
      };

      recognition.onend = () => {
        if (!this.shouldKeepListening) {
          return;
        }

        try {
          recognition.start();
        } catch (error) {
          console.error('[SpeechService] 自动重启识别失败:', error);
          this.isRecognizing = false;
          this.shouldKeepListening = false;
        }
      };

      recognition.onerror = (event) => {
        console.error('[SpeechService] ASR 错误:', event);
      };

      this.recognitionAdapter = {
        async start() {
          recognition.start();
        },
        async stop() {
          recognition.stop();
        },
      };
      this.isAvailable = true;
      return;

    } catch (error) {
      console.error('[SpeechService] 初始化失败:', error);
      this.isAvailable = false;
      this.recognition = null;
      this.recognitionAdapter = null;
    }
  }

  /**
   * 初始化语音识别服务
   * @returns {Promise<boolean>} 是否初始化成功
   */
  async init() {
    if (!this.isRecognizing) {
      this.initRecognition();
    }
    return true;
  }

  async startRealtimeTranscription(onText) {
    try {
      if (this.isRecognizing) {
        return false;
      }

      this.onTextCallback = onText;
      this.lastFinalTranscript = '';

      if (this.isAvailable && this.recognitionAdapter) {
        this.shouldKeepListening = true;
        this.isRecognizing = true;
        await this.recognitionAdapter.start();
        return true;
      }

      this.shouldKeepListening = false;
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

      this.shouldKeepListening = false;
      this.isRecognizing = false;

      if (this.recognitionAdapter) {
        await this.recognitionAdapter.stop();
      }

      if (this.mockStreamStopper) {
        this.mockStreamStopper();
        this.mockStreamStopper = null;
      }
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
    this.shouldKeepListening = false;
    this.onTextCallback = null;
    this.lastFinalTranscript = '';
    if (this.mockStreamStopper) {
      this.mockStreamStopper();
      this.mockStreamStopper = null;
    }
  }

  dispose() {
    this.reset();
    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch (_error) {}
    }
    this.recognition = null;
    this.recognitionAdapter = null;
  }
}

const speechService = new SpeechService();
export default speechService;
