window.__BOOK_REGISTER_SECTION__("sec_200", {
  "title": "DSP 与通用微处理器的本质差异 (How DSPs are Different from Other Microprocessors)",
  "intuition": "通用 CPU 天生擅长“数据搬运与逻辑比较”（如文档排序），而 DSP 则是专为“高速乘加运算”与“确定性实时吞吐”量身定制的数学计算引擎。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、分道扬镳的进化树：数据操作 vs. 数学计算",
      "paragraphs": [
        "20 世纪 60 年代，人们曾乐观地预测人工智能很快就会接管家务、驾驶汽车并通过语音控制一切。但现实证明，这些抽象任务远比想象中复杂，很难用数字计算机循规蹈矩的逻辑来实现。不过，过去几十年的发展证明了计算机在两大领域拥有惊人的实力：**（1）数据操作（Data Manipulation）**，如文字处理与数据库管理；**（2）数学计算（Mathematical Calculation）**，如科学研究、工程仿真与数字信号处理。",
        "理论上所有微处理器都能兼顾这两类任务，但工程上很难（或者说极度昂贵）做出一颗同时对两者都做到极致优化的芯片。这里面既有**硬件架构的权衡**（例如指令集大小、中断响应机制的设计），更有**市场与商业考量**（研发制造成本、市场竞争定位、产品生命周期）。因此，以奔腾（Pentium）为代表的传统通用处理器主要面向数据操作，而 **DSP（数字信号处理器）** 则把所有技能点都点在了数学计算上。",
        "具体来看，**数据操作**的核心是“存储与整理信息”。比如在文字处理软件中按字母表排序单词：每个单词首字母对应一个 8 位 ASCII 码，程序只需不断重复两步——先测试相邻两个条目的大小关系（`IF A > B THEN ...`），如果顺序不对就交换它们的位置（`A ↔ B`）。再比如点击“打印文档”，电脑不断检测键盘/鼠标的二进制指令，一旦检测到打印信号就把内存数据搬运到打印机。这类任务中，真正用于数学计算的时间微乎其微，**数据搬运**与**不等式测试**才是主角。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：微观指令大比拼——ASCII 排序 vs. FIR 滤波",
      "instruction": "切换“DSP 硬件乘加架构”开关并调整规模 N，观察通用 CPU 与 DSP 在处理“数据排序”和“FIR 滤波”两类任务时的指令周期巨大差异。",
      "controls": [
        {
          "type": "slider",
          "id": "n",
          "label": "任务规模 N (单词数 / 滤波器系数)",
          "min": 4,
          "max": 16,
          "step": 1,
          "value": 8,
          "unit": " 项"
        },
        {
          "type": "toggle",
          "id": "isDsp",
          "label": "切换为 DSP 硬件乘加架构",
          "value": false
        },
        {
          "type": "slider",
          "id": "speed",
          "label": "仿真演示速度",
          "min": 1,
          "max": 5,
          "step": 1,
          "value": 2,
          "unit": "x"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet arr = [];\nlet sortI = 0;\nlet sortJ = 0;\nlet sortSwaps = 0;\nlet sortComps = 0;\nlet sortTicks = 0;\n\nlet firK = 0;\nlet firSampleIdx = 0;\nlet firAcc = 0;\nlet firHistory = [];\nlet firTicks = 0;\nlet accumTimer = 0;\nlet lastN = -1;\n\nfunction resetSim() {\n  const n = lab.values.n;\n  arr = [];\n  for (let i = 0; i < n; i++) {\n    arr.push(65 + Math.floor(((i * 19 + 7) % 26)));\n  }\n  sortI = 0;\n  sortJ = 0;\n  sortSwaps = 0;\n  sortComps = 0;\n  sortTicks = 0;\n  firK = 0;\n  firSampleIdx = 0;\n  firAcc = 0;\n  firHistory = [];\n  firTicks = 0;\n  lastN = n;\n}\n\nfunction updateReadout() {\n  const n = lab.values.n;\n  const dsp = lab.values.isDsp;\n  const cpuMacCycles = 8;\n  const dspMacCycles = 1;\n  const firCyclesPerSample = dsp ? n * dspMacCycles : n * cpuMacCycles;\n  const sortStepCost = dsp ? 2 : 1;\n  lab.setReadout(\n    \"当前架构: \" + (dsp ? \"DSP (单周期乘加)\" : \"通用 CPU (擅长分支搬运)\") +\n    \" | FIR 单样本耗时: \" + firCyclesPerSample + \" 周期\" +\n    \" | 排序单步耗时: \" + sortStepCost + \" 周期\" +\n    \" | 已完成排序比较: \" + sortComps + \" 次 / 乘加: \" + (firSampleIdx * n + firK) + \" 次\"\n  );\n}\n\nlab.onUpdate(() => {\n  if (lab.values.n !== lastN) {\n    resetSim();\n  }\n  updateReadout();\n});\n\nresetSim();\nupdateReadout();\n\nlab.onLoop((dt) => {\n  const clampedDt = Math.min(dt, 0.1);\n  const stepInterval = 0.36 / lab.values.speed;\n  accumTimer += clampedDt;\n\n  const n = lab.values.n;\n  const dsp = lab.values.isDsp;\n\n  while (accumTimer >= stepInterval) {\n    accumTimer -= stepInterval;\n\n    // Step 1: Data Manipulation (Bubble sort step)\n    // General CPU does 1 step per tick; DSP has branch overhead so slower on pure branching\n    sortTicks++;\n    const sortDivider = dsp ? 2 : 1;\n    if (sortTicks % sortDivider === 0) {\n      if (sortI < n - 1) {\n        sortComps++;\n        if (arr[sortJ] > arr[sortJ + 1]) {\n          const tmp = arr[sortJ];\n          arr[sortJ] = arr[sortJ + 1];\n          arr[sortJ + 1] = tmp;\n          sortSwaps++;\n        }\n        sortJ++;\n        if (sortJ >= n - 1 - sortI) {\n          sortJ = 0;\n          sortI++;\n        }\n      } else {\n        // Restart sort smoothly\n        for (let i = 0; i < n; i++) {\n          arr[i] = 65 + Math.floor(((i * 17 + 13) % 26));\n        }\n        sortI = 0;\n        sortJ = 0;\n      }\n    }\n\n    // Step 2: Math Calculation (FIR MAC step)\n    // DSP executes 1 MAC per tick; General CPU takes ~4 ticks per MAC\n    firTicks++;\n    const firDivider = dsp ? 1 : 4;\n    if (firTicks % firDivider === 0) {\n      const xVal = Math.sin((firSampleIdx - firK) * 0.45) + 0.4 * Math.cos((firSampleIdx - firK) * 1.1);\n      const coef = 1 / n;\n      firAcc += xVal * coef;\n      firK++;\n      if (firK >= n) {\n        firHistory.push(firAcc);\n        if (firHistory.length > 28) firHistory.shift();\n        firK = 0;\n        firAcc = 0;\n        firSampleIdx++;\n      }\n    }\n    updateReadout();\n  }\n\n  // Draw background\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n\n  // Subtle grid\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  // Center divider\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(W / 2, 12); ctx.lineTo(W / 2, H - 12); ctx.stroke();\n\n  // LEFT PANEL: Data Manipulation (ASCII Sort)\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 13px sans-serif\";\n  ctx.fillText(\"阵营 1：数据操作 (ASCII 比较与搬运)\", 18, 26);\n  ctx.fillStyle = dsp ? \"#f59e0b\" : \"#10b981\";\n  ctx.font = \"11px sans-serif\";\n  ctx.fillText(dsp ? \"DSP 执行分支与跳转效率较低 (2 周期/步)\" : \"通用 CPU 擅长分支与数据交换 (1 周期/步)\", 18, 44);\n\n  const leftBoxX = 20;\n  const leftBoxW = W / 2 - 40;\n  const barW = Math.max(10, (leftBoxW - (n - 1) * 4) / n);\n  const baseY = 208;\n\n  for (let i = 0; i < n; i++) {\n    const val = arr[i] - 60;\n    const bh = (val / 32) * 120;\n    const bx = leftBoxX + i * (barW + 4);\n    const by = baseY - bh;\n\n    let color = \"#38bdf8\";\n    if (i >= n - sortI) color = \"#10b981\";\n    if (i === sortJ || i === sortJ + 1) {\n      color = arr[sortJ] > arr[sortJ + 1] ? \"#ec4899\" : \"#f59e0b\";\n    }\n    ctx.fillStyle = color;\n    ctx.fillRect(bx, by, barW, bh);\n\n    ctx.fillStyle = \"#f8fafc\";\n    ctx.font = \"10px monospace\";\n    if (barW >= 16) {\n      ctx.fillText(String.fromCharCode(arr[i]), bx + barW / 2 - 3, baseY + 14);\n    }\n  }\n\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.font = \"11px monospace\";\n  ctx.fillText(\"IF A > B: \" + sortComps + \"  |  SWAP A↔B: \" + sortSwaps, 20, 66);\n\n  // RIGHT PANEL: Math Calculation (FIR Filter MAC)\n  const rx = W / 2 + 18;\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 13px sans-serif\";\n  ctx.fillText(\"阵营 2：数学计算 (FIR 卷积乘加 MAC)\", rx, 26);\n  ctx.fillStyle = dsp ? \"#10b981\" : \"#ec4899\";\n  ctx.font = \"11px sans-serif\";\n  ctx.fillText(dsp ? \"DSP 单周期乘加 + 零开销循环 (极速!)\" : \"通用 CPU 逐条取指乘加与循环控制 (缓慢)\", rx, 44);\n\n  // MAC Progress Bar for current y[n]\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.font = \"11px monospace\";\n  ctx.fillText(\"当前输出样本 y[\" + firSampleIdx + \"] 累加进度: \" + firK + \"/\" + n + \" 抽头\", rx, 66);\n\n  const progW = W / 2 - 42;\n  ctx.fillStyle = \"rgba(255,255,255,0.1)\";\n  ctx.fillRect(rx, 76, progW, 14);\n  ctx.fillStyle = dsp ? \"#10b981\" : \"#f59e0b\";\n  ctx.fillRect(rx, 76, progW * (firK / n), 14);\n\n  // Output waveform plot\n  const plotY = 165;\n  ctx.strokeStyle = \"rgba(255,255,255,0.18)\";\n  ctx.beginPath(); ctx.moveTo(rx, plotY); ctx.lineTo(rx + progW, plotY); ctx.stroke();\n\n  if (firHistory.length > 1) {\n    ctx.strokeStyle = \"#38bdf8\";\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i < firHistory.length; i++) {\n      const px = rx + (i / 27) * progW;\n      const py = plotY - firHistory[i] * 42;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    const lastIdx = firHistory.length - 1;\n    const lx = rx + (lastIdx / 27) * progW;\n    const ly = plotY - firHistory[lastIdx] * 42;\n    ctx.fillStyle = \"#ec4899\";\n    ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.font = \"11px monospace\";\n  ctx.fillText(\"已完成输出点数: \" + firSampleIdx + \" (每点需 \" + n + \" 次乘加)\", rx, 224);\n});"
    },
    {
      "type": "concept",
      "heading": "二、FIR 滤波：为什么算术密度会压垮通用处理器？",
      "paragraphs": [
        "与数据操作截然不同，绝大多数 DSP 算法的执行速度几乎完全受限于它所需的**乘法（Multiplication）**和**加法（Addition）**次数。最典型的代表就是数字信号处理中最核心的 **FIR（有限脉冲响应）数字滤波器**。",
        "在标准表示法中，输入信号记为 `x[ ]`，输出信号记为 `y[ ]`。为了算出输出信号中第 `n` 个位置的值 `y[n]`，FIR 滤波器会把输入信号中最近的若干个采样点，分别乘以一组滤波系数（即脉冲响应/卷积核）`a0, a1, a2, a3...`，然后把所有乘积全部相加。",
        "根据应用场景的不同，一个卷积核可能只有寥寥几个系数，也可能需要成千上万个系数。虽然算法里也存在少量的数据搬运和大小判断（比如记录中间结果、控制循环次数），但**海量的乘加数学运算**在整体执行时间中占据了绝对统治地位。如果芯片没有专门的硬件乘法器与累加流水线，算力就会瞬间捉襟见肘。"
      ],
      "formula": {
        "expr": "y[n] = a0·x[n] + a1·x[n-1] + a2·x[n-2] + a3·x[n-3] + a4·x[n-4] + ...",
        "explain": "y[n] 是当前时刻的滤波输出；x[n], x[n-1]... 是当前及过去的输入信号采样值；a0, a1... 是固定的滤波器系数（卷积核）。每算出一个输出点，都需要把历史输入与系数逐项相乘再求和。"
      }
    },
    {
      "type": "concept",
      "heading": "三、速度之外的铁律：可预测的执行时间与持续吞吐",
      "paragraphs": [
        "除了极快的数学计算能力，DSP 还有一项往往被初学者忽视的硬指标：**可预测的执行时间（Predictable Execution Time）**。",
        "想象你在桌面电脑上把一份 Word 文档转成 PDF：这个过程究竟花了 10 毫秒还是 10 秒，通常无关紧要——你只需要等它弹完成提示，再给电脑下达下一个任务。然而，绝大多数 DSP 应用处理的是**连续不断的数据流**，没有明确的起点和终点。",
        "以助听器中的音频处理系统为例：如果声音信号以**每秒 20,000 个采样点（20 kHz）**的速率源源不断地涌入，DSP 就必须保证能以**每秒 20,000 个样本的持续吞吐率（Sustained Throughput）**稳定输出。更重要的是，工程上**绝不能把芯片速度做得比实际需要快太多**——因为主频和算力越高，芯片成本、电池功耗（对便携设备尤为致命）以及电路设计难度都会急剧攀升。因此，精确掌握每一段算法到底耗时多少微秒，是选型 DSP 和裁剪算法的生死线。"
      ],
      "formula": {
        "expr": "T_exec ≤ T_s = 1 / f_s",
        "explain": "硬实时约束不等式：单个样本的算法执行时间 T_exec 必须严格小于采样周期 T_s（即采样率 f_s 的倒数，如 20 kHz 对应 50 μs），且不能出现偶发超时抖动。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：实时音频吞吐挑战——当算力不足或时间抖动发生时（支持发声）",
      "instruction": "点击“播放实时音频流”，分别拖动“算法复杂度”与“算力预算”滑块，并尝试开启“时间抖动”，观察 50 μs 实时死线是否被突破，同时倾听声音是否出现断续卡顿！",
      "controls": [
        {
          "type": "slider",
          "id": "taps",
          "label": "算法复杂度 (FIR 抽头数)",
          "min": 10,
          "max": 120,
          "step": 5,
          "value": 40,
          "unit": " 抽头"
        },
        {
          "type": "slider",
          "id": "budget",
          "label": "处理器算力预算",
          "min": 20,
          "max": 120,
          "step": 5,
          "value": 65,
          "unit": " 算力单位"
        },
        {
          "type": "toggle",
          "id": "jitter",
          "label": "开启时间抖动 (模拟通用系统中断/缓存未命中)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放实时音频流",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst maxBars = 48;\nlet execHistory = [];\nlet missHistory = [];\nlet phase = 0;\nlet simTimer = 0;\nlet totalSamples = 0;\nlet totalMisses = 0;\nlet lastExecUs = 0;\n\nlet audioCtx = null;\nlet osc = null;\nlet gainNode = null;\n\nfor (let i = 0; i < maxBars; i++) {\n  execHistory.push(0.5);\n  missHistory.push(false);\n}\n\nfunction syncAudio() {\n  if (lab.values.play) {\n    if (!osc) {\n      try {\n        audioCtx = lab.getAudioContext();\n        if (audioCtx) {\n          if (audioCtx.state === \"suspended\") {\n            audioCtx.resume();\n          }\n          osc = audioCtx.createOscillator();\n          gainNode = audioCtx.createGain();\n          osc.type = \"triangle\";\n          osc.frequency.value = 293.66;\n          gainNode.gain.value = 0.12;\n          osc.connect(gainNode);\n          gainNode.connect(audioCtx.destination);\n          osc.start();\n        }\n      } catch (e) {}\n    }\n  } else {\n    if (osc) {\n      try {\n        osc.stop();\n        osc.disconnect();\n      } catch (e) {}\n      osc = null;\n      gainNode = null;\n    }\n  }\n}\n\nfunction updateStatus(ratio, missed) {\n  const us = (ratio * 50).toFixed(1);\n  const missRate = totalSamples > 0 ? ((totalMisses / totalSamples) * 100).toFixed(1) : \"0.0\";\n  const stateText = missed ? \"⚠ 实时超时丢帧!\" : \"✓ 稳定持续吞吐\";\n  lab.setReadout(\n    \"助听器基准: 20,000 样本/秒 (死线 50.0 μs) | 当前单帧耗时: \" + us + \" μs | 历史丢帧率: \" + missRate + \"% | 状态: \" + stateText\n  );\n}\n\nlab.onUpdate(() => {\n  totalSamples = 0;\n  totalMisses = 0;\n  syncAudio();\n  const baseRatio = lab.values.taps / lab.values.budget;\n  updateStatus(baseRatio, baseRatio > 1.0);\n});\n\nupdateStatus(lab.values.taps / lab.values.budget, false);\n\nlab.onLoop((dt, timeSec) => {\n  const clampedDt = Math.min(dt, 0.1);\n  simTimer += clampedDt;\n  phase += clampedDt * 8;\n\n  let currentMissed = missHistory[missHistory.length - 1];\n  let currentRatio = execHistory[execHistory.length - 1];\n\n  if (simTimer >= 0.05) {\n    simTimer = 0;\n    const baseRatio = lab.values.taps / lab.values.budget;\n    let ratio = baseRatio;\n    if (lab.values.jitter) {\n      const spike = Math.random() < 0.2 ? (1.4 + Math.random() * 0.9) : (0.75 + Math.random() * 0.55);\n      ratio = baseRatio * spike;\n    }\n    const missed = ratio > 1.0;\n    execHistory.push(Math.min(ratio, 1.85));\n    missHistory.push(missed);\n    if (execHistory.length > maxBars) execHistory.shift();\n    if (missHistory.length > maxBars) missHistory.shift();\n\n    totalSamples++;\n    if (missed) totalMisses++;\n    currentMissed = missed;\n    currentRatio = ratio;\n    lastExecUs = ratio * 50;\n    updateStatus(ratio, missed);\n  }\n\n  // Update Web Audio gain to demonstrate real-time dropouts\n  if (gainNode && audioCtx && lab.values.play) {\n    const targetGain = currentMissed ? 0.002 : 0.12;\n    gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.008);\n  }\n\n  // Render Canvas\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n\n  // Grid\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 30; gy < H; gy += 30) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  // Top Section: Execution Time vs 50us Deadline\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"实时执行时间监测 (每根柱代表一个采样周期的运算耗时)\", 18, 22);\n\n  const chartX = 18;\n  const chartW = W - 36;\n  const chartBottom = 124;\n  const deadlineY = 74; // height 50px represents 1.0 (50us)\n\n  const barStep = chartW / maxBars;\n  for (let i = 0; i < execHistory.length; i++) {\n    const r = execHistory[i];\n    const bh = r * 50;\n    const bx = chartX + i * barStep + 1;\n    const by = chartBottom - bh;\n    ctx.fillStyle = missHistory[i] ? \"#ec4899\" : (r > 0.85 ? \"#f59e0b\" : \"#10b981\");\n    ctx.fillRect(bx, by, Math.max(4, barStep - 3), bh);\n  }\n\n  // Deadline line\n  ctx.strokeStyle = \"#f8fafc\";\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([6, 4]);\n  ctx.beginPath(); ctx.moveTo(chartX, deadlineY); ctx.lineTo(chartX + chartW, deadlineY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.font = \"bold 11px monospace\";\n  ctx.fillText(\"死线 50 μs (20 kHz 采样间隔)\", chartX + chartW - 195, deadlineY - 6);\n\n  // Bottom Section: Output Audio Waveform\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"实时输出音频波形 (粉色平直段 = 超时丢帧产生的卡顿与爆音)\", 18, 152);\n\n  const waveMidY = 195;\n  ctx.strokeStyle = \"rgba(255,255,255,0.15)\";\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(chartX, waveMidY); ctx.lineTo(chartX + chartW, waveMidY); ctx.stroke();\n\n  ctx.lineWidth = 2.2;\n  for (let i = 0; i < maxBars; i++) {\n    const segX0 = chartX + i * barStep;\n    const segX1 = segX0 + barStep;\n    const missed = missHistory[i];\n    ctx.strokeStyle = missed ? \"#ec4899\" : \"#38bdf8\";\n    ctx.beginPath();\n    const subSteps = 6;\n    for (let s = 0; s <= subSteps; s++) {\n      const t = i + s / subSteps;\n      const px = segX0 + (s / subSteps) * barStep;\n      const amp = missed ? 2 : 26;\n      const py = waveMidY - Math.sin((t * 1.4) + phase) * amp;\n      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看菜下碟选芯片：如果你的任务充满 `if-else` 分支判断、字符串排序和大量内存读写，通用 CPU（甚至普通 MCU）性价比更高；只有当核心负载是卷积、FFT、矩阵乘加时，才需要请出 DSP。",
        "平均速度不等于实时能力：通用处理器靠缓存（Cache）和乱序执行刷高“平均分”，但缓存未命中或系统中断会导致单次耗时暴涨；DSP 工程必须死磕“最坏情况执行时间（WCET）”。",
        "算力过剩也是病：设计便携式或消费级 DSP 产品时，只要稳稳满足采样率的持续吞吐要求并留出合理余量即可，盲目追求更高主频只会换来炸裂的功耗、发热与 BOM 成本。"
      ]
    }
  ]
});
