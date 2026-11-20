window.__BOOK_REGISTER_SECTION__("sec_196", {
  "title": "差分编码与线性预测 (Delta Encoding & LPC)",
  "intuition": "与其笨重地记录每个采样点的绝对高度，不如只记录相邻两点之间的“变化步长”——只要信号足够平滑，差值就会紧贴零点扎堆，从而为后续无损压缩铺平道路。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从“记绝对值”到“记变化量”",
      "paragraphs": [
        "在科学、工程和数学中，希腊字母 **Delta (Δ)** 常用来表示变量的“变化量”。**差分编码 (Delta Encoding)** 的核心思想极其朴素：与其直接存储一连串采样点（或字符）的原始数值，不如只存储**相邻两个采样点之间的差值**。",
        "具体编码规则分为两步：首先，编码文件的**第 1 个数值**直接原封不动地照搬原始数据的第 1 个值（书中称之为 `move`）；从第 2 个位置开始，编码文件中存入的每一个值，都等于当前输入值减去前一个输入值的差（即 `delta`）。",
        "例如原书图 27-4 给出的序列：`17, 19, 24, 24, 24, 21, 15, 10, 89...`。经过差分编码后，第 1 个数依然是 `17`，第 2 个数是 `19 - 17 = 2`，第 3 个数是 `24 - 19 = 5`，接下来连续不变则变成 `0, 0`，下降时出现 `-3, -6, -5`，遇到突变跳到 `89` 时才产生一个较大的跳变 `79`。解码时只需做反向累加即可完美无损还原。"
      ],
      "formula": {
        "expr": "d[0] = x[0];   d[n] = x[n] - x[n-1]  (n ≥ 1)",
        "explain": "x[n] 表示原始离散序列的第 n 个采样值，d[n] 表示差分编码后的第 n 个输出值；还原时只需做累加 x[n] = x[n-1] + d[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：差分编码序列拆解与“斜坡变常数”效应",
      "instruction": "拖动滑块调节原始信号的平滑度、线性斜坡与随机跳变噪声，观察蓝色原始序列 x[n] 如何转化为青绿色差分序列 d[n]。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "正弦波动频率",
          "min": 0,
          "max": 6,
          "step": 0.5,
          "value": 1.5,
          "unit": " 周期"
        },
        {
          "type": "slider",
          "id": "ramp",
          "label": "线性斜坡斜率",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " /步"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "随机跳变幅度",
          "min": 0,
          "max": 30,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDelta",
          "label": "显示差分序列 d[n]",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var freq = lab.values.freq;\n  var ramp = lab.values.ramp;\n  var noise = lab.values.noise;\n  var showDelta = lab.values.showDelta;\n\n  ctx.clearRect(0, 0, w, h);\n\n  var N = 22;\n  var x = [];\n  var d = [];\n  for (var i = 0; i < N; i++) {\n    var pseudoRand = Math.sin(i * 12.9898 + 4.1414) * 43758.5453;\n    pseudoRand = (pseudoRand - Math.floor(pseudoRand)) * 2 - 1;\n    var val = Math.round(35 * Math.sin(2 * Math.PI * freq * i / N) + ramp * (i - N / 2) + noise * pseudoRand);\n    x.push(val);\n    d.push(i === 0 ? val : val - x[i - 1]);\n  }\n\n  var padL = 52, padR = 24, padT = 26, padB = 34;\n  var plotW = w - padL - padR;\n  var plotH = h - padT - padB;\n  var zeroY = padT + plotH * 0.55;\n  var scaleY = 1.15;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gy = -80; gy <= 80; gy += 40) {\n    var yy = zeroY - gy * scaleY;\n    if (yy >= padT && yy <= h - padB) {\n      ctx.beginPath();\n      ctx.moveTo(padL, yy);\n      ctx.lineTo(w - padR, yy);\n      ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.45)';\n      ctx.font = '11px monospace';\n      ctx.textAlign = 'right';\n      ctx.fillText(String(gy), padL - 8, yy + 4);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(padL, zeroY);\n  ctx.lineTo(w - padR, zeroY);\n  ctx.stroke();\n\n  function getX(idx) { return padL + (idx / (N - 1)) * plotW; }\n  function getY(v) { return Math.max(padT, Math.min(h - padB, zeroY - v * scaleY)); }\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = getX(i), py = getY(x[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (var i = 0; i < N; i++) {\n    var px = getX(i), py = getY(x[i]);\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(px, py, 4, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(x[i]), px, py - 9);\n  }\n\n  if (showDelta) {\n    for (var i = 0; i < N; i++) {\n      var px = getX(i), py = getY(d[i]);\n      ctx.strokeStyle = i === 0 ? '#f59e0b' : '#10b981';\n      ctx.lineWidth = 2.5;\n      ctx.beginPath();\n      ctx.moveTo(px, zeroY);\n      ctx.lineTo(px, py);\n      ctx.stroke();\n\n      ctx.fillStyle = i === 0 ? '#f59e0b' : '#10b981';\n      ctx.beginPath();\n      ctx.arc(px, py, 3.5, 0, Math.PI * 2);\n      ctx.fill();\n\n      ctx.font = '10px monospace';\n      ctx.textAlign = 'center';\n      var labelY = d[i] >= 0 ? py + 13 : py - 8;\n      if (Math.abs(py - getY(x[i])) < 14) labelY = zeroY + (d[i] >= 0 ? 14 : -8);\n      ctx.fillText((i === 0 ? '首:' : '') + d[i], px, Math.min(h - 10, Math.max(padT + 10, labelY)));\n    }\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('● 原始信号 x[n]', padL, 16);\n  if (showDelta) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('● 差分编码 d[n]', padL + 115, 16);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('● 首样本原样保留 (move)', padL + 230, 16);\n  }\n\n  var maxAbsX = 0, maxAbsD = 0, sameRuns = 0;\n  for (var i = 0; i < N; i++) {\n    if (Math.abs(x[i]) > maxAbsX) maxAbsX = Math.abs(x[i]);\n    if (i > 0) {\n      if (Math.abs(d[i]) > maxAbsD) maxAbsD = Math.abs(d[i]);\n      if (i > 1 && d[i] === d[i - 1]) sameRuns++;\n    }\n  }\n  lab.setReadout('原始峰值 |x|max=' + maxAbsX + ' | 差分峰值 |d|max=' + maxAbsD + ' | 相邻差分值完全相同次数=' + sameRuns + ' (RLE游程潜力)');\n});"
    },
    {
      "type": "concept",
      "heading": "二、差分编码本身不压缩，为何却是无损压缩的神助攻？",
      "paragraphs": [
        "细心的读者可能会发现：原始数据有 N 个数，差分编码后依然有 N 个数，文件大小似乎一点没变？没错！差分编码本质上是一种**预处理（数据变换）**，它只在原始数据足够**平滑 (smooth)**——也就是相邻采样点之间变化很小时才能发挥威力。",
        "对于 **ASCII 文本或可执行机器码** 而言，相邻字节的数值往往毫无规律地剧烈跳动，因此差分编码对它们几乎无效。但对于**传感器采集信号或音频波形**，情况就截然不同了。如原书图 27-5 所示，一段 8-bit 数字化音频信号（采样值范围 -127 到 +127）经过差分编码后，最显著的特征是**信号幅度大幅下降**。",
        "幅度变小在信息论上意味着两件极具价值的事：第一，差值落在 **0 附近** 的概率暴增，远离 0 的概率骤降，这种**极不均匀的概率分布**正是 **霍夫曼编码 (Huffman Encoding)** 最梦寐以求的输入（高频的 0 附近数值分配极短二进制码）；第二，如果原信号保持恒定或沿直线匀速变化，差分后就会产生一长串**完全相同的重复数值**，这正是 **游程编码 (Run-Length Encoding, RLE)** 最擅长吞噬的数据形态。因此，“**差分编码 + 霍夫曼 / 游程编码**”是信号无损压缩的经典黄金组合。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：8-bit 音频波形的“瘦身”分布与听感对比",
      "instruction": "调节信号基频与高频毛刺比例，观察左侧波形幅度与右侧“振幅概率分布直方图”的变化；开启声音后切换开关，亲耳对比原音与差分信号！",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号基频 f0",
          "min": 150,
          "max": 1200,
          "step": 50,
          "value": 300,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "harmonics",
          "label": "高频毛刺比例",
          "min": 0,
          "max": 80,
          "step": 5,
          "value": 15,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "deltaMode",
          "label": "切换高亮/试听为差分信号 d[n]",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var activeSource = null;\nvar activeGain = null;\n\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); } catch (e) {}\n    try { activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var freq = lab.values.freq;\n  var harm = lab.values.harmonics / 100;\n  var deltaMode = lab.values.deltaMode;\n  var isPlaying = lab.values.play;\n\n  var fs = 8000;\n  var N = 160;\n  var orig = [];\n  var diff = [];\n\n  for (var n = 0; n < N; n++) {\n    var t = n / fs;\n    var s = (1 - harm * 0.5) * Math.sin(2 * Math.PI * freq * t) + harm * 0.5 * Math.sin(2 * Math.PI * (freq * 7.3) * t);\n    var q = Math.max(-127, Math.min(127, Math.round(s * 105)));\n    orig.push(q);\n    diff.push(n === 0 ? 0 : Math.max(-127, Math.min(127, q - orig[n - 1])));\n  }\n\n  ctx.clearRect(0, 0, w, h);\n\n  var waveL = 42, waveR = 445, waveT = 28, waveB = h - 28;\n  var waveW = waveR - waveL;\n  var waveMid = (waveT + waveB) / 2;\n  var waveScale = (waveB - waveT) / 256;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [-128, -64, 0, 64, 128].forEach(function(val) {\n    var y = waveMid - val * waveScale;\n    ctx.beginPath();\n    ctx.moveTo(waveL, y);\n    ctx.lineTo(waveR, y);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.45)';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText(String(val), waveL - 6, y + 3);\n  });\n\n  function drawWave(arr, color, alpha, width) {\n    ctx.save();\n    ctx.globalAlpha = alpha;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = waveL + (i / (N - 1)) * waveW;\n      var py = waveMid - arr[i] * waveScale;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  drawWave(orig, '#38bdf8', deltaMode ? 0.25 : 0.95, deltaMode ? 1.2 : 2);\n  drawWave(diff, '#10b981', deltaMode ? 0.95 : 0.55, deltaMode ? 2 : 1.3);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域波形 (8-bit, 8kHz采样)', waveL, 16);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 原信号', waveL + 195, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 差分信号', waveL + 265, 16);\n\n  var histL = 475, histR = w - 16, histT = 28, histB = h - 28;\n  var histW = histR - histL;\n  var histH = histB - histT;\n  var bins = 25;\n  var histOrig = new Array(bins).fill(0);\n  var histDiff = new Array(bins).fill(0);\n\n  var fullN = 2000;\n  var prevQ = 0;\n  for (var n = 0; n < fullN; n++) {\n    var t = n / fs;\n    var s = (1 - harm * 0.5) * Math.sin(2 * Math.PI * freq * t) + harm * 0.5 * Math.sin(2 * Math.PI * (freq * 7.3) * t);\n    var q = Math.max(-127, Math.min(127, Math.round(s * 105)));\n    var dVal = n === 0 ? 0 : Math.max(-127, Math.min(127, q - prevQ));\n    prevQ = q;\n    var bO = Math.min(bins - 1, Math.max(0, Math.floor(((q + 128) / 256) * bins)));\n    var bD = Math.min(bins - 1, Math.max(0, Math.floor(((dVal + 128) / 256) * bins)));\n    histOrig[bO]++;\n    histDiff[bD]++;\n  }\n\n  var maxCount = 1;\n  for (var b = 0; b < bins; b++) {\n    if (histOrig[b] > maxCount) maxCount = histOrig[b];\n    if (histDiff[b] > maxCount) maxCount = histDiff[b];\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.strokeRect(histL, histT, histW, histH);\n  var barW = histW / bins;\n\n  for (var b = 0; b < bins; b++) {\n    var hO = (histOrig[b] / maxCount) * (histH - 8);\n    var hD = (histDiff[b] / maxCount) * (histH - 8);\n    var bx = histL + b * barW;\n    ctx.fillStyle = 'rgba(56,189,248,0.42)';\n    ctx.fillRect(bx + 1, histB - hO, barW - 2, hO);\n    ctx.fillStyle = 'rgba(16,185,129,0.78)';\n    ctx.fillRect(bx + barW * 0.2, histB - hD, barW * 0.6, hD);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('数值分布直方图 (-127 ~ +127)', histL, 16);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('-128', histL, histB + 14);\n  ctx.fillText('0 (越集中越易压缩)', histL + histW / 2, histB + 14);\n  ctx.fillText('+127', histR, histB + 14);\n\n  var nearZeroOrig = histOrig[Math.floor(bins / 2)] + histOrig[Math.floor(bins / 2) - 1] + histOrig[Math.floor(bins / 2) + 1];\n  var nearZeroDiff = histDiff[Math.floor(bins / 2)] + histDiff[Math.floor(bins / 2) - 1] + histDiff[Math.floor(bins / 2) + 1];\n  lab.setReadout('零点附近集中度：原信号 ' + Math.round(nearZeroOrig * 100 / fullN) + '%  vs  差分信号 ' + Math.round(nearZeroDiff * 100 / fullN) + '%  | 当前试听：' + (deltaMode ? '差分信号 d[n] (高通特性，低频变轻)' : '原始信号 x[n]'));\n\n  stopAudio();\n  if (isPlaying) {\n    var ac = lab.getAudioContext();\n    if (ac) {\n      if (ac.state === 'suspended') ac.resume();\n      var buf = ac.createBuffer(1, fs, fs);\n      var ch = buf.getChannelData(0);\n      var p = 0;\n      for (var n = 0; n < fs; n++) {\n        var t = n / fs;\n        var s = (1 - harm * 0.5) * Math.sin(2 * Math.PI * freq * t) + harm * 0.5 * Math.sin(2 * Math.PI * (freq * 7.3) * t);\n        var q = Math.max(-127, Math.min(127, Math.round(s * 105)));\n        var dVal = n === 0 ? 0 : Math.max(-127, Math.min(127, q - p));\n        p = q;\n        ch[n] = (deltaMode ? dVal : q) / 128;\n      }\n      activeSource = ac.createBufferSource();\n      activeSource.buffer = buf;\n      activeSource.loop = true;\n      activeGain = ac.createGain();\n      activeGain.gain.value = 0.25;\n      activeSource.connect(activeGain);\n      activeGain.connect(ac.destination);\n      activeSource.start();\n    }\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "三、思想升级：从差分编码到线性预测编码 (LPC)",
      "paragraphs": [
        "差分编码的本质逻辑，其实还可以推广为一种更强大的算法——**线性预测编码 (Linear Predictive Coding, LPC)**。",
        "为了理解 LPC，假设我们已经编码了输入信号的前 99 个采样点，现在正准备处理第 100 个采样点。我们问自己：**根据前面已知的 99 个采样点，第 100 个采样点最可能的值是多少？**",
        "在简单的差分编码中，答案非常偷懒：直接猜测第 100 个点最可能等于前一个点（第 99 个点），然后只把真实值与这个预测期望值之间的**预测误差**写入文件。而 LPC 将这一思想发扬光大：它不再只盯着上一个采样点，而是同时观察**过去的多个采样点**（利用类似递归滤波器与 Z 变换的数学工具），对下一个采样点做出更精准的预测。预测越准，残差就越接近 0，压缩率也就越高。"
      ],
      "formula": {
        "expr": "e[n] = x[n] - x̂[n] = x[n] - Σ a[k] * x[n-k]",
        "explain": "x̂[n] 是利用过去多个样本线性加权预测出的期望值；当只取 k=1 且权重 a[1]=1 时，LPC 就退化成了最基础的差分编码。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【适用边界】差分编码只适合相邻样本高度相关的“平滑信号”（音频、图像行像素、传感器波形）；对离散符号、随机加密数据或可执行代码使用差分编码不仅无法压缩，还可能破坏原有的局部模式。",
        "【动态范围翻倍陷阱】如果原始样本是 8-bit 有符号数（-127 ~ +127），一旦信号从 -127 瞬间跳变到 +127，理论上真实差值会达到 +254，超过了 8-bit 的表示范围。工程实现时必须留出溢出余量或采用 9-bit / 变长编码处理极端跳变。",
        "【误码传播风险】由于解码依赖累加还原（x[n] = x[n-1] + d[n]），只要传输过程中有 1 个字节的差分值损坏，后面所有还原出的样本都会产生永久性的直流偏移。实际通信或流媒体中，每隔固定帧数必须重新插入一次绝对样本值（同步关键帧）来截断误差传播。",
        "【黄金搭档】单独的差分编码不会减少数据个数，工程上几乎总是作为前置变换，后面紧接霍夫曼编码（吃掉零点尖峰）或游程编码（吃掉斜坡连续常数）。"
      ]
    }
  ]
});
