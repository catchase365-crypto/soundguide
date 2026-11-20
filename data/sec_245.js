window.__BOOK_REGISTER_SECTION__("sec_245", {
  "title": "将本福特定律写成卷积 (Writing Benford’s Law as a Convolution)",
  "intuition": "把数字的分布搬到以 10 为底的对数坐标轴上后，“乘以常数缩放”变成了“曲线平移”，本福特定律的“1的缩放检验”瞬间化身为周期采样脉冲与概率密度函数的标准卷积。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 从统计走向概率：对数坐标轴上的 PDF 与面积修正",
      "paragraphs": [
        "在上一节的计算机程序中，我们通过生成一万个随机数并反复统计来执行**1的缩放检验 (Ones Scaling Test)**，这属于**统计学 (Statistics)** 视角——分析一批具体的样本数字。现在我们要跃升到**概率论 (Probability)** 视角，直接用决定数字生成规律的**概率密度函数 (probability density function, pdf)** 来重写这个检验。",
        "为了把本福特定律变成直观的信号处理问题，我们不再把 PDF 画在传统的**线性数轴**上，而是画在**以 10 为底的对数数轴**上，并用变量 `g` 表示对数坐标（例如 `g = -2` 对应线性值 `0.01`，`g = 0` 对应 `1`，`g = 1` 对应 `10`），记作 `pdf(g)`。",
        "但把 PDF 从线性轴搬到对数轴有一个致命陷阱：**不能直接做点对点映射！** 概率密度函数的核心意义在于“区间下方的**面积**等于样本落入该区间的概率”。以区间 `[3, 4]` 为例，在线性轴上它的宽度是 `1.00`；映射到对数轴 `[log(3), log(4)] = [0.477, 0.602]` 后，宽度骤缩为 `0.125`。如果直接把函数值点对点搬过来，曲线下面积就会被严重破坏，不再满足总面积为 1 的概率要求。",
        "好在修正方法非常简单：先按点对点映射把线性 PDF 搬到对数轴，再乘上一个指数面积修正因子 `c(g)`。而如果你是直接用实验数据画直方图，只要一开始就在**对数轴上等宽分箱**统计，就自动满足面积守恒，无需额外修正。"
      ],
      "formula": {
        "expr": "c(g) = ln(10) · 10^g",
        "explain": "g 为以 10 为底的对数坐标（x = 10^g）；ln(10) ≈ 2.3026。当把线性域的 pdf 点对点映射到对数域时，乘以 c(g) 恰好抵消对数压缩/拉伸导致的区间宽度变化（即微积分变量代换 dx = ln(10)·10^g dg），保证任意区间概率面积不变。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验一：线性域 vs 对数域的面积守恒验证",
      "instruction": "拖动对数均值 μ_g 与标准差 σ_g，开关「Eq.34-1 面积修正」，观察右图直接点对点映射如何扭曲概率面积，以及修正后如何完美还原高斯/对数正态分布并保持 [1, 2] 区间面积一致。",
      "controls": [
        {
          "type": "slider",
          "id": "meanG",
          "label": "对数均值 μ_g",
          "min": -0.8,
          "max": 0.4,
          "step": 0.05,
          "value": -0.25,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stdG",
          "label": "对数标准差 σ_g",
          "min": 0.15,
          "max": 0.6,
          "step": 0.05,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "applyCorr",
          "label": "启用 Eq.34-1 面积修正 c(g)=ln(10)·10^g",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction pdfLogTrue(g, mu, sig) {\n  var z = (g - mu) / sig;\n  return (1 / (sig * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);\n}\nfunction pdfLin(x, mu, sig) {\n  if (x <= 1e-6) return 0;\n  return pdfLogTrue(Math.log10(x), mu, sig) / (x * Math.LN10);\n}\nfunction render() {\n  var mu = lab.values.meanG;\n  var sig = lab.values.stdG;\n  var corr = lab.values.applyCorr;\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var lX0 = 38, lW = 295, rX0 = 395, rW = 295, baseY = 200, plotH = 150;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var gy = baseY - (i / 4) * plotH;\n    ctx.beginPath(); ctx.moveTo(lX0, gy); ctx.lineTo(lX0 + lW, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rX0, gy); ctx.lineTo(rX0 + rW, gy); ctx.stroke();\n  }\n\n  // Left panel: Linear x in [0, 3]\n  var xMax = 3.0, linYMax = 1.6;\n  var linArea12 = 0, dx = 0.005;\n  for (var x = 1.0; x < 2.0; x += dx) linArea12 += pdfLin(x, mu, sig) * dx;\n\n  // Fill [1, 2] on linear\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';\n  ctx.beginPath();\n  ctx.moveTo(lX0 + (1.0 / xMax) * lW, baseY);\n  for (var x = 1.0; x <= 2.0; x += 0.01) {\n    var px = lX0 + (x / xMax) * lW;\n    var py = baseY - Math.min(1.15, pdfLin(x, mu, sig) / linYMax) * plotH;\n    ctx.lineTo(px, py);\n  }\n  ctx.lineTo(lX0 + (2.0 / xMax) * lW, baseY);\n  ctx.closePath(); ctx.fill();\n\n  // Stroke linear curve\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 200; i++) {\n    var x = 0.01 + (i / 200) * (xMax - 0.01);\n    var px = lX0 + (x / xMax) * lW;\n    var py = baseY - Math.min(1.15, pdfLin(x, mu, sig) / linYMax) * plotH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Right panel: Log g in [-2, 1]\n  var gMin = -2.0, gMax = 1.0, logYMax = 2.0;\n  var logArea01 = 0, logTotal = 0, dg = 0.005, log2 = Math.log10(2);\n  for (var g = -2.5; g <= 1.5; g += dg) {\n    var val = corr ? pdfLogTrue(g, mu, sig) : (pdfLogTrue(g, mu, sig) / (Math.LN10 * Math.pow(10, g)));\n    logTotal += val * dg;\n    if (g >= 0 && g <= log2) logArea01 += val * dg;\n  }\n\n  // Fill [0, log10(2)] on log\n  ctx.fillStyle = corr ? 'rgba(16, 185, 129, 0.35)' : 'rgba(236, 72, 153, 0.35)';\n  ctx.beginPath();\n  ctx.moveTo(rX0 + ((0 - gMin) / (gMax - gMin)) * rW, baseY);\n  for (var g = 0; g <= log2; g += 0.005) {\n    var val = corr ? pdfLogTrue(g, mu, sig) : (pdfLogTrue(g, mu, sig) / (Math.LN10 * Math.pow(10, g)));\n    var px = rX0 + ((g - gMin) / (gMax - gMin)) * rW;\n    var py = baseY - Math.min(1.15, val / logYMax) * plotH;\n    ctx.lineTo(px, py);\n  }\n  ctx.lineTo(rX0 + ((log2 - gMin) / (gMax - gMin)) * rW, baseY);\n  ctx.closePath(); ctx.fill();\n\n  // Reference dashed true pdf(g) when un-corrected\n  if (!corr) {\n    ctx.save(); ctx.setLineDash([4, 4]); ctx.strokeStyle = 'rgba(248,250,252,0.45)'; ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var i = 0; i <= 200; i++) {\n      var g = gMin + (i / 200) * (gMax - gMin);\n      var px = rX0 + (i / 200) * rW;\n      var py = baseY - Math.min(1.15, pdfLogTrue(g, mu, sig) / logYMax) * plotH;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke(); ctx.restore();\n  }\n\n  // Active log curve\n  ctx.strokeStyle = corr ? '#10b981' : '#ec4899'; ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i <= 200; i++) {\n    var g = gMin + (i / 200) * (gMax - gMin);\n    var val = corr ? pdfLogTrue(g, mu, sig) : (pdfLogTrue(g, mu, sig) / (Math.LN10 * Math.pow(10, g)));\n    var px = rX0 + (i / 200) * rW;\n    var py = baseY - Math.min(1.15, val / logYMax) * plotH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Axes & Labels\n  ctx.strokeStyle = '#64748b'; ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(lX0, baseY); ctx.lineTo(lX0 + lW, baseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rX0, baseY); ctx.lineTo(rX0 + rW, baseY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('线性数轴 x (对数正态分布)', lX0, 22);\n  ctx.fillText(corr ? '对数数轴 g = log10(x) [已乘 c(g)]' : '对数数轴 g [未修正: 面积失真!]', rX0, 22);\n\n  ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n  [0, 1, 2, 3].forEach(function(v) {\n    var tx = lX0 + (v / xMax) * lW;\n    ctx.fillText(String(v), tx - 3, baseY + 15);\n  });\n  [-2, -1, 0, 1].forEach(function(v) {\n    var tx = rX0 + ((v - gMin) / (gMax - gMin)) * rW;\n    ctx.fillText(String(v), tx - 5, baseY + 15);\n  });\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('阴影 [1,2]', lX0 + 125, baseY + 30);\n  ctx.fillStyle = corr ? '#10b981' : '#ec4899';\n  ctx.fillText('阴影 [0, 0.301]', rX0 + 185, baseY + 30);\n\n  lab.setReadout('线性区间[1,2]真实概率 = ' + linArea12.toFixed(3) + '  |  对数区间[0,0.301]积分 = ' + logArea01.toFixed(3) + '  |  对数曲线总面积 = ' + logTotal.toFixed(3) + (corr ? ' (完美守恒)' : ' (面积严重失真!)'));\n}\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "2. 采样函数 sf(g)：在对数轴上“筛出”首位为 1 的数字",
      "paragraphs": [
        "虽然我们需要把 `pdf(g)` 放在对数轴上分析，但判断“是否符合本福特定律”看的依然是**线性数轴**上的首位数字（例如 `1.2034`、`0.156`、`18.9` 的首位都是 `1`）。",
        "在线性数轴上，哪些区间会产生以 `1` 开头的数字？答案是：`0.1 ~ 0.1999...`、`1 ~ 1.999...`、`10 ~ 19.999...` 等等。它们在线性轴上宽度以 10 倍指数暴涨，画出来极其复杂。",
        "但一旦转换到以 10 为底的对数轴 `g` 上，奇迹发生了：上述区间分别对应 `[-1.000, -0.699]`、`[0.000, 0.301]`、`[1.000, 1.301]`！它们竟然变成了一串**周期严格为 1、脉冲宽度恒为 `log10(2) ≈ 0.301`** 的规则矩形脉冲序列！",
        "我们把这个脉冲序列定义为**采样函数 (sampling function)**，记作 `sf(g)`：在首位为 `1` 的区间取值为 `1`，其余区间取值为 `0`。于是，想知道一个分布产生首位为 `1` 的概率，只需将 `pdf(g)` 与 `sf(g)` 相乘（孤立出首位为 1 的部分），再从负无穷到正无穷求积分面积即可。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "3. 乘法变平移：导出本福特定律的卷积表达式",
      "paragraphs": [
        "即便算出当前首位为 `1` 的概率恰好是 `0.301`，也不足以证明它服从本福特定律——我们还必须执行完整的**1的缩放检验**：把生成的所有数字不断乘以一个略大于 1 的常数（如 `1.01`），观察首位为 `1` 的比例是否始终稳定在 `0.301`。",
        "这里我们发现了使用对数数轴的**第二个巨大优势**：线性域的乘法在对数域变成了加法（`log(n × 1.01) = log(n) + log(1.01)`）。给每个样本乘以一个缩放因子，等价于把整条 `pdf(g)` 曲线向右平移一小段距离 `s`，写成 `pdf(g - s)`！",
        "平移后的曲线 `pdf(g - s)` 再次与采样函数 `sf(g)` 相乘并积分，就得到了连续版本的“1的缩放检验”函数 `ost(s)`。请仔细咀嚼这三个动作：**平移 (shift)、相乘 (multiply)、积分 (integrate)**——这不正是线性系统理论中大名鼎鼎的**卷积 (Convolution)** 吗？",
        "对比标准卷积定义时有两个小细节需要注意：第一，标准卷积要求把其中一个信号先左右翻转再平移，而这里我们只是单纯向右平移 `pdf(g)`，因此在简写卷积公式 Eq. 34-3 中会人为写作 `pdf(-g)` 来抵消卷积自带的翻转；第二，为了符号统一，Eq. 34-3 把平移变量 `s` 改写为 `g`，让三个信号 `pdf(g)`、`sf(g)`、`ost(g)` 站在同一条对数数轴上。"
      ],
      "formula": {
        "expr": "ost(s) = ∫_{-∞}^{+∞} sf(g) · pdf(g - s) dg   ⇒   ost(g) = sf(g) * pdf(-g)",
        "explain": "sf(g) 是周期为 1、脉宽 0.301 的采样脉冲串；s 是对数平移量（对应线性域乘以 10^s）；ost(s) 是不同缩放因子下首位数字为 1 的概率。星号 * 代表卷积运算；pdf(-g) 中的负号仅是推导时抵消卷积翻转的数学记号。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验二：本福特定律卷积模拟器与声化监听",
      "instruction": "拖动平移量 s 观察蓝色 pdf(g-s) 如何滑过琥珀色脉冲串 sf(g)；调宽分布 σ_g，观察右下角粉色曲线 ost(s) 如何从剧烈波动趋平为 0.301 直线（可开启自动扫描与声音监听波动）。",
      "controls": [
        {
          "type": "slider",
          "id": "shiftS",
          "label": "对数平移 s (等效缩放 10^s)",
          "min": -1.5,
          "max": 1.5,
          "step": 0.02,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "stdG",
          "label": "PDF 宽度 σ_g (对数标准差)",
          "min": 0.1,
          "max": 0.9,
          "step": 0.02,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "autoScan",
          "label": "自动平移扫描 s",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听 ost(s) 波动音高",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioCtx = null, osc = null, gain = null, scanS = 0, lastAudioState = false;\nvar log2 = Math.log10(2), mu = -0.25;\n\nfunction sf(g) {\n  var m = ((g % 1) + 1) % 1;\n  return m < log2 ? 1 : 0;\n}\nfunction pdf(u, sig) {\n  var z = (u - mu) / sig;\n  return (1 / (sig * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * z * z);\n}\nfunction calcOST(s, sig) {\n  var sum = 0, dg = 0.02;\n  for (var g = -4.0; g <= 4.0; g += dg) {\n    if (sf(g)) sum += pdf(g - s, sig) * dg;\n  }\n  return sum;\n}\n\nfunction syncAudio(ostVal) {\n  var wantPlay = !!lab.values.play;\n  if (wantPlay && !osc) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx) {\n      if (audioCtx.state === 'suspended') audioCtx.resume();\n      osc = audioCtx.createOscillator();\n      gain = audioCtx.createGain();\n      osc.type = 'triangle';\n      gain.gain.value = 0.06;\n      osc.connect(gain);\n      gain.connect(audioCtx.destination);\n      osc.start();\n    }\n  } else if (!wantPlay && osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null; gain = null;\n  }\n  if (osc && audioCtx) {\n    var freq = 220 + ostVal * 500;\n    osc.frequency.setTargetAtTime(freq, audioCtx.currentTime, 0.02);\n  }\n}\n\nfunction drawFrame(activeS) {\n  var sig = lab.values.stdG;\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  // Left side: g in [-2, 2], Top: pdf(g-s) + sf(g), Bottom: product\n  var lX0 = 30, lW = 355, gMin = -2, gMax = 2;\n  var topBaseY = 102, topH = 74, botBaseY = 205, botH = 74;\n  var yScale = Math.max(1.0, 0.42 / sig);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(lX0, topBaseY); ctx.lineTo(lX0 + lW, topBaseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(lX0, botBaseY); ctx.lineTo(lX0 + lW, botBaseY); ctx.stroke();\n\n  // Draw sf(g) pulses on top\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.22)';\n  ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;\n  for (var k = -2; k <= 1; k++) {\n    var x1 = lX0 + ((k - gMin) / (gMax - gMin)) * lW;\n    var x2 = lX0 + ((k + log2 - gMin) / (gMax - gMin)) * lW;\n    var ph = topH * 0.72;\n    ctx.fillRect(x1, topBaseY - ph, x2 - x1, ph);\n    ctx.strokeRect(x1, topBaseY - ph, x2 - x1, ph);\n  }\n\n  // Fill product pdf(g-s)*sf(g) on both top and bottom\n  var steps = 240;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.5)';\n  for (var i = 0; i < steps; i++) {\n    var g = gMin + (i / steps) * (gMax - gMin);\n    if (sf(g)) {\n      var val = pdf(g - activeS, sig);\n      var hPx = Math.min(topH * 1.1, (val / yScale) * topH);\n      var px = lX0 + (i / steps) * lW;\n      var bw = lW / steps + 0.6;\n      ctx.fillRect(px, topBaseY - hPx, bw, hPx);\n      ctx.fillRect(px, botBaseY - hPx, bw, hPx);\n    }\n  }\n\n  // Stroke pdf(g-s) on top\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= steps; i++) {\n    var g = gMin + (i / steps) * (gMax - gMin);\n    var val = pdf(g - activeS, sig);\n    var px = lX0 + (i / steps) * lW;\n    var py = topBaseY - Math.min(topH * 1.1, (val / yScale) * topH);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Right side: ost(s) for s in [-1.5, 1.5]\n  var rX0 = 420, rW = 275, rBaseY = 205, rH = 155, sMin = -1.5, sMax = 1.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var j = 0; j <= 4; j++) {\n    var gy = rBaseY - (j / 4) * rH;\n    ctx.beginPath(); ctx.moveTo(rX0, gy); ctx.lineTo(rX0 + rW, gy); ctx.stroke();\n  }\n\n  // 0.301 Benford reference line (y max = 0.8)\n  var ostYMax = 0.8;\n  var refY = rBaseY - (0.301 / ostYMax) * rH;\n  ctx.save(); ctx.setLineDash([5, 4]); ctx.strokeStyle = 'rgba(248,250,252,0.55)'; ctx.lineWidth = 1.4;\n  ctx.beginPath(); ctx.moveTo(rX0, refY); ctx.lineTo(rX0 + rW, refY); ctx.stroke(); ctx.restore();\n\n  // Draw ost(s) curve\n  ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i <= 100; i++) {\n    var s = sMin + (i / 100) * (sMax - sMin);\n    var v = calcOST(s, sig);\n    var px = rX0 + (i / 100) * rW;\n    var py = rBaseY - Math.min(1.05, v / ostYMax) * rH;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Current s marker\n  var curOst = calcOST(activeS, sig);\n  var curPx = rX0 + ((activeS - sMin) / (sMax - sMin)) * rW;\n  var curPy = rBaseY - Math.min(1.05, curOst / ostYMax) * rH;\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(curPx, curPy, 5.5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n  // Labels\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('① 平移 pdf(g-s) 与采样脉冲 sf(g)', lX0, 16);\n  ctx.fillText('② 乘积阴影 pdf(g-s)·sf(g) 的积分面积', lX0, 122);\n  ctx.fillText('③ 卷积输出 ost(s) vs 0.301 基准线', rX0, 16);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace';\n  [-2, -1, 0, 1, 2].forEach(function(g) {\n    ctx.fillText(String(g), lX0 + ((g - gMin) / (gMax - gMin)) * lW - 4, botBaseY + 14);\n  });\n  [-1, 0, 1].forEach(function(s) {\n    ctx.fillText(String(s), rX0 + ((s - sMin) / (sMax - sMin)) * rW - 4, rBaseY + 14);\n  });\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('0.301', rX0 + 4, refY - 4);\n\n  syncAudio(curOst);\n  var benfordOk = Math.abs(curOst - 0.301) < 0.015 && sig >= 0.65;\n  lab.setReadout('当前平移 s = ' + activeS.toFixed(2) + ' (线性缩放 ×' + Math.pow(10, activeS).toFixed(2) + ')  |  首位为1概率 ost(s) = ' + curOst.toFixed(3) + '  |  分布越宽，曲线越趋近 0.301 恒定值');\n}\n\nlab.onUpdate(function() {\n  if (!lab.values.autoScan) scanS = lab.values.shiftS;\n  drawFrame(lab.values.autoScan ? scanS : lab.values.shiftS);\n});\nlab.onLoop(function(dt) {\n  if (lab.values.autoScan) {\n    scanS += dt * 0.7;\n    if (scanS > 1.5) scanS = -1.5;\n    drawFrame(scanS);\n  } else if (lab.values.play !== lastAudioState) {\n    lastAudioState = lab.values.play;\n    drawFrame(lab.values.shiftS);\n  }\n});\nscanS = lab.values.shiftS;\ndrawFrame(scanS);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "对数域 PDF 映射大坑：绝不能把线性概率密度函数直接点对点搬到对数轴！必须乘以面积修正因子 `c(g) = ln(10)·10^g`；若用直方图估算，则应直接把对数轴切成等宽的箱子（bins）再统计样本。",
        "为什么对数坐标是天选舞台：线性轴上令人绝望的“指数扩张区间”和“乘法缩放”，在对数轴上同时退化成了极简的“周期 1 矩形脉冲串 `sf(g)`”与“函数平移 `pdf(g - s)`”。",
        "核心结论：本福特定律的“1的缩放检验”本质上就是一个线性系统——采样函数 `sf(g)` 与对数概率密度函数 `pdf(-g)` 的卷积；如果卷积结果 `ost(s)` 是一条高度恒为 `0.301` 的水平直线，该分布就严格服从本福特定律。"
      ]
    }
  ]
});
