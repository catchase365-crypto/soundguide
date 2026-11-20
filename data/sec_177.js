window.__BOOK_REGISTER_SECTION__("sec_177", {
  "title": "大尺寸 PSF 实战：光照平坦化与同态滤波 (Illumination Flattening)",
  "intuition": "现实图像是物体“反射率”与环境“光照”的乘积而非相加，因此必须先用超大模糊核估算出缓慢变化的光照，再通过“除法”或“取对数后相减”才能同时救回暗部的亮度与对比度。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么阴影里不仅“太暗”，而且“看不清”？（图像形成的乘法模型）",
      "paragraphs": [
        "除了自发光物体外，人眼和相机看到的一切图像都是**反射光**。这意味着观测到的图像 `c` 并不是物体本身，而是物体固有的**反射率（Reflectance）** `a` 与照射在上面的**环境光照（Illumination）** `b` 逐像素**相乘**的结果。",
        "想象两个穿着一模一样的双胞胎：一个站在烈日下，另一个站在树荫里。两人的反射率完全相同——比如脸部反射 80% 的光、灰色衬衫反射 40%、深色裤子反射 5%。但如果阳光比树荫亮 10 倍，树荫里的人不仅整体亮度暗 10 倍，他脸上、衬衫和裤子之间的**亮暗差值（对比度）也会同步萎缩 10 倍**。",
        "在空间变化规律上，这两个分量截然不同：物体反射率 `a` 包含大量锐利边界和细节，**变化极快**；而自然界的光照 `b` 往往是平缓过渡的，**变化极慢**。我们的目标，就是从混杂了光照的观测图像 `c` 中，把纯粹的反射率 `a` 剥离出来，让整幅画面的光照变得“平坦”。"
      ],
      "formula": {
        "expr": "c(x, y) = a(x, y) × b(x, y)",
        "explain": "c(x, y) 是传感器/人眼最终看到的亮度图像；a(x, y) 是物体本身的反射率（高频细节丰富）；b(x, y) 是环境光照分布（低频平缓变化）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 大卷积核估光，以及“线性相减”与“非线性相除”的分水岭",
      "paragraphs": [
        "为了把 `a` 和 `b` 分开，第一步是利用**超大尺寸的点扩散函数（PSF）**（例如核宽度达到整幅图像宽度的 1/5）对观测图像 `c` 做平滑卷积。借助可分离递归滤波器的技巧，哪怕卷积核极大，计算复杂度也与核大小无关，仅需几百毫秒即可完成。只要卷积核远宽于物体细节，高频条纹就会被彻底抹平，得到的平滑图像 `d` 就是对原始光照 `b` 的近似。",
        "接下来最容易踩坑：**既然高通滤波（边缘增强）等于“原图减去平滑图”，那直接计算 `c - d` 不就行了吗？** 答案是**彻底失败**！线性滤波只能分离“相加”的信号，对“相乘”的信号无能为力。执行 `c - d` 后，阴影区整体确实变亮了，但暗部原本被压缩了 10 倍的峰谷振幅依然微弱，画面依旧灰蒙蒙一片、毫无对比度。",
        "真正的解法是**逆向解乘（Unmultiply）**：把观测图像 `c` 逐像素**除以**平滑估计出的光照图 `d`。由于 `(a × b) ÷ (k × b) ≈ a / k`，被光照压扁的暗部振幅会被精确地按比例放大，从而在校正亮度的同时完美恢复对比度。"
      ],
      "formula": {
        "expr": "f(x, y) = c(x, y) ÷ d(x, y)  ≈  [a(x, y) · b(x, y)] ÷ [mean(a) · b(x, y)]  ∝  a(x, y)",
        "explain": "d(x, y) 是用大尺度高斯 PSF 平滑 c 后得到的光照近似；将 c 除以 d 即可消去共有的光照因子 b(x, y)，同时救回暗部的绝对亮度与相对对比度。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：对比度挽救战——线性相减 (c - d) vs. 非线性相除 (c ÷ d)",
      "instruction": "先观察默认的非线性相除效果，再关闭“使用非线性相除”开关对比线性相减的惨状；尝试把 PSF 核宽度调到 5% 以下，观察核太小时发生什么。",
      "controls": [
        {
          "type": "slider",
          "id": "minIllum",
          "label": "左侧阴影亮度 (相对于右侧)",
          "min": 0.05,
          "max": 0.6,
          "step": 0.01,
          "value": 0.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "psfPct",
          "label": "PSF 平滑核宽度",
          "min": 2,
          "max": 35,
          "step": 1,
          "value": 20,
          "unit": " %"
        },
        {
          "type": "toggle",
          "id": "useDivide",
          "label": "使用非线性相除 (c ÷ d) [关闭则用线性相减 c - d]",
          "value": true
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height;\nvar ctx = lab.ctx;\nfunction boxSmooth(src, r) {\n  var n = src.length;\n  var out = new Array(n);\n  var rad = Math.max(1, Math.round(r));\n  var win = 2 * rad + 1;\n  var sum = 0;\n  for (var k = -rad; k <= rad; k++) {\n    var idx = k < 0 ? 0 : (k >= n ? n - 1 : k);\n    sum += src[idx];\n  }\n  for (var i = 0; i < n; i++) {\n    out[i] = sum / win;\n    var iRem = i - rad;\n    var iAdd = i + rad + 1;\n    sum += src[iAdd >= n ? n - 1 : iAdd] - src[iRem < 0 ? 0 : iRem];\n  }\n  return out;\n}\nfunction render() {\n  var minIllum = lab.values.minIllum;\n  var psfPct = lab.values.psfPct;\n  var useDivide = lab.values.useDivide;\n  var padL = 36, padR = 24, plotW = W - padL - padR;\n  var n = 330;\n  var a = new Array(n), b = new Array(n), c = new Array(n);\n  for (var i = 0; i < n; i++) {\n    var t = i / (n - 1);\n    a[i] = 0.08 + 0.88 * (0.5 + 0.5 * Math.cos(2 * Math.PI * 20 * t));\n    b[i] = minIllum + (1.0 - minIllum) * t;\n    c[i] = a[i] * b[i];\n  }\n  var passR = Math.max(1, Math.round((psfPct / 100) * n * 0.28));\n  var d = boxSmooth(boxSmooth(boxSmooth(c, passR), passR), passR);\n  var f = new Array(n);\n  for (var i = 0; i < n; i++) {\n    if (useDivide) {\n      f[i] = 0.52 * (c[i] / Math.max(0.005, d[i]));\n    } else {\n      f[i] = (c[i] - d[i]) + 0.5;\n    }\n  }\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  var stripY1 = 10, stripH = 22, stripY2 = 38;\n  for (var i = 0; i < n; i++) {\n    var x = padL + (i / n) * plotW;\n    var w = Math.ceil(plotW / n) + 1;\n    var vc = Math.max(0, Math.min(255, Math.round(c[i] * 255)));\n    ctx.fillStyle = 'rgb(' + vc + ',' + vc + ',' + vc + ')';\n    ctx.fillRect(x, stripY1, w, stripH);\n    var vf = Math.max(0, Math.min(255, Math.round(f[i] * 255)));\n    ctx.fillStyle = 'rgb(' + vf + ',' + vf + ',' + vf + ')';\n    ctx.fillRect(x, stripY2, w, stripH);\n  }\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('观测 c', 2, stripY1 + 15);\n  ctx.fillStyle = useDivide ? '#10b981' : '#ec4899';\n  ctx.fillText(useDivide ? 'c ÷ d' : 'c - d', 2, stripY2 + 15);\n  var plotT = 76, plotB = 224, plotH = plotB - plotT;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = plotT + (g / 4) * plotH;\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();\n  }\n  function drawCurve(arr, color, lw, dash) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dash) ctx.setLineDash(dash);\n    ctx.beginPath();\n    for (var i = 0; i < n; i++) {\n      var x = padL + (i / (n - 1)) * plotW;\n      var clamped = Math.max(-0.05, Math.min(1.12, arr[i]));\n      var y = plotB - clamped * plotH;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n  drawCurve(c, 'rgba(245,158,11,0.55)', 1.3, null);\n  drawCurve(d, '#38bdf8', 2.0, [5, 4]);\n  drawCurve(f, useDivide ? '#10b981' : '#ec4899', 2.2, null);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1.0', 8, plotT + 4);\n  ctx.fillText('0.5', 8, plotT + plotH * 0.5 + 4);\n  ctx.fillText('0.0', 8, plotB + 4);\n  ctx.fillStyle = 'rgba(245,158,11,0.9)'; ctx.fillText('— 观测图 c', padL + 6, plotT + 12);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('-- 估计光照 d', padL + 95, plotT + 12);\n  ctx.fillStyle = useDivide ? '#10b981' : '#ec4899';\n  ctx.fillText(useDivide ? '— 恢复输出 (c ÷ d)' : '— 恢复输出 (c - d + 0.5)', padL + 200, plotT + 12);\n  var minL = 99, maxL = -99, minR = 99, maxR = -99;\n  for (var i = 0; i < 60; i++) { if (f[i] < minL) minL = f[i]; if (f[i] > maxL) maxL = f[i]; }\n  for (var i = n - 60; i < n; i++) { if (f[i] < minR) minR = f[i]; if (f[i] > maxR) maxR = f[i]; }\n  var cL = (maxL - minL).toFixed(2), cR = (maxR - minR).toFixed(2);\n  lab.setReadout('模式: ' + (useDivide ? '非线性相除 (c÷d)' : '线性相减 (c-d)') + ' | 左侧暗部峰谷对比度: ' + cL + ' | 右侧亮部峰谷对比度: ' + cR + ' | 核宽: ' + psfPct + '%');\n}\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "3. 同态滤波（Homomorphic Processing）与人眼的生物智慧",
      "paragraphs": [
        "“直接相除”在数学上与经典的**同态处理（Homomorphic Processing）**殊途同归。同态滤波的核心思想是：**利用数学变换把棘手的非线性乘法问题，转化为熟悉的线性加法问题**。",
        "具体流程是：先对观测图像 `c` 取**对数**，利用恒等式 `log(a × b) = log(a) + log(b)`，将乘在一起的反射率与光照变成相加的两项；接着用普通的**线性高通滤波器**（即“原对数图减去平滑后的对数图”）轻松剔除低频的 `log(b)`；最后再取**反对数（指数 `exp`）**，还原出反射率图像。",
        "那么“直接相除”和“走同态对数路径”谁更好？其实两者几乎等价，因为先取对数再相减在代数上就等同于相除。唯一的细微差别在于**对光照的近似方式不同**：直接相除是用“原图平滑后的算术均值”估算光照，而同态滤波是用“对数图平滑后的几何均值”估算光照。",
        "有趣的是，大自然早就在生物视觉中进化出了这套算法！人眼视网膜的第一层是非线性感光层，近似对输入光强**取对数**；紧接着的中间层则是一个线性边缘增强（高通）网络。换言之，**人类的眼睛本身就是一台精密的同态处理器**，这正是我们能在明暗悬殊的复杂光线下依然看清阴影细节的原因。此外，传统胶片摄影中底片的密度正比于照片亮度的对数，因此在暗房冲洗阶段对底片做的任何调整，本质上也属于同态处理。"
      ],
      "formula": {
        "expr": "f(x, y) = exp( log(c(x, y)) − smooth(log(c(x, y))) )",
        "explain": "先取对数把乘法转为加法，再用大尺寸平滑核减去低频光照对数分量，最后用指数函数 exp 恢复到线性亮度空间。"
      }
    },
    {
      "type": "concept",
      "heading": "4. 大卷积核的边界陷阱：黑边成因与“全 1 图”归一化修正",
      "paragraphs": [
        "在使用大尺寸 PSF 做光照估计时，工程实现上有一个极易忽略的**边界效应（Boundary Condition）**。理论上 `M × M` 的图像与 `N × N` 的核卷积会得到 `(M+N-1) × (M+N-1)` 的更大图像，但为了不频繁调整内存与显示分辨率，工程上通常直接把超出原始 `M × M` 边界的像素裁掉。",
        "问题随之而来：当你计算平滑图像 `d` 的右上角像素时，高斯卷积核的中心对齐原图右上角，此时其实有 **四分之三（75%）的卷积核悬空在图像边界之外**！最偷懒的做法是把图像外部未定义的像素全部补零（Zero-padding），但这会导致平滑图像 `d` 的四周边缘亮度平滑衰减到零，形成一圈明显的**黑边**（做除法 `c ÷ d` 时更会导致图像边缘亮度畸变甚至过曝）。",
        "修正这一边界黑边的方法极其优雅：只需把每个像素的平滑结果 `d(x, y)` 除以一个**修正因子**——即计算该像素时**卷积核真正落在输入图像内部的有效权重比例**（例如中心像素比例为 1.0，四条边沿为 0.5，四个角点仅为 0.25）。怎么一次性求出全图每个像素的修正因子呢？只需**把同一个 PSF 卷积核，与一幅所有像素值全为 1 的同尺寸图像做一次零填充卷积**，得到的输出图像就是精确的逐像素修正因子图！"
      ],
      "formula": {
        "expr": "d_corrected(x, y) = d(x, y) ÷ (PSF * Ones)(x, y)",
        "explain": "Ones 是尺寸与原图相同、像素值全为 1 的图像；(PSF * Ones) 计算出每个像素位置处卷积核与有效图像的重叠比例，相除后即可完全消除零填充带来的边缘衰减。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：同态对数路径与“全 1 图”边界黑边修正实验室",
      "instruction": "增大 PSF 核半径，观察上方平滑图 d 的左右黑边以及恢复图 f 的边缘过曝炸亮；开启“全 1 图归一化修正”观察边界如何瞬间复原，再切换“同态对数路径”对比细微差异。",
      "controls": [
        {
          "type": "slider",
          "id": "psfRad",
          "label": "高斯 PSF 核半径",
          "min": 10,
          "max": 100,
          "step": 5,
          "value": 55,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "homomorphic",
          "label": "启用同态对数路径 exp(log(c) - smooth(log(c)))",
          "value": false
        },
        {
          "type": "toggle",
          "id": "fixBoundary",
          "label": "启用全 1 图边界权重归一化修正",
          "value": false
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height;\nvar ctx = lab.ctx;\nfunction render() {\n  var psfRad = lab.values.psfRad;\n  var homo = lab.values.homomorphic;\n  var fix = lab.values.fixBoundary;\n  var padL = 44, padR = 24, plotW = W - padL - padR;\n  var n = 326;\n  var rad = Math.round((psfRad / 100) * 65);\n  var sigma = Math.max(2, rad * 0.42);\n  var kLen = 2 * rad + 1;\n  var kernel = new Array(kLen);\n  var kSum = 0;\n  for (var k = -rad; k <= rad; k++) {\n    var g = Math.exp(-(k * k) / (2 * sigma * sigma));\n    kernel[k + rad] = g;\n    kSum += g;\n  }\n  for (var k = 0; k < kLen; k++) kernel[k] /= kSum;\n  var a = new Array(n), b = new Array(n), c = new Array(n), logC = new Array(n);\n  for (var i = 0; i < n; i++) {\n    var t = i / (n - 1);\n    a[i] = 0.12 + 0.80 * (0.5 + 0.5 * Math.cos(2 * Math.PI * 18 * t));\n    b[i] = 0.22 + 0.78 * Math.pow(t, 1.35);\n    c[i] = a[i] * b[i];\n    logC[i] = Math.log(c[i]);\n  }\n  var rawD = new Array(n), rawDLog = new Array(n), weight = new Array(n);\n  for (var i = 0; i < n; i++) {\n    var sC = 0, sL = 0, sW = 0;\n    for (var k = -rad; k <= rad; k++) {\n      var idx = i + k;\n      if (idx >= 0 && idx < n) {\n        var w = kernel[k + rad];\n        sC += c[idx] * w;\n        sL += logC[idx] * w;\n        sW += w;\n      }\n    }\n    weight[i] = sW;\n    rawD[i] = fix ? (sC / sW) : sC;\n    rawDLog[i] = fix ? (sL / sW) : sL;\n  }\n  var illumEst = new Array(n), f = new Array(n);\n  for (var i = 0; i < n; i++) {\n    if (homo) {\n      illumEst[i] = Math.exp(rawDLog[i]);\n      f[i] = 0.44 * Math.exp(logC[i] - rawDLog[i]);\n    } else {\n      illumEst[i] = rawD[i];\n      f[i] = 0.52 * (c[i] / Math.max(0.01, rawD[i]));\n    }\n  }\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n  var sY1 = 10, sH = 22, sY2 = 38;\n  for (var i = 0; i < n; i++) {\n    var x = padL + (i / n) * plotW;\n    var w = Math.ceil(plotW / n) + 1;\n    var vd = Math.max(0, Math.min(255, Math.round(illumEst[i] * 255 * 1.4)));\n    ctx.fillStyle = 'rgb(' + vd + ',' + vd + ',' + vd + ')';\n    ctx.fillRect(x, sY1, w, sH);\n    var vf = Math.max(0, Math.min(255, Math.round(f[i] * 255)));\n    ctx.fillStyle = 'rgb(' + vf + ',' + vf + ',' + vf + ')';\n    ctx.fillRect(x, sY2, w, sH);\n  }\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('光照 d', 4, sY1 + 15);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('输出 f', 4, sY2 + 15);\n  var plotT = 76, plotB = 224, plotH = plotB - plotT;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = plotT + (g / 4) * plotH;\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + plotW, gy); ctx.stroke();\n  }\n  function drawLine(arr, color, lw, dash) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dash) ctx.setLineDash(dash);\n    ctx.beginPath();\n    for (var i = 0; i < n; i++) {\n      var x = padL + (i / (n - 1)) * plotW;\n      var val = Math.max(0, Math.min(1.25, arr[i]));\n      var y = plotB - (val / 1.2) * plotH;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n  drawLine(weight, '#f59e0b', 1.6, [4, 4]);\n  drawLine(illumEst, '#38bdf8', 2.2, null);\n  drawLine(f, '#10b981', 2.0, null);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1.2', 14, plotT + 4);\n  ctx.fillText('1.0', 14, plotB - (1.0 / 1.2) * plotH + 4);\n  ctx.fillText('0.5', 14, plotB - (0.5 / 1.2) * plotH + 4);\n  ctx.fillText('0.0', 14, plotB + 4);\n  ctx.fillStyle = '#f59e0b'; ctx.fillText('-- 全1图权重 (PSF*1)', padL + 6, plotT + 12);\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 光照估计 d(x)', padL + 152, plotT + 12);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 恢复反射率 f(x)', padL + 272, plotT + 12);\n  lab.setReadout('路径: ' + (homo ? '同态对数滤波' : '直接相除') + ' | 边界修正: ' + (fix ? '已开启 (全1图归一化)' : '未开启 (零填充黑边)') + ' | 边缘重叠因子 W(0)=' + weight[0].toFixed(2) + ' | 右端输出峰值=' + Math.max(f[n-1], f[n-2]).toFixed(2));\n}\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "乘法模型千万别用线性高通相减（c - d）：相减只能抬高暗部均值，无法还原被照明系数按比例压缩的对比度；必须使用“相除（c ÷ d）”或“对数域高通 + 指数还原”。",
        "大 PSF 的尺度选择铁律：平滑核宽度必须远大于需要保留的物体纹理周期（如图像宽度的 1/5），这样才能把前景细节彻底糊掉、只留出缓慢变化的光照轮廓。",
        "算力加速诀窍：超大尺寸 PSF 切忌直接做二维暴力卷积，务必采用“可分离递归滤波器”多次迭代逼近高斯核，使耗时与核尺寸无关。",
        "边界零填充必踩大坑：直接裁边零填充会让平滑图像四周变暗（2D 图像角点仅 25% 权重），做除法后边缘会严重过曝失真；用同尺寸“全 1 图像”过一遍同样的 PSF 即可算得精确的修正因子图，逐像素相除就能根治黑边。"
      ]
    }
  ]
});
