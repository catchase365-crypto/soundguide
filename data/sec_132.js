window.__BOOK_REGISTER_SECTION__("sec_132", {
  "title": "高通、带通与带阻滤波器 (High-Pass, Band-Pass and Band-Reject Filters)",
  "intuition": "所有复杂频响滤波器都不用从零推导：先设计一个低通滤波器原型，再通过时域正负号变换（频谱反转或倒置）以及核的相加与卷积，就能像搭积木一样拼出高通、带通与带阻滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "万变不离其宗：低通原型与频谱反转 (Spectral Inversion)",
      "paragraphs": [
        "绝大多数数字滤波器教材只重点讲低通滤波器的设计，因为 **高通、带通和带阻滤波器都可以通过变换低通滤波器核（Filter Kernel）直接得到**。从低通变为高通的第一种核心方法是 **频谱反转（Spectral Inversion）**。",
        "频谱反转的物理直觉非常巧妙：把原始输入信号 `x[n]` 同时送入两个并联通道——一个是冲激响应为 `h[n]` 的低通滤波器，另一个是什么都不做的全通直通通道（冲激响应为单位冲激函数 `δ[n]`）。然后用 **全通输出减去低通输出**，低频成分被完整抵消，剩下的就只有高频成分！",
        "在代码实现上，完全不需要真的跑两条通道再相减，只需把两个核合并为单级操作，分两步修改原低通滤波器核即可：**第一步，将每个采样点的正负号全部取反；第二步，在核的对称中心采样点上加 1**。这会在频域产生 **上下翻转（top-for-bottom flip）** 的效果：原通带（增益 1）变成阻带（增益 0），原阻带变成通带，因此低通变高通、高通变低通、带通变带阻，且 **截止频率位置保持不变**。",
        "使用频谱反转有两条铁律：**（1）原低通核必须具有左右对称性（即零相位或线性相位）**，保证低频分量经过低通通道与直通通道时相位完全一致才能相消；**（2）加 1 的单位冲激必须精准加在对称中心点上**。"
      ],
      "formula": {
        "expr": "h_hp[n] = δ[n] - h_lp[n]",
        "explain": "h_lp[n] 为左右对称的低通滤波器核；δ[n] 为位于对称中心的单位冲激（中心点为 1，其余为 0）；h_hp[n] 为变换后的高通滤波器核。"
      }
    },
    {
      "type": "concept",
      "heading": "第二种变换：频谱倒置 (Spectral Reversal)",
      "paragraphs": [
        "从低通变为高通的第二种方法是 **频谱倒置（Spectral Reversal）**，操作甚至更简单：**只需将原低通滤波器核每隔一个采样点反转一次正负号**（即乘以交替序列 `1, -1, 1, -1...`）。",
        "为什么隔点变号就能把低通变成高通？因为交替序列本质上是一个频率为 `0.5`（奈奎斯特频率 `Fs/2`）的余弦波 `cos(πn)`。根据时域相乘等于频域搬移的原理，在时域乘以频率 `0.5` 的正弦/余弦波，会把整个频谱在频率轴上向右平移 `0.5`。",
        "由于实信号频谱的负频率部分（`-0.5 ~ 0`）是正频率部分（`0 ~ 0.5`）的镜像，向右平移 `0.5` 后，原本位于 `-0.5 ~ 0` 的镜像频谱恰好落入 `0 ~ 0.5` 区间，相当于把频谱 **左右翻转（left-for-right flip）**：原来的频率 `0` 变成 `0.5`，原来的 `0.5` 变成 `0`。",
        "请特别注意它与频谱反转的关键区别：**频谱反转是“上下翻转”，原低通截止频率 `0.15` 变换后高通截止频率依然是 `0.15`；而频谱倒置是“左右翻转”，原低通截止频率 `0.15` 变换后会变成 `0.5 - 0.15 = 0.35`**！"
      ],
      "formula": {
        "expr": "h_hp[n] = (-1)^(n - c) · h_lp[n]  =>  f_c_new = 0.5 - f_c",
        "explain": "c 为滤波器核中心索引；每隔一个样本乘以 -1 相当于用频率 0.5 调制，导致频谱左右镜像翻转，新截止频率变为 0.5 减去原截止频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：频谱反转 vs 频谱倒置的时频域实时对比（支持滤波听感）",
      "instruction": "拖动原型低通截止频率滑块，切换「频谱倒置」开关观察截止频率是原地保留还是左右镜像翻转，并可点击播放聆听多频和弦信号经过变换后高通滤波器的实时声音变化。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "原型低通截止频率 fc",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.15,
          "unit": " Fs"
        },
        {
          "type": "toggle",
          "id": "reversal",
          "label": "使用频谱倒置 (关闭=反转, 开启=倒置)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showOriginal",
          "label": "叠加显示原低通响应",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放高通滤波听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioSrc = null, masterGain = null, lastKey = '';\n\nfunction makeLowPass(fc) {\n  var h = new Array(51), sum = 0;\n  for (var i = 0; i < 51; i++) {\n    var m = i - 25;\n    var sinc = (m === 0) ? (2 * Math.PI * fc) : (Math.sin(2 * Math.PI * fc * m) / m);\n    var win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / 50) + 0.08 * Math.cos(4 * Math.PI * i / 50);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (var i = 0; i < 51; i++) h[i] /= sum;\n  return h;\n}\n\nfunction getMag(h, f) {\n  var re = 0, im = 0, w = 2 * Math.PI * f;\n  for (var n = 0; n < h.length; n++) {\n    re += h[n] * Math.cos(w * n);\n    im -= h[n] * Math.sin(w * n);\n  }\n  return Math.sqrt(re * re + im * im);\n}\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nfunction updateAudio(hOut) {\n  if (!lab.values.play) {\n    stopAudio();\n    lastKey = '';\n    return;\n  }\n  var key = lab.values.fc.toFixed(2) + '_' + (lab.values.reversal ? 'R' : 'I');\n  if (key === lastKey && audioSrc) return;\n  lastKey = key;\n\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!masterGain) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0.18;\n    masterGain.connect(ac.destination);\n  }\n\n  var sr = ac.sampleRate;\n  var len = sr;\n  var buf = ac.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n  var freqsNorm = [0.05, 0.09, 0.13, 0.17, 0.21, 0.25, 0.29, 0.33, 0.37, 0.41, 0.45];\n  var amps = [];\n  for (var k = 0; k < freqsNorm.length; k++) {\n    amps.push(getMag(hOut, freqsNorm[k]) / freqsNorm.length);\n  }\n  for (var n = 0; n < len; n++) {\n    var t = n / sr;\n    var s = 0;\n    for (var k = 0; k < freqsNorm.length; k++) {\n      var hz = Math.round(freqsNorm[k] * 3600);\n      s += amps[k] * Math.sin(2 * Math.PI * hz * t);\n    }\n    data[n] = s * 1.6;\n  }\n\n  stopAudio();\n  audioSrc = ac.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(masterGain);\n  audioSrc.start();\n}\n\nfunction draw() {\n  var fc = lab.values.fc;\n  var rev = lab.values.reversal;\n  var showOrig = lab.values.showOriginal;\n\n  var hLp = makeLowPass(fc);\n  var hOut = new Array(51);\n  if (rev) {\n    for (var i = 0; i < 51; i++) {\n      hOut[i] = (Math.abs(i - 25) % 2 === 0 ? 1 : -1) * hLp[i];\n    }\n  } else {\n    for (var i = 0; i < 51; i++) hOut[i] = -hLp[i];\n    hOut[25] += 1.0;\n  }\n\n  updateAudio(hOut);\n\n  ctx.clearRect(0, 0, W, H);\n\n  var lx = 44, ly = 26, lw = 292, lh = 182;\n  var rx = 398, ry = 26, rw = 296, rh = 182;\n\n  function mapTY(val) { return ly + lh * (1 - (val + 0.45) / 1.45); }\n  function mapFY(val) { return ry + rh * (1 - val / 1.25); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n\n  var yTicksT = [-0.4, -0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0];\n  for (var i = 0; i < yTicksT.length; i++) {\n    var py = mapTY(yTicksT[i]);\n    ctx.beginPath(); ctx.moveTo(lx, py); ctx.lineTo(lx + lw, py); ctx.stroke();\n    ctx.fillText(yTicksT[i].toFixed(1), lx - 28, py + 3);\n  }\n  for (var s = 0; s <= 50; s += 10) {\n    var px = lx + (s / 50) * lw;\n    ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px, ly + lh); ctx.stroke();\n    ctx.fillText(String(s), px - 5, ly + lh + 13);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx, mapTY(0)); ctx.lineTo(lx + lw, mapTY(0)); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  var yTicksF = [0, 0.5, 1.0];\n  for (var i = 0; i < yTicksF.length; i++) {\n    var py = mapFY(yTicksF[i]);\n    ctx.beginPath(); ctx.moveTo(rx, py); ctx.lineTo(rx + rw, py); ctx.stroke();\n    ctx.fillText(yTicksF[i].toFixed(1), rx - 24, py + 3);\n  }\n  for (var f = 0; f <= 0.5001; f += 0.1) {\n    var px = rx + (f / 0.5) * rw;\n    ctx.beginPath(); ctx.moveTo(px, ry); ctx.lineTo(px, ry + rh); ctx.stroke();\n    ctx.fillText(f.toFixed(1), px - 8, ry + rh + 13);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  var accent = rev ? '#ec4899' : '#10b981';\n  var yZero = mapTY(0);\n  ctx.strokeStyle = accent;\n  ctx.fillStyle = accent;\n  ctx.lineWidth = 1.5;\n  for (var i = 0; i < 51; i++) {\n    var px = lx + (i / 50) * lw;\n    var py = mapTY(hOut[i]);\n    ctx.beginPath(); ctx.moveTo(px, yZero); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillRect(px - 2, py - 2, 4, 4);\n  }\n\n  if (showOrig) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var k = 0; k <= 120; k++) {\n      var f = 0.5 * k / 120;\n      var mag = getMag(hLp, f);\n      var px = rx + (f / 0.5) * rw;\n      var py = mapFY(mag);\n      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); \n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = accent;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var k = 0; k <= 120; k++) {\n    var f = 0.5 * k / 120;\n    var mag = getMag(hOut, f);\n    var px = rx + (f / 0.5) * rw;\n    var py = mapFY(mag);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var fcNew = rev ? (0.5 - fc) : fc;\n  var xCut = rx + (fcNew / 0.5) * rw;\n  ctx.save();\n  ctx.setLineDash([2, 3]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.3;\n  ctx.beginPath(); ctx.moveTo(xCut, ry); ctx.lineTo(xCut, ry + rh); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('时域滤波器核 h[n] (51点)', lx + 6, 16);\n  ctx.fillText('频域幅频响应 |H(f)|', rx + 6, 16);\n\n  ctx.fillStyle = accent;\n  ctx.font = '10px sans-serif';\n  ctx.fillText(rev ? '高通 (倒置: 隔点变号)' : '高通 (反转: δ[n]-h[n])', rx + 150, 16);\n  if (showOrig) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('-- 原低通', rx + 165, ry + 18);\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('fc_hp=' + fcNew.toFixed(2), Math.min(xCut + 4, rx + rw - 58), ry + 34);\n\n  lab.setReadout((rev ? '模式: 频谱倒置 (左右翻转) | ' : '模式: 频谱反转 (上下翻转) | ') + '原低通截止: ' + fc.toFixed(2) + ' Fs -> 高通截止: ' + fcNew.toFixed(2) + ' Fs | 中心样本 h[25]=' + hOut[25].toFixed(3));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "搭积木：用低通与高通核组合出带阻和带通滤波器",
      "paragraphs": [
        "有了低通滤波器核 `h_lp[n]` 和高通滤波器核 `h_hp[n]`，就可以像拼装系统框图一样构造出 **带阻（Band-Reject）** 与 **带通（Band-Pass）** 滤波器。",
        "**1. 核相加 = 带阻滤波器（并联系统）**：让信号同时流过并联的低通和高通滤波器再把输出相加。低通放行低频、高通放行高频，只要 **低通截止频率小于高通截止频率**，中间那段频率就会被两者同时拦住，形成带阻凹槽。等效到单级核，只需把两个核对应采样点直接相加即可（注意两核必须具备相同的对称中心，避免相位错位）。",
        "**2. 核卷积 = 带通滤波器（级联系统）**：让信号先经过低通滤波器，再串行进入高通滤波器。只有同时满足“低于低通截止频率”且“高于高通截止频率”的中间重叠频段才能顺利通过，形成带通滤波器。根据系统级联原理，单级总滤波器核等于两个滤波器核的 **时域卷积**。",
        "**3. 进阶组合技巧**：你还可以把两种手法混用！例如先将两个核 **相加** 做出一个带阻（Stop-Pass）滤波器，再对它执行一次 **频谱反转**（全部取反、中心加 1），同样能翻出一个漂亮的带通滤波器，而且核长度不会像卷积那样变长一倍。"
      ],
      "formula": {
        "expr": "h_br[n] = h_lp[n] + h_hp[n] ； h_bp[n] = h_lp[n] * h_hp[n]",
        "explain": "+ 表示两个对称对齐的核逐点相加（产生带阻）；* 表示两个核做时域线性卷积（产生带通，核长度由 N 变为 2N-1）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：核相加（带阻）与核卷积（带通）组合实验室",
      "instruction": "分别调节低通与高通的截止频率，切换「相加 (带阻)」或「卷积 (带通)」模式，观察右侧通带/阻带何时形成、何时会“重叠”或“全灭”，并可叠加频谱反转及播放实时音频对比。",
      "controls": [
        {
          "type": "slider",
          "id": "fcLp",
          "label": "低通截止频率 fc_LP",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.15,
          "unit": " Fs"
        },
        {
          "type": "slider",
          "id": "fcHp",
          "label": "高通截止频率 fc_HP",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.35,
          "unit": " Fs"
        },
        {
          "type": "toggle",
          "id": "convolve",
          "label": "组合方式 (关闭=核相加带阻, 开启=核卷积带通)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "invertOut",
          "label": "对组合结果再做频谱反转",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放组合滤波听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioSrc = null, masterGain = null, lastKey = '';\n\nfunction makeLowPass(fc) {\n  var h = new Array(51), sum = 0;\n  for (var i = 0; i < 51; i++) {\n    var m = i - 25;\n    var sinc = (m === 0) ? (2 * Math.PI * fc) : (Math.sin(2 * Math.PI * fc * m) / m);\n    var win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / 50) + 0.08 * Math.cos(4 * Math.PI * i / 50);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (var i = 0; i < 51; i++) h[i] /= sum;\n  return h;\n}\n\nfunction makeHighPass(fc) {\n  var lp = makeLowPass(fc);\n  var hp = new Array(51);\n  for (var i = 0; i < 51; i++) hp[i] = -lp[i];\n  hp[25] += 1.0;\n  return hp;\n}\n\nfunction convolveKernels(a, b) {\n  var out = new Array(a.length + b.length - 1);\n  for (var i = 0; i < out.length; i++) out[i] = 0;\n  for (var i = 0; i < a.length; i++) {\n    for (var j = 0; j < b.length; j++) {\n      out[i + j] += a[i] * b[j];\n    }\n  }\n  return out;\n}\n\nfunction getMag(h, f) {\n  var re = 0, im = 0, w = 2 * Math.PI * f;\n  for (var n = 0; n < h.length; n++) {\n    re += h[n] * Math.cos(w * n);\n    im -= h[n] * Math.sin(w * n);\n  }\n  return Math.sqrt(re * re + im * im);\n}\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nfunction updateAudio(hOut) {\n  if (!lab.values.play) {\n    stopAudio();\n    lastKey = '';\n    return;\n  }\n  var key = lab.values.fcLp.toFixed(2) + '_' + lab.values.fcHp.toFixed(2) + '_' + (lab.values.convolve ? 'C' : 'A') + '_' + (lab.values.invertOut ? 'I' : 'N');\n  if (key === lastKey && audioSrc) return;\n  lastKey = key;\n\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!masterGain) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0.18;\n    masterGain.connect(ac.destination);\n  }\n\n  var sr = ac.sampleRate;\n  var len = sr;\n  var buf = ac.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n  var freqsNorm = [0.05, 0.09, 0.13, 0.17, 0.21, 0.25, 0.29, 0.33, 0.37, 0.41, 0.45];\n  var amps = [];\n  for (var k = 0; k < freqsNorm.length; k++) {\n    amps.push(getMag(hOut, freqsNorm[k]) / freqsNorm.length);\n  }\n  for (var n = 0; n < len; n++) {\n    var t = n / sr;\n    var s = 0;\n    for (var k = 0; k < freqsNorm.length; k++) {\n      var hz = Math.round(freqsNorm[k] * 3600);\n      s += amps[k] * Math.sin(2 * Math.PI * hz * t);\n    }\n    data[n] = s * 1.6;\n  }\n\n  stopAudio();\n  audioSrc = ac.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(masterGain);\n  audioSrc.start();\n}\n\nfunction draw() {\n  var fcLp = lab.values.fcLp;\n  var fcHp = lab.values.fcHp;\n  var isConv = lab.values.convolve;\n  var invOut = lab.values.invertOut;\n\n  var hLp = makeLowPass(fcLp);\n  var hHp = makeHighPass(fcHp);\n  var hOut;\n  if (isConv) {\n    hOut = convolveKernels(hLp, hHp);\n  } else {\n    hOut = new Array(51);\n    for (var i = 0; i < 51; i++) hOut[i] = hLp[i] + hHp[i];\n  }\n  if (invOut) {\n    var c = (hOut.length - 1) / 2;\n    for (var i = 0; i < hOut.length; i++) hOut[i] = -hOut[i];\n    hOut[c] += 1.0;\n  }\n\n  updateAudio(hOut);\n\n  ctx.clearRect(0, 0, W, H);\n  var lx = 44, ly = 26, lw = 292, lh = 182;\n  var rx = 398, ry = 26, rw = 296, rh = 182;\n\n  function mapTY(val) { return ly + lh * (1 - (val + 0.5) / 1.6); }\n  function mapFY(val) { return ry + rh * (1 - val / 1.4); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n\n  var yTicksT = [-0.4, 0, 0.4, 0.8, 1.0];\n  for (var i = 0; i < yTicksT.length; i++) {\n    var py = mapTY(yTicksT[i]);\n    ctx.beginPath(); ctx.moveTo(lx, py); ctx.lineTo(lx + lw, py); ctx.stroke();\n    ctx.fillText(yTicksT[i].toFixed(1), lx - 28, py + 3);\n  }\n  var maxIdx = hOut.length - 1;\n  for (var s = 0; s <= maxIdx; s += (maxIdx === 100 ? 20 : 10)) {\n    var px = lx + (s / maxIdx) * lw;\n    ctx.beginPath(); ctx.moveTo(px, ly); ctx.lineTo(px, ly + lh); ctx.stroke();\n    ctx.fillText(String(s), px - 6, ly + lh + 13);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx, mapTY(0)); ctx.lineTo(lx + lw, mapTY(0)); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  var yTicksF = [0, 0.5, 1.0];\n  for (var i = 0; i < yTicksF.length; i++) {\n    var py = mapFY(yTicksF[i]);\n    ctx.beginPath(); ctx.moveTo(rx, py); ctx.lineTo(rx + rw, py); ctx.stroke();\n    ctx.fillText(yTicksF[i].toFixed(1), rx - 24, py + 3);\n  }\n  for (var f = 0; f <= 0.5001; f += 0.1) {\n    var px = rx + (f / 0.5) * rw;\n    ctx.beginPath(); ctx.moveTo(px, ry); ctx.lineTo(px, ry + rh); ctx.stroke();\n    ctx.fillText(f.toFixed(1), px - 8, ry + rh + 13);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  var accent = isConv ? '#10b981' : '#ec4899';\n  var yZero = mapTY(0);\n  ctx.strokeStyle = accent;\n  ctx.fillStyle = accent;\n  ctx.lineWidth = 1.3;\n  for (var i = 0; i < hOut.length; i++) {\n    var px = lx + (i / maxIdx) * lw;\n    var py = mapTY(hOut[i]);\n    ctx.beginPath(); ctx.moveTo(px, yZero); ctx.lineTo(px, py); ctx.stroke();\n    if (hOut.length <= 51 || i % 2 === 0) ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.65)';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (var k = 0; k <= 120; k++) {\n    var f = 0.5 * k / 120;\n    var px = rx + (f / 0.5) * rw;\n    var py = mapFY(getMag(hLp, f));\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.65)';\n  ctx.beginPath();\n  for (var k = 0; k <= 120; k++) {\n    var f = 0.5 * k / 120;\n    var px = rx + (f / 0.5) * rw;\n    var py = mapFY(getMag(hHp, f));\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = accent;\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var k = 0; k <= 120; k++) {\n    var f = 0.5 * k / 120;\n    var px = rx + (f / 0.5) * rw;\n    var py = mapFY(getMag(hOut, f));\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('组合后滤波器核 (' + hOut.length + '点)', lx + 6, 16);\n  ctx.fillText('叠加响应对比 |H(f)|', rx + 6, 16);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-- 低通(' + fcLp.toFixed(2) + ')', rx + 135, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('-- 高通(' + fcHp.toFixed(2) + ')', rx + 216, 16);\n\n  var status = '';\n  if (isConv) {\n    status = (fcHp < fcLp)\n      ? '有效带通区间: [' + fcHp.toFixed(2) + ', ' + fcLp.toFixed(2) + '] Fs'\n      : '警告: fc_HP >= fc_LP，通带无交集，信号被完全阻断！';\n  } else {\n    status = (fcLp < fcHp)\n      ? '有效带阻区间: [' + fcLp.toFixed(2) + ', ' + fcHp.toFixed(2) + '] Fs'\n      : '警告: fc_LP >= fc_HP，通带重叠，出现增益>1的凸起！';\n  }\n  if (invOut) status += ' (已再执行频谱反转)';\n  lab.setReadout((isConv ? '核卷积' : '核相加') + ' (长度 ' + hOut.length + ') | ' + status);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "频谱反转的两条死线：做 δ[n] - h[n] 时，原核必须具有左右偶对称（线性/零相位），且 +1 必须精准加在对称中心点上；否则相位无法对齐，相消处会出现严重纹波甚至完全失效。",
        "反转与倒置别混用截止频率：频谱反转（全部取反、中心加 1）是“上下翻转”，截止频率保持不变（0.15 还是 0.15）；频谱倒置（隔点取反）是“左右翻转”，截止频率会镜像变成 0.5 - fc（0.15 变成 0.35）。",
        "带通与带阻的截止频率大小铁律：用“核相加”拼带阻时，必须保证 fc_LP < fc_HP，中间才能凹出阻带；用“核卷积”拼带通时，必须保证 fc_HP < fc_LP，两个通带才有重叠窗口，否则整段频谱会被彻底掐死。",
        "算力与长度意识：两个长度为 N 的滤波器核相加，长度仍为 N；但做卷积组合后，核长度会暴涨为 2N - 1。若想省算力，可以先“相加”做带阻再做“频谱反转”得到带通，核长度保持 N 不变。"
      ]
    }
  ]
});
