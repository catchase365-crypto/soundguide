window.__BOOK_REGISTER_SECTION__("sec_127", {
  "title": "傅里叶级数：周期连续信号的谐波拆解与重构 (The Fourier Series)",
  "intuition": "任何连续且无限重复的周期波形，无论形状多么尖锐古怪，都可以拆解成直流分量与一系列整数倍频（谐波）正余弦波的精确叠加。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 周期连续信号的频谱本质：离散的“谐波”阶梯",
      "paragraphs": [
        "作为傅里叶变换家族的最后一位成员，**傅里叶级数（Fourier Series）** 专门用来处理在时间轴上**连续且周期性重复**（从负无穷延伸到正无穷）的信号。",
        "只要信号在时域上以固定频率重复，它的频谱就不会是一片连续涂抹的“面”，而是由一根根分离的**谐波（Harmonics）**组成的“栅栏”。例如，一个每秒重复 1000 次（周期 `T = 1 ms`）的波形，其能量只会出现在 `1000 Hz`（第一谐波，即**基频 Fundamental Frequency** `f`）、`2000 Hz`（第二谐波 `2f`）、`3000 Hz`（第三谐波 `3f`）……以此类推。",
        "因此，我们可以用两种等价的视角看待周期信号的频谱：(1) 频谱是连续的，但在所有谐波之间的频率上幅值恒为零；(2) 频谱是离散的，只定义在各个整数倍谐波频率点上。无论怎么看，核心事实只有一个：**谐波之间的频率对构建该周期信号毫无贡献**。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "2. 合成与分析方程：如何用正余弦“拼出”与“测出”波形",
      "paragraphs": [
        "傅里叶级数包含一对互逆的工具：**合成方程（Synthesis Equation）**告诉我们如何把不同频率的余弦波与正弦波按权重相加，重构出目标周期信号 `x(t)`；**分析方程（Analysis Equations）**则通过相关积分，从已知波形 `x(t)` 中提取出每个谐波分量的振幅。",
        "请注意，在信号处理的实虚部约定下，余弦系数 `a_n` 对应频谱的**实部**，而正弦系数 `b_n` 对应频谱的**虚部**（因此在合成方程中 `b_n` 项前面带有负号）。此外，`a_0` 代表信号的**直流分量（DC Value）**，即整个周期内的平均值，可看作频率为 0 的余弦波振幅；因为频率为 0 的正弦波恒等于 0，所以不存在 `b_0`。",
        "由于信号是周期的，计算分析方程的积分时**只需覆盖任意一个完整周期**即可（例如 `-T/2` 到 `T/2`，或者 `0` 到 `T`）。积分区间起点不同只会改变中间数学推导，最终算出的结果完全一致。"
      ],
      "formula": {
        "expr": "合成: x(t) = a₀ + Σ[aₙcos(2πftn) - bₙsin(2πftn)]  |  分析: a₀=(1/T)∫x(t)dt,  aₙ=(2/T)∫x(t)cos(2πtn/T)dt,  bₙ=(-2/T)∫x(t)sin(2πtn/T)dt",
        "explain": "x(t) 为连续周期信号；f 为基频，T = 1/f 为周期；n = 1,2,3... 为谐波阶数；a₀ 是直流平均值；aₙ 与 bₙ 分别是第 n 次谐波余弦(实部)与正弦(虚部)的振幅权重，积分均在任意一个完整周期 T 内完成。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：常见波形重构、吉布斯过冲与谐波听感对比",
      "instruction": "切换不同经典波形并拖动“谐波数量 N”与“占空比 d”，观察方波/脉冲波边缘的吉布斯过冲（Gibbs Effect），点击播放即可用耳朵对比谐波数对音色的影响。",
      "controls": [
        {
          "type": "slider",
          "id": "waveType",
          "label": "波形 (1脉冲 2方波 3三角 4锯齿)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "harmonics",
          "label": "谐波数量 N",
          "min": 1,
          "max": 40,
          "step": 1,
          "value": 14,
          "unit": " 次"
        },
        {
          "type": "slider",
          "id": "duty",
          "label": "脉冲占空比 d (仅脉冲波生效)",
          "min": 0.1,
          "max": 0.8,
          "step": 0.05,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showIdeal",
          "label": "叠加理想目标波形",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听合成音色 (220Hz)",
          "activeLabel": "⏸ 停止发声"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioCtx = null, osc = null, gainNode = null;\n\nfunction getCoeffs(type, N, d) {\n  var a0 = 0, a = [], b = [];\n  for (var n = 1; n <= N; n++) {\n    var an = 0, bn = 0;\n    if (type === 1) {\n      a0 = d;\n      an = (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);\n    } else if (type === 2) {\n      an = (4 / (n * Math.PI)) * Math.sin(n * Math.PI / 2);\n    } else if (type === 3) {\n      if (n % 2 === 1) an = 8 / Math.pow(n * Math.PI, 2);\n    } else if (type === 4) {\n      bn = 2 / (n * Math.PI);\n    }\n    a.push(an);\n    b.push(bn);\n  }\n  return { a0: a0, a: a, b: b };\n}\n\nfunction getIdeal(type, ph, d) {\n  var p = ph - Math.floor(ph);\n  if (p > 0.5) p -= 1;\n  if (type === 1) return Math.abs(p) <= d / 2 ? 1 : 0;\n  if (type === 2) return Math.abs(p) <= 0.25 ? 1 : -1;\n  if (type === 3) return 1 - 4 * Math.abs(p);\n  if (type === 4) return 2 * p;\n  return 0;\n}\n\nfunction stopAudio() {\n  if (osc) { try { osc.stop(); osc.disconnect(); } catch (e) {} osc = null; }\n  if (gainNode) { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }\n}\n\nfunction updateAudio(type, N, d, play) {\n  if (!play) { stopAudio(); return; }\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  var c = getCoeffs(type, N, d);\n  var real = new Float32Array(N + 1);\n  var imag = new Float32Array(N + 1);\n  real[0] = 0; imag[0] = 0;\n  for (var n = 1; n <= N; n++) {\n    real[n] = c.a[n - 1];\n    imag[n] = -c.b[n - 1];\n  }\n  var wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: false });\n  if (!osc) {\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.2;\n    gainNode.connect(audioCtx.destination);\n    osc = audioCtx.createOscillator();\n    osc.frequency.value = 220;\n    osc.setPeriodicWave(wave);\n    osc.connect(gainNode);\n    osc.start();\n  } else {\n    osc.setPeriodicWave(wave);\n  }\n}\n\nlab.onUpdate(function() {\n  var v = lab.values;\n  var type = Math.round(v.waveType);\n  var N = Math.round(v.harmonics);\n  var d = v.duty;\n  var names = ['', '脉冲波 Pulse', '方波 Square', '三角波 Triangle', '锯齿波 Sawtooth'];\n  var c = getCoeffs(type, N, d);\n  updateAudio(type, N, d, v.play);\n\n  ctx.clearRect(0, 0, W, H);\n  var wLeft = 36, wRight = 450, wW = wRight - wLeft;\n  var yMid = type === 1 ? 182 : 122;\n  var yScale = type === 1 ? 120 : 82;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = wLeft; gx <= wRight; gx += wW / 4) {\n    ctx.beginPath(); ctx.moveTo(gx, 22); ctx.lineTo(gx, 215); ctx.stroke();\n  }\n  for (var gy = -1; gy <= 1; gy += 0.5) {\n    var py = yMid - gy * yScale;\n    if (py >= 20 && py <= 215) {\n      ctx.beginPath(); ctx.moveTo(wLeft, py); ctx.lineTo(wRight, py); ctx.stroke();\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(wLeft, yMid); ctx.lineTo(wRight, yMid); ctx.stroke();\n\n  if (v.showIdeal) {\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.38)';\n    ctx.lineWidth = 1.5;\n    ctx.setLineDash([4, 3]);\n    ctx.beginPath();\n    for (var i = 0; i <= 400; i++) {\n      var ph = -1 + (2 * i) / 400;\n      var val = getIdeal(type, ph, d);\n      var px = wLeft + (i / 400) * wW;\n      var py = yMid - val * yScale;\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  var maxVal = -999, minVal = 999;\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 400; i++) {\n    var ph = -1 + (2 * i) / 400;\n    var val = c.a0;\n    for (var n = 1; n <= N; n++) {\n      var ang = 2 * Math.PI * n * ph;\n      val += c.a[n - 1] * Math.cos(ang) - c.b[n - 1] * Math.sin(ang);\n    }\n    if (val > maxVal) maxVal = val;\n    if (val < minVal) minVal = val;\n    var px = wLeft + (i / 400) * wW;\n    var py = yMid - val * yScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var sLeft = 480, sRight = 702, sW = sRight - sLeft, sBase = 195, sTop = 36;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(sLeft, sBase); ctx.lineTo(sRight, sBase); ctx.stroke();\n  var maxShow = Math.max(N, 15);\n  var barStep = sW / (maxShow + 1);\n  var magMax = type === 1 ? 1.0 : (type === 4 ? 0.7 : 1.35);\n\n  ctx.fillStyle = '#f59e0b';\n  var dcH = (Math.abs(c.a0) / magMax) * (sBase - sTop);\n  ctx.fillRect(sLeft + 2, sBase - dcH, Math.max(3, barStep * 0.65), dcH);\n\n  for (var n = 1; n <= N; n++) {\n    var mag = Math.sqrt(c.a[n - 1] * c.a[n - 1] + c.b[n - 1] * c.b[n - 1]);\n    var bh = Math.min(sBase - sTop, (mag / magMax) * (sBase - sTop));\n    var bx = sLeft + n * barStep;\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillRect(bx, sBase - bh, Math.max(2, barStep * 0.65), bh);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域重构: ' + names[type] + ' (2个周期)', wLeft, 16);\n  ctx.fillText('频谱幅值 |Cₙ| (DC + 1~' + N + '次谐波)', sLeft, 16);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('DC', sLeft + 1, 210);\n  ctx.fillText('f', sLeft + barStep, 210);\n  ctx.fillText(N + 'f', sLeft + N * barStep - 4, 210);\n\n  var overshoot = type === 1 ? Math.max(0, maxVal - 1) * 100 : (type === 3 ? 0 : Math.max(0, maxVal - 1) * 50);\n  lab.setReadout('波形: ' + names[type] + ' | 谐波 N=' + N + (type === 1 ? ' | 占空比 d=' + d.toFixed(2) : '') + ' | 峰值区间: [' + minVal.toFixed(2) + ', ' + maxVal.toFixed(2) + ']' + (type !== 3 ? ' | 吉布斯过冲 ≈ ' + overshoot.toFixed(1) + '%' : ' | 无跳变沿(收敛极快)'));\n});"
    },
    {
      "type": "concept",
      "heading": "3. 对称性决定实虚部，尖锐边缘导致缓慢收敛",
      "paragraphs": [
        "为什么在上面的实验里，脉冲波、方波、三角波都只有 `a_n` 而没有 `b_n`，而锯齿波却恰恰相反？秘密在于信号相对于时间原点 `t = 0` 的**奇偶对称性**：",
        "1. **偶对称（Even）**：如果波形关于 `t = 0` 左右镜面对称（如中心对齐 `t = 0` 的脉冲波和三角波），它就只能由同样偶对称的余弦波构成，此时所有的 `b_n` 系数全部为零。",
        "2. **奇对称（Odd）**：如果波形关于 `t = 0` 原点反对称（如过零点的锯齿波，或平移了四分之一周期的方波），它就只能由奇对称的正弦波构成，此时所有的 `a_n` 系数全部为零。",
        "3. **时移不变性与极坐标直觉**：只要把时域波形左右平移一点点，直角坐标下的 `a_n` 与 `b_n` 就会剧烈此消彼长；但如果转换到极坐标 `(M_n, θ_n)`，**幅值 `M_n` 完全保持不变**，时移仅仅是给相位谱 `θ_n` 叠加了一个与频率 `n` 成正比的**线性相位分量**。",
        "此外，观察脉冲波（原书图 13-12 中 `f=1kHz, A=1V, d=0.2`）用前 14 次谐波重构的结果你会发现：**即使叠加了 14 个谐波，矩形边缘依然有很多波纹和过冲（吉布斯效应 Gibbs Effect）**。这是因为时域里的**垂直跳变沿**对应着频域里延伸到极高频率的丰富谐波——数学上称之为“傅里叶级数收敛非常缓慢”。"
      ],
      "formula": {
        "expr": "脉冲串 (占空比 d=k/T):  a₀ = A·d ,   aₙ = (2A / nπ)·sin(nπd) ,   bₙ = 0",
        "explain": "当脉冲中心严格落在 t=0 处时，波形呈偶对称，正弦项 bₙ 全部消零；占空比 d 越小，主瓣越宽，高频谐波衰减得越慢。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：时移对称性揭秘——直角坐标 (aₙ, bₙ) vs 极坐标 (Mₙ, θₙ)",
      "instruction": "左右拖动“时移量 Δt / T”（尝试停在 0 或 ±0.25T），观察方波在偶对称与奇对称间切换时 aₙ/bₙ 如何互换，而幅值 Mₙ 稳如磐石、相位 θₙ 呈直线倾斜。",
      "controls": [
        {
          "type": "slider",
          "id": "shift",
          "label": "时移量 Δt / T",
          "min": -0.5,
          "max": 0.5,
          "step": 0.025,
          "value": 0,
          "unit": " T"
        },
        {
          "type": "slider",
          "id": "waveMode",
          "label": "信号 (1零均值方波 2窄脉冲d=0.14)",
          "min": 1,
          "max": 2,
          "step": 1,
          "value": 1,
          "unit": ""
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\n\nlab.onUpdate(function() {\n  var shift = lab.values.shift;\n  var mode = Math.round(lab.values.waveMode);\n  ctx.clearRect(0, 0, W, H);\n\n  var tLeft = 18, tRight = 248, tW = tRight - tLeft, tMidY = mode === 1 ? 125 : 175, tScale = mode === 1 ? 65 : 105;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(tLeft, tMidY - tScale); ctx.lineTo(tRight, tMidY - tScale); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(tLeft, tMidY + (mode === 1 ? tScale : 0)); ctx.lineTo(tRight, tMidY + (mode === 1 ? tScale : 0)); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(tLeft, tMidY); ctx.lineTo(tRight, tMidY); ctx.stroke();\n\n  var tZeroX = tLeft + tW * 0.5;\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(tZeroX, 26); ctx.lineTo(tZeroX, 214); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 300; i++) {\n    var ph = -1 + (2 * i) / 300;\n    var p = ph - shift;\n    p = p - Math.floor(p);\n    if (p > 0.5) p -= 1;\n    var val = mode === 1 ? (Math.abs(p) <= 0.25 ? 1 : -1) : (Math.abs(p) <= 0.07 ? 1 : 0);\n    var px = tLeft + (i / 300) * tW;\n    var py = tMidY - val * tScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var rLeft = 276, rRight = 486, rW = rRight - rLeft, rMidY = 125, rScale = 64;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(rLeft, rMidY); ctx.lineTo(rRight, rMidY); ctx.stroke();\n\n  var pLeft = 514, pRight = 706, pW = pRight - pLeft;\n  var mBase = 104, mTop = 30, thMid = 175, thScale = 34;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(pLeft, mBase); ctx.lineTo(pRight, mBase); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(pLeft, thMid); ctx.lineTo(pRight, thMid); ctx.stroke();\n\n  var N = 7;\n  var rStep = rW / N, pStep = pW / N;\n  var d = 0.14;\n  var phasePts = [];\n\n  for (var n = 1; n <= N; n++) {\n    var a0n = mode === 1 ? (4 / (n * Math.PI)) * Math.sin(n * Math.PI / 2) : (2 / (n * Math.PI)) * Math.sin(n * Math.PI * d);\n    var angShift = 2 * Math.PI * n * shift;\n    var an = a0n * Math.cos(angShift);\n    var bn = -a0n * Math.sin(angShift);\n    var mn = Math.abs(a0n);\n    var dTheta = -angShift;\n    while (dTheta > Math.PI) dTheta -= 2 * Math.PI;\n    while (dTheta < -Math.PI) dTheta += 2 * Math.PI;\n\n    var rx = rLeft + (n - 0.5) * rStep;\n    var aH = (an / 1.35) * rScale;\n    var bH = (bn / 1.35) * rScale;\n    ctx.fillStyle = '#38bdf8';\n    if (aH >= 0) ctx.fillRect(rx - 7, rMidY - aH, 6, aH); else ctx.fillRect(rx - 7, rMidY, 6, -aH);\n    ctx.fillStyle = '#ec4899';\n    if (bH >= 0) ctx.fillRect(rx + 1, rMidY - bH, 6, bH); else ctx.fillRect(rx + 1, rMidY, 6, -bH);\n\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(n + 'f', rx - 5, 214);\n\n    var px = pLeft + (n - 0.5) * pStep;\n    var mh = (mn / 1.35) * (mBase - mTop);\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(px - 5, mBase - mh, 10, mh);\n\n    if (mn > 1e-4) {\n      var py = thMid - (dTheta / Math.PI) * thScale;\n      phasePts.push({ x: px, y: py });\n    }\n    ctx.fillStyle = 'rgba(248,250,252,0.65)';\n    ctx.fillText(n + 'f', px - 5, 224);\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  for (var k = 0; k < phasePts.length; k++) {\n    ctx.beginPath(); ctx.arc(phasePts[k].x, phasePts[k].y, 3.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('时域平移 (虚线为 t=0)', tLeft, 16);\n  ctx.fillText('直角坐标: aₙ(蓝) vs bₙ(粉)', rLeft, 16);\n  ctx.fillText('极坐标幅值 Mₙ (恒定不变)', pLeft, 16);\n  ctx.fillText('相位变化 Δθₙ ∈ [-π, π]', pLeft, 130);\n\n  var symLabel = '非对称 (aₙ, bₙ 均存在)';\n  if (Math.abs(shift) < 0.005 || Math.abs(Math.abs(shift) - 0.5) < 0.005) symLabel = '偶对称 (bₙ=0, 纯余弦)';\n  else if (mode === 1 && Math.abs(Math.abs(shift) - 0.25) < 0.005) symLabel = '奇对称 (aₙ=0, 纯正弦)';\n  lab.setReadout('当前时移: ' + shift.toFixed(3) + 'T | 对称性: ' + symLabel + ' | 极坐标幅值 M₁=' + (mode === 1 ? (4 / Math.PI).toFixed(3) : ((2 / Math.PI) * Math.sin(Math.PI * d)).toFixed(3)) + ' (平移不改变 Mₙ)');\n});"
    },
    {
      "type": "concept",
      "heading": "4. 工程实战：用傅里叶级数设计“电子倍频器”",
      "paragraphs": [
        "傅里叶级数不仅用于理论分析，还是射频与通信电路中的核心设计工具——**电子倍频（Electronic Frequency Multiplication）**。",
        "假设你需要为一个无线电发射机打造一颗极其稳定的 `150 MHz` 正弦波振荡器。为了高稳定性，必须采用**石英晶体振荡器（Crystal Controlled Oscillator）**，但问题在于：石英晶体最高只能稳定工作在大约 `10 MHz` 左右！",
        "工程上的绝妙解法是：先造一个 `1~10 MHz` 的高精度低频晶振，然后故意让这个纯正弦波通过二极管削波、平方电路等**非线性失真环节**。根据傅里叶级数，失真后的周期信号必然涌现出丰富的 `2f, 3f, 4f...` 高次谐波。最后只需接上一级**带通滤波器（Band-Pass Filter）**，把目标倍数的高次谐波单独“揪”出来，就能得到纯净的高频正弦波！实际电路常串联多级二倍频器与三倍频器来实现上百兆赫兹的频率倍增，而傅里叶级数恰好精确预言了不同失真方式下各次谐波的振幅大小。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "微实验三：非线性失真倍频器与带通滤波器选频",
      "instruction": "把“失真度”拉到 0 时高次谐波彻底消失；增大“失真度”与“不对称偏置”后，切换目标倍频 k 并打开声音，亲耳听出纯正的 k 倍频正弦音高！",
      "controls": [
        {
          "type": "slider",
          "id": "drive",
          "label": "非线性失真强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "asym",
          "label": "不对称偏置 (激发出偶次谐波)",
          "min": 0,
          "max": 0.8,
          "step": 0.05,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "targetK",
          "label": "带通滤波目标倍频 k",
          "min": 1,
          "max": 5,
          "step": 1,
          "value": 3,
          "unit": " f₀"
        },
        {
          "type": "toggle",
          "id": "showFiltered",
          "label": "输出/试听带通滤波后的纯倍频正弦波",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听输出信号 (基频 165Hz)",
          "activeLabel": "⏸ 停止发声"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar audioCtx = null, osc = null, gainNode = null;\n\nfunction analyzeDistortion(drive, asym) {\n  var N_s = 256, maxH = 6;\n  var samples = [];\n  for (var i = 0; i < N_s; i++) {\n    var th = (2 * Math.PI * i) / N_s;\n    var raw = Math.sin(th);\n    var nl = raw + drive * (Math.tanh(3.5 * (raw + asym * 0.7)) - raw + 0.55 * asym * (raw * raw));\n    samples.push(nl);\n  }\n  var a = [], b = [], mag = [];\n  for (var n = 1; n <= maxH; n++) {\n    var sumA = 0, sumB = 0;\n    for (var i = 0; i < N_s; i++) {\n      var th = (2 * Math.PI * i) / N_s;\n      sumA += samples[i] * Math.cos(n * th);\n      sumB += samples[i] * Math.sin(n * th);\n    }\n    var an = (2 / N_s) * sumA;\n    var bn = (-2 / N_s) * sumB;\n    a.push(an);\n    b.push(bn);\n    mag.push(Math.sqrt(an * an + bn * bn));\n  }\n  return { samples: samples, a: a, b: b, mag: mag };\n}\n\nfunction stopAudio() {\n  if (osc) { try { osc.stop(); osc.disconnect(); } catch (e) {} osc = null; }\n  if (gainNode) { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }\n}\n\nfunction updateAudio(res, k, filtered, play) {\n  if (!play) { stopAudio(); return; }\n  audioCtx = lab.getAudioContext();\n  if (!audioCtx) return;\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n  var real = new Float32Array(7);\n  var imag = new Float32Array(7);\n  real[0] = 0; imag[0] = 0;\n  for (var n = 1; n <= 6; n++) {\n    if (!filtered || n === k) {\n      real[n] = res.a[n - 1];\n      imag[n] = -res.b[n - 1];\n    } else {\n      real[n] = 0; imag[n] = 0;\n    }\n  }\n  var wave = audioCtx.createPeriodicWave(real, imag, { disableNormalization: true });\n  if (!osc) {\n    gainNode = audioCtx.createGain();\n    gainNode.gain.value = 0.22;\n    gainNode.connect(audioCtx.destination);\n    osc = audioCtx.createOscillator();\n    osc.frequency.value = 165;\n    osc.setPeriodicWave(wave);\n    osc.connect(gainNode);\n    osc.start();\n  } else {\n    osc.setPeriodicWave(wave);\n  }\n}\n\nlab.onUpdate(function() {\n  var v = lab.values;\n  var drive = v.drive, asym = v.asym, k = Math.round(v.targetK), filtered = v.showFiltered;\n  var res = analyzeDistortion(drive, asym);\n  updateAudio(res, k, filtered, v.play);\n\n  ctx.clearRect(0, 0, W, H);\n  var wLeft = 28, wRight = 446, wW = wRight - wLeft, yMid = 124, yScale = 64;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = wLeft; gx <= wRight; gx += wW / 4) {\n    ctx.beginPath(); ctx.moveTo(gx, 26); ctx.lineTo(gx, 216); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(wLeft, yMid); ctx.lineTo(wRight, yMid); ctx.stroke();\n\n  ctx.strokeStyle = filtered ? 'rgba(56, 189, 248, 0.35)' : '#ec4899';\n  ctx.lineWidth = filtered ? 1.4 : 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 256; i++) {\n    var idx = (i * 2) % 256;\n    var px = wLeft + (i / 256) * wW;\n    var py = yMid - res.samples[idx] * yScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = filtered ? '#10b981' : 'rgba(16, 185, 129, 0.45)';\n  ctx.lineWidth = filtered ? 2.4 : 1.3;\n  ctx.beginPath();\n  for (var i = 0; i <= 256; i++) {\n    var th = (4 * Math.PI * i) / 256;\n    var val = res.a[k - 1] * Math.cos(k * th) - res.b[k - 1] * Math.sin(k * th);\n    var px = wLeft + (i / 256) * wW;\n    var py = yMid - val * yScale;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var sLeft = 478, sRight = 702, sW = sRight - sLeft, sBase = 195, sTop = 34;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(sLeft, sBase); ctx.lineTo(sRight, sBase); ctx.stroke();\n\n  var barStep = sW / 6;\n  for (var n = 1; n <= 6; n++) {\n    var bx = sLeft + (n - 0.5) * barStep;\n    var bh = Math.min(sBase - sTop, (res.mag[n - 1] / 1.25) * (sBase - sTop));\n    if (n === k) {\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 1.5;\n      ctx.fillRect(bx - barStep * 0.36, sTop - 4, barStep * 0.72, sBase - sTop + 6);\n      ctx.strokeRect(bx - barStep * 0.36, sTop - 4, barStep * 0.72, sBase - sTop + 6);\n      ctx.fillStyle = '#10b981';\n    } else {\n      ctx.fillStyle = '#38bdf8';\n    }\n    ctx.fillRect(bx - 8, sBase - bh, 16, bh);\n    ctx.fillStyle = n === k ? '#f59e0b' : 'rgba(248,250,252,0.7)';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(n + 'f₀', bx - 7, 213);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('失真波(蓝/粉) vs 提取出的 ' + k + 'f₀ 正弦波(绿)', wLeft, 16);\n  ctx.fillText('谐波频谱与带通滤波窗', sLeft, 16);\n\n  lab.setReadout('输入基频 165Hz → 带通选择 ' + k + 'f₀ (' + (165 * k) + 'Hz) | 提取谐波幅值 M_' + k + ' = ' + res.mag[k - 1].toFixed(3) + (res.mag[k - 1] < 0.02 ? ' (过弱! 请增大失真度或调节偏置)' : ' (倍频输出有效)'));\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【记准适用边界】傅里叶级数专门针对“时域连续、周期无限重复”的信号；它的频谱必然是离散的谐波尖峰，谐波之间能量为零。",
        "【善用对称性简化手算】计算积分前先看波形关于 t=0 是否对称：偶对称直接令所有 bₙ=0，奇对称直接令所有 aₙ=0，能省去一半以上积分计算。",
        "【平移只改相位，不改幅值】在极坐标下，时间轴上的左右平移绝不会改变谐波的幅度谱 Mₙ，只会给相位谱 θₙ 加上一条斜率与平移量成正比的直线。",
        "【硬边缘 = 慢收敛 + 吉布斯效应】包含垂直跳变沿的方波/脉冲波，即便叠加几十个高次谐波，边缘处依然存在约 9% 的过冲振铃；强行硬截断高频频谱必然导致时域吉布斯过冲。",
        "【非线性失真并非总是坏事】工程上做射频倍频器时，正是故意利用二极管削波或平方电路破坏正弦波的线性度，再用带通滤波器从谐波丛林中精准提取目标倍频。"
      ]
    }
  ]
});
