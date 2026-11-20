window.__BOOK_REGISTER_SECTION__("sec_052", {
  "title": "线性系统的三大基石：齐次性、可加性与移位不变性 (Requirements for Linearity)",
  "intuition": "判断一个系统是不是数字信号处理（DSP）里最好用的“线性时不变系统”，只需看三件事：输入放大 k 倍输出是否等比例放大（齐次性）、两路信号同时输入是否互不干扰直接相加（可加性）、以及系统的脾气是否不随时间改变（移位不变性）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 线性系统的数学定义与 DSP 的“默认契约”",
      "paragraphs": [
        "在数学上，一个系统被称为**线性系统 (Linear System)**，当且仅当它同时满足两条核心公理：**齐次性 (Homogeneity)** 和 **可加性 (Additivity)**。只要你能证明某个系统同时具备这两条性质，就证明了它是线性的；反之，只要缺少其中任意一条，它就不是线性系统。",
        "此外还有第三条关键性质——**移位不变性 (Shift Invariance)**。从严格数学定义来看，移位不变性并不是“线性”的必要条件；但在数字信号处理（DSP）的绝大部分算法中，它却是不可或缺的强制前提。因此，当你在 DSP 文献中看到**线性系统**这个词时，除非有特别说明，否则都可以默认它已经包含了移位不变性（即所谓的线性时不变系统 LTI）。"
      ],
      "formula": {
        "expr": "Linearity ⟺ Homogeneity + Additivity  (DSP 默认附加 Shift Invariance)",
        "explain": "齐次性与可加性共同构成线性的充要条件；移位不变性则是信号与系统领域额外绑定的实用前提。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 齐次性 (Homogeneity)：等比例缩放与电阻的“两副面孔”",
      "paragraphs": [
        "**齐次性**的物理直觉非常直接：输入信号的幅度改变多少倍，输出信号的幅度就必须不多不少地改变相同的倍数（包括反相缩放，即乘以负数）。如果输入 `x[n]` 产生输出 `y[n]`，那么把输入变成 `k·x[n]`，输出就必须精准变成 `k·y[n]`。",
        "一颗最普通的**电阻**就能完美演示什么是齐次、什么是非齐次。如果把电阻两端的电压 `v(t)` 当作输入，流过电阻的电流 `i(t)` 当作输出，欧姆定律 `i(t) = v(t) / R` 保证了电压翻倍时电流也翻倍，这个系统是**齐次的**。",
        "但如果换个视角，依然把电压 `v(t)` 当作输入，却把电阻消耗的**电功率** `p(t)` 当作输出：由于 `p(t) = v²(t) / R` 与电压的平方成正比，当你把输入电压放大 **2 倍** 时，输出功率会暴增为原来的 **4 倍**！这就彻底违背了齐次性，因此“电压→功率”系统是非线性的。"
      ],
      "formula": {
        "expr": "若 x[n] → y[n]，则对任意常数 k 有：k·x[n] → k·y[n]",
        "explain": "x[n] 为输入信号，y[n] 为对应输出信号，k 为任意实数缩放因子；先缩放再进系统，结果必须等于先过系统再缩放。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：齐次性检验台——欧姆电流 vs 平方功率",
      "instruction": "拖动缩放倍数 k（尝试负值如 -1.5 或正值 2.0），并切换线性/非线性模式，观察理想输出 k·y[n] 与实际系统输出 S(k·x[n]) 是否重合。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "输入缩放倍数 k",
          "min": -2,
          "max": 2.4,
          "step": 0.1,
          "value": 2,
          "unit": "×"
        },
        {
          "type": "toggle",
          "id": "nonlin",
          "label": "切换为非线性功率系统 (p = v²/R)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction sys(val, nonlinear) {\n  return nonlinear ? (val * val) * 0.45 : val * 0.85;\n}\n\nfunction drawStemPlot(x0, y0, w, h, title, seriesList, maxVal) {\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n  const cy = y0 + h * 0.56;\n  ctx.beginPath();\n  ctx.moveTo(x0, cy);\n  ctx.lineTo(x0 + w, cy);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 8, y0 + 16);\n\n  const N = seriesList[0].data.length;\n  const scaleY = (h * 0.36) / maxVal;\n\n  seriesList.forEach(s => {\n    ctx.strokeStyle = s.color;\n    ctx.fillStyle = s.color;\n    ctx.lineWidth = s.width || 1.6;\n    for (let i = 0; i < N; i++) {\n      const px = x0 + 14 + (i / (N - 1)) * (w - 28) + (s.offsetX || 0);\n      const py = cy - s.data[i] * scaleY;\n      ctx.beginPath();\n      ctx.moveTo(px, cy);\n      ctx.lineTo(px, py);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.arc(px, py, s.radius || 3, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  });\n  ctx.restore();\n}\n\nfunction render() {\n  const k = lab.values.k;\n  const nonlin = lab.values.nonlin;\n  ctx.clearRect(0, 0, W, H);\n\n  const N = 13;\n  const x = [];\n  for (let i = 0; i < N; i++) {\n    const d = i - 4;\n    x.push(d === 0 ? 1.0 : d === 1 ? 0.65 : d === -1 ? 0.35 : 0);\n  }\n  const kx = x.map(v => k * v);\n  const y = x.map(v => sys(v, nonlin));\n  const ky = y.map(v => k * v);\n  const sky = kx.map(v => sys(v, nonlin));\n\n  drawStemPlot(12, 12, 216, H - 24, '输入: x[n](灰) vs k·x[n](蓝)', [\n    { data: x, color: 'rgba(248,250,252,0.35)', offsetX: -2, radius: 2.5 },\n    { data: kx, color: '#38bdf8', offsetX: 2, radius: 3 }\n  ], 2.8);\n\n  drawStemPlot(240, 12, 232, H - 24, '输出: k·y[n](绿) vs S(k·x[n])(橙)', [\n    { data: ky, color: '#10b981', offsetX: -2.5, radius: 3.5 },\n    { data: sky, color: '#f59e0b', offsetX: 2.5, radius: 2.8 }\n  ], 2.8);\n\n  const rx = 484, ry = 12, rw = 224, rh = H - 24;\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  const cx = rx + rw / 2;\n  const cy = ry + rh * 0.56;\n  ctx.beginPath();\n  ctx.moveTo(rx, cy); ctx.lineTo(rx + rw, cy);\n  ctx.moveTo(cx, ry + 24); ctx.lineTo(cx, ry + rh);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(nonlin ? '功率响应 p=v²/R (抛物线)' : '欧姆响应 i=v/R (过原点直线)', rx + 8, ry + 16);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 100; i++) {\n    const xin = -2.5 + (i / 100) * 5.0;\n    const yout = sys(xin, nonlin);\n    const sx = cx + (xin / 2.7) * (rw * 0.44);\n    const sy = cy - (yout / 2.8) * (rh * 0.38);\n    if (i === 0) ctx.moveTo(sx, sy);\n    else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  const p1x = cx + (1.0 / 2.7) * (rw * 0.44);\n  const p1y = cy - (sys(1.0, nonlin) / 2.8) * (rh * 0.38);\n  const p2x = cx + (k / 2.7) * (rw * 0.44);\n  const p2y = cy - (sys(k, nonlin) / 2.8) * (rh * 0.38);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(p1x, p1y, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(p2x, p2y, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.restore();\n\n  const peakK = sys(k, nonlin);\n  const peakIdeal = k * sys(1.0, nonlin);\n  const err = Math.abs(peakK - peakIdeal);\n  const status = err < 1e-4 ? '✅ 满足齐次性：S(k·x) == k·S(x)' : '❌ 破坏齐次性：S(k·x) ≠ k·S(x)';\n  lab.setReadout(`${status} | k=${k.toFixed(1)} | 理想 k·y[4]=${peakIdeal.toFixed(2)} vs 实际 S(k·x)[4]=${peakK.toFixed(2)}`);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "3. 可加性 (Additivity)：互不串门的“电话线” vs 混频器里的碰撞",
      "paragraphs": [
        "**可加性**意味着多路信号在通过系统时“各自安好、互不干扰”。如果 `x₁[n]` 单独输入得到 `y₁[n]`，`x₂[n]` 单独输入得到 `y₂[n]`，那么把它们叠在一起同时输入 `x₁[n] + x₂[n]`，输出就必须精准等于 `y₁[n] + y₂[n]`。",
        "书中给出了一个非常生动的例子：你在和埃德娜姨妈（Aunt Edna）通电话，她正在滔滔不绝地讲今年萝卜长得多好；与此同时，背景里伯尼叔叔（Uncle Bernie）正在冲着弄脏他心爱椅子的狗狗大喊大叫。这两路声音信号在电话网络中相加传输。由于电话系统满足**可加性**，你在听筒里听到的是两道声音的纯粹叠加——你听清了 Edna 和 Bernie，而不会听到融合成一团的新怪物“Ednabernie”。",
        "与之相反，无线电发射机里的**混频器 (Mixer)** 就是一个典型的**非可加性**电路：把低频语音信号和高频载波相加后，送入像 PN 结二极管这样的非线性器件，两路信号会剧烈相互作用、融合成全新的调制信号（产生和频与差频分量），从而把信息发射到远方。"
      ],
      "formula": {
        "expr": "若 x₁[n] → y₁[n] 且 x₂[n] → y₂[n]，则 x₁[n] + x₂[n] → y₁[n] + y₂[n]",
        "explain": "先相加再进系统的输出，必须等于各自单独过系统后再相加的结果，不能出现任何乘积交叉项。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：可加性与实时听感——当双音信号遇上“非线性二极管”",
      "instruction": "点击播放测试音，然后慢慢向右拖动“二极管非线性畸变”滑块，对比纯净和声与非线性互调产生的“Ednabernie”杂音及交叉串扰波形。",
      "controls": [
        {
          "type": "slider",
          "id": "f1",
          "label": "信号 1 频率 (Edna)",
          "min": 220,
          "max": 440,
          "step": 10,
          "value": 300,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f2",
          "label": "信号 2 频率 (Bernie)",
          "min": 360,
          "max": 680,
          "step": 10,
          "value": 480,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "nonlin",
          "label": "二极管非线性畸变 α",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音频",
          "activeLabel": "⏸ 暂停音频"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet ac = null, osc1 = null, osc2 = null, g1 = null, g2 = null, shaper = null, master = null;\n\nfunction ensureAudio() {\n  if (ac) return;\n  ac = lab.getAudioContext();\n  osc1 = ac.createOscillator();\n  osc2 = ac.createOscillator();\n  g1 = ac.createGain();\n  g2 = ac.createGain();\n  shaper = ac.createWaveShaper();\n  master = ac.createGain();\n\n  osc1.type = 'sine';\n  osc2.type = 'sine';\n  g1.gain.value = 0.45;\n  g2.gain.value = 0.45;\n  master.gain.value = 0;\n\n  osc1.connect(g1);\n  osc2.connect(g2);\n  g1.connect(shaper);\n  g2.connect(shaper);\n  shaper.connect(master);\n  master.connect(ac.destination);\n\n  osc1.start();\n  osc2.start();\n}\n\nfunction updateAudio() {\n  const f1 = lab.values.f1;\n  const f2 = lab.values.f2;\n  const alpha = lab.values.nonlin / 100;\n  const playing = lab.values.play;\n\n  if (playing) {\n    ensureAudio();\n    if (ac.state === 'suspended') ac.resume();\n  }\n  if (!ac) return;\n\n  const now = ac.currentTime;\n  osc1.frequency.setTargetAtTime(f1, now, 0.02);\n  osc2.frequency.setTargetAtTime(f2, now, 0.02);\n\n  const nCurve = 1024;\n  const curve = new Float32Array(nCurve);\n  for (let i = 0; i < nCurve; i++) {\n    const x = (i * 2) / (nCurve - 1) - 1;\n    const y = 0.65 * x + alpha * 0.75 * x * x;\n    curve[i] = Math.max(-1, Math.min(1, y));\n  }\n  shaper.curve = curve;\n  master.gain.setTargetAtTime(playing ? 0.25 : 0, now, 0.025);\n}\n\nfunction sys(x, alpha) {\n  return 0.65 * x + alpha * 0.75 * x * x;\n}\n\nfunction render() {\n  updateAudio();\n\n  const f1 = lab.values.f1;\n  const f2 = lab.values.f2;\n  const alpha = lab.values.nonlin / 100;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const left = 14, right = W - 14, pw = right - left;\n  const topY = 12, topH = 132, topCy = topY + topH * 0.56;\n  const botY = 154, botH = 74, botCy = botY + botH * 0.52;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(left, topY, pw, topH);\n  ctx.strokeRect(left, botY, pw, botH);\n  ctx.beginPath();\n  ctx.moveTo(left, topCy); ctx.lineTo(right, topCy);\n  ctx.moveTo(left, botCy); ctx.lineTo(right, botCy);\n  ctx.stroke();\n\n  const samples = 360;\n  const duration = 0.022;\n  const ySep = [], yComb = [], yDiff = [];\n\n  for (let i = 0; i <= samples; i++) {\n    const t = (i / samples) * duration;\n    const x1 = 0.45 * Math.sin(2 * Math.PI * f1 * t);\n    const x2 = 0.45 * Math.sin(2 * Math.PI * f2 * t);\n    const sep = sys(x1, alpha) + sys(x2, alpha);\n    const comb = sys(x1 + x2, alpha);\n    ySep.push(sep);\n    yComb.push(comb);\n    yDiff.push(comb - sep);\n  }\n\n  function plotCurve(arr, cy, scale, color, width, dash) {\n    ctx.save();\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    if (dash) ctx.setLineDash(dash);\n    ctx.beginPath();\n    for (let i = 0; i <= samples; i++) {\n      const px = left + (i / samples) * pw;\n      const py = cy - arr[i] * scale;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  plotCurve(ySep, topCy, 56, '#38bdf8', 2.0, [5, 4]);\n  plotCurve(yComb, topCy, 56, alpha === 0 ? '#10b981' : '#f59e0b', 2.0, null);\n  plotCurve(yDiff, botCy, 75, '#ec4899', 2.0, null);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('虚线(蓝): 理想独立相加 S(x₁)+S(x₂)', left + 10, topY + 16);\n  ctx.fillStyle = alpha === 0 ? '#10b981' : '#f59e0b';\n  ctx.fillText(alpha === 0 ? '实线(绿): 实际输出 S(x₁+x₂) 完全重合' : '实线(橙): 实际输出 S(x₁+x₂) 发生畸变偏离', left + 270, topY + 16);\n\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('交叉串扰误差项: S(x₁+x₂) - [S(x₁)+S(x₂)] = 1.5·α·x₁·x₂', left + 10, botY + 15);\n\n  if (alpha === 0) {\n    lab.setReadout(`✅ 满足可加性 (α=0%)：两路声音 (${f1}Hz 与 ${f2}Hz) 互不干扰，叠加输出绝对纯净`);\n  } else {\n    lab.setReadout(`❌ 破坏可加性 (α=${lab.values.nonlin}%)：信号碰撞产生互调新频率！差频 |f₂-f₁|=${Math.abs(f2 - f1)}Hz 与和频 f₁+f₂=${f1 + f2}Hz`);\n  }\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "4. 移位不变性 (Shift Invariance)：拒绝“看天吃饭”的稳定系统",
      "paragraphs": [
        "**移位不变性**（在连续时间里也常叫**时不变性**）意味着系统的处理特性不随时间（或空间等自变量）的推移而改变。如果一个输入脉冲在今天能产生某种特定响应，那么明天输入一个一模一样的脉冲，系统也必须吐出完全相同、只是在时间上平移了的响应。",
        "写公式时请特别留意 `x[n + s]` 的移动方向：对自变量 `n` 加上一个常数 `s`，正数和负数的移动方向与直觉相反——当 `s = 2` 时，波形整体**向左**移动 2 个样本；当 `s = -2` 时，波形整体**向右**移动 2 个样本。这个符号约定在后续卷积章节中会反复使用。",
        "如果系统不具备移位不变性会怎样？想象你设计了一个数字滤波器来补偿电话线的音质劣化，夏天调试得非常完美。结果冬天一到，气温下降改变了电话线的电气特性，你原本固定的滤波器立刻“失配”失效——这时就必须改用能适应环境变化的自适应算法。",
        "顺便思考一个深刻问题：为什么“齐次性 + 可加性”定义了线性，而移位不变性却被单独放在一旁？因为**线性**是一个比信号系统更宏大的概念。比如农民卖橘子 2 美元一箱、苹果 5 美元一箱：买 10 箱橘子 20 美元、买 20 箱 40 美元（齐次性）；同时买 20 箱橘子和 10 箱苹果一共 `20×2 + 10×5 = 90` 美元，与分开买总价完全一样（可加性）。这场交易是一个纯粹的线性过程，但这里根本没有随时间变化的信号，移位不变性也就无从谈起。只有当线性理论落到“信号与系统”上时，移位不变性才成为必备搭档。"
      ],
      "formula": {
        "expr": "若 x[n] → y[n]，则对任意移位常数 s 有：x[n + s] → y[n + s]",
        "explain": "n 为离散样本序号，s 为移位常数；s > 0 使信号左移（提前），s < 0 使信号右移（延迟）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：移位不变性与 x[n+s] 方向直觉实验室",
      "instruction": "拖动移位常数 s 观察输入波形 x[n+s] 究竟往左还是往右跑；开启“时变干扰”后，观察输出波形 S(x[n+s]) 为何不再等于简单平移的 y[n+s]。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "移位常数 s (观察 x[n+s])",
          "min": -5,
          "max": 5,
          "step": 1,
          "value": 2,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "tv",
          "label": "开启时变干扰 (如冬天温度漂移)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction xBase(m) {\n  if (m === 0) return 0.35;\n  if (m === 1) return 1.0;\n  if (m === 2) return 0.65;\n  if (m === 3) return 0.25;\n  return 0;\n}\n\nfunction gainAt(n, tv) {\n  return tv ? (1.0 + 0.55 * Math.sin(0.5 * n)) : 1.0;\n}\n\nfunction drawPanel(x0, y0, w, h, title, nMin, nMax, series) {\n  ctx.save();\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n  const cy = y0 + h * 0.72;\n  ctx.beginPath();\n  ctx.moveTo(x0, cy); ctx.lineTo(x0 + w, cy);\n  ctx.stroke();\n\n  const count = nMax - nMin;\n  const zeroX = x0 + 18 + ((0 - nMin) / count) * (w - 36);\n  ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n  ctx.beginPath(); ctx.moveTo(zeroX, y0 + 24); ctx.lineTo(zeroX, y0 + h - 18); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 10, y0 + 17);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.45)';\n  ctx.font = '10px sans-serif';\n  for (let n = nMin; n <= nMax; n += 2) {\n    const px = x0 + 18 + ((n - nMin) / count) * (w - 36);\n    ctx.fillText(String(n), px - 5, y0 + h - 5);\n  }\n\n  const scaleY = h * 0.36;\n  series.forEach(s => {\n    ctx.strokeStyle = s.color;\n    ctx.fillStyle = s.color;\n    ctx.lineWidth = 1.6;\n    for (let n = nMin; n <= nMax; n++) {\n      const val = s.fn(n);\n      const px = x0 + 18 + ((n - nMin) / count) * (w - 36) + (s.dx || 0);\n      const py = cy - val * scaleY;\n      ctx.beginPath();\n      ctx.moveTo(px, cy); ctx.lineTo(px, py);\n      ctx.stroke();\n      ctx.beginPath();\n      ctx.arc(px, py, s.r || 3, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  });\n  ctx.restore();\n}\n\nfunction render() {\n  const s = lab.values.shift;\n  const tv = lab.values.tv;\n  ctx.clearRect(0, 0, W, H);\n\n  const nMin = -8, nMax = 10;\n\n  drawPanel(12, 12, 340, H - 24, '输入端：原信号 x[n](灰) vs 移位信号 x[n+s](蓝)', nMin, nMax, [\n    { fn: n => xBase(n), color: 'rgba(248,250,252,0.32)', dx: -2, r: 2.5 },\n    { fn: n => xBase(n + s), color: '#38bdf8', dx: 2, r: 3.3 }\n  ]);\n\n  drawPanel(368, 12, 340, H - 24, '输出端：期望平移 y[n+s](绿) vs 实际输出 S(x[n+s])(粉)', nMin, nMax, [\n    { fn: n => gainAt(n + s, tv) * (0.7 * xBase(n + s) + 0.45 * xBase(n + s - 1)), color: '#10b981', dx: -2.2, r: 3.5 },\n    { fn: n => gainAt(n, tv) * (0.7 * xBase(n + s) + 0.45 * xBase(n + s - 1)), color: '#ec4899', dx: 2.2, r: 2.8 }\n  ]);\n\n  const dirText = s > 0 ? `s=+${s}（波形向左移 ${s} 格）` : s < 0 ? `s=${s}（波形向右移 ${-s} 格）` : 's=0（未移位）';\n  const match = (!tv || s === 0);\n  const status = match ? '✅ 出力完全同步：满足移位不变性' : '❌ 输出形态失真：时变系统破坏移位不变性';\n  lab.setReadout(`${status} | ${dirText} | 时变干扰: ${tv ? '开启' : '关闭'}`);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【判别铁律】想证明一个系统线性，必须“齐次性”和“可加性”同时过关；想推翻一个系统线性，只要找到一个反例（如平方率功率公式、二极管阈值截止）戳破其中任意一条就够了。",
        "【DSP 隐含前提】严格数学上的线性不要求移位不变，但写 DSP 代码（滤波、FFT、卷积）时几乎默认系统是“线性 + 移位不变（LTI）”的；一旦遇到参数随温度/时间漂移的通道，常规固定系数滤波器就会失效，必须上自适应算法。",
        "【符号防呆口诀】信号表达里的 x[n + s] 是“加 s 左移、减 s 右移”——把脉冲峰值的位置代入括号等于常数去解出 n，永远不会算反方向。",
        "【听感与频谱直觉】可加性系统不会凭空制造新频率；只要输入两个纯音却在输出里听出了原来没有的和频/差频杂音，系统内部一定藏着非线性交互。"
      ]
    }
  ]
});
