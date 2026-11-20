window.__BOOK_REGISTER_SECTION__("sec_172", {
  "title": "亮度与对比度调整 (Brightness and Contrast Adjustments)",
  "intuition": "亮度调节相当于在灰度轴上左右移动‘观察窗口’，而对比度调节则是改变窗口的宽窄——用截断窗口外明暗细节（饱和）的代价，把窗口内肉眼难辨的微弱灰度差强行放大。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 什么是亮度与对比度？失调时会发生什么？",
      "paragraphs": [
        "数字图像要想清晰易读，必须同时具备合适的**亮度（Brightness）**与**对比度（Contrast）**。**亮度**指的是整幅图像的整体明暗程度；而**对比度**则是指不同物体或区域之间的亮度差异——比如一只白兔跑在雪地里，因为目标和背景灰度接近，**对比度很差**；换成一只黑狗跑在同样的雪地上，就具备**极佳的对比度**。",
        "原书图 23-10 展示了四种典型的调节失误：**（a）亮度过高**时，最亮的像素集体饱和成纯白，高光区域的纹理细节被彻底抹平；**（b）亮度过低**时，暗部像素全部饱和成死黑；**（c）对比度过高**时，黑的太黑、白的太白，只剩极端的黑白反差而丢失中间过渡；**（d）对比度过低**时，所有像素都被压缩在中等灰度的狭窄区间内，物体与背景融成一片灰蒙蒙的雾。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "2. 幕后控制器：输出变换查找表 (Output Transform / LUT)",
      "paragraphs": [
        "在数字成像硬件中，内存中存储的像素值（Digital Number，简称 `DN`，通常为 `0` 到 `255`）并不会直接送去点亮屏幕，而是要先经过一张名为**输出变换（Output Transform）**、**输出查找表（Output Look-Up Table, LUT）**或**伽马曲线（Gamma Curve）**的映射表，转换成新的 `0~255` 数字信号再去驱动视频强度电路（`0` 代表纯黑，`255` 代表纯白）。",
        "当查找表设为“不做任何改变”（`DN_out = DN_in`）的 45° 恒等直线时，若图像中存在微弱细节——例如原书图 23-11 的经典测试图：背景是 `0~255` 随机噪声，左、中、右三个方块基底灰度分别为 `75`、`150`、`225`，各自内部藏着灰度仅相差 `±4` 的两个低对比度三角形（`71/79`、`146/154`、`221/229`）——此时肉眼几乎无法分辨三角形，因为 `±4` 的差值在 `0~255` 全跨度下对比度实在太低了。",
        "只调**亮度**会让整条映射曲线**向左移（变亮）**或**向右移（变暗）**，每个像素同增同减，虽然能把过暗或过亮区域拉回可见范围，但并不会改变像素之间的相对差值，因此**单纯调亮度几乎无法帮助看清低对比度目标**；只有提高**对比度**（增大映射曲线的**斜率**），才能把微小的灰度差真正拉开。"
      ],
      "formula": {
        "expr": "DN_out = clip( 127.5 + slope * (DN_in - centerDN), 0, 255 )",
        "explain": "`DN_in` 为存储的原始像素值（0~255）；`slope`（斜率）由对比度控制，斜率越大，有效区间内的灰度差被放大得越多；`centerDN` 由亮度控制（提高亮度等价于减小 `centerDN`，使映射曲线向左平移）；`clip(..., 0, 255)` 表示超出 0 或 255 的部分会被饱和截断为纯黑或纯白。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：还原原书 80×32 测试图与输出查找表 (LUT)",
      "instruction": "试着单独拖动「亮度偏移」观察为什么找不出隐藏三角形；再把「对比度斜率」调到 4.0、亮度调到 +52（中心对准 DN=75），或者斜率调到 16.0、亮度调到 -22（对准 DN=150），复现原书图 23-12(d)(e) 的灰度拉伸奇效！",
      "controls": [
        {
          "type": "slider",
          "id": "brightness",
          "label": "亮度偏移 (左移变亮 / 右移变暗)",
          "min": -120,
          "max": 120,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "contrast",
          "label": "对比度斜率 (Slope)",
          "min": 0.2,
          "max": 16,
          "step": 0.2,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "showWindow",
          "label": "标出未饱和有效动态范围窗口",
          "value": true
        }
      ],
      "jsCode": "var W = 80, H = 32;\nvar img = new Uint8Array(W * H);\nvar seed = 13579;\nfor (var r = 0; r < H; r++) {\n  for (var c = 0; c < W; c++) {\n    seed = (seed * 1664525 + 1013904223) >>> 0;\n    img[r * W + c] = (seed >>> 24) & 255;\n  }\n}\nvar bases = [75, 150, 225];\nvar cols = [8, 32, 56];\nfor (var b = 0; b < 3; b++) {\n  var c0 = cols[b], r0 = 8, base = bases[b];\n  for (var dy = 0; dy < 16; dy++) {\n    for (var dx = 0; dx < 16; dx++) {\n      var val = base;\n      if (dx >= 3 && dx <= 12 && dy >= 3 && dy <= 12) {\n        var ix = dx - 3, iy = dy - 3;\n        if (ix + iy < 8) val = base - 4;\n        else if (ix + iy > 10) val = base + 4;\n      }\n      img[(r0 + dy) * W + (c0 + dx)] = val;\n    }\n  }\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var bright = lab.values.brightness;\n  var slope = lab.values.contrast;\n  var showWin = lab.values.showWindow;\n  var centerDN = 127.5 - bright;\n\n  var lut = new Uint8Array(256);\n  for (var i = 0; i < 256; i++) {\n    var v = Math.round(127.5 + slope * (i - centerDN));\n    lut[i] = v < 0 ? 0 : (v > 255 ? 255 : v);\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, lab.width, lab.height);\n\n  var imgX = 24, imgY = 52, px = 4;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('80×32 测试图 (原图背景为 0~255 随机噪声)', imgX, 38);\n\n  for (var r = 0; r < H; r++) {\n    for (var c = 0; c < W; c++) {\n      var out = lut[img[r * W + c]];\n      ctx.fillStyle = 'rgb(' + out + ',' + out + ',' + out + ')';\n      ctx.fillRect(imgX + c * px, imgY + r * px, px, px);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(imgX - 0.5, imgY - 0.5, W * px + 1, H * px + 1);\n\n  var sqColors = ['#38bdf8', '#10b981', '#f59e0b'];\n  for (var b = 0; b < 3; b++) {\n    var bx = imgX + (cols[b] + 8) * px;\n    var outBase = lut[bases[b]];\n    ctx.textAlign = 'center';\n    ctx.fillStyle = sqColors[b];\n    ctx.font = '11px monospace';\n    ctx.fillText('DN=' + bases[b] + ' (±4)', bx, imgY + H * px + 18);\n    ctx.fillStyle = (outBase === 0 || outBase === 255) ? '#ec4899' : '#f8fafc';\n    ctx.fillText('输出: ' + outBase + (outBase === 0 ? ' (黑饱和)' : (outBase === 255 ? ' (白饱和)' : '')), bx, imgY + H * px + 34);\n  }\n  ctx.textAlign = 'left';\n\n  var pX = 468, pY = 28, pW = 180, pH = 180;\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(pX, pY, pW, pH);\n\n  var lowDN = centerDN - 127.5 / slope;\n  var highDN = centerDN + 127.5 / slope;\n  var cLow = Math.max(0, Math.min(255, lowDN));\n  var cHigh = Math.max(0, Math.min(255, highDN));\n\n  if (showWin) {\n    var wx1 = pX + (cLow / 255) * pW;\n    var wx2 = pX + (cHigh / 255) * pW;\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.14)';\n    ctx.fillRect(wx1, pY, wx2 - wx1, pH);\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(wx1, pY); ctx.lineTo(wx1, pY + pH);\n    ctx.moveTo(wx2, pY); ctx.lineTo(wx2, pY + pH);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gx = pX + (g / 4) * pW;\n    var gy = pY + (g / 4) * pH;\n    ctx.beginPath();\n    ctx.moveTo(gx, pY); ctx.lineTo(gx, pY + pH);\n    ctx.moveTo(pX, gy); ctx.lineTo(pX + pW, gy);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(pX, pY + pH);\n  ctx.lineTo(pX + pW, pY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (var i = 0; i < 255; i++) {\n    var x1 = pX + (i / 255) * pW;\n    var y1 = pY + pH - (lut[i] / 255) * pH;\n    var x2 = pX + ((i + 1) / 255) * pW;\n    var y2 = pY + pH - (lut[i + 1] / 255) * pH;\n    if (lut[i] === 0 && lut[i + 1] === 0) ctx.strokeStyle = '#ec4899';\n    else if (lut[i] === 255 && lut[i + 1] === 255) ctx.strokeStyle = '#f59e0b';\n    else ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();\n  }\n\n  for (var b = 0; b < 3; b++) {\n    var dn = bases[b];\n    var dx = pX + (dn / 255) * pW;\n    var dy = pY + pH - (lut[dn] / 255) * pH;\n    ctx.fillStyle = sqColors[b];\n    ctx.beginPath(); ctx.arc(dx, dy, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = '#0b1120'; ctx.lineWidth = 1.5; ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(pX, pY, pW, pH);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('255', pX - 24, pY + 8);\n  ctx.fillText('128', pX - 24, pY + pH / 2 + 4);\n  ctx.fillText('0', pX - 12, pY + pH + 2);\n  ctx.fillText('输入 DN (0 → 255)', pX + 34, pY + pH + 18);\n  ctx.fillText('输出变换曲线 (LUT)', pX + 32, pY - 8);\n\n  var activeLevels = Math.max(1, Math.round(cHigh - cLow));\n  lab.setReadout('中心对准 DN=' + centerDN.toFixed(1) + ' | 斜率=' + slope.toFixed(1) + 'x | 有效未饱和窗口: [' + Math.round(cLow) + ', ' + Math.round(cHigh) + '] (仅 ' + activeLevels + '/256 灰阶) | 三方块输出: ' + lut[75] + ' / ' + lut[150] + ' / ' + lut[225]);\n});"
    },
    {
      "type": "concept",
      "heading": "3. 灰度拉伸 (Grayscale Stretch) 与数字/模拟控制之别",
      "paragraphs": [
        "把**对比度**想象成一个**放大镜**，它让你把视线缩放聚焦到一小段感兴趣的像素值区间上；而**亮度**则负责把这个放大镜的中心精确对准目标所在的灰度位置。例如原书图 23-12(d) 中，当把中心对准 `75` 并把斜率提升至 `4` 倍时，原本仅差 `4` 个单位的 `71` 和 `75` 在屏幕上变成了 `100` 和 `116`（视觉反差扩大 4 倍），左侧方块内的三角形清晰浮现。代价是：只有 `46~109` 之间的像素保留了灰阶，其余 `0~45` 全部死黑饱和、`110~255` 全部死白饱和。",
        "如果把对比度推向更高（如图 23-12(e) 中只剩 `16` 个未饱和灰阶，居中对准 `150`），中间方块里 `146` 和 `154` 的三角形细节变得极其锐利，而四周背景噪声几乎只剩非黑即白的二值噪点。这种用极高对比度专门观察极少数几个灰阶的技术，在工程上常被称为**灰度拉伸（Grayscale Stretch）**。",
        "最后需要特别注意一个工程坑：**数字成像系统**的亮度与对比度通常按上述“窗口平移 + 绕中心缩放”的 LUT 方式工作；但传统电视机和视频监视器上的旋钮是**模拟电路**——它的“对比度”往往直接调整模拟信号的**乘性增益（Gain）**，“亮度”则是在信号上加减一个**直流偏置（DC Offset）**。由于增益以 `0` 电平为支点乘上去，拧动模拟对比度时画面整体亮度也会跟着剧变，千万别惊讶它们和数字软件里的表现不一样。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：行星表面实景灰阶直方图与「数字LUT vs 模拟Gain/Offset」对比",
      "instruction": "拖动增益与偏置滑块，观察右侧输出直方图如何向 0（粉红）和 255（琥珀）两端撞墙饱和；再点击切换「模拟电路模式」，对比拧动对比度旋钮时画面整体亮度的剧烈联动差异！",
      "controls": [
        {
          "type": "slider",
          "id": "gain",
          "label": "对比度 / 增益 (Slope / Gain)",
          "min": 0.2,
          "max": 5,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "offset",
          "label": "亮度 / 偏置 (Brightness / Offset)",
          "min": -120,
          "max": 120,
          "step": 2,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "analogMode",
          "label": "模拟电路模式 (Gain×DN + Offset)",
          "value": false
        }
      ],
      "jsCode": "var S = 200;\nvar base = new Uint8Array(S * S);\nvar inHist = new Int32Array(256);\nvar craters = [\n  {x: 68, y: 74, r: 22, d: 34},\n  {x: 132, y: 88, r: 16, d: 28},\n  {x: 92, y: 140, r: 26, d: 38},\n  {x: 145, y: 135, r: 11, d: 22},\n  {x: 75, y: 115, r: 9, d: 20}\n];\nfor (var y = 0; y < S; y++) {\n  for (var x = 0; x < S; x++) {\n    var dx = x - 100, dy = y - 100;\n    var dist = Math.sqrt(dx * dx + dy * dy);\n    var val = 36;\n    if (dist < 86) {\n      var nx = dx / 86, ny = dy / 86;\n      var nz = Math.sqrt(Math.max(0, 1 - nx * nx - ny * ny));\n      var shade = 0.45 + 0.55 * Math.max(0, -0.45 * nx - 0.45 * ny + 0.77 * nz);\n      var tex = Math.sin(x * 0.09 + Math.cos(y * 0.07) * 1.6) * 24\n              + Math.cos(y * 0.13 - Math.sin(x * 0.11) * 1.4) * 18\n              + Math.sin((x + y) * 0.25) * 9;\n      var v = 135 * shade + tex;\n      for (var k = 0; k < craters.length; k++) {\n        var cr = craters[k];\n        var cdx = x - cr.x, cdy = y - cr.y;\n        var cd = Math.sqrt(cdx * cdx + cdy * cdy);\n        if (cd < cr.r) {\n          var rim = Math.exp(-Math.pow((cd - cr.r * 0.85) / (cr.r * 0.18), 2)) * cr.d * 0.7;\n          var bowl = (1 - (cd / cr.r) * (cd / cr.r)) * cr.d;\n          var light = (-cdx - cdy) / (cr.r * 1.414);\n          v += rim + bowl * (0.4 * light - 0.7);\n        }\n      }\n      if (Math.hypot(x - 134, y - 122) < 9) v -= 6;\n      if (Math.hypot(x - 66, y - 68) < 8) v += 7;\n      if (dist > 82) v = v * (86 - dist) / 4 + 36 * (1 - (86 - dist) / 4);\n      val = Math.max(0, Math.min(255, Math.round(v)));\n    }\n    base[y * S + x] = val;\n    inHist[val]++;\n  }\n}\n\nvar imgData = lab.ctx.createImageData(S, S);\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var gain = lab.values.gain;\n  var offset = lab.values.offset;\n  var analog = lab.values.analogMode;\n\n  var lut = new Uint8Array(256);\n  for (var i = 0; i < 256; i++) {\n    var out;\n    if (analog) {\n      out = Math.round(gain * i + offset);\n    } else {\n      out = Math.round(127.5 + gain * (i - (127.5 - offset)));\n    }\n    lut[i] = out < 0 ? 0 : (out > 255 ? 255 : out);\n  }\n\n  var outHist = new Int32Array(256);\n  var d = imgData.data;\n  for (var idx = 0; idx < S * S; idx++) {\n    var v = lut[base[idx]];\n    outHist[v]++;\n    var p = idx * 4;\n    d[p] = v; d[p + 1] = v; d[p + 2] = v; d[p + 3] = 255;\n  }\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, lab.width, lab.height);\n  ctx.putImageData(imgData, 18, 20);\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(17.5, 19.5, S + 1, S + 1);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('实时输出图像 (200×200)', 48, 234);\n\n  var hX = 250, hY = 38, hW = 256, hH = 162;\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(hX, hY, hW, hH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var g = 1; g < 4; g++) {\n    ctx.beginPath();\n    ctx.moveTo(hX + g * 64, hY); ctx.lineTo(hX + g * 64, hY + hH);\n    ctx.stroke();\n  }\n\n  var maxIn = 1;\n  for (var b = 0; b < 64; b++) {\n    var sumIn = 0;\n    for (var j = 0; j < 4; j++) sumIn += inHist[b * 4 + j];\n    if (b > 1 && b < 62 && sumIn > maxIn) maxIn = sumIn;\n  }\n  var scaleY = (hH - 18) / (maxIn * 1.8);\n\n  ctx.fillStyle = 'rgba(148, 163, 184, 0.22)';\n  for (var b = 0; b < 64; b++) {\n    var sumIn = 0;\n    for (var j = 0; j < 4; j++) sumIn += inHist[b * 4 + j];\n    var barH = Math.min(hH - 4, sumIn * scaleY);\n    ctx.fillRect(hX + b * 4, hY + hH - barH, 3, barH);\n  }\n\n  for (var b = 0; b < 64; b++) {\n    var sumOut = 0;\n    for (var j = 0; j < 4; j++) sumOut += outHist[b * 4 + j];\n    var barH = Math.min(hH - 2, sumOut * scaleY);\n    ctx.fillStyle = (b === 0) ? '#ec4899' : ((b === 63) ? '#f59e0b' : '#38bdf8');\n    ctx.fillRect(hX + b * 4, hY + hH - barH, 3, barH);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.strokeRect(hX, hY, hW, hH);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('输出灰度直方图 (灰影为原图分布)', hX + 28, hY - 10);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('0 (黑)', hX, hY + hH + 14);\n  ctx.fillText('128', hX + 118, hY + hH + 14);\n  ctx.fillText('255 (白)', hX + 216, hY + hH + 14);\n\n  var lX = 546, lY = 46, lS = 144;\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(lX, lY, lS, lS);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(lX, lY + lS); ctx.lineTo(lX + lS, lY); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = analog ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i < 256; i++) {\n    var lx = lX + (i / 255) * lS;\n    var ly = lY + lS - (lut[i] / 255) * lS;\n    if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lX, lY, lS, lS);\n  ctx.fillStyle = analog ? '#f59e0b' : '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(analog ? '模拟模式: Gain×DN+Offset' : '数字模式: 绕亮度中心缩放', lX - 4, lY - 10);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('输入 DN → 输出亮度', lX + 22, lY + lS + 16);\n\n  var blackPct = (outHist[0] / (S * S) * 100).toFixed(1);\n  var whitePct = (outHist[255] / (S * S) * 100).toFixed(1);\n  lab.setReadout('模式: ' + (analog ? '模拟 Gain×DN+Offset' : '数字居中 LUT') + ' | 增益=' + gain.toFixed(1) + 'x, 偏置=' + offset + ' | 死黑饱和(0): ' + blackPct + '% | 死白饱和(255): ' + whitePct + '%');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "亮度救不了低对比度：单纯左右平移输出查找表只会整体变亮或变暗，无法拉开相邻像素的灰度差；想看清微弱目标，必须增大曲线斜率（对比度）。",
        "高对比度伴随双向饱和代价：进行灰度拉伸（Grayscale Stretch）放大局部细节时，有效窗口之外的高光和暗部像素会瞬间截断为 255（纯白）与 0（纯黑）。",
        "警惕模拟显示设备的旋钮特性：数字系统通常以亮度中心为支点进行斜率缩放；而模拟监视器的对比度旋钮往往直接调节信号增益（以 0 电平为支点乘法放大），容易与亮度控制产生耦合。",
        "线性单斜率调节的局限：全局亮度与对比度一次只能对准一个灰度窗口；若需要同时看清过暗与过亮两个分离区域（例如同时看清 DN=75 与 DN=225 中的细节），就需要引入多斜率非线性的「灰度变换（Grayscale Transforms）」。"
      ]
    }
  ]
});
