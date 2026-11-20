window.__BOOK_REGISTER_SECTION__("sec_089", {
  "title": "信号合成与逆离散傅里叶变换 (Synthesis, Calculating the Inverse DFT)",
  "intuition": "逆离散傅里叶变换（Inverse DFT）的本质就是“按配方配音”：把频域中每个频率成分先经过严谨的带宽归一化和虚部取负，转换成正弦/余弦波的真实物理振幅，再把这 N/2+1 对波逐点叠加，就能精确还原出原始时域信号。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、合成方程：用正余弦波拼出任意信号",
      "paragraphs": [
        "在离散傅里叶变换的框架下，任何长度为 `N` 的时域信号 `x[i]`（索引 `i` 从 `0` 到 `N-1`），都可以看作是由 `N/2 + 1` 个不同频率的余弦波和 `N/2 + 1` 个正弦波线性叠加而成的。这就是 **合成方程（The Synthesis Equation，Eq. 8-2）** 的物理意义。",
        "需要特别注意的是：方程里用来乘以余弦和正弦基函数的系数，记作带横杠的 `ReX̄[k]` 和 `ImX̄[k]`，它们代表的是**合成所需的真实正余弦波振幅**，而不是直接存储在频域数组中的 `ReX[k]` 和 `ImX[k]`。"
      ],
      "formula": {
        "expr": "x[i] = Σ(k=0..N/2) ReX̄[k]·cos(2πki/N) + Σ(k=0..N/2) ImX̄[k]·sin(2πki/N)",
        "explain": "x[i] 是第 i 个时域采样点（0 ≤ i ≤ N-1）；k 是频率索引（0 ≤ k ≤ N/2），表示在 N 个点内完整振荡 k 个周期；ReX̄[k] 与 ImX̄[k] 分别是第 k 个余弦波与正弦波的真实合成振幅。"
      }
    },
    {
      "type": "concept",
      "heading": "二、Eq. 8-3：从“频域值”到“真实振幅”的归一化三步曲",
      "paragraphs": [
        "拿到频域数据 `ReX[k]` 和 `ImX[k]` 后，绝不能直接代入合成方程，必须先通过 **Eq. 8-3** 转换成 `ReX̄[k]` 和 `ImX̄[k]`。这是数字信号处理程序中最容易遗漏的经典暗坑之一。",
        "在代码实现中（如原书 Table 8-1），这个转换包含三个固定动作：**第一步**，将所有频域实部与虚部除以 `N/2`；**第二步**，把所有虚部取负号（`-ImX[k]`）；**第三步**，把实部的首尾两个特殊点 `ReX[0]`（直流分量）和 `ReX[N/2]`（奈奎斯特频率分量）再额外除以 `2`（即总共除以 `N`）。合成方程 Eq. 8-2 与归一化转换 Eq. 8-3 合在一起，才完整定义了 **逆离散傅里叶变换（Inverse DFT）**。"
      ],
      "formula": {
        "expr": "ReX̄[k] = ReX[k]/(N/2),  ImX̄[k] = -ImX[k]/(N/2)  |  特例: ReX̄[0] = ReX[0]/N,  ReX̄[N/2] = ReX[N/2]/N",
        "explain": "N 为时域总点数。中间频率按 N/2 缩放，首尾两个实部边界点（k=0 与 k=N/2）按 N 缩放；虚部则必须取负号后按 N/2 缩放。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：从常数频谱合成脉冲信号 & 首尾折半验证 (Fig. 8-6)",
      "instruction": "拖动“累加谐波上限 Kmax”观察 N=32 的余弦波如何逐渐抵消并在 i=0 处聚合成高度为 32 的脉冲；试着关闭“首尾除以 2”开关，观察缺少 Eq. 8-3 特殊归一化导致的失真与纹波，并可点击播放聆听波形叠加的音色变化。",
      "controls": [
        {
          "type": "slider",
          "id": "kmax",
          "label": "累加谐波上限 Kmax",
          "min": 0,
          "max": 16,
          "step": 1,
          "value": 16,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "correctNorm",
          "label": "首尾边界点(k=0, N/2)再除以2",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "let osc = null;\nlet gainNode = null;\n\nfunction updateAudio() {\n  const play = !!lab.values.play;\n  if (!play) {\n    if (gainNode && osc) {\n      const ctx = lab.getAudioContext();\n      gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.02);\n    }\n    return;\n  }\n  const ctx = lab.getAudioContext();\n  if (ctx.state === 'suspended') {\n    ctx.resume();\n  }\n  if (!osc) {\n    osc = ctx.createOscillator();\n    gainNode = ctx.createGain();\n    osc.frequency.value = 110;\n    gainNode.gain.value = 0;\n    osc.connect(gainNode);\n    gainNode.connect(ctx.destination);\n    osc.start();\n  }\n  const kmax = Math.round(lab.values.kmax);\n  const correctNorm = !!lab.values.correctNorm;\n  const real = new Float32Array(17);\n  const imag = new Float32Array(17);\n  for (let k = 1; k <= kmax; k++) {\n    let amp = 2.0;\n    if (k === 16 && correctNorm) amp = 1.0;\n    real[k] = amp / 16.0;\n  }\n  const wave = ctx.createPeriodicWave(real, imag, { disableNormalization: true });\n  osc.setPeriodicWave(wave);\n  gainNode.gain.setTargetAtTime(0.16, ctx.currentTime, 0.02);\n}\n\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const N = 32;\n  const kmax = Math.round(lab.values.kmax);\n  const correctNorm = !!lab.values.correctNorm;\n\n  const reBar = new Array(17);\n  for (let k = 0; k <= 16; k++) {\n    if (k === 0 || k === 16) {\n      reBar[k] = correctNorm ? 1.0 : 2.0;\n    } else {\n      reBar[k] = 2.0;\n    }\n  }\n\n  const x = new Array(N).fill(0);\n  for (let i = 0; i < N; i++) {\n    let sum = 0;\n    for (let k = 0; k <= kmax; k++) {\n      sum += reBar[k] * Math.cos((2 * Math.PI * k * i) / N);\n    }\n    x[i] = sum;\n  }\n\n  // Left panel: ReX_bar[k] spectrum bars\n  const lx = 36, ly = 26, lw = 210, lh = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('余弦振幅 ReX̄[k] (k=0..16)', lx, ly - 8);\n\n  for (let v = 0; v <= 3; v++) {\n    const py = ly + lh - (v / 3) * lh;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(lx, py);\n    ctx.lineTo(lx + lw, py);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(String(v), lx - 14, py + 4);\n  }\n\n  const barStep = lw / 17;\n  for (let k = 0; k <= 16; k++) {\n    const active = k <= kmax;\n    const h = (reBar[k] / 3.0) * lh;\n    const bx = lx + k * barStep + 2;\n    const by = ly + lh - h;\n    if (k === 0 || k === 16) {\n      ctx.fillStyle = active ? '#f59e0b' : 'rgba(245,158,11,0.2)';\n    } else {\n      ctx.fillStyle = active ? '#38bdf8' : 'rgba(56,189,248,0.18)';\n    }\n    ctx.fillRect(bx, by, Math.max(3, barStep - 4), h);\n  }\n\n  // Right panel: Synthesized signal x[i]\n  const rx = 290, ry = 26, rw = 405, rh = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('合成时域信号 x[i] (N=32 点)', rx, ry - 8);\n\n  const minY = -6, maxY = 38;\n  const mapY = (val) => ry + rh - ((val - minY) / (maxY - minY)) * rh;\n  const zeroY = mapY(0);\n\n  for (let gv of [0, 10, 20, 30]) {\n    const gy = mapY(gv);\n    ctx.strokeStyle = gv === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(rx, gy);\n    ctx.lineTo(rx + rw, gy);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(String(gv), rx - 22, gy + 4);\n  }\n\n  // Continuous reference curve\n  ctx.strokeStyle = 'rgba(16,185,129,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= rw; px += 2) {\n    const t = (px / rw) * (N - 1);\n    let s = 0;\n    for (let k = 0; k <= kmax; k++) {\n      s += reBar[k] * Math.cos((2 * Math.PI * k * t) / N);\n    }\n    const py = mapY(s);\n    if (px === 0) ctx.moveTo(rx + px, py); else ctx.lineTo(rx + px, py);\n  }\n  ctx.stroke();\n\n  // Discrete samples\n  for (let i = 0; i < N; i++) {\n    const px = rx + 8 + (i / (N - 1)) * (rw - 16);\n    const py = mapY(x[i]);\n    ctx.strokeStyle = 'rgba(16,185,129,0.75)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, zeroY);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n\n    ctx.fillStyle = i === 0 ? '#f8fafc' : '#10b981';\n    ctx.beginPath();\n    ctx.arc(px, py, i === 0 ? 4 : 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  let maxRipple = 0;\n  for (let i = 1; i < N; i++) {\n    maxRipple = Math.max(maxRipple, Math.abs(x[i]));\n  }\n  lab.setReadout(\n    'Kmax = ' + kmax +\n    ' | 首尾归一化: ' + (correctNorm ? '正确(÷N)' : '错误(÷N/2)') +\n    ' | 脉冲峰值 x[0] = ' + x[0].toFixed(2) +\n    ' | 非零点最大残留误差 = ' + maxRipple.toFixed(2)\n  );\n  updateAudio();\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "三、为什么偏偏要除以 N/2、首尾折半、还要给虚部加负号？",
      "paragraphs": [
        "前面解释了“怎么做”，现在来看背后的物理根源。之所以频域值与真实正余弦振幅相差一个缩放倍数，是因为 DFT 将频域定义为一种 **谱密度（Spectral Density）**——即**单位带宽内包含多少信号振幅**。要把正余弦振幅转换成谱密度，就必须除以该频率点所代表的频带宽度。",
        "以 `N=32` 点的信号为例（如原书 Fig. 8-7），频域共有 `17` 个采样点（`k=0..16`），均匀分布在 `0` 到 `1/2` 采样率之间。在总带宽 `N/2` 中，每个内部频率点（例如 `k=5` 占据 `4.5` 到 `5.5`）的宽度占总带宽的 `2/N`；而最左端的直流 `k=0`（仅占 `0` 到 `0.5`）和最右端的奈奎斯特 `k=16`（仅占 `15.5` 到 `16`）都只有一半宽度，即 `1/N`。反过来从谱密度还原振幅时，就自然出现了乘以 `2/N`（即除以 `N/2`）以及首尾两点额外除以 `2`（即除以 `N`）的规则。",
        "至于为什么要把虚部 `ImX[k]` 取负号，物理上完全是为了与第 29 章的 **复数 DFT（Complex DFT）** 以及第 12 章的 **快速傅里叶变换（FFT）** 保持数学一致。很多仅讨论实数 DFT 的教材会省去 `2/N` 缩放或虚部负号，但工业界最核心的 FFT 算法正是按照 Eq. 8-2 与 Eq. 8-3 的标准来定义频域输出的。如果在代码里漏掉这些归一化因子，调用 FFT 后的程序结果就会彻底错乱。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "四、程序的两种写法：按频率累加 vs 按采样点求和",
      "paragraphs": [
        "按照原书 Table 8-1 的完整代码，执行 Eq. 8-2 合成时有两种等价的双层循环写法，它们仅仅是把内外层循环变量（频率 `K%` 和时间 `I%`）交换了一下位置，最终得到的时域数组 `XX[]` 完全一致：",
        "1. **方法 #1（外层循环频率 `K%`，内层循环时间 `I%`）**：每次选定一个频率 `k`，一口气生成该频率完整的 `N` 点余弦波和正弦波，然后整段累加到时域累加数组 `XX[]` 中。这种方式直观展示了“整条正余弦波叠加”的物理图景。",
        "2. **方法 #2（外层循环时间 `I%`，内层循环频率 `K%`）**：逐个锁定时间点 `i`，把所有 `N/2 + 1` 个频率在该时刻的瞬时值加起来，直接算出 `XX[i]` 再前进到下一个时刻。这种方式在实时流式输出或需要节省中间存储时尤为常用。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 2：正余弦正交合成与“虚部取负号”相位效应",
      "instruction": "调节任意频率 k 的实部 ReX[k] 与虚部 ImX[k]，观察蓝色余弦波与琥珀色正弦波如何合成绿色总波形；切换“虚部取负”开关，直观感受遗漏负号如何导致波形相位反向漂移。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "频率索引 k",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "reX",
          "label": "实部频域值 ReX[k]",
          "min": -32,
          "max": 32,
          "step": 2,
          "value": 16,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imX",
          "label": "虚部频域值 ImX[k]",
          "min": -32,
          "max": 32,
          "step": 2,
          "value": 16,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "negateIm",
          "label": "遵循 Eq. 8-3 对虚部取负 (-ImX)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showComp",
          "label": "显示 Cos / Sin 独立分量",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  const ctx = lab.ctx;\n  const W = lab.width;\n  const H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  const N = 32;\n  const k = Math.round(lab.values.k);\n  const reX = Number(lab.values.reX);\n  const imX = Number(lab.values.imX);\n  const negateIm = !!lab.values.negateIm;\n  const showComp = !!lab.values.showComp;\n\n  const reBar = reX / (N / 2);\n  const imBar = (negateIm ? -imX : imX) / (N / 2);\n\n  const padL = 48, padR = 24, padT = 28, padB = 26;\n  const gw = W - padL - padR;\n  const gh = H - padT - padB;\n  const maxAmp = 3.2;\n  const mapX = (t) => padL + (t / (N - 1)) * gw;\n  const mapY = (v) => padT + gh / 2 - (v / maxAmp) * (gh / 2);\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let v of [-2, -1, 0, 1, 2]) {\n    const py = mapY(v);\n    ctx.strokeStyle = v === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(padL, py);\n    ctx.lineTo(padL + gw, py);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(v.toFixed(0), padL - 24, py + 4);\n  }\n  for (let i = 0; i < N; i += 4) {\n    const px = mapX(i);\n    ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n    ctx.beginPath();\n    ctx.moveTo(px, padT);\n    ctx.lineTo(px, padT + gh);\n    ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(String(i), px - 4, padT + gh + 16);\n  }\n\n  // Components\n  if (showComp) {\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = 'rgba(56,189,248,0.75)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (let px = 0; px <= gw; px += 2) {\n      const t = (px / gw) * (N - 1);\n      const y = reBar * Math.cos((2 * Math.PI * k * t) / N);\n      if (px === 0) ctx.moveTo(padL + px, mapY(y)); else ctx.lineTo(padL + px, mapY(y));\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = 'rgba(245,158,11,0.8)';\n    ctx.beginPath();\n    for (let px = 0; px <= gw; px += 2) {\n      const t = (px / gw) * (N - 1);\n      const y = imBar * Math.sin((2 * Math.PI * k * t) / N);\n      if (px === 0) ctx.moveTo(padL + px, mapY(y)); else ctx.lineTo(padL + px, mapY(y));\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  // Total synthesized wave\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let px = 0; px <= gw; px += 2) {\n    const t = (px / gw) * (N - 1);\n    const y = reBar * Math.cos((2 * Math.PI * k * t) / N) + imBar * Math.sin((2 * Math.PI * k * t) / N);\n    if (px === 0) ctx.moveTo(padL + px, mapY(y)); else ctx.lineTo(padL + px, mapY(y));\n  }\n  ctx.stroke();\n\n  // Discrete points\n  for (let i = 0; i < N; i++) {\n    const y = reBar * Math.cos((2 * Math.PI * k * i) / N) + imBar * Math.sin((2 * Math.PI * k * i) / N);\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(mapX(i), mapY(y), 3, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  // Legend\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 合成波 x[i]', padL + 8, 18);\n  if (showComp) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('-- 余弦分量 ReX̄·cos', padL + 110, 18);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('-- 正弦分量 ImX̄·sin', padL + 245, 18);\n  }\n\n  const mag = Math.hypot(reBar, imBar);\n  const phaseDeg = (Math.atan2(imBar, reBar) * 180) / Math.PI;\n  lab.setReadout(\n    'ReX̄[' + k + '] = ' + reBar.toFixed(2) +\n    ' | ImX̄[' + k + '] = ' + imBar.toFixed(2) +\n    ' | 合成波振幅 = ' + mag.toFixed(2) +\n    ' | 相位角 = ' + phaseDeg.toFixed(1) + '°' +\n    (negateIm ? ' (标准IDFT)' : ' (未取负: 相位反转!)')\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【避坑 1：首尾两点忘折半】直接把所有频域点统一除以 N/2 而不对 ReX[0] 与 ReX[N/2] 再除以 2，会在合成信号中引入错误的直流偏置和奈奎斯特锯齿纹波。",
        "【避坑 2：漏掉虚部负号】逆 DFT 必须对虚部取负号（ImX̄[k] = -ImX[k]/(N/2)），否则所有正弦分量的相位都会反向，导致时域波形左右镜像翻转，且与标准 FFT 结果不兼容。",
        "【工程直觉：频域是谱密度】之所以存在 2/N 与端点 1/N 的换算系数，是因为频域幅值按所在频带宽度（内部点占 2/N、首尾点占 1/N）做了密度归一化。",
        "【代码优化】Eq. 8-2 的双层循环既可以按频率逐波累加，也可以按采样点逐点求和，两者数学完全等价，可根据内存局部性或实时流需求自由切换。"
      ]
    }
  ]
});
