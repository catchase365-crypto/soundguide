window.__BOOK_REGISTER_SECTION__("sec_067", {
  "title": "输出侧算法：逐点计算输出与卷积机器 (The Output Side Algorithm)",
  "intuition": "与其追踪“每个输入点散射到哪里”，不如站在每个输出点 `y[i]` 的位置，直接把所有能影响它的输入样本与翻转后的冲激响应相乘求和——这就是让每个输出点彻底独立计算的工程标准算法。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、视角反转：为什么需要输出侧算法？",
      "paragraphs": [
        "在上一节的**输入侧算法（Input Side Algorithm）**中，我们分析的是“输入信号中的某一个点 `x[k]`，会如何向输出信号散射出一条缩放并平移的冲激响应”。这种视角虽然直观，但在实际写程序时却不够自然：我们通常希望用一个 `for` 循环遍历输出数组，在每次循环中**独立算出一个完整的输出样本 `y[i]`**，而无需在多个中间数组之间反复累加。",
        "**输出侧算法（Output Side Algorithm）**正是把因果视角彻底倒过来：盯着输出信号中的某一个具体样本（例如原书图 6-5 中的 `y[6]`），反向追问“到底有哪些输入信号点对它有贡献？”。",
        "观察原书图 6-6 拆解出的 9 个输出分量，在位置 6 处，有 5 个分量填的都是补出来的 `0`（菱形标记），对 `y[6]` 毫无影响；真正能在第 6 个位置产生非零贡献的，只有来自输入样本 `x[3]`、`x[4]`、`x[5]` 和 `x[6]` 的 4 个分量。把它们在第 6 位置的数值相加，就得到了 `y[6]` 的精确计算式。"
      ],
      "formula": {
        "expr": "y[6] = x[3]·h[3] + x[4]·h[2] + x[5]·h[1] + x[6]·h[0]",
        "explain": "计算输出点 y[6] 时，只需要输入信号连续的 4 个点 x[3]~x[6]，分别乘以冲激响应 h[3]~h[0] 后求和，与其他输出点 y[n] 完全无关。"
      }
    },
    {
      "type": "concept",
      "heading": "二、卷积机器与“左右翻转”的数学真相",
      "paragraphs": [
        "为了把输出侧算法变成一眼看穿的几何直觉，原书图 6-8 构造了一台**卷积机器（Convolution Machine）**：把输入信号 `x[n]` 和输出信号 `y[n]` 固定在纸面上，中间是一个可以自由左右滑动的虚线方框（卷积机器）。计算哪个输出点 `y[i]`，就把机器的输出箭头对准 `y[i]`，此时机器顶部会自动接住 4 个输入样本，乘以机器内部的参数后相加，直接掉入 `y[i]`。",
        "极其关键的细节在于：卷积机器内部的冲激响应 `h[n]` 是**左右翻转（flipped left-for-right）**放置的——`h[0]` 在最右侧，越往左索引越大（`h[1]`、`h[2]`、`h[3]`）。为什么必须翻转？这并不是人为规定，而是数学自然推导的结果：在 `y[6]` 的公式中，`x` 的下标从 `3` 递增到 `6`，而与之配对的 `h` 的下标必须从 `3` 递减到 `0`，以保证每一对乘积的下标之和恒等于当前输出位置 `i`（即 `3+3=6, 4+2=6, 5+1=6, 6+0=6`）。",
        "当 `N` 点输入信号 `x[n]`（`0` 到 `N-1`）与 `M` 点冲激响应 `h[n]`（`0` 到 `M-1`）做卷积时，输出信号 `y[n]` 共有 `N + M - 1` 个点（`0` 到 `N + M - 2`），由**卷积和（Convolution Sum）**公式严格定义。"
      ],
      "formula": {
        "expr": "y[i] = Σ(j = 0 → M-1) h[j] · x[i - j]",
        "explain": "i 是当前正在计算的输出位置（对应卷积机器的左右位置）；j 在机器内部从 0 遍历到 M-1；x[i - j] 中的减号正是“冲激响应左右翻转”的代数体现。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：滑动“卷积机器”观察 h[n] 翻转与乘加对齐",
      "instruction": "拖动“输出位置 i”滑块（或开启自动步进），观察虚线框内的翻转冲激响应 h[n] 如何从 x[n] 中接住样本并算出 y[i]，注意两端 i ≤ 2 与 i ≥ 9 时机器悬空触及的零填充区。",
      "controls": [
        {
          "type": "slider",
          "id": "outIdx",
          "label": "输出位置 i",
          "min": 0,
          "max": 11,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showPad",
          "label": "显示两端零填充 (Zero Padding)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "autoSlide",
          "label": "自动步进演示",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar x = [0, -1, -1.2, 2.0, 1.3, 1.3, 0.7, 0, -0.6];\nvar h = [1.0, -0.5, -0.3, -0.2];\nvar N = x.length, M = h.length, YL = N + M - 1;\nvar y = [];\nfor (var n = 0; n < YL; n++) {\n  var s = 0;\n  for (var j = 0; j < M; j++) {\n    var xi = n - j;\n    if (xi >= 0 && xi < N) s += h[j] * x[xi];\n  }\n  y.push(s);\n}\nvar animIdx = Math.round(lab.values.outIdx);\nvar prevSlider = animIdx;\nvar animTimer = 0;\nfunction xPos(idx) { return 78 + (idx + 3) * 42; }\nfunction drawStem(px, baseY, val, scale, color, r, dashed) {\n  var py = baseY - val * scale;\n  ctx.save();\n  if (dashed) ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  ctx.moveTo(px, baseY);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = color;\n  ctx.beginPath();\n  ctx.arc(px, py, r, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.restore();\n}\nfunction draw() {\n  var i = lab.values.autoSlide ? animIdx : Math.round(lab.values.outIdx);\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var idx = -3; idx <= 11; idx++) {\n    var gx = xPos(idx);\n    ctx.beginPath(); ctx.moveTo(gx, 14); ctx.lineTo(gx, H - 12); ctx.stroke();\n  }\n  var baseX = 48, baseH = 122, baseY = 202;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(52, baseX); ctx.lineTo(W - 20, baseX); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(52, baseY); ctx.lineTo(W - 20, baseY); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 13px monospace';\n  ctx.fillText('x[n]', 12, baseX + 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('h[n]', 12, baseH - 4);\n  ctx.font = '11px sans-serif';\n  ctx.fillText('(已翻转)', 10, baseH + 12);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 13px monospace';\n  ctx.fillText('y[n]', 12, baseY + 4);\n  for (var idx = -3; idx <= 11; idx++) {\n    var px = xPos(idx);\n    if (idx >= 0 && idx < N) {\n      var active = (idx >= i - (M - 1) && idx <= i);\n      drawStem(px, baseX, x[idx], 11, active ? '#38bdf8' : 'rgba(56,189,248,0.45)', active ? 4 : 3, false);\n    } else if (lab.values.showPad) {\n      drawStem(px, baseX, 0, 11, 'rgba(236,72,153,0.45)', 3, true);\n    }\n    ctx.fillStyle = 'rgba(248,250,252,0.45)';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(idx), px, baseX + 16);\n  }\n  var boxL = xPos(i - (M - 1)) - 18;\n  var boxR = xPos(i) + 18;\n  var boxT = 78, boxB = 160;\n  ctx.save();\n  ctx.fillStyle = 'rgba(245,158,11,0.07)';\n  ctx.fillRect(boxL, boxT, boxR - boxL, boxB - boxT);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.strokeRect(boxL, boxT, boxR - boxL, boxB - boxT);\n  ctx.setLineDash([]);\n  ctx.restore();\n  ctx.strokeStyle = 'rgba(245,158,11,0.35)';\n  ctx.beginPath(); ctx.moveTo(boxL + 6, baseH); ctx.lineTo(boxR - 6, baseH); ctx.stroke();\n  var terms = [];\n  var oobCount = 0;\n  for (var j = M - 1; j >= 0; j--) {\n    var xi = i - j;\n    var px = xPos(xi);\n    var inBounds = (xi >= 0 && xi < N);\n    if (!inBounds) oobCount++;\n    ctx.strokeStyle = inBounds ? 'rgba(56,189,248,0.65)' : 'rgba(236,72,153,0.65)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    ctx.moveTo(px, baseX + 18);\n    ctx.lineTo(px, boxT + 14);\n    ctx.stroke();\n    ctx.fillStyle = inBounds ? '#38bdf8' : '#ec4899';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('×', px, boxT + 11);\n    drawStem(px, baseH, h[j], 16, '#f59e0b', 3.5, false);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText('h[' + j + ']', px, baseH + 22);\n    ctx.strokeStyle = 'rgba(16,185,129,0.55)';\n    ctx.beginPath();\n    ctx.moveTo(px, boxH_end = boxB - 12);\n    ctx.lineTo(xPos(i), boxB);\n    ctx.stroke();\n    terms.push((inBounds ? 'x[' + xi + ']' : '0(越界)') + '·h[' + j + ']');\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(xPos(i), boxB);\n  ctx.lineTo(xPos(i), baseY - y[i] * 10 - (y[i] >= 0 ? 7 : -7));\n  ctx.stroke();\n  for (var n = 0; n < YL; n++) {\n    var pyx = xPos(n);\n    var isCur = (n === i);\n    var isEdge = (n < M - 1 || n >= N);\n    var col = isCur ? '#f8fafc' : (isEdge ? 'rgba(236,72,153,0.6)' : 'rgba(16,185,129,0.65)');\n    drawStem(pyx, baseY, y[n], 10, col, isCur ? 5 : 3, false);\n    if (isCur) {\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.arc(pyx, baseY - y[n] * 10, 8, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n    ctx.fillStyle = isCur ? '#f8fafc' : 'rgba(248,250,252,0.45)';\n    ctx.font = isCur ? 'bold 10px monospace' : '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(n), pyx, baseY + 26);\n  }\n  ctx.textAlign = 'left';\n  var status = oobCount === 0 ? '完全浸入 (Full Immersion)' : ('边缘不完整: 缺少 ' + oobCount + ' 个输入点');\n  lab.setReadout('y[' + i + '] = ' + terms.join(' + ') + ' = ' + y[i].toFixed(2) + '  |  状态: ' + status);\n}\nlab.onUpdate(function() {\n  var s = Math.round(lab.values.outIdx);\n  if (s !== prevSlider) { animIdx = s; prevSlider = s; animTimer = 0; }\n  draw();\n});\nlab.onLoop(function(dt) {\n  if (lab.values.autoSlide) {\n    animTimer += dt;\n    if (animTimer >= 0.85) {\n      animTimer = 0;\n      animIdx = (animIdx + 1) % YL;\n      draw();\n    }\n  }\n});\ndraw();"
    },
    {
      "type": "concept",
      "heading": "三、边缘效应（End Effects）与代码越界的三种解法",
      "paragraphs": [
        "滑动上面实验中的滑块到最左侧 `y[0]` 或最右侧 `y[11]` 时，你会立刻发现一个麻烦：当 `i = 0` 时，卷积机器试图读取 `x[-3]`、`x[-2]`、`x[-1]`；当 `i = 11` 时，它又试图读取 `x[9]`、`x[10]`、`x[11]`。这些样本根本不存在！",
        "在 DSP 术语中，如果 `M` 点冲激响应没有**完全浸入（fully immersed）**输入信号中，输出信号最前面的 `M - 1` 个点和最后面的 `M - 1` 个点就是基于“不完整信息”算出来的。这就像模拟电路刚通电时的开机瞬态（transient），但在 DSP 中非常显眼——如原书图 6-10 所示，用 31 点高通滤波器去除 81 点正弦波中的直流分量时，中间有效区干净完美，而首尾各 30 个点会炸出一大片畸变波形，通常完全不可用。",
        "在编写代码实现输出侧算法（如原书 Table 6-2）时，如果不处理 `x[i - j]` 的数组越界，程序会直接读取非法内存而崩溃。工程上有三种标准防崩溃策略：1）**内层循环跳过越界**（若 `i - j < 0` 或 `i - j > N - 1` 则跳过本次乘加，等效于补零）；2）**显式两端补零**（将输入数组扩大，左右各填充 `M - 1` 个 `0`）；3）**收缩输出循环区间**（只计算完全浸入区 `i = M - 1` 到 `N - 1`，直接丢弃首尾失真边缘）。"
      ],
      "formula": {
        "expr": "无效边缘点数 = M - 1 (首尾各 M-1 点) ； 完全浸入有效区间: M - 1 ≤ i ≤ N - 1",
        "explain": "当冲激响应长度为 M 时，输出前 M-1 点与后 M-1 点存在边缘瞬态失真；只有中间 N - M + 1 个点接收到了完整的输入信息。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：图 6-10 高通去直流边缘效应与听感对比",
      "instruction": "调节直流偏置与滤波器长度 M，观察输出信号两端 M-1 个“不可用边缘”如何随 M 变宽；点击播放声音对比“保留畸变边缘”时的爆音冲击与“裁剪只留有效区”后的纯净音色。",
      "controls": [
        {
          "type": "slider",
          "id": "dcLevel",
          "label": "输入直流偏置 (DC)",
          "min": 0,
          "max": 2.6,
          "step": 0.2,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "高通滤波器长度 M",
          "min": 5,
          "max": 41,
          "step": 2,
          "value": 31,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "cropValid",
          "label": "裁剪首尾 M-1 边缘（仅留有效区）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar N = 81;\nvar audioSrc = null, audioGain = null, lastAudioKey = '';\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n  lastAudioKey = '';\n}\nfunction syncAudio() {\n  if (!lab.values.play) { stopAudio(); return; }\n  var dc = lab.values.dcLevel;\n  var M = Math.round(lab.values.taps);\n  var crop = !!lab.values.cropValid;\n  var key = dc.toFixed(2) + '_' + M + '_' + (crop ? 1 : 0);\n  if (key === lastAudioKey && audioSrc) return;\n  var actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') { try { actx.resume(); } catch (e) {} }\n  stopAudio();\n  lastAudioKey = key;\n  var sr = actx.sampleRate;\n  var burstLen = Math.floor(sr * 0.34);\n  var mAud = M * 45;\n  var sig = new Float32Array(burstLen);\n  var pref = new Float32Array(burstLen + 1);\n  for (var k = 0; k < burstLen; k++) {\n    var v = dc * 0.42 + 0.32 * Math.sin(2 * Math.PI * 330 * k / sr);\n    sig[k] = v;\n    pref[k + 1] = pref[k] + v;\n  }\n  var fullLen = burstLen + mAud - 1;\n  var out = new Float32Array(fullLen);\n  for (var i = 0; i < fullLen; i++) {\n    var xi = i < burstLen ? sig[i] : 0;\n    var pHi = Math.min(i + 1, burstLen);\n    var pLo = Math.max(0, i - mAud + 1);\n    out[i] = xi - (pref[pHi] - pref[pLo]) / mAud;\n  }\n  var gapLen = Math.floor(sr * 0.18);\n  var activeSlice = crop ? out.subarray(mAud - 1, burstLen) : out;\n  var buf = actx.createBuffer(1, activeSlice.length + gapLen, sr);\n  var ch = buf.getChannelData(0);\n  for (var i = 0; i < activeSlice.length; i++) {\n    var s = activeSlice[i];\n    if (crop) {\n      var fadeN = Math.min(96, Math.floor(activeSlice.length / 8));\n      if (i < fadeN) s *= i / fadeN;\n      else if (i > activeSlice.length - 1 - fadeN) s *= (activeSlice.length - 1 - i) / fadeN;\n    }\n    ch[i] = Math.max(-0.95, Math.min(0.95, s));\n  }\n  if (!audioGain) {\n    audioGain = actx.createGain();\n    audioGain.gain.value = 0.22;\n    audioGain.connect(actx.destination);\n  }\n  audioSrc = actx.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(audioGain);\n  audioSrc.start();\n}\nfunction drawPanel(x0, y0, pw, ph, data, yMin, yMax, title, lineCol, zones) {\n  ctx.save();\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(x0, y0, pw, ph);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, pw, ph);\n  var zeroY = y0 + ph * (yMax / (yMax - yMin));\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(x0, zeroY); ctx.lineTo(x0 + pw, zeroY); ctx.stroke();\n  if (zones) {\n    for (var z = 0; z < zones.length; z++) {\n      var zn = zones[z];\n      var zx1 = x0 + (zn.a / (data.length - 1)) * pw;\n      var zx2 = x0 + (zn.b / (data.length - 1)) * pw;\n      ctx.fillStyle = zn.fill;\n      ctx.fillRect(zx1, y0, zx2 - zx1, ph);\n      ctx.fillStyle = zn.textCol;\n      ctx.font = '10px sans-serif';\n      ctx.textAlign = 'center';\n      ctx.fillText(zn.label, (zx1 + zx2) / 2, y0 + 14);\n    }\n  }\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 4, y0 - 7);\n  ctx.strokeStyle = lineCol;\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var i = 0; i < data.length; i++) {\n    var px = x0 + (i / (data.length - 1)) * pw;\n    var py = y0 + ph * ((yMax - data[i]) / (yMax - yMin));\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n}\nfunction draw() {\n  var dc = lab.values.dcLevel;\n  var M = Math.round(lab.values.taps);\n  var crop = !!lab.values.cropValid;\n  ctx.clearRect(0, 0, W, H);\n  var x = [];\n  for (var n = 0; n < N; n++) x.push(dc + 0.9 * Math.sin(2 * Math.PI * 6 * n / 80));\n  var center = (M - 1) / 2;\n  var w = [], wSum = 0;\n  for (var j = 0; j < M; j++) { var v = 0.54 - 0.46 * Math.cos(2 * Math.PI * j / (M - 1)); w.push(v); wSum += v; }\n  var h = [];\n  for (var j = 0; j < M; j++) h.push((j === center ? 1 : 0) - w[j] / wSum);\n  var YL = N + M - 1;\n  var y = [];\n  for (var i = 0; i < YL; i++) {\n    var sum = 0;\n    for (var j = 0; j < M; j++) {\n      var xi = i - j;\n      if (xi >= 0 && xi < N) sum += h[j] * x[xi];\n    }\n    y.push(sum);\n  }\n  drawPanel(16, 28, 196, 174, x, -4, 4, '输入信号 x[n] (' + N + '点)', '#38bdf8', null);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 18px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('*', 226, 122);\n  drawPanel(240, 28, 102, 174, h, -0.35, 1.15, '高通 h[n] (' + M + '点)', '#f59e0b', null);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 18px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('=', 356, 122);\n  var xOut = 372, yOut = 28, wOut = 332, hOut = 174;\n  var zones = [\n    { a: 0, b: M - 1, fill: crop ? 'rgba(255,255,255,0.02)' : 'rgba(236,72,153,0.18)', textCol: crop ? 'rgba(248,250,252,0.28)' : '#ec4899', label: '边缘 ' + (M - 1) },\n    { a: M - 1, b: N - 1, fill: 'rgba(16,185,129,0.10)', textCol: '#10b981', label: '完全浸入有效区 (' + (N - M + 1) + '点)' },\n    { a: N - 1, b: YL - 1, fill: crop ? 'rgba(255,255,255,0.02)' : 'rgba(236,72,153,0.18)', textCol: crop ? 'rgba(248,250,252,0.28)' : '#ec4899', label: '边缘 ' + (M - 1) }\n  ];\n  drawPanel(xOut, yOut, wOut, hOut, y, -4, 4, '输出信号 y[n] (总长 ' + YL + ' 点)', crop ? 'rgba(255,255,255,0.15)' : '#10b981', zones);\n  if (crop) {\n    ctx.save();\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var i = M - 1; i <= N - 1; i++) {\n      var px = xOut + (i / (YL - 1)) * wOut;\n      var py = yOut + hOut * ((4 - y[i]) / 8);\n      if (i === M - 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n  ctx.textAlign = 'left';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px monospace';\n  ctx.fillText('0', 16, 218);\n  ctx.fillText(String(N - 1), 198, 218);\n  ctx.fillText('0', 372, 218);\n  ctx.fillText(String(M - 1), 372 + ((M - 1) / (YL - 1)) * wOut - 6, 218);\n  ctx.fillText(String(N - 1), 372 + ((N - 1) / (YL - 1)) * wOut - 6, 218);\n  ctx.fillText(String(YL - 1), 686, 218);\n  lab.setReadout('N=' + N + ', M=' + M + ' -> 总输出 ' + YL + ' 点 | 首尾失真各 ' + (M - 1) + ' 点 | 中间有效 ' + (N - M + 1) + ' 点' + (crop ? ' [已裁剪边缘]' : ' [保留完整波形]'));\n  syncAudio();\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "循环结构决定了并行潜力：输出侧算法外层遍历输出 `y[i]`、内层遍历冲激响应 `h[j]`，各输出点之间毫无依赖，天然适合 GPU/SIMD 并行或实时流式处理。",
        "为什么 `h[j]` 要翻转：数学上 `y[i] = Σ h[j]·x[i-j]` 中两个索引之和恒为 `i`，导致输入向后取点时冲激响应必须向前倒数，在流图上呈现为左右镜像翻转。",
        "长度公式与边缘代价：`N` 点信号与 `M` 点滤波器卷积，完整输出为 `N + M - 1` 点；但首尾各 `M - 1` 点因滤波器未完全浸入信号而严重畸变，滤波器越长（`M` 越大），可用的中间有效区间（`N - M + 1` 点）就越短。",
        "防越界铁律：写代码时千万别直接无保护地读取 `x[i - j]`！必须采取“越界分支跳过 / 输入两端预补 `M-1` 个零 / 外层循环收缩至 `[M-1, N-1]`”三种策略之一。"
      ]
    }
  ]
});
