window.__BOOK_REGISTER_SECTION__("sec_086", {
  "title": "实数 DFT 的符号规范与数据格式 (Notation and Format of the Real DFT)",
  "intuition": "实数离散傅里叶变换（Real DFT）把长度为 N 的一维时域数组 x[ ]，无损拆解成两段长度为 N/2 + 1 的普通实数数组 Re X[ ] 与 Im X[ ]，分别存放各频率余弦波和正弦波的振幅。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、时域与频域的双向桥梁：正变换与逆变换",
      "paragraphs": [
        "在数字信号处理中，实数 DFT 接收一个包含 **N 个采样点** 的输入信号，并将其转换为 **两个长度各为 N/2 + 1** 的输出信号。输入信号被称为处于 **时域（Time Domain）**，因为送入 DFT 的信号最常见的是按固定时间间隔采集的数据；不过在傅里叶分析中，“时域”也可以泛指任何等待被分解的离散数据序列。",
        "输出的两个信号统称为处于 **频域（Frequency Domain）**，它们记录了构成原始信号所需的各阶正弦波与余弦波的振幅（含特定缩放系数，后续小节会详细展开）。",
        "需要牢记的是：**频域与时域包含完全相同的信息，只是换了一种表达形式**。只要知道其中一个域，就能精确算出另一个域。从时域计算频域的过程称为 **分解（Decomposition）**、**分析（Analysis）**、**正 DFT（Forward DFT）** 或简称 **DFT**；反过来，从频域还原时域的过程称为 **综合（Synthesis）** 或 **逆 DFT（Inverse DFT）**。"
      ],
      "formula": {
        "expr": "x[0 ... N-1]  <== Forward / Inverse DFT ==>  Re X[0 ... N/2], Im X[0 ... N/2]",
        "explain": "N 是时域采样点数；下标从 0 开始，时域共 N 个点（0 到 N-1），频域实部与虚部各自有 N/2 + 1 个点（0 到 N/2）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：实数 DFT 的数组长度映射 (N 与 N/2 + 1)",
      "instruction": "拖动滑块改变时域长度 N（2 的幂次），或切换正/逆变换方向，观察时域与频域数组下标与多出的第 N/2 个采样点。",
      "controls": [
        {
          "type": "slider",
          "id": "pow2",
          "label": "信号长度指数 (N = 2^m)",
          "min": 3,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "inverse",
          "label": "切换为逆变换（综合 Synthesis）",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const N = Math.pow(2, lab.values.pow2);\n  const halfPlusOne = N / 2 + 1;\n  const isInverse = !!lab.values.inverse;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 0; y <= H; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.textAlign = 'center';\n  ctx.fillText('时域 Time Domain: x[ ]', 150, 28);\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('频域 Frequency Domain: X[ ]', 548, 28);\n\n  const tdX = 24, tdY = 96, tdW = 252, boxH = 28;\n  const cellW = tdW / N;\n  for (let i = 0; i < N; i++) {\n    const cx = tdX + i * cellW;\n    ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1;\n    ctx.fillRect(cx, tdY, Math.max(1, cellW - 1), boxH);\n    ctx.strokeRect(cx, tdY, Math.max(1, cellW - 1), boxH);\n  }\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.fillText('0', tdX, tdY + boxH + 16);\n  ctx.textAlign = 'right';\n  ctx.fillText('N-1 (' + (N - 1) + ')', tdX + tdW, tdY + boxH + 16);\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('共 N = ' + N + ' 个采样点', tdX + tdW / 2, tdY - 12);\n\n  const ax1 = 294, ax2 = 384, ay = 110;\n  ctx.strokeStyle = isInverse ? '#f59e0b' : '#f8fafc';\n  ctx.fillStyle = isInverse ? '#f59e0b' : '#f8fafc';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(ax1, ay);\n  ctx.lineTo(ax2, ay);\n  ctx.stroke();\n\n  ctx.beginPath();\n  if (!isInverse) {\n    ctx.moveTo(ax2, ay);\n    ctx.lineTo(ax2 - 9, ay - 6);\n    ctx.lineTo(ax2 - 9, ay + 6);\n  } else {\n    ctx.moveTo(ax1, ay);\n    ctx.lineTo(ax1 + 9, ay - 6);\n    ctx.lineTo(ax1 + 9, ay + 6);\n  }\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(isInverse ? 'Inverse DFT' : 'Forward DFT', (ax1 + ax2) / 2, ay - 14);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText(isInverse ? '综合 (Synthesis)' : '分解 (Analysis)', (ax1 + ax2) / 2, ay + 20);\n\n  function drawFreqArray(label, subLabel, startX, startY, color, fillRgba) {\n    const fw = 136;\n    const cw = fw / halfPlusOne;\n    ctx.font = 'bold 12px monospace';\n    ctx.fillStyle = color;\n    ctx.textAlign = 'center';\n    ctx.fillText(label, startX + fw / 2, startY - 12);\n\n    for (let k = 0; k < halfPlusOne; k++) {\n      const cx = startX + k * cw;\n      const isExtra = (k === halfPlusOne - 1);\n      ctx.fillStyle = isExtra ? 'rgba(236, 72, 153, 0.35)' : fillRgba;\n      ctx.strokeStyle = isExtra ? '#ec4899' : color;\n      ctx.lineWidth = 1;\n      ctx.fillRect(cx, startY, Math.max(1, cw - 1), boxH);\n      ctx.strokeRect(cx, startY, Math.max(1, cw - 1), boxH);\n    }\n    ctx.font = '11px monospace';\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'left';\n    ctx.fillText('0', startX, startY + boxH + 15);\n    ctx.textAlign = 'right';\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('N/2 (' + (N / 2) + ')', startX + fw, startY + boxH + 15);\n    ctx.textAlign = 'center';\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(subLabel, startX + fw / 2, startY + boxH + 34);\n  }\n\n  drawFreqArray('Re X[ ]', '余弦振幅 (' + halfPlusOne + '点)', 402, 74, '#10b981', 'rgba(16, 185, 129, 0.22)');\n  drawFreqArray('Im X[ ]', '正弦振幅 (' + halfPlusOne + '点)', 560, 74, '#f59e0b', 'rgba(245, 158, 11, 0.22)');\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('粉色尾格为下标 N/2 的第 ' + halfPlusOne + ' 个点（共 N/2 + 1 个），写程序最易漏掉！', 548, 178);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('书中程序数组名:  XX[0..' + (N - 1) + ']   <-->   REX[0..' + (N / 2) + '] ,  IMX[0..' + (N / 2) + ']', W / 2, 218);\n\n  lab.setReadout(\n    (isInverse ? '逆变换(综合)' : '正变换(分解)') +\n    ' | 时域 N = ' + N + ' 点 (0~' + (N - 1) + ')' +\n    ' | 频域 Re X[ ] 与 Im X[ ] 各 N/2+1 = ' + halfPlusOne + ' 点 (0~' + (N / 2) + '，合计 ' + (halfPlusOne * 2) + ' 个实数)'\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "二、大小写符号约定、N 的选择与「实部 / 虚部」的真相",
      "paragraphs": [
        "在标准 DSP 符号体系中，**小写字母**代表时域信号（如 `x[ ]`、`y[ ]`、`z[ ]`），对应的 **大写字母** 代表其频域信号（如 `X[ ]`、`Y[ ]`、`Z[ ]`）。其中，频域 `X[ ]` 由两个长度为 `N/2 + 1` 的数组组成：**实部**记作 `Re X[ ]`（存放余弦波振幅），**虚部**记作 `Im X[ ]`（存放正弦波振幅）。为了兼容不区分大小写的早期编程语言，原书配套代码统一用 `XX[ ]` 存放时域信号，用 `REX[ ]` 和 `IMX[ ]` 存放频域信号。",
        "时域采样点数 `N` 可以是任意正整数，但工程上通常取 **2 的幂次**（如 128、256、512、1024，常见范围为 32 到 4096）。原因有两个：第一，数字存储器采用二进制寻址，2 的幂次最契合硬件存储；第二，计算 DFT 最快的高效算法——**快速傅里叶变换（FFT）** 通常要求 `N` 为 2 的幂次。另外，数组下标几乎总是从 `0` 到 `N-1`，而不是 `1` 到 `N`。",
        "初学时千万不要被 **“实部（Real part）”** 和 **“虚部（Imaginary part）”** 这两个吓人的名字误导！它们源于更复杂的复数 DFT（第 31 章内容），用来区分复数中的实数与虚数；而在 **实数 DFT** 中，一切运算都只用到普通实数。在进入复数领域之前，你只需把 `Re X[ ]` 当成 **余弦波振幅**，把 `Im X[ ]` 当成 **正弦波振幅** 即可。",
        "同样，不要被文献中常见的“DFT 把 N 个时域点变换成 N 个频域点”这句话搞糊涂——那句话指的是 **复数 DFT**，其中每个“点”是一个复数（包含实部和虚部两个数）。而我们现在学习的 **实数 DFT**，是把 `N` 个实数变换成两个各为 `N/2 + 1` 的实数数组。"
      ],
      "formula": {
        "expr": null,
        "explain": "记忆口诀：小写 x[ ] = 时域，大写 Re X[ ] = 余弦振幅，大写 Im X[ ] = 正弦振幅；实数 DFT 全程没有复数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：Re X[k]（余弦）与 Im X[k]（正弦）合成时域波形与听音",
      "instruction": "设定 N = 16，调节频率下标 k、余弦振幅 Re X[k] 与正弦振幅 Im X[k]，观察左侧频域数组与右侧时域采样点 x[0..15] 的对应关系，并点击播放听音。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "频率下标 k (0 ~ N/2)",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "reVal",
          "label": "Re X[k] (余弦振幅)",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imVal",
          "label": "Im X[k] (正弦振幅)",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showComp",
          "label": "显示余弦/正弦虚线分量",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成波形声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 16;\nconst bins = N / 2 + 1;\n\nlet audioCtx = null;\nlet osc = null;\nlet gainNode = null;\n\nfunction syncAudio() {\n  const playing = !!lab.values.play;\n  if (!playing && !audioCtx) return;\n\n  if (playing && !audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    osc = audioCtx.createOscillator();\n    gainNode = audioCtx.createGain();\n    osc.type = 'sine';\n    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);\n    osc.connect(gainNode);\n    gainNode.connect(audioCtx.destination);\n    osc.start();\n  }\n\n  if (audioCtx && osc && gainNode) {\n    if (playing && audioCtx.state === 'suspended') audioCtx.resume();\n    const now = audioCtx.currentTime;\n    const k = lab.values.k;\n    const mag = Math.hypot(lab.values.reVal, lab.values.imVal);\n    const freq = 130 * k;\n    const amp = playing ? Math.min(0.22, (mag / 14.15) * 0.22) : 0;\n    osc.frequency.setTargetAtTime(freq, now, 0.02);\n    gainNode.gain.setTargetAtTime(amp, now, 0.02);\n  }\n}\n\nfunction drawStemPlot(title, x0, y0, w, midY, activeK, val, color) {\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = color;\n  ctx.textAlign = 'left';\n  ctx.fillText(title, x0, y0);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x0, midY);\n  ctx.lineTo(x0 + w, midY);\n  ctx.stroke();\n\n  const stepX = w / (bins - 1);\n  for (let i = 0; i < bins; i++) {\n    const px = x0 + i * stepX;\n    const isAct = (i === activeK);\n    const v = isAct ? val : 0;\n    const py = midY - (v / 10) * 32;\n\n    ctx.strokeStyle = isAct ? color : 'rgba(255,255,255,0.18)';\n    ctx.lineWidth = isAct ? 2.5 : 1;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = isAct ? color : 'rgba(255,255,255,0.25)';\n    ctx.beginPath();\n    ctx.arc(px, py, isAct ? 4.5 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.font = '10px monospace';\n    ctx.fillStyle = isAct ? '#f8fafc' : '#64748b';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(i), px, midY + 42);\n  }\n}\n\nfunction draw() {\n  syncAudio();\n  const k = lab.values.k;\n  const re = lab.values.reVal;\n  const im = lab.values.imVal;\n  const showComp = !!lab.values.showComp;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 0; y <= H; y += 40) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n\n  drawStemPlot('Re X[0..8] (余弦振幅)', 22, 22, 224, 68, k, re, '#10b981');\n  drawStemPlot('Im X[0..8] (正弦振幅)', 22, 134, 224, 180, k, im, '#f59e0b');\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath();\n  ctx.moveTo(272, 14);\n  ctx.lineTo(272, H - 14);\n  ctx.stroke();\n\n  const tx = 296, tw = 400, tMid = 126, tAmp = 5.2;\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域合成信号 x[0..15] (N = 16, 当前频率 k = ' + k + ' 周期)', tx, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(tx, tMid);\n  ctx.lineTo(tx + tw, tMid);\n  ctx.stroke();\n\n  function plotCurve(fn, color, dashed, lw) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    const steps = 160;\n    for (let s = 0; s <= steps; s++) {\n      const n = (s / steps) * N;\n      const px = tx + (n / N) * tw;\n      const py = tMid - fn(n) * tAmp;\n      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showComp) {\n    plotCurve(n => re * Math.cos((2 * Math.PI * k * n) / N), 'rgba(16, 185, 129, 0.65)', true, 1.4);\n    plotCurve(n => im * Math.sin((2 * Math.PI * k * n) / N), 'rgba(245, 158, 11, 0.65)', true, 1.4);\n  }\n  plotCurve(n => re * Math.cos((2 * Math.PI * k * n) / N) + im * Math.sin((2 * Math.PI * k * n) / N), 'rgba(248, 250, 252, 0.55)', false, 1.8);\n\n  for (let n = 0; n < N; n++) {\n    const val = re * Math.cos((2 * Math.PI * k * n) / N) + im * Math.sin((2 * Math.PI * k * n) / N);\n    const px = tx + (n / N) * tw;\n    const py = tMid - val * tAmp;\n\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, tMid);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(px, py, 3.8, 0, Math.PI * 2);\n    ctx.fill();\n\n    if (n % 2 === 0 || n === N - 1) {\n      ctx.font = '10px monospace';\n      ctx.fillStyle = '#94a3b8';\n      ctx.textAlign = 'center';\n      ctx.fillText(String(n), px, 222);\n    }\n  }\n\n  const mag = Math.hypot(re, im).toFixed(2);\n  const audioHz = 130 * k;\n  lab.setReadout(\n    '频率索引 k = ' + k + ' | Re X[' + k + '] = ' + re + ' (余弦) | Im X[' + k + '] = ' + im + ' (正弦)' +\n    ' | 合成包络振幅 = ' + mag + ' | 试听音高 = ' + audioHz + ' Hz'\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【最常见 Bug：漏掉第 N/2 个点】N 点时域信号经实数 DFT 后，频域的 Re X[ ] 和 Im X[ ] 各有 N/2 + 1 个点（下标 0 到 N/2），不是 N/2 个点！例如 N = 128 时，频域数组长度是 65（0~64），分配数组少开 1 个元素就会越界或丢掉最高频。",
        "【数组下标从 0 开始】时域运行在 0 ~ N-1，频域运行在 0 ~ N/2，写循环边界条件时务必对齐这一规范。",
        "【别被名字吓到】在实数 DFT 中，Re X[ ] 和 Im X[ ] 里存的全是普通实数，分别代表余弦波振幅与正弦波振幅，完全不需要复数运算。",
        "【区分实数 DFT 与复数 DFT】文献中说“把 N 个点变成 N 个点”指的是复数 DFT（每个点含实部和虚部）；实数 DFT 则是把 N 个实数变成两段长度各为 N/2 + 1 的实数数组。",
        "【工程选型建议】时域长度 N 优先取 2 的幂次（通常在 32 到 4096 之间），既符合二进制内存寻址习惯，又能直接调用高效的 FFT 算法。"
      ]
    }
  ]
});
