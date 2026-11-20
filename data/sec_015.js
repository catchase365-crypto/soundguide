window.__BOOK_REGISTER_SECTION__("sec_015", {
  "title": "数字信号处理的起源与版图 (The Roots of DSP)",
  "intuition": "一旦把真实世界的声音、图像或震动通过模数转换器（ADC）变成计算机里的一串数字，“接下来该怎么处理它？”——这就是 DSP 回答的核心问题。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是 DSP？当物理世界变成一串数字",
      "paragraphs": [
        "数字信号处理（**DSP, Digital Signal Processing**）之所以与计算机科学中的其他分支截然不同，是因为它处理的数据极其独特——**信号（Signals）**。这些信号大多源自真实物理世界的感官数据：地震引发的地壳震动、相机捕捉的视觉图像、空气传播的声波等。",
        "DSP 的本质，就是在这类信号通过**模数转换器（ADC）**变成计算机里的数字序列之后，对其进行操控的数学理论、算法与工程技术。它的目标包罗万象：增强模糊的图像、识别与合成人类语音、压缩海量数据以便存储和传输等。换句话说，当你把 ADC 接到电脑上并采集到一段现实世界的数据时，DSP 回答的正是那个关键问题：**“接下来该干什么？（What next?）”**"
      ],
      "formula": {
        "expr": "x[n] = Q( x_a(n · T_s) )",
        "explain": "虽然原书本节刻意避开了繁琐的数学推演，但整个 DSP 工作的起点可以这样理解：连续变化的真实物理信号 x_a(t) 每隔采样周期 T_s 取一次瞬时快照，再经过量化器 Q(·) 四舍五入为有限精度的数字序列 x[n]，随后正式交由 DSP 算法大显身手。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：模数转换（ADC）的代价——采样与量化听感对比",
      "instruction": "拖动“数字采样率”和“量化位数”滑块，观察连续声波如何变成阶梯状数字信号，点击播放按钮亲耳听出低精度数字化带来的锯齿失真与量化噪声。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "声波基频",
          "min": 150,
          "max": 600,
          "step": 10,
          "value": 250,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "数字采样率",
          "min": 800,
          "max": 8000,
          "step": 200,
          "value": 3000,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化位数",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " bit"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放数字化声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioSrc = null;\nlet gainNode = null;\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const ctx = lab.getAudioContext();\n  if (!ctx) return;\n  if (ctx.state === 'suspended') {\n    ctx.resume();\n  }\n  stopAudio();\n  const sr = ctx.sampleRate;\n  const dur = 1.0;\n  const len = Math.floor(sr * dur);\n  const buf = ctx.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n  const freq = lab.values.freq;\n  const digSr = lab.values.sampleRate;\n  const levels = Math.pow(2, lab.values.bits);\n  const holdSamples = sr / digSr;\n  const step = 2 / (levels - 1);\n  let heldVal = 0;\n  let nextHold = 0;\n  for (let i = 0; i < len; i++) {\n    if (i >= nextHold) {\n      const t = i / sr;\n      const raw = Math.sin(2 * Math.PI * freq * t);\n      heldVal = Math.round((raw + 1) / step) * step - 1;\n      nextHold += holdSamples;\n    }\n    data[i] = heldVal;\n  }\n  audioSrc = ctx.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  gainNode = ctx.createGain();\n  gainNode.gain.value = 0.16;\n  audioSrc.connect(gainNode);\n  gainNode.connect(ctx.destination);\n  audioSrc.start();\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  const padX = 36;\n  const padY = 26;\n  const plotW = w - padX * 2;\n  const plotH = h - padY * 2;\n  const midY = padY + plotH / 2;\n  const amp = plotH * 0.42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = padY + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(padX, y);\n    ctx.lineTo(padX + plotW, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 6; i++) {\n    const x = padX + (plotW * i) / 6;\n    ctx.beginPath();\n    ctx.moveTo(x, padY);\n    ctx.lineTo(x, padY + plotH);\n    ctx.stroke();\n  }\n\n  const freq = lab.values.freq;\n  const digSr = lab.values.sampleRate;\n  const bits = lab.values.bits;\n  const levels = Math.pow(2, bits);\n  const timeWindow = 0.012;\n\n  if (bits <= 4) {\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)';\n    ctx.setLineDash([3, 4]);\n    for (let k = 0; k < levels; k++) {\n      const qVal = (k / (levels - 1)) * 2 - 1;\n      const y = midY - qVal * amp;\n      ctx.beginPath();\n      ctx.moveTo(padX, y);\n      ctx.lineTo(padX + plotW, y);\n      ctx.stroke();\n    }\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px += 2) {\n    const t = (px / plotW) * timeWindow;\n    const val = Math.sin(2 * Math.PI * freq * t);\n    const y = midY - val * amp;\n    if (px === 0) ctx.moveTo(padX + px, y);\n    else ctx.lineTo(padX + px, y);\n  }\n  ctx.stroke();\n\n  const dt = 1 / digSr;\n  const step = 2 / (levels - 1);\n  const numSamples = Math.floor(timeWindow / dt) + 1;\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  const pts = [];\n  for (let n = 0; n < numSamples; n++) {\n    const t = n * dt;\n    if (t > timeWindow) break;\n    const raw = Math.sin(2 * Math.PI * freq * t);\n    const q = Math.round((raw + 1) / step) * step - 1;\n    const x = padX + (t / timeWindow) * plotW;\n    const y = midY - q * amp;\n    const nextT = Math.min((n + 1) * dt, timeWindow);\n    const nextX = padX + (nextT / timeWindow) * plotW;\n    if (n === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n    ctx.lineTo(nextX, y);\n    pts.push({ x: x, y: y });\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  for (let i = 0; i < pts.length; i++) {\n    ctx.beginPath();\n    ctx.arc(pts[i].x, pts[i].y, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 连续物理声波 (模拟)', padX, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 采样量化阶梯 (数字)', padX + 165, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● ADC 采样点', padX + 330, 16);\n\n  const kbps = ((digSr * bits) / 1000).toFixed(1);\n  const spc = (digSr / freq).toFixed(1);\n  lab.setReadout('量化阶梯: ' + levels + ' 级 | 每周期采样: ' + spc + ' 点 | 原始数据率: ' + kbps + ' kbps');\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "从天价军用到大众消费：DSP 的两次历史浪潮",
      "paragraphs": [
        "DSP 诞生于 20 世纪 60 至 70 年代数字计算机刚刚兴起之时。那时的计算机极其昂贵，DSP 只能局限在四个“不计成本”的关键战场：**雷达与声呐**（事关国家安全）、**石油勘探**（蕴含巨额商业利润）、**太空探索**（深空探测传回的数据不可再生）、以及**医学成像**（能直接挽救生命）。",
        "到了 80 至 90 年代，个人电脑（PC）革命引爆了 DSP 的第二波浪潮。驱动力从军事与政府需求彻底转向了**商业市场**——只要有人看到商机，就会摇身一变成为 DSP 供应商。于是，DSP 迅速走进了移动电话、CD 激光唱机和电子语音信箱等消费级产品中。正如原书图 1-1 所展示的，如今它已全面渗透至**太空、医疗、商业、通信、军事、工业与科学研究**七大领域。",
        "这场技术革命还呈现出鲜明的“自上而下”普及路径：80 年代初，DSP 还是电子工程系的研究生高阶课程；十年后，它变成了本科生的标准必修课；而到了今天，DSP 已经像早年的**基础电路设计**一样，成为各行各业科学家与工程师不可或缺的基础技能。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：拯救被淹没的信号——雷达/地震脉冲降噪提取",
      "instruction": "模拟早期 DSP 的经典任务（如雷达回波或地震勘探波）：先调高“环境噪声”让目标脉冲几乎消失，再向右拖动“DSP 平滑窗口”，亲眼见证算法如何把埋在噪声里的真实信号捞出来。",
      "controls": [
        {
          "type": "slider",
          "id": "noise",
          "label": "环境噪声强度",
          "min": 0,
          "max": 1.2,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "win",
          "label": "DSP 平滑窗口",
          "min": 1,
          "max": 25,
          "step": 2,
          "value": 1,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showTruth",
          "label": "叠加显示真实目标脉冲",
          "value": true
        }
      ],
      "jsCode": "const N = 240;\nconst noiseArr = [];\nlet seed = 1337;\nfunction nextRand() {\n  seed = (seed * 16807) % 2147483647;\n  return (seed - 1) / 2147483646;\n}\nfor (let i = 0; i < N; i++) {\n  const u = (nextRand() + nextRand() + nextRand() - 1.5) * 0.75;\n  noiseArr.push(u);\n}\n\nconst truth = [];\nfor (let i = 0; i < N; i++) {\n  const p1 = 0.95 * Math.exp(-Math.pow((i - 78) / 9, 2));\n  const p2 = 0.55 * Math.exp(-Math.pow((i - 165) / 12, 2));\n  truth.push(p1 + p2);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const w = lab.width;\n  const h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  const padX = 36;\n  const padY = 26;\n  const plotW = w - padX * 2;\n  const plotH = h - padY * 2;\n  const baseY = padY + plotH * 0.68;\n  const scaleY = plotH * 0.46;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = padY + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(padX, y);\n    ctx.lineTo(padX + plotW, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 6; i++) {\n    const x = padX + (plotW * i) / 6;\n    ctx.beginPath();\n    ctx.moveTo(x, padY);\n    ctx.lineTo(x, padY + plotH);\n    ctx.stroke();\n  }\n\n  const noiseAmp = lab.values.noise;\n  const win = Math.max(1, Math.round(lab.values.win));\n  const half = Math.floor(win / 2);\n\n  const noisy = [];\n  for (let i = 0; i < N; i++) {\n    noisy.push(truth[i] + noiseAmp * noiseArr[i]);\n  }\n\n  const filtered = [];\n  for (let i = 0; i < N; i++) {\n    let sum = 0;\n    let count = 0;\n    for (let k = -half; k <= half; k++) {\n      const idx = i + k;\n      if (idx >= 0 && idx < N) {\n        sum += noisy[idx];\n        count++;\n      }\n    }\n    filtered.push(sum / count);\n  }\n\n  ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';\n  ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const x = padX + (i / (N - 1)) * plotW;\n    const y = baseY - noisy[i] * scaleY;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (lab.values.showTruth) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.8;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const x = padX + (i / (N - 1)) * plotW;\n      const y = baseY - truth[i] * scaleY;\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const x = padX + (i / (N - 1)) * plotW;\n    const y = baseY - filtered[i] * scaleY;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('— 原始含噪传感器信号', padX, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— DSP 滤波增强输出', padX + 165, 16);\n  if (lab.values.showTruth) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('--- 真实目标回波', padX + 315, 16);\n  }\n\n  const snrGain = (10 * Math.log10(win)).toFixed(1);\n  lab.setReadout('噪声强度: ' + noiseAmp.toFixed(2) + ' | 平滑窗口: ' + win + ' 点 | 理论信噪比提升: +' + snrGain + ' dB');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "把 DSP 当作工具，以及它的跨学科边界",
      "paragraphs": [
        "如果你在工程中遇到一个 DSP 问题，翻开传统教科书寻找答案时，往往会看到满篇的公式、生僻的数学符号和晦涩术语——哪怕是业内老手也会感到“简直是一场噩梦”。其实这些深奥的数学本身没有错，只是它们是写给**前沿理论研究者**推导理论边界用的。本课程的核心理念恰恰相反：绝大多数实用的 DSP 技术，完全可以绕开繁琐的纯理论门槛，直接作为**解决实际问题的工程工具**来学习和使用。",
        "同时也要清醒地认识到，DSP 是一门高度**跨学科（Interdisciplinary）**的技术。正如原书图 1-2 所示，DSP 与周围技术领域之间的边界并不是非黑即白的硬性切分，而是模糊且大片重叠的。如果你打算在 DSP 领域深耕，**通信理论、数值分析、概率与统计、模拟信号处理、决策论、数字电子学以及模拟电子学**，都是你必须逐步涉猎的“盟友学科”。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要被传统教材的“公式墙”吓退：做工程应用时，先建立“信号如何采集、算法想实现什么变换、物理效果如何”的直觉，再按需回查数学推导。",
        "DSP 无法无中生有：模数转换（ADC）的采样率与量化精度决定了进入计算机的信息上限，前端采集丢掉的细节很难靠后端算法凭空找回。",
        "滤波永远存在权衡（Trade-off）：就像实验二中看到的那样，增大平滑窗口虽然能有效压制随机噪声，但窗口过大也会把真实脉冲的尖峰“抹平”导致失真。",
        "保持跨学科视野：调通一个实际 DSP 系统往往不只靠写代码，还需要结合概率统计（分析噪声分布）、数值分析（避免运算溢出）和电子学（理解传感器特性）。"
      ]
    }
  ]
});
