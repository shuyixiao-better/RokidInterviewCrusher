/**
 * 面试页面
 * 负责面试过程中的实时交互，包括录音、语音识别、关键词提示展示
 *
 * 设计考虑：
 * 1. 实时显示录音状态
 * 2. 快速展示关键词提示
 * 3. 操作简单，适合眼镜交互
 * 4. 合规提示明确
 */

import { INTERVIEW_STATUS, APP_CONFIG } from '../utils/constants.js';
import interviewService from '../services/interviewService.js';
import storageService from '../services/storageService.js';
import { formatDuration, formatHints } from '../utils/format.js';

/**
 * 面试页面类
 */
class InterviewPage {
  constructor(router) {
    this.router = router;
    this.container = null;
    this.timer = null;
    this.startTime = null;

    // 绑定回调
    this.handleStatusChange = this.handleStatusChange.bind(this);
    this.handleQuestionDetected = this.handleQuestionDetected.bind(this);
    this.handleHintsGenerated = this.handleHintsGenerated.bind(this);
    this.handleError = this.handleError.bind(this);
  }

  /**
   * 渲染页面
   * @param {HTMLElement} container - 页面容器
   */
  render(container) {
    this.container = container;

    container.innerHTML = `
      <div class="page interview-page">
        <header class="header">
          <button class="back-btn" id="btn-back">← 返回</button>
          <h2 class="title">面试中</h2>
          <div class="timer" id="timer">00:00</div>
        </header>

        <main class="content">
          <div class="compliance-notice">
            <p>⚠️ 请确保获得面试相关方授权后再录音</p>
          </div>

          <div class="status-section">
            <div class="status-indicator" id="status-indicator">
              <span class="status-dot"></span>
              <span class="status-text">准备开始</span>
            </div>
          </div>

          <div class="question-section" id="question-section" style="display: none;">
            <h3>当前问题</h3>
            <div class="question-text" id="question-text"></div>
          </div>

          <div class="hints-section" id="hints-section" style="display: none;">
            <h3>关键词提示</h3>
            <div class="hints-content" id="hints-content"></div>
            <div class="warning" id="warning" style="display: none;"></div>
          </div>

          <div class="controls">
            <button class="btn-start" id="btn-start">
              <span class="icon">🎤</span>
              <span>开始面试</span>
            </button>
            <button class="btn-stop" id="btn-stop" style="display: none;">
              <span class="icon">⏹️</span>
              <span>结束面试</span>
            </button>
          </div>
        </main>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const btnBack = this.container.querySelector('#btn-back');
    const btnStart = this.container.querySelector('#btn-start');
    const btnStop = this.container.querySelector('#btn-stop');

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        if (interviewService.getStatus().isRecording) {
          if (confirm('面试正在进行中，确定要离开吗？')) {
            this.stopInterview();
            this.router.navigate('home');
          }
        } else {
          this.router.navigate('home');
        }
      });
    }

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.startInterview();
      });
    }

    if (btnStop) {
      btnStop.addEventListener('click', () => {
        this.stopInterview();
      });
    }

    // 注册面试服务回调
    interviewService.registerCallbacks({
      onStatusChange: this.handleStatusChange,
      onQuestionDetected: this.handleQuestionDetected,
      onHintsGenerated: this.handleHintsGenerated,
      onError: this.handleError,
    });
  }

  /**
   * 开始面试
   */
  async startInterview() {
    const userProfile = storageService.getUserProfile();
    const success = await interviewService.startInterview(userProfile);

    if (success) {
      this.startTime = Date.now();
      this.startTimer();
      this.updateUI('recording');
    } else {
      alert('无法开始面试，请检查录音权限');
    }
  }

  /**
   * 停止面试
   */
  async stopInterview() {
    this.stopTimer();
    const record = await interviewService.endInterview();

    if (record) {
      // 跳转到复盘页面
      this.router.navigate('review', { interviewId: record.id });
    } else {
      this.router.navigate('home');
    }
  }

  /**
   * 启动计时器
   */
  startTimer() {
    const timerEl = this.container.querySelector('#timer');

    this.timer = setInterval(() => {
      if (timerEl && this.startTime) {
        const duration = Date.now() - this.startTime;
        timerEl.textContent = formatDuration(duration);
      }
    }, 1000);
  }

  /**
   * 停止计时器
   */
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  /**
   * 处理状态变化
   * @param {string} status - 新状态
   */
  handleStatusChange(status) {
    this.updateUI(status);
  }

  /**
   * 处理检测到的问题
   * @param {string} question - 检测到的问题
   */
  handleQuestionDetected(question) {
    const questionSection = this.container.querySelector('#question-section');
    const questionText = this.container.querySelector('#question-text');

    if (questionSection && questionText) {
      questionSection.style.display = 'block';
      questionText.textContent = question;
    }
  }

  /**
   * 处理生成的提示
   * @param {Object} hints - 提示数据
   */
  handleHintsGenerated(hints) {
    const hintsSection = this.container.querySelector('#hints-section');
    const hintsContent = this.container.querySelector('#hints-content');
    const warning = this.container.querySelector('#warning');

    if (hintsSection && hintsContent) {
      hintsSection.style.display = 'block';
      hintsContent.innerHTML = `
        <div class="question-type">${hints.questionType}</div>
        <div class="hints-list">
          ${hints.hints.map(hint => `<div class="hint-item">• ${hint}</div>`).join('')}
        </div>
      `;

      if (warning && hints.warning) {
        warning.style.display = 'block';
        warning.textContent = `⚠️ ${hints.warning}`;
      }
    }
  }

  /**
   * 处理错误
   * @param {Error} error - 错误对象
   */
  handleError(error) {
    console.error('[InterviewPage] 错误:', error);
    alert(`发生错误: ${error.message}`);
  }

  /**
   * 更新 UI
   * @param {string} status - 状态
   */
  updateUI(status) {
    const statusIndicator = this.container.querySelector('#status-indicator');
    const btnStart = this.container.querySelector('#btn-start');
    const btnStop = this.container.querySelector('#btn-stop');

    if (statusIndicator) {
      const statusDot = statusIndicator.querySelector('.status-dot');
      const statusText = statusIndicator.querySelector('.status-text');

      statusDot.className = 'status-dot';

      switch (status) {
        case INTERVIEW_STATUS.RECORDING:
          statusDot.classList.add('recording');
          statusText.textContent = '录音中...';
          break;
        case INTERVIEW_STATUS.ANALYZING:
          statusDot.classList.add('analyzing');
          statusText.textContent = '分析中...';
          break;
        case INTERVIEW_STATUS.WAITING:
          statusDot.classList.add('waiting');
          statusText.textContent = '等待问题';
          break;
        case INTERVIEW_STATUS.COMPLETED:
          statusDot.classList.add('completed');
          statusText.textContent = '已完成';
          break;
        default:
          statusText.textContent = '准备开始';
      }
    }

    if (btnStart && btnStop) {
      if (status === INTERVIEW_STATUS.RECORDING || status === INTERVIEW_STATUS.ANALYZING) {
        btnStart.style.display = 'none';
        btnStop.style.display = 'flex';
      } else {
        btnStart.style.display = 'flex';
        btnStop.style.display = 'none';
      }
    }
  }

  /**
   * 销毁页面
   */
  destroy() {
    this.stopTimer();
    interviewService.reset();
  }
}

export default InterviewPage;
