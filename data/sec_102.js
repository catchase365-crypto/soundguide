window.__BOOK_REGISTER_SECTION__("sec_102", {
  "title": "时域与频域的桥梁：信号的频谱分析 (Time Domain & Frequency Domain Spectral Analysis)",
  "intuition": "把杂乱的时域采样分段加窗后做 DFT 并对多次频谱求平均，就能像用长曝光望远镜一样，让淹没在随机噪声里的微弱周期信号和干扰峰值清晰浮现。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 频谱分析的标准流水线：分段、加窗、DFT 与谱平均",
      "paragraphs": [
        "在真实工程中（例如书中模拟的以每秒 160 次采样的水下麦克风信号），直接盯着时域波形往往只能看到一团剧烈抖动的毛刺。要看清信号里究竟藏着哪些频率成分，我们需要完成一次从**时域（Time Domain）**到**频域（Frequency Domain）**的完整变换流水线。",
        "第一步是**加窗截断（Windowing）**：直接截取一段有限长信号（如 256 个采样点），相当于乘以一个矩形窗，边缘的突变会带来严重的频谱泄漏。因此我们先将信号乘以平滑过渡的**汉明窗（Hamming window）**，把两端压低到接近零，再送入离散傅里叶变换（DFT）求取**幅度谱**。",
        "第二步是**分段平均（Averaged Spectrum）**：单次 256 点 DFT 得到的频谱依然充满锯齿状的随机起伏，很容易把微弱信号吞没。如果把长时间采集的数据切成大量等长片段（例如将 100 段甚至 10,000 段 16,384 点的频谱累加求平均），由于随机噪声在各段之间互不相关，平均后噪声的起伏会大幅收敛变得平滑，而稳定的周期信号峰值则会巍然屹立，从而同时实现**高频率分辨率**与**低噪声底**。"
      ],
      "formula": {
        "expr": "P_avg[k] = (1 / K) * Σ |DFT(x_m[n] · w[n])_k|  (m = 1 ... K)",
        "explain": "x_m[n] 是第 m 段时域信号，w[n] 是窗函数（如汉明窗），对 K 段加窗信号分别做 DFT 取幅度后求平均，随机噪声的方差随段数 K 增加而下降，稳定频率分量保留下来。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 解剖真实频谱中的三大核心特征",
      "paragraphs": [
        "当你用上述方法得到一张高质量频谱图（如书中对水听器信号的分析）时，几乎所有实测信号都会呈现出**三类典型特征**：",
        "**（1）随机噪声（Random Noise）**：在 10~70 Hz 之间是一片相对平坦的底噪，叫做**白噪声（White Noise）**——就像白光包含等量的所有颜色一样，白噪声在各频率上能量均等，源于时域噪声样本之间的互不相关（如电子热运动、水流声）。在 70 Hz 以上，幅度迅速跌落，这是**抗混叠滤波器（Antialias Filter）**在 80 Hz（奈奎斯特频率）附近的滚降特性；如果看不到这种平缓跌落，往往意味着系统已经发生了混叠！而在 10 Hz 以下幅度急剧飙升的神秘成分叫做 **1/f 噪声（粉红噪声/闪烁噪声）**，从晶体管到高速公路车流密度都能测到它，它与白噪声的转折点通常落在 1~100 Hz。",
        "**（2）干扰信号（Interfering Signals）**：频谱上尖锐的孤立峰值往往来自外部电磁或机械串扰。最经典的是 **60 Hz（中国为 50 Hz）工频电源干扰**以及它的整数倍谐波（120、180 Hz 等，因电网波形非理想正弦）；开关电源常在 25~40 kHz 制造尖峰；广播电视在兆赫兹级产生干扰；而机械振动引起的**微音效应（Microphonics）**常在 10~100 Hz 造成低频假峰。",
        "**（3）真实信号（Real Signals）**：非正弦周期信号在频域表现为**基频（Fundamental）加谐波（Harmonics）**。例如水下 13 Hz 的强峰配合 26 Hz（二次谐波）、39 Hz（三次谐波），可能正是一艘潜艇的三叶螺旋桨以每秒 4.33 转旋转发出的声音——这正是**被动声呐（Passive Sonar）**识别水下目标的核心原理。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：水听器频谱解剖、谱平均与实时听觉对比",
      "instruction": "拖动「频谱平均段数」观察白噪声毛刺如何被压平、13/26/39 Hz 潜艇螺旋桨谐波如何浮现；开启「播放水听器模拟音」并切换「60 Hz 电网干扰」与「白噪声强度」，用眼睛和耳朵同时分辨真实信号、工频干扰与噪声（为适配扬声器，音频中的螺旋桨谐波已移调至 130/260/390 Hz 以便清晰辨听）。",
      "controls": [
        {
          "type": "slider",
          "id": "averages",
          "label": "频谱平均段数 K",
          "min": 1,
          "max": 100,
          "step": 1,
          "value": 1,
          "unit": " 段"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "白噪声强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "hum60",
          "label": "叠加 60 Hz 电网干扰",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放水听器模拟音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar N = 256, FS = 160;\nvar audioCtx = null, audioState = null;\n\nfunction fft(re, im) {\n  var n = re.length, j = 0, i, k, m, half, wr, wi, wpr, wpi, tr, ti, tmp;\n  for (i = 0; i < n; i++) {\n    if (i < j) {\n      tmp = re[i]; re[i] = re[j]; re[j] = tmp;\n      tmp = im[i]; im[i] = im[j]; im[j] = tmp;\n    }\n    m = n >> 1;\n    while (m >= 1 && j >= m) { j -= m; m >>= 1; }\n    j += m;\n  }\n  for (half = 1; half < n; half <<= 1) {\n    var theta = -Math.PI / half;\n    wpr = Math.cos(theta); wpi = Math.sin(theta);\n    wr = 1; wi = 0;\n    for (k = 0; k < half; k++) {\n      for (i = k; i < n; i += half << 1) {\n        j = i + half;\n        tr = wr * re[j] - wi * im[j];\n        ti = wr * im[j] + wi * re[j];\n        re[j] = re[i] - tr; im[j] = im[i] - ti;\n        re[i] += tr; im[i] += ti;\n      }\n      tmp = wr;\n      wr = tmp * wpr - wi * wpi;\n      wi = tmp * wpi + wi * wpr;\n    }\n  }\n}\n\nfunction updateAudio() {\n  var wantPlay = !!lab.values.play;\n  var noiseLvl = lab.values.noise;\n  var humOn = !!lab.values.hum60;\n  if (wantPlay && !audioState) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    var master = audioCtx.createGain();\n    master.gain.value = 0.25;\n    master.connect(audioCtx.destination);\n\n    var freqs = [130, 260, 390], gains = [0.38, 0.14, 0.10];\n    var oscs = [];\n    for (var i = 0; i < freqs.length; i++) {\n      var o = audioCtx.createOscillator(), g = audioCtx.createGain();\n      o.type = 'sine'; o.frequency.value = freqs[i]; g.gain.value = gains[i];\n      o.connect(g); g.connect(master); o.start();\n      oscs.push(o);\n    }\n\n    var humOsc1 = audioCtx.createOscillator(), humOsc2 = audioCtx.createOscillator();\n    var humGain = audioCtx.createGain();\n    humOsc1.type = 'sine'; humOsc1.frequency.value = 60;\n    humOsc2.type = 'sine'; humOsc2.frequency.value = 180;\n    var humSub = audioCtx.createGain(); humSub.gain.value = 0.25;\n    humOsc1.connect(humGain);\n    humOsc2.connect(humSub); humSub.connect(humGain);\n    humGain.gain.value = humOn ? 0.35 : 0.0;\n    humGain.connect(master);\n    humOsc1.start(); humOsc2.start();\n    oscs.push(humOsc1, humOsc2);\n\n    var bufLen = audioCtx.sampleRate * 2;\n    var buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);\n    var data = buf.getChannelData(0);\n    for (var b = 0; b < bufLen; b++) data[b] = Math.random() * 2 - 1;\n    var noiseSrc = audioCtx.createBufferSource();\n    noiseSrc.buffer = buf; noiseSrc.loop = true;\n    var lp = audioCtx.createBiquadFilter();\n    lp.type = 'lowpass'; lp.frequency.value = 1400;\n    var nGain = audioCtx.createGain();\n    nGain.gain.value = noiseLvl * 0.45;\n    noiseSrc.connect(lp); lp.connect(nGain); nGain.connect(master);\n    noiseSrc.start();\n\n    audioState = { master: master, oscs: oscs, noiseSrc: noiseSrc, humGain: humGain, nGain: nGain };\n  } else if (wantPlay && audioState) {\n    var t = audioCtx.currentTime;\n    audioState.humGain.gain.setTargetAtTime(humOn ? 0.35 : 0.0, t, 0.03);\n    audioState.nGain.gain.setTargetAtTime(noiseLvl * 0.45, t, 0.03);\n  } else if (!wantPlay && audioState) {\n    try {\n      audioState.oscs.forEach(function(o) { o.stop(); });\n      audioState.noiseSrc.stop();\n      audioState.master.disconnect();\n    } catch (e) {}\n    audioState = null;\n  }\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  var avgK = Math.round(lab.values.averages);\n  var noiseLvl = lab.values.noise;\n  var humOn = !!lab.values.hum60;\n\n  var seed = 1337;\n  function rand() {\n    seed = (seed * 1664525 + 1013904223) >>> 0;\n    return seed / 4294967296;\n  }\n  function randn() {\n    return (rand() + rand() + rand() - 1.5) * 1.4;\n  }\n\n  var win = new Float64Array(N), winSum = 0;\n  for (var n = 0; n < N; n++) {\n    win[n] = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (N - 1));\n    winSum += win[n];\n  }\n\n  var half = N / 2 + 1;\n  var specAvg = new Float64Array(half);\n  var firstTimeSeg = new Float64Array(N);\n  var re = new Float64Array(N), im = new Float64Array(N);\n  var drift = 0;\n\n  for (var seg = 0; seg < avgK; seg++) {\n    var ph1 = rand() * 6.283, ph2 = rand() * 6.283, ph3 = rand() * 6.283, ph4 = rand() * 6.283;\n    for (var i = 0; i < N; i++) {\n      var t = i / FS;\n      var sig = 0.42 * Math.cos(2 * Math.PI * 13 * t + ph1)\n              + 0.14 * Math.cos(2 * Math.PI * 26 * t + ph2)\n              + 0.11 * Math.cos(2 * Math.PI * 39 * t + ph3);\n      if (humOn) sig += 0.28 * Math.cos(2 * Math.PI * 60 * t + ph4);\n      var wn = randn() * noiseLvl * 1.15;\n      drift = 0.94 * drift + 0.16 * randn() * (0.35 + noiseLvl * 0.65);\n      var total = sig + wn + drift;\n      if (seg === 0) firstTimeSeg[i] = total;\n      re[i] = total * win[i];\n      im[i] = 0;\n    }\n    fft(re, im);\n    for (var k = 0; k < half; k++) {\n      var f = (k / N) * FS;\n      var aa = 1 / Math.sqrt(1 + Math.pow(f / 72, 12));\n      var mag = (2 * Math.sqrt(re[k] * re[k] + im[k] * im[k]) / winSum) * 14 * aa;\n      specAvg[k] += mag;\n    }\n  }\n  for (var k = 0; k < half; k++) specAvg[k] /= avgK;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  // Left: Time Domain\n  var tx = 18, ty = 26, tw = 200, th = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = ty + (th * g) / 4;\n    ctx.beginPath(); ctx.moveTo(tx, gy); ctx.lineTo(tx + tw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(tx, ty, tw, th);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('时域信号 (单段样本 0~127)', tx, ty - 8);\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  for (var s = 0; s < 128; s++) {\n    var px = tx + (s / 127) * tw;\n    var py = ty + th / 2 - Math.max(-1.8, Math.min(1.8, firstTimeSeg[s])) * (th * 0.26);\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Arrow\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('加窗', 226, 108);\n  ctx.fillText('DFT➜', 224, 124);\n\n  // Right: Frequency Domain\n  var fx = 272, fy = 26, fw = 428, fh = 180;\n  var maxAmp = 10;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fg = 0; fg <= 8; fg++) {\n    var gx = fx + (fg / 8) * fw;\n    ctx.beginPath(); ctx.moveTo(gx, fy); ctx.lineTo(gx, fy + fh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';\n    ctx.fillText((fg * 10) + '', gx - 6, fy + fh + 14);\n  }\n  for (var ag = 0; ag <= 5; ag++) {\n    var gy2 = fy + (ag / 5) * fh;\n    ctx.beginPath(); ctx.moveTo(fx, gy2); ctx.lineTo(fx + fw, gy2); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(fx, fy, fw, fh);\n\n  // Shaded zones\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.06)';\n  ctx.fillRect(fx, fy, (10 / 80) * fw, fh);\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.06)';\n  ctx.fillRect(fx + (70 / 80) * fw, fy, (10 / 80) * fw, fh);\n\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('平均频谱幅度 (0 ~ 80 Hz，平均 ' + avgK + ' 段)', fx, fy - 8);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';\n  ctx.fillText('频率 (Hz)', fx + fw - 46, fy + fh + 28);\n\n  // Plot spectrum\n  ctx.beginPath();\n  for (var k = 0; k < half; k++) {\n    var sx = fx + (k / (half - 1)) * fw;\n    var val = Math.min(maxAmp, specAvg[k]);\n    var sy = fy + fh - (val / maxAmp) * fh;\n    if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  // Fill under curve\n  ctx.lineTo(fx + fw, fy + fh);\n  ctx.lineTo(fx, fy + fh);\n  ctx.closePath();\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n  ctx.fill();\n\n  // Labels for features\n  function markPeak(freqHz, label, color) {\n    var kIdx = Math.round((freqHz / 80) * (half - 1));\n    var px = fx + (kIdx / (half - 1)) * fw;\n    var py = fy + fh - (Math.min(maxAmp, specAvg[kIdx]) / maxAmp) * fh;\n    ctx.fillStyle = color;\n    ctx.beginPath(); ctx.arc(px, py, 3.5, 0, 6.283); ctx.fill();\n    ctx.font = 'bold 10px sans-serif';\n    ctx.fillText(label, px - 12, Math.max(fy + 12, py - 8));\n  }\n  markPeak(13, '13Hz基频', '#f59e0b');\n  markPeak(26, '26Hz', '#f59e0b');\n  markPeak(39, '39Hz', '#f59e0b');\n  if (humOn) markPeak(60, '60Hz干扰', '#ec4899');\n\n  ctx.fillStyle = '#f59e0b'; ctx.font = '10px sans-serif';\n  ctx.fillText('1/f 噪声', fx + 4, fy + 16);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('白噪声平坦区', fx + fw * 0.36, fy + fh - 10);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('滚降', fx + fw * 0.90, fy + 16);\n\n  // Noise floor variance estimate in 18-55 Hz excluding harmonics\n  var sumN = 0, cntN = 0;\n  for (var k = 30; k < 90; k++) {\n    var fHz = (k / N) * FS;\n    if (Math.abs(fHz - 26) > 3 && Math.abs(fHz - 39) > 3) { sumN += specAvg[k]; cntN++; }\n  }\n  var floorAvg = sumN / cntN;\n  lab.setReadout('平均段数 K=' + avgK + ' | 白噪声强度=' + noiseLvl.toFixed(2) + ' | 平坦区均值=' + floorAvg.toFixed(2) + ' | 60Hz干扰=' + (humOn ? '开启' : '关闭') + ' | 声音=' + (lab.values.play ? '播放中' : '静音'));\n});"
    },
    {
      "type": "concept",
      "heading": "3. 决定频率分辨率的双重枷锁与「零填充」真相",
      "paragraphs": [
        "如果两个真实频率靠得非常近，频谱图什么时候会把它们融合成一个单峰，什么时候能把它们清晰拆开？书第 173–174 页指出了限制**频率分辨率（Frequency Resolution）**的两个独立因素：",
        "**第一重限制：DFT 的长度 N**。一个 N 点的 DFT 只能在 0 到采样率的一半之间输出 `N/2 + 1` 个等间隔采样点。要想把两个邻近的峰分开，频域采样的间隔必须小于两峰之间的距离（例如 128 点 DFT 无法分辨图 9-3 的双峰，而 512 点 DFT 可以）。",
        "**第二重限制：输入信号本身的有效长度 L**。这比第一点更微妙！假设两个正弦波频率差极小，在短短几个周期内，它们的波形叠在一起几乎和单个正弦波一模一样。只有采集足够长的信号段，才能物理上分辨出它们是两个频率。因此，**补零（Zero Padding）并不能凭空创造分辨率**！如果你把 256 点的实测信号在末尾补上 1792 个零凑成 2048 点做 DFT，你确实会在频域得到 1025 个密密麻麻的采样点，但**频谱的底层连续形状没有任何改变**，分辨相邻双峰的能力也仅比 256 点 DFT 略微提升一点点。"
      ],
      "formula": {
        "expr": "Δf_grid = f_s / N_DFT  vs.  Δf_physical ≈ 1 / T_signal",
        "explain": "N_DFT 决定频谱网格有多密（补零只加密采样点）；而真实截断时长 T_signal（有效样本数 L）才从物理上决定了主瓣宽度，限制了能否真正拆开双峰。"
      }
    },
    {
      "type": "concept",
      "heading": "4. 频谱泄漏与四大窗函数的工程权衡",
      "paragraphs": [
        "当输入正弦波的频率**恰好落在 DFT 基函数（网格点）上**时，它能被单个采样点完美表示；可一旦频率落在**两根基函数之间**，它就会向四周扩散出长长的**拖尾（Tails）**，这种现象叫**频谱泄漏（Spectral Leakage）**。",
        "背后的理论非常优美：无限长单频正弦波在频域是一个无穷窄的脉冲。在计算机里我们必须先乘以有限长窗函数截断信号（时域相乘等于频域卷积，把无穷窄脉冲变成了**窗函数自身的连续频谱**），然后再挑选 N 个点做 DFT（相当于对这条连续曲线进行**离散采样**）。当频率正对基函数时，采样点刚好全都精准踩在旁瓣的零点（波谷）上，拖尾神奇消失；一旦偏离，采样点就会踩在旁瓣波峰上，形成难看的拖尾！",
        "不同窗函数在**分辨率（主瓣宽度）**与**频谱泄漏（旁瓣高度）**之间做出了不同取舍：**矩形窗（Rectangular）**主瓣最窄但旁瓣高达 -13 dB；**汉明窗（Hamming）**居中均衡；**布莱克曼窗（Blackman）**主瓣较宽，但旁瓣拖尾压得极低；而当你需要**精确测量峰值的真实幅度**（防止采样点刚好偏离峰顶导致读数偏低）时，就要用基于低通滤波器的**平顶窗（Flat-top Window）**——它的制造配方正是第 16 章的 `windowed-sinc` 滤波核，取参数 `M = N - 2` 与 `f_c = s / N`（`s` 通常取 3 到 5 表示峰顶平坦样本数），代价是主瓣极宽、频率分辨率最差。"
      ],
      "formula": {
        "expr": "M = N - 2,   f_c = s / N  (s ∈ [3, 5])",
        "explain": "平顶窗借用 windowed-sinc 低通滤波核公式生成：N 为窗长，s 为希望在频谱峰顶保持平坦的样本点数；另外牢记幅度换算：时域直流 1 对应频域峰 1，而幅度为 1 的正弦波在单边谱中对应 0.5（本节实验已乘 2 还原为 1.0 便于读数）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：栅栏效应、四大窗函数对比与零填充揭秘",
      "instruction": "拖动「第二峰偏移」把正弦波从基函数中心移到两根基函数正中间（0.5 bin），观察矩形窗的幅值读数暴跌（约 36% 误差！）与旁瓣拖尾；切换四种窗函数与「dB 对数刻度」，并打开「8x 零填充」看看隐藏在离散点背后的连续窗谱包络！",
      "controls": [
        {
          "type": "slider",
          "id": "winType",
          "label": "窗函数 (0矩形 1汉明 2布莱克曼 3平顶)",
          "min": 0,
          "max": 3,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "offset",
          "label": "第二峰频率偏移",
          "min": 0,
          "max": 0.5,
          "step": 0.05,
          "value": 0.5,
          "unit": " bin"
        },
        {
          "type": "toggle",
          "id": "zeroPad",
          "label": "开启 8x 零填充 (显露连续谱)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "对数刻度 (dB，看清旁瓣拖尾)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar L = 64, NFFT = 512;\n\nfunction fft(re, im) {\n  var n = re.length, j = 0, i, k, m, half, wr, wi, wpr, wpi, tr, ti, tmp;\n  for (i = 0; i < n; i++) {\n    if (i < j) {\n      tmp = re[i]; re[i] = re[j]; re[j] = tmp;\n      tmp = im[i]; im[i] = im[j]; im[j] = tmp;\n    }\n    m = n >> 1;\n    while (m >= 1 && j >= m) { j -= m; m >>= 1; }\n    j += m;\n  }\n  for (half = 1; half < n; half <<= 1) {\n    var theta = -Math.PI / half;\n    wpr = Math.cos(theta); wpi = Math.sin(theta);\n    wr = 1; wi = 0;\n    for (k = 0; k < half; k++) {\n      for (i = k; i < n; i += half << 1) {\n        j = i + half;\n        tr = wr * re[j] - wi * im[j];\n        ti = wr * im[j] + wi * re[j];\n        re[j] = re[i] - tr; im[j] = im[i] - ti;\n        re[i] += tr; im[i] += ti;\n      }\n      tmp = wr;\n      wr = tmp * wpr - wi * wpi;\n      wi = tmp * wpi + wi * wpr;\n    }\n  }\n}\n\nlab.onUpdate(function() {\n  var winType = Math.round(lab.values.winType);\n  var offset = lab.values.offset;\n  var zeroPad = !!lab.values.zeroPad;\n  var dbScale = !!lab.values.dbScale;\n\n  var winNames = ['矩形窗 (Rectangular)', '汉明窗 (Hamming)', '布莱克曼窗 (Blackman)', '平顶窗 (Flat-top)'];\n  var win = new Float64Array(L), winSum = 0;\n  for (var i = 0; i < L; i++) {\n    var w = 1;\n    if (winType === 1) {\n      w = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (L - 1));\n    } else if (winType === 2) {\n      w = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (L - 1)) + 0.08 * Math.cos(4 * Math.PI * i / (L - 1));\n    } else if (winType === 3) {\n      var M = L - 2, fc = 3 / L;\n      if (i <= M) {\n        var x = i - M / 2;\n        var sinc = (x === 0) ? (2 * Math.PI * fc) : (Math.sin(2 * Math.PI * fc * x) / x);\n        var bw = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M);\n        w = sinc * bw;\n      } else { w = 0; }\n    }\n    win[i] = w;\n    winSum += w;\n  }\n\n  var f1 = 8 / L;\n  var f2 = (22 + offset) / L;\n  var re = new Float64Array(NFFT), im = new Float64Array(NFFT);\n  for (var n = 0; n < L; n++) {\n    var sig = Math.cos(2 * Math.PI * f1 * n) + Math.cos(2 * Math.PI * f2 * n);\n    re[n] = sig * win[n];\n  }\n  fft(re, im);\n\n  var halfDense = NFFT / 2 + 1;\n  var magDense = new Float64Array(halfDense);\n  for (var k = 0; k < halfDense; k++) {\n    magDense[k] = 2 * Math.sqrt(re[k] * re[k] + im[k] * im[k]) / winSum;\n  }\n\n  var halfCoarse = L / 2 + 1;\n  var magCoarse = new Float64Array(halfCoarse);\n  var peak2Measured = 0;\n  for (var c = 0; c < halfCoarse; c++) {\n    magCoarse[c] = magDense[c * (NFFT / L)];\n    if (c >= 17 && c <= 27 && magCoarse[c] > peak2Measured) peak2Measured = magCoarse[c];\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var px = 52, py = 26, pw = 646, ph = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fg = 0; fg <= 5; fg++) {\n    var gx = px + (fg / 5) * pw;\n    ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';\n    ctx.fillText((fg * 0.1).toFixed(1), gx - 8, py + ph + 14);\n  }\n\n  function mapY(val) {\n    if (dbScale) {\n      var db = 20 * Math.log(Math.max(1e-5, val)) / Math.LN10;\n      db = Math.max(-100, Math.min(5, db));\n      return py + ((5 - db) / 105) * ph;\n    } else {\n      return py + ph - (Math.min(1.2, val) / 1.2) * ph;\n    }\n  }\n\n  if (dbScale) {\n    var dbTicks = [0, -20, -40, -60, -80, -100];\n    for (var d = 0; d < dbTicks.length; d++) {\n      var yLine = py + ((5 - dbTicks[d]) / 105) * ph;\n      ctx.beginPath(); ctx.moveTo(px, yLine); ctx.lineTo(px + pw, yLine); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';\n      ctx.fillText(dbTicks[d] + 'dB', 10, yLine + 3);\n    }\n  } else {\n    var linTicks = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2];\n    for (var l = 0; l < linTicks.length; l++) {\n      var yLine2 = mapY(linTicks[l]);\n      ctx.beginPath(); ctx.moveTo(px, yLine2); ctx.lineTo(px + pw, yLine2); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';\n      ctx.fillText(linTicks[l].toFixed(1), 22, yLine2 + 3);\n    }\n  }\n\n  // True amplitude reference line (1.0 / 0 dB)\n  var yRef = mapY(1.0);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n  ctx.beginPath(); ctx.moveTo(px, yRef); ctx.lineTo(px + pw, yRef); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b'; ctx.font = '10px sans-serif';\n  ctx.fillText('真实幅度 = 1.0', px + pw - 74, yRef - 5);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(px, py, pw, ph);\n\n  // Zero-padded dense curve\n  if (zeroPad) {\n    ctx.beginPath();\n    for (var k = 0; k < halfDense; k++) {\n      var sx = px + (k / (halfDense - 1)) * pw;\n      var sy = mapY(magDense[k]);\n      if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.8;\n    ctx.stroke();\n  } else {\n    ctx.beginPath();\n    for (var c = 0; c < halfCoarse; c++) {\n      var cx = px + (c / (halfCoarse - 1)) * pw;\n      var cy = mapY(magCoarse[c]);\n      if (c === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n    }\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n  }\n\n  // Discrete N=64 stems & dots\n  for (var c = 0; c < halfCoarse; c++) {\n    var cx = px + (c / (halfCoarse - 1)) * pw;\n    var cy = mapY(magCoarse[c]);\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.moveTo(cx, py + ph); ctx.lineTo(cx, cy); ctx.stroke();\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(cx, cy, 3, 0, 6.283); ctx.fill();\n  }\n\n  // Labels for the two peaks\n  var xP1 = px + (f1 / 0.5) * pw;\n  var xP2 = px + (f2 / 0.5) * pw;\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(winNames[winType] + (zeroPad ? ' + 8x零填充 (512点)' : ' (64点原长DFT)'), px, py - 8);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif';\n  ctx.fillText('归一化频率 (0 ~ 0.5 fs)', px + pw - 115, py + ph + 28);\n\n  ctx.fillStyle = '#10b981'; ctx.font = '10px sans-serif';\n  ctx.fillText('峰1 (踩准基函数)', xP1 - 36, py + 14);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('峰2 (偏离 +' + offset.toFixed(2) + ' bin)', xP2 - 44, py + 14);\n  ctx.fillText('测得峰值: ' + peak2Measured.toFixed(3), xP2 - 36, Math.min(py + ph - 8, mapY(peak2Measured) + 14));\n\n  var errPct = (1 - peak2Measured) * 100;\n  lab.setReadout('当前: ' + winNames[winType] + ' | 峰2偏移=' + offset.toFixed(2) + ' bin | 真实幅度=1.000, DFT测得=' + peak2Measured.toFixed(3) + ' (误差 ' + errPct.toFixed(1) + '%)');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "单次 DFT 噪底抖动极大：真实工程做频谱分析几乎从不看单帧 DFT，而是将长数据切分并加窗做多段平均（Averaged Spectrum），以大幅压低白噪声方差。",
        "用频谱抓系统隐患：看到 70~80% 奈奎斯特频率以上平稳滚降说明抗混叠滤波正常，若没有滚降需立即排查信号混叠；看到工频（50/60 Hz）及其倍频尖峰说明存在电源串扰。",
        "别迷信补零（Zero Padding）：补零只能让频谱采样点更密集、显露出窗函数卷积后的连续曲线，它**不能**突破信号原始时长 L 决定的物理分辨率极限。",
        "根据任务选窗函数：追求最高分辨率拆解双峰用矩形窗（或汉明窗）；要彻底压制强峰旁的泄漏尾巴找弱信号用布莱克曼窗；需要精准读取信号幅度（避免栅栏效应误差）必须上平顶窗。"
      ]
    }
  ]
});
