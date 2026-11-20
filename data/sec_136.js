window.__BOOK_REGISTER_SECTION__("sec_136", {
  "title": "滑动平均滤波器的频率响应 (Frequency Response)",
  "intuition": "滑动平均是时域里的“平滑神器”，但一旦切换到频域视角，它滚降缓慢且阻带漏水严重，是一个极其糟糕的低通滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从矩形脉冲到 Sinc 振荡：公式 15-2 的物理真相",
      "paragraphs": [
        "在时域中，一个 `M` 点滑动平均滤波器的脉冲响应（滤波器核）是一个长度为 `M`、高度为 `1/M` 的**矩形脉冲**。根据第 11 章傅里叶变换的对称性，时域里的“方波/矩形脉冲”，经过傅里叶变换来到频域后，必然会变成无限延伸、上下振荡的 **Sinc 形状曲线**。",
        "为了直观查看各个频率分量的通过比例，工程上通常画出它的幅频响应 `|H[f]|`（如图 15-2 所示，将负半周翻折为正值）。你会发现，虽然直流分量（`f = 0`）可以 100% 无损通过，但随着频率升高，响应曲线并没有干脆利落地跌到零，而是像拍皮球一样在零点之后反复反弹出一个个“旁瓣”。",
        "值得注意的是公式中的**归一化频率 `f`**：它的范围是 `0` 到 `0.5`，其中 `0.5` 代表数字信号处理中的极限频率——**奈奎斯特频率**（即采样率的一半 `fs / 2`）。当 `f = 0` 时，公式会出现 `0 / 0` 的不定式，此时由极限直接规定 `H[0] = 1`。"
      ],
      "formula": {
        "expr": "H[f] = sin(π · f · M) / (M · sin(π · f)),  0 < f ≤ 0.5;   H[0] = 1",
        "explain": "H[f] 为频率 f 处的幅度增益（幅频响应通常取绝对值 |H[f]|）；M 为滑动平均的窗口点数（滤波器核长度）；f 为归一化数字频率，取值范围为 0（直流）到 0.5（奈奎斯特频率 fs/2）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：透视公式 15-2——为什么增大 M 也救不了阻带？",
      "instruction": "拖动“滤波器点数 M”滑块，观察主瓣如何变窄，以及右侧“阻带旁瓣”为何始终居高不下；可切换“绝对值/带符号”模式看清相位反转。",
      "controls": [
        {
          "type": "slider",
          "id": "mPoints",
          "label": "滤波器点数 M",
          "min": 3,
          "max": 51,
          "step": 2,
          "value": 11,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "叠加 3 点与 31 点参考线",
          "value": true
        },
        {
          "type": "toggle",
          "id": "absMode",
          "label": "幅频响应 |H[f]| (同原书图 15-2)",
          "value": true
        }
      ],
      "jsCode": "var padL = 54, padR = 24, padT = 22, padB = 34;\nvar pw = lab.width - padL - padR;\nvar ph = lab.height - padT - padB;\n\nfunction calcH(f, M) {\n  if (f < 1e-6) return 1.0;\n  var num = Math.sin(Math.PI * f * M);\n  var den = M * Math.sin(Math.PI * f);\n  return Math.abs(den) < 1e-9 ? 1.0 : num / den;\n}\n\nfunction drawCurve(M, color, width, dashed, absMode, yMin, yMax) {\n  var ctx = lab.ctx;\n  ctx.save();\n  ctx.strokeStyle = color;\n  ctx.lineWidth = width;\n  if (dashed) ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  var steps = 400;\n  for (var i = 0; i <= steps; i++) {\n    var f = (i / steps) * 0.5;\n    var v = calcH(f, M);\n    if (absMode) v = Math.abs(v);\n    var x = padL + (f / 0.5) * pw;\n    var y = padT + (1 - (v - yMin) / (yMax - yMin)) * ph;\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n}\n\nfunction render() {\n  var ctx = lab.ctx;\n  var M = lab.values.mPoints;\n  var showRef = lab.values.showRef;\n  var absMode = lab.values.absMode;\n  var yMin = absMode ? 0.0 : -0.35;\n  var yMax = 1.15;\n\n  ctx.clearRect(0, 0, lab.width, lab.height);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n\n  for (var f = 0; f <= 0.501; f += 0.1) {\n    var x = padL + (f / 0.5) * pw;\n    ctx.beginPath();\n    ctx.moveTo(x, padT);\n    ctx.lineTo(x, padT + ph);\n    ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(f.toFixed(1), x, padT + ph + 16);\n  }\n  ctx.fillText('归一化频率 f (0 ~ 0.5 fs)', padL + pw / 2, lab.height - 4);\n\n  var yTicks = absMode ? [0, 0.2, 0.4, 0.6, 0.8, 1.0] : [-0.2, 0, 0.2, 0.4, 0.6, 0.8, 1.0];\n  for (var i = 0; i < yTicks.length; i++) {\n    var val = yTicks[i];\n    var y = padT + (1 - (val - yMin) / (yMax - yMin)) * ph;\n    ctx.strokeStyle = val === 0 ? 'rgba(255,255,255,0.28)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(padL, y);\n    ctx.lineTo(padL + pw, y);\n    ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(val.toFixed(1), padL - 8, y + 4);\n  }\n\n  if (showRef) {\n    drawCurve(3, 'rgba(56,189,248,0.55)', 1.5, true, absMode, yMin, yMax);\n    drawCurve(31, 'rgba(245,158,11,0.55)', 1.5, true, absMode, yMin, yMax);\n  }\n\n  drawCurve(M, '#10b981', 2.6, false, absMode, yMin, yMax);\n\n  var fZero = 1 / M;\n  var maxSide = 0;\n  for (var j = 0; j <= 500; j++) {\n    var ff = fZero + (j / 500) * (0.5 - fZero);\n    if (ff <= 0.5) {\n      var a = Math.abs(calcH(ff, M));\n      if (a > maxSide) maxSide = a;\n    }\n  }\n\n  if (fZero <= 0.5) {\n    var zx = padL + (fZero / 0.5) * pw;\n    var zy = padT + (1 - (0 - yMin) / (yMax - yMin)) * ph;\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath();\n    ctx.arc(zx, zy, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.textAlign = 'left';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('第一零点 1/M = ' + fZero.toFixed(3), Math.min(zx + 6, lab.width - 140), zy - 8);\n  }\n\n  if (maxSide > 0) {\n    var sy = padT + (1 - (maxSide - yMin) / (yMax - yMin)) * ph;\n    ctx.save();\n    ctx.strokeStyle = 'rgba(236,72,153,0.6)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(padL, sy);\n    ctx.lineTo(padL + pw, sy);\n    ctx.stroke();\n    ctx.restore();\n    ctx.fillStyle = '#ec4899';\n    ctx.textAlign = 'right';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('最大旁瓣泄漏: ' + (maxSide * 100).toFixed(1) + '%', padL + pw - 6, sy - 6);\n  }\n\n  if (showRef) {\n    ctx.textAlign = 'left';\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('-- 3 点参考', padL + pw - 165, padT + 14);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('-- 31 点参考', padL + pw - 85, padT + 14);\n  }\n\n  var db = maxSide > 0 ? (20 * Math.log10(maxSide)).toFixed(1) : '-∞';\n  lab.setReadout('当前点数 M = ' + M + ' | 首个零点 f = ' + fZero.toFixed(3) + ' | 阻带最高旁瓣 = ' + (maxSide * 100).toFixed(1) + '% (' + db + ' dB)');\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "时域与频域的跷跷板：两大频域硬伤",
      "paragraphs": [
        "作者史蒂文·史密斯（Steven W. Smith）对滑动平均滤波器的频域表现给出了毫不留情的评价：**滚降非常缓慢（slow roll-off），且阻带衰减惨不忍睹（ghastly stopband attenuation）**。",
        "为什么会这样？第一，**滚降缓慢**：从通带（增益接近 1）过渡到阻带（增益接近 0）的斜坡拖得很长，无法像锐利的低通滤波器那样在一小段频率内“一刀切”。第二，**阻带严重漏水**：即使你把窗口 `M` 加大到 31 点甚至 101 点，第一个零点 `f = 1/M` 确实向左移动了，但紧接着它的第一个旁瓣峰值永远收敛在 `2 / (3π) ≈ 21.2%`（约 `-13.5 dB`）附近！这意味着超过 **1/5 幅度的高频干扰** 会大摇大摆地穿透滤波器。",
        "这背后隐藏着信号处理最核心的铁律之一——**时频对偶性（不确定性原理的体现）**：**在时域中表现极其优秀的特性，必然导致在频域中表现极差，反之亦然**。滑动平均的矩形核没有负权重、步长响应笔直干脆，因此是**顶级的时域平滑滤波器**（擅长压制随机白噪声、保留陡峭阶跃）；但如果你指望用它把两个相邻频段的信号分离开（比如把 100 Hz 信号和 300 Hz 干扰彻底切开），它几乎无能为力——它是一个**极差的低通滤波器**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：听觉实战——滑动平均真能滤掉高频啸叫吗？",
      "instruction": "点击“播放对比音频”，先听清低频主信号(120Hz)与高频干扰的混合声；拖动“干扰频率”或“点数 M”，听听为什么干扰声经常在旁瓣处“死灰复燃”！",
      "controls": [
        {
          "type": "slider",
          "id": "mPoints",
          "label": "滑动平均点数 M",
          "min": 1,
          "max": 35,
          "step": 1,
          "value": 11,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "toneFreq",
          "label": "高频干扰位置 f",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.14,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "filterOn",
          "label": "开启滑动平均滤波",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var phase = 0;\nvar fLow = 0.03;\nvar fsAudio = 4000;\nvar audio = { ctx: null, oscLow: null, oscHigh: null, gLow: null, gHigh: null, master: null };\n\nfunction calcH(f, M) {\n  if (M <= 1 || f < 1e-6) return 1.0;\n  var num = Math.sin(Math.PI * f * M);\n  var den = M * Math.sin(Math.PI * f);\n  return Math.abs(den) < 1e-9 ? 1.0 : num / den;\n}\n\nfunction syncAudio() {\n  var playing = lab.values.play;\n  if (!playing && !audio.ctx) return;\n  var ctx = lab.getAudioContext();\n  if (!ctx) return;\n  if (playing && ctx.state === 'suspended') ctx.resume();\n\n  if (audio.ctx !== ctx) {\n    audio.ctx = ctx;\n    audio.oscLow = ctx.createOscillator();\n    audio.oscHigh = ctx.createOscillator();\n    audio.gLow = ctx.createGain();\n    audio.gHigh = ctx.createGain();\n    audio.master = ctx.createGain();\n    audio.master.gain.value = 0;\n    audio.oscLow.type = 'sine';\n    audio.oscHigh.type = 'sine';\n    audio.oscLow.frequency.value = fLow * fsAudio;\n    audio.oscHigh.frequency.value = lab.values.toneFreq * fsAudio;\n    audio.oscLow.connect(audio.gLow);\n    audio.oscHigh.connect(audio.gHigh);\n    audio.gLow.connect(audio.master);\n    audio.gHigh.connect(audio.master);\n    audio.master.connect(ctx.destination);\n    audio.oscLow.start();\n    audio.oscHigh.start();\n  }\n\n  var now = ctx.currentTime;\n  var M = lab.values.mPoints;\n  var fHigh = lab.values.toneFreq;\n  var on = lab.values.filterOn;\n  var hLow = on ? Math.abs(calcH(fLow, M)) : 1.0;\n  var hHigh = on ? Math.abs(calcH(fHigh, M)) : 1.0;\n\n  audio.oscHigh.frequency.setTargetAtTime(fHigh * fsAudio, now, 0.02);\n  audio.gLow.gain.setTargetAtTime(0.22 * hLow, now, 0.02);\n  audio.gHigh.gain.setTargetAtTime(0.22 * hHigh, now, 0.02);\n  audio.master.gain.setTargetAtTime(playing ? 1.0 : 0.0, now, 0.03);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var M = lab.values.mPoints;\n  var fHigh = lab.values.toneFreq;\n  var on = lab.values.filterOn;\n  ctx.clearRect(0, 0, lab.width, lab.height);\n\n  var x1 = 36, y1 = 28, w1 = 304, h1 = 176;\n  var x2 = 394, y2 = 28, w2 = 302, h2 = 176;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x1, y1, w1, h1);\n  ctx.strokeRect(x2, y2, w2, h2);\n\n  ctx.beginPath();\n  ctx.moveTo(x1, y1 + h1 / 2);\n  ctx.lineTo(x1 + w1, y1 + h1 / 2);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域波形：原始混合 vs 滤波输出', x1, 18);\n  ctx.fillText('频域响应 |H[f]| 与干扰频率落点', x2, 18);\n\n  var N = 100;\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var raw = 0.5 * Math.sin(2 * Math.PI * fLow * n + phase) + 0.5 * Math.sin(2 * Math.PI * fHigh * n + phase * 3);\n    var px = x1 + (n / (N - 1)) * w1;\n    var py = y1 + h1 / 2 - raw * (h1 * 0.42);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var out = 0;\n    var count = on ? M : 1;\n    for (var k = 0; k < count; k++) {\n      var idx = n - k;\n      out += 0.5 * Math.sin(2 * Math.PI * fLow * idx + phase) + 0.5 * Math.sin(2 * Math.PI * fHigh * idx + phase * 3);\n    }\n    out /= count;\n    var px = x1 + (n / (N - 1)) * w1;\n    var py = y1 + h1 / 2 - out * (h1 * 0.42);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= 240; i++) {\n    var f = (i / 240) * 0.5;\n    var g = on ? Math.abs(calcH(f, M)) : 1.0;\n    var fx = x2 + (f / 0.5) * w2;\n    var fy = y2 + (1 - g) * h2;\n    if (i === 0) ctx.moveTo(fx, fy); else ctx.lineTo(fx, fy);\n  }\n  ctx.stroke();\n\n  var gLow = on ? Math.abs(calcH(fLow, M)) : 1.0;\n  var gHigh = on ? Math.abs(calcH(fHigh, M)) : 1.0;\n\n  var lx = x2 + (fLow / 0.5) * w2;\n  var ly = y2 + (1 - gLow) * h2;\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(lx, ly, 4, 0, Math.PI * 2); ctx.fill();\n\n  var hx = x2 + (fHigh / 0.5) * w2;\n  var hy = y2 + (1 - gHigh) * h2;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(hx, y2); ctx.lineTo(hx, y2 + h2); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(hx, hy, 5.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (var ft = 0; ft <= 0.501; ft += 0.1) {\n    ctx.fillText(ft.toFixed(1), x2 + (ft / 0.5) * w2, y2 + h2 + 15);\n  }\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('主信号(120Hz)', x1 + 6, y1 + h1 + 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('干扰落点: ' + (gHigh * 100).toFixed(1) + '%', Math.min(hx + 8, x2 + w2 - 92), Math.max(hy - 8, y2 + 14));\n\n  var db = gHigh > 1e-4 ? (20 * Math.log10(gHigh)).toFixed(1) : '-80+';\n  lab.setReadout('主信号保留: ' + (gLow * 100).toFixed(1) + '% | 干扰(' + Math.round(fHigh * fsAudio) + 'Hz) 泄漏幅度: ' + (gHigh * 100).toFixed(1) + '% (' + db + ' dB)');\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  phase += dt * 3.0;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【选型避坑】如果你的需求是“压制随机白噪声、同时尽量不弄糊时域阶跃边缘”，滑动平均是绝对王者；但如果需求是“把特定高频干扰或邻近频段干净地切掉”，千万别用单次滑动平均。",
        "【不要盲目加大 M】增大滑动平均点数 M 只能把截止频率（第一零点 1/M）往左压，但阻带最高旁瓣永远卡在约 21%（-13.5 dB）左右——指望靠拉长窗口获得高阻带衰减是徒劳的。",
        "【巧用零点陷波】如果必须滤除单一固定频率的周期性干扰（例如已知工频干扰），可以刻意将窗口点数 M 设成干扰周期的整数倍，使其精确落在 Sinc 曲线的零点 f = k/M 上；但一旦干扰频率发生微小漂移，就会立刻滑上旁瓣重新泄漏。"
      ]
    }
  ]
});
