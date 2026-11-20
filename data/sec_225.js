window.__BOOK_REGISTER_SECTION__("sec_225", {
  "title": "拉普拉斯变换的策略：用“探针”测绘系统的山峰与山谷 (Strategy of the Laplace Transform)",
  "intuition": "拉普拉斯变换不是在像傅里叶变换那样拆解波形，而是用带指数包络的振荡“探针”去试探系统的冲激响应，通过找出积分恰好归零（零点）或刚好发散（极点）的位置，勾勒出决定频率响应的 s 平面地形图。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 火车夜行类比：为什么需要“地形图”而不是一串数字？",
      "paragraphs": [
        "想象你深夜乘坐一列沿笔直铁轨行驶的火车，窗外一片漆黑。你盯着车厢里的高度计，记录下了沿途数千个海拔数据点——你确实掌握了沿途高度的**全部信息**，但这只是一堆冰冷的局部数值。而列车长虽然没看高度计，却用一句话总结了全局：*“目的地在山脚下，途中还会擦过一座大山边缘、穿过一个山谷中心。”*",
        "在信号处理中，直接测得的冲激响应或频率响应（沿 $j\\omega$ 轴的切片）就像是你的数千个高度计读数；而 **s 平面** 就是列车长脑海里的三维地形图。频率响应之所以呈现某些起伏，正是由它“周围”的山地（**极点**）和盆地（**零点**）决定的。",
        "不过，上一节中矩形脉冲的 s 平面虽然好看，却对理解其频率响应毫无帮助。因为拉普拉斯变换是专为**由微分方程支配的物理线性系统**（电路、波动、热传导、机械运动等）量身定制的。这类系统的冲激响应在还没看波形前，我们就已经确知三大铁律：**① 因果性**（$t<0$ 时必为 0）；**② 波形形态**（必由正弦波与指数函数组合而成，绝不可能是方波或三角波）；**③ 无限长度**（一直延伸到 $t=+\\infty$：稳定系统会衰减到 0，而反馈过度的不稳定系统则会无限放大）。"
      ],
      "formula": {
        "expr": "h(t) = 0 (t < 0),   h(t) = Σ A_k e^(α_k t) cos(ω_k t + φ_k) (t ≥ 0)",
        "explain": "物理线性系统的冲激响应必满足因果性（t<0 为零），且在 t≥0 时必然表现为指数函数与正弦波的线性组合；若所有 α_k < 0 则系统稳定衰减，若有 α_k > 0 则系统发散不稳定。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 探测（Probing）而非分解：看透公式背后的真实意图",
      "paragraphs": [
        "表面上看，拉普拉斯变换与傅里叶变换的数学形式如出一辙：都是将预设波形乘以时域信号 $h(t)$，再从 $-\\infty$ 到 $+\\infty$ 求积分。很多初学者误以为拉普拉斯变换也是在“用正交基函数分解信号”。**完全不是！**",
        "傅里叶变换确实是在测量波形里含有多少正弦分量；而拉普拉斯变换的真实策略是**探测（Probing）**：它主动派出由两个参数控制的“探测波” $p(t)$（频率 $\\omega$ 与衰减/增长率 $\\sigma$），去和未知的冲激响应 $h(t)$ 相乘并求总面积，目的只有一个——**寻找能与 $h(t)$ 发生“精确抵消”的特定 $(\\sigma, \\omega)$ 坐标**。",
        "根据变换定义中的核心因子 $e^{-st} = e^{-\\sigma t}e^{-j\\omega t}$，当 $\\sigma > 0$（位于 s 平面右半边）时，探针本身随时间**衰减**；当 $\\sigma < 0$（位于 s 平面左半边）时，探针随时间**指数增长**。在探测过程中，绝大多数 $(\\sigma, \\omega)$ 算出来的面积都是毫无特色的普通有限数值，可以直接忽略；我们只关心两种产生“精确抵消”的特殊位置：**零点（Zeros）**和**极点（Poles）**。"
      ],
      "formula": {
        "expr": "X(σ, ω) = ∫[-∞ to +∞] h(t) · e^(-σt) · e^(-jωt) dt",
        "explain": "h(t) 是待测系统冲激响应；e^(-σt)e^(-jωt) 是对应 s 平面 (σ, ω) 位置的探测波：σ > 0 时探针随时间衰减，σ < 0 时探针随时间增长，ω 决定探针的振荡频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：用指数正弦“探针”寻找 RLC 陷波器的零点与极点",
      "instruction": "拖动「探针衰减/增长率 σ」和「探针频率 ω」滑块，依次复现书中 Fig. 32-5 的五种情形：尝试把探针调到 (σ=0, ω=3.0) 触发精确零点，再调到 (σ=-0.5, ω=3.0) 捕获极点临界！",
      "controls": [
        {
          "type": "slider",
          "id": "sigma",
          "label": "探针衰减/增长率 σ",
          "min": -1.2,
          "max": 0.8,
          "step": 0.05,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "omega",
          "label": "探针角频率 ω",
          "min": 1,
          "max": 5,
          "step": 0.1,
          "value": 3,
          "unit": " rad/μs"
        },
        {
          "type": "toggle",
          "id": "showEnv",
          "label": "显示探针指数包络",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst alpha = 0.5;\nconst omega0 = 3.0;\nconst tailScale = 1.0 / (0.5 * (1.0 / alpha + alpha / (alpha * alpha + 4 * omega0 * omega0)));\n\nfunction draw() {\n  const sigma = lab.values.sigma;\n  const omega = lab.values.omega;\n  const showEnv = lab.values.showEnv;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const p1 = { x: 10, y: 24, w: 152, h: 196 };\n  const p2 = { x: 176, y: 24, w: 170, h: 196 };\n  const p3 = { x: 358, y: 24, w: 170, h: 196 };\n  const p4 = { x: 540, y: 24, w: 170, h: 196 };\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.textAlign = 'center';\n  ctx.fillText('s 平面位置 (Fig.32-4)', p1.x + p1.w / 2, 15);\n  ctx.fillText('探测波 p(t)', p2.x + p2.w / 2, 15);\n  ctx.fillText('冲激响应 h(t)', p3.x + p3.w / 2, 15);\n  ctx.fillText('乘积 p(t)×h(t)', p4.x + p4.w / 2, 15);\n\n  [p1, p2, p3, p4].forEach(p => {\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(p.x, p.y, p.w, p.h);\n  });\n\n  const sMin = -1.35, sMax = 0.95, wMax = 5.5;\n  const mapS = s => p1.x + ((s - sMin) / (sMax - sMin)) * p1.w;\n  const mapW = w => p1.y + p1.h / 2 - (w / wMax) * (p1.h * 0.44);\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(p1.x, p1.y, p1.w, p1.h); ctx.clip();\n  const sx0 = mapS(0), wy0 = mapW(0);\n  ctx.fillStyle = 'rgba(236,72,153,0.06)';\n  ctx.fillRect(sx0, p1.y, p1.x + p1.w - sx0, p1.h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(p1.x, wy0); ctx.lineTo(p1.x + p1.w, wy0);\n  ctx.moveTo(sx0, p1.y); ctx.lineTo(sx0, p1.y + p1.h);\n  ctx.stroke();\n  ctx.fillStyle = 'rgba(255,255,255,0.45)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('jω', sx0 + 10, p1.y + 12);\n  ctx.fillText('σ', p1.x + p1.w - 10, wy0 - 4);\n\n  const poleX = mapS(-alpha);\n  [omega0, -omega0].forEach(w => {\n    const py = mapW(w);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(poleX - 4, py - 4); ctx.lineTo(poleX + 4, py + 4);\n    ctx.moveTo(poleX + 4, py - 4); ctx.lineTo(poleX - 4, py + 4);\n    ctx.stroke();\n    const zy = mapW(w);\n    ctx.strokeStyle = '#10b981';\n    ctx.beginPath();\n    ctx.arc(sx0, zy, 4.5, 0, Math.PI * 2);\n    ctx.stroke();\n  });\n\n  const probeX = mapS(sigma);\n  [omega, -omega].forEach(w => {\n    const py = mapW(w);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillRect(probeX - 4, py - 4, 8, 8);\n  });\n  ctx.restore();\n\n  const tMin = -1.2, tMax = 6.2;\n  function drawTimeGrid(box) {\n    const yMid = box.y + box.h / 2;\n    const x0 = box.x + ((0 - tMin) / (tMax - tMin)) * box.w;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(box.x, yMid); ctx.lineTo(box.x + box.w, yMid);\n    ctx.moveTo(x0, box.y); ctx.lineTo(x0, box.y + box.h);\n    ctx.stroke();\n    return { x0, yMid };\n  }\n\n  const N = 220;\n  const mapT = (box, t) => box.x + ((t - tMin) / (tMax - tMin)) * box.w;\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(p2.x, p2.y, p2.w, p2.h); ctx.clip();\n  const g2 = drawTimeGrid(p2);\n  const scaleP = 22;\n  if (showEnv) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.45)';\n    ctx.setLineDash([3, 3]);\n    ctx.lineWidth = 1;\n    [1, -1].forEach(sgn => {\n      ctx.beginPath();\n      for (let i = 0; i <= N; i++) {\n        const t = tMin + (i / N) * (tMax - tMin);\n        const env = sgn * Math.exp(-sigma * t);\n        const x = mapT(p2, t);\n        const y = g2.yMid - env * scaleP;\n        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n      }\n      ctx.stroke();\n    });\n    ctx.setLineDash([]);\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const t = tMin + (i / N) * (tMax - tMin);\n    const val = Math.exp(-sigma * t) * Math.cos(omega * t);\n    const x = mapT(p2, t);\n    const y = g2.yMid - val * scaleP;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(p3.x, p3.y, p3.w, p3.h); ctx.clip();\n  const g3 = drawTimeGrid(p3);\n  const scaleH = 54;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const t = tMin + (i / N) * (tMax - tMin);\n    const val = t < 0 ? 0 : -tailScale * Math.exp(-alpha * t) * Math.cos(omega0 * t);\n    const x = mapT(p3, t);\n    const y = g3.yMid - val * scaleH;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(g3.x0, g3.yMid);\n  ctx.lineTo(g3.x0, g3.yMid - 1.35 * scaleH);\n  ctx.stroke();\n  ctx.beginPath();\n  ctx.moveTo(g3.x0 - 4, g3.yMid - 1.35 * scaleH + 6);\n  ctx.lineTo(g3.x0, g3.yMid - 1.35 * scaleH);\n  ctx.lineTo(g3.x0 + 4, g3.yMid - 1.35 * scaleH + 6);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(p4.x, p4.y, p4.w, p4.h); ctx.clip();\n  const g4 = drawTimeGrid(p4);\n  const scaleM = 46;\n  ctx.beginPath();\n  ctx.moveTo(g4.x0, g4.yMid);\n  for (let i = 0; i <= N; i++) {\n    const t = tMin + (i / N) * (tMax - tMin);\n    if (t < 0) continue;\n    const val = -tailScale * Math.exp(-(alpha + sigma) * t) * Math.cos(omega * t) * Math.cos(omega0 * t);\n    ctx.lineTo(mapT(p4, t), g4.yMid - val * scaleM);\n  }\n  ctx.lineTo(p4.x + p4.w, g4.yMid);\n  ctx.closePath();\n  ctx.fillStyle = (alpha + sigma) <= 0 ? 'rgba(236,72,153,0.28)' : 'rgba(56,189,248,0.22)';\n  ctx.fill();\n\n  ctx.strokeStyle = (alpha + sigma) <= 0 ? '#ec4899' : '#f59e0b';\n  ctx.lineWidth = 1.7;\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const t = tMin + (i / N) * (tMax - tMin);\n    const val = t < 0 ? 0 : -tailScale * Math.exp(-(alpha + sigma) * t) * Math.cos(omega * t) * Math.cos(omega0 * t);\n    const x = mapT(p4, t);\n    const y = g4.yMid - val * scaleM;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(g4.x0, g4.yMid);\n  ctx.lineTo(g4.x0, g4.yMid - 1.35 * scaleM);\n  ctx.stroke();\n\n  const netDecay = alpha + sigma;\n  const nearZero = Math.abs(sigma) < 0.06 && Math.abs(omega - omega0) < 0.16;\n  const nearPole = Math.abs(netDecay) < 0.06 && Math.abs(omega - omega0) < 0.16;\n  let badgeText = '';\n  let badgeColor = '#94a3b8';\n  let areaDesc = '';\n\n  if (nearZero) {\n    badgeText = 'b. 零点 ZERO: 面积 = 0';\n    badgeColor = '#10b981';\n    areaDesc = '面积精确归零 (0.00) —— 正脉冲面积与负向尾波面积完全抵消！';\n  } else if (nearPole) {\n    badgeText = 'd. 极点 POLE: 面积刚发散';\n    badgeColor = '#ec4899';\n    areaDesc = '面积刚好发散 (∞) —— 探针增长率恰好抵消系统衰减，位于 ROC 边界！';\n  } else if (netDecay < 0) {\n    badgeText = 'e. 增长过快: 面积未定义';\n    badgeColor = '#f59e0b';\n    areaDesc = '面积发散/未定义 (超出收敛域 ROC)';\n  } else {\n    const a = netDecay;\n    const iTail = 0.5 * tailScale * (a / (a * a + (omega - omega0) * (omega - omega0)) + a / (a * a + (omega + omega0) * (omega + omega0)));\n    const area = 1.0 - iTail;\n    badgeText = (sigma > 0 ? 'a. ' : 'c. ') + '有限值: ' + area.toFixed(2);\n    badgeColor = '#38bdf8';\n    areaDesc = '有限实数 ' + area.toFixed(3) + ' (无精确抵消)';\n  }\n\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(p4.x + 6, p4.y + 6, p4.w - 12, 22);\n  ctx.strokeStyle = badgeColor;\n  ctx.strokeRect(p4.x + 6, p4.y + 6, p4.w - 12, 22);\n  ctx.fillStyle = badgeColor;\n  ctx.font = 'bold 10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(badgeText, p4.x + p4.w / 2, p4.y + 20);\n  ctx.restore();\n\n  lab.setReadout('探针 (σ=' + sigma.toFixed(2) + ', ω=' + omega.toFixed(1) + ') | 合成衰减率 (α+σ)=' + netDecay.toFixed(2) + ' | 积分结果: ' + areaDesc);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 五种探测结果：零点、极点与收敛域 (ROC) 的物理铁律",
      "paragraphs": [
        "结合上面实验与原书 Fig. 32-5 的五个典型案例，我们可以彻底看清 s 平面的物理意义：",
        "**情形 (a) $\\sigma > 0$（右半平面）**：探针随时间衰减，而稳定系统的冲激响应也在衰减，两者相乘只会衰减得更快，积分必然是个平庸的有限实数。这直接推导出一条至关重要的工程铁律：**任何稳定系统的极点绝不可能出现在右半平面（$\\sigma > 0$）**。一旦在右半平面发现极点，说明系统的冲激响应本身随时间指数增长——这是一个**不稳定系统**（例如发生啸叫的自激放大器）。",
        "**情形 (b) 零点（Zeros，用 $\\circ$ 表示）**：当探针频率和衰减率满足特定组合时，冲激响应在 $t=0$ 处的正向冲击面积，恰好等于后续整流状振荡尾波的负向面积，总积分**精确等于 0**。这对应频率响应上的“山谷”（陷波）。",
        "**情形 (c)、(d)、(e) 极点（Poles，用 $\\times$ 表示）与收敛域**：当 $\\sigma < 0$ 时探针开始指数增长。若增长慢于系统衰减（情形 c），乘积仍衰减，积分有限；若增长**快于**系统衰减（情形 e），乘积随时间无限变大，积分彻底发散无定义——数学上称该区域在**收敛域（Region of Convergence, ROC）**之外。而恰好卡在 (c) 与 (e) 分界线上的位置（情形 d），探针增长率**精确抵消**了系统衰减率，乘积保持等幅振荡，面积“刚好发散到无穷大”。这个处在收敛域边界上的坐标，就是**极点**，它代表了系统自身固有的自然衰减常数与固有振荡频率！"
      ],
      "formula": {
        "expr": "稳定系统判据：所有极点 σ_pole < 0 （全位于 s 平面左半边）",
        "explain": "极点实部 σ_pole 反映了冲激响应的包络变化率 e^(σ_pole · t)：σ_pole < 0 对应衰减收敛（稳定）；σ_pole = 0 对应等幅振荡（临界稳定）；σ_pole > 0 对应指数爆炸（不稳定）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：极点地形如何抬升频率响应、决定衰变听感与稳定性",
      "instruction": "拖动「极点实部 σ_p」靠近甚至越过 jω 轴（火车铁轨），同时切换「启用 jω 轴陷波零点」，点击播放按钮实时听辨“山峰共振”与“山谷陷波”的听感差异！",
      "controls": [
        {
          "type": "slider",
          "id": "poleSigma",
          "label": "极点实部 σ_p (稳定性)",
          "min": -1.4,
          "max": 0.15,
          "step": 0.05,
          "value": -0.35,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "poleFreq",
          "label": "极点固有频率 f_p",
          "min": 250,
          "max": 1100,
          "step": 10,
          "value": 520,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "addZero",
          "label": "启用 jω 轴陷波零点 (山谷)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲激发声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet trainW = 0;\nlet nextAudioTime = 0;\n\nfunction triggerSound(ac) {\n  const now = ac.currentTime;\n  const sig = lab.values.poleSigma;\n  const freq = lab.values.poleFreq;\n  const hasZero = lab.values.addZero;\n\n  if (sig >= 0) {\n    const osc = ac.createOscillator();\n    const g = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(freq, now);\n    g.gain.setValueAtTime(0.015, now);\n    g.gain.exponentialRampToValueAtTime(0.16, now + 0.45);\n    g.gain.exponentialRampToValueAtTime(0.001, now + 0.72);\n    osc.connect(g); g.connect(ac.destination);\n    osc.start(now); osc.stop(now + 0.75);\n    return;\n  }\n\n  const len = Math.floor(ac.sampleRate * 0.45);\n  const buf = ac.createBuffer(1, len, ac.sampleRate);\n  const ch = buf.getChannelData(0);\n  for (let i = 0; i < len; i++) {\n    const t = i / ac.sampleRate;\n    const env = i === 0 ? 1.0 : 0.22 * Math.exp(-t * 6.5);\n    ch[i] = (i === 0 ? 1.0 : (Math.random() * 2 - 1)) * env;\n  }\n\n  const src = ac.createBufferSource();\n  src.buffer = buf;\n  const flt = ac.createBiquadFilter();\n  flt.type = hasZero ? 'notch' : 'bandpass';\n  flt.frequency.setValueAtTime(freq, now);\n  const qVal = Math.min(30, Math.max(0.6, 0.75 / Math.max(0.025, -sig)));\n  flt.Q.setValueAtTime(qVal, now);\n\n  const master = ac.createGain();\n  master.gain.setValueAtTime(hasZero ? 0.28 : Math.min(0.45, 0.16 + qVal * 0.012), now);\n  src.connect(flt); flt.connect(master); master.connect(ac.destination);\n  src.start(now); src.stop(now + 0.48);\n}\n\nfunction draw() {\n  const sig = lab.values.poleSigma;\n  const freq = lab.values.poleFreq;\n  const hasZero = lab.values.addZero;\n\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const b1 = { x: 10, y: 24, w: 200, h: 196 };\n  const b2 = { x: 224, y: 24, w: 244, h: 196 };\n  const b3 = { x: 482, y: 24, w: 228, h: 196 };\n\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.textAlign = 'center';\n  ctx.fillText('s 平面地形与铁轨 (jω轴)', b1.x + b1.w / 2, 15);\n  ctx.fillText('沿铁轨测得的频率响应 |H(jω)|', b2.x + b2.w / 2, 15);\n  ctx.fillText('系统冲激响应 h(t)', b3.x + b3.w / 2, 15);\n\n  [b1, b2, b3].forEach(b => {\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(b.x, b.y, b.w, b.h);\n  });\n\n  const sMin = -1.6, sMax = 0.5, fMax = 1400;\n  const mapS = s => b1.x + ((s - sMin) / (sMax - sMin)) * b1.w;\n  const mapF = f => b1.y + b1.h / 2 - (f / fMax) * (b1.h * 0.45);\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(b1.x, b1.y, b1.w, b1.h); ctx.clip();\n  const sx0 = mapS(0), fy0 = mapF(0);\n  ctx.fillStyle = 'rgba(236,72,153,0.12)';\n  ctx.fillRect(sx0, b1.y, b1.x + b1.w - sx0, b1.h);\n  ctx.fillStyle = 'rgba(236,72,153,0.65)';\n  ctx.font = '9px sans-serif';\n  ctx.fillText('不稳定区', sx0 + 24, b1.y + 14);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.beginPath();\n  ctx.moveTo(b1.x, fy0); ctx.lineTo(b1.x + b1.w, fy0);\n  ctx.stroke();\n  ctx.strokeStyle = '#f59e0b';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(sx0, b1.y); ctx.lineTo(sx0, b1.y + b1.h);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const px = mapS(sig);\n  [freq, -freq].forEach(f => {\n    const py = mapF(f);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    ctx.moveTo(px - 5, py - 5); ctx.lineTo(px + 5, py + 5);\n    ctx.moveTo(px + 5, py - 5); ctx.lineTo(px - 5, py + 5);\n    ctx.stroke();\n    if (hasZero) {\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.arc(sx0, py, 5, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n  });\n  const trainY = mapF(trainW);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(sx0, trainY, 4, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(b2.x, b2.y, b2.w, b2.h); ctx.clip();\n  const wn = freq / 500;\n  function evalMag(f) {\n    const w = f / 500;\n    const denRe = -w * w + sig * sig + wn * wn;\n    const denIm = -2 * sig * w;\n    const den = Math.sqrt(denRe * denRe + denIm * denIm);\n    if (hasZero) {\n      const num = Math.abs(-w * w + wn * wn);\n      return Math.min(2.4, num / Math.max(0.03, den));\n    } else {\n      return Math.min(4.0, 0.85 / Math.max(0.04, den));\n    }\n  }\n\n  const baseLine = b2.y + b2.h - 20;\n  const scaleMag = hasZero ? 68 : 40;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(b2.x, baseLine); ctx.lineTo(b2.x + b2.w, baseLine);\n  ctx.stroke();\n\n  ctx.beginPath();\n  ctx.moveTo(b2.x, baseLine);\n  for (let i = 0; i <= 160; i++) {\n    const f = (i / 160) * fMax;\n    const m = evalMag(f);\n    const x = b2.x + (i / 160) * b2.w;\n    const y = baseLine - m * scaleMag;\n    ctx.lineTo(x, y);\n  }\n  ctx.lineTo(b2.x + b2.w, baseLine);\n  ctx.closePath();\n  ctx.fillStyle = hasZero ? 'rgba(16,185,129,0.18)' : 'rgba(56,189,248,0.22)';\n  ctx.fill();\n\n  ctx.strokeStyle = hasZero ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 160; i++) {\n    const f = (i / 160) * fMax;\n    const m = evalMag(f);\n    const x = b2.x + (i / 160) * b2.w;\n    const y = baseLine - m * scaleMag;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  const tx = b2.x + (trainW / fMax) * b2.w;\n  const ty = baseLine - evalMag(trainW) * scaleMag;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(tx, ty, 4, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '9px sans-serif';\n  ctx.fillText('f_p = ' + freq + 'Hz', b2.x + (freq / fMax) * b2.w, b2.y + 14);\n  ctx.restore();\n\n  ctx.save();\n  ctx.beginPath(); ctx.rect(b3.x, b3.y, b3.w, b3.h); ctx.clip();\n  const tMin = -0.8, tMax = 6.0;\n  const x0 = b3.x + ((0 - tMin) / (tMax - tMin)) * b3.w;\n  const yMid = b3.y + b3.h / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.beginPath();\n  ctx.moveTo(b3.x, yMid); ctx.lineTo(b3.x + b3.w, yMid);\n  ctx.moveTo(x0, b3.y); ctx.lineTo(x0, b3.y + b3.h);\n  ctx.stroke();\n\n  const wVis = 2 * Math.PI * (freq / 350);\n  const ampScale = 52;\n  ctx.strokeStyle = sig >= 0 ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 1.7;\n  ctx.beginPath();\n  for (let i = 0; i <= 220; i++) {\n    const t = tMin + (i / 220) * (tMax - tMin);\n    let val = 0;\n    if (t >= 0) {\n      const env = Math.exp(1.6 * sig * t);\n      val = hasZero ? -0.85 * env * Math.cos(wVis * t) : env * Math.sin(wVis * t);\n    }\n    const x = b3.x + (i / 220) * b3.w;\n    const y = yMid - val * ampScale;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  if (hasZero) {\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    ctx.moveTo(x0, yMid); ctx.lineTo(x0, yMid - 65);\n    ctx.stroke();\n  }\n  ctx.restore();\n\n  let status = sig < 0 ? '稳定系统 (衰减收敛)' : (sig === 0 ? '临界振荡 (等幅不衰)' : '⚠ 不稳定系统 (右半平面极点发散！)');\n  let mode = hasZero ? '陷波器山谷 (零点抵消该频率)' : '谐振峰山地 (极点抬升该频率)';\n  lab.setReadout('σ_p=' + sig.toFixed(2) + ', f_p=' + freq + 'Hz | ' + mode + ' | ' + status);\n}\n\nlab.onUpdate(() => {\n  nextAudioTime = 0;\n  draw();\n});\n\nlab.onLoop((dt, timeSec) => {\n  trainW = (trainW + dt * 260) % 1400;\n  if (lab.values.play) {\n    const ac = lab.getAudioContext();\n    if (ac) {\n      if (ac.state === 'suspended') ac.resume();\n      if (ac.state === 'running' && timeSec >= nextAudioTime) {\n        nextAudioTime = timeSec + 0.95;\n        triggerSound(ac);\n      }\n    }\n  } else {\n    nextAudioTime = 0;\n  }\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "拉普拉斯变换不是万能波形分解器：对矩形脉冲、三角波等非微分方程解求 s 平面毫无分析价值；它专为“正弦+指数”构成的线性因果物理系统而生。",
        "探针思维：拉普拉斯变换用 e^(-σt)cos(ωt) 去乘以冲激响应并积分，旨在寻找面积归零的“零点（山谷）”和处在收敛域边缘、面积刚好发散的“极点（山峰）”。",
        "右半平面极点是死穴：注意 e^(-σt) 的符号，σ > 0 时探针衰减；如果稳定系统在 σ > 0 绝不可能产生抵消极点。因此只要发现极点落在 σ > 0 的右半平面，系统必然发散失控。",
        "零极点距离 jω 轴越近，对频率响应的统治力越强：极点贴近 jω 轴会造出尖锐的谐振峰（时域伴随长余振），零点落在 jω 轴上则会挖出深达零的陷波谷。"
      ]
    }
  ]
});
