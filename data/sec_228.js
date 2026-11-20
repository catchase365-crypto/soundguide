window.__BOOK_REGISTER_SECTION__("sec_228", {
  "title": "s 域滤波器设计：从极零点到 Sallen-Key 电路 (Filter Design in the s-Domain)",
  "intuition": "把复杂的高阶滤波器拆解成一个个二阶（Biquad）积木，先在 s 平面上用几何图案摆好极点与零点（决定频率响应），再用运放与阻容电路把这些坐标精准地‘焊’出来。",
  "blocks": [
    {
      "type": "concept",
      "heading": "分治策略：用双二阶（Biquad）搭建任意阶滤波器",
      "paragraphs": [
        "拉普拉斯变换最强大的工程应用，就是**直接在 s 域设计系统**。整个过程分为截然不同的两步：第一步是纯数学问题——在 s 平面上决定需要多少个**极点（Poles）**和**零点（Zeros）**，以及把它们摆在哪里，才能获得最理想的频率响应；第二步则更像一门电路艺术——找到一套实际的电阻、电容与运放拓扑，使电路的传递函数恰好对应这组极零点。",
        "直接求解或搭建包含超过两个极点、两个零点的高阶电路极为困难。工程上的通用解法是**分而治之（级联）**：将高阶系统拆成若干个独立的小级依次串联，每一级最多只负责 **2 个极点和 2 个零点**。因为每一级在 s 域都可以写成“二次多项式分子除以二次多项式分母”的形式，这种基本模块被称为**双二阶滤波器（Biquad）**。",
        "每增加一个双二阶级，系统就多出 2 个极点，因此所有**偶数阶滤波器**（2 阶、4 阶、6 阶等）都能直接用若干个 Biquad 串联而成。那**奇数阶滤波器**（1 阶、3 阶、5 阶等）怎么办？奇数阶必然有一个孤零零的极点落在负实轴上——这是 Biquad 无法单独提供的，解决办法极其简单：在级联链条的末尾额外串接一个**普通的无源 RC 低通电路**即可。例如，一个 9 阶滤波器只需 5 级：4 个 Sallen-Key 双二阶级 + 1 个单阻容 RC 电路。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "Sallen-Key 电路：阻容对称与增益操控极点轨迹",
      "paragraphs": [
        "本书第 3 章使用的经典 Biquad 电路叫做 **Sallen-Key 电路**（由 R.P. Sallen 和 E.L. Key 于 1950 年代提出）。它最常见的高性价比结构只需要：**两个阻值相等的电阻 `R`、两个容值相等的电容 `C`，以及一个同相放大倍数 `A` 介于 1 到 3 之间的运放**。",
        "通过电路分析求解其两个极点在 s 平面上的坐标 `σ ± jω`，会得到一个极其优雅的几何规律：无论放大倍数 `A` 如何变化，只要 `1 ≤ A ≤ 3`，这两个极点就永远落在以原点为圆心、半径为 **`1/(RC)`** 的圆周上！而这个圆与虚轴 `jω` 的交点 `ω₀ = 1/(RC)`，正是电路的特征截止角频率（-3 dB 点附近）。",
        "放大倍数 `A` 就像一只拨动极点的手：`A = 1` 时，两个极点重合在负实轴上，过渡平缓；`A = 1.586` 时，极点正好来到 45° 角位置，频响曲线在通带内达到最平坦（即 2 阶巴特沃斯响应）；继续增大 `A`（例如 `A = 2.5`），极点逼近虚轴，截止频率处开始鼓起尖锐的**谐振峰（Peaking）**；当 `A = 3.0` 时，极点彻底撞上虚轴，峰值理论趋于无穷大，电路不再是滤波器，而变成了一台**正弦波振荡器**；若 `A > 3`，极点冲入右半平面（RHP），系统发生**自激失稳**。"
      ],
      "formula": {
        "expr": "σ = (A - 3) / (2RC),    ω = ±√(-A² + 6A - 5) / (2RC)",
        "explain": "σ 为极点的实部（决定衰减速度与稳定性，σ < 0 才稳定），ω 为极点的虚部（决定谐振频率），A 为运放电压增益，R 和 C 为电路中相等的电阻与电容值。由 σ² + ω² = 1/(RC)² 可见极点恒在半径 1/RC 的圆上。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：Sallen-Key 极点圆周轨迹与谐振听感",
      "instruction": "拖动「放大倍数 A」滑块，观察极点如何沿着圆周逼近虚轴并引发频响尖峰；开启声音后可实时听辨白噪声通过该滤波器时的音色变化（A=3.0 时电路直接化身为啸叫振荡器）。",
      "controls": [
        {
          "type": "slider",
          "id": "gain",
          "label": "放大倍数 A",
          "min": 1,
          "max": 3.1,
          "step": 0.01,
          "value": 1.59,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "f0",
          "label": "特征频率 f₀ = 1/(2πRC)",
          "min": 200,
          "max": 2000,
          "step": 50,
          "value": 600,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波白噪声对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let audioCtx = null;\nlet noiseSrc = null;\nlet biquad = null;\nlet noiseGain = null;\nlet osc = null;\nlet oscGain = null;\nlet masterGain = null;\nlet isPlaying = false;\n\nfunction ensureAudio() {\n  if (isPlaying) return;\n  audioCtx = lab.getAudioContext();\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n\n  const bufferSize = audioCtx.sampleRate * 2;\n  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);\n  const data = buffer.getChannelData(0);\n  for (let i = 0; i < bufferSize; i++) {\n    data[i] = Math.random() * 2 - 1;\n  }\n\n  noiseSrc = audioCtx.createBufferSource();\n  noiseSrc.buffer = buffer;\n  noiseSrc.loop = true;\n\n  biquad = audioCtx.createBiquadFilter();\n  biquad.type = 'lowpass';\n\n  noiseGain = audioCtx.createGain();\n  noiseGain.gain.value = 0.25;\n\n  osc = audioCtx.createOscillator();\n  osc.type = 'sine';\n  oscGain = audioCtx.createGain();\n  oscGain.gain.value = 0;\n\n  masterGain = audioCtx.createGain();\n  masterGain.gain.value = 0.35;\n\n  noiseSrc.connect(biquad);\n  biquad.connect(noiseGain);\n  noiseGain.connect(masterGain);\n\n  osc.connect(oscGain);\n  oscGain.connect(masterGain);\n\n  masterGain.connect(audioCtx.destination);\n\n  noiseSrc.start();\n  osc.start();\n  isPlaying = true;\n}\n\nfunction stopAudio() {\n  if (!isPlaying) return;\n  try {\n    if (noiseSrc) noiseSrc.stop();\n    if (osc) osc.stop();\n  } catch (e) {}\n  noiseSrc = null;\n  biquad = null;\n  osc = null;\n  isPlaying = false;\n}\n\nfunction updateAudioParams(A, f0) {\n  if (!isPlaying || !audioCtx) return;\n  const now = audioCtx.currentTime;\n  biquad.frequency.setTargetAtTime(f0, now, 0.02);\n  osc.frequency.setTargetAtTime(f0, now, 0.02);\n\n  if (A >= 2.98) {\n    noiseGain.gain.setTargetAtTime(0.03, now, 0.03);\n    oscGain.gain.setTargetAtTime(A > 3.0 ? 0.22 : 0.14, now, 0.03);\n  } else {\n    const qLin = 1 / (3 - A);\n    const qDb = 20 * Math.log10(qLin);\n    biquad.Q.setTargetAtTime(Math.min(26, qDb), now, 0.02);\n    const comp = Math.min(0.28, 0.28 / Math.sqrt(Math.max(1, qLin * 0.5)));\n    noiseGain.gain.setTargetAtTime(comp, now, 0.03);\n    oscGain.gain.setTargetAtTime(0, now, 0.03);\n  }\n}\n\nlab.onUpdate(() => {\n  const A = lab.values.gain;\n  const f0 = lab.values.f0;\n  const play = lab.values.play;\n\n  if (play) {\n    ensureAudio();\n    updateAudioParams(A, f0);\n  } else {\n    stopAudio();\n  }\n\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  // Left panel: s-plane\n  const cx = 165;\n  const cy = 122;\n  const R = 76;\n\n  // Unstable RHP shading\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.07)';\n  ctx.fillRect(cx, 18, 125, 206);\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('右半平面 RHP (不稳定)', cx + 8, 32);\n\n  // Axes\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - 125, cy); ctx.lineTo(cx + 125, cy);\n  ctx.moveTo(cx, 18); ctx.lineTo(cx, 224);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('σ', cx + 112, cy - 6);\n  ctx.fillText('jω', cx + 6, 30);\n\n  // Circle of radius 1/RC\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('半径 1/RC', cx - R - 26, cy + R + 12);\n\n  // Compute normalized poles\n  const sigmaNorm = (A - 3) / 2;\n  const rad = Math.max(0, -A * A + 6 * A - 5);\n  const omegaNorm = Math.sqrt(rad) / 2;\n\n  const px = cx + sigmaNorm * R;\n  const py1 = cy - omegaNorm * R;\n  const py2 = cy + omegaNorm * R;\n\n  const unstable = A >= 2.999;\n  const poleColor = unstable ? '#ec4899' : '#10b981';\n\n  function drawPole(x, y, color) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2.6;\n    const s = 6;\n    ctx.beginPath();\n    ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);\n    ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);\n    ctx.stroke();\n  }\n\n  drawPole(px, py1, poleColor);\n  if (omegaNorm > 0.01) {\n    drawPole(px, py2, poleColor);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('2重极点', px - 20, py1 - 12);\n  }\n\n  // Draw angle arc for Butterworth reference\n  if (Math.abs(A - 1.586) < 0.03) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('45° 巴特沃斯最平坦点!', cx - 122, 32);\n  }\n\n  // Divider\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(312, 16); ctx.lineTo(312, H - 16);\n  ctx.stroke();\n\n  // Right panel: Frequency Response |H(jf)|\n  const gx = 345;\n  const gy = 200;\n  const gw = 350;\n  const gh = 165;\n  const fMax = 3500;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = gy - (i / 4) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n  }\n  for (let f = 0; f <= fMax; f += 500) {\n    const xx = gx + (f / fMax) * gw;\n    ctx.beginPath(); ctx.moveTo(xx, gy - gh); ctx.lineTo(xx, gy); ctx.stroke();\n  }\n\n  // Axes\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('幅度 |H(f)|', gx + 4, gy - gh + 10);\n  ctx.fillText('频率 (Hz)', gx + gw - 52, gy + 18);\n  ctx.fillText('0', gx - 10, gy + 4);\n  ctx.fillText('1.0', gx - 24, gy - gh * 0.25 + 4);\n  ctx.fillText('2.0', gx - 24, gy - gh * 0.5 + 4);\n  ctx.fillText('3.0', gx - 24, gy - gh * 0.75 + 4);\n  ctx.fillText('4.0', gx - 24, gy - gh + 4);\n\n  // f0 marker\n  const f0x = gx + (f0 / fMax) * gw;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(f0x, gy - gh); ctx.lineTo(f0x, gy); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('f₀=' + f0 + 'Hz', Math.min(gx + gw - 62, f0x + 4), gy - gh + 22);\n\n  // Plot magnitude curve (scale 0..4 -> gy..gy-gh)\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(gx, gy - gh - 10, gw, gh + 12);\n  ctx.clip();\n\n  ctx.strokeStyle = unstable ? '#ec4899' : '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 350; i++) {\n    const freq = (i / 350) * fMax;\n    const u = freq / f0;\n    const denom = Math.sqrt(Math.pow(1 - u * u, 2) + Math.pow((3 - A) * u, 2));\n    const mag = denom < 0.001 ? 100 : 1 / denom;\n    const clampedMag = Math.min(4.3, mag);\n    const pxPlot = gx + (i / 350) * gw;\n    const pyPlot = gy - (clampedMag / 4.0) * gh;\n    if (i === 0) ctx.moveTo(pxPlot, pyPlot);\n    else ctx.lineTo(pxPlot, pyPlot);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  if (unstable) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.2)';\n    ctx.fillRect(gx + 80, 48, 195, 26);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(A > 3.005 ? '⚠ 极点越界：自激失稳！' : '⚡ 极点在虚轴：正弦振荡器！', gx + 92, 65);\n  }\n\n  const qStr = A >= 3 ? '∞ (振荡/失稳)' : (1 / (3 - A)).toFixed(2);\n  const stateStr = A < 1.55 ? '阻尼平缓过渡' : (A < 1.63 ? '巴特沃斯最平坦响应' : (A < 2.99 ? '出现谐振尖峰' : (A <= 3.005 ? '临界振荡器' : '不稳定发散')));\n  lab.setReadout(`增益 A = ${A.toFixed(2)} | 品质因数 Q = ${qStr} | 归一化极点: σ = ${sigmaNorm.toFixed(2)}, ω = ±${omegaNorm.toFixed(2)} | 状态: ${stateStr}`);\n});"
    },
    {
      "type": "concept",
      "heading": "三大经典低通极零点阵型：Butterworth、Chebyshev 与 Elliptic",
      "paragraphs": [
        "把多个 Sallen-Key 级联起来，就能构造出各种著名的低通滤波器家族。它们在频响上的巨大差异，完全源自 s 平面上不同的**极零点几何阵型**：",
        "1. **巴特沃斯（Butterworth）滤波器**：将所有极点**等角度均匀分布**在左半圆周上。它的特点是**通带最平坦（Maximally Flat）**，在过渡带尽量陡峭的同时绝不产生任何纹波或尖峰。因为所有极点都在同一个圆上，级联时每一级可以使用完全相同的 `R` 和 `C`，只需调整每级运放的增益 `A` 即可。",
        "2. **切比雪夫（Chebyshev）滤波器**：牺牲一点通带平坦度，允许通带内出现可控的等波纹起伏（Ripple），以此换取比巴特沃斯**更陡峭的滚降过渡带**。在 s 平面上，这相当于把巴特沃斯的极点圆弧**压扁成了一个椭圆**——椭圆压得越扁，通带纹波越大，过渡带越像悬崖。因为极点半径不再一致，各 Sallen-Key 级必须使用不同的 `R` 和 `C`。",
        "3. **椭圆（Elliptic）滤波器**：把“拆东墙补西墙”发挥到极致——不仅允许通带存在纹波，还允许阻带也存在纹波，从而获得**给定阶数下最陡峭的过渡带**。在 s 平面上，除了被压扁的极点外，它还在虚轴 `jω` 上（紧邻截止频率的阻带侧）刻意放置了**零点**，把截止频率刚过之后的信号直接“拽”向零点以加速衰减。椭圆滤波器的极零点不再服从简单的圆或椭圆几何，而是需要椭圆积分与椭圆函数才能算出来。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：三大经典极零点阵型与 s → 1/s 高通变换仪",
      "instruction": "切换滤波器家族与阶数，观察圆周（巴特沃斯）、扁椭圆（切比雪夫）与虚轴零点（椭圆）如何重塑幅频曲线；最后打开「s → 1/s 高通变换」开关，亲眼见证低通瞬间反转为高通的过程。",
      "controls": [
        {
          "type": "slider",
          "id": "ftype",
          "label": "滤波器家族 (0:巴特沃斯  1:切比雪夫  2:椭圆)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "order",
          "label": "滤波器阶数 (极点总数)",
          "min": 2,
          "max": 6,
          "step": 2,
          "value": 6,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "ripple",
          "label": "压扁/纹波强度 (切比雪夫与椭圆有效)",
          "min": 15,
          "max": 85,
          "step": 5,
          "value": 45,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "highpass",
          "label": "开启 s → 1/s 高通变换 (电路互换 R 与 C)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(() => {\n  const ftype = lab.values.ftype;\n  const N = lab.values.order;\n  const ripplePct = lab.values.ripple;\n  const isHP = lab.values.highpass;\n\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  // Build normalized LP poles & zeros (w0 = 1)\n  let poles = [];\n  let zeros = [];\n\n  const eps = 0.15 + (ripplePct / 100) * 0.85;\n  const mu = Math.asinh(1 / eps) / N;\n  const aCheb = Math.sinh(mu);\n  const bCheb = Math.cosh(mu);\n\n  for (let m = 0; m < N; m++) {\n    const theta = Math.PI / 2 + ((2 * m + 1) * Math.PI) / (2 * N);\n    if (ftype === 0) {\n      // Butterworth\n      poles.push({ re: Math.cos(theta), im: Math.sin(theta) });\n    } else if (ftype === 1) {\n      // Chebyshev\n      poles.push({ re: aCheb * Math.cos(theta), im: bCheb * Math.sin(theta) });\n    } else {\n      // Elliptic-style: flattened poles + jw stopband zeros\n      const edgeBoost = Math.abs(Math.sin(theta)) > 0.78 ? 0.68 : 0.9;\n      poles.push({ re: aCheb * edgeBoost * Math.cos(theta), im: bCheb * 0.96 * Math.sin(theta) });\n    }\n  }\n\n  if (ftype === 2) {\n    const zStart = 1.24 + (1 - ripplePct / 100) * 0.45;\n    const pairs = N / 2;\n    for (let k = 0; k < pairs; k++) {\n      const wz = zStart + k * 0.52;\n      zeros.push({ re: 0, im: wz });\n      zeros.push({ re: 0, im: -wz });\n    }\n  }\n\n  // s -> 1/s transform if highpass\n  let originZeros = 0;\n  if (isHP) {\n    poles = poles.map(p => {\n      const d = p.re * p.re + p.im * p.im;\n      return { re: p.re / d, im: -p.im / d };\n    });\n    const finiteCount = zeros.length;\n    zeros = zeros.map(z => {\n      const d = z.re * z.re + z.im * z.im;\n      return { re: z.re / d, im: -z.im / d };\n    });\n    originZeros = N - finiteCount;\n    for (let k = 0; k < originZeros; k++) {\n      zeros.push({ re: 0, im: 0 });\n    }\n  }\n\n  // Left Panel: s-plane\n  const cx = 165;\n  const cy = 122;\n  const R = 64;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - 130, cy); ctx.lineTo(cx + 95, cy);\n  ctx.moveTo(cx, 18); ctx.lineTo(cx, 224);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('σ', cx + 82, cy - 6);\n  ctx.fillText('jω', cx + 6, 28);\n\n  // Unit circle reference\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.stroke();\n  ctx.restore();\n\n  // Draw poles\n  poles.forEach(p => {\n    const x = cx + p.re * R;\n    const y = cy - p.im * R;\n    if (x > 10 && x < 290 && y > 10 && y < 230) {\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 2.2;\n      const s = 5;\n      ctx.beginPath();\n      ctx.moveTo(x - s, y - s); ctx.lineTo(x + s, y + s);\n      ctx.moveTo(x + s, y - s); ctx.lineTo(x - s, y + s);\n      ctx.stroke();\n    }\n  });\n\n  // Draw zeros\n  zeros.forEach(z => {\n    const x = cx + z.re * R;\n    const y = cy - z.im * R;\n    if (x > 10 && x < 290 && y > 10 && y < 230) {\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.arc(x, y, 5, 0, Math.PI * 2);\n      ctx.stroke();\n    }\n  });\n\n  if (originZeros > 0) {\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(`×${originZeros} 原点零点`, cx + 8, cy + 16);\n  }\n\n  // Legend on s-plane\n  ctx.fillStyle = '#ec4899'; ctx.font = '11px sans-serif';\n  ctx.fillText('× 极点', 18, 28);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('○ 零点', 18, 45);\n\n  // Divider\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath(); ctx.moveTo(305, 16); ctx.lineTo(305, H - 16); ctx.stroke();\n\n  // Right Panel: Frequency Response |H(jw)|\n  const gx = 340;\n  const gy = 200;\n  const gw = 355;\n  const gh = 160;\n  const wMax = 2.6;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const yy = gy - (i / 4) * gh;\n    ctx.beginPath(); ctx.moveTo(gx, yy); ctx.lineTo(gx + gw, yy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(gx, gy - gh); ctx.lineTo(gx, gy); ctx.lineTo(gx + gw, gy);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('归一化幅度 |H(jω)|', gx + 4, gy - gh + 10);\n  ctx.fillText('归一化频率 ω / ω₀', gx + gw - 96, gy + 18);\n  ctx.fillText('1.0', gx - 22, gy - gh * 0.8 + 4);\n  ctx.fillText('0', gx - 12, gy + 4);\n\n  // Cutoff w0 = 1 line\n  const xCut = gx + (1.0 / wMax) * gw;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(xCut, gy - gh); ctx.lineTo(xCut, gy); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('ω₀ = 1', xCut + 4, gy - gh + 22);\n\n  function evalRaw(w) {\n    let num = 1;\n    for (let i = 0; i < zeros.length; i++) {\n      const z = zeros[i];\n      num *= Math.hypot(-z.re, w - z.im);\n    }\n    let den = 1;\n    for (let i = 0; i < poles.length; i++) {\n      const p = poles[i];\n      den *= Math.hypot(-p.re, w - p.im);\n    }\n    return num / Math.max(1e-9, den);\n  }\n\n  // Normalize by passband peak\n  let pbPeak = 0;\n  const pbStart = isHP ? 1.0 : 0.0;\n  const pbEnd = isHP ? 6.0 : 1.0;\n  for (let i = 0; i <= 150; i++) {\n    const w = pbStart + (i / 150) * (pbEnd - pbStart);\n    const v = evalRaw(w);\n    if (v > pbPeak) pbPeak = v;\n  }\n\n  // Plot\n  const pts = [];\n  for (let i = 0; i <= 355; i++) {\n    const w = (i / 355) * wMax;\n    const mag = Math.min(1.2, evalRaw(w) / pbPeak);\n    const px = gx + (i / 355) * gw;\n    const py = gy - mag * (gh * 0.8);\n    pts.push({ x: px, y: py });\n  }\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.12)';\n  ctx.beginPath();\n  ctx.moveTo(gx, gy);\n  pts.forEach(pt => ctx.lineTo(pt.x, pt.y));\n  ctx.lineTo(gx + gw, gy);\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  pts.forEach((pt, idx) => {\n    if (idx === 0) ctx.moveTo(pt.x, pt.y);\n    else ctx.lineTo(pt.x, pt.y);\n  });\n  ctx.stroke();\n\n  const names = ['巴特沃斯 (Butterworth)', '切比雪夫 (Chebyshev)', '椭圆 (Elliptic)'];\n  const modeStr = isHP ? '高通 (s → 1/s, 互换 R 与 C)' : '低通原型';\n  const rcTip = ftype === 0 ? '各 Sallen-Key 级共用相同 R、C' : '各 Sallen-Key 级需不同 R、C';\n  lab.setReadout(`${names[ftype]} | ${N} 阶 (${N/2} 个 Biquad) | 模式: ${modeStr} | 电路特征: ${rcTip}`);\n});"
    },
    {
      "type": "concept",
      "heading": "从低通到高通的电路魔法：s → 1/s 与阻容互换",
      "paragraphs": [
        "前面讨论的经典极零点图案全都是**低通滤波器**。但工程上我们同样需要高通、带通与带阻滤波器。在经典滤波器设计理论中，通用做法是“**先设计标准低通，再做 s 域数学变换**”：写出低通的极零点传递函数 `H(s)`，然后把里面所有的 `s` 替换成 `1/s` 并重新整理成极零点形式，就能直接得到对应高通滤波器的极零点坐标。",
        "书里打趣道：“模拟滤波器设计是 90% 的数学，外加 10% 的电子学。”但幸运的是，用 **Sallen-Key 电路**实现高通滤波器时，你甚至不需要去算繁琐的 `s → 1/s` 代数整理！",
        "在 Sallen-Key 电路中，数学上的“把 `s` 替换为 `1/s`”，在物理电路上恰好等价于**把两个电阻 `R` 和两个电容 `C` 的位置直接对调**！这一换之后，极点被搬移到新的位置，同时电路在 s 平面原点 `s = 0` 处凭空多出了**两个零点**。原点处的零点意味着信号在直流（0 Hz）处的响应彻底归零——这正是高通滤波器的本质特性，也让 Sallen-Key 电路真正发挥出“同时实现 2 个极点与 2 个零点”的全部潜能。"
      ],
      "formula": {
        "expr": "H_HP(s) = H_LP(1 / s)   ⇔   Sallen-Key 电路中互换 R 与 C",
        "explain": "在归一化传递函数中将复频率 s 替换为 1/s，会把通带与阻带以 ω₀ = 1 为中心翻转；对应到 Sallen-Key 硬件拓扑上，只需将原本串联通路上的电阻 R 换成电容 C，接地/反馈支路上的电容 C 换成电阻 R。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "稳定性红线（A = 3）：在等阻等容 Sallen-Key 电路中，运放增益 A 必须严格小于 3；一旦接近 3，谐振峰急剧拉高并演变为振荡器；实际电路中若电阻误差导致 A 超过 3，极点就会落入右半平面造成自激失稳。",
        "高阶与奇数阶拆解铁律：偶数阶用 N/2 个 Biquad 级联；奇数阶则用 (N-1)/2 个 Biquad 外加 1 个简单的单极点无源 RC 电路。",
        "三大经典家族的取舍：追求通带平坦、相位响应好且省物料（共用相同 R/C），选巴特沃斯；追求更快滚降且能忍受通带轻微纹波，选切比雪夫；对过渡带陡峭度有极致要求，才上阻带带零点的椭圆滤波器（但对元件精度极其敏感）。",
        "低通变高通的一键开关：无需重新推导传递函数，直接将 Sallen-Key 低通电路里的 R 与 C 位置互换，即可在原点引入两个零点，变成二阶高通滤波器。"
      ]
    }
  ]
});
