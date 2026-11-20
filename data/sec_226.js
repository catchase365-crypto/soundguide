window.__BOOK_REGISTER_SECTION__("sec_226", {
  "title": "电路的拉普拉斯域分析 (Analysis of Electric Circuits)",
  "intuition": "把电阻、电感和电容统统变成复数域里的“广义电阻”，用初中欧姆定律和二次方程求根，就能绕开繁琐的时域微积分，直接算出电路的传输函数与零极点。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从微积分到代数：元件的 s 域等效变换",
      "paragraphs": [
        "拉普拉斯变换是分析线性电路（乃至一切由微分方程控制的物理系统）的核心武器。如果硬碰硬地用**蛮力法**去解电路的微分方程、求出脉冲响应再做拉普拉斯变换，计算过程会非常痛苦。",
        "聪明的做法是**分而治之**：先把每一个独立元件直接转换到 `s` 域，然后再用代数方法把它们连接起来。就像第 30 章的相量法（Phasor）把元件写成 `R`、`jωL`、`1/(jωC)` 一样，拉普拉斯变换把电阻、电感和电容分别变成 `R`、`sL` 和 `1/(sC)`。你会发现，相量法其实就是拉普拉斯变换在复平面虚轴（即实部 `σ = 0`，`s = jω`）上的一个特例。",
        "当我们说电感在 `s` 域等效为 `sL` 时，本质上是把每个元件看作一个**“电流输入、电压输出”的小系统**。例如在 `t ≥ 0` 时给电感通入正弦电流 `i(t) = sin(ω₀t)`，其两端电压为 `v(t) = L · di/dt = ω₀L cos(ω₀t)`。分别做拉普拉斯变换后，比值 `V(s) / I(s)` 恰好就是 `sL`。无论输入波形多复杂，这个比值永远成立！"
      ],
      "formula": {
        "expr": "V(s) / I(s) = R  (电阻)  |  sL  (电感)  |  1/(sC)  (电容)",
        "explain": "V(s) 是元件两端电压的拉普拉斯变换，I(s) 是流过电流的拉普拉斯变换；三者就像广义欧姆定律中的“复阻抗”，可直接套用串并联和分压公式"
      }
    },
    {
      "type": "concept",
      "heading": "电路分析标准四步法（以 RLC 陷波滤波器为例）",
      "paragraphs": [
        "任何由电阻、电容、电感组成的电路，都可以严格按照以下四个步骤完成分析。我们以经典的 **RLC 串联分压陷波滤波器**（电阻 `R` 在上臂，电容 `1/(sC)` 与电感 `sL` 串联作为下臂输出 `Vout`）为例：",
        "**第 1 步：元件 s 域替换**。把电路图中的每个电阻写成 `R`，电感写成 `sL`，电容写成 `1/(sC)`。",
        "**第 2 步：用欧姆定律求传输函数 `H(s)`**。把三个元件当成普通电阻，套用分压公式，得到输出与输入的比值 `H(s) = Vout(s) / Vin(s) = (sL + 1/(sC)) / (R + sL + 1/(sC))`。正如频率响应 `H(ω)` 是脉冲响应的傅里叶变换，**传输函数 `H(s)` 就是脉冲响应的拉普拉斯变换**。",
        "**第 3 步：整理成“多项式除以多项式”的标准形式**。分子分母同乘 `s`，得到 `H(s) = (Ls² + 1/C) / (Ls² + Rs + 1/C)`。凡是由微分方程控制的电路都能写成这种有理分式（相反，像矩形脉冲这种非微分方程信号就无法写成这种形式）。",
        "**第 4 步：因式分解提取零点与极点**。用一元二次方程求根公式分别分解分子和分母。分子的根是**零点** `z₁, z₂ = ±j / √(LC)`（落在虚轴上，代表恰好能把该频率信号完全“吸干抵消”的陷波点）；分母的根是**极点** `p₁, p₂ = (-R ± √(R² - 4L/C)) / (2L)`。"
      ],
      "formula": {
        "expr": "H(s) = [ (s - z1)(s - z2) ] / [ (s - p1)(s - p2) ]",
        "explain": "z1, z2 为系统零点（使传输函数为 0 的复频率）；p1, p2 为系统极点（使传输函数趋向无穷大的复频率，决定系统的稳定性与阻尼形态）"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：RLC 陷波滤波器四步法实操与听觉抵消验证",
      "instruction": "拖动 R、L、C 滑块观察 s 平面零极点移动（注意增大 R 时共轭极点如何碰撞分裂到实轴），开启声音并拖动测试音频率逼近 f₀，亲耳听见零点把声音“完全抵消”！",
      "controls": [
        {
          "type": "slider",
          "id": "R",
          "label": "电阻 R",
          "min": 20,
          "max": 600,
          "step": 10,
          "value": 120,
          "unit": " Ω"
        },
        {
          "type": "slider",
          "id": "L",
          "label": "电感 L",
          "min": 10,
          "max": 100,
          "step": 5,
          "value": 50,
          "unit": " mH"
        },
        {
          "type": "slider",
          "id": "C",
          "label": "电容 C",
          "min": 0.2,
          "max": 3,
          "step": 0.1,
          "value": 1,
          "unit": " μF"
        },
        {
          "type": "slider",
          "id": "toneFreq",
          "label": "测试音频率",
          "min": 200,
          "max": 2000,
          "step": 10,
          "value": 710,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音 (听陷波抵消)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioCtx = null, osc = null, filter = null, gainNode = null, isPlaying = false;\nfunction render() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var R = lab.values.R;\n  var L = lab.values.L * 1e-3;\n  var C = lab.values.C * 1e-6;\n  var toneFreq = lab.values.toneFreq;\n  var w0 = 1 / Math.sqrt(L * C);\n  var f0 = w0 / (2 * Math.PI);\n  var Q = Math.sqrt(L / C) / R;\n  var alpha = R / (2 * L);\n  var disc = R * R - 4 * L / C;\n  var poles = [];\n  if (disc < 0) {\n    var wd = Math.sqrt(-disc) / (2 * L);\n    poles.push({ re: -alpha, im: wd });\n    poles.push({ re: -alpha, im: -wd });\n  } else {\n    var sq = Math.sqrt(disc) / (2 * L);\n    poles.push({ re: -alpha + sq, im: 0 });\n    poles.push({ re: -alpha - sq, im: 0 });\n  }\n  var wTone = 2 * Math.PI * toneFreq;\n  var numT = w0 * w0 - wTone * wTone;\n  var denI = wTone * (R / L);\n  var currGain = Math.abs(numT) / Math.hypot(numT, denI);\n\n  if (lab.values.play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n    if (audioCtx && !isPlaying) {\n      osc = audioCtx.createOscillator();\n      osc.type = 'sine';\n      filter = audioCtx.createBiquadFilter();\n      filter.type = 'notch';\n      gainNode = audioCtx.createGain();\n      gainNode.gain.setValueAtTime(0.18, audioCtx.currentTime);\n      osc.connect(filter);\n      filter.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n      isPlaying = true;\n    }\n    if (audioCtx && isPlaying) {\n      var now = audioCtx.currentTime;\n      osc.frequency.setTargetAtTime(toneFreq, now, 0.015);\n      filter.frequency.setTargetAtTime(Math.max(20, Math.min(20000, f0)), now, 0.015);\n      filter.Q.setTargetAtTime(Math.max(0.05, Math.min(40, Q)), now, 0.015);\n    }\n  } else if (isPlaying && audioCtx) {\n    try {\n      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.01);\n      osc.stop(audioCtx.currentTime + 0.05);\n    } catch (e) {}\n    osc = null; filter = null; gainNode = null; isPlaying = false;\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var sx = 145, sy = 120, sRadius = 92;\n  var sMax = 14000;\n  var scale = sRadius / sMax;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';\n  ctx.fillRect(sx - sRadius, sy - sRadius, sRadius, sRadius * 2);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -2; g <= 2; g++) {\n    var off = g * 40;\n    ctx.beginPath(); ctx.moveTo(sx - sRadius, sy + off); ctx.lineTo(sx + sRadius, sy + off); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(sx + off, sy - sRadius); ctx.lineTo(sx + off, sy + sRadius); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';\n  ctx.beginPath(); ctx.moveTo(sx - sRadius, sy); ctx.lineTo(sx + sRadius, sy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(sx, sy - sRadius); ctx.lineTo(sx, sy + sRadius); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('s 平面 (零点 ○ / 极点 ×)', 18, 18);\n  ctx.fillText('σ', sx + sRadius - 10, sy - 6);\n  ctx.fillText('jω', sx + 6, sy - sRadius + 10);\n\n  function clampS(val) { return Math.max(-sMax, Math.min(sMax, val)); }\n  var zOff = clampS(w0) * scale;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(sx, sy - zOff, 5.5, 0, Math.PI * 2); ctx.stroke();\n  ctx.beginPath(); ctx.arc(sx, sy + zOff, 5.5, 0, Math.PI * 2); ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  for (var i = 0; i < poles.length; i++) {\n    var px = sx + clampS(poles[i].re) * scale;\n    var py = sy - clampS(poles[i].im) * scale;\n    ctx.beginPath(); ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px - 5, py + 5); ctx.lineTo(px + 5, py - 5); ctx.stroke();\n  }\n\n  var probeY = sy - clampS(wTone) * scale;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(sx, probeY, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  var gx = 285, gy = 26, gw = 415, gh = 175;\n  var fMax = 2200;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fGrid = 0; fGrid <= 2000; fGrid += 500) {\n    var xPos = gx + (fGrid / fMax) * gw;\n    ctx.beginPath(); ctx.moveTo(xPos, gy); ctx.lineTo(xPos, gy + gh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'center';\n    ctx.fillText(fGrid + 'Hz', xPos, gy + gh + 15);\n  }\n  for (var aGrid = 0; aGrid <= 1.01; aGrid += 0.5) {\n    var yPos = gy + gh - aGrid * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yPos); ctx.lineTo(gx + gw, yPos); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'right';\n    ctx.fillText(aGrid.toFixed(1), gx - 6, yPos + 4);\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.fillText('频率响应 |H(j2πf)| (虚轴截面幅度)', gx, 18);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var pxIdx = 0; pxIdx <= gw; pxIdx += 2) {\n    var freq = (pxIdx / gw) * fMax;\n    var w = 2 * Math.PI * freq;\n    var n = w0 * w0 - w * w;\n    var dI = w * (R / L);\n    var mag = Math.abs(n) / Math.hypot(n, dI);\n    var yPlot = gy + gh - mag * gh;\n    if (pxIdx === 0) ctx.moveTo(gx + pxIdx, yPlot); else ctx.lineTo(gx + pxIdx, yPlot);\n  }\n  ctx.stroke();\n\n  if (f0 <= fMax) {\n    var f0X = gx + (f0 / fMax) * gw;\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.beginPath(); ctx.moveTo(f0X, gy); ctx.lineTo(f0X, gy + gh); ctx.stroke();\n    ctx.restore();\n    ctx.fillStyle = '#38bdf8';\n    ctx.textAlign = 'center';\n    ctx.fillText('f0=' + Math.round(f0) + 'Hz', Math.min(gx + gw - 30, Math.max(gx + 30, f0X)), gy + 14);\n  }\n\n  var tX = gx + (toneFreq / fMax) * gw;\n  var tY = gy + gh - currGain * gh;\n  ctx.save();\n  ctx.setLineDash([2, 3]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(tX, gy); ctx.lineTo(tX, gy + gh); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(tX, tY, 5, 0, Math.PI * 2); ctx.fill();\n\n  lab.setReadout('陷波中心 f0 = ' + f0.toFixed(1) + ' Hz | Q = ' + Q.toFixed(2) + ' | 极点状态: ' + (disc < 0 ? '共轭复极点(欠阻尼)' : '双实极点(过阻尼)') + ' | 测试音通过增益 = ' + currGain.toFixed(3));\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "极点数量的物理法则与“二阶级联”的工程智慧",
      "paragraphs": [
        "在上面的 RLC 电路中，我们得到了 2 个极点和 2 个零点，这绝非巧合。电路理论有一条铁律：**系统拥有的极点总数，严格等于电路中独立储能元件（电感和电容）的数量**。电阻只会把电能变成热量消耗掉，无法存储能量，因此电阻再多也不会增加极点数量；而系统零点的数量则一定小于或等于极点数量。",
        "既然极点与零点这么好用，为什么工程上不直接造一个 8 阶单级电路，把分子分母写成 `s⁸` 的多项式再分解呢？原因很现实：**三次及三次以上的多项式通常无法用初等代数公式直接因式分解**，求根只能依赖复杂的数值算法。",
        "为了绕开这个数学障碍，电子工程师发明了**二阶级联（Cascade of Second-Order Stages）**的设计思路：既然二次多项式用求根公式就能轻松搞定，那就把多个独立的二阶滤波单元串联起来。比如一个 8 极点滤波器，完全可以由 4 个二阶单元首尾相接而成。请记住书中的名言：**多级级联架构是为了克服数学上的求解限制，而不是因为电子器件本身的限制**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：多级二阶单元级联，看 2 极点如何“叠乘”成 8 极点陡峭滤波",
      "instruction": "增加“级联级数”观察极点数量与阻带滚降斜率的飙升；切换开关，对比“巴特沃斯交错极点布局”与“直接照搬相同二阶单元”在通带平坦度上的巨大差异！",
      "controls": [
        {
          "type": "slider",
          "id": "stages",
          "label": "二阶级联级数",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 2,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 fc",
          "min": 0.6,
          "max": 3,
          "step": 0.1,
          "value": 1.5,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "butterworth",
          "label": "巴特沃斯交错极点分布",
          "value": true
        }
      ],
      "jsCode": "function render() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var M = lab.values.stages;\n  var fc = lab.values.fc;\n  var isButter = lab.values.butterworth;\n  var totalPoles = 2 * M;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var sx = 185, sy = 120, pxPerKhz = 30;\n  var rPx = fc * pxPerKhz;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';\n  ctx.fillRect(20, 22, sx - 20, 196);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var k = -3; k <= 3; k++) {\n    var off = k * pxPerKhz;\n    ctx.beginPath(); ctx.moveTo(20, sy + off); ctx.lineTo(235, sy + off); ctx.stroke();\n    if (sx + off >= 20 && sx + off <= 235) {\n      ctx.beginPath(); ctx.moveTo(sx + off, 22); ctx.lineTo(sx + off, 218); ctx.stroke();\n    }\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';\n  ctx.beginPath(); ctx.moveTo(20, sy); ctx.lineTo(235, sy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(sx, 22); ctx.lineTo(sx, 218); ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.beginPath(); ctx.arc(sx, sy, rPx, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();\n  ctx.restore();\n\n  var dList = [];\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  for (var i = 0; i < M; i++) {\n    var theta = isButter ? (Math.PI / 2 + ((2 * i + 1) * Math.PI) / (4 * M)) : (0.75 * Math.PI);\n    var d = -2 * Math.cos(theta);\n    dList.push(d);\n    var px = sx + rPx * Math.cos(theta);\n    var pyOff = rPx * Math.sin(theta);\n    ctx.beginPath(); ctx.moveTo(px - 5, sy - pyOff - 5); ctx.lineTo(px + 5, sy - pyOff + 5); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px - 5, sy - pyOff + 5); ctx.lineTo(px + 5, sy - pyOff - 5); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px - 5, sy + pyOff - 5); ctx.lineTo(px + 5, sy + pyOff + 5); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px - 5, sy + pyOff + 5); ctx.lineTo(px + 5, sy + pyOff - 5); ctx.stroke();\n  }\n  if (!isButter && M > 1) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'right';\n    var stackX = sx + rPx * Math.cos(0.75 * Math.PI) - 8;\n    var stackY = sy - rPx * Math.sin(0.75 * Math.PI);\n    ctx.fillText('×' + M + ' 重叠', stackX, stackY + 4);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('左半 s 平面 (' + totalPoles + ' 个极点)', 18, 16);\n\n  var gx = 285, gy = 26, gw = 415, gh = 175;\n  var fMax = 5.0, minDb = -60;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fG = 0; fG <= 5; fG += 1) {\n    var xP = gx + (fG / fMax) * gw;\n    ctx.beginPath(); ctx.moveTo(xP, gy); ctx.lineTo(xP, gy + gh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'center';\n    ctx.fillText(fG + 'kHz', xP, gy + gh + 15);\n  }\n  for (var dbG = 0; dbG >= minDb; dbG -= 20) {\n    var yP = gy + (dbG / minDb) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yP); ctx.lineTo(gx + gw, yP); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'right';\n    ctx.fillText(dbG + 'dB', gx - 6, yP + 4);\n  }\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  var y3dB = gy + (-3.01 / minDb) * gh;\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.5)';\n  ctx.beginPath(); ctx.moveTo(gx, y3dB); ctx.lineTo(gx + gw, y3dB); ctx.stroke();\n  var fcX = gx + (fc / fMax) * gw;\n  ctx.beginPath(); ctx.moveTo(fcX, gy); ctx.lineTo(fcX, gy + gh); ctx.stroke();\n  ctx.restore();\n\n  for (var sIdx = 0; sIdx < M; sIdx++) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';\n    ctx.lineWidth = 1.3;\n    ctx.beginPath();\n    for (var xPx = 0; xPx <= gw; xPx += 3) {\n      var u = ((xPx / gw) * fMax) / fc;\n      var mag = 1 / Math.hypot(1 - u * u, dList[sIdx] * u);\n      var db = Math.max(minDb, 20 * Math.log10(Math.max(1e-6, mag)));\n      var yPl = gy + (db / minDb) * gh;\n      if (xPx === 0) ctx.moveTo(gx + xPx, yPl); else ctx.lineTo(gx + xPx, yPl);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (var xPx = 0; xPx <= gw; xPx += 2) {\n    var u = ((xPx / gw) * fMax) / fc;\n    var totMag = 1;\n    for (var sIdx = 0; sIdx < M; sIdx++) {\n      totMag *= 1 / Math.hypot(1 - u * u, dList[sIdx] * u);\n    }\n    var db = Math.max(minDb, 20 * Math.log10(Math.max(1e-6, totMag)));\n    var yPl = gy + (db / minDb) * gh;\n    if (xPx === 0) ctx.moveTo(gx + xPx, yPl); else ctx.lineTo(gx + xPx, yPl);\n  }\n  ctx.stroke();\n\n  var fcMag = 1;\n  for (var sIdx = 0; sIdx < M; sIdx++) fcMag *= 1 / Math.hypot(0, dList[sIdx]);\n  var fcDb = 20 * Math.log10(fcMag);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.fillText('对数幅频响应 (虚线=单级二阶单元，绿线=级联总响应)', gx, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('-3dB 线', gx + 4, y3dB - 4);\n\n  lab.setReadout('级联二阶单元: ' + M + ' 级 | 等效储能元件: ' + totalPoles + ' 个 | 极点总数: ' + totalPoles + ' 个 (分母为 s^' + totalPoles + ' 多项式) | fc 处总衰减: ' + fcDb.toFixed(1) + ' dB');\n}\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "四步口诀记牢：元件变 s 域（R, sL, 1/sC）→ 欧姆定律列 H(s) → 化为有理多项式分式 → 求根拆解为零极点。",
        "只有“储能元件”才产生极点：电路中有几个独立的电容和电感，分母最高次幂和极点个数就是几；电阻只调节阻尼（让极点左右移动或分裂），从不增加极点。",
        "高阶滤波器不要硬解高次方程：利用二阶级联把 2 极点单元串成 4、6、8 极点系统，且级联时不能简单复制完全相同的参数（会导致通带提前塌陷），而应像巴特沃斯滤波器那样交错排布极点。"
      ]
    }
  ]
});
