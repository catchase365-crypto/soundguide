window.__BOOK_REGISTER_SECTION__("sec_189", {
  "title": "神经网络为何有效？(Why Does It Work?)",
  "intuition": "神经网络本质上是在高维参数空间中实时计算边界的“压缩版查表器”，同时也是将传统 DSP 的“相关匹配”级联成“模式的模式”，并通过样本微调突破理论假设局限的自适应系统。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从“随机黑盒”到高维参数空间划分 (Parameter Hyperspace)",
      "paragraphs": [
        "在神经网络中，权重并不是人为公式推导出来的，而是由**学习算法 (learning algorithm)** 根据大量已知样本（例如数百段声纳回波：潜艇、鲸鱼、随机噪声）计算出来的。所谓的“学习”，本质上是**基于样本统计特性来优化权重**。尽管最终得到的权重在人类眼里像一堆毫无规律的随机数，但整个网络却能稳定表现出正确的输入输出映射。",
        "为了打破这种“神秘感”，最深刻的理解视角是**参数空间 (parameter space)**。假设声纳系统有 1000 个输入采样点，这 1000 个数值共同定义了 1000 维超空间 (hyperspace) 中的一个**位置**。神经网络的任务，就是给超空间里的每个位置贴标签——潜艇回波区域输出接近 1，纯噪声区域输出接近 0。",
        "理论上，一张巨大的**查表器 (look-up table)** 也能完美完成这个任务，但它需要存储天文数字般的地址值；而神经网络则是**实时计算**每个位置的值，因此工程上常以“用多少权重就能多好地切分超空间”来评估网络架构。这也能粗略解释隐藏层节点数的经验法则：在 `N` 维空间中定位一个点需要 `N` 个数，而框定一个封闭的“长方体区域”沿每条轴至少需要最小/最大两个边界，即约 `2N` 个数值（对应 1000 个输入大约 2000 个权重，即 2 个隐藏节点就能界定一个基础区域）。由于实际问题需要划分的区域数远少于输入维数，大多数神经网络只需输入层规模 **2% 到 30%** 的隐藏节点即可胜任。"
      ],
      "formula": {
        "expr": "W_region ≈ 2 × N_dim  ⇒  N_hidden ≈ (2% ~ 30%) × N_input",
        "explain": "N_dim 为输入参数空间的维数（如 1000 个采样点）；2×N_dim 表示在每个维度上界定最小/最大边界所需的参数量；实际所需划分的区域数远小于空间维数，因此隐藏层规模通常只需输入层的 2%~30%。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：二维参数空间划分与隐藏节点边界",
      "instruction": "将隐藏节点数从 1 逐步拖到 4，观察单个“超平面”如何一步步合围出封闭的潜艇特征区域；尝试旋转权重角度并调节 Sigmoid 陡峭度。",
      "controls": [
        {
          "type": "slider",
          "id": "nodes",
          "label": "隐藏节点数 (边界数)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "steepness",
          "label": "Sigmoid 陡峭度",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "angle",
          "label": "权重旋转角度",
          "min": 0,
          "max": 45,
          "step": 5,
          "value": 15,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showLines",
          "label": "显示线性边界",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction sigmoid(z) {\n  if (z > 30) return 1;\n  if (z < -30) return 0;\n  return 1 / (1 + Math.exp(-z));\n}\n\n// 生成固定种子的二维样本点（潜艇回波簇 vs 背景噪声）\nconst subPts = [];\nconst noisePts = [];\n(function initData() {\n  let seed = 42;\n  function rand() {\n    seed = (seed * 1664525 + 1013904223) % 4294967296;\n    return seed / 4294967296;\n  }\n  const targetRad = 15 * Math.PI / 180;\n  const ca = Math.cos(targetRad), sa = Math.sin(targetRad);\n  for (let i = 0; i < 28; i++) {\n    const u = (rand() - 0.5) * 0.68;\n    const v = (rand() - 0.5) * 0.56;\n    subPts.push({ x: u * ca - v * sa, y: u * sa + v * ca });\n  }\n  for (let i = 0; i < 46; i++) {\n    let x, y;\n    do {\n      x = (rand() - 0.5) * 2.1;\n      y = (rand() - 0.5) * 2.1;\n      const rx = x * ca + y * sa;\n      const ry = -x * sa + y * ca;\n      if (Math.abs(rx) > 0.52 || Math.abs(ry) > 0.45) break;\n    } while (true);\n    noisePts.push({ x, y });\n  }\n})();\n\nfunction evalNet(x, y, k, steep, rad) {\n  const ca = Math.cos(rad), sa = Math.sin(rad);\n  const rx = x * ca + y * sa;\n  const ry = -x * sa + y * ca;\n  const h = [];\n  if (k >= 1) h.push(sigmoid(steep * (rx + 0.42)));\n  if (k >= 2) h.push(sigmoid(steep * (-rx + 0.42)));\n  if (k >= 3) h.push(sigmoid(steep * (ry + 0.36)));\n  if (k >= 4) h.push(sigmoid(steep * (-ry + 0.36)));\n  let sum = 0;\n  for (let i = 0; i < h.length; i++) sum += h[i];\n  return sigmoid(4.5 * (sum - (k - 0.5)));\n}\n\nfunction draw() {\n  const k = lab.values.nodes;\n  const steep = lab.values.steepness;\n  const rad = lab.values.angle * Math.PI / 180;\n  const showLines = lab.values.showLines;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const mapX = 24, mapY = 16, mapW = 330, mapH = 208;\n  const cols = 44, rows = 28;\n  const cw = mapW / cols, ch = mapH / rows;\n\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      const x = ((c + 0.5) / cols - 0.5) * 2.2;\n      const y = (0.5 - (r + 0.5) / rows) * 2.2;\n      const p = evalNet(x, y, k, steep, rad);\n      ctx.fillStyle = 'rgba(16, 185, 129, ' + (p * 0.55).toFixed(3) + ')';\n      ctx.fillRect(mapX + c * cw, mapY + r * ch, cw + 0.5, ch + 0.5);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(mapX, mapY, mapW, mapH);\n  ctx.beginPath();\n  ctx.moveTo(mapX + mapW / 2, mapY); ctx.lineTo(mapX + mapW / 2, mapY + mapH);\n  ctx.moveTo(mapX, mapY + mapH / 2); ctx.lineTo(mapX + mapW, mapY + mapH / 2);\n  ctx.stroke();\n\n  function toPx(x, y) {\n    return [\n      mapX + (x / 2.2 + 0.5) * mapW,\n      mapY + (0.5 - y / 2.2) * mapH\n    ];\n  }\n\n  if (showLines) {\n    const ca = Math.cos(rad), sa = Math.sin(rad);\n    const defs = [\n      { nx: ca, ny: sa, c: -0.42, col: '#38bdf8' },\n      { nx: -ca, ny: -sa, c: -0.42, col: '#38bdf8' },\n      { nx: -sa, ny: ca, c: -0.36, col: '#f59e0b' },\n      { nx: sa, ny: -ca, c: -0.36, col: '#f59e0b' }\n    ];\n    ctx.save();\n    ctx.beginPath(); ctx.rect(mapX, mapY, mapW, mapH); ctx.clip();\n    ctx.setLineDash([5, 4]);\n    ctx.lineWidth = 1.6;\n    for (let i = 0; i < k; i++) {\n      const d = defs[i];\n      ctx.strokeStyle = d.col;\n      ctx.beginPath();\n      if (Math.abs(d.ny) > 0.2) {\n        const x1 = -1.2, y1 = (-d.c - d.nx * x1) / d.ny;\n        const x2 = 1.2, y2 = (-d.c - d.nx * x2) / d.ny;\n        const p1 = toPx(x1, y1), p2 = toPx(x2, y2);\n        ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);\n      } else {\n        const y1 = -1.2, x1 = (-d.c - d.ny * y1) / d.nx;\n        const y2 = 1.2, x2 = (-d.c - d.ny * y2) / d.nx;\n        const p1 = toPx(x1, y1), p2 = toPx(x2, y2);\n        ctx.moveTo(p1[0], p1[1]); ctx.lineTo(p2[0], p2[1]);\n      }\n      ctx.stroke();\n    }\n    ctx.restore();\n  }\n\n  let correct = 0;\n  for (let i = 0; i < noisePts.length; i++) {\n    const pt = noisePts[i];\n    if (evalNet(pt.x, pt.y, k, steep, rad) <= 0.5) correct++;\n    const [px, py] = toPx(pt.x, pt.y);\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();\n  }\n  for (let i = 0; i < subPts.length; i++) {\n    const pt = subPts[i];\n    if (evalNet(pt.x, pt.y, k, steep, rad) > 0.5) correct++;\n    const [px, py] = toPx(pt.x, pt.y);\n    ctx.fillStyle = '#f59e0b';\n    ctx.strokeStyle = '#0f172a';\n    ctx.lineWidth = 1;\n    ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  }\n\n  // 右侧：沿 x 轴横截面输出曲线与统计面板\n  const rx = 385, ry = 16, rw = 315, rh = 208;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('输出概率横截面 (沿特征主轴 y=0 切片)', rx + 12, ry + 20);\n\n  const gx = rx + 20, gy = ry + 36, gw = rw - 40, gh = 100;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(gx, gy, gw, gh);\n  ctx.beginPath();\n  ctx.moveTo(gx, gy + gh / 2); ctx.lineTo(gx + gw, gy + gh / 2);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const xVal = (i / 100 - 0.5) * 2.2;\n    const p = evalNet(xVal, 0, k, steep, rad);\n    const px = gx + (i / 100) * gw;\n    const py = gy + (1 - p) * gh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const total = subPts.length + noisePts.length;\n  const acc = Math.round((correct / total) * 100);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 潜艇样本 (目标=1)', rx + 14, ry + 162);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('● 噪声样本 (目标=0)', rx + 150, ry + 162);\n\n  ctx.fillStyle = acc >= 95 ? '#10b981' : '#38bdf8';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText('区域分类准确率: ' + acc + '%', rx + 14, ry + 190);\n\n  const status = k < 4 ? '尚未完全封闭二维区域' : '已用 2N=4 条边界封闭目标区';\n  lab.setReadout('隐藏节点: ' + k + ' | 陡峭度: ' + steep + ' | 旋转角: ' + lab.values.angle + '° | 准确率: ' + acc + '% (' + status + ')');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "二、DSP 视角：相关匹配与“模式的模式” (Correlation of Correlations)",
      "paragraphs": [
        "除了几何超空间，还可以用经典数字信号处理中的**相关 (correlation)** 概念来彻底看穿神经网络。在信号检测理论中，相关是判断一段未知信号里是否包含已知模板的最优方法：只需把输入信号与目标模板逐点相乘再求和，乘积和越大，说明两者越相似。",
        "在三层神经网络中，**每一个隐藏节点都在寻找输入数据中的某一种特定模式**——它把输入向量与自己对应的那组权重做乘加求和，实质上就是一次相关运算。如果输入里出现了该节点负责的特征模式，送入 Sigmoid 函数的总和就会很大；反之则很小。而 Sigmoid 函数的曲线恰好形似两个钟形正态分布之间的**概率分界曲线**，因此我们可以把每个隐藏节点的输出直观理解为“某特定模式存在于输入中的**小数概率 (fractional probability)**”。紧接着，输出层对所有隐藏节点的输出再做一次乘加与 Sigmoid，这使整个三层网络成为**相关的相关 (a correlation of correlations)**——一个专门搜寻“模式的模式”的层级系统。",
        "更令人安心的是，传统 DSP 的两大基石——**卷积 (convolution)** 和**傅里叶分析 (Fourier analysis)**，神经网络全都能做：如果构建一个输入/输出均为 `N` 个节点的**两层神经网络**，让所有输出节点共享同一组权重，它实现的就是**线性卷积**；如果让第 `k` 个输出节点的权重等于第 `k` 个频率的正弦基函数，它计算的就是**离散傅里叶变换 (DFT)**。而标准的三层非线性网络比两层线性网络强大得多，能同时完成**非线性与线性处理**。"
      ],
      "formula": {
        "expr": "h_j = σ( Σ_i w_ji · x_i + b_j )",
        "explain": "x_i 是第 i 个输入采样点；w_ji 是第 j 个隐藏节点对应的“匹配模板”权重；Σ_i w_ji·x_i 即输入信号与模板的相关度；b_j 为偏置；σ 为 Sigmoid 函数，将相关得分映射为 0~1 之间的特征出现概率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：神经网络作为声纳相关器与频率检测器（含实时声音）",
      "instruction": "将隐藏节点的权重模板频率调至 8 Hz（与潜艇回波一致），观察相关值与 Sigmoid 输出概率的飙升；调大白噪声并点击播放，用耳朵感受强噪声中被淹没的声纳脉冲。",
      "controls": [
        {
          "type": "slider",
          "id": "wFreq",
          "label": "权重模板频率",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 5,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "环境白噪声强度",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "gain",
          "label": "Sigmoid 增益",
          "min": 2,
          "max": 12,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放声纳回波与噪声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 120;\nconst TRUE_FREQ = 8;\n\nfunction sigmoid(z) {\n  if (z > 30) return 1;\n  if (z < -30) return 0;\n  return 1 / (1 + Math.exp(-z));\n}\n\n// 固定随机白噪声序列，保证拖动滑块时响应平滑稳定\nconst baseNoise = new Float32Array(N);\n(function initNoise() {\n  let s = 1337;\n  for (let i = 0; i < N; i++) {\n    s = (s * 1664525 + 1013904223) % 4294967296;\n    baseNoise[i] = (s / 4294967296) * 2 - 1;\n  }\n})();\n\n// Web Audio 状态管理\nlet audioState = null;\nfunction ensureAudio() {\n  const ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed') return null;\n  if (ac.state === 'suspended') ac.resume();\n  if (!audioState) {\n    const master = ac.createGain();\n    master.gain.value = 0;\n    master.connect(ac.destination);\n\n    const osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = 640;\n    const oscGain = ac.createGain();\n    oscGain.gain.value = 0.2;\n    osc.connect(oscGain);\n    oscGain.connect(master);\n    osc.start();\n\n    const buf = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate);\n    const data = buf.getChannelData(0);\n    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;\n    const noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n    const noiseGain = ac.createGain();\n    noiseGain.gain.value = 0.08;\n    noiseSrc.connect(noiseGain);\n    noiseGain.connect(master);\n    noiseSrc.start();\n\n    audioState = { ac, master, osc, oscGain, noiseGain };\n  }\n  return audioState;\n}\n\nfunction computeCorr(f, noiseAmp) {\n  let sum = 0;\n  for (let i = 0; i < N; i++) {\n    const t = i / N;\n    const x = Math.sin(2 * Math.PI * TRUE_FREQ * t) + noiseAmp * baseNoise[i];\n    const w = Math.sin(2 * Math.PI * f * t);\n    sum += x * w;\n  }\n  return (2 / N) * sum;\n}\n\nfunction draw() {\n  const wFreq = lab.values.wFreq;\n  const noiseAmp = lab.values.noise;\n  const gain = lab.values.gain;\n\n  if (lab.values.play) {\n    const st = ensureAudio();\n    if (st) {\n      st.master.gain.setTargetAtTime(0.35, st.ac.currentTime, 0.03);\n      st.noiseGain.gain.setTargetAtTime(0.06 * noiseAmp, st.ac.currentTime, 0.03);\n    }\n  } else if (audioState && audioState.ac.state !== 'closed') {\n    audioState.master.gain.setTargetAtTime(0, audioState.ac.currentTime, 0.03);\n  }\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  // 1. 左上：输入信号 x[n] 与权重模板 w[n]\n  const wx = 20, wy = 16, ww = 420, wh = 94;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(wx, wy, ww, wh);\n  ctx.beginPath(); ctx.moveTo(wx, wy + wh / 2); ctx.lineTo(wx + ww, wy + wh / 2); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('输入声纳信号 x[n] (含 8Hz 目标) vs 隐藏节点权重模板 w[n] (' + wFreq + 'Hz)', wx + 8, wy + 15);\n\n  // 画含噪输入\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const t = i / N;\n    const val = Math.sin(2 * Math.PI * TRUE_FREQ * t) + noiseAmp * baseNoise[i];\n    const px = wx + (i / (N - 1)) * ww;\n    const py = wy + wh / 2 - val * 18;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // 画权重模板\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const val = Math.sin(2 * Math.PI * wFreq * (i / N));\n    const px = wx + (i / (N - 1)) * ww;\n    const py = wy + wh / 2 - val * 18;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // 2. 左下：各频率节点相关谱（类似 DFT 神经元阵列）\n  const sx = 20, sy = 124, sw = 420, sh = 100;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(sx, sy, sw, sh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('不同频率权重节点的相关响应 (模拟 DFT 频谱分析)', sx + 8, sy + 15);\n\n  const freqs = 15;\n  const barW = (sw - 40) / freqs;\n  for (let f = 2; f <= 16; f++) {\n    const c = Math.max(0, computeCorr(f, noiseAmp));\n    const bh = Math.min(1.2, c) * 56;\n    const bx = sx + 20 + (f - 2) * barW;\n    const by = sy + sh - 18 - bh;\n    ctx.fillStyle = (f === wFreq) ? (f === TRUE_FREQ ? '#10b981' : '#f59e0b') : 'rgba(56, 189, 248, 0.35)';\n    ctx.fillRect(bx + 2, by, barW - 4, bh);\n    ctx.fillStyle = (f === wFreq) ? '#f8fafc' : 'rgba(248,250,252,0.5)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(f), bx + barW / 2 - 4, sy + sh - 5);\n  }\n\n  // 3. 右侧：Sigmoid 概率转换曲线与实时判决\n  const rx = 460, ry = 16, rw = 240, rh = 208;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('Sigmoid 概率映射输出', rx + 14, ry + 20);\n\n  const gx = rx + 20, gy = ry + 36, gw = rw - 40, gh = 96;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 60; i++) {\n    const cVal = -0.3 + (i / 60) * 1.6;\n    const p = sigmoid(gain * (cVal - 0.45));\n    const px = gx + (i / 60) * gw;\n    const py = gy + (1 - p) * gh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const curCorr = computeCorr(wFreq, noiseAmp);\n  const curProb = sigmoid(gain * (curCorr - 0.45));\n  const dotX = gx + Math.max(0, Math.min(1, (curCorr + 0.3) / 1.6)) * gw;\n  const dotY = gy + (1 - curProb) * gh;\n\n  ctx.fillStyle = curProb > 0.5 ? '#10b981' : '#ec4899';\n  ctx.beginPath(); ctx.arc(dotX, dotY, 6, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('相关度得分: ' + curCorr.toFixed(2), rx + 16, ry + 160);\n  ctx.fillStyle = curProb > 0.5 ? '#10b981' : '#ec4899';\n  ctx.font = 'bold 15px sans-serif';\n  ctx.fillText('潜艇概率: ' + Math.round(curProb * 100) + '%', rx + 16, ry + 188);\n\n  lab.setReadout('模板频率: ' + wFreq + 'Hz (真实回波=8Hz) | 相关度: ' + curCorr.toFixed(2) + ' | Sigmoid输出概率: ' + Math.round(curProb * 100) + '%');\n}\n\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.play && audioState && audioState.ac.state !== 'closed') {\n    const phase = timeSec % 1.2;\n    const env = phase < 0.25 ? Math.sin((phase / 0.25) * Math.PI) : 0.02;\n    audioState.oscGain.gain.setTargetAtTime(0.28 * env, audioState.ac.currentTime, 0.015);\n  }\n});\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "三、为何学习算法能击败“理论最优”的传统 DSP？",
      "paragraphs": [
        "既然两层神经网络就能用正弦权重算出 DFT 或实现卷积，如果直接用传统 DSP 方法来手工设计神经网络的权重，它算得上是“最优”的吗？答案是：**通常并不是**。",
        "传统 DSP 算法号称“最优”，往往依赖于严苛的**理想化前提假设**：比如维纳滤波 (Wiener filtering) 号称能最大化信噪比，前提是信号与噪声的频谱都**精确已知**；相关匹配在检测目标时是最优的，前提是干扰必须是理想的**白噪声 (white noise)**；反卷积能完美消除畸变，前提是反卷积核恰好是原始卷积核的**严格逆运算**。但在真实工程现场，科学家和工程师几乎永远无法掌握实际输入信号的完美统计特性。数学推导再优雅，算法表现的天花板依然受限于人类对数据理解的局限。",
        "设想这样一个实验：拿一个设计好的传统 DSP 算法去跑真实采集的信号，然后把某个参数仅仅微调 `1%` 再测一次。如果第二次的结果比第一次更好，那就直接证明原来的“理论最优”算法在当前实际任务中**并未达到最优**。事实上，几乎所有传统 DSP 算法都能通过对参数和流程做小幅度的**试错评估 (trial-and-error evaluation)** 而得到显著改进——而这，正是神经网络学习算法的核心策略。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要试图强行用人脑去解释单个神经网络权重的数值意义：它们是在高维参数空间里协同拟合样本统计分布的产物，看整体映射与误差指标比盯着单个权重更有价值。",
        "隐藏层规模经验法则：在 `N` 维空间中界定封闭区域大约需要 `2N` 个边界参数，因此大多数应用中隐藏层节点数取输入层维数的 `2% ~ 30%` 即可，盲目堆叠超大隐藏层极易过拟合。",
        "两层（无隐藏层或无非线性）只等价于卷积或 DFT 这类线性变换；想做“模式的模式”这种复杂非线性识别，必须保留三层架构与 Sigmoid 等非线性激活函数。",
        "当真实信号违背“白噪声”或“已知频谱”等教科书假设时，理论最优的传统滤波器往往表现平庸；此时基于真实样本数据库微调参数的神经网络（数据驱动优化）通常会给出更优解。"
      ]
    }
  ]
});
