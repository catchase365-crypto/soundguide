window.__BOOK_REGISTER_SECTION__("sec_098", {
  "title": "麻烦 5：相位的 2π 模糊性与相位解缠 (2π Ambiguity & Phase Unwrapping)",
  "intuition": "正弦波每转动 2π 弧度就完全重合，计算机总喜欢把相位强制折叠在 [-π, π] 区间里造成锯齿状“假断崖”；通过给相邻采样点加减 2π 整数倍的“相位解缠”，就能还原出平滑连续的真实相位趋势。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、为什么相位图会出现“悬崖式”跳变？",
      "paragraphs": [
        "在数字信号处理中，当我们把离散傅里叶变换（DFT）得到的直角坐标（实部与虚部）转换为极坐标（幅度与相位）时，经常会在相位图上看到非常诡异的**剧烈断崖**：相位线明明正平滑地向下走，眼看就要跌破 `-3.14159`（即 `-π`），下一瞬间却突然“啪”地一下弹回到了 `+3.14159`（即 `+π`）。",
        "这并不是信号真的发生了突变，而是**正弦函数周期性**导致的“视觉假象”。从物理和几何上看，一个相移为 `θ` 的正弦波，与相移为 `θ + 2π`、`θ + 4π`、`θ - 2π` 的正弦波是**完全一模一样**的——你在单位圆上转一整圈（`2π` 弧度），终究会回到同一个点。",
        "既然一个点对应着无穷多个等效的相位值（`θ + 2kπ`），计算机的反正切算法在计算时只能从中挑选一个“最省事”的代表值。行业惯例是永远选取绝对值最小的那一个主值，把计算结果强行锁死在 **`[-π, π]`** 区间内。于是，一旦真实相位越过 `-π` 或 `+π` 的边界，计算机就会把它“折返”到另一端，制造出锯齿状的虚假跳变，这就是所谓的 **2π 模糊性（2π Ambiguity）**。"
      ],
      "formula": {
        "expr": "sin(ωt + θ) = sin(ωt + θ + 2π·k),   k ∈ ℤ",
        "explain": "ω 为角频率，t 为时间，θ 为原始相位（弧度），k 为任意整数。给相位加上或减去 2π 的任意整数倍，正弦波在时域和频域上没有任何区别。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：验证正弦波的 2π 等效性与主值截断",
      "instruction": "拖动“2π 倍数 k”滑块观察单位圆相量与时域正弦波的重合现象，并点击播放按钮确认声音毫无变化；再观察下方状态栏中被截断后的主值相位。",
      "controls": [
        {
          "type": "slider",
          "id": "theta",
          "label": "基础相位 θ",
          "min": -3.14,
          "max": 3.14,
          "step": 0.05,
          "value": 0.6,
          "unit": " rad"
        },
        {
          "type": "slider",
          "id": "k",
          "label": "2π 倍数 k",
          "min": -3,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": " 圈"
        },
        {
          "type": "toggle",
          "id": "showRef",
          "label": "显示参考波 sin(ωt + θ)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放正弦波对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gain = null;\n\nfunction wrapPi(rad) {\n  return Math.atan2(Math.sin(rad), Math.cos(rad));\n}\n\nfunction syncAudio() {\n  if (lab.values.play) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gain = ac.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = 220;\n      gain.gain.value = 0.14;\n      osc.connect(gain);\n      gain.connect(ac.destination);\n      osc.start();\n    }\n  } else {\n    if (osc) {\n      try { osc.stop(); } catch (e) {}\n      try { osc.disconnect(); } catch (e) {}\n      osc = null;\n    }\n    if (gain) {\n      try { gain.disconnect(); } catch (e) {}\n      gain = null;\n    }\n  }\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const theta = lab.values.theta;\n  const k = lab.values.k;\n  const totalPhase = theta + k * 2 * Math.PI;\n  const wrapped = wrapPi(totalPhase);\n\n  ctx.clearRect(0, 0, W, H);\n\n  const cx = 115;\n  const cy = 115;\n  const r = 70;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - r - 18, cy);\n  ctx.lineTo(cx + r + 18, cy);\n  ctx.moveTo(cx, cy - r - 18);\n  ctx.lineTo(cx, cy + r + 18);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, cy, r, 0, Math.PI * 2);\n  ctx.stroke();\n\n  if (k !== 0) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.65)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    const steps = Math.abs(k) * 48;\n    const dir = k > 0 ? 1 : -1;\n    for (let i = 0; i <= steps; i++) {\n      const t = i / steps;\n      const ang = theta + dir * t * Math.abs(k) * Math.PI * 2;\n      const rad = 14 + t * (r - 20);\n      const px = cx + rad * Math.cos(-ang);\n      const py = cy + rad * Math.sin(-ang);\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  const px = cx + r * Math.cos(-totalPhase);\n  const py = cy + r * Math.sin(-totalPhase);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 3;\n  ctx.beginPath();\n  ctx.moveTo(cx, cy);\n  ctx.lineTo(px, py);\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath();\n  ctx.arc(px, py, 5, 0, Math.PI * 2);\n  ctx.fill();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('单位圆相量 (指向完全相同)', cx, 220);\n\n  const gx = 245;\n  const gy = 26;\n  const gw = 450;\n  const gh = 172;\n  const midY = gy + gh / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const y = gy + (gh * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(gx, y);\n    ctx.lineTo(gx + gw, y);\n    ctx.stroke();\n  }\n  for (let i = 0; i <= 4; i++) {\n    const x = gx + (gw * i) / 4;\n    ctx.beginPath();\n    ctx.moveTo(x, gy);\n    ctx.lineTo(x, gy + gh);\n    ctx.stroke();\n  }\n\n  if (lab.values.showRef) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 4.5;\n    ctx.beginPath();\n    for (let i = 0; i <= 200; i++) {\n      const t = i / 200;\n      const x = gx + t * gw;\n      const y = midY - Math.sin(t * Math.PI * 4 + theta) * (gh * 0.42);\n      if (i === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i <= 200; i++) {\n    const t = i / 200;\n    const x = gx + t * gw;\n    const y = midY - Math.sin(t * Math.PI * 4 + totalPhase) * (gh * 0.42);\n    if (i === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('天蓝: sin(ωt + θ + 2kπ)', gx + 8, gy + 16);\n  if (lab.values.showRef) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('琥珀: 参考 sin(ωt + θ) — 完全重叠', gx + 185, gy + 16);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.72)';\n  ctx.textAlign = 'center';\n  ctx.fillText('时间轴 (2 个完整周期)', gx + gw / 2, 220);\n\n  lab.setReadout(\n    '基础相位 θ = ' + theta.toFixed(2) + ' rad | ' +\n    '总相位 θ + 2kπ = ' + totalPhase.toFixed(2) + ' rad (k=' + k + ') | ' +\n    '计算机截断主值 [-π, π] = ' + wrapped.toFixed(2) + ' rad'\n  );\n}\n\nlab.onUpdate(() => {\n  syncAudio();\n  draw();\n});"
    },
    {
      "type": "concept",
      "heading": "二、相位解缠 (Phase Unwrapping)：把断崖铺成坦途",
      "paragraphs": [
        "虽然被折叠进 `[-π, π]` 的相位在数学上完全等效，但在工程分析中却极难看懂——例如分析系统的线性相位延迟时，你原本期待看到的是一条斜率恒定的直线（代表时间延迟），结果计算机却给你画出一排锯齿波。",
        "为了看清相位的真实走势，哪怕它的数值超出 `+π` 或低于 `-π`，我们也希望把这些人为断崖消除掉。这个过程就叫做**相位解缠（Unwrapping the Phase）**。",
        "原书 **Table 8-4** 给出了极其经典的逐点解缠算法：假设序列第一个点 `UWPHASE[0] = 0`（或等于原始相位起点），随后依次遍历每一个采样点 `K`。算法的核心思想非常朴素——**让相邻两个采样点之间的相位差尽量小**。具体做法是计算前一个已解缠点 `UWPHASE[K-1]` 与当前折叠点 `PHASE[K]` 的差值，看看这个差值大约等于几个 `2π`，四舍五入取整得到整数 `C`，最后给当前点加上 `C * 2π` 即可。"
      ],
      "formula": {
        "expr": "C[k] = round( (UW[k-1] - P[k]) / (2π) ),   UW[k] = P[k] + 2π · C[k]",
        "explain": "P[k] 是计算机直接算出的折叠相位（位于 [-π, π]）；UW[k-1] 是上一个点解缠后的相位；round() 表示四舍五入取整，求出需要补偿的 2π 圈数 C[k]；UW[k] 即为最终解缠得到的连续相位。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：相位解缠器（复刻 Fig. 8-12 与 Table 8-4 算法）",
      "instruction": "拖动“真实相位总变化量”滑块复刻原书 Fig. 8-12 的锯齿解缠效果；试着把变化量推到 ±64π 以上或增大“相位噪声”，观察何时会出现解缠失败！",
      "controls": [
        {
          "type": "slider",
          "id": "slope",
          "label": "真实相位总变化量 (×π)",
          "min": -70,
          "max": 70,
          "step": 1,
          "value": -10,
          "unit": " π"
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "相位噪声幅度",
          "min": 0,
          "max": 1.5,
          "step": 0.05,
          "value": 0,
          "unit": " rad"
        },
        {
          "type": "toggle",
          "id": "unwrap",
          "label": "开启 Table 8-4 相位解缠",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showTrue",
          "label": "叠加真实连续相位参考线",
          "value": true
        }
      ],
      "jsCode": "const N = 65;\nconst baseNoise = [];\nfor (let i = 0; i < N; i++) {\n  if (i === 0) {\n    baseNoise.push(0);\n  } else {\n    const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n    baseNoise.push((s - Math.floor(s)) * 2 - 1);\n  }\n}\n\nfunction wrapToPi(val) {\n  let v = val;\n  while (v > Math.PI) v -= 2 * Math.PI;\n  while (v < -Math.PI) v += 2 * Math.PI;\n  return v;\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  const slopePi = lab.values.slope;\n  const noiseAmp = lab.values.noise;\n  const doUnwrap = lab.values.unwrap;\n  const showTrue = lab.values.showTrue;\n\n  const truePhase = [];\n  const wrappedPhase = [];\n  const uwPhase = [];\n\n  for (let k = 0; k < N; k++) {\n    const frac = k / (N - 1);\n    const tp = frac * slopePi * Math.PI + baseNoise[k] * noiseAmp;\n    truePhase.push(tp);\n    wrappedPhase.push(wrapToPi(tp));\n  }\n\n  uwPhase.push(wrappedPhase[0]);\n  let wrapCount = 0;\n  for (let k = 1; k < N; k++) {\n    const c = Math.round((uwPhase[k - 1] - wrappedPhase[k]) / (2 * Math.PI));\n    if (c !== 0) wrapCount++;\n    uwPhase.push(wrappedPhase[k] + c * 2 * Math.PI);\n  }\n\n  let minY = -Math.PI * 1.2;\n  let maxY = Math.PI * 1.2;\n  const checkArr = showTrue ? truePhase.concat(uwPhase) : (doUnwrap ? uwPhase : wrappedPhase);\n  for (let i = 0; i < checkArr.length; i++) {\n    if (checkArr[i] < minY) minY = checkArr[i];\n    if (checkArr[i] > maxY) maxY = checkArr[i];\n  }\n  const padY = Math.max(1.5, (maxY - minY) * 0.14);\n  minY -= padY;\n  maxY += padY;\n\n  const gx = 58;\n  const gy = 22;\n  const gw = W - 82;\n  const gh = H - 56;\n\n  function toX(k) {\n    return gx + (k / (N - 1)) * gw;\n  }\n  function toY(val) {\n    return gy + gh - ((val - minY) / (maxY - minY)) * gh;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 5; i++) {\n    const x = gx + (gw * i) / 5;\n    ctx.beginPath();\n    ctx.moveTo(x, gy);\n    ctx.lineTo(x, gy + gh);\n    ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText((i * 0.1).toFixed(1), x, gy + gh + 16);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.fillText('归一化频率 (Frequency)', gx + gw / 2, H - 4);\n\n  const yPiTop = toY(Math.PI);\n  const yPiBot = toY(-Math.PI);\n  ctx.fillStyle = 'rgba(56,189,248,0.08)';\n  ctx.fillRect(gx, yPiTop, gw, yPiBot - yPiTop);\n\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(gx, yPiTop);\n  ctx.lineTo(gx + gw, yPiTop);\n  ctx.moveTo(gx, yPiBot);\n  ctx.lineTo(gx + gw, yPiBot);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const yZero = toY(0);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(gx, yZero);\n  ctx.lineTo(gx + gw, yZero);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.72)';\n  ctx.textAlign = 'right';\n  ctx.fillText('+π', gx - 6, yPiTop + 4);\n  ctx.fillText('-π', gx - 6, yPiBot + 4);\n  ctx.fillText('0', gx - 6, yZero + 4);\n  ctx.fillText(maxY.toFixed(0), gx - 6, gy + 8);\n  ctx.fillText(minY.toFixed(0), gx - 6, gy + gh);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let k = 0; k < N; k++) {\n    const x = toX(k);\n    const y = toY(wrappedPhase[k]);\n    if (k === 0) ctx.moveTo(x, y);\n    else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  for (let k = 0; k < N; k++) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(toX(k) - 2, toY(wrappedPhase[k]) - 2, 4, 4);\n  }\n\n  if (showTrue) {\n    ctx.strokeStyle = 'rgba(245,158,11,0.9)';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (let k = 0; k < N; k++) {\n      const x = toX(k);\n      const y = toY(truePhase[k]);\n      if (k === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  if (doUnwrap) {\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let k = 0; k < N; k++) {\n      const x = toX(k);\n      const y = toY(uwPhase[k]);\n      if (k === 0) ctx.moveTo(x, y);\n      else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('■ 折叠相位 [-π, π]', gx + 8, gy + 12);\n  if (doUnwrap) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('━ 解缠相位 (Table 8-4)', gx + 145, gy + 12);\n  }\n  if (showTrue) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('┅ 真实连续相位', gx + 315, gy + 12);\n  }\n\n  let maxErr = 0;\n  let maxStep = 0;\n  for (let k = 0; k < N; k++) {\n    const err = Math.abs(uwPhase[k] - truePhase[k]);\n    if (err > maxErr) maxErr = err;\n    if (k > 0) {\n      const st = Math.abs(truePhase[k] - truePhase[k - 1]);\n      if (st > maxStep) maxStep = st;\n    }\n  }\n\n  const statusText = maxErr < 0.01\n    ? '解缠完美还原 (相邻真步长 < π)'\n    : '⚠️ 解缠失真! 相邻真步长已超过 π (' + maxStep.toFixed(2) + ' rad)';\n\n  lab.setReadout(\n    '2π 修补点数: ' + wrapCount + ' | 最大相邻真步长: ' + maxStep.toFixed(2) + ' rad | ' + statusText\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "看到相位谱在 ±3.14159（±π）附近突然反向跳变时不要慌，这通常是 2π 折叠导致的假象，并非信号本身发生突变。",
        "在数字滤波器群延迟（Group Delay）或频响分析中，必须先用类似 Table 8-4 的相位解缠算法（如 MATLAB/Python 中的 `unwrap()`）去掉 2π 断崖，才能正确求导或观察线性相位斜率。",
        "解缠算法存在“奈奎斯特式”前提：相邻两个频率采样点之间的真实相位变化绝对值必须小于 π（3.14159 rad）。如果频域采样太稀疏或相位噪声过大导致单步跳变超过 π，解缠算法就会发生不可逆的 2π 滑脱错误。"
      ]
    }
  ]
});
