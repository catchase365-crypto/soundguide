window.__BOOK_REGISTER_SECTION__("sec_147", {
  "title": "FFT 卷积 / 高速卷积 (FFT Convolution)",
  "intuition": "把耗时的时域滑动乘加搬到频域变成一次逐点复数相乘，再通过补零和重叠相加（Overlap-Add）无缝拼接长信号，用极少计算量得到与直接卷积完全一致的结果。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么要绕道频域？——高速卷积的本质",
      "paragraphs": [
        "在信号处理中，一条核心定理是：**时域中的卷积，等价于频域中的乘积**。具体步骤是：先用离散傅里叶变换（DFT）把输入信号和滤波器核分别变换到频域，将两者的频谱相乘，再用逆变换（IDFT）变回时域。",
        "其实早在傅里叶的时代人们就知道这个原理，但长期无人问津——因为当时直接算 DFT 的时间比在时域直接做卷积还要慢得多。直到 **1965 年快速傅里叶变换（FFT）** 算法横空出世，用 FFT 计算 DFT 让频域路径的计算量大幅反超直接卷积，因此 FFT 卷积也被称为**高速卷积（High-speed Convolution）**。",
        "需要牢记的是：**FFT 卷积算出的最终波形与时域直接卷积完全一模一样**，改变的只是达成目标的计算效率。此外，虽然极坐标（幅度/相位）最符合人类直觉，但在计算机代码里，频谱必须用**直角坐标（实部 `RE` 与虚部 `IM`）**来存储和相乘，因为复数乘法在直角坐标下最为高效。"
      ],
      "formula": {
        "expr": "ReY[k] = ReX[k]·ReH[k] - ImX[k]·ImH[k],  ImY[k] = ReX[k]·ImH[k] + ImX[k]·ReH[k]",
        "explain": "输入分段频谱 (ReX, ImX) 与预先存好的滤波器频响 (ReH, ImH) 在第 k 个频率点做复数乘法，得到输出分段的频谱 (ReY, ImY)，随后做一次 IFFT 即可还原出时域输出分段。"
      }
    },
    {
      "type": "concept",
      "heading": "防混叠的生命线：线性卷积与补零长度（Zero Padding）",
      "paragraphs": [
        "使用 FFT 做卷积时有一个致命陷阱：**循环卷积（Circular Convolution）**。如果你直接对长度不够的序列做 FFT 并相乘，输出信号超出 FFT 长度的尾部会“回卷”到开头，与正常信号混叠在一起。",
        "当一个 `L` 点的输入分段与一个 `M` 点的滤波器核卷积时，线性卷积的真实输出长度会膨胀为 `L + M - 1` 点。为了避免尾部回卷，**FFT 的点数必须至少等于输出分段的长度**，也就是说，输入分段和滤波器核的末尾都必须补上足够多的零（Zero Padding）。",
        "例如原书图 18-2 中：滤波器核长 `129` 点，输入分断长 `128` 点，两者卷积产生的输出长 `128 + 129 - 1 = 256` 点。因此必须选用 **256 点 FFT**：滤波器核尾部要补 `127` 个零，每个输入分段尾部要补 `128` 个零。面对 `600` 点的长核，工程上可以灵活凑出 2 的整数次幂——既可以用 `425` 点分段配合 `1024` 点 FFT，也可以用 `1449` 点分段配合 `2048` 点 FFT。"
      ],
      "formula": {
        "expr": "N_FFT ≥ L_seg + M - 1",
        "explain": "N_FFT 是选用的 FFT 点数（通常为 2 的幂），L_seg 是每个输入分段的样本数，M 是滤波器核的长度。只有满足此不等式，频域相乘才会严格等价于无失真的线性卷积。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：补零不足如何引发循环卷积混叠？",
      "instruction": "拖动「信号尾部补零数」和「滤波器核长 M」，观察当 DFT 长度 N 小于 L+M-1 时，粉色频域卷积曲线的尾部如何从右侧回卷并污染开头的红色阴影区。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelLen",
          "label": "滤波器核长 M",
          "min": 17,
          "max": 121,
          "step": 8,
          "value": 65,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "padZeros",
          "label": "输入尾部补零数",
          "min": 0,
          "max": 128,
          "step": 4,
          "value": 32,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showWrap",
          "label": "高亮回卷混叠区",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function () {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var M = lab.values.kernelLen;\n  var pad = lab.values.padZeros;\n  var showWrap = lab.values.showWrap;\n\n  var L = 128;\n  var N = L + pad;\n  var linLen = L + M - 1;\n  var maxPlotN = 256;\n\n  var x = new Float64Array(L);\n  for (var n = 0; n < L; n++) {\n    var pulseRight = Math.exp(-Math.pow((n - 108) / 7, 2)) * Math.cos(0.45 * (n - 108));\n    var gentleLeft = 0.25 * Math.sin(2 * Math.PI * 2 * n / L) * (n < 55 ? 1 : 0.2);\n    x[n] = gentleLeft + 1.15 * pulseRight;\n  }\n\n  var h = new Float64Array(M);\n  var mid = (M - 1) / 2;\n  var sumH = 0;\n  for (var n = 0; n < M; n++) {\n    var m = n - mid;\n    var sinc = (m === 0) ? 0.28 : Math.sin(0.28 * Math.PI * m) / (Math.PI * m);\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (M - 1));\n    h[n] = sinc * win;\n    sumH += h[n];\n  }\n  for (var n = 0; n < M; n++) h[n] /= sumH;\n\n  var yLin = new Float64Array(linLen);\n  for (var n = 0; n < L; n++) {\n    for (var k = 0; k < M; k++) {\n      yLin[n + k] += x[n] * h[k];\n    }\n  }\n\n  var reY = new Float64Array(N);\n  var imY = new Float64Array(N);\n  var limit = Math.max(L, M);\n  for (var k = 0; k < N; k++) {\n    var w = (2 * Math.PI * k) / N;\n    var rx = 0, ix = 0, rh = 0, ih = 0;\n    for (var n = 0; n < limit; n++) {\n      var ang = w * n;\n      var c = Math.cos(ang), s = -Math.sin(ang);\n      if (n < L) { rx += x[n] * c; ix += x[n] * s; }\n      if (n < M) { rh += h[n] * c; ih += h[n] * s; }\n    }\n    reY[k] = rx * rh - ix * ih;\n    imY[k] = rx * ih + ix * rh;\n  }\n\n  var yCirc = new Float64Array(N);\n  for (var n = 0; n < N; n++) {\n    var sum = 0;\n    var w = (2 * Math.PI * n) / N;\n    for (var k = 0; k < N; k++) {\n      var ang = w * k;\n      sum += reY[k] * Math.cos(ang) - imY[k] * Math.sin(ang);\n    }\n    yCirc[n] = sum / N;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 44, padR = 16, padT = 22, padB = 26;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var midY = padT + plotH * 0.52;\n  var scaleY = plotH * 0.42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= 256; gx += 32) {\n    var px = padL + (gx / maxPlotN) * plotW;\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, H - padB); ctx.stroke();\n  }\n  for (var gy = -1; gy <= 1; gy += 0.5) {\n    var py = midY - gy * scaleY;\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke();\n  }\n\n  var aliased = N < linLen;\n  var overlap = aliased ? (linLen - N) : 0;\n\n  if (showWrap && aliased) {\n    var aliasX = padL + (overlap / maxPlotN) * plotW;\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';\n    ctx.fillRect(padL, padT, aliasX - padL, plotH);\n\n    var nX = padL + (N / maxPlotN) * plotW;\n    var linX = padL + (linLen / maxPlotN) * plotW;\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.15)';\n    ctx.fillRect(nX, padT, linX - nX, plotH);\n\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('超出 N 的尾部回卷至开头', Math.min(nX + 4, W - 145), padT + 14);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('混叠污染区 (0~' + (overlap - 1) + ')', padL + 4, padT + 14);\n  }\n\n  var nLineX = padL + (N / maxPlotN) * plotW;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = aliased ? '#f59e0b' : '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(nLineX, padT); ctx.lineTo(nLineX, H - padB); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = aliased ? '#f59e0b' : '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('N=' + N, Math.min(nLineX + 4, W - 48), H - padB - 6);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < linLen; n++) {\n    var px = padL + (n / maxPlotN) * plotW;\n    var py = midY - yLin[n] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.save();\n  if (!aliased) ctx.setLineDash([6, 4]);\n  ctx.strokeStyle = aliased ? '#ec4899' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = padL + (n / maxPlotN) * plotW;\n    var py = midY - yCirc[n] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('— 真实线性卷积 (长 ' + linLen + ')', padL, 14);\n  ctx.fillStyle = aliased ? '#ec4899' : '#38bdf8';\n  ctx.fillText((aliased ? '— ' : '-- ') + 'DFT 频域卷积 (N=' + N + ')', padL + 185, 14);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('0', padL - 4, H - 8);\n  ctx.fillText('128', padL + (128 / maxPlotN) * plotW - 10, H - 8);\n  ctx.fillText('255', padL + (255 / maxPlotN) * plotW - 12, H - 8);\n\n  if (aliased) {\n    lab.setReadout('L=' + L + ' | M=' + M + ' | 最小无混叠长度=' + linLen + ' | 当前 N=' + N + ' | ❌ 补零不足，发生 ' + overlap + ' 点循环回卷混叠');\n  } else {\n    lab.setReadout('L=' + L + ' | M=' + M + ' | 最小无混叠长度=' + linLen + ' | 当前 N=' + N + ' | ✅ 补零充足，频域卷积与直接线性卷积 100% 重合');\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "长信号流水线：重叠相加法 (Overlap-Add) 与工程实现",
      "paragraphs": [
        "现实中的信号往往长达数百万甚至数千万点，不可能一次性塞进一个超大 FFT 里。因此 FFT 卷积必须结合**重叠相加法（Overlap-Add）**：把超长信号切成等长分段，用 FFT 分别滤波，再把各段膨胀出来的重叠尾部累加起来。",
        "原书表 18-1 给出了一个极具代表性的工程模板：用 `400` 点滤波器核滤波 `1000 万` 点长信号。程序把信号切成 `16000` 段，每段 `625` 点，与 `400` 点核卷积后产生 `625 + 400 - 1 = 1024` 点输出，刚好契合 `1024` 点 FFT。初始化阶段只需算**一次**滤波器的频响，把实部和虚部（实信号 FFT 对称后各 `513` 点）长期保存在 `REFR[]` 与 `IMFR[]` 中。",
        "主循环处理每段数据时分五步：1）把 `625` 点输入装入 `XX[0..624]`，后 `399` 点补零；2）FFT 变换到频域 `REX[], IMX[]`；3）与 `REFR[], IMFR[]` 做复数相乘；4）IFFT 变回 `1024` 点输出段 `XX[0..1023]`；5）**关键拼接**：把上一段遗留的 `OLAP[0..398]` 加到当前 `XX[0..398]` 上，将 `XX[0..624]` 写入输出文件，再把当前段多出来的尾巴 `XX[625..1023]` 存进 `OLAP[]` 留给下一段。循环全部结束后，**千万别忘了把最后一段留在 `OLAP[]` 里的 `399` 个尾巴写入输出**，总长度正好是 `16000 × 625 + 399 = 10,000,399` 点。"
      ],
      "formula": {
        "expr": "N_total_out = N_seg × L_seg + (M - 1)",
        "explain": "每段贡献 L_seg 个主输出点，最后一段在 OLAP[] 缓冲区留下的 M - 1 个拖尾样本必须在循环结束后全部刷出，总长度才会严丝合缝地等于原信号长加上核长减一。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：256点 FFT 重叠相加流水线与实时滤波听音",
      "instruction": "切换观察的分段号，看上方各输出段的拖尾 OLAP[64] 如何精准叠加到下一段开头，使下方绿色输出在虚线分段边界处毫无接缝；点击播放可对比原声与 FFT 卷积滤波后的听感。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "低通截止频率",
          "min": 250,
          "max": 2500,
          "step": 50,
          "value": 650,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "segIdx",
          "label": "高亮观察分段",
          "min": 0,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": " 号段"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "直通未滤波原声 (对比用)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioState = { source: null, gain: null, fs: 8000 };\n\nfunction fft256(re, im, inv) {\n  var N = re.length;\n  for (var i = 1, j = 0; i < N; i++) {\n    var bit = N >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      var tr = re[i]; re[i] = re[j]; re[j] = tr;\n      var ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (var len = 2; len <= N; len <<= 1) {\n    var ang = (2 * Math.PI / len) * (inv ? 1 : -1);\n    var wlenR = Math.cos(ang), wlenI = Math.sin(ang);\n    for (var i = 0; i < N; i += len) {\n      var wR = 1, wI = 0, half = len >> 1;\n      for (var k = 0; k < half; k++) {\n        var uR = re[i + k], uI = im[i + k];\n        var vR = re[i + k + half] * wR - im[i + k + half] * wI;\n        var vI = re[i + k + half] * wI + im[i + k + half] * wR;\n        re[i + k] = uR + vR; im[i + k] = uI + vI;\n        re[i + k + half] = uR - vR; im[i + k + half] = uI - vI;\n        var nwR = wR * wlenR - wI * wlenI;\n        wI = wR * wlenI + wI * wlenR;\n        wR = nwR;\n      }\n    }\n  }\n  if (inv) {\n    for (var i = 0; i < N; i++) { re[i] /= N; im[i] /= N; }\n  }\n}\n\nfunction stopAudio() {\n  if (audioState.source) {\n    try { audioState.source.stop(); } catch (e) {}\n    audioState.source.disconnect();\n    audioState.source = null;\n  }\n}\n\nlab.onUpdate(function () {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var cutoff = lab.values.cutoff;\n  var segIdx = lab.values.segIdx;\n  var bypass = lab.values.bypass;\n  var play = lab.values.play;\n\n  var Fs = audioState.fs;\n  var L = 128, M = 65, NFFT = 256;\n  var outSegLen = L + M - 1;\n  var olapLen = M - 1;\n  var totalVisSamples = 4 * L + olapLen;\n\n  var base512 = new Float32Array(512);\n  for (var n = 0; n < 512; n++) {\n    var t = n / Fs;\n    var lowChord = 0.48 * Math.sin(2 * Math.PI * 187.5 * t) + 0.32 * Math.sin(2 * Math.PI * 375 * t);\n    var highBuzz = 0.28 * Math.sin(2 * Math.PI * 1500 * t) + 0.25 * Math.sin(2 * Math.PI * 2500 * t);\n    base512[n] = lowChord + highBuzz;\n  }\n\n  var fc = cutoff / Fs;\n  var refr = new Float64Array(NFFT);\n  var imfr = new Float64Array(NFFT);\n  var mid = (M - 1) / 2;\n  var sumH = 0;\n  for (var n = 0; n < M; n++) {\n    var m = n - mid;\n    var sinc = (m === 0) ? (2 * fc) : Math.sin(2 * Math.PI * fc * m) / (Math.PI * m);\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (M - 1));\n    refr[n] = sinc * win;\n    sumH += refr[n];\n  }\n  for (var n = 0; n < M; n++) refr[n] /= sumH;\n  fft256(refr, imfr, false);\n\n  var segOuts = [];\n  var yVis = new Float32Array(totalVisSamples);\n  var ySteady = new Float32Array(512);\n  var olap = new Float64Array(olapLen);\n  var xRe = new Float64Array(NFFT);\n  var xIm = new Float64Array(NFFT);\n\n  for (var s = 0; s < 8; s++) {\n    xRe.fill(0); xIm.fill(0);\n    for (var n = 0; n < L; n++) {\n      xRe[n] = base512[(s * L + n) % 512];\n    }\n    fft256(xRe, xIm, false);\n    for (var k = 0; k < NFFT; k++) {\n      var xr = xRe[k], xi = xIm[k];\n      xRe[k] = xr * refr[k] - xi * imfr[k];\n      xIm[k] = xr * imfr[k] + xi * refr[k];\n    }\n    fft256(xRe, xIm, true);\n\n    if (s < 4) {\n      var copySeg = new Float32Array(outSegLen);\n      for (var n = 0; n < outSegLen; n++) copySeg[n] = xRe[n];\n      segOuts.push(copySeg);\n      for (var n = 0; n < olapLen; n++) xRe[n] += olap[n];\n      for (var n = 0; n < L; n++) yVis[s * L + n] = xRe[n];\n      if (s === 3) {\n        for (var n = 0; n < olapLen; n++) yVis[4 * L + n] = xRe[L + n];\n      }\n    } else {\n      for (var n = 0; n < olapLen; n++) xRe[n] += olap[n];\n      for (var n = 0; n < L; n++) ySteady[(s - 4) * L + n] = xRe[n];\n    }\n    for (var n = 0; n < olapLen; n++) olap[n] = xRe[L + n];\n  }\n\n  if (play) {\n    var ac = lab.getAudioContext();\n    stopAudio();\n    var buf = ac.createBuffer(1, 512, Fs);\n    var ch = buf.getChannelData(0);\n    var srcArr = bypass ? base512 : ySteady;\n    for (var i = 0; i < 512; i++) ch[i] = srcArr[i] * 0.45;\n    var src = ac.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    var g = ac.createGain();\n    g.gain.value = 0.35;\n    src.connect(g);\n    g.connect(ac.destination);\n    src.start();\n    audioState.source = src;\n    audioState.gain = g;\n  } else {\n    stopAudio();\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 40, padR = 16;\n  var plotW = W - padL - padR;\n  var topMid = 66, botMid = 178;\n  var scaleY = 34;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(padL, topMid); ctx.lineTo(W - padR, topMid); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(padL, botMid); ctx.lineTo(W - padR, botMid); ctx.stroke();\n\n  for (var b = 0; b <= 4; b++) {\n    var bx = padL + ((b * L) / totalVisSamples) * plotW;\n    ctx.save();\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n    ctx.beginPath(); ctx.moveTo(bx, 18); ctx.lineTo(bx, H - 18); ctx.stroke();\n    ctx.restore();\n  }\n\n  var tailStart = segIdx * L + L;\n  var tailX1 = padL + (tailStart / totalVisSamples) * plotW;\n  var tailX2 = padL + ((tailStart + olapLen) / totalVisSamples) * plotW;\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.2)';\n  ctx.fillRect(tailX1, 20, tailX2 - tailX1, 92);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('OLAP[64] 拖尾叠加区', Math.min(tailX1 + 2, W - 115), 31);\n\n  var segColors = ['#38bdf8', '#f59e0b', '#ec4899', '#a78bfa'];\n  for (var s = 0; s < 4; s++) {\n    var isSel = (s === segIdx);\n    ctx.strokeStyle = segColors[s];\n    ctx.globalAlpha = isSel ? 1.0 : 0.26;\n    ctx.lineWidth = isSel ? 2.2 : 1.2;\n    ctx.beginPath();\n    var segArr = segOuts[s];\n    for (var n = 0; n < outSegLen; n++) {\n      var gx = s * L + n;\n      var px = padL + (gx / totalVisSamples) * plotW;\n      var py = topMid - segArr[n] * scaleY;\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n  ctx.globalAlpha = 1.0;\n\n  ctx.strokeStyle = bypass ? '#f59e0b' : 'rgba(248, 250, 252, 0.24)';\n  ctx.lineWidth = bypass ? 2 : 1.1;\n  ctx.beginPath();\n  for (var n = 0; n < 4 * L; n++) {\n    var px = padL + (n / totalVisSamples) * plotW;\n    var py = botMid - base512[n % 512] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = bypass ? 'rgba(16, 185, 129, 0.35)' : '#10b981';\n  ctx.lineWidth = bypass ? 1.3 : 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < totalVisSamples; n++) {\n    var px = padL + (n / totalVisSamples) * plotW;\n    var py = botMid - yVis[n] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('各输出分段 (每段膨胀为 128+65-1=192 点)', padL, 14);\n  ctx.fillStyle = bypass ? '#f59e0b' : '#10b981';\n  ctx.fillText(bypass ? '叠加拼接输出 vs [当前高亮: 未滤波原声]' : '重叠相加无缝输出 (虚线处无接缝，总长 576 点)  [淡白线为高频干扰原声]', padL, 129);\n\n  lab.setReadout('N_FFT=256 | M=65 (OLAP=64点) | 观察第 ' + segIdx + ' 号分段 | fc=' + cutoff + ' Hz | 音频: ' + (play ? (bypass ? '🔊 原声(含1500/2500Hz刺耳高频)' : '🔊 FFT卷积低通滤波后') : '已静音'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（防混叠补零铁律）：FFT 长度必须满足 N_FFT ≥ L_seg + M - 1。一旦补零不够，时域尾部多出来的 M-1 个样本就会回卷并污染分段开头（循环卷积失真）。",
        "避坑 2（别丢掉最后的 OLAP[] 尾巴）：长信号分段循环结束后，重叠缓冲区 OLAP[0..M-2] 里还攒着最后一段膨胀出来的 M-1 个尾部样本，务必额外刷出到输出流，总点数才会严丝合缝等于原信号长 + M - 1。",
        "核心工程技巧：滤波器频响 REFR[] 与 IMFR[] 只需在初始化时做一次 FFT 并永久缓存；循环内部用直角坐标直接复数相乘即可，结果与时域直接卷积完全一致。"
      ]
    }
  ]
});
