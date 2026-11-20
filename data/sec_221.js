window.__BOOK_REGISTER_SECTION__("sec_221", {
  "title": "复数离散傅里叶变换 (The Complex DFT)",
  "intuition": "实数 DFT 把单边频谱拆成两个实数组并用数学技巧硬凑特殊边界，而复数 DFT 直接让时域和频域成为对称完整的复数数组，正负频率平分能量，彻底消灭特例。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 复数 DFT 的正变换定义：极坐标与直角坐标",
      "paragraphs": [
        "在数字信号处理中，最标准、最通用的正交变换形式是**极坐标形式的复数 DFT**（原书 Eq. 31-5）。与实数 DFT 不同，复数 DFT 中的时域信号 `x[n]` 和频域信号 `X[k]` **全都是复数数组**，且索引 `n` 与 `k` 同样从 `0` 运行到 `N - 1`。",
        "利用欧拉公式 `e^(-jθ) = cos(θ) - j*sin(θ)`，我们也可以把复数 DFT 改写为直角坐标形式（Eq. 31-6）。工程上有一个很实用的事实：虽然公式要求 `x[n]` 是复数，但如果你手头只有真实的物理采样数据（比如一段麦克风电压测量值），只需要把数据填进 `x[n]` 的**实部**，把**虚部全部填零**即可直接运算。"
      ],
      "formula": {
        "expr": "X[k] = (1/N) * Σ(n=0..N-1) x[n] * e^(-j * 2πkn / N) = (1/N) * Σ(n=0..N-1) x[n] * [cos(2πkn/N) - j*sin(2πkn/N)]",
        "explain": "x[n] 为长度为 N 的复数时域信号；X[k] 为长度为 N 的复数频谱；n 为时域采样索引 (0..N-1)；k 为频域频率索引 (0..N-1)；j 为虚数单位；1/N 为归一化缩放因子。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 看似相同，实则迥异：复数 DFT 与实数 DFT 的五大本质区别",
      "paragraphs": [
        "粗看 Eq. 31-6，好像只需做一点点代数变形就能变成实数 DFT。但这种表面相似极具欺骗性，二者在数学本质与工程处理上有**五个极其关键的差异**：",
        "**第一，数组性质不同**：实数 DFT 把 1 个实数时域信号拆成 2 个实数频域信号 `ReX[k]` 和 `ImX[k]`（所谓的复数只是为了方便记账）；而复数 DFT 的输入 `x[n]` 与输出 `X[k]` 从头到尾都是真正的复数数组。",
        "**第二，频率范围与负频率**：实数 DFT 只关注正频率，索引 `k` 只跑到 `N/2`；复数 DFT 同时包含正频率和负频率，`k` 跑满 `0` 到 `N-1`。其中 `0` 到 `N/2` 是正频率，`N/2` 到 `N-1` 是负频率——由于离散信号的频谱具有**周期性**，`N/2` 到 `N-1` 与 `-N/2` 到 `0` 完全等价。样本点 `0` 和 `N/2` 恰好骑跨在正负频率的分界线上。",
        "**第三，虚数单位 `j` 的合法性**：在实数 DFT 的“复数代换”写法里，`j` 只是一个借用的标签，变回正余弦波时可以随手丢掉；但在复数 DFT 中，`j` 是严格数学方程里的正式变量，像 `x` 或 `N` 一样**绝不能随意增删**。",
        "**第四，因子 `2` 消失了（能量对半平分）**：实数 DFT 前面带有一个因子 `2`，因此振幅为 `1` 的余弦波，在频谱上的值也是 `1`。复数 DFT 没有这个因子 `2`，振幅为 `1` 的余弦波会被劈成两半——正频率处占 `1/2`，负频率处占 `1/2`，两者相加才还原出振幅为 `1` 的完整波形。",
        "**第五，彻底免除 DC 与奈奎斯特频率的特例**：在实数 DFT 中做正逆变换往返还原时，除了整体要乘 `2/N` 外，还必须对 `ReX[0]`（直流分量 DC）和 `ReX[N/2]`（奈奎斯特频率，采样率的一半）**额外除以 2**（即这两个点用 `1/N`，其余用 `2/N`）。而复数 DFT **没有任何特例**：只需在正变换、逆变换或两者之间统一引入一次 `1/N` 即可。原因在于 `0` 和 `N/2` 骑跨在正负分界线上，**没有对称配对的负频率伙伴**，天生只贡献了一半的时域能量，因此不需要特殊照顾！"
      ],
      "formula": {
        "expr": "实数 DFT 缩放：DC & Nyquist 用 1/N，其余用 2/N   |   复数 DFT 缩放：全频段统一 1/N（正变换/逆变换任选其一放置）",
        "explain": "复数 DFT 消除了实数 DFT 最令人头疼的边界分支判断，因为正负频率（除 0 与 N/2 外）各自自动承担 1/2 振幅。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：正负频率如何联手消除“虚部幽灵”（含听觉对比）",
      "instruction": "拖动频率与 ReX/ImX 权重观察 Eq. 31-8 重构过程；尝试关闭“包含负频率共轭配对”开关，观察虚部波形失效并聆听音量减半效果。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "归一化频率 k/N",
          "min": 0.05,
          "max": 0.45,
          "step": 0.01,
          "value": 0.23,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "reAmp",
          "label": "实部频谱 ReX (余弦权重)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imAmp",
          "label": "虚部频谱 ImX (正弦权重)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "includeNeg",
          "label": "包含负频率共轭配对",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet osc = null, gainNode = null;\n\nfunction syncAudio() {\n  const playing = !!lab.values.play;\n  if (playing) {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      osc.type = 'sine';\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.start();\n    }\n    const fHz = 200 + lab.values.freq * 1600;\n    const mag = Math.hypot(lab.values.reAmp, lab.values.imAmp) * (lab.values.includeNeg ? 1.0 : 0.5);\n    osc.frequency.setTargetAtTime(fHz, ac.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(Math.min(0.25, mag * 0.16), ac.currentTime, 0.02);\n  } else if (gainNode) {\n    const ac = lab.getAudioContext();\n    if (ac) gainNode.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n  }\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const f = lab.values.freq;\n  const reA = lab.values.reAmp;\n  const imA = lab.values.imAmp;\n  const neg = !!lab.values.includeNeg;\n\n  const sx0 = 36, sw = 285;\n  const reMidY = 62, imMidY = 178, specScale = 42;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = sx0 + (i / 4) * sw;\n    ctx.beginPath(); ctx.moveTo(gx, 18); ctx.lineTo(gx, 222); ctx.stroke();\n  }\n  [reMidY, imMidY].forEach(midY => {\n    ctx.beginPath(); ctx.moveTo(sx0, midY - specScale); ctx.lineTo(sx0 + sw, midY - specScale); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(sx0, midY + specScale); ctx.lineTo(sx0 + sw, midY + specScale); ctx.stroke();\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath(); ctx.moveTo(sx0, midY); ctx.lineTo(sx0 + sw, midY); ctx.stroke();\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  });\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('ReX[ ] (偶对称余弦)', sx0, 14);\n  ctx.fillText('ImX[ ] (奇对称正弦)', sx0, 130);\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '10px monospace';\n  ctx.fillText('-0.5', sx0 - 10, 234);\n  ctx.fillText('0', sx0 + sw / 2 - 3, 234);\n  ctx.fillText('+0.5', sx0 + sw - 12, 234);\n\n  function drawStem(freqVal, ampVal, midY, color, active, labelTxt) {\n    const px = sx0 + (freqVal + 0.5) * sw;\n    const py = midY - ampVal * specScale;\n    ctx.save();\n    if (!active) ctx.globalAlpha = 0.25;\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, midY); ctx.lineTo(px, py); ctx.stroke();\n    ctx.fillStyle = active ? color : 'transparent';\n    ctx.beginPath(); ctx.arc(px, py, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    if (!active) ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '10px monospace';\n    ctx.fillText(labelTxt, px + 6, py + (ampVal >= 0 ? -4 : 10));\n    ctx.restore();\n  }\n\n  drawStem(f, 0.5 * reA, reMidY, '#38bdf8', true, '1');\n  drawStem(-f, 0.5 * reA, reMidY, '#38bdf8', neg, '2');\n  drawStem(f, 0.5 * imA, imMidY, '#f59e0b', true, '3');\n  drawStem(-f, -0.5 * imA, imMidY, '#f59e0b', neg, '4');\n\n  const tx0 = 355, tw = 345, tMidY = 122, tScale = 80;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gx = tx0 + (i / 4) * tw;\n    ctx.beginPath(); ctx.moveTo(gx, 28); ctx.lineTo(gx, 218); ctx.stroke();\n  }\n  ctx.beginPath(); ctx.moveTo(tx0, tMidY - tScale); ctx.lineTo(tx0 + tw, tMidY - tScale); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(tx0, tMidY + tScale); ctx.lineTo(tx0 + tw, tMidY + tScale); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(tx0, tMidY); ctx.lineTo(tx0 + tw, tMidY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('时域重构 x[n]  (n = 0..24)', tx0, 14);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— Re{x[n]}', tx0 + 185, 14);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('-- Im{x[n]}', tx0 + 265, 14);\n\n  const Nsamp = 24, steps = 240;\n  ctx.save();\n  ctx.strokeStyle = neg ? '#10b981' : '#ec4899';\n  ctx.lineWidth = neg ? 1.5 : 2;\n  if (!neg) ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const n = (i / steps) * Nsamp;\n    const ang = 2 * Math.PI * f * n;\n    let imVal = 0.5 * reA * Math.sin(ang) + 0.5 * imA * Math.cos(ang);\n    if (neg) imVal += 0.5 * reA * Math.sin(-ang) - 0.5 * imA * Math.cos(-ang);\n    const px = tx0 + (i / steps) * tw;\n    const py = tMidY - imVal * tScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= steps; i++) {\n    const n = (i / steps) * Nsamp;\n    const ang = 2 * Math.PI * f * n;\n    let reVal = 0.5 * reA * Math.cos(ang) - 0.5 * imA * Math.sin(ang);\n    if (neg) reVal += 0.5 * reA * Math.cos(-ang) - (-0.5 * imA) * Math.sin(-ang);\n    const px = tx0 + (i / steps) * tw;\n    const py = tMidY - reVal * tScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (let n = 0; n <= Nsamp; n++) {\n    const ang = 2 * Math.PI * f * n;\n    let reVal = 0.5 * reA * Math.cos(ang) - 0.5 * imA * Math.sin(ang);\n    if (neg) reVal += 0.5 * reA * Math.cos(-ang) - (-0.5 * imA) * Math.sin(-ang);\n    const px = tx0 + (n / Nsamp) * tw;\n    const py = tMidY - reVal * tScale;\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const realGain = Math.hypot(reA, imA) * (neg ? 1 : 0.5);\n  const fHz = Math.round(200 + f * 1600);\n  const status = neg ? '负频率已配对：虚部完全抵消为 0，实部振幅 100%' : '⚠ 缺少负频率：振幅减半且残留虚部幽灵波形！';\n  lab.setReadout(`频率 k/N=${f.toFixed(2)} (试听 ${fHz}Hz) | 实部合成振幅=${realGain.toFixed(2)} | ${status}`);\n}\n\nlab.onUpdate(() => {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "concept",
      "heading": "3. 逆复数 DFT (IDFT) 与“符号反转”的底层机制",
      "paragraphs": [
        "看懂了正变换，我们再来看逆复数 DFT（Eq. 31-7）是如何把频谱重新拼回时域信号的。用欧拉公式将其展开为直角坐标形式（Eq. 31-8），就能看清每个频谱点到底对时域做了什么：",
        "• **频谱实部 `ReX[k]` 的每个值**，会同时向时域注入一个**实余弦波**和一个**虚正弦波**；",
        "• **频谱虚部 `ImX[k]` 的每个值**，会同时向时域注入一个**实正弦波（带负号）**和一个**虚余弦波**。",
        "例如，正频率 `+0.23` 处的 `ReX`（值为 `1/2`）产生 `0.5*cos(2π*0.23n) + 0.5j*sin(2π*0.23n)`；负频率 `-0.23` 处的 `ReX`（值也为 `1/2`）由于 `sin(-x) = -sin(x)`，产生 `0.5*cos(2π*0.23n) - 0.5j*sin(2π*0.23n)`。两者相加，虚部正弦波精确归零，实部合成为 `cos(2π*0.23n)`！",
        "而对于 `ImX`，当正频率为 `+1/2`、负频率为 `-1/2` 时，虚部余弦互相抵消，实部却叠加出 **`-sin(2π*0.23n)`**。也就是说，频谱虚部里的一个**正值**，对应着时域里的一个**负正弦波**！这种**符号反转**在复数 DFT 中是数学必然（实数 DFT 为了和它兼容，才人为加了同样的负号）。",
        "此外，展示频谱有两种等价画法：科研绘图习惯把零频放中间，画 `-0.5 ~ 0.5`（对应 `-N/2 ~ N/2-1`），这是理解完整频谱、也是展示非周期频谱的唯一方式；而公式和代码（如 Eq. 31-5）则常直接让 `k` 从 `0` 跑到 `N-1`（对应 `0 ~ 1.0`）。"
      ],
      "formula": {
        "expr": "x[n] = Σ(k=0..N-1) X[k] * e^(j * 2πkn / N) = Σ ReX[k][cos(θ) + j*sin(θ)] - Σ ImX[k][sin(θ) - j*cos(θ)]",
        "explain": "其中 θ = 2πkn/N。每个频域采样点都会同时生成时域的实正余弦与虚正余弦；对实信号而言，成对的正负频率恰好将所有虚部分量抵消殆尽。"
      }
    },
    {
      "type": "concept",
      "heading": "4. 频谱对称性与“虚部时域信号”的工程绝技",
      "paragraphs": [
        "复数 DFT 的对称性规律非常漂亮：当输入是一个**纯实数时域信号**（虚部全为 0）时，它的频谱必然满足——**实部 `ReX` 呈偶对称**（正负频率同号），**虚部 `ImX` 呈奇对称**（正负频率异号）。",
        "那么，如果 `x[n]` 的**虚部不为零**呢？在真实物理世界里，一般不存在“虚数时间信号”，但这在复数数学上是完全合法的，而且恰好能产生**截然相反的对称性**：纯虚数时域信号产生的频谱，是**实部 `ReX` 奇对称、虚部 `ImX` 偶对称**！",
        "利用线性叠加原理，工程上诞生了一个著名的 **FFT 翻倍加速技巧**（第 12 章详述）：把两个完全独立的实信号 `a[n]` 和 `b[n]`，分别塞进复数数组 `x[n]` 的实部和虚部，只跑**一次**复数 FFT，然后对输出频谱做一次简单的**偶/奇分解**，就能瞬间把 `a[n]` 和 `b[n]` 的频谱剥离出来，计算量直接省一半！"
      ],
      "formula": {
        "expr": "实输入 Re{x[n]} → ReX 偶对称 + ImX 奇对称   |   虚输入 Im{x[n]} → ReX 奇对称 + ImX 偶对称",
        "explain": "同时输入 x[n] = a[n] + j*b[n] 时，总频谱等于两者频谱之和，因此可用 (X[k] + X*[-k])/2 与 (X[k] - X*[-k])/(2j) 完美分离出两个实信号的频谱。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：16 点真实复数 DFT —— 观察 DC/Nyquist 边界与虚部信号对称破缺",
      "instruction": "调节直流分量 DC (k=0)、奈奎斯特分量 (k=8) 和虚部信号振幅，并切换两种频率视角，亲眼验证“不需特例处理”与对称性规律。",
      "controls": [
        {
          "type": "slider",
          "id": "realFreq",
          "label": "实部余弦频率 bin k",
          "min": 1,
          "max": 7,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "dc",
          "label": "直流分量 DC (k=0)",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nyq",
          "label": "奈奎斯特分量 (k=N/2)",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "imagAmp",
          "label": "虚部信号振幅 Im{x[n]}",
          "min": 0,
          "max": 1,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "centerZero",
          "label": "零频居中 (-N/2 ~ N/2-1)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nconst N = 16;\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  const kFreq = lab.values.realFreq;\n  const dc = lab.values.dc;\n  const nyq = lab.values.nyq;\n  const imAmp = lab.values.imagAmp;\n  const centered = !!lab.values.centerZero;\n\n  const xRe = new Array(N), xIm = new Array(N);\n  for (let n = 0; n < N; n++) {\n    xRe[n] = dc + nyq * Math.cos(Math.PI * n) + Math.cos((2 * Math.PI * kFreq * n) / N);\n    xIm[n] = imAmp * (0.7 * Math.cos((2 * Math.PI * 2 * n) / N) + 0.7 * Math.sin((2 * Math.PI * 5 * n) / N));\n  }\n\n  const XRe = new Array(N).fill(0), XIm = new Array(N).fill(0);\n  for (let k = 0; k < N; k++) {\n    let sumR = 0, sumI = 0;\n    for (let n = 0; n < N; n++) {\n      const ang = (2 * Math.PI * k * n) / N;\n      const c = Math.cos(ang), s = Math.sin(ang);\n      sumR += xRe[n] * c + xIm[n] * s;\n      sumI += xIm[n] * c - xRe[n] * s;\n    }\n    XRe[k] = sumR / N;\n    XIm[k] = sumI / N;\n  }\n\n  const lx0 = 18, lw = 205, lReY = 72, lImY = 178, lScale = 14;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [lReY, lImY].forEach(y0 => {\n    ctx.beginPath(); ctx.moveTo(lx0, y0); ctx.lineTo(lx0 + lw, y0); ctx.stroke();\n  });\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('时域 Re{x[n]}', lx0, 15);\n  ctx.fillText('时域 Im{x[n]}', lx0, 128);\n\n  for (let n = 0; n < N; n++) {\n    const px = lx0 + 8 + (n / (N - 1)) * (lw - 16);\n    const pyR = lReY - xRe[n] * lScale;\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, lReY); ctx.lineTo(px, pyR); ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath(); ctx.arc(px, pyR, 2.5, 0, Math.PI * 2); ctx.fill();\n\n    const pyI = lImY - xIm[n] * lScale;\n    ctx.strokeStyle = '#ec4899';\n    ctx.beginPath(); ctx.moveTo(px, lImY); ctx.lineTo(px, pyI); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(px, pyI, 2.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  const rx0 = 252, rw = 448, rReY = 74, rImY = 180, rScale = 36;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  [rReY, rImY].forEach(y0 => {\n    ctx.beginPath(); ctx.moveTo(rx0, y0 - rScale); ctx.lineTo(rx0 + rw, y0 - rScale); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(rx0, y0 + rScale * 0.7); ctx.lineTo(rx0 + rw, y0 + rScale * 0.7); ctx.stroke();\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath(); ctx.moveTo(rx0, y0); ctx.lineTo(rx0 + rw, y0); ctx.stroke();\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  });\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('频谱实部 ReX[k]  (琥珀色 = DC k=0 与 Nyquist k=8)', rx0, 15);\n  ctx.fillText('频谱虚部 ImX[k]', rx0, 128);\n\n  for (let i = 0; i < N; i++) {\n    const kDisp = centered ? i - N / 2 : i;\n    const kIdx = ((kDisp % N) + N) % N;\n    const px = rx0 + 16 + (i / (N - 1)) * (rw - 32);\n    const isSpecial = (kIdx === 0 || kIdx === N / 2);\n    const stemColorRe = isSpecial ? '#f59e0b' : '#10b981';\n    const stemColorIm = isSpecial ? '#f59e0b' : '#ec4899';\n\n    const yR = rReY - XRe[kIdx] * rScale;\n    ctx.strokeStyle = stemColorRe;\n    ctx.lineWidth = isSpecial ? 3 : 2;\n    ctx.beginPath(); ctx.moveTo(px, rReY); ctx.lineTo(px, yR); ctx.stroke();\n    ctx.fillStyle = stemColorRe;\n    ctx.beginPath(); ctx.arc(px, yR, isSpecial ? 4 : 3, 0, Math.PI * 2); ctx.fill();\n\n    const yI = rImY - XIm[kIdx] * rScale;\n    ctx.strokeStyle = stemColorIm;\n    ctx.lineWidth = isSpecial ? 3 : 2;\n    ctx.beginPath(); ctx.moveTo(px, rImY); ctx.lineTo(px, yI); ctx.stroke();\n    ctx.fillStyle = stemColorIm;\n    ctx.beginPath(); ctx.arc(px, yI, isSpecial ? 4 : 3, 0, Math.PI * 2); ctx.fill();\n\n    ctx.fillStyle = isSpecial ? '#f59e0b' : 'rgba(248,250,252,0.55)';\n    ctx.font = isSpecial ? 'bold 10px monospace' : '10px monospace';\n    const lbl = String(kDisp);\n    ctx.fillText(lbl, px - lbl.length * 3, 232);\n  }\n\n  const symText = imAmp === 0 ? '纯实信号 → ReX 偶对称，ImX 奇对称' : '含虚部信号 → ReX 与 ImX 对称性被打破（可做偶奇分解）';\n  lab.setReadout(`DC=${XRe[0].toFixed(2)} | Nyquist=${XRe[N / 2].toFixed(2)} | k=${kFreq}幅值=${XRe[kFreq].toFixed(2)} | ${symText}`);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（缩放因子别乘重了）：复数 DFT 正逆变换之间只需要总共一次 1/N。若正变换已经乘了 1/N（如 Eq. 31-5），逆变换（Eq. 31-7）前就不要再乘 1/N；切记不可沿用实数 DFT 的 2/N 以及对 0 和 N/2 额外除以 2 的老代码逻辑！",
        "避坑 2（负频率索引排列）：数组下标 `k` 在编程中通常为 `0..N-1`，此时 `k > N/2` 的部分（对应 `N/2+1 .. N-1`）就是负频率（等价于 `-N/2+1 .. -1`）；做频域滤波时如果不小心只改了前半段 `0..N/2` 而忘了同步修改对称的负频率段，逆变换后会出现严重的虚部残留和振幅减半！",
        "避坑 3（符号反转别搞错）：在复数 DFT 的标准定义下，正频率虚部 `ImX[+k] > 0` 对应的是 `-sin(2πkn/N)`，而非 `+sin`。",
        "核心口诀：实信号频谱“实偶虚奇”，虚信号频谱“实奇虚偶”；把两个实信号放进复数数组实虚部一次 FFT，算力直接减半。"
      ]
    }
  ]
});
