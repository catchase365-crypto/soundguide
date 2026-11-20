window.__BOOK_REGISTER_SECTION__("sec_076", {
  "title": "卷积的分配律：并联系统的合并与等效替换 (Distributive Property)",
  "intuition": "多个并联且输出相加的线性系统，在数学与物理上完全等价于先把它们的脉冲响应相加，再用一个单系统一次性完成卷积。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是卷积的分配律？（Equation 7-8）",
      "paragraphs": [
        "在小学算术里，乘法对加法满足分配律：`a × b + a × c = a × (b + c)`。神奇的是，数字信号处理中最核心的**卷积（Convolution）**运算也严格遵守完全相同的代数结构。",
        "在系统分析中，这描述了一种非常经典的电路与算法结构——**并联系统（Parallel Systems）**。想象同一个输入信号 `x[n]` 同时被送入两个独立的处理分支 `h₁[n]` 和 `h₂[n]`，随后把两个分支的输出结果直接相加得到总输出 `y[n]`。",
        "分配律告诉我们：与其老老实实做两次卷积再相加，不如**先把两个系统的脉冲响应 `h₁[n]` 和 `h₂[n]` 逐点相加**，合成一个全新的脉冲响应 `h_eq[n] = h₁[n] + h₂[n]`，然后让 `x[n]` 只经过这一个系统，最终得到的输出 `y[n]` 会一模一样，没有任何近似误差。"
      ],
      "formula": {
        "expr": "a[n] * b[n] + a[n] * c[n] = a[n] * (b[n] + c[n])",
        "explain": "a[n] 代表共享的输入信号 x[n]；b[n] 和 c[n] 分别代表两个并联子系统的脉冲响应 h₁[n] 与 h₂[n]；星号 * 表示离散卷积运算。左边是“先分别卷积再相加”，右边是“脉冲响应先相加再单次卷积”。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：并联系统与单系统等价性实时验证",
      "instruction": "拖动 h₁、h₂ 的增益或延迟抽头滑块，观察右侧下方的并联总输出（粉红线）与等效单系统输出（翠绿圆环）是否始终严丝合缝地重合。",
      "controls": [
        {
          "type": "slider",
          "id": "gain1",
          "label": "系统 h₁ 增益",
          "min": -1.5,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "gain2",
          "label": "系统 h₂ 增益",
          "min": -1.5,
          "max": 1.5,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "delay2",
          "label": "h₂ 延迟抽头 d",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 4,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "overlay",
          "label": "叠加显示等效单系统 x*(h₁+h₂)",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar N = 26, HLEN = 14;\nvar x = new Array(N);\nfor (var i = 0; i < N; i++) {\n  if (i === 2) x[i] = 1.0;\n  else if (i >= 10 && i <= 14) x[i] = 0.7;\n  else x[i] = 0;\n}\nfunction conv(a, b, lenOut) {\n  var out = new Array(lenOut);\n  for (var n = 0; n < lenOut; n++) {\n    var s = 0;\n    for (var k = 0; k < b.length; k++) {\n      if (n - k >= 0 && n - k < a.length) s += a[n - k] * b[k];\n    }\n    out[n] = s;\n  }\n  return out;\n}\nfunction maxAbsArr(arr, minFloor) {\n  var m = minFloor;\n  for (var i = 0; i < arr.length; i++) {\n    var v = Math.abs(arr[i]);\n    if (v > m) m = v;\n  }\n  return m * 1.15;\n}\nfunction drawBox(bx, by, bw, bh, title) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(bx, by, bw, bh);\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(bx, by, bw, bh);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(title, bx + 8, by + 15);\n}\nfunction drawStems(bx, by, bw, bh, data, maxAbs, color, style) {\n  var zeroY = by + bh * 0.58;\n  var scaleY = (bh * 0.34) / maxAbs;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(bx + 8, zeroY);\n  ctx.lineTo(bx + bw - 8, zeroY);\n  ctx.stroke();\n  var stepX = (bw - 24) / Math.max(1, data.length - 1);\n  for (var i = 0; i < data.length; i++) {\n    var px = bx + 12 + i * stepX;\n    var py = zeroY - data[i] * scaleY;\n    if (style === 'circle') {\n      ctx.strokeStyle = color;\n      ctx.lineWidth = 1.8;\n      ctx.beginPath();\n      ctx.arc(px, py, 4.2, 0, Math.PI * 2);\n      ctx.stroke();\n    } else {\n      ctx.strokeStyle = color;\n      ctx.lineWidth = (style === 'thick') ? 2.6 : 1.5;\n      ctx.beginPath();\n      ctx.moveTo(px, zeroY);\n      ctx.lineTo(px, py);\n      ctx.stroke();\n      ctx.fillStyle = color;\n      ctx.beginPath();\n      ctx.arc(px, py, (style === 'thick') ? 2.2 : 1.8, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n}\nfunction render() {\n  var g1 = lab.values.gain1;\n  var g2 = lab.values.gain2;\n  var d2 = Math.round(lab.values.delay2);\n  var overlay = lab.values.overlay;\n  var h1 = new Array(HLEN), h2 = new Array(HLEN), hSum = new Array(HLEN);\n  for (var k = 0; k < HLEN; k++) {\n    h1[k] = (k < 6) ? g1 * 0.5 * Math.pow(0.55, k) : 0;\n    h2[k] = 0;\n  }\n  if (d2 < HLEN) h2[d2] = g2 * 0.8;\n  if (d2 + 1 < HLEN) h2[d2 + 1] = g2 * 0.3;\n  for (var k = 0; k < HLEN; k++) hSum[k] = h1[k] + h2[k];\n  var outLen = N + 4;\n  var y1 = conv(x, h1, outLen);\n  var y2 = conv(x, h2, outLen);\n  var yPar = new Array(outLen);\n  for (var n = 0; n < outLen; n++) yPar[n] = y1[n] + y2[n];\n  var ySingle = conv(x, hSum, outLen);\n  var maxErr = 0;\n  for (var n = 0; n < outLen; n++) {\n    var err = Math.abs(yPar[n] - ySingle[n]);\n    if (err > maxErr) maxErr = err;\n  }\n  var hMax = Math.max(maxAbsArr(h1, 1.0), maxAbsArr(h2, 1.0), maxAbsArr(hSum, 1.0));\n  var yBranchMax = Math.max(maxAbsArr(y1, 1.0), maxAbsArr(y2, 1.0));\n  var yTotalMax = maxAbsArr(yPar, 1.2);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  drawBox(10, 8, 230, 108, '输入信号 x[n] (脉冲 + 矩形窗)');\n  drawStems(10, 8, 230, 108, x, 1.2, '#f8fafc', 'normal');\n  drawBox(10, 124, 230, 108, '核对比: h₁(蓝) h₂(橙) h₁+h₂(绿圆)');\n  drawStems(10, 124, 230, 108, h1, hMax, '#38bdf8', 'normal');\n  drawStems(10, 124, 230, 108, h2, hMax, '#f59e0b', 'normal');\n  drawStems(10, 124, 230, 108, hSum, hMax, '#10b981', 'circle');\n  drawBox(250, 8, 460, 108, '并联支路各自输出: y₁ = x*h₁ (蓝) vs y₂ = x*h₂ (橙)');\n  drawStems(250, 8, 460, 108, y1, yBranchMax, '#38bdf8', 'normal');\n  drawStems(250, 8, 460, 108, y2, yBranchMax, '#f59e0b', 'normal');\n  drawBox(250, 124, 460, 108, overlay ? '等价验证: y₁+y₂ (粉红线) vs x*(h₁+h₂) (翠绿圆环)' : '并联总输出: y_parallel = y₁[n] + y₂[n]');\n  drawStems(250, 124, 460, 108, yPar, yTotalMax, '#ec4899', 'thick');\n  if (overlay) {\n    drawStems(250, 124, 460, 108, ySingle, yTotalMax, '#10b981', 'circle');\n  }\n  lab.setReadout('g₁=' + g1.toFixed(1) + ' | g₂=' + g2.toFixed(1) + ' | 延迟 d=' + d2 + ' | 最大误差 max|y_并联 - y_单系统| = ' + maxErr.toExponential(2));\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "从并联图框到滤波器设计：为什么工程上离不开分配律？",
      "paragraphs": [
        "原书图 7-10 给出了一个极其干脆的 `IF → THEN` 替换规则：只要多个系统共享同一个输入 `x[n]` 且输出直接相加，就可以合并成一个等效系统，其脉冲响应等于所有原始脉冲响应之和。",
        "这在实际工程中至少带来两大杀手级优势：\n1. **算力直接减半（甚至降维打击）**：假设你有 4 个并联的 FIR 滤波器，每个长度 128 抽头。直接运行需要每样本 512 次乘加运算；利用分配律提前在初始化阶段把 4 个核相加成 1 个 128 抽头的核，运行时每样本只需要 128 次乘加，算力消耗直接砍掉 75%！",
        "2. **用“做减法”优雅地设计新滤波器（谱反转 / Spectral Inversion）**：在 DSP 中，如果你手里已经有一个简单的低通平滑核 `h_LP[n]`，怎么零成本变出一个高通滤波器？只需让原信号支路（即单位冲激 `δ[n]`，对应直通无损信号）**减去**低通支路！根据分配律：`x[n]*δ[n] - x[n]*h_LP[n] = x[n]*(δ[n] - h_LP[n])`。把直通冲激和负的低通核相加，就立刻合成了一个能滤除低频嗡嗡声的高通滤波器，音频效果器里的“干湿比（Dry/Wet）”、“低频增强（Bass Boost）”也全部建立在这个公式之上。"
      ],
      "formula": {
        "expr": "h_eq[n] = w₁ · δ[n - c] + w₂ · h_LP[n]",
        "explain": "w₁ 是直通支路（单位冲激 δ，中心对齐到 c）的权重，w₂ 是低通移动平均支路 h_LP 的权重。当 w₁=1, w₂=-1 时变成高通；当 w₁=1, w₂>0 时变成低频增强；当 w₁=0, w₂=1 时则是纯低通。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：用分配律调出“高通/低通/低音增强”听感对比",
      "instruction": "点击“▶ 播放合成音对比”（150Hz 富谐波锯齿波），尝试将 w₁ 设为 1.0、w₂ 设为 -1.0 体验“做减法变高通”的干脆听感，或将 w₂ 调为正值感受低频增强。",
      "controls": [
        {
          "type": "slider",
          "id": "w1",
          "label": "直通增益 w₁ (δ[n])",
          "min": -1,
          "max": 1.5,
          "step": 0.05,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "w2",
          "label": "平滑核增益 w₂ (h_LP[n])",
          "min": -1.5,
          "max": 1.5,
          "step": 0.05,
          "value": -1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "平滑窗口宽度 M",
          "min": 4,
          "max": 24,
          "step": 2,
          "value": 12,
          "unit": " 点"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioNodes = null;\nvar STRETCH = 4;\nfunction buildKernel(w1, w2, taps) {\n  var mOdd = taps + 1;\n  var center = Math.floor(mOdd / 2);\n  var h1 = new Array(mOdd), h2 = new Array(mOdd), hEq = new Array(mOdd);\n  for (var k = 0; k < mOdd; k++) {\n    h1[k] = (k === center) ? w1 : 0;\n    h2[k] = w2 / mOdd;\n    hEq[k] = h1[k] + h2[k];\n  }\n  var aLen = mOdd * STRETCH;\n  var aCenter = Math.floor(aLen / 2);\n  var aEq = new Float32Array(aLen);\n  for (var i = 0; i < aLen; i++) {\n    aEq[i] = ((i === aCenter) ? w1 : 0) + w2 / aLen;\n  }\n  return { h1: h1, h2: h2, hEq: hEq, aEq: aEq, mOdd: mOdd };\n}\nfunction stopAudio() {\n  if (audioNodes) {\n    try { audioNodes.osc.stop(); } catch (e) {}\n    try { audioNodes.osc.disconnect(); } catch (e) {}\n    try { audioNodes.conv.disconnect(); } catch (e) {}\n    try { audioNodes.gain.disconnect(); } catch (e) {}\n    audioNodes = null;\n  }\n}\nfunction syncAudio(aEq) {\n  var wantPlay = !!lab.values.play;\n  if (!wantPlay) {\n    stopAudio();\n    return 48000;\n  }\n  var actx = lab.getAudioContext();\n  if (!actx) return 48000;\n  if (actx.state === 'suspended') actx.resume();\n  var buf = actx.createBuffer(1, aEq.length, actx.sampleRate);\n  buf.getChannelData(0).set(aEq);\n  if (!audioNodes) {\n    var osc = actx.createOscillator();\n    osc.type = 'sawtooth';\n    osc.frequency.value = 150;\n    var conv = actx.createConvolver();\n    conv.normalize = false;\n    conv.buffer = buf;\n    var gain = actx.createGain();\n    gain.gain.value = 0.16;\n    osc.connect(conv);\n    conv.connect(gain);\n    gain.connect(actx.destination);\n    osc.start();\n    audioNodes = { osc: osc, conv: conv, gain: gain };\n  } else {\n    audioNodes.conv.buffer = buf;\n  }\n  return actx.sampleRate;\n}\nfunction render() {\n  var w1 = lab.values.w1;\n  var w2 = lab.values.w2;\n  var taps = Math.round(lab.values.taps);\n  var ker = buildKernel(w1, w2, taps);\n  var fs = syncAudio(ker.aEq);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  var lx = 12, ly = 10, lw = 320, lh = 220;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('等效脉冲响应 h_eq[n] = w₁·δ[n] + w₂·h_LP[n]', lx + 8, ly + 16);\n  var zeroY = ly + lh * 0.62;\n  var scaleY = (lh * 0.44) / 1.6;\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.beginPath();\n  ctx.moveTo(lx + 10, zeroY);\n  ctx.lineTo(lx + lw - 10, zeroY);\n  ctx.stroke();\n  var stepX = (lw - 30) / Math.max(1, ker.mOdd - 1);\n  for (var k = 0; k < ker.mOdd; k++) {\n    var px = lx + 15 + k * stepX;\n    var py2 = zeroY - ker.h2[k] * scaleY;\n    ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n    ctx.lineWidth = 3;\n    ctx.beginPath();\n    ctx.moveTo(px, zeroY);\n    ctx.lineTo(px, py2);\n    ctx.stroke();\n    var pyEq = zeroY - ker.hEq[k] * scaleY;\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, zeroY);\n    ctx.lineTo(px, pyEq);\n    ctx.stroke();\n    ctx.fillStyle = (k === Math.floor(ker.mOdd / 2)) ? '#f59e0b' : '#10b981';\n    ctx.beginPath();\n    ctx.arc(px, pyEq, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  var rx = 344, ry = 10, rw = 364, rh = 220;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('幅频响应 |H_eq(f)| (0-4kHz) 与 150Hz 锯齿波谐波线', rx + 8, ry + 16);\n  var baseY = ry + rh - 24;\n  var plotH = rh - 52;\n  var maxF = 4000;\n  for (var g = 0; g <= 2; g++) {\n    var gy = baseY - (g / 2.5) * plotH;\n    ctx.strokeStyle = (g === 1) ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.06)';\n    ctx.beginPath();\n    ctx.moveTo(rx + 12, gy);\n    ctx.lineTo(rx + rw - 12, gy);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(g + '.0', rx + 14, gy - 3);\n  }\n  for (var hf = 150; hf < maxF; hf += 150) {\n    var hx = rx + 14 + (hf / maxF) * (rw - 28);\n    ctx.strokeStyle = 'rgba(236,72,153,0.2)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(hx, baseY);\n    ctx.lineTo(hx, baseY - plotH);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  var pts = 140;\n  for (var p = 0; p <= pts; p++) {\n    var f = (p / pts) * maxF;\n    var w = 2 * Math.PI * f / fs;\n    var re = 0, im = 0;\n    for (var n = 0; n < ker.aEq.length; n++) {\n      re += ker.aEq[n] * Math.cos(w * n);\n      im -= ker.aEq[n] * Math.sin(w * n);\n    }\n    var mag = Math.sqrt(re * re + im * im);\n    var fx = rx + 14 + (p / pts) * (rw - 28);\n    var fy = baseY - Math.min(2.5, mag) / 2.5 * plotH;\n    if (p === 0) ctx.moveTo(fx, fy);\n    else ctx.lineTo(fx, fy);\n  }\n  ctx.stroke();\n  var dcGain = Math.abs(w1 + w2);\n  var modeText = (w1 > 0.5 && w2 < -0.5) ? '高通/去低频模式' : ((Math.abs(w1) < 0.1 && Math.abs(w2) > 0.2) ? '纯低通平滑模式' : ((w1 > 0.5 && w2 > 0.3) ? '低频增强 (Bass Boost)' : '自定义混合'));\n  lab.setReadout('w₁=' + w1.toFixed(2) + ' | w₂=' + w2.toFixed(2) + ' | M=' + ker.mOdd + ' | 直流增益 |H(0)|=' + dcGain.toFixed(2) + ' | 模式: ' + modeText);\n}\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "并联系统合并时，必须保证各支路的脉冲响应在**时间零点（对齐索引 n）**和**采样长度**上严格对齐！如果用 `δ[n] - h_LP[n]` 构造高通滤波器，却把 `δ` 放在下标 `0` 而把对称低通核的中心放在下标 `M/2`，两者的相位不会同相抵消，反而会产生剧烈的梳状波纹。",
        "不要在实时循环里对同一输入信号跑多次独立的 FIR 卷积后再相加：初始化时先 `h_total[n] = h1[n] + h2[n] + ...` 合并成一个核，能直接成倍节省 CPU/FPGA/DSP 算力。",
        "分配律不仅适用于相加，也适用于相减（如干湿相减、背景差分、谱反转），只要所有分支都是线性的并且共享同一个输入 `x[n]`。"
      ]
    }
  ]
});
