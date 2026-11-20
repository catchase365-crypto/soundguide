window.__BOOK_REGISTER_SECTION__("sec_211", {
  "title": "定点数与浮点数的再审视 (Fixed vs. Floating Point)",
  "intuition": "浮点数不仅让程序员告别步步惊心的防溢出缩放代码，更在微弱信号与精密滤波中把‘计算误差’压低到算法本身误差之下。",
  "blocks": [
    {
      "type": "concept",
      "heading": "编程体验的天壤之别：2 行代码 vs 步步惊心",
      "paragraphs": [
        "在 SHARC 这类浮点 DSP 上，外部编解码器（Codec）传来的采样数据本质上依然是**定点数（Fixed Point）**。我们不厌其烦地先把它转换成浮点数，做完 FIR 滤波后再转回定点数输出，核心原因只有两个：**编程省心**与**性能极限**。",
        "先说编程体验，这两者的差距是碾压级的。在浮点汇编程序中（例如原书表 29-2），整个 FIR 主滤波循环只需要区区 **2 行核心指令**（第 41 和 42 行），硬件会自动帮你搞定小数点对齐和巨大的动态范围。",
        "相反，如果你用**定点数**写同样的算法，程序员就必须像走钢丝一样在每一次算术运算后手动管理数据：时刻检查数值是否发生**上溢（Overflow）或下溢（Underflow）**，发现苗头不对就得立刻按比例缩放（Scaling）；同时，累加中间结果还必须塞进位宽更大的**扩展精度累加器（Extended Precision Accumulator）**中，否则反复叠加的舍入误差会瞬间摧毁计算结果。"
      ],
      "formula": {
        "expr": "y[n] = Σ h[k] · x[n-k]  (累加器位宽需满足 B_acc ≥ 2B + log2(N))",
        "explain": "x[n-k] 为 B 位定点输入样本，h[k] 为 B 位滤波核系数，N 为滤波核点数；若不使用扩展精度累加器，N 次乘加的舍入误差将严重破坏输出 y[n]。"
      }
    },
    {
      "type": "concept",
      "heading": "性能真相：只有放大几百倍才看得见的舍入噪声",
      "paragraphs": [
        "既然定点这么难写，那它在运算性能上会比浮点差很多吗？答案非常微妙：**在宏观尺度下，它们看起来一模一样；只有把幅度放大几百倍，真相才会浮出水面。**",
        "以原书图 29-5 的 150 点布莱克曼（Blackman）窗函数低通 FIR 滤波器为例。在 `0.0 ~ 1.5` 的正常纵轴视角下，定点和浮点的幅频响应曲线几乎完全重合。但如果我们把通带 `1.000` 附近的幅度放大几百倍（观察 `0.998 ~ 1.002`），差异立刻触目惊心：",
        "在**浮点数**下，计算产生的舍入噪声微乎其微，性能瓶颈完全取决于**算法设计本身**——你在截止频率附近看到的 `0.02%` 过冲波纹，是布莱克曼窗函数的固有特性；想再提高精度，你该去改进算法，而不是折腾硬件实现。但在 **16 位或 14 位定点数**下，滤波核系数的量化误差直接化作满屏起伏的随机噪声，彻底淹没了原本的频响特征。此时哪怕你换用最完美的窗函数算法，也无济于事。"
      ],
      "formula": {
        "expr": "H_fixed(ω) = H_ideal(ω) + E_quant(ω)",
        "explain": "H_fixed(ω) 是实际定点滤波器的频率响应，H_ideal(ω) 是理想算法设计的频响（仅含窗函数固有波纹），E_quant(ω) 则是定点量化系数引入的附加舍入噪声谱。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：频响显微镜 — 量化噪声如何吞噬完美算法",
      "instruction": "试着先把「纵轴放大倍数」拉到 1x 观察宏观曲线，再推到 250x；然后对比开启「浮点数实现」与 14/16 位定点数的通带细节。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "定点滤波核位宽",
          "min": 10,
          "max": 20,
          "step": 1,
          "value": 14,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "zoom",
          "label": "纵轴显微放大倍数",
          "min": 1,
          "max": 250,
          "step": 1,
          "value": 250,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "isFloat",
          "label": "切换为浮点数实现 (对比青蓝参考线)",
          "value": false
        }
      ],
      "jsCode": "var N = 150, fc = 0.33, M = N - 1;\nvar hFloat = new Float64Array(N);\nvar sum = 0;\nfor (var i = 0; i < N; i++) {\n  var k = i - M / 2;\n  var sinc = Math.abs(k) < 1e-9 ? 2 * fc : Math.sin(2 * Math.PI * fc * k) / (Math.PI * k);\n  var win = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M);\n  hFloat[i] = sinc * win;\n  sum += hFloat[i];\n}\nfor (var i = 0; i < N; i++) hFloat[i] /= sum;\n\nfunction evalMag(kernel, numPts) {\n  var res = new Float64Array(numPts);\n  for (var p = 0; p < numPts; p++) {\n    var f = 0.5 * p / (numPts - 1);\n    var w = 2 * Math.PI * f;\n    var re = 0, im = 0;\n    for (var n = 0; n < kernel.length; n++) {\n      var ang = w * n;\n      re += kernel[n] * Math.cos(ang);\n      im -= kernel[n] * Math.sin(ang);\n    }\n    res[p] = Math.sqrt(re * re + im * im);\n  }\n  return res;\n}\n\nvar numPts = 220;\nvar magFloat = evalMag(hFloat, numPts);\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var bits = lab.values.bits;\n  var zoom = lab.values.zoom;\n  var isFloat = lab.values.isFloat;\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 58, padR = 20, padT = 22, padB = 32;\n  var pw = W - padL - padR, ph = H - padT - padB;\n\n  var s = 0.5 / zoom;\n  var yMax = 1.0 + s;\n  var yMin = 1.0 - s * (1 + 1 / Math.sqrt(zoom));\n  if (zoom === 1) { yMin = 0.0; yMax = 1.5; }\n\n  function toX(f) { return padL + (f / 0.5) * pw; }\n  function toY(a) { return padT + (1 - (a - yMin) / (yMax - yMin)) * ph; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (var fi = 0; fi <= 5; fi++) {\n    var fVal = fi * 0.1;\n    var gx = toX(fVal);\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + ph); ctx.stroke();\n    ctx.fillText(fVal.toFixed(1), gx - 9, padT + ph + 15);\n  }\n  for (var yi = 0; yi <= 4; yi++) {\n    var aVal = yMin + (yMax - yMin) * (yi / 4);\n    var gy = toY(aVal);\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + pw, gy); ctx.stroke();\n    ctx.fillText(aVal.toFixed(zoom > 20 ? 4 : 2), 6, gy + 4);\n  }\n  ctx.fillText('归一化频率 (Cycles/Sample)', padL + pw / 2 - 65, H - 4);\n\n  var step = Math.pow(2, -(bits - 1));\n  var hFixed = new Float64Array(N);\n  for (var i = 0; i < N; i++) hFixed[i] = Math.round(hFloat[i] / step) * step;\n  var magFixed = evalMag(hFixed, numPts);\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(padL, padT, pw, ph);\n  ctx.clip();\n\n  ctx.strokeStyle = isFloat ? '#38bdf8' : 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = isFloat ? 2.4 : 1.5;\n  if (!isFloat) ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var p = 0; p < numPts; p++) {\n    var x = toX(0.5 * p / (numPts - 1));\n    var y = toY(magFloat[p]);\n    if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var maxErr = 0;\n  for (var p = 0; p < numPts; p++) {\n    var f = 0.5 * p / (numPts - 1);\n    if (f <= 0.30) {\n      var err = Math.abs((isFloat ? magFloat[p] : magFixed[p]) - 1.0);\n      if (err > maxErr) maxErr = err;\n    }\n  }\n\n  if (!isFloat) {\n    ctx.strokeStyle = bits <= 14 ? '#f59e0b' : '#10b981';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (var p = 0; p < numPts; p++) {\n      var x = toX(0.5 * p / (numPts - 1));\n      var y = toY(magFixed[p]);\n      if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n  ctx.restore();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 浮点参考 (仅含窗函数0.02%波纹)', padL + 10, padT + 14);\n  if (!isFloat) {\n    ctx.fillStyle = bits <= 14 ? '#f59e0b' : '#10b981';\n    ctx.fillText('— ' + bits + '位定点实测响应', padL + 235, padT + 14);\n  }\n\n  var modeText = isFloat ? '浮点模式 (算法上限主导)' : (bits + '位定点模式 (量化台阶 Δ=' + step.toExponential(2) + ')');\n  lab.setReadout(modeText + ' | 放大: ' + zoom + 'x | 通带最大误差: ±' + (maxErr * 100).toFixed(4) + '%');\n});"
    },
    {
      "type": "concept",
      "heading": "时域微弱尾音的杀手与高保真音频应用",
      "paragraphs": [
        "同样的现象也发生在**时域（Time Domain）**。原书图 29-6 展示了一个类似拨动琴弦或地震余波的指数衰减振荡信号。在 `-1.0 ~ +1.0` 的宏观尺度下，定点和浮点波形毫无二致；但当我们放大第 `200 ~ 300` 个采样点、幅度仅在 `±0.001` 左右的衰减尾音时，16 位与 14 位定点数会暴露出明显的台阶状跳变——从信号分析的角度看，这就是**加性随机量化噪声**，它会直接淹没微弱的信号分量，降低系统的最小可探测极限。",
        "虽然在大多数宏观场合，定点与浮点的这点误差无关紧要，但有两类场景对浮点精度有刚性需求。第一类是**高动态范围信号处理**：家用 CD 播放器采用 16 位定点格式，通常已经超越人耳听觉极限；但专业级录音棚与母带音频系统的采样精度高达 **20 到 24 位**，容不得半点计算噪声污染音乐细节，此时浮点数几乎是唯一理想的选择。"
      ],
      "formula": {
        "expr": "x[n] = A · e^(-n/τ) · sin(ω₀n),   Δ = 2^(-(B-1))",
        "explain": "x[n] 为指数衰减信号，τ 为衰减时间常数；当信号尾音幅度跌落至接近 B 位定点数的最小量化步长 Δ 时，波形将被台阶误差严重畸变或截断归零。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：衰减波尾音放大镜与真实听觉对比",
      "instruction": "开启「放大微小尾音」并在 12~16 位定点与浮点数之间切换；点击播放声音，对比宏观声响与放大 250 倍后的尾音失真噪声！",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "信号表示位宽",
          "min": 12,
          "max": 20,
          "step": 1,
          "value": 14,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "isFloat",
          "label": "使用浮点数表示 (Float)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "zoomTail",
          "label": "放大第 200~300 点微小尾音 (±0.001)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放衰减波试听",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var srcNode = null;\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\n\nfunction updateAudio(bits, isFloat, zoomTail, shouldPlay) {\n  stopAudio();\n  if (!shouldPlay) return;\n  var ctx = lab.getAudioContext();\n  if (ctx.state === 'suspended') ctx.resume();\n  var sr = ctx.sampleRate;\n  var dur = 1.6;\n  var len = Math.floor(sr * dur);\n  var buf = ctx.createBuffer(1, len, sr);\n  var ch = buf.getChannelData(0);\n  var step = Math.pow(2, -(bits - 1));\n  var freq = 330;\n  var tau = 0.145;\n\n  for (var i = 0; i < len; i++) {\n    var t = i / sr;\n    var val;\n    if (!zoomTail) {\n      var env = (t < 0.005) ? (t / 0.005) : 1.0;\n      val = 0.75 * env * Math.exp(-t / tau) * Math.sin(2 * Math.PI * freq * t);\n      if (!isFloat) val = Math.round(val / step) * step;\n      if (t > dur - 0.03) val *= (dur - t) / 0.03;\n    } else {\n      var tTail = 0.96 + (t / dur) * 0.55;\n      var raw = 0.75 * Math.exp(-tTail / tau) * Math.sin(2 * Math.PI * freq * tTail);\n      if (!isFloat) raw = Math.round(raw / step) * step;\n      val = raw * 220;\n      var fade = 1.0;\n      if (t < 0.03) fade = t / 0.03;\n      if (t > dur - 0.04) fade = (dur - t) / 0.04;\n      val *= fade;\n      if (val > 0.85) val = 0.85;\n      if (val < -0.85) val = -0.85;\n    }\n    ch[i] = val;\n  }\n\n  srcNode = ctx.createBufferSource();\n  srcNode.buffer = buf;\n  srcNode.loop = true;\n  srcNode.connect(ctx.destination);\n  srcNode.start();\n}\n\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var bits = lab.values.bits;\n  var isFloat = lab.values.isFloat;\n  var zoomTail = lab.values.zoomTail;\n\n  updateAudio(bits, isFloat, zoomTail, lab.values.play);\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 62, padR = 20, padT = 22, padB = 32;\n  var pw = W - padL - padR, ph = H - padT - padB;\n\n  var nStart = zoomTail ? 200 : 0;\n  var nEnd = 300;\n  var yMax = zoomTail ? 0.001 : 1.0;\n  var yMin = -yMax;\n\n  function toX(n) { return padL + ((n - nStart) / (nEnd - nStart)) * pw; }\n  function toY(v) { return padT + (1 - (v - yMin) / (yMax - yMin)) * ph; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  var xTicks = zoomTail ? [200, 225, 250, 275, 300] : [0, 50, 100, 150, 200, 250, 300];\n  for (var ti = 0; ti < xTicks.length; ti++) {\n    var gx = toX(xTicks[ti]);\n    ctx.beginPath(); ctx.moveTo(gx, padT); ctx.lineTo(gx, padT + ph); ctx.stroke();\n    ctx.fillText(xTicks[ti], gx - 9, padT + ph + 15);\n  }\n  var yTicks = zoomTail ? [-0.001, -0.0005, 0, 0.0005, 0.001] : [-1.0, -0.5, 0, 0.5, 1.0];\n  for (var yi = 0; yi < yTicks.length; yi++) {\n    var gy = toY(yTicks[yi]);\n    ctx.beginPath(); ctx.moveTo(padL, gy); ctx.lineTo(padL + pw, gy); ctx.stroke();\n    ctx.fillText(zoomTail ? yTicks[yi].toFixed(4) : yTicks[yi].toFixed(1), 6, gy + 4);\n  }\n  ctx.fillText('采样点序号 (Sample number)', padL + pw / 2 - 70, H - 4);\n\n  var step = Math.pow(2, -(bits - 1));\n  function getSample(n) {\n    if (n < 30) return 0;\n    return 0.85 * Math.exp(-(n - 30) / 24.5) * Math.sin(0.21 * (n - 30));\n  }\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(padL, padT, pw, ph);\n  ctx.clip();\n\n  ctx.strokeStyle = isFloat ? '#38bdf8' : 'rgba(56,189,248,0.35)';\n  ctx.lineWidth = isFloat ? 2.2 : 1.4;\n  ctx.beginPath();\n  for (var n = nStart; n <= nEnd; n++) {\n    var x = toX(n), y = toY(getSample(n));\n    if (n === nStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (!isFloat) {\n    ctx.strokeStyle = bits <= 14 ? '#ec4899' : '#10b981';\n    ctx.lineWidth = 2.0;\n    ctx.beginPath();\n    for (var n = nStart; n <= nEnd; n++) {\n      var raw = getSample(n);\n      var q = Math.round(raw / step) * step;\n      var x = toX(n), y = toY(q);\n      if (n === nStart) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    if (zoomTail) {\n      ctx.fillStyle = bits <= 14 ? '#ec4899' : '#10b981';\n      for (var n = nStart; n <= nEnd; n++) {\n        var q = Math.round(getSample(n) / step) * step;\n        ctx.fillRect(toX(n) - 2, toY(q) - 2, 4, 4);\n      }\n    }\n  } else if (zoomTail) {\n    ctx.fillStyle = '#38bdf8';\n    for (var n = nStart; n <= nEnd; n++) {\n      ctx.fillRect(toX(n) - 2, toY(getSample(n)) - 2, 4, 4);\n    }\n  }\n  ctx.restore();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 浮点理想波形', padL + 10, padT + 14);\n  if (!isFloat) {\n    ctx.fillStyle = bits <= 14 ? '#ec4899' : '#10b981';\n    ctx.fillText('— ' + bits + '位定点量化波形 (阶梯误差)', padL + 130, padT + 14);\n  }\n\n  var audioTip = lab.values.play ? (zoomTail ? '🔊 正在播放放大220倍后的尾音' : '🔊 正在播放宏观全量程衰减音') : '🔇 已静音';\n  lab.setReadout((isFloat ? '浮点模式' : bits + '位定点 (步长 ' + step.toExponential(2) + ')') + ' | 视角: ' + (zoomTail ? '尾音放大 ±0.001' : '全量程 ±1.0') + ' | ' + audioTip);\n});"
    },
    {
      "type": "concept",
      "heading": "算法对噪声的敏感度：皮实的 FIR 与脆弱的 IIR",
      "paragraphs": [
        "第二类极其依赖浮点数的场景，是**算法本身对舍入噪声极度敏感**的时候。这就不得不对比数字滤波器的两大阵营：FIR 与 IIR。",
        "**FIR（有限冲激响应）滤波器**对舍入噪声相当皮实。正如你在实验 1 中看到的，即使系数被严重量化，FIR 频响的整体形状和稳定性依然完好无损，只是曲线多了一层毛刺噪声。",
        "但 **IIR（无限冲激响应）滤波器**完全是另一回事。因为 IIR 内部存在输出到输入的**递归反馈环路**，每一次计算产生的微小舍入误差都会沿着反馈通道反复循环、不断积累放大，轻则导致截止频率锐度恶化、阻带衰减大幅缩水、阶跃响应严重过冲，重则直接让滤波器极点偏移出单位圆，引发**系统发散与彻底失稳（Unstable）**。因此，在追求高性能的 IIR 滤波设计中，浮点数几乎是不可或缺的护航者。"
      ],
      "formula": {
        "expr": "y[n] = Σ a_k · x[n-k] + Σ b_k · y[n-k]",
        "explain": "IIR 滤波器包含历史输出反馈项 b_k · y[n-k]；该反馈路径会把计算 y[n] 时产生的定点舍入误差不断回灌进系统，从而诱发振荡甚至不稳定。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "开发效率优先选浮点：浮点 DSP（如 SHARC）无需手动防溢出缩放，FIR 核心循环可精简至几行指令，大幅缩短开发与调试周期。",
        "定点开发三大铁律：每次算术运算后检查上溢/下溢、动态缩放数据，且中间累加必须使用扩展精度累加器，否则舍入误差会滚雪球。",
        "性能瓶颈判定法则：宏观波形下定点与浮点肉眼难辨；但若频响过冲或微弱尾音被随机噪声淹没（14/16 位定点常见症状），再优化算法也是徒劳，必须提升位宽或改用浮点。",
        "FIR 抗噪而 IIR 怕噪：16 位定点可胜任消费级音频（如 CD）与常规 FIR；但在 20~24 位专业音频或高阶 IIR 滤波器中，请果断采用浮点运算，谨防递归反馈导致的精度崩溃与系统失稳。"
      ]
    }
  ]
});
