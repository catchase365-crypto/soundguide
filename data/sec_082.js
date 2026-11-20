window.__BOOK_REGISTER_SECTION__("sec_082", {
  "title": "非周期-连续信号与傅里叶变换家族 (Aperiodic-Continuous)",
  "intuition": "现实中只发生一次、不重复且随时间无限衰减的连续波形（如高斯脉冲、衰减指数），对应最经典的「傅里叶变换」；但因为计算机只能存有限个离散点，工程上最终不得不把有限信号“假装成周期重复”来用 DFT 求解。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、信号的四大分类与「非周期-连续」信号",
      "paragraphs": [
        "任何信号都可以从两个正交的维度去分类：自变量是**连续（Continuous）**还是**离散（Discrete）**，以及波形是**周期（Periodic）**还是**非周期（Aperiodic）**。将这两个特征两两组合，就诞生了信号处理中最核心的四大类别。",
        "本节的主角是 **Aperiodic-Continuous（非周期-连续信号）**。它最典型的代表是**衰减指数曲线（Decaying Exponentials）**和**高斯曲线（Gaussian Curve）**。这类信号在时间轴上向**负无穷到正无穷（$-\\infty$ 到 $+\\infty$）**无限延伸，但永远不会以固定周期重复自己。",
        "专门用来分析这类「非周期-连续」信号的数学工具，在文献中不加任何前缀，直接就叫做**傅里叶变换（Fourier Transform）**。"
      ],
      "formula": {
        "expr": "x(t) = A * exp(-t^2 / σ^2)  或  x(t) = A * exp(-|t| / τ)",
        "explain": "x(t) 为连续时间信号，t 从 -∞ 延伸到 +∞；A 为峰值幅度；σ 与 τ 分别控制高斯脉冲和衰减指数在时间轴上的展宽或衰减快慢，它们都不具备周期重复性。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：非周期连续信号的时频形态与声学对比",
      "instruction": "拖动时间尺度 τ 与频率滑块，切换高斯/衰减指数包络，或对比开启“周期重复正弦波”，点击播放按钮直观听出瞬态衰减与稳态周期音的区别。",
      "controls": [
        {
          "type": "slider",
          "id": "tau",
          "label": "时间衰减尺度 τ",
          "min": 10,
          "max": 100,
          "step": 5,
          "value": 35,
          "unit": " ms"
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "载波调制频率",
          "min": 100,
          "max": 800,
          "step": 20,
          "value": 320,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "isGaussian",
          "label": "切换高斯曲线 (关闭=衰减指数)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "isPeriodic",
          "label": "对比：改为无限重复周期正弦波",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放信号听感",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet osc = null, gainNode = null, ac = null;\n\nfunction stopAudio() {\n  if (gainNode && ac) {\n    try { gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.015); } catch (e) {}\n  }\n  if (osc && ac) {\n    try { osc.stop(ac.currentTime + 0.06); } catch (e) {}\n    osc = null;\n    gainNode = null;\n  }\n}\n\nfunction ensureAudio() {\n  if (!lab.values.play) { stopAudio(); return; }\n  if (!ac) ac = lab.getAudioContext();\n  if (ac.state === 'suspended') ac.resume();\n  if (!osc) {\n    osc = ac.createOscillator();\n    gainNode = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.value = lab.values.freq;\n    gainNode.gain.value = 0;\n    osc.connect(gainNode);\n    gainNode.connect(ac.destination);\n    osc.start();\n  }\n  osc.frequency.setTargetAtTime(lab.values.freq, ac.currentTime, 0.02);\n}\n\nfunction draw() {\n  const tauMs = lab.values.tau;\n  const freq = lab.values.freq;\n  const isGauss = lab.values.isGaussian;\n  const isPer = lab.values.isPeriodic;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const tx0 = 24, tw = 330, tyMid = 128, tAmp = 68;\n  const fx0 = 385, fw = 310, fyBase = 192, fH = 122;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(tx0, tyMid); ctx.lineTo(tx0 + tw, tyMid);\n  ctx.moveTo(tx0 + tw / 2, 42); ctx.lineTo(tx0 + tw / 2, 212);\n  ctx.moveTo(fx0, fyBase); ctx.lineTo(fx0 + fw, fyBase);\n  ctx.moveTo(370, 20); ctx.lineTo(370, 222);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域 x(t)  (← -∞ 至 +∞ →)', tx0, 26);\n  ctx.fillText('频谱 |X(f)|  (' + (isPer ? '离散谱线: 傅里叶级数' : '连续谱: 傅里叶变换') + ')', fx0, 26);\n\n  const tauNorm = tauMs / 100;\n  const cycles = freq / 120;\n\n  if (!isPer) {\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n    ctx.setLineDash([4, 4]);\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i <= tw; i++) {\n      const u = (i / tw) * 2 - 1;\n      let env = 0;\n      if (isGauss) {\n        env = Math.exp(-Math.pow(u / (0.15 + 0.45 * tauNorm), 2));\n      } else {\n        env = u >= 0 ? Math.exp(-u / (0.12 + 0.55 * tauNorm)) : 0;\n      }\n      const py = tyMid - env * tAmp;\n      if (i === 0) ctx.moveTo(tx0 + i, py);\n      else ctx.lineTo(tx0 + i, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = isPer ? '#38bdf8' : '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= tw; i++) {\n    const u = (i / tw) * 2 - 1;\n    let val = 0;\n    if (isPer) {\n      val = Math.sin(u * Math.PI * 2 * (1.2 + cycles * 0.9));\n    } else if (isGauss) {\n      const env = Math.exp(-Math.pow(u / (0.15 + 0.45 * tauNorm), 2));\n      val = env * Math.cos(u * Math.PI * 2 * (1.5 + cycles * 1.1));\n    } else {\n      const env = u >= 0 ? Math.exp(-u / (0.12 + 0.55 * tauNorm)) : 0;\n      val = env * Math.cos(u * Math.PI * 2 * (1.5 + cycles * 1.1));\n    }\n    const py = tyMid - val * tAmp;\n    if (i === 0) ctx.moveTo(tx0 + i, py);\n    else ctx.lineTo(tx0 + i, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#64748b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('← -∞', tx0, tyMid + 14);\n  ctx.fillText('+∞ →', tx0 + tw - 30, tyMid + 14);\n\n  const fMax = 900;\n  const fCenterX = fx0 + (freq / fMax) * fw;\n  if (isPer) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 3;\n    ctx.beginPath();\n    ctx.moveTo(fCenterX, fyBase);\n    ctx.lineTo(fCenterX, fyBase - fH);\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(fCenterX, fyBase - fH, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.font = '11px sans-serif';\n    ctx.fillText(freq + ' Hz (单一频率)', Math.min(fCenterX + 8, fx0 + fw - 92), fyBase - fH + 4);\n  } else {\n    const bw = 28 + (1.1 - tauNorm) * 110;\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(fx0, fyBase);\n    for (let i = 0; i <= fw; i++) {\n      const f = (i / fw) * fMax;\n      const df = f - freq;\n      const mag = isGauss ? Math.exp(-Math.pow(df / (bw * 0.85), 2)) : 1 / Math.sqrt(1 + Math.pow(df / (bw * 0.5), 2));\n      ctx.lineTo(fx0 + i, fyBase - mag * fH);\n    }\n    ctx.lineTo(fx0 + fw, fyBase);\n    ctx.closePath();\n    ctx.fill();\n\n    ctx.beginPath();\n    for (let i = 0; i <= fw; i++) {\n      const f = (i / fw) * fMax;\n      const df = f - freq;\n      const mag = isGauss ? Math.exp(-Math.pow(df / (bw * 0.85), 2)) : 1 / Math.sqrt(1 + Math.pow(df / (bw * 0.5), 2));\n      const py = fyBase - mag * fH;\n      if (i === 0) ctx.moveTo(fx0 + i, py);\n      else ctx.lineTo(fx0 + i, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#64748b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0 Hz', fx0, fyBase + 16);\n  ctx.fillText('900 Hz', fx0 + fw - 36, fyBase + 16);\n\n  const modeText = isPer ? '周期-连续 (傅里叶级数)' : (isGauss ? '非周期-连续：高斯包络 (傅里叶变换)' : '非周期-连续：衰减指数 (傅里叶变换)');\n  const specText = isPer ? '仅需 1 根离散正弦波' : '需要无穷多个连续频率正弦波合成';\n  lab.setReadout('当前类型: ' + modeText + ' | 中心频率: ' + freq + ' Hz | 频谱特征: ' + specText);\n}\n\nlab.onUpdate(() => {\n  ensureAudio();\n  draw();\n});\n\nlab.onLoop((dt, t) => {\n  if (!lab.values.play || !gainNode || !ac) return;\n  const isPer = lab.values.isPeriodic;\n  const isGauss = lab.values.isGaussian;\n  const tauSec = lab.values.tau / 1000;\n  let amp = 0.14;\n  if (!isPer) {\n    const cyc = t % 1.2;\n    if (isGauss) {\n      amp = 0.22 * Math.exp(-Math.pow((cyc - 0.5) / (0.04 + tauSec * 2.2), 2));\n    } else {\n      amp = 0.22 * Math.exp(-cyc / (0.04 + tauSec * 3.5));\n    }\n  }\n  gainNode.gain.setTargetAtTime(amp, ac.currentTime, 0.015);\n});"
    },
    {
      "type": "concept",
      "heading": "二、傅里叶变换家族的命名乱象与计算机的“有限长度困境”",
      "paragraphs": [
        "除了「非周期-连续」对应**傅里叶变换（Fourier Transform）**之外，另外三种组合分别是：**周期-连续**（正弦波、方波等周期波形）对应**傅里叶级数（Fourier Series）**；**非周期-离散**对应**离散时间傅里叶变换（DTFT）**；**周期-离散**有时叫离散傅里叶级数，但最常被称为**离散傅里叶变换（DFT）**。作者 Steven W. Smith 坦承：这四个名字在过去 200 年里杂乱无章地演化而来，没有逻辑可循，**唯一能做的就是硬背下来**。",
        "更关键的问题是：**上述四类信号在数学上全都要延伸到正负无穷**。但你在电脑里采集一段音频或传感器数据，内存里往往只有有限个点（比如 1024 个采样点）。为什么没有一种“专吃有限长度信号”的傅里叶变换？答案很本质：**正弦波和余弦波的定义本身就是从 $-\\infty$ 延伸到 $+\\infty$ 的**，你不可能用一群无限长的波去拼出一个真正有限长的信号。",
        "工程师绕开这个死胡同的办法，是**脑补有限数据的左右两侧，让它看起来像无限长信号**。如果在 1024 个点左右脑补出无穷多个 `0`，它就伪装成了**非周期-离散（DTFT）**；但问题是，**合成任何非周期信号都需要无穷多个正弦波**，计算机算法根本算不完！另一种脑补方式，是把这 1024 个点**在左右两侧无限复制粘贴**，它就伪装成了周期为 1024 的**周期-离散（DFT）**。排除法之下，**DFT 是数字计算机在 DSP 中唯一能用的傅里叶变换**——前三种只出现在理论推导、作业题和数学纸笔演算中。"
      ],
      "formula": {
        "expr": null,
        "explain": "在工程实战中，对 16 点或 1024 点有限信号做 DFT 时，它在数学上等价于把这组点当成无限周期信号的一个周期（用 18 个或 N/2+1 个无限长正弦波的片段来合成）。这种“周期性”只是为了调用数学工具而做的假设，与信号真实物理来源无关。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：四象限分类图谱与计算机的“假想延拓”实验室",
      "instruction": "切换「离散化采样」与「周期化重复」浏览图 8-2 四大变换；打开「模拟计算机有限缓冲」开关，观察左右两侧黄色“假想样本”是如何填零（DTFT）或周期复制（DFT）的。",
      "controls": [
        {
          "type": "toggle",
          "id": "discrete",
          "label": "离散化采样 (连续 → 离散)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "periodic",
          "label": "周期化重复 (非周期 → 周期)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "finiteView",
          "label": "模拟计算机有限缓冲 (展示左右假想样本)",
          "value": false
        },
        {
          "type": "slider",
          "id": "nPts",
          "label": "局部样本点数",
          "min": 6,
          "max": 24,
          "step": 2,
          "value": 12,
          "unit": " 点"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\n\nfunction signalFn(u) {\n  const g1 = Math.exp(-Math.pow((u + 0.15) / 0.32, 2));\n  const g2 = 0.55 * Math.exp(-Math.pow((u - 0.35) / 0.22, 2));\n  return g1 - 0.35 * g2;\n}\n\nfunction draw() {\n  const isDisc = lab.values.discrete;\n  const isPer = lab.values.periodic;\n  const finiteView = lab.values.finiteView;\n  const nPts = lab.values.nPts;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const qx = 18, qy = 32, qw = 108, qh = 84, gap = 8;\n  const quads = [\n    { d: false, p: false, title: '非周期-连续', sub: '傅里叶变换 (FT)', ok: false },\n    { d: true,  p: false, title: '非周期-离散', sub: 'DTFT', ok: false },\n    { d: false, p: true,  title: '周期-连续',   sub: '傅里叶级数 (FS)', ok: false },\n    { d: true,  p: true,  title: '周期-离散',   sub: 'DFT (唯一可机算)', ok: true }\n  ];\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('图 8-2 傅里叶变换四象限', qx, 20);\n\n  quads.forEach((q, idx) => {\n    const col = idx % 2, row = Math.floor(idx / 2);\n    const x = qx + col * (qw + gap);\n    const y = qy + row * (qh + gap);\n    const active = (q.d === isDisc && q.p === isPer);\n\n    ctx.fillStyle = active ? (q.ok ? 'rgba(56,189,248,0.2)' : 'rgba(16,185,129,0.2)') : 'rgba(255,255,255,0.03)';\n    ctx.strokeStyle = active ? (q.ok ? '#38bdf8' : '#10b981') : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = active ? 2 : 1;\n    ctx.beginPath();\n    ctx.rect(x, y, qw, qh);\n    ctx.fill();\n    ctx.stroke();\n\n    ctx.fillStyle = active ? '#f8fafc' : '#94a3b8';\n    ctx.font = active ? 'bold 12px sans-serif' : '12px sans-serif';\n    ctx.fillText(q.title, x + 8, y + 30);\n    ctx.fillStyle = active ? (q.ok ? '#38bdf8' : '#10b981') : '#64748b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(q.sub, x + 8, y + 52);\n  });\n\n  const sx0 = 266, sw = 434, syBase = 166, sAmp = 96;\n  const periodW = sw / 3;\n  const midX0 = sx0 + periodW;\n  const midX1 = sx0 + periodW * 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(sx0, syBase); ctx.lineTo(sx0 + sw, syBase);\n  ctx.stroke();\n\n  if (finiteView) {\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.09)';\n    ctx.fillRect(midX0, 40, periodW, 162);\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';\n    ctx.setLineDash([4, 3]);\n    ctx.strokeRect(midX0, 40, periodW, 162);\n    ctx.setLineDash([]);\n\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('计算机内存实际样本 (' + nPts + ' 点)', midX0 + 4, 34);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText(isPer ? '← 假想复制品' : '← 假想填零 (0)', sx0 + 18, 34);\n    ctx.fillText(isPer ? '假想复制品 →' : '假想填零 (0) →', midX1 + 26, 34);\n  } else {\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('对应信号时域形态 (向 -∞ 与 +∞ 延伸)', sx0, 20);\n  }\n\n  function evalAtX(x) {\n    const rel = (x - midX0) / periodW;\n    if (isPer) {\n      const m = rel - Math.floor(rel);\n      return signalFn(m * 2 - 1);\n    } else {\n      const u = (rel - 0.5) * 2;\n      if (finiteView && (rel < 0 || rel > 1)) return 0;\n      return signalFn(u);\n    }\n  }\n\n  if (!isDisc) {\n    for (let seg = 0; seg < 3; seg++) {\n      const a = sx0 + seg * periodW;\n      const b = a + periodW;\n      const isGhost = finiteView && (seg !== 1);\n      ctx.strokeStyle = isGhost ? '#f59e0b' : (isPer ? '#38bdf8' : '#10b981');\n      ctx.lineWidth = isGhost ? 1.8 : 2.5;\n      ctx.beginPath();\n      for (let px = a; px <= b; px += 2) {\n        const py = syBase - evalAtX(px) * sAmp;\n        if (px === a) ctx.moveTo(px, py);\n        else ctx.lineTo(px, py);\n      }\n      ctx.stroke();\n    }\n  } else {\n    const stepPx = periodW / nPts;\n    for (let seg = 0; seg < 3; seg++) {\n      const isGhost = finiteView && (seg !== 1);\n      const col = isGhost ? '#f59e0b' : (isPer ? '#38bdf8' : '#10b981');\n      for (let k = 0; k < nPts; k++) {\n        const px = sx0 + seg * periodW + (k + 0.5) * stepPx;\n        const val = evalAtX(px);\n        const py = syBase - val * sAmp;\n        ctx.strokeStyle = col;\n        ctx.lineWidth = 1.6;\n        ctx.beginPath();\n        ctx.moveTo(px, syBase);\n        ctx.lineTo(px, py);\n        ctx.stroke();\n        ctx.fillStyle = col;\n        ctx.beginPath();\n        ctx.arc(px, py, 3, 0, Math.PI * 2);\n        ctx.fill();\n      }\n    }\n  }\n\n  ctx.fillStyle = '#64748b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('← -∞', sx0, 218);\n  ctx.fillText('+∞ →', sx0 + sw - 30, 218);\n\n  const activeQuad = quads.find(q => q.d === isDisc && q.p === isPer);\n  let tip = activeQuad.ok ? '✅ 可由计算机直接算法求解' : '❌ 无法直接机算（含无限/连续特征）';\n  if (finiteView && !isPer && isDisc) tip = '⚠️ 假想填零形成 DTFT：仍需无穷多正弦波，计算机算不出';\n  if (finiteView && isPer && isDisc) tip = '✅ 假想周期延拓形成 DFT：数字计算机唯一可算的傅里叶变换！';\n  lab.setReadout('当前分类: ' + activeQuad.title + ' → ' + activeQuad.sub + ' | ' + tip);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、实数版 vs 复数版，以及到底什么是「变换 (Transform)」",
      "paragraphs": [
        "上述四种傅里叶变换，各自还可以再细分为**实数版本（Real）**和**复数版本（Complex）**。实数版本最平易近人，只用到普通实数与基础代数即可完成分解与合成；而复数版本要动用形如 `3 + 4j`（其中 `j = √(-1)`，电子工程师习惯用 `j`，数学家习惯用 `i`）的复数，数学推导会骤然变得艰深。本书的核心目标就是**不用复数数学**讲透 DSP 的本质（想挑战复数版本的读者可直奔第 30–33 章）。",
        "最后破除一个让人望而生畏的术语：**变换（Transform）**（如傅里叶变换、拉普拉斯变换、Z 变换、离散余弦变换等）。其实它不过是中学**函数（Function）**的直接升级版。函数是把一个数（如 `y = 2x + 1`）或几个数（如 `y = 2a + 3b + 4c`）变成**单个输出值**；而**变换**只是允许输入和输出都包含**多个数值**。",
        "举个例子：你手头有 100 个采样点，如果你设计了一套固定公式或算法，把这 100 个输入点映射成另外 100 个（或 200 个）输出点——恭喜你，这就叫一个**变换**！它的输入和输出既可以是离散的，也可以是连续的，甚至可以一端离散一端连续。说白了，**变换就是把“一坨数据”按照固定规则变成“另一坨数据”的标准流程**。"
      ],
      "formula": {
        "expr": "函数: y = 2a + 3b + 4c   ==>   变换: [x_0, x_1, ..., x_99] -> [y_0, y_1, ..., y_M]",
        "explain": "函数将单个或多个输入映射为单一输出 y；而变换是函数的推广，将一整批输入信号数据（连续或离散）通过固定数学流程映射为另一批输出数据。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分四大傅里叶变换的唯一铁律：先看时间是否连续/离散，再看是否周期重复。非周期-连续信号（如高斯曲线、衰减指数）对应最经典的「傅里叶变换」，只在数学推导中出现。",
        "永远记住为什么代码里只能用 DFT：合成非周期信号需要无穷多个正弦波，电脑算不出；只有把有限采样点脑补为“周期无限重复”的离散信号（DFT），才能在计算机上完成有限步计算。",
        "不要被 DFT 隐含的“周期性”误导：哪怕你的信号在现实中是一次性的非周期脉冲，只要扔进 DFT，数学上就等于默认它首尾相接无限循环——后续很多看似反直觉的频谱现象（如循环卷积、频谱泄漏）都源于此。",
        "别被“Transform（变换）”吓到：它本质上只是一个批处理函数，输入一组数、按固定规则输出另一组数；且基础 DSP 完全可以用实数版理解，不必一上来就陷入复数泥潭。"
      ]
    }
  ]
});
