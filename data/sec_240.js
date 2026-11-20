window.__BOOK_REGISTER_SECTION__("sec_240", {
  "title": "低通到高通的频率变换 (Low-pass to High-pass Frequency Change)",
  "intuition": "只要用一阶全通代换公式替换 z⁻¹，再把递推公式里的两个系数 a₁ 和 b₁ 取反，就能把一个截止频率为 1 弧度的低通滤波器瞬间“翻转”成任意截止频率 W 的高通滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、为什么要从低通“一键变换”成高通？",
      "paragraphs": [
        "在设计经典 IIR 滤波器（如巴特沃斯或切比雪夫滤波器）时，直接从零推导任意截止频率的高通公式非常繁琐。工程上更聪明的做法是**“先做母版，再做变形”**：我们只需要费一次力气，设计出一个截止频率固定为 **1 rad/sample**（即归一化角频率 ω = 1）的**低通原型滤波器**。",
        "随后，在 z 域中对这个现成滤波器的传递函数做一次**变量代换（Substitution）**——把原来的每一个 `z⁻¹` 都替换为一个特殊的一阶有理分式。这一步既能把低通响应“首尾翻转”成高通响应，又能同步把截止频率精准移动到你想要的目标频率 `W`（范围在 `0` 到 `π` 弧度之间）。"
      ],
      "formula": {
        "expr": "z⁻¹  →  (-z⁻¹ - k) / (1 + k·z⁻¹) ，其中  k = -cos(W/2 + 1/2) / cos(W/2 - 1/2)",
        "explain": "式 33-14：z⁻¹ 是单位延迟算子；W 是目标高通滤波器的截止角频率（0 < W < π，对应 0 到奈奎斯特频率）；k 是决定频率映射弯曲程度的实数参数，当 0 < W < π 时恒有 |k| < 1，从而保证变换后的滤波器依然稳定。"
      }
    },
    {
      "type": "concept",
      "heading": "二、几何直觉：单位圆上的“乾坤大挪移”",
      "paragraphs": [
        "为什么这个分式替换能把低通变成高通？把单位圆上的关键频率点代入式 33-14 看一眼就明白了：",
        "1. **直流点翻转（ω = 0）**：当新滤波器处于直流 `z⁻¹ = 1` 时，代换式算出 `(-1 - k)/(1 + k) = -1`，正好对应原低通原型在 **奈奎斯特频率（π）** 处的值——低通在 π 处增益几乎为 0，于是新滤波器在直流处被彻底阻断。",
        "2. **高频点翻转（ω = π）**：当新滤波器处于最高频 `z⁻¹ = -1` 时，代换式算出 `(1 - k)/(1 - k) = +1`，对应原低通在 **直流（0）** 处的值——低通在直流处增益为 1，于是新滤波器在高频处畅通无阻。",
        "3. **截止点精准对齐（ω = W）**：参数 `k` 的余弦比值公式经过精确推导，恰好让 `z⁻¹ = e^(-jW)` 映射到原低通的单位截止点 `e^(+j1)`（对于实系数滤波器，其幅度响应与 `ω = 1` 完全相同）。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：观察 Z 平面极零点迁移与高通幅频响应",
      "instruction": "拖动目标截止频率 W 滑块，观察右侧高通幅频曲线与 -3dB 截止点的实时移动，以及左侧 Z 平面上极点（×）和零点（○）如何从低通原型位置迁移。",
      "controls": [
        {
          "type": "slider",
          "id": "W",
          "label": "目标截止频率 W",
          "min": 0.15,
          "max": 2.95,
          "step": 0.05,
          "value": 1.2,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "showProto",
          "label": "显示原低通原型 (ωc=1)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "使用对数 dB 刻度",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, CW = lab.width, CH = lab.height;\nvar C = Math.tan(0.5);\nvar norm = 1 + Math.SQRT2 * C + C * C;\nvar lpA0 = (C * C) / norm, lpA1 = (2 * C * C) / norm, lpA2 = lpA0;\nvar lpB1 = (2 * (1 - C * C)) / norm;\nvar lpB2 = -(1 - Math.SQRT2 * C + C * C) / norm;\n\nfunction solveQuad(c2, c1, c0) {\n  var disc = c1 * c1 - 4 * c2 * c0;\n  if (Math.abs(disc) < 1e-10) disc = 0;\n  if (disc >= 0) {\n    var sd = Math.sqrt(disc);\n    return [{ re: (-c1 + sd) / (2 * c2), im: 0 }, { re: (-c1 - sd) / (2 * c2), im: 0 }];\n  } else {\n    var id = Math.sqrt(-disc) / (2 * c2);\n    var rr = -c1 / (2 * c2);\n    return [{ re: rr, im: id }, { re: rr, im: -id }];\n  }\n}\n\nfunction magAt(w, a0, a1, a2, b1, b2) {\n  var c1 = Math.cos(w), s1 = -Math.sin(w);\n  var c2 = Math.cos(2 * w), s2 = -Math.sin(2 * w);\n  var nr = a0 + a1 * c1 + a2 * c2;\n  var ni = a1 * s1 + a2 * s2;\n  var dr = 1 - b1 * c1 - b2 * c2;\n  var di = -b1 * s1 - b2 * s2;\n  return Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di + 1e-18));\n}\n\nfunction drawCross(x, y, r, color, lw) {\n  ctx.strokeStyle = color;\n  ctx.lineWidth = lw;\n  ctx.beginPath();\n  ctx.moveTo(x - r, y - r); ctx.lineTo(x + r, y + r);\n  ctx.moveTo(x + r, y - r); ctx.lineTo(x - r, y + r);\n  ctx.stroke();\n}\n\nfunction drawCircleMark(x, y, r, color, lw) {\n  ctx.strokeStyle = color;\n  ctx.lineWidth = lw;\n  ctx.beginPath();\n  ctx.arc(x, y, r, 0, Math.PI * 2);\n  ctx.stroke();\n}\n\nfunction render() {\n  var W = lab.values.W;\n  var showProto = lab.values.showProto;\n  var dbScale = lab.values.dbScale;\n\n  var k = -Math.cos(W * 0.5 + 0.5) / Math.cos(W * 0.5 - 0.5);\n  var D = 1 + lpB1 * k - lpB2 * k * k;\n  var hpA0 = (lpA0 - lpA1 * k + lpA2 * k * k) / D;\n  var hpA1 = -(-2 * lpA0 * k + lpA1 + lpA1 * k * k - 2 * lpA2 * k) / D;\n  var hpA2 = (lpA0 * k * k - lpA1 * k + lpA2) / D;\n  var hpB1 = -(2 * k + lpB1 + lpB1 * k * k - 2 * lpB2 * k) / D;\n  var hpB2 = (-k * k - lpB1 * k + lpB2) / D;\n\n  ctx.clearRect(0, 0, CW, CH);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, CW, CH);\n\n  var zcx = 118, zcy = 122, zr = 78;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(zcx - zr - 20, zcy); ctx.lineTo(zcx + zr + 20, zcy);\n  ctx.moveTo(zcx, zcy - zr - 20); ctx.lineTo(zcx, zcy + zr + 20);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(zcx, zcy, zr, 0, Math.PI * 2);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('Z 平面单位圆', 14, 18);\n  ctx.fillText('+1(DC)', zcx + zr + 4, zcy - 4);\n  ctx.fillText('-1(π)', zcx - zr - 32, zcy - 4);\n\n  var wx = zcx + zr * Math.cos(W), wy = zcy - zr * Math.sin(W);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(zcx, zcy); ctx.lineTo(wx, wy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(zcx, zcy); ctx.lineTo(wx, zcy + zr * Math.sin(W)); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(wx, wy, 3.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillText('W', wx + 6, wy - 4);\n\n  if (showProto) {\n    var lpPoles = solveQuad(1, -lpB1, -lpB2);\n    var lpZeros = solveQuad(lpA0, lpA1, lpA2);\n    for (var i = 0; i < 2; i++) {\n      drawCross(zcx + lpPoles[i].re * zr, zcy - lpPoles[i].im * zr, 4.5, 'rgba(245,158,11,0.55)', 1.5);\n      drawCircleMark(zcx + lpZeros[i].re * zr, zcy - lpZeros[i].im * zr, 5, 'rgba(245,158,11,0.55)', 1.5);\n    }\n  }\n\n  var hpPoles = solveQuad(1, -hpB1, -hpB2);\n  var hpZeros = solveQuad(hpA0, hpA1, hpA2);\n  for (var j = 0; j < 2; j++) {\n    drawCross(zcx + hpPoles[j].re * zr, zcy - hpPoles[j].im * zr, 5.5, '#ec4899', 2.2);\n    drawCircleMark(zcx + hpZeros[j].re * zr, zcy - hpZeros[j].im * zr, 6 + j * 2.5, '#10b981', 2);\n  }\n\n  var px0 = 268, py0 = 24, pw = 430, ph = 178;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = py0 + (ph * g) / 4;\n    ctx.beginPath(); ctx.moveTo(px0, gy); ctx.lineTo(px0 + pw, gy); ctx.stroke();\n  }\n  for (var gxIdx = 0; gxIdx <= 3; gxIdx++) {\n    var gx = px0 + (pw * gxIdx) / 3;\n    ctx.beginPath(); ctx.moveTo(gx, py0); ctx.lineTo(gx, py0 + ph); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.strokeRect(px0, py0, pw, ph);\n\n  function mapY(mag) {\n    if (!dbScale) {\n      var v = Math.min(1.15, Math.max(0, mag));\n      return py0 + ph - (v / 1.15) * ph;\n    } else {\n      var db = 20 * Math.log10(Math.max(mag, 1e-4));\n      var clamped = Math.min(5, Math.max(-40, db));\n      return py0 + ph - ((clamped + 40) / 45) * ph;\n    }\n  }\n\n  if (showProto) {\n    var xProtoW = px0 + (1.0 / Math.PI) * pw;\n    ctx.strokeStyle = 'rgba(245,158,11,0.4)';\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath(); ctx.moveTo(xProtoW, py0); ctx.lineTo(xProtoW, py0 + ph); ctx.stroke();\n    ctx.beginPath();\n    for (var s = 0; s <= 200; s++) {\n      var w = (s / 200) * Math.PI;\n      var m = magAt(w, lpA0, lpA1, lpA2, lpB1, lpB2);\n      var xx = px0 + (w / Math.PI) * pw, yy = mapY(m);\n      if (s === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n    }\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.8;\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.beginPath();\n  for (var s2 = 0; s2 <= 220; s2++) {\n    var w2 = (s2 / 220) * Math.PI;\n    var m2 = magAt(w2, hpA0, hpA1, hpA2, hpB1, hpB2);\n    var xx2 = px0 + (w2 / Math.PI) * pw, yy2 = mapY(m2);\n    if (s2 === 0) ctx.moveTo(xx2, yy2); else ctx.lineTo(xx2, yy2);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.6;\n  ctx.stroke();\n\n  var xW = px0 + (W / Math.PI) * pw;\n  var magW = magAt(W, hpA0, hpA1, hpA2, hpB1, hpB2);\n  var yW = mapY(magW);\n  ctx.strokeStyle = 'rgba(16,185,129,0.7)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(xW, py0); ctx.lineTo(xW, py0 + ph); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(xW, yW, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px monospace';\n  ctx.fillText('幅频响应 |H(e^jω)|' + (dbScale ? ' (dB)' : ' (线性)'), px0, 16);\n  ctx.fillText(dbScale ? '+5dB' : '1.15', px0 - 30, py0 + 8);\n  ctx.fillText(dbScale ? '-40' : '0', px0 - 24, py0 + ph);\n  ctx.fillText('0', px0 - 4, py0 + ph + 14);\n  ctx.fillText('1.0', px0 + (1 / Math.PI) * pw - 10, py0 + ph + 14);\n  ctx.fillText('π (3.14)', px0 + pw - 36, py0 + ph + 14);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('W=' + W.toFixed(2), Math.min(px0 + pw - 48, xW + 4), py0 + 14);\n\n  ctx.fillStyle = '#ec4899'; ctx.fillText('× HP极点', 14, 232);\n  ctx.fillStyle = '#10b981'; ctx.fillText('○ HP零点', 84, 232);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 变换后高通', 156, 232);\n  if (showProto) { ctx.fillStyle = '#f59e0b'; ctx.fillText('-- 原低通原型', 252, 232); }\n\n  var dbW = 20 * Math.log10(Math.max(magW, 1e-6));\n  lab.setReadout('W = ' + W.toFixed(2) + ' rad  |  k = ' + k.toFixed(4) + '  |  |H(W)| = ' + magW.toFixed(3) + ' (' + dbW.toFixed(2) + ' dB)  |  a0=' + hpA0.toFixed(3) + ', a1=' + hpA1.toFixed(3) + ', b1=' + hpB1.toFixed(3));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "三、二阶节（Biquad）设计方程：惊人的“仅改两处”规律",
      "paragraphs": [
        "把式 33-14 代入任意一个二阶节（Biquad，最多两个极点与两个零点）的传递函数中，通分整理后，你会得到一组用于计算新递归系数的工程公式。**最神奇的地方在于：它与低通到低通变换（式 33-13）几乎完全一样，只需要做两个微小的修改！**",
        "为什么会这样？对比一下就能看穿：低通到低通的替换是 `(z⁻¹ - k) / (1 - k·z⁻¹)`，而低通到高通的替换本质上等价于把其中每一个 `z⁻¹` 替换成 `-z⁻¹`（同时换用式 33-14 的 `k`）。在二阶多项式 `a₀ + a₁z⁻¹ + a₂z⁻²` 中，把 `z⁻¹` 变成 `-z⁻¹` 时，**常数项和平方项（`z⁰` 和 `z⁻²`）符号不变，只有一次项（`z⁻¹` 项的系数 `a₁` 和 `b₁`）需要取反！**",
        "在 Steven Smith 原书配套程序的第 1330~1410 行中，正是利用这一性质，用几乎同一套代码同时支持了低通和高通两种滤波器的系数重算。"
      ],
      "formula": {
        "expr": "D = 1 + b₁k - b₂k² ； a₀ = (a₀ - a₁k + a₂k²)/D ； a₁ = -(-2a₀k + a₁ + a₁k² - 2a₂k)/D ； a₂ = (a₀k² - a₁k + a₂)/D ； b₁ = -(2k + b₁ + b₁k² - 2b₂k)/D ； b₂ = (-k² - b₁k + b₂)/D",
        "explain": "右侧各分式中，斜体风格的原系数 a₀,a₁,a₂,b₁,b₂ 代表截止频率为 1 的低通原型递归系数（对应差分方程 y[n] = a₀x[n] + a₁x[n-1] + a₂x[n-2] + b₁y[n-1] + b₂y[n-2]）；左侧为变换后截止频率为 W 的高通系数。注意 a₁ 与 b₁ 公式最前方都有一个关键的负号！"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：听觉与时域波形实测（含“忘记取反”踩坑现场）",
      "instruction": "拖动截止频率 W 并点击“播放测试音”，体验 130Hz 低音哼声、650Hz 中音与 1950Hz 高音是如何被依次切掉的；再试着打开“忘记对 a₁, b₁ 取反”，亲耳听听这一个负号漏掉后会发生什么灾难！",
      "controls": [
        {
          "type": "slider",
          "id": "W",
          "label": "高通截止频率 W",
          "min": 0.08,
          "max": 2.4,
          "step": 0.02,
          "value": 0.5,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "forgotNegate",
          "label": "踩坑模拟：忘记对 a₁, b₁ 取反",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, CW = lab.width, CH = lab.height;\nvar FS = 8000;\nvar C = Math.tan(0.5);\nvar norm = 1 + Math.SQRT2 * C + C * C;\nvar lpA0 = (C * C) / norm, lpA1 = (2 * C * C) / norm, lpA2 = lpA0;\nvar lpB1 = (2 * (1 - C * C)) / norm;\nvar lpB2 = -(1 - Math.SQRT2 * C + C * C) / norm;\n\nvar curCoeffs = { a0: 1, a1: 0, a2: 0, b1: 0, b2: 0, k: 0 };\nvar audioNode = null, gainNode = null;\nvar dspAcc = 0, sampleIdx = 0, prevOut = 0, curOut = 0;\nvar x1 = 0, x2 = 0, y1 = 0, y2 = 0;\nvar phaseScroll = 0;\n\nfunction updateCoeffs() {\n  var W = lab.values.W;\n  var bug = lab.values.forgotNegate;\n  var k = -Math.cos(W * 0.5 + 0.5) / Math.cos(W * 0.5 - 0.5);\n  var D = 1 + lpB1 * k - lpB2 * k * k;\n  var sign = bug ? 1 : -1;\n  curCoeffs.k = k;\n  curCoeffs.a0 = (lpA0 - lpA1 * k + lpA2 * k * k) / D;\n  curCoeffs.a1 = sign * (-2 * lpA0 * k + lpA1 + lpA1 * k * k - 2 * lpA2 * k) / D;\n  curCoeffs.a2 = (lpA0 * k * k - lpA1 * k + lpA2) / D;\n  curCoeffs.b1 = sign * (2 * k + lpB1 + lpB1 * k * k - 2 * lpB2 * k) / D;\n  curCoeffs.b2 = (-k * k - lpB1 * k + lpB2) / D;\n}\n\nfunction genSignal(n) {\n  var t = n / FS;\n  return 0.50 * Math.sin(2 * Math.PI * 130 * t) + 0.30 * Math.sin(2 * Math.PI * 650 * t) + 0.25 * Math.sin(2 * Math.PI * 1950 * t);\n}\n\nfunction handleAudio() {\n  var playing = lab.values.play;\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (playing) {\n    if (ac.state === 'suspended') ac.resume();\n    if (!audioNode) {\n      audioNode = ac.createScriptProcessor(1024, 1, 1);\n      gainNode = ac.createGain();\n      gainNode.gain.value = 0;\n      audioNode.onaudioprocess = function(ev) {\n        var out = ev.outputBuffer.getChannelData(0);\n        var step = FS / ac.sampleRate;\n        var c = curCoeffs;\n        for (var i = 0; i < out.length; i++) {\n          dspAcc += step;\n          while (dspAcc >= 1) {\n            dspAcc -= 1;\n            var x0 = genSignal(sampleIdx++);\n            var y0 = c.a0 * x0 + c.a1 * x1 + c.a2 * x2 + c.b1 * y1 + c.b2 * y2;\n            if (!isFinite(y0)) y0 = 0;\n            x2 = x1; x1 = x0;\n            y2 = y1; y1 = y0;\n            prevOut = curOut;\n            curOut = y0;\n          }\n          out[i] = prevOut + (curOut - prevOut) * dspAcc;\n        }\n      };\n      audioNode.connect(gainNode);\n      gainNode.connect(ac.destination);\n    }\n    gainNode.gain.setTargetAtTime(0.28, ac.currentTime, 0.03);\n  } else if (gainNode) {\n    gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.03);\n  }\n}\n\nfunction drawWaveforms() {\n  var W = lab.values.W;\n  var bug = lab.values.forgotNegate;\n  var c = curCoeffs;\n\n  ctx.clearRect(0, 0, CW, CH);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, CW, CH);\n\n  var padX = 24, wBox = CW - 48, midTop = 64, midBot = 172;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(padX, midTop); ctx.lineTo(padX + wBox, midTop);\n  ctx.moveTo(padX, midBot); ctx.lineTo(padX + wBox, midBot);\n  ctx.stroke();\n\n  var warmup = 450, winLen = 220;\n  var total = warmup + winLen;\n  var sx1 = 0, sx2 = 0, sy1 = 0, sy2 = 0;\n  var startN = Math.floor(phaseScroll);\n  var rawArr = [], outArr = [];\n\n  for (var i = 0; i < total; i++) {\n    var x = genSignal(startN + i);\n    var y = c.a0 * x + c.a1 * sx1 + c.a2 * sx2 + c.b1 * sy1 + c.b2 * sy2;\n    sx2 = sx1; sx1 = x;\n    sy2 = sy1; sy1 = y;\n    if (i >= warmup) {\n      rawArr.push(x);\n      outArr.push(y);\n    }\n  }\n\n  ctx.beginPath();\n  for (var j = 0; j < winLen; j++) {\n    var px = padX + (j / (winLen - 1)) * wBox;\n    var py = midTop - rawArr[j] * 38;\n    if (j === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#94a3b8';\n  ctx.lineWidth = 1.6;\n  ctx.stroke();\n\n  ctx.beginPath();\n  for (var m = 0; m < winLen; m++) {\n    var px2 = padX + (m / (winLen - 1)) * wBox;\n    var py2 = midBot - outArr[m] * 42;\n    if (m === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.strokeStyle = bug ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px monospace';\n  ctx.fillText('输入混合信号 x[n]：130Hz(低音) + 650Hz(中音) + 1950Hz(高音)', padX, 20);\n  ctx.fillStyle = bug ? '#ec4899' : '#10b981';\n  var fcHz = (W * FS) / (2 * Math.PI);\n  var bugFcHz = ((Math.PI - W) * FS) / (2 * Math.PI);\n  var statusText = bug\n    ? '【错误！未对 a₁, b₁ 取反】滤波器退化成低通！实际截止 ≈ ' + bugFcHz.toFixed(0) + ' Hz（低音全回来了）'\n    : '输出信号 y[n]（正常高通）：当前截止频率 fc ≈ ' + fcHz.toFixed(0) + ' Hz';\n  ctx.fillText(statusText, padX, 120);\n\n  lab.setReadout('W = ' + W.toFixed(2) + ' rad (等效 ' + fcHz.toFixed(0) + ' Hz @ 8kHz)  |  模式: ' + (bug ? '错误-变成低通(π-W=' + (Math.PI - W).toFixed(2) + ')' : '正确-高通滤波') + '  |  a₁=' + c.a1.toFixed(3) + ', b₁=' + c.b1.toFixed(3));\n}\n\nlab.onUpdate(function() {\n  updateCoeffs();\n  handleAudio();\n  drawWaveforms();\n});\n\nlab.onLoop(function(dt) {\n  if (lab.values.play) {\n    phaseScroll += dt * 120;\n    drawWaveforms();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【千万别漏掉两个负号】：从低通变高通时，除了把 k 换成式 33-14 的余弦比值公式之外，必须把算出来的 a₁ 和 b₁ 取反。一旦漏掉取反，高通就会瞬间镜像退化成截止频率为 (π - W) 的低通滤波器！",
        "【符号约定检查】：式 33-13 与式 33-14 采用的是 Smith 本书的递归系数符号约定（y 端系数 b₁, b₂ 在差分方程右侧为正号相加）。如果你在项目里用的是分母写为 1 + b₁z⁻¹ + b₂z⁻² 的标准库，带入前记得先统一 b₁, b₂ 的正负号。",
        "【级联复用】：虽然本节只列出了二阶节（Biquad）的转换公式，但高阶 IIR 滤波器都可以拆成多个二阶节串联；只需对每个二阶节独立套用一次式 33-14 与取反规则，就能把任意高阶低通原型整体翻转成高通。"
      ]
    }
  ]
});
