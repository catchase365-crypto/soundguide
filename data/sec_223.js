window.__BOOK_REGISTER_SECTION__("sec_223", {
  "title": "为什么使用复数傅里叶变换 (Why the Complex Fourier Transform is Used)",
  "intuition": "实数傅里叶变换的种种别扭并非复数变换‘解决’了它们，而是强行把物理世界限制在实数轴上‘人为制造’出来的——复数傅里叶变换才是描述信号对称性与物理本质的‘更深层真实’。",
  "blocks": [
    {
      "type": "concept",
      "heading": "实用主义 vs. 专业语言：你真的需要复数 DFT 吗？",
      "paragraphs": [
        "学完第 31 章前面复杂繁琐的推导，任何一个工程读者都会忍不住发问：**复数 DFT 明显比实数 DFT 复杂得多，花这么大力气学习这些精密的复变数学，到底值不值得？**",
        "作者 Steven W. Smith 给出了非常坦诚的回答：这完全取决于你是谁、用 DSP 做什么。本书的一个基本前提是，**绝大多数实用的 DSP 技术都可以在不借助复数变换的情况下理解和工程落地**。如果你学习 DSP 只是为了辅助自己所在领域的非 DSP 科研或工程项目，那么复数 DFT 很可能是“杀鸡用牛刀”。",
        "但如果你希望深入数字信号处理领域，情况就完全不同了：**复数数学是全球 DSP 专业人士的母语**。不懂这套语言，你就无法与业内专家沟通，也看不懂主流的 DSP 专业教材、学术论文和技术文献。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "DSP 专家钟情复数变换的四大硬核红利",
      "paragraphs": [
        "对照表 31-1（Table 31-1）中四种傅里叶变换（DFT、DTFT、Fourier Series、Fourier Transform）的复数版本与实数版本，复数形式带来的工程与数学优势一目了然：",
        "1. **方程极度紧凑**：实数变换必须把频谱硬生生拆成 `Re X[k]`（余弦分析）和 `Im X[k]`（负正弦分析）两套公式；而复数变换借助欧拉复指数 `e^{±jωt}`，分析与综合各自只需**一条方程**。",
        "2. **分析与综合高度对称**：复数 DFT 的正变换（Analysis）与逆变换（Synthesis）结构几乎完全镜像，只差一个指数上的负号和缩放因子 `1/N`。",
        "3. **时频域对称与负频率的自然引入**：复数形式让正频率与负频率成对出现，使实信号天然具备共轭对称性，频移、调制等运算退化为极简的复指数相乘。",
        "4. **通往 Laplace 与 z 变换的必经踏板**：复频域思维直接衔接第 32 章的 Laplace 变换（`s` 平面）与第 33 章的 z 变换（`z` 平面），用于求解物理微分与差分方程。"
      ],
      "formula": {
        "expr": "X[k] = (1/N) Σ_{n=0}^{N-1} x[n]·e^{-j2πkn/N}   <--->   x[n] = Σ_{k=0}^{N-1} X[k]·e^{j2πkn/N}",
        "explain": "x[n] 为离散时域信号，X[k] 为离散频域复频谱，N 为周期点数，j 为虚数单位。分析（左）与综合（右）形式高度对称、无需拆分成 cos/sin 两项，也无需任何特殊点的分段处理。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：正负频率相量如何“合谋”消去虚部",
      "instruction": "观察左侧复平面上 +k 与 -k 两个反向旋转相量如何相加，尝试关闭“包含负频率共轭项 (-k)”开关，看看右侧时域波形的虚部（橙线）会发生什么变化。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号频率 k",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " 周期"
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "初始相位 φ",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showNeg",
          "label": "包含负频率共轭项 (-k)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "开启相量旋转动画",
          "value": true
        }
      ],
      "jsCode": "var tPhase = 0.15;\nfunction draw() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var freq = lab.values.freq;\n  var phi = lab.values.phase * Math.PI / 180;\n  var showNeg = lab.values.showNeg;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var cx = 120, cy = 125, R = 76;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.moveTo(cx - R - 14, cy); ctx.lineTo(cx + R + 14, cy);\n  ctx.moveTo(cx, cy - R - 14); ctx.lineTo(cx, cy + R + 14);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re', cx + R + 4, cy - 4);\n  ctx.fillText('Im', cx + 5, cy - R - 4);\n  ctx.fillText('复平面反向旋转相量', 64, 20);\n\n  var ang = 2 * Math.PI * freq * tPhase + phi;\n  var pRe = 0.5 * Math.cos(ang);\n  var pIm = 0.5 * Math.sin(ang);\n  var nRe = showNeg ? 0.5 * Math.cos(-ang) : 0;\n  var nIm = showNeg ? 0.5 * Math.sin(-ang) : 0;\n  var sRe = pRe + nRe;\n  var sIm = pIm + nIm;\n\n  function drawVec(dx, dy, color, label) {\n    var ex = cx + dx * R, ey = cy - dy * R;\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    ctx.moveTo(cx, cy);\n    ctx.lineTo(ex, ey);\n    ctx.stroke();\n    var a = Math.atan2(ey - cy, ex - cx);\n    ctx.beginPath();\n    ctx.moveTo(ex, ey);\n    ctx.lineTo(ex - 7 * Math.cos(a - 0.4), ey - 7 * Math.sin(a - 0.4));\n    ctx.lineTo(ex - 7 * Math.cos(a + 0.4), ey - 7 * Math.sin(a + 0.4));\n    ctx.closePath();\n    ctx.fill();\n    if (label) {\n      ctx.font = '11px sans-serif';\n      ctx.fillText(label, ex + 5, ey - 4);\n    }\n  }\n\n  if (showNeg) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    ctx.moveTo(cx + pRe * R, cy - pIm * R);\n    ctx.lineTo(cx + sRe * R, cy - sIm * R);\n    ctx.lineTo(cx + nRe * R, cy - nIm * R);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  drawVec(pRe, pIm, '#38bdf8', '+k');\n  if (showNeg) drawVec(nRe, nIm, '#ec4899', '-k');\n  drawVec(sRe, sIm, '#10b981', '合');\n\n  var x0 = 260, wPlot = 435, y0 = 125, ampScale = 76;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (var g = -1; g <= 1; g += 0.5) {\n    var gy = y0 - g * ampScale;\n    ctx.moveTo(x0, gy); ctx.lineTo(x0 + wPlot, gy);\n  }\n  for (var gx = 0; gx <= 4; gx++) {\n    var xx = x0 + (gx / 4) * wPlot;\n    ctx.moveTo(xx, y0 - ampScale - 8); ctx.lineTo(xx, y0 + ampScale + 8);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域波形 x(t)：绿=实部 Re{x(t)}  橙=虚部 Im{x(t)}', x0, 20);\n\n  var steps = 220;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i = 0; i <= steps; i++) {\n    var tt = i / steps;\n    var a2 = 2 * Math.PI * freq * tt + phi;\n    var imVal = showNeg ? 0 : 0.5 * Math.sin(a2);\n    var px = x0 + tt * wPlot, py = y0 - imVal * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= steps; i++) {\n    var tt = i / steps;\n    var a2 = 2 * Math.PI * freq * tt + phi;\n    var reVal = (showNeg ? 1.0 : 0.5) * Math.cos(a2);\n    var px = x0 + tt * wPlot, py = y0 - reVal * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var curX = x0 + (tPhase % 1) * wPlot;\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(curX, y0 - ampScale); ctx.lineTo(curX, y0 + ampScale);\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath();\n  ctx.arc(curX, y0 - sRe * ampScale, 4.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  if (!showNeg) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(curX, y0 - sIm * ampScale, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var msg = showNeg\n    ? '正负频率共轭对称：Im{x(t)} = 0.00（虚部彻底抵消，输出纯实数余弦波） | 当前 Re = ' + sRe.toFixed(2)\n    : '关闭负频率 (-k)：虚部不再抵消！当前 Re = ' + sRe.toFixed(2) + ', Im = ' + sIm.toFixed(2) + '（波形变成复数信号）';\n  lab.setReadout(msg);\n}\n\nlab.onUpdate(function() { draw(); });\nlab.onLoop(function(dt) {\n  if (lab.values.animate) {\n    tPhase = (tPhase + dt * 0.18) % 1;\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "更深层的哲学原因：复数是物理系统的“真实”（Truth）",
      "paragraphs": [
        "除了方程紧凑和对称性，Steven W. Smith 还点出了一个常被忽略的哲学层面原因——**真实性（Truth）**。",
        "在第 31 章开头，我们曾列举过实数傅里叶变换的种种别扭之处：正弦系数 `Im X[k]` 莫名其妙要加一个负号、分析与综合公式不对称、以及在合成实数 DFT 和傅里叶级数之前必须手动把 `Re X[0]` 和 `Re X[N/2]` 除以 2 等等。当我们引入复数傅里叶变换后，这些问题瞬间全部消失了。于是我们常夸赞：“太棒了，复数傅里叶变换解决了这些数学麻烦！”",
        "但 Smith 指出，这种看法其实颠倒了因果：**尽管复数概念听起来抽象，复数傅里叶变换才真正准确地描述了物理系统是如何运转的**。那些别扭的麻烦，根本不是复数傅里叶变换“解决”的，而是**当我们强行把数学限制在实数范围内时，由实数傅里叶变换自己“制造”出来的**。",
        "在数学家和学术界眼中，复数傅里叶变换代表着比实数傅里叶变换**更高层次的真实**——它不仅能解出手头的具体工程问题，更能揭示物理世界本来的面貌。"
      ],
      "formula": {
        "expr": "cos(θ) = (e^{jθ} + e^{-jθ}) / 2",
        "explain": "欧拉公式揭示了实数余弦波的本质：它不是天然的基本原子，而是正频率与负频率两个复指数旋转相量在实轴上的投影之和。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：实数 DFT 的“除以 2 补丁”陷阱与复数大一统（含音频对比）",
      "instruction": "调节直流分量 (k=0) 与奈奎斯特分量 (k=N/2)，切换“忘记除以 2”开关，对比复数 DFT 的天然精确与实数 DFT 漏掉特殊缩放补丁时的时域失真，并点击试听按钮感受高频倍增与削波听感。",
      "controls": [
        {
          "type": "slider",
          "id": "dc",
          "label": "直流分量 DC (k=0)",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "ampK",
          "label": "基波幅度 (k=2)",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nyq",
          "label": "奈奎斯特分量 (k=N/2)",
          "min": 0,
          "max": 0.8,
          "step": 0.1,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "forgetHalf",
          "label": "模拟实数 DFT 忘记把 ReX[0] 和 ReX[N/2] 除以 2",
          "value": true
        },
        {
          "type": "audio",
          "id": "playAudio",
          "label": "▶ 试听重建信号差异",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var audioSrc = null;\nvar masterGain = null;\n\nfunction updateAudio() {\n  var play = lab.values.playAudio;\n  if (!play) {\n    if (audioSrc) {\n      try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n      audioSrc = null;\n    }\n    return;\n  }\n  var ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!masterGain) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0.85;\n    masterGain.connect(ac.destination);\n  }\n  var sr = ac.sampleRate;\n  var len = sr;\n  var buf = ac.createBuffer(1, len, sr);\n  var ch = buf.getChannelData(0);\n  var dc = lab.values.dc;\n  var ampK = lab.values.ampK;\n  var nyq = lab.values.nyq;\n  var scale = lab.values.forgetHalf ? 2.0 : 1.0;\n\n  var sum = 0;\n  for (var i = 0; i < len; i++) {\n    var t = i / sr;\n    var raw = scale * dc + ampK * Math.cos(2 * Math.PI * 220 * t) + scale * nyq * Math.cos(2 * Math.PI * 880 * t);\n    var clipped = Math.tanh(raw * 0.95) * 0.28;\n    ch[i] = clipped;\n    sum += clipped;\n  }\n  var mean = sum / len;\n  for (var j = 0; j < len; j++) ch[j] -= mean;\n\n  if (audioSrc) {\n    try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {}\n  }\n  audioSrc = ac.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(masterGain);\n  audioSrc.start();\n}\n\nfunction draw() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  var N = 16;\n  var dc = lab.values.dc;\n  var ampK = lab.values.ampK;\n  var nyq = lab.values.nyq;\n  var bug = lab.values.forgetHalf;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var x0 = 32, wPlot = 335, yBase = 165, yScale = 27;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (var g = -2; g <= 4; g++) {\n    var gy = yBase - g * yScale;\n    ctx.moveTo(x0, gy); ctx.lineTo(x0 + wPlot, gy);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(x0, yBase); ctx.lineTo(x0 + wPlot, yBase);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域重建 x[n] (N=16)：蓝=复数DFT精确  ' + (bug ? '粉=实数DFT忘记÷2(失真)' : '绿=实数DFT正确÷2'), 20, 20);\n\n  var maxErr = 0;\n  for (var n = 0; n < N; n++) {\n    var px = x0 + (n / (N - 1)) * wPlot;\n    var xTrue = dc + ampK * Math.cos(2 * Math.PI * 2 * n / N) + nyq * Math.cos(Math.PI * n);\n    var scale = bug ? 2.0 : 1.0;\n    var xReal = scale * dc + ampK * Math.cos(2 * Math.PI * 2 * n / N) + scale * nyq * Math.cos(Math.PI * n);\n    var err = Math.abs(xReal - xTrue);\n    if (err > maxErr) maxErr = err;\n\n    var yTrue = yBase - xTrue * yScale;\n    var yReal = yBase - xReal * yScale;\n\n    ctx.strokeStyle = bug ? '#ec4899' : '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px + 2, yBase);\n    ctx.lineTo(px + 2, yReal);\n    ctx.stroke();\n    ctx.fillStyle = bug ? '#ec4899' : '#10b981';\n    ctx.beginPath();\n    ctx.arc(px + 2, yReal, 4, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px - 2, yBase);\n    ctx.lineTo(px - 2, yTrue);\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(px - 2, yTrue, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var sx = 410, sw = 285;\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('复数频谱 |X[k]| (k=0..15, 零补丁统一公式)', sx, 20);\n\n  var cSpec = [];\n  for (var k = 0; k < N; k++) {\n    if (k === 0) cSpec.push(dc);\n    else if (k === 2 || k === 14) cSpec.push(ampK / 2);\n    else if (k === 8) cSpec.push(nyq);\n    else cSpec.push(0);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(sx, 102); ctx.lineTo(sx + sw, 102);\n  ctx.stroke();\n  for (var k = 0; k < N; k++) {\n    var bx = sx + (k / N) * sw + 4;\n    var bh = Math.min(cSpec[k], 1.6) * 42;\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(bx, 102 - bh, 11, bh);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.fillText('实数频谱 ReX[k] (k=0..8, 需手动 ÷2 的 2 倍陷阱)', sx, 132);\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(sx, 215); ctx.lineTo(sx + sw, 215);\n  ctx.stroke();\n\n  for (var k = 0; k <= 8; k++) {\n    var val = 0;\n    if (k === 0) val = bug ? 2 * dc : dc;\n    else if (k === 2) val = ampK;\n    else if (k === 8) val = bug ? 2 * nyq : nyq;\n    var bx = sx + (k / 9) * sw + 6;\n    var bh = Math.min(val, 2.0) * 35;\n    var isTrap = bug && (k === 0 || k === 8);\n    ctx.fillStyle = isTrap ? '#f59e0b' : '#10b981';\n    ctx.fillRect(bx, 215 - bh, 18, bh);\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(k), bx + 5, 228);\n  }\n\n  lab.setReadout(\n    bug\n      ? '实数 DFT 未除以 2：DC 与 Nyquist 被放大 2 倍！最大重建误差 = ' + maxErr.toFixed(2) + '（试听可感知高频倍增与削波失真）'\n      : '已对 ReX[0] 和 ReX[N/2] 执行 ÷2 补丁：重建误差 = 0.00，与复数 DFT 完全重合。'\n  );\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "实用选型准则：如果只是把 DSP 当工具解决非 DSP 领域问题，实数 DFT 完全够用；但想读懂学术论文、核心教材并深入现代信号处理（如 Laplace 变换和 z 变换），复数傅里叶变换是绕不开的“行业母语”。",
        "实数 DFT 的头号代码坑：采用 2/N 缩放的实数 DFT 与实数傅里叶级数在逆变换合成前，必须手动将 Re X[0]（及离散情况下的 Re X[N/2]）除以 2，否则直流偏置和奈奎斯特频率幅度会直接翻倍。",
        "复数变换的核心直觉：实信号在频域天然包含正、负对称的共轭频率分量；正负频率相量反向旋转叠加，才让虚部精确归零。",
        "数学哲学视角：实数变换的种种不对称和特殊补丁是强行限定实数域制造的“人为假象”，复数变换才是物理系统原本的对称形态。"
      ]
    }
  ]
});
