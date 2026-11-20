window.__BOOK_REGISTER_SECTION__("sec_173", {
  "title": "灰度变换与直方图均衡化 (Grayscale Transforms & Histogram Equalization)",
  "intuition": "把有限的 0–255 显示灰阶当作“对比度预算”，通过非线性查找表（LUT）将高斜率精准分配给最关键的灰度区间，而不再受限于单调的亮度/对比度滑块。",
  "blocks": [
    {
      "type": "concept",
      "heading": "突破线性调节：从单区间到多区间的灰度变换",
      "paragraphs": [
        "在常规的数字图像显示中，**亮度（Brightness）**和**对比度（Contrast）**调节本质上只能对输入像素值的**某一个连续区间**进行线性放大（对应一条斜率大于 1 的单折线）。一旦拉高对比度去看清暗部细节，亮部就会彻底饱和为纯白；反之亦然。",
        "然而在实际工程中（如图 23-12f 与红外热成像图 23-13），一幅图像往往同时包含多个分离的重点灰度区——例如远红外夜视画面中，冷背景在低灰度区（DN 0–45），温暖的人体在中间灰度区（DN 60–140），高温的卡车散热格栅在高灰度区（DN 200–255）。",
        "**灰度变换（Grayscale Transform）**的核心思想是：打破单段直线的限制，为 `0` 到 `255` 的每一个输入灰度值赋予不同的**重要度权重（即期望对比度）**。越重要的灰度区间，变换曲线的**斜率**就越陡峭，从而在同一个 8-bit 显示器上同时看清多个目标区域的细节。"
      ],
      "formula": {
        "expr": "LUT[x] = round( 255 * Σ_{k=0}^{x} w[k] / Σ_{k=0}^{255} w[k] )",
        "explain": "x 为输入像素值 (0–255)；w[k] 为人类设定的第 k 级灰度的期望对比度权重；LUT[x] 为查找表输出的显示像素值 (0–255)。对权重曲线做累加和（离散积分）并归一化到 255，即可得到单调递增的映射曲线。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：定制对比度权重与实时积分 LUT 映射",
      "instruction": "拖动背景、人体、格栅三个区间的对比度权重滑块，观察左图权重、中图积分曲线斜率以及右图红外图像细节的实时变化。",
      "controls": [
        {
          "type": "slider",
          "id": "bgWeight",
          "label": "背景对比度权重 (DN 0–40)",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 12,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bodyWeight",
          "label": "人体对比度权重 (DN 60–145)",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "grillWeight",
          "label": "格栅对比度权重 (DN 195–255)",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRaw",
          "label": "查看原始未变换红外图",
          "value": false
        }
      ],
      "jsCode": "var W = 48, H = 40;\nvar rawImg = new Array(W * H);\nfunction hash(x, y) {\n  var n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;\n  return n - Math.floor(n);\n}\nfor (var y = 0; y < H; y++) {\n  for (var x = 0; x < W; x++) {\n    var v = 4 + Math.floor(hash(x, y) * 14);\n    if (y > 27) v += 14;\n    if (x < 13 && y < 22) v += 10;\n    if (x >= 18 && x <= 21 && y >= 12 && y <= 15) {\n      v = 95 + Math.floor(hash(x, y) * 15);\n    } else if (x >= 16 && x <= 23 && y >= 16 && y <= 26) {\n      v = (x >= 18 && x <= 21 && y >= 18 && y <= 23) ? 128 : 82 + Math.floor(hash(x, y) * 14);\n    } else if (((x >= 16 && x <= 18) || (x >= 21 && x <= 23)) && y >= 27 && y <= 35) {\n      v = 72 + Math.floor(hash(x, y) * 16);\n    }\n    if (x >= 27 && x <= 45 && y >= 9 && y <= 31) {\n      v = 18 + Math.floor(hash(x, y) * 18);\n      if (x >= 28 && x <= 35 && y >= 12 && y <= 23) {\n        v = (y % 2 === 0) ? (234 + Math.floor(hash(x, y) * 14)) : (200 + Math.floor(hash(x, y) * 12));\n      }\n    }\n    var dx = x - 38, dy = y - 28;\n    if (dx * dx + dy * dy <= 25) {\n      v = (dx * dx + dy * dy <= 6) ? 38 : 14 + Math.floor(hash(x, y) * 8);\n    }\n    rawImg[y * W + x] = Math.max(0, Math.min(255, v));\n  }\n}\n\nfunction render() {\n  var ctx = lab.ctx;\n  var cw = lab.width, ch = lab.height;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, cw, ch);\n\n  var bgW = lab.values.bgWeight;\n  var bodyW = lab.values.bodyWeight;\n  var grillW = lab.values.grillWeight;\n  var showRaw = lab.values.showRaw;\n\n  var weights = new Array(256);\n  var sumW = 0;\n  for (var i = 0; i < 256; i++) {\n    var w = 1;\n    if (i <= 40) w = bgW;\n    else if (i <= 55) w = bgW + (bodyW - bgW) * ((i - 40) / 15);\n    else if (i <= 145) w = bodyW;\n    else if (i <= 195) w = bodyW + (grillW - bodyW) * ((i - 145) / 50);\n    else w = grillW;\n    weights[i] = w;\n    sumW += w;\n  }\n\n  var lut = new Array(256);\n  if (sumW <= 0.0001) {\n    for (var i = 0; i < 256; i++) lut[i] = i;\n  } else {\n    var acc = 0;\n    for (var i = 0; i < 256; i++) {\n      acc += weights[i];\n      lut[i] = Math.round(255 * acc / sumW);\n    }\n  }\n\n  var p1x = 28, p1y = 32, p1w = 185, p1h = 165;\n  var p2x = 258, p2y = 32, p2w = 185, p2h = 165;\n  var p3x = 492, p3y = 34;\n\n  function drawGrid(px, py, pw, ph) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var g = 0; g <= 4; g++) {\n      var gx = px + pw * g / 4;\n      var gy = py + ph * g / 4;\n      ctx.beginPath(); ctx.moveTo(gx, py); ctx.lineTo(gx, py + ph); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.strokeRect(px, py, pw, ph);\n  }\n\n  drawGrid(p1x, p1y, p1w, p1h);\n  ctx.fillStyle = 'rgba(56,189,248,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(p1x, p1y + p1h);\n  for (var i = 0; i < 256; i++) {\n    var vx = p1x + (i / 255) * p1w;\n    var vy = p1y + p1h - (weights[i] / 16) * p1h;\n    ctx.lineTo(vx, vy);\n  }\n  ctx.lineTo(p1x + p1w, p1y + p1h);\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i < 256; i++) {\n    var vx = p1x + (i / 255) * p1w;\n    var vy = p1y + p1h - (weights[i] / 16) * p1h;\n    if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.stroke();\n\n  drawGrid(p2x, p2y, p2w, p2h);\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(p2x, p2y + p2h); ctx.lineTo(p2x + p2w, p2y); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i < 256; i++) {\n    var vx = p2x + (i / 255) * p2w;\n    var vy = p2y + p2h - (lut[i] / 255) * p2h;\n    if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.stroke();\n\n  var cell = 4;\n  for (var y = 0; y < H; y++) {\n    for (var x = 0; x < W; x++) {\n      var rv = rawImg[y * W + x];\n      var dv = showRaw ? rv : lut[rv];\n      ctx.fillStyle = 'rgb(' + dv + ',' + dv + ',' + dv + ')';\n      ctx.fillRect(p3x + x * cell, p3y + y * cell, cell, cell);\n    }\n  }\n  ctx.strokeStyle = showRaw ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(p3x, p3y, W * cell, H * cell);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('1. 期望对比度权重 w(x)', p1x + p1w / 2, 20);\n  ctx.fillText('2. 积分归一化 LUT(x)', p2x + p2w / 2, 20);\n  ctx.fillText(showRaw ? '3. 原始红外图像 (未变换)' : '3. 灰度变换输出图像', p3x + (W * cell) / 2, 20);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', p1x, p1y + p1h + 14);\n  ctx.fillText('128', p1x + p1w / 2, p1y + p1h + 14);\n  ctx.fillText('255', p1x + p1w, p1y + p1h + 14);\n  ctx.fillText('0', p2x, p2y + p2h + 14);\n  ctx.fillText('128', p2x + p2w / 2, p2y + p2h + 14);\n  ctx.fillText('255', p2x + p2w, p2y + p2h + 14);\n\n  var bgSpan = lut[40] - lut[0];\n  var bodySpan = lut[145] - lut[56];\n  var grillSpan = lut[255] - lut[196];\n  lab.setReadout('显示灰阶分配 (总计255级) -> 背景跨度: ' + bgSpan + ' 级 | 人体跨度: ' + bodySpan + ' 级 | 格栅跨度: ' + grillSpan + ' 级');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "微积分直觉：为什么变换曲线必须取“积分”？",
      "paragraphs": [
        "初学灰度变换时，很容易困惑：为什么不能直接把设定的权重曲线当作输出映射，而一定要对它做**累加求积分**？",
        "答案在于对比度的物理定义：**图像在某个输入灰度附近的局部对比度，等于输出变换曲线在该点的斜率（导数）**。如果权重曲线 `w(x)` 代表我们想要的“斜率”，那么要反推出“曲线本身”，数学上就必须对斜率做**积分**！",
        "同时，总和归一化揭示了一个残酷的工程现实——**0–255 的显示灰阶是零和资源**。在图 23-13b 的经典案例中，为了把黑漆漆的背景拉亮、把过曝的格栅压暗并增强两者的细节，我们给背景和格栅分配了陡峭的斜率，代价就是人体灰度区间的斜率被迫变平（人体内部对比度反而更低了）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "直方图均衡化：数学上很美，工程上要小心“盲人摸象”",
      "paragraphs": [
        "手动调节各区间的权重需要不断试错。人们自然会想：能不能让算法自动生成这条权重曲线？观察图 23-14a 的**图像直方图（Histogram）**与 23-14b 的手动权重曲线，两者形状竟有几分相似！",
        "**直方图均衡化（Histogram Equalization）**正是利用这一思路：它完全不需要人工判断，直接把图像本身的**直方图作为权重曲线**，进行累加积分与归一化（即计算累积分布函数 CDF）。像素越密集的灰度区间，分配到的斜率就越大。",
        "从信息论来看，直方图均衡化能**最大化整幅图像的信息熵（Entropy）**，让固定比特数传递尽可能多的信息量。但它有一个致命缺陷：**把“像素数量多”误判为“像素重要”**。在红外追踪场景中，冷背景占了绝大多数像素，而关键的人体和卡车格栅只占很小一块区域。直方图均衡化会把绝大部分灰阶挥霍在放大背景噪声上，反而把真正重要的小目标压扁、忽略！"
      ],
      "formula": {
        "expr": "LUT_eq[x] = round( 255 * Σ_{k=0}^{x} H[k] / N )",
        "explain": "H[k] 为图像中灰度值等于 k 的像素个数；N 为图像总像素数。累加直方图除以总像素数，即为离散累积分布函数 (CDF)。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：直方图均衡化 vs. 手动重要性变换大比拼",
      "instruction": "调高“背景像素占比”模拟大背景小目标场景，切换直方图均衡化开关，对比背景噪声与两个小目标内部纹理的清晰度变化。",
      "controls": [
        {
          "type": "slider",
          "id": "bgRatio",
          "label": "背景像素占比",
          "min": 30,
          "max": 95,
          "step": 5,
          "value": 85,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "targetWeight",
          "label": "手动模式小目标权重",
          "min": 1,
          "max": 20,
          "step": 1,
          "value": 10,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "useHistEq",
          "label": "开启直方图均衡化 (关闭=手动加权)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showLut",
          "label": "叠加显示输出 LUT 曲线",
          "value": true
        }
      ],
      "jsCode": "var W = 44, H = 38, N = W * H;\nfunction hash(x, y) {\n  var n = Math.sin(x * 19.13 + y * 91.71) * 31415.926;\n  return n - Math.floor(n);\n}\n\nfunction render() {\n  var ctx = lab.ctx;\n  var cw = lab.width, ch = lab.height;\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, cw, ch);\n\n  var bgRatio = lab.values.bgRatio;\n  var targetW = lab.values.targetWeight;\n  var useHistEq = lab.values.useHistEq;\n  var showLut = lab.values.showLut;\n\n  var tFrac = (100 - bgRatio) / 100;\n  var side = Math.max(3, Math.min(17, Math.round(Math.sqrt(N * tFrac / 2))));\n  var half = Math.floor(side / 2);\n\n  var rawImg = new Array(N);\n  var hist = new Array(256);\n  for (var i = 0; i < 256; i++) hist[i] = 0;\n\n  var c1x = 12, c2x = 31, cy = 19;\n  for (var y = 0; y < H; y++) {\n    for (var x = 0; x < W; x++) {\n      var v = 8 + Math.floor(hash(x, y) * 34);\n      var dx1 = Math.abs(x - c1x), dy1 = Math.abs(y - cy);\n      if (dx1 <= half && dy1 <= half) {\n        var inBox = (dx1 <= Math.max(1, Math.floor(half / 2)) && dy1 <= Math.max(1, Math.floor(half / 2)));\n        v = inBox ? (134 + Math.floor(hash(x, y) * 8)) : (104 + Math.floor(hash(x, y) * 8));\n      }\n      var dx2 = Math.abs(x - c2x), dy2 = Math.abs(y - cy);\n      if (dx2 <= half && dy2 <= half) {\n        v = (y % 2 === 0) ? (238 + Math.floor(hash(x, y) * 8)) : (204 + Math.floor(hash(x, y) * 8));\n      }\n      rawImg[y * W + x] = v;\n      hist[v]++;\n    }\n  }\n\n  var lut = new Array(256);\n  if (useHistEq) {\n    var acc = 0;\n    for (var i = 0; i < 256; i++) {\n      acc += hist[i];\n      lut[i] = Math.round(255 * acc / N);\n    }\n  } else {\n    var wArr = new Array(256);\n    var sumW = 0;\n    for (var i = 0; i < 256; i++) {\n      var w = 1;\n      if ((i >= 95 && i <= 150) || (i >= 195 && i <= 250)) w = targetW;\n      wArr[i] = w;\n      sumW += w;\n    }\n    var acc = 0;\n    for (var i = 0; i < 256; i++) {\n      acc += wArr[i];\n      lut[i] = Math.round(255 * acc / sumW);\n    }\n  }\n\n  var outHist = new Array(256);\n  for (var i = 0; i < 256; i++) outHist[i] = 0;\n  for (var k = 0; k < N; k++) outHist[lut[rawImg[k]]]++;\n  var entropy = 0;\n  for (var i = 0; i < 256; i++) {\n    if (outHist[i] > 0) {\n      var p = outHist[i] / N;\n      entropy -= p * (Math.log(p) / Math.LN2);\n    }\n  }\n\n  var hx = 28, hy = 32, hw = 240, hh = 162;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    ctx.beginPath(); ctx.moveTo(hx + hw * g / 4, hy); ctx.lineTo(hx + hw * g / 4, hy + hh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(hx, hy + hh * g / 4); ctx.lineTo(hx + hw, hy + hh * g / 4); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(hx, hy, hw, hh);\n\n  var maxH = 1;\n  for (var i = 0; i < 256; i++) if (hist[i] > maxH) maxH = hist[i];\n  ctx.fillStyle = '#38bdf8';\n  for (var i = 0; i < 256; i++) {\n    if (hist[i] > 0) {\n      var bh = (hist[i] / maxH) * (hh - 6);\n      ctx.fillRect(hx + (i / 255) * hw, hy + hh - bh, 1.5, bh);\n    }\n  }\n\n  if (showLut) {\n    ctx.strokeStyle = useHistEq ? '#f59e0b' : '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var i = 0; i < 256; i++) {\n      var lx = hx + (i / 255) * hw;\n      var ly = hy + hh - (lut[i] / 255) * hh;\n      if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);\n    }\n    ctx.stroke();\n  }\n\n  var cell = 4;\n  var p2x = 304, p2y = 36;\n  var p3x = 514, p3y = 36;\n  for (var y = 0; y < H; y++) {\n    for (var x = 0; x < W; x++) {\n      var rv = rawImg[y * W + x];\n      var ov = lut[rv];\n      ctx.fillStyle = 'rgb(' + rv + ',' + rv + ',' + rv + ')';\n      ctx.fillRect(p2x + x * cell, p2y + y * cell, cell, cell);\n      ctx.fillStyle = 'rgb(' + ov + ',' + ov + ',' + ov + ')';\n      ctx.fillRect(p3x + x * cell, p3y + y * cell, cell, cell);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(p2x, p2y, W * cell, H * cell);\n  ctx.strokeStyle = useHistEq ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 1.8;\n  ctx.strokeRect(p3x, p3y, W * cell, H * cell);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('1. 直方图 H(x) 与变换曲线 LUT', hx + hw / 2, 20);\n  ctx.fillText('2. 原始图像 (大背景+双小目标)', p2x + (W * cell) / 2, 20);\n  ctx.fillText(useHistEq ? '3. 直方图均衡化结果' : '3. 手动重要性加权结果', p3x + (W * cell) / 2, 20);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('背景', hx + hw * 0.1, hy + hh + 14);\n  ctx.fillText('灰目标', hx + hw * 0.48, hy + hh + 14);\n  ctx.fillText('亮目标', hx + hw * 0.88, hy + hh + 14);\n\n  var bgSpan = lut[42] - lut[8];\n  var midSpan = lut[142] - lut[104];\n  var hiSpan = lut[246] - lut[204];\n  var modeName = useHistEq ? '直方图均衡化' : '手动加权';\n  lab.setReadout('模式: ' + modeName + ' | 图像熵: ' + entropy.toFixed(2) + ' bits | 背景灰阶跨度: ' + bgSpan + ' | 灰目标跨度: ' + midSpan + ' | 亮目标跨度: ' + hiSpan);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "多区间同时增强必须用查找表（LUT）灰度变换：传统亮度/对比度只能放大单一灰度窗口，而 LUT 允许我们在多个互不相连的灰度段同时拉高斜率。",
        "斜率即对比度，积分得曲线：设计自定义灰度变换时，先按工程需求画出各灰度的期望对比度 w(x)，再对其做累加积分并归一化到 255，即可保证曲线合法且单调递增。",
        "直方图均衡化不是银弹：它通过最大化整图信息熵实现全自动增强，但本质上是“按像素数量分配对比度”。在医疗影像、夜视监控、工业探伤等“大背景 + 小目标”场景中，盲目使用直方图均衡化会严重放大背景噪声并淹没关键小目标，此时务必切回手动加权或局部限制对比度变换。"
      ]
    }
  ]
});
