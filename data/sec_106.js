window.__BOOK_REGISTER_SECTION__("sec_106", {
  "title": "傅里叶变换的线性性质 (Linearity of the Fourier Transform)",
  "intuition": "在时域里把信号放大几倍或把几个信号直接相加，频域里也会发生完全同步的缩放与叠加——但前提是频谱必须使用直角坐标（实部与虚部），极坐标幅度绝对不能直接相加。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是线性？齐次性（缩放律）的跨坐标系表现",
      "paragraphs": [
        "如果一个变换同时满足**齐次性（Homogeneity）**和**可加性（Additivity）**，我们就称它是**线性的（Linear）**。傅里叶变换家族的全部四位成员——连续傅里叶变换（FT）、傅里叶级数（FS）、离散傅里叶变换（DFT）以及离散时间傅里叶变换（DTFT）——都严格遵守线性性质。",
        "**齐次性**的物理直觉非常直观：如果你把时域波形的振幅放大为原来的 `k` 倍，那么构成这个波形的所有正弦波和余弦波的振幅也必须同步放大 `k` 倍。",
        "但在具体计算频谱时，两种频域表示法的行为略有不同：\n1. **直角坐标（Rectangular）**：`k · X[f]` 意味着实部 `Re X[f]`（余弦分量）和虚部 `Im X[f]`（正弦分量）**同时乘以 `k`**。\n2. **极坐标（Polar）**：当缩放系数 `k > 0` 时，`k · X[f]` 意味着幅度谱 `Mag X[f]` **乘以 `k`**，而相位谱 `Phase X[f]` **保持完全不变**。"
      ],
      "formula": {
        "expr": "k · x[n]  ↔  k · X[f] = (k · Re X[f]) + j(k · Im X[f])",
        "explain": "x[n] 为时域信号，X[f] 为对应的频域频谱，k 为任意实数缩放常数，↔ 表示傅里叶变换对。"
      }
    },
    {
      "type": "lab",
      "heading": "齐次性微实验：时域缩放与双坐标系频谱联动",
      "instruction": "拖动「缩放系数 k」滑块观察时域波形与频谱的同步放大，点击「切换极坐标视图」对比幅度变化与相位不变性，并可开启声音听响度变化。",
      "controls": [
        {
          "type": "slider",
          "id": "scale",
          "label": "缩放系数 k",
          "min": 0.2,
          "max": 2,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "polar",
          "label": "切换极坐标视图 (Mag / Phase)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar osc1 = null;\nvar osc2 = null;\nvar gainNode = null;\nvar isPlaying = false;\n\nfunction syncAudio(k, play) {\n  if (play && !isPlaying) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') { ac.resume(); }\n    gainNode = ac.createGain();\n    gainNode.gain.setValueAtTime(k * 0.08, ac.currentTime);\n    gainNode.connect(ac.destination);\n    osc1 = ac.createOscillator();\n    osc1.type = 'sine';\n    osc1.frequency.setValueAtTime(220, ac.currentTime);\n    osc1.connect(gainNode);\n    osc1.start();\n    osc2 = ac.createOscillator();\n    osc2.type = 'sine';\n    osc2.frequency.setValueAtTime(495, ac.currentTime);\n    osc2.connect(gainNode);\n    osc2.start();\n    isPlaying = true;\n  } else if (play && isPlaying) {\n    var ac2 = lab.getAudioContext();\n    gainNode.gain.setTargetAtTime(k * 0.08, ac2.currentTime, 0.02);\n  } else if (!play && isPlaying) {\n    try {\n      osc1.stop();\n      osc2.stop();\n      osc1.disconnect();\n      osc2.disconnect();\n      gainNode.disconnect();\n    } catch (e) {}\n    osc1 = null;\n    osc2 = null;\n    gainNode = null;\n    isPlaying = false;\n  }\n}\n\nfunction drawGridBox(x, y, w, h, zeroY, title) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x, y, w, h);\n  ctx.beginPath();\n  ctx.moveTo(x, zeroY);\n  ctx.lineTo(x + w, zeroY);\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(title, x + 6, y + 14);\n}\n\nlab.onUpdate(function () {\n  var k = lab.values.scale;\n  var polar = lab.values.polar;\n  var play = lab.values.play;\n  syncAudio(k, play);\n  ctx.clearRect(0, 0, W, H);\n\n  var N = 64;\n  var samples = [];\n  for (var n = 0; n < N; n++) {\n    var t = n / N;\n    samples.push(k * (0.55 * Math.cos(2 * Math.PI * 4 * t - 0.6) + 0.45 * Math.cos(2 * Math.PI * 9 * t + 0.9)));\n  }\n\n  var tx = 28, ty = 22, tw = 300, th = 192, tMid = ty + th / 2;\n  drawGridBox(tx, ty, tw, th, tMid, '时域信号 k · x[n] (220Hz + 495Hz)');\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= 180; i++) {\n    var tt = i / 180;\n    var val = k * (0.55 * Math.cos(2 * Math.PI * 4 * tt - 0.6) + 0.45 * Math.cos(2 * Math.PI * 9 * tt + 0.9));\n    var px = tx + tt * tw;\n    var py = tMid - (val / 2.1) * (th * 0.44);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var maxBin = 13;\n  var reArr = [], imArr = [], magArr = [], phArr = [];\n  for (var m = 0; m <= maxBin; m++) {\n    var re = 0, im = 0;\n    for (var nn = 0; nn < N; nn++) {\n      var ang = 2 * Math.PI * m * nn / N;\n      re += samples[nn] * Math.cos(ang);\n      im -= samples[nn] * Math.sin(ang);\n    }\n    re = (2 / N) * re;\n    im = (2 / N) * im;\n    var mag = Math.sqrt(re * re + im * im);\n    var ph = mag > 0.02 ? Math.atan2(im, re) : 0;\n    reArr.push(re);\n    imArr.push(im);\n    magArr.push(mag);\n    phArr.push(ph);\n  }\n\n  var fx = 368, fw = 328;\n  var topY = 22, topH = 90, botY = 124, botH = 90;\n  if (!polar) {\n    drawGridBox(fx, topY, fw, topH, topY + topH / 2, '频域实部 Re X[f] (随 k 缩放)');\n    drawGridBox(fx, botY, fw, botH, botY + botH / 2, '频域虚部 Im X[f] (随 k 缩放)');\n    for (var b = 1; b <= maxBin; b++) {\n      var bx = fx + (b / (maxBin + 1)) * fw;\n      var ry = topY + topH / 2 - (reArr[b] / 1.2) * (topH * 0.42);\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 4;\n      ctx.beginPath();\n      ctx.moveTo(bx, topY + topH / 2);\n      ctx.lineTo(bx, ry);\n      ctx.stroke();\n\n      var iy = botY + botH / 2 - (imArr[b] / 1.2) * (botH * 0.42);\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 4;\n      ctx.beginPath();\n      ctx.moveTo(bx, botY + botH / 2);\n      ctx.lineTo(bx, iy);\n      ctx.stroke();\n    }\n  } else {\n    drawGridBox(fx, topY, fw, topH, topY + topH - 14, '极坐标幅度 Mag X[f] (随 k 缩放)');\n    drawGridBox(fx, botY, fw, botH, botY + botH / 2, '极坐标相位 Phase X[f] (对 k > 0 恒定不变)');\n    for (var b2 = 1; b2 <= maxBin; b2++) {\n      var bx2 = fx + (b2 / (maxBin + 1)) * fw;\n      var my = (topY + topH - 14) - (magArr[b2] / 1.2) * (topH - 26);\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 4;\n      ctx.beginPath();\n      ctx.moveTo(bx2, topY + topH - 14);\n      ctx.lineTo(bx2, my);\n      ctx.stroke();\n\n      var py2 = botY + botH / 2 - (phArr[b2] / 1.5) * (botH * 0.4);\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 4;\n      ctx.beginPath();\n      ctx.moveTo(bx2, botY + botH / 2);\n      ctx.lineTo(bx2, py2);\n      ctx.stroke();\n    }\n  }\n  lab.setReadout('缩放系数 k = ' + k.toFixed(1) + ' | Bin4 幅度 = ' + magArr[4].toFixed(2) + ' (相位 ' + phArr[4].toFixed(2) + ' rad) | Bin9 幅度 = ' + magArr[9].toFixed(2) + ' (相位 ' + phArr[9].toFixed(2) + ' rad)');\n});"
    },
    {
      "type": "concept",
      "heading": "可加性（Additivity）：余弦加余弦，正弦加正弦",
      "paragraphs": [
        "**可加性**指的是：在一个域中的加法，对应于另一个域中完全相同的加法。假设我们在时域把两个信号 `x₁[n]` 和 `x₂[n]` 逐点相加得到新信号 `x₃[n]`，那么对应的频谱也会相加：`X₃[f] = X₁[f] + X₂[f]`。",
        "为什么可以这么干脆地相加？把频谱拆回基本波形来想就豁然开朗了：实部 `Re X[f]` 代表所有频率的**余弦波**分量，虚部 `Im X[f]` 代表所有频率的**正弦波**分量。两个信号相加时，同频余弦波的振幅直接叠加（实部加实部），同频正弦波的振幅直接叠加（虚部加虚部），**余弦与正弦之间正交且互不干扰**。"
      ],
      "formula": {
        "expr": "x₁[n] + x₂[n] = x₃[n]  ↔  Re X₁[f] + Re X₂[f] = Re X₃[f]  且  Im X₁[f] + Im X₂[f] = Im X₃[f]",
        "explain": "在直角坐标系下，时域直接相加等价于频域实部与实部分别相加、虚部与虚部分别相加。"
      }
    },
    {
      "type": "concept",
      "heading": "极坐标的致命陷阱：为什么不能把 Mag 和 Phase 直接相加？",
      "paragraphs": [
        "初学者最容易犯的错误，就是在**极坐标（幅度和相位）**下直接把两个频谱的幅度相加、相位相加。**这是完全错误的！**",
        "想象一下把两个**频率相同**、但振幅（`A₁`, `A₂`）和相位（`φ₁`, `φ₂`）不同的正弦波相加：\n- 如果两者**完全同相**（相位差为 `0°`），波峰对齐波峰，合成振幅会相加为 `A₁ + A₂`。\n- 如果两者**完全反相**（相位差为 `180°`），波峰恰好遇上波谷，合成振幅不仅不会相加，反而会相互抵消成 `|A₁ - A₂|`（当 `A₁ = A₂` 时甚至完全归零）。",
        "因此，遇到极坐标频谱需要叠加时，标准工程流程只有一条路：**先转换到直角坐标（`Re` 和 `Im`），分别相加后再转换回极坐标**。此外还要特别注意一个易混概念：傅里叶变换虽然是**线性的**，但它并**不满足移位不变性**——时域的平移并不会引起频域的平移（这正是相位特性要讨论的问题）。"
      ],
      "formula": {
        "expr": "Mag(X₁ + X₂) = √[(Re X₁ + Re X₂)² + (Im X₁ + Im X₂)²]  ≠  Mag(X₁) + Mag(X₂)",
        "explain": "合成频谱的幅度必须由直角坐标向量合成求模长得到，除非两信号在所有频率上都严格同相，否则合成幅度绝不等于幅度之和。"
      }
    },
    {
      "type": "lab",
      "heading": "可加性与相位陷阱微实验：同频波叠加与相量合成",
      "instruction": "调节「相位差 Δφ」观察左侧时域合成波如何从加强变为抵消（180°时可完全消音！），同时观察右侧复平面上直角坐标向量的首尾相加如何远小于「错误极坐标直加」圆圈。",
      "controls": [
        {
          "type": "slider",
          "id": "amp1",
          "label": "信号 x₁ 振幅 A₁",
          "min": 0.2,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp2",
          "label": "信号 x₂ 振幅 A₂",
          "min": 0.2,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phaseDiff",
          "label": "相位差 Δφ",
          "min": 0,
          "max": 360,
          "step": 15,
          "value": 60,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showWrong",
          "label": "显示“错误极坐标直加”边界",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听合成音 x₃",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar osc = null;\nvar gainNode = null;\nvar isPlaying = false;\n\nfunction syncAudio(mag3, play) {\n  if (play && !isPlaying) {\n    var ac = lab.getAudioContext();\n    if (ac.state === 'suspended') { ac.resume(); }\n    gainNode = ac.createGain();\n    gainNode.gain.setValueAtTime(mag3 * 0.12, ac.currentTime);\n    gainNode.connect(ac.destination);\n    osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(330, ac.currentTime);\n    osc.connect(gainNode);\n    osc.start();\n    isPlaying = true;\n  } else if (play && isPlaying) {\n    var ac2 = lab.getAudioContext();\n    gainNode.gain.setTargetAtTime(mag3 * 0.12, ac2.currentTime, 0.02);\n  } else if (!play && isPlaying) {\n    try {\n      osc.stop();\n      osc.disconnect();\n      gainNode.disconnect();\n    } catch (e) {}\n    osc = null;\n    gainNode = null;\n    isPlaying = false;\n  }\n}\n\nfunction drawArrow(x1, y1, x2, y2, color, lw) {\n  var dx = x2 - x1;\n  var dy = y2 - y1;\n  var len = Math.sqrt(dx * dx + dy * dy);\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = lw;\n  ctx.beginPath();\n  ctx.moveTo(x1, y1);\n  ctx.lineTo(x2, y2);\n  ctx.stroke();\n  if (len > 6) {\n    var ang = Math.atan2(dy, dx);\n    ctx.beginPath();\n    ctx.moveTo(x2, y2);\n    ctx.lineTo(x2 - 8 * Math.cos(ang - 0.35), y2 - 8 * Math.sin(ang - 0.35));\n    ctx.lineTo(x2 - 8 * Math.cos(ang + 0.35), y2 - 8 * Math.sin(ang + 0.35));\n    ctx.closePath();\n    ctx.fill();\n  }\n}\n\nlab.onUpdate(function () {\n  var a1 = lab.values.amp1;\n  var a2 = lab.values.amp2;\n  var deg = lab.values.phaseDiff;\n  var showWrong = lab.values.showWrong;\n  var play = lab.values.play;\n  var rad = deg * Math.PI / 180;\n\n  var re1 = a1, im1 = 0;\n  var re2 = a2 * Math.cos(rad), im2 = a2 * Math.sin(rad);\n  var re3 = re1 + re2, im3 = im1 + im2;\n  var mag3 = Math.sqrt(re3 * re3 + im3 * im3);\n  var wrongMag = a1 + a2;\n\n  syncAudio(mag3, play);\n  ctx.clearRect(0, 0, W, H);\n\n  var tx = 26, ty = 24, tw = 335, th = 190, tMid = ty + th / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(tx, ty, tw, th);\n  ctx.beginPath();\n  ctx.moveTo(tx, tMid);\n  ctx.lineTo(tx + tw, tMid);\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域叠加: x₃(t) = x₁(t) + x₂(t)', tx + 6, ty + 14);\n\n  function plotWave(fn, color, lw, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    for (var i = 0; i <= 180; i++) {\n      var t = i / 180;\n      var v = fn(t);\n      var px = tx + t * tw;\n      var py = tMid - (v / 2.1) * (th * 0.43);\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  plotWave(function (t) { return a1 * Math.cos(2 * Math.PI * 2 * t); }, '#38bdf8', 1.4, true);\n  plotWave(function (t) { return a2 * Math.cos(2 * Math.PI * 2 * t - rad); }, '#ec4899', 1.4, true);\n  plotWave(function (t) { return a1 * Math.cos(2 * Math.PI * 2 * t) + a2 * Math.cos(2 * Math.PI * 2 * t - rad); }, '#10b981', 2.5, false);\n\n  var cx = 540, cy = 122, sc = 43;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var r = 0.5; r <= 2.0; r += 0.5) {\n    ctx.beginPath();\n    ctx.arc(cx, cy, r * sc, 0, Math.PI * 2);\n    ctx.stroke();\n  }\n  ctx.beginPath();\n  ctx.moveTo(cx - 95, cy);\n  ctx.lineTo(cx + 95, cy);\n  ctx.moveTo(cx, cy - 95);\n  ctx.lineTo(cx, cy + 95);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('频域复平面 (Re / Im 向量合成)', 415, 22);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('Re', cx + 82, cy - 5);\n  ctx.fillText('Im', cx + 5, cy - 84);\n\n  if (showWrong) {\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    ctx.arc(cx, cy, wrongMag * sc, 0, Math.PI * 2);\n    ctx.stroke();\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('错误直加 A₁+A₂=' + wrongMag.toFixed(2), 400, 228);\n    ctx.restore();\n  }\n\n  var x1p = cx + re1 * sc, y1p = cy - im1 * sc;\n  var x2p = cx + re2 * sc, y2p = cy - im2 * sc;\n  var x3p = cx + re3 * sc, y3p = cy - im3 * sc;\n\n  ctx.save();\n  ctx.strokeStyle = 'rgba(236,72,153,0.35)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(x2p, y2p);\n  ctx.stroke();\n  ctx.restore();\n\n  drawArrow(cx, cy, x1p, y1p, '#38bdf8', 2);\n  drawArrow(x1p, y1p, x3p, y3p, '#ec4899', 2);\n  drawArrow(cx, cy, x3p, y3p, '#10b981', 3);\n\n  lab.setReadout('真实合成幅度 |X₃| = ' + mag3.toFixed(2) + ' (Re=' + re3.toFixed(2) + ', Im=' + im3.toFixed(2) + ')  |  错误极坐标直加 = ' + wrongMag.toFixed(2));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【严禁极坐标直接相加】：做频域信号叠加或混音计算时，绝对不能把两个极坐标频谱的 Mag 和 Phase 直接相加；必须先转成直角坐标（Re 和 Im）分别求和，再转回极坐标。",
        "【缩放律分清坐标系】：时域乘以正常数 k，直角坐标谱的实部和虚部都乘以 k；极坐标谱则是幅度乘以 k、相位保持不变。",
        "【线性 ≠ 移位不变性】：虽然 FT、FS、DFT、DTFT 全部严格遵守线性性质，但傅里叶变换并不具备移位不变性——时域平移改变的是相位斜率，而不是平移频谱。"
      ]
    }
  ]
});
