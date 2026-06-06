/**
 * 本地存储服务
 * 负责面试记录、用户配置等数据的本地持久化
 *
 * 使用 Rokid AIUI 的 wx.setStorageSync/wx.getStorageSync API
 */

import wx from 'wx';
import { STORAGE_KEYS } from '../utils/constants.js';
import { generateId, deepClone } from '../utils/format.js';

/**
 * 存储服务类
 */
class StorageService {
  constructor() {
    // 内存缓存（用于快速访问）
    this.cache = new Map();
  }

  /**
   * 保存数据
   * @param {string} key - 存储键
   * @param {any} value - 要保存的值
   */
  set(key, value) {
    try {
      const serialized = JSON.stringify(value);
      wx.setStorageSync(key, serialized);
      this.cache.set(key, value);
    } catch (error) {
      console.error(`[StorageService] 保存数据失败: ${key}`, error);
    }
  }

  /**
   * 获取数据
   * @param {string} key - 存储键
   * @param {any} defaultValue - 默认值
   * @returns {any} 存储的值
   */
  get(key, defaultValue = null) {
    try {
      // 先检查缓存
      if (this.cache.has(key)) {
        return this.cache.get(key);
      }

      const serialized = wx.getStorageSync(key);
      if (serialized === null || serialized === undefined || serialized === '') {
        return defaultValue;
      }

      const value = JSON.parse(serialized);
      this.cache.set(key, value);
      return value;
    } catch (error) {
      console.error(`[StorageService] 读取数据失败: ${key}`, error);
      return defaultValue;
    }
  }

  /**
   * 删除数据
   * @param {string} key - 存储键
   */
  remove(key) {
    try {
      wx.removeStorageSync(key);
      this.cache.delete(key);
    } catch (error) {
      console.error(`[StorageService] 删除数据失败: ${key}`, error);
    }
  }

  /**
   * 清空所有数据
   */
  clear() {
    try {
      wx.clearStorageSync();
      this.cache.clear();
    } catch (error) {
      console.error('[StorageService] 清空数据失败', error);
    }
  }

  // ==================== 面试记录相关 ====================

  /**
   * 保存面试记录
   * @param {Object} record - 面试记录
   * @returns {Object} 保存后的记录（包含 ID）
   */
  saveInterviewRecord(record) {
    const records = this.getInterviewRecords();
    const newRecord = {
      ...record,
      id: record.id || generateId(),
      createdAt: record.createdAt || Date.now(),
    };

    records.unshift(newRecord); // 添加到开头

    // 只保留最近 50 条记录
    if (records.length > 50) {
      records.splice(50);
    }

    this.set(STORAGE_KEYS.INTERVIEW_RECORDS, records);
    return newRecord;
  }

  /**
   * 获取所有面试记录
   * @returns {Array} 面试记录数组
   */
  getInterviewRecords() {
    return this.get(STORAGE_KEYS.INTERVIEW_RECORDS, []);
  }

  /**
   * 获取最近一次面试记录
   * @returns {Object|null} 最近的面试记录
   */
  getLatestInterviewRecord() {
    const records = this.getInterviewRecords();
    return records.length > 0 ? records[0] : null;
  }

  /**
   * 根据 ID 获取面试记录
   * @param {string} id - 记录 ID
   * @returns {Object|null} 面试记录
   */
  getInterviewRecordById(id) {
    const records = this.getInterviewRecords();
    return records.find(record => record.id === id) || null;
  }

  /**
   * 删除面试记录
   * @param {string} id - 记录 ID
   * @returns {boolean} 是否删除成功
   */
  deleteInterviewRecord(id) {
    const records = this.getInterviewRecords();
    const index = records.findIndex(record => record.id === id);

    if (index === -1) return false;

    records.splice(index, 1);
    this.set(STORAGE_KEYS.INTERVIEW_RECORDS, records);
    return true;
  }

  /**
   * 清空所有面试记录
   */
  clearInterviewRecords() {
    this.set(STORAGE_KEYS.INTERVIEW_RECORDS, []);
  }

  // ==================== 用户配置相关 ====================

  /**
   * 保存用户配置
   * @param {Object} profile - 用户配置
   */
  saveUserProfile(profile) {
    this.set(STORAGE_KEYS.USER_PROFILE, profile);
  }

  /**
   * 获取用户配置
   * @returns {Object} 用户配置
   */
  getUserProfile() {
    return this.get(STORAGE_KEYS.USER_PROFILE, {
      targetRole: 'Java 后端',
      techStack: ['Spring Boot', 'Spring Cloud', 'MySQL', 'Redis'],
      resumeKeywords: [],
    });
  }

  /**
   * 清空用户配置
   */
  clearUserProfile() {
    this.remove(STORAGE_KEYS.USER_PROFILE);
  }

  // ==================== AI 配置相关 ====================

  /**
   * 保存 AI 配置
   * @param {Object} config - AI 配置
   */
  saveAIConfig(config) {
    this.set(STORAGE_KEYS.AI_CONFIG, config);
  }

  /**
   * 获取 AI 配置
   * @returns {Object} AI 配置
   */
  getAIConfig() {
    return this.get(STORAGE_KEYS.AI_CONFIG, {
      baseUrl: 'https://api.openai.com/v1',
      apiKey: '',
      model: 'gpt-3.5-turbo',
    });
  }

  /**
   * 清空 AI 配置
   */
  clearAIConfig() {
    this.remove(STORAGE_KEYS.AI_CONFIG);
  }
}

// 导出单例
const storageService = new StorageService();
export default storageService;
