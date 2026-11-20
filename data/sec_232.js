window.__BOOK_REGISTER_SECTION__("sec_232", {
  "title": "递归滤波器的频谱反转与相位陷阱 (Spectral Inversion)",
  "intuition": "想用“原信号减去滤波输出”把低通变成高通？如果滤波器带有相位延迟，正弦波相减非但不会抵消，反而可能把信号越减越大！",
  "blocks": [
    {
      "type": "concept",
      "heading": "把频率响应上下翻转：减法实现频谱反转",
      "paragraphs": [
        "在第 14 章讨论 FIR 滤波器时，我们学过一种叫**频谱反转 (Spectral Inversion)** 的技巧：把滤波器的频率响应上下翻转，通带变阻带、阻带变通带，从而把低通变成高通，或把带通变成带阻。",
        "在时域框图上，频谱反转的做法非常直观（对应原书图 33-5）：让输入信号 `x[n]` 分成两路，一路经过原滤波器系统，另一路直接直通（即**恒等系统 (Identity System)**，输出完全等于输入），最后**用原信号减去原系统的输出**：`y[n] = x[n] - y_orig[n]`。",
        "在 z 域里，这相当于将系统 `H(z)` 与恒等系统 `1` 并联后做减法。套用递归滤波器的差分方程（在本书符号体系中，`a` 为前馈输入系数，`b` 为反馈输出系数），可以推导出转换公式：反馈系数 `b` 保持不变，只需按下面公式修改前馈系数 `a` 即可完成频谱反转。"
      ],
      "formula": {
        "expr": "a₀' = 1 - a₀ ;  aₖ' = -aₖ - bₖ  (k = 1, 2, 3, ...)",
        "explain": "推导源自 1 - A(z)/(1 - B(z)) = [1 - B(z) - A(z)] / (1 - B(z))。等号左侧带撇的 roman 字母为反转后的新系数，右侧为原滤波器系数：第 0 阶前馈系数用 1 减去原 a₀，其余高阶前馈系数均变为 -aₖ - bₖ，而所有反馈系数 bₖ 保持不变。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：希尔伯特变换器陷阱——为什么等幅波相减不会归零？",
      "instruction": "拖动「相移 φ」滑块至 90°（即希尔伯特变换器），观察左图矢量相减与右图波形叠加，并点击播放按钮对比“原始输入”与“反转输出”的响度差异。",
      "controls": [
        {
          "type": "slider",
          "id": "mag",
          "label": "原系统幅值 |H|",
          "min": 0,
          "max": 1.5,
          "step": 0.05,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "原系统相移 φ",
          "min": -180,
          "max": 180,
          "step": 5,
          "value": 90,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "listenOrig",
          "label": "试听切换（开=听原输入 / 关=听反转输出）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar osc = null;\nvar gainNode = null;\nvar currentTimeSec = 0;\n\nfunction syncAudio() {\n  try {\n    var v = lab.values;\n    var phi = v.phase * Math.PI / 180;\n    var yx = 1 - v.mag * Math.cos(phi);\n    var yy = -v.mag * Math.sin(phi);\n    var invMag = Math.hypot(yx, yy);\n    var targetAmp = v.listenOrig ? 1.0 : invMag;\n    var targetGain = Math.min(0.16 * targetAmp, 0.45);\n    if (v.play) {\n      var ac = lab.getAudioContext();\n      if (ac.state === 'suspended') { ac.resume(); }\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        osc.type = 'sine';\n        osc.frequency.setValueAtTime(293.66, ac.currentTime);\n        gainNode.gain.setValueAtTime(0.0001, ac.currentTime);\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      gainNode.gain.setTargetAtTime(targetGain, ac.currentTime, 0.03);\n    } else if (osc && gainNode) {\n      var ac2 = lab.getAudioContext();\n      gainNode.gain.setTargetAtTime(0.0001, ac2.currentTime, 0.02);\n      var oldOsc = osc;\n      osc = null;\n      gainNode = null;\n      setTimeout(function() { try { oldOsc.stop(); oldOsc.disconnect(); } catch(e) {} }, 60);\n    }\n  } catch (e) {}\n}\n\nfunction drawScene(tSec) {\n  var v = lab.values;\n  var mag = v.mag;\n  var phiDeg = v.phase;\n  var phi = phiDeg * Math.PI / 180;\n  var hx = mag * Math.cos(phi);\n  var hy = mag * Math.sin(phi);\n  var yx = 1 - hx;\n  var yy = -hy;\n  var invMag = Math.hypot(yx, yy);\n  var invPhaseDeg = Math.atan2(yy, yx) * 180 / Math.PI;\n  var naiveMag = Math.abs(1 - mag);\n\n  lab.setReadout(\n    '天真幅值预测 |1 - |H|| = ' + naiveMag.toFixed(2) +\n    '   |   真实反转幅值 |1 - H| = ' + invMag.toFixed(3) +\n    ' (相位 ' + invPhaseDeg.toFixed(1) + '°)' +\n    (invMag > 1.001 ? '  ⚠ 输出反而被放大！' : (invMag < 0.01 ? '  ✓ 完全抵消' : ''))\n  );\n\n  ctx.clearRect(0, 0, W, H);\n\n  var cx = 122;\n  var cy = 124;\n  var R = 58;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.moveTo(cx - R * 1.4, cy);\n  ctx.lineTo(cx + R * 1.4, cy);\n  ctx.moveTo(cx, cy - R * 1.4);\n  ctx.lineTo(cx, cy + R * 1.4);\n  ctx.stroke();\n\n  function drawArrow(x1, y1, x2, y2, color, width, dashed) {\n    var dx = x2 - x1;\n    var dy = y2 - y1;\n    var len = Math.hypot(dx, dy);\n    if (len < 1) return;\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = width;\n    if (dashed) ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    ctx.moveTo(x1, y1);\n    ctx.lineTo(x2, y2);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    var ang = Math.atan2(dy, dx);\n    var head = 7;\n    ctx.beginPath();\n    ctx.moveTo(x2, y2);\n    ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));\n    ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));\n    ctx.closePath();\n    ctx.fill();\n    ctx.restore();\n  }\n\n  var p1x = cx + R;\n  var p1y = cy;\n  var phx = cx + R * hx;\n  var phy = cy - R * hy;\n  var pyx = cx + R * yx;\n  var pyy = cy - R * yy;\n\n  drawArrow(cx, cy, p1x, p1y, '#38bdf8', 2.5, false);\n  drawArrow(cx, cy, phx, phy, '#f59e0b', 2.5, false);\n  drawArrow(phx, phy, p1x, p1y, 'rgba(236,72,153,0.45)', 1.5, true);\n  drawArrow(cx, cy, pyx, pyy, '#ec4899', 2.8, false);\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('复平面矢量相减: Y = 1 - H', 24, 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('1 (原信号)', p1x - 16, p1y + 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('H', phx + (hx >= 0 ? 6 : -16), phy + (hy >= 0 ? -6 : 14));\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('1-H', pyx + (yx >= 0 ? 6 : -26), pyy + (yy >= 0 ? -6 : 16));\n\n  var wx = 268;\n  var ww = 432;\n  var wy = 124;\n  var ampScale = 38;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(wx, 34);\n  ctx.lineTo(wx, 214);\n  ctx.moveTo(wx, wy);\n  ctx.lineTo(wx + ww, wy);\n  ctx.moveTo(wx, wy - ampScale);\n  ctx.lineTo(wx + ww, wy - ampScale);\n  ctx.moveTo(wx, wy + ampScale);\n  ctx.lineTo(wx + ww, wy + ampScale);\n  ctx.stroke();\n\n  var shift = tSec * 3.5;\n  var cycles = 2.6 * Math.PI * 2;\n\n  function plotWave(color, width, fn) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    ctx.beginPath();\n    for (var i = 0; i <= 180; i++) {\n      var u = i / 180;\n      var px = wx + u * ww;\n      var ang = u * cycles - shift;\n      var val = fn(ang);\n      var py = wy - val * ampScale;\n      if (py < 24) py = 24;\n      if (py > 224) py = 224;\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  plotWave('#38bdf8', 1.8, function(a) { return Math.sin(a); });\n  plotWave('#f59e0b', 1.8, function(a) { return mag * Math.sin(a + phi); });\n  plotWave('#ec4899', 2.8, function(a) { return Math.sin(a) - mag * Math.sin(a + phi); });\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 输入 x[n]', wx + 8, 22);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('— 滤波输出 H·x[n]', wx + 100, 22);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('— 相减结果 y[n] = x[n] - 输出', wx + 235, 22);\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawScene(currentTimeSec);\n});\n\nlab.onLoop(function(dt, tSec) {\n  currentTimeSec = tSec;\n  drawScene(tSec);\n});"
    },
    {
      "type": "concept",
      "heading": "罪魁祸首是相位响应：零相位 FIR 与递归 IIR 的天壤之别",
      "paragraphs": [
        "为什么第 14 章的 FIR 滤波器做频谱反转效果极佳，而递归滤波器（如巴特沃斯低通）一反转就面目全非？答案在于经常被初学者忽略的**相位响应 (Phase Response)**。",
        "拿一个理想**希尔伯特变换器 (Hilbert Transformer)** 举例：它在全频段幅值响应恒为 `1`，但相位恒定滞后 `90°`。如果我们只看幅值就天真地认为 `1 - 1 = 0`，那就大错特错了——只有**幅值相等且相位相同**的两个正弦波才能精确抵消。90° 相差意味着在复平面上做直角矢量相减，结果幅值不是 0，而是 `√2 ≈ 1.414`，相位为 `-45°`！输出比原输入还要大。",
        "第 14 章的线性相位 FIR 卷积核具有**左右对称性**，移除了整数延迟后等同于**零相位 (Zero Phase)** 系统：没有相移干扰，矢量减法退化成纯实数幅值减法 `1 - |H(f)|`，所以频谱能完美翻转。而递归滤波器（IIR）天然带有剧烈的相位滞后——例如 6 阶巴特沃斯低通滤波器在通带边缘附近相位会穿过 `-180°`（正弦波完全反相），此时“减去一个反相信号”等价于**把两个波直接相加**，导致幅频响应暴涨冲向 `2.0`！相比之下，陷波器 (Notch) 反转成带通滤波器稍好一些，因为在阻带中心幅值为 0、远离中心相位接近 0°，仅在过渡斜坡处因相移使峰值不如原陷波器那么尖锐。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：复现原书图 33-6——巴特沃斯低通与陷波器的反转对比",
      "instruction": "观察 6 阶低通反转后在通带边缘鼓起接近 2.0 的畸变峰；尝试打开「理想零相位」或切换至「陷波器」模式对比差异。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "截止 / 中心频率 fc",
          "min": 0.08,
          "max": 0.42,
          "step": 0.01,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "order",
          "label": "滤波器阶数 / 陡度",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 6,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "notchMode",
          "label": "切换为陷波器 (Notch → Band-pass)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "zeroPhase",
          "label": "开启理想零相位 (对比对称 FIR)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction evalFilter(f, fc, order, isNotch) {\n  if (f <= 0) return { hr: 1, hi: 0 };\n  if (f >= 0.4999) f = 0.4999;\n  var wc = Math.tan(Math.PI * fc);\n  var om = Math.tan(Math.PI * f);\n  if (isNotch) {\n    var Q = 1.2 + order * 1.6;\n    var num = wc * wc - om * om;\n    var denR = num;\n    var denI = (wc * om) / Q;\n    var den2 = denR * denR + denI * denI;\n    return { hr: (num * denR) / den2, hi: (-num * denI) / den2 };\n  } else {\n    var hr = 1;\n    var hi = 0;\n    for (var k = 0; k < order; k++) {\n      var ang = Math.PI * (0.5 + (2 * k + 1) / (2 * order));\n      var sr = wc * Math.cos(ang);\n      var si = wc * Math.sin(ang);\n      var nr = -sr;\n      var ni = -si;\n      var dr = -sr;\n      var di = om - si;\n      var d2 = dr * dr + di * di;\n      var fr = (nr * dr + ni * di) / d2;\n      var fi = (ni * dr - nr * di) / d2;\n      var nhr = hr * fr - hi * fi;\n      var nhi = hr * fi + hi * fr;\n      hr = nhr;\n      hi = nhi;\n    }\n    return { hr: hr, hi: hi };\n  }\n}\n\nfunction draw() {\n  var v = lab.values;\n  var fc = v.cutoff;\n  var order = v.order;\n  var isNotch = v.notchMode;\n  var zeroPhase = v.zeroPhase;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var N = 240;\n  var freqs = [];\n  var origMag = [];\n  var origHr = [];\n  var origHi = [];\n  var invReal = [];\n  var invIdeal = [];\n\n  var maxInv = 0;\n  var maxInvF = 0;\n  var phase180F = -1;\n\n  for (var i = 0; i <= N; i++) {\n    var f = 0.5 * i / N;\n    var res = evalFilter(f, fc, order, isNotch);\n    var mag = Math.hypot(res.hr, res.hi);\n    var ideal = Math.abs(1 - mag);\n    var act = zeroPhase ? ideal : Math.hypot(1 - res.hr, -res.hi);\n    freqs.push(f);\n    origMag.push(mag);\n    origHr.push(res.hr);\n    origHi.push(res.hi);\n    invReal.push(act);\n    invIdeal.push(ideal);\n    if (act > maxInv) { maxInv = act; maxInvF = f; }\n    if (!isNotch && i > 0 && phase180F < 0 && res.hr < 0 && origHi[i - 1] <= 0 && res.hi > 0) {\n      phase180F = f;\n    }\n  }\n\n  if (!isNotch && phase180F < 0) {\n    for (var j = 1; j <= N; j++) {\n      if (origHr[j] < 0 && origHi[j - 1] >= 0 && origHi[j] < 0) {\n        phase180F = freqs[j];\n        break;\n      }\n    }\n  }\n\n  var readoutStr = (isNotch ? '陷波 → 带通' : order + '阶巴特沃斯低通 → 高通') +\n    '   |   模式: ' + (zeroPhase ? '理想零相位 (绿色)' : '真实递归相位 (粉色)') +\n    '   |   反转后峰值: ' + maxInv.toFixed(2) + ' (f=' + maxInvF.toFixed(2) + ')';\n  if (!isNotch && !zeroPhase && maxInv > 1.15) {\n    readoutStr += '  ⚠ 相移反相导致严重过冲！';\n  }\n  lab.setReadout(readoutStr);\n\n  function drawPanel(gx, gy, gw, gh, title) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = 'rgba(248,250,252,0.55)';\n    for (var yTick = 0; yTick <= 4; yTick++) {\n      var val = yTick * 0.5;\n      var py = gy + gh * (1 - val / 2.0);\n      ctx.beginPath();\n      ctx.moveTo(gx, py);\n      ctx.lineTo(gx + gw, py);\n      ctx.stroke();\n      ctx.fillText(val.toFixed(1), gx - 24, py + 4);\n    }\n    for (var xTick = 0; xTick <= 5; xTick++) {\n      var fv = xTick * 0.1;\n      var px = gx + gw * (fv / 0.5);\n      ctx.beginPath();\n      ctx.moveTo(px, gy);\n      ctx.lineTo(px, gy + gh);\n      ctx.stroke();\n      ctx.fillText(fv === 0 ? '0' : fv.toFixed(1), px - 7, gy + gh + 14);\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.strokeRect(gx, gy, gw, gh);\n    ctx.font = '12px sans-serif';\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText(title, gx, gy - 8);\n    ctx.fillStyle = 'rgba(248,250,252,0.5)';\n    ctx.fillText('归一化频率 f', gx + gw * 0.36, gy + gh + 27);\n  }\n\n  var gx1 = 44;\n  var gx2 = 406;\n  var gy = 26;\n  var gw = 290;\n  var gh = 176;\n\n  drawPanel(gx1, gy, gw, gh, isNotch ? '原陷波器 |H(f)|' : '原 ' + order + ' 阶低通 |H(f)|');\n  drawPanel(gx2, gy, gw, gh, zeroPhase ? '零相位反转 |1 - |H|| (理想)' : '递归反转结果 |1 - H(f)|');\n\n  function plotCurve(gx, arr, color, width, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    if (dashed) ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (var i = 0; i <= N; i++) {\n      var px = gx + gw * (freqs[i] / 0.5);\n      var val = Math.min(2.08, Math.max(-0.02, arr[i]));\n      var py = gy + gh * (1 - val / 2.0);\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  plotCurve(gx1, origMag, '#38bdf8', 2.4, false);\n\n  if (!zeroPhase) {\n    plotCurve(gx2, invIdeal, 'rgba(16,185,129,0.55)', 1.8, true);\n    plotCurve(gx2, invReal, '#ec4899', 2.6, false);\n  } else {\n    plotCurve(gx2, invReal, '#10b981', 2.6, false);\n  }\n\n  if (!isNotch && !zeroPhase && maxInv > 1.15) {\n    var pkX1 = gx1 + gw * (maxInvF / 0.5);\n    var pkX2 = gx2 + gw * (maxInvF / 0.5);\n    var pkY2 = gy + gh * (1 - Math.min(2.05, maxInv) / 2.0);\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(pkX1, gy);\n    ctx.lineTo(pkX1, gy + gh);\n    ctx.moveTo(pkX2, gy);\n    ctx.lineTo(pkX2, gy + gh);\n    ctx.stroke();\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(pkX2, pkY2, 4, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '11px sans-serif';\n    ctx.fillText('反相相加峰值 ' + maxInv.toFixed(2), Math.min(pkX2 - 36, gx2 + gw - 115), Math.max(gy + 14, pkY2 - 8));\n    ctx.restore();\n  }\n\n  ctx.font = '11px sans-serif';\n  if (!zeroPhase) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('--- 零相位理想曲线', gx2 + 165, gy + 16);\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "千万别直接对 IIR 低通滤波器做频谱反转来求高通：虽然方程 33-6 在代数上只需修改前馈系数（a₀' = 1 - a₀，aₖ' = -aₖ - bₖ），但 IIR 的非线性相移会在截止频率附近引发严重反相相加，导致幅频响应出现接近 2.0 的巨大畸变峰。",
        "记忆铁律：两个正弦波只有在【幅值相等且相位相同】时相减才等于 0；若存在 90° 相移（如希尔伯特变换器），相减结果的幅值是 √2 倍；若存在 180° 相移，相减直接变成 2 倍叠加。",
        "工程正确姿势：若需要高通、带通或带阻 IIR 滤波器，请直接在 s 域/z 域通过标准频带变换重新设计递归系数；只有左右对称的零相位 FIR 卷积核，才适合直接用“单位脉冲减去原核”做频谱反转。"
      ]
    }
  ]
});
