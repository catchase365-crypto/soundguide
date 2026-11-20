window.__BOOK_REGISTER_SECTION__("sec_156", {
  "title": "阶跃响应过冲与振铃 (Step Response Overshoot)",
  "intuition": "切比雪夫滤波器为了在频域切出最陡峭的悬崖，不得不在时域付出 5%~30% 过冲与振铃的代价，且数字采样机制会让过冲峰值随截止频率微妙波动。",
  "blocks": [
    {
      "type": "concept",
      "heading": "频域极致优化的时域代价：过冲与振铃",
      "paragraphs": [
        "在数字信号处理中，不存在能同时在频域和时域都做到完美的滤波器。巴特沃斯（Butterworth）和切比雪夫（Chebyshev）滤波器都是面向**频域幅频特性**优化的递归（IIR）滤波器：它们追求极窄的过渡带和尽可能高的阻带衰减。然而，这种频域的陡峭度是以牺牲**时域响应**为代价的。",
        "当一个理想的阶跃信号（从 `0` 瞬间跳变到 `1`）输入切比雪夫滤波器时，输出并不会平滑地上升并停在 `1.0`，而是会冲过目标稳态值，产生 **5% 到 30%** 的**过冲（Overshoot）**，随后围绕稳态值来回衰减振荡，这种现象称为**振铃（Ringing）**。",
        "对比教材图 20-3a 中的 2 极点与 4 极点切比雪夫滤波器（截止频率为 `0.05`）可以发现：**极点数越多，滤波器的频域截止越锋利，但时域的过冲幅度也越大、振铃持续的采样点数也越长。**"
      ],
      "formula": {
        "expr": "Overshoot (%) = ((y_max - y_steady) / y_steady) * 100%",
        "explain": "y_max 是阶跃响应达到的最高峰值采样点，y_steady 是信号最终稳定后的稳态值（通常归一化为 1.0）。该指标量化了信号瞬间冲出目标值的百分比。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：实时观察极点数与纹波对阶跃响应过冲的影响",
      "instruction": "拖动「极点数」、「截止频率」和「通带纹波」滑块，实时计算真实切比雪夫递归滤波器的阶跃响应波形，观察过冲峰值与振铃拖尾的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器极点数",
          "min": 2,
          "max": 6,
          "step": 2,
          "value": 4,
          "unit": " 极"
        },
        {
          "type": "slider",
          "id": "fc",
          "label": "归一化截止频率",
          "min": 0.02,
          "max": 0.4,
          "step": 0.01,
          "value": 0.05,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "ripple",
          "label": "通带纹波",
          "min": 0.5,
          "max": 5,
          "step": 0.5,
          "value": 0.5,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "compare",
          "label": "叠加 2 极点基线对比",
          "value": true
        }
      ],
      "jsCode": "function designChebyshev(poles, fc, ripplePct) {\n  var r = 1 - ripplePct / 100;\n  var eps = Math.sqrt(Math.max(1e-6, 1 / (r * r) - 1));\n  var invEps = 1 / eps;\n  var gamma = Math.log(invEps + Math.sqrt(invEps * invEps + 1)) / poles;\n  var sg = (Math.exp(gamma) - Math.exp(-gamma)) / 2;\n  var cg = (Math.exp(gamma) + Math.exp(-gamma)) / 2;\n  var W = Math.tan(Math.PI * Math.min(0.48, Math.max(0.01, fc)));\n  var stages = [];\n  for (var k = 1; k <= poles / 2; k++) {\n    var theta = Math.PI / 2 + (2 * k - 1) * Math.PI / (2 * poles);\n    var sigma = W * sg * Math.cos(theta);\n    var omega = W * cg * Math.sin(theta);\n    var a = -2 * sigma;\n    var c = sigma * sigma + omega * omega;\n    var d0 = 1 + a + c;\n    stages.push({\n      a0: c / d0,\n      a1: (2 * c) / d0,\n      a2: c / d0,\n      b1: (2 - 2 * c) / d0,\n      b2: -(1 - a + c) / d0\n    });\n  }\n  return stages;\n}\n\nfunction computeStep(stages, nMax) {\n  var out = [];\n  var sState = [];\n  for (var s = 0; s < stages.length; s++) sState.push({ x1: 0, x2: 0, y1: 0, y2: 0 });\n  for (var n = -10; n <= nMax; n++) {\n    var x = n >= 0 ? 1.0 : 0.0;\n    if (n < 0) {\n      out.push({ n: n, y: 0 });\n      continue;\n    }\n    var val = x;\n    for (var i = 0; i < stages.length; i++) {\n      var st = stages[i];\n      var mem = sState[i];\n      var y = st.a0 * val + st.a1 * mem.x1 + st.a2 * mem.x2 + st.b1 * mem.y1 + st.b2 * mem.y2;\n      mem.x2 = mem.x1;\n      mem.x1 = val;\n      mem.y2 = mem.y1;\n      mem.y1 = y;\n      val = y;\n    }\n    out.push({ n: n, y: val });\n  }\n  return out;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var poles = lab.values.poles;\n  var fc = lab.values.fc;\n  var ripple = lab.values.ripple;\n  var compare = lab.values.compare;\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 54, padR = 24, padT = 22, padB = 34;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var nMin = -10, nMax = 60;\n  var yMin = 0.0, yMax = 1.5;\n\n  function toX(n) { return padL + ((n - nMin) / (nMax - nMin)) * plotW; }\n  function toY(y) { return padT + (1 - (y - yMin) / (yMax - yMin)) * plotH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  for (var nTick = -10; nTick <= 60; nTick += 10) {\n    var gx = toX(nTick);\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + plotH); ctx.stroke();\n    ctx.fillText(String(nTick), gx - 7, padT + plotH + 15);\n  }\n  for (var yTick = 0; yTick <= 1.51; yTick += 0.5) {\n    var gy = toY(yTick);\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();\n    ctx.fillText(yTick.toFixed(1), 16, gy + 4);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.fillText('Sample number (n)', padL + plotW / 2 - 50, H - 5);\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(padL, toY(1.0)); ctx.lineTo(padL + plotW, toY(1.0)); ctx.stroke();\n  ctx.restore();\n\n  if (compare && poles !== 2) {\n    var baseData = computeStep(designChebyshev(2, fc, ripple), nMax);\n    ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    for (var i = 0; i < baseData.length; i++) {\n      var px = toX(baseData[i].n), py = toY(baseData[i].y);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    for (var j = 0; j < baseData.length; j++) {\n      ctx.beginPath(); ctx.arc(toX(baseData[j].n), toY(baseData[j].y), 2.2, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  var data = computeStep(designChebyshev(poles, fc, ripple), nMax);\n  var peakY = 0, peakN = 0;\n  for (var k = 0; k < data.length; k++) {\n    if (data[k].y > peakY) { peakY = data[k].y; peakN = data[k].n; }\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var m = 0; m < data.length; m++) {\n    var sx = toX(data[m].n), sy = toY(data[m].y);\n    if (m === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  for (var p = 0; p < data.length; p++) {\n    var dx = toX(data[p].n), dy = toY(data[p].y);\n    ctx.fillStyle = data[p].n === peakN ? '#f59e0b' : '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(dx, dy, data[p].n === peakN ? 4.8 : 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var overshootPct = Math.max(0, (peakY - 1.0) * 100);\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.7)';\n  ctx.beginPath(); ctx.moveTo(padL, toY(peakY)); ctx.lineTo(toX(peakN), toY(peakY)); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('+' + overshootPct.toFixed(1) + '% @ n=' + peakN, Math.min(W - 140, toX(peakN) + 8), Math.max(18, toY(peakY) - 8));\n\n  if (compare && poles !== 2) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('2-pole 基线', W - 110, 32);\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.fillText(poles + '-pole 当前曲线', W - 110, 48);\n\n  lab.setReadout('极点数: ' + poles + ' | 截止频率: ' + fc.toFixed(2) + ' fs | 纹波: ' + ripple.toFixed(1) + '% | 峰值过冲: ' + overshootPct.toFixed(2) + '% (出现在第 ' + peakN + ' 个采样点)');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "数字滤波器的独有现象：为什么截止频率也会改变过冲？",
      "paragraphs": [
        "在传统模拟电子电路中，改变低通滤波器的截止频率，只是在时间轴上把阶跃响应曲线等比例拉伸或压缩——曲线的连续峰值高度完全不变，因此**模拟滤波器的过冲百分比与截止频率无关**。",
        "但观察教材图 20-3b 会发现一个数字滤波器独有的现象：**阶跃响应的过冲大小会随数字截止频率的改变而呈现波浪形微幅起伏。**原因在于离散采样！连续时间波形的真正最高峰可能落在两个相邻整数采样点之间，数字滤波器只能在离散的整数采样时刻 `n = 0, 1, 2...` 上“窥视”这条曲线。",
        "当你改变截止频率时，振铃波形相对采样周期发生了伸缩，采样点时而正好踩在波峰顶点上（测得最大过冲），时而跨过波峰落在两侧肩部（测得过冲偏小）。在极高频率接近奈奎斯特极限 `0.5 fs` 时，由于每个周期内采样点数极少，采样对齐效应会变得尤为剧烈。"
      ],
      "formula": {
        "expr": null,
        "explain": "核心直觉：数字过冲 = 连续振铃包络 × 整数采样点网格的“对齐碰运气”。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：复现图 20-3b 过冲随频率波动曲线与振铃听感测试",
      "instruction": "左右拖动「截止频率」滑块，观察左图（图 20-3b 复现）中过冲率随频率的波浪形起伏，同时观察右图采样点是如何滑过波峰的；点击「试听数字振铃声」可听出每个阶跃跳变处的谐振余音。",
      "controls": [
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器极点数",
          "min": 2,
          "max": 6,
          "step": 2,
          "value": 6,
          "unit": " 极"
        },
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 (采样对齐点)",
          "min": 0.03,
          "max": 0.45,
          "step": 0.005,
          "value": 0.25,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "ripple",
          "label": "通带纹波",
          "min": 0.5,
          "max": 5,
          "step": 0.5,
          "value": 0.5,
          "unit": "%"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听数字振铃声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var activeSource = null;\nvar activeGain = null;\nvar lastAudioKey = '';\n\nfunction designChebyshev(poles, fc, ripplePct) {\n  var r = 1 - ripplePct / 100;\n  var eps = Math.sqrt(Math.max(1e-6, 1 / (r * r) - 1));\n  var invEps = 1 / eps;\n  var gamma = Math.log(invEps + Math.sqrt(invEps * invEps + 1)) / poles;\n  var sg = (Math.exp(gamma) - Math.exp(-gamma)) / 2;\n  var cg = (Math.exp(gamma) + Math.exp(-gamma)) / 2;\n  var W = Math.tan(Math.PI * Math.min(0.485, Math.max(0.01, fc)));\n  var stages = [];\n  for (var k = 1; k <= poles / 2; k++) {\n    var theta = Math.PI / 2 + (2 * k - 1) * Math.PI / (2 * poles);\n    var sigma = W * sg * Math.cos(theta);\n    var omega = W * cg * Math.sin(theta);\n    var a = -2 * sigma;\n    var c = sigma * sigma + omega * omega;\n    var d0 = 1 + a + c;\n    stages.push({\n      a0: c / d0, a1: (2 * c) / d0, a2: c / d0,\n      b1: (2 - 2 * c) / d0, b2: -(1 - a + c) / d0\n    });\n  }\n  return stages;\n}\n\nfunction stepOvershoot(poles, fc, ripplePct) {\n  var stages = designChebyshev(poles, fc, ripplePct);\n  var sState = [];\n  for (var s = 0; s < stages.length; s++) sState.push({ x1: 0, x2: 0, y1: 0, y2: 0 });\n  var peak = 0;\n  var trace = [];\n  for (var n = 0; n < 120; n++) {\n    var val = 1.0;\n    for (var i = 0; i < stages.length; i++) {\n      var st = stages[i], mem = sState[i];\n      var y = st.a0 * val + st.a1 * mem.x1 + st.a2 * mem.x2 + st.b1 * mem.y1 + st.b2 * mem.y2;\n      mem.x2 = mem.x1; mem.x1 = val; mem.y2 = mem.y1; mem.y1 = y;\n      val = y;\n    }\n    if (val > peak) peak = val;\n    if (n < 28) trace.push(val);\n  }\n  return { overshoot: Math.max(0, (peak - 1.0) * 100), trace: trace, peak: peak };\n}\n\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n  if (activeGain) {\n    try { activeGain.disconnect(); } catch (e) {}\n    activeGain = null;\n  }\n  lastAudioKey = '';\n}\n\nfunction updateAudio() {\n  var play = lab.values.play;\n  if (!play) { stopAudio(); return; }\n  var key = lab.values.poles + '_' + lab.values.fc.toFixed(3) + '_' + lab.values.ripple.toFixed(1);\n  if (key === lastAudioKey && activeSource) return;\n  lastAudioKey = key;\n  try {\n    var ctx = lab.getAudioContext();\n    if (ctx.state === 'suspended') ctx.resume();\n    var sr = ctx.sampleRate || 44100;\n    var len = sr;\n    var buf = ctx.createBuffer(1, len, sr);\n    var ch = buf.getChannelData(0);\n    var stages = designChebyshev(lab.values.poles, lab.values.fc, lab.values.ripple);\n    var sState = [];\n    for (var s = 0; s < stages.length; s++) sState.push({ x1: 0, x2: 0, y1: 0, y2: 0 });\n    var period = Math.floor(sr / 4);\n    for (var i = 0; i < len; i++) {\n      var sq = (i % period) < (period / 2) ? 0.35 : -0.35;\n      var val = sq;\n      for (var k = 0; k < stages.length; k++) {\n        var st = stages[k], mem = sState[k];\n        var y = st.a0 * val + st.a1 * mem.x1 + st.a2 * mem.x2 + st.b1 * mem.y1 + st.b2 * mem.y2;\n        mem.x2 = mem.x1; mem.x1 = val; mem.y2 = mem.y1; mem.y1 = y;\n        val = y;\n      }\n      ch[i] = Math.max(-0.9, Math.min(0.9, val));\n    }\n    if (activeSource) { try { activeSource.stop(); activeSource.disconnect(); } catch (e) {} }\n    if (!activeGain) {\n      activeGain = ctx.createGain();\n      activeGain.gain.value = 0.45;\n      activeGain.connect(ctx.destination);\n    }\n    var src = ctx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    src.connect(activeGain);\n    src.start(0);\n    activeSource = src;\n  } catch (err) {}\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var poles = lab.values.poles;\n  var fc = lab.values.fc;\n  var ripple = lab.values.ripple;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var lPadL = 46, lPadT = 26, lW = 395, lH = 176;\n  function fx(f) { return lPadL + (f / 0.5) * lW; }\n  function fy(pct) { return lPadT + (1 - Math.min(35, pct) / 35) * lH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  for (var ft = 0; ft <= 0.501; ft += 0.1) {\n    var gx = fx(ft);\n    ctx.beginPath(); ctx.moveTo(gx, lPadT); ctx.lineTo(gx, lPadT + lH); ctx.stroke();\n    ctx.fillText(ft.toFixed(1), gx - 9, lPadT + lH + 15);\n  }\n  for (var pt = 0; pt <= 35; pt += 5) {\n    var gy = fy(pt);\n    ctx.beginPath(); ctx.moveTo(lPadL, gy); ctx.lineTo(lPadL + lW, gy); ctx.stroke();\n    if (pt % 10 === 0) ctx.fillText(pt + '%', 12, gy + 4);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.fillText('过冲百分比 vs 截止频率 (图 20-3b)', lPadL, 16);\n  ctx.fillText('Frequency (fc / fs)', lPadL + lW / 2 - 55, H - 6);\n\n  if (poles !== 2) {\n    ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var i = 1; i <= 96; i++) {\n      var f2 = 0.01 + (i / 96) * 0.47;\n      var res2 = stepOvershoot(2, f2, ripple);\n      if (i === 1) ctx.moveTo(fx(f2), fy(res2.overshoot)); else ctx.lineTo(fx(f2), fy(res2.overshoot));\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var j = 1; j <= 110; j++) {\n    var f = 0.01 + (j / 110) * 0.47;\n    var res = stepOvershoot(poles, f, ripple);\n    if (j === 1) ctx.moveTo(fx(f), fy(res.overshoot)); else ctx.lineTo(fx(f), fy(res.overshoot));\n  }\n  ctx.stroke();\n\n  var cur = stepOvershoot(poles, fc, ripple);\n  var cx = fx(fc), cy = fy(cur.overshoot);\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.6)';\n  ctx.beginPath(); ctx.moveTo(cx, lPadT); ctx.lineTo(cx, lPadT + lH); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText(cur.overshoot.toFixed(1) + '%', Math.min(lPadL + lW - 40, cx + 8), Math.max(lPadT + 14, cy - 8));\n\n  var rPadL = 472, rPadT = 26, rW = 228, rH = 176;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rPadL, rPadT, rW, rH);\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px monospace';\n  ctx.fillText('时域采样对齐微观图 (n=0..27)', rPadL, 16);\n\n  function rx(n) { return rPadL + (n / 27) * rW; }\n  function ry(v) { return rPadT + (1 - v / 1.45) * rH; }\n\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(rPadL, ry(1.0)); ctx.lineTo(rPadL + rW, ry(1.0)); ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < cur.trace.length; n++) {\n    var px = rx(n), py = ry(cur.trace[n]);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (var m = 0; m < cur.trace.length; m++) {\n    var isPeak = Math.abs(cur.trace[m] - cur.peak) < 1e-6;\n    ctx.fillStyle = isPeak ? '#f59e0b' : '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(rx(m), ry(cur.trace[m]), isPeak ? 4.5 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('观察采样点如何滑过波峰', rPadL + 35, H - 6);\n\n  var ringHz = Math.round(fc * 44100);\n  lab.setReadout(poles + ' 极点 | 截止频率: ' + fc.toFixed(3) + ' fs (约 ' + ringHz + ' Hz @ 44.1k) | 当前过冲: ' + cur.overshoot.toFixed(2) + '%');\n  updateAudio();\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "切比雪夫与巴特沃斯滤波器的阶跃过冲通常在 5%～30% 之间，极点数越多、通带纹波越大，时域过冲和振铃就越严重。",
        "处理脉冲信号、方波边沿检测、心电波形或图像边缘等重视“时域形状保真”的任务时，切忌盲目堆高极点数，否则剧烈振铃会制造出虚假的波峰与伪影。",
        "数字滤波器的过冲率会随截止频率出现微幅波浪形变化，这是整数采样点位置与连续振铃包络发生对齐或错位造成的，属于离散系统的固有特性。"
      ]
    }
  ]
});
