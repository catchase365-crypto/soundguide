window.__BOOK_REGISTER_SECTION__("sec_114", {
  "title": "矩形脉冲与 Sinc 函数 (The Sinc Function)",
  "intuition": "时域里一个干净利落的矩形脉冲截断，在频域里会化作一条不断衰减振荡的 Sinc 曲线；脉冲越宽，频谱的主瓣就越窄，能量越集中。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 矩形脉冲与 Sinc 变换对：对称性与“解缠幅度”",
      "paragraphs": [
        "在数字信号处理中，**矩形脉冲（Rectangular Pulse）**与 **Sinc 函数**（读作 sink）是最经典的一对傅里叶变换对。数学上通常把归一化形式定义为 `sinc(a) = sin(πa)/(πa)`，但在工程口语中也常笼统地说成 `sin(x)/x`——本质上就是一条振幅按 `1/x` 规律衰减的正弦波。",
        "观察脉冲在时域的位置，能瞬间看透**幅度与相位的关系**：如果把长度为 `M` 的矩形脉冲**以第 0 号样本为中心左右对称摆放**（由于 DFT 具备周期性，脉冲的左半边出现在序列末尾，右半边出现在序列开头），此时信号关于样本 0 偶对称，DFT 的虚部完全为零。",
        "为了直观观察波形，教材引入了**解缠幅度（Unwrapped Magnitude）**的概念：允许幅度像正弦波一样在正负之间振荡，此时相位恒为 `0`。但严格按数学定义，幅度谱必须**非负**，因此真实幅度谱会把负半周翻折上来，并把对应频率点的相位瞬间跳变 `π` 弧度（180° 反相）。",
        "如果把同一个矩形脉冲向右平移到数组中间（不再关于样本 0 对称），它的**幅度谱纹丝不动**，但相位谱会叠加一个巨大的线性斜坡并不断在 `±π` 之间回绕，变成一团看似杂乱无章的锯齿。"
      ],
      "formula": {
        "expr": "sinc(a) = sin(πa) / (πa)  （一般形式：sin(x) / x）",
        "explain": "a 或 x 为自变量（对应频率或时间比例）。随着 x 增大，分子 sin(x) 在 ±1 间振荡，分母 x 线性增大，形成标志性的“中间主峰高耸、两侧旁瓣递减”的波形。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：矩形脉冲 DFT/DTFT 全景透视（复现 Fig. 11-3）",
      "instruction": "拖动“矩形脉冲宽度 M”观察零点移动与主瓣收缩；拖动“时域脉冲平移”观察相位如何从整齐的 0/π 瞬间变成锯齿乱麻；切换开关对比“解缠幅度”和“去混叠纯 Sinc”。",
      "controls": [
        {
          "type": "slider",
          "id": "M",
          "label": "矩形脉冲宽度 M",
          "min": 3,
          "max": 31,
          "step": 2,
          "value": 15,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "shift",
          "label": "时域脉冲平移",
          "min": 0,
          "max": 32,
          "step": 1,
          "value": 0,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "unwrapped",
          "label": "显示解缠幅度 (允许负值)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "noAlias",
          "label": "叠加去混叠纯 Sinc (sin(x)/x)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 64;\n\nfunction draw() {\n  const M = lab.values.M;\n  const shift = lab.values.shift;\n  const unwrapped = lab.values.unwrapped;\n  const noAlias = lab.values.noAlias;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const x = new Array(N).fill(0);\n  const half = Math.floor(M / 2);\n  for (let i = 0; i < M; i++) {\n    const idx = ((shift - half + i) % N + N) % N;\n    x[idx] = 1;\n  }\n\n  const K = N / 2;\n  const re = new Array(K + 1).fill(0);\n  const im = new Array(K + 1).fill(0);\n  const mag = new Array(K + 1).fill(0);\n  const phase = new Array(K + 1).fill(0);\n\n  for (let k = 0; k <= K; k++) {\n    let r = 0, imVal = 0;\n    for (let n = 0; n < N; n++) {\n      if (x[n] !== 0) {\n        const ang = (2 * Math.PI * k * n) / N;\n        r += x[n] * Math.cos(ang);\n        imVal -= x[n] * Math.sin(ang);\n      }\n    }\n    re[k] = r;\n    im[k] = imVal;\n    mag[k] = Math.hypot(r, imVal);\n    if (Math.abs(imVal) < 1e-9) {\n      phase[k] = r >= -1e-9 ? 0 : Math.PI;\n    } else {\n      phase[k] = Math.atan2(imVal, r);\n    }\n  }\n\n  const p1 = { x: 18, y: 28, w: 204, h: 188, title: \"时域矩形脉冲 x[n] (N=64)\" };\n  const p2 = { x: 250, y: 28, w: 222, h: 188, title: unwrapped ? \"频域: 解缠幅度 (可负)\" : \"频域: 幅度谱 |X(f)|\" };\n  const p3 = { x: 498, y: 28, w: 204, h: 188, title: \"频域: 相位谱 (rad)\" };\n\n  function drawPanelGrid(p, yMin, yMax, yTicks) {\n    ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n    ctx.lineWidth = 1;\n    ctx.strokeRect(p.x, p.y, p.w, p.h);\n    for (let i = 0; i <= 4; i++) {\n      const gx = p.x + (p.w * i) / 4;\n      ctx.beginPath();\n      ctx.moveTo(gx, p.y);\n      ctx.lineTo(gx, p.y + p.h);\n      ctx.stroke();\n    }\n    yTicks.forEach(v => {\n      const gy = p.y + p.h - ((v - yMin) / (yMax - yMin)) * p.h;\n      ctx.beginPath();\n      ctx.strokeStyle = Math.abs(v) < 1e-6 ? \"rgba(255,255,255,0.22)\" : \"rgba(255,255,255,0.08)\";\n      ctx.moveTo(p.x, gy);\n      ctx.lineTo(p.x + p.w, gy);\n      ctx.stroke();\n    });\n    ctx.fillStyle = \"#f8fafc\";\n    ctx.font = \"bold 11px sans-serif\";\n    ctx.fillText(p.title, p.x, p.y - 8);\n  }\n\n  drawPanelGrid(p1, -0.3, 1.4, [0, 1]);\n  const baseY1 = p1.y + p1.h - ((0 - (-0.3)) / 1.7) * p1.h;\n  const oneY1 = p1.y + p1.h - ((1 - (-0.3)) / 1.7) * p1.h;\n  for (let n = 0; n < N; n++) {\n    const sx = p1.x + (n / (N - 1)) * p1.w;\n    ctx.strokeStyle = x[n] > 0 ? \"#10b981\" : \"rgba(255,255,255,0.22)\";\n    ctx.lineWidth = x[n] > 0 ? 2.2 : 1;\n    ctx.beginPath();\n    ctx.moveTo(sx, baseY1);\n    ctx.lineTo(sx, x[n] > 0 ? oneY1 : baseY1);\n    ctx.stroke();\n    if (x[n] > 0) {\n      ctx.fillStyle = \"#10b981\";\n      ctx.beginPath();\n      ctx.arc(sx, oneY1, 2.2, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n  ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n  ctx.font = \"10px monospace\";\n  ctx.fillText(\"0\", p1.x, p1.y + p1.h + 13);\n  ctx.fillText(\"32\", p1.x + p1.w / 2 - 6, p1.y + p1.h + 13);\n  ctx.fillText(\"63\", p1.x + p1.w - 14, p1.y + p1.h + 13);\n\n  const yMax2 = Math.max(10, M * 1.15);\n  const yMin2 = unwrapped ? -M * 0.35 : -M * 0.08;\n  drawPanelGrid(p2, yMin2, yMax2, [0, M]);\n  const mapY2 = v => p2.y + p2.h - ((v - yMin2) / (yMax2 - yMin2)) * p2.h;\n\n  if (noAlias) {\n    ctx.strokeStyle = \"#f59e0b\";\n    ctx.lineWidth = 1.6;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const f = (i / 200) * 0.5;\n      let val = f === 0 ? M : Math.sin(Math.PI * f * M) / (Math.PI * f);\n      if (!unwrapped) val = Math.abs(val);\n      const px = p2.x + (f / 0.5) * p2.w;\n      const py = mapY2(val);\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const f = (i / 200) * 0.5;\n    let val = f === 0 ? M : Math.sin(Math.PI * f * M) / Math.sin(Math.PI * f);\n    if (!unwrapped) val = Math.abs(val);\n    const px = p2.x + (f / 0.5) * p2.w;\n    const py = mapY2(val);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let k = 0; k <= K; k++) {\n    const f = k / N;\n    const px = p2.x + (f / 0.5) * p2.w;\n    let val = mag[k];\n    if (unwrapped) {\n      val = f === 0 ? M : Math.sin(Math.PI * f * M) / Math.sin(Math.PI * f);\n    }\n    const py = mapY2(val);\n    ctx.fillStyle = \"#10b981\";\n    ctx.beginPath();\n    ctx.arc(px, py, 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n  ctx.font = \"10px monospace\";\n  ctx.fillText(\"0\", p2.x, p2.y + p2.h + 13);\n  ctx.fillText(\"0.25\", p2.x + p2.w / 2 - 10, p2.y + p2.h + 13);\n  ctx.fillText(\"0.5 fs\", p2.x + p2.w - 30, p2.y + p2.h + 13);\n  ctx.fillStyle = \"#38bdf8\";\n  ctx.fillText(\"— 含混叠DTFT\", p2.x + p2.w - 86, p2.y + 13);\n  if (noAlias) {\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.fillText(\"-- 纯Sinc\", p2.x + p2.w - 86, p2.y + 26);\n  }\n\n  drawPanelGrid(p3, -Math.PI * 1.15, Math.PI * 1.15, [-Math.PI, 0, Math.PI]);\n  const mapY3 = v => p3.y + p3.h - ((v + Math.PI * 1.15) / (2.3 * Math.PI)) * p3.h;\n\n  ctx.strokeStyle = \"#ec4899\";\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (let k = 0; k <= K; k++) {\n    const f = k / N;\n    const px = p3.x + (f / 0.5) * p3.w;\n    let ph = phase[k];\n    if (unwrapped && shift === 0) ph = 0;\n    const py = mapY3(ph);\n    if (k === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let k = 0; k <= K; k++) {\n    const f = k / N;\n    const px = p3.x + (f / 0.5) * p3.w;\n    let ph = phase[k];\n    if (unwrapped && shift === 0) ph = 0;\n    const py = mapY3(ph);\n    ctx.fillStyle = \"#ec4899\";\n    ctx.beginPath();\n    ctx.arc(px, py, 2.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n  ctx.font = \"10px monospace\";\n  ctx.fillText(\"-π\", p3.x - 14, mapY3(-Math.PI) + 3);\n  ctx.fillText(\"0\", p3.x - 10, mapY3(0) + 3);\n  ctx.fillText(\"+π\", p3.x - 14, mapY3(Math.PI) + 3);\n  ctx.fillText(\"0\", p3.x, p3.y + p3.h + 13);\n  ctx.fillText(\"0.5 fs\", p3.x + p3.w - 30, p3.y + p3.h + 13);\n\n  const firstZero = (1 / M).toFixed(4);\n  lab.setReadout(`脉宽 M=${M} | 第1零点频率 f=1/M=${firstZero} fs | 平移=${shift}点 | f=0.5处混叠使幅度抬高约 57% (相对差异36.3%)`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. 离散频谱、36% 混叠效应与过零点的物理直觉",
      "paragraphs": [
        "在离散时间信号中（长度为 `N`，其中有 `M` 个连续的 `1`），DFT 与 DTFT 频谱的分母并不是 `πf`，而是 **`sin(πf)`**（即所谓的 **Dirichlet 核**）。原因在于离散频谱具有周期性，当频率超过奈奎斯特频率 `f = 0.5` 时，未衰减完的 Sinc 尾巴会从下一个周期“折叠”回来产生**混叠（Aliasing）**。",
        "幸好在 `f ∈ [0, 0.5]` 范围内，`πf` 只在 `0` 到 `π/2 ≈ 1.57` 之间变化。在这段区间里 `sin(x)` 与 `x` 非常接近：在 `f = 0` 处两者完全相等；直到最右端 `f = 0.5` 时，`sin(π/2) = 1` 而 `π/2 ≈ 1.57`，两者才拉开约 **36%** 的差异。这解释了为什么离散矩形脉冲的频谱在高频端会比理想纯 Sinc 稍微翘起一点。",
        "Sinc 曲线在哪些频率精确归零？答案极具直觉：**当某个频率的正弦波在矩形脉冲宽度 `M` 内刚好容纳整数个完整周期时，频谱必定为零**（即 `f = 1/M, 2/M, 3/M...`）。因为用相关法算 DFT 时，矩形脉冲相当于把脉冲框内的正弦波样本全部相加——完整周期的正负半周面积正好完全抵消！",
        "写代码计算 Sinc 时有一个著名的**除零坑**：在直流点 `x = 0`（或 `f = 0`）处，公式变成 `0 / 0`，计算机会直接报错崩溃（`NaN` 或 `ZeroDivisionError`）。数学上当 `x → 0` 时 `sin(x) ≈ x`，因此极限为 `1`（对宽度为 `M` 的脉冲则为 `M`）。程序里必须显式判断 `if (x == 0) return M;`。"
      ],
      "formula": {
        "expr": "Mag X[k] = | sin(πkM / N) / sin(πk / N) |，    Mag X(f) = | sin(πfM) / sin(πf) |",
        "explain": "N 为信号总点数，M 为矩形脉冲宽度，k 为频点索引 (0..N/2)，f = k/N 为归一化采样率分数 (0..0.5)。去掉混叠时只需把分母的 sin(...) 替换成括号内的角度本身。k=0 或 f=0 时必须强制赋值 M。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 为什么 Sinc 决定了所有频谱分析的分辨率？",
      "paragraphs": [
        "现实中的信号往往很长甚至无限长，但计算机的 DFT 只能处理有限长度的 `M` 个采样点。“从长信号中截取 `M` 个点”，在数学上完全等价于：**把无限长的原信号乘以一个宽度为 `M` 的矩形脉冲（矩形窗）**——窗内保留为 `1`，窗外清零。",
        "根据傅里叶变换的核心定理：**时域相乘，等于频域卷积**。原信号原本在频域可能是几根极其锋利的谱线，但一旦在时域被矩形脉冲截断，它的频谱就必须和对应的 Sinc 函数做卷积！",
        "这一卷积带来两个深刻后果：第一，原本细如针尖的谱峰被 Sinc 的**主瓣（Main Lobe）**展宽了，如果两个频率靠得太近（间隔小于约 `1/M`），它们的峰就会糊在一起无法分辨；第二，Sinc 不断振荡的**旁瓣（Sidelobes）**会把强信号的能量泄漏到周围频率，淹没微弱信号（即**频谱泄漏**）。想提高频谱分辨率？唯一的硬道理就是增大截取长度 `M`，把 Sinc 主瓣压窄。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "实验二：矩形窗截断分辨率与听觉频谱扩散实验室",
      "instruction": "保持“双音频率间隔 Δf”较小（如 0.035），把“矩形截断窗长 M”从 16 慢慢拉到 96，观察模糊的单个大包如何裂变成两个清晰谱峰；点击播放声音，亲耳听出短窗截断带来的粗糙边带扩散感。",
      "controls": [
        {
          "type": "slider",
          "id": "M",
          "label": "矩形截断窗长 M",
          "min": 12,
          "max": 96,
          "step": 2,
          "value": 28,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "deltaF",
          "label": "双音频率间隔 Δf",
          "min": 0.01,
          "max": 0.1,
          "step": 0.005,
          "value": 0.035,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "showIdeal",
          "label": "显示理想无限长频谱 (双脉冲)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 对比听感：矩形窗截断音色扩散",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet activeSource = null;\n\nfunction stopAudio() {\n  if (activeSource) {\n    try { activeSource.stop(); } catch (e) {}\n    try { activeSource.disconnect(); } catch (e) {}\n    activeSource = null;\n  }\n}\n\nfunction updateAudio(M, deltaF, shouldPlay) {\n  stopAudio();\n  if (!shouldPlay) return;\n  const audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === \"suspended\") {\n    audioCtx.resume();\n  }\n  const sr = audioCtx.sampleRate;\n  const dur = 0.5;\n  const totalSamples = Math.floor(sr * dur);\n  const buffer = audioCtx.createBuffer(1, totalSamples, sr);\n  const data = buffer.getChannelData(0);\n\n  const f1 = 440;\n  const f2 = 440 + Math.round((deltaF * 4000) / 2) * 2;\n  const frames = 10;\n  const frameLen = totalSamples / frames;\n  const activeLen = (M / 96) * frameLen;\n\n  for (let i = 0; i < totalSamples; i++) {\n    const t = i / sr;\n    const posInFrame = i % frameLen;\n    const win = posInFrame < activeLen ? 1 : 0;\n    const sig = 0.5 * (Math.sin(2 * Math.PI * f1 * t) + Math.sin(2 * Math.PI * f2 * t));\n    data[i] = sig * win * 0.16;\n  }\n\n  const src = audioCtx.createBufferSource();\n  src.buffer = buffer;\n  src.loop = true;\n  src.connect(audioCtx.destination);\n  src.start();\n  activeSource = src;\n}\n\nfunction draw() {\n  const M = lab.values.M;\n  const deltaF = lab.values.deltaF;\n  const showIdeal = lab.values.showIdeal;\n  const isPlaying = lab.values.play;\n\n  updateAudio(M, deltaF, isPlaying);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const f1 = 0.14;\n  const f2 = f1 + deltaF;\n\n  const p1 = { x: 18, y: 28, w: 274, h: 188, title: \"时域: 原始信号 × 矩形窗截断\" };\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  ctx.strokeRect(p1.x, p1.y, p1.w, p1.h);\n\n  const midY1 = p1.y + p1.h / 2;\n  ctx.beginPath();\n  ctx.strokeStyle = \"rgba(255,255,255,0.2)\";\n  ctx.moveTo(p1.x, midY1);\n  ctx.lineTo(p1.x + p1.w, midY1);\n  ctx.stroke();\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 11px sans-serif\";\n  ctx.fillText(p1.title, p1.x, p1.y - 8);\n\n  const Nview = 104;\n  const halfM = M / 2;\n  const centerN = Nview / 2;\n  const winStartN = centerN - halfM;\n  const winEndN = centerN + halfM;\n\n  const wx1 = p1.x + (winStartN / (Nview - 1)) * p1.w;\n  const wx2 = p1.x + (winEndN / (Nview - 1)) * p1.w;\n  ctx.fillStyle = \"rgba(245, 158, 11, 0.12)\";\n  ctx.fillRect(wx1, p1.y + 18, wx2 - wx1, p1.h - 36);\n  ctx.strokeStyle = \"#f59e0b\";\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(wx1, p1.y + 18, wx2 - wx1, p1.h - 36);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.18)\";\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (let i = 0; i < Nview; i++) {\n    const n = i - centerN;\n    const val = 0.5 * (Math.cos(2 * Math.PI * f1 * n) + Math.cos(2 * Math.PI * f2 * n));\n    const px = p1.x + (i / (Nview - 1)) * p1.w;\n    const py = midY1 - val * (p1.h * 0.34);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < Nview; i++) {\n    const n = i - centerN;\n    const inWin = i >= winStartN && i <= winEndN;\n    const val = inWin ? 0.5 * (Math.cos(2 * Math.PI * f1 * n) + Math.cos(2 * Math.PI * f2 * n)) : 0;\n    const px = p1.x + (i / (Nview - 1)) * p1.w;\n    const py = midY1 - val * (p1.h * 0.34);\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const p2 = { x: 320, y: 28, w: 382, h: 188, title: \"频域: 原始频谱 ★ Sinc(f) 卷积结果 (主瓣决定分辨率)\" };\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  ctx.strokeRect(p2.x, p2.y, p2.w, p2.h);\n  for (let i = 1; i < 4; i++) {\n    const gx = p2.x + (p2.w * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(gx, p2.y);\n    ctx.lineTo(gx, p2.y + p2.h);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = \"#f8fafc\";\n  ctx.font = \"bold 11px sans-serif\";\n  ctx.fillText(p2.title, p2.x, p2.y - 8);\n\n  const fMin = 0.04;\n  const fMax = 0.34;\n  const baseY2 = p2.y + p2.h - 12;\n  const scaleY2 = p2.h - 32;\n\n  if (showIdeal) {\n    ctx.strokeStyle = \"rgba(248, 250, 252, 0.55)\";\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 3]);\n    [f1, f2].forEach(fi => {\n      const fx = p2.x + ((fi - fMin) / (fMax - fMin)) * p2.w;\n      ctx.beginPath();\n      ctx.moveTo(fx, baseY2);\n      ctx.lineTo(fx, baseY2 - scaleY2 * 0.85);\n      ctx.stroke();\n    });\n    ctx.setLineDash([]);\n  }\n\n  const numPts = 260;\n  const spec = new Array(numPts + 1);\n  let maxSpec = 1e-6;\n  const mStart = -Math.floor(M / 2);\n  const mEnd = mStart + M - 1;\n\n  for (let i = 0; i <= numPts; i++) {\n    const f = fMin + (i / numPts) * (fMax - fMin);\n    let re = 0, im = 0;\n    for (let n = mStart; n <= mEnd; n++) {\n      const sig = 0.5 * (Math.cos(2 * Math.PI * f1 * n) + Math.cos(2 * Math.PI * f2 * n));\n      const ang = 2 * Math.PI * f * n;\n      re += sig * Math.cos(ang);\n      im -= sig * Math.sin(ang);\n    }\n    const mag = Math.hypot(re, im) / M;\n    spec[i] = mag;\n    if (mag > maxSpec) maxSpec = mag;\n  }\n\n  const normFactor = Math.max(0.5, maxSpec);\n  ctx.strokeStyle = \"#38bdf8\";\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (let i = 0; i <= numPts; i++) {\n    const px = p2.x + (i / numPts) * p2.w;\n    const py = baseY2 - (spec[i] / normFactor) * scaleY2 * 0.92;\n    if (i === 0) ctx.moveTo(px, py);\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.lineTo(p2.x + p2.w, baseY2);\n  ctx.lineTo(p2.x, baseY2);\n  ctx.closePath();\n  ctx.fillStyle = \"rgba(56, 189, 248, 0.14)\";\n  ctx.fill();\n\n  ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n  ctx.font = \"10px monospace\";\n  ctx.fillText(\"0.04\", p2.x, p2.y + p2.h + 13);\n  ctx.fillText(\"0.19\", p2.x + p2.w / 2 - 12, p2.y + p2.h + 13);\n  ctx.fillText(\"0.34 fs\", p2.x + p2.w - 38, p2.y + p2.h + 13);\n\n  const mainLobeWidth = 1 / M;\n  const resolved = deltaF > mainLobeWidth * 1.1;\n  lab.setReadout(`窗长 M=${M} | 主瓣半宽 1/M=${mainLobeWidth.toFixed(4)} fs | 双音间隔 Δf=${deltaF.toFixed(3)} fs -> ${resolved ? \"✅ 可清晰分辨双峰\" : \"⚠️ 主瓣过宽，双峰已混叠成单峰！\"}`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【代码必避除零陷阱】写程序计算 `sin(x)/x` 或 `sin(πfM)/sin(πf)` 时，必须对 `x == 0`（或浮点极小值 `Math.abs(x) < 1e-12`）做特判并直接返回极限值 `1`（或 `M`），否则直流分量处必出 `NaN`。",
        "【零点位置秒算口诀】宽度为 `M` 个点的矩形脉冲，其 Sinc 频谱的第 `n` 个过零点精确落在 `f = n / M`（即脉冲内刚好塞进 `n` 个完整正弦周期）。",
        "【时移只改相位不改幅度】分析矩形脉冲形状时，若想看清干净的实数/解缠 Sinc 波形，应将脉冲关于第 0 号样本对称放置；一旦平移，相位谱就会立刻混入线性斜坡而变得极难肉眼判读。",
        "【离散与连续的 36% 差异】由于采样混叠，离散矩形脉冲的真实频谱分母是 `sin(πf)` 而非 `πf`，在接近奈奎斯特极限 `f = 0.5` 时振幅会比连续纯 Sinc 翘起（两者差异约 36%）。",
        "【频谱分辨率的物理上限】用 DFT 分析信号本质就是乘以矩形窗、频域卷积 Sinc。想把靠得很近的两个频率分辨开，只有拉长采集窗口 `M` 来压窄 Sinc 主瓣这一条根本出路。"
      ]
    }
  ]
});
