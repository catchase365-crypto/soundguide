window.__BOOK_REGISTER_SECTION__("sec_140", {
  "title": "设计加窗 Sinc 滤波器 (Designing the Filter)",
  "intuition": "只需选定截止频率 f_C 与核长度 M 两个参数，就能用一条解析公式直接生成兼顾极高阻带衰减与通阻带对称性的低通滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "两个核心参数：截止频率 f_C 与核长度 M",
      "paragraphs": [
        "设计一个加窗 Sinc（Windowed-Sinc）低通滤波器，本质上只需要敲定两个参数：**截止频率** `f_C` 和**滤波器核长度** `M`。",
        "在数字信号处理中，`f_C` 表示为**采样率的比例（归一化频率）**，因此取值必须严格落在 `0` 到 `0.5` 之间（`0.5` 对应奈奎斯特频率）。而核长度 `M` 决定了滤波器的**滚降速度（过渡带宽度 BW）**。过渡带宽度 `BW` 指的是幅频响应从“刚离开通带 1（约 99%）”跌落到“接近阻带 0（约 1%）”所跨越的频率宽度，同样表示为采样率的比例（0 到 0.5 之间）。",
        "由于卷积计算时间与信号及滤波器核的长度成正比，经验公式 `M ≈ 4 / BW` 揭示了一个核心工程权衡：**计算耗时（取决于 M）与滤波器陡峭度（取决于 BW）成反比**。例如，Blackman 窗的滚降速度比 Hamming 窗慢约 20%，这意味着为了达到相同的过渡带陡峭度，Blackman 窗必须采用长出 20% 的滤波器核——换言之，在同等滚降指标下，Blackman 窗的执行速度会慢 20%。",
        "另一个反直觉但极其重要的细节是：加窗 Sinc 滤波器的截止频率 `f_C` 是在 **0.5 幅度点（半幅度点，-6dB）** 处测量的，而不是模拟电路或其他数字滤波器常用的 0.707（-3dB）处。这是因为加窗 Sinc 滤波器的频响在**通带和阻带之间具有完美的对称性**（例如 Hamming 窗的通带波纹是 0.2%，其阻带衰减/阻带波纹也恰好是 0.2%）。这种对称性使其成为后续做**频谱反转（Spectral Inversion）**构建高通滤波器的理想材料。"
      ],
      "formula": {
        "expr": "M ≈ 4 / BW",
        "explain": "M 为滤波器核长度阶数（决定卷积运算量）；BW 为过渡带宽度（幅频响应从 99% 跌落至 1% 的归一化频率跨度，取值 0 ~ 0.5）。想要过渡带窄一倍，核长度就得翻一倍。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：f_C、M 对频响滚降的实时影响与音频滤波听感",
      "instruction": "拖动「截止频率 f_C」观察通带与 0.5 半幅度交点的平移；拖动「核长度 M」观察琥珀色过渡带 BW ≈ 4/M 如何变窄；打开测试音即可实时听出高频泛音被切掉的听感变化。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_C",
          "min": 0.04,
          "max": 0.45,
          "step": 0.01,
          "value": 0.15,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "m",
          "label": "核长度 M",
          "min": 20,
          "max": 200,
          "step": 10,
          "value": 60,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showDb",
          "label": "纵轴切换为 dB 对数刻度",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放多频测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioState = null;\n\nfunction computeKernel(fc, M) {\n  const h = new Float64Array(M + 1);\n  let sum = 0;\n  for (let i = 0; i <= M; i++) {\n    const x = i - M / 2;\n    const sinc = x === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * x) / x;\n    const win = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / M) + 0.08 * Math.cos((4 * Math.PI * i) / M);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i <= M; i++) h[i] /= sum;\n  return h;\n}\n\nfunction syncAudio(h, playing) {\n  if (!playing) {\n    if (audioState && audioState.ctx) {\n      audioState.gain.gain.setTargetAtTime(0, audioState.ctx.currentTime, 0.02);\n    }\n    return;\n  }\n  try {\n    const ctx = lab.getAudioContext();\n    if (ctx.state === 'suspended') ctx.resume();\n    if (!audioState) {\n      const sr = ctx.sampleRate;\n      const len = sr * 2;\n      const buf = ctx.createBuffer(1, len, sr);\n      const data = buf.getChannelData(0);\n      const freqs = [220, 550, 1400, 3400, 7200, 12500];\n      const amps = [0.28, 0.22, 0.18, 0.16, 0.14, 0.12];\n      for (let n = 0; n < len; n++) {\n        let v = 0;\n        const t = n / sr;\n        for (let k = 0; k < freqs.length; k++) {\n          v += amps[k] * Math.sin(2 * Math.PI * freqs[k] * t);\n        }\n        data[n] = v * 0.6;\n      }\n      const src = ctx.createBufferSource();\n      src.buffer = buf;\n      src.loop = true;\n      const convolver = ctx.createConvolver();\n      convolver.normalize = false;\n      const gain = ctx.createGain();\n      gain.gain.value = 0;\n      src.connect(convolver);\n      convolver.connect(gain);\n      gain.connect(ctx.destination);\n      src.start();\n      audioState = { ctx, convolver, gain };\n    }\n    const irBuf = audioState.ctx.createBuffer(1, h.length, audioState.ctx.sampleRate);\n    const irData = irBuf.getChannelData(0);\n    for (let i = 0; i < h.length; i++) irData[i] = h[i];\n    audioState.convolver.buffer = irBuf;\n    audioState.gain.gain.setTargetAtTime(0.45, audioState.ctx.currentTime, 0.03);\n  } catch (e) {}\n}\n\nlab.onUpdate(() => {\n  const fc = lab.values.fc;\n  const M = Math.round(lab.values.m / 2) * 2;\n  const showDb = lab.values.showDb;\n  const h = computeKernel(fc, M);\n  syncAudio(h, lab.values.play);\n\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 58, padR = 24, padT = 22, padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n\n  const mapX = (f) => padL + (f / 0.5) * plotW;\n  const mapY = (val) => {\n    if (!showDb) {\n      return padT + plotH - (val / 1.2) * plotH;\n    } else {\n      const clamped = Math.max(-100, Math.min(10, val));\n      return padT + ((10 - clamped) / 110) * plotH;\n    }\n  };\n\n  const bw = Math.min(0.5, 4 / M);\n  const bwLeft = Math.max(0, fc - bw / 2);\n  const bwRight = Math.min(0.5, fc + bw / 2);\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';\n  ctx.fillRect(mapX(bwLeft), padT, mapX(bwRight) - mapX(bwLeft), plotH);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.textAlign = 'center';\n  for (let f = 0; f <= 0.5001; f += 0.1) {\n    const x = mapX(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n    ctx.fillText(f.toFixed(1), x, padT + plotH + 16);\n  }\n  ctx.fillText('归一化频率 (f / fs)', padL + plotW / 2, H - 4);\n\n  ctx.textAlign = 'right';\n  const yTicks = showDb ? [0, -20, -40, -60, -80, -100] : [0, 0.5, 1.0];\n  for (const yt of yTicks) {\n    const y = mapY(yt);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n    ctx.fillText(showDb ? yt + ' dB' : yt.toFixed(1), padL - 8, y + 4);\n  }\n\n  if (showDb) {\n    const y74 = mapY(-74);\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';\n    ctx.beginPath(); ctx.moveTo(padL, y74); ctx.lineTo(padL + plotW, y74); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.textAlign = 'left';\n    ctx.fillText('Blackman 阻带衰减 -74 dB', padL + 8, y74 - 5);\n    ctx.restore();\n  }\n\n  const N = 260;\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  const halfM = M / 2;\n  for (let idx = 0; idx <= N; idx++) {\n    const f = (idx / N) * 0.5;\n    let re = h[halfM];\n    for (let k = 1; k <= halfM; k++) {\n      re += 2 * h[halfM + k] * Math.cos(2 * Math.PI * f * k);\n    }\n    const mag = Math.abs(re);\n    const yVal = showDb ? 20 * Math.log10(Math.max(mag, 1e-6)) : mag;\n    const x = mapX(f);\n    const y = mapY(yVal);\n    if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const xFc = mapX(fc);\n  const yHalf = mapY(showDb ? -6.02 : 0.5);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath(); ctx.moveTo(xFc, padT); ctx.lineTo(xFc, padT + plotH); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(xFc, yHalf, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.textAlign = fc > 0.35 ? 'right' : 'left';\n  ctx.fillText('f_C=' + fc.toFixed(2) + (showDb ? ' (-6dB)' : ' (幅度 0.5)'), xFc + (fc > 0.35 ? -8 : 8), yHalf - 8);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'center';\n  ctx.fillText('BW ≈ ' + bw.toFixed(3), mapX((bwLeft + bwRight) / 2), padT + 14);\n\n  const cutoffHz = audioState && audioState.ctx ? Math.round(fc * audioState.ctx.sampleRate) : Math.round(fc * 48000);\n  lab.setReadout(`核长度 M = ${M}（共 ${M + 1} 点） | 截止频率 f_C = ${fc.toFixed(2)} fs（约 ${cutoffHz} Hz） | 估算过渡带 BW ≈ ${bw.toFixed(3)} fs`);\n});"
    },
    {
      "type": "concept",
      "heading": "核心设计公式、零点奇点与数组对齐技巧",
      "paragraphs": [
        "选定 `f_C` 和 `M` 后，即可用核心公式（Eq. 16-4）逐点算出滤波器的脉冲响应 `h[i]`。虽然公式看起来很长，但拆解开来只有三个老朋友：**Sinc 函数**、**M/2 平移量**（让对称中心落在数组正中），以及 **Blackman 窗函数**。",
        "实际编程实现时，有两个工程细节必须牢记：第一，当 `i = M/2` 时，分母 `i - M/2` 会变成 `0`，触发除零错误！此时必须跳过除法，直接使用极限值 `h[M/2] = 2 * π * f_C * K`（代码中通常先取 `K = 1`）。第二，为了让滤波器在直流（DC，零频率）处拥有严格的 **1 倍增益（Unity Gain）**，常数 `K` 必须保证所有采样点之和等于 1。工程上最省事的做法是：**先彻底忽略 K 算出所有采样点，最后将每个点除以全部采样点之和（归一化）**。",
        "关于内存与数组下标对齐：`M` 必须是**偶数**。例如取 `M = 100`，滤波器核的第一个点存放在数组下标 `0`，最后一个点在下标 `100`，整个信号总长其实是 **`M + 1 = 101` 个点**。对称中心在下标 `50`（即 `M/2`），左右各 50 个点严格镜像对称（`h[0] == h[100]`，`h[49] == h[51]`）。如果为了配合 FFT 运算而需要 2 的幂次长度，只需在数组末尾补零即可——例如 `M = 100` 时，将下标 `101` 到 `127` 全部填 `0`，就能得到完美的 128 点滤波器核。"
      ],
      "formula": {
        "expr": "h[i] = K · [ sin(2π·f_C·(i - M/2)) / (i - M/2) ] · [ 0.42 - 0.5·cos(2πi/M) + 0.08·cos(4πi/M) ]",
        "explain": "i 为整数采样下标（0 到 M，共 M+1 点，M 必须为偶数）；f_C 为归一化截止频率（0 ~ 0.5）；中括号左侧是平移了 M/2 的 Sinc 核，右侧是 Blackman 窗；i = M/2 时直接赋值为 2π·f_C·K；K 为归一化常数，实际编程时先忽略 K，最后除以全体样本总和即可。"
      }
    },
    {
      "type": "concept",
      "heading": "肉眼看不见的尾部，与糟糕的时域阶跃响应",
      "paragraphs": [
        "观察实际算出的加窗 Sinc 滤波器核时，你会发现核的开头和结尾两端采样值小到在图像上几乎贴着零轴、完全看不见。**千万不要误以为这些尾部采样点无关紧要！**虽然单个尾部样本极小，但它们汇聚在一起对滤波器的整体阻带衰减性能起着决定性作用。这也是为什么加窗 Sinc 滤波器**通常必须采用浮点数（Floating-point）**来实现——定点数或整型根本没有足够的动态范围去容纳核中心主瓣与两端尾部之间悬殊的数值跨度。",
        "最后，加窗 Sinc 滤波器在**时域（Time Domain）**上的表现究竟如何？答案是：**非常糟糕（Terrible）！**观察它的阶跃响应（Step Response）就会发现，面对信号突变时，输出波形会出现明显的**过冲（Overshoot）和振铃（Ringing）**。因此，加窗 Sinc 是典型的频域分离利器，**绝对不要用它去处理把信息编码在时域波形形状上的信号**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：滤波器核 h[i] 形态与时域阶跃响应观察器",
      "instruction": "拖动 f_C 观察核内部正弦振荡频率与中心峰值的变化；拖动 M 观察核宽与阶跃响应上升斜率的联动；打开「尾部放大与窗包络」看清肉眼几乎不可见的边缘小值。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_C",
          "min": 0.01,
          "max": 0.2,
          "step": 0.005,
          "value": 0.04,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "m",
          "label": "核长度 M",
          "min": 40,
          "max": 500,
          "step": 10,
          "value": 150,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "zoomTail",
          "label": "显示 Blackman 窗包络与 10× 尾部放大",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const fc = lab.values.fc;\n  const M = Math.round(lab.values.m / 2) * 2;\n  const zoomTail = lab.values.zoomTail;\n\n  const h = new Float64Array(M + 1);\n  let sum = 0;\n  for (let i = 0; i <= M; i++) {\n    const x = i - M / 2;\n    const sinc = x === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * x) / x;\n    const win = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / M) + 0.08 * Math.cos((4 * Math.PI * i) / M);\n    h[i] = sinc * win;\n    sum += h[i];\n  }\n  for (let i = 0; i <= M; i++) h[i] /= sum;\n\n  const step = new Float64Array(M + 1);\n  let acc = 0;\n  let maxStep = -Infinity;\n  let minStep = Infinity;\n  for (let i = 0; i <= M; i++) {\n    acc += h[i];\n    step[i] = acc;\n    if (acc > maxStep) maxStep = acc;\n    if (acc < minStep) minStep = acc;\n  }\n\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const padT = 26, padB = 30, plotH = H - padT - padB;\n  const leftBox = { x: 48, w: 294 };\n  const rightBox = { x: 400, w: 294 };\n  const offset = 250 - M / 2;\n\n  function drawPanelGrid(box, title, yMin, yMax, yTicks) {\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText(title, box.x + box.w / 2, 16);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.font = '10px monospace';\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n\n    const mapX = (n) => box.x + (n / 500) * box.w;\n    const mapY = (v) => padT + ((yMax - v) / (yMax - yMin)) * plotH;\n\n    ctx.textAlign = 'center';\n    for (let n = 0; n <= 500; n += 100) {\n      const x = mapX(n);\n      ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n      ctx.fillText(n, x, padT + plotH + 14);\n    }\n    ctx.fillText('样本编号 (居中对齐至 250)', box.x + box.w / 2, H - 3);\n\n    ctx.textAlign = 'right';\n    for (const yt of yTicks) {\n      const y = mapY(yt);\n      ctx.beginPath(); ctx.moveTo(box.x, y); ctx.lineTo(box.x + box.w, y); ctx.stroke();\n      ctx.fillText(yt.toFixed(2), box.x - 6, y + 3);\n    }\n    return { mapX, mapY };\n  }\n\n  const L = drawPanelGrid(leftBox, '滤波器核 h[i] (冲击响应)', -0.10, 0.45, [0, 0.1, 0.2, 0.3, 0.4]);\n  const R = drawPanelGrid(rightBox, '时域阶跃响应 (过冲与振铃)', -0.2, 1.2, [0, 0.5, 1.0]);\n\n  if (zoomTail) {\n    const peak = h[M / 2];\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= M; i++) {\n      const win = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / M) + 0.08 * Math.cos((4 * Math.PI * i) / M);\n      const x = L.mapX(offset + i);\n      const y = L.mapY(win * peak);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.8)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (let i = 0; i <= M; i++) {\n      const x = L.mapX(offset + i);\n      const v = Math.max(-0.10, Math.min(0.45, h[i] * 10));\n      const y = L.mapY(v);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(L.mapX(0), L.mapY(0));\n  if (offset > 0) ctx.lineTo(L.mapX(offset), L.mapY(0));\n  for (let i = 0; i <= M; i++) {\n    ctx.lineTo(L.mapX(offset + i), L.mapY(h[i]));\n  }\n  if (offset + M < 500) ctx.lineTo(L.mapX(500), L.mapY(0));\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  ctx.moveTo(R.mapX(0), R.mapY(0));\n  if (offset > 0) ctx.lineTo(R.mapX(offset), R.mapY(0));\n  for (let i = 0; i <= M; i++) {\n    ctx.lineTo(R.mapX(offset + i), R.mapY(step[i]));\n  }\n  if (offset + M < 500) ctx.lineTo(R.mapX(500), R.mapY(1));\n  ctx.stroke();\n\n  const overshootPct = ((maxStep - 1) * 100).toFixed(1);\n  const undershootPct = (Math.abs(minStep) * 100).toFixed(1);\n  lab.setReadout(`核峰值 h[M/2] = ${h[M / 2].toFixed(4)} | 阶跃响应峰值过冲: +${overshootPct}% | 前置下冲: -${undershootPct}% (需用浮点存储尾部极小值)`);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "核长度 M 必须取偶数，生成的数组实际包含 M+1 个点（下标 0 到 M），对称中心在 M/2；写代码循环时务必特判 i === M/2 的除零奇点，直接赋值 2π·f_C。",
        "不要手动推算公式中的归一化常数 K：先设 K=1 算出全部点，再让所有样本除以它们的总和，即可精确保证直流（0 Hz）增益为 1。",
        "必须使用浮点数（float/double）保存与运算滤波器核！虽然两端尾部采样值肉眼几乎看不见，但它们共同支撑着 -74dB 的阻带衰减，整型截断会彻底毁掉滤波效果。",
        "加窗 Sinc 滤波器以 0.5 幅度点作为截止频率 f_C（而非 -3dB），这利用了其通带与阻带完全对称的特性，非常适合后续做频谱反转。",
        "它的时域阶跃响应存在明显过冲与振铃，绝对不要将其用于保留时域脉冲形状或边缘时刻的信号；若需 FFT 卷积加速，可在数组尾部补零凑齐 2 的幂次长度（如 M=100 共 101 点，将 101~127 补零至 128 点）。"
      ]
    }
  ]
});
