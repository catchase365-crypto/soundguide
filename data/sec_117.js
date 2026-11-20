window.__BOOK_REGISTER_SECTION__("sec_117", {
  "title": "谐波、畸变对称性与离散混叠 (Harmonics)",
  "intuition": "周期信号的任何波形畸变，在频域上都表现为在基频整数倍处长出谐波；一旦进入离散数字世界，高频谐波不仅会折叠混叠，还揭示了 DFT 时频两域皆周期的数学宿命。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是谐波？基频与波形对称性的频域密码",
      "paragraphs": [
        "如果一个信号以频率 `f` 做周期性重复，那么组成这个信号的频率成分**只能**是 `f` 的整数倍，即 `f, 2f, 3f, 4f, ...`。这些整数倍频率统称为**谐波 (Harmonics)**。其中 `1f` 叫**一次谐波**，它还有个专属名字叫**基频 (Fundamental Frequency)**；`2f` 叫二次谐波，`3f` 叫三次谐波，以此类推。",
        "纯粹的正弦波在频域上只有基频 `f` 一根孤立的谱线。但只要你把正弦波的波峰稍微“压瘪”或戳出一个凹陷（**非线性畸变**），只要畸变后的信号依然以原频率 `f` 周期重复，它的频谱就会在保持基频主峰的同时，在 `2f, 3f, 4f...` 的位置长出一串谐波。信号越尖锐、边缘变化越剧烈，高频谐波就越丰富——例如一个常见的 **1 kHz** TTL 逻辑门方波，由于上升沿只需几纳秒，其激发出的谐波可以一路冲到接近 **100 MHz**（数万次谐波）！",
        "谐波分布还藏着一个精妙的**对称性法则**：如果畸变是**非对称的**（比如只把上方波峰压瘪，下方波谷完好），频谱中会同时包含**奇次谐波**（`1f, 3f, 5f...`）和**偶次谐波**（`2f, 4f, 6f...`）；但如果波形围绕水平零轴完全**对称**（上半周与下半周互为镜像反转），那么**所有偶次谐波的幅度都会严格归零**，信号中只剩下基频和奇次谐波！"
      ],
      "formula": {
        "expr": "x(t) = A_0 + Σ_{k=1}^{∞} A_k · sin(2π · k · f · t + φ_k)",
        "explain": "A_0 是直流偏置（0次谐波）；f 是基频；整数 k 代表第 k 次谐波（k=1 为基频，k=2,4... 为偶次谐波，k=3,5... 为奇次谐波）；A_k 和 φ_k 分别是第 k 次谐波的幅度与相位。波形关于零轴镜像对称时，所有偶数 k 的 A_k 恒为 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：对称 vs 非对称畸变与听感对比",
      "instruction": "分别拖动「非对称畸变」与「对称畸变」滑块观察波形与偶/奇次谐波（橙色 vs 天蓝色）的消长，开启音频可实时听辨音色差异。",
      "controls": [
        {
          "type": "slider",
          "id": "asym",
          "label": "非对称畸变 (仅波峰内凹)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sym",
          "label": "对称畸变 (上下镜像内凹)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 220Hz 谐波音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet osc = null;\nlet shaper = null;\nlet gain = null;\n\nfunction distort(x, asym, sym) {\n  let y = x - sym * 0.48 * Math.pow(Math.abs(x), 6) * x;\n  if (x > 0) {\n    y -= asym * 0.48 * Math.pow(x, 7);\n  }\n  return Math.max(-1.2, Math.min(1.2, y));\n}\n\nfunction makeCurve(asym, sym) {\n  const n = 1025;\n  const curve = new Float32Array(n);\n  for (let i = 0; i < n; i++) {\n    const x = (i * 2) / (n - 1) - 1;\n    curve[i] = distort(x, asym, sym) * 0.85;\n  }\n  return curve;\n}\n\nfunction syncAudio(asym, sym, play) {\n  if (play) {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      osc.type = 'sine';\n      osc.frequency.value = 220;\n      shaper = ac.createWaveShaper();\n      shaper.oversample = '4x';\n      gain = ac.createGain();\n      gain.gain.value = 0;\n      osc.connect(shaper);\n      shaper.connect(gain);\n      gain.connect(ac.destination);\n      osc.start();\n    }\n    shaper.curve = makeCurve(asym, sym);\n    gain.gain.setTargetAtTime(0.18, ac.currentTime, 0.02);\n  } else if (gain) {\n    const ac = lab.getAudioContext();\n    if (ac) gain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n  }\n}\n\nlab.onUpdate(() => {\n  const asym = lab.values.asym;\n  const sym = lab.values.sym;\n  const play = !!lab.values.play;\n  syncAudio(asym, sym, play);\n\n  ctx.clearRect(0, 0, W, H);\n  const midX = W / 2;\n  const leftX = 24;\n  const leftW = midX - leftX - 18;\n  const rightX = midX + 24;\n  const rightW = W - rightX - 16;\n  const topY = 28;\n  const plotH = H - topY - 26;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = topY + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(leftX, y);\n    ctx.lineTo(leftX + leftW, y);\n    ctx.moveTo(rightX, y);\n    ctx.lineTo(rightX + rightW, y);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(midX, 10);\n  ctx.lineTo(midX, H - 10);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域波形 (Time Domain)', leftX, 16);\n  ctx.fillText('频域谐波 (Frequency Domain)', rightX, 16);\n\n  const N = 256;\n  const samples = new Float32Array(N);\n  for (let n = 0; n < N; n++) {\n    const s = Math.sin((2 * Math.PI * n) / N);\n    samples[n] = distort(s, asym, sym);\n  }\n\n  const timeMidY = topY + plotH / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(leftX, timeMidY);\n  ctx.lineTo(leftX + leftW, timeMidY);\n  ctx.stroke();\n\n  const cycles = 3;\n  ctx.strokeStyle = 'rgba(248,250,252,0.18)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= 240; i++) {\n    const px = leftX + (i / 240) * leftW;\n    const py = timeMidY - Math.sin((2 * Math.PI * cycles * i) / 240) * (plotH * 0.43);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 300; i++) {\n    const s = Math.sin((2 * Math.PI * cycles * i) / 300);\n    const val = distort(s, asym, sym);\n    const px = leftX + (i / 300) * leftW;\n    const py = timeMidY - val * (plotH * 0.43);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.lineWidth = 1;\n\n  const maxK = 11;\n  const mags = [];\n  for (let k = 0; k <= maxK; k++) {\n    let re = 0;\n    let im = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * k * n) / N;\n      re += samples[n] * Math.cos(ang);\n      im -= samples[n] * Math.sin(ang);\n    }\n    const mag = k === 0 ? Math.abs(re) / N : (2 * Math.hypot(re, im)) / N;\n    mags.push(mag);\n  }\n\n  const barSlot = rightW / (maxK + 1);\n  const barW = Math.max(8, barSlot * 0.56);\n  const baseLine = topY + plotH;\n\n  for (let k = 0; k <= maxK; k++) {\n    const m = mags[k];\n    const barH = Math.min(plotH, (m / 1.05) * plotH);\n    const bx = rightX + k * barSlot + (barSlot - barW) / 2;\n    const by = baseLine - barH;\n    if (k === 0) ctx.fillStyle = '#ec4899';\n    else if (k % 2 === 1) ctx.fillStyle = '#38bdf8';\n    else ctx.fillStyle = '#f59e0b';\n    if (barH > 1) ctx.fillRect(bx, by, barW, barH);\n    else ctx.fillRect(bx, baseLine - 1, barW, 1);\n    ctx.fillStyle = 'rgba(248,250,252,0.68)';\n    ctx.font = '10px monospace';\n    const lbl = k === 0 ? 'DC' : k + 'f';\n    ctx.fillText(lbl, bx + (k >= 10 ? -1 : 2), H - 10);\n  }\n\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('■ 奇次', rightX + rightW - 96, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('■ 偶次', rightX + rightW - 48, 16);\n\n  lab.setReadout('基频 1f=' + mags[1].toFixed(2) + ' | 2f(偶)=' + mags[2].toFixed(3) + ' | 3f(奇)=' + mags[3].toFixed(3) + ' | 4f(偶)=' + mags[4].toFixed(3) + ' | DC=' + mags[0].toFixed(3));\n});"
    },
    {
      "type": "concept",
      "heading": "离散信号的陷阱：谐波混叠 (Harmonic Aliasing)",
      "paragraphs": [
        "前面讨论的完美谐波分解只对**连续**周期信号成立。一旦信号变成**离散**的数字采样序列，一个幽灵就会出来捣乱——**混叠 (Aliasing)**。",
        "假设我们对一个高频正弦波直接进行数字非线性畸变（例如直接对数字采样点做削波、平方或波形折叠）。这些畸变产生的高次谐波很容易超过奈奎斯特极限 `0.5 fs`（采样率的一半）。由于数字序列无法表达高于 `0.5 fs` 的频率，所有越界的谐波都会像照镜子一样**折叠混叠**回 `[0, 0.5 fs]` 区间内。",
        "在线性幅度坐标下，这些高次谐波本身能量很小，你几乎看不见它们，以为频谱很干净。但只要你把纵轴切换成**对数坐标 (Log Scale)**，就会惊恐地发现底部密密麻麻铺满了尖峰——第一眼看去像是随机底噪，其实它们是无数高次谐波折叠重叠后的伪影！",
        "工程上必须区分畸变发生的时机：如果畸变发生在**模拟电路阶段**（数字化之前），只需在 ADC 之前放一个抗混叠低通滤波器即可把高频谐波全部挡在门外；**只有当非线性运算直接施加在已经数字化的离散信号上时**，才会产生谐波混叠问题。幸运的是，很多情况下这些混叠谐波的幅度低到可以忽略（必要时可通过过采样来缓解）。"
      ],
      "formula": {
        "expr": "f_alias = | k · f_0 - m · f_s |  ∈ [0, 0.5 f_s]",
        "explain": "当第 k 次谐波频率 k·f_0 超过 0.5 f_s 时，它会与最近的采样率整数倍 m·f_s 做差并取绝对值，折叠落入 0 到 0.5 f_s 之间成为假频。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：对数频谱显微镜下的谐波混叠",
      "instruction": "观察高频离散信号（0.11 fs）的波形粗糙感，然后打开「对数坐标」开关，查看线性坐标下隐身的大量折叠混叠峰（橙色）。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "归一化基频 f₀",
          "min": 0.04,
          "max": 0.22,
          "step": 0.01,
          "value": 0.11,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "clip",
          "label": "数字畸变强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "logScale",
          "label": "对数坐标 (Log Scale)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction distortSharp(s, clip) {\n  if (s > 0.62) {\n    return s - clip * 1.65 * (s - 0.62);\n  }\n  return s;\n}\n\nlab.onUpdate(() => {\n  const freq = lab.values.freq;\n  const clip = lab.values.clip;\n  const logScale = !!lab.values.logScale;\n\n  ctx.clearRect(0, 0, W, H);\n  const midX = W / 2;\n  const leftX = 24;\n  const leftW = midX - leftX - 18;\n  const rightX = midX + 38;\n  const rightW = W - rightX - 16;\n  const topY = 28;\n  const plotH = H - topY - 26;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  const gridRows = logScale ? 5 : 4;\n  for (let i = 0; i <= gridRows; i++) {\n    const y = topY + (plotH * i) / gridRows;\n    ctx.beginPath();\n    ctx.moveTo(rightX, y);\n    ctx.lineTo(rightX + rightW, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const y = topY + (plotH * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(leftX, y);\n    ctx.lineTo(leftX + leftW, y);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(midX, 10);\n  ctx.lineTo(midX, H - 10);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('离散畸变波形 (前 45 点)', leftX, 16);\n  ctx.fillText(logScale ? '频谱 (对数 10⁰~10⁻⁵)' : '频谱 (线性 0~1.0)', rightX, 16);\n\n  const N = 200;\n  const samples = new Float32Array(N);\n  for (let n = 0; n < N; n++) {\n    const s = Math.sin(2 * Math.PI * freq * n);\n    samples[n] = distortSharp(s, clip);\n  }\n\n  const timeMidY = topY + plotH / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(leftX, timeMidY);\n  ctx.lineTo(leftX + leftW, timeMidY);\n  ctx.stroke();\n\n  const showN = 45;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let n = 0; n < showN; n++) {\n    const px = leftX + (n / (showN - 1)) * leftW;\n    const py = timeMidY - samples[n] * (plotH * 0.43);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  for (let n = 0; n < showN; n++) {\n    const px = leftX + (n / (showN - 1)) * leftW;\n    const py = timeMidY - samples[n] * (plotH * 0.43);\n    ctx.fillRect(px - 1.8, py - 1.8, 3.6, 3.6);\n  }\n  ctx.lineWidth = 1;\n\n  const bins = N / 2;\n  const mags = new Float32Array(bins + 1);\n  for (let k = 0; k <= bins; k++) {\n    let re = 0;\n    let im = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * k * n) / N;\n      re += samples[n] * Math.cos(ang);\n      im -= samples[n] * Math.sin(ang);\n    }\n    mags[k] = k === 0 ? Math.abs(re) / N : (2 * Math.hypot(re, im)) / N;\n  }\n\n  const k0 = Math.round(freq * N);\n  const unaliasedSet = new Set();\n  const maxHarmonic = Math.floor(0.5 / freq);\n  for (let m = 1; m <= maxHarmonic; m++) {\n    unaliasedSet.add(m * k0);\n  }\n\n  if (logScale) {\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '10px monospace';\n    const labels = ['10⁰', '10⁻¹', '10⁻²', '10⁻³', '10⁻⁴', '10⁻⁵'];\n    for (let i = 0; i <= 5; i++) {\n      ctx.fillText(labels[i], rightX - 28, topY + (plotH * i) / 5 + 3);\n    }\n  } else {\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    ctx.font = '10px monospace';\n    ctx.fillText('1.0', rightX - 24, topY + 4);\n    ctx.fillText('0.5', rightX - 24, topY + plotH / 2 + 4);\n    ctx.fillText('0.0', rightX - 24, topY + plotH + 4);\n  }\n\n  const baseLine = topY + plotH;\n  let aliasedCount = 0;\n  for (let k = 0; k <= bins; k++) {\n    const m = mags[k];\n    let h = 0;\n    if (logScale) {\n      const lg = Math.log10(Math.max(1e-5, m));\n      h = Math.max(0, Math.min(1, (lg + 5) / 5)) * plotH;\n    } else {\n      h = Math.max(0, Math.min(1, m)) * plotH;\n    }\n    const px = rightX + (k / bins) * rightW;\n    if (k === 0) ctx.strokeStyle = '#ec4899';\n    else if (unaliasedSet.has(k)) ctx.strokeStyle = '#38bdf8';\n    else {\n      ctx.strokeStyle = '#f59e0b';\n      if (m > 1e-4) aliasedCount++;\n    }\n    if (h > 0.5) {\n      ctx.lineWidth = unaliasedSet.has(k) ? 2.4 : 1.5;\n      ctx.beginPath();\n      ctx.moveTo(px, baseLine);\n      ctx.lineTo(px, baseLine - h);\n      ctx.stroke();\n    }\n  }\n  ctx.lineWidth = 1;\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '10px monospace';\n  for (let i = 0; i <= 5; i++) {\n    const fv = (i * 0.1).toFixed(1);\n    ctx.fillText(fv, rightX + (i / 5) * rightW - 8, H - 10);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('■ 原生谐波', rightX + rightW - 120, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('■ 混叠假峰', rightX + rightW - 58, 16);\n\n  const spc = (1 / freq).toFixed(1);\n  lab.setReadout('每周期采样=' + spc + '点 | 奈奎斯特内原生谐波=' + maxHarmonic + '阶 | 检测到显著混叠峰数=' + aliasedCount);\n});"
    },
    {
      "type": "concept",
      "heading": "谐波如何解释 DFT 的“两域皆周期”？",
      "paragraphs": [
        "谐波概念还有另一个极其深刻的理论价值：它直接解释了为什么离散傅里叶变换（DFT）会认为**时域和频域都是周期的**。",
        "在频域里，一个 `N` 点的 DFT 只包含 `N/2 + 1` 个等间距的离散频率点。你可以把这些离散点**之间**的缝隙看成（1）幅度为零，或者（2）根本不存在——无论怎么看，缝隙都不参与时域信号的合成。换句话说，**离散频谱本质上就是由一组谐波构成的**，而不是连续的频率分布！",
        "除了直流分量（0 频），频域里最低的那个非零正弦波频率恰好每 `N` 个采样点完成一个完整周期。既然整个时域信号只能由这个最低频率的整数倍（谐波）叠加而成，那就强制要求时域信号也必须以 `N` 为周期不断重复！",
        "由此得出整个傅里叶变换家族（共 4 位成员）最核心的对偶定律：**只要一个域是离散的，另一个域就必须是周期的，反之亦然**。正因为 DFT 在时域和频域两边都是离散采样点，它注定同时把时域和频域都视为无限周期重复，每一域的采样点都代表了另一域周期性的谐波。"
      ],
      "formula": {
        "expr": "一个域离散 (Discrete)  ⟺  另一个域周期 (Periodic)",
        "explain": "频域按 Δf = 1/N 离散采样，迫使时域成为以基频 1/N 为底的谐波叠加，即周期为 N；同理时域按 Δt 离散采样，迫使频域以 fs 为周期无限延拓（产生混叠的基础）。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "奇偶对称判谐波：如果非线性畸变关于水平轴镜像对称（如纯奇函数饱和削波 `tanh`），只产生奇次谐波；一旦加入直流偏置或不对称削波，偶次谐波立刻出现。",
        "尖锐边缘决定带宽：波形的跳变沿越陡（上升时间越短），高次谐波衰减越慢，电路与数字系统需要留出远高于基频的带宽（如 1 kHz 方波可辐射至上百 MHz）。",
        "数字非线性必防混叠：在 ADC 之前，用模拟抗混叠滤波器即可滤除谐波；但若在数字域直接做削波、乘法调制、整流等非线性操作，超过 0.5 fs 的谐波必然折叠回来形成类似底噪的混叠峰（音频 DSP 中常通过 4x/8x 过采样来化解）。",
        "牢记 DFT 周期性宿命：频域离散等价于把时域看成基频为 1/N 的谐波级数；做频域滤波或截断时，永远记住 N 点首尾是首尾相连循环周期的。"
      ]
    }
  ]
});
