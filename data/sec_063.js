window.__BOOK_REGISTER_SECTION__("sec_063", {
  "title": "脉冲函数与脉冲响应 (The Delta Function and Impulse Response)",
  "intuition": "把复杂信号拆成一个个孤立的“单点敲击”脉冲，只要测出系统对一次标准单位敲击的反应 h[n]，就能靠等比例缩放和平移推算出它对任何脉冲的响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "分而治之的起点：脉冲与单位脉冲 δ[n]",
      "paragraphs": [
        "在数字信号处理（DSP）中，面对一段复杂的信号，最核心的策略是**分而治之**：先把输入信号拆解成许多简单的可加分量，让每个分量单独通过线性系统，再把得到的输出相加，结果与直接让原信号通过系统完全相同。在众多拆解方式中，**脉冲分解（Impulse Decomposition）**与傅里叶分解并列为信号处理的两大支柱。",
        "所谓**脉冲（Impulse）**，就是一个除了某一个采样点非零之外、其余所有采样点全为零的离散信号。为了给所有脉冲确立一把统一的“度量尺”，DSP 引入了**德尔塔函数（Delta Function）**，用希腊字母 `δ[n]` 表示。",
        "`δ[n]` 是一个**归一化脉冲**：仅在采样编号 `n = 0` 的位置取值 `1`，在所有其他位置（`n ≠ 0`）取值全为 `0`。正因为它的幅值刚好为 1，人们也常称它为**单位脉冲（Unit Impulse）**。"
      ],
      "formula": {
        "expr": "δ[n] = 1 (当 n = 0)；δ[n] = 0 (当 n ≠ 0)",
        "explain": "n 是离散采样点的位置编号（整数）。δ[n] 就像数字世界里的一次标准“单位锤击”：只在第 0 拍响亮地敲出 1，其余时刻完全静止。"
      }
    },
    {
      "type": "concept",
      "heading": "任意脉冲的通用写法：平移与缩放",
      "paragraphs": [
        "现实信号中的脉冲不可能每次都刚好长在 `n = 0` 且高度正好为 `1`。好在**任何一个单点脉冲都可以写成 δ[n] 经过平移和缩放后的版本**。",
        "以原书给出的例子来说：假设信号 `a[n]` 除了第 8 号采样点值为 `-3` 之外，其余采样点全为 `0`。这等价于把标准单位脉冲 `δ[n]` **向右平移 8 个采样点**，再整体**乘以 -3**，记作 `a[n] = -3δ[n - 8]`。",
        "初学者最容易困惑的是为什么“向右移 8 格”括号里反而是减号 `n - 8`。你可以这样验证：`δ[...]` 只有当括号内部等于 `0` 时才爆发出数值 `1`。令 `n - 8 = 0`，解得 `n = 8`，所以这根脉冲正好落在第 8 格！"
      ],
      "formula": {
        "expr": "a[n] = A · δ[n - k]",
        "explain": "A 代表缩放倍数（决定脉冲的高度与正负方向）；k 代表向右平移的采样点数（k > 0 向右移，k < 0 向左移）。只有在 n = k 处信号值为 A，其余处全为 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：亲手构造与听辨平移缩放脉冲 A·δ[n - k]",
      "instruction": "拖动“幅度 A”与“右移样本数 k”滑块，观察离散脉冲如何精准落位与翻转，点击播放按钮可听辨参考脉冲与构造脉冲的强弱和时差。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "缩放幅度 A",
          "min": -3,
          "max": 3,
          "step": 0.5,
          "value": -3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "shift",
          "label": "右移样本数 k",
          "min": -5,
          "max": 15,
          "step": 1,
          "value": 8,
          "unit": " 格"
        },
        {
          "type": "toggle",
          "id": "showUnit",
          "label": "叠加参考单位脉冲 δ[n]",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲对比音",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet nextBeat = 0;\nlet pendingFlashAt = -1;\nlet flash = 0;\nlet refFlash = 0;\n\nfunction triggerClick(amp, freq, delaySec) {\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const now = ac.currentTime + (delaySec || 0);\n    const dur = 0.04;\n    const len = Math.floor(ac.sampleRate * dur);\n    const buf = ac.createBuffer(1, len, ac.sampleRate);\n    const data = buf.getChannelData(0);\n    for (let i = 0; i < len; i++) {\n      const t = i / ac.sampleRate;\n      data[i] = amp * Math.exp(-t * 180) * Math.sin(2 * Math.PI * freq * t);\n    }\n    const src = ac.createBufferSource();\n    src.buffer = buf;\n    const gain = ac.createGain();\n    gain.gain.value = 0.45;\n    src.connect(gain);\n    gain.connect(ac.destination);\n    src.start(now);\n  } catch (e) {}\n}\n\nfunction draw() {\n  const amp = Number(lab.values.amp);\n  const k = Math.round(Number(lab.values.shift));\n  const showUnit = Boolean(lab.values.showUnit);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const nMin = -6;\n  const nMax = 18;\n  const padL = 52;\n  const padR = 32;\n  const stepX = (W - padL - padR) / (nMax - nMin);\n  const y0 = 132;\n  const scaleY = 28;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px ui-monospace, monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  for (let v = -3; v <= 3; v++) {\n    const y = y0 - v * scaleY;\n    ctx.beginPath();\n    ctx.moveTo(padL - 8, y);\n    ctx.lineTo(W - padR + 8, y);\n    ctx.stroke();\n    ctx.fillText(String(v), padL - 14, y);\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(padL - 8, y0);\n  ctx.lineTo(W - padR + 8, y0);\n  ctx.stroke();\n\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  for (let n = nMin; n <= nMax; n++) {\n    const x = padL + (n - nMin) * stepX;\n    ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x, 30);\n    ctx.lineTo(x, H - 24);\n    ctx.stroke();\n    if (n % 2 === 0 || n === k) {\n      ctx.fillStyle = n === k ? '#38bdf8' : 'rgba(248,250,252,0.45)';\n      ctx.fillText(String(n), x, H - 18);\n    }\n  }\n\n  if (showUnit) {\n    const x0 = padL + (0 - nMin) * stepX;\n    const y1 = y0 - scaleY;\n    ctx.strokeStyle = refFlash > 0 ? '#f59e0b' : 'rgba(245,158,11,0.55)';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    ctx.moveTo(x0, y0);\n    ctx.lineTo(x0, y1);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = refFlash > 0 ? '#fbbf24' : 'rgba(245,158,11,0.85)';\n    ctx.beginPath();\n    ctx.arc(x0, y1, 4.5 + refFlash * 3, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'bottom';\n    ctx.fillText('δ[n]', x0, y1 - 7);\n  }\n\n  for (let n = nMin; n <= nMax; n++) {\n    if (n === k) continue;\n    const x = padL + (n - nMin) * stepX;\n    ctx.fillStyle = 'rgba(16,185,129,0.45)';\n    ctx.beginPath();\n    ctx.arc(x, y0, 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  const xk = padL + (k - nMin) * stepX;\n  const yk = y0 - amp * scaleY;\n  ctx.strokeStyle = flash > 0 ? '#7dd3fc' : '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(xk, y0);\n  ctx.lineTo(xk, yk);\n  ctx.stroke();\n\n  if (flash > 0) {\n    ctx.fillStyle = 'rgba(56,189,248,' + (0.35 * flash).toFixed(2) + ')';\n    ctx.beginPath();\n    ctx.arc(xk, yk, 12 * flash + 5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath();\n  ctx.arc(xk, yk, 5.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  const shiftExpr = k === 0 ? 'δ[n]' : (k > 0 ? 'δ[n-' + k + ']' : 'δ[n+' + (-k) + ']');\n  const ampStr = amp === 1 ? '' : (amp === -1 ? '-' : amp.toFixed(1).replace(/\\.0$/, ''));\n  const expr = 'a[n] = ' + (amp === 0 ? '0' : ampStr + shiftExpr);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px ui-monospace, monospace';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillText(expr, padL, 10);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('仅在 n = ' + k + ' 处为 ' + amp.toFixed(1).replace(/\\.0$/, '') + '，其余全为 0', W - padR, 12);\n\n  lab.setReadout('表达式: ' + expr + '  |  峰值位置 n = ' + k + '  |  幅度 A = ' + amp.toFixed(1));\n}\n\nlab.onUpdate(draw);\nlab.onLoop(function(dt, timeSec) {\n  const safeDt = Math.min(dt || 0.016, 0.1);\n  if (flash > 0) flash = Math.max(0, flash - safeDt * 3.5);\n  if (refFlash > 0) refFlash = Math.max(0, refFlash - safeDt * 3.5);\n\n  if (lab.values.play) {\n    if (timeSec >= nextBeat) {\n      nextBeat = timeSec + 0.95;\n      const amp = Number(lab.values.amp);\n      const k = Math.round(Number(lab.values.shift));\n      const showUnit = Boolean(lab.values.showUnit);\n      if (showUnit) {\n        triggerClick(0.35, 1600, 0);\n        refFlash = 1;\n      }\n      const delay = showUnit ? Math.max(0.08, (k + 6) * 0.025) : 0;\n      pendingFlashAt = timeSec + delay;\n      if (Math.abs(amp) > 0.01) {\n        triggerClick((amp / 3) * 0.9, 950, delay);\n      }\n    }\n    if (pendingFlashAt >= 0 && timeSec >= pendingFlashAt) {\n      flash = 1;\n      pendingFlashAt = -1;\n    }\n  } else {\n    nextBeat = timeSec;\n    pendingFlashAt = -1;\n  }\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "系统的“指纹”：脉冲响应 h[n] 与线性时不变魔法",
      "paragraphs": [
        "现在我们把单位脉冲 `δ[n]` 送进一个线性系统里，从系统另一端流出来的信号，就叫做该系统的**脉冲响应（Impulse Response）**。通常输入信号记作 `x[n]`，输出信号记作 `y[n]`，而脉冲响应习惯用 `h[n]` 表示（如果系统是一个具体滤波器，有时也会用更形象的 `f[n]`）。只要两个系统在任何方面有差异，它们的脉冲响应 `h[n]` 就一定不同。",
        "那么，如果输入系统的不是标准的 `δ[n]`，而是经过平移和缩放的脉冲（比如 `-3δ[n - 8]`），系统会输出什么呢？这时，线性系统的两大核心性质——**齐次性（Homogeneity）**和**移不变性（Shift Invariance）**——就发挥了威力：",
        "输入信号乘以多少倍、向右移动多少格，输出信号就会**一模一样地乘以相同倍数、向右移动相同格数**。既然输入 `δ[n]` 得到 `h[n]`，那么输入 `-3δ[n - 8]` 就必然直接得到 `-3h[n - 8]`。换句话说：**只要你测出系统的脉冲响应 h[n]，你就立刻知道它对任意脉冲会做出怎样的反应！**"
      ],
      "formula": {
        "expr": "若 δ[n] → h[n]，则 A · δ[n - k] → A · h[n - k]",
        "explain": "箭头表示“输入系统后产生输出”。A 倍的振幅缩放会直接等比传递给输出波形；k 格的时间平移会让整个脉冲响应波形原封不动地整体推迟 k 格出现。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：测绘系统响应——观察输入脉冲如何平移并缩放 h[n]",
      "instruction": "调整输入脉冲的幅度 A、位置 k 与系统的阻尼衰减率，观察上方输入脉冲 x[n] 如何把下方系统响应 y[n] 等比例缩放并同步右移；打开声音可聆听系统被敲击后的余振。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "输入幅度 A",
          "min": -2,
          "max": 2,
          "step": 0.2,
          "value": 1.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "shift",
          "label": "输入位置 k",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 4,
          "unit": " 格"
        },
        {
          "type": "slider",
          "id": "decay",
          "label": "系统阻尼衰减率",
          "min": 0.4,
          "max": 0.9,
          "step": 0.05,
          "value": 0.75,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "对比基准响应 h[n]",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 敲击系统听响应",
          "activeLabel": "⏸ 停止敲击"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet nextBeat = 0;\nlet waveGlow = 0;\n\nfunction hVal(m, decay) {\n  if (m < 0) return 0;\n  return Math.pow(decay, m) * Math.cos(m * 0.72);\n}\n\nfunction triggerPing(amp, decay) {\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const dur = 0.45;\n    const len = Math.floor(ac.sampleRate * dur);\n    const buf = ac.createBuffer(1, len, ac.sampleRate);\n    const data = buf.getChannelData(0);\n    const rate = (1 - decay) * 55 + 3;\n    for (let i = 0; i < len; i++) {\n      const t = i / ac.sampleRate;\n      data[i] = (amp / 2) * Math.exp(-t * rate) * Math.cos(2 * Math.PI * 520 * t);\n    }\n    const src = ac.createBufferSource();\n    src.buffer = buf;\n    const gain = ac.createGain();\n    gain.gain.value = 0.35;\n    src.connect(gain);\n    gain.connect(ac.destination);\n    src.start(ac.currentTime);\n  } catch (e) {}\n}\n\nfunction draw() {\n  const amp = Number(lab.values.amp);\n  const k = Math.round(Number(lab.values.shift));\n  const decay = Number(lab.values.decay);\n  const showRef = Boolean(lab.values.showRef);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const nMin = 0;\n  const nMax = 24;\n  const padL = 52;\n  const padR = 28;\n  const stepX = (W - padL - padR) / (nMax - nMin);\n\n  const yTop = 58;\n  const scaleTop = 19;\n  const yBot = 172;\n  const scaleBot = 22;\n\n  for (let n = nMin; n <= nMax; n++) {\n    const x = padL + n * stepX;\n    ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x, 22);\n    ctx.lineTo(x, H - 22);\n    ctx.stroke();\n    if (n % 2 === 0 || n === k) {\n      ctx.fillStyle = n === k ? '#38bdf8' : 'rgba(248,250,252,0.45)';\n      ctx.font = '10px ui-monospace, monospace';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'top';\n      ctx.fillText(String(n), x, H - 16);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(padL - 6, yTop); ctx.lineTo(W - padR + 6, yTop);\n  ctx.moveTo(padL - 6, yBot); ctx.lineTo(W - padR + 6, yBot);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(padL - 6, 110); ctx.lineTo(W - padR + 6, 110);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (showRef) {\n    const x0 = padL;\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(x0, yTop);\n    ctx.lineTo(x0, yTop - scaleTop);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = 'rgba(245,158,11,0.85)';\n    ctx.beginPath();\n    ctx.arc(x0, yTop - scaleTop, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  for (let n = nMin; n <= nMax; n++) {\n    const x = padL + n * stepX;\n    if (n === k) {\n      const yk = yTop - amp * scaleTop;\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 3;\n      ctx.beginPath();\n      ctx.moveTo(x, yTop);\n      ctx.lineTo(x, yk);\n      ctx.stroke();\n      ctx.fillStyle = waveGlow > 0.3 ? '#f8fafc' : '#38bdf8';\n      ctx.beginPath();\n      ctx.arc(x, yk, 5 + waveGlow * 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    } else {\n      ctx.fillStyle = 'rgba(56,189,248,0.35)';\n      ctx.beginPath();\n      ctx.arc(x, yTop, 2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  if (showRef) {\n    for (let n = nMin; n <= nMax; n++) {\n      const val = hVal(n, decay);\n      const x = padL + n * stepX;\n      const y = yBot - val * scaleBot;\n      ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n      ctx.lineWidth = 1.6;\n      ctx.setLineDash([3, 3]);\n      ctx.beginPath();\n      ctx.moveTo(x, yBot);\n      ctx.lineTo(x, y);\n      ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = 'rgba(245,158,11,0.7)';\n      ctx.beginPath();\n      ctx.arc(x, y, 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  for (let n = nMin; n <= nMax; n++) {\n    const val = amp * hVal(n - k, decay);\n    const x = padL + n * stepX;\n    const y = yBot - val * scaleBot;\n    const active = n >= k;\n    ctx.strokeStyle = active ? (waveGlow > 0 ? '#34d399' : '#10b981') : 'rgba(16,185,129,0.25)';\n    ctx.lineWidth = active ? 2.5 : 1;\n    ctx.beginPath();\n    ctx.moveTo(x, yBot);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n    ctx.fillStyle = active ? '#10b981' : 'rgba(16,185,129,0.4)';\n    ctx.beginPath();\n    ctx.arc(x, y, active ? 4 : 2.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  const shiftTag = k === 0 ? '[n]' : '[n-' + k + ']';\n  const ampStr = amp.toFixed(1).replace(/\\.0$/, '');\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px ui-monospace, monospace';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillText('输入 x[n] = ' + ampStr + '·δ' + shiftTag, padL, 6);\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('输出 y[n] = ' + ampStr + '·h' + shiftTag, padL, 117);\n\n  if (showRef) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'right';\n    ctx.fillText('虚线参考: δ[n] → h[n]', W - padR, 7);\n  }\n\n  lab.setReadout('LTI 映射: ' + ampStr + '·δ' + shiftTag + '  ⇒  ' + ampStr + '·h' + shiftTag + '  |  阻尼衰减 = ' + decay.toFixed(2));\n}\n\nlab.onUpdate(draw);\nlab.onLoop(function(dt, timeSec) {\n  const safeDt = Math.min(dt || 0.016, 0.1);\n  if (waveGlow > 0) waveGlow = Math.max(0, waveGlow - safeDt * 2.5);\n  if (lab.values.play) {\n    if (timeSec >= nextBeat) {\n      nextBeat = timeSec + 1.05;\n      const amp = Number(lab.values.amp);\n      const decay = Number(lab.values.decay);\n      if (Math.abs(amp) > 0.05) {\n        triggerPing(amp, decay);\n      }\n      waveGlow = 1;\n    }\n  } else {\n    nextBeat = timeSec;\n  }\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑指南（平移方向）：看到 δ[n - 8] 千万别往左移！令括号内 n - 8 = 0 解出 n = 8，因此减号代表向右延迟 8 个采样点，加号 δ[n + 8] 才是向左提前 8 格。",
        "归一化本质：δ[n] 是唯一的标准尺（只在 n = 0 处为 1，其余全 0），任何单点脉冲都能写作缩放系数与平移 δ 函数的乘积 A·δ[n - k]。",
        "核心结论（脉冲响应的价值）：h[n] 就是系统在“单位敲击” δ[n] 下的唯一指纹；借助线性与移不变性，测出 h[n] 就相当于彻底掌握了系统对任意平移、缩放脉冲的输出规律。"
      ]
    }
  ]
});
