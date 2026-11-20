window.__BOOK_REGISTER_SECTION__("sec_085", {
  "title": "周期离散信号与离散傅里叶变换 (Periodic-Discrete & DFT)",
  "intuition": "计算机只能处理有限长的离散数字，唯有在数学上脑补“首尾相接无限循环”，才能让有限采样点成为唯一可被计算机求解的离散傅里叶变换 (DFT)。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是“周期-离散”信号？",
      "paragraphs": [
        "信号可以从两个维度划分为四类：**连续 vs 离散**（时间轴是否只在一系列离散点上有定义），以及**周期 vs 非周期**（波形是否每隔固定间隔重复出现）。将这两个特征两两组合，就构成了图 8-2 中的四种傅里叶变换家族。",
        "其中，**周期-离散 (Periodic-Discrete)** 信号是指仅在离散的时间点上有定义，并且从负无穷到正无穷以固定周期不断重复自身的信号。针对这种信号的傅里叶变换有时被称为“离散傅里叶级数”，但绝大多数情况下直接称为**离散傅里叶变换 (Discrete Fourier Transform, DFT)**。",
        "你可能觉得这四种变换的命名（FT、FS、DTFT、DFT）非常混乱且缺乏规律——你的直觉完全正确。这些术语是在过去 200 年间杂乱无章地演化出来的，没有逻辑捷径，直接记住对应关系即可。"
      ],
      "formula": {
        "expr": "x[n] = x[n + kN]   (k ∈ ℤ)",
        "explain": "x[n] 表示第 n 个离散采样点，N 为信号的周期（采样点数），k 为任意整数。意思是每隔 N 个点，波形就完全重复一次。"
      }
    },
    {
      "type": "concept",
      "heading": "计算机的困境：有限长度数据如何“假装”无限长？",
      "paragraphs": [
        "无论是哪一类经典的傅里叶信号，在数学定义上都延伸至**正无穷和负无穷**。但问题来了：如果计算机内存里只存了有限的 **1024 个采样点**，难道存在一种“有限长傅里叶变换”吗？答案是：**不存在**。因为正弦波和余弦波本身就是从负无穷延伸到正无穷的，你无法用一群无限长的波去直接合成一段有限长的数据。",
        "解决这个矛盾的唯一办法，是把有限长的数据**伪装成无限长信号**——也就是脑补在真实采样点的左右两侧还有无穷多个点。这里有两种截然不同的脑补方式：",
        "1. **两侧补零（对应 DTFT）**：假设左右两侧的无限个点全都是 `0`。这样信号看起来是**离散且非周期**的，适用**离散时间傅里叶变换 (DTFT)**。然而，合成一个非周期信号需要**无穷多个**正弦波，计算机算法根本算不出来。",
        "2. **周期复制（对应 DFT）**：假设左右两侧的无限个点，是把这 1024 个真实采样点原封不动地无限复制粘贴。这样信号看起来就是**离散且周期**的，周期为 1024。排除掉无法计算的 DTFT，**DFT 是数字信号处理 (DSP) 中唯一能写成计算机程序运行的傅里叶变换**。",
        "回到第 8 章开头的 16 点分解例子（图 8-1）：表面上看是 16 个点被分解成 18 个长度为 16 的正弦波；但在严谨的数学视角下，这 16 个点只是**无限长周期信号的一个周期**，每个 16 点正弦波也是**无限长正弦波的一个片段**。这种周期假设只是为了套用 DFT 这个数学工具而强加的，通常与信号实际如何采集毫无关系，但后续你会看到许多令人费解的 DFT 性质，一旦换上“无限周期”视角就瞬间豁然开朗。"
      ],
      "formula": {
        "expr": "x_periodic[n] = x[n mod N]",
        "explain": "mod 为取模（求余数）运算。无论索引 n 跑到负无穷还是正无穷，通过 n mod N 都映射回计算机内存里的有限区间 [0, N-1]，实现周期延拓。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：有限信号的“无限脑补”——补零 (DTFT) vs 周期延拓 (DFT)",
      "instruction": "切换下方的延拓模式开关，对比蓝色框内有限样本在左右两侧被“脑补”成补零或循环后的波形，并点击播放按钮聆听两种假设在听觉上的本质区别。",
      "controls": [
        {
          "type": "slider",
          "id": "nPoints",
          "label": "计算机存储的采样点数 N",
          "min": 8,
          "max": 24,
          "step": 2,
          "value": 14,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "harm",
          "label": "局部波形振荡频率",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": " 倍"
        },
        {
          "type": "toggle",
          "id": "mode",
          "label": "周期延拓模式 (DFT) / 关闭为两侧补零 (DTFT)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听当前假设信号",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioTimer = null;\nlet activeNodes = [];\n\nfunction stopAudio() {\n  if (audioTimer) {\n    clearInterval(audioTimer);\n    audioTimer = null;\n  }\n  for (let i = 0; i < activeNodes.length; i++) {\n    try { activeNodes[i].stop(); } catch (e) {}\n    try { activeNodes[i].disconnect(); } catch (e) {}\n  }\n  activeNodes = [];\n}\n\nfunction sampleAt(i, N, harm) {\n  const t = i / N;\n  return Math.sin(2 * Math.PI * harm * t) * Math.exp(-5.0 * Math.pow(t - 0.3, 2)) * 1.15;\n}\n\nfunction playOneBurst(actx, N, harm, loopIt) {\n  const sr = actx.sampleRate;\n  const periodSamples = Math.max(32, Math.round(sr / 220));\n  const bufLen = loopIt ? periodSamples : Math.round(sr * 0.25);\n  const buf = actx.createBuffer(1, bufLen, sr);\n  const data = buf.getChannelData(0);\n  for (let s = 0; s < bufLen; s++) {\n    if (s < periodSamples) {\n      const pos = (s / periodSamples) * N;\n      const idx0 = Math.floor(pos);\n      const frac = pos - idx0;\n      const v0 = sampleAt(idx0 % N, N, harm);\n      const v1 = sampleAt((idx0 + 1) % N, N, harm);\n      data[s] = (v0 + (v1 - v0) * frac) * 0.25;\n    } else {\n      data[s] = 0;\n    }\n  }\n  const src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = loopIt;\n  src.connect(actx.destination);\n  src.start();\n  activeNodes.push(src);\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const N = lab.values.nPoints;\n  const harm = lab.values.harm;\n  const isPeriodic = lab.values.mode;\n  const isPlaying = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padX = 36;\n  const plotW = W - padX * 2;\n  const midY = H * 0.56;\n  const ampH = H * 0.34;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gy = -2; gy <= 2; gy++) {\n    const y = midY + gy * (ampH * 0.5);\n    ctx.beginPath();\n    ctx.moveTo(padX, y);\n    ctx.lineTo(W - padX, y);\n    ctx.stroke();\n  }\n\n  const totalPts = N * 3;\n  const stepX = plotW / totalPts;\n\n  const boxX = padX + N * stepX - stepX * 0.35;\n  const boxW = N * stepX;\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.08)';\n  ctx.fillRect(boxX, 26, boxW, H - 40);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.strokeRect(boxX, 26, boxW, H - 40);\n  ctx.setLineDash([]);\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = isPeriodic ? '#10b981' : '#ec4899';\n  ctx.fillText(isPeriodic ? '◀ 左侧脑补：周期重复' : '◀ 左侧脑补：全零填充', padX + (N * stepX) * 0.5, 18);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('真实存储的 ' + N + ' 点 [0 .. ' + (N - 1) + ']', boxX + boxW * 0.5, 18);\n  ctx.fillStyle = isPeriodic ? '#10b981' : '#ec4899';\n  ctx.fillText(isPeriodic ? '右侧脑补：周期重复 ▶' : '右侧脑补：全零填充 ▶', padX + (2.5 * N * stepX), 18);\n\n  for (let k = 0; k < totalPts; k++) {\n    const idx = k - N;\n    const isCenter = idx >= 0 && idx < N;\n    let val = 0;\n    if (isCenter) {\n      val = sampleAt(idx, N, harm);\n    } else if (isPeriodic) {\n      const modIdx = ((idx % N) + N) % N;\n      val = sampleAt(modIdx, N, harm);\n    } else {\n      val = 0;\n    }\n\n    const x = padX + (k + 0.5) * stepX;\n    const y = midY - val * ampH;\n    const color = isCenter ? '#38bdf8' : (isPeriodic ? '#10b981' : '#ec4899');\n\n    ctx.strokeStyle = color;\n    ctx.lineWidth = isCenter ? 2 : 1.5;\n    ctx.beginPath();\n    ctx.moveTo(x, midY);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(x, y, isCenter ? 3.8 : 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  stopAudio();\n  if (isPlaying) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    if (isPeriodic) {\n      playOneBurst(actx, N, harm, true);\n    } else {\n      playOneBurst(actx, N, harm, false);\n      audioTimer = setInterval(() => {\n        if (lab.values.play && !lab.values.mode) {\n          playOneBurst(actx, lab.values.nPoints, lab.values.harm, false);\n        }\n      }, 850);\n    }\n  }\n\n  const modeText = isPeriodic\n    ? '【DFT 模式：周期-离散】假想无限重复，可由有限正弦波合成 → 计算机可算' + (isPlaying ? '（连续音高）' : '')\n    : '【DTFT 模式：非周期-离散】两侧补零，需无穷多个正弦波 → 计算机无法直接算' + (isPlaying ? '（孤立瞬态）' : '');\n  lab.setReadout('N=' + N + ' 点 | ' + modeText);\n});"
    },
    {
      "type": "concept",
      "heading": "实数版与复数版，以及究竟什么是“变换 (Transform)”？",
      "paragraphs": [
        "上述四类傅里叶变换的每一种，都可以进一步拆分为**实数版本 (Real)** 和**复数版本 (Complex)**。实数版本最简单，只用到普通的实数与初等代数即可完成信号的分解与合成（本书第 8 章的重点正是**实数 DFT**）。",
        "而复数版本要复杂得多，必须引入包含 `j = √-1` 的复数（例如 `3 + 4j`，电气工程师习惯用字母 `j`，数学家则用 `i`）。复数数学很容易让人望而生畏，本书的核心目标之一就是**不用复数数学**讲透 DSP 基础，让更广泛的科学家和工程师都能掌握（复数版将在第 30–33 章讨论）。",
        "最后，我们必须彻底理清一个高频词汇：**变换 (Transform)** 到底是什么？回忆一下什么是**函数 (Function)**：函数是把一个数值（或几个数值）变成单个输出值的规则，例如 `y = 2x + 1` 或 `y = 2a + 3b + 4c`。",
        "**变换 (Transform)** 则是函数的直接升级版——它允许**输入和输出都包含多个数值**。比如你有一段包含 100 个采样点的信号，只要发明一套固定算法，把这 100 个数转换成另外 100 个数（或者 200 个数），这就是一个变换。如果它足够有用，你完全可以拿自己的姓氏来命名它（当然，如果你是 18 世纪的著名法国数学家效果更佳）。变换不限制数据类型：离散进离散出、连续进连续出、甚至混合进出都可以。简而言之，变换就是**把一整块数据变成另一整块数据的固定流程**。"
      ],
      "formula": {
        "expr": "Output_Chunk[M] = Transform( Input_Chunk[N] )",
        "explain": "函数是“多对一/一对一”的映射，而变换是“一整块数据（N 个输入值）→ 另一整块数据（M 个输出值）”的固定算法流程。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：有限谐波合成与“块到块”变换视角",
      "instruction": "拖动谐波数量 K 观察左图 16 点周期离散信号如何由有限个正弦/余弦波叠加而成，右侧同时展示变换输出的频率分量块；开启声音聆听谐波数量变化对音色的影响。",
      "controls": [
        {
          "type": "slider",
          "id": "kMax",
          "label": "参与合成的正弦/余弦谐波数 K",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "waveType",
          "label": "目标波形：关闭=锯齿波 / 开启=窄脉冲",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showCont",
          "label": "显示背后的连续周期波曲线",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 聆听 K 个谐波合成音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let oscNode = null;\nlet gainNode = null;\n\nfunction stopSynth() {\n  if (oscNode) {\n    try { oscNode.stop(); } catch (e) {}\n    try { oscNode.disconnect(); } catch (e) {}\n    oscNode = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction getAmp(k, isPulse) {\n  if (isPulse) return Math.pow(0.84, k - 1);\n  return 1 / k;\n}\n\nfunction evalWave(t, kMax, isPulse) {\n  let sum = 0;\n  for (let k = 1; k <= kMax; k++) {\n    const a = getAmp(k, isPulse);\n    if (isPulse) {\n      sum += a * Math.cos(2 * Math.PI * k * t);\n    } else {\n      sum += a * Math.sin(2 * Math.PI * k * t);\n    }\n  }\n  return sum;\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const kMax = lab.values.kMax;\n  const isPulse = lab.values.waveType;\n  const showCont = lab.values.showCont;\n  const isPlaying = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const leftX = 28;\n  const leftW = 400;\n  const midY = H * 0.56;\n  const normScale = isPulse ? 4.2 : 1.9;\n  const ampH = (H * 0.36) / normScale;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -2; g <= 2; g++) {\n    const y = midY + g * (H * 0.17);\n    ctx.beginPath();\n    ctx.moveTo(leftX, y);\n    ctx.lineTo(leftX + leftW, y);\n    ctx.stroke();\n  }\n\n  const N = 16;\n  const totalPts = 32;\n  const stepX = leftW / totalPts;\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n  ctx.fillRect(leftX, 28, N * stepX, H - 42);\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';\n  ctx.strokeRect(leftX, 28, N * stepX, H - 42);\n\n  if (showCont) {\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let px = 0; px <= leftW; px += 2) {\n      const t = (px / leftW) * 2;\n      const y = midY - evalWave(t, kMax, isPulse) * ampH;\n      if (px === 0) ctx.moveTo(leftX + px, y);\n      else ctx.lineTo(leftX + px, y);\n    }\n    ctx.stroke();\n  }\n\n  for (let i = 0; i < totalPts; i++) {\n    const t = i / N;\n    const val = evalWave(t, kMax, isPulse);\n    const x = leftX + (i + 0.5) * stepX;\n    const y = midY - val * ampH;\n    const isFirstPeriod = i < N;\n    const col = isFirstPeriod ? '#10b981' : '#f8fafc';\n\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    ctx.moveTo(x, midY);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n\n    ctx.fillStyle = col;\n    ctx.beginPath();\n    ctx.arc(x, y, isFirstPeriod ? 3.5 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('输入块：16点周期离散信号 (展示2个周期)', leftX, 18);\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(442, midY);\n  ctx.lineTo(476, midY);\n  ctx.lineTo(468, midY - 6);\n  ctx.moveTo(476, midY);\n  ctx.lineTo(468, midY + 6);\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('变换', 459, midY - 12);\n\n  const rightX = 492;\n  const rightW = 204;\n  const baseLineY = H - 30;\n  const barMaxH = H - 70;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(rightX, baseLineY);\n  ctx.lineTo(rightX + rightW, baseLineY);\n  ctx.stroke();\n\n  const barSlot = rightW / 8;\n  for (let k = 1; k <= 8; k++) {\n    const a = getAmp(k, isPulse);\n    const bh = a * barMaxH;\n    const bx = rightX + (k - 1) * barSlot + 4;\n    const bw = barSlot - 8;\n    const active = k <= kMax;\n    ctx.fillStyle = active ? '#f59e0b' : 'rgba(255,255,255,0.10)';\n    ctx.fillRect(bx, baseLineY - bh, bw, bh);\n\n    ctx.fillStyle = active ? '#f8fafc' : 'rgba(255,255,255,0.35)';\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('k=' + k, bx + bw * 0.5, baseLineY + 14);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('输出块：有限个谐波振幅', rightX, 18);\n\n  if (isPlaying) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    const real = new Float32Array(9);\n    const imag = new Float32Array(9);\n    for (let k = 1; k <= kMax; k++) {\n      const a = getAmp(k, isPulse);\n      if (isPulse) real[k] = a;\n      else imag[k] = a;\n    }\n    const wave = actx.createPeriodicWave(real, imag, { disableNormalization: false });\n    if (!oscNode) {\n      gainNode = actx.createGain();\n      gainNode.gain.value = 0.16;\n      gainNode.connect(actx.destination);\n      oscNode = actx.createOscillator();\n      oscNode.frequency.value = 220;\n      oscNode.setPeriodicWave(wave);\n      oscNode.connect(gainNode);\n      oscNode.start();\n    } else {\n      oscNode.setPeriodicWave(wave);\n    }\n  } else {\n    stopSynth();\n  }\n\n  lab.setReadout('当前波形：' + (isPulse ? '余弦窄脉冲' : '正弦锯齿波') + ' | 仅需 K=' + kMax + ' 个有限谐波即可合成' + (isPlaying ? ' | 基频 220Hz 发声中' : ''));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数字计算机只能处理离散且有限长的数据，因此傅里叶级数、连续傅里叶变换和 DTFT 都只停留在纸面理论推导上；写程序做频谱分析时，你唯一能用的只有**离散傅里叶变换 (DFT)**。",
        "虽然你的程序只读入了有限的 N 个点，但 DFT 在数学上默认这 N 个点在左右两侧无限周期复制（Period = N）；记住这个“暗含的周期假设”，后面遇到频谱泄漏与圆周卷积才不会掉坑里。",
        "不要被“变换 (Transform)”这个词吓到，它就是函数的多对多升级版——把**一整块输入数组**通过固定算法变成**另一整块输出数组**；工程入门阶段先用不含虚数 `j` 的**实数 DFT** 就足够解决绝大多数问题。"
      ]
    }
  ]
});
