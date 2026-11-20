window.__BOOK_REGISTER_SECTION__("sec_078", {
  "title": "中心极限定理与自卷积的高斯收敛 (The Central Limit Theorem)",
  "intuition": "无论单个随机过程或脉冲波形长得多么歪瓜裂枣，只要将大量独立过程不断相加（在信号处理中完全等价于脉冲的连续自卷积），最终结果都会以惊人的速度自动收敛成完美的高斯钟形曲线。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、自然界为什么偏爱高斯分布？",
      "paragraphs": [
        "在概率论与信号处理中，**中心极限定理（Central Limit Theorem, CLT）** 解释了一个令人着迷的事实：为什么自然界和工程系统里到处都是高斯（正态）分布？",
        "Steven W. Smith 在书中举了三个极其经典的例子：电子电路中**热噪声的振幅**呈高斯分布、**激光束横截面的光强**呈高斯分布，甚至连投飞镖时**靶心周围弹孔的落点分布**也是高斯的。它们背后的物理机制其实一模一样——**当一个可观测变量是由大量彼此独立的随机过程叠加而成时，无论单个分量的原始分布多么不规则（比如均匀分布、方波甚至双峰分布），它们的总和都会趋向高斯分布。**",
        "这和数字信号处理里的**卷积**有什么关系呢？在概率论中有一个基石结论：**两个独立随机变量之和的概率密度函数（PDF），等于它们各自概率密度函数的卷积**。因此，“把很多独立随机过程加在一起”与“让一个脉冲信号不断与自身做卷积”，在数学上是完全同一件事！"
      ],
      "formula": {
        "expr": "p_sum(x) = p_1(x) * p_2(x) * ... * p_N(x)",
        "explain": "p_i(x) 表示第 i 个非高斯随机过程的概率分布（或单个脉冲信号），星号 * 代表卷积运算；N 个独立过程相加后的总体分布，等价于 N 个分布函数的连续卷积。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：畸形脉冲的自卷积演化（复刻原书图 7-12）",
      "instruction": "拖动「自卷积次数」滑块从 0 增加到 8，观察图 7-12 中极不规则的脉冲如何仅在 3 次自卷积内就迅速“磨圆”为高斯曲线；调节「原始脉冲不规则度」可验证任何形状的脉冲都逃不过这个归宿。",
      "controls": [
        {
          "type": "slider",
          "id": "convCount",
          "label": "自卷积次数 k",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 0,
          "unit": " 次"
        },
        {
          "type": "slider",
          "id": "irregularity",
          "label": "原始脉冲不规则度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 85,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showGaussian",
          "label": "叠加等方差理论高斯曲线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction convolve(a, b) {\n  const out = new Array(a.length + b.length - 1).fill(0);\n  for (let i = 0; i < a.length; i++) {\n    for (let j = 0; j < b.length; j++) {\n      out[i + j] += a[i] * b[j];\n    }\n  }\n  return out;\n}\n\nfunction calcStats(arr, origin) {\n  let sum = 0;\n  for (let i = 0; i < arr.length; i++) sum += arr[i];\n  let mu = 0;\n  for (let i = 0; i < arr.length; i++) mu += (i - origin) * arr[i] / sum;\n  let v = 0;\n  for (let i = 0; i < arr.length; i++) {\n    const d = (i - origin) - mu;\n    v += d * d * arr[i] / sum;\n  }\n  return { sum, mu, sigma: Math.sqrt(v) };\n}\n\nfunction render() {\n  const k = lab.values.convCount;\n  const irr = lab.values.irregularity / 100;\n  const showG = lab.values.showGaussian;\n\n  const flat = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1];\n  const fig712 = [0.55, 1.15, 1.58, 1.64, 1.25, 0.88, 0.56, 0.65, 0.73, 0.82, 0.72];\n  const base = flat.map((v, i) => v * (1 - irr) + fig712[i] * irr);\n\n  const baseStats = calcStats(base, 5);\n  let sig = base.slice();\n  let origin = 5;\n  for (let step = 0; step < k; step++) {\n    sig = convolve(sig, base);\n    origin += 5;\n  }\n\n  const stats = calcStats(sig, origin);\n  let rawPeak = 0;\n  for (let i = 0; i < sig.length; i++) if (sig[i] > rawPeak) rawPeak = sig[i];\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 52, padR = 24, padT = 28, padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const baseY = padT + plotH;\n  const nMin = -28, nMax = 28;\n  const toX = (n) => padL + ((n - nMin) / (nMax - nMin)) * plotW;\n  const toY = (normAmp) => baseY - normAmp * plotH;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.textAlign = 'right';\n  for (let g = 0; g <= 4; g++) {\n    const y = toY(g * 0.25);\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n    ctx.fillText((g * 0.25).toFixed(2), padL - 6, y + 4);\n  }\n\n  ctx.textAlign = 'center';\n  for (let n = -25; n <= 25; n += 5) {\n    const x = toX(n);\n    ctx.beginPath();\n    ctx.moveTo(x, padT);\n    ctx.lineTo(x, baseY);\n    ctx.stroke();\n    ctx.fillText(String(n), x, baseY + 16);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(padL, baseY);\n  ctx.lineTo(W - padR, baseY);\n  ctx.stroke();\n\n  ctx.beginPath();\n  let started = false;\n  for (let n = nMin; n <= nMax; n++) {\n    const idx = n + origin;\n    const val = (idx >= 0 && idx < sig.length) ? sig[idx] / rawPeak : 0;\n    const x = toX(n);\n    const y = toY(val);\n    if (!started) { ctx.moveTo(x, baseY); ctx.lineTo(x, y); started = true; } else { ctx.lineTo(x, y); }\n  }\n  ctx.lineTo(toX(nMax), baseY);\n  ctx.closePath();\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';\n  ctx.fill();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let n = nMin; n <= nMax; n++) {\n    const idx = n + origin;\n    const val = (idx >= 0 && idx < sig.length) ? sig[idx] / rawPeak : 0;\n    const x = toX(n);\n    const y = toY(val);\n    if (n === nMin) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  for (let n = nMin; n <= nMax; n++) {\n    const idx = n + origin;\n    const val = (idx >= 0 && idx < sig.length) ? sig[idx] / rawPeak : 0;\n    if (val > 0.002 || (n >= -6 && n <= 6)) {\n      ctx.beginPath();\n      ctx.arc(toX(n), toY(val), 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  if (showG) {\n    const gaussPeak = stats.sum / (Math.sqrt(2 * Math.PI) * stats.sigma);\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.setLineDash([6, 4]);\n    ctx.beginPath();\n    const steps = 180;\n    for (let s = 0; s <= steps; s++) {\n      const n = nMin + (s / steps) * (nMax - nMin);\n      const gVal = (gaussPeak * Math.exp(-0.5 * Math.pow((n - stats.mu) / stats.sigma, 2))) / rawPeak;\n      const x = toX(n);\n      const y = toY(Math.min(1.08, gVal));\n      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.textAlign = 'left';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 归一化自卷积波形 (样本点)', padL + 8, 18);\n  if (showG) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('--- 等面积等方差理论高斯', padL + 210, 18);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.textAlign = 'right';\n  ctx.fillText('样本序号 n', W - padR, baseY + 28);\n\n  const theorySigma = baseStats.sigma * Math.sqrt(k + 1);\n  lab.setReadout(\n    '自卷积 ' + k + ' 次 (共 ' + (k + 1) + ' 个脉冲连卷) | 实测宽度 σ = ' +\n    stats.sigma.toFixed(2) + ' (理论 √' + (k + 1) + '×σ₀ = ' + theorySigma.toFixed(2) +\n    ') | 未归一化原始峰值: ' + rawPeak.toFixed(1)\n  );\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "二、极速收敛与“根号 N”展宽定律",
      "paragraphs": [
        "在实验 1 中你一定注意到了一个惊人的现象：即使原始脉冲刻意设计得左高右低、中间还凹下去一块（就像原书图 7-12a），只需自卷积 **1 次**（2 个脉冲相卷），尖锐的棱角就开始变得平滑对称；而当自卷积达到 **3 次**（4 个脉冲相卷，图 7-12c）时，波形就已经肉眼难辨地逼近一条完美的高斯曲线！用数学行话来说，这个收敛过程**极其迅速**。",
        "那么，连卷之后的高斯波形到底有多宽呢？根据统计学的方差可加性（独立过程相加时，方差 $\\sigma^2$ 直接线性相加），$N$ 个相同脉冲连卷（即进行了 $k = N-1$ 次自卷积）后，输出高斯的方差是单个原始脉冲方差的 $N$ 倍，因此其**标准差宽度 $\\sigma$** 只按**平方根**增长。原书在卷积次数较多时也直接表述为“结果高斯的宽度等于原脉冲宽度乘以卷积次数的平方根”。",
        "这个性质在 DSP 工程中是一个超级实用的**省算力绝招**：直接计算高精度高斯滤波核需要频繁调用耗时的指数函数 `exp()` 或借助 FFT；而利用中心极限定理，我们只需把最简单的**矩形滑动平均滤波器（Moving Average）**级联 3 到 4 次，就能以极低的计算代价（每次平均只需两次加减法），白嫖一个近乎完美的高斯低通滤波器！"
      ],
      "formula": {
        "expr": "σ_out = σ_0 · √N   (方差关系：σ_out² = N · σ_0²)",
        "explain": "σ_0 是单个原始脉冲的标准差宽度，N 是参与连卷的脉冲总个数（即进行了 N-1 次自卷积），σ_out 是输出高斯曲线的宽度。宽度增长远慢于线性倍增。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：非高斯波叠加趋近高斯（分布直方图 + 听觉实验室）",
      "instruction": "点击播放声音，并将「叠加独立信号路数 N」从 1 拖到 24：观察右侧振幅直方图如何从“U形双峰（单正弦波分布）”魔法般翻转为“高斯钟形曲线”，同时听觉从纯音啸叫渐变为电子热噪声。",
      "controls": [
        {
          "type": "slider",
          "id": "numProc",
          "label": "叠加独立信号路数 N",
          "min": 1,
          "max": 24,
          "step": 1,
          "value": 1,
          "unit": " 路"
        },
        {
          "type": "toggle",
          "id": "showGaussPdf",
          "label": "显示理论高斯密度曲线",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放叠加合成声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst fs = 44100;\nconst bufLen = 44100;\nconst freqs = [233, 281, 337, 397, 449, 509, 577, 643, 709, 787, 859, 937, 1013, 1091, 1171, 1249, 1327, 1409, 1487, 1567, 1657, 1741, 1823, 1907];\nconst phases = freqs.map((_, i) => ((i * 1.6180339887) % 1) * Math.PI * 2);\n\nconst samples = new Float32Array(bufLen);\nconst numBins = 48;\nconst xMin = -3.0, xMax = 3.0;\nconst binW = (xMax - xMin) / numBins;\nconst hist = new Float32Array(numBins);\n\nlet lastN = -1;\nlet srcNode = null;\nlet gainNode = null;\nlet scrollOffset = 0;\n\nfunction rebuild(N) {\n  if (N === lastN) return false;\n  lastN = N;\n  const invSqrtN = 1 / Math.sqrt(N);\n  hist.fill(0);\n  const twoPiOverFs = (Math.PI * 2) / fs;\n\n  for (let i = 0; i < bufLen; i++) {\n    let s = 0;\n    for (let k = 0; k < N; k++) {\n      s += Math.sin(twoPiOverFs * freqs[k] * i + phases[k]);\n    }\n    const val = s * invSqrtN;\n    samples[i] = val;\n    const b = Math.floor((val - xMin) / binW);\n    if (b >= 0 && b < numBins) hist[b]++;\n  }\n  for (let b = 0; b < numBins; b++) {\n    hist[b] = hist[b] / (bufLen * binW);\n  }\n  return true;\n}\n\nfunction syncAudio(shouldPlay, forceNewBuffer) {\n  if (!shouldPlay) {\n    if (srcNode) {\n      try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n      srcNode = null;\n    }\n    if (gainNode) {\n      try {\n        const ac = lab.getAudioContext();\n        gainNode.gain.setValueAtTime(0, ac.currentTime);\n      } catch (e) {}\n    }\n    return;\n  }\n\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!gainNode) {\n    gainNode = ac.createGain();\n    gainNode.connect(ac.destination);\n  }\n  if (!srcNode || forceNewBuffer) {\n    if (srcNode) {\n      try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    }\n    const ab = ac.createBuffer(1, bufLen, fs);\n    ab.getChannelData(0).set(samples);\n    srcNode = ac.createBufferSource();\n    srcNode.buffer = ab;\n    srcNode.loop = true;\n    srcNode.connect(gainNode);\n    srcNode.start();\n  }\n  gainNode.gain.setValueAtTime(0.15, ac.currentTime);\n}\n\nfunction draw() {\n  const N = lab.values.numProc;\n  const showPdf = lab.values.showGaussPdf;\n  ctx.clearRect(0, 0, W, H);\n\n  const lX = 20, lY = 28, lW = 315, lH = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -2; g <= 2; g++) {\n    const y = lY + lH * 0.5 - (g / 2.8) * (lH * 0.5);\n    ctx.beginPath();\n    ctx.moveTo(lX, y);\n    ctx.lineTo(lX + lW, y);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(lX, lY, lW, lH);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  const winLen = 900;\n  for (let i = 0; i < winLen; i++) {\n    const idx = (scrollOffset + i) % bufLen;\n    const x = lX + (i / (winLen - 1)) * lW;\n    const clamped = Math.max(-2.75, Math.min(2.75, samples[idx]));\n    const y = lY + lH * 0.5 - (clamped / 2.8) * (lH * 0.5);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域合成波形 (20ms 窗口，恒定 RMS)', lX, 18);\n\n  const rX = 370, rY = 28, rW = 330, rH = 178;\n  const maxDens = 0.85;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let d = 0; d <= 4; d++) {\n    const y = rY + rH - (d * 0.2 / maxDens) * rH;\n    ctx.beginPath();\n    ctx.moveTo(rX, y);\n    ctx.lineTo(rX + rW, y);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(rX, rY, rW, rH);\n\n  const barW = rW / numBins;\n  for (let b = 0; b < numBins; b++) {\n    const d = hist[b];\n    const capped = Math.min(maxDens, d);\n    const barH = (capped / maxDens) * rH;\n    ctx.fillStyle = d > maxDens ? '#ec4899' : 'rgba(56, 189, 248, 0.78)';\n    ctx.fillRect(rX + b * barW + 0.5, rY + rH - barH, Math.max(1, barW - 1), barH);\n  }\n\n  if (showPdf) {\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    const invSqrtPi = 1 / Math.sqrt(Math.PI);\n    for (let s = 0; s <= 120; s++) {\n      const v = xMin + (s / 120) * (xMax - xMin);\n      const pdf = invSqrtPi * Math.exp(-v * v);\n      const x = rX + (s / 120) * rW;\n      const y = rY + rH - (pdf / maxDens) * rH;\n      if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.fillText('振幅分布直方图 vs 理论高斯 (σ² = 0.5)', rX, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (let tick = -3; tick <= 3; tick++) {\n    const tx = rX + ((tick - xMin) / (xMax - xMin)) * rW;\n    ctx.fillText(String(tick), tx, rY + rH + 15);\n  }\n  ctx.fillText('瞬时振幅 x', rX + rW * 0.5, rY + rH + 29);\n  ctx.fillText('时间 t', lX + lW * 0.5, lY + lH + 29);\n}\n\nfunction updateAll() {\n  const N = lab.values.numProc;\n  const changed = rebuild(N);\n  syncAudio(lab.values.play, changed);\n  draw();\n  let desc = '高度趋近高斯热噪声';\n  if (N === 1) desc = '单正弦波 U形双峰分布 (极度非高斯)';\n  else if (N <= 3) desc = '多音混合过渡态 (峰值开始向中心聚拢)';\n  else if (N <= 8) desc = '已显现钟形轮廓 (接近高斯)';\n  lab.setReadout(\n    '叠加路数 N = ' + N + ' | 分布形态: ' + desc +\n    ' | 音频状态: ' + (lab.values.play ? '实时发声中' : '已静音')\n  );\n}\n\nlab.onUpdate(updateAll);\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    scrollOffset = (scrollOffset + Math.floor(dt * 2400)) % bufLen;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "廉价构造高斯滤波器的神技：嵌入式或实时信号处理中想做高斯平滑，千万别直接写耗时的 exp() 公式；把简单的矩形滑动平均滤波器级联 3~4 次，中心极限定理就会自动送给你一个平滑的近似高斯核。",
        "看清“自卷积次数”与“脉冲个数”：严格来说，k 次自卷积相当于 N = k + 1 个脉冲连卷，总方差按 N 倍线性增长，因此宽度按 √(k+1) 展宽；原书所说的“乘以卷积次数的平方根”是大数下的工程近似，写代码算第 1、2 次卷积的理论宽度时别漏掉 +1。",
        "切记系数归一化防止信号溢出：脉冲每做一次离散卷积，总能量/总面积都会按原脉冲之和的倍数放大（原书图 7-12 峰值从 1.6 飙到 1000+）。工程中做滤波时，必须让卷积核总和归一化为 1，否则数值会迅速饱和溢出。",
        "热噪声高斯的物理根源：电路中无论单个电子散射的微观机理多么不对称，只要宏观上观测的是亿万个独立随机微粒运动的叠加，结果就必然遵循高斯分布。"
      ]
    }
  ]
});
