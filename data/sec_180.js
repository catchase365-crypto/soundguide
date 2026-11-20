window.__BOOK_REGISTER_SECTION__("sec_180", {
  "title": "深入剖析图像卷积：双视角原理与效率博弈 (A Closer Look at Image Convolution)",
  "intuition": "二维卷积的「输入视角」揭示了脉冲响应叠加的物理本质，而「输出视角」把卷积核旋转180°来算乘加——恰巧能用预先倒置的模板实现图像目标匹配，但在工程上只有大卷积核才值得请出 FFT 加速。",
  "blocks": [
    {
      "type": "concept",
      "heading": "双重视角看二维卷积：输入端叠加 vs. 输出端翻转",
      "paragraphs": [
        "和一维信号完全一样，二维图像卷积也有**输入视角 (Input Side)** 和**输出视角 (Output Side)** 两种等价的解读方式。输入视角最适合理解物理过程，而输出视角则是数学公式与计算机代码真正遵循的写法。",
        "在**输入视角**下（如原书图 24-14），输入图像中的每一个像素 `[r, c]` 都会向输出图像贡献一个「经过缩放和平移的点扩散函数 (PSF)」。具体做法是把 PSF 的 `[0, 0]` 原点对齐到输出图像的 `[r, c]` 上，直接按像素值缩放后累加到输出图像中。如果 PSF 只使用正索引，贡献区域就会完全落在 `[r, c]` 的**右下方**。注意：输入视角下 **PSF 不会发生任何旋转**。",
        "而在**输出视角**下（如原书图 24-15），我们把目光聚焦在输出图像的单个像素 `y[r, c]` 上，看它收集了哪些输入像素的贡献。此时需要把 PSF 绕 `[0, 0]` 点**旋转 180°**，再将原点对齐输入图像的 `[r, c]`（若仅用正索引，则覆盖 `[r, c]` 的**左上方**区域），最后把重叠区域的像素逐一相乘再求和。",
        "理解这 180° 旋转是打通「卷积实现相关 (Correlation)」的关键：如果我们想在输入图像里搜寻一张正立的人脸，只需在设计核函数 `h[k, j]` 时**预先把它倒转 180°**。这样当卷积在输出视角自动执行那次 180° 旋转时，就会把模板「负负得正」地翻回正立状态，从而在目标位置打出最高的匹配峰值！"
      ],
      "formula": {
        "expr": "y[r, c] = Σ_{k=0}^{M-1} Σ_{j=0}^{M-1} h[k, j] · x[r - k, c - j]",
        "explain": "x[,] 为输入图像，h[,] 为尺寸 M×M 的卷积核（PSF，索引 0 到 M-1），y[,] 为输出图像。当 k 和 j 从 0 遍历到 M-1 时，x[r-k, c-j] 从 [r, c] 向左上方移动，等效于将 h 旋转 180° 后与输入图像做局部乘加。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：输入/输出双视角与 180° 模板匹配演示",
      "instruction": "切换「输出视角」开关观察 PSF 是否旋转 180°，拖动行坐标 r 和列坐标 c（试着移到 [4, 5]），观察如何用预旋转模板实现相关峰值检测。",
      "controls": [
        {
          "type": "toggle",
          "id": "outputView",
          "label": "输出视角 (关闭=输入视角平移 / 开启=输出视角旋转180°)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "rotatePsf",
          "label": "预先倒置模板 h (实现相关匹配)",
          "value": true
        },
        {
          "type": "slider",
          "id": "row",
          "label": "当前行坐标 r",
          "min": 2,
          "max": 5,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "col",
          "label": "当前列坐标 c",
          "min": 2,
          "max": 5,
          "step": 1,
          "value": 5,
          "unit": ""
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst targetPat = [\n  [1, 1, 1],\n  [1, 0, 0],\n  [1, 1, 0]\n];\n\nconst X = [];\nfor (let r = 0; r < 8; r++) {\n  X[r] = [];\n  for (let c = 0; c < 8; c++) {\n    X[r][c] = 0;\n  }\n}\nfor (let pr = 0; pr < 3; pr++) {\n  for (let pc = 0; pc < 3; pc++) {\n    X[2 + pr][3 + pc] = targetPat[pr][pc];\n  }\n}\n\nfunction rot180(m) {\n  return [\n    [m[2][2], m[2][1], m[2][0]],\n    [m[1][2], m[1][1], m[1][0]],\n    [m[0][2], m[0][1], m[0][0]]\n  ];\n}\n\nfunction draw() {\n  const r0 = lab.values.row;\n  const c0 = lab.values.col;\n  const isOut = lab.values.outputView;\n  const preRot = lab.values.rotatePsf;\n\n  const hKernel = preRot ? rot180(targetPat) : targetPat;\n  const hShown = isOut ? rot180(hKernel) : hKernel;\n\n  const Y = [];\n  let maxY = 0;\n  for (let r = 0; r < 8; r++) {\n    Y[r] = [];\n    for (let c = 0; c < 8; c++) {\n      let sum = 0;\n      for (let k = 0; k < 3; k++) {\n        for (let j = 0; j < 3; j++) {\n          const rr = r - k;\n          const cc = c - j;\n          if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8) {\n            sum += hKernel[k][j] * X[rr][cc];\n          }\n        }\n      }\n      Y[r][c] = sum;\n      if (sum > maxY) maxY = sum;\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const cell = 21;\n  const inX = 24;\n  const inY = 38;\n  const outX = 395;\n  const outY = 38;\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'center';\n  ctx.fillText('输入图像 x[r,c] (目标在[2..4,3..5])', inX + 4 * cell, 22);\n  ctx.fillText('输出图像 y[r,c] (卷积结果)', outX + 4 * cell, 22);\n\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const px = inX + c * cell;\n      const py = inY + r * cell;\n      const val = X[r][c];\n      ctx.fillStyle = val ? '#38bdf8' : 'rgba(255,255,255,0.05)';\n      ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);\n      ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n      ctx.lineWidth = 1;\n      ctx.strokeRect(px, py, cell, cell);\n    }\n  }\n\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const px = outX + c * cell;\n      const py = outY + r * cell;\n      const v = Y[r][c];\n      const alpha = maxY > 0 ? v / 6 : 0;\n      ctx.fillStyle = v > 0 ? 'rgba(16, 185, 129, ' + (0.15 + 0.85 * Math.min(1, alpha)) + ')' : 'rgba(255,255,255,0.05)';\n      ctx.fillRect(px + 1, py + 1, cell - 2, cell - 2);\n      ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n      ctx.lineWidth = 1;\n      ctx.strokeRect(px, py, cell, cell);\n      if (v > 0) {\n        ctx.fillStyle = '#f8fafc';\n        ctx.font = '10px monospace';\n        ctx.textAlign = 'center';\n        ctx.textBaseline = 'middle';\n        ctx.fillText(String(v), px + cell / 2, py + cell / 2);\n      }\n    }\n  }\n  ctx.textBaseline = 'alphabetic';\n\n  const kCell = 28;\n  const kX = 248;\n  const kY = 66;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'center';\n  ctx.fillText(isOut ? '输出视角: PSF旋转180°' : '输入视角: 原始PSF', kX + 1.5 * kCell, 40);\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText(preRot ? '(已预倒置模板 h)' : '(未倒置模板 h)', kX + 1.5 * kCell, 56);\n\n  for (let k = 0; k < 3; k++) {\n    for (let j = 0; j < 3; j++) {\n      const px = kX + j * kCell;\n      const py = kY + k * kCell;\n      const v = hShown[k][j];\n      ctx.fillStyle = v ? '#f59e0b' : 'rgba(255,255,255,0.06)';\n      ctx.fillRect(px + 1, py + 1, kCell - 2, kCell - 2);\n      ctx.strokeStyle = 'rgba(245, 158, 11, 0.45)';\n      ctx.strokeRect(px, py, kCell, kCell);\n      ctx.fillStyle = v ? '#0f172a' : '#64748b';\n      ctx.font = 'bold 11px monospace';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'middle';\n      ctx.fillText(String(v), px + kCell / 2, py + kCell / 2);\n    }\n  }\n  ctx.textBaseline = 'alphabetic';\n\n  if (!isOut) {\n    const sx = inX + c0 * cell;\n    const sy = inY + r0 * cell;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.strokeRect(sx, sy, cell, cell);\n\n    const ox = outX + c0 * cell;\n    const oy = outY + r0 * cell;\n    for (let k = 0; k < 3; k++) {\n      for (let j = 0; j < 3; j++) {\n        if (r0 + k < 8 && c0 + j < 8 && hKernel[k][j]) {\n          ctx.strokeStyle = '#f59e0b';\n          ctx.lineWidth = 2;\n          ctx.strokeRect(ox + j * cell + 1, oy + k * cell + 1, cell - 2, cell - 2);\n        }\n      }\n    }\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.strokeRect(ox, oy, 3 * cell, 3 * cell);\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#ec4899';\n    ctx.textAlign = 'center';\n    ctx.fillText('输入点 [' + r0 + ',' + c0 + '] = ' + X[r0][c0], inX + 4 * cell, 224);\n    ctx.fillText('向右下偏移贡献 3×3 PSF', outX + 4 * cell, 224);\n  } else {\n    for (let k = 0; k < 3; k++) {\n      for (let j = 0; j < 3; j++) {\n        const rr = r0 - k;\n        const cc = c0 - j;\n        if (rr >= 0 && rr < 8 && cc >= 0 && cc < 8 && hKernel[k][j]) {\n          ctx.strokeStyle = '#f59e0b';\n          ctx.lineWidth = 2;\n          ctx.strokeRect(inX + cc * cell + 1, inY + rr * cell + 1, cell - 2, cell - 2);\n        }\n      }\n    }\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.strokeRect(inX + (c0 - 2) * cell, inY + (r0 - 2) * cell, 3 * cell, 3 * cell);\n\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.strokeRect(outX + c0 * cell, outY + r0 * cell, cell, cell);\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#ec4899';\n    ctx.textAlign = 'center';\n    ctx.fillText('向左上采样 [' + (r0 - 2) + '..' + r0 + ', ' + (c0 - 2) + '..' + c0 + ']', inX + 4 * cell, 224);\n    ctx.fillText('输出点 y[' + r0 + ',' + c0 + '] = ' + Y[r0][c0], outX + 4 * cell, 224);\n  }\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  const infoX = 584;\n  ctx.fillText('实时状态', infoX, 50);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('坐标: [' + r0 + ', ' + c0 + ']', infoX, 74);\n  ctx.fillText('输入值: ' + X[r0][c0], infoX, 94);\n  ctx.fillStyle = Y[r0][c0] === 6 ? '#10b981' : '#f8fafc';\n  ctx.fillText('输出 y: ' + Y[r0][c0] + ' / 6', infoX, 114);\n  if (Y[r0][c0] === 6) {\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('★ 匹配成功!', infoX, 138);\n  } else {\n    ctx.fillStyle = '#64748b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('提示: 移至[4,5]', infoX, 138);\n    ctx.fillText('可得峰值 6', infoX, 154);\n  }\n\n  const modeTxt = isOut ? '输出视角(PSF旋转180°)' : '输入视角(PSF直接平移)';\n  const rotTxt = preRot ? '已预倒置模板(实现相关)' : '未倒置模板';\n  lab.setReadout(modeTxt + ' | ' + rotTxt + ' | 当前 [' + r0 + ',' + c0 + '] 输出 y = ' + Y[r0][c0]);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "性能大对决：传统四层循环 vs. FFT 频域卷积",
      "paragraphs": [
        "既然频域 FFT 卷积和原书 Table 24-1 的传统四层 `FOR` 循环卷积能得到**完全一模一样**的输出图像，那在工程上费劲写复数 FFT 代码到底值不值得？答案完全取决于你的**卷积核有多大**。",
        "观察传统卷积代码（外层遍历输出图像的 `R%` 行、`C%` 列，内层遍历卷积核的 `J%` 行、`K%` 列），对于 `N×N` 的图像和 `M×M` 的卷积核，计算量严格正比于 `N² · M²`。卷积核宽度只要翻一倍，耗时就暴增到原来的 4 倍！",
        "相比之下，FFT 卷积的执行时间**完全与卷积核尺寸 M 无关**（在图表上表现为一条水平直线），其计算量仅正比于 `N² · log₂(N)`。在当年的 100 MHz 奔腾电脑上，用 FFT 卷积一张 `128×128` 图像大约只需 15 秒，而 `512×512` 图像则需要超过 4 分钟（耗时约为前者的 20 倍）。",
        "因此两者必然存在一个**盈亏平衡点 (Break-even Point)**：如果传统卷积使用浮点运算 (FP)，当卷积核大于大约 **`10×10` 像素**时，FFT 卷积就开始反超；但在绝大多数图像处理场景中，传统卷积可以用纯**整数运算 (INT)** 替代浮点，这直接把盈亏平衡点推高到了大约 **`30×30` 像素**。请牢记这条黄金法则：**FFT 卷积只对大尺寸卷积核有加速意义**，小核还是直接硬算更快！"
      ],
      "formula": {
        "expr": "T_conv ∝ N² · M²    vs.    T_FFT ∝ N² · log₂(N)",
        "explain": "N 为图像边长（N×N 像素），M 为卷积核边长（M×M 像素）。传统卷积耗时随核面积 M² 平方级飙升；FFT 卷积耗时与 M 无关，仅取决于图像尺寸 N。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：卷积耗时与盈亏平衡点实时仿真 (复现图 24-16)",
      "instruction": "拖动「卷积核宽度 M」滑块，观察传统浮点 (FP)、传统整数 (INT) 与水平不变的 FFT 卷积曲线如何交叉，找到各自的盈亏平衡点。",
      "controls": [
        {
          "type": "slider",
          "id": "kernelWidth",
          "label": "卷积核宽度 M (M×M 像素)",
          "min": 1,
          "max": 50,
          "step": 1,
          "value": 20,
          "unit": " px"
        },
        {
          "type": "toggle",
          "id": "size512",
          "label": "图像尺寸 (开启=512×512 / 关闭=128×128)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showInt",
          "label": "显示传统整数卷积曲线 (INT)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const M = lab.values.kernelWidth;\n  const is512 = lab.values.size512;\n  const showInt = lab.values.showInt;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const fft512 = 4.55;\n  const fft128 = 4.55 / 20.57;\n  const fftTime = is512 ? fft512 : fft128;\n\n  function fpTime(m) {\n    const t512 = 4.55 * Math.pow(m / 10.5, 2);\n    return is512 ? t512 : t512 / 16;\n  }\n  function intTime(m) {\n    const t512 = 4.55 * Math.pow(m / 31.0, 2);\n    return is512 ? t512 : t512 / 16;\n  }\n\n  const maxY = is512 ? 5.0 : 1.0;\n  const gx = 62;\n  const gy = 26;\n  const gw = 430;\n  const gh = 176;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const y = gy + gh - (i / 5) * gh;\n    ctx.beginPath();\n    ctx.moveTo(gx, y);\n    ctx.lineTo(gx + gw, y);\n    ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'right';\n    ctx.textBaseline = 'middle';\n    const val = (i / 5) * maxY;\n    ctx.fillText(val.toFixed(1), gx - 8, y);\n  }\n\n  for (let m = 0; m <= 50; m += 10) {\n    const x = gx + (m / 50) * gw;\n    ctx.beginPath();\n    ctx.moveTo(x, gy);\n    ctx.lineTo(x, gy + gh);\n    ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'top';\n    ctx.fillText(String(m), x, gy + gh + 6);\n  }\n  ctx.textBaseline = 'alphabetic';\n\n  ctx.strokeStyle = '#475569';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('卷积核宽度 M (像素)', gx + gw / 2, gy + gh + 30);\n\n  ctx.save();\n  ctx.translate(18, gy + gh / 2);\n  ctx.rotate(-Math.PI / 2);\n  ctx.fillText('执行时间 (分钟, 100MHz Pentium)', 0, 0);\n  ctx.restore();\n\n  const fftY = gy + gh - (fftTime / maxY) * gh;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(gx, fftY);\n  ctx.lineTo(gx + gw, fftY);\n  ctx.stroke();\n\n  function plotCurve(fn, color) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let m = 0; m <= 50; m += 0.5) {\n      const t = fn(m);\n      const x = gx + (m / 50) * gw;\n      const clampedT = Math.min(t, maxY);\n      const y = gy + gh - (clampedT / maxY) * gh;\n      if (m === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n      if (t >= maxY) break;\n    }\n    ctx.stroke();\n  }\n\n  plotCurve(fpTime, '#ec4899');\n  if (showInt) {\n    plotCurve(intTime, '#10b981');\n  }\n\n  const fpBreak = is512 ? 10.5 : 9.3;\n  const intBreak = is512 ? 31.0 : 27.3;\n\n  function drawDot(mVal, tVal, color) {\n    if (tVal > maxY) return;\n    const cx = gx + (mVal / 50) * gw;\n    const cy = gy + gh - (tVal / maxY) * gh;\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(cx, cy, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.strokeStyle = '#0f172a';\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n  }\n\n  drawDot(fpBreak, fftTime, '#ec4899');\n  if (showInt) drawDot(intBreak, fftTime, '#10b981');\n\n  const curX = gx + (M / 50) * gw;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(curX, gy);\n  ctx.lineTo(curX, gy + gh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const curFp = fpTime(M);\n  const curInt = intTime(M);\n  drawDot(M, fftTime, '#38bdf8');\n  drawDot(M, curFp, '#ec4899');\n  if (showInt) drawDot(M, curInt, '#10b981');\n\n  const px = 512;\n  ctx.textAlign = 'left';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText((is512 ? '512×512' : '128×128') + ' 图像 | M = ' + M + '×' + M, px, 38);\n\n  function fmtTime(min) {\n    if (min < 1) return (min * 60).toFixed(1) + ' 秒';\n    return min.toFixed(2) + ' 分';\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('■ FFT 浮点卷积: ' + fmtTime(fftTime), px, 68);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('■ 传统浮点 (FP): ' + fmtTime(curFp), px, 90);\n  if (showInt) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('■ 传统整数 (INT): ' + fmtTime(curInt), px, 112);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('盈亏平衡点 (FFT反超):', px, 144);\n  ctx.fillText('• FP 阈值: ~' + fpBreak.toFixed(0) + '×' + fpBreak.toFixed(0), px, 162);\n  if (showInt) {\n    ctx.fillText('• INT 阈值: ~' + intBreak.toFixed(0) + '×' + intBreak.toFixed(0), px, 180);\n  }\n\n  const bestConv = showInt ? curInt : curFp;\n  const winner = fftTime < bestConv ? 'FFT 卷积胜出!' : (showInt ? '传统整数卷积更快!' : '传统浮点卷积更快!');\n  ctx.fillStyle = fftTime < bestConv ? '#38bdf8' : '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('推荐: ' + winner, px, 208);\n\n  lab.setReadout((is512 ? '512×512' : '128×128') + ' | 核尺寸 ' + M + '×' + M + ' | FFT: ' + fmtTime(fftTime) + ' vs FP: ' + fmtTime(curFp) + (showInt ? ' vs INT: ' + fmtTime(curInt) : '') + ' → ' + winner);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（核索引与代码笔误）：输出视角算卷积时，行和列索引必须独立相减 `X[R%-J%, C%-K%]`（原书 Table 24-1 第 230 行甚至自己印成了 `X[R%-J%, C%-J%]` 的笔误，照抄会直接算成对角线采样！），同时务必处理 `R%-J% < 0` 或越界的零填充边界条件。",
        "避坑 2（卷积实现相关别忘预旋转）：由于卷积自身在输出视角会把 PSF 旋转 180°，用卷积做模板匹配时，必须先把目标模板预先旋转 180°，否则非对称图形（如人脸、文字）无法对准。",
        "工程选型铁律（10×10 与 30×30 法则）：小卷积核（如 3×3 Sobel、5×5 高斯）千万别盲目上 FFT，直接写空间域整数/定点卷积快得多；只有当卷积核大于 ~10×10（纯浮点对比）或 ~30×30（整数优化对比）时，FFT 卷积的复杂度优势才真正显现。"
      ]
    }
  ]
});
