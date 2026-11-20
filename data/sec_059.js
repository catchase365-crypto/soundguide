window.__BOOK_REGISTER_SECTION__("sec_059", {
  "title": "信号的奇偶对称分解 (Even/Odd Decomposition)",
  "intuition": "任何离散信号都可以无损拆解为一个“偶对称信号”和一个“奇对称信号”之和，而支撑这一拆解的底层逻辑是信号首尾相连的圆周对称性。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把任意信号一分为二：偶分量与奇分量",
      "paragraphs": [
        "在数字信号处理中，**奇偶分解 (Even/Odd Decomposition)** 可以把一个长度为 $N$（通常假设 $N$ 为偶数，下标从 $0$ 到 $N-1$）的任意离散信号 $x[n]$，拆解为两个长度同样为 $N$ 的分量信号：具有**偶对称性**的偶分量 $x_E[n]$，以及具有**奇对称性**的奇分量 $x_O[n]$。",
        "什么叫对称？以采样点 $N/2$ 为镜像中心来看：**偶对称**意味着左右两侧等距点的数值完全相等，即 `x[N/2 + 1] == x[N/2 - 1]`、`x[N/2 + 2] == x[N/2 - 2]`；**奇对称**则意味着左右两侧等距点的幅度相等但符号相反，即 `x[N/2 + 1] == -x[N/2 - 1]`、`x[N/2 + 2] == -x[N/2 - 2]`。",
        "奇偶分解之所以在工程上完全成立，是因为把拆分出来的两个分量逐点相加，就能**100% 精确重构**出原始信号：`x_E[n] + x_O[n] = x[n]`。你可以通过下面的公式直接算出每一个采样点的值，但要特别留意下标 `0` 的特殊处理。"
      ],
      "formula": {
        "expr": "x_E[n] = (x[n] + x[N - n]) / 2,   x_O[n] = (x[n] - x[N - n]) / 2   (特例: x_E[0] = x[0], x_O[0] = 0)",
        "explain": "x[n] 是原信号第 n 个样本；x[N - n] 是它关于对称轴的镜像配对样本；两者的平均值构成偶分量 x_E[n]，半差值构成奇分量 x_O[n]。由于信号索引只到 N-1，当 n=0 时不能直接访问 x[N]，必须规定 x_E[0] = x[0]、x_O[0] = 0。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：实时奇偶分解与谐波听感对比",
      "instruction": "拖动「波形不对称度」观察 x_O[n] 如何从零生长，拖动「采样探针 n」对比配对点 (n, N-n)，点击播放按钮并用开关切换试听原信号与纯奇分量。",
      "controls": [
        {
          "type": "slider",
          "id": "asymmetry",
          "label": "波形不对称度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 70,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "probe",
          "label": "采样探针 n",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "soloEvenOdd",
          "label": "仅听奇分量 x_O[n]（关闭则听原信号 x[n]）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放波形声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 16;\nvar audioCtx = null;\nvar osc = null;\nvar gainNode = null;\n\nfunction getSignal(asym) {\n  var a = asym / 100;\n  var cosC = [0, 0.55, 0.25, 0.15];\n  var sinC = [0, 0.45 * a, 0.30 * a, 0.20 * a];\n  var x = [];\n  for (var n = 0; n < N; n++) {\n    var val = 0.12 * (1 - 0.5 * a);\n    for (var k = 1; k <= 3; k++) {\n      var th = (2 * Math.PI * k * n) / N;\n      val += cosC[k] * Math.cos(th) + sinC[k] * Math.sin(th);\n    }\n    x.push(val);\n  }\n  return { x: x, cosC: cosC, sinC: sinC };\n}\n\nfunction updateAudio() {\n  try {\n    var playing = !!lab.values.play;\n    if (playing) {\n      if (!audioCtx) audioCtx = lab.getAudioContext();\n      if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n      if (audioCtx && !osc) {\n        osc = audioCtx.createOscillator();\n        gainNode = audioCtx.createGain();\n        gainNode.gain.value = 0;\n        osc.frequency.value = 220;\n        osc.connect(gainNode);\n        gainNode.connect(audioCtx.destination);\n        osc.start();\n      }\n      if (audioCtx && osc && gainNode) {\n        var sig = getSignal(lab.values.asymmetry);\n        var real = new Float32Array(5);\n        var imag = new Float32Array(5);\n        var onlyOdd = !!lab.values.soloEvenOdd;\n        for (var k = 1; k <= 3; k++) {\n          real[k] = onlyOdd ? 0 : sig.cosC[k];\n          imag[k] = sig.sinC[k];\n        }\n        var wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });\n        osc.setPeriodicWave(wave);\n        gainNode.gain.setTargetAtTime(0.22, audioCtx.currentTime, 0.02);\n      }\n    } else if (audioCtx && gainNode) {\n      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nfunction drawPanel(ctx, px, py, pw, ph, arr, title, color, p, m, activeBorder) {\n  ctx.save();\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = activeBorder ? '#f59e0b' : 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = activeBorder ? 1.8 : 1;\n  ctx.fillRect(px, py, pw, ph);\n  ctx.strokeRect(px, py, pw, ph);\n\n  ctx.fillStyle = color;\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(title, px + 8, py - 8);\n\n  var cy = py + ph / 2;\n  var scaleY = ph * 0.36;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -1; g <= 1; g += 0.5) {\n    if (g === 0) continue;\n    var gy = cy - g * scaleY;\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px + pw, cy); ctx.stroke();\n\n  var padX = 12;\n  var stepX = (pw - 2 * padX) / (N - 1);\n  var halfX = px + padX + (N / 2) * stepX;\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.35)';\n  ctx.beginPath(); ctx.moveTo(halfX, py + 4); ctx.lineTo(halfX, py + ph - 4); ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (var i = 0; i < N; i++) {\n    var sx = px + padX + i * stepX;\n    var sy = cy - arr[i] * scaleY;\n    var isP = (i === p);\n    var isM = (i === m);\n    var col = isP ? '#f59e0b' : (isM ? '#f8fafc' : color);\n    ctx.strokeStyle = col;\n    ctx.lineWidth = (isP || isM) ? 2.2 : 1.5;\n    ctx.beginPath(); ctx.moveTo(sx, cy); ctx.lineTo(sx, sy); ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.beginPath(); ctx.arc(sx, sy, (isP || isM) ? 4 : 2.6, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('0', px + padX, py + ph + 13);\n  ctx.fillText('N/2', halfX, py + ph + 13);\n  ctx.fillText('N-1', px + pw - padX, py + ph + 13);\n  ctx.restore();\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var sig = getSignal(lab.values.asymmetry);\n  var x = sig.x;\n  var xE = [];\n  var xO = [];\n  for (var n = 0; n < N; n++) {\n    var mn = (N - n) % N;\n    xE.push((x[n] + x[mn]) / 2);\n    xO.push((x[n] - x[mn]) / 2);\n  }\n\n  var p = Math.round(lab.values.probe);\n  var m = (N - p) % N;\n  var playing = !!lab.values.play;\n  var onlyOdd = !!lab.values.soloEvenOdd;\n\n  drawPanel(ctx, 14, 34, 212, 172, x, '原信号 x[n]', '#38bdf8', p, m, playing && !onlyOdd);\n  drawPanel(ctx, 254, 34, 212, 172, xE, '偶分量 x_E[n] (纯余弦)', '#10b981', p, m, false);\n  drawPanel(ctx, 494, 34, 212, 172, xO, '奇分量 x_O[n] (纯正弦)', '#ec4899', p, m, playing && onlyOdd);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 20px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('=', 240, 126);\n  ctx.fillText('+', 480, 126);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('● 橙色点: n=' + p, 14, 234);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('● 白色点: 配对点 (N-n)%N=' + m, 130, 234);\n\n  lab.setReadout('n=' + p + ', 配对=' + m + ' | x[n]=' + x[p].toFixed(2) + ', x[N-n]=' + x[m].toFixed(2) + ' → x_E[' + p + ']=' + xE[p].toFixed(2) + ', x_O[' + p + ']=' + xO[p].toFixed(2) + ' (叠加还原=' + (xE[p] + xO[p]).toFixed(2) + ')');\n});"
    },
    {
      "type": "concept",
      "heading": "为什么中心在 N/2 而不是 N/2 - ½？揭秘“圆周对称”",
      "paragraphs": [
        "细心的读者一定会发现一个奇怪的地方：对于下标从 `0` 到 `N-1` 的数组（例如 `N=16`，下标 `0..15`），几何正中心明明在 `7.5`（即 `N/2 - ½`，第 7 点和第 8 点的正中间），为什么公式偏偏把 `N/2`（第 8 点）当成对称中心？而且为什么第 `0` 号采样点没有配对，还要搞特殊处理？",
        "答案是数字信号处理中一个极其核心的观念——**圆周对称 (Circular Symmetry)**。它把信号的**末尾**和**开头**想象成首尾相连：就像 `x[4]` 紧挨着 `x[5]` 一样，最后一个点 `x[N-1]` 也紧挨着第一个点 `x[0]`，宛如一条**咬住自己尾巴的蛇**。",
        "一旦把信号弯成一个首尾相连的圆环，画面瞬间通透了！圆环上其实同时存在**两条对称轴**：一条穿过 `x[N/2]`，另一条恰好穿过 `x[0]`。围绕 `x[0]` 对称意味着 `x[1]` 配对 `x[N-1]`、`x[2]` 配对 `x[N-2]`……而正好落在这两条对称轴上的 `0` 号点和 `N/2` 号点，它们只能跟自己配对！因此铁律成立：在奇分量中，`x_O[0]` 和 `x_O[N/2]` **永远等于 0**；在偶分量中，`x_E[0]` 和 `x_E[N/2]` **永远等于原信号的值**。",
        "为什么好端端的采样数据要看成首尾相连的圆环？在真实数据采集中，第一个点和最后一个点往往毫无物理关联。真正逼着我们接受圆周视角的，是信号处理的皇冠——**傅里叶分析 (Fourier Analysis)**。傅里叶变换的数学内核天然把有限长信号视为周期性圆周信号。我们会在第 10 章深入剖析它，现在你只需要记住：奇偶分解和圆周对称正是通往傅里叶世界的敲门砖。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验二：咬尾之蛇——圆周对称与双对称轴透视镜",
      "instruction": "拖动「圆周采样点 n」观察点 n 与 (N-n)%N 如何跨轴镜像配对；试着调节 x[0] 和 x[N/2]，验证奇分量在这两点是否始终被死死锁在 0。",
      "controls": [
        {
          "type": "slider",
          "id": "probeN",
          "label": "圆周采样点 n",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "x0Val",
          "label": "起点样本 x[0]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": 7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "xHalfVal",
          "label": "半点样本 x[N/2]",
          "min": -10,
          "max": 10,
          "step": 1,
          "value": -6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showOdd",
          "label": "显示奇分量 x_O[n]（关闭显示偶分量 x_E[n]）",
          "value": false
        }
      ],
      "jsCode": "var N = 16;\nvar base = [0, 5, 8, 4, -3, -7, -2, 3, 0, -4, 6, 9, 2, -5, -8, -1];\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var x = base.slice();\n  x[0] = lab.values.x0Val;\n  x[N / 2] = lab.values.xHalfVal;\n\n  var xE = [];\n  var xO = [];\n  for (var i = 0; i < N; i++) {\n    var mi = (N - i) % N;\n    xE.push((x[i] + x[mi]) / 2);\n    xO.push((x[i] - x[mi]) / 2);\n  }\n\n  var showOdd = !!lab.values.showOdd;\n  var arr = showOdd ? xO : xE;\n  var mainCol = showOdd ? '#ec4899' : '#10b981';\n  var p = Math.round(lab.values.probeN);\n  var m = (N - p) % N;\n\n  // Left: Circular snake view\n  var cx = 132;\n  var cy = 122;\n  var R = 64;\n\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(12, 12, 240, 216);\n  ctx.strokeRect(12, 12, 240, 216);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('圆周视角 (首尾相连的蛇)', 22, 30);\n\n  // Symmetry axis through 0 and N/2\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(cx, cy - R - 26); ctx.lineTo(cx, cy + R + 26); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('n=0 (对称轴)', cx, cy - R - 30);\n  ctx.fillText('n=N/2 (对称轴)', cx, cy + R + 38);\n\n  // Base circle\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();\n\n  // Chord between p and m\n  var angP = -Math.PI / 2 + (2 * Math.PI * p) / N;\n  var angM = -Math.PI / 2 + (2 * Math.PI * m) / N;\n  var pxRing = cx + R * Math.cos(angP);\n  var pyRing = cy + R * Math.sin(angP);\n  var mxRing = cx + R * Math.cos(angM);\n  var myRing = cy + R * Math.sin(angM);\n  if (p !== m) {\n    ctx.setLineDash([3, 3]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n    ctx.beginPath(); ctx.moveTo(pxRing, pyRing); ctx.lineTo(mxRing, myRing); ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  // Radial waveform polygon\n  ctx.strokeStyle = mainCol;\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var i = 0; i <= N; i++) {\n    var idx = i % N;\n    var a = -Math.PI / 2 + (2 * Math.PI * idx) / N;\n    var rr = R + arr[idx] * 2.5;\n    var rx = cx + rr * Math.cos(a);\n    var ry = cy + rr * Math.sin(a);\n    if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.stroke();\n\n  // Points on circle\n  for (var i = 0; i < N; i++) {\n    var a = -Math.PI / 2 + (2 * Math.PI * i) / N;\n    var rr = R + arr[i] * 2.5;\n    var rx = cx + rr * Math.cos(a);\n    var ry = cy + rr * Math.sin(a);\n    var ox = cx + R * Math.cos(a);\n    var oy = cy + R * Math.sin(a);\n    var isP = (i === p);\n    var isM = (i === m);\n    var ptCol = isP ? '#f59e0b' : (isM ? '#f8fafc' : mainCol);\n    ctx.strokeStyle = isP || isM ? ptCol : 'rgba(255,255,255,0.18)';\n    ctx.lineWidth = isP || isM ? 2 : 1;\n    ctx.beginPath(); ctx.moveTo(ox, oy); ctx.lineTo(rx, ry); ctx.stroke();\n    ctx.fillStyle = ptCol;\n    ctx.beginPath(); ctx.arc(rx, ry, isP || isM ? 4.2 : 2.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  // Right: Linear unfolded array\n  var lx = 268;\n  var ly = 12;\n  var lw = 440;\n  var lh = 216;\n  ctx.fillStyle = 'rgba(255,255,255,0.02)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(lx, ly, lw, lh);\n  ctx.strokeRect(lx, ly, lw, lh);\n\n  ctx.fillStyle = mainCol;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText((showOdd ? '线性展开：奇分量 x_O[n]' : '线性展开：偶分量 x_E[n]') + '  (淡蓝虚影为原信号 x[n])', lx + 12, ly + 18);\n\n  var plotX = lx + 26;\n  var plotW = lw - 52;\n  var zeroY = ly + 120;\n  var scaleY = 6.8;\n  var stepX = plotW / (N - 1);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -10; g <= 10; g += 5) {\n    if (g === 0) continue;\n    var gy = zeroY - g * scaleY;\n    ctx.beginPath(); ctx.moveTo(lx + 10, gy); ctx.lineTo(lx + lw - 10, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(lx + 10, zeroY); ctx.lineTo(lx + lw - 10, zeroY); ctx.stroke();\n\n  // Two symmetry axis lines at 0 and N/2\n  var xAxis0 = plotX;\n  var xAxisHalf = plotX + (N / 2) * stepX;\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.beginPath(); ctx.moveTo(xAxis0, ly + 30); ctx.lineTo(xAxis0, ly + lh - 22); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(xAxisHalf, ly + 30); ctx.lineTo(xAxisHalf, ly + lh - 22); ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (var i = 0; i < N; i++) {\n    var sx = plotX + i * stepX;\n    var syOrig = zeroY - x[i] * scaleY;\n    var syArr = zeroY - arr[i] * scaleY;\n\n    // Ghost original\n    ctx.fillStyle = 'rgba(56,189,248,0.38)';\n    ctx.beginPath(); ctx.arc(sx, syOrig, 2.5, 0, Math.PI * 2); ctx.fill();\n\n    var isP = (i === p);\n    var isM = (i === m);\n    var col = isP ? '#f59e0b' : (isM ? '#f8fafc' : mainCol);\n    ctx.strokeStyle = col;\n    ctx.lineWidth = isP || isM ? 2.4 : 1.6;\n    ctx.beginPath(); ctx.moveTo(sx, zeroY); ctx.lineTo(sx, syArr); ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.beginPath(); ctx.arc(sx, syArr, isP || isM ? 4.5 : 3, 0, Math.PI * 2); ctx.fill();\n\n    ctx.fillStyle = (i === 0 || i === N / 2) ? '#f59e0b' : 'rgba(248,250,252,0.5)';\n    ctx.font = (i === 0 || i === N / 2) ? 'bold 10px monospace' : '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(String(i), sx, ly + lh - 8);\n  }\n\n  var note = (p === 0 || p === N / 2) ? '【点 ' + p + ' 位于对称轴上：x_E[' + p + ']=' + xE[p].toFixed(1) + ', x_O[' + p + ']=0】' : '配对镜像点 n=' + p + ' ↔ N-n=' + m;\n  lab.setReadout(note + ' | 轴点实测: x_E[0]=' + xE[0].toFixed(1) + ', x_O[0]=' + xO[0].toFixed(1) + ' | x_E[8]=' + xE[8].toFixed(1) + ', x_O[8]=' + xO[8].toFixed(1));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "数组越界大坑：千万不要照抄公式直接写 `x[N - n]`！当 `n = 0` 时，`x[N]` 会直接越界崩溃。工程代码中必须用取模运算 `x[(N - n) % N]`，或者显式特判 `xE[0] = x[0]`、`xO[0] = 0`。",
        "两条对称轴上的铁律：对于长度为偶数 N 的离散信号，奇分量在 `n = 0` 和 `n = N/2` 两点恒等于 `0`；偶分量在这两点恒等于原信号 `x[0]` 和 `x[N/2]`。",
        "为什么叫圆周对称：DSP 把信号看作首尾相连的圆环（`x[N-1]` 挨着 `x[0]`），对称轴在 `0` 和 `N/2`，而不是几何中点 `N/2 - ½`。这是为了无缝对接傅里叶变换（DFT）的隐含周期性假设。",
        "零成本单元测试：无论你的信号多么复杂，分解完成后都可以用 `Math.abs(xE[n] + xO[n] - x[n]) < 1e-9` 做逐点断言，这是检验算法零 Bug 的最快方式。"
      ]
    }
  ]
});
