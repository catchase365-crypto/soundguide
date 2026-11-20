window.__BOOK_REGISTER_SECTION__("sec_111", {
  "title": "离散时间傅里叶变换 (The Discrete Time Fourier Transform, DTFT)",
  "intuition": "把有限长信号的补零长度推向无穷大，DFT 原本孤立的频域采样点就会密集成一条无缝连续的曲线——这就是专门用于数学公式推导的 DTFT。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从 DFT 到 DTFT：补零与“无穷大”的极限魔法",
      "paragraphs": [
        "**离散时间傅里叶变换 (DTFT)** 是傅里叶家族中专门处理 **非周期、离散信号 (aperiodic, discrete)** 的成员。理解它最快的方式，就是顺着 **DFT（离散傅里叶变换）** 的思路往下推演。",
        "假设你采集了一段长度为 `N` 的离散信号。通过 DFT，它可以被分解为 `N/2 + 1` 个正弦和余弦波，频率等间距地分布在 `0`（直流）到采样率的一半（奈奎斯特频率）之间。",
        "还记得上一章提到的**补零 (Zero-padding)** 吗？在时域信号后面不断补 `0`，相当于把时域的周期拉长了；而在频域里，各个频率采样点之间的间隔却变得越来越窄。如果我们让 `N` 趋近于**无穷大**，时域信号就彻底摆脱了周期性（变成非周期离散信号），而频域采样点则密集成了一条**周期性、连续**的频谱曲线——这就是 DTFT！",
        "（注：原书公式 10-1 左侧图注中曾笔误写为 `n` 从 `0` 到 `N-1`，但公式本身已明确写出求和上下限为 `-∞` 到 `+∞`，涵盖整个无限长非周期时间轴。）"
      ],
      "formula": {
        "expr": "Re X(ω) = Σ_{n=-∞}^{+∞} x[n] cos(ωn)   |   Im X(ω) = - Σ_{n=-∞}^{+∞} x[n] sin(ωn)",
        "explain": "DTFT 分析方程 (Eq. 10-1)：x[n] 是无限长非周期离散时域信号；ω 是 0 到 π 之间的连续自然频率；Re X(ω) 和 Im X(ω) 分别是连续频谱的实部与虚部。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：亲眼见证补零如何把离散 DFT“密集成”连续 DTFT",
      "instruction": "保持脉冲宽度 L 不变，向右拖动「补零总长 N」滑块，观察上方时域补零变长时，下方琥珀色 DFT 采样点如何越变越密，最终贴合绿色的连续 DTFT 曲线。",
      "controls": [
        {
          "type": "slider",
          "id": "pulseLen",
          "label": "有效脉冲宽度 L",
          "min": 2,
          "max": 16,
          "step": 1,
          "value": 5,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "totalN",
          "label": "补零后总长度 N",
          "min": 16,
          "max": 256,
          "step": 16,
          "value": 16,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showDTFT",
          "label": "叠加连续 DTFT 理论曲线",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const L = lab.values.pulseLen;\n  const N = lab.values.totalN;\n  const showDTFT = lab.values.showDTFT;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const tx = 48, ty = 12, tw = 648, th = 54;\n  ctx.fillStyle = \"rgba(255,255,255,0.03)\";\n  ctx.fillRect(tx, ty, tw, th);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  ctx.strokeRect(tx, ty, tw, th);\n\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"时域信号 x[n] (固定视野 0~255 点，直观对比有效信号 L 与补零总长 N)\", tx + 8, ty + 14);\n\n  const baseY = ty + th - 10;\n  ctx.strokeStyle = \"rgba(255,255,255,0.12)\";\n  ctx.beginPath();\n  ctx.moveTo(tx + 8, baseY);\n  ctx.lineTo(tx + tw - 8, baseY);\n  ctx.stroke();\n\n  const stepX = (tw - 20) / 256;\n  for (let n = 0; n < N; n++) {\n    const px = tx + 10 + n * stepX;\n    if (n < L) {\n      ctx.strokeStyle = \"#38bdf8\";\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(px, baseY);\n      ctx.lineTo(px, baseY - 22);\n      ctx.stroke();\n      ctx.fillStyle = \"#38bdf8\";\n      ctx.beginPath();\n      ctx.arc(px, baseY - 22, 2.2, 0, Math.PI * 2);\n      ctx.fill();\n    } else if (n % 2 === 0 || N <= 64) {\n      ctx.fillStyle = \"rgba(148,163,184,0.45)\";\n      ctx.beginPath();\n      ctx.arc(px, baseY, 1.4, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  const nEndX = tx + 10 + (N - 1) * stepX;\n  ctx.strokeStyle = \"rgba(245,158,11,0.65)\";\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(nEndX, ty + 18);\n  ctx.lineTo(nEndX, baseY + 4);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.textAlign = N > 220 ? \"right\" : \"left\";\n  ctx.fillText(\"N=\" + N, N > 220 ? nEndX - 4 : nEndX + 4, ty + 28);\n\n  const fx = 48, fy = 78, fw = 648, fh = 136;\n  ctx.fillStyle = \"rgba(255,255,255,0.03)\";\n  ctx.fillRect(fx, fy, fw, fh);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = fx + (fw * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(gx, fy);\n    ctx.lineTo(gx, fy + fh);\n    ctx.stroke();\n    const gy = fy + (fh * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(fx, gy);\n    ctx.lineTo(fx + fw, gy);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = \"center\";\n  const omegaLabels = [\"0 (DC)\", \"π/4\", \"π/2\", \"3π/4\", \"π (fs/2)\"];\n  for (let i = 0; i <= 4; i++) {\n    ctx.fillText(omegaLabels[i], fx + (fw * i) / 4, fy + fh + 14);\n  }\n  ctx.textAlign = \"right\";\n  ctx.fillText(String(L), fx - 6, fy + 11);\n  ctx.fillText(\"0\", fx - 6, fy + fh);\n\n  function dtftMag(w) {\n    if (w < 1e-5) return L;\n    return Math.abs(Math.sin((w * L) / 2) / Math.sin(w / 2));\n  }\n\n  const maxY = L * 1.08;\n  function mapY(v) {\n    return fy + fh - (v / maxY) * (fh - 8);\n  }\n\n  if (showDTFT) {\n    ctx.strokeStyle = \"#10b981\";\n    ctx.lineWidth = 2.2;\n    ctx.beginPath();\n    const steps = 320;\n    for (let i = 0; i <= steps; i++) {\n      const w = (Math.PI * i) / steps;\n      const px = fx + (fw * i) / steps;\n      const py = mapY(dtftMag(w));\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const halfN = Math.floor(N / 2);\n  for (let k = 0; k <= halfN; k++) {\n    const w = (2 * Math.PI * k) / N;\n    const px = fx + (w / Math.PI) * fw;\n    const py = mapY(dtftMag(w));\n    ctx.strokeStyle = \"rgba(245,158,11,0.55)\";\n    ctx.lineWidth = N > 128 ? 1 : 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, fy + fh);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.beginPath();\n    ctx.arc(px, py, N > 128 ? 2.1 : 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.textAlign = \"right\";\n  ctx.font = \"11px sans-serif\";\n  if (showDTFT) {\n    ctx.fillStyle = \"#10b981\";\n    ctx.fillText(\"━ 连续 DTFT |X(ω)| (N→∞)\", fx + fw - 8, fy + 16);\n  }\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.fillText(\"● 离散 DFT 采样点 (\" + (halfN + 1) + \" 点)\", fx + fw - 8, fy + 32);\n\n  lab.setReadout(\n    \"脉冲宽度 L=\" + L + \" | 补零总长 N=\" + N +\n    \" | 频域采样数=\" + (halfN + 1) +\n    \" | 频率间距 Δω=\" + ((2 * Math.PI) / N).toFixed(4) + \" rad\"\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "符号细节、自然频率 ω 与 1/π 归一化之谜",
      "paragraphs": [
        "仔细对比 DTFT 与 DFT 的公式，你会发现几个非常讲究的数学细节：首先，时域信号 `x[n]` 依然是离散的，所以保留**方括号** `[]`；而频域信号 `Re X(ω)` 和 `Im X(ω)` 已经变成连续函数了，因此改用**圆括号** `()`。同样因为频域连续了，逆变换（综合方程）必须从“求和 `Σ`”升级为“积分 `∫`”。",
        "其次，频域横坐标通常采用自然频率 `ω`（范围 `0` 到 `π`，对应直流到采样率的一半 `f = 0 ~ 0.5`）。之所以偏爱 `ω` 而不是 `f`，是因为它能消掉公式里无处不在的 `2π` 因子。顺便一提，很多其他教材在 DTFT 中喜欢用大写的 `Ω` 来表示这个频率，读文献时别被符号吓到。",
        "第三，在计算逆 DFT 时，首尾两点（下标 `0` 和 `N/2`）必须先除以 `2`（因为频谱密度在端点处的特殊权重）。但在 DTFT 中频谱完全连续，端点的特殊待遇随之消失了！同时，DFT 逆变换里的归一化系数 `2/N` 在 DTFT 中变成了 `1/π`。只要保证“正变换 → 逆变换”走完一圈刚好乘过一次 `1/π`，信号就能完好复原——本书把它放在了综合方程前面，也有的教材放在分析方程前面，甚至各放一个 `1/√π`。"
      ],
      "formula": {
        "expr": "x[n] = (1/π) ∫_0^π [ Re X(ω) cos(ωn) - Im X(ω) sin(ωn) ] dω",
        "explain": "DTFT 综合方程 (Eq. 10-2)：把 0 到 π 上无穷多个连续频率的余弦和正弦分量按面积积分叠加起来，乘以 1/π 归一化因子，精确重建出离散时刻 n 的信号值 x[n]。"
      }
    },
    {
      "type": "concept",
      "heading": "既然计算机算不了 DTFT，它到底有什么用？",
      "paragraphs": [
        "因为 DTFT 包含**无穷级数求和**和**连续积分**，数字计算机根本无法直接运行它。那么在数字信号处理中，DTFT 和 DFT 是如何分工的呢？",
        "答案取决于你手里拿的是**“一串数字”**还是**“一个公式”**：如果你通过实验测量或仿真得到了系统冲激响应的一组**离散数组**，那就把数组喂给计算机跑 **DFT**，得到另一组等间隔采样的频响数组。",
        "但如果你手里拿的是一个**解析数学公式**——比如理想的 `sinc` 函数，或者一个**指数衰减正弦波** `x[n] = r^n cos(ω₀n)`——此时利用 DTFT 可以通过纸笔代数推导，直接算出频率响应的**精确连续解析方程**，看清 `0` 到 `0.5` 采样率之间的每一处细节（比如精确的峰值高度和带宽），而 DFT 在这种情况下只能给出稀疏的离散采样点，甚至可能刚好“跨过”真正的谐振峰！"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：公式推导 vs 离散采样——指数衰减正弦波的 DTFT 与听感",
      "instruction": "调节衰减因子 r 与中心频率 ω₀，观察解析 DTFT 如何精准勾勒出连续谐振峰（而低点数 DFT 可能漏掉峰顶）；点击播放按钮还能听出窄峰（长余音）与宽峰（闷响）的听觉差异。",
      "controls": [
        {
          "type": "slider",
          "id": "w0",
          "label": "中心自然频率 ω₀",
          "min": 0.2,
          "max": 2.8,
          "step": 0.05,
          "value": 1.05,
          "unit": " rad"
        },
        {
          "type": "slider",
          "id": "r",
          "label": "衰减因子 r (越大衰减越慢)",
          "min": 0.5,
          "max": 0.96,
          "step": 0.02,
          "value": 0.86,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "dftN",
          "label": "对比用截断 DFT 点数 N",
          "min": 8,
          "max": 64,
          "step": 8,
          "value": 16,
          "unit": " 点"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听衰减脉冲声",
          "activeLabel": "⏸ 停止声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet audioCtx = null;\nlet osc = null;\nlet gainNode = null;\nlet wasPlaying = false;\nlet lastPluckTime = -10;\n\nfunction mapAudioFreq(w0) {\n  return 180 + (w0 / Math.PI) * 980;\n}\n\nfunction triggerPluck() {\n  if (!audioCtx || !gainNode || !osc || audioCtx.state !== \"running\") return;\n  const now = audioCtx.currentTime;\n  const r = lab.values.r;\n  const f = mapAudioFreq(lab.values.w0);\n  osc.frequency.setValueAtTime(f, now);\n  const decaySec = 0.04 + Math.pow((r - 0.48) / 0.50, 2) * 0.55;\n  gainNode.gain.cancelScheduledValues(now);\n  gainNode.gain.setValueAtTime(0.0001, now);\n  gainNode.gain.linearRampToValueAtTime(0.22, now + 0.008);\n  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.008 + decaySec);\n  gainNode.gain.setValueAtTime(0, now + 0.012 + decaySec);\n}\n\nfunction handleAudio() {\n  const wantPlay = !!lab.values.play;\n  try {\n    if (wantPlay && !wasPlaying) {\n      if (!audioCtx) {\n        audioCtx = lab.getAudioContext();\n        if (audioCtx) {\n          osc = audioCtx.createOscillator();\n          gainNode = audioCtx.createGain();\n          osc.type = \"sine\";\n          gainNode.gain.setValueAtTime(0, audioCtx.currentTime);\n          osc.connect(gainNode);\n          gainNode.connect(audioCtx.destination);\n          osc.start();\n        }\n      }\n      wasPlaying = true;\n      lastPluckTime = -10;\n      if (audioCtx) {\n        if (audioCtx.state === \"suspended\") {\n          audioCtx.resume().then(() => { if (lab.values.play) triggerPluck(); });\n        } else {\n          triggerPluck();\n        }\n      }\n    } else if (!wantPlay && wasPlaying) {\n      wasPlaying = false;\n      if (audioCtx && gainNode) {\n        const now = audioCtx.currentTime;\n        gainNode.gain.cancelScheduledValues(now);\n        gainNode.gain.setValueAtTime(0, now);\n      }\n    } else if (wantPlay && wasPlaying && audioCtx && osc) {\n      osc.frequency.setTargetAtTime(mapAudioFreq(lab.values.w0), audioCtx.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nfunction dtftComplexMag(w, w0, r) {\n  const t1 = w - w0;\n  const a1 = 1 - r * Math.cos(t1);\n  const b1 = r * Math.sin(t1);\n  const d1 = a1 * a1 + b1 * b1;\n\n  const t2 = w + w0;\n  const a2 = 1 - r * Math.cos(t2);\n  const b2 = r * Math.sin(t2);\n  const d2 = a2 * a2 + b2 * b2;\n\n  const re = 0.5 * (a1 / d1 + a2 / d2);\n  const im = -0.5 * (b1 / d1 + b2 / d2);\n  return Math.sqrt(re * re + im * im);\n}\n\nfunction dftTruncMag(w, w0, r, N) {\n  let re = 0, im = 0;\n  for (let n = 0; n < N; n++) {\n    const x = Math.pow(r, n) * Math.cos(w0 * n);\n    re += x * Math.cos(w * n);\n    im -= x * Math.sin(w * n);\n  }\n  return Math.sqrt(re * re + im * im);\n}\n\nfunction draw() {\n  handleAudio();\n\n  const w0 = lab.values.w0;\n  const r = lab.values.r;\n  const dftN = lab.values.dftN;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Left panel: time domain x[n] = r^n cos(w0 n)\n  const tx = 20, ty = 22, tw = 228, th = 186;\n  ctx.fillStyle = \"rgba(255,255,255,0.03)\";\n  ctx.fillRect(tx, ty, tw, th);\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  ctx.strokeRect(tx, ty, tw, th);\n\n  const midY = ty + th / 2 + 6;\n  ctx.strokeStyle = \"rgba(255,255,255,0.14)\";\n  ctx.beginPath();\n  ctx.moveTo(tx + 8, midY);\n  ctx.lineTo(tx + tw - 8, midY);\n  ctx.stroke();\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = \"left\";\n  ctx.fillText(\"时域公式: x[n] = rⁿ cos(ω₀n)\", tx + 8, ty + 16);\n\n  const showN = 28;\n  const dx = (tw - 20) / (showN - 1);\n  const amp = th * 0.36;\n  for (let n = 0; n < showN; n++) {\n    const val = Math.pow(r, n) * Math.cos(w0 * n);\n    const px = tx + 10 + n * dx;\n    const py = midY - val * amp;\n    ctx.strokeStyle = \"rgba(56,189,248,0.6)\";\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, midY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = \"#38bdf8\";\n    ctx.beginPath();\n    ctx.arc(px, py, 2.4, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.textAlign = \"center\";\n  ctx.fillText(\"n = 0 ... 27 (向右延伸至 ∞)\", tx + tw / 2, ty + th + 15);\n\n  // Right panel: continuous DTFT vs discrete DFT\n  const fx = 286, fy = 22, fw = 414, fh = 186;\n  ctx.fillStyle = \"rgba(255,255,255,0.03)\";\n  ctx.fillRect(fx, fy, fw, fh);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = fx + (fw * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(gx, fy);\n    ctx.lineTo(gx, fy + fh);\n    ctx.stroke();\n    const gy = fy + (fh * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(fx, gy);\n    ctx.lineTo(fx + fw, gy);\n    ctx.stroke();\n  }\n\n  const steps = 280;\n  const dtftVals = [];\n  let maxVal = 1.2;\n  for (let i = 0; i <= steps; i++) {\n    const w = (Math.PI * i) / steps;\n    const m = dtftComplexMag(w, w0, r);\n    dtftVals.push(m);\n    if (m > maxVal) maxVal = m;\n  }\n\n  const halfN = Math.floor(dftN / 2);\n  const dftPts = [];\n  let dftPeak = 0;\n  for (let k = 0; k <= halfN; k++) {\n    const w = (2 * Math.PI * k) / dftN;\n    const m = dftTruncMag(w, w0, r, dftN);\n    dftPts.push({ w, m });\n    if (m > dftPeak) dftPeak = m;\n    if (m > maxVal) maxVal = m;\n  }\n  const truePeak = dtftComplexMag(w0, w0, r);\n  const maxY = maxVal * 1.12;\n\n  function mapY(v) {\n    return fy + fh - (v / maxY) * (fh - 12);\n  }\n\n  // w0 vertical guide\n  const w0x = fx + (w0 / Math.PI) * fw;\n  ctx.strokeStyle = \"rgba(236,72,153,0.55)\";\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(w0x, fy);\n  ctx.lineTo(w0x, fy + fh);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = \"#ec4899\";\n  ctx.font = \"11px sans-serif\";\n  ctx.textAlign = w0 > 2.4 ? \"right\" : \"left\";\n  ctx.fillText(\"ω₀=\" + w0.toFixed(2), w0 > 2.4 ? w0x - 4 : w0x + 4, fy + 14);\n\n  // Continuous DTFT curve\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const px = fx + (fw * i) / steps;\n    const py = mapY(dtftVals[i]);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // DFT stems\n  for (let k = 0; k < dftPts.length; k++) {\n    const px = fx + (dftPts[k].w / Math.PI) * fw;\n    const py = mapY(dftPts[k].m);\n    ctx.strokeStyle = \"rgba(245,158,11,0.55)\";\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    ctx.moveTo(px, fy + fh);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.beginPath();\n    ctx.arc(px, py, 3.3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  // Axis labels & legend\n  ctx.fillStyle = \"#94a3b8\";\n  ctx.textAlign = \"center\";\n  const labels = [\"0\", \"π/4\", \"π/2\", \"3π/4\", \"π\"];\n  for (let i = 0; i <= 4; i++) {\n    ctx.fillText(labels[i], fx + (fw * i) / 4, fy + fh + 15);\n  }\n  ctx.textAlign = \"right\";\n  ctx.fillText(maxY.toFixed(1), fx - 5, fy + 10);\n  ctx.fillText(\"0\", fx - 5, fy + fh);\n\n  ctx.fillStyle = \"#10b981\";\n  ctx.fillText(\"━ 解析 DTFT 连续谱\", fx + fw - 8, fy + 15);\n  ctx.fillStyle = \"#f59e0b\";\n  ctx.fillText(\"● \" + dftN + \" 点截断 DFT 采样\", fx + fw - 8, fy + 31);\n\n  lab.setReadout(\n    \"DTFT 理论峰值=\" + truePeak.toFixed(2) +\n    \" | \" + dftN + \" 点 DFT 捕捉到的最高采样=\" + dftPeak.toFixed(2) +\n    \" | 试听频率≈\" + Math.round(mapAudioFreq(w0)) + \" Hz\"\n  );\n}\n\nlab.onUpdate(draw);\n\nlab.onLoop((dt, timeSec) => {\n  if (lab.values.play && audioCtx) {\n    if (lastPluckTime < 0) lastPluckTime = timeSec;\n    if (timeSec - lastPluckTime >= 0.85) {\n      lastPluckTime = timeSec;\n      triggerPluck();\n    }\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【极限视角记清楚】DTFT 就是令 DFT 的补零总点数 N → ∞：时域从周期变为非周期离散（用方括号 x[n]），频域从离散点变为 0~π 的连续周期曲线（用圆括号 X(ω)）。",
        "【端点与归一化别混淆】逆 DFT 需要把 0 和 N/2 点除以 2，DTFT 因为频谱连续不再需要特殊处理端点；原本的 2/N 系数在 DTFT 综合方程中变成 1/π。",
        "【写代码 vs 做推导的分工】拿到测量数组跑代码算频谱，请用 DFT/FFT；拿到数学解析公式想推导出连续频响曲线、算清带宽与精确峰值，请用 DTFT。"
      ]
    }
  ]
});
