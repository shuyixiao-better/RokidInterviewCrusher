/**
 * 实时面试关键词提示 Prompt 模板
 * 用于生成适合眼镜小屏幕展示的简短关键词提示
 */

/**
 * 生成实时提示 Prompt
 * @param {string} question - 面试官问题
 * @param {Object} userProfile - 用户画像
 * @param {string} userProfile.targetRole - 目标岗位
 * @param {string[]} userProfile.techStack - 技术栈
 * @param {string[]} userProfile.resumeKeywords - 简历关键词
 * @returns {string} 完整的 Prompt 文本
 */
export function generateRealtimeHintPrompt(question, userProfile) {
  const { targetRole = 'Java 后端', techStack = [], resumeKeywords = [] } = userProfile;

  return `你是一个资深技术面试辅导教练。你的任务不是替候选人作弊，也不是生成完整答案，而是根据面试官的问题，给候选人提供极短的答题关键词提示。

要求：
1. 只输出关键词和答题结构。
2. 不要超过 6 条。
3. 每条不超过 18 个中文字符。
4. 不要生成完整段落。
5. 不要替候选人编造不存在的项目经历。
6. 优先提示：答题框架、技术关键词、量化结果、风险点、追问方向。
7. 输出适合智能眼镜小屏幕展示。

用户画像：
岗位方向：${targetRole}
技术栈：${techStack.join('、')}
简历关键词：${resumeKeywords.join('、')}

面试官问题：
${question}

请输出 JSON 格式：

{
  "questionType": "项目经历/技术原理/系统设计/八股基础/行为面试/薪资沟通/其他",
  "hints": [
    "提示1",
    "提示2",
    "提示3"
  ],
  "warning": "需要注意的坑，如果没有则为空字符串"
}`;
}

/**
 * 生成判断问题类型的 Prompt
 * @param {string} text - 识别到的文本
 * @returns {string} Prompt 文本
 */
export function generateQuestionTypePrompt(text) {
  return `请判断以下文本是否是一个面试问题，如果是，请返回问题类型。

文本：${text}

问题类型包括：
- 项目经历：询问候选人过去做过的项目、经验
- 技术原理：询问某个技术的原理、机制
- 系统设计：询问如何设计某个系统、架构
- 八股基础：询问基础知识、概念、区别
- 行为面试：询问软技能、团队协作、职业规划
- 薪资沟通：询问期望薪资、福利待遇
- 其他：不属于以上类型

请返回 JSON 格式：
{
  "isQuestion": true/false,
  "questionType": "类型",
  "confidence": 0.0-1.0
}`;
}

/**
 * 默认提示模板（不包含用户画像）
 */
export const DEFAULT_HINT_PROMPT = `你是一个资深技术面试辅导教练。

要求：
1. 只输出关键词和答题结构。
2. 不要超过 6 条。
3. 每条不超过 18 个中文字符。
4. 输出适合智能眼镜小屏幕展示。

面试官问题：
{{question}}

请输出 JSON 格式：
{
  "questionType": "类型",
  "hints": ["提示1", "提示2", "提示3"],
  "warning": "注意事项"
}`;

export default generateRealtimeHintPrompt;
