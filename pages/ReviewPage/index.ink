<script type="application/json" def>
{
  "navigationBarTitleText": "面试复盘",
  "description": "面试复盘分析页面，展示评分、问题分析和改进建议"
}
</script>

<script setup>
import wx from 'wx';
import storageService from '../../src/services/storageService.js';
import { calculateAverageScore, formatDateShort, formatDuration, joinText } from '../../src/utils/format.js';

export default {
  data: {
    hasRecord: false,
    record: null,
    review: null,
    scores: {},
    questions: [],
    topProblems: [],
    nextPreparationPlan: [],
    averageScore: '0.0',
    scoreLevel: '需改进',
    selectedActionIndex: 0,
  },

  onLoad() {
    this.loadLatestReview();
  },

  loadLatestReview() {
    const record = storageService.getLatestInterviewRecord();
    if (!record || !record.review) {
      this.setData({
        hasRecord: false,
        selectedActionIndex: 0,
      });
      return;
    }

    const review = record.review;
    const averageScore = calculateAverageScore(review.scores || {});
    this.setData({
      hasRecord: true,
      record: {
        date: formatDateShort(record.createdAt),
        duration: formatDuration(record.duration || 0),
        questionCount: record.questions ? record.questions.length : 0,
      },
      review,
      scores: review.scores || {},
      questions: this.buildQuestionCards(review.questions || []),
      topProblems: review.topProblems || [],
      nextPreparationPlan: review.nextPreparationPlan || [],
      averageScore,
      scoreLevel: this.getScoreLevel(Number(averageScore)),
      selectedActionIndex: 0,
    });
  },

  buildQuestionCards(questions) {
    return questions.map((item, index) => ({
      id: String(index),
      title: item.question || `问题 ${index + 1}`,
      answerSummary: item.answerSummary || '',
      strengthsText: joinText(item.strengths || []),
      weaknessesText: joinText(item.weaknesses || []),
      structureText: joinText(item.betterAnswerStructure || []),
    }));
  },

  getScoreLevel(score) {
    if (score >= 8) return '优秀';
    if (score >= 6) return '良好';
    if (score >= 4) return '一般';
    return '需改进';
  },

  goHome() {
    wx.navigateBack({ delta: 10 });
  },

  startNewInterview() {
    wx.navigateTo({ url: '/pages/InterviewPage/index' });
  },

  focusPrimaryAction() {
    this.setData({ selectedActionIndex: 0 });
  },

  focusSecondaryAction() {
    this.setData({ selectedActionIndex: 1 });
  },

  onKeyDown(event) {
    const code = event && event.code ? event.code : '';
    const maxIndex = this.data.hasRecord ? 1 : 0;

    if (code === 'ArrowLeft' || code === 'ArrowUp') {
      this.setData({
        selectedActionIndex: Math.max(0, this.data.selectedActionIndex - 1),
      });
      return;
    }

    if (code === 'ArrowRight' || code === 'ArrowDown') {
      this.setData({
        selectedActionIndex: Math.min(maxIndex, this.data.selectedActionIndex + 1),
      });
      return;
    }

    if (code === 'Enter') {
      if (!this.data.hasRecord || this.data.selectedActionIndex === 0) {
        this.startNewInterview();
        return;
      }
      this.goHome();
      return;
    }

    if (code === 'Backspace') {
      this.goHome();
    }
  },
};
</script>

<page>
  <view class="container">
    <view ink:if="{{!hasRecord}}" class="empty-state">
      <text class="empty-title">暂无面试记录</text>
      <text class="empty-text">完成一次面试后即可查看复盘分析</text>
      <button class="btn-primary {{selectedActionIndex === 0 ? 'btn-selected-primary' : ''}}" bindtap="startNewInterview" bindfocus="focusPrimaryAction">开始面试</button>
    </view>

    <view ink:if="{{hasRecord}}" class="review-content">
      <view class="panel-card">
        <text class="card-title">面试概览</text>
        <text class="card-line">日期 {{record.date}}</text>
        <text class="card-line">时长 {{record.duration}}</text>
        <text class="card-line">问题数 {{record.questionCount}}</text>
      </view>

      <view class="panel-card">
        <text class="card-title">综合评分</text>
        <text class="score-number">{{averageScore}}</text>
        <text class="score-level">{{scoreLevel}}</text>
        <text class="card-line">技术深度 {{scores.technicalDepth}}</text>
        <text class="card-line">表达清晰 {{scores.communication}}</text>
        <text class="card-line">逻辑结构 {{scores.logic}}</text>
        <text class="card-line">岗位匹配 {{scores.jobMatch}}</text>
      </view>

      <view ink:if="{{review.summary}}" class="panel-card">
        <text class="card-title">整体评价</text>
        <text class="card-line">{{review.summary}}</text>
      </view>

      <view ink:if="{{questions.length > 0}}" class="panel-card">
        <text class="card-title">问题分析</text>
        <view class="question-item" ink:for="{{questions}}" ink:key="id">
          <text class="question-title">{{index + 1}}. {{item.title}}</text>
          <text class="card-line">回答摘要 {{item.answerSummary}}</text>
          <text class="card-line">优点 {{item.strengthsText}}</text>
          <text class="card-line">不足 {{item.weaknessesText}}</text>
          <text class="card-line">建议结构 {{item.structureText}}</text>
        </view>
      </view>

      <view ink:if="{{topProblems.length > 0}}" class="panel-card">
        <text class="card-title">主要问题</text>
        <text class="card-line" ink:for="{{topProblems}}" ink:key="index">{{index + 1}}. {{item}}</text>
      </view>

      <view ink:if="{{nextPreparationPlan.length > 0}}" class="panel-card">
        <text class="card-title">改进计划</text>
        <text class="card-line" ink:for="{{nextPreparationPlan}}" ink:key="index">{{index + 1}}. {{item}}</text>
      </view>

      <view class="actions">
        <button class="btn-secondary {{selectedActionIndex === 1 ? 'btn-selected' : ''}}" bindtap="goHome" bindfocus="focusSecondaryAction">返回首页</button>
        <button class="btn-primary {{selectedActionIndex === 0 ? 'btn-selected-primary' : ''}}" bindtap="startNewInterview" bindfocus="focusPrimaryAction">再次面试</button>
      </view>
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
}

.empty-state,
.review-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.panel-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--card-padding, 16px);
  background-color: #060807;
  border-width: var(--border-width-thin, 1px);
  border-style: solid;
  border-color: #1d8f3e;
  border-radius: var(--radius-md, 12px);
}

.empty-title,
.card-title,
.question-title {
  font-size: 14px;
  font-weight: bold;
  color: #f2f5f3;
}

.empty-text,
.card-line,
.score-level {
  font-size: 12px;
  color: #8f9b93;
}

.score-number {
  font-size: 28px;
  color: #46d85f;
}

.question-item,
.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.actions {
  flex-direction: row;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  text-align: center;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: bold;
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-radius: var(--radius-md, 12px);
}

.btn-selected {
  border-color: #c8ffd2;
  box-shadow: 0 0 0 2px rgba(200, 255, 210, 0.2);
}

.btn-selected-primary {
  border-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.22);
}

.btn-primary {
  background-color: #38f255;
  color: #041006;
  border-color: #c8ffd2;
}

.btn-secondary {
  background-color: #060807;
  color: #f2f5f3;
  border-color: #1d8f3e;
}
</style>
