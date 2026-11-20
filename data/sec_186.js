window.__BOOK_REGISTER_SECTION__("sec_186", {
  "title": "CT 重建的核心桥梁：空间域与频域的傅里叶切片定理 (Spatial & Frequency Domains)",
  "intuition": "一维投影信号的频谱，恰好就是二维原始图像频谱中心切出的一条“切片”；而极坐标与直角坐标网格之间的采样密度差异（1/f），正是滤波反投影必须使用斜坡滤波器的根本原因。",
  "blocks": [
    {
      "type": "concept",
      "heading": "傅里叶切片定理：从一维射线积分到二维频谱切片",
      "paragraphs": [
        "在计算机断层扫描（CT）中，X 光机从不同角度穿过人体，传感器接收到的每一个“视角（view）”，在**空间域（Spatial Domain）**上本质就是二维图像沿着特定角度射线的线积分。早期的直接反投影虽然简单，但图像边缘极其模糊。真正从数学上打通二维图像与一维投影关系的里程碑，就是**傅里叶切片定理（Fourier Slice Theorem）**。",
        "该定理在**频域（Frequency Domain）**给出了一个惊人而简洁的几何等价关系：把某一个角度采集到的一维投影信号做一维傅里叶变换（1D FFT），得到的频谱数值，**与二维原始图像频谱中心处沿着同一角度穿过的那一条直线（切片）完全相同**。例如，0° 视角的频谱就是图像二维频谱的中心水平行，90° 视角的频谱就是中心垂直列（注意频谱包含正负频率，零频 DC 位于网格正中心）。",
        "基于这个定理，**傅里叶重建法（Fourier Reconstruction）**只需三步即可还原图像：第一步，对每个视角的一维投影分别计算 1D FFT；第二步，将这些呈**放射状（极坐标）**排列的频谱切片，通过**二维插值**转换到标准**直角坐标（矩形）**网格上；第三步，对填满的二维频谱做一次二维逆 FFT（2D IFFT），即可直接得到重建后的断层图像。"
      ],
      "formula": {
        "expr": "P_θ(ω) = F(ω·cosθ, ω·sinθ)",
        "explain": "θ 为投影视角；P_θ(ω) 是该视角一维投影信号的一维傅里叶变换；F(u, v) 是二维图像在直角坐标系下的二维频谱。该式表明投影频谱正是二维频谱沿角度 θ 穿过原点 (0,0) 的一条一维切片。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：空间域投影与频域切片的放射状采样可视化",
      "instruction": "拖动“当前投影视角 θ”观察左侧空间域射线积分曲线与右侧频域高亮切片的同步旋转；调节“总投影视角数”对比极坐标中心密集、边缘稀疏的采样分布。",
      "controls": [
        {
          "type": "slider",
          "id": "angle",
          "label": "当前投影视角 θ",
          "min": 0,
          "max": 175,
          "step": 5,
          "value": 45,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "spokes",
          "label": "总投影视角数",
          "min": 4,
          "max": 36,
          "step": 2,
          "value": 12,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "showGrid",
          "label": "叠加直角坐标网格",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var angle = lab.values.angle;\n  var spokes = lab.values.spokes;\n  var showGrid = lab.values.showGrid;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(360, 10); ctx.lineTo(360, H - 10);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('空间域 (Spatial Domain): 射线积分与一维投影', 18, 22);\n  ctx.fillText('频域 (Frequency Domain): 二维频谱与极坐标切片', 378, 22);\n\n  var cxL = 175, cyL = 132;\n  var rad = angle * Math.PI / 180;\n  var ux = Math.cos(rad), uy = Math.sin(rad);\n  var rx = -uy, ry = ux;\n\n  function phantom(x, y) {\n    var v = (Math.abs(x) <= 28 && Math.abs(y) <= 28) ? 0.45 : 0;\n    var dx = x - 12, dy = y + 9;\n    if (dx * dx + dy * dy <= 64) v += 0.85;\n    return v;\n  }\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.35)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.fillRect(cxL - 28, cyL - 28, 56, 56);\n  ctx.strokeRect(cxL - 28, cyL - 28, 56, 56);\n\n  ctx.fillStyle = 'rgba(248, 250, 252, 0.9)';\n  ctx.beginPath();\n  ctx.arc(cxL + 12, cyL - 9, 8, 0, Math.PI * 2);\n  ctx.fill();\n\n  var N = 32;\n  var proj = [];\n  var maxP = 1;\n  for (var i = 0; i < N; i++) {\n    var s = (i - (N - 1) / 2) * 3.0;\n    var sum = 0;\n    for (var t = -46; t <= 46; t += 3) {\n      sum += phantom(s * ux + t * rx, s * uy + t * ry) * 3;\n    }\n    proj.push(sum);\n    if (sum > maxP) maxP = sum;\n  }\n\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n  ctx.setLineDash([3, 3]);\n  for (var rIdx = -3; rIdx <= 3; rIdx++) {\n    var sRay = rIdx * 14;\n    ctx.beginPath();\n    ctx.moveTo(cxL + sRay * ux - 52 * rx, cyL + sRay * uy - 52 * ry);\n    ctx.lineTo(cxL + sRay * ux + 68 * rx, cyL + sRay * uy + 68 * ry);\n    ctx.stroke();\n  }\n  ctx.setLineDash([]);\n\n  var baseD = 72;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(cxL - 48 * ux + baseD * rx, cyL - 48 * uy + baseD * ry);\n  ctx.lineTo(cxL + 48 * ux + baseD * rx, cyL + 48 * uy + baseD * ry);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var s = (i - (N - 1) / 2) * 3.0;\n    var h = (proj[i] / 55) * 26;\n    var px = cxL + s * ux + (baseD + h) * rx;\n    var py = cyL + s * uy + (baseD + h) * ry;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var M = 17;\n  var mags = [];\n  var maxMag = 1e-6;\n  for (var k = -8; k <= 8; k++) {\n    var re = 0, im = 0;\n    for (var n = 0; n < N; n++) {\n      var ph = -2 * Math.PI * k * (n - N / 2) / N;\n      re += proj[n] * Math.cos(ph);\n      im += proj[n] * Math.sin(ph);\n    }\n    var mag = Math.sqrt(re * re + im * im);\n    mags.push(mag);\n    if (mag > maxMag) maxMag = mag;\n  }\n\n  var cxR = 540, cyR = 132, R = 86;\n  if (showGrid) {\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';\n    ctx.lineWidth = 1;\n    var step = (R * 2) / 14;\n    for (var g = -7; g <= 7; g++) {\n      var off = g * step;\n      ctx.beginPath();\n      ctx.moveTo(cxR - R, cyR + off); ctx.lineTo(cxR + R, cyR + off);\n      ctx.moveTo(cxR + off, cyR - R); ctx.lineTo(cxR + off, cyR + R);\n      ctx.stroke();\n    }\n  }\n\n  for (var sp = 0; sp < spokes; sp++) {\n    var a = (sp / spokes) * Math.PI;\n    var dx = Math.cos(a), dy = Math.sin(a);\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.35)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(cxR - R * dx, cyR - R * dy);\n    ctx.lineTo(cxR + R * dx, cyR + R * dy);\n    ctx.stroke();\n    for (var d = -6; d <= 6; d++) {\n      if (d === 0) continue;\n      var rr = (d / 6) * R * 0.92;\n      ctx.fillStyle = 'rgba(16, 185, 129, 0.7)';\n      ctx.beginPath();\n      ctx.arc(cxR + rr * dx, cyR + rr * dy, 1.7, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(cxR - R * ux, cyR - R * uy);\n  ctx.lineTo(cxR + R * ux, cyR + R * uy);\n  ctx.stroke();\n\n  for (var k = 0; k < M; k++) {\n    var frac = (k - 8) / 8;\n    var rr = frac * R * 0.9;\n    var normM = mags[k] / maxMag;\n    ctx.fillStyle = normM > 0.4 ? '#f8fafc' : '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(cxR + rr * ux, cyR + rr * uy, 2 + normM * 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(cxR, cyR, 4, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('DC (0,0)', cxR + 6, cyR + 12);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('当前视角频谱切片', cxR + R * ux * 0.55 + 8, cyR + R * uy * 0.55 - 8);\n\n  lab.setReadout('视角 θ = ' + angle + '° | 总切片数 = ' + spokes + ' | 观察右侧中心 DC 附近绿点极度拥挤 (密度 ∝ 1/f)，边缘则非常稀疏');\n});"
    },
    {
      "type": "concept",
      "heading": "为什么直接反投影会模糊？“车轮辐条”密度与斜坡滤波器",
      "paragraphs": [
        "傅里叶切片定理不仅解释了傅里叶重建，更是理解**滤波反投影（Filtered Backprojection）**的钥匙。如果我们不做二维插值，而是把所有角度的一维投影直接涂抹回二维空间（即简单反投影），在频域上就相当于直接把所有放射状的切片强行叠加在一起。",
        "对比一下“放射状频谱”和“正确的直角坐标频谱”：在局部小区域里，两者的采样**数值**是完全一致的，但**采样密度（Sample Density）**却天差地别！直角网格在整个频谱平面上均匀分布；而放射状频谱就像自行车轮的辐条，**越靠近轮毂（低频零频区）辐条越密集，越往外缘（高频边缘区）越稀疏**，其采样密度与空间频率成反比（即密度为 `1/f`）。低频能量被严重过采样放大，导致直接反投影的图像罩了一层浓重的模糊光晕。",
        "为了消除这种不均匀的采样密度，滤波反投影在反投影之前，必须先让每个视角的一维投影通过一个滤波器，使其频率响应恰好等于采样密度的**倒数**——也就是一条从零频直线上升的**斜坡滤波器（Ramp Filter）**：`H[f] = f`（低频衰减、高频放大）。将这个理想斜坡频率响应做逆傅里叶变换，就得到了标准且极其优美的离散卷积核 **Equation 25-2**：中心权重为 1，所有非零偶数索引全为 0，所有奇数索引随距离平方反比衰减且为负值，专门用来在反投影前把信号边缘“锐化”并对消周边的 `1/r` 拖影。"
      ],
      "formula": {
        "expr": "H[f] = f   ⇔   h[0] = 1,  h[k] = 0 (k为非零偶数),  h[k] = -4 / (π²·k²) (k为奇数)",
        "explain": "f 为归一化空间频率（0 到 0.5）；H[f] 是斜坡滤波器的频响，用来精确抵消放射状频谱 1/f 的中心过采样；h[k] 是对应的离散空间域滤波卷积核（Equation 25-2），其中 k=±1 处约为 -0.405，负责在反投影前制造负向过冲以消除模糊晕影。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：斜坡滤波器频响、卷积核截断与反投影锐化效果",
      "instruction": "把“斜坡滤波补偿强度”从 100% 拖向 0%，观察右图清晰矩形截面如何退化为模糊鼓包；减小“截断半径 K”，观察频响上的吉布斯波纹与重建边缘振铃。",
      "controls": [
        {
          "type": "slider",
          "id": "filterGain",
          "label": "斜坡滤波补偿强度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 100,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "halfWidth",
          "label": "卷积核截断半径 K",
          "min": 2,
          "max": 20,
          "step": 1,
          "value": 14,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showIdeal",
          "label": "显示理想斜坡参考线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var g = lab.values.filterGain / 100;\n  var K = lab.values.halfWidth;\n  var showIdeal = lab.values.showIdeal;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  function kernelVal(k) {\n    if (k === 0) return 0.5;\n    if (k % 2 === 0) return 0;\n    return -2 / (Math.PI * Math.PI * k * k);\n  }\n\n  function effKernel(k) {\n    var d = (k === 0) ? 0.5 : 0;\n    var r = (Math.abs(k) <= K) ? kernelVal(k) : 0;\n    return (1 - g) * d + g * r;\n  }\n\n  function H_eff(f) {\n    var sum = effKernel(0);\n    for (var k = 1; k <= K; k++) {\n      sum += 2 * effKernel(k) * Math.cos(2 * Math.PI * f * k);\n    }\n    return sum;\n  }\n\n  // Panel 1: Frequency Response (x: 20..225)\n  var p1x = 28, p1w = 195, p1y = 42, p1h = 165;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = p1y + (i / 4) * p1h;\n    ctx.beginPath(); ctx.moveTo(p1x, yy); ctx.lineTo(p1x + p1w, yy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(p1x, p1y, p1w, p1h);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('a. 频域响应 H[f] (0~0.5)', p1x, 24);\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0', p1x - 4, p1y + p1h + 13);\n  ctx.fillText('0.5', p1x + p1w - 14, p1y + p1h + 13);\n\n  if (showIdeal) {\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(p1x, p1y + p1h - (0 / 1.2) * p1h);\n    ctx.lineTo(p1x + p1w, p1y + p1h - (1.0 / 1.2) * p1h);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var s = 0; s <= 100; s++) {\n    var f = (s / 100) * 0.5;\n    var val = H_eff(f);\n    var x = p1x + (s / 100) * p1w;\n    var y = p1y + p1h - (val / 1.2) * p1h;\n    y = Math.max(p1y, Math.min(p1y + p1h, y));\n    if (s === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Panel 2: Filter Kernel h[k] (x: 255..465)\n  var p2x = 258, p2w = 205, p2y = 42, p2h = 165;\n  var zeroY = p2y + p2h * 0.65;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(p2x, p2y, p2w, p2h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath(); ctx.moveTo(p2x, zeroY); ctx.lineTo(p2x + p2w, zeroY); ctx.stroke();\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('b. 卷积核 h[k] (Eq 25-2)', p2x, 24);\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-20', p2x, p2y + p2h + 13);\n  ctx.fillText('0', p2x + p2w / 2 - 3, p2y + p2h + 13);\n  ctx.fillText('+20', p2x + p2w - 18, p2y + p2h + 13);\n\n  for (var k = -20; k <= 20; k++) {\n    var x = p2x + ((k + 20) / 40) * p2w;\n    var hk = effKernel(k) * 2;\n    var active = Math.abs(k) <= K;\n    var barY = zeroY - hk * 85;\n    ctx.strokeStyle = active ? '#10b981' : 'rgba(148,163,184,0.25)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(x, zeroY); ctx.lineTo(x, barY); ctx.stroke();\n    ctx.fillStyle = active ? (k === 0 ? '#f8fafc' : '#10b981') : 'rgba(148,163,184,0.3)';\n    ctx.beginPath();\n    ctx.arc(x, barY, active ? 2.5 : 1.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  // Panel 3: Simulated 1D Profile Reconstruction (x: 495..700)\n  var p3x = 495, p3w = 205, p3y = 42, p3h = 165;\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.strokeRect(p3x, p3y, p3w, p3h);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('c. 1D 截面重建效果对比', p3x, 24);\n\n  var N = 64;\n  var box = [], Xre = [], Xim = [];\n  for (var n = 0; n < N; n++) {\n    box.push((n >= 22 && n <= 41) ? 1.0 : 0.0);\n  }\n  for (var m = 0; m < N; m++) {\n    var re = 0, im = 0;\n    for (var n = 0; n < N; n++) {\n      var ph = -2 * Math.PI * m * n / N;\n      re += box[n] * Math.cos(ph);\n      im += box[n] * Math.sin(ph);\n    }\n    var f = (m <= N / 2 ? m : m - N) / N;\n    var bpBlur = 0.5 / Math.max(Math.abs(f), 0.045);\n    var filt = (1 - g) * 0.14 + g * H_eff(Math.abs(f));\n    var gain = bpBlur * filt;\n    Xre.push(re * gain);\n    Xim.push(im * gain);\n  }\n  var rec = [];\n  for (var n = 0; n < N; n++) {\n    var s = 0;\n    for (var m = 0; m < N; m++) {\n      var ph = 2 * Math.PI * m * n / N;\n      s += Xre[m] * Math.cos(ph) - Xim[m] * Math.sin(ph);\n    }\n    rec.push(s / N);\n  }\n\n  var baseLineY = p3y + p3h * 0.82;\n  var scaleY = p3h * 0.58;\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.setLineDash([4, 3]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var x = p3x + (n / (N - 1)) * p3w;\n    var y = baseLineY - box[n] * scaleY;\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var x = p3x + (n / (N - 1)) * p3w;\n    var y = baseLineY - rec[n] * scaleY;\n    y = Math.max(p3y + 4, Math.min(p3y + p3h - 4, y));\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('虚线: 真实截面  粉线: 重建结果', p3x + 12, p3y + p3h + 13);\n\n  lab.setReadout('斜坡补偿 = ' + Math.round(g * 100) + '% | 截断半径 K = ' + K + ' | 补偿 0% 时低频拖影严重；补偿 100% 且 K 足够大时边缘瞬间清晰');\n});"
    },
    {
      "type": "concept",
      "heading": "超越 X 光的同源重建家族：PET 生理成像与 MRI 磁共振",
      "paragraphs": [
        "空间域投影与频域重建的这套 DSP 数学框架，并非只属于 X 射线 CT。医学影像领域还有两大支柱同样深度依赖类似的重建思想：首先是**正电子发射断层扫描（PET, Positron Emission Tomography）**。检查时先向患者体内注入微弱的放射性示踪剂，它发射出的正电子会瞬间与电子发生湮灭，产生**一对向完全相反方向飞出的伽马射线**。",
        "环形探测器捕捉到这对“背靠背”同时到达的伽马光子，就能确定湮灭发生的那条直线位置——这在几何上完全等价于 CT 的射线积分！用类似的断层重建算法即可得到图像，但像素亮度代表的不是组织密度，而是放射性物质的浓度。由于示踪剂可以绑定到**葡萄糖**等人体代谢物质上，PET 能够直接对人体的**生理功能（如大脑执行思维任务时哪块区域正在活跃消耗葡萄糖）**成像，而不只是看静态的解剖结构。",
        "另一位更直接的竞争者是**磁共振成像（MRI, Magnetic Resonance Imaging）**。它最初名为核磁共振（NMR），后来为了消除公众对“核（Nuclear）”字的误解才改名（其实它仅指所有原子都拥有原子核）。MRI 将患者置于强磁场中，利用射频脉冲激发出原子核的次级无线电波信号并数字化重建。相比 CT，MRI **软组织分辨力极佳、切片角度极其灵活，且完全没有电离 X 射线辐射风险**；缺点则是设备与检查成本更高，且对骨骼等硬组织成像能力较弱。两者将在很长一段时间内共同构成现代医学成像的主力。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【傅里叶切片定理本质】：一维投影的 1D FFT 等价于二维图像 2D FFT 过零点的一条切片；极坐标转直角坐标插值时，必须同时考虑正负频率且零频居中，否则直接做 IFFT 会产生严重相位错乱。",
        "【为什么非用斜坡滤波器不可】：简单反投影在频域上的样本密度呈 1/f 分布（低频轮毂处极度拥挤），必须乘以 H[f]=f 的斜坡滤波器抵消过采样；实际工程中还会给斜坡滤波器加平滑窗截断高频（如 Hamming/Shepp-Logan 窗），防止放大传感器高频噪声。",
        "【Equation 25-2 卷积核特征】：离散核 h[0]=1，非零偶数点全为 0，奇数点为负值 -4/(π²k²)；如果核截断半径 K 太小，频响会出现吉布斯振荡，重建图像边缘会产生明暗交替的振铃伪影。",
        "【模态选型直觉】：看骨骼/钙化/急性出血优先 CT；看软组织/神经系统且需避开辐射优先 MRI；看代谢活性/肿瘤早期生理功能变化优先 PET。"
      ]
    }
  ]
});
