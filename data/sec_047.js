window.__BOOK_REGISTER_SECTION__("sec_047", {
  "title": "数字精度与舍入误差 (Number Precision)",
  "intuition": "有限的二进制位就像一把刻度尺：定点数刻度均匀但量程有限，浮点数刻度随数值等比缩放（大数步子大、小数步子小），而反复运算会让微小的舍入误差像滚雪球一样漂移甚至酿成程序 Bug。",
  "blocks": [
    {
      "type": "concept",
      "heading": "数值表示的本质就是“量化”：定点数 vs. 浮点数",
      "paragraphs": [
        "计算机里的数字表示误差，本质上和 ADC 模数转换时的**量化误差 (Quantization Error)** 完全一致。真实世界需要存储连续范围的数值，但无论格式怎么设计，有限的比特位只能表达有限个离散的量化台阶。每当一次数学运算产生新结果时，都必须**四舍五入 (Round)** 到当前格式能存下的最近刻度上。",
        "以最常见的 **32 位 (32-bit)** 存储为例，二进制一共能组合出 $2^{32} = 4,294,967,296$ 种不同的比特模式，也就是说它最多只能精确表示约 42.9 亿个不同的数。不同编码格式只是在决定“把这 42.9 亿个刻度怎么分布”：",
        "1. **32 位定点长整型 (`long integer`, 二进制补码)**：把所有刻度均匀铺在 `-2,147,483,648` 到 `2,147,483,647` 之间，任意两个相邻可表示数之间的间距永远严格等于 **1**。",
        "2. **32 位单精度浮点数 (`single precision float`)**：把同样的 42.9 亿个刻度拉伸铺满从 $-3.4 \\times 10^{38}$ 到 $+3.4 \\times 10^{38}$ 的巨大范围。代价是相邻数字之间的间距不再固定，而是与数值本身的大小成正比——**大数之间缝隙巨大，小数之间缝隙极小**。随机挑一个浮点数，它和相邻刻度之间的间距大约比它自身小一千万倍（精确范围是该数值的 $2^{-24}$ 到 $2^{-23}$ 倍，即大约 **800 万分之一到 1700 万分之一**）。"
      ],
      "formula": {
        "expr": "2^{-24} \\cdot |X| \\le \\Delta X_{\\text{float32}} \\le 2^{-23} \\cdot |X|",
        "explain": "|X| 为当前浮点数的绝对值；ΔX 为相邻两个可表示单精度浮点数之间的步进间距（Spacing）。它始终落在数值本身的约 1/1700 万到 1/800 万之间。"
      }
    },
    {
      "type": "lab",
      "heading": "实验室 1：单精度浮点的“弹性刻度尺”探针",
      "instruction": "拖动「数量级指数」和「尾数微调」滑块，实时观察 IEEE-754 单精度浮点数在当前数值附近的真实相邻刻度与间距比例（复现原书图 4-3），并留意突破 ±1680 万（2^24）分界线后的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "exp",
          "label": "数量级指数 (10^x)",
          "min": -5,
          "max": 8.5,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "mant",
          "label": "尾数微调",
          "min": 1,
          "max": 9.9,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showInt",
          "label": "对比定点数间距 (=1)",
          "value": true
        }
      ],
      "jsCode": "const buf = new ArrayBuffer(4);\nconst f32 = new Float32Array(buf);\nconst u32 = new Uint32Array(buf);\n\nfunction fmtNum(v) {\n  if (v >= 1e6) return v.toFixed(1);\n  if (v >= 100) return v.toFixed(7);\n  if (v >= 1) return v.toFixed(9);\n  return v.toFixed(14);\n}\n\nfunction fmtGap(g) {\n  if (g >= 1) return g.toFixed(1);\n  if (g >= 1e-5) return g.toFixed(7);\n  if (g >= 1e-8) return g.toFixed(9);\n  return g.toFixed(14);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const raw = lab.values.mant * Math.pow(10, lab.values.exp);\n  f32[0] = raw;\n  const baseBits = u32[0];\n  const vals = [];\n  for (let i = 0; i < 4; i++) {\n    u32[0] = baseBits + i;\n    vals.push(f32[0]);\n  }\n  const gap = vals[1] - vals[0];\n  const ratioM = (vals[0] / gap) / 1e6;\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('相邻 4 个可表示单精度浮点数 (IEEE-754 Float32)', 22, 26);\n\n  ctx.font = '15px monospace';\n  for (let i = 0; i < 4; i++) {\n    const y = 62 + i * 32;\n    ctx.fillStyle = i === 0 ? '#10b981' : '#f8fafc';\n    ctx.fillText(fmtNum(vals[i]), 28, y);\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(220, 56); ctx.lineTo(232, 56);\n  ctx.lineTo(232, 88); ctx.lineTo(220, 88);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 13px monospace';\n  ctx.fillText('间距 = ' + fmtGap(gap), 242, 70);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('(约 ' + ratioM.toFixed(1) + ' 百万分之一)', 242, 90);\n\n  const rx = 415, rw = 280;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('刻度尺度对比与 2^24 (1677万) 整数界线', rx, 26);\n\n  const rulerY = 85;\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(rx, rulerY); ctx.lineTo(rx + rw, rulerY); ctx.stroke();\n  for (let i = 0; i < 4; i++) {\n    const tx = rx + 25 + i * 75;\n    ctx.strokeStyle = '#10b981';\n    ctx.beginPath(); ctx.moveTo(tx, rulerY - 12); ctx.lineTo(tx, rulerY + 12); ctx.stroke();\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px monospace';\n    ctx.fillText('+' + i + ' ULP', tx - 18, rulerY + 26);\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px monospace';\n  ctx.fillText('<-- ' + fmtGap(gap) + ' -->', rx + 50, rulerY - 18);\n\n  const barY = 152, barW = rw, barH = 14;\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(rx, barY, barW, barH);\n  const logMin = -5, logMax = 8.5;\n  const normPos = Math.max(0, Math.min(1, (Math.log10(vals[0]) - logMin) / (logMax - logMin)));\n  const threshPos = (Math.log10(16777216) - logMin) / (logMax - logMin);\n\n  ctx.fillStyle = vals[0] <= 16777216 ? '#10b981' : '#ec4899';\n  ctx.fillRect(rx, barY, normPos * barW, barH);\n\n  const tx24 = rx + threshPos * barW;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(tx24, barY - 6); ctx.lineTo(tx24, barY + barH + 6); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('2^24 (1677万)', tx24 - 44, barY - 10);\n\n  ctx.fillStyle = vals[0] > 16777216 ? '#ec4899' : '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  const statusMsg = vals[0] > 16777216\n    ? '间距 > 1：部分整数已无法精确表示！'\n    : '间距 <= 1：区间内所有整数均无舍入误差';\n  ctx.fillText(statusMsg, rx, barY + 34);\n\n  if (lab.values.showInt) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    const cmp = gap < 1\n      ? '定点数间距(1) 是当前浮点间距的 ' + (1 / gap).toExponential(1) + ' 倍'\n      : '当前浮点间距已放大到定点间距(1)的 ' + gap.toFixed(1) + ' 倍';\n    ctx.fillText(cmp, rx, barY + 54);\n  }\n\n  lab.setReadout('当前 Float32: ' + fmtNum(vals[0]) + '  |  间距: ' + fmtGap(gap) + '  |  相对精度: 1 / ' + ratioM.toFixed(2) + 'M');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "为什么小信号在定点数里会失真，而浮点数却能稳住？",
      "paragraphs": [
        "浮点数的“弹性刻度”在数字信号处理中有一个巨大的物理优势：**宽动态范围下的信噪比保护**。因为定点数相邻两个数值的间距永远是 1（或某个固定最小步长），当信号幅值很小时，信号本身只跨越了区区几个量化台阶，相对量化误差会急剧恶化，听起来就像充满刺耳的颗粒感或直接变成死寂。",
        "相反，浮点数的量化台阶会随着信号幅值等比例缩小。只要信号还在指数可表示的范围内，无论它是宏大的爆音还是微弱的余音，其相对间距始终保持在大约千万分之一的水平，从而保住了波形的细腻度。"
      ],
      "formula": {
        "expr": "\\text{SNR}_{\\text{float}} \\approx \\text{常数（与信号幅度无关）}, \\quad \\text{SNR}_{\\text{fixed}} \\propto A_{\\text{signal}}^2",
        "explain": "在定点数中，信号幅度 A 越小，固定台阶带来的相对噪声越大；而在浮点数中，台阶随 A 同步缩放，信噪比几乎不随信号变小而塌缩。"
      }
    },
    {
      "type": "lab",
      "heading": "实验室 2：小信号下的定点 vs. 浮点量化对比（含实时试听）",
      "instruction": "把「输入信号衰减」拉低到 -24 dB 或 -36 dB，然后切换「定点 / 浮点」模式并点击「试听量化后声音」：对比右侧放大波形的台阶失真，并亲耳听听定点量化噪声与浮点平滑缩放的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "ampDb",
          "label": "输入信号衰减",
          "min": -40,
          "max": 0,
          "step": 2,
          "value": -24,
          "unit": " dB"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "模拟等效位深",
          "min": 4,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "useFloat",
          "label": "开启=浮点模式 / 关闭=定点模式",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听量化后声音",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const audioState = { src: null, gain: null };\n\nfunction quantize(x, bits, isFloat) {\n  if (!isFloat) {\n    const step = 1 / Math.pow(2, bits - 1);\n    const q = Math.round(x / step) * step;\n    return Math.max(-1, Math.min(1 - step, q));\n  }\n  if (Math.abs(x) < 1e-7) return 0;\n  const s = x < 0 ? -1 : 1;\n  const ax = Math.abs(x);\n  const exp = Math.floor(Math.log2(ax));\n  const scale = Math.pow(2, exp);\n  const norm = ax / scale;\n  const mBits = Math.max(2, bits - 3);\n  const mStep = 1 / Math.pow(2, mBits);\n  const qNorm = Math.round((norm - 1) / mStep) * mStep + 1;\n  return s * qNorm * scale;\n}\n\nfunction stopAudio() {\n  if (audioState.src) {\n    try { audioState.src.stop(); } catch (e) {}\n    audioState.src.disconnect();\n    audioState.src = null;\n  }\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!audioState.gain) {\n    audioState.gain = ac.createGain();\n    audioState.gain.connect(ac.destination);\n  }\n  stopAudio();\n  const sr = ac.sampleRate;\n  const dur = 0.25;\n  const len = Math.floor(sr * dur);\n  const buf = ac.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n  const freq = 220;\n  const amp = Math.pow(10, lab.values.ampDb / 20);\n  const bits = lab.values.bits;\n  const isFloat = lab.values.useFloat;\n  const makeup = Math.min(6, Math.pow(10, -lab.values.ampDb / 40));\n  audioState.gain.gain.value = 0.28 * makeup;\n  for (let i = 0; i < len; i++) {\n    const x = amp * Math.sin(2 * Math.PI * freq * i / sr);\n    data[i] = quantize(x, bits, isFloat);\n  }\n  const src = ac.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(audioState.gain);\n  src.start();\n  audioState.src = src;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 40; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 40; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const amp = Math.pow(10, lab.values.ampDb / 20);\n  const bits = lab.values.bits;\n  const isFloat = lab.values.useFloat;\n\n  // Left panel: quantization grid across full [-1, 1]\n  const lx = 20, lw = 310, ly = 36, lh = 180;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(isFloat ? '浮点刻度分布（越近零越密）' : '定点刻度分布（全量程等距）', lx, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  const midY = ly + lh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx, midY); ctx.lineTo(lx + lw, midY); ctx.stroke();\n\n  // Draw signal band [-amp, amp]\n  const bandH = amp * (lh / 2);\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';\n  ctx.fillRect(lx, midY - bandH, lw, bandH * 2);\n\n  if (!isFloat) {\n    const levels = Math.pow(2, bits - 1);\n    const drawStep = Math.max(1, Math.floor(levels / 32));\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n    for (let k = -levels; k <= levels; k += drawStep) {\n      const y = midY - (k / levels) * (lh / 2);\n      ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n    }\n  } else {\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';\n    for (let e = -6; e <= -1; e++) {\n      const val = Math.pow(2, e);\n      const dy = val * (lh / 2);\n      ctx.beginPath(); ctx.moveTo(lx, midY - dy); ctx.lineTo(lx + lw, midY - dy); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(lx, midY + dy); ctx.lineTo(lx + lw, midY + dy); ctx.stroke();\n    }\n  }\n\n  // Plot full-scale signal\n  ctx.strokeStyle = isFloat ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= lw; i++) {\n    const x = amp * Math.sin((i / lw) * Math.PI * 4);\n    const q = quantize(x, bits, isFloat);\n    const py = midY - q * (lh / 2);\n    if (i === 0) ctx.moveTo(lx + i, py); else ctx.lineTo(lx + i, py);\n  }\n  ctx.stroke();\n\n  // Right panel: Auto-zoomed comparison\n  const rx = 365, rw = 335, ry = 36, rh = 180;\n  const rMidY = ry + rh / 2;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('自动放大观察 (满格 = ±' + amp.toFixed(4) + ') + 误差残差', rx, 22);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  const scaleY = (rh * 0.42) / Math.max(amp, 1e-4);\n  let errSq = 0, sigSq = 0;\n\n  // Ideal dashed\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= rw; i++) {\n    const x = amp * Math.sin((i / rw) * Math.PI * 4);\n    const py = rMidY - x * scaleY;\n    if (i === 0) ctx.moveTo(rx + i, py); else ctx.lineTo(rx + i, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Quantized solid\n  ctx.strokeStyle = isFloat ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= rw; i++) {\n    const x = amp * Math.sin((i / rw) * Math.PI * 4);\n    const q = quantize(x, bits, isFloat);\n    const py = rMidY - q * scaleY;\n    if (i === 0) ctx.moveTo(rx + i, py); else ctx.lineTo(rx + i, py);\n    sigSq += x * x;\n    errSq += (q - x) * (q - x);\n  }\n  ctx.stroke();\n\n  // Error wave in pink\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (let i = 0; i <= rw; i++) {\n    const x = amp * Math.sin((i / rw) * Math.PI * 4);\n    const q = quantize(x, bits, isFloat);\n    const py = rMidY - (q - x) * scaleY;\n    if (i === 0) ctx.moveTo(rx + i, py); else ctx.lineTo(rx + i, py);\n  }\n  ctx.stroke();\n\n  const snr = errSq > 1e-16 ? 10 * Math.log10(sigSq / errSq) : 99;\n  lab.setReadout('模式: ' + (isFloat ? '浮点' : '定点') + ' (' + bits + '-bit)  |  信号幅度: ' + amp.toFixed(4) + ' (' + lab.values.ampDb + ' dB)  |  量化信噪比 SNR: ' + snr.toFixed(1) + ' dB');\n  updateAudio();\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "舍入误差的雪球效应：随机游走 vs. 单向累加",
      "paragraphs": [
        "单次运算的舍入误差微不足道，但在 DSP 循环中，一个变量往往要经历成千上万次连续算术运算。原书表 4-1 展示了一个经典实验：把 `X` 初始化为 `1`，然后循环 2000 次，每次先加上两个随机数 `A` 和 `B`，再减去 `A` 和 `B`。理论上 `X` 应该纹丝不动地保持为 `1`，但实际上每次加减产生的微小舍入误差都会残留下来，导致 `X` 逐渐漂离初值。",
        "误差积累有两种截然不同的形态：",
        "1. **随机误差 (Random Error)**：每次舍入的正负号随机出现，误差互相抵消，总漂移量只与运算次数 $N$ 的**平方根** $\\sqrt{N}$ 成正比。",
        "2. **累加误差 (Additive Error)**：每次舍入误差的符号偏向同一侧，误差单向叠加，总漂移量直接等于单次误差乘以**总运算次数** $N$。在常见 DSP 算法里，累加误差往往比随机误差恶劣**数百倍**！",
        "更棘手的是，你几乎无法预测或控制一个算法会触发哪种模式。在表 4-1 中，仅把 `A = RND`（0~1 均匀分布）改成 `A = EXP(RND)`（1~2.718 指数分布），误差形态就会立刻从累加漂移切换为随机游走。因此工程上必须按最坏情况（累加误差，且单次平均误差约占量化台阶的 1/4）估算：**单精度浮点数**每经过一次运算，按大约 **4000 万分之一** 的相对误差累积；**双精度浮点数**则按大约 **4 京分之一（$4 \\times 10^{16}$ 分之一）** 累积。"
      ],
      "formula": {
        "expr": "\\varepsilon_{\\text{single, max}} \\approx \\frac{N_{\\text{ops}}}{4 \\times 10^7}, \\quad \\varepsilon_{\\text{double, max}} \\approx \\frac{N_{\\text{ops}}}{4 \\times 10^{16}}",
        "explain": "N_ops 为变量经历的总运算次数。按最坏累加模式与 1/4 台阶均值估算，单精度约每运算 1 次累积 1/4000 万的相对误差，双精度约 1/4 京。"
      }
    },
    {
      "type": "lab",
      "heading": "实验室 3：复现图 4-4——随机漂移与累加漂移的竞赛",
      "instruction": "拖动「循环次数 N」和「随机种子」，观察 2000 次 `X + A + B - A - B` 后变量 X 如何偏离 1.0000：蓝色随机误差在 1.0 附近震荡（~√N），而琥珀色累加误差沿着理论最坏斜率（~N）直线上窜。",
      "controls": [
        {
          "type": "slider",
          "id": "loops",
          "label": "循环次数 (N)",
          "min": 200,
          "max": 2000,
          "step": 100,
          "value": 2000,
          "unit": " 次"
        },
        {
          "type": "slider",
          "id": "seed",
          "label": "随机种子",
          "min": 1,
          "max": 20,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showBound",
          "label": "显示 1/(4000万)×运算数 最坏包络",
          "value": true
        }
      ],
      "jsCode": "function makeRng(seed) {\n  let s = seed >>> 0;\n  return function() {\n    s += 0x6D2B79F5;\n    let t = Math.imul(s ^ (s >>> 15), 1 | s);\n    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\n\nfunction f32Biased(v) {\n  const ax = Math.abs(v);\n  if (ax === 0) return 0;\n  const exp = Math.floor(Math.log2(ax));\n  const ulp = Math.pow(2, exp - 23);\n  return Math.round(v / ulp + 0.21) * ulp;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const px = 72, py = 24, pw = 610, ph = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const x = px + (i / 4) * pw;\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const y = py + (i / 4) * ph;\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.4)';\n  ctx.strokeRect(px, py, pw, ph);\n\n  const yMin = 0.9998, yMax = 1.00025;\n  const toY = v => py + ph - ((v - yMin) / (yMax - yMin)) * ph;\n  const base1Y = toY(1.0);\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.beginPath(); ctx.moveTo(px, base1Y); ctx.lineTo(px + pw, base1Y); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px monospace';\n  const ticks = [1.0002, 1.0001, 1.0000, 0.9999, 0.9998];\n  for (const t of ticks) {\n    ctx.fillText(t.toFixed(4), 14, toY(t) + 4);\n  }\n  for (let i = 0; i <= 4; i++) {\n    const val = Math.round((i / 4) * lab.values.loops);\n    ctx.fillText(String(val), px + (i / 4) * pw - 10, py + ph + 16);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('循环次数', px + pw / 2 - 24, py + ph + 30);\n\n  const N = lab.values.loops;\n  const rng1 = makeRng(lab.values.seed * 137);\n  const rng2 = makeRng(lab.values.seed * 137 + 99);\n\n  let xAdd = 1.0;\n  let xRand = 1.0;\n  const addPts = [1.0];\n  const randPts = [1.0];\n\n  for (let i = 0; i < N; i++) {\n    const a1 = Math.fround(rng1());\n    const b1 = Math.fround(rng1());\n    xAdd = f32Biased(xAdd + a1);\n    xAdd = f32Biased(xAdd + b1);\n    xAdd = f32Biased(xAdd - a1);\n    xAdd = f32Biased(xAdd - b1);\n    addPts.push(xAdd);\n\n    const a2 = Math.fround(Math.exp(rng2()));\n    const b2 = Math.fround(Math.exp(rng2()));\n    xRand = Math.fround(xRand + a2);\n    xRand = Math.fround(xRand + b2);\n    xRand = Math.fround(xRand - a2);\n    xRand = Math.fround(xRand - b2);\n    randPts.push(xRand);\n  }\n\n  if (lab.values.showBound) {\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, toY(1.0));\n    ctx.lineTo(px + pw, toY(1.0 + (N * 4) / 40000000));\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  // Additive curve\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const x = px + (i / N) * pw;\n    const y = toY(addPts[i]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Random curve\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const x = px + (i / N) * pw;\n    const y = toY(randPts[i]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Legend\n  ctx.fillStyle = '#f59e0b'; ctx.fillRect(px + 18, py + 12, 16, 3);\n  ctx.fillStyle = '#f8fafc'; ctx.font = '12px sans-serif';\n  ctx.fillText('累加误差 (正偏置叠加)', px + 40, py + 17);\n\n  ctx.fillStyle = '#10b981'; ctx.fillRect(px + 18, py + 32, 16, 3);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('随机误差 (正负互相抵消)', px + 40, py + 37);\n\n  if (lab.values.showBound) {\n    ctx.fillStyle = '#ec4899'; ctx.fillRect(px + 18, py + 52, 16, 2);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText('经验最坏上界: 1 + 4N / 4000万', px + 40, py + 57);\n  }\n\n  lab.setReadout('N = ' + N + ' 次循环 (4N=' + (N * 4) + '次运算)  |  累加模式终点 X = ' + xAdd.toFixed(6) + '  |  随机模式终点 X = ' + xRand.toFixed(6));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "循环控制的常见 Bug 与二进制的“天生盲区”",
      "paragraphs": [
        "舍入误差最令人抓狂的后果之一，就藏在看似人畜无害的 `FOR-NEXT` 循环里（原书表 4-2）。假设你想打印从 0 到 10、步长为 `0.01` 的 1001 个数：`FOR X = 0 TO 10 STEP 0.01`。每轮循环结束，计算机都会把 `0.01` 加到浮点变量 `X` 上，然后判断 `X` 是否大于终止值 `10.0`。",
        "问题在于十进制小数 `0.01`（以及 `0.1`、`1.1` 这类 10 的幂次小数）在二进制里是无限循环小数，无法被精确存储！上千次累加后，舍入误差在末尾滚雪球到了 `0.000133`。于是最后一次循环本该到达 `10.0`，计算机算出来的 `X` 却是 `10.000133`。因为它大于 `10.0`，循环**提前终止**，最后一个数 `10.00` 就这么神秘消失了。",
        "解决之道非常简单：**整数的加、减、乘运算结果永远是精确的整数，绝对不存在舍入误差！** 正确的写法是用整数变量 `I%` 控制循环（`FOR I% = 0 TO 1000`），在循环体内再计算 `X = I% / 100`。这样最后一次循环一定能稳稳执行，绝不会脱靶。",
        "记住两条工程铁律：第一，如果非要用浮点数做步进，请优先选用 **2 的幂次分数**（如 `1/2`, `1/4`, `1/8 = 0.125`, `3/8`），因为它们在二进制中有精确表示（例如 `1.125` 精确等于 `1.001 × 2^0`），不会像 `1.1` 那样每次遇到都自带误差；第二，单精度浮点数能精确表示 **±1680 万（精确值为 $\\pm 2^{24} = \\pm 16,777,216$）** 以内的每一个整数，在此范围内用浮点数对整数做加减乘同样零舍入误差。"
      ],
      "formula": {
        "expr": "I\\% \\in [0, 1000] \\implies X = \\frac{I\\%}{100} \\quad (\\text{绝不用 } X \\mathrel{+}= 0.01)",
        "explain": "用整数索引 I% 承担全部累加计数，彻底消除步长 0.01 的二进制表示误差；仅在需要输出或参与浮点计算时再做一次除法转换。"
      }
    },
    {
      "type": "lab",
      "heading": "实验室 4：表 4-2 调试台——为什么 STEP 0.01 会“吃掉”终点 10.00？",
      "instruction": "观察默认「STEP 0.01」在 10.00 处因累计误差 +0.000133 而提前终止打印 `9.990133` 的过程；尝试开启「改用 2 的幂次步长 (0.125)」或调整「目标终点」，看看整数参考线与 2 的幂次步长如何彻底消除脱靶 Bug。",
      "controls": [
        {
          "type": "slider",
          "id": "target",
          "label": "循环目标终点",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 10,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "powerTwo",
          "label": "改用 2 的幂次步长 (0.125 替代 0.01)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showInt",
          "label": "叠加整数索引参考线 (误差=0)",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const target = lab.values.target;\n  const usePow2 = lab.values.powerTwo;\n  const stepIdeal = usePow2 ? 0.125 : 0.01;\n  const stepF32 = Math.fround(stepIdeal);\n  const maxSteps = Math.round(target / stepIdeal);\n\n  const errs = [];\n  const executedVals = [];\n  let x = 0;\n  let idx = 0;\n  while (x <= target && idx <= maxSteps + 10) {\n    executedVals.push(x);\n    errs.push(x - idx * stepIdeal);\n    x = Math.fround(x + stepF32);\n    idx++;\n  }\n  const rejectedNext = x;\n  const missedEnd = executedVals.length < maxSteps + 1;\n\n  // Left plot: accumulated error curve\n  const px = 64, py = 28, pw = 360, ph = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = px + (i / 4) * pw;\n    const gy = py + (i / 4) * ph;\n    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.strokeRect(px, py, pw, ph);\n\n  let maxAbs = 0.00015;\n  for (const e of errs) if (Math.abs(e) > maxAbs) maxAbs = Math.abs(e) * 1.15;\n  const toY = e => py + ph / 2 - (e / maxAbs) * (ph * 0.42);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.25)';\n  ctx.beginPath(); ctx.moveTo(px, toY(0)); ctx.lineTo(px + pw, toY(0)); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px monospace';\n  ctx.fillText('+' + (maxAbs * 1e4).toFixed(1) + 'e-4', 8, py + 14);\n  ctx.fillText('0.0', 28, toY(0) + 4);\n  ctx.fillText('-' + (maxAbs * 1e4).toFixed(1) + 'e-4', 8, py + ph - 4);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('循环累计误差 (Float32 - 理想值)', px, 18);\n\n  if (lab.values.showInt) {\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, toY(0)); ctx.lineTo(px + pw, toY(0)); ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = missedEnd ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i < errs.length; i++) {\n    const gx = px + (i / Math.max(1, errs.length - 1)) * pw;\n    const gy = toY(errs[i]);\n    if (i === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  // Mark powers of 2 crossings on x axis\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';\n  ctx.font = '10px monospace';\n  for (const p2 of [1, 2, 4, 8]) {\n    if (p2 < target) {\n      const gx = px + (p2 / target) * pw;\n      ctx.beginPath(); ctx.moveTo(gx, py + ph - 6); ctx.lineTo(gx, py + ph); ctx.stroke();\n      ctx.fillText('X=' + p2, gx - 10, py + ph + 14);\n    }\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('X=' + target, px + pw - 22, py + ph + 14);\n\n  // Right panel: Simulated console output\n  const ox = 450, ow = 250, oy = 28, oh = 192;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';\n  ctx.fillRect(ox, oy, ow, oh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(ox, oy, ow, oh);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('模拟输出 (FOR X = 0 TO ' + target + ' STEP ' + stepIdeal + ')', ox + 8, 18);\n\n  ctx.font = '13px monospace';\n  const len = executedVals.length;\n  const showRows = [];\n  if (len > 4) {\n    showRows.push({ txt: executedVals[0].toFixed(2), color: '#f8fafc' });\n    showRows.push({ txt: executedVals[1].toFixed(2), color: '#f8fafc' });\n    showRows.push({ txt: '  ...', color: 'rgba(248,250,252,0.5)' });\n    for (let k = Math.max(2, len - 4); k < len; k++) {\n      showRows.push({ txt: executedVals[k].toFixed(6), color: (k === len - 1 && !missedEnd) ? '#10b981' : '#f59e0b' });\n    }\n  }\n  for (let i = 0; i < showRows.length; i++) {\n    ctx.fillStyle = showRows[i].color;\n    ctx.fillText(showRows[i].txt, ox + 16, oy + 26 + i * 21);\n  }\n\n  ctx.font = 'bold 12px sans-serif';\n  if (missedEnd) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('下步 ' + rejectedNext.toFixed(6) + ' > ' + target + ' 提前终止!', ox + 12, oy + oh - 14);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('终点 ' + target.toFixed(2) + ' 成功执行！', ox + 12, oy + oh - 14);\n  }\n\n  const finalErr = errs[errs.length - 1];\n  lab.setReadout('步长: ' + stepIdeal + '  |  预期次数: ' + (maxSteps + 1) + '  |  实际执行: ' + len + ' 次  |  末轮误差: ' + (finalErr >= 0 ? '+' : '') + finalErr.toFixed(6));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "永远别用浮点数做循环计数器：在 `FOR` 或 `while` 循环中用 `0.01`、`0.1` 等十进制小数步进极易因累计舍入误差而漏掉最后一个周期。请一律用整数计数，再在循环内部做除法缩放。",
        "非要用浮点小数步进时，优先选用 2 的幂次分数（如 `0.5`、`0.25`、`0.125`），它们在二进制下零表达误差。",
        "牢记单精度浮点的两道关键边界：1）相邻刻度间距约在 `1/1700 万 ~ 1/800 万` 之间；2）`±1677 万（±2^24）` 以内的所有整数都能在单精度浮点中精确表示，加减乘零误差。",
        "无法预测算法触发“随机抵消”还是“单向累加”时，按最坏累加估计：单精度每过一次运算约累积 `1/4000 万` 的相对误差；若循环上万次且精度吃紧，果断切换双精度（`1/4 京` 每运算）。"
      ]
    }
  ]
});
