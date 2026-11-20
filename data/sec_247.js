window.__BOOK_REGISTER_SECTION__("sec_247", {
  "title": "揭秘本福特定律第一谜题：对数规律从何而来？ (Solving Mystery #1)",
  "intuition": "本福特定律中标志性的对数分布，并非隐藏在自然界数字中的神秘法则，而是你在“提取首位数字”时，无意识中用 10 的幂次缩放数据（反对数操作）亲手变出来的数字魔术。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心谜题与频域破案：为什么均值永远被锁定在 0.301？",
      "paragraphs": [
        "关于本福特定律有两个著名的未解之谜，第一个谜题直指本质：**首位数字的对数分布规律究竟从何而来？难道是大自然中隐藏着某种神秘属性吗？**",
        "要揭开谜底，只需用数字信号处理（DSP）的眼光审视三个核心信号（均位于以 10 为底的对数域 `g = log10(x)` 中）：代表原始数据分布的概率密度函数 `pdf(g)`、代表“提取首位数字 `d`”的周期性门控采样函数 `sf(g)`，以及它们卷积后得到的实测首位数字概率曲线 `ost(g)`。",
        "根据傅里叶变换的基本性质，频域零频点 `f = 0` 处的取值**永远等于对数域信号的直流平均值**。对于任意合法的概率密度函数 `pdf(g)`，其曲线下的总面积恒等于 1，这意味着 `PDF(0) = 1` 永远成立！由于时域（对数域）卷积等价于频域相乘，即 `OST(f) = SF(f) × PDF(f)`，把 `f = 0` 代入立刻得到一个铁律：`OST(0)` 永远等于 `SF(0)`，与 `pdf(g)` 长什么样毫无关系！",
        "那么 `SF(0)` 又是多少呢？以数字 `1` 为例，当且仅当数字的对数小数部分落在 `[log10(1), log10(2))` 区间内时，首位才是 `1`，因此周期为 1 的脉冲函数 `sf(g)` 处于高电平的时间比例就是 `log10(2) - log10(1) = 0.301`。同理，寻找数字 `2` 时，`SF(0) = log10(3) - log10(2) = 0.176`，数字 `3` 到 `9` 依此类推。**结论令人震撼：对数规律完全源于 `sf(g)` 和卷积操作本身，与原始数据 `pdf(g)` 毫无关系！**"
      ],
      "formula": {
        "expr": "OST(0) = SF(0) × PDF(0) = SF(0) × 1 = log10(d + 1) - log10(d)",
        "explain": "OST(0) 是实测概率曲线 ost(g) 的平均值；PDF(0) 是原始分布 pdf(g) 的总面积（恒为 1）；SF(0) 是首位数字 d 的门控脉冲 sf(g) 的占空比（即对数区间宽度）。无论原始数据如何变化，实测概率的均值永远被 SF(0) 死死锁住。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：任意揉捏原始分布 pdf(g)，验证均值 OST(0) 纹丝不动",
      "instruction": "拖动「分布宽度 σ」和「中心位置 μ」滑块改变原始数据分布 pdf(g)，或切换「目标首位数字 d」，观察绿色卷积曲线 ost(g) 如何波动，但其均值始终被粉色虚线 OST(0)=SF(0) 牢牢锁定。",
      "controls": [
        {
          "type": "slider",
          "id": "digit",
          "label": "目标首位数字 d",
          "min": 1,
          "max": 9,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sigma",
          "label": "分布宽度 σ_g",
          "min": 0.12,
          "max": 1.2,
          "step": 0.02,
          "value": 0.32,
          "unit": " decades"
        },
        {
          "type": "slider",
          "id": "mu",
          "label": "分布中心 μ",
          "min": -1,
          "max": 1,
          "step": 0.05,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showSF",
          "label": "叠加显示门控脉冲 sf(g)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const d = lab.values.digit;\n  const sigma = lab.values.sigma;\n  const mu = lab.values.mu;\n  const showSF = lab.values.showSF;\n\n  const sf0 = Math.log10((d + 1) / d);\n  const lowEdge = Math.log10(d);\n  const highEdge = Math.log10(d + 1);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 46, padR = 20, padT = 24, padB = 34;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const gMin = -2.0, gMax = 2.0;\n\n  function gToX(g) { return padL + ((g - gMin) / (gMax - gMin)) * plotW; }\n  function vToY(v) { return padT + plotH * (1 - v); }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -2; g <= 2; g += 0.5) {\n    const x = gToX(g);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, padT + plotH); ctx.stroke();\n  }\n  for (let v = 0; v <= 1.001; v += 0.25) {\n    const y = vToY(v);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (let g = -2; g <= 2; g += 1) {\n    ctx.fillText('g=' + g, gToX(g), H - 12);\n  }\n  ctx.textAlign = 'right';\n  for (let v = 0; v <= 1.001; v += 0.5) {\n    ctx.fillText(v.toFixed(1), padL - 6, vToY(v) + 4);\n  }\n\n  function sfVal(g) {\n    const frac = ((g % 1) + 1) % 1;\n    return (frac >= lowEdge && frac < highEdge) ? 1 : 0;\n  }\n\n  const N = 360;\n  if (showSF) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= N; i++) {\n      const g = gMin + (i / N) * (gMax - gMin);\n      const x = gToX(g);\n      const y = vToY(sfVal(g));\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  const M = 140;\n  const taus = [];\n  const weights = [];\n  let wSum = 0;\n  const span = 4.5 * sigma;\n  for (let j = 0; j <= M; j++) {\n    const u = -span + (2 * span * j) / M;\n    const w = Math.exp(-(u * u) / (2 * sigma * sigma));\n    taus.push(mu + u);\n    weights.push(w);\n    wSum += w;\n  }\n  for (let j = 0; j <= M; j++) weights[j] /= wSum;\n\n  ctx.fillStyle = 'rgba(56,189,248,0.18)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(gToX(gMin), vToY(0));\n  for (let i = 0; i <= N; i++) {\n    const g = gMin + (i / N) * (gMax - gMin);\n    const val = Math.exp(-Math.pow(g - mu, 2) / (2 * sigma * sigma)) * 0.85;\n    ctx.lineTo(gToX(g), vToY(val));\n  }\n  ctx.lineTo(gToX(gMax), vToY(0));\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const g = gMin + (i / N) * (gMax - gMin);\n    const val = Math.exp(-Math.pow(g - mu, 2) / (2 * sigma * sigma)) * 0.85;\n    if (i === 0) ctx.moveTo(gToX(g), vToY(val)); else ctx.lineTo(gToX(g), vToY(val));\n  }\n  ctx.stroke();\n\n  const ostVals = [];\n  for (let i = 0; i <= N; i++) {\n    const g = gMin + (i / N) * (gMax - gMin);\n    let acc = 0;\n    for (let j = 0; j <= M; j++) {\n      acc += weights[j] * sfVal(g - taus[j]);\n    }\n    ostVals.push(acc);\n  }\n\n  let periodAvg = 0;\n  const P = 120;\n  for (let k = 0; k < P; k++) {\n    const g = k / P;\n    let acc = 0;\n    for (let j = 0; j <= M; j++) {\n      acc += weights[j] * sfVal(g - taus[j]);\n    }\n    periodAvg += acc;\n  }\n  periodAvg /= P;\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const g = gMin + (i / N) * (gMax - gMin);\n    const x = gToX(g);\n    const y = vToY(ostVals[i]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([6, 4]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  const yAvg = vToY(sf0);\n  ctx.beginPath(); ctx.moveTo(padL, yAvg); ctx.lineTo(padL + plotW, yAvg); ctx.stroke();\n  ctx.restore();\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('■ pdf(g) (面积=1)', padL + 8, 15);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— ost(g) 卷积输出', padL + 135, 15);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('--- OST(0)=SF(0)=' + sf0.toFixed(3), padL + 265, 15);\n  if (showSF) {\n    ctx.fillStyle = '#f59e0b'; ctx.fillText('— sf(g) 门控脉冲', padL + 435, 15);\n  }\n\n  lab.setReadout('首位数字 d=' + d + ' | SF(0) = log10(' + (d + 1) + '/' + d + ') = ' + sf0.toFixed(4) + ' | ost(g) 实测均值 = ' + periodAvg.toFixed(4) + ' | PDF(0) = 1.000');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "魔术师的障眼法：提取首位数字时隐蔽的“反对数”操作",
      "paragraphs": [
        "从信号处理公式得出的结论，在生活中其实像极了一位**魔术师的近景戏法**。假设你从报纸上抄录了一大串跨越不同量级的数字（比如房价、人口、温度、里程），统计它们的首位数字后惊讶地发现呈现对数分布，于是忍不住惊叹这些数字里藏着大自然的密码。",
        "但你忽略了一个被大脑“自动化”掉的庞大工程——**提取首位数字到底干了什么？** 在计算机程序（例如原书 Table 34-1 的第 400–430 行）中，提取一个数的首位数字，必须不断将它**乘以或除以 10**，直到它落入 `[1, 9.999999]` 这个区间为止。",
        "这个数据预处理绝非“无害的旁观”。在实际操作中，连续几个原本毫无关联的数字，可能分别被秘密乘上了 `0.01, 100, 0.1, 1, 10, 1000, 0.001...` 这样一串基于 **10 的幂次（即反对数 anti-logarithm）** 的缩放因子！",
        "你的大脑由于处理速度极快，在用眼睛扫过数字、直接读出首位的那一瞬间，已经悄无声息地完成了这次“10 的幂次折叠”预处理，却误以为自己看到的是未经加工的原始数据。把经过反对数标尺重排后的结果统计成直方图，它自然呈现出对数分布——**真正的魔术师，就是你大脑（或代码）里的取首位操作本身！**"
      ],
      "formula": {
        "expr": "x_norm = x × 10^(-floor(log10(x))) ∈ [1, 10)",
        "explain": "提取首位数字的本质：把横跨多个数量级的原始数据 x，分别乘以 10 的整数次幂，强行折叠进 [1, 10) 这一个十进制对数周期内。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：透视“10^k 折叠魔术”与 sf(g) 占空比听觉对比",
      "instruction": "拖动「10^k 缩放归一化进度」滑块，亲眼见证散落各数量级的数字如何被折叠进 [1, 10) 对数标尺；切换数字 d 并点击播放，听一听对应周期脉冲波 sf(g) 随占空比缩小而产生的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "digit",
          "label": "目标首位数字 d",
          "min": 1,
          "max": 9,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "fold",
          "label": "10^k 缩放归一化进度",
          "min": 0,
          "max": 100,
          "step": 1,
          "value": 100,
          "unit": "%"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 听 sf(g) 脉冲波形音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst samples = [\n  0.0023, 14.7, 0.089, 520, 1.38, 0.0041,\n  7600, 0.31, 2.85, 0.016, 43, 940,\n  0.125, 6.4, 1950, 0.0072, 310, 0.54\n];\n\nlet audioInit = false;\nlet osc = null;\nlet gainNode = null;\n\nfunction updateAudio() {\n  const play = lab.values.play;\n  const d = lab.values.digit;\n  const duty = Math.log10((d + 1) / d);\n\n  if (!play && !audioInit) return;\n\n  const actx = lab.getAudioContext();\n  if (!actx) return;\n  if (play && actx.state === 'suspended') {\n    actx.resume();\n  }\n\n  if (!audioInit) {\n    osc = actx.createOscillator();\n    gainNode = actx.createGain();\n    gainNode.gain.value = 0;\n    osc.frequency.value = 220;\n    osc.connect(gainNode);\n    gainNode.connect(actx.destination);\n    osc.start();\n    audioInit = true;\n  }\n\n  const harmonics = 32;\n  const real = new Float32Array(harmonics + 1);\n  const imag = new Float32Array(harmonics + 1);\n  for (let n = 1; n <= harmonics; n++) {\n    real[n] = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * duty);\n  }\n  const wave = actx.createPeriodicWave(real, imag);\n  osc.setPeriodicWave(wave);\n\n  gainNode.gain.setTargetAtTime(play ? 0.09 : 0.0, actx.currentTime, 0.025);\n}\n\nfunction draw() {\n  const d = lab.values.digit;\n  const foldPct = lab.values.fold;\n  const p = foldPct / 100;\n  const sf0 = Math.log10((d + 1) / d);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const padL = 44, padR = 24;\n  const topY = 62;\n  const axisW = W - padL - padR;\n  const gMin = -3, gMax = 4;\n\n  function gToTopX(g) { return padL + ((g - gMin) / (gMax - gMin)) * axisW; }\n\n  const tx0 = gToTopX(0);\n  const tx1 = gToTopX(1);\n  ctx.fillStyle = 'rgba(16,185,129,0.14)';\n  ctx.fillRect(tx0, topY - 24, tx1 - tx0, 44);\n  ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(tx0, topY - 24, tx1 - tx0, 44);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(padL, topY); ctx.lineTo(padL + axisW, topY); ctx.stroke();\n\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  for (let k = -3; k <= 4; k++) {\n    const x = gToTopX(k);\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.beginPath(); ctx.moveTo(x, topY - 6); ctx.lineTo(x, topY + 6); ctx.stroke();\n    ctx.fillStyle = (k === 0 || k === 1) ? '#10b981' : 'rgba(248,250,252,0.6)';\n    const lbl = k === 0 ? '1' : (k === 1 ? '10' : '10^' + k);\n    ctx.fillText(lbl, x, topY + 18);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('1. 原始多数量级数据 → 乘以 10^k 折叠进 [1, 10) 区间 (进度 ' + foldPct + '%)', padL, 20);\n\n  const botY = 142, botH = 52;\n  function fracToBotX(f) { return padL + f * axisW; }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('2. 放大 [1, 10) 对数标尺：每个数字占宽 = log10(d+1) - log10(d)', padL, 124);\n\n  let hitCount = 0;\n  for (let dig = 1; dig <= 9; dig++) {\n    const f0 = Math.log10(dig);\n    const f1 = Math.log10(dig + 1);\n    const x0 = fracToBotX(f0);\n    const x1 = fracToBotX(f1);\n    const isTarget = (dig === d);\n    ctx.fillStyle = isTarget ? 'rgba(245,158,11,0.28)' : 'rgba(56,189,248,0.08)';\n    ctx.fillRect(x0, botY, x1 - x0, botH);\n    ctx.strokeStyle = isTarget ? '#f59e0b' : 'rgba(255,255,255,0.2)';\n    ctx.lineWidth = isTarget ? 2 : 1;\n    ctx.strokeRect(x0, botY, x1 - x0, botH);\n\n    ctx.fillStyle = isTarget ? '#f59e0b' : 'rgba(248,250,252,0.75)';\n    ctx.font = isTarget ? 'bold 12px monospace' : '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(dig), (x0 + x1) / 2, botY + 43);\n    if (isTarget) {\n      ctx.font = '10px monospace';\n      ctx.fillText((sf0 * 100).toFixed(1) + '%', (x0 + x1) / 2, botY + botH + 15);\n    }\n  }\n\n  for (let i = 0; i < samples.length; i++) {\n    const val = samples[i];\n    const logVal = Math.log10(val);\n    const k = Math.floor(logVal);\n    const frac = logVal - k;\n    const lead = Math.floor(Math.pow(10, frac) + 1e-9);\n    const isHit = (lead === d);\n    if (isHit) hitCount++;\n\n    const curG = (1 - p) * logVal + p * frac;\n    const xTop = gToTopX(curG);\n    const yTop = topY - 10 - (i % 3) * 5;\n\n    ctx.fillStyle = isHit ? '#f59e0b' : '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(xTop, yTop, isHit ? 4.2 : 3.2, 0, Math.PI * 2);\n    ctx.fill();\n\n    const xBot = fracToBotX(frac);\n    const yBot = botY + 9 + (i % 3) * 9;\n    ctx.globalAlpha = 0.25 + 0.75 * p;\n    ctx.fillStyle = isHit ? '#f59e0b' : '#10b981';\n    ctx.beginPath();\n    ctx.arc(xBot, yBot, isHit ? 4.2 : 3.0, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.globalAlpha = 1;\n  }\n\n  lab.setReadout('当前首位 d=' + d + ' | 区间对数宽度 SF(0) = ' + (sf0 * 100).toFixed(1) + '% | 样本命中 ' + hitCount + '/' + samples.length + ' (' + ((hitCount / samples.length) * 100).toFixed(1) + '%) | 音频脉冲占空比=' + (sf0 * 100).toFixed(1) + '%');\n}\n\nlab.onUpdate(function () {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "均值锁定铁律：由于任何概率分布 pdf(g) 的总面积 PDF(0) 恒为 1，输出曲线 ost(g) 的平均值 OST(0) 永远等于采样门控函数 sf(g) 的占空比 SF(0) = log10(d+1) - log10(d)，绝对不随原始数据分布改变。",
        "打破神秘感：本福特定律里的“对数形状”不是自然界的玄学，而是提取首位数字时不断乘除 10^k（反对数缩放）所自带的标尺效应。",
        "频域思维的威力：把统计问题看作“分布 pdf(g) 与周期矩形波 sf(g) 的卷积”，直接把直流均值（第一谜题：对数规律来源）与交流振荡（第二谜题：什么分布才满足定律）彻底解耦，一眼看穿问题本质。"
      ]
    }
  ]
});
