window.__BOOK_REGISTER_SECTION__("sec_126", {
  "title": "连续非周期信号的傅里叶变换 (The Fourier Transform)",
  "intuition": "把任意一条永不重复的连续时间波形，拆解成无穷多根连续分布的正弦波与余弦波，并能直接算出模拟电路的幅频与相频响应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、连续傅里叶家族的分工与自然频率 ω",
      "paragraphs": [
        "在连续信号的世界里，傅里叶变换分为两大阵营：**周期信号**使用“傅里叶级数（Fourier Series）”，而**非周期信号**使用的才是本节的主角——**傅里叶变换（Fourier Transform）**。",
        "与离散傅里叶变换（DFT）不同，连续非周期信号的时域波形 `x(t)` 从负无穷延伸到正无穷（`-∞` 到 `+∞`），而它的实频谱 `Re X(ω)` 与虚频谱 `Im X(ω)` 各自从 `0` 延伸到正无穷（`+∞`）。频谱既可以用**直角坐标**（实部与虚部）表示，也可以转换成更符合人类直觉的**极坐标**（幅度与相位）。",
        "此外，数学家在写连续公式时，通常不喜欢直接写以赫兹（Hz）为单位的频率 `f`，而是改用小写希腊字母 `ω`（**自然频率 / 角频率**，单位是弧度每秒 rad/s）。虽然物理上只是多乘了一个 `2π`，但在积分和微分推导中能省去大量反复出现的 `2π` 符号。"
      ],
      "formula": {
        "expr": "ω = 2πf",
        "explain": "ω 为自然频率（弧度/秒，rad/s）；f 为日常使用的普通频率（周/秒，Hz）。例如 1000 Hz 对应的角频率为 2π × 1000 ≈ 6283 rad/s。"
      }
    },
    {
      "type": "concept",
      "heading": "二、综合方程（Synthesis）：用连续积分搭出时域波形",
      "paragraphs": [
        "就像离散情况一样，**综合方程**是一份“施工图纸”，告诉你如何把频域里的数据重新拼装回时域信号 `x(t)`。由于频率是连续的，离散求和符号 `Σ` 变成了连续积分符号 `∫`。",
        "用白话翻译这个公式：把无穷多根不同频率的余弦波和正弦波按比例叠加起来——**实部 `Re X(ω)`** 是余弦波的缩放权重，**虚部 `Im X(ω)`** 是正弦波的缩放权重。",
        "你可能会注意到正弦项前面有个**负号**。在纯实数范围内，这个负号并没有特殊物理意义，仅仅是为了与第 29/31 章的复数指数形式保持兼容。工程阅读时需留心：有些作者会保留这个负号，有些作者则会省去。"
      ],
      "formula": {
        "expr": "x(t) = (1 / π) ∫₀⁺∞ [ Re X(ω)·cos(ωt) - Im X(ω)·sin(ωt) ] dω",
        "explain": "x(t) 是要还原的连续时间信号；Re X(ω) 和 Im X(ω) 分别是频谱在角频率 ω 处的实部（余弦分量权重）与虚部（负正弦分量权重）；1/π 是连续积分的归一化系数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：傅里叶综合积分演示（频段截断与虚部的作用）",
      "instruction": "拖动「积分上限 f_max」观察低频截断如何导致脉冲失真；拖动「相位偏移」观察非偶对称波形如何激发出虚部频谱 Im X(ω)（粉线）。",
      "controls": [
        {
          "type": "slider",
          "id": "fMax",
          "label": "积分上限 f_max",
          "min": 20,
          "max": 150,
          "step": 2,
          "value": 150,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "f0",
          "label": "信号中心频率 f₀",
          "min": 40,
          "max": 120,
          "step": 5,
          "value": 85,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "phi",
          "label": "波形相位偏移",
          "min": -90,
          "max": 90,
          "step": 5,
          "value": -45,
          "unit": "°"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const fMax = lab.values.fMax;\n  const f0 = lab.values.f0;\n  const phiDeg = lab.values.phi;\n  const phi = phiDeg * Math.PI / 180;\n  const sigma = 0.011;\n  const w0 = 2 * Math.PI * f0;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const fx0 = 40, fy0 = 28, fw = 292, fh = 176;\n  const tx0 = 384, ty0 = 28, tw = 316, th = 176;\n  const fLimit = 150;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = fy0 + (fh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(fx0, y); ctx.lineTo(fx0 + fw, y); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(tx0, y); ctx.lineTo(tx0 + tw, y); ctx.stroke();\n  }\n  for (let f = 0; f <= fLimit; f += 30) {\n    const x = fx0 + (f / fLimit) * fw;\n    ctx.beginPath(); ctx.moveTo(x, fy0); ctx.lineTo(x, fy0 + fh); ctx.stroke();\n  }\n  for (let t = -40; t <= 40; t += 20) {\n    const x = tx0 + ((t + 40) / 80) * tw;\n    ctx.beginPath(); ctx.moveTo(x, ty0); ctx.lineTo(x, ty0 + th); ctx.stroke();\n  }\n\n  const fZeroY = fy0 + fh * 0.5;\n  const tZeroY = ty0 + th * 0.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(fx0, fZeroY); ctx.lineTo(fx0 + fw, fZeroY); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(tx0, tZeroY); ctx.lineTo(tx0 + tw, tZeroY); ctx.stroke();\n\n  const fMaxX = fx0 + (fMax / fLimit) * fw;\n  ctx.fillStyle = 'rgba(245,158,11,0.12)';\n  ctx.fillRect(fx0, fy0, fMaxX - fx0, fh);\n\n  function specRe(f) {\n    const w = 2 * Math.PI * f;\n    const gPlus = Math.exp(-0.5 * sigma * sigma * (w - w0) * (w - w0))\n                + Math.exp(-0.5 * sigma * sigma * (w + w0) * (w + w0));\n    return Math.cos(phi) * gPlus;\n  }\n  function specIm(f) {\n    const w = 2 * Math.PI * f;\n    const gMinus = Math.exp(-0.5 * sigma * sigma * (w - w0) * (w - w0))\n                 - Math.exp(-0.5 * sigma * sigma * (w + w0) * (w + w0));\n    return -Math.sin(phi) * gMinus;\n  }\n\n  const fAmp = fh * 0.42;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const x = fx0 + (i / fLimit) * fw;\n    const y = fZeroY - specRe(i) * fAmp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const x = fx0 + (i / fLimit) * fw;\n    const y = fZeroY - specIm(i) * fAmp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(fMaxX, fy0); ctx.lineTo(fMaxX, fy0 + fh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  const tAmp = th * 0.42;\n  const N = 160;\n  const df = 1.0;\n  const normCoeff = 2 * sigma * Math.sqrt(Math.PI / 2) * df;\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.38)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= N; i++) {\n    const tMs = -40 + (i / N) * 80;\n    const t = tMs / 1000;\n    const val = Math.exp(-0.5 * (t / sigma) * (t / sigma)) * Math.cos(w0 * t - phi);\n    const x = tx0 + (i / N) * tw;\n    const y = tZeroY - val * tAmp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  let sqErr = 0;\n  let sqRef = 0;\n  for (let i = 0; i <= N; i++) {\n    const tMs = -40 + (i / N) * 80;\n    const t = tMs / 1000;\n    let sum = 0;\n    for (let f = 0; f <= fMax; f += df) {\n      const w = 2 * Math.PI * f;\n      const weight = (f === 0 || f === fMax) ? 0.5 : 1.0;\n      sum += weight * (specRe(f) * Math.cos(w * t) - specIm(f) * Math.sin(w * t));\n    }\n    const synth = sum * normCoeff;\n    const ideal = Math.exp(-0.5 * (t / sigma) * (t / sigma)) * Math.cos(w0 * t - phi);\n    sqErr += (synth - ideal) * (synth - ideal);\n    sqRef += ideal * ideal;\n    const x = tx0 + (i / N) * tw;\n    const y = tZeroY - synth * tAmp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('频域：Re X(ω) [蓝]  Im X(ω) [粉]  积分范围 [黄]', fx0, 17);\n  ctx.fillText('时域：理想 x(t) [虚线]  vs  积分综合结果 [绿]', tx0, 17);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText('0 Hz', fx0, fy0 + fh + 14);\n  ctx.fillText('150 Hz', fx0 + fw - 38, fy0 + fh + 14);\n  ctx.fillText('-40ms', tx0, ty0 + th + 14);\n  ctx.fillText('0', tx0 + tw / 2 - 3, ty0 + th + 14);\n  ctx.fillText('+40ms', tx0 + tw - 34, ty0 + th + 14);\n\n  const rmsePct = sqRef > 0 ? (Math.sqrt(sqErr / sqRef) * 100).toFixed(1) : '0.0';\n  lab.setReadout('中心频率 f₀=' + f0 + ' Hz | 相位偏移=' + phiDeg + '° | 积分上限 f_max=' + fMax + ' Hz | 时域重构误差=' + rmsePct + '%');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、分析方程（Analysis）与 RC 低通滤波器实战",
      "paragraphs": [
        "反过来，已知连续时域信号 `x(t)`，如何求它的频谱？连续**分析方程**的策略与离散情况完全一致：**相关性（Correlation）**。把信号 `x(t)` 分别乘以标准的余弦波 `cos(ωt)` 和负正弦波 `-sin(ωt)`，再从 `-∞` 到 `+∞` 做积分，就能测出它在每个频率上的含量。",
        "书中以经典的 **RC 低通滤波器** 为例演示了分析方程的威力。它的冲激响应是一个单边衰减指数：`h(t) = α·e^(-αt)`（`t ≥ 0`），而 `t < 0` 时为 `0`。将它代入实部与虚部积分公式并求定积分后，可以直接解出它的频域表达式：`Re H(ω) = α² / (α² + ω²)` 和 `Im H(ω) = -ωα / (α² + ω²)`。"
      ],
      "formula": {
        "expr": "Re X(ω) = ∫₋∞⁺∞ x(t)cos(ωt)dt ,   Im X(ω) = -∫₋∞⁺∞ x(t)sin(ωt)dt",
        "explain": "将时域信号 x(t) 分别与频率为 ω 的余弦波和负正弦波在全时间轴上求相关积分，即可提取出频谱的实部 Re X(ω) 与虚部 Im X(ω)。"
      }
    },
    {
      "type": "concept",
      "heading": "四、从直角坐标转极坐标：看懂幅频与相频特性",
      "paragraphs": [
        "虽然直角坐标（`Re` 与 `Im`）在积分代数运算时非常顺手，但人类很难直接从 `α²/(α²+ω²)` 和 `-ωα/(α²+ω²)` 看出滤波器到底放行了哪些频率、延迟了多少相位。",
        "只要用标准直角转极坐标公式 `Mag = [Re² + Im²]^(1/2)` 与 `Phase = arctan(Im / Re)`（注：原书第 254 页底部此处印刷笔误写成了 `arctan[Re/Im]`，但第 255 页推导结果正确给出了 `arctan(-ω/α)`）化简，就能得到极简且直观的**幅频响应**与**相频响应**。",
        "当输入频率恰好等于截止频率（`ω = α`，即 `f = f_c`）时，幅度刚好衰减到 `1/√2 ≈ 0.707`（即工程常说的 -3 dB 点），同时相位滞后达到 `-π/4` 弧度（`-45°`）；随着频率趋向无穷大，幅度趋近于 `0`，相位滞后趋近于 `-π/2`（`-90°`）。"
      ],
      "formula": {
        "expr": "Mag H(ω) = α / √(α² + ω²) ,   Phase H(ω) = arctan(-ω / α)",
        "explain": "α = 2πf_c 是由电阻电容决定的截止角频率常数（例如截止频率 1000 Hz 时 α = 2π×1000）。Mag H(ω) 表示信号幅度被缩放的比例，Phase H(ω) 表示相位偏移（弧度）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：RC 低通滤波器幅频/相频曲线与实时滤波听感（图 13-9 复现）",
      "instruction": "点击播放 180 Hz 锯齿波（含丰富高频谐波），拖动「截止频率 f_c」观察曲线变化与绿柱代表的谐波衰减，并可切换「旁路直通」实时对比滤除高频后的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 f_c",
          "min": 200,
          "max": 4000,
          "step": 50,
          "value": 1000,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路直通（对比未滤波原声）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet audioOsc = null;\nlet audioGain = null;\nlet isPlaying = false;\n\nfunction buildWave(actx, fc, bypass) {\n  const maxH = 30;\n  const f0 = 180;\n  const real = new Float32Array(maxH + 1);\n  const imag = new Float32Array(maxH + 1);\n  const alpha = 2 * Math.PI * fc;\n  for (let k = 1; k <= maxH; k++) {\n    const ak = 1 / k;\n    if (bypass) {\n      real[k] = 0;\n      imag[k] = ak;\n    } else {\n      const w = 2 * Math.PI * (k * f0);\n      const denom = alpha * alpha + w * w;\n      const reH = (alpha * alpha) / denom;\n      const imH = (-w * alpha) / denom;\n      real[k] = ak * imH;\n      imag[k] = ak * reH;\n    }\n  }\n  return actx.createPeriodicWave(real, imag, { disableNormalization: true });\n}\n\nfunction syncAudio() {\n  const wantPlay = !!lab.values.play;\n  const fc = lab.values.fc;\n  const bypass = !!lab.values.bypass;\n\n  if (wantPlay) {\n    const actx = lab.getAudioContext();\n    if (!actx || actx.state === 'closed') return;\n    if (actx.state === 'suspended') actx.resume();\n    const wave = buildWave(actx, fc, bypass);\n    if (!isPlaying) {\n      audioOsc = actx.createOscillator();\n      audioGain = actx.createGain();\n      audioOsc.frequency.value = 180;\n      audioGain.gain.value = 0.16;\n      audioOsc.setPeriodicWave(wave);\n      audioOsc.connect(audioGain);\n      audioGain.connect(actx.destination);\n      audioOsc.start();\n      isPlaying = true;\n    } else if (audioOsc) {\n      audioOsc.setPeriodicWave(wave);\n    }\n  } else if (isPlaying) {\n    try {\n      if (audioOsc) { audioOsc.stop(); audioOsc.disconnect(); }\n      if (audioGain) { audioGain.disconnect(); }\n    } catch (e) {}\n    audioOsc = null;\n    audioGain = null;\n    isPlaying = false;\n  }\n}\n\nfunction draw() {\n  const fc = lab.values.fc;\n  const bypass = !!lab.values.bypass;\n  const alpha = 2 * Math.PI * fc;\n  const maxF = 6000;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const mx0 = 44, my0 = 28, mw = 294, mh = 176;\n  const px0 = 398, py0 = 28, pw = 294, ph = 176;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 6; i++) {\n    const y = my0 + (mh * i) / 6;\n    ctx.beginPath(); ctx.moveTo(mx0, y); ctx.lineTo(mx0 + mw, y); ctx.stroke();\n  }\n  for (let i = 0; i <= 5; i++) {\n    const y = py0 + (ph * i) / 5;\n    ctx.beginPath(); ctx.moveTo(px0, y); ctx.lineTo(px0 + pw, y); ctx.stroke();\n  }\n  for (let f = 0; f <= maxF; f += 1000) {\n    const xm = mx0 + (f / maxF) * mw;\n    const xp = px0 + (f / maxF) * pw;\n    ctx.beginPath(); ctx.moveTo(xm, my0); ctx.lineTo(xm, my0 + mh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(xp, py0); ctx.lineTo(xp, py0 + ph); ctx.stroke();\n  }\n\n  // Zero phase line (top is +0.4, bottom is -1.6, span 2.0)\n  const pZeroY = py0 + (0.4 / 2.0) * ph;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(px0, pZeroY); ctx.lineTo(px0 + pw, pZeroY); ctx.stroke();\n\n  // Draw sawtooth harmonic bars on Magnitude plot\n  const f0 = 180;\n  for (let k = 1; k <= 32; k++) {\n    const fk = k * f0;\n    if (fk > maxF) break;\n    const x = mx0 + (fk / maxF) * mw;\n    const ak = 1 / k;\n    const w = 2 * Math.PI * fk;\n    const mag = bypass ? 1.0 : alpha / Math.sqrt(alpha * alpha + w * w);\n    const yIn = my0 + ((1.2 - ak) / 1.2) * mh;\n    const yOut = my0 + ((1.2 - ak * mag) / 1.2) * mh;\n    const yBase = my0 + mh;\n\n    ctx.strokeStyle = 'rgba(248,250,252,0.18)';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(x, yBase); ctx.lineTo(x, yIn); ctx.stroke();\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath(); ctx.moveTo(x, yBase); ctx.lineTo(x, yOut); ctx.stroke();\n  }\n\n  // Magnitude Curve\n  ctx.strokeStyle = bypass ? 'rgba(56,189,248,0.35)' : '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const f = (i / 150) * maxF;\n    const w = 2 * Math.PI * f;\n    const mag = alpha / Math.sqrt(alpha * alpha + w * w);\n    const x = mx0 + (f / maxF) * mw;\n    const y = my0 + ((1.2 - mag) / 1.2) * mh;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Phase Curve\n  ctx.strokeStyle = bypass ? 'rgba(236,72,153,0.35)' : '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= 150; i++) {\n    const f = (i / 150) * maxF;\n    const w = 2 * Math.PI * f;\n    const phVal = Math.atan(-w / alpha);\n    const x = px0 + (f / maxF) * pw;\n    const y = py0 + ((0.4 - phVal) / 2.0) * ph;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Cutoff frequency markers\n  const fcXm = mx0 + (fc / maxF) * mw;\n  const fcYm = my0 + ((1.2 - 0.7071) / 1.2) * mh;\n  const fcXp = px0 + (fc / maxF) * pw;\n  const fcYp = py0 + ((0.4 - (-Math.PI / 4)) / 2.0) * ph;\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.3;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(fcXm, my0); ctx.lineTo(fcXm, my0 + mh); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(mx0, fcYm); ctx.lineTo(fcXm, fcYm); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(fcXp, py0); ctx.lineTo(fcXp, py0 + ph); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(px0, fcYp); ctx.lineTo(fcXp, fcYp); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(fcXm, fcYm, 4, 0, Math.PI * 2); ctx.fill();\n  ctx.beginPath(); ctx.arc(fcXp, fcYp, 4, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('a. 幅频响应 Mag H(f) [蓝] & 输出谐波 [绿]', mx0, 17);\n  ctx.fillText('b. 相频响应 Phase H(f) (rad) [粉]', px0, 17);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText('1.2', 14, my0 + 6);\n  ctx.fillText('0.7', 14, fcYm + 4);\n  ctx.fillText('0.0', 14, my0 + mh);\n  ctx.fillText('0 Hz', mx0, my0 + mh + 14);\n  ctx.fillText('6000 Hz', mx0 + mw - 44, my0 + mh + 14);\n\n  ctx.fillText('+0.4', 362, py0 + 6);\n  ctx.fillText('0.0', 368, pZeroY + 4);\n  ctx.fillText('-1.6', 362, py0 + ph);\n  ctx.fillText('0 Hz', px0, py0 + ph + 14);\n  ctx.fillText('6000 Hz', px0 + pw - 44, py0 + ph + 14);\n\n  const modeStr = bypass ? '旁路直通 (原声)' : 'RC 低通滤波生效';\n  lab.setReadout('状态=' + modeStr + ' | f_c=' + fc + ' Hz (α=' + Math.round(alpha) + ' rad/s) | 截止点幅度=0.707 (-3dB), 相位=-0.785 rad (-45°)');\n}\n\nlab.onUpdate(() => {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（单位混淆）：代入 `Re H(ω)` 或 `Mag H(ω)` 公式前，务必先做 `ω = 2πf` 换算！直接把赫兹数当成 `ω` 是连续系统计算中最常见的低级错误。",
        "避坑 2（负号约定）：不同教材与库对虚部 `Im X(ω)` 的负号约定可能相反，推导或对接外部公式时先核对综合方程正弦项前的符号。",
        "直觉 3（计算工具选择）：如果工程上只想要一条输出波形图而不需要解析公式，优先用离散采样 + 计算机数值计算来近似连续问题；解析傅里叶变换更适合推导 RC 滤波器这类闭式频响公式。",
        "直觉 4（直角 vs 极坐标）：推导微积分时用直角坐标 `(Re, Im)`，判断电路滤波能力与延迟时必须转成极坐标 `(Mag, Phase)`，记住 `f = f_c` 对应幅度 `0.707` 与相位 `-45°`。"
      ]
    }
  ]
});
