window.__BOOK_REGISTER_SECTION__("sec_155", {
  "title": "设计切比雪夫滤波器 (Designing the Filter)",
  "intuition": "只需选定高/低通类型、截止频率、通带纹波与偶数极点数，即可通过查表或子程序直接获得递归系数；极点越多、截止越靠近频带两端，滚降就越陡峭。",
  "blocks": [
    {
      "type": "concept",
      "heading": "设计切比雪夫滤波器的四大参数与“极点”的两种理解",
      "paragraphs": [
        "要设计一个切比雪夫（Chebyshev）数字滤波器，你只需要确定**四个核心参数**：**(1) 高通或低通响应**、**(2) 截止频率**、**(3) 通带内的纹波百分比（通常推荐 0.5%）**，以及 **(4) 极点数（number of poles）**。在本章采用的设计方法中，极点数必须为**偶数**。",
        "到底什么是**极点（pole）**？书里给出了两种截然不同的回答，你可以按需选用：",
        "**回答 1（数学与物理本质）**：拉普拉斯变换与 z 变换能够把系统的冲激响应拆解为正弦波与衰减指数的组合，表现为一个复多项式除以另一个复多项式（系统传递函数）。其中分子的根叫**零点（zeros）**，分母的根叫**极点（poles）**。由于极点和零点都是复数，它们在复平面上各自拥有确定的“位置”。越复杂的系统包含越多极点与零点。设计递归滤波器时，正是先在复平面上选定零极点位置，再反推出递归系数——例如巴特沃斯滤波器的极点分布在复平面的一个**圆**上，而切比雪夫滤波器的极点则分布在**椭圆**上。",
        "**回答 2（工程师的实战直觉）**：极点就是装满“魔法粉末”的小罐子——**滤波器里的极点越多，滤波效果就越强！**作者幽默地指出，实际上大多数科学家、工程师和程序员在日常设计时，脑子里想的都是回答 2 而不是回答 1。"
      ],
      "formula": {
        "expr": "H(z) = (c0 + c1*z^-1 + ... + cN*z^-N) / (1 - b1*z^-1 - ... - bN*z^-N)",
        "explain": "z 变换域的递归系统传递函数：分子的根为零点（zeros），负责抵消阻带频率；分母的根为极点（poles），决定通带边缘的滚降陡度。极点必须位于复平面单位圆内部，系统才稳定。"
      }
    },
    {
      "type": "concept",
      "heading": "频响特性：为什么截止频率靠近 0 或 0.5 时特别陡峭？",
      "paragraphs": [
        "在 0.5% 通带纹波的切比雪夫滤波器中，**截止频率 $f_c$** 定义在幅度响应穿过 `0.707`（即 `-3 dB`）的位置。由于允许通带内存在极小的 `0.5%` 起伏，它的过渡带滚降远快于平坦的巴特沃斯滤波器。",
        "观察原书图 20-2 会发现一个非常反直觉却极其有用的数字滤波规律：**截止频率越靠近 `0` 或 `0.5`（奈奎斯特频率），滚降就越陡峭**；而当截止频率位于频带正中央（`f_c ≈ 0.25`）时，滚降反而相对平缓。",
        "举个经典例子：**在 `f_c = 0.05` 处的 2 极点滤波器，与在 `f_c = 0.25` 处的 4 极点滤波器，具有几乎相同的滚降陡度！** 这对工程实现是一大福音：当截止频率靠近 `0` 或 `0.5` 时，我们可以放心使用**更少的极点**，从而大幅降低递归计算带来的舍入噪声（round-off noise）与数值不稳定风险。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验 1：切比雪夫交互设计台与“边缘锐度 / 极点位置”观察",
      "instruction": "拖动极点数与截止频率滑块，对比绿色实时曲线与灰色虚线（2 极点 f_c=0.05 参考线）的滚降斜率，同时观察右侧复平面单位圆内极点的移动轨迹。",
      "controls": [
        {
          "type": "slider",
          "id": "poles",
          "label": "极点数 (Poles)",
          "min": 2,
          "max": 12,
          "step": 2,
          "value": 4,
          "unit": " 极"
        },
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_c",
          "min": 0.025,
          "max": 0.45,
          "step": 0.025,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "highPass",
          "label": "切换高通模式 (High-Pass)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "对数坐标 (dB)",
          "value": false
        }
      ],
      "jsCode": "function getChebyshevBiquads(N, fc, isHP, ripplePct) {\n  var r = ripplePct / 100;\n  var eps = Math.sqrt(1 / ((1 - r) * (1 - r)) - 1);\n  var mu = Math.asinh(1 / eps) / N;\n  var w3db = Math.cosh(Math.acosh(1 / eps) / N);\n  var effFc = isHP ? (0.5 - fc) : fc;\n  var oc = Math.tan(Math.PI * effFc);\n  var biquads = [];\n  var polePoints = [];\n  for (var k = 0; k < N / 2; k++) {\n    var uk = (2 * k + 1) * Math.PI / (2 * N);\n    var sr = -Math.sinh(mu) * Math.sin(uk) / w3db;\n    var si = Math.cosh(mu) * Math.cos(uk) / w3db;\n    var srw = sr * oc;\n    var siw = si * oc;\n    var den = (1 - srw) * (1 - srw) + siw * siw;\n    var zr = (1 - srw * srw - siw * siw) / den;\n    var zi = (2 * siw) / den;\n    if (isHP) zr = -zr;\n    polePoints.push({ re: zr, im: zi });\n    polePoints.push({ re: zr, im: -zi });\n    var b1 = 2 * zr;\n    var b2 = -(zr * zr + zi * zi);\n    var g = isHP ? (1 + b1 - b2) / 4 : (1 - b1 - b2) / 4;\n    biquads.push({ a0: g, a1: isHP ? -2 * g : 2 * g, a2: g, b1: b1, b2: b2 });\n  }\n  return { biquads: biquads, poles: polePoints };\n}\n\nfunction evalMag(biquads, f) {\n  var w = 2 * Math.PI * f;\n  var c1 = Math.cos(w), s1 = Math.sin(w);\n  var c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);\n  var mag2 = 1;\n  for (var i = 0; i < biquads.length; i++) {\n    var q = biquads[i];\n    var nr = q.a0 + q.a1 * c1 + q.a2 * c2;\n    var ni = -q.a1 * s1 - q.a2 * s2;\n    var dr = 1 - q.b1 * c1 - q.b2 * c2;\n    var di = q.b1 * s1 + q.b2 * s2;\n    mag2 *= (nr * nr + ni * ni) / (dr * dr + di * di + 1e-18);\n  }\n  return Math.sqrt(mag2);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var N = lab.values.poles;\n  var fc = lab.values.fc;\n  var isHP = lab.values.highPass;\n  var isDb = lab.values.dbScale;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var px0 = 48, py0 = 24, pw = 408, ph = 182;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= 5; gx++) {\n    var x = px0 + (gx / 5) * pw;\n    ctx.beginPath(); ctx.moveTo(x, py0); ctx.lineTo(x, py0 + ph); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText((gx * 0.1).toFixed(1), x, py0 + ph + 15);\n  }\n  for (var gy = 0; gy <= 5; gy++) {\n    var y = py0 + (gy / 5) * ph;\n    ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px0 + pw, y); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    var lbl = isDb ? (20 - gy * 24) + 'dB' : (1.25 - gy * 0.25).toFixed(2);\n    ctx.fillText(lbl, px0 - 6, y + 4);\n  }\n\n  function mapY(mag) {\n    if (isDb) {\n      var db = 20 * Math.log10(Math.max(mag, 1e-5));\n      var norm = (db - (-100)) / 120;\n      return py0 + ph * (1 - Math.max(0, Math.min(1, norm)));\n    }\n    return py0 + ph * (1 - Math.max(0, Math.min(1.25, mag)) / 1.25);\n  }\n\n  var y3db = mapY(0.7071);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.beginPath(); ctx.moveTo(px0, y3db); ctx.lineTo(px0 + pw, y3db); ctx.stroke();\n  var xFc = px0 + (fc / 0.5) * pw;\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.beginPath(); ctx.moveTo(xFc, py0); ctx.lineTo(xFc, py0 + ph); ctx.stroke();\n  ctx.restore();\n\n  var refFc = isHP ? 0.45 : 0.05;\n  var refDesign = getChebyshevBiquads(2, refFc, isHP, 0.5);\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = 'rgba(148,163,184,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 200; i++) {\n    var f = (i / 200) * 0.5;\n    var rx = px0 + (i / 200) * pw;\n    var ry = mapY(evalMag(refDesign.biquads, f));\n    if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  var design = getChebyshevBiquads(N, fc, isHP, 0.5);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 240; i++) {\n    var f = (i / 240) * 0.5;\n    var mx = px0 + (i / 240) * pw;\n    var my = mapY(evalMag(design.biquads, f));\n    if (i === 0) ctx.moveTo(mx, my); else ctx.lineTo(mx, my);\n  }\n  ctx.stroke();\n\n  var magAtFc = evalMag(design.biquads, fc);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(xFc, mapY(magAtFc), 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('参考虚线: 2极点 fc=' + refFc.toFixed(2), px0 + 8, py0 + 14);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('-3dB (0.707)', px0 + 8, y3db - 5);\n\n  var cx = 595, cy = 122, R = 74;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(cx - R - 14, cy); ctx.lineTo(cx + R + 14, cy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cx, cy - R - 14); ctx.lineTo(cx, cy + R + 14); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();\n\n  var zx = cx + (isHP ? R : -R);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(zx, cy, 4.5, 0, Math.PI * 2); ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  for (var p = 0; p < design.poles.length; p++) {\n    var pt = design.poles[p];\n    var px = cx + pt.re * R;\n    var py = cy - pt.im * R;\n    ctx.beginPath(); ctx.moveTo(px - 3.5, py - 3.5); ctx.lineTo(px + 3.5, py + 3.5); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(px - 3.5, py + 3.5); ctx.lineTo(px + 3.5, py - 3.5); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('z 平面零极点分布 (|z|=1)', cx, 24);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('粉叉: 极点(Poles)  蓝圈: 零点', cx, H - 14);\n\n  var unstableTable = (fc <= 0.025 && N >= 6);\n  if (unstableTable) {\n    ctx.fillStyle = 'rgba(245,158,11,0.18)';\n    ctx.fillRect(px0 + 95, py0 + 36, 230, 24);\n    ctx.fillStyle = '#fbbf24';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('⚠ 查表直接型在此参数下极易不稳定!', px0 + 210, py0 + 52);\n  }\n\n  var stopF = isHP ? 0.02 : 0.48;\n  var stopDb = 20 * Math.log10(Math.max(evalMag(design.biquads, stopF), 1e-6));\n  lab.setReadout((isHP ? '高通' : '低通') + ' | ' + N + ' 极点 | fc=' + fc.toFixed(3) + ' | 截止点增益=' + magAtFc.toFixed(3) + ' | 远端阻带(' + stopF + ')=' + stopDb.toFixed(1) + ' dB' + (unstableTable ? ' | [Table 20-1/2 警告: Unstable]' : ''));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "不靠 z 变换求系数的两条路：直接查表 vs 子程序计算",
      "paragraphs": [
        "为了绕开复杂的 z 变换手工推导，书里提供了两条无需懂复变函数就能拿到递归系数的实用路径：",
        "**路径一：“偷懒法”——直接查阅系数表（Table 20-1 与 Table 20-2）**：书中共列出了 `0.5%` 纹波、2/4/6 极点、12 个典型截止频率（`0.01` 到 `0.45`）的低通与高通滤波器全部递归系数 `a0..aN` 与 `b1..bN`。如果只是应急开发，直接把表里的数字抄进递归差分方程就能跑起来。",
        "但仔细观察 Table 20-1 与 Table 20-2 会发现三个重要细节与局限：第一，**极低截止频率高阶会标红 `(!! Unstable !!)`**（如 `f_c = 0.01` 的 4/6 极点及 `f_c = 0.025` 的 6 极点），这是因为在单组直接型多项式形式下，极点过于贴近 `z = 1`，表内有限精度的十进制舍入会把极点推到单位圆外导致发散；第二，**参数选择死板**，只有 12 个频率、最多 6 极点且纹波固定为 `0.5%`，无法把设计推向最优；第三，**手工抄录非常耗时**，让人懒得去尝试其它参数。",
        "**路径二：在代码里嵌入计算子程序（Table 20-4 & 20-5）**：把四大参数传给程序，由算法自动算出 `A[]` 与 `B[]` 数组。虽然其核心子程序第一眼看上去有些吓人（接收 6 个输入、返回 5 个输出、内部用到 15 个临时变量），但其实整个流程只有第 1120 行这一处简单分支，其余全是直白的数值计算。第 31 章会详细揭秘该程序的内部数学原理。"
      ],
      "formula": {
        "expr": "y[n] = a0*x[n] + a1*x[n-1] + ... + aN*x[n-N] + b1*y[n-1] + ... + bN*y[n-N]",
        "explain": "直接型递归差分方程：x[n] 为当前输入样本，y[n] 为当前输出样本；将 Table 20-1/20-2 或计算子程序输出的 A[]、B[] 系数代入此式即可完成实时滤波。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：锯齿波递归滤波与 Web Audio 实时听感对比",
      "instruction": "拖动截止频率与极点数，观察左侧时域波形的平滑/锐化变化与右侧谐波频谱的截断效果；点击播放按钮可实时试听锯齿波经过切比雪夫滤波后的声音变化。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_c",
          "min": 0.05,
          "max": 0.45,
          "step": 0.05,
          "value": 0.15,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "极点数 (Poles)",
          "min": 2,
          "max": 12,
          "step": 2,
          "value": 4,
          "unit": " 极"
        },
        {
          "type": "toggle",
          "id": "highPass",
          "label": "高通滤波模式 (High-Pass)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "function buildStages(N, fc, isHP) {\n  var r = 0.005;\n  var eps = Math.sqrt(1 / ((1 - r) * (1 - r)) - 1);\n  var mu = Math.asinh(1 / eps) / N;\n  var w3db = Math.cosh(Math.acosh(1 / eps) / N);\n  var effFc = isHP ? (0.5 - fc) : fc;\n  var oc = Math.tan(Math.PI * effFc);\n  var stages = [];\n  for (var k = 0; k < N / 2; k++) {\n    var uk = (2 * k + 1) * Math.PI / (2 * N);\n    var sr = -Math.sinh(mu) * Math.sin(uk) / w3db;\n    var si = Math.cosh(mu) * Math.cos(uk) / w3db;\n    var w0 = Math.sqrt(sr * sr + si * si);\n    var qLin = w0 / (-2 * sr);\n    var srw = sr * oc;\n    var siw = si * oc;\n    var den = (1 - srw) * (1 - srw) + siw * siw;\n    var zr = (1 - srw * srw - siw * siw) / den;\n    var zi = (2 * siw) / den;\n    if (isHP) zr = -zr;\n    var b1 = 2 * zr;\n    var b2 = -(zr * zr + zi * zi);\n    var g = isHP ? (1 + b1 - b2) / 4 : (1 - b1 - b2) / 4;\n    var wDig = isHP ? 2 * Math.atan(Math.tan(Math.PI * fc) / w0) : 2 * Math.atan(Math.tan(Math.PI * fc) * w0);\n    var f0Hz = (wDig / (2 * Math.PI)) * 8000;\n    stages.push({ a0: g, a1: isHP ? -2 * g : 2 * g, a2: g, b1: b1, b2: b2, f0Hz: f0Hz, qDb: 20 * Math.log10(qLin) });\n  }\n  return stages;\n}\n\nfunction evalResponse(stages, f) {\n  var w = 2 * Math.PI * f;\n  var c1 = Math.cos(w), s1 = Math.sin(w);\n  var c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);\n  var mag2 = 1;\n  for (var i = 0; i < stages.length; i++) {\n    var q = stages[i];\n    var nr = q.a0 + q.a1 * c1 + q.a2 * c2;\n    var ni = -q.a1 * s1 - q.a2 * s2;\n    var dr = 1 - q.b1 * c1 - q.b2 * c2;\n    var di = q.b1 * s1 + q.b2 * s2;\n    mag2 *= (nr * nr + ni * ni) / (dr * dr + di * di + 1e-18);\n  }\n  return Math.sqrt(mag2);\n}\n\nvar audioState = null;\nvar lastPoleCount = 0;\nvar phaseOffset = 0;\n\nfunction syncAudio() {\n  var shouldPlay = lab.values.play;\n  var N = lab.values.poles;\n  var fc = lab.values.fc;\n  var isHP = lab.values.highPass;\n  var stages = buildStages(N, fc, isHP);\n\n  if (!shouldPlay) {\n    if (audioState) {\n      try { audioState.osc.stop(); audioState.osc.disconnect(); } catch (e) {}\n      try { audioState.gain.disconnect(); } catch (e) {}\n      audioState = null;\n      lastPoleCount = 0;\n    }\n    return;\n  }\n\n  var actx = lab.getAudioContext();\n  if (actx.state === 'suspended') actx.resume();\n  if (!audioState) {\n    var osc = actx.createOscillator();\n    osc.type = 'sawtooth';\n    osc.frequency.value = 160;\n    var gain = actx.createGain();\n    gain.gain.value = 0.14;\n    var bqs = [];\n    for (var i = 0; i < 6; i++) bqs.push(actx.createBiquadFilter());\n    osc.start();\n    audioState = { osc: osc, gain: gain, bqs: bqs };\n  }\n\n  var activeCount = stages.length;\n  if (lastPoleCount !== activeCount) {\n    audioState.osc.disconnect();\n    for (var i = 0; i < 6; i++) audioState.bqs[i].disconnect();\n    var prev = audioState.osc;\n    for (var i = 0; i < activeCount; i++) {\n      prev.connect(audioState.bqs[i]);\n      prev = audioState.bqs[i];\n    }\n    prev.connect(audioState.gain);\n    audioState.gain.connect(actx.destination);\n    lastPoleCount = activeCount;\n  }\n\n  var now = actx.currentTime;\n  for (var i = 0; i < activeCount; i++) {\n    var bq = audioState.bqs[i];\n    var st = stages[i];\n    bq.type = isHP ? 'highpass' : 'lowpass';\n    var safeFreq = Math.max(30, Math.min(actx.sampleRate * 0.45, st.f0Hz));\n    bq.frequency.setTargetAtTime(safeFreq, now, 0.02);\n    bq.Q.setTargetAtTime(st.qDb, now, 0.02);\n  }\n}\n\nfunction drawScene() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var N = lab.values.poles;\n  var fc = lab.values.fc;\n  var isHP = lab.values.highPass;\n  var stages = buildStages(N, fc, isHP);\n\n  var totalSamples = 512;\n  var xBuf = new Float32Array(totalSamples);\n  for (var n = 0; n < totalSamples; n++) {\n    var v = 0;\n    for (var h = 1; h <= 12; h++) {\n      v += (2 / Math.PI) * (Math.sin(2 * Math.PI * 0.04 * h * (n + phaseOffset)) / h);\n    }\n    xBuf[n] = v;\n  }\n\n  var yBuf = new Float32Array(xBuf);\n  for (var s = 0; s < stages.length; s++) {\n    var st = stages[s];\n    var next = new Float32Array(totalSamples);\n    for (var n = 2; n < totalSamples; n++) {\n      next[n] = st.a0 * yBuf[n] + st.a1 * yBuf[n - 1] + st.a2 * yBuf[n - 2] + st.b1 * next[n - 1] + st.b2 * next[n - 2];\n    }\n    yBuf = next;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  var lx = 24, ly = 32, lw = 320, lh = 174;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.beginPath(); ctx.moveTo(lx, ly + lh / 2); ctx.lineTo(lx + lw, ly + lh / 2); ctx.stroke();\n\n  var showStart = 360, showLen = 128;\n  ctx.save();\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (var i = 0; i < showLen; i++) {\n    var px = lx + (i / (showLen - 1)) * lw;\n    var py = ly + lh / 2 - xBuf[showStart + i] * (lh * 0.4);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i < showLen; i++) {\n    var px = lx + (i / (showLen - 1)) * lw;\n    var py = ly + lh / 2 - yBuf[showStart + i] * (lh * 0.4);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域波形 (橙虚线: 原锯齿波 / 绿实线: 滤波后)', lx, 20);\n\n  var rx = 382, ry = 32, rw = 314, rh = 174;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  var barW = 14;\n  for (var h = 1; h <= 12; h++) {\n    var fh = 0.04 * h;\n    var bx = rx + (fh / 0.5) * rw - barW / 2;\n    var rawH = (1 / h) * (rh - 14);\n    var mag = evalResponse(stages, fh);\n    var filtH = rawH * mag;\n\n    ctx.fillStyle = 'rgba(148,163,184,0.22)';\n    ctx.fillRect(bx, ry + rh - rawH, barW, rawH);\n\n    ctx.fillStyle = mag > 0.5 ? '#38bdf8' : 'rgba(56,189,248,0.35)';\n    ctx.fillRect(bx + 2, ry + rh - filtH, barW - 4, filtH);\n  }\n\n  ctx.strokeStyle = 'rgba(16,185,129,0.65)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 150; i++) {\n    var f = (i / 150) * 0.5;\n    var ex = rx + (f / 0.5) * rw;\n    var ey = ry + rh - Math.min(1.05, evalResponse(stages, f)) * (rh - 14);\n    if (i === 0) ctx.moveTo(ex, ey); else ctx.lineTo(ex, ey);\n  }\n  ctx.stroke();\n\n  var cutX = rx + (fc / 0.5) * rw;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(cutX, ry); ctx.lineTo(cutX, ry + rh); ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('频域谐波分布 (12 次谐波截断效果)', rx, 20);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('0.0', rx, ry + rh + 15);\n  ctx.fillText('fc=' + fc.toFixed(2), cutX, ry + rh + 15);\n  ctx.fillText('0.5', rx + rw, ry + rh + 15);\n\n  var passed = 0;\n  for (var h = 1; h <= 12; h++) {\n    if (evalResponse(stages, 0.04 * h) >= 0.707) passed++;\n  }\n  var audioHz = Math.round(fc * 8000);\n  lab.setReadout((isHP ? '高通' : '低通') + ' | ' + N + ' 极点 | fc=' + fc.toFixed(2) + ' (听感等效 ' + audioHz + ' Hz) | 保留谐波(> -3dB): ' + passed + '/12 | 音频: ' + (lab.values.play ? '播放中' : '已暂停'));\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawScene();\n});\n\nlab.onLoop(function(dt) {\n  if (lab.values.play) {\n    phaseOffset = (phaseOffset + dt * 28) % 25;\n    drawScene();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "四参数速记：设计切比雪夫滤波器只需决定「高/低通、截止频率 fc、通带纹波(推荐 0.5%)、偶数极点数」；极点越多滚降越陡。",
        "边缘更陡少用极点：截止频率靠近 0 或 0.5 时滚降天然极陡（fc=0.05 的 2 极点 ≈ fc=0.25 的 4 极点），此时应减少极点数以减轻舍入噪声。",
        "警惕查表极端参数发散：Table 20-1/20-2 仅适合快速验证，在极低截止频率（如 fc≤0.025）下直接使用 4/6 极点单组系数会因舍入误差导致极点冲出单位圆而标红 Unstable。",
        "生产环境首选程序算系数：实际项目应嵌入系数计算子程序（或将高阶滤波器拆分为二阶节级联），以获得任意连续参数与更高的数值稳定性。"
      ]
    }
  ]
});
