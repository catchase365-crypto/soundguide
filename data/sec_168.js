window.__BOOK_REGISTER_SECTION__("sec_168", {
  "title": "数字图像结构 (Digital Image Structure)",
  "intuition": "数字图像是在二维“空间域”上对物理参数（光强、温度、雷达反射等）进行网格采样的数字矩阵；它用离散的像素边缘而非正弦波来编码特征，并以人眼感知极限为尺度平衡分辨率、灰度级数与海量数据成本。",
  "blocks": [
    {
      "type": "concept",
      "heading": "像素矩阵、空间域特征与分辨率代价",
      "paragraphs": [
        "在数字信号处理（DSP）中，图像本质上是**参数在二维表面上的分布**——不仅是可见光强度，也可以是芯片表面温度、动脉血流速度或宇宙 X 射线辐射。以著名的金星微波雷达图为例，它由 **200 行 × 200 列** 共 40,000 个采样点构成，每个采样点被称为一个 **像素（Pixel，Picture Element 的缩写）**，记录着对应地表反射的微波能量（0 到 255 的整数，0 代表纯黑，255 代表纯白）。",
        "与一维信号在“时间域”编码不同，图像信息编码在 **空间域（Spatial Domain）** 中：图像里的目标特征由**边缘（Edges）**而非正弦波构成。因此，决定像素数量和间距的核心依据是**“需要看清多小的细节”**，而不是严格受限于采样定理。虽然**混叠（Aliasing）**仍会出现（例如电视主持人穿细条纹西装时，高于奈奎斯特频率的条纹会变成随身体移动的诡异明暗波纹），但在大多数成像中它只是个小麻烦而非致命问题。",
        "工程上对图像尺寸有明确的体感标准：**250×250** 属于分辨率极差（能看到明显方块感，常见于早期新兴成像设备）；**500×500** 是电视、PC 和常规科研的典型标准；超过 **1000×1000** 则属于高清电视、35mm 电影胶片级别的极佳画质；而 X 光片、航天照片等甚至需要数千像素边长。之所以不能盲目追求高像素，是因为图像的数据量极其庞大：1 秒数字音频仅约 **8 KB**，而 1 秒电视信号高达 **8 MB**；分辨率从 500×500 翻倍到 1000×1000，像素总数与传输/存储负担会**直接翻 4 倍**。"
      ],
      "formula": {
        "expr": "DataSize = Rows × Cols × BytesPerPixel",
        "explain": "图像占用的总字节数等于行数 (Rows)、列数 (Cols) 与单像素字节数 (BytesPerPixel) 的乘积。边长增加到 2 倍，数据量呈平方级暴增至 4 倍。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：采样网格、采样孔径与条纹混叠",
      "instruction": "拖动「采样网格密度」与「采样孔径」滑块，观察像素数值矩阵（模拟图 23-1）的实时变化；开启「高频条纹测试」可直观重现电视细条纹西装的混叠摩尔纹。",
      "controls": [
        {
          "type": "slider",
          "id": "gridSize",
          "label": "采样网格密度",
          "min": 8,
          "max": 64,
          "step": 4,
          "value": 24,
          "unit": "×边长"
        },
        {
          "type": "slider",
          "id": "aperture",
          "label": "采样孔径大小",
          "min": 0.5,
          "max": 3,
          "step": 0.25,
          "value": 1,
          "unit": "×网格"
        },
        {
          "type": "toggle",
          "id": "stripeMode",
          "label": "高频条纹测试 (混叠现象)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var N = lab.values.gridSize;\n  var ap = lab.values.aperture;\n  var stripe = lab.values.stripeMode;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  function sampleScene(u, v) {\n    if (stripe) {\n      return 128 + 118 * Math.sin(2 * Math.PI * (15 * u + 3 * v));\n    }\n    var val = 55 + 45 * u + 35 * v;\n    var d1 = Math.hypot(u - 0.62, v - 0.56);\n    if (d1 < 0.26) val = 205;\n    if (d1 < 0.16) val = 42;\n    if (Math.abs(u - 0.27) < 0.12 && Math.abs(v - 0.30) < 0.12) val = 235;\n    var d2 = Math.hypot(u - 0.30, v - 0.72);\n    if (d2 < 0.08) val = 240;\n    return Math.max(0, Math.min(255, val));\n  }\n\n  var size = 184;\n  var y0 = 34;\n  var x1 = 16;\n  var x2 = 224;\n  var x3 = 442;\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1. 连续物理场景 (Ground Truth)', x1, 20);\n  ctx.fillText('2. 数字采样阵列 (' + N + '×' + N + ')', x2, 20);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('3. 框选区 6×6 像素灰度数值 (0-255)', x3, 20);\n\n  var imgData = ctx.createImageData(size, size);\n  var d = imgData.data;\n  for (var py = 0; py < size; py++) {\n    var v = py / size;\n    for (var px = 0; px < size; px++) {\n      var u = px / size;\n      var val = Math.round(sampleScene(u, v));\n      var idx = (py * size + px) * 4;\n      d[idx] = val;\n      d[idx + 1] = val;\n      d[idx + 2] = val;\n      d[idx + 3] = 255;\n    }\n  }\n  ctx.putImageData(imgData, x1, y0);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(x1, y0, size, size);\n\n  var grid = [];\n  var cellPx = size / N;\n  var r = 0.5 * ap / N;\n  var sub = 4;\n  for (var iy = 0; iy < N; iy++) {\n    var row = [];\n    var vc = (iy + 0.5) / N;\n    for (var ix = 0; ix < N; ix++) {\n      var uc = (ix + 0.5) / N;\n      var sum = 0;\n      var cnt = 0;\n      for (var sy = 0; sy < sub; sy++) {\n        var dv = ((sy + 0.5) / sub - 0.5) * 2 * r;\n        for (var sx = 0; sx < sub; sx++) {\n          var du = ((sx + 0.5) / sub - 0.5) * 2 * r;\n          if (du * du + dv * dv <= r * r * 1.15) {\n            var su = Math.max(0, Math.min(1, uc + du));\n            var sv = Math.max(0, Math.min(1, vc + dv));\n            sum += sampleScene(su, sv);\n            cnt++;\n          }\n        }\n      }\n      var q = Math.round(sum / (cnt || 1));\n      row.push(q);\n      ctx.fillStyle = 'rgb(' + q + ',' + q + ',' + q + ')';\n      ctx.fillRect(x2 + ix * cellPx, y0 + iy * cellPx, Math.ceil(cellPx), Math.ceil(cellPx));\n    }\n    grid.push(row);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(x2, y0, size, size);\n\n  var zx = Math.min(N - 6, Math.floor(N * 0.38));\n  var zy = Math.min(N - 6, Math.floor(N * 0.35));\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(x2 + zx * cellPx, y0 + zy * cellPx, 6 * cellPx, 6 * cellPx);\n  ctx.lineWidth = 1;\n\n  ctx.beginPath();\n  ctx.moveTo(x2 + (zx + 6) * cellPx, y0 + zy * cellPx);\n  ctx.lineTo(x3, y0);\n  ctx.moveTo(x2 + (zx + 6) * cellPx, y0 + (zy + 6) * cellPx);\n  ctx.lineTo(x3, y0 + size);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.stroke();\n\n  var boxW = 260;\n  var cw = boxW / 6;\n  var ch = size / 6;\n  ctx.font = 'bold 11px monospace';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n  for (var j = 0; j < 6; j++) {\n    for (var i = 0; i < 6; i++) {\n      var v = grid[zy + j][zx + i];\n      var bx = x3 + i * cw;\n      var by = y0 + j * ch;\n      ctx.fillStyle = 'rgb(' + v + ',' + v + ',' + v + ')';\n      ctx.fillRect(bx, by, cw, ch);\n      ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n      ctx.strokeRect(bx, by, cw, ch);\n      ctx.fillStyle = v > 135 ? '#0f172a' : '#f8fafc';\n      ctx.fillText(String(v), bx + cw / 2, by + ch / 2);\n    }\n  }\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'alphabetic';\n\n  var totalPx = N * N;\n  var limitTxt = ap > 1.1 ? '分辨率受限于【采样孔径过宽】' : '分辨率受限于【采样网格间距】';\n  var aliasTxt = (stripe && N < 32) ? ' | ⚠ 发生混叠 (低于奈奎斯特采样率)' : (stripe && ap >= 1.75 ? ' | 孔径滤波抹平了细条纹' : '');\n  lab.setReadout('像素总数: ' + totalPx + ' px (' + totalPx + ' Bytes) | ' + limitTxt + aliasTxt);\n});"
    },
    {
      "type": "concept",
      "heading": "256 级灰度的奥秘、采样孔径与 RGB 色彩",
      "paragraphs": [
        "为什么图像处理几乎普遍采用 **256 级灰度（8-bit，单字节每像素）**？这里面有三个极其精妙的工程理由：第一，单字节完美契合计算机的内存存储架构；第二，图像庞大的像素数量能天然产生**抖动效应（Dithering）**——假设一群相邻像素在数字 145 和 146 之间交替，人眼在远处看去就会自动将它们平滑感知为 145.5 的亮度；第三，也是最核心的物理限制，**1/256（约 0.39%）的亮度台阶已经小于人类视觉系统能分辨的极限**。换言之，给肉眼看的图像即使超过 256 级灰度，观感也不会有任何提升。",
        "不过，DSP 处理的大量图像属于非视觉物理量（如医学射线强度、温度场）。为了在采集时完整保留微弱信号变化，传感器往往需要用 **超过 8-bit（如 12-bit 或 16-bit）** 来存储，后续再通过亮度与对比度映射将其“浓缩”进 256 级灰度供人眼观察。",
        "此外，每个像素并非几何上的无穷小点，而是代表连续表面上的一个小区域。例如金星探测器的**采样网格（Sampling Grid）**是 10 米 × 10 米的正方形，但发射的微波束照亮的是直径 15 米的圆形区域——这被称为**采样孔径（Sampling Aperture）**。在光学显微镜（受限于透镜与波长）或电子相机（受限于传感器电子扩散）中同样如此。最终数字图像的空间分辨率，永远取决于**采样网格与采样孔径中较大的那一个**。至于彩色图像，只需为每个像素存储红、绿、蓝（RGB）三个单字节数值，即可混合出 `256 × 256 × 256 ≈ 1680 万` 种色彩。但在科学和工程中，除非为了逼真还原现实世界，否则仅用黑白灰度图就足以充分发挥人类视觉系统的信号分析能力。"
      ],
      "formula": {
        "expr": "ΔI = 1 / 2^b ,   R_eff ≈ max(Δ_grid, D_aperture)",
        "explain": "ΔI 为 b-bit 量化下的相对亮度步长，当 b=8 时 ΔI = 1/256 ≈ 0.39%，低于人眼分辨阈值；R_eff 表示实际空间分辨率由采样网格间距 (Δ_grid) 与采样孔径直径 (D_aperture) 中的较大者决定。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：量化灰阶、视觉抖动与 RGB 色彩深度",
      "instruction": "将「量化位数」降到 2~3 bit 观察严重的色带断层（False Contouring），再开启「空间抖动补偿」体验像素交替如何骗过人眼恢复平滑渐变！",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "每像素量化位数",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "dither",
          "label": "开启空间抖动补偿 (Dithering)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "rgbMode",
          "label": "切换 RGB 彩色模式 (3×bit)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var bits = lab.values.bits;\n  var useDither = lab.values.dither;\n  var isRGB = lab.values.rgbMode;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var levels = Math.pow(2, bits);\n  var step = 255 / (levels - 1);\n  var bayer = [\n    [0, 8, 2, 10],\n    [12, 4, 14, 6],\n    [3, 11, 1, 9],\n    [15, 7, 13, 5]\n  ];\n\n  function quantize(val, x, y) {\n    var v = val;\n    if (useDither) {\n      var t = ((bayer[y & 3][x & 3] + 0.5) / 16 - 0.5) * step;\n      v = Math.max(0, Math.min(255, v + t));\n    }\n    return Math.round(Math.round(v / step) * step);\n  }\n\n  function hslToRgb(h, s, l) {\n    var c = (1 - Math.abs(2 * l - 1)) * s;\n    var hp = h * 6;\n    var x = c * (1 - Math.abs(hp % 2 - 1));\n    var r1 = 0, g1 = 0, b1 = 0;\n    if (hp < 1) { r1 = c; g1 = x; }\n    else if (hp < 2) { r1 = x; g1 = c; }\n    else if (hp < 3) { g1 = c; b1 = x; }\n    else if (hp < 4) { g1 = x; b1 = c; }\n    else if (hp < 5) { r1 = x; b1 = c; }\n    else { r1 = c; b1 = x; }\n    var m = l - c / 2;\n    return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];\n  }\n\n  var lx = 18;\n  var lw = 336;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText(isRGB ? '理想连续彩色 vs 量化/抖动效果' : '理想连续灰度 vs 量化/抖动效果', lx, 20);\n\n  var rampData = ctx.createImageData(lw, 54);\n  var rd = rampData.data;\n  for (var y = 0; y < 54; y++) {\n    for (var x = 0; x < lw; x++) {\n      var idx = (y * lw + x) * 4;\n      var t = x / (lw - 1);\n      if (!isRGB) {\n        var base = t * 255;\n        var out = (y < 16) ? Math.round(base) : quantize(base, x, y);\n        rd[idx] = out; rd[idx + 1] = out; rd[idx + 2] = out; rd[idx + 3] = 255;\n      } else {\n        var rgb = hslToRgb(t, 0.9, 0.5);\n        if (y < 16) {\n          rd[idx] = rgb[0]; rd[idx + 1] = rgb[1]; rd[idx + 2] = rgb[2]; rd[idx + 3] = 255;\n        } else {\n          rd[idx] = quantize(rgb[0], x, y);\n          rd[idx + 1] = quantize(rgb[1], x, y);\n          rd[idx + 2] = quantize(rgb[2], x, y);\n          rd[idx + 3] = 255;\n        }\n      }\n    }\n  }\n  ctx.putImageData(rampData, lx, 28);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(lx, 28, lw, 54);\n\n  var sh = 124;\n  var sy0 = 96;\n  var sphData = ctx.createImageData(lw, sh);\n  var sd = sphData.data;\n  for (var y = 0; y < sh; y++) {\n    for (var x = 0; x < lw; x++) {\n      var dx = (x - lw * 0.5) / 54;\n      var dy = (y - sh * 0.5) / 54;\n      var r2 = dx * dx + dy * dy;\n      var idx = (y * lw + x) * 4;\n      if (r2 <= 1.0) {\n        var nz = Math.sqrt(1 - r2);\n        var light = Math.max(0.05, Math.min(1, 0.15 + 0.85 * Math.max(0, -0.4 * dx - 0.5 * dy + 0.76 * nz)));\n        if (!isRGB) {\n          var v = quantize(light * 255, x, y);\n          sd[idx] = v; sd[idx + 1] = v; sd[idx + 2] = v; sd[idx + 3] = 255;\n        } else {\n          var br = light * 255;\n          sd[idx] = quantize(br * 0.95, x, y);\n          sd[idx + 1] = quantize(br * 0.55 + 30 * light, x, y);\n          sd[idx + 2] = quantize(220 * light * (0.4 + 0.6 * (x / lw)), x, y);\n          sd[idx + 3] = 255;\n        }\n      } else {\n        var bg = 22 + 30 * (x / lw);\n        var bgq = quantize(bg, x, y);\n        sd[idx] = bgq; sd[idx + 1] = bgq + 4; sd[idx + 2] = bgq + 12; sd[idx + 3] = 255;\n      }\n    }\n  }\n  ctx.putImageData(sphData, lx, sy0);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(lx, sy0, lw, sh);\n\n  var gx = 385;\n  var gy = 34;\n  var gw = 310;\n  var gh = 178;\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('量化映射曲线 (输入亮度 → 数字值 DN)', gx, 20);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var k = 0; k <= 4; k++) {\n    var yy = gy + (gh * k) / 4;\n    var xx = gx + (gw * k) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xx, gy); ctx.lineTo(xx, gy + gh); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(gx, gy + gh);\n  ctx.lineTo(gx + gw, gy);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var px = 0; px <= gw; px++) {\n    var tin = px / gw;\n    var qv = Math.round(Math.round((tin * 255) / step) * step) / 255;\n    var py = gy + gh - qv * gh;\n    if (px === 0) ctx.moveTo(gx + px, py);\n    else ctx.lineTo(gx + px, py);\n  }\n  ctx.stroke();\n  ctx.lineWidth = 1;\n\n  if (useDither) {\n    ctx.fillStyle = 'rgba(236,72,153,0.75)';\n    for (var px = 0; px <= gw; px += 4) {\n      var tin = px / gw;\n      var qd = quantize(tin * 255, px, (px * 3) & 3) / 255;\n      ctx.fillRect(gx + px - 1, gy + gh - qd * gh - 1, 3, 3);\n    }\n  }\n\n  var stepPct = (100 / levels).toFixed(2);\n  ctx.font = 'bold 12px sans-serif';\n  if (bits === 8) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('✓ 步长 ' + stepPct + '% < 人眼分辨极限 (无断层)', gx + 10, gy + 20);\n  } else {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('⚠ 量化台阶 ' + stepPct + '% (肉眼可见色带)', gx + 10, gy + 20);\n  }\n\n  var totalColors = isRGB ? Math.pow(levels, 3) : levels;\n  var colorStr = isRGB ? ('RGB 色彩数: ' + totalColors.toLocaleString() + ' 色') : ('灰阶总数: ' + levels + ' 级');\n  lab.setReadout('位深: ' + (isRGB ? bits * 3 : bits) + '-bit | ' + colorStr + ' | 单步亮度跳变: ' + stepPct + '% | 抖动补偿: ' + (useDither ? '开启' : '关闭'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "空间域优先边缘而非波形：评估图像采样密度时，核心看“能分辨多小的物体边缘”，而不是死磕奈奎斯特正弦采样定理；但周期性细密纹理（如条纹西装）依然会产生混叠摩尔纹。",
        "算力与带宽的平方诅咒：图像边长每增加 1 倍，像素总数与传输时间就暴涨 4 倍；在满足识别需求的前提下，切忌盲目堆砌高分辨率。",
        "分辨率短板效应：数字图像的实际清晰度受限于“采样网格间距”和“采样孔径直径”中更大的那个（物理上常见光学模糊或电子扩散限制了孔径）。",
        "8-bit 灰度的黄金法则：1/256 (0.39%) 的亮度步长已经超越人眼分辨力，加之像素天然的抖动效应，面向人眼显示的图像无需超过 256 级灰度；但采集非视觉科学信号（如热成像、X 光）仍需用 >8-bit 保留微弱细节。",
        "科研多用灰度，展示才用彩色：RGB 三通道可合成 1680 万色（3 字节/像素），但科学与工程分析往往只需要单字节灰度图，把人眼当作高效的二维信号分析工具即可。"
      ]
    }
  ]
});
