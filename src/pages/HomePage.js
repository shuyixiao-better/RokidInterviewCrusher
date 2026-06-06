/**
 * 首页
 * 展示应用入口，提供开始面试、查看历史、设置等功能
 *
 * 设计考虑：
 * 1. 适合眼镜小屏幕显示
 * 2. 操作简单直观
 * 3. 信息层次清晰
 */

import { APP_CONFIG, ROUTES } from '../utils/constants.js';
import storageService from '../services/storageService.js';
import { formatDateShort, formatDuration } from '../utils/format.js';

/**
 * 首页类
 */
class HomePage {
  constructor(router) {
    this.router = router;
    this.container = null;
  }

  /**
   * 渲染页面
   * @param {HTMLElement} container - 页面容器
   */
  render(container) {
    this.container = container;
    const latestRecord = storageService.getLatestInterviewRecord();

    container.innerHTML = `
      <div class="page home-page">
        <header class="header">
          <h1 class="title">${APP_CONFIG.name}</h1>
          <p class="subtitle">${APP_CONFIG.subtitle}</p>
        </header>

        <main class="content">
          <div class="menu-list">
            <button class="menu-item primary" id="btn-start-interview">
              <span class="icon">🎤</span>
              <span class="text">开始面试</span>
            </button>

            <button class="menu-item" id="btn-view-review">
              <span class="icon">📊</span>
              <span class="text">查看复盘</span>
              ${latestRecord ? `<span class="badge">最近</span>` : ''}
            </button>

            <button class="menu-item" id="btn-settings">
              <span class="icon">⚙️</span>
              <span class="text">设置</span>
            </button>
          </div>

          ${latestRecord ? this.renderLatestRecord(latestRecord) : ''}
        </main>

        <footer class="footer">
          <p class="version">v${APP_CONFIG.version}</p>
        </footer>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 渲染最近面试记录摘要
   * @param {Object} record - 面试记录
   * @returns {string} HTML 字符串
   */
  renderLatestRecord(record) {
    const date = formatDateShort(record.createdAt);
    const duration = formatDuration(record.duration);
    const questionCount = record.questions ? record.questions.length : 0;

    return `
      <div class="latest-record">
        <h3>最近面试</h3>
        <div class="record-info">
          <span class="date">${date}</span>
          <span class="duration">${duration}</span>
          <span class="questions">${questionCount} 个问题</span>
        </div>
        ${record.review ? `
          <div class="score-preview">
            综合评分: ${this.calculateAverageScore(record.review.scores)}/10
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 计算平均分
   * @param {Object} scores - 评分对象
   * @returns {string} 平均分
   */
  calculateAverageScore(scores) {
    if (!scores) return '0.0';
    const values = Object.values(scores);
    const avg = values.reduce((a, b) => a + b, 0) / values.length;
    return avg.toFixed(1);
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    const btnStart = this.container.querySelector('#btn-start-interview');
    const btnReview = this.container.querySelector('#btn-view-review');
    const btnSettings = this.container.querySelector('#btn-settings');

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        this.router.navigate(ROUTES.INTERVIEW);
      });
    }

    if (btnReview) {
      btnReview.addEventListener('click', () => {
        this.router.navigate(ROUTES.REVIEW);
      });
    }

    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        this.router.navigate(ROUTES.SETTINGS);
      });
    }
  }

  /**
   * 销毁页面
   */
  destroy() {
    // 清理事件监听器
  }
}

export default HomePage;
