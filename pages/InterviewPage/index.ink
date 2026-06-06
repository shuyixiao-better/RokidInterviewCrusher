<script type="application/json" def>
{
  "navigationBarTitleText": "面试中",
  "description": "面试进行中页面，显示状态、识别问题和关键词提示"
}
</script>

<script setup>
import wx from 'wx';
import interviewService from '../../src/services/interviewService.js';
import storageService from '../../src/services/storageService.js';
import { INTERVIEW_STATUS } from '../../src/utils/constants.js';
import { formatDuration } from '../../src/utils/format.js';

const HINT_IMAGE_BY_TYPE = {
  '项目经历': '../../assets/hint-project.svg',
  '技术原理': '../../assets/hint-technical.svg',
  '八股基础': '../../assets/hint-technical.svg',
  '系统设计': '../../assets/hint-design.svg',
  '行为面试': '../../assets/hint-project.svg',
  '其他': '../../assets/hint-default.svg',
};

function getHintImageSrc(questionType) {
  return HINT_IMAGE_BY_TYPE[questionType] || HINT_IMAGE_BY_TYPE['其他'];
}

function buildHintSummary(hints) {
  if (!Array.isArray(hints) || !hints.length) {
    return '等待识别到新问题后生成提示卡。';
  }
  return hints.slice(0, 2).join(' / ');
}

export default {
  data: {
    status: INTERVIEW_STATUS.IDLE,
    statusText: '准备开始',
    currentQuestion: '',
    currentQuestionType: '',
    hints: [],
    hintSummaryText: '',
    warning: '',
    errorMessage: '',
    duration: '00:00',
    hasStarted: false,
    canStop: false,
    modeText: 'Mock 识别',
    hintImageSrc: '../../assets/hint-default.svg',
    selectedPreStartAction: 1,
    isBusy: false,
    complianceLines: [
      '请确保获得面试相关方授权后再录音',
      '仅用于训练、模拟与复盘',
      '不支持隐藏录音或违规使用'
    ],
  },

  onLoad() {
    this.durationTimer = null;
    this.initInterview();
  },

  onUnload() {
    this.cleanup();
  },

  async initInterview() {
    const profile = storageService.getUserProfile();
    await interviewService.init(profile);
    interviewService.registerCallbacks({
      onError: (error) => {
        this.setData({
          errorMessage: error && error.message ? error.message : String(error),
        });
      },
    });
    const speechStatus = interviewService.getSpeechStatus();
    this.setData({
      modeText: speechStatus.mode === 'native' ? '原生识别' : 'Mock 识别',
    });
  },

  async startInterview() {
    if (this.data.isBusy) {
      return;
    }

    this.setData({
      isBusy: true,
      statusText: '启动中',
      errorMessage: '',
    });

    const success = await interviewService.startInterview();
    if (!success) {
      const errorMessage = interviewService.getLastErrorMessage() || '启动面试失败';
      this.setData({
        isBusy: false,
        statusText: '启动失败',
        errorMessage,
      });
      if (typeof wx.showToast === 'function') {
        wx.showToast({
          title: '开始失败',
          icon: 'error',
        });
      }
      return;
    }

    this.setData({
      hasStarted: true,
      canStop: true,
      isBusy: false,
      status: INTERVIEW_STATUS.RECORDING,
      statusText: '录音中',
      errorMessage: '',
    });
    this.startDurationTimer();
    this.listenForQuestions();
  },

  listenForQuestions() {
    interviewService.onQuestionRecognized((question, hintData) => {
      this.setData({
        currentQuestion: question,
        currentQuestionType: hintData.questionType || '其他',
        hints: hintData.hints || [],
        hintSummaryText: buildHintSummary(hintData.hints || []),
        warning: hintData.warning || '',
        hintImageSrc: getHintImageSrc(hintData.questionType || '其他'),
        status: INTERVIEW_STATUS.ANALYZING,
        statusText: '生成提示中',
        canStop: true,
      });

      setTimeout(() => {
        if (this.data.status === INTERVIEW_STATUS.ANALYZING) {
          this.setData({
            status: INTERVIEW_STATUS.RECORDING,
            statusText: '录音中',
            canStop: true,
          });
        }
      }, 1200);
    });
  },

  startDurationTimer() {
    const startTime = Date.now();
    this.durationTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.setData({
        duration: formatDuration(elapsed),
      });
    }, 1000);
  },

  stopDurationTimer() {
    if (this.durationTimer) {
      clearInterval(this.durationTimer);
      this.durationTimer = null;
    }
  },

  async endInterview() {
    if (this.data.isBusy) {
      return;
    }

    this.stopDurationTimer();
    this.setData({
      isBusy: true,
      status: INTERVIEW_STATUS.COMPLETED,
      statusText: '生成复盘中',
      canStop: false,
      errorMessage: '',
    });

    const result = await interviewService.endInterview();
    if (result) {
      wx.navigateTo({ url: '/pages/ReviewPage/index' });
      return;
    }

    this.setData({
      isBusy: false,
      status: INTERVIEW_STATUS.IDLE,
      statusText: '结束失败',
      canStop: true,
      errorMessage: interviewService.getLastErrorMessage() || '结束面试失败',
    });
    if (typeof wx.showToast === 'function') {
      wx.showToast({
        title: '结束失败',
        icon: 'error',
      });
    }
  },

  confirmStart() {
    this.setData({ selectedPreStartAction: 1 });
    this.startInterview();
  },

  cancelStart() {
    wx.navigateBack();
  },

  focusCancel() {
    this.setData({ selectedPreStartAction: 0 });
  },

  focusConfirm() {
    this.setData({ selectedPreStartAction: 1 });
  },

  onKeyDown(event) {
    const code = event && event.code ? event.code : '';

    if (!this.data.hasStarted) {
      if (code === 'ArrowLeft' || code === 'ArrowUp') {
        this.setData({ selectedPreStartAction: 0 });
        return;
      }

      if (code === 'ArrowRight' || code === 'ArrowDown') {
        this.setData({ selectedPreStartAction: 1 });
        return;
      }

      if (code === 'Enter') {
        if (this.data.selectedPreStartAction === 0) {
          this.cancelStart();
          return;
        }
        this.confirmStart();
        return;
      }

      if (code === 'Backspace') {
        this.cancelStart();
      }
      return;
    }

    if ((code === 'Enter' || code === 'Backspace') && this.data.canStop) {
      this.endInterview();
    }
  },

  cleanup() {
    this.stopDurationTimer();
    interviewService.cleanup();
  },
};
</script>

<page>
  <view class="container">
    <view class="summary-card summary-card-compact">
      <view class="summary-top">
        <text class="page-title compact-title">面试训练中</text>
        <text class="summary-chip">{{statusText}}</text>
      </view>
      <view class="summary-meta-grid">
        <text class="meta-line compact-meta">时长 {{duration}}</text>
        <text class="meta-line compact-meta">模式 {{modeText}}</text>
      </view>
      <text ink:if="{{errorMessage}}" class="error-line">错误 {{errorMessage}}</text>
    </view>

    <view ink:if="{{!hasStarted}}" class="compliance-card">
      <text class="section-title">开始前确认</text>
      <view class="compliance-item" ink:for="{{complianceLines}}" ink:key="index">
        <text class="compliance-text">{{item}}</text>
      </view>
      <view class="actions">
        <button class="button-secondary {{selectedPreStartAction === 0 ? 'button-selected' : ''}}" bindtap="cancelStart" bindfocus="focusCancel">取消</button>
        <button class="button-primary {{selectedPreStartAction === 1 ? 'button-selected-primary' : ''}}" bindtap="confirmStart" bindfocus="focusConfirm">确认开始</button>
      </view>
    </view>

    <view ink:if="{{hasStarted}}" class="hints-card">
      <text class="section-title">面试提示</text>
      <view ink:if="{{hints.length > 0}}">
        <view class="hint-visual-card">
          <view class="hint-visual-top">
            <view class="hint-top-left">
              <text class="hint-type-chip">{{currentQuestionType || '其他'}}</text>
              <text class="prompt-question-label">面试官问题</text>
            </view>
            <image class="hint-icon-mini" src="{{hintImageSrc}}" mode="aspectFill"></image>
          </view>
          <text class="prompt-question-text">{{currentQuestion}}</text>
          <view class="direction-strip">
            <text class="direction-strip-label">答题方向</text>
            <text class="direction-strip-text">{{hintSummaryText}}</text>
          </view>
          <view class="hint-summary-box">
            <text class="hint-points-label">快速要点</text>
            <view class="hint-grid">
              <view class="hint-pill" ink:for="{{hints}}" ink:key="index">
                <text class="hint-pill-text">{{item}}</text>
              </view>
            </view>
          </view>
        </view>
        <text ink:if="{{warning}}" class="warning-text">{{warning}}</text>
      </view>
      <text ink:else class="placeholder-text">等待新问题，识别后直接展示答题提示。</text>
    </view>

    <view ink:if="{{hasStarted && canStop}}" class="actions">
      <button class="button-danger" bindtap="endInterview">结束面试</button>
    </view>
  </view>
</page>

<style>
.container {
  display: flex;
  flex-direction: column;
  width: var(--app-width, 480px);
  min-height: var(--app-height-min, 120px);
  max-height: var(--app-height-max, 380px);
  padding: var(--spacing-md, 16px);
  background-color: var(--color-background, #000000);
  gap: 12px;
}

.summary-card,
.compliance-card,
.hints-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--card-padding, 16px);
  background-color: #060807;
  border-width: var(--card-border-width, 2px);
  border-style: solid;
  border-color: #1d8f3e;
  border-radius: var(--radius-md, 12px);
}

.summary-card-compact {
  gap: 6px;
  padding: 12px 14px;
}

.summary-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.summary-meta-grid {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
}

.page-title,
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: #f2f5f3;
}

.compact-title {
  font-size: 14px;
}

.meta-line,
.compliance-text,
.placeholder-text {
  font-size: 12px;
  color: #8f9b93;
}

.compact-meta {
  font-size: 11px;
}

.error-line {
  font-size: 12px;
  color: #f2f5f3;
}

.summary-chip {
  padding: 4px 10px;
  border-radius: 999px;
  background-color: rgba(56, 242, 85, 0.14);
  color: #46d85f;
  font-size: 11px;
  font-weight: bold;
}

.question-text,
.hint-text {
  font-size: 13px;
  color: #f2f5f3;
  line-height: 1.35;
}

.prompt-question-box {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: rgba(56, 242, 85, 0.06);
  border-width: 1px;
  border-style: solid;
  border-color: rgba(29, 143, 62, 0.55);
}

.prompt-question-label {
  font-size: 11px;
  color: #8f9b93;
}

.prompt-question-text {
  font-size: 14px;
  font-weight: bold;
  color: #f2f5f3;
  line-height: 1.35;
}

.hint-visual-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(56, 242, 85, 0.14), rgba(56, 242, 85, 0.03));
  border-width: 1px;
  border-style: solid;
  border-color: rgba(200, 255, 210, 0.28);
}

.hint-visual-top {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.hint-top-left {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 8px;
}

.hint-summary-layout {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
}

.hint-summary-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.hint-icon {
  width: 54px;
  height: 54px;
  border-radius: 10px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(29, 143, 62, 0.7);
}

.hint-icon-mini {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  border-width: 1px;
  border-style: solid;
  border-color: rgba(29, 143, 62, 0.55);
}

.hint-summary-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-top: 2px;
}

.hint-type-chip {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: bold;
  border-radius: 999px;
  background-color: rgba(56, 242, 85, 0.18);
  color: #46d85f;
}

.hint-caption {
  font-size: 11px;
  color: #8f9b93;
}

.hint-summary-label {
  font-size: 11px;
  color: #8f9b93;
}

.hint-summary-text {
  font-size: 13px;
  color: #f2f5f3;
  line-height: 1.35;
}

.direction-strip {
  display: flex;
  flex-direction: column;
  gap: 3px;
  padding: 8px 10px;
  border-radius: 10px;
  background-color: rgba(56, 242, 85, 0.12);
  border-width: 1px;
  border-style: solid;
  border-color: rgba(56, 242, 85, 0.28);
}

.direction-strip-label {
  font-size: 11px;
  color: #8f9b93;
}

.direction-strip-text {
  font-size: 14px;
  font-weight: bold;
  color: #f2f5f3;
  line-height: 1.3;
}

.hint-points-label {
  font-size: 11px;
  color: #8f9b93;
}

.hint-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 6px;
}

.hint-pill {
  padding: 6px 8px;
  border-radius: 999px;
  background-color: rgba(56, 242, 85, 0.08);
  border-width: 1px;
  border-style: solid;
  border-color: rgba(29, 143, 62, 0.45);
}

.hint-pill-text {
  font-size: 11px;
  color: #f2f5f3;
}

.hint-bullet {
  width: 18px;
  font-size: 12px;
  color: #46d85f;
}

.warning-text {
  font-size: 12px;
  color: #d7e0db;
}

.actions {
  display: flex;
  flex-direction: row;
  gap: 12px;
}

.button-primary,
.button-secondary,
.button-danger {
  flex: 1;
  text-align: center;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: bold;
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-radius: var(--radius-md, 12px);
}

.button-selected {
  border-color: #c8ffd2;
  box-shadow: 0 0 0 2px rgba(200, 255, 210, 0.2);
}

.button-selected-primary {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.22);
}

.button-primary {
  background-color: #38f255;
  color: #041006;
  border-color: #c8ffd2;
}

.button-secondary {
  background-color: #060807;
  color: #f2f5f3;
  border-color: #1d8f3e;
}

.button-danger {
  background-color: #1a0d0d;
  color: #f2f5f3;
  border-color: #707770;
}
</style>
