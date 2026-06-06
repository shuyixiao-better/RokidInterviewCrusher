/**
 * 吊打面试官 - 主应用入口
 * 基于 Rokid 智能眼镜的 AI 面试训练与复盘辅助工具
 *
 * @version 1.0.0
 */

import storageService from './src/services/storageService.js';
import aiService from './src/services/aiService.js';
import interviewService from './src/services/interviewService.js';

export default {
  onLaunch() {
    console.log('[App] 吊打面试官启动');
    this.initServices();
    this.initUserProfile();
  },

  onDestroy() {
    console.log('[App] 应用销毁');
  },

  /**
   * 初始化服务
   */
  initServices() {
    // 服务已在模块导入时初始化
    console.log('[App] 服务初始化完成');
  },

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
  },

  globalData: {
    storageService,
    aiService,
    interviewService,
  },
};
