window.__BOOK_REGISTER_SECTION__("sec_182", {
  "title": "采样间距与采样孔径 (Sample Spacing and Sampling Aperture)",
  "intuition": "数字图像的最终清晰度由两个关卡共同决定：传感器像素有多“糊”（采样孔径），以及像素格子有多“稀”（采样间距）。只要数一数边缘斜坡上落了几个像素，就能立刻判断系统瓶颈到底卡在哪一关。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、两种极端探测器：像素究竟是如何“吃光”的？",
      "paragraphs": [
        "在图像采集系统中（例如 CCD 相机），传感器表面由一个个离散的像素格组成。假设每个像素的中心距离为 **采样间距 (Sample Spacing)**，而单个像素实际接收光线的灵敏度分布范围称为 **采样孔径 (Sampling Aperture)**。原书图 25-6 对比了两种极具代表性的极端模型：",
        "1. **理想探测器 (Perfect Detector)**：采样孔径恰好是一个与像素格子完全重合的正方形，即 **采样孔径 = 采样间距**。落在某个像素方格内的光子只贡献给该像素，相邻像素之间**零重叠、零串扰**，所有入射光都被充分利用。这在工程上是理想的光电转换状态。",
        "2. **模糊探测器 (Blurry Detector)**：采样孔径远大于采样间距，通常呈现一个**高斯分布 (Gaussian distribution)**。从输出端视角来看，每个像素都会“偷吃”周围邻近区域的光线（这正是二维卷积的输出视角）；等价地，从输入端来看，一束极细的激光打在传感器上，会同时让周围一圈多个像素都产生数值响应。"
      ],
      "formula": {
        "expr": "y[n] = ∫ I(x) · h(n·Δx - x) dx",
        "explain": "I(x) 是到达传感器表面的连续真实光学图像；h(x) 是单个像素的采样孔径灵敏度函数（方窗或高斯函数）；Δx 是像素间的采样间距；y[n] 就是第 n 个像素最终读出的离散数字灰度值。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：孔径形状、边缘相位与阶跃响应（复刻图 25-6）",
      "instruction": "拖动「高斯孔径 σ」观察采样光斑如何变模糊、连续边缘斜坡如何变缓；再拖动「边缘位置偏移」，体验同一个光学边缘落在像素中心 vs 跨在像素之间时，斜坡上采样点个数的变化。",
      "controls": [
        {
          "type": "slider",
          "id": "blur",
          "label": "高斯孔径 σ (0=理想方孔)",
          "min": 0,
          "max": 2,
          "step": 0.1,
          "value": 0,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "edgeShift",
          "label": "边缘位置偏移 (相位)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.5,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "showCurve",
          "label": "显示连续底层边缘曲线",
          "value": true
        }
      ],
      "jsCode": "function erf(x) {\n  var sign = x >= 0 ? 1 : -1;\n  x = Math.abs(x);\n  var t = 1 / (1 + 0.3275911 * x);\n  var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);\n  return sign * y;\n}\n\nfunction edgeCurve(x, edgeX, blur) {\n  if (blur <= 0.01) {\n    var d = x - edgeX + 0.5;\n    if (d <= 0) return 25;\n    if (d >= 1) return 75;\n    return 25 + 50 * d;\n  }\n  return 50 + 25 * erf((x - edgeX) / (blur * Math.SQRT2));\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var blur = lab.values.blur;\n  var shift = lab.values.edgeShift;\n  var showCurve = lab.values.showCurve;\n  var edgeX = 6.0 + shift;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var gx0 = 26, gy0 = 32, cell = 24, cols = 7, rows = 7;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(blur <= 0.01 ? 'a. 理想方形孔径 (无串扰)' : 'e. 高斯模糊孔径 (σ=' + blur.toFixed(1) + ')', gx0, 18);\n\n  var cx = gx0 + 3.5 * cell;\n  var cy = gy0 + 3.5 * cell;\n  if (blur <= 0.01) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(gx0 + 3 * cell, gy0 + 3 * cell, cell, cell);\n  } else {\n    var rad = Math.max(cell * 0.7, blur * cell * 2.1);\n    var grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);\n    grad.addColorStop(0, 'rgba(16, 185, 129, 0.95)');\n    grad.addColorStop(0.45, 'rgba(16, 185, 129, 0.42)');\n    grad.addColorStop(1, 'rgba(16, 185, 129, 0)');\n    ctx.fillStyle = grad;\n    ctx.beginPath();\n    ctx.arc(cx, cy, rad, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= cols; i++) {\n    ctx.beginPath();\n    ctx.moveTo(gx0 + i * cell, gy0);\n    ctx.lineTo(gx0 + i * cell, gy0 + rows * cell);\n    ctx.stroke();\n  }\n  for (var j = 0; j <= rows; j++) {\n    ctx.beginPath();\n    ctx.moveTo(gx0, gy0 + j * cell);\n    ctx.lineTo(gx0 + cols * cell, gy0 + j * cell);\n    ctx.stroke();\n  }\n\n  var edgeGridX = gx0 + (3.5 + shift) * cell;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(edgeGridX, gy0 - 4);\n  ctx.lineTo(edgeGridX, gy0 + rows * cell + 4);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('光学边缘', edgeGridX - 22, gy0 + rows * cell + 18);\n\n  var px0 = 252, py0 = 28, pw = 442, ph = 175;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('边缘响应曲线 (蓝线=连续底层曲线 | 方块=像素采样值)', px0, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var p = 0; p <= 12; p++) {\n    var x = px0 + (p / 12) * pw;\n    ctx.beginPath();\n    ctx.moveTo(x, py0);\n    ctx.lineTo(x, py0 + ph);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(p), x - 3, py0 + ph + 14);\n  }\n  var yVals = [0, 25, 50, 75, 100];\n  for (var k = 0; k < yVals.length; k++) {\n    var v = yVals[k];\n    var y = py0 + ph - (v / 100) * ph;\n    ctx.beginPath();\n    ctx.moveTo(px0, y);\n    ctx.lineTo(px0 + pw, y);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(v), px0 - 22, y + 3);\n  }\n\n  var y30 = py0 + ph - 0.30 * ph;\n  var y70 = py0 + ph - 0.70 * ph;\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';\n  ctx.fillRect(px0, y70, pw, y30 - y70);\n\n  if (showCurve) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var s = 0; s <= 240; s++) {\n      var sx = (s / 240) * 12;\n      var sy = edgeCurve(sx, edgeX, blur);\n      var cxp = px0 + (sx / 12) * pw;\n      var cyp = py0 + ph - (sy / 100) * ph;\n      if (s === 0) ctx.moveTo(cxp, cyp);\n      else ctx.lineTo(cxp, cyp);\n    }\n    ctx.stroke();\n  }\n\n  var risingCount = 0;\n  for (var n = 0; n <= 12; n++) {\n    var val = edgeCurve(n, edgeX, blur);\n    var isRising = val > 27.5 && val < 72.5;\n    if (isRising) risingCount++;\n    var nx = px0 + (n / 12) * pw;\n    var ny = py0 + ph - (val / 100) * ph;\n    ctx.fillStyle = isRising ? '#f59e0b' : '#10b981';\n    ctx.fillRect(nx - 4, ny - 4, 8, 8);\n  }\n\n  var w1090 = blur <= 0.01 ? 0.8 : 2.563 * blur;\n  var posDesc = (Math.abs(shift - 0.5) < 0.08) ? '跨在两像素间' : (shift < 0.08 || shift > 0.92 ? '压在像素中心' : '偏心位置');\n  lab.setReadout('模式: ' + (blur <= 0.01 ? '理想方孔' : '高斯 σ=' + blur.toFixed(1)) + ' | 相位: ' + posDesc + ' | 处于上升沿的橙色样点: ' + risingCount + ' 个 | 10%-90% 宽度: ' + w1090.toFixed(2) + ' px');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "二、底层连续曲线与采样定理：谁在限制图像的 MTF？",
      "paragraphs": [
        "在实验 1 中，你一定注意到了一个关键事实：**蓝色连续曲线（底层曲线）的形状，完全且仅仅由“采样孔径”决定**；而像素网格的采样位置只能决定离散方块落在这条曲线的哪些位置上。因此，图像分辨率可能从两个方向被卡脖子：",
        "• **第一道瓶颈（孔径过大）**：如果采样孔径太宽，底层连续曲线本身就变成了一个平缓的“大斜坡”，高频细节在像素读取之前就已经被模糊抹平了。",
        "• **第二道瓶颈（间距过大）**：如果采样间距太大，即便底层曲线非常陡峭锐利，两个像素之间的微小细节也会在采样间隙中彻底漏掉，产生 **混叠失真 (Aliasing)**。",
        "用频域的 **调制传递函数 (MTF)** 和 **采样定理** 来审视这两种探测器，结论豁然开朗：对于理想正方形孔径，它在奈奎斯特频率 `f = 0.5`（每像素半个周期）处 MTF 仍然很高，这意味着大量高于 `0.5` 的高频成分会在采样瞬间发生混叠丢失——所以理想探测器主要受限于**采样间距**；而对于高斯模糊探测器，宽大的采样孔径本身就像一个**抗混叠低通滤波器 (Antialias Filter)**，在采样之前就把 `f > 0.5` 的频率几乎衰减为零！既然高频成分已经被孔径滤光归零，那么采样过程本身反而实现了“无损采样”，它的分辨率就 100% 受限于**采样孔径**。"
      ],
      "formula": {
        "expr": "f_nyquist = 1 / (2 · Δx) ,   MTF_gauss(f) = exp(-2π² · σ² · f²)",
        "explain": "f_nyquist 是采样系统能无混叠记录的最高空间频率（以物理单位 cycles/mm 计，等于归一化频率 0.5）。如果孔径的 MTF 在 f_nyquist 处已经趋近于 0，则采样零损失，瓶颈全在孔径；如果 MTF 在 f_nyquist 处依然很高，则越过界线的高频部分会发生混叠丢失。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：10%-90% 黄金判据与 MTF 频域混叠实验室",
      "instruction": "分别调节「10%-90% 边缘宽度 (物理孔径)」与「采样间距 Δx」，同步观察左图边缘斜坡上落入了几个样本，以及右图 MTF 曲线在奈奎斯特频率右侧会产生多少粉色混叠损失区。",
      "controls": [
        {
          "type": "slider",
          "id": "edgeW",
          "label": "10%-90% 边缘宽度 (孔径)",
          "min": 0.4,
          "max": 2.4,
          "step": 0.1,
          "value": 1,
          "unit": " mm"
        },
        {
          "type": "slider",
          "id": "dx",
          "label": "采样间距 Δx",
          "min": 0.15,
          "max": 1.5,
          "step": 0.05,
          "value": 0.6,
          "unit": " mm"
        },
        {
          "type": "toggle",
          "id": "showAlias",
          "label": "高亮混叠频率损失区 (f > f_nyq)",
          "value": true
        }
      ],
      "jsCode": "function erf(x) {\n  var sign = x >= 0 ? 1 : -1;\n  x = Math.abs(x);\n  var t = 1 / (1 + 0.3275911 * x);\n  var y = 1 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-x * x);\n  return sign * y;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var edgeW = lab.values.edgeW;\n  var dx = lab.values.dx;\n  var showAlias = lab.values.showAlias;\n  var sigma = edgeW / 2.5631;\n  var samplesPerEdge = edgeW / dx;\n  var fNyq = 0.5 / dx;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left Plot: Spatial Domain [-2.5, 2.5] mm\n  var lx0 = 38, ly0 = 32, lw = 295, lh = 170;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('空间域：10%-90% 边缘采样 (' + samplesPerEdge.toFixed(2) + ' 点/边缘)', lx0, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -2; g <= 2; g++) {\n    var gx = lx0 + ((g + 2.5) / 5.0) * lw;\n    ctx.beginPath();\n    ctx.moveTo(gx, ly0);\n    ctx.lineTo(gx, ly0 + lh);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(g + 'mm', gx - 10, ly0 + lh + 14);\n  }\n  for (var v = 0; v <= 100; v += 25) {\n    var gy = ly0 + lh - (v / 100) * lh;\n    ctx.beginPath();\n    ctx.moveTo(lx0, gy);\n    ctx.lineTo(lx0 + lw, gy);\n    ctx.stroke();\n  }\n\n  // 10%-90% width highlight\n  var xLeft = lx0 + ((-edgeW * 0.5 + 2.5) / 5.0) * lw;\n  var xRight = lx0 + ((edgeW * 0.5 + 2.5) / 5.0) * lw;\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';\n  ctx.fillRect(xLeft, ly0, xRight - xLeft, lh);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(xLeft, ly0); ctx.lineTo(xLeft, ly0 + lh);\n  ctx.moveTo(xRight, ly0); ctx.lineTo(xRight, ly0 + lh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Continuous curve\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var s = 0; s <= 150; s++) {\n    var xm = -2.5 + (s / 150) * 5.0;\n    var val = 25 + 50 * 0.5 * (1 + erf(xm / (sigma * Math.SQRT2)));\n    var cx = lx0 + ((xm + 2.5) / 5.0) * lw;\n    var cy = ly0 + lh - (val / 100) * lh;\n    if (s === 0) ctx.moveTo(cx, cy);\n    else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n\n  // Discrete samples\n  var kMin = Math.ceil(-2.5 / dx);\n  var kMax = Math.floor(2.5 / dx);\n  for (var k = kMin; k <= kMax; k++) {\n    var sxm = (k + 0.15) * dx;\n    if (sxm < -2.48 || sxm > 2.48) continue;\n    var sval = 25 + 50 * 0.5 * (1 + erf(sxm / (sigma * Math.SQRT2)));\n    var sxp = lx0 + ((sxm + 2.5) / 5.0) * lw;\n    var syp = ly0 + lh - (sval / 100) * lh;\n    var inside = Math.abs(sxm) <= edgeW * 0.5;\n    ctx.fillStyle = inside ? '#f59e0b' : '#10b981';\n    ctx.beginPath();\n    ctx.arc(sxp, syp, 3.8, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  // Right Plot: Frequency Domain MTF [0, 2.0] cycles/mm\n  var rx0 = 385, ry0 = 32, rw = 305, rh = 170, fMax = 2.0;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频域：MTF 曲线与奈奎斯特频率 (0 ~ 2.0 cyc/mm)', rx0, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var fi = 0; fi <= 4; fi++) {\n    var fv = fi * 0.5;\n    var fx = rx0 + (fv / fMax) * rw;\n    ctx.beginPath();\n    ctx.moveTo(fx, ry0);\n    ctx.lineTo(fx, ry0 + rh);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(fv.toFixed(1), fx - 7, ry0 + rh + 14);\n  }\n  for (var mi = 0; mi <= 2; mi++) {\n    var mv = mi * 0.5;\n    var my = ry0 + rh - mv * rh;\n    ctx.beginPath();\n    ctx.moveTo(rx0, my);\n    ctx.lineTo(rx0 + rw, my);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(mv.toFixed(1), rx0 - 22, my + 3);\n  }\n\n  // Shading aliasing zone f > fNyq\n  if (showAlias && fNyq < fMax) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';\n    ctx.beginPath();\n    var startX = rx0 + (fNyq / fMax) * rw;\n    ctx.moveTo(startX, ry0 + rh);\n    for (var ai = 0; ai <= 100; ai++) {\n      var af = fNyq + (ai / 100) * (fMax - fNyq);\n      var amtf = Math.exp(-2 * Math.PI * Math.PI * sigma * sigma * af * af);\n      ctx.lineTo(rx0 + (af / fMax) * rw, ry0 + rh - amtf * rh);\n    }\n    ctx.lineTo(rx0 + rw, ry0 + rh);\n    ctx.closePath();\n    ctx.fill();\n  }\n\n  // MTF curve\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var m = 0; m <= 160; m++) {\n    var mf = (m / 160) * fMax;\n    var mtf = Math.exp(-2 * Math.PI * Math.PI * sigma * sigma * mf * mf);\n    var mx = rx0 + (mf / fMax) * rw;\n    var myp = ry0 + rh - mtf * rh;\n    if (m === 0) ctx.moveTo(mx, myp);\n    else ctx.lineTo(mx, myp);\n  }\n  ctx.stroke();\n\n  // Nyquist line\n  if (fNyq <= fMax) {\n    var nx = rx0 + (fNyq / fMax) * rw;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([5, 3]);\n    ctx.beginPath();\n    ctx.moveTo(nx, ry0);\n    ctx.lineTo(nx, ry0 + rh);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('f_nyq=' + fNyq.toFixed(2), Math.min(nx + 4, rx0 + rw - 65), ry0 + 14);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('f_nyq=' + fNyq.toFixed(2) + ' (超出右界，无混叠)', rx0 + rw - 150, ry0 + 14);\n  }\n\n  var mtfNyq = Math.exp(-2 * Math.PI * Math.PI * sigma * sigma * fNyq * fNyq);\n  var verdict = samplesPerEdge < 1.0 ? '受限于【采样间距】(<1 点/边，存在严重混叠)' : (samplesPerEdge > 3.0 ? '受限于【采样孔径】(>3 点/边，近似无损采样)' : '受限于【孔径 + 间距】双重因素 (1~3 点/边)');\n  lab.setReadout('每边缘采样数: ' + samplesPerEdge.toFixed(2) + ' 点 | 奈奎斯特处 MTF: ' + (mtfNyq * 100).toFixed(1) + '% | 判定: ' + verdict);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、一线工程黄金法则：“小于 1”与“大于 3”的判据",
      "paragraphs": [
        "虽然从频域 MTF 积分和混叠去分析分辨率十分严谨，但在实际硬件选型与工程调试中，Steven Smith 总结出了一套极其简单好用的经验法则。假设你测出光学/成像系统的 **10%-90% 边缘响应宽度** 为 `W`（例如 `1 mm`）：",
        "• **每边缘采样数 < 1（采样间距 > W）**：系统分辨率完全受限于 **采样间距**。此时传感器像元太稀疏，提高镜头清晰度毫无意义，必须换用像素更密的探测器。",
        "• **每边缘采样数 > 3（采样间距 < W / 3）**：系统分辨率完全受限于 **采样孔径**。此时像素密度已经足够充裕（等效于超采样抗混叠），再盲目堆高像素数只会徒增数据量和算力负担，真正该优化的是镜头光学素质或传感器的像素串扰。",
        "• **每边缘采样数在 1 ~ 3 之间**：系统处于**双重受限**区间，采样孔径和采样间距共同影响最终成像清晰度——这也是绝大多数实用成像系统追求的性价比平衡点。"
      ],
      "formula": {
        "expr": "N_edge = W_10_90 / Δx",
        "explain": "N_edge 为跨越 10%-90% 边缘上升区间的像素个数；W_10_90 为系统边缘响应的 10%-90% 物理宽度；Δx 为相邻像素中心距。N_edge < 1 缺像素，N_edge > 3 糊镜头/糊孔径，1 ≤ N_edge ≤ 3 两者兼顾。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（盲目堆像素陷阱）：当系统处于「大于 3 个像素跨越一条边缘」的状态时，采样孔径已经充当了完美的抗混叠滤波器，此时强行把传感器像素密度翻倍，图像清晰度几乎不会有任何提升。",
        "避坑 2（单靠无串扰方孔的代价）：理想方形孔径虽然没有邻域串扰，但它的 MTF 在奈奎斯特频率 0.5 处依然很高，因此对高频细节一定会产生混叠锯齿或摩尔纹。",
        "核心结论：用 10%-90% 边缘宽度除以采样间距，记住「<1 看间距、>3 看孔径、1~3 两者皆限」的三段式判据，10 秒即可定位成像系统瓶颈。"
      ]
    }
  ]
});
