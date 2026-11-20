window.__BOOK_REGISTER_SECTION__("sec_176", {
  "title": "利用可分离性实现快速二维卷积 (Convolution by Separability)",
  "intuition": "把二维滤波核拆成横、竖两条一维投影，先卷行再卷列，结果完全一致却能把大核运算速度提升成百上千倍。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是“可分离”点扩散函数（PSF）？",
      "paragraphs": [
        "在二维图像处理中，如果一个二维点扩散函数（PSF）可以分解为两个一维信号——**垂直投影** `vert[r]` 与**水平投影** `horz[c]` 的外积，我们就称这个核是**可分离的（Separable）**。",
        "并不是所有图像或滤波器都满足这个条件。比如理想圆形平滑核（**药盒函数 Pillbox**）就**不可分离**。但通过任意组合水平和垂直的一维曲线，我们能构造出无穷多种可分离 PSF。例如：用两条矩形脉冲可以拼出正方形/矩形 PSF（见原书 Fig. 24-5）；用两条**双边指数衰减曲线**相乘，则会生成一张从中心向四周衰减的**菱形 PSF**（见原书 Fig. 24-6）。",
        "工程中最常追问的一个问题是：既然理想滤波希望各方向均匀（圆对称），那么**有没有既圆对称又可分离的 PSF**？答案是：**有，而且全宇宙只有唯一一个——二维高斯函数（Gaussian）**。二维高斯核可以完美分解为两个具有**相同标准差**的一维高斯投影，这也正是高斯滤波在图像领域长盛不衰的根本原因。"
      ],
      "formula": {
        "expr": "x[r, c] = vert[r] × horz[c]",
        "explain": "x[r, c] 表示二维 PSF 第 r 行第 c 列的像素权重；vert[r] 是第 r 行的垂直一维投影值；horz[c] 是第 c 列的水平一维投影值。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：一维投影合成二维 PSF 与圆对称性验证",
      "instruction": "切换投影类型（1 矩形 / 2 双边指数 / 3 高斯）并拖动宽度参数，观察一维曲线如何乘出正方形、菱形与圆形高斯核，以及 0° 轴向与 45° 对角衰减曲线何时彻底重合。",
      "controls": [
        {
          "type": "slider",
          "id": "mode",
          "label": "投影类型 (1矩形 2双边指数 3高斯)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "spread",
          "label": "核宽度 / 衰减参数",
          "min": 1,
          "max": 4.5,
          "step": 0.1,
          "value": 2.2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showCircle",
          "label": "叠加圆对称参考线",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar G = 13, half = 6;\nfunction getVal(d, mode, spread) {\n  if (mode === 1) {\n    var w = Math.max(1, Math.min(5, Math.round(spread)));\n    return Math.abs(d) <= w ? 1.0 : 0.0;\n  } else if (mode === 2) {\n    var tau = spread * 0.85;\n    return Math.exp(-Math.abs(d) / tau);\n  } else {\n    var sig = spread * 0.9;\n    return Math.exp(-(d * d) / (2 * sig * sig));\n  }\n}\nfunction draw() {\n  var mode = Math.round(lab.values.mode);\n  var spread = lab.values.spread;\n  var showCircle = !!lab.values.showCircle;\n  ctx.clearRect(0, 0, W, H);\n  var p = [];\n  for (var i = 0; i < G; i++) p.push(getVal(i - half, mode, spread));\n  var cell = 12, gx = 96, gy = 62;\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('horz[c]', gx, 16);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(gx, 20, G * cell, 34);\n  ctx.beginPath();\n  for (var c = 0; c < G; c++) {\n    var px = gx + (c + 0.5) * cell;\n    var py = 54 - p[c] * 30;\n    if (c === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.stroke();\n  for (var c = 0; c < G; c++) {\n    var px = gx + (c + 0.5) * cell;\n    var py = 54 - p[c] * 30;\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(px - 2, py - 2, 4, 4);\n  }\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('vert[r]', 14, gy + 10);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(48, gy, 38, G * cell);\n  ctx.beginPath();\n  for (var r = 0; r < G; r++) {\n    var vx = 86 - p[r] * 34;\n    var vy = gy + (r + 0.5) * cell;\n    if (r === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.stroke();\n  for (var r = 0; r < G; r++) {\n    var vx = 86 - p[r] * 34;\n    var vy = gy + (r + 0.5) * cell;\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(vx - 2, vy - 2, 4, 4);\n  }\n  for (var r = 0; r < G; r++) {\n    for (var c = 0; c < G; c++) {\n      var v = p[r] * p[c];\n      var b = Math.round(18 + v * 235);\n      ctx.fillStyle = 'rgb(' + Math.round(14 + v * 230) + ',' + Math.round(22 + v * 228) + ',' + b + ')';\n      ctx.fillRect(gx + c * cell, gy + r * cell, cell - 0.5, cell - 0.5);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(gx, gy, G * cell, G * cell);\n  if (showCircle) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.arc(gx + 6.5 * cell, gy + 6.5 * cell, 3.6 * cell, 0, Math.PI * 2);\n    ctx.stroke();\n    ctx.restore();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('x[r,c] = vert[r] × horz[c]', gx + 4, 232);\n  var cx = 385, cy = 180;\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('3D PSF 表面形貌', 338, 20);\n  for (var r = 0; r < G; r++) {\n    ctx.beginPath();\n    for (var c = 0; c < G; c++) {\n      var u = r - half, wv = c - half, z = p[r] * p[c];\n      var sx = cx + (wv - u) * 7.8;\n      var sy = cy + (wv + u) * 3.9 - z * 86;\n      if (c === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.strokeStyle = r === half ? '#f59e0b' : 'rgba(56, 189, 248, 0.55)';\n    ctx.lineWidth = r === half ? 1.6 : 1;\n    ctx.stroke();\n  }\n  for (var c = 0; c < G; c++) {\n    ctx.beginPath();\n    for (var r = 0; r < G; r++) {\n      var u = r - half, wv = c - half, z = p[r] * p[c];\n      var sx = cx + (wv - u) * 7.8;\n      var sy = cy + (wv + u) * 3.9 - z * 86;\n      if (r === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.strokeStyle = c === half ? '#10b981' : 'rgba(248, 250, 252, 0.45)';\n    ctx.lineWidth = c === half ? 1.6 : 1;\n    ctx.stroke();\n  }\n  var ax = 515, ay = 46, aw = 185, ah = 145;\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('径向对称性验证 (0° vs 45°)', ax, 20);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(ax, ay, aw, ah);\n  for (var g = 1; g < 4; g++) {\n    ctx.beginPath();\n    ctx.moveTo(ax, ay + (ah * g) / 4);\n    ctx.lineTo(ax + aw, ay + (ah * g) / 4);\n    ctx.stroke();\n  }\n  var maxDiff = 0;\n  ctx.beginPath();\n  for (var k = 0; k <= 60; k++) {\n    var rad = (k / 60) * 6.0;\n    var valA = getVal(rad, mode, spread) * getVal(0, mode, spread);\n    var px = ax + (k / 60) * aw;\n    var py = ay + ah - valA * (ah - 10) - 4;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.stroke();\n  ctx.beginPath();\n  for (var k = 0; k <= 60; k++) {\n    var rad = (k / 60) * 6.0;\n    var valA = getVal(rad, mode, spread) * getVal(0, mode, spread);\n    var valD = Math.pow(getVal(rad / Math.SQRT2, mode, spread), 2);\n    var diff = Math.abs(valA - valD);\n    if (diff > maxDiff) maxDiff = diff;\n    var px = ax + (k / 60) * aw;\n    var py = ay + ah - valD * (ah - 10) - 4;\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.save();\n  ctx.setLineDash([5, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 0° 轴向', ax + 6, ay + ah + 18);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('-- 45° 对角', ax + 88, ay + ah + 18);\n  var names = ['', '矩形 (Box)', '双边指数 (Diamond)', '高斯 (Gaussian)'];\n  var symTxt = maxDiff < 0.01 ? '严格圆对称' : '非圆对称';\n  ctx.fillStyle = maxDiff < 0.01 ? '#10b981' : '#f59e0b';\n  ctx.fillText('判定: ' + symTxt + ' (偏差 ' + (maxDiff * 100).toFixed(1) + '%)', ax, ay + ah + 36);\n  lab.setReadout('投影: ' + names[mode] + ' | 宽度参数: ' + spread.toFixed(1) + ' | 0°与45°最大偏差: ' + (maxDiff * 100).toFixed(1) + '% (' + symTxt + ')');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "两步一维卷积：如何把算力消耗从 M² 降到 2M？",
      "paragraphs": [
        "可分离核的真正威力体现在快速卷积上。要将一幅图像与可分离核进行卷积，我们**不需要直接拿二维矩阵去滑窗**：",
        "1. **先做行卷积**：把原图的每一行分别与水平投影 `horz[c]` 做一维卷积，得到一张“水平方向模糊、垂直方向依然锐利”的**中间图像**。\n2. **再做列卷积**：把中间图像的每一列分别与垂直投影 `vert[r]` 做一维卷积，得到的最终图像**在数学上与直接二维卷积完全相同**（先卷列再卷行也完全等价）。",
        "让我们算一笔账：对于一张 `N × N` 的图像与一个 `M × M` 的滤波核，直接二维卷积每个输出像素都要乘加核内全部 `M²` 个像素，总耗时正比于 `N²M²`。而采用可分离卷积，每个像素只需横向做 `M` 次运算、纵向再做 `M` 次运算，总耗时仅正比于 `N²M`（具体为 `2N²M`）。当滤波核宽度达到几百像素时，计算时间能直接缩减**数百倍**！"
      ],
      "formula": {
        "expr": "T_direct ∝ N²M²   →   T_separable ∝ 2N²M",
        "explain": "N 为图像边长，M 为滤波器核边长。M 越大，可分离卷积相对于直接二维卷积的加速比（M / 2 倍）越惊人。"
      }
    },
    {
      "type": "concept",
      "heading": "终极加速：递归滤波 + 中心极限定理逼近高斯",
      "paragraphs": [
        "速度还能更快吗？**可以！** 如果你愿意放弃标准高斯核，改用**矩形 PSF**（对应第 15 章的**滑动平均滤波器**）或**双边指数 PSF**（对应第 19 章的**双向单极点滤波器**），那么横向与纵向的一维卷积都可以用**递归算法（Recursion）**实现。",
        "递归滤波每处理一个像素只需极其有限的几次加减或整数运算，**计算时间只正比于像素总数 N²，与滤波器核尺寸 M 完全无关！** 也就是说，哪怕你需要一个覆盖整张图五分之一的超大滤波核，处理一张 `512 × 512` 的图像在普通个人电脑上也只需几百毫秒。",
        "如果嫌矩形核或菱形核的形状不够圆润平滑怎么办？第 7 章的**中心极限定理（Central Limit Theorem）**给出了绝妙的工程解法：只需用矩形核（或双边指数核）对图像**连续卷积两到四次**，等效的滤波核就会迅速演化并极度逼近完美的**高斯 PSF**——既享有了高斯核的优良特性，又保持了与核尺寸无关的 `O(N²)` 极速！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 2：两步卷积流程、中心极限定理与算力加速比",
      "instruction": "调节图像尺寸 N、核宽度 M 与递归重复次数，观察左上角“行卷积→列卷积”的两步中间效果、左下角矩形核多次卷积逼近高斯的过程，以及右侧对数尺度下的运算量悬殊差距。",
      "controls": [
        {
          "type": "slider",
          "id": "imgN",
          "label": "图像边长 N (N×N 像素)",
          "min": 64,
          "max": 1024,
          "step": 64,
          "value": 512,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "psfM",
          "label": "滤波核宽度 M (M×M)",
          "min": 5,
          "max": 151,
          "step": 2,
          "value": 45,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "passes",
          "label": "递归滤波重复次数 (逼近高斯)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": " 次"
        },
        {
          "type": "toggle",
          "id": "anim",
          "label": "运行两步卷积扫描动画",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar S = 24;\nvar orig = [], interm = [], finalImg = [], cltKernel = [];\nfor (var r = 0; r < S; r++) {\n  orig[r] = [];\n  for (var c = 0; c < S; c++) {\n    var v = 0.08;\n    if (r >= 5 && r <= 18 && c >= 5 && c <= 18 && (Math.abs(r - 11.5) < 2 || Math.abs(c - 11.5) < 2)) v = 1.0;\n    if ((r - 6) * (r - 6) + (c - 6) * (c - 6) <= 4) v = 0.9;\n    if ((r - 17) * (r - 17) + (c - 17) * (c - 17) <= 4) v = 0.9;\n    orig[r][c] = v;\n  }\n}\nfunction recompute() {\n  var psfM = lab.values.psfM;\n  var passes = Math.round(lab.values.passes);\n  var rad = Math.max(1, Math.min(4, Math.round(psfM / 38)));\n  var tmp = [];\n  for (var r = 0; r < S; r++) tmp[r] = orig[r].slice();\n  for (var p = 0; p < passes; p++) {\n    var nxt = [];\n    for (var r = 0; r < S; r++) {\n      nxt[r] = [];\n      for (var c = 0; c < S; c++) {\n        var sum = 0, cnt = 0;\n        for (var k = -rad; k <= rad; k++) {\n          var cc = c + k;\n          if (cc >= 0 && cc < S) { sum += tmp[r][cc]; cnt++; }\n        }\n        nxt[r][c] = sum / cnt;\n      }\n    }\n    tmp = nxt;\n  }\n  interm = tmp;\n  var tmp2 = [];\n  for (var r = 0; r < S; r++) tmp2[r] = interm[r].slice();\n  for (var p = 0; p < passes; p++) {\n    var nxt2 = [];\n    for (var r = 0; r < S; r++) nxt2[r] = [];\n    for (var c = 0; c < S; c++) {\n      for (var r = 0; r < S; r++) {\n        var sum = 0, cnt = 0;\n        for (var k = -rad; k <= rad; k++) {\n          var rr = r + k;\n          if (rr >= 0 && rr < S) { sum += tmp2[rr][c]; cnt++; }\n        }\n        nxt2[r][c] = sum / cnt;\n      }\n    }\n    tmp2 = nxt2;\n  }\n  finalImg = tmp2;\n  var bw = 9;\n  var ker = [];\n  for (var i = 0; i < bw; i++) ker.push(1.0 / bw);\n  for (var p = 1; p < passes; p++) {\n    var out = [];\n    for (var i = 0; i < ker.length + bw - 1; i++) out.push(0);\n    for (var i = 0; i < ker.length; i++) {\n      for (var j = 0; j < bw; j++) out[i + j] += ker[i] / bw;\n    }\n    ker = out;\n  }\n  cltKernel = ker;\n}\nfunction drawImgBox(img, bx, by, size) {\n  var cs = size / S;\n  for (var r = 0; r < S; r++) {\n    for (var c = 0; c < S; c++) {\n      var v = Math.round(img[r][c] * 245);\n      ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + Math.min(255, v + 10) + ')';\n      ctx.fillRect(bx + c * cs, by + r * cs, cs + 0.3, cs + 0.3);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(bx, by, size, size);\n}\nfunction fmtOps(n) {\n  if (n >= 1e9) return (n / 1e9).toFixed(2) + '×10⁹';\n  if (n >= 1e6) return (n / 1e6).toFixed(2) + '×10⁶';\n  if (n >= 1e3) return (n / 1e3).toFixed(1) + '×10³';\n  return String(Math.round(n));\n}\nfunction render(timeSec) {\n  var N = lab.values.imgN;\n  var M = lab.values.psfM;\n  var passes = Math.round(lab.values.passes);\n  var anim = !!lab.values.anim;\n  ctx.clearRect(0, 0, W, H);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('1. 原图', 24, 24);\n  ctx.fillText('2. 仅行卷积', 102, 24);\n  ctx.fillText('3. 再列卷积', 190, 24);\n  drawImgBox(orig, 16, 32, 60);\n  drawImgBox(interm, 104, 32, 60);\n  drawImgBox(finalImg, 192, 32, 60);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('→', 82, 66);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('→', 170, 66);\n  if (anim) {\n    var phase = (timeSec * 0.55) % 2.0;\n    if (phase < 1.0) {\n      var yScan = 32 + phase * 60;\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(16, yScan); ctx.lineTo(76, yScan); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(104, yScan); ctx.lineTo(164, yScan); ctx.stroke();\n    } else {\n      var xScan = (phase - 1.0) * 60;\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(104 + xScan, 32); ctx.lineTo(104 + xScan, 92); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(192 + xScan, 32); ctx.lineTo(192 + xScan, 92); ctx.stroke();\n    }\n  }\n  ctx.lineWidth = 1;\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('× horz[c]', 16, 106);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('× vert[r]', 104, 106);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('等效二维核', 192, 106);\n  var kx = 16, ky = 128, kw = 236, kh = 92;\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('CLT: 矩形递归 ' + passes + ' 次 vs 理想高斯', kx, 122);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(kx, ky, kw, kh);\n  var kMax = 0;\n  for (var i = 0; i < cltKernel.length; i++) if (cltKernel[i] > kMax) kMax = cltKernel[i];\n  var len = cltKernel.length;\n  ctx.beginPath();\n  for (var i = 0; i < len; i++) {\n    var px = kx + 12 + (i / (len - 1)) * (kw - 24);\n    var py = ky + kh - 6 - (cltKernel[i] / kMax) * (kh - 18);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.stroke();\n  var mid = (len - 1) / 2;\n  var varSum = 0;\n  for (var i = 0; i < len; i++) varSum += cltKernel[i] * (i - mid) * (i - mid);\n  var sig = Math.sqrt(varSum);\n  ctx.beginPath();\n  for (var s = 0; s <= 60; s++) {\n    var u = (s / 60) * (len - 1) - mid;\n    var gVal = Math.exp(-(u * u) / (2 * sig * sig));\n    var px = kx + 12 + (s / 60) * (kw - 24);\n    var py = ky + kh - 6 - gVal * (kh - 18);\n    if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n  ctx.restore();\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(270, 14); ctx.lineTo(270, H - 14); ctx.stroke();\n  var bx = 286, bw = 414;\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('总运算量级对比 (对数刻度 10⁴ ~ 10¹¹, 越短越快)', bx, 24);\n  var opsDirect = N * N * M * M;\n  var opsSep = 2 * N * N * M;\n  var opsRec = passes * 4 * N * N;\n  var bars = [\n    { label: '直接二维卷积 N²M²', val: opsDirect, color: '#ec4899', y: 48 },\n    { label: '可分离两步 2N²M', val: opsSep, color: '#38bdf8', y: 100 },\n    { label: '递归滤波×' + passes + '次 O(N²)', val: opsRec, color: '#10b981', y: 152 }\n  ];\n  var minLog = 4.0, maxLog = 11.0;\n  for (var i = 0; i < bars.length; i++) {\n    var b = bars[i];\n    var lg = Math.max(minLog, Math.min(maxLog, Math.log10(b.val)));\n    var wBar = ((lg - minLog) / (maxLog - minLog)) * (bw - 10);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText(b.label, bx, b.y);\n    ctx.fillStyle = 'rgba(255,255,255,0.06)';\n    ctx.fillRect(bx, b.y + 6, bw - 10, 22);\n    ctx.fillStyle = b.color;\n    ctx.fillRect(bx, b.y + 6, wBar, 22);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText(fmtOps(b.val) + ' 次', bx + Math.min(wBar + 6, bw - 90), b.y + 21);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(bx, 198); ctx.lineTo(bx + bw - 10, 198); ctx.stroke();\n  for (var e = 4; e <= 11; e++) {\n    var tx = bx + ((e - minLog) / (maxLog - minLog)) * (bw - 10);\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText('10^' + e, tx - 10, 212);\n  }\n  var spSep = (opsDirect / opsSep).toFixed(1);\n  var spRec = (opsDirect / opsRec).toFixed(0);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('可分离提速: ' + spSep + '×   |   递归提速: ' + spRec + '× (与 M 无关!)', bx, 230);\n  lab.setReadout('图像 ' + N + '×' + N + ' | 核 ' + M + '×' + M + ' | 直接: ' + fmtOps(opsDirect) + ' | 可分离: ' + fmtOps(opsSep) + ' (' + spSep + '×加速) | 递归: ' + fmtOps(opsRec) + ' (' + spRec + '×加速)');\n}\nlab.onUpdate(function() { recompute(); render(0); });\nlab.onLoop(function(dt, t) { if (lab.values.anim) render(t); });\nrecompute();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑：在做行卷积后、列卷积前，中间图像必须使用浮点数或足够位宽的有符号缓冲保存，切勿提前截断到 0~255，否则会引入严重的舍入误差。",
        "唯一性结论：二维高斯核是自然界中唯一同时具备“圆对称性”和“可分离性”的 PSF；如果使用矩阵核或双边指数核，请留意 45° 对角线方向上的各向异性偏差（方块效应或菱形效应）。",
        "大核优化铁律：当核宽度 M > 15 时，永远不要写四重循环做直接二维卷积；先拆成 1D 行卷积 + 1D 列卷积（加速 M/2 倍），若对耗时极度敏感，直接上“3~4 次递归滑动平均”逼近高斯核，耗时与核大小彻底脱钩！"
      ]
    }
  ]
});
