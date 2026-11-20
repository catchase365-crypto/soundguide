window.__BOOK_REGISTER_SECTION__("sec_217", {
  "title": "系统的复数表示法（Complex Representation of Systems）",
  "intuition": "只要系统是线性的，一个单一频率的正弦波穿过系统后频率不变，系统对信号施加的“幅度缩放”和“相位偏移”都可以浓缩进一个复数里，用一次复数乘法就能算完。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把“线性系统”也变成一个复数",
      "paragraphs": [
        "在前一小节我们知道，复数加减法只适用于**同频率**的正弦波和**线性**运算。现在把这个视角推广到信号处理中最核心的对象——**线性系统（Linear System）**，比如放大器、衰减器、高通/低通滤波器等。",
        "假设输入是一个连续或离散的正弦波，由于系统是线性的，**输出必然也是一个正弦波，而且频率与输入完全相同**。线性系统唯一能改变的，只有两件事：正弦波的**幅度（变大或变小）**和**相位（向左或向右平移）**。",
        "既然输入信号、输出信号都能分别用一个复数来表示，那么**线性系统本身对这个频率所做的“改变”，同样可以用一个复数 $H$ 来表示**。在原书图 30-4 的经典例子中：输入信号为 $3\\cos(\\omega t + \\pi/4)$，输出信号为 $1.5\\cos(\\omega t - \\pi/8)$。系统把幅度缩小为了原来的 $0.5$ 倍（$1.5 / 3$），同时把相位移动了 $-3\\pi/8$（从 $+\\pi/4$ 变为 $-\\pi/8$）。"
      ],
      "formula": {
        "expr": "Y = X × H  （其中 |H| = M_out / M_in，∠H = Δφ）",
        "explain": "X 是输入正弦波对应的复数，Y 是输出正弦波对应的复数，H 是系统在该频率下的复数特性。在极坐标下，|H| 直接表示系统增益（输出幅值与输入幅值之比），∠H 表示系统引入的相移；复数相乘时“模长相乘、角度相加”，恰好同时完成幅度缩放与相位移动。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：用复数乘法驱动线性系统（极坐标视角 + 听觉对比）",
      "instruction": "拖动输入幅值、系统增益与系统相移滑块（默认参数即对应教材图 30-4），观察右侧相量矢量的旋转缩放与左侧时域波形的同步变化；点击播放可听觉对比输入与输出信号的响度差异。",
      "controls": [
        {
          "type": "slider",
          "id": "inAmp",
          "label": "输入幅值 M_in",
          "min": 0.5,
          "max": 3,
          "step": 0.1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "inPhase",
          "label": "输入初相 φ_in",
          "min": -180,
          "max": 180,
          "step": 2.5,
          "value": 45,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "sysGain",
          "label": "系统增益 |H|",
          "min": 0.1,
          "max": 1.5,
          "step": 0.05,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sysPhase",
          "label": "系统相移 Δφ",
          "min": -180,
          "max": 180,
          "step": 2.5,
          "value": -67.5,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "hearOutput",
          "label": "切换到收听输出信号（关=收听输入）",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放 220Hz 测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gainNode = null;\nlet isPlaying = false;\n\nfunction syncAudio() {\n  const v = lab.values;\n  if (v.play) {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      osc.type = 'sine';\n      osc.frequency.setValueAtTime(220, ac.currentTime);\n      gainNode.gain.setValueAtTime(0, ac.currentTime);\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.start();\n    }\n    const amp = v.hearOutput ? (v.inAmp * v.sysGain) : v.inAmp;\n    const target = Math.min(0.32, Math.max(0, amp * 0.07));\n    gainNode.gain.setTargetAtTime(target, ac.currentTime, 0.03);\n    isPlaying = true;\n  } else if (gainNode && isPlaying) {\n    const ac = lab.getAudioContext();\n    if (ac) gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    isPlaying = false;\n  }\n}\n\nfunction drawArrow(ctx, x1, y1, x2, y2, color, width, label) {\n  const dx = x2 - x1;\n  const dy = y2 - y1;\n  const len = Math.hypot(dx, dy);\n  ctx.save();\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = width;\n  ctx.beginPath();\n  ctx.moveTo(x1, y1);\n  ctx.lineTo(x2, y2);\n  ctx.stroke();\n  if (len > 6) {\n    const ang = Math.atan2(dy, dx);\n    const hl = Math.min(10, len * 0.35);\n    ctx.beginPath();\n    ctx.moveTo(x2, y2);\n    ctx.lineTo(x2 - hl * Math.cos(ang - 0.42), y2 - hl * Math.sin(ang - 0.42));\n    ctx.lineTo(x2 - hl * Math.cos(ang + 0.42), y2 - hl * Math.sin(ang + 0.42));\n    ctx.closePath();\n    ctx.fill();\n  }\n  if (label) {\n    ctx.font = 'bold 12px monospace';\n    const ox = dx >= 0 ? 6 : -22;\n    const oy = dy >= 0 ? 14 : -6;\n    ctx.fillText(label, x2 + ox, y2 + oy);\n  }\n  ctx.restore();\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const v = lab.values;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const inRad = v.inPhase * Math.PI / 180;\n  const sysRad = v.sysPhase * Math.PI / 180;\n  const outAmp = v.inAmp * v.sysGain;\n  const outRad = inRad + sysRad;\n\n  const plotX = 36;\n  const plotW = 420;\n  const plotCy = 124;\n  const scaleY = 20;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let a = -4; a <= 4; a++) {\n    const y = plotCy - a * scaleY;\n    ctx.beginPath();\n    ctx.moveTo(plotX, y);\n    ctx.lineTo(plotX + plotW, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 8; i++) {\n    const x = plotX + (plotW * i) / 8;\n    ctx.beginPath();\n    ctx.moveTo(x, plotCy - 88);\n    ctx.lineTo(x, plotCy + 88);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(plotX, plotCy);\n  ctx.lineTo(plotX + plotW, plotCy);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域波形 (2个周期 ωt ∈ [0, 4π])', plotX, 20);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = v.hearOutput ? 2 : 3.2;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px += 2) {\n    const theta = (px / plotW) * 4 * Math.PI;\n    const val = v.inAmp * Math.cos(theta + inRad);\n    const y = Math.max(24, Math.min(H - 12, plotCy - val * scaleY));\n    if (px === 0) ctx.moveTo(plotX + px, y);\n    else ctx.lineTo(plotX + px, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = v.hearOutput ? 3.2 : 2;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px += 2) {\n    const theta = (px / plotW) * 4 * Math.PI;\n    const val = outAmp * Math.cos(theta + outRad);\n    const y = Math.max(24, Math.min(H - 12, plotCy - val * scaleY));\n    if (px === 0) ctx.moveTo(plotX + px, y);\n    else ctx.lineTo(plotX + px, y);\n  }\n  ctx.stroke();\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText((!v.hearOutput && v.play ? '🔊 ' : '') + '输入 X', plotX + 230, 20);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText((v.hearOutput && v.play ? '🔊 ' : '') + '输出 Y = X·H', plotX + 310, 20);\n\n  const cx = 592;\n  const cy = 128;\n  const vecScale = 20;\n  const hUnitR = 46;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - 96, cy);\n  ctx.lineTo(cx + 96, cy);\n  ctx.moveTo(cx, cy - 92);\n  ctx.lineTo(cx, cy + 92);\n  ctx.stroke();\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n  ctx.beginPath();\n  ctx.arc(cx, cy, hUnitR, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('复平面相量 (虚线圆 |H|=1)', cx - 72, 20);\n\n  if (Math.abs(v.sysPhase) > 0.5) {\n    ctx.save();\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    const arcR = 24;\n    ctx.arc(cx, cy, arcR, -inRad, -outRad, v.sysPhase > 0);\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  const xEndX = cx + v.inAmp * vecScale * Math.cos(inRad);\n  const xEndY = cy - v.inAmp * vecScale * Math.sin(inRad);\n  const hEndX = cx + v.sysGain * hUnitR * Math.cos(sysRad);\n  const hEndY = cy - v.sysGain * hUnitR * Math.sin(sysRad);\n  const yEndX = cx + outAmp * vecScale * Math.cos(outRad);\n  const yEndY = cy - outAmp * vecScale * Math.sin(outRad);\n\n  drawArrow(ctx, cx, cy, xEndX, xEndY, '#38bdf8', 2.5, 'X');\n  drawArrow(ctx, cx, cy, hEndX, hEndY, '#f59e0b', 2.2, 'H');\n  drawArrow(ctx, cx, cy, yEndX, yEndY, '#10b981', 3, 'Y');\n\n  const normDeg = (((inRad + sysRad) * 180 / Math.PI + 540) % 360) - 180;\n  const xRe = (v.inAmp * Math.cos(inRad)).toFixed(3);\n  const xIm = (v.inAmp * Math.sin(inRad)).toFixed(3);\n  const hRe = (v.sysGain * Math.cos(sysRad)).toFixed(3);\n  const hIm = (v.sysGain * Math.sin(sysRad)).toFixed(3);\n  const yRe = (outAmp * Math.cos(outRad)).toFixed(3);\n  const yIm = (outAmp * Math.sin(outRad)).toFixed(3);\n\n  lab.setReadout(\n    '输入 X=' + v.inAmp.toFixed(2) + '∠' + v.inPhase.toFixed(1) + '° (' + xRe + (xIm >= 0 ? '+' : '') + xIm + 'j)' +\n    '  ×  系统 H=' + v.sysGain.toFixed(2) + '∠' + v.sysPhase.toFixed(1) + '° (' + hRe + (hIm >= 0 ? '+' : '') + hIm + 'j)' +\n    '  =  输出 Y=' + outAmp.toFixed(2) + '∠' + normDeg.toFixed(1) + '° (' + yRe + (yIm >= 0 ? '+' : '') + yIm + 'j)'\n  );\n});"
    },
    {
      "type": "concept",
      "heading": "直觉陷阱：系统复数的“直角坐标”千万别望文生义",
      "paragraphs": [
        "在前面的图 30-4 例子中，系统在极坐标下是幅值 $0.5$、相移 $-3\\pi/8$，转换成直角坐标形式是：$0.1913 - j\\,0.4619$。**这里藏着初学者最容易踩的大坑！**",
        "看到实部是 $0.1913$、虚部是 $-0.4619$，千万不要误以为“余弦波穿过系统会被放大 $0.1913$ 倍，正弦波穿过系统会被乘以 $-0.4619$”。**这是完全错误的！**",
        "真实物理过程是：**只要系统存在相移（虚部不为 0），一个纯粹的余弦波或纯粹的正弦波进入线性系统后，都会变成余弦波与正弦波的“混合体”**。因为三角恒等式告诉我们 $\\cos(\\omega t + \\Delta\\phi) = \\cos(\\Delta\\phi)\\cos(\\omega t) - \\sin(\\Delta\\phi)\\sin(\\omega t)$——哪怕输入里根本没有正弦分量，相移也会“凭空变出”正弦分量！",
        "幸运的是，复数乘法自动帮我们追踪了所有这些交叉生成项。把输入 $X = a_X + j b_X$ 与系统 $H = a_H + j b_H$ 按分配律展开相乘，实部与虚部分别各自贡献两条路径，精确抵消或叠加出最终的余弦与正弦幅度。"
      ],
      "formula": {
        "expr": "(a_X + j b_X)(a_H + j b_H) = (a_X a_H - b_X b_H) + j(a_X b_H + b_X a_H)",
        "explain": "在标准相量约定 x(t) = a·cos(ωt) - b·sin(ωt) 中：输出余弦幅度由 (a_X·a_H - b_X·b_H) 决定，输出正弦幅度由 -(a_X·b_H + b_X·a_H) 决定。注意四个“交叉项”的存在：即使输入正弦分量为 0（b_X = 0），只要系统虚部 b_H ≠ 0，交叉项 a_X·b_H 照样会在输出端产生正弦波！"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：透视“交叉项”——纯余弦如何变成正余弦混合输出",
      "instruction": "保持“输入正弦分量”为 0（输入纯余弦波），拖动“系统虚部 b_H”滑块，观察右侧交叉项流向图与左侧波形中粉色虚线（输出正弦分量）是如何从无到有生长出来的。",
      "controls": [
        {
          "type": "slider",
          "id": "inCos",
          "label": "输入余弦分量 c_in",
          "min": -2,
          "max": 2,
          "step": 0.25,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "inSin",
          "label": "输入正弦分量 s_in",
          "min": -2,
          "max": 2,
          "step": 0.25,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "hReal",
          "label": "系统实部 a_H",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "hImag",
          "label": "系统虚部 b_H",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": -0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "decompose",
          "label": "拆解显示输出的余弦与正弦分量",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const v = lab.values;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const aX = v.inCos;\n  const bX = -v.inSin;\n  const aH = v.hReal;\n  const bH = v.hImag;\n\n  const termCC = aX * aH;\n  const termSC = -bX * bH;\n  const cOut = termCC + termSC;\n\n  const termCS = -aX * bH;\n  const termSS = -bX * aH;\n  const sOut = termCS + termSS;\n\n  const plotX = 32;\n  const plotW = 410;\n  const cy = 124;\n  const scaleY = 26;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let k = -3; k <= 3; k++) {\n    const y = cy - k * scaleY;\n    ctx.beginPath();\n    ctx.moveTo(plotX, y);\n    ctx.lineTo(plotX + plotW, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 8; i++) {\n    const x = plotX + (plotW * i) / 8;\n    ctx.beginPath();\n    ctx.moveTo(x, cy - 84);\n    ctx.lineTo(x, cy + 84);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(plotX, cy);\n  ctx.lineTo(plotX + plotW, cy);\n  ctx.stroke();\n\n  function drawWave(fn, color, width, dashed) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    if (dashed) ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let px = 0; px <= plotW; px += 2) {\n      const t = (px / plotW) * 4 * Math.PI;\n      const y = Math.max(24, Math.min(H - 12, cy - fn(t) * scaleY));\n      if (px === 0) ctx.moveTo(plotX + px, y);\n      else ctx.lineTo(plotX + px, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  drawWave(t => v.inCos * Math.cos(t) + v.inSin * Math.sin(t), 'rgba(245, 158, 11, 0.55)', 1.8, false);\n\n  if (v.decompose) {\n    drawWave(t => cOut * Math.cos(t), '#38bdf8', 1.8, true);\n    drawWave(t => sOut * Math.sin(t), '#ec4899', 1.8, true);\n  }\n\n  drawWave(t => cOut * Math.cos(t) + sOut * Math.sin(t), '#10b981', 3, false);\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('输入 x(t)', plotX, 18);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('总输出 y(t)', plotX + 74, 18);\n  if (v.decompose) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('--- 输出余弦项', plotX + 162, 18);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('--- 输出正弦项', plotX + 266, 18);\n  }\n\n  const bx = 468;\n  const bw = 232;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(bx, 14, bw, 212);\n  ctx.strokeRect(bx, 14, bw, 212);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('交叉项能量分解', bx + 12, 35);\n\n  function drawBar(label, val, y, color) {\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px monospace';\n    ctx.fillText(label, bx + 12, y);\n    const barCenter = bx + 150;\n    const barMax = 62;\n    const len = Math.max(-barMax, Math.min(barMax, (val / 3.0) * barMax));\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(barCenter - barMax, y - 9, barMax * 2, 10);\n    ctx.fillStyle = color;\n    if (len >= 0) ctx.fillRect(barCenter, y - 9, len, 10);\n    else ctx.fillRect(barCenter + len, y - 9, -len, 10);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText((val >= 0 ? '+' : '') + val.toFixed(2), bx + 12, y + 13);\n  }\n\n  drawBar('余弦→余弦 (c_in·a_H)', termCC, 60, '#38bdf8');\n  drawBar('正弦→余弦 (s_in·b_H)', termSC, 92, '#38bdf8');\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('⇒ 输出余弦 c_out = ' + cOut.toFixed(2), bx + 12, 120);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.beginPath();\n  ctx.moveTo(bx + 10, 129);\n  ctx.lineTo(bx + bw - 10, 129);\n  ctx.stroke();\n\n  drawBar('余弦→正弦 (-c_in·b_H)', termCS, 148, '#ec4899');\n  drawBar('正弦→正弦 (s_in·a_H)', termSS, 180, '#ec4899');\n  ctx.fillStyle = '#ec4899';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('⇒ 输出正弦 s_out = ' + sOut.toFixed(2), bx + 12, 210);\n\n  lab.setReadout(\n    '输入 x(t) = ' + v.inCos.toFixed(2) + 'cos(ωt) ' + (v.inSin >= 0 ? '+' : '') + v.inSin.toFixed(2) + 'sin(ωt)' +\n    '  |  系统 H = ' + aH.toFixed(1) + (bH >= 0 ? '+' : '') + bH.toFixed(1) + 'j' +\n    '  |  输出 y(t) = ' + cOut.toFixed(2) + 'cos(ωt) ' + (sOut >= 0 ? '+' : '') + sOut.toFixed(2) + 'sin(ωt)'\n  );\n});"
    },
    {
      "type": "concept",
      "heading": "知二求三，以及实数傅里叶变换的“复数马甲”",
      "paragraphs": [
        "既然线性系统的输入、输出与系统本身构成了乘法关系 $Y = X \\times H$，那么**只要知道其中任意两个复数，就能立刻求出第三个**。如果测出了输入与输出，用复数除法 $H = Y / X$ 就能反推出系统特性（系统辨识）；如果已知输出和系统特性，用 $X = Y / H$ 就能还原被系统扭曲前的输入信号（逆滤波/均衡）。",
        "读到这里，你也能瞬间明白前面章节留下的一个命名悬念：为什么**实数傅里叶变换（Real Fourier Transform）**把信号分解成一堆余弦波和正弦波后，要把余弦波的幅度叫做**实部（Real part）**，把正弦波的幅度叫做**虚部（Imaginary part）**？",
        "因为通过把每对同频的余弦、正弦幅度打包成一个复数，一个 1024 点的信号分解出的 513 个余弦波和 513 个正弦波，就可以直接代换成 **513 个复数** 来表示整个频谱！",
        "**但请务必分清**：用代换法把实数傅里叶变换写进复数格式，本质上**依然是实数傅里叶变换**，只是穿了一件复数记法的“马甲”，千万不要误以为这就是第 31 章要讲的“复数傅里叶变换（Complex Fourier Transform）”。"
      ],
      "formula": {
        "expr": "H = Y / X   |   X = Y / H",
        "explain": "在频域中，微积分方程或卷积运算退化成了简单的复数乘除法。已知输入与输出即可做除法求系统频率响应 H；已知系统与输出即可做除法反推原始输入 X（前提是 H 在该频率处不为 0）。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "前提红线不可破：用复数乘法表示系统，严格要求系统是**线性的**且只针对**稳态单频正弦波**。遇到削波、整流、平方等非线性操作，或者把不同频率的复数直接相加，结果完全失去物理意义。",
        "直角坐标别猜“直通”：系统复数 H = a + jb 的实部和虚部绝不是“分别乘以余弦和正弦”，纯余弦穿过带虚部的系统一定会混合出正弦分量，复数乘法里的交叉项正是用来精确计算这种混合的。",
        "极坐标看物理，直角坐标写代码：分析滤波器幅频响应与相移时用极坐标（|H| 与 ∠H）；编写 DSP 频域乘除法、叠加运算代码时用直角坐标（实部与虚部），避免反复调用耗时的三角函数。",
        "别混淆两种傅里叶变换：把实数 DFT 得到的 513 组余弦/正弦幅值合并成 513 个复数，只是换了书写格式，依然属于实数傅里叶变换，与复数傅里叶变换（第 31 章）是两回事。",
        "原书图 30-4 符号勘误提醒：阅读《DSP Guide》原书图 30-4 时注意，作者在极坐标指数的正负号（-jπ/4、+j3π/8、+jπ/8）与直角坐标正负号上存在笔误不一致；工程写代码请统一遵循标准相量约定 X = M·e^(jφ) 对应 M·cos(ωt + φ) = a·cos(ωt) - b·sin(ωt)。"
      ]
    }
  ]
});
