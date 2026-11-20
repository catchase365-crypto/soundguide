window.__BOOK_REGISTER_SECTION__("sec_204", {
  "title": "C 语言与汇编语言的博弈 (C versus Assembly)",
  "intuition": "在追求极致算力与低硬件成本的 DSP 世界里，汇编语言凭百行短代码的单周期并行优势撑起了三分之二的产品营收，而最聪明的工程实践往往是“用 C 写框架、用内联汇编压榨核心循环”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "反常识的 DSP 生态：为什么汇编能统治三分之二的市场营收？",
      "paragraphs": [
        "在传统 PC 或大型机软件开发中，**C 语言是绝对的首选**，汇编仅被限制在极少数要求极致速度的短小子程序中——原书 Fig. 28-9a 指出，传统程序员中大约每 10 个用 C 的才对应 1 个用汇编的（汇编占比仅约 `10%`）。",
        "但数字信号处理器（DSP）的任务特性截然不同：**第一，程序极短**，通常只有约 `100` 行，而非传统软件的 `10,000` 行，开发与维护压力可控；**第二，执行速度是命脉**，工程师选用 DSP 本就是为了它风驰电掣的运算速度。",
        "因此，DSP 程序员中近一半都在使用汇编（Fig. 28-9b）。更惊人的是商业营收数据（Fig. 28-9c）：**用 C 语言编程的 DSP 产品每赚 1 美元，用汇编编程的 DSP 产品就能赚 2 美元**。原因非常现实——性能更强就能击败竞争对手，而且手写汇编通常比 C 代码占用更小的内存，直接降低了量产芯片的硬件成本。不过随着 DSP 市场扩大，芯片厂商也在不断改进架构（例如提供更大的通用寄存器组与统一内存空间），让未来的 C 编译器越来越高效。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "同一件苦差事：点积（Dot Product）在 C 与 SHARC 汇编中的面貌",
      "paragraphs": [
        "为了看清 C 与汇编的真实差距，原书以 FIR 滤波器最核心的**点积运算**为例（计算两个 20 元素数组 `x[ ]` 与 `y[ ]` 的乘累加）。在 C 语言版本（Table 28-2）中，代码简洁直观：定义 `n`、`s`、`result` 以及数组，用 `for` 循环执行 `s += x[n]*y[n];`。高级语言的本质是**把“寄存器分配与内存管理”的工作外包给了编写编译器的工程师**——你省了力气，却也失去了对底层硬件调度细节的绝对掌控。",
        "值得特别留意的是，Table 28-2 中出现了 `float dm x[LEN];` 和 `float pm y[LEN];` 这两个硬件修饰符：`dm` 表示数据存储器（Data Memory），`pm` 表示程序存储器（Program Memory）。**哪怕只打算用 C 语言编程，你也必须了解 DSP 的双总线内存架构**，刻意把两个数组放到两条不同总线上，硬件才能在同一个时钟周期里同时读取它们。",
        "而在 ADI SHARC 的汇编版本（Table 28-3）中，没有任何抽象变量，一切都是赤裸裸的硬件寄存器（如指针寄存器 `i4`、`i12`，变址寄存器 `m6`、`m14`，数据寄存器 `f2`、`f4`、`f8`、`f12`）。代码利用 SHARC 的**零开销循环（zero-overhead looping）**特性（`lcntr = 20, do (pc,4) until lce;`），靠专用硬件寄存器自动计数与跳转，完全不浪费循环控制周期。但这个“未优化版”每轮循环仍要串行执行 4 条指令（取 `x` → 取 `y` → 相乘 → 累加），共耗时 `20 × 4 + 5 = 85` 个时钟周期。"
      ],
      "formula": {
        "expr": "result = Σ x[n] · y[n]   (n = 0 .. LEN - 1)",
        "explain": "点积运算公式：将两个长度为 LEN 的数组对应元素相乘并全部累加到 result 中；这是 FIR 滤波器计算每一个输出样点时的基础核心操作。"
      }
    },
    {
      "type": "concept",
      "heading": "单周期四路并行：SHARC 优化汇编如何把速度压榨到 3 倍？",
      "paragraphs": [
        "SHARC 拥有高度并行的硬件单元（两条独立取数总线、硬件乘法器、硬件加法器）。优化版汇编（Table 28-4）的秘诀是**把 4 个动作塞进同一行指令（Line 008），让它们在单个时钟周期内并发执行**：`f12 = f8 + f12, f8 = f2*f4, f2 = dm(i4,m6), f4 = pm(i12,m14);`。",
        "由于乘法需要等上一轮的数据取回来，累加又要等上一轮的乘法算出来，这种流水线必须先用 2 行代码“预热（prime）”寄存器（Line 004–005），中间主循环只需跑 `LEN - 2 = 18` 轮，最后再用 2 行代码“收尾”（Line 010–011）。算下来，主循环 `18` 周期加上预热与收尾的 `11` 周期开销，总耗时暴降至 `29` 个时钟周期，**比未优化版本快了将近 3 倍**！"
      ],
      "formula": {
        "expr": "T_unopt = 4·LEN + 5    vs    T_opt = (LEN - 2) + 11 = LEN + 9",
        "explain": "T_unopt 为未优化版总时钟周期数（每点需 4 周期 + 5 周期固定开销）；T_opt 为并行流水线优化版总周期数（中间每点仅 1 周期 + 11 周期预热/收尾开销）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：SHARC 点积时钟周期对比与单周期并行流水线透视",
      "instruction": "拖动「数组长度 LEN」观察流水线优化带来的加速比变化；拖动「单步检视轮次」查看 Line 008 在同一时钟周期内如何错位并行处理 3 个不同下标的数据。",
      "controls": [
        {
          "type": "slider",
          "id": "len",
          "label": "数组长度 LEN",
          "min": 4,
          "max": 32,
          "step": 1,
          "value": 20,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "inspect",
          "label": "单步检视主循环轮次",
          "min": 1,
          "max": 30,
          "step": 1,
          "value": 5,
          "unit": " 轮"
        },
        {
          "type": "toggle",
          "id": "showUnopt",
          "label": "高亮显示未优化版对比",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet pulse = 0;\n\nfunction draw(t) {\n  const v = lab.values;\n  const LEN = Math.round(v.len);\n  const unoptLoop = 4 * LEN;\n  const unoptOver = 5;\n  const unoptTotal = unoptLoop + unoptOver;\n  const optLoop = Math.max(1, LEN - 2);\n  const optOver = 11;\n  const optTotal = optLoop + optOver;\n  const k = Math.min(Math.round(v.inspect), optLoop);\n  const speedup = (unoptTotal / optTotal).toFixed(2);\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('时钟周期总开销对比 (数组长度 LEN = ' + LEN + ')', 16, 22);\n\n  const maxScale = 4 * 32 + 5;\n  const barX = 152;\n  const maxBarW = 370;\n\n  ctx.globalAlpha = v.showUnopt ? 1.0 : 0.25;\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('未优化汇编 (Table 28-3)', 16, 46);\n  const wUnoptLoop = (unoptLoop / maxScale) * maxBarW;\n  const wUnoptOver = (unoptOver / maxScale) * maxBarW;\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(barX, 33, wUnoptLoop, 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(barX + wUnoptLoop, 33, wUnoptOver, 18);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(unoptTotal + ' 周期 (' + unoptLoop + '循环+' + unoptOver + '开销)', barX + wUnoptLoop + wUnoptOver + 8, 46);\n  ctx.globalAlpha = 1.0;\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('并行优化汇编 (Table 28-4)', 16, 74);\n  const wOptLoop = (optLoop / maxScale) * maxBarW;\n  const wOptOver = (optOver / maxScale) * maxBarW;\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(barX, 61, wOptLoop, 18);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(barX + wOptLoop, 61, wOptOver, 18);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(optTotal + ' 周期 (' + optLoop + '循环+' + optOver + '开销) 提速 ' + speedup + 'x', barX + wOptLoop + wOptOver + 8, 74);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.beginPath(); ctx.moveTo(16, 92); ctx.lineTo(W - 16, 92); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('单周期 4 路并行流水线快照 — 第 ' + k + ' / ' + optLoop + ' 次执行 Line 008', 16, 112);\n\n  const ops = [\n    { title: '1. DM 总线取数', code: 'f2 = dm(i4, m6)', val: '载入 x[' + (k + 2) + ']', color: '#38bdf8' },\n    { title: '2. PM 总线取数', code: 'f4 = pm(i12, m14)', val: '载入 y[' + (k + 2) + ']', color: '#38bdf8' },\n    { title: '3. 硬件乘法器', code: 'f8 = f2 * f4', val: '乘 x[' + (k + 1) + ']*y[' + (k + 1) + ']', color: '#f59e0b' },\n    { title: '4. 硬件累加器', code: 'f12 = f8 + f12', val: '加 x[' + k + ']*y[' + k + ']', color: '#10b981' }\n  ];\n\n  const cardW = 162;\n  const gap = 12;\n  const startX = 16;\n  const glow = 0.55 + 0.45 * Math.sin(pulse * 4);\n\n  for (let i = 0; i < 4; i++) {\n    const cx = startX + i * (cardW + gap);\n    const cy = 124;\n    const ch = 100;\n    const op = ops[i];\n\n    ctx.fillStyle = 'rgba(15, 23, 42, 0.75)';\n    ctx.fillRect(cx, cy, cardW, ch);\n    ctx.strokeStyle = op.color;\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(cx, cy, cardW, ch);\n\n    ctx.fillStyle = op.color;\n    ctx.globalAlpha = 0.16 + glow * 0.08;\n    ctx.fillRect(cx, cy, cardW, 24);\n    ctx.globalAlpha = 1.0;\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(op.title, cx + 10, cy + 16);\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.fillText(op.code, cx + 10, cy + 48);\n\n    ctx.fillStyle = op.color;\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText(op.val, cx + 10, cy + 78);\n  }\n}\n\nfunction updateReadout() {\n  const v = lab.values;\n  const LEN = Math.round(v.len);\n  const unopt = 4 * LEN + 5;\n  const opt = Math.max(1, LEN - 2) + 11;\n  const k = Math.min(Math.round(v.inspect), Math.max(1, LEN - 2));\n  lab.setReadout('LEN=' + LEN + ' | 未优化: ' + unopt + ' 周期 | 优化版: ' + opt + ' 周期 (提速 ' + (unopt / opt).toFixed(2) + 'x) | 第 ' + k + ' 轮并行: 取[' + (k + 2) + '], 乘[' + (k + 1) + '], 加[' + k + ']');\n}\n\nlab.onUpdate(function() {\n  updateReadout();\n  draw(0);\n});\n\nlab.onLoop(function(dt) {\n  pulse += dt;\n  draw(pulse);\n});"
    },
    {
      "type": "concept",
      "heading": "编译器能追上汇编吗？六大选型维度与原厂的“潜台词”",
      "paragraphs": [
        "面对点积这种结构极度规整的小循环，现代 C 编译器**确实能直接生成接近 Table 28-4 的高效并行代码**。但一旦遇到复杂任务——比如多层嵌套循环、不规则的子程序跳转——编译器就很难做出全局最优调度，此时手写汇编在最坏情况下能比 C **快出 2 到 3 倍**。同时，**浮点 DSP 架构通常比定点 DSP 更容易被 C 编译器高效利用**；使用带性能剖析（Profiling）功能的调试器定位热点代码同样不可或缺。",
        "正因如此，工程上最受欢迎的策略是**“两全其美”：用 C 语言搭建整体软件框架，只针对最吃算力的关键核心段嵌入内联汇编（in-line assembly）**。原书 Fig. 28-10 将此比作一架天平：一边是 C 语言的**灵活性与快速开发**，另一边是汇编语言的**极致性能与低内存成本**。具体该向哪边倾斜，原书给出了 6 条实战自检清单：",
        "1. **程序复杂度**：庞大复杂的系统选 C；短小精悍、逻辑单纯选汇编。 2. **算力逼近程度**：如果必须榨干芯片最后一滴性能，选汇编；余量充足则选 C。 3. **团队人数**：多人协同开发的大型项目优先用 C，仅在时间关键段使用内联汇编。 4. **成本重心**：量产千万件、拼单机硬件成本选汇编；拼研发速度、省人力开发成本选 C。 5. **个人技术栈**：老练的汇编老手继续用汇编，习惯 C 的工程师沿用 C。 6. **芯片原厂建议（最关键！）**：如果原厂工程师对你说“C 和汇编都可以，但我们强烈建议用 C”，千万听劝——他们的潜台词往往是：**“我们这款芯片的汇编难写到爆炸，你得花 6 个月培训才能上手！”** 反之，像 ADI SHARC 这样主打易用代数语法的汇编，原厂工程师则会非常自豪地推荐你去写。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：C 与汇编工程选型天平模拟器",
      "instruction": "调节项目复杂度、极限速度需求、团队规模以及芯片架构开关，观察右侧推荐策略与天平倾斜方向如何实时变化。",
      "controls": [
        {
          "type": "slider",
          "id": "complexity",
          "label": "程序复杂度与分支规模",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 3,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "speedDemand",
          "label": "极限速度与低内存压榨",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 8,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "teamSize",
          "label": "协同开发团队人数",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": " 人"
        },
        {
          "type": "toggle",
          "id": "fixedPoint",
          "label": "目标为定点 DSP（C 编译器更难优化）",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet curAngle = 0;\nlet targetAngle = 0;\n\nfunction computeMetrics() {\n  const v = lab.values;\n  const comp = v.complexity;\n  const spd = v.speedDemand;\n  const team = v.teamSize;\n  const fx = v.fixedPoint;\n\n  const cScore = comp * 1.3 + team * 1.1 + (fx ? 0 : 2.5);\n  const asmScore = spd * 1.5 + (fx ? 2.5 : 0) + (10 - comp) * 0.4;\n  const diff = asmScore - cScore;\n  const penalty = Math.min(3.0, Math.max(1.05, 1.0 + (comp * 0.1 + (fx ? 0.55 : 0.15)) * (0.55 + spd * 0.05)));\n  return { cScore, asmScore, diff, penalty };\n}\n\nfunction draw() {\n  const v = lab.values;\n  const m = computeMetrics();\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n\n  const cx = 195;\n  const pivotY = 122;\n  const beamHalf = 115;\n\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx - 55, 210); ctx.lineTo(cx + 55, 210);\n  ctx.moveTo(cx, 210); ctx.lineTo(cx, pivotY);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, pivotY, 44, -Math.PI * 0.78, -Math.PI * 0.22);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(cx, pivotY);\n  ctx.lineTo(cx + Math.sin(curAngle * 1.6) * 40, pivotY - Math.cos(curAngle * 1.6) * 40);\n  ctx.stroke();\n\n  const dx = Math.cos(curAngle) * beamHalf;\n  const dy = Math.sin(curAngle) * beamHalf;\n  const lx = cx - dx, ly = pivotY - dy;\n  const rx = cx + dx, ry = pivotY + dy;\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cx, pivotY, 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(lx, ly); ctx.lineTo(lx - 28, ly + 42);\n  ctx.moveTo(lx, ly); ctx.lineTo(lx + 28, ly + 42);\n  ctx.stroke();\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';\n  ctx.fillRect(lx - 42, ly + 42, 84, 26);\n  ctx.strokeRect(lx - 42, ly + 42, 84, 26);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('C 语言', lx, ly + 59);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('灵活 / 快开发', lx, ly - 10);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(rx, ry); ctx.lineTo(rx - 28, ry + 42);\n  ctx.moveTo(rx, ry); ctx.lineTo(rx + 28, ry + 42);\n  ctx.stroke();\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';\n  ctx.fillRect(rx - 42, ry + 42, 84, 26);\n  ctx.strokeRect(rx - 42, ry + 42, 84, 26);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('汇编语言', rx, ry + 59);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('性能 / 低成本', rx, ry - 10);\n  ctx.textAlign = 'left';\n\n  const px = 390;\n  const pw = 314;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';\n  ctx.fillRect(px, 14, pw, 212);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, 14, pw, 212);\n\n  let verdict = '混合架构：C 主框架 + 内联汇编核心';\n  let vColor = '#f59e0b';\n  if (m.diff > 3.5) {\n    verdict = '推荐方案：手写汇编为主';\n    vColor = '#10b981';\n  } else if (m.diff < -3.5) {\n    verdict = '推荐方案：纯 C 语言开发';\n    vColor = '#38bdf8';\n  }\n\n  ctx.fillStyle = vColor;\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText(verdict, px + 14, 40);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('C 倾向分: ' + m.cScore.toFixed(1) + '   vs   汇编倾向分: ' + m.asmScore.toFixed(1), px + 14, 66);\n\n  ctx.fillText('最坏情况纯 C 相对汇编耗时倍率 (1x~3x)', px + 14, 96);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(px + 14, 104, 286, 14);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(px + 14, 104, ((m.penalty - 1) / 2) * 286, 14);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(m.penalty.toFixed(2) + 'x', px + 266, 115);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  const memPressure = Math.min(1, (v.speedDemand * 0.7 + (v.fixedPoint ? 2.5 : 0)) / 10);\n  ctx.fillText('产品硬件成本与内存节省敏感度', px + 14, 144);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(px + 14, 152, 286, 14);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(px + 14, 152, memPressure * 286, 14);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(px + 14, 180, 286, 34);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('原书统计 (Fig.28-9): 传统汇编占比 10%，', px + 22, 195);\n  ctx.fillText('DSP 程序员约 50% 用汇编，贡献了 67% 产品营收', px + 22, 209);\n}\n\nfunction updateState() {\n  const m = computeMetrics();\n  targetAngle = Math.max(-0.32, Math.min(0.32, m.diff * 0.032));\n  const v = lab.values;\n  let tag = 'C + 内联汇编混合';\n  if (m.diff > 3.5) tag = '手写汇编为主';\n  else if (m.diff < -3.5) tag = '纯 C 开发';\n  lab.setReadout('C倾向: ' + m.cScore.toFixed(1) + ' | 汇编倾向: ' + m.asmScore.toFixed(1) + ' | 架构: ' + (v.fixedPoint ? '定点DSP' : '浮点DSP') + ' | 纯C耗时惩罚: ~' + m.penalty.toFixed(2) + 'x | 结论: ' + tag);\n}\n\nlab.onUpdate(function() {\n  updateState();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  curAngle += (targetAngle - curAngle) * Math.min(1, dt * 8);\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "写 C 也要懂硬件：在 DSP 中写 C 代码，若不手动利用 `dm`、`pm` 等关键字把数组分离到不同总线存储器，编译器很难榨出单周期双取数的并行性能。",
        "简单循环信编译器，复杂瓶颈手写汇编：像点积这类直白循环，C 编译器已能自动生成近乎最优的流水线代码；只有在复杂嵌套分支或逼近芯片极限算力时，汇编才有 2～3 倍的压倒性优势。",
        "听懂原厂的“潜台词”：选型前先问芯片厂商推荐什么语言。若原厂极力劝你用 C，说明其汇编指令集极难驾驭；最稳妥的办法是像老手一样，去向真实用过该芯片的同行工程师打听口碑。"
      ]
    }
  ]
});
