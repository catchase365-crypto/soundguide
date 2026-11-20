window.__BOOK_REGISTER_SECTION__("sec_166", {
  "title": "语音合成与语音识别 (Speech Synthesis and Recognition)",
  "intuition": "人类说话就像“吹口哨加捏扁吸管”：声带产生周期脉冲或气流制造湍流噪声作为声源，再经过不断变换形状的口腔、咽喉和鼻腔（线性滤波器）塑形出共振峰；计算机正是通过追踪这三个随时间快速变化的参数来压缩、合成甚至尝试识别语音的。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 商业回放 vs. 物理建模：人类发声的“声源-滤波器”模型",
      "paragraphs": [
        "市面上绝大多数会“说话”的商业电子产品（例如电梯播报、玩具发声）其实并没有真正**合成**语音，它们只是简单地回放预先录制好的人类数字音频片段。这种方法音质极佳，但死板地受限于预录词库。真正的计算机语音合成与识别，几乎都建立在图 22-8 所示的**人类发声物理模型**之上。",
        "人类语音绝大部分可分为两类：第一类是**浊音 (Voiced sounds)**，例如元音（如 *rain* 中的 *a*）。肺部气流冲过喉结后方紧绷的两片声带，使其以 **50 ~ 1000 Hz** 的频率周期性振动，向咽喉注入一连串周期性的空气脉冲。在工程模型中，它由一个基频（**Pitch / 音高**）可调的**脉冲串发生器 (Pulse train generator)** 表示。",
        "第二类是**清音/擦音 (Fricative sounds)**，例如 *s, f, sh, z, v, th*（如 *storm* 中的 *s*）。此时声带不振动，气流被舌头、嘴唇或牙齿几乎堵死，在狭窄处产生剧烈的空气湍流。在模型中，它由一个**白噪声发生器 (Noise generator)** 表示。",
        "无论是脉冲串还是随机噪声，在传出嘴鼻之前，都会经过由舌头、嘴唇、口腔、咽喉和鼻腔构成的声学空腔。由于声波在这些尺寸为几厘米的空腔中传播是线性过程，因此在 DSP 中可以用一个**递归线性数字滤波器 (Recursive linear filter)** 来等效模拟。空腔在千赫兹频段产生的一系列谐振峰，在音频处理行话中被称为**共振峰频率 (Formant frequencies)**——你说话时不断移动舌头和嘴唇，本质上就是在实时改变这些共振峰的频率和幅度。"
      ],
      "formula": {
        "expr": "y[n] = x[n] - Σ a[k] · y[n - k]",
        "explain": "x[n] 是激励源信号（浊音周期脉冲串或清音白噪声）；y[n] 是最终合成的语音波形；a[k] 是全极点递归滤波器的系数，用来精确刻画口腔、咽喉等声道空腔的共振峰频率 (Formant) 响应。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：声道共振峰与浊/清音实时合成器",
      "instruction": "点击“▶ 播放合成声音”，切换“浊音脉冲 / 清音噪声”激励源，并拖动基频与第一/第二共振峰（F1/F2）滑块，亲耳听出“啊(a)、咿(i)、呜(u)”和“嘶(s)”的区别，同时观察时域与频域包络变化。",
      "controls": [
        {
          "type": "toggle",
          "id": "voiced",
          "label": "激励源：浊音脉冲串 (关闭为清音白噪声)",
          "value": true
        },
        {
          "type": "slider",
          "id": "pitch",
          "label": "声带基频 (Pitch)",
          "min": 60,
          "max": 300,
          "step": 5,
          "value": 125,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f1",
          "label": "第一共振峰 F1",
          "min": 250,
          "max": 900,
          "step": 10,
          "value": 700,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "第二共振峰 F2",
          "min": 800,
          "max": 2600,
          "step": 20,
          "value": 1200,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N_SIM = 800;\nconst fsSim = 16000;\nconst visNoise = new Float32Array(N_SIM);\nlet seed = 12345;\nfor (let i = 0; i < N_SIM; i++) {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  visNoise[i] = (seed / 4294967296) * 2 - 1;\n}\n\nlet audioCtx = null;\nlet pulseOsc = null;\nlet noiseNode = null;\nlet pulseGain = null;\nlet noiseGain = null;\nlet f1Filter = null;\nlet f2Filter = null;\nlet masterGain = null;\nlet audioReady = false;\n\nfunction initAudio() {\n  if (audioReady) return;\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  const nH = 24;\n  const real = new Float32Array(nH);\n  const imag = new Float32Array(nH);\n  for (let i = 1; i < nH; i++) {\n    imag[i] = 1.0 / Math.pow(i, 0.45);\n  }\n  const wave = audioCtx.createPeriodicWave(real, imag);\n  pulseOsc = audioCtx.createOscillator();\n  pulseOsc.setPeriodicWave(wave);\n\n  const bufLen = audioCtx.sampleRate * 2;\n  const buf = audioCtx.createBuffer(1, bufLen, audioCtx.sampleRate);\n  const data = buf.getChannelData(0);\n  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;\n  noiseNode = audioCtx.createBufferSource();\n  noiseNode.buffer = buf;\n  noiseNode.loop = true;\n\n  pulseGain = audioCtx.createGain();\n  noiseGain = audioCtx.createGain();\n\n  f1Filter = audioCtx.createBiquadFilter();\n  f1Filter.type = 'bandpass';\n  f1Filter.Q.value = 6.5;\n  f2Filter = audioCtx.createBiquadFilter();\n  f2Filter.type = 'bandpass';\n  f2Filter.Q.value = 9.0;\n\n  const g1 = audioCtx.createGain(); g1.gain.value = 1.0;\n  const g2 = audioCtx.createGain(); g2.gain.value = 0.75;\n  masterGain = audioCtx.createGain();\n  masterGain.gain.value = 0;\n\n  pulseOsc.connect(pulseGain);\n  noiseNode.connect(noiseGain);\n  pulseGain.connect(f1Filter);\n  pulseGain.connect(f2Filter);\n  noiseGain.connect(f1Filter);\n  noiseGain.connect(f2Filter);\n  f1Filter.connect(g1);\n  f2Filter.connect(g2);\n  g1.connect(masterGain);\n  g2.connect(masterGain);\n  masterGain.connect(audioCtx.destination);\n\n  pulseOsc.start();\n  noiseNode.start();\n  audioReady = true;\n}\n\nfunction updateAudio() {\n  const v = lab.values;\n  if (v.play) {\n    initAudio();\n    if (audioCtx) {\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      const now = audioCtx.currentTime;\n      pulseOsc.frequency.setTargetAtTime(v.pitch, now, 0.02);\n      f1Filter.frequency.setTargetAtTime(v.f1, now, 0.02);\n      f2Filter.frequency.setTargetAtTime(v.f2, now, 0.02);\n      pulseGain.gain.setTargetAtTime(v.voiced ? 0.55 : 0.0, now, 0.02);\n      noiseGain.gain.setTargetAtTime(v.voiced ? 0.0 : 0.65, now, 0.02);\n      masterGain.gain.setTargetAtTime(0.32, now, 0.03);\n    }\n  } else if (audioReady && audioCtx) {\n    masterGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.03);\n  }\n}\n\nfunction runResonator(x, f0, bw) {\n  const y = new Float32Array(x.length);\n  const r = Math.exp(-Math.PI * bw / fsSim);\n  const theta = (2 * Math.PI * f0) / fsSim;\n  const a1 = -2 * r * Math.cos(theta);\n  const a2 = r * r;\n  const g = 1 - r;\n  for (let n = 2; n < x.length; n++) {\n    y[n] = g * x[n] - a1 * y[n - 1] - a2 * y[n - 2];\n  }\n  return y;\n}\n\nfunction filterMag(f, f0, bw) {\n  const r = Math.exp(-Math.PI * bw / fsSim);\n  const theta = (2 * Math.PI * f0) / fsSim;\n  const a1 = -2 * r * Math.cos(theta);\n  const a2 = r * r;\n  const w = (2 * Math.PI * f) / fsSim;\n  const re = 1 + a1 * Math.cos(w) + a2 * Math.cos(2 * w);\n  const im = -a1 * Math.sin(w) - a2 * Math.sin(2 * w);\n  return (1 - r) / Math.sqrt(re * re + im * im);\n}\n\nlet noiseOffset = 0;\n\nfunction draw() {\n  const v = lab.values;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const x = new Float32Array(N_SIM);\n  const periodSamples = Math.max(10, Math.round(fsSim / v.pitch));\n  for (let n = 0; n < N_SIM; n++) {\n    if (v.voiced) {\n      x[n] = (n % periodSamples === 0) ? 3.5 : 0.0;\n    } else {\n      x[n] = visNoise[(n + noiseOffset) % N_SIM] * 1.4;\n    }\n  }\n  const y1 = runResonator(x, v.f1, 95);\n  const y2 = runResonator(x, v.f2, 130);\n  const y = new Float32Array(400);\n  let maxAmp = 0.01;\n  for (let i = 0; i < 400; i++) {\n    y[i] = y1[i + 400] + 0.7 * y2[i + 400];\n    if (Math.abs(y[i]) > maxAmp) maxAmp = Math.abs(y[i]);\n  }\n\n  const lx = 38, ly = 32, lw = 302, lh = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ly + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n  }\n  for (let i = 0; i <= 5; i++) {\n    const xx = lx + (lw * i) / 5;\n    ctx.beginPath(); ctx.moveTo(xx, ly); ctx.lineTo(xx, ly + lh); ctx.stroke();\n  }\n\n  ctx.strokeStyle = v.voiced ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < 400; i++) {\n    const px = lx + (i / 399) * lw;\n    const py = ly + lh / 2 - (y[i] / maxAmp) * (lh * 0.42);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域合成波形 (0 ~ 25 ms 语音切片)', lx, 20);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0 ms', lx, ly + lh + 15);\n  ctx.fillText('25 ms', lx + lw - 32, ly + lh + 15);\n\n  const rx = 382, ry = 32, rw = 308, rh = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ry + (rh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, yy); ctx.lineTo(rx + rw, yy); ctx.stroke();\n    const xx = rx + (rw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(xx, ry); ctx.lineTo(xx, ry + rh); ctx.stroke();\n  }\n\n  const fMax = 4000;\n  let envMax = 0.01;\n  const envVals = new Float32Array(151);\n  for (let i = 0; i <= 150; i++) {\n    const f = (i / 150) * fMax;\n    const m = filterMag(f, v.f1, 95) + 0.75 * filterMag(f, v.f2, 130);\n    envVals[i] = m;\n    if (m > envMax) envMax = m;\n  }\n\n  if (v.voiced) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    for (let k = 1; k * v.pitch <= fMax; k++) {\n      const f = k * v.pitch;\n      const m = (filterMag(f, v.f1, 95) + 0.75 * filterMag(f, v.f2, 130)) / envMax;\n      const px = rx + (f / fMax) * rw;\n      const py = ry + rh - m * (rh * 0.85);\n      ctx.beginPath(); ctx.moveTo(px, ry + rh); ctx.lineTo(px, py); ctx.stroke();\n    }\n  } else {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (let i = 0; i <= 150; i++) {\n      const m = envVals[i] / envMax;\n      const nRand = 0.45 + 0.55 * Math.abs(visNoise[(i * 3 + noiseOffset) % N_SIM]);\n      const px = rx + (i / 150) * rw;\n      const py = ry + rh - m * nRand * (rh * 0.85);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.setLineDash([5, 3]);\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const px = rx + (i / 150) * rw;\n    const py = ry + rh - (envVals[i] / envMax) * (rh * 0.85);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px sans-serif';\n  const f1x = rx + (v.f1 / fMax) * rw;\n  const f2x = rx + (v.f2 / fMax) * rw;\n  ctx.fillText('F1', Math.min(rx + rw - 18, Math.max(rx + 2, f1x - 6)), ry + 14);\n  const f2y = Math.abs(f2x - f1x) < 22 ? ry + 26 : ry + 14;\n  ctx.fillText('F2', Math.min(rx + rw - 18, Math.max(rx + 2, f2x - 6)), f2y);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频域频谱 & 声道共振峰包络 (0 ~ 4 kHz)', rx, 20);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  for (let k = 0; k <= 4; k++) {\n    ctx.fillText(k + 'k', rx + (rw * k) / 4 - 5, ry + rh + 15);\n  }\n\n  const modeStr = v.voiced ? '浊音(周期脉冲串, 基频=' + v.pitch + 'Hz)' : '清音/擦音(随机白噪声激励)';\n  lab.setReadout('当前参数 -> 激励源: ' + modeStr + ' | F1=' + v.f1 + 'Hz, F2=' + v.f2 + 'Hz');\n}\n\nlab.onUpdate(() => {\n  updateAudio();\n  draw();\n});\n\nlet accum = 0;\nlab.onLoop((dt) => {\n  if (!lab.values.voiced && lab.values.play) {\n    accum += dt;\n    if (accum > 0.08) {\n      accum = 0;\n      noiseOffset = (noiseOffset + 17) % N_SIM;\n      draw();\n    }\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "2. LPC 语音压缩与语谱图（声纹）的时频分辨率权衡",
      "paragraphs": [
        "在短短 **25 毫秒**的时间窗口内，语音信号就可以用上述三个参数高度概括：（1）选择周期脉冲还是随机噪声；（2）如果是浊音，周期波的基频是多少；（3）声道递归滤波器的系数。只要每秒更新这三组参数约 40 次，就能合成出连续语音。大名鼎鼎的早期 DSP 商业产品——儿童电子学习机 **Speak & Spell** 就采用了这套方案：虽然声音听起来颇具“机械感”，但它的数据率极低，仅需**几 kbits/sec**。",
        "这同时也是**线性预测编码 (Linear Predictive Coding, LPC)** 语音压缩的核心原理。将录制的语音切分成短片段，每段提取这三组模型参数（通常每段仅需十几个字节），总码率压缩到 **2 ~ 6 kbytes/sec**，传输或存储后再由合成器重建出语音。",
        "为了直观观察语音的频谱如何随时间演变，工程上最常用的工具是**语谱图 (Voice spectrogram / 声纹 Voiceprint)**：把音频切成 **2 ~ 40 毫秒**的短段，对每段做 FFT 得到频谱，然后并排拼成一张二维灰度图（原书中幅度低呈浅色、幅度高呈深色；在暗色主题屏幕中常用高亮色代表高能量）。从图 22-9 可以清晰对比出：浊音（*rain* 中的 *a*）在频谱上是一系列**等间距的谐波尖峰**被共振峰包络调制；而擦音（*storm* 中的 *s*）则呈现连续的**高频噪声带**。",
        "然而切片长度 `T_seg` 的选择存在经典的**时频权衡 (Time-Frequency Tradeoff)**：切分片段越长，频率分辨率越高，能看清一条条独立的谐波横线（窄带语谱图）；切分片段越短，时间分辨率越高，能精准捕捉辅音、停顿与元音切换的瞬间边界（宽带语谱图），但代价是谐波在频率轴上糊成一片。"
      ],
      "formula": {
        "expr": "Δf ≈ 1 / T_seg",
        "explain": "T_seg 为单个语音分析片段的时间长度（通常取 2 ~ 40 ms），Δf 为 FFT 能分辨的最小频率间隔。分段越短（如 4 ms），时间定位越准，但 Δf 高达 250 Hz，会直接把相距 120 Hz 的基频谐波糊在一起。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：语谱图（声纹）时频分辨率权衡与“a — s”对比",
      "instruction": "拖动“分析窗长”从 2 ms 拉长到 40 ms，仔细观察左半段浊音“a”的谐波横线何时变得清晰、中间 60 ms 的停顿间隙何时被时间拖影模糊；也可点击播放同步对比听感。",
      "controls": [
        {
          "type": "slider",
          "id": "winMs",
          "label": "分析窗长 (T_seg)",
          "min": 2,
          "max": 40,
          "step": 2,
          "value": 16,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "pitch",
          "label": "浊音“a”基频",
          "min": 80,
          "max": 240,
          "step": 10,
          "value": 130,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showGrid",
          "label": "显示声段边界与谐波参考线",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比语段 (a — s)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst sx = 56, sy = 32, sw = 620, sh = 168;\nconst nx = 155, ny = 84;\n\nlet cachedSpec = null;\nlet audioCtx = null;\nlet srcNode = null;\nlet playHead = 0;\nlet lastPitch = -1;\n\nfunction smoothstep(a, b, x) {\n  const t = Math.max(0, Math.min(1, (x - a) / Math.max(1e-6, b - a)));\n  return t * t * (3 - 2 * t);\n}\n\nfunction smoothBox(t, a, b, w) {\n  return smoothstep(a - w * 0.5, a + w * 0.5, t) * (1 - smoothstep(b - w * 0.5, b + w * 0.5, t));\n}\n\nfunction colorRamp(v) {\n  if (v < 0.35) {\n    const t = v / 0.35;\n    return [Math.round(15 + t * (2 - 15)), Math.round(23 + t * (132 - 23)), Math.round(42 + t * (199 - 42))];\n  } else if (v < 0.65) {\n    const t = (v - 0.35) / 0.3;\n    return [Math.round(2 + t * (16 - 2)), Math.round(132 + t * (185 - 132)), Math.round(199 + t * (129 - 199))];\n  } else if (v < 0.85) {\n    const t = (v - 0.65) / 0.2;\n    return [Math.round(16 + t * (245 - 16)), Math.round(185 + t * (158 - 185)), Math.round(129 + t * (11 - 129))];\n  } else {\n    const t = (v - 0.85) / 0.15;\n    return [Math.round(245 + t * (248 - 245)), Math.round(158 + t * (250 - 158)), Math.round(11 + t * (252 - 11))];\n  }\n}\n\nfunction computeSpectrogram() {\n  const v = lab.values;\n  const tau = Math.max(0.002, v.winMs / 1000);\n  const sigmaF = 650 / v.winMs;\n  const cw = sw / nx;\n  const ch = sh / ny;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  for (let ix = 0; ix < nx; ix++) {\n    const t = (ix + 0.5) / nx;\n    const vEnv = smoothBox(t, 0.05, 0.48, tau);\n    const fEnv = smoothBox(t, 0.54, 0.95, tau);\n    const u = Math.max(0, Math.min(1, (t - 0.05) / 0.43));\n    const f1 = 700 - 120 * Math.sin(Math.PI * u);\n    const f2 = 1150 + 250 * u;\n\n    for (let iy = 0; iy < ny; iy++) {\n      const f = ((ny - 1 - iy + 0.5) / ny) * 5000;\n      let voicedAmp = 0;\n      if (vEnv > 0.005) {\n        const formant = 1.0 / (1 + Math.pow((f - f1) / 160, 2)) + 0.75 / (1 + Math.pow((f - f2) / 220, 2)) + 0.15 * Math.exp(-f / 2200);\n        const k = Math.round(f / v.pitch);\n        let hSum = 0;\n        for (let kk = Math.max(1, k - 1); kk <= k + 1; kk++) {\n          hSum += Math.exp(-0.5 * Math.pow((f - kk * v.pitch) / sigmaF, 2));\n        }\n        const hNorm = hSum / (1 + 1.6 * (sigmaF / v.pitch));\n        voicedAmp = vEnv * formant * hNorm;\n      }\n      let fricAmp = 0;\n      if (fEnv > 0.005) {\n        const sShape = 0.85 * Math.exp(-0.5 * Math.pow((f - 3400) / 750, 2)) + 0.25 * Math.exp(-0.5 * Math.pow((f - 2200) / 500, 2));\n        const hash = Math.abs(Math.sin(ix * 12.9898 + iy * 78.233) * 43758.5453) % 1;\n        const smoothGrain = 0.65 + 0.35 * (v.winMs < 15 ? hash : 0.5 + 0.5 * (hash - 0.5));\n        fricAmp = fEnv * sShape * smoothGrain;\n      }\n      const val = Math.min(1, Math.pow(voicedAmp + fricAmp, 0.75));\n      const rgb = colorRamp(val);\n      ctx.fillStyle = 'rgb(' + rgb[0] + ',' + rgb[1] + ',' + rgb[2] + ')';\n      ctx.fillRect(sx + ix * cw, sy + iy * ch, Math.ceil(cw), Math.ceil(ch));\n    }\n  }\n  cachedSpec = ctx.getImageData(sx, sy, sw, sh);\n}\n\nfunction drawOverlay() {\n  const v = lab.values;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  if (cachedSpec) ctx.putImageData(cachedSpec, sx, sy);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(sx, sy, sw, sh);\n\n  if (v.showGrid) {\n    ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n    ctx.setLineDash([4, 4]);\n    [0.05, 0.48, 0.54, 0.95].forEach((tt) => {\n      const px = sx + tt * sw;\n      ctx.beginPath(); ctx.moveTo(px, sy); ctx.lineTo(px, sy + sh); ctx.stroke();\n    });\n    ctx.setLineDash([]);\n\n    ctx.fillStyle = '#38bdf8';\n    for (let k = 1; k * v.pitch <= 5000 && k <= 6; k++) {\n      const py = sy + sh - ((k * v.pitch) / 5000) * sh;\n      ctx.fillRect(sx - 6, py - 1, 6, 2);\n    }\n  }\n\n  if (v.play) {\n    const px = sx + playHead * sw;\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, sy); ctx.lineTo(px, sy + sh); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('浊音 [a] (谐波+共振峰)', sx + sw * 0.14, 20);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('60ms间隙', sx + sw * 0.46, 20);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('清音 [s] (高频湍流噪声)', sx + sw * 0.65, 20);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  for (let k = 0; k <= 5; k++) {\n    const py = sy + sh - (k / 5) * sh;\n    ctx.fillText(k + 'k Hz', 10, py + 4);\n  }\n  for (let k = 0; k <= 4; k++) {\n    ctx.fillText((k * 0.25).toFixed(2) + 's', sx + (sw * k) / 4 - 12, sy + sh + 16);\n  }\n\n  const df = Math.round(1000 / v.winMs);\n  const mode = v.winMs <= 10 ? '宽带语谱图(高时间分辨, 谐波糊化)' : (v.winMs >= 24 ? '窄带语谱图(高频率分辨, 谐波清晰)' : '均衡折中窗口');\n  lab.setReadout('窗长 T=' + v.winMs + 'ms | 频率分辨率 Δf≈' + df + 'Hz (基频=' + v.pitch + 'Hz) | 模式: ' + mode);\n}\n\nfunction buildPhraseBuffer(sr, pitch) {\n  const len = sr;\n  const buf = audioCtx.createBuffer(1, len, sr);\n  const out = buf.getChannelData(0);\n  let y1a = 0, y1b = 0, y2a = 0, y2b = 0, ysa = 0, ysb = 0;\n  let phase = 0;\n  let maxV = 0.001;\n  for (let n = 0; n < len; n++) {\n    const t = n / sr;\n    let sample = 0;\n    if (t >= 0.05 && t <= 0.48) {\n      const env = Math.min(1, (t - 0.05) / 0.02) * Math.min(1, (0.48 - t) / 0.02);\n      phase += pitch / sr;\n      let exc = 0;\n      if (phase >= 1) { phase -= 1; exc = 3.0; }\n      const u = (t - 0.05) / 0.43;\n      const f1 = 700 - 120 * Math.sin(Math.PI * u);\n      const f2 = 1150 + 250 * u;\n      const r1 = Math.exp(-Math.PI * 95 / sr), a11 = -2 * r1 * Math.cos(2 * Math.PI * f1 / sr), a12 = r1 * r1;\n      const y1 = (1 - r1) * exc - a11 * y1a - a12 * y1b; y1b = y1a; y1a = y1;\n      const r2 = Math.exp(-Math.PI * 130 / sr), a21 = -2 * r2 * Math.cos(2 * Math.PI * f2 / sr), a22 = r2 * r2;\n      const y2 = (1 - r2) * exc - a21 * y2a - a22 * y2b; y2b = y2a; y2a = y2;\n      sample = env * (y1 + 0.7 * y2);\n    } else if (t >= 0.54 && t <= 0.95) {\n      const env = Math.min(1, (t - 0.54) / 0.02) * Math.min(1, (0.95 - t) / 0.02);\n      const exc = Math.random() * 2 - 1;\n      const rs = Math.exp(-Math.PI * 750 / sr), as1 = -2 * rs * Math.cos(2 * Math.PI * 3400 / sr), as2 = rs * rs;\n      const ys = (1 - rs) * exc - as1 * ysa - as2 * ysb; ysb = ysa; ysa = ys;\n      sample = env * ys * 0.8;\n    }\n    out[n] = sample;\n    if (Math.abs(sample) > maxV) maxV = Math.abs(sample);\n  }\n  const gain = 0.35 / maxV;\n  for (let n = 0; n < len; n++) out[n] *= gain;\n  return buf;\n}\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    srcNode.disconnect();\n    srcNode = null;\n  }\n}\n\nfunction syncAudio() {\n  const v = lab.values;\n  if (v.play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (!audioCtx) return;\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!srcNode || lastPitch !== v.pitch) {\n      stopAudio();\n      const buf = buildPhraseBuffer(audioCtx.sampleRate, v.pitch);\n      srcNode = audioCtx.createBufferSource();\n      srcNode.buffer = buf;\n      srcNode.loop = true;\n      srcNode.connect(audioCtx.destination);\n      playHead = 0;\n      srcNode.start();\n      lastPitch = v.pitch;\n    }\n  } else {\n    stopAudio();\n    lastPitch = -1;\n  }\n}\n\nlab.onUpdate(() => {\n  computeSpectrogram();\n  syncAudio();\n  drawOverlay();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    playHead = (playHead + dt) % 1.0;\n    drawOverlay();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "3. 为什么早期语音识别这么难？语境、切分与三大工程痛点",
      "paragraphs": [
        "既然能用 25 ms 切片提取出三组参数并还原语音，自然会想到：把提取出的参数序列和预先存好的单词模板库做模式匹配，不就能实现**语音识别 (Speech recognition)** 了吗？遗憾的是，这种纯靠“逐词声学比对”的方法效果非常糟糕，远远不及人类听觉。",
        "原因在于**人类并不是仅靠声音听清单词的，而是极度依赖句子语境 (Context) 和听者预期 (Expectations)**。试想有人突然对你说出一句毫无意义的乱序词串：*\"Larger run medical buy dogs fortunate almost when.\"* 你不仅听不懂意思，甚至连刚才听到的单个词汇都很难全部分辨准确。再看两个经典例子：",
        "1) *The child wore a **spider ring** on Halloween.*（万圣节戴蜘蛛戒指）\n2) *He was an American **spy during** the war.*（战时美国间谍）\n哪怕说话者发出的音素声学波形完全一模一样，人类大脑也会利用常识瞬间做出正确消歧——因为你知道孩子不会戴着“秘密特工”，人也不会在打仗时变成“万圣节恐怖首饰”。",
        "传统基于纯 DSP 声学模板匹配的语音识别系统只管“认词”而不懂“理解”，因此长期存在**三大工程痛点**：（1）**必须字词间刻意停顿**：用户不能自然连读，否则系统无法切分出究竟是 *spider ring* 还是 *spy during*；（2）**词库极其有限**：通常只能限制在几百个词以内，词库一旦扩大，搜索耗时与错误率都会急剧飙升；（3）**必须针对每个说话人单独训练**：使用者往往需要把每个词重复念 5 ~ 10 遍来建立个人语音模板，非常繁琐耗时。原作者 Steven W. Smith 敏锐地指出：语音识别未来的真正突破，不仅靠 DSP 本身，更将来自**人工智能 (AI) 与神经网络 (Neural networks)** 的结合。"
      ],
      "formula": {
        "expr": null,
        "explain": "本节主要剖析人类感知的语境先验知识与传统模板匹配系统的工程局限，不涉及新的代数公式。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分录音回放与语音合成：产品若只需要固定提示音，直接回放压缩音频成本最低、音质最好；只有需要动态生成未知文本或极低码率压缩（如 LPC 2~6 kbytes/s）时才用声源-滤波器合成模型。",
        "声源决定“清浊”，声道决定“音色”：浊音是周期脉冲（频谱呈等距谐波），擦音是湍流白噪声（频谱连续）；舌位和口型变化改变的是递归滤波器的共振峰 (Formants) 频率与幅度。",
        "语谱图窗长切忌两头极端：短窗（2~8 ms）抓得住瞬态起止边界但会把谐波糊成一片；长窗（25~40 ms）能看清每根基频谐波却会抹平辅音切换的时间细节，工程上需按任务折中。",
        "纯声学匹配难以突破连续语音瓶颈：不引入语言模型和上下文语义概率（即“先验语境”），系统就无法稳定解决同音连读切分（如 spider ring vs. spy during）和大词表泛化问题。"
      ]
    }
  ]
});
