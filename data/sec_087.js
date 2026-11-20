window.__BOOK_REGISTER_SECTION__("sec_087", {
  "title": "频域的自变量：横轴的四种表达方式 (The Frequency Domain's Independent Variable)",
  "intuition": "时域的 N 个采样点经实 DFT 后会变成 N/2 + 1 个频域点，而频域横轴的四种常见写法本质上是同一把尺子上的不同刻度：数组下标、采样率比例、弧度角频率和真实赫兹。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心长度法则：为什么 N 点时域会变成 N/2 + 1 个频域点？",
      "paragraphs": [
        "在数字信号处理中，实数离散傅里叶变换（Real DFT）会将一段长度为 **N** 的时域信号 `x[ ]`，拆解为频域的两个数组：实部 `ReX[ ]`（代表余弦波振幅）和虚部 `ImX[ ]`（代表正弦波振幅）。",
        "以原书图 8-4 为例，当点数 **N = 128** 时，时域信号存放在 `x[0]` 到 `x[127]` 共 128 个元素中；而频域信号则存放在 `ReX[0]` 到 `ReX[64]` 以及 `ImX[0]` 到 `ImX[64]` 中——每个频域数组都有 **65 个点**（下标从 `0` 到 `64`）。",
        "请务必牢记：**N 个时域点对应的是 N/2 + 1 个频域点，而不是 N/2 个**！因为频域同时包含了最左端的直流分量（下标 `0`）和最右端的奈奎斯特频率点（下标 `N/2`），两端都计入才会多出 1 个点。写代码时漏掉这个 `+1` 而导致数组越界或丢失最高频点，是初学者最常踩的 Bug 之一。"
      ],
      "formula": {
        "expr": "x[0 .. N-1] (共 N 点)  ==>  ReX[0 .. N/2], ImX[0 .. N/2] (各 N/2 + 1 点)",
        "explain": "N 为时域采样总点数；频域实部与虚部数组的长度各自严格等于 N/2 + 1，频率下标范围从 0 到 N/2（共包含两端点）。"
      }
    },
    {
      "type": "concept",
      "heading": "横轴的三种通用数学刻度：下标 k、比例 f 与弧度 ω",
      "paragraphs": [
        "在阅读 DSP 书籍、论文或源码时，频域图的横轴经常让人眼花缭乱。实际上，在脱离具体采样率时，行业内最常用以下 **三种方式** 来标注横轴：",
        "**1. 数组下标 `k`（范围 `0` 到 `N/2`）**：横轴直接用整数索引标记（如 `0` 到 `64`），记作 `ReX[k]` 和 `ImX[k]`，其中 `k` 以步长 1 递增。**程序员最喜欢这种方法**，因为它与代码里访问数组的索引完全一致。",
        "**2. 采样率比例 `f`（范围 `0` 到 `0.5`）**：横轴表示频率占采样率的分数，记作 `ReX[f]` 和 `ImX[f]`，`f` 在 `0` 到 `0.5` 之间取 `N/2 + 1` 个等距点。换算公式为 **`f = k / N`**。由于离散数据最高只能表达采样率一半（0.5 倍）的频率，这种表示法能时刻提醒我们离散系统的频率物理边界，也是本书绝大多数插图采用的标准。",
        "**3. 自然角频率 `ω`（范围 `0` 到 `π`）**：将 `f` 乘以 `2π` 即得到小写的希腊字母 `ω`（单位为**弧度**，因为一个圆周是 `2π` 弧度），记作 `ReX[ω]` 和 `ImX[ω]`。**数学家最喜欢这种方法**，因为它能消掉公式里的 `2π` 系数，把正余弦公式写得极其简短。"
      ],
      "formula": {
        "expr": "c[n] = cos(2πkn / N) = cos(2πfn) = cos(ωn)   (其中 f = k/N, ω = 2πf)",
        "explain": "同一列离散余弦波 c[n] 的三种等价写法：k 为整数下标（0 ~ N/2），f 为归一化频率（0 ~ 0.5），ω 为自然角频率（0 ~ π 弧度）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：频域横轴四维刻度换算器与时频联动",
      "instruction": "拖动 DFT 点数 N、频域下标 k 与采样率 fs 滑块，观察频域数组总点数 (N/2 + 1) 的变化，以及同一个频点如何在四把刻度尺上同步映射。",
      "controls": [
        {
          "type": "slider",
          "id": "N",
          "label": "DFT 点数 N",
          "min": 16,
          "max": 128,
          "step": 16,
          "value": 64,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "k",
          "label": "频域下标 k",
          "min": 0,
          "max": 64,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "系统采样率 fs",
          "min": 2,
          "max": 20,
          "step": 2,
          "value": 10,
          "unit": " kHz"
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const N = lab.values.N;\n  const halfN = N / 2;\n  const kRaw = lab.values.k;\n  const k = Math.min(kRaw, halfN);\n  const fs = lab.values.fs;\n  const f = k / N;\n  const omega = 2 * Math.PI * f;\n  const fHz = f * fs;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const x0 = 78;\n  const x1 = 696;\n  const plotW = x1 - x0;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const gx = x0 + (g / 4) * plotW;\n    ctx.beginPath();\n    ctx.moveTo(gx, 24);\n    ctx.lineTo(gx, 72);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(gx, 96);\n    ctx.lineTo(gx, 224);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域余弦波 c[n] (总长度 N = ' + N + ', 下标 0 ~ ' + (N - 1) + ')', x0, 16);\n\n  const tMidY = 48;\n  const tAmp = 18;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath();\n  ctx.moveTo(x0, tMidY);\n  ctx.lineTo(x1, tMidY);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px += 2) {\n    const nFloat = (px / plotW) * (N - 1);\n    const val = Math.cos((2 * Math.PI * k * nFloat) / N);\n    const py = tMidY - val * tAmp;\n    if (px === 0) ctx.moveTo(x0 + px, py);\n    else ctx.lineTo(x0 + px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  const dotR = N <= 32 ? 3 : (N <= 64 ? 2.2 : 1.6);\n  for (let n = 0; n < N; n++) {\n    const sx = x0 + (n / (N - 1)) * plotW;\n    const sy = tMidY - Math.cos((2 * Math.PI * k * n) / N) * tAmp;\n    ctx.beginPath();\n    ctx.arc(sx, sy, dotR, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('频域数组 ReX[ ] (长度 N/2 + 1 = ' + (halfN + 1) + ' 点, 下标 0 ~ ' + halfN + ')', x0, 90);\n\n  const specBaseY = 130;\n  const specPeakY = 98;\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x0, specBaseY);\n  ctx.lineTo(x1, specBaseY);\n  ctx.stroke();\n\n  for (let i = 0; i <= halfN; i++) {\n    const sx = x0 + (i / halfN) * plotW;\n    const isSel = i === k;\n    ctx.strokeStyle = isSel ? '#f59e0b' : 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = isSel ? 2.5 : 1;\n    ctx.beginPath();\n    ctx.moveTo(sx, specBaseY);\n    ctx.lineTo(sx, isSel ? specPeakY : specBaseY - 5);\n    ctx.stroke();\n\n    if (isSel) {\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath();\n      ctx.arc(sx, specPeakY, 4, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  const selX = x0 + (k / halfN) * plotW;\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(selX, specBaseY);\n  ctx.lineTo(selX, 226);\n  ctx.stroke();\n  ctx.restore();\n\n  function drawRuler(y, title, color, labels, activeText) {\n    ctx.fillStyle = color;\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'right';\n    ctx.fillText(title, x0 - 10, y + 4);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x0, y);\n    ctx.lineTo(x1, y);\n    ctx.stroke();\n\n    ctx.font = '10px monospace';\n    ctx.fillStyle = '#cbd5e1';\n    for (let t = 0; t <= 4; t++) {\n      const tx = x0 + (t / 4) * plotW;\n      ctx.beginPath();\n      ctx.moveTo(tx, y - 3);\n      ctx.lineTo(tx, y + 3);\n      ctx.stroke();\n      ctx.textAlign = t === 0 ? 'left' : (t === 4 ? 'right' : 'center');\n      ctx.fillText(labels[t], tx, y + 13);\n    }\n\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(selX, y, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.font = 'bold 10px monospace';\n    const alignRight = selX > x1 - 75;\n    ctx.textAlign = alignRight ? 'right' : 'left';\n    const txOff = alignRight ? -7 : 7;\n    ctx.fillText(activeText, selX + txOff, y - 4);\n  }\n\n  drawRuler(146, '1. 下标 k', '#38bdf8', ['0', String(halfN * 0.25), String(halfN * 0.5), String(halfN * 0.75), String(halfN)], 'k=' + k);\n  drawRuler(170, '2. 比例 f', '#10b981', ['0', '0.125', '0.25', '0.375', '0.5'], 'f=' + f.toFixed(3));\n  drawRuler(194, '3. 弧度 ω', '#ec4899', ['0', '0.25π', '0.5π', '0.75π', 'π'], 'ω=' + (f * 2).toFixed(2) + 'π');\n  drawRuler(218, '4. 物理 Hz', '#f8fafc', ['0', (fs * 0.125).toFixed(2) + 'k', (fs * 0.25).toFixed(2) + 'k', (fs * 0.375).toFixed(2) + 'k', (fs * 0.5).toFixed(1) + 'k'], fHz.toFixed(2) + ' kHz');\n\n  const clampNote = kRaw > halfN ? ' (已钳位至 N/2)' : '';\n  lab.setReadout('N=' + N + ' (频域共 ' + (halfN + 1) + ' 点) | k=' + k + clampNote + ' | f=' + f.toFixed(4) + ' | ω=' + omega.toFixed(3) + ' rad (' + (f * 2).toFixed(2) + 'π) | 物理=' + fHz.toFixed(2) + ' kHz');\n});"
    },
    {
      "type": "concept",
      "heading": "第四种刻度：真实物理频率（Hz）与算法通用性的取舍",
      "paragraphs": [
        "**4. 模拟物理频率（单位：Hz，范围从 DC 到实际采样率的一半）**：在具体工程应用中，我们常常希望横轴直接对应现实世界的物理意义。例如，如果系统的采样率 `fs` 是 **10 kHz**（每秒采样 10,000 次），那么频域图的横轴就可以直接标注为 **`0` 到 `5 kHz`**。",
        "这种方法最大的优点是**直观、有真实物理含义**，一眼就能看出某个噪声或共振峰处于多少赫兹。但它的致命缺点是**与特定采样率强绑定**——一旦采样率从 10 kHz 换成 44.1 kHz，原来的刻度就全部失效了。因此，在设计通用的数字滤波器或底层 DSP 算法时，工程师通常避免使用赫兹，而是选用 `f` 或 `ω`。",
        "判断一张频谱图或一个公式采用了哪种表示法，最快的秘诀是**看自变量的符号和取值范围**：看到 `0 ~ N/2` 的整数通常是数组下标 `k`；看到 `0 ~ 0.5` 是采样率比例 `f`；看到 `0 ~ π` 是自然频率 `ω`；看到 `0 ~ fs/2` 且带赫兹单位，则是具体应用的模拟频率。"
      ],
      "formula": {
        "expr": "F_Hz = f × fs = (k / N) × fs = (ω / 2π) × fs",
        "explain": "F_Hz 是真实世界的物理频率（单位 Hz，上限为奈奎斯特频率 fs/2）；只有乘以系统采样率 fs，离散频域才会锚定到真实的时间尺度。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：采样率、归一化频率与真实音高听觉实验",
      "instruction": "点击“播放当前真实音高”并调节归一化频率 f 与采样率 fs：感受相同的 f 在不同采样率下如何发出完全不同的声音，以及 f 逼近 0.5 (π) 时离散采样点如何逼近每周期仅 2 个点的极限。",
      "controls": [
        {
          "type": "slider",
          "id": "f",
          "label": "归一化频率 f (k/N)",
          "min": 0.02,
          "max": 0.5,
          "step": 0.01,
          "value": 0.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "系统采样率 fs",
          "min": 1000,
          "max": 8000,
          "step": 500,
          "value": 4000,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showAnalog",
          "label": "显示连续模拟正弦波",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放当前真实音高",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gainNode = null;\n\nfunction syncAudio(isPlaying, freqHz) {\n  try {\n    const ctx = lab.getAudioContext();\n    if (!ctx) return;\n    if (isPlaying) {\n      if (ctx.state === 'suspended') ctx.resume();\n      if (!osc) {\n        osc = ctx.createOscillator();\n        gainNode = ctx.createGain();\n        osc.type = 'sine';\n        osc.frequency.setValueAtTime(freqHz, ctx.currentTime);\n        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);\n        gainNode.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 0.03);\n        osc.connect(gainNode);\n        gainNode.connect(ctx.destination);\n        osc.start();\n      } else {\n        osc.frequency.setTargetAtTime(freqHz, ctx.currentTime, 0.02);\n      }\n    } else {\n      if (osc) {\n        try {\n          osc.stop();\n          osc.disconnect();\n        } catch (e) {}\n        osc = null;\n      }\n      if (gainNode) {\n        try {\n          gainNode.disconnect();\n        } catch (e) {}\n        gainNode = null;\n      }\n    }\n  } catch (e) {}\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const f = lab.values.f;\n  const fs = lab.values.fs;\n  const showAnalog = lab.values.showAnalog;\n  const isPlaying = lab.values.play;\n\n  const realFreq = f * fs;\n  const omegaPi = f * 2;\n  const nyquistHz = fs / 2;\n\n  syncAudio(isPlaying, realFreq);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const tx0 = 26;\n  const tx1 = 420;\n  const tw = tx1 - tx0;\n  const tMidY = 122;\n  const tAmp = 68;\n  const winSec = 0.008;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const gx = tx0 + (g / 4) * tw;\n    ctx.beginPath();\n    ctx.moveTo(gx, 36);\n    ctx.lineTo(gx, 206);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(tx0, tMidY);\n  ctx.lineTo(tx1, tMidY);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('物理时间窗口 (0 ~ 8 ms) · 实际信号 F = ' + realFreq.toFixed(0) + ' Hz', tx0, 22);\n\n  if (showAnalog) {\n    ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let px = 0; px <= tw; px += 1.5) {\n      const t = (px / tw) * winSec;\n      const yVal = Math.cos(2 * Math.PI * realFreq * t);\n      const py = tMidY - yVal * tAmp;\n      if (px === 0) ctx.moveTo(tx0 + px, py);\n      else ctx.lineTo(tx0 + px, py);\n    }\n    ctx.stroke();\n  }\n\n  const numSamples = Math.floor(winSec * fs);\n  for (let n = 0; n <= numSamples; n++) {\n    const t = n / fs;\n    const sx = tx0 + (t / winSec) * tw;\n    const yVal = Math.cos(2 * Math.PI * f * n);\n    const sy = tMidY - yVal * tAmp;\n\n    ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(sx, tMidY);\n    ctx.lineTo(sx, sy);\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(sx, sy, 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText('0 ms', tx0, 222);\n  ctx.textAlign = 'center';\n  ctx.fillText('4 ms (窗口内采样点: ' + (numSamples + 1) + ')', tx0 + tw / 2, 222);\n  ctx.textAlign = 'right';\n  ctx.fillText('8 ms', tx1, 222);\n\n  const fx0 = 460;\n  const fx1 = 692;\n  const fw = fx1 - fx0;\n  const fBaseY = 186;\n  const fTopY = 56;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 5; g++) {\n    const gx = fx0 + (g / 5) * fw;\n    ctx.beginPath();\n    ctx.moveTo(gx, 44);\n    ctx.lineTo(gx, fBaseY);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('频域范围 (DC ~ Nyquist 极限)', fx0, 22);\n\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(fx1, 40);\n  ctx.lineTo(fx1, fBaseY);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('Nyquist (0.5 / π)', fx1, 37);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(fx0, fBaseY);\n  ctx.lineTo(fx1, fBaseY);\n  ctx.stroke();\n\n  const peakX = fx0 + (f / 0.5) * fw;\n  const isNearNyquist = f >= 0.45;\n  const stemColor = isNearNyquist ? '#f59e0b' : '#10b981';\n\n  ctx.strokeStyle = stemColor;\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(peakX, fBaseY);\n  ctx.lineTo(peakX, fTopY + 18);\n  ctx.stroke();\n\n  ctx.fillStyle = stemColor;\n  ctx.beginPath();\n  ctx.arc(peakX, fTopY + 18, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.textAlign = peakX > fx1 - 65 ? 'right' : 'center';\n  ctx.fillText(realFreq.toFixed(0) + ' Hz', peakX, fTopY + 8);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText('f: 0', fx0, 202);\n  ctx.textAlign = 'center';\n  ctx.fillText('0.25', fx0 + fw / 2, 202);\n  ctx.textAlign = 'right';\n  ctx.fillText('0.5', fx1, 202);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.fillText('0 Hz', fx0, 218);\n  ctx.textAlign = 'center';\n  ctx.fillText((nyquistHz / 2).toFixed(0) + ' Hz', fx0 + fw / 2, 218);\n  ctx.textAlign = 'right';\n  ctx.fillText(nyquistHz + ' Hz', fx1, 218);\n\n  const cyclesPerSampleNote = (1 / f).toFixed(1);\n  lab.setReadout('真实音高 F = ' + realFreq.toFixed(0) + ' Hz | 比例 f = ' + f.toFixed(2) + ' (每周期 ' + cyclesPerSampleNote + ' 个点) | 弧度 ω = ' + omegaPi.toFixed(2) + 'π | Nyquist 上限 = ' + nyquistHz + ' Hz');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数组长度铁律：N 点时域信号做实 DFT 后，ReX[ ] 和 ImX[ ] 各自的长度都是 N/2 + 1（下标 0 到 N/2），写代码分配数组时千万别忘了这个 +1。",
        "看范围秒懂符号：0 ~ N/2 是写代码用的整数索引 k；0 ~ 0.5 是归一化采样率比例 f；0 ~ π 是推导公式用的自然弧度频率 ω；0 ~ fs/2 是具体工程里的物理频率 Hz。",
        "核心换算关系：f = k / N，ω = 2πf = 2πk / N，真实物理频率 F_Hz = f × fs。",
        "算法与物理边界：设计通用数字滤波器时应使用与采样率无关的 f 或 ω；在分析具体硬件采集数据时，再乘上采样率 fs 还原成人类可读的 Hz。"
      ]
    }
  ]
});
