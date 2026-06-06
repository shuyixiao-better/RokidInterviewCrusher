/**
 * 格式化工具函数
 * 用于文本、时间、数据等格式化处理
 */

/**
 * 格式化时间为可读字符串
 * @param {Date|number} timestamp - 时间戳或 Date 对象
 * @returns {string} 格式化后的时间字符串
 */
export function formatTime(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 格式化时长（毫秒转为 mm:ss 或 hh:mm:ss）
 * @param {number} durationMs - 时长（毫秒）
 * @returns {string} 格式化后的时长字符串
 */
export function formatDuration(durationMs) {
  const totalSeconds = Math.floor(durationMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 格式化分数（保留一位小数）
 * @param {number} score - 分数
 * @returns {string} 格式化后的分数
 */
export function formatScore(score) {
  return Number(score).toFixed(1);
}

/**
 * 截断文本（适合眼镜小屏幕显示）
 * @param {string} text - 原始文本
 * @param {number} maxLength - 最大长度，默认 50
 * @returns {string} 截断后的文本
 */
export function truncateText(text, maxLength = 50) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 格式化提示列表（适合眼镜显示）
 * @param {string[]} hints - 提示数组
 * @param {number} maxHints - 最大提示数，默认 6
 * @returns {string} 格式化后的提示文本
 */
export function formatHints(hints, maxHints = 6) {
  if (!hints || hints.length === 0) return '暂无提示';
  return hints.slice(0, maxHints).map((hint, index) => `${index + 1}. ${hint}`).join('\n');
}

/**
 * 格式化评分等级
 * @param {number} score - 分数（0-10）
 * @returns {string} 评分等级
 */
export function getScoreLevel(score) {
  if (score >= 9) return '优秀';
  if (score >= 7) return '良好';
  if (score >= 5) return '一般';
  if (score >= 3) return '较差';
  return '需改进';
}

/**
 * 格式化日期为简短形式（适合眼镜显示）
 * @param {Date|number} timestamp - 时间戳或 Date 对象
 * @returns {string} 简短日期字符串
 */
export function formatDateShort(timestamp) {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${month}-${day} ${hours}:${minutes}`;
}

/**
 * 生成唯一 ID
 * @returns {string} 唯一 ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

/**
 * 深拷贝对象
 * @param {any} obj - 要拷贝的对象
 * @returns {any} 拷贝后的对象
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 延迟执行
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
