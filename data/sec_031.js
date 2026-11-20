window.__BOOK_REGISTER_SECTION__("sec_031", {
  "title": "直方图、概率质量函数与概率密度函数 (Histogram, Pmf and Pdf)",
  "intuition": "直方图是有限采样数据的计数快照，PMF 是离散信号的理论概率分布，PDF 则是连续信号以“面积”衡量概率的密度曲线。",
  "blocks": [
    {
      "type": "concept",
      "heading": "直方图（Histogram）：把海量采样“归类计数”",
      "paragraphs": [
        "假设我们用 8 位模数转换器（ADC）采集一段包含 256,000 个点的数字信号。每个采样点的取值只能是 `0` 到 `255` 这 256 种整数之一。**直方图** $H_i$ 所做的事情非常直观：统计数值恰好等于 $i$ 的采样点一共出现了多少次。",
        "如果只采集 128 个点，直方图会显得锯齿丛生、毛刺很多；而把 256,000 个点全部统计进来后，直方图曲线会变得极其平滑。与信号均值类似，直方图本身的统计噪声（粗糙度）与采样总数 $N$ 的平方根成反比。",
        "在工程上，直方图还有一个极其强大的隐藏用途：**加速计算超大数据集（如百万像素图像）的均值与标准差**。传统算法需要对几百万个样本逐一做浮点乘法；而利用直方图，我们只需通过极快的“数组下标加一”操作完成计数，随后仅对 256 个分组做加权运算即可，计算速度往往能提升一个数量级。"
      ],
      "formula": {
        "expr": "N = Σ H[i],  μ = (1/N) · Σ (i · H[i]),  σ² = (1/(N-1)) · Σ ((i - μ)² · H[i])   (i = 0 到 M-1)",
        "explain": "H[i] 是取值为 i 的样本出现次数，M 是所有可能取值的数量（如 8 位信号为 256），N 是总采样点数。把相同数值的样本打包一起算，大幅减少了乘除法次数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：采样数 N 与分箱数（Binning）对直方图的影响",
      "instruction": "拖动“采样点数 N”观察直方图如何从毛刺收敛到平滑曲线；拖动“分箱数量”体验垂直噪声与水平分辨率的权衡。",
      "controls": [
        {
          "type": "slider",
          "id": "samples",
          "label": "采样点数 N",
          "min": 100,
          "max": 25000,
          "step": 100,
          "value": 400,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "bins",
          "label": "分箱数量 (Bins)",
          "min": 6,
          "max": 120,
          "step": 1,
          "value": 36,
          "unit": " 箱"
        },
        {
          "type": "toggle",
          "id": "showPdf",
          "label": "叠加理论分布轮廓 (PDF)",
          "value": true
        }
      ],
      "jsCode": "const MAX_N = 25000;\nconst data = new Float32Array(MAX_N);\nlet seed = 1337;\nfunction rand() {\n  seed = (seed * 1664525 + 1013904223) >>> 0;\n  return seed / 4294967296;\n}\nfor (let i = 0; i < MAX_N; i += 2) {\n  const u1 = Math.max(1e-7, rand());\n  const u2 = rand();\n  const mag = Math.sqrt(-2.0 * Math.log(u1));\n  const z0 = mag * Math.cos(2 * Math.PI * u2);\n  const z1 = mag * Math.sin(2 * Math.PI * u2);\n  data[i] = Math.max(-3.5, Math.min(3.5, z0));\n  if (i + 1 < MAX_N) data[i + 1] = Math.max(-3.5, Math.min(3.5, z1));\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const N = lab.values.samples;\n  const M = lab.values.bins;\n  const showPdf = lab.values.showPdf;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // 网格背景\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 15); ctx.lineTo(gx, H - 25); ctx.stroke();\n  }\n  for (let gy = 25; gy < H - 20; gy += 38) {\n    ctx.beginPath(); ctx.moveTo(15, gy); ctx.lineTo(W - 15, gy); ctx.stroke();\n  }\n\n  // 左侧：时域信号前 100 点预览\n  const sigX = 20, sigW = 240, sigY = 24, sigH = H - 52;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(sigX, sigY, sigW, sigH);\n  const midY = sigY + sigH / 2;\n  ctx.beginPath(); ctx.moveTo(sigX, midY); ctx.lineTo(sigX + sigW, midY); ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  const previewCount = Math.min(100, N);\n  for (let i = 0; i < previewCount; i++) {\n    const px = sigX + (i / 99) * sigW;\n    const py = midY - (data[i] / 3.6) * (sigH / 2);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域样本片段 (前 ' + previewCount + ' 点)', sigX + 4, sigY - 6);\n\n  // 右侧：分箱直方图\n  const minVal = -3.5, maxVal = 3.5, span = maxVal - minVal;\n  const binWVal = span / M;\n  const counts = new Int32Array(M);\n  for (let i = 0; i < N; i++) {\n    let b = Math.floor(((data[i] - minVal) / span) * M);\n    if (b >= M) b = M - 1;\n    if (b < 0) b = 0;\n    counts[b]++;\n  }\n\n  // 用直方图反推均值与标准差\n  let sum = 0;\n  for (let b = 0; b < M; b++) {\n    const center = minVal + (b + 0.5) * binWVal;\n    sum += center * counts[b];\n  }\n  const mean = sum / N;\n  let varSum = 0;\n  for (let b = 0; b < M; b++) {\n    const center = minVal + (b + 0.5) * binWVal;\n    varSum += counts[b] * (center - mean) * (center - mean);\n  }\n  const std = Math.sqrt(varSum / Math.max(1, N - 1));\n\n  const histX = 290, histW = 410, histY = 24, histH = H - 52;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(histX, histY, histW, histH);\n\n  let maxCount = 1;\n  for (let b = 0; b < M; b++) if (counts[b] > maxCount) maxCount = counts[b];\n  const theoPeak = N * binWVal * 0.398942;\n  const yScaleMax = Math.max(maxCount, theoPeak * 1.15);\n\n  const barPxW = histW / M;\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.72)';\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1;\n  for (let b = 0; b < M; b++) {\n    const bh = (counts[b] / yScaleMax) * (histH - 8);\n    const bx = histX + b * barPxW;\n    const by = histY + histH - bh;\n    ctx.fillRect(bx + 0.5, by, Math.max(1, barPxW - 1), bh);\n  }\n\n  if (showPdf) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    const steps = 140;\n    for (let s = 0; s <= steps; s++) {\n      const xVal = minVal + (s / steps) * span;\n      const pdf = 0.398942 * Math.exp(-0.5 * xVal * xVal);\n      const expectedCount = N * binWVal * pdf;\n      const px = histX + (s / steps) * histW;\n      const py = histY + histH - (expectedCount / yScaleMax) * (histH - 8);\n      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('分箱直方图 (青绿) vs 理论轮廓 (琥珀)', histX + 4, histY - 6);\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.fillText('-3.5', histX, histY + histH + 15);\n  ctx.fillText('0', histX + histW / 2 - 4, histY + histH + 15);\n  ctx.fillText('+3.5', histX + histW - 26, histY + histH + 15);\n\n  lab.setReadout('N = ' + N + ' 点 | 分箱数 M = ' + M + ' | 直方图估算均值 μ = ' + mean.toFixed(3) + ' | 标准差 σ = ' + std.toFixed(3) + ' | 峰值箱计数 = ' + maxCount);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "PMF 与 PDF：从“计数”走向“概率”与“概率密度”",
      "paragraphs": [
        "在信号处理中，我们采集到的信号只是底层物理过程的“含噪样本”。**直方图**是从有限个实际样本中数出来的，它的纵轴是“次数”，所有柱子加起来等于总样本数 $N$。",
        "如果我们能采集无限多个样本，把直方图的每个值除以总样本数 $N$，纵轴就变成了“比例”，这条描述离散信号底层概率规律的曲线叫做**概率质量函数（PMF, Probability Mass Function）**。PMF 的每一个值都在 0 到 1 之间，所有离散取值的概率之和严格等于 `1`。",
        "然而，现实世界中的模拟信号（例如电路里的连续电压）取值是**连续**的，存在无穷多个可能的小数点值（如 120.49998 mV、120.49999 mV……）。因此，连续信号精确取到某一个特定值的概率几乎为零！针对连续信号，必须使用**概率密度函数（PDF, Probability Density Function）**。PDF 的纵轴单位是“概率密度”而非直接的概率——**只有将 PDF 在某一段区间内求积分（即计算曲线下的面积），才能得到信号落在该区间内的真实概率**。"
      ],
      "formula": {
        "expr": "P(a ≤ x ≤ b) = ∫[a→b] p(x) dx,    ∫[-∞→+∞] p(x) dx = 1",
        "explain": "p(x) 是概率密度函数（PDF）。要计算连续信号落在 a 到 b 之间的概率，必须计算这段区间下方的面积；而整个定义域下的总面积恒等于 1（代表信号必然取某一个值）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：三种经典波形的侧置 PDF 与实时听感对比",
      "instruction": "切换波形类型（1=方波、2=三角波、3=随机噪声）并调节幅度，观察右侧旋转 90° 的概率密度分布，可开启声音对比听感！",
      "controls": [
        {
          "type": "slider",
          "id": "waveType",
          "label": "波形 (1方波 2三角 3噪声)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "amp",
          "label": "信号幅度",
          "min": 0.2,
          "max": 1,
          "step": 0.05,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioState = { ctx: null, osc: null, noise: null, gain: null, activeType: 0 };\nconst NOISE_LEN = 48000;\nconst noiseBufData = new Float32Array(NOISE_LEN);\nfor (let i = 0; i < NOISE_LEN; i += 2) {\n  const u1 = Math.max(1e-7, Math.random());\n  const u2 = Math.random();\n  const mag = Math.sqrt(-2 * Math.log(u1)) * 0.32;\n  noiseBufData[i] = Math.max(-1, Math.min(1, mag * Math.cos(2 * Math.PI * u2)));\n  if (i + 1 < NOISE_LEN) noiseBufData[i + 1] = Math.max(-1, Math.min(1, mag * Math.sin(2 * Math.PI * u2)));\n}\n\nfunction stopAudio() {\n  if (audioState.osc) { try { audioState.osc.stop(); audioState.osc.disconnect(); } catch (e) {} audioState.osc = null; }\n  if (audioState.noise) { try { audioState.noise.stop(); audioState.noise.disconnect(); } catch (e) {} audioState.noise = null; }\n  if (audioState.gain) { try { audioState.gain.disconnect(); } catch (e) {} audioState.gain = null; }\n  audioState.activeType = 0;\n}\n\nfunction syncAudio() {\n  const play = lab.values.play;\n  const wt = lab.values.waveType;\n  const amp = lab.values.amp;\n  if (!play) {\n    stopAudio();\n    return;\n  }\n  const actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n\n  if (audioState.activeType !== wt) {\n    stopAudio();\n    const g = actx.createGain();\n    g.gain.setValueAtTime(amp * 0.08, actx.currentTime);\n    g.connect(actx.destination);\n    audioState.gain = g;\n\n    if (wt === 1 || wt === 2) {\n      const osc = actx.createOscillator();\n      osc.type = wt === 1 ? 'square' : 'triangle';\n      osc.frequency.setValueAtTime(220, actx.currentTime);\n      osc.connect(g);\n      osc.start();\n      audioState.osc = osc;\n    } else {\n      const buf = actx.createBuffer(1, NOISE_LEN, actx.sampleRate || 44100);\n      buf.copyToChannel(noiseBufData, 0);\n      const src = actx.createBufferSource();\n      src.buffer = buf;\n      src.loop = true;\n      src.connect(g);\n      src.start();\n      audioState.noise = src;\n    }\n    audioState.activeType = wt;\n  } else if (audioState.gain) {\n    audioState.gain.gain.setTargetAtTime(amp * 0.08, actx.currentTime, 0.02);\n  }\n}\n\nconst displayNoise = new Float32Array(220);\nfor (let i = 0; i < displayNoise.length; i++) {\n  const u1 = Math.max(1e-7, Math.random());\n  const u2 = Math.random();\n  displayNoise[i] = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2) * 0.34;\n}\n\nfunction drawScene(tSec) {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  const wt = lab.values.waveType;\n  const amp = lab.values.amp;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // 网格\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 16); ctx.lineTo(gx, H - 16); ctx.stroke(); }\n  for (let gy = 30; gy < H - 16; gy += 30) { ctx.beginPath(); ctx.moveTo(20, gy); ctx.lineTo(W - 20, gy); ctx.stroke(); }\n\n  const wfX = 35, wfW = 395, midY = H / 2, yScale = 86;\n  // 零轴\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath(); ctx.moveTo(wfX, midY); ctx.lineTo(wfX + wfW, midY); ctx.stroke();\n  ctx.strokeRect(wfX, 24, wfW, H - 48);\n\n  // 左侧波形\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  const cycles = 4.5;\n  const phaseOffset = (tSec || 0) * 1.4;\n  const pts = 200;\n  for (let i = 0; i <= pts; i++) {\n    const u = i / pts;\n    const phase = (u * cycles + phaseOffset) % 1;\n    let yVal = 0;\n    if (wt === 1) {\n      yVal = phase < 0.5 ? amp : -amp;\n    } else if (wt === 2) {\n      yVal = amp * (1 - 4 * Math.abs(Math.round(phase - 0.25) - (phase - 0.25)));\n    } else {\n      const idx = (i + Math.floor((tSec || 0) * 18)) % displayNoise.length;\n      yVal = Math.max(-1.05, Math.min(1.05, displayNoise[idx] * amp));\n    }\n    const px = wfX + u * wfW;\n    const py = midY - yVal * yScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // 右侧：旋转90度对齐幅度的 PDF 图\n  const pdfX = 465, pdfW = 225;\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.strokeRect(pdfX, 24, pdfW, H - 48);\n  ctx.beginPath(); ctx.moveTo(pdfX, midY); ctx.lineTo(pdfX + pdfW, midY); ctx.stroke();\n\n  // 辅助虚线对齐上下界\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';\n  const yTop = midY - amp * yScale;\n  const yBot = midY + amp * yScale;\n  ctx.beginPath(); ctx.moveTo(wfX, yTop); ctx.lineTo(pdfX + pdfW, yTop); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(wfX, yBot); ctx.lineTo(pdfX + pdfW, yBot); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.22)';\n  ctx.lineWidth = 2.5;\n\n  if (wt === 1) {\n    // 方波 PDF：两根极窄冲激尖峰\n    ctx.beginPath();\n    ctx.moveTo(pdfX, yTop); ctx.lineTo(pdfX + pdfW * 0.85, yTop);\n    ctx.moveTo(pdfX, yBot); ctx.lineTo(pdfX + pdfW * 0.85, yBot);\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(pdfX + pdfW * 0.85, yTop, 4, 0, Math.PI * 2); ctx.fill();\n    ctx.beginPath(); ctx.arc(pdfX + pdfW * 0.85, yBot, 4, 0, Math.PI * 2); ctx.fill();\n  } else if (wt === 2) {\n    // 三角波 PDF：均匀分布矩形\n    const rectW = Math.min(pdfW * 0.88, (0.5 / amp) * 105);\n    ctx.beginPath();\n    ctx.moveTo(pdfX, yTop);\n    ctx.lineTo(pdfX + rectW, yTop);\n    ctx.lineTo(pdfX + rectW, yBot);\n    ctx.lineTo(pdfX, yBot);\n    ctx.closePath();\n    ctx.fill();\n    ctx.stroke();\n  } else {\n    // 高斯噪声 PDF：钟形曲线\n    const sigma = 0.34 * amp;\n    ctx.beginPath();\n    ctx.moveTo(pdfX, H - 24);\n    for (let py = 24; py <= H - 24; py += 2) {\n      const yVal = (midY - py) / yScale;\n      const dens = Math.exp(-0.5 * (yVal / sigma) * (yVal / sigma)) / (sigma * 2.5066);\n      const xLen = Math.min(pdfW - 10, dens * 75);\n      ctx.lineTo(pdfX + xLen, py);\n    }\n    ctx.lineTo(pdfX, 24);\n    ctx.stroke();\n    ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  const names = ['', '方波 (双态脉冲分布)', '三角波 (均匀分布 Uniform)', '随机噪声 (高斯分布 Gaussian)'];\n  ctx.fillText('时域信号：' + names[wt], wfX + 4, 16);\n  ctx.fillText('侧置 PDF (横轴=概率密度)', pdfX + 4, 16);\n\n  const desc = wt === 1 ? '仅取 +A 和 -A 两值，PDF 为两根冲激尖峰' : (wt === 2 ? '各幅度停留时间均等，PDF 为均匀矩形' : '能量集中在零点附近，PDF 为钟形高斯曲线');\n  lab.setReadout('当前波形: ' + names[wt] + ' | 幅度 A = ' + amp.toFixed(2) + ' | 特性: ' + desc);\n}\n\nlab.onUpdate(function() { syncAudio(); drawScene(0); });\nlab.onLoop(function(dt, tSec) { drawScene(tSec); });\ndrawScene(0);"
    },
    {
      "type": "concept",
      "heading": "浮点数的困境与“分箱（Binning）”折衷法则",
      "paragraphs": [
        "对于 8 位或 16 位整数信号，数值等级总数只有 256 或 65,536 个，直接按数值建数组计数即可。但如果信号是以**浮点数**格式存储的（比如 0.0 到 10.0 之间的任意小数），可能出现的数值多达数十亿种。如果还按老办法给每个可能的值分配一个计数器，不仅内存爆炸，而且 99.99% 的格子都是 `0`，根本看不出分布形状。",
        "解决办法就是**分箱（Binning）**。我们人为规定一个方便的直方图长度（例如 1000 个箱子，即 Bin），每个箱子负责统计落在**某一个连续区间**内的样本总数。例如把 0.0~10.0 均分为 1000 份，0 号箱统计 `[0, 0.01)` 的样本数，1 号箱统计 `[0.01, 0.02)` 的样本数，计算箱号只需一行代码：`BINNUM = INT(x * 100)`。",
        "分箱数量的选择是一场经典权衡：**箱子太多**，落入每个箱子的样本数极少，导致纵轴方向的统计噪声极大，难以看清真实幅度；**箱子太少**，虽然纵轴平滑了，但横轴方向糊成一片，丢失了分布的精细结构。只有同时增加总采样点数 $N$，才能在横纵两个方向上同时获得高分辨率。"
      ],
      "formula": {
        "expr": "bin_index = floor( (x - x_min) / Δx ),    Δx = (x_max - x_min) / M",
        "explain": "x 为当前浮点样本值，[x_min, x_max] 为信号动态范围，M 为设定的分箱总数，Δx 为单个箱子的宽度。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分三者别混用：直方图总和 = N（样本总数），PMF 总和 = 1（离散概率），PDF 曲线下面积 = 1（连续概率密度）。",
        "面对图像等百万级以上样本的整数数据，先算直方图再由直方图计算均值与标准差，通常比直接遍历原始数据快一个数量级。",
        "切勿直接对浮点信号按精确值统计直方图，务必先做分箱（Binning），并根据样本量 N 合理权衡箱数 M：样本少时箱数宁少勿多，避免出现全是毛刺的“假分布”。",
        "连续信号的 PDF 在某一点的纵坐标值可以大于 1（例如极窄的均匀分布或高瘦的高斯分布），这完全正常——因为纵轴是“密度”，只要整条曲线下的积分面积等于 1 即可。"
      ]
    }
  ]
});
