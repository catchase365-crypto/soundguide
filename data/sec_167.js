window.__BOOK_REGISTER_SECTION__("sec_167", {
  "title": "非线性音频处理 (Nonlinear Audio Processing)",
  "intuition": "当信号与噪声在时域和频域完全重叠，或通过乘法与卷积非线性纠缠时，利用短时频谱幅度差异或对数同态变换，将非线性困局转化为可分离的线性问题。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、时域与频域全重叠时，线性滤波为何失效？——短时频谱降噪与时变维纳滤波",
      "paragraphs": [
        "维纳滤波和反卷积等线性技术是数字信号处理（DSP）的基石，但面对许多现实音频难题时却束手无策。一个典型痛点是**消除语音中的宽带噪声**，例如磁带底噪（hiss）、模拟电路热噪声、麦克风风噪或背景人群喧哗声。这类噪声的频率范围与人类语音完全重合，都覆盖了 `200 Hz ~ 3.2 kHz` 的核心频段——它们在**时域和频域上完全重叠**，传统的固定频率滤波器根本无法做到“只留人声、不留噪声”。",
        "突破口在于考察**极短时间片段（例如 16 ms，在 8 kHz 采样率下即 128 个采样点）**的频谱结构。在这一瞬间的语音片段中，各频率分量的幅度**极度不均匀**：绝大部分语音能量集中在少数几个大幅度共振峰频率上，其余大部分频率几乎没有语音信息；而随机宽带噪声的频谱虽然杂乱无章，但能量**均匀且平缓地铺在低幅度底噪层上**。",
        "由此引出非线性降噪的核心思想：**按幅度大小区分信号与噪声**。若某一频率分量的幅度很大，它大概率主要是有用信号，应当保留；若幅度很小，则主要是噪声，应当直接置零丢弃；中等幅度的分量则在两者之间做平滑过渡衰减。从另一个视角看，这等价于一个**时变维纳滤波器（Time-Varying Wiener Filter）**——传统维纳滤波器需要事先知道信号和噪声的全局频谱，而这里则根据每一帧信号自身的短时频谱，动态重算每一帧的滤波器频率响应。",
        "在工程实现上，这种非线性处理有一个致命陷阱：**传统的重叠相加（Overlap-Add）长信号滤波法在此完全失效**。因为每一帧的频率响应都在变化，相邻帧恢复出的时域波形在边界处不再对齐，直接拼接会产生严重的咔嗒声（相位跳变）。解决之道在于理解音频的本质：**听觉信息编码在随时间演变的频谱模式中，而非时域波形的精确几何形状里**。工程上通常将原始时域信号切分为**彼此重叠的短帧**，在每帧频域降噪并做逆变换后，给每一帧乘上一个**平滑窗函数（如 Hann 窗或正弦窗）**再重叠相加重组，从而保证频谱与波形在帧间平滑过渡。"
      ],
      "formula": {
        "expr": "G_m[k] = max(0, 1 - (T / |X_m[k]|)^2)",
        "explain": "第 m 帧在频率 bin k 处的时变维纳增益近似：|X_m[k]| 为该帧短时傅里叶变换的频谱幅度，T 为噪声基底门限；幅度远大于 T 时增益趋近 1（保留），低于 T 时增益归零（抑制）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：短时频谱门限降噪与实时听感对比",
      "instruction": "拖动「噪声幅度」与「频谱降噪门限」滑块，观察 16 ms 短时频谱中被保留的青绿信号峰与被切除的噪声基底，点击播放按键对比降噪前后的实时音频听感。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "宽带噪声幅度",
          "min": 0,
          "max": 1.5,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "threshold",
          "label": "频谱降噪门限 T",
          "min": 0,
          "max": 3.5,
          "step": 0.1,
          "value": 1.4,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showClean",
          "label": "开启时变维纳降噪",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var M = 128, H = 64, fs = 8000, N = 8000;\nvar cleanArr = new Float32Array(N);\nvar noiseArr = new Float32Array(N);\nvar win = new Float32Array(M);\nfor (var i = 0; i < M; i++) win[i] = Math.sin(Math.PI * (i + 0.5) / M);\nvar seed = 1337;\nfor (var i = 0; i < N; i++) {\n  var t = i / fs;\n  var env = 0.65 + 0.35 * Math.sin(2 * Math.PI * 3 * t);\n  cleanArr[i] = env * (0.42 * Math.sin(2 * Math.PI * 250 * t) + 0.34 * Math.sin(2 * Math.PI * 500 * t) + 0.24 * Math.sin(2 * Math.PI * 1125 * t) + 0.16 * Math.sin(2 * Math.PI * 2125 * t));\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  var r1 = (seed / 4294967296) * 2 - 1;\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  var r2 = (seed / 4294967296) * 2 - 1;\n  noiseArr[i] = (r1 + r2) * 0.5;\n}\nfunction fft(re, im, inv) {\n  var n = re.length;\n  for (var i = 1, j = 0; i < n; i++) {\n    var bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      var tr = re[i]; re[i] = re[j]; re[j] = tr;\n      var ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (var len = 2; len <= n; len <<= 1) {\n    var ang = 2 * Math.PI / len * (inv ? 1 : -1);\n    var wlenRe = Math.cos(ang), wlenIm = Math.sin(ang);\n    for (var i = 0; i < n; i += len) {\n      var wRe = 1, wIm = 0;\n      for (var k = 0; k < len / 2; k++) {\n        var uRe = re[i + k], uIm = im[i + k];\n        var vRe = re[i + k + len / 2] * wRe - im[i + k + len / 2] * wIm;\n        var vIm = re[i + k + len / 2] * wIm + im[i + k + len / 2] * wRe;\n        re[i + k] = uRe + vRe; im[i + k] = uIm + vIm;\n        re[i + k + len / 2] = uRe - vRe; im[i + k + len / 2] = uIm - vIm;\n        var nw = wRe * wlenRe - wIm * wlenIm;\n        wIm = wRe * wlenIm + wIm * wlenRe;\n        wRe = nw;\n      }\n    }\n  }\n  if (inv) { for (var i = 0; i < n; i++) { re[i] /= n; im[i] /= n; } }\n}\nvar srcNode = null, gainNode = null;\nfunction stopAudio() {\n  if (srcNode) { try { srcNode.stop(); srcNode.disconnect(); } catch (e) {} srcNode = null; }\n}\nfunction playAudioBuffer(samples) {\n  stopAudio();\n  if (!lab.values.play) return;\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!gainNode) { gainNode = ac.createGain(); gainNode.gain.value = 0.45; gainNode.connect(ac.destination); }\n  var N2 = N * 2;\n  var buf = ac.createBuffer(1, N2, 16000);\n  var ch = buf.getChannelData(0);\n  for (var i = 0; i < N2; i++) {\n    var idx = Math.floor(i / 2);\n    var next = (idx + 1) % N;\n    var val = (i % 2 === 0) ? samples[idx] : 0.5 * (samples[idx] + samples[next]);\n    if (val > 0.95) val = 0.95; if (val < -0.95) val = -0.95;\n    ch[i] = val;\n  }\n  srcNode = ac.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start(0);\n}\nlab.onUpdate(function() {\n  var nLvl = lab.values.noiseLevel;\n  var T = lab.values.threshold;\n  var doClean = lab.values.showClean;\n  var noisy = new Float32Array(N);\n  var out = new Float32Array(N);\n  for (var i = 0; i < N; i++) noisy[i] = cleanArr[i] + nLvl * noiseArr[i];\n  var frameStart = 640;\n  var dispNoisyMag = new Float32Array(M / 2 + 1);\n  var dispFiltMag = new Float32Array(M / 2 + 1);\n  var re = new Float32Array(M), im = new Float32Array(M);\n  var keptBins = 0;\n  for (var start = 0; start <= N - M; start += H) {\n    for (var i = 0; i < M; i++) { re[i] = noisy[start + i] * win[i]; im[i] = 0; }\n    fft(re, im, false);\n    for (var k = 0; k < M; k++) {\n      var mag = Math.sqrt(re[k] * re[k] + im[k] * im[k]) / 3.2;\n      var gain = 1.0;\n      if (doClean && T > 0) {\n        gain = mag <= 1e-4 ? 0 : Math.max(0, 1 - (T * T) / (mag * mag));\n      }\n      if (start === frameStart && k <= M / 2) {\n        dispNoisyMag[k] = mag;\n        dispFiltMag[k] = mag * gain;\n        if (gain > 0.1) keptBins++;\n      }\n      re[k] *= gain; im[k] *= gain;\n    }\n    fft(re, im, true);\n    for (var i = 0; i < M; i++) out[start + i] += re[i] * win[i];\n  }\n  var ctx = lab.ctx, W = lab.width, Ht = lab.height;\n  ctx.clearRect(0, 0, W, Ht);\n  var x0 = 44, w0 = 380, y0 = 26, h0 = 176;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  for (var g = 0; g <= 8; g += 2) {\n    var gy = y0 + h0 - (g / 8) * h0;\n    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x0 + w0, gy); ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'right';\n    ctx.fillText(g.toString(), x0 - 6, gy + 3);\n  }\n  for (var f = 0; f <= 5; f++) {\n    var gx = x0 + (f / 5) * w0;\n    ctx.beginPath(); ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + h0); ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';\n    ctx.fillText((f * 0.1).toFixed(1), gx, y0 + h0 + 14);\n  }\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('16ms 短时频谱 (0 ~ 0.5 fs = 4 kHz)', x0, 15);\n  for (var k = 0; k <= M / 2; k++) {\n    var bx = x0 + (k / (M / 2)) * w0;\n    var vN = Math.min(8, dispNoisyMag[k]);\n    var bhN = (vN / 8) * h0;\n    ctx.strokeStyle = doClean ? 'rgba(236,72,153,0.45)' : '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(bx, y0 + h0); ctx.lineTo(bx, y0 + h0 - bhN); ctx.stroke();\n    if (doClean) {\n      var vF = Math.min(8, dispFiltMag[k]);\n      var bhF = (vF / 8) * h0;\n      if (bhF > 0.5) {\n        ctx.strokeStyle = '#10b981'; ctx.lineWidth = 3;\n        ctx.beginPath(); ctx.moveTo(bx, y0 + h0); ctx.lineTo(bx, y0 + h0 - bhF); ctx.stroke();\n        ctx.fillStyle = '#10b981'; ctx.beginPath(); ctx.arc(bx, y0 + h0 - bhF, 2.5, 0, Math.PI * 2); ctx.fill();\n      }\n    }\n  }\n  if (doClean && T > 0) {\n    var ty = y0 + h0 - (Math.min(8, T) / 8) * h0;\n    ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(x0, ty); ctx.lineTo(x0 + w0, ty); ctx.stroke(); ctx.restore();\n    ctx.fillStyle = '#f59e0b'; ctx.font = '10px monospace'; ctx.textAlign = 'right';\n    ctx.fillText('门限 T=' + T.toFixed(1), x0 + w0 - 4, ty - 5);\n  }\n  var x1 = 456, w1 = 246;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  ctx.strokeRect(x1, y0, w1, h0);\n  ctx.beginPath(); ctx.moveTo(x1, y0 + h0 / 2); ctx.lineTo(x1 + w1, y0 + h0 / 2); ctx.stroke();\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('16ms 时域波形 (青绿:输出 / 蓝虚线:纯净参考)', x1, 15);\n  ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(56,189,248,0.6)'; ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (var i = 0; i < M; i++) {\n    var px = x1 + (i / (M - 1)) * w1;\n    var py = y0 + h0 / 2 - cleanArr[frameStart + i] * (h0 * 0.36);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke(); ctx.restore();\n  ctx.strokeStyle = doClean ? '#10b981' : '#ec4899'; ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var i = 0; i < M; i++) {\n    var px = x1 + (i / (M - 1)) * w1;\n    var sampleVal = doClean ? out[frameStart + i] : noisy[frameStart + i];\n    var py = y0 + h0 / 2 - Math.max(-1.35, Math.min(1.35, sampleVal)) * (h0 * 0.36);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  var errPow = 0, sigPow = 0;\n  for (var i = 200; i < N - 200; i++) {\n    var s = cleanArr[i];\n    var d = (doClean ? out[i] : noisy[i]) - s;\n    sigPow += s * s; errPow += d * d;\n  }\n  var snrOut = 10 * Math.log10((sigPow + 1e-9) / (errPow + 1e-9));\n  lab.setReadout('状态: ' + (doClean ? '时变维纳降噪开启' : '原始含噪直通') + ' | 保留频点: ' + keptBins + '/65 | 输出信噪比 SNR: ' + snrOut.toFixed(1) + ' dB' + (lab.values.play ? ' | 🔊 正在发声' : ''));\n  if (lab.values.play) playAudioBuffer(doClean ? out : noisy); else stopAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "二、同态信号处理 (Homomorphic Processing)：化乘除与卷积为加减",
      "paragraphs": [
        "第二类经典非线性技术叫作**同态信号处理（Homomorphic Signal Processing）**，其字面意思是**“相同的结构”**。线性滤波只能分离以“加法”混合在一起的信号；但现实中信号与干扰往往通过**乘法**或**卷积**纠缠在一起。同态处理的核心哲学就是：**构造一个可逆的数学变换，把非线性混合问题转化成“与线性系统相同的结构（即加法）”**，用常规线性滤波器分离之后，再通过逆变换还原信号。",
        "**典型场景 A：乘法混合与自动增益控制（AGC）**。例如调幅（AM）无线电波在穿过电离层时，大气条件变化会导致接收信号的响度忽大忽小。这可以建模为纯净语音 `a[ ]` **乘以**一个缓慢变化的增益包络 `g[ ]`。由于两者是相乘关系，常规滤波器无法拆解。只要对输入信号 `a[ ] × g[ ]` 取**对数**，利用恒等式 `log(x·y) = log(x) + log(y)`，乘积瞬间变成了线性加法 `log a[ ] + log g[ ]`。因为大气衰落 `g[ ]` 变化极慢，能量集中在远低于语音带宽（`200 Hz ~ 3.2 kHz`）的极低频区域，只需在**对数域**中施加一个常规**高通滤波器**即可滤除 `log g[ ]`，最后再经过**反对数（指数函数 e^x）**还原出稳定音量的 `a[ ]`。",
        "**典型场景 B：卷积混合与回声消除（Echo Removal）**。音频产生回声，本质上是原始信号 `x[ ]` 与一个“单位脉冲加上延时衰减脉冲”的冲激响应 `y[ ]` 发生了**卷积（x[ ] * y[ ]）**。要拆解卷积，同态变换需要分两步走：先做**傅里叶变换**，把时域卷积变成频域乘积 `X[ ] × Y[ ]`；再取**对数**，把乘积变成加法 `log X[ ] + log Y[ ]`！随后用线性滤波器分离出 `log X[ ]`，再依次通过**反对数**和**逆傅里叶变换**，就能干净地剥离回声。",
        "有意思的是，在卷积同态系统中，线性滤波器面对的是“频域信号的对数”，相当于**把时域和频域的角色彻底互换了**（例如若用 FFT 卷积去实现这个线性滤波，此时在中间相乘的“频谱”反而是时域信号）。这种角色反转催生了一套极具喜感的 DSP 黑话：**倒谱（Cepstrum，由 Spectrum 字母重排而来）**指对数频谱的傅里叶变换；原本的低通/高通滤波器改叫**长通（Long-Pass）/ 短通（Short-Pass）滤波器**；甚至有学者把频率分析（Frequency Analysis）戏称为 **Quefrency Alanysis**，把滤波（Filtering）戏称为 **Liftering（倒滤波）**。"
      ],
      "formula": {
        "expr": "x[ ] * y[ ]  --F-->  X[ ] * Y[ ]  --log-->  log X[ ] + log Y[ ]",
        "explain": "卷积信号的同态变换链路：先通过傅里叶变换 (F) 将时域卷积化为频域乘积，再通过对数 (log) 将乘积化为线性加法，随后即可交由线性滤波器分离。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：同态对数解调（消除缓变衰落）与“尖角混叠”透视",
      "instruction": "调节「信道衰落深度」和「对数域高通截止」，观察同态系统如何将相乘的缓变包络剥离并恢复恒幅信号；开启「透视对数域尖峰波形」，直击信号过零点产生的尖锐奇点。",
      "controls": [
        {
          "type": "slider",
          "id": "fadeDepth",
          "label": "信道衰落深度 m",
          "min": 0,
          "max": 0.85,
          "step": 0.05,
          "value": 0.65,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "fadeFreq",
          "label": "衰落频率 fg",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "hpCutoff",
          "label": "对数域高通截止",
          "min": 1,
          "max": 45,
          "step": 1,
          "value": 12,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showLog",
          "label": "透视对数域尖峰波形 log|x|",
          "value": false
        }
      ],
      "jsCode": "var N = 512, fs = 512;\nfunction fft(re, im, inv) {\n  var n = re.length;\n  for (var i = 1, j = 0; i < n; i++) {\n    var bit = n >> 1;\n    for (; j & bit; bit >>= 1) j ^= bit;\n    j ^= bit;\n    if (i < j) {\n      var tr = re[i]; re[i] = re[j]; re[j] = tr;\n      var ti = im[i]; im[i] = im[j]; im[j] = ti;\n    }\n  }\n  for (var len = 2; len <= n; len <<= 1) {\n    var ang = 2 * Math.PI / len * (inv ? 1 : -1);\n    var wlenRe = Math.cos(ang), wlenIm = Math.sin(ang);\n    for (var i = 0; i < n; i += len) {\n      var wRe = 1, wIm = 0;\n      for (var k = 0; k < len / 2; k++) {\n        var uRe = re[i + k], uIm = im[i + k];\n        var vRe = re[i + k + len / 2] * wRe - im[i + k + len / 2] * wIm;\n        var vIm = re[i + k + len / 2] * wIm + im[i + k + len / 2] * wRe;\n        re[i + k] = uRe + vRe; im[i + k] = uIm + vIm;\n        re[i + k + len / 2] = uRe - vRe; im[i + k + len / 2] = uIm - vIm;\n        var nw = wRe * wlenRe - wIm * wlenIm;\n        wIm = wRe * wlenIm + wIm * wlenRe;\n        wRe = nw;\n      }\n    }\n  }\n  if (inv) { for (var i = 0; i < n; i++) { re[i] /= n; im[i] /= n; } }\n}\nlab.onUpdate(function() {\n  var m = lab.values.fadeDepth;\n  var fg = lab.values.fadeFreq;\n  var fc = lab.values.hpCutoff;\n  var showLog = lab.values.showLog;\n  var a = new Float32Array(N);\n  var g = new Float32Array(N);\n  var x = new Float32Array(N);\n  var logX = new Float32Array(N);\n  var re = new Float32Array(N), im = new Float32Array(N);\n  var reLP = new Float32Array(N), imLP = new Float32Array(N);\n  for (var i = 0; i < N; i++) {\n    var t = i / fs;\n    a[i] = 0.72 * Math.sin(2 * Math.PI * 22 * t) + 0.28 * Math.sin(2 * Math.PI * 36 * t);\n    g[i] = 1.0 + m * Math.cos(2 * Math.PI * fg * t);\n    x[i] = a[i] * g[i];\n    logX[i] = Math.log(Math.max(1e-3, Math.abs(x[i])));\n    re[i] = logX[i]; im[i] = 0;\n  }\n  fft(re, im, false);\n  for (var k = 0; k < N; k++) {\n    var fk = k <= N / 2 ? k : N - k;\n    var passHP = (fk === 0 || fk >= fc) ? 1 : 0;\n    var passLP = (fk > 0 && fk < fc) ? 1 : 0;\n    reLP[k] = re[k] * passLP; imLP[k] = im[k] * passLP;\n    re[k] *= passHP; im[k] *= passHP;\n  }\n  fft(re, im, true);\n  fft(reLP, imLP, true);\n  var rec = new Float32Array(N);\n  var errSum = 0, sigSum = 0;\n  for (var i = 0; i < N; i++) {\n    var sgn = x[i] >= 0 ? 1 : -1;\n    var val = sgn * Math.exp(Math.max(-8, Math.min(2, re[i])));\n    rec[i] = val;\n    var d = val - a[i];\n    errSum += d * d; sigSum += a[i] * a[i];\n  }\n  var rmse = Math.sqrt(errSum / sigSum);\n  var ctx = lab.ctx, W = lab.width, Ht = lab.height;\n  ctx.clearRect(0, 0, W, Ht);\n  var x0 = 40, w0 = W - 60;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  for (var t = 0; t <= 4; t++) {\n    var gx = x0 + (t / 4) * w0;\n    ctx.beginPath(); ctx.moveTo(gx, 20); ctx.lineTo(gx, Ht - 20); ctx.stroke();\n  }\n  if (showLog) {\n    var yTop = 28, yBot = Ht - 26, hL = yBot - yTop;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.strokeRect(x0, yTop, w0, hL);\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n    ctx.fillText('对数域波形 log|x(t)| (琥珀: 过零点产生极深尖峰，易引发采样混叠) 与低通提取的 log g(t) (粉红)', x0, 16);\n    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var norm = Math.max(-6.9, Math.min(0.8, logX[i]));\n      var py = yTop + ((0.8 - norm) / 7.7) * hL;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var norm = Math.max(-6.9, Math.min(0.8, reLP[i] - 0.8));\n      var py = yTop + ((0.8 - norm) / 7.7) * hL;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'right';\n    ctx.fillText('0', x0 - 6, yTop + (0.8 / 7.7) * hL + 3);\n    ctx.fillText('-6', x0 - 6, yTop + (6.8 / 7.7) * hL + 3);\n  } else {\n    var y1 = 26, h1 = 84, y2 = 136, h2 = 84;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.strokeRect(x0, y1, w0, h1); ctx.strokeRect(x0, y2, w0, h2);\n    ctx.beginPath(); ctx.moveTo(x0, y1 + h1 / 2); ctx.lineTo(x0 + w0, y1 + h1 / 2); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(x0, y2 + h2 / 2); ctx.lineTo(x0 + w0, y2 + h2 / 2); ctx.stroke();\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif'; ctx.textAlign = 'left';\n    ctx.fillText('输入乘积信号 x(t) = a(t) · g(t)  (天蓝波形 / 琥珀虚线为缓变衰落包络 g)', x0, 16);\n    ctx.fillText('同态恢复输出 sign(x)·exp(HPF(log|x|))  (青绿输出 / 白虚线为原始恒幅信号 a)', x0, 128);\n    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var py = y1 + h1 / 2 - (x[i] / 1.9) * (h1 * 0.45);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.save(); ctx.setLineDash([4, 3]); ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var py = y1 + h1 / 2 - (g[i] / 1.9) * (h1 * 0.45);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke(); ctx.restore();\n    ctx.save(); ctx.setLineDash([3, 3]); ctx.strokeStyle = 'rgba(248,250,252,0.45)'; ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var py = y2 + h2 / 2 - (a[i] / 1.3) * (h2 * 0.42);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke(); ctx.restore();\n    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.7;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = x0 + (i / (N - 1)) * w0;\n      var py = y2 + h2 / 2 - Math.max(-1.4, Math.min(1.4, rec[i] / 1.3)) * (h2 * 0.42);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n  var status = fc <= fg ? '⚠️ 截止过低，衰落未滤除' : (fc > 22 ? '⚠️ 截止过高，侵蚀语音主频(22Hz)' : '✅ 完美剥离衰落');\n  lab.setReadout('载波: 22Hz+36Hz | 衰落 fg: ' + fg + ' Hz | 高通截止: ' + fc + ' Hz | 恢复相对误差: ' + (rmse * 100).toFixed(1) + '% | ' + status);\n});"
    },
    {
      "type": "concept",
      "heading": "三、同态处理的三大暗礁与 DSP 第一性原理",
      "paragraphs": [
        "千万不要被简洁的同态框图所迷惑——在实际工程中，同态处理布满了棘手的数学与物理暗礁：",
        "**暗礁 1：正负号与复对数（Complex Logarithm）**。现实中的音频信号围绕零点正负交替震荡，而普通实数对数无法对负数求解，必须动用更复杂的**复对数**。如果中间的线性滤波器严格限制为**零相位滤波器（Zero-Phase Filter）**，工程上有一个巧妙的捷径：先只对信号的**绝对值**取普通对数 `log|x|`，完成零相位线性滤波后，再把原始输入信号的**正负号（sign）**重新乘回到反对数后的输出信号上。",
        "**暗礁 2：对数引发的严重混叠（Aliasing）**。根据采样定理，一个连续正弦波每周期只需 2 个以上采样点即可无失真数字化。但如果你对这个正弦波取对数（如上方实验 2 开启透视模式所示），过零点处会出现极度尖锐的向下**尖角（Sharp Corners）**。捕捉这些尖锐奇点需要极高的带宽——取对数后所需的采样率往往比原信号**高出 100 倍以上**！无论是先采样再取对数，还是先取对数再采样，结果完全一样：音频信号常常不得不以 `100 kHz` 甚至更高的速率采样，而不能再沿用标准的 `8 kHz`。",
        "**暗礁 3：线性化后频谱依然可能重叠**。即使原信号本身在频域毫不相交，同态线性化后也未必能分离开。举个例子：把 `1 kHz` 和 `2 kHz` 两个正弦波**相加**，它们在频域完全分离，线性滤波器一刀即可切开；但若把它们**相乘**，取对数后变成 `log(sin1) + log(sin2)`。问题在于：**单个正弦波取对数后会产生无穷多高次谐波**，这两个对数波形各自庞大的谐波群在频域上剧烈交叠，导致后端的线性滤波器根本无法把它们彻底拆开。",
        "尽管面临重重阻碍，同态信号处理依然为所有工程师揭示了 DSP 最核心的哲理：**必须以与信号形成方式相一致的方法去处理信号**。换言之，动手写任何 DSP 算法之前，第一步永远是搞清楚：**信息究竟是如何表征和编码在这些信号之中的**。"
      ],
      "formula": {
        "expr": "y[n] = sign(x[n]) * exp( H_zero_phase( log|x[n]| ) )",
        "explain": "零相位同态滤波的工程简化公式：先对绝对值取对数避开负数定义域，经零相位线性滤波后取指数还原幅度，最后重新贴回原信号的符号 sign(x[n])。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【短时降噪别用普通重叠相加】：当频响随每一帧动态变化（时变维纳滤波）时，相邻帧时域波形不再对齐；必须采用“重叠切分 + 处理后乘平滑窗重组”来平滑频谱过渡。",
        "【看懂倒谱与倒滤波黑话】：对卷积信号做同态处理需要“傅里叶变换 + 对数”，此时线性滤波作用在频域信号上，因此诞生了 Cepstrum（倒谱）、Quefrency（倒频率）和 Liftering（倒滤波）等反转术语。",
        "【对数处理谨防 100 倍采样率混叠】：对正负交变的音频取绝对值对数会在过零处制造尖锐奇点，若仍使用 8 kHz 等低采样率，非线性产生的高频谐波会瞬间混叠失真。",
        "【同态并非万能钥匙】：相乘的两路信号即便原频谱不重叠，取对数后各自产生的密集谐波也可能在频域相互淹没，此时线性滤波器依然无能为力。"
      ]
    }
  ]
});
