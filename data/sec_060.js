window.__BOOK_REGISTER_SECTION__("sec_060", {
  "title": "交错分解与 FFT 的基石 (Interlaced Decomposition)",
  "intuition": "把信号按样本下标的奇偶像洗牌一样拆成两半并补零，看似多此一举的简单操作，却是将傅里叶变换提速成百上千倍的 FFT 算法的灵魂起点。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是交错分解？（千万别和“奇偶对称”搞混）",
      "paragraphs": [
        "在上一节的奇偶对称分解中，我们是按照信号波形在中心点两侧的镜像对称性来拆解信号。而本节的**交错分解 (Interlaced Decomposition)** 完全是另一回事——它只看样本的**位置下标 `n` 是奇数还是偶数**，根本不管波形长什么样。",
        "具体操作简单到令人怀疑人生：给定一个长度为 `N` 的离散信号 `x[n]`，交错分解会生成两个同样长度为 `N` 的子信号：**偶样本信号 `x_E[n]`**（保留所有偶数下标 `n = 0, 2, 4, ...` 的采样值，把所有奇数下标强行置零）和**奇样本信号 `x_O[n]`**（保留所有奇数下标 `n = 1, 3, 5, ...` 的采样值，把所有偶数下标强行置零）。",
        "因为两者的非零样本刚好完美错开（就像拉链的两排锯齿），只要把它们逐点相加，就能分毫不差地还原出原始信号。需要注意的是，由于每隔一个点就被强行置零，单独观察 `x_E[n]` 或 `x_O[n]` 时，波形看起来会出现剧烈的“锯齿状”上下跳变。"
      ],
      "formula": {
        "expr": "x[n] = x_E[n] + x_O[n]   (其中 x_E[2k+1] = 0,  x_O[2k] = 0)",
        "explain": "x[n] 为原始 N 点信号；x_E[n] 是仅保留偶数下标样本、奇数位置补零的偶样本信号；x_O[n] 是仅保留奇数下标样本、偶数位置补零的奇样本信号；k 为整数索引。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：奇偶样本“拉链式”拆解与零填充听感",
      "instruction": "拖动信号波数与相位滑块，观察原信号如何按奇偶下标被拆成两段锯齿状序列并精确重构；点击播放按钮可交替对比原声与“奇数样本置零”后的高频混叠杂音。",
      "controls": [
        {
          "type": "slider",
          "id": "cycles",
          "label": "信号波数",
          "min": 1,
          "max": 6,
          "step": 0.5,
          "value": 2,
          "unit": " 周"
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "起始相位",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showSum",
          "label": "在原图叠加蓝圈验证 x_E[n]+x_O[n]",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 交替试听：原信号 vs 偶样本信号",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const N = 24;\nlet sourceNode = null;\nlet gainNode = null;\nlet playTime = 0;\nlet lastSigKey = '';\n\nfunction buildSignals(cycles, phaseDeg) {\n  const x = [];\n  const xE = [];\n  const xO = [];\n  const ph = (phaseDeg * Math.PI) / 180;\n  for (let n = 0; n < N; n++) {\n    const t = n / N;\n    const val = 0.62 * Math.sin(2 * Math.PI * cycles * t + ph) + 0.3 * Math.cos(2 * Math.PI * (cycles * 2) * t - ph * 0.5);\n    x.push(val);\n    xE.push(n % 2 === 0 ? val : 0);\n    xO.push(n % 2 === 1 ? val : 0);\n  }\n  return { x, xE, xO };\n}\n\nfunction stopAudio() {\n  if (sourceNode) {\n    try { sourceNode.stop(); } catch (e) {}\n    try { sourceNode.disconnect(); } catch (e) {}\n    sourceNode = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction startOrUpdateAudio(cycles, phaseDeg) {\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  stopAudio();\n\n  const sr = ac.sampleRate;\n  const segSamples = Math.floor(sr * 1.2);\n  const totalSamples = segSamples * 2;\n  const buf = ac.createBuffer(1, totalSamples, sr);\n  const ch = buf.getChannelData(0);\n  const step = Math.max(1, Math.round(sr / 2400));\n  const ph = (phaseDeg * Math.PI) / 180;\n\n  for (let i = 0; i < totalSamples; i++) {\n    const isEvenMode = i >= segSamples;\n    const localI = i % segSamples;\n    const nIdx = Math.floor(localI / step);\n    const t = (nIdx % N) / N;\n    let v = 0.62 * Math.sin(2 * Math.PI * cycles * t + ph) + 0.3 * Math.cos(2 * Math.PI * (cycles * 2) * t - ph * 0.5);\n    if (isEvenMode && nIdx % 2 === 1) v = 0;\n    const fadeLen = Math.floor(sr * 0.015);\n    let env = 1;\n    if (localI < fadeLen) env = localI / fadeLen;\n    else if (localI > segSamples - fadeLen) env = (segSamples - localI) / fadeLen;\n    ch[i] = v * env * 0.25;\n  }\n\n  gainNode = ac.createGain();\n  gainNode.gain.value = 1;\n  gainNode.connect(ac.destination);\n\n  sourceNode = ac.createBufferSource();\n  sourceNode.buffer = buf;\n  sourceNode.loop = true;\n  sourceNode.connect(gainNode);\n  sourceNode.start();\n  playTime = 0;\n}\n\nfunction drawPanel(ctx, x0, y0, w, h, title, color, data, mode, recon, activeHighlight) {\n  ctx.save();\n  ctx.fillStyle = activeHighlight ? 'rgba(56,189,248,0.09)' : 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = activeHighlight ? '#38bdf8' : 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = activeHighlight ? 1.8 : 1;\n  ctx.fillRect(x0, y0, w, h);\n  ctx.strokeRect(x0, y0, w, h);\n\n  ctx.fillStyle = color;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(title, x0 + 10, y0 + 18);\n\n  const padX = 14;\n  const plotW = w - padX * 2;\n  const midY = y0 + h * 0.56;\n  const ampH = h * 0.33;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x0 + padX, midY);\n  ctx.lineTo(x0 + w - padX, midY);\n  ctx.moveTo(x0 + padX, midY - ampH);\n  ctx.lineTo(x0 + w - padX, midY - ampH);\n  ctx.moveTo(x0 + padX, midY + ampH);\n  ctx.lineTo(x0 + w - padX, midY + ampH);\n  ctx.stroke();\n\n  ctx.strokeStyle = mode === 'all' ? 'rgba(248,250,252,0.35)' : color;\n  ctx.globalAlpha = mode === 'all' ? 1 : 0.65;\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const px = x0 + padX + (n / (N - 1)) * plotW;\n    const py = midY - data[n] * ampH;\n    if (n === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.globalAlpha = 1;\n\n  for (let n = 0; n < N; n++) {\n    const px = x0 + padX + (n / (N - 1)) * plotW;\n    const isEven = n % 2 === 0;\n    const py = midY - data[n] * ampH;\n    const isZeroed = (mode === 'even' && !isEven) || (mode === 'odd' && isEven);\n    const ptColor = isZeroed ? 'rgba(255,255,255,0.28)' : (isEven ? '#10b981' : '#ec4899');\n\n    ctx.strokeStyle = isZeroed ? 'rgba(255,255,255,0.12)' : ptColor;\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = ptColor;\n    ctx.beginPath();\n    ctx.arc(px, py, isZeroed ? 2.1 : 3.2, 0, Math.PI * 2);\n    ctx.fill();\n\n    if (recon) {\n      const rpy = midY - recon[n] * ampH;\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 1.4;\n      ctx.beginPath();\n      ctx.arc(px, rpy, 5.2, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n  }\n  ctx.restore();\n}\n\nfunction render() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const { cycles, phase, showSum, play } = lab.values;\n  const { x, xE, xO } = buildSignals(cycles, phase);\n  const recon = [];\n  let maxErr = 0;\n  for (let n = 0; n < N; n++) {\n    const s = xE[n] + xO[n];\n    recon.push(s);\n    const err = Math.abs(s - x[n]);\n    if (err > maxErr) maxErr = err;\n  }\n\n  let activeSeg = -1;\n  if (play) {\n    activeSeg = (playTime % 2.4) < 1.2 ? 0 : 1;\n  }\n\n  const panelW = 212;\n  const panelH = 204;\n  const topY = 18;\n  drawPanel(ctx, 14, topY, panelW, panelH, '原信号 x[n] (绿=偶 / 粉=奇)', '#f8fafc', x, 'all', showSum ? recon : null, activeSeg === 0);\n  drawPanel(ctx, 254, topY, panelW, panelH, '偶样本 x_E[n] (奇数点置0)', '#10b981', xE, 'even', null, activeSeg === 1);\n  drawPanel(ctx, 494, topY, panelW, panelH, '奇样本 x_O[n] (偶数点置0)', '#ec4899', xO, 'odd', null, false);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 18px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('=', 240, 124);\n  ctx.fillText('+', 480, 124);\n\n  let status = 'N=24 点 | 偶样本非零: 12 点 | 奇样本非零: 12 点 | 重构误差: ' + maxErr.toFixed(6);\n  if (play) {\n    status += activeSeg === 0 ? ' | 🔊 当前发声: 原信号 x[n] (纯净)' : ' | 🔊 当前发声: 偶样本 x_E[n] (补零引入高频镜像杂音)';\n  }\n  lab.setReadout(status);\n}\n\nlab.onUpdate(() => {\n  const { cycles, phase, play } = lab.values;\n  const sigKey = cycles + '_' + phase;\n  if (play) {\n    if (!sourceNode || sigKey !== lastSigKey) {\n      lastSigKey = sigKey;\n      startOrUpdateAudio(cycles, phase);\n    }\n  } else {\n    stopAudio();\n    lastSigKey = '';\n  }\n  render();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    playTime += dt;\n    render();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "看似平平无奇，为何能拯救几个世纪的计算瓶颈？",
      "paragraphs": [
        "初次看到交错分解，你可能会觉得这操作既平凡又无聊：把奇数项清零、把偶数项清零，有什么用呢？这种错觉恰恰是它最具有戏剧性的地方——**交错分解正是数字信号处理领域最伟大的算法之一：快速傅里叶变换 (FFT) 的核心基石。**",
        "早在几百年前，数学家就已经发现了计算傅里叶分解的方法（即离散傅里叶变换 DFT）。遗憾的是，直接硬算的速度慢到令人绝望：对于一个长度为 `N` 的信号，直接计算大约需要 `N²` 级别的运算次数，哪怕在现代计算机上处理稍大一点的数据，也动辄耗费数分钟甚至数小时。",
        "20 世纪 60 年代诞生的 **FFT 算法家族**，用一种极为优雅的“分而治之”策略彻底改写了历史，完美体现了 DSP 的工程智慧：**第一步**，反复递归地应用交错分解，把长达 `N` 点的信号不断一分为二，直到拆解成只包含 1 个样本的最基本分量；**第二步**，计算这些极简分量的傅里叶分解（1 点信号的傅里叶分解就是它本身！）；**第三步**，把小分量的结果逐级巧妙地合成出最终答案。",
        "这种策略带来的加速效果极其震撼：运算量从 `N²` 暴降到 `N · log₂(N)` 级别。在实际工程中，计算速度提升**几百倍甚至几千倍**是家常便饭。"
      ],
      "formula": {
        "expr": "计算加速比 ≈ N² / (N · log₂N) = N / log₂N",
        "explain": "N 为信号采样点数；N² 代表传统直接计算傅里叶分解的复杂度；N·log₂N 代表基于反复交错分解的 FFT 算法复杂度。N 越大，加速比越惊人。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：递归交错拆解树与 DFT vs FFT 算力暴击",
      "instruction": "拖动信号长度指数 k 和拆解层级滑块，观察左侧下标如何通过反复交错拆解最终变为单点原子分量，同时对比右侧传统算法与 FFT 的运算量差距。",
      "controls": [
        {
          "type": "slider",
          "id": "pow2",
          "label": "信号长度 N = 2^k (指数 k)",
          "min": 2,
          "max": 14,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "depth",
          "label": "递归交错拆解层级",
          "min": 0,
          "max": 4,
          "step": 1,
          "value": 3,
          "unit": " 级"
        },
        {
          "type": "toggle",
          "id": "logScale",
          "label": "算力柱状图切换为对数刻度",
          "value": false
        }
      ],
      "jsCode": "let pulsePhase = 0;\n\nfunction fmtOps(num) {\n  if (num >= 100000000) return (num / 100000000).toFixed(2) + ' 亿次';\n  if (num >= 10000) return (num / 10000).toFixed(1) + ' 万次';\n  return num.toLocaleString() + ' 次';\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const { pow2, depth, logScale } = lab.values;\n  const N = Math.pow(2, pow2);\n  const displayN = Math.min(N, 16);\n  const maxVisDepth = Math.min(depth, Math.round(Math.log2(displayN)));\n\n  // Left box: Recursive Interlaced Tree\n  const treeX = 12;\n  const treeY = 12;\n  const treeW = 420;\n  const treeH = 216;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(treeX, treeY, treeW, treeH);\n  ctx.strokeRect(treeX, treeY, treeW, treeH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  const treeTitle = N > 16 ? '递归交错拆解树 (示意前 16 个下标，共 ' + N + ' 点)' : '递归交错拆解树 (N = ' + N + ' 点)';\n  ctx.fillText(treeTitle, treeX + 10, treeY + 18);\n\n  // Build levels\n  let levels = [];\n  let root = [];\n  for (let i = 0; i < displayN; i++) root.push(i);\n  levels.push([{ indices: root, type: 'root' }]);\n\n  for (let l = 0; l < maxVisDepth; l++) {\n    const prev = levels[l];\n    const next = [];\n    for (let g = 0; g < prev.length; g++) {\n      const arr = prev[g].indices;\n      const ev = [];\n      const od = [];\n      for (let idx = 0; idx < arr.length; idx++) {\n        if (idx % 2 === 0) ev.push(arr[idx]);\n        else od.push(arr[idx]);\n      }\n      next.push({ indices: ev, type: 'even', parentIdx: g });\n      next.push({ indices: od, type: 'odd', parentIdx: g });\n    }\n    levels.push(next);\n  }\n\n  const startY = treeY + 40;\n  const rowGap = 39;\n\n  // Compute node geometry\n  const nodePos = [];\n  for (let l = 0; l < levels.length; l++) {\n    const row = levels[l];\n    const count = row.length;\n    const usableW = treeW - 20;\n    const slotW = usableW / count;\n    const posRow = [];\n    for (let g = 0; g < count; g++) {\n      const cx = treeX + 10 + slotW * (g + 0.5);\n      const cy = startY + l * rowGap;\n      const boxW = Math.min(slotW - 4, Math.max(20, row[g].indices.length * 16 + 8));\n      posRow.push({ cx, cy, boxW, boxH: 20 });\n    }\n    nodePos.push(posRow);\n  }\n\n  // Draw edges\n  for (let l = 1; l < levels.length; l++) {\n    const row = levels[l];\n    for (let g = 0; g < row.length; g++) {\n      const child = row[g];\n      const p = nodePos[l - 1][child.parentIdx];\n      const c = nodePos[l][g];\n      const edgeColor = child.type === 'even' ? '#10b981' : '#ec4899';\n      ctx.strokeStyle = edgeColor;\n      ctx.globalAlpha = 0.55 + 0.3 * Math.sin(pulsePhase * 3 - l);\n      ctx.lineWidth = 1.4;\n      ctx.beginPath();\n      ctx.moveTo(p.cx, p.cy + p.boxH / 2);\n      ctx.lineTo(c.cx, c.cy - c.boxH / 2);\n      ctx.stroke();\n    }\n  }\n  ctx.globalAlpha = 1;\n\n  // Draw nodes\n  for (let l = 0; l < levels.length; l++) {\n    const row = levels[l];\n    for (let g = 0; g < row.length; g++) {\n      const item = row[g];\n      const pos = nodePos[l][g];\n      let strokeC = '#38bdf8';\n      let fillC = 'rgba(56,189,248,0.12)';\n      if (item.type === 'even') { strokeC = '#10b981'; fillC = 'rgba(16,185,129,0.15)'; }\n      if (item.type === 'odd') { strokeC = '#ec4899'; fillC = 'rgba(236,72,153,0.15)'; }\n\n      ctx.fillStyle = fillC;\n      ctx.strokeStyle = strokeC;\n      ctx.lineWidth = 1.2;\n      ctx.fillRect(pos.cx - pos.boxW / 2, pos.cy - pos.boxH / 2, pos.boxW, pos.boxH);\n      ctx.strokeRect(pos.cx - pos.boxW / 2, pos.cy - pos.boxH / 2, pos.boxW, pos.boxH);\n\n      ctx.fillStyle = '#f8fafc';\n      ctx.font = item.indices.length > 8 ? '9px monospace' : '10px monospace';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'middle';\n      const txt = item.indices.join(',');\n      ctx.fillText(txt, pos.cx, pos.cy + 1, pos.boxW - 4);\n    }\n  }\n  ctx.textBaseline = 'alphabetic';\n\n  // Right box: DFT vs FFT Cost Comparison\n  const rightX = 446;\n  const rightY = 12;\n  const rightW = 262;\n  const rightH = 216;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(rightX, rightY, rightW, rightH);\n  ctx.strokeRect(rightX, rightY, rightW, rightH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('计算量对比 (' + (logScale ? '对数刻度' : '线性刻度') + ')', rightX + 12, rightY + 20);\n\n  const dftOps = N * N;\n  const fftOps = N * pow2;\n  const speedup = dftOps / fftOps;\n  const maxBarW = rightW - 28;\n\n  let dftW, fftW;\n  if (logScale) {\n    const maxLog = Math.log10(16384 * 16384);\n    dftW = (Math.log10(dftOps) / maxLog) * maxBarW;\n    fftW = (Math.log10(fftOps) / maxLog) * maxBarW;\n  } else {\n    dftW = maxBarW;\n    fftW = Math.max(3, (fftOps / dftOps) * maxBarW);\n  }\n\n  // DFT bar\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('直接算 DFT (N²): ' + fmtOps(dftOps), rightX + 14, rightY + 52);\n  ctx.fillStyle = 'rgba(245,158,11,0.2)';\n  ctx.fillRect(rightX + 14, rightY + 60, maxBarW, 24);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(rightX + 14, rightY + 60, dftW, 24);\n\n  // FFT bar\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('交错递归 FFT (N·log₂N): ' + fmtOps(fftOps), rightX + 14, rightY + 112);\n  ctx.fillStyle = 'rgba(16,185,129,0.18)';\n  ctx.fillRect(rightX + 14, rightY + 120, maxBarW, 24);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rightX + 14, rightY + 120, fftW, 24);\n\n  // Speedup highlight card\n  ctx.fillStyle = 'rgba(56,189,248,0.12)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.2;\n  ctx.fillRect(rightX + 14, rightY + 162, maxBarW, 40);\n  ctx.strokeRect(rightX + 14, rightY + 162, maxBarW, 40);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('🚀 速度提升: ' + speedup.toFixed(1) + ' 倍', rightX + 14 + maxBarW / 2, rightY + 187);\n\n  lab.setReadout('N = 2^' + pow2 + ' = ' + N + ' 点 | 传统 DFT 需 ' + dftOps.toLocaleString() + ' 次运算 | FFT 仅需 ' + fftOps.toLocaleString() + ' 次 | 提速 ' + speedup.toFixed(1) + ' 倍');\n}\n\nlab.onUpdate(() => {\n  draw();\n});\n\nlab.onLoop((dt) => {\n  pulsePhase += dt;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "概念避坑：交错分解按“下标奇偶性”抽取并补零（`x_E` 留偶置奇零、`x_O` 留奇置偶零），切勿与按中心对称性拆解的“奇偶对称分解”混淆。",
        "概念定义 vs 代码实现：理论描述中 `x_E[n]` 和 `x_O[n]` 保持原长度 `N`（另一半填 0）是为了直观体现线性叠加 `x[n] = x_E[n] + x_O[n]`；在实际编写 FFT 代码时，为了节省一半内存，通常会直接压缩成两个长度为 `N/2` 的紧凑数组（称为按时间抽取 Decimation-in-Time）。",
        "为什么工程中常见 FFT 点数是 2 的幂（如 256、1024、4096）？正是因为只有 `N = 2^k`，才能把交错分解无限一分为二地递归下去，最终拆解成长度为 1 的原子分量，从而彻底释放 `N·log₂N` 的百倍、千倍提速威力。"
      ]
    }
  ]
});
