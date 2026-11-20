window.__BOOK_REGISTER_SECTION__("sec_178", {
  "title": "图像的傅里叶分析 (Fourier Image Analysis)",
  "intuition": "图像的信息藏在“空间边缘”而非频率里，二维傅里叶变换只是把图像拆成不同频率和方向的“二维海浪”波纹，虽不适合用来直接设计滤波器，却是实现快速二维卷积与 CT 断层重建的核心数学工具。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么图像较少在频域“找信息”或“做滤波”？",
      "paragraphs": [
        "在一维信号（如音频）中，时域波形杂乱无章，一旦做傅里叶变换转到频域，音调与谐波结构立刻一目了然。但图像恰恰相反：**图像的信息原本就直观地编码在空间域中**。当你对一幅清晰的照片做二维傅里叶变换后，空间结构反而被打乱成看似随机噪点般的频谱，无法帮人直接理解画面内容。",
        "同样地，图像滤波也很少在频域设计高通、低通滤波器。因为图像最核心的视觉特征是分隔不同物体的**边缘（Edge）**，而一个锐利的边缘是由极宽范围的频率成分共同叠加而成的——在频域硬切某一段频率往往事倍功半。因此，图像滤波通常直接在空间域以**平滑（Smoothing）**或**边缘增强（Edge Enhancement）**核来实现。",
        "尽管如此，图像的频域分析依然有两大不可替代的工程价值：**第一，空间域卷积等价于频域逐点相乘**（这是大型卷积核采用 FFT 快速卷积以及反卷积复原的基础）；**第二，傅里叶切片定理（Fourier Slice Theorem）**揭示了图像与其侧面投影之间的频域映射关系，这正是现代医学与工业 **CT（计算机断层扫描）** 成像的数学基石。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "2. 二维 FFT 的计算配方：行变换 + 列变换",
      "paragraphs": [
        "计算一幅图像的二维频谱最实用的方法是二维快速傅里叶变换（2D FFT）。输入图像必须具有 `N × N` 的尺寸且 `N` 为 2 的幂（如 256、512、1024；若不满足则补零填充）。算法需要准备两个相同大小的二维数组：**实部数组（Real Array，初始存放原始图像灰度）**与**虚部数组（Imaginary Array，初始全为 0）**。",
        "计算步骤非常优雅，只需把二维问题拆成两次一维 FFT：**第一步（行变换）**，依次对实部数组第 `0` 到 `N-1` 行的 `N` 个像素做一维 FFT，将输出的实部存回实部数组对应行，虚部存入虚部数组对应行，得到一幅“中间图像”；**第二步（列变换）**，再对中间图像第 `0` 到 `N-1` 列的 `N` 个复数（同时读取实部与虚部数组对应列）做一维 FFT，覆写回两个数组，即得到完整的二维频谱。",
        "由于图像在水平与垂直方向上是等价的，**先做列变换再做行变换结果完全一致**。同样地，二维逆傅里叶变换（2D IFFT）也只需按行、按列依次执行一维逆 FFT 即可。需要注意算力开销：一幅 `512 × 512` 的图像包含的像素数几乎与整本教材的单词数相当，在早期个人电脑上跑一次二维 FFT 需要数分钟（比每秒 30 帧的实时处理慢约一万倍），因此大尺寸频域处理对计算硬件有较高要求。"
      ],
      "formula": {
        "expr": "2D-FFT(Image) = FFT_cols( FFT_rows(Image) )",
        "explain": "先对所有行分别做一维 FFT，再对中间结果的所有列分别做一维 FFT（行列顺序可互换）。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 频域点对与二维正弦波：多了一个“方向”维度",
      "paragraphs": [
        "一维傅里叶变换中的每一对共轭频点对应时域的一个一维正弦波，由频率、幅度、相位三个要素决定。而在二维图像中，频域里的每一对点对应空间域里的一个**二维正弦波**——看起来就像海面上一排排平行推进的波浪。除了频率、幅度、相位外，二维正弦波还多了一个关键属性：**传播方向（Direction）**。",
        "频域坐标 `[0, 0]` 是一个特殊点，它自己与自己配对，代表零频率分量，即整幅图像的**直流（DC）平均亮度**。对于其他任意一对频域点，如果从该点向其所在象限外侧角落的零频参考点（在 FFT 默认四角格式下为四个角 `[0,0]`、`[0,N-1]`、`[N-1,0]`、`[N-1,N-1]`；在中心化格式下为图像正中心 `[N/2, N/2]`）连一条直线：**这条线的方向就决定了空间海浪的法线方向，而线的长度则正比于海浪的空间频率（波纹密集程度）**。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：二维正弦波与频域点对的几何对应",
      "instruction": "拖动水平/垂直频率滑块与相位滑块，观察右侧频域点对的位置、连线长度与方向如何实时控制左侧空间域“海浪”的疏密与朝向；切换“频谱中心化”开关对比两种显示格式。",
      "controls": [
        {
          "type": "slider",
          "id": "kx",
          "label": "水平频率索引 (c)",
          "min": -8,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "ky",
          "label": "垂直频率索引 (r)",
          "min": -8,
          "max": 8,
          "step": 1,
          "value": -2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "波纹相位角",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "centerZero",
          "label": "频谱中心化 (零频移至中心)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var kx = lab.values.kx;\n  var ky = lab.values.ky;\n  var phi = lab.values.phase * Math.PI / 180;\n  var centerZero = lab.values.centerZero;\n\n  var size = 184;\n  var sx0 = 28, sy0 = 32;\n  var fx0 = 284, fy0 = 32;\n  var N = 32;\n\n  var img = ctx.createImageData(size, size);\n  var d = img.data;\n  for (var py = 0; py < size; py++) {\n    var ny = py / size;\n    for (var px = 0; px < size; px++) {\n      var nx = px / size;\n      var val = (kx === 0 && ky === 0)\n        ? (128 + 100 * Math.cos(phi))\n        : (128 + 125 * Math.cos(2 * Math.PI * (kx * nx + ky * ny) + phi));\n      if (val < 0) val = 0;\n      if (val > 255) val = 255;\n      var idx = (py * size + px) * 4;\n      d[idx] = val;\n      d[idx + 1] = val;\n      d[idx + 2] = val;\n      d[idx + 3] = 255;\n    }\n  }\n  ctx.putImageData(img, sx0, sy0);\n  ctx.strokeStyle = '#475569';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(sx0, sy0, size, size);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('空间域 (Spatial Domain): 2D 正弦波', sx0, 20);\n  ctx.fillText(centerZero ? '频域 (零频在中心)' : '频域 (FFT 默认低频在四角)', fx0, 20);\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(fx0, fy0, size, size);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 1; g < 4; g++) {\n    var gp = size * g / 4;\n    ctx.beginPath();\n    ctx.moveTo(fx0 + gp, fy0); ctx.lineTo(fx0 + gp, fy0 + size);\n    ctx.moveTo(fx0, fy0 + gp); ctx.lineTo(fx0 + size, fy0 + gp);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(fx0 + size / 2, fy0); ctx.lineTo(fx0 + size / 2, fy0 + size);\n  ctx.moveTo(fx0, fy0 + size / 2); ctx.lineTo(fx0 + size, fy0 + size / 2);\n  ctx.stroke();\n  ctx.strokeStyle = '#475569';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(fx0, fy0, size, size);\n\n  var r1 = ((ky % N) + N) % N;\n  var c1 = ((kx % N) + N) % N;\n  var r2 = (N - r1) % N;\n  var c2 = (N - c1) % N;\n\n  var dr1 = centerZero ? (r1 + N / 2) % N : r1;\n  var dc1 = centerZero ? (c1 + N / 2) % N : c1;\n  var dr2 = centerZero ? (r2 + N / 2) % N : r2;\n  var dc2 = centerZero ? (c2 + N / 2) % N : c2;\n\n  var toPx = function(c, r) {\n    return { x: fx0 + (c / N) * size, y: fy0 + (r / N) * size };\n  };\n\n  var zeros = centerZero\n    ? [{ c: N / 2, r: N / 2 }]\n    : [{ c: 0, r: 0 }, { c: N, r: 0 }, { c: 0, r: N }, { c: N, r: N }];\n\n  for (var zi = 0; zi < zeros.length; zi++) {\n    var zp = toPx(zeros[zi].c, zeros[zi].r);\n    ctx.beginPath();\n    ctx.arc(zp.x, zp.y, 4.5, 0, Math.PI * 2);\n    ctx.strokeStyle = '#94a3b8';\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n  }\n\n  var p1 = toPx(dc1, dr1);\n  var p2 = toPx(dc2, dr2);\n  var z1 = centerZero ? toPx(N / 2, N / 2) : toPx(dc1 < N / 2 ? 0 : N, dr1 < N / 2 ? 0 : N);\n  var z2 = centerZero ? toPx(N / 2, N / 2) : toPx(dc2 < N / 2 ? 0 : N, dr2 < N / 2 ? 0 : N);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(z1.x, z1.y); ctx.lineTo(p1.x, p1.y);\n  ctx.moveTo(z2.x, z2.y); ctx.lineTo(p2.x, p2.y);\n  ctx.stroke();\n\n  var isSelf = (dc1 === dc2 && dr1 === dr2);\n  if (isSelf) {\n    ctx.beginPath();\n    ctx.arc(p1.x, p1.y, 6, 0, Math.PI * 2);\n    ctx.fillStyle = '#ec4899';\n    ctx.fill();\n  } else {\n    ctx.beginPath();\n    ctx.arc(p2.x, p2.y, 5.5, 0, Math.PI * 2);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fill();\n    ctx.beginPath();\n    ctx.arc(p1.x, p1.y, 5.5, 0, Math.PI * 2);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 18px sans-serif';\n  ctx.fillText('⇄', 238, 128);\n\n  var ix = 500;\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('频点坐标 (网格 N = 32):', ix, 48);\n  if (isSelf) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('● 自匹配零频点: [' + r1 + ', ' + c1 + ']', ix, 74);\n  } else {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('● 正频点: [' + r1 + ', ' + c1 + ']', ix, 74);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('● 共轭负频点: [' + r2 + ', ' + c2 + ']', ix, 96);\n  }\n  ctx.fillStyle = '#10b981';\n  var freqMag = Math.sqrt(kx * kx + ky * ky).toFixed(2);\n  var angleDeg = (kx === 0 && ky === 0) ? '0.0' : (Math.atan2(ky, kx) * 180 / Math.PI).toFixed(1);\n  ctx.fillText('— 连线长度 (频率): ' + freqMag, ix, 130);\n  ctx.fillText('— 连线角度 (方向): ' + angleDeg + '°', ix, 152);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('灰圈代表零频 (DC) 参考位置', ix, 188);\n  ctx.fillText('连线越长，空间波纹越密', ix, 208);\n\n  lab.setReadout('频率矢量: (c=' + kx + ', r=' + ky + ') | |k|=' + freqMag + ' | 相位=' + lab.values.phase + '° | 模式=' + (centerZero ? '中心零频显示' : '四角低频存储'));\n});"
    },
    {
      "type": "concept",
      "heading": "4. 频谱的周期性（瓷砖墙）、中心化搬移与共轭对称",
      "paragraphs": [
        "由于空间域图像是**离散采样**的，它的二维频谱必然是**周期性**的——就像一面由无数块完全相同的 `N × N` 频谱瓷砖向左右上下无限平铺而成的墙。FFT 算法算出的原始数组默认把低频放在四个角、高频放在中央；但为了符合人类视觉习惯（并与连续图像非周期频谱“零频在中心、高频向四周延伸”保持一致），在论文与教材展示时，通常会将频谱在周期瓷砖墙上水平与垂直各平移 `N/2` 像素（即所谓的 **FFT Shift**），让框选窗口正好跨过四块瓷砖的交界处，从而把四个原本分散在角落的亮斑（低频）聚拢到画面正中心。",
        "此外，实数图像的二维频谱以第 `N/2` 行和第 `N/2` 列为界分成四个象限，满足严格的**共轭对称性**：对于**实部和幅度谱**，右上象限是左下象限的中心镜像，左上象限是右下象限的中心镜像；对于**虚部和相位谱**，镜像位置的数值大小相等但**正负号相反**（即一对正负频率）。考虑到周期性边界（`X[r, N]` 等价于 `X[r, 0]`），整个频谱中只有 `[0,0]`、`[0,N/2]`、`[N/2,0]`、`[N/2,N/2]` 这 4 个点与自身配对。"
      ],
      "formula": {
        "expr": "Re X[r, c] = Re X[N - r, N - c],   Im X[r, c] = -Im X[N - r, N - c]",
        "explain": "二维频谱共轭对称公式：r 与 c 分别表示行与列索引，N 为图像边长（索引超出 N-1 时按模 N 周期卷绕）。幅度谱同实部对称，相位谱同虚部反号对称。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：真实 2D FFT 频谱、周期瓷砖墙与 N/2 中心化搬移",
      "instruction": "拖动“周期平移进度”滑块，亲眼见证青色窗口如何在 2×2 周期瓷砖墙上斜向滑动，把四个角落的低频亮斑聚拢到正中心；转动矩形边缘倾角，观察垂直于边缘的频谱亮线如何随之旋转。",
      "controls": [
        {
          "type": "slider",
          "id": "shiftFrac",
          "label": "周期平移进度 (0 → N/2)",
          "min": 0,
          "max": 100,
          "step": 2,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "edgeAngle",
          "label": "空间域矩形边缘倾角",
          "min": 0,
          "max": 180,
          "step": 5,
          "value": 30,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showTiles",
          "label": "显示 2×2 周期平铺瓷砖墙",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  var N = 64;\n  var shift = Math.round(32 * lab.values.shiftFrac / 100);\n  var rad = lab.values.edgeAngle * Math.PI / 180;\n  var showTiles = lab.values.showTiles;\n\n  function fft1d(re, im, lenN) {\n    for (var i = 1, j = 0; i < lenN; i++) {\n      var bit = lenN >> 1;\n      for (; j & bit; bit >>= 1) j ^= bit;\n      j ^= bit;\n      if (i < j) {\n        var tr = re[i]; re[i] = re[j]; re[j] = tr;\n        var ti = im[i]; im[i] = im[j]; im[j] = ti;\n      }\n    }\n    for (var len = 2; len <= lenN; len <<= 1) {\n      var ang = -2 * Math.PI / len;\n      var wlenRe = Math.cos(ang), wlenIm = Math.sin(ang);\n      for (var i = 0; i < lenN; i += len) {\n        var wRe = 1, wIm = 0;\n        for (var k = 0; k < len / 2; k++) {\n          var uRe = re[i + k], uIm = im[i + k];\n          var idx2 = i + k + len / 2;\n          var vRe = re[idx2] * wRe - im[idx2] * wIm;\n          var vIm = re[idx2] * wIm + im[idx2] * wRe;\n          re[i + k] = uRe + vRe;\n          im[i + k] = uIm + vIm;\n          re[idx2] = uRe - vRe;\n          im[idx2] = uIm - vIm;\n          var nextWRe = wRe * wlenRe - wIm * wlenIm;\n          wIm = wRe * wlenIm + wIm * wlenRe;\n          wRe = nextWRe;\n        }\n      }\n    }\n  }\n\n  var real = new Float64Array(N * N);\n  var imag = new Float64Array(N * N);\n  var spatial = new Uint8Array(N * N);\n  var cosA = Math.cos(rad), sinA = Math.sin(rad);\n  for (var r = 0; r < N; r++) {\n    var dy = r - 31.5;\n    for (var c = 0; c < N; c++) {\n      var dx = c - 31.5;\n      var rx = dx * cosA + dy * sinA;\n      var ry = -dx * sinA + dy * cosA;\n      var v = (Math.abs(rx) < 14 && Math.abs(ry) < 5) ? 245 : 18;\n      spatial[r * N + c] = v;\n      real[r * N + c] = v;\n    }\n  }\n\n  var rowRe = new Float64Array(N), rowIm = new Float64Array(N);\n  for (var r = 0; r < N; r++) {\n    for (var c = 0; c < N; c++) { rowRe[c] = real[r * N + c]; rowIm[c] = imag[r * N + c]; }\n    fft1d(rowRe, rowIm, N);\n    for (var c = 0; c < N; c++) { real[r * N + c] = rowRe[c]; imag[r * N + c] = rowIm[c]; }\n  }\n  for (var c = 0; c < N; c++) {\n    for (var r = 0; r < N; r++) { rowRe[r] = real[r * N + c]; rowIm[r] = imag[r * N + c]; }\n    fft1d(rowRe, rowIm, N);\n    for (var r = 0; r < N; r++) { real[r * N + c] = rowRe[r]; imag[r * N + c] = rowIm[r]; }\n  }\n\n  var mag = new Uint8Array(N * N);\n  var maxLog = 0;\n  var logs = new Float64Array(N * N);\n  for (var i = 0; i < N * N; i++) {\n    var m = Math.sqrt(real[i] * real[i] + imag[i] * imag[i]);\n    var l = Math.log(1 + m * 0.2);\n    logs[i] = l;\n    if (l > maxLog) maxLog = l;\n  }\n  for (var i = 0; i < N * N; i++) {\n    var norm = maxLog > 0 ? Math.pow(logs[i] / maxLog, 1.35) : 0;\n    mag[i] = Math.min(255, Math.floor(norm * 255));\n  }\n\n  var box = 176, y0 = 36;\n  var x1 = 26, x2 = 272, x3 = 518;\n\n  var img1 = ctx.createImageData(box, box);\n  var img2 = ctx.createImageData(box, box);\n  var img3 = ctx.createImageData(box, box);\n\n  for (var py = 0; py < box; py++) {\n    var sy = Math.floor(py * N / box);\n    var ty = showTiles ? Math.floor(py * (2 * N) / box) % N : (sy + shift) % N;\n    var wy = (sy + shift) % N;\n    for (var px = 0; px < box; px++) {\n      var sx = Math.floor(px * N / box);\n      var tx = showTiles ? Math.floor(px * (2 * N) / box) % N : (sx + shift) % N;\n      var wx = (sx + shift) % N;\n      var pIdx = (py * box + px) * 4;\n\n      var v1 = spatial[sy * N + sx];\n      img1.data[pIdx] = v1; img1.data[pIdx + 1] = v1; img1.data[pIdx + 2] = v1; img1.data[pIdx + 3] = 255;\n\n      var v2 = mag[ty * N + tx];\n      img2.data[pIdx] = v2; img2.data[pIdx + 1] = v2; img2.data[pIdx + 2] = v2; img2.data[pIdx + 3] = 255;\n\n      var v3 = mag[wy * N + wx];\n      img3.data[pIdx] = v3; img3.data[pIdx + 1] = v3; img3.data[pIdx + 2] = v3; img3.data[pIdx + 3] = 255;\n    }\n  }\n\n  ctx.putImageData(img1, x1, y0);\n  ctx.putImageData(img2, x2, y0);\n  ctx.putImageData(img3, x3, y0);\n\n  ctx.strokeStyle = '#475569';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(x1, y0, box, box);\n  ctx.strokeRect(x2, y0, box, box);\n  ctx.strokeRect(x3, y0, box, box);\n\n  if (showTiles) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x2 + box / 2, y0); ctx.lineTo(x2 + box / 2, y0 + box);\n    ctx.moveTo(x2, y0 + box / 2); ctx.lineTo(x2 + box, y0 + box / 2);\n    ctx.stroke();\n\n    var winSize = box / 2;\n    var winOffset = (shift / N) * (box / 2);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.strokeRect(x2 + winOffset, y0 + winOffset, winSize, winSize);\n  }\n\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n  ctx.lineWidth = 1;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(x3 + box / 2, y0); ctx.lineTo(x3 + box / 2, y0 + box);\n  ctx.moveTo(x3, y0 + box / 2); ctx.lineTo(x3 + box, y0 + box / 2);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('1. 空间域输入 (64×64)', x1, 22);\n  ctx.fillText(showTiles ? '2. 2×2 周期瓷砖墙与取景框' : '2. 频谱实时预览', x2, 22);\n  ctx.fillText('3. 提取的 N×N 频谱幅度', x3, 22);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 16px sans-serif';\n  ctx.fillText('→', 228, 128);\n  ctx.fillText('→', 474, 128);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(shift === 32 ? '零频已精准汇聚至正中心' : (shift === 0 ? '低频分布于四个角落' : '正在跨越瓷砖边界平移...'), x3, 228);\n\n  lab.setReadout('2D FFT 尺寸: 64×64 | 平移量: ' + shift + ' px (N/2=32) | 边缘倾角: ' + lab.values.edgeAngle + '° | 频谱能量主轴总是垂直于空间边缘');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要用高通/低通频域思想硬套图像滤波设计：图像的边缘覆盖宽广频段，大多数去噪与锐化滤波器直接放在空间域设计更直观高效；频域最核心的用途是实现大核 FFT 快速卷积与 CT 切片重建。",
        "算对实部和虚部的传递链：写 2D FFT 代码做完所有行的变换后，千万别漏掉虚部数组！第二轮对列做一维 FFT 时，必须同时把实部数组和虚部数组中的中间结果作为复数输入。",
        "分清显示格式与计算格式：给人看图、写文档时应做 N/2 平移（FFT Shift）将零频放在正中心；但在电脑内存里做乘法或反变换运算时，通常保持 FFT 原生的“低频在四角”格式，省去不必要的数据搬移。",
        "利用共轭对称性省算力或查 Bug：实数图像频谱的一半信息其实可以通过公式 [r, c] 与 [N-r, N-c] 互相推导出，写代码验证二维 FFT 正确性时，最快捷的办法就是检查实部是否中心对称、虚部是否中心反号，以及 4 个自匹配点的虚部是否为 0。"
      ]
    }
  ]
});
