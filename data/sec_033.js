window.__BOOK_REGISTER_SECTION__("sec_033", {
  "title": "数字噪声生成与伪随机数原理 (Digital Noise Generation)",
  "intuition": "用简单的均匀随机数生成器作为“原材料”，通过叠加或数学变换即可捏出任意均值与标准差的高斯白噪声，用来在实验室里严苛拷问 DSP 算法的抗噪能力。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么要人为制造数字噪声？",
      "paragraphs": [
        "在电子工程与数字信号处理（DSP）中，随机噪声决定了仪器能测量的最小微弱信号、无线电通信的最远距离，以及拍一张 X 光片所需的最小辐射剂量。因此，在算法上线之前，我们必须用**带有真实噪声的测试信号**来验证它在恶劣环境下的性能。",
        "所有数字噪声生成的起点，都是编程语言内置的**均匀随机数生成器**（例如早期 BASIC 中的 `X = RND`）。每次调用它，都会返回一个落在 `[0, 1]` 区间内的数字，且落在该区间任意位置的概率完全相等（即**均匀分布**, Uniform Distribution）。",
        "对于这种 `[0, 1]` 均匀分布的随机过程，它的理论均值 `μ = 0.5`，而标准差 `σ = 1 / √12 ≈ 0.289`。但真实世界中的物理噪声（如热噪声）往往服从**高斯分布**（正态分布）而非均匀分布，这就需要我们把均匀分布“改造”成高斯分布。"
      ],
      "formula": {
        "expr": "μ = 0.5,   σ = 1 / √12 ≈ 0.29",
        "explain": "均匀分布在 [0, 1] 上的数学特征：中心位置在 0.5，波动标准差约为 0.29，且所有数值被死死限制在 0 到 1 之间，不会出现极端尖峰。"
      }
    },
    {
      "type": "concept",
      "heading": "方法一：叠加 12 个随机数与中心极限定理",
      "paragraphs": [
        "第一种制造高斯噪声的技巧非常巧妙：**把多个独立的均匀随机数直接加起来**。如果我们把两个随机数相加（`X = RND + RND`），结果范围变成 `[0, 2]`，均值变成 `1`。由于**独立随机变量相加时，方差（σ²）也会直接相加**，新信号的标准差变为 `√(1/12 + 1/12) = 1 / √6`。此时概率密度函数（pdf）从平顶矩形变成了**三角形分布**——数值更倾向于聚集在中间值 `1` 附近。",
        "如果我们一口气把 **12 个**均匀随机数相加，神奇的事情发生了：均值变成 `12 × 0.5 = 6`，方差变成 `12 × (1/12) = 1`，所以**标准差恰好等于 1**！更重要的是，此时的概率分布已经几乎变成了一条完美的高斯钟形曲线。",
        "这背后的数学靠山是概率论中最核心的定理之一——**中心极限定理（Central Limit Theorem）**。它指出：只要把足够多的独立随机变量相加，无论它们原本服从什么分布（甚至每个变量的分布都可以不同），其总和的分布都会趋向于正态（高斯）分布。这也是为什么自然界中各种随机力量交织在一起时，最终几乎总是呈现高斯分布的原因。"
      ],
      "formula": {
        "expr": "X = σ · ( Σ_{i=1}^{12} RND_i - 6 ) + μ",
        "explain": "工程四步法生成任意高斯噪声：(1) 将 12 个 [0,1] 均匀随机数相加；(2) 减去 6 使均值归零；(3) 乘以目标标准差 σ；(4) 加上目标均值 μ。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：中心极限定理演示（矩形 → 三角 → 高斯）",
      "instruction": "拖动「叠加个数 N」从 1 变到 2 再到 12，观察左侧 128 点波形与右侧概率密度（pdf）如何从矩形蜕变为高斯钟形；开启「标准化」可锁定 μ=0, σ=1 对比形状；点击播放可对比白噪声听感。",
      "controls": [
        {
          "type": "slider",
          "id": "numSum",
          "label": "叠加随机数个数 N",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 1,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "seed",
          "label": "样本批次种子",
          "min": 1,
          "max": 50,
          "step": 1,
          "value": 7,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "normalize",
          "label": "中心化并缩放至 (μ=0, σ=1)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放当前分布噪声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioSource = null;\nvar audioGain = null;\nvar lastAudioSig = '';\n\nfunction makePrng(s) {\n  var state = (s * 2654435761 + 1013904223) >>> 0;\n  return function() {\n    state = (state * 1664525 + 1013904223) >>> 0;\n    return state / 4294967296;\n  };\n}\n\nfunction generateSamples(count, N, seedVal, norm) {\n  var rand = makePrng(seedVal);\n  var out = new Float32Array(count);\n  var mean = N * 0.5;\n  var std = Math.sqrt(N / 12);\n  for (var i = 0; i < count; i++) {\n    var sum = 0;\n    for (var k = 0; k < 12; k++) {\n      var r = rand();\n      if (k < N) sum += r;\n    }\n    out[i] = norm ? (sum - mean) / std : sum;\n  }\n  return out;\n}\n\nfunction stopAudio() {\n  if (audioSource) {\n    try { audioSource.stop(); audioSource.disconnect(); } catch (e) {}\n    audioSource = null;\n  }\n  lastAudioSig = '';\n}\n\nfunction updateAudio(N, seedVal) {\n  var playing = !!lab.values.play;\n  if (!playing) {\n    stopAudio();\n    return;\n  }\n  var sig = N + '_' + seedVal;\n  if (sig === lastAudioSig && audioSource) return;\n  lastAudioSig = sig;\n\n  var actx = lab.getAudioContext();\n  if (actx.state === 'suspended') actx.resume();\n  if (!audioGain) {\n    audioGain = actx.createGain();\n    audioGain.gain.value = 0.14;\n    audioGain.connect(actx.destination);\n  }\n\n  if (audioSource) {\n    try { audioSource.stop(); audioSource.disconnect(); } catch (e) {}\n  }\n\n  var len = Math.floor(actx.sampleRate * 1.5);\n  var buf = actx.createBuffer(1, len, actx.sampleRate);\n  var ch = buf.getChannelData(0);\n  var rand = makePrng(seedVal + 999);\n  var mean = N * 0.5;\n  var std = Math.sqrt(N / 12);\n  for (var i = 0; i < len; i++) {\n    var sum = 0;\n    for (var k = 0; k < N; k++) sum += rand();\n    var val = (sum - mean) / std;\n    if (val > 4) val = 4;\n    if (val < -4) val = -4;\n    ch[i] = val * 0.6;\n  }\n\n  var src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(audioGain);\n  src.start();\n  audioSource = src;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var N = lab.values.numSum;\n  var seedVal = lab.values.seed;\n  var norm = !!lab.values.normalize;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var waveLeft = 46;\n  var waveRight = 480;\n  var waveTop = 20;\n  var waveBot = 212;\n  var waveW = waveRight - waveLeft;\n  var waveH = waveBot - waveTop;\n\n  var pdfLeft = 515;\n  var pdfRight = 700;\n  var pdfW = pdfRight - pdfLeft;\n\n  var yMin = norm ? -4 : 0;\n  var yMax = norm ? 4 : 12;\n  function valToY(v) {\n    return waveBot - ((v - yMin) / (yMax - yMin)) * waveH;\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var stepY = norm ? 1 : 2;\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  for (var yv = yMin; yv <= yMax; yv += stepY) {\n    var py = valToY(yv);\n    ctx.beginPath();\n    ctx.moveTo(waveLeft, py);\n    ctx.lineTo(waveRight, py);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.fillText(String(yv), waveLeft - 6, py);\n  }\n\n  for (var xi = 0; xi <= 128; xi += 16) {\n    var px = waveLeft + (xi / 128) * waveW;\n    ctx.beginPath();\n    ctx.moveTo(px, waveTop);\n    ctx.lineTo(px, waveBot);\n    ctx.stroke();\n    if (xi % 32 === 0) {\n      ctx.fillStyle = 'rgba(248,250,252,0.6)';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'top';\n      ctx.fillText(String(xi), px, waveBot + 5);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.strokeRect(waveLeft, waveTop, waveW, waveH);\n\n  var waveSamples = generateSamples(128, N, seedVal, norm);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.3;\n  ctx.beginPath();\n  for (var i = 0; i < 128; i++) {\n    var sx = waveLeft + (i / 127) * waveW;\n    var sy = valToY(waveSamples[i]);\n    if (i === 0) ctx.moveTo(sx, sy);\n    else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  for (var i = 0; i < 128; i++) {\n    var sx = waveLeft + (i / 127) * waveW;\n    var sy = valToY(waveSamples[i]);\n    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);\n  }\n\n  var histSamples = generateSamples(4000, N, seedVal + 17, norm);\n  var bins = 48;\n  var counts = new Array(bins);\n  for (var b = 0; b < bins; b++) counts[b] = 0;\n  var binW = (yMax - yMin) / bins;\n  for (var i = 0; i < histSamples.length; i++) {\n    var idx = Math.floor((histSamples[i] - yMin) / binW);\n    if (idx >= 0 && idx < bins) counts[idx]++;\n  }\n\n  var maxTheoretical = norm ? (N === 1 ? 1 / Math.sqrt(12) : (N === 2 ? 1 / Math.sqrt(6) : 0.45)) : 1.05;\n  var pdfScale = pdfW / (norm ? 0.5 : 1.08);\n\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.32)';\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1;\n  for (var b = 0; b < bins; b++) {\n    var density = counts[b] / (histSamples.length * binW);\n    var barLen = Math.min(pdfW - 4, density * pdfScale);\n    var byTop = valToY(yMin + (b + 1) * binW);\n    var byBot = valToY(yMin + b * binW);\n    if (barLen > 0.5) {\n      ctx.fillRect(pdfLeft, byTop, barLen, byBot - byTop);\n      ctx.strokeRect(pdfLeft, byTop, barLen, byBot - byTop);\n    }\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var steps = 160;\n  var mu = norm ? 0 : N * 0.5;\n  var sig = norm ? 1 : Math.sqrt(N / 12);\n  for (var s = 0; s <= steps; s++) {\n    var v = yMin + (s / steps) * (yMax - yMin);\n    var p = 0;\n    if (N === 1) {\n      var lo = norm ? -Math.sqrt(3) : 0;\n      var hi = norm ? Math.sqrt(3) : 1;\n      p = (v >= lo && v <= hi) ? 1 / (hi - lo) : 0;\n    } else if (N === 2) {\n      var halfW = norm ? Math.sqrt(6) : 1;\n      var dist = Math.abs(v - mu);\n      p = dist <= halfW ? (1 - dist / halfW) / halfW : 0;\n    } else {\n      p = Math.exp(-0.5 * Math.pow((v - mu) / sig, 2)) / (sig * Math.sqrt(2 * Math.PI));\n    }\n    var px = pdfLeft + Math.min(pdfW - 2, p * pdfScale);\n    var py = valToY(v);\n    if (s === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(pdfLeft, waveTop);\n  ctx.lineTo(pdfLeft, waveBot);\n  ctx.lineTo(pdfRight, waveBot);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillText('128点时域样本波形', waveLeft + 6, 4);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('直方图', pdfLeft, 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('/ 理论 pdf', pdfLeft + 44, 4);\n\n  var shapeName = N === 1 ? '均匀矩形分布' : (N === 2 ? '三角分布' : (N < 6 ? '逐步逼近高斯' : '近似高斯分布'));\n  if (norm) {\n    lab.setReadout('N = ' + N + ' | 已标准化: 均值 μ = 0.00, 标准差 σ = 1.000 | 分布形态: ' + shapeName);\n  } else {\n    lab.setReadout('N = ' + N + ' | 理论均值 μ = ' + (N * 0.5).toFixed(2) + ' | 理论标准差 σ = ' + Math.sqrt(N / 12).toFixed(3) + ' | 分布形态: ' + shapeName);\n  }\n\n  updateAudio(N, seedVal);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "方法二：精确高斯变换（Box-Muller 公式）",
      "paragraphs": [
        "叠加 12 个均匀随机数虽然简单直观，但它毕竟是一种近似——例如其输出最大值永远不可能超过 `±6σ`。如果算法需要数学上**严格精确**的高斯分布，就可以采用第二种方法（原书 Equation 2-9，即著名的 **Box-Muller 变换**）。",
        "这种方法只需调用两次均匀随机数生成器，得到独立均匀分布于 `(0, 1]` 之间的 `R₁` 和 `R₂`，通过一次对数、开方与余弦三角运算，就能直接映射出一个标准正态分布随机变量 `X`（均值 `0`，标准差 `1`）。",
        "与方法一完全相同，只要把公式算出的每个 `X` 乘以期望的标准差 `σ`，再加上期望的均值 `μ`，就能生成任意均值与标准差的精确高斯噪声信号。工程中要特别小心 `R₁` 不能恰好取到 `0`，否则 `log(0)` 会引发负无穷溢出错误。"
      ],
      "formula": {
        "expr": "X = (-2 · ln R₁)^{1/2} · cos(2π R₂)",
        "explain": "R₁、R₂ 为独立的 [0, 1] 均匀随机数（需避免 R₁=0）；ln 为以 e 为底的自然对数；cos 采用弧度制。输出 X 严格服从均值为 0、标准差为 1 的高斯分布。"
      }
    },
    {
      "type": "concept",
      "heading": "随机数的底层真相：种子与伪随机生成算法",
      "paragraphs": [
        "计算机其实是一台完全确定性的机器，它并不会真的“掷骰子”。绝大多数随机数生成器都依赖于一个叫做**种子（Seed）**的初始数值。每次你调用随机数函数时，系统就把当前的种子 `S` 塞进一个固定公式里算出一个新数 `R`，一边把它作为本次的“随机数”交给你，一边把它悄悄存起来，作为下一次调用时的新种子。",
        "最经典的均匀随机数算法之一就是线性同余法（Equation 2-10）：`R = (aS + b) modulo c`。其中 `a, b, c` 是精心挑选的常数，意思是先把 `aS + b` 除以 `c`，然后取余数作为新结果。",
        "这种机制带来了一个巨大的工程优势：**可复现性**。只要从相同的种子出发，程序每次运行都会生成一模一样的“随机”序列，这在对比调试两种 DSP 滤波算法时至关重要！如果你想每次运行都换一套新噪声，只需在程序启动时用系统时钟去**重新播种（Reseeding）**即可。从纯数学角度看，因为每个数都完全由前一个数决定，它们严格来说叫做**伪随机数（Pseudo-random）**；但只要参数 `a, b, c` 选得好，其统计随机性已经高到足以应付几乎所有工程需求。"
      ],
      "formula": {
        "expr": "R = (aS + b) modulo c",
        "explain": "S 为当前种子（状态），a、b、c 为预设常数，modulo 表示取余运算。若 c 或 a、b 选择不当，序列会在极短步数内陷入周期性死循环。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：线性同余（LCG）参数陷阱与 Box-Muller 对比",
      "instruction": "尝试关闭「优质 LCG 参数」，立刻在画布上看到短周期重复条纹，并听见白噪声瞬间退化为刺耳的固定音调！再开启「Box-Muller 高斯变换」，对比均匀分布硬边界与高斯尖峰的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "seed",
          "label": "初始种子 S₀",
          "min": 1,
          "max": 99,
          "step": 1,
          "value": 17,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "goodLcg",
          "label": "优质 LCG 参数 (关 = 劣质短周期 c=32)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "boxMuller",
          "label": "开启 Box-Muller 精确高斯映射",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放生成噪声",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioSrc = null;\nvar audioGainNode = null;\nvar lastSig = '';\n\nfunction createLcg(seedVal, good) {\n  var c = good ? 2147483647 : 32;\n  var a = good ? 48271 : 5;\n  var b = good ? 12345 : 7;\n  var state = seedVal % c;\n  if (good) {\n    for (var w = 0; w < 5; w++) {\n      state = (a * state + b) % c;\n    }\n  }\n  return function() {\n    state = (a * state + b) % c;\n    return state / c;\n  };\n}\n\nfunction sampleSeq(count, seedVal, good, useGauss) {\n  var rng = createLcg(seedVal, good);\n  var out = new Float32Array(count);\n  var sqrt12 = Math.sqrt(12);\n  for (var i = 0; i < count; i++) {\n    if (useGauss) {\n      var r1 = rng();\n      var r2 = rng();\n      if (r1 < 1e-9) r1 = 1e-9;\n      out[i] = Math.sqrt(-2 * Math.log(r1)) * Math.cos(2 * Math.PI * r2);\n    } else {\n      var r = rng();\n      out[i] = (r - 0.5) * sqrt12;\n    }\n  }\n  return out;\n}\n\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n  lastSig = '';\n}\n\nfunction syncAudio(seedVal, good, useGauss) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  var sig = seedVal + '_' + (good ? 1 : 0) + '_' + (useGauss ? 1 : 0);\n  if (sig === lastSig && audioSrc) return;\n  lastSig = sig;\n\n  var actx = lab.getAudioContext();\n  if (actx.state === 'suspended') actx.resume();\n  if (!audioGainNode) {\n    audioGainNode = actx.createGain();\n    audioGainNode.gain.value = 0.14;\n    audioGainNode.connect(actx.destination);\n  }\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n  }\n\n  var len = Math.floor(actx.sampleRate * 1.5);\n  var buf = actx.createBuffer(1, len, actx.sampleRate);\n  var ch = buf.getChannelData(0);\n  var seq = sampleSeq(len, seedVal, good, useGauss);\n  for (var i = 0; i < len; i++) {\n    var v = seq[i];\n    if (v > 4) v = 4;\n    if (v < -4) v = -4;\n    ch[i] = v * 0.55;\n  }\n\n  var src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(audioGainNode);\n  src.start();\n  audioSrc = src;\n}\n\nfunction render() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var seedVal = lab.values.seed;\n  var good = !!lab.values.goodLcg;\n  var useGauss = !!lab.values.boxMuller;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var waveLeft = 46;\n  var waveRight = 480;\n  var waveTop = 22;\n  var waveBot = 212;\n  var waveW = waveRight - waveLeft;\n  var waveH = waveBot - waveTop;\n\n  var pdfLeft = 515;\n  var pdfRight = 700;\n  var pdfW = pdfRight - pdfLeft;\n\n  var yMin = -4;\n  var yMax = 4;\n  function valToY(v) {\n    return waveBot - ((v - yMin) / (yMax - yMin)) * waveH;\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  for (var yv = -4; yv <= 4; yv += 1) {\n    var py = valToY(yv);\n    ctx.beginPath();\n    ctx.moveTo(waveLeft, py);\n    ctx.lineTo(waveRight, py);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.textAlign = 'right';\n    ctx.textBaseline = 'middle';\n    ctx.fillText(yv + 'σ', waveLeft - 6, py);\n  }\n\n  for (var xi = 0; xi <= 128; xi += 16) {\n    var px = waveLeft + (xi / 128) * waveW;\n    ctx.beginPath();\n    ctx.moveTo(px, waveTop);\n    ctx.lineTo(px, waveBot);\n    ctx.stroke();\n    if (xi % 32 === 0) {\n      ctx.fillStyle = 'rgba(248,250,252,0.6)';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'top';\n      ctx.fillText(String(xi), px, waveBot + 5);\n    }\n  }\n\n  if (!useGauss) {\n    var bHi = valToY(Math.sqrt(3));\n    var bLo = valToY(-Math.sqrt(3));\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.5)';\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.moveTo(waveLeft, bHi); ctx.lineTo(waveRight, bHi);\n    ctx.moveTo(waveLeft, bLo); ctx.lineTo(waveRight, bLo);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.strokeRect(waveLeft, waveTop, waveW, waveH);\n\n  var samples = sampleSeq(128, seedVal, good, useGauss);\n  ctx.strokeStyle = good ? '#38bdf8' : '#ec4899';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (var i = 0; i < 128; i++) {\n    var sx = waveLeft + (i / 127) * waveW;\n    var sy = valToY(Math.max(-4, Math.min(4, samples[i])));\n    if (i === 0) ctx.moveTo(sx, sy);\n    else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  for (var i = 0; i < 128; i++) {\n    var sx = waveLeft + (i / 127) * waveW;\n    var sy = valToY(Math.max(-4, Math.min(4, samples[i])));\n    ctx.fillRect(sx - 1.5, sy - 1.5, 3, 3);\n  }\n\n  var many = sampleSeq(2048, seedVal, good, useGauss);\n  var sum = 0;\n  var sumSq = 0;\n  for (var i = 0; i < many.length; i++) {\n    sum += many[i];\n    sumSq += many[i] * many[i];\n  }\n  var empMean = sum / many.length;\n  var empStd = Math.sqrt(Math.max(0, sumSq / many.length - empMean * empMean));\n\n  var bins = 40;\n  var counts = new Array(bins);\n  for (var b = 0; b < bins; b++) counts[b] = 0;\n  var binW = (yMax - yMin) / bins;\n  for (var i = 0; i < many.length; i++) {\n    var idx = Math.floor((many[i] - yMin) / binW);\n    if (idx >= 0 && idx < bins) counts[idx]++;\n  }\n\n  var pdfScale = pdfW / 0.5;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.32)';\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1;\n  for (var b = 0; b < bins; b++) {\n    var density = counts[b] / (many.length * binW);\n    var barLen = Math.min(pdfW - 4, density * pdfScale);\n    var byTop = valToY(yMin + (b + 1) * binW);\n    var byBot = valToY(yMin + b * binW);\n    if (barLen > 0.5) {\n      ctx.fillRect(pdfLeft, byTop, barLen, byBot - byTop);\n      ctx.strokeRect(pdfLeft, byTop, barLen, byBot - byTop);\n    }\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var steps = 160;\n  for (var s = 0; s <= steps; s++) {\n    var v = yMin + (s / steps) * (yMax - yMin);\n    var p = 0;\n    if (useGauss) {\n      p = Math.exp(-0.5 * v * v) / Math.sqrt(2 * Math.PI);\n    } else {\n      p = Math.abs(v) <= Math.sqrt(3) ? 1 / (2 * Math.sqrt(3)) : 0;\n    }\n    var px = pdfLeft + Math.min(pdfW - 2, p * pdfScale);\n    var py = valToY(v);\n    if (s === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(pdfLeft, waveTop);\n  ctx.lineTo(pdfLeft, waveBot);\n  ctx.lineTo(pdfRight, waveBot);\n  ctx.stroke();\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.fillStyle = good ? '#38bdf8' : '#ec4899';\n  ctx.fillText(good ? '长周期 LCG (无周期重复)' : '短周期 LCG c=32 (每32点严格重复!)', waveLeft + 6, 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText(useGauss ? '高斯 pdf (无硬边界)' : '均匀 pdf (截断±1.73σ)', pdfLeft, 4);\n\n  var lcgTxt = good ? 'a=48271, c=2³¹-1 (正常)' : 'a=5, b=7, c=32 (周期=32点)';\n  var mapTxt = useGauss ? 'Box-Muller 高斯' : '归一化均匀分布';\n  lab.setReadout('LCG: ' + lcgTxt + ' | 映射: ' + mapTxt + ' | 实测均值=' + empMean.toFixed(2) + ', 标准差=' + empStd.toFixed(2));\n\n  syncAudio(seedVal, good, useGauss);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（Box-Muller 除零崩溃）：计算 `(-2 ln R₁)^0.5` 时，如果随机数生成器有可能返回精确的 `0.0`，务必先做保护（例如把 `0` 钳位成 `1e-12` 或改用 `1 - R₁`），否则 `ln(0)` 会直接产生 `NaN` 或 `Infinity` 毁掉整段信号。",
        "避坑 2（方差相加而非标准差相加）：独立噪声叠加时，是**方差（σ²）**直接相加，标准差只按 `√N` 增长。2 个 `[0,1]` 随机数相加标准差是 `1/√6`，而不是 `2/√12`。",
        "避坑 3（12 个数相加法的尾部截断）：12 个均匀随机数相加虽然极快且无需三角函数，但输出绝对不会超过 `±6σ`，且在 `±3σ` 以外的尾部概率略低于真实高斯分布；涉及极高信噪比误码率仿真时，应选用 Box-Muller。",
        "避坑 4（调试锁定种子，上线用时钟重播）：做算法 A/B 对比测试时固定种子 `Seed`，能保证两套算法面对完全一模一样的噪声；正式部署需要真随机体验时，记得用系统时间重新播种。"
      ]
    }
  ]
});
