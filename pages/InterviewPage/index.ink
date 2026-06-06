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

export default {
  data: {
    status: INTERVIEW_STATUS.IDLE,
    statusText: '准备开始',
    currentQuestion: '',
    hints: [],
    warning: '',
    duration: '00:00',
    hasStarted: false,
    canStop: false,
    modeText: 'Mock 识别',
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
    const speechStatus = interviewService.getSpeechStatus();
    this.setData({
      modeText: speechStatus.mode === 'native' ? '原生识别' : 'Mock 识别',
    });
  },

  async startInterview() {
    const success = await interviewService.startInterview();
    if (!success) {
      return;
    }

    this.setData({
      hasStarted: true,
      canStop: true,
      status: INTERVIEW_STATUS.RECORDING,
      statusText: '录音中',
    });
    this.startDurationTimer();
    this.listenForQuestions();
  },

  listenForQuestions() {
    interviewService.onQuestionRecognized((question, hintData) => {
      this.setData({
        currentQuestion: question,
        hints: hintData.hints || [],
        warning: hintData.warning || '',
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
    this.stopDurationTimer();
    this.setData({
      status: INTERVIEW_STATUS.COMPLETED,
      statusText: '生成复盘中',
      canStop: false,
    });

    const result = await interviewService.endInterview();
    if (result) {
      wx.navigateTo({ url: '/pages/ReviewPage/index' });
    }
  },

  confirmStart() {
    this.startInterview();
  },

  cancelStart() {
    wx.navigateBack();
  },

  cleanup() {
    this.stopDurationTimer();
    interviewService.cleanup();
  },
};
</script>

<page>
  <view class="container">
    <view class="summary-card">
      <text class="page-title">面试训练中</text>
      <text class="meta-line">状态 {{statusText}}</text>
      <text class="meta-line">时长 {{duration}}</text>
      <text class="meta-line">模式 {{modeText}}</text>
    </view>

    <view ink:if="{{!hasStarted}}" class="compliance-card">
      <text class="section-title">开始前确认</text>
      <view class="compliance-item" ink:for="{{complianceLines}}" ink:key="index">
        <text class="compliance-text">{{item}}</text>
      </view>
      <view class="actions">
        <button class="button-secondary" bindtap="cancelStart">取消</button>
        <button class="button-primary" bindtap="confirmStart">确认开始</button>
      </view>
    </view>

    <view ink:if="{{hasStarted}}" class="question-card">
      <text class="section-title">当前问题</text>
      <text ink:if="{{currentQuestion}}" class="question-text">{{currentQuestion}}</text>
      <text ink:else class="placeholder-text">等待问题进入识别流...</text>
    </view>

    <view ink:if="{{hasStarted}}" class="hints-card">
      <text class="section-title">关键词提示</text>
      <view ink:if="{{hints.length > 0}}">
        <view class="hint-row" ink:for="{{hints}}" ink:key="index">
          <text class="hint-bullet">{{index + 1}}</text>
          <text class="hint-text">{{item}}</text>
        </view>
        <text ink:if="{{warning}}" class="warning-text">{{warning}}</text>
      </view>
      <text ink:else class="placeholder-text">识别到问题后，这里只展示短提示卡片。</text>
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
.question-card,
.hints-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--card-padding, 16px);
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  border-width: var(--card-border-width, 2px);
  border-style: solid;
  border-color: var(--card-border-color, rgba(64, 255, 94, 0.35));
  border-radius: var(--radius-md, 12px);
}

.page-title,
.section-title {
  font-size: 16px;
  font-weight: bold;
  color: var(--color-text-primary, #ffffff);
}

.meta-line,
.compliance-text,
.placeholder-text {
  font-size: 12px;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.72));
}

.question-text,
.hint-text {
  font-size: 13px;
  color: var(--color-text-primary, #ffffff);
  line-height: 1.35;
}

.hint-row {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 8px;
}

.hint-bullet {
  width: 18px;
  font-size: 12px;
  color: var(--color-primary, #40ff5e);
}

.warning-text {
  font-size: 12px;
  color: var(--border-color-warning, #ffd166);
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
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-radius: var(--radius-md, 12px);
}

.button-primary {
  background-color: var(--color-primary, #40ff5e);
  color: #000000;
  border-color: var(--color-primary, #40ff5e);
}

.button-secondary {
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  color: var(--color-text-primary, #ffffff);
  border-color: var(--border-color-default, rgba(64, 255, 94, 0.35));
}

.button-danger {
  background-color: rgba(255, 90, 90, 0.14);
  color: #ffffff;
  border-color: var(--border-color-danger, #ff6b6b);
}
</style>
