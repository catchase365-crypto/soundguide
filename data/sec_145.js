window.__BOOK_REGISTER_SECTION__("sec_145", {
  "title": "最优滤波器：滑动平均、匹配与维纳滤波 (Optimal Filters)",
  "intuition": "当信号与噪声在时域和频域完全混叠时，不存在绝对意义上的“完美滤波”，只有针对“最快阶跃响应”、“最高峰值检测”或“最大整体信噪比”这三种不同目标的最优妥协。",
  "blocks": [
    {
      "type": "concept",
      "heading": "频域重叠的困境：什么才叫“最优”？",
      "paragraphs": [
        "在工程实践中，我们最常遇到的一类棘手问题是：**从随机噪声中提取被淹没的目标波形**（例如图 17-7a 中埋藏在随机噪声里的指数衰减脉冲）。",
        "如果把这个问题转到频域去看，情况同样不容乐观：目标脉冲的能量主要集中在低频段，而随机噪声通常是**白噪声（White Noise）**——它在所有频率上都具有相同的幅度。信号频谱与噪声频谱在低频区严重重叠，这意味着传统的理想低通滤波器无法将它们一刀切开。",
        "既然无法彻底分离，真正的核心问题就变成了：**你究竟如何定义“最好（最优）”？** 在数字信号处理中，有三种经典滤波器分别在不同的数学指标下达到了“最优”。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "三大“最优”流派与维纳滤波器公式",
      "paragraphs": [
        "1. **滑动平均滤波器（Moving Average Filter）**：它的卷积核是一个幅度为 `1/N` 的矩形脉冲。它在**给定降噪水平下能提供最快的阶跃响应（最锐利的边缘）**，适合在平滑噪声的同时保留信号的突变特征。",
        "2. **匹配滤波器（Matched Filter）**：它的卷积核是将已知的目标信号**左右翻转**。这本质上是用卷积实现**互相关（Correlation）**运算——输出波形不一定长得像原信号，每个采样点的幅度代表当前局部信号与目标模板的匹配程度。它在**将信号峰值尽可能高地推离残余噪声（最大峰值噪声比）**方面是最优的，常用于雷达与脉冲检测。",
        "3. **维纳滤波器（Wiener Filter）**：由控制论创始人诺伯特·维纳提出，完全在频域中按“信号与噪声在各频率上的相对比例”来设计。在信号占主导的频段放行，在噪声占主导的频段衰减，最后通过自定义滤波器设计法转为时域卷积核。它在**最大化整段信号的总信噪比（信号功率 / 噪声功率）**方面是最优的。"
      ],
      "formula": {
        "expr": "H[f] = S[f]² / (S[f]² + N[f]²)",
        "explain": "H[f] 是维纳滤波器的频率响应（仅取幅度、相位全为零，即零相位）；S[f] 是目标信号的频谱幅度；N[f] 是噪声的频谱幅度。当某频点信号远强于噪声时 H[f] 趋近于 1，反之趋近于 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：三大最优滤波器时域对决",
      "instruction": "拖动“噪声强度”和“脉冲衰减时间常数 τ”滑块，或开关不同滤波器，观察左侧卷积核形状（对应原书图 17-8a）与右侧滤波输出（对应原书图 17-9）及下方指标读数的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "白噪声强度",
          "min": 0.05,
          "max": 1,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "tau",
          "label": "脉冲宽度 τ",
          "min": 5,
          "max": 22,
          "step": 1,
          "value": 11,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "showRaw",
          "label": "显示原始含噪信号",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showMA",
          "label": "滑动平均 (绿)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showMatched",
          "label": "匹配滤波 (粉)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showWiener",
          "label": "维纳滤波 (蓝)",
          "value": true
        }
      ],
      "jsCode": "function mulberry32(a) {\n  return function() {\n    var t = a += 0x6D2B79F5;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var noiseLevel = lab.values.noiseLevel;\n  var tau = lab.values.tau;\n  var showRaw = lab.values.showRaw;\n  var showMA = lab.values.showMA;\n  var showMatched = lab.values.showMatched;\n  var showWiener = lab.values.showWiener;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var N = 220;\n  var n0 = 80;\n  var s = new Array(N);\n  var w = new Array(N);\n  var x = new Array(N);\n  var rng = mulberry32(1337);\n  var sigma = noiseLevel * 0.38;\n\n  for (var n = 0; n < N; n++) {\n    s[n] = (n >= n0) ? Math.exp(-(n - n0) / tau) : 0;\n    var uSum = rng() + rng() + rng() + rng() + rng() + rng() - 3;\n    w[n] = uSum * Math.SQRT2 * sigma;\n    x[n] = s[n] + w[n];\n  }\n\n  var K = 51;\n  var kc = 25;\n  var hMA = new Array(K);\n  var hMatch = new Array(K);\n  var hWiener = new Array(K);\n\n  var maWidth = Math.max(3, Math.min(41, Math.round(tau * 1.4)));\n  if (maWidth % 2 === 0) maWidth += 1;\n  var maHalf = (maWidth - 1) / 2;\n  for (var k = 0; k < K; k++) {\n    hMA[k] = (Math.abs(k - kc) <= maHalf) ? (1 / maWidth) : 0;\n  }\n\n  var kEnd = 38;\n  var matchSum = 0;\n  for (var k = 0; k < K; k++) {\n    if (k <= kEnd && k >= kEnd - Math.min(38, Math.round(tau * 3.5))) {\n      hMatch[k] = Math.exp(-(kEnd - k) / tau);\n    } else {\n      hMatch[k] = 0;\n    }\n    matchSum += hMatch[k];\n  }\n  for (var k = 0; k < K; k++) hMatch[k] /= (matchSum || 1);\n\n  var M_fft = 128;\n  var S2 = new Array(65);\n  for (var f = 0; f <= 64; f++) {\n    var re = 0, im = 0;\n    for (var n = 0; n < M_fft; n++) {\n      var sn = Math.exp(-n / tau);\n      var ang = 2 * Math.PI * f * n / M_fft;\n      re += sn * Math.cos(ang);\n      im -= sn * Math.sin(ang);\n    }\n    S2[f] = re * re + im * im;\n  }\n  var N2 = M_fft * sigma * sigma;\n  var Hfreq = new Array(65);\n  for (var f = 0; f <= 64; f++) {\n    Hfreq[f] = S2[f] / (S2[f] + N2 + 1e-9);\n  }\n  for (var k = 0; k < K; k++) {\n    var d = k - kc;\n    var acc = Hfreq[0];\n    for (var f = 1; f < 64; f++) {\n      acc += 2 * Hfreq[f] * Math.cos(2 * Math.PI * f * d / M_fft);\n    }\n    acc += Hfreq[64] * Math.cos(Math.PI * d);\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * k / (K - 1));\n    hWiener[k] = (acc / M_fft) * win;\n  }\n\n  function convolveAndStats(h) {\n    var y = new Array(N);\n    var ysPow = 0, ywPow = 0;\n    var noiseSq = 0, noiseCnt = 0;\n    var peak = -999;\n    for (var n = 0; n < N; n++) {\n      var sumX = 0, sumS = 0, sumW = 0;\n      for (var k = 0; k < K; k++) {\n        var idx = n - k;\n        if (idx >= 0 && idx < N) {\n          sumX += h[k] * x[idx];\n          sumS += h[k] * s[idx];\n          sumW += h[k] * w[idx];\n        }\n      }\n      y[n] = sumX;\n      if (n >= 52 && n < 78) {\n        noiseSq += sumX * sumX;\n        noiseCnt++;\n      }\n      if (n >= 52) {\n        ysPow += sumS * sumS;\n        ywPow += sumW * sumW;\n      }\n      if (n >= 75 && n <= 160 && sumX > peak) peak = sumX;\n    }\n    var nRms = Math.sqrt(noiseSq / Math.max(1, noiseCnt));\n    var peakRatio = peak / (nRms + 1e-6);\n    var snrDb = 10 * Math.log(ysPow / (ywPow + 1e-9)) / Math.LN10;\n    return { y: y, peakRatio: peakRatio, snrDb: snrDb };\n  }\n\n  var resMA = convolveAndStats(hMA);\n  var resMatch = convolveAndStats(hMatch);\n  var resWiener = convolveAndStats(hWiener);\n\n  function drawBox(px, py, pw, ph, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(px, py, pw, ph);\n    for (var g = 1; g < 4; g++) {\n      var gy = py + (ph * g) / 4;\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      var gx = px + (pw * g) / 4;\n      ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n    }\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(title, px + 6, py + 14);\n  }\n\n  var lx = 16, ly = 18, lw = 210, lh = 204;\n  drawBox(lx, ly, lw, lh, 'a. 滤波器卷积核 h[k] (0~50)');\n  var kMaxY = 0.24;\n  function mapKY(v) { return ly + lh - 12 - (v / kMaxY) * (lh - 34); }\n  function mapKX(k) { return lx + 8 + (k / (K - 1)) * (lw - 16); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(lx + 6, mapKY(0)); ctx.lineTo(lx + lw - 6, mapKY(0)); ctx.stroke();\n\n  function plotKernel(h, color, lwLine) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lwLine;\n    ctx.beginPath();\n    for (var k = 0; k < K; k++) {\n      var px = mapKX(k), py = mapKY(h[k]);\n      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  if (showMA) plotKernel(hMA, '#10b981', 2);\n  if (showMatched) plotKernel(hMatch, '#ec4899', 2);\n  if (showWiener) plotKernel(hWiener, '#38bdf8', 2.2);\n\n  var rx = 244, ry = 18, rw = 460, rh = 204;\n  drawBox(rx, ry, rw, rh, 'b. 滤波输出对比 (脉冲起点 n=80)');\n  var yMin = -0.5, yMax = 1.35;\n  function mapSY(v) { return ry + rh - 10 - ((v - yMin) / (yMax - yMin)) * (rh - 26); }\n  function mapSX(n) { return rx + 8 + (n / (N - 1)) * (rw - 16); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(rx + 6, mapSY(0)); ctx.lineTo(rx + rw - 6, mapSY(0)); ctx.stroke();\n\n  function plotSig(arr, color, lwLine) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lwLine;\n    ctx.beginPath();\n    for (var n = 0; n < N; n++) {\n      var px = mapSX(n), py = mapSY(arr[n]);\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  if (showRaw) plotSig(x, 'rgba(248, 250, 252, 0.28)', 1.1);\n  if (showMA) plotSig(resMA.y, '#10b981', 1.8);\n  if (showMatched) plotSig(resMatch.y, '#ec4899', 1.8);\n  if (showWiener) plotSig(resWiener.y, '#38bdf8', 2.1);\n\n  var parts = [];\n  if (showMA) parts.push('滑动平均: 峰值/噪声=' + resMA.peakRatio.toFixed(2) + ', SNR=' + resMA.snrDb.toFixed(1) + 'dB');\n  if (showMatched) parts.push('匹配滤波: 峰值/噪声=' + resMatch.peakRatio.toFixed(2) + '(最高!), SNR=' + resMatch.snrDb.toFixed(1) + 'dB');\n  if (showWiener) parts.push('维纳滤波: 峰值/噪声=' + resWiener.peakRatio.toFixed(2) + ', SNR=' + resWiener.snrDb.toFixed(1) + 'dB(最优!)');\n  if (parts.length === 0) parts.push('请至少开启一个滤波器以查看对比指标');\n  lab.setReadout(parts.join('  |  '));\n});"
    },
    {
      "type": "lab",
      "heading": "交互实验二：维纳滤波频域雕刻与实时听觉降噪",
      "instruction": "拖动“信号带宽”与“白噪声强度”，观察维纳增益曲线 H[f] 如何自动避让高噪声频段；点击“播放对比音频”并切换降噪开关，用耳朵直接对比。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "信号有效带宽",
          "min": 250,
          "max": 2200,
          "step": 50,
          "value": 650,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "白噪声强度",
          "min": 0.05,
          "max": 1,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "wienerOn",
          "label": "开启维纳滤波降噪",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audio = {\n  init: false,\n  ctx: null,\n  osc: null,\n  sigFilter: null,\n  sigGain: null,\n  noiseSrc: null,\n  noiseGain: null,\n  dryGain: null,\n  wetGain: null,\n  convolver: null,\n  masterGain: null,\n  lastCutoff: -1,\n  lastNoise: -1\n};\n\nfunction buildWienerBuffer(actx, cutoff, noiseAmp) {\n  var len = 129;\n  var half = 64;\n  var buf = actx.createBuffer(1, len, actx.sampleRate);\n  var data = buf.getChannelData(0);\n  var N_dft = 128;\n  var H = new Array(65);\n  var Nval = noiseAmp * 0.65;\n  var N2 = Nval * Nval;\n  for (var k = 0; k <= 64; k++) {\n    var f = k * actx.sampleRate / N_dft;\n    var S = 1 / (1 + Math.pow(f / cutoff, 2));\n    var S2 = S * S;\n    H[k] = S2 / (S2 + N2 + 1e-9);\n  }\n  for (var n = 0; n < len; n++) {\n    var d = n - half;\n    var acc = H[0];\n    for (var k = 1; k < 64; k++) {\n      acc += 2 * H[k] * Math.cos(2 * Math.PI * k * d / N_dft);\n    }\n    acc += H[64] * Math.cos(Math.PI * d);\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (len - 1));\n    data[n] = (acc / N_dft) * win;\n  }\n  return buf;\n}\n\nfunction ensureAudio() {\n  var actx = lab.getAudioContext();\n  if (actx.state === 'suspended') actx.resume();\n  if (audio.init) return;\n  audio.ctx = actx;\n\n  audio.osc = actx.createOscillator();\n  audio.osc.type = 'sawtooth';\n  audio.osc.frequency.value = 135;\n\n  audio.sigFilter = actx.createBiquadFilter();\n  audio.sigFilter.type = 'lowpass';\n  audio.sigFilter.Q.value = 0.707;\n\n  audio.sigGain = actx.createGain();\n  audio.sigGain.gain.value = 0.28;\n\n  var nLen = actx.sampleRate * 2;\n  var nBuf = actx.createBuffer(1, nLen, actx.sampleRate);\n  var nData = nBuf.getChannelData(0);\n  for (var i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;\n  audio.noiseSrc = actx.createBufferSource();\n  audio.noiseSrc.buffer = nBuf;\n  audio.noiseSrc.loop = true;\n\n  audio.noiseGain = actx.createGain();\n  var sumNode = actx.createGain();\n\n  audio.osc.connect(audio.sigFilter);\n  audio.sigFilter.connect(audio.sigGain);\n  audio.sigGain.connect(sumNode);\n  audio.noiseSrc.connect(audio.noiseGain);\n  audio.noiseGain.connect(sumNode);\n\n  audio.dryGain = actx.createGain();\n  audio.wetGain = actx.createGain();\n  audio.convolver = actx.createConvolver();\n  audio.convolver.normalize = false;\n  audio.masterGain = actx.createGain();\n  audio.masterGain.gain.value = 0;\n\n  sumNode.connect(audio.dryGain);\n  sumNode.connect(audio.convolver);\n  audio.convolver.connect(audio.wetGain);\n  audio.dryGain.connect(audio.masterGain);\n  audio.wetGain.connect(audio.masterGain);\n  audio.masterGain.connect(actx.destination);\n\n  audio.osc.start();\n  audio.noiseSrc.start();\n  audio.init = true;\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var cutoff = lab.values.cutoff;\n  var noiseAmp = lab.values.noiseAmp;\n  var wienerOn = lab.values.wienerOn;\n  var play = lab.values.play;\n\n  if (play) {\n    ensureAudio();\n    var now = audio.ctx.currentTime;\n    audio.sigFilter.frequency.setTargetAtTime(cutoff, now, 0.02);\n    audio.noiseGain.gain.setTargetAtTime(noiseAmp * 0.16, now, 0.02);\n    if (audio.lastCutoff !== cutoff || audio.lastNoise !== noiseAmp) {\n      audio.convolver.buffer = buildWienerBuffer(audio.ctx, cutoff, noiseAmp);\n      audio.lastCutoff = cutoff;\n      audio.lastNoise = noiseAmp;\n    }\n    audio.dryGain.gain.setTargetAtTime(wienerOn ? 0 : 1, now, 0.03);\n    audio.wetGain.gain.setTargetAtTime(wienerOn ? 1 : 0, now, 0.03);\n    audio.masterGain.gain.setTargetAtTime(0.55, now, 0.03);\n  } else if (audio.init) {\n    audio.masterGain.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.03);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  function drawGrid(px, py, pw, ph, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(px, py, pw, ph);\n    for (var g = 1; g < 4; g++) {\n      var gy = py + (ph * g) / 4;\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      var gx = px + (pw * g) / 4;\n      ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n    }\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(title, px + 8, py + 14);\n  }\n\n  var lx = 16, ly = 18, lw = 335, lh = 204;\n  drawGrid(lx, ly, lw, lh, 'a. 频域特性 (0~4000 Hz): 信号 S / 噪声 N / 增益 H[f]');\n\n  var bins = 128;\n  var fMax = 4000;\n  var Nval = noiseAmp * 0.65;\n  var N2 = Nval * Nval;\n  var crossFreq = -1;\n\n  function mapFX(f) { return lx + 8 + (f / fMax) * (lw - 16); }\n  function mapFY(v) { return ly + lh - 10 - (v / 1.15) * (lh - 32); }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= bins; i++) {\n    var f = (i / bins) * fMax;\n    var S = 1 / (1 + Math.pow(f / cutoff, 2));\n    if (crossFreq < 0 && S <= Nval) crossFreq = f;\n    var px = mapFX(f), py = mapFY(S);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  ctx.moveTo(mapFX(0), mapFY(Nval));\n  ctx.lineTo(mapFX(fMax), mapFY(Nval));\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i <= bins; i++) {\n    var f = (i / bins) * fMax;\n    var S = 1 / (1 + Math.pow(f / cutoff, 2));\n    var Hval = (S * S) / (S * S + N2 + 1e-9);\n    var px = mapFX(f), py = mapFY(Hval);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981'; ctx.fillText('S[f] 信号', lx + 255, ly + 36);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('N[f] 噪声', lx + 255, ly + 52);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('H[f] 维纳', lx + 255, ly + 68);\n\n  var rx = 368, ry = 18, rw = 336, rh = 204;\n  drawGrid(rx, ry, rw, rh, wienerOn ? 'b. 时域效果: 含噪输入(灰) vs 维纳输出(蓝)' : 'b. 时域效果: 原始含噪信号 (维纳滤波已关闭)');\n\n  var K_vis = 65;\n  var kc_vis = 32;\n  var hVis = new Array(K_vis);\n  var H_vis = new Array(33);\n  for (var k = 0; k <= 32; k++) {\n    var f = k * 8000 / 64;\n    var S = 1 / (1 + Math.pow(f / cutoff, 2));\n    H_vis[k] = (S * S) / (S * S + N2 + 1e-9);\n  }\n  for (var k = 0; k < K_vis; k++) {\n    var d = k - kc_vis;\n    var acc = H_vis[0];\n    for (var k2 = 1; k2 < 32; k2++) acc += 2 * H_vis[k2] * Math.cos(2 * Math.PI * k2 * d / 64);\n    acc += H_vis[32] * Math.cos(Math.PI * d);\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * k / (K_vis - 1));\n    hVis[k] = (acc / 64) * win;\n  }\n\n  var T_samples = 160;\n  var rawSig = new Array(T_samples);\n  var seed = 42;\n  for (var n = 0; n < T_samples; n++) {\n    seed = (seed * 1664525 + 1013904223) >>> 0;\n    var randN = (seed / 4294967296 - 0.5) * 2;\n    var tSec = n / 8000;\n    var sig = 0;\n    for (var m = 1; m <= 12; m++) {\n      var fHarm = 135 * m;\n      var att = 1 / (1 + Math.pow(fHarm / cutoff, 2));\n      sig += (0.55 / m) * att * Math.sin(2 * Math.PI * fHarm * tSec);\n    }\n    rawSig[n] = sig + randN * noiseAmp * 0.55;\n  }\n\n  var filtSig = new Array(T_samples);\n  for (var n = 0; n < T_samples; n++) {\n    var acc = 0;\n    for (var k = 0; k < K_vis; k++) {\n      var idx = (n - k + kc_vis + T_samples) % T_samples;\n      acc += hVis[k] * rawSig[idx];\n    }\n    filtSig[n] = acc;\n  }\n\n  function mapTX(n) { return rx + 8 + (n / (T_samples - 1)) * (rw - 16); }\n  function mapTY(v) { return ry + rh / 2 + 8 - (v / 1.1) * (rh * 0.42); }\n\n  ctx.strokeStyle = wienerOn ? 'rgba(248, 250, 252, 0.3)' : '#f59e0b';\n  ctx.lineWidth = wienerOn ? 1.2 : 1.8;\n  ctx.beginPath();\n  for (var n = 0; n < T_samples; n++) {\n    var px = mapTX(n), py = mapTY(rawSig[n]);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (wienerOn) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var n = 0; n < T_samples; n++) {\n      var px = mapTX(n), py = mapTY(filtSig[n]);\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  var crossStr = crossFreq > 0 ? Math.round(crossFreq) + ' Hz' : '> 4000 Hz';\n  lab.setReadout('状态: ' + (wienerOn ? '维纳滤波开启' : '直通含噪信号') + '  |  信噪交点(H=0.5): ' + crossStr + '  |  直流增益 H[0]: ' + (1 / (1 + N2)).toFixed(2));\n});"
    },
    {
      "type": "concept",
      "heading": "走下神坛的“最优”：工程中为何常常弃用它们？",
      "paragraphs": [
        "虽然滑动平均、匹配滤波与维纳滤波在数学上极为优雅，但 Steven W. Smith 特别提醒工程师：**千万不要一听到“最优（Optimal）”二字就停止思考**。在实际工程中，放弃使用所谓“最优滤波器”往往有三大现实理由：",
        "**第一，效果差距令人失望**。当信号与噪声的频谱本身存在重叠时，三大最优滤波器的输出波形（见实验一右侧）其实非常相似。如果不事先告知优化目标，单凭肉眼几乎看不出区别。为这点微小的性能提升去增加程序复杂度、设计成本与算力开销，往往得不偿失。",
        "**第二，数学局部最优 ≠ 业务整体最优**。维纳与匹配滤波器的形态完全被问题特征“锁死”，无法像窗函数 sinc 或滑动平均那样随心所欲地微调截止特性。更重要的是，单一指标最优并不等同于最终问题得到最优解——尤其当结果要由**人类观察者**来判读时。例如，生物医学工程师可以用维纳滤波器把心电图（ECG）的信噪比推到数学极限，但这绝不意味着它也最大化了心脏科医生通过波形识别异常心率的能力。",
        "**第三，卷积计算代价过于高昂**。维纳滤波器与匹配滤波器都必须通过**卷积**来实现，执行速度极慢。即便使用第 18 章即将介绍的 FFT 快速卷积，长核运算的耗时依然可能令人难以忍受。相比之下，滑动平均以及其他**递归滤波器（Recursive Filters）**的执行速度要快上几个数量级，在绝大多数场景下完全够用。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "没有“全能最优”：需要最快阶跃/边缘响应选【滑动平均】；需要在噪声中探测已知形状脉冲的峰值位置选【匹配滤波】；需要最大化全局功率信噪比选【维纳滤波】。",
        "维纳滤波本质是频域“按信噪比加权”的零相位衰减器：信号占比越高增益越接近 1，信噪相等处增益恰好为 0.5。",
        "匹配滤波器改变波形形状：它输出的是互相关匹配度而非还原波形，因此使用前提是必须事先精确知道目标信号的形状。",
        "实战避坑法则：面对频谱重叠问题，先用高速的滑动平均或递归滤波器（IIR）基准测试；只有当明确需要极致单指标（如雷达回波峰值检测）且算力充足时，才动用卷积类的匹配或维纳滤波器。"
      ]
    }
  ]
});
