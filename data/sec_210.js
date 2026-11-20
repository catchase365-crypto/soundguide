window.__BOOK_REGISTER_SECTION__("sec_210", {
  "title": "用模拟仪器测量 DSP 系统 (Analog Measurements on a DSP System)",
  "intuition": "把 DSP 硬件当成纯模拟“黑盒”，接上信号发生器与示波器实测，你会惊奇地发现：数字系统不仅表现得像完美的线性模拟系统，还自带纯模拟电路做不到的严格线性相位与超越测量仪器百倍的精度。",
  "blocks": [
    {
      "type": "concept",
      "heading": "黑盒视角：当模拟工程师遇上 DSP",
      "paragraphs": [
        "暂时忘掉代码、采样和卷积，试着站在一比特都不懂的**模拟电子工程师**的角度，把一块正在运行音频滤波器的 DSP 开发板（如原书中的 **EZ-KIT Lite**）当成一个完全未知的**“黑盒”**——它只有一根模拟输入线和一根模拟输出线。",
        "按照模拟领域的经典测量法（原书图 29-3），工程师把**信号发生器**接到输入端，把**示波器**接到输出端，然后输入一个正弦波。他首先会得出一个结论：这个系统是**线性 (Linear)** 的——输入正弦波，输出也是同频率的正弦波；改变输入幅值或频率，输出也会同步成比例改变。",
        "当他缓慢拧高输入信号频率，逼近系统**采样率的一半（奈奎斯特频率 $f_s / 2$）** 时，奇妙的事情发生了：输出正弦波的幅值会急剧衰减直至归零。这并不是滤波器坏了，而是输入端 ADC 前方的**抗混叠滤波器 (Anti-alias filter)** 正在忠实履行职责，把超过采样能力的高频成分干净地截断。"
      ],
      "formula": {
        "expr": "f_max < f_s / 2",
        "explain": "f_max 为系统允许无混叠通过的最高模拟信号频率，f_s 为系统的采样率。当输入正弦波频率接近 f_s / 2 时，ADC 前端的抗混叠滤波器会使输出幅值急剧跌落至零。"
      }
    },
    {
      "type": "concept",
      "heading": "令模拟工程师抓狂的“完美线性相位”",
      "paragraphs": [
        "紧接着，模拟工程师会在示波器上发现一个在纯模拟电路世界里几乎“违背直觉”的现象：系统具有**完美的线性相位 (Linear Phase)**。换句话说，无论输入信号的频率是多少，输入端发生某个波形事件到输出端出现对应响应之间，始终隔着一个**严格恒定不变的时间延迟**。",
        "这是因为我们在 DSP 里使用了对称的 FIR 滤波器核。如果滤波器核的对称中心位于第 `N_center` 个样本（例如原书图 29-2 中的第 `150` 个样本），那么输出信号就会精确滞后输入信号 `150` 个采样周期。在 `8 kHz` 采样率下，这段延迟精确等于 `18.75 毫秒`；此外，Codec 芯片内部采用的 **Sigma-Delta (Σ-Δ) 转换器** 还会额外贡献一点点固定的硬件延迟。",
        "这种表现好得过于反常，以至于刚看到波形的模拟工程师常常会陷入自我怀疑，疯狂拧动示波器旋钮并嘀咕：“触发电路是不是坏了？”“是谁动了我的示波器？”——因为用电阻、电容、电感搭出来的传统模拟滤波器，根本做不到全频段等时间延迟的严格线性相位。"
      ],
      "formula": {
        "expr": "T_delay = N_center / f_s + T_codec",
        "explain": "T_delay 是输入到输出的总固定延迟时间（秒）；N_center 是对称 FIR 滤波器核的中心样本索引（如 150）；f_s 是采样率（Hz，如 8000 Hz，对应 150/8000 = 18.75 ms）；T_codec 是 Σ-Δ 转换器带来的额外微小固定延迟。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：示波器黑盒实测——线性相位延迟与抗混叠截断",
      "instruction": "拖动【信号频率】逼近采样率的一半，观察绿色输出波如何被抗混叠滤波器“扼杀”；调节【对称中心样本】与【采样率】，在示波器上直观看见恒定时间延迟；点击播放还能直接听见高频被截断的声音变化。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "输入信号频率",
          "min": 200,
          "max": 5000,
          "step": 100,
          "value": 800,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "DSP 采样率 f_s",
          "min": 2000,
          "max": 12000,
          "step": 500,
          "value": 8000,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "center",
          "label": "FIR 对称中心 N",
          "min": 0,
          "max": 200,
          "step": 10,
          "value": 150,
          "unit": " 样本"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放黑盒输出测试音",
          "activeLabel": "⏸ 暂停测试音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioCtx = null, osc = null, gainNode = null;\n\nfunction getAntiAliasGain(freq, fs) {\n  var nyq = fs * 0.5;\n  var ratio = freq / nyq;\n  return 1 / Math.sqrt(1 + Math.pow(Math.max(0, ratio / 0.93), 28));\n}\n\nfunction updateAudio() {\n  var playing = !!lab.values.play;\n  var freq = lab.values.freq;\n  var fs = lab.values.fs;\n  var gain = getAntiAliasGain(freq, fs);\n  if (playing) {\n    if (!audioCtx) {\n      audioCtx = lab.getAudioContext();\n    }\n    if (audioCtx && audioCtx.state === 'suspended') {\n      audioCtx.resume();\n    }\n    if (audioCtx && !osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      osc.type = 'sine';\n      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n    if (audioCtx && osc && gainNode) {\n      var now = audioCtx.currentTime;\n      osc.frequency.setTargetAtTime(freq, now, 0.02);\n      gainNode.gain.setTargetAtTime(0.12 * gain, now, 0.03);\n    }\n  } else if (audioCtx && gainNode) {\n    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n}\n\nfunction envelope(tMs, startMs, durMs) {\n  if (tMs < startMs || tMs > startMs + durMs) return 0;\n  var edge = 1.2;\n  if (tMs < startMs + edge) return 0.5 * (1 - Math.cos(Math.PI * (tMs - startMs) / edge));\n  if (tMs > startMs + durMs - edge) return 0.5 * (1 - Math.cos(Math.PI * (startMs + durMs - tMs) / edge));\n  return 1;\n}\n\nfunction draw() {\n  var freq = lab.values.freq;\n  var fs = lab.values.fs;\n  var center = lab.values.center;\n  var nyq = fs * 0.5;\n  var aaGain = getAntiAliasGain(freq, fs);\n  var firDelayMs = (center / fs) * 1000;\n  var codecDelayMs = 0.8;\n  var totalDelayMs = firDelayMs + codecDelayMs;\n  var tWindowMs = 35;\n  var eventStartMs = 3;\n  var eventDurMs = 7;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var padL = 52, padR = 20, padT = 26, padB = 28;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var t = 0; t <= tWindowMs; t += 5) {\n    var gx = padL + (t / tWindowMs) * plotW;\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + plotH); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(t + 'ms', gx, H - 8);\n  }\n  var yTop = padT + plotH * 0.27;\n  var yBot = padT + plotH * 0.74;\n  var amp = plotH * 0.19;\n\n  [yTop, yBot].forEach(function(yc) {\n    ctx.beginPath(); ctx.moveTo(padL, yc); ctx.lineTo(padL + plotW, yc); ctx.stroke();\n  });\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('IN (信号发生器)', 8, yTop - amp - 4);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('OUT (示波器实测)', 8, yBot - amp - 4);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  var steps = 900;\n  for (var i = 0; i <= steps; i++) {\n    var tMs = (i / steps) * tWindowMs;\n    var env = envelope(tMs, eventStartMs, eventDurMs);\n    var val = env * Math.sin(2 * Math.PI * freq * (tMs - eventStartMs) / 1000);\n    var px = padL + (i / steps) * plotW;\n    var py = yTop - val * amp;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = aaGain < 0.25 ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var j = 0; j <= steps; j++) {\n    var tMs2 = (j / steps) * tWindowMs;\n    var env2 = envelope(tMs2, eventStartMs + totalDelayMs, eventDurMs);\n    var val2 = aaGain * env2 * Math.sin(2 * Math.PI * freq * (tMs2 - eventStartMs - totalDelayMs) / 1000);\n    var px2 = padL + (j / steps) * plotW;\n    var py2 = yBot - val2 * amp;\n    if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n\n  var xIn = padL + ((eventStartMs + eventDurMs * 0.5) / tWindowMs) * plotW;\n  var xOut = padL + ((eventStartMs + totalDelayMs + eventDurMs * 0.5) / tWindowMs) * plotW;\n  var xOutClamped = Math.min(padL + plotW, xOut);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(xIn, yTop + amp + 4); ctx.lineTo(xIn, yBot - amp - 4); ctx.stroke();\n  if (xOut <= padL + plotW) {\n    ctx.beginPath(); ctx.moveTo(xOut, yTop + amp + 4); ctx.lineTo(xOut, yBot - amp - 4); ctx.stroke();\n  }\n  ctx.setLineDash([]);\n\n  var midY = (yTop + yBot) * 0.5;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(xIn, midY); ctx.lineTo(xOutClamped, midY); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('线性延迟 ' + totalDelayMs.toFixed(2) + ' ms', (xIn + xOutClamped) * 0.5, midY - 6);\n\n  ctx.textAlign = 'right';\n  ctx.fillStyle = aaGain < 0.25 ? '#ec4899' : '#f8fafc';\n  ctx.font = 'bold 12px monospace';\n  var statusTxt = freq >= nyq * 0.92 ? '抗混叠截断生效! 幅值=' + (aaGain * 100).toFixed(1) + '%' : '奈奎斯特极限 f_s/2 = ' + nyq + ' Hz | 输出幅值 ' + (aaGain * 100).toFixed(1) + '%';\n  ctx.fillText(statusTxt, W - padR, 17);\n\n  lab.setReadout('采样率 f_s=' + fs + ' Hz (奈奎斯特极限 ' + nyq + ' Hz) | FIR延迟=' + firDelayMs.toFixed(2) + 'ms + Codec约0.80ms = ' + totalDelayMs.toFixed(2) + 'ms | 输出相对幅值=' + (aaGain * 100).toFixed(1) + '%');\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  draw();\n});\ndraw();"
    },
    {
      "type": "concept",
      "heading": "扫频实测频率响应与“以低测高”的精度悖论",
      "paragraphs": [
        "为了彻底折服这位模拟工程师，我们请他手动测量整个系统的**频率响应**：把 DSP 采样率固定在 `22 kHz`（这样数字频率 `0 ~ 0.5` 就正好映射到真实物理频率 `DC ~ 11 kHz`），让他用信号发生器从 `125 Hz` 开始，以每次 `125 Hz` 的步长一直扫频到 `10 kHz`，在每个频点上测出**输出幅值 ÷ 输入幅值**。",
        "测量结果如原书图 29-4 所示——实测黑点与理论设计曲线严丝合缝，精度完全落在测量仪器的误差极限内，这是分立阻容感模拟滤波器绝对见不到的奇观。但即便如此，其实还**远远低估了 DSP 的真实实力**！",
        "普通模拟示波器和数字万用表 (DVM) 的测量精度通常只有 **0.1% 到 1%**；而采用 **16 位 Codec** 加上**内部浮点运算**的 DSP 系统，仅受限于约 **0.001%** 的 Codec 舍入误差。也就是说，**被测 DSP 设备的精度比用来测它的示波器还要高出整整一百倍**！想要真正评估出它的极限，必须动用搭载 **20 位 ADC** 的专业计算机数据采集系统。这也直接回答了前文那个有趣的问题：为什么一家叫 **Analog Devices（亚德诺半导体）** 的老牌模拟公司要大力研发 **DSP**？因为今天最高品质的模拟信号处理，正是靠数字技术实现的。"
      ],
      "formula": {
        "expr": "f_analog = f_digital × f_s   (0 ≤ f_digital ≤ 0.5)",
        "explain": "f_analog 是信号发生器输出的真实物理频率（Hz）；f_digital 是离散设计时的归一化数字频率（0 到 0.5）；f_s 是硬件采样率（如 22 kHz，对应 0.5 数字频率映射到 11 kHz）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：手动扫频仪 vs DSP 真实频响（100 倍精度盲区对比）",
      "instruction": "拖动【当前扫频测试点】模拟从 125 Hz 步进到 10 kHz 的实测过程；调节【示波器读数误差】或开启【100 倍精度盲区放大镜】，直观感受为什么普通模拟仪表测不出 16 位 DSP 的真实底线。",
      "controls": [
        {
          "type": "slider",
          "id": "testFreq",
          "label": "当前扫频测试点",
          "min": 125,
          "max": 10000,
          "step": 125,
          "value": 4000,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "errorPct",
          "label": "模拟示波器/DVM 测量误差",
          "min": 0.1,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showZoom",
          "label": "开启 100 倍精度盲区放大对比",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\n\nvar pts = [\n  [0, 0.02], [250, 0.65], [500, 0.85], [850, 0.55], [1125, 0.25],\n  [1500, 0.58], [1850, 0.86], [2150, 0.63], [2600, 1.05], [3100, 1.52],\n  [3600, 2.05], [4000, 2.40], [4250, 1.55], [4600, 1.48], [5000, 1.45],\n  [5400, 1.32], [5800, 0.55], [6050, 0.06], [6300, 0.42], [6800, 1.00],\n  [7400, 1.05], [8000, 1.12], [8600, 0.92], [9300, 0.56], [10000, 0.28], [10800, 0.04]\n];\n\nfunction idealResp(f) {\n  if (f <= pts[0][0]) return pts[0][1];\n  for (var i = 0; i < pts.length - 1; i++) {\n    var f0 = pts[i][0], y0 = pts[i][1];\n    var f1 = pts[i + 1][0], y1 = pts[i + 1][1];\n    if (f >= f0 && f <= f1) {\n      var u = (f - f0) / (f1 - f0);\n      var s = 0.5 - 0.5 * Math.cos(Math.PI * u);\n      return y0 + (y1 - y0) * s;\n    }\n  }\n  return 0;\n}\n\nfunction detNoise(f) {\n  var x = Math.sin(f * 12.9898) * 43758.5453;\n  return (x - Math.floor(x)) * 2 - 1;\n}\n\nfunction draw() {\n  var testFreq = lab.values.testFreq;\n  var errPct = lab.values.errorPct;\n  var showZoom = !!lab.values.showZoom;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var padL = 48, padR = 24, padT = 24, padB = 30;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var maxF = 11000, maxA = 3.0;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var f = 0; f <= 10000; f += 2000) {\n    var gx = padL + (f / maxF) * plotW;\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + plotH); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(f + ' Hz', gx, H - 10);\n  }\n  for (var a = 0; a <= 3; a += 1) {\n    var gy = padT + plotH - (a / maxA) * plotH;\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.textAlign = 'right';\n    ctx.fillText(a.toFixed(0), padL - 8, gy + 4);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var fp = 0; fp <= 10800; fp += 40) {\n    var x = padL + (fp / maxF) * plotW;\n    var y = padT + plotH - (idealResp(fp) / maxA) * plotH;\n    if (fp === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  var curIdeal = idealResp(testFreq);\n  var curMeas = Math.max(0, curIdeal + detNoise(testFreq) * (errPct / 100) * 3.0);\n\n  for (var fm = 125; fm <= testFreq; fm += 125) {\n    var yTrue = idealResp(fm);\n    var yMeas = Math.max(0, yTrue + detNoise(fm) * (errPct / 100) * 3.0);\n    var mx = padL + (fm / maxF) * plotW;\n    var my = padT + plotH - (yMeas / maxA) * plotH;\n    ctx.fillStyle = fm === testFreq ? '#ec4899' : '#f59e0b';\n    ctx.fillRect(mx - 2.5, my - 2.5, 5, 5);\n  }\n\n  var tx = padL + (testFreq / maxF) * plotW;\n  ctx.strokeStyle = 'rgba(236,72,153,0.6)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(tx, padT); ctx.lineTo(tx, padT + plotH); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('— DSP 理论设计频响 (f_s = 22 kHz)', padL + 8, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('■ 模拟示波器手动扫频实测点 (步长 125 Hz)', padL + 225, 16);\n\n  if (showZoom) {\n    var bx = W - 265, by = 32, bw = 240, bh = 122;\n    ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';\n    ctx.fillRect(bx, by, bw, bh);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(bx, by, bw, bh);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('精度盲区放大镜 (满量程误差对比)', bx + 10, by + 18);\n\n    var barY1 = by + 44;\n    var errBarW = Math.min(190, (errPct / 2.0) * 180);\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';\n    ctx.fillRect(bx + 12, barY1 - 10, errBarW, 20);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.strokeRect(bx + 12, barY1 - 10, errBarW, 20);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px monospace';\n    ctx.fillText('模拟示波器误差: ±' + errPct.toFixed(1) + '%', bx + 12, barY1 + 24);\n\n    var barY2 = by + 94;\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(bx + 12, barY2 - 6, 1.5, 12);\n    ctx.fillText('16位Codec+浮点DSP: ±0.001%', bx + 18, barY2 + 4);\n  }\n\n  var ratio = (errPct / 0.001).toFixed(0);\n  lab.setReadout('测试频点=' + testFreq + ' Hz (数字频率 ' + (testFreq / 22000).toFixed(3) + ') | DSP理论增益=' + curIdeal.toFixed(4) + ' | 示波器读数=' + curMeas.toFixed(3) + ' | 仪表比DSP粗糙 ' + ratio + ' 倍!');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【触发“故障”别慌张】对称 FIR 滤波器带来严格恒定的群延迟（N_center / f_s），在模拟示波器上看起来像波形整体平推、触发异常，但这正是纯模拟阻容感滤波器做不到的“完美线性相位”优势。",
        "【高频骤降先查抗混叠】用信号发生器测 DSP 系统时，若频率逼近采样率一半（f_s / 2）时幅值陡降至零，说明前端 ADC 的抗混叠滤波器工作正常，而非算法失效。",
        "【警惕“测量工具瓶颈”】普通示波器和万用表精度仅 0.1%~1%，而 16 位 Codec + 浮点 DSP 的舍入误差仅 ~0.001%。用普通仪表验证高精度 DSP 算法时，测出来的往往是仪表的误差而非 DSP 的缺陷，深度评测需使用 20 位 ADC 级别的数据采集设备。"
      ]
    }
  ]
});
