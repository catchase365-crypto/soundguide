window.__BOOK_REGISTER_SECTION__("sec_250", {
  "title": "对数正态分布的本福特相变分析 (Analysis of the Log-Normal Distribution)",
  "intuition": "对数正态分布的宽窄一旦越过临界阈值，它对本福特定律的服从度就会从“完全不符”发生雪崩式跃迁到“几乎完美”，而这一自然界最常见的分布正是乘法中心极限定理的产物。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把“模糊直觉”变成精确公式：用 OST(1) 衡量本福特合规度",
      "paragraphs": [
        "在前面的观察中，我们发现一个令人惊讶的现象：同样是对数正态分布，对数标准差为 `0.25` 时完全不服从本福特定律，而标准差仅增大到 `0.5` 时，却能极好地服从该定律。为了彻底揭开这两种行为之间的解析过渡机制，我们需要把问题严格数学化，消除一切模糊性。",
        "我们明确规定三个要素：**分布形状**（对数尺度 $g$ 上为正态分布，即对数正态分布）、**分布宽度**（对数域标准差 $\\sigma_g$，常以 $2\\sigma_g$ 表示主要跨度）、以及**合规度指标**（采用数字“1”尺度测试在基频 $f=1$ 处的幅值 $OST(1)$）。",
        "由于高斯函数的傅里叶变换依然是高斯函数，对数域标准差为 $\\sigma_g$ 的正态分布，其频域特征函数 $PSF(f)$ 是一个以 $f=0$ 为中心、标准差为 $\\sigma_f = 1/(2\\pi\\sigma_g)$ 的单边高斯曲线。将其在 $f=1$ 处求值，并与尺度函数在 $f=1$ 处的响应 $SF(1) = 0.516$ 相乘，就得到了对数正态分布偏离本福特定律的精确解析式。"
      ],
      "formula": {
        "expr": "OST(1) = SF(1) × PSF(1) = 51.6% × exp(-2π²σ_g²)",
        "explain": "OST(1) 越小代表越符合本福特定律；51.6% 是数字“1”尺度函数的基频幅值 SF(1)；σ_g 是分布在对数坐标 g 上的标准差（注：原书公式排版末项误印为 σ_f²，由 σ_f = 1/(2πσ_g) 代入推导实际应为 σ_g²）。由此可得首位数字“1”出现概率的最高值为 30.1% + OST(1)，最低值为 30.1% - OST(1)。"
      }
    },
    {
      "type": "concept",
      "heading": "令人抓狂的“悬崖相变”与线性尺度的视觉骗局",
      "paragraphs": [
        "代入公式算一笔账：当分布宽度 $2\\sigma_g = 0.5$（即 $\\sigma_g = 0.25$）时，$OST(1) \\approx 15.0\\%$，这意味着数字“1”的占比会在 `15%` 到 `45%` 之间剧烈震荡，与本福特定律的 `30.1%` 相差甚远；但只要把宽度翻倍到 $2\\sigma_g = 1.0$（即 $\\sigma_g = 0.5$），波动范围立刻骤降到 `1%` 以内！",
        "更戏剧性的是过渡区的陡峭程度：在 $2\\sigma_g = 0.60$（记为情况 A）与 $2\\sigma_g = 0.90$（记为情况 B）之间，两者在传统线性坐标 $n$ 上的概率密度曲线看起来非常相似；然而在“数字 1 占比波动图”上，A 几乎完全背离本福特定律，B 却已经非常贴合。这也是为什么在引入信号处理视角前，无数研究者看着两条几乎没差别的曲线却百思不得其解。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验室 1：对数正态分布的“悬崖相变”与线性/对数双视角",
      "instruction": "拖动「分布宽度 2σg」滑块，观察左图数字“1”占比波动带的急剧收窄，并对比右图在“线性坐标 n”与“对数坐标 g”下曲线形态的巨大差异。",
      "controls": [
        {
          "type": "slider",
          "id": "width2s",
          "label": "分布宽度 2σg",
          "min": 0.4,
          "max": 1.5,
          "step": 0.02,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showAB",
          "label": "标注书中临界点 A(0.6) 与 B(0.9)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "logView",
          "label": "右侧切换对数坐标 pdf(g)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction calcOST1(w) {\n  const sg = w / 2;\n  return 0.516 * Math.exp(-2 * Math.PI * Math.PI * sg * sg);\n}\n\nfunction pdfN(n, w) {\n  if (n <= 1e-4) return 0;\n  const sg = w / 2;\n  const lg = Math.log10(n);\n  return Math.exp(-(lg * lg) / (2 * sg * sg)) / (n * Math.LN10 * Math.sqrt(2 * Math.PI) * sg);\n}\n\nfunction pdfG(g, w) {\n  const sg = w / 2;\n  return Math.exp(-(g * g) / (2 * sg * sg)) / (Math.sqrt(2 * Math.PI) * sg);\n}\n\nfunction draw() {\n  const w = lab.values.width2s;\n  const showAB = lab.values.showAB;\n  const logView = lab.values.logView;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 46, ly = 26, lw = 286, lh = 180;\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n\n  for (let p = 0; p <= 70; p += 10) {\n    const y = ly + lh - (p / 70) * lh;\n    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n    if (p % 20 === 0 || p === 70) {\n      ctx.textAlign = 'right';\n      ctx.fillText(p + '%', lx - 6, y + 4);\n    }\n  }\n  for (let xv = 0; xv <= 1.5; xv += 0.5) {\n    const x = lx + (xv / 1.5) * lw;\n    ctx.beginPath(); ctx.moveTo(x, ly); ctx.lineTo(x, ly + lh); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(xv.toFixed(1), x, ly + lh + 15);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('本福特波动带 vs 宽度 (2σg)', lx + lw / 2, 16);\n\n  const y301 = ly + lh - (0.301 / 0.70) * lh;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(lx, y301); ctx.lineTo(lx + lw, y301); ctx.stroke();\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(lx, ly, lw, lh); ctx.clip();\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.12)';\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const ww = 0.36 + (i / 100) * (1.5 - 0.36);\n    const hi = Math.min(0.70, 0.301 + calcOST1(ww));\n    const x = lx + (ww / 1.5) * lw;\n    const y = ly + lh - (hi / 0.70) * lh;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  for (let i = 100; i >= 0; i--) {\n    const ww = 0.36 + (i / 100) * (1.5 - 0.36);\n    const lo = Math.max(0, 0.301 - calcOST1(ww));\n    const x = lx + (ww / 1.5) * lw;\n    const y = ly + lh - (lo / 0.70) * lh;\n    ctx.lineTo(x, y);\n  }\n  ctx.closePath(); ctx.fill();\n\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const ww = 0.36 + (i / 100) * (1.5 - 0.36);\n    const hi = Math.min(0.70, 0.301 + calcOST1(ww));\n    const x = lx + (ww / 1.5) * lw;\n    const y = ly + lh - (hi / 0.70) * lh;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const ww = 0.36 + (i / 100) * (1.5 - 0.36);\n    const lo = Math.max(0, 0.301 - calcOST1(ww));\n    const x = lx + (ww / 1.5) * lw;\n    const y = ly + lh - (lo / 0.70) * lh;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showAB) {\n    const xA = lx + (0.60 / 1.5) * lw;\n    const xB = lx + (0.90 / 1.5) * lw;\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(236,72,153,0.7)';\n    ctx.beginPath(); ctx.moveTo(xA, ly); ctx.lineTo(xA, ly + lh); ctx.stroke();\n    ctx.strokeStyle = 'rgba(56,189,248,0.7)';\n    ctx.beginPath(); ctx.moveTo(xB, ly); ctx.lineTo(xB, ly + lh); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillStyle = '#ec4899'; ctx.fillText('A', xA + 7, ly + 14);\n    ctx.fillStyle = '#38bdf8'; ctx.fillText('B', xB + 7, ly + 14);\n  }\n\n  const curX = lx + (w / 1.5) * lw;\n  const ost = calcOST1(w);\n  const curHi = Math.min(0.70, 0.301 + ost);\n  const curLo = Math.max(0, 0.301 - ost);\n  const yHi = ly + lh - (curHi / 0.70) * lh;\n  const yLo = ly + lh - (curLo / 0.70) * lh;\n\n  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(curX, yHi); ctx.lineTo(curX, yLo); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(curX, yHi, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(curX, yLo, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(lx, ly, lw, lh);\n\n  const rx = 398, ry = 26, rw = 294, rh = 180;\n  const yMax = logView ? 2.0 : 1.0;\n  const xMin = logView ? -1.5 : 0;\n  const xMax = logView ? 1.5 : 3.0;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  for (let i = 0; i <= 4; i++) {\n    const yv = (i / 4) * yMax;\n    const y = ry + rh - (yv / yMax) * rh;\n    ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + rw, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(yv.toFixed(1), rx - 6, y + 4);\n  }\n  const xTicks = logView ? [-1, 0, 1] : [0, 1, 2, 3];\n  for (const xt of xTicks) {\n    const x = rx + ((xt - xMin) / (xMax - xMin)) * rw;\n    ctx.beginPath(); ctx.moveTo(x, ry); ctx.lineTo(x, ry + rh); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(xt.toString(), x, ry + rh + 15);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(logView ? '对数尺度分布 pdf(g) [每格=10倍]' : '线性尺度分布 pdf(n) [看似相似的陷阱]', rx + rw / 2, 16);\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(rx, ry, rw, rh); ctx.clip();\n\n  function plotCurve(ww, color, dashed, lwWidth) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lwWidth;\n    if (dashed) ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    const steps = 160;\n    for (let i = 0; i <= steps; i++) {\n      const xv = xMin + (i / steps) * (xMax - xMin);\n      const val = logView ? pdfG(xv, ww) : pdfN(xv, ww);\n      const x = rx + (i / steps) * rw;\n      const y = ry + rh - Math.min(1.05, val / yMax) * rh;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  if (showAB) {\n    plotCurve(0.60, 'rgba(236,72,153,0.75)', true, 1.5);\n    plotCurve(0.90, 'rgba(56,189,248,0.75)', true, 1.5);\n  }\n  plotCurve(w, '#f59e0b', false, 2.5);\n\n  ctx.fillStyle = 'rgba(245,158,11,0.14)';\n  ctx.beginPath();\n  ctx.moveTo(rx, ry + rh);\n  for (let i = 0; i <= 160; i++) {\n    const xv = xMin + (i / 160) * (xMax - xMin);\n    const val = logView ? pdfG(xv, w) : pdfN(xv, w);\n    const x = rx + (i / 160) * rw;\n    const y = ry + rh - Math.min(1.05, val / yMax) * rh;\n    ctx.lineTo(x, y);\n  }\n  ctx.lineTo(rx + rw, ry + rh);\n  ctx.closePath(); ctx.fill();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.restore();\n\n  let verdict = '过渡临界区';\n  if (ost > 0.08) verdict = '严重偏离 (不符合)';\n  else if (ost < 0.015) verdict = '高度服从本福特定律';\n\n  lab.setReadout(\n    '2σg = ' + w.toFixed(2) +\n    ' (σg = ' + (w / 2).toFixed(2) + ') | OST(1) = ' + (ost * 100).toFixed(2) + '%' +\n    ' | 数字“1”占比波动: [' + (curLo * 100).toFixed(1) + '% ~ ' + (curHi * 100).toFixed(1) + '%] | ' + verdict\n  );\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "为什么没有“完美服从”的分布？以及自然界的乘法引擎 CLT",
      "paragraphs": [
        "仔细看刚才的公式 $\\exp(-2\\pi^2\\sigma_g^2)$：只要 $\\sigma_g$ 是有限数，这个指数项就永远严格大于 `0`——也就是说，左图中的两条边界曲线收敛得极快，却**永远不会真正相交**！举个极端的例子，当 $\\sigma_g = 3$ 时，偏离度约为 $10^{78}$ 分之一；就算从宇宙大爆炸开始，用十亿台电脑每秒各生成十亿个随机数，在统计学上也绝无可能检测出这微小的误差。但从纯代数方程的角度看，它依然“不等于零”。这解释了为何传统数学试图寻找“严格服从本福特定律的条件”时会得出“Never（不存在）”的绝望结论，而 DSP 频域视角给出了“足够接近即可”的工程正解。",
        "那么，对数正态分布为何在自然界如此普遍？幕后推手正是统计学中最强大的定律——**中心极限定理 (CLT)**。把许多独立随机数**相加**会得到正态分布，但正态分布在对数尺度上往往太窄，无法服从本福特定律；而如果把一组随机数**相乘**，其对数 $\\log(x_1 x_2 \\cdots x_\\alpha) = \\sum \\log(x_i)$ 就变成了对数尺度上的相加，结果自然服从**对数正态分布**！只要连乘的因子足够多，对数跨度自然被拉宽，从而高度服从本福特定律。",
        "想亲手造出服从本福特定律的数据？只需调用编程语言内置的 `rand()`（在 $[0,1]$ 上均匀分布），连续调用 $\\alpha$ 次并把结果相乘。因为单个均匀分布有 $PDF(1) = 0.344$，频域相乘后得到 $OST(1) = 51.6\\% \\times 0.344^\\alpha$。比如连乘 `10` 次时，$\\sigma_g \\approx 0.75$，误差 $OST(1)$ 仅有 `0.0012%`！但做实验时务必牢记**统计涨落（采样噪声）**：$N$ 个随机事件的标准差涨落约为 $\\sqrt{N}$。用 `100万` 个样本检验时，首位“1”的占比天生带有 $\\pm 0.1\\%$ 的随机误差（约 $301,000 \\pm 1,000$）；想测出 `0.0012%` 这么小的理论偏离，你需要的样本量将超过 **10 亿个**！"
      ],
      "formula": {
        "expr": "OST(1) = 51.6% × 0.344^α   vs   统计噪声 σ_stat ≈ 45.9% / √N",
        "explain": "α 为 [0,1] 均匀随机数的连乘次数（0.344 是单个均匀分布在 f=1 处的傅里叶变换幅值）；N 为抽样总样本数，首位数字“1”占比（均值 p≈0.301）的二项统计标准差约为 √(p(1-p)/N) ≈ 0.459/√N。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验室 2：均匀随机数连乘 (CLT) 与 √N 统计噪声实测",
      "instruction": "调节连乘次数 α 与样本量 N=10^k，实时运行浏览器蒙特卡洛抽样；观察左图实测柱状图何时贴近本福特曲线，以及右图“理论偏离 OST(1)”何时被“√N 统计噪声”彻底淹没（可开启声音聆听偏差与噪声对比）。",
      "controls": [
        {
          "type": "slider",
          "id": "alpha",
          "label": "均匀随机数连乘次数 α",
          "min": 1,
          "max": 12,
          "step": 1,
          "value": 2,
          "unit": " 次"
        },
        {
          "type": "slider",
          "id": "expN",
          "label": "采样总数 N = 10^k",
          "min": 2,
          "max": 5,
          "step": 0.5,
          "value": 4,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "resample",
          "label": "重新随机抽样一批",
          "value": false
        },
        {
          "type": "audio",
          "id": "sound",
          "label": "▶ 听音：偏差信号 vs 统计底噪",
          "activeLabel": "⏸ 静音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst LOG_THRESH = [0, 0.30102999566, 0.47712125472, 0.60205999133, 0.69897000434, 0.77815125038, 0.84509804001, 0.90308998699, 0.95424250944, 1.0];\nconst BENFORD = [];\nfor (let d = 1; d <= 9; d++) BENFORD[d] = Math.log10(1 + 1 / d);\n\nlet lastAlpha = null, lastExpN = null, lastResample = null;\nlet counts = new Array(10).fill(0);\nlet curN = 10000;\n\nlet audioNodes = null;\n\nfunction ensureAudio() {\n  if (audioNodes) return audioNodes;\n  const actx = lab.getAudioContext();\n  if (!actx) return null;\n  const master = actx.createGain();\n  master.gain.value = 0;\n  master.connect(actx.destination);\n\n  const osc = actx.createOscillator();\n  osc.type = 'sawtooth';\n  osc.frequency.value = 165;\n  const oscFilter = actx.createBiquadFilter();\n  oscFilter.type = 'lowpass';\n  oscFilter.frequency.value = 420;\n  const oscGain = actx.createGain();\n  oscGain.gain.value = 0;\n  osc.connect(oscFilter); oscFilter.connect(oscGain); oscGain.connect(master);\n  osc.start();\n\n  const bufLen = actx.sampleRate * 2;\n  const buf = actx.createBuffer(1, bufLen, actx.sampleRate);\n  const data = buf.getChannelData(0);\n  for (let i = 0; i < bufLen; i++) data[i] = Math.random() * 2 - 1;\n  const noise = actx.createBufferSource();\n  noise.buffer = buf;\n  noise.loop = true;\n  const nFilter = actx.createBiquadFilter();\n  nFilter.type = 'bandpass';\n  nFilter.frequency.value = 850;\n  nFilter.Q.value = 0.7;\n  const nGain = actx.createGain();\n  nGain.gain.value = 0;\n  noise.connect(nFilter); nFilter.connect(nGain); nGain.connect(master);\n  noise.start();\n\n  audioNodes = { actx, master, oscGain, nGain };\n  return audioNodes;\n}\n\nfunction runSimulation(alpha, expN) {\n  curN = Math.round(Math.pow(10, expN));\n  counts.fill(0);\n  for (let i = 0; i < curN; i++) {\n    let p = 1;\n    for (let k = 0; k < alpha; k++) {\n      p *= (Math.random() || 1e-12);\n    }\n    const lg = Math.log10(p);\n    const frac = lg - Math.floor(lg);\n    let d = 1;\n    while (d < 9 && frac >= LOG_THRESH[d]) d++;\n    counts[d]++;\n  }\n}\n\nfunction updateAll() {\n  const alpha = lab.values.alpha;\n  const expN = lab.values.expN;\n  const resample = lab.values.resample;\n  const sound = lab.values.sound;\n\n  if (alpha !== lastAlpha || expN !== lastExpN || resample !== lastResample) {\n    runSimulation(alpha, expN);\n    lastAlpha = alpha;\n    lastExpN = expN;\n    lastResample = resample;\n  }\n\n  const ostBias = 0.516 * Math.pow(0.344, alpha);\n  const statNoise = Math.sqrt(0.301 * 0.699 / curN);\n\n  if (sound) {\n    const nodes = ensureAudio();\n    if (nodes) {\n      if (nodes.actx.state === 'suspended') nodes.actx.resume();\n      const t = nodes.actx.currentTime;\n      nodes.master.gain.setTargetAtTime(1.0, t, 0.03);\n      nodes.oscGain.gain.setTargetAtTime(Math.min(0.06, ostBias * 0.35), t, 0.04);\n      nodes.nGain.gain.setTargetAtTime(Math.min(0.06, statNoise * 1.4), t, 0.04);\n    }\n  } else if (audioNodes) {\n    audioNodes.master.gain.setTargetAtTime(0, audioNodes.actx.currentTime, 0.03);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 44, ly = 26, lw = 380, lh = 178;\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n\n  for (let p = 0; p <= 45; p += 15) {\n    const y = ly + lh - (p / 45) * lh;\n    ctx.beginPath(); ctx.moveTo(lx, y); ctx.lineTo(lx + lw, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(p + '%', lx - 6, y + 4);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('实测首位数字分布 (N = ' + curN.toLocaleString() + ') vs 本福特理论', lx + lw / 2, 16);\n\n  const slotW = lw / 9;\n  const barW = slotW * 0.56;\n  for (let d = 1; d <= 9; d++) {\n    const pObs = counts[d] / curN;\n    const err = Math.sqrt(pObs * (1 - pObs) / curN);\n    const cx = lx + (d - 0.5) * slotW;\n    const bh = Math.min(lh, (pObs / 0.45) * lh);\n    const by = ly + lh - bh;\n\n    ctx.fillStyle = alpha >= 4 ? 'rgba(16,185,129,0.75)' : 'rgba(56,189,248,0.75)';\n    ctx.fillRect(cx - barW / 2, by, barW, bh);\n\n    const yTop = Math.max(ly, ly + lh - ((pObs + err) / 0.45) * lh);\n    const yBot = Math.min(ly + lh, ly + lh - ((pObs - err) / 0.45) * lh);\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(cx, yTop); ctx.lineTo(cx, yBot);\n    ctx.moveTo(cx - 4, yTop); ctx.lineTo(cx + 4, yTop);\n    ctx.moveTo(cx - 4, yBot); ctx.lineTo(cx + 4, yBot);\n    ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(d.toString(), cx, ly + lh + 15);\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let d = 1; d <= 9; d++) {\n    const cx = lx + (d - 0.5) * slotW;\n    const y = ly + lh - (BENFORD[d] / 0.45) * lh;\n    if (d === 1) ctx.moveTo(cx, y); else ctx.lineTo(cx, y);\n  }\n  ctx.stroke();\n  for (let d = 1; d <= 9; d++) {\n    const cx = lx + (d - 0.5) * slotW;\n    const y = ly + lh - (BENFORD[d] / 0.45) * lh;\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(cx, y, 3.5, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(lx, ly, lw, lh);\n\n  const rx = 472, ry = 26, rw = 222, rh = 178;\n  const minExp = -5, maxExp = 0;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.font = '10px monospace';\n  ctx.fillStyle = '#94a3b8';\n  for (let e = minExp; e <= maxExp; e++) {\n    const y = ry + rh - ((e - minExp) / (maxExp - minExp)) * rh;\n    ctx.beginPath(); ctx.moveTo(rx, y); ctx.lineTo(rx + rw, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText((Math.pow(10, e + 2)).toPrecision(1) + '%', rx - 5, y + 3);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('对数尺度对比：理论偏差 vs 统计噪声', rx + rw / 2, 16);\n\n  function logHeight(val) {\n    const lg = Math.max(minExp, Math.min(maxExp, Math.log10(Math.max(1e-7, val))));\n    return ((lg - minExp) / (maxExp - minExp)) * rh;\n  }\n\n  const hBias = logHeight(ostBias);\n  const hNoise = logHeight(statNoise);\n  const bw2 = 48;\n  const x1 = rx + rw * 0.28 - bw2 / 2;\n  const x2 = rx + rw * 0.72 - bw2 / 2;\n\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(x1, ry + rh - hBias, bw2, hBias);\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(x2, ry + rh - hNoise, bw2, hNoise);\n\n  ctx.font = 'bold 11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText((ostBias * 100).toFixed(4) + '%', x1 + bw2 / 2, Math.max(ry + 12, ry + rh - hBias - 6));\n  ctx.fillStyle = '#10b981';\n  ctx.fillText((statNoise * 100).toFixed(2) + '%', x2 + bw2 / 2, Math.max(ry + 12, ry + rh - hNoise - 6));\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('理论偏差 OST(1)', x1 + bw2 / 2, ry + rh + 15);\n  ctx.fillText('采样噪声 σ_stat', x2 + bw2 / 2, ry + rh + 15);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.restore();\n\n  const p1Obs = (counts[1] / curN * 100).toFixed(1);\n  const detectable = ostBias > 2 * statNoise ? '理论偏离显著 (> 2σ噪声，可检出)' : '理论偏离已被 √N 统计噪声淹没 (需更大 N)';\n  lab.setReadout(\n    'α=' + alpha + ' 次连乘 | 实测“1”占比=' + p1Obs + '% (理论 30.1%) | ' +\n    'OST(1)=' + (ostBias * 100).toFixed(4) + '% vs 1σ统计噪声=' + (statNoise * 100).toFixed(2) + '% | ' + detectable\n  );\n}\n\nlab.onUpdate(updateAll);\nupdateAll();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "警惕线性坐标的欺骗性：对数正态分布 2σg=0.6 与 0.9 在线性数轴上长得非常接近，但前者不服从本福特定律，后者几乎完美服从——分析跨数量级数据时务必切到对数坐标 g。",
        "不要追求“绝对为零”的理论误差：任何有限宽度的对数正态分布都存在非零的 OST(1)，但指数项 exp(-2π²σ_g²) 衰减极快，在工程与宇宙统计尺度上“足够接近”就等价于完美服从。",
        "记住自然界的分工：随机变量相加产生正态分布（通常太窄，不服从本福特）；随机变量相乘产生对数正态分布（天然拓宽对数跨度，是自然数据普遍服从本福特定律的核心原因）。",
        "统计检验的 √N 陷阱：用蒙特卡洛或实测数据验证本福特定律时，采样噪声约为 1/√N；若误差已小到 0.001% 量级（如 10 个均匀随机数连乘），没有十亿级以上样本量根本不可能测出偏差，切勿把采样噪声误判为规律失效。"
      ]
    }
  ]
});
