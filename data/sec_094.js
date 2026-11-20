window.__BOOK_REGISTER_SECTION__("sec_094", {
  "title": "极坐标的第一大麻烦：弧度制与角度制 (Nuisance 1: Radians vs. Degrees)",
  "intuition": "人类大脑习惯直观的“角度制”(-180° ~ 180°)，而计算机三角函数只认“弧度制”(-π ~ π)；在程序开头定义 PI 常量并用 PI/2 这类分数表达相移，是兼顾机器运算与代码可读性的关键。",
  "blocks": [
    {
      "type": "concept",
      "heading": "两个世界的度量衡：-180°~180° 与 -π~π",
      "paragraphs": [
        "在离散傅里叶变换（DFT）的极坐标表示中，信号的相位既可以用**角度（Degrees）**表示，也可以用**弧度（Radians）**表示。用角度表示时，相位信号中的所有数值都落在 `-180` 到 `180` 之间，非常符合人类的直觉——看到 `90°` 你立刻知道是四分之一周期。",
        "然而，一旦进入计算机编程的世界，情况就变了。绝大多数编程语言的标准数学库（如 `cos`、`sin`、`atan` 反正切等三角函数）**强制要求输入和输出必须使用弧度**。用弧度表示时，相位值落在 `-π` 到 `π` 之间，也就是大约 `-3.141592` 到 `3.141592`。",
        "这正是第一个“麻烦”的根源：在 DSP（数字信号处理）工程中，角度和弧度都被广泛使用——图表汇报、人机界面和工程直觉偏爱角度，而底层公式推导和代码执行全靠弧度。如果你在写代码时不小心混淆了两者，三角函数就会悄悄给出完全错误的波形和相位。"
      ],
      "formula": {
        "expr": "φ_rad = φ_deg × (π / 180)",
        "explain": "φ_rad 为计算机三角函数所需的弧度值（范围 -π 到 π）；φ_deg 为人类直观理解的角度值（范围 -180° 到 180°）；π ≈ 3.14159265 是连接两个世界的换算桥梁。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：角度与弧度换算及“单位混淆”灾难现场",
      "instruction": "拖动“目标相移”滑块观察单位圆向量与余弦波形的平移；然后打开“模拟常见 Bug”开关，看看把角度值直接喂给 sin/cos 函数会发生什么。",
      "controls": [
        {
          "type": "slider",
          "id": "deg",
          "label": "目标相移 (Degrees)",
          "min": -180,
          "max": 180,
          "step": 5,
          "value": 90,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "bugMode",
          "label": "模拟常见 Bug：直接把角度数值当作弧度传入",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction draw() {\n  var deg = lab.values.deg;\n  var bug = lab.values.bugMode;\n  var rad = deg * Math.PI / 180;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 245; gx <= W - 20; gx += 45) {\n    ctx.beginPath(); ctx.moveTo(gx, 25); ctx.lineTo(gx, H - 25); ctx.stroke();\n  }\n  for (var gy = 30; gy <= H - 30; gy += 45) {\n    ctx.beginPath(); ctx.moveTo(245, gy); ctx.lineTo(W - 20, gy); ctx.stroke();\n  }\n\n  var cx = 115, cy = H / 2, r = 72;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(cx - r - 10, cy); ctx.lineTo(cx + r + 10, cy);\n  ctx.moveTo(cx, cy - r - 10); ctx.lineTo(cx, cy + r + 10);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('0° (0)', cx + r + 24, cy + 4);\n  ctx.fillText('90° (PI/2)', cx, cy - r - 12);\n  ctx.fillText('-90° (-PI/2)', cx, cy + r + 18);\n  ctx.fillText('±180° (±PI)', cx - r - 4, cy - 10);\n\n  var tx = cx + r * Math.cos(rad);\n  var ty = cy - r * Math.sin(rad);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill();\n\n  var wrappedBugRad = 0;\n  if (bug) {\n    wrappedBugRad = Math.atan2(Math.sin(deg), Math.cos(deg));\n    var bx = cx + r * Math.cos(deg);\n    var by = cy - r * Math.sin(deg);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bx, by); ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(bx, by, 5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  var x0 = 245, x1 = W - 20, wLen = x1 - x0;\n  var wy = H / 2, amp = 70;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(x0, wy); ctx.lineTo(x1, wy); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= wLen; i += 2) {\n    var t = (i / wLen) * Math.PI * 4;\n    var y = wy - amp * Math.cos(t);\n    if (i === 0) ctx.moveTo(x0 + i, y); else ctx.lineTo(x0 + i, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= wLen; i += 2) {\n    var t = (i / wLen) * Math.PI * 4;\n    var y = wy - amp * Math.cos(t + rad);\n    if (i === 0) ctx.moveTo(x0 + i, y); else ctx.lineTo(x0 + i, y);\n  }\n  ctx.stroke();\n\n  if (bug) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i <= wLen; i += 2) {\n      var t = (i / wLen) * Math.PI * 4;\n      var y = wy - amp * Math.cos(t + deg);\n      if (i === 0) ctx.moveTo(x0 + i, y); else ctx.lineTo(x0 + i, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.fillText('虚线: 0°参考', x0, 20);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('蓝线: 正确弧度转换', x0 + 95, 20);\n  if (bug) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('粉线: 误将 ' + deg + ' 直接作弧度', x0 + 235, 20);\n  }\n\n  var piRatio = deg / 180;\n  var piStr = (piRatio === 0) ? '0' : (piRatio === 1 ? 'PI' : (piRatio === -1 ? '-PI' : (piRatio === 0.5 ? 'PI/2' : (piRatio === -0.5 ? '-PI/2' : piRatio.toFixed(2) + '*PI'))));\n  var msg = '目标: ' + deg + '° | 弧度: ' + rad.toFixed(6) + ' rad (' + piStr + ')';\n  if (bug) {\n    var bugDeg = (wrappedBugRad * 180 / Math.PI).toFixed(1);\n    msg += ' | [Bug] ' + deg + ' rad 等效于 ' + bugDeg + '°';\n  }\n  lab.setReadout(msg);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "用 PI 常量告别反人类的冗长小数",
      "paragraphs": [
        "即便你牢记了必须使用弧度，直接跟这些长长的小数打交道依然令人烦躁，读起代码来更是云里雾里。举个书中的例子：如果你想给信号引入一个 **90 度** 的相移，用弧度直接写就是给相位加上 `1.570796`。偶尔敲一次倒不会要命，但代码里到处都是 `1.570796`、`0.785398` 或 `3.141592` 时，不仅输入枯燥，过两周你自己再读代码时也得掏出计算器才能认出这是多少度。",
        "原书给出了最优雅、最标准的工程解法：在程序的开头定义好常量 **`PI = 3.141592`**（如表 8-3 第 170 行的 `PI = 3.14159265`，在现代语言如 C/Python/JS 中则对应 `M_PI`、`math.pi` 或 `Math.PI`）。",
        "一旦定义了 `PI`，90° 的相移就可以直接写成 **`PI/2`**，180° 写成 **`PI`**，45° 写成 **`PI/4`**。这样一来，代码既完全满足计算机底层三角函数的弧度要求，又保留了人类一眼看穿几何意义的清晰度。"
      ],
      "formula": {
        "expr": "PHASE[K] = PHASE[K] + PI / 2",
        "explain": "在程序开头定义 PI = 3.14159265 后，用 PI / 2 代替硬编码的魔法数字 1.570796，清晰地表达“将第 K 个频点的相位旋转 90°（π/2 弧度）”。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：相移抵消听觉验证——当 180° 错写成 180 弧度",
      "instruction": "保持默认 180°（PI 弧度），点击播放测试音：两列反相声波完全抵消归于静音！随后开启“模拟代码写错”开关，听听直接加 180 弧度会怎样破坏反相抵消。",
      "controls": [
        {
          "type": "slider",
          "id": "shiftDeg",
          "label": "预设相移 (Degrees)",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": 180,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "wrongUnit",
          "label": "模拟代码写错：直接把该数值当作弧度",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放叠加测试音 (220 Hz)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar ac = null, osc = null, gainNode = null, isPlaying = false, lastT = 0;\n\nfunction getEffectiveRad() {\n  var deg = lab.values.shiftDeg;\n  return lab.values.wrongUnit ? deg : (deg * Math.PI / 180);\n}\n\nfunction getCombinedAmp(phi) {\n  return Math.abs(Math.cos(phi / 2));\n}\n\nfunction updateAudio() {\n  var wantPlay = !!lab.values.play;\n  var amp = getCombinedAmp(getEffectiveRad());\n  if (wantPlay) {\n    if (!ac) ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!isPlaying) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(220, ac.currentTime);\n      gainNode.gain.setValueAtTime(0.0001, ac.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.start();\n      isPlaying = true;\n    }\n    gainNode.gain.setTargetAtTime(amp * 0.22, ac.currentTime, 0.025);\n  } else if (isPlaying && gainNode && ac) {\n    gainNode.gain.setTargetAtTime(0.0001, ac.currentTime, 0.02);\n    var oldOsc = osc;\n    setTimeout(function() {\n      try { oldOsc.stop(); oldOsc.disconnect(); } catch (e) {}\n    }, 60);\n    osc = null;\n    gainNode = null;\n    isPlaying = false;\n  }\n}\n\nfunction render(timeSec) {\n  var phi = getEffectiveRad();\n  var amp = getCombinedAmp(phi);\n  var deg = lab.values.shiftDeg;\n  var wrong = lab.values.wrongUnit;\n  var phaseAnim = (typeof timeSec === 'number') ? timeSec * 4 : 0;\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var x = 40; x < 500; x += 45) {\n    ctx.beginPath(); ctx.moveTo(x, 25); ctx.lineTo(x, H - 25); ctx.stroke();\n  }\n  for (var y = 40; y < H - 20; y += 40) {\n    ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(500, y); ctx.stroke();\n  }\n\n  var x0 = 20, x1 = 500, wLen = x1 - x0, cy = H / 2, scale = 70;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(x0, cy); ctx.lineTo(x1, cy); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i <= wLen; i += 2) {\n    var t = (i / wLen) * Math.PI * 4 - phaseAnim;\n    var py = cy - 0.5 * scale * Math.cos(t);\n    if (i === 0) ctx.moveTo(x0 + i, py); else ctx.lineTo(x0 + i, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= wLen; i += 2) {\n    var t = (i / wLen) * Math.PI * 4 - phaseAnim;\n    var py = cy - 0.5 * scale * Math.cos(t + phi);\n    if (i === 0) ctx.moveTo(x0 + i, py); else ctx.lineTo(x0 + i, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = wrong ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  for (var i = 0; i <= wLen; i += 2) {\n    var t = (i / wLen) * Math.PI * 4 - phaseAnim;\n    var sum = 0.5 * Math.cos(t) + 0.5 * Math.cos(t + phi);\n    var py = cy - scale * sum;\n    if (i === 0) ctx.moveTo(x0 + i, py); else ctx.lineTo(x0 + i, py);\n  }\n  ctx.stroke();\n\n  var mx = 540, mw = 145, mh = 150, my = 45;\n  ctx.fillStyle = 'rgba(255,255,255,0.05)';\n  ctx.fillRect(mx, my, mw, mh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(mx, my, mw, mh);\n\n  var barH = amp * (mh - 30);\n  ctx.fillStyle = wrong ? '#ec4899' : '#10b981';\n  ctx.fillRect(mx + 42, my + mh - 15 - barH, 60, barH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('合成响度 / 幅度', mx + mw / 2, my - 10);\n  ctx.font = 'bold 14px monospace';\n  ctx.fillText((amp * 100).toFixed(1) + '%', mx + mw / 2, my + mh + 20);\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.fillText('白线: 原波', 22, 20);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('黄虚线: 相移波', 102, 20);\n  ctx.fillStyle = wrong ? '#ec4899' : '#10b981';\n  ctx.fillText(wrong ? '粉线: 误作弧度叠加' : '绿线: 正确弧度叠加', 215, 20);\n\n  var wrappedRad = Math.atan2(Math.sin(phi), Math.cos(phi));\n  var wrappedDeg = wrappedRad * 180 / Math.PI;\n  var status = wrong\n    ? '错误模式: 传入 ' + deg + ' rad (等效 ' + wrappedDeg.toFixed(1) + '°) | 合成幅度: ' + (amp * 100).toFixed(1) + '%'\n    : '正确模式: ' + deg + '° = ' + phi.toFixed(6) + ' rad | 合成幅度: ' + (amp * 100).toFixed(1) + '%';\n  lab.setReadout(status);\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  render(lastT);\n});\nlab.onLoop(function(dt, timeSec) {\n  lastT = timeSec;\n  render(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "要点 1：牢记两个区间的对应关系——角度制是 [-180°, 180°]，弧度制是 [-π, π]（约 -3.141592 ~ 3.141592），两者在 DSP 绘图标注与底层代码中经常同时出现，必须熟练切换。",
        "要点 2：绝对不要把角度值直接传给 sin / cos / atan 等编程语言三角函数；在绘制图表或给用户展示前，再把内部弧度乘以 180 / PI 转为角度。",
        "要点 3：永远在程序开头定义常量 PI（或直接调用语言自带的 Math.PI / math.pi），用 PI/2、PI/4 代替 1.570796、0.785398 这类难以维护的“魔法小数”。"
      ]
    }
  ]
});
