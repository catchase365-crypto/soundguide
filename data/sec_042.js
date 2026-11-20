window.__BOOK_REGISTER_SECTION__("sec_042", {
  "title": "多速率数据转换 (Multirate Data Conversion)",
  "intuition": "用‘先高速过采样、再软件数字滤波并降速’的算力换取电路的极简，把昂贵笨重的精密模拟滤波器统统搬进软件算法里！",
  "blocks": [
    {
      "type": "concept",
      "heading": "从“硬扛”到“过采样”：为什么需要多速率？",
      "paragraphs": [
        "在现代电子系统设计中，有一个非常明确的趋势：**用数字算法取代模拟电路**。数据转换（ADC/DAC）正是这一趋势的绝佳代表。",
        "设想我们要设计一台**数字语音记录仪**，负责把人声数字化、存起来再还原播放。听清人声只需要 **100 Hz ~ 3000 Hz（3 kHz）** 的频段；但麦克风拾取的模拟信号中，往往混杂着高达 **40 kHz** 的高频噪声。",
        "如果用传统的“硬扛”方案：ADC 端必须在采样前放一个陡峭的 **8 阶切比雪夫低通模拟滤波器**（截止频率 3 kHz），把 3~40 kHz 的噪声一刀切掉，然后再以 **8 kHz** 采样；DAC 回放端同样要用 8 kHz 零阶保持输出，再接一个 8 阶切比雪夫模拟滤波器还原语音。这种高阶模拟滤波器不仅体积大、成本高，而且元器件参数漂移会让性能大打折扣。",
        "换个思路：如果我们直接把采样率提高 8 倍，用 **64 kHz** 去采样呢？此时抗混叠滤波器的任务瞬间变得无比轻松——它只需要放行 3 kHz 以下的人声，并衰减 **32 kHz（64 kHz 的一半）** 以上的频率即可。这么宽的过渡带，意味着原本复杂的 8 阶模拟滤波器可以被**极其廉价的 RC 阻容网络**取代！但新问题也随之而来：采样率翻了 8 倍，数字系统瞬间被海量数据淹没。**多速率（Multirate）技术**正是为了兼得“简陋模拟前端”与“低速精简数据”而诞生的。"
      ],
      "formula": {
        "expr": "f_guard = f_s / 2 - f_pass",
        "explain": "过渡带宽度 f_guard 决定了模拟滤波器的复杂度：直接 8 kHz 采样时，f_s/2 = 4 kHz，过渡带只有 4 - 3 = 1 kHz（极难设计）；过采样到 64 kHz 后，f_s/2 = 32 kHz，过渡带暴增到 32 - 3 = 29 kHz，简单 RC 电路即可胜任。"
      }
    },
    {
      "type": "concept",
      "heading": "输入端的减法艺术：数字低通与抽取 (Decimation)",
      "paragraphs": [
        "在数字语音记录仪的采集端（ADC），多速率技术只需三步就能以极低成本拿到高质量的 8 kHz 语音数据：",
        "1. **粗滤过采样**：让麦克风信号先通过一个简单的 **RC 低通模拟电路**，然后以 **64 kHz** 高速采样。此时数字信号里包含了我们需要的 100~3000 Hz 语音，但也混着 3 kHz ~ 32 kHz 的无用高频噪声。",
        "2. **软件数字滤波**：在数字域里运行一个截止频率为 **3 kHz 的数字低通滤波器**，把 3~32 kHz 频段里的噪声彻底清空。",
        "3. **抽取（Decimation）**：把滤波后的 64 kHz 数字信号，直接**每 8 个样本丢弃 7 个**（只保留第 0, 8, 16, ... 个样本），将采样率降回 **8 kHz**。",
        "**关键物理直觉**：数字低通滤波必须发生在丢弃样本**之前**！因为一旦先丢弃样本，3~32 kHz 的残余高频分量就会立刻发生**混叠（Aliasing）**，折叠进 0~4 kHz 的人声频段里，变成永远无法剔除的啸叫噪声。按正确顺序执行后，最终得到的 8 kHz 数据，效果与“昂贵 8 阶模拟滤波 + 8 kHz 直采”完全等价，甚至更纯净。"
      ],
      "formula": {
        "expr": "y[m] = x_LPF[M * m]",
        "explain": "抽取操作公式：x_LPF 是经过 3 kHz 数字低通滤波后的高速序列，M 为抽取因子（本例 M = 8），y[m] 是降速后的 8 kHz 序列。每隔 M 个点取 1 个点，丢弃其余 M-1 个点。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：高速采样、数字低通与抽取（Decimation）混叠对比",
      "instruction": "拖动高频干扰强度与频率，切换“开启 3 kHz 数字低通滤波”开关，并点击播放对比有无数字滤波时 8 kHz 抽取产生的混叠失真与啸叫。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "高频干扰强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noiseFreq",
          "label": "高频干扰频率",
          "min": 8.5,
          "max": 15.5,
          "step": 0.5,
          "value": 9.5,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "useLPF",
          "label": "抽取前开启 3kHz 数字低通",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比声音",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet oscV = null, oscA = null, gV = null, gA = null;\n\nfunction syncAudio() {\n  const play = lab.values.play;\n  const noiseAmp = lab.values.noiseAmp;\n  const noiseFreq = lab.values.noiseFreq;\n  const useLPF = lab.values.useLPF;\n  const aliasKHz = Math.abs(noiseFreq - 8 * Math.round(noiseFreq / 8));\n  if (play) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!oscV) {\n      oscV = ac.createOscillator();\n      oscA = ac.createOscillator();\n      gV = ac.createGain();\n      gA = ac.createGain();\n      oscV.type = 'sine';\n      oscA.type = 'sine';\n      oscV.connect(gV);\n      oscA.connect(gA);\n      gV.connect(ac.destination);\n      gA.connect(ac.destination);\n      oscV.start();\n      oscA.start();\n    }\n    oscV.frequency.setTargetAtTime(440, ac.currentTime, 0.02);\n    gV.gain.setTargetAtTime(0.14, ac.currentTime, 0.02);\n    oscA.frequency.setTargetAtTime(Math.max(120, aliasKHz * 1000), ac.currentTime, 0.02);\n    gA.gain.setTargetAtTime(useLPF ? 0.001 : noiseAmp * 0.2, ac.currentTime, 0.02);\n  } else {\n    if (oscV) {\n      try { oscV.stop(); oscA.stop(); } catch (e) {}\n      oscV.disconnect(); oscA.disconnect(); gV.disconnect(); gA.disconnect();\n      oscV = null; oscA = null; gV = null; gA = null;\n    }\n  }\n}\n\nfunction draw() {\n  const noiseAmp = lab.values.noiseAmp;\n  const noiseFreq = lab.values.noiseFreq;\n  const useLPF = lab.values.useLPF;\n  const signedAlias = noiseFreq - 8 * Math.round(noiseFreq / 8);\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 44, padR = 20, padT = 32, padB = 26;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const midY = padT + plotH / 2;\n  const ampY = plotH * 0.42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 8; i++) {\n    const x = padL + (plotW * i) / 8;\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke();\n  }\n  for (let j = -1; j <= 1; j++) {\n    const y = midY - j * ampY;\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();\n  }\n\n  const tMax = 2.0;\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= 400; px++) {\n    const t = (px / 400) * tMax;\n    const val = 0.55 * Math.sin(2 * Math.PI * 0.5 * t) + 0.45 * noiseAmp * Math.sin(2 * Math.PI * noiseFreq * t);\n    const x = padL + (t / tMax) * plotW;\n    const y = midY - val * ampY;\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = useLPF ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let px = 0; px <= 300; px++) {\n    const t = (px / 300) * tMax;\n    const val = useLPF\n      ? 0.55 * Math.sin(2 * Math.PI * 0.5 * t)\n      : 0.55 * Math.sin(2 * Math.PI * 0.5 * t) + 0.45 * noiseAmp * Math.sin(2 * Math.PI * signedAlias * t);\n    const x = padL + (t / tMax) * plotW;\n    const y = midY - val * ampY;\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const n64 = 128;\n  for (let k = 0; k <= n64; k++) {\n    const t = (k / n64) * tMax;\n    const x = padL + (t / tMax) * plotW;\n    const isKept = (k % 8 === 0);\n    const val64 = useLPF\n      ? 0.55 * Math.sin(2 * Math.PI * 0.5 * t)\n      : 0.55 * Math.sin(2 * Math.PI * 0.5 * t) + 0.45 * noiseAmp * Math.sin(2 * Math.PI * noiseFreq * t);\n    const y = midY - val64 * ampY;\n    if (isKept) {\n      ctx.fillStyle = useLPF ? '#f59e0b' : '#ec4899';\n      ctx.beginPath(); ctx.arc(x, y, 4.5, 0, Math.PI * 2); ctx.fill();\n      ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1; ctx.stroke();\n    } else {\n      ctx.fillStyle = 'rgba(248, 250, 252, 0.25)';\n      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 64kHz 过采样原始含噪信号', padL, 18);\n  ctx.fillStyle = useLPF ? '#10b981' : '#ec4899';\n  ctx.fillText(useLPF ? '— 3kHz数字低通后抽取 (纯净 0.5kHz 人声)' : '— 未滤波直接抽取 (混叠出 ' + Math.abs(signedAlias).toFixed(1) + 'kHz 假信号!)', padL + 210, 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 8kHz 保留样本 (丢弃其余 7/8)', W - 205, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('0 ms', padL, H - 8);\n  ctx.fillText('1.0 ms', padL + plotW * 0.5 - 16, H - 8);\n  ctx.fillText('2.0 ms', W - padR - 36, H - 8);\n\n  lab.setReadout('干扰频率: ' + noiseFreq.toFixed(1) + ' kHz | 8kHz 抽取混叠产物: ' + (useLPF ? '已被数字低通抑制 (0 Hz)' : Math.abs(signedAlias).toFixed(1) + ' kHz 啸叫!') + ' | 数据速率: 64 kHz → 8 kHz (压缩 8 倍)');\n  syncAudio();\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "输出端的魔法：零值内插 (Interpolation) 与数字重构",
      "paragraphs": [
        "当要把存储在内存里的 8 kHz 语音播放出来时，多速率技术在输出端（DAC）上演了一出精妙的“逆向魔术”——**内插（Interpolation）**：",
        "1. **零值填充（Zero-Stuffing）**：从内存取出 8 kHz 样本后，在**每两个相邻样本之间强行插入 7 个值为零的样本**，把数据率重新拉回 **64 kHz**。这样构造出的信号是一个“数字冲激串（Digital Impulse Train）”。",
        "2. **频谱镜像的诞生**：插零操作并不会凭空创造完美波形，在频域上，它不仅保留了原本 100~3000 Hz 的语音频段，还会在 **3 kHz ~ 32 kHz 之间产生一系列频谱镜像副本（Spectral Duplications）**。",
        "3. **数字低通抹平锯齿**：用软件运行一个 **3 kHz 数字低通滤波器**，把 3 kHz 以上的镜像副本全部切掉。神奇的事情发生了：时域里原本中间全是 0 的冲激串，经过低通平滑（并乘以增益 L 补偿能量）后，0 值位置自动被平滑填充成了连续过渡的 64 kHz 高密波形！最后送入 DAC，只需接一个**极其简单的 RC 阻容网络**就能输出丝滑的语音。",
        "**为什么业界（例如 CD 音频播放器）对多速率技术趋之若鹜？** 书中总结了两大核心价值：**（1）经济成本优势**：在量产消费电子中用免费/廉价的软件代码取代大批精密模拟元器件；**（2）碾压级的性能精度**：模拟元器件的物理制造容差通常只有 **1%** 左右，而数字算法只受舍入误差限制，精度高达 **0.0001%**。在关键滤波指标上，数字滤波器能够超越模拟滤波器**数百倍**。"
      ],
      "formula": {
        "expr": "x_up[n] = x[n / L] (当 n 为 L 的整数倍), 否则 0",
        "explain": "零值内插公式：L 为内插倍率（本例 L = 8）。每遇到 L 的整数倍时刻就放入原始低速样本，其余 L-1 个时刻全部填 0，随后必须通过数字低通滤波器消除高频镜像并放大 L 倍恢复幅度。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：零值内插（Interpolation）时域重构与频谱镜像观察",
      "instruction": "调节信号频率与内插倍率 L，切换“开启 3 kHz 数字低通重构”开关，同时观察左图时域冲激串如何变平滑、右图 3~32 kHz 频谱镜像如何被滤除。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "语音信号频率",
          "min": 0.5,
          "max": 3,
          "step": 0.5,
          "value": 1,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "lFactor",
          "label": "内插倍率 L",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 8,
          "unit": " 倍"
        },
        {
          "type": "toggle",
          "id": "lpfOn",
          "label": "开启 3kHz 数字低通重构",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放重构对比音",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet oscBase = null, oscImg = null, gBase = null, gImg = null;\n\nfunction syncAudio() {\n  const play = lab.values.play;\n  const sigFreq = lab.values.sigFreq;\n  const lpfOn = lab.values.lpfOn;\n  if (play) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!oscBase) {\n      oscBase = ac.createOscillator();\n      oscImg = ac.createOscillator();\n      gBase = ac.createGain();\n      gImg = ac.createGain();\n      oscBase.type = 'sine';\n      oscImg.type = 'sine';\n      oscBase.connect(gBase);\n      oscImg.connect(gImg);\n      gBase.connect(ac.destination);\n      gImg.connect(ac.destination);\n      oscBase.start();\n      oscImg.start();\n    }\n    oscBase.frequency.setTargetAtTime(sigFreq * 400, ac.currentTime, 0.02);\n    gBase.gain.setTargetAtTime(0.14, ac.currentTime, 0.02);\n    oscImg.frequency.setTargetAtTime((8 - sigFreq) * 400, ac.currentTime, 0.02);\n    gImg.gain.setTargetAtTime(lpfOn ? 0.001 : 0.14, ac.currentTime, 0.02);\n  } else {\n    if (oscBase) {\n      try { oscBase.stop(); oscImg.stop(); } catch (e) {}\n      oscBase.disconnect(); oscImg.disconnect(); gBase.disconnect(); gImg.disconnect();\n      oscBase = null; oscImg = null; gBase = null; gImg = null;\n    }\n  }\n}\n\nfunction draw() {\n  const sigFreq = lab.values.sigFreq;\n  const L = lab.values.lFactor;\n  const lpfOn = lab.values.lpfOn;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 24, lw = 318, ly = 34, lh = 172;\n  const lmid = ly + lh * 0.5;\n  const lamp = lh * 0.38;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.beginPath(); ctx.moveTo(lx, lmid); ctx.lineTo(lx + lw, lmid); ctx.stroke();\n\n  const tMax = 1.5;\n  const totalSteps = 12 * L;\n  for (let i = 0; i <= totalSteps; i++) {\n    const t = (i / totalSteps) * tMax;\n    const x = lx + (t / tMax) * lw;\n    const isOrig = (i % L === 0);\n    const val = isOrig ? Math.sin(2 * Math.PI * sigFreq * t) : 0;\n    const y = lmid - val * lamp;\n    if (isOrig) {\n      ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath(); ctx.moveTo(x, lmid); ctx.lineTo(x, y); ctx.stroke();\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath(); ctx.arc(x, y, 3.5, 0, Math.PI * 2); ctx.fill();\n    } else {\n      ctx.fillStyle = lpfOn ? 'rgba(236, 72, 153, 0.3)' : '#ec4899';\n      ctx.beginPath(); ctx.arc(x, lmid, 2.2, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  if (lpfOn) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let px = 0; px <= 240; px++) {\n      const t = (px / 240) * tMax;\n      const val = Math.sin(2 * Math.PI * sigFreq * t);\n      const x = lx + (t / tMax) * lw;\n      const y = lmid - val * lamp;\n      if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  } else {\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';\n    ctx.lineWidth = 1.3;\n    ctx.beginPath();\n    for (let i = 0; i <= totalSteps; i++) {\n      const t = (i / totalSteps) * tMax;\n      const x = lx + (t / tMax) * lw;\n      const val = (i % L === 0) ? Math.sin(2 * Math.PI * sigFreq * t) : 0;\n      const y = lmid - val * lamp;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  const rx = 378, rw = 318, ry = 34, rh = 172;\n  const rbase = ry + rh - 18;\n  const rmaxH = rh - 34;\n  const nyq = 4 * L;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  for (let f = 8; f <= 32; f += 8) {\n    const fx = rx + (f / 32) * rw;\n    ctx.beginPath(); ctx.moveTo(fx, ry); ctx.lineTo(fx, rbase); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(f + 'k', fx - 8, ry + rh - 4);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.fillText('0', rx + 2, ry + rh - 4);\n\n  if (nyq < 32) {\n    const nx = rx + (nyq / 32) * rw;\n    ctx.fillStyle = 'rgba(255,255,255,0.05)';\n    ctx.fillRect(nx, ry, rx + rw - nx, rbase - ry);\n  }\n\n  function drawPeak(freqKHz, amp, color) {\n    if (freqKHz > nyq || freqKHz < 0) return;\n    const x = rx + (freqKHz / 32) * rw;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 4;\n    ctx.beginPath(); ctx.moveTo(x, rbase); ctx.lineTo(x, rbase - amp * rmaxH); ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.beginPath(); ctx.arc(x, rbase - amp * rmaxH, 3.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  drawPeak(sigFreq, 0.9, '#10b981');\n  const imgAmp = lpfOn ? 0.03 : 0.85;\n  const imgColor = lpfOn ? 'rgba(236, 72, 153, 0.3)' : '#ec4899';\n  for (let k = 1; k <= 4; k++) {\n    drawPeak(8 * k - sigFreq, imgAmp, imgColor);\n    drawPeak(8 * k + sigFreq, imgAmp, imgColor);\n  }\n\n  if (lpfOn) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.8;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    const cutX1 = rx + (3.0 / 32) * rw;\n    const cutX2 = rx + (4.2 / 32) * rw;\n    ctx.moveTo(rx, rbase - 0.95 * rmaxH);\n    ctx.lineTo(cutX1, rbase - 0.95 * rmaxH);\n    ctx.lineTo(cutX2, rbase);\n    ctx.lineTo(rx + rw, rbase);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('时域: 8kHz 补零成 ' + (8 * L) + 'kHz 冲激串', lx, 20);\n  ctx.fillStyle = lpfOn ? '#10b981' : '#ec4899';\n  ctx.fillText(lpfOn ? '频域: 3kHz 数字低通抹除镜像' : '频域: 存在强高频镜像副本!', rx, 20);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0 ms', lx, H - 8);\n  ctx.fillText('1.5 ms', lx + lw - 34, H - 8);\n  ctx.fillText('输出采样率: ' + (8 * L) + ' kHz (Nyquist: ' + nyq + ' kHz)', rx, H - 8);\n\n  lab.setReadout('输入: 8 kHz | 输出: ' + (8 * L) + ' kHz (每样本间插 ' + (L - 1) + ' 个零) | 第一镜像频率: ' + (8 - sigFreq).toFixed(1) + ' kHz | 滤波状态: ' + (lpfOn ? '镜像已清除，波形平滑重构' : '未滤波，冲激尖峰与高频镜像残留!'));\n  syncAudio();\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑铁律 1（先滤波再抽取）：做 Decimation 降采样时，绝对不能直接丢点，必须先在高速率下完成数字低通滤波，否则高频噪声会瞬间混叠进基带，再也洗不干净。",
        "避坑铁律 2（补零后必滤波）：做 Interpolation 升采样时，往样本间插零（Zero-Stuffing）只是制造了包含无数高频镜像的数字冲激串，必须紧跟数字低通滤波器并补偿 L 倍增益，才能得到平滑波形。",
        "核心工程哲学：多速率数据转换的本质，就是利用低成本的数字算力（0.0001% 精度）替代笨重昂贵且受限于 1% 元器件容差的高阶模拟滤波器，只留极简的 RC 电路作为模拟接口。"
      ]
    }
  ]
});
