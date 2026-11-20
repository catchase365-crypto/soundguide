window.__BOOK_REGISTER_SECTION__("sec_224", {
  "title": "s 域的本质 (The Nature of the s-Domain)",
  "intuition": "傅里叶变换只用等幅正弦波当尺子，而拉普拉斯变换把尺子升级成了「带指数衰减/增长包络的正弦波」，从而能贴合所有物理微分方程系统的天然响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么需要拉普拉斯变换？——微分方程的天然基元",
      "paragraphs": [
        "在信号处理中，卷积与傅里叶分析固然强大，但它们几乎允许脉冲响应和频率响应呈任意形状——这在很多科学和工程场景中反而**过于宽泛**了。现实世界中的大量物理系统都是通过**微分方程**相互作用的：例如电感两端的电压正比于电流的导数，施加在质量上的力正比于速度的导数。",
        "只要系统由线性微分方程支配，它的脉冲响应就不可能是任意形状，而只能由**指数函数 (exponentials)** 与 **正弦波 (sinusoids)** 组合而成。**拉普拉斯变换 (Laplace Transform)** 正是专门用来分析这类连续时间系统的利器（离散时间系统对应的则是 **z 变换**）。",
        "与所有变换一样，拉普拉斯变换依据固定规则将连续时间域信号 `x(t)` 映射到一个全新的二维复平面——**s 域 (s-domain / s-plane)**。在实际信号处理应用中，时域信号 `x(t)` 几乎总是纯实数，但它在正负时间轴上可以延伸至无穷，既可以是周期的也可以是非周期的。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "2. s 平面的几何结构与「加权再傅里叶」两步理解法",
      "paragraphs": [
        "s 域是一个完整的二维**复平面**：横轴为实轴，用小写希腊字母 **σ**（衰减/增长常数）表示；纵轴为虚轴，用 **ω**（自然频率）表示。平面上任意一点的位置都可以用一个复数变量 `s = σ + jω` 来唯一指定。和傅里叶变换一样，变换后的 s 域信号用大写字母 `X(s)` 或 `X(σ, ω)` 表示——不仅**位置**是复数，该位置上对应的**信号值**同样是一个复数（具有实部/虚部，或幅度/相位）。",
        "为了直观理解图 32-1 中 s 域与时域的关系，可以把它拆解为一个教学辅助的两步过程：先在横轴上选定一条位于 `σ` 的竖直线，把时域信号 `x(t)` 乘以指数曲线 `e^(-σt)`；然后对这个指数加权后的信号求**复傅里叶变换**，把频谱垂直摆放到 `σ` 对应的竖直线上（上半平面放正频率，下半平面放负频率）。",
        "这里有两个极其关键的几何规律：第一，在**左半平面 (`σ < 0`)**，`e^(-σt)` 随时间**指数增长**；在**右半平面 (`σ > 0`)**，`e^(-σt)` 随时间**指数衰减**。第二，也是最核心的一条性质：**s 平面纵轴（即 `σ = 0`）上的数值，严格等于原信号 `x(t)` 的傅里叶变换！** 因此，从数学上看，傅里叶变换只是拉普拉斯变换在 `σ = 0` 处的一个子集。",
        "把指数加权项 `e^(-σt)` 与傅里叶核 `e^(-jωt)` 合并，利用 `s = σ + jω`，便得到信号处理与电子学中最核心的方程之一（公式 32-1）。需要牢记的是，公式 32-1 本身是一个一步到位的积分公式，直接给出 s 平面上任意一点 `(σ, ω)` 的值；“先乘指数再做傅里叶”只是帮助我们理解它的概念拐杖。"
      ],
      "formula": {
        "expr": "X(s) = ∫_{-∞}^{∞} x(t) · e^(-st) dt   (其中 s = σ + jω, 复指数 e^(-st) = e^(-σt) · e^(-jωt))",
        "explain": "x(t) 是连续时域信号；s = σ + jω 代表 s 平面上的坐标；e^(-st) 称为复指数，用极简的符号同时打包了指数包络 e^(-σt) 与正弦振荡 e^(-jωt)；积分结果 X(s) 是该坐标点上的复数值。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 共轭点对与时域实数基波形（图 32-2）",
      "paragraphs": [
        "当输入信号 `x(t)` 是纯实数时，s 平面的上半部分（正频率 `+ω`）与下半部分（负频率 `-ω`）互为**复共轭镜像**。只要把位置 `(σ, +ω)` 和 `(σ, -ω)` **成对处理**（如图 32-2 中的 A&A'、B&B'、C&C'），就能绕开时域中的复数运算，直接对应到两个实数基波形：`cos(ωt)e^(-σt)` 和 `sin(ωt)e^(-σt)`。",
        "例如：位于右半平面的点对 A&A'（`σ = 1.5, ω = ±40`）对应随时间**指数衰减**的正弦波与余弦波；位于虚轴上的点对 B&B'（`σ = 0`）对应振幅恒定的纯正弦波；位于左半平面的点对 C&C'（`σ = -1.5`）则对应振幅**指数发散增长**的正弦波。",
        "s 平面上任意坐标点处复数值 `X(s)` 的计算本质上就是内积探测：将原信号 `x(t)` 乘以该位置对应的指数加权余弦波并在 `(-∞, ∞)` 上积分，就得到 `X(σ, ω)` 的**实部**；改用指数加权正弦波积分，就得到**虚部**。"
      ],
      "formula": {
        "expr": "Re X(σ, ω) = ∫_{-∞}^{∞} x(t) · cos(ωt) · e^(-σt) dt",
        "explain": "求 s 平面某对共轭坐标处信号值的实部：只需看输入信号 x(t) 与对应衰减/增长速率 σ、频率 ω 的余弦基波有多相似。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：s 平面共轭点对与时域基波形听觉实验室",
      "instruction": "拖动「σ (实轴)」与「ω (角频率)」滑块观察左右半平面的波形衰减/增长形态；打开声音开关，直接用耳朵听出不同 σ 对应的包络变化与 ω 对应的音高！",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "衰减/增长系数 σ",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "自然角频率 ω",
          "min": 2,
          "max": 40,
          "step": 1,
          "value": 20,
          "unit": " rad/s"
        },
        {
          "type": "toggle",
          "id": "showSin",
          "label": "切换为 sin(ωt) 基波 (默认 cos)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听该基波形",
          "activeLabel": "⏸ 停止发声"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioCtx = null;\nlet osc = null;\nlet gainNode = null;\nlet animT = 0;\nconst tMax = 1.6;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction startAudio() {\n  stopAudio();\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  osc = audioCtx.createOscillator();\n  gainNode = audioCtx.createGain();\n  osc.type = 'sine';\n  osc.connect(gainNode);\n  gainNode.connect(audioCtx.destination);\n  gainNode.gain.setValueAtTime(0.05, audioCtx.currentTime);\n  osc.start();\n}\n\nfunction draw() {\n  const sigma = lab.values.sigma;\n  const omega = lab.values.omega;\n  const showSin = lab.values.showSin;\n  const playing = lab.values.play;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const spX = 125;\n  const spY = 122;\n  const spR = 92;\n\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.08)';\n  ctx.fillRect(spX - spR, spY - spR, spR, spR * 2);\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n  ctx.fillRect(spX, spY - spR, spR, spR * 2);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -2; i <= 2; i++) {\n    const gx = spX + (i / 2.2) * spR;\n    ctx.beginPath(); ctx.moveTo(gx, spY - spR); ctx.lineTo(gx, spY + spR); ctx.stroke();\n    const gy = spY + (i / 2.2) * spR;\n    ctx.beginPath(); ctx.moveTo(spX - spR, gy); ctx.lineTo(spX + spR, gy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(spX - spR, spY); ctx.lineTo(spX + spR, spY);\n  ctx.moveTo(spX, spY - spR); ctx.lineTo(spX, spY + spR);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('σ < 0 增长', spX - spR + 4, spY - spR + 14);\n  ctx.fillText('σ > 0 衰减', spX + spR - 58, spY - spR + 14);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('s 平面坐标', spX - 28, 15);\n  ctx.fillText('jω', spX + 5, spY - spR + 11);\n  ctx.fillText('σ', spX + spR - 10, spY - 5);\n\n  const px = spX + (sigma / 2.2) * spR;\n  const pyTop = spY - (omega / 44) * spR;\n  const pyBot = spY + (omega / 44) * spR;\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(px, pyTop); ctx.lineTo(px, pyBot); ctx.stroke();\n  ctx.setLineDash([]);\n\n  [pyTop, pyBot].forEach((py, idx) => {\n    ctx.fillStyle = idx === 0 ? '#38bdf8' : '#f59e0b';\n    ctx.beginPath();\n    ctx.arc(px, py, 5.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n  });\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('P (+ω)', px + 8, pyTop + 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText(\"P' (-ω)\", px + 8, pyBot + 4);\n\n  const wfX0 = 260;\n  const wfW = 445;\n  const wfY0 = 122;\n  const wfAmp = 30;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 8; i++) {\n    const gx = wfX0 + (i / 8) * wfW;\n    ctx.beginPath(); ctx.moveTo(gx, 24); ctx.lineTo(gx, 220); ctx.stroke();\n  }\n  for (let j = -2; j <= 2; j++) {\n    const gy = wfY0 + j * 44;\n    ctx.beginPath(); ctx.moveTo(wfX0, gy); ctx.lineTo(wfX0 + wfW, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.beginPath(); ctx.moveTo(wfX0, wfY0); ctx.lineTo(wfX0 + wfW, wfY0); ctx.stroke();\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(wfX0, 22, wfW, 200);\n  ctx.clip();\n\n  const steps = 260;\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';\n  ctx.lineWidth = 1.3;\n  ctx.setLineDash([4, 4]);\n  [1, -1].forEach(sign => {\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const t = (i / steps) * tMax;\n      const env = Math.exp(-sigma * t);\n      const x = wfX0 + (i / steps) * wfW;\n      const y = wfY0 - sign * env * wfAmp;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  });\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.1;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * tMax;\n    const carrier = showSin ? Math.sin(omega * t) : Math.cos(omega * t);\n    const val = carrier * Math.exp(-sigma * t);\n    const x = wfX0 + (i / steps) * wfW;\n    const y = wfY0 - val * wfAmp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (playing) {\n    const curX = wfX0 + (animT / tMax) * wfW;\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(curX, 24); ctx.lineTo(curX, 220); ctx.stroke();\n  }\n  ctx.restore();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  const fnName = showSin ? 'sin' : 'cos';\n  ctx.fillText(`时域实数基波形: ${fnName}(ωt)·e^(-σt)  (橙色虚线为指数包络)`, wfX0, 15);\n\n  const stateStr = sigma > 0.05 ? '指数衰减 (右半平面)' : (sigma < -0.05 ? '指数增长 (左半平面)' : '等幅纯正弦 (虚轴 = 傅里叶基)');\n  lab.setReadout(`s = ${sigma.toFixed(1)} ± j${omega}  |  物理形态: ${stateStr}`);\n}\n\nlab.onUpdate(() => {\n  if (lab.values.play && !osc) {\n    animT = 0;\n    startAudio();\n  } else if (!lab.values.play && osc) {\n    stopAudio();\n  }\n  if (osc && audioCtx) {\n    const freqHz = 160 + lab.values.omega * 14;\n    osc.frequency.setTargetAtTime(freqHz, audioCtx.currentTime, 0.02);\n  }\n  draw();\n});\n\nlab.onLoop((dt) => {\n  if (lab.values.play) {\n    animT = (animT + dt) % tMax;\n    if (osc && gainNode && audioCtx) {\n      const env = Math.exp(-lab.values.sigma * animT);\n      const normEnv = lab.values.sigma < 0 ? (env / Math.exp(-lab.values.sigma * tMax)) * 0.24 : env * 0.24;\n      const safeGain = Math.min(0.28, Math.max(0.002, normEnv));\n      gainNode.gain.setTargetAtTime(safeGain, audioCtx.currentTime, 0.015);\n    }\n    draw();\n  }\n});\n\ndraw();"
    },
    {
      "type": "concept",
      "heading": "4. 实战例题：矩形脉冲的 s 域地形图与虚轴验算（图 32-3）",
      "paragraphs": [
        "以一个宽度为 2（区间 `[-1, 1]`）、高度为 1 的矩形脉冲信号为例。直接套用拉普拉斯变换定义（公式 32-1），把积分限缩小到信号非零的 `[-1, 1]` 区间，立即就能积分算出紧凑的复数解析表达式：`X(s) = (e^s - e^(-s)) / s`。",
        "虽然这个式子非常简练，但因为包含复变量 `s`，直接画图或直观理解很困难。解决方法是把 `s = σ + jω` 代入其中，利用欧拉公式拆分出实部 `Re X(σ, ω)` 和虚部 `Im X(σ, ω)`——它们在 s 平面上呈现出起伏波荡的二维“地形曲面”（见原书图 32-3）。",
        "面对如此繁琐的代数拆分，工程上如何快速验证自己没算错？最经典的一招就是**退化回虚轴检验**：令 `σ = 0`，代入化简后的表达式，发现 `Re X(0, ω)` 恰好简化为熟悉的 Sinc 函数 `2sin(ω)/ω`，而 `Im X(0, ω)` 恒等于 0——这与直接对偶对称矩形脉冲做傅里叶变换的结果分毫不差！"
      ],
      "formula": {
        "expr": "X(s) = ∫_{-1}^{1} 1·e^(-st) dt = (e^s - e^(-s)) / s   ⇒   令 σ = 0: Re X(0, ω) = 2·sin(ω)/ω,  Im X(0, ω) = 0",
        "explain": "左侧为矩形脉冲在 s 域的紧凑解析式；右侧是令实部 σ=0 后的验算结果，证明虚轴切片严丝合缝地还原出了傅里叶频谱（实部为 Sinc 函数，虚部为零）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：矩形脉冲的 s 域垂直切片与傅里叶退化验证",
      "instruction": "拖动「切片位置 σ」观察左侧指数加权波形如何改变右侧 s 域实部/虚部剖面；当把 σ 拖回 0.0 时，观察绿色实部曲线如何精准重合于虚线 Sinc 傅里叶基准，粉色虚部完全归零！",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "s 平面切片位置 σ",
          "min": -1.5,
          "max": 1.5,
          "step": 0.1,
          "value": 0.6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "halfWidth",
          "label": "矩形脉冲半宽 T",
          "min": 0.4,
          "max": 1.6,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showFourier",
          "label": "叠加 σ=0 傅里叶 Sinc 基准线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction evalLaplace(sigma, omega, T) {\n  const a = sigma * T;\n  const b = omega * T;\n  const denom = a * a + b * b;\n  if (denom < 1e-8) return { re: 2 * T, im: 0 };\n  const ep = Math.exp(a);\n  const em = Math.exp(-a);\n  const diff = ep - em;\n  const sum = ep + em;\n  const re = T * (a * Math.cos(b) * diff + b * Math.sin(b) * sum) / denom;\n  const im = T * (a * Math.sin(b) * sum - b * Math.cos(b) * diff) / denom;\n  return { re, im };\n}\n\nfunction draw() {\n  const sigma = lab.values.sigma;\n  const T = lab.values.halfWidth;\n  const showFourier = lab.values.showFourier;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left panel: x(t) and x(t)*e^(-sigma*t), t in [-2.2, 2.2]\n  const lx0 = 20;\n  const lw = 185;\n  const ly0 = 165;\n  const tLim = 2.2;\n  const yScaleL = 42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = lx0 + (i / 4) * lw;\n    ctx.beginPath(); ctx.moveTo(gx, 24); ctx.lineTo(gx, 215); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.beginPath(); ctx.moveTo(lx0, ly0); ctx.lineTo(lx0 + lw, ly0); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(lx0 + lw / 2, 24); ctx.lineTo(lx0 + lw / 2, 215); ctx.stroke();\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(lx0, 24, lw, 191);\n  ctx.clip();\n\n  // Exponential weighting curve e^(-sigma*t)\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.75)';\n  ctx.setLineDash([4, 3]);\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const t = -tLim + (i / 100) * (2 * tLim);\n    const val = Math.exp(-sigma * t);\n    const x = lx0 + (i / 100) * lw;\n    const y = ly0 - val * yScaleL;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Original pulse x(t)\n  const xLeft = lx0 + ((-T + tLim) / (2 * tLim)) * lw;\n  const xRight = lx0 + ((T + tLim) / (2 * tLim)) * lw;\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(lx0, ly0); ctx.lineTo(xLeft, ly0);\n  ctx.lineTo(xLeft, ly0 - yScaleL); ctx.lineTo(xRight, ly0 - yScaleL);\n  ctx.lineTo(xRight, ly0); ctx.lineTo(lx0 + lw, ly0);\n  ctx.stroke();\n\n  // Weighted pulse x(t)*e^(-sigma*t)\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.22)';\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(xLeft, ly0);\n  for (let i = 0; i <= 80; i++) {\n    const t = -T + (i / 80) * (2 * T);\n    const val = Math.exp(-sigma * t);\n    const x = lx0 + ((t + tLim) / (2 * tLim)) * lw;\n    const y = ly0 - val * yScaleL;\n    ctx.lineTo(x, y);\n  }\n  ctx.lineTo(xRight, ly0);\n  ctx.closePath();\n  ctx.fill();\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(`时域加权: x(t)·e^(-σt)`, lx0, 15);\n\n  // Right panel: s-domain slice along sigma, omega in [-16, 16]\n  const rx0 = 238;\n  const rw = 462;\n  const ry0 = 135;\n  const wLim = 16;\n  const samples = 260;\n\n  let maxAbs = 2.5;\n  const pts = [];\n  const fPts = [];\n  for (let i = 0; i <= samples; i++) {\n    const om = -wLim + (i / samples) * (2 * wLim);\n    const val = evalLaplace(sigma, om, T);\n    const fVal = evalLaplace(0, om, T);\n    pts.push({ om, re: val.re, im: val.im });\n    fPts.push({ om, re: fVal.re });\n    maxAbs = Math.max(maxAbs, Math.abs(val.re), Math.abs(val.im), Math.abs(fVal.re));\n  }\n  const yScaleR = 85 / maxAbs;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 8; i++) {\n    const gx = rx0 + (i / 8) * rw;\n    ctx.beginPath(); ctx.moveTo(gx, 24); ctx.lineTo(gx, 222); ctx.stroke();\n  }\n  for (let j = -2; j <= 2; j++) {\n    const gy = ry0 + j * 42;\n    ctx.beginPath(); ctx.moveTo(rx0, gy); ctx.lineTo(rx0 + rw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.beginPath(); ctx.moveTo(rx0, ry0); ctx.lineTo(rx0 + rw, ry0); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx0 + rw / 2, 24); ctx.lineTo(rx0 + rw / 2, 222); ctx.stroke();\n\n  if (showFourier) {\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';\n    ctx.setLineDash([5, 4]);\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    fPts.forEach((p, idx) => {\n      const x = rx0 + (idx / samples) * rw;\n      const y = ry0 - p.re * yScaleR;\n      if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    });\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  // Imaginary part\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  pts.forEach((p, idx) => {\n    const x = rx0 + (idx / samples) * rw;\n    const y = ry0 - p.im * yScaleR;\n    if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  });\n  ctx.stroke();\n\n  // Real part\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  pts.forEach((p, idx) => {\n    const x = rx0 + (idx / samples) * rw;\n    const y = ry0 - p.re * yScaleR;\n    if (idx === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  });\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText(`s 域竖直切片 (ω ∈ [-16, 16])   绿: Re X(σ,ω)   粉: Im X(σ,ω)   蓝虚线: 傅里叶 Sinc`, rx0, 15);\n\n  const dcVal = evalLaplace(sigma, 0, T).re;\n  const fDcVal = 2 * T;\n  lab.setReadout(`σ = ${sigma.toFixed(1)}, 脉冲宽 = ${(2 * T).toFixed(1)}  |  直流峰值 X(σ, 0) = ${dcVal.toFixed(2)} (傅里叶基准: ${fDcVal.toFixed(2)})`);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "左右半平面的物理极性切勿记反：核函数是 e^(-st) = e^(-σt)·e^(-jωt)，因此 σ > 0（右半平面）对应随时间指数衰减的基波，σ < 0（左半平面）对应随时间指数发散增长的基波。",
        "黄金验算口诀「令 σ = 0 看傅里叶」：只要手算或写代码推导出了复杂的 X(σ, ω) 实部/虚部表达式，第一步就应该把 σ 置零，检查它是否完美退化为熟悉的傅里叶频谱（虚轴与傅里叶变换严格相等）。",
        "实信号的对称红利：只要时域信号 x(t) 是纯实数，s 平面上下半平面就互为共轭镜像；工程分析时把 (σ, +ω) 与 (σ, -ω) 成对看待，就能全程使用实数指数衰减正/余弦波理解系统行为。"
      ]
    }
  ]
});
