window.__BOOK_REGISTER_SECTION__("sec_149", {
  "title": "递归方法与递归方程 (The Recursive Method)",
  "intuition": "在计算当前输出样本时，不仅利用过去和现在的输入信号，还“偷看”并复用刚刚算出来的历史输出信号，从而仅用极少几个系数就能实现超长卷积才能达到的平滑或滤波效果。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从“数学教授的笔记”理解输入与输出记忆",
      "paragraphs": [
        "想象你雇了一位老数学教授帮你对信号 `x[ ]` 做滤波以提取有用信息 `y[ ]`。教授刚算完 `y[0]` 到 `y[27]`，正准备计算 `y[28]` 时却突然发疯被送进了医院。你翻开他的笔记，发现要接手计算当前样本 `y[n]`（这里 `n = 28`），手头其实有**两类信息**可用。",
        "第一类显而易见，就是**输入信号**的当前值与历史值：`x[n], x[n-1], x[n-2], ...`。如果教授仅仅把这些输入点分别乘以系数 `a0, a1, a2, ...` 再相加，那这其实就是普通的**简单卷积**（即有限脉冲响应滤波器 **FIR**），`a` 系数就是卷积核。",
        "但教授还掌握着第二类秘密武器——**已经计算出来的输出信号历史值**：`y[n-1], y[n-2], y[n-3], ...`。把这部分“历史输出记忆”乘以系数 `b1, b2, b3, ...` 后也加进求和公式里，就构成了数字信号处理中最核心的**递归方程（Recursion Equation）**，使用该方程的滤波器称为**递归滤波器（Recursive Filter）**。"
      ],
      "formula": {
        "expr": "y[n] = a0*x[n] + a1*x[n-1] + a2*x[n-2] + ... + b1*y[n-1] + b2*y[n-2] + ...",
        "explain": "y[n] 是正在计算的当前输出；x[n-k] 是当前和过去的输入样本，a_k 是前馈（输入）递归系数；y[n-k] 是过去已经算好的输出样本，b_k 是反馈（输出）递归系数。注意公式里没有 b0，因为 y[n] 正是待求的未知数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：递归方程的“长尾记忆”与失稳边界",
      "instruction": "拖动输入权重 a0 与输出反馈系数 b1、b2，观察单个脉冲或阶跃输入如何通过递归产生衰减正弦波，以及系数过大时如何发散失稳。",
      "controls": [
        {
          "type": "slider",
          "id": "a0",
          "label": "输入权重 a0",
          "min": 0.1,
          "max": 1,
          "step": 0.05,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "b1",
          "label": "一阶反馈 b1",
          "min": -1.5,
          "max": 1.5,
          "step": 0.05,
          "value": 1.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "b2",
          "label": "二阶反馈 b2",
          "min": -0.95,
          "max": 0.5,
          "step": 0.05,
          "value": -0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "isStep",
          "label": "切换输入：单位脉冲(关) / 阶跃信号(开)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\n\nfunction draw() {\n  const a0 = lab.values.a0;\n  const b1 = lab.values.b1;\n  const b2 = lab.values.b2;\n  const isStep = lab.values.isStep;\n\n  const N = 64;\n  const x = new Array(N).fill(0);\n  const y = new Array(N).fill(0);\n  for (let n = 0; n < N; n++) {\n    if (isStep) x[n] = n >= 5 ? 1 : 0;\n    else x[n] = n === 5 ? 1 : 0;\n  }\n\n  let maxAbs = 0;\n  for (let n = 0; n < N; n++) {\n    const y1 = n >= 1 ? y[n - 1] : 0;\n    const y2 = n >= 2 ? y[n - 2] : 0;\n    y[n] = a0 * x[n] + b1 * y1 + b2 * y2;\n    if (Math.abs(y[n]) > maxAbs) maxAbs = Math.abs(y[n]);\n  }\n\n  const unstable = !Number.isFinite(maxAbs) || maxAbs > 8 || (Math.abs(y[N - 1]) > 0.05 && Math.abs(y[N - 1]) > Math.abs(y[Math.floor(N / 2)]) * 1.15);\n\n  ctx.clearRect(0, 0, w, h);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  const padL = 44, padR = 20, padT = 22, padB = 26;\n  const plotW = w - padL - padR;\n  const plotH = h - padT - padB;\n  const midY = padT + plotH / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gy = padT + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(padL, gy);\n    ctx.lineTo(w - padR, gy);\n    ctx.stroke();\n  }\n  for (let n = 0; n < N; n += 8) {\n    const gx = padL + (n / (N - 1)) * plotW;\n    ctx.beginPath();\n    ctx.moveTo(gx, padT);\n    ctx.lineTo(gx, h - padB);\n    ctx.stroke();\n  }\n\n  const scaleMax = unstable ? Math.min(Math.max(maxAbs, 2), 10) : 2.0;\n  const toY = (val) => {\n    const clamped = Math.max(-scaleMax, Math.min(scaleMax, val));\n    return midY - (clamped / scaleMax) * (plotH / 2);\n  };\n\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '11px monospace';\n  ctx.fillText('+' + scaleMax.toFixed(1), 6, padT + 4);\n  ctx.fillText('0.0', 14, midY + 4);\n  ctx.fillText('-' + scaleMax.toFixed(1), 6, h - padB);\n  ctx.fillText('n (样本序号 0 ~ 63)', w / 2 - 55, h - 6);\n\n  for (let n = 0; n < N; n++) {\n    const gx = padL + (n / (N - 1)) * plotW;\n    if (x[n] !== 0) {\n      const yx = toY(x[n]);\n      ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath();\n      ctx.moveTo(gx, midY);\n      ctx.lineTo(gx, yx);\n      ctx.stroke();\n      ctx.fillStyle = '#38bdf8';\n      ctx.beginPath();\n      ctx.arc(gx, yx, 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  const outColor = unstable ? '#ec4899' : '#10b981';\n  ctx.strokeStyle = outColor;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const gx = padL + (n / (N - 1)) * plotW;\n    const gy = toY(y[n]);\n    if (n === 0) ctx.moveTo(gx, gy);\n    else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  for (let n = 0; n < N; n++) {\n    const gx = padL + (n / (N - 1)) * plotW;\n    const gy = toY(y[n]);\n    ctx.fillStyle = outColor;\n    ctx.beginPath();\n    ctx.arc(gx, gy, 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(padL + 8, 6, 10, 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(isStep ? '输入 x[n] (阶跃)' : '输入 x[n] (脉冲)', padL + 24, 15);\n\n  ctx.fillStyle = outColor;\n  ctx.fillRect(padL + 150, 6, 10, 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(unstable ? '输出 y[n] (已发散失稳!)' : '输出 y[n] (递归响应)', padL + 166, 15);\n\n  const status = unstable ? '⚠️ 警告：反馈系数过大，滤波器已失稳发散！' : '✅ 稳定：脉冲响应呈指数衰减';\n  lab.setReadout('y[n] = ' + a0.toFixed(2) + '*x[n] + (' + b1.toFixed(2) + ')*y[n-1] + (' + b2.toFixed(2) + ')*y[n-2]  |  末端 y[63]=' + (Number.isFinite(y[N - 1]) ? y[N - 1].toFixed(4) : 'Inf') + '  |  ' + status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "为什么叫 IIR（无限脉冲响应）与“12个系数”限制",
      "paragraphs": [
        "在实验一中关闭阶跃开关（即输入一个单位脉冲 `delta` 函数），你会发现尽管递归公式里只用了寥寥几个 `a` 和 `b` 系数，输出却像拨动琴弦一样产生一条**按指数规律衰减的正弦振荡长尾**。从数学上讲，这条衰减尾巴永远不会真正归零，因此递归滤波器也被称为**无限脉冲响应（Infinite Impulse Response, IIR）**滤波器。",
        "这正是递归滤波器最大的工程价值：**绕过漫长的卷积计算**。直接做卷积需要几百上千个点的乘加运算，而递归滤波器用 3～5 个系数就能等效出一条极长的滤波器核，执行速度飞快。",
        "但递归也有代价——**稳定性与灵活性较差**。由于输出信号会不断反馈回来自我放大，在工程实践中，一个递归滤波器**通常不能使用超过大约十几个（a dozen）递归系数**；一旦系数过多或数值不当，量化误差与反馈就会导致输出不断增大或持续剧烈振荡（即滤波器失稳）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "程序写法与绕开 Z 变换的三条设计捷径",
      "paragraphs": [
        "落到代码实现上（如原书表 19-1 的 BASIC 示例），递归滤波器只需要一个极其简单的顺序循环：`FOR I% = 2 TO 499`，在循环体中依次计算 `Y[I%] = A0*X[I%] + A1*X[I%-1] + A2*X[I%-2] + B1*Y[I%-1] + B2*Y[I%-2]`。注意循环必须**严格按时间顺序从小到大推进**，并且起始下标要跳过最前面的边界点（例如从 `2` 开始），以防访问 `X[-1]` 或 `Y[-1]` 越界。",
        "递归系数与滤波器频率响应之间的严格数学桥梁叫做 **z 变换（z-transform）**，它可以用来计算频率响应、合并级联或并联阶段、模仿模拟电路滤波器等，但推导过程非常繁琐硬核（第 33 章才会深入）。",
        "幸运的是，不理解 z 变换也完全能设计递归滤波器！全书给出了**三条实用捷径**：① 直接套用本章后面给出的简单递归滤波器**设计公式**；② 使用第 20 章提供的**“食谱式（cookbook）”现成程序**来生成性能优良的切比雪夫（Chebyshev）低通/高通滤波器；③ 采用第 26 章介绍的**迭代优化法**设计任意频率响应的递归滤波器。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验二：递归反馈的实时平滑波形与听感对比",
      "instruction": "调节反馈强度 b1 并切换“开启递归反馈”，实时观察刺耳高频毛刺如何被仅含 2 个系数的递归方程抹平，并点击播放按钮亲耳听对比。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "基波频率",
          "min": 80,
          "max": 400,
          "step": 10,
          "value": 160,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "b1",
          "label": "输出反馈系数 b1 (a0 = 1 - b1)",
          "min": 0,
          "max": 0.96,
          "step": 0.02,
          "value": 0.88,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "useRecursion",
          "label": "开启递归反馈 y[n-1] (关闭则直通原信号)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放当前滤波声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst w = lab.width;\nconst h = lab.height;\nlet activeSource = null;\n\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n}\n\nfunction updateAudio(freq, a0, b1Eff) {\n  stopAudio();\n  if (!lab.values.play) return;\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const fs = 8000;\n    const buf = ac.createBuffer(1, fs, fs);\n    const data = buf.getChannelData(0);\n    const f = Math.round(freq);\n    let yPrev = 0;\n    for (let i = 0; i < fs; i++) {\n      const t = i / fs;\n      const base = ((f * t) % 1) < 0.35 ? 0.65 : -0.65;\n      const buzz = 0.28 * Math.sin(2 * Math.PI * f * 9 * t);\n      const x = base + buzz;\n      const y = a0 * x + b1Eff * yPrev;\n      yPrev = y;\n      data[i] = Math.max(-0.9, Math.min(0.9, y * 0.45));\n    }\n    const src = ac.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    src.connect(ac.destination);\n    src.start();\n    activeSource = src;\n  } catch (e) {}\n}\n\nfunction draw() {\n  const freq = lab.values.freq;\n  const b1Raw = lab.values.b1;\n  const useRec = lab.values.useRecursion;\n  const b1Eff = useRec ? b1Raw : 0;\n  const a0 = useRec ? (1 - b1Raw) : 1.0;\n\n  const fs = 8000;\n  const N = 220;\n  const xArr = new Array(N);\n  const yArr = new Array(N);\n  let yPrev = 0;\n  for (let i = 0; i < N; i++) {\n    const t = i / fs;\n    const base = ((freq * t) % 1) < 0.35 ? 0.65 : -0.65;\n    const buzz = 0.28 * Math.sin(2 * Math.PI * freq * 9 * t);\n    const x = base + buzz;\n    const y = a0 * x + b1Eff * yPrev;\n    yPrev = y;\n    xArr[i] = x;\n    yArr[i] = y;\n  }\n\n  ctx.clearRect(0, 0, w, h);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, w, h);\n\n  const padL = 40, padR = 16, padT = 24, padB = 20;\n  const plotW = w - padL - padR;\n  const plotH = h - padT - padB;\n  const midY = padT + plotH / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gy = padT + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(padL, gy);\n    ctx.lineTo(w - padR, gy);\n    ctx.stroke();\n  }\n\n  const toY = (v) => midY - (Math.max(-1.2, Math.min(1.2, v)) / 1.2) * (plotH / 2);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.65)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const gx = padL + (i / (N - 1)) * plotW;\n    const gy = toY(xArr[i]);\n    if (i === 0) ctx.moveTo(gx, gy);\n    else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = useRec ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const gx = padL + (i / (N - 1)) * plotW;\n    const gy = toY(yArr[i]);\n    if (i === 0) ctx.moveTo(gx, gy);\n    else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(padL, 6, 10, 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('原始含高频毛刺信号 x[n]', padL + 16, 15);\n\n  ctx.fillStyle = useRec ? '#10b981' : '#f59e0b';\n  ctx.fillRect(padL + 190, 6, 10, 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(useRec ? '递归滤波后 y[n] (高频已被平滑)' : '未开递归 y[n] = x[n] (刺耳原声)', padL + 206, 15);\n\n  lab.setReadout('当前方程：y[n] = ' + a0.toFixed(2) + '*x[n] + ' + b1Eff.toFixed(2) + '*y[n-1]  |  基频 ' + freq + ' Hz (含 9 倍高频毛刺)  |  状态：' + (useRec ? '已启用输出反馈平滑' : '直通对比中'));\n\n  updateAudio(freq, a0, b1Eff);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "没有 b0 系数：递归方程把 y[n-1], y[n-2]... 乘以 b 系数反馈回来参与 y[n] 计算；不能有 b0，因为 y[n] 本身就是正在求解的值。",
        "顺序计算与数组越界：写代码时必须按 n 递增顺序计算（不能像 FIR 那样任意打乱顺序并行算），且循环起点要留足历史长度（如 2 阶反馈从 I%=2 开始），避免读取负下标并初始化历史输出为 0。",
        "系数不宜超过十几个：递归滤波器用极少系数就能换取极长的脉冲响应（IIR），但超过约 12 个递归系数极易因舍入误差和极点逼近不稳定区而发散振荡。"
      ]
    }
  ]
});
