# 题型实现方案

所有题型都用**自己写的前端组件**渲染，PDF 里的图只作为素材来源，
最终呈现的界面全部由 `types/` 下的组件生成。

## 目录约定

```
types/
  index.js        统一注册表：按题型名取到 {render, bind, check}
  schedule.js     时间排程（单资源拖任务 / 多资源选时段）
  calendar.js     日期推算（月历点选）
  sequence.js     序列填图（区域填色）
  chart.js        图表分析（饼图 / 柱状图 / 折线图）
  tagging.js      标签归类（把标签拖到目标格）
  connect.js      连线题（两侧连线）
  combination.js  组合变化（按钮组合）
```

## 数据来源

| 文件 | 内容 | 生成方式 |
|---|---|---|
| `pdfbank/pdfbank.processed.js` | 75 道题的题干与答案文字 | `build/extract.py` + `build/process.py` |
| `pdfbank/schedules.js` | 排程题配置 | 手工核对 + `build/gen_sched.py` 解码 |
| `pdfbank/calendars.js` | 日期题配置 | 手工 |
| `pdfbank/figdata.js` | 图形题的区域颜色矩阵 | `build/decode_figures.py` |
| `pdfbank/figfaces.js` | 16 面几何 | 从 `decode_figures.py` 导出 |

## 各题型实现状态

| 题型 | 组件 | 题数 | 已配置 | 说明 |
|---|---|---|---|---|
| 序列推理 / 矩阵 / 类比 / 找异类 / 归类 | 内置（矢量） | 10 | 10 | 手写题库 `bank.js` |
| 时间排程 | `schedule.js` | 12 | 7 | 单道拖拽 + 多道选时段 |
| 日期推算 | `calendar.js` | 11 | 1 | 月历点选 |
| 序列填图 | `sequence.js` | 15 | 9 | 16 面 SVG，可点击填色 |
| 图表分析 | `chart.js` | 22 | 0 | 饼图/柱图/折线图拖动 |
| 标签归类 | `tagging.js` | 12 | 0 | 拖标签到格子 |
| 连线 | `connect.js` | 2 | 0 | 左右两侧连线 |
| 组合变化 | `combination.js` | 1 | 0 | 按钮状态组合 |

## 统一接口

每个题型模块导出一个对象：

```js
{
  render(cfg, state) -> html 字符串
  bind(rootEl, cfg, state, onChange)   // 绑定交互
  check(cfg, state) -> {ok:boolean, detail}   // 判分
}
```

站点侧只关心这三件事，新增题型不需要改 `app.js` 的渲染逻辑。
