window.__BOOK_REGISTER_SECTION__("sec_219", {
  "title": "实数离散傅里叶变换的本质与局限 (The Real DFT)",
  "intuition": "实数 DFT 虽然借用了“实部”和“虚部”的名字，但全程没有用到一个虚数 j；它用纯实数相关性完成了信号分解，却也因此背上了复数代换受限、忽略负频率、首尾点需除以 2 这三大数学包袱。",
  "blocks": [
    {
      "type": "concept",
      "heading": "挂着“复数”名号的纯实数相关性运算",
      "paragraphs": [
        "傅里叶变换家族的四大成员（DFT、DTFT、连续傅里叶变换、傅里叶级数）都可以用纯实数或复数来实现。在进入真正的**复数 DFT** 之前，我们先重新审视第 8 章学过的**实数 DFT（Real DFT）**，看看它的数学结构究竟哪里别扭。",
        "观察下方的公式，它把一个长度为 `N` 的时域信号 `x[n]`，分解为 `N/2 + 1` 个余弦波和 `N/2 + 1` 个正弦波。其中 `Re X[k]` 存放余弦波的振幅，`Im X[k]` 存放正弦波的振幅，计算方式就是让时域信号分别与对应频率的余弦、正弦波做**相关性（Correlation）**累加。",
        "一定要注意一个核心事实：尽管这两个数组被命名为“实部（Real part）”和“虚部（Imaginary part）”，**公式里其实连一个虚数单位 `j` 的影子都没有**！这里用到的全是普通实数，归一化系数 `2/N` 也直接写进了正变换公式中。",
        "很多初学者容易混淆：如果我们手动给 `Im X[k]` 乘上一个 `j` 并加到 `Re X[k]` 上，写成 `Re X[k] + j·Im X[k]`，这算不算“复数 DFT”？**绝对不算！** 这只是在用复数做符号代换（Substitution），本质上依然是“带有复数代换的实数 DFT”。"
      ],
      "formula": {
        "expr": "Re X[k] = (2/N) Σ_{n=0}^{N-1} x[n] cos(2πkn/N) ,    Im X[k] = -(2/N) Σ_{n=0}^{N-1} x[n] sin(2πkn/N)   (k = 0 ~ N/2)",
        "explain": "N 为时域采样点数；k 为频率索引（从 0 到 N/2）；Re X[k] 与 Im X[k] 分别为第 k 个余弦基与正弦基的相关幅度；系数 2/N 为归一化因子（也可放在逆变换或单独步骤中）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：实数 DFT 的相关分解、听感与“复数代换”真相",
      "instruction": "拖动频率索引 k 与相位滑块，观察左图时域波形如何由余弦与正弦分量合成，右图展示实数频谱 ReX[k] / ImX[k]；开启“显示复数代换视角”看 j 如何只是被强行贴上去的标签，并可点击播放实时合成音。",
      "controls": [
        {
          "type": "slider",
          "id": "kFreq",
          "label": "频率索引 k",
          "min": 1,
          "max": 7,
          "step": 1,
          "value": 2,
          "unit": " 次谐波"
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "信号相位 φ",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 45,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showComplexSub",
          "label": "显示“复数代换”贴标签视角",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 16;\nvar audioCtx = null;\nvar osc = null;\nvar gainNode = null;\n\nfunction ensureAudio(active, freqHz) {\n  if (active) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      osc.type = 'sine';\n      gainNode.gain.setValueAtTime(0.14, audioCtx.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n    osc.frequency.setTargetAtTime(freqHz, audioCtx.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(0.14, audioCtx.currentTime, 0.02);\n  } else if (gainNode && audioCtx) {\n    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var k0 = lab.values.kFreq;\n  var phi = lab.values.phase * Math.PI / 180;\n  var showSub = lab.values.showComplexSub;\n\n  ensureAudio(lab.values.play, k0 * 110);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var x = [];\n  for (var n = 0; n < N; n++) {\n    x.push(Math.cos(2 * Math.PI * k0 * n / N - phi));\n  }\n\n  var re = [];\n  var im = [];\n  for (var k = 0; k <= N / 2; k++) {\n    var sr = 0, si = 0;\n    for (var n = 0; n < N; n++) {\n      var ang = 2 * Math.PI * k * n / N;\n      sr += x[n] * Math.cos(ang);\n      si += x[n] * Math.sin(ang);\n    }\n    re.push((2 / N) * sr);\n    im.push((-2 / N) * si);\n  }\n\n  var lx = 24, ly = 28, lw = 310, lh = 186;\n  var midY = ly + lh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = ly + (lh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域信号 x[n] (N=16) 及正余弦合成', lx, 18);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var px = 0; px <= lw; px += 2) {\n    var t = (px / lw) * N;\n    var val = re[k0] * Math.cos(2 * Math.PI * k0 * t / N);\n    var py = midY - val * (lh * 0.4);\n    if (px === 0) ctx.moveTo(lx + px, py); else ctx.lineTo(lx + px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n  ctx.beginPath();\n  for (var px = 0; px <= lw; px += 2) {\n    var t = (px / lw) * N;\n    var val = -im[k0] * Math.sin(2 * Math.PI * k0 * t / N);\n    var py = midY - val * (lh * 0.4);\n    if (px === 0) ctx.moveTo(lx + px, py); else ctx.lineTo(lx + px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var px = 0; px <= lw; px += 2) {\n    var t = (px / lw) * N;\n    var val = Math.cos(2 * Math.PI * k0 * t / N - phi);\n    var py = midY - val * (lh * 0.4);\n    if (px === 0) ctx.moveTo(lx + px, py); else ctx.lineTo(lx + px, py);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var sx = lx + (n / N) * lw;\n    var sy = midY - x[n] * (lh * 0.4);\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath(); ctx.arc(sx, sy, 3.2, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('--- 余弦分量 ReX', lx, H - 8);\n  ctx.fillStyle = '#ec4899'; ctx.fillText('--- 正弦分量 -ImX', lx + 115, H - 8);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 合成波形 x[n]', lx + 230, H - 8);\n\n  var rx = 368, ry = 28, rw = 328, rh = 186;\n  var rMidY = ry + rh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(rx, rMidY); ctx.lineTo(rx + rw, rMidY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(showSub ? '复数代换视角: 强行拼成 ReX[k] + j·ImX[k]' : '纯实数 DFT 频谱 (k = 0 ~ 8, 无任何 j)', rx, 18);\n\n  var plotW = showSub ? 205 : rw;\n  var stepX = plotW / (N / 2 + 1);\n  for (var k = 0; k <= N / 2; k++) {\n    var bx = rx + k * stepX + 6;\n    var reH = re[k] * (rh * 0.42);\n    var imH = im[k] * (rh * 0.42);\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(bx, reH >= 0 ? rMidY - reH : rMidY, 7, Math.abs(reH) || 1);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillRect(bx + 8, imH >= 0 ? rMidY - imH : rMidY, 7, Math.abs(imH) || 1);\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(k), bx + 4, ry + rh + 12);\n  }\n\n  if (showSub) {\n    var cx = rx + 266, cy = rMidY, rad = 52;\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath(); ctx.arc(cx, cy, rad, 0, Math.PI * 2); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(cx - rad - 8, cy); ctx.lineTo(cx + rad + 8, cy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(cx, cy - rad - 8); ctx.lineTo(cx, cy + rad + 8); ctx.stroke();\n    var vx = cx + re[k0] * rad;\n    var vy = cy - im[k0] * rad;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(vx, vy); ctx.stroke();\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(vx, vy, 4, 0, Math.PI * 2); ctx.fill();\n    ctx.font = '10px sans-serif';\n    ctx.fillText('Re', cx + rad + 2, cy - 4);\n    ctx.fillText('j·Im', cx + 4, cy - rad - 4);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText('仅代表关系，禁止乘除!', cx - 54, ry + rh + 12);\n  }\n\n  lab.setReadout('k=' + k0 + ' (' + (k0 * 110) + ' Hz) | ReX[' + k0 + '] = ' + re[k0].toFixed(3) + ' | ImX[' + k0 + '] = ' + im[k0].toFixed(3) + (showSub ? ' | 代换表示: ' + re[k0].toFixed(2) + (im[k0] >= 0 ? ' + j' : ' - j') + Math.abs(im[k0]).toFixed(2) : ' | 纯实数相关运算'));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "数学上的第一大尴尬：只是“代表”，而非“相等”",
      "paragraphs": [
        "实数 DFT 虽然在很多工程计算里够用了，但在数学上却有三大难以忍受的别扭之处。**第一大尴尬，就是它只能通过“代换（Substitution）”来借用复数。**",
        "这会让数学家浑身难受：数学追求的是“**这个等于那个（this equals that）**”，而不是“**这个代表那个（this represents that）**”。两者有着天壤之别。",
        "举个例子，假如我们手头有一个等式 `A = B`，我们瞬间就能推导出无数条千真万确的推论：`5A = 5B`、`1 + A = 1 + B`、`A/x = B/x`……人类四千年来积累的所有代数工具都能立刻拿来用！",
        "但如果我们只有一句声明“**A 代表 B**”，在没有额外规则的情况下，我们其实**什么也推不出来**！比如用复数来“代表”正弦波时，我们必须从零开始重新定义运算法则——通常我们允许两个复数相加减，但**严禁直接把它们相乘或相除**，因为代换关系在乘除法下会彻底失去物理意义。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "数学上的第二、三大尴尬：幽灵般的负频率与首尾特权点",
      "paragraphs": [
        "**第二大尴尬：对负频率（Negative Frequency）的处理极其笨拙。** 回顾第 10 章，任何正弦波或余弦波都可以等效地看成正频率或负频率。因为两种视角看起来一模一样，实数傅里叶变换干脆直接忽略了负频率。",
        "然而在许多关键场景下，负频率分量会被强行“推挤”进正频率区域——**幽灵化作了人形（The ghosts take human form）**！这就是**混叠（Aliasing）**、**圆周卷积（Circular Convolution）**和**幅度调制（Amplitude Modulation）**中发生的事情。因为实数 DFT 体系里没有负频率的位置，它在分析这些现象时显得捉襟见肘。",
        "**第三大尴尬：频谱首尾两点 `Re X[0]` 和 `Re X[N/2]` 的特殊待遇。** 对一个 `N` 点信号做实数 DFT 后，我们得到 `k = 0 ~ N/2` 的频谱，但注意：**这些数值并不能直接用来重建时域波形！**",
        "在由频域重建回时域时，**第 0 点（直流分量 `Re X[0]`）和最后一点（奈奎斯特频率 `Re X[N/2]`）必须先除以 2**（可对照 Eq. 8-3 回忆一下）。在代码里加个 `if` 判断固然轻松，但要在白纸上做公式推导，这种“首尾搞特殊”的例外条款简直是一场噩梦。"
      ],
      "formula": {
        "expr": "x[n] = (Re X[0] / 2) + Σ_{k=1}^{N/2 - 1} ( Re X[k] cos(2πkn/N) - Im X[k] sin(2πkn/N) ) + (Re X[N/2] / 2) cos(πn)",
        "explain": "实数 DFT 的综合（逆变换）公式：中间所有频率 k=1 ~ N/2-1 直接使用 ReX[k] 与 ImX[k]，唯有首点 k=0（直流）和尾点 k=N/2（奈奎斯特频率）必须额外除以 2。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：首尾除以 2 陷阱与“负频率幽灵”混叠听觉演示",
      "instruction": "取消勾选“修正首尾除以 2”，观察左图重建波形为何暴走；拖动“试探频率 k”超过奈奎斯特边界 N/2=8，观察右图负频率幽灵如何折返进正频谱，并开启声音亲耳聆听音高先升后降的混叠奇观！",
      "controls": [
        {
          "type": "slider",
          "id": "dcAmp",
          "label": "直流分量 (k=0)",
          "min": -0.8,
          "max": 0.8,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nyqAmp",
          "label": "奈奎斯特分量 (k=8)",
          "min": -0.8,
          "max": 0.8,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "fixEdge",
          "label": "修正首尾两点除以 2",
          "value": true
        },
        {
          "type": "slider",
          "id": "testFreq",
          "label": "试探频率 k (N=16)",
          "min": 1,
          "max": 14,
          "step": 0.5,
          "value": 3,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "playAlias",
          "label": "▶ 听混叠后音高",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 16;\nvar audioCtx = null;\nvar osc = null;\nvar gainNode = null;\n\nfunction ensureAudio(active, freqHz) {\n  if (active) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      osc.type = 'sine';\n      gainNode.gain.setValueAtTime(0.12, audioCtx.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n    osc.frequency.setTargetAtTime(freqHz, audioCtx.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.02);\n  } else if (gainNode && audioCtx) {\n    gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var dc = lab.values.dcAmp;\n  var nyq = lab.values.nyqAmp;\n  var fix = lab.values.fixEdge;\n  var tf = lab.values.testFreq;\n\n  var folded = tf <= 8 ? tf : 16 - tf;\n  ensureAudio(lab.values.playAlias, folded * 90);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var xOrig = [];\n  var xRec = [];\n  for (var n = 0; n < N; n++) {\n    var origVal = dc + nyq * Math.cos(Math.PI * n) + 0.5 * Math.cos(2 * Math.PI * 2 * n / N);\n    xOrig.push(origVal);\n    var edgeFactor = fix ? 1 : 2;\n    var recVal = edgeFactor * dc + edgeFactor * nyq * Math.cos(Math.PI * n) + 0.5 * Math.cos(2 * Math.PI * 2 * n / N);\n    xRec.push(recVal);\n  }\n\n  var lx = 20, ly = 28, lw = 315, lh = 180;\n  var lMid = ly + lh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = ly + (lh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('左图: ReX[0]与ReX[8] 首尾除以2对比 (N=16)', lx, 18);\n\n  var scaleY = lh * 0.22;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = lx + (n / (N - 1)) * lw;\n    var py = lMid - xOrig[n] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = fix ? '#38bdf8' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.setLineDash(fix ? [3, 3] : []);\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = lx + (n / (N - 1)) * lw;\n    var py = lMid - xRec[n] * scaleY;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 真实原信号 x[n]', lx, H - 8);\n  ctx.fillStyle = fix ? '#38bdf8' : '#ec4899';\n  ctx.fillText(fix ? '-- 已除以2重建 (完全吻合)' : '— 未除以2重建 (首尾分量翻倍!)', lx + 125, H - 8);\n\n  var rx = 365, ry = 28, rw = 335, rh = 180;\n  var baseY = ry + rh - 24;\n  var mapX = function(k) { return rx + ((k + 15) / 30) * rw; };\n\n  ctx.fillStyle = 'rgba(16,185,129,0.09)';\n  ctx.fillRect(mapX(0), ry, mapX(8) - mapX(0), baseY - ry);\n  ctx.strokeStyle = 'rgba(16,185,129,0.4)';\n  ctx.strokeRect(mapX(0), ry, mapX(8) - mapX(0), baseY - ry);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(rx, baseY); ctx.lineTo(rx + rw, baseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(mapX(0), ry); ctx.lineTo(mapX(0), baseY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('右图: 负频率幽灵显形 (绿框=实数DFT 0~8)', rx, 18);\n\n  var barH = 95;\n  var posX = mapX(tf);\n  var negX = mapX(-tf);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 3;\n  ctx.beginPath(); ctx.moveTo(posX, baseY); ctx.lineTo(posX, baseY - barH); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(posX, baseY - barH, 4, 0, Math.PI * 2); ctx.fill();\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n  ctx.lineWidth = 2.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(negX, baseY); ctx.lineTo(negX, baseY - barH); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(negX, baseY - barH, 3.5, 0, Math.PI * 2); ctx.fill();\n\n  if (tf > 8) {\n    var aliasX = mapX(folded);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 3;\n    ctx.beginPath(); ctx.moveTo(aliasX, baseY); ctx.lineTo(aliasX, baseY - barH); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(aliasX, baseY - barH, 4.5, 0, Math.PI * 2); ctx.fill();\n\n    ctx.strokeStyle = 'rgba(236,72,153,0.7)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(negX, baseY - barH);\n    ctx.quadraticCurveTo(mapX(0), ry + 4, aliasX, baseY - barH);\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('负频率折返至 k=' + folded.toFixed(1), aliasX - 36, baseY - barH - 8);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('-15', mapX(-15) - 6, baseY + 13);\n  ctx.fillText('-8', mapX(-8) - 5, baseY + 13);\n  ctx.fillText('0', mapX(0) - 3, baseY + 13);\n  ctx.fillText('8(N/2)', mapX(8) - 14, baseY + 13);\n  ctx.fillText('15', mapX(15) - 8, baseY + 13);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText(tf > 8 ? '幽灵越界! -k + N 闯入实数频谱' : '当前试探频率在正常范围 (k ≤ N/2)', rx, H - 8);\n\n  lab.setReadout('试探 k=' + tf.toFixed(1) + ' -> 实数DFT观测频率=' + folded.toFixed(1) + ' (' + Math.round(folded * 90) + ' Hz) | ' + (fix ? '首尾已除以2 (重建误差=0)' : '警告: 未除以2, ReX[0]与ReX[8]翻倍!'));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看清本质：实数 DFT 公式里没有半个虚数 j，即使手动把 ImX[k] 乘上 j 加到 ReX[k] 上，那也只是“复数代换表示”，而不是真正的复数 DFT。",
        "代数禁区：由于“代表”不等于“相等”，在复数代换视角下可以做加减法，但严禁直接对复数频谱做乘除运算，除非使用基于欧拉公式建立数学等价的复数 DFT。",
        "代码防坑：使用实数 DFT 重建时域信号（或计算真实正弦振幅）时，千万别忘了把直流项 ReX[0] 和奈奎斯特项 ReX[N/2] 除以 2。",
        "为什么需要复数 DFT：它用欧拉公式让复数与正余弦真正“数学相等”，并自然地同时容纳正频率与负频率，一举消除上述三大尴尬。"
      ]
    }
  ]
});
