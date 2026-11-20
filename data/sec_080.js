window.__BOOK_REGISTER_SECTION__("sec_080", {
  "title": "卷积运算的速度与工程优化 (Speed)",
  "intuition": "卷积代码虽然只有寥寥几行，但时间复杂度是信号长度与脉冲响应长度的乘积（N×M 次乘累加）；当样本量飙升时，唯有通过精简数据、专用 DSP 硬件或改用 FFT 卷积才能打破算力瓶颈。",
  "blocks": [
    {
      "type": "concept",
      "heading": "几行代码的背后：乘累加 (MAC) 与 N×M 复杂度陷阱",
      "paragraphs": [
        "编写一个执行卷积的程序非常简单，通常只需要几行代码；但真正运行它时，等待过程却可能极其痛苦。导致执行时间漫长的罪魁祸首，并不是数组索引或循环控制——这些操作在处理器上快如闪电——而是算法内部极其庞大的加法与乘法次数。",
        "在卷积循环最核心的深处，CPU 反复做着同一件事：**将两个数相乘，然后把结果累加到一个累加器中**。这个动作被称为**乘累加运算（Multiply-Accumulate, 简称 MAC）**。MAC 是数字信号处理（DSP）最基础的积木，许多重要算法都会反复用到它，因此工程上甚至直接用「完成一次 MAC 需要多少纳秒」来衡量一颗 DSP 芯片的算力。",
        "如果你要把一个包含 **N** 个样本的输入信号，与一个包含 **M** 个样本的脉冲响应进行卷积，计算机就必须老老实实地执行 **N × M** 次乘累加。原书给出了 1990 年代中期的经典基准（100 MHz 奔腾处理器，单精度浮点约 1 微秒/次 MAC）：处理 10,000 点信号与 100 点脉冲响应需要约 1 秒；但若将信号扩大到 1,000,000 点、脉冲响应扩大到 3,000 点，总运算量高达 30 亿次 MAC，耗时将暴涨至**接近一小时（50 分钟）**。而放在十年前的 80286（12 MHz）电脑上，这同一份计算竟然需要整整**三天**！"
      ],
      "formula": {
        "expr": "Total_MACs = N × M  (核心单步：acc ← acc + a[k] · b[n - k])",
        "explain": "N 为输入信号样本总数，M 为脉冲响应（滤波器）样本总数；Total_MACs 为完整卷积所需的乘累加总次数，acc 为存放局部求和结果的累加器。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：N×M 算力爆炸与跨时代硬件耗时透视",
      "instruction": "拖动信号长度 N、脉冲响应长度 M 与单次 MAC 耗时滑块，观察左图运算矩阵面积如何膨胀，以及右图不同代际处理器与 FFT 卷积的耗时差异。",
      "controls": [
        {
          "type": "slider",
          "id": "nK",
          "label": "输入信号长度 N",
          "min": 1,
          "max": 1000,
          "step": 1,
          "value": 10,
          "unit": " k点"
        },
        {
          "type": "slider",
          "id": "mLen",
          "label": "脉冲响应长度 M",
          "min": 10,
          "max": 3000,
          "step": 10,
          "value": 100,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "macNs",
          "label": "当前硬件单次 MAC 耗时",
          "min": 10,
          "max": 1000,
          "step": 10,
          "value": 1000,
          "unit": " ns"
        },
        {
          "type": "toggle",
          "id": "showFft",
          "label": "叠加对比第 17 章 FFT 卷积",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet scanPhase = 0;\n\nfunction fmtTime(sec) {\n  if (sec < 1e-3) return (sec * 1e6).toFixed(1) + ' μs';\n  if (sec < 1) return (sec * 1000).toFixed(1) + ' ms';\n  if (sec < 60) return sec.toFixed(2) + ' 秒';\n  if (sec < 3600) return (sec / 60).toFixed(1) + ' 分钟';\n  if (sec < 86400) return (sec / 3600).toFixed(2) + ' 小时';\n  return (sec / 86400).toFixed(2) + ' 天';\n}\n\nfunction fmtOps(ops) {\n  if (ops >= 1e9) return (ops / 1e9).toFixed(2) + ' B (十亿次)';\n  if (ops >= 1e6) return (ops / 1e6).toFixed(2) + ' M (百万次)';\n  return (ops / 1e3).toFixed(1) + ' K (千次)';\n}\n\nfunction draw() {\n  const N = lab.values.nK * 1000;\n  const M = lab.values.mLen;\n  const macNs = lab.values.macNs;\n  const showFft = lab.values.showFft;\n  const totalMacs = N * M;\n\n  const t286 = totalMacs * 86400e-9;\n  const tPentium = totalMacs * 1000e-9;\n  const tCustom = totalMacs * (macNs * 1e-9);\n  const tDsp = totalMacs * 20e-9;\n\n  const fftBlock = Math.pow(2, Math.ceil(Math.log2(Math.max(32, M * 4))));\n  const numBlocks = Math.ceil(N / Math.max(1, fftBlock - M + 1));\n  const fftOps = numBlocks * (3 * fftBlock * Math.log2(fftBlock) + 2 * fftBlock);\n  const tFft = fftOps * (macNs * 1e-9);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const matX = 20, matY = 34, matMaxW = 195, matMaxH = 165;\n  const boxW = Math.max(24, (Math.log10(N) / 6) * matMaxW);\n  const boxH = Math.max(16, (Math.log10(M) / Math.log10(3000)) * matMaxH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('N × M 乘累加运算矩形', matX, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx <= matMaxW; gx += 39) {\n    ctx.beginPath(); ctx.moveTo(matX + gx, matY); ctx.lineTo(matX + gx, matY + matMaxH); ctx.stroke();\n  }\n  for (let gy = 0; gy <= matMaxH; gy += 33) {\n    ctx.beginPath(); ctx.moveTo(matX, matY + gy); ctx.lineTo(matX + matMaxW, matY + gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';\n  ctx.fillRect(matX, matY, boxW, boxH);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(matX, matY, boxW, boxH);\n\n  const scanX = matX + scanPhase * boxW;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(scanX, matY);\n  ctx.lineTo(scanX, matY + boxH);\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('N=' + (N / 1000) + 'k', matX, matY + boxH + 14);\n  ctx.fillText('M=' + M, matX + boxW + 6, matY + Math.min(boxH, 14));\n\n  const chartX = 265, chartY = 36, chartW = 435, chartH = 175;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('不同平台耗时对比（对数时间轴）', chartX, 20);\n\n  const logMin = -5;\n  const logMax = 6;\n  const ticks = [\n    { l: -3, txt: '1ms' },\n    { l: 0, txt: '1秒' },\n    { l: 1.778, txt: '1分' },\n    { l: 3.556, txt: '1小时' },\n    { l: 4.936, txt: '1天' }\n  ];\n  ctx.font = '10px sans-serif';\n  for (let i = 0; i < ticks.length; i++) {\n    const tx = chartX + ((ticks[i].l - logMin) / (logMax - logMin)) * (chartW - 95);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(tx, chartY); ctx.lineTo(tx, chartY + chartH); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx.fillText(ticks[i].txt, tx - 10, chartY + chartH + 14);\n  }\n\n  const bars = [\n    { label: '80286 (12MHz)', val: t286, color: '#ec4899' },\n    { label: 'Pentium (100MHz)', val: tPentium, color: '#f59e0b' },\n    { label: '当前硬件 (' + macNs + 'ns)', val: tCustom, color: '#38bdf8' },\n    { label: '专用 DSP (20ns)', val: tDsp, color: '#10b981' }\n  ];\n  if (showFft) {\n    bars.push({ label: 'FFT 卷积 (当前硬件)', val: tFft, color: '#f8fafc' });\n  }\n\n  const rowH = Math.floor(chartH / bars.length);\n  for (let i = 0; i < bars.length; i++) {\n    const b = bars[i];\n    const by = chartY + i * rowH + 6;\n    const bh = rowH - 14;\n    const logVal = Math.max(logMin, Math.min(logMax, Math.log10(Math.max(1e-7, b.val))));\n    const bw = Math.max(4, ((logVal - logMin) / (logMax - logMin)) * (chartW - 95));\n\n    ctx.fillStyle = b.color;\n    ctx.fillRect(chartX, by, bw, bh);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(b.label + ' : ' + fmtTime(b.val), chartX + bw + 8, by + bh / 2 + 4);\n  }\n\n  lab.setReadout(\n    '总乘累加次数: ' + fmtOps(totalMacs) +\n    ' | 当前直接卷积耗时: ' + fmtTime(tCustom) +\n    (showFft ? ' | FFT 卷积估算: ' + fmtTime(tFft) + ' (加速约 ' + Math.max(1, (tCustom / tFft)).toFixed(1) + 'x)' : '')\n  );\n}\n\nlab.onUpdate(draw);\nlab.onLoop(function(dt) {\n  scanPhase = (scanPhase + dt * 0.55) % 1;\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "打破时间瓶颈的三大工程对策",
      "paragraphs": [
        "面对动辄数十分钟甚至数天的卷积耗时，DSP 工程师通常有三种截然不同的应对路径，分别对应**省事、堆硬件、改算法**三大思路：",
        "**对策一：缩短信号长度，并用整数替代浮点数。** 如果你的程序只需要临时跑几次，这是耗时与开发工作量之间性价比最高的折中方案。尽量剪掉无关的冗余采样点以压低 N 和 M，并把耗时的浮点运算改写为定点整数运算（前提是容忍整数截断带来的微小量化误差）。",
        "**对策二：使用专为 DSP 设计的硬件处理器。** 如果你正在设计需要高频、实时、批量执行卷积的商业产品（如音视频设备、雷达或工业控制器），就应该选用专用 DSP 微处理器。这类芯片在硬件架构上专为流水线乘累加做过极致优化，单次 MAC 耗时往往只有**几十纳秒**，比通用老式 CPU 快出数十倍。",
        "**对策三：升级为更聪明的算法——FFT 卷积。** 原书第 17 章将详细介绍一种名为 **FFT 卷积（FFT Convolution）** 的高阶算法。它在数学上能得到与直接卷积**一模一样**的结果，但对于成千上万点的大信号，执行速度可以比直接卷积快上**几百倍**！它唯一的缺点是代码复杂度陡增——哪怕你已经很熟悉这项技术，从零写出并调通程序也往往需要耗费好几个小时。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：直接卷积 vs FFT 复杂度曲线与实时滤波听感",
      "instruction": "拖动脉冲响应长度 M，观察左图 O(N·M) 与 FFT 卷积的耗时分化；点击「播放测试音」实时聆听长滤波器效果，并可切换「整数化近似」感受台阶误差与噪声。",
      "controls": [
        {
          "type": "slider",
          "id": "mTaps",
          "label": "脉冲响应长度 M",
          "min": 16,
          "max": 512,
          "step": 16,
          "value": 128,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "intQuant",
          "label": "策略1：整数化近似 (模拟定点台阶误差)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "fftMode",
          "label": "策略3：显示 FFT 卷积耗时曲线",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 实时卷积并播放测试音",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet activeSrc = null;\nlet activeGain = null;\nlet pulsePhase = 0;\nlet lastBenchMs = 0;\nlet previewOut = [];\nlet previewRaw = [];\n\nfunction stopAudio() {\n  if (activeSrc) {\n    try { activeSrc.stop(); activeSrc.disconnect(); } catch (e) {}\n    activeSrc = null;\n  }\n  if (activeGain) {\n    try { activeGain.disconnect(); } catch (e) {}\n    activeGain = null;\n  }\n}\n\nfunction runSimAndAudio() {\n  const M = lab.values.mTaps;\n  const useInt = lab.values.intQuant;\n  const playing = lab.values.play;\n\n  const N = 4096;\n  const sr = 44100;\n  const f0 = Math.round(220 * N / sr) * (sr / N);\n\n  const x = new Float32Array(N);\n  for (let n = 0; n < N; n++) {\n    const t = n / sr;\n    let v = 0.55 * Math.sin(2 * Math.PI * f0 * t) + 0.30 * Math.sin(2 * Math.PI * 3 * f0 * t) + 0.15 * Math.sin(2 * Math.PI * 6 * f0 * t);\n    if (useInt) v = Math.round(v * 6) / 6;\n    x[n] = v;\n  }\n\n  const effLen = Math.max(4, Math.floor(M / 4));\n  const h = new Float32Array(effLen);\n  let hSum = 0;\n  for (let k = 0; k < effLen; k++) {\n    h[k] = 1;\n    hSum += h[k];\n  }\n  for (let k = 0; k < effLen; k++) h[k] /= hSum;\n\n  const tStart = performance.now();\n  const y = new Float32Array(N);\n  for (let n = 0; n < N; n++) {\n    let acc = 0;\n    for (let k = 0; k < effLen; k++) {\n      let idx = n - k;\n      if (idx < 0) idx += N;\n      acc += x[idx] * h[k];\n    }\n    y[n] = useInt ? Math.round(acc * 8) / 8 : acc;\n  }\n  lastBenchMs = performance.now() - tStart;\n\n  previewRaw = [];\n  previewOut = [];\n  for (let i = 0; i < 200; i++) {\n    previewRaw.push(x[i]);\n    previewOut.push(y[i]);\n  }\n\n  if (playing) {\n    stopAudio();\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    const buf = actx.createBuffer(1, N, sr);\n    buf.getChannelData(0).set(y);\n    const src = actx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    const gain = actx.createGain();\n    gain.gain.value = 0.25;\n    src.connect(gain);\n    gain.connect(actx.destination);\n    src.start();\n    activeSrc = src;\n    activeGain = gain;\n  } else {\n    stopAudio();\n  }\n}\n\nfunction draw() {\n  const M = lab.values.mTaps;\n  const useInt = lab.values.intQuant;\n  const showFft = lab.values.fftMode;\n  const playing = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const gx = 32, gy = 34, gw = 310, gh = 172;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('运算量增长曲线 (M = 16 ~ 512)', gx, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = gy + (i / 4) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n    const xx = gx + (i / 4) * gw;\n    ctx.beginPath(); ctx.moveTo(xx, gy); ctx.lineTo(xx, gy + gh); ctx.stroke();\n  }\n\n  const maxDirect = 512;\n  function mapX(mVal) { return gx + ((mVal - 16) / (512 - 16)) * gw; }\n  function mapYDirect(mVal) { return gy + gh - (mVal / maxDirect) * gh; }\n  function mapYFft(mVal) {\n    const cost = 48 * (Math.log2(mVal) / Math.log2(64));\n    return gy + gh - Math.min(1, cost / maxDirect) * gh;\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let m = 16; m <= 512; m += 8) {\n    const px = mapX(m), py = mapYDirect(m);\n    if (m === 16) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showFft) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let m = 16; m <= 512; m += 8) {\n      const px = mapX(m), py = mapYFft(m);\n      if (m === 16) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const curX = mapX(M);\n  const curYDir = mapYDirect(M);\n  ctx.strokeStyle = 'rgba(56,189,248,0.5)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(curX, gy); ctx.lineTo(curX, gy + gh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(curX, curYDir, 5, 0, Math.PI * 2); ctx.fill();\n  if (showFft) {\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(curX, mapYFft(M), 5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('直接卷积 O(N·M)', gx + 8, gy + 16);\n  if (showFft) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('FFT 卷积 (大M大幅胜出)', gx + 8, gy + 32);\n  }\n\n  const wx = 380, wy = 34, ww = 318, wh = 172;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('实时卷积输出波形 (' + (useInt ? '整数台阶量化' : '平滑浮点') + ')', wx, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2);\n  ctx.stroke();\n\n  if (previewRaw.length > 0) {\n    ctx.strokeStyle = 'rgba(248,250,252,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    for (let i = 0; i < previewRaw.length; i++) {\n      const px = wx + (i / (previewRaw.length - 1)) * ww;\n      const py = wy + wh / 2 - previewRaw[i] * (wh * 0.42);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = useInt ? '#ec4899' : '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i < previewOut.length; i++) {\n      const px = wx + (i / (previewOut.length - 1)) * ww;\n      const py = wy + wh / 2 - previewOut[i] * (wh * 0.42);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  if (playing) {\n    const r = 4 + 2 * Math.sin(pulsePhase * 6);\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(wx + ww - 10, 16, r, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const speedup = Math.max(1, M / (48 * (Math.log2(M) / Math.log2(64)))).toFixed(1);\n  lab.setReadout(\n    '当前抽头 M=' + M + ' | JS 实际直接卷积耗时: ' + lastBenchMs.toFixed(2) + ' ms' +\n    (showFft ? ' | 理论 FFT 加速比: 约 ' + speedup + 'x' : '') +\n    (useInt ? ' | 已开启整数近似(可见量化台阶与噪底)' : ' | 浮点高精度输出')\n  );\n}\n\nlab.onUpdate(function() {\n  runSimAndAudio();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  if (lab.values.play) {\n    pulsePhase += dt;\n    draw();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "复杂度直觉：直接卷积的时间成本永远是 O(N × M)，判断一段卷积代码会不会卡死，先算 N×M 乘累加总次数，再乘以处理器的单次 MAC 耗时。",
        "小项目省事法则：如果卷积只运行几次，别急着写复杂算法——优先把信号截短、并用定点整数替代浮点，是投入产出比最高的提速手段。",
        "产品级实时滤波：商业产品需要高吞吐、低延迟地反复做卷积，应直接选用几十纳秒级 MAC 的专用 DSP 芯片，而非硬扛通用处理器。",
        "大样本终极武器：当信号与滤波器达到上千点时，第 17 章的 FFT 卷积能在输出数学结果完全一致的前提下提速数百倍，但要提前预留充足的算法开发与调试工时。"
      ]
    }
  ]
});
