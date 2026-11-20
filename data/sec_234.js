window.__BOOK_REGISTER_SECTION__("sec_234", {
  "title": "循环控制：极点对分阶段级联机制 (Loop Control)",
  "intuition": "把难啃的高阶递归滤波器拆解成一条“每次只处理一对共轭极点”的 FOR-NEXT 流水线，让 `P%` 从 `1` 跑到 `NP/2`，逐级把整个滤波器叠出来。",
  "blocks": [
    {
      "type": "concept",
      "heading": "化繁为简：为什么要把滤波器拆进循环里？",
      "paragraphs": [
        "在切比雪夫-巴特沃斯（Chebyshev-Butterworth）递归数字滤波器设计中，高阶滤波器的代数展开极其庞大、直接求解极易出错。为了降低数学与编程复杂度，算法采用**分阶段级联（Cascade of Stages）**策略：**每一级只实现一对极点（2 poles per stage）**。",
        "在完成参数输入与初始化之后，整个主程序的核心就是一个按极点对逐一迭代的**主循环（Loop Control）**。每执行一次循环，程序就计算当前这一对极点对应的二阶阶段参数，并将其并入总滤波器中；循环全部结束时，所有二阶单元刚好级联成完整的目标高阶滤波器。"
      ],
      "formula": {
        "expr": "N_loops = NP / 2,   P% ∈ {1, 2, ..., NP / 2}",
        "explain": "NP 为滤波器总极点数（通常为偶数）；P% 为当前正在执行的循环索引（对应第几个二阶阶段）；由于每个阶段固定承担 2 个极点，总循环次数正好等于 NP / 2。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：极点对循环步进器 (Block 11 / FOR-NEXT 追踪)",
      "instruction": "拖动「滤波器总极点数 NP」和「当前循环步数 P%」（或开启自动演示），观察左图 s 平面极点对如何按阶段逐一激活，以及右图级联幅频响应如何一步步收敛成型。",
      "controls": [
        {
          "type": "slider",
          "id": "np",
          "label": "滤波器总极点数 (NP)",
          "min": 2,
          "max": 12,
          "step": 2,
          "value": 6,
          "unit": " poles"
        },
        {
          "type": "slider",
          "id": "pIdx",
          "label": "当前循环步数 (P%)",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "auto",
          "label": "自动演示循环执行",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet autoPhase = 0;\n\nfunction draw() {\n  const np = lab.values.np;\n  const totalStages = np / 2;\n  const rawP = lab.values.auto ? (Math.floor(autoPhase) % totalStages) + 1 : lab.values.pIdx;\n  const activeP = Math.min(rawP, totalStages);\n  const outOfRange = !lab.values.auto && lab.values.pIdx > totalStages;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(255, 14);\n  ctx.lineTo(255, H - 14);\n  ctx.stroke();\n\n  const cx = 145;\n  const cy = 122;\n  const R = 82;\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('s 平面极点对 (2 poles / stage)', 16, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(cx - R - 20, cy);\n  ctx.lineTo(cx + 35, cy);\n  ctx.moveTo(cx, cy - R - 14);\n  ctx.lineTo(cx, cy + R + 14);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.28)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, Math.PI * 0.5, Math.PI * 1.5);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '10px monospace';\n  ctx.fillText('jw', cx + 5, cy - R - 4);\n  ctx.fillText('sigma', cx - R - 22, cy - 5);\n\n  for (let k = 1; k <= totalStages; k++) {\n    const theta = Math.PI / 2 + ((2 * k - 1) * Math.PI) / (2 * np);\n    const px = cx + R * Math.cos(theta);\n    const pyTop = cy - R * Math.sin(theta);\n    const pyBot = cy + R * Math.sin(theta);\n\n    let color = 'rgba(148,163,184,0.35)';\n    let radius = 4;\n    if (k < activeP || outOfRange) {\n      color = '#10b981';\n      radius = 5;\n    } else if (k === activeP) {\n      color = '#f59e0b';\n      radius = 6;\n    }\n\n    ctx.strokeStyle = k === activeP && !outOfRange ? 'rgba(245,158,11,0.55)' : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = k === activeP && !outOfRange ? 1.5 : 1;\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(px, pyTop);\n    ctx.lineTo(px, pyBot);\n    ctx.stroke();\n    ctx.setLineDash([]);\n\n    if (k === activeP && !outOfRange) {\n      ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.arc(px, pyTop, 10, 0, Math.PI * 2);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.arc(px, pyBot, 10, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.2;\n    [pyTop, pyBot].forEach(py => {\n      ctx.beginPath();\n      ctx.moveTo(px - radius, py - radius);\n      ctx.lineTo(px + radius, py + radius);\n      ctx.moveTo(px + radius, py - radius);\n      ctx.lineTo(px - radius, py + radius);\n      ctx.stroke();\n    });\n\n    if (k === activeP && !outOfRange) {\n      ctx.fillStyle = '#f59e0b';\n      ctx.font = 'bold 10px monospace';\n      ctx.fillText('P%=' + k, px - 30, pyTop + 3);\n    }\n  }\n\n  const rx = 275;\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('Line 320: FOR P% = 1 TO ' + totalStages + '   [Block 11]', rx, 22);\n\n  const boxW = 62;\n  const gap = 8;\n  for (let k = 1; k <= 6; k++) {\n    const bx = rx + (k - 1) * (boxW + gap);\n    const by = 32;\n    const enabled = k <= totalStages;\n    let bg = 'rgba(255,255,255,0.04)';\n    let border = 'rgba(255,255,255,0.12)';\n    let txt = '#64748b';\n    if (enabled) {\n      if (k < activeP || outOfRange) {\n        bg = 'rgba(16,185,129,0.18)';\n        border = '#10b981';\n        txt = '#10b981';\n      } else if (k === activeP) {\n        bg = 'rgba(245,158,11,0.22)';\n        border = '#f59e0b';\n        txt = '#fbbf24';\n      } else {\n        bg = 'rgba(56,189,248,0.08)';\n        border = 'rgba(56,189,248,0.35)';\n        txt = '#cbd5e1';\n      }\n    }\n    ctx.fillStyle = bg;\n    ctx.strokeStyle = border;\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(bx, by, boxW, 34);\n    ctx.strokeRect(bx, by, boxW, 34);\n\n    ctx.fillStyle = txt;\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText(enabled ? 'P% = ' + k : '---', bx + 11, by + 15);\n    ctx.font = '10px sans-serif';\n    ctx.fillText(enabled ? '2 poles' : '跳过', bx + 12, by + 28);\n  }\n\n  ctx.fillStyle = outOfRange ? '#ec4899' : '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText(\n    outOfRange\n      ? 'Line 460: NEXT P% -> P%=' + lab.values.pIdx + ' > ' + totalStages + '，循环结束！'\n      : 'Line 460: NEXT P%   (已完成 ' + activeP + '/' + totalStages + ' 次循环，累计 ' + (activeP * 2) + '/' + np + ' 极点)',\n    rx,\n    84\n  );\n\n  const gx = 278;\n  const gy = 104;\n  const gw = 420;\n  const gh = 114;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.07)';\n  for (let i = 1; i < 4; i++) {\n    const yy = gy + (gh * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(gx, yy);\n    ctx.lineTo(gx + gw, yy);\n    ctx.stroke();\n  }\n  const wcX = gx + (1.0 / 2.5) * gw;\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(wcX, gy);\n  ctx.lineTo(wcX, gy + gh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('级联后幅频响应 |H(jw)| (橙色:当前累计 / 蓝色:最终目标)', gx + 6, gy + 13);\n  ctx.fillText('w=1 (截止)', wcX + 4, gy + gh - 5);\n\n  const evalMag = (w, stagesCount) => {\n    let mag2 = 1;\n    for (let k = 1; k <= stagesCount; k++) {\n      const theta = Math.PI / 2 + ((2 * k - 1) * Math.PI) / (2 * np);\n      const sigma = Math.cos(theta);\n      const denom = Math.pow(1 - w * w, 2) + Math.pow(2 * sigma * w, 2);\n      mag2 *= 1 / denom;\n    }\n    return Math.sqrt(mag2);\n  };\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 140; i++) {\n    const w = (i / 140) * 2.5;\n    const m = Math.min(evalMag(w, totalStages), 1.35);\n    const x = gx + (i / 140) * gw;\n    const y = gy + gh - (m / 1.4) * (gh - 12) - 4;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = outOfRange ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 140; i++) {\n    const w = (i / 140) * 2.5;\n    const m = Math.min(evalMag(w, activeP), 1.35);\n    const x = gx + (i / 140) * gw;\n    const y = gy + gh - (m / 1.4) * (gh - 12) - 4;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  lab.setReadout(\n    'NP=' + np + ' 极点 | 总循环数 NP/2=' + totalStages + ' | 当前 P%=' + activeP +\n    (outOfRange ? ' (超出循环上界，已结束)' : ' (正在处理第 ' + activeP + ' 对极点)')\n  );\n}\n\nlab.onUpdate(draw);\nlab.onLoop(dt => {\n  if (lab.values.auto) {\n    autoPhase += dt * 0.9;\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "对照流程图与 BASIC 源码：Block 11 与 320–460 行",
      "paragraphs": [
        "原书将第 20 章的算法流程图与代码（Figure 33-7）完整复用到本章。在这套设计中，循环控制由两个关键位置共同确立：**流程图中的 Block 11（第 11 号方框）**，以及 **BASIC 程序中的第 320 行（`FOR` 语句）与第 460 行（`NEXT` 语句）**。",
        "原书给出了一个极易建立直觉的例子：如果我们要设计一个 **6 极点（6-pole）滤波器**，那么循环总共只会执行 **3 次**，循环索引变量 `P%` 依次取值为 **`1, 2, 3`**。换句话说，一个 6 极点滤波器在物理结构上就是分 **3 个阶段（stages）** 实现的，每个阶段精准贡献 **2 个极点**。",
        "从信号处理角度看，这种循环控制不仅让代码篇幅保持高度紧凑，也意味着每多跑一轮 `P%`，滤波器的阶数就增加 2 阶、阻带滚降斜率就额外陡峭 `-12 dB/octave`。"
      ],
      "formula": {
        "expr": null,
        "explain": "记忆锚点：6 极点滤波器 -> 3 次循环 (P% = 1, 2, 3) -> 3 个级联阶段，每阶段 2 个极点。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：循环次数与多级滤波听感实时对比 (Web Audio)",
      "instruction": "点击「播放白噪声滤波对比」，拖动「循环执行次数 (NP/2)」滑块从 1 增至 6，亲耳听出每多执行一轮循环（增加 2 个极点）高频被压制得有多狠，同时观察实时频谱与滚降曲线。",
      "controls": [
        {
          "type": "slider",
          "id": "stages",
          "label": "循环执行次数 (NP/2 个阶段)",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 3,
          "unit": " 阶段"
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "截止频率 (fc)",
          "min": 200,
          "max": 3000,
          "step": 50,
          "value": 800,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放白噪声滤波对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet actx = null;\nlet noiseSrc = null;\nlet filters = [];\nlet analyser = null;\nlet masterGain = null;\nlet freqData = null;\n\nfunction ensureAudio() {\n  if (actx) return;\n  actx = lab.getAudioContext();\n  const sampleRate = actx.sampleRate;\n  const bufLen = sampleRate * 2;\n  const buf = actx.createBuffer(1, bufLen, sampleRate);\n  const ch = buf.getChannelData(0);\n  for (let i = 0; i < bufLen; i++) {\n    ch[i] = (Math.random() * 2 - 1) * 0.4;\n  }\n  noiseSrc = actx.createBufferSource();\n  noiseSrc.buffer = buf;\n  noiseSrc.loop = true;\n\n  for (let i = 0; i < 6; i++) {\n    const f = actx.createBiquadFilter();\n    f.type = 'lowpass';\n    filters.push(f);\n  }\n\n  analyser = actx.createAnalyser();\n  analyser.fftSize = 1024;\n  analyser.smoothingTimeConstant = 0.78;\n  freqData = new Uint8Array(analyser.frequencyBinCount);\n\n  masterGain = actx.createGain();\n  masterGain.gain.value = 0;\n\n  analyser.connect(masterGain);\n  masterGain.connect(actx.destination);\n  noiseSrc.start();\n}\n\nfunction updateAudioGraph() {\n  const stages = lab.values.stages;\n  const fc = lab.values.cutoff;\n  const playing = lab.values.play;\n\n  if (!playing && !actx) return;\n  ensureAudio();\n\n  if (playing && actx.state === 'suspended') {\n    actx.resume();\n  }\n\n  noiseSrc.disconnect();\n  for (let i = 0; i < 6; i++) filters[i].disconnect();\n\n  let prev = noiseSrc;\n  const np = stages * 2;\n  for (let k = 1; k <= stages; k++) {\n    const f = filters[k - 1];\n    const theta = Math.PI / 2 + ((2 * k - 1) * Math.PI) / (2 * np);\n    const linearQ = -1 / (2 * Math.cos(theta));\n    const qDb = 20 * Math.log10(linearQ);\n    f.frequency.setTargetAtTime(fc, actx.currentTime, 0.02);\n    f.Q.setTargetAtTime(qDb, actx.currentTime, 0.02);\n    prev.connect(f);\n    prev = f;\n  }\n  prev.connect(analyser);\n  masterGain.gain.setTargetAtTime(playing ? 0.35 : 0, actx.currentTime, 0.03);\n}\n\nfunction draw() {\n  const stages = lab.values.stages;\n  const np = stages * 2;\n  const fc = lab.values.cutoff;\n  const playing = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('FOR P%=1 TO ' + stages + ' 级联链 (' + np + ' poles):', 16, 22);\n\n  for (let k = 1; k <= 6; k++) {\n    const bx = 265 + (k - 1) * 73;\n    const by = 8;\n    const active = k <= stages;\n    ctx.fillStyle = active ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.04)';\n    ctx.strokeStyle = active ? '#10b981' : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1.4;\n    ctx.fillRect(bx, by, 60, 22);\n    ctx.strokeRect(bx, by, 60, 22);\n    ctx.fillStyle = active ? '#34d399' : '#475569';\n    ctx.font = 'bold 10px monospace';\n    ctx.fillText('Stage ' + k, bx + 9, by + 15);\n    if (k < stages) {\n      ctx.strokeStyle = '#10b981';\n      ctx.beginPath();\n      ctx.moveTo(bx + 60, by + 11);\n      ctx.lineTo(bx + 73, by + 11);\n      ctx.stroke();\n    }\n  }\n\n  const gx = 52;\n  const gy = 42;\n  const gw = 648;\n  const gh = 168;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  const fMin = 100;\n  const fMax = 10000;\n  const freqToX = f => gx + (Math.log10(f / fMin) / Math.log10(fMax / fMin)) * gw;\n\n  [200, 500, 1000, 2000, 5000].forEach(f => {\n    const x = freqToX(f);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(x, gy);\n    ctx.lineTo(x, gy + gh);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(f >= 1000 ? (f / 1000) + 'k' : f + '', x - 8, gy + gh + 14);\n  });\n\n  for (let db = 0; db >= -60; db -= 15) {\n    const y = gy + ((-db) / 60) * gh;\n    ctx.strokeStyle = 'rgba(255,255,255,0.07)';\n    ctx.beginPath();\n    ctx.moveTo(gx, y);\n    ctx.lineTo(gx + gw, y);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(db + 'dB', 14, y + 4);\n  }\n\n  const fcX = freqToX(fc);\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(fcX, gy);\n  ctx.lineTo(fcX, gy + gh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px monospace';\n  ctx.fillText('fc=' + fc + 'Hz', fcX + 4, gy + 14);\n\n  if (playing && analyser && freqData) {\n    analyser.getByteFrequencyData(freqData);\n    const sr = actx.sampleRate;\n    const binCount = analyser.frequencyBinCount;\n    ctx.fillStyle = 'rgba(56,189,248,0.28)';\n    ctx.beginPath();\n    ctx.moveTo(gx, gy + gh);\n    for (let px = 0; px <= gw; px += 4) {\n      const f = fMin * Math.pow(fMax / fMin, px / gw);\n      const bin = Math.min(binCount - 1, Math.max(0, Math.round((f * analyser.fftSize) / sr)));\n      const val = freqData[bin] / 255;\n      const y = gy + gh - val * gh * 0.95;\n      ctx.lineTo(gx + px, y);\n    }\n    ctx.lineTo(gx + gw, gy + gh);\n    ctx.closePath();\n    ctx.fill();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 160; i++) {\n    const f = fMin * Math.pow(fMax / fMin, i / 160);\n    const db = -10 * Math.log10(1 + Math.pow(f / fc, 2 * np));\n    const clampedDb = Math.max(-60, db);\n    const x = gx + (i / 160) * gw;\n    const y = gy + ((-clampedDb) / 60) * gh;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  lab.setReadout(\n    '循环 P%=1..' + stages + ' | 总极点 NP=' + np + ' | 滚降斜率 -' + (stages * 12) + ' dB/oct (-' + (stages * 40) + ' dB/dec) | ' +\n    (playing ? '音频实时滤波中' : '点击播放试听白噪声滤波效果')\n  );\n}\n\nlab.onUpdate(() => {\n  updateAudioGraph();\n  draw();\n});\n\nlab.onLoop(() => {\n  if (lab.values.play) {\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "循环边界核对：`P%` 迭代的不是总极点数 `NP`，而是极点对数 `NP / 2`（例如 6 极点滤波器只循环 3 次，`P% = 1, 2, 3`）；写代码时若误把上界设为 `NP`，极点会被重复计算一倍。",
        "二阶模块化思维：Block 11 与 320/460 行的 `FOR-NEXT` 循环把任意偶数阶递归滤波器设计统一为“每次处理 1 对极点（2 poles/stage）”的标准流程，既避免了高阶多项式展开爆炸，也让每个循环阶段天然对应一个二阶单元（Biquad）。"
      ]
    }
  ]
});
