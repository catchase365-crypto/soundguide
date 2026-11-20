window.__BOOK_REGISTER_SECTION__("sec_238", {
  "title": "连续域到离散域的转换：双线性变换 (Continuous to Discrete Conversion)",
  "intuition": "通过双线性变换这种“保角卷曲”代数魔法，把无限延伸的连续 s 平面稳定左半区，严丝合缝地折叠进离散 z 平面半径为 1 的单位圆内部，从而直接算出数字滤波器的递归系数。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从 s 平面到 z 平面：为什么需要保角映射？",
      "paragraphs": [
        "在模拟滤波器设计（如巴特沃斯、切比雪夫滤波器）中，我们习惯在连续时间的 **s 平面** 中布置极点：左半平面（实部 `σ < 0`）代表系统稳定，虚轴 `jω` 代表从 `0` 到无穷大的连续频率。",
        "但数字信号处理芯片运行在离散时间采样下，系统由 **z 平面** 描述：离散频率沿着半径为 1 的**单位圆**旋转（角度 `0` 到 `π` 对应从直流到奈奎斯特频率），稳定区则是**单位圆内部**（`|z| < 1`）。",
        "为了让已经算好的模拟极点直接“搬家”到数字域，最常用的方法就是**双线性变换（Bilinear Transform）**。它是一种**保角映射（Conformal Mapping）**技术，把复平面做代数扭曲变形：将 s 平面上笔直的垂直线弯曲成 z 平面上的圆，把整条无限长的虚轴恰好压进单位圆周上，从而保证原本稳定的模拟滤波器转换后依然绝对稳定。"
      ],
      "formula": {
        "expr": "s  →  2(1 - z⁻¹) / [ T(1 + z⁻¹) ]",
        "explain": "Eq. 33-10 双线性变换代换式：将连续传递函数 H(s) 中的每一个 s 替换为右侧关于 z⁻¹ 的分式即可得到离散传递函数 H(z)。其中比例系数通常取 T = 2·tan(1/2) ≈ 1.093，用于预畸变校准——确保 s 域的归一化截止频率 1 rad/s 精准映射到 z 域的 1 rad/sample。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：双线性变换的几何直觉——垂直线如何“卷曲”成圆",
      "instruction": "拖动实部 σ、虚部 ω 和系数 T 滑块，观察左侧 s 平面中的极点与垂直线，如何通过 Eq. 33-10 保角映射到右侧 z 平面的圆与极点。",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "极点实部 σ (阻尼/稳定性)",
          "min": -1.5,
          "max": 0.3,
          "step": 0.05,
          "value": -0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "极点虚部 ω (极点频率)",
          "min": 0.1,
          "max": 2.5,
          "step": 0.05,
          "value": 0.71,
          "unit": " rad/s"
        },
        {
          "type": "slider",
          "id": "tVal",
          "label": "比例系数 T",
          "min": 0.5,
          "max": 2,
          "step": 0.01,
          "value": 1.09,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showGrid",
          "label": "显示垂直线→圆映射轨迹",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction mapS2Z(sig, omg, T) {\n  var a = 2 / T;\n  var den = (a - sig) * (a - sig) + omg * omg;\n  if (den < 1e-9) den = 1e-9;\n  var zx = (a * a - sig * sig - omg * omg) / den;\n  var zy = (2 * a * omg) / den;\n  return { x: zx, y: zy };\n}\n\nfunction draw() {\n  var sig = lab.values.sigma;\n  var omg = lab.values.omega;\n  var T = lab.values.tVal;\n  var showGrid = lab.values.showGrid;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var cx1 = 175, cy1 = 124, sc1 = 52;\n  var cx2 = 545, cy2 = 124, sc2 = 76;\n\n  ctx.fillStyle = sig <= 0 ? 'rgba(16,185,129,0.07)' : 'rgba(236,72,153,0.07)';\n  ctx.fillRect(20, 22, cx1 - 20, H - 34);\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.arc(cx2, cy2, sc2, 0, Math.PI * 2);\n  ctx.fillStyle = 'rgba(16,185,129,0.08)';\n  ctx.fill();\n  ctx.restore();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var i;\n  for (i = -2; i <= 2; i++) {\n    ctx.beginPath();\n    ctx.moveTo(20, cy1 + i * sc1 * 0.5);\n    ctx.lineTo(325, cy1 + i * sc1 * 0.5);\n    ctx.stroke();\n  }\n  for (i = -3; i <= 2; i++) {\n    ctx.beginPath();\n    ctx.moveTo(cx1 + i * sc1 * 0.5, 22);\n    ctx.lineTo(cx1 + i * sc1 * 0.5, H - 12);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(20, cy1); ctx.lineTo(325, cy1);\n  ctx.moveTo(cx1, 22); ctx.lineTo(cx1, H - 12);\n  ctx.stroke();\n\n  ctx.beginPath();\n  ctx.moveTo(410, cy2); ctx.lineTo(680, cy2);\n  ctx.moveTo(cx2, 22); ctx.lineTo(cx2, H - 12);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx2, cy2, sc2, 0, Math.PI * 2);\n  ctx.stroke();\n\n  if (showGrid) {\n    var refs = [-1.0, -0.5];\n    for (var r = 0; r < refs.length; r++) {\n      var rs = refs[r];\n      ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n      ctx.setLineDash([4, 4]);\n      ctx.beginPath();\n      ctx.moveTo(cx1 + rs * sc1, 22);\n      ctx.lineTo(cx1 + rs * sc1, H - 12);\n      ctx.stroke();\n\n      ctx.beginPath();\n      for (var t = -15; t <= 15; t += 0.15) {\n        var pt = mapS2Z(rs, t, T);\n        var px = cx2 + pt.x * sc2;\n        var py = cy2 - pt.y * sc2;\n        if (t === -15) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n      }\n      ctx.closePath();\n      ctx.stroke();\n      ctx.setLineDash([]);\n    }\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  ctx.moveTo(cx1 + sig * sc1, 24);\n  ctx.lineTo(cx1 + sig * sc1, H - 14);\n  ctx.stroke();\n\n  ctx.beginPath();\n  for (var w = -25; w <= 25; w += 0.12) {\n    var pz = mapS2Z(sig, w, T);\n    var x2 = cx2 + pz.x * sc2;\n    var y2 = cy2 - pz.y * sc2;\n    if (w === -25) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);\n  }\n  ctx.closePath();\n  ctx.stroke();\n\n  var zPole = mapS2Z(sig, omg, T);\n  var zMag = Math.sqrt(zPole.x * zPole.x + zPole.y * zPole.y);\n  var zAng = Math.atan2(zPole.y, zPole.x);\n\n  function drawX(x, y, color) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);\n    ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);\n    ctx.stroke();\n  }\n\n  var pColor = zMag < 1.0 ? '#10b981' : (Math.abs(zMag - 1.0) < 0.01 ? '#f59e0b' : '#ec4899');\n  drawX(cx1 + sig * sc1, cy1 - omg * sc1, pColor);\n  drawX(cx1 + sig * sc1, cy1 + omg * sc1, pColor);\n\n  drawX(cx2 + zPole.x * sc2, cy2 - zPole.y * sc2, pColor);\n  drawX(cx2 + zPole.x * sc2, cy2 + zPole.y * sc2, pColor);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(338, 124); ctx.lineTo(382, 124);\n  ctx.lineTo(375, 119); ctx.moveTo(382, 124); ctx.lineTo(375, 129);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('s 平面 (连续域)', cx1, 15);\n  ctx.fillText('z 平面 (离散域)', cx2, 15);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('Eq. 33-10', 360, 112);\n  ctx.fillText('|z|=1', cx2 + sc2 + 18, cy2 - 8);\n\n  var status = zMag < 0.999 ? '稳定 (位于单位圆内)' : (zMag <= 1.001 ? '临界振荡 (位于单位圆上)' : '不稳定发散 (冲出单位圆!)');\n  lab.setReadout('s极点: ' + sig.toFixed(2) + ' ± j' + omg.toFixed(2) + '   |   z极点: ' + zPole.x.toFixed(3) + ' ± j' + zPole.y.toFixed(3) + '   |   |z| = ' + zMag.toFixed(3) + ' (' + status + ')');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "两极点系统的代数化简与 Eq. 33-11 递归系数",
      "paragraphs": [
        "假设我们在 s 平面上有一对共轭极点 `p₁ = σ + jω` 和 `p₂ = σ - jω`，对应的连续传递函数为 `H(s) = 1 / [(s - p₁)(s - p₂)]`。按照 Eq. 33-10，把分子分母里的每一个 `s` 都换成 `2(1 - z⁻¹) / [T(1 + z⁻¹)]`，会得到一个层层嵌套的繁琐分式。",
        "经过一番硬核的代数通分整理，可以把 z⁻¹ 的幂次重新排列成标准的二阶递归滤波器形式（Eq. 33-3），直接读出 5 个离散递归系数 `a₀, a₁, a₂, b₁, b₂`。",
        "在原书配套程序 **Figure 33-8（第 1200–1290 行）** 中，程序正是直接用这套公式把保存在 `RP`（实部 `σ`）和 `IP`（虚部 `ω`）中的极点坐标，转换成中间变量 `X0, X1, X2, Y1, Y2`——它们代表一个**截止频率归一化为 1 的低通滤波器单级系数**，供后续低通转低通或低通转高通变换使用。"
      ],
      "formula": {
        "expr": "a₀ = T²/D,  a₁ = 2T²/D,  a₂ = T²/D,  b₁ = (8 - 2MT²)/D,  b₂ = (-4 - 4σT - MT²)/D",
        "explain": "Eq. 33-11 双极点双线性变换系数。其中辅助变量 M = σ² + ω²，T = 2·tan(1/2)，D = 4 - 4σT + M·T²（这三个变量没有独立物理意义，纯粹为了把公式写短）。对应离散差分方程：y[n] = a₀x[n] + a₁x[n-1] + a₂x[n-2] + b₁y[n-1] + b₂y[n-2]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：Eq. 33-11 递归系数响应与实时滤波听感",
      "instruction": "调节 s 平面极点实部 σ（控制共振尖峰 Q 值）和虚部 ω（控制截止频率），点击播放按钮即可对比原始锯齿波与 Eq. 33-11 离散滤波后的声音变化。",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "极点实部 σ (阻尼/共振峰)",
          "min": -1.5,
          "max": -0.05,
          "step": 0.05,
          "value": -0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "极点虚部 ω (带宽/截止频)",
          "min": 0.2,
          "max": 2.2,
          "step": 0.05,
          "value": 0.71,
          "unit": " rad/s"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "直通原声 (对比未滤波信号)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音对比",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar srcNode = null;\nvar gainNode = null;\nvar lastAudioKey = '';\n\nfunction calcCoeffs(sig, omg) {\n  var T = 2 * Math.tan(0.5);\n  var M = sig * sig + omg * omg;\n  var D = 4 - 4 * sig * T + M * T * T;\n  return {\n    a0: (T * T) / D,\n    a1: (2 * T * T) / D,\n    a2: (T * T) / D,\n    b1: (8 - 2 * M * T * T) / D,\n    b2: (-4 - 4 * sig * T - M * T * T) / D\n  };\n}\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    try { srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n  lastAudioKey = '';\n}\n\nfunction updateAudio(c) {\n  if (!lab.values.play) {\n    stopAudio();\n    return;\n  }\n  var bp = lab.values.bypass;\n  var key = lab.values.sigma.toFixed(2) + '_' + lab.values.omega.toFixed(2) + '_' + (bp ? '1' : '0');\n  if (key === lastAudioKey && srcNode) return;\n  lastAudioKey = key;\n\n  var actx = lab.getAudioContext();\n  if (actx.state === 'suspended') {\n    actx.resume();\n  }\n  var sr = actx.sampleRate;\n  var len = sr;\n  var f0 = 220;\n  var maxHarm = Math.min(45, Math.floor(0.45 * sr / f0));\n  var raw = new Float32Array(len);\n  var i, k;\n  for (i = 0; i < len; i++) {\n    var t = i / len;\n    var val = 0;\n    for (k = 1; k <= maxHarm; k++) {\n      val += Math.sin(2 * Math.PI * f0 * k * t) / k;\n    }\n    raw[i] = val * 0.45;\n  }\n\n  var buf = actx.createBuffer(1, len, sr);\n  var out = buf.getChannelData(0);\n\n  if (bp) {\n    for (i = 0; i < len; i++) out[i] = raw[i] * 0.45;\n  } else {\n    var x1 = 0, x2 = 0, y1 = 0, y2 = 0;\n    var pass, idx;\n    for (pass = 0; pass < 2; pass++) {\n      for (i = 0; i < len; i++) {\n        var x0 = raw[i];\n        var y0 = c.a0 * x0 + c.a1 * x1 + c.a2 * x2 + c.b1 * y1 + c.b2 * y2;\n        x2 = x1; x1 = x0;\n        y2 = y1; y1 = y0;\n        if (pass === 1) {\n          var scaled = y0 * 0.4;\n          if (scaled > 0.95) scaled = 0.95;\n          if (scaled < -0.95) scaled = -0.95;\n          out[i] = scaled;\n        }\n      }\n    }\n  }\n\n  if (!gainNode) {\n    gainNode = actx.createGain();\n    gainNode.gain.value = 0.55;\n    gainNode.connect(actx.destination);\n  }\n  if (srcNode) {\n    try { srcNode.stop(); } catch (e) {}\n    try { srcNode.disconnect(); } catch (e) {}\n  }\n  srcNode = actx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(gainNode);\n  srcNode.start(0);\n}\n\nfunction draw() {\n  var sig = lab.values.sigma;\n  var omg = lab.values.omega;\n  var bp = lab.values.bypass;\n  var c = calcCoeffs(sig, omg);\n\n  updateAudio(c);\n  ctx.clearRect(0, 0, W, H);\n\n  var xL = 42, yL = 26, wL = 295, hL = 180;\n  var xR = 395, yR = 26, wR = 300, hR = 180;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var g;\n  for (g = 0; g <= 4; g++) {\n    var gy = yL + (hL * g) / 4;\n    ctx.beginPath(); ctx.moveTo(xL, gy); ctx.lineTo(xL + wL, gy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xR, gy); ctx.lineTo(xR + wR, gy); ctx.stroke();\n  }\n  for (g = 0; g <= 4; g++) {\n    var gx = xL + (wL * g) / 4;\n    ctx.beginPath(); ctx.moveTo(gx, yL); ctx.lineTo(gx, yL + hL); ctx.stroke();\n  }\n\n  var zeroDbY = yL + hL * (18 / 48);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(xL, zeroDbY); ctx.lineTo(xL + wL, zeroDbY); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = bp ? '#64748b' : '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var i, peakDb = -99, peakW = 0;\n  for (i = 0; i <= 200; i++) {\n    var w = (i / 200) * Math.PI;\n    var c1 = Math.cos(w), s1 = Math.sin(w);\n    var c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);\n    var nr = c.a0 + c.a1 * c1 + c.a2 * c2;\n    var ni = -c.a1 * s1 - c.a2 * s2;\n    var dr = 1 - c.b1 * c1 - c.b2 * c2;\n    var di = c.b1 * s1 + c.b2 * s2;\n    var mag = Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di + 1e-12));\n    var db = 20 * Math.log(mag + 1e-6) / Math.LN10;\n    if (db > peakDb) { peakDb = db; peakW = w; }\n    if (bp) db = 0;\n    var clampedDb = Math.max(-30, Math.min(18, db));\n    var py = yL + hL * (18 - clampedDb) / 48;\n    var px = xL + (wL * i) / 200;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var N = 80;\n  var xBuf = [];\n  var yBuf = [];\n  var x1 = 0, x2 = 0, y1 = 0, y2 = 0;\n  for (var pass = 0; pass < 3; pass++) {\n    for (i = 0; i < N; i++) {\n      var ph = (i % 40) / 40;\n      var xin = 1.0 - 2.0 * ph;\n      var yout = c.a0 * xin + c.a1 * x1 + c.a2 * x2 + c.b1 * y1 + c.b2 * y2;\n      x2 = x1; x1 = xin;\n      y2 = y1; y1 = yout;\n      if (pass === 2) {\n        xBuf.push(xin);\n        yBuf.push(bp ? xin : yout);\n      }\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.lineWidth = 1.4;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (i = 0; i < N; i++) {\n    var px1 = xR + (wR * i) / (N - 1);\n    var py1 = yR + hR * 0.5 - xBuf[i] * (hR * 0.34);\n    if (i === 0) ctx.moveTo(px1, py1); else ctx.lineTo(px1, py1);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (i = 0; i < N; i++) {\n    var px2 = xR + (wR * i) / (N - 1);\n    var valY = Math.max(-1.4, Math.min(1.4, yBuf[i]));\n    var py2 = yR + hR * 0.5 - valY * (hR * 0.34);\n    if (i === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('离散频响 |H(e^jΩ)| (dB)', xL + wL / 2, 16);\n  ctx.fillText('时域锯齿波滤波对比 (橙虚线=原波, 蓝=输出)', xR + wR / 2, 16);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText('+18dB', xL - 4, yL + 6);\n  ctx.fillText('0dB', xL - 4, zeroDbY + 4);\n  ctx.fillText('-30dB', xL - 4, yL + hL);\n  ctx.textAlign = 'center';\n  ctx.fillText('0', xL, yL + hL + 13);\n  ctx.fillText('π/2', xL + wL / 2, yL + hL + 13);\n  ctx.fillText('π (Nyquist)', xL + wL - 10, yL + hL + 13);\n\n  lab.setReadout('a0=' + c.a0.toFixed(4) + '  a1=' + c.a1.toFixed(4) + '  a2=' + c.a2.toFixed(4) + '  |  b1=' + c.b1.toFixed(4) + '  b2=' + c.b2.toFixed(4) + '  |  峰值增益: ' + peakDb.toFixed(1) + ' dB');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "稳定性铁律：双线性变换保证 s 平面左半区（σ < 0）100% 映射到 z 平面单位圆内部（|z| < 1），不会像某些时域差分近似法那样意外产生不稳定极点。",
        "为什么 T = 2·tan(1/2) ≈ 1.093？由于频率轴非线性压缩（Frequency Warping），若随便取 T 会导致截止频率漂移；取 T = 2·tan(1/2) 恰好将 s 域的归一化截止频率 1 锁定在 z 域的 1 rad/sample。",
        "注意符号约定：Eq. 33-11 算出的 b₁, b₂ 对应正号反馈差分方程 y[n] = a₀x[n] + a₁x[n-1] + a₂x[n-2] + b₁y[n-1] + b₂y[n-2]；如果套用某些库（如 MATLAB/SciPy）的负号标准形式，必须对 b₁, b₂ 取反。",
        "Figure 33-8 的第 1200–1290 行只完成了从 s 平面到“截止频率为 1 的离散低通原型”的转换（输出 X0~X2, Y1~Y2），实际任意截止频率的低通或高通滤波器还需接续下一节的频带变换（第 1310–1410 行）。"
      ]
    }
  ]
});
