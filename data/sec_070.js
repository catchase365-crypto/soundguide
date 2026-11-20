window.__BOOK_REGISTER_SECTION__("sec_070", {
  "title": "类微积分运算：一阶差分与累加和 (Calculus-like Operations)",
  "intuition": "离散信号没有连续世界里的“无穷小极限”，但只要把相邻采样“后项减前项”就能直接测出信号斜率（离散微分），而把采样值“一路向右累加”就能还原出面积（离散积分），且用递归公式只需一次加法就能搞定，不必傻傻去做无限长的卷积。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、离散世界里的“求导”与“积分”",
      "paragraphs": [
        "在高等数学和模拟电路中，**导数（Derivative）**和**积分（Integral）**是处理连续信号最核心的两把手术刀。但在数字信号处理（DSP）中，信号是一串孤立的离散数字，数学家严谨地规定：\"导数\"与\"积分\"这两个词专属于连续信号，离散世界里它们对应的正式名称分别叫做**一阶差分（First Difference）**和**累加和（Running Sum）**。",
        "虽然工程师口头上常把它们直呼为\"离散导数\"和\"离散积分\"（让纯数学家听了直皱眉），但它们的物理本质完全一致：**一阶差分**通过计算相邻两个采样点的差值，输出原始信号在每一处的**瞬时斜率**；而**累加和**则把当前位置左侧的所有采样值全部加起来，作为一阶差分的**逆运算**，能把斜率信号重新还原成原始波形。",
        "令人惊叹的是，这两种看似微积分的操作，本质上都可以写成**卷积**：一阶差分的脉冲响应只有两个非零点（`n=0` 时为 `1`，`n=1` 时为 `-1`）；而累加和的脉冲响应则是一个从 `n=0` 开始、向右**无限延伸**的恒定为 `1` 的阶跃序列。"
      ],
      "formula": {
        "expr": "y[n] = x[n] - x[n-1]   (等价于与 h = [1, -1] 卷积)",
        "explain": "x[n] 是当前时刻的输入采样，x[n-1] 是上一个时刻的输入采样，y[n] 是输出的一阶差分，数值大小直接等于输入信号在时刻 n 处的局部斜率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：信号斜率探测器与“差分听感”实验室",
      "instruction": "拖动“边缘陡峭度”滑块将三角波逐步变成方波，观察右侧一阶差分如何把斜率变成方波/尖峰；点击播放声音并切换“音频切为差分输出”，亲耳听一听“求导”对音色的改变（三角波求导变方波）！",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号周期数 / 音高倍率",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " 倍"
        },
        {
          "type": "slider",
          "id": "edge",
          "label": "边缘陡峭度 (0%三角 → 100%方波)",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 30,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "symmetric",
          "label": "开启对称中心差分 (x[n+1]-x[n-1])/2",
          "value": false
        },
        {
          "type": "toggle",
          "id": "listenDiff",
          "label": "音频输出切为：一阶差分信号",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var srcNode = null;\nvar lastAudioKey = '';\n\nfunction genWaveSample(phase, edgePct) {\n  var rise = (100 - edgePct) / 200;\n  var u = phase - Math.floor(phase);\n  if (rise <= 0.0001) {\n    return u < 0.5 ? 1.0 : -1.0;\n  }\n  if (u < rise) return -1.0 + 2.0 * (u / rise);\n  if (u < 0.5) return 1.0;\n  if (u < 0.5 + rise) return 1.0 - 2.0 * ((u - 0.5) / rise);\n  return -1.0;\n}\n\nfunction drawGrid(ctx, x0, y0, w, h, maxVal, title, color) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = y0 + (h * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + w, yy); ctx.stroke();\n  }\n  for (var j = 0; j <= 4; j++) {\n    var xx = x0 + (w * j) / 4;\n    ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(x0, y0 + h / 2); ctx.lineTo(x0 + w, y0 + h / 2); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(title, x0, y0 - 10);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px monospace';\n  ctx.fillText('+' + maxVal.toFixed(2), x0 - 34, y0 + 8);\n  ctx.fillText('0.00', x0 - 28, y0 + h / 2 + 4);\n  ctx.fillText('-' + maxVal.toFixed(2), x0 - 34, y0 + h);\n}\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n  lastAudioKey = '';\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  var ctx = lab.getAudioContext();\n  if (ctx.state === 'suspended') ctx.resume();\n  var key = lab.values.freq + '|' + lab.values.edge + '|' + lab.values.symmetric + '|' + lab.values.listenDiff;\n  if (key === lastAudioKey && srcNode) return;\n\n  stopAudio();\n  lastAudioKey = key;\n\n  var baseHz = 110 * lab.values.freq;\n  var sr = ctx.sampleRate;\n  var period = Math.max(16, Math.round(sr / baseHz));\n  var total = period * 32;\n  var buf = ctx.createBuffer(1, total, sr);\n  var data = buf.getChannelData(0);\n\n  var raw = new Float32Array(total);\n  for (var i = 0; i < total; i++) {\n    raw[i] = genWaveSample(i / period, lab.values.edge);\n  }\n\n  var peak = 0;\n  if (lab.values.listenDiff) {\n    for (var i = 0; i < total; i++) {\n      var val;\n      if (lab.values.symmetric) {\n        var next = raw[(i + 1) % total];\n        var prev = raw[(i - 1 + total) % total];\n        val = (next - prev) * 0.5;\n      } else {\n        var prev1 = raw[(i - 1 + total) % total];\n        val = raw[i] - prev1;\n      }\n      data[i] = val;\n      if (Math.abs(val) > peak) peak = Math.abs(val);\n    }\n  } else {\n    for (var i = 0; i < total; i++) {\n      data[i] = raw[i];\n      if (Math.abs(raw[i]) > peak) peak = Math.abs(raw[i]);\n    }\n  }\n\n  var scale = peak > 1e-6 ? 0.22 / peak : 1;\n  for (var i = 0; i < total; i++) data[i] *= scale;\n\n  srcNode = ctx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(ctx.destination);\n  srcNode.start();\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  ctx.clearRect(0, 0, lab.width, lab.height);\n\n  var N = 80;\n  var freq = lab.values.freq;\n  var edge = lab.values.edge;\n  var sym = lab.values.symmetric;\n\n  var xArr = [];\n  for (var n = 0; n < N; n++) {\n    xArr.push(genWaveSample((n / N) * freq, edge));\n  }\n\n  var yArr = [];\n  var peakDiff = 0;\n  for (var n = 0; n < N; n++) {\n    var d;\n    if (sym) {\n      var xp = n + 1 < N ? xArr[n + 1] : xArr[n];\n      var xm = n - 1 >= 0 ? xArr[n - 1] : xArr[0];\n      d = (xp - xm) / 2;\n    } else {\n      d = n === 0 ? 0 : xArr[n] - xArr[n - 1];\n    }\n    yArr.push(d);\n    if (Math.abs(d) > peakDiff) peakDiff = Math.abs(d);\n  }\n\n  var yScale = Math.max(0.25, peakDiff * 1.15);\n\n  drawGrid(ctx, 44, 34, 290, 172, 1.0, 'a. 原始输入信号 x[n]', '#38bdf8');\n  drawGrid(ctx, 404, 34, 290, 172, yScale, sym ? 'b. 对称中心差分 y[n]' : 'b. 一阶差分输出 y[n]', '#10b981');\n\n  // Arrow between panels\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('差分', 344, 108);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(342, 120); ctx.lineTo(366, 120); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(360, 115); ctx.lineTo(367, 120); ctx.lineTo(360, 125); ctx.stroke();\n\n  // Draw stems for x[n]\n  for (var n = 0; n < N; n++) {\n    var px = 44 + (n / (N - 1)) * 290;\n    var py = 34 + 86 - xArr[n] * 80;\n    ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(px, 120); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  // Draw stems for y[n]\n  for (var n = 0; n < N; n++) {\n    var px = 404 + (n / (N - 1)) * 290;\n    var py = 34 + 86 - (yArr[n] / yScale) * 80;\n    ctx.strokeStyle = 'rgba(16,185,129,0.45)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(px, 120); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = Math.abs(yArr[n]) > peakDiff * 0.8 ? '#f59e0b' : '#10b981';\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('样本序号 n (0 ~ 79)', 140, 226);\n  ctx.fillText('样本序号 n (0 ~ 79)', 500, 226);\n\n  var formulaTxt = sym ? 'y[n] = (x[n+1] - x[n-1]) / 2' : 'y[n] = x[n] - x[n-1]';\n  var audioTxt = lab.values.play ? (lab.values.listenDiff ? '🔊 播放: 一阶差分(' + (110 * freq) + 'Hz)' : '🔊 播放: 原始信号(' + (110 * freq) + 'Hz)') : '🔇 音频已暂停';\n  lab.setReadout('公式: ' + formulaTxt + '  |  最大差分峰值: ±' + peakDiff.toFixed(3) + '  |  ' + audioTxt);\n\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "二、为什么不用卷积？递归方程的降维打击",
      "paragraphs": [
        "虽然从理论上讲，累加和等价于输入信号与单位阶跃序列的卷积，但直接写卷积程序去算累加和简直是一场灾难——因为它的脉冲响应**延伸到无穷远**！即便在有限长度的信号中，用定义 `y[40] = x[0] + x[1] + ... + x[40]` 逐个求和，采样点越多计算量就越呈平方级暴增。",
        "聪明的做法是切换到**递归（Recursion）**视角：既然刚才已经算出了前 40 项的和 `y[40]`，那么算 `y[41]` 时只需要把新来的 `x[41]` 加上去就行，即 `y[41] = x[41] + y[40]`！每个采样点只需**一次加法**，无论脉冲响应多长都能瞬间算完。",
        "像这样输出值不仅依赖当前输入、还依赖过去输出值的等式，在 DSP 中被称为**递归方程（Recursion Equation）**或**差分方程（Difference Equation）**。在写程序循环时还需特别留意 `n=0` 边界的初始化：一阶差分通常设 `Y[0] = 0`（因为没有 `X[-1]`），而累加和通常设 `Y[0] = X[0]`。"
      ],
      "formula": {
        "expr": "y[n] = x[n] + y[n-1]",
        "explain": "累加和的递归实现：当前输出 y[n] 等于当前输入采样 x[n] 加上前一个时刻的输出结果 y[n-1]。其数学结果与无限长阶跃脉冲响应的卷积完全一致。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：累加和还原实验与“直流漂移”陷阱",
      "instruction": "保持直流偏置为 0 时，累加和能完美还原原始斜坡波形；试着把“微小直流偏置”向右拉哪怕一点点（如 +0.01），观察积分器如何把微小的误差累积成灾难性的线性漂移！",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "原始信号幅度缩放",
          "min": 0.4,
          "max": 1.6,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "dcBias",
          "label": "叠加微小直流偏置 (误差/偏置)",
          "min": -0.04,
          "max": 0.04,
          "step": 0.005,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "roundTrip",
          "label": "还原对比模式 (原始→一阶差分→累加和)",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  ctx.clearRect(0, 0, lab.width, lab.height);\n\n  var N = 80;\n  var amp = lab.values.amp;\n  var bias = lab.values.dcBias;\n  var rt = lab.values.roundTrip;\n\n  var orig = [];\n  var inSum = [];\n  var rec = [];\n  var idealOut = [];\n\n  if (rt) {\n    // Mimic Fig 7-3a\n    for (var n = 0; n < N; n++) {\n      var v = 0;\n      if (n < 10) v = 0;\n      else if (n < 30) v = (n - 10) / 19;\n      else if (n < 40) v = 1.0;\n      else if (n < 50) v = 1.0 - (n - 39) * 0.18;\n      else v = -0.8 * Math.exp(-(n - 49) / 5.5);\n      orig.push(v * amp);\n    }\n    for (var n = 0; n < N; n++) {\n      var d = n === 0 ? 0 : orig[n] - orig[n - 1];\n      inSum.push(d + bias);\n    }\n    for (var n = 0; n < N; n++) {\n      rec.push(n === 0 ? inSum[0] : rec[n - 1] + inSum[n]);\n      idealOut.push(orig[n]);\n    }\n  } else {\n    // Square pulse integration mode\n    var accIdeal = 0;\n    for (var n = 0; n < N; n++) {\n      var p = (n >= 15 && n < 35) ? 0.1 * amp : 0;\n      inSum.push(p + bias);\n      accIdeal += p;\n      idealOut.push(accIdeal);\n      rec.push(n === 0 ? inSum[0] : rec[n - 1] + inSum[n]);\n    }\n  }\n\n  var maxIn = 0.15;\n  var maxOut = 1.5;\n  for (var n = 0; n < N; n++) {\n    if (Math.abs(inSum[n]) > maxIn) maxIn = Math.abs(inSum[n]);\n    if (Math.abs(idealOut[n]) > maxOut) maxOut = Math.abs(idealOut[n]);\n    if (Math.abs(rec[n]) > maxOut) maxOut = Math.abs(rec[n]);\n  }\n  maxIn *= 1.15;\n  maxOut *= 1.12;\n\n  function drawPanel(x0, y0, w, h, maxV, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var i = 0; i <= 4; i++) {\n      var yy = y0 + (h * i) / 4;\n      ctx.beginPath(); ctx.moveTo(x0, yy); ctx.lineTo(x0 + w, yy); ctx.stroke();\n    }\n    for (var j = 0; j <= 4; j++) {\n      var xx = x0 + (w * j) / 4;\n      ctx.beginPath(); ctx.moveTo(xx, y0); ctx.lineTo(xx, y0 + h); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.beginPath(); ctx.moveTo(x0, y0 + h / 2); ctx.lineTo(x0 + w, y0 + h / 2); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(title, x0, y0 - 10);\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '10px monospace';\n    ctx.fillText('+' + maxV.toFixed(2), x0 - 38, y0 + 8);\n    ctx.fillText('0.00', x0 - 30, y0 + h / 2 + 4);\n    ctx.fillText('-' + maxV.toFixed(2), x0 - 38, y0 + h);\n  }\n\n  drawPanel(46, 34, 286, 172, maxIn, rt ? '送入累加器的信号 (一阶差分 + 偏置)' : '送入累加器的矩形脉冲 (+ 偏置)');\n  drawPanel(406, 34, 286, 172, maxOut, rt ? '累加和还原 (蓝虚线为原信号)' : '累加和输出 (蓝虚线为无偏置理想值)');\n\n  // Arrow\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('累加和', 340, 108);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(340, 120); ctx.lineTo(368, 120); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(362, 115); ctx.lineTo(369, 120); ctx.lineTo(362, 125); ctx.stroke();\n\n  // Left stems\n  for (var n = 0; n < N; n++) {\n    var px = 46 + (n / (N - 1)) * 286;\n    var py = 34 + 86 - (inSum[n] / maxIn) * 80;\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(px, 120); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  // Right ideal dashed curve\n  ctx.strokeStyle = 'rgba(56,189,248,0.75)';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = 406 + (n / (N - 1)) * 286;\n    var py = 34 + 86 - (idealOut[n] / maxOut) * 80;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Right actual running sum\n  var endErr = rec[N - 1] - idealOut[N - 1];\n  var drifting = Math.abs(endErr) > 0.05;\n  var recColor = drifting ? '#ec4899' : '#10b981';\n  for (var n = 0; n < N; n++) {\n    var px = 406 + (n / (N - 1)) * 286;\n    var py = 34 + 86 - (rec[n] / maxOut) * 80;\n    ctx.fillStyle = recColor;\n    ctx.fillRect(px - 1.8, py - 1.8, 3.6, 3.6);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('样本序号 n (0 ~ 79)', 140, 226);\n  ctx.fillText('样本序号 n (0 ~ 79)', 500, 226);\n\n  lab.setReadout('直流偏置: ' + bias.toFixed(3) + '  |  末端累积误差 (n=79): ' + (endErr >= 0 ? '+' : '') + endErr.toFixed(3) + (drifting ? '  ⚠️ 发生积分漂移失控！' : '  ✅ 完美无漂移还原'));\n});"
    },
    {
      "type": "concept",
      "heading": "三、求斜率不止一种写法：对称中心差分",
      "paragraphs": [
        "虽然 `y[n] = x[n] - x[n-1]` 是最常用的一阶差分公式，但它并非离散求导的唯一标准。仔细观察就会发现，它算的其实是 `n` 与 `n-1` 这两个采样点**正中间**（也就是 `n - 0.5` 处）的斜率，这在等效上给输出信号带来了半个采样周期的延迟。",
        "为了消除这半个采样点的相位偏移，工程中还有一种常用的对称定义方法——**中心差分**：把目标点右边一个点减去左边一个点，再除以跨度 `2`。"
      ],
      "formula": {
        "expr": "y[n] = ( x[n+1] - x[n-1] ) / 2",
        "explain": "以点 n 为中心左右对称地取相邻点 x[n+1] 与 x[n-1] 相减并除以 2，所求出的斜率严格对齐在采样点 n 的正上方，消除了半采样点的时延偏移（但代价是需要提前知道“未来”的 x[n+1]，适合离线处理）。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "高频噪声放大坑：一阶差分专挑变化剧烈的地方下手（斜率越大输出越高），实际工程中传感器信号只要带一点高频毛刺，直接做一阶差分就会把毛刺剧烈放大；通常需要先平滑滤波，或改用对称差分来缓和。",
        "积分漂移灾难坑：累加和 `y[n] = x[n] + y[n-1]` 的增益在直流（0 Hz）处是无穷大的。只要输入信号里混入哪怕 `0.001` 的微小直流偏置（比如传感器零点未校准），累加和就会像滚雪球一样一路单调飘走直至溢出饱和，这正是第 19 章要学习的“漏积分器（Leaky Integrator）”要解决的核心问题。",
        "算力思维切换：遇到长脉冲响应或无限长脉冲响应（如累加和）时，别硬套卷积循环，检查它能否改写成仅依赖少数历史输出的递归差分方程，时间复杂度直接从 O(N²) 降到 O(N)。",
        "数组边界意识：写代码实现差分与累加时，务必显式初始化 `Y[0]`（如一阶差分设 `Y[0] = 0`，累加和设 `Y[0] = X[0]`），防止读取 `X[-1]` 或 `Y[-1]` 造成内存越界报错。"
      ]
    }
  ]
});
