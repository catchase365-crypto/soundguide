window.__BOOK_REGISTER_SECTION__("sec_057", {
  "title": "脉冲分解 (Impulse Decomposition)",
  "intuition": "把一段复杂的 N 点信号拆成 N 个“单点独奏”的脉冲分量，只要摸清系统对单个脉冲的脾气，就能靠叠加算出任意输入下的输出。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把复杂波形切碎：什么是脉冲分解？",
      "paragraphs": [
        "直接分析一段起伏不定的复杂信号往往无从下手。**脉冲分解 (Impulse Decomposition)** 是数字信号处理中最核心的两种分解方法之一（另一种是傅里叶分解）。它的思路非常直白：把一个包含 `N` 个采样点的信号 `x[n]`，拆分成 `N` 个独立的分量信号，并且**每一个分量信号依然包含 `N` 个采样点**。",
        "在这 `N` 个分量信号中，第 `k` 个分量 `x_k[n]` 极其简单：它在第 `k` 个位置保留原信号的值 `x[k]`，而其余 `N - 1` 个位置**全部填零**。在一长串零中孤零零冒出来的这一个非零点，就被称为一个**脉冲 (Impulse)**。",
        "这种拆分的意义在于“化繁为简”：我们不再需要同时盯着成百上千个起伏的样点发愁，而是可以一次只审视信号中的一个采样点。"
      ],
      "formula": {
        "expr": "x[n] = Σ x_k[n]   (k = 0 到 N-1)，其中 x_k[k] = x[k]，其余 n ≠ k 时 x_k[n] = 0",
        "explain": "x[n] 是原始 N 点信号；x_k[n] 是第 k 个脉冲分量（仅在 n=k 处等于 x[k]，其余全为 0）；把这 N 个分量在每个时刻点对点相加，就能严丝合缝地还原出原信号 x[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：显微镜下的脉冲分解与原信号重构",
      "instruction": "拖动“分量索引 k”滑块观察第 k 个脉冲分量 x_k[n] 如何从原信号中剥离；开启“逐点叠加重构”可观看前 k 个脉冲如何拼回原波形，点击播放可对比单脉冲滴答声与合成音。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "分量索引 k",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "shape",
          "label": "原信号波形 (1复合波/2三角/3方波)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showSum",
          "label": "开启 0..k 叠加重构预览",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲/合成对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const N = 16;\nfunction getSignal(shape) {\n  const arr = [];\n  for (let n = 0; n < N; n++) {\n    if (shape === 1) {\n      arr.push(Math.sin((2 * Math.PI * n) / N) * 0.75 + Math.sin((4 * Math.PI * n) / N) * 0.28);\n    } else if (shape === 2) {\n      arr.push(0.9 - Math.abs((n - 7.5) / 5.0));\n    } else {\n      arr.push(n >= 3 && n <= 9 ? 0.8 : -0.45);\n    }\n  }\n  return arr;\n}\n\nfunction drawGrid(ctx, w, h, yBase, scale) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(40, yBase);\n  ctx.lineTo(w - 20, yBase);\n  ctx.moveTo(40, yBase - scale);\n  ctx.lineTo(w - 20, yBase - scale);\n  ctx.moveTo(40, yBase + scale);\n  ctx.lineTo(w - 20, yBase + scale);\n  for (let n = 0; n < N; n++) {\n    const x = 60 + n * 41;\n    ctx.moveTo(x, yBase - scale - 6);\n    ctx.lineTo(x, yBase + scale + 6);\n  }\n  ctx.stroke();\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const k = lab.values.k;\n  const shape = lab.values.shape;\n  const showSum = lab.values.showSum;\n  const sig = getSignal(shape);\n\n  ctx.clearRect(0, 0, w, h);\n\n  const yTop = 62;\n  const yBot = 178;\n  const scale = 40;\n\n  drawGrid(ctx, w, h, yTop, scale);\n  drawGrid(ctx, w, h, yBot, scale);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('原信号 x[n]', 44, 18);\n  ctx.fillText('当前分量 x_' + k + '[n] (仅 n=' + k + ' 非零)', 44, 132);\n\n  for (let n = 0; n < N; n++) {\n    const px = 60 + n * 41;\n    const py = yTop - sig[n] * scale;\n    const isReconstructed = showSum && n <= k;\n    const isCurrent = n === k;\n\n    ctx.strokeStyle = isCurrent ? '#f59e0b' : (isReconstructed ? '#10b981' : 'rgba(56,189,248,0.45)');\n    ctx.lineWidth = isCurrent ? 2.5 : 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, yTop);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = isCurrent ? '#f59e0b' : (isReconstructed ? '#10b981' : '#38bdf8');\n    ctx.beginPath();\n    ctx.arc(px, py, isCurrent ? 5 : 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  for (let n = 0; n < N; n++) {\n    const px = 60 + n * 41;\n    const val = n === k ? sig[k] : 0;\n    const py = yBot - val * scale;\n\n    if (n === k) {\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 3;\n      ctx.beginPath();\n      ctx.moveTo(px, yBot);\n      ctx.lineTo(px, py);\n      ctx.stroke();\n    }\n\n    ctx.fillStyle = n === k ? '#ec4899' : '#64748b';\n    ctx.beginPath();\n    ctx.arc(px, py, n === k ? 5.5 : 2.8, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(String(n), px - 3, yBot + scale + 16);\n  }\n\n  const modeText = showSum ? ('已叠加 0~' + k + ' 共 ' + (k + 1) + ' 个分量') : ('单独查看分量 x_' + k + '[n]');\n  lab.setReadout('N = 16 | 当前索引 k = ' + k + ' | 脉冲幅值 x[' + k + '] = ' + sig[k].toFixed(3) + ' | ' + modeText);\n}\n\nlab.onUpdate(draw);\n\nlet lastBeat = -1;\nlab.onLoop((dt, timeSec) => {\n  if (!lab.values.play) {\n    lastBeat = -1;\n    return;\n  }\n  const beat = Math.floor(timeSec * 2);\n  if (beat !== lastBeat) {\n    lastBeat = beat;\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const sig = getSignal(lab.values.shape);\n    const k = lab.values.k;\n    const now = ac.currentTime;\n    if (!lab.values.showSum) {\n      const amp = Math.max(0.06, Math.abs(sig[k]) * 0.45);\n      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * 0.035), ac.sampleRate);\n      const data = buf.getChannelData(0);\n      data[0] = amp;\n      for (let i = 1; i < data.length; i++) {\n        data[i] = amp * Math.exp(-i / 55) * Math.cos(i * 0.35);\n      }\n      const src = ac.createBufferSource();\n      src.buffer = buf;\n      src.connect(ac.destination);\n      src.start(now);\n    } else {\n      for (let idx = 0; idx <= k; idx++) {\n        const amp = Math.max(0.03, Math.abs(sig[idx]) * 0.2);\n        const osc = ac.createOscillator();\n        const gain = ac.createGain();\n        osc.type = 'sine';\n        osc.frequency.value = 320 + (sig[idx] + 1) * 210;\n        const t0 = now + idx * 0.024;\n        gain.gain.setValueAtTime(amp, t0);\n        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.022);\n        osc.connect(gain);\n        gain.connect(ac.destination);\n        osc.start(t0);\n        osc.stop(t0 + 0.023);\n      }\n    }\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "脉冲分解的真正威力：通向系统“卷积”的钥匙",
      "paragraphs": [
        "你可能会疑惑：把一个 16 点的信号拆成 16 个 16 点的信号，总数据量反而变成了 256 个点，这不是变麻烦了吗？请记住，分解的目的在于**用简单替换复杂**。",
        "对于**线性系统**而言，一旦把输入信号拆成一个个独立的脉冲，我们只需要知道系统对“单个脉冲”会作何反应（即系统的**脉冲响应**）。把输入信号里的每一个脉冲单独送进系统，都会各自激起一段对应的脉冲响应波形。",
        "最后，利用线性系统的**叠加性 (Superposition)**，把所有脉冲激起的响应全部加起来，得到的就正好是原信号直接通过系统的真实输出！这套“拆成脉冲 → 各自响应 → 全部叠加”的标准动作，就是信号处理中最鼎鼎大名的**卷积 (Convolution)**。"
      ],
      "formula": {
        "expr": "y[n] = Σ x[k] · h[n - k]",
        "explain": "第 k 个输入脉冲的幅值 x[k] 决定了系统脉冲响应 h 的缩放倍数，出现时刻 k 决定了它向右平移的位置；把所有平移缩放后的脉冲响应叠加起来，就得到最终输出 y[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：单个脉冲如何通过系统并“长”成输出波形？",
      "instruction": "拖动“激活脉冲位置 k”和“系统拖尾阻尼”，观察单个脉冲在输出端激起的局部响应；打开“叠加全部响应”开关，亲眼见证各个脉冲响应如何合成为完整的系统输出 y[n]。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "激活脉冲位置 k",
          "min": 0,
          "max": 11,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "decay",
          "label": "系统拖尾阻尼系数",
          "min": 0.1,
          "max": 0.85,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "accumulate",
          "label": "叠加所有脉冲响应得出 y[n]",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听脉冲响应与混响输出",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const xSig = [0.25, 0.95, 0.55, -0.35, -0.8, -0.25, 0.6, 1.0, 0.35, -0.45, -0.15, 0.2];\nconst N_TOTAL = 18;\n\nfunction getH(decay) {\n  const h = [];\n  for (let m = 0; m < 7; m++) {\n    h.push(0.75 * Math.pow(decay, m));\n  }\n  return h;\n}\n\nfunction drawGrid(ctx, w, yBase, scale) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(40, yBase);\n  ctx.lineTo(w - 20, yBase);\n  ctx.moveTo(40, yBase - scale);\n  ctx.lineTo(w - 20, yBase - scale);\n  ctx.moveTo(40, yBase + scale);\n  ctx.lineTo(w - 20, yBase + scale);\n  for (let n = 0; n < N_TOTAL; n++) {\n    const px = 55 + n * 36.5;\n    ctx.moveTo(px, yBase - scale - 4);\n    ctx.lineTo(px, yBase + scale + 4);\n  }\n  ctx.stroke();\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const k = lab.values.k;\n  const decay = lab.values.decay;\n  const acc = lab.values.accumulate;\n  const hArr = getH(decay);\n\n  ctx.clearRect(0, 0, w, h);\n\n  const yTop = 58;\n  const yBot = 175;\n  const scale = 38;\n\n  drawGrid(ctx, w, yTop, scale);\n  drawGrid(ctx, w, yBot, scale);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('输入信号 x[n] 与当前选中脉冲 x_' + k + '[n]', 44, 16);\n  ctx.fillText(acc ? '输出 y[n]：所有脉冲响应的叠加 (绿色) vs 当前单脉冲贡献 (粉色)' : '当前脉冲 x_' + k + '[n] 激起的系统响应：x[' + k + ']·h[n-' + k + ']', 44, 130);\n\n  for (let n = 0; n < xSig.length; n++) {\n    const px = 55 + n * 36.5;\n    const py = yTop - xSig[n] * scale;\n    const isK = n === k;\n    ctx.strokeStyle = isK ? '#f59e0b' : 'rgba(248,250,252,0.22)';\n    ctx.lineWidth = isK ? 3 : 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, yTop);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = isK ? '#f59e0b' : 'rgba(56,189,248,0.45)';\n    ctx.beginPath();\n    ctx.arc(px, py, isK ? 5.5 : 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  const yTotal = new Array(N_TOTAL).fill(0);\n  const ySingle = new Array(N_TOTAL).fill(0);\n  for (let i = 0; i < xSig.length; i++) {\n    for (let m = 0; m < hArr.length; m++) {\n      if (i + m < N_TOTAL) {\n        const contrib = xSig[i] * hArr[m];\n        yTotal[i + m] += contrib;\n        if (i === k) ySingle[i + m] = contrib;\n      }\n    }\n  }\n\n  for (let n = 0; n < N_TOTAL; n++) {\n    const px = 55 + n * 36.5;\n    const singleVal = ySingle[n];\n    const pySingle = yBot - singleVal * scale * 0.7;\n    const hasSingle = n >= k && n < k + hArr.length;\n\n    if (acc) {\n      const totVal = yTotal[n];\n      const pyTot = yBot - totVal * scale * 0.7;\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2.2;\n      ctx.beginPath();\n      ctx.moveTo(px, yBot);\n      ctx.lineTo(px, pyTot);\n      ctx.stroke();\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath();\n      ctx.arc(px, pyTot, 3.8, 0, Math.PI * 2);\n      ctx.fill();\n    }\n\n    if (hasSingle) {\n      ctx.strokeStyle = acc ? 'rgba(236,72,153,0.75)' : '#ec4899';\n      ctx.lineWidth = acc ? 1.5 : 2.8;\n      ctx.beginPath();\n      ctx.moveTo(px, yBot);\n      ctx.lineTo(px, pySingle);\n      ctx.stroke();\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath();\n      ctx.arc(px, pySingle, acc ? 3 : 4.5, 0, Math.PI * 2);\n      ctx.fill();\n    } else if (!acc) {\n      ctx.fillStyle = '#64748b';\n      ctx.beginPath();\n      ctx.arc(px, yBot, 2.2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(String(n), px - 3, yBot + scale + 16);\n  }\n\n  const peakOut = Math.max(...yTotal.map(Math.abs)).toFixed(2);\n  lab.setReadout('激活脉冲 x[' + k + '] = ' + xSig[k].toFixed(2) + ' | 系统阻尼 = ' + decay.toFixed(2) + ' | ' + (acc ? ('全响应叠加完成，输出峰值 = ' + peakOut) : '仅显示单脉冲激发的局部拖尾'));\n}\n\nlab.onUpdate(draw);\n\nlet lastTick = -1;\nlab.onLoop((dt, timeSec) => {\n  if (!lab.values.play) {\n    lastTick = -1;\n    return;\n  }\n  const tick = Math.floor(timeSec * 1.6);\n  if (tick !== lastTick) {\n    lastTick = tick;\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const now = ac.currentTime;\n    const decay = lab.values.decay;\n    const ringDur = 0.04 + decay * 0.28;\n    if (!lab.values.accumulate) {\n      const k = lab.values.k;\n      const osc = ac.createOscillator();\n      const gain = ac.createGain();\n      osc.type = 'triangle';\n      osc.frequency.value = 420 + xSig[k] * 160;\n      gain.gain.setValueAtTime(Math.max(0.05, Math.abs(xSig[k]) * 0.25), now);\n      gain.gain.exponentialRampToValueAtTime(0.001, now + ringDur);\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start(now);\n      osc.stop(now + ringDur + 0.01);\n    } else {\n      for (let i = 0; i < xSig.length; i++) {\n        const osc = ac.createOscillator();\n        const gain = ac.createGain();\n        const t0 = now + i * 0.04;\n        osc.type = 'triangle';\n        osc.frequency.value = 420 + xSig[i] * 160;\n        gain.gain.setValueAtTime(Math.max(0.03, Math.abs(xSig[i]) * 0.16), t0);\n        gain.gain.exponentialRampToValueAtTime(0.001, t0 + ringDur * 0.65);\n        osc.connect(gain);\n        gain.connect(ac.destination);\n        osc.start(t0);\n        osc.stop(t0 + ringDur * 0.65 + 0.01);\n      }\n    }\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1：脉冲分解不是为了“省内存”或数据压缩（N 点拆成 N×N 点反而变多了），它的唯一目的是把时域信号拆成最基本的时间单元，从而顺理成章地推导出“卷积”算法。",
        "避坑 2：不要把“所有点非零、单点是 1”的单位脉冲 δ[n] 和信号分解出的加权脉冲 x_k[n] 混淆——分解出来的第 k 个分量在位置 k 的高度等于原信号值 x[k]（可正可负），其余位置严格为 0。",
        "核心结论：脉冲分解代表“逐个采样点观察信号”；只要系统满足线性条件，掌握了单个脉冲穿过系统的样子，整个系统的输入输出关系就彻底被你掌握了。"
      ]
    }
  ]
});
