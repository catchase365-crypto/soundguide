window.__BOOK_REGISTER_SECTION__("sec_105", {
  "title": "频域卷积与循环卷积陷阱 (Convolution via the Frequency Domain)",
  "intuition": "把时域里步步挪移、极其耗时的乘加卷积，变成频域里轻快的逐点相乘；再用「零填充」堵住首尾相撞的循环混叠漏洞。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么要绕道频域来做卷积？",
      "paragraphs": [
        "给定输入信号 `x[n]` 和系统脉冲响应 `h[n]`，在时域直接求输出 `y[n]` 需要做卷积运算。但正如 Fig. 9-8 所示，我们完全可以走一条「曲线救国」的路线：先把 `x[n]` 和 `h[n]` 分别做 **DFT** 变到频域，将两者的频谱 **逐点相乘**，最后做一次 **逆 DFT (IDFT)** 回到时域。中间步骤截然不同，但最终得到的输出波形与时域卷积完全一致。",
        "工程师之所以不惜多做三次变换也要躲开时域卷积，源于两个痛点：第一是 **数学求解困难**。比如已知系统脉冲响应和输出信号，反推输入信号（即 **反卷积 Deconvolution**），在时域几乎无从下手；而在频域，乘法的逆运算只是简单的逐点 **除法**（`X[f] = Y[f] / H[f]`）。",
        "第二是 **计算速度瓶颈**。以一个 512 点的数字滤波器核为例，在 200 MHz 个人电脑上用标准时域卷积，每算 1 个输出样点就需要约 1 毫秒（吞吐量仅 1,000 样点/秒）——这对高保真音频来说慢了 40 倍，对电视视频更是慢了 10,000 倍！不过要注意：单纯用普通 DFT 算频域卷积，计算量一点没少；真正的转折点是 20 世纪 60 年代 **快速傅里叶变换 (FFT)** 的诞生，它让频域乘法比常规卷积快出成百上千倍。"
      ],
      "formula": {
        "expr": "y[n] = x[n] * h[n]   <== DFT / IDFT ==>   Y[f] = X[f] × H[f]",
        "explain": "x[n] 为输入信号，h[n] 为脉冲响应，y[n] 为输出信号；X[f]、H[f]、Y[f] 分别是它们对应的离散傅里叶频谱。时域卷积 (*) 等价于频域复数逐点相乘 (×)。"
      }
    },
    {
      "type": "concept",
      "heading": "频域复数的极坐标与直角坐标乘除法",
      "paragraphs": [
        "理解频域乘法 `Y[f] = X[f] × H[f]` 最直观的方式是使用 **极坐标 (Polar Form)**：输出信号的幅值是两个幅值相乘（`MagY[f] = MagX[f] × MagH[f]`），相位则是两个相位相加（`PhaseY[f] = PhaseX[f] + PhaseH[f]`）。物理上，这就像不同频率的余弦波依次穿过系统，振幅按比例缩放、相位各自偏移。",
        "但在计算机代码里，频谱通常以 **直角坐标 (Rectangular Form)** 的实部 `Re` 和虚部 `Im` 存储。此时复数相乘会出现交叉项（例如输入正弦波可能同时激发出余弦和正弦输出），必须按方程 9-1 的复数乘法展开；同理，做反卷积除法 `H[f] = Y[f] / X[f]` 时，在极坐标下是「幅值相除、相位相减」，在直角坐标下则展开为方程 9-2。"
      ],
      "formula": {
        "expr": "ReY[f] = ReX[f]·ReH[f] - ImX[f]·ImH[f] ,   ImY[f] = ImX[f]·ReH[f] + ReX[f]·ImH[f]",
        "explain": "Re 表示频谱的实部（余弦分量），Im 表示频谱的虚部（正弦分量）。注意实部相减、虚部相加的交叉耦合结构。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：听见与看见「频域乘法」如何塑形波形",
      "instruction": "拖动截止频率滑块观察高频谱分量被 H[f] 压低、时域锯齿被磨平的过程；点击播放按钮可实时对比听感变化。",
      "controls": [
        {
          "type": "slider",
          "id": "cutoff",
          "label": "滤波器截止带宽 (H[f])",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 5,
          "unit": " 次谐波"
        },
        {
          "type": "toggle",
          "id": "smoothEdge",
          "label": "启用平缓滚降 (余弦窗过渡 vs 硬截断)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波实时音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H_px = lab.height;\nconst NUM_HARM = 16;\nlet audioInited = false;\nlet masterGain = null;\nlet harmGains = [];\n\nfunction computeSpecs() {\n  const cutoff = lab.values.cutoff;\n  const smooth = lab.values.smoothEdge;\n  const X = [];\n  const Hf = [];\n  const Y = [];\n  for (let k = 1; k <= NUM_HARM; k++) {\n    const xMag = 1 / k;\n    let hMag = 0;\n    if (!smooth) {\n      hMag = k <= cutoff ? 1.0 : 0.0;\n    } else {\n      if (k <= cutoff) {\n        const t = k / (cutoff + 1);\n        hMag = 0.5 * (1 + Math.cos(Math.PI * t * 0.85));\n      } else {\n        hMag = 0.0;\n      }\n    }\n    X.push(xMag);\n    Hf.push(hMag);\n    Y.push(xMag * hMag);\n  }\n  return { X, Hf, Y };\n}\n\nfunction syncAudio(Y) {\n  try {\n    const actx = lab.getAudioContext();\n    if (!actx) return;\n    if (lab.values.play) {\n      if (actx.state === 'suspended') actx.resume();\n      if (!audioInited) {\n        masterGain = actx.createGain();\n        masterGain.gain.value = 0;\n        masterGain.connect(actx.destination);\n        const baseFreq = 130.81;\n        for (let k = 0; k < NUM_HARM; k++) {\n          const osc = actx.createOscillator();\n          const g = actx.createGain();\n          osc.type = 'sine';\n          osc.frequency.value = baseFreq * (k + 1);\n          g.gain.value = 0;\n          osc.connect(g);\n          g.connect(masterGain);\n          osc.start();\n          harmGains.push(g);\n        }\n        audioInited = true;\n      }\n      const now = actx.currentTime;\n      masterGain.gain.setTargetAtTime(0.22, now, 0.02);\n      for (let k = 0; k < NUM_HARM; k++) {\n        harmGains[k].gain.setTargetAtTime(Y[k] * 0.55, now, 0.02);\n      }\n    } else if (audioInited && masterGain) {\n      masterGain.gain.setTargetAtTime(0, actx.currentTime, 0.02);\n    }\n  } catch (e) {}\n}\n\nfunction drawMiniBars(x0, y0, w, h, vals, color, title) {\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(x0, y0, w, h);\n  ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(x0, y0, w, h);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(title, x0 + 6, y0 + 14);\n\n  const padL = 8, padR = 8, padB = 10, padT = 22;\n  const plotW = w - padL - padR;\n  const plotH = h - padT - padB;\n  const step = plotW / vals.length;\n  const barW = Math.max(3, step * 0.68);\n\n  for (let i = 0; i < vals.length; i++) {\n    const bh = Math.max(1, vals[i] * plotH);\n    const bx = x0 + padL + i * step + (step - barW) * 0.5;\n    const by = y0 + padT + plotH - bh;\n    ctx.fillStyle = color;\n    ctx.fillRect(bx, by, barW, bh);\n  }\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H_px);\n  const { X, Hf, Y } = computeSpecs();\n  syncAudio(Y);\n\n  drawMiniBars(14, 10, 210, 102, X, '#38bdf8', '|X[f]| 输入锯齿频谱');\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 16px sans-serif';\n  ctx.fillText('×', 233, 66);\n\n  drawMiniBars(254, 10, 210, 102, Hf, '#f59e0b', '|H[f]| 频率响应');\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('=', 473, 66);\n\n  drawMiniBars(494, 10, 212, 102, Y, '#10b981', '|Y[f]| = |X·H| 输出频谱');\n\n  const wx = 14, wy = 124, ww = W - 28, wh = 104;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(wx, wy, ww, wh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.beginPath();\n  ctx.moveTo(wx, wy + wh / 2);\n  ctx.lineTo(wx + ww, wy + wh / 2);\n  ctx.stroke();\n  ctx.strokeRect(wx, wy, ww, wh);\n\n  const pts = 320;\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  for (let i = 0; i <= pts; i++) {\n    const t = (i / pts) * 2 * Math.PI * 2;\n    let sum = 0;\n    for (let k = 0; k < NUM_HARM; k++) sum += X[k] * Math.sin((k + 1) * t);\n    const px = wx + (i / pts) * ww;\n    const py = wy + wh / 2 - sum * 24;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  for (let i = 0; i <= pts; i++) {\n    const t = (i / pts) * 2 * Math.PI * 2;\n    let sum = 0;\n    for (let k = 0; k < NUM_HARM; k++) sum += Y[k] * Math.sin((k + 1) * t);\n    const px = wx + (i / pts) * ww;\n    const py = wy + wh / 2 - sum * 24;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('--- 时域输入 x[n]', wx + 8, wy + 15);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('—— 时域输出 y[n] = IDFT(X[f]·H[f])', wx + 128, wy + 15);\n\n  const modeStr = lab.values.smoothEdge ? '余弦滚降' : '矩形硬截断';\n  const kept = Hf.filter(v => v > 0.01).length;\n  lab.setReadout(`模式: ${modeStr} | 保留谐波: ${kept} / ${NUM_HARM} | 高次谐波被乘以0后，时域尖锐跳变明显变平滑`);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "致命陷阱：循环卷积 (Circular Convolution) 与零填充救星",
      "paragraphs": [
        "细心的读者可能会发现，Fig. 9-8 中「作弊」了：一个 `N` 点信号和 `M` 点脉冲响应做线性卷积，正确输出长度应当膨胀到 `N + M - 1` 点（Fig. 9-8 是 453 个非零输入样点 + 60 个非零核样点，正好塞进 512 点里）。",
        "但现实中更常见的是 Fig. 9-9 的窘境：输入 `x[n]` 占满 256 点，脉冲响应 `h[n]` 有 51 个非零点，线性卷积需要 `256 + 51 - 1 = 306` 点。如果直接用 256 点 DFT 走频域乘法，输出的容器只有 256 个位置，根本装不下 306 个数！结果就是 **第 256 到 305 号样点被硬生生挤出了右边界，回卷叠加到了下一周期的开头（第 0 到 49 号样点）**，导致波形严重失真。这种现象称为 **循环卷积 (Circular Convolution)**。",
        "为什么会首尾相接？因为 `N` 点 DFT 默认把时域看作以 `N` 为周期的无限长周期信号。当单个周期里装不下膨胀后的卷积结果时，右边流出的信号就会从左边流回来——就像一条咬住自己尾巴的蛇，第 `N-1` 号样点紧挨着第 `0` 号样点。",
        "避坑的方法非常简单：在进入频域之前，用 **零填充 (Zero-Padding)** 在 `x[n]` 和 `h[n]` 的末尾都补上足够多的 `0`，把两者的长度都扩展到 `L >= N + M - 1`（做 FFT 时通常补到最近的 2 的幂次，例如把 256 和 51 都补零到 512 点），这样频域卷积就能完整容纳全部 `N + M - 1` 个正确样点，彻底消除循环混叠。"
      ],
      "formula": {
        "expr": "L_DFT >= N + M - 1",
        "explain": "N 为输入信号有效长度，M 为脉冲响应有效长度；进行频域乘法前，必须把两个信号补零到至少 L_DFT 点，才能保证 IDFT 结果等价于线性卷积。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：亲眼目睹「蛇咬尾巴」——循环卷积与零填充调节器",
      "instruction": "固定输入信号长度 N=64。拖动「DFT 缓冲长度 L」和「核长度 M」，观察当 L < N+M-1 时尾部溢出并回卷到开头造成的粉色混叠失真。",
      "controls": [
        {
          "type": "slider",
          "id": "dftSize",
          "label": "DFT 缓冲长度 L (Zero-Padding 后)",
          "min": 64,
          "max": 136,
          "step": 2,
          "value": 74,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "impulseLen",
          "label": "脉冲响应长度 M",
          "min": 8,
          "max": 44,
          "step": 2,
          "value": 28,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showOverlap",
          "label": "高亮显示溢出与首部混叠区",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 64;\nconst X_MAX = 138;\n\nfunction buildSignals(M) {\n  const x = [];\n  for (let n = 0; n < N; n++) {\n    const wave = 0.65 * Math.sin(2 * Math.PI * 1.5 * n / N);\n    const tailPulse = 0.85 * Math.exp(-Math.pow((n - 52) / 5.5, 2));\n    x.push(wave + tailPulse);\n  }\n  const h = [];\n  let hSum = 0;\n  for (let m = 0; m < M; m++) {\n    const v = 0.5 * (1 - Math.cos(2 * Math.PI * (m + 0.5) / M));\n    h.push(v);\n    hSum += v;\n  }\n  for (let m = 0; m < M; m++) h[m] /= (hSum * 0.45);\n  return { x, h };\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  const L = lab.values.dftSize;\n  const M = lab.values.impulseLen;\n  const showOv = lab.values.showOverlap;\n  const lenLin = N + M - 1;\n  const overflow = Math.max(0, lenLin - L);\n\n  const { x, h } = buildSignals(M);\n  const yLin = new Array(lenLin).fill(0);\n  for (let n = 0; n < N; n++) {\n    for (let m = 0; m < M; m++) {\n      yLin[n + m] += x[n] * h[m];\n    }\n  }\n  const yCirc = new Array(L).fill(0);\n  for (let k = 0; k < lenLin; k++) {\n    yCirc[k % L] += yLin[k];\n  }\n\n  const padL = 36, padR = 16, padT = 28, padB = 26;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const zeroY = padT + plotH * 0.58;\n  const yScale = plotH * 0.36;\n  const toX = (idx) => padL + (idx / X_MAX) * plotW;\n  const toY = (val) => zeroY - val * yScale;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let g = 0; g <= X_MAX; g += 16) {\n    const gx = toX(g);\n    ctx.beginPath();\n    ctx.moveTo(gx, padT);\n    ctx.lineTo(gx, padT + plotH);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.45)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(String(g), gx - 6, H - 8);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(padL, zeroY);\n  ctx.lineTo(padL + plotW, zeroY);\n  ctx.stroke();\n\n  if (showOv && overflow > 0) {\n    const xL = toX(L);\n    const xEnd = toX(lenLin - 1);\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.14)';\n    ctx.fillRect(xL, padT, xEnd - xL, plotH);\n\n    const ovW = toX(Math.min(L, overflow)) - toX(0);\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.16)';\n    ctx.fillRect(toX(0), padT, ovW, plotH);\n\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('← 尾部回卷叠加区', toX(0) + 4, padT + 14);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('溢出尾部 →', xL + 4, padT + 14);\n  }\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  ctx.moveTo(toX(L), padT);\n  ctx.lineTo(toX(L), padT + plotH);\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(`DFT 边界 L=${L}`, toX(L) - 34, padT - 8);\n\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.75)';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([4, 3]);\n  for (let k = 0; k < lenLin; k++) {\n    const px = toX(k), py = toY(yLin[k]);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py); \n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  for (let k = 0; k < L; k++) {\n    const px = toX(k), py = toY(yCirc[k]);\n    if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  if (overflow > 0) {\n    ctx.beginPath();\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.8;\n    const limit = Math.min(L, overflow);\n    for (let k = 0; k < limit; k++) {\n      const px = toX(k), py = toY(yCirc[k]);\n      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('--- 正确线性卷积 (N+M-1点)', padL + 4, 15);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('—— 频域卷积输出 (L点)', padL + 178, 15);\n\n  if (overflow === 0) {\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('✓ Zero-Padding 充足，无混叠', W - 205, 16);\n  } else {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(`⚠ 循环混叠！溢出 ${overflow} 点`, W - 180, 16);\n  }\n\n  lab.setReadout(`输入 N=${N} | 核 M=${M} | 线性卷积需 ${lenLin} 点 | 当前 L=${L} 点 | ${overflow === 0 ? '零混叠安全' : '前 ' + Math.min(L, overflow) + ' 个样点被尾部严重污染'}`);\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑第一条（必补零）：用 FFT 做线性卷积前，必须将两个输入数组同时 Zero-Padding 到至少 `N + M - 1`（工程上取大于等于它的最小 2 的幂次），否则末尾样点会悄无声息地回卷污染开头。",
        "性能分水岭：单纯的 DFT 无法加速卷积，必须用 FFT（O(N log N)）；当滤波器核长度 `M` 较大（通常超过几十个点）时，频域乘法才会显著快于时域直接卷积。",
        "反卷积（频域除法）的隐藏雷区：虽然 `X[f] = Y[f] / H[f]` 在数学上很优雅，但如果系统在某个频点 `H[f]` 接近于 0（比如带阻或低通的阻带），直接相除会把微小的噪声无限放大，工程中需配合正则化（如维纳滤波）使用。"
      ]
    }
  ]
});
