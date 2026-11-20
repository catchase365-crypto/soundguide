window.__BOOK_REGISTER_SECTION__("sec_081", {
  "title": "傅里叶变换家族与正弦分解直觉 (The Family of Fourier Transform)",
  "intuition": "任何复杂信号都可以拆成一群频率固定、振幅各异的正弦与余弦波之和；而在计算机里，为了让有限长度的数字样本能被精确算出来，唯一能落地的成员就是离散傅里叶变换（DFT）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一场持续 15 年的学术公案：方波的尖角与吉布斯效应",
      "paragraphs": [
        "1807 年，法国数学家兼物理学家 **约瑟夫·傅里叶 (Jean Baptiste Joseph Fourier)** 向法兰西学院提交了一篇关于热传导的论文，提出了一个震惊当时数学界的大胆论断：**任何连续的周期信号，都可以表示为一组经过恰当挑选的正弦波之和**。",
        "论文审稿人里有两位数学泰斗：拉普拉斯 (Laplace) 和其他审稿人赞成发表，但 **拉格朗日 (Lagrange)** 却坚决反对。拉格朗日坚持认为，光滑圆润的正弦波无论怎么叠加，都绝不可能拼出方波那种带有**尖角（不连续斜率）**的波形。由于拉格朗日声望极高，这篇论文被压了整整 15 年，直到拉格朗日去世后才得以发表。",
        "后世证明这是一场“平局”：对于**连续信号**，拉格朗日是对的——有限个甚至无穷多个光滑正弦波叠加，在跳变处总会出现微小的过冲（即第 11 章将详述的 **吉布斯效应 Gibbs Effect**），无法形成绝对直角；但傅里叶在物理意义上也是对的——两者之差的**能量为零**。更关键的是，拉格朗日的质疑**只适用于连续信号**；一旦进入**离散数字信号**的世界，傅里叶分解是**数学上绝对精确**的，原信号与正弦波之和之间没有任何误差，就像 `7` 和 `3 + 4` 没有任何区别一样。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "实验一：重现拉格朗日与傅里叶之争（方波合成与听觉对比）",
      "instruction": "拖动「叠加奇次谐波数」滑块观察波形如何从正弦逼近方波，并点击播放按钮对比音色变化；开启「叠加离散采样点」观察连续过冲与离散采样的区别。",
      "controls": [
        {
          "type": "slider",
          "id": "harmonics",
          "label": "叠加奇次谐波数",
          "min": 1,
          "max": 15,
          "step": 1,
          "value": 1,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "基波声音频率",
          "min": 110,
          "max": 440,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "showSamples",
          "label": "显示 16 点离散采样对比",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放当前合成音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet audioCtx = null;\nlet osc = null;\nlet gainNode = null;\n\nfunction syncAudio() {\n  const play = !!lab.values.play;\n  const count = Math.round(lab.values.harmonics);\n  const f = lab.values.freq;\n  if (play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      gainNode.gain.value = 0.12;\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n    const real = new Float32Array(32);\n    const imag = new Float32Array(32);\n    for (let j = 0; j < count; j++) {\n      const k = 2 * j + 1;\n      if (k < 32) imag[k] = 4 / (Math.PI * k);\n    }\n    const wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });\n    osc.setPeriodicWave(wave);\n    osc.frequency.setTargetAtTime(f, audioCtx.currentTime, 0.02);\n  } else if (osc) {\n    try { osc.stop(); osc.disconnect(); } catch (e) {}\n    try { gainNode.disconnect(); } catch (e) {}\n    osc = null;\n    gainNode = null;\n  }\n}\n\nfunction render() {\n  const count = Math.round(lab.values.harmonics);\n  const showSamples = !!lab.values.showSamples;\n  const maxHarmonicOrder = 2 * count - 1;\n\n  ctx.clearRect(0, 0, W, H);\n  const padX = 36;\n  const plotW = W - padX * 2;\n  const midY = H / 2;\n  const ampY = H * 0.34;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [-1, -0.5, 0, 0.5, 1].forEach(lvl => {\n    const y = midY - lvl * ampY;\n    ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke();\n  });\n  for (let i = 0; i <= 8; i++) {\n    const x = padX + (plotW * i) / 8;\n    ctx.beginPath(); ctx.moveTo(x, 16); ctx.lineTo(x, H - 16); ctx.stroke();\n  }\n\n  ctx.save();\n  ctx.setLineDash([6, 5]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px++) {\n    const phase = (px / plotW) * 2;\n    const sq = Math.sin(2 * Math.PI * phase) >= 0 ? 1 : -1;\n    const x = padX + px;\n    const y = midY - sq * ampY;\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  let maxVal = 0;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px++) {\n    const phase = (px / plotW) * 2;\n    let sum = 0;\n    for (let j = 0; j < count; j++) {\n      const k = 2 * j + 1;\n      sum += (4 / (Math.PI * k)) * Math.sin(2 * Math.PI * k * phase);\n    }\n    if (Math.abs(sum) > maxVal) maxVal = Math.abs(sum);\n    const x = padX + px;\n    const y = midY - sum * ampY;\n    if (px === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  if (showSamples) {\n    const totalPts = 32;\n    for (let n = 0; n < totalPts; n++) {\n      const phase = n / 16;\n      let sum = 0;\n      for (let j = 0; j < count; j++) {\n        const k = 2 * j + 1;\n        sum += (4 / (Math.PI * k)) * Math.sin(2 * Math.PI * k * phase);\n      }\n      const x = padX + (n / totalPts) * plotW;\n      const y = midY - sum * ampY;\n      ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath(); ctx.moveTo(x, midY); ctx.lineTo(x, y); ctx.stroke();\n      ctx.fillStyle = '#38bdf8';\n      ctx.beginPath(); ctx.arc(x, y, 3.6, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('目标理想方波 (虚线) vs 傅里叶合成波 (绿线)', padX, 20);\n  const overshoot = Math.max(0, (maxVal - 1) * 100);\n  lab.setReadout('谐波个数: ' + count + ' (最高含 ' + maxHarmonicOrder + ' 次谐波) | 峰值振幅: ' + maxVal.toFixed(3) + ' | 吉布斯过冲: +' + overshoot.toFixed(1) + '% | 基频: ' + lab.values.freq + ' Hz');\n}\n\nlab.onUpdate(() => {\n  render();\n  syncAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "为什么非用正弦波和余弦波不可？正弦保真度",
      "paragraphs": [
        "从理论上讲，把一个信号拆解成其他波形的组合有**无穷多种方法**——你甚至可以用方波或三角波去拼凑原信号。但分解的唯一目的是：**得到比原信号更容易处理的组件**。例如在第 6 章学过的**脉冲分解 (Impulse Decomposition)**，让我们能逐点考察信号，进而引出强大的**卷积**。",
        "正弦波与余弦波之所以能成为信号处理的绝对主角，是因为它们拥有其他任何波形都不具备的独门绝技——**正弦保真度 (Sinusoidal Fidelity)**：只要把一个正弦波输入线性系统，输出**必定**还是一个同频率的正弦波，绝不会变形成方波或三角波；唯一可能改变的只有它的**振幅**和**相位**。方波或三角波分解虽然数学上可行，但经过系统后会面目全非，没有工程通用价值。",
        "原书图 8-1 展示了一个具体例子：一个长度为 **16 点**（编号 `0` 到 `15`）的离散信号，经过 **实数 DFT (Real DFT)** 分解后，会精确地变成 **9 个余弦波** 和 **9 个正弦波**（共 18 个正弦型分量）。每个分量的**频率都是预先锁死的**，变的只是各自的振幅。把这 18 个波逐点相加，就能一毫不差地还原出原始的 16 点信号。"
      ],
      "formula": {
        "expr": "x[n] = Σ (a_k · cos(2πkn/N) + b_k · sin(2πkn/N))",
        "explain": "x[n] 是第 n 个离散采样点（n = 0..15）；N 为信号长度（16）；a_k 和 b_k 分别是第 k 组余弦波与正弦波的振幅（k = 0..8，共 9 组频率，其中 k=0 与 k=N/2 的正弦波振幅恒为 0）。"
      }
    },
    {
      "type": "concept",
      "heading": "傅里叶变换四大家族，以及计算机为何只认 DFT",
      "paragraphs": [
        "信号在时间轴上有两种属性：**连续 (Continuous)** 或 **离散 (Discrete)**；在形态上也有两种属性：**周期 (Periodic)** 或 **非周期 (Aperiodic)**。两者两两组合，就诞生了傅里叶变换的四大成员（注意：这些名字是两百年来杂乱演变出来的，死记即可）：",
        "1. **非周期-连续**：如高斯曲线、指数衰减信号，称为 **傅里叶变换 (Fourier Transform)**。\n2. **周期-连续**：如无限长的正弦波、方波，称为 **傅里叶级数 (Fourier Series)**。\n3. **非周期-离散**：只在离散点定义但不重复，称为 **离散时间傅里叶变换 (DTFT)**。\n4. **周期-离散**：离散点以固定周期从负无穷重复到正无穷，称为 **离散傅里叶变换 (DFT)**（有时也叫离散傅里叶级数）。",
        "问题来了：上面这四类信号**全部都是从负无穷延伸到正无穷的**！而我们的计算机内存里只存着**有限长度**的数据（比如 1024 个或 16 个样本）。既然正弦波和余弦波的定义域本身就是无限长的，计算机该如何绕过这个矛盾？",
        "唯一的办法是**把有限数据“脑补”成无限长信号**，这有两种脑补方式：\n- **补零脑补**：假设这 16 个点左右两边全是无穷多个 `0`。此时信号看起来是“离散+非周期”的，对应 **DTFT**。但事实证明，**非周期信号需要无穷多个正弦波才能合成**，计算机根本算不完！\n- **周期重复脑补**：假设左右两边是这 16 个点不断复制粘贴、首尾相接的无限循环。此时信号看起来是“离散+周期”的，只需**有限个正弦波**即可精确表示——这正是计算机唯一能算出结果的 **DFT**！"
      ],
      "formula": {
        "expr": "有限样本 N 点 ──(左右复制循环)──▶ 周期离散信号 ──▶ 实数 DFT (有限步可算)",
        "explain": "由于计算机无法处理无穷多个频率分量（DTFT），工程上只能将有限长离散信号视为周期重复信号，从而使用有限次加减乘除就能精确求解的离散傅里叶变换（DFT）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：16 点实数 DFT 精确还原与「无限脑补」透视镜",
      "instruction": "拖动「参与合成的频率组数 K」观察 16 点信号（原书图 8-1）如何从 1 个直流分量逐步精确重构；切换「计算机延拓视角」对比 DFT 周期循环与 DTFT 补零延拓的本质差异。",
      "controls": [
        {
          "type": "slider",
          "id": "kLimit",
          "label": "参与合成的频率组数 K (0~8)",
          "min": 0,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " 组"
        },
        {
          "type": "toggle",
          "id": "periodicView",
          "label": "显示 DFT 周期延拓 (关闭=DTFT 补零)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showLatest",
          "label": "高亮当前新增的第 K 组正余弦波",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst N = 16;\nconst sig = [0, 0, 0, 48, -18, -8, -4, -2, 0, 0, 0, 0, 0, 0, 0, 0];\nconst c = new Array(9).fill(0);\nconst s = new Array(9).fill(0);\n\nfor (let k = 0; k <= 8; k++) {\n  let sumC = 0, sumS = 0;\n  for (let n = 0; n < N; n++) {\n    const ang = (2 * Math.PI * k * n) / N;\n    sumC += sig[n] * Math.cos(ang);\n    sumS += sig[n] * Math.sin(ang);\n  }\n  const scale = (k === 0 || k === 8) ? (1 / N) : (2 / N);\n  c[k] = scale * sumC;\n  s[k] = (k === 0 || k === 8) ? 0 : scale * sumS;\n}\n\nfunction evalWave(t, kMax) {\n  let val = 0;\n  for (let k = 0; k <= kMax; k++) {\n    const ang = (2 * Math.PI * k * t) / N;\n    val += c[k] * Math.cos(ang) + s[k] * Math.sin(ang);\n  }\n  return val;\n}\n\nfunction evalSingleK(t, k) {\n  const ang = (2 * Math.PI * k * t) / N;\n  return c[k] * Math.cos(ang) + s[k] * Math.sin(ang);\n}\n\nfunction render() {\n  const kLimit = Math.round(lab.values.kLimit);\n  const periodicView = !!lab.values.periodicView;\n  const showLatest = !!lab.values.showLatest;\n\n  ctx.clearRect(0, 0, W, H);\n  const padX = 32;\n  const plotW = W - padX * 2;\n  const nMin = -8;\n  const nMax = 23;\n  const span = nMax - nMin;\n  const zeroY = H * 0.62;\n  const scaleY = (H * 0.48) / 52;\n\n  const toX = (n) => padX + ((n - nMin) / span) * plotW;\n  const toY = (v) => zeroY - v * scaleY;\n\n  const winL = toX(-0.5);\n  const winR = toX(15.5);\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.07)';\n  ctx.fillRect(winL, 14, winR - winL, H - 28);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [-20, 0, 20, 40].forEach(v => {\n    const y = toY(v);\n    ctx.beginPath(); ctx.moveTo(padX, y); ctx.lineTo(W - padX, y); ctx.stroke();\n  });\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.beginPath();\n  ctx.moveTo(winL, 14); ctx.lineTo(winL, H - 14);\n  ctx.moveTo(winR, 14); ctx.lineTo(winR, H - 14);\n  ctx.stroke();\n  ctx.restore();\n\n  if (showLatest) {\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let px = 0; px <= plotW; px++) {\n      const t = nMin + (px / plotW) * span;\n      const y = toY(evalSingleK(t, kLimit));\n      if (px === 0) ctx.moveTo(padX + px, y); else ctx.lineTo(padX + px, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= plotW; px++) {\n    const t = nMin + (px / plotW) * span;\n    const y = toY(evalWave(t, kLimit));\n    if (px === 0) ctx.moveTo(padX + px, y); else ctx.lineTo(padX + px, y);\n  }\n  ctx.stroke();\n\n  for (let n = nMin; n <= nMax; n++) {\n    const inWindow = (n >= 0 && n < N);\n    const idx = ((n % N) + N) % N;\n    const targetVal = inWindow ? sig[n] : (periodicView ? sig[idx] : 0);\n    const x = toX(n);\n    const y = toY(targetVal);\n\n    ctx.strokeStyle = inWindow ? 'rgba(248, 250, 252, 0.4)' : (periodicView ? 'rgba(245, 158, 11, 0.25)' : 'rgba(236, 72, 153, 0.25)');\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(x, zeroY); ctx.lineTo(x, y); ctx.stroke();\n\n    ctx.fillStyle = inWindow ? '#f59e0b' : (periodicView ? 'rgba(245, 158, 11, 0.45)' : 'rgba(236, 72, 153, 0.5)');\n    ctx.fillRect(x - 3, y - 3, 6, 6);\n  }\n\n  let maxErr = 0;\n  for (let n = 0; n < N; n++) {\n    const err = Math.abs(sig[n] - evalWave(n, kLimit));\n    if (err > maxErr) maxErr = err;\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('真实 16 点存储窗口 [0..15] (亮框内)', winL + 6, 26);\n  ctx.fillStyle = periodicView ? '#f59e0b' : '#ec4899';\n  ctx.fillText(periodicView ? '← DFT 周期脑补' : '← DTFT 补零脑补', padX, 26);\n\n  const numSinusoids = (kLimit === 0) ? 1 : (kLimit === 8 ? 16 : (1 + kLimit * 2));\n  lab.setReadout('频率组: 0..' + kLimit + ' (实数基波数: ' + (kLimit + 1) + ' 余弦 + ' + (kLimit + 1) + ' 正弦) | 窗内最大重构误差: ' + maxErr.toFixed(4) + (maxErr < 1e-6 ? ' (离散信号绝对精确还原!)' : ''));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【连续 vs 离散别混淆】：连续方波叠加永远有吉布斯过冲，但计算机处理的离散数字信号只要凑齐 N/2 + 1 组正余弦（共 N 个有效自由度），还原误差严格为 0。",
        "【记住“正弦保真度”】：只有正弦/余弦波通过线性系统后频率和波形绝不畸变，这就是为什么全世界的滤波器、频谱仪和通信系统都围绕正弦波打转。",
        "【警惕 DFT 的隐含假设】：当你把一段有限长度（比如 1024 点）的数组丢进 DFT 算法时，数学上已经默认它首尾相接、无限周期循环了——如果不注意边界跳变，后续就会遇到频谱泄漏问题。",
        "【实数 DFT 与复数 DFT】：工程入门先掌握输入输出全为实数的 Real DFT（N 点信号分解为 N/2+1 个余弦与 N/2+1 个正弦振幅），它和第 31 章基于复数的 Complex DFT 在数学信息量上是完全等价的。"
      ]
    }
  ]
});
