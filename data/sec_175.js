window.__BOOK_REGISTER_SECTION__("sec_175", {
  "title": "二维图像卷积与点扩散函数 (Convolution & PSF)",
  "intuition": "图像卷积的本质，就是用「点扩散函数 (PSF)」这把空间画笔，把输入图像里的每一个像素按亮度缩放后涂抹叠加到输出图像中，从而实现模糊去噪或边缘锐化。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从一维脉冲到二维点扩散函数 (PSF) 与负索引",
      "paragraphs": [
        "图像的信息编码在**空间域（Spatial Domain）**而非频域，因此卷积是线性图像处理中最核心的工具。正如一维信号可以拆解为移位缩放的脉冲之和，二维图像也可以看作无数个**二维脉冲（Delta 函数）**的叠加：除了中心像素 `(row = 0, column = 0)` 的值为 `1`，其余所有像素值均为 `0`。",
        "当这个孤立的亮斑通过一个线性系统时，系统唯一能对一个点做的事情就是让它「扩散开来」，形成某种特定的二维图案。因此，图像处理领域把二维线性系统的冲激响应专门称为**点扩散函数（Point Spread Function, PSF）**。",
        "在一维 DSP 中，我们常把滤波器核整体右移以消除负索引，由此带来的输出信号延迟通常无伤大雅；但在图像处理中，输出图像相对于输入图像产生整体像素偏移是不可接受的。因此，图像滤波核几乎一律采用**正负对称的负索引**，强行将核的几何中心锚定在 `row = 0, column = 0`。"
      ],
      "formula": {
        "expr": "y[r, c] = Σ_i Σ_j h[i, j] · x[r - i, c - j]",
        "explain": "x[r, c] 为输入图像，y[r, c] 为输出图像，h[i, j] 为以 (0, 0) 为中心的点扩散函数（PSF），i 和 j 的取值均对称包含正负索引（如 -R 到 +R）。"
      }
    },
    {
      "type": "concept",
      "heading": "人眼的生物卷积：侧抑制与马赫带视错觉",
      "paragraphs": [
        "人眼视网膜本身就是一套精妙的二维卷积处理器。视网膜第一层将光斑转为神经脉冲，第二层（中间层）利用**侧抑制（Lateral Inhibition）**机制对信号进行加工，再通过第三层视神经传给大脑：当某个神经细胞被亮斑激活时，它会抑制周围邻居细胞的活跃度。",
        "如果我们向人眼输入一个孤立光点，视神经上呈现的 PSF 就是一个**中心亮斑外围包裹着一圈暗环**。当我们注视真实世界时，相当于把整幅画面与这个「中心增强、周边抑制」的 PSF 做了卷积。",
        "这种机制是为了帮助生物快速锁定物体边界。当真实物体的边缘亮度只是缓慢过渡（比较模糊）时，经过视网膜卷积处理，大脑感知到的亮暗分界线附近会出现**过冲（Overshoot）与下冲（Undershoot）**：暗区紧挨边界处显得更暗，亮区紧挨边界处显得更亮。这种平行于边缘的亮暗条带错觉被称为**马赫带（Mach Bands）**。"
      ],
      "formula": {
        "expr": "h_eye[r, c] = (1 + k)·δ[r, c] - k·h_blur[r, c]",
        "explain": "视网膜的边缘增强核等价于将原始图像（δ 冲击）加上 k 倍的边缘高频差值（δ 减去平滑核 h_blur），k 越大，侧抑制与马赫带效应越明显。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：视网膜侧抑制 PSF 与马赫带效应实时模拟",
      "instruction": "拖动「侧抑制强度 k」和「边缘过渡宽度」，观察左侧 PSF 抑制环的变化，以及右侧灰度带边缘处马赫带亮暗条纹和过冲波形的产生。",
      "controls": [
        {
          "type": "slider",
          "id": "edgeWidth",
          "label": "边缘过渡宽度",
          "min": 6,
          "max": 50,
          "step": 2,
          "value": 24,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "inhibit",
          "label": "侧抑制强度 k",
          "min": 0,
          "max": 2,
          "step": 0.1,
          "value": 1.2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showStrip",
          "label": "显示真实 vs 感知灰度带",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var edgeW = lab.values.edgeWidth;\n  var k = lab.values.inhibit;\n  var showStrip = lab.values.showStrip;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 20; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 20; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var R = 14;\n  var gauss = [];\n  var gSum = 0;\n  for (var m = -R; m <= R; m++) {\n    var g = Math.exp(-(m * m) / (2 * 4.5 * 4.5));\n    gauss.push(g);\n    gSum += g;\n  }\n  var psf = [];\n  for (var idx = 0; idx < gauss.length; idx++) {\n    var mPos = idx - R;\n    var delta = (mPos === 0) ? 1 : 0;\n    psf.push((1 + k) * delta - k * (gauss[idx] / gSum));\n  }\n\n  // Left panel: PSF 1D cross section\n  var lx0 = 18, lw = 180, lyBase = 166;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('视网膜 1D PSF (侧抑制核)', lx0, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(lx0, lyBase); ctx.lineTo(lx0 + lw, lyBase); ctx.stroke();\n\n  var barW = lw / psf.length;\n  var maxPsf = 1 + k;\n  for (var i = 0; i < psf.length; i++) {\n    var val = psf[i];\n    var barH = (val / Math.max(1.5, maxPsf)) * 105;\n    ctx.fillStyle = val >= 0 ? '#10b981' : '#ec4899';\n    if (val >= 0) {\n      ctx.fillRect(lx0 + i * barW + 0.5, lyBase - barH, barW - 1, barH);\n    } else {\n      ctx.fillRect(lx0 + i * barW + 0.5, lyBase, barW - 1, -barH);\n    }\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('中心兴奋(+) / 周边抑制(-)', lx0 + 18, 224);\n\n  // Divider\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath(); ctx.moveTo(212, 12); ctx.lineTo(212, H - 12); ctx.stroke();\n\n  // Generate 1D edge profile\n  var N = 220;\n  var input = [];\n  var halfW = edgeW / 2;\n  for (var n = 0; n < N; n++) {\n    var d = n - N / 2;\n    var v = 0.25;\n    if (d >= halfW) {\n      v = 0.75;\n    } else if (d > -halfW) {\n      v = 0.25 + 0.5 * (0.5 - 0.5 * Math.cos(Math.PI * (d + halfW) / edgeW));\n    }\n    input.push(v);\n  }\n\n  // Convolve\n  var output = [];\n  var minOut = 999, maxOut = -999, minIdx = 0, maxIdx = 0;\n  for (var n = 0; n < N; n++) {\n    var acc = 0;\n    for (var m = -R; m <= R; m++) {\n      var srcIdx = Math.max(0, Math.min(N - 1, n - m));\n      acc += input[srcIdx] * psf[m + R];\n    }\n    output.push(acc);\n    if (acc < minOut) { minOut = acc; minIdx = n; }\n    if (acc > maxOut) { maxOut = acc; maxIdx = n; }\n  }\n\n  var rx0 = 228, rw = 472;\n  if (showStrip) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('真实亮度', rx0, 22);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('感知亮度 (注意边界处的亮/暗马赫带)', rx0 + 110, 22);\n\n    var stepW = rw / N;\n    for (var n = 0; n < N; n++) {\n      var cIn = Math.round(Math.max(0, Math.min(1, input[n])) * 255);\n      ctx.fillStyle = 'rgb(' + cIn + ',' + cIn + ',' + cIn + ')';\n      ctx.fillRect(rx0 + n * stepW, 28, stepW + 0.6, 20);\n\n      var cOut = Math.round(Math.max(0, Math.min(1, output[n])) * 255);\n      ctx.fillStyle = 'rgb(' + cOut + ',' + cOut + ',' + cOut + ')';\n      ctx.fillRect(rx0 + n * stepW, 52, stepW + 0.6, 22);\n    }\n  }\n\n  var plotTop = showStrip ? 88 : 34;\n  var plotBot = 216;\n  var plotH = plotBot - plotTop;\n\n  // Draw reference lines 0.25 & 0.75\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.setLineDash([4, 4]);\n  var y25 = plotBot - 0.25 * plotH;\n  var y75 = plotBot - 0.75 * plotH;\n  ctx.beginPath(); ctx.moveTo(rx0, y25); ctx.lineTo(rx0 + rw, y25); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx0, y75); ctx.lineTo(rx0 + rw, y75); ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Plot True Brightness\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = rx0 + (n / (N - 1)) * rw;\n    var py = plotBot - Math.max(0, Math.min(1, input[n])) * plotH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Plot Perceived Brightness\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = rx0 + (n / (N - 1)) * rw;\n    var py = plotBot - Math.max(0, Math.min(1, output[n])) * plotH;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Highlight overshoot & undershoot\n  if (k > 0.05) {\n    var mx1 = rx0 + (minIdx / (N - 1)) * rw;\n    var my1 = plotBot - Math.max(0, Math.min(1, minOut)) * plotH;\n    var mx2 = rx0 + (maxIdx / (N - 1)) * rw;\n    var my2 = plotBot - Math.max(0, Math.min(1, maxOut)) * plotH;\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(mx1, my1, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.beginPath(); ctx.arc(mx2, my2, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.font = '11px sans-serif';\n    ctx.fillText('暗带下冲', mx1 - 24, Math.min(232, my1 + 16));\n    ctx.fillText('亮带过冲', mx2 - 20, Math.max(plotTop + 10, my2 - 8));\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('--- 真实亮度轮廓', rx0, 232);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 感知亮度轮廓', rx0 + 115, 232);\n\n  var underPct = ((0.25 - minOut) * 100).toFixed(1);\n  var overPct = ((maxOut - 0.75) * 100).toFixed(1);\n  lab.setReadout('侧抑制 k = ' + k.toFixed(1) + ' | 边缘宽度 = ' + edgeW + ' px | 亮带过冲: +' + overPct + '% | 暗带下冲: -' + underPct + '%');\n});"
    },
    {
      "type": "concept",
      "heading": "卷积的双视角、双轴翻转与五大经典 PSF",
      "paragraphs": [
        "和一维卷积一样，二维图像卷积也可以从两个视角理解：**从输入端看**，输入图像的每个像素都将整个 PSF 缩放并平移后贡献到输出中；**从输出端看**，输出图像的每个像素由其周围一群输入像素加权决定，权重模板就是将 PSF **同时左右翻转并上下翻转**。只要 PSF 本身关于横纵轴对称，这种双轴翻转就不会产生任何变化；但对于非对称核（例如运动模糊或方向性滤波器），在写代码时必须严格执行双轴翻转。",
        "实际工程中最常见的五类 PSF 各具物理意义：**药丸盒（Pillbox）**是圆顶直壁的圆柱，正是相机镜头未对焦时点光源弥散成的圆形光斑；**高斯（Gaussian）**源于随机散射与大气湍流（由中心极限定理主导），和高斯/药丸盒一样属于**平滑/低通滤波器**，可压低随机噪点但会让边缘模糊；**方形（Square）**虽也能平滑图像，但因不具备圆对称性，会导致对角线方向与横纵方向的模糊程度不一致。",
        "平滑滤波器的反面是**边缘增强/高通滤波器**，通过谱反转技术（用单位脉冲减去平滑核）生成。至于一维 DSP 中常用的 **Sinc 函数**，在图像处理中极少用于实际卷积：一来图像信息编码在空间域而非频域，二来二维 Sinc 的拖尾按 `1/d` 极其缓慢地衰减，导致核必须做得近乎无限宽；相比之下，高斯核的拖尾以 `e^(-d²)` 极速衰减，截断后几乎毫无副作用。"
      ],
      "formula": {
        "expr": "Gaussian ~ e^(-(r² + c²) / 2σ²)   vs   Sinc ~ sin(d) / d",
        "explain": "d = √(r² + c²) 为像素到核中心 (0,0) 的距离。高斯函数随距离平方指数级衰减，可安全截断；Sinc 仅按 1/d 缓慢衰减，截断会引发严重振铃伪影。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：五大经典 PSF 核二维卷积与算力爆炸体验",
      "instruction": "切换不同的 PSF 核类型（0药丸/1高斯/2方形/3边缘增强/4Sinc）并调节核半径 R，观察中心 PSF 形状、去噪/锐化输出效果以及 512×512 图像的运算量变化。",
      "controls": [
        {
          "type": "slider",
          "id": "psfType",
          "label": "PSF 核类型 (0药丸/1高斯/2方形/3锐化/4Sinc)",
          "min": 0,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "radius",
          "label": "核半径 R",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 3,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "addNoise",
          "label": "叠加输入随机噪点",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var pType = lab.values.psfType;\n  var R = lab.values.radius;\n  var addNoise = lab.values.addNoise;\n  var names = ['Pillbox (药丸盒低通)', 'Gaussian (高斯低通)', 'Square (方形均值)', 'Edge Enhance (边缘锐化)', '2D Sinc (辛函数)'];\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  // Deterministic 48x48 test image\n  var S = 48;\n  var img = [];\n  var seed = 123456789;\n  function nextRand() {\n    seed = (seed * 1664525 + 1013904223) >>> 0;\n    return (seed / 4294967296) - 0.5;\n  }\n  for (var r = 0; r < S; r++) {\n    var row = [];\n    for (var c = 0; c < S; c++) {\n      var val = 0.16;\n      var dc = c - 17, dr = r - 17;\n      if (dc * dc + dr * dr <= 11 * 11) val = 0.84;\n      if (r >= 26 && r <= 41 && c >= 26 && c <= 41) val = 0.84;\n      if (r >= 30 && r <= 37 && c >= 30 && c <= 37) val = 0.20;\n      if (addNoise) {\n        val = Math.max(0, Math.min(1, val + nextRand() * 0.42));\n      }\n      row.push(val);\n    }\n    img.push(row);\n  }\n\n  // Build (2R+1)x(2R+1) PSF kernel\n  var kDim = 2 * R + 1;\n  var K = [];\n  var kSum = 0;\n  var sigma = Math.max(0.75, R * 0.45);\n  for (var dr = -R; dr <= R; dr++) {\n    var kRow = [];\n    for (var dc = -R; dc <= R; dc++) {\n      var d = Math.sqrt(dr * dr + dc * dc);\n      var kv = 0;\n      if (pType === 0) {\n        kv = (d <= R + 0.25) ? 1 : 0;\n      } else if (pType === 1 || pType === 3) {\n        kv = Math.exp(-(dr * dr + dc * dc) / (2 * sigma * sigma));\n      } else if (pType === 2) {\n        kv = 1;\n      } else if (pType === 4) {\n        kv = (d === 0) ? 1 : (Math.sin(d * 1.45) / (d * 1.45));\n      }\n      kRow.push(kv);\n      kSum += kv;\n    }\n    K.push(kRow);\n  }\n\n  var maxAbsK = 0;\n  for (var i = 0; i < kDim; i++) {\n    for (var j = 0; j < kDim; j++) {\n      K[i][j] /= kSum;\n      if (pType === 3) {\n        var isCenter = (i === R && j === R) ? 1 : 0;\n        K[i][j] = isCenter * 2.2 - 1.2 * K[i][j];\n      }\n      if (Math.abs(K[i][j]) > maxAbsK) maxAbsK = Math.abs(K[i][j]);\n    }\n  }\n\n  // 2D Convolution (with flip r-dr, c-dc)\n  var out = [];\n  for (var r = 0; r < S; r++) {\n    var oRow = [];\n    for (var c = 0; c < S; c++) {\n      var acc = 0;\n      for (var dr = -R; dr <= R; dr++) {\n        var sr = Math.max(0, Math.min(S - 1, r - dr));\n        for (var dc = -R; dc <= R; dc++) {\n          var sc = Math.max(0, Math.min(S - 1, c - dc));\n          acc += img[sr][sc] * K[dr + R][dc + R];\n        }\n      }\n      oRow.push(Math.max(0, Math.min(1, acc)));\n    }\n    out.push(oRow);\n  }\n\n  var box = 168;\n  var x1 = 30, x2 = 276, x3 = 522, y0 = 40;\n  var pxSize = box / S;\n\n  // Draw Input\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('输入图像 (48×48)', x1 + 32, 24);\n  for (var r = 0; r < S; r++) {\n    for (var c = 0; c < S; c++) {\n      var g = Math.round(img[r][c] * 255);\n      ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';\n      ctx.fillRect(x1 + c * pxSize, y0 + r * pxSize, pxSize + 0.5, pxSize + 0.5);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(x1, y0, box, box);\n\n  // Draw PSF Kernel\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText(names[pType] + ' (' + kDim + '×' + kDim + ')', x2 - 6, 24);\n  var kCell = box / kDim;\n  for (var i = 0; i < kDim; i++) {\n    for (var j = 0; j < kDim; j++) {\n      var v = K[i][j] / (maxAbsK || 1);\n      if (v >= 0) {\n        var b = Math.round(v * 235);\n        ctx.fillStyle = 'rgb(' + Math.round(v * 40) + ',' + Math.round(v * 185) + ',' + b + ')';\n      } else {\n        var a = Math.min(1, -v * 2.2);\n        ctx.fillStyle = 'rgb(' + Math.round(a * 236) + ',' + Math.round(a * 72) + ',' + Math.round(a * 153) + ')';\n      }\n      ctx.fillRect(x2 + j * kCell, y0 + i * kCell, kCell + 0.4, kCell + 0.4);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(x2, y0, box, box);\n  // Highlight (0,0) center\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(x2 + R * kCell, y0 + R * kCell, kCell, kCell);\n  ctx.lineWidth = 1;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('索引: -' + R + ' 到 +' + R + ' (黄框为 0,0 中心)', x2 + 4, 226);\n\n  // Draw Output\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('二维卷积输出图像', x3 + 34, 24);\n  for (var r = 0; r < S; r++) {\n    for (var c = 0; c < S; c++) {\n      var g = Math.round(out[r][c] * 255);\n      ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';\n      ctx.fillRect(x3 + c * pxSize, y0 + r * pxSize, pxSize + 0.5, pxSize + 0.5);\n    }\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.strokeRect(x3, y0, box, box);\n\n  // Operators\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 20px sans-serif';\n  ctx.fillText('★', 228, 130);\n  ctx.fillText('=', 476, 130);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('青=正权重  粉=负权重', x1 + 22, 226);\n\n  var ops512 = kDim * kDim * 512 * 512;\n  var opsM = (ops512 / 1e6).toFixed(2);\n  lab.setReadout('当前核: ' + names[pType] + ' | 尺寸: ' + kDim + '×' + kDim + ' | 若处理 512×512 图像需 ' + opsM + ' 百万次乘加运算');\n});"
    },
    {
      "type": "concept",
      "heading": "天文级的计算瓶颈与三大工程提速策略",
      "paragraphs": [
        "虽然二维卷积的原理直观优雅，但它在工程落地时面临一个致命问题——**恐怖的计算量**。直接按定义做二维卷积时，每个输出像素都要遍历整个 PSF 核里的所有元素进行乘加（MAC）。当核尺寸稍大时，计算耗时往往长得令人无法接受。",
        "为了跨越这道算力鸿沟，数字图像处理通常采用以下**三大提速策略**：第一，使用**极小的 PSF 核**（最常见的是 `3×3`），在循环中针对这 9 个像素写死高度优化的展开代码，它虽小却足以精细操控图像边缘；第二，当必须使用大尺寸 PSF 且对核的精确几何形状要求不苛刻时，选用**可分离（Separable）滤波核**，把二维卷积拆解为先按行、再按列的两趟一维卷积，速度可飙升数百倍；第三，当核既大又要求特定任意形状时，借助快速傅里叶变换执行 **FFT 卷积**。"
      ],
      "formula": {
        "expr": "Ops = M × M × N × N",
        "explain": "将 N×N 图像（如 512×512）与 M×M 的核（如 64×64）直接卷积，需要 64×64×512×512 ≈ 10.74 亿次乘法与加法运算。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（核中心与负索引）：图像滤波核必须以 (0, 0) 为中心使用正负索引；若把 3×3 或 5×5 核的原点误设在左上角 (0, 0)，整幅输出图像会向右下角整体错位偏移。",
        "避坑 2（非对称 PSF 必翻转）：求输出像素时，数学定义要求将 PSF 同时「左右翻转 + 上下翻转」；圆对称核（药丸、高斯）可免翻，但一旦处理运动模糊等非对称核，漏翻就会得出错误方向。",
        "直觉 3（低通与高通）：平滑核（高斯、药丸）靠局部平均抑制噪点但糊掉边缘；边缘增强核靠「脉冲减去平滑核」制造类似人眼马赫带的过冲，让边界猛然跃出。",
        "直觉 4（拒绝 Sinc、警惕算力）：图像不用 Sinc 核（空间域编码且 1/d 拖尾太长），日常优先选 3×3 小核或可分离核，实在躲不开大尺寸任意核再上 FFT 卷积。"
      ]
    }
  ]
});
