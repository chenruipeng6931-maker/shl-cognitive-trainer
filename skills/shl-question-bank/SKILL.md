---
name: shl-question-bank
description: 把新的 PDF 题库（图形题、图表题、排程题、日期题、标签题、连线题、组合题）逐题整理成纯前端交互题，写入 SQLite 题库并接入刷题站点。当用户提供新 PDF、要求扩充题库、修复某题显示或判分问题时使用。
---

# SHL 题库扩充 Skill

## 这个项目在做什么

把 PDF 里的题目**只当作素材**：从 PDF 提取题干与答案，然后**用前端组件重新实现每一道题**，
不显示任何原图。题库存在 SQLite，构建后导出单个 JS 文件给前端。

## 目录结构

```
data/bank.db              SQLite 题库（唯一数据源）
build/
  build_db.py             合并配置 → 写库 → 导出 pdfbank/bank.js
  extract.py              PDF → 题目/答案图/文字
  process.py              清洗题干、打题型标签、质检
  decode_figures.py       方形图形题：16 面几何 + 颜色矩阵
  decode_lanes.py         多资源时间轴：逐格识别占用
  decode_axis.py          单条时间轴：颜色序列
  decode_pie.py           饼图答案：按色相统计占比
  gen_sched.py            答案轴 → 排程配置
pdfbank/
  bank.js                 由 build_db.py 生成，前端唯一题库文件
  <各类配置>.js            charts / taggings / calendars / schedules / connect / star …
types/
  chart.js  tagging.js  connect.js  star.js  combination.js
calendar.js  schedule.js  figure.js
app.js                     站点逻辑（渲染、判分、统计）
```

## 七种题型：数据格式与交互

所有题型统一接口 `render(cfg, state) / bind(el,cfg,state,onChange) / check(cfg,state)`，
答案存在数据库 `interaction` 字段，键名见下表。

### 1. 时间排程 `schedule`

**单资源拖任务**
```js
{ dayStart: 9, dayEnd: 18,
  busy:  [{ label:'Lunch', start: 12.5, len: 1 }],
  tasks: [{ id:'prep', name:'Prepare', len: 1 }],
  answer:{ prep: 10 } }              // 任务 id → 起始小时
```
交互：拖动任务块到时间轴，冲突标红，双击移除。
判分：每个任务起始时间误差 < 0.01h，全对才算对。

**多资源选时段**
```js
{ mode:'lanes', dayStart:9, dayEnd:18,
  lanes:[{name:'Room A', busy:[{start:10,len:1}], editable:false},
         {name:'Room D', busy:[], editable:true}],
  slotLen: 1.5,
  answer:{ lane:3, start:14 } }
```
交互：点击可编辑车道选择时段。判分：车道 + 起始时间一致。

### 2. 日期推算 `calendar`

```js
{ startWeekday: 5,   // 1 号是周几，0=周日
  days: 30,
  answer: [3, 27],   // 要选的日期
  hint: '点选两个开始日期' }
```
交互：月历点选。判分：日期集合完全相等。

> `startWeekday` 从原文推算：例如「3 号是周日」→ 1 号是周五 → 5。

### 3. 标签归类 `tagging`

```js
{ people:[{name:'Ben'},{name:'Erica'}],     // 槽位（展示在人名位置）
  badges:[1,2,3,4,5,6],                     // 徽章（数字或字符串 id）
  badgeLabels:{ ian:'Ian' },                // 可选：字符串徽章的显示文本
  clues:[{name:'Ben', text:'is next to Pete.'}],
  answer:{ Ben:1, Erica:4 } }               // 槽位 → 徽章
```
交互：拖徽章到槽位，或点徽章再点槽位；点已填槽可取出。
判分：每个分配都正确。

`clues` 是**必须**的——原题约束都在图里，必须转录成文字，否则用户看不到条件。

### 4. 图表分析 `chart`

**饼图（单系列）**
```js
{ type:'pie',
  items:[{name:'Grade 1', color:'#2196f3'}, ...],
  clues:[{name:'Grade 1', text:'26 contracts'}],
  answer:[20,30,40,10] }        // 百分比，总和 100
```

**饼图（多系列）**
```js
{ type:'pie', items:[...],
  series:[{label:'Year 1', answer:[16,84]},
          {label:'Year 2', answer:[18,82]}] }
```

**柱状图**
```js
{ type:'bar', items:[...], answer:[3,4,3,1] }
```
交互：饼图拖扇区边界；柱状图拖柱顶。
判分：饼图 ±2%，柱状图 ±2。

### 5. 序列填图 `sequence`

**方形 16 面**（`fig`）
```js
{ geo:'square16',
  seq:['wcwwwww', ...],   // 3 个序列图的颜色编码
  ans:'wcwwgww' }
```
编码顺序固定 16 面，见 `pdfbank/figfaces.js`。

**六芒星 7 面**（`star`）
```js
{ seq:['wcwwwwg','wwwwwgw','wcwwgww'],
  ans:'wcwwgww' }
```
编码顺序：**右下、中心、上、右上、下、左下、左上**，`w=空 g=绿 c=花纹`。
判分：逐区域完全一致。

### 6. 连线 `connect`

```js
{ nodes:[{id:'A7', x:0.5, y:0.8}, ...],    // 坐标归一化 0-1
  initial:[['A7','8K'],['8K','L4']],       // 题目预置的线（灰色，不参与判分）
  answer:['A7','8K','L4','5P'],            // 线性序列
  // 或 edges:[['R8M','3R7'], ...]         // 网络型（无顺序）
}
```
交互：按住节点拖到另一个节点，拖动时显示虚线。
判分：无向边集合相等，**预置线排除在外**。

### 7. 组合变化 `combination`

```js
{ buttons:[{id:'ccw90', label:'箭头逆时针转 90°'}, ...],
  answer:['ccw90','square','thin'] }        // 选中的按钮 id
```
交互：多选按钮。判分：集合相等（顺序无关）。

## 扩充题库的标准流程

### 第一步：提取

```bash
python3 build/extract.py "<PDF 路径>" <起始页> <结束页>
python3 build/process.py
```

`process.py` 会：
- 清掉题干噪声（「(Finance太常见)」这类提取残留）
- 给空的序列题题干填默认值
- 按题型打标签（`qtype`）
- 输出质检报告（题干过短、答案为空、关键词缺失）

**看质检报告**，逐条确认。

### 第二步：认题型

| 原文形态 | 题型 |
|---|---|
| 一天的时间轴 + 任务条 | schedule |
| 多房间/多机器占用轴 + 找空档 | schedule（lanes） |
| 问「哪几天」 | calendar |
| 「把徽章拖给每个人」排名 | tagging |
| 调整饼图 / 柱状图 | chart |
| 补下一个图形 | sequence |
| 节点连线 | connect |
| 按钮组合 | combination |

### 第三步：转录数据

**关键原则：题干和条件必须转成文字，不能依赖原图。**

- `qText`：题干（`process.py` 已清洗）
- `clues`：图里的数据（色块数值、人物约束），必须逐条转录
- `answer`：从答案图或答案文字推算

转录来源优先级：
1. 题干文字里已有的数据（先检查，很多题已经完整）
2. 答案文字里的计算过程
3. 答案图（用 `build/decode_*.py` 辅助，或人工读）
4. 自己按题目条件推算（可以，但要写清楚依据）

### 第四步：写入配置

配置集中在 `pdfbank/` 下，按题型分文件。**注意这些文件是 JS 对象语法，
不是严格 JSON**，用 node 读写而不是 python 的 json：

```bash
node -e "
global.window=global;
const p='<绝对路径>/pdfbank/charts.js';
require(p); const C=window.CHARTS;
C.PDF99={ type:'pie', items:[...], clues:[...], answer:[...] };
require('fs').writeFileSync(p,'window.CHARTS = '+JSON.stringify(C,null,1)+';\n');
"
```

### 第五步：构建 + 验证

```bash
python3 build/build_db.py      # 写库 + 导出 bank.js
```

验证清单：
```bash
# 1. 题型覆盖（每题都要有 interaction）
python3 -c "
import sqlite3
con=sqlite3.connect('data/bank.db')
print(con.execute(\"SELECT qtype,COUNT(*),SUM(CASE WHEN interaction<>'{}' THEN 1 ELSE 0 END) FROM questions GROUP BY qtype\").fetchall())
"

# 2. 题干完整
node -e "global.window=global;require('./pdfbank/bank.js');window.BANK.questions.forEach(q=>{if((q.qText||'').length<20)console.log('短题干',q.id)})"

# 3. 页面无原图
#    浏览器里执行 document.querySelectorAll('img').length 应为 0
```

### 第六步：人工验收

浏览器打开 `index.html?id=<题号>`，检查：
- 题干、条件是否完整可读
- 交互是否顺手
- 提交后判分是否正确、解析是否显示
- 页面上 `img` 数量为 0

## 已知坑

| 现象 | 原因 | 处理 |
|---|---|---|
| 页面白屏 | 初始化抛异常 | 临时加 `try/catch` 把错误写进 `document.title`，dump-dom 看 |
| 切换题型没反应 | 事件绑定在重渲染后失效 | 用**事件委托**绑在容器上 |
| 拖动很卡 | 每次 move 都整页重渲染 | 拖动时只更新 SVG 节点属性 |
| 判分总为 false | 字段名冲突（`picked` 被多处复用） | 每种题型用独立字段名 |
| 图片读不准 | 源图分辨率低（约 100px/图形） | 人工读，宁可不做也别写错 |

## 站点行为约定

- 提交按钮统一文案「提交答案」，点击后**自动判分**，不设自评
- 判分后显示：对/错 + 正确答案 + 解析 + 计入统计（已答/正确/正确率/连对）
- 容差：时间 0.01h、饼图 ±2%、柱状图 ±2，其余精确匹配
- 详见 `JUDGING.md`

## 文件命名

- 题号用 `PDF<原题号>`，如 `PDF37`
- 裁剪图 `q-<页号>.png` / `a-<页号>.png`（仅作数据源，不参与前端渲染）
