/* 日期推算题配置
 * startWeekday: 该月 1 号是周几（0=周日）
 * days: 当月天数；answer: 正确日期集合
 */
window.CALENDARS = {
  PDF11: {
    startWeekday: 5,   // 3 号是周日 → 1 号是周五
    days: 30,
    answer: [3, 27],
    hint: '点选 Finance 与 Sales 两个部门审计的开始日期'
  }
,
  PDF12: {
    startWeekday: 5,
    days: 30,
    answer: [3, 27],
    hint: '点选 Customer Support 与 Training 开始审计的日期'
  }
,
  PDF18: {
    startWeekday: 0,
    days: 31,
    answer: [6, 7, 13, 14, 24],
    hint: '点选所有人都在办公室的所有日期'
  }
,
  PDF13: {
    startWeekday: 1, days: 30, answer: [8, 15],
    hint: '点选 Data Reporting 的开始日期和结束日期'
  },
  PDF16: {
    startWeekday: 5, days: 30, answer: [18],
    hint: '点选 Erica 认可期的最后一天'
  }
,
  PDF19: {
    startWeekday: 5, days: 30, answer: [18],
    hint: '点选 Ian 班次的最后一天'
  }
,
  PDF14: { startWeekday: 1, days: 30, answer: [22, 23],
    hint: '点选 Edward 访问的两个日期' },
  PDF17: { startWeekday: 0, days: 30, answer: [24, 27],
    hint: '点选 Research 会议的起止日期' },
  PDF21: { startWeekday: 3, days: 30, answer: [17, 20, 21],
    hint: '点选 Training 的三个处理日' },
  PDF22: { startWeekday: 6, days: 28, answer: [7, 12],
    hint: '点选 Nick 培训的首日和末日' },
  PDF23: { startWeekday: 5, days: 29, answer: [11, 12, 22],
    hint: '点选需要额外安排员工的工作日' }
,
  PDF15: { startWeekday: 6, days: 28, answer: [7, 12],
    hint: '点选 Pete 的首日和末日' },
  PDF20: { startWeekday: 3, days: 30, answer: [17, 20, 21],
    hint: '点选 Human Resources 的三个处理日' }
};
