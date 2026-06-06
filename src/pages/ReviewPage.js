/**
 * 复盘页面
 * 展示面试复盘报告，包括评分、问题分析、改进建议
 *
 * 设计考虑：
 * 1. 信息层次清晰
 * 2. 评分直观展示
 * 3. 问题列表可展开查看详情
 * 4. 适合眼镜小屏幕滚动浏览
 */

import { SCORE_DIMENSION_NAMES, ROUTES } from '../utils/constants.js';
import storageService from '../services/storageService.js';
import { formatTime, formatDuration, formatScore, getScoreLevel } from '../utils/format.js';

/**
 * 复盘页面类
 */
class ReviewPage {
  constructor(router) {
    this.router = router;
    this.container = null;
    this.interviewId = null;
  }

  /**
   * 渲染页面
   * @param {HTMLElement} container - 页面容器
   * @param {Object} params - 页面参数
   */
  render(container, params = {}) {
    this.container = container;
    this.interviewId = params.interviewId;

    // 获取面试记录
    let record;
    if (this.interviewId) {
      record = storageService.getInterviewRecordById(this.interviewId);
    } else {
      record = storageService.getLatestInterviewRecord();
    }

    if (!record) {
      this.renderEmpty();
      return;
    }

    container.innerHTML = `
      <div class="page review-page">
        <header class="header">
          <button class="back-btn" id="btn-back">← 返回</button>
          <h2 class="title">面试复盘</h2>
        </header>

        <main class="content">
          ${this.renderSummary(record)}
          ${record.review ? this.renderScores(record.review.scores) : ''}
          ${record.review ? this.renderTopProblems(record.review.topProblems) : ''}
          ${record.review ? this.renderQuestions(record.review.questions) : ''}
          ${record.review ? this.renderNextPlan(record.review.nextPreparationPlan) : ''}
          ${this.renderRecordInfo(record)}
        </main>

        <footer class="footer">
          <button class="btn-primary" id="btn-new-interview">开始新面试</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 渲染空状态
   */
  renderEmpty() {
    this.container.innerHTML = `
      <div class="page review-page">
        <header class="header">
          <button class="back-btn" id="btn-back">← 返回</button>
          <h2 class="title">面试复盘</h2>
        </header>

        <main class="content empty">
          <div class="empty-icon">📊</div>
          <p class="empty-text">暂无面试记录</p>
          <p class="empty-hint">完成一次面试后即可查看复盘</p>
        </main>

        <footer class="footer">
          <button class="btn-primary" id="btn-new-interview">开始面试</button>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 渲染总结
   * @param {Object} record - 面试记录
   * @returns {string} HTML 字符串
   */
  renderSummary(record) {
    const date = formatTime(record.createdAt);
    const duration = formatDuration(record.duration);
    const questionCount = record.questions ? record.questions.length : 0;

    return `
      <div class="summary-section">
        <div class="record-meta">
          <span class="date">${date}</span>
          <span class="duration">${duration}</span>
          <span class="questions">${questionCount} 个问题</span>
        </div>
        ${record.review ? `
          <div class="overall-summary">
            <p>${record.review.summary}</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 渲染评分
   * @param {Object} scores - 评分对象
   * @returns {string} HTML 字符串
   */
  renderScores(scores) {
    if (!scores) return '';

    const avgScore = Object.values(scores).reduce((a, b) => a + b, 0) / Object.values(scores).length;

    return `
      <div class="scores-section">
        <h3>综合评分</h3>
        <div class="overall-score">
          <span class="score-value">${formatScore(avgScore)}</span>
          <span class="score-level">${getScoreLevel(avgScore)}</span>
        </div>
        <div class="score-details">
          ${Object.entries(scores).map(([key, value]) => `
            <div class="score-item">
              <span class="score-label">${SCORE_DIMENSION_NAMES[key] || key}</span>
              <div class="score-bar">
                <div class="score-fill" style="width: ${value * 10}%"></div>
              </div>
              <span class="score-value">${formatScore(value)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染主要问题
   * @param {Array} problems - 问题列表
   * @returns {string} HTML 字符串
   */
  renderTopProblems(problems) {
    if (!problems || problems.length === 0) return '';

    return `
      <div class="problems-section">
        <h3>重点改进</h3>
        <ul class="problems-list">
          ${problems.map(problem => `
            <li class="problem-item">
              <span class="problem-icon">⚠️</span>
              <span class="problem-text">${problem}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * 渲染问题详情
   * @param {Array} questions - 问题列表
   * @returns {string} HTML 字符串
   */
  renderQuestions(questions) {
    if (!questions || questions.length === 0) return '';

    return `
      <div class="questions-section">
        <h3>问题分析</h3>
        <div class="questions-list">
          ${questions.map((q, index) => `
            <div class="question-card" data-index="${index}">
              <div class="question-header">
                <span class="question-number">Q${index + 1}</span>
                <span class="question-text">${q.question}</span>
              </div>
              <div class="question-body" style="display: none;">
                <div class="answer-summary">
                  <h4>回答摘要</h4>
                  <p>${q.answerSummary}</p>
                </div>
                <div class="strengths">
                  <h4>✅ 优点</h4>
                  <ul>
                    ${q.strengths.map(s => `<li>${s}</li>`).join('')}
                  </ul>
                </div>
                <div class="weaknesses">
                  <h4>❌ 不足</h4>
                  <ul>
                    ${q.weaknesses.map(w => `<li>${w}</li>`).join('')}
                  </ul>
                </div>
                <div class="better-answer">
                  <h4>💡 建议结构</h4>
                  <ul>
                    ${q.betterAnswerStructure.map(b => `<li>${b}</li>`).join('')}
                  </ul>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  /**
   * 渲染下一步计划
   * @param {Array} plan - 计划列表
   * @returns {string} HTML 字符串
   */
  renderNextPlan(plan) {
    if (!plan || plan.length === 0) return '';

    return `
      <div class="plan-section">
        <h3>下一步准备</h3>
        <ul class="plan-list">
          ${plan.map(item => `
            <li class="plan-item">
              <span class="plan-icon">📌</span>
              <span class="plan-text">${item}</span>
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  /**
   * 渲染记录信息
   * @param {Object} record - 面试记录
   * @returns {string} HTML 字符串
   */
  renderRecordInfo(record) {
    return `
      <div class="record-info-section">
        <h3>面试信息</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">目标岗位</span>
            <span class="info-value">${record.targetRole}</span>
          </div>
          <div class="info-item">
            <span class="info-label">技术栈</span>
            <span class="info-value">${record.techStack.join('、')}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const btnBack = this.container.querySelector('#btn-back');
    const btnNewInterview = this.container.querySelector('#btn-new-interview');
    const questionCards = this.container.querySelectorAll('.question-card');

    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.router.navigate(ROUTES.HOME);
      });
    }

    if (btnNewInterview) {
      btnNewInterview.addEventListener('click', () => {
        this.router.navigate(ROUTES.INTERVIEW);
      });
    }

    // 问题卡片展开/收起
    questionCards.forEach(card => {
      const header = card.querySelector('.question-header');
      const body = card.querySelector('.question-body');

      if (header && body) {
        header.addEventListener('click', () => {
          const isExpanded = body.style.display !== 'none';
          body.style.display = isExpanded ? 'none' : 'block';
        });
      }
    });
  }

  /**
   * 销毁页面
   */
  destroy() {
    // 清理事件监听器
  }
}

export default ReviewPage;
