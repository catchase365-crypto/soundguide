window.__BOOK_REGISTER_SECTION__("sec_138", {
  "title": "滑动平均滤波器的递归实现 (Recursive Implementation)",
  "intuition": "计算滑动平均不必每次把窗口里的点全部重加一遍——只需在上一时刻的结果上“加上新滑入的一点、减去刚滑出的一点”，无论窗口多大，每点永远只需 1 次加法和 1 次减法！",
  "blocks": [
    {
      "type": "concept",
      "heading": "消除冗余计算：从 O(M) 跃迁到 O(1) 的“加一减一”差分法",
      "paragraphs": [
        "假设我们要让输入信号 `x[]` 通过一个 **7 点滑动平均滤波器** 来生成输出信号 `y[]`。观察两个相邻输出点 `y[50]` 和 `y[51]` 的计算过程（暂不考虑除以 7 的归一化）：`y[50] = x[47] + x[48] + x[49] + x[50] + x[51] + x[52] + x[53]`，而 `y[51] = x[48] + x[49] + x[50] + x[51] + x[52] + x[53] + x[54]`。",
        "你会立刻发现绝大部分计算都在做无用功：`x[48]` 到 `x[53]` 这 6 个点被重复加了两遍！如果我们已经算出了 `y[50]`，那么计算 `y[51]` 最聪明的办法就是直接复用 `y[50]`，只补上新进来的 `x[54]`、踢掉刚离开的 `x[47]`，即 **`y[51] = y[50] + x[54] - x[47]`**。",
        "把这个技巧推广到任意**奇数点数** `M` 的滑动窗口，就得到了原书经典的 **Equation 15-3**。在启动递归之前，只需用常规求和算出信号的第 1 个有效输出点，之后整条信号上的每一个点都只需 **1 次加法和 1 次减法**。由于计算当前输出 `y[i]` 时同时用到了输入信号 `x[]` 和上一时刻算出的输出 `y[i-1]`，这种利用历史输出的计算方式被称为**递归方程 (Recursive Equation)**。"
      ],
      "formula": {
        "expr": "y[i] = y[i - 1] + x[i + p] - x[i - q],   p = (M - 1) / 2,   q = p + 1",
        "explain": "y[i] 为当前未归一化的窗口累加输出（实际输出需再除以 M）；y[i-1] 为前一时刻的累加值；M 为滑动平均点数（奇数）；p 是中心点右侧半宽，x[i+p] 是新进入窗口的样本；q = p + 1，x[i-q] 是刚刚移出窗口的旧样本。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：滑动窗口“加一减一”透视与实时音频降噪对比",
      "instruction": "拖动“观察当前时刻 i”和“滤波窗口点数 M”，观察绿色新增点与粉色移出点如何驱动输出更新；点击“播放降噪对比音”并切换平滑开关，亲耳听出递归滤波对白噪声的抑制效果。",
      "controls": [
        {
          "type": "slider",
          "id": "winSize",
          "label": "滤波窗口点数 M",
          "min": 3,
          "max": 51,
          "step": 2,
          "value": 15,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "随机噪声强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stepIdx",
          "label": "观察当前时刻 i",
          "min": 30,
          "max": 120,
          "step": 1,
          "value": 75,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDiff",
          "label": "高亮“加一减一”差分点",
          "value": true
        },
        {
          "type": "toggle",
          "id": "audioFilter",
          "label": "音频启用递归平滑",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放降噪对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 150;\nvar noiseArr = [];\nvar seed = 1337;\nfor (var k = 0; k < N; k++) {\n  seed = (seed * 16807) % 2147483647;\n  noiseArr.push(((seed - 1) / 2147483646) * 2 - 1);\n}\nvar audioNode = null;\nvar audioGain = null;\nvar audioRing = new Float32Array(256);\nvar audioRingIdx = 0;\nvar audioAcc = 0;\nvar audioPhase = 0;\nvar lastAudioM = -1;\n\nfunction ensureAudio(playing) {\n  if (!playing) {\n    if (audioGain) audioGain.gain.value = 0;\n    return;\n  }\n  var actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n  if (!audioNode) {\n    audioGain = actx.createGain();\n    audioGain.gain.value = 0.22;\n    audioNode = actx.createScriptProcessor(1024, 0, 1);\n    audioNode.onaudioprocess = function(e) {\n      var out = e.outputBuffer.getChannelData(0);\n      var sr = actx.sampleRate || 44100;\n      var M = Math.max(3, Math.floor(lab.values.winSize) | 1);\n      var Ma = Math.min(251, M * 3);\n      if (Ma !== lastAudioM) {\n        audioRing.fill(0);\n        audioAcc = 0;\n        audioRingIdx = 0;\n        lastAudioM = Ma;\n      }\n      var nAmp = lab.values.noiseAmp;\n      var useFilt = !!lab.values.audioFilter;\n      var dPhase = (2 * Math.PI * 260) / sr;\n      for (var i = 0; i < out.length; i++) {\n        audioPhase += dPhase;\n        if (audioPhase > 6.2831853) audioPhase -= 6.2831853;\n        var clean = 0.55 * Math.sin(audioPhase);\n        var nz = (Math.random() * 2 - 1) * nAmp * 0.7;\n        var sample = clean + nz;\n        var oldIdx = (audioRingIdx - Ma + 256) & 255;\n        var oldVal = audioRing[oldIdx];\n        audioRing[audioRingIdx] = sample;\n        audioAcc = audioAcc + sample - oldVal;\n        audioRingIdx = (audioRingIdx + 1) & 255;\n        out[i] = useFilt ? (audioAcc / Ma) : sample;\n      }\n    };\n    audioNode.connect(audioGain);\n    audioGain.connect(actx.destination);\n  }\n  audioGain.gain.value = 0.22;\n}\n\nfunction render() {\n  var M = Math.max(3, Math.floor(lab.values.winSize) | 1);\n  var p = (M - 1) / 2;\n  var q = p + 1;\n  var nAmp = lab.values.noiseAmp;\n  var curI = Math.floor(lab.values.stepIdx);\n  var showDiff = !!lab.values.showDiff;\n  ensureAudio(!!lab.values.play);\n\n  var x = new Array(N);\n  for (var k = 0; k < N; k++) {\n    var base = (k < 65 ? -0.35 : 0.45) + 0.3 * Math.sin(k * 0.14);\n    x[k] = base + nAmp * 0.7 * noiseArr[k];\n  }\n\n  var y = new Array(N);\n  var acc = 0;\n  for (var k = 0; k < M; k++) acc += x[k];\n  y[p] = acc / M;\n  for (var i = p + 1; i < N - p; i++) {\n    acc = acc + x[i + p] - x[i - q];\n    y[i] = acc / M;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 24;\n  var padR = 16;\n  var plotW = W - padL - padR;\n  var dx = plotW / (N - 1);\n  var cy1 = 62;\n  var cy2 = 180;\n  var sy = 36;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= 10; gx++) {\n    var xx = padL + (plotW * gx) / 10;\n    ctx.beginPath(); ctx.moveTo(xx, 10); ctx.lineTo(xx, H - 10); ctx.stroke();\n  }\n  ctx.beginPath(); ctx.moveTo(padL, cy1); ctx.lineTo(W - padR, cy1); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(padL, cy2); ctx.lineTo(W - padR, cy2); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(padL, 120); ctx.lineTo(W - padR, 120); ctx.stroke();\n\n  if (showDiff) {\n    var wx1 = padL + (curI - p) * dx;\n    var wx2 = padL + (curI + p) * dx;\n    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';\n    ctx.fillRect(wx1, 14, Math.max(2, wx2 - wx1), 96);\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.6)';\n    ctx.strokeRect(wx1, 14, Math.max(2, wx2 - wx1), 96);\n\n    var px1 = padL + (curI - q) * dx;\n    var px2 = padL + (curI - 1 + p) * dx;\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';\n    ctx.strokeRect(px1, 18, Math.max(2, px2 - px1), 88);\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var k = 0; k < N; k++) {\n    var px = padL + k * dx;\n    var py = cy1 - x[k] * sy;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showDiff) {\n    var outX = padL + (curI - q) * dx;\n    var outY = cy1 - x[curI - q] * sy;\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(outX, outY, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText('-x[' + (curI - q) + ']', Math.max(padL, outX - 28), 26);\n\n    var inX = padL + (curI + p) * dx;\n    var inY = cy1 - x[curI + p] * sy;\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(inX, inY, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.fillText('+x[' + (curI + p) + ']', Math.min(W - 65, inX + 6), 26);\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var started = false;\n  for (var k = p; k < N - p; k++) {\n    var px = padL + k * dx;\n    var py = cy2 - y[k] * sy;\n    if (!started) { ctx.moveTo(px, py); started = true; } else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var prevX = padL + (curI - 1) * dx;\n  var prevY = cy2 - y[curI - 1] * sy;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(prevX, prevY, 4, 0, Math.PI * 2); ctx.fill();\n\n  var curX = padL + curI * dx;\n  var curY = cy2 - y[curI] * sy;\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(curX, curY, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(curX, 126); ctx.lineTo(curX, 232); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('输入信号 x[n]  (当前中心 i=' + curI + ', p=' + p + ', q=' + q + ')', padL, 14);\n  ctx.fillText('递归输出 y[n]  (琥珀点 y[' + (curI - 1) + '] → 白点 y[' + curI + '])', padL, 134);\n\n  var audioTag = lab.values.play ? (lab.values.audioFilter ? '声音: 递归平滑中' : '声音: 原始含噪信号') : '声音: 已暂停';\n  lab.setReadout('窗口 M=' + M + ' | 传统卷积: ' + M + ' 次加/点 | 递归算法: 恒定 2 次加减/点 (提速 ' + (M / 2).toFixed(1) + 'x) | ' + audioTag);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "名字叫“递归”，内核却是 FIR？揭秘它为何快到飞起",
      "paragraphs": [
        "在数字信号处理里，提到“递归滤波器 (Recursive Filter)”时要特别小心：**滑动平均的递归实现，与常规意义上的递归滤波器完全不同**。典型的递归滤波器拥有无限长冲激响应（**IIR**），冲激响应由衰减的正弦波和指数函数组成；而滑动平均递归滤波器的冲激响应只是一个有限长度的矩形脉冲，它货真价实属于有限冲激响应（**FIR**）——因为新加入的一个脉冲在窗口滑过 `M` 个点后，会被 `-x[i-q]` 精准抵消归零。",
        "为什么这套递归算法被称为速度最快的数字滤波器？原书总结了四大硬核原因：",
        "**1. 计算量与滤波长度彻底脱钩**：无论是 5 点平均还是 1001 点平均，每计算一个输出点永远只需要 2 次运算；\n**2. 告别耗时的乘法器**：绝大多数数字滤波器（如高斯、布莱克曼窗）依赖大量乘法，而它核心循环只有加法和减法（除以 `M` 可放在最终读取时或用移位代替）；\n**3. 极简寻址**：下标偏移量 `p` 和 `q` 在滤波开始前就已算好为固定整数常量；\n**4. 可全程纯整数运算**：整个算法完全不需要浮点数，在许多硬件平台上，整数运算比浮点运算快一个数量级以上！"
      ],
      "formula": {
        "expr": "h[n] = 1/M  (-p <= n <= p),   0  (其余点);   复杂度 = O(1) = 2 ops/sample",
        "explain": "虽然使用了递归形式 y[i-1] 来加速求和，但该系统的单位冲激响应 h[n] 依然严格截断在 M 个点内（矩形脉冲 FIR），单点运算量恒定为 2 次加减，与滤波窗口长度 M 无关。"
      }
    },
    {
      "type": "concept",
      "heading": "隐蔽的工程陷阱：浮点“累加漂移”与双精度累加器 (Table 15-2)",
      "paragraphs": [
        "整数运算不仅比浮点更快，在这里居然还**比浮点更准**！原因在于浮点算术存在微小的舍入误差 (Round-off Error)。在普通卷积里，各点的舍入误差互不继承；但在递归滑动平均中，每一次的误差都会被 `y[i-1]` 原封不动地传给下一时刻。",
        "设想你用单精度浮点数过滤一段 10,000 个点的信号：最后一个输出点里，竟然累积了整整 **10,000 次加法和 10,000 次减法** 遗留下的舍入残渣！这些微小误差不断随机游走累积，最终在输出信号上表现为一条诡异的**漂移直流偏置 (Drifting Offset)**。整数算术则完全没有舍入误差，不存在这个问题。",
        "如果工程上由于数据动态范围等原因必须使用浮点数，原书 **Table 15-2** 给出了标准解法：使用**双精度累加器 (`DEFDBL ACC`)** 来保存运行总和，每次只做双精度的加减更新，需要输出 `Y[I%]` 时再除以点数 `M`（例如 101）。这能将舍入漂移压制到几乎为零。"
      ],
      "formula": {
        "expr": "ACC_64 = ACC_64 + X[i + 50] - X[i - 51];   Y[i] = ACC_64 / 101",
        "explain": "对应原书 Table 15-2（101 点滑动平均）：ACC_64 为 64 位双精度浮点累加器，负责高保真保存当前窗口内的信号总和；Y[i] 为归一化后的输出，避免用低精度浮点数直接滚雪球累加。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：亲眼目睹 32 位浮点“累加漂移”并一键修复",
      "instruction": "增大“信号直流基准 (DC Bias)”和“信号总长度 N”，观察上方粉色曲线（单精度 float32 递归）如何逐渐偏离绿色真实曲线；再开启“启用双精度累加器”开关验证 Table 15-2 的修复效果。",
      "controls": [
        {
          "type": "slider",
          "id": "sigLen",
          "label": "信号总长度 N",
          "min": 1000,
          "max": 20000,
          "step": 1000,
          "value": 12000,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "dcBias",
          "label": "信号直流基准 (DC Bias)",
          "min": 0,
          "max": 50000,
          "step": 2500,
          "value": 25000,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "winM",
          "label": "滤波窗口 M",
          "min": 11,
          "max": 201,
          "step": 10,
          "value": 101,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "useDouble",
          "label": "启用双精度累加器 (Table 15-2)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar MAX_N = 20005;\nvar noiseBuf = new Float32Array(MAX_N);\nvar seed = 4242;\nfor (var k = 0; k < MAX_N; k++) {\n  seed = (seed * 48271) % 2147483647;\n  noiseBuf[k] = ((seed - 1) / 2147483646) * 2 - 1;\n}\n\nfunction render() {\n  var N = Math.floor(lab.values.sigLen);\n  var dc = lab.values.dcBias;\n  var M = Math.floor(lab.values.winM) | 1;\n  var p = (M - 1) / 2;\n  var q = p + 1;\n  var useDouble = !!lab.values.useDouble;\n\n  var x32 = new Float32Array(N);\n  for (var k = 0; k < N; k++) {\n    var val = dc + 1.2 * Math.sin(k * 0.0045) + 0.8 * noiseBuf[k];\n    x32[k] = Math.fround(val);\n  }\n\n  var validStart = p;\n  var validEnd = N - p - 1;\n  var yExact = new Float64Array(N);\n  var yActive = new Float64Array(N);\n  var errArr = new Float64Array(N);\n\n  var acc64 = 0;\n  for (var k = 0; k < M; k++) acc64 += x32[k];\n  yExact[p] = acc64 / M;\n  for (var i = p + 1; i <= validEnd; i++) {\n    acc64 = acc64 + x32[i + p] - x32[i - q];\n    yExact[i] = acc64 / M;\n  }\n\n  if (useDouble) {\n    for (var i = validStart; i <= validEnd; i++) {\n      yActive[i] = yExact[i];\n      errArr[i] = 0;\n    }\n  } else {\n    var acc32 = Math.fround(0);\n    for (var k = 0; k < M; k++) acc32 = Math.fround(acc32 + x32[k]);\n    yActive[p] = Math.fround(acc32 / M);\n    errArr[p] = yActive[p] - yExact[p];\n    for (var i = p + 1; i <= validEnd; i++) {\n      acc32 = Math.fround(Math.fround(acc32 + x32[i + p]) - x32[i - q]);\n      yActive[i] = Math.fround(acc32 / M);\n      errArr[i] = yActive[i] - yExact[i];\n    }\n  }\n\n  var maxErr = 0;\n  for (var i = validStart; i <= validEnd; i++) {\n    var ae = Math.abs(errArr[i]);\n    if (ae > maxErr) maxErr = ae;\n  }\n  var endErr = errArr[validEnd];\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 24;\n  var padR = 16;\n  var plotW = W - padL - padR;\n  var topY = 18;\n  var topH = 112;\n  var topMid = topY + topH / 2;\n  var botY = 152;\n  var botH = 74;\n  var botMid = botY + botH / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 8; g++) {\n    var gx = padL + (plotW * g) / 8;\n    ctx.beginPath(); ctx.moveTo(gx, 12); ctx.lineTo(gx, H - 10); ctx.stroke();\n  }\n  ctx.beginPath(); ctx.moveTo(padL, topMid); ctx.lineTo(W - padR, topMid); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(padL, botMid); ctx.lineTo(W - padR, botMid); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(padL, 140); ctx.lineTo(W - padR, 140); ctx.stroke();\n\n  var topSpan = Math.max(2.2, 1.5 + maxErr * 1.15);\n  var topScale = (topH * 0.44) / topSpan;\n  var errScale = (botH * 0.42) / Math.max(0.05, maxErr * 1.15);\n\n  var stride = Math.max(1, Math.floor((validEnd - validStart) / 360));\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var first = true;\n  for (var i = validStart; i <= validEnd; i += stride) {\n    var px = padL + ((i - validStart) / Math.max(1, validEnd - validStart)) * plotW;\n    var py = topMid - (yExact[i] - dc) * topScale;\n    if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = useDouble ? '#38bdf8' : '#ec4899';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  first = true;\n  for (var i = validStart; i <= validEnd; i += stride) {\n    var px = padL + ((i - validStart) / Math.max(1, validEnd - validStart)) * plotW;\n    var py = topMid - (yActive[i] - dc) * topScale;\n    if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = useDouble ? '#38bdf8' : '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  first = true;\n  for (var i = validStart; i <= validEnd; i += stride) {\n    var px = padL + ((i - validStart) / Math.max(1, validEnd - validStart)) * plotW;\n    var py = botMid - errArr[i] * errScale;\n    if (first) { ctx.moveTo(px, py); first = false; } else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('去偏置输出 (y - DC):  绿线=精确真值  |  ' + (useDouble ? '蓝线=双精度ACC (完全重合)' : '粉线=单精度 float32 递归'), padL, 14);\n  ctx.fillText('累积漂移误差 (y_algo - y_exact):  当前最大绝对误差 = ' + maxErr.toFixed(4), padL, 152);\n\n  lab.setReadout((useDouble ? '双精度 ACC 模式' : '单精度 float32 模式') + ' | 信号长度 N=' + N + ' | DC=' + dc + ' | 末端漂移=' + endErr.toFixed(4) + ' | 最大漂移=' + maxErr.toFixed(4));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【首点必须单独求】递归差分公式只能用于第 2 个有效点及之后；启动时的第一个输出点，必须老老实实用常规累加算出。",
        "【不要把递归窗口和 IIR 混为一谈】它虽然写了 y[i-1]，但冲激响应依然是有限长度矩形脉冲（FIR），不会产生 IIR 那种无限振荡拖尾。",
        "【整数是最优解，浮点头疼靠双精度】纯整数实现既快到极致又绝对零漂移；一旦迫不得已使用浮点数，务必像 Table 15-2 那样给累加器 ACC 开 double（64位双精度），否则长信号末尾一定会出现严重偏移。",
        "【下标与边界别写反】若窗口长为奇数 M，半宽 p=(M-1)/2，则新加入的是 x[i+p]，被踢出的是 x[i-(p+1)]（即 i-q），千万别写成 x[i-p]，否则窗口宽度会错成 M-1。"
      ]
    }
  ]
});
