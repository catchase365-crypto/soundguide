window.__BOOK_REGISTER_SECTION__("sec_150", {
  "title": "单极点递归滤波器 (Single Pole Recursive Filters)",
  "intuition": "只需两三个递归系数，就能在数字世界里精准复刻模拟 RC 阻容滤波器的平滑与隔直效果——算力极省、时域表现极佳，但频域滚降平缓且需严守稳定性边界。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从模拟 RC 电路到数字单极点滤波器",
      "paragraphs": [
        "在模拟电子技术中，仅由一个电阻 `R` 和一个电容 `C` 就能搭出最经典的**低通滤波器**（平滑电压跳变）或**高通滤波器**（隔直流、放行高频）。在数字信号处理（DSP）中，**单极点递归滤波器**正是它们的完美数字替身。",
        "例如图 19-2 所示的低通滤波器仅用两个系数（`a₀ = 0.15, b₁ = 0.85`），就能把陡峭的阶跃信号平滑成与 RC 低通电路完全一致的指数上升曲线；而图 19-3 的高通滤波器只需三个系数（`a₀ = 0.93, a₁ = -0.93, b₁ = 0.86`），就能模拟 RC 高通电路的瞬态尖峰与衰减。",
        "这类滤波器的所有特性都由唯一一个参数 `x`（取值在 `0` 到 `1` 之间）控制。**`x` 的物理含义是相邻输出样本间的衰减比例**：比如 `x = 0.86` 意味着每个输出样本都是前一个输出样本的 `0.86` 倍。`x` 越接近 `1`，衰减越慢，滤波惯性越大；**一旦 `x > 1`，正反馈会使输出指数级膨胀直到数值溢出（系统不稳定）**。"
      ],
      "formula": {
        "expr": "通用递推: y[n] = a₀·x[n] + a₁·x[n-1] + b₁·y[n-1]   |   低通: a₀ = 1 - x, a₁ = 0, b₁ = x   |   高通: a₀ = (1 + x)/2, a₁ = -(1 + x)/2, b₁ = x",
        "explain": "x[n] 和 x[n-1] 分别是当前与上一时刻输入，y[n-1] 是上一时刻输出反馈。参数 x ∈ (0, 1) 控制衰减速度；低通只需当前输入与历史输出（Eq 19-2），高通通过正负系数差分阻断直流（Eq 19-3）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：时域响应、样本衰减率 x 与系统失稳边界",
      "instruction": "拖动「衰减参数 x」观察阶跃响应快慢与高低通波形；尝试将 x 拖过 1.00 触发数值发散失稳，或切换为复合信号观察高低温分离效果。",
      "controls": [
        {
          "type": "slider",
          "id": "xVal",
          "label": "衰减参数 x",
          "min": 0.1,
          "max": 1.03,
          "step": 0.01,
          "value": 0.86,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "highpass",
          "label": "切换为高通滤波 (Eq 19-3)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "composite",
          "label": "复合信号输入 (慢变+高频突发)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var x = lab.values.xVal;\n  var hp = lab.values.highpass;\n  var comp = lab.values.composite;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var padL = 52, padR = 20, padT = 26, padB = 34;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var yMin = -0.5, yMax = 1.5;\n\n  function toX(idx, total) { return padL + (idx / (total - 1)) * plotW; }\n  function toY(val) { return padT + ((yMax - val) / (yMax - yMin)) * plotH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var yTicks = [-0.5, 0.0, 0.5, 1.0, 1.5];\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  for (var t = 0; t < yTicks.length; t++) {\n    var py = toY(yTicks[t]);\n    ctx.beginPath();\n    ctx.moveTo(padL, py);\n    ctx.lineTo(W - padR, py);\n    ctx.stroke();\n    ctx.fillText(yTicks[t].toFixed(1), padL - 8, py);\n  }\n\n  var N = comp ? 450 : 45;\n  var xStep = comp ? 100 : 10;\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  for (var gx = 0; gx < N; gx += xStep) {\n    var px = toX(gx, N);\n    ctx.beginPath();\n    ctx.moveTo(px, padT);\n    ctx.lineTo(px, H - padB);\n    ctx.stroke();\n    ctx.fillText(String(gx), px, H - padB + 6);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('样本序号 (Sample number)', padL + plotW / 2, H - 14);\n\n  var inp = new Array(N);\n  for (var i = 0; i < N; i++) {\n    if (!comp) {\n      inp[i] = i < 10 ? 0.0 : 1.0;\n    } else {\n      var base = 0.78 + 0.09 * Math.sin(i * 0.011) - 0.58 / (1 + Math.exp(-(i - 270) / 28));\n      var burst = 0.24 * Math.sin(i * 0.85) * Math.exp(-Math.pow((i - 340) / 36, 2));\n      inp[i] = base + burst;\n    }\n  }\n\n  var a0 = hp ? (1 + x) / 2 : (1 - x);\n  var a1 = hp ? -(1 + x) / 2 : 0;\n  var b1 = x;\n\n  var out = new Array(N);\n  var prevX = inp[0];\n  var prevY = hp ? 0 : inp[0];\n  out[0] = prevY;\n  var unstable = false;\n  for (var i = 1; i < N; i++) {\n    var y = a0 * inp[i] + a1 * prevX + b1 * prevY;\n    if (Math.abs(y) > 50) { unstable = true; y = y > 0 ? 50 : -50; }\n    out[i] = y;\n    prevX = inp[i];\n    prevY = y;\n  }\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(padL, padT, plotW, plotH);\n  ctx.clip();\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.42)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = toX(i, N), py = toY(inp[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = x > 1.0 ? '#ec4899' : (hp ? '#f59e0b' : '#10b981');\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = toX(i, N), py = toY(out[i]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (!comp) {\n    ctx.fillStyle = x > 1.0 ? '#ec4899' : (hp ? '#f59e0b' : '#10b981');\n    for (var i = 0; i < N; i++) {\n      var py = toY(out[i]);\n      if (py >= padT - 4 && py <= H - padB + 4) {\n        ctx.beginPath();\n        ctx.arc(toX(i, N), py, 2.3, 0, Math.PI * 2);\n        ctx.fill();\n      }\n    }\n  }\n  ctx.restore();\n\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.fillText('-- 输入信号', padL + 10, 6);\n  ctx.fillStyle = x > 1.0 ? '#ec4899' : (hp ? '#f59e0b' : '#10b981');\n  ctx.fillText('— ' + (hp ? '高通输出' : '低通输出'), padL + 95, 6);\n\n  if (x > 1.0) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';\n    ctx.fillRect(padL + 190, padT + 8, 300, 26);\n    ctx.fillStyle = '#f472b6';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('⚠ x > 1.0 系统失稳：输出呈指数级溢出！', padL + 202, padT + 15);\n  }\n\n  if (x >= 1.0) {\n    lab.setReadout('x = ' + x.toFixed(2) + ' (不稳定!) | a0=' + a0.toFixed(3) + ', a1=' + a1.toFixed(3) + ', b1=' + b1.toFixed(3));\n  } else {\n    var d = -1 / Math.log(x);\n    var fc = -Math.log(x) / (2 * Math.PI);\n    lab.setReadout('x = ' + x.toFixed(2) + ' | a0=' + a0.toFixed(3) + ', a1=' + a1.toFixed(3) + ', b1=' + b1.toFixed(3) + ' | 时间常数 d = ' + d.toFixed(2) + ' 样本 | -3dB 截止频率 fc = ' + fc.toFixed(4));\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "时间常数 d 与 -3dB 截止频率 fc：三种等价设计入口",
      "paragraphs": [
        "在实际工程中，我们有三种方式确定参数 `x`：直接指定 `x`、由期望的**时间常数 `d`** 换算，或由期望的 **-3dB 截止频率 `f_c`** 换算。",
        "就像模拟电路中 `R × C` 代表电容电压衰减到 `36.8%`（即 `1/e`）所需的秒数，数字滤波器的时间常数 `d` 代表其脉冲响应或阶跃差值衰减到 `36.8%` 所需的**样本数**（例如 `x = 0.86` 对应 `d = 6.63` 个样本）。",
        "理论上，单极点递归滤波器的脉冲响应是无限长的（IIR），但在实际浮点运算中，经过大约 **15 到 20 个时间常数**后，响应就会衰减到单精度浮点舍入噪声之下（例如 `d = 6.63` 时，有效脉冲响应长度约 `128` 个样本）。"
      ],
      "formula": {
        "expr": "x = e^(-1/d)   (Eq 19-4)     |     x = e^(-2π·f_c)   (Eq 19-5)",
        "explain": "d 为衰减至 36.8% 所需样本数（时间常数）；f_c 为归一化 -3dB 截止频率，取值范围在 0 到 0.5（奈奎斯特频率）之间。"
      }
    },
    {
      "type": "concept",
      "heading": "频域短板与四级级联改进（以及极限失真警告）",
      "paragraphs": [
        "单极点递归滤波器拥有一个显著特征：**在时域上极其出色，但在频域上非常糟糕**——它的过渡带滚降极度平缓，几乎无法干净地将相邻频段分离开来。",
        "为了改善频域表现，工程上常将**多个相同滤波器级联**（把信号连续通过滤波器多次，或用 z 变换把四级合并为单级高效方程 Eq 19-6）。四级级联能大幅加深阻带衰减，性能可媲美第 15 章的 Blackman 或高斯滤波器，但运行速度快得多。",
        "不过务必注意**极限边界坑**：图 19-5(c) 展示了四级低通滤波器在 `f_c = 0.25` 时曲线几乎完全失效（在 Nyquist 处仍高达 `0.8` 左右，根本达不到 `-3dB`）。一旦把递归滤波器的截止频率推向极端上限，**混叠、舍入噪声与非线性相位响应**会联合破坏预期的频响曲线。若需要陡峭的频域选频特性，请转向下一章的切比雪夫（Chebyshev）滤波器。"
      ],
      "formula": {
        "expr": "a₀ = (1 - x)⁴,  b₁ = 4x,  b₂ = -6x²,  b₃ = 4x³,  b₄ = -x⁴   (其中 x = e^(-14.445·f_c))",
        "explain": "四级低通级联等效方程（Eq 19-6）。注意此处用 14.445 替代了单级 Eq 19-5 中的 2π，以补偿四级叠加导致的 -3dB 带宽收缩。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：频域幅度响应、四级级联对比与实时音频滤波听感",
      "instruction": "调节「截止频率 fc」与「4 级级联」观察频响滚降及高 fc（如 0.25）下的曲线异常；点击播放测试音（包含 180Hz 低频嗡声与 5200Hz 高频哨音脉冲），实时对比低通/高通与 4 级级联的听感差异！",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 fc",
          "min": 0.01,
          "max": 0.3,
          "step": 0.01,
          "value": 0.05,
          "unit": " Fs"
        },
        {
          "type": "toggle",
          "id": "highpass",
          "label": "高通模式 (关闭为低通)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "cascade4",
          "label": "开启 4 级级联 (Eq 19-6)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "直通原声 (对比滤波前后)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioState = { node: null, pLow: 0, pHigh: 0, pEnv: 0, xHist: [0,0,0,0], yHist: [0,0,0,0] };\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var fc = lab.values.fc;\n  var hp = lab.values.highpass;\n  var c4 = lab.values.cascade4;\n  var play = lab.values.play;\n\n  if (play && !audioState.node) {\n    try {\n      var actx = lab.getAudioContext();\n      if (actx.state === 'suspended') actx.resume();\n      var node = actx.createScriptProcessor(2048, 0, 1);\n      node.onaudioprocess = function(ev) {\n        var outBuf = ev.outputBuffer.getChannelData(0);\n        var sr = actx.sampleRate;\n        var curFc = lab.values.fc;\n        var curHp = lab.values.highpass;\n        var curC4 = lab.values.cascade4;\n        var curByp = lab.values.bypass;\n        var stages = curC4 ? 4 : 1;\n        var coefX = (!curHp && curC4) ? Math.exp(-14.445 * curFc) : Math.exp(-2 * Math.PI * curFc);\n        var a0 = curHp ? (1 + coefX) / 2 : (1 - coefX);\n        var a1 = curHp ? -(1 + coefX) / 2 : 0;\n        var b1 = coefX;\n        var dpLow = 2 * Math.PI * 180 / sr;\n        var dpHigh = 2 * Math.PI * 5200 / sr;\n        var dpEnv = 2 * Math.PI * 2.2 / sr;\n\n        for (var i = 0; i < outBuf.length; i++) {\n          audioState.pLow = (audioState.pLow + dpLow) % (2 * Math.PI);\n          audioState.pHigh = (audioState.pHigh + dpHigh) % (2 * Math.PI);\n          audioState.pEnv = (audioState.pEnv + dpEnv) % (2 * Math.PI);\n          var env = 0.2 + 0.8 * Math.pow(0.5 + 0.5 * Math.sin(audioState.pEnv), 2);\n          var raw = 0.55 * Math.sin(audioState.pLow) + 0.20 * Math.sin(2 * audioState.pLow) + env * 0.45 * Math.sin(audioState.pHigh) + (Math.random() * 2 - 1) * 0.08;\n\n          var sig = raw;\n          if (!curByp) {\n            for (var s = 0; s < stages; s++) {\n              var y = a0 * sig + a1 * audioState.xHist[s] + b1 * audioState.yHist[s];\n              audioState.xHist[s] = sig;\n              audioState.yHist[s] = y;\n              sig = y;\n            }\n          }\n          if (sig > 1.2) sig = 1.2; else if (sig < -1.2) sig = -1.2;\n          outBuf[i] = sig * 0.22;\n        }\n      };\n      node.connect(actx.destination);\n      audioState.node = node;\n    } catch (e) {}\n  } else if (!play && audioState.node) {\n    try { audioState.node.disconnect(); } catch (e) {}\n    audioState.node = null;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  var padL = 52, padR = 24, padT = 26, padB = 34;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var yMin = 0.0, yMax = 1.5;\n\n  function toX(f) { return padL + (f / 0.5) * plotW; }\n  function toY(amp) { return padT + ((yMax - amp) / (yMax - yMin)) * plotH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  var yTicks = [0.0, 0.5, 1.0, 1.5];\n  for (var i = 0; i < yTicks.length; i++) {\n    var py = toY(yTicks[i]);\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(W - padR, py); ctx.stroke();\n    ctx.fillText(yTicks[i].toFixed(1), padL - 8, py);\n  }\n\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  for (var f = 0; f <= 0.501; f += 0.1) {\n    var px = toX(f);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, H - padB); ctx.stroke();\n    ctx.fillText(f.toFixed(1), px, H - padB + 6);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('归一化频率 Frequency (× Fs)', padL + plotW / 2, H - 14);\n\n  var py3db = toY(0.7071);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(padL, py3db); ctx.lineTo(W - padR, py3db); ctx.stroke();\n  var pxFc = toX(fc);\n  ctx.beginPath(); ctx.moveTo(pxFc, padT); ctx.lineTo(pxFc, H - padB); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'left';\n  ctx.fillText('-3dB (0.707)', padL + 6, py3db - 13);\n\n  function calcMag(f, xParam, isHp, numStages) {\n    var w = 2 * Math.PI * f;\n    var cw = Math.cos(w), sw = Math.sin(w);\n    var nr = isHp ? ((1 + xParam) / 2) * (1 - cw) : (1 - xParam);\n    var ni = isHp ? ((1 + xParam) / 2) * sw : 0;\n    var dr = 1 - xParam * cw;\n    var di = xParam * sw;\n    var m1 = Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di));\n    return Math.pow(m1, numStages);\n  }\n\n  var x1 = Math.exp(-2 * Math.PI * fc);\n  var xActive = (!hp && c4) ? Math.exp(-14.445 * fc) : x1;\n\n  if (c4) {\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (var k = 0; k <= 250; k++) {\n      var f = (k / 250) * 0.5;\n      var m = calcMag(f, x1, hp, 1);\n      if (k === 0) ctx.moveTo(toX(f), toY(m)); else ctx.lineTo(toX(f), toY(m));\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = hp ? '#f59e0b' : '#38bdf8';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (var k = 0; k <= 250; k++) {\n    var f = (k / 250) * 0.5;\n    var m = calcMag(f, xActive, hp, c4 ? 4 : 1);\n    if (k === 0) ctx.moveTo(toX(f), toY(m)); else ctx.lineTo(toX(f), toY(m));\n  }\n  ctx.stroke();\n\n  var nyqMag = calcMag(0.5, xActive, hp, c4 ? 4 : 1);\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'top';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = hp ? '#f59e0b' : '#38bdf8';\n  ctx.fillText('— ' + (c4 ? '4级级联' : '单级') + (hp ? '高通' : '低通') + '频响', padL + 10, 6);\n  if (c4) {\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.fillText('-- 单级参考线', padL + 145, 6);\n  }\n  if (!hp && c4 && fc >= 0.20) {\n    ctx.fillStyle = '#f472b6';\n    ctx.fillText('⚠ fc 推向极限：阻带未达 -3dB（Fig 19-5c 异常区）', padL + 255, 6);\n  }\n\n  var audioTxt = play ? (lab.values.bypass ? '🔊 播放中(直通原声)' : '🔊 播放中(滤波输出)') : '🔇 静音';\n  lab.setReadout('fc = ' + fc.toFixed(2) + ' Fs | x = ' + xActive.toFixed(4) + ' | Nyquist(0.5) 增益 = ' + nyqMag.toFixed(3) + ' | ' + audioTxt);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "严守稳定性红线：单极点滤波器参数必须满足 0 < x < 1。一旦 x ≥ 1，输出反馈不再衰减而是放大，任何非零输入都会导致数值指数爆炸并溢出。",
        "认清“时域强、频域弱”的本质：它非常适合平滑波形、去除直流偏置或抑制远高于信号频段的噪声；但如果你需要精准切割相邻频段，别死磕级联单极点，应直接换用切比雪夫（Chebyshev）或椭圆等高阶滤波器。",
        "小心四级低通 Eq 19-6 的极限失真：当截止频率 fc 设得过高（如 fc ≥ 0.20）时，x = e^(-14.445·fc) 过小会导致滤波器在奈奎斯特频率处也无法达到 -3dB 衰减，彻底失去滤波意义。",
        "估算脉冲响应截断长度：虽然理论上递归滤波器的脉冲响应无限长，但工程上经过 15 到 20 个时间常数 d 后，其幅值就会低于单精度浮点舍入噪声底，可安全视为归零。"
      ]
    }
  ]
});
