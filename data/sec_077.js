window.__BOOK_REGISTER_SECTION__("sec_077", {
  "title": "输入与输出间的变换传递性 (Transference between the Input and Output)",
  "intuition": "只要系统是线性的，你在输入信号上施加的任何线性操作（放大、求导、滤波），都会一模一样地自动“透传”到输出信号上。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心直觉：输入端动了“线性手术”，输出端同步复制结果",
      "paragraphs": [
        "在数字信号处理中，**输入与输出间的变换传递性**（Transference）并不是一条死板的数学公理，而是一种极其有用的工程思维方式。",
        "设想一个脉冲响应为 `h[n]` 的线性系统：输入 `x[n]`，得到输出 `y[n]`。现在，我们在输入端对 `x[n]` 施加某种**线性变换**（例如把它放大两倍、求一阶导数、或者先过一个低通滤波器），得到新输入 `x'[n]`，进而产生新输出 `y'[n]`。",
        "原书图 7-11 给出了惊人简洁的结论：**输出信号 `y'[n]` 相当于对原输出 `y[n]` 施加了完全相同的线性变换**。换句话说，这个线性变化直接“穿”过了主系统 `h[n]`，如实地转移到了输出端。",
        "这背后的数学靠山正是卷积的**结合律**与**交换律**：如果把施加的线性变换也看作一个脉冲响应为 `g[n]` 的小系统，那么先变换输入再进主系统，与先进主系统再对输出做同款变换，顺序可以任意调换，最终结果分毫不差。"
      ],
      "formula": {
        "expr": "x'[n] = x[n] * g[n]  ⇒  y'[n] = (x[n] * g[n]) * h[n] = (x[n] * h[n]) * g[n] = y[n] * g[n]",
        "explain": "x[n]、y[n] 分别为原输入和原输出；h[n] 为主系统脉冲响应；g[n] 代表施加在信号上的某种线性变换（如比例缩放、差分求导或滤波）。括号移动代表卷积结合律，说明线性变化 g[n] 与主系统 h[n] 顺序可互换。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：放大与离散求导的“透传”实时验证",
      "instruction": "拖动「幅度放大倍数」或开启「一阶差分（离散求导）」，观察青绿实线（变换输入后再过系统）与粉红圆点（先过系统再对输出做同款变换）是否永远严丝合缝地重合。",
      "controls": [
        {
          "type": "slider",
          "id": "gain",
          "label": "输入幅度缩放倍数",
          "min": 0.2,
          "max": 2.2,
          "step": 0.1,
          "value": 1.4,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "deriv",
          "label": "施加一阶差分（离散求导）",
          "value": false
        },
        {
          "type": "slider",
          "id": "smoothLen",
          "label": "主系统 h[n] 平滑窗口",
          "min": 1,
          "max": 15,
          "step": 2,
          "value": 7,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showDirect",
          "label": "叠加粉点：先求 y[n] 再做同款变换",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 120;\n\nfunction makeInput() {\n  var x = new Float32Array(N);\n  for (var n = 0; n < N; n++) {\n    var env = Math.exp(-Math.pow((n - 42) / 15, 2));\n    var osc = Math.sin(2 * Math.PI * n / 18);\n    var bump = Math.exp(-Math.pow((n - 82) / 12, 2));\n    x[n] = 0.85 * env * osc + 0.65 * bump;\n  }\n  return x;\n}\n\nfunction applyLinearChange(sig, gain, doDeriv) {\n  var out = new Float32Array(sig.length);\n  for (var n = 0; n < sig.length; n++) {\n    var val = sig[n] * gain;\n    if (doDeriv) {\n      var prev = n > 0 ? sig[n - 1] * gain : 0;\n      out[n] = (val - prev) * 2.5;\n    } else {\n      out[n] = val;\n    }\n  }\n  return out;\n}\n\nfunction convolveH(sig, winLen) {\n  var out = new Float32Array(sig.length);\n  for (var n = 0; n < sig.length; n++) {\n    var sum = 0;\n    for (var k = 0; k < winLen; k++) {\n      if (n - k >= 0) sum += sig[n - k];\n    }\n    out[n] = sum / winLen;\n  }\n  return out;\n}\n\nfunction drawGrid() {\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (var x = 0; x <= W; x += 60) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (var y = 0; y <= H; y += 30) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(255,255,255,0.2)\";\n  ctx.beginPath(); ctx.moveTo(0, H / 2); ctx.lineTo(W, H / 2); ctx.stroke();\n}\n\nfunction drawCurve(arr, yCenter, yScale, color, width, dashed, dotsOnly) {\n  ctx.save();\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = width;\n  if (dashed) ctx.setLineDash([5, 4]);\n  if (!dotsOnly) {\n    ctx.beginPath();\n    for (var n = 0; n < N; n++) {\n      var px = 20 + (n / (N - 1)) * (W - 40);\n      var py = yCenter - arr[n] * yScale;\n      if (n === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  } else {\n    for (var n = 0; n < N; n += 2) {\n      var px = 20 + (n / (N - 1)) * (W - 40);\n      var py = yCenter - arr[n] * yScale;\n      ctx.beginPath();\n      ctx.arc(px, py, 2.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n  ctx.restore();\n}\n\nlab.onUpdate(function() {\n  var gain = lab.values.gain;\n  var doDeriv = !!lab.values.deriv;\n  var winLen = Math.round(lab.values.smoothLen);\n  var showDirect = !!lab.values.showDirect;\n\n  var x = makeInput();\n  var xPrime = applyLinearChange(x, gain, doDeriv);\n  var y = convolveH(x, winLen);\n  var yPrimeFromX = convolveH(xPrime, winLen);\n  var yPrimeFromY = applyLinearChange(y, gain, doDeriv);\n\n  var maxErr = 0;\n  for (var n = 0; n < N; n++) {\n    var diff = Math.abs(yPrimeFromX[n] - yPrimeFromY[n]);\n    if (diff > maxErr) maxErr = diff;\n  }\n\n  drawGrid();\n\n  var topY = 64;\n  var botY = 184;\n  var scale = 30;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.16)\";\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(20, topY); ctx.lineTo(W - 20, topY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(20, botY); ctx.lineTo(W - 20, botY); ctx.stroke();\n\n  drawCurve(x, topY, scale, \"#94a3b8\", 1.5, true, false);\n  drawCurve(xPrime, topY, scale, \"#38bdf8\", 2.2, false, false);\n\n  drawCurve(y, botY, scale, \"#f59e0b\", 1.5, true, false);\n  drawCurve(yPrimeFromX, botY, scale, \"#10b981\", 2.6, false, false);\n  if (showDirect) {\n    drawCurve(yPrimeFromY, botY, scale, \"#ec4899\", 1, false, true);\n  }\n\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.fillText(\"输入端：灰虚线 原输入 x[n]   |   天蓝实线 线性变换后 x'[n]\", 20, 18);\n  ctx.fillText(\"输出端：琥珀虚线 原输出 y[n]   |   青绿实线 x'[n]*h[n]   |   粉红点 对 y[n] 做同款变换\", 20, 138);\n\n  var opText = \"放大 \" + gain.toFixed(1) + \"x\" + (doDeriv ? \" + 离散求导\" : \"\");\n  lab.setReadout(\"线性操作: \" + opText + \" | 系统长度: \" + winLen + \" 点 | 两条输出路径最大偏差: \" + maxErr.toExponential(2) + \" (完全重合)\");\n});"
    },
    {
      "type": "concept",
      "heading": "三大经典案例与唯一红线：为什么必须是“线性”变化？",
      "paragraphs": [
        "Steven Smith 在书中列举了三个工程中最常遇到的传递案例：",
        "1. **比例放大**：把输入信号放大 2 倍，输出信号也会精准放大 2 倍。",
        "2. **求导数（微分/差分）**：对输入信号求导，输出信号也就变成了原输出信号的导数。这在分析传感器阶跃响应与脉冲响应的关系时极为好用（脉冲是阶跃的导数，因此脉冲响应就是阶跃响应的导数）。",
        "3. **预滤波**：如果输入信号在进入主系统前被某种滤波器滤过，最终输出信号就等同于先通过主系统、再被同一个滤波器滤过的结果。",
        "**请务必守住一条红线**：传递性成立的前提，是施加的变换必须是**线性的**（同时主系统本身也必须是线性时不变系统）。一旦你在输入端做了**非线性变换**（例如绝对值整流 `|x[n]|`、硬削波限幅、平方 `x²[n]`），卷积结合律立刻失效——在输入端削波会产生大量新谐波再进入主系统，和输出端再削波的结果会截然不同！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：滤波传递性 & 非线性整流“破功”听感对比",
      "instruction": "先点击播放声音，拖动「前置平滑滤波」并反复切换「先过主系统再做变换」，你会发现波形重合且音色零变化；接着开启「非线性破坏（全波整流 |x[n]|）」，再切换路径，亲眼看波形分叉、亲耳听音色突变！",
      "controls": [
        {
          "type": "slider",
          "id": "filterLevel",
          "label": "前置低通平滑强度",
          "min": 1,
          "max": 15,
          "step": 2,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "nonlinear",
          "label": "开启非线性破坏（全波整流 |x[n]|）",
          "value": false
        },
        {
          "type": "toggle",
          "id": "swapOrder",
          "label": "监听切换：先过主系统再变换 (关=先变换再过主系统)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放实时音频对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar P = 200;\n\nvar audioCtx = null;\nvar sourceNode = null;\nvar gainNode = null;\n\nfunction buildInputPeriod() {\n  var x = new Float32Array(P);\n  for (var n = 0; n < P; n++) {\n    var t = (2 * Math.PI * n) / P;\n    var v = 0;\n    for (var k = 1; k <= 7; k++) {\n      v += Math.sin(k * t) / k;\n    }\n    x[n] = v * 0.55;\n  }\n  return x;\n}\n\nfunction buildMainSystemH() {\n  var len = 24;\n  var h = new Float32Array(len);\n  var norm = 0;\n  for (var k = 0; k < len; k++) {\n    h[k] = Math.exp(-k * 0.16) * Math.cos(0.55 * k);\n    norm += Math.abs(h[k]);\n  }\n  for (var k = 0; k < len; k++) h[k] /= (norm * 0.45);\n  return h;\n}\n\nfunction circConv(sig, ker) {\n  var out = new Float32Array(P);\n  for (var n = 0; n < P; n++) {\n    var sum = 0;\n    for (var k = 0; k < ker.length; k++) {\n      var idx = (n - k) % P;\n      if (idx < 0) idx += P;\n      sum += sig[idx] * ker[k];\n    }\n    out[n] = sum;\n  }\n  return out;\n}\n\nfunction applyChange(sig, winLen, isNonlinear) {\n  var tmp = new Float32Array(P);\n  for (var n = 0; n < P; n++) {\n    tmp[n] = isNonlinear ? Math.abs(sig[n]) : sig[n];\n  }\n  var ker = new Float32Array(winLen);\n  for (var k = 0; k < winLen; k++) ker[k] = 1 / winLen;\n  return circConv(tmp, ker);\n}\n\nfunction stopAudio() {\n  if (sourceNode) {\n    try { sourceNode.stop(); } catch (e) {}\n    try { sourceNode.disconnect(); } catch (e) {}\n    sourceNode = null;\n  }\n}\n\nfunction startOrUpdateAudio(periodBuf) {\n  if (!audioCtx) audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === \"suspended\") audioCtx.resume();\n  if (!gainNode) {\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.16;\n    gainNode.connect(audioCtx.destination);\n  }\n  var sr = audioCtx.sampleRate;\n  var repeats = Math.max(1, Math.round(sr / P));\n  var totalLen = P * repeats;\n  var audioBuf = audioCtx.createBuffer(1, totalLen, sr);\n  var ch = audioBuf.getChannelData(0);\n  var mean = 0;\n  for (var n = 0; n < P; n++) mean += periodBuf[n];\n  mean /= P;\n  for (var r = 0; r < repeats; r++) {\n    for (var n = 0; n < P; n++) {\n      var s = periodBuf[n] - mean;\n      ch[r * P + n] = Math.max(-0.95, Math.min(0.95, s));\n    }\n  }\n  stopAudio();\n  sourceNode = audioCtx.createBufferSource();\n  sourceNode.buffer = audioBuf;\n  sourceNode.loop = true;\n  sourceNode.connect(gainNode);\n  sourceNode.start();\n}\n\nfunction drawGrid() {\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (var x = 0; x <= W; x += 60) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (var y = 0; y <= H; y += 30) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.beginPath(); ctx.moveTo(0, H / 2 + 10); ctx.lineTo(W, H / 2 + 10); ctx.stroke();\n}\n\nfunction drawWave(arr, color, width, dashed) {\n  ctx.save();\n  ctx.strokeStyle = color;\n  ctx.lineWidth = width;\n  if (dashed) ctx.setLineDash([6, 4]);\n  ctx.beginPath();\n  for (var n = 0; n < P; n++) {\n    var px = 20 + (n / (P - 1)) * (W - 40);\n    var py = (H / 2 + 10) - arr[n] * 62;\n    if (n === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n}\n\nlab.onUpdate(function() {\n  var winLen = Math.round(lab.values.filterLevel);\n  var isNonlinear = !!lab.values.nonlinear;\n  var swapOrder = !!lab.values.swapOrder;\n  var wantPlay = !!lab.values.play;\n\n  var x = buildInputPeriod();\n  var h = buildMainSystemH();\n\n  var xChanged = applyChange(x, winLen, isNonlinear);\n  var pathA = circConv(xChanged, h);\n  var y = circConv(x, h);\n  var pathB = applyChange(y, winLen, isNonlinear);\n\n  var maxDiff = 0;\n  for (var n = 0; n < P; n++) {\n    var d = Math.abs(pathA[n] - pathB[n]);\n    if (d > maxDiff) maxDiff = d;\n  }\n\n  drawGrid();\n  drawWave(x, \"rgba(148,163,184,0.45)\", 1.2, true);\n  drawWave(pathA, \"#10b981\", swapOrder ? 2.0 : 3.2, false);\n  drawWave(pathB, \"#ec4899\", swapOrder ? 3.2 : 2.0, true);\n\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.fillText(\"灰虚线: 原输入锯齿波 x[n]  |  青绿实线: 先变换再过 h[n]  |  粉红虚线: 先过 h[n] 再做同款变换\", 20, 20);\n\n  var activeSignal = swapOrder ? pathB : pathA;\n  if (wantPlay) {\n    startOrUpdateAudio(activeSignal);\n  } else {\n    stopAudio();\n  }\n\n  var modeStr = isNonlinear ? \"非线性(破坏传递性)\" : \"纯线性(传递性严格成立)\";\n  var listenStr = swapOrder ? \"粉红路径(先过系统再变换)\" : \"青绿路径(先变换再过系统)\";\n  lab.setReadout(\"当前变换: \" + modeStr + \" | 监听: \" + listenStr + \" | 两条路径最大波形差: \" + maxDiff.toFixed(5));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【算法优化捷径】因为线性变换可以任意穿透 LTI 系统，如果前级有个高计算量滤波器、后级有个降采样/平滑器，或者反之，工程上常利用传递性把顺序对调，先处理低开销或不易数值溢出的步骤。",
        "【响应推导神器】遇到要求阶跃响应、斜坡响应或脉冲响应的题，不必每次重新做卷积积分：由于阶跃是脉冲的积分、脉冲是阶跃的导数，直接利用“微分/积分传递性”对已有输出求导或积分即可秒出结果。",
        "【绝对踩坑红线】绝对不能把“线性传递性”套用到非线性环节（如二极管整流、ADC 饱和削波、神经网络 ReLU 激活、取模求包络）上；一旦出现非线性，前级处理与后级处理的顺序会对结果产生根本性改变。"
      ]
    }
  ]
});
