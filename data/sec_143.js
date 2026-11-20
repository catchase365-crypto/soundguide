window.__BOOK_REGISTER_SECTION__("sec_143", {
  "title": "任意频率响应滤波器设计 (Arbitrary Frequency Response)",
  "intuition": "把心中任何形状的频率响应曲线直接写进数组，用 IFFT 变出时域脉冲，再经“移位、截断、加窗”三步驯服时域混叠，就能造出模拟电路绝对做不出来的任意 FIR 数字滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从数学公式到数字数组：用 FFT 代替微积分",
      "paragraphs": [
        "在上一章的加窗 Sinc 滤波器中，理想的低通频率响应和时域滤波器核都是用**数学公式**写出来的，两者之间靠手推傅里叶变换积分来转换。而这一节要做的事情极具颠覆性：我们把理想频率响应直接表示成一个**数字数组**，想画成什么奇形怪状都可以（哪怕是不规则锯齿、多峰凹槽），然后用计算机运行 **Inverse FFT（逆快速傅里叶变换）** 直接算出对应的时域信号。",
        "为了定义这个任意频率响应，通常在 `0` 到 `0.5` 倍采样率（奈奎斯特频率）之间取 `513` 个采样点（对应 `1024` 点 FFT，实数信号共轭对称）。除了我们直观看到的**幅度（Magnitude）数组**外，还必须有一个同样长度的**相位（Phase）数组**（如果不需要相移，就全部填 `0`；也可以填入任意期望的相位曲线）。",
        "有一个极其关键的边界死规定：**相位数组的第一个点（索引 `0`，直流分量）和最后一个点（索引 `512`，奈奎斯特频率）的值必须等于 `0`（或 `2π` 的整数倍）**。因为这两个频率点的虚部在实信号频谱中必须为零；当然，你也可以直接以直角坐标（实部数组 + 虚部数组）来定义频率响应，转换后交给 Inverse FFT 即可得到 `0` 到 `1023` 共 `1024` 个点的时域脉冲响应。"
      ],
      "formula": {
        "expr": "X_real[k] = Mag[k] * cos(Phase[k]),   X_imag[k] = Mag[k] * sin(Phase[k])",
        "explain": "将期望的幅度数组 Mag[k] 与相位数组 Phase[k]（其中 Phase[0] = Phase[N/2] = 0）转为直角坐标复数谱，再送入 Inverse FFT 即可得到 N 点时域脉冲响应。"
      }
    },
    {
      "type": "concept",
      "heading": "四步造核流程与“别删尾部零点”警示",
      "paragraphs": [
        "直接由 Inverse FFT 算出来的 `1024` 点脉冲响应（如原书图 17-1b 所示），主峰死死贴在索引 `0` 处，负半轴的尾巴绕回到了数组最右端（索引 `1023` 附近）。它还存在**时域混叠**，绝对不能直接拿来当卷积核使用！",
        "我们需要像加窗 Sinc 滤波器那样，通过原书 Table 17-1 给出的经典三板斧把它改造成可用的 `M + 1` 点滤波器核（例如 `M = 40`，共 `41` 个点）：**① 循环右移 `M/2` 点**，把主峰搬到数组索引 `M/2` 的正中央；**② 截断**，只保留索引 `0` 到 `M` 的采样点；**③ 加窗**，乘以 Hamming 或 Blackman 窗让两端平滑衰减到零。",
        "特别提醒一个工程上极易犯的错误：加窗之后的滤波器核，靠近两端的几个点数值非常小，在图上画出来几乎跟 `0` 贴在一起——**千万不要自作聪明把这些“看起来像零”的点删掉！** 它们虽然幅值极小，却精准维持着通带平坦度与阻带衰减。最后一步是**验算**：在 `M + 1` 点的核后面补上大量零（例如 `41` 点核 + `983` 个零 = `1024` 点），再做一次正向 FFT，就能高分辨率地看到滤波器**实际产生**的频率响应。"
      ],
      "formula": {
        "expr": "h[i] = h_aliased[(i - M/2) mod N] * (0.54 - 0.46 * cos(2π * i / M)),   0 ≤ i ≤ M",
        "explain": "Table 17-1 的核心算法：将 N 点 IFFT 脉冲响应循环右移 M/2 个点使之居中，截断至 M+1 个点，并乘以 Hamming 窗函数（0.54 - 0.46 cos）完成平滑。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：任意曲线造核与滤波器长度 M 的魔力",
      "instruction": "拖动“滤波器阶数 M”和“主峰幅度”滑块，或开关 Hamming 窗，实时观察左图时域核与右图实际频率响应的逼近效果；点击播放按钮可试听白噪声穿过该自定义滤波器后的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "mLen",
          "label": "滤波器阶数 M (核长 M+1)",
          "min": 8,
          "max": 100,
          "step": 2,
          "value": 40,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "peakGain",
          "label": "0.2fs 处主峰幅度",
          "min": 0.4,
          "max": 2.8,
          "step": 0.1,
          "value": 2.4,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "useWin",
          "label": "启用 Hamming 加窗 (关闭则为矩形截断)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听滤波后的白噪声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var N = 512;\nvar half = N / 2;\nvar audioSrc = null;\nvar audioTimer = null;\nvar randPhases = null;\n\nfunction fft(re, im, invert) {\n  var n = re.length;\n  for (var i = 1, j = 0; i < n; i++) {\n    var bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      var tr = re[i]; re[i] = re[j]; re[j] = tr;\n      var ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (var len = 2; len <= n; len <<= 1) {\n    var ang = 2 * Math.PI / len * (invert ? 1 : -1);\n    var wlenR = Math.cos(ang), wlenI = Math.sin(ang);\n    for (var i = 0; i < n; i += len) {\n      var wR = 1, wI = 0;\n      for (var j = 0; j < len / 2; j++) {\n        var uR = re[i + j], uI = im[i + j];\n        var vR = re[i + j + len / 2] * wR - im[i + j + len / 2] * wI;\n        var vI = re[i + j + len / 2] * wI + im[i + j + len / 2] * wR;\n        re[i + j] = uR + vR;\n        im[i + j] = uI + vI;\n        re[i + j + len / 2] = uR - vR;\n        im[i + j + len / 2] = uI - vI;\n        var nextR = wR * wlenR - wI * wlenI;\n        wI = wR * wlenI + wI * wlenR;\n        wR = nextR;\n      }\n    }\n  }\n  if (invert) {\n    for (var i = 0; i < n; i++) {\n      re[i] /= n;\n      im[i] /= n;\n    }\n  }\n}\n\nfunction getDesired(f, peakGain) {\n  if (f < 0.05) {\n    return 0.65 - 0.45 * Math.sin((f / 0.05) * Math.PI);\n  } else if (f < 0.11) {\n    var t = (f - 0.05) / 0.06;\n    return 0.65 + 0.25 * Math.sin(t * Math.PI) - 0.35 * t * t;\n  } else if (f < 0.20) {\n    var t = (f - 0.11) / 0.09;\n    return 0.30 + (peakGain - 0.30) * Math.pow(t, 1.3);\n  } else if (f < 0.22) {\n    var t = (f - 0.20) / 0.02;\n    return peakGain - (peakGain - 1.05) * t;\n  } else if (f < 0.38) {\n    var t = (f - 0.22) / 0.16;\n    return 1.05 + 0.12 * Math.sin(t * Math.PI);\n  } else {\n    var t = (f - 0.38) / 0.12;\n    return 0.12 + 0.93 * Math.pow(1 - t, 1.6);\n  }\n}\n\nfunction stopAudio() {\n  if (audioTimer) {\n    clearTimeout(audioTimer);\n    audioTimer = null;\n  }\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nfunction playColoredNoise(actualMag) {\n  if (!lab.values.play) return;\n  try {\n    var ctx = lab.getAudioContext();\n    if (!ctx || ctx.state === 'closed') return;\n    if (ctx.state === 'suspended') ctx.resume();\n    var sr = ctx.sampleRate;\n    var nAud = 32768;\n    var maxBin = Math.min(nAud / 2 - 1, Math.floor(5500 * nAud / sr));\n    if (!randPhases || randPhases.length !== nAud / 2) {\n      randPhases = new Float32Array(nAud / 2);\n      for (var p = 0; p < randPhases.length; p++) randPhases[p] = Math.random() * 2 * Math.PI;\n    }\n    var aRe = new Float32Array(nAud);\n    var aIm = new Float32Array(nAud);\n    for (var k = 2; k <= maxBin; k++) {\n      var freqHz = k * sr / nAud;\n      var fNorm = freqHz / 11000;\n      if (fNorm > 0.5) fNorm = 0.5;\n      var idx = fNorm * N;\n      var i0 = Math.floor(idx);\n      var frac = idx - i0;\n      var g0 = actualMag[Math.min(half, i0)];\n      var g1 = actualMag[Math.min(half, i0 + 1)];\n      var gain = g0 + (g1 - g0) * frac;\n      var ph = randPhases[k];\n      aRe[k] = gain * Math.cos(ph);\n      aIm[k] = gain * Math.sin(ph);\n      aRe[nAud - k] = aRe[k];\n      aIm[nAud - k] = -aIm[k];\n    }\n    fft(aRe, aIm, true);\n    var buf = ctx.createBuffer(1, nAud, sr);\n    var ch = buf.getChannelData(0);\n    var scale = 58.0;\n    for (var i = 0; i < nAud; i++) {\n      var s = aRe[i] * scale;\n      if (s > 0.9) s = 0.9;\n      if (s < -0.9) s = -0.9;\n      ch[i] = s;\n    }\n    if (audioSrc) {\n      try { audioSrc.stop(); } catch (e) {}\n      try { audioSrc.disconnect(); } catch (e) {}\n    }\n    var src = ctx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    var gNode = ctx.createGain();\n    gNode.gain.value = 0.35;\n    src.connect(gNode);\n    gNode.connect(ctx.destination);\n    src.start(0);\n    audioSrc = src;\n  } catch (e) {}\n}\n\nlab.onUpdate(function() {\n  var M = Math.round(lab.values.mLen);\n  var peakGain = lab.values.peakGain;\n  var useWin = lab.values.useWin;\n\n  var desired = new Float32Array(half + 1);\n  var re = new Float32Array(N);\n  var im = new Float32Array(N);\n  for (var k = 0; k <= half; k++) {\n    var f = (k / N);\n    var m = getDesired(f, peakGain);\n    desired[k] = m;\n    re[k] = m;\n    if (k > 0 && k < half) re[N - k] = m;\n  }\n\n  fft(re, im, true);\n\n  var shifted = new Float32Array(N);\n  var halfM = Math.floor(M / 2);\n  for (var i = 0; i < N; i++) {\n    var idx = (i + halfM) % N;\n    shifted[idx] = re[i];\n  }\n\n  var kernel = new Float32Array(M + 1);\n  var testRe = new Float32Array(N);\n  var testIm = new Float32Array(N);\n  for (var i = 0; i <= M; i++) {\n    var w = useWin ? (0.54 - 0.46 * Math.cos(2 * Math.PI * i / M)) : 1.0;\n    kernel[i] = shifted[i] * w;\n    testRe[i] = kernel[i];\n  }\n\n  fft(testRe, testIm, false);\n\n  var actualMag = new Float32Array(half + 1);\n  var sqErr = 0;\n  for (var k = 0; k <= half; k++) {\n    actualMag[k] = Math.hypot(testRe[k], testIm[k]);\n    var d = actualMag[k] - desired[k];\n    sqErr += d * d;\n  }\n  var rmse = Math.sqrt(sqErr / (half + 1));\n\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var lX = 42, lY = 26, lW = 290, lH = 182;\n  var rX = 382, rY = 26, rW = 318, rH = 182;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var y = lY + (lH * g / 4);\n    ctx.beginPath(); ctx.moveTo(lX, y); ctx.lineTo(lX + lW, y); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rX, y); ctx.lineTo(rX + rW, y); ctx.stroke();\n  }\n  for (var g = 0; g <= 5; g++) {\n    var xr = rX + (rW * g / 5);\n    ctx.beginPath(); ctx.moveTo(xr, rY); ctx.lineTo(xr, rY + rH); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域滤波器核 h[n] (长度 ' + (M + 1) + ' 点)', lX, 16);\n  ctx.fillText('频域：理想曲线 (虚线) vs 实际响应 (实线)', rX, 16);\n\n  var kMax = 1.2, kMin = -0.4;\n  var zeroY = lY + lH * (kMax / (kMax - kMin));\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lX, zeroY); ctx.lineTo(lX + lW, zeroY); ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.fillStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  for (var i = 0; i <= M; i++) {\n    var px = lX + (i / M) * lW;\n    var val = kernel[i];\n    var py = lY + lH * ((kMax - val) / (kMax - kMin));\n    if (py < lY) py = lY;\n    if (py > lY + lH) py = lY + lH;\n    ctx.beginPath();\n    ctx.moveTo(px, zeroY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.arc(px, py, M > 60 ? 1.8 : 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px monospace';\n  ctx.fillText('0', lX - 3, lY + lH + 14);\n  ctx.fillText('M/2=' + halfM, lX + lW / 2 - 16, lY + lH + 14);\n  ctx.fillText('M=' + M, lX + lW - 24, lY + lH + 14);\n\n  var maxMag = 3.0;\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var k = 0; k <= half; k++) {\n    var px = rX + (k / half) * rW;\n    var py = rY + rH * (1 - Math.min(maxMag, desired[k]) / maxMag);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var k = 0; k <= half; k++) {\n    var px = rX + (k / half) * rW;\n    var py = rY + rH * (1 - Math.min(maxMag, actualMag[k]) / maxMag);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (var g = 0; g <= 5; g++) {\n    ctx.fillText((g * 0.1).toFixed(1), rX + rW * g / 5 - 8, rY + rH + 14);\n  }\n  ctx.fillText('0', rX - 14, rY + rH + 3);\n  ctx.fillText('1.5', rX - 22, rY + rH / 2 + 3);\n  ctx.fillText('3.0', rX - 22, rY + 5);\n\n  lab.setReadout('核长: ' + (M + 1) + ' 点 | 窗函数: ' + (useWin ? 'Hamming 窗' : '矩形窗(易出现吉布斯振铃)') + ' | 频域均方根误差 RMSE: ' + rmse.toFixed(4));\n\n  if (lab.values.play) {\n    if (!audioSrc) {\n      playColoredNoise(actualMag);\n    } else {\n      if (audioTimer) clearTimeout(audioTimer);\n      audioTimer = setTimeout(function() { playColoredNoise(actualMag); }, 85);\n    }\n  } else {\n    stopAudio();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "揭秘隐秘理论陷阱：采样点之间发生了什么？",
      "paragraphs": [
        "看到这里，爱思考的读者一定会问一个直击本质的问题：**既然 `1024` 点脉冲响应（图 17-1b）本身就是我们期望频谱的严格 Inverse DFT，为什么不能直接拿它当滤波器核去卷积信号，非要费劲移位、截断、加窗（还把频率曲线弄模糊了）呢？**",
        "答案藏在**“你指定的那些离散频域采样点之间”**。如果在 `0` 到 `0.5` 之间用无限个点画出一条连续的理想曲线，做逆离散时间傅里叶变换（Inverse DTFT）得到的时域脉冲响应一定是**无限长**的。但计算机只能用有限的 `N` 个时域点（对应 `N/2 + 1` 个频域点）来盛放它，于是无限长的尾巴只能卷绕折叠进这 `N` 个点里——这就是**时域混叠（Time-domain Aliasing）**。",
        "只要你把未加窗的 `N` 点 IFFT 结果直接补上大量零再做高分辨率 FFT 验算，就会看到一幅“表里不一”的惨状：在最初定义的那 `N/2 + 1` 个离散频点上，它分毫不差地完美命中目标；但在**频点与频点之间的空白处，曲线会发生灾难性的剧烈震荡**！而“移位 + 截断 + 加窗”正是用牺牲微小的锐度为代价，强力压制时域混叠，换取频域采样点之间**平滑、可控**的过渡曲线。"
      ],
      "formula": {
        "expr": "H_continuous(f) = DFT_zeropad( h_aliased[0..N-1], 0, ..., 0 )",
        "explain": "对未加窗的 N 点混叠脉冲补零做高分辨率 DFT，可窥见原始 N/2+1 个频域采样点之间的真实曲线形态——未加窗时点间剧烈震荡，加窗后则变得平滑稳定。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：直击“频点之间剧烈震荡”与混叠消除",
      "instruction": "观察右图中的琥珀色圆点（预设的离散频域采样点）：未加窗的粉色曲线虽然精准穿过每个圆点，却在点间疯狂震荡；拖动“频谱网格规模”或“加窗保留宽度”滑块，对比绿色加窗曲线的平滑效果。",
      "controls": [
        {
          "type": "slider",
          "id": "powN",
          "label": "频谱网格规模 N = 2^k (4→16点, 5→32点, 6→64点)",
          "min": 4,
          "max": 6,
          "step": 1,
          "value": 5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "mRatio",
          "label": "加窗保留长度比例 M / N",
          "min": 0.3,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showBad",
          "label": "显示“直接补零(未加窗)”的点间震荡 [粉线]",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showDots",
          "label": "高亮原始 N/2+1 个离散定义点 [琥珀圆点]",
          "value": true
        }
      ],
      "jsCode": "var N_HR = 512;\nvar HALF_HR = N_HR / 2;\n\nfunction fft(re, im, invert) {\n  var n = re.length;\n  for (var i = 1, j = 0; i < n; i++) {\n    var bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      var tr = re[i]; re[i] = re[j]; re[j] = tr;\n      var ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (var len = 2; len <= n; len <<= 1) {\n    var ang = 2 * Math.PI / len * (invert ? 1 : -1);\n    var wlenR = Math.cos(ang), wlenI = Math.sin(ang);\n    for (var i = 0; i < n; i += len) {\n      var wR = 1, wI = 0;\n      for (var j = 0; j < len / 2; j++) {\n        var uR = re[i + j], uI = im[i + j];\n        var vR = re[i + j + len / 2] * wR - im[i + j + len / 2] * wI;\n        var vI = re[i + j + len / 2] * wI + im[i + j + len / 2] * wR;\n        re[i + j] = uR + vR;\n        im[i + j] = uI + vI;\n        re[i + j + len / 2] = uR - vR;\n        im[i + j + len / 2] = uI - vI;\n        var nextR = wR * wlenR - wI * wlenI;\n        wI = wR * wlenI + wI * wlenR;\n        wR = nextR;\n      }\n    }\n  }\n  if (invert) {\n    for (var i = 0; i < n; i++) {\n      re[i] /= n;\n      im[i] /= n;\n    }\n  }\n}\n\nfunction targetCurve(f) {\n  if (f >= 0.11 && f <= 0.25) return 1.0;\n  if (f > 0.25 && f <= 0.37) return 0.45;\n  return 0.0;\n}\n\nlab.onUpdate(function() {\n  var gridN = Math.pow(2, Math.round(lab.values.powN));\n  var halfG = gridN / 2;\n  var M = Math.floor(gridN * lab.values.mRatio);\n  if (M % 2 !== 0) M--;\n  if (M < 4) M = 4;\n\n  var gRe = new Float32Array(gridN);\n  var gIm = new Float32Array(gridN);\n  var dots = new Float32Array(halfG + 1);\n  for (var k = 0; k <= halfG; k++) {\n    var val = targetCurve(k / gridN);\n    dots[k] = val;\n    gRe[k] = val;\n    if (k > 0 && k < halfG) gRe[gridN - k] = val;\n  }\n\n  fft(gRe, gIm, true);\n\n  var badRe = new Float32Array(N_HR);\n  var badIm = new Float32Array(N_HR);\n  for (var i = 0; i < gridN; i++) badRe[i] = gRe[i];\n  fft(badRe, badIm, false);\n\n  var shifted = new Float32Array(gridN);\n  var halfM = M / 2;\n  for (var i = 0; i < gridN; i++) {\n    shifted[(i + halfM) % gridN] = gRe[i];\n  }\n\n  var goodRe = new Float32Array(N_HR);\n  var goodIm = new Float32Array(N_HR);\n  var winKernel = new Float32Array(M + 1);\n  for (var i = 0; i <= M; i++) {\n    var w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / M);\n    winKernel[i] = shifted[i] * w;\n    goodRe[i] = winKernel[i];\n  }\n  fft(goodRe, goodIm, false);\n\n  var magBad = new Float32Array(HALF_HR + 1);\n  var magGood = new Float32Array(HALF_HR + 1);\n  var maxBad = 0;\n  for (var k = 0; k <= HALF_HR; k++) {\n    magBad[k] = Math.hypot(badRe[k], badIm[k]);\n    magGood[k] = Math.hypot(goodRe[k], goodIm[k]);\n    if (magBad[k] > maxBad) maxBad = magBad[k];\n  }\n\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var lX = 28, lY = 26, lW = 246, lH = 182;\n  var rX = 310, rY = 26, rW = 392, rH = 182;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var y = lY + lH * g / 4;\n    ctx.beginPath(); ctx.moveTo(lX, y); ctx.lineTo(lX + lW, y); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rX, y); ctx.lineTo(rX + rW, y); ctx.stroke();\n  }\n  for (var g = 0; g <= 5; g++) {\n    var xr = rX + rW * g / 5;\n    ctx.beginPath(); ctx.moveTo(xr, rY); ctx.lineTo(xr, rY + rH); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域：混叠脉冲(粉) vs 移位加窗核(绿)', lX, 16);\n  ctx.fillText('高分辨率频谱：点间震荡 vs 平滑过渡', rX, 16);\n\n  var tMax = 0.5, tMin = -0.25;\n  var tZeroY = lY + lH * (tMax / (tMax - tMin));\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lX, tZeroY); ctx.lineTo(lX + lW, tZeroY); ctx.stroke();\n\n  if (lab.values.showBad) {\n    ctx.strokeStyle = 'rgba(236,72,153,0.55)';\n    ctx.lineWidth = 1.5;\n    for (var i = 0; i < gridN; i++) {\n      var px = lX + (i / (gridN - 1)) * lW;\n      var py = lY + lH * ((tMax - gRe[i]) / (tMax - tMin));\n      py = Math.max(lY, Math.min(lY + lH, py));\n      ctx.beginPath(); ctx.moveTo(px, tZeroY); ctx.lineTo(px, py); ctx.stroke();\n    }\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.fillStyle = '#10b981';\n  ctx.lineWidth = 1.6;\n  for (var i = 0; i <= M; i++) {\n    var px = lX + (i / (gridN - 1)) * lW;\n    var py = lY + lH * ((tMax - winKernel[i]) / (tMax - tMin));\n    py = Math.max(lY, Math.min(lY + lH, py));\n    ctx.beginPath(); ctx.moveTo(px, tZeroY); ctx.lineTo(px, py); ctx.stroke();\n    ctx.beginPath(); ctx.arc(px, py, 2.0, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px monospace';\n  ctx.fillText('0', lX - 2, lY + lH + 14);\n  ctx.fillText('M=' + M, lX + (M / (gridN - 1)) * lW - 14, lY + lH + 14);\n  ctx.fillText('N-1=' + (gridN - 1), lX + lW - 36, lY + lH + 14);\n\n  var yTop = 1.5;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (var k = 0; k <= HALF_HR; k++) {\n    var px = rX + (k / HALF_HR) * rW;\n    var py = rY + rH * (1 - targetCurve(k / N_HR) / yTop);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  if (lab.values.showBad) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var k = 0; k <= HALF_HR; k++) {\n      var px = rX + (k / HALF_HR) * rW;\n      var py = rY + rH * (1 - Math.min(yTop, magBad[k]) / yTop);\n      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var k = 0; k <= HALF_HR; k++) {\n    var px = rX + (k / HALF_HR) * rW;\n    var py = rY + rH * (1 - Math.min(yTop, magGood[k]) / yTop);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (lab.values.showDots) {\n    ctx.fillStyle = '#f59e0b';\n    for (var k = 0; k <= halfG; k++) {\n      var px = rX + (k / halfG) * rW;\n      var py = rY + rH * (1 - dots[k] / yTop);\n      ctx.beginPath();\n      ctx.arc(px, py, 3.2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (var g = 0; g <= 5; g++) {\n    ctx.fillText((g * 0.1).toFixed(1), rX + rW * g / 5 - 8, rY + rH + 14);\n  }\n  ctx.fillText('0', rX - 12, rY + rH + 3);\n  ctx.fillText('1.0', rX - 22, rY + rH * (1 - 1.0 / yTop) + 3);\n  ctx.fillText('1.5', rX - 22, rY + 5);\n\n  lab.setReadout('网格 N = ' + gridN + ' (定义点 ' + (halfG + 1) + ' 个) | 加窗核长 M+1 = ' + (M + 1) + ' | 未加窗粉线峰值过冲: ' + maxBad.toFixed(2) + ' (理想上限 1.00)');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "相位数组首尾必须归零：虽然幅度和相位可任意配置，但索引 `0`（直流）与索引 `N/2`（奈奎斯特频率，如 `512`）的相位必须为 `0`（或 `2π` 整数倍），否则时域信号无法保持纯实数。",
        "绝对不要删除加窗后两端的“近零采样点”：窗函数会把核两端的数值压得肉眼几乎看不见，但它们对频域拟合至关重要，强行删减会直接毁掉过渡带与阻带性能。",
        "严禁直接使用原始 IFFT 结果做卷积：未移位、未加窗的 N 点脉冲响应带着严重的时域混叠——它在你设定的离散频点上看起来完美，但在频点之间会剧烈震荡。",
        "测试必用 Zero-padding（补零验算）：把 `M + 1` 点的核后面补大量零再做 FFT，才能看清离散频率点之间的真实响应曲线；真正决定逼近精度的不是初始频域点数（`513` 点通常足够），而是滤波器核长度 `M + 1`。"
      ]
    }
  ]
});
