window.__BOOK_REGISTER_SECTION__("sec_104", {
  "title": "时域补零与频域分辨率：从 DFT 到 DTFT (Time Domain & Frequency Domain)",
  "intuition": "在有限长信号后面补零，并不会凭空创造新信息，而是把时域周期无限拉长，从而在频域切出更密集的采样点，逼近系统真实且连续的频率响应曲线（DTFT）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么直接对脉冲响应做 DFT 会“看不清”频率响应？",
      "paragraphs": [
        "在数字信号处理中，我们常把系统的**时域脉冲响应** `h[n]` 送入离散傅里叶变换（DFT），直接算出系统的**频域频率响应**（本节仅讨论幅度响应，相位响应留待下一章）。",
        "但直接对原始长度的脉冲响应做 DFT 往往会遇到“分辨率不足”的尴尬。以原书图 9-7 为例：一个包含 `N = 64` 个采样点的带通滤波器脉冲响应（图 9-7a），经过 64 点 DFT 后，在 `0` 到 `0.5` 的归一化频率范围内只能得到 `N/2 + 1 = 33` 个离散频点（图 9-7b）。",
        "因为频域采样点之间隔得太远（间隔 `1/64 ≈ 0.0156`），在通带边缘（如频率 `0.2` 和 `0.3` 附近的陡峭过渡带）以及通带顶部的细微起伏之间，我们只能看到稀疏的折线，很难看清真实曲线到底长什么样。"
      ],
      "formula": {
        "expr": "Δf = 1 / N",
        "explain": "Δf 是频域相邻两个采样点之间的归一化频率间隔（范围 0 ~ 0.5）；N 是做 DFT 的总点数。N 越小，频域点越稀疏，曲线轮廓越粗糙。"
      }
    },
    {
      "type": "concept",
      "heading": "为什么系统的频率响应必须是一条连续曲线？",
      "paragraphs": [
        "理解这一点的关键在于回到“频率响应”的物理本质：**频率响应描述的是不同频率的余弦波通过该系统时，所经历的幅度缩放与相位偏移**。",
        "虽然计算机里的 DFT 只给出了 33 个离散频点上的数值，但进入系统的真实输入信号却可以包含 `0` 到 `0.5`（即直流到奈奎斯特频率）之间的**任意连续频率**——比如 `f = 0.2073` 的余弦波完全可以输入系统，系统也必定会给它一个确定的幅度增益。",
        "因此，从物理规律上讲，系统真实的频率响应**绝不是几个孤立的点，而必然是一条连续光滑的曲线**。计算机算出的 64 点 DFT，只是在这条连续曲线上等间隔“扎了 33 根针”而已。"
      ],
      "formula": {
        "expr": "y_steady[n] = |H(f)| · cos(2πfn + ∠H(f))",
        "explain": "任意频率 f ∈ [0, 0.5] 的余弦波输入线性时不变系统后，输出依然是同频率余弦波，其幅度被连续函数 |H(f)| 缩放，相位被 ∠H(f) 偏移。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：时域补零（Zero-Padding）提升频域曲线视觉分辨率",
      "instruction": "拖动“补零后总点数 N”滑块，对照观察左侧时域补零长度与右侧频域采样点密度的同步变化（复刻图 9-7）。",
      "controls": [
        {
          "type": "slider",
          "id": "dftSize",
          "label": "补零后 DFT 总点数 N",
          "min": 64,
          "max": 512,
          "step": 64,
          "value": 64,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showDtft",
          "label": "叠加理论 DTFT 连续响应曲线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst M = 31.5, f1 = 0.20, f2 = 0.30;\nconst h = new Float64Array(64);\nfor (let n = 0; n < 64; n++) {\n  const x = n - M;\n  const s2 = x === 0 ? 2 * f2 : Math.sin(2 * Math.PI * f2 * x) / (Math.PI * x);\n  const s1 = x === 0 ? 2 * f1 : Math.sin(2 * Math.PI * f1 * x) / (Math.PI * x);\n  const win = 0.72 - 0.28 * Math.cos((2 * Math.PI * n) / 63);\n  h[n] = 1.18 * (s2 - s1) * win;\n}\nfunction magAt(f) {\n  let re = 0, im = 0;\n  for (let n = 0; n < 64; n++) {\n    const ang = 2 * Math.PI * f * n;\n    re += h[n] * Math.cos(ang);\n    im -= h[n] * Math.sin(ang);\n  }\n  return Math.hypot(re, im);\n}\nconst dtftPts = [];\nfor (let i = 0; i <= 256; i++) dtftPts.push(magAt((0.5 * i) / 256));\n\nfunction render() {\n  const N = lab.values.dftSize;\n  const showDtft = lab.values.showDtft;\n  ctx.clearRect(0, 0, W, H);\n  const lx = 38, lw = 294, ly = 30, lh = 176;\n  const rx = 394, rw = 302, ry = 30, rh = 176;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ly + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx, yy); ctx.lineTo(rx + rw, yy); ctx.stroke();\n  }\n  for (let i = 0; i <= 5; i++) {\n    const xx = rx + (rw * i) / 5;\n    ctx.beginPath(); ctx.moveTo(xx, ry); ctx.lineTo(xx, ry + rh); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('时域: 64点信号 + ' + (N - 64) + '个补零 (N=' + N + ')', lx, 18);\n  ctx.fillText('频域: ' + (N / 2 + 1) + '个DFT采样点 (Δf=' + (1 / N).toFixed(4) + ')', rx, 18);\n\n  ctx.textAlign = 'right';\n  ctx.fillText('0.4', lx - 4, ly + 4);\n  ctx.fillText('0', lx - 4, ly + lh / 2 + 4);\n  ctx.fillText('-0.4', lx - 4, ly + lh);\n  ctx.fillText('1.6', rx - 4, ry + 4);\n  ctx.fillText('0.8', rx - 4, ry + rh / 2 + 4);\n  ctx.fillText('0.0', rx - 4, ry + rh);\n\n  ctx.textAlign = 'center';\n  ctx.fillText('0', lx, ly + lh + 15);\n  if (N > 64) {\n    ctx.fillText('63', lx + (63 / (N - 1)) * lw, ly + lh + 15);\n  } else {\n    ctx.fillText('32', lx + lw / 2, ly + lh + 15);\n  }\n  ctx.fillText(String(N - 1), lx + lw, ly + lh + 15);\n  for (let i = 0; i <= 5; i++) {\n    ctx.fillText((i * 0.1).toFixed(1), rx + (rw * i) / 5, ry + rh + 15);\n  }\n\n  if (N > 64) {\n    const x64 = lx + (63 / (N - 1)) * lw;\n    ctx.fillStyle = 'rgba(245,158,11,0.08)';\n    ctx.fillRect(x64, ly, lx + lw - x64, lh);\n  }\n\n  const midY = ly + lh / 2;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(lx, midY); ctx.lineTo(lx + lw, midY); ctx.stroke();\n\n  if (N > 64) {\n    const x64 = lx + (63 / (N - 1)) * lw;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(x64, midY); ctx.lineTo(lx + lw, midY); ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let n = 0; n < 64; n++) {\n    const px = lx + (n / (N - 1)) * lw;\n    const py = midY - (h[n] / 0.4) * (lh / 2);\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (showDtft) {\n    ctx.strokeStyle = 'rgba(16,185,129,0.45)';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i <= 256; i++) {\n      const px = rx + (i / 256) * rw;\n      const py = ry + rh - (Math.min(1.6, dtftPts[i]) / 1.6) * rh;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const bins = N / 2;\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  const pts = [];\n  for (let k = 0; k <= bins; k++) {\n    const f = k / N;\n    const m = magAt(f);\n    const px = rx + (f / 0.5) * rw;\n    const py = ry + rh - (Math.min(1.6, m) / 1.6) * rh;\n    pts.push([px, py]);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  const r = N <= 128 ? 3.2 : (N <= 256 ? 2.2 : 1.5);\n  for (let k = 0; k < pts.length; k++) {\n    ctx.beginPath();\n    ctx.arc(pts[k][0], pts[k][1], r, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  lab.setReadout('时域总点数 N=' + N + '（原始64点 + 补零' + (N - 64) + '点） | 频域采样数=' + (bins + 1) + ' | 频域间隔 Δf=' + (1 / N).toFixed(4));\n}\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "把补零推向极限：从 DFT 跨入 DTFT（离散时间傅里叶变换）",
      "paragraphs": [
        "为什么在信号后面补零就能让频域采样点变密？回顾上一章的核心性质：**DFT 隐含地把时域的 N 个采样点视为无限长、首尾相连重复的周期信号**。当你在 64 点信号末尾补上 448 个零（凑成 512 点）时，你把时域信号的“重复周期”强行拉长到了 512；周期变长，对应的频域采样间隔 `1/N` 就同步缩小了 8 倍，采样点自然紧紧挨在了一起（图 9-7c 与 9-7d）。",
        "现在把这个思想推向数学极限——往有限长的离散信号后面补上**无穷多个零**！这会在两个领域同时引发质变：",
        "1. **时域变化**：因为周期变成无穷大，信号永远不会重复第二次，它从一个周期信号彻底变成了**非周期的离散信号（aperiodic discrete signal）**。",
        "2. **频域变化**：采样间隔 `1/∞` 趋近于无穷小，相邻频点之间的空隙完全消失，离散频谱融合成了一条**连续的频域曲线（continuous signal）**。",
        "这个把“时域离散非周期信号”映射为“频域连续曲线”的数学工具，就是傅里叶变换家族的另一位核心成员——**离散时间傅里叶变换（DTFT, Discrete Time Fourier Transform）**。在数学推导中，系统真实的频率响应是通过对脉冲响应做 DTFT 得到的；但在计算机工程中，电脑无法直接处理无穷多点或连续曲线，只能用有限长 DFT（配合补零）去对这条真实的 DTFT 曲线进行采样逼近。"
      ],
      "formula": {
        "expr": "H_DTFT(f) = Σ_{n=-∞}^{∞} h[n] · e^(-j2πfn)",
        "explain": "DTFT 对时域离散序列 h[n] 求和，但频率变量 f ∈ [0, 0.5] 是连续实数而非离散整数索引 k/N。当 h[n] 仅在 0..63 非零时，补零到 N 点的 DFT 恰好等于在 f = k/N 处对 H_DTFT(f) 采样。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：连续频率响应听感探测——任意频率余弦波如何穿过系统",
      "instruction": "点击播放声音并拖动“输入余弦频率 f”，感受频点落在通带(0.2~0.3)、过渡带与阻带(含64点DFT空隙处)时系统的连续响应变化。",
      "controls": [
        {
          "type": "slider",
          "id": "normFreq",
          "label": "输入余弦归一化频率 f",
          "min": 0.02,
          "max": 0.48,
          "step": 0.005,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "applyFilter",
          "label": "经系统滤波输出（关闭则听原始输入）",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试余弦波",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst M = 31.5, f1 = 0.20, f2 = 0.30;\nconst h = new Float64Array(64);\nfor (let n = 0; n < 64; n++) {\n  const x = n - M;\n  const s2 = x === 0 ? 2 * f2 : Math.sin(2 * Math.PI * f2 * x) / (Math.PI * x);\n  const s1 = x === 0 ? 2 * f1 : Math.sin(2 * Math.PI * f1 * x) / (Math.PI * x);\n  const win = 0.72 - 0.28 * Math.cos((2 * Math.PI * n) / 63);\n  h[n] = 1.18 * (s2 - s1) * win;\n}\nfunction magAt(f) {\n  let re = 0, im = 0;\n  for (let n = 0; n < 64; n++) {\n    const ang = 2 * Math.PI * f * n;\n    re += h[n] * Math.cos(ang);\n    im -= h[n] * Math.sin(ang);\n  }\n  return Math.hypot(re, im);\n}\nconst dtft = [];\nfor (let i = 0; i <= 250; i++) dtft.push(magAt((0.5 * i) / 250));\nconst dft64 = [];\nfor (let k = 0; k <= 32; k++) dft64.push({ f: k / 64, m: magAt(k / 64) });\n\nlet osc = null, gainNode = null, lastTime = 0;\n\nfunction syncAudio() {\n  const f = lab.values.normFreq;\n  const m = magAt(f);\n  const active = lab.values.play;\n  const filtered = lab.values.applyFilter;\n  const hz = 120 + f * 3000;\n  const targetAmp = active ? (filtered ? Math.min(0.28, 0.18 * m) : 0.18) : 0;\n  if (active) {\n    const ac = lab.getAudioContext();\n    if (ac) {\n      if (ac.state === 'suspended') ac.resume();\n      if (!osc) {\n        osc = ac.createOscillator();\n        gainNode = ac.createGain();\n        osc.type = 'sine';\n        gainNode.gain.value = 0;\n        osc.connect(gainNode);\n        gainNode.connect(ac.destination);\n        osc.start();\n      }\n      osc.frequency.setTargetAtTime(hz, ac.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(targetAmp, ac.currentTime, 0.03);\n    }\n  } else if (gainNode && osc) {\n    const ac = lab.getAudioContext();\n    if (ac) gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.03);\n  }\n}\n\nfunction draw(timeSec) {\n  const f = lab.values.normFreq;\n  const m = magAt(f);\n  const filtered = lab.values.applyFilter;\n  const hz = Math.round(120 + f * 3000);\n  ctx.clearRect(0, 0, W, H);\n\n  const lx = 38, lw = 336, ly = 28, lh = 178;\n  const rx = 414, rw = 282, ry = 28, rh = 178;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = ly + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx, yy); ctx.lineTo(rx + rw, yy); ctx.stroke();\n  }\n  for (let i = 0; i <= 5; i++) {\n    const xx = rx - 0 + (lx + (lw * i) / 5 - rx);\n    const fx = lx + (lw * i) / 5;\n    ctx.beginPath(); ctx.moveTo(fx, ly); ctx.lineTo(fx, ly + lh); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('连续频率响应 |H(f)| (DTFT曲线 vs 64点DFT采样)', lx, 17);\n  ctx.fillText('时域余弦波形对比 (白虚线:输入 / 亮线:输出)', rx, 17);\n\n  ctx.textAlign = 'right';\n  ctx.fillText('1.6', lx - 4, ly + 4);\n  ctx.fillText('0.8', lx - 4, ly + lh / 2 + 4);\n  ctx.fillText('0.0', lx - 4, ly + lh);\n  ctx.textAlign = 'center';\n  for (let i = 0; i <= 5; i++) ctx.fillText((i * 0.1).toFixed(1), lx + (lw * i) / 5, ly + lh + 15);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 250; i++) {\n    const px = lx + (i / 250) * lw;\n    const py = ly + lh - (Math.min(1.6, dtft[i]) / 1.6) * lh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.45)';\n  for (let k = 0; k < dft64.length; k++) {\n    const px = lx + (dft64[k].f / 0.5) * lw;\n    const py = ly + lh - (Math.min(1.6, dft64[k].m) / 1.6) * lh;\n    ctx.beginPath(); ctx.arc(px, py, 2.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const cx = lx + (f / 0.5) * lw;\n  const cy = ly + lh - (Math.min(1.6, m) / 1.6) * lh;\n  ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(cx, ly); ctx.lineTo(cx, ly + lh); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.fill();\n\n  const midY = ry + rh / 2;\n  const ampScale = (rh / 2) * 0.65;\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.4;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  const cycles = f * 24;\n  const phase = timeSec * f * 18;\n  for (let i = 0; i <= 140; i++) {\n    const t = i / 140;\n    const px = rx + t * rw;\n    const py = midY - Math.cos(2 * Math.PI * cycles * t - phase) * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const outGain = filtered ? m : 1.0;\n  ctx.strokeStyle = filtered ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= 140; i++) {\n    const t = i / 140;\n    const px = rx + t * rw;\n    const py = midY - outGain * Math.cos(2 * Math.PI * cycles * t - phase) * ampScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const band = (f >= 0.195 && f <= 0.305) ? '通带' : ((f > 0.16 && f < 0.34) ? '过渡带' : '阻带');\n  lab.setReadout('频率 f=' + f.toFixed(3) + '（映射音频 ' + hz + ' Hz | ' + band + '）| 连续响应增益 |H(f)|=' + m.toFixed(3) + ' | 听感模式: ' + (filtered ? '滤波输出' : '原始输入'));\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw(lastTime);\n});\nlab.onLoop((dt, timeSec) => {\n  lastTime = timeSec;\n  draw(timeSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "补零（Zero-Padding）的本质是“频域插值”而非“信息增强”：它能把 DFT 采样点加密，让你看清过渡带和通带波纹的连续形状（DTFT 轮廓），但无法把原本混在一起的两个极近频率真正分开（物理分辨力仍由原始非零信号长度决定）。",
        "记住 DFT 与 DTFT 的分工：数学分析用 DTFT（把有限非周期离散信号映成连续频谱曲线）；写代码用 DFT（为了避免频点过稀漏掉细节，工程上常规做法是先对脉冲响应大幅补零至 512 点甚至更多再做变换）。",
        "离散频点之间的空白并非“没有响应”：系统的频率响应在 [0, 0.5] 上处处有定义，当实际信号频率恰好落入两个 DFT 频点缝隙中时，依然严格遵循连续 DTFT 曲线给出的增益与相移。"
      ]
    }
  ]
});
