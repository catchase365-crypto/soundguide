window.__BOOK_REGISTER_SECTION__("sec_032", {
  "title": "正态分布 / 高斯分布 (The Normal Distribution)",
  "intuition": "随机过程在自然界和数字系统中几乎总能汇聚成钟形的正态分布：均值决定中心位置，标准差决定胖瘦宽度，而尾部以指数平方级极速归零，使理论上无界的随机噪声在示波器上呈现约 6~8 倍标准差的“表观峰峰值”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 从负平方指数到完整的钟形高斯曲线",
      "paragraphs": [
        "由随机过程产生的信号，其概率密度函数（pdf）通常呈现经典的钟形，这就是**正态分布**（Normal Distribution），也以德国数学家高斯的姓氏命名为**高斯分布**（Gaussian）。它最核心的数学骨架非常简洁，仅仅是一个**负平方指数**函数：`y(x) = e^(-x²)`。",
        "不过，原始的 `e^(-x²)` 曲线中心死死钉在 0 点，宽度也无法调节，而且曲线下的总面积并不等于 1（而所有合法的概率密度函数都必须满足总面积为 1，代表“事件发生的总概率为 100%”）。",
        "为了让这条曲线能描述任意信号，我们需要引入两个可调参数：用**均值 `μ`** 把曲线的中心平移到目标位置，用**标准差 `σ`** 控制钟形的胖瘦宽窄；最后在最前面乘上归一化系数 `1 / (√(2π) · σ)`，将曲线下的总面积精确缩放为 1，就得到了统计与信号处理中最重要的方程（Equation 2-8）。"
      ],
      "formula": {
        "expr": "P(x) = [ 1 / (√(2π) · σ) ] · e^(-(x - μ)² / (2σ²))",
        "explain": "P(x) 是概率密度函数；μ (mu) 是均值，决定钟形曲线的对称中心；σ (sigma) 是标准差，决定分布的分散程度（σ 越大曲线越矮胖，σ 越小越瘦高）；前置系数 1/(√(2π)σ) 保证积分总面积恒等于 1。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：高斯曲线塑形与 6~8σ 噪声波形/听感对比",
      "instruction": "拖动「均值 μ」与「标准差 σ」滑块观察左侧概率密度曲线（含与原始 e^(-x²) 的对比）以及右侧时域噪声波形的变化，点击播放按钮可直接聆听不同 σ 对应的高斯白噪声响度。",
      "controls": [
        {
          "type": "slider",
          "id": "mu",
          "label": "均值 μ",
          "min": -3,
          "max": 3,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sigma",
          "label": "标准差 σ",
          "min": 0.4,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRaw",
          "label": "叠加未归一化原始曲线 e^(-x²)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放高斯白噪声",
          "activeLabel": "⏸ 暂停噪声"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet noiseSamples = [];\nlet audioSource = null;\nlet gainNode = null;\nlet lastAnimTime = 0;\n\nfunction boxMuller() {\n  let u = 0, v = 0;\n  while (u === 0) u = Math.random();\n  while (v === 0) v = Math.random();\n  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);\n}\n\nfunction regenSamples() {\n  noiseSamples = [];\n  for (let i = 0; i < 120; i++) {\n    noiseSamples.push(boxMuller());\n  }\n}\nregenSamples();\n\nfunction syncAudio() {\n  const play = !!lab.values.play;\n  const sigma = lab.values.sigma;\n  if (play) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!audioSource) {\n      const bufSize = ac.sampleRate * 2;\n      const buf = ac.createBuffer(1, bufSize, ac.sampleRate);\n      const data = buf.getChannelData(0);\n      for (let i = 0; i < bufSize; i++) {\n        let s = boxMuller();\n        if (s > 4) s = 4;\n        if (s < -4) s = -4;\n        data[i] = s;\n      }\n      audioSource = ac.createBufferSource();\n      audioSource.buffer = buf;\n      audioSource.loop = true;\n      gainNode = ac.createGain();\n      gainNode.gain.setValueAtTime(sigma * 0.06, ac.currentTime);\n      audioSource.connect(gainNode);\n      gainNode.connect(ac.destination);\n      audioSource.start();\n    } else if (gainNode) {\n      gainNode.gain.setTargetAtTime(sigma * 0.06, ac.currentTime, 0.03);\n    }\n  } else {\n    if (audioSource) {\n      try { audioSource.stop(); audioSource.disconnect(); } catch (e) {}\n      audioSource = null;\n    }\n    if (gainNode) {\n      try { gainNode.disconnect(); } catch (e) {}\n      gainNode = null;\n    }\n  }\n}\n\nfunction draw() {\n  const mu = lab.values.mu;\n  const sigma = lab.values.sigma;\n  const showRaw = lab.values.showRaw;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  // Left panel: PDF [x: 28..352, y: 24..212]\n  const Lx0 = 28, Lx1 = 352, Ly0 = 24, Ly1 = 212;\n  const Lw = Lx1 - Lx0, Lh = Ly1 - Ly0;\n  const xMin = -6, xMax = 6, yMax = 1.1;\n\n  // Right panel: Time waveform [x: 392..702, y: 24..212]\n  const Rx0 = 392, Rx1 = 702, Ry0 = 24, Ry1 = 212;\n  const Rw = Rx1 - Rx0, Rh = Ry1 - Ry0;\n\n  // Grids\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = -6; gx <= 6; gx += 2) {\n    const px = Lx0 + ((gx - xMin) / (xMax - xMin)) * Lw;\n    ctx.beginPath(); ctx.moveTo(px, Ly0); ctx.lineTo(px, Ly1); ctx.stroke();\n  }\n  for (let gy = 0; gy <= 1.0; gy += 0.25) {\n    const py = Ly1 - (gy / yMax) * Lh;\n    ctx.beginPath(); ctx.moveTo(Lx0, py); ctx.lineTo(Lx1, py); ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const py = Ry0 + (i / 4) * Rh;\n    ctx.beginPath(); ctx.moveTo(Rx0, py); ctx.lineTo(Rx1, py); ctx.stroke();\n  }\n\n  // Panel Borders & Titles\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('概率密度函数 P(x) (范围 x: -6 ~ +6)', Lx0, 15);\n  ctx.fillText('对应的离散随机信号时域波形 (幅度 -6 ~ +6)', Rx0, 15);\n\n  const mapLx = x => Lx0 + ((x - xMin) / (xMax - xMin)) * Lw;\n  const mapLy = y => Ly1 - (y / yMax) * Lh;\n  const mapRy = v => Ry1 - ((v - xMin) / (xMax - xMin)) * Rh;\n\n  // Raw curve e^(-x^2)\n  if (showRaw) {\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.setLineDash([5, 4]);\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const x = xMin + (i / 200) * (xMax - xMin);\n      const y = Math.exp(-x * x);\n      const px = mapLx(x), py = mapLy(y);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  // +/- 3 sigma shaded area on PDF\n  const bLeft = Math.max(xMin, mu - 3 * sigma);\n  const bRight = Math.min(xMax, mu + 3 * sigma);\n  if (bRight > bLeft) {\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n    ctx.beginPath();\n    ctx.moveTo(mapLx(bLeft), Ly1);\n    for (let i = 0; i <= 100; i++) {\n      const x = bLeft + (i / 100) * (bRight - bLeft);\n      const p = (1 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));\n      ctx.lineTo(mapLx(x), mapLy(p));\n    }\n    ctx.lineTo(mapLx(bRight), Ly1);\n    ctx.closePath();\n    ctx.fill();\n  }\n\n  // Normalized Gaussian PDF\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 240; i++) {\n    const x = xMin + (i / 240) * (xMax - xMin);\n    const p = (1 / (Math.sqrt(2 * Math.PI) * sigma)) * Math.exp(-Math.pow(x - mu, 2) / (2 * sigma * sigma));\n    const px = mapLx(x), py = mapLy(p);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Mean line on PDF\n  const muPx = mapLx(mu);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(muPx, Ly0); ctx.lineTo(muPx, Ly1); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('μ=' + mu.toFixed(1), Math.min(Lx1 - 36, Math.max(Lx0 + 2, muPx + 4)), Ly0 + 12);\n\n  // X-axis labels on PDF\n  ctx.fillStyle = '#64748b';\n  for (let gx = -6; gx <= 6; gx += 2) {\n    ctx.fillText(String(gx), mapLx(gx) - 5, Ly1 + 13);\n  }\n\n  // Right panel: +/- 3 sigma and +/- 4 sigma apparent peak-to-peak bounds\n  const drawBound = (val, color, label) => {\n    if (val < xMin || val > xMax) return;\n    const py = mapRy(val);\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(Rx0, py); ctx.lineTo(Rx1, py); ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.fillText(label, Rx1 - 38, py - 3);\n    ctx.restore();\n  };\n  drawBound(mu + 3 * sigma, 'rgba(56, 189, 248, 0.7)', '+3σ');\n  drawBound(mu - 3 * sigma, 'rgba(56, 189, 248, 0.7)', '-3σ');\n  drawBound(mu + 4 * sigma, 'rgba(236, 72, 153, 0.65)', '+4σ');\n  drawBound(mu - 4 * sigma, 'rgba(236, 72, 153, 0.65)', '-4σ');\n\n  // Mean line on waveform\n  const rMuY = mapRy(mu);\n  if (rMuY >= Ry0 && rMuY <= Ry1) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(Rx0, rMuY); ctx.lineTo(Rx1, rMuY); ctx.stroke();\n  }\n\n  // Waveform clipped to Right panel\n  ctx.save();\n  ctx.beginPath(); ctx.rect(Rx0, Ry0, Rw, Rh); ctx.clip();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let i = 0; i < noiseSamples.length; i++) {\n    const val = mu + noiseSamples[i] * sigma;\n    const px = Rx0 + (i / (noiseSamples.length - 1)) * Rw;\n    const py = mapRy(val);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  // Y-axis labels on Right panel\n  ctx.fillStyle = '#64748b';\n  for (let gy = -6; gy <= 6; gy += 3) {\n    ctx.fillText(String(gy), Rx0 - 16, mapRy(gy) + 4);\n  }\n\n  const peakP = (1 / (Math.sqrt(2 * Math.PI) * sigma)).toFixed(3);\n  const ppLow = (6 * sigma).toFixed(1);\n  const ppHigh = (8 * sigma).toFixed(1);\n  lab.setReadout('峰值 P(μ) = ' + peakP + '  |  ±3σ 范围: [' + (mu - 3*sigma).toFixed(1) + ', ' + (mu + 3*sigma).toFixed(1) + ']  |  表观峰峰值 (6~8σ) ≈ ' + ppLow + ' ~ ' + ppHigh);\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt, timeSec) => {\n  if (lab.values.play && timeSec - lastAnimTime > 0.1) {\n    lastAnimTime = timeSec;\n    regenSamples();\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "2. 极速衰减的尾部与“6~8σ 表观峰峰值”",
      "paragraphs": [
        "高斯分布有一个极为迷人且对工程至关重要的特性：**它的尾部向零衰减的速度极快**，远远快于常见的指数衰减函数或 `1/x` 函数。以标准正态分布（`μ = 0, σ = 1`）为例，在偏离均值 `2σ`、`4σ` 和 `6σ` 的位置，概率密度函数的值已经分别断崖式跌落到大约 `1/19`、`1/7563` 和 `1/166,666,666`。",
        "这直接解答了一个看似矛盾的现象：从纯数学原理上看，正态分布的取值范围是 `(-∞, +∞)`，意味着高斯噪声原则上可以出现幅度无限大的极端尖峰；但在真实示波器或信号波形上，高斯噪声看起来却像是有一个**有界的“表观峰峰值”（apparent peak-to-peak amplitude）**，宽度大约只有 **`6σ ~ 8σ`**（即均值上下各 `3σ ~ 4σ`）。",
        "原因正是那极其陡峭的尾部衰减——极端尖峰的概率实在太微乎其微了。如果采样点落入超过 `10σ` 之外的区域，其概率之小，甚至从宇宙大爆炸至今约 100 亿年的时间里，总共也只期望出现短短几微秒！"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "3. 累积分布函数 Φ(x) 与离散 PMF 的归一化陷阱",
      "paragraphs": [
        "在实际工程中，我们很少只关心某个单点的概率密度，更常问的是：“信号落在某两个阈值之间的概率是多少？”这就需要对概率密度函数（pdf）求积分，所得的新函数称为**累积分布函数（cdf）**。对于标准正态分布（`μ = 0, σ = 1`），它的 cdf 极为常用，因此拥有专属符号 **`Φ(x)`**（大写希腊字母 phi），代表随机时刻信号值**小于 `x`**（即从 `-∞` 到 `x`）的概率。",
        "然而高斯函数有一个让人非常头疼的数学性质：**它无法用初等解析方法求出不定积分**。计算机与工程手册中给出的 `Φ(x)` 数值表（如原书 Table 2-5），全都是通过**数值积分**硬算出来的——把 `-10σ` 到 `+10σ` 之间的连续曲线密密麻麻采出几百万个点，然后累加近似面积并存成查表数组。有了 `Φ(x)` 表，任意区间 `[a, b]` 的概率只需做一次减法：`Φ(b) - Φ(a)`。例如 `Φ(1) - Φ(-2) = 0.8413 - 0.0228 = 0.8185`（81.85%）。由此也得出了著名的经验法则：采样值落在 **`±1σ` 内的概率约 68%，`±2σ` 内约 95%，`±3σ` 内约 99.75%**。",
        "**工程避坑关键**：Equation 2-8 也可以用来表示**离散正态分布信号**的概率质量函数（pmf），例如 12 位 ADC 输出的 4096 个离散量化电平之一。此时**千万不要直接套用连续公式里的 `1 / (√(2π) · σ)` 系数**！那个系数只保证连续曲线下的“面积”等于 1，而离散 pmf 要求的是所有离散点概率的“总和”等于 1。正确做法是：先忽略归一化系数生成未归一化的 `e^(-(x-μ)²/(2σ²))` 序列，把所有离散点的数值全部加起来得到总和 `S`，再让每个点都除以 `S`。"
      ],
      "formula": {
        "expr": "P(z₁ ≤ Z ≤ z₂) = Φ(z₂) - Φ(z₁),   其中 z = (x - μ) / σ",
        "explain": "Φ(z) 为标准正态分布的累积分布函数；先将普通正态变量 x 标准化为偏离均值多少个标准差 z，再用上限的 Φ(z₂) 减去下限的 Φ(z₁)，即可直接查表得出区间概率。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：Φ(x) 区间概率计算器 & 离散 PMF 归一化陷阱对比",
      "instruction": "拖动下限 z₁ 与上限 z₂ 滑块，实时计算任意标准差区间的概率（默认 -2.0σ 到 1.0σ 正好对应原书 81.85% 的例题）；打开「离散量化对比」开关，亲眼验证直接套用连续公式系数 1/(√(2π)σ) 为什么会让离散概率总和出错。",
      "controls": [
        {
          "type": "slider",
          "id": "z1",
          "label": "下限 z₁",
          "min": -3.5,
          "max": 3.5,
          "step": 0.1,
          "value": -2,
          "unit": " σ"
        },
        {
          "type": "slider",
          "id": "z2",
          "label": "上限 z₂",
          "min": -3.5,
          "max": 3.5,
          "step": 0.1,
          "value": 1,
          "unit": " σ"
        },
        {
          "type": "toggle",
          "id": "discrete",
          "label": "离散量化对比 (揭示连续公式陷阱)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction erf(x) {\n  const sign = x >= 0 ? 1 : -1;\n  const ax = Math.abs(x);\n  const t = 1.0 / (1.0 + 0.3275911 * ax);\n  const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-ax * ax);\n  return sign * y;\n}\n\nfunction phi(z) {\n  return 0.5 * (1.0 + erf(z / Math.SQRT2));\n}\n\nfunction pdf(z) {\n  return (1.0 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * z * z);\n}\n\nfunction draw() {\n  const rawZ1 = lab.values.z1;\n  const rawZ2 = lab.values.z2;\n  const zLow = Math.min(rawZ1, rawZ2);\n  const zHigh = Math.max(rawZ1, rawZ2);\n  const discrete = lab.values.discrete;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const x0 = 56, x1 = W - 56, y0 = 26, y1 = H - 30;\n  const plotW = x1 - x0, plotH = y1 - y0;\n  const zMin = -4, zMax = 4;\n\n  const mapX = z => x0 + ((z - zMin) / (zMax - zMin)) * plotW;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let z = -4; z <= 4; z++) {\n    const px = mapX(z);\n    ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y1); ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const py = y0 + (i / 4) * plotH;\n    ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x1, py); ctx.stroke();\n  }\n\n  // X-axis labels\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  for (let z = -4; z <= 4; z++) {\n    ctx.fillText(z + 'σ', mapX(z) - 8, y1 + 15);\n  }\n\n  if (!discrete) {\n    // Continuous PDF + CDF mode\n    const mapPdfY = p => y1 - (p / 0.45) * plotH;\n    const mapCdfY = c => y1 - c * plotH;\n\n    // Shaded area under PDF\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.28)';\n    ctx.beginPath();\n    ctx.moveTo(mapX(zLow), y1);\n    for (let i = 0; i <= 120; i++) {\n      const z = zLow + (i / 120) * (zHigh - zLow);\n      ctx.lineTo(mapX(z), mapPdfY(pdf(z)));\n    }\n    ctx.lineTo(mapX(zHigh), y1);\n    ctx.closePath();\n    ctx.fill();\n\n    // PDF Curve\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const z = zMin + (i / 240) * (zMax - zMin);\n      const px = mapX(z), py = mapPdfY(pdf(z));\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    // CDF Curve\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const z = zMin + (i / 240) * (zMax - zMin);\n      const px = mapX(z), py = mapCdfY(phi(z));\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    // Markers at zLow and zHigh\n    const drawMarker = (z, label) => {\n      const px = mapX(z);\n      const cVal = phi(z);\n      const pyCdf = mapCdfY(cVal);\n      ctx.save();\n      ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';\n      ctx.setLineDash([4, 3]);\n      ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y1); ctx.stroke();\n      ctx.restore();\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath(); ctx.arc(px, pyCdf, 4.5, 0, Math.PI * 2); ctx.fill();\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillText(label + ': Φ=' + cVal.toFixed(4), Math.min(x1 - 78, Math.max(x0 + 4, px + 6)), Math.max(y0 + 14, pyCdf - 8));\n    };\n    drawMarker(zLow, 'z₁');\n    if (Math.abs(zHigh - zLow) > 0.05) drawMarker(zHigh, 'z₂');\n\n    // Axis legends\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('左轴: 概率密度 P(z)', x0, 16);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('右轴: 累积分布 Φ(z) ∈ [0, 1]', x1 - 155, 16);\n    ctx.fillStyle = '#38bdf8';\n    for (let c = 0; c <= 1.0; c += 0.25) {\n      ctx.fillText(c.toFixed(2), x1 + 6, mapCdfY(c) + 4);\n    }\n    ctx.fillStyle = '#10b981';\n    for (let p = 0; p <= 0.4; p += 0.1) {\n      ctx.fillText(p.toFixed(1), x0 - 26, mapPdfY(p) + 4);\n    }\n\n    const prob = (phi(zHigh) - phi(zLow)) * 100;\n    lab.setReadout('区间 [' + zLow.toFixed(1) + 'σ, ' + zHigh.toFixed(1) + 'σ]  |  Φ(z₁) = ' + phi(zLow).toFixed(4) + '  |  Φ(z₂) = ' + phi(zHigh).toFixed(4) + '  |  区间概率 = ' + prob.toFixed(2) + '%');\n  } else {\n    // Discrete PMF normalization comparison mode\n    const levels = [];\n    const step = 0.7;\n    let sumWrong = 0;\n    let sumRaw = 0;\n    for (let z = -3.5; z <= 3.501; z += step) {\n      const raw = Math.exp(-0.5 * z * z);\n      const wrong = pdf(z);\n      sumRaw += raw;\n      sumWrong += wrong;\n      levels.push({ z, raw, wrong });\n    }\n    const maxBar = 0.45;\n    const mapBarY = v => y1 - (v / maxBar) * plotH;\n\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('橙柱: 误套连续系数 1/√(2π)σ (总和 ≠ 1)', x0, 16);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('绿柱: 正确做法按总和归一化 (总和 = 1.0)', x0 + 275, 16);\n\n    const barW = 14;\n    let inRangeCorrect = 0;\n    levels.forEach(item => {\n      const correct = item.raw / sumRaw;\n      if (item.z >= zLow - 0.001 && item.z <= zHigh + 0.001) inRangeCorrect += correct;\n      const cx = mapX(item.z);\n\n      // Wrong bar\n      const yWrong = mapBarY(item.wrong);\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';\n      ctx.fillRect(cx - barW - 1, yWrong, barW, y1 - yWrong);\n\n      // Correct bar\n      const yCorr = mapBarY(correct);\n      const inBand = item.z >= zLow - 0.001 && item.z <= zHigh + 0.001;\n      ctx.fillStyle = inBand ? '#10b981' : 'rgba(16, 185, 129, 0.35)';\n      ctx.fillRect(cx + 1, yCorr, barW, y1 - yCorr);\n    });\n\n    ctx.fillStyle = '#10b981';\n    for (let p = 0; p <= 0.4; p += 0.1) {\n      ctx.fillText(p.toFixed(1), x0 - 26, mapBarY(p) + 4);\n    }\n\n    lab.setReadout('离散步长 Δz=0.7 (11个量化级)  |  直接套用连续系数总和 = ' + sumWrong.toFixed(4) + ' (非法!)  |  求和归一化后总和 = 1.0000  |  当前区间离散概率 = ' + (inRangeCorrect * 100).toFixed(2) + '%');\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【核心三数速记】标准正态分布中，信号落在 ±1σ、±2σ、±3σ 内的概率分别约为 68%、95% 和 99.75%；工程上常直接把 6σ ~ 8σ 当作高斯噪声的“表观峰峰值”（尽管严格意义上它的峰值无界）。",
        "【积分查表避坑】e^(-x²) 没有初等函数的原函数，千万别试图手推解析积分公式；工程计算区间概率一律查数值积分生成的 Φ(x) 表（或调用数学库的 erf 函数），通过 Φ(b) - Φ(a) 相减得到。",
        "【离散 PMF 归一化避坑】为 ADC 量化电平或直方图建立离散高斯 PMF 模型时，绝对不能直接套用连续 PDF 的 1/(√(2π)σ) 系数！必须先算出所有离散点未归一化的指数值 e^(-(x-μ)²/(2σ²))，再除以它们的总和，才能确保所有离散概率相加严格等于 1。"
      ]
    }
  ]
});
