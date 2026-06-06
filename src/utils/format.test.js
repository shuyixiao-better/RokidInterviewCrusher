/**
 * format.js 单元测试
 */

import { describe, it } from 'node:test';
import assert from 'node:assert';
import {
  formatTime,
  formatDuration,
  formatScore,
  truncateText,
  formatHints,
  getScoreLevel,
  formatDateShort,
  generateId,
  deepClone,
  sleep,
} from './format.js';

describe('formatTime', () => {
  it('应该正确格式化时间戳', () => {
    const timestamp = new Date(2024, 0, 15, 14, 30, 45).getTime();
    const result = formatTime(timestamp);
    assert.strictEqual(result, '2024-01-15 14:30:45');
  });

  it('应该正确格式化 Date 对象', () => {
    const date = new Date(2024, 0, 15, 14, 30, 45);
    const result = formatTime(date);
    assert.strictEqual(result, '2024-01-15 14:30:45');
  });
});

describe('formatDuration', () => {
  it('应该正确格式化分钟和秒', () => {
    assert.strictEqual(formatDuration(180000), '03:00');
    assert.strictEqual(formatDuration(65000), '01:05');
    assert.strictEqual(formatDuration(5000), '00:05');
  });

  it('应该正确格式化小时', () => {
    assert.strictEqual(formatDuration(3600000), '01:00:00');
    assert.strictEqual(formatDuration(3661000), '01:01:01');
  });
});

describe('formatScore', () => {
  it('应该保留一位小数', () => {
    assert.strictEqual(formatScore(7.5), '7.5');
    assert.strictEqual(formatScore(8), '8.0');
    assert.strictEqual(formatScore(9.123), '9.1');
  });
});

describe('truncateText', () => {
  it('应该截断长文本', () => {
    const text = '这是一段很长的文本，需要被截断';
    const result = truncateText(text, 10);
    assert.strictEqual(result, '这是一段很长的文本，...');
  });

  it('应该返回短文本', () => {
    const text = '短文本';
    const result = truncateText(text, 10);
    assert.strictEqual(result, '短文本');
  });

  it('应该处理空文本', () => {
    assert.strictEqual(truncateText(''), '');
    assert.strictEqual(truncateText(null), '');
  });
});

describe('formatHints', () => {
  it('应该格式化提示列表', () => {
    const hints = ['提示1', '提示2', '提示3'];
    const result = formatHints(hints);
    assert.strictEqual(result, '1. 提示1\n2. 提示2\n3. 提示3');
  });

  it('应该限制提示数量', () => {
    const hints = ['提示1', '提示2', '提示3', '提示4', '提示5', '提示6', '提示7'];
    const result = formatHints(hints, 5);
    const lines = result.split('\n');
    assert.strictEqual(lines.length, 5);
  });

  it('应该处理空数组', () => {
    assert.strictEqual(formatHints([]), '暂无提示');
    assert.strictEqual(formatHints(null), '暂无提示');
  });
});

describe('getScoreLevel', () => {
  it('应该返回正确的评分等级', () => {
    assert.strictEqual(getScoreLevel(9.5), '优秀');
    assert.strictEqual(getScoreLevel(8), '良好');
    assert.strictEqual(getScoreLevel(6), '一般');
    assert.strictEqual(getScoreLevel(4), '较差');
    assert.strictEqual(getScoreLevel(2), '需改进');
  });
});

describe('formatDateShort', () => {
  it('应该返回简短日期', () => {
    const timestamp = new Date(2024, 0, 15, 14, 30).getTime();
    const result = formatDateShort(timestamp);
    assert.strictEqual(result, '01-15 14:30');
  });
});

describe('generateId', () => {
  it('应该生成唯一 ID', () => {
    const id1 = generateId();
    const id2 = generateId();
    assert.notStrictEqual(id1, id2);
    assert.ok(typeof id1 === 'string');
    assert.ok(id1.length > 0);
  });
});

describe('deepClone', () => {
  it('应该深拷贝对象', () => {
    const obj = { a: 1, b: { c: 2 } };
    const cloned = deepClone(obj);
    assert.deepStrictEqual(cloned, obj);
    assert.notStrictEqual(cloned, obj);
    assert.notStrictEqual(cloned.b, obj.b);
  });

  it('应该处理 null', () => {
    assert.strictEqual(deepClone(null), null);
  });

  it('应该处理基本类型', () => {
    assert.strictEqual(deepClone(123), 123);
    assert.strictEqual(deepClone('abc'), 'abc');
  });
});

describe('sleep', () => {
  it('应该延迟指定时间', async () => {
    const start = Date.now();
    await sleep(100);
    const end = Date.now();
    assert.ok(end - start >= 90); // 允许一些误差
  });
});
