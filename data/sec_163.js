window.__BOOK_REGISTER_SECTION__("sec_163", {
  "title": "音质与数据率的权衡 (Sound Quality vs. Data Rate)",
  "intuition": "数字音频设计的核心博弈：用多少比特每秒（数据率）的带宽代价，去换取人耳能感知到的频响宽度与动态精度。",
  "blocks": [
    {
      "type": "concept",
      "heading": "数字音频系统的两大灵魂拷问与三大阵营",
      "paragraphs": [
        "在设计任何数字音频系统之前，工程师必须先回答两个核心问题：**（1）声音需要达到多好的听感？** **（2）系统能容忍多高的数据率？** 对这两个问题的不同取舍，将整个数字音频世界划分成了三大典型阵营。",
        "**1. 高保真音乐 (High Fidelity Music)**：音质是一切，数据率几乎可以不计成本。以 CD 唱片为代表，它使用 **44.1 kHz** 的采样率和 **16 bit** 的量化精度，几乎能完整捕获人耳听觉极限内的所有声音。这种极致音质靠的是纯粹的“蛮力”（Brute force），代价是高达 **706 kbits/sec** 的数据流。",
        "**2. 电话通信 (Telephone Communication)**：追求自然可辨的语音听感，同时必须压低数据率以削减传输成本。通信系统通常采用约 **8 kHz** 的采样率，并将精度从 16 bit 缩减到 **12 bit**（96 kbits/sec）；如果再配合非均匀量化（压扩技术），位深可进一步降到 **8 bit**，数据率仅 **64 kbits/sec**——不到 CD 音乐的十分之一。",
        "**3. 压缩语音 (Compressed Speech)**：压榨数据率是第一要务，允许音质出现一定的不自然感。常用于军事通信、蜂窝移动电话、语音信箱和多媒体存储，数据率可被压低至 **4 kbits/sec** 左右。"
      ],
      "formula": {
        "expr": "R = f_s × N_bits",
        "explain": "R 为未压缩数字音频的数据率（bits/sec）；f_s 为每秒采样次数即采样率（Hz）；N_bits 为每个采样点所占用的二进制位数（bits/sample）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：实时听辨频宽裁剪、量化台阶与压扩降噪",
      "instruction": "点击“播放对比音频”，拖动「信号有效带宽」从 20 kHz 降到 3.2 kHz 体会 FM 与 AM/电话音质差异；降低「量化精度」观察台阶失真并切换「压扩」看非均匀量化如何挽救小信号。",
      "controls": [
        {
          "type": "slider",
          "id": "bw",
          "label": "信号有效带宽",
          "min": 1.5,
          "max": 20,
          "step": 0.1,
          "value": 20,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化精度",
          "min": 3,
          "max": 16,
          "step": 1,
          "value": 16,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "compand",
          "label": "开启压扩 (Companding)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phase = 0;\nlet audioNodes = null;\n\nfunction makeQuantCurve(bits, compand) {\n  const n = 4096;\n  const curve = new Float32Array(n);\n  const levels = Math.pow(2, bits);\n  const half = levels / 2;\n  const mu = 255;\n  for (let i = 0; i < n; i++) {\n    const x = (i * 2) / (n - 1) - 1;\n    let y;\n    if (!compand) {\n      y = Math.round(x * half) / half;\n    } else {\n      const s = x < 0 ? -1 : 1;\n      const xc = s * Math.log(1 + mu * Math.abs(x)) / Math.log(1 + mu);\n      const xq = Math.round(xc * half) / half;\n      const sq = xq < 0 ? -1 : 1;\n      y = sq * (Math.pow(1 + mu, Math.abs(xq)) - 1) / mu;\n    }\n    curve[i] = Math.max(-1, Math.min(1, y));\n  }\n  return curve;\n}\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  const bwHz = lab.values.bw * 1000;\n  const bits = Math.round(lab.values.bits);\n  const compand = !!lab.values.compand;\n\n  if (!wantPlay) {\n    if (audioNodes && audioNodes.master) {\n      audioNodes.master.gain.setTargetAtTime(0, audioNodes.ac.currentTime, 0.03);\n    }\n    return;\n  }\n\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n\n  if (!audioNodes || audioNodes.ac !== ac) {\n    const master = ac.createGain();\n    master.gain.value = 0;\n    const filter = ac.createBiquadFilter();\n    filter.type = 'lowpass';\n    filter.Q.value = 0.7;\n    const shaper = ac.createWaveShaper();\n    shaper.oversample = 'none';\n    const lfo = ac.createOscillator();\n    const lfoGain = ac.createGain();\n    const envGain = ac.createGain();\n    envGain.gain.value = 0.55;\n    lfo.frequency.value = 0.6;\n    lfoGain.gain.value = 0.4;\n    lfo.connect(lfoGain);\n    lfoGain.connect(envGain.gain);\n    lfo.start();\n\n    const freqs = [220, 440, 660, 1100, 2200, 4400, 7040, 10560];\n    const amps = [0.28, 0.22, 0.16, 0.12, 0.09, 0.07, 0.05, 0.04];\n    freqs.forEach((f, idx) => {\n      const osc = ac.createOscillator();\n      const g = ac.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = f;\n      g.gain.value = amps[idx];\n      osc.connect(g);\n      g.connect(envGain);\n      osc.start();\n    });\n\n    envGain.connect(shaper);\n    shaper.connect(filter);\n    filter.connect(master);\n    master.connect(ac.destination);\n    audioNodes = { ac, master, filter, shaper };\n  }\n\n  audioNodes.filter.frequency.setTargetAtTime(bwHz, ac.currentTime, 0.02);\n  audioNodes.shaper.curve = makeQuantCurve(bits, compand);\n  audioNodes.master.gain.setTargetAtTime(0.32, ac.currentTime, 0.03);\n}\n\nfunction quantizeVal(x, bits, compand) {\n  const levels = Math.pow(2, bits);\n  const half = levels / 2;\n  const mu = 255;\n  if (!compand) return Math.round(x * half) / half;\n  const s = x < 0 ? -1 : 1;\n  const xc = s * Math.log(1 + mu * Math.abs(x)) / Math.log(1 + mu);\n  const xq = Math.round(xc * half) / half;\n  const sq = xq < 0 ? -1 : 1;\n  return sq * (Math.pow(1 + mu, Math.abs(xq)) - 1) / mu;\n}\n\nfunction draw() {\n  const bw = lab.values.bw;\n  const bits = Math.round(lab.values.bits);\n  const compand = !!lab.values.compand;\n  const fsApprox = (bw * 2.205).toFixed(1);\n  const rateKbps = (parseFloat(fsApprox) * bits).toFixed(0);\n  const octavesPreserved = Math.max(0, Math.min(10, Math.log2(bw * 1000 / 20)));\n  const infoPct = Math.round((octavesPreserved / 10) * 100);\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left panel: Waveform quantization\n  const lx = 18, ly = 26, lw = 335, lh = 192;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.beginPath();\n  ctx.moveTo(lx, ly + lh / 2);\n  ctx.lineTo(lx + lw, ly + lh / 2);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域量化对比（模拟小信号包络）', lx + 6, ly - 8);\n\n  // Draw original smooth wave\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 2;\n  for (let i = 0; i <= lw; i++) {\n    const t = i / lw;\n    const env = 0.15 + 0.85 * Math.pow(Math.sin(t * Math.PI), 2);\n    const val = env * (0.7 * Math.sin(t * Math.PI * 6 + phase) + 0.3 * Math.sin(t * Math.PI * 14 + phase * 1.5));\n    const py = ly + lh / 2 - val * (lh * 0.42);\n    if (i === 0) ctx.moveTo(lx + i, py); else ctx.lineTo(lx + i, py);\n  }\n  ctx.stroke();\n\n  // Draw quantized wave\n  ctx.beginPath();\n  ctx.strokeStyle = compand ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2;\n  const sampleStep = Math.max(2, Math.round(20 / Math.max(1.5, bw) * 3));\n  let prevY = ly + lh / 2;\n  for (let i = 0; i <= lw; i += sampleStep) {\n    const t = i / lw;\n    const env = 0.15 + 0.85 * Math.pow(Math.sin(t * Math.PI), 2);\n    const raw = env * (0.7 * Math.sin(t * Math.PI * 6 + phase) + 0.3 * Math.sin(t * Math.PI * 14 + phase * 1.5));\n    const q = quantizeVal(raw, bits, compand);\n    const py = ly + lh / 2 - q * (lh * 0.42);\n    if (i === 0) ctx.moveTo(lx + i, py);\n    else {\n      ctx.lineTo(lx + i, prevY);\n      ctx.lineTo(lx + i, py);\n    }\n    prevY = py;\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('— 原始信号', lx + 8, ly + 16);\n  ctx.fillStyle = compand ? '#10b981' : '#f59e0b';\n  ctx.fillText(compand ? '— 压扩量化 (小信号更精细)' : '— 均匀量化台阶', lx + 95, ly + 16);\n\n  // Right panel: Octave coverage (20 Hz to 20 kHz = 10 octaves)\n  const rx = 375, ry = 26, rw = 327, rh = 192;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('对数八度信息覆盖率 (20 Hz ~ 20 kHz = 10 Octaves)', rx + 6, ry - 8);\n\n  const barY = ry + 64;\n  const barH = 44;\n  const activeW = (octavesPreserved / 10) * (rw - 24);\n  for (let oct = 0; oct < 10; oct++) {\n    const ox = rx + 12 + (oct / 10) * (rw - 24);\n    const ow = (rw - 24) / 10 - 2;\n    const frac = Math.max(0, Math.min(1, octavesPreserved - oct));\n    ctx.fillStyle = 'rgba(255,255,255,0.07)';\n    ctx.fillRect(ox, barY, ow, barH);\n    if (frac > 0) {\n      ctx.fillStyle = oct >= 8 ? '#ec4899' : '#10b981';\n      ctx.fillRect(ox, barY, ow * frac, barH);\n    }\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('' + (oct + 1), ox + ow / 2 - 4, barY + barH + 14);\n  }\n\n  // Cutoff marker\n  const cutX = rx + 12 + activeW;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(cutX, barY - 12);\n  ctx.lineTo(cutX, barY + barH + 22);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('保留频段: 20 Hz ~ ' + bw.toFixed(1) + ' kHz', rx + 12, ry + 32);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('保留八度: ' + octavesPreserved.toFixed(1) + ' / 10 (' + infoPct + '% 听觉信息)', rx + 12, ry + 152);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  const hint = bw <= 3.5 ? '接近 AM 广播 / 电话语音 (语音自然，音乐单薄)' : (bw >= 15 ? '接近 FM 广播 / CD 高保真音质' : '中高频逐渐通透，接近宽带音频');\n  ctx.fillText(hint, rx + 12, ry + 174);\n\n  lab.setReadout('带宽: ' + bw.toFixed(1) + ' kHz | 推算采样率: ~' + fsApprox + ' kHz | 精度: ' + bits + ' bit (' + (compand ? '压扩' : '均匀') + ') | 数据率: ~' + rateKbps + ' kbps');\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop((dt) => {\n  phase += dt * (lab.values.play ? 4.0 : 1.2);\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "为什么砍掉 84% 的频率，却能保住 80% 的声音信息？",
      "paragraphs": [
        "人类听觉对频率的感知是**对数分布**的：每当频率翻一倍，称为一个**八度（Octave）**，而每个八度承载的音频信息量大致相等。人类可听范围（20 Hz 到 20 kHz）大约跨越 **10 个八度**。",
        "高保真音乐需要 **20 kHz** 的全频带，但自然流畅的人声其实只需要 **3.2 kHz**（200 Hz 至 3.2 kHz）。表面上看，频率范围从 20 kHz 砍到 3.2 kHz 只剩下了 **16%**；但按对数八度来算，3.2 kHz 依然覆盖了 **10 个八度中的 8 个**，保留了高达 **80%** 的原始声音信息！",
        "日常生活中我们早已听过这种对比：**FM 调频广播**拥有接近 **20 kHz** 的带宽，音乐丰满动听；而 **AM 调幅广播**带宽被限制在 **3.2 kHz** 左右，播音员说话依然清晰自然，但一旦播放音乐就会显得单薄干瘪、缺乏光泽。",
        "在量化精度上，纯语音系统可以从 **16 bit** 降到 **12 bit** 而不易察觉失真；如果进一步采用**压扩（Companding）**技术——即让量化台阶呈**非均匀分布**（对小音量使用极细密的台阶，对大音量使用较粗的台阶），位深可以一路压缩到 **8 bit**，数据率瞬间减半至 **64 kbits/sec**。"
      ],
      "formula": {
        "expr": "I_ratio ≈ log₂(f_max / f_min) / 10",
        "explain": "I_ratio 为保留的听觉信息占比；f_max 与 f_min 分别为系统通带的最高和最低频率（如电话语音为 3200 Hz 与 200 Hz），分母 10 代表人类完整听觉约 10 个八度。"
      }
    },
    {
      "type": "concept",
      "heading": "突破“蛮力”极限：线性预测编码 (LPC) 与表 22-2 全景",
      "paragraphs": [
        "无论是 CD 的 **706 kbits/sec**，还是压扩电话语音的 **64 kbits/sec**，本质上都只是采样定理与量化理论的直接套用（即“蛮力”编码）。要想把数据率压得更低，就必须利用信号内部的**固有冗余**进行数据压缩。",
        "语音信号具有极强的时域相关性与发声模型规律，因此非常适合压缩。**线性预测编码（Linear Predictive Coding, LPC）** 是最高效的语音压缩技术之一：它不再逐点传送波形采样值，而是提取声道共振峰、基音周期等发声参数，接收端再根据参数把声音“合成”出来。",
        "借助 LPC 等参数编码技术，数据率可以从 64 kbits/sec 骤降到 **2~6 kbits/sec**（表 22-2 中典型值为 **4 kbits/sec**），代价是语音听起来会有明显的机械感或合成痕迹，适合对带宽极其敏感的场景。"
      ],
      "formula": {
        "expr": "CR = R_raw / R_compressed",
        "explain": "CR 为压缩比；将 64 kbits/sec 的自然电话语音压缩为 4 kbits/sec 的 LPC 语音，压缩比高达 16:1，仅需原本 6.25% 的传输带宽。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：音频数据率预算与经典标准对标仪 (Table 22-2)",
      "instruction": "调节「采样率」与「位深」，或开启「语音参数压缩 (LPC)」，实时对比当前设计方案在表 22-2 四大经典标准中的位置与带宽开销。",
      "controls": [
        {
          "type": "slider",
          "id": "fs",
          "label": "采样率 (Sampling Rate)",
          "min": 4,
          "max": 48,
          "step": 0.5,
          "value": 8,
          "unit": " kHz"
        },
        {
          "type": "slider",
          "id": "bits",
          "label": "量化位深 (Bits/Sample)",
          "min": 4,
          "max": 16,
          "step": 1,
          "value": 8,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "lpc",
          "label": "启用 LPC 语音压缩 (去除冗余)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const fs = lab.values.fs;\n  const bits = Math.round(lab.values.bits);\n  const lpc = !!lab.values.lpc;\n  const rawRate = fs * bits;\n  const actualRate = lpc ? Math.max(2, Math.min(6, rawRate / 16)) : rawRate;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const benchmarks = [\n    { name: 'CD 高保真音乐 (44.1 kHz, 16-bit)', rate: 706, color: '#38bdf8' },\n    { name: '线性电话语音 (8 kHz, 12-bit)', rate: 96, color: '#818cf8' },\n    { name: '压扩电话语音 (8 kHz, 8-bit)', rate: 64, color: '#10b981' },\n    { name: 'LPC 压缩语音 (8 kHz + 压缩)', rate: 4, color: '#ec4899' },\n    { name: '当前你的配置' + (lpc ? ' (已开LPC)' : ''), rate: actualRate, color: '#f59e0b', highlight: true }\n  ];\n\n  // Header info\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('实时数据率对比 (对数刻度，直观呈现数量级差异)', 20, 24);\n\n  const maxLog = Math.log10(1000);\n  const startX = 245;\n  const maxW = 385;\n  let y = 44;\n\n  benchmarks.forEach((b) => {\n    if (b.highlight) {\n      ctx.fillStyle = 'rgba(245,158,11,0.12)';\n      ctx.fillRect(14, y - 4, W - 28, 32);\n    }\n    ctx.fillStyle = b.highlight ? '#f59e0b' : '#cbd5e1';\n    ctx.font = b.highlight ? 'bold 12px sans-serif' : '12px sans-serif';\n    ctx.fillText(b.name, 20, y + 16);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.06)';\n    ctx.fillRect(startX, y + 4, maxW, 16);\n\n    const barLen = Math.max(4, (Math.log10(Math.max(1, b.rate)) / maxLog) * maxW);\n    ctx.fillStyle = b.color;\n    ctx.fillRect(startX, y + 4, Math.min(maxW, barLen), 16);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(b.rate.toFixed(b.rate < 10 ? 1 : 0) + ' kbps', startX + maxW + 10, y + 16);\n    y += 38;\n  });\n\n  const bwNyquist = (fs / 2.2).toFixed(1);\n  let verdict = '';\n  if (lpc) verdict = '极低数据率，适合窄带通信/存储，但音色存在合成机械感';\n  else if (fs >= 40 && bits >= 16) verdict = '超越人耳极限的发烧级音质，数据率开销极大';\n  else if (fs >= 7.5 && fs <= 12 && bits >= 8) verdict = '典型电信级语音标准：人声自然，音乐质感大幅退化';\n  else if (fs < 7) verdict = '警告：采样率过低，人声高频辅音（如 s/sh）将发闷模糊';\n  else verdict = '中等宽带配置：兼顾部分泛音细节与适中的数据体积';\n\n  lab.setReadout('实际数据率: ' + actualRate.toFixed(1) + ' kbps | 有效最高频响约: ' + bwNyquist + ' kHz | 工程评价: ' + verdict);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数据率直接等于 采样率 × 位深（针对未压缩 PCM）：降采样率会直接砍掉高频泛音（让音乐变闷），降位深则会抬高底噪或引入量化台阶失真。",
        "不要盲目按“线性频率占比”估算音质损失：把带宽从 20 kHz 砍到 3.2 kHz 虽然丢了 84% 的频谱宽度，但按人耳对数八度感知仍保留了 80% 的核心信息量。",
        "语音系统省流量的两级跳：第一级靠“8 kHz 采样 + 8 bit 压扩”将蛮力数据率压到 64 kbps（不到 CD 的 10%）；第二级靠“LPC 等参数压缩”去除语音冗余，压到 2~6 kbps，但需接受一定程度的音色不自然。"
      ]
    }
  ]
});
