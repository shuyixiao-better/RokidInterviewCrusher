<script def>
{
  "navigationBarTitleText": "面试复盘",
  "description": "面试复盘分析页面，展示评分、问题分析和改进建议"
}
</script>

<script setup>
import wx from 'wx';
import storageService from '../../src/services/storageService.js';
import { formatDateShort, formatDuration } from '../../src/utils/format.js';

export default {
  data: {
    hasRecord: false,
    record: null,
    review: null,
    scores: {},
    questions: [],
    topProblems: [],
    nextPreparationPlan: [],
    expandedQuestionIndex: -1,
  },

  onLoad() {
    this.loadLatestReview();
  },

  /**
   * 加载最近的复盘记录
   */
  loadLatestReview() {
    const record = storageService.getLatestInterviewRecord();
    if (record && record.review) {
      const review = record.review;
      this.setData({
        hasRecord: true,
        record: {
          date: formatDateShort(record.createdAt),
          duration: formatDuration(record.duration),
          questionCount: record.questions ? record.questions.length : 0,
        },
        review: review,
        scores: review.scores || {},
        questions: review.questions || [],
        topProblems: review.topProblems || [],
        nextPreparationPlan: review.nextPreparationPlan || [],
      });
    }
  },

  /**
   * 计算平均分
   */
  calculateAverageScore() {
    const scores = this.data.scores;
    if (!scores) return '0.0';
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  },

  /**
   * 获取评分等级
   */
  getScoreLevel(score) {
    if (score >= 8) return '优秀';
    if (score >= 6) return '良好';
    if (score >= 4) return '一般';
    return '需改进';
  },

  /**
   * 切换问题展开/收起
   */
  toggleQuestion(e) {
    const index = e.currentTarget.dataset.index;
    this.setData({
      expandedQuestionIndex: this.data.expandedQuestionIndex === index ? -1 : index,
    });
  },

  /**
   * 返回首页
   */
  goHome() {
    wx.navigateBack({ delta: 10 });
  },

  /**
   * 开始新面试
   */
  startNewInterview() {
    wx.navigateTo({
      url: '/pages/InterviewPage/index',
    });
  },
};
</script>

<page>
  <view class="container">
    <!-- 无记录状态 -->
    <view ink:if="{{!hasRecord}}" class="empty-state">
      <text class="empty-title">暂无面试记录</text>
      <text class="empty-text">完成一次面试后即可查看复盘分析</text>
      <view class="btn-primary" bindtap="startNewInterview">
        <text class="btn-text">开始面试</text>
      </view>
    </view>

    <!-- 复盘内容 -->
    <view ink:if="{{hasRecord}}" class="review-content">
      <!-- 面试概览 -->
      <view class="overview-card">
        <text class="card-title">面试概览</text>
        <view class="overview-info">
          <view class="info-item">
            <text class="info-label">日期</text>
            <text class="info-value">{{record.date}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">时长</text>
            <text class="info-value">{{record.duration}}</text>
          </view>
          <view class="info-item">
            <text class="info-label">问题数</text>
            <text class="info-value">{{record.questionCount}}</text>
          </view>
        </view>
      </view>

      <!-- 评分卡片 -->
      <view class="score-card">
        <text class="card-title">综合评分</text>
        <view class="score-overall">
          <text class="score-number">{{calculateAverageScore()}}</text>
          <text class="score-level">{{getScoreLevel(calculateAverageScore())}}</text>
        </view>
        <view class="score-details">
          <view class="score-item">
            <text class="score-label">技术深度</text>
            <text class="score-value">{{scores.technicalDepth}}</text>
          </view>
          <view class="score-item">
            <text class="score-label">表达清晰</text>
            <text class="score-value">{{scores.communication}}</text>
          </view>
          <view class="score-item">
            <text class="score-label">逻辑结构</text>
            <text class="score-value">{{scores.logic}}</text>
          </view>
          <view class="score-item">
            <text class="score-label">岗位匹配</text>
            <text class="score-value">{{scores.jobMatch}}</text>
          </view>
        </view>
      </view>

      <!-- 整体评价 -->
      <view ink:if="{{review.summary}}" class="summary-card">
        <text class="card-title">整体评价</text>
        <text class="summary-text">{{review.summary}}</text>
      </view>

      <!-- 问题分析 -->
      <view ink:if="{{questions.length > 0}}" class="questions-card">
        <text class="card-title">问题分析</text>
        <view class="questions-list">
          <view
            ink:for="{{questions}}"
            ink:key="index"
            class="question-item {{expandedQuestionIndex === index ? 'expanded' : ''}}"
            bindtap="toggleQuestion"
            data-index="{{index}}"
          >
            <view class="question-header">
              <text class="question-index">{{index + 1}}</text>
              <text class="question-text">{{item.question}}</text>
            </view>
            <view ink:if="{{expandedQuestionIndex === index}}" class="question-detail">
              <text class="detail-label">回答摘要</text>
              <text class="detail-text">{{item.answerSummary}}</text>

              <text class="detail-label">优点</text>
              <view class="tag-list">
                <text ink:for="{{item.strengths}}" ink:key="index" class="tag success">{{item}}</text>
              </view>

              <text class="detail-label">不足</text>
              <view class="tag-list">
                <text ink:for="{{item.weaknesses}}" ink:key="index" class="tag warning">{{item}}</text>
              </view>

              <text class="detail-label">建议结构</text>
              <view class="structure-list">
                <text ink:for="{{item.betterAnswerStructure}}" ink:key="index" class="structure-item">{{item}}</text>
              </view>
            </view>
          </view>
        </view>
      </view>

      <!-- 主要问题 -->
      <view ink:if="{{topProblems.length > 0}}" class="problems-card">
        <text class="card-title">主要问题</text>
        <view class="problems-list">
          <text ink:for="{{topProblems}}" ink:key="index" class="problem-item">{{item}}</text>
        </view>
      </view>

      <!-- 改进计划 -->
      <view ink:if="{{nextPreparationPlan.length > 0}}" class="plan-card">
        <text class="card-title">改进计划</text>
        <view class="plan-list">
          <text ink:for="{{nextPreparationPlan}}" ink:key="index" class="plan-item">{{item}}</text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions">
        <view class="btn-secondary" bindtap="goHome">
          <text class="btn-text">返回首页</text>
        </view>
        <view class="btn-primary" bindtap="startNewInterview">
          <text class="btn-text">再次面试</text>
        </view>
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

/* 空状态 */
.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-md);
}

.empty-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
}

.empty-text {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 复盘内容 */
.review-content {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

/* 卡片通用样式 */
.overview-card,
.score-card,
.summary-card,
.questions-card,
.problems-card,
.plan-card {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-md);
  border-width: var(--border-width-thin);
  border-style: solid;
  border-color: var(--border-color-muted);
}

.card-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

/* 面试概览 */
.overview-info {
  display: flex;
  gap: var(--spacing-md);
}

.info-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-sm);
}

.info-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.info-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
}

/* 评分卡片 */
.score-overall {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-md);
}

.score-number {
  font-size: 48px;
  font-weight: bold;
  color: var(--color-primary);
}

.score-level {
  font-size: 16px;
  color: var(--color-text-secondary);
}

.score-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--spacing-sm);
}

.score-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-sm);
  background-color: var(--color-surface-highlight);
  border-radius: var(--radius-sm);
}

.score-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.score-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-primary);
}

/* 整体评价 */
.summary-text {
  font-size: 14px;
  color: var(--color-text-primary);
  line-height: 1.6;
}

/* 问题分析 */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.question-item {
  background-color: var(--color-surface-highlight);
  border-radius: var(--radius-sm);
  overflow: hidden;
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
}

.question-index {
  min-width: 24px;
  height: 24px;
  background-color: var(--color-primary);
  color: var(--color-background);
  font-size: 12px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
}

.question-text {
  flex: 1;
  font-size: 14px;
  color: var(--color-text-primary);
}

.question-detail {
  padding: var(--spacing-sm) var(--spacing-md) var(--spacing-md);
  border-top-width: var(--border-width-thin);
  border-top-style: solid;
  border-top-color: var(--border-color-muted);
}

.detail-label {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: var(--spacing-sm);
  margin-bottom: var(--spacing-sm);
}

.detail-text {
  font-size: 13px;
  color: var(--color-text-primary);
  line-height: 1.5;
}

.tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-sm);
}

.tag {
  font-size: 12px;
  padding: 2px var(--spacing-sm);
  border-radius: var(--radius-sm);
}

.tag.success {
  background-color: var(--color-surface);
  color: var(--border-color-success);
  border-width: var(--border-width-thin);
  border-style: solid;
  border-color: var(--border-color-success);
}

.tag.warning {
  background-color: var(--color-surface);
  color: var(--border-color-warning);
  border-width: var(--border-width-thin);
  border-style: solid;
  border-color: var(--border-color-warning);
}

.structure-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.structure-item {
  font-size: 13px;
  color: var(--color-text-primary);
  padding-left: var(--spacing-md);
}

/* 主要问题 */
.problems-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.problem-item {
  font-size: 14px;
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface-highlight);
  border-radius: var(--radius-sm);
  border-left-width: var(--border-width-default);
  border-left-style: solid;
  border-left-color: var(--border-color-warning);
}

/* 改进计划 */
.plan-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.plan-item {
  font-size: 14px;
  color: var(--color-text-primary);
  padding: var(--spacing-sm) var(--spacing-md);
  background-color: var(--color-surface-highlight);
  border-radius: var(--radius-sm);
  border-left-width: var(--border-width-default);
  border-left-style: solid;
  border-left-color: var(--color-primary);
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.btn-primary {
  flex: 1;
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
}

.btn-secondary {
  flex: 1;
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
}

.btn-primary .btn-text {
  color: var(--color-background);
  font-size: 14px;
  font-weight: 500;
}

.btn-secondary .btn-text {
  color: var(--color-text-primary);
  font-size: 14px;
  font-weight: 500;
}
</style>
