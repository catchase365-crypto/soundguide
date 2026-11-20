window.__BOOK_REGISTER_SECTION__("sec_035", {
  "title": "量化与抖动：连续电压如何变成数字台阶 (Quantization)",
  "intuition": "量化把连续变化的振幅切成离散的整数台阶，只要信号变化足够活跃，切分误差就等效于一层均匀的白噪声；而当微弱信号卡死在单个台阶上时，故意掺入一点随机噪声（抖动），配合统计平均反而能突破 1 LSB 的分辨率极限。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么要把数字化拆成“采样”和“量化”？",
      "paragraphs": [
        "在进入正题前先分享一个冷知识：计算机叫 `digital computer`，数据叫 `digital data`，但模拟转数字偏偏叫 `digitize`（数字化），而不叫 `digitalize`。这是因为早在电子技术诞生前将近一百年，医学界就已经把 `digitalize` 抢注了——它的意思是“给病人服用洋地黄（digitalis）强心剂”。",
        "言归正传，**模数转换（ADC）**在理论与电路上都由两个截然不同的阶段组成：**采样保持器（S/H）**和**模数转换器（ADC）**。如果把信号看成一条随时间变化的电压曲线，**采样（Sampling）**负责把**自变量（时间）**从连续变成离散，只在固定周期抓取瞬时电压并保持住，忽略采样点之间的所有变化；而**量化（Quantization）**负责把**因变量（电压幅值）**从连续变成离散，将每个保持平顶的电压四舍五入映射成最接近的整数。",
        "例如一个 12 bit 数字化仪处理 0 ~ 4.095 V 的信号，会被映射成 0 ~ 4095 的整数。此时 `2.56000 V` 和 `2.56001 V` 都会变成整数 `2560`。我们必须把采样和量化分开分析，因为它们以完全不同的方式劣化信号，受控于不同的硬件参数，而且实际工程中它们也并非总是成对出现（比如**开关电容滤波器**就只采样而不量化）。"
      ],
      "formula": {
        "expr": "x_digital[n] = round( x(n · T_s) / Δ )",
        "explain": "x(n·T_s) 是采样保持器按周期 T_s 截取的连续时间电压（自变量离散化）；除以步长 Δ 后取整 round(·)，则是 ADC 完成的幅值切分（因变量离散化）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 量化误差模型：精度与加性均匀噪声",
      "paragraphs": [
        "在 ADC 把电压归入最近整数的过程中，单个样本产生的最大误差不会超过 **±½ LSB**（Least Significant Bit，最低有效位，即相邻两个量化台阶之间的电压间距）。如果我们把量化后的数字输出减去采样保持器的连续输入，就会得到一条上下跳动的**量化误差波形**。",
        "神奇的是，只要输入信号跨越了多个量化台阶，这条误差波形看起来就几乎和**随机白噪声**一模一样。因此我们建立了一个极其强大的工程模型：在大多数情况下，**量化等价于往原始信号中叠加了一层均匀分布的随机噪声**。该噪声分布在 `±½ LSB` 之间，均值为 0，标准差为 `1/√12 ≈ 0.29 LSB`。",
        "这意味着**比特数（Number of bits）直接决定了数据的精度（Precision）**：8 bit 转换引入的均方根（RMS）噪声约为满量程的 `0.29/256 ≈ 1/900`；12 bit 约为 `1/14,000`；16 bit 更是低至 `1/227,000`。由于量化噪声是随机的，它会和模拟信号原本自带的噪声按**方和根（正交相加）**叠加。举个例子：若 1.0 V 满量程的信号本身带有 1.0 mV RMS 的噪声，用 8 bit 采样时，1.0 mV 相当于 `0.255 LSB`，总噪声会变成 `√(0.255² + 0.29²) = 0.386 LSB`，比原噪声恶化了约 50%；但若改用 12 bit，模拟噪声本身已占 `4.1 LSB`，加上 `0.29 LSB` 的量化噪声后几乎毫无增加——因此选型时只需问自己两个问题：**（1）原模拟信号里已经有多少噪声？（2）系统还能容忍多大的额外噪声？**"
      ],
      "formula": {
        "expr": "σ_total = √( σ_analog² + σ_quant² ),   其中 σ_quant = 1/√12 ≈ 0.29 LSB",
        "explain": "σ_analog 是模拟信号自带的噪声标准差（换算成 LSB 单位），σ_quant 是量化引入的均匀分布噪声标准差，两者通过方差相加（正交叠加）得到最终数字信号的总底噪 σ_total。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：观察量化台阶、误差波形与噪声听感",
      "instruction": "拖动【量化比特数】滑块，对比上方蓝线（模拟信号）与绿线（量化台阶）的贴合度，观察下方 ±0.5 LSB 量化误差变化；点击播放按钮可实时对比量化声与纯量化误差声。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "量化比特数",
          "min": 2,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "音频基频",
          "min": 110,
          "max": 660,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "onlyError",
          "label": "仅监听量化误差 (q - x)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const W = lab.width;\nconst H = lab.height;\nconst ctx = lab.ctx;\n\nlet audioCtx = null;\nlet scriptNode = null;\nlet phase = 0;\n\nfunction ensureAudio() {\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx) {\n      scriptNode = audioCtx.createScriptProcessor(1024, 0, 1);\n      scriptNode.onaudioprocess = function(e) {\n        const out = e.outputBuffer.getChannelData(0);\n        if (!lab.values.play) {\n          out.fill(0);\n          return;\n        }\n        const bits = Math.round(lab.values.bits);\n        const levels = Math.pow(2, bits);\n        const freq = lab.values.freq;\n        const onlyErr = lab.values.onlyError;\n        const sr = audioCtx.sampleRate;\n        const dPhase = (2 * Math.PI * freq) / sr;\n        for (let i = 0; i < out.length; i++) {\n          const s = 0.85 * Math.sin(phase);\n          const norm = (s + 1) * 0.5;\n          let qIdx = Math.round(norm * (levels - 1));\n          if (qIdx < 0) qIdx = 0;\n          if (qIdx > levels - 1) qIdx = levels - 1;\n          const qVal = (qIdx / (levels - 1)) * 2 - 1;\n          out[i] = (onlyErr ? (qVal - s) : qVal) * 0.22;\n          phase += dPhase;\n          if (phase > 2 * Math.PI) phase -= 2 * Math.PI;\n        }\n      };\n      scriptNode.connect(audioCtx.destination);\n    }\n  }\n  if (audioCtx && audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const bits = Math.round(lab.values.bits);\n  const levels = Math.pow(2, bits);\n  const cycles = 2;\n  const numSamples = 44;\n  const padL = 48;\n  const padR = 16;\n  const plotW = W - padL - padR;\n\n  const topY = 18;\n  const topH = 124;\n  const botY = 166;\n  const botH = 58;\n  const botMid = botY + botH / 2;\n\n  // Draw horizontal quantization level grid in top plot\n  ctx.lineWidth = 1;\n  const gridStep = levels <= 16 ? 1 : Math.floor(levels / 16);\n  for (let lv = 0; lv < levels; lv += gridStep) {\n    const y = topY + topH - (lv / (levels - 1)) * topH;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n  }\n\n  // Top plot frame & labels\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText((levels - 1).toString(), padL - 6, topY + 6);\n  ctx.fillText('0', padL - 6, topY + topH + 3);\n  ctx.save();\n  ctx.translate(14, topY + topH / 2);\n  ctx.rotate(-Math.PI / 2);\n  ctx.textAlign = 'center';\n  ctx.fillText('台阶编号', 0, 0);\n  ctx.restore();\n\n  // Continuous original analog signal (sky blue)\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px += 2) {\n    const t = px / plotW;\n    const s = 0.85 * Math.sin(2 * Math.PI * cycles * t);\n    const norm = (s + 1) * 0.5;\n    const y = topY + topH - norm * topH;\n    if (px === 0) ctx.moveTo(padL + px, y);\n    else ctx.lineTo(padL + px, y);\n  }\n  ctx.stroke();\n\n  // Sampled & quantized staircase (emerald)\n  const errors = [];\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let k = 0; k < numSamples; k++) {\n    const t = k / numSamples;\n    const x0 = padL + t * plotW;\n    const x1 = padL + ((k + 1) / numSamples) * plotW;\n    const s = 0.85 * Math.sin(2 * Math.PI * cycles * t);\n    const norm = (s + 1) * 0.5;\n    const idealIdx = norm * (levels - 1);\n    let qIdx = Math.round(idealIdx);\n    if (qIdx < 0) qIdx = 0;\n    if (qIdx > levels - 1) qIdx = levels - 1;\n    errors.push(qIdx - idealIdx);\n    const yq = topY + topH - (qIdx / (levels - 1)) * topH;\n    if (k === 0) ctx.moveTo(x0, yq);\n    else ctx.lineTo(x0, yq);\n    ctx.lineTo(x1, yq);\n  }\n  ctx.stroke();\n\n  // Draw sample markers\n  ctx.fillStyle = '#f8fafc';\n  for (let k = 0; k < numSamples; k++) {\n    const t = k / numSamples;\n    const x0 = padL + t * plotW;\n    const s = 0.85 * Math.sin(2 * Math.PI * cycles * t);\n    const norm = (s + 1) * 0.5;\n    let qIdx = Math.round(norm * (levels - 1));\n    if (qIdx < 0) qIdx = 0;\n    if (qIdx > levels - 1) qIdx = levels - 1;\n    const yq = topY + topH - (qIdx / (levels - 1)) * topH;\n    ctx.fillRect(x0 - 2, yq - 2, 4, 4);\n  }\n\n  // Bottom plot: quantization error in LSBs\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.setLineDash([4, 4]);\n  [-0.5, 0, 0.5].forEach(val => {\n    const y = botMid - (val / 0.6) * (botH / 2);\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n  });\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.fillText('+0.5', padL - 6, botMid - (0.5 / 0.6) * (botH / 2) + 4);\n  ctx.fillText('0', padL - 6, botMid + 4);\n  ctx.fillText('-0.5', padL - 6, botMid + (0.5 / 0.6) * (botH / 2) + 4);\n  ctx.fillText('误差(LSB)', padL - 6, botY - 4);\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let k = 0; k < numSamples; k++) {\n    const x0 = padL + (k / numSamples) * plotW;\n    const x1 = padL + ((k + 1) / numSamples) * plotW;\n    const ye = botMid - (errors[k] / 0.6) * (botH / 2);\n    if (k === 0) ctx.moveTo(x0, ye);\n    else ctx.lineTo(x0, ye);\n    ctx.lineTo(x1, ye);\n  }\n  ctx.stroke();\n\n  // Legend\n  ctx.textAlign = 'left';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 原始模拟信号', padL + 8, 13);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 采样量化台阶', padL + 115, 13);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('— 量化误差 (±0.5 LSB)', padL + 225, 13);\n\n  const rmsTheoretical = (0.2887 / levels);\n  lab.setReadout(\n    '精度: ' + bits + ' bit (' + levels + ' 个台阶)  |  1 LSB = ' +\n    (100 / levels).toFixed(2) + '% 满量程  |  理论量化 RMS 噪声 ≈ 满量程的 1/' +\n    Math.round(1 / rmsTheoretical) + '  |  声音状态: ' +\n    (lab.values.play ? (lab.values.onlyError ? '仅播放量化误差' : '播放量化波形') : '已静音')\n  );\n}\n\nlab.onUpdate(function() {\n  if (lab.values.play) ensureAudio();\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "3. 模型失效与“抖动 (Dithering)”的魔法",
      "paragraphs": [
        "前面把量化误差当成白噪声的模型非常好用，但它什么时候会**彻底失效**？答案是：**当量化误差不再具有随机性时**。最常见的情况就是模拟信号的变化幅度极其微弱（远小于 `±½ LSB`），连续很多个采样点都停留在同一个量化台阶区间内。此时数字输出会死死“卡”在同一个整数上纹丝不动，误差不再像随机白噪声，而变成了难看的**削波/阈值失真**，微弱信号的轮廓完全被抹杀。",
        "解决这种“卡死”现象的绝妙技术叫做**抖动（Dithering）**——在进入 ADC 之前，**主动往微弱的模拟信号里掺入少量随机噪声**（书中示例加入了标准差为 `2/3 LSB`、峰峰值约 `3 LSB` 的正态分布噪声）。乍听之下这简直违背常理：信号本来就被埋没了，加噪声难道不是雪上加霜？",
        "让我们做一个思想实验：假设输入是恒定的 `3.0001 V`（处于数字台阶 3000 和 3001 之间十分之一的位置）。如果不加抖动，连续采集 10,000 个样本，结果全都是 `3000`，小数点后的 `0.1` 彻底丢失。但如果加入适量抖动噪声，这 10,000 个数字输出就会在 `3000` 和 `3001` 等相邻台阶之间随机跳变，其中大约 **90% 是 3000，10% 是 3001**。只要我们对这 10,000 个样本求平均，就会惊奇地得到 `3000.1`！尽管单次测量受限于 `±½ LSB` 精度，但**大量样本的统计特性突破了单点比特的限制——加噪声反而带来了更多信息**。",
        "在高精度系统中，人们甚至使用**减法抖动（Subtractive Dither）**：由计算机生成伪随机数通过 DAC 转为模拟噪声加进去，数字化后再由计算机用浮点运算精准减去刚才那串随机数。而大多数简单系统里，直接利用模拟电路中本来就存在的底噪来充当抖动就足够了。"
      ],
      "formula": {
        "expr": "x̂ = (1 / N) · Σ round( x + d_i )  ≈  x",
        "explain": "当连续电压 x 远小于 1 LSB 时，叠加零均值随机抖动噪声 d_i 使其跨越量化边界产生概率跳变，再对 N 个离散整数输出求平均，即可逼近并还原出亚 LSB 级的真实连续值 x。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：微弱信号的“起死回生”——抖动与平均还原",
      "instruction": "初始状态下【抖动标准差】为 0，观察绿线是如何被卡死在 0 台阶上的；缓慢增大【抖动标准差】至 0.67 LSB 左右，并调节【平滑窗口】观察粉线如何精准贴合蓝色的微弱正弦波。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "微弱信号幅度",
          "min": 0.05,
          "max": 0.7,
          "step": 0.05,
          "value": 0.25,
          "unit": " LSB"
        },
        {
          "type": "slider",
          "id": "ditherStd",
          "label": "抖动噪声标准差",
          "min": 0,
          "max": 1.2,
          "step": 0.05,
          "value": 0,
          "unit": " LSB"
        },
        {
          "type": "slider",
          "id": "avgWin",
          "label": "数字平滑窗口",
          "min": 1,
          "max": 35,
          "step": 2,
          "value": 15,
          "unit": " 点"
        }
      ],
      "jsCode": "const W = lab.width;\nconst H = lab.height;\nconst ctx = lab.ctx;\n\nfunction makeRand(seed) {\n  let a = seed >>> 0;\n  return function() {\n    a |= 0; a = (a + 0x6D2B79F5) | 0;\n    let t = Math.imul(a ^ (a >>> 15), 1 | a);\n    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\n\n// Precompute 160 deterministic standard normal noise samples (Box-Muller)\nconst N = 160;\nconst baseNorm = [];\nconst rng = makeRand(202503);\nfor (let i = 0; i < N; i += 2) {\n  const u1 = Math.max(1e-7, rng());\n  const u2 = rng();\n  const mag = Math.sqrt(-2 * Math.log(u1));\n  baseNorm.push(mag * Math.cos(2 * Math.PI * u2));\n  if (i + 1 < N) baseNorm.push(mag * Math.sin(2 * Math.PI * u2));\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const amp = lab.values.amp;\n  const ditherStd = lab.values.ditherStd;\n  const avgWin = Math.round(lab.values.avgWin);\n  const dc = 0.18;\n\n  const padL = 48;\n  const padR = 16;\n  const padT = 24;\n  const padB = 18;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const yMin = -2.2;\n  const yMax = 2.2;\n  const toY = v => padT + ((yMax - v) / (yMax - yMin)) * plotH;\n  const toX = i => padL + (i / (N - 1)) * plotW;\n\n  // Grid for integer quantization levels and ±0.5 thresholds\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  for (let lv = -2; lv <= 2; lv++) {\n    const y = toY(lv);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText((lv > 0 ? '+' : '') + lv, padL - 8, y + 4);\n  }\n\n  // Highlight quantization decision thresholds at -0.5 and +0.5 LSB\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.setLineDash([4, 4]);\n  [-0.5, 0.5].forEach(th => {\n    const y = toY(th);\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(W - padR, y);\n    ctx.stroke();\n  });\n  ctx.setLineDash([]);\n\n  const orig = new Array(N);\n  const dithered = new Array(N);\n  const quant = new Array(N);\n  const noDitherQuant = new Array(N);\n\n  for (let i = 0; i < N; i++) {\n    orig[i] = dc + amp * Math.sin(2 * Math.PI * 2 * i / N);\n    dithered[i] = orig[i] + baseNorm[i] * ditherStd;\n    quant[i] = Math.round(dithered[i]);\n    noDitherQuant[i] = Math.round(orig[i]);\n  }\n\n  // Centered moving average of quantized output\n  const half = Math.floor(avgWin / 2);\n  const recovered = new Array(N);\n  let mse = 0;\n  let mseNoDither = 0;\n  for (let i = 0; i < N; i++) {\n    let sum = 0;\n    let cnt = 0;\n    const start = Math.max(0, i - half);\n    const end = Math.min(N - 1, i + half);\n    for (let j = start; j <= end; j++) {\n      sum += quant[j];\n      cnt++;\n    }\n    recovered[i] = sum / cnt;\n    mse += Math.pow(recovered[i] - orig[i], 2);\n    mseNoDither += Math.pow(noDitherQuant[i] - orig[i], 2);\n  }\n  const rmse = Math.sqrt(mse / N);\n  const rmseNoDither = Math.sqrt(mseNoDither / N);\n\n  // 1. Dithered analog input (amber thin line)\n  if (ditherStd > 0) {\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const x = toX(i);\n      const y = toY(Math.max(yMin, Math.min(yMax, dithered[i])));\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  // 2. Quantized digital staircase (emerald)\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const x0 = toX(i);\n    const x1 = i < N - 1 ? toX(i + 1) : x0;\n    const y = toY(Math.max(yMin, Math.min(yMax, quant[i])));\n    if (i === 0) ctx.moveTo(x0, y);\n    else ctx.lineTo(x0, y);\n    ctx.lineTo(x1, y);\n  }\n  ctx.stroke();\n\n  // 3. Original tiny analog signal (sky blue)\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const x = toX(i);\n    const y = toY(orig[i]);\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // 4. Recovered signal via moving average (pink)\n  if (avgWin > 1) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const x = toX(i);\n      const y = toY(recovered[i]);\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  // Legend\n  ctx.textAlign = 'left';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 原始微弱信号', padL + 4, 14);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('— 加噪后模拟信号', padL + 110, 14);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— ADC 量化输出', padL + 228, 14);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('— 滑动平均还原信号', padL + 338, 14);\n\n  lab.setReadout(\n    '信号峰谷在 [-0.5, +0.5] 内极易卡死  |  当前还原 RMSE 误差: ' + rmse.toFixed(3) +\n    ' LSB  (对比无抖动直接量化误差: ' + rmseNoDither.toFixed(3) + ' LSB)'\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【采样和量化必须拆开看】采样只管时间轴离散化（S/H），量化只管幅值轴离散化（ADC）。硬件参数选型和噪声分析时不要把两者混为一谈。",
        "【8 bit 还是 16 bit？算噪声比盲目堆位数更靠谱】量化引入约 `0.29 LSB` 的均匀白噪声，与原模拟噪声按平方和开方（正交）叠加。只要模拟信号自带的本底噪声本身就远大于 `1 LSB`，继续增加 ADC 比特数对提升信噪比几乎毫无意义。",
        "【警惕微弱信号“卡死”】如果目标信号幅度小于 `±0.5 LSB` 且缓慢变化，量化误差模型就会失效，信号会死锁在单个台阶上变成畸变方波。",
        "【适当底噪反而是宝】如果电路太“干净”导致微弱信号卡死，主动加入标准差约 `0.5 ~ 0.7 LSB` 的抖动噪声（或保留适量模拟底噪），再配合数字端多次采样平均，就能以低比特硬件测出高比特级别的均值变化。"
      ]
    }
  ]
});
