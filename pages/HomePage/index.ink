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
    selectedIndex: 0,
    selectedActionText: '开始面试',
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
    this.setData({
      selectedIndex: 0,
      selectedActionText: '开始面试',
    });
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

  setSelectedIndex(index) {
    const labels = ['开始面试', '查看复盘', '设置'];
    const nextIndex = Math.max(0, Math.min(index, labels.length - 1));
    this.setData({
      selectedIndex: nextIndex,
      selectedActionText: labels[nextIndex],
    });
  },

  activateSelected() {
    if (this.data.selectedIndex === 0) {
      this.startInterview();
      return;
    }
    if (this.data.selectedIndex === 1) {
      this.viewReview();
      return;
    }
    this.openSettings();
  },

  focusStart() {
    this.setSelectedIndex(0);
  },

  focusReview() {
    this.setSelectedIndex(1);
  },

  focusSettings() {
    this.setSelectedIndex(2);
  },

  onKeyDown(event) {
    const code = event && event.code ? event.code : '';

    if (code === 'ArrowUp') {
      this.setSelectedIndex(this.data.selectedIndex - 1);
      return;
    }

    if (code === 'ArrowDown') {
      this.setSelectedIndex(this.data.selectedIndex + 1);
      return;
    }

    if (code === 'Enter') {
      this.activateSelected();
      return;
    }

    if (code === 'Backspace' && typeof wx.exitMiniProgram === 'function') {
      wx.exitMiniProgram();
    }
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
      <button class="menu-button {{selectedIndex === 0 ? 'selected primary' : ''}}" bindtap="startInterview" bindfocus="focusStart">开始面试</button>
      <button class="menu-button {{selectedIndex === 1 ? 'selected' : ''}}" bindtap="viewReview" bindfocus="focusReview">查看复盘</button>
      <button class="menu-button {{selectedIndex === 2 ? 'selected' : ''}}" bindtap="openSettings" bindfocus="focusSettings">设置</button>
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
      <text class="footer-text">当前焦点 {{selectedActionText}}</text>
    </view>
  </view>
</page>

<style>
.container {
  display: flex;
  flex-direction: column;
  width: 396px;
  max-width: 396px;
  min-height: var(--app-height-min, 120px);
  max-height: var(--app-height-max, 380px);
  box-sizing: border-box;
  padding: 12px;
  background-color: var(--color-background, #000000);
  gap: 12px;
}

.hero-card,
.summary-card {
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
  gap: 8px;
  padding: 14px;
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  border-width: var(--card-border-width, 2px);
  border-style: solid;
  border-color: var(--card-border-color, rgba(64, 255, 94, 0.35));
  border-radius: var(--radius-md, 12px);
}

.title {
  font-size: 24px;
  font-weight: bold;
  color: #f5fff7;
  line-height: 1.05;
}

.subtitle {
  font-size: 13px;
  color: #d7e0db;
}

.hero-note,
.card-line,
.footer-text {
  font-size: 12px;
  color: #8f9b93;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.menu-button {
  text-align: center;
  padding: 11px 12px;
  font-size: 15px;
  font-weight: bold;
  background-color: #060807;
  color: #f2f5f3;
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-color: #1d8f3e;
  border-radius: var(--radius-md, 12px);
}

.menu-button.selected {
  background-color: #38f255;
  color: #041006;
  border-color: #c8ffd2;
  box-shadow: 0 0 0 2px rgba(200, 255, 210, 0.2);
}

.menu-button.primary,
.menu-button.selected.primary {
  background-color: #38f255;
  color: #041006;
  border-color: #c8ffd2;
}

.card-title {
  font-size: 14px;
  font-weight: bold;
  color: #f2f5f3;
}

.footer {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
}

.version {
  font-size: 12px;
  color: #46d85f;
}
</style>
