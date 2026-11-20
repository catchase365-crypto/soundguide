window.__BOOK_REGISTER_SECTION__("sec_073", {
  "title": "零相位、线性相位与非线性相位 (Zero, Linear, and Nonlinear Phase)",
  "intuition": "信号在时域里的左右对称性，直接决定了它在频域里的相位是不是一条直线——零相位对称于原点，线性相位对称于非零点（仅多了一段纯平移），非线性相位则失去了对称性并会打乱波形形状。",
  "blocks": [
    {
      "type": "concept",
      "heading": "时域对称性：一眼区分三种相位",
      "paragraphs": [
        "在数字信号处理中，我们常常听到**零相位（Zero Phase）**、**线性相位（Linear Phase）**和**非线性相位（Nonlinear Phase）**这三个词。其实在时域里分辨它们非常直观，只需看信号波形是否具有**左右对称性**：",
        "1. **零相位**：信号以样本序号 `n = 0` 为中心严格左右对称（如图 7-7a 所示）。原点左边第 `k` 个样本和右边第 `k` 个样本完全相等。",
        "2. **线性相位**：信号依然具有完美的左右对称性，但对称轴不在原点，而是位于某个非零样本点 `n = d`（如图 7-7b 所示，对称轴在 `n = 5`）。任何线性相位信号，只要整体向左或向右平移 `d` 个样本，就能立刻变成零相位信号。",
        "3. **非线性相位**：信号根本不具备左右对称性（如图 7-7c 所示的单边衰减信号）。无论你把它向左还是向右平移多少个样本，都不可能让它左右对称。"
      ],
      "formula": {
        "expr": "零相位: x[-n] = x[n]   |   线性相位: x[d - n] = x[d + n]",
        "explain": "n 为样本索引，d 为对称中心偏移量（样本数）。当 d = 0 时，线性相位退化为零相位；若找不到任何 d 满足等式，则为非线性相位。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：对称轴平移、非对称畸变与频域相位曲线",
      "instruction": "拖动「对称中心偏移 d」观察信号从零相位变为线性相位（相位呈直线倾斜）；调大「非对称畸变」观察图形失去对称性并导致相位曲线弯曲。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "对称中心偏移 d",
          "min": -8,
          "max": 8,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "asym",
          "label": "非对称畸变",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "显示零相位参考虚线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const d = lab.values.shift;\n  const asym = lab.values.asym / 100;\n  const showRef = lab.values.showRef;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const N_MIN = -16, N_MAX = 16;\n  const h = [];\n  const hRef = [];\n  for (let n = N_MIN; n <= N_MAX; n++) {\n    const k = n - d;\n    const sym = 0.24 * (1 - 0.12 * k * k) * Math.exp(-0.16 * k * k);\n    const causal = k >= 0 ? 0.24 * Math.exp(-0.26 * k) : 0;\n    h.push((1 - asym) * sym + asym * causal);\n    hRef.push(0.24 * (1 - 0.12 * n * n) * Math.exp(-0.16 * n * n));\n  }\n\n  const lx0 = 32, lx1 = 356, lyBase = 175, lyScale = 520;\n  const rx0 = 408, rx1 = 696, ryMid = 122;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v = -0.1; v <= 0.31; v += 0.1) {\n    const y = lyBase - v * lyScale;\n    ctx.beginPath(); ctx.moveTo(lx0, y); ctx.lineTo(lx1, y); ctx.stroke();\n  }\n  for (let n = -15; n <= 15; n += 5) {\n    const x = lx0 + ((n - N_MIN) / (N_MAX - N_MIN)) * (lx1 - lx0);\n    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, 212); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx0, lyBase); ctx.lineTo(lx1, lyBase); ctx.stroke();\n  const xZero = lx0 + ((0 - N_MIN) / (N_MAX - N_MIN)) * (lx1 - lx0);\n  ctx.beginPath(); ctx.moveTo(xZero, 26); ctx.lineTo(xZero, 212); ctx.stroke();\n\n  if (asym === 0 && d !== 0) {\n    const xSym = lx0 + ((d - N_MIN) / (N_MAX - N_MIN)) * (lx1 - lx0);\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.beginPath(); ctx.moveTo(xSym, 26); ctx.lineTo(xSym, 212); ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showRef && (d !== 0 || asym > 0)) {\n    ctx.save();\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < hRef.length; i++) {\n      const n = N_MIN + i;\n      const x = lx0 + ((n - N_MIN) / (N_MAX - N_MIN)) * (lx1 - lx0);\n      const y = lyBase - hRef[i] * lyScale;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  let sigColor = '#10b981';\n  let modeName = '零相位 (Zero Phase)';\n  if (asym > 0) {\n    sigColor = '#ec4899';\n    modeName = '非线性相位 (Nonlinear Phase)';\n  } else if (d !== 0) {\n    sigColor = '#38bdf8';\n    modeName = '线性相位 (Linear Phase)';\n  }\n\n  ctx.strokeStyle = sigColor;\n  ctx.fillStyle = sigColor;\n  ctx.lineWidth = 1.5;\n  for (let i = 0; i < h.length; i++) {\n    const n = N_MIN + i;\n    const x = lx0 + ((n - N_MIN) / (N_MAX - N_MIN)) * (lx1 - lx0);\n    const y = lyBase - h[i] * lyScale;\n    ctx.beginPath(); ctx.moveTo(x, lyBase); ctx.lineTo(x, y); ctx.stroke();\n    ctx.fillRect(x - 2.5, y - 2.5, 5, 5);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域波形 h[n] (样本 n = -16..16)', lx0, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', xZero - 3, 224);\n  ctx.fillText('-15', lx0 + 4, 224);\n  ctx.fillText('+15', lx1 - 22, 224);\n\n  const M = 64;\n  const W_MAX = 0.65 * Math.PI;\n  const phases = [];\n  let prevRaw = 0, acc = 0;\n  for (let m = 0; m <= M; m++) {\n    const w = (m / M) * W_MAX;\n    let re = 0, im = 0;\n    for (let i = 0; i < h.length; i++) {\n      const n = N_MIN + i;\n      re += h[i] * Math.cos(w * n);\n      im -= h[i] * Math.sin(w * n);\n    }\n    const raw = Math.atan2(im, re);\n    if (m === 0) {\n      prevRaw = raw;\n      acc = raw;\n    } else {\n      let delta = raw - prevRaw;\n      while (delta > Math.PI) delta -= 2 * Math.PI;\n      while (delta < -Math.PI) delta += 2 * Math.PI;\n      acc += delta;\n      prevRaw = raw;\n    }\n    phases.push(acc);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let p = -12; p <= 12; p += 4) {\n    const y = ryMid - (p / 16) * 86;\n    ctx.beginPath(); ctx.moveTo(rx0, y); ctx.lineTo(rx1, y); ctx.stroke();\n  }\n  for (let f = 0; f <= 4; f++) {\n    const x = rx0 + (f / 4) * (rx1 - rx0);\n    ctx.beginPath(); ctx.moveTo(x, 26); ctx.lineTo(x, 212); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(rx0, ryMid); ctx.lineTo(rx1, ryMid); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx0, 26); ctx.lineTo(rx0, 212); ctx.stroke();\n\n  if (asym > 0) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(rx0, ryMid);\n    ctx.lineTo(rx1, ryMid - ((-d * W_MAX) / 16) * 86);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = sigColor;\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let m = 0; m <= M; m++) {\n    const x = rx0 + (m / M) * (rx1 - rx0);\n    const y = Math.max(26, Math.min(212, ryMid - (phases[m] / 16) * 86));\n    if (m === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频谱相位 φ(ω) (展开相位)', rx0, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('ω=0', rx0, 224);\n  ctx.fillText('0.65π', rx1 - 28, 224);\n  ctx.fillText('0 rad', rx0 - 28, ryMid + 4);\n\n  lab.setReadout(`当前判定: ${modeName} | 对称中心 d = ${d} | 非对称畸变 = ${lab.values.asym}%`);\n});"
    },
    {
      "type": "concept",
      "heading": "为什么时域“对称”会变成频域里的“直线”？",
      "paragraphs": [
        "初次接触时，很多人会疑惑：**“左右对称”听起来纯粹是时域几何形状，和“相位”有什么关系？** 答案藏在信号的**频谱（Frequency Spectrum）**里。",
        "任何信号的频谱都由两部分组成：**幅度（Magnitude）**和**相位（Phase）**。从傅里叶变换的角度看，任何信号都可以分解成无数个正弦波和余弦波之和。其中余弦波是偶对称的，正弦波是奇对称的：",
        "• 当信号**以 0 点对称**时，所有奇对称的正弦分量全部相互抵消，频谱的虚部为零，因此所有频率的相位都恰好是 **0**——这就是**零相位**名字的由来。",
        "• 当信号**以非零点 `d` 对称**时，相当于把零相位信号整体延迟（或提前）了 `d` 个样本。在频域里，时间平移 `d` 会让每个频率 `ω` 的余弦波产生 `-ω·d` 的相位滞后。因为斜率 `-d` 是常数，所以相位 `φ(ω) = -d·ω` 随频率变化的图像正是一条穿过原点的**直线**——这就是**线性相位**的名字由来！",
        "• 如果信号**不对称**，正弦分量无法消除，不同频率成分的延迟时间各不相同，相位图就不再是直线，因此被称为**非线性相位**。"
      ],
      "formula": {
        "expr": "H(ω) = |H(ω)| · e^(-j·ω·d)  ⇒  φ(ω) = -d · ω",
        "explain": "|H(ω)| 是幅度谱；e^(-jωd) 表示纯时间平移 d 个样本引起的相移；φ(ω) 是相位谱，随频率 ω 呈斜率为 -d 的严格直线关系。"
      }
    },
    {
      "type": "concept",
      "heading": "核心避坑：线性相位 ≠ 线性系统！",
      "paragraphs": [
        "本书作者 Steven W. Smith 特别发出警告：**绝对不要把“线性相位 / 非线性相位”与前面章节学过的“线性系统（Linear System）”混为一谈！** 它们是两个完全不同的概念：",
        "• **系统线性（System Linearity）** 是几乎整个数字信号处理（DSP）的基石，它指的是系统满足**叠加性（Superposition）**、**齐次性（Homogeneity）**与**可加性（Additivity）**。",
        "• **相位线性（Phase Linearity）** 仅仅用来描述频谱中的**相位曲线是不是一条直线**。",
        "事实上，讨论“一个系统的相位是零相位、线性相位还是非线性相位”有一个大前提——**这个系统本身必须首先是一个线性系统**。非线性系统根本无法用单一的频率响应和相位曲线来刻画。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：相位线性度如何影响波形保真与脉冲听感",
      "instruction": "拖动「线性延迟 d」观察纯平移如何完整保留尖峰形状；拖动「非线性色散」观察不同频率谐波错位导致的波形坍塌，并可点击播放按钮对比音色锐度的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "delay",
          "label": "线性延迟偏移 d",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 0,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "dispersion",
          "label": "非线性相位色散",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放谐波脉冲音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gainNode = null;\n\nlab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const d = lab.values.delay;\n  const disp = lab.values.dispersion / 100;\n  const isPlaying = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const PERIOD = 64;\n  const K = 10;\n  const amps = [];\n  let maxRef = 0;\n  for (let k = 1; k <= K; k++) {\n    const a = 1 / (1 + 0.1 * k);\n    amps.push(a);\n    maxRef += a;\n  }\n\n  const N_START = -16, N_END = 80;\n  const samplesRef = [];\n  const samplesOut = [];\n  let peakOut = 0;\n\n  for (let i = 0; i <= 384; i++) {\n    const n = N_START + (i / 384) * (N_END - N_START);\n    let yRef = 0, yOut = 0;\n    for (let k = 1; k <= K; k++) {\n      const a = amps[k - 1];\n      const w = (2 * Math.PI * k) / PERIOD;\n      yRef += a * Math.cos(w * n);\n      const phiNL = disp * 0.42 * k * k;\n      yOut += a * Math.cos(w * (n - d) + phiNL);\n    }\n    samplesRef.push(yRef);\n    samplesOut.push(yOut);\n    if (Math.abs(yOut) > peakOut) peakOut = Math.abs(yOut);\n  }\n\n  const padL = 44, padR = 24, yMid = 132, yScale = 14;\n  const plotW = W - padL - padR;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -6; g <= 8; g += 2) {\n    const y = yMid - g * yScale;\n    if (y >= 24 && y <= 216) {\n      ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();\n    }\n  }\n  for (let n = -16; n <= 80; n += 16) {\n    const x = padL + ((n - N_START) / (N_END - N_START)) * plotW;\n    ctx.beginPath(); ctx.moveTo(x, 24); ctx.lineTo(x, 216); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(padL, yMid); ctx.lineTo(W - padR, yMid); ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i < samplesRef.length; i++) {\n    const x = padL + (i / (samplesRef.length - 1)) * plotW;\n    const y = yMid - samplesRef[i] * yScale;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  const outColor = disp > 0 ? '#ec4899' : (d > 0 ? '#38bdf8' : '#10b981');\n  ctx.strokeStyle = outColor;\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i < samplesOut.length; i++) {\n    const x = padL + (i / (samplesOut.length - 1)) * plotW;\n    const y = yMid - samplesOut[i] * yScale;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('虚线: 原始零相位脉冲   |   实线: 经过相移后的输出波形', padL, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('n = 0', padL + ((0 - N_START) / (N_END - N_START)) * plotW - 12, 228);\n  ctx.fillText('n = 64 (下一周期)', padL + ((64 - N_START) / (N_END - N_START)) * plotW - 36, 228);\n\n  if (isPlaying) {\n    const actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    if (!osc) {\n      osc = actx.createOscillator();\n      gainNode = actx.createGain();\n      gainNode.gain.value = 0.14;\n      osc.frequency.value = 140;\n      osc.connect(gainNode);\n      gainNode.connect(actx.destination);\n      osc.start();\n    }\n    const real = new Float32Array(K + 1);\n    const imag = new Float32Array(K + 1);\n    for (let k = 1; k <= K; k++) {\n      const a = amps[k - 1];\n      const theta = -(2 * Math.PI * k * d) / PERIOD + disp * 0.42 * k * k;\n      real[k] = a * Math.cos(theta);\n      imag[k] = -a * Math.sin(theta);\n    }\n    const wave = actx.createPeriodicWave(real, imag);\n    osc.setPeriodicWave(wave);\n  } else if (osc) {\n    try { osc.stop(); osc.disconnect(); gainNode.disconnect(); } catch (e) {}\n    osc = null;\n    gainNode = null;\n  }\n\n  const ratio = Math.round((peakOut / maxRef) * 100);\n  const stateLabel = disp > 0 ? '非线性色散失真' : (d > 0 ? '线性相位（形状100%保真）' : '零相位（原位保真）');\n  lab.setReadout(`${stateLabel} | 峰值保持率: ${ratio}% | 延迟 d = ${d} | 色散 = ${lab.values.dispersion}%`);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "对称即线性：想在时域里快速判断一个 FIR 滤波器是不是线性相位，根本不用算傅里叶变换——直接看它的脉冲响应系数是不是左右对称即可；如果刚好以 0 点对称，就是零相位。",
        "因果系统做不到真正的零相位：零相位需要信号在 n < 0 的“未来/过去”两侧对称，实时在线系统无法预知未来，因此工程中只能把对称中心向右平移 d 个样本，用“线性相位”来完美保留波形形状（代价是产生 d 个样本的固定延迟）。",
        "波形保真靠线性相位：非线性相位虽然可能完全不改变各频率的幅度大小（例如全通滤波器），但它会让高频和低频不同步到达，导致尖锐脉冲坍塌弥散（波形严重变形）。",
        "术语避坑：线性相位（相位图是直线）和线性系统（满足叠加原理）毫无关系；只有在线性系统中，讨论零相位、线性相位或非线性相位才有意义。"
      ]
    }
  ]
});
