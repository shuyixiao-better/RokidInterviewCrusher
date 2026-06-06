<script def>
{
  "navigationBarTitleText": "面试中",
  "description": "面试进行中页面，显示录音状态、识别问题和关键词提示"
}
</script>

<script setup>
import wx from 'wx';
import interviewService from '../../src/services/interviewService.js';
import audioService from '../../src/services/audioService.js';
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
    durationTimer: null,
    showComplianceTip: true,
  },

  onLoad() {
    this.initInterview();
  },

  onUnload() {
    this.cleanup();
  },

  /**
   * 初始化面试
   */
  async initInterview() {
    const profile = storageService.getUserProfile();
    await interviewService.init(profile);
  },

  /**
   * 开始面试
   */
  async startInterview() {
    // 显示合规提示
    this.setData({ showComplianceTip: true });

    const success = await interviewService.startInterview();
    if (success) {
      this.setData({
        status: INTERVIEW_STATUS.RECORDING,
        statusText: '录音中',
        showComplianceTip: false,
      });
      this.startDurationTimer();
      this.listenForQuestions();
    }
  },

  /**
   * 监听识别到的问题
   */
  listenForQuestions() {
    interviewService.onQuestionRecognized((question, hintData) => {
      this.setData({
        currentQuestion: question,
        hints: hintData.hints || [],
        warning: hintData.warning || '',
        status: INTERVIEW_STATUS.ANALYZING,
        statusText: '分析中',
      });

      // 短暂显示分析状态后恢复录音状态
      setTimeout(() => {
        if (this.data.status === INTERVIEW_STATUS.ANALYZING) {
          this.setData({
            status: INTERVIEW_STATUS.RECORDING,
            statusText: '录音中',
          });
        }
      }, 1500);
    });
  },

  /**
   * 开始计时器
   */
  startDurationTimer() {
    const startTime = Date.now();
    this.data.durationTimer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      this.setData({
        duration: formatDuration(elapsed),
      });
    }, 1000);
  },

  /**
   * 停止计时器
   */
  stopDurationTimer() {
    if (this.data.durationTimer) {
      clearInterval(this.data.durationTimer);
      this.data.durationTimer = null;
    }
  },

  /**
   * 结束面试
   */
  async endInterview() {
    this.stopDurationTimer();
    this.setData({
      status: INTERVIEW_STATUS.COMPLETED,
      statusText: '处理中',
    });

    const result = await interviewService.endInterview();
    if (result) {
      // 跳转到复盘页面
      wx.navigateTo({
        url: '/pages/ReviewPage/index',
      });
    }
  },

  /**
   * 确认开始录音（用户点击后）
   */
  confirmStart() {
    this.setData({ showComplianceTip: false });
    this.startInterview();
  },

  /**
   * 取消开始
   */
  cancelStart() {
    wx.navigateBack();
  },

  /**
   * 清理资源
   */
  cleanup() {
    this.stopDurationTimer();
    interviewService.cleanup();
  },
};
</script>

<page>
  <view class="container">
    <!-- 合规提示弹窗 -->
    <view ink:if="{{showComplianceTip}}" class="compliance-overlay">
      <view class="compliance-dialog">
        <text class="compliance-title">录音授权提示</text>
        <text class="compliance-text">
          开始录音前，请确保：
        </text>
        <text class="compliance-item">1. 已获得面试相关方授权</text>
        <text class="compliance-item">2. 符合当地法律法规要求</text>
        <text class="compliance-item">3. 遵守面试规则和约定</text>
        <view class="compliance-actions">
          <view class="btn-cancel" bindtap="cancelStart">
            <text>取消</text>
          </view>
          <view class="btn-confirm" bindtap="confirmStart">
            <text>确认开始</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 状态栏 -->
    <view class="status-bar">
      <view class="status-indicator {{status === 'recording' ? 'recording' : ''}}">
        <text class="status-dot"></text>
        <text class="status-text">{{statusText}}</text>
      </view>
      <text class="duration">{{duration}}</text>
    </view>

    <!-- 当前问题 -->
    <view ink:if="{{currentQuestion}}" class="question-section">
      <text class="section-label">识别问题</text>
      <text class="question-text">{{currentQuestion}}</text>
    </view>

    <!-- 关键词提示 -->
    <view ink:if="{{hints.length > 0}}" class="hints-section">
      <text class="section-label">答题提示</text>
      <view class="hints-list">
        <text ink:for="{{hints}}" ink:key="index" class="hint-item">{{item}}</text>
      </view>
      <text ink:if="{{warning}}" class="warning-text">{{warning}}</text>
    </view>

    <!-- 等待状态提示 -->
    <view ink:if="{{!currentQuestion && status === 'recording'}}" class="waiting-section">
      <text class="waiting-text">等待面试官提问...</text>
    </view>

    <!-- 操作按钮 -->
    <view class="action-section">
      <view
        ink:if="{{status === 'idle'}}"
        class="btn-start"
        bindtap="confirmStart"
      >
        <text class="btn-text">开始面试</text>
      </view>

      <view
        ink:if="{{status === 'recording' || status === 'analyzing'}}"
        class="btn-stop"
        bindtap="endInterview"
      >
        <text class="btn-text">结束面试</text>
      </view>
    </view>
  </view>
</page>

<style>
.container {
  display: flex;
  flex-direction: column;
  min-height: var(--app-height-min);
  padding: var(--spacing-md);
  background-color: var(--color-background);
}

/* 合规提示弹窗 */
.compliance-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.compliance-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
}

.compliance-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.compliance-text {
  font-size: 14px;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.compliance-item {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  padding-left: var(--spacing-sm);
}

.compliance-actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-lg);
}

.btn-cancel {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
  border-radius: var(--radius-sm);
  text-align: center;
}

.btn-confirm {
  flex: 1;
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-primary);
  border-radius: var(--radius-sm);
  text-align: center;
}

.btn-cancel text {
  color: var(--color-text-primary);
  font-size: 14px;
}

.btn-confirm text {
  color: var(--color-background);
  font-size: 14px;
}

/* 状态栏 */
.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) 0;
  margin-bottom: var(--spacing-md);
  border-bottom-width: var(--border-width-thin);
  border-bottom-style: solid;
  border-bottom-color: var(--border-color-muted);
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: var(--color-text-secondary);
}

.status-indicator.recording .status-dot {
  background-color: var(--color-primary);
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.status-text {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.duration {
  font-size: 14px;
  color: var(--color-text-secondary);
  font-family: monospace;
}

/* 问题区域 */
.question-section {
  margin-bottom: var(--spacing-md);
}

.section-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

.question-text {
  font-size: 16px;
  color: var(--color-text-primary);
  line-height: 1.5;
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-sm);
  border-left-width: var(--border-width-strong);
  border-left-style: solid;
  border-left-color: var(--color-primary);
}

/* 提示区域 */
.hints-section {
  flex: 1;
  margin-bottom: var(--spacing-md);
}

.hints-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.hint-item {
  font-size: 14px;
  color: var(--color-text-primary);
  background-color: var(--color-surface-highlight);
  padding: var(--spacing-sm) var(--spacing-md);
  border-radius: var(--radius-sm);
  border-left-width: var(--border-width-thin);
  border-left-style: solid;
  border-left-color: var(--color-primary);
}

.warning-text {
  font-size: 12px;
  color: var(--color-primary);
  margin-top: var(--spacing-sm);
  font-style: italic;
}

/* 等待状态 */
.waiting-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.waiting-text {
  font-size: 16px;
  color: var(--color-text-secondary);
}

/* 操作按钮 */
.action-section {
  padding: var(--spacing-md) 0;
}

.btn-start {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
}

.btn-stop {
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-danger);
}

.btn-start .btn-text {
  color: var(--color-background);
  font-size: 16px;
  font-weight: 500;
}

.btn-stop .btn-text {
  color: var(--border-color-danger);
  font-size: 16px;
  font-weight: 500;
}
</style>
