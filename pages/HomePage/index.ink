<script type="application/json" def>
{
  "navigationBarTitleText": "首页",
  "description": "应用主入口页面，展示开始面试、查看复盘和设置入口"
}
</script>

<script setup>
import wx from 'wx';
import storageService from '../../src/services/storageService.js';
import { APP_CONFIG } from '../../src/utils/constants.js';
import { calculateAverageScore, formatDateShort, formatDuration } from '../../src/utils/format.js';

export default {
  data: {
    appName: APP_CONFIG.name,
    subtitle: APP_CONFIG.subtitle,
    version: APP_CONFIG.version,
    hasLatestRecord: false,
    latestRecord: {
      date: '',
      duration: '',
      questionCount: 0,
      score: '0.0',
    },
  },

  onLoad() {
    this.loadLatestRecord();
  },

  onShow() {
    this.loadLatestRecord();
  },

  loadLatestRecord() {
    const record = storageService.getLatestInterviewRecord();
    if (!record) {
      this.setData({ hasLatestRecord: false });
      return;
    }

    this.setData({
      hasLatestRecord: true,
      latestRecord: {
        date: formatDateShort(record.createdAt),
        duration: formatDuration(record.duration || 0),
        questionCount: record.questions ? record.questions.length : 0,
        score: record.review ? calculateAverageScore(record.review.scores) : '0.0',
      },
    });
  },

  startInterview() {
    wx.navigateTo({ url: '/pages/InterviewPage/index' });
  },

  viewReview() {
    wx.navigateTo({ url: '/pages/ReviewPage/index' });
  },

  openSettings() {
    wx.navigateTo({ url: '/pages/SettingsPage/index' });
  },
};
</script>

<page>
  <view class="container">
    <view class="hero-card">
      <text class="title">{{appName}}</text>
      <text class="subtitle">{{subtitle}}</text>
      <text class="hero-note">只输出短提示，不输出照读答案</text>
    </view>

    <view class="menu-list">
      <button class="menu-button primary" bindtap="startInterview">开始面试</button>
      <button class="menu-button" bindtap="viewReview">查看复盘</button>
      <button class="menu-button" bindtap="openSettings">设置</button>
    </view>

    <view ink:if="{{hasLatestRecord}}" class="summary-card">
      <text class="card-title">最近复盘</text>
      <text class="card-line">{{latestRecord.date}} / {{latestRecord.duration}}</text>
      <text class="card-line">问题数 {{latestRecord.questionCount}}</text>
      <text class="card-line">综合评分 {{latestRecord.score}} / 10</text>
    </view>

    <view ink:else class="summary-card">
      <text class="card-title">使用边界</text>
      <text class="card-line">仅用于模拟面试与复盘训练</text>
      <text class="card-line">录音前需获得明确授权</text>
      <text class="card-line">不支持隐藏录音与作弊场景</text>
    </view>

    <view class="footer">
      <text class="version">v{{version}}</text>
      <text class="footer-text">Rokid AI 面试训练助手</text>
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

.hero-card,
.summary-card {
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

.title {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-primary, #40ff5e);
}

.subtitle {
  font-size: 15px;
  color: var(--color-text-primary, #ffffff);
}

.hero-note,
.card-line,
.footer-text {
  font-size: 12px;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.72));
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-button {
  text-align: center;
  padding: 12px 14px;
  font-size: 16px;
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  color: var(--color-text-primary, #ffffff);
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-color: var(--border-color-default, rgba(64, 255, 94, 0.35));
  border-radius: var(--radius-md, 12px);
}

.menu-button.primary {
  background-color: var(--color-primary, #40ff5e);
  color: #000000;
  border-color: var(--color-primary, #40ff5e);
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary, #ffffff);
}

.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.version {
  font-size: 12px;
  color: var(--color-primary-60, rgba(64, 255, 94, 0.6));
}
</style>
