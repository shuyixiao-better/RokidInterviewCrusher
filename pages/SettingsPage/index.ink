<script type="application/json" def>
{
  "navigationBarTitleText": "设置",
  "description": "设置页面，配置目标岗位、技术栈、简历关键词和模型参数"
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

  loadSettings() {
    const profile = storageService.getUserProfile();
    const aiConfig = storageService.getAIConfig();

    this.setData({
      targetRole: profile.targetRole || DEFAULT_CONFIG.targetRole,
      techStackStr: (profile.techStack || []).join(', '),
      resumeKeywordsStr: (profile.resumeKeywords || []).join(', '),
      apiKey: aiConfig.apiKey || '',
      baseUrl: aiConfig.baseUrl || DEFAULT_CONFIG.baseUrl,
      model: aiConfig.model || DEFAULT_CONFIG.model,
    });
  },

  showRoleSelector() {
    this.setData({ showRolePicker: true });
  },

  hideRoleSelector() {
    this.setData({ showRolePicker: false });
  },

  selectRole(e) {
    this.setData({
      targetRole: e.currentTarget.dataset.role,
      showRolePicker: false,
    });
  },

  onTechStackInput(e) {
    this.setData({ techStackStr: e.currentTarget.value });
  },

  onKeywordsInput(e) {
    this.setData({ resumeKeywordsStr: e.currentTarget.value });
  },

  onApiKeyInput(e) {
    this.setData({ apiKey: e.currentTarget.value });
  },

  onBaseUrlInput(e) {
    this.setData({ baseUrl: e.currentTarget.value });
  },

  onModelInput(e) {
    this.setData({ model: e.currentTarget.value });
  },

  parseStringToArray(str) {
    if (!str) return [];
    return str
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
  },

  saveSettings() {
    storageService.saveUserProfile({
      targetRole: this.data.targetRole,
      techStack: this.parseStringToArray(this.data.techStackStr),
      resumeKeywords: this.parseStringToArray(this.data.resumeKeywordsStr),
    });

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

  clearAllData() {
    wx.showModal({
      title: '确认清除',
      content: '将清除面试记录和设置，此操作不可恢复',
      success: (res) => {
        if (!res.confirm) return;
        storageService.clearInterviewRecords();
        storageService.clearUserProfile();
        storageService.clearAIConfig();
        this.loadSettings();
        wx.showToast({
          title: '已清除',
          icon: 'success',
        });
      },
    });
  },
};
</script>

<page>
  <view class="container">
    <view class="section">
      <text class="section-title">目标岗位</text>
      <view class="role-selector" bindtap="showRoleSelector">
        <text class="value-text">{{targetRole || '请选择岗位'}}</text>
        <text class="value-text">></text>
      </view>
    </view>

    <view ink:if="{{showRolePicker}}" class="section">
      <text class="section-title">选择目标岗位</text>
      <view class="picker-item" ink:for="{{roleOptions}}" ink:key="index" bindtap="selectRole" data-role="{{item}}">
        <text class="value-text">{{item}}</text>
      </view>
      <button class="btn-secondary" bindtap="hideRoleSelector">关闭选择</button>
    </view>

    <view class="section">
      <text class="section-title">技术栈</text>
      <text class="section-note">英文逗号分隔，例如 Spring Boot, MySQL, Redis</text>
      <input class="text-input" value="{{techStackStr}}" placeholder="输入技术栈关键词" bindinput="onTechStackInput" />
    </view>

    <view class="section">
      <text class="section-title">简历关键词</text>
      <text class="section-note">英文逗号分隔，例如 订单系统, 微服务拆分</text>
      <textarea class="text-area" value="{{resumeKeywordsStr}}" placeholder="输入简历关键词" bindinput="onKeywordsInput" />
    </view>

    <view class="section">
      <text class="section-title">AI 模型配置</text>
      <text class="field-label">API Key</text>
      <input class="text-input" value="{{apiKey}}" password placeholder="输入 API Key" bindinput="onApiKeyInput" />
      <text class="field-label">Base URL</text>
      <input class="text-input" value="{{baseUrl}}" placeholder="https://api.openai.com/v1" bindinput="onBaseUrlInput" />
      <text class="field-label">模型名称</text>
      <input class="text-input" value="{{model}}" placeholder="gpt-3.5-turbo" bindinput="onModelInput" />
    </view>

    <view class="actions">
      <button class="btn-primary" bindtap="saveSettings">保存设置</button>
      <button class="btn-danger" bindtap="clearAllData">清除所有数据</button>
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
  gap: 12px;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: var(--card-padding, 16px);
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  border-width: var(--border-width-thin, 1px);
  border-style: solid;
  border-color: var(--border-color-default, rgba(64, 255, 94, 0.35));
  border-radius: var(--radius-md, 12px);
}

.section-title,
.field-label {
  font-size: 14px;
  font-weight: bold;
  color: var(--color-text-primary, #ffffff);
}

.section-note,
.value-text {
  font-size: 12px;
  color: var(--color-text-secondary, rgba(255, 255, 255, 0.72));
}

.role-selector,
.picker-item {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-color: var(--border-color-default, rgba(64, 255, 94, 0.35));
  border-radius: var(--radius-md, 12px);
}

.text-input,
.text-area {
  width: 100%;
  box-sizing: border-box;
  padding: var(--input-padding-y, 10px) var(--input-padding-x, 14px);
  border-width: var(--input-border-width, 1px);
  border-style: solid;
  border-color: var(--input-border-color, rgba(64, 255, 94, 0.35));
  border-radius: var(--input-radius, 8px);
  background-color: var(--input-background-color, rgba(255, 255, 255, 0.04));
  color: var(--color-text-primary, #ffffff);
  font-size: 13px;
}

.text-area {
  min-height: 84px;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn-primary,
.btn-secondary,
.btn-danger {
  text-align: center;
  padding: 10px 12px;
  font-size: 14px;
  border-width: var(--border-width-default, 2px);
  border-style: solid;
  border-radius: var(--radius-md, 12px);
}

.btn-primary {
  background-color: var(--color-primary, #40ff5e);
  color: #000000;
  border-color: var(--color-primary, #40ff5e);
}

.btn-secondary {
  background-color: var(--color-surface, rgba(255, 255, 255, 0.06));
  color: var(--color-text-primary, #ffffff);
  border-color: var(--border-color-default, rgba(64, 255, 94, 0.35));
}

.btn-danger {
  background-color: rgba(255, 90, 90, 0.14);
  color: #ffffff;
  border-color: var(--border-color-danger, #ff6b6b);
}
</style>
