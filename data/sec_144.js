window.__BOOK_REGISTER_SECTION__("sec_144", {
  "title": "反卷积：给被系统“拖尾”的信号做逆向还原 (Deconvolution)",
  "intuition": "反卷积就像给拍糊的照片或带有闷罐回声的老唱片做“逆向手术”——在频域用除法精准抵消物理设备强加的幅度和相位畸变，把信号还原成它本来该有的样子。",
  "blocks": [
    {
      "type": "concept",
      "heading": "无处不在的“寄生卷积”与反卷积的使命",
      "paragraphs": [
        "只要信号经过真实世界的物理传感器或传输通道，几乎不可避免地会被做一次**不想要的卷积（Unwanted Convolution）**。比如手抖拍出的运动模糊照片、长途电话里的回声、或者电子放大器有限的带宽导致的波形拖尾，本质上都是原始信号与物理系统脉冲响应卷积的结果。",
        "**反卷积（Deconvolution）**的核心目标，就是设计一个数字滤波器去补偿这种寄生畸变，尽可能恢复出卷积发生前的原始信号。如果物理系统的畸变特性（脉冲响应或频率响应）事先已知，这属于常规反卷积；如果老设备早已报废丢失、系统特性完全未知，则称为**盲反卷积（Blind Deconvolution）**，后者没有通用公式，必须结合具体物理背景做统计估计。",
        "在时域里，我们很难直接把卷积“拆开”——加法可以用减法撤销，乘法可以用除法撤销，但时域卷积的逆运算极其混乱。幸运的是，**时域的卷积对应频域的乘积**。原始信号里每一个频率的正弦波，经过寄生卷积后只是幅度被缩放、相位被偏移；只要进入频域，反卷积滤波器要做的事就瞬间变简单了：把被压低一半的幅度放大两倍，把超前 30 度的相位拨回 -30 度。"
      ],
      "formula": {
        "expr": "F_deconv(f) = D(f) / H(f)",
        "explain": "H(f) 是物理系统导致的已知畸变频率响应，D(f) 是我们期望还原出的目标脉冲频谱，F_deconv(f) 就是反卷积滤波器的频率响应。由于非对称物理脉冲（如传感器拖尾）具有非零相位，这里的除法必须是同时处理幅度与相位的复数除法，求出 F_deconv(f) 后再用 IDFT 截断加窗即可得到滤波器核。"
      }
    },
    {
      "type": "lab",
      "heading": "实时交互：伽马射线脉冲压缩与“贪心”放大噪声的代价",
      "instruction": "拖动「目标压缩锐度」观察重叠脉冲被锐化分离的过程；再调高「传感器噪声」并改变「高频增益上限」，观察过度追求窄脉冲如何引爆高频噪声。",
      "controls": [
        {
          "type": "slider",
          "id": "sharpness",
          "label": "目标压缩锐度",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 5,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "传感器噪声",
          "min": 0,
          "max": 10,
          "step": 0.5,
          "value": 1.5,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "gainCap",
          "label": "高频增益上限",
          "min": 2,
          "max": 40,
          "step": 1,
          "value": 16,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showTrue",
          "label": "显示真实脉冲位置",
          "value": true
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height;\nconst ctx = lab.ctx;\nconst N = 128;\nconst cosT = new Float64Array(N);\nconst sinT = new Float64Array(N);\nfor (let i = 0; i < N; i++) {\n  const a = (2 * Math.PI * i) / N;\n  cosT[i] = Math.cos(a);\n  sinT[i] = Math.sin(a);\n}\nconst noiseArr = new Float64Array(N);\nlet seed = 1337;\nfor (let i = 0; i < N; i++) {\n  seed = (seed * 16807) % 2147483647;\n  const u1 = seed / 2147483647;\n  seed = (seed * 16807) % 2147483647;\n  const u2 = seed / 2147483647;\n  noiseArr[i] = (u1 + u2 - 1.0) * 1.2;\n}\nfunction dft(reIn, imIn) {\n  const re = new Float64Array(N), im = new Float64Array(N);\n  for (let k = 0; k < N; k++) {\n    let sr = 0, si = 0;\n    for (let n = 0; n < N; n++) {\n      const idx = (k * n) & (N - 1);\n      const c = cosT[idx], s = -sinT[idx];\n      sr += reIn[n] * c - imIn[n] * s;\n      si += reIn[n] * s + imIn[n] * c;\n    }\n    re[k] = sr; im[k] = si;\n  }\n  return { re, im };\n}\nfunction idft(reIn, imIn) {\n  const re = new Float64Array(N), im = new Float64Array(N);\n  for (let n = 0; n < N; n++) {\n    let sr = 0, si = 0;\n    for (let k = 0; k < N; k++) {\n      const idx = (k * n) & (N - 1);\n      const c = cosT[idx], s = sinT[idx];\n      sr += reIn[k] * c - imIn[k] * s;\n      si += reIn[k] * s + imIn[k] * c;\n    }\n    re[n] = sr / N; im[n] = si / N;\n  }\n  return { re, im };\n}\nconst zeros = new Float64Array(N);\nconst h = new Float64Array(N);\nfor (let n = 0; n < 64; n++) h[n] = Math.exp(-n / 10);\nconst HF = dft(h, zeros);\nconst events = [{ pos: 18, amp: 1.0 }, { pos: 33, amp: 0.85 }, { pos: 66, amp: 0.72 }];\nconst yClean = new Float64Array(N);\nfor (let e = 0; e < events.length; e++) {\n  const ev = events[e];\n  for (let n = ev.pos; n < N && n - ev.pos < 64; n++) {\n    yClean[n] += ev.amp * h[n - ev.pos];\n  }\n}\nfunction render() {\n  const sharp = lab.values.sharpness;\n  const noisePct = lab.values.noise;\n  const cap = lab.values.gainCap;\n  const showTrue = lab.values.showTrue;\n  const halfW = Math.max(2, Math.round(21 - sharp * 1.75));\n  const d = new Float64Array(N);\n  for (let k = -halfW; k <= halfW; k++) {\n    const u = (k + halfW) / (2 * halfW);\n    const val = 0.42 - 0.5 * Math.cos(2 * Math.PI * u) + 0.08 * Math.cos(4 * Math.PI * u);\n    d[(k + N) & (N - 1)] = val;\n  }\n  const y = new Float64Array(N);\n  for (let n = 0; n < N; n++) y[n] = yClean[n] + (noisePct / 100) * noiseArr[n];\n  const DF = dft(d, zeros);\n  const YF = dft(y, zeros);\n  const OR = new Float64Array(N), OI = new Float64Array(N);\n  const gainArr = new Float64Array(65), rawGainArr = new Float64Array(65);\n  let rawMax = 0, usedMax = 0;\n  for (let k = 0; k < N; k++) {\n    const denom = HF.re[k] * HF.re[k] + HF.im[k] * HF.im[k] + 1e-9;\n    let fr = (DF.re[k] * HF.re[k] + DF.im[k] * HF.im[k]) / denom;\n    let fi = (DF.im[k] * HF.re[k] - DF.re[k] * HF.im[k]) / denom;\n    const g = Math.hypot(fr, fi);\n    if (g > rawMax) rawMax = g;\n    if (g > cap) {\n      const scale = cap / g;\n      fr *= scale; fi *= scale;\n    }\n    const gUsed = Math.hypot(fr, fi);\n    if (gUsed > usedMax) usedMax = gUsed;\n    if (k <= 64) { rawGainArr[k] = g; gainArr[k] = gUsed; }\n    OR[k] = YF.re[k] * fr - YF.im[k] * fi;\n    OI[k] = YF.re[k] * fi + YF.im[k] * fr;\n  }\n  const out = idft(OR, OI).re;\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  const lx = 38, lw = 395, ly = 26, lh = 182;\n  const rx = 468, rw = 232, ry = 26, rh = 182;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const yy = ly + (lh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n    const yy2 = ry + (rh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, yy2); ctx.lineTo(rx + rw, yy2); ctx.stroke();\n  }\n  const mapY = (v) => ly + lh - ((v + 0.4) / 2.0) * lh;\n  const zeroY = mapY(0);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx, zeroY); ctx.lineTo(lx + lw, zeroY); ctx.stroke();\n  const nVis = 92;\n  if (showTrue) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.5;\n    for (let e = 0; e < events.length; e++) {\n      const px = lx + (events[e].pos / nVis) * lw;\n      const py = mapY(events[e].amp);\n      ctx.beginPath(); ctx.moveTo(px, zeroY); ctx.lineTo(px, py); ctx.stroke();\n      ctx.fillStyle = '#38bdf8';\n      ctx.beginPath(); ctx.arc(px, py, 3, 0, Math.PI * 2); ctx.fill();\n    }\n    ctx.setLineDash([]);\n  }\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let n = 0; n <= nVis; n++) {\n    const px = lx + (n / nVis) * lw;\n    const py = Math.max(ly - 8, Math.min(ly + lh + 8, mapY(y[n])));\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let n = 0; n <= nVis; n++) {\n    const px = lx + (n / nVis) * lw;\n    const py = Math.max(ly - 8, Math.min(ly + lh + 8, mapY(out[n])));\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  const maxPlotG = 40;\n  const mapGY = (g) => ry + rh - (Math.min(g, maxPlotG) / maxPlotG) * rh;\n  const capY = mapGY(cap);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.setLineDash([5, 4]);\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(rx, capY); ctx.lineTo(rx + rw, capY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = 'rgba(236,72,153,0.35)';\n  ctx.setLineDash([3, 3]);\n  ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (let k = 0; k <= 64; k++) {\n    const px = rx + (k / 64) * rw;\n    const py = mapGY(rawGainArr[k]);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let k = 0; k <= 64; k++) {\n    const px = rx + (k / 64) * rw;\n    const py = mapGY(gainArr[k]);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('时域：重叠拖尾(橙) vs 反卷积还原(绿)', lx, 16);\n  ctx.fillText('频域：滤波器增益 |F(f)| (粉)', rx, 16);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0', lx - 12, zeroY + 4);\n  ctx.fillText('1.0', lx - 22, mapY(1.0) + 4);\n  ctx.fillText('0', rx - 14, ry + rh + 4);\n  ctx.fillText('40x', rx - 24, ry + 8);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('上限 ' + cap + 'x', rx + rw - 52, Math.max(ry + 12, capY - 5));\n  let noiseOut = 0;\n  for (let n = 80; n < 115; n++) noiseOut += out[n] * out[n];\n  noiseOut = Math.sqrt(noiseOut / 35);\n  lab.setReadout('目标脉冲宽: ' + (2 * halfW + 1) + ' 样点 | 理论峰值增益: ' + rawMax.toFixed(1) + 'x (限幅后 ' + usedMax.toFixed(1) + 'x) | 底噪RMS: ' + noiseOut.toFixed(3));\n}\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "物理极限：为什么不能“贪心”地把信号还原成绝对尖峰？",
      "paragraphs": [
        "在上面的实验中你会发现，如果试图把拖尾脉冲压缩得过窄，还原波形很快就会被毛刺淹没。原因在于：**目标脉冲越窄，它包含的高频分量就越多；但大多数物理系统的寄生卷积（如光电器件响应、机械惯性、相机失焦）本质上都是低通滤波器，早已把高频分量大幅衰减。** 为了把微弱的高频成分救回来，反卷积滤波器必须在高频段提供几十倍甚至上百倍的惊人增益。",
        "这就撞上了现实工程的两堵高墙。第一堵墙是**模型精度误差**：当某个频率需要放大 28 倍而你因为温度漂移或器件差异放大了 30 倍时，这点微小偏差会被急剧放大，彻底毁掉输出波形。第二堵墙则是更绝望的**本底噪声与频谱零点**：一旦原始信号的高频分量被物理系统衰减到电路本底噪声之下，那部分信息就已经永久湮灭了——再神通广大的算法去乘以一个巨大增益，放大出来的全都是噪声；如果某个频点被彻底衰减到零，反卷积甚至会试图构造无穷大的增益导致系统崩溃。",
        "因此，工程上的反卷积永远是一场**“分辨率提升”与“噪声放大”之间的权衡**。必须对高频增益设置上限（正则化截断），并采用逐步测试的迭代思路：如果信号干净且稳定，通常能把时间分辨率压缩 5 到 10 倍；如果信号本身嘈杂或随时间漂移，能改善 1 到 2 倍就已经是极限。"
      ],
      "formula": {
        "expr": "Y_out(f) = [X(f)·H(f) + N(f)] · [D(f) / H(f)] = X(f)·D(f) + N(f)·[D(f) / H(f)]",
        "explain": "传感器输出总是信号 X(f)·H(f) 叠加噪声 N(f)。反卷积在成功把信号还原为 X(f)·D(f) 的同时，也不可避免地把本底噪声乘上了放大系数 D(f)/H(f)。当 H(f) 在高频趋近于零时，噪声项会瞬间失控爆炸。"
      }
    },
    {
      "type": "concept",
      "heading": "盲反卷积的经典艺术：拯救百年前的卡鲁索老唱片",
      "paragraphs": [
        "反卷积不仅能修复时域脉冲，还能修复**频域编码的音频信号**。一个载入信号处理史册的经典案例，是 20 世纪 70 年代学者们用数字盲反卷积技术修复传奇男高音恩里科·卡鲁索（Enrico Caruso）在二十世纪初录制的留声机唱片。",
        "当时的机械录音设备极其简陋，需要歌手对着一根长长的金属喇叭管（Recording Horn）歌唱，用声波直接驱动刻针。这根细长管子带来了灾难性的**声学共振**：每当卡鲁索唱到某些特定频率时，管腔产生剧烈共振，录音音量会突兀地暴增，听起来刺耳发闷。按理说，只要知道这根喇叭管的频率响应 `H(f)`，设计一个在共振峰位置精准“挖坑”的反卷积滤波器 `1/H(f)` 就能恢复天籁。",
        "棘手之处在于，当年那根录音喇叭早已销毁无踪，我们手里只有被污染后的唱片频谱 `Y(f)`，完全不知道 `H(f)` 长什么样——这是一个典型的**盲反卷积问题**。研究者的破局思路非常巧妙：**合理假设统计规律**。他们找来现代歌唱家在无失真现代设备上演唱同一首曲目，分别将老唱片和现代录音切成大量短片段计算平均幅度谱。把老唱片的平均谱除以现代录音的平均谱（以及借助更精细的同态滤波平滑提取包络），就能剥离出隐藏的喇叭共振峰曲线，从而设计出反向抵消尖峰的数字滤波器，让百年前的歌声重获新生。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "Web Audio 听觉实验室：老式号角共振的“盲反卷积”听感修复",
      "instruction": "点击播放按钮聆听模拟歌剧旋律通过老式喇叭号角后的“刺耳闷罐共振”，随后拉高「反卷积修复度」至 100% 感受平直还原效果；再尝试偏置「盲估计频偏」体验估计不准带来的音色畸变。",
      "controls": [
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放音频对比",
          "activeLabel": "⏸ 暂停音频"
        },
        {
          "type": "slider",
          "id": "hornRes",
          "label": "号角共振畸变",
          "min": 0,
          "max": 18,
          "step": 1,
          "value": 13,
          "unit": " dB"
        },
        {
          "type": "slider",
          "id": "deconvAmt",
          "label": "反卷积修复度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "freqOffset",
          "label": "盲估计频偏误差",
          "min": -250,
          "max": 250,
          "step": 10,
          "value": 0,
          "unit": " Hz"
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height;\nconst ctx = lab.ctx;\nconst F1 = 720, F2 = 1580, Q_VAL = 6.5;\nfunction peakingDb(f, f0, q, gainDb) {\n  if (Math.abs(gainDb) < 0.01) return 0;\n  const fs = 44100;\n  const A = Math.pow(10, gainDb / 40);\n  const w0 = (2 * Math.PI * f0) / fs;\n  const alpha = Math.sin(w0) / (2 * q);\n  const b0 = 1 + alpha * A, b1 = -2 * Math.cos(w0), b2 = 1 - alpha * A;\n  const a0 = 1 + alpha / A, a1 = -2 * Math.cos(w0), a2 = 1 - alpha / A;\n  const w = (2 * Math.PI * f) / fs;\n  const c1 = Math.cos(w), s1 = -Math.sin(w);\n  const c2 = Math.cos(2 * w), s2 = -Math.sin(2 * w);\n  const numR = b0 + b1 * c1 + b2 * c2;\n  const numI = b1 * s1 + b2 * s2;\n  const denR = a0 + a1 * c1 + a2 * c2;\n  const denI = a1 * s1 + a2 * s2;\n  const mag = Math.sqrt((numR * numR + numI * numI) / (denR * denR + denI * denI));\n  return 20 * Math.log10(Math.max(1e-6, mag));\n}\nlet audio = null;\nlet curPitch = 220;\nconst notes = [0, 4, 7, 12, 9, 7, 4, 5];\nfunction ensureAudio() {\n  const wantPlay = lab.values.play;\n  if (wantPlay && !audio) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    const osc1 = ac.createOscillator();\n    const osc2 = ac.createOscillator();\n    const vib = ac.createOscillator();\n    const vibGain = ac.createGain();\n    osc1.type = 'sawtooth';\n    osc2.type = 'triangle';\n    osc1.frequency.value = 220;\n    osc2.frequency.value = 220.8;\n    vib.frequency.value = 5.2;\n    vibGain.gain.value = 2.8;\n    vib.connect(vibGain);\n    vibGain.connect(osc1.frequency);\n    vibGain.connect(osc2.frequency);\n    const warmLP = ac.createBiquadFilter();\n    warmLP.type = 'lowpass';\n    warmLP.frequency.value = 2900;\n    const horn1 = ac.createBiquadFilter();\n    const horn2 = ac.createBiquadFilter();\n    const dec1 = ac.createBiquadFilter();\n    const dec2 = ac.createBiquadFilter();\n    horn1.type = 'peaking'; horn2.type = 'peaking';\n    dec1.type = 'peaking'; dec2.type = 'peaking';\n    horn1.Q.value = Q_VAL; horn2.Q.value = Q_VAL;\n    dec1.Q.value = Q_VAL; dec2.Q.value = Q_VAL;\n    const master = ac.createGain();\n    master.gain.value = 0.14;\n    osc1.connect(warmLP);\n    osc2.connect(warmLP);\n    warmLP.connect(horn1);\n    horn1.connect(horn2);\n    horn2.connect(dec1);\n    dec1.connect(dec2);\n    dec2.connect(master);\n    master.connect(ac.destination);\n    osc1.start(); osc2.start(); vib.start();\n    audio = { ac, osc1, osc2, vib, horn1, horn2, dec1, dec2, master };\n  } else if (!wantPlay && audio) {\n    try { audio.osc1.stop(); audio.osc2.stop(); audio.vib.stop(); audio.master.disconnect(); } catch (e) {}\n    audio = null;\n  }\n  if (audio) {\n    const res = lab.values.hornRes;\n    const amt = lab.values.deconvAmt / 100;\n    const off = lab.values.freqOffset;\n    const t = audio.ac.currentTime;\n    audio.horn1.frequency.setTargetAtTime(F1, t, 0.03);\n    audio.horn1.gain.setTargetAtTime(res, t, 0.03);\n    audio.horn2.frequency.setTargetAtTime(F2, t, 0.03);\n    audio.horn2.gain.setTargetAtTime(res * 0.85, t, 0.03);\n    audio.dec1.frequency.setTargetAtTime(Math.max(150, F1 + off), t, 0.03);\n    audio.dec1.gain.setTargetAtTime(-res * amt, t, 0.03);\n    audio.dec2.frequency.setTargetAtTime(Math.max(150, F2 + off), t, 0.03);\n    audio.dec2.gain.setTargetAtTime(-res * 0.85 * amt, t, 0.03);\n  }\n}\nfunction draw(timeSec) {\n  const res = lab.values.hornRes;\n  const amt = lab.values.deconvAmt / 100;\n  const off = lab.values.freqOffset;\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  const px0 = 56, pw = 636, py0 = 26, ph = 182;\n  const fMin = 150, fMax = 2800;\n  const mapX = (f) => px0 + ((f - fMin) / (fMax - fMin)) * pw;\n  const mapY = (db) => py0 + ph * 0.5 - (db / 22) * (ph * 0.48);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let db = -18; db <= 18; db += 6) {\n    const yy = mapY(db);\n    ctx.beginPath(); ctx.moveTo(px0, yy); ctx.lineTo(px0 + pw, yy); ctx.stroke();\n  }\n  for (let f = 500; f <= 2500; f += 500) {\n    const xx = mapX(f);\n    ctx.beginPath(); ctx.moveTo(xx, py0); ctx.lineTo(xx, py0 + ph); ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(f + 'Hz', xx - 14, py0 + ph + 14);\n  }\n  const zeroY = mapY(0);\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(px0, zeroY); ctx.lineTo(px0 + pw, zeroY); ctx.stroke();\n  if (audio) {\n    for (let h = 1; h <= 8; h++) {\n      const fh = curPitch * h;\n      if (fh >= fMin && fh <= fMax) {\n        const hx = mapX(fh);\n        ctx.strokeStyle = 'rgba(248,250,252,0.18)';\n        ctx.setLineDash([2, 3]);\n        ctx.beginPath(); ctx.moveTo(hx, py0); ctx.lineTo(hx, py0 + ph); ctx.stroke();\n        ctx.setLineDash([]);\n      }\n    }\n  }\n  const steps = 220;\n  const hornCurve = [], decCurve = [], netCurve = [];\n  let maxErr = 0;\n  for (let i = 0; i <= steps; i++) {\n    const f = fMin + ((fMax - fMin) * i) / steps;\n    const hDb = peakingDb(f, F1, Q_VAL, res) + peakingDb(f, F2, Q_VAL, res * 0.85);\n    const dDb = peakingDb(f, Math.max(150, F1 + off), Q_VAL, -res * amt) + peakingDb(f, Math.max(150, F2 + off), Q_VAL, -res * 0.85 * amt);\n    const nDb = hDb + dDb;\n    if (Math.abs(nDb) > maxErr) maxErr = Math.abs(nDb);\n    hornCurve.push(hDb); decCurve.push(dDb); netCurve.push(nDb);\n  }\n  function plot(arr, color, lw, dash) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    ctx.setLineDash(dash || []);\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const xx = px0 + (i / steps) * pw;\n      const yy = Math.max(py0 - 4, Math.min(py0 + ph + 4, mapY(arr[i])));\n      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n  plot(hornCurve, '#f59e0b', 1.8, [4, 3]);\n  plot(decCurve, '#38bdf8', 1.8, [4, 3]);\n  plot(netCurve, '#10b981', 2.6, null);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('+18dB', 10, mapY(18) + 4);\n  ctx.fillText('0 dB', 18, zeroY + 4);\n  ctx.fillText('-18dB', 12, mapY(-18) + 4);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('--- 号角共振 H(f)', 60, 16);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('--- 盲反卷积 F(f)', 195, 16);\n  ctx.fillStyle = '#10b981'; ctx.fillText('━━ 净还原频响 H·F(f)', 335, 16);\n  const status = audio ? '播放中 (基频 ' + curPitch.toFixed(0) + ' Hz)' : '已静音';\n  lab.setReadout(status + ' | 最大残留响度波动: ±' + maxErr.toFixed(1) + ' dB | 目标共振峰: ' + F1 + 'Hz / ' + F2 + 'Hz');\n}\nlab.onUpdate(() => {\n  ensureAudio();\n  draw(0);\n});\nlab.onLoop((dt, timeSec) => {\n  if (audio) {\n    const idx = Math.floor(timeSec / 0.55) % notes.length;\n    curPitch = 210 * Math.pow(2, notes[idx] / 12);\n    const t = audio.ac.currentTime;\n    audio.osc1.frequency.setTargetAtTime(curPitch, t, 0.04);\n    audio.osc2.frequency.setTargetAtTime(curPitch * 1.003, t, 0.04);\n  }\n  draw(timeSec);\n});\ndraw(0);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要在时域硬刚反卷积：直接对时域卷积做逆向推导极度困难，标准工程套路永远是转入频域做复数除法 F(f) = D(f) / H(f)，并切记保留 H(f) 的相位信息，再通过 IDFT 加窗得到卷积核。",
        "绝对不要把被噪声淹没的高频强行拉回来：所有物理系统都伴随低通效应与噪声，一旦高频信噪比跌破底线，过高的逆向增益只会放大噪声；必须对高频增益设限，通过实验迭代寻找不崩溃的最大压缩比。",
        "盲反卷积的本质是“用统计先验补全未知参数”：当畸变设备的响应未知时，可利用同类型现代参考信号对比平均幅度谱，但频点对齐稍有误差就会在还原曲线上制造出新的“一峰一谷”听觉伪影。"
      ]
    }
  ]
});
