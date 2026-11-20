window.__BOOK_REGISTER_SECTION__("sec_222", {
  "title": "傅里叶变换大家族 (The Family of Fourier Transforms)",
  "intuition": "傅里叶变换之所以演化出看似繁杂的 8 套公式，仅仅是因为信号在时域上有「连续 vs 离散」与「周期 vs 非周期」四种组合，再加上「实数 vs 复数」两种数学视角，它们背后遵循着完全对称的统一规律。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 四种傅里叶变换与「离散 ↔ 周期」铁律",
      "paragraphs": [
        "在数字信号处理中，一个时域信号只有两种存在形式：**连续 (continuous)** 或 **离散 (discrete)**；同时，它的波形结构也只有两种可能：**周期 (periodic)** 或 **非周期 (aperiodic)**。将这两个维度两两组合，就诞生了傅里叶变换家族的四大成员：**离散傅里叶变换 (DFT)**（离散、周期）、**离散时间傅里叶变换 (DTFT)**（离散、非周期）、**傅里叶级数 (Fourier Series)**（连续、周期），以及**傅里叶变换 (Fourier Transform)**（连续、非周期）。顺带一提，这些名字的命名纯属历史习惯，并没有严谨的逻辑可言，直接记住对应关系即可。",
        "这四大变换之间存在一条贯穿始终的**对偶铁律**：**如果信号在某一个域（时域或频域）是离散的，那么它在另一个域必然是周期的；反之，如果信号在某一个域是连续的，那么它在另一个域必然是非周期的。**",
        "在符号记法上，连续信号一律用圆括号 `( )` 表示（如时域 `x(t)`、频域 `X(ω)`），而离散信号一律用方括号 `[ ]` 表示（如时域 `x[n]`、频域 `X[k]`）。至于信号是周期还是非周期，数学符号本身并不作区分，但我们通常用 `T` 表示连续信号的周期，用 `N` 表示离散信号的周期。"
      ],
      "formula": {
        "expr": "连续 (x(t), X(ω)) ↔ 非周期   |   离散 (x[n], X[k]) ↔ 周期 (T, N)",
        "explain": "圆括号表示连续变量，方括号表示离散样本；时域或频域任意一侧一旦离散化（采样），另一侧就会被迫发生周期延拓。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：亲眼见证「时域离散化」如何逼出「频域周期化」（含混叠听觉对比）",
      "instruction": "开启/关闭「离散时间采样」对比左右频谱差异，并拖动信号频率与采样率滑块，打开声音聆听当频率超过采样率一半（Nyquist 边界）时发生的频谱周期混叠。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号频率 f",
          "min": 100,
          "max": 900,
          "step": 50,
          "value": 250,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "fs",
          "label": "采样率 fs",
          "min": 400,
          "max": 2000,
          "step": 100,
          "value": 1000,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "discrete",
          "label": "离散时间采样 (使频域周期化)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ac = null;\nvar osc = null;\nvar gainNode = null;\n\nfunction updateAudio() {\n  var playing = lab.values.play;\n  var f = lab.values.freq;\n  var fs = lab.values.fs;\n  var isDisc = lab.values.discrete;\n  if (playing) {\n    if (!ac) {\n      ac = lab.getAudioContext();\n    }\n    if (ac.state === 'suspended') {\n      ac.resume();\n    }\n    if (!osc) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      gainNode.gain.value = 0;\n      osc.type = 'sine';\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.start();\n    }\n    var audibleF = f;\n    if (isDisc) {\n      audibleF = Math.abs(f - Math.round(f / fs) * fs);\n    }\n    if (audibleF < 30) {\n      gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    } else {\n      osc.frequency.setTargetAtTime(audibleF, ac.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(0.12, ac.currentTime, 0.02);\n    }\n  } else if (gainNode && ac) {\n    gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var f = lab.values.freq;\n  var fs = lab.values.fs;\n  var isDisc = lab.values.discrete;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 20; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var tx0 = 24, tx1 = 336, tyMid = 130, tAmp = 65;\n  var fx0 = 376, fx1 = 696, fyBase = 195, fAmp = 125;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(tx0, tyMid); ctx.lineTo(tx1, tyMid); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(fx0, fyBase); ctx.lineTo(fx1, fyBase); ctx.stroke();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = isDisc ? '#10b981' : '#38bdf8';\n  ctx.fillText(isDisc ? '时域信号 x[n] (离散样本)' : '时域信号 x(t) (连续波形)', tx0, 24);\n\n  var tWindow = 0.010;\n  ctx.strokeStyle = isDisc ? 'rgba(56,189,248,0.3)' : '#38bdf8';\n  ctx.lineWidth = isDisc ? 1.5 : 2.5;\n  ctx.beginPath();\n  for (var px = 0; px <= tx1 - tx0; px += 2) {\n    var t = (px / (tx1 - tx0)) * tWindow;\n    var val = Math.cos(2 * Math.PI * f * t);\n    var py = tyMid - val * tAmp;\n    if (px === 0) ctx.moveTo(tx0 + px, py); else ctx.lineTo(tx0 + px, py);\n  }\n  ctx.stroke();\n\n  var aliasF = Math.abs(f - Math.round(f / fs) * fs);\n  var isAliased = isDisc && (f > fs / 2);\n\n  if (isDisc) {\n    if (isAliased) {\n      ctx.strokeStyle = 'rgba(236,72,153,0.6)';\n      ctx.setLineDash([4, 4]);\n      ctx.lineWidth = 1.5;\n      ctx.beginPath();\n      for (var apx = 0; apx <= tx1 - tx0; apx += 2) {\n        var at = (apx / (tx1 - tx0)) * tWindow;\n        var aval = Math.cos(2 * Math.PI * aliasF * at);\n        var apy = tyMid - aval * tAmp;\n        if (apx === 0) ctx.moveTo(tx0 + apx, apy); else ctx.lineTo(tx0 + apx, apy);\n      }\n      ctx.stroke();\n      ctx.setLineDash([]);\n    }\n    var dt = 1 / fs;\n    for (var n = 0; n * dt <= tWindow + 1e-9; n++) {\n      var tn = n * dt;\n      var sx = tx0 + (tn / tWindow) * (tx1 - tx0);\n      var sy = tyMid - Math.cos(2 * Math.PI * f * tn) * tAmp;\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(sx, tyMid); ctx.lineTo(sx, sy); ctx.stroke();\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath(); ctx.arc(sx, sy, 3.5, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  var fMax = 1600;\n  var fCenter = (fx0 + fx1) / 2;\n  var fScale = (fx1 - fx0) / (2 * fMax);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath(); ctx.moveTo(fCenter, 42); ctx.lineTo(fCenter, fyBase + 6); ctx.stroke();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = isDisc ? '#f59e0b' : '#38bdf8';\n  ctx.fillText(isDisc ? '频域 |X(ω)| (周期延拓，主周期 -π ~ π)' : '频域 |X(ω)| (非周期，延伸至 ±∞)', fx0, 24);\n\n  if (isDisc) {\n    var halfSpan = (fs / 2) * fScale;\n    ctx.fillStyle = 'rgba(16,185,129,0.08)';\n    ctx.fillRect(fCenter - halfSpan, 40, halfSpan * 2, fyBase - 40);\n    ctx.strokeStyle = 'rgba(16,185,129,0.5)';\n    ctx.setLineDash([3, 3]);\n    ctx.strokeRect(fCenter - halfSpan, 40, halfSpan * 2, fyBase - 40);\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('-π', fCenter - halfSpan - 6, fyBase + 16);\n    ctx.fillText('+π', fCenter + halfSpan - 6, fyBase + 16);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0', fCenter - 3, fyBase + 16);\n\n  function drawImpulse(freqPos, color, label) {\n    if (freqPos < -fMax || freqPos > fMax) return;\n    var ix = fCenter + freqPos * fScale;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(ix, fyBase); ctx.lineTo(ix, fyBase - fAmp); ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.moveTo(ix, fyBase - fAmp - 6);\n    ctx.lineTo(ix - 4, fyBase - fAmp + 2);\n    ctx.lineTo(ix + 4, fyBase - fAmp + 2);\n    ctx.closePath();\n    ctx.fill();\n    if (label) {\n      ctx.font = '10px sans-serif';\n      ctx.fillText(label, ix - 14, fyBase - fAmp - 10);\n    }\n  }\n\n  if (!isDisc) {\n    drawImpulse(-f, '#38bdf8', '-' + f);\n    drawImpulse(f, '#38bdf8', '+' + f);\n  } else {\n    for (var k = -3; k <= 3; k++) {\n      var f1 = k * fs + f;\n      var f2 = k * fs - f;\n      var c1 = (k === 0) ? '#10b981' : (Math.abs(f1) <= fs / 2 ? '#ec4899' : '#f59e0b');\n      var c2 = (k === 0) ? '#10b981' : (Math.abs(f2) <= fs / 2 ? '#ec4899' : '#f59e0b');\n      drawImpulse(f1, c1, k === 0 ? '+' + f : '');\n      drawImpulse(f2, c2, k === 0 ? '-' + f : '');\n    }\n  }\n\n  var status = isDisc\n    ? ('离散时域 x[n] → 周期频域 (每 ' + fs + ' Hz 重复) | 主周期内听到的频率: ' + aliasF + ' Hz' + (isAliased ? ' [发生混叠!]' : ' [无混叠]'))\n    : ('连续时域 x(t) → 非周期频域 X(ω) | 仅有 ±' + f + ' Hz 两根谱线');\n  lab.setReadout(status);\n  updateAudio();\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "2. 实数版本 vs 复数版本：正负频率与符号体系",
      "paragraphs": [
        "上述 4 种傅里叶变换各自都包含**复数版本**与**实数版本**，因此一共形成 8 个正变换与 8 个逆变换方程。在**复数变换**中，时域信号与频域信号均为复数，且频域同时使用**正频率与负频率**：连续非周期频域从 `-∞` 延伸至 `+∞`；连续周期频域通常取 `-π` 到 `π` 作为一个完整周期；离散周期频域则取 `k` 从 `0` 到 `N-1`。复数变换通常用复指数形式书写，但借助欧拉公式随时可以改写成余弦与正弦的形式。",
        "在**实数变换**中，时域信号 `x(t)` 或 `x[n]` 是实数，频域则分解为两个实数信号：**实部 `Re X(ω)`（或 `Re X[k]`）**与**虚部 `Im X(ω)`（或 `Im X[k]`）**。实数变换**只使用正频率**：非周期情况从 `0` 到 `+∞`，周期情况则只取包含正频率的半个周期——连续频域为 `0` 到 `π`，离散频域为 `0` 到 `N/2`。",
        "无论是复数还是实数，所有时域信号理论上都从 `-∞` 延伸到 `+∞`；但如果信号是周期的，由于其余部分完全冗余，我们只需要关心**单个周期**（例如 `0` 到 `T` 或 `0` 到 `N-1`）即可。"
      ],
      "formula": {
        "expr": "e^(jθ) = cos(θ) + j·sin(θ)",
        "explain": "欧拉公式（Euler's relation）是连接「复数指数形式」与「实数余弦/正弦形式」的桥梁；负频率的数学存在使得复指数得以对称抵消虚部，而实数变换则直接扔掉了负频率。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 分析、综合、缩放系数与文献中的常见变体",
      "paragraphs": [
        "每一种变换都由一对**分析方程 (Analysis Equation，即正变换)** 和**综合方程 (Synthesis Equation，即逆变换)** 组成。分析方程通过**相关性 (correlation)** 工作：将时域信号乘以正弦/复指数基函数，然后在适当的区间内积分（连续时域）或求和（离散时域）——非周期信号对 `-∞` 到 `+∞` 操作，周期信号只需对任意一个完整周期操作（本书采用 `0` 到 `T` 或 `0` 到 `N-1`，但 `-T` 到 `0`、`-T/2` 到 `T/2` 结果完全相同）。综合方程则是逆过程，用频域数据乘以基函数并在对应频域区间积分或求和，从而还原出时域的每一个点。",
        "为了保证正逆变换能够严丝合缝地相互抵消，必须引入**缩放系数 (Scaling)**。本书 Table 31-1 将缩放系数统一放在了分析方程中：复数变换的缩放系数为 `1/N`、`1/T` 或 `1/(2π)`；由于实数变换不使用负频率，单个正频率必须承担双倍权重，因此缩放系数翻倍为 `2/N`、`2/T` 或 `1/π`。此外，实数变换在计算频谱虚部时刻意加上了一个**负号**以与复数变换保持符号一致；而在实数 DFT 和实数傅里叶级数的综合方程中，直流分量 `Re X(0)` 与奈奎斯特分量 `Re X[N/2]` 还需要执行特殊的减半缩放规则。",
        "阅读其他教材或论文时，你可能会发现公式长相略有不同，这通常源于以下 5 种常见变体：① 用普通频率 `f` 替换角频率 `ω`（`ω = 2πf`）；② 更改积分区间（如改用 `-T/2` 到 `T/2`）；③ 将部分或全部缩放系数挪到综合方程中；④ 用基频 `f₀ = 1/T` 替换周期 `T`；⑤ 更换变量名称（例如 DTFT 中用 `Ω` 代替 `ω`，傅里叶级数中用 `aₖ` 和 `bₖ` 代替 `Re X[k]` 和 `Im X[k]`）。"
      ],
      "formula": {
        "expr": "Scale_real = 2 × Scale_complex  (2/N, 2/T, 1/π)",
        "explain": "实数变换丢弃了负频率，所以正频率幅度必须翻倍；但直流 (k=0) 和最高频 (k=N/2) 没有负频率搭档，因此在实数综合方程中需要特殊处理。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：复数变换 vs 实数变换的缩放系数与特殊边界（DC & N/2）解剖",
      "instruction": "切换「实数变换视角」与「复数变换视角」，并尝试将频率索引 k 分别调至中间值（如 3）、直流 k=0 与奈奎斯特 k=8（N/2），观察频谱能量如何在正负频率与 1/N vs 2/N 缩放之间重新分配。",
      "controls": [
        {
          "type": "toggle",
          "id": "realMode",
          "label": "实数变换视角 (仅正频率 & 2/N 缩放)",
          "value": false
        },
        {
          "type": "slider",
          "id": "kBin",
          "label": "频率索引 k (N=16)",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "信号幅值 A",
          "min": 0.5,
          "max": 2,
          "step": 0.25,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "初始相位 φ",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 30,
          "unit": "°"
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var realMode = lab.values.realMode;\n  var kBin = lab.values.kBin;\n  var amp = lab.values.amp;\n  var phi = lab.values.phase * Math.PI / 180;\n  var N = 16;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 20; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var x = [];\n  for (var n = 0; n < N; n++) {\n    x.push(amp * Math.cos(2 * Math.PI * kBin * n / N + phi));\n  }\n\n  var tx0 = 24, tx1 = 290, tyMid = 132, tScale = 38;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(tx0, tyMid); ctx.lineTo(tx1, tyMid); ctx.stroke();\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('时域实信号 x[n] (N=16)', tx0, 22);\n\n  ctx.strokeStyle = 'rgba(16,185,129,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var px = 0; px <= tx1 - tx0; px += 2) {\n    var nf = (px / (tx1 - tx0)) * (N - 1);\n    var val = amp * Math.cos(2 * Math.PI * kBin * nf / N + phi);\n    var py = tyMid - val * tScale;\n    if (px === 0) ctx.moveTo(tx0 + px, py); else ctx.lineTo(tx0 + px, py);\n  }\n  ctx.stroke();\n\n  for (var i = 0; i < N; i++) {\n    var sx = tx0 + (i / (N - 1)) * (tx1 - tx0);\n    var sy = tyMid - x[i] * tScale;\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(sx, tyMid); ctx.lineTo(sx, sy); ctx.stroke();\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();\n  }\n\n  var fx0 = 335, fx1 = 695;\n  var reMid = 82, imMid = 178, fScale = 24;\n  var scaleFactor = realMode ? (2 / N) : (1 / N);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = realMode ? '#f59e0b' : '#38bdf8';\n  ctx.fillText(realMode ? '实数 DFT：仅正频率 0 ~ N/2 (缩放 2/N)' : '复数 DFT：正负频率 -N/2 ~ N/2-1 (缩放 1/N)', fx0, 22);\n\n  var mStart = realMode ? 0 : -8;\n  var mEnd = realMode ? 8 : 7;\n  var count = mEnd - mStart + 1;\n  var stepX = (fx1 - fx0) / (count + 1);\n\n  if (!realMode) {\n    var negWidth = 8 * stepX + stepX * 0.5;\n    ctx.fillStyle = 'rgba(245,158,11,0.08)';\n    ctx.fillRect(fx0, 34, negWidth, 186);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('负频率区', fx0 + 6, 46);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(fx0, reMid); ctx.lineTo(fx1, reMid); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(fx0, imMid); ctx.lineTo(fx1, imMid); ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re X[k]', fx0 + 4, reMid - 28);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('Im X[k] (含负号)', fx0 + 4, imMid - 28);\n\n  var targetRe = 0, targetIm = 0;\n  for (var m = mStart; m <= mEnd; m++) {\n    var sumRe = 0, sumIm = 0;\n    for (var j = 0; j < N; j++) {\n      var ang = 2 * Math.PI * m * j / N;\n      sumRe += x[j] * Math.cos(ang);\n      sumIm -= x[j] * Math.sin(ang);\n    }\n    var reVal = sumRe * scaleFactor;\n    var imVal = sumIm * scaleFactor;\n    if (m === kBin) { targetRe = reVal; targetIm = imVal; }\n\n    var bx = fx0 + (m - mStart + 1) * stepX;\n    var barW = realMode ? 14 : 9;\n\n    ctx.fillStyle = (m === kBin || (!realMode && m === -kBin)) ? '#38bdf8' : 'rgba(56,189,248,0.35)';\n    var rH = reVal * fScale;\n    ctx.fillRect(bx - barW / 2, rH >= 0 ? reMid - rH : reMid, barW, Math.abs(rH));\n\n    ctx.fillStyle = (m === kBin || (!realMode && m === -kBin)) ? '#ec4899' : 'rgba(236,72,153,0.35)';\n    var iH = imVal * fScale;\n    ctx.fillRect(bx - barW / 2, iH >= 0 ? imMid - iH : imMid, barW, Math.abs(iH));\n\n    ctx.fillStyle = (m === kBin) ? '#f8fafc' : '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(m), bx - (m < 0 ? 5 : 3), 228);\n  }\n\n  var note = '';\n  if (realMode && (kBin === 0 || kBin === 8)) {\n    note = ' | ⚠️ 边界特例: k=' + kBin + ' 无负频率搭档，综合重建需将 Re X[' + kBin + '] 减半!';\n  }\n  lab.setReadout((realMode ? '实数模式 (2/N)' : '复数模式 (1/N)') + ' | k=' + kBin + ': Re X[' + kBin + ']=' + targetRe.toFixed(2) + ', Im X[' + kBin + ']=' + targetIm.toFixed(2) + note);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "永远先用「离散 ↔ 周期」铁律定位你的信号：只要对连续信号做了采样（离散化），频谱就必然周期延拓；只要截取了周期（如 DFT 的 N 个点），两个域就都是离散且周期的。",
        "对比不同书本或代码库（如 NumPy / MATLAB / C 源码）时，不要被长相各异的公式吓到：先查三件事——缩放系数（1/N 还是 2/N，放在正变换还是逆变换）、频率变量（ω 还是 2πf）、以及积分/求和区间（0~N-1 还是 -N/2~N/2-1）。",
        "写实数 DFT 综合（逆变换）代码时，务必单独处理直流分量 Re X[0] 与奈奎斯特分量 Re X[N/2] 的特殊减半缩放，否则还原出的时域信号幅值会直接翻倍出错。"
      ]
    }
  ]
});
