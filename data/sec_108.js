window.__BOOK_REGISTER_SECTION__("sec_108", {
  "title": "DFT 的周期性与循环视角 (Periodic Nature of the DFT)",
  "intuition": "在 DFT 的世界里，时域和频域都被视为首尾相连、无限循环的圆环；一旦信号或频谱“太长”而溢出单周期边界，多出来的部分就会卷绕或折叠回原区间，造成不可逆的混叠失真。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 时域周期性与“首尾相连”的循环视角",
      "paragraphs": [
        "与另外三种傅里叶变换（连续傅里叶变换、傅里叶级数、DTFT）不同，**离散傅里叶变换（DFT）同时将时域和频域都视为周期性的**。这在直觉上往往令人困惑，因为工程中采集到的数字信号绝大多数并**不是**周期的。",
        "举个例子，假设你用传感器按固定时间间隔采集了 `N = 128` 个点（编号 `0` 到 `127`）。从物理采集过程来看，起点样本 `0` 和终点样本 `127` 是在不同时刻测得的，彼此毫无关联。但 DFT 并不这么看——它把这 128 个点当作一个**无限长周期信号的一个周期**。",
        "这等价于把采集序列的右端直接“绕回来”接在左端上，形成一个封闭圆环（即**循环视角 / Circular**）。在这个圆环里，样本 `127` 紧挨着样本 `0`，就像样本 `43` 紧挨着样本 `44` 一样。",
        "时域周期性最严重的后果就是**时域混叠（Time Domain Aliasing）**。在实际 DSP 处理中，我们把信号做 DFT 变到频域后，通常会修改频谱（如删除某些频率、改变幅相、频域相乘实现卷积等），然后再做逆变换（IDFT）回到时域。如果这些频域修改导致还原出来的时域信号变长、塞不进原本的 `N` 个采样点内，多出来的尾巴就会从右边界溢出，并像“剪切-粘贴”一样重新出现在左边界，与原有信号直接相加，导致信息被彻底破坏（第 9 章提到的圆周卷积混叠正是典型例子）。"
      ],
      "formula": {
        "expr": "x_periodic[n] = x[n mod N],  n ∈ (-∞, +∞)",
        "explain": "x[n] 为长度为 N 的有限长采样序列；mod 表示取模运算。在 DFT 眼中，任意整数索引 n 都会被取模折叠回 [0, N-1] 区间内，样本 N-1 的下一个点就是样本 0。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：时域周期延拓与“剪切粘贴”式循环混叠",
      "instruction": "向右拖动“信号右移量”滑块，观察右侧琥珀色脉冲冲出 N=64 边界后，如何从左侧 n=0 处“卷绕”回来并与原有青蓝色脉冲发生相加混叠。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "信号右移量 (模拟展宽/延迟)",
          "min": 0,
          "max": 48,
          "step": 1,
          "value": 18,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showPeriodic",
          "label": "显示左右相邻周期延拓 (DFT 视角)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "enableAlias",
          "label": "显示溢出卷绕后的叠加总波形",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 64;\n\nfunction draw() {\n  const shift = lab.values.shift;\n  const showPeriodic = lab.values.showPeriodic;\n  const enableAlias = lab.values.enableAlias;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const nMin = -32, nMax = 96;\n  const x0 = 24, xW = W - 48;\n  const toX = (n) => x0 + ((n - nMin) / (nMax - nMin)) * xW;\n  const baseY = H * 0.72;\n  const scaleY = H * 0.36;\n\n  const px0 = toX(0), pxN = toX(N);\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';\n  ctx.fillRect(px0, 22, pxN - px0, H - 44);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  for (let yOff = -0.5; yOff <= 1.5; yOff += 0.5) {\n    const y = baseY - yOff * scaleY;\n    ctx.moveTo(x0, y);\n    ctx.lineTo(W - 24, y);\n  }\n  for (let n = -32; n <= 96; n += 16) {\n    const x = toX(n);\n    ctx.moveTo(x, 22);\n    ctx.lineTo(x, H - 22);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(px0, 20); ctx.lineTo(px0, H - 20);\n  ctx.moveTo(pxN, 20); ctx.lineTo(pxN, H - 20);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  const sLeft = (n) => 0.75 * Math.exp(-Math.pow((n - 10) / 4.2, 2));\n  const centerR = 26 + shift;\n  const sRight = (n) => 0.85 * Math.exp(-Math.pow((n - centerR) / 5.5, 2));\n\n  if (showPeriodic) {\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (let px = x0; px <= W - 24; px += 2) {\n      const n = nMin + ((px - x0) / xW) * (nMax - nMin);\n      let val = 0;\n      for (let k = -1; k <= 1; k++) {\n        val += sLeft(n - k * N) + sRight(n - k * N);\n      }\n      const y = baseY - val * scaleY;\n      if (px === x0) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const x = toX(n), y = baseY - sLeft(n) * scaleY;\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let n = 0; n < N; n++) {\n    const x = toX(n), y = baseY - sRight(n) * scaleY;\n    if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(236, 72, 153, 0.9)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (let n = N - 1; n <= 96; n++) {\n    const x = toX(n), y = baseY - sRight(n) * scaleY;\n    if (n === N - 1) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  let maxAlias = 0;\n  let maxTotal = 0;\n  if (enableAlias) {\n    ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';\n    ctx.beginPath();\n    ctx.moveTo(toX(0), baseY);\n    for (let n = 0; n < N; n++) {\n      const wrapped = sRight(n + N) + sRight(n - N);\n      if (wrapped > maxAlias) maxAlias = wrapped;\n      ctx.lineTo(toX(n), baseY - wrapped * scaleY);\n    }\n    ctx.lineTo(toX(N - 1), baseY);\n    ctx.closePath();\n    ctx.fill();\n\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let n = 0; n < N; n++) {\n      const total = sLeft(n) + sRight(n) + sRight(n + N) + sRight(n - N);\n      if (total > maxTotal) maxTotal = total;\n      const x = toX(n), y = baseY - total * scaleY;\n      if (n === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('主采集周期 [0 .. 63]', px0 + 8, 36);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.fillText('n = 0', px0 - 12, H - 6);\n  ctx.fillText('n = 63', pxN - 18, H - 6);\n  if (showPeriodic) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('左侧克隆周期', x0 + 6, 36);\n    ctx.fillText('右侧克隆周期', pxN + 8, 36);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('原有特征脉冲', toX(2), 54);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('右移脉冲', Math.min(pxN - 52, toX(centerR) - 20), 54);\n  if (enableAlias && maxAlias > 0.05) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('溢出卷绕到左端!', px0 + 8, 70);\n  }\n\n  const overflowPct = Math.min(100, Math.round((maxAlias / 0.85) * 100));\n  lab.setReadout(\n    '右移脉冲中心: n=' + centerR +\n    ' | 溢出卷绕强度: ' + overflowPct + '%' +\n    ' | 叠加总峰值: ' + (enableAlias ? maxTotal.toFixed(2) : '未开启') +\n    (overflowPct > 8 ? '  ⚠ 发生时域循环混叠!' : '  ✓ 完整落在单周期内')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "2. 频域的镜像对称法则与“对折”式频域混叠",
      "paragraphs": [
        "频域的周期性机制与时域相似，但结构要更精妙复杂。通常我们习惯把实信号的频谱看作从 `0` 到 `0.5 fs`（采样率的一半，即奈奎斯特频率）之间分布的 `N/2 + 1` 个采样点。这虽简单，却不足以解释 DFT 的许多性质。",
        "在 DFT 眼中，**`0` 到 `0.5 fs` 之间的正频谱，在 `0` 到 `-0.5 fs` 之间存在一个“负频率镜像”**。具体到极坐标与直角坐标形式上，正负频率遵循严格的对称规律：对于幅度谱（Magnitude），负频率部分是正频率的**左右翻转**，称为**偶对称（Even Symmetry）**；对于相位谱（Phase），负频率部分不仅左右翻转，还要**正负取反**，称为**奇对称（Odd Symmetry）**。如果换算成实部和虚部，那么**实部永远是偶函数，虚部永远是奇函数**。",
        "把负频率算进去后，DFT 频域就是一个以 **`1.0 fs`** 为周期的无限周期信号（例如 `[-0.5, 0.5]` 或 `[0, 1.0]`，采样点长度同样是 `N`）。",
        "正因为频域具有“镜像+周期”的双重结构，**频域混叠（Frequency Domain Aliasing）**的视觉表现和时域截然不同！想象一个单频分量向右移动并穿过 `0.5 fs` 边界：与此同时，它的负频率镜像正向左移动并穿过 `-0.5 fs` 边界。由于频域以 `1.0` 为周期重复，相邻周期里的那个负频率克隆体就会**从右向左**穿过 `0.5 fs` 边界进入 `[0, 0.5]` 区间。如果你只能看见 `[0, 0.5]` 频段，就会看到向右撞墙的频谱不是从左边 `0` 冒出来，而是像**在 `0.5` 处被对折（Folded Over）回来**一样，反向叠加到原有频谱上！"
      ],
      "formula": {
        "expr": "|X[-f]| = |X[f]|,   Phase(X[-f]) = -Phase(X[f]),   X[f + k·fs] = X[f]",
        "explain": "幅度谱满足偶对称，相位谱满足奇对称；同时整个频谱以采样率 fs (归一化为 1.0) 为周期无限重复。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：频谱偶/奇对称与 0.5 fs 边界对折混叠",
      "instruction": "将“正频谱中心位置”滑块拖过 0.42 fs 逼近 0.5 fs 边界，关闭/开启“展开负频率与周期延拓”对比观察：时域是“左出右进”，频域却是“在 0.5 处向内对折”！",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "正频谱中心位置",
          "min": 0.1,
          "max": 0.68,
          "step": 0.01,
          "value": 0.3,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "bw",
          "label": "频谱带宽",
          "min": 0.04,
          "max": 0.14,
          "step": 0.01,
          "value": 0.07,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "showFull",
          "label": "展开负频率与周期延拓 [-0.75, 1.25] fs",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction draw() {\n  const fc = lab.values.fc;\n  const bw = lab.values.bw;\n  const showFull = lab.values.showFull;\n\n  ctx.clearRect(0, 0, W, H);\n\n  const fMin = showFull ? -0.75 : 0.0;\n  const fMax = showFull ? 1.25 : 0.5;\n  const x0 = 36, xW = W - 60;\n  const toX = (f) => x0 + ((f - fMin) / (fMax - fMin)) * xW;\n\n  const magBaseY = 132, magScale = 86;\n  const phBaseY = 192, phScale = 28;\n\n  // Highlight [0, 0.5] window\n  const wx0 = toX(Math.max(fMin, 0));\n  const wx1 = toX(Math.min(fMax, 0.5));\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.06)';\n  ctx.fillRect(wx0, 16, wx1 - wx0, H - 34);\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x0, magBaseY); ctx.lineTo(W - 24, magBaseY);\n  ctx.moveTo(x0, magBaseY - magScale); ctx.lineTo(W - 24, magBaseY - magScale);\n  ctx.moveTo(x0, phBaseY); ctx.lineTo(W - 24, phBaseY);\n  const ticks = showFull ? [-0.5, 0, 0.5, 1.0] : [0, 0.1, 0.2, 0.3, 0.4, 0.5];\n  for (let i = 0; i < ticks.length; i++) {\n    const tx = toX(ticks[i]);\n    ctx.moveTo(tx, 16); ctx.lineTo(tx, H - 18);\n  }\n  ctx.stroke();\n\n  // Key barriers 0 and 0.5\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.45)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  if (0 >= fMin && 0 <= fMax) { ctx.moveTo(toX(0), 16); ctx.lineTo(toX(0), H - 18); }\n  if (0.5 >= fMin && 0.5 <= fMax) { ctx.moveTo(toX(0.5), 16); ctx.lineTo(toX(0.5), H - 18); }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  // Asymmetric lobe so left-right mirror flip is obvious\n  const magPos = (f) => {\n    const u = (f - fc) / bw;\n    return (Math.exp(-u * u) + 0.55 * Math.exp(-Math.pow((u - 1.05) / 0.45, 2))) / 1.15;\n  };\n  const phPos = (f) => {\n    const u = (f - fc) / bw;\n    return -0.9 * Math.sin(1.3 * u) * Math.exp(-0.22 * u * u);\n  };\n\n  // Draw periodic negative/positive ghosts in green when showFull\n  if (showFull) {\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (let px = x0; px <= W - 24; px += 2) {\n      const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n      let m = 0;\n      for (let k = -1; k <= 1; k++) {\n        m += magPos(f - k) + magPos(-(f - k));\n      }\n      const y = magBaseY - Math.min(1.25, m) * magScale;\n      if (px === x0) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    for (let px = x0; px <= W - 24; px += 2) {\n      const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n      let p = 0;\n      for (let k = -1; k <= 1; k++) {\n        p += phPos(f - k) - phPos(-(f - k));\n      }\n      const y = phBaseY - p * phScale;\n      if (px === x0) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n    }\n    ctx.stroke();\n  }\n\n  // Inside [0, 0.5]: draw original positive lobe (cyan), folded negative clone (pink), and summed spectrum (white)\n  const startX = toX(0), endX = toX(0.5);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.8;\n  ctx.beginPath();\n  for (let px = startX; px <= endX; px += 2) {\n    const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n    const y = magBaseY - magPos(f) * magScale;\n    if (px === startX) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n  }\n  ctx.stroke();\n\n  let maxFold = 0;\n  let maxSum = 0;\n  ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';\n  ctx.beginPath();\n  ctx.moveTo(startX, magBaseY);\n  for (let px = startX; px <= endX; px += 2) {\n    const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n    const fold = magPos(1.0 - f) + magPos(-f);\n    if (fold > maxFold) maxFold = fold;\n    ctx.lineTo(px, magBaseY - fold * magScale);\n  }\n  ctx.lineTo(endX, magBaseY);\n  ctx.closePath();\n  ctx.fill();\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (let px = startX; px <= endX; px += 2) {\n    const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n    const sumM = magPos(f) + magPos(1.0 - f) + magPos(-f);\n    if (sumM > maxSum) maxSum = sumM;\n    const y = magBaseY - Math.min(1.25, sumM) * magScale;\n    if (px === startX) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n  }\n  ctx.stroke();\n\n  // Phase inside [0, 0.5]\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let px = startX; px <= endX; px += 2) {\n    const f = fMin + ((px - x0) / xW) * (fMax - fMin);\n    const sumP = phPos(f) - phPos(1.0 - f) - phPos(-f);\n    const y = phBaseY - sumP * phScale;\n    if (px === startX) ctx.moveTo(px, y); else ctx.lineTo(px, y);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('幅度谱 |X(f)| (偶对称)', 42, 30);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('相位谱 ∠X(f) (奇对称)', 42, 162);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  for (let i = 0; i < ticks.length; i++) {\n    ctx.fillText(ticks[i] + ' fs', toX(ticks[i]) - 14, H - 5);\n  }\n  if (maxFold > 0.05) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('0.5 fs 对折混叠!', Math.max(startX + 4, toX(0.5) - 96), 46);\n  }\n\n  const foldPct = Math.min(100, Math.round(maxFold * 100));\n  lab.setReadout(\n    '正频中心: ' + fc.toFixed(2) + ' fs | 负频镜像中心: -' + fc.toFixed(2) + ' fs (周期克隆于 ' + (1 - fc).toFixed(2) + ' fs)' +\n    ' | 折叠侵入强度: ' + foldPct + '%' +\n    (foldPct > 8 ? '  ⚠ 频谱在 0.5 fs 边界发生对折混叠!' : '  ✓ 频谱位于单边主频带内')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 负频率是数学幻觉吗？一题三解揭示离散信号的“混叠家族”",
      "paragraphs": [
        "“负频率”听起来像是数学家硬凑出来的怪异概念，它有真实的物理含义吗？书中图 10-11 给出了一个绝妙的测试题：给你一组由 `N = 32` 个离散采样点组成的余弦信号 `x[n] = cos(2πnf / N + θ)`，请你找出它的频率 `f` 和初相 `θ`。",
        "很快就能找到第一个答案：**解 #1：`f = 3, θ = -π/4`**。但如果就此交卷，你只能拿到 **1/3 的分数**！因为数学上还严格存在另外两类完全合法的解：",
        "**解 #2（负频率解）：`f = -3, θ = +π/4`**。不管你心理上能不能接受“负频率”，代入余弦公式 `cos(-α) = cos(α)` 后，它穿过所有采样点的数值与解 #1 分毫不差。事实上，**任何正频率正弦波都可以等价地表达为一个负频率正弦波**，这对连续信号和离散信号都成立。",
        "**解 #3（无穷混叠家族）：`f = 35, θ = -π/4`**，以及 `f = ±29, ±35, ±61, ±67...` 等无穷多个解！虽然这些高频曲线在采样点**之间**剧烈振荡，但它们在所有 32 个离散采样时刻恰好严丝合缝地穿过相同的点，因此同样是 100% 正确的数学解。这三类解刚好对应频谱的三个区域：解 #1 对应 `[0, 0.5 fs]`；解 #2 对应 `[-0.5 fs, 0]`；解 #3 对应 `0.5 fs` 以上和 `-0.5 fs` 以下无穷重复的周期镜像（仅离散信号存在）。"
      ],
      "formula": {
        "expr": "x[n] = cos(2πn·f / N + θ) = cos(2πn·(-f) / N - θ) = cos(2πn·(f + kN) / N + θ)",
        "explain": "N=32 为总采样点数；f 为 N 点内包含的周期数（Nyquist 极限 0.5 fs 对应 f=16）；k 为任意整数。这三条等式解释了正频率、负频率与高频混叠家族为何能穿过完全相同的离散点。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 3：负频率等价性与采样混叠听觉实验 (Web Audio)",
      "instruction": "把频率 f 从 3 慢慢拖过 16 (即 0.5 fs 奈奎斯特边界)：观察蓝色高频曲线与琥珀色基带折叠曲线如何穿过完全相同的 32 个白点，并点击播放对比“连续原音”与“采样折叠音”的音高反转！",
      "controls": [
        {
          "type": "slider",
          "id": "f",
          "label": "输入信号频率 f (32点内周期数)",
          "min": 1,
          "max": 45,
          "step": 1,
          "value": 3,
          "unit": " 周期"
        },
        {
          "type": "slider",
          "id": "thetaDeg",
          "label": "初始相位 θ",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": -45,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "showAlias",
          "label": "叠加显示基带折叠波 (0 ~ 0.5 fs)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showNeg",
          "label": "底部频谱标出负频率与混叠家族",
          "value": true
        },
        {
          "type": "toggle",
          "id": "hearAliased",
          "label": "音频模式：听采样混叠音高 (关闭则听连续原音)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst N = 32;\n\nlet osc = null;\nlet gainNode = null;\n\nfunction syncAudio(fBase, fInput) {\n  const isPlaying = lab.values.play;\n  const useAliased = lab.values.hearAliased;\n  const hz = (useAliased ? fBase : fInput) * 50;\n\n  if (isPlaying) {\n    const ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      osc.type = 'sine';\n      gainNode.gain.value = hz < 20 ? 0 : 0.12;\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.frequency.setValueAtTime(Math.max(40, hz), ac.currentTime);\n      osc.start();\n    } else {\n      osc.frequency.setTargetAtTime(Math.max(40, hz), ac.currentTime, 0.02);\n      gainNode.gain.setTargetAtTime(hz < 20 ? 0 : 0.12, ac.currentTime, 0.02);\n    }\n  } else {\n    if (osc) {\n      try { osc.stop(); osc.disconnect(); } catch (e) {}\n      osc = null;\n    }\n    if (gainNode) {\n      try { gainNode.disconnect(); } catch (e) {}\n      gainNode = null;\n    }\n  }\n}\n\nfunction draw() {\n  const f = lab.values.f;\n  const thetaDeg = lab.values.thetaDeg;\n  const theta = (thetaDeg * Math.PI) / 180;\n  const showAlias = lab.values.showAlias;\n  const showNeg = lab.values.showNeg;\n\n  const r = ((f % N) + N) % N;\n  const fBase = r <= 16 ? r : N - r;\n  const thetaBase = r <= 16 ? theta : -theta;\n  const thetaBaseDeg = Math.round((thetaBase * 180) / Math.PI);\n\n  syncAudio(fBase, f);\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Top waveform region: [0 .. 32]\n  const x0 = 36, xW = W - 72;\n  const toX = (n) => x0 + (n / N) * xW;\n  const midY = 84, amp = 52;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(x0, midY); ctx.lineTo(x0 + xW, midY);\n  ctx.moveTo(x0, midY - amp); ctx.lineTo(x0 + xW, midY - amp);\n  ctx.moveTo(x0, midY + amp); ctx.lineTo(x0 + xW, midY + amp);\n  for (let n = 0; n <= N; n += 8) {\n    const x = toX(n);\n    ctx.moveTo(x, 22); ctx.lineTo(x, 146);\n  }\n  ctx.stroke();\n\n  // Draw continuous input wave f\n  ctx.strokeStyle = f > 16 ? 'rgba(56, 189, 248, 0.7)' : '#38bdf8';\n  ctx.lineWidth = f > 16 ? 1.5 : 2.2;\n  ctx.beginPath();\n  const steps = 400;\n  for (let i = 0; i <= steps; i++) {\n    const t = (i / steps) * N;\n    const val = Math.cos((2 * Math.PI * t * f) / N + theta);\n    const x = toX(t), y = midY - val * amp;\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Draw baseband alias wave if f > 16 and showAlias\n  if (showAlias && f !== fBase) {\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (let i = 0; i <= steps; i++) {\n      const t = (i / steps) * N;\n      const val = Math.cos((2 * Math.PI * t * fBase) / N + thetaBase);\n      const x = toX(t), y = midY - val * amp;\n      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n  }\n\n  // Draw the 32 discrete samples\n  ctx.fillStyle = '#f8fafc';\n  for (let n = 0; n < N; n++) {\n    const val = Math.cos((2 * Math.PI * n * f) / N + theta);\n    const x = toX(n), y = midY - val * amp;\n    ctx.fillRect(x - 2.5, y - 2.5, 5, 5);\n  }\n\n  // Bottom spectrum map [-48 .. +48]\n  const spBaseY = 216, spH = 38;\n  const spMin = -48, spMax = 48;\n  const toSpX = (k) => x0 + ((k - spMin) / (spMax - spMin)) * xW;\n\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.08)';\n  ctx.fillRect(toSpX(0), 166, toSpX(16) - toSpX(0), spBaseY - 166);\n  if (showNeg) {\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.08)';\n    ctx.fillRect(toSpX(-16), 166, toSpX(0) - toSpX(-16), spBaseY - 166);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(x0, spBaseY); ctx.lineTo(x0 + xW, spBaseY);\n  ctx.stroke();\n\n  const drawStem = (freqVal, color, hFrac) => {\n    if (freqVal < spMin || freqVal > spMax) return;\n    const sx = toSpX(freqVal);\n    const sy = spBaseY - spH * hFrac;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(sx, spBaseY); ctx.lineTo(sx, sy);\n    ctx.stroke();\n    ctx.fillStyle = color;\n    ctx.beginPath();\n    ctx.arc(sx, sy, 3.5, 0, Math.PI * 2);\n    ctx.fill();\n  };\n\n  if (showNeg) {\n    for (let k = -2; k <= 2; k++) {\n      const p1 = fBase + k * N;\n      const p2 = -fBase + k * N;\n      drawStem(p1, 'rgba(16, 185, 129, 0.45)', 0.7);\n      drawStem(p2, 'rgba(16, 185, 129, 0.45)', 0.7);\n    }\n    drawStem(-fBase, '#10b981', 0.95);\n  }\n  drawStem(fBase, '#f59e0b', 0.95);\n  if (f !== fBase) drawStem(f, '#38bdf8', 0.95);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('离散采样点 x[0..31]', 38, 22);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('输入曲线 f=' + f, 165, 22);\n  if (f > 16 && showAlias) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('基带折叠波 f=' + fBase + ', θ=' + thetaBaseDeg + '°', 270, 22);\n  }\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  const spMarks = [-48, -32, -16, 0, 16, 32, 48];\n  for (let i = 0; i < spMarks.length; i++) {\n    ctx.fillText(String(spMarks[i]), toSpX(spMarks[i]) - 6, H - 6);\n  }\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('[0, 0.5fs]', toSpX(4), 178);\n  if (showNeg) {\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('[-0.5fs, 0]', toSpX(-15), 178);\n  }\n\n  const audioDesc = lab.values.play\n    ? (' | 正在发声: ' + (lab.values.hearAliased ? (fBase === 0 ? 'DC 直流 (静音)' : (fBase * 50) + ' Hz 混叠音') : (f * 50) + ' Hz 原音'))\n    : '';\n\n  lab.setReadout(\n    '解#1/输入: f=' + f + ' (' + (f / N).toFixed(2) + ' fs), θ=' + thetaDeg + '°' +\n    ' | 基带等价解: f=' + fBase + ', θ=' + thetaBaseDeg + '°' +\n    ' | 负频等价解: f=-' + fBase + ', θ=' + (-thetaBaseDeg) + '°' + audioDesc\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "4. 工程抉择：什么时候可以忽略周期性，什么时候必须高度警惕？",
      "paragraphs": [
        "读到这里你可能会想：每次用 DFT 都得在脑子里转着圆环、算着负频率，未免太累了吧？好消息是：**许多常见 DSP 应用其实不需要理解 DFT 的周期性，也不用操心负频率**。",
        "典型例子就是上一章学过的**频谱分析（Spectral Analysis）**和**系统的频率响应（Frequency Response）**：在这类只读、不把信号反向塞回相邻周期的观察型任务中，你完全可以把时域看成 `[0, N-1]`、把频域看成 `[0, 0.5 fs]`，因为它们永远不会导致一个周期的数据溢出到相邻周期里。",
        "然而，有几类核心 DSP 操作**只能**通过分析跨周期溢出来理解，最典型的就是**圆周卷积（Circular Convolution）**与**模数转换（ADC Sampling）**：",
        "1. **圆周卷积（时域混叠）**：频域直接相乘等价于时域卷积；若卷积后的波形长度超过 `N`，就会冲破周期边界卷绕回来，发生时域混叠（必须提前对时域做零填充 Zero-Padding 留出余量）。",
        "2. **模数转换（频域混叠）**：采样是时域的非线性操作。原模拟信号的带宽如果超过离散系统所能容纳的 `[0, 0.5 fs]` 空间，强行采样的结果就是超出 `0.5 fs` 的高频频谱全部向内对折，混入低频区（因此在 ADC 之前必须加模拟抗混叠低通滤波器）。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（频域相乘前先补零）：做快速卷积（FFT 相乘 -> IFFT）时，如果序列 A 长 L、序列 B 长 M，结果长度为 L+M-1。若 FFT 点数 N < L+M-1，尾部必然卷绕到头部，造成时域混叠！务必补零至 N ≥ L+M-1。",
        "避坑 2（频谱修改要成对对称）：如果你直接手动修改 DFT 复数频谱再做 IFFT 还原实信号，记住正频 bin[k] 和负频镜像 bin[N-k] 必须保持“实部相等、虚部相反（共轭对称）”，否则逆变换出来的时域信号会变成带有虚部的复信号。",
        "避坑 3（记住两种混叠的几何方向）：时域溢出是“右出左进、首尾相接”（剪切粘贴）；频域溢出是“撞到 0.5 fs 墙面向内反弹”（对折叠加）。",
        "核心结论：仅做频谱查看时，看 [0, 0.5 fs] 单边谱足矣；一旦涉及采样、滤波、卷积等时频域交互改造，必须时刻牢记 DFT 的“圆环周期世界观”。"
      ]
    }
  ]
});
