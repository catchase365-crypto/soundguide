window.__BOOK_REGISTER_SECTION__("sec_152", {
  "title": "滤波器的相位响应与双向零相位递归滤波 (Phase Response)",
  "intuition": "脉冲响应的左右对称性决定了信号上升沿与下降沿是否一致；IIR 递归滤波器天生不对称，但只要“正着滤一遍、再倒着滤一遍”，就能用两倍算力换来完美的零相位响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "三种相位响应：零相位、线性相位与非线性相位",
      "paragraphs": [
        "在数字信号处理中，滤波器除了改变各频率分量的幅度，还会改变它们的**相位（Phase）**。根据频率响应中相位曲线的形态，滤波器可以分为三类：**零相位（Zero Phase）**、**线性相位（Linear Phase）**和**非线性相位（Nonlinear Phase）**。",
        "决定相位类型的密码藏在时域的**脉冲响应（Impulse Response）**里。如果脉冲响应以样本点 `n = 0` 为中心左右完全对称（即负索引样本是正索引样本的镜像），那么做傅里叶变换后，虚部完全抵消，相位在所有频率上恒等于 **0**，这就是零相位滤波器。但它的缺点很明显：在实时编程或数组索引中，使用负索引（`n < 0`）非常不方便。",
        "解决办法是把对称的脉冲响应整体向右平移，让所有非零样本都落在正索引区间。此时波形依然保持**左右对称**，只是对称中心不再是 0。在频域上，时移会让相位变成一条穿过原点的斜直线，直线斜率正比于平移的样本数——这就是**线性相位滤波器**。由于整体平移仅仅让输出信号跟着延迟几个样本，它在效果上几乎等价于零相位。",
        "如果脉冲响应根本**不对称**，那么它的相位曲线就不再是一条直线，称为**非线性相位**。千万不要把“线性/非线性相位”和第 5 章讲的“系统线性度（System Linearity）”搞混——虽然都带“线性”二字，但前者描述的是相位随频率的变化规律，后者描述的是叠加性与齐次性，二者毫无关系。"
      ],
      "formula": {
        "expr": "h[k - n] = h[k + n]  ⟹  φ(f) = -2π · k · f",
        "explain": "h[n] 为脉冲响应，k 为对称中心索引。当 k = 0 时为绝对零相位 φ(f) = 0；当 k > 0 时相位 φ(f) 随频率 f 呈严格直线变化，斜率为 -2πk。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：对称性、相位曲线与脉冲边缘畸变",
      "instruction": "拖动「对称中心偏移」观察线性相位斜率变化；增大「非对称畸变度」观察相位弯曲及矩形脉冲左右边缘的失真。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "对称中心偏移 k",
          "min": 0,
          "max": 25,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "asymmetry",
          "label": "非对称畸变度 (模拟IIR)",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "显示原始脉冲虚线参考",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction buildSymKernel(center) {\n  const N = 128;\n  const Hmag = new Float64Array(N);\n  for (let m = 0; m < N; m++) {\n    const f = m <= N / 2 ? m / N : (N - m) / N;\n    Hmag[m] = 0.02 + 0.98 / (1 + Math.pow(f / 0.16, 8));\n  }\n  const h = new Float64Array(76);\n  let sum = 0;\n  for (let k = 0; k < 76; k++) {\n    const n = k - 25;\n    const d = n - center;\n    let val = 0;\n    for (let m = 0; m < N; m++) {\n      val += Hmag[m] * Math.cos((2 * Math.PI * m * d) / N);\n    }\n    val /= N;\n    const win = Math.abs(d) <= 22 ? 0.54 + 0.46 * Math.cos((Math.PI * d) / 22) : 0;\n    h[k] = val * win;\n    sum += h[k];\n  }\n  for (let k = 0; k < 76; k++) h[k] /= sum;\n  return h;\n}\n\nfunction buildAsymKernel(center) {\n  const h = new Float64Array(76);\n  let sum = 0;\n  for (let k = 0; k < 76; k++) {\n    const n = k - 25;\n    const d = n - center;\n    let val = 0;\n    if (d >= 0) {\n      val = (d + 0.5) * Math.exp(-d / 3.2) * Math.cos(0.11 * d);\n    }\n    h[k] = val;\n    sum += val;\n  }\n  for (let k = 0; k < 76; k++) h[k] /= sum;\n  return h;\n}\n\nfunction drawPanelFrame(x0, y0, pw, ph, title, xTicks, yTicks, yMin, yMax) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, pw, ph);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(title, x0 + 6, y0 - 8);\n\n  ctx.font = '9px monospace';\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (let i = 0; i < yTicks.length; i++) {\n    const yt = yTicks[i];\n    const py = y0 + ph - ((yt.val - yMin) / (yMax - yMin)) * ph;\n    ctx.beginPath();\n    ctx.moveTo(x0, py);\n    ctx.lineTo(x0 + pw, py);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.textAlign = 'right';\n    ctx.fillText(yt.lbl, x0 - 4, py + 3);\n  }\n  for (let i = 0; i < xTicks.length; i++) {\n    const xt = xTicks[i];\n    const px = x0 + xt.frac * pw;\n    ctx.beginPath();\n    ctx.moveTo(px, y0);\n    ctx.lineTo(px, y0 + ph);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.textAlign = 'center';\n    ctx.fillText(xt.lbl, px, y0 + ph + 12);\n  }\n}\n\nfunction render() {\n  const shift = lab.values.shift;\n  const asym = lab.values.asymmetry;\n  const showRef = lab.values.showRef;\n  const alpha = asym / 100;\n\n  const hSym = buildSymKernel(shift);\n  const hAsym = buildAsymKernel(shift);\n  const h = new Float64Array(76);\n  for (let k = 0; k < 76; k++) {\n    h[k] = (1 - alpha) * hSym[k] + alpha * hAsym[k];\n  }\n\n  const Fbins = 60;\n  const phases = new Float64Array(Fbins);\n  let prev = 0;\n  let maxAbsPh = 0;\n  for (let i = 0; i < Fbins; i++) {\n    const f = (i / (Fbins - 1)) * 0.5;\n    let re = 0;\n    let im = 0;\n    for (let k = 0; k < 76; k++) {\n      const n = k - 25;\n      const ang = -2 * Math.PI * f * n;\n      re += h[k] * Math.cos(ang);\n      im += h[k] * Math.sin(ang);\n    }\n    let ph = Math.atan2(im, re);\n    if (i > 0) {\n      while (ph - prev > Math.PI) ph -= 2 * Math.PI;\n      while (ph - prev < -Math.PI) ph += 2 * Math.PI;\n    }\n    phases[i] = ph;\n    prev = ph;\n    if (Math.abs(ph) > maxAbsPh) maxAbsPh = Math.abs(ph);\n  }\n\n  const pulseLen = 126;\n  const pulseY = new Float64Array(pulseLen);\n  for (let i = 0; i < pulseLen; i++) {\n    const n = i - 25;\n    let acc = 0;\n    for (let k = 0; k < 76; k++) {\n      const m = n - (k - 25);\n      if (m >= 0 && m <= 45) acc += h[k];\n    }\n    pulseY[i] = acc;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const pY0 = 32;\n  const pH = 172;\n  const pW = 186;\n  const x1 = 36;\n  const x2 = 276;\n  const x3 = 514;\n\n  drawPanelFrame(\n    x1, pY0, pW, pH, 'a. 脉冲响应 h[n]',\n    [{ frac: 0, lbl: '-25' }, { frac: 1/3, lbl: '0' }, { frac: 2/3, lbl: '25' }, { frac: 1, lbl: '50' }],\n    [{ val: -0.05, lbl: '-0.05' }, { val: 0, lbl: '0' }, { val: 0.1, lbl: '0.1' }, { val: 0.2, lbl: '0.2' }],\n    -0.06, 0.22\n  );\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  for (let k = 0; k < 76; k++) {\n    const px = x1 + (k / 75) * pW;\n    const py = pY0 + pH - ((h[k] - (-0.06)) / (0.22 - (-0.06))) * pH;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  for (let k = 0; k < 76; k += 2) {\n    const px = x1 + (k / 75) * pW;\n    const py = pY0 + pH - ((h[k] - (-0.06)) / (0.22 - (-0.06))) * pH;\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  const largeScale = maxAbsPh > 10;\n  const phMin = largeScale ? -90 : -10;\n  const phMax = largeScale ? 15 : 10;\n  const phTicks = largeScale\n    ? [{ val: -80, lbl: '-80' }, { val: -40, lbl: '-40' }, { val: 0, lbl: '0' }]\n    : [{ val: -8, lbl: '-8' }, { val: 0, lbl: '0' }, { val: 8, lbl: '8' }];\n\n  drawPanelFrame(\n    x2, pY0, pW, pH, 'b. 相位响应 φ(f) [rad]',\n    [{ frac: 0, lbl: '0' }, { frac: 0.5, lbl: '0.25' }, { frac: 1, lbl: '0.5' }],\n    phTicks, phMin, phMax\n  );\n  ctx.beginPath();\n  ctx.strokeStyle = asym === 0 ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.2;\n  for (let i = 0; i < Fbins; i++) {\n    const px = x2 + (i / (Fbins - 1)) * pW;\n    const py = pY0 + pH - ((phases[i] - phMin) / (phMax - phMin)) * pH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  drawPanelFrame(\n    x3, pY0, pW, pH, 'c. 矩形脉冲响应 y[n]',\n    [{ frac: 0, lbl: '-25' }, { frac: 0.2, lbl: '0' }, { frac: 0.6, lbl: '50' }, { frac: 1, lbl: '100' }],\n    [{ val: 0, lbl: '0.0' }, { val: 0.5, lbl: '0.5' }, { val: 1.0, lbl: '1.0' }],\n    -0.25, 1.35\n  );\n\n  if (showRef) {\n    ctx.beginPath();\n    ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.2;\n    for (let i = 0; i < pulseLen; i++) {\n      const n = i - 25;\n      const rx = x3 + (i / (pulseLen - 1)) * pW;\n      const val = (n >= 0 && n <= 45) ? 1 : 0;\n      const ry = pY0 + pH - ((val - (-0.25)) / (1.35 - (-0.25))) * pH;\n      if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.beginPath();\n  ctx.strokeStyle = asym === 0 ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.2;\n  for (let i = 0; i < pulseLen; i++) {\n    const px = x3 + (i / (pulseLen - 1)) * pW;\n    const py = pY0 + pH - ((pulseY[i] - (-0.25)) / (1.35 - (-0.25))) * pH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  let modeTxt = '零相位 (Zero Phase)';\n  if (asym > 0) modeTxt = '非线性相位 (Nonlinear Phase - 左右边缘不对称)';\n  else if (shift > 0) modeTxt = '线性相位 (Linear Phase - 边缘对称，整体右移 ' + shift + ' 样本)';\n  lab.setReadout('当前状态：' + modeTxt + ' | 奈奎斯特相位 φ(0.5) = ' + phases[Fbins - 1].toFixed(2) + ' rad');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "工程直觉：为什么我们如此在乎相位是否线性？",
      "paragraphs": [
        "看到这里你可能会问：把波形放大、滤波去掉高频噪声不就行了吗，谁在乎相位是弯的还是直的？**脉冲响应（Pulse Response，即一个正阶跃紧跟一个负阶跃）**给出了最残酷的答案。",
        "零相位和线性相位滤波器因为脉冲响应左右对称，所以它们的阶跃响应上下对称——这让方波或脉冲的**上升沿（左边缘）和下降沿（右边缘）长得完全一样**。相反，非线性相位滤波器的左右边缘会呈现出截然不同的畸变形态！",
        "在很多关键工程领域，左右边缘不对称是不可容忍的。比如在**示波器**显示中，非线性相位导致的边缘过冲或拖尾，会被工程师误判成被测信号本身的物理特征；在**图像与视频处理**中，空间滤波如果使用非线性相位，画面物体的左右轮廓会不一样——你能想象打开电视，看到你最喜欢的演员左耳和右耳长得完全不一样吗？",
        "在数字滤波器的两大家族中，**FIR（有限脉冲响应）滤波器**天生很容易做到线性相位，因为我们在设计时直接规定脉冲响应（滤波器核）的数值，只需让系数左右对称即可。但 **IIR（无限脉冲响应/递归）滤波器**却做不到：它直接规定的是递归系数而非脉冲响应。就像桌上由电阻和电容组成的模拟电路一样，信号没来之前输出是 0，脉冲来了之后电容充放电形成指数衰减，永远不可能在时间零点之前“未卜先知”地对称。模拟电路只能用贝塞尔滤波器（Bessel Filter）勉强逼近线性相位，性能远不如数字滤波器。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "递归滤波器的魔法：双向零相位滤波 (Bidirectional Filtering)",
      "paragraphs": [
        "既然单向递归滤波器的脉冲响应总是向右拖尾、不可能对称，我们该如何挽救 IIR 滤波器？答案出奇地优雅：**双向滤波（Bidirectional Filtering）**，也常被称为前向-后向零相位滤波（在 MATLAB/SciPy 中对应经典的 `filtfilt` 函数）。",
        "假设信号共有 0 到 150 个样本。常规的**正向滤波**是从样本 0 算到 150，每个输出只依赖它左边的输入和输出。如果我们反过来，从样本 150 倒推回样本 0，让每个输出只依赖它**右边**的输入和输出，就得到了**反向递归方程（Equation 19-9）**。这在物理上好比把模拟信号倒放着穿过 RC 电路（原书作者还倒着写了一句冷笑话：*Caution- time reversal can screw-up the universe!*）。",
        "单独看反向滤波没有任何好处，脉冲左右边缘依然不对称，只是歪的方向反过来了。但神奇的事情发生在**把信号先正向滤一遍，再将结果反向滤一遍**之后：正向和反向的幅度响应完全相同，因此总幅度响应变成单向的**平方**（滚降更陡峭）；而正向和反向的相位恰好符号相反，相加后**完美抵消为 0**！在时域上，这相当于把原脉冲响应与它左右翻转的版本做卷积，单边指数衰减变成了完美的**双边对称指数衰减**。",
        "这一招对**任何**递归滤波器都有效，唯一的代价是运算时间和代码复杂度翻倍。如果是在线流式系统（每次只读入一小段信号），可以结合**重叠相加（Overlap-Add）法**：虽然理论上 IIR 脉冲响应是无限长的，但在工程上只需在衰减到舍入噪声以下（大约 **15 到 20 个时间常数**）处截断，并在每段信号的**左右两端**都补足相应长度的零，就能无缝实现双向零相位滤波。"
      ],
      "formula": {
        "expr": "y[n] = a₀x[n] + a₁x[n+1] + a₂x[n+2] + ... + b₁y[n+1] + b₂y[n+2] + ...  |  |H_total(f)| = |H(f)|², φ_total(f) = 0",
        "explain": "上式为反向递归方程（下标 n+1, n+2 表示利用右侧未来样本）。正向与反向串联后，总幅度响应平方加强，总相位响应严格归零。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：单极点递归滤波器的双向零相位魔法",
      "instruction": "分别开关「正向滤波」与「反向滤波」，对比矩形脉冲左右边缘的变化；也可点击播放按钮，听辨单向滤波与双向滤波对 120Hz 窄脉冲音色与滚降斜率的影响。",
      "controls": [
        {
          "type": "slider",
          "id": "b1",
          "label": "递归衰减系数 b1",
          "min": 0.5,
          "max": 0.95,
          "step": 0.01,
          "value": 0.86,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "forward",
          "label": "开启正向滤波 (0 → 150)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "reverse",
          "label": "开启反向滤波 (150 → 0)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showImpulse",
          "label": "显示等效脉冲响应 h[n]",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲滤波测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet srcNode = null;\nlet gainNode = null;\n\nfunction applyIIR(arr, b1, fwd, rev) {\n  const a0 = 1 - b1;\n  const L = arr.length;\n  let sig = new Float64Array(arr);\n  if (fwd) {\n    const out = new Float64Array(L);\n    out[0] = a0 * sig[0];\n    for (let i = 1; i < L; i++) {\n      out[i] = a0 * sig[i] + b1 * out[i - 1];\n    }\n    sig = out;\n  }\n  if (rev) {\n    const out = new Float64Array(L);\n    out[L - 1] = a0 * sig[L - 1];\n    for (let i = L - 2; i >= 0; i--) {\n      out[i] = a0 * sig[i] + b1 * out[i + 1];\n    }\n    sig = out;\n  }\n  return sig;\n}\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    try { srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\n\nfunction updateAudio(b1, fwd, rev, isPlaying) {\n  if (!isPlaying) {\n    stopAudio();\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!gainNode) {\n    gainNode = ac.createGain();\n    gainNode.gain.value = 0.22;\n    gainNode.connect(ac.destination);\n  }\n  stopAudio();\n  const sr = ac.sampleRate;\n  const len = Math.floor(sr * 1.0);\n  const raw = new Float64Array(len);\n  const period = sr / 120;\n  for (let i = 0; i < len; i++) {\n    const phase = (i % period) / period;\n    raw[i] = phase < 0.15 ? 0.85 : -0.15;\n  }\n  const filtered = applyIIR(raw, b1, fwd, rev);\n  const buf = ac.createBuffer(1, len, sr);\n  const ch = buf.getChannelData(0);\n  for (let i = 0; i < len; i++) ch[i] = filtered[i];\n\n  srcNode = ac.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start();\n}\n\nfunction render() {\n  const b1 = lab.values.b1;\n  const fwd = lab.values.forward;\n  const rev = lab.values.reverse;\n  const showImp = lab.values.showImpulse;\n  const play = lab.values.play;\n\n  updateAudio(b1, fwd, rev, play);\n\n  const N = 151;\n  const orig = new Float64Array(N);\n  for (let n = 0; n < N; n++) {\n    orig[n] = (n >= 50 && n <= 100) ? 1.0 : 0.0;\n  }\n  const out = applyIIR(orig, b1, fwd, rev);\n\n  let imp = null;\n  if (showImp) {\n    const delta = new Float64Array(N);\n    delta[75] = 1.0;\n    imp = applyIIR(delta, b1, fwd, rev);\n    let maxI = 0;\n    for (let n = 0; n < N; n++) if (imp[n] > maxI) maxI = imp[n];\n    if (maxI > 0) {\n      for (let n = 0; n < N; n++) imp[n] = (imp[n] / maxI) * 0.78;\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const x0 = 56;\n  const y0 = 30;\n  const pW = 636;\n  const pH = 176;\n  const yMin = -0.25;\n  const yMax = 1.25;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, pW, pH);\n\n  ctx.font = '10px monospace';\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  const yTicks = [0.0, 0.5, 1.0];\n  for (let i = 0; i < yTicks.length; i++) {\n    const v = yTicks[i];\n    const py = y0 + pH - ((v - yMin) / (yMax - yMin)) * pH;\n    ctx.beginPath();\n    ctx.moveTo(x0, py);\n    ctx.lineTo(x0 + pW, py);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.textAlign = 'right';\n    ctx.fillText(v.toFixed(1), x0 - 6, py + 3);\n  }\n  for (let n = 0; n <= 150; n += 25) {\n    const px = x0 + (n / 150) * pW;\n    ctx.beginPath();\n    ctx.moveTo(px, y0);\n    ctx.lineTo(px, y0 + pH);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(n), px, y0 + pH + 14);\n  }\n\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.setLineDash([5, 4]);\n  ctx.lineWidth = 1.5;\n  for (let n = 0; n < N; n++) {\n    const px = x0 + (n / 150) * pW;\n    const py = y0 + pH - ((orig[n] - yMin) / (yMax - yMin)) * pH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  if (imp) {\n    ctx.beginPath();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.8;\n    for (let n = 0; n < N; n++) {\n      const px = x0 + (n / 150) * pW;\n      const py = y0 + pH - ((imp[n] - yMin) / (yMax - yMin)) * pH;\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  let color = '#f8fafc';\n  let label = '未开启滤波 (原始矩形脉冲)';\n  if (fwd && rev) {\n    color = '#10b981';\n    label = '⇄ 双向滤波：左右边缘完全对称，实现零相位 (幅度响应平方)';\n  } else if (fwd) {\n    color = '#38bdf8';\n    label = '→ 仅正向滤波：左升右降倒置不对称 (非线性相位)';\n  } else if (rev) {\n    color = '#ec4899';\n    label = '← 仅反向滤波：时间反转的不对称畸变 (非线性相位)';\n  }\n\n  ctx.beginPath();\n  ctx.strokeStyle = color;\n  ctx.lineWidth = 2.5;\n  for (let n = 0; n < N; n++) {\n    const px = x0 + (n / 150) * pW;\n    const py = y0 + pH - ((out[n] - yMin) / (yMax - yMin)) * pH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let n = 0; n < N; n += 2) {\n    const px = x0 + (n / 150) * pW;\n    const py = y0 + pH - ((out[n] - yMin) / (yMax - yMin)) * pH;\n    ctx.fillStyle = color;\n    ctx.fillRect(px - 1.5, py - 1.5, 3, 3);\n  }\n\n  ctx.fillStyle = color;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(label, x0 + 8, y0 - 10);\n\n  const tau = (-1 / Math.log(b1)).toFixed(1);\n  lab.setReadout('递归系数 b1 = ' + b1.toFixed(2) + ' | 时间常数 τ ≈ ' + tau + ' 样本 | 截断建议(18τ) ≈ ' + Math.ceil(18 * Number(tau)) + ' 样本');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "概念避坑：‘线性相位’是指相位随频率呈直线变化（脉冲响应左右对称），与‘线性系统（叠加性）’是两个完全无关的概念。",
        "边缘对称性决定选型：示波器测量、图像/视频处理绝不能让脉冲左右边缘失真，必须选用零相位或线性相位；而对离线数据使用 IIR 滤波器时，务必采用‘正向+反向’双向滤波。",
        "幅度响应会平方：对递归滤波器做双向滤波后，总幅度响应变为 |H(f)|²（通带衰减加倍、截止频率略微变窄），工程上设计单向系数时需提前预留余量。",
        "流式分段处理的零填充：将双向滤波用于重叠相加（Overlap-Add）流式处理时，IIR 脉冲响应可在 15~20 个时间常数处安全截断，并且必须在每段信号的左右两端同时补零。"
      ]
    }
  ]
});
