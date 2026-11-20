window.__BOOK_REGISTER_SECTION__("sec_079", {
  "title": "相关运算与匹配滤波 (Correlation & Matched Filtering)",
  "intuition": "如果说卷积是描述系统如何改造信号，那么相关就是在漫天噪声中，用模板“以形找形”精准定位已知波形的最佳雷达。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从雷达回波出发：互相关与自相关",
      "paragraphs": [
        "想象一套雷达或声纳回波定位系统：发射天线朝指定方向发出一束形状已知的短促脉冲（例如一个三角形波）。电波击中空中的直升机后，只有极微弱的一小部分能量会反射回接收机。因此，接收到的信号由两部分构成：**（1）经过时间延迟和幅度衰减的发射脉冲；（2）电子热噪声与空间干扰构成的随机噪声**。",
        "由于电磁波以已知的光速传播，发射脉冲与接收回波之间的时间偏移量，就直接对应着目标到雷达的距离。这就引出了信号处理中最核心的检测问题：**已知一个特定波形，如何最可靠地判断它在另一段含噪信号中的什么位置出现（或者是否存在）？**答案就是**相关（Correlation）**。",
        "与卷积类似，相关运算也吃进两个输入信号、吐出第三个输出信号。如果输入的是两个不同的信号（例如接收信号与目标模板），输出的结果称为**互相关（Cross-correlation）**；如果将一个信号与它自身做相关运算，输出的结果则称为**自相关（Autocorrelation）**。"
      ],
      "formula": {
        "expr": "y[n] = Σ x[n + k] · t[k]  (k = 0 .. M-1)",
        "explain": "x[n] 是含噪接收信号，t[k] 是长度为 M 的已知目标模板（Target Signal），y[n] 是互相关输出；n 越大表示目标模板在接收信号上向右滑动的偏移位置越靠后。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：相关机（Correlation Machine）逐点滑动透视",
      "instruction": "拖动“相关机滑动位置 n”观察虚线框如何沿 x[n] 移动并逐点相乘累加；尝试切换“将目标信号设为全负值”，验证为何负样本同样产生正峰值，并观察输出峰值为何左右对称且宽度翻倍。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "相关机滑动位置 n",
          "min": 0,
          "max": 68,
          "step": 1,
          "value": 20,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noiseAmp",
          "label": "背景噪声幅度",
          "min": 0,
          "max": 0.4,
          "step": 0.05,
          "value": 0.1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "negTarget",
          "label": "将目标信号设为全负值 (-t[n])",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 80, M = 12, targetPos = 42;\nfunction pseudoNoise(i) {\n  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n  return (s - Math.floor(s)) * 2 - 1;\n}\nfunction draw() {\n  const shift = Math.round(lab.values.shift);\n  const noiseAmp = lab.values.noiseAmp;\n  const sign = lab.values.negTarget ? -1 : 1;\n  const t = [];\n  for (let k = 0; k < M; k++) t.push(sign * (1 - k / M));\n  const x = [];\n  for (let n = 0; n < N; n++) {\n    let val = noiseAmp * pseudoNoise(n);\n    const k = n - targetPos;\n    if (k >= 0 && k < M) val += 0.85 * t[k];\n    x.push(val);\n  }\n  const y = [];\n  let maxVal = -1e9, maxIdx = 0;\n  for (let n = 0; n <= N - M; n++) {\n    let sum = 0;\n    for (let k = 0; k < M; k++) sum += x[n + k] * t[k];\n    y.push(sum);\n    if (sum > maxVal) { maxVal = sum; maxIdx = n; }\n  }\n  ctx.clearRect(0, 0, W, H);\n  const padL = 48, padR = 16, plotW = W - padL - padR;\n  const px = (n) => padL + (n / (N - 1)) * plotW;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let n = 0; n < N; n += 10) {\n    ctx.beginPath(); ctx.moveTo(px(n), 10); ctx.lineTo(px(n), H - 12); ctx.stroke();\n  }\n  const yX = 50, sX = 24;\n  const yT = 116, sT = 22;\n  const yY = 200, sY = 10;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  [yX, yT, yY].forEach(yy => {\n    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();\n  });\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('x[n]', 8, yX + 4);\n  ctx.fillText('t[n]', 8, yT + 4);\n  ctx.fillText('y[n]', 8, yY + 4);\n  const boxX1 = px(shift) - 5, boxX2 = px(shift + M - 1) + 5;\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n  ctx.fillRect(boxX1, 14, boxX2 - boxX1, 132);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.setLineDash([4, 3]);\n  ctx.strokeRect(boxX1, 82, boxX2 - boxX1, 64);\n  ctx.beginPath();\n  ctx.moveTo(px(shift), 146);\n  ctx.lineTo(px(shift), yY - y[shift] * sY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  for (let k = 0; k < M; k++) {\n    const gx = px(shift + k);\n    const prod = x[shift + k] * t[k];\n    ctx.strokeStyle = prod >= 0 ? 'rgba(16,185,129,0.5)' : 'rgba(236,72,153,0.5)';\n    ctx.beginPath();\n    ctx.moveTo(gx, yX - x[shift + k] * sX);\n    ctx.lineTo(gx, yT - t[k] * sT);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xx = px(n), yy = yX - x[n] * sX;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  for (let n = 0; n < N; n++) {\n    ctx.fillStyle = (n >= shift && n < shift + M) ? '#f59e0b' : '#38bdf8';\n    ctx.beginPath(); ctx.arc(px(n), yX - x[n] * sX, 2, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let k = 0; k < M; k++) {\n    const xx = px(shift + k), yy = yT - t[k] * sT;\n    if (k === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  for (let k = 0; k < M; k++) {\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(px(shift + k), yT - t[k] * sT, 2.2, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < y.length; n++) {\n    const xx = px(n), yy = yY - y[n] * sY;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  const curY = yY - y[shift] * sY;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(px(shift), curY, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('y[' + shift + ']=' + y[shift].toFixed(2), Math.min(W - 85, px(shift) + 8), Math.max(162, curY - 6));\n  lab.setReadout('滑动位置 n=' + shift + ' | 乘积累加 y[' + shift + ']=' + y[shift].toFixed(2) + ' | 目标真实起点 n=42 | 全局峰值 y[' + maxIdx + ']=' + maxVal.toFixed(2));\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "相关机如何工作：负采样、对称峰值与“只检测不复现”",
      "paragraphs": [
        "我们可以用一个**相关机（Correlation Machine）**来直观理解计算过程：接收信号 `x[n]` 和输出信号 `y[n]` 固定在纸面上，内部装有目标模板 `t[n]` 的虚线框沿着水平方向左右滑动。当虚线框对准 `y[n]` 的某一个输出样点时，落入框内的 `x[n]` 采样点与模板 `t[n]` 对应位置的元素逐一相乘并求和，结果就填入该处的 `y[n]` 中。`y[n]` 的幅度直接衡量了**接收信号在该局部与目标模板有多“像”**——每当模板与回波严丝合缝对齐时，就会产生一个鲜明峰值。",
        "**如果目标信号里包含负值，甚至整个目标全为负值怎么办？**什么都不会改变！假设 `t[n]` 与接收信号中的匹配波形完全对齐（忽略噪声）：正值样点乘以自身得正数，负值样点乘以自身（负负得正）同样得到正数。因此，即便目标波形完全在零轴下方，互相关输出的峰值依然是一个向上的正峰。",
        "**关于噪声与峰值形状有两个极易忽略的性质**：第一，随机噪声在局部上不可避免地会和任何模板有几分相似，因此输入信号中的噪声一定会“漏”进输出信号 `y[n]` 中；第二，除开噪声影响，**互相关产生的峰值永远是左右对称的**——哪怕你的目标波形本身高度不对称（如直角三角形）也是如此，而且**峰值的总宽度是目标波形宽度的两倍**。切记，相关运算的任务是**检测**目标信号在哪里，而不是**复现**目标的原始形状。"
      ],
      "formula": {
        "expr": null,
        "explain": "相关峰值的本质是波形相似度的自内积展开：左移与右移错开相同步数时重叠能量相等，因此必然左右对称且宽度加倍。"
      }
    },
    {
      "type": "concept",
      "heading": "最佳线性检测器（匹配滤波）与卷积的微妙转换",
      "paragraphs": [
        "在随机白噪声背景下检测一个已知形状的波形，相关运算在数学上是**最优（Optimal）**的线性技术——没有任何其他线性系统能比它把脉冲峰值从噪声基底中拔得更高。在工程上，利用相关运算来检测已知波形的做法常被称为**匹配滤波（Matched Filtering）**。",
        "对比上一章的“卷积机”与本章的“相关机”，两者的硬件结构几乎一模一样，**唯一的差别在于模板是否左右翻转**：在卷积机中，内部冲激响应的样点 `1, 2, 3...` 是从右向左倒序排列的；而在相关机中，模板样点不发生翻转，保持正常的从左向右顺序。",
        "既然只差一个左右翻转，我们完全可以用卷积代码来算相关——只需事先把其中一个信号**预先翻转（Preflipping）**，就能抵消卷积自带的那一次翻转，即通过反转下标符号 `b[-n]` 来实现。但千万不要被这种数学上的巧合迷惑：**卷积刻画的是线性系统的输入、输出与冲激响应之间的物理因果关系；而相关则是在强噪声背景下搜寻已知波形的检测工具**，两者解决的工程问题截然不同。"
      ],
      "formula": {
        "expr": "Corr(a[n], b[n]) = a[n] * b[-n]",
        "explain": "星号 * 表示卷积运算；对 b[n] 取负下标 b[-n] 实现左右预翻转，从而抵消卷积内置翻转，等价完成 a[n] 与 b[n] 的互相关。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：强噪声下的匹配滤波（含声纳听觉对比）",
      "instruction": "调高“白噪声强度”直到蓝色时域波形完全淹没回波，点击“试听含噪回波声纳”感受人耳几乎听不见脉冲的困境，再观察绿色相关曲线如何稳准狠地揪出回波延迟；可开启“错误对比”查看直接用卷积而不预反转导致的峰值塌陷与位置偏移。",
      "controls": [
        {
          "type": "slider",
          "id": "noiseLevel",
          "label": "白噪声强度",
          "min": 0,
          "max": 2.5,
          "step": 0.1,
          "value": 1.2,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "echoDelay",
          "label": "回波延迟位置",
          "min": 15,
          "max": 120,
          "step": 1,
          "value": 70,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "useConv",
          "label": "错误对比：用卷积代替相关（未反转模板）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听含噪回波声纳",
          "activeLabel": "⏸ 暂停声纳"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 160, M = 18;\nlet audioSrc = null, masterGain = null, lastAudioKey = '';\nfunction pseudoNoise(i) {\n  const s = Math.sin(i * 91.345 + 17.13) * 29431.719;\n  return (s - Math.floor(s)) * 2 - 1;\n}\nfunction stopAudio() {\n  if (audioSrc) {\n    try { audioSrc.stop(); } catch (e) {}\n    try { audioSrc.disconnect(); } catch (e) {}\n    audioSrc = null;\n  }\n}\nfunction syncAudio(noiseLevel, echoDelay) {\n  if (!lab.values.play) { stopAudio(); lastAudioKey = ''; return; }\n  const key = noiseLevel.toFixed(2) + '_' + echoDelay;\n  if (key === lastAudioKey && audioSrc) return;\n  lastAudioKey = key;\n  stopAudio();\n  const actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n  const sr = actx.sampleRate;\n  const dur = 0.9;\n  const len = Math.floor(sr * dur);\n  const buf = actx.createBuffer(1, len, sr);\n  const data = buf.getChannelData(0);\n  const pulseStart = Math.floor(((echoDelay - 15) / 105) * 0.55 * sr + 0.08 * sr);\n  const pulseLen = Math.floor(0.035 * sr);\n  for (let i = 0; i < len; i++) {\n    let v = 0.12 * noiseLevel * (Math.random() * 2 - 1);\n    const k = i - pulseStart;\n    if (k >= 0 && k < pulseLen) {\n      const env = 1 - k / pulseLen;\n      v += 0.35 * env * Math.sin(2 * Math.PI * 880 * (k / sr));\n    }\n    data[i] = Math.max(-0.9, Math.min(0.9, v));\n  }\n  if (!masterGain) {\n    masterGain = actx.createGain();\n    masterGain.gain.value = 0.35;\n    masterGain.connect(actx.destination);\n  }\n  const src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(masterGain);\n  src.start();\n  audioSrc = src;\n}\nfunction draw() {\n  const noiseLevel = lab.values.noiseLevel;\n  const delay = Math.round(lab.values.echoDelay);\n  const useConv = lab.values.useConv;\n  syncAudio(noiseLevel, delay);\n  const t = [];\n  for (let k = 0; k < M; k++) t.push(1 - k / M);\n  const clean = [], x = [];\n  for (let n = 0; n < N; n++) {\n    const k = n - delay;\n    const c = (k >= 0 && k < M) ? 0.65 * t[k] : 0;\n    clean.push(c);\n    x.push(c + noiseLevel * 0.45 * pseudoNoise(n));\n  }\n  const y = [];\n  let maxVal = -1e9, maxIdx = 0, sumSq = 0;\n  for (let n = 0; n <= N - M; n++) {\n    let s = 0;\n    for (let k = 0; k < M; k++) {\n      const tk = useConv ? t[M - 1 - k] : t[k];\n      s += x[n + k] * tk;\n    }\n    y.push(s);\n    sumSq += s * s;\n    if (s > maxVal) { maxVal = s; maxIdx = n; }\n  }\n  const rms = Math.sqrt(sumSq / y.length) || 1;\n  const ratio = maxVal / rms;\n  ctx.clearRect(0, 0, W, H);\n  const padL = 62, padR = 16, plotW = W - padL - padR;\n  const px = (n) => padL + (n / (N - 1)) * plotW;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let n = 0; n < N; n += 20) {\n    ctx.beginPath(); ctx.moveTo(px(n), 10); ctx.lineTo(px(n), H - 12); ctx.stroke();\n  }\n  const y1 = 62, s1 = 28;\n  const y2 = 192, s2 = 9.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  [y1, y2].forEach(yy => {\n    ctx.beginPath(); ctx.moveTo(padL, yy); ctx.lineTo(W - padR, yy); ctx.stroke();\n  });\n  ctx.fillStyle = 'rgba(248,250,252,0.8)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('接收 x[n]', 6, y1 + 4);\n  ctx.fillText(useConv ? '错误卷积' : '相关 y[n]', 6, y2 + 4);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.65)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xx = px(n), yy = y1 - clean[n] * s1;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const xx = px(n), yy = y1 - x[n] * s1;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  ctx.strokeStyle = useConv ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < y.length; n++) {\n    const xx = px(n), yy = y2 - y[n] * s2;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  const peakY = y2 - maxVal * s2;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(px(delay), 14); ctx.lineTo(px(delay), y2); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(px(maxIdx), peakY, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('检测峰 n=' + maxIdx + ' (真实=' + delay + ')', Math.min(W - 145, px(maxIdx) + 8), Math.max(132, peakY - 6));\n  lab.setReadout((useConv ? '[错误卷积模式] ' : '[匹配滤波相关模式] ') + '真实回波 n=' + delay + ' | 检测峰值 n=' + maxIdx + ' | 峰值=' + maxVal.toFixed(2) + ' | 峰值/RMS=' + ratio.toFixed(2) + 'x');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【代码复用避坑】：用现成卷积函数计算相关时，必须将模板序列左右预翻转（b[-n]）；若忘记翻转直接拿非对称波形做卷积，不仅峰值高度会大幅缩水，测得的延迟位置还会发生系统性偏差。",
        "【峰值形态误区】：不要指望在互相关输出里看到目标波形的“原貌”——相关峰永远是左右对称且宽度翻倍的包络，它的唯一使命是在强白噪声中最大化信噪比以精准报出目标坐标。",
        "【负值与物理意义】：目标模板全为负值时相关峰依然为正（负负得正）；更重要的是分清物理概念——卷积管系统响应，相关管波形检测。"
      ]
    }
  ]
});
