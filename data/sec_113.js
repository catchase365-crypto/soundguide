window.__BOOK_REGISTER_SECTION__("sec_113", {
  "title": "冲激函数变换对：极坐标、直角坐标与 DFT 对偶性 (Delta Function Pairs)",
  "intuition": "在时域把信号压缩成一根孤立的“针”（冲激），它在频域就会铺展成绝对平坦的“海平面”（等幅全频谱）；而时域的平移，只会给频域的相位拧上线性旋转的发条。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、极坐标下的冲激对：时域一压缩，频域就摊平",
      "paragraphs": [
        "对于离散信号而言，**冲激函数（Delta Function）**是最简单的基本波形，而它的傅里叶变换对也同样简单得惊人。假设我们在时域的 0 号样点放一个幅度为 1 的冲激 `x[0] = 1`（其余样点全为 0），那么它在频域的极坐标表现是：**幅度在所有频率上恒等于 1，而相位在所有频率上恒等于 0**。",
        "为什么会这样？还记得上一章讲过的**展缩特性（Expansion/Compression Property）**吗？当信号在时域被极限压缩成一根没有宽度的脉冲时，它在频域就会被极限展宽，直到变成一条毫无起伏的常数水平线。也就是说，一根完美对齐在 0 时刻的尖刺，需要**所有频率的正弦波以完全相同的幅度、并且在 0 时刻同相叠加**才能造出来。",
        "另外需要注意，为了完整展现后续的对偶性，DSP 图表常常把频域横轴画成从 `-0.5` 到 `0.5`，即同时画出**负频率（Negative Frequencies）**和正频率。虽然对于实信号来说负频率包含的是冗余镜像信息，但把负半轴一起画出来能让图形的对称美感瞬间显现。"
      ],
      "formula": {
        "expr": "|X(f)| = 1,   ∠X(f) = -2π · f · n₀   (-0.5 ≤ f ≤ 0.5)",
        "explain": "|X(f)| 是频率 f 处的幅度（恒为 1，与冲激位置无关）；n₀ 是冲激在时域中的样点位置；∠X(f) 是频率 f 处的相位（单位为弧度）。当 n₀ = 0 时，所有频率的相位全为 0。"
      }
    },
    {
      "type": "concept",
      "heading": "二、时域平移与相位卷绕（Wrapped Phase）",
      "paragraphs": [
        "如果我们把这根冲激向右平移到 `x[4]` 或 `x[8]`，频域会发生什么变化？根据傅里叶变换的平移性质：**时域平移不会改变频域的幅度**（海平面依然是绝对平坦的 1），但它会在频域的相位上叠加一个**线性斜坡（Linear Phase）**。",
        "冲激向右移得越远（`n₀` 越大），相位直线的斜率就越陡。不过在工程软件画图时，我们看到的往往不是一条笔直延伸到正负无穷的斜线，而是一排锯齿波——这是因为相位通常**没有经过解卷绕（Unwrapped）**，而是被强行限制在了 `[-π, +π]` 的主值区间内。",
        "每当线性相位向下穿过 `-π` 时，它就会立刻加 `2π` 跳回 `+π` 重新开始下降。具体来说，当冲激位于 `x[4]` 时，横跨 `-0.5` 到 `0.5` 的整个频谱里恰好会出现 **4 个完整的锯齿周期**；位于 `x[8]` 时则会出现 **8 个周期**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：极坐标视角——平移冲激、观察相位卷绕与试听等幅频谱",
      "instruction": "拖动「冲激位置 n₀」观察幅度谱是否纹丝不动、相位锯齿如何加密；点击「相位解卷绕」还原线性斜坡，也可打开声音感受全频等幅特性。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "冲激位置 n₀",
          "min": 0,
          "max": 16,
          "step": 1,
          "value": 4,
          "unit": " 样点"
        },
        {
          "type": "toggle",
          "id": "unwrap",
          "label": "相位解卷绕 (Unwrap)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showNeg",
          "label": "显示负频率 (-0.5 ~ 0.5)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听冲激序列音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet osc = null;\nlet gainNode = null;\nlet playing = false;\n\nfunction updateAudio() {\n  const wantPlay = !!lab.values.play;\n  const shift = lab.values.shift;\n  if (wantPlay) {\n    const actx = lab.getAudioContext();\n    if (!actx) return;\n    if (actx.state === 'suspended') actx.resume();\n    const K = 28;\n    const real = new Float32Array(K + 1);\n    const imag = new Float32Array(K + 1);\n    for (let k = 1; k <= K; k++) {\n      const phi = -2 * Math.PI * k * shift / 64;\n      real[k] = Math.cos(phi);\n      imag[k] = -Math.sin(phi);\n    }\n    const wave = actx.createPeriodicWave(real, imag, { disableNormalization: false });\n    if (!playing) {\n      osc = actx.createOscillator();\n      gainNode = actx.createGain();\n      osc.frequency.value = 110;\n      gainNode.gain.value = 0.16;\n      osc.setPeriodicWave(wave);\n      osc.connect(gainNode);\n      gainNode.connect(actx.destination);\n      osc.start();\n      playing = true;\n    } else if (osc) {\n      osc.setPeriodicWave(wave);\n    }\n  } else if (playing) {\n    try {\n      if (osc) { osc.stop(); osc.disconnect(); }\n      if (gainNode) gainNode.disconnect();\n    } catch (e) {}\n    osc = null;\n    gainNode = null;\n    playing = false;\n  }\n}\n\nfunction drawPanel(px, py, pw, ph, title, yMin, yMax, yTicks, xLabel, xTicks) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, px + pw / 2, py - 10);\n\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  yTicks.forEach(function(t) {\n    const y = py + ph - ((t.v - yMin) / (yMax - yMin)) * ph;\n    if (y >= py - 2 && y <= py + ph + 2) {\n      ctx.strokeStyle = Math.abs(t.v) < 1e-6 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n      ctx.beginPath();\n      ctx.moveTo(px, y);\n      ctx.lineTo(px + pw, y);\n      ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.65)';\n      ctx.fillText(t.l, px - 5, y + 3);\n    }\n  });\n\n  ctx.textAlign = 'center';\n  xTicks.forEach(function(t) {\n    const x = px + t.pos * pw;\n    ctx.strokeStyle = Math.abs(t.v) < 1e-6 && t.pos > 0.01 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(x, py);\n    ctx.lineTo(x, py + ph);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(t.l, x, py + ph + 13);\n  });\n\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText(xLabel, px + pw / 2, py + ph + 26);\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const shift = lab.values.shift;\n  const unwrap = !!lab.values.unwrap;\n  const showNeg = !!lab.values.showNeg;\n\n  const p1 = { x: 34, y: 28, w: 186, h: 174 };\n  const p2 = { x: 274, y: 28, w: 186, h: 174 };\n  const p3 = { x: 514, y: 28, w: 186, h: 174 };\n\n  drawPanel(p1.x, p1.y, p1.w, p1.h, '时域: 冲激 x[' + shift + ']', -1, 2, [\n    { v: -1, l: '-1' }, { v: 0, l: '0' }, { v: 1, l: '1' }, { v: 2, l: '2' }\n  ], '样点序号 n', [\n    { v: 0, pos: 0, l: '0' },\n    { v: 16, pos: 16 / 63, l: '16' },\n    { v: 32, pos: 32 / 63, l: '32' },\n    { v: 48, pos: 48 / 63, l: '48' },\n    { v: 63, pos: 1, l: '63' }\n  ]);\n\n  const y0_1 = p1.y + p1.h - ((0 - (-1)) / 3) * p1.h;\n  const y1_1 = p1.y + p1.h - ((1 - (-1)) / 3) * p1.h;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(p1.x, y0_1);\n  ctx.lineTo(p1.x + p1.w, y0_1);\n  ctx.stroke();\n  const sx = p1.x + (shift / 63) * p1.w;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(sx, y0_1);\n  ctx.lineTo(sx, y1_1);\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(sx - 3, y1_1 - 3, 6, 6);\n\n  const fMin = showNeg ? -0.5 : 0;\n  const fMax = 0.5;\n  const fTicks = showNeg\n    ? [{ v: -0.5, pos: 0, l: '-0.5' }, { v: 0, pos: 0.5, l: '0' }, { v: 0.5, pos: 1, l: '0.5' }]\n    : [{ v: 0, pos: 0, l: '0' }, { v: 0.25, pos: 0.5, l: '0.25' }, { v: 0.5, pos: 1, l: '0.5' }];\n\n  drawPanel(p2.x, p2.y, p2.w, p2.h, '频域: 幅度 (Magnitude)', -2, 2, [\n    { v: -2, l: '-2' }, { v: -1, l: '-1' }, { v: 0, l: '0' }, { v: 1, l: '1' }, { v: 2, l: '2' }\n  ], '归一化频率', fTicks);\n\n  const yMag = p2.y + p2.h - ((1 - (-2)) / 4) * p2.h;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(p2.x, yMag);\n  ctx.lineTo(p2.x + p2.w, yMag);\n  ctx.stroke();\n\n  let pLim = 6;\n  let pTicks = [\n    { v: -6, l: '-6' }, { v: -Math.PI, l: '-π' }, { v: 0, l: '0' }, { v: Math.PI, l: '+π' }, { v: 6, l: '6' }\n  ];\n  if (unwrap && shift > 1) {\n    pLim = Math.ceil(Math.PI * shift * 1.15);\n    const half = Math.round(pLim / 2);\n    pTicks = [\n      { v: -pLim, l: '-' + pLim }, { v: -half, l: '-' + half }, { v: 0, l: '0' }, { v: half, l: '' + half }, { v: pLim, l: '' + pLim }\n    ];\n  }\n\n  drawPanel(p3.x, p3.y, p3.w, p3.h, '频域: 相位 (' + (unwrap ? '已解卷绕' : '[-π, π]') + ')', -pLim, pLim, pTicks, '归一化频率', fTicks);\n\n  if (unwrap) {\n    const yPiPos = p3.y + p3.h - ((Math.PI + pLim) / (2 * pLim)) * p3.h;\n    const yPiNeg = p3.y + p3.h - ((-Math.PI + pLim) / (2 * pLim)) * p3.h;\n    ctx.save();\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.35)';\n    ctx.beginPath();\n    ctx.moveTo(p3.x, yPiPos); ctx.lineTo(p3.x + p3.w, yPiPos);\n    ctx.moveTo(p3.x, yPiNeg); ctx.lineTo(p3.x + p3.w, yPiNeg);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  const Npts = showNeg ? 64 : 32;\n  const pts = [];\n  for (let i = 0; i <= Npts; i++) {\n    const f = fMin + (i / Npts) * (fMax - fMin);\n    let ph = -2 * Math.PI * f * shift;\n    if (!unwrap) {\n      const re = Math.cos(2 * Math.PI * f * shift);\n      let im = -Math.sin(2 * Math.PI * f * shift);\n      if (Math.abs(im) < 1e-9) im = 0;\n      ph = Math.atan2(im, re);\n    }\n    const x = p3.x + (i / Npts) * p3.w;\n    const y = p3.y + p3.h - ((ph + pLim) / (2 * pLim)) * p3.h;\n    pts.push({ x: x, y: y, ph: ph });\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i < pts.length; i++) {\n    if (i === 0 || (!unwrap && Math.abs(pts[i].ph - pts[i - 1].ph) > Math.PI * 1.1)) {\n      ctx.moveTo(pts[i].x, pts[i].y);\n    } else {\n      ctx.lineTo(pts[i].x, pts[i].y);\n    }\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  for (let i = 0; i < pts.length; i++) {\n    ctx.fillRect(pts[i].x - 1.5, pts[i].y - 1.5, 3, 3);\n  }\n\n  lab.setReadout('冲激位置 n₀ = ' + shift + ' | 幅度 = 1.00 (恒定不变，音色不变) | 相位: ' + (unwrap ? ('±' + (shift * Math.PI).toFixed(2) + ' rad 连续直线') : ('[-π, +π] 卷绕锯齿（全频带共 ' + shift + ' 个周期）'))); \n  updateAudio();\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、直角坐标视角与 DFT 的完美对偶性 (Duality)",
      "paragraphs": [
        "如果我们不用极坐标（幅度 + 相位），而是用**直角坐标（实部 Real Part + 虚部 Imaginary Part）**来看同一个冲激函数，画面会立刻大变样：原本平坦的常数和直线，变成了实部与虚部里密密麻麻的正余弦振荡！这也是为什么在分析信号特性时，**极坐标通常比直角坐标直观得多**。",
        "但直角坐标却揭示了离散傅里叶变换（DFT）最核心的魔法——**对偶性（Duality）**。在传统的 DFT 视角里，频域里的**一个样点**对应时域里的**一条正弦波**；而对偶性告诉我们，把时域和频域反过来也完全成立：时域里的**一个样点**，同样对应着频域里的**正余弦波**！",
        "具体来说，时域第 `n₀` 号样点的一个单位冲激 `x[n₀] = 1`，会在频域（从 `-0.5` 到 `0.5`）的**实部**生出 `n₀` 个周期的**余弦波**，并在**虚部**生出 `n₀` 个周期的**负正弦波（Negative Sine Wave）**。正因为我们画出了负频率半轴，这种“时域单点 ↔ 频域正余弦”的对称美才得以完整呈现。"
      ],
      "formula": {
        "expr": "Re{X(f)} = A · cos(2π · f · n₀),   Im{X(f)} = -A · sin(2π · f · n₀)",
        "explain": "A 是时域冲激 x[n₀] 的幅度；n₀ 决定了频域波形在 [-0.5, 0.5] 区间内振荡的周期数；注意虚部前面带有一个负号（-sin）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：直角坐标与对偶性——单点冲激如何“生出”频域正余弦",
      "instruction": "调节「冲激位置 n₀」和「幅度 A」，观察实部余弦与虚部负正弦的周期数变化；打开「叠加复数模长」验证 √(Re²+Im²) 是否永远等于 A。",
      "controls": [
        {
          "type": "slider",
          "id": "n0",
          "label": "冲激位置 n₀",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 4,
          "unit": " 样点"
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "冲激幅度 A",
          "min": 0.2,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "polarOverlay",
          "label": "叠加显示复数模长 A",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction drawBox(px, py, pw, ph, title, yMin, yMax, yTicks, xLabel, xTicks) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, px + pw / 2, py - 10);\n\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  yTicks.forEach(function(t) {\n    const y = py + ph - ((t.v - yMin) / (yMax - yMin)) * ph;\n    ctx.strokeStyle = Math.abs(t.v) < 1e-6 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(px, y);\n    ctx.lineTo(px + pw, y);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(t.l, px - 5, y + 3);\n  });\n\n  ctx.textAlign = 'center';\n  xTicks.forEach(function(t) {\n    const x = px + t.pos * pw;\n    ctx.strokeStyle = Math.abs(t.v) < 1e-6 && t.pos > 0.01 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(x, py);\n    ctx.lineTo(x, py + ph);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(t.l, x, py + ph + 13);\n  });\n\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText(xLabel, px + pw / 2, py + ph + 26);\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const n0 = lab.values.n0;\n  const amp = lab.values.amp;\n  const showMod = !!lab.values.polarOverlay;\n\n  const p1 = { x: 34, y: 28, w: 186, h: 174 };\n  const p2 = { x: 274, y: 28, w: 186, h: 174 };\n  const p3 = { x: 514, y: 28, w: 186, h: 174 };\n\n  const yTicks = [{ v: -2, l: '-2' }, { v: -1, l: '-1' }, { v: 0, l: '0' }, { v: 1, l: '1' }, { v: 2, l: '2' }];\n  const fTicks = [{ v: -0.5, pos: 0, l: '-0.5' }, { v: 0, pos: 0.5, l: '0' }, { v: 0.5, pos: 1, l: '0.5' }];\n\n  drawBox(p1.x, p1.y, p1.w, p1.h, '时域: x[' + n0 + '] = ' + amp.toFixed(1), -2, 2, yTicks, '样点序号 n', [\n    { v: 0, pos: 0, l: '0' }, { v: 16, pos: 16 / 63, l: '16' }, { v: 32, pos: 32 / 63, l: '32' }, { v: 48, pos: 48 / 63, l: '48' }, { v: 63, pos: 1, l: '63' }\n  ]);\n\n  const y0 = p1.y + p1.h * 0.5;\n  const yA = p1.y + p1.h - ((amp + 2) / 4) * p1.h;\n  const sx = p1.x + (n0 / 63) * p1.w;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(p1.x, y0); ctx.lineTo(p1.x + p1.w, y0); ctx.stroke();\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath(); ctx.moveTo(sx, y0); ctx.lineTo(sx, yA); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(sx - 3, yA - 3, 6, 6);\n\n  drawBox(p2.x, p2.y, p2.w, p2.h, '频域实部: A·cos(2πfn₀)', -2, 2, yTicks, '归一化频率', fTicks);\n  drawBox(p3.x, p3.y, p3.w, p3.h, '频域虚部: -A·sin(2πfn₀)', -2, 2, yTicks, '归一化频率', fTicks);\n\n  const N = 64;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const f = -0.5 + i / N;\n    const val = amp * Math.cos(2 * Math.PI * f * n0);\n    const x = p2.x + (i / N) * p2.w;\n    const y = p2.y + p2.h - ((val + 2) / 4) * p2.h;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  for (let i = 0; i <= N; i += 2) {\n    const f = -0.5 + i / N;\n    const val = amp * Math.cos(2 * Math.PI * f * n0);\n    const x = p2.x + (i / N) * p2.w;\n    const y = p2.y + p2.h - ((val + 2) / 4) * p2.h;\n    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);\n  }\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const f = -0.5 + i / N;\n    const val = -amp * Math.sin(2 * Math.PI * f * n0);\n    const x = p3.x + (i / N) * p3.w;\n    const y = p3.y + p3.h - ((val + 2) / 4) * p3.h;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  for (let i = 0; i <= N; i += 2) {\n    const f = -0.5 + i / N;\n    const val = -amp * Math.sin(2 * Math.PI * f * n0);\n    const x = p3.x + (i / N) * p3.w;\n    const y = p3.y + p3.h - ((val + 2) / 4) * p3.h;\n    ctx.fillRect(x - 1.5, y - 1.5, 3, 3);\n  }\n\n  if (showMod) {\n    const yMod = p2.y + p2.h - ((amp + 2) / 4) * p2.h;\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    ctx.moveTo(p2.x, yMod); ctx.lineTo(p2.x + p2.w, yMod);\n    ctx.moveTo(p3.x, yMod); ctx.lineTo(p3.x + p3.w, yMod);\n    ctx.stroke();\n    ctx.restore();\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 10px monospace';\n    ctx.textAlign = 'left';\n    ctx.fillText('√(Re²+Im²)= ' + amp.toFixed(1), p2.x + 6, yMod - 5);\n  }\n\n  lab.setReadout('x[' + n0 + '] = ' + amp.toFixed(1) + ' → 频域实部: ' + n0 + ' 周期余弦波 | 频域虚部: ' + n0 + ' 周期负正弦波 | 合成模长恒为 ' + amp.toFixed(1));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "四、从对偶性出发：计算 DFT 的另一种经典算法",
      "paragraphs": [
        "冲激对的直角坐标性质不仅漂亮，还能直接变成一种计算离散傅里叶变换（DFT）的算法！在传统的**相关法（Correlation Method）**中，我们是外层遍历每一个频率、内层遍历所有时域样点去做内积；而利用对偶性，我们只需**把内外层循环对调**即可。",
        "这套逆向生成算法只有三步：**（1）** 依次遍历时域信号中的每一个样点 `x[n]`；**（2）** 为每个样点构造一条振幅为 `x[n]`、在频谱中振荡 `n` 个周期的**余弦波**和**负正弦波**；**（3）** 把所有时域样点贡献的正余弦波分别直接相加，就得到了最终频谱的实部和虚部！",
        "这证明了一个极其深刻的线性事实：任意复杂时域波形的频谱，本质上都是把信号拆成一个个离散冲激后，它们各自的“余弦实部 + 负正弦虚部”在频域里线性叠加的结果。"
      ],
      "formula": {
        "expr": "Re{X(f)} = Σ x[n] · cos(2π · f · n),   Im{X(f)} = -Σ x[n] · sin(2π · f · n)",
        "explain": "对每个时域样点 n 求和：样点幅度 x[n] 决定频域正余弦波的振幅，样点序号 n 决定频域正余弦波的振荡频率（周期数）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：时域逐点叠加算 DFT——亲眼看见“交换内外循环”",
      "instruction": "设置两个不同位置的时域样点 x[n₁] 和 x[n₂]，观察它们各自生成的正余弦（虚线）如何直接相加形成最终频谱（实线）。",
      "controls": [
        {
          "type": "slider",
          "id": "n1",
          "label": "样点 1 位置 n₁",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "a1",
          "label": "样点 1 幅度 a₁",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "n2",
          "label": "样点 2 位置 n₂",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "a2",
          "label": "样点 2 幅度 a₂",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showComp",
          "label": "显示单点贡献分量(虚线)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction drawGrid(px, py, pw, ph, title, yMin, yMax, yTicks, xLabel, xTicks) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, px + pw / 2, py - 10);\n\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  yTicks.forEach(function(t) {\n    const y = py + ph - ((t.v - yMin) / (yMax - yMin)) * ph;\n    ctx.strokeStyle = Math.abs(t.v) < 1e-6 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(t.l, px - 5, y + 3);\n  });\n\n  ctx.textAlign = 'center';\n  xTicks.forEach(function(t) {\n    const x = px + t.pos * pw;\n    ctx.strokeStyle = Math.abs(t.v) < 1e-6 && t.pos > 0.01 ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(t.l, x, py + ph + 13);\n  });\n\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText(xLabel, px + pw / 2, py + ph + 26);\n}\n\nfunction plotCurve(px, py, pw, ph, yMin, yMax, fn, color, width, dashed) {\n  const M = 128;\n  ctx.save();\n  if (dashed) ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = color;\n  ctx.lineWidth = width;\n  ctx.beginPath();\n  for (let i = 0; i <= M; i++) {\n    const f = -0.5 + i / M;\n    const val = fn(f);\n    const x = px + (i / M) * pw;\n    const y = py + ph - ((val - yMin) / (yMax - yMin)) * ph;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const n1 = lab.values.n1;\n  const a1 = lab.values.a1;\n  const n2 = lab.values.n2;\n  const a2 = lab.values.a2;\n  const showComp = !!lab.values.showComp;\n\n  const p1 = { x: 34, y: 28, w: 186, h: 174 };\n  const p2 = { x: 274, y: 28, w: 186, h: 174 };\n  const p3 = { x: 514, y: 28, w: 186, h: 174 };\n\n  const yTicks = [{ v: -2, l: '-2' }, { v: -1, l: '-1' }, { v: 0, l: '0' }, { v: 1, l: '1' }, { v: 2, l: '2' }];\n  const fTicks = [{ v: -0.5, pos: 0, l: '-0.5' }, { v: 0, pos: 0.5, l: '0' }, { v: 0.5, pos: 1, l: '0.5' }];\n\n  drawGrid(p1.x, p1.y, p1.w, p1.h, '时域两样点输入 (0~10)', -2, 2, yTicks, '样点序号 n', [\n    { v: 0, pos: 0, l: '0' }, { v: 5, pos: 0.5, l: '5' }, { v: 10, pos: 1, l: '10' }\n  ]);\n\n  const y0 = p1.y + p1.h * 0.5;\n  for (let n = 0; n <= 10; n++) {\n    let v = 0;\n    if (n === n1) v += a1;\n    if (n === n2) v += a2;\n    const sx = p1.x + (n / 10) * p1.w;\n    const sy = p1.y + p1.h - ((v + 2) / 4) * p1.h;\n    let col = 'rgba(248,250,252,0.35)';\n    if (n === n1 && n === n2) col = '#10b981';\n    else if (n === n1) col = '#38bdf8';\n    else if (n === n2) col = '#f59e0b';\n    if (Math.abs(v) > 1e-6) {\n      ctx.strokeStyle = col;\n      ctx.lineWidth = 2.5;\n      ctx.beginPath(); ctx.moveTo(sx, y0); ctx.lineTo(sx, sy); ctx.stroke();\n    }\n    ctx.fillStyle = col;\n    ctx.fillRect(sx - 2.5, sy - 2.5, 5, 5);\n  }\n\n  drawGrid(p2.x, p2.y, p2.w, p2.h, '频域实部: 叠加后的余弦和', -2, 2, yTicks, '归一化频率', fTicks);\n  drawGrid(p3.x, p3.y, p3.w, p3.h, '频域虚部: 叠加后的负正弦和', -2, 2, yTicks, '归一化频率', fTicks);\n\n  if (showComp) {\n    plotCurve(p2.x, p2.y, p2.w, p2.h, -2, 2, function(f) { return a1 * Math.cos(2 * Math.PI * f * n1); }, 'rgba(56,189,248,0.55)', 1.2, true);\n    plotCurve(p2.x, p2.y, p2.w, p2.h, -2, 2, function(f) { return a2 * Math.cos(2 * Math.PI * f * n2); }, 'rgba(245,158,11,0.55)', 1.2, true);\n    plotCurve(p3.x, p3.y, p3.w, p3.h, -2, 2, function(f) { return -a1 * Math.sin(2 * Math.PI * f * n1); }, 'rgba(56,189,248,0.55)', 1.2, true);\n    plotCurve(p3.x, p3.y, p3.w, p3.h, -2, 2, function(f) { return -a2 * Math.sin(2 * Math.PI * f * n2); }, 'rgba(245,158,11,0.55)', 1.2, true);\n  }\n\n  plotCurve(p2.x, p2.y, p2.w, p2.h, -2, 2, function(f) {\n    return a1 * Math.cos(2 * Math.PI * f * n1) + a2 * Math.cos(2 * Math.PI * f * n2);\n  }, '#10b981', 2.2, false);\n\n  plotCurve(p3.x, p3.y, p3.w, p3.h, -2, 2, function(f) {\n    return -a1 * Math.sin(2 * Math.PI * f * n1) - a2 * Math.sin(2 * Math.PI * f * n2);\n  }, '#ec4899', 2.2, false);\n\n  lab.setReadout('蓝虚线=样点 ' + n1 + '(幅度 ' + a1.toFixed(1) + ') | 橙虚线=样点 ' + n2 + '(幅度 ' + a2.toFixed(1) + ') | 亮色实线=直接相加得到的 DFT 频谱');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "极坐标看规律，直角坐标看计算：分析延时或冲激响应时务必切到极坐标（幅度平坦、相位线性），千万别试图用肉眼从直角坐标的正余弦振荡里硬读规律。",
        "小心相位卷绕（Phase Wrapping）：程序算出的相位默认被钳在 [-π, +π] 之间。冲激延时越长，锯齿跳变越密集；若要做群延迟求导等计算，必须先做 Unwrap（相位解卷绕）。",
        "记住虚部的负号与负频率的对称美：正变换时，时域样点 x[n] 在频域对应实部的 cos 和虚部的 -sin；把频谱画全到 [-0.5, 0.5] 能让时频对偶性完全对称。",
        "另一种 DFT 思维：任意时域信号做 DFT，既可以理解为“频域基函数去扫描时域（相关法）”，也可以等价理解为“把每个时域样点直接翻译成频域正余弦波然后全部叠加”。"
      ]
    }
  ]
});
