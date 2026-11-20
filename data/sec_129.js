window.__BOOK_REGISTER_SECTION__("sec_129", {
  "title": "信号中信息的两种载体：时域与频域 (How Information is Represented in Signals)",
  "intuition": "自然界信号主要通过“单点瞬时值（时域）”或“多点周期律（频域）”携带信息，而数字滤波器无法同时将这两者优化到极致。",
  "blocks": [
    {
      "type": "concept",
      "heading": "自然信号的二元法则：单点独立 vs 多点关联",
      "paragraphs": [
        "在任何数字信号处理（DSP）任务中，最核心的第一步就是搞清楚**信息是如何藏在信号里的**。对于人工制造的信号，工程师发明了琳琅满目的调制手段（如调幅 AM、调频 FM、单边带、脉冲编码调制 PCM、脉宽调制 PWM 等）。但幸运的是，**自然界中绝大多数信号只用两种方式来承载信息**：**时域表示（Time Domain）**与**频域表示（Frequency Domain）**。",
        "**时域信息**直接描述“某件事在什么时候发生”以及“发生时的幅度有多大”。想象一个观测太阳光强度的实验：仪器每秒采样记录一次光强。如果太阳爆发耀斑，信号曲线会直接告诉你耀斑爆发的时刻、持续时间以及随时间的演变过程。这种表示法最直观，也最关键的特征是：**哪怕你手里只有孤零零的 1 个采样点，不参考任何其他点，你依然能读出此时此刻的物理状态。**",
        "**频域信息**则要间接得多。宇宙中无数事物都在做周期性运动：指甲轻弹酒杯产生的清脆振铃、老式座钟摆锤的左右摇摆、恒星与行星的自转和公转。通过测量这些周期运动的**频率、相位和幅度**，我们就能反推出发声或运动系统的内部属性——比如敲击酒杯时的基频与泛音频率，直接对应着玻璃材质的**质量与弹性**。但请注意一个本质区别：**如果你只截取酒杯振铃声中的 1 个孤立采样点，它对周期运动和酒杯材质没有任何解释力；频域信息完全藏在“大量采样点之间的相互关系”之中。**"
      ],
      "formula": {
        "expr": null,
        "explain": "本节从信息载体与物理直觉切入，暂不涉及具体数学变换公式。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：单点快照能读出什么？（太阳耀斑 vs 酒杯振铃）",
      "instruction": "拖动「观察窗口点数」与「采样时刻」，并切换信号类型：看看为什么 1 个点就能看懂太阳耀斑，却必须凑齐足够多的点才能认出酒杯的谐振频率（支持点击播放声音）。",
      "controls": [
        {
          "type": "slider",
          "id": "windowSize",
          "label": "观察窗口点数",
          "min": 1,
          "max": 128,
          "step": 1,
          "value": 1,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "cursorPos",
          "label": "采样时刻索引",
          "min": 0,
          "max": 127,
          "step": 1,
          "value": 45,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "isFreq",
          "label": "切换为频域信号（酒杯振铃）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放当前信号声音",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const N = 128;\nlet audioCtx = null;\nlet oscList = [];\nlet masterGain = null;\nlet isPlaying = false;\n\nfunction getSample(isFreq, i) {\n  if (!isFreq) {\n    const f1 = 0.78 * Math.exp(-Math.pow((i - 45) / 6, 2));\n    const f2 = 0.42 * Math.exp(-Math.pow((i - 88) / 4, 2));\n    return 0.14 + f1 + f2;\n  } else {\n    const t = i / N;\n    const s = 0.55 * Math.sin(2 * Math.PI * 8 * t) + 0.28 * Math.sin(2 * Math.PI * 16 * t + 0.4) + 0.15 * Math.sin(2 * Math.PI * 24 * t + 0.9);\n    return 0.5 + 0.42 * s;\n  }\n}\n\nfunction computeSpectrum(indices, vals) {\n  const M = vals.length;\n  const maxK = 32;\n  const mags = [];\n  let mean = 0;\n  for (let j = 0; j < M; j++) mean += vals[j];\n  mean /= M;\n  for (let k = 1; k <= maxK; k++) {\n    let re = 0, im = 0;\n    for (let j = 0; j < M; j++) {\n      const ang = (2 * Math.PI * k * indices[j]) / N;\n      const v = vals[j] - mean;\n      re += v * Math.cos(ang);\n      im -= v * Math.sin(ang);\n    }\n    mags.push(Math.sqrt(re * re + im * im) / Math.max(1, M * 0.45));\n  }\n  return mags;\n}\n\nfunction stopAudio() {\n  for (let i = 0; i < oscList.length; i++) {\n    try { oscList[i].stop(); oscList[i].disconnect(); } catch (e) {}\n  }\n  oscList = [];\n  if (masterGain) { try { masterGain.disconnect(); } catch (e) {} masterGain = null; }\n  isPlaying = false;\n}\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  const isFreq = !!lab.values.isFreq;\n  const pos = lab.values.cursorPos;\n  if (!wantPlay) {\n    if (isPlaying) stopAudio();\n    return;\n  }\n  try {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n  } catch (e) { return; }\n\n  stopAudio();\n  masterGain = audioCtx.createGain();\n  masterGain.connect(audioCtx.destination);\n\n  if (isFreq) {\n    masterGain.gain.setValueAtTime(0.16, audioCtx.currentTime);\n    const freqs = [523.25, 1046.5, 1569.75];\n    const amps = [0.6, 0.3, 0.16];\n    for (let i = 0; i < freqs.length; i++) {\n      const o = audioCtx.createOscillator();\n      const g = audioCtx.createGain();\n      o.type = 'sine';\n      o.frequency.setValueAtTime(freqs[i], audioCtx.currentTime);\n      g.gain.setValueAtTime(amps[i], audioCtx.currentTime);\n      o.connect(g); g.connect(masterGain);\n      o.start();\n      oscList.push(o);\n    }\n  } else {\n    const val = getSample(false, pos);\n    masterGain.gain.setValueAtTime(0.04 + val * 0.16, audioCtx.currentTime);\n    const o = audioCtx.createOscillator();\n    o.type = 'triangle';\n    o.frequency.setValueAtTime(160 + val * 440, audioCtx.currentTime);\n    o.connect(masterGain);\n    o.start();\n    oscList.push(o);\n  }\n  isPlaying = true;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const win = lab.values.windowSize;\n  const pos = lab.values.cursorPos;\n  const isFreq = !!lab.values.isFreq;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const halfL = Math.floor((win - 1) / 2);\n  const halfR = Math.ceil((win - 1) / 2);\n  let start = pos - halfL;\n  let end = pos + halfR;\n  if (start < 0) { end = Math.min(N - 1, end - start); start = 0; }\n  if (end >= N) { start = Math.max(0, start - (end - (N - 1))); end = N - 1; }\n\n  const lx = 24, ly = 34, lw = 420, lh = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= 4; gx++) {\n    const x = lx + (lw * gx) / 4;\n    ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x, ly + lh); ctx.stroke();\n  }\n  for (let gy = 0; gy <= 4; gy++) {\n    const y = ly + (lh * gy) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n  }\n\n  const sx0 = lx + (start / (N - 1)) * lw;\n  const sx1 = lx + (end / (N - 1)) * lw;\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';\n  ctx.fillRect(sx0, ly, Math.max(4, sx1 - sx0), lh);\n\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const x = lx + (i / (N - 1)) * lw;\n    const y = ly + lh - getSample(isFreq, i) * (lh - 16) - 8;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.2)';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  const capIdx = [];\n  const capVal = [];\n  ctx.beginPath();\n  for (let i = start; i <= end; i++) {\n    const v = getSample(isFreq, i);\n    capIdx.push(i); capVal.push(v);\n    const x = lx + (i / (N - 1)) * lw;\n    const y = ly + lh - v * (lh - 16) - 8;\n    if (i === start) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.strokeStyle = isFreq ? '#38bdf8' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  const curVal = getSample(isFreq, pos);\n  const cx = lx + (pos / (N - 1)) * lw;\n  const cy = ly + lh - curVal * (lh - 16) - 8;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(isFreq ? '时域波形：酒杯振铃声（多点周期关系）' : '时域波形：太阳光强与耀斑（单点即瞬时状态）', lx, 20);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时间采样点 n (0 ~ 127)', lx + lw / 2 - 55, ly + lh + 18);\n\n  const rx = 468, ry = 34, rw = 232, rh = 178;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(isFreq ? '右区：从窗口提取的频谱信息' : '右区：从单点提取的瞬时信息', rx, 20);\n\n  if (!isFreq) {\n    const barW = 48;\n    const barH = curVal * (rh - 50);\n    const bx = rx + 26;\n    const by = ry + rh - 24 - barH;\n    ctx.fillStyle = curVal > 0.5 ? '#f59e0b' : '#10b981';\n    ctx.fillRect(bx, by, barW, barH);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 15px monospace';\n    ctx.fillText((curVal * 100).toFixed(0) + '%', bx + 4, by - 8);\n\n    ctx.font = '12px sans-serif';\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('信息已完整读取！', rx + 94, ry + 48);\n    ctx.fillStyle = 'rgba(248,250,252,0.8)';\n    ctx.fillText('即使窗口仅有 1 个点：', rx + 94, ry + 74);\n    ctx.fillText('n = ' + pos + ' 时刻光强 =', rx + 94, ry + 96);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText(curVal > 0.5 ? '高能太阳耀斑爆发！' : '平静光照基线', rx + 94, ry + 118);\n  } else {\n    const mags = computeSpectrum(capIdx, capVal);\n    if (win < 8) {\n      ctx.fillStyle = '#ec4899';\n      ctx.font = 'bold 13px sans-serif';\n      ctx.fillText('样本数太少 (' + win + ' 点)！', rx + 24, ry + 62);\n      ctx.fillStyle = 'rgba(248,250,252,0.75)';\n      ctx.font = '12px sans-serif';\n      ctx.fillText('单个采样点只是一瞬间电压，', rx + 24, ry + 90);\n      ctx.fillText('完全丢失了周期、频率与泛音。', rx + 24, ry + 110);\n      ctx.fillStyle = '#38bdf8';\n      ctx.fillText('请向右拖动「观察窗口点数」', rx + 24, ry + 142);\n    } else {\n      const bw = (rw - 24) / mags.length;\n      for (let k = 0; k < mags.length; k++) {\n        const m = Math.min(1, mags[k]);\n        const bh = m * (rh - 46);\n        const isHarm = (k + 1 === 8 || k + 1 === 16 || k + 1 === 24);\n        ctx.fillStyle = isHarm && win >= 28 ? '#10b981' : '#38bdf8';\n        ctx.fillRect(rx + 12 + k * bw, ry + rh - 24 - bh, Math.max(2, bw - 1.5), bh);\n      }\n      ctx.fillStyle = win >= 28 ? '#10b981' : '#f59e0b';\n      ctx.font = '11px sans-serif';\n      ctx.fillText(win >= 28 ? '基频 f0 与 2f0/3f0 谐波清晰分离！' : '窗口仍较窄，频谱峰存在模糊泄漏', rx + 14, ry + 20);\n      ctx.fillStyle = 'rgba(248,250,252,0.6)';\n      ctx.fillText('频率索引 k (基频=8, 谐波=16, 24)', rx + 18, ry + rh - 7);\n    }\n  }\n\n  const modeText = isFreq ? '频域信号(酒杯)' : '时域信号(太阳光强)';\n  const statusText = !isFreq\n    ? ('单点即可判读 | n=' + pos + ' 光强=' + curVal.toFixed(2))\n    : (win < 8 ? '信息不可读（需多点关系才能提取频率）' : (win < 28 ? '频率轮廓初现，仍有泄漏' : '已精准提取基频与谐波特征'));\n  lab.setReadout('模式：' + modeText + ' | 窗口：' + win + ' 点 | 结论：' + statusText);\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "滤波器设计的终极权衡：阶跃响应 vs 频率响应",
      "paragraphs": [
        "区分“时域信息”和“频域信息”绝不只是学术分类，它直接决定了数字滤波器的生死：**你不可能把一个滤波器同时在时域和频域都优化到最佳状态**。在时域表现优异的滤波器，频域表现往往很差；反之，在频域能实现“刀切般”精准筛选的滤波器，在时域却会带来严重的波形畸变。",
        "为什么会这样？因为评估两者的尺子完全不同：**阶跃响应（Step Response）**专门描述滤波器如何改变“时域信息”（比如信号突变沿的快慢、是否产生振铃过冲）；而**频率响应（Frequency Response）**专门描述滤波器如何改变“频域信息”（比如通带是否平坦、阻带衰减是否陡峭）。",
        "看两个真实的工程案例：如果你在为**心电图（EKG）**设计去噪滤波器，心电波形的 P-QRS-T 尖峰与时间间隔就是核心诊断信息——这是典型的**时域信息**。此时你必须死保**阶跃响应**不失真（不能产生虚假振铃，否则会把正常波形误判为心律失常），至于频率响应滚降慢一点，根本无需在意。相反，如果你在为**助听器**设计数字滤波器，人耳和大脑主要通过声音的频率成分来分辨元音、辅音和环境噪声——这是典型的**频域信息**。此时**频率响应**就是一切，至于阶跃响应拖沓或振铃与否，几乎无关紧要。"
      ],
      "formula": {
        "expr": null,
        "explain": "时域滤波优先指标：阶跃响应（快且无过冲）；频域滤波优先指标：频率响应（过渡带窄且阻带抑制深）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：鱼与熊掌的博弈（心电图时域保真 vs 助听器频域滤波）",
      "instruction": "拖动「频域筛选陡峭度」滑块，同时观察左图（心电图/阶跃响应的时域振铃）与右图（助听器幅频响应对 2400Hz 啸叫的抑制能力），可开启音频实测听感差异。",
      "controls": [
        {
          "type": "slider",
          "id": "sharpness",
          "label": "频域筛选陡峭度",
          "min": 0,
          "max": 100,
          "step": 1,
          "value": 15,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "ekgMode",
          "label": "左侧展示真实 EKG 脉冲失真",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听助听器滤波 (800Hz语音 + 2400Hz啸叫)",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const M = 31;\nconst mid = 15;\nlet audioCtx = null;\nlet oscTarget = null;\nlet oscNoise = null;\nlet gainTarget = null;\nlet gainNoise = null;\nlet isPlaying = false;\n\nfunction buildKernel(sharpness) {\n  const alpha = sharpness / 100;\n  const hG = [], hS = [];\n  let sumG = 0, sumS = 0;\n  const fc = 0.18;\n  for (let i = 0; i < M; i++) {\n    const d = i - mid;\n    const g = Math.exp(-0.5 * Math.pow(d / 0.78, 2));\n    hG.push(g); sumG += g;\n    const s = (d === 0 ? 2 * fc : Math.sin(2 * Math.PI * fc * d) / (Math.PI * d));\n    hS.push(s); sumS += s;\n  }\n  const h = [];\n  for (let i = 0; i < M; i++) {\n    h.push((1 - alpha) * (hG[i] / sumG) + alpha * (hS[i] / sumS));\n  }\n  return h;\n}\n\nfunction evalFreq(h, f) {\n  let re = 0, im = 0;\n  for (let i = 0; i < h.length; i++) {\n    const ang = 2 * Math.PI * f * (i - mid);\n    re += h[i] * Math.cos(ang);\n    im -= h[i] * Math.sin(ang);\n  }\n  return Math.sqrt(re * re + im * im);\n}\n\nfunction getEkgSample(t, noisy) {\n  const p = 0.16 * Math.exp(-Math.pow((t - 22) / 3.5, 2));\n  const q = -0.16 * Math.exp(-Math.pow((t - 36) / 1.3, 2));\n  const r = 1.0 * Math.exp(-Math.pow((t - 40) / 1.4, 2));\n  const s = -0.26 * Math.exp(-Math.pow((t - 44) / 1.4, 2));\n  const tw = 0.28 * Math.exp(-Math.pow((t - 62) / 5.0, 2));\n  const clean = p + q + r + s + tw;\n  if (!noisy) return clean;\n  return clean + 0.08 * Math.sin(2.15 * t) + 0.06 * Math.cos(2.75 * t);\n}\n\nfunction convolve(sig, h) {\n  const out = [];\n  for (let n = 0; n < sig.length; n++) {\n    let acc = 0;\n    for (let k = 0; k < h.length; k++) {\n      const idx = n - (k - mid);\n      const val = idx < 0 ? sig[0] : (idx >= sig.length ? sig[sig.length - 1] : sig[idx]);\n      acc += val * h[k];\n    }\n    out.push(acc);\n  }\n  return out;\n}\n\nfunction stopAudio() {\n  try { if (oscTarget) { oscTarget.stop(); oscTarget.disconnect(); } } catch (e) {}\n  try { if (oscNoise) { oscNoise.stop(); oscNoise.disconnect(); } } catch (e) {}\n  try { if (gainTarget) gainTarget.disconnect(); } catch (e) {}\n  try { if (gainNoise) gainNoise.disconnect(); } catch (e) {}\n  oscTarget = null; oscNoise = null; gainTarget = null; gainNoise = null;\n  isPlaying = false;\n}\n\nfunction syncAudio(h) {\n  const wantPlay = !!lab.values.play;\n  if (!wantPlay) {\n    if (isPlaying) stopAudio();\n    return;\n  }\n  try {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n  } catch (e) { return; }\n\n  const gT = Math.min(0.25, evalFreq(h, 0.10) * 0.12);\n  const gN = Math.min(0.25, evalFreq(h, 0.30) * 0.16);\n\n  if (!isPlaying) {\n    oscTarget = audioCtx.createOscillator();\n    oscNoise = audioCtx.createOscillator();\n    gainTarget = audioCtx.createGain();\n    gainNoise = audioCtx.createGain();\n    oscTarget.type = 'sine'; oscTarget.frequency.setValueAtTime(800, audioCtx.currentTime);\n    oscNoise.type = 'sine'; oscNoise.frequency.setValueAtTime(2400, audioCtx.currentTime);\n    gainTarget.gain.setValueAtTime(gT, audioCtx.currentTime);\n    gainNoise.gain.setValueAtTime(gN, audioCtx.currentTime);\n    oscTarget.connect(gainTarget); gainTarget.connect(audioCtx.destination);\n    oscNoise.connect(gainNoise); gainNoise.connect(audioCtx.destination);\n    oscTarget.start(); oscNoise.start();\n    isPlaying = true;\n  } else {\n    gainTarget.gain.setTargetAtTime(gT, audioCtx.currentTime, 0.03);\n    gainNoise.gain.setTargetAtTime(gN, audioCtx.currentTime, 0.03);\n  }\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const sharp = lab.values.sharpness;\n  const ekgMode = !!lab.values.ekgMode;\n  const h = buildKernel(sharp);\n  syncAudio(h);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 24, ly = 34, lw = 318, lh = 176;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const x = lx + (lw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x, ly + lh); ctx.stroke();\n    const y = ly + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n  }\n\n  let maxOvershoot = 0;\n  const L = 90;\n  if (!ekgMode) {\n    const stepIn = [];\n    for (let i = 0; i < L; i++) stepIn.push(i < 35 ? 0 : 1);\n    const stepOut = convolve(stepIn, h);\n    for (let i = 0; i < L; i++) maxOvershoot = Math.max(maxOvershoot, (stepOut[i] - 1) * 100);\n\n    ctx.beginPath();\n    for (let i = 0; i < L; i++) {\n      const x = lx + (i / (L - 1)) * lw;\n      const y = ly + lh - 22 - stepIn[i] * (lh - 56);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(248,250,252,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.beginPath();\n    for (let i = 0; i < L; i++) {\n      const x = lx + (i / (L - 1)) * lw;\n      const y = ly + lh - 22 - stepOut[i] * (lh - 56);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.strokeStyle = maxOvershoot > 3 ? '#ec4899' : '#10b981';\n    ctx.lineWidth = 2.5; ctx.stroke();\n  } else {\n    const cleanEkg = [], noisyEkg = [];\n    for (let i = 0; i < L; i++) {\n      cleanEkg.push(getEkgSample(i, false));\n      noisyEkg.push(getEkgSample(i, true));\n    }\n    const filtEkg = convolve(noisyEkg, h);\n\n    const stepIn = [];\n    for (let i = 0; i < L; i++) stepIn.push(i < 35 ? 0 : 1);\n    const stepOut = convolve(stepIn, h);\n    for (let i = 0; i < L; i++) maxOvershoot = Math.max(maxOvershoot, (stepOut[i] - 1) * 100);\n\n    ctx.beginPath();\n    for (let i = 0; i < L; i++) {\n      const x = lx + (i / (L - 1)) * lw;\n      const y = ly + lh - 46 - cleanEkg[i] * 102;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(248,250,252,0.35)'; ctx.lineWidth = 1.5; ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.beginPath();\n    for (let i = 0; i < L; i++) {\n      const x = lx + (i / (L - 1)) * lw;\n      const y = ly + lh - 46 - filtEkg[i] * 102;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.strokeStyle = maxOvershoot > 3 ? '#ec4899' : '#38bdf8';\n    ctx.lineWidth = 2.4; ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(ekgMode ? '时域表现：EKG 心电信号去噪' : '时域表现：滤波器阶跃响应', lx, 20);\n  ctx.fillStyle = maxOvershoot > 3 ? '#ec4899' : '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(maxOvershoot > 3 ? '警告：出现虚假吉布斯振铃过冲！(' + maxOvershoot.toFixed(1) + '%)' : '优秀：波形干净无振铃过冲 (' + Math.max(0, maxOvershoot).toFixed(1) + '%)', lx, ly + lh + 17);\n\n  const rx = 380, ry = 34, rw = 318, rh = 176;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const x = rx + (rw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); ctx.stroke();\n    const y = ry + (rh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + rw, y); ctx.stroke();\n  }\n\n  const xTarget = rx + (0.10 / 0.5) * rw;\n  const xNoise = rx + (0.30 / 0.5) * rw;\n  ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n  ctx.beginPath(); ctx.moveTo(xTarget, ry); ctx.lineTo(xTarget, ry + rh); ctx.stroke();\n  ctx.strokeStyle = 'rgba(236,72,153,0.5)';\n  ctx.beginPath(); ctx.moveTo(xNoise, ry); ctx.lineTo(xNoise, ry + rh); ctx.stroke();\n\n  ctx.beginPath();\n  for (let px = 0; px <= rw; px += 2) {\n    const f = (px / rw) * 0.5;\n    const mag = Math.min(1.15, evalFreq(h, f));\n    const y = ry + rh - 12 - mag * (rh - 34);\n    if (px === 0) ctx.moveTo(rx + px, y); else ctx.lineTo(rx + px, y);\n  }\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.stroke();\n\n  const mT = evalFreq(h, 0.10);\n  const mN = evalFreq(h, 0.30);\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(xTarget, ry + rh - 12 - mT * (rh - 34), 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(xNoise, ry + rh - 12 - mN * (rh - 34), 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('频域表现：幅频响应 |H(f)|（助听器）', rx, 20);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981'; ctx.fillText('800Hz 目标: ' + (mT * 100).toFixed(0) + '%', rx + 8, ry + 16);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('2400Hz 啸叫: ' + (mN * 100).toFixed(0) + '%', rx + 145, ry + 16);\n  ctx.fillStyle = mN < 0.12 ? '#10b981' : '#f59e0b';\n  ctx.fillText(mN < 0.12 ? '优秀：2400Hz 啸叫被彻底抑制' : '较差：滚降太缓，啸叫明显泄漏', rx, ly + lh + 17);\n\n  lab.setReadout('陡峭度: ' + sharp + '% | 阶跃过冲: ' + Math.max(0, maxOvershoot).toFixed(1) + '% | 2400Hz啸叫残余: ' + (mN * 100).toFixed(1) + '%');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "先问信息藏在哪，再选滤波器：看到信号先问自己“单点数值有意义（时域），还是多点周期关系有意义（频域）”？这一步搞反，后续算法调参全白费。",
        "不要幻想“全能最优滤波器”：在频域切得越陡峭（砖墙响应），时域阶跃响应的吉布斯振铃与过冲就越严重；反之时域平滑无过冲，频域过渡带必然拖泥带水。",
        "对症下药选指标：心电图（EKG）、雷达脉冲测距、传感器突变检测等时域任务，死磕**阶跃响应**；音频均衡器、助听器、通信信道分离等频域任务，死磕**频率响应**。"
      ]
    }
  ]
});
