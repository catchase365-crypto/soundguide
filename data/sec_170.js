window.__BOOK_REGISTER_SECTION__("sec_170", {
  "title": "电视视频信号与数字采像 (Television Video Signals)",
  "intuition": "电视信号把二维画面压成一根带有“比黑更黑”同步脉冲的一维模拟电压波，再由采集卡按独立时钟重新切成像素列——这正是数字图像的列数与宽高比经常和 CCD 物理结构脱钩的根本原因。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 复合视频与隔行扫描：一根线如何传完整个画面？",
      "paragraphs": [
        "尽管诞生已超过半个世纪，标准模拟电视信号依然是最常见的图像传输方式之一。在示波器上看到的电视信号叫做 **复合视频 (Composite Video)**——它并不是纯粹的画面波形，而是把 **图像灰度电压** 与 **垂直/水平同步脉冲 (Sync Pulses)** 混在同一根信号线上。电视机接收端正是靠这些同步脉冲来控制电子束偏转电路，确保每一行、每一帧严丝合缝地对齐。",
        "以北美与日本使用的标准视频（NTSC）为例，每秒传送 **30 帧 (Frames)** 完整画面。视频工程师会说每帧包含 **525 行 (Lines)**（也就是程序员常说的 rows）。但这个数字有点“虚高”：其中只有 **480 到 486 行** 真正包含画面信息，其余 **39 到 45 行** 全都用来发送同步脉冲。",
        "为了在有限带宽下消除人眼可见的画面闪烁（Flicker），标准电视采用了 **隔行扫描 (Interlaced Format)**：先发送一帧中所有的奇数行（称为 **奇数场 Odd Field**），再发送所有偶数行（称为 **偶数场 Even Field**）。由于每帧拆成两场，信号传输速率就变成了 **每秒 60 场 (60 fields/s)**。",
        "每一场都以一段持续 **1.3 毫秒** 的复杂 **垂直同步脉冲** 开场，随后紧跟奇数或偶数视频行。每行总耗时 **63.5 微秒**，其中包含一个 **10.2 微秒** 的 **水平同步脉冲** 用作行间分隔，剩下的 **53.2 微秒** 才是真正的图像电压。图像电压越大（偏离同步脉冲方向）代表像素越亮；而同步脉冲落在比纯黑电平还要低的负向区域，因此在视频行话里被称为 **比黑更黑 (Blacker than black)**。"
      ],
      "formula": {
        "expr": "T_line = T_hsync + T_active = 10.2 μs + 53.2 μs ≈ 63.5 μs",
        "explain": "T_line 为单行扫描总周期（30 帧 × 525 行 = 15,750 行/秒）；T_hsync 是“比黑更黑”的水平同步脉冲宽度，告诉接收端换行；T_active 是真正承载连续灰度电压的有效视频窗口。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：复合视频示波器与“比黑更黑”同步脉冲",
      "instruction": "切换奇/偶数场、拖动图像亮度偏置与对比度滑块，观察示波器波形与上方解码出的真实灰度条带，还可点击按钮监听 60 Hz 场同步混入音频时的经典“嗡鸣声”。",
      "controls": [
        {
          "type": "slider",
          "id": "brightness",
          "label": "图像亮度偏置",
          "min": 0,
          "max": 0.4,
          "step": 0.02,
          "value": 0.14,
          "unit": " V"
        },
        {
          "type": "slider",
          "id": "contrast",
          "label": "画面对比度",
          "min": 0.2,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "evenField",
          "label": "切换偶数场 (Even Field)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听视频信号嗡鸣",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioNodes = null;\n\nfunction ensureAudio(play, brightness, contrast) {\n  if (!play) {\n    if (audioNodes && audioNodes.gain) {\n      audioNodes.gain.gain.setTargetAtTime(0, audioNodes.ctx.currentTime, 0.02);\n    }\n    return;\n  }\n  var actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') {\n    actx.resume();\n  }\n  if (!audioNodes) {\n    var osc1 = actx.createOscillator();\n    var osc2 = actx.createOscillator();\n    var gain = actx.createGain();\n    var g2 = actx.createGain();\n    osc1.type = 'sawtooth';\n    osc1.frequency.value = 60;\n    osc2.type = 'square';\n    osc2.frequency.value = 180;\n    g2.gain.value = 0.25;\n    osc1.connect(gain);\n    osc2.connect(g2);\n    g2.connect(gain);\n    gain.connect(actx.destination);\n    gain.gain.value = 0;\n    osc1.start();\n    osc2.start();\n    audioNodes = { ctx: actx, osc1: osc1, osc2: osc2, gain: gain, g2: g2 };\n  }\n  var level = 0.025 + 0.03 * contrast;\n  audioNodes.osc2.frequency.setTargetAtTime(180 + brightness * 140, actx.currentTime, 0.03);\n  audioNodes.gain.gain.setTargetAtTime(level, actx.currentTime, 0.03);\n}\n\nfunction vToY(v) {\n  return 192 - (v + 0.25) * 145;\n}\n\nfunction activeWave(u, lineNum, brightness, contrast) {\n  var raw = 0.32 + 0.22 * Math.sin(u * Math.PI * 2.4 + lineNum * 0.65) - 0.14 * Math.cos(u * Math.PI * 5.4 - lineNum * 0.4);\n  var v = brightness + (raw - 0.12) * contrast + 0.08;\n  if (v < 0.02) v = 0.02;\n  if (v > 0.74) v = 0.74;\n  return v;\n}\n\nfunction draw() {\n  var brightness = lab.values.brightness;\n  var contrast = lab.values.contrast;\n  var evenField = lab.values.evenField;\n  var play = lab.values.play;\n\n  ensureAudio(play, brightness, contrast);\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var x0 = 56;\n  var x1 = 648;\n  var levels = [-0.25, 0.0, 0.25, 0.5, 0.75];\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  for (var i = 0; i < levels.length; i++) {\n    var lv = levels[i];\n    var y = vToY(lv);\n    ctx.strokeStyle = lv === 0 ? 'rgba(248, 250, 252, 0.25)' : 'rgba(255, 255, 255, 0.08)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(x0, y);\n    ctx.lineTo(x1, y);\n    ctx.stroke();\n    ctx.fillStyle = lv < 0 ? '#f59e0b' : '#94a3b8';\n    ctx.fillText(lv.toFixed(2) + 'V', x0 - 6, y + 4);\n  }\n\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n  ctx.fillRect(x0, vToY(0.0), x1 - x0, vToY(-0.25) - vToY(0.0));\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'left';\n  ctx.fillText('比黑更黑 (Sync 同步区)', x0 + 6, vToY(-0.14) + 3);\n\n  var fieldColor = evenField ? '#ec4899' : '#10b981';\n  var fieldTitle = evenField ? 'EVEN FIELD (偶数场：line 2, 4, 6...)' : 'ODD FIELD (奇数场：line 1, 3, 5...)';\n  ctx.fillStyle = fieldColor;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(fieldTitle, x0, 20);\n\n  var vsEnd = 172;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var pulseCount = 8;\n  var stepW = (vsEnd - x0) / pulseCount;\n  for (var p = 0; p < pulseCount; p++) {\n    var px = x0 + p * stepW;\n    var yHi = vToY(0.0);\n    var yLo = vToY(-0.25);\n    var duty = p < 5 ? 0.65 : 0.3;\n    ctx.moveTo(px, yHi);\n    ctx.lineTo(px, yLo);\n    ctx.lineTo(px + stepW * duty, yLo);\n    ctx.lineTo(px + stepW * duty, yHi);\n    ctx.lineTo(px + stepW, yHi);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('垂直同步脉冲', (x0 + vsEnd) / 2, 214);\n  ctx.fillText('(1.3 ms)', (x0 + vsEnd) / 2, 228);\n\n  var lineStart = vsEnd;\n  var lineW = 158;\n  var hSyncW = 24;\n  var lineNums = evenField ? [2, 4, 6] : [1, 3, 5];\n\n  for (var L = 0; L < 3; L++) {\n    var lx = lineStart + L * lineW;\n    var ln = lineNums[L];\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.beginPath();\n    ctx.moveTo(lx, 36);\n    ctx.lineTo(lx, 198);\n    ctx.stroke();\n\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(lx, vToY(0.0));\n    ctx.lineTo(lx, vToY(-0.25));\n    ctx.lineTo(lx + hSyncW, vToY(-0.25));\n    ctx.lineTo(lx + hSyncW, vToY(0.0));\n    ctx.stroke();\n\n    var vidStart = lx + hSyncW;\n    var vidW = lineW - hSyncW;\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var s = 0; s <= 64; s++) {\n      var u = s / 64;\n      var vx = vidStart + u * vidW;\n      var v = activeWave(u, ln, brightness, contrast);\n      var vy = vToY(v);\n      if (s === 0) ctx.moveTo(vx, vy);\n      else ctx.lineTo(vx, vy);\n\n      if (s < 64) {\n        var gray = Math.round((v / 0.75) * 255);\n        if (gray < 0) gray = 0;\n        if (gray > 255) gray = 255;\n        ctx.fillStyle = 'rgb(' + gray + ',' + gray + ',' + gray + ')';\n        ctx.fillRect(vx, 28, vidW / 64 + 1, 10);\n      }\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('line ' + ln, vidStart + vidW / 2, 214);\n    if (L === 0) {\n      ctx.fillStyle = '#f59e0b';\n      ctx.fillText('H-sync', lx + hSyncW / 2, 228);\n    } else if (L === 1) {\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText('53.2 us 有效图像行', vidStart + vidW / 2, 228);\n    }\n  }\n\n  var barX = 668;\n  var barW = 20;\n  var barTop = vToY(0.75);\n  var barBlack = vToY(0.0);\n  var barSync = vToY(-0.25);\n  var grad = ctx.createLinearGradient(0, barTop, 0, barBlack);\n  grad.addColorStop(0, '#ffffff');\n  grad.addColorStop(1, '#000000');\n  ctx.fillStyle = grad;\n  ctx.fillRect(barX, barTop, barW, barBlack - barTop);\n  ctx.fillStyle = '#1e1b4b';\n  ctx.fillRect(barX, barBlack, barW, barSync - barBlack);\n  ctx.strokeStyle = '#64748b';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(barX, barTop, barW, barSync - barTop);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('亮白', barX + barW / 2, barTop - 5);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('同步', barX + barW / 2, barSync + 12);\n\n  lab.setReadout(\n    (evenField ? '偶数场 (60Hz)' : '奇数场 (60Hz)') +\n    ' | 亮度偏置: +' + brightness.toFixed(2) + 'V | 对比度: ' + contrast.toFixed(2) + 'x' +\n    (play ? ' | 正在输出 60Hz 场同步嗡鸣声' : '')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. 帧采集卡（Frame Grabber）与水平、垂直方向的惊人差异",
      "paragraphs": [
        "要把相机传来的模拟视频变成电脑内存里的数字图像，需要一块叫做 **帧采集卡 (Frame Grabber)** 的模数转换硬件（通常插在电脑主板上，通过同轴电缆连接相机）。收到软件指令后，采集卡会先死盯着垂直同步脉冲，等下一帧开头一到，就在随后的奇数场与偶数场里，对每一行视频高频采样——典型值为 **每行 512、640 或 720 个采样点**，每个点 **8 位 (8-bit)** 量化精度，直接存成数字图像的一行。",
        "这种采集方式导致了一个极其关键的工程事实：**数字图像的垂直方向（行）和水平方向（列）完全不对等！** 垂直方向上，数字图像的每一行精准对应视频信号里的一行，进而一对一来自 CCD 芯片上的一行势阱。但水平方向（列）却完全不是这么回事。",
        "不同型号的 CCD 相机每行可能做有 **400 到 800 个势阱（物理列）**。然而当一行电荷从 CCD 读出时，电路会将其平滑滤波成连续的模拟视频信号。换句话说，**视频信号根本记不住 CCD 原来有多少列**！水平方向的真实清晰度只受限于模拟信号允许变化多快：彩色电视把带宽限制在 **3.2 MHz**，对应的阶跃上升时间约为 **100 纳秒**，大约占 53.2 微秒有效视频行长的 1/500。",
        "当帧采集卡把这段平滑模拟信号重新数字化成列时，**数字图像有多少列，完全取决于采集卡每行采几次，跟 CCD 的物理列数毫无关系**（例如 800 列的 CCD 采出来可能只有 512 列像素）。更麻烦的是 **宽高比 (Aspect Ratio)**：标准电视是 **4:3**（略扁宽），电影宽银幕是 **25:9**，而科研级 CCD 常常做成 **1:1** 正方形。CCD 电极做死后宽高比无法改变，但数字图像的显示比例却随采集卡采样数而变——如果不做比例匹配，原本圆滚滚的目标在显示器或打印稿上就会被拉扁或挤瘦。"
      ],
      "formula": {
        "expr": "N_horiz ≈ T_active / t_rise ≈ 53.2 μs / 100 ns ≈ 532",
        "explain": "T_active 是 53.2 微秒的有效行扫描时间，t_rise 是 3.2 MHz 模拟带宽允许的最快上升时间（约 100 纳秒）。无论 CCD 物理上有多少列、采集卡多么拼命过采样，水平方向最多也只能分辨约 500 多个独立细节。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：模拟带宽瓶颈、重采样与宽高比失真",
      "instruction": "试着左右拖动“CCD 物理列数”，你会发现中间的模拟波形与右侧成像纹丝不动；再拖动“模拟视频带宽”观察边缘模糊度，最后调整“采集卡每行采样数”观察圆形标靶是如何被拉扁或挤瘦的。",
      "controls": [
        {
          "type": "slider",
          "id": "ccdCols",
          "label": "CCD 物理列数",
          "min": 400,
          "max": 800,
          "step": 20,
          "value": 800,
          "unit": " 列"
        },
        {
          "type": "slider",
          "id": "bw",
          "label": "模拟视频带宽",
          "min": 0.8,
          "max": 5,
          "step": 0.2,
          "value": 3.2,
          "unit": " MHz"
        },
        {
          "type": "slider",
          "id": "grabCols",
          "label": "采集卡每行采样数",
          "min": 256,
          "max": 800,
          "step": 16,
          "value": 512,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "fixAspect",
          "label": "强制按 4:3 电视框显示",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction smoothStep(edge0, edge1, x) {\n  var t = (x - edge0) / (edge1 - edge0);\n  if (t < 0) t = 0;\n  if (t > 1) t = 1;\n  return t * t * (3 - 2 * t);\n}\n\nfunction analogPulse(u, bwMHz) {\n  var trNorm = (320 / bwMHz) / 53200;\n  var halfEdge = Math.max(0.008, trNorm * 4.5);\n  var rise = smoothStep(0.28 - halfEdge, 0.28 + halfEdge, u);\n  var fall = smoothStep(0.72 - halfEdge, 0.72 + halfEdge, u);\n  return 0.05 + 0.68 * (rise - fall);\n}\n\nfunction draw() {\n  var ccdCols = lab.values.ccdCols;\n  var bw = lab.values.bw;\n  var grabCols = lab.values.grabCols;\n  var fixAspect = lab.values.fixAspect;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(10, 10, 186, 220);\n  ctx.strokeRect(206, 10, 286, 220);\n  ctx.strokeRect(502, 10, 208, 220);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('1. CCD 传感器 (1:1)', 103, 28);\n  ctx.fillText('2. 模拟滤波 & 采集卡重采样', 349, 28);\n  ctx.fillText('3. 数字图像显示结果', 606, 28);\n\n  var ccdSize = 96;\n  var cx1 = 103;\n  var cy1 = 114;\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(cx1 - ccdSize / 2, cy1 - ccdSize / 2, ccdSize, ccdSize);\n\n  ctx.fillStyle = '#e2e8f0';\n  ctx.beginPath();\n  ctx.arc(cx1, cy1, 24, 0, Math.PI * 2);\n  ctx.fill();\n\n  var gridCount = Math.round(ccdCols / 40);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.28)';\n  ctx.lineWidth = 1;\n  for (var g = 1; g < gridCount; g++) {\n    var gx = (cx1 - ccdSize / 2) + (g / gridCount) * ccdSize;\n    ctx.beginPath();\n    ctx.moveTo(gx, cy1 - ccdSize / 2);\n    ctx.lineTo(gx, cy1 + ccdSize / 2);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(cx1 - ccdSize / 2, cy1 - 3, ccdSize, 6);\n  ctx.strokeStyle = '#64748b';\n  ctx.strokeRect(cx1 - ccdSize / 2, cy1 - ccdSize / 2, ccdSize, ccdSize);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('物理列数: ' + ccdCols + ' 阱/行', cx1, 186);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('粉框 = 当前读取行', cx1, 204);\n\n  var wx0 = 224;\n  var wx1 = 474;\n  var ww = wx1 - wx0;\n  var wyBase = 166;\n  var wyTop = 64;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var r = 0; r <= 4; r++) {\n    var ry = wyTop + (r / 4) * (wyBase - wyTop);\n    ctx.beginPath();\n    ctx.moveTo(wx0, ry);\n    ctx.lineTo(wx1, ry);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(148, 163, 184, 0.4)';\n  ctx.lineWidth = 1;\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (var k = 0; k <= 80; k++) {\n    var uk = k / 80;\n    var stepVal = (uk >= 0.28 && uk <= 0.72) ? 0.73 : 0.05;\n    var px = wx0 + uk * ww;\n    var py = wyBase - (stepVal / 0.75) * (wyBase - wyTop);\n    if (k === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var s = 0; s <= 120; s++) {\n    var us = s / 120;\n    var av = analogPulse(us, bw);\n    var ax = wx0 + us * ww;\n    var ay = wyBase - (av / 0.75) * (wyBase - wyTop);\n    if (s === 0) ctx.moveTo(ax, ay);\n    else ctx.lineTo(ax, ay);\n  }\n  ctx.stroke();\n\n  var visDots = Math.round(grabCols / 28);\n  ctx.fillStyle = '#f59e0b';\n  for (var d = 0; d <= visDots; d++) {\n    var ud = d / visDots;\n    var dv = analogPulse(ud, bw);\n    var dx = wx0 + ud * ww;\n    var dy = wyBase - (dv / 0.75) * (wyBase - wyTop);\n    ctx.beginPath();\n    ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var trNs = Math.round(320 / bw);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('带宽 ' + bw.toFixed(1) + ' MHz -> 上升时间 ~' + trNs + ' ns', 349, 186);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('黄点 = 采集卡重采样 (' + grabCols + ' 点/行)', 349, 204);\n\n  var cx3 = 606;\n  var cy3 = 114;\n  var dispH = 96;\n  var rawW = (grabCols / 480) * dispH;\n  var dispW = fixAspect ? (dispH * 4 / 3) : rawW;\n  if (dispW > 184) dispW = 184;\n\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(cx3 - dispW / 2, cy3 - dispH / 2, dispW, dispH);\n\n  var rx = dispW * 0.25;\n  var ryRad = dispH * 0.25;\n  var blurNorm = Math.min(0.65, (3.2 / bw) * 0.14);\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(cx3 - dispW / 2, cy3 - dispH / 2, dispW, dispH);\n  ctx.clip();\n  ctx.translate(cx3, cy3);\n  ctx.scale(rx, ryRad);\n  var grad = ctx.createRadialGradient(0, 0, Math.max(0.1, 1 - blurNorm), 0, 0, 1 + blurNorm);\n  grad.addColorStop(0, '#f8fafc');\n  grad.addColorStop(1, 'rgba(30, 41, 59, 0)');\n  ctx.fillStyle = grad;\n  ctx.beginPath();\n  ctx.arc(0, 0, 1 + blurNorm, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.restore();\n\n  var outGrid = Math.round(grabCols / 40);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.22)';\n  ctx.lineWidth = 1;\n  for (var og = 1; og < outGrid; og++) {\n    var ogx = (cx3 - dispW / 2) + (og / outGrid) * dispW;\n    ctx.beginPath();\n    ctx.moveTo(ogx, cy3 - dispH / 2);\n    ctx.lineTo(ogx, cy3 + dispH / 2);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = fixAspect ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(cx3 - dispW / 2, cy3 - dispH / 2, dispW, dispH);\n\n  var ratioStr = fixAspect ? '4:3 (1.33:1 电视框)' : (grabCols / 480).toFixed(2) + ':1';\n  ctx.fillStyle = fixAspect ? '#10b981' : '#f59e0b';\n  ctx.font = '11px monospace';\n  ctx.fillText('显示比例: ' + ratioStr, cx3, 186);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText(fixAspect ? '1:1靶在4:3屏未重映射仍显扁' : (grabCols === 480 ? '1:1 比例完全还原' : (grabCols > 480 ? '采样过密 -> 横向拉扁!' : '采样过稀 -> 横向挤瘦!')), cx3, 204);\n\n  lab.setReadout(\n    'CCD物理列数=' + ccdCols + ' (被滤波抹平) | 带宽=' + bw.toFixed(1) + 'MHz (tr≈' + trNs + 'ns) | 数字分辨率=' + grabCols + 'x480'\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 全球电视制式（NTSC vs PAL/SECAM）与彩色信号的兼容魔法",
      "paragraphs": [
        "前面讨论的这套 525 行视频标准叫做 **NTSC (National Television Systems Committee)**，早在 1954 年就已制定，主要应用于美国和日本。在欧洲则流行另外两大类似标准：**PAL (Phase Alternation by Line)** 与 **SECAM (Sequential Chrominance And Memory)**。它们的核心原理与 NTSC 完全一致，只是具体参数不同：PAL 和 SECAM 均以 **每秒 25 帧** 隔行扫描（50 场/秒），每帧 **625 行**，扣除垂直同步后约有 **576 行** 携带画面信息，并在色彩编码和伴音调制细节上略有差异。",
        "如果从零设计彩色电视，最直白的方法莫过于同时传送红、绿、蓝（RGB）三路独立模拟信号——人眼正好有这三种视锥细胞。但历史发展不允许这么奢侈：彩色电视发明时，千家万户已经买了黑白电视机，必须保证 **老式黑白电视机不经任何改装就能直接收看彩色节目**！",
        "工程师的解法堪称频分复用的典范：完整保留原有的黑白信号专门用来传递画面明暗，视频行话叫 **亮度信号 (Luminance)**；再把色彩信息单独调制到一个 **3.58 MHz 载波** 上，叠加载入原有的黑白信号，称为 **色度信号 (Chrominance)**；同样地，电视伴音也被调制到 **4.5 MHz 载波** 上一起发送。彩色电视机收到后把三路频段拆开分别处理再合成彩色画面，而老黑白电视机直接忽略高频彩色载波，依然能丝滑播放黑白影像。"
      ],
      "formula": {
        "expr": "S_TV(t) = Y(t) + C(t)·cos(2π·3.58MHz·t) + A(t)·cos(2π·4.5MHz·t)",
        "explain": "Y(t) 是兼容黑白电视的低频亮度信号（限宽在约 3.2 MHz 内）；C(t) 是寄生在 3.58 MHz 副载波上的色度信号；A(t) 是寄生在 4.5 MHz 载波上的伴音信号。这也反过来解释了为什么亮度带宽不能越过 3.2 MHz——否则会撞进 3.58 MHz 引发彩色串色干扰。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验三：黑白兼容彩色频谱与 3.2 MHz 带宽红线",
      "instruction": "尝试把亮度信号带宽拉高超过 3.2 MHz，观察频谱是如何侵入 3.58 MHz 色度载波区并引发“串色伪影（Cross-color）”的。",
      "controls": [
        {
          "type": "slider",
          "id": "lumaBw",
          "label": "亮度信号带宽 (Y)",
          "min": 1.5,
          "max": 4.2,
          "step": 0.1,
          "value": 3.2,
          "unit": " MHz"
        },
        {
          "type": "toggle",
          "id": "hasChroma",
          "label": "叠加 3.58 MHz 色度载波 (C)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "hasSound",
          "label": "叠加 4.50 MHz 伴音载波 (Audio)",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction fToX(f) {\n  return 56 + (f / 5.0) * 610;\n}\n\nfunction draw() {\n  var lumaBw = lab.values.lumaBw;\n  var hasChroma = lab.values.hasChroma;\n  var hasSound = lab.values.hasSound;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var baseY = 192;\n  var topY = 42;\n  var spanY = baseY - topY;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = topY + (g / 4) * spanY;\n    ctx.beginPath();\n    ctx.moveTo(fToX(0), gy);\n    ctx.lineTo(fToX(5.0), gy);\n    ctx.stroke();\n  }\n\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (var m = 0; m <= 5; m++) {\n    var mx = fToX(m);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(mx, topY);\n    ctx.lineTo(mx, baseY);\n    ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(m + '.0 MHz', mx, 210);\n  }\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  ctx.moveTo(fToX(0), baseY);\n  for (var i = 0; i <= 180; i++) {\n    var f = (i / 180) * 5.0;\n    var amp = 0;\n    if (f <= lumaBw) {\n      var roll = (f > lumaBw - 0.35) ? Math.cos(((f - (lumaBw - 0.35)) / 0.35) * Math.PI * 0.5) : 1.0;\n      amp = (0.82 - 0.14 * (f / 4.2)) * Math.max(0, roll);\n    }\n    var px = fToX(f);\n    var py = baseY - amp * spanY;\n    ctx.lineTo(px, py);\n  }\n  ctx.lineTo(fToX(5.0), baseY);\n  ctx.closePath();\n  ctx.fill();\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('亮度信号 Luminance (Y)', fToX(lumaBw * 0.48), 72);\n\n  if (hasChroma) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    ctx.moveTo(fToX(3.0), baseY);\n    for (var j = 0; j <= 80; j++) {\n      var fc = 3.0 + (j / 80) * 1.16;\n      var diff = (fc - 3.58) / 0.22;\n      var camp = 0.62 * Math.exp(-diff * diff);\n      ctx.lineTo(fToX(fc), baseY - camp * spanY);\n    }\n    ctx.lineTo(fToX(4.16), baseY);\n    ctx.closePath();\n    ctx.fill();\n    ctx.stroke();\n\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText('色度 3.58 MHz', fToX(3.58), 86);\n  }\n\n  if (hasSound) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.30)';\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    ctx.moveTo(fToX(4.2), baseY);\n    for (var k = 0; k <= 60; k++) {\n      var fa = 4.2 + (k / 60) * 0.6;\n      var adiff = (fa - 4.5) / 0.11;\n      var aamp = 0.72 * Math.exp(-adiff * adiff);\n      ctx.lineTo(fToX(fa), baseY - aamp * spanY);\n    }\n    ctx.lineTo(fToX(4.8), baseY);\n    ctx.closePath();\n    ctx.fill();\n    ctx.stroke();\n\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText('伴音 4.50 MHz', fToX(4.5), 72);\n  }\n\n  var overlap = hasChroma && lumaBw > 3.22;\n  if (overlap) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.25)';\n    ctx.fillRect(fToX(3.2), topY, fToX(lumaBw) - fToX(3.2), spanY);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('警告：亮度高频越界侵入 3.58 MHz -> 产生彩虹串色伪影!', 360, 26);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('频谱各占其道：老黑白电视只解码左侧亮度信号即可正常收看', 360, 26);\n  }\n\n  lab.setReadout(\n    '亮度带宽=' + lumaBw.toFixed(1) + 'MHz' +\n    (hasChroma ? ' | 色度=3.58MHz' : ' | 纯黑白信号') +\n    (hasSound ? ' | 伴音=4.50MHz' : '') +\n    (overlap ? ' | 状态: 存在频谱串扰!' : ' | 状态: 频分复用无串扰')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "行与列的本质不同：525 行（有效 480–486 行）中的每一行确实对应 CCD 的一行物理势阱；但经过 3.2 MHz 模拟滤波后，CCD 物理列数已经被完全抹平，数字图像的列数只由采集卡采样率决定。",
        "不要盲目迷信采集卡高采样率：53.2 微秒有效行除以 100 纳秒上升时间，决定了模拟通道最多只有约 500 多个独立水平分辨单元；把采集卡从 512 调到 720 不会凭空变出更高清的物理细节。",
        "谨防宽高比（Aspect Ratio）失真：科学 CCD 常为 1:1，标准电视是 4:3，采集卡默认按采样数（如 640×480 或 720×480）存像素——在没有做像素宽高比（PAR）校正的情况下直接显示，圆形目标必然被拉扁或挤瘦。",
        "同步脉冲“比黑更黑”：在写视频触发或灰度映射代码时，记住有效图像电压在黑色基准以上，负向区间留给了垂直（1.3 ms）与水平（10.2 μs）同步脉冲。",
        "制式与频谱兼容：NTSC 是 30 帧 / 525 行（色度 3.58 MHz、伴音 4.5 MHz），欧洲 PAL/SECAM 是 25 帧 / 625 行（约 576 有效行）；彩色信号靠在亮度上叠加高频色度副载波实现向后兼容。"
      ]
    }
  ]
});
