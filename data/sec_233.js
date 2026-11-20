window.__BOOK_REGISTER_SECTION__("sec_233", {
  "title": "递归滤波器的增益调整与归一化 (Gain Changes)",
  "intuition": "想改变递归滤波器的整体输出幅度，只需把前向系数 a 等比例缩放而绝对不要碰反馈系数 b；要测出当前增益，低通滤波器看 f=0 的全 1 直流响应，高通滤波器看 f=0.5 的正负交替高频响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "只动 a、不动 b：无痛改变递归滤波器增益",
      "paragraphs": [
        "设计好一个递归（IIR）滤波器后，我们经常发现它在通带内的放大倍数并不是 **1**（即不满足**单位增益 unity gain**），导致信号输出偏小或直接溢出失真。此时我们需要修改递归系数来调整输出幅度。",
        "修改方法极其简单：**把所有的前向系数 `a`（`a0, a1, a2...`）同时乘以目标缩放因子，而把所有的反馈系数 `b`（`b1, b2...`）原封不动**。",
        "为什么可以这样？观察递归差分方程可以发现，`a` 系数直接作用在输入信号 `x[n]` 上，整体充当输入端的线性比例尺；而 `b` 系数构成了反馈回路，决定了系统的极点位置、截止频率与稳定性。只缩放 `a` 就相当于把输入信号先放大或缩小再送入同一个滤波器，因此能**完美保留频响曲线的形状**，仅仅把整体幅值等比例拉高或压低。"
      ],
      "formula": {
        "expr": "y[n] = a0*x[n] + a1*x[n-1] + a2*x[n-2] + ... + b1*y[n-1] + b2*y[n-2] + ...",
        "explain": "x[n] 为当前输入样本，y[n] 为当前输出样本；a_k 为前向（非递归）系数，只管缩放输入；b_k 为反馈（递归）系数，决定极点与频率选择特性。"
      }
    },
    {
      "type": "concept",
      "heading": "低通滤波器的测量基准：直流增益（f = 0）",
      "paragraphs": [
        "在动手归一化之前，必须先算出滤波器**当前的通带增益 `G`**，然后再把所有 `a` 系数除以 `G`。由于增益必须在通带内测量，**低通滤波器**最标准的测量点就是频率为 **0（直流 DC）** 处。",
        "这里不需要搬出复杂的 z 变换复数代数，只要用“强迫激励法”就能一步推导出公式：假设我们强制让输入信号的所有样本都等于 **1**（即 `x[n] = 1` 的直流信号），系统达到稳态后，输出的每一个样本也必定稳定在同一个常数 **`G`**（即 `y[n] = G`）。",
        "把 `x = 1` 和 `y = G` 直接代回递归方程，整理合并同类项后就能瞬间解出直流增益 `G`（原书式 33-7）。算出来之后，将所有 `a` 系数除以 `G`，滤波器在 `f = 0` 处的增益就严格变成了 1。"
      ],
      "formula": {
        "expr": "G = (a0 + a1 + a2 + a3 + ...) / (1 - (b1 + b2 + b3 + ...))",
        "explain": "分子是所有前向系数 a 之和；分母是 1 减去所有反馈系数 b 之和。当 b 之和越接近 1 时，反馈累积越强，直流增益 G 会急剧飙升。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：低通 DC 增益探测与归一化（支持实时听感对比）",
      "instruction": "拖动 b1 感受反馈系数如何急剧抬高直流增益 G，再切换“开启归一化”观察所有 a 除以 G 后通带如何锁死在 1.0（可开启测试音对比响度变化）。",
      "controls": [
        {
          "type": "slider",
          "id": "a0",
          "label": "前向系数 a0 (a1=0.5*a0)",
          "min": 0.05,
          "max": 0.5,
          "step": 0.01,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "b1",
          "label": "反馈系数 b1",
          "min": 0,
          "max": 0.85,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "normalize",
          "label": "开启 DC 归一化 (a ÷ G_DC，b 不变)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放低频测试音对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var osc = null, gainNode = null, masterGain = null;\nfunction syncAudio(g) {\n  var playing = !!lab.values.play;\n  if (playing) {\n    var ctx = lab.getAudioContext();\n    if (ctx.state === 'suspended') ctx.resume();\n    if (!osc) {\n      osc = ctx.createOscillator();\n      gainNode = ctx.createGain();\n      masterGain = ctx.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = 220;\n      masterGain.gain.value = 0.16;\n      osc.connect(gainNode);\n      gainNode.connect(masterGain);\n      masterGain.connect(ctx.destination);\n      osc.start();\n    }\n    var safeG = Math.min(Math.max(Math.abs(g), 0.02), 4.0);\n    gainNode.gain.setTargetAtTime(safeG * 0.25, ctx.currentTime, 0.03);\n  } else if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null; gainNode = null; masterGain = null;\n  }\n}\n\nfunction draw() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var a0Raw = lab.values.a0;\n  var a1Raw = 0.5 * a0Raw;\n  var b1 = lab.values.b1;\n  var norm = !!lab.values.normalize;\n\n  var gRaw = (a0Raw + a1Raw) / (1 - b1);\n  var a0 = norm ? a0Raw / gRaw : a0Raw;\n  var a1 = norm ? a1Raw / gRaw : a1Raw;\n  var gCurr = (a0 + a1) / (1 - b1);\n\n  syncAudio(gCurr);\n\n  var padT = 28, padB = 30;\n  var plotH = H - padT - padB;\n  var maxVal = Math.max(1.8, gRaw * 1.15);\n\n  function yLeft(v) {\n    return padT + plotH - (v / maxVal) * plotH;\n  }\n\n  var lx0 = 36, lx1 = 345, lw = lx1 - lx0;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = padT + (plotH * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx0, yy); ctx.lineTo(lx1, yy); ctx.stroke();\n  }\n\n  var yOne = yLeft(1.0);\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(lx0, yOne); ctx.lineTo(lx1, yOne); ctx.stroke();\n  ctx.restore();\n\n  var N = 32;\n  var yArr = [];\n  var yPrev = 0, xPrev = 0;\n  for (var n = 0; n < N; n++) {\n    var x = 1.0;\n    var y = a0 * x + a1 * xPrev + b1 * yPrev;\n    yArr.push(y);\n    xPrev = x;\n    yPrev = y;\n  }\n\n  ctx.strokeStyle = norm ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = lx0 + (n / (N - 1)) * lw;\n    var py = yLeft(yArr[n]);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var px = lx0 + (n / (N - 1)) * lw;\n    var py = yLeft(yArr[n]);\n    ctx.fillStyle = norm ? '#10b981' : '#f59e0b';\n    ctx.beginPath(); ctx.arc(px, py, 2.6, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域全 1 直流激励 (x[n] = 1)', lx0, 18);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('x[n]=1.0', lx0 + 4, yOne - 5);\n  ctx.fillStyle = norm ? '#10b981' : '#f59e0b';\n  ctx.fillText('y[n] -> G=' + gCurr.toFixed(2), lx1 - 104, Math.max(padT + 12, yLeft(gCurr) - 7));\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('n=0', lx0, H - 10);\n  ctx.fillText('n=31 (稳态)', lx1 - 65, H - 10);\n\n  var rx0 = 395, rx1 = 700, rw = rx1 - rx0;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = padT + (plotH * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx1, yy); ctx.stroke();\n  }\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(rx0, yOne); ctx.lineTo(rx1, yOne); ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = norm ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  var steps = 120;\n  for (var s = 0; s <= steps; s++) {\n    var f = (s / steps) * 0.5;\n    var w = 2 * Math.PI * f;\n    var numRe = a0 + a1 * Math.cos(w);\n    var numIm = -a1 * Math.sin(w);\n    var denRe = 1 - b1 * Math.cos(w);\n    var denIm = b1 * Math.sin(w);\n    var mag = Math.sqrt(numRe * numRe + numIm * numIm) / Math.sqrt(denRe * denRe + denIm * denIm);\n    var px = rx0 + (s / steps) * rw;\n    var py = yLeft(mag);\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var dcY = yLeft(gCurr);\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(rx0, dcY, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = norm ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('幅频响应 |H(f)| (重点看 f=0 处)', rx0, 18);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('f=0 (DC)', rx0 - 6, H - 10);\n  ctx.fillText('f=0.25', rx0 + rw * 0.5 - 20, H - 10);\n  ctx.fillText('f=0.5', rx1 - 32, H - 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('G(0)=' + gCurr.toFixed(2), rx0 + 10, Math.max(padT + 14, dcY + 4));\n\n  lab.setReadout(\n    '原 G_DC=' + gRaw.toFixed(3) +\n    ' | 当前 a0=' + a0.toFixed(3) + ', a1=' + a1.toFixed(3) +\n    ' | b1(未变)=' + b1.toFixed(2) +\n    ' | 实测 f=0 增益=' + gCurr.toFixed(3) + (norm ? ' [已单位化]' : '')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "高通滤波器的测量基准：最高频 f = 0.5 与 (-1)^k 技巧",
      "paragraphs": [
        "高通滤波器把直流（`f = 0`）彻底阻断，如果在 `f = 0` 测增益结果只能是 0。因此高通滤波器必须把测量点搬到通带最高处——允许的最大离散频率 **`f = 0.5`**（奈奎斯特频率）。",
        "同样套用“强迫激励法”：在 `f = 0.5` 时，每两个采样点构成一个完整周期，输入信号恰好在 `1` 和 `-1` 之间不停交替，即 `1, -1, 1, -1, 1, -1...`。对应的稳态输出信号也以增益 `G` 为振幅正负交替：`G, -G, G, -G, G, -G...`。",
        "把这个交替序列代回递归方程，偶数延迟项（如 `x[n], x[n-2]` 和 `y[n-2]`）与当前同号，奇数延迟项（如 `x[n-1]` 和 `y[n-1]`）则全部反号！整理求解 `G` 就得到了原书式 33-8。用程序实现时，只需按系数下标 `k = 0, 1, 2, 3...` 乘以 **`(-1)^k`**，就能自动生成 `1, -1, 1, -1...` 的交替符号。"
      ],
      "formula": {
        "expr": "G = (a0 - a1 + a2 - a3 + a4 - ...) / (1 - (-b1 + b2 - b3 + b4 - ...))",
        "explain": "注意分母中的双层负号！外层是递归方程移项带来的 1 - (...)，内层是 y[n-1]、y[n-3] 等奇数项反号带来的 -b1, -b3。展开后分母实际等于 1 + b1 - b2 + b3 - b4..."
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：高频 f = 0.5 交替序列激励与 Eq. 33-8 归一化",
      "instruction": "观察 f=0.5 处输入 x[n]=(-1)^n 如何激发出正负交替的稳态输出 ±G；开启归一化后，所有 a 系数除以 G_0.5，高频响应顶点精准对齐 1.0。",
      "controls": [
        {
          "type": "slider",
          "id": "b1",
          "label": "反馈系数 b1 (固定 b2=-0.15)",
          "min": -0.8,
          "max": 0.2,
          "step": 0.05,
          "value": -0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "aScale",
          "label": "a 系数缩放倍数 k",
          "min": 0.3,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "normalize",
          "label": "按 f=0.5 增益归一化 (a ÷ G_0.5)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showSign",
          "label": "显示 (-1)^k 交替符号公式拆解",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var kScale = lab.values.aScale;\n  var a0Raw = 0.25 * kScale;\n  var a1Raw = -0.50 * kScale;\n  var a2Raw = 0.25 * kScale;\n  var b1 = lab.values.b1;\n  var b2 = -0.15;\n  var norm = !!lab.values.normalize;\n  var showSign = !!lab.values.showSign;\n\n  var numRaw = a0Raw - a1Raw + a2Raw;\n  var den = 1 - (-b1 + b2);\n  var gRaw = numRaw / den;\n\n  var a0 = norm ? a0Raw / gRaw : a0Raw;\n  var a1 = norm ? a1Raw / gRaw : a1Raw;\n  var a2 = norm ? a2Raw / gRaw : a2Raw;\n  var gCurr = (a0 - a1 + a2) / den;\n\n  var padT = 30, padB = 30;\n  var plotH = H - padT - padB;\n  var maxAmp = Math.max(1.8, Math.abs(gRaw) * 1.18);\n\n  function yLeft(v) {\n    return padT + plotH * 0.5 - (v / maxAmp) * (plotH * 0.48);\n  }\n\n  var lx0 = 36, lx1 = 350, lw = lx1 - lx0;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = padT + (plotH * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx0, yy); ctx.lineTo(lx1, yy); ctx.stroke();\n  }\n\n  var yZero = yLeft(0);\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.beginPath(); ctx.moveTo(lx0, yZero); ctx.lineTo(lx1, yZero); ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.5)';\n  ctx.beginPath(); ctx.moveTo(lx0, yLeft(1)); ctx.lineTo(lx1, yLeft(1)); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(lx0, yLeft(-1)); ctx.lineTo(lx1, yLeft(-1)); ctx.stroke();\n  ctx.restore();\n\n  var N = 22;\n  var xArr = [], yArr = [];\n  for (var n = 0; n < N; n++) {\n    var x = (n % 2 === 0) ? 1 : -1;\n    var x1 = (n >= 1) ? xArr[n - 1] : 0;\n    var x2 = (n >= 2) ? xArr[n - 2] : 0;\n    var y1 = (n >= 1) ? yArr[n - 1] : 0;\n    var y2 = (n >= 2) ? yArr[n - 2] : 0;\n    var y = a0 * x + a1 * x1 + a2 * x2 + b1 * y1 + b2 * y2;\n    xArr.push(x);\n    yArr.push(y);\n  }\n\n  for (var n = 0; n < N; n++) {\n    var px = lx0 + 8 + (n / (N - 1)) * (lw - 16);\n    var py = yLeft(yArr[n]);\n    ctx.strokeStyle = norm ? '#10b981' : '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, yZero); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = norm ? '#10b981' : '#f59e0b';\n    ctx.beginPath(); ctx.arc(px, py, 3.2, 0, Math.PI * 2); ctx.fill();\n\n    var pxIn = yLeft(xArr[n]);\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath(); ctx.arc(px, pxIn, 2.2, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('f=0.5 正负交替激励 (x[n] = (-1)^n)', lx0, 18);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('x: ±1', lx0 + 2, yLeft(1) - 5);\n  ctx.fillStyle = norm ? '#10b981' : '#f59e0b';\n  ctx.fillText('y -> ±' + Math.abs(gCurr).toFixed(2), lx1 - 92, yLeft(gCurr) - 7);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1, -1, 1, -1...', lx0, H - 10);\n\n  var rx0 = 400, rx1 = 700, rw = rx1 - rx0;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = padT + (plotH * i) / 4;\n    ctx.beginPath(); ctx.moveTo(rx0, yy); ctx.lineTo(rx1, yy); ctx.stroke();\n  }\n\n  function yRight(mag) {\n    return padT + plotH - (mag / maxAmp) * plotH;\n  }\n\n  var yOneR = yRight(1.0);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(rx0, yOneR); ctx.lineTo(rx1, yOneR); ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = norm ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  var steps = 120;\n  for (var s = 0; s <= steps; s++) {\n    var f = (s / steps) * 0.5;\n    var w = 2 * Math.PI * f;\n    var numRe = a0 + a1 * Math.cos(w) + a2 * Math.cos(2 * w);\n    var numIm = -a1 * Math.sin(w) - a2 * Math.sin(2 * w);\n    var denRe = 1 - b1 * Math.cos(w) - b2 * Math.cos(2 * w);\n    var denIm = b1 * Math.sin(w) + b2 * Math.sin(2 * w);\n    var mag = Math.sqrt(numRe * numRe + numIm * numIm) / Math.sqrt(denRe * denRe + denIm * denIm);\n    var px = rx0 + (s / steps) * rw;\n    var py = yRight(mag);\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var nyqY = yRight(Math.abs(gCurr));\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(rx1, nyqY, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = norm ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('高通幅频响应 |H(f)| (重点看 f=0.5)', rx0, 18);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('f=0', rx0, H - 10);\n  ctx.fillText('f=0.25', rx0 + rw * 0.5 - 20, H - 10);\n  ctx.fillText('f=0.5', rx1 - 32, H - 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('G(0.5)=' + gCurr.toFixed(2), rx1 - 92, Math.max(padT + 14, nyqY - 8));\n\n  if (showSign) {\n    ctx.fillStyle = 'rgba(15,23,42,0.82)';\n    ctx.fillRect(rx0 + 6, padT + 6, 206, 42);\n    ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(rx0 + 6, padT + 6, 206, 42);\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px monospace';\n    ctx.fillText('分子: (+a0)+(-a1)+(+a2)=' + (a0 - a1 + a2).toFixed(2), rx0 + 12, padT + 22);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('分母: 1-(-b1 + b2)=' + den.toFixed(2), rx0 + 12, padT + 39);\n  }\n\n  lab.setReadout(\n    '原 G_0.5=' + gRaw.toFixed(3) +\n    ' | 当前 a0=' + a0.toFixed(2) + ', a1=' + a1.toFixed(2) + ', a2=' + a2.toFixed(2) +\n    ' | b1=' + b1.toFixed(2) + ', b2=-0.15' +\n    ' | 实测 f=0.5 增益=' + gCurr.toFixed(3)\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "改增益只缩放 `a`，绝不要碰 `b`：把所有 `a` 系数除以测得的通带增益 `G`（或乘以目标增益），而保持 `b` 系数不变，就能无失真地校准滤波器幅度。",
        "测量频率必须选在通带内：低通滤波器用 `f = 0`（全 1 直流输入，公式 33-7）；高通滤波器用 `f = 0.5`（`1, -1, 1, -1...` 交替输入，公式 33-8）。",
        "警惕公式 33-8 里的双层负号陷阱：分母 `1 - (-b1 + b2 - b3 + ...)` 实际展开是 `1 + b1 - b2 + b3 - ...`，写程序时最容易把 `b1` 的正负号写反导致分母算错。",
        "代码生成交替符号技巧：在循环遍历下标 `k = 0, 1, 2...` 时，给第 `k` 个系数乘以 `(-1)^k`（或每步让符号变量 `sign = -sign` 翻转），即可优雅完成公式 33-8 的求值。"
      ]
    }
  ]
});
