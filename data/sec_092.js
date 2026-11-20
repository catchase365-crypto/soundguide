window.__BOOK_REGISTER_SECTION__("sec_092", {
  "title": "时域与频域的镜像对称：对偶性 (Duality)",
  "intuition": "时域和频域就像硬币的正反面，正变换与逆变换的数学结构完全对称——你在时域总结出的任何规律，把“时间”和“频率”两个词对调后，在频域同样成立！",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 正变换与逆变换的对称美：为什么两者几乎一模一样？",
      "paragraphs": [
        "在离散傅里叶变换（DFT）中，把时域信号变成频域频谱的**分析方程（Analysis）**，与把频谱还原回时域信号的**综合方程（Synthesis）**，虽然推导出发点截然不同，但最终长相却惊人地相似：两者都是将已知序列逐点乘以正弦/余弦**基函数（Basis Functions）**，再把乘积相加。",
        "在**实数 DFT（Real DFT）**里，唯一看似不对称的地方在于数据格式：时域是 1 组长度为 `N` 的信号，而频域则是实部 `ReX[ ]` 和虚部 `ImX[ ]` 两组长度为 `N/2 + 1` 的信号。但正如后续章节将揭示的，一旦进入**复数 DFT（Complex DFT）**的视角，时域和频域都会变成长度为 `N` 的复数信号——此时两个域实现**完全对称**，正逆变换公式除了指数符号和归一化系数外几乎完全一致。",
        "傅里叶分析中这种时域与频域之间的高度对称性，就称为**对偶性（Duality）**。理解了对偶性，学一个性质就能白捡另一个对称性质。"
      ],
      "formula": {
        "expr": "x[n]  <===(基函数乘累加 · 完全对称)===>  X[k]",
        "explain": "x[n] 代表时域采样序列，X[k] 代表频域频谱序列。无论从时域走向频域还是反向还原，底层计算逻辑都是“与正交正余弦基函数相乘并求和”，这是对偶性成立的数学根基。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：单点脉冲与正弦波的对偶互换（含听觉对比）",
      "instruction": "拖动「索引位置」滑块，并切换「反转对偶方向」开关，观察左右两域如何互换角色；点击播放按钮，亲耳对比“频域单点（纯正弦音）”与“时域单点（全频谱脉冲）”的听感差异。",
      "controls": [
        {
          "type": "slider",
          "id": "pos",
          "label": "索引位置 (k₀ 或 n₀)",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "swap",
          "label": "反转方向：时域单点 → 频域正余弦",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放时域声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 32;\nvar half = 16;\nvar osc = null;\nvar bufSrc = null;\nvar gainNode = null;\n\nfunction stopAudio() {\n  if (osc) { try { osc.stop(); osc.disconnect(); } catch (e) {} osc = null; }\n  if (bufSrc) { try { bufSrc.stop(); bufSrc.disconnect(); } catch (e) {} bufSrc = null; }\n  if (gainNode) { try { gainNode.disconnect(); } catch (e) {} gainNode = null; }\n}\n\nfunction updateAudio(pos, swap, shouldPlay) {\n  stopAudio();\n  if (!shouldPlay) return;\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') { ac.resume(); }\n  gainNode = ac.createGain();\n  gainNode.connect(ac.destination);\n  if (!swap) {\n    if (pos === 0) {\n      gainNode.gain.value = 0;\n      return;\n    }\n    gainNode.gain.value = 0.16;\n    osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = pos * 110;\n    osc.connect(gainNode);\n    osc.start();\n  } else {\n    var sr = ac.sampleRate;\n    var periodSamples = Math.floor(sr / 85);\n    var buf = ac.createBuffer(1, periodSamples, sr);\n    var data = buf.getChannelData(0);\n    var pulseIdx = Math.floor((pos / N) * periodSamples);\n    for (var i = 0; i < periodSamples; i++) { data[i] = 0; }\n    data[pulseIdx] = 0.7;\n    if (pulseIdx + 1 < periodSamples) data[pulseIdx + 1] = 0.35;\n    gainNode.gain.value = 0.3;\n    bufSrc = ac.createBufferSource();\n    bufSrc.buffer = buf;\n    bufSrc.loop = true;\n    bufSrc.connect(gainNode);\n    bufSrc.start();\n  }\n}\n\nfunction drawGrid(x0, y0, w, h) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var y = y0 + (h * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();\n  }\n  for (var j = 0; j <= 4; j++) {\n    var x = x0 + (w * j) / 4;\n    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(x0, y0 + h / 2); ctx.lineTo(x0 + w, y0 + h / 2); ctx.stroke();\n}\n\nfunction drawStem(x0, y0, w, h, arr, color, radius) {\n  var midY = y0 + h / 2;\n  var amp = h * 0.38;\n  ctx.strokeStyle = color;\n  ctx.fillStyle = color;\n  ctx.lineWidth = 1.6;\n  for (var i = 0; i < arr.length; i++) {\n    var px = x0 + (i / (arr.length - 1)) * w;\n    var py = midY - arr[i] * amp;\n    ctx.beginPath(); ctx.moveTo(px, midY); ctx.lineTo(px, py); ctx.stroke();\n    ctx.beginPath(); ctx.arc(px, py, radius, 0, Math.PI * 2); ctx.fill();\n  }\n}\n\nlab.onUpdate(function() {\n  var pos = lab.values.pos;\n  var swap = lab.values.swap;\n  var play = lab.values.play;\n  updateAudio(pos, swap, play);\n\n  ctx.clearRect(0, 0, W, H);\n  var padT = 36, plotH = 178, leftX = 28, rightX = 388, plotW = 304;\n\n  drawGrid(leftX, padT, plotW, plotH);\n  drawGrid(rightX, padT, plotW, plotH);\n\n  var timeArr = [];\n  var reArr = [];\n  var imArr = [];\n  var i;\n  if (!swap) {\n    for (i = 0; i < N; i++) {\n      timeArr.push(Math.cos((2 * Math.PI * pos * i) / N));\n    }\n    for (i = 0; i <= half; i++) {\n      reArr.push(i === pos ? 1 : 0);\n      imArr.push(0);\n    }\n  } else {\n    for (i = 0; i < N; i++) {\n      timeArr.push(i === pos ? 1 : 0);\n    }\n    for (i = 0; i <= half; i++) {\n      reArr.push(Math.cos((2 * Math.PI * i * pos) / N));\n      imArr.push(-Math.sin((2 * Math.PI * i * pos) / N));\n    }\n  }\n\n  var midY = padT + plotH / 2;\n  var amp = plotH * 0.38;\n  if (!swap) {\n    ctx.strokeStyle = 'rgba(16,185,129,0.4)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var s = 0; s <= 120; s++) {\n      var t = s / 120;\n      var val = Math.cos(2 * Math.PI * pos * t * (N - 1) / N);\n      var px = leftX + t * plotW;\n      var py = midY - val * amp;\n      if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  } else {\n    ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    for (var s2 = 0; s2 <= 120; s2++) {\n      var t2 = s2 / 120;\n      var valRe = Math.cos(2 * Math.PI * (t2 * half) * pos / N);\n      var px2 = rightX + t2 * plotW;\n      var py2 = midY - valRe * amp;\n      if (s2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n    }\n    ctx.stroke();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.beginPath();\n    for (var s3 = 0; s3 <= 120; s3++) {\n      var t3 = s3 / 120;\n      var valIm = -Math.sin(2 * Math.PI * (t3 * half) * pos / N);\n      var px3 = rightX + t3 * plotW;\n      var py3 = midY - valIm * amp;\n      if (s3 === 0) ctx.moveTo(px3, py3); else ctx.lineTo(px3, py3);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  drawStem(leftX, padT, plotW, plotH, timeArr, '#10b981', 3);\n  if (swap) {\n    drawStem(rightX, padT, plotW, plotH, imArr, '#f59e0b', 2.5);\n  }\n  drawStem(rightX, padT, plotW, plotH, reArr, '#38bdf8', 3.5);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(!swap ? '时域 x[n]：余弦波 (N=32)' : '时域 x[n]：单点脉冲 δ[n - ' + pos + ']', leftX, 22);\n  ctx.fillText(!swap ? '频域 ReX[k]：单点谱线 k₀=' + pos : '频域 ReX[k](蓝) & ImX[k](橙)：正余弦波', rightX, 22);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('n = 0', leftX, H - 8);\n  ctx.fillText('n = 31', leftX + plotW - 34, H - 8);\n  ctx.fillText('k = 0', rightX, H - 8);\n  ctx.fillText('k = 16', rightX + plotW - 34, H - 8);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(352, H / 2); ctx.lineTo(372, H / 2); ctx.stroke();\n  ctx.fillStyle = '#ec4899';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText('⇄', 355, H / 2 - 8);\n\n  if (!swap) {\n    var audioNote = pos === 0 ? '直流 0 Hz (静默)' : (pos * 110) + ' Hz 纯净正弦音';\n    lab.setReadout('模式：频域单点 k₀=' + pos + ' → 时域 ' + pos + ' 个周期的余弦波 | 音频：' + audioNote);\n  } else {\n    lab.setReadout('模式：时域单点 n₀=' + pos + ' → 频域包络为余弦(ReX)与正弦(ImX)，幅度恒定覆盖全频段 | 音频：85 Hz 尖锐脉冲串(全谐波)');\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "2. 对偶性的两大杀手级推论：“单点 ↔ 正弦”与“卷积 ↔ 相乘”",
      "paragraphs": [
        "从刚才的实验中，你已经亲眼见证了对偶性的第一条经典结论——**单点 ↔ 正弦波**：频域里的一个孤立点，对应时域里一条连绵起伏的正弦/余弦波；反过来，时域里的一个孤立脉冲 $\\delta[n - n_0]$，展开到频域后，它的实部 `ReX[k]` 和虚部 `ImX[k]` 也变成了随着频率振荡的余弦和正弦波（脉冲在时域越靠后，频域波纹越密）。特别地，当单点落在原点（$n_0 = 0$）时，频域是一条平坦的直线——也就是说，**瞬间脉冲平等地包含所有频率**。",
        "对偶性的第二条杀手级推论更加威力无穷——**卷积 ↔ 相乘**。我们在滤波原理中学过：**时域中的卷积，等价于频域中的相乘**（例如把信号与滤波器频率响应相乘，就能滤除高频噪声）。",
        "利用对偶性，把“时域”和“频域”两个词直接对调，逆命题也百分之百成立：**时域中的相乘，等价于频域中的卷积！**这解释了 DSP 工程中两个最常见也最核心的现象：1）无线电中把信号在时域**乘以一个高频余弦波（调制）**，相当于在频域和一对对称脉冲做卷积，结果就是把整个频谱搬移到高频载波两侧；2）做 FFT 前在时域**乘以一个有限长度的窗函数（截断/加窗）**，相当于在频域与窗函数的频谱做卷积，导致原本细如针尖的谱线被“涂抹展宽”，这就是所谓**频谱泄漏（Spectral Leakage）**的物理根源。"
      ],
      "formula": {
        "expr": "x[n] · m[n]   <===>   (1/N) · (X[k] * M[k])",
        "explain": "左边 · 表示时域逐点相乘；右边 * 表示频域卷积。时域乘以余弦载波 = 频域搬移；时域乘以窄窗 = 频域卷积展宽。时域越窄，频域就越宽！"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：时域相乘 ↔ 频域卷积（调制搬移与加窗展宽）",
      "instruction": "调节「载波频率 f_m」观察时域相乘如何将频谱精准搬移分裂到 |f_m ± f₀|；缩小「时域窗宽 σ」观察时域包络变窄如何通过频域卷积把频谱主瓣展宽。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "原始信号频率 f₀",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "modFreq",
          "label": "时域相乘载波频率 f_m",
          "min": 0,
          "max": 14,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "winWidth",
          "label": "时域高斯窗宽度 σ",
          "min": 3,
          "max": 32,
          "step": 1,
          "value": 16,
          "unit": ""
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar N = 64;\nvar half = 31;\n\nfunction drawGrid(x0, y0, w, h, zeroCenter) {\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var y = y0 + (h * i) / 4;\n    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + w, y); ctx.stroke();\n  }\n  for (var j = 0; j <= 4; j++) {\n    var x = x0 + (w * j) / 4;\n    ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + h); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  var zy = zeroCenter ? (y0 + h / 2) : (y0 + h);\n  ctx.beginPath(); ctx.moveTo(x0, zy); ctx.lineTo(x0 + w, zy); ctx.stroke();\n}\n\nfunction computeMag(arr) {\n  var mag = [];\n  for (var k = 0; k <= half; k++) {\n    var re = 0, im = 0;\n    for (var n = 0; n < N; n++) {\n      var ang = (2 * Math.PI * k * n) / N;\n      re += arr[n] * Math.cos(ang);\n      im -= arr[n] * Math.sin(ang);\n    }\n    var scale = k === 0 ? (1 / N) : (2 / N);\n    mag.push(Math.sqrt(re * re + im * im) * scale);\n  }\n  return mag;\n}\n\nlab.onUpdate(function() {\n  var f0 = lab.values.sigFreq;\n  var fm = lab.values.modFreq;\n  var sigma = lab.values.winWidth;\n\n  var xArr = [], wArr = [], yArr = [];\n  for (var n = 0; n < N; n++) {\n    var xVal = Math.cos((2 * Math.PI * f0 * n) / N);\n    var wVal = Math.exp(-0.5 * Math.pow((n - N / 2) / sigma, 2));\n    var carrier = Math.cos((2 * Math.PI * fm * n) / N);\n    xArr.push(xVal);\n    wArr.push(wVal);\n    yArr.push(xVal * wVal * carrier);\n  }\n\n  var magX = computeMag(xArr);\n  var magY = computeMag(yArr);\n\n  ctx.clearRect(0, 0, W, H);\n  var padT = 36, plotH = 176, leftX = 24, rightX = 386, plotW = 310;\n  drawGrid(leftX, padT, plotW, plotH, true);\n  drawGrid(rightX, padT, plotW, plotH, false);\n\n  var midY = padT + plotH / 2;\n  var amp = plotH * 0.42;\n\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (var i = 0; i < N; i++) {\n    var px = leftX + (i / (N - 1)) * plotW;\n    var py = midY - xArr[i] * amp;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(245,158,11,0.7)';\n  ctx.beginPath();\n  for (var i2 = 0; i2 < N; i2++) {\n    var px2 = leftX + (i2 / (N - 1)) * plotW;\n    var py2 = midY - wArr[i2] * amp;\n    if (i2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  ctx.beginPath();\n  for (var i3 = 0; i3 < N; i3++) {\n    var px3 = leftX + (i3 / (N - 1)) * plotW;\n    var py3 = midY + wArr[i3] * amp;\n    if (i3 === 0) ctx.moveTo(px3, py3); else ctx.lineTo(px3, py3);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var i4 = 0; i4 < N; i4++) {\n    var px4 = leftX + (i4 / (N - 1)) * plotW;\n    var py4 = midY - yArr[i4] * amp;\n    if (i4 === 0) ctx.moveTo(px4, py4); else ctx.lineTo(px4, py4);\n  }\n  ctx.stroke();\n\n  var baseY = padT + plotH;\n  var magH = plotH * 0.88;\n  for (var k = 0; k <= half; k++) {\n    var fx = rightX + (k / half) * plotW;\n    if (magX[k] > 0.01) {\n      ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n      ctx.lineWidth = 4;\n      ctx.beginPath(); ctx.moveTo(fx, baseY); ctx.lineTo(fx, baseY - magX[k] * magH); ctx.stroke();\n    }\n    var barH = Math.min(1.05, magY[k]) * magH;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 5;\n    ctx.beginPath(); ctx.moveTo(fx, baseY); ctx.lineTo(fx, baseY - barH); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (var k2 = 0; k2 <= half; k2++) {\n    var fx2 = rightX + (k2 / half) * plotW;\n    var fy2 = baseY - Math.min(1.05, magY[k2]) * magH;\n    if (k2 === 0) ctx.moveTo(fx2, fy2); else ctx.lineTo(fx2, fy2);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('时域乘积 y[n] (绿) = 原信号(蓝虚) × 窗与载波(橙虚)', leftX, 22);\n  ctx.fillText('频域幅度 |Y[k]| (粉) vs 原信号 |X[k]| (淡蓝)', rightX, 22);\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('n = 0', leftX, H - 8);\n  ctx.fillText('n = 63', leftX + plotW - 34, H - 8);\n  ctx.fillText('k = 0', rightX, H - 8);\n  ctx.fillText('k = 31', rightX + plotW - 34, H - 8);\n\n  if (fm === 0) {\n    lab.setReadout('纯加窗截断 (f_m=0)：频谱保持在 k=' + f0 + '，但因时域乘以 σ=' + sigma + ' 的高斯窗，频域被卷积展宽！');\n  } else {\n    lab.setReadout('调制+加窗：原频谱 k=' + f0 + ' 被搬移并分裂至 |f_m-f₀|=' + Math.abs(fm - f0) + ' 与 f_m+f₀=' + (fm + f0) + '，且主瓣宽度随 σ 减小而展宽');\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（实数与复数的假象）：在实数 DFT 中，时域 N 点与频域两组 N/2+1 点看似不对称，但只要记住这只是复数 DFT（两边均为 N 点）在实信号上的折叠投影，对称性与对偶性依然严格成立。",
        "避坑 2（宽窄互换铁律）：由对偶性可知，“时域越窄，频域越宽；时域越宽，频域越窄”。想在频域看清相近的两个频率（频谱越尖锐），就必须在时域采集更长的时间窗。",
        "工程速记：以后看到任何信号处理操作，先问一句“它在时域是卷积还是相乘？”——时域卷积做滤波（频域相乘），时域相乘做搬移或加窗（频域卷积）。"
      ]
    }
  ]
});
