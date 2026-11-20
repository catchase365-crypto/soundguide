window.__BOOK_REGISTER_SECTION__("sec_141", {
  "title": "加窗 Sinc 滤波器实战：脑电波分离与电话信令带通 (Examples of Windowed-Sinc Filters)",
  "intuition": "只需先设计好最基础的低通滤波器，再配合“频谱反转”和“核相加”两招积木变换，就能像手术刀一样从混杂信号中精准剥离脑电 Alpha/Beta 波或特定频率的电话信令。",
  "blocks": [
    {
      "type": "concept",
      "heading": "实战一：用低通与高通滤波器分离脑电图 (EEG) 节律",
      "paragraphs": [
        "脑电图 (EEG) 记录了大脑皮层大量神经细胞同步放电产生的毫伏级电信号。不同的大脑状态对应着截然不同的频率节律：当你**闭眼放松**时，主导波形是 **7–12 Hz** 的缓慢振荡，称为 **Alpha 节律**（代表平静与注意力降低）；当你**睁眼环顾四周**时，波形会切换为 **17–20 Hz** 的 **Beta 节律**。",
        "假设我们对 EEG 信号以 `100 samples/sec`（100 Hz）的采样率连续采集 50 秒，得到 5,000 个采样点。为了把 Alpha 波和 Beta 波彻底拆开，我们可以将截止频率定在两者正中间的 **14 Hz**（即采样率的 `0.14` 倍），并把过渡带宽设为 **4 Hz**（采样率的 `0.04` 倍）。",
        "根据窗长度经验公式 `M ≈ 4 / BW`，算出 `M = 4 / 0.04 = 100`，因此滤波器核需要 **101 个点**（下标 `0` 到 `100`），这里我们选用 **Hamming 窗** 即可得到优秀的低通滤波器来提取 Alpha 波。那提取 Beta 波的高通滤波器怎么设计呢？根本不用推倒重算！只需对刚才的低通核做一次**频谱反转 (Spectral Inversion)**——把核里所有系数取反，再给正中心点加上 `1`，低通滤波器瞬间就翻转成了完美的高通滤波器！"
      ],
      "formula": {
        "expr": "h_hp[i] = -h_lp[i] (i ≠ M/2);   h_hp[M/2] = 1 - h_lp[M/2]",
        "explain": "h_lp 为长度为 M+1 (M 为偶数) 的归一化低通滤波器核；将所有采样点取反相当于在频域乘以 -1，中心点加 1 相当于全通脉冲 δ[n]，二者叠加即为频谱互补的高通核 h_hp，确保 H_lp(f) + H_hp(f) = 1。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：EEG Alpha / Beta 节律分离实验室",
      "instruction": "拖动「截止频率」和「核长度 M」观察过渡带陡峭度变化，点击「开启频谱反转」一键在提取 Alpha 低通与提取 Beta 高通之间切换。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "截止频率 fc",
          "min": 8,
          "max": 22,
          "step": 0.5,
          "value": 14,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "mLen",
          "label": "核长度参数 M",
          "min": 20,
          "max": 160,
          "step": 10,
          "value": 100,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "invert",
          "label": "开启频谱反转 (切换高通提取 Beta)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction buildKernel(fcHz, M, invert) {\n  const fs = 100;\n  const fc = fcHz / fs;\n  const h = new Float64Array(M + 1);\n  const half = M / 2;\n  let sum = 0;\n  for (let i = 0; i <= M; i++) {\n    const n = i - half;\n    const sinc = n === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * n) / n;\n    const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / M);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i <= M; i++) h[i] /= sum;\n  if (invert) {\n    for (let i = 0; i <= M; i++) h[i] = -h[i];\n    h[half] += 1;\n  }\n  return h;\n}\n\nfunction magResponse(h, fHz) {\n  const M = h.length - 1;\n  const half = M / 2;\n  const w = (2 * Math.PI * fHz) / 100;\n  let acc = h[half];\n  for (let k = 1; k <= half; k++) {\n    acc += 2 * h[half + k] * Math.cos(w * k);\n  }\n  return Math.abs(acc);\n}\n\nfunction draw() {\n  const fcHz = lab.values.cutoff;\n  const M = Math.round(lab.values.mLen / 2) * 2;\n  const invert = lab.values.invert;\n  const h = buildKernel(fcHz, M, invert);\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left Panel: Frequency Response (0 - 50 Hz)\n  const lx = 44, ly = 26, lw = 296, lh = 178;\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(lx, ly, lw, lh);\n\n  // Shaded Alpha (7-12 Hz) & Beta (17-20 Hz) bands\n  const fToX = f => lx + (f / 50) * lw;\n  const ampToY = a => ly + lh - (Math.min(1.25, Math.max(0, a)) / 1.25) * lh;\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n  ctx.fillRect(fToX(7), ly, fToX(12) - fToX(7), lh);\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';\n  ctx.fillRect(fToX(17), ly, fToX(20) - fToX(17), lh);\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let a = 0; a <= 1.0; a += 0.5) {\n    const y = ampToY(a);\n    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText(a.toFixed(1), lx - 6, y + 3);\n  }\n  for (let f = 0; f <= 50; f += 10) {\n    const x = fToX(f);\n    ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x, ly + lh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(f + 'Hz', x, ly + lh + 14);\n  }\n\n  // Cutoff marker\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(fToX(fcHz), ly); ctx.lineTo(fToX(fcHz), ly + lh); ctx.stroke();\n  ctx.restore();\n\n  // Band Labels\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('Alpha', fToX(9.5), ly + 14);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('Beta', fToX(18.5), ly + 14);\n\n  // Plot |H(f)|\n  ctx.strokeStyle = invert ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const f = (i / 150) * 50;\n    const x = fToX(f);\n    const y = ampToY(magResponse(h, f));\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(invert ? '频响 (高通滤波: 频谱反转)' : '频响 (低通滤波: 原始核)', lx, ly - 8);\n\n  // Right Panel: Simulated EEG Time-Domain Separation\n  const rx = 382, ry = 26, rw = 320, rh = 178;\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  const midY = ry + rh / 2;\n  ctx.beginPath(); ctx.moveTo(rx, midY); ctx.lineTo(rx + rw, midY); ctx.stroke();\n\n  const totalN = 300;\n  const xSig = new Float64Array(totalN);\n  for (let n = 0; n < totalN; n++) {\n    xSig[n] = 0.85 * Math.sin((2 * Math.PI * 10 * n) / 100) + 0.7 * Math.sin((2 * Math.PI * 18.5 * n) / 100 + 0.8);\n  }\n  const startIdx = 170;\n  const showN = 110;\n\n  // Original mixed EEG\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (let j = 0; j < showN; j++) {\n    const px = rx + (j / (showN - 1)) * rw;\n    const py = midY - xSig[startIdx + j] * 46;\n    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Filtered EEG via convolution\n  ctx.strokeStyle = invert ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let j = 0; j < showN; j++) {\n    const n = startIdx + j;\n    let yVal = 0;\n    for (let k = 0; k <= M; k++) yVal += h[k] * xSig[n - k];\n    const px = rx + (j / (showN - 1)) * rw;\n    const py = midY - yVal * 46;\n    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域分离对比 (灰: 混合EEG / 亮色: 滤波输出)', rx, ry - 8);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('采样窗口: 1.1秒 @ 100 Hz', rx, ry + rh + 14);\n\n  const gAlpha = magResponse(h, 10);\n  const gBeta = magResponse(h, 18.5);\n  const bwHz = (4 * 100) / M;\n  lab.setReadout(\n    (invert ? '高通(Beta)' : '低通(Alpha)') +\n    ' | 核点数: ' + (M + 1) +\n    ' | 理论过渡带宽: ' + bwHz.toFixed(1) + ' Hz' +\n    ' | 10Hz(Alpha)增益: ' + gAlpha.toFixed(2) +\n    ' | 18.5Hz(Beta)增益: ' + gBeta.toFixed(2)\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "实战二：四步积木法构造 801 点电话信令带通滤波器",
      "paragraphs": [
        "第二个经典案例来自音频处理：假设电话按键产生的**信令音 (Signaling Tone)** 被以 `10 kHz` 采样率数字化，我们需要从嘈杂的语音中精准提取以 `2 kHz` 为中心、宽度仅 `80 Hz` 的极窄频带——即放行 **1960 Hz 到 2040 Hz**（离散频率 `0.196` 到 `0.204`），并把其余频率统统拦截。",
        "为了实现仅 `50 Hz`（`0.005` 倍采样率）的极陡峭过渡带，我们需要高达 **801 个点**（`M = 800`）的滤波器核！同时，为了获得更深的阻带衰减以彻底压制邻近强干扰，这里放弃了 Hamming 窗（阻带约 -53 dB），改用阻带抑制极强的 **Blackman 窗**（图 16-6b 显示其阻带衰减深达 **-100 dB** 以下，相当于把干扰幅值压低十万倍）。",
        "如何构造这个带通滤波器？依然采用“低通积木四步法”：**①** 设计截止于 `0.196` 的低通核 `LP1`；**②** 设计截止于 `0.204` 的低通核 `LP2`，对其做频谱反转得到高通核 `HP2`；**③** 将 `LP1` 与 `HP2` 直接相加，得到把 `[0.196, 0.204]` 挖空的**带阻滤波器**；**④** 对带阻核再做一次**频谱反转**，凹槽瞬间翻转为尖峰，大功告成！"
      ],
      "formula": {
        "expr": "h_bp = Invert( h_lp(0.196) + Invert(h_lp(0.204)) )",
        "explain": "先用两个低通核一正一反拼出带阻滤波器（保留两侧、挖空中间），再整体做一次频谱反转，把被挖空的窄带变成唯一被放行的通带。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：电话信令带通滤波与真实听感对比 (支持 Web Audio 发声)",
      "instruction": "点击「播放测试音与干扰」并拖动「测试信号频率」横扫 2000 Hz 通带，耳听为虚、眼见为实：对比滤波开关及 Blackman/Hamming 窗对阻带噪声的压制深度。",
      "controls": [
        {
          "type": "slider",
          "id": "toneFreq",
          "label": "输入测试音频率",
          "min": 500,
          "max": 4000,
          "step": 50,
          "value": 2000,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "useBlackman",
          "label": "使用 Blackman 窗 (关闭对比 Hamming)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "filterOn",
          "label": "开启 2kHz 带通滤波 (关闭听原混音)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音与干扰",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction buildBandPass(fc1Norm, fc2Norm, M, isBlackman) {\n  const half = M / 2;\n  function makeLP(fc) {\n    const h = new Float64Array(M + 1);\n    let s = 0;\n    for (let i = 0; i <= M; i++) {\n      const n = i - half;\n      const sinc = n === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * n) / n;\n      const p = (2 * Math.PI * i) / M;\n      const win = isBlackman\n        ? 0.42 - 0.5 * Math.cos(p) + 0.08 * Math.cos(2 * p)\n        : 0.54 - 0.46 * Math.cos(p);\n      h[i] = sinc * win;\n      s += h[i];\n    }\n    for (let i = 0; i <= M; i++) h[i] /= s;\n    return h;\n  }\n  const lp1 = makeLP(fc1Norm);\n  const lp2 = makeLP(fc2Norm);\n  // Invert lp2 -> hp2, add lp1 -> br, invert br -> bp\n  const bp = new Float64Array(M + 1);\n  for (let i = 0; i <= M; i++) {\n    const hp2 = -lp2[i] + (i === half ? 1 : 0);\n    const br = lp1[i] + hp2;\n    bp[i] = -br + (i === half ? 1 : 0);\n  }\n  return bp;\n}\n\n// Precompute 801-pt visual kernels at fs=10kHz (Fig 16-6)\nconst visBlackman = buildBandPass(0.196, 0.204, 800, true);\nconst visHamming = buildBandPass(0.196, 0.204, 800, false);\n\nfunction evalDb(kernel, fHz, fs) {\n  const M = kernel.length - 1;\n  const half = M / 2;\n  const w = (2 * Math.PI * fHz) / fs;\n  let acc = kernel[half];\n  for (let k = 1; k <= half; k++) {\n    acc += 2 * kernel[half + k] * Math.cos(w * k);\n  }\n  const db = 20 * Math.log10(Math.max(1e-7, Math.abs(acc)));\n  return Math.max(-125, Math.min(10, db));\n}\n\nconst audioState = {\n  nodes: null\n};\n\nfunction syncAudio() {\n  const play = lab.values.play;\n  const toneFreq = lab.values.toneFreq;\n  const useBlackman = lab.values.useBlackman;\n  const filterOn = lab.values.filterOn;\n\n  if (!play && !audioState.nodes) return;\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (play && ac.state === 'suspended') ac.resume();\n\n  if (!audioState.nodes) {\n    const fs = ac.sampleRate;\n    const M = 1200;\n    const kB = buildBandPass(1900 / fs, 2100 / fs, M, true);\n    const kH = buildBandPass(1900 / fs, 2100 / fs, M, false);\n\n    const bufB = ac.createBuffer(1, M + 1, fs);\n    bufB.getChannelData(0).set(kB);\n    const bufH = ac.createBuffer(1, M + 1, fs);\n    bufH.getChannelData(0).set(kH);\n\n    const convB = ac.createConvolver();\n    convB.normalize = false;\n    convB.buffer = bufB;\n\n    const convH = ac.createConvolver();\n    convH.normalize = false;\n    convH.buffer = bufH;\n\n    const oscTarget = ac.createOscillator();\n    oscTarget.type = 'sine';\n    oscTarget.frequency.value = toneFreq;\n    const gainTarget = ac.createGain();\n    gainTarget.gain.value = 0.28;\n\n    const oscHum = ac.createOscillator();\n    oscHum.type = 'sine';\n    oscHum.frequency.value = 750;\n    const gainHum = ac.createGain();\n    gainHum.gain.value = 0.12;\n\n    const nBuf = ac.createBuffer(1, fs * 2, fs);\n    const nData = nBuf.getChannelData(0);\n    for (let i = 0; i < nData.length; i++) nData[i] = (Math.random() * 2 - 1) * 0.08;\n    const noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = nBuf;\n    noiseSrc.loop = true;\n\n    const mixBus = ac.createGain();\n    oscTarget.connect(gainTarget); gainTarget.connect(mixBus);\n    oscHum.connect(gainHum); gainHum.connect(mixBus);\n    noiseSrc.connect(mixBus);\n\n    const gainB = ac.createGain();\n    const gainH = ac.createGain();\n    const dryGain = ac.createGain();\n    const masterGain = ac.createGain();\n    masterGain.gain.value = 0;\n\n    mixBus.connect(convB); convB.connect(gainB); gainB.connect(masterGain);\n    mixBus.connect(convH); convH.connect(gainH); gainH.connect(masterGain);\n    mixBus.connect(dryGain); dryGain.connect(masterGain);\n    masterGain.connect(ac.destination);\n\n    oscTarget.start();\n    oscHum.start();\n    noiseSrc.start();\n\n    audioState.nodes = { oscTarget, gainB, gainH, dryGain, masterGain };\n  }\n\n  const n = audioState.nodes;\n  const t = ac.currentTime;\n  n.oscTarget.frequency.setTargetAtTime(toneFreq, t, 0.02);\n  n.masterGain.gain.setTargetAtTime(play ? 0.55 : 0.0, t, 0.03);\n  n.dryGain.gain.setTargetAtTime(filterOn ? 0.0 : 1.0, t, 0.02);\n  n.gainB.gain.setTargetAtTime(filterOn && useBlackman ? 1.0 : 0.0, t, 0.02);\n  n.gainH.gain.setTargetAtTime(filterOn && !useBlackman ? 1.0 : 0.0, t, 0.02);\n}\n\nfunction draw() {\n  syncAudio();\n\n  const toneFreq = lab.values.toneFreq;\n  const useBlackman = lab.values.useBlackman;\n  const filterOn = lab.values.filterOn;\n  const kernel = useBlackman ? visBlackman : visHamming;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const px = 56, py = 26, pw = 636, ph = 178;\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.fillRect(px, py, pw, ph);\n\n  const fMin = 500, fMax = 4000;\n  const dbMin = -120, dbMax = 10;\n  const fToX = f => px + ((f - fMin) / (fMax - fMin)) * pw;\n  const dbToY = db => py + ((dbMax - db) / (dbMax - dbMin)) * ph;\n\n  // Passband highlight (1960 - 2040 Hz)\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n  ctx.fillRect(fToX(1960), py, fToX(2040) - fToX(1960), ph);\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let db = 0; db >= -120; db -= 20) {\n    const y = dbToY(db);\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText(db + 'dB', px - 6, y + 3);\n  }\n  for (let f = 500; f <= 4000; f += 500) {\n    const x = fToX(f);\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(f + 'Hz', x, py + ph + 14);\n  }\n\n  // Plot dB response (801 pts @ 10 kHz)\n  ctx.strokeStyle = filterOn ? (useBlackman ? '#38bdf8' : '#f59e0b') : 'rgba(248, 250, 252, 0.3)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const steps = 280;\n  for (let i = 0; i <= steps; i++) {\n    const f = fMin + (i / steps) * (fMax - fMin);\n    const db = filterOn ? evalDb(kernel, f, 10000) : 0;\n    const x = fToX(f);\n    const y = dbToY(db);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Marker for current toneFreq\n  const curDb = filterOn ? evalDb(kernel, toneFreq, 10000) : 0;\n  const mx = fToX(toneFreq);\n  const my = dbToY(curDb);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(mx, py); ctx.lineTo(mx, py + ph); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(mx, my, 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('801点带通滤波器对数频响 (fs = 10 kHz, 通带 1960–2040 Hz)', px, py - 8);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('2kHz 通带', fToX(2000), py + 14);\n\n  lab.setReadout(\n    '窗函数: ' + (useBlackman ? 'Blackman (~ -100dB 阻带)' : 'Hamming (~ -53dB 阻带)') +\n    ' | 当前测试音: ' + toneFreq + ' Hz' +\n    ' | 滤波器增益: ' + curDb.toFixed(1) + ' dB' +\n    ' | 音频状态: ' + (lab.values.play ? (filterOn ? '正在播放滤波后信号' : '正在播放原始混音(含750Hz干扰与白噪)') : '已静音')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "核长度必须选奇数（即 M 必须为偶数）：无论做时域对齐还是做频谱反转，滤波器核都必须存在唯一的正中心点 M/2，否则无法执行“中心点加 1”的操作。",
        "低通+频谱反转 = 万能滤波器构造器：掌握“频谱反转（高通/带阻互转）”与“核相加（并联频带）”后，所有高通、带阻、带通滤波器都能由现成的低通核无损拼装而成。",
        "窗函数决定阻带天花板，M 决定过渡带宽度：如果像电话信令或微弱信号提取那样需要极深的噪声抑制（-100 dB），请果断换用 Blackman 窗而非 Hamming 窗，同时按 M ≈ 4 / BW 补足点数。",
        "数字频率记得除以采样率：公式里的截止频率 fc 和过渡带宽 BW 都是归一化到 0 ~ 0.5 之间的数字频率，工程上务必先用模拟频率除以采样率 fs 再代入代码。"
      ]
    }
  ]
});
