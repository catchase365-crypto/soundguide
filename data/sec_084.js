window.__BOOK_REGISTER_SECTION__("sec_084", {
  "title": "非周期离散信号与离散时间傅里叶变换 (Aperiodic-Discrete & DTFT)",
  "intuition": "只在离散时刻取值、且从负无穷到正无穷永不重复的信号，需要连续无穷多个正弦波才能合成；这让它对应的 DTFT 只能留在理论推导中，无法被有限内存的计算机直接算出。",
  "blocks": [
    {
      "type": "concept",
      "heading": "什么是非周期离散信号？(Aperiodic-Discrete)",
      "paragraphs": [
        "在信号的世界里，任何信号都可以按两个维度划分：**连续 vs. 离散**（时间轴是否连续），以及**周期 vs. 非周期**（波形是否无限重复）。将这两个特征两两组合，就诞生了傅里叶变换家族的四大分支。其中，**非周期离散（Aperiodic-Discrete）**信号是指：**仅在负无穷到正无穷之间的离散时间点上有定义，并且不会以任何固定周期重复自己的信号**。",
        "例如，一个在某个时刻突然出现、随后逐渐衰减归零的离散脉冲序列，或者两侧无限延伸为零的离散高斯波包，都属于这一类。针对这种信号使用的傅里叶变换，被称为**离散时间傅里叶变换（Discrete Time Fourier Transform，简称 DTFT）**。",
        "你可能会觉得这四种傅里叶变换的命名（Fourier Transform、Fourier Series、DTFT、DFT）非常混乱、毫无规律。原书作者坦诚地指出：你的感觉完全没错，这些名字是在过去 200 年里杂乱无章地演化出来的，没有捷径，**直接死记硬背下来即可**——记住“非周期 + 离散 = DTFT”。"
      ],
      "formula": {
        "expr": null,
        "explain": "本小节重点建立信号分类与可计算性的物理直觉，暂不引入复数积分公式。"
      }
    },
    {
      "type": "concept",
      "heading": "有限长度的计算机数据，如何变成“非周期离散”？",
      "paragraphs": [
        "看到“从负无穷延伸到正无穷”，你一定会有疑问：如果我的电脑内存里只存了有限长度的数据（比如 `1024` 个采样点），难道没有专门针对“有限长信号”的傅里叶变换吗？答案是：**没有**。",
        "原因在于，用来做频谱分解的正弦波和余弦波，在数学定义上都是从负无穷延伸到正无穷的**无限长信号**。你无法用一群无限长的波，直接去拼出一个“仅在有限区间存在、区间外毫无定义”的东西。",
        "解决这个矛盾的唯一办法，就是通过“脑补”把有限数据伪装成无限长信号：我们假设这 `1024` 个真实样本的左边和右边，还有无穷多个虚拟样本。如果你脑补出来的左右两侧样本**全都是 0**，那么整条信号在视觉和数学上就变成了一个**非周期、离散**的信号——此时 **DTFT** 就正式登场了。（作为对比，如果你脑补成把这 `1024` 个点无限复制循环，它就成了周期离散信号，对应 **DFT**。）"
      ],
      "formula": {
        "expr": null,
        "explain": "有限样本的两侧补零（Zero-padding to infinity）是构造非周期离散信号的理论桥梁。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：有限样本的“无限脑补”开关（补零 vs. 周期复制）",
      "instruction": "拖动采样点数与形态滑块，再切换下方的“脑补方式”开关，观察有限数据如何通过两侧延拓变成 DTFT（非周期离散）或 DFT（周期离散）对象。",
      "controls": [
        {
          "type": "slider",
          "id": "nPoints",
          "label": "实际采样点数 N",
          "min": 4,
          "max": 16,
          "step": 2,
          "value": 8,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "shape",
          "label": "波形衰减快慢",
          "min": 1,
          "max": 5,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "periodic",
          "label": "脑补方式：开启=周期复制(DFT) / 关闭=两侧补零(DTFT)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction baseVal(k, N, shape) {\n  const decay = Math.exp(-k / (shape * 0.9 + 0.5));\n  const osc = 0.35 + 0.65 * Math.cos((k / N) * Math.PI * 1.4);\n  return decay * osc;\n}\n\nfunction draw() {\n  const N = lab.values.nPoints;\n  const periodic = lab.values.periodic;\n  const shape = lab.values.shape;\n\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n\n  const baseY = 162;\n  const ampScale = 95;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let y = 42; y <= 202; y += 40) {\n    ctx.beginPath();\n    ctx.moveTo(20, y);\n    ctx.lineTo(W - 20, y);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n  ctx.beginPath();\n  ctx.moveTo(20, baseY);\n  ctx.lineTo(W - 20, baseY);\n  ctx.stroke();\n\n  const totalSlots = 48;\n  const leftCount = Math.floor((totalSlots - N) / 2);\n  const startIdx = -leftCount;\n  const endIdx = startIdx + totalSlots - 1;\n  const marginX = 36;\n  const stepX = (W - marginX * 2) / (totalSlots - 1);\n\n  const boxX1 = marginX + (0 - startIdx) * stepX - stepX * 0.45;\n  const boxX2 = marginX + (N - 1 - startIdx) * stepX + stepX * 0.45;\n  ctx.fillStyle = \"rgba(16, 185, 129, 0.08)\";\n  ctx.fillRect(boxX1, 34, boxX2 - boxX1, H - 56);\n  ctx.strokeStyle = \"rgba(16, 185, 129, 0.45)\";\n  ctx.setLineDash([4, 4]);\n  ctx.strokeRect(boxX1, 34, boxX2 - boxX1, H - 56);\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = \"#10b981\";\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"center\";\n  ctx.fillText(\"计算机内存中的实际样本 (N=\" + N + \")\", (boxX1 + boxX2) / 2, 24);\n\n  for (let idx = startIdx; idx <= endIdx; idx++) {\n    const x = marginX + (idx - startIdx) * stepX;\n    const isActual = idx >= 0 && idx < N;\n    let val = 0;\n    if (isActual) {\n      val = baseVal(idx, N, shape);\n    } else if (periodic) {\n      const modIdx = ((idx % N) + N) % N;\n      val = baseVal(modIdx, N, shape);\n    } else {\n      val = 0;\n    }\n    const y = baseY - val * ampScale;\n\n    const color = isActual ? \"#10b981\" : (periodic ? \"#f59e0b\" : \"#38bdf8\");\n    ctx.strokeStyle = color;\n    ctx.lineWidth = isActual ? 2.2 : 1.5;\n    ctx.globalAlpha = isActual ? 1.0 : 0.78;\n\n    ctx.beginPath();\n    ctx.moveTo(x, baseY);\n    ctx.lineTo(x, y);\n    ctx.stroke();\n\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(x, y, isActual ? 4.2 : 3.0, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.globalAlpha = 1.0;\n  }\n\n  ctx.fillStyle = periodic ? \"#f59e0b\" : \"#38bdf8\";\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"← -∞ 脑补延拓\", 22, H - 10);\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"脑补延拓 +∞ →\", W - 22, H - 10);\n  ctx.textAlign = \"center\";\n  ctx.fillText(periodic ? \"周期延拓：周期离散信号 (DFT)\" : \"两侧补零：非周期离散信号 (DTFT)\", W / 2, H - 10);\n\n  if (periodic) {\n    lab.setReadout(\"脑补方式：无限周期复制（周期=\" + N + \"点）｜信号类别：周期离散｜对应变换：DFT（计算机可直接计算）\");\n  } else {\n    lab.setReadout(\"脑补方式：两侧无限补零｜信号类别：非周期离散｜对应变换：DTFT（需要无穷个正弦波，算法无法直接求解）\");\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "为什么计算机算法无法计算 DTFT？（无穷正弦波困境）",
      "paragraphs": [
        "既然只要把有限样本两侧补零，就能顺理成章地使用 DTFT，为什么我们在写 DSP 程序时却不用它呢？原书给出了一个一针见血的物理事实：**要合成一个非周期（aperiodic）的信号，需要无穷多个正弦波**。",
        "你可以这样理解：只有当所有频率成分的步长无限紧密、连成一条连续曲线时，这些正弦波才能在脉冲中心点同相叠加出波形，同时在左右两侧直至无穷远处精准地相互抵消为零（永不再次出现周期性回响）。哪怕只有有限个正弦波，它们的叠加结果也必然在某个大周期后重新重复。",
        "由于计算机只能处理**离散且有限长**的数据，既不可能存储无穷多个频率，也不可能执行无穷次求和，**因此计算机算法根本无法计算出 DTFT**。通过排除法，数字信号处理中唯一能在电脑上跑起来的变换就只剩下 **DFT**。至于 DTFT，它主要出现在课堂作业、理论推导和数学谜题中；一旦你坐到电脑前开始写代码，你用到的永远只有 DFT。"
      ],
      "formula": {
        "expr": "合成非周期信号  ==>  频谱连续  ==>  需要无穷多个正弦波 (∞)",
        "explain": "频域的连续性等价于时域的非周期性，这是计算机无法直接计算 DTFT 的根本原因。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：逼近非周期离散信号为何需要“无穷正弦波”？（含听感对比）",
      "instruction": "先增大“补零延拓倍数”让左右鬼影消失（趋近非周期），观察绿色合成波形如何瞬间坍塌，必须大幅拉高正弦波数 K 才能恢复脉冲；右侧可看到离散谱线如何逐渐填满连续的粉色 DTFT 包络。点击播放可对比声音从“周期音调”变为“非周期脉冲”的听感。",
      "controls": [
        {
          "type": "slider",
          "id": "pulseW",
          "label": "脉冲宽度",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "pad",
          "label": "补零延拓倍数 (趋向非周期)",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "sinCount",
          "label": "正弦波数量 K",
          "min": 1,
          "max": 60,
          "step": 1,
          "value": 8,
          "unit": " 个"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet currentSrc = null;\n\nfunction stopAudio() {\n  if (currentSrc) {\n    try { currentSrc.stop(); } catch (e) {}\n    try { currentSrc.disconnect(); } catch (e) {}\n    currentSrc = null;\n  }\n}\n\nfunction targetVal(n, sigma) {\n  return Math.exp(-(n * n) / (2 * sigma * sigma));\n}\n\nfunction update() {\n  const pulseW = lab.values.pulseW;\n  const pad = lab.values.pad;\n  const sinCount = lab.values.sinCount;\n  const play = lab.values.play;\n\n  const sigma = pulseW * 0.75;\n  const L = 20 * pad;\n  const M = L / 2;\n  const usedK = Math.min(sinCount, M);\n\n  const coeffs = new Array(usedK + 1).fill(0);\n  for (let k = 0; k <= usedK; k++) {\n    let sum = 0;\n    for (let n = -M; n < M; n++) {\n      sum += targetVal(n, sigma) * Math.cos((2 * Math.PI * k * n) / L);\n    }\n    const factor = (k === 0 || k === M) ? (1 / L) : (2 / L);\n    coeffs[k] = factor * sum;\n  }\n\n  ctx.fillStyle = \"#0b1120\";\n  ctx.fillRect(0, 0, W, H);\n\n  const lx1 = 16, lx2 = 420, lw = lx2 - lx1;\n  const rx1 = 446, rx2 = 704, rw = rx2 - rx1;\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let y = 40; y <= 200; y += 40) {\n    ctx.beginPath(); ctx.moveTo(lx1, y); ctx.lineTo(lx2, y); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx1, y); ctx.lineTo(rx2, y); ctx.stroke();\n  }\n\n  const baseY = 196;\n  const ampScale = 140;\n  ctx.strokeStyle = \"rgba(255,255,255,0.25)\";\n  ctx.beginPath(); ctx.moveTo(lx1, baseY); ctx.lineTo(lx2, baseY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(rx1, baseY); ctx.lineTo(rx2, baseY); ctx.stroke();\n\n  const viewN = 45;\n  function nToX(n) {\n    return lx1 + ((n + viewN) / (2 * viewN)) * lw;\n  }\n\n  for (let n = -viewN; n <= viewN; n++) {\n    const x = nToX(n);\n    const tv = targetVal(n, sigma);\n    const ty = baseY - tv * ampScale;\n    ctx.fillStyle = \"rgba(245, 158, 11, 0.75)\";\n    ctx.beginPath();\n    ctx.arc(x, ty, 2.3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const fineSteps = 180;\n  for (let i = 0; i <= fineSteps; i++) {\n    const n = -viewN + (i / fineSteps) * (2 * viewN);\n    let sv = 0;\n    for (let k = 0; k <= usedK; k++) {\n      sv += coeffs[k] * Math.cos((2 * Math.PI * k * n) / L);\n    }\n    const sx = nToX(n);\n    const sy = baseY - sv * ampScale;\n    if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  for (let n = -viewN; n <= viewN; n += 2) {\n    let sv = 0;\n    for (let k = 0; k <= usedK; k++) {\n      sv += coeffs[k] * Math.cos((2 * Math.PI * k * n) / L);\n    }\n    ctx.fillStyle = \"#10b981\";\n    ctx.beginPath();\n    ctx.arc(nToX(n), baseY - sv * ampScale, 2.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  let h0 = 0;\n  for (let n = -50; n <= 50; n++) h0 += targetVal(n, sigma);\n\n  ctx.strokeStyle = \"#ec4899\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const wSteps = 120;\n  for (let i = 0; i <= wSteps; i++) {\n    const w = (i / wSteps) * Math.PI;\n    let hw = 0;\n    for (let n = -50; n <= 50; n++) hw += targetVal(n, sigma) * Math.cos(w * n);\n    const mag = Math.max(0, hw / h0);\n    const px = rx1 + (w / Math.PI) * rw;\n    const py = baseY - mag * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let k = 0; k <= usedK; k++) {\n    const w = (k / M) * Math.PI;\n    const rawScale = (k === 0 || k === M) ? L : (L / 2);\n    const mag = Math.max(0, (coeffs[k] * rawScale) / h0);\n    const px = rx1 + (w / Math.PI) * rw;\n    const py = baseY - mag * ampScale;\n    ctx.strokeStyle = \"#38bdf8\";\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    ctx.moveTo(px, baseY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = \"#38bdf8\";\n    ctx.beginPath();\n    ctx.arc(px, py, 2.3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"12px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"时域：目标非周期脉冲(橙) vs \" + usedK + \"个余弦波合成(绿)\", lx1, 22);\n  ctx.fillText(\"频域：连续 DTFT 包络(粉) vs 离散谐波(蓝)\", rx1, 22);\n\n  ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n  ctx.font = \"11px sans-serif\";\n  ctx.fillText(\"窗口跨度 L=\" + L + \" 点 (最大有效谐波 \" + M + \")\", lx1, H - 10);\n  ctx.fillText(\"0\", rx1, H - 10);\n  ctx.textAlign = \"right\";\n  ctx.fillText(\"π (Nyquist)\", rx2, H - 10);\n\n  stopAudio();\n  if (play) {\n    const actx = lab.getAudioContext();\n    if (actx.state === \"suspended\") actx.resume();\n    const f0 = 220 / pad;\n    const sr = actx.sampleRate;\n    const cycles = Math.max(1, Math.round(0.75 * f0));\n    const bufLen = Math.max(256, Math.round((cycles / f0) * sr));\n    const buf = actx.createBuffer(1, bufLen, sr);\n    const data = buf.getChannelData(0);\n    let maxAbs = 0.0001;\n    for (let i = 0; i < bufLen; i++) {\n      let s = 0;\n      for (let k = 1; k <= usedK; k++) {\n        if (k * f0 < sr * 0.42) {\n          s += coeffs[k] * Math.cos((2 * Math.PI * k * cycles * i) / bufLen);\n        }\n      }\n      data[i] = s;\n      if (Math.abs(s) > maxAbs) maxAbs = Math.abs(s);\n    }\n    const norm = 0.22 / maxAbs;\n    for (let i = 0; i < bufLen; i++) data[i] *= norm;\n    const src = actx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    src.connect(actx.destination);\n    src.start(0);\n    currentSrc = src;\n  }\n\n  const f0Str = (220 / pad).toFixed(1);\n  lab.setReadout(\"延拓周期 L=\" + L + \"｜实际启用余弦波=\" + usedK + \"/\" + M + \"｜基频间隔 f0=\" + f0Str + \" Hz（补零越多，谱线越密，逼近无限连续谱）\");\n}\n\nlab.onUpdate(update);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【概念配对】非周期（Aperiodic）+ 离散（Discrete）= 离散时间傅里叶变换（DTFT），它的输入信号只在离散点存在且永不重复。",
        "【补零的数学本质】计算机里有限的 N 个样本本身不能直接做变换；只有当你在脑海中把样本左右两侧全部补成无限个 0 时，它才等价于非周期离散信号并适用 DTFT。",
        "【计算机算不出 DTFT】合成一个非周期信号需要无穷多个连续分布的正弦波，有限内存和有限算力的计算机无法直接求出 DTFT 算法解。",
        "【理论 vs. 工程】遇到公式推导、理论分析或习题时，你会和 DTFT 打交道；但只要坐到电脑前写 DSP 算法，唯一能跑通的只有假设周期重复的 DFT。"
      ]
    }
  ]
});
