window.__BOOK_REGISTER_SECTION__("sec_237", {
  "title": "从圆到椭圆的极点翘曲变换 (Warp from Circle to Ellipse)",
  "intuition": "把巴特沃斯滤波器在 s 平面上排成正圆的极点沿实轴“压扁”成椭圆，就能以通带内可控的小波纹为代价，换取过渡带滚降陡峭度的爆发式提升。",
  "blocks": [
    {
      "type": "concept",
      "heading": "几何直觉：为什么把圆“压扁”就能让滤波器变陡？",
      "paragraphs": [
        "在上一节中，程序首先在复频域（**s 平面**）生成了一个标准的**巴特沃斯（Butterworth）低通原型**：它的全部极点（`RP ± j·IP`，即 `σ ± jω`）等间距地落在半径为 `1` 的左半圆周上。由于极点到虚轴（频率轴 `jω`）的距离分布均衡，巴特沃斯滤波器的通带像镜面一样平坦，但过渡带也相对平缓。",
        "为了实现过渡带极其陡峭的**切比雪夫（Chebyshev）滤波器**，我们需要对极点进行一次巧妙的坐标变换——**把圆压成椭圆**。当极点沿着实轴方向被向内压缩（`|σ'|` 变小），所有极点都会整体向虚轴 `jω` 靠近。",
        "在复平面中，极点越靠近虚轴，系统在该频率附近的谐振就越强烈：当输入信号的频率掠过这些极点附近时，幅频响应会被局部“顶起”，从而在通带内形成起伏均匀的**波纹（Passband Ripple, `PR`）**；而一旦越过最后一个极点，由于整个极点簇集体离虚轴更近，离开通带后的衰减就会像悬崖一样急剧下跌。"
      ],
      "formula": {
        "expr": "σ' = σ · sinh(v) / k ,    ω' = ω · cosh(v) / k",
        "explain": "Equation 33-9 核心映射：σ、ω 为原始单位圆上的极点实部与虚部；σ'、ω' 为翘曲到椭圆后的新极点坐标；sinh(v) 与 cosh(v) 分别决定椭圆的短轴与长轴压缩比例；分母 k 用于将截止频率重新拉回 1。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：s 平面极点“压扁”与频响实时联动",
      "instruction": "拖动「通带波纹 (PR)」和「极点数 (NP)」滑块，观察左图极点如何从圆压成椭圆，并对比右图过渡带的陡峭度变化；尝试关闭「除以 k 归一化」观察截止频率如何漂移。",
      "controls": [
        {
          "type": "slider",
          "id": "pr",
          "label": "通带波纹 (PR)",
          "min": 0,
          "max": 29,
          "step": 0.5,
          "value": 6,
          "unit": " %"
        },
        {
          "type": "slider",
          "id": "np",
          "label": "极点数 (NP)",
          "min": 2,
          "max": 16,
          "step": 2,
          "value": 6,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "normK",
          "label": "除以 k 归一化 (-3dB 锁定在 ω=1)",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction sinh(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }\nfunction cosh(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }\nfunction asinh(x) { return Math.log(x + Math.sqrt(x * x + 1)); }\nfunction acosh(x) { return Math.log(x + Math.sqrt(Math.max(0, x * x - 1))); }\n\nfunction evalMag(poles, w, dcGainScale) {\n  var num = 1;\n  var den = 1;\n  for (var i = 0; i < poles.length; i++) {\n    var sr = poles[i].sr;\n    var si = poles[i].si;\n    var dcSq = sr * sr + si * si;\n    var d1 = Math.sqrt(sr * sr + (w - si) * (w - si));\n    var d2 = Math.sqrt(sr * sr + (w + si) * (w + si));\n    num *= dcSq;\n    den *= d1 * d2;\n  }\n  return (num / den) * dcGainScale;\n}\n\nfunction render() {\n  var pr = lab.values.pr;\n  var np = lab.values.np;\n  var normK = lab.values.normK;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var eps = 0, vx = 0, kx = 1;\n  if (pr > 0) {\n    var r = 100 / (100 - pr);\n    eps = Math.sqrt(r * r - 1);\n    var invEps = 1 / eps;\n    vx = asinh(invEps) / np;\n    kx = cosh(acosh(Math.max(1, invEps)) / np);\n  }\n  var kDiv = normK ? kx : 1;\n\n  var buttPoles = [];\n  var chebPoles = [];\n  for (var m = 1; m <= np / 2; m++) {\n    var theta = Math.PI / 2 + (2 * m - 1) * Math.PI / (2 * np);\n    var sig = Math.cos(theta);\n    var omg = Math.sin(theta);\n    buttPoles.push({ sr: sig, si: omg });\n    if (pr === 0) {\n      chebPoles.push({ sr: sig, si: omg });\n    } else {\n      chebPoles.push({\n        sr: sig * sinh(vx) / kDiv,\n        si: omg * cosh(vx) / kDiv\n      });\n    }\n  }\n\n  var ox = 205, oy = 122, sc = 76;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = -2; gx <= 0.5; gx += 0.5) {\n    ctx.beginPath();\n    ctx.moveTo(ox + gx * sc, 20);\n    ctx.lineTo(ox + gx * sc, H - 18);\n    ctx.stroke();\n  }\n  for (var gy = -1; gy <= 1; gy += 0.5) {\n    ctx.beginPath();\n    ctx.moveTo(22, oy - gy * sc);\n    ctx.lineTo(255, oy - gy * sc);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(22, oy); ctx.lineTo(255, oy);\n  ctx.moveTo(ox, 20); ctx.lineTo(ox, H - 18);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('s 平面 (左半平面)', 24, 18);\n  ctx.fillText('jω', ox + 5, 28);\n  ctx.fillText('σ', 246, oy - 5);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.arc(ox, oy, sc, Math.PI / 2, 1.5 * Math.PI);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var rx = (pr === 0) ? sc : (sinh(vx) / kDiv) * sc;\n  var ry = (pr === 0) ? sc : (cosh(vx) / kDiv) * sc;\n  ctx.strokeStyle = 'rgba(16,185,129,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var a = Math.PI / 2; a <= 1.5 * Math.PI + 0.02; a += 0.04) {\n    var ex = ox + rx * Math.cos(a);\n    var ey = oy - ry * Math.sin(a);\n    if (a === Math.PI / 2) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);\n  }\n  ctx.stroke();\n\n  for (var i = 0; i < buttPoles.length; i++) {\n    var bp = buttPoles[i];\n    var cp = chebPoles[i];\n    var bx = ox + bp.sr * sc, byTop = oy - bp.si * sc, byBot = oy + bp.si * sc;\n    var cx = ox + cp.sr * sc, cyTop = oy - cp.si * sc, cyBot = oy + cp.si * sc;\n\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(bx, byTop); ctx.lineTo(cx, cyTop);\n    ctx.moveTo(bx, byBot); ctx.lineTo(cx, cyBot);\n    ctx.stroke();\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.arc(bx, byTop, 4, 0, Math.PI * 2); ctx.stroke();\n    ctx.beginPath(); ctx.arc(bx, byBot, 4, 0, Math.PI * 2); ctx.stroke();\n\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(cx, cyTop, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.beginPath(); ctx.arc(cx, cyBot, 4.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  var px = 305, py = 28, pw = 395, ph = 180;\n  var wMax = 2.2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var wf = 0; wf <= 2.01; wf += 0.5) {\n    var fx = px + (wf / wMax) * pw;\n    ctx.beginPath(); ctx.moveTo(fx, py); ctx.lineTo(fx, py + ph); ctx.stroke();\n  }\n  for (var amp = 0; amp <= 1.01; amp += 0.25) {\n    var fy = py + ph - amp * ph;\n    ctx.beginPath(); ctx.moveTo(px, fy); ctx.lineTo(px + pw, fy); ctx.stroke();\n  }\n\n  if (pr > 0) {\n    var rLow = 1 - pr / 100;\n    ctx.fillStyle = 'rgba(245,158,11,0.12)';\n    ctx.fillRect(px, py, (1 / kDiv / wMax) * pw, (1 - rLow) * ph);\n  }\n\n  var y3db = py + ph - 0.7071 * ph;\n  var xWc = px + (1 / wMax) * pw;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(px, y3db); ctx.lineTo(px + pw, y3db);\n  ctx.moveTo(xWc, py); ctx.lineTo(xWc, py + ph);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var k = 0; k <= 160; k++) {\n    var w = (k / 160) * wMax;\n    var g = evalMag(buttPoles, w, 1);\n    var x = px + (w / wMax) * pw;\n    var y = py + ph - g * ph;\n    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var dcScale = (pr === 0) ? 1 : 1 / Math.sqrt(1 + eps * eps);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var k = 0; k <= 200; k++) {\n    var w = (k / 200) * wMax;\n    var g = evalMag(chebPoles, w, dcScale);\n    var x = px + (w / wMax) * pw;\n    var y = py + ph - g * ph;\n    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.fillText('幅频响应 |H(jω)| (蓝虚线:巴特沃斯 / 绿实线:切比雪夫)', px, 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('-3dB (0.707)', px + pw - 68, y3db - 4);\n  ctx.fillText('ω=1', xWc + 4, py + ph - 6);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('0', px - 4, py + ph + 14);\n  ctx.fillText('2.0', px + (2.0 / wMax) * pw - 8, py + ph + 14);\n\n  var gAt1 = evalMag(chebPoles, 1, dcScale);\n  lab.setReadout('ε=' + eps.toFixed(3) + ' | v=' + vx.toFixed(3) + ' | k=' + kx.toFixed(3) + ' | ω=1处增益=' + gAt1.toFixed(3) + (pr === 0 ? ' (已旁路: 纯巴特沃斯)' : ''));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "核心参数拆解：`ε`、`v`、`k` 与双曲函数的程序实现",
      "paragraphs": [
        "为了把 Equation 33-9 写得简洁且便于编程，书中引入了三个辅助变量（在示例 BASIC 代码中分别命名为 `ES`、`VX` 和 `KX`）：",
        "1. **波纹系数 `ε` (`ES`)**：完全由用户输入的通带波纹百分比 `PR` 决定。波纹越大，`ε` 越大，椭圆被压得越扁。\n2. **尺度因子 `v` (`VX`)**：利用反双曲正弦 `sinh⁻¹(1/ε)` 并除以极点数 `NP` 得到。随着极点数 `NP` 增加，单个极点需要向虚轴压缩的程度更小，但整体合力依然陡峭。\n3. **截止频率校正因子 `k` (`KX`)**：这是最容易被忽略的关键一步！如果不除以 `k`，仅仅把圆压扁成椭圆，滤波器的 `-3 dB`（幅度降至 `0.707`）截止频率会向右漂移到 `ω = k > 1` 处。将新极点坐标同时除以 `k`，恰好把 `-3 dB` 截止频率重新精确锁定在 `ω = 1`。",
        "此外，许多早期编程语言或嵌入式环境并不自带双曲函数库（`sinh`、`cosh`、`sinh⁻¹`、`cosh⁻¹`），因此必须用基础的指数函数 `e^x` 和自然对数 `ln(x)` 恒等式来展开计算：\n`sinh(x) = (e^x - e^(-x)) / 2`，`cosh(x) = (e^x + e^(-x)) / 2`；\n`sinh⁻¹(x) = ln[x + (x² + 1)^(1/2)]`，`cosh⁻¹(x) = ln[x + (x² - 1)^(1/2)]`。"
      ],
      "formula": {
        "expr": "ε = √[(100/(100 - PR))² - 1],   v = sinh⁻¹(1/ε) / NP,   k = cosh( cosh⁻¹(1/ε) / NP )",
        "explain": "PR 为通带波纹百分比 (0~29%)；NP 为滤波器极点总数；当 PR 增大时，ε 增大、1/ε 减小，椭圆的短轴与长轴比 sinh(v)/cosh(v) = tanh(v) 随之变小，椭圆变得更扁。"
      }
    },
    {
      "type": "concept",
      "heading": "工程红线：为什么 `PR = 0` 和 `PR >= 30` 会导致程序崩溃？",
      "paragraphs": [
        "书中特别警告：Equation 33-9 在 **`PR = 0`** 和 **`PR >= 30`** 时会产生非法数学运算（除以零或对负数开方），实际写代码时必须严格拦截这两个边界：",
        "**情况 A：`PR = 0`（零波纹，即退化为巴特沃斯滤波器）**。当 `PR = 0` 时，代入公式会算出 `ε = 0`，紧接着在计算 `1/ε` 时直接触发**除以零（Division by Zero）错误**！因此，当你想用同一套程序计算巴特沃斯滤波器时，必须在代码中加一条判断（原书第 `1120` 行），遇到 `PR = 0` 就直接**旁路跳过**这组圆转椭圆的变换公式，保留原始圆形极点。",
        "**情况 B：`PR >= 30`（大波纹崩溃区）**。为什么上限卡在 `29%` 而不是 `50%` 或 `99%`？动手算一下就会发现真相：当 `PR = 29.289%` 时，通带谷底已经跌到了 `1 - 0.29289 = 0.7071`（正好等于 `-3 dB` 线！），此时算出 `ε = 1`。一旦 `PR >= 30%`，就会导致 `ε > 1`，从而 `1/ε < 1`。代入反双曲余弦展开式 `cosh⁻¹(x) = ln[x + √(x² - 1)]` 时，根号里的 `x² - 1` 变成**负数**，程序立刻崩溃！从物理意义上讲，波纹谷底都跌破 `-3 dB` 了，单一的 `-3 dB` 截止频率也就失去了定义。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：切比雪夫波纹频响与实时滤波听感 (Web Audio)",
      "instruction": "点击「播放锯齿波听感对比」，然后拖动「通带波纹 (PR)」和「极点数 (NP)」滑块，边看高次谐波被切掉的过程，边听音色从明亮变闷、高频泛音被陡峭截断的听感差异。",
      "controls": [
        {
          "type": "slider",
          "id": "pr",
          "label": "通带波纹 (PR)",
          "min": 0,
          "max": 29,
          "step": 1,
          "value": 12,
          "unit": " %"
        },
        {
          "type": "slider",
          "id": "np",
          "label": "极点数 (NP)",
          "min": 2,
          "max": 12,
          "step": 2,
          "value": 6,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "-3db",
          "label": "截止频率 (-3dB)",
          "min": 250,
          "max": 1800,
          "step": 50,
          "value": 600,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "dbView",
          "label": "对数 dB 坐标视图",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放锯齿波听感对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nvar audioCtx = null;\nvar osc = null;\nvar master = null;\nvar filters = [];\nvar isPlaying = false;\nvar lastParams = '';\n\nfunction sinh(x) { return (Math.exp(x) - Math.exp(-x)) / 2; }\nfunction cosh(x) { return (Math.exp(x) + Math.exp(-x)) / 2; }\nfunction asinh(x) { return Math.log(x + Math.sqrt(x * x + 1)); }\nfunction acosh(x) { return Math.log(x + Math.sqrt(Math.max(0, x * x - 1))); }\n\nfunction getPoles(pr, np) {\n  var eps = 0, vx = 0, kx = 1;\n  if (pr > 0) {\n    var r = 100 / (100 - pr);\n    eps = Math.sqrt(r * r - 1);\n    var invEps = 1 / eps;\n    vx = asinh(invEps) / np;\n    kx = cosh(acosh(Math.max(1, invEps)) / np);\n  }\n  var butt = [], cheb = [];\n  for (var m = 1; m <= np / 2; m++) {\n    var theta = Math.PI / 2 + (2 * m - 1) * Math.PI / (2 * np);\n    var sig = Math.cos(theta);\n    var omg = Math.sin(theta);\n    butt.push({ sr: sig, si: omg });\n    if (pr === 0) {\n      cheb.push({ sr: sig, si: omg });\n    } else {\n      cheb.push({ sr: sig * sinh(vx) / kx, si: omg * cosh(vx) / kx });\n    }\n  }\n  return { butt: butt, cheb: cheb, eps: eps };\n}\n\nfunction evalMag(poles, w, dcScale) {\n  var num = 1, den = 1;\n  for (var i = 0; i < poles.length; i++) {\n    var sr = poles[i].sr, si = poles[i].si;\n    num *= (sr * sr + si * si);\n    den *= Math.sqrt(sr * sr + (w - si) * (w - si)) * Math.sqrt(sr * sr + (w + si) * (w + si));\n  }\n  return (num / den) * dcScale;\n}\n\nfunction createStageFilters(ac, cheb, pr, fc) {\n  var fs = ac.sampleRate;\n  var safeFc = Math.min(fc, fs * 0.42);\n  var K = 1 / Math.tan(Math.PI * safeFc / fs);\n  var nodes = [];\n  var dcStage0 = (pr === 0) ? 1 : (1 - pr / 100);\n  for (var i = 0; i < cheb.length; i++) {\n    var sr = cheb[i].sr, si = cheb[i].si;\n    var m2 = sr * sr + si * si;\n    var a0 = K * K - 2 * sr * K + m2;\n    var a1 = 2 * m2 - 2 * K * K;\n    var a2 = K * K + 2 * sr * K + m2;\n    var g = (i === 0) ? dcStage0 : 1;\n    var b0 = m2 * g, b1 = 2 * m2 * g, b2 = m2 * g;\n    nodes.push(ac.createIIRFilter([b0, b1, b2], [a0, a1, a2]));\n  }\n  return nodes;\n}\n\nfunction syncAudio(cheb, pr, np, fc, shouldPlay) {\n  var pKey = pr + '_' + np + '_' + fc;\n  if (shouldPlay && !isPlaying) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    osc = audioCtx.createOscillator();\n    osc.type = 'sawtooth';\n    osc.frequency.value = 150;\n    master = audioCtx.createGain();\n    master.gain.value = 0.16;\n    filters = createStageFilters(audioCtx, cheb, pr, fc);\n    var prev = osc;\n    for (var i = 0; i < filters.length; i++) {\n      prev.connect(filters[i]);\n      prev = filters[i];\n    }\n    prev.connect(master);\n    master.connect(audioCtx.destination);\n    osc.start();\n    isPlaying = true;\n    lastParams = pKey;\n  } else if (!shouldPlay && isPlaying) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    for (var i = 0; i < filters.length; i++) { try { filters[i].disconnect(); } catch (e) {} }\n    try { master.disconnect(); } catch (e) {}\n    filters = [];\n    isPlaying = false;\n  } else if (shouldPlay && isPlaying && pKey !== lastParams) {\n    try { osc.disconnect(); } catch (e) {}\n    for (var i = 0; i < filters.length; i++) { try { filters[i].disconnect(); } catch (e) {} }\n    filters = createStageFilters(audioCtx, cheb, pr, fc);\n    var prev = osc;\n    for (var i = 0; i < filters.length; i++) {\n      prev.connect(filters[i]);\n      prev = filters[i];\n    }\n    prev.connect(master);\n    lastParams = pKey;\n  }\n}\n\nfunction render() {\n  var pr = lab.values.pr;\n  var np = lab.values.np;\n  var fc = lab.values['-3db'];\n  var dbView = lab.values.dbView;\n\n  var res = getPoles(pr, np);\n  syncAudio(res.cheb, pr, np, fc, lab.values.play);\n\n  ctx.clearRect(0, 0, W, H);\n  var px = 52, py = 26, pw = 640, ph = 182;\n  var fMax = 2400;\n\n  function mapY(mag) {\n    if (dbView) {\n      var db = 20 * Math.log(Math.max(1e-4, mag)) / Math.LN10;\n      var clamped = Math.max(-48, Math.min(3, db));\n      return py + ((3 - clamped) / 51) * ph;\n    }\n    return py + ph - Math.min(1.08, mag) / 1.08 * ph;\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var f = 0; f <= fMax; f += 300) {\n    var gx = px + (f / fMax) * pw;\n    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(f + 'Hz', gx - 12, py + ph + 14);\n  }\n\n  if (dbView) {\n    var dbs = [0, -3, -12, -24, -36, -48];\n    for (var i = 0; i < dbs.length; i++) {\n      var gy = py + ((3 - dbs[i]) / 51) * ph;\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.fillText(dbs[i] + 'dB', 14, gy + 3);\n    }\n  } else {\n    var amps = [1.0, 0.707, 0.5, 0.25, 0];\n    for (var i = 0; i < amps.length; i++) {\n      var gy = mapY(amps[i]);\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.fillText(amps[i].toFixed(2), 16, gy + 3);\n    }\n  }\n\n  var dcScale = (pr === 0) ? 1 : 1 / Math.sqrt(1 + res.eps * res.eps);\n\n  for (var h = 1; h <= 15; h++) {\n    var fh = h * 150;\n    var hx = px + (fh / fMax) * pw;\n    var rawAmp = 1 / h;\n    var filtAmp = rawAmp * evalMag(res.cheb, fh / fc, dcScale);\n    var hyRaw = mapY(rawAmp);\n    var hyFilt = mapY(filtAmp);\n    var yBase = py + ph;\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(hx - 4, hyRaw, 8, yBase - hyRaw);\n    ctx.fillStyle = 'rgba(245,158,11,0.55)';\n    ctx.fillRect(hx - 4, hyFilt, 8, yBase - hyFilt);\n  }\n\n  var xFc = px + (fc / fMax) * pw;\n  ctx.strokeStyle = 'rgba(236,72,153,0.6)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(xFc, py); ctx.lineTo(xFc, py + ph); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var k = 0; k <= 240; k++) {\n    var f = (k / 240) * fMax;\n    var g = evalMag(res.butt, f / fc, 1);\n    var x = px + (f / fMax) * pw;\n    var y = mapY(g);\n    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var k = 0; k <= 240; k++) {\n    var f = (k / 240) * fMax;\n    var g = evalMag(res.cheb, f / fc, dcScale);\n    var x = px + (f / fMax) * pw;\n    var y = mapY(g);\n    if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('150Hz 锯齿波各次谐波衰减对比 (蓝虚线:巴特沃斯 / 绿实线:切比雪夫 / 琥珀柱:滤波后谐波)', px, 16);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('fc=' + fc + 'Hz', xFc + 4, py + 14);\n\n  var atten2fc = evalMag(res.cheb, 2, dcScale);\n  var atten2fcDb = (20 * Math.log(Math.max(1e-5, atten2fc)) / Math.LN10).toFixed(1);\n  var butt2fcDb = (20 * Math.log(Math.max(1e-5, evalMag(res.butt, 2, 1))) / Math.LN10).toFixed(1);\n  lab.setReadout('2倍截止频率 (' + (2 * fc) + 'Hz) 处衰减: 切比雪夫 ' + atten2fcDb + ' dB vs 巴特沃斯 ' + butt2fcDb + ' dB' + (isPlaying ? ' | 正在发声中' : ''));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "几何本质：`sinh(v)` 压缩极点实部、`cosh(v)` 调节极点虚部，把巴特沃斯的单位圆压扁成椭圆，用通带波纹 `PR` 换取更窄、更陡峭的过渡带。",
        "别漏了 `k`：除以 `k = cosh(cosh⁻¹(1/ε)/NP)` 不是装饰，它的唯一作用是在压扁椭圆后把 `-3 dB` 截止频率重新校回 `ω = 1`。",
        "严防 `PR = 0` 除零：当不需要波纹（设计巴特沃斯滤波器）时，必须写分支直接跳过 Equation 33-9，否则 `1/ε` 会发生除以零异常。",
        "严防 `PR >= 30` 虚数崩溃：当 `PR > 29.29%` 时 `ε > 1`、`1/ε < 1`，反双曲余弦对数公式内的 `√(x² - 1)` 会出现负数，工程上务必将 `PR` 限制在 `0 < PR <= 29` 之间。",
        "无库函数替代方案：在不支持双曲函数的 C/BASIC/单片机环境中，直接用 `exp()` 和 `log()` 展开 `sinh`、`cosh`、`asinh`、`acosh` 即可得到完全等价的精度。"
      ]
    }
  ]
});
