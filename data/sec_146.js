window.__BOOK_REGISTER_SECTION__("sec_146", {
  "title": "重叠相加法 (The Overlap-Add Method)",
  "intuition": "把漫长的数据流切成小段分别滤波，再把每段卷积后多出来的“拖尾”精准对齐相加，就能无缝拼出与整段直接滤波一模一样的结果。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么非要把长信号“切碎”了再处理？",
      "paragraphs": [
        "在教科书的理想世界里，我们总是假设整段信号已经安安静静地躺在内存数组里，等着一次性送进滤波器。但在真实的工程现场，直接对整段长信号做卷积往往会撞上三堵硬墙：",
        "**第一堵墙：内存根本装不下。** 高保真数字音频的数据率大约是 `5 MB/min`，而数字视频更是高达 `500 MB/min`。面对动辄几个小时的音视频流，计算机内存根本无法一次性容纳全部样本。",
        "**第二堵墙：实时系统等不起。** 像电话通话这样的实时系统，端到端延迟绝不能超过几百毫秒。你不可能等对方讲完半小时再统一滤波，必须在数据刚刚到达几十毫秒时就立刻分段处理并输出。",
        "**第三堵墙：算法本身要求分段。** 许多高效算法（比如本章核心主角 FFT 快速卷积）必须在固定大小的块（Segment）上运行。于是，**重叠相加法 (Overlap-Add Method)** 应运而生——它遵循 DSP 最底层的三步心法：**（1）将长信号拆分成简单小段；（2）单独对每一小段进行滤波处理；（3）把处理后的结果重新组合成完整信号**。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "2. 卷积的“膨胀效应”与补零的真正目的",
      "paragraphs": [
        "分段滤波最容易踩坑的地方在于：**信号经过卷积后，长度会变长！** 如果一段长度为 `N` 的输入信号，与一个长度为 `M` 的滤波器核（假设索引从 `0` 到 `M-1`）做卷积，输出信号的长度并不是 `N`，而是 `N + M - 1`。",
        "换句话说，滤波会让信号向右**膨胀 `M - 1` 个采样点**。以原书图 18-1 为例：输入信号共 `300` 点（索引 `0~299`），使用一个 `101` 点的加窗 sinc 低通滤波器（索引 `0~100`），最终输出信号共有 `400` 点（索引 `0~399`）。哪怕输出信号末尾的数值小到在图上几乎看不见，它们依然是非零的有效拖尾。",
        "在重叠相加法中，我们把 `300` 点的原信号切成 `3` 段，每段 `100` 点，并在每段右侧补上 `100` 个零（刚好等于 `M - 1`）。**补零的本质，就是为卷积过程中必然发生的 `M - 1` 点向右膨胀提前腾出“安全缓冲区”**。这样，每段 `100` 点的有效信号经过 `101` 点卷积核后，都会生成一个 `200` 点的输出段。"
      ],
      "formula": {
        "expr": "L_out = L_seg + M - 1",
        "explain": "L_seg 是单个输入分段的有效长度（如 100），M 是滤波器核长度（如 101），L_out 是该段卷积后的输出长度（200），其中多出来的 M - 1 个点就是向右伸出的“卷积拖尾”。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：亲手切分信号，观察“卷积拖尾”的无缝拼接",
      "instruction": "拖动“滤波器核长度 M”与“高亮分段”，观察每段右侧的拖尾如何伸入下一段，以及全部叠加后如何与直接卷积完全重合。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelM",
          "label": "滤波器核长度 M",
          "min": 21,
          "max": 121,
          "step": 10,
          "value": 101,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "activeSeg",
          "label": "高亮查看分段 (0=全部)",
          "min": 0,
          "max": 3,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDirect",
          "label": "叠加整段直接卷积曲线对比",
          "value": true
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height;\nconst ctx = lab.ctx;\nconst N = 300;\nconst L = 100;\n\nconst sig = new Float64Array(N);\nfor (let n = 0; n < N; n++) {\n  const env = Math.exp(-Math.pow((n - 150) / 95, 2));\n  const pulse = (n > 110 && n < 190) ? 0.35 : 0;\n  sig[n] = env * (0.55 * Math.sin(2 * Math.PI * n / 75) + 0.35 * Math.sin(2 * Math.PI * n / 13)) + pulse;\n}\n\nfunction makeKernel(M) {\n  const h = new Float64Array(M);\n  const half = (M - 1) / 2;\n  const fc = 0.045;\n  let sum = 0;\n  for (let i = 0; i < M; i++) {\n    const x = i - half;\n    const sinc = x === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * x) / x;\n    const win = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (M - 1));\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i < M; i++) h[i] /= sum;\n  return h;\n}\n\nfunction convolve(a, b) {\n  const out = new Float64Array(a.length + b.length - 1);\n  for (let i = 0; i < a.length; i++) {\n    const ai = a[i];\n    for (let j = 0; j < b.length; j++) {\n      out[i + j] += ai * b[j];\n    }\n  }\n  return out;\n}\n\nfunction render() {\n  const M = lab.values.kernelM;\n  const activeSeg = lab.values.activeSeg;\n  const showDirect = lab.values.showDirect;\n  const h = makeKernel(M);\n  const yDirect = convolve(sig, h);\n  const outLen = N + M - 1;\n  const yOLA = new Float64Array(outLen);\n  const segColors = ['#38bdf8', '#10b981', '#ec4899'];\n  const ySegs = [];\n\n  for (let k = 0; k < 3; k++) {\n    const seg = sig.subarray(k * L, (k + 1) * L);\n    const yk = convolve(seg, h);\n    ySegs.push(yk);\n    for (let i = 0; i < yk.length; i++) {\n      yOLA[k * L + i] += yk[i];\n    }\n  }\n\n  let maxErr = 0;\n  for (let i = 0; i < outLen; i++) {\n    const err = Math.abs(yOLA[i] - yDirect[i]);\n    if (err > maxErr) maxErr = err;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 38, padR = 20;\n  const maxN = 425;\n  const xOf = (n) => padL + (n / maxN) * (W - padL - padR);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let n = 0; n <= 400; n += 100) {\n    const x = xOf(n);\n    ctx.beginPath(); ctx.moveTo(x, 12); ctx.lineTo(x, H - 14); ctx.stroke();\n    ctx.fillStyle = 'rgba(255,255,255,0.45)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(n), x - 8, H - 3);\n  }\n\n  const yTop = 58, ampTop = 32;\n  const yBot = 168, ampBot = 42;\n\n  ctx.beginPath(); ctx.moveTo(xOf(0), yTop); ctx.lineTo(xOf(420), yTop); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(xOf(0), yBot); ctx.lineTo(xOf(420), yBot); ctx.stroke();\n\n  for (let k = 0; k < 3; k++) {\n    const isDim = activeSeg !== 0 && activeSeg !== (k + 1);\n    ctx.save();\n    ctx.globalAlpha = isDim ? 0.18 : 1;\n    ctx.strokeStyle = segColors[k];\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i < L; i++) {\n      const x = xOf(k * L + i);\n      const y = yTop - sig[k * L + i] * ampTop;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    if (activeSeg === k + 1) {\n      ctx.setLineDash([4, 3]);\n      ctx.beginPath();\n      ctx.moveTo(xOf((k + 1) * L), yTop);\n      ctx.lineTo(xOf((k + 1) * L + M - 1), yTop);\n      ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = segColors[k];\n      ctx.font = '10px sans-serif';\n      ctx.fillText('补 ' + (M - 1) + ' 个零', xOf((k + 1) * L) + 6, yTop - 6);\n    }\n    ctx.restore();\n  }\n\n  for (let k = 0; k < 3; k++) {\n    const isDim = activeSeg !== 0 && activeSeg !== (k + 1);\n    const yk = ySegs[k];\n    ctx.save();\n    if (activeSeg === k + 1) {\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';\n      ctx.fillRect(xOf(k * L + L), yBot - 48, xOf(k * L + L + M - 1) - xOf(k * L + L), 96);\n    }\n    ctx.globalAlpha = isDim ? 0.15 : (activeSeg === 0 ? 0.65 : 1);\n    ctx.strokeStyle = segColors[k];\n    ctx.lineWidth = activeSeg === k + 1 ? 2.2 : 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < yk.length; i++) {\n      const x = xOf(k * L + i);\n      const y = yBot - yk[i] * ampBot;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i < outLen; i++) {\n    const x = xOf(i);\n    const y = yBot - yOLA[i] * ampBot;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showDirect) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let i = 0; i < outLen; i++) {\n      const x = xOf(i);\n      const y = yBot - yDirect[i] * ampBot;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('输入分段 x_k[n] (每段100点)', padL + 4, 16);\n  ctx.fillText('输出分段 y_k[n] 与重叠相加总输出 y[n] (白线=OLA, 琥珀虚线=直接卷积)', padL + 4, 114);\n\n  lab.setReadout('输入总长 N=300 | 核长 M=' + M + ' | 单段输出=' + (L + M - 1) + ' | 重叠区=' + (M - 1) + '点 | 与直接卷积最大误差=' + maxErr.toExponential(1));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "3. 重叠与相加：魔术是如何严丝合缝还原的？",
      "paragraphs": [
        "现在我们把放大镜移到分段输出上。第 1 段输入（`0~99`）卷积后得到 `200` 点输出（`0~199`）；第 2 段输入（`100~199`）卷积后也得到 `200` 点输出，但它在时间轴上的绝对位置是从 `100` 到 `299`；第 3 段输出则位于 `200` 到 `399`。",
        "你会发现：**相邻两段输出之间天然出现了 `M - 1`（这里是 `100`）个采样点的重叠区！** 例如，最终输出信号中的 `200~299` 号样本，就必须由第 2 段输出的尾巴与第 3 段输出的开头**逐点相加**得到。由于线性卷积满足叠加原理，这种“先分段卷积、再对齐重叠相加”的结果，在数学上与整段直接卷积**百分之百完全等价**。",
        "既然结果完全相同，它的代价是什么？原书一针见血地指出：唯一的缺点是**程序复杂度大幅上升**——写代码时你必须小心翼翼地维护一个“拖尾缓存区”，精准追踪上一段多出来的 `M - 1` 个样本，并在下一段算出来时把它们加到一起。一旦忘加或错位，拼接处就会立刻出现撕裂般的噪声。"
      ],
      "formula": {
        "expr": "y[n] = Σ_k y_k[n - k·L_seg]",
        "explain": "第 k 个分段独立卷积得到的输出 y_k，在时间轴上平移 k·L_seg 个位置后全部累加，即可完美重构总输出 y[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：波形放大镜与真实听感——忘记重叠相加会发生什么？",
      "instruction": "点击“播放滤波对比音”，然后反复切换“开启重叠相加”开关，同时用眼睛观察分段边界处的波形接缝，用耳朵听截断拖尾带来的刺耳咔哒声。",
      "controls": [
        {
          "type": "toggle",
          "id": "useOverlapAdd",
          "label": "开启重叠相加 (Overlap-Add)",
          "value": true
        },
        {
          "type": "slider",
          "id": "segLen",
          "label": "分段大小 L",
          "min": 128,
          "max": 512,
          "step": 64,
          "value": 256,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "低通截止频率",
          "min": 300,
          "max": 2400,
          "step": 100,
          "value": 700,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height;\nconst ctx = lab.ctx;\nconst SR = 16000;\nconst TOTAL_N = 24000;\nconst M = 65;\n\nconst rawSig = new Float32Array(TOTAL_N);\nfor (let n = 0; n < TOTAL_N; n++) {\n  rawSig[n] = 0.35 * Math.sin(2 * Math.PI * 220 * n / SR)\n            + 0.25 * Math.sin(2 * Math.PI * 660 * n / SR)\n            + 0.25 * Math.sin(2 * Math.PI * 1320 * n / SR)\n            + 0.20 * Math.sin(2 * Math.PI * 2200 * n / SR);\n}\n\nlet outOLA = null;\nlet outTrunc = null;\nlet activeSrc = null;\nlet isPlaying = false;\n\nfunction makeLPF(cutoffHz) {\n  const h = new Float32Array(M);\n  const fc = cutoffHz / SR;\n  const half = (M - 1) / 2;\n  let sum = 0;\n  for (let i = 0; i < M; i++) {\n    const x = i - half;\n    const sinc = x === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * x) / x;\n    const win = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (M - 1));\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i < M; i++) h[i] /= sum;\n  return h;\n}\n\nfunction recompute() {\n  const L = lab.values.segLen;\n  const h = makeLPF(lab.values.cutoff);\n  outOLA = new Float32Array(TOTAL_N + M);\n  outTrunc = new Float32Array(TOTAL_N + M);\n\n  for (let start = 0; start < TOTAL_N; start += L) {\n    const segEnd = Math.min(start + L, TOTAL_N);\n    const segLen = segEnd - start;\n    const yLen = segLen + M - 1;\n    const ySeg = new Float32Array(yLen);\n    for (let i = 0; i < segLen; i++) {\n      const xi = rawSig[start + i];\n      for (let j = 0; j < M; j++) {\n        ySeg[i + j] += xi * h[j];\n      }\n    }\n    for (let i = 0; i < yLen; i++) {\n      outOLA[start + i] += ySeg[i];\n      if (i < segLen) {\n        outTrunc[start + i] = ySeg[i];\n      }\n    }\n  }\n}\n\nfunction stopAudio() {\n  if (activeSrc) {\n    try { activeSrc.stop(); activeSrc.disconnect(); } catch (e) {}\n    activeSrc = null;\n  }\n  isPlaying = false;\n}\n\nfunction startAudio() {\n  stopAudio();\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  const buf = ac.createBuffer(1, 16000, SR);\n  const ch = buf.getChannelData(0);\n  const srcArr = lab.values.useOverlapAdd ? outOLA : outTrunc;\n  for (let i = 0; i < 16000; i++) {\n    ch[i] = srcArr[4000 + i] * 0.55;\n  }\n  const src = ac.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(ac.destination);\n  src.start();\n  activeSrc = src;\n  isPlaying = true;\n}\n\nfunction draw(timeSec) {\n  if (!outOLA) return;\n  const L = lab.values.segLen;\n  const useOLA = lab.values.useOverlapAdd;\n  const viewLen = Math.min(L * 3, 1100);\n  const k0 = Math.ceil(4200 / L);\n  const viewStart = k0 * L - Math.floor(L * 0.3);\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 24, padR = 24;\n  const xOf = (idx) => padL + ((idx - viewStart) / viewLen) * (W - padL - padR);\n  const yMid = H * 0.54, amp = 78;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(padL, yMid); ctx.lineTo(W - padR, yMid); ctx.stroke();\n\n  const firstBoundary = Math.ceil(viewStart / L) * L;\n  for (let b = firstBoundary; b < viewStart + viewLen; b += L) {\n    const bx = xOf(b);\n    const tailEnd = Math.min(b + M - 1, viewStart + viewLen);\n    ctx.fillStyle = useOLA ? 'rgba(16, 185, 129, 0.10)' : 'rgba(236, 72, 153, 0.14)';\n    ctx.fillRect(bx, 28, xOf(tailEnd) - bx, H - 46);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath(); ctx.moveTo(bx, 26); ctx.lineTo(bx, H - 18); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('边界 ' + b, bx + 4, 38);\n  }\n\n  if (!useOLA) {\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < viewLen; i++) {\n      const x = xOf(viewStart + i);\n      const y = yMid - outOLA[viewStart + i] * amp;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  const mainArr = useOLA ? outOLA : outTrunc;\n  ctx.strokeStyle = useOLA ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i < viewLen; i++) {\n    const x = xOf(viewStart + i);\n    const y = yMid - mainArr[viewStart + i] * amp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (isPlaying && typeof timeSec === 'number') {\n    const prog = (timeSec * 0.45) % 1;\n    const sx = padL + prog * (W - padL - padR);\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(sx, 28); ctx.lineTo(sx, H - 18); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(useOLA ? '✓ 已开启重叠相加：拖尾完美融合，接缝处丝滑连续' : '✗ 未做重叠相加（直接丢弃拖尾）：每个分段边界都出现断崖式跳变！', padL, 17);\n\n  const buzzHz = (SR / L).toFixed(1);\n  lab.setReadout('模式=' + (useOLA ? '重叠相加 (无损)' : '粗暴丢弃拖尾 (产生 ' + buzzHz + 'Hz 咔哒断层)') + ' | 核长 M=' + M + ' | 重叠区=' + (M - 1) + '点');\n}\n\nlab.onUpdate(() => {\n  recompute();\n  if (lab.values.play) {\n    startAudio();\n  } else {\n    stopAudio();\n  }\n  draw(0);\n});\n\nlab.onLoop((dt, timeSec) => {\n  if (isPlaying) draw(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "长度铁律记住它：长度 L 的输入段经过长度 M 的核卷积后，输出长度必为 L + M - 1，向右多出 M - 1 个非零拖尾点。",
        "零填充不是白填的：给每段输入右侧补上 M - 1 个零，本质上是为卷积膨胀预留输出空间，避免缓冲溢出或后续做 FFT 卷积时发生混叠覆盖。",
        "数学上零误差，工程上管好缓存：重叠相加法能产生与整段直接卷积 100% 相同的精确结果，写代码时只需专门维护一个长度为 M - 1 的累加缓冲区，把上一段尾巴加到下一段开头即可，切忌直接截断丢弃拖尾。"
      ]
    }
  ]
});
