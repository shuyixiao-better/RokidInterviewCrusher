/**
 * 主应用入口
 * 负责初始化应用、路由管理、页面切换
 *
 * 设计考虑：
 * 1. 简单的路由系统
 * 2. 页面生命周期管理
 * 3. 全局状态管理
 * 4. Rokid AIUI 环境适配
 */

import { ROUTES, APP_CONFIG } from './utils/constants.js';
import HomePage from './pages/HomePage.js';
import InterviewPage from './pages/InterviewPage.js';
import ReviewPage from './pages/ReviewPage.js';
import SettingsPage from './pages/SettingsPage.js';
import storageService from './services/storageService.js';

/**
 * 应用主类
 */
class App {
  constructor() {
    this.currentPage = null;
    this.pages = {};
    this.container = null;

    // 初始化路由
    this.router = {
      navigate: (route, params = {}) => this.navigate(route, params),
    };
  }

  /**
   * 初始化应用
   */
  init() {
    console.log(`[App] ${APP_CONFIG.name} v${APP_CONFIG.version} 初始化`);

    // 获取页面容器
    this.container = document.getElementById('app');
    if (!this.container) {
      console.error('[App] 未找到页面容器 #app');
      return;
    }

    // 初始化页面
    this.pages = {
      [ROUTES.HOME]: new HomePage(this.router),
      [ROUTES.INTERVIEW]: new InterviewPage(this.router),
      [ROUTES.REVIEW]: new ReviewPage(this.router),
      [ROUTES.SETTINGS]: new SettingsPage(this.router),
    };

    // 初始化用户配置
    this.initUserProfile();

    // 导航到首页
    this.navigate(ROUTES.HOME);

    console.log('[App] 应用初始化完成');
  }

  /**
   * 初始化用户配置
   */
  initUserProfile() {
    const profile = storageService.getUserProfile();
    if (!profile) {
      storageService.saveUserProfile({
        targetRole: 'Java 后端',
        techStack: ['Spring Boot', 'Spring Cloud', 'MySQL', 'Redis'],
        resumeKeywords: [],
      });
    }
  }

  /**
   * 导航到指定页面
   * @param {string} route - 路由名称
   * @param {Object} params - 页面参数
   */
  navigate(route, params = {}) {
    console.log(`[App] 导航到: ${route}`, params);

    // 销毁当前页面
    if (this.currentPage && this.currentPage.destroy) {
      this.currentPage.destroy();
    }

    // 获取目标页面
    const page = this.pages[route];
    if (!page) {
      console.error(`[App] 未找到页面: ${route}`);
      return;
    }

    // 渲染新页面
    this.currentPage = page;
    this.currentPage.render(this.container, params);

    // 更新页面标题
    document.title = `${APP_CONFIG.name} - ${this.getPageTitle(route)}`;
  }

  /**
   * 获取页面标题
   * @param {string} route - 路由名称
   * @returns {string} 页面标题
   */
  getPageTitle(route) {
    const titles = {
      [ROUTES.HOME]: '首页',
      [ROUTES.INTERVIEW]: '面试中',
      [ROUTES.REVIEW]: '复盘',
      [ROUTES.SETTINGS]: '设置',
    };
    return titles[route] || '';
  }
}

// 导出应用实例
const app = new App();

// 在浏览器环境中自动初始化
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    app.init();
  });
}

export default app;
