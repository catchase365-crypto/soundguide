window.__BOOK_REGISTER_SECTION__("sec_235", {
  "title": "级联递归系数的合并与工程实现 (Combining Coefficients)",
  "intuition": "像拼积木一样把每个二阶节的系数通过卷积逐级合并为总滤波器，并用“+2 索引偏移、单位系统初始化、临时数组防覆盖”三大编码技巧保证算法既紧凑又零越界。",
  "blocks": [
    {
      "type": "concept",
      "heading": "逐级合成：从单级二阶节到完整滤波器",
      "paragraphs": [
        "在 Chebyshev-Butterworth 滤波器设计程序的主循环中，每次迭代只针对一对极点（即一个二阶滤波级）做计算。子程序 1000 会算出**当前这一级**的 5 个递归系数：`A0, A1, A2, B1, B2`。",
        "接下来在流程图第 10 步（程序第 360–440 行），程序需要把这 5 个新系数，合并到保存着“前面所有级联结果”的全局数组 `A[ ]` 和 `B[ ]` 中。第 1 次循环结束时，它们存着第 1 级的系数；第 2 次循环结束时，存着第 1、2 级串联后的总系数；循环全部跑完，**整个高阶滤波器的最终递归系数**就诞生了。"
      ],
      "formula": {
        "expr": "A_total(z) = ∏ (A0_p + A1_p·z⁻¹ + A2_p·z⁻²)",
        "explain": "多级串联在 z 域等同于传递函数相乘，落在时域/系数数组上，就是把每一级返回的 (A0, A1, A2) 与之前累积的 A[ ] 做离散卷积（B 系数同理）。"
      }
    },
    {
      "type": "concept",
      "heading": "工程技巧一：数组索引右移两位 (+2 Index Shift)",
      "paragraphs": [
        "合并系数时需要用到类似 `TA[i-1]` 和 `TA[i-2]` 的回溯读取。当循环从第 0 个系数 `a₀` 开始算起时，如果直接把 `a₀` 放在 `A[0]`，那么访问 `A[-1]` 和 `A[-2]` 就会立刻引发**数组下标越界**。",
        "为了让程序代码保持极致紧凑、省去繁琐的 `if` 边界判断，作者在循环期间把 `A[ ]` 和 `B[ ]` 的下标统一**向右平移两位**：`a₀` 暂存在 `A[2]`，`a₁` 与 `b₁` 暂存在 `A[3]` 与 `B[3]`，以此类推；而 `0` 号和 `1` 号元素充当安全的“零填充缓冲垫”。等到所有循环结束，再由第 12 块代码（480–520 行）把这两位偏移去掉，让最终系数规规矩矩回到 `a₀ → A[0]` 的标准位置。"
      ],
      "formula": {
        "expr": "A[i] = A0·TA[i] + A1·TA[i-1] + A2·TA[i-2]  (循环中 i ≥ 2)",
        "explain": "A[i] 为合并后的新系数，TA[ ] 为合并前的旧系数副本。由于循环内所有有效系数从下标 2 起步，i-1 和 i-2 最小只访问到下标 0，彻底杜绝负数越界。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：数组索引 +2 偏移与防越界可视化",
      "instruction": "拖动“当前计算下标”观察卷积窗口如何向左侧读取 i-1 与 i-2；试着关闭“+2 索引偏移保护”，亲眼看看下标 0 和 1 处发生的非法内存越界！",
      "controls": [
        {
          "type": "slider",
          "id": "stage",
          "label": "当前合并级数",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "targetIdx",
          "label": "正在计算的系数编号 (k)",
          "min": 0,
          "max": 6,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "shiftBy2",
          "label": "开启 +2 索引偏移保护",
          "value": true
        }
      ],
      "jsCode": "const stages = [\n  { A0: 0.25, A1: 0.50, A2: 0.25 },\n  { A0: 0.20, A1: 0.40, A2: 0.20 },\n  { A0: 0.15, A1: 0.30, A2: 0.15 }\n];\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const stageNum = lab.values.stage;\n  const k = lab.values.targetIdx;\n  const shifted = lab.values.shiftBy2;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Subtle background grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  // Compute TA (before current stage) and A (after current stage)\n  const off = shifted ? 2 : 0;\n  const arrLen = 9;\n  let A_cur = new Array(arrLen).fill(0);\n  A_cur[off] = 1.0; // identity init\n\n  let TA = A_cur.slice();\n  for (let s = 0; s < stageNum; s++) {\n    TA = A_cur.slice();\n    const st = stages[s];\n    const nextA = new Array(arrLen).fill(0);\n    for (let i = off; i < arrLen; i++) {\n      const v0 = TA[i] || 0;\n      const v1 = (i - 1 >= 0) ? TA[i - 1] : 0;\n      const v2 = (i - 2 >= 0) ? TA[i - 2] : 0;\n      nextA[i] = st.A0 * v0 + st.A1 * v1 + st.A2 * v2;\n    }\n    A_cur = nextA;\n  }\n\n  const curStage = stages[stageNum - 1];\n  const iTarget = k + off;\n  const slots = shifted ? [0,1,2,3,4,5,6,7,8] : [-2,-1,0,1,2,3,4,5,6];\n  const boxW = 64, boxH = 44, gap = 10;\n  const startX = (W - (slots.length * boxW + (slots.length - 1) * gap)) / 2;\n  const topY = 42;\n  const botY = 158;\n\n  // Titles\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('临时数组 TA[ ] (上一级累积结果，作为输入)', startX, 24);\n  ctx.fillText('目标数组 A[ ] (本级卷积合并后的结果)', startX, 142);\n\n  // Draw TA boxes\n  let hasOOB = false;\n  slots.forEach((memIdx, col) => {\n    const x = startX + col * (boxW + gap);\n    const isOOBSlot = memIdx < 0;\n    const isPadSlot = shifted && (memIdx === 0 || memIdx === 1);\n    const isRead0 = memIdx === iTarget;\n    const isRead1 = memIdx === iTarget - 1;\n    const isRead2 = memIdx === iTarget - 2;\n    const isRead = isRead0 || isRead1 || isRead2;\n\n    if (isRead && isOOBSlot) hasOOB = true;\n\n    ctx.fillStyle = isOOBSlot ? 'rgba(236,72,153,0.12)' : (isPadSlot ? 'rgba(245,158,11,0.12)' : 'rgba(30,41,59,0.85)');\n    ctx.strokeStyle = isRead ? (isOOBSlot ? '#ec4899' : '#38bdf8') : (isOOBSlot ? 'rgba(236,72,153,0.4)' : 'rgba(255,255,255,0.16)');\n    ctx.lineWidth = isRead ? 2.5 : 1;\n    ctx.beginPath();\n    ctx.roundRect ? ctx.roundRect(x, topY, boxW, boxH, 6) : ctx.rect(x, topY, boxW, boxH);\n    ctx.fill();\n    ctx.stroke();\n\n    // Index label\n    ctx.font = '11px monospace';\n    ctx.fillStyle = isOOBSlot ? '#ec4899' : (isPadSlot ? '#f59e0b' : '#94a3b8');\n    ctx.fillText('TA[' + memIdx + ']', x + 6, topY + 15);\n\n    // Value\n    ctx.font = 'bold 12px monospace';\n    if (isOOBSlot) {\n      ctx.fillStyle = '#ec4899';\n      ctx.fillText('越界!', x + 14, topY + 34);\n    } else {\n      ctx.fillStyle = isPadSlot ? '#f59e0b' : '#f8fafc';\n      ctx.fillText(TA[memIdx].toFixed(3), x + 8, topY + 34);\n    }\n  });\n\n  // Draw A boxes\n  slots.forEach((memIdx, col) => {\n    if (memIdx < 0) return;\n    const x = startX + col * (boxW + gap);\n    const isTarget = memIdx === iTarget;\n    const isPadSlot = shifted && (memIdx === 0 || memIdx === 1);\n\n    ctx.fillStyle = isTarget ? 'rgba(16,185,129,0.22)' : (isPadSlot ? 'rgba(245,158,11,0.08)' : 'rgba(30,41,59,0.85)');\n    ctx.strokeStyle = isTarget ? '#10b981' : 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = isTarget ? 2.5 : 1;\n    ctx.beginPath();\n    ctx.roundRect ? ctx.roundRect(x, botY, boxW, boxH, 6) : ctx.rect(x, botY, boxW, boxH);\n    ctx.fill();\n    ctx.stroke();\n\n    ctx.font = '11px monospace';\n    ctx.fillStyle = isTarget ? '#10b981' : (isPadSlot ? '#f59e0b' : '#94a3b8');\n    ctx.fillText('A[' + memIdx + ']', x + 6, botY + 15);\n\n    ctx.font = 'bold 12px monospace';\n    ctx.fillStyle = isTarget ? '#f8fafc' : '#cbd5e1';\n    ctx.fillText(A_cur[memIdx].toFixed(3), x + 8, botY + 34);\n  });\n\n  // Draw convolution arrows\n  const tCol = slots.indexOf(iTarget);\n  if (tCol >= 0) {\n    const tx = startX + tCol * (boxW + gap) + boxW / 2;\n    const weights = [\n      { offset: 0, label: '×A0(' + curStage.A0.toFixed(2) + ')' },\n      { offset: -1, label: '×A1(' + curStage.A1.toFixed(2) + ')' },\n      { offset: -2, label: '×A2(' + curStage.A2.toFixed(2) + ')' }\n    ];\n    weights.forEach((w) => {\n      const sIdx = iTarget + w.offset;\n      const sCol = slots.indexOf(sIdx);\n      if (sCol < 0) return;\n      const sx = startX + sCol * (boxW + gap) + boxW / 2;\n      const oob = sIdx < 0;\n      ctx.strokeStyle = oob ? '#ec4899' : '#38bdf8';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(sx, topY + boxH + 2);\n      ctx.lineTo(tx, botY - 4);\n      ctx.stroke();\n\n      ctx.font = '10px monospace';\n      ctx.fillStyle = oob ? '#ec4899' : '#38bdf8';\n      ctx.fillText(w.label, (sx + tx) / 2 - 26, (topY + boxH + botY) / 2 + (w.offset * 10) + 6);\n    });\n  }\n\n  // Warning banner if OOB\n  if (hasOOB) {\n    ctx.fillStyle = 'rgba(236,72,153,0.18)';\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(startX, H - 30, 320, 24);\n    ctx.strokeRect(startX, H - 30, 320, 24);\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('⚠ 危险：试图读取 TA[' + (iTarget - 2 < 0 ? iTarget - 2 : iTarget - 1) + '] 导致数组越界崩溃！', startX + 10, H - 14);\n    lab.setReadout('状态：下标越界！未开启 +2 偏移时，计算 a' + k + ' 会试图读取非法负下标。');\n  } else {\n    ctx.font = '12px sans-serif';\n    ctx.fillStyle = '#10b981';\n    const padMsg = shifted ? '✓ 安全：TA[0], TA[1] 为零填充缓冲，a' + k + ' 安全存入 A[' + iTarget + ']' : '✓ 当前窗口未越界（但在 k=0 或 k=1 时仍会越界）';\n    ctx.fillText(padMsg, startX, H - 12);\n    lab.setReadout('正在计算 a' + k + ' (存入 A[' + iTarget + ']) = ' + A_cur[iTarget].toFixed(4) + ' | ' + (shifted ? '已启用 +2 安全偏移' : '未启用偏移'));\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "工程技巧二与三：单位系统初始化与临时数组防覆盖",
      "paragraphs": [
        "第二个关键细节是**初始化不能全填零**（程序第 180–240 行）。第一次循环时，第 1 级的系数会和 `A[ ]`、`B[ ]` 里原本的值做卷积。如果数组一开始全是 0，那么任何数乘以 0 还是 0，整个数组就会永远死锁在全零状态！因此必须将它们初始化为**单位系统 (Identity System)**——即脉冲响应为 1 的直通系统（在带 +2 偏移的布局下，仅 `A[2] = 1`，其余全为 0）。",
        "第三个细节是使用**两个临时数组 `TA[ ]` 和 `TB[ ]`**。卷积计算新元素 `A[i]` 时，还要回头读取旧的 `TA[i-1]` 和 `TA[i-2]`。如果直接在原数组 `A[ ]` 上边算边覆盖，后面元素所需的旧值早就被改写面目全非了。先将旧系数备份进 `TA[ ]` 和 `TB[ ]`，就能放心地把新系数写回 `A[ ]` 和 `B[ ]`。"
      ],
      "formula": {
        "expr": "h_init[n] = δ[n]  ⇒  A[2] = 1, 其他为 0",
        "explain": "单位系统（冲激响应 δ[n]）是卷积运算的“乘法单位元 1”。第 1 级系数与它卷积后，正好原封不动地成为第 1 级自身的系数。"
      }
    },
    {
      "type": "concept",
      "heading": "收官归一化：让通带增益精确等于 1 (Block 13)",
      "paragraphs": [
        "所有极点对都合并完毕、并且去掉了 +2 的索引偏移后，滤波器虽然已经具备正确的形状，但它的总增益往往不是 1（通带可能被放大好几倍，也可能被严重衰减）。",
        "因此程序最后一步（第 13 块，540–670 行）利用前面学过的公式 33-7（低通）或 33-8（高通）算出当前增益 `G`，中间变量 `SA` 和 `SB` 分别代表全部 `a` 系数与 `b` 系数的总和（或交替符号和）。随后把**每一个 `a` 系数都除以 `G`**，就能在不改变零极点形状的前提下，把通带增益精确校准为 `1`（0 dB）。"
      ],
      "formula": {
        "expr": "G = SA / (1 - SB),   a_norm[k] = a[k] / G",
        "explain": "对于低通滤波器，SA = Σa[k] 为分子系数之和，SB = Σb[k] (k≥1) 为分母反馈系数之和；将全部前馈系数 a[k] 除以直流增益 G，即可实现单位通带增益。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：级联卷积合并、归一化与实时滤波听感",
      "instruction": "切换“级联极点级数”、开启或关闭“Block 13 增益归一化”以及尝试“错误示范：全零初始化”，观察频响曲线、系数柱状图的变化，并点击播放对比真实滤波听感！",
      "controls": [
        {
          "type": "slider",
          "id": "stages",
          "label": "级联二阶节数",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 3,
          "unit": " 级"
        },
        {
          "type": "toggle",
          "id": "initZero",
          "label": "错误示范：全零初始化 (A[]=0)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "normalize",
          "label": "开启 Block 13 增益归一化",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const stageSpecs = [\n  { A0: 0.15, A1: 0.30, A2: 0.15, B1: 0.8402, B2: -0.1883, Q: 0.5176 },\n  { A0: 0.15, A1: 0.30, A2: 0.15, B1: 0.9428, B2: -0.3333, Q: 0.7071 },\n  { A0: 0.15, A1: 0.30, A2: 0.15, B1: 1.1954, B2: -0.6906, Q: 1.9319 }\n];\n\nlet audioState = null;\n\nfunction computeFilter(numStages, initZero, doNorm) {\n  // Use +2 shift during cascade, then unshift\n  let A = new Array(11).fill(0);\n  let D = new Array(11).fill(0); // denominator polynomial 1 - B1 z^-1 - B2 z^-2\n  A[2] = initZero ? 0.0 : 1.0;\n  D[2] = 1.0;\n\n  for (let s = 0; s < numStages; s++) {\n    const st = stageSpecs[s];\n    const TA = A.slice();\n    const TD = D.slice();\n    const nextA = new Array(11).fill(0);\n    const nextD = new Array(11).fill(0);\n    for (let i = 2; i < 11; i++) {\n      nextA[i] = st.A0 * TA[i] + st.A1 * TA[i - 1] + st.A2 * TA[i - 2];\n      nextD[i] = 1.0 * TD[i] - st.B1 * TD[i - 1] - st.B2 * TD[i - 2];\n    }\n    A = nextA;\n    D = nextD;\n  }\n\n  // Block 12: remove +2 shift; Smith's b[k] = -D[k] for k >= 1\n  const maxOrder = numStages * 2;\n  const a = [];\n  const b = [];\n  for (let k = 0; k <= maxOrder; k++) {\n    a.push(A[k + 2]);\n    b.push(k === 0 ? 0 : -D[k + 2]);\n  }\n\n  const SA = a.reduce((acc, v) => acc + v, 0);\n  const SB = b.reduce((acc, v) => acc + v, 0);\n  const G = initZero ? 0 : (SA / (1 - SB));\n\n  if (doNorm && !initZero && Math.abs(G) > 1e-6) {\n    for (let k = 0; k < a.length; k++) a[k] /= G;\n  }\n  const finalSA = a.reduce((acc, v) => acc + v, 0);\n  const curGain = initZero ? 0 : (finalSA / (1 - SB));\n\n  return { a, b, SA, SB, rawG: G, curGain };\n}\n\nfunction magResponse(a, b, omega) {\n  let reNum = 0, imNum = 0;\n  for (let k = 0; k < a.length; k++) {\n    reNum += a[k] * Math.cos(k * omega);\n    imNum -= a[k] * Math.sin(k * omega);\n  }\n  let reDen = 1, imDen = 0;\n  for (let k = 1; k < b.length; k++) {\n    reDen -= b[k] * Math.cos(k * omega);\n    imDen += b[k] * Math.sin(k * omega);\n  }\n  const numMag = Math.hypot(reNum, imNum);\n  const denMag = Math.hypot(reDen, imDen);\n  return denMag > 1e-8 ? numMag / denMag : 0;\n}\n\nfunction syncAudio() {\n  const wantPlay = lab.values.play;\n  const numStages = lab.values.stages;\n  const initZero = lab.values.initZero;\n  const doNorm = lab.values.normalize;\n\n  if (!wantPlay) {\n    if (audioState) {\n      audioState.master.gain.setTargetAtTime(0, audioState.ctx.currentTime, 0.02);\n    }\n    return;\n  }\n\n  const ctx = lab.getAudioContext();\n  if (ctx.state === 'suspended') ctx.resume();\n\n  if (!audioState) {\n    const osc = ctx.createOscillator();\n    osc.type = 'sawtooth';\n    osc.frequency.value = 130;\n    const filters = stageSpecs.map((sp) => {\n      const f = ctx.createBiquadFilter();\n      f.type = 'lowpass';\n      f.frequency.value = 480;\n      f.Q.value = sp.Q;\n      return f;\n    });\n    const master = ctx.createGain();\n    master.gain.value = 0;\n    osc.connect(filters[0]);\n    filters[0].connect(filters[1]);\n    filters[1].connect(filters[2]);\n    filters[2].connect(master);\n    master.connect(ctx.destination);\n    osc.start();\n    audioState = { ctx, osc, filters, master };\n  }\n\n  const res = computeFilter(numStages, initZero, doNorm);\n  const now = audioState.ctx.currentTime;\n  for (let i = 0; i < 3; i++) {\n    const f = audioState.filters[i];\n    if (i < numStages) {\n      f.frequency.setTargetAtTime(480, now, 0.02);\n      f.Q.setTargetAtTime(stageSpecs[i].Q, now, 0.02);\n    } else {\n      f.frequency.setTargetAtTime(20000, now, 0.02);\n      f.Q.setTargetAtTime(0.707, now, 0.02);\n    }\n  }\n  const targetGain = initZero ? 0 : Math.min(0.16 * res.curGain, 0.55);\n  audioState.master.gain.setTargetAtTime(targetGain, now, 0.03);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const numStages = lab.values.stages;\n  const initZero = lab.values.initZero;\n  const doNorm = lab.values.normalize;\n\n  const res = computeFilter(numStages, initZero, doNorm);\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left plot: Frequency Response\n  const px = 46, py = 26, pw = 390, ph = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = py + (ph * i) / 4;\n    ctx.beginPath(); ctx.moveTo(px, y); ctx.lineTo(px + pw, y); ctx.stroke();\n    const x = px + (pw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x, py); ctx.lineTo(x, py + ph); ctx.stroke();\n  }\n\n  const maxY = 3.5;\n  // Unity gain line at 1.0\n  const yUnity = py + ph - (1.0 / maxY) * ph;\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.beginPath(); ctx.moveTo(px, yUnity); ctx.lineTo(px + pw, yUnity); ctx.stroke();\n  ctx.restore();\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1.0 (单位增益)', px + pw - 92, yUnity - 5);\n  ctx.fillText('3.5', 16, py + 10);\n  ctx.fillText('0.0', 16, py + ph);\n  ctx.fillText('频率响应 |H(ω)|  (0 → π)', px, py - 8);\n\n  // Magnitude curve\n  ctx.strokeStyle = initZero ? '#ec4899' : (doNorm ? '#10b981' : '#f59e0b');\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  const steps = 140;\n  for (let s = 0; s <= steps; s++) {\n    const omega = (Math.PI * s) / steps;\n    const mag = initZero ? 0 : magResponse(res.a, res.b, omega);\n    const cx = px + (pw * s) / steps;\n    const cy = py + ph - Math.min(mag / maxY, 1.05) * ph;\n    if (s === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n\n  // Right panel: Coefficient bars\n  const rx = 468, ry = 26, rw = 232, rh = 180;\n  ctx.fillStyle = 'rgba(15,23,42,0.6)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(rx, ry, rw, rh);\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('最终系数 (已去偏移: a0..a' + (numStages*2) + ')', rx + 10, ry - 8);\n\n  const rowH = 22;\n  for (let k = 0; k < res.a.length; k++) {\n    const y = ry + 12 + k * rowH;\n    ctx.font = '11px monospace';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('a' + k + ':' + res.a[k].toFixed(3), rx + 10, y + 12);\n    if (k > 0) {\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillText('b' + k + ':' + (res.b[k] >= 0 ? ' ' : '') + res.b[k].toFixed(3), rx + 116, y + 12);\n    } else {\n      ctx.fillStyle = '#64748b';\n      ctx.fillText('(' + (numStages*2) + ' 极点级联)', rx + 116, y + 12);\n    }\n  }\n\n  if (initZero) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('✖ 全零初始化导致输出永远为 0！', px + 70, py + ph - 20);\n  }\n\n  lab.setReadout('级数: ' + numStages + '级(' + (numStages*2) + '极点) | 未归一化增益 G=' + res.rawG.toFixed(3) + ' | 当前DC增益=' + res.curGain.toFixed(3) + ' (SA=' + res.SA.toFixed(3) + ', SB=' + res.SB.toFixed(3) + ')');\n  syncAudio();\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "千万别全零初始化：在级联卷积循环开始前，A[ ] 必须初始化为单位脉冲系统（偏移后即 A[2] = 1），否则全零与任何级相乘结果永远是 0。",
        "用空间换代码简洁：在合并循环中用 +2 索引偏移保护 i-1 / i-2 不越界，并用临时数组 TA[ ] / TB[ ] 存旧值防覆盖，循环结束再统一消去偏移。",
        "别忘了最后一步归一化：多级级联后的总通带增益往往偏离 1，必须用 Block 13 求出 SA、SB 与增益 G，并将全部 a 系数除以 G。"
      ]
    }
  ]
});
