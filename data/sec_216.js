window.__BOOK_REGISTER_SECTION__("sec_216", {
  "title": "正弦波的复数表示法 (Complex Representation of Sinusoids)",
  "intuition": "用一个二维复数同时打包正弦波的“幅度”与“相位”，从而把棘手的三角函数线性运算降维成加减乘除复数代数。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么正弦波天生适合用复数表示？",
      "paragraphs": [
        "在电子工程与数字信号处理（DSP）中，正弦波和余弦波是最核心的基石波形。传统时域写法有两种等价形式：极坐标形式 `M cos(ωt + φ)` 与直角坐标形式 `A cos(ωt) + B sin(ωt)`。其中 `ω = 2πf` 是以**弧度/秒**为单位的自然角频率。",
        "只要频率 `ω` 确定，描述任意一个正弦波就**只需要两个独立参数**（`A` 与 `B`，或 `M` 与 `φ`）。这恰好与复数天生拥有**实部与虚部**（或**模长与辐角**）两个自由度完美契合！因此，我们可以建立从传统正弦波到复数的**替换映射（Substitution）**。",
        "原书给出的直角坐标与极坐标替换规则如右侧公式所示。需要特别留意：**这不是数学等号（不是 `cos(ωt) = a + jb`），而是一种符号代表关系**。另外，原书之所以对虚部和相角取负号，是为了与下一章将要学习的**复傅里叶变换**保持形式统一（在本章的替换技巧本身中，取负号并没有额外计算收益）。",
        "**数学一致性避坑提示**：按三角恒等式 `M cos(ωt + φ) = M cos(φ) cos(ωt) - M sin(φ) sin(ωt)`，其正弦项系数本身已带负号（即 `B = -M sin φ`）。因此若取 `a = A, b = -B`，对应的极坐标辐角实际上正好等于 `+φ`；若严格为了迎合傅里叶变换而取 `θ = -φ`（即取复共轭），则直角坐标虚部应为 `b = +B`。原书此处同时对 `b` 和 `θ` 取负属于经典笔误，但核心工程思想完全不变——**只要全系统统一约定，复平面上的一个向量就唯一对应一个正弦波**。"
      ],
      "formula": {
        "expr": "A cos(ωt) + B sin(ωt)  ⇌  a + jb   (a = A, b = -B) ；  M cos(ωt + φ)  ⇌  M e^(jθ)",
        "explain": "A 为余弦分量幅值，B 为正弦分量幅值；M 为合成波峰值幅度，φ 为初相位（弧度），a 与 b 分别为复数的实部与虚部，θ 为复平面向量辐角。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：正弦波与复平面的双向实时映射",
      "instruction": "拖动余弦幅值 A、正弦幅值 B 与频率滑块，观察左图复平面向量（注意 B>0 时虚部 b=-B 朝下）如何决定右图合成波形，并点击播放试听纯音。",
      "controls": [
        {
          "type": "slider",
          "id": "A",
          "label": "余弦幅值 A (实部 a)",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": 1.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "B",
          "label": "正弦幅值 B (虚部 b=-B)",
          "min": -2,
          "max": 2,
          "step": 0.1,
          "value": -0.9,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "信号频率 f",
          "min": 150,
          "max": 500,
          "step": 10,
          "value": 240,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听合成正弦波",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const { ctx, width, height } = lab;\nlet ac = null, osc = null, gain = null;\n\nfunction syncAudio() {\n  const { A, B, freq, play } = lab.values;\n  if (play) {\n    if (!ac) ac = lab.getAudioContext();\n    if (ac && ac.state === 'suspended') ac.resume();\n    if (ac && !osc) {\n      osc = ac.createOscillator();\n      gain = ac.createGain();\n      osc.type = 'sine';\n      gain.gain.value = 0;\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start();\n    }\n    if (osc && gain && ac) {\n      const M = Math.hypot(A, B);\n      const amp = Math.min(0.3, M * 0.1);\n      osc.frequency.setTargetAtTime(freq, ac.currentTime, 0.02);\n      gain.gain.setTargetAtTime(amp, ac.currentTime, 0.02);\n    }\n  } else if (gain && ac) {\n    gain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  const { A, B, freq } = lab.values;\n  const a = A;\n  const b = -B;\n  const M = Math.hypot(a, b);\n  const theta = Math.atan2(b, a);\n  const deg = (theta * 180 / Math.PI).toFixed(1);\n\n  ctx.clearRect(0, 0, width, height);\n\n  const cx = 120, cy = 120, scale = 34;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -2; i <= 2; i++) {\n    ctx.beginPath();\n    ctx.moveTo(cx + i * scale, 22);\n    ctx.lineTo(cx + i * scale, 218);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(22, cy + i * scale);\n    ctx.lineTo(218, cy + i * scale);\n    ctx.stroke();\n  }\n  ctx.beginPath();\n  ctx.arc(cx, cy, scale, 0, Math.PI * 2);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath();\n  ctx.moveTo(22, cy); ctx.lineTo(218, cy);\n  ctx.moveTo(cx, 22); ctx.lineTo(cx, 218);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('Re (a = A)', 166, cy - 6);\n  ctx.fillText('Im (b = -B)', cx + 6, 30);\n\n  const px = cx + a * scale;\n  const py = cy - b * scale;\n\n  ctx.setLineDash([4, 3]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, cy); ctx.stroke();\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(px, cy); ctx.lineTo(px, py); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(px, py); ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  const gx = 260, gw = 440, gy = 120, ampScale = 30;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const x = gx + (gw * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, 218); ctx.stroke();\n  }\n  for (let i = -2; i <= 2; i++) {\n    const y = gy + i * ampScale;\n    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();\n\n  const cycles = (freq / 150) * 2.0;\n\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= gw; i += 2) {\n    const wt = (i / gw) * cycles * Math.PI * 2;\n    const y = gy - A * Math.cos(wt) * ampScale;\n    if (i === 0) ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(236,72,153,0.55)';\n  ctx.beginPath();\n  for (let i = 0; i <= gw; i += 2) {\n    const wt = (i / gw) * cycles * Math.PI * 2;\n    const y = gy - B * Math.sin(wt) * ampScale;\n    if (i === 0) ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= gw; i += 2) {\n    const wt = (i / gw) * cycles * Math.PI * 2;\n    const val = A * Math.cos(wt) + B * Math.sin(wt);\n    const y = gy - val * ampScale;\n    if (i === 0) ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('时域合成波 (青绿) = A·cos (天蓝) + B·sin (粉红)', gx + 8, 30);\n\n  const bSign = b >= 0 ? '+' : '-';\n  lab.setReadout(\n    `直角坐标 z = ${a.toFixed(1)} ${bSign} j${Math.abs(b).toFixed(1)} | 极坐标 M = ${M.toFixed(2)}, θ = ${deg}° | 音频 f = ${freq} Hz`\n  );\n}\n\nlab.onUpdate(() => {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "“物理契约”：为什么复数加法成立，而复数乘法会崩塌？",
      "paragraphs": [
        "把物理问题硬塞进复数里并不是万能魔法。复数之所以能代表正弦波，是因为控制复数的**一部分**数学规则恰好与正弦波的物理规律一致，但**并非所有规则都一致**！我们只能使用那些能真实模仿物理系统行为的运算。",
        "先看**加法**：假设两个同频率的正弦波分别用复数 `A` 和 `B` 表示。复数加法 `A + B` 得到第三个复数，而物理上两个同频正弦波直接叠加，得到的也正好是一个同频率的新正弦波，其幅度和相位与 `A + B` 预测的结果分毫不差。",
        "再看**乘法**：如果把代表两个正弦波的复数 `A` 和 `B` 直接相乘，代数上确实会得到一个新的复数——似乎意味着“两个正弦波相乘会得到同频率的第三个正弦波”。但这与物理现实完全背离！两个同频余弦波在时域相乘，物理上会产生**直流分量（0 Hz）**与**倍频分量（2ω）**，根本不再是原来的单频正弦波！因此，用复数乘法去代表两个信号相乘是完全非法的。"
      ],
      "formula": {
        "expr": "cos(ωt + φ₁) · cos(ωt + φ₂) = ½ cos(φ₁ - φ₂) + ½ cos(2ωt + φ₁ + φ₂)",
        "explain": "时域信号相乘会产生直流偏置（第一项）与 2ω 倍频（第二项），破坏了单频正弦波的闭环结构，导致复数直接相乘的预测失效。"
      }
    },
    {
      "type": "concept",
      "heading": "使用复数表示正弦波的两大铁律",
      "paragraphs": [
        "**第一条铁律：所有正弦波必须处于同一频率（Same Frequency）**。例如，当 `1 + 1j` 与 `2 + 2j` 代表同一个频率下的两个正弦波时，它们的和 `3 + 3j` 准确代表叠加后的波形；可如果它们代表的是两个**不同频率**的信号，直接相加得到的 `3 + 3j` 就没有任何物理意义。",
        "**巧用频率变量**：同频要求并不意味着你必须提前知道 `ω` 的具体数值。复数里完全可以把 `ω` 保留为符号变量，例如 `(2ω + 3ωj) + (3ω + 1j) = 5ω + (3ω + 1)j`。这代表振幅和相位会随频率变化的信号（比如滤波器响应），只要保证**整个式子里的 `ω` 处处是同一个频率**即可。",
        "**第二条铁律：运算与系统必须是线性的（Linearity）**。信号之间只能做加法和减法，不能做乘法或除法。同样，正弦波通过的系统只能是放大器、衰减器、高通或低通滤波器等**线性系统**；绝对不能用复数去直接套用平方、削波（Clipping）或阈值截断（Thresholding）等非线性操作——正如卷积与傅里叶分析也只对线性系统成立一样。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：同频合法叠加 vs 非法乘法（倍频崩塌对比）",
      "instruction": "先在默认模式下调整两路信号的幅值与相位，观察复数相加与真实叠加完美重合；再打开“非法乘法”开关，亲眼看、亲耳听物理输出如何跳变到 2ω 倍频！",
      "controls": [
        {
          "type": "slider",
          "id": "amp1",
          "label": "信号1 幅值 M1",
          "min": 0.2,
          "max": 1.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phase1",
          "label": "信号1 相位 φ1",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": 0,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "amp2",
          "label": "信号2 幅值 M2",
          "min": 0.2,
          "max": 1.5,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "phase2",
          "label": "信号2 相位 φ2",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": 60,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "isMultiply",
          "label": "开启非法乘法对比 (关闭 = 合法同频相加)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听真实物理输出",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const { ctx, width, height } = lab;\nlet ac = null, osc = null, gain = null;\nconst f0 = 240;\n\nfunction syncAudio() {\n  const { amp1, phase1, amp2, phase2, isMultiply, play } = lab.values;\n  if (play) {\n    if (!ac) ac = lab.getAudioContext();\n    if (ac && ac.state === 'suspended') ac.resume();\n    if (ac && !osc) {\n      osc = ac.createOscillator();\n      gain = ac.createGain();\n      osc.type = 'sine';\n      gain.gain.value = 0;\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start();\n    }\n    if (osc && gain && ac) {\n      const p1 = phase1 * Math.PI / 180;\n      const p2 = phase2 * Math.PI / 180;\n      let targetFreq = f0;\n      let amp = 0;\n      if (!isMultiply) {\n        const re = amp1 * Math.cos(p1) + amp2 * Math.cos(p2);\n        const im = amp1 * Math.sin(p1) + amp2 * Math.sin(p2);\n        amp = Math.min(0.32, Math.hypot(re, im) * 0.11);\n        targetFreq = f0;\n      } else {\n        amp = Math.min(0.32, (amp1 * amp2 * 0.5) * 0.22);\n        targetFreq = f0 * 2;\n      }\n      osc.frequency.setTargetAtTime(targetFreq, ac.currentTime, 0.02);\n      gain.gain.setTargetAtTime(amp, ac.currentTime, 0.02);\n    }\n  } else if (gain && ac) {\n    gain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  const { amp1, phase1, amp2, phase2, isMultiply } = lab.values;\n  const p1 = phase1 * Math.PI / 180;\n  const p2 = phase2 * Math.PI / 180;\n  const z1r = amp1 * Math.cos(p1), z1i = amp1 * Math.sin(p1);\n  const z2r = amp2 * Math.cos(p2), z2i = amp2 * Math.sin(p2);\n\n  ctx.clearRect(0, 0, width, height);\n\n  const cx = 120, cy = 120, scale = 30;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = -3; i <= 3; i++) {\n    ctx.beginPath(); ctx.moveTo(cx + i * scale, 22); ctx.lineTo(cx + i * scale, 218); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(22, cy + i * scale); ctx.lineTo(218, cy + i * scale); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(22, cy); ctx.lineTo(218, cy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cx, 22); ctx.lineTo(cx, 218); ctx.stroke();\n\n  function drawVec(x0, y0, dx, dy, color, dashed) {\n    ctx.save();\n    if (dashed) ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(cx + x0 * scale, cy - y0 * scale);\n    ctx.lineTo(cx + (x0 + dx) * scale, cy - (y0 + dy) * scale);\n    ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(cx + (x0 + dx) * scale, cy - (y0 + dy) * scale, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.restore();\n  }\n\n  drawVec(0, 0, z1r, z1i, '#38bdf8', false);\n  drawVec(0, 0, z2r, z2i, '#ec4899', false);\n\n  let zr = 0, zi = 0;\n  if (!isMultiply) {\n    zr = z1r + z2r;\n    zi = z1i + z2i;\n    drawVec(z1r, z1i, z2r, z2i, 'rgba(236,72,153,0.4)', true);\n    drawVec(0, 0, zr, zi, '#10b981', false);\n  } else {\n    zr = z1r * z2r - z1i * z2i;\n    zi = z1r * z2i + z1i * z2r;\n    drawVec(0, 0, zr, zi, '#f59e0b', true);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(isMultiply ? '复数相乘 z1·z2 (琥珀虚线)' : '复数相加 z1+z2 (青绿)', 24, 32);\n\n  const gx = 260, gw = 440, gy = 120, ampScale = 30, cycles = 3;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 6; i++) {\n    const x = gx + (gw * i) / 6;\n    ctx.beginPath(); ctx.moveTo(x, 22); ctx.lineTo(x, 218); ctx.stroke();\n  }\n  for (let i = -2; i <= 2; i++) {\n    const y = gy + i * ampScale;\n    ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx + gw, gy); ctx.stroke();\n\n  ctx.strokeStyle = isMultiply ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= gw; i += 2) {\n    const wt = (i / gw) * cycles * Math.PI * 2;\n    const x1 = amp1 * Math.cos(wt + p1);\n    const x2 = amp2 * Math.cos(wt + p2);\n    const val = isMultiply ? (x1 * x2) : (x1 + x2);\n    const y = gy - val * ampScale;\n    if (i === 0) ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);\n  }\n  ctx.stroke();\n\n  const mPred = Math.hypot(zr, zi);\n  const pPred = Math.atan2(zi, zr);\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = isMultiply ? '#f59e0b' : '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= gw; i += 2) {\n    const wt = (i / gw) * cycles * Math.PI * 2;\n    const val = mPred * Math.cos(wt + pPred);\n    const y = gy - val * ampScale;\n    if (i === 0) ctx.moveTo(gx + i, y); else ctx.lineTo(gx + i, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.85)';\n  ctx.font = '11px sans-serif';\n  if (!isMultiply) {\n    ctx.fillText('合法加法：真实物理叠加 (青绿) 与复数预测 (白虚线) 完全重合 (240 Hz)', gx + 8, 30);\n    lab.setReadout(\n      `同频相加 | z1+z2 幅值 = ${mPred.toFixed(2)}, 相位 = ${(pPred * 180 / Math.PI).toFixed(1)}° | 物理频率保持 240 Hz`\n    );\n  } else {\n    ctx.fillText('非法乘法：真实乘积出现倍频 2ω + 直流偏置 (粉红)，复数预测彻底失效 (琥珀虚线)', gx + 8, 30);\n    lab.setReadout(\n      `乘法崩塌！复数预测: 240 Hz 单频 | 真实物理 x1·x2: 含直流分量与 480 Hz 倍频（试听音高跳高八度！）`\n    );\n  }\n}\n\nlab.onUpdate(() => {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "复数与正弦波之间是“替换表示关系”而非等式；只要全系统统一约定好虚部或相角的符号方向（如迎合傅里叶变换的负相角约定），就能无损转换极坐标与直角坐标。",
        "同频铁律：切勿把不同频率的正弦波复数直接相加；但可以把频率 ω 当作统一符号变量保留在表达式中，用于推导线性系统的频响曲线。",
        "线性铁律：正弦波复数（相量）只支持加减法与线性滤波/放大；遇到信号相乘（混频/调制）、平方、限幅削波或阈值判决等非线性操作，必须退回时域或使用频域卷积，绝对不能直接套用复数乘除。"
      ]
    }
  ]
});
