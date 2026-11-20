window.__BOOK_REGISTER_SECTION__("sec_220", {
  "title": "数学等价性：正弦波与复指数的拆解 (Mathematical Equivalence)",
  "intuition": "现实世界中的每一条正弦或余弦波，本质上都是两个「反向旋转的复数指针」各出 1/2 力量、彼此抵消虚部后的完美合体——这就是“负频率”诞生的数学根源。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从欧拉公式到三角函数的“复数拆解”",
      "paragraphs": [
        "在实数傅里叶变换（Real DFT）中，直流分量 `ReX[0]` 和奈奎斯特分量 `ReX[N/2]` 在重建波形前必须手动除以 2，这在程序里好写，但在数学公式推导中非常别扭。为了引出更优雅的**复数傅里叶变换（Complex DFT）**，我们第一步必须搞清楚：普通的实数正弦波和余弦波，到底怎么用**复数**来表示？",
        "钥匙就是上一章介绍的**欧拉关系（Euler's relation）**：`e^(jx) = cos(x) + j sin(x)`（式 31-2）。乍看之下，这个公式似乎帮不上什么忙——它只是把一个复数指数，改写成了另一个包含实部和虚部的复数表达式。",
        "但只要动用一点点基础代数，把 `x` 替换成 `-x` 得到 `e^(-jx) = cos(x) - j sin(x)`，再将两式相加或相减，就能奇迹般地把虚部或实部消掉，从而得到用复指数表达纯实数余弦、正弦函数的标准恒等式（**式 31-3**）。"
      ],
      "formula": {
        "expr": "cos(x) = (e^(jx) + e^(-jx)) / 2  |  sin(x) = (e^(jx) - e^(-jx)) / (2j)",
        "explain": "e^(jx) 代表逆时针旋转的复指针，e^(-jx) 代表顺时针旋转的共轭复指针；相加抵消了虚部 sin(x) 留下 cos(x)，相减抵消了实部 cos(x) 再除以 2j 留下 sin(x)。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：双旋翼复数指针合成器 (式 31-3 / 31-4 几何直观)",
      "instruction": "观察左侧复平面中蓝色（正频率 +ω）与粉色（负频率 -ω）两根指针如何反向旋转，以及它们的合成矢量（绿色）如何始终牢牢锁定在实轴（Re）上并画出右侧的实数波形。",
      "controls": [
        {
          "type": "slider",
          "id": "omega",
          "label": "旋转角速度 ω",
          "min": 0.4,
          "max": 3,
          "step": 0.1,
          "value": 1.2,
          "unit": " rad/s"
        },
        {
          "type": "toggle",
          "id": "isSine",
          "label": "切换为正弦波 sin(ωt)（含 ±j 90° 相移）",
          "value": false
        },
        {
          "type": "toggle",
          "id": "paused",
          "label": "暂停指针旋转",
          "value": false
        }
      ],
      "jsCode": "var theta = 0;\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var isSine = lab.values.isSine;\n  ctx.clearRect(0, 0, W, H);\n\n  var cx = 130, cy = 120, R = 84;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.arc(cx, cy, R * 0.5, 0, Math.PI * 2);\n  ctx.moveTo(cx - R - 14, cy); ctx.lineTo(cx + R + 14, cy);\n  ctx.moveTo(cx, cy - R - 14); ctx.lineTo(cx, cy + R + 14);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re', cx + R + 4, cy - 5);\n  ctx.fillText('Im', cx + 5, cy - R - 4);\n  ctx.fillText('复平面矢量合成', 20, 18);\n\n  var c = Math.cos(theta), s = Math.sin(theta);\n  var vpRe, vpIm, vmRe, vmIm;\n  if (!isSine) {\n    vpRe = 0.5 * c; vpIm = 0.5 * s;\n    vmRe = 0.5 * c; vmIm = -0.5 * s;\n  } else {\n    vpRe = 0.5 * s; vpIm = -0.5 * c;\n    vmRe = 0.5 * s; vmIm = 0.5 * c;\n  }\n  var sumRe = vpRe + vmRe;\n  var sumIm = vpIm + vmIm;\n\n  function drawVec(x0, y0, dx, dy, color, width, dashed) {\n    var x1 = x0 + dx * R, y1 = y0 - dy * R;\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = width;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.moveTo(x0, y0);\n    ctx.lineTo(x1, y1);\n    ctx.stroke();\n    if (!dashed) {\n      var ang = Math.atan2(y1 - y0, x1 - x0);\n      ctx.beginPath();\n      ctx.moveTo(x1, y1);\n      ctx.lineTo(x1 - 8 * Math.cos(ang - 0.4), y1 - 8 * Math.sin(ang - 0.4));\n      ctx.lineTo(x1 - 8 * Math.cos(ang + 0.4), y1 - 8 * Math.sin(ang + 0.4));\n      ctx.closePath();\n      ctx.fill();\n    }\n    ctx.restore();\n  }\n\n  drawVec(cx, cy, vpRe, vpIm, '#38bdf8', 2.5, false);\n  drawVec(cx, cy, vmRe, vmIm, '#ec4899', 2.5, false);\n  drawVec(cx + vpRe * R, cy - vpIm * R, vmRe, vmIm, 'rgba(236,72,153,0.45)', 1.2, true);\n  drawVec(cx + vmRe * R, cy - vmIm * R, vpRe, vpIm, 'rgba(56,189,248,0.45)', 1.2, true);\n  drawVec(cx, cy, sumRe, sumIm, '#10b981', 3.5, false);\n\n  var px = 265, py = 28, pw = 435, ph = 184, midY = py + ph / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(px, midY); ctx.lineTo(px + pw, midY);\n  ctx.moveTo(px, py); ctx.lineTo(px, py + ph);\n  ctx.moveTo(px, midY - R); ctx.lineTo(px + pw, midY - R);\n  ctx.moveTo(px, midY + R); ctx.lineTo(px + pw, midY + R);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('时域波形投影 (绿色=合成实信号, 虚线=相互抵消的虚部)', px, 18);\n  ctx.fillText('+1.0', px - 28, midY - R + 4);\n  ctx.fillText('-1.0', px - 28, midY + R + 4);\n\n  var span = Math.PI * 4;\n  function plotCurve(fn, color, lw, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = lw;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    for (var i = 0; i <= 220; i++) {\n      var u = i / 220;\n      var ang = theta - (1 - u) * span;\n      var val = fn(ang);\n      var x = px + u * pw;\n      var y = midY - val * R;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  plotCurve(function(a){ return isSine ? -0.5 * Math.cos(a) : 0.5 * Math.sin(a); }, 'rgba(56,189,248,0.55)', 1.5, true);\n  plotCurve(function(a){ return isSine ? 0.5 * Math.cos(a) : -0.5 * Math.sin(a); }, 'rgba(236,72,153,0.55)', 1.5, true);\n  plotCurve(function(a){ return isSine ? Math.sin(a) : Math.cos(a); }, '#10b981', 2.8, false);\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath();\n  ctx.arc(px + pw, midY - sumRe * R, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  var deg = Math.round(((theta * 180 / Math.PI) % 360 + 360) % 360);\n  lab.setReadout('相位 ωt = ' + deg + '°  |  正频虚部 Im(+ω) = ' + vpIm.toFixed(2) + '  |  负频虚部 Im(-ω) = ' + vmIm.toFixed(2) + '  |  合成实部 Re = ' + sumRe.toFixed(2) + ' (总虚部恒为 0.00)');\n}\nlab.onUpdate(draw);\nlab.onLoop(function(dt) {\n  if (!lab.values.paused) {\n    theta += dt * lab.values.omega;\n  }\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "负频率的物理真相：正负频率的“平等地位”与 1/2 法则",
      "paragraphs": [
        "虽然式 31-3 是教科书里的标准三角恒等式，但为了看清信号处理的本质，原书作者把式 31-3 做了个非常巧妙的变形，将角度 `x` 写成角频率与时间的乘积 `ωt`，并把分母里的 `2` 和 `j` 拆成系数提出来，得到**式 31-4**。",
        "注意看式 31-4 中正弦波的系数变化：因为 `1/j = -j`，所以原本的 `(e^(jωt) - e^(-jωt)) / (2j)` 改写后变成了负频率项带 `+0.5j`、正频率项带 `-0.5j`。你可以代入 `ωt = π/2` 验算一下：`0.5j * (-j) - 0.5j * (j) = 0.5 + 0.5 = 1`，正好等于 `sin(π/2)`！",
        "这个公式揭示了一个极其深刻的事实：**当正弦或余弦波用复数形式表达时，每个表达式都必然由两个指数项相加而成——一项包含正频率 `(ω)`，另一项包含负频率 `(-ω)`**。负频率并不是人工硬凑的数学幽灵，而是复数表达实数波形时**自动伴生**的另一半。正频率与负频率享有完全平等的地位：各自出 `1/2` 的幅度，才能共同拼出一条完整的实数波形。"
      ],
      "formula": {
        "expr": "cos(ωt) = (1/2)e^(j(-ω)t) + (1/2)e^(jωt)  |  sin(ωt) = (1/2)j·e^(j(-ω)t) - (1/2)j·e^(jωt)",
        "explain": "无论 cos 还是 sin，正频率 (+ω) 与负频率 (-ω) 的复指数幅度都严格等于 1/2；正弦波只是给两项分别乘上了 +j 和 -j（即 ±90° 相位旋转）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：拆掉“负频率”会发生什么？（双边频谱与实时听感对比）",
      "instruction": "将「负频率分量权重」从 1.0 拖向 0.0，观察左侧频谱变化、右侧波形中虚部（粉色虚线）的泄漏以及实部幅度的衰减；点击「试听实部波形响度」可亲耳听出失去负频率后音量减半（-6 dB）的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "信号频率 f",
          "min": 180,
          "max": 520,
          "step": 10,
          "value": 260,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "negWeight",
          "label": "负频率分量权重",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "isSine",
          "label": "切换为正弦波 sin(ωt)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听实部波形响度",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "var osc = null;\nvar gainNode = null;\n\nfunction updateAudio() {\n  var ctx = lab.getAudioContext();\n  if (!ctx) return;\n  var freq = lab.values.freq;\n  var w = lab.values.negWeight;\n  var play = lab.values.play;\n  if (play) {\n    if (ctx.state === 'suspended') ctx.resume();\n    if (!osc) {\n      osc = ctx.createOscillator();\n      gainNode = ctx.createGain();\n      gainNode.gain.value = 0;\n      osc.connect(gainNode);\n      gainNode.connect(ctx.destination);\n      osc.start();\n    }\n    var amp = 0.5 * (1 + w);\n    osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(0.18 * amp, ctx.currentTime, 0.02);\n  } else if (gainNode) {\n    gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var freq = lab.values.freq;\n  var w = lab.values.negWeight;\n  var isSine = lab.values.isSine;\n  ctx.clearRect(0, 0, W, H);\n\n  var sx = 20, sy = 32, sw = 210, sh = 175;\n  var zeroX = sx + sw / 2, baseY = sy + sh - 18;\n  var maxBarH = sh - 46;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(sx, baseY); ctx.lineTo(sx + sw, baseY);\n  ctx.moveTo(zeroX, sy); ctx.lineTo(zeroX, baseY);\n  ctx.moveTo(sx, baseY - maxBarH); ctx.lineTo(sx + sw, baseY - maxBarH);\n  ctx.moveTo(sx, baseY - maxBarH * 0.5); ctx.lineTo(sx + sw, baseY - maxBarH * 0.5);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('双边复数频谱幅度', sx, 18);\n  ctx.fillText('1.0', sx, baseY - maxBarH - 4);\n  ctx.fillText('0.5', sx, baseY - maxBarH * 0.5 - 4);\n  ctx.fillText('0 Hz', zeroX - 12, baseY + 14);\n\n  var offset = 30 + (freq - 180) / 340 * 52;\n  var hPos = maxBarH * 0.5;\n  var hNeg = maxBarH * 0.5 * w;\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(zeroX + offset - 7, baseY - hPos, 14, hPos);\n  ctx.fillText('+f', zeroX + offset - 6, baseY + 14);\n\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(zeroX - offset - 7, baseY - hNeg, 14, hNeg);\n  ctx.fillText('-f', zeroX - offset - 5, baseY + 14);\n\n  var wx = 268, wy = 32, ww = 432, wh = 175;\n  var midY = wy + wh / 2, ampPx = wh * 0.42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(wx, midY); ctx.lineTo(wx + ww, midY);\n  ctx.moveTo(wx, midY - ampPx); ctx.lineTo(wx + ww, midY - ampPx);\n  ctx.moveTo(wx, midY + ampPx); ctx.lineTo(wx + ww, midY + ampPx);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('重建时域信号: 青绿=实部 Re(t)  |  粉红虚线=未抵消的虚部 Im(t)', wx, 18);\n\n  var cycles = (freq / 260) * 2.5;\n  ctx.save();\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= 300; i++) {\n    var u = i / 300;\n    var ang = u * cycles * Math.PI * 2;\n    var imVal = isSine ? 0.5 * (w - 1) * Math.cos(ang) : 0.5 * (1 - w) * Math.sin(ang);\n    var x = wx + u * ww, y = midY - imVal * ampPx;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (var j = 0; j <= 300; j++) {\n    var u2 = j / 300;\n    var ang2 = u2 * cycles * Math.PI * 2;\n    var reVal = 0.5 * (1 + w) * (isSine ? Math.sin(ang2) : Math.cos(ang2));\n    var x2 = wx + u2 * ww, y2 = midY - reVal * ampPx;\n    if (j === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);\n  }\n  ctx.stroke();\n\n  var realPeak = 0.5 * (1 + w);\n  var imagPeak = 0.5 * (1 - w);\n  lab.setReadout('正频幅度: 0.50  |  负频幅度: ' + (0.5 * w).toFixed(2) + '  |  合成实部峰值: ' + realPeak.toFixed(2) + '  |  残留虚部峰值: ' + imagPeak.toFixed(2));\n}\n\nlab.onUpdate(function() {\n  draw();\n  updateAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "坑点 1（幅度少算一半）：做复数 FFT/DFT 分析实数信号时，如果你只看正频率半边的谱峰，得到的幅度只有原时域波形峰值的一半（0.5）；必须把正、负频率两边的 0.5 加起来才是真实幅度。",
        "坑点 2（正弦波的符号与 j 因子）：切记式 31-4 中 sin(ωt) = (1/2)j·e^(-jωt) - (1/2)j·e^(jωt)，正频率项前面带的是负号（-1/2 j），负频率项前面才是正号（+1/2 j），写复数基函数推导时极易写反。",
        "核心结论：负频率不是物理世界的怪胎，而是实信号用复指数表达时为了“消除虚部、凑齐幅度”必须存在的另一半对称镜像。"
      ]
    }
  ]
});
