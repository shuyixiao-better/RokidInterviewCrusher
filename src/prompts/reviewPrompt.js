/**
 * 面试复盘分析 Prompt 模板
 * 用于生成完整的面试复盘报告
 */

/**
 * 生成复盘分析 Prompt
 * @param {string} transcript - 面试完整转写文本
 * @param {Object} userProfile - 用户画像
 * @param {string} userProfile.targetRole - 目标岗位
 * @param {string[]} userProfile.techStack - 技术栈
 * @returns {string} 完整的 Prompt 文本
 */
export function generateReviewPrompt(transcript, userProfile) {
  const { targetRole = 'Java 后端', techStack = [] } = userProfile;

  return `你是一个资深技术面试官和职业发展教练。请根据下面的面试转写内容，为候选人生成一次完整复盘。

要求：
1. 不要泛泛而谈。
2. 找出候选人回答中的具体问题。
3. 给出可执行的改进建议。
4. 对技术深度、表达清晰度、逻辑结构、岗位匹配度进行 1-10 分评分。
5. 输出结构化 JSON，方便前端展示。
6. 不要羞辱候选人，语气要专业、直接、鼓励。

候选人目标岗位：
${targetRole}

候选人技术栈：
${techStack.join('、')}

面试完整转写：
${transcript}

请输出 JSON：

{
  "summary": "本次面试整体评价",
  "scores": {
    "technicalDepth": 0,
    "communication": 0,
    "logic": 0,
    "jobMatch": 0
  },
  "questions": [
    {
      "question": "面试官问题",
      "answerSummary": "候选人回答摘要",
      "strengths": ["优点1", "优点2"],
      "weaknesses": ["不足1", "不足2"],
      "betterAnswerStructure": ["建议结构1", "建议结构2"]
    }
  ],
  "topProblems": [
    "最需要改进的问题1",
    "最需要改进的问题2"
  ],
  "nextPreparationPlan": [
    "下一步准备建议1",
    "下一步准备建议2"
  ]
}`;
}

/**
 * 生成快速评价 Prompt（用于实时反馈）
 * @param {string} question - 面试官问题
 * @param {string} answer - 候选人回答
 * @returns {string} Prompt 文本
 */
export function generateQuickFeedbackPrompt(question, answer) {
  return `请对候选人的回答进行简短评价。

面试官问题：${question}

候选人回答：${answer}

请返回 JSON 格式：
{
  "score": 0-10,
  "feedback": "一句话评价",
  "improvement": "改进建议"
}`;
}

/**
 * 生成总结报告 Prompt
 * @param {Array} interviews - 面试记录数组
 * @returns {string} Prompt 文本
 */
export function generateSummaryReportPrompt(interviews) {
  return `请根据以下多次面试记录，生成一份综合分析报告。

面试记录：
${JSON.stringify(interviews, null, 2)}

请返回 JSON 格式：
{
  "overallAssessment": "整体评价",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "progressTrend": "进步趋势描述",
  "focusAreas": ["重点关注领域1", "重点关注领域2"],
  "recommendations": ["建议1", "建议2"]
}`;
}

export default generateReviewPrompt;
