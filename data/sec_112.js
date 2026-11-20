window.__BOOK_REGISTER_SECTION__("sec_112", {
  "title": "帕塞瓦尔定理：时域与频域的能量守恒 (Parseval's Relation)",
  "intuition": "时域和频域只是同一个信号的两种等价视角，因此无论你在时间轴上逐点算能量，还是在频率轴上把各正弦波的能量加起来，总能量永远严格相等。",
  "blocks": [
    {
      "type": "concept",
      "heading": "能量守恒：信号在不同坐标系下的同一张账单",
      "paragraphs": [
        "在物理学中，**能量总是与幅度的平方成正比**。例如，弹簧的弹性势能正比于位移的平方，电容器储存的能量正比于电压的平方。对于离散数字信号 `x[i]`，我们可以直接把每个采样点的平方累加起来，得到信号在时域的总能量。",
        "既然离散傅里叶变换（DFT）能够把时域信号无损地分解成一组正弦波，那么时域和频域就只是同一个物理实体的两种等价描述。**帕塞瓦尔定理（Parseval's relation）**指出：这两个域算出来的信号总能量必须完全一致。",
        "对于长度为 `N` 的实数信号，使用单边频谱（`k` 从 `0` 到 `N/2`）表达时，需要把 DFT 结果的首尾两个特殊频点 `X[0]` 和 `X[N/2]` 除以 `√2` 得到**修正频谱（modified frequency spectrum）**，然后再乘以修正系数 `2/N`。"
      ],
      "formula": {
        "expr": "Σ_{i=0}^{N-1} x[i]² = (2 / N) · Σ_{k=0}^{N/2} Mag X[k]²",
        "explain": "左边为时域 N 个采样点的能量总和；右边为频域 N/2 + 1 个正弦分量的能量总和。其中 x[i] 是时域信号，N 是信号长度，X[k] 是修正后的单边频谱（原始 DFT 的 k=0 与 k=N/2 分量已预先除以 √2），Mag X[k] 表示第 k 个频点的幅度。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：实时调节各频点分量，验证时域与频域能量严格守恒",
      "instruction": "拖动直流、基波、三次谐波或奈奎斯特分量滑块，观察左图时域波形与右图频域能量柱如何同步变化并保持总和严格相等；点击播放按钮可实时聆听各谐波合成后的能量响度变化。",
      "controls": [
        {
          "type": "slider",
          "id": "dc",
          "label": "直流分量 (k=0)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "f1",
          "label": "基波幅度 (k=1)",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "f3",
          "label": "三次谐波 (k=3)",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nyq",
          "label": "奈奎斯特 (k=N/2)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音对比能量",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 16;\n\nlet audioCtx = null;\nlet osc1 = null, osc3 = null, oscN = null;\nlet gain1 = null, gain3 = null, gainN = null, masterGain = null;\n\nfunction updateAudio(f1, f3, nyq, isPlaying) {\n  if (!isPlaying) {\n    if (masterGain && audioCtx) {\n      masterGain.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n    }\n    return;\n  }\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    masterGain = audioCtx.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(audioCtx.destination);\n    osc1 = audioCtx.createOscillator();\n    osc3 = audioCtx.createOscillator();\n    oscN = audioCtx.createOscillator();\n    osc1.frequency.value = 220;\n    osc3.frequency.value = 660;\n    oscN.frequency.value = 1760;\n    gain1 = audioCtx.createGain();\n    gain3 = audioCtx.createGain();\n    gainN = audioCtx.createGain();\n    osc1.connect(gain1); gain1.connect(masterGain);\n    osc3.connect(gain3); gain3.connect(masterGain);\n    oscN.connect(gainN); gainN.connect(masterGain);\n    osc1.start();\n    osc3.start();\n    oscN.start();\n  }\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  const t = audioCtx.currentTime;\n  gain1.gain.setTargetAtTime(Math.abs(f1) * 0.12, t, 0.02);\n  gain3.gain.setTargetAtTime(Math.abs(f3) * 0.12, t, 0.02);\n  gainN.gain.setTargetAtTime(Math.abs(nyq) * 0.06, t, 0.02);\n  masterGain.gain.setTargetAtTime(0.8, t, 0.02);\n}\n\nfunction render() {\n  const dc = lab.values.dc;\n  const f1 = lab.values.f1;\n  const f3 = lab.values.f3;\n  const nyq = lab.values.nyq;\n  updateAudio(f1, f3, nyq, lab.values.play);\n\n  const x = new Array(N);\n  let eTime = 0;\n  let maxAbs = 0.5;\n  for (let i = 0; i < N; i++) {\n    const val = dc\n      + f1 * Math.cos((2 * Math.PI * 1 * i) / N)\n      + f3 * Math.cos((2 * Math.PI * 3 * i) / N + 0.6)\n      + nyq * (i % 2 === 0 ? 1 : -1);\n    x[i] = val;\n    eTime += val * val;\n    if (Math.abs(val) > maxAbs) maxAbs = Math.abs(val);\n  }\n\n  const K = N / 2 + 1;\n  const eBins = new Array(K);\n  let eFreq = 0;\n  for (let k = 0; k < K; k++) {\n    let re = 0, im = 0;\n    for (let i = 0; i < N; i++) {\n      const ang = (2 * Math.PI * k * i) / N;\n      re += x[i] * Math.cos(ang);\n      im -= x[i] * Math.sin(ang);\n    }\n    let magSq = re * re + im * im;\n    if (k === 0 || k === N / 2) {\n      magSq = magSq / 2;\n    }\n    const binEnergy = (2 / N) * magSq;\n    eBins[k] = binEnergy;\n    eFreq += binEnergy;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(355, 14);\n  ctx.lineTo(355, H - 14);\n  ctx.stroke();\n\n  const leftX = 20, leftW = 316, midY = 88;\n  const scaleY = Math.min(26, 52 / maxAbs);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let g = -2; g <= 2; g++) {\n    const gy = midY + g * 24;\n    ctx.beginPath();\n    ctx.moveTo(leftX, gy);\n    ctx.lineTo(leftX + leftW, gy);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域波形 x[i] 与各采样点能量 x[i]²', leftX, 18);\n\n  const stepX = leftW / N;\n  const maxSq = Math.max(2, maxAbs * maxAbs);\n  for (let i = 0; i < N; i++) {\n    const px = leftX + (i + 0.5) * stepX;\n    const py = midY - x[i] * scaleY;\n    const sqH = ((x[i] * x[i]) / maxSq) * 48;\n\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.45)';\n    ctx.fillRect(px - 6, 214 - sqH, 12, sqH);\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(px, py, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('底部琥珀柱 Σx[i]² = ' + eTime.toFixed(2), leftX, 232);\n\n  const rightX = 378, rightW = 322, baseY = 206;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域修正能量 (2/N)·|X[k]|²  (k = 0 .. N/2)', rightX, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let g = 0; g <= 3; g++) {\n    const gy = baseY - g * 48;\n    ctx.beginPath();\n    ctx.moveTo(rightX, gy);\n    ctx.lineTo(rightX + rightW, gy);\n    ctx.stroke();\n  }\n\n  const maxBin = Math.max(10, ...eBins);\n  const binStep = rightW / K;\n  for (let k = 0; k < K; k++) {\n    const bx = rightX + (k + 0.5) * binStep;\n    const bh = (eBins[k] / maxBin) * 144;\n    const isEdge = (k === 0 || k === N / 2);\n\n    ctx.fillStyle = isEdge ? '#ec4899' : '#10b981';\n    ctx.fillRect(bx - 11, baseY - bh, 22, bh);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('k=' + k, bx, baseY + 13);\n    if (eBins[k] > 0.05) {\n      ctx.fillStyle = isEdge ? '#f9a8d4' : '#6ee7b7';\n      ctx.fillText(eBins[k].toFixed(1), bx, baseY - bh - 5);\n    }\n  }\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('右侧频谱柱之和 = ' + eFreq.toFixed(2) + '（粉红为首尾 ÷√2 修正频点）', rightX, 232);\n\n  const diff = Math.abs(eTime - eFreq);\n  lab.setReadout('时域总能量 Σx[i]² = ' + eTime.toFixed(4) + '  |  频域总能量 (2/N)Σ|X[k]|² = ' + eFreq.toFixed(4) + '  |  能量差 = ' + diff.toExponential(2));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "揭秘公式细节：为什么首尾频点必须除以 √2？",
      "paragraphs": [
        "很多人第一次看到公式 10-3 都会疑惑：为什么系数是 `2/N`，而且偏偏要把 `k=0` 和 `k=N/2` 单独除以 `√2`？其实这背后藏着**峰值幅度（Peak）与均方根幅度（RMS）**的几何差异。",
        "第一步，把 DFT 频谱还原为重构时域所需的正弦波**峰值幅度**：根据反变换规律（Eq. 8-3），先把首尾两点（`k=0` 和 `k=N/2`）除以 `2`，再把所有点除以 `N/2`。这样，普通频点峰值幅度为 `2|X_DFT[k]|/N`，首尾两点峰值幅度为 `|X_DFT[k]|/N`。",
        "第二步，计算能量需要的是**均方根幅度（RMS）**而非峰值幅度。对于普通正弦波，它的瞬时值在波峰与波谷之间平滑起伏，均方根值为 `A_rms = A_peak / √2`。但首尾两个频点极其特殊：`k=0` 是恒定不变的直流常数，`k=N/2` 是在 `+A` 和 `-A` 之间交替跳变的方波式序列。**在这两种特殊情况下，每个采样点的平方都等于 `A_peak²`，因此它们的峰值幅度天然就等于均方根幅度（不需要再除以 √2）！**",
        "最后一步，把每个正弦波单点平均能量 `A_rms²` 平方累加，并乘以它所覆盖的 `N` 个时域采样点（注意：将每个频点能量乘以长度 `N` 才能得到整段时域波形的总能量）：普通频点贡献 `(2|X_DFT[k]| / (N√2))² · N = (2/N)|X_DFT[k]|²`；而首尾频点贡献 `(|X_DFT[k]| / N)² · N = (1/N)|X_DFT[k]|²`。为了把所有频点统一写进同一个 `(2/N)` 求和符号里，就等价于预先把首尾两点除以 `√2`！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：Peak vs RMS 显微镜——如果忘掉首尾 ÷√2 修正会发生什么？",
      "instruction": "拖动频率索引 k（对比 k=0、k=8 与中间普通正弦波 k=1..7），观察每个采样点高度是否恒定，并点击“首尾 ÷√2 修正”开关查看能量是否翻倍出错。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "频率索引 k (N=16)",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "时域峰值幅度 A",
          "min": 0.2,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "fixSqrt2",
          "label": "开启首尾 (k=0, N/2) ÷√2 修正",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 16;\n\nfunction render() {\n  const k = lab.values.k;\n  const amp = lab.values.amp;\n  const fixSqrt2 = lab.values.fixSqrt2;\n  const isEdge = (k === 0 || k === N / 2);\n\n  const x = new Array(N);\n  let eTime = 0;\n  for (let i = 0; i < N; i++) {\n    x[i] = amp * Math.cos((2 * Math.PI * k * i) / N);\n    eTime += x[i] * x[i];\n  }\n  const rms = Math.sqrt(eTime / N);\n\n  let re = 0, im = 0;\n  for (let i = 0; i < N; i++) {\n    const ang = (2 * Math.PI * k * i) / N;\n    re += x[i] * Math.cos(ang);\n    im -= x[i] * Math.sin(ang);\n  }\n  let magSq = re * re + im * im;\n  if (fixSqrt2 && isEdge) {\n    magSq = magSq / 2;\n  }\n  const eFreq = (2 / N) * magSq;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left panel: waveform & Peak vs RMS\n  const leftX = 22, leftW = 410, midY = 118, scaleY = 52;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -1; g <= 1; g++) {\n    ctx.beginPath();\n    ctx.moveTo(leftX, midY + g * scaleY);\n    ctx.lineTo(leftX + leftW, midY + g * scaleY);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  const kindText = k === 0 ? 'k=0 (直流常数：Peak = RMS)' : (k === N / 2 ? 'k=N/2 (奈奎斯特交替：Peak = RMS)' : 'k=' + k + ' (一般正弦波：RMS = Peak / √2)');\n  ctx.fillText(kindText, leftX, 18);\n\n  // Peak dashed line\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(leftX, midY - amp * scaleY);\n  ctx.lineTo(leftX + leftW, midY - amp * scaleY);\n  ctx.stroke();\n  ctx.restore();\n\n  // RMS solid line\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(leftX, midY - rms * scaleY);\n  ctx.lineTo(leftX + leftW, midY - rms * scaleY);\n  ctx.stroke();\n\n  // Samples and squared energy bars\n  const stepX = leftW / N;\n  for (let i = 0; i < N; i++) {\n    const px = leftX + (i + 0.5) * stepX;\n    const py = midY - x[i] * scaleY;\n\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = isEdge ? '#ec4899' : '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(px, py, 4, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('虚线 Peak = ' + amp.toFixed(2), leftX, H - 10);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('实线 RMS = ' + rms.toFixed(3), leftX + 145, H - 10);\n  ctx.fillStyle = isEdge ? '#f9a8d4' : '#fbbf24';\n  ctx.fillText('单点平方均值 = ' + (rms * rms).toFixed(3), leftX + 280, H - 10);\n\n  // Divider\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(452, 16);\n  ctx.lineTo(452, H - 16);\n  ctx.stroke();\n\n  // Right panel: Energy comparison\n  const rightX = 474, baseY = 196, maxE = 75;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('能量核算对比', rightX, 18);\n\n  const hTime = Math.min(145, (eTime / maxE) * 145);\n  const hFreq = Math.min(145, (eFreq / maxE) * 145);\n  const mismatch = Math.abs(eTime - eFreq) > 1e-4;\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(rightX + 26, baseY - hTime, 56, hTime);\n  ctx.fillStyle = mismatch ? '#ec4899' : '#10b981';\n  ctx.fillRect(rightX + 130, baseY - hFreq, 56, hFreq);\n\n  ctx.textAlign = 'center';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('时域真实值', rightX + 54, baseY + 16);\n  ctx.fillText(eTime.toFixed(2), rightX + 54, baseY - hTime - 6);\n\n  ctx.fillText('频域公式值', rightX + 158, baseY + 16);\n  ctx.fillStyle = mismatch ? '#f9a8d4' : '#6ee7b7';\n  ctx.fillText(eFreq.toFixed(2), rightX + 158, baseY - hFreq - 6);\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = mismatch ? '#ec4899' : '#10b981';\n  ctx.fillText(mismatch ? '警告：未除以 √2 导致能量翻倍！' : '✔ 严格吻合（能量守恒）', rightX + 108, H - 10);\n  ctx.textAlign = 'left';\n\n  lab.setReadout('k=' + k + ' | Peak=' + amp.toFixed(2) + ' | RMS=' + rms.toFixed(3) + ' | 时域能量=' + eTime.toFixed(2) + ' | 频域算出=' + eFreq.toFixed(2) + (mismatch ? ' (错误：2倍高估!)' : ' (守恒!)'));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "别漏掉首尾的 √2 修正：使用实数单边 DFT 频谱（0 到 N/2）计算能量时，k=0（直流）和 k=N/2（奈奎斯特）这两个特殊频点的幅度必须先除以 √2，否则它们的能量会被高估整整一倍。",
        "不同库的 FFT 归一化系数各异：如果使用双边复数 FFT（如 NumPy 的 np.fft.fft，输出 0 到 N-1），则不需要对首尾除以 √2，帕塞瓦尔公式变为 Σ|x[i]|² = (1/N) · Σ|X_full[k]|²；写代码前务必用全 1 常数向量做一次能量单元测试。",
        "实际 DSP 中的定位：正如作者 Steven W. Smith 所指出的，帕塞瓦尔定理完美诠释了物理中的能量守恒定律，但在日常 DSP 算法实现中直接使用的场景不多，更多用于验证频谱定标（scaling）是否正确、计算子带能量或信噪比（SNR）。"
      ]
    }
  ]
});
