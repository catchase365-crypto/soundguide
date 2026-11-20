window.__BOOK_REGISTER_SECTION__("sec_083", {
  "title": "周期-连续信号与傅里叶级数 (Periodic-Continuous)",
  "intuition": "在时间上毫无间断、且从负无穷到正无穷周而复始无限重复的连续波形，可以用一组离散频率的正弦与余弦波精确叠加出来，这就是傅里叶级数。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是「周期-连续」信号？",
      "paragraphs": [
        "在信号处理中，我们可以用两个维度给所有信号分类：时间轴是**连续（Continuous）**还是**离散（Discrete）**，以及波形是**周期（Periodic）**还是**非周期（Aperiodic）**。当一个信号同时满足「连续」与「周期」这两个条件时，它就属于 **Periodic-Continuous（周期-连续）** 类别。",
        "所谓**连续**，意味着在任意两个时间点之间都存在无数个瞬时值，时间轴没有采样间隔；所谓**周期**，意味着信号会以固定的时间间隔 `T`（周期）形成规律的图案，从负无穷（`-∞`）到正无穷（`+∞`）永无止境地自我复制。",
        "原书给出了最经典的三类例子：**正弦波（Sine waves）**、**方波（Square waves）**，以及任何在正负无穷之间以规律图案不断重复的连续波形。针对这一类信号所对应的傅里叶变换版本，在数学与工程上专门被称为**傅里叶级数（Fourier Series）**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：用连续正弦波叠出方波（傅里叶级数 + 实时听感）",
      "instruction": "拖动「叠加奇次谐波数量」与「基波频率」滑块，观察离散谐波如何逼近连续方波；点击播放按钮对比纯正弦波与多谐波方波的音色差异。",
      "controls": [
        {
          "type": "slider",
          "id": "harmonics",
          "label": "叠加奇次谐波数量 (N)",
          "min": 1,
          "max": 25,
          "step": 1,
          "value": 1,
          "unit": " 项"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "基波频率 (f₀)",
          "min": 110,
          "max": 440,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showHarmonics",
          "label": "显示各阶正弦分量",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听连续周期波形音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioCtx = null;\nlet osc = null;\nlet gainNode = null;\nlet phaseAnim = 0;\n\nfunction syncAudio() {\n  const play = !!lab.values.play;\n  const nHarm = lab.values.harmonics;\n  const freq = lab.values.freq;\n  try {\n    if (play) {\n      if (!audioCtx) audioCtx = lab.getAudioContext();\n      if (audioCtx && audioCtx.state === \"suspended\") audioCtx.resume();\n      if (audioCtx && !osc) {\n        osc = audioCtx.createOscillator();\n        gainNode = audioCtx.createGain();\n        gainNode.gain.setValueAtTime(0.14, audioCtx.currentTime);\n        osc.connect(gainNode);\n        gainNode.connect(audioCtx.destination);\n        osc.start();\n      }\n      if (audioCtx && osc) {\n        const maxK = 2 * nHarm - 1;\n        const real = new Float32Array(maxK + 1);\n        const imag = new Float32Array(maxK + 1);\n        for (let k = 1; k <= maxK; k += 2) {\n          imag[k] = 4 / (Math.PI * k);\n        }\n        const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });\n        osc.setPeriodicWave(wave);\n        osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.02);\n      }\n    } else {\n      if (osc) {\n        try { osc.stop(); } catch (e) {}\n        try { osc.disconnect(); } catch (e) {}\n        osc = null;\n      }\n      if (gainNode) {\n        try { gainNode.disconnect(); } catch (e) {}\n        gainNode = null;\n      }\n    }\n  } catch (e) {}\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const nHarm = lab.values.harmonics;\n  const freq = lab.values.freq;\n  const showComp = !!lab.values.showHarmonics;\n\n  ctx.clearRect(0, 0, w, h);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= w; gx += 45) {\n    ctx.beginPath();\n    ctx.moveTo(gx, 0);\n    ctx.lineTo(gx, h);\n    ctx.stroke();\n  }\n  for (let gy = 0; gy <= h; gy += 40) {\n    ctx.beginPath();\n    ctx.moveTo(0, gy);\n    ctx.lineTo(w, gy);\n    ctx.stroke();\n  }\n\n  const midY = h / 2;\n  const amp = 68;\n  const left = 36;\n  const right = w - 36;\n  const span = right - left;\n  const cycles = 1.5 + ((freq - 110) / 330) * 2.0;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.beginPath();\n  ctx.moveTo(left - 16, midY);\n  ctx.lineTo(right + 16, midY);\n  ctx.stroke();\n\n  ctx.fillStyle = \"rgba(248,250,252,0.65)\";\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"← -∞\", 6, midY - 8);\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"+∞ →\", w - 6, midY - 8);\n\n  ctx.strokeStyle = \"rgba(245,158,11,0.45)\";\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let px = 0; px <= span; px += 2) {\n    const theta = (px / span) * cycles * Math.PI * 2 + phaseAnim;\n    const s = Math.sin(theta) >= 0 ? 1 : -1;\n    const y = midY - s * amp;\n    if (px === 0) ctx.moveTo(left + px, y);\n    else ctx.lineTo(left + px, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (showComp) {\n    const showLimit = Math.min(nHarm, 7);\n    for (let i = 0; i < showLimit; i++) {\n      const k = 2 * i + 1;\n      ctx.strokeStyle = i % 2 === 0 ? \"rgba(56,189,248,0.35)\" : \"rgba(236,72,153,0.32)\";\n      ctx.lineWidth = 1.2;\n      ctx.beginPath();\n      for (let px = 0; px <= span; px += 2) {\n        const theta = (px / span) * cycles * Math.PI * 2 + phaseAnim;\n        const val = (4 / (Math.PI * k)) * Math.sin(k * theta);\n        const y = midY - val * amp;\n        if (px === 0) ctx.moveTo(left + px, y);\n        else ctx.lineTo(left + px, y);\n      }\n      ctx.stroke();\n    }\n  }\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (let px = 0; px <= span; px += 1.5) {\n    const theta = (px / span) * cycles * Math.PI * 2 + phaseAnim;\n    let sum = 0;\n    for (let i = 0; i < nHarm; i++) {\n      const k = 2 * i + 1;\n      sum += (4 / (Math.PI * k)) * Math.sin(k * theta);\n    }\n    const y = midY - sum * amp;\n    if (px === 0) ctx.moveTo(left + px, y);\n    else ctx.lineTo(left + px, y);\n  }\n  ctx.stroke();\n\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"━ 合成连续周期波 (Fourier Series)\", 44, 20);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.fillText(\"┄ 理想方波\", 248, 20);\n  if (showComp) {\n    ctx.fillStyle = \"#38bdf8\";\n    ctx.fillText(\"━ 奇次谐波分量\", 336, 20);\n  }\n\n  const maxHarmFreq = freq * (2 * nHarm - 1);\n  lab.setReadout(\"谐波项数: \" + nHarm + \" (最高 \" + (2 * nHarm - 1) + \" 次谐波 = \" + maxHarmFreq + \" Hz) | 基频 f₀ = \" + freq + \" Hz | 声音: \" + (lab.values.play ? \"播放中\" : \"已静音\"));\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    phaseAnim += dt * 3.2;\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "傅里叶级数的核心原理：连续波形与离散谐波",
      "paragraphs": [
        "为什么一个连续且无限重复的信号，可以拆成一串“彼此分开的”正弦波与余弦波？关键就在于**周期性**。",
        "假设信号的重复周期为 `T`，那么它的基波频率就是 `f₀ = 1/T`。为了让叠加出来的波也以同样的周期 `T` 严格重复，所有参与合成的正弦/余弦波，在时间 `T` 内必须恰好走完**整数个完整周期**——也就是说，它们的频率只能是基波频率的整数倍：`f₀, 2f₀, 3f₀, ..., kf₀`。",
        "这就是傅里叶级数最神奇的地方：**时间域是连续且周期的，而对应到频率域却变成了离散的谐波（只在 `k·f₀` 处有值）**。同时也需要注意，虽然傅里叶级数在数学推导和理论分析中极其强大，但数字计算机无法直接存储连续无穷长的信号，因此在计算机编程做 DSP 时，我们真正运行的是离散有限长度的算法，而将傅里叶级数作为理解连续周期规律的理论基石。"
      ],
      "formula": {
        "expr": "x(t) = a₀ + Σ [ aₖ cos(2π k f₀ t) + bₖ sin(2π k f₀ t) ]  (k = 1 到 ∞)",
        "explain": "x(t) 是连续周期信号；a₀ 是信号的直流平均值（DC 偏移）；f₀ = 1/T 是基波频率；k 为正整数倍谐波序号；aₖ 和 bₖ 分别是第 k 阶余弦与正弦谐波的幅度权重。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：无限周期延拓与单周期规律（图 8-2 直觉实验）",
      "instruction": "调节「重复周期 (T)」以及二次谐波的幅度与相位，观察任意连续形状如何在时间轴上毫无断点地向正负无穷复制延拓。",
      "controls": [
        {
          "type": "slider",
          "id": "period",
          "label": "重复周期 (T)",
          "min": 80,
          "max": 240,
          "step": 10,
          "value": 150,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "h2",
          "label": "二次谐波 (2f₀) 幅度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 55,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "phase2",
          "label": "二次谐波相位",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 45,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "highlightOne",
          "label": "高亮单个基本周期 [0, T]",
          "value": true
        }
      ],
      "jsCode": "function evalWave(u, h2Ratio, ph2Rad) {\n  const base = 0.55 * Math.sin(u) + 0.25 * Math.cos(3 * u - 0.6);\n  const h2 = h2Ratio * 0.45 * Math.sin(2 * u + ph2Rad);\n  return base + h2;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  const periodPx = lab.values.period;\n  const h2Ratio = lab.values.h2 / 100;\n  const ph2Rad = (lab.values.phase2 * Math.PI) / 180;\n  const highlightOne = !!lab.values.highlightOne;\n\n  ctx.clearRect(0, 0, w, h);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= w; gx += 40) {\n    ctx.beginPath();\n    ctx.moveTo(gx, 0);\n    ctx.lineTo(gx, h);\n    ctx.stroke();\n  }\n  for (let gy = 0; gy <= h; gy += 40) {\n    ctx.beginPath();\n    ctx.moveTo(0, gy);\n    ctx.lineTo(w, gy);\n    ctx.stroke();\n  }\n\n  const midY = h / 2 + 8;\n  const amp = 68;\n  const originX = w / 2 - periodPx / 2;\n\n  if (highlightOne) {\n    ctx.fillStyle = \"rgba(16,185,129,0.10)\";\n    ctx.fillRect(originX, 24, periodPx, h - 48);\n  }\n\n  ctx.strokeStyle = \"rgba(245,158,11,0.45)\";\n  ctx.setLineDash([4, 4]);\n  ctx.lineWidth = 1;\n  const minK = Math.floor((0 - originX) / periodPx);\n  const maxK = Math.ceil((w - originX) / periodPx);\n  for (let k = minK; k <= maxK; k++) {\n    const xLine = originX + k * periodPx;\n    if (xLine >= 20 && xLine <= w - 20) {\n      ctx.beginPath();\n      ctx.moveTo(xLine, 26);\n      ctx.lineTo(xLine, h - 22);\n      ctx.stroke();\n      ctx.fillStyle = \"rgba(245,158,11,0.85)\";\n      ctx.font = \"11px sans-serif\";\n      ctx.textAlign = \"center\";\n      const label = k === 0 ? \"0\" : k === 1 ? \"T\" : k + \"T\";\n      ctx.fillText(label, xLine, h - 8);\n    }\n  }\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.beginPath();\n  ctx.moveTo(20, midY);\n  ctx.lineTo(w - 20, midY);\n  ctx.stroke();\n\n  ctx.fillStyle = \"rgba(248,250,252,0.75)\";\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"← -∞ 无限重复\", 8, 20);\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"无限重复 +∞ →\", w - 8, 20);\n\n  ctx.lineWidth = 2.6;\n  let inHighlighted = false;\n  ctx.beginPath();\n  for (let x = 24; x <= w - 24; x += 1) {\n    const u = ((x - originX) / periodPx) * Math.PI * 2;\n    const y = midY - evalWave(u, h2Ratio, ph2Rad) * amp;\n    const isOne = highlightOne && x >= originX && x <= originX + periodPx;\n    if (x === 24) {\n      inHighlighted = isOne;\n      ctx.strokeStyle = inHighlighted ? \"#10b981\" : \"#38bdf8\";\n      ctx.moveTo(x, y);\n    } else if (isOne !== inHighlighted) {\n      ctx.lineTo(x, y);\n      ctx.stroke();\n      inHighlighted = isOne;\n      ctx.beginPath();\n      ctx.strokeStyle = inHighlighted ? \"#10b981\" : \"#38bdf8\";\n      ctx.moveTo(x, y);\n    } else {\n      ctx.lineTo(x, y);\n    }\n  }\n  ctx.stroke();\n\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = \"center\";\n  if (highlightOne) {\n    ctx.fillStyle = \"#10b981\";\n    ctx.fillText(\"单个基本周期 [0, T]\", originX + periodPx / 2, 20);\n  }\n\n  const visPeriods = ((w - 48) / periodPx).toFixed(2);\n  lab.setReadout(\"周期宽度 T = \" + periodPx + \" px (当前视口含 \" + visPeriods + \" 个周期) | 2次谐波幅度 = \" + lab.values.h2 + \"% | 相位 = \" + lab.values.phase2 + \"° | 特性: 连续且向正负无穷重复\");\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "名称别搞混：四大傅里叶变换的名称是历史演化的结果——「周期 + 连续」信号对应的傅里叶变换专门叫做**傅里叶级数（Fourier Series）**，不要把它和仅针对非周期连续信号的“傅里叶变换”混为一谈。",
        "波形定义在正负无穷：真正的 Periodic-Continuous 信号（如理想正弦波、理想方波）没有起点也没有终点，不能只截取一段就认为它是非周期的；只要波形以固定周期 T 无限重复，它就属于这一类。",
        "尖锐跳变需要无穷多高频谐波：正如实验 1 中看到的，方波的垂直跳变沿是由无穷多个高次奇次谐波叠加而成的，谐波数越多边缘越陡峭，听感也越明亮尖锐。",
        "理论工具 vs 计算机实现：傅里叶级数属于连续数学的范畴，你在做理论推导和公式作业时会频繁用到它，但在数字计算机编写 DSP 代码时无法直接处理连续无限的数据。"
      ]
    }
  ]
});
