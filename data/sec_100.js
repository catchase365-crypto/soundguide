window.__BOOK_REGISTER_SECTION__("sec_100", {
  "title": "相位谱中的 ±π 锯齿毛刺 (Nuisance 7: Spikes between π and -π)",
  "intuition": "+π 和 -π 在圆周上是同一个点，虚部微小的舍入噪声会触发相位计算函数在两者间疯狂“反复横跳”，制造出根本不存在的假性剧烈跳变。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么平缓的频谱会在 ±π 之间疯狂“劈叉”？",
      "paragraphs": [
        "在离散傅里叶变换（DFT）的极坐标表示中，第 `k` 个频率分量的相位是由反正切函数计算出来的：如果复数向量落在**负实轴**上（即实部 `Re X[k] < 0` 且虚部 `Im X[k] = 0`，例如图 8-13 中实偶对称信号的频谱过零翻负区间），它对应的真实相移就是 `180°`（也就是 `π` 弧度）。",
        "问题在于，计算机做浮点运算时无法得到绝对精确的 `0`，虚部总会带有微乎其微的**舍入噪声（Round-off Noise）**，比如 `+1e-15` 或 `-1e-15`。",
        "当 `Re X[k] < 0` 时，只要虚部在 `0` 附近轻轻晃动一下符号，相位计算函数 `atan2(Im, Re)` 就会像踩到分支切割线一样发生**瞬间瞬移**：`+1e-15` 算出 `+π (+3.14159)`，而 `-1e-15` 立刻算出 `-π (-3.14159)`！反映在图 8-13d 的相位谱上，就是原本平滑的直线突然分裂成在 `+π` 和 `-π` 之间上下剧烈震荡的“方波毛刺”。"
      ],
      "formula": {
        "expr": "Phase X[k] = atan2(Im X[k] + ε, Re X[k])",
        "explain": "Re X[k] 为负实部，ε 为接近 0 的正负浮点舍入噪声。当 Re < 0 时，ε 的微小正负号变化会导致输出在 +π 与 -π 之间产生 2π 的剧烈假跳变。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复平面负实轴“走钢丝”与 ±π 瞬移观察",
      "instruction": "拖动「舍入噪声强度」滑块，观察左图复向量跨过负实轴分支线时，右图相位谱如何爆发出 ±π 锯齿毛刺；试着微调「虚部直流偏置」或开启「相位解卷绕」消除毛刺。",
      "controls": [
        {
          "type": "slider",
          "id": "noise",
          "label": "虚部舍入噪声 ε",
          "min": 0,
          "max": 0.1,
          "step": 0.005,
          "value": 0.02,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imBias",
          "label": "虚部微小偏置",
          "min": -0.05,
          "max": 0.05,
          "step": 0.005,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "unwrap",
          "label": "开启相位解卷绕 (Unwrap)",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction hash(i) {\n  var s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n  return (s - Math.floor(s)) * 2 - 1;\n}\n\nfunction draw() {\n  var noise = lab.values.noise;\n  var imBias = lab.values.imBias;\n  var unwrap = lab.values.unwrap;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var cx = 120;\n  var cy = 122;\n  var r = 82;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.arc(cx, cy, r, 0, Math.PI * 2);\n  ctx.moveTo(cx - r - 18, cy);\n  ctx.lineTo(cx + r + 18, cy);\n  ctx.moveTo(cx, cy - r - 18);\n  ctx.lineTo(cx, cy + r + 18);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(cx - r - 12, cy);\n  ctx.lineTo(cx, cy);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('复平面 (Re < 0 分支线)', 38, 20);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('+π (上方)', cx - r - 16, cy - 10);\n  ctx.fillText('-π (下方)', cx - r - 16, cy + 18);\n\n  var N = 80;\n  var res = [];\n  var ims = [];\n  var rawPhases = [];\n  var spikeCount = 0;\n\n  for (var i = 0; i < N; i++) {\n    var f = (i / (N - 1)) * 0.5;\n    var x = f * 48;\n    var re = (x === 0) ? 2 : (2 * Math.sin(x) / x);\n    var im = imBias + (noise > 0 ? hash(i) * noise : 0);\n    var ph = Math.atan2(im, re);\n    res.push(re);\n    ims.push(im);\n    rawPhases.push(ph);\n    if (i > 0 && Math.abs(ph - rawPhases[i - 1]) > 4.5) {\n      spikeCount++;\n    }\n  }\n\n  var plotPhases = [];\n  for (var j = 0; j < N; j++) {\n    if (!unwrap || j === 0) {\n      plotPhases.push(rawPhases[j]);\n    } else {\n      var prev = plotPhases[j - 1];\n      var curr = rawPhases[j];\n      while (curr - prev > Math.PI) curr -= 2 * Math.PI;\n      while (curr - prev < -Math.PI) curr += 2 * Math.PI;\n      plotPhases.push(curr);\n    }\n  }\n\n  for (var k = 0; k < N; k++) {\n    if (res[k] < 0) {\n      var mag = Math.sqrt(res[k] * res[k] + ims[k] * ims[k]);\n      var nx = (res[k] / mag) * r;\n      var ny = -(ims[k] / mag) * r;\n      ctx.fillStyle = rawPhases[k] >= 0 ? '#38bdf8' : '#ec4899';\n      ctx.beginPath();\n      ctx.arc(cx + nx, cy + ny, 3, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  var gx = 265;\n  var gy = 28;\n  var gw = 430;\n  var gh = 190;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  function yForVal(val) {\n    return gy + gh / 2 - (val / 4.2) * (gh / 2);\n  }\n\n  var yZero = yForVal(0);\n  var yPi = yForVal(Math.PI);\n  var yNegPi = yForVal(-Math.PI);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(gx, yZero);\n  ctx.lineTo(gx + gw, yZero);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  ctx.moveTo(gx, yPi);\n  ctx.lineTo(gx + gw, yPi);\n  ctx.moveTo(gx, yNegPi);\n  ctx.lineTo(gx + gw, yNegPi);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px monospace';\n  ctx.fillText('+π', gx - 22, yPi + 4);\n  ctx.fillText('-π', gx - 22, yNegPi + 4);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0', gx - 16, yZero + 4);\n\n  ctx.strokeStyle = 'rgba(16,185,129,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var m = 0; m < N; m++) {\n    var px = gx + (m / (N - 1)) * gw;\n    var py = yForVal(res[m] * 1.5);\n    if (m === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = unwrap ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var sx = gx + (n / (N - 1)) * gw;\n    var sy = yForVal(plotPhases[n]);\n    if (n === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  for (var p = 0; p < N; p++) {\n    var dx = gx + (p / (N - 1)) * gw;\n    var dy = yForVal(plotPhases[p]);\n    ctx.fillStyle = unwrap ? '#10b981' : (plotPhases[p] >= 0 ? '#38bdf8' : '#ec4899');\n    ctx.fillRect(dx - 2, dy - 2, 4, 4);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('相位谱 Phase X[k] (淡绿背景线为实部 Re)', gx, 18);\n\n  lab.setReadout('检测到 ±π 剧烈跳变次数: ' + (unwrap ? '0 (已被 Unwrap 抹平)' : spikeCount + ' 次') + ' | 虚部噪声 ε = ' + noise.toFixed(3) + ' | 偏置 = ' + imBias.toFixed(3));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "别被图像骗了：为什么说这种“不连续”是纯属幻觉？",
      "paragraphs": [
        "正如 Steven W. Smith 在书中提醒的那样：**“Don't be fooled, the phase isn't really this discontinuous.”**（别被骗了，相位其实并没有真的不连续。）",
        "从几何与三角恒等式来看，向前旋转 `180°`（`+π`）和向后旋转 `180°`（`-π`）最终到达的是圆周上的**同一个物理位置**。代入余弦信号中更是完全等价：`cos(ωt + π) = cos(ωt - π) = -cos(ωt)`。",
        "也就是说，尽管相位谱上的点在 `+3.14` 和 `-3.14` 之间上蹿下跳，但由它合成出来的**时域波形以及你耳朵听到的声音，与一条平平滑滑的直线没有任何区别**！真正需要注意区分的是 **0 与 π 之间的跳变**（那意味着信号反相，会产生真实破坏），而不是 **+π 与 -π 之间的跳变**。"
      ],
      "formula": {
        "expr": "cos(ωt + π) ≡ cos(ωt - π) ≡ -cos(ωt)",
        "explain": "相位差刚好为 2π 时，正弦/余弦波在时域上完全重合，因此 ±π 跳变不会引起任何物理波形撕裂或听觉异响。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：±π 假跳变 vs 0/π 真跳变的波形与听感实测",
      "instruction": "开启上方音频按钮，对比「±π 舍入噪声跳变」与「真实 0/π 相位反转」下的时域波形和耳朵听到的声音差异。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号频率",
          "min": 110,
          "max": 440,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "pmPi",
          "label": "开启 ±π 舍入跳变 (假跳变)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "realJump",
          "label": "对比：真实 0/π 相位跳变",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 停止音频"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioCtx = null;\nvar osc = null;\nvar gainNode = null;\nvar curFrame = 0;\n\nfunction getFramePhase(idx) {\n  if (lab.values.realJump) {\n    return (idx % 2 === 0) ? 0 : Math.PI;\n  }\n  if (lab.values.pmPi) {\n    return (idx % 2 === 0) ? Math.PI : -Math.PI;\n  }\n  return Math.PI;\n}\n\nfunction syncAudio() {\n  var wantPlay = !!lab.values.play;\n  if (wantPlay && !osc) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    osc = audioCtx.createOscillator();\n    gainNode = audioCtx.createGain();\n    osc.type = 'sine';\n    osc.frequency.value = lab.values.freq;\n    gainNode.gain.value = -0.18;\n    osc.connect(gainNode);\n    gainNode.connect(audioCtx.destination);\n    osc.start();\n  } else if (!wantPlay && osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n    gainNode = null;\n  }\n  if (osc && audioCtx) {\n    osc.frequency.setTargetAtTime(lab.values.freq, audioCtx.currentTime, 0.015);\n  }\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  var N = 24;\n\n  var px = 35, py = 32, pw = 245, ph = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, py, pw, ph);\n\n  function mapPhaseY(val) {\n    return py + ph / 2 - (val / 3.8) * (ph / 2);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath();\n  ctx.moveTo(px, mapPhaseY(0));\n  ctx.lineTo(px + pw, mapPhaseY(0));\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText('+π', px - 22, mapPhaseY(Math.PI) + 4);\n  ctx.fillText('0', px - 16, mapPhaseY(0) + 4);\n  ctx.fillText('-π', px - 22, mapPhaseY(-Math.PI) + 4);\n\n  var scanX = px + (curFrame / (N - 1)) * pw;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(scanX, py);\n  ctx.lineTo(scanX, py + ph);\n  ctx.stroke();\n\n  var phaseColor = lab.values.realJump ? '#ec4899' : (lab.values.pmPi ? '#f59e0b' : '#38bdf8');\n  ctx.strokeStyle = phaseColor;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var x = px + (i / (N - 1)) * pw;\n    var y = mapPhaseY(getFramePhase(i));\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  for (var j = 0; j < N; j++) {\n    var dx = px + (j / (N - 1)) * pw;\n    var dy = mapPhaseY(getFramePhase(j));\n    ctx.fillStyle = (j === curFrame) ? '#f8fafc' : phaseColor;\n    ctx.fillRect(dx - 2.5, dy - 2.5, 5, 5);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('相位输入序列 (帧扫描)', px, 20);\n\n  var wx = 315, wy = 32, ww = 385, wh = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(wx, wy, ww, wh);\n  ctx.beginPath();\n  ctx.moveTo(wx, wy + wh / 2);\n  ctx.lineTo(wx + ww, wy + wh / 2);\n  ctx.stroke();\n\n  var waveColor = lab.values.realJump ? '#ec4899' : '#10b981';\n  ctx.strokeStyle = waveColor;\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var steps = 300;\n  var segs = 6;\n  for (var s = 0; s <= steps; s++) {\n    var t = s / steps;\n    var segIdx = Math.min(segs - 1, Math.floor(t * segs));\n    var phVal = getFramePhase(segIdx);\n    var amp = Math.cos(2 * Math.PI * 3 * t + phVal);\n    var sx = wx + t * ww;\n    var sy = wy + wh / 2 - amp * (wh * 0.38);\n    if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('合成时域波形 cos(ωt + φ)', wx, 20);\n\n  var statusText = lab.values.realJump\n    ? '状态：真实 0/π 相位反转 -> 波形撕裂，音频出现明显咔哒杂音！'\n    : (lab.values.pmPi\n      ? '状态：±π 疯狂跳变 -> cos(ωt+π) ≡ cos(ωt-π)，波形与声音 100% 平滑无损！'\n      : '状态：恒定 +π 相位 -> 纯净平滑余弦波');\n  lab.setReadout(statusText + ' | 频率: ' + lab.values.freq + ' Hz');\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop(function(dt, timeSec) {\n  curFrame = Math.floor(timeSec * 10) % 24;\n  if (osc && gainNode && audioCtx) {\n    var target = lab.values.realJump ? ((curFrame % 2 === 0) ? 0.18 : -0.18) : -0.18;\n    gainNode.gain.setTargetAtTime(target, audioCtx.currentTime, 0.002);\n  }\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看到相位谱在 +π 和 -π 之间剧烈拉锯时，先检查对应频率的实部是否为负且虚部接近 0——十有八九只是浮点舍入噪声引起的“假跳变”，并非系统真的发生了相位突变。",
        "如果后续算法需要对相位谱做求导（例如计算群延迟 Group Delay）或直观绘图标注，务必先执行相位解卷绕（Unwrap，检测相邻点差值超过 π 就加减 2π），或者直接改用允许负值的“解卷绕幅度”（Unwrapped Magnitude）来规避分支切换。",
        "不要将 ±π 跳变与 0/π 跳变混为一谈：相差 2π（+π 变 -π）在物理和听觉上完全等价，而相差 π（0 变 π）则会彻底反转信号极性。"
      ]
    }
  ]
});
