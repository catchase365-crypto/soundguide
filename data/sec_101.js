window.__BOOK_REGISTER_SECTION__("sec_101", {
  "title": "信号的频谱分析 (Spectral Analysis of Signals)",
  "intuition": "当有效信号被淹没在随机噪声的时域波形中时，盲目拉长单次 DFT 并不能降噪；把长信号切分成多段、加汉明窗做 DFT 后对幅值谱求平均，才能让隐藏的频率特征从噪声海洋中清晰浮现。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、为什么要从“看波形”转向“看频谱”？",
      "paragraphs": [
        "在自然界与工程系统里，大量信号的信息并不是编码在时域波形的“外观形状”里，而是隐藏在**正弦分量的频率、相位和幅值**之中。比如人类说话依赖声带振动、行星与恒星因自转和公转产生周期性亮度变化、轮船螺旋桨在水中激起周期性推力波动。直接用肉眼盯着这类信号的时域曲线，往往只能看到一团杂乱无章的上下抖动，根本看不出里面藏着什么。",
        "书中使用了一个非常经典的**水下声学探测实验**：把水听器（麦克风）放入大海，将微弱电信号放大到几伏特后，先通过一个截止频率为 **80 Hz** 的模拟低通滤波器滤除高频混叠成分，再以 **160 样本/秒**（恰好满足奈奎斯特采样定理）进行数字化采集，连续存下成千上万个采样点。",
        "拿到数据后，第一步先取其中的 **256 个采样点** 观察。原始时域图就像一团毫无规律的随机噪声。于是我们先给这 256 个点乘以一条两端平滑衰减至接近零的曲线——**汉明窗（Hamming Window）**，抑制截断边缘带来的频谱泄漏；接着对加窗后的信号做 **256 点 DFT** 并转为极坐标取幅值，得到一条 **129 点**（从直流到奈奎斯特频率 `0.5`，即 `0 ~ 80 Hz`）的频谱图。",
        "但令人失望的是：**单次 256 点 DFT 算出来的频谱依然像一团乱麻！** 很多人第一反应是：“是不是采样点太少了？我用 2048 点来做一次更长的 DFT 吧！”然而事实是残酷的：**使用更长的 DFT 并不会降低频谱的噪声水平**。2048 个点确实带来了 8 倍的信息量，但生成的频谱长度也随之变成了 **1025 点**，信息量被等比例稀释到了更密集的频率栅格里——你只是获得了更高的**频率分辨率**，噪声起伏却丝毫没有变小。"
      ],
      "formula": {
        "expr": "N_spec = N / 2 + 1 ,   Δf = f_s / N",
        "explain": "N 为单次 DFT 点数，N_spec 是正频率频谱的独立采样点数（256 点得 129 点，2048 点得 1025 点）；f_s 为采样率（160 Hz），Δf 为频率分辨率。增大 N 只会让 Δf 更精细，无法压缩随机噪声的起伏。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：水下声波的加窗与单段 DFT 噪声困境",
      "instruction": "拖动“环境噪声强度”滑块听听声波被噪声淹没的过程，切换“汉明窗”开关，观察右侧 129 点单次 DFT 频谱为何依然杂乱无章。",
      "controls": [
        {
          "type": "slider",
          "id": "noise",
          "label": "环境噪声强度",
          "min": 0,
          "max": 2,
          "step": 0.05,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "win",
          "label": "乘以汉明窗 (Hamming Window)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听水下声波（音高映射版）",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar N = 256, bins = 129;\nvar baseClean = new Float64Array(N);\nvar baseNoise = new Float64Array(N);\nvar hamming = new Float64Array(N);\nvar seed = 4242;\nfunction nextRand() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }\nfunction nextGauss() { return (nextRand() + nextRand() + nextRand() + nextRand() + nextRand() + nextRand() - 3) * 0.7071; }\nfor (var i = 0; i < N; i++) {\n  hamming[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));\n  baseClean[i] = 0.16 * Math.sin(2 * Math.PI * 0.03 * i + 0.4) + 0.09 * Math.sin(2 * Math.PI * 0.23 * i + 1.1) + 0.13 * Math.sin(2 * Math.PI * 0.37 * i + 2.2);\n  baseNoise[i] = nextGauss() * 0.28;\n}\nvar audioState = { running: false, master: null, noiseGain: null, oscs: [], noiseSrc: null };\nfunction syncAudio() {\n  var wantPlay = !!lab.values.play;\n  if (!wantPlay) {\n    if (audioState.running && audioState.master) {\n      audioState.master.gain.setTargetAtTime(0, lab.getAudioContext().currentTime, 0.02);\n      audioState.running = false;\n    }\n    return;\n  }\n  var ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!audioState.master) {\n    var master = ac.createGain();\n    master.gain.value = 0;\n    master.connect(ac.destination);\n    var toneGain = ac.createGain();\n    toneGain.gain.value = 0.18;\n    toneGain.connect(master);\n    var freqs = [165, 368, 592];\n    var amps = [0.45, 0.25, 0.35];\n    for (var k = 0; k < freqs.length; k++) {\n      var osc = ac.createOscillator();\n      var g = ac.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = freqs[k];\n      g.gain.value = amps[k];\n      osc.connect(g);\n      g.connect(toneGain);\n      osc.start();\n      audioState.oscs.push(osc);\n    }\n    var bufLen = ac.sampleRate * 2;\n    var buf = ac.createBuffer(1, bufLen, ac.sampleRate);\n    var ch = buf.getChannelData(0);\n    for (var s = 0; s < bufLen; s++) ch[s] = (Math.random() * 2 - 1) * 0.35;\n    var nSrc = ac.createBufferSource();\n    nSrc.buffer = buf;\n    nSrc.loop = true;\n    var nGain = ac.createGain();\n    nSrc.connect(nGain);\n    nGain.connect(master);\n    nSrc.start();\n    audioState.master = master;\n    audioState.noiseGain = nGain;\n    audioState.noiseSrc = nSrc;\n  }\n  audioState.noiseGain.gain.setTargetAtTime(lab.values.noise * 0.28, ac.currentTime, 0.03);\n  audioState.master.gain.setTargetAtTime(0.45, ac.currentTime, 0.03);\n  audioState.running = true;\n}\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  var nLevel = lab.values.noise;\n  var useWin = !!lab.values.win;\n  var sig = new Float64Array(N);\n  for (var i = 0; i < N; i++) {\n    var raw = baseClean[i] + baseNoise[i] * nLevel;\n    sig[i] = useWin ? raw * hamming[i] : raw;\n  }\n  var mag = new Float64Array(bins);\n  for (var k = 0; k < bins; k++) {\n    var re = 0, im = 0;\n    var w = (2 * Math.PI * k) / N;\n    for (var n = 0; n < N; n++) {\n      re += sig[n] * Math.cos(w * n);\n      im -= sig[n] * Math.sin(w * n);\n    }\n    mag[k] = Math.sqrt(re * re + im * im) / 2.2;\n  }\n  var lx = 36, ly = 32, lw = 304, lh = 172;\n  var rx = 398, ry = 32, rw = 300, rh = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = ly + (lh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n    var rgy = ry + (rh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, rgy); ctx.lineTo(rx + rw, rgy); ctx.stroke();\n  }\n  for (var vg = 0; vg <= 4; vg++) {\n    var vx = lx + (lw * vg) / 4;\n    ctx.beginPath(); ctx.moveTo(vx, ly); ctx.lineTo(vx, ly + lh); ctx.stroke();\n    var rvx = rx + (rw * vg) / 5;\n    ctx.beginPath(); ctx.moveTo(rvx, ry); ctx.lineTo(rvx, ry + rh); ctx.stroke();\n  }\n  var rvx5 = rx + rw;\n  ctx.beginPath(); ctx.moveTo(rvx5, ry); ctx.lineTo(rvx5, ry + rh); ctx.stroke();\n  if (useWin) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = lx + (i / (N - 1)) * lw;\n      var py = ly + lh / 2 - hamming[i] * (lh * 0.44);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = lx + (i / (N - 1)) * lw;\n      var py = ly + lh / 2 + hamming[i] * (lh * 0.44);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n  ctx.strokeStyle = useWin ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = lx + (i / (N - 1)) * lw;\n    var val = Math.max(-1, Math.min(1, sig[i]));\n    var py = ly + lh / 2 - val * (lh * 0.45);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var k = 0; k < bins; k++) {\n    var px = rx + (k / (bins - 1)) * rw;\n    var m = Math.min(10, mag[k]);\n    var py = ry + rh - (m / 10) * rh;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(useWin ? '时域信号 × 汉明窗 (256 点)' : '原始时域信号 (256 点)', lx, 19);\n  ctx.fillText('单次 DFT 幅值谱 (129 点)', rx, 19);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px monospace';\n  ctx.fillText('+1.0', 6, ly + 6); ctx.fillText(' 0.0', 6, ly + lh / 2 + 4); ctx.fillText('-1.0', 6, ly + lh);\n  ctx.fillText('0', lx, ly + lh + 14); ctx.fillText('128', lx + lw / 2 - 10, ly + lh + 14); ctx.fillText('255', lx + lw - 18, ly + lh + 14);\n  ctx.fillText('10', rx - 20, ry + 8); ctx.fillText('5', rx - 14, ry + rh / 2 + 4); ctx.fillText('0', rx - 14, ry + rh);\n  for (var f = 0; f <= 5; f++) {\n    ctx.fillText((f * 0.1).toFixed(1), rx + (rw * f) / 5 - 8, ry + rh + 14);\n  }\n  ctx.fillStyle = '#f59e0b';\n  if (useWin) ctx.fillText('--- 汉明窗包络', lx + 195, 19);\n  var peak37 = mag[Math.round(0.37 * N)].toFixed(2);\n  lab.setReadout('噪声倍率: ' + nLevel.toFixed(2) + 'x  |  加窗状态: ' + (useWin ? '已启用 Hamming 窗' : '未加窗 (矩形截断)') + '  |  0.37频点幅值: ' + peak37 + '  |  提示: 声音将0~80Hz映射至160~800Hz便于人耳听辨');\n  syncAudio();\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "二、破局之道：分段求平均 vs 长 DFT 谱平滑",
      "paragraphs": [
        "既然单段 256 点信息量不够，而直接用 2048 点又会把信息稀释到 1025 个频点里，真正的解决办法是什么？答案是：**用更多的输入数据，但不要增加输出频谱的点数！**",
        "**方法一（分段平均法 / 周期图平均）**：把长达几万点的连续采样数据，切分成 **M 个 256 点的片段**。每一段分别乘以汉明窗、做 256 点 DFT 并转成极坐标；然后**扔掉相位（Phase）**，只把这 M 张 129 点的**幅值谱（Magnitude）逐点相加求平均**。由于随机噪声的起伏在各段之间互不相关，平均之后**随机噪声会按分段数 M 的平方根比例（`1/√M`）下降**！平均 100 段，随机噪声波动就降到原来的 1/10；在天文观测或微弱信号探测中，甚至会平均数百万段来把极微弱的谱线特征打捞出来。切记：**绝对不能带相位（或对复数实部虚部）直接求平均**，因为各段目标信号的到达时间与相位是随机错开的，带相位平均会把有用信号也一起抵消掉！",
        "**方法二（超长 DFT + 频谱低通平滑）**：你也可以先做一次超长 DFT（比如 16,384 点，得到极其毛糙的 8193 点高分辨率频谱），再用一个简单的数字低通滤波器对频谱本身做平滑（例如把相邻 64 个频率点求平均合成 1 个点）。经过推算，这种做法得到的噪声水平和频率分辨率，与把 16,384 点切成 64 段 256 点做方法一几乎一模一样。",
        "**工程选型建议**：方法一（分段平均）更简单，不需要额外设计数字滤波器；方法二虽然理论上能通过定制滤波器来微调“噪声与分辨率之间的权衡”，但工程上极少值得这么麻烦——因为只要多采集一点输入数据，方法一就能**同时**改善噪声和分辨率。"
      ],
      "formula": {
        "expr": "S_avg[k] = (1 / M) * Σ_{m=0}^{M-1} |X_m[k]| ,   σ_noise ∝ 1 / √M",
        "explain": "S_avg[k] 为第 k 个频率点的平均幅值；|X_m[k]| 为第 m 段加窗信号做 DFT 后的幅值（丢弃相位）；M 为平均分段数。随机噪声的标准差随 √M 成反比衰减。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：分段平均法让“幽灵频率”从噪声中现身",
      "instruction": "拖动“平均分段数 M”滑块从 1 拉到 200，见证图 9-1(d) 如何蜕变为图 9-1(e)；再开启“改用 2048 点长 DFT”对比为何加长 DFT 依然满屏毛刺。",
      "controls": [
        {
          "type": "slider",
          "id": "segments",
          "label": "平均分段数 (M)",
          "min": 1,
          "max": 200,
          "step": 1,
          "value": 1,
          "unit": " 段"
        },
        {
          "type": "toggle",
          "id": "longDft",
          "label": "对比：改用 2048 点长 DFT (不分段)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "markers",
          "label": "标注真实特征峰位置 (0.23 & 0.37)",
          "value": true
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar N = 256, BINS = 129, MAX_M = 200, LONG_N = 2048, LONG_BINS = 1025;\nfunction fftMag(input) {\n  var lenN = input.length;\n  var re = new Float64Array(lenN);\n  var im = new Float64Array(lenN);\n  for (var i = 0; i < lenN; i++) re[i] = input[i];\n  var j = 0;\n  for (var i = 0; i < lenN; i++) {\n    if (i < j) { var tr = re[i]; re[i] = re[j]; re[j] = tr; }\n    var m = lenN >> 1;\n    while (m >= 1 && j >= m) { j -= m; m >>= 1; }\n    j += m;\n  }\n  for (var size = 2; size <= lenN; size <<= 1) {\n    var half = size >> 1;\n    var ang = -2 * Math.PI / size;\n    var wSR = Math.cos(ang), wSI = Math.sin(ang);\n    for (var i = 0; i < lenN; i += size) {\n      var wR = 1, wI = 0;\n      for (var k = 0; k < half; k++) {\n        var uR = re[i + k], uI = im[i + k];\n        var vR = re[i + k + half] * wR - im[i + k + half] * wI;\n        var vI = re[i + k + half] * wI + im[i + k + half] * wR;\n        re[i + k] = uR + vR; im[i + k] = uI + vI;\n        re[i + k + half] = uR - vR; im[i + k + half] = uI - vI;\n        var nwR = wR * wSR - wI * wSI;\n        wI = wR * wSI + wI * wSR; wR = nwR;\n      }\n    }\n  }\n  var outLen = (lenN >> 1) + 1;\n  var mag = new Float64Array(outLen);\n  var scale = 1 / (0.55 * Math.sqrt(lenN));\n  for (var k = 0; k < outLen; k++) mag[k] = Math.sqrt(re[k] * re[k] + im[k] * im[k]) * scale;\n  return mag;\n}\nvar seed = 918273;\nfunction rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }\nfunction gauss() { return (rnd() + rnd() + rnd() + rnd() + rnd() + rnd() - 3) * 0.7071; }\nvar rRes = 0.965;\nvar cA = 2 * rRes * Math.cos(2 * Math.PI * 0.23), gA = 2.1 * (1 - rRes) * 2 * Math.sin(2 * Math.PI * 0.23);\nvar cB = 2 * rRes * Math.cos(2 * Math.PI * 0.37), gB = 3.6 * (1 - rRes) * 2 * Math.sin(2 * Math.PI * 0.37);\nvar r2 = rRes * rRes;\nvar yLp = 0, a1 = 0, a2 = 0, b1 = 0, b2 = 0;\nfunction nextSample() {\n  var dLp = gauss(), dA = gauss(), dB = gauss(), wN = gauss();\n  yLp = 0.85 * yLp + 0.15 * 6.8 * dLp;\n  var a0 = gA * dA + cA * a1 - r2 * a2; a2 = a1; a1 = a0;\n  var b0 = gB * dB + cB * b1 - r2 * b2; b2 = b1; b1 = b0;\n  return yLp + a0 + b0 + 1.15 * wN;\n}\nfor (var warm = 0; warm < 400; warm++) nextSample();\nvar win256 = new Float64Array(N);\nfor (var i = 0; i < N; i++) win256[i] = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (N - 1));\nvar prefixSpec = [];\nvar acc = new Float64Array(BINS);\nvar segBuf = new Float64Array(N);\nfor (var m = 0; m < MAX_M; m++) {\n  for (var i = 0; i < N; i++) segBuf[i] = nextSample() * win256[i];\n  var sp = fftMag(segBuf);\n  var row = new Float64Array(BINS);\n  for (var k = 0; k < BINS; k++) {\n    acc[k] += sp[k];\n    row[k] = acc[k] / (m + 1);\n  }\n  prefixSpec.push(row);\n}\nvar longBuf = new Float64Array(LONG_N);\nfor (var i = 0; i < LONG_N; i++) {\n  var wL = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / (LONG_N - 1));\n  longBuf[i] = nextSample() * wL;\n}\nvar longSpec = fftMag(longBuf);\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  var M = Math.round(lab.values.segments);\n  var showLong = !!lab.values.longDft;\n  var showMarkers = !!lab.values.markers;\n  var px0 = 52, py0 = 28, pw = 640, ph = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 5; g++) {\n    var gy = py0 + (ph * g) / 5;\n    ctx.beginPath(); ctx.moveTo(px0, gy); ctx.lineTo(px0 + pw, gy); ctx.stroke();\n  }\n  for (var vg = 0; vg <= 5; vg++) {\n    var gx = px0 + (pw * vg) / 5;\n    ctx.beginPath(); ctx.moveTo(gx, py0); ctx.lineTo(gx, py0 + ph); ctx.stroke();\n  }\n  if (showMarkers) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.lineWidth = 1.2;\n    var targets = [{ f: 0.23, name: '特征峰 A (0.23 / 36.8Hz)', col: '#38bdf8' }, { f: 0.37, name: '特征峰 B (0.37 / 59.2Hz)', col: '#ec4899' }];\n    for (var t = 0; t < targets.length; t++) {\n      var tx = px0 + (targets[t].f / 0.5) * pw;\n      ctx.strokeStyle = targets[t].col;\n      ctx.beginPath(); ctx.moveTo(tx, py0); ctx.lineTo(tx, py0 + ph); ctx.stroke();\n      ctx.fillStyle = targets[t].col;\n      ctx.font = '11px sans-serif';\n      ctx.fillText(targets[t].name, tx - 56, py0 + 14 + t * 15);\n    }\n    ctx.restore();\n  }\n  if (!showLong) {\n    if (M > 1) {\n      ctx.strokeStyle = 'rgba(248, 250, 252, 0.22)';\n      ctx.lineWidth = 1;\n      ctx.beginPath();\n      var s1 = prefixSpec[0];\n      for (var k = 0; k < BINS; k++) {\n        var x = px0 + (k / (BINS - 1)) * pw;\n        var y = py0 + ph - (Math.min(10, s1[k]) / 10) * ph;\n        if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n      }\n      ctx.stroke();\n    }\n    var cur = prefixSpec[M - 1];\n    ctx.beginPath();\n    ctx.moveTo(px0, py0 + ph);\n    for (var k = 0; k < BINS; k++) {\n      var x = px0 + (k / (BINS - 1)) * pw;\n      var y = py0 + ph - (Math.min(10, cur[k]) / 10) * ph;\n      ctx.lineTo(x, y);\n    }\n    ctx.lineTo(px0 + pw, py0 + ph);\n    ctx.closePath();\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n    ctx.fill();\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var k = 0; k < BINS; k++) {\n      var x = px0 + (k / (BINS - 1)) * pw;\n      var y = py0 + ph - (Math.min(10, cur[k]) / 10) * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  } else {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (var k = 0; k < LONG_BINS; k++) {\n      var x = px0 + (k / (LONG_BINS - 1)) * pw;\n      var y = py0 + ph - (Math.min(10, longSpec[k]) / 10) * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  if (!showLong) {\n    ctx.fillText('256 点分段平均幅值谱 (M = ' + M + ' 段, 共 129 频点)' + (M > 1 ? '  [灰线为 M=1 单段谱]' : ''), px0, 18);\n  } else {\n    ctx.fillText('单次 2048 点超长 DFT 幅值谱 (共 1025 频点) — 分辨率高 8 倍，但噪声并未下降！', px0, 18);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px monospace';\n  for (var yv = 0; yv <= 10; yv += 2) {\n    ctx.fillText(String(yv), px0 - 22, py0 + ph - (yv / 10) * ph + 4);\n  }\n  for (var f = 0; f <= 5; f++) {\n    var nf = (f * 0.1).toFixed(1);\n    var hz = f * 16;\n    ctx.fillText(nf + ' (' + hz + 'Hz)', px0 + (pw * f) / 5 - 24, py0 + ph + 16);\n  }\n  var noiseRatio = (1 / Math.sqrt(M)).toFixed(2);\n  var snrGain = Math.sqrt(M).toFixed(2);\n  if (!showLong) {\n    lab.setReadout('分段数 M = ' + M + '  |  总消耗样本: ' + (M * 256) + ' 点  |  频谱点数: 129  |  随机噪声衰减至: ' + (noiseRatio * 100).toFixed(0) + '% (降噪 ' + snrGain + ' 倍)');\n  } else {\n    lab.setReadout('模式: 2048点单次长DFT  |  总消耗样本: 2048 点 (相当于 M=8 段)  |  频谱点数: 1025  |  噪声波动与 M=1 相同，信息被更密频点稀释');\n  }\n}\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【拉长 DFT 不降噪】：把 256 点换成 2048 点做单次 DFT，只会把频谱拉长成 1025 点（频率分辨率更高），但多出来的信息被更密集的频率栅格等比例稀释，频谱曲线的噪声毛刺依然和原来一样剧烈。",
        "【只平均幅值，绝不平均相位】：分段求平均时必须先转为极坐标取模（Magnitude），将相位（Phase）直接丢弃；如果把复数频谱直接相加平均，随机相位会让有用信号也互相抵消。",
        "【平方根降噪律（1/√M）】：平均 M 个分段时，随机噪声的起伏按 √M 倍缩小——平均 100 段可将噪声降低 10 倍，想降低 100 倍则需要准备 10,000 段数据。",
        "【加窗是标配动作】：分段做 DFT 前先乘以汉明窗（Hamming Window），把每段两端平滑压低，可以有效防止截断边缘引入虚假的频谱泄漏。",
        "【分段平均优先于谱平滑】：在“分段平均”和“超长 DFT + 低通滤波平滑”这两种方案中，日常工程几乎总是选择分段平均——无需额外设计频域滤波器，只要多采数据就能同时换来高信噪比和足够分辨率。"
      ]
    }
  ]
});
