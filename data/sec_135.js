window.__BOOK_REGISTER_SECTION__("sec_135", {
  "title": "降噪与阶跃响应的权衡：移动平均的最优性 (Noise Reduction vs. Step Response)",
  "intuition": "别再因为算法太简单而感到“内疚”——在压制随机白噪声的同时尽可能保留陡峭信号边沿（阶跃响应）这件事上，没有任何线性滤波器能比移动平均更强。",
  "blocks": [
    {
      "type": "concept",
      "heading": "工程师的“内疚感”与最优降噪定律",
      "paragraphs": [
        "许多科学家和工程师在使用**移动平均滤波器（Moving Average Filter）**时，心里总会隐隐产生一种“愧疚感”。因为它实现起来实在太简单了，常常是遇到信号平滑问题时随手试的第一个方法；即便问题已经彻底解决，人们仍总觉得“是不是该上点更高级、更复杂的算法”。",
        "但事实上，这种想法极具戏剧性地弄反了真相：移动平均滤波器不仅对大量工程场景都非常有效，而且在**“压制随机白噪声，同时保持最锐利阶跃响应（Step Response）”**这一核心问题上，它本身就是**数学意义上的严格最优解**。",
        "观察原书图 15-1 的典型案例：一个隐藏在随机白噪声中的矩形脉冲，经过 11 点和 51 点移动平均滤波后，噪声幅度明显降低（好事），但脉冲的上升与下降沿也随之变缓、变圆润（坏事）。移动平均窗口点数 `M` 越大，信号越平滑，但边沿越模糊。其降噪倍率严格服从**平方根定律**：平均的点数增加到 `M` 点，随机白噪声的幅度就会降低为原来的 `1 / √M`。例如，一个 100 点移动平均滤波器可以把白噪声降低整整 10 倍。"
      ],
      "formula": {
        "expr": "Noise Reduction = √M",
        "explain": "M 为移动平均滤波器的窗口点数（滤波器核长度）。每增加一倍点数，噪声仅下降 √2 ≈ 1.414 倍，而阶跃响应的过渡边沿宽度则会线性拉宽到 M 个采样点。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：矩形脉冲滤波与听觉降噪对比（复现图 15-1）",
      "instruction": "拖动「滤波器点数 M」滑块观察降噪幅度与矩形脉冲边沿锐度的权衡；点击「播放对比音」可实时聆听白噪声嘶嘶声消失、同时脉冲高频泛音变闷的听觉变化。",
      "controls": [
        {
          "type": "slider",
          "id": "points",
          "label": "滤波器点数 M",
          "min": 1,
          "max": 101,
          "step": 2,
          "value": 11,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "输入白噪声强度",
          "min": 0.05,
          "max": 0.8,
          "step": 0.05,
          "value": 0.35,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showRaw",
          "label": "显示原始含噪信号",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波实时音频",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height, ctx = lab.ctx;\nlet audioSrc = null, gainNode = null;\nfunction mulberry32(a) {\n  return function() {\n    let t = a += 0x6D2B79F5;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction genSignal(noiseAmp) {\n  const N = 500, x = new Float32Array(N);\n  const rand = mulberry32(151515);\n  for (let i = 0; i < N; i++) {\n    let g = 0;\n    for (let k = 0; k < 6; k++) g += rand();\n    g = (g - 3) * 1.4142;\n    const pulse = (i >= 200 && i <= 300) ? 1.0 : 0.0;\n    x[i] = pulse + noiseAmp * g;\n  }\n  return x;\n}\nfunction filterMA(x, M) {\n  const N = x.length, y = new Float32Array(N);\n  const half = (M - 1) >> 1;\n  for (let i = 0; i < N; i++) {\n    let sum = 0;\n    for (let j = -half; j <= half; j++) {\n      const idx = i + j;\n      if (idx >= 0 && idx < N) sum += x[idx];\n    }\n    y[i] = sum / M;\n  }\n  return y;\n}\nfunction calcRms(arr) {\n  let s = 0, c = 0;\n  for (let i = 0; i < 150; i++) { s += arr[i] * arr[i]; c++; }\n  for (let i = 350; i < 500; i++) { s += arr[i] * arr[i]; c++; }\n  return Math.sqrt(s / c);\n}\nfunction updateAudio(M, noiseAmp, play) {\n  if (!play) {\n    if (audioSrc) { try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {} audioSrc = null; }\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!gainNode) {\n    gainNode = ac.createGain();\n    gainNode.gain.value = 0.18;\n    gainNode.connect(ac.destination);\n  }\n  if (audioSrc) { try { audioSrc.stop(); audioSrc.disconnect(); } catch (e) {} audioSrc = null; }\n  const sr = ac.sampleRate;\n  const len = Math.floor(sr * 2.0);\n  const raw = new Float32Array(len);\n  const rand = mulberry32(98765);\n  const period = sr / 110;\n  for (let i = 0; i < len; i++) {\n    const phase = (i % period) / period;\n    const pulse = phase < 0.25 ? 0.6 : -0.2;\n    const n = (rand() * 2 - 1) * noiseAmp * 0.9;\n    raw[i] = pulse + n;\n  }\n  const buf = ac.createBuffer(1, len, sr);\n  const ch = buf.getChannelData(0);\n  const half = (M - 1) >> 1;\n  let winSum = 0;\n  for (let j = -half; j <= half; j++) winSum += raw[(j + len) % len];\n  for (let i = 0; i < len; i++) {\n    ch[i] = winSum / M;\n    const outIdx = (i - half + len) % len;\n    const inIdx = (i + half + 1) % len;\n    winSum += raw[inIdx] - raw[outIdx];\n  }\n  audioSrc = ac.createBufferSource();\n  audioSrc.buffer = buf;\n  audioSrc.loop = true;\n  audioSrc.connect(gainNode);\n  audioSrc.start();\n}\nfunction draw() {\n  const M = Math.round(lab.values.points) | 1;\n  const noiseAmp = lab.values.noise;\n  const showRaw = lab.values.showRaw;\n  const x = genSignal(noiseAmp);\n  const y = filterMA(x, M);\n  ctx.clearRect(0, 0, W, H);\n  const pL = 44, pR = 18, pT = 22, pB = 26;\n  const pW = W - pL - pR, pH = H - pT - pB;\n  const toX = i => pL + (i / 499) * pW;\n  const toY = v => pT + ((2.0 - v) / 3.0) * pH;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  for (let v = -1; v <= 2; v++) {\n    const py = toY(v);\n    ctx.beginPath(); ctx.moveTo(pL, py); ctx.lineTo(W - pR, py); ctx.stroke();\n    ctx.fillText(v.toFixed(0), 14, py + 4);\n  }\n  for (let i = 0; i <= 500; i += 100) {\n    const px = toX(i === 500 ? 499 : i);\n    ctx.beginPath(); ctx.moveTo(px, pT); ctx.lineTo(px, H - pB); ctx.stroke();\n    ctx.fillText(String(i), px - 10, H - 8);\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.22)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(toX(0), toY(0));\n  ctx.lineTo(toX(200), toY(0));\n  ctx.lineTo(toX(200), toY(1));\n  ctx.lineTo(toX(300), toY(1));\n  ctx.lineTo(toX(300), toY(0));\n  ctx.lineTo(toX(499), toY(0));\n  ctx.stroke();\n  ctx.setLineDash([]);\n  if (showRaw) {\n    ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n    ctx.lineWidth = 1;\n    ctx.beginPath();\n    for (let i = 0; i < 500; i++) {\n      const px = toX(i), py = toY(Math.max(-1.1, Math.min(2.1, x[i])));\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < 500; i++) {\n    const px = toX(i), py = toY(Math.max(-1.1, Math.min(2.1, y[i])));\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('绿线: ' + M + '点移动平均输出', pL + 8, pT + 14);\n  if (showRaw) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('蓝线: 原始含噪信号', pL + 185, pT + 14);\n  }\n  const rmsIn = calcRms(x), rmsOut = calcRms(y);\n  const theoFactor = Math.sqrt(M);\n  const actualFactor = rmsOut > 1e-6 ? (rmsIn / rmsOut) : 1;\n  lab.setReadout('窗口点数 M=' + M + ' | 理论降噪倍数 √M=' + theoFactor.toFixed(2) + 'x | 实测降噪=' + actualFactor.toFixed(2) + 'x | 阶跃上升跨度=' + M + ' 点');\n  updateAudio(M, noiseAmp, lab.values.play);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "为什么“一视同仁的等权重”反而是最优解？",
      "paragraphs": [
        "为了从根源上理解为什么没有任何线性滤波器能超越移动平均，我们可以做一个思想实验：先**锁定边沿锐度**。比如我们硬性规定：滤波器的阶跃响应必须在 **11 个采样点** 内完成上升。这就决定了滤波器的脉冲响应（即滤波器核 `h[k]`）必须恰好包含 11 个系数。",
        "现在的优化问题是：在保证直流增益为 1（即 `Σ h[k] = 1`）的前提下，如何挑选这 11 个系数的大小，才能让输出信号上的随机白噪声最小？",
        "答案出乎意料地直白：**因为我们要滤除的是随机白噪声，每一个输入采样点都和它相邻的点一样“脏”，没有任何一个采样点更特殊、更可信！** 如果你给中心点分配一个较大的权重、给两侧分配较小的权重，就相当于给了这个本身同样含噪的点“特权”，它的随机抖动会被放大并主导输出，反而破坏了样本间互相抵消噪声的能力。只有当 11 个采样点被**完全平等对待**（每个系数都等于 `1/11`）时，输出噪声方差才会达到数学上的绝对最小值。（本章后面会看到其他一些滤波器可以“几乎”一样好，但重点在于：没有任何线性滤波器能比简单移动平均更好。）"
      ],
      "formula": {
        "expr": "σ_out = σ_in · √(Σ h[k]²)  ≥  σ_in / √M",
        "explain": "当核系数归一化（Σh[k]=1）时，输出白噪声标准差 σ_out 取决于核系数平方和的平方根。根据柯西-施瓦茨不等式，当且仅当所有系数相等（h[k]=1/M）时，Σh[k]² 取得最小值 1/M，降噪效果达到极限最优。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：固定 11 点边沿宽度，挑战“等权重”最优性",
      "instruction": "保持滤波器长度 M=11 点不变，向右拖动「中心权重集中度」给中心样本更多权重，观察右侧残余噪声如何不可避免地变大；也可切换查看阶跃响应边沿对比。",
      "controls": [
        {
          "type": "slider",
          "id": "bias",
          "label": "中心权重集中度",
          "min": 0,
          "max": 100,
          "step": 2,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showStep",
          "label": "切换观察阶跃响应边沿",
          "value": false
        }
      ],
      "jsCode": "const W = lab.width, H = lab.height, ctx = lab.ctx;\nfunction mulberry32(a) {\n  return function() {\n    let t = a += 0x6D2B79F5;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction getKernel(bias) {\n  const M = 11, h = new Float32Array(M);\n  const alpha = (bias / 100) * 0.25;\n  let sum = 0;\n  for (let k = 0; k < M; k++) {\n    const d = k - 5;\n    h[k] = Math.exp(-alpha * d * d);\n    sum += h[k];\n  }\n  for (let k = 0; k < M; k++) h[k] /= sum;\n  return h;\n}\nfunction draw() {\n  const bias = lab.values.bias;\n  const showStep = lab.values.showStep;\n  const h = getKernel(bias);\n  let sumSq = 0;\n  for (let k = 0; k < 11; k++) sumSq += h[k] * h[k];\n  const rmsFactor = Math.sqrt(sumSq);\n  const optFactor = 1 / Math.sqrt(11);\n  const worsePct = ((rmsFactor - optFactor) / optFactor) * 100;\n  ctx.clearRect(0, 0, W, H);\n  const lx = 28, ly = 28, lw = 260, lh = 182;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  const maxH = 0.35;\n  const optY = ly + lh - ((1 / 11) / maxH) * lh;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(lx, optY); ctx.lineTo(lx + lw, optY); ctx.stroke();\n  ctx.setLineDash([]);\n  const barSlot = lw / 11;\n  for (let k = 0; k < 11; k++) {\n    const bh = Math.min(lh - 4, (h[k] / maxH) * lh);\n    const bx = lx + k * barSlot + 3;\n    const by = ly + lh - bh;\n    ctx.fillStyle = bias === 0 ? '#10b981' : '#38bdf8';\n    ctx.fillRect(bx, by, barSlot - 6, bh);\n  }\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('11点滤波器核 h[0..10]', lx, 18);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '10px monospace';\n  ctx.fillText('等权基准 1/11', lx + lw - 82, optY - 5);\n  const rx = 318, ry = 28, rw = 378, rh = 182;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  if (!showStep) {\n    const rand = mulberry32(424242);\n    const N = 160, raw = new Float32Array(N + 11);\n    for (let i = 0; i < raw.length; i++) {\n      let g = 0; for (let u = 0; u < 6; u++) g += rand();\n      raw[i] = (g - 3) * 1.4142;\n    }\n    const yCur = new Float32Array(N), yOpt = new Float32Array(N);\n    for (let i = 0; i < N; i++) {\n      let s1 = 0, s2 = 0;\n      for (let k = 0; k < 11; k++) {\n        s1 += h[k] * raw[i + k];\n        s2 += (1 / 11) * raw[i + k];\n      }\n      yCur[i] = s1; yOpt[i] = s2;\n    }\n    const midY = ry + rh / 2;\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.beginPath(); ctx.moveTo(rx, midY); ctx.lineTo(rx + rw, midY); ctx.stroke();\n    ctx.strokeStyle = 'rgba(245,158,11,0.6)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const px = rx + (i / (N - 1)) * rw;\n      const py = midY - yOpt[i] * (rh * 0.36);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.strokeStyle = bias === 0 ? '#10b981' : '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i < N; i++) {\n      const px = rx + (i / (N - 1)) * rw;\n      const py = midY - yCur[i] * (rh * 0.36);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('输出残余白噪声 (黄: 移动平均 | 粉/绿: 当前核)', rx, 18);\n  } else {\n    const pts = 25;\n    const stepCur = new Float32Array(pts), stepOpt = new Float32Array(pts);\n    for (let i = 0; i < pts; i++) {\n      let s1 = 0, s2 = 0;\n      for (let k = 0; k < 11; k++) {\n        const u = (i - k >= 7) ? 1 : 0;\n        s1 += h[k] * u;\n        s2 += (1 / 11) * u;\n      }\n      stepCur[i] = s1; stepOpt[i] = s2;\n    }\n    const y0 = ry + rh - 20, y1 = ry + 20;\n    ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n    ctx.setLineDash([4, 3]);\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let i = 0; i < pts; i++) {\n      const px = rx + (i / (pts - 1)) * rw;\n      const py = y0 - stepOpt[i] * (y0 - y1);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    for (let i = 0; i < pts; i++) {\n      const px = rx + (i / (pts - 1)) * rw;\n      const py = y0 - stepCur[i] * (y0 - y1);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n      ctx.fillStyle = '#38bdf8';\n      ctx.fillRect(px - 2, py - 2, 4, 4);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('阶跃响应对比 (均固定在11点内完成上升)', rx, 18);\n  }\n  lab.setReadout('中心权重 h[5]=' + (h[5] * 100).toFixed(1) + '% | 输出噪声系数 √Σh²=' + rmsFactor.toFixed(4) + ' (最优下限=' + optFactor.toFixed(4) + ') | 噪声恶化: +' + worsePct.toFixed(1) + '%');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑点 1（不要迷信复杂滤波器）：如果你的核心任务是在时域波形上压制随机白噪声、同时尽量不拉宽阶跃上升沿，直接用移动平均就是理论极限最优解，换成高斯加权或三角加权反而会略微增加残余噪声。",
        "避坑点 2（注意边际收益递减）：降噪倍数只按 √M 增长，想把噪声多压低 10 倍，窗口点数 M 必须扩大 100 倍，代价是边沿模糊宽度也扩大 100 倍，工程选型务必先评估信号允许的最大上升时间。",
        "一句话核心结论：简单不代表次优——当所有输入样本同等含噪时，平等对待每一个样本的移动平均滤波器，正是“最小噪声 + 最锐利阶跃响应”的最优平衡点。"
      ]
    }
  ]
});
