window.__BOOK_REGISTER_SECTION__("sec_103", {
  "title": "系统的频率响应 (Frequency Response of Systems)",
  "intuition": "系统在时域里像一串难以捉摸的脉冲响应暗号，但只要用 DFT 把它变换到频域，它对不同频率余弦波是“放行”还是“拦截”的真实意图就会瞬间原形毕露；而对脉冲响应补零，则能把稀疏的频域采样点加密，还原出背后那条真正连续的频率响应曲线。",
  "blocks": [
    {
      "type": "concept",
      "heading": "时域卷积 vs 频域乘法：同一枚硬币的两面",
      "paragraphs": [
        "在数字信号处理中，我们通常用**卷积（Convolution）**在时域里分析线性系统：把输入信号 `x[n]` 与系统的脉冲响应 `h[n]` 卷积，就能得到输出信号 `y[n]`。但光盯着脉冲响应的波形（例如一堆上下剧烈震荡的采样点），人眼几乎不可能直接猜出这个系统到底是个低通、高通还是带通滤波器。",
        "幸好，傅里叶变换为我们打开了频域的大门。任何输入信号都可以看作是一组不同振幅和相位的余弦波之和；由于线性系统满足叠加性，我们只需知道系统会如何改变**每一个频率余弦波的振幅与相移**，就完全掌握了这个系统的全部性格。这份记录了各频率振幅缩放与相位偏移的信息，就叫做系统的**频率响应（Frequency Response）**，按行业惯例用大写 `H[ ]` 表示（对应时域小写 `h[ ]`）。",
        "脉冲响应 `h[n]` 与频率响应 `H[f]` 包含完全等价的系统信息，两者通过傅里叶变换建立了一一对应关系：**系统的频率响应，就是其脉冲响应的傅里叶变换**。这也带来了信号处理中最优雅的等价关系——**时域的卷积，等价于频域的逐点相乘**。"
      ],
      "formula": {
        "expr": "x[n] * h[n] = y[n]   <==>   X[f] × H[f] = Y[f]",
        "explain": "x[n]、y[n] 分别是时域输入与输出信号，h[n] 是系统脉冲响应（* 表示卷积）；X[f]、Y[f] 是对应的输入与输出频谱，H[f] 是系统频率响应（× 表示逐频点相乘）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：用余弦波探测系统的频率响应（带听觉对比）",
      "instruction": "拖动「输入余弦波频率」滑块扫过 0.02~0.48 的归一化频段，观察右图红黄指针在带通响应曲线 |H[f]| 上的位置与左图输出波形幅度的变化，并点击播放按钮亲耳听出通带与阻带的音量差异。",
      "controls": [
        {
          "type": "slider",
          "id": "testFreq",
          "label": "输入余弦波频率 (归一化)",
          "min": 0.02,
          "max": 0.48,
          "step": 0.01,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bandCenter",
          "label": "带通中心频率",
          "min": 0.15,
          "max": 0.35,
          "step": 0.01,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路直通 (Bypass 对比原声)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let phase = 0;\nlet audioCtx = null, osc = null, gainNode = null;\nconst M = 63;\n\nfunction buildKernel(fc) {\n  const h = new Array(64);\n  const f1 = Math.max(0.02, fc - 0.05);\n  const f2 = Math.min(0.48, fc + 0.05);\n  for (let i = 0; i <= M; i++) {\n    const n = i - M / 2;\n    const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / M);\n    let lp1, lp2;\n    if (Math.abs(n) < 1e-9) {\n      lp1 = 2 * f1;\n      lp2 = 2 * f2;\n    } else {\n      lp1 = Math.sin(2 * Math.PI * f1 * n) / (Math.PI * n);\n      lp2 = Math.sin(2 * Math.PI * f2 * n) / (Math.PI * n);\n    }\n    h[i] = (lp2 - lp1) * win;\n  }\n  let re = 0, im = 0;\n  for (let i = 0; i <= M; i++) {\n    const ang = 2 * Math.PI * fc * i;\n    re += h[i] * Math.cos(ang);\n    im -= h[i] * Math.sin(ang);\n  }\n  const peak = Math.hypot(re, im) || 1;\n  for (let i = 0; i <= M; i++) h[i] /= peak;\n  return h;\n}\n\nfunction evalMag(h, f) {\n  let re = 0, im = 0;\n  for (let i = 0; i < h.length; i++) {\n    const ang = 2 * Math.PI * f * i;\n    re += h[i] * Math.cos(ang);\n    im -= h[i] * Math.sin(ang);\n  }\n  return Math.hypot(re, im);\n}\n\nfunction syncAudio() {\n  const playing = !!lab.values.play;\n  if (!playing) {\n    if (gainNode && audioCtx) {\n      try { gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02); } catch (e) {}\n    }\n    return;\n  }\n  const h = buildKernel(lab.values.bandCenter);\n  const mag = evalMag(h, lab.values.testFreq);\n  try {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n    if (audioCtx && !osc) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      osc.type = 'sine';\n      gainNode.gain.value = 0;\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n    if (audioCtx && osc && gainNode) {\n      const hz = 140 + lab.values.testFreq * 1800;\n      const targetGain = 0.16 * (lab.values.bypass ? 1.0 : Math.min(1.25, mag));\n      osc.frequency.setTargetAtTime(hz, audioCtx.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nfunction drawVisual() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  const fc = lab.values.bandCenter;\n  const ft = lab.values.testFreq;\n  const bypass = !!lab.values.bypass;\n  const h = buildKernel(fc);\n  const mag = evalMag(h, ft);\n  const outMag = bypass ? 1.0 : mag;\n\n  const lx = 18, lw = 240, ly = 28, lh = H - 48;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  const midY = ly + lh / 2;\n  ctx.beginPath(); ctx.moveTo(lx, midY); ctx.lineTo(lx + lw, midY); ctx.stroke();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let px = 0; px <= lw; px += 2) {\n    const xVal = (px / lw) * 32;\n    const yVal = Math.cos(2 * Math.PI * ft * xVal - phase);\n    const py = midY - yVal * (lh * 0.36);\n    if (px === 0) ctx.moveTo(lx + px, py); else ctx.lineTo(lx + px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = bypass ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= lw; px += 2) {\n    const xVal = (px / lw) * 32;\n    const yVal = outMag * Math.cos(2 * Math.PI * ft * xVal - phase);\n    const py = midY - yVal * (lh * 0.36);\n    if (px === 0) ctx.moveTo(lx + px, py); else ctx.lineTo(lx + px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域余弦波 (输入 x 蓝 vs 输出 y 绿)', lx, 18);\n\n  const rx = 288, rw = W - rx - 20, ry = 28, rh = H - 54;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const gy = ry + (rh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, gy); ctx.lineTo(rx + rw, gy); ctx.stroke();\n  }\n  for (let g = 0; g <= 5; g++) {\n    const gx = rx + (rw * g) / 5;\n    ctx.beginPath(); ctx.moveTo(gx, ry); ctx.lineTo(gx, ry + rh); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '10px monospace';\n    ctx.fillText((g * 0.1).toFixed(1), gx - 8, ry + rh + 14);\n  }\n\n  const maxG = 1.35;\n  const yOne = ry + rh * (1 - 1.0 / maxG);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(rx, yOne); ctx.lineTo(rx + rw, yOne); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = 0; px <= rw; px += 2) {\n    const f = (px / rw) * 0.5;\n    const m = evalMag(h, f);\n    const py = ry + rh * (1 - Math.min(maxG, m) / maxG);\n    if (px === 0) ctx.moveTo(rx + px, py); else ctx.lineTo(rx + px, py);\n  }\n  ctx.stroke();\n\n  const tx = rx + (ft / 0.5) * rw;\n  const ty = ry + rh * (1 - Math.min(maxG, mag) / maxG);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(tx, ry); ctx.lineTo(tx, ry + rh); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(tx, ty, 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('系统频率响应 |H[f]| (横轴归一化频率 0 ~ 0.5)', rx, 18);\n\n  const hz = Math.round(140 + ft * 1800);\n  lab.setReadout('测试频率 f = ' + ft.toFixed(2) + ' (' + hz + ' Hz) | 系统增益 |H(f)| = ' + mag.toFixed(3) + (bypass ? ' [旁路直通中: 输出幅度 = 1.000]' : ' | 滤波输出幅度 = ' + outMag.toFixed(3)));\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawVisual();\n});\n\nlab.onLoop(function(dt) {\n  phase += dt * 4.5;\n  drawVisual();\n});"
    },
    {
      "type": "concept",
      "heading": "用 DFT 求解频率响应，以及神奇的“补零”技巧",
      "paragraphs": [
        "假设我们手里有一个 64 点的系统脉冲响应 `h[n]`。直接对它做一次 64 点的实数 DFT，就能得到频域上 `64/2 + 1 = 33` 个采样点。虽然此时已经能大致看出这是一个通过 0.2~0.3 频段的带通滤波器（对应原书图 9-7a 与 9-7b），但因为只有 33 个点，画出来的频率响应曲线会显得棱角分明、非常锯齿化。",
        "如何把频域曲线变得光滑清晰？答案简单到令人惊讶：**在送入 DFT 之前，直接在脉冲响应后面补上一大串零（Zero-Padding）**！例如把原本 64 点的脉冲响应补零拉长到 512 点再做 DFT，就会得到 `257` 个频域采样点，原本锯齿状的带通轮廓立刻变得丝滑精确（原书图 9-7c 与 9-7d）。",
        "这里藏着一个极其深刻的物理概念：**尽管离散系统的脉冲响应 `h[n]` 是离散的，但它所对应的真实频率响应 `H(f)` 却是一条连续曲线！** 为什么？因为输入信号完全可以包含 0 到 0.5 之间的**任意**连续频率，系统对每一个连续频率都有确定的响应。`N` 点 DFT 仅仅是从这条连续曲线上抽取了 `N/2 + 1` 个样本点。",
        "从**离散时间傅里叶变换（DTFT）**的角度能把这件事看得更透彻：DFT 默许时域信号是周期性无限重复的。当我们在时域信号末尾不断追加零时，相当于拉长了时域的假想周期；时域周期越长，频域中相邻采样点之间的间隔就挤得越近。如果我们愿意补上无穷多个零，频域采样点的间距就会趋近于零，最终严丝合缝地收敛到那条连续的 DTFT 曲线。"
      ],
      "formula": {
        "expr": "Δf = 1 / N_padded    (输出 N_padded / 2 + 1 个频点)",
        "explain": "N_padded 是脉冲响应补零后的总长度；Δf 是相邻两个频域采样点之间的归一化频率间隔，补零越长，Δf 越小，频谱采样越密集。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：复现原书图 9-7 — 补零如何逼近连续 DTFT 曲线",
      "instruction": "拖动「DFT 长度指数」滑块将 64 点脉冲响应从 64 点一路补零到 1024 点，并打开「叠加真实连续 DTFT 曲线」开关，验证所有补零后的采样点其实都严格落在同一条连续曲线上。",
      "controls": [
        {
          "type": "slider",
          "id": "dftPow",
          "label": "DFT 长度指数 (N = 2^k)",
          "min": 6,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDtft",
          "label": "叠加真实连续 DTFT 曲线",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showPoints",
          "label": "高亮 DFT 离散采样点",
          "value": true
        }
      ],
      "jsCode": "const L = 64;\nconst M = L - 1;\nconst hBase = new Array(L);\n(function initKernel() {\n  const f1 = 0.20, f2 = 0.30;\n  for (let i = 0; i < L; i++) {\n    const n = i - M / 2;\n    const win = 0.54 - 0.46 * Math.cos((2 * Math.PI * i) / M);\n    let lp1, lp2;\n    if (Math.abs(n) < 1e-9) {\n      lp1 = 2 * f1;\n      lp2 = 2 * f2;\n    } else {\n      lp1 = Math.sin(2 * Math.PI * f1 * n) / (Math.PI * n);\n      lp2 = Math.sin(2 * Math.PI * f2 * n) / (Math.PI * n);\n    }\n    hBase[i] = (lp2 - lp1) * win;\n  }\n  let re = 0, im = 0;\n  for (let i = 0; i < L; i++) {\n    const ang = 2 * Math.PI * 0.25 * i;\n    re += hBase[i] * Math.cos(ang);\n    im -= hBase[i] * Math.sin(ang);\n  }\n  const peak = Math.hypot(re, im) || 1;\n  for (let i = 0; i < L; i++) hBase[i] = (hBase[i] / peak) * 1.15;\n})();\n\nfunction evalDTFT(f) {\n  let re = 0, im = 0;\n  for (let n = 0; n < L; n++) {\n    const ang = 2 * Math.PI * f * n;\n    re += hBase[n] * Math.cos(ang);\n    im -= hBase[n] * Math.sin(ang);\n  }\n  return Math.hypot(re, im);\n}\n\nfunction draw() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const N = Math.pow(2, lab.values.dftPow);\n  const numBins = N / 2 + 1;\n  const showDtft = !!lab.values.showDtft;\n  const showPoints = !!lab.values.showPoints;\n\n  // Left panel: Time Domain h[n] + Zero Padding\n  const lx = 20, lw = 300, ly = 28, lh = H - 54;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  const midY = ly + lh / 2;\n  ctx.beginPath(); ctx.moveTo(lx, midY); ctx.lineTo(lx + lw, midY); ctx.stroke();\n\n  const splitX = lx + (L / N) * lw;\n  if (N > L) {\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n    ctx.fillRect(splitX, ly, lx + lw - splitX, lh);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(splitX, midY);\n    ctx.lineTo(lx + lw, midY);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let n = 0; n < L; n++) {\n    const px = lx + (n / (N - 1)) * lw;\n    const py = midY - hBase[n] * (lh * 1.45);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域: 64点脉冲响应 + 补零至 N=' + N, lx, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px monospace';\n  ctx.fillText('0', lx - 2, ly + lh + 14);\n  ctx.fillText(String(N - 1), lx + lw - 20, ly + lh + 14);\n  if (N > L) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('补零区 (' + (N - L) + ' 个0)', Math.min(lx + lw - 86, splitX + 8), ly + 16);\n  }\n\n  // Right panel: Frequency Domain |H[f]|\n  const rx = 360, rw = W - rx - 20, ry = 28, rh = H - 54;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= 4; g++) {\n    const gy = ry + (rh * g) / 4;\n    ctx.beginPath(); ctx.moveTo(rx, gy); ctx.lineTo(rx + rw, gy); ctx.stroke();\n  }\n  for (let g = 0; g <= 5; g++) {\n    const gx = rx + (rw * g) / 5;\n    ctx.beginPath(); ctx.moveTo(gx, ry); ctx.lineTo(gx, ry + rh); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.6)';\n    ctx.font = '10px monospace';\n    ctx.fillText((g * 0.1).toFixed(1), gx - 8, ry + rh + 14);\n  }\n\n  const maxAmp = 1.5;\n  if (showDtft) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let px = 0; px <= rw; px += 2) {\n      const f = (px / rw) * 0.5;\n      const mag = evalDTFT(f);\n      const py = ry + rh * (1 - Math.min(maxAmp, mag) / maxAmp);\n      if (px === 0) ctx.moveTo(rx + px, py); else ctx.lineTo(rx + px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = showDtft ? 1.3 : 2.0;\n  ctx.beginPath();\n  const pts = new Array(numBins);\n  for (let k = 0; k < numBins; k++) {\n    const f = k / N;\n    const mag = evalDTFT(f);\n    const px = rx + (f / 0.5) * rw;\n    const py = ry + rh * (1 - Math.min(maxAmp, mag) / maxAmp);\n    pts[k] = [px, py];\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showPoints) {\n    ctx.fillStyle = '#f59e0b';\n    const r = N <= 128 ? 3.2 : (N <= 256 ? 2.2 : 1.4);\n    const step = N >= 1024 ? 2 : 1;\n    for (let k = 0; k < numBins; k += step) {\n      ctx.beginPath();\n      ctx.arc(pts[k][0], pts[k][1], r, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频域: ' + numBins + ' 点 DFT 采样 (绿线=连续DTFT)', rx, 18);\n\n  lab.setReadout('DFT 长度 N = ' + N + ' | 频域采样点数 (N/2+1) = ' + numBins + ' | 频率步长 Δf = ' + (1 / N).toFixed(5));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【核心铁律】系统的频率响应就是脉冲响应的傅里叶变换；时域做卷积，在频域就是做最简单的逐点乘法。",
        "【避坑提醒】对脉冲响应补零并不会凭空“创造新信息”或提高物理频率分辨力，它只是在频率响应曲线上做密集插值采样，让我们看清原本就被隐藏的连续 DTFT 轮廓。",
        "【工程经验】做 64 点以下短脉冲响应的频率分析时，直接做同长度 DFT 会严重锯齿化；工程上通常至少补零到 512 点或 1024 点，再观察通带纹波与阻带衰减。",
        "【别漏掉相位】本章重点关注了频率响应的幅度（|H[f]|），但完整的频率响应还包括相位响应——它决定了不同频率余弦波穿过系统时各自被延迟了多久。"
      ]
    }
  ]
});
