window.__BOOK_REGISTER_SECTION__("sec_124", {
  "title": "连续冲激函数：狄拉克 δ(t) 与系统冲激响应 (The Delta Function)",
  "intuition": "只要输入脉冲比系统的响应时间快得多，系统就完全分辨不出脉冲长什么形状，只会把它的“总面积”当成激发能量，按自己的脾气吐出一个固定形状的波形——冲激响应 h(t)。",
  "blocks": [
    {
      "type": "concept",
      "heading": "用“特性”而非“形状”来定义连续 δ 函数",
      "paragraphs": [
        "在离散信号处理中，单位冲激 `δ[n]` 非常简单直观：在 `n = 0` 处为 1，其余位置全为 0。但把信号搬到连续时间域后，连续信号必须用微积分和数学方程来描述，连续的 **δ 函数（Delta Function）** 在数学上也变得抽象得多。因此，我们不直接去纠结它“长什么样”，而是通过一个思想实验，用它对线性系统产生的**行为特性**来定义它。",
        "想象一个由电阻、电容、电感组成的线性电路。我们把信号发生器接到输入端，用示波器观察输出波形。假设电路的典型响应时间是**毫秒（ms）**量级，而我们输入的短脉冲只有**微秒（μs）**量级——也就是说，输入脉冲比输出波形短得多。经过大量测试，我们会发现三个惊人的规律：",
        "1. **形状无关性**：无论输入的是窄矩形、三角波、还是奇形怪状的双峰毛刺，只要足够短，示波器上看到的**输出波形形状完全一模一样**。\n2. **系统决定论**：输出波形的具体形状，100% 由线性系统内部电阻、电容、电感的数值与连接方式决定，和输入脉冲无关。\n3. **面积正比律**：输出波形的**幅度**直接正比于输入脉冲的**面积**（电压 × 时间）。例如：`1 V × 1 μs`、`10 V × 0.1 μs`、`1000 V × 1 ns` 产生的输出完全相同！更神奇的是，面积还可以是**负的或互相抵消**：如果先来一个 `2 V × 2 μs` 的正脉冲，紧接着跟一个 `-1 V × 4 μs` 的负脉冲，总面积恰好为 `4 - 4 = 0`，系统的输出就会纹丝不动。"
      ],
      "formula": {
        "expr": "y(t) ≈ A · h(t)，其中 A = ∫ x(t) dt",
        "explain": "只要输入脉冲 x(t) 比系统自身的反应时间短得多，输出 y(t) 的形状就固定为系统的单位冲激响应 h(t)，输出幅度仅由输入脉冲的净面积 A 决定。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：短脉冲“形状无关性”与正负面积抵消（含音频对比）",
      "instruction": "保持脉冲宽度很小（如 6 ms），切换“正负双极抵消脉冲”或调节宽度与面积锁定，观察右侧输出波形 y(t)（青绿色）与理想冲激响应（琥珀虚线）的重合度，并开启声音听听输出能量如何变化！",
      "controls": [
        {
          "type": "slider",
          "id": "width",
          "label": "输入脉冲宽度",
          "min": 2,
          "max": 80,
          "step": 1,
          "value": 6,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "输入峰值幅度（未锁定面积时）",
          "min": 0.5,
          "max": 4,
          "step": 0.1,
          "value": 2,
          "unit": " V"
        },
        {
          "type": "toggle",
          "id": "keepArea",
          "label": "锁定脉冲总面积 (A = 10 V·ms)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "bipolar",
          "label": "正负双极抵消脉冲（净面积=0）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 聆听系统响应声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioTimer = 0;\nvar lastPlay = false;\n\nfunction hSys(t) {\n  if (t < 0) return 0;\n  return 2.6 * Math.exp(-t / 22) * (1 - Math.exp(-t / 6)) * (0.65 + 0.35 * Math.cos(2 * Math.PI * t / 48));\n}\n\nfunction computeSim() {\n  var pw = lab.values.width;\n  var amp = lab.values.amp;\n  var keepArea = lab.values.keepArea;\n  var bipolar = lab.values.bipolar;\n  var peak = keepArea ? (10 / pw) : amp;\n  var netArea = bipolar ? 0 : (keepArea ? 10 : amp * pw);\n  var refArea = keepArea ? 10 : (amp * pw);\n\n  var tMin = -10;\n  var tMax = 130;\n  var dt = 0.25;\n  var N = Math.floor((tMax - tMin) / dt);\n  var xArr = new Array(N);\n  var yArr = new Array(N);\n  var yRef = new Array(N);\n\n  var iStart = Math.floor((0 - tMin) / dt);\n  var iEnd = Math.min(N - 1, Math.floor((pw - tMin) / dt));\n\n  for (var i = 0; i < N; i++) {\n    var t = tMin + i * dt;\n    if (t >= 0 && t < pw) {\n      xArr[i] = bipolar ? (t < pw * 0.5 ? peak : -peak) : peak;\n    } else {\n      xArr[i] = 0;\n    }\n    yRef[i] = (refArea / 10) * hSys(t);\n    var sum = 0;\n    for (var j = iStart; j <= iEnd; j++) {\n      var tau = tMin + j * dt;\n      if (t >= tau) {\n        sum += xArr[j] * hSys(t - tau) * dt;\n      }\n    }\n    yArr[i] = sum / 10;\n  }\n  return { tMin: tMin, tMax: tMax, dt: dt, N: N, xArr: xArr, yArr: yArr, yRef: yRef, peak: peak, netArea: netArea, pw: pw, bipolar: bipolar };\n}\n\nfunction draw() {\n  var sim = computeSim();\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var inX0 = 18, inX1 = 238, inBaseY = 148;\n  var outX0 = 375, outX1 = 702, outBaseY = 165;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = inX0; gx <= inX1; gx += 44) {\n    ctx.beginPath(); ctx.moveTo(gx, 32); ctx.lineTo(gx, 210); ctx.stroke();\n  }\n  for (var gx2 = outX0; gx2 <= outX1; gx2 += 54) {\n    ctx.beginPath(); ctx.moveTo(gx2, 32); ctx.lineTo(gx2, 210); ctx.stroke();\n  }\n  ctx.beginPath(); ctx.moveTo(inX0, inBaseY); ctx.lineTo(inX1, inBaseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(outX0, outBaseY); ctx.lineTo(outX1, outBaseY); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('输入脉冲 x(t)', inX0, 22);\n  ctx.fillText('输出波形 y(t) 与参考冲激响应', outX0, 22);\n\n  var boxX = 264, boxY = 98, boxW = 84, boxH = 44;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.fillStyle = 'rgba(56,189,248,0.12)';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(boxX, boxY, boxW, boxH);\n  ctx.strokeRect(boxX, boxY, boxW, boxH);\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'center';\n  ctx.fillText('线性系统', boxX + boxW / 2, boxY + 18);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('h(t)', boxX + boxW / 2, boxY + 34);\n  ctx.textAlign = 'left';\n\n  ctx.strokeStyle = '#64748b';\n  ctx.beginPath(); ctx.moveTo(242, 120); ctx.lineTo(260, 120); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(350, 120); ctx.lineTo(370, 120); ctx.stroke();\n\n  var inScaleY = 26;\n  var maxInPix = 102;\n  ctx.beginPath();\n  for (var i = 0; i < sim.N; i++) {\n    var t = sim.tMin + i * sim.dt;\n    var px = inX0 + ((t - sim.tMin) / (sim.tMax - sim.tMin)) * (inX1 - inX0);\n    var val = sim.xArr[i] * inScaleY;\n    if (val > maxInPix) val = maxInPix;\n    if (val < -54) val = -54;\n    var py = inBaseY - val;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  if (sim.peak * inScaleY > maxInPix) {\n    var arrowX = inX0 + ((0 - sim.tMin) / (sim.tMax - sim.tMin)) * (inX1 - inX0) + 4;\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('↑ 峰值 ' + sim.peak.toFixed(1) + 'V (趋近δ)', arrowX + 6, 46);\n  }\n\n  var outScaleY = 95;\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var k = 0; k < sim.N; k++) {\n    var t2 = sim.tMin + k * sim.dt;\n    var ox = outX0 + ((t2 - sim.tMin) / (sim.tMax - sim.tMin)) * (outX1 - outX0);\n    var oy = outBaseY - sim.yRef[k] * outScaleY;\n    if (k === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);\n  }\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.beginPath();\n  for (var m = 0; m < sim.N; m++) {\n    var t3 = sim.tMin + m * sim.dt;\n    var rx = outX0 + ((t3 - sim.tMin) / (sim.tMax - sim.tMin)) * (outX1 - outX0);\n    var ry = outBaseY - sim.yArr[m] * outScaleY;\n    if (m === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('-- 理想冲激参考', outX0 + 180, 40);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 实际系统输出 y(t)', outX0 + 180, 56);\n\n  var status = sim.pw <= 10 ? '满足冲激条件 (脉冲远短于系统)' : '脉冲过宽 (输出明显展宽/失真)';\n  lab.setReadout('脉宽: ' + sim.pw + ' ms | 峰值: ' + sim.peak.toFixed(2) + ' V | 净面积: ' + sim.netArea.toFixed(1) + ' V·ms | ' + status);\n}\n\nfunction playAudioBurst() {\n  var actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n  var sr = actx.sampleRate;\n  var dur = 0.32;\n  var len = Math.floor(sr * dur);\n  var buf = actx.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n\n  var pw = lab.values.width;\n  var keepArea = lab.values.keepArea;\n  var amp = lab.values.amp;\n  var bipolar = lab.values.bipolar;\n\n  var pwAud = (pw / 80) * 0.014;\n  var wSamples = Math.max(2, Math.round(pwAud * sr));\n  var wHalf = Math.max(1, Math.floor(wSamples / 2));\n  var hScale = keepArea ? (10 / pw) : amp;\n  var dtAud = 1 / sr;\n\n  var cum = new Float32Array(len);\n  var runSum = 0;\n  for (var i = 0; i < len; i++) {\n    var t = i * dtAud;\n    var hVal = Math.exp(-t / 0.045) * Math.sin(2 * Math.PI * 220 * t);\n    runSum += hVal * dtAud;\n    cum[i] = runSum;\n  }\n\n  for (var n = 0; n < len; n++) {\n    var conv = 0;\n    if (!bipolar) {\n      var prev = n >= wSamples ? cum[n - wSamples] : 0;\n      conv = (cum[n] - prev) * hScale * 18;\n    } else {\n      var mid = n >= wHalf ? cum[n - wHalf] : 0;\n      var end = n >= wSamples ? cum[n - wSamples] : 0;\n      conv = (cum[n] - 2 * mid + end) * hScale * 18;\n    }\n    if (conv > 0.85) conv = 0.85;\n    if (conv < -0.85) conv = -0.85;\n    data[n] = conv;\n  }\n\n  var src = actx.createBufferSource();\n  src.buffer = buf;\n  var gain = actx.createGain();\n  gain.gain.value = 0.45;\n  src.connect(gain);\n  gain.connect(actx.destination);\n  src.start();\n}\n\nlab.onUpdate(function() {\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  if (!lab.values.play) {\n    lastPlay = false;\n    audioTimer = 0;\n    return;\n  }\n  if (!lastPlay) {\n    lastPlay = true;\n    audioTimer = 0;\n  }\n  audioTimer -= dt;\n  if (audioTimer <= 0) {\n    audioTimer = 0.72;\n    playAudioBurst();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "数学家的极限抽象：无限窄的 δ(t) 与垂直箭头记号",
      "paragraphs": [
        "物理世界里的“冲激（Impulse）”是一个**相对概念**，完全取决于目标系统的反应速度。对于响应在纳秒（ns）级的微波发射机而言，输入冲激必须短到皮秒（ps）级；但对于历时数千年才缓慢演变的地质板块运动来说，一座连续喷发好几年的火山，也算是一个合格的“瞬时冲激”。",
        "数学家不喜欢受限于具体某个系统的快慢，他们把“足够短”推向极致：定义一种**对任意可能存在的系统都足够短**的信号——**连续 δ 函数（Continuous Delta Function）**。它由三个理想化条件严格定义：\n1. **持续时间无限短**（无穷窄）；\n2. **脉冲发生在时间零点** `t = 0`；\n3. **脉冲的积分面积严格等于 1**（即归一化）。",
        "既然宽度趋近于 0 而面积又要固定为 1，那高度（幅度）不就必须趋近于**无穷大**了吗？别慌，这在工程上完全不重要！因为我们在前面已经验证过：脉冲的幅度只是输入“形状”的一部分，只要它足够窄，系统压根看不见它的高度，只认它的面积。`δ(t)` 是一个纯粹的数学构造，现实世界里能起相同作用的信号永远都有有限的宽度和有限的幅度。",
        "在符号表示上，工程与 DSP 教材通常用圆括号 `( )` 表示连续信号（如 `δ(t)` 和冲激响应 `h(t)`），用方括号 `[ ]` 表示离散信号（如 `δ[n]` 和 `h[n]`）。而在波形图上，连续冲激通常画成一根**垂直向上的箭头**，箭头的长度并不代表幅度，而是直接代表该冲激的**面积**。"
      ],
      "formula": {
        "expr": "∫_{-∞}^{+∞} δ(t) dt = 1 ，且对任意 t ≠ 0 有 δ(t) = 0",
        "explain": "δ(t) 在除 t = 0 外的任何时刻都严格为零，但在 t = 0 处集中了总计为 1 的单位面积。若箭头高度为 k，则表示 k·δ(t)（面积为 k）。"
      }
    },
    {
      "type": "concept",
      "heading": "仰望夜空的冲激响应：为什么火星和天狼星看起来一样大？",
      "paragraphs": [
        "为了把现实世界里的“冲激”理解透彻，不妨抬头看看夜空中的**火星（行星）**和**天狼星（恒星）**。用肉眼看，它们几乎是一样大小、一样明亮的两个光点。但几何尺寸却相差悬殊：火星直径约 `6,000` 公里，距离地球约 `6,000 万`公里；天狼星直径比火星大 `300` 倍，但距离却远了超过 `100 万`倍！算一下视角就会发现，火星在夜空中的张角实际上比天狼星大 **3,000 多倍**。为什么肉眼看起来却毫无区别？",
        "答案就在于：**它们在人眼视网膜上的成像都足够小，小到双双成为了人类视觉系统的“冲激”！** 我们肉眼看到的并不是火星或天狼星真实的圆盘轮廓，而是**人眼光学系统的二维冲激响应**（光学中称为点扩散函数 PSF）。",
        "只要换一架小型望远镜，把视角放大几十倍，打破这个“冲激条件”，真相立刻浮现：火星变大到超越了光学系统的分辨率极限，显露出一个**暗淡的圆盘**；而天狼星即使放大几十倍依然远小于分辨极限，所以它仍然是一个**锐利明亮的冲激亮点**。这也是为什么**恒星会闪烁而行星不闪烁**——天狼星的光束极细，大气湍流中的一粒微尘或一小股气流就能短暂挡住/偏折它；而火星较宽的光束横跨多股气流，局部扰动被平均掉了。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 2：望远镜视角与大气闪烁——火星 vs 天狼星的冲激响应",
      "instruction": "把放大倍数从 1×（肉眼）逐步推高到 25×（望远镜），对比火星与天狼星的亮斑大小与截面曲线；再打开“大气湍流”，观察谁在剧烈闪烁！",
      "controls": [
        {
          "type": "slider",
          "id": "zoom",
          "label": "光学放大倍数 (1× = 肉眼)",
          "min": 1,
          "max": 25,
          "step": 1,
          "value": 1,
          "unit": " ×"
        },
        {
          "type": "slider",
          "id": "psf",
          "label": "人眼/系统冲激响应宽度 σ",
          "min": 2,
          "max": 18,
          "step": 1,
          "value": 11,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "turbulence",
          "label": "开启大气湍流（观察恒星闪烁）",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar cachedZoom = -1;\nvar cachedPsf = -1;\nvar profMars = [];\nvar profSirius = [];\nvar maxR = 48;\n\nfunction erfApprox(x) {\n  var s = x < 0 ? -1 : 1;\n  x = Math.abs(x);\n  var t = 1 / (1 + 0.3275911 * x);\n  var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);\n  return s * y;\n}\n\nfunction computeProfile(R, sigma) {\n  var arr = new Array(maxR + 1);\n  if (R < 0.25) {\n    var c0 = 1 / (2 * Math.PI * sigma * sigma);\n    for (var r = 0; r <= maxR; r++) {\n      arr[r] = c0 * Math.exp(-(r * r) / (2 * sigma * sigma));\n    }\n    return arr;\n  }\n  var steps = 56;\n  var dx = (2 * R) / steps;\n  var gNorm = 1 / (Math.sqrt(2 * Math.PI) * sigma);\n  var area = Math.PI * R * R;\n  for (var r2 = 0; r2 <= maxR; r2++) {\n    var sum = 0;\n    for (var i = 0; i < steps; i++) {\n      var xp = -R + (i + 0.5) * dx;\n      var yy = Math.sqrt(Math.max(0, R * R - xp * xp));\n      var yInt = erfApprox(yy / (Math.SQRT2 * sigma));\n      var diff = r2 - xp;\n      var g1 = gNorm * Math.exp(-(diff * diff) / (2 * sigma * sigma));\n      sum += g1 * yInt * dx;\n    }\n    arr[r2] = sum / area;\n  }\n  return arr;\n}\n\nfunction ensureProfiles() {\n  var z = lab.values.zoom;\n  var s = lab.values.psf;\n  if (z === cachedZoom && s === cachedPsf) return;\n  cachedZoom = z;\n  cachedPsf = s;\n  var rMars = 0.72 * z;\n  var rSirius = 0.002 * z;\n  profMars = computeProfile(rMars, s);\n  profSirius = computeProfile(rSirius, s);\n}\n\nfunction drawOrb(cx, cy, profile, flux, colorRgb, maxRadius) {\n  var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxRadius);\n  var stops = 12;\n  for (var i = 0; i <= stops; i++) {\n    var frac = i / stops;\n    var idx = Math.min(maxR, Math.round(frac * maxRadius));\n    var raw = profile[idx] * flux * 720;\n    var alpha = 1 - Math.exp(-raw);\n    if (alpha > 1) alpha = 1;\n    grad.addColorStop(frac, 'rgba(' + colorRgb + ',' + alpha.toFixed(3) + ')');\n  }\n  ctx.fillStyle = grad;\n  ctx.beginPath();\n  ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);\n  ctx.fill();\n}\n\nfunction renderFrame(timeSec) {\n  ensureProfiles();\n  var z = lab.values.zoom;\n  var s = lab.values.psf;\n  var turb = lab.values.turbulence;\n\n  var rMars = 0.72 * z;\n  var rSirius = 0.002 * z;\n\n  var marsFlux = turb ? (1 + 0.03 * Math.sin(timeSec * 6.5)) : 1.0;\n  var siriusFlux = turb ? Math.max(0.12, Math.min(1.85, 1 + 0.48 * Math.sin(timeSec * 16.3) + 0.34 * Math.cos(timeSec * 27.9) + 0.22 * Math.sin(timeSec * 41.1))) : 1.0;\n  var jx = turb ? 1.8 * Math.sin(timeSec * 22.0) : 0;\n  var jy = turb ? 1.5 * Math.cos(timeSec * 18.0) : 0;\n\n  ctx.fillStyle = '#070b14';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(W / 2, 10); ctx.lineTo(W / 2, H - 10); ctx.stroke();\n\n  drawOrb(180, 74, profMars, marsFlux, '245,158,11', maxR);\n  drawOrb(540 + jx, 74 + jy, profSirius, siriusFlux, '56,189,248', maxR);\n\n  if (rMars >= 2.2) {\n    ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath(); ctx.arc(180, 74, rMars, 0, Math.PI * 2); ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('火星 Mars（真实半径大，放大后变暗淡圆盘）', 20, 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('天狼星 Sirius（真实半径极小，始终是冲激）', 380, 22);\n\n  var baseLineY = 216;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath(); ctx.moveTo(24, baseLineY); ctx.lineTo(336, baseLineY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(384, baseLineY); ctx.lineTo(696, baseLineY); ctx.stroke();\n\n  var peakScale = 2 * Math.PI * s * s * 44;\n  if (peakScale > 3800) peakScale = 3800;\n  var refMax = 1 / (2 * Math.PI * 11 * 11);\n  var plotGain = 52 / refMax;\n\n  function drawProfileCurve(cx, prof, flux, strokeCol) {\n    ctx.beginPath();\n    for (var x = -maxR; x <= maxR; x++) {\n      var idx = Math.abs(x);\n      var val = prof[idx] * flux * plotGain;\n      if (val > 82) val = 82;\n      var px = cx + x * 2.6;\n      var py = baseLineY - val;\n      if (x === -maxR) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.strokeStyle = strokeCol;\n    ctx.lineWidth = 2.2;\n    ctx.stroke();\n  }\n\n  drawProfileCurve(180, profMars, marsFlux, '#f59e0b');\n  drawProfileCurve(540, profSirius, siriusFlux, '#38bdf8');\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('视网膜光强截面 I(x)', 24, 152);\n  ctx.fillText('视网膜光强截面 I(x)', 384, 152);\n\n  var marsState = rMars < s * 0.4 ? '冲激区(像点)' : '已分辨圆盘(表面变暗)';\n  lab.setReadout('放大: ' + z + '× | 系统PSF宽度 σ=' + s + 'px | 火星半径=' + rMars.toFixed(1) + 'px (' + marsState + ') | 天狼星半径=' + rSirius.toFixed(3) + 'px (永远是冲激)');\n}\n\nlab.onUpdate(function() {\n  renderFrame(0);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.turbulence) {\n    renderFrame(timeSec);\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1：现实世界不存在“宽度为 0、高度无穷大”的信号。做硬件测试或仿真时，只要你输入的方波/尖峰宽度远小于系统最快的上升时间（经验法则：≤ 1/10），系统就会把它当成理想 δ(t)。",
        "避坑 2：脉冲的能量贡献看的是“积分面积”而不是“峰值电压”。如果窄脉冲正负面积相等且紧挨在一起（净面积为 0），线性系统会直接忽略它、毫无输出。",
        "核心记号：连续信号和连续系统用圆括号 δ(t)、h(t)，离散信号用方括号 δ[n]、h[n]；图纸上画的垂直箭头长度代表的是冲激的“面积”。",
        "物理直觉：无论是电子电路、声学房间还是望远镜与人眼，只要输入尺度远小于系统本身的最小分辨尺度，你测量到的就不是输入本身，而是系统自身的冲激响应 h(t)。"
      ]
    }
  ]
});
