window.__BOOK_REGISTER_SECTION__("sec_066", {
  "title": "输入端算法：从分解与叠加理解卷积 (The Input Side Algorithm)",
  "intuition": "把输入信号的每一个采样点单独拆成脉冲，让它激发出系统脉冲响应的“缩放与平移”副本，最后把所有副本叠加在一起，就是卷积的输出。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从“输入端视角”看卷积：分解、响应与合成",
      "paragraphs": [
        "离散信号处理（DSP）最核心的思想可以概括为三步：**分解输入（Decompose）**、**逐个通过系统**、**合成输出（Synthesize）**。图 6-5 展示了一个经典的卷积例子：一个 **9 点**的输入信号 `x[n]`（下标 `0~8`）通过一个具有 **4 点**脉冲响应 `h[n]`（下标 `0~3`）的系统，最终得到一个 `9 + 4 - 1 = 12` 点的输出信号 `y[n]`（下标 `0~11`）。",
        "**输入端算法（The Input Side Algorithm）**直接把这三步落地：输入信号中的每一个采样点 `x[k]`，都会独立在输出端贡献一份**经过缩放和平移的脉冲响应**。比如第 4 个输入点 `x[4] = 1.4` 可分解为冲激 `1.4·δ[n-4]`，它通过系统后产生的输出分量就是 `1.4·h[n-4]`——也就是把 `h[n]` 整体放大 1.4 倍并向右平移 4 个点。为了与其他分量对齐相加，还必须在下标 `0~3` 和 `8~11` 处补上占位的零（图 6-6 中用**方块**表示来自脉冲响应的有效数据点，用**菱形**表示补位的零）。",
        "再看最后一个采样点 `x[8] = -0.5`，它产生的分量是 `-0.5·h[n-8]`，在 `0~7` 位置全部补零，且因为系数是负数，脉冲响应会上下翻转并缩半；而 `x[0] = 0` 和 `x[7] = 0` 这两个零值采样点，贡献的分量则全都是零。把这 9 个长度均为 12 的输出分量逐点相加，就合成了最终的 `y[n]`。"
      ],
      "formula": {
        "expr": "y[n] = Σ x[k] · h[n - k]   (k 从 0 到 M-1)",
        "explain": "n 是输出信号下标；k 遍历输入信号的每一个点（共 M 个）；x[k] 决定第 k 份脉冲响应的缩放倍率（可正可负）；h[n-k] 表示把系统脉冲响应向右平移 k 个采样点；最后用 Σ 把所有输入点各自激发出的数据分量全部相加。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：单点脉冲分量拆解与叠加（复现 Fig. 6-5 & 6-6）",
      "instruction": "拖动「当前输入样本下标 k」滑块观察不同输入点（如 k=4、k=8 或 k=0, 7）激发出的缩放平移分量（方块=有效响应，菱形=补位零），并尝试调节「样本缩放倍率」看它如何实时改变合成输出 y[n]。",
      "controls": [
        {
          "type": "slider",
          "id": "sampleIdx",
          "label": "当前输入样本下标 k",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "gain",
          "label": "样本 x[k] 缩放倍率",
          "min": -2,
          "max": 2,
          "step": 0.2,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showTotal",
          "label": "显示全部 9 个分量的总合成输出 y[n]",
          "value": true
        }
      ],
      "jsCode": "const xBase = [0, -1.0, -1.2, 2.0, 1.4, 1.4, 0.6, 0, -0.5];\nconst h = [1.0, -0.5, -0.35, -0.2];\n\nfunction drawGrid(ctx, x0, y0, w, hBox, cols, zeroY, scaleY) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, hBox);\n  ctx.beginPath();\n  ctx.moveTo(x0, zeroY);\n  ctx.lineTo(x0 + w, zeroY);\n  ctx.stroke();\n  for (let v = -2; v <= 2; v += 2) {\n    if (v === 0) continue;\n    const yy = zeroY - v * scaleY;\n    ctx.beginPath();\n    ctx.setLineDash([3, 3]);\n    ctx.moveTo(x0, yy);\n    ctx.lineTo(x0 + w, yy);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n}\n\nfunction drawSquare(ctx, cx, cy, r, color) {\n  ctx.fillStyle = color;\n  ctx.fillRect(cx - r, cy - r, r * 2, r * 2);\n}\n\nfunction drawDiamond(ctx, cx, cy, r, color) {\n  ctx.fillStyle = color;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy - r);\n  ctx.lineTo(cx + r, cy);\n  ctx.lineTo(cx, cy + r);\n  ctx.lineTo(cx - r, cy);\n  ctx.closePath();\n  ctx.fill();\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const k = Math.round(lab.values.sampleIdx);\n  const gain = Number(lab.values.gain);\n  const showTotal = Boolean(lab.values.showTotal);\n\n  const x = xBase.map((v, i) => (i === k ? Number((v * gain).toFixed(2)) : v));\n  const yTotal = new Array(12).fill(0);\n  for (let i = 0; i < x.length; i++) {\n    for (let j = 0; j < h.length; j++) {\n      yTotal[i + j] += x[i] * h[j];\n    }\n  }\n\n  const comp = new Array(12).fill(0);\n  for (let j = 0; j < h.length; j++) {\n    comp[k + j] = x[k] * h[j];\n  }\n\n  const sY = 13;\n  ctx.font = '11px monospace';\n\n  // 1. x[n] top-left\n  drawGrid(ctx, 16, 18, 240, 92, 9, 64, sY);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('输入信号 x[n] (9点)', 22, 13);\n  for (let i = 0; i < 9; i++) {\n    const cx = 34 + i * 25;\n    const cy = 64 - x[i] * sY;\n    const isCurr = i === k;\n    ctx.strokeStyle = isCurr ? '#f59e0b' : 'rgba(248,250,252,0.45)';\n    ctx.lineWidth = isCurr ? 2 : 1;\n    ctx.beginPath();\n    ctx.moveTo(cx, 64);\n    ctx.lineTo(cx, cy);\n    ctx.stroke();\n    drawSquare(ctx, cx, cy, isCurr ? 4 : 3, isCurr ? '#f59e0b' : '#f8fafc');\n    ctx.fillStyle = isCurr ? '#f59e0b' : 'rgba(255,255,255,0.5)';\n    ctx.fillText(String(i), cx - 3, 108);\n  }\n\n  // 2. h[n] bottom-left\n  drawGrid(ctx, 16, 134, 240, 92, 4, 180, sY);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('脉冲响应 h[n] (4点)', 22, 129);\n  for (let j = 0; j < 4; j++) {\n    const cx = 42 + j * 36;\n    const cy = 180 - h[j] * sY;\n    ctx.strokeStyle = 'rgba(56,189,248,0.6)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(cx, 180);\n    ctx.lineTo(cx, cy);\n    ctx.stroke();\n    drawSquare(ctx, cx, cy, 3.5, '#38bdf8');\n    ctx.fillStyle = 'rgba(255,255,255,0.55)';\n    ctx.fillText(String(j), cx - 3, 224);\n  }\n  ctx.fillStyle = 'rgba(255,255,255,0.5)';\n  ctx.fillText('方块 = 脉冲响应点', 150, 152);\n  drawSquare(ctx, 142, 148, 3, '#f59e0b');\n  ctx.fillText('菱形 = 补位零', 150, 170);\n  drawDiamond(ctx, 142, 166, 3.5, 'rgba(255,255,255,0.5)');\n\n  // 3. Component x[k]*h[n-k] top-right\n  drawGrid(ctx, 280, 18, 424, 92, 12, 64, sY);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('当前分量: x[' + k + ']·h[n-' + k + ']  (x[' + k + '] = ' + x[k].toFixed(2) + ')', 286, 13);\n  for (let n = 0; n < 12; n++) {\n    const cx = 304 + n * 34;\n    const inRange = n >= k && n < k + 4;\n    const cy = 64 - comp[n] * sY;\n    if (inRange) {\n      ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(cx, 64);\n      ctx.lineTo(cx, cy);\n      ctx.stroke();\n      drawSquare(ctx, cx, cy, 4, '#f59e0b');\n    } else {\n      drawDiamond(ctx, cx, 64, 3.5, 'rgba(255,255,255,0.38)');\n    }\n    ctx.fillStyle = inRange ? '#f59e0b' : 'rgba(255,255,255,0.45)';\n    ctx.fillText(String(n), cx - 4, 108);\n  }\n\n  // 4. Output y[n] bottom-right\n  drawGrid(ctx, 280, 134, 424, 92, 12, 180, sY);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText(showTotal ? '总合成输出 y[n] (亮绿=总和, 琥珀=当前分量贡献)' : '仅显示当前分量对 y[n] 的贡献', 286, 129);\n  for (let n = 0; n < 12; n++) {\n    const cx = 304 + n * 34;\n    const val = showTotal ? yTotal[n] : comp[n];\n    const cy = 180 - val * sY;\n    const inRange = n >= k && n < k + 4;\n    ctx.strokeStyle = showTotal ? 'rgba(16,185,129,0.6)' : 'rgba(245,158,11,0.6)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(cx, 180);\n    ctx.lineTo(cx, cy);\n    ctx.stroke();\n    drawSquare(ctx, cx, cy, 3.5, showTotal ? '#10b981' : '#f59e0b');\n    if (showTotal && inRange && Math.abs(comp[n]) > 1e-6) {\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 1.5;\n      ctx.strokeRect(cx - 5.5, cy - 5.5, 11, 11);\n    }\n    ctx.fillStyle = inRange ? '#10b981' : 'rgba(255,255,255,0.45)';\n    ctx.fillText(String(n), cx - 4, 224);\n  }\n\n  const contribStr = h.map((hv, j) => 'y[' + (k + j) + ']+=' + (x[k] * hv).toFixed(2)).join('  ');\n  lab.setReadout('x[' + k + '] = ' + x[k].toFixed(2) + '  |  影响输出区间 n=' + k + '..' + (k + 3) + '  |  ' + contribStr);\n});"
    },
    {
      "type": "concept",
      "heading": "二、卷积的交换律：数学完全等价，物理意义却截然不同",
      "paragraphs": [
        "在刚才的例子中，`x[n]` 是 9 个点，`h[n]` 是 4 个点。如果我们把它们**反过来**（如图 6-7 所示），让 `x[n]` 变成那个 4 点波形，而让 `h[n]` 变成那个 9 点波形——结果会怎样？输出信号 `y[n]` 竟然与图 6-5 **完全一模一样**！",
        "这并不是巧合，而是卷积的**交换律（Commutative Property）**：数学运算完全不在乎谁是“输入信号”、谁是“脉冲响应”，它只关心“有两个信号在做卷积”。在图 6-5 中，我们把 9 份 4 点长的小波加在一起；而在图 6-7 中，我们把 4 份 9 点长的长波加在一起，殊途同归。",
        "但千万注意**数学与物理的边界**：在系统理论中，输入信号（比如一段录音）和系统脉冲响应（比如一个滤波器的电路特性）是完全不同的两种物理实体，把它们互换在物理上**没有任何意义**。交换律的真正价值，是给我们提供了一个**化简与推导数学公式的强力工具**。"
      ],
      "formula": {
        "expr": "a[n] * b[n] = b[n] * a[n]",
        "explain": "注意在数学公式中，星号 * 代表卷积运算（不是乘法）。公式表明调换两个信号在卷积中的先后顺序，最终结果完全相同。"
      }
    },
    {
      "type": "concept",
      "heading": "三、代码里的灵魂三步：Y[I%+J%] = Y[I%+J%] + X[I%]*H[J%]",
      "paragraphs": [
        "理解了物理图景，再来看表 6-1 的算法代码（将 81 点的 `X[0..80]` 与 31 点的 `H[0..30]` 卷积为 111 点的 `Y[0..110]`）。程序结构是卷积算法标志性的**双层嵌套循环**：外层循环 `I% = 0 TO 80` 依次取出每一个输入采样点，内层循环 `J% = 0 TO 30` 则针对该输入点生成一份缩放、平移后的脉冲响应，并累加到输出数组 `Y[ ]` 中。",
        "第 240 行的核心语句 `Y[I%+J%] = Y[I%+J%] + X[I%]*H[J%]` 极容易绕晕新手。假设循环刚走到一半，正在处理 `X[40]`（即 `I% = 40`），内层循环实际上同时完成了三件事：\n1. **缩放（Scale）**：`X[40] * H[J%]`，用当前输入样本值乘以脉冲响应；\n2. **平移（Shift）**：`Y[40 + J%]`，通过把 `I%` 加到输出下标里，把整段脉冲响应向右平移 40 个点；\n3. **累加合成（Accumulate）**：`Y[40 + J%] + ...`，把新算出来的分量加到数组原有数值上，而不是直接覆盖——这也正是第 180~200 行**必须提前把 `Y[ ]` 全部清零**的原因。",
        "此外还有两个细节陷阱：一是表 6-1 中的数组名用了大写 `X, H, Y`（因为老式 BASIC 不支持小写变量），而在标准 DSP 约定中，小写表示时域信号、大写通常保留给频域信号；二是**星号 `*` 在代码里代表乘法，在数学公式里代表卷积**，而在文本注释里两者皆有可能，阅读时务必结合上下文区分。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：嵌套循环累加过程、交换律验证与回声听感",
      "instruction": "拖动「外层循环进度 I%」逐步观看 Y[I%+J%] 的累加生长过程；打开「交换 x[n] 与 h[n]」验证最终输出完全不变；点击「播放声音对比」用耳朵对比原始脉冲输入与卷积合成输出（每次输入激发多声道缩放平移脉冲）。",
      "controls": [
        {
          "type": "slider",
          "id": "stepI",
          "label": "外层循环进度 I%",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "swapSignals",
          "label": "交换 x[n] 与 h[n]（验证交换律）",
          "value": false
        },
        {
          "type": "toggle",
          "id": "listenConvolved",
          "label": "声音对比：开=卷积输出 y[n] / 关=原始输入 x[n]",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放声音对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const sigA = [0, -1.0, -1.2, 2.0, 1.4, 1.4, 0.6, 0, -0.5];\nconst sigB = [1.0, -0.5, -0.35, -0.2];\n\nlet audioSource = null;\nlet audioGain = null;\nlet lastAudioSig = '';\n\nfunction buildAudioBuffer(actx, sigArr) {\n  const sr = actx.sampleRate;\n  const len = Math.floor(sr * 1.0);\n  const buf = actx.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n  const stepSamples = Math.floor(sr * 0.065);\n  const burstLen = Math.floor(sr * 0.028);\n  for (let idx = 0; idx < sigArr.length; idx++) {\n    const amp = sigArr[idx];\n    if (Math.abs(amp) < 1e-4) continue;\n    const start = Math.floor(sr * 0.05) + idx * stepSamples;\n    const freq = amp >= 0 ? 520 : 330;\n    for (let s = 0; s < burstLen && start + s < len; s++) {\n      const env = 0.5 * (1 - Math.cos((2 * Math.PI * s) / burstLen));\n      data[start + s] += amp * 0.14 * env * Math.sin((2 * Math.PI * freq * s) / sr);\n    }\n  }\n  return buf;\n}\n\nfunction stopAudio() {\n  if (audioSource) {\n    try { audioSource.stop(); } catch (e) {}\n    audioSource.disconnect();\n    audioSource = null;\n  }\n  if (audioGain) {\n    audioGain.disconnect();\n    audioGain = null;\n  }\n}\n\nfunction syncAudio(X, yFull) {\n  const play = Boolean(lab.values.play);\n  const listenConv = Boolean(lab.values.listenConvolved);\n  const swap = Boolean(lab.values.swapSignals);\n  if (!play) {\n    stopAudio();\n    lastAudioSig = '';\n    return;\n  }\n  const key = String(swap) + '_' + String(listenConv);\n  if (audioSource && key === lastAudioSig) return;\n\n  const actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n  stopAudio();\n\n  const buf = buildAudioBuffer(actx, listenConv ? yFull : X);\n  const src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  const g = actx.createGain();\n  g.gain.value = 0.85;\n  src.connect(g);\n  g.connect(actx.destination);\n  src.start();\n  audioSource = src;\n  audioGain = g;\n  lastAudioSig = key;\n}\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const swap = Boolean(lab.values.swapSignals);\n  const X = swap ? sigB : sigA;\n  const Himp = swap ? sigA : sigB;\n  const maxI = X.length - 1;\n  const currI = Math.min(Math.round(lab.values.stepI), maxI);\n\n  const yFull = new Array(12).fill(0);\n  const yPrev = new Array(12).fill(0);\n  const yCurrSlice = new Array(12).fill(0);\n\n  for (let i = 0; i < X.length; i++) {\n    for (let j = 0; j < Himp.length; j++) {\n      const prod = X[i] * Himp[j];\n      yFull[i + j] += prod;\n      if (i < currI) yPrev[i + j] += prod;\n      if (i === currI) yCurrSlice[i + j] += prod;\n    }\n  }\n\n  syncAudio(X, yFull);\n\n  ctx.font = '11px monospace';\n\n  // Top-left: X[i]\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(16, 16, 224, 88);\n  ctx.beginPath(); ctx.moveTo(16, 60); ctx.lineTo(240, 60); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('输入 X[0..' + maxI + '] (' + X.length + '点)', 22, 12);\n  for (let i = 0; i < X.length; i++) {\n    const cx = 32 + i * 23;\n    const cy = 60 - X[i] * 12;\n    const col = i === currI ? '#f59e0b' : (i < currI ? '#38bdf8' : 'rgba(255,255,255,0.22)');\n    ctx.strokeStyle = col;\n    ctx.lineWidth = i === currI ? 2 : 1.5;\n    ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx, cy); ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.fillRect(cx - 3, cy - 3, 6, 6);\n  }\n\n  // Top-mid: H[j]\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(252, 16, 224, 88);\n  ctx.beginPath(); ctx.moveTo(252, 60); ctx.lineTo(476, 60); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('响应 H[0..' + (Himp.length - 1) + '] (' + Himp.length + '点)', 258, 12);\n  for (let j = 0; j < Himp.length; j++) {\n    const cx = 268 + j * 23;\n    const cy = 60 - Himp[j] * 12;\n    ctx.strokeStyle = 'rgba(236,72,153,0.7)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(cx, 60); ctx.lineTo(cx, cy); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.fillRect(cx - 3, cy - 3, 6, 6);\n  }\n\n  // Top-right: Loop State Panel\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(488, 16, 216, 88);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('Table 6-1 内层循环状态', 496, 32);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('I% = ' + currI + '  (X[' + currI + '] = ' + X[currI].toFixed(2) + ')', 496, 50);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('Y[' + currI + '+J%] += X[' + currI + '] * H[J%]', 496, 68);\n  ctx.fillStyle = 'rgba(255,255,255,0.65)';\n  ctx.fillText('写入区间: Y[' + currI + '..' + (currI + Himp.length - 1) + ']', 496, 88);\n\n  // Bottom: Y[0..11] accumulation\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(16, 124, 688, 102);\n  ctx.beginPath(); ctx.moveTo(16, 174); ctx.lineTo(704, 174); ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('输出累加器 Y[0..11]  (虚线框=最终目标 y[n]，绿点=I%<' + currI + ' 已累加，琥珀框=本轮 I%=' + currI + ' 叠加后的新值)', 22, 119);\n\n  const sY = 14;\n  for (let n = 0; n < 12; n++) {\n    const cx = 48 + n * 56;\n    const yTarget = 174 - yFull[n] * sY;\n    const yAfter = 174 - (yPrev[n] + yCurrSlice[n]) * sY;\n    const yBefore = 174 - yPrev[n] * sY;\n    const activeWrite = n >= currI && n < currI + Himp.length;\n\n    // Final envelope marker\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(cx - 5, yTarget - 5, 10, 10);\n\n    // Previous accumulated stem\n    ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(cx, 174); ctx.lineTo(cx, yBefore); ctx.stroke();\n\n    // New delta segment if active\n    if (activeWrite && Math.abs(yCurrSlice[n]) > 1e-6) {\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 3;\n      ctx.beginPath(); ctx.moveTo(cx, yBefore); ctx.lineTo(cx, yAfter); ctx.stroke();\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillRect(cx - 4, yAfter - 4, 8, 8);\n    } else {\n      ctx.fillStyle = '#10b981';\n      ctx.fillRect(cx - 3.5, yAfter - 3.5, 7, 7);\n    }\n\n    ctx.fillStyle = activeWrite ? '#f59e0b' : 'rgba(255,255,255,0.55)';\n    ctx.fillText(String(n), cx - 4, 222);\n  }\n\n  const modeLabel = swap ? '已交换 (4点*9点)' : '原设定 (9点*4点)';\n  const audioDesc = lab.values.play ? (lab.values.listenConvolved ? '正在播放: 卷积输出 y[n]' : '正在播放: 原始输入 x[n]') : '音频已暂停';\n  lab.setReadout(modeLabel + '  |  外层循环 I%=' + currI + '/' + maxI + '  |  y[3]最终值=' + yFull[3].toFixed(2) + '  |  ' + audioDesc);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "输出长度铁律：M 点输入信号与 N 点脉冲响应卷积，输出长度为 M + N - 1（例如 9 + 4 - 1 = 12，81 + 31 - 1 = 111），数组声明少 1 个点就会越界。",
        "累加前必须清零：输入端算法依赖 Y[I%+J%] += X[I%]*H[J%] 把各分量的贡献逐步相加，运行双层循环前务必把输出数组 Y[ ] 全部初始化为 0。",
        "牢记第 240 行三动作：乘法 X[I%]*H[J%] 是“缩放”，下标 I%+J% 是“右移”，加回 Y[I%+J%] 是“叠加合成”。",
        "看清上下文的星号 * ：在数学公式里 * 表示卷积，在程序代码里 * 表示乘法；交换律只作为数学推导工具使用，物理上不可把输入信号和系统脉冲响应混为一谈。"
      ]
    }
  ]
});
