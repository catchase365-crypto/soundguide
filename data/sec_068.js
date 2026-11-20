window.__BOOK_REGISTER_SECTION__("sec_068", {
  "title": "加权输入之和：换个视角看卷积 (The Sum of Weighted Inputs)",
  "intuition": "别再只把脉冲响应看成叠加的回声——在数字滤波时，把它当作一组「加权系数」，每个输出样本本质上就是对周边一串输入样本做的一次「加权平均」。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从「脉冲响应」切换到「加权系数」视角",
      "paragraphs": [
        "在前面的章节中，我们已经知道线性系统的特性完全由它的 **脉冲响应 (Impulse Response)** 决定：从输入端看，每个输入点贡献一个缩放平移后的脉冲响应；从输出端看，每个输出点等于一串输入点乘以**翻转后的脉冲响应**再求和。",
        "但这套纯数学推演还不足以解释卷积为什么在信号处理中如此重要。现在请你暂且忘掉框图里装的是“脉冲响应”，直接把它看作一组嵌入在系统里的 **加权系数 (Weighing Coefficients)**。在这个视角下，输出信号中的每一个样本，都等于输入信号中某一片区域样本的 **加权输入之和 (Sum of Weighted Inputs)**。",
        "举个最直观的例子：假设系统里有 `10` 个加权系数，且每个系数的值都是 `1/10` (`0.1`)。那么你甚至不需要去想脉冲响应长什么样，一眼就能看穿这个系统的物理意义——**它把每 10 个连续的输入样本求平均，作为当前输出样本的值**，也就是一个经典的 10 点滑动平均滤波器。"
      ],
      "formula": {
        "expr": "y[n] = Σ h[k] · x[n - k]",
        "explain": "y[n] 是第 n 个输出样本；x[n - k] 是第 n 个点附近的各输入样本；h[k] 在此视角下就是赋予对应输入样本的「加权系数」。当 10 个 h[k] 均为 0.1 时，y[n] 就是过去 10 个输入的算术平均值。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：加权平均平滑波形与滤波听感对比",
      "instruction": "拖动「加权系数个数 N」滑块改变均分权重 1/N 的窗口大小，观察高频毛刺如何被抹平；点击播放按钮可实时对比不同 N 值下的低通声音质感。",
      "controls": [
        {
          "type": "slider",
          "id": "nWeights",
          "label": "加权系数个数 N (权重均为 1/N)",
          "min": 1,
          "max": 15,
          "step": 1,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "高频毛刺噪声强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 60,
          "unit": "%"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放加权滤波声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst SAMPLE_COUNT = 160;\nconst baseWave = new Float32Array(SAMPLE_COUNT);\nconst noiseWave = new Float32Array(SAMPLE_COUNT);\nfor (let i = 0; i < SAMPLE_COUNT; i++) {\n  baseWave[i] = 0.55 * Math.sin(2 * Math.PI * 2.5 * i / SAMPLE_COUNT) + 0.2 * Math.sin(2 * Math.PI * 5 * i / SAMPLE_COUNT);\n  const s = Math.sin(i * 12.9898) * 43758.5453;\n  noiseWave[i] = ((s - Math.floor(s)) * 2 - 1) * 0.45;\n}\n\nlet audioSrc = null;\nlet audioGain = null;\nlet rawAudio = null;\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === \"suspended\") ac.resume();\n  const sr = ac.sampleRate;\n  const len = sr;\n  if (!rawAudio || rawAudio.length !== len) {\n    rawAudio = new Float32Array(len);\n  }\n  const N = Math.max(1, Math.round(lab.values.nWeights));\n  const nl = lab.values.noiseLevel / 100;\n  const buf = ac.createBuffer(1, len, sr);\n  const out = buf.getChannelData(0);\n  const step = 3;\n  const effN = N * step;\n  let acc = 0;\n  for (let i = 0; i < len; i++) {\n    const t = i / sr;\n    const saw = 2 * ((t * 220) % 1) - 1;\n    const r = Math.sin(i * 12.9898) * 43758.5453;\n    const nz = (r - Math.floor(r)) * 2 - 1;\n    const val = saw * 0.4 + nz * 0.6 * nl;\n    rawAudio[i] = val;\n    acc += val;\n    if (i >= effN) acc -= rawAudio[i - effN];\n    const denom = i < effN ? (i + 1) : effN;\n    out[i] = acc / denom;\n  }\n  stopAudio();\n  if (!audioGain) {\n    audioGain = ac.createGain();\n    audioGain.gain.value = 0.25;\n    audioGain.connect(ac.destination);\n  }\n  audioSrc = ac.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(audioGain);\n  audioSrc.start();\n}\n\nfunction draw() {\n  const N = Math.max(1, Math.round(lab.values.nWeights));\n  const nl = lab.values.noiseLevel / 100;\n  const xSig = new Float32Array(SAMPLE_COUNT);\n  const ySig = new Float32Array(SAMPLE_COUNT);\n  for (let i = 0; i < SAMPLE_COUNT; i++) {\n    xSig[i] = baseWave[i] + noiseWave[i] * nl;\n  }\n  for (let i = 0; i < SAMPLE_COUNT; i++) {\n    let sum = 0;\n    for (let k = 0; k < N; k++) {\n      if (i - k >= 0) sum += xSig[i - k] / N;\n    }\n    ySig[i] = sum;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 60) {\n    ctx.beginPath(); ctx.moveTo(gx, 10); ctx.lineTo(gx, H - 20); ctx.stroke();\n  }\n  for (let gy = 30; gy < H - 20; gy += 45) {\n    ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke();\n  }\n\n  const midY = H * 0.54;\n  const scaleY = 75;\n  const plotX0 = 24;\n  const plotW = W - 48;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.2)\";\n  ctx.beginPath(); ctx.moveTo(plotX0, midY); ctx.lineTo(plotX0 + plotW, midY); ctx.stroke();\n\n  ctx.strokeStyle = \"rgba(56, 189, 248, 0.55)\";\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i < SAMPLE_COUNT; i++) {\n    const px = plotX0 + (i / (SAMPLE_COUNT - 1)) * plotW;\n    const py = midY - xSig[i] * scaleY;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2.8;\n  ctx.beginPath();\n  for (let i = 0; i < SAMPLE_COUNT; i++) {\n    const px = plotX0 + (i / (SAMPLE_COUNT - 1)) * plotW;\n    const py = midY - ySig[i] * scaleY;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const boxW = 196, boxH = 74, boxX = W - boxW - 18, boxY = 12;\n  ctx.fillStyle = \"rgba(15, 23, 42, 0.88)\";\n  ctx.strokeStyle = \"rgba(245, 158, 11, 0.6)\";\n  ctx.lineWidth = 1;\n  ctx.fillRect(boxX, boxY, boxW, boxH);\n  ctx.strokeRect(boxX, boxY, boxW, boxH);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.font = \"11px monospace\";\n  ctx.fillText(\"权重 h[k] = 1/\" + N + \" (\" + (1 / N).toFixed(2) + \")\", boxX + 8, boxY + 16);\n\n  const barAreaW = boxW - 20;\n  const barBaseY = boxY + boxH - 12;\n  const maxBarH = 34;\n  const barStep = barAreaW / 15;\n  for (let k = 0; k < N; k++) {\n    const bx = boxX + 10 + k * barStep;\n    const bh = (1 / N) * maxBarH * 2.2;\n    const clampedH = Math.min(maxBarH, Math.max(4, bh));\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.fillRect(bx, barBaseY - clampedH, Math.max(3, barStep - 3), clampedH);\n  }\n\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"— 含噪输入 x[n]\", 26, 22);\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"— 加权平均输出 y[n]\", 145, 22);\n\n  lab.setReadout(\"窗口点数 N = \" + N + \" | 每个输入权重 = 1/\" + N + \" ≈ \" + (1 / N).toFixed(3) + \" | 权重和 = 1.000 (N 越大高频抑制越强)\");\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "对称加权与「负索引」的必然性",
      "paragraphs": [
        "一旦你习惯了用「加权输入之和」来思考，思维就会立刻打开：为什么加权系数一定要局限于当前输出样本的 **左侧**（过去样本）呢？在原书图 6-8 的例子里，`y[6]` 仅仅由它左侧的 `x[3]`、`x[4]`、`x[5]` 和 `x[6]` 计算得出。但如果我们做的是离线数据分析或图像处理，完全可以**以当前输出样本为中心，左右对称地选取权重**。",
        "例如，为了计算 `y[6]`，我们可以让它对称地接收来自 `x[4]`、`x[5]`、`x[6]`、`x[7]`、`x[8]` 这 5 个相邻输入的贡献。按照标准卷积下标规则 `h[n - k]` 来反推，这 5 个输入所对应的加权系数必须存放在 `h[2]`、`h[1]`、`h[0]`、`h[-1]` 和 `h[-2]` 中。",
        "这揭示了一个非常关键的结论：**选择对称的加权系数，必然要求脉冲响应 `h` 使用负索引 (Negative Indexes)**。从数学本质上讲，脉冲响应视角和加权系数视角是同一个卷积公式的一体两面——有时你需要从「信号受到冲击后如何拖尾」去理解系统，有时你必须从「每个点周围如何加权」去设计滤波器，优秀的工程师必须学会在这两种视角间无缝切换。"
      ],
      "formula": {
        "expr": "y[6] = h[2]·x[4] + h[1]·x[5] + h[0]·x[6] + h[-1]·x[7] + h[-2]·x[8]",
        "explain": "当采用以 n=6 为中心的 5 点对称加权时，索引大于 6 的「未来输入」x[7] 和 x[8] 对应脉冲响应的负索引部分 h[-1] 与 h[-2]，从而消除了单侧加权带来的时间滞后。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：单侧加权 vs 对称双侧加权（负索引透视）",
      "instruction": "切换「开启对称双侧加权」开关，并拖动「输出索引 n」与「输入峰值位置」，对比输出峰值是否发生时间偏移，观察 h[-1]、h[-2] 负索引是如何精确落在右侧输入样本上的。",
      "controls": [
        {
          "type": "toggle",
          "id": "symmetrical",
          "label": "开启对称双侧加权 (使用负索引 h[-1], h[-2])",
          "value": true
        },
        {
          "type": "slider",
          "id": "outIdx",
          "label": "当前观察的输出样本索引 n (y[n])",
          "min": 3,
          "max": 13,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "peakIdx",
          "label": "输入信号峰值位置",
          "min": 3,
          "max": 13,
          "step": 1,
          "value": 6,
          "unit": ""
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst M = 17;\nconst wProfile = [0.1, 0.2, 0.4, 0.2, 0.1];\n\nfunction draw() {\n  const sym = !!lab.values.symmetrical;\n  const outIdx = Math.round(lab.values.outIdx);\n  const peakIdx = Math.round(lab.values.peakIdx);\n\n  const x = new Array(M).fill(0);\n  for (let k = 0; k < M; k++) {\n    const d = Math.abs(k - peakIdx);\n    if (d === 0) x[k] = 1.0;\n    else if (d === 1) x[k] = 0.55;\n    else if (d === 2) x[k] = 0.2;\n    else x[k] = 0.08;\n  }\n\n  const y = new Array(M).fill(0);\n  for (let n = 0; n < M; n++) {\n    let sum = 0;\n    for (let j = 0; j < 5; j++) {\n      const hIdx = sym ? (2 - j) : (4 - j);\n      const xIdx = n - hIdx;\n      if (xIdx >= 0 && xIdx < M) {\n        sum += wProfile[j] * x[xIdx];\n      }\n    }\n    y[n] = sum;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let gy = 30; gy < H - 20; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke();\n  }\n\n  const marginX = 42;\n  const usableW = W - marginX * 2;\n  const stepX = usableW / (M - 1);\n  const baseY = H - 38;\n  const scaleY = 115;\n\n  const minOffset = sym ? -2 : 0;\n  const maxOffset = sym ? 2 : 4;\n  const winStart = outIdx - maxOffset;\n  const winEnd = outIdx - minOffset;\n\n  const xLeft = marginX + Math.max(0, winStart) * stepX - 16;\n  const xRight = marginX + Math.min(M - 1, winEnd) * stepX + 16;\n  ctx.fillStyle = \"rgba(245, 158, 11, 0.12)\";\n  ctx.strokeStyle = \"rgba(245, 158, 11, 0.55)\";\n  ctx.fillRect(xLeft, 36, xRight - xLeft, baseY - 36);\n  ctx.strokeRect(xLeft, 36, xRight - xLeft, baseY - 36);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.25)\";\n  ctx.beginPath(); ctx.moveTo(marginX - 15, baseY); ctx.lineTo(W - marginX + 15, baseY); ctx.stroke();\n\n  for (let k = 0; k < M; k++) {\n    const cx = marginX + k * stepX;\n\n    const xH = x[k] * scaleY;\n    ctx.strokeStyle = \"#38bdf8\";\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(cx - 5, baseY); ctx.lineTo(cx - 5, baseY - xH); ctx.stroke();\n    ctx.fillStyle = \"#38bdf8\";\n    ctx.beginPath(); ctx.arc(cx - 5, baseY - xH, 4, 0, Math.PI * 2); ctx.fill();\n\n    const yH = y[k] * scaleY;\n    const isTarget = (k === outIdx);\n    ctx.strokeStyle = isTarget ? \"#ec4899\" : \"#10b981\";\n    ctx.lineWidth = isTarget ? 3.5 : 2.5;\n    ctx.beginPath(); ctx.moveTo(cx + 5, baseY); ctx.lineTo(cx + 5, baseY - yH); ctx.stroke();\n    ctx.fillStyle = isTarget ? \"#ec4899\" : \"#10b981\";\n    ctx.beginPath(); ctx.arc(cx + 5, baseY - yH, isTarget ? 6 : 4, 0, Math.PI * 2); ctx.fill();\n\n    ctx.fillStyle = isTarget ? \"#f8fafc\" : \"rgba(248,250,252,0.65)\";\n    ctx.font = isTarget ? \"bold 12px monospace\" : \"11px monospace\";\n    ctx.textAlign = \"center\";\n    ctx.fillText(String(k), cx, baseY + 16);\n  }\n\n  const terms = [];\n  for (let j = 0; j < 5; j++) {\n    const hIdx = sym ? (2 - j) : (4 - j);\n    const wVal = wProfile[j];\n    const xIdx = outIdx - hIdx;\n    if (xIdx >= 0 && xIdx < M) {\n      const cx = marginX + xIdx * stepX;\n      ctx.fillStyle = hIdx < 0 ? \"#ec4899\" : \"#f59e0b\";\n      ctx.font = \"bold 11px monospace\";\n      ctx.textAlign = \"center\";\n      ctx.fillText(\"h[\" + hIdx + \"]\", cx, 52);\n      ctx.fillStyle = \"rgba(248,250,252,0.85)\";\n      ctx.font = \"10px monospace\";\n      ctx.fillText(\"×\" + wVal.toFixed(1), cx, 65);\n    }\n    terms.push(\"h[\" + hIdx + \"]x[\" + xIdx + \"]\");\n  }\n\n  ctx.textAlign = \"left\";\n  ctx.font = \"12px sans-serif\";\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"● 输入 x[k]\", 24, 20);\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"● 输出 y[k]\", 112, 20);\n  ctx.fillStyle = \"#ec4899\";\n  ctx.fillText(\"● 计算点 y[\" + outIdx + \"]\", 200, 20);\n  ctx.fillStyle = sym ? \"#10b981\" : \"#f59e0b\";\n  ctx.fillText(sym ? \"对称模式：输出峰值与输入零延迟对齐 (含负索引)\" : \"单侧左侧模式：输出峰值向右滞后 2 格\", 380, 20);\n\n  lab.setReadout(\"y[\" + outIdx + \"] = \" + terms.join(\" + \") + \" = \" + y[outIdx].toFixed(3));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "双重视角切换：遇到硬件/物理通道建模时用「脉冲响应」视角思考拖尾；遇到平滑、去噪或特征提取需求时，立刻切换成「加权输入之和」视角来设计权重系数。",
        "因果性与负索引的取舍：使用负索引（如 h[-1]、h[-2]）实现左右对称加权可以做到「零相位延迟」，但它依赖未来样本，只能在离线处理中使用；实时流式系统只能使用单侧非负索引，必须容忍由此产生的半窗口延迟。",
        "数组越界避坑：很多语言（如 C/C++/JavaScript）的数组下标不能为负，代码实现对称卷积核 h[-M..M] 时，务必在程序里做下标偏移映射（如 h_arr[k + M]），切勿直接访问负索引。"
      ]
    }
  ]
});
