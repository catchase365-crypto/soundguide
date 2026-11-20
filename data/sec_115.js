window.__BOOK_REGISTER_SECTION__("sec_115", {
  "title": "其他常见傅里叶变换对 (Other Transform Pairs)",
  "intuition": "矩形窗、三角形、高斯曲线与调制高斯脉冲在时频两域之间存在着优美的对偶与卷积关系，这正是数字滤波器设计与信号调制的底层数学基石。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 时频对偶性：从矩形脉冲到理想低通滤波器",
      "paragraphs": [
        "在信号处理中，**时域与频域具有对称的对偶关系**：时域的矩形脉冲对应频域的 Sinc 函数；反过来，**频域的矩形脉冲**同样对应**时域的 Sinc 函数**。",
        "在离散傅里叶变换（DFT）中，由于频域也是离散采样的，这种周期性会在时域引入**混叠（Aliasing）**效应（公式 11-3）。如果我们想象频域采样变得无限精细，直到变成一条连续的曲线，此时时域就会变为无限长且不再具有周期性，混叠随之消失——这就需要使用**离散时间傅里叶变换（DTFT）**（公式 11-4）。",
        "公式 11-4 在 DSP 中极其重要：因为频域中从 0 到截止频率 `f_c`、幅值为 1 的矩形脉冲，物理上正代表一个**完美的理想低通滤波器（brick-wall low-pass filter）**。因此，它对应的时域 Sinc 函数就是理想低通滤波器的**卷积核（filter kernel）**，也是第 15 章**加窗 Sinc 滤波器（windowed-sinc filters）**的理论基础。"
      ],
      "formula": {
        "expr": "x[i] = sin(2π * f_c * i) / (i * π)  (DTFT 逆变换);  x[0] = 2 * f_c",
        "explain": "x[i] 为时域滤波器脉冲响应，i 为样本索引；f_c 为归一化截止频率（取值 0 到 0.5 之间）。当 i = 0 时会发生 0/0 除零错误，必须单独赋值为极限值 2 * f_c。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：理想低通 Sinc 核与 DFT 混叠对比",
      "instruction": "拖动截止频率滑块观察时域 Sinc 主瓣宽度的反向变化；打开「周期混叠对比」开关观察 DFT 有限长度带来的尾部失真；点击播放试听理想低通滤波切掉高频谐波后的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_c",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.15,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "dftAlias",
          "label": "开启周期混叠对比 (Eq 11-3 vs 11-4)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听理想低通滤波效果",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioCtx = null, osc = null, gainNode = null, isPlaying = false;\n\nfunction syncAudio() {\n  var wantPlay = !!lab.values.play;\n  if (wantPlay && !isPlaying) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    osc = audioCtx.createOscillator();\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.22;\n    osc.frequency.value = 110;\n    osc.connect(gainNode);\n    gainNode.connect(audioCtx.destination);\n    osc.start();\n    isPlaying = true;\n  } else if (!wantPlay && isPlaying) {\n    try { osc.stop(); osc.disconnect(); gainNode.disconnect(); } catch (e) {}\n    osc = null; gainNode = null; isPlaying = false;\n  }\n  if (isPlaying && audioCtx && osc) {\n    var fc = lab.values.fc;\n    var maxH = 20;\n    var real = new Float32Array(maxH + 1);\n    var imag = new Float32Array(maxH + 1);\n    var maxKeep = Math.floor(fc * 40);\n    for (var k = 1; k <= maxH; k++) {\n      if (k <= maxKeep) imag[k] = 1 / k;\n    }\n    var wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });\n    osc.setPeriodicWave(wave);\n  }\n}\n\nfunction drawGrid(x, y, w, h, cols, rows) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (var i = 0; i <= cols; i++) {\n    var px = x + (w * i) / cols;\n    ctx.moveTo(px, y); ctx.lineTo(px, y + h);\n  }\n  for (var j = 0; j <= rows; j++) {\n    var py = y + (h * j) / rows;\n    ctx.moveTo(x, py); ctx.lineTo(x + w, py);\n  }\n  ctx.stroke();\n}\n\nfunction render() {\n  var fc = lab.values.fc;\n  var showAlias = !!lab.values.dftAlias;\n  var N = 64;\n  var M = Math.max(1, Math.round(fc * N + 0.5));\n\n  ctx.clearRect(0, 0, W, H);\n\n  var xL = 24, wL = 320, yL = 28, hL = 180, baseL = 158, scaleL = 135;\n  var xR = 382, wR = 314, yR = 28, hR = 180, baseR = 184, scaleR = 128;\n\n  drawGrid(xL, yL, wL, hL, 8, 5);\n  drawGrid(xR, yR, wR, hR, 5, 4);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(xL, baseL); ctx.lineTo(xL + wL, baseL);\n  ctx.moveTo(xR, baseR); ctx.lineTo(xR + wR, baseR);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域滤波器核: Sinc (N=' + N + ')', xL, 18);\n  ctx.fillText('频域响应: 理想低通矩形窗 (0 ~ 0.5)', xR, 18);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var k = 0; k < N; k++) {\n    var i = k - N / 2;\n    var val = (i === 0) ? 2 * fc : Math.sin(2 * Math.PI * fc * i) / (i * Math.PI);\n    var px = xL + (k / (N - 1)) * wL;\n    var py = baseL - val * scaleL;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showAlias) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var k2 = 0; k2 < N; k2++) {\n      var idx = (k2 - N / 2 + N) % N;\n      var valA = (idx === 0) ? (2 * M - 1) / N : Math.sin(2 * Math.PI * idx * (M - 0.5) / N) / (N * Math.sin(Math.PI * idx / N));\n      var pxA = xL + (k2 / (N - 1)) * wL;\n      var pyA = baseL - valA * scaleL;\n      if (k2 === 0) ctx.moveTo(pxA, pyA); else ctx.lineTo(pxA, pyA);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  var cutX = xR + (fc / 0.5) * wR;\n  ctx.moveTo(xR, baseR - scaleR);\n  ctx.lineTo(cutX, baseR - scaleR);\n  ctx.lineTo(cutX, baseR);\n  ctx.lineTo(xR + wR, baseR);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n  ctx.beginPath();\n  ctx.moveTo(xR, baseR);\n  ctx.lineTo(xR, baseR - scaleR);\n  ctx.lineTo(cutX, baseR - scaleR);\n  ctx.lineTo(cutX, baseR);\n  ctx.closePath();\n  ctx.fill();\n\n  if (showAlias) {\n    ctx.fillStyle = '#f59e0b';\n    for (var b = 0; b <= N / 2; b++) {\n      var bx = xR + ((b / N) / 0.5) * wR;\n      var amp = (b <= M - 1) ? 1 : 0;\n      var by = baseR - amp * scaleR;\n      ctx.fillRect(bx - 2, by - 2, 4, 4);\n    }\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('x[0] = 2*f_c = ' + (2 * fc).toFixed(2), xL + 4, yL + 14);\n  ctx.fillText('f_c = ' + fc.toFixed(2), Math.min(cutX - 18, xR + wR - 50), baseR + 14);\n  if (showAlias) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('橙线/点: DFT混叠 (M=' + M + ')', xL + 155, yL + 14);\n  }\n\n  var kept = Math.floor(fc * 40);\n  lab.setReadout('截止频率 f_c = ' + fc.toFixed(2) + ' | 峰值 x[0] = ' + (2 * fc).toFixed(2) + ' | 音频保留谐波: 1 ~ ' + kept + ' 次' + (showAlias ? ' | DFT脉冲宽度 M = ' + M : ''));\n  syncAudio();\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "2. 自卷积的魔力：三角形脉冲与 Sinc 平方",
      "paragraphs": [
        "在图 11-5 (c) 与 (d) 中，**时域的三角形脉冲**对应于**频域的 Sinc 函数平方**（在离散情况下同样带有轻微混叠）。记住这个变换对本身并不如理解它**背后的原因**重要。",
        "一个长度为 `2M - 1` 个采样点的三角形脉冲，恰好可以由一个长度为 `M` 的矩形脉冲**与自身做卷积**得到。根据傅里叶变换的核心定理：**时域卷积等价于频域相乘**。",
        "既然矩形脉冲在频域对应的是一次 Sinc 函数，那么在时域把矩形脉冲与自己卷积一次，就相当于在频域把 Sinc 频谱**与自己相乘（即平方）**。平方之后，所有频谱幅值都变成了非负数，且旁瓣（sidelobes）的能量被大幅压低。"
      ],
      "formula": {
        "expr": "Tri(2M - 1) = Rect(M) * Rect(M)   <===>   [Sinc(f)]^2",
        "explain": "Tri 代表三角形脉冲，Rect 代表矩形脉冲，* 表示卷积运算。时域自我卷积将频域的 Sinc 频谱平方，消除了负值旁瓣并加速旁瓣衰减。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 唯一的自对偶波形与调制脉冲：高斯曲线 & 高斯突发脉冲",
      "paragraphs": [
        "是否存在一种波形，它的傅里叶变换恰好就是它自己？答案是肯定的，而且**全宇宙有且仅有这一种**：**高斯函数（Gaussian）**（忽略采样混叠时成立）。",
        "高斯波在时域和频域呈现出完美的**宽窄反比关系**：你在时域把高斯脉冲捏得越窄（标准差 `σ_t` 越小），它的频谱就会在频域铺得越宽（标准差 `σ_f` 越大），反之亦然。",
        "如果我们把一个正弦波乘以一个高斯包络，就会得到一个**高斯突发脉冲（Gaussian burst）**。根据“**时域相乘等价于频域卷积**”定理：正弦波的频谱是位于其频率 `f_0` 处的脉冲（delta 函数），高斯波的频谱是位于 0 频率处的高斯曲线。两者在频域卷积的结果，就是把原本以零频率为中心的高斯频谱**整个平移到了正弦波的频率 `f_0` 处**——这正是上一章讲过的**幅度调制（Amplitude Modulation）**原理！"
      ],
      "formula": {
        "expr": "2π * σ_f = 1 / σ_t",
        "explain": "σ_t 为时域高斯曲线的标准差（以采样点数计），σ_f 为频域高斯频谱的标准差（以归一化频率计）。两者乘积为常数 1/(2π)，体现了时频不确定性原理。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：高斯时频测不准关系与突发脉冲调制",
      "instruction": "拖动「时域脉宽 σ_t」感受时域变窄时频谱瞬间变宽的反向联动；拖动「载波频率 f_0」把零频高斯波调制成指定频率的高斯突发脉冲，并开启音频听听“窄脉冲是咔哒声、宽脉冲才有清晰音高”的物理直觉。",
      "controls": [
        {
          "type": "slider",
          "id": "sigmaT",
          "label": "时域脉宽 σ_t",
          "min": 2,
          "max": 12,
          "step": 0.5,
          "value": 4.5,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "f0",
          "label": "载波频率 f_0",
          "min": 0,
          "max": 0.4,
          "step": 0.01,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听高斯脉冲与不确定性",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar nextTrigger = 0;\n\nfunction triggerBurst(timeSec) {\n  var audioCtx = lab.getAudioContext();\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  var sigmaT = lab.values.sigmaT;\n  var f0 = lab.values.f0;\n  var virtFs = 2500;\n  var dur = 0.14;\n  var len = Math.floor(audioCtx.sampleRate * dur);\n  var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);\n  var data = buf.getChannelData(0);\n  var mid = len / 2;\n  for (var i = 0; i < len; i++) {\n    var n = ((i - mid) / audioCtx.sampleRate) * virtFs;\n    var env = Math.exp(-0.5 * Math.pow(n / sigmaT, 2));\n    data[i] = 0.35 * env * Math.cos(2 * Math.PI * f0 * n);\n  }\n  var src = audioCtx.createBufferSource();\n  src.buffer = buf;\n  src.connect(audioCtx.destination);\n  src.start();\n}\n\nfunction drawGrid(x, y, w, h, cols, rows) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (var i = 0; i <= cols; i++) {\n    var px = x + (w * i) / cols;\n    ctx.moveTo(px, y); ctx.lineTo(px, y + h);\n  }\n  for (var j = 0; j <= rows; j++) {\n    var py = y + (h * j) / rows;\n    ctx.moveTo(x, py); ctx.lineTo(x + w, py);\n  }\n  ctx.stroke();\n}\n\nfunction render() {\n  var sigmaT = lab.values.sigmaT;\n  var f0 = lab.values.f0;\n  var sigmaF = 1 / (2 * Math.PI * sigmaT);\n  var N = 128;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var xL = 24, wL = 320, yL = 28, hL = 180, midL = 118, scaleL = 78;\n  var xR = 382, wR = 314, yR = 28, hR = 180, baseR = 192, scaleR = 148;\n\n  drawGrid(xL, yL, wL, hL, 8, 4);\n  drawGrid(xR, yR, wR, hR, 5, 4);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(xL, midL); ctx.lineTo(xL + wL, midL);\n  ctx.moveTo(xR, baseR); ctx.lineTo(xR + wR, baseR);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(f0 < 0.005 ? '时域: 纯高斯脉冲' : '时域: 高斯突发脉冲 (Gaussian Burst)', xL, 18);\n  ctx.fillText('频域: 高斯频谱 (中心移至 f_0)', xR, 18);\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var env = Math.exp(-0.5 * Math.pow((n - N / 2) / sigmaT, 2));\n    var px = xL + (n / (N - 1)) * wL;\n    var py = midL - env * scaleL;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  if (f0 >= 0.005) {\n    ctx.beginPath();\n    for (var n2 = 0; n2 < N; n2++) {\n      var env2 = Math.exp(-0.5 * Math.pow((n2 - N / 2) / sigmaT, 2));\n      var px2 = xL + (n2 / (N - 1)) * wL;\n      var py2 = midL + env2 * scaleL;\n      if (n2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n    }\n    ctx.stroke();\n  }\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var k = 0; k < N; k++) {\n    var t = k - N / 2;\n    var val = Math.exp(-0.5 * Math.pow(t / sigmaT, 2)) * Math.cos(2 * Math.PI * f0 * t);\n    var gx = xL + (k / (N - 1)) * wL;\n    var gy = midL - val * scaleL;\n    if (k === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  var steps = 200;\n  var ampScale = sigmaT / 12;\n  for (var s = 0; s <= steps; s++) {\n    var f = (s / steps) * 0.5;\n    var gPos = Math.exp(-0.5 * Math.pow((f - f0) / sigmaF, 2));\n    var gNeg = Math.exp(-0.5 * Math.pow((f + f0) / sigmaF, 2));\n    var mag = 0.5 * ampScale * (gPos + gNeg);\n    var fx = xR + (f / 0.5) * wR;\n    var fy = baseR - mag * scaleR;\n    if (s === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);\n  }\n  ctx.stroke();\n\n  ctx.lineTo(xR + wR, baseR);\n  ctx.lineTo(xR, baseR);\n  ctx.closePath();\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n  ctx.fill();\n\n  var f0X = xR + (f0 / 0.5) * wR;\n  ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(f0X, yR); ctx.lineTo(f0X, baseR);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('f_0 = ' + f0.toFixed(2), Math.min(f0X + 4, xR + wR - 55), yR + 14);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('σ_f = ' + sigmaF.toFixed(4), xR + 6, yR + 14);\n\n  lab.setReadout('σ_t = ' + sigmaT.toFixed(1) + ' 点  <==>  σ_f = 1/(2πσ_t) = ' + sigmaF.toFixed(4) + ' | 调制中心频率 f_0 = ' + f0.toFixed(2) + ' (等效音频 ' + Math.round(f0 * 2500) + ' Hz)');\n}\n\nlab.onUpdate(render);\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.play) {\n    if (timeSec >= nextTrigger) {\n      triggerBurst(timeSec);\n      nextTrigger = timeSec + 0.45;\n    }\n  } else {\n    nextTrigger = 0;\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑必查零点除零：写代码计算 Sinc 核（无论是离散混叠版本 `(2M-1)/N` 还是连续 DTFT 版本 `2f_c`）时，必须在 `i == 0` 处显式分支赋值，否则程序会立刻触发 `0/0 = NaN` 崩溃。",
        "理解理想滤波器的代价：频域的完美直角矩形低通，对应时域无限长振荡的 Sinc 函数；工程上只能截取有限长度并加窗（即第 15 章的加窗 Sinc 滤波器）。",
        "用卷积与乘法的对偶思维看波形：看到“三角形”要反应出它是“矩形自我卷积”，所以频谱是 Sinc 平方；看到“调制脉冲”要反应出它是“包络乘载波”，所以频谱是被搬移到载频位置的包络频谱。",
        "牢记时频测不准约束 `2π * σ_f = 1 / σ_t`：想在时间上把信号定位得极准（脉冲极窄），频谱就必然会铺得很宽；想要频率分辨率极高（频谱极尖锐），时域波形就必须持续足够长。"
      ]
    }
  ]
});
