window.__BOOK_REGISTER_SECTION__("sec_065", {
  "title": "德尔塔函数、脉冲响应与卷积的本质 (Delta Function, Impulse Response & Convolution)",
  "intuition": "只要给线性系统喂入一个最纯粹的“单位脉冲”，系统吐出的响应就是它的全部特征 DNA；任何复杂信号通过系统，本质上都是输入信号与这份 DNA 进行卷积。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 系统的“敲击测试”：德尔塔函数 δ[n] 与脉冲响应 h[n]",
      "paragraphs": [
        "在数字信号处理中，想要彻底摸清一个未知“线性系统”的脾气，最聪明的办法不是输入复杂的音乐或图像，而是用一根极细的针去轻轻“扎”它一下，看看它会如何震荡和消退。这根数学上的“针”，就是 **德尔塔函数 (Delta Function)**，通常用希腊字母 `δ[n]` 表示。",
        "`δ[n]` 是一个**归一化脉冲**：在时间索引 `n = 0` 的位置，它的样本值严格等于 `1`；而在所有其他位置（`n ≠ 0`），它的样本值全部为 `0`。",
        "当我们把 `δ[n]` 送入一个线性系统后，系统在输出端产生的波形就叫做该系统的 **脉冲响应 (Impulse Response)**，通常记为 `h[n]`。正如敲击一口古钟会听到它特有的余韵，`h[n]` 完整记录了线性系统对瞬时冲击的反应规律与“记忆特征”。"
      ],
      "formula": {
        "expr": "δ[n] ──▶ [ 线性系统 ] ──▶ h[n]",
        "explain": "δ[n] 是仅在 n=0 处为 1 的单位脉冲输入；h[n] 是系统被这一下“敲击”激发出的完整脉冲响应。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：敲击系统——实时观察 δ[n] 与脉冲响应 h[n]",
      "instruction": "拖动脉冲幅度与系统记忆长度滑块，或切换响应形态，观察右侧 h[n] 的波形变化并试听“撞击系统”的声音。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "输入脉冲幅度",
          "min": 0.5,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "length",
          "label": "系统记忆长度",
          "min": 2,
          "max": 12,
          "step": 1,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "invert",
          "label": "切换为震荡衰减型响应",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听脉冲撞击声",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var lastTrig = -10;\nfunction drawStemPlot(ctx, x0, y0, w, h, nMin, nMax, yMin, yMax, values, color, title) {\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var cols = nMax - nMin;\n  for (var i = 0; i <= cols; i++) {\n    var gx = x0 + (i / cols) * w;\n    ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + h); ctx.stroke();\n  }\n  for (var gyv = Math.ceil(yMin); gyv <= Math.floor(yMax); gyv++) {\n    var gy = y0 + h - ((gyv - yMin) / (yMax - yMin)) * h;\n    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + w, gy); ctx.stroke();\n  }\n  var zeroY = y0 + h - ((0 - yMin) / (yMax - yMin)) * h;\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(x0, zeroY); ctx.lineTo(x0 + w, zeroY); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, x0 + w / 2, y0 - 12);\n  ctx.font = '10px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  for (var n = nMin; n <= nMax; n += 2) {\n    var lx = x0 + ((n - nMin) / cols) * w;\n    ctx.fillText(String(n), lx, y0 + h + 14);\n  }\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = 2;\n  for (var n = nMin; n <= nMax; n++) {\n    var v = values(n);\n    var px = x0 + ((n - nMin) / cols) * w;\n    var py = y0 + h - ((v - yMin) / (yMax - yMin)) * h;\n    ctx.beginPath(); ctx.moveTo(px, zeroY); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillRect(px - 3.5, py - 3.5, 7, 7);\n  }\n  ctx.restore();\n}\nfunction render() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  var amp = lab.values.amp;\n  var mem = lab.values.length;\n  var osc = lab.values.invert;\n  drawStemPlot(ctx, 35, 38, 200, 165, -2, 6, -1.5, 2.5, function(n) {\n    return n === 0 ? amp : 0;\n  }, '#38bdf8', '输入: ' + amp.toFixed(1) + '·δ[n]');\n  ctx.save();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(252, 120); ctx.lineTo(295, 120); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(288, 115); ctx.lineTo(296, 120); ctx.lineTo(288, 125); ctx.stroke();\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.strokeStyle = '#f59e0b';\n  ctx.fillRect(300, 92, 95, 56);\n  ctx.strokeRect(300, 92, 95, 56);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('线性系统', 347.5, 116);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('h[n]', 347.5, 134);\n  ctx.strokeStyle = '#f8fafc';\n  ctx.beginPath(); ctx.moveTo(400, 120); ctx.lineTo(443, 120); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(436, 115); ctx.lineTo(444, 120); ctx.lineTo(436, 125); ctx.stroke();\n  ctx.restore();\n  drawStemPlot(ctx, 458, 38, 232, 165, -2, 10, -1.5, 2.5, function(n) {\n    if (n < 0) return 0;\n    var decay = Math.exp(-n / (mem * 0.38));\n    if (osc) {\n      return amp * decay * Math.cos(n * 1.15);\n    } else {\n      return amp * decay * (n === 0 ? 1.0 : 0.78);\n    }\n  }, '#10b981', '脉冲响应: ' + amp.toFixed(1) + '·h[n]');\n  var modeText = osc ? '震荡衰减型 (带通/谐振特性)' : '单调衰减型 (平滑/低通特性)';\n  lab.setReadout('脉冲幅度: ' + amp.toFixed(1) + ' | 记忆衰减: ' + mem + ' 点 | 响应类型: ' + modeText);\n}\nlab.onUpdate(render);\nlab.onLoop(function(dt, t) {\n  if (!lab.values.play) { lastTrig = -10; return; }\n  if (t - lastTrig >= 0.75) {\n    lastTrig = t;\n    var actx = lab.getAudioContext();\n    if (!actx) return;\n    if (actx.state === 'suspended') actx.resume();\n    var sr = actx.sampleRate;\n    var dur = 0.35;\n    var buf = actx.createBuffer(1, Math.floor(sr * dur), sr);\n    var data = buf.getChannelData(0);\n    var amp = lab.values.amp;\n    var len = lab.values.length;\n    var osc = lab.values.invert;\n    for (var i = 0; i < data.length; i++) {\n      var sec = i / sr;\n      var env = Math.exp(-sec * (20 / (len * 0.38)));\n      var wave = osc ? Math.cos(2 * Math.PI * 520 * sec) : Math.sin(2 * Math.PI * 150 * sec);\n      if (i < 16) wave = (1 - i / 16) * 0.7;\n      data[i] = 0.22 * amp * env * wave;\n    }\n    var src = actx.createBufferSource();\n    src.buffer = buf;\n    src.connect(actx.destination);\n    src.start();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "2. 卷积的威力：用不同的 h[n] 雕刻信号",
      "paragraphs": [
        "加法接收两个**数字**并产出第三个数字；而 **卷积 (Convolution)** 是一种严谨的数学运算，它接收两个**信号**并产出第三个信号。在线性系统中，输入信号 `x[n]`、系统脉冲响应 `h[n]` 与输出信号 `y[n]` 的关系就由卷积决定。",
        "在数学公式中，我们用星号 `*` 表示卷积。但**工程上有一个极易踩坑的符号冲突**：在 C、Python 等绝大多数编程语言里，`*` 代表普通乘法；而在 DSP 数学公式里，`*` 专门代表卷积！",
        "别看 `h[n]` 有时只有寥寥几个非零点，它却能对信号施展惊人的“整容术”：如果 `h[n]` 是一个平滑的拱形，卷积就是**低通滤波器**（过滤高频正弦波，只留缓慢斜坡）；如果换成一个尖峰加负旁瓣，就变成**高通滤波器**（只让高频正弦波通过）；如果 `h[n]` 只有一个负小数点，它就是**反相衰减器**；如果是一正一负紧挨着的两个点，它就能算出信号的斜率，即**离散微分（一阶差分）**。"
      ],
      "formula": {
        "expr": "y[n] = x[n] * h[n]",
        "explain": "输入信号 x[n] 与系统的脉冲响应 h[n] 进行卷积运算（注意这里的 * 不是普通乘法），得到系统的输出信号 y[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：信号分离器——亲手体验低通、高通、反相与求导",
      "instruction": "调节“系统类型”滑块切换 4 种经典脉冲响应（对应原书图 6-3 与 6-4），调节输入成分并开启声音，听听卷积如何精准分离频率！",
      "controls": [
        {
          "type": "slider",
          "id": "mode",
          "label": "系统类型 (1低通 2高通 3反相 4求导)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sineAmp",
          "label": "高频正弦幅度",
          "min": 0,
          "max": 2,
          "step": 0.2,
          "value": 1.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "rampAmp",
          "label": "低频斜坡幅度",
          "min": 0,
          "max": 2,
          "step": 0.2,
          "value": 1.4,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 听卷积输出音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioState = { active: false, master: null, gL: null, gH: null, oL: null, oH: null };\nfunction syncAudio() {\n  var playing = !!lab.values.play;\n  if (!playing) {\n    if (audioState.active && audioState.master) {\n      var c = lab.getAudioContext();\n      if (c) audioState.master.gain.setTargetAtTime(0, c.currentTime, 0.02);\n    }\n    return;\n  }\n  var c = lab.getAudioContext();\n  if (!c) return;\n  if (c.state === 'suspended') c.resume();\n  if (!audioState.active) {\n    audioState.master = c.createGain();\n    audioState.master.gain.value = 0;\n    audioState.master.connect(c.destination);\n    audioState.gL = c.createGain();\n    audioState.gH = c.createGain();\n    audioState.gL.connect(audioState.master);\n    audioState.gH.connect(audioState.master);\n    audioState.oL = c.createOscillator();\n    audioState.oL.type = 'triangle';\n    audioState.oL.frequency.value = 135;\n    audioState.oL.connect(audioState.gL);\n    audioState.oH = c.createOscillator();\n    audioState.oH.type = 'sine';\n    audioState.oH.frequency.value = 810;\n    audioState.oH.connect(audioState.gH);\n    audioState.oL.start();\n    audioState.oH.start();\n    audioState.active = true;\n  }\n  var m = lab.values.mode;\n  var sA = lab.values.sineAmp;\n  var rA = lab.values.rampAmp;\n  var lGain = 0, hGain = 0;\n  if (m === 1) { lGain = rA * 0.13; hGain = sA * 0.006; }\n  else if (m === 2) { lGain = rA * 0.006; hGain = sA * 0.11; }\n  else if (m === 3) { lGain = rA * 0.065; hGain = sA * 0.055; }\n  else { lGain = rA * 0.012; hGain = sA * 0.14; }\n  audioState.gL.gain.setTargetAtTime(lGain, c.currentTime, 0.03);\n  audioState.gH.gain.setTargetAtTime(hGain, c.currentTime, 0.03);\n  audioState.master.gain.setTargetAtTime(1.0, c.currentTime, 0.03);\n}\nfunction drawGraph(ctx, x0, y0, w, h, data, yMin, yMax, color, title, sub) {\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n  var zeroY = y0 + h - ((0 - yMin) / (yMax - yMin)) * h;\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.beginPath(); ctx.moveTo(x0, zeroY); ctx.lineTo(x0 + w, zeroY); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, x0 + w / 2, y0 - 10);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  ctx.fillText(sub, x0 + w / 2, y0 + h + 14);\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = 1.5;\n  var N = data.length;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = x0 + (i / (N - 1)) * w;\n    var val = Math.max(yMin, Math.min(yMax, data[i]));\n    var py = y0 + h - ((val - yMin) / (yMax - yMin)) * h;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  for (var i = 0; i < N; i += (N > 60 ? 2 : 1)) {\n    var px = x0 + (i / (N - 1)) * w;\n    var val = Math.max(yMin, Math.min(yMax, data[i]));\n    var py = y0 + h - ((val - yMin) / (yMax - yMin)) * h;\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n  ctx.restore();\n}\nfunction render() {\n  var ctx = lab.ctx;\n  ctx.clearRect(0, 0, lab.width, lab.height);\n  var m = lab.values.mode;\n  var sA = lab.values.sineAmp;\n  var rA = lab.values.rampAmp;\n  var x = [];\n  for (var n = 0; n < 81; n++) {\n    if (n < 10 || n > 70) {\n      var edge = 0;\n      if (n >= 71 && n <= 78) edge = rA * (1 - (n - 70) / 8) * 0.4;\n      x.push(edge);\n    } else {\n      var t = (n - 10) / 60;\n      var sine = -sA * Math.sin(2 * Math.PI * 3 * t);\n      var ramp = rA * t * 1.4;\n      x.push(sine + ramp);\n    }\n  }\n  var h = [];\n  var sumArch = 0;\n  var arch = [];\n  for (var k = 0; k < 31; k++) {\n    var v = (k >= 5 && k <= 25) ? Math.sin(Math.PI * (k - 5) / 20) : 0;\n    arch.push(v);\n    sumArch += v;\n  }\n  for (var k = 0; k < 31; k++) arch[k] /= sumArch;\n  var hMin = -0.2, hMax = 1.2, modeName = '';\n  if (m === 1) {\n    h = arch; hMin = -0.02; hMax = 0.1;\n    modeName = '1. 低通滤波 (平滑拱形，滤除高频正弦)';\n  } else if (m === 2) {\n    for (var k = 0; k < 31; k++) h.push((k === 15 ? 1 : 0) - arch[k]);\n    hMin = -0.2; hMax = 1.2;\n    modeName = '2. 高通滤波 (保留高频正弦，切除低频斜坡)';\n  } else if (m === 3) {\n    for (var k = 0; k < 31; k++) h.push(k === 15 ? -0.5 : 0);\n    hMin = -1.2; hMax = 1.2;\n    modeName = '3. 反相衰减器 (上下翻转且幅度减半)';\n  } else {\n    for (var k = 0; k < 31; k++) h.push(k === 14 ? 1.0 : (k === 15 ? -1.0 : 0));\n    hMin = -1.5; hMax = 1.5;\n    modeName = '4. 离散微分 (输出对应输入信号的斜率)';\n  }\n  var y = new Array(111);\n  for (var i = 0; i < 111; i++) y[i] = 0;\n  for (var i = 0; i < 81; i++) {\n    for (var j = 0; j < 31; j++) {\n      y[i + j] += x[i] * h[j];\n    }\n  }\n  drawGraph(ctx, 18, 34, 195, 172, x, -2.5, 4.0, '#38bdf8', '输入信号 x[n]', '样本 0..80 (81点)');\n  ctx.save();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 24px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('*', 228, 128);\n  ctx.fillText('=', 394, 128);\n  ctx.restore();\n  drawGraph(ctx, 242, 34, 138, 172, h, hMin, hMax, '#f59e0b', '脉冲响应 h[n]', '样本 0..30 (31点)');\n  drawGraph(ctx, 408, 34, 294, 172, y, -2.5, 4.0, '#10b981', '输出信号 y[n]', '样本 0..110 (81+31-1 = 111点)');\n  lab.setReadout('当前模式: ' + modeName + ' | 输出长度 = 81 + 31 - 1 = 111 点');\n  syncAudio();\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "3. 输出长度规律与理解卷积的两种视角",
      "paragraphs": [
        "从上面的实验可以发现一个硬性规律：数学上对输入信号和脉冲响应的长度没有限制，但**输出信号的长度是被严格锁死的**。输出长度永远等于输入长度加上脉冲响应长度，再减去 1。例如 `81` 点的输入（索引 `0~80`）卷积 `31` 点的脉冲响应（索引 `0~30`），最终输出必定是 `81 + 31 - 1 = 111` 点（索引 `0~110`）。",
        "在深入具体算法之前，请先建立理解卷积的**两种截然不同的视角**：",
        "1. **输入侧视角 (Input Side Viewpoint)**：分析输入信号中的**每一个样本**是如何各自变成缩放平移后的脉冲响应，从而共同“贡献”到输出信号中的。这个视角最符合直觉，负责帮你真正听懂、看懂 DSP 的物理过程。",
        "2. **输出侧视角 (Output Side Viewpoint)**：站在输出端的立场上，考察输出信号中的**每一个点**究竟从输入信号的哪些邻近点“接收”了信息。这个视角直接对应着教材和论文里那堆看似晦涩的卷积求和数学公式。"
      ],
      "formula": {
        "expr": "L_y = L_x + L_h - 1",
        "explain": "L_y 为输出信号长度，L_x 为输入信号长度，L_h 为脉冲响应长度。写代码分配输出数组内存时必须留够这个长度。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "符号大坑预警：数学论文里的 `x[n] * h[n]` 是**卷积**，但放到 Python/C++/MATLAB 代码里写 `x * h` 会变成逐点**乘法**，实现卷积必须调用专用函数（如 `np.convolve`）或手写双重循环。",
        "数组越界防线：只要输入长为 M、滤波器核长为 N，输出缓冲区的总长度一定是 `M + N - 1`（例如 81 + 31 - 1 = 111），少算 1 个点或忘减 1 都会导致尾音截断或索引对齐错位。",
        "两种视角切换：想设计滤波器物理效果时，用“输入侧视角”（每个样本激发出一个 h[n]）；想写出高效的并行/实时流式代码时，用“输出侧视角”（每个输出点加权汇总过去 N 个输入点）。"
      ]
    }
  ]
});
