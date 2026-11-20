window.__BOOK_REGISTER_SECTION__("sec_229", {
  "title": "z 域的本质 (The Nature of the z-Domain)",
  "intuition": "z 变换本质上是把拉普拉斯变换的直角 s 平面“卷”成一个极坐标圆盘：用半径 r 控制指数衰减速率，用旋转角度 ω 表示数字频率，而半径为 1 的单位圆正是离散系统频率响应的跑道。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从拉普拉斯变换到 z 变换的三步蜕变",
      "paragraphs": [
        "在上一章我们知道，拉普拉斯变换通过带有指数变化幅度的正弦/余弦波去探测连续时间信号 `x(t)`。把复变量 `s` 拆成实部与虚部 `s = σ + jω` 后，连续域的探测公式为 `X(σ, ω) = ∫ x(t) e^(-σt) e^(-jωt) dt`（积分从负无穷到正无穷）。当信号为实信号时，平面的上下两半互为镜像，其中 `σ` 控制指数包络的衰减快慢，`ω` 控制余弦与正弦波的振荡频率。",
        "要将这套连续系统的分析武器搬进离散数字世界，只需完成 **三步变形**：",
        "**第一步：连续化离散。** 将连续时间变量 `t` 替换为离散样本序号 `n`，将积分号 `∫` 替换为求和号 `∑`，得到 `X(σ, ω) = ∑ x[n] e^(-σn) e^(-jωn)`。注意这里的 `X(σ, ω)` 依然使用圆括号而非方括号，因为虽然输入信号 `x[n]` 已经离散化，但探测参数 `σ` 和 `ω` 仍然可以在连续实数范围内取值。",
        "**第二步：改写指数项。** 把拉普拉斯常用的自然指数形式 `e^(-σn)` 改写为幂指形式 `r^(-n)`，于是表达式变为 `X(r, ω) = ∑ x[n] r^(-n) e^(-jωn)`。",
        "**第三步：极坐标打包。** 就像拉普拉斯变换引入复变量 `s = σ + jω` 来简化书写一样，我们在离散域定义一个极坐标复变量 `z = r e^(jω)`，将半径 `r` 和角度 `ω` 打包成一个整体，最终得到标准的 z 变换定义。"
      ],
      "formula": {
        "expr": "X(z) = Σ_{n=-∞}^{∞} x[n] z^(-n)，其中 z = r · e^(jω)",
        "explain": "x[n] 是离散时域信号；z 是极坐标形式的复变量，r 为到原点的距离（控制指数衰减），ω 为与正实轴的夹角（代表数字角频率）；X(z) 为信号的 z 域复数表示。"
      }
    },
    {
      "type": "concept",
      "heading": "二、为什么非要多此一举用 r^(-n) 和 z？",
      "paragraphs": [
        "刚接触数字信号处理的同学常会疑惑：既然 `e^(-σn)` 已经用得好好的，为什么还要换个马甲写成 `r^(-n)`，再用 `z` 代替 `s` 呢？",
        "原因非常工程化：**为了递归滤波器（IIR）的代数转换简单到极致。** 递归滤波器在代码里是用一组差分方程的“递归系数”来实现的，而在 z 域分析系统特性时，我们需要把这些系数变成传递函数，或者从传递函数反推出代码系数。用 `r^n` 和 `z` 来定义变换，恰好能让“差分方程系数 ↔ z 域传递函数”之间的互转变成最直观的多项式代数操作，几乎不费吹灰之力。",
        "从数学本身来看，`y[n] = e^(-σn)` 和 `y[n] = r^(-n)` 描述的是完全相同的指数曲线（如原书图 33-1 所示）：在底数形式下，**`r > 1` 时序列随 `n` 增大而衰减，`r < 1` 时随 `n` 增大而发散，`r = 1` 时恒定为 1**。两者可以通过对数关系无缝互换。"
      ],
      "formula": {
        "expr": "r^(-n) = [e^ln(r)]^(-n) = e^(-n·ln(r)) = e^(-σn)  ⇒  σ = ln(r) 或 r = e^σ",
        "explain": "σ 与 r 是一对一的指数/对数映射：当 r > 1 时 σ > 0（曲线衰减）；当 r = 1 时 σ = 0（恒为 1）；当 0 < r < 1 时 σ < 0（曲线增长）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：指数探针 r^(-n) 与 e^(-σn) 的等效性（复刻图 33-1）",
      "instruction": "拖动极坐标半径 r 与数字频率 ω 滑块，验证离散序列 r^(-n) 与连续包络 e^(-σn) 的完美重合，并观察正弦调制后的复探针波形。",
      "controls": [
        {
          "type": "slider",
          "id": "r",
          "label": "极坐标半径 r",
          "min": 0.85,
          "max": 1.15,
          "step": 0.01,
          "value": 1.1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "数字角频率 ω",
          "min": 0,
          "max": 3.14,
          "step": 0.05,
          "value": 0.6,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "showWave",
          "label": "叠加调制探针 r^(-n)cos(ωn)",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const r = lab.values.r;\n  const omega = lab.values.omega;\n  const showWave = lab.values.showWave;\n  const sigma = Math.log(r);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const x0 = 60, x1 = 685;\n  const yZero = 135;\n  const nMin = -10, nMax = 10;\n  const xStep = (x1 - x0) / (nMax - nMin);\n  const yScale = 26;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = -3; g <= 4; g++) {\n    const gy = yZero - g * yScale;\n    if (gy >= 18 && gy <= H - 18) {\n      ctx.beginPath();\n      ctx.moveTo(x0, gy);\n      ctx.lineTo(x1, gy);\n      ctx.stroke();\n      if (g === 0 || g === 1 || g === 2 || g === 3 || g === -2) {\n        ctx.fillStyle = 'rgba(255,255,255,0.45)';\n        ctx.font = '11px monospace';\n        ctx.textAlign = 'right';\n        ctx.fillText(String(g), x0 - 8, gy + 4);\n      }\n    }\n  }\n  for (let gn = nMin; gn <= nMax; gn += 5) {\n    const gx = x0 + (gn - nMin) * xStep;\n    ctx.beginPath();\n    ctx.moveTo(gx, 18);\n    ctx.lineTo(gx, H - 22);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(255,255,255,0.5)';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('n=' + gn, gx, H - 6);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(x0, yZero);\n  ctx.lineTo(x1, yZero);\n  ctx.stroke();\n  const xOrigin = x0 + (0 - nMin) * xStep;\n  ctx.beginPath();\n  ctx.moveTo(xOrigin, 18);\n  ctx.lineTo(xOrigin, H - 22);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= 120; i++) {\n    const nt = nMin + (nMax - nMin) * (i / 120);\n    const val = Math.exp(-sigma * nt);\n    const px = x0 + (nt - nMin) * xStep;\n    const py = Math.max(12, Math.min(H - 18, yZero - val * yScale));\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (let n = nMin; n <= nMax; n++) {\n    const px = x0 + (n - nMin) * xStep;\n    const env = Math.pow(r, -n);\n    const pyClamped = Math.max(16, Math.min(H - 20, yZero - env * yScale));\n\n    ctx.strokeStyle = 'rgba(16,185,129,0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, yZero);\n    ctx.lineTo(px, pyClamped);\n    ctx.stroke();\n\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(px - 3.5, pyClamped - 3.5, 7, 7);\n\n    if (showWave) {\n      const modVal = env * Math.cos(omega * n);\n      const pyMod = Math.max(16, Math.min(H - 20, yZero - modVal * yScale));\n      ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath();\n      ctx.moveTo(px, yZero);\n      ctx.lineTo(px, pyMod);\n      ctx.stroke();\n\n      ctx.fillStyle = '#f59e0b';\n      ctx.beginPath();\n      ctx.arc(px, pyMod, 3.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  ctx.textAlign = 'left';\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('■ 离散包络 r^(-n)', 20, 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('-- 等效连续曲线 e^(-σn)', 160, 22);\n  if (showWave) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('● 调制探针实部 r^(-n)cos(ωn)', 340, 22);\n  }\n\n  const trend = r > 1.005 ? '随 n 增大衰减 (对应 σ > 0)' : (r < 0.995 ? '随 n 增大发散 (对应 σ < 0)' : '恒定为 1 (对应 σ = 0)');\n  lab.setReadout('r = ' + r.toFixed(2) + '  |  σ = ln(r) = ' + sigma.toFixed(3) + '  |  包络趋势: ' + trend + '  |  ω = ' + omega.toFixed(2) + ' rad');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、几何变形记：从直角 s 平面“卷”成极坐标 z 平面",
      "paragraphs": [
        "拉普拉斯的 **s 平面** 采用的是**直角坐标系**：横轴是衰减参数 `σ`，纵轴是频率 `ω`。而 z 变换的 **z 平面** 采用的是**极坐标系**：到原点的距离 `r` 代表指数衰减参数，从正实轴逆时针转过的角度 `ω` 代表频率。",
        "由于 `r = e^σ`，这两个平面之间发生了奇妙的几何对应：**s 平面上的每一条竖直直线（`σ` 为常数），映射到 z 平面上就变成了一个以原点为圆心的同心圆（`r` 为常数）**。其中最关键的三块区域对应关系如下：",
        "1. **s 平面的虚轴 (`σ = 0`) ↔ z 平面的单位圆 (`r = 1`)**：这是系统稳定与否的分界线。",
        "2. **s 平面的左半平面 (`σ < 0`) ↔ z 平面的单位圆内部 (`r < 1`)**：在连续系统中，极点位于左半平面意味着脉冲响应随时间衰减（稳定）；对应到离散系统，**极点必须全部位于单位圆内部 (`r < 1`)，系统才是稳定的**。",
        "3. **s 平面的右半平面 (`σ > 0`) ↔ z 平面的单位圆外部 (`r > 1`)**：只要有任何一个极点跑到单位圆外面，离散系统的脉冲响应就会指数级爆炸，系统彻底失稳。",
        "同样地，当数字信号为纯实数时（绝大多数工程场景），z 平面的上半圆和下半圆也与 s 平面一样，完全上下对称、互为镜像。"
      ],
      "formula": {
        "expr": "s = σ + jω  ——(z = e^s)——▶  z = e^σ · e^(jω) = r · e^(jω)",
        "explain": "实部 σ 决定半径 r = e^σ（σ<0 落入单位圆内，σ=0 落在单位圆上，σ>0 溢出单位圆外）；虚部 ω 直接变成极坐标旋转角。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：s 平面与 z 平面实时映射暨极点稳定性“听诊器”",
      "instruction": "拖动 σ 与 ω 滑块观察两平面极点（×）与等衰减线/同心圆的对应；开启声音后可试听该极点脉冲响应的衰减或发散听感，把 ω 拖过 3.14 还能亲耳听到“频率卷绕”！",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "衰减实部 σ",
          "min": -0.25,
          "max": 0.15,
          "step": 0.01,
          "value": -0.05,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "数字频率 ω (角度)",
          "min": 0,
          "max": 4.5,
          "step": 0.05,
          "value": 0.8,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "showCircle",
          "label": "显示 s 竖线与 z 同心圆映射",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放极点脉冲响应音",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gainNode = null;\nlet audioPhaseTime = 0;\n\nfunction wrapToPi(w) {\n  return Math.atan2(Math.sin(w), Math.cos(w));\n}\n\nfunction draw(timeSec) {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const sigma = lab.values.sigma;\n  const omega = lab.values.omega;\n  const showCircle = lab.values.showCircle;\n  const r = Math.exp(sigma);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const isUnstable = sigma > 0.005;\n  const isMarginal = Math.abs(sigma) <= 0.005;\n  const poleColor = isUnstable ? '#ec4899' : (isMarginal ? '#f59e0b' : '#10b981');\n\n  const sx0 = 195, sy0 = 122;\n  const sScaleX = 360;\n  const sScaleY = 20;\n\n  ctx.fillStyle = 'rgba(236,72,153,0.08)';\n  ctx.fillRect(sx0, 22, 125, H - 38);\n  ctx.fillStyle = 'rgba(16,185,129,0.06)';\n  ctx.fillRect(35, 22, sx0 - 35, H - 38);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(35, 22, 285, H - 38);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(35, sy0); ctx.lineTo(320, sy0);\n  ctx.moveTo(sx0, 22); ctx.lineTo(sx0, H - 16);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('s 平面 (直角坐标: σ + jω)', 42, 16);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(255,255,255,0.6)';\n  ctx.fillText('Re(σ)', 282, sy0 - 6);\n  ctx.fillText('Im(ω)', sx0 + 6, 34);\n  ctx.fillStyle = 'rgba(236,72,153,0.75)';\n  ctx.fillText('右半平面(不稳定)', sx0 + 8, H - 24);\n\n  const pxS = sx0 + sigma * sScaleX;\n  const pyS1 = sy0 - omega * sScaleY;\n  const pyS2 = sy0 + omega * sScaleY;\n\n  if (showCircle) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.moveTo(pxS, 22);\n    ctx.lineTo(pxS, H - 16);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  function drawCross(x, y, color) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    ctx.moveTo(x - 5, y - 5); ctx.lineTo(x + 5, y + 5);\n    ctx.moveTo(x + 5, y - 5); ctx.lineTo(x - 5, y + 5);\n    ctx.stroke();\n  }\n  drawCross(pxS, pyS1, poleColor);\n  if (omega > 0.02) drawCross(pxS, pyS2, poleColor);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('z = e^s', 360, 108);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(334, 122); ctx.lineTo(384, 122);\n  ctx.lineTo(377, 117); ctx.moveTo(384, 122); ctx.lineTo(377, 127);\n  ctx.stroke();\n\n  const zx0 = 550, zy0 = 122;\n  const R1 = 68;\n\n  ctx.fillStyle = 'rgba(16,185,129,0.08)';\n  ctx.beginPath();\n  ctx.arc(zx0, zy0, R1, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(405, 22, 290, H - 38);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(415, zy0); ctx.lineTo(685, zy0);\n  ctx.moveTo(zx0, 26); ctx.lineTo(zx0, H - 20);\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  ctx.arc(zx0, zy0, R1, 0, Math.PI * 2);\n  ctx.stroke();\n\n  const Rcur = r * R1;\n  if (showCircle) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 4]);\n    ctx.beginPath();\n    ctx.arc(zx0, zy0, Rcur, 0, Math.PI * 2);\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('z 平面 (极坐标: r·e^(jω))', 412, 16);\n  ctx.font = '10px monospace';\n  ctx.fillStyle = 'rgba(255,255,255,0.7)';\n  ctx.fillText('DC(1,0)', zx0 + R1 + 4, zy0 - 4);\n  ctx.textAlign = 'right';\n  ctx.fillText('±π(-1,0)', zx0 - R1 - 4, zy0 - 4);\n  ctx.textAlign = 'left';\n  ctx.fillStyle = 'rgba(255,255,255,0.5)';\n  ctx.fillText('r=1 单位圆', zx0 + 50, 38);\n\n  if (omega > 0.05) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.arc(zx0, zy0, Math.min(26, Rcur * 0.6), 0, -omega, true);\n    ctx.stroke();\n  }\n\n  const pzX = zx0 + Rcur * Math.cos(omega);\n  const pzY1 = zy0 - Rcur * Math.sin(omega);\n  const pzY2 = zy0 + Rcur * Math.sin(omega);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.4)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(zx0, zy0);\n  ctx.lineTo(pzX, pzY1);\n  ctx.stroke();\n\n  if (lab.values.play) {\n    const cyc = timeSec % 1.0;\n    const envRing = isUnstable ? Math.min(1.6, 0.3 + cyc * 1.3) : (isMarginal ? 0.8 + 0.2 * Math.sin(timeSec * 6) : Math.max(0.15, 1.0 - cyc));\n    ctx.strokeStyle = poleColor;\n    ctx.globalAlpha = 0.45;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.arc(pzX, pzY1, 8 + envRing * 12, 0, Math.PI * 2);\n    ctx.stroke();\n    ctx.globalAlpha = 1.0;\n  }\n\n  drawCross(pzX, pzY1, poleColor);\n  if (omega > 0.02) drawCross(pzX, pzY2, poleColor);\n\n  const wWrap = wrapToPi(omega);\n  const status = isUnstable ? '单位圆外 → 不稳定(发散)' : (isMarginal ? '单位圆上 → 临界等幅' : '单位圆内 → 稳定(衰减)');\n  const wrapMsg = omega > Math.PI ? ' [越过π已卷绕至 ' + wWrap.toFixed(2) + ' rad]' : '';\n  lab.setReadout('σ = ' + sigma.toFixed(2) + ' ↔ r = e^σ = ' + r.toFixed(3) + '  |  ω = ' + omega.toFixed(2) + ' rad' + wrapMsg + '  |  ' + status);\n}\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nlab.onUpdate(function() {\n  draw(audioPhaseTime);\n  if (!lab.values.play) {\n    stopAudio();\n  }\n});\n\nlab.onLoop(function(dt, timeSec) {\n  audioPhaseTime = timeSec;\n  if (!lab.values.play) {\n    if (osc) stopAudio();\n    return;\n  }\n  draw(timeSec);\n  const ctx = lab.getAudioContext();\n  if (!ctx) return;\n  if (ctx.state === 'suspended') {\n    ctx.resume();\n  }\n  if (!osc) {\n    osc = ctx.createOscillator();\n    gainNode = ctx.createGain();\n    osc.type = 'sine';\n    gainNode.gain.setValueAtTime(0, ctx.currentTime);\n    osc.connect(gainNode);\n    gainNode.connect(ctx.destination);\n    osc.start();\n  }\n  const sigma = lab.values.sigma;\n  const omega = lab.values.omega;\n  const wEff = Math.abs(wrapToPi(omega));\n  const freq = 180 + (wEff / Math.PI) * 900;\n  osc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.02);\n\n  const cyc = timeSec % 1.0;\n  const attack = Math.min(1, cyc / 0.015);\n  let amp = 0;\n  if (sigma < -0.005) {\n    amp = 0.24 * Math.exp(sigma * 26 * cyc) * attack;\n  } else if (sigma <= 0.005) {\n    amp = 0.16;\n  } else {\n    amp = Math.min(0.28, 0.03 * Math.exp(sigma * 28 * cyc)) * attack;\n  }\n  gainNode.gain.setTargetAtTime(amp, ctx.currentTime, 0.015);\n});"
    },
    {
      "type": "concept",
      "heading": "四、为什么数字频率会“绕圈”？单位圆上的 DTFT",
      "paragraphs": [
        "特别要留意频率变量 `ω` 在两个平面里的巨大差异：连续正弦波的频率可以从直流（DC）一直延伸到正负无穷大，所以 s 平面的纵轴 `ω` 可以上下无限延伸；但**离散正弦波的频率最高只能达到采样率的一半**（即归一化频率 `f` 只能在 `0` 到 `0.5` 之间），换算成自然角频率 `ω = 2πf`，范围严格锁定在 **`0` 到 `π` 弧度**（负频率对应 `0` 到 `-π` 弧度）。有些教材会特意用大写 `Ω` 表示 z 域频率、小写 `ω` 表示 s 域频率，本书统一都写作 `ω`，阅读其他资料时注意区分即可。",
        "在 s 平面上，沿着纵轴 `σ = 0` 取值，拉普拉斯变换就退化成了连续傅里叶变换（即系统的频率响应）。完全平行地，**在 z 平面上沿着单位圆 `r = 1` 取值，z 变换就退化成了离散时间傅里叶变换（DTFT）**，这正是离散系统的频率响应！",
        "沿着单位圆走一圈，几何直觉瞬间通透：零频率（DC）固定在正实轴的 `(r=1, ω=0)` 即 `z = 1` 处；正频率从 DC 出发**逆时针**扫过上半圆直到 `ω = π`（即 `z = -1`）；负频率则从 DC 出发**顺时针**扫过下半圆直到 `ω = -π`。正负频率在 `±π` 处迎头相撞。如果你继续增大角度 `ω` 越过 `π`，就会沿着圆圈跑进下半圆，遇到和之前完全相同的数值——**就像绕着环形跑道跑步，跑过一圈后看到的还是同样的风景**。这正是离散信号频谱必然呈周期性重复的几何本质！"
      ],
      "formula": {
        "expr": "X(z)|_{r=1} = X(e^(jω)) = Σ_{n=-∞}^{∞} x[n] e^(-jωn)  (DTFT)",
        "explain": "将 z = r·e^(jω) 中的半径锁定为 r = 1，z 变换直接化简为离散时间傅里叶变换，单位圆上的点直接给出离散系统的频响。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "核心映射公式避坑：正确的换算关系是 σ = ln(r)（即 r = e^σ）以及 z = r·e^(jω)。注意原书第 608 页正文中曾出现两处印刷笔误（把 σ = ln(r) 误印成 σ = -ln(r)，把 z = r·e^(jω) 误印成 z = r·e^(-jω)），做推导或写代码时务必以 σ = ln(r) 和 z = r·e^(jω) 为准。",
        "探针衰减 vs 极点稳定（别搞混方向）：在变换公式中探针是 r^(-n)，因此 r > 1 对应探针衰减；但在分析系统极点位置时，系统的自然响应按 (r_p)^n 演化，所以极点必须落在单位圆内（r_p < 1，对应 σ < 0）系统才稳定，落在圆外（r_p > 1）必然发散。",
        "单位圆即频响跑道：求离散系统的频率响应，本质上就是沿单位圆 r = 1 从角度 0（DC）逆时针走到 π（奈奎斯特频率）；超过 π 后频率值在圆上循环往复，这从几何上解释了为什么数字滤波器频响总是以 2π 为周期。"
      ]
    }
  ]
});
