window.__BOOK_REGISTER_SECTION__("sec_029", {
  "title": "均值与标准差：信号的直流偏置与交流波动 (Mean and Standard Deviation)",
  "intuition": "均值（μ）锚定了信号的直流中心位置，标准差（σ）度量了信号围绕中心波动的交流强度，而递推统计公式让我们只用三个累加变量就能实时追踪任意长度信号的统计特征。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 均值（Mean）与直流分量：从 0 到 N-1 的信号中心",
      "paragraphs": [
        "在数字信号处理（DSP）中，信号由一串按顺序排列的采样点组成，每个点分配一个**采样序号（sample number / index）**。与数学家习惯用 `1` 到 `N` 不同，DSP 工程师和编程语言（如 C、Python、以及本书中的 BASIC 伪代码）普遍采用从 `0` 到 `N-1` 的索引方式（例如 512 个点编号为 `0` 到 `511`）。千万不要小看这 1 个索引的差异，在实际工程中它极易引发越界或对齐 Bug。",
        "**均值（μ）**就是信号所有采样值的算术平均。从电子学视角来看，均值被称为信号的**直流分量（DC, Direct Current）**——它代表信号整体的静态基准水位；而信号围绕该均值上下起伏的部分，则被称为**交流分量（AC, Alternating Current）**。"
      ],
      "formula": {
        "expr": "μ = (1 / N) · Σ_{i=0}^{N-1} x_i",
        "explain": "x_i 表示第 i 个采样点的值，i 从 0 遍历到 N-1；N 为信号的总采样点数；μ 为计算得到的均值（直流分量）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 标准差（σ）、方差与均方根（RMS）：为什么必须先平方？",
      "paragraphs": [
        "对于正弦波或方波等规则周期信号，可以用**峰峰值（Vpp）**描述其波动幅度；但对于真实采集的随机噪声信号，峰值并不稳定，我们需要更通用的波动指标。一个直觉想法是计算**平均偏差（Average Deviation）**，即先对每个点与均值的差取绝对值 `|x_i - μ|` 再求平均（否则正负偏差会相互抵消为零）。但统计学与 DSP 几乎不用平均偏差，因为它不符合信号的物理规律：**当电路中的多路随机噪声叠加时，叠加的是各自的功率（Power），而不是幅度**，而功率正比于电压的平方。",
        "因此，**标准差（σ）**采用“先平方求平均、再开方”的思路，其平方 **σ² 被称为方差（Variance）**，物理上直接对应交流波动的平均功率。注意公式中分母使用的是 `N - 1` 而不是 `N`（称为无偏估计修正，原书下一节将深入探讨）。此外，工程中常用的**均方根值（rms, root-mean-square）**同时包含直流和交流能量，而标准差只衡量交流部分；只有当信号不含直流分量（`μ = 0`）时，rms 才与标准差相等。",
        "对于常见波形，峰峰值 `Vpp` 与标准差 `σ` 存在固定的比例关系：**方波**为 `Vpp = 2σ`；**三角波**为 `Vpp = √12 · σ ≈ 3.46σ`；**正弦波**为 `Vpp = 2√2 · σ ≈ 2.83σ`；而**随机噪声**没有绝对固定的峰值，其峰峰值通常约为标准差的 `6` 到 `8` 倍。"
      ],
      "formula": {
        "expr": "σ² = [ 1 / (N - 1) ] · Σ_{i=0}^{N-1} (x_i - μ)²",
        "explain": "σ² 为方差（交流波动功率），σ = √(σ²) 为标准差；x_i - μ 为第 i 个采样点偏离均值的瞬时交流分量；分母 N-1 用于样本方差无偏估计。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：直流均值 μ、交流标准差 σ 与波形峰峰值探秘（支持发声）",
      "instruction": "拖动波形选择、直流均值 μ 与标准差 σ 滑块，观察相同标准差（相同交流功率）下不同波形的峰峰值差异，并点击播放按钮聆听“直流平移不改变声音响度，标准差决定声音能量”的物理听感。",
      "controls": [
        {
          "type": "slider",
          "id": "waveType",
          "label": "波形 (0方/1三角/2正弦/3噪声)",
          "min": 0,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "mean",
          "label": "直流均值 μ (DC)",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sigma",
          "label": "标准差 σ (AC强度)",
          "min": 0.1,
          "max": 1.4,
          "step": 0.05,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRms",
          "label": "显示 RMS 与 Vpp 标尺",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听交流波动声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet audioCtx = null, masterGain = null, osc = null, noiseSrc = null, currentWave = -1;\n\nconst N = 256;\nconst noiseBuf = new Float32Array(N);\nlet seed = 1337;\nfunction rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }\nfor (let i = 0; i < N; i += 2) {\n  const u1 = Math.max(1e-6, rand()), u2 = rand();\n  const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);\n  const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);\n  noiseBuf[i] = z0;\n  if (i + 1 < N) noiseBuf[i + 1] = z1;\n}\n// Normalize static visual noise to exact zero mean and unit SD\nlet nm = 0, nv = 0;\nfor (let i = 0; i < N; i++) nm += noiseBuf[i]; nm /= N;\nfor (let i = 0; i < N; i++) { noiseBuf[i] -= nm; nv += noiseBuf[i] * noiseBuf[i]; }\nconst nsd = Math.sqrt(nv / (N - 1));\nfor (let i = 0; i < N; i++) noiseBuf[i] /= nsd;\n\nfunction stopAudio() {\n  if (osc) { try { osc.stop(); osc.disconnect(); } catch(e) {} osc = null; }\n  if (noiseSrc) { try { noiseSrc.stop(); noiseSrc.disconnect(); } catch(e) {} noiseSrc = null; }\n  if (masterGain) { try { masterGain.disconnect(); } catch(e) {} masterGain = null; }\n  currentWave = -1;\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) { stopAudio(); return; }\n  if (!audioCtx) audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  const wt = Math.round(lab.values.waveType);\n  const sd = lab.values.sigma;\n  if (!masterGain) {\n    masterGain = audioCtx.createGain();\n    masterGain.connect(audioCtx.destination);\n  }\n  masterGain.gain.setTargetAtTime(sd * 0.12, audioCtx.currentTime, 0.02);\n  if (wt !== currentWave) {\n    if (osc) { try { osc.stop(); osc.disconnect(); } catch(e) {} osc = null; }\n    if (noiseSrc) { try { noiseSrc.stop(); noiseSrc.disconnect(); } catch(e) {} noiseSrc = null; }\n    currentWave = wt;\n    if (wt === 3) {\n      const len = audioCtx.sampleRate * 2;\n      const buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);\n      const ch = buf.getChannelData(0);\n      for (let i = 0; i < len; i++) {\n        ch[i] = ((Math.random() + Math.random() + Math.random()) - 1.5) * 2;\n      }\n      noiseSrc = audioCtx.createBufferSource();\n      noiseSrc.buffer = buf;\n      noiseSrc.loop = true;\n      noiseSrc.connect(masterGain);\n      noiseSrc.start();\n    } else {\n      osc = audioCtx.createOscillator();\n      osc.type = wt === 0 ? 'square' : (wt === 1 ? 'triangle' : 'sine');\n      osc.frequency.setValueAtTime(220, audioCtx.currentTime);\n      const norm = audioCtx.createGain();\n      norm.gain.value = wt === 0 ? 1.0 : (wt === 1 ? 1.732 : 1.414);\n      osc.connect(norm);\n      norm.connect(masterGain);\n      osc.start();\n    }\n  }\n}\n\nfunction draw() {\n  updateAudio();\n  const wt = Math.round(lab.values.waveType);\n  const mu = lab.values.mean;\n  const sd = lab.values.sigma;\n  const showRms = lab.values.showRms;\n  const names = ['方波 (Square)', '三角波 (Triangle)', '正弦波 (Sine)', '随机噪声 (Noise)'];\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 48, padR = 88, padT = 16, padB = 22;\n  const plotW = W - padL - padR, plotH = H - padT - padB;\n  const yMin = -4.5, yMax = 4.5;\n  const toY = v => padT + ((yMax - v) / (yMax - yMin)) * plotH;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  for (let v = -4; v <= 4; v += 2) {\n    const y = toY(v);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n    ctx.fillText(v.toFixed(0), padL - 8, y + 4);\n  }\n  for (let i = 0; i <= 4; i++) {\n    const x = padL + (i / 4) * plotW;\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n  }\n  // Zero line\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(padL, toY(0)); ctx.lineTo(padL + plotW, toY(0)); ctx.stroke();\n\n  // Sigma band [mu - sd, mu + sd]\n  const yTopSd = toY(mu + sd), yBotSd = toY(mu - sd);\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n  ctx.fillRect(padL, yTopSd, plotW, yBotSd - yTopSd);\n  ctx.strokeStyle = '#10b981';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(padL, yTopSd); ctx.lineTo(padL + plotW, yTopSd);\n  ctx.moveTo(padL, yBotSd); ctx.lineTo(padL + plotW, yBotSd);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Mean line\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([6, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, toY(mu)); ctx.lineTo(padL + plotW, toY(mu)); ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Waveform samples\n  let yPeakMax = -1e9, yPeakMin = 1e9;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const cycles = 4;\n  for (let i = 0; i < N; i++) {\n    const t = i / (N - 1);\n    const phase = (t * cycles) % 1;\n    let ac = 0;\n    if (wt === 0) ac = phase < 0.5 ? sd : -sd;\n    else if (wt === 1) ac = (phase < 0.5 ? (4 * phase - 1) : (3 - 4 * phase)) * Math.sqrt(3) * sd;\n    else if (wt === 2) ac = Math.sin(2 * Math.PI * phase) * Math.SQRT2 * sd;\n    else ac = noiseBuf[i] * sd;\n    const val = mu + ac;\n    if (val > yPeakMax) yPeakMax = val;\n    if (val < yPeakMin) yPeakMin = val;\n    const px = padL + t * plotW;\n    const py = toY(Math.max(yMin, Math.min(yMax, val)));\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const rms = Math.sqrt(mu * mu + sd * sd);\n  if (showRms) {\n    // RMS reference line (positive magnitude)\n    const rmsSigned = mu >= 0 ? rms : -rms;\n    const yRms = toY(Math.max(yMin, Math.min(yMax, rmsSigned)));\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(padL, yRms); ctx.lineTo(padL + plotW, yRms); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.textAlign = 'left';\n    ctx.fillText('RMS=' + rms.toFixed(2), padL + 6, yRms - 5);\n\n    // Vpp caliper on right margin\n    const cx = padL + plotW + 18;\n    const yMaxPx = toY(Math.max(yMin, Math.min(yMax, yPeakMax)));\n    const yMinPx = toY(Math.max(yMin, Math.min(yMax, yPeakMin)));\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(cx - 5, yMaxPx); ctx.lineTo(cx + 5, yMaxPx);\n    ctx.moveTo(cx, yMaxPx); ctx.lineTo(cx, yMinPx);\n    ctx.moveTo(cx - 5, yMinPx); ctx.lineTo(cx + 5, yMinPx);\n    ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'left';\n    const vpp = yPeakMax - yPeakMin;\n    ctx.fillText('Vpp', cx + 8, (yMaxPx + yMinPx) / 2 - 4);\n    ctx.fillText((vpp / sd).toFixed(2) + 'σ', cx + 8, (yMaxPx + yMinPx) / 2 + 10);\n  }\n\n  // Labels\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'left';\n  ctx.fillText('μ=' + mu.toFixed(2), padL + 6, toY(mu) - 5);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('μ±σ', padL + plotW - 34, yTopSd - 4);\n\n  const vppReal = yPeakMax - yPeakMin;\n  lab.setReadout(names[wt] + ' | 均值 μ=' + mu.toFixed(2) + ' | 标准差 σ=' + sd.toFixed(2) + ' | 方差 σ²=' + (sd*sd).toFixed(2) + ' | RMS=' + rms.toFixed(2) + ' | Vpp≈' + (vppReal/sd).toFixed(2) + 'σ');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 递推统计（Running Statistics）：避免精度灾难与全量重算",
      "paragraphs": [
        "先算均值再套用定义公式求方差（如原书表 2-1 程序）看似直观，但在工程中存在两大局限：第一，当**均值远大于标准差**（`μ >> σ`）时，`(x_i - μ)` 是在做两个非常接近的数相减，极易产生严重的浮点**舍入误差（round-off error）**；第二，在实时流式采集中，每新来一个采样点就想立刻更新统计量（即**递推统计，Running Statistics**），如果按定义式每次都要把所有历史样本重新遍历一遍，计算量和内存消耗都非常低效。",
        "通过对均值和方差公式进行代数变形，可以得到等价但更高效的**递推统计公式**（原书式 2-3 及表 2-2）。计算过程中只需维护三个运行累加量：**已处理样本数 `N`**、**样本之和 `sum`**、以及**样本平方之和 `sum of squares`**。每采集到一个新样本，只需做三次极简单的累加更新，就能立即算出当前均值与标准差——这正是科学计算器上按下 `Σ` 键后能随时读取统计值的底层原理（注意当 `N = 1` 时需特判 `σ = 0` 以免除以 `N - 1 = 0`）。"
      ],
      "formula": {
        "expr": "σ² = [ 1 / (N - 1) ] · [ Σ_{i=0}^{N-1} x_i² - (Σ_{i=0}^{N-1} x_i)² / N ]",
        "explain": "第一项为“平方和”(sum of squares)，第二项为“总和的平方除以 N”(sum² / N)。只需维护 N、sum 和 sum of squares 三个参数即可实时递推。"
      }
    },
    {
      "type": "concept",
      "heading": "4. 信噪比（SNR）与变异系数（CV）：衡量数据质量的黄金标尺",
      "paragraphs": [
        "在许多测试与测量场景中，**均值 `μ` 代表我们真正想测量的有效信号**，而**标准差 `σ` 代表噪声和干扰的强度**。此时单独看标准差本身意义不大，必须将它与均值放在一起对比才有价值。",
        "由此引出两个核心工程指标：**信噪比（SNR, Signal-to-Noise Ratio）**定义为均值除以标准差；**变异系数（CV, Coefficient of Variation）**定义为标准差除以均值再乘以 `100%`（两者互为倒数关系）。例如，若某组测量数据的 `CV = 2%`，则对应的 `SNR = 50`。**数据质量越高，SNR 越大，CV 越小**。"
      ],
      "formula": {
        "expr": "SNR = μ / σ ,   CV = (σ / μ) × 100%",
        "explain": "μ 为有效信号的直流均值，σ 为叠加噪声的标准差；SNR 越大代表信号越纯净，CV 越小代表相对波动误差越低。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：递推统计（Eq. 2-3）实时采样与 SNR / CV 收敛观测",
      "instruction": "拖动“当前样本数 N”模拟数据流逐点到达的过程，观察由三个累加器（N、SUM、SUMSQUARES）实时算出的均值 μ 与标准差 σ 如何快速逼近真实信号，并调节真实均值与噪声观察 SNR 与 CV 的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "trueMean",
          "label": "真实信号均值 μ",
          "min": 0.2,
          "max": 4,
          "step": 0.1,
          "value": 2.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noiseSd",
          "label": "噪声标准差 σ",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "value": 0.45,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nSamples",
          "label": "当前已采集样本数 N",
          "min": 4,
          "max": 256,
          "step": 1,
          "value": 48,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showRunning",
          "label": "显示递推累加器面板 (Eq. 2-3)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst MAX_N = 256;\nconst baseNoise = new Float32Array(MAX_N);\nlet seed = 202505;\nfunction rand() { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; }\nfor (let i = 0; i < MAX_N; i += 2) {\n  const u1 = Math.max(1e-6, rand()), u2 = rand();\n  baseNoise[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);\n  if (i + 1 < MAX_N) baseNoise[i + 1] = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);\n}\n\nfunction draw() {\n  const tMean = lab.values.trueMean;\n  const tSd = lab.values.noiseSd;\n  const N = Math.round(lab.values.nSamples);\n  const showHud = lab.values.showRunning;\n\n  let sum = 0, sumSq = 0;\n  const samples = new Float32Array(MAX_N);\n  for (let i = 0; i < MAX_N; i++) {\n    samples[i] = tMean + tSd * baseNoise[i];\n    if (i < N) {\n      sum += samples[i];\n      sumSq += samples[i] * samples[i];\n    }\n  }\n  const estMean = sum / N;\n  const estVar = N > 1 ? Math.max(0, (sumSq - (sum * sum) / N) / (N - 1)) : 0;\n  const estSd = Math.sqrt(estVar);\n  const snr = estSd > 1e-6 ? estMean / estSd : 999;\n  const cv = Math.abs(estMean) > 1e-6 ? (estSd / Math.abs(estMean)) * 100 : 0;\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 44, padR = 20, padT = 16, padB = 24;\n  const plotW = W - padL - padR, plotH = H - padT - padB;\n  const yMin = -2.0, yMax = 6.0;\n  const toX = i => padL + (i / (MAX_N - 1)) * plotW;\n  const toY = v => padT + ((yMax - Math.max(yMin, Math.min(yMax, v))) / (yMax - yMin)) * plotH;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  for (let v = -2; v <= 6; v += 2) {\n    const y = toY(v);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n    ctx.fillText(v.toFixed(0), padL - 8, y + 4);\n  }\n  for (let i = 0; i <= 256; i += 64) {\n    const x = toX(Math.min(255, i));\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(i.toString(), x, padT + plotH + 14);\n    ctx.textAlign = 'right';\n  }\n\n  // Estimated +/- sigma band across [0, N-1]\n  const curX = toX(N - 1);\n  const yTop = toY(estMean + estSd), yBot = toY(estMean - estSd);\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n  ctx.fillRect(padL, yTop, curX - padL, yBot - yTop);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, toY(estMean)); ctx.lineTo(curX, toY(estMean)); ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Future unprocessed samples (dimmed)\n  if (N < MAX_N) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (let i = N - 1; i < MAX_N; i++) {\n      const px = toX(i), py = toY(samples[i]);\n      if (i === N - 1) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  // Processed samples [0 .. N-1]\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const px = toX(i), py = toY(samples[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Cursor line at N-1\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(curX, padT); ctx.lineTo(curX, padT + plotH); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(curX, toY(samples[N - 1]), 4, 0, Math.PI * 2); ctx.fill();\n\n  // Running accumulators HUD\n  if (showHud) {\n    const bx = W - 244, by = 22, bw = 216, bh = 86;\n    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n    ctx.lineWidth = 1;\n    ctx.fillRect(bx, by, bw, bh);\n    ctx.strokeRect(bx, by, bw, bh);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'left';\n    ctx.fillText('递推累加器 (Eq. 2-3)', bx + 10, by + 16);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('N          = ' + N, bx + 10, by + 34);\n    ctx.fillText('SUM        = ' + sum.toFixed(2), bx + 10, by + 50);\n    ctx.fillText('SUMSQUARES = ' + sumSq.toFixed(1), bx + 10, by + 66);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('SNR=' + snr.toFixed(2) + '  CV=' + cv.toFixed(1) + '%', bx + 10, by + 80);\n  }\n\n  lab.setReadout('样本数 N=' + N + ' | 估计均值 μ̂=' + estMean.toFixed(3) + ' (真值 ' + tMean.toFixed(2) + ') | 估计标准差 σ̂=' + estSd.toFixed(3) + ' (真值 ' + tSd.toFixed(2) + ') | SNR=' + snr.toFixed(2) + ' | CV=' + cv.toFixed(1) + '%');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "索引对齐避坑：DSP 领域统一使用从 `0` 到 `N-1` 的采样索引，和纯数学文献常用的 `1` 到 `N` 不同，写循环和搬运公式时务必盯紧下标边界。",
        "σ 与 RMS 别混淆：标准差 `σ` 只度量围绕均值的**交流（AC）波动**，而 `RMS` 同时度量交流与直流（DC）；只有当信号均值为零时两者才相等。",
        "物理叠加看功率：随机噪声叠加遵循能量/功率（正比于 `σ²`）相加，而不是振幅直接相加，这是统计学放弃平均偏差而选用标准差的根本物理原因。",
        "递推统计防零除：用 Eq. 2-3 实时更新 `N`、`SUM` 和 `SUMSQUARES` 时，虽然免去了全量重算且节省内存，但必须在 `N = 1` 时特判输出 `SD = 0`，防止分母 `N - 1` 为零导致程序崩溃。",
        "指标方向一句话：`SNR = μ / σ` 越高越好，`CV = (σ / μ) × 100%` 越低越好。"
      ]
    }
  ]
});
