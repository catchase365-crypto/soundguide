window.__BOOK_REGISTER_SECTION__("sec_158", {
  "title": "第一回合：模拟滤波器 vs. 数字滤波器 (Analog vs. Digital Filters)",
  "intuition": "在滤波指标本身（平坦度、衰减深度、线性相位）上，数字滤波器对模拟滤波器是压倒性的降维打击；但模拟电路凭借物理级的超高速度、千万级幅度动态范围与横跨七个数量级的频率跨度，依然牢牢守住硬件前端的不可替代地位。",
  "blocks": [
    {
      "type": "concept",
      "heading": "公平擂台与第一滴血：通带平坦度的物理极限",
      "paragraphs": [
        "绝大多数数字信号都源于模拟电子世界。当信号需要滤波时，我们面临一个经典架构抉择：**是在模数转换（ADC）之前用模拟滤波器处理，还是在数字化之后用数字滤波器处理？** 为了公平裁决，我们设定一个完全一致的实战目标——**1 kHz 低通滤波器**，让双方最强的常规选手同台打擂。",
        "模拟方派出的是 **6 极点、0.5 dB（约 6%）波纹的切比雪夫（Chebyshev）滤波器**，由 3 个运放、12 个电阻和 6 个电容搭成。数字方派出的是 **129 点加窗 Sinc（Windowed-Sinc）滤波器**：模拟信号以 **10 kHz** 采样率数字化，1 kHz 截止频率对应数字频率刻度上的 `0.1`，选择 129 点核长度恰好使其 90% 到 10% 的滚降斜率与模拟切比雪夫完全一致，绝对公平。",
        "第一回合比拼**通带平坦度（Passband Flatness）**。实测显示，模拟滤波器在通带内存在 6% 的明显波纹，而数字滤波器几乎是一条完美的直线（起伏小于 **0.02%**）。也许模拟工程师会辩解：“把切比雪夫换成 0% 波纹的巴特沃斯（Butterworth）不就行了吗？”这恰恰漏掉了物理现实——模拟滤波器的平坦度受限于电阻和电容的制造精度与温漂，即便设计为 0% 理想平坦，6 极点复杂度的电路仍会残留约 **1%** 的真实波纹；而数字滤波器的平坦度仅受限于计算机浮点舍入误差，比模拟电路平坦数百倍。**数字方先得 1 分！**"
      ],
      "formula": {
        "expr": "f_digital = f_analog / f_s = 1 kHz / 10 kHz = 0.1",
        "explain": "f_analog 为模拟截止频率，f_s 为采样率，f_digital 为归一化数字频率（范围 0 到 0.5 奈奎斯特频率），是连接模拟物理时间与数字离散序列的桥梁。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：1 kHz 低通擂台实测（幅频 / dB衰减 / 阶跃响应与听感）",
      "instruction": "切换视图模式对比两者在幅频、对数衰减和阶跃对称性上的差异；拖动模拟元件容差或数字Sinc点数，并点击播放按钮直接对比两种滤波器消除高频啸叫的实际听感。",
      "controls": [
        {
          "type": "slider",
          "id": "viewMode",
          "label": "视图 (1:幅频 2:dB衰减 3:阶跃)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "tol",
          "label": "模拟元件容差",
          "min": 0,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "数字 Sinc 点数",
          "min": 31,
          "max": 199,
          "step": 16,
          "value": 129,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "hearDigital",
          "label": "音频切至数字滤波器通道",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听高频干扰抑制对比",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet actx = null;\nlet isPlaying = false;\nlet oscs = [];\nlet gains = [];\nlet master = null;\n\nfunction buildWindowedSinc(M) {\n  if (M % 2 === 0) M += 1;\n  const fc = 0.1;\n  const mid = (M - 1) / 2;\n  const h = new Float64Array(M);\n  let sum = 0;\n  for (let i = 0; i < M; i++) {\n    const n = i - mid;\n    const s = n === 0 ? 2 * Math.PI * fc : Math.sin(2 * Math.PI * fc * n) / n;\n    const w = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (M - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (M - 1));\n    h[i] = s * w;\n    sum += h[i];\n  }\n  for (let i = 0; i < M; i++) h[i] /= sum;\n  return h;\n}\n\nfunction evalDigitalMag(h, fHz) {\n  const fn = fHz / 10000;\n  const mid = (h.length - 1) / 2;\n  let re = 0;\n  for (let i = 0; i < h.length; i++) {\n    re += h[i] * Math.cos(2 * Math.PI * fn * (i - mid));\n  }\n  return Math.abs(re);\n}\n\nfunction getChebPoles(tol) {\n  const eps = Math.sqrt(Math.pow(10, 0.05) - 1);\n  const beta = Math.asinh(1 / eps) / 6;\n  const sh = Math.sinh(beta);\n  const ch = Math.cosh(beta);\n  const tr = tol * 0.01;\n  const shifts = [1 + 0.9 * tr, 1 - 0.8 * tr, 1 + 0.5 * tr];\n  const stages = [];\n  for (let k = 1; k <= 3; k++) {\n    const ang = ((2 * k - 1) * Math.PI) / 12;\n    const sig = -sh * Math.sin(ang) * shifts[k - 1];\n    const omg = ch * Math.cos(ang) * shifts[k - 1];\n    stages.push({ sig, omg, w0sq: sig * sig + omg * omg });\n  }\n  return stages;\n}\n\nfunction evalAnalogMag(stages, fHz) {\n  const s = fHz / 1000;\n  let mag = 1;\n  for (let k = 0; k < 3; k++) {\n    const st = stages[k];\n    const re = st.w0sq - s * s;\n    const im = -2 * st.sig * s;\n    mag *= st.w0sq / Math.sqrt(re * re + im * im);\n  }\n  return mag;\n}\n\nfunction evalAnalogStep(stages) {\n  const dtMs = 0.01;\n  const sub = 4;\n  const hStep = (2 * Math.PI * dtMs) / sub;\n  const y = [0, 0, 0];\n  const v = [0, 0, 0];\n  const out = [];\n  for (let t = -4; t <= 8.001; t += 0.1) {\n    if (t < 0) {\n      out.push({ t, val: 0 });\n      continue;\n    }\n    const steps = Math.round(0.1 / dtMs) * sub;\n    for (let s = 0; s < steps; s++) {\n      let u = 1;\n      for (let k = 0; k < 3; k++) {\n        const st = stages[k];\n        const dv = st.w0sq * (u - y[k]) + 2 * st.sig * v[k];\n        v[k] += dv * hStep;\n        y[k] += v[k] * hStep;\n        u = y[k];\n      }\n    }\n    out.push({ t, val: y[2] });\n  }\n  return out;\n}\n\nfunction syncAudio(h, stages) {\n  const wantPlay = !!lab.values.play;\n  if (wantPlay && !isPlaying) {\n    actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    master = actx.createGain();\n    master.gain.value = 0.18;\n    master.connect(actx.destination);\n    const freqs = [400, 1450, 2300];\n    oscs = [];\n    gains = [];\n    for (let i = 0; i < freqs.length; i++) {\n      const o = actx.createOscillator();\n      const g = actx.createGain();\n      o.type = 'sine';\n      o.frequency.value = freqs[i];\n      g.gain.value = 0;\n      o.connect(g);\n      g.connect(master);\n      o.start();\n      oscs.push(o);\n      gains.push(g);\n    }\n    isPlaying = true;\n  } else if (!wantPlay && isPlaying) {\n    for (let i = 0; i < oscs.length; i++) {\n      try { oscs[i].stop(); oscs[i].disconnect(); } catch (e) {}\n    }\n    if (master) try { master.disconnect(); } catch (e) {}\n    oscs = [];\n    gains = [];\n    master = null;\n    isPlaying = false;\n  }\n  if (isPlaying && actx) {\n    const useDig = !!lab.values.hearDigital;\n    const freqs = [400, 1450, 2300];\n    const baseAmps = [0.55, 0.45, 0.45];\n    for (let i = 0; i < freqs.length; i++) {\n      const m = useDig ? evalDigitalMag(h, freqs[i]) : evalAnalogMag(stages, freqs[i]);\n      gains[i].gain.setTargetAtTime(Math.min(1.2, m) * baseAmps[i], actx.currentTime, 0.025);\n    }\n  }\n}\n\nfunction draw() {\n  const mode = lab.values.viewMode;\n  const tol = lab.values.tol;\n  const taps = Math.round(lab.values.taps);\n  const h = buildWindowedSinc(taps);\n  const stages = getChebPoles(tol);\n  syncAudio(h, stages);\n\n  ctx.clearRect(0, 0, W, H);\n  const padL = 56, padR = 22, padT = 26, padB = 32;\n  const pw = W - padL - padR;\n  const ph = H - padT - padB;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n\n  if (mode === 1 || mode === 2) {\n    const isDb = mode === 2;\n    const yMin = isDb ? -100 : 0;\n    const yMax = isDb ? 20 : 1.4;\n    const yTicks = isDb ? [-100, -80, -60, -40, -20, 0, 20] : [0, 0.25, 0.5, 0.75, 1.0, 1.25];\n    for (let i = 0; i < yTicks.length; i++) {\n      const yv = yTicks[i];\n      const yy = padT + ph * (1 - (yv - yMin) / (yMax - yMin));\n      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + pw, yy); ctx.stroke();\n      ctx.textAlign = 'right';\n      ctx.fillText(isDb ? yv + ' dB' : yv.toFixed(2), padL - 7, yy + 4);\n    }\n    for (let f = 0; f <= 5000; f += 1000) {\n      const xx = padL + (f / 5000) * pw;\n      ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + ph); ctx.stroke();\n      ctx.textAlign = 'center';\n      ctx.fillText(f + ' Hz', xx, padT + ph + 16);\n    }\n    ctx.strokeStyle = 'rgba(248,250,252,0.22)';\n    ctx.setLineDash([4, 4]);\n    const cutX = padL + (1000 / 5000) * pw;\n    ctx.beginPath(); ctx.moveTo(cutX, padT); ctx.lineTo(cutX, padT + ph); ctx.stroke();\n    ctx.setLineDash([]);\n\n    const N = 260;\n    ctx.lineWidth = 2.4;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const f = (i / N) * 5000;\n      let m = evalAnalogMag(stages, f);\n      let val = isDb ? 20 * Math.log10(Math.max(m, 1e-6)) : m;\n      val = Math.max(yMin, Math.min(yMax, val));\n      const xx = padL + (i / N) * pw;\n      const yy = padT + ph * (1 - (val - yMin) / (yMax - yMin));\n      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#10b981';\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const f = (i / N) * 5000;\n      let m = evalDigitalMag(h, f);\n      let val = isDb ? 20 * Math.log10(Math.max(m, 1e-6)) : m;\n      val = Math.max(yMin, Math.min(yMax, val));\n      const xx = padL + (i / N) * pw;\n      const yy = padT + ph * (1 - (val - yMin) / (yMax - yMin));\n      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n  } else {\n    const yMin = -0.3, yMax = 1.5;\n    const yTicks = [0, 0.5, 1.0, 1.25];\n    for (let i = 0; i < yTicks.length; i++) {\n      const yv = yTicks[i];\n      const yy = padT + ph * (1 - (yv - yMin) / (yMax - yMin));\n      ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(padL + pw, yy); ctx.stroke();\n      ctx.textAlign = 'right';\n      ctx.fillText(yv.toFixed(2), padL - 7, yy + 4);\n    }\n    for (let t = -4; t <= 8; t += 2) {\n      const xx = padL + ((t + 4) / 12) * pw;\n      ctx.beginPath(); ctx.moveTo(xx, padT); ctx.lineTo(xx, padT + ph); ctx.stroke();\n      ctx.textAlign = 'center';\n      ctx.fillText(t + ' ms', xx, padT + ph + 16);\n    }\n    const aStep = evalAnalogStep(stages);\n    ctx.lineWidth = 2.4;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.beginPath();\n    for (let i = 0; i < aStep.length; i++) {\n      const xx = padL + ((aStep[i].t + 4) / 12) * pw;\n      const yy = padT + ph * (1 - (aStep[i].val - yMin) / (yMax - yMin));\n      if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n\n    const mid = (h.length - 1) / 2;\n    ctx.strokeStyle = '#10b981';\n    ctx.beginPath();\n    let first = true;\n    for (let n = -40; n <= 80; n++) {\n      const k = mid + n;\n      let acc = 0;\n      for (let j = 0; j <= Math.min(k, h.length - 1); j++) acc += h[j];\n      const tMs = n * 0.1;\n      const xx = padL + ((tMs + 4) / 12) * pw;\n      const yy = padT + ph * (1 - (acc - yMin) / (yMax - yMin));\n      if (first) { ctx.moveTo(xx, yy); first = false; } else ctx.lineTo(xx, yy);\n    }\n    ctx.stroke();\n  }\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('● 模拟 6极点切比雪夫 (容差 ' + tol + '%)', padL + 8, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 数字 ' + h.length + '点加窗Sinc', padL + 245, 16);\n  if (isPlaying) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('🔊 当前试听: ' + (lab.values.hearDigital ? '数字滤波器通道' : '模拟滤波器通道'), padL + 425, 16);\n  }\n\n  const a2k = 20 * Math.log10(Math.max(evalAnalogMag(stages, 2000), 1e-6));\n  const d2k = 20 * Math.log10(Math.max(evalDigitalMag(h, 2000), 1e-6));\n  const modeName = mode === 1 ? '线性幅频' : (mode === 2 ? '对数dB衰减' : '阶跃响应(相位)');\n  lab.setReadout('模式: ' + modeName + ' | 2kHz阻带衰减 — 模拟: ' + a2k.toFixed(1) + ' dB vs 数字: ' + d2k.toFixed(1) + ' dB | 阶跃对称性: 模拟非线性 vs 数字严格对称');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "阻带碾压与阶跃对称性：为什么在滤波性能上模拟彻底落败？",
      "paragraphs": [
        "把坐标切换到**对数尺度（dB 刻度）**后，真正的差距才完全暴露。在 **滚降速率（Roll-off）** 与 **阻带衰减（Stopband Attenuation）** 两项核心指标上，加窗 Sinc 轻松击败了 6 极点切比雪夫。即便模拟工程师不惜成本继续堆叠运放级数，也难以企及数字滤波器的阻带深度。更致命的是可扩展性：假如工程需求突然要求将滚降与阻带衰减同时提升 **100 倍**，在数字滤波器中只需几行代码改大卷积核点数与窗函数即可轻松实现；而在模拟电路中，这几乎是不可能完成的任务。**数字方再拿 2 分！**",
        "再看**阶跃响应（Step Response）**，它直接反映滤波器对脉冲边缘与瞬态波形的保真能力。数字滤波器的阶跃响应在上升沿的下半部分与上半部分呈现**完美镜像对称**，这意味着它拥有严格的**线性相位（Linear Phase）**——所有频率分量在时间上受到完全相同的延迟，不会发生波形色散畸变；而模拟滤波器的阶跃响应明显**不对称**（先慢后快且右侧拖尾），说明它具有**非线性相位**。**数字方再得 1 分！**",
        "至于阶跃响应中的**过冲（Overshoot）**现象：模拟滤波器在阶跃顶部一侧有约 **20%** 的单边过冲，数字滤波器则是在阶跃上下两侧各有约 **10%** 的对称振铃。两者的表现都不算好看，各自打平，**均不得分**。至此，仅论“输入进来、滤波出去”的纯滤波指标，数字滤波器以 **4 : 0** 完胜模拟滤波器。"
      ],
      "formula": {
        "expr": "h[M - 1 - k] = h[k]  ⇒  ∠H(ω) = -ω · (M - 1) / 2",
        "explain": "只要有限长脉冲响应（FIR）卷积核满足中心左右对称，其相位响应就严格是一条直线（线性相位），所有频率延迟完全一致，阶跃响应必然上下中心对称。"
      }
    },
    {
      "type": "concept",
      "heading": "既然输得这么惨，为什么工程师还必须使用模拟滤波器？",
      "paragraphs": [
        "尽管在滤波曲线的账面战绩上惨败，模拟滤波器在真实硬件系统中却依然不可或缺。原因不在于“滤波曲线画得有多好”，而在于模拟电子电路拥有的三大**底层物理天赋**：",
        "1. **极致的实时速度（Speed）**：数字运算需要逐点采样、乘累加或做 FFT 卷积（本书年代的个人电脑使用 FFT 卷积大约只能处理每秒 **10,000 个样本**，即便在现代处理器上也受限于时钟、总线与流水线延迟）；而最普通的模拟运放就能轻松工作在 **100 kHz 到 1 MHz** 甚至更高频率，速度比数字系统快 **10 到 100 倍**以上，且零算法延迟。",
        "2. **碾压级的幅度动态范围（Amplitude Dynamic Range）**：定义为系统能通过的最大不失真信号与自身固有底噪之比。一个典型的 **12 位 ADC**，最大饱和码值为 `4095`，均方根量化噪声约为 `0.29` 个数字单位，动态范围只有约 **14,000**（约 83 dB）；而一颗普通运放的饱和电压可达 **20 V**，内部热噪声仅约 **2 µV**，动态范围高达 **10,000,000**（约 140 dB）！简单一颗运放就把数字系统甩开几个数量级。",
        "3. **恐怖的频率动态范围（Frequency Dynamic Range）**：用运放搭建一个同时处理 **0.01 Hz 到 100 kHz**（横跨 **7 个数量级**）的电路轻而易举。但若强行用数字系统处理：为了不混叠 100 kHz 信号，采样率至少要达到 **200 kHz**；此时仅仅为了捕捉 0.01 Hz 慢波的**一个完整周期**，计算机就必须吞下 **2000 万个采样点**！这也是为什么你几乎总是看到数字滤波器画在**线性频率轴**上（用来展示其锐利的滤波边缘），而模拟滤波器画在**对数频率轴**上（用来容纳其横跨十万倍的巨大动态跨度）。"
      ],
      "formula": {
        "expr": "DR = S_max / N_rms   (12-bit ADC: 4095 / 0.29 ≈ 1.4×10⁴  vs.  Op-Amp: 20 V / 2 µV = 10⁷)",
        "explain": "DR 为幅度动态范围，S_max 为系统饱和上限，N_rms 为本底噪声有效值。ADC 的动态范围被有限的量化台阶死死卡住。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：幅度动态范围与量化底噪极限压测",
      "instruction": "不断增大“信号衰减量”，观察微弱正弦波在经过后级放大恢复后，如何在 12-bit ADC 的量化台阶中彻底淹没，而 140 dB 模拟运放依然清晰；切换右侧对数/线性尺度感受千万倍动态范围差距，并可实时试听。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "ADC 量化位数",
          "min": 4,
          "max": 16,
          "step": 1,
          "value": 12,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "atten",
          "label": "输入微弱信号衰减",
          "min": 0,
          "max": 84,
          "step": 3,
          "value": 45,
          "unit": " dB"
        },
        {
          "type": "toggle",
          "id": "logView",
          "label": "右侧使用对数刻度 (dB)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "audioAnalog",
          "label": "试听切至模拟运放 (140 dB)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听后级放大恢复的信号",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet phase = 0;\nlet actx = null;\nlet srcNode = null;\nlet gainNode = null;\nlet isPlaying = false;\nlet lastKey = '';\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  const bits = Math.round(lab.values.bits);\n  const atten = lab.values.atten;\n  const useAna = !!lab.values.audioAnalog;\n  const key = bits + '_' + atten + '_' + (useAna ? 1 : 0);\n\n  if (!wantPlay) {\n    if (isPlaying) {\n      try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n      try { gainNode.disconnect(); } catch (e) {}\n      srcNode = null; gainNode = null; isPlaying = false; lastKey = '';\n    }\n    return;\n  }\n  if (isPlaying && key === lastKey) return;\n\n  actx = lab.getAudioContext();\n  if (actx.state === 'suspended') actx.resume();\n  const sr = actx.sampleRate;\n  const len = Math.round(sr * 0.5);\n  const buf = actx.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n  const sigAmp = Math.pow(10, -atten / 20);\n  const levels = Math.pow(2, bits) - 1;\n  const q = 2.0 / levels;\n  const recovery = Math.min(1 / Math.max(sigAmp, 1e-6), 1e6);\n  const cycles = Math.round(440 * 0.5);\n\n  for (let i = 0; i < len; i++) {\n    const s = sigAmp * Math.sin((2 * Math.PI * cycles * i) / len);\n    let out;\n    if (useAna) {\n      const noise = (Math.random() - 0.5) * 3.46e-7;\n      out = (s + noise) * recovery * 0.16;\n    } else {\n      const dither = (Math.random() - 0.5) * 0.2 * q;\n      const sq = Math.round((s + dither) / q) * q;\n      out = sq * recovery * 0.16;\n    }\n    data[i] = Math.max(-0.26, Math.min(0.26, out));\n  }\n\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n  }\n  if (!gainNode) {\n    gainNode = actx.createGain();\n    gainNode.gain.value = 1.0;\n    gainNode.connect(actx.destination);\n  }\n  srcNode = actx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start();\n  isPlaying = true;\n  lastKey = key;\n}\n\nfunction draw() {\n  const bits = Math.round(lab.values.bits);\n  const atten = lab.values.atten;\n  const logView = !!lab.values.logView;\n  const sigAmp = Math.pow(10, -atten / 20);\n  const levels = Math.pow(2, bits) - 1;\n  const q = 2.0 / levels;\n  const drAdc = levels / 0.288675;\n  const drAdcDb = 20 * Math.log10(drAdc);\n  const drOpDb = 140;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 44, ly = 28, lw = 356, lh = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -1; g <= 1; g += 0.5) {\n    const yy = ly + lh * (0.5 - g * 0.36);\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(lx, ly, lw, lh);\n\n  const pts = 220;\n  ctx.lineWidth = 2;\n  ctx.strokeStyle = '#10b981';\n  ctx.beginPath();\n  for (let i = 0; i <= pts; i++) {\n    const t = (i / pts) * 2 * Math.PI * 2 + phase;\n    const s = sigAmp * Math.sin(t);\n    const rec = Math.max(-1.35, Math.min(1.35, s / sigAmp));\n    const xx = lx + (i / pts) * lw;\n    const yy = ly + lh * (0.5 - rec * 0.36);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  ctx.lineWidth = 2;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath();\n  for (let i = 0; i <= pts; i++) {\n    const t = (i / pts) * 2 * Math.PI * 2 + phase;\n    const s = sigAmp * Math.sin(t);\n    const sq = Math.round(s / q) * q;\n    const rec = Math.max(-1.35, Math.min(1.35, sq / sigAmp));\n    const xx = lx + (i / pts) * lw;\n    const yy = ly + lh * (0.5 - rec * 0.36);\n    if (i === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 模拟运放恢复波形', lx, 18);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— ' + bits + '-bit ADC 量化后波形', lx + 145, 18);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('输入信号幅度: -' + atten + ' dB (相对满量程)', lx, ly + lh + 18);\n\n  const rx = 432, ry = 28, rw = 266, rh = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(logView ? '动态范围对比 (对数 dB 刻度)' : '动态范围对比 (线性倍数刻度)', rx, 18);\n\n  const opFrac = logView ? drOpDb / 150 : 1.0;\n  const adcFrac = logView ? Math.min(1, drAdcDb / 150) : drAdc / 10000000;\n\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(rx + 14, ry + 34, rw - 28, 28);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rx + 14, ry + 34, Math.max(2, (rw - 28) * opFrac), 28);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('标准运放: 10,000,000 (140 dB)', rx + 14, ry + 26);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(rx + 14, ry + 104, rw - 28, 28);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(rx + 14, ry + 104, Math.max(1.5, (rw - 28) * adcFrac), 28);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(bits + '-bit ADC: ' + Math.round(drAdc).toLocaleString() + ' (' + drAdcDb.toFixed(1) + ' dB)', rx + 14, ry + 96);\n\n  if (logView) {\n    const sigX = rx + 14 + (rw - 28) * Math.min(1, atten / 150);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath(); ctx.moveTo(sigX, ry + 12); ctx.lineTo(sigX, ry + rh - 10); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('当前信号衰减深度: ' + atten + ' dB', rx + 14, ry + 162);\n  } else {\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText('线性坐标下 12-bit ADC 仅占运放 0.14%', rx + 14, ry + 162);\n  }\n\n  const snrLeft = drAdcDb - atten;\n  const status = snrLeft < 6 ? '⚠ 信号已被ADC量化台阶彻底淹没!' : (snrLeft < 24 ? '⚡ 出现明显台阶失真与量化底噪' : '✓ 处于ADC有效分辨区内');\n  lab.setReadout('ADC动态范围: ' + drAdcDb.toFixed(1) + ' dB vs 运放: 140 dB | ADC余量: ' + snrLeft.toFixed(1) + ' dB | ' + status);\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});\nlab.onLoop((dt) => {\n  phase += dt * 3.2;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【纯指标选数字】：只要信号已经进入计算机且算力允许，优先使用数字滤波器——它的通带平坦度高出模拟数百倍，阻带可以轻松做到 -80 dB 以上，还能白嫖“线性相位”不失真特性。",
        "【速度与动态范围选模拟】：在超高频（> MHz）、微弱信号跨数量级放大，或需要同时处理横跨五六个数量级频率的场景下，别硬上全数字方案，先用模拟运放电路在前端搞定预处理。",
        "【硬件协同黄金法则】：真实工程中两者往往不是互斥而是接力——先用简单的模拟前置滤波器限制带宽并放大微弱信号（榨干模拟的高动态范围与抗混叠能力），送入 ADC 后再由数字滤波器完成严苛的频率切割与相位保真。",
        "【看图习惯避坑】：读数字滤波器图看线性频率轴（重点盯截止边缘有多陡），读模拟滤波器图看对数频率轴（重点盯几十倍频程的全局响应）。"
      ]
    }
  ]
});
