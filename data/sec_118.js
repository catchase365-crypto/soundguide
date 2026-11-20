window.__BOOK_REGISTER_SECTION__("sec_118", {
  "title": "啁啾信号与雷达脉冲压缩 (Chirp Signals)",
  "intuition": "在频域保持幅度恒为 1、只把相位拧成抛物线，就能把瞬时高能冲激“拉长”成频率渐变的啁啾声安全发射，接收后再用反相系统“压回”尖锐脉冲，一举打破探测距离与分辨率不可兼得的物理魔咒。",
  "blocks": [
    {
      "type": "concept",
      "heading": "频域相位抛物线：把瞬间冲激“拉长”成鸟鸣声",
      "paragraphs": [
        "在雷达、声呐等回波定位系统中，**啁啾信号（Chirp Signal）** 是一种极其巧妙的波形整形工具。从频域视角来看，一个啁啾系统的频率响应具有极其简洁的构造：它在所有频率上的**幅度响应恒等于 1**（既不放大也不衰减任何频率成分），而**相位响应是一条抛物线**。",
        "由于相位是频率的二次函数，不同频率成分经历的群延迟（斜率）各不相同：低频分量先到达，高频分量后到达（或者相反）。于是，当一个原本在时域上只有单个采样点的尖锐冲激 $\\delta[n]$ 输入该系统后，输出就会变成一段**频率随时间连续扫描的振荡波包**。如果把这段信号接上扬声器播放，听起来就像小鸟清脆的叫声（Chirp），啁啾信号因此得名。",
        "在离散傅里叶变换（实 DFT）中直接手工操纵相位时，必须牢记一条硬性铁律：**直流频率 $0$ 和奈奎斯特频率 $0.5$（即 $k = N/2$）的相位都必须是 $0$ 或 $2\\pi$ 的整数倍**。因为这两个频率在实 DFT 中没有正弦虚部，只有确保边界相位满足 $2\\pi$ 整数倍条件，合成出的时域波形才不会出现畸变。"
      ],
      "formula": {
        "expr": "Phase X[k] = αk + βk²   (k = 0, 1, ..., N/2)",
        "explain": "α（线性斜率）决定冲激响应在时间轴上的整体左右平移量；β（抛物线曲率）决定扫频的快慢与波形展宽程度，β 的正负号决定是从低频扫向高频还是从高频扫向低频。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：频域相位造物主——实时合成与试听 Chirp 鸟鸣",
      "instruction": "拖动 α 观察波形整体平移，拖动 β 观察冲激如何展开成扫频波包（β=0 时坍缩回纯冲激），并点击播放按钮聆听不同 β 对应的鸟鸣扫频方向。",
      "controls": [
        {
          "type": "slider",
          "id": "alpha",
          "label": "线性斜率 α (控制平移)",
          "min": -3,
          "max": 0,
          "step": 0.1,
          "value": -0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "beta",
          "label": "抛物线曲率 β (控制展宽/扫频)",
          "min": -0.04,
          "max": 0.04,
          "step": 0.002,
          "value": -0.03,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "snap2pi",
          "label": "强制 Nyquist 相位为 2π 整数倍",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 Chirp 鸟鸣声",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 128;\nconst halfN = N / 2;\n\nlet audioSource = null;\nlet audioGain = null;\nlet lastAudioKey = '';\n\nfunction computeParams() {\n  const alpha = lab.values.alpha;\n  let beta = lab.values.beta;\n  const rawNyq = alpha * halfN + beta * halfN * halfN;\n  if (lab.values.snap2pi) {\n    const m = Math.round(rawNyq / (2 * Math.PI));\n    const targetNyq = m * 2 * Math.PI;\n    beta = (targetNyq - alpha * halfN) / (halfN * halfN);\n  }\n  const nyqPhase = alpha * halfN + beta * halfN * halfN;\n  return { alpha, beta, nyqPhase };\n}\n\nfunction synthesizeChirp(alpha, beta) {\n  const phases = new Array(halfN + 1);\n  for (let k = 0; k <= halfN; k++) {\n    phases[k] = alpha * k + beta * k * k;\n  }\n  const x = new Array(N).fill(0);\n  for (let n = 0; n < N; n++) {\n    let sum = Math.cos(phases[0]);\n    for (let k = 1; k < halfN; k++) {\n      sum += 2 * Math.cos((2 * Math.PI * k * n) / N + phases[k]);\n    }\n    sum += Math.cos(Math.PI * n + phases[halfN]);\n    x[n] = sum / N;\n  }\n  return { x, phases };\n}\n\nfunction stopAudio() {\n  if (audioSource) {\n    try { audioSource.stop(); } catch (e) {}\n    try { audioSource.disconnect(); } catch (e) {}\n    audioSource = null;\n  }\n  if (audioGain) {\n    try { audioGain.disconnect(); } catch (e) {}\n    audioGain = null;\n  }\n}\n\nfunction updateAudio(beta) {\n  if (!lab.values.play) {\n    stopAudio();\n    lastAudioKey = '';\n    return;\n  }\n  const key = beta.toFixed(4);\n  if (audioSource && key === lastAudioKey) return;\n  lastAudioKey = key;\n  stopAudio();\n\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n\n  const sr = ac.sampleRate;\n  const chirpDur = 0.35;\n  const totalDur = 0.75;\n  const len = Math.floor(sr * totalDur);\n  const chirpSamples = Math.floor(sr * chirpDur);\n  const buf = ac.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n\n  const mag = Math.min(1, Math.abs(beta) / 0.04);\n  const fLow = 450;\n  const fHigh = 450 + mag * 2400;\n  const f0 = beta <= 0 ? fLow : fHigh;\n  const f1 = beta <= 0 ? fHigh : fLow;\n  const activeSamples = Math.max(Math.floor(sr * 0.025), Math.floor(chirpSamples * (0.15 + 0.85 * mag)));\n\n  let phase = 0;\n  for (let i = 0; i < activeSamples; i++) {\n    const tNorm = i / activeSamples;\n    const freq = f0 + (f1 - f0) * tNorm;\n    phase += (2 * Math.PI * freq) / sr;\n    const env = Math.sin(Math.PI * tNorm);\n    data[i] = 0.28 * env * Math.sin(phase);\n  }\n\n  audioSource = ac.createBufferSource();\n  audioSource.buffer = buf;\n  audioSource.loop = true;\n  audioGain = ac.createGain();\n  audioGain.gain.value = 0.85;\n  audioSource.connect(audioGain);\n  audioGain.connect(ac.destination);\n  audioSource.start();\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const { alpha, beta, nyqPhase } = computeParams();\n  const { x, phases } = synthesizeChirp(alpha, beta);\n\n  const padL = 44, padR = 16, padT = 26, padB = 26;\n  const gap = 38;\n  const leftW = 236;\n  const rightX = padL + leftW + gap;\n  const rightW = W - rightX - padR;\n  const plotH = H - padT - padB;\n\n  function drawPanel(px, py, pw, ph, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let i = 0; i <= 4; i++) {\n      const yy = py + (ph * i) / 4;\n      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n      const xx = px + (pw * i) / 4;\n      ctx.beginPath(); ctx.moveTo(xx, py); ctx.lineTo(xx, py + ph); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.strokeRect(px, py, pw, ph);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(title, px, py - 8);\n  }\n\n  drawPanel(padL, padT, leftW, plotH, '频域相位谱 Phase[k] = αk + βk²');\n  let minP = 0, maxP = 0;\n  for (let k = 0; k <= halfN; k++) {\n    if (phases[k] < minP) minP = phases[k];\n    if (phases[k] > maxP) maxP = phases[k];\n  }\n  const spanP = Math.max(20, maxP - minP);\n  const pTop = maxP + spanP * 0.1;\n  const pBot = minP - spanP * 0.1;\n\n  const zeroPY = padT + ((pTop - 0) / (pTop - pBot)) * plotH;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, zeroPY); ctx.lineTo(padL + leftW, zeroPY); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let k = 0; k <= halfN; k++) {\n    const px = padL + (k / halfN) * leftW;\n    const py = padT + ((pTop - phases[k]) / (pTop - pBot)) * plotH;\n    if (k === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const nyqX = padL + leftW;\n  const nyqY = padT + ((pTop - nyqPhase) / (pTop - pBot)) * plotH;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(nyqX, nyqY, 4, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText(pTop.toFixed(0), padL - 5, padT + 8);\n  ctx.fillText(pBot.toFixed(0), padL - 5, padT + plotH);\n  ctx.textAlign = 'center';\n  ctx.fillText('0', padL, padT + plotH + 14);\n  ctx.fillText('0.5 (N/2)', padL + leftW - 14, padT + plotH + 14);\n\n  drawPanel(rightX, padT, rightW, plotH, '时域冲激响应 h[n] (N=' + N + ')');\n  let maxAbs = 0.01;\n  for (let n = 0; n < N; n++) {\n    if (Math.abs(x[n]) > maxAbs) maxAbs = Math.abs(x[n]);\n  }\n  const yScale = Math.max(0.35, maxAbs * 1.15);\n  const zeroTY = padT + plotH / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(rightX, zeroTY); ctx.lineTo(rightX + rightW, zeroTY); ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const tx = rightX + (n / (N - 1)) * rightW;\n    const ty = zeroTY - (x[n] / yScale) * (plotH * 0.46);\n    if (n === 0) ctx.moveTo(tx, ty);\n    else ctx.lineTo(tx, ty);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  for (let n = 0; n < N; n += 2) {\n    const tx = rightX + (n / (N - 1)) * rightW;\n    const ty = zeroTY - (x[n] / yScale) * (plotH * 0.46);\n    ctx.fillRect(tx - 1, ty - 1, 2.2, 2.2);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText('+' + yScale.toFixed(2), rightX - 4, padT + 8);\n  ctx.fillText('-' + yScale.toFixed(2), rightX - 4, padT + plotH);\n  ctx.textAlign = 'center';\n  ctx.fillText('n=0', rightX + 10, padT + plotH + 14);\n  ctx.fillText('n=64', rightX + rightW / 2, padT + plotH + 14);\n  ctx.fillText('n=127', rightX + rightW - 14, padT + plotH + 14);\n\n  const mod2pi = (((nyqPhase / (2 * Math.PI)) % 1) + 1) % 1;\n  const phaseErr = Math.min(mod2pi, 1 - mod2pi) * 2 * Math.PI;\n  const dirLabel = Math.abs(beta) < 0.001 ? '纯冲激 (无扫频)' : (beta < 0 ? '低频→高频 (上扫频)' : '高频→低频 (下扫频)');\n  lab.setReadout('α=' + alpha.toFixed(2) + ' | 有效β=' + beta.toFixed(4) + ' | ' + dirLabel + ' | 峰值=' + maxAbs.toFixed(3) + ' | Nyquist相位误差=' + phaseErr.toFixed(2) + ' rad');\n  updateAudio(beta);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "完全可逆的“反啁啾系统” (Antichirp System)",
      "paragraphs": [
        "啁啾系统最神奇的性质在于它**完全可逆（Completely Reversible）**。因为它的频率响应幅度恒等于 $1$，没有任何频率信息丢失，仅仅是相位被扭曲了。只要把输出后的啁啾信号送入一个**反啁啾系统（Antichirp System）**，就能将分散在时间轴上的能量重新聚拢，严丝合缝地还原回一个尖锐的冲激。",
        "反啁啾系统的频域构造极其直观：它的幅度同样恒为 $1$，而相位恰好是原啁啾系统的**相反数**。相位相加为零，群延迟的扭曲瞬间被抵消。",
        "回到时域来看，根据傅里叶变换的共轭对称与时间反转性质，把频域相位取负号，等价于将时域冲激响应做一次**左右镜像翻转（Left-for-right flip）**。如果原啁啾是从低频扫向高频，那么反啁啾滤波器的冲激响应就是从高频扫向低频；两者做卷积，恰好等价于脉冲匹配滤波的自相关峰值输出。"
      ],
      "formula": {
        "expr": "Phase_anti[k] = -Phase_chirp[k] = -(αk + βk²)   ⟺   h_anti[n] = h_chirp[-n]",
        "explain": "频域相位取反与时域左右翻转完全等价；级联 Chirp 与 Antichirp 后总相位处处为 0（幅度为 1），信号恢复为理想冲激。"
      }
    },
    {
      "type": "concept",
      "heading": "雷达的终极悖论：如何既打得远、又看得清？",
      "paragraphs": [
        "理解了正反啁啾的可逆性，就能看懂现代雷达和声呐的核心绝技——**脉冲压缩（Pulse Compression）**。雷达通过测量发射脉冲与目标回波之间的时间差来测距，这就对发射脉冲提出了两个看似**水火不容**的苛刻要求：",
        "**要求一（高分辨率 → 脉冲必须极短）**：无线电波以光速传播，一个 $1\\,\\mu\\text{s}$ 的脉冲在空中就有约 $300\\text{ 米}$ 长，这意味着雷达的距离分辨率极限也就是约 $300\\text{ 米}$。想要分辨两架紧挨着的飞机，脉冲必须越短越好。",
        "**要求二（远距离探测 → 脉冲必须高能量）**：想探测几百公里外的目标，发射脉冲必须携带足够高的总能量。然而，电功率等于能量除以脉冲持续时间（$\\text{Power} = \\text{Energy} / \\text{Pulse Length}$）。又想要高能量，又想要极短的脉冲，会导致**瞬间峰值功率呈指数级飙升**，发射机末端功放管会当场烧毁！",
        "啁啾信号优雅地打破了这一硬件枷锁：**先拉长，安全发射；再压缩，精准测距**。在送入发射机末级功放前，先把高能窄冲激通过 Chirp 系统“拉长”成低峰值功率的长时啁啾脉冲向外发射；当微弱的啁啾回波返回接收机后，再让它通过 Antichirp 系统重新“压”回尖锐的窄脉冲。于是，**功率器件看到的是温和的长脉冲，而测距计时电路看到的是锋利的短脉冲**！"
      ],
      "formula": {
        "expr": "Peak Power = Energy / Pulse Length",
        "explain": "依据能量守恒（帕塞瓦尔定理），Chirp 展宽前后的脉冲总能量 Energy 完全相同，但持续时间 Pulse Length 被拉长了数十倍，因此发射机的瞬时峰值功率 Peak Power 成倍骤降。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：雷达脉冲压缩实战——化解功放烧毁危机",
      "instruction": "先把能量 E 调高并把展宽强度 |β| 降为 0，观察左侧发射机瞬间过载报警；随后调大 |β| 观察峰值功率如何骤降至安全区，再切换右侧 Antichirp 开关对比目标测距分辨率。",
      "controls": [
        {
          "type": "slider",
          "id": "energy",
          "label": "脉冲总能量 E",
          "min": 1,
          "max": 10,
          "step": 0.5,
          "value": 6,
          "unit": " J"
        },
        {
          "type": "slider",
          "id": "dispersion",
          "label": "Chirp 展宽强度 |β|",
          "min": 0,
          "max": 40,
          "step": 1,
          "value": 28,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "targetDist",
          "label": "目标真实距离 (回波延迟)",
          "min": 25,
          "max": 140,
          "step": 1,
          "value": 75,
          "unit": " km"
        },
        {
          "type": "toggle",
          "id": "showAnti",
          "label": "接收端开启 Antichirp 反啁啾压缩",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 256;\nconst halfN = N / 2;\nconst pLimit = 2.0;\n\nfunction idftFromPhase(phases, amp) {\n  const out = new Array(N).fill(0);\n  for (let n = 0; n < N; n++) {\n    let sum = Math.cos(phases[0]);\n    for (let k = 1; k < halfN; k++) {\n      sum += 2 * Math.cos((2 * Math.PI * k * n) / N + phases[k]);\n    }\n    sum += Math.cos(Math.PI * n + phases[halfN]);\n    out[n] = (amp * sum) / N;\n  }\n  return out;\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const energy = lab.values.energy;\n  const disp = lab.values.dispersion;\n  const rxPos = Math.round(lab.values.targetDist);\n  const showAnti = lab.values.showAnti;\n  const amp = Math.sqrt(energy);\n\n  const txPos = 20;\n  const alphaTx = -(2 * Math.PI * txPos) / N;\n  let beta = 0;\n  if (disp > 0) {\n    const rawBeta = -(disp / 40) * 0.009;\n    const rawNyq = alphaTx * halfN + rawBeta * halfN * halfN;\n    const m = Math.round(rawNyq / (2 * Math.PI));\n    beta = (m * 2 * Math.PI - alphaTx * halfN) / (halfN * halfN);\n  }\n\n  const phiTx = new Array(halfN + 1);\n  const phiRx = new Array(halfN + 1);\n  for (let k = 0; k <= halfN; k++) {\n    phiTx[k] = alphaTx * k + beta * k * k;\n    const rxLinear = -(2 * Math.PI * rxPos * k) / N;\n    phiRx[k] = showAnti ? rxLinear : (rxLinear + beta * k * k);\n  }\n\n  const txWave = idftFromPhase(phiTx, amp);\n  const rxWave = idftFromPhase(phiRx, amp);\n\n  let peakPower = 0;\n  let totalE = 0;\n  for (let n = 0; n < N; n++) {\n    const p = txWave[n] * txWave[n];\n    totalE += p;\n    if (p > peakPower) peakPower = p;\n  }\n\n  const padL = 42, padR = 16, padT = 28, padB = 26;\n  const gap = 36;\n  const leftW = 300;\n  const rightX = padL + leftW + gap;\n  const rightW = W - rightX - padR;\n  const plotH = H - padT - padB;\n\n  function drawBox(px, py, pw, ph, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let i = 0; i <= 4; i++) {\n      const yy = py + (ph * i) / 4;\n      ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n      const xx = px + (pw * i) / 4;\n      ctx.beginPath(); ctx.moveTo(xx, py); ctx.lineTo(xx, py + ph); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.strokeRect(px, py, pw, ph);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText(title, px, py - 8);\n  }\n\n  // Left panel: Transmitter instantaneous power\n  drawBox(padL, padT, leftW, plotH, '发射机末级瞬时功率 x²[n] (总能量 E=' + totalE.toFixed(1) + ')');\n  const maxPScale = 10.5;\n  const limitY = padT + (1 - pLimit / maxPScale) * plotH;\n\n  // Safe/danger shading above limit\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';\n  ctx.fillRect(padL, padT, leftW, limitY - padT);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, limitY); ctx.lineTo(padL + leftW, limitY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('功放烧毁上限 P=2.0', padL + leftW - 6, limitY - 5);\n\n  const overloaded = peakPower > pLimit;\n  ctx.strokeStyle = overloaded ? '#ec4899' : '#10b981';\n  ctx.fillStyle = overloaded ? 'rgba(236, 72, 153, 0.35)' : 'rgba(16, 185, 129, 0.35)';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  ctx.moveTo(padL, padT + plotH);\n  const showN = 160;\n  for (let n = 0; n < showN; n++) {\n    const xPos = padL + (n / (showN - 1)) * leftW;\n    const pVal = Math.min(maxPScale, txWave[n] * txWave[n]);\n    const yPos = padT + (1 - pVal / maxPScale) * plotH;\n    ctx.lineTo(xPos, yPos);\n  }\n  ctx.lineTo(padL + leftW, padT + plotH);\n  ctx.closePath();\n  ctx.fill();\n  ctx.stroke();\n\n  ctx.fillStyle = overloaded ? '#ec4899' : '#10b981';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(overloaded ? '⚠ 峰值功率过载 (' + peakPower.toFixed(2) + ')' : '✓ 功放安全 (' + peakPower.toFixed(2) + ')', padL + 8, padT + 16);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText('10', padL - 4, padT + 8);\n  ctx.fillText('0', padL - 4, padT + plotH);\n  ctx.textAlign = 'center';\n  ctx.fillText('时间采样 n (0..160)', padL + leftW / 2, padT + plotH + 14);\n\n  // Right panel: Receiver distance profile\n  drawBox(rightX, padT, rightW, plotH, showAnti ? '接收端 (Antichirp 压缩后回波)' : '接收端 (未压缩 Chirp 散射回波)');\n  const targetX = rightX + (rxPos / (N - 1)) * rightW;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.4;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(targetX, padT); ctx.lineTo(targetX, padT + plotH); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('目标 ' + rxPos + 'km', Math.max(rightX + 32, Math.min(rightX + rightW - 32, targetX)), padT + 13);\n\n  const ampScale = Math.sqrt(10) * 1.08;\n  const zeroRY = padT + plotH / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(rightX, zeroRY); ctx.lineTo(rightX + rightW, zeroRY); ctx.stroke();\n\n  ctx.strokeStyle = showAnti ? '#38bdf8' : '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xPos = rightX + (n / (N - 1)) * rightW;\n    const yPos = zeroRY - (rxWave[n] / ampScale) * (plotH * 0.45);\n    if (n === 0) ctx.moveTo(xPos, yPos);\n    else ctx.lineTo(xPos, yPos);\n  }\n  ctx.stroke();\n\n  let rxPeak = 0;\n  for (let n = 0; n < N; n++) {\n    if (Math.abs(rxWave[n]) > rxPeak) rxPeak = Math.abs(rxWave[n]);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('0 km', rightX + 12, padT + plotH + 14);\n  ctx.fillText('128 km', rightX + rightW / 2, padT + plotH + 14);\n  ctx.fillText('255 km', rightX + rightW - 18, padT + plotH + 14);\n\n  const ratio = energy / Math.max(0.01, peakPower);\n  lab.setReadout('总能量=' + energy.toFixed(1) + 'J | 发射峰值功率=' + peakPower.toFixed(2) + ' (压降 ' + ratio.toFixed(1) + 'x) | 接收脉冲峰值=' + rxPeak.toFixed(2) + (showAnti ? ' [精准定位]' : ' [能量弥散难测距]'));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑铁律：在实 DFT 频域直接设计非线性相位时，务必检查 k=0（直流）和 k=N/2（奈奎斯特）处的相位是否为 0 或 2π 的整数倍，否则反变换会产生严重边界失真。",
        "幅度恒定保能量，相位弯曲控时间：Chirp 系统在频域维持幅度恒为 1，意味着它不损失任何信号能量，只利用相位抛物线 βk² 重新分配各频率到达的时间。",
        "反啁啾 = 频域取负相位 = 时域左右翻转：Antichirp 系统只需把 Chirp 的脉冲响应左右镜像反转，就能与发射波形完美匹配并将能量重新聚拢成单点冲激。",
        "雷达/声呐脉冲压缩的本质：通过“发射前展宽降低峰值功率、接收后压缩恢复空间分辨率”，成功把“探测距离（取决于总能量）”与“距离分辨率（取决于压缩后脉宽）”彻底解耦。"
      ]
    }
  ]
});
