window.__BOOK_REGISTER_SECTION__("sec_128", {
  "title": "滤波器基础：使命、三种响应与分贝直觉 (Filter Basics)",
  "intuition": "数字滤波器用纯数学计算碾压传统模拟电路，把纠偏电阻电容的麻烦变成“冲激响应、阶跃响应、频率响应”三位一体的信号手术刀。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、数字滤波器的两大使命与“降维打击”",
      "paragraphs": [
        "在数字信号处理（DSP）中，滤波器是含金量最高的核心武器之一，归根结底只干两件事：**信号分离（Signal Separation）**与**信号恢复（Signal Restoration）**。当有用信号被噪声或其它信号“污染”时，需要信号分离——典型例子是采集胎儿心电图（EKG）时，原始信号混入了母亲的呼吸和心跳，必须靠滤波器把它们剥离出来；当信号本身发生失真或畸变时，则需要信号恢复——比如修复劣质录音设备录下的失真音频，或者把镜头失焦、手抖拍糊的照片重新变清晰。",
        "既然模拟（电子）滤波器也能干这些活，为什么还要大费周折数字化？模拟滤波器的优势是便宜、高速、动态范围宽，但**数字滤波器的性能可以比模拟滤波器高出成千上万倍**。例如第 16 章会介绍的一个数字低通滤波器，在直流到 1000 Hz 范围内增益稳定在 `1 ± 0.0002`，而在 1001 Hz 以上增益瞬间跌破 `0.0002`——整个过渡带仅仅只有 **1 Hz**！用运放和阻容元件绝不可能做出这种“砖墙”性能。正因数字滤波器太强了，工程师不必再去操心电阻电容的精度与温漂，而是把全部精力转向信号本身的物理限制与理论边界。",
        "顺便破除一个术语误区：DSP 中常说输入输出位于**时域（Time Domain）**，虽然绝大多数信号是按等时间间隔采样的，但它也可以是**空间域**（例如沿着飞机机翼每隔 1 厘米安装一个应变传感器并同时读数）。因此看到“时域”时，请把它理解成“采样所在的原始物理域”的统称。"
      ],
      "formula": {
        "expr": null,
        "explain": "本节重在建立数字滤波器的物理定位：相比模拟电路受限于元器件误差，数字滤波器将设计重点转移到了采样信号本身的数学极限上。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：信号分离实战——把干扰啸叫从有用信号中“切除”",
      "instruction": "打开“播放对比音频”，先听混入 1400 Hz 刺耳干扰的信号，再开启数字低通滤波并拖动“低通截止频率”滑块，观察波形与频谱的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "高频干扰强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "低通截止频率",
          "min": 250,
          "max": 1600,
          "step": 50,
          "value": 450,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "filterOn",
          "label": "开启数字低通滤波",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioState = { oscSig: null, oscNoise: null, gainSig: null, gainNoise: null, bq1: null, bq2: null, master: null, active: false };\nfunction ensureAudio() {\n  var ctx = lab.getAudioContext();\n  if (!ctx) return null;\n  if (!audioState.oscSig) {\n    audioState.oscSig = ctx.createOscillator();\n    audioState.oscSig.type = 'sine';\n    audioState.oscSig.frequency.value = 220;\n    audioState.oscNoise = ctx.createOscillator();\n    audioState.oscNoise.type = 'sine';\n    audioState.oscNoise.frequency.value = 1400;\n    audioState.gainSig = ctx.createGain();\n    audioState.gainSig.gain.value = 0.22;\n    audioState.gainNoise = ctx.createGain();\n    audioState.gainNoise.gain.value = 0;\n    audioState.bq1 = ctx.createBiquadFilter();\n    audioState.bq1.type = 'lowpass';\n    audioState.bq1.Q.value = 0.707;\n    audioState.bq2 = ctx.createBiquadFilter();\n    audioState.bq2.type = 'lowpass';\n    audioState.bq2.Q.value = 0.707;\n    audioState.master = ctx.createGain();\n    audioState.master.gain.value = 0;\n    audioState.oscSig.connect(audioState.gainSig);\n    audioState.oscNoise.connect(audioState.gainNoise);\n    audioState.gainSig.connect(audioState.bq1);\n    audioState.gainNoise.connect(audioState.bq1);\n    audioState.bq1.connect(audioState.bq2);\n    audioState.bq2.connect(audioState.master);\n    audioState.master.connect(ctx.destination);\n    audioState.oscSig.start();\n    audioState.oscNoise.start();\n  }\n  return ctx;\n}\nfunction updateAudio() {\n  if (lab.values.play) {\n    var ctx = ensureAudio();\n    if (!ctx) return;\n    if (ctx.state === 'suspended') ctx.resume();\n    var now = ctx.currentTime;\n    audioState.gainNoise.gain.setTargetAtTime(0.18 * lab.values.noiseAmp, now, 0.02);\n    var fc = lab.values.filterOn ? lab.values.cutoff : 18000;\n    audioState.bq1.frequency.setTargetAtTime(fc, now, 0.02);\n    audioState.bq2.frequency.setTargetAtTime(fc, now, 0.02);\n    audioState.master.gain.setTargetAtTime(0.8, now, 0.03);\n  } else if (audioState.master) {\n    var ctx2 = lab.getAudioContext();\n    if (ctx2) audioState.master.gain.setTargetAtTime(0, ctx2.currentTime, 0.02);\n  }\n}\nfunction buildFirKernel(fcNorm, taps) {\n  var h = new Array(taps);\n  var mid = (taps - 1) / 2;\n  var sum = 0;\n  for (var i = 0; i < taps; i++) {\n    var x = i - mid;\n    var sinc = x === 0 ? 2 * fcNorm : Math.sin(2 * Math.PI * fcNorm * x) / (Math.PI * x);\n    var w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (taps - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (taps - 1));\n    h[i] = sinc * w;\n    sum += h[i];\n  }\n  for (var j = 0; j < taps; j++) h[j] /= sum;\n  return h;\n}\nfunction render() {\n  updateAudio();\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  var fs = 8000;\n  var taps = 61;\n  var fc = lab.values.cutoff;\n  var noiseAmp = lab.values.noiseAmp;\n  var filterOn = lab.values.filterOn;\n  var h = buildFirKernel(fc / fs, taps);\n  var totalN = 260;\n  var showN = 145;\n  var startN = 80;\n  var raw = new Array(totalN);\n  var clean = new Array(totalN);\n  var filtered = new Array(totalN);\n  for (var n = 0; n < totalN; n++) {\n    var t = n / fs;\n    clean[n] = 0.55 * Math.sin(2 * Math.PI * 220 * t);\n    raw[n] = clean[n] + noiseAmp * 0.45 * Math.sin(2 * Math.PI * 1400 * t);\n  }\n  for (var n2 = 0; n2 < totalN; n2++) {\n    var acc = 0;\n    for (var k = 0; k < taps; k++) {\n      var idx = n2 - k;\n      if (idx >= 0) acc += h[k] * raw[idx];\n    }\n    filtered[n2] = acc;\n  }\n  var padL = 38, waveW = 428, topY = 26, botY = 212;\n  var midY = (topY + botY) / 2;\n  var scaleY = 78;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gy = -1; gy <= 1; gy += 0.5) {\n    var yy = midY - gy * scaleY;\n    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + waveW, yy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(padL, midY); ctx.lineTo(padL + waveW, midY); ctx.stroke();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i < showN; i++) {\n    var px = padL + (i / (showN - 1)) * waveW;\n    var py = midY - clean[startN + i] * scaleY;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = filterOn ? 'rgba(245,158,11,0.38)' : '#f59e0b';\n  ctx.lineWidth = filterOn ? 1.2 : 2;\n  ctx.beginPath();\n  for (var i2 = 0; i2 < showN; i2++) {\n    var px2 = padL + (i2 / (showN - 1)) * waveW;\n    var py2 = midY - raw[startN + i2] * scaleY;\n    if (i2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  if (filterOn) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var i3 = 0; i3 < showN; i3++) {\n      var px3 = padL + (i3 / (showN - 1)) * waveW;\n      var py3 = midY - filtered[startN + i3] * scaleY;\n      if (i3 === 0) ctx.moveTo(px3, py3); else ctx.lineTo(px3, py3);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域波形对比 (蓝虚线: 原信号 | 琥珀: 污染输入 | 绿: 滤波输出)', padL, 16);\n  var spX = 496, spW = 204, spTop = 26, spBot = 212, spH = spBot - spTop;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(spX, spTop, spW, spH);\n  var fcRatio = Math.min(1, fc / 2000);\n  if (filterOn) {\n    ctx.fillStyle = 'rgba(16,185,129,0.12)';\n    ctx.fillRect(spX, spTop, spW * fcRatio, spH);\n  }\n  function respAt(freq) {\n    var re = 0, im = 0, w0 = 2 * Math.PI * (freq / fs);\n    for (var k = 0; k < taps; k++) {\n      re += h[k] * Math.cos(w0 * k);\n      im -= h[k] * Math.sin(w0 * k);\n    }\n    return Math.sqrt(re * re + im * im);\n  }\n  var g220 = filterOn ? respAt(220) : 1;\n  var g1400 = filterOn ? respAt(1400) : 1;\n  if (filterOn) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var pxF = 0; pxF <= spW; pxF += 2) {\n      var freq = (pxF / spW) * 2000;\n      var mag = respAt(freq);\n      var yR = spBot - mag * (spH - 22);\n      if (pxF === 0) ctx.moveTo(spX + pxF, yR); else ctx.lineTo(spX + pxF, yR);\n    }\n    ctx.stroke();\n  }\n  var x220 = spX + (220 / 2000) * spW;\n  var h220 = 0.55 * g220 * (spH - 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(x220 - 5, spBot - h220, 10, h220);\n  var x1400 = spX + (1400 / 2000) * spW;\n  var h1400Raw = noiseAmp * 0.45 * (spH - 22);\n  ctx.fillStyle = 'rgba(236,72,153,0.28)';\n  ctx.fillRect(x1400 - 5, spBot - h1400Raw, 10, h1400Raw);\n  var h1400Out = h1400Raw * g1400;\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(x1400 - 5, spBot - h1400Out, 10, h1400Out);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频谱 (0~2000 Hz)', spX, 16);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('220Hz', x220 - 14, spBot + 14);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('1400Hz', x1400 - 18, spBot + 14);\n  var resPct = (g1400 * 100).toFixed(1);\n  lab.setReadout('有用信号: 220 Hz | 干扰: 1400 Hz (强度 ' + noiseAmp.toFixed(2) + ') | 滤波: ' + (filterOn ? '开启 (Fc=' + fc + ' Hz)' : '关闭') + ' | 干扰穿透率: ' + resPct + '%');\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "二、线性滤波器的三种面孔，与 FIR / IIR 两大实现流派",
      "paragraphs": [
        "任何线性滤波器都有三副相互等价的面孔：**冲激响应（Impulse Response）**、**阶跃响应（Step Response）**和**频率响应（Frequency Response）**。这三者中的任意一个被唯一确定后，另外两个就被完全锁死，可以直接计算出来。它们之所以都不可或缺，是因为各自揭示了滤波器在不同场景下的性格：",
        "1. **冲激响应与 FIR 滤波器**：输入一个单位脉冲时系统的输出就是冲激响应。实现数字滤波器最直接的方法，就是将输入信号与冲激响应做**卷积（Convolution）**——这时设计师给冲激响应起了一个专有名词：**滤波器核（Filter Kernel）**。靠有限长核做卷积实现的滤波器，被称为**有限冲激响应滤波器（FIR）**。",
        "2. **递归与 IIR 滤波器**：除了卷积，还有一种“借力打力”的方法叫**递归（Recursion）**。计算当前输出时，不仅加权当前和过去的输入样本，还把**之前已经算出来的输出值**也喂回来参与加权，它由一组**递归系数（Recursion Coefficients）**定义。因为输出不断反馈，给递归滤波器输入一个脉冲，输出往往是一串指数衰减的正弦波——理论上永远不会真正归零（直到跌破系统的舍入噪声），因此被称为**无限冲激响应滤波器（IIR）**。",
        "3. **阶跃响应与频率响应的几何关系**：输入一个阶跃信号（又叫边沿 Edge）得到的输出叫**阶跃响应（Step Response）**。由于阶跃在数学上是脉冲的积分，因此**阶跃响应就是冲激响应的离散积分（即累加和 Running Sum）**，它能一眼看出滤波器对突变信号的响应速度与振铃过冲。而对冲激响应做离散傅里叶变换（通常用 FFT 算法），就能得到**频率响应**。画频响图时有两种纵坐标：**线性刻度**最适合观察通带波纹（Passband Ripple）和过渡带滚降（Roll-off）；而要看清阻带到底把噪声压低了多少（**阻带衰减 Stopband Attenuation**），必须切换到**分贝（dB）刻度**。"
      ],
      "formula": {
        "expr": "y[n] = Σ h[k]·x[n-k]   |   s[n] = Σ_{k=0}^{n} h[k]",
        "explain": "左式为 FIR 卷积实现：输入信号 x[n] 与滤波器核（冲激响应）h[k] 加权求和得到输出 y[n]；右式表明对冲激响应 h[k] 逐点做离散累加，直接得到阶跃响应 s[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：三位一体——联动观察冲激响应、阶跃响应与频响（线性 vs 分贝）",
      "instruction": "拖动“归一化截止频率”和“滤波器核长度”，并点击“切换为分贝 (dB) 刻度”，直观感受图 14-1 中三种响应如何严格联动，以及线性刻度与分贝刻度看到的细节差异。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "归一化截止频率 (Fc)",
          "min": 0.05,
          "max": 0.4,
          "step": 0.01,
          "value": 0.14,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "滤波器核长度",
          "min": 15,
          "max": 101,
          "step": 2,
          "value": 51,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "频响切换为分贝 (dB) 刻度",
          "value": false
        }
      ],
      "jsCode": "function drawPanel(ctx, x, y, w, h, title) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x, y, w, h);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(title, x + 4, y - 7);\n}\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  var fc = lab.values.fc;\n  var M = lab.values.taps;\n  var dbScale = lab.values.dbScale;\n  var mid = (M - 1) / 2;\n  var kernel = new Array(M);\n  var sum = 0;\n  for (var i = 0; i < M; i++) {\n    var dx = i - mid;\n    var val = dx === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * dx) / (Math.PI * dx);\n    var win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (M - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (M - 1));\n    kernel[i] = val * win;\n    sum += kernel[i];\n  }\n  var hMax = 0, hMin = 0;\n  for (var j = 0; j < M; j++) {\n    kernel[j] /= sum;\n    if (kernel[j] > hMax) hMax = kernel[j];\n    if (kernel[j] < hMin) hMin = kernel[j];\n  }\n  var step = new Array(M);\n  var run = 0, sMax = 1, sMin = 0;\n  for (var k = 0; k < M; k++) {\n    run += kernel[k];\n    step[k] = run;\n    if (run > sMax) sMax = run;\n    if (run < sMin) sMin = run;\n  }\n  var freqPts = 180;\n  var mag = new Array(freqPts);\n  var stopMax = 1e-6;\n  for (var fIdx = 0; fIdx < freqPts; fIdx++) {\n    var f = (fIdx / (freqPts - 1)) * 0.5;\n    var re = 0, im = 0;\n    for (var n = 0; n < M; n++) {\n      var ang = 2 * Math.PI * f * n;\n      re += kernel[n] * Math.cos(ang);\n      im -= kernel[n] * Math.sin(ang);\n    }\n    var mVal = Math.sqrt(re * re + im * im);\n    mag[fIdx] = mVal;\n    if (f >= Math.min(0.47, fc + 0.09) && mVal > stopMax) stopMax = mVal;\n  }\n  var pTop = 26, pH = 190, pW = 204;\n  var x1 = 22, x2 = 258, x3 = 494;\n  drawPanel(ctx, x1, pTop, pW, pH, '(a) 冲激响应 h[n] (核)');\n  var hRange = Math.max(hMax, Math.abs(hMin), 0.15) * 1.2;\n  var yZero1 = pTop + pH * 0.72;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(x1, yZero1); ctx.lineTo(x1 + pW, yZero1); ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var i1 = 0; i1 < M; i1++) {\n    var px = x1 + 8 + (i1 / (M - 1)) * (pW - 16);\n    var py = yZero1 - (kernel[i1] / hRange) * (pH * 0.65);\n    if (i1 === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  for (var i1b = 0; i1b < M; i1b++) {\n    if (M > 55 && i1b % 2 !== 0) continue;\n    var pxb = x1 + 8 + (i1b / (M - 1)) * (pW - 16);\n    var pyb = yZero1 - (kernel[i1b] / hRange) * (pH * 0.65);\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(pxb - 1.5, pyb - 1.5, 3, 3);\n  }\n  drawPanel(ctx, x2, pTop, pW, pH, '(b) 阶跃响应 s[n] = Σh[k]');\n  var yZero2 = pTop + pH * 0.82;\n  var yOne2 = pTop + pH * 0.22;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(x2, yZero2); ctx.lineTo(x2 + pW, yZero2); ctx.stroke();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(x2, yOne2); ctx.lineTo(x2 + pW, yOne2); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i2 = 0; i2 < M; i2++) {\n    var px2 = x2 + 8 + (i2 / (M - 1)) * (pW - 16);\n    var py2 = yZero2 - step[i2] * (yZero2 - yOne2);\n    if (i2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  drawPanel(ctx, x3, pTop, pW, pH, dbScale ? '(d) 频率响应 (分贝 dB)' : '(c) 频率响应 (线性刻度)');\n  if (!dbScale) {\n    var yZ3 = pTop + pH * 0.86;\n    var y1_3 = pTop + pH * 0.20;\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.beginPath(); ctx.moveTo(x3, yZ3); ctx.lineTo(x3 + pW, yZ3); ctx.stroke();\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.beginPath(); ctx.moveTo(x3, y1_3); ctx.lineTo(x3 + pW, y1_3); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var f1 = 0; f1 < freqPts; f1++) {\n      var px3 = x3 + 6 + (f1 / (freqPts - 1)) * (pW - 12);\n      var py3 = yZ3 - mag[f1] * (yZ3 - y1_3);\n      if (f1 === 0) ctx.moveTo(px3, py3); else ctx.lineTo(px3, py3);\n    }\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('1.0', x3 + 4, y1_3 - 3);\n    ctx.fillText('0.0', x3 + 4, yZ3 - 3);\n  } else {\n    var dbMin = -80, dbMax = 10;\n    function dbToY(d) {\n      var cl = Math.max(dbMin, Math.min(dbMax, d));\n      return pTop + ((dbMax - cl) / (dbMax - dbMin)) * pH;\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '10px sans-serif';\n    var marks = [0, -20, -40, -60];\n    for (var mIdx = 0; mIdx < marks.length; mIdx++) {\n      var ym = dbToY(marks[mIdx]);\n      ctx.beginPath(); ctx.moveTo(x3, ym); ctx.lineTo(x3 + pW, ym); ctx.stroke();\n      ctx.fillText(marks[mIdx] + 'dB', x3 + 4, ym - 2);\n    }\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var f2 = 0; f2 < freqPts; f2++) {\n      var px4 = x3 + 6 + (f2 / (freqPts - 1)) * (pW - 12);\n      var dbVal = 20 * Math.log(Math.max(mag[f2], 1e-5)) / Math.LN10;\n      var py4 = dbToY(dbVal);\n      if (f2 === 0) ctx.moveTo(px4, py4); else ctx.lineTo(px4, py4);\n    }\n    ctx.stroke();\n  }\n  var fcLineX = x3 + 6 + (fc / 0.5) * (pW - 12);\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(16,185,129,0.55)';\n  ctx.beginPath(); ctx.moveTo(fcLineX, pTop); ctx.lineTo(fcLineX, pTop + pH); ctx.stroke();\n  ctx.setLineDash([]);\n  var overshoot = ((sMax - 1) * 100).toFixed(2);\n  var stopDb = (20 * Math.log(stopMax) / Math.LN10).toFixed(1);\n  lab.setReadout('核长度: ' + M + ' 点 | 截止频率: ' + fc.toFixed(2) + ' Fs | 阶跃过冲: +' + overshoot + '% | 阻带旁瓣峰值: ' + stopDb + ' dB');\n});"
    },
    {
      "type": "concept",
      "heading": "三、分贝（dB）速通：为什么功率放大 100 倍，幅度只放大 10 倍？",
      "paragraphs": [
        "看阻带衰减时必须用到**分贝（dB）**。1 **贝尔（Bel**，纪念电话发明人亚历山大·贝尔）代表**功率**改变 10 倍；3 贝尔就是 `10 × 10 × 10 = 1000` 倍功率。而 1 **分贝（dB）** 是十分之一个贝尔，因此 `-20 dB、-10 dB、0 dB、10 dB、20 dB` 对应的功率比分别是 `0.01、0.1、1、10、100`——记住：**每差 10 dB，功率差 10 倍**。",
        "但做 DSP 编程时，我们打交道最多的往往是信号的**幅度（Amplitude）**而不是功率！因为功率与幅度的平方成正比，一个放大器增益为 `+20 dB`，意味着功率增加了 100 倍，但输出幅度只是输入幅度的 `√100 = 10` 倍。所以记住第二条铁律：**每差 20 dB，幅度差 10 倍**。常用幅度换算表务必倒背如流：`60 dB = 1000`、`40 dB = 100`、`20 dB = 10`、`0 dB = 1`、`-20 dB = 0.1`、`-40 dB = 0.01`、`-60 dB = 0.001`。",
        "除了衡量输入输出比值，工程师也用分贝把单个信号和标准参考值做比较，比如 `dBV` 以 1 伏特有效值（rms）为基准，而 `dBm` 以在 600 欧姆负载上产生 1 毫瓦功率的信号（约 0.78 V rms）为基准。如果关于分贝只能记住一件事，请记住 **-3 dB**：它代表信号幅度跌到原来的 `0.707` 倍，功率正好减半（`0.5` 倍）！"
      ],
      "formula": {
        "expr": "dB = 10·log₁₀(P₂ / P₁) = 20·log₁₀(A₂ / A₁)   |   20·log₁₀(x) ≈ 8.685890·ln(x)",
        "explain": "P₁、P₂ 为对比的功率，A₁、A₂ 为对比的幅度。许多编程语言自带的 log() 是自然对数 ln 而非 log₁₀，此时算功率分贝需乘 4.342945，算幅度分贝需乘 8.685890。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 3：分贝（dB）刻度实验室——幅度比与功率比的巨大鸿沟",
      "instruction": "拖动“增益 / 衰减 (dB)”滑块，重点停在 -3 dB、-20 dB、-40 dB 和 +20 dB 处，观察波形缩水/放大速度与右侧幅度比、功率比的剧烈分化。",
      "controls": [
        {
          "type": "slider",
          "id": "db",
          "label": "增益 / 衰减",
          "min": -60,
          "max": 20,
          "step": 1,
          "value": -3,
          "unit": " dB"
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  var db = lab.values.db;\n  var ampRatio = Math.pow(10, db / 20);\n  var pwrRatio = Math.pow(10, db / 10);\n  var wx = 24, ww = 310, wy = 28, wh = 188, wMid = wy + wh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(wx, wy, ww, wh);\n  ctx.beginPath(); ctx.moveTo(wx, wMid); ctx.lineTo(wx + ww, wMid); ctx.stroke();\n  var viewMax = db > 0 ? Math.max(1.2, ampRatio) : 1.15;\n  var scale = (wh * 0.44) / viewMax;\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var i = 0; i <= 160; i++) {\n    var px = wx + (i / 160) * ww;\n    var py = wMid - Math.sin((i / 160) * 4 * Math.PI) * scale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var j = 0; j <= 160; j++) {\n    var px2 = wx + (j / 160) * ww;\n    var py2 = wMid - ampRatio * Math.sin((j / 160) * 4 * Math.PI) * scale;\n    if (j === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('波形幅度对比 (蓝虚线: 输入 A₁=1 | 绿实线: 输出 A₂)', wx, 18);\n  var rx = 368, rw = 328;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(rx, wy, rw, wh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, wy, rw, wh);\n  function fmtNum(v) {\n    if (v >= 10) return v.toFixed(1);\n    if (v >= 0.1) return v.toFixed(3);\n    if (v >= 0.001) return v.toFixed(4);\n    return v.toExponential(2);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('幅度比 A₂ / A₁ = ' + fmtNum(ampRatio) + ' 倍', rx + 16, wy + 34);\n  var barW = rw - 32;\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(rx + 16, wy + 44, barW, 14);\n  var ampFill = Math.max(0, Math.min(1, (db + 60) / 80));\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(rx + 16, wy + 44, barW * ampFill, 14);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('功率比 P₂ / P₁ = ' + fmtNum(pwrRatio) + ' 倍', rx + 16, wy + 92);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(rx + 16, wy + 102, barW, 14);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(rx + 16, wy + 102, barW * ampFill, 14);\n  var note = '拖动观察每 20 dB 对幅度(10×)与功率(100×)的缩放';\n  if (db === -3) note = '★ 黄金刻度 -3 dB：幅度=0.707，功率正好减半 (0.500)！';\n  else if (db === 0) note = '★ 0 dB：输入等于输出 (幅度比=1，功率比=1)';\n  else if (db === -20) note = '★ -20 dB：幅度缩至 0.1 倍，功率已暴跌至 0.01 倍！';\n  else if (db === -40) note = '★ -40 dB：幅度缩至 0.01 倍，功率仅为万分之一！';\n  else if (db === -60) note = '★ -60 dB：幅度降至千分之一 (0.001)，功率降至百万分之一！';\n  else if (db === 20) note = '★ +20 dB：幅度放大 10 倍，功率放大了整整 100 倍！';\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(note, rx + 16, wy + 152);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('自然对数公式: 8.68589 × ln(A₂/A₁) = ' + db.toFixed(1) + ' dB', rx + 16, wy + 174);\n  lab.setReadout('当前设定: ' + db + ' dB | 幅度比: ' + fmtNum(ampRatio) + ' | 功率比: ' + fmtNum(pwrRatio));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "别被“时域”字面意思骗了：DSP 中的时域同样涵盖空间等距采样（如机身传感器阵列），所有滤波器理论照用不误。",
        "看频响图不能偏科：检查通带平不平、过渡带陡不陡，看**线性刻度**；检查阻带噪声到底压掉了多少，必须切到**分贝（dB）刻度**。",
        "写代码算分贝最容易踩的坑：多数语言内置的 `log()` 是自然对数 ln 而非 log₁₀，计算幅度分贝务必乘 `8.685890`（功率乘 `4.342945`），切勿直接乘 20。",
        "随身携带的刻度表：`-3 dB` = 幅度 0.707（功率减半）；每 `20 dB` 幅度差 10 倍（`-20 dB = 0.1`，`-40 dB = 0.01`，`-60 dB = 0.001`）。"
      ]
    }
  ]
});
