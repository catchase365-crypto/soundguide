window.__BOOK_REGISTER_SECTION__("sec_097", {
  "title": "麻烦 4：极小幅度信号的相位失真 (Nuisance 4: Phase of Very Small Magnitudes)",
  "intuition": "当频域幅度小到被舍入噪声淹没时，反正切算出的相位会在 -π 到 +π 之间剧烈乱跳——它看起来像真实信号，其实全是没有意义的噪声。",
  "blocks": [
    {
      "type": "concept",
      "heading": "原点附近的罗盘失灵：为什么微小噪声能毁掉相位？",
      "paragraphs": [
        "在数字信号处理中，离散傅里叶变换（DFT）最初计算出来的是**直角坐标形式**（实部 `Re X[k]` 与虚部 `Im X[k]`）。当我们把它转换为**极坐标形式**时，幅度反映向量到原点的距离，而相位则是向量与正实轴之间的夹角。",
        "只要信号幅度足够大，计算机浮点运算带来的微小**舍入噪声（Round-off Noise）**就如同大海里的一滴水，对向量长度和方向都几乎没有影响。但当某个频率分量的真实幅度接近于零时，情况就完全变了。",
        "此时，真实信号向量已经缩到了复平面的原点附近，而随机舍入噪声的半径却可能大于等于信号本身的长度。噪声会把合成向量随机推向原点的四面八方，导致 `atan2(Im, Re)` 计算出的角度失去任何物理意义，在 `-π` 到 `+π`（即 `-180°` 到 `+180°`）之间疯狂乱跳。"
      ],
      "formula": {
        "expr": "Phase X[k] = atan2(Im X[k] + n_i, Re X[k] + n_r)",
        "explain": "Re X[k] 与 Im X[k] 是理想信号的实部和虚部，n_r 与 n_i 是计算机浮点运算或采样带来的微小舍入噪声。当 Re 和 Im 都远小于噪声 n_r、n_i 时，夹角完全由随机噪声主导。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复平面微扰与相位发散演示",
      "instruction": "拖动「信号真实幅度」滑块将其从 0.50 逐渐降到 0.02，观察左侧复平面中粉色测量向量与右侧实时相位曲线如何突然陷入狂乱。",
      "controls": [
        {
          "type": "slider",
          "id": "mag",
          "label": "信号真实幅度 |X[k]|",
          "min": 0.01,
          "max": 1,
          "step": 0.01,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "舍入噪声半径 ε",
          "min": 0,
          "max": 0.25,
          "step": 0.005,
          "value": 0.05,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "truePhase",
          "label": "信号真实相位 θ",
          "min": -180,
          "max": 180,
          "step": 5,
          "value": 35,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "持续注入动态随机噪声",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar history = [];\nvar maxHist = 90;\nvar lastNoiseTime = -1;\nvar lastTime = 0;\nvar curNoiseX = 0, curNoiseY = 0;\n\nfunction computeState(t) {\n  var mag = lab.values.mag;\n  var noise = lab.values.noise;\n  var trueRad = lab.values.truePhase * Math.PI / 180;\n  var rx = mag * Math.cos(trueRad);\n  var ry = mag * Math.sin(trueRad);\n  if (lab.values.animate) {\n    if (t - lastNoiseTime > 0.07 || lastNoiseTime < 0) {\n      var ang = Math.random() * Math.PI * 2;\n      var r = Math.sqrt(Math.random()) * noise;\n      curNoiseX = r * Math.cos(ang);\n      curNoiseY = r * Math.sin(ang);\n      lastNoiseTime = t;\n    }\n  } else {\n    curNoiseX = noise * 0.707;\n    curNoiseY = -noise * 0.707;\n  }\n  var mx = rx + curNoiseX;\n  var my = ry + curNoiseY;\n  var measRad = Math.atan2(my, mx);\n  return { mag: mag, noise: noise, trueRad: trueRad, rx: rx, ry: ry, mx: mx, my: my, measRad: measRad };\n}\n\nfunction drawFrame(t) {\n  lastTime = t;\n  var st = computeState(t);\n  if (lab.values.animate) {\n    history.push({ measRad: st.measRad });\n    if (history.length > maxHist) history.shift();\n  }\n  ctx.clearRect(0, 0, W, H);\n\n  var cx = 165, cy = 124, scale = 92;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(20, cy); ctx.lineTo(310, cy);\n  ctx.moveTo(cx, 22); ctx.lineTo(cx, 228);\n  ctx.stroke();\n\n  ctx.beginPath();\n  ctx.arc(cx, cy, scale, 0, Math.PI * 2);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re X[k]', 272, cy - 6);\n  ctx.fillText('Im X[k]', cx + 6, 30);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('复平面：真实向量(蓝) vs 含噪测量(粉)', 18, 16);\n\n  var tx = cx + st.rx * scale;\n  var ty = cy - st.ry * scale;\n  var px = cx + st.mx * scale;\n  var py = cy - st.my * scale;\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n  ctx.fillStyle = 'rgba(245,158,11,0.16)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.arc(tx, ty, st.noise * scale, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(tx, ty);\n  ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath();\n  ctx.arc(tx, ty, 3.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  var rayX = cx + Math.cos(st.measRad) * scale;\n  var rayY = cy - Math.sin(st.measRad) * scale;\n  ctx.save();\n  ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n  ctx.setLineDash([3, 3]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(rayX, rayY);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(px, py, 4, 0, Math.PI * 2);\n  ctx.fill();\n\n  var gx = 355, gy = 30, gw = 345, gh = 190;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(gx, gy, gw, gh);\n  for (var i = -2; i <= 2; i++) {\n    var yy = gy + gh / 2 - (i / 2) * (gh / 2 - 12);\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('+π', gx - 22, gy + 16);\n  ctx.fillText('0', gx - 14, gy + gh / 2 + 4);\n  ctx.fillText('-π', gx - 22, gy + gh - 8);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('实测相位随时间变化 (弧度)', gx + 6, gy - 10);\n\n  var trueY = gy + gh / 2 - (st.trueRad / Math.PI) * (gh / 2 - 12);\n  ctx.save();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.setLineDash([5, 4]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(gx, trueY); ctx.lineTo(gx + gw, trueY); ctx.stroke();\n  ctx.restore();\n\n  if (lab.values.animate && history.length > 1) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var k = 0; k < history.length; k++) {\n      var hx = gx + (k / (maxHist - 1)) * gw;\n      var hy = gy + gh / 2 - (history[k].measRad / Math.PI) * (gh / 2 - 12);\n      if (k === 0) ctx.moveTo(hx, hy);\n      else ctx.lineTo(hx, hy);\n    }\n    ctx.stroke();\n  } else {\n    var measY = gy + gh / 2 - (st.measRad / Math.PI) * (gh / 2 - 12);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(gx, measY); ctx.lineTo(gx + gw, measY); ctx.stroke();\n  }\n\n  var measDeg = (st.measRad * 180 / Math.PI).toFixed(1);\n  var snr = st.noise > 0 ? (st.mag / st.noise).toFixed(2) : '∞';\n  var status = st.mag <= st.noise ? '⚠ 信号已被噪声圆盘吞没，相位彻底失真' : (st.mag < st.noise * 3 ? '⚡ 噪声明显扰动相位' : '✓ 幅度占优，相位稳定');\n  lab.setReadout('真实相位: ' + lab.values.truePhase + '° | 测量相位: ' + measDeg + '° | 幅噪比(|X|/ε): ' + snr + ' | ' + status);\n}\n\nlab.onUpdate(function() {\n  if (!lab.values.animate) history = [];\n  drawFrame(lastTime);\n});\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.animate) drawFrame(timeSec);\n});"
    },
    {
      "type": "concept",
      "heading": "相位噪声的伪装术与「幅度门限」净化法",
      "paragraphs": [
        "极小幅度导致相位失真之所以是工程中最隐蔽的陷阱，是因为**幅度谱很诚实，而相位谱极具欺骗性**。",
        "观察原书图 8-11 所示的低通信号频谱：当频率升高到阻带区域时，幅度图 `Mag X[]` 贴着 `0` 轴几乎变成一条水平线，任何工程师一眼就能看出这部分高频分量微不足道、大概率只是噪声。",
        "但相位图 `Phase X[]` 却完全不同！无论原始幅度是 `1.0` 还是 `10^-6`，反正切算出来的随机相位依然会**均匀铺满整个 `[-π, +π]` 区间**。不知情的开发者看到高频段剧烈震荡的相位波形，往往会误以为发现了某种高频特征信号，甚至花数小时去排查根本不存在的代码 Bug。",
        "更精妙的是，图 8-11 中幅度在频率 `0.17` 附近肉眼看去就已经接近零了，但相位一直到频率 `0.25` 左右才开始剧烈跳动——这是因为在 `0.17` 到 `0.25` 之间，信号幅度虽然小（比如 `0.001`），但仍比计算机 `10^-5` 级别的舍入噪声大得多，所以相位依然保持着正确的 `0`。直到幅度跌破舍入噪声基底，相位才彻底崩溃。工程上最标准的防御策略是设置**幅度门限（Magnitude Masking）**：当幅度小于阈值 `ε` 时，强制将相位归零或标记为无效。"
      ],
      "formula": {
        "expr": "Phase_clean[k] = (Mag X[k] > ε) ? atan2(Im X[k], Re X[k]) : 0",
        "explain": "ε 是人为设定的幅度安全门限（需略高于系统的舍入噪声基底）。只有当某频点幅度 Mag X[k] 大于 ε 时，才信任其相位；否则直接置零屏蔽，防止无意义的随机相位污染后续算法。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：复现图 8-11 阻带相位狂飙与门限净化（支持听觉对比）",
      "instruction": "调节「舍入噪声基底」观察相位起跳频率的移动；点击「播放扫频相位监听」，在高频段出现刺耳相位噪声时打开「启用幅度门限屏蔽」对比净化效果。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseExp",
          "label": "舍入噪声基底 (10^x)",
          "min": -6,
          "max": -1.5,
          "step": 0.25,
          "value": -4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "threshExp",
          "label": "幅度门限阈值 ε (10^x)",
          "min": -6,
          "max": -1,
          "step": 0.25,
          "value": -3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "applyMask",
          "label": "启用幅度门限屏蔽 (清零无效相位)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放扫频相位监听",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar N = 84;\nvar SWEEP_SEC = 3.0;\nvar noiseTable = [];\nfunction pseudoRand(s) { var x = Math.sin(s) * 43758.5453; return x - Math.floor(x); }\nfor (var i = 0; i < N; i++) {\n  noiseTable.push({\n    nr: (pseudoRand(i * 17.3 + 1.1) - 0.5) * 2,\n    ni: (pseudoRand(i * 53.7 + 4.9) - 0.5) * 2\n  });\n}\n\nvar srcNode = null, gainNode = null, audioStart = 0;\n\nfunction computeBins() {\n  var noiseAmp = Math.pow(10, lab.values.noiseExp);\n  var thresh = Math.pow(10, lab.values.threshExp);\n  var maskOn = lab.values.applyMask;\n  var bins = [];\n  var firstNoisyFreq = -1;\n  var maskedCount = 0;\n  for (var i = 0; i < N; i++) {\n    var f = (i / (N - 1)) * 0.5;\n    var magTrue = 1.0 / (1.0 + Math.exp((f - 0.095) / 0.014));\n    var re = magTrue + noiseAmp * noiseTable[i].nr;\n    var im = noiseAmp * noiseTable[i].ni;\n    var magMeas = Math.sqrt(re * re + im * im);\n    var phaseRaw = Math.atan2(im, re);\n    var isMasked = maskOn && (magMeas < thresh);\n    var phaseOut = isMasked ? 0 : phaseRaw;\n    if (isMasked) maskedCount++;\n    if (firstNoisyFreq < 0 && Math.abs(phaseOut) > 0.35) firstNoisyFreq = f;\n    bins.push({ f: f, mag: magMeas, phase: phaseOut, masked: isMasked });\n  }\n  return { bins: bins, noiseAmp: noiseAmp, thresh: thresh, firstNoisyFreq: firstNoisyFreq, maskedCount: maskedCount };\n}\n\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\n\nfunction startOrRefreshAudio(data) {\n  stopAudio();\n  if (!lab.values.play) return;\n  try {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    var sr = ac.sampleRate;\n    var totalSamples = Math.floor(sr * SWEEP_SEC);\n    var buf = ac.createBuffer(1, totalSamples, sr);\n    var ch = buf.getChannelData(0);\n    for (var s = 0; s < totalSamples; s++) {\n      var t = s / sr;\n      var idx = Math.min(N - 1, Math.floor((t / SWEEP_SEC) * N));\n      var phi = data.bins[idx].phase;\n      var env = 1.0;\n      if (s < 400) env = s / 400;\n      if (s > totalSamples - 400) env = (totalSamples - s) / 400;\n      ch[s] = 0.16 * env * Math.sin(2 * Math.PI * 240 * t + phi);\n    }\n    srcNode = ac.createBufferSource();\n    srcNode.buffer = buf;\n    srcNode.loop = true;\n    if (!gainNode) {\n      gainNode = ac.createGain();\n      gainNode.gain.value = 0.9;\n      gainNode.connect(ac.destination);\n    }\n    srcNode.connect(gainNode);\n    audioStart = ac.currentTime;\n    srcNode.start(0);\n  } catch (e) {}\n}\n\nfunction drawGraph(sweepRatio) {\n  var data = computeBins();\n  var bins = data.bins;\n  ctx.clearRect(0, 0, W, H);\n\n  var left = { x: 48, y: 26, w: 300, h: 178 };\n  var right = { x: 400, y: 26, w: 300, h: 178 };\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('a. 幅度谱 Mag X[] (线性尺度)', left.x, 16);\n  ctx.fillText('b. 相位谱 Phase X[] (弧度)', right.x, 16);\n\n  function drawGrid(box, yLabels) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(box.x, box.y, box.w, box.h);\n    for (var r = 0; r < yLabels.length; r++) {\n      var yy = box.y + (r / (yLabels.length - 1)) * box.h;\n      ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n      ctx.beginPath(); ctx.moveTo(box.x, yy); ctx.lineTo(box.x + box.w, yy); ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.font = '10px sans-serif';\n      ctx.fillText(yLabels[r], box.x - 26, yy + 3);\n    }\n    for (var c = 0; c <= 5; c++) {\n      var xx = box.x + (c / 5) * box.w;\n      ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n      ctx.beginPath(); ctx.moveTo(xx, box.y); ctx.lineTo(xx, box.y + box.h); ctx.stroke();\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.fillText((c * 0.1).toFixed(1), xx - 8, box.y + box.h + 14);\n    }\n    ctx.fillText('归一化频率 Frequency', box.x + box.w / 2 - 48, box.y + box.h + 28);\n  }\n\n  drawGrid(left, ['1.5', '1.0', '0.5', '0.0']);\n  drawGrid(right, ['+4', '+2', '0', '-2', '-4']);\n\n  if (lab.values.applyMask) {\n    var threshY = left.y + left.h - Math.min(1.5, data.thresh) / 1.5 * left.h;\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath(); ctx.moveTo(left.x, threshY); ctx.lineTo(left.x + left.w, threshY); ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var lx = left.x + (bins[i].f / 0.5) * left.w;\n    var ly = left.y + left.h - Math.min(1.5, bins[i].mag) / 1.5 * left.h;\n    if (i === 0) ctx.moveTo(lx, ly); else ctx.lineTo(lx, ly);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = lab.values.applyMask ? '#38bdf8' : '#ec4899';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (var j = 0; j < N; j++) {\n    var rx = right.x + (bins[j].f / 0.5) * right.w;\n    var ry = right.y + right.h / 2 - (bins[j].phase / 4.0) * (right.h / 2);\n    if (j === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.stroke();\n\n  for (var m = 0; m < N; m += 2) {\n    var mx = right.x + (bins[m].f / 0.5) * right.w;\n    var my = right.y + right.h / 2 - (bins[m].phase / 4.0) * (right.h / 2);\n    ctx.fillStyle = bins[m].masked ? '#10b981' : (Math.abs(bins[m].phase) > 0.3 ? '#ec4899' : '#38bdf8');\n    ctx.fillRect(mx - 1.5, my - 1.5, 3, 3);\n  }\n\n  if (sweepRatio >= 0) {\n    var sx1 = left.x + sweepRatio * left.w;\n    var sx2 = right.x + sweepRatio * right.w;\n    ctx.strokeStyle = 'rgba(245,158,11,0.9)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(sx1, left.y); ctx.lineTo(sx1, left.y + left.h); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(sx2, right.y); ctx.lineTo(sx2, right.y + right.h); ctx.stroke();\n  }\n\n  var nStr = data.noiseAmp.toExponential(1);\n  var tStr = data.thresh.toExponential(1);\n  var fInfo = data.firstNoisyFreq > 0 ? ('相位失控起点 f ≈ ' + data.firstNoisyFreq.toFixed(2)) : '全频段相位已净化';\n  var maskInfo = lab.values.applyMask ? ('门限已开启(屏蔽 ' + data.maskedCount + '/' + N + ' 频点)') : '门限关闭(阻带随机相位暴露)';\n  lab.setReadout('噪声基底: ' + nStr + ' | 门限 ε: ' + tStr + ' | ' + fInfo + ' | ' + maskInfo);\n  return data;\n}\n\nlab.onUpdate(function() {\n  var data = drawGraph(-1);\n  startOrRefreshAudio(data);\n});\n\nlab.onLoop(function(dt, timeSec) {\n  if (lab.values.play) {\n    var ac = null;\n    try { ac = lab.getAudioContext(); } catch (e) {}\n    var elapsed = ac ? (ac.currentTime - audioStart) : timeSec;\n    var ratio = (elapsed % SWEEP_SEC) / SWEEP_SEC;\n    drawGraph(ratio);\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要盲信全幅值铺满 [-π, +π] 的相位图：相位极坐标运算天然具有“放大微弱噪声”的视觉欺骗性，极小幅度下的相位跳变与有效信号长得一模一样。",
        "排错第一原则——先看幅度再看相位：当发现某段频谱相位剧烈跳动或杂乱无章时，先核对对应频点的幅度是否已经跌入舍入噪声或传感器本底噪声，切忌直接怀疑 FFT 代码逻辑有误。",
        "幅度与相位脱节的临界现象：肉眼在幅度图上看到已经贴近 0 的区域，相位未必立刻发疯；只有当幅度真正低于系统噪声基底（例如单精度浮点的 10^-6 量级）时，相位才会彻底崩溃。",
        "标准工程防线（幅度门限）：在进行相位提取、解卷绕（Unwrapping）或极坐标滤波前，务必设置合理的幅度门限 ε（必须大于噪声基底），将幅度低于 ε 的频点相位清零或置为无效。"
      ]
    }
  ]
});
