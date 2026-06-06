/**
 * 设置页面
 * 用户配置目标岗位、技术栈、简历关键词、AI API 等
 *
 * 设计考虑：
 * 1. 配置项分类清晰
 * 2. 输入操作简单
 * 3. 保存即时生效
 */

import { TARGET_ROLES, DEFAULT_TECH_STACK, DEFAULT_AI_CONFIG, ROUTES } from '../utils/constants.js';
import storageService from '../services/storageService.js';
import aiService from '../services/aiService.js';

/**
 * 设置页面类
 */
class SettingsPage {
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
    const userProfile = storageService.getUserProfile();
    const aiConfig = storageService.getAIConfig();

    container.innerHTML = `
      <div class="page settings-page">
        <header class="header">
          <button class="back-btn" id="btn-back">← 返回</button>
          <h2 class="title">设置</h2>
        </header>

        <main class="content">
          <div class="settings-section">
            <h3>目标岗位</h3>
            <div class="role-selector">
              ${TARGET_ROLES.map(role => `
                <button class="role-btn ${userProfile.targetRole === role.name ? 'active' : ''}"
                        data-role="${role.name}">
                  ${role.name}
                </button>
              `).join('')}
            </div>
          </div>

          <div class="settings-section">
            <h3>技术栈</h3>
            <div class="tech-stack-container">
              <div class="selected-tech" id="selected-tech">
                ${userProfile.techStack.map(tech => `
                  <span class="tech-tag">
                    ${tech}
                    <button class="remove-tech" data-tech="${tech}">×</button>
                  </span>
                `).join('')}
              </div>
              <div class="add-tech">
                <input type="text" id="input-tech" placeholder="添加技术栈" />
                <button id="btn-add-tech">添加</button>
              </div>
              <div class="suggested-tech" id="suggested-tech">
                ${this.getSuggestedTech(userProfile.targetRole).map(tech => `
                  <button class="tech-suggestion" data-tech="${tech}">+ ${tech}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>简历关键词</h3>
            <div class="keywords-container">
              <div class="selected-keywords" id="selected-keywords">
                ${userProfile.resumeKeywords.map(keyword => `
                  <span class="keyword-tag">
                    ${keyword}
                    <button class="remove-keyword" data-keyword="${keyword}">×</button>
                  </span>
                `).join('')}
              </div>
              <div class="add-keyword">
                <input type="text" id="input-keyword" placeholder="添加关键词" />
                <button id="btn-add-keyword">添加</button>
              </div>
            </div>
          </div>

          <div class="settings-section">
            <h3>AI 配置</h3>
            <div class="ai-config">
              <div class="config-item">
                <label>API 地址</label>
                <input type="text" id="input-base-url" value="${aiConfig.baseUrl}" placeholder="https://api.openai.com/v1" />
              </div>
              <div class="config-item">
                <label>API Key</label>
                <input type="password" id="input-api-key" value="${aiConfig.apiKey}" placeholder="sk-..." />
              </div>
              <div class="config-item">
                <label>模型</label>
                <input type="text" id="input-model" value="${aiConfig.model}" placeholder="gpt-3.5-turbo" />
              </div>
              <button class="btn-test" id="btn-test-api">测试连接</button>
            </div>
          </div>

          <div class="settings-section">
            <h3>数据管理</h3>
            <div class="data-actions">
              <button class="btn-danger" id="btn-clear-data">清空所有数据</button>
            </div>
          </div>
        </main>
      </div>
    `;

    this.bindEvents();
  }

  /**
   * 获取建议的技术栈
   * @param {string} roleName - 岗位名称
   * @returns {string[]} 建议的技术栈
   */
  getSuggestedTech(roleName) {
    const role = TARGET_ROLES.find(r => r.name === roleName);
    if (role) {
      return DEFAULT_TECH_STACK[role.id] || [];
    }
    return [];
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 返回按钮
    const btnBack = this.container.querySelector('#btn-back');
    if (btnBack) {
      btnBack.addEventListener('click', () => {
        this.saveSettings();
        this.router.navigate(ROUTES.HOME);
      });
    }

    // 岗位选择
    const roleBtns = this.container.querySelectorAll('.role-btn');
    roleBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        roleBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateSuggestedTech(btn.dataset.role);
      });
    });

    // 添加技术栈
    const btnAddTech = this.container.querySelector('#btn-add-tech');
    const inputTech = this.container.querySelector('#input-tech');
    if (btnAddTech && inputTech) {
      btnAddTech.addEventListener('click', () => {
        this.addTech(inputTech.value.trim());
        inputTech.value = '';
      });
    }

    // 移除技术栈
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-tech')) {
        this.removeTech(e.target.dataset.tech);
      }
    });

    // 建议技术栈点击
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('tech-suggestion')) {
        this.addTech(e.target.dataset.tech);
      }
    });

    // 添加关键词
    const btnAddKeyword = this.container.querySelector('#btn-add-keyword');
    const inputKeyword = this.container.querySelector('#input-keyword');
    if (btnAddKeyword && inputKeyword) {
      btnAddKeyword.addEventListener('click', () => {
        this.addKeyword(inputKeyword.value.trim());
        inputKeyword.value = '';
      });
    }

    // 移除关键词
    this.container.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-keyword')) {
        this.removeKeyword(e.target.dataset.keyword);
      }
    });

    // 测试 API 连接
    const btnTestApi = this.container.querySelector('#btn-test-api');
    if (btnTestApi) {
      btnTestApi.addEventListener('click', () => {
        this.testApiConnection();
      });
    }

    // 清空数据
    const btnClearData = this.container.querySelector('#btn-clear-data');
    if (btnClearData) {
      btnClearData.addEventListener('click', () => {
        if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
          storageService.clear();
          alert('数据已清空');
          this.render(this.container);
        }
      });
    }
  }

  /**
   * 更新建议的技术栈
   * @param {string} roleName - 岗位名称
   */
  updateSuggestedTech(roleName) {
    const suggestedTech = this.container.querySelector('#suggested-tech');
    if (suggestedTech) {
      const techs = this.getSuggestedTech(roleName);
      suggestedTech.innerHTML = techs.map(tech => `
        <button class="tech-suggestion" data-tech="${tech}">+ ${tech}</button>
      `).join('');
    }
  }

  /**
   * 添加技术栈
   * @param {string} tech - 技术名称
   */
  addTech(tech) {
    if (!tech) return;

    const userProfile = storageService.getUserProfile();
    if (userProfile.techStack.includes(tech)) {
      alert('该技术栈已存在');
      return;
    }

    userProfile.techStack.push(tech);
    storageService.saveUserProfile(userProfile);
    this.render(this.container);
  }

  /**
   * 移除技术栈
   * @param {string} tech - 技术名称
   */
  removeTech(tech) {
    const userProfile = storageService.getUserProfile();
    userProfile.techStack = userProfile.techStack.filter(t => t !== tech);
    storageService.saveUserProfile(userProfile);
    this.render(this.container);
  }

  /**
   * 添加关键词
   * @param {string} keyword - 关键词
   */
  addKeyword(keyword) {
    if (!keyword) return;

    const userProfile = storageService.getUserProfile();
    if (userProfile.resumeKeywords.includes(keyword)) {
      alert('该关键词已存在');
      return;
    }

    userProfile.resumeKeywords.push(keyword);
    storageService.saveUserProfile(userProfile);
    this.render(this.container);
  }

  /**
   * 移除关键词
   * @param {string} keyword - 关键词
   */
  removeKeyword(keyword) {
    const userProfile = storageService.getUserProfile();
    userProfile.resumeKeywords = userProfile.resumeKeywords.filter(k => k !== keyword);
    storageService.saveUserProfile(userProfile);
    this.render(this.container);
  }

  /**
   * 保存设置
   */
  saveSettings() {
    const userProfile = storageService.getUserProfile();
    const aiConfig = storageService.getAIConfig();

    // 更新目标岗位
    const activeRole = this.container.querySelector('.role-btn.active');
    if (activeRole) {
      userProfile.targetRole = activeRole.dataset.role;
    }

    // 更新 AI 配置
    const inputBaseUrl = this.container.querySelector('#input-base-url');
    const inputApiKey = this.container.querySelector('#input-api-key');
    const inputModel = this.container.querySelector('#input-model');

    if (inputBaseUrl) aiConfig.baseUrl = inputBaseUrl.value;
    if (inputApiKey) aiConfig.apiKey = inputApiKey.value;
    if (inputModel) aiConfig.model = inputModel.value;

    storageService.saveUserProfile(userProfile);
    storageService.saveAIConfig(aiConfig);
    aiService.refreshConfig();
  }

  /**
   * 测试 API 连接
   */
  async testApiConnection() {
    const inputBaseUrl = this.container.querySelector('#input-base-url');
    const inputApiKey = this.container.querySelector('#input-api-key');

    if (!inputBaseUrl || !inputApiKey) return;

    const baseUrl = inputBaseUrl.value;
    const apiKey = inputApiKey.value;

    if (!apiKey) {
      alert('请输入 API Key');
      return;
    }

    try {
      const response = await fetch(`${baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        alert('API 连接成功！');
      } else {
        alert(`API 连接失败: ${response.status}`);
      }
    } catch (error) {
      alert(`API 连接失败: ${error.message}`);
    }
  }

  /**
   * 销毁页面
   */
  destroy() {
    this.saveSettings();
  }
}

export default SettingsPage;
