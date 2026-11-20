window.__BOOK_REGISTER_SECTION__("sec_151", {
  "title": "窄带滤波器：带通与带阻（陷波）滤波器 (Narrow-band Filters)",
  "intuition": "只需 5 个递归系数，就能在频谱上精准筑起极窄的“孤峰”或挖出深邃的“峡谷”，像手术刀一样从宽带信号中分离或剔除单频信号（如 60 Hz 交流电嗡嗡声）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心参数与中间变量：如何用 f 和 BW 锚定极窄频段？",
      "paragraphs": [
        "在电子工程与数字信号处理（DSP）中，我们经常需要从宽带背景信号里“精准拿捏”一个极窄的频段。最经典的两个需求分别是：**消除干扰**（例如仪器仪表测量中无处不在的 60 Hz 工频交流电噪声）和**提取信令**（例如电话网络中的双音多频拨号音）。窄带滤波器由此分为两类：**带通滤波器 (Band-pass)** 与 **带阻滤波器 (Band-reject，俗称陷波器 Notch Filter)**。",
        "设计这两类滤波器前，只需选定两个物理意义非常直观的参数：**中心频率 `f`** 与 **带宽 `BW`**（在幅频响应下降到 `0.707` 倍即 `-3 dB` 处测得的宽度）。注意，这两个参数都必须表示为**采样率的比例**，因此取值范围严格在 `0` 到 `0.5` 之间（例如采样率为 1000 Hz 时，60 Hz 对应 `f = 0.06`）。",
        "有了 `f` 和 `BW`，设计流程分三步走：先算出控制共振尖锐度的中间变量 `R`，再算出用于校准通带增益的归一化因子 `K`，最后直接代入公式生成 5 个递归系数。"
      ],
      "formula": {
        "expr": "R = 1 - 3·BW,    K = [1 - 2R·cos(2πf) + R²] / [2 - 2·cos(2πf)]",
        "explain": "R 决定了极点离单位圆的距离（BW 越窄，R 越接近 1，频率选择性越极端）；K 是增益归一化系数，确保带阻滤波器在直流 (0 Hz) 和奈奎斯特频率处的放大倍数恰好为 1。"
      }
    },
    {
      "type": "concept",
      "heading": "带通与陷波递归方程，以及“多次串联”的级联技巧",
      "paragraphs": [
        "拿到 `R` 和 `K` 后，无论是带通（Eq. 19-7）还是带阻（Eq. 19-8），在时域上都执行完全相同的二阶差分方程：`y[n] = a0·x[n] + a1·x[n-1] + a2·x[n-2] + b1·y[n-1] + b2·y[n-2]`。有趣的是，两者的分母反馈系数 `b1 = 2R·cos(2πf)` 与 `b2 = -R²` 完全一致，仅前向系数 `a0, a1, a2` 不同，在复频域上恰好满足互补关系 `H_带通(z) + H_带阻(z) = 1`。",
        "对于**带通滤波器**（Eq. 19-7），其系数为 `a0 = 1 - K`、`a1 = 2(K - R)cos(2πf)`、`a2 = R² - K`；对于**带阻/陷波滤波器**（Eq. 19-8），系数则更为对称：`a0 = K`、`a1 = -2K·cos(2πf)`、`a2 = K`，分子直接在单位圆的 `±2πf` 处埋下了一对完美零点，把中心频率处的能量彻底归零。",
        "观察单级带通滤波器的频响会发现，虽然主峰很尖，但两侧拖着长长的“裙边”（Tails），对远端频率的衰减不够彻底。工程上如何把裙边压平？答案是**级联多个相同阶段**（如串联 3 级）。与其费力推导高阶滤波器的冗长公式，不如直接把同一段信号送进二阶代码里反复过滤两三遍——代码零改动，阻带抑制能力却呈指数级飙升。"
      ],
      "formula": {
        "expr": "y[n] = a0·x[n] + a1·x[n-1] + a2·x[n-2] + b1·y[n-1] + b2·y[n-2]",
        "explain": "二阶 IIR 递归差分方程：当前输出 y[n] 由当前及前两次输入 x，叠加前两次输出 y 的加权和构成。每次计算仅需 5 次乘法和 4 次加法，极度省算力。"
      }
    },
    {
      "type": "lab",
      "heading": "交互频响实验室：带通、陷波与多级级联效应",
      "instruction": "拖动中心频率 f、带宽 BW 与级联级数滑块，或切换陷波模式，实时观察幅频曲线与 0.707 (-3 dB) 带宽标记。",
      "controls": [
        {
          "type": "slider",
          "id": "f",
          "label": "中心频率 f (fs 比例)",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bw",
          "label": "带宽 BW (fs 比例)",
          "min": 0.002,
          "max": 0.06,
          "step": 0.002,
          "value": 0.01,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stages",
          "label": "级联级数",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": " 级"
        },
        {
          "type": "toggle",
          "id": "isNotch",
          "label": "切换为带阻 / 陷波模式 (Notch)",
          "value": false
        }
      ],
      "jsCode": "function calcCoeffs(f, bw, isNotch) {\n  var R = 1 - 3 * bw;\n  if (R < 0.05) R = 0.05;\n  var cos2pf = Math.cos(2 * Math.PI * f);\n  var K = (1 - 2 * R * cos2pf + R * R) / (2 - 2 * cos2pf);\n  var a0, a1, a2;\n  if (isNotch) {\n    a0 = K;\n    a1 = -2 * K * cos2pf;\n    a2 = K;\n  } else {\n    a0 = 1 - K;\n    a1 = 2 * (K - R) * cos2pf;\n    a2 = R * R - K;\n  }\n  var b1 = 2 * R * cos2pf;\n  var b2 = -R * R;\n  return { R: R, K: K, a0: a0, a1: a1, a2: a2, b1: b1, b2: b2 };\n}\n\nfunction magAt(c, nu) {\n  var w = 2 * Math.PI * nu;\n  var cw = Math.cos(w), sw = Math.sin(w);\n  var c2w = Math.cos(2 * w), s2w = Math.sin(2 * w);\n  var numRe = c.a0 + c.a1 * cw + c.a2 * c2w;\n  var numIm = -c.a1 * sw - c.a2 * s2w;\n  var denRe = 1 - c.b1 * cw - c.b2 * c2w;\n  var denIm = c.b1 * sw + c.b2 * s2w;\n  var den2 = denRe * denRe + denIm * denIm;\n  if (den2 < 1e-18) return 1;\n  return Math.sqrt((numRe * numRe + numIm * numIm) / den2);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var f = lab.values.f;\n  var bw = lab.values.bw;\n  var stages = Math.round(lab.values.stages);\n  var isNotch = lab.values.isNotch;\n  var c = calcCoeffs(f, bw, isNotch);\n\n  var padL = 48, padR = 20, padT = 20, padB = 32;\n  var pw = W - padL - padR;\n  var ph = H - padT - padB;\n  var maxY = 1.2;\n\n  function toX(nu) { return padL + (nu / 0.5) * pw; }\n  function toY(amp) { return padT + ph - (amp / maxY) * ph; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n\n  var yTicks = [0, 0.5, 0.707, 1.0];\n  for (var i = 0; i < yTicks.length; i++) {\n    var yv = yTicks[i];\n    var py = toY(yv);\n    ctx.beginPath();\n    if (yv === 0.707) ctx.setLineDash([4, 4]); else ctx.setLineDash([]);\n    ctx.moveTo(padL, py); ctx.lineTo(W - padR, py);\n    ctx.stroke();\n    ctx.fillText(yv === 0.707 ? '.707' : yv.toFixed(1), 8, py + 4);\n  }\n  ctx.setLineDash([]);\n\n  for (var xt = 0; xt <= 5; xt++) {\n    var nu = xt * 0.1;\n    var px = toX(nu);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT + ph); ctx.stroke();\n    ctx.fillText(nu.toFixed(1), px - 9, H - 12);\n  }\n  ctx.fillText('归一化频率 (f / fs)', W / 2 - 48, H - 2);\n\n  var fx = toX(f);\n  ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(fx, padT); ctx.lineTo(fx, padT + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  var N = 360;\n  if (stages > 1) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    for (var s = 0; s <= N; s++) {\n      var nu1 = (s / N) * 0.5;\n      var m1 = Math.min(maxY, magAt(c, nu1));\n      if (s === 0) ctx.moveTo(toX(nu1), toY(m1));\n      else ctx.lineTo(toX(nu1), toY(m1));\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  var mainColor = isNotch ? '#38bdf8' : '#10b981';\n  ctx.strokeStyle = mainColor;\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var j = 0; j <= N; j++) {\n    var nu2 = (j / N) * 0.5;\n    var m = Math.pow(magAt(c, nu2), stages);\n    if (m > maxY) m = maxY;\n    var x2 = toX(nu2), y2 = toY(m);\n    if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);\n  }\n  ctx.stroke();\n\n  ctx.lineTo(toX(0.5), toY(0));\n  ctx.lineTo(toX(0), toY(0));\n  ctx.closePath();\n  ctx.fillStyle = isNotch ? 'rgba(56,189,248,0.10)' : 'rgba(16,185,129,0.12)';\n  ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText((isNotch ? '带阻(陷波)' : '带通') + ' ' + stages + ' 级响应', padL + 8, padT + 14);\n  if (stages > 1) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('--- 虚线: 单级对比', padL + 150, padT + 14);\n  }\n\n  lab.setReadout(\n    'R=' + c.R.toFixed(4) + '  K=' + c.K.toFixed(4) +\n    '  |  a0=' + c.a0.toFixed(4) + ', a1=' + c.a1.toFixed(4) + ', a2=' + c.a2.toFixed(4) +\n    ', b1=' + c.b1.toFixed(4) + ', b2=' + c.b2.toFixed(4)\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "时域步进响应的微弱振铃与单精度浮点极限",
      "paragraphs": [
        "工程师在使用陷波器去除 60 Hz 干扰时，最担心的一个问题是：它会不会把原本有用的时域脉冲或阶跃波形“搞变形”？书中的图 19-6c 给出了定心丸——**带阻滤波器的阶跃响应（Step Response）虽然存在可见的过冲与振铃（Overshoot & Ringing），但振幅非常微小**。这意味着它能在切除窄带干扰的同时，几乎不扭曲原始信号的时域轮廓。",
        "不过，带宽 `BW` 并非可以无限压窄。由于 `R = 1 - 3·BW`，当 `BW` 极小时，`R` 会无限逼近 `1`。在使用**单精度浮点数（32-bit float）**实现时，能够稳定获得的最小带宽大约是采样率的 `0.0003` 倍（`BW ≈ 0.0003`）。",
        "一旦强行突破这个极限，系数微小的舍入误差就会导致极点与零点的相对位置发生偏移，陷波坑底不再归零，衰减性能急剧恶化，甚至引发数值不稳定。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "时域“手术刀”与听觉实验：实时剔除或提取单频嗡嗡声",
      "instruction": "点击播放按钮对比听感：有用信号为温暖低音 (110 Hz + 220 Hz)，叠加了刺耳的干扰单音。观察波形左侧的瞬态收敛过程！",
      "controls": [
        {
          "type": "slider",
          "id": "f_hz",
          "label": "干扰频率",
          "min": 350,
          "max": 1200,
          "step": 10,
          "value": 600,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "bw_norm",
          "label": "滤波器带宽 BW",
          "min": 0.0005,
          "max": 0.015,
          "step": 0.0005,
          "value": 0.002,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "filterOn",
          "label": "开启窄带滤波器",
          "value": true
        },
        {
          "type": "toggle",
          "id": "isBandPass",
          "label": "带通模式 (开=只听干扰 / 关=陷波剔除)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放音频对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioCtx = null, scriptNode = null, gainNode = null, audioInited = false;\nvar ax1 = 0, ax2 = 0, ay1 = 0, ay2 = 0;\nvar p1 = 0, p2 = 0, pInt = 0;\n\nfunction getParams(fs) {\n  var fHz = lab.values.f_hz;\n  var bw = lab.values.bw_norm;\n  var isBP = lab.values.isBandPass;\n  var fNorm = fHz / fs;\n  if (fNorm < 0.001) fNorm = 0.001;\n  if (fNorm > 0.49) fNorm = 0.49;\n  var R = 1 - 3 * bw;\n  if (R < 0.05) R = 0.05;\n  var cos2pf = Math.cos(2 * Math.PI * fNorm);\n  var denom = 2 - 2 * cos2pf;\n  var K = denom > 1e-12 ? (1 - 2 * R * cos2pf + R * R) / denom : 0.5;\n  var a0, a1, a2;\n  if (isBP) {\n    a0 = 1 - K; a1 = 2 * (K - R) * cos2pf; a2 = R * R - K;\n  } else {\n    a0 = K; a1 = -2 * K * cos2pf; a2 = K;\n  }\n  return { R: R, K: K, fNorm: fNorm, a0: a0, a1: a1, a2: a2, b1: 2 * R * cos2pf, b2: -R * R };\n}\n\nfunction ensureAudio() {\n  if (audioInited) return;\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  audioInited = true;\n  gainNode = audioCtx.createGain();\n  gainNode.gain.value = 0;\n  scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);\n  scriptNode.onaudioprocess = function(e) {\n    var out = e.outputBuffer.getChannelData(0);\n    var fs = audioCtx.sampleRate || 48000;\n    var c = getParams(fs);\n    var filterOn = lab.values.filterOn;\n    var dp1 = 2 * Math.PI * 110 / fs;\n    var dp2 = 2 * Math.PI * 220 / fs;\n    var dpInt = 2 * Math.PI * lab.values.f_hz / fs;\n    var twoPi = 2 * Math.PI;\n    for (var i = 0; i < out.length; i++) {\n      p1 += dp1; if (p1 > twoPi) p1 -= twoPi;\n      p2 += dp2; if (p2 > twoPi) p2 -= twoPi;\n      pInt += dpInt; if (pInt > twoPi) pInt -= twoPi;\n      var x = 0.25 * Math.sin(p1) + 0.16 * Math.sin(p2) + 0.28 * Math.sin(pInt);\n      var y = c.a0 * x + c.a1 * ax1 + c.a2 * ax2 + c.b1 * ay1 + c.b2 * ay2;\n      if (!isFinite(y)) y = 0;\n      ax2 = ax1; ax1 = x;\n      ay2 = ay1; ay1 = y;\n      var s = filterOn ? y : x;\n      out[i] = s > 0.95 ? 0.95 : (s < -0.95 ? -0.95 : s);\n    }\n  };\n  scriptNode.connect(gainNode);\n  gainNode.connect(audioCtx.destination);\n}\n\nfunction draw(timeSec) {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var fs = (audioCtx && audioCtx.sampleRate) ? audioCtx.sampleRate : 48000;\n  var c = getParams(fs);\n  var filterOn = lab.values.filterOn;\n  var isBP = lab.values.isBandPass;\n  var fHz = lab.values.f_hz;\n\n  var N = 1200;\n  var rawArr = new Float32Array(N);\n  var outArr = new Float32Array(N);\n  var x1 = 0, x2 = 0, y1 = 0, y2 = 0;\n  var tShift = timeSec || 0;\n\n  for (var n = 0; n < N; n++) {\n    var t = n / fs + tShift;\n    var sig = 0.36 * Math.sin(2 * Math.PI * 110 * t) + 0.22 * Math.sin(2 * Math.PI * 220 * t);\n    var noise = 0.38 * Math.sin(2 * Math.PI * fHz * t);\n    var x = sig + noise;\n    var y = c.a0 * x + c.a1 * x1 + c.a2 * x2 + c.b1 * y1 + c.b2 * y2;\n    x2 = x1; x1 = x;\n    y2 = y1; y1 = y;\n    rawArr[n] = x;\n    outArr[n] = filterOn ? y : x;\n  }\n\n  var padL = 42, padR = 16, padT = 26, padB = 26;\n  var pw = W - padL - padR;\n  var ph = H - padT - padB;\n  var midY = padT + ph / 2;\n  var scaleY = ph * 0.44;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gy = -1; gy <= 1; gy++) {\n    var py = midY - gy * scaleY;\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke();\n  }\n  for (var ms = 0; ms <= 25; ms += 5) {\n    var px = padL + (ms / 25) * pw;\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT + ph); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx.font = '10px monospace';\n    ctx.fillText(ms + 'ms', px - 8, H - 8);\n  }\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.42)';\n  ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var rx = padL + (i / (N - 1)) * pw;\n    var ry = midY - rawArr[i] * scaleY;\n    if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.stroke();\n\n  var fgColor = !filterOn ? '#f8fafc' : (isBP ? '#38bdf8' : '#10b981');\n  ctx.strokeStyle = fgColor;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var j = 0; j < N; j++) {\n    var ox = padL + (j / (N - 1)) * pw;\n    var oy = midY - outArr[j] * scaleY;\n    if (j === 0) ctx.moveTo(ox, oy); else ctx.lineTo(ox, oy);\n  }\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('橙线: 原始混合信号 (含 ' + fHz + 'Hz 干扰)', padL + 4, 16);\n  ctx.fillStyle = fgColor;\n  var modeTxt = !filterOn ? '白线: 未滤波直通' : (isBP ? '蓝线: 带通提取 (仅保留干扰)' : '绿线: 陷波过滤 (干扰已剔除)');\n  ctx.fillText(modeTxt, padL + 275, 16);\n\n  var bwHz = (lab.values.bw_norm * fs).toFixed(1);\n  var tauMs = (1000 / (3 * lab.values.bw_norm * fs)).toFixed(1);\n  lab.setReadout(\n    '采样率 fs=' + fs + ' Hz  |  f=' + c.fNorm.toFixed(4) + '  |  实际带宽≈' + bwHz + ' Hz  |  收敛时间常数 τ≈' + tauMs + ' ms'\n  );\n}\n\nlab.onUpdate(function() {\n  if (lab.values.play) {\n    ensureAudio();\n    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n    if (gainNode && audioCtx) gainNode.gain.setTargetAtTime(0.65, audioCtx.currentTime, 0.02);\n  } else if (gainNode && audioCtx) {\n    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n  draw(0);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.play) draw(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【归一化单位陷阱】f 和 BW 必须除以采样率 fs（严格在 0 到 0.5 之间），且窄带近似式 R = 1 - 3·BW 仅在窄带条件下成立，BW 过大时带宽估算会出现偏差。",
        "【单精度浮点数下限】在 32 位 float 环境中，BW 不要低于 0.0003（即不要窄于采样率的万分之三），否则系数量化误差会直接毁掉陷波深度；若必须做超窄带滤波，请直接升级到 double 双精度。",
        "【带通压裙边靠级联】单级带通滤波器的两侧拖尾很长，遇到需要干净隔离邻道干扰的场景时，把数据反复通过同一个二阶滤波器 2～4 次，比重新求解高阶多项式系数简单且稳定得多。",
        "【陷波时间换空间】BW 越窄，极点 R 越贴近 1，滤波器在时域上“锁定并抵消”干扰所需的建立时间（τ ≈ 1 / (1 - R) 个采样点）就越长。"
      ]
    }
  ]
});
