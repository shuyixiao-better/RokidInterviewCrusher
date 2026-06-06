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
    selectedActionIndex: 0,
    selectedRoleIndex: 0,
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
    this.setData({
      showRolePicker: true,
      selectedRoleIndex: 0,
    });
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

  focusRoleSelector() {
    this.setData({ selectedActionIndex: 0 });
  },

  focusSaveAction() {
    this.setData({ selectedActionIndex: 1 });
  },

  focusClearAction() {
    this.setData({ selectedActionIndex: 2 });
  },

  focusCloseRolePicker() {
    this.setData({ selectedRoleIndex: this.data.roleOptions.length });
  },

  onKeyDown(event) {
    const code = event && event.code ? event.code : '';

    if (this.data.showRolePicker) {
      const maxRoleIndex = this.data.roleOptions.length;
      if (code === 'ArrowUp' || code === 'ArrowLeft') {
        this.setData({
          selectedRoleIndex: Math.max(0, this.data.selectedRoleIndex - 1),
        });
        return;
      }

      if (code === 'ArrowDown' || code === 'ArrowRight') {
        this.setData({
          selectedRoleIndex: Math.min(maxRoleIndex, this.data.selectedRoleIndex + 1),
        });
        return;
      }

      if (code === 'Enter') {
        if (this.data.selectedRoleIndex === this.data.roleOptions.length) {
          this.hideRoleSelector();
          return;
        }
        const role = this.data.roleOptions[this.data.selectedRoleIndex];
        this.setData({
          targetRole: role,
          showRolePicker: false,
        });
        return;
      }

      if (code === 'Backspace') {
        this.hideRoleSelector();
      }
      return;
    }

    if (code === 'ArrowUp' || code === 'ArrowLeft') {
      this.setData({
        selectedActionIndex: Math.max(0, this.data.selectedActionIndex - 1),
      });
      return;
    }

    if (code === 'ArrowDown' || code === 'ArrowRight') {
      this.setData({
        selectedActionIndex: Math.min(2, this.data.selectedActionIndex + 1),
      });
      return;
    }

    if (code === 'Enter') {
      if (this.data.selectedActionIndex === 0) {
        this.showRoleSelector();
        return;
      }
      if (this.data.selectedActionIndex === 1) {
        this.saveSettings();
        return;
      }
      this.clearAllData();
      return;
    }

    if (code === 'Backspace') {
      wx.navigateBack();
    }
  },
};
</script>

<page>
  <view class="container">
    <view class="section">
      <text class="section-title">目标岗位</text>
      <view class="role-selector {{selectedActionIndex === 0 ? 'btn-selected' : ''}}" bindtap="showRoleSelector" bindfocus="focusRoleSelector">
        <text class="value-text">{{targetRole || '请选择岗位'}}</text>
        <text class="value-text">></text>
      </view>
    </view>

    <view ink:if="{{showRolePicker}}" class="section">
      <text class="section-title">选择目标岗位</text>
      <view class="picker-item {{selectedRoleIndex === index ? 'btn-selected' : ''}}" ink:for="{{roleOptions}}" ink:key="index" bindtap="selectRole" data-role="{{item}}">
        <text class="value-text">{{item}}</text>
      </view>
      <button class="btn-secondary {{selectedRoleIndex === roleOptions.length ? 'btn-selected' : ''}}" bindtap="hideRoleSelector" bindfocus="focusCloseRolePicker">关闭选择</button>
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
      <button class="btn-primary {{selectedActionIndex === 1 ? 'btn-selected-primary' : ''}}" bindtap="saveSettings" bindfocus="focusSaveAction">保存设置</button>
      <button class="btn-danger {{selectedActionIndex === 2 ? 'btn-selected' : ''}}" bindtap="clearAllData" bindfocus="focusClearAction">清除所有数据</button>
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
  background-color: #060807;
  border-width: var(--border-width-thin, 1px);
  border-style: solid;
  border-color: #1d8f3e;
  border-radius: var(--radius-md, 12px);
}

.section-title,
.field-label {
  font-size: 14px;
  font-weight: bold;
  color: #f2f5f3;
}

.section-note,
.value-text {
  font-size: 12px;
  color: #8f9b93;
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
  border-color: #1d8f3e;
  border-radius: var(--radius-md, 12px);
}

.text-input,
.text-area {
  width: 100%;
  box-sizing: border-box;
  padding: var(--input-padding-y, 10px) var(--input-padding-x, 14px);
  border-width: var(--input-border-width, 1px);
  border-style: solid;
  border-color: #707770;
  border-radius: var(--input-radius, 8px);
  background-color: #0c100d;
  color: #f2f5f3;
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

.btn-danger {
  background-color: #1a0d0d;
  color: #f2f5f3;
  border-color: #707770;
}
</style>
