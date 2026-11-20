window.__BOOK_REGISTER_SECTION__("sec_148", {
  "title": "速度提升与精度红利 (Speed Improvements)",
  "intuition": "当滤波器核长度跨越约 60 个样本的临界点后，FFT 卷积不仅凭借对数级耗时碾压标准卷积，还因计算步数锐减而顺带收获了高出一个数量级的浮点精度。",
  "blocks": [
    {
      "type": "concept",
      "heading": "算力分水岭：线性狂飙 vs 对数爬坡",
      "paragraphs": [
        "在工程选型时，最核心的问题是：**FFT 卷积究竟什么时候比直接做标准卷积更快？** 答案完全取决于滤波器核（Impulse Response）的长度 $M$。",
        "对于**标准卷积**，每计算一个输出采样点，都必须将长度为 $M$ 的滤波器核与输入信号逐点相乘累加，因此它的执行时间与滤波器核长度成**正比**（线性增长）。核长翻 10 倍，计算时间也老老实实翻 10 倍。",
        "相比之下，**FFT 卷积**把时域长卷积转换成了频域逐点相乘，其耗时只随滤波器核长度的**对数**（$\\log M$）极其缓慢地增长。原书以 100 MHz Pentium 处理器（单精度浮点）为例给出实测交叉点：**约 60 个点**（随具体硬件不同，通常落在 **40 到 80 个点**之间）。",
        "这意味着一旦跨越 60 点的分水岭，FFT 卷积的优势就会呈指数级拉开：用 FFT 卷积实现一个 **16,000 点**的超长滤波器，耗时仅仅是一个 **64 点**滤波器的**两倍左右**。"
      ],
      "formula": {
        "expr": "T_std ∝ M    vs.    T_fft ∝ log₂(M)",
        "explain": "T_std 为标准卷积单点耗时，随核长 M 线性暴涨；T_fft 为 FFT 卷积单点耗时，仅随 M 的对数缓慢爬升，两者在 M ≈ 40~80 处发生交叉"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：复现图 18-3 卷积耗时交叉点探测器",
      "instruction": "拖动「核长度指数」滑块观察标准卷积（琥珀色）与 FFT 卷积（青绿色）的耗时对比，试试开启「16,384 点长核视野」验证 16,000 点仅约 64 点两倍耗时的惊人结论。",
      "controls": [
        {
          "type": "slider",
          "id": "logM",
          "label": "核长度指数 log₂(M)",
          "min": 3,
          "max": 14,
          "step": 0.1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "crossover",
          "label": "硬件交叉点位置",
          "min": 40,
          "max": 80,
          "step": 5,
          "value": 60,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "extend16k",
          "label": "扩展视野至 16,384 点",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction calcFft(m) {\n  return 0.015 * Math.log2(m);\n}\n\nfunction calcStd(m, hw) {\n  const k = calcFft(hw) / hw;\n  return k * m;\n}\n\nfunction render() {\n  const logM = lab.values.logM;\n  const hw = lab.values.crossover;\n  const curM = Math.round(Math.pow(2, logM));\n  const maxLog = (lab.values.extend16k || logM > 10) ? 14 : 10;\n  const minLog = 3;\n  const yMax = 1.5;\n\n  const padL = 58;\n  const padR = 24;\n  const padT = 22;\n  const padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n\n  const xOfLog = function(lg) {\n    return padL + ((lg - minLog) / (maxLog - minLog)) * plotW;\n  };\n  const yOfVal = function(v) {\n    return padT + plotH - (v / yMax) * plotH;\n  };\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n\n  const yTicks = [0, 0.5, 1.0, 1.5];\n  for (let i = 0; i < yTicks.length; i++) {\n    const yv = yTicks[i];\n    const yy = yOfVal(yv);\n    ctx.beginPath();\n    ctx.moveTo(padL, yy);\n    ctx.lineTo(W - padR, yy);\n    ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.textBaseline = 'middle';\n    ctx.fillText(yv.toFixed(1), padL - 8, yy);\n  }\n\n  const stepTick = maxLog > 10 ? 2 : 1;\n  for (let lg = minLog; lg <= maxLog; lg += stepTick) {\n    const xx = xOfLog(lg);\n    ctx.beginPath();\n    ctx.moveTo(xx, padT);\n    ctx.lineTo(xx, padT + plotH);\n    ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'top';\n    ctx.fillText(String(Math.pow(2, lg)), xx, padT + plotH + 6);\n  }\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(padL, padT, plotW, plotH);\n  ctx.clip();\n\n  const crossX = xOfLog(Math.log2(hw));\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n  ctx.fillRect(crossX, padT, padL + plotW - crossX, plotH);\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 240; i++) {\n    const lg = minLog + (i / 240) * (maxLog - minLog);\n    const m = Math.pow(2, lg);\n    const v = calcStd(m, hw);\n    const xx = xOfLog(lg);\n    const yy = yOfVal(v);\n    if (i === 0) ctx.moveTo(xx, yy);\n    else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 240; i++) {\n    const lg = minLog + (i / 240) * (maxLog - minLog);\n    const m = Math.pow(2, lg);\n    const v = calcFft(m);\n    const xx = xOfLog(lg);\n    const yy = yOfVal(v);\n    if (i === 0) ctx.moveTo(xx, yy);\n    else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  const crossY = yOfVal(calcFft(hw));\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(crossX, padT);\n  ctx.lineTo(crossX, padT + plotH);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath();\n  ctx.arc(crossX, crossY, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  const curX = xOfLog(logM);\n  const stdVal = calcStd(curM, hw);\n  const fftVal = calcFft(curM);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(curX, padT);\n  ctx.lineTo(curX, padT + plotH);\n  ctx.stroke();\n\n  if (stdVal <= yMax * 1.1) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(curX, yOfVal(stdVal), 5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath();\n  ctx.arc(curX, yOfVal(fftVal), 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.restore();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('耗时 (ms/点)', 8, 12);\n  ctx.textAlign = 'right';\n  ctx.fillText('脉冲响应(核)长度 M', W - padR, H - 10);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 标准卷积 (线性 ∝ M)', padL + 130, 12);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● FFT卷积 (对数 ∝ log M)', padL + 295, 12);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('○ 交叉点: ' + hw + '点', padL + 465, 12);\n\n  const winner = curM > hw ? ('FFT 快 ' + (stdVal / fftVal).toFixed(1) + '×') : (curM < hw ? ('标准快 ' + (fftVal / stdVal).toFixed(1) + '×') : '性能临界点');\n  lab.setReadout('核长 M = ' + curM + ' 点 | 标准耗时: ' + stdVal.toFixed(3) + ' ms/点 | FFT耗时: ' + fftVal.toFixed(3) + ' ms/点 | 结论: ' + winner);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "意外之喜：算得越快，算得越准",
      "paragraphs": [
        "在数字信号处理中，运算速度不仅决定了你等多久才能看到结果，还直接决定了**计算精度**（Round-off Noise，舍入噪声大小）。",
        "原因非常朴素：单精度浮点数（Single Precision Floating Point）每做一次加减乘除，都会产生微小的截断舍入误差。输出信号里最终累积的舍入噪声，取决于**总计算次数**——而总计算次数又直接正比于运算耗时。因此，**算法算得越快，累积的误差就越少，结果就越精确！**",
        "原书给出了一个极具震撼力的对比案例：用单精度浮点对信号进行 **1000 点滤波器核**的卷积运算。若采用**标准卷积**，典型的舍入噪声约为 **1 / 20,000**；而改用 **FFT 卷积**后，不仅速度快了一个数量级（约 10 倍），其舍入噪声也同步下降了一个数量级，精度跃升至 **1 / 200,000**。",
        "不过作者也提醒工程实践中的“性价比门槛”：**只有在面对海量数据（例如百万级样本的信号）和超长滤波器核（例如千点级长度）时，FFT 卷积的巨大优势才足以抵消额外的编程复杂度**。日常写代码不必自己从零手搓分段重叠卷积，直接调用成熟科学计算库中的预写例程即可。"
      ],
      "formula": {
        "expr": "Noise_roundoff ∝ N_ops ∝ T_compute",
        "explain": "总浮点计算次数 N_ops 越多、耗时 T_compute 越长，单精度舍入噪声 Noise_roundoff 累积越严重；在 M=1000 时，FFT 卷积耗时与噪声均降至标准卷积的约 1/10"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：舍入噪声显微镜与听觉对比实验室",
      "instruction": "点击「播放信号与舍入噪声」，然后反复切换「启用 FFT 卷积」开关或调节滤波器核长度，对比单精度浮点舍入噪声在波形与听感上整整一个数量级（20 dB）的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelLen",
          "label": "滤波器核长度 M",
          "min": 100,
          "max": 4000,
          "step": 100,
          "value": 1000,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "noiseGain",
          "label": "误差显微镜放大倍率",
          "min": 200,
          "max": 4000,
          "step": 200,
          "value": 2000,
          "unit": "×"
        },
        {
          "type": "toggle",
          "id": "useFFT",
          "label": "启用 FFT 卷积 (关=标准卷积)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放信号与舍入噪声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst noiseLUT = new Float32Array(2048);\nfor (let i = 0; i < noiseLUT.length; i++) {\n  noiseLUT[i] = (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;\n}\n\nlet osc = null;\nlet noiseSrc = null;\nlet noiseGainNode = null;\nlet masterGain = null;\nlet isPlaying = false;\n\nfunction getBaseNoise(m, isFft) {\n  if (!isFft) {\n    return (1 / 20000) * Math.sqrt(m / 1000);\n  }\n  return (1 / 200000) * Math.sqrt(Math.log2(m) / Math.log2(1000));\n}\n\nfunction getAmplifiedAmp() {\n  const m = lab.values.kernelLen;\n  const gain = lab.values.noiseGain;\n  const isFft = !!lab.values.useFFT;\n  const raw = getBaseNoise(m, isFft);\n  return Math.min(0.65, raw * gain);\n}\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  if (!wantPlay && !isPlaying) return;\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n\n  if (wantPlay && !isPlaying) {\n    if (ac.state === 'suspended') ac.resume();\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0.2;\n    masterGain.connect(ac.destination);\n\n    osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = 330;\n    const oscGain = ac.createGain();\n    oscGain.gain.value = 0.45;\n    osc.connect(oscGain);\n    oscGain.connect(masterGain);\n    osc.start();\n\n    const bufSize = ac.sampleRate * 2;\n    const buf = ac.createBuffer(1, bufSize, ac.sampleRate);\n    const ch = buf.getChannelData(0);\n    for (let i = 0; i < bufSize; i++) {\n      ch[i] = Math.random() * 2 - 1;\n    }\n    noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n\n    noiseGainNode = ac.createGain();\n    noiseGainNode.gain.value = getAmplifiedAmp();\n    noiseSrc.connect(noiseGainNode);\n    noiseGainNode.connect(masterGain);\n    noiseSrc.start();\n\n    isPlaying = true;\n  } else if (!wantPlay && isPlaying) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    try { noiseSrc.stop(); noiseSrc.disconnect(); } catch (e) {}\n    try { masterGain.disconnect(); } catch (e) {}\n    osc = null; noiseSrc = null; noiseGainNode = null; masterGain = null;\n    isPlaying = false;\n  }\n\n  if (isPlaying && noiseGainNode) {\n    noiseGainNode.gain.setTargetAtTime(getAmplifiedAmp(), ac.currentTime, 0.03);\n  }\n}\n\nfunction drawScene(timeSec) {\n  const m = lab.values.kernelLen;\n  const isFft = !!lab.values.useFFT;\n  const stdRaw = getBaseNoise(m, false);\n  const fftRaw = getBaseNoise(m, true);\n  const amp = getAmplifiedAmp();\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const waveW = 470;\n  const padL = 20;\n  const midY = H / 2;\n  const waveH = 74;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let y = -1; y <= 1; y += 0.5) {\n    const yy = midY + y * waveH;\n    ctx.beginPath();\n    ctx.moveTo(padL, yy);\n    ctx.lineTo(padL + waveW, yy);\n    ctx.stroke();\n  }\n\n  const phase = (timeSec || 0) * 2.5;\n  const noiseShift = Math.floor((timeSec || 0) * 240);\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.25)';\n  ctx.setLineDash([4, 4]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let x = 0; x <= waveW; x += 2) {\n    const s = Math.sin((x / waveW) * Math.PI * 6 - phase);\n    const yy = midY - s * waveH;\n    if (x === 0) ctx.moveTo(padL + x, yy);\n    else ctx.lineTo(padL + x, yy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = isFft ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let x = 0; x <= waveW; x += 1) {\n    const s = Math.sin((x / waveW) * Math.PI * 6 - phase);\n    const n = noiseLUT[(x * 3 + noiseShift) & 2047] * amp;\n    const yy = midY - (s + n) * waveH;\n    if (x === 0) ctx.moveTo(padL + x, yy);\n    else ctx.lineTo(padL + x, yy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(isFft ? '当前模式: FFT 卷积 (高精度低噪)' : '当前模式: 标准卷积 (高累积舍入噪声)', padL, 20);\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('虚线: 理想无误差信号 | 实线: 放大 ' + lab.values.noiseGain + '× 后的含噪输出', padL, H - 12);\n\n  const panelX = 515;\n  const panelW = 185;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(panelX, 18, panelW, H - 36);\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.strokeRect(panelX, 18, panelW, H - 36);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('单精度舍入噪声对比', panelX + 14, 38);\n\n  const maxBarH = 110;\n  const stdBarH = Math.min(maxBarH, (stdRaw / 0.0001) * maxBarH);\n  const fftBarH = Math.max(4, Math.min(maxBarH, (fftRaw / 0.0001) * maxBarH));\n  const baseLineY = 175;\n\n  ctx.fillStyle = isFft ? 'rgba(245, 158, 11, 0.35)' : '#f59e0b';\n  ctx.fillRect(panelX + 35, baseLineY - stdBarH, 40, stdBarH);\n  ctx.fillStyle = isFft ? '#10b981' : 'rgba(16, 185, 129, 0.35)';\n  ctx.fillRect(panelX + 110, baseLineY - fftBarH, 40, fftBarH);\n\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('标准', panelX + 55, baseLineY + 14);\n  ctx.fillText('1/' + Math.round(1 / stdRaw).toLocaleString(), panelX + 55, baseLineY - stdBarH - 6);\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('FFT', panelX + 130, baseLineY + 14);\n  ctx.fillText('1/' + Math.round(1 / fftRaw).toLocaleString(), panelX + 130, baseLineY - fftBarH - 6);\n  ctx.textAlign = 'left';\n\n  const ratio = (stdRaw / fftRaw).toFixed(1);\n  lab.setReadout('核长 M=' + m + ' | 标准噪声 ≈ 1/' + Math.round(1 / stdRaw) + ' | FFT噪声 ≈ 1/' + Math.round(1 / fftRaw) + ' (精度提升 ' + ratio + '×)');\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawScene(0);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  drawScene(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "60 点分水岭：滤波器核短于 60 点（硬件浮动范围 40~80 点）时，直接写标准时域卷积最快最省事；超过 60 点再上 FFT 卷积。",
        "对数扩展红利：使用 FFT 卷积时，把核长从 64 点拉长到 16,000 点（翻了 250 倍），执行耗时却仅仅增加约 1 倍。",
        "精度伴随速度提升：在单精度浮点下对 1000 点核做卷积，FFT 卷积不仅比标准卷积快约 10 倍，舍入噪声也同步从 1/20,000 降至 1/200,000。",
        "避免过度设计：只有「百万级长信号 + 千点级长核」的组合才值得折腾分段重叠相加（Overlap-Add），并且优先调用成熟库中的现成实现。"
      ]
    }
  ]
});
