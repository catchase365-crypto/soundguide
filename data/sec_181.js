window.__BOOK_REGISTER_SECTION__("sec_181", {
  "title": "空间分辨率的度量：从 PSF、MTF 到边缘响应 (Spatial Resolution)",
  "intuition": "想用“一个数字”衡量相机或成像系统的清晰度？别去暗室拍单像素小白点了——拍一张黑白分明的“锐利边缘”照片，再求一阶差分和傅里叶变换，既抗噪声又能直通 MTF 曲线。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 单指标困境：为什么 PSF 和半高宽（FWHM）容易误导人？",
      "paragraphs": [
        "假设我们要对比两台成像设备，看哪台能分辨出更小的物体，工程上总希望能用一个**单一数值**直接分出高下。在上一章我们知道，系统的**点扩散函数（PSF, Point Spread Function）**包含了关于空间分辨率的全部信息。现实中最具代表性的圆对称 PSF 有三种：**药盒型（Pillbox）**（对应镜头失焦）、**高斯型（Gaussian）**（对应随机误差叠加，如大气湍流看星星）以及**指数型（Exponential）**（对应电子或 X 射线击中荧光粉层散射发光）。",
        "为了把整条 PSF 曲线压缩成一个数，人们最常用的办法是忽略它的具体形状，只测量它的宽度——即**半高宽（FWHM, Full-Width-at-Half-Maximum）**，也就是振幅跌落到峰值 50% 处的全宽度。",
        "可惜，直接用 PSF 和 FWHM 来评价分辨率有**两大致命缺陷**：第一，**与人眼主观感受及频域特性不匹配**。即使药盒、高斯、指数三种 PSF 拥有完全相同的 FWHM（比如都是 1 个单位），它们对应的频率响应曲线也截然不同，有的高频掉得飞快，有的还会震荡。第二，**在物理上几乎没法直接测量 PSF**。试想向系统输入一个“单位脉冲”——即在全黑背景上拍一个极小的白点。假设这是一张 `512×512` 的图像，只有中心 1 个像素是 `255`，其余全是 `0`；而正常图像所有像素均值约为 `128`。粗略算下来，脉冲图像里的总信号能量比正常图像弱了约 **100,000 倍**！微弱的信号瞬间就会被随机噪声彻底淹没，根本测不准。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "2. 频率域视角：调制传递函数（MTF）与线对卡（Line Pair Gauge）",
      "paragraphs": [
        "本书一直强调一个核心思想：**信号必须在编码信息的域里去理解**——音频信号看频域，图像信号看空间域。尽管如此，成像领域却非常流行用“频率响应”来衡量图像分辨率。虽然违背了“在空间域看图像”的哲学，但你必须掌握这套行话。",
        "对二维 PSF 做二维傅里叶变换，就能得到二维频率响应。如果 PSF 是圆对称的，那么其频谱也是圆对称的，此时只需提取 FFT 结果第 0 行的第 `0` 到 `N/2` 列这一条剖面线就够了（注意：**从二维频谱抽取一行，绝不等价于对一维 PSF 剖面做一维 FFT**）。这条显示空间频率衰减规律的曲线，就是鼎鼎大名的**调制传递函数（MTF, Modulation Transfer Function）**。如果 PSF 不是圆对称的，通常也会分别给出水平和垂直两个方向的 MTF 曲线。",
        "在实际测试中，工程师常使用**线对卡（Line Pair Gauge）**来测量 MTF。它上面印有一系列黑白相间的条纹，越往一端条纹越密（空间频率越高）。在成像术语中，不用“周期（cycle）”，而用**线对（line pair, lp）**——即一条黑线加一条白线，例如 `25 lp/mm`。当把线对卡拍成图像后，低频端条纹的顶和底依然平坦，只是边缘变糊；而在高频端，调制的振幅（黑白对比度）会明显缩水。只要残余对比度还大于原始高度的 **3% ~ 10%**，人眼就能勉强分辨出条纹。厂商数据手册里常写的“极限分辨率（Limiting Resolution）”通常是个模糊词，为了保险，遇到没标明百分比的宣传参数，一律按最宽松的 **3% MTF** 来解读。",
        "还有一个极易被忽略的细节：MTF 在数学上是用**正弦波**定义的，但线对卡为了好加工，用的是纯黑纯白的**方波**。在高频区，高次谐波被系统滤除，只剩下方波的基波正弦成分，而方波里的基波振幅天然是方波本身振幅的 $4/\\pi \\approx 1.27$ 倍。这就导致线对卡测量出的极限分辨率，实际上比真实系统的正弦 MTF 略微虚高了一点。"
      ],
      "formula": {
        "expr": "A_fundamental = (4 / π) * A_square ≈ 1.27 * A_square",
        "explain": "方波基波正弦分量的振幅（A_fundamental）是方波自身振幅（A_square）的 4/π 倍（约 1.27 倍），因此用黑白方波线对卡测试会轻微高估系统的 MTF 分辨率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：相同 FWHM 下的 MTF 分化与线对卡观察仿真",
      "instruction": "拖动「PSF 半高宽」和「线对测试频率」滑块，观察三条相同宽度的 PSF 曲线如何对应出截然不同的 MTF，以及右侧黑白条纹在方波/正弦波下的模糊规律。",
      "controls": [
        {
          "type": "slider",
          "id": "fwhm",
          "label": "PSF 半高宽 (FWHM)",
          "min": 0.5,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": " 单位"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "线对测试频率",
          "min": 0.1,
          "max": 2,
          "step": 0.05,
          "value": 0.6,
          "unit": " lp/单位"
        },
        {
          "type": "toggle",
          "id": "squareWave",
          "label": "方波线对卡 (含 4/π 过估计效应)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var w = lab.values.fwhm;\n  var freq = lab.values.freq;\n  var isSq = lab.values.squareWave;\n\n  ctx.clearRect(0, 0, W, H);\n\n  function j1(x) {\n    var n = 24, sum = 0;\n    for (var i = 0; i <= n; i++) {\n      var t = Math.PI * i / n;\n      var wt = (i === 0 || i === n) ? 0.5 : 1.0;\n      sum += wt * Math.cos(t - x * Math.sin(t));\n    }\n    return sum / n;\n  }\n\n  function otfP(f) {\n    var u = Math.PI * f * w;\n    return Math.abs(u) < 1e-4 ? 1.0 : 2 * j1(u) / u;\n  }\n  function mtfG(f) {\n    var sig = (w * 0.5) / Math.sqrt(2 * Math.LN2);\n    return Math.exp(-2 * Math.PI * Math.PI * sig * sig * f * f);\n  }\n  function mtfE(f) {\n    var tau = (w * 0.5) / Math.LN2;\n    var a = 2 * Math.PI * tau * f;\n    return Math.pow(1 + a * a, -1.5);\n  }\n\n  function drawGrid(x0, y0, pw, ph, nx, ny) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    for (var i = 0; i <= nx; i++) {\n      var gx = x0 + (pw * i) / nx;\n      ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + ph);\n    }\n    for (var j = 0; j <= ny; j++) {\n      var gy = y0 + (ph * j) / ny;\n      ctx.moveTo(x0, gy); ctx.lineTo(x0 + pw, gy);\n    }\n    ctx.stroke();\n  }\n\n  var px1 = 22, py1 = 30, pw1 = 195, ph1 = 175;\n  drawGrid(px1, py1, pw1, ph1, 4, 4);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('a. PSF 剖面 (相等 FWHM=' + w.toFixed(1) + ')', px1, 18);\n\n  var halfY = py1 + ph1 * 0.5;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(px1, halfY); ctx.lineTo(px1 + pw1, halfY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('50%', px1 + 3, halfY - 4);\n\n  var colors = { P: '#38bdf8', G: '#10b981', E: '#ec4899' };\n  var sig = (w * 0.5) / Math.sqrt(2 * Math.LN2);\n  var tau = (w * 0.5) / Math.LN2;\n\n  function plotPSF(fn, col) {\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i <= 160; i++) {\n      var d = -2 + (4 * i) / 160;\n      var val = fn(d);\n      var x = px1 + (pw1 * i) / 160;\n      var y = py1 + ph1 * (1 - val);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n  plotPSF(function(d) { return Math.exp(-Math.abs(d) / tau); }, colors.E);\n  plotPSF(function(d) { return Math.exp(-(d * d) / (2 * sig * sig)); }, colors.G);\n  plotPSF(function(d) { return Math.abs(d) <= w * 0.5 ? 1 : 0; }, colors.P);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-2', px1, py1 + ph1 + 14);\n  ctx.fillText('0', px1 + pw1 * 0.5 - 3, py1 + ph1 + 14);\n  ctx.fillText('+2', px1 + pw1 - 14, py1 + ph1 + 14);\n\n  var px2 = 248, py2 = 30, pw2 = 210, ph2 = 175;\n  drawGrid(px2, py2, pw2, ph2, 4, 4);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('b. 对应的 MTF (0 ~ 2.0 lp)', px2, 18);\n\n  var y10 = py2 + ph2 * 0.9, y03 = py2 + ph2 * 0.97;\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(px2, y10); ctx.lineTo(px2 + pw2, y10);\n  ctx.moveTo(px2, y03); ctx.lineTo(px2 + pw2, y03);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('10% / 3% 极限线', px2 + pw2 - 78, y10 - 4);\n\n  function plotMTF(fn, col) {\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i <= 160; i++) {\n      var f = (2.0 * i) / 160;\n      var val = Math.min(1, Math.abs(fn(f)));\n      var x = px2 + (pw2 * i) / 160;\n      var y = py2 + ph2 * (1 - val);\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n  plotMTF(mtfE, colors.E);\n  plotMTF(mtfG, colors.G);\n  plotMTF(otfP, colors.P);\n\n  var curFx = px2 + (freq / 2.0) * pw2;\n  ctx.strokeStyle = 'rgba(248,250,252,0.75)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(curFx, py2); ctx.lineTo(curFx, py2 + ph2); ctx.stroke();\n\n  var curP = Math.abs(otfP(freq)), curG = mtfG(freq), curE = mtfE(freq);\n  var dots = [[curP, colors.P], [curG, colors.G], [curE, colors.E]];\n  for (var k = 0; k < dots.length; k++) {\n    ctx.fillStyle = dots[k][1];\n    ctx.beginPath(); ctx.arc(curFx, py2 + ph2 * (1 - dots[k][0]), 4, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', px2, py2 + ph2 + 14);\n  ctx.fillText('1.0', px2 + pw2 * 0.5 - 7, py2 + ph2 + 14);\n  ctx.fillText('2.0 lp', px2 + pw2 - 26, py2 + ph2 + 14);\n\n  var px3 = 488, py3 = 30, pw3 = 212;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('c. ' + (isSq ? '方波线对卡' : '正弦波') + ' 成像与剖面', px3, 18);\n\n  function evalPattern(xPos, otfFn) {\n    if (!isSq) {\n      return 0.5 + 0.5 * Math.abs(otfFn(freq)) * Math.sin(2 * Math.PI * freq * xPos);\n    }\n    var s = 0;\n    for (var m = 1; m <= 11; m += 2) {\n      s += (otfFn(m * freq) / m) * Math.sin(2 * Math.PI * m * freq * xPos);\n    }\n    var v = 0.5 + 0.5 * (4 / Math.PI) * s;\n    return Math.max(0, Math.min(1, v));\n  }\n\n  var models = [\n    { name: 'P 药盒', fn: otfP, col: colors.P, y: py3 },\n    { name: 'G 高斯', fn: mtfG, col: colors.G, y: py3 + 32 },\n    { name: 'E 指数', fn: mtfE, col: colors.E, y: py3 + 64 }\n  ];\n  var stripW = pw3 - 44;\n  var stripX = px3 + 44;\n\n  for (var mIdx = 0; mIdx < models.length; mIdx++) {\n    var md = models[mIdx];\n    ctx.fillStyle = md.col;\n    ctx.font = 'bold 10px sans-serif';\n    ctx.fillText(md.name, px3, md.y + 16);\n    for (var sx = 0; sx < stripW; sx++) {\n      var xUnit = (sx / stripW) * 5.0;\n      var lum = Math.round(evalPattern(xUnit, md.fn) * 255);\n      ctx.fillStyle = 'rgb(' + lum + ',' + lum + ',' + lum + ')';\n      ctx.fillRect(stripX + sx, md.y, 1, 24);\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n    ctx.strokeRect(stripX, md.y, stripW, 24);\n  }\n\n  var wy0 = py3 + 98, wh = 77;\n  drawGrid(stripX, wy0, stripW, wh, 4, 2);\n  for (var mIdx2 = 2; mIdx2 >= 0; mIdx2--) {\n    var md2 = models[mIdx2];\n    ctx.strokeStyle = md2.col;\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    for (var sx2 = 0; sx2 <= stripW; sx2 += 2) {\n      var xUnit2 = (sx2 / stripW) * 5.0;\n      var val2 = evalPattern(xUnit2, md2.fn);\n      var yy = wy0 + wh * (1 - val2);\n      if (sx2 === 0) ctx.moveTo(stripX + sx2, yy); else ctx.lineTo(stripX + sx2, yy);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('剖面波形', px3, wy0 + 42);\n  ctx.fillText('跨度 5.0 单位', stripX + stripW - 65, wy0 + wh + 14);\n\n  var gainText = isSq ? ' | 方波基波×1.27' : '';\n  lab.setReadout('FWHM=' + w.toFixed(1) + ' | f=' + freq.toFixed(2) + ' lp/单位 | MTF对比度 → 药盒(P): ' + (curP * 100).toFixed(1) + '%  高斯(G): ' + (curG * 100).toFixed(1) + '%  指数(E): ' + (curE * 100).toFixed(1) + '%' + gainText);\n});"
    },
    {
      "type": "concept",
      "heading": "3. 回归空间域的绝佳替代：线扩散函数（LSF）与边缘响应（Edge Response）",
      "paragraphs": [
        "既然 PSF 的半高宽（FWHM）不贴合人眼感受且极难测量，而 MTF 又跑到了图像信息编码之外的“错位域”，有没有两全其美的空间域替代方案？答案是肯定的：**线扩散函数（LSF, Line Spread Function）**与**边缘响应（Edge Response）**。",
        "如果说 PSF 是系统对一个“点”的响应，那么 **LSF** 就是系统对一条贯穿图像的“细线”的响应，通常用半高宽（FWHM）表示其宽度；而 **边缘响应** 则是系统对一条锐利直边（黑白阶跃跳变）的响应，它的宽度通常用从 **10% 上升到 90%** 所需的距离来度量。因为“线”正是“阶跃边缘”的导数（在离散图像中就是一阶差分），所以 **LSF 就是边缘响应的一阶差分**。",
        "用边缘响应来测量分辨率有 **五大惊人优势**：\n1. **顺应编码域**：测量对象直接就是图像的边缘，我们关心分辨率的根本原因就是想知道图像边缘会被模糊成什么样。\n2. **极其容易测量**：造一条锐利的黑白色边缘比造一个单像素小白点容易一万倍，而且画面一半亮一半暗，**信噪比极高**。\n3. **形状高度一致**：哪怕底层来自药盒、高斯、指数这样性格迥异的 PSF，只要它们的 10%–90% 边缘上升距离相等，整条边缘响应曲线的形状就惊人地相似！因此 10%–90% 距离是一个极其优秀的单参数指标。\n4. **直接用 1D FFT 算 MTF**：无需繁琐的二维傅里叶变换，把边缘响应做一阶差分得到 LSF，再做一次**一维 FFT**，直接就能画出 MTF 曲线。\n5. **与 MTF 轻松心算互转**：因为不同的 PSF 在相同 10%–90% 距离下的 MTF 曲线在 10% 对比度以上高度重合，于是诞生了一条黄金换算口诀——若系统 10%–90% 边缘响应距离为 $x$，那么它的 10% 对比度极限分辨率就约等于 $1/x$ 线对每单位距离（例如：边缘宽度 `0.05 mm` 对应约 `20 lp/mm`；`3.3 像素` 对应约 `0.33 lp/像素`）。"
      ],
      "formula": {
        "expr": "LSF[n] = Edge[n] - Edge[n-1]    |    f_10% ≈ 1 / x_(10%-90%)",
        "explain": "边缘响应的一阶差分即 LSF；10% 对比度处的极限空间频率（f_10%），约等于 10%–90% 边缘上升距离（x_(10%-90%)）的倒数。"
      }
    },
    {
      "type": "concept",
      "heading": "4. PSF 与 LSF 的数学纽带，以及工程实战的“读表与实测”两招",
      "paragraphs": [
        "从数学上看，PSF 和 LSF 之间到底是什么关系？**LSF 等于 PSF 沿着某一方向的积分剖面（Integrated Profile）**。具体来说，把二维 PSF 图像沿着垂直射线（每一列）全部像素相加，得到的就是垂直细线的 LSF；沿着每一行相加，得到的就是水平细线的 LSF（连续图像则把求和换成积分）。",
        "这意味着：**已知 PSF 总能直接算出 LSF；但已知单角度的 LSF 却不一定能反推 PSF**。因为系统只有一个 PSF，却有无穷多个角度的 LSF。如果 PSF 是椭圆形（长短轴不同），单看水平 LSF 无法得知垂直方向有多糊——只有当 PSF 圆对称时才能例外。想从多个角度的 LSF 投影反推出非圆对称的二维 PSF，在数学上非常复杂，而这正是本章后面要讲的**计算机断层扫描（CT）**要解决的核心问题！不过在绝大多数实用系统中，LSF 和 PSF 相差无几（甚至在矩形 PSF 和高斯 PSF 这两种常见情况下，二者的剖面形状完全一致）。",
        "最后把这些理论浓缩成工程师必备的两项实战技能：\n- **读懂厂商参数**：看到广告写着“本系统可分辨 `40 lp/mm`”，你要立刻翻译成：“当一个 `40 lp/mm` 的正弦光栅经过该系统时，振幅会衰减到只剩 3%~10%，勉强刚能看清。”同时心里默算：如果按 10% 对比度算，对应的 10%–90% 边缘响应宽度是 $1 / 40 = 0.025\\text{ mm}$；如果厂商狡猾地按 3% 算，边缘模糊宽度还要再放宽 **1.5 到 2 倍**。\n- **自己动手实测**：把一把锐利直尺或刀片边缘放进成像视野，测出图像灰度的 **10%–90% 上升距离**——这就是系统分辨率的最佳单参数度量。如果想让老板和市场部同事也满意，只需要把边缘响应做个一阶差分求出 LSF，再做个一维 FFT，就能漂漂亮亮地把 MTF 曲线交差了。"
      ],
      "formula": {
        "expr": "LSF_vertical[x] = Σ_y PSF[x, y]",
        "explain": "垂直方向细线的 LSF，等于二维点扩散函数 PSF 沿每一列（y 方向）所有像素值的积分（求和）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：边缘响应 → 一阶差分（LSF）→ 1D FFT（MTF）流水线实验室",
      "instruction": "调节「10%-90% 边缘上升距离 x」并开启叠加对比，验证三种差异巨大的 PSF 如何收敛出几乎一致的边缘形状，以及 1D FFT 得到的 10% MTF 频率是否精准贴合 1/x 法则。",
      "controls": [
        {
          "type": "slider",
          "id": "edgeWidth",
          "label": "10%-90% 边缘上升距离 x",
          "min": 0.4,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": " mm"
        },
        {
          "type": "slider",
          "id": "psfModel",
          "label": "当前观察模型 (1:药盒 2:高斯 3:指数)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "overlayAll",
          "label": "同时叠加对比三种 PSF",
          "value": true
        }
      ],
      "jsCode": "var expN = 401, expDx = 0.04;\nvar expBaseLsf = new Float64Array(expN);\nvar expBaseEdge = new Float64Array(expN);\n(function initExp() {\n  var sum = 0;\n  for (var i = 0; i < expN; i++) {\n    var t = -8 + i * expDx;\n    var val = 0;\n    for (var j = -100; j <= 100; j++) {\n      val += Math.exp(-Math.hypot(t, j * 0.08));\n    }\n    expBaseLsf[i] = val;\n    sum += val;\n    expBaseEdge[i] = sum;\n  }\n  for (var i = 0; i < expN; i++) expBaseEdge[i] /= sum;\n})();\n\nfunction findCrossing(arr, target, x0, dx) {\n  for (var i = 1; i < arr.length; i++) {\n    if (arr[i] >= target) {\n      var denom = arr[i] - arr[i - 1];\n      var frac = denom > 1e-12 ? (target - arr[i - 1]) / denom : 0;\n      return x0 + (i - 1 + frac) * dx;\n    }\n  }\n  return x0;\n}\nvar expBaseW = findCrossing(expBaseEdge, 0.9, -8, expDx) - findCrossing(expBaseEdge, 0.1, -8, expDx);\n\nfunction sampleExpLsf(u) {\n  var idx = (u + 8) / expDx;\n  if (idx < 0 || idx >= expN - 1) return 0;\n  var i0 = Math.floor(idx), f = idx - i0;\n  return expBaseLsf[i0] * (1 - f) + expBaseLsf[i0 + 1] * f;\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var ew = lab.values.edgeWidth;\n  var sel = lab.values.psfModel;\n  var showAll = lab.values.overlayAll;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var N = 256, xMin = -4.0, xMax = 4.0, dx = (xMax - xMin) / N;\n  var cols = { 1: '#38bdf8', 2: '#10b981', 3: '#ec4899' };\n  var names = { 1: '药盒(P)', 2: '高斯(G)', 3: '指数(E)' };\n\n  function computePipeline(modelId) {\n    var lsfRaw = new Float64Array(N);\n    var sum = 0;\n    var R = ew / 1.370;\n    var sig = ew / 2.5631;\n    var tau = ew / expBaseW;\n    for (var i = 0; i < N; i++) {\n      var x = xMin + (i + 0.5) * dx;\n      var v = 0;\n      if (modelId === 1) {\n        v = Math.abs(x) < R ? Math.sqrt(Math.max(0, R * R - x * x)) : 0;\n      } else if (modelId === 2) {\n        v = Math.exp(-(x * x) / (2 * sig * sig));\n      } else {\n        v = sampleExpLsf(x / tau);\n      }\n      lsfRaw[i] = v;\n      sum += v;\n    }\n    var edge = new Float64Array(N);\n    var acc = 0;\n    for (var i = 0; i < N; i++) {\n      acc += lsfRaw[i] / sum;\n      edge[i] = acc;\n    }\n    var diff = new Float64Array(N);\n    var maxDiff = 0;\n    for (var i = 0; i < N; i++) {\n      diff[i] = i === 0 ? edge[0] : edge[i] - edge[i - 1];\n      if (diff[i] > maxDiff) maxDiff = diff[i];\n    }\n    var fSteps = 90, fMax = 3.0;\n    var mtf = new Float64Array(fSteps + 1);\n    var f10 = null;\n    for (var k = 0; k <= fSteps; k++) {\n      var f = (fMax * k) / fSteps;\n      var re = 0, im = 0;\n      for (var i = 0; i < N; i++) {\n        var x = xMin + (i + 0.5) * dx;\n        var ang = 2 * Math.PI * f * x;\n        re += diff[i] * Math.cos(ang);\n        im -= diff[i] * Math.sin(ang);\n      }\n      mtf[k] = Math.hypot(re, im);\n      if (f10 === null && k > 0 && mtf[k] <= 0.10) {\n        var df = fMax / fSteps;\n        var frac = (0.10 - mtf[k - 1]) / (mtf[k] - mtf[k - 1] - 1e-12);\n        f10 = (k - 1 + frac) * df;\n      }\n    }\n    return { edge: edge, diff: diff, maxDiff: maxDiff, mtf: mtf, f10: f10 };\n  }\n\n  var res = {};\n  res[1] = computePipeline(1);\n  res[2] = computePipeline(2);\n  res[3] = computePipeline(3);\n\n  function drawGrid(x0, y0, pw, ph, nx, ny) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    for (var i = 0; i <= nx; i++) {\n      var gx = x0 + (pw * i) / nx;\n      ctx.moveTo(gx, y0); ctx.lineTo(gx, y0 + ph);\n    }\n    for (var j = 0; j <= ny; j++) {\n      var gy = y0 + (ph * j) / ny;\n      ctx.moveTo(x0, gy); ctx.lineTo(x0 + pw, gy);\n    }\n    ctx.stroke();\n  }\n\n  var px1 = 18, pw1 = 208;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('a. 实测边缘响应 (10%–90%)', px1, 16);\n\n  var selEdge = res[sel].edge;\n  for (var sx = 0; sx < pw1; sx++) {\n    var xVal = -2.0 + (4.0 * sx) / pw1;\n    var idx = Math.max(0, Math.min(N - 1, Math.round((xVal - xMin) / dx - 0.5)));\n    var lum = Math.round(selEdge[idx] * 255);\n    ctx.fillStyle = 'rgb(' + lum + ',' + lum + ',' + lum + ')';\n    ctx.fillRect(px1 + sx, 25, 1, 20);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(px1, 25, pw1, 20);\n\n  var py1 = 54, ph1 = 154;\n  drawGrid(px1, py1, pw1, ph1, 4, 4);\n  var y90 = py1 + ph1 * 0.1, y10 = py1 + ph1 * 0.9;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(px1, y90); ctx.lineTo(px1 + pw1, y90);\n  ctx.moveTo(px1, y10); ctx.lineTo(px1 + pw1, y10);\n  var xLeft = px1 + pw1 * ((-ew * 0.5 + 2.0) / 4.0);\n  var xRight = px1 + pw1 * ((ew * 0.5 + 2.0) / 4.0);\n  ctx.moveTo(xLeft, py1); ctx.lineTo(xLeft, py1 + ph1);\n  ctx.moveTo(xRight, py1); ctx.lineTo(xRight, py1 + ph1);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('90%', px1 + 3, y90 + 10);\n  ctx.fillText('10%', px1 + 3, y10 - 3);\n\n  var order = showAll ? [1, 2, 3].filter(function(m) { return m !== sel; }).concat([sel]) : [sel];\n  for (var oi = 0; oi < order.length; oi++) {\n    var m = order[oi];\n    ctx.strokeStyle = cols[m];\n    ctx.lineWidth = m === sel ? 2.4 : 1.4;\n    ctx.beginPath();\n    for (var sx2 = 0; sx2 <= pw1; sx2 += 2) {\n      var xv = -2.0 + (4.0 * sx2) / pw1;\n      var id = Math.max(0, Math.min(N - 1, Math.round((xv - xMin) / dx - 0.5)));\n      var yy = py1 + ph1 * (1 - res[m].edge[id]);\n      if (sx2 === 0) ctx.moveTo(px1 + sx2, yy); else ctx.lineTo(px1 + sx2, yy);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('-2mm', px1, py1 + ph1 + 14);\n  ctx.fillText('+2mm', px1 + pw1 - 28, py1 + ph1 + 14);\n\n  var px2 = 256, py2 = 30, pw2 = 205, ph2 = 178;\n  drawGrid(px2, py2, pw2, ph2, 4, 4);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('b. 一阶差分 → LSF', px2, 16);\n  for (var oi2 = 0; oi2 < order.length; oi2++) {\n    var m2 = order[oi2];\n    var r2 = res[m2];\n    ctx.strokeStyle = cols[m2];\n    ctx.lineWidth = m2 === sel ? 2.4 : 1.4;\n    ctx.beginPath();\n    for (var sx3 = 0; sx3 <= pw2; sx3 += 2) {\n      var xv2 = -2.0 + (4.0 * sx3) / pw2;\n      var id2 = Math.max(0, Math.min(N - 1, Math.round((xv2 - xMin) / dx - 0.5)));\n      var yy2 = py2 + ph2 * (1 - r2.diff[id2] / r2.maxDiff);\n      if (sx3 === 0) ctx.moveTo(px2 + sx3, yy2); else ctx.lineTo(px2 + sx3, yy2);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-2mm', px2, py2 + ph2 + 14);\n  ctx.fillText('0', px2 + pw2 * 0.5 - 3, py2 + ph2 + 14);\n  ctx.fillText('+2mm', px2 + pw2 - 28, py2 + ph2 + 14);\n\n  var px3 = 492, py3 = 30, pw3 = 210, ph3 = 178;\n  drawGrid(px3, py3, pw3, ph3, 3, 4);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('c. 1D FFT → MTF (0~3 lp/mm)', px3, 16);\n\n  var mtfY10 = py3 + ph3 * 0.9;\n  var fRule = 1.0 / ew;\n  ctx.strokeStyle = 'rgba(245,158,11,0.65)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(px3, mtfY10); ctx.lineTo(px3 + pw3, mtfY10);\n  if (fRule <= 3.0) {\n    var rx = px3 + (fRule / 3.0) * pw3;\n    ctx.moveTo(rx, py3); ctx.lineTo(rx, py3 + ph3);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('10% 对比度', px3 + 4, mtfY10 - 4);\n  if (fRule <= 3.0) {\n    ctx.fillText('1/x=' + fRule.toFixed(2), Math.min(px3 + pw3 - 52, px3 + (fRule / 3.0) * pw3 + 4), py3 + 14);\n  }\n\n  for (var oi3 = 0; oi3 < order.length; oi3++) {\n    var m3 = order[oi3];\n    var mArr = res[m3].mtf;\n    ctx.strokeStyle = cols[m3];\n    ctx.lineWidth = m3 === sel ? 2.4 : 1.4;\n    ctx.beginPath();\n    for (var k = 0; k < mArr.length; k++) {\n      var mx = px3 + (k / (mArr.length - 1)) * pw3;\n      var my = py3 + ph3 * (1 - Math.min(1, mArr[k]));\n      if (k === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);\n    }\n    ctx.stroke();\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0', px3, py3 + ph3 + 14);\n  ctx.fillText('1.5', px3 + pw3 * 0.5 - 7, py3 + ph3 + 14);\n  ctx.fillText('3.0 lp/mm', px3 + pw3 - 48, py3 + ph3 + 14);\n\n  function fmtF(v) { return v !== null ? v.toFixed(2) : '>3.0'; }\n  lab.setReadout('选中: ' + names[sel] + ' | 10%-90% 距离 x=' + ew.toFixed(1) + ' mm | 经验法则 1/x=' + fRule.toFixed(2) + ' lp/mm | 实测10% MTF → P:' + fmtF(res[1].f10) + '  G:' + fmtF(res[2].f10) + '  E:' + fmtF(res[3].f10) + ' lp/mm');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【避坑 1】千万别用“拍单像素白点”的脉冲法去直接测 PSF 和 FWHM：单个像素的信号比正常画面弱约 10 万倍，随机噪声会彻底吞掉测量结果；且相同 FWHM 对应的 MTF 曲线可能千差万别。",
        "【避坑 2】看到芯片或镜头手册写着含糊的“极限分辨率（Limiting Resolution）”，一定要保守按 MTF 跌到 3% 来理解（而不是 10%），此时对应的边缘模糊宽度大约比 10% 基准宽 1.5 到 2 倍。",
        "【避坑 3】从二维频谱抽出第 0 行作为圆对称系统的 MTF，绝不等价于对一维 PSF 剖面直接做一维 FFT；只有对边缘响应求一阶差分得到 LSF 后，再做一维 FFT 才能直接得到准确的 MTF。",
        "【工程金律】“拍边缘”是测图像分辨率的最优解：抗噪极强、直接反映边缘模糊程度，且 10%–90% 边缘上升距离 x 与 10% 对比度极限频率存在 f_10% ≈ 1/x 的极简倒数关系。"
      ]
    }
  ]
});
