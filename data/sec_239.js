window.__BOOK_REGISTER_SECTION__("sec_239", {
  "title": "低通到低通的频率变换 (Low-pass to Low-pass Frequency Change)",
  "intuition": "只需设计好一个截止频率为 1 弧度的“标准母版”低通滤波器，再用一条代数代换公式扭曲单位圆上的频率刻度，就能瞬间把它缩放成任意截止频率 W 的新滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心思想：用共形映射在 z 平面直接“拉伸”频率轴",
      "paragraphs": [
        "在上一小节中，我们通过 s 平面极点与双线性变换得到了一个**中间母版**：截止频率固定为 `1 rad/sample`（即采样率 `fs` 的约 `15.9%`）的递归低通滤波器。如果每次想把截止频率改成 `0.2 rad` 或 `2.0 rad`，都要重新回到 s 平面重算极点、重做双线性变换，工程上会非常繁琐。",
        "Smith 在本节提出了一个更优雅的思路：**直接在 z 域做变量代换（共形映射，Conformal Mapping）**。我们保留原来母版的传递函数结构不变，只把里面出现的每一个延迟算子 `z⁻¹` 统一替换成一个一阶全通分式。它在数学上就像一根**固定了两端、中间可以任意弯曲拉伸的橡皮筋**：直流点 `ω = 0` 依然钉在 `0`，奈奎斯特频率 `ω = π` 依然钉在 `π`，但中间的频率刻度被精确地挤压或拉伸，使得新设定的截止频率 `W` 刚好对准原母版的截止频率 `1 rad`。"
      ],
      "formula": {
        "expr": "z⁻¹  →  (z⁻¹ - k) / (1 - k·z⁻¹) ,    其中  k = sin(1/2 - W/2) / sin(1/2 + W/2)",
        "explain": "z⁻¹ 是单位延迟算子；W 是你想要的新低通截止角频率，合法范围为 (0, π) 弧度/采样点（π 对应奈奎斯特频率 fs/2）；k 是由目标频率 W 决定的频率翘曲系数（当 W = 1 时 k = 0，代换退化为原封不动；W < 1 时 k > 0，向低频压缩；W > 1 时 k < 0，向高频拉伸）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：单位圆上的频率“橡皮筋”与幅频响应缩放",
      "instruction": "拖动「新截止频率 W」滑块，观察左图频率映射曲线如何在 (W, 1) 处弯折，以及右图滤波器幅频响应如何精准地将 -3 dB 截止点移动到 W。",
      "controls": [
        {
          "type": "slider",
          "id": "W",
          "label": "新截止频率 W",
          "min": 0.1,
          "max": 2.9,
          "step": 0.02,
          "value": 0.5,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "纵轴切换为 dB 对数刻度",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W_PX = lab.width;\nconst H_PX = lab.height;\n\nconst T = 2 * Math.tan(0.5);\nconst sig = -Math.SQRT1_2;\nconst D0 = 4 - 4 * sig * T + T * T;\nconst pa0 = (T * T) / D0;\nconst pa1 = (2 * T * T) / D0;\nconst pa2 = pa0;\nconst pb1 = (8 - 2 * T * T) / D0;\nconst pb2 = (-4 - 4 * sig * T - T * T) / D0;\n\nfunction transformCoeffs(W) {\n  const k = Math.sin(0.5 - W * 0.5) / Math.sin(0.5 + W * 0.5);\n  const k2 = k * k;\n  const D = 1 + pb1 * k - pb2 * k2;\n  return {\n    k,\n    D,\n    a0: (pa0 - pa1 * k + pa2 * k2) / D,\n    a1: (-2 * pa0 * k + pa1 + pa1 * k2 - 2 * pa2 * k) / D,\n    a2: (pa0 * k2 - pa1 * k + pa2) / D,\n    b1: (2 * k + pb1 + pb1 * k2 - 2 * pb2 * k) / D,\n    b2: (-k2 - pb1 * k + pb2) / D\n  };\n}\n\nfunction magResp(w, a0, a1, a2, b1, b2) {\n  const c1 = Math.cos(w), s1 = Math.sin(w);\n  const c2 = Math.cos(2 * w), s2 = Math.sin(2 * w);\n  const nr = a0 + a1 * c1 + a2 * c2;\n  const ni = -a1 * s1 - a2 * s2;\n  const dr = 1 - b1 * c1 - b2 * c2;\n  const di = b1 * s1 + b2 * s2;\n  return Math.hypot(nr, ni) / Math.hypot(dr, di);\n}\n\nfunction warpedFreq(w, k) {\n  const numR = Math.cos(w) - k;\n  const numI = -Math.sin(w);\n  const denR = 1 - k * Math.cos(w);\n  const denI = k * Math.sin(w);\n  const re = numR * denR + numI * denI;\n  const im = numI * denR - numR * denI;\n  let ang = Math.atan2(-im, re);\n  if (ang < 0) ang += 2 * Math.PI;\n  return Math.min(Math.PI, Math.max(0, ang));\n}\n\nfunction render() {\n  const W = lab.values.W;\n  const useDb = lab.values.dbScale;\n  const c = transformCoeffs(W);\n\n  ctx.clearRect(0, 0, W_PX, H_PX);\n\n  const lx = 44, ly = 28, lw = 190, lh = 178;\n  const rx = 296, ry = 28, rw = 400, rh = 178;\n\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(lx, ly, lw, lh);\n  ctx.fillRect(rx, ry, rw, rh);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const x1 = lx + (lw * i) / 4;\n    const y1 = ly + (lh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x1, ly); ctx.lineTo(x1, ly + lh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(lx, y1); ctx.lineTo(lx + lw, y1); ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const x2 = rx + (rw * i) / 4;\n    const y2 = ry + (rh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x2, ry); ctx.lineTo(x2, ry + rh); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx, y2); ctx.lineTo(rx + rw, y2); ctx.stroke();\n  }\n\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.beginPath(); ctx.moveTo(lx, ly + lh); ctx.lineTo(lx + lw, ly); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 120; i++) {\n    const w = (Math.PI * i) / 120;\n    const wOld = warpedFreq(w, c.k);\n    const px = lx + (w / Math.PI) * lw;\n    const py = ly + lh - (wOld / Math.PI) * lh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const wx = lx + (W / Math.PI) * lw;\n  const wy = ly + lh - (1.0 / Math.PI) * lh;\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(wx, ly + lh); ctx.lineTo(wx, wy); ctx.lineTo(lx, wy); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(wx, wy, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  const yMap = (mag) => {\n    if (!useDb) {\n      return ry + rh - Math.min(1.15, Math.max(0, mag)) * (rh / 1.1);\n    }\n    const db = 20 * Math.log10(Math.max(mag, 1e-4));\n    const clamped = Math.max(-40, Math.min(2, db));\n    return ry + ((2 - clamped) / 42) * rh;\n  };\n\n  const y3db = yMap(Math.SQRT1_2);\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(236,72,153,0.45)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(rx, y3db); ctx.lineTo(rx + rw, y3db); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(148,163,184,0.55)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const w = (Math.PI * i) / 200;\n    const m = magResp(w, pa0, pa1, pa2, pb1, pb2);\n    const px = rx + (w / Math.PI) * rw;\n    const py = yMap(m);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const w = (Math.PI * i) / 200;\n    const m = magResp(w, c.a0, c.a1, c.a2, c.b1, c.b2);\n    const px = rx + (w / Math.PI) * rw;\n    const py = yMap(m);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const rwx = rx + (W / Math.PI) * rw;\n  const mAtW = magResp(W, c.a0, c.a1, c.a2, c.b1, c.b2);\n  const rwy = yMap(mAtW);\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(rwx, ry + rh); ctx.lineTo(rwx, rwy); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(rwx, rwy, 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('频率映射 ω_原 = f(ω_新)', lx, 18);\n  ctx.fillText(useDb ? '幅频响应 |H(ω)| (dB)' : '幅频响应 |H(ω)| (线性增益)', rx, 18);\n\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'center';\n  ctx.fillText('0', lx, ly + lh + 15);\n  ctx.fillText('π', lx + lw, ly + lh + 15);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('W=' + W.toFixed(2), wx, ly + lh + 26);\n\n  ctx.textAlign = 'right';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('π', lx - 6, ly + 8);\n  ctx.fillText('0', lx - 6, ly + lh + 4);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('1.0', lx - 6, wy + 4);\n\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('0', rx, ry + rh + 15);\n  ctx.fillText('1.0 (原型)', rx + (1 / Math.PI) * rw, ry + rh + 15);\n  ctx.fillText('π (fs/2)', rx + rw - 16, ry + rh + 15);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('W', rwx, ry + rh + 26);\n\n  ctx.textAlign = 'right';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('-3dB', rx - 6, y3db + 4);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText(useDb ? '0dB' : '1.0', rx - 6, yMap(1) + 4);\n\n  ctx.textAlign = 'right';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('━━ 变换后滤波器', rx + rw, ry + 16);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('--- 原始母版 (W=1)', rx + rw, ry + 32);\n\n  const dbAtW = 20 * Math.log10(Math.max(mAtW, 1e-6));\n  lab.setReadout(\n    'W = ' + W.toFixed(2) + ' rad (' + ((W / (2 * Math.PI)) * 100).toFixed(1) + '% fs)  |  k = ' +\n    c.k.toFixed(4) + '  |  D = ' + c.D.toFixed(4) + '  |  |H(W)| = ' + mAtW.toFixed(3) + ' (' + dbAtW.toFixed(2) + ' dB)'\n  );\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "双二阶 (Biquad) 递归系数的直接转换公式 (Eq 33-13)",
      "paragraphs": [
        "在工程写代码时，我们通常把高阶 IIR 滤波器拆成一个个**二阶节（Biquad，最多包含两个极点和两个零点）**串联。如果直接把公式 33-12 代入二阶传递函数，展开合并同类项后再归一化常数项，就能推导出无需任何符号运算、直接可写进代码里的闭式转换方程（Equation 33-13）。",
        "阅读原书公式时有一个**极其关键的符号细节**：原书右侧用**斜体** `a₀, a₁, a₂, b₁, b₂` 表示截止频率为 `1` 的原始母版系数，左侧用**正体**表示截止频率为 `W` 的新系数；并且 Smith 采用的是差分方程加法约定 `y[n] = a₀x[n] + a₁x[n-1] + a₂x[n-2] + b₁y[n-1] + b₂y[n-2]`（对应传递函数分母为 `1 - b₁z⁻¹ - b₂z⁻²`）。"
      ],
      "formula": {
        "expr": "a₀_new = (a₀ - a₁k + a₂k²)/D,   a₁_new = (-2a₀k + a₁ + a₁k² - 2a₂k)/D,   a₂_new = (a₀k² - a₁k + a₂)/D\nb₁_new = (2k + b₁ + b₁k² - 2b₂k)/D,   b₂_new = (-k² - b₁k + b₂)/D,   其中 D = 1 + b₁k - b₂k²",
        "explain": "右侧 a₀, a₁, a₂, b₁, b₂ 为截止频率=1 的母版系数；k = sin(1/2 - W/2) / sin(1/2 + W/2) 为频率翘曲因子；D 为使新分母常数项重新归 1 的归一化因子；左侧为最终可直接放进实时循环的新二阶滤波器系数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：Eq 33-13 实时滤波引擎与听感对比",
      "instruction": "点击「播放富谐波测试音」，拖动 W 滑块听不同截止频率下的音色明暗变化，观察右侧 5 个滤波器系数如何依据 Eq 33-13 实时改写。",
      "controls": [
        {
          "type": "slider",
          "id": "W",
          "label": "目标截止频率 W",
          "min": 0.08,
          "max": 2.8,
          "step": 0.02,
          "value": 0.35,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路直通 (对比原始未滤波信号)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放富谐波测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W_PX = lab.width;\nconst H_PX = lab.height;\n\nconst T = 2 * Math.tan(0.5);\nconst sig = -Math.SQRT1_2;\nconst D0 = 4 - 4 * sig * T + T * T;\nconst pa0 = (T * T) / D0;\nconst pa1 = (2 * T * T) / D0;\nconst pa2 = pa0;\nconst pb1 = (8 - 2 * T * T) / D0;\nconst pb2 = (-4 - 4 * sig * T - T * T) / D0;\n\nlet coeffs = { k: 0, D: 1, a0: pa0, a1: pa1, a2: pa2, b1: pb1, b2: pb2 };\n\nfunction computeCoeffs(W) {\n  const k = Math.sin(0.5 - W * 0.5) / Math.sin(0.5 + W * 0.5);\n  const k2 = k * k;\n  const D = 1 + pb1 * k - pb2 * k2;\n  return {\n    k,\n    D,\n    a0: (pa0 - pa1 * k + pa2 * k2) / D,\n    a1: (-2 * pa0 * k + pa1 + pa1 * k2 - 2 * pa2 * k) / D,\n    a2: (pa0 * k2 - pa1 * k + pa2) / D,\n    b1: (2 * k + pb1 + pb1 * k2 - 2 * pb2 * k) / D,\n    b2: (-k2 - pb1 * k + pb2) / D\n  };\n}\n\nlet audioCtx = null;\nlet scriptNode = null;\nlet gainNode = null;\nlet audioPhase = 0;\nlet ax1 = 0, ax2 = 0, ay1 = 0, ay2 = 0;\n\nfunction ensureAudio() {\n  if (audioCtx) return;\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  scriptNode = audioCtx.createScriptProcessor(1024, 1, 1);\n  gainNode = audioCtx.createGain();\n  gainNode.gain.value = 0;\n  scriptNode.onaudioprocess = (ev) => {\n    const out = ev.outputBuffer.getChannelData(0);\n    const playing = lab.values.play;\n    const bypass = lab.values.bypass;\n    const c = coeffs;\n    const step = 140 / audioCtx.sampleRate;\n    for (let i = 0; i < out.length; i++) {\n      audioPhase += step;\n      if (audioPhase >= 1) audioPhase -= 1;\n      let x = 0;\n      const p = 2 * Math.PI * audioPhase;\n      for (let h = 1; h <= 14; h++) {\n        x += Math.sin(h * p) / h;\n      }\n      x *= 0.48;\n      const y = c.a0 * x + c.a1 * ax1 + c.a2 * ax2 + c.b1 * ay1 + c.b2 * ay2;\n      ax2 = ax1; ax1 = x;\n      ay2 = ay1; ay1 = Math.max(-4, Math.min(4, y));\n      out[i] = playing ? (bypass ? x : y) : 0;\n    }\n  };\n  scriptNode.connect(gainNode);\n  gainNode.connect(audioCtx.destination);\n}\n\nfunction updateState() {\n  const W = lab.values.W;\n  coeffs = computeCoeffs(W);\n  if (lab.values.play) {\n    ensureAudio();\n    if (audioCtx && audioCtx.state === 'suspended') {\n      audioCtx.resume();\n    }\n  }\n  if (gainNode && audioCtx) {\n    gainNode.gain.setTargetAtTime(lab.values.play ? 0.22 : 0.0, audioCtx.currentTime, 0.02);\n  }\n  const fs = audioCtx ? audioCtx.sampleRate : 48000;\n  const fcHz = (W / (2 * Math.PI)) * fs;\n  lab.setReadout(\n    'W = ' + W.toFixed(2) + ' rad (≈ ' + Math.round(fcHz) + ' Hz @ ' + (fs / 1000).toFixed(1) + 'kHz)  |  ' +\n    (lab.values.bypass ? '[旁路直通中]' : '[Eq 33-13 滤波激活]') +\n    '  |  k = ' + coeffs.k.toFixed(3) + '  |  D = ' + coeffs.D.toFixed(3)\n  );\n}\n\nlab.onUpdate(updateState);\n\nfunction drawFrame(dt, timeSec) {\n  ctx.clearRect(0, 0, W_PX, H_PX);\n\n  const ox = 20, oy = 26, ow = 415, oh = 192;\n  const px = 452, py = 26, pw = 248, ph = 192;\n\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(ox, oy, ow, oh);\n  ctx.fillRect(px, py, pw, ph);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = oy + (oh * i) / 4;\n    ctx.beginPath(); ctx.moveTo(ox, y); ctx.lineTo(ox + ow, y); ctx.stroke();\n  }\n  for (let i = 0; i <= 6; i++) {\n    const x = ox + (ow * i) / 6;\n    ctx.beginPath(); ctx.moveTo(x, oy); ctx.lineTo(x, oy + oh); ctx.stroke();\n  }\n\n  const N = 160;\n  const warmup = 80;\n  const c = coeffs;\n  const xs = new Float32Array(N);\n  const ys = new Float32Array(N);\n  let sx1 = 0, sx2 = 0, sy1 = 0, sy2 = 0;\n  const wFund = 0.10;\n\n  for (let n = -warmup; n < N; n++) {\n    const t = n * wFund + timeSec * 1.4;\n    let x = 0;\n    for (let h = 1; h <= 11; h++) {\n      x += Math.sin(h * t) / h;\n    }\n    x *= 0.45;\n    const y = c.a0 * x + c.a1 * sx1 + c.a2 * sx2 + c.b1 * sy1 + c.b2 * sy2;\n    sx2 = sx1; sx1 = x;\n    sy2 = sy1; sy1 = y;\n    if (n >= 0) {\n      xs[n] = x;\n      ys[n] = y;\n    }\n  }\n\n  const midY = oy + oh / 2;\n  const amp = oh * 0.36;\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const vx = ox + (i / (N - 1)) * ow;\n    const vy = midY - xs[i] * amp;\n    if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.stroke();\n\n  const bypass = lab.values.bypass;\n  ctx.strokeStyle = bypass ? '#f59e0b' : '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let i = 0; i < N; i++) {\n    const vx = ox + (i / (N - 1)) * ow;\n    const vy = midY - (bypass ? xs[i] : ys[i]) * amp;\n    if (i === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('实时波形对比 (锯齿合成波 x[n] vs 输出 y[n])', ox, 17);\n  ctx.fillText('Eq 33-13 实时系数监视器', px, 17);\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('━ 原始输入 x[n]', ox + 10, oy + 16);\n  ctx.fillStyle = bypass ? '#f59e0b' : '#10b981';\n  ctx.fillText(bypass ? '━ 输出 y[n] (已旁路)' : '━ 滤波输出 y[n]', ox + 115, oy + 16);\n\n  const rows = [\n    { name: 'k (翘曲)', val: c.k, color: '#f59e0b', scale: 1.0 },\n    { name: 'D (归一)', val: c.D, color: '#94a3b8', scale: 3.0 },\n    { name: 'a₀', val: c.a0, color: '#38bdf8', scale: 1.0 },\n    { name: 'a₁', val: c.a1, color: '#38bdf8', scale: 2.0 },\n    { name: 'a₂', val: c.a2, color: '#38bdf8', scale: 1.0 },\n    { name: 'b₁', val: c.b1, color: '#10b981', scale: 2.0 },\n    { name: 'b₂', val: c.b2, color: '#10b981', scale: 1.0 }\n  ];\n\n  ctx.font = '11.5px monospace';\n  const startY = py + 24;\n  const stepY = 25;\n  for (let i = 0; i < rows.length; i++) {\n    const r = rows[i];\n    const ry = startY + i * stepY;\n    ctx.fillStyle = '#cbd5e1';\n    ctx.textAlign = 'left';\n    ctx.fillText(r.name, px + 10, ry);\n    ctx.fillStyle = r.color;\n    ctx.textAlign = 'right';\n    ctx.fillText((r.val >= 0 ? ' ' : '') + r.val.toFixed(4), px + 145, ry);\n\n    const barX = px + 156;\n    const barW = 80;\n    const center = barX + barW / 2;\n    ctx.fillStyle = 'rgba(255,255,255,0.06)';\n    ctx.fillRect(barX, ry - 9, barW, 10);\n    ctx.fillStyle = 'rgba(255,255,255,0.2)';\n    ctx.fillRect(center, ry - 9, 1, 10);\n    const norm = Math.max(-1, Math.min(1, r.val / r.scale));\n    ctx.fillStyle = r.color;\n    if (norm >= 0) {\n      ctx.fillRect(center, ry - 9, norm * (barW / 2), 10);\n    } else {\n      ctx.fillRect(center + norm * (barW / 2), ry - 9, -norm * (barW / 2), 10);\n    }\n  }\n}\n\nlab.onLoop(drawFrame);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分频率单位：公式中的 W 是数字角频率（范围 0 到 π 弧度/采样点），实际采样率下的换算关系为 W = 2π · f_c / f_s；而原始母版的截止频率固定是 1 弧度（约 0.159·f_s）。",
        "严防 b₁, b₂ 正负号踩坑：Smith 本书 Eq 33-13 的输出反馈采用加号约定 y[n] = ... + b₁y[n-1] + b₂y[n-2]。如果把算出的系数交给 MATLAB、SciPy 或 Web Audio API 的 IIRFilterNode（它们默认分母为 1 + b₁z⁻¹ + b₂z⁻²），务必对 b₁ 和 b₂ 取反。",
        "高阶滤波器须逐级变换：Eq 33-13 针对单个二阶节（Biquad）。遇到 4 阶、6 阶等由多个二阶节级联的滤波器时，只需要用同一个 k 值对每一个二阶节分别套用一遍 Eq 33-13 即可，无需展开高阶多项式。",
        "警惕极端边界精度：尽量避免将 W 设得无限贴近 0 或 π，此时 |k| → 1，极点被极度挤压到单位圆边缘，在单精度浮点下容易出现舍入误差或振荡。"
      ]
    }
  ]
});
