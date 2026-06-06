<script def>
{
  "navigationBarTitleText": "设置",
  "description": "设置页面，配置目标岗位、技术栈、API 等参数"
}
</script>

<script setup>
import wx from 'wx';
import storageService from '../../src/services/storageService.js';
import { TARGET_ROLES, DEFAULT_CONFIG } from '../../src/utils/constants.js';

export default {
  data: {
    targetRole: '',
    techStackStr: '',
    resumeKeywordsStr: '',
    apiKey: '',
    baseUrl: '',
    model: '',
    showRolePicker: false,
    roleOptions: TARGET_ROLES,
  },

  onLoad() {
    this.loadSettings();
  },

  /**
   * 加载设置
   */
  loadSettings() {
    const profile = storageService.getUserProfile();
    const aiConfig = storageService.getAIConfig();

    if (profile) {
      this.setData({
        targetRole: profile.targetRole || DEFAULT_CONFIG.targetRole,
        techStackStr: (profile.techStack || []).join(', '),
        resumeKeywordsStr: (profile.resumeKeywords || []).join(', '),
      });
    }

    if (aiConfig) {
      this.setData({
        apiKey: aiConfig.apiKey || '',
        baseUrl: aiConfig.baseUrl || DEFAULT_CONFIG.baseUrl,
        model: aiConfig.model || DEFAULT_CONFIG.model,
      });
    }
  },

  /**
   * 显示岗位选择器
   */
  showRoleSelector() {
    this.setData({ showRolePicker: true });
  },

  /**
   * 选择岗位
   */
  selectRole(e) {
    const role = e.currentTarget.dataset.role;
    this.setData({
      targetRole: role,
      showRolePicker: false,
    });
  },

  /**
   * 更新技术栈
   */
  onTechStackInput(e) {
    this.setData({ techStackStr: e.detail.value });
  },

  /**
   * 更新简历关键词
   */
  onKeywordsInput(e) {
    this.setData({ resumeKeywordsStr: e.detail.value });
  },

  /**
   * 更新 API Key
   */
  onApiKeyInput(e) {
    this.setData({ apiKey: e.detail.value });
  },

  /**
   * 更新 Base URL
   */
  onBaseUrlInput(e) {
    this.setData({ baseUrl: e.detail.value });
  },

  /**
   * 更新模型名称
   */
  onModelInput(e) {
    this.setData({ model: e.detail.value });
  },

  /**
   * 保存设置
   */
  saveSettings() {
    // 保存用户画像
    storageService.saveUserProfile({
      targetRole: this.data.targetRole,
      techStack: this.parseStringToArray(this.data.techStackStr),
      resumeKeywords: this.parseStringToArray(this.data.resumeKeywordsStr),
    });

    // 保存 AI 配置
    storageService.saveAIConfig({
      apiKey: this.data.apiKey,
      baseUrl: this.data.baseUrl || DEFAULT_CONFIG.baseUrl,
      model: this.data.model || DEFAULT_CONFIG.model,
    });

    wx.showToast({
      title: '保存成功',
      icon: 'success',
    });
  },

  /**
   * 解析逗号分隔的字符串为数组
   */
  parseStringToArray(str) {
    if (!str) return [];
    return str
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  },

  /**
   * 清除所有数据
   */
  clearAllData() {
    wx.showModal({
      title: '确认清除',
      content: '将清除所有面试记录和设置，此操作不可恢复',
      success: (res) => {
        if (res.confirm) {
          storageService.clearInterviewRecords();
          storageService.clearUserProfile();
          storageService.clearAIConfig();
          this.loadSettings();
          wx.showToast({
            title: '已清除',
            icon: 'success',
          });
        }
      },
    });
  },

  /**
   * 返回首页
   */
  goBack() {
    wx.navigateBack();
  },
};
</script>

<page>
  <view class="container">
    <!-- 岗位选择 -->
    <view class="section">
      <text class="section-title">目标岗位</text>
      <view class="role-selector" bindtap="showRoleSelector">
        <text class="role-text">{{targetRole || '请选择岗位'}}</text>
        <text class="arrow">></text>
      </view>
    </view>

    <!-- 岗位选择弹窗 -->
    <view ink:if="{{showRolePicker}}" class="picker-overlay">
      <view class="picker-dialog">
        <text class="picker-title">选择目标岗位</text>
        <view class="picker-list">
          <view
            ink:for="{{roleOptions}}"
            ink:key="index"
            class="picker-item {{targetRole === item ? 'selected' : ''}}"
            bindtap="selectRole"
            data-role="{{item}}"
          >
            <text>{{item}}</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 技术栈 -->
    <view class="section">
      <text class="section-title">技术栈</text>
      <text class="section-desc">用逗号分隔，如：Spring Boot, MySQL, Redis</text>
      <input
        class="input"
        value="{{techStackStr}}"
        placeholder="输入技术栈关键词"
        bindinput="onTechStackInput"
      />
    </view>

    <!-- 简历关键词 -->
    <view class="section">
      <text class="section-title">简历关键词</text>
      <text class="section-desc">项目经历关键词，用逗号分隔</text>
      <input
        class="input"
        value="{{resumeKeywordsStr}}"
        placeholder="输入简历关键词"
        bindinput="onKeywordsInput"
      />
    </view>

    <!-- API 配置 -->
    <view class="section">
      <text class="section-title">AI 模型配置</text>

      <view class="config-item">
        <text class="config-label">API Key</text>
        <input
          class="input"
          value="{{apiKey}}"
          placeholder="输入 API Key"
          password="{{true}}"
          bindinput="onApiKeyInput"
        />
      </view>

      <view class="config-item">
        <text class="config-label">Base URL</text>
        <input
          class="input"
          value="{{baseUrl}}"
          placeholder="https://api.openai.com/v1"
          bindinput="onBaseUrlInput"
        />
      </view>

      <view class="config-item">
        <text class="config-label">模型名称</text>
        <input
          class="input"
          value="{{model}}"
          placeholder="gpt-4o-mini"
          bindinput="onModelInput"
        />
      </view>
    </view>

    <!-- 操作按钮 -->
    <view class="actions">
      <view class="btn-primary" bindtap="saveSettings">
        <text class="btn-text">保存设置</text>
      </view>
    </view>

    <!-- 危险操作 -->
    <view class="danger-section">
      <view class="btn-danger" bindtap="clearAllData">
        <text class="btn-text">清除所有数据</text>
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

/* 区块 */
.section {
  margin-bottom: var(--spacing-lg);
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-sm);
}

.section-desc {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

/* 岗位选择器 */
.role-selector {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
}

.role-text {
  font-size: 14px;
  color: var(--color-text-primary);
}

.arrow {
  font-size: 14px;
  color: var(--color-text-secondary);
}

/* 输入框 */
.input {
  width: 100%;
  padding: var(--spacing-md);
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
  font-size: 14px;
  color: var(--color-text-primary);
}

/* 配置项 */
.config-item {
  margin-bottom: var(--spacing-md);
}

.config-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
}

/* 选择器弹窗 */
.picker-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.picker-dialog {
  background-color: var(--color-surface);
  border-radius: var(--radius-md);
  padding: var(--spacing-lg);
  margin: var(--spacing-lg);
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-default);
  max-height: 60vh;
  overflow-y: auto;
}

.picker-title {
  font-size: 18px;
  font-weight: bold;
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-md);
}

.picker-list {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-sm);
}

.picker-item {
  padding: var(--spacing-md);
  background-color: var(--color-surface-highlight);
  border-radius: var(--radius-sm);
  text-align: center;
}

.picker-item.selected {
  background-color: var(--color-primary);
}

.picker-item text {
  font-size: 14px;
  color: var(--color-text-primary);
}

.picker-item.selected text {
  color: var(--color-background);
}

/* 操作按钮 */
.actions {
  margin-top: var(--spacing-md);
}

.btn-primary {
  background-color: var(--color-primary);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
}

.btn-primary .btn-text {
  color: var(--color-background);
  font-size: 16px;
  font-weight: 500;
}

/* 危险操作 */
.danger-section {
  margin-top: var(--spacing-lg);
  padding-top: var(--spacing-lg);
  border-top-width: var(--border-width-thin);
  border-top-style: solid;
  border-top-color: var(--border-color-muted);
}

.btn-danger {
  background-color: var(--color-surface);
  padding: var(--spacing-md);
  border-radius: var(--radius-md);
  text-align: center;
  border-width: var(--border-width-default);
  border-style: solid;
  border-color: var(--border-color-danger);
}

.btn-danger .btn-text {
  color: var(--border-color-danger);
  font-size: 14px;
}
</style>
