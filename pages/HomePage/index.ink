<script def>
{
  "navigationBarTitleText": "首页",
  "description": "应用主入口页面，展示功能菜单和最近面试记录",
  "schema": {
    "data": {
      "type": "object",
      "properties": {
        "hasLatestRecord": {
          "type": "boolean",
          "description": "是否有最近面试记录"
        },
        "latestRecord": {
          "type": "object",
          "properties": {
            "date": { "type": "string" },
            "duration": { "type": "string" },
            "questionCount": { "type": "number" },
            "score": { "type": "string" }
          }
        }
      }
    }
  }
}
</script>

<script setup>
import wx from 'wx';
import storageService from '../../src/services/storageService.js';
import { formatDateShort, formatDuration } from '../../src/utils/format.js';

export default {
  data: {
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

  /**
   * 加载最近面试记录
   */
  loadLatestRecord() {
    const records = storageService.getInterviewRecords();
    if (records && records.length > 0) {
      const record = records[0];
      this.setData({
        hasLatestRecord: true,
        latestRecord: {
          date: formatDateShort(record.createdAt),
          duration: formatDuration(record.duration),
          questionCount: record.questions ? record.questions.length : 0,
          score: record.review ? this.calculateAverageScore(record.review.scores) : '0.0',
        },
      });
    }
  },

  /**
   * 计算平均分
   */
  calculateAverageScore(scores) {
    if (!scores) return '0.0';
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  },

  /**
   * 开始面试
   */
  startInterview() {
    wx.navigateTo({ url: '/pages/InterviewPage/index' });
  },

  /**
   * 查看复盘
   */
  viewReview() {
    wx.navigateTo({ url: '/pages/ReviewPage/index' });
  },

  /**
   * 打开设置
   */
  openSettings() {
    wx.navigateTo({ url: '/pages/SettingsPage/index' });
  },
};
</script>

<page>
  <view class="container">
    <view class="header">
      <text class="title">吊打面试官</text>
      <text class="subtitle">AI 面试训练助手</text>
    </view>

    <view class="content">
      <view class="menu-list">
        <view class="menu-item primary" bindtap="startInterview">
          <text class="text">开始面试</text>
        </view>

        <view class="menu-item" bindtap="viewReview">
          <text class="text">查看复盘</text>
          <text ink:if="{{hasLatestRecord}}" class="badge">最近</text>
        </view>

        <view class="menu-item" bindtap="openSettings">
          <text class="text">设置</text>
        </view>
      </view>

      <view ink:if="{{hasLatestRecord}}" class="latest-record">
        <text class="record-title">最近面试</text>
        <view class="record-info">
          <text class="info-item">{{latestRecord.date}}</text>
          <text class="info-item">{{latestRecord.duration}}</text>
          <text class="info-item">{{latestRecord.questionCount}} 个问题</text>
        </view>
        <text ink:if="{{latestRecord.score !== '0.0'}}" class="score-text">
          综合评分: {{latestRecord.score}}/10
        </text>
      </view>
    </view>

    <view class="footer">
      <text class="version">v1.0.0</text>
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

.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: var(--spacing-lg) 0;
}

.title {
  font-size: 28px;
  font-weight: bold;
  color: var(--color-primary);
  margin-bottom: var(--spacing-sm);
}

.subtitle {
  font-size: 14px;
  color: var(--color-text-secondary);
}

.content {
  flex: 1;
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
  border-radius: var(--radius-md);
}

.menu-item.primary {
  background-color: var(--color-primary);
  border-color: var(--color-primary);
}

.menu-item.primary .text {
  color: var(--color-background);
}

.text {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.badge {
  margin-left: auto;
  background-color: var(--color-primary);
  color: var(--color-background);
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: 12px;
}

.latest-record {
  background-color: var(--color-surface);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-success);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
}

.record-title {
  font-size: 14px;
  color: var(--color-primary);
  margin-bottom: var(--spacing-md);
}

.record-info {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-sm);
}

.info-item {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.score-text {
  font-size: 14px;
  color: var(--color-text-primary);
  font-weight: 500;
}

.footer {
  padding: var(--spacing-md) 0;
  border-top-width: var(--border-width-thin);
  border-top-style: solid;
  border-top-color: var(--border-color-muted);
  margin-top: var(--spacing-md);
}

.version {
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}
</style>
