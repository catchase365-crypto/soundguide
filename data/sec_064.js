window.__BOOK_REGISTER_SECTION__("sec_064", {
  "title": "卷积：线性系统的核心运算 (Convolution)",
  "intuition": "把任意输入信号拆成一连串脉冲，分别算出系统对每个脉冲的响应再叠加起来，就是卷积——一旦掌握了脉冲响应，你就掌握了这个线性系统的全部秘密。",
  "blocks": [
    {
      "type": "concept",
      "heading": "三步走：线性系统如何把输入变成输出",
      "paragraphs": [
        "在上一节我们知道，只要把单位脉冲 `δ[n]` 送入线性系统，出来的信号就叫**脉冲响应** `h[n]`。现在，如果送进去的不再是单个脉冲，而是一段任意复杂的输入信号 `x[n]`，系统会怎么处理它呢？",
        "我们可以把整个过程拆解成极其直观的三步：",
        "1. **分解输入**：把任意输入信号 `x[n]` 看作是一系列不同时刻、不同幅度的脉冲组合，每一个采样点都可以写成平移且缩放后的 `δ[n]`。",
        "2. **各自响应**：利用线性系统的**齐次性（缩放不变）**与**移位不变性**，每个脉冲单独通过系统后，都会变成一个对应平移和缩放版本的脉冲响应 `h[n]`。",
        "3. **叠加输出**：把所有这些平移、缩放后的脉冲响应全部加在一起，就得到了最终的总输出信号 `y[n]`。",
        "这意味着：**只要你知道了一个系统的脉冲响应 `h[n]`，你就能算出它对任何输入信号的输出。** 关于一个线性系统的所有特性，都已经毫无保留地藏在 `h[n]` 里了（尽管在后续章节中，我们还会用频域等不同形式来重新表达这些信息）。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验一：分解、响应与叠加——亲眼看见卷积的发生",
      "instruction": "拖动两个输入脉冲的幅度滑块与系统衰减系数，观察左侧输入信号 x[n] 如何激发出右侧两个平移缩放的脉冲响应，并最终叠加成输出信号 y[n]。",
      "controls": [
        {
          "type": "slider",
          "id": "amp1",
          "label": "n=1 处脉冲幅度",
          "min": -2,
          "max": 2,
          "step": 0.2,
          "value": 1.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp2",
          "label": "n=4 处脉冲幅度",
          "min": -2,
          "max": 2,
          "step": 0.2,
          "value": -1.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "decay",
          "label": "脉冲响应衰减率",
          "min": 0.3,
          "max": 0.85,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showParts",
          "label": "显示各个脉冲的独立响应分量",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var amp1 = lab.values.amp1;\n  var amp2 = lab.values.amp2;\n  var decay = lab.values.decay;\n  var showParts = lab.values.showParts;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var hLen = 8;\n  var h = [];\n  for (var i = 0; i < hLen; i++) {\n    h.push(Math.pow(decay, i));\n  }\n\n  var N = 16;\n  var x = new Array(N).fill(0);\n  x[1] = amp1;\n  x[4] = amp2;\n\n  var y1 = new Array(N).fill(0);\n  var y2 = new Array(N).fill(0);\n  var y = new Array(N).fill(0);\n  for (var n = 0; n < N; n++) {\n    if (n - 1 >= 0 && n - 1 < hLen) y1[n] = amp1 * h[n - 1];\n    if (n - 4 >= 0 && n - 4 < hLen) y2[n] = amp2 * h[n - 4];\n    y[n] = y1[n] + y2[n];\n  }\n\n  function drawGrid(x0, y0, pw, ph) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var gx = 0; gx <= 4; gx++) {\n      var px = x0 + (pw * gx) / 4;\n      ctx.beginPath(); ctx.moveTo(px, y0); ctx.lineTo(px, y0 + ph); ctx.stroke();\n    }\n    for (var gy = 0; gy <= 4; gy++) {\n      var py = y0 + (ph * gy) / 4;\n      ctx.beginPath(); ctx.moveTo(x0, py); ctx.lineTo(x0 + pw, py); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.beginPath(); ctx.moveTo(x0, y0 + ph / 2); ctx.lineTo(x0 + pw, y0 + ph / 2); ctx.stroke();\n  }\n\n  function drawStems(arr, count, x0, y0, pw, ph, maxVal, color, radius, offsetX) {\n    var baseY = y0 + ph / 2;\n    var scaleY = (ph / 2 - 8) / maxVal;\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = 2;\n    for (var k = 0; k < count; k++) {\n      var px = x0 + 12 + (k / (count - 1)) * (pw - 24) + (offsetX || 0);\n      var py = baseY - arr[k] * scaleY;\n      ctx.beginPath();\n      ctx.moveTo(px, baseY);\n      ctx.lineTo(px, py);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.arc(px, py, radius, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  drawGrid(20, 26, 200, 86);\n  drawStems(x, 8, 20, 26, 200, 86, 2.2, '#f8fafc', 3.5, 0);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('输入信号 x[n] (两个脉冲)', 22, 18);\n\n  drawGrid(20, 138, 200, 86);\n  drawStems(h, hLen, 20, 138, 200, 86, 1.3, '#f59e0b', 3, 0);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('系统脉冲响应 h[n]', 22, 130);\n\n  drawGrid(260, 26, 440, 198);\n  if (showParts) {\n    drawStems(y1, N, 260, 26, 440, 198, 2.5, 'rgba(56,189,248,0.65)', 3, -3);\n    drawStems(y2, N, 260, 26, 440, 198, 2.5, 'rgba(236,72,153,0.65)', 3, 3);\n  }\n  drawStems(y, N, 260, 26, 440, 198, 2.5, '#10b981', 4, 0);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('输出 y[n] = x[1]·h[n-1] + x[4]·h[n-4]', 262, 18);\n\n  if (showParts) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('● 分量1 (蓝)', 510, 18);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('● 分量2 (粉)', 585, 18);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('● 总和 (绿)', 655, 18);\n  }\n\n  var maxOut = 0;\n  for (var m = 0; m < N; m++) {\n    if (Math.abs(y[m]) > Math.abs(maxOut)) maxOut = y[m];\n  }\n  lab.setReadout('x[1]=' + amp1.toFixed(1) + ', x[4]=' + amp2.toFixed(1) + ' | y[4]叠加值=' + y[4].toFixed(2) + ' (分量1=' + y1[4].toFixed(2) + ' + 分量2=' + y2[4].toFixed(2) + ') | 输出峰值=' + maxOut.toFixed(2));\n});"
    },
    {
      "type": "concept",
      "heading": "换个马甲也得认识它：核 (Kernel) 与点扩散函数",
      "paragraphs": [
        "在不同的工程领域，**脉冲响应**经常会换上不同的名字出场，初学者很容易被这些术语吓到，但它们在物理本质上是一模一样的：",
        "- **信号滤波领域**：如果这个线性系统是一个滤波器，脉冲响应通常被称为**滤波器核（filter kernel）**、**卷积核（convolution kernel）**，或者简称为**核（kernel）**。",
        "- **图像处理领域**：在二维图像系统中，脉冲响应被称为**点扩散函数（point spread function, PSF）**——想象黑夜里拍一个理想的点光源，相机光学与处理系统把它模糊成一团光斑，这团光斑就是图像系统的脉冲响应。",
        "虽然这些词在工程习惯上用法略有差异，但归根结底都指同一件事：**系统在输入为单位脉冲（δ函数）时所产生的输出信号**。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "数学新运算：星号 `*` 的意义与编程避坑指南",
      "paragraphs": [
        "就像加法（`+`）和乘法（`×`）是针对数字的运算一样，**卷积（Convolution）**是一种正式的数学运算。加法吃进两个**数字**吐出第三个数字，而卷积吃进两个**信号**吐出第三个信号。除了线性系统，卷积在概率论、统计学等诸多数学分支中都扮演着核心角色。",
        "在数字信号处理（DSP）中，我们用星号 `*` 来表示卷积运算。如果输入信号 `x[n]` 进入一个脉冲响应为 `h[n]` 的线性系统，产生的输出信号为 `y[n]`，就可以用极其简洁的公式来表达。",
        "⚠️ **极其重要的避坑提示**：不幸的是，绝大多数编程语言（如 C、Python、JavaScript）也用星号 `*` 来表示**乘法**。在阅读论文或教材公式时，`*` 代表的是需要“平移、缩放、叠加”的**卷积**；而在写代码时，`*` 代表的是简单的**逐点相乘**。千万不要在代码里直接写 `x[n] * h[n]` 就以为自己算出了卷积！"
      ],
      "formula": {
        "expr": "x[n] * h[n] = y[n]",
        "explain": "x[n] 是输入信号，h[n] 是系统的脉冲响应（卷积核），* 表示卷积运算（读作“x[n] 卷上 h[n]”），y[n] 是系统输出信号。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：星号 `*` 大比拼——真实卷积 vs 逐点相乘（附听感对比）",
      "instruction": "调节卷积核宽度 M 观察高频毛刺如何被卷积平滑，勾选“逐点相乘”查看错把 * 当乘法的灾难后果，并点击播放按钮对比滤波前后的声音差异。",
      "controls": [
        {
          "type": "slider",
          "id": "kSize",
          "label": "卷积核宽度 M (滑动平均点数)",
          "min": 1,
          "max": 19,
          "step": 2,
          "value": 7,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showMult",
          "label": "显示常见误区：逐点相乘 x[n]·h[n]",
          "value": false
        },
        {
          "type": "toggle",
          "id": "listenFiltered",
          "label": "听感模式：开启=卷积滤波后 / 关闭=原始信号",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放听感对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioSrc = null;\nvar gainNode = null;\nvar lastAudioKey = '';\n\nfunction stopSound() {\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var M = lab.values.kSize;\n  var showMult = lab.values.showMult;\n  var listenFiltered = lab.values.listenFiltered;\n  var play = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var N = 72;\n  var x = [];\n  for (var n = 0; n < N; n++) {\n    var low = 0.72 * Math.sin(2 * Math.PI * 2 * n / N);\n    var high = 0.36 * Math.sin(2 * Math.PI * 16 * n / N);\n    x.push(low + high);\n  }\n\n  var h = new Array(N).fill(0);\n  for (var k = 0; k < M; k++) h[k] = 1 / M;\n\n  var yConv = [];\n  var yMult = [];\n  for (var i = 0; i < N; i++) {\n    var acc = 0;\n    for (var j = 0; j < M; j++) {\n      if (i - j >= 0) acc += h[j] * x[i - j];\n    }\n    yConv.push(acc);\n    yMult.push(x[i] * h[i]);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= 8; gx++) {\n    var px = 20 + ((W - 40) * gx) / 8;\n    ctx.beginPath(); ctx.moveTo(px, 24); ctx.lineTo(px, H - 20); ctx.stroke();\n  }\n  for (var gy = 0; gy <= 4; gy++) {\n    var py = 24 + ((H - 44) * gy) / 4;\n    ctx.beginPath(); ctx.moveTo(20, py); ctx.lineTo(W - 20, py); ctx.stroke();\n  }\n  var midY = 24 + (H - 44) / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(20, midY); ctx.lineTo(W - 20, midY); ctx.stroke();\n\n  function plotLine(arr, color, width, dash) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    if (dash) ctx.setLineDash(dash);\n    ctx.beginPath();\n    var scaleY = (H - 56) / 2.4;\n    for (var t = 0; t < N; t++) {\n      var px = 20 + (t / (N - 1)) * (W - 40);\n      var py = midY - arr[t] * scaleY;\n      if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showMult) {\n    var winW = ((M - 1) / (N - 1)) * (W - 40);\n    ctx.fillStyle = 'rgba(236,72,153,0.12)';\n    ctx.fillRect(20, 24, Math.max(6, winW), H - 44);\n  }\n\n  plotLine(x, 'rgba(248,250,252,0.4)', 1.5, [4, 3]);\n  plotLine(yConv, '#10b981', 2.6, null);\n  if (showMult) {\n    plotLine(yMult, '#ec4899', 2.4, null);\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.fillText('--- 原始含噪输入 x[n]', 22, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━━ 卷积输出 y[n] = x[n] * h[n]', 175, 16);\n  if (showMult) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('━━ 错误逐点乘 x[n]·h[n] (后段全归零!)', 405, 16);\n  }\n\n  if (play) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    var key = M + '_' + (listenFiltered ? 1 : 0);\n    if (!audioSrc || lastAudioKey !== key) {\n      stopSound();\n      lastAudioKey = key;\n      var sr = ac.sampleRate;\n      var len = Math.floor(sr * 0.5);\n      var buf = ac.createBuffer(1, len, sr);\n      var ch = buf.getChannelData(0);\n      var raw = new Float32Array(len);\n      var f0 = 220;\n      for (var s = 0; s < len; s++) {\n        var tSec = s / sr;\n        raw[s] = 0.45 * Math.sin(2 * Math.PI * f0 * tSec)\n               + 0.28 * Math.sin(2 * Math.PI * f0 * 7 * tSec)\n               + 0.22 * Math.sin(2 * Math.PI * f0 * 13 * tSec);\n      }\n      var Ma = M * 4;\n      for (var s2 = 0; s2 < len; s2++) {\n        if (!listenFiltered) {\n          ch[s2] = raw[s2];\n        } else {\n          var sum = 0;\n          for (var k2 = 0; k2 < Ma; k2++) {\n            var idx = (s2 - k2 + len) % len;\n            sum += raw[idx];\n          }\n          ch[s2] = sum / Ma;\n        }\n      }\n      if (!gainNode) {\n        gainNode = ac.createGain();\n        gainNode.gain.value = 0.2;\n        gainNode.connect(ac.destination);\n      }\n      audioSrc = ac.createBufferSource();\n      audioSrc.buffer = buf;\n      audioSrc.loop = true;\n      audioSrc.connect(gainNode);\n      audioSrc.start();\n    }\n  } else {\n    stopSound();\n    lastAudioKey = '';\n  }\n\n  var statusText = '卷积核宽度 M=' + M + ' (滑动平均)';\n  if (showMult) statusText += ' | 误区警告: 逐点相乘后 n≥' + M + ' 全为0';\n  statusText += ' | 音频: ' + (play ? (listenFiltered ? '正在播放卷积平滑后声音' : '正在播放原始刺耳高频音') : '已静音');\n  lab.setReadout(statusText);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分符号陷阱：公式里的 `x[n] * h[n]` 是**卷积**（需要对齐、乘积并累加），写代码时千万别写成逐点相乘，否则核以外的信号会全部丢失或失真。",
        "线性系统全息图：只要测出系统的脉冲响应 `h[n]`，就等同于拿到了系统的“完整说明书”，任何复杂输入信号都能靠卷积推导出输出。",
        "术语统一：在滤波里叫“滤波器核 / 卷积核”，在图像处理里叫“点扩散函数 (PSF)”，名字不同但本质都是单位脉冲输入下的系统输出。"
      ]
    }
  ]
});
