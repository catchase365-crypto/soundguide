window.__BOOK_REGISTER_SECTION__("sec_142", {
  "title": "把窗函数 Sinc 滤波器推向极限（Pushing it to the Limit）",
  "intuition": "通过将滤波器核与自身卷积，我们可以把阻带衰减从 -74 dB 直接翻倍到 -148 dB；而在双精度浮点与数万点核长的加持下，数字滤波器能轻易实现模拟电路永远无法企及的“砖墙级”性能，唯一的代价只是计算时间。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 自卷积与级联：突破 -74 dB 的黑曼窗天花板",
      "paragraphs": [
        "假设你在工程中遇到一个极端场景：需要从 **120 伏** 的强工频电源线上，提取出一个仅有 **1 毫伏** 的微弱信号。1 毫伏与 120 伏相差了十万倍以上，这意味着你的低通滤波器必须在阻带提供至少 **-120 dB**（即百万分之一级别）的衰减能力。",
        "然而，单纯使用单级黑曼窗（Blackman window）的窗函数 Sinc 滤波器，阻带衰减极限只有 **-74 dB**（约五千分之一），完全压不住这种量级的干扰。怎么办？答案简单得惊人：**把信号连续通过同一个滤波器两次！** 第一遍输出一个中间信号，第二遍再滤一次，阻带衰减就会在分贝尺度上直接翻倍，从 -74 dB 暴涨到 **-148 dB**（三千万分之一）！",
        "在数学上，将信号连续通过两个滤波器，等价于先将两个滤波器核做**卷积**，合并成一个单一的超级滤波器核。也就是说，**把任意滤波器核与自身卷积（`h_new = h * h`）**，就能瞬间获得更深的阻带衰减。当然，天下没有免费的午餐——这样做的代价是**滤波器核长度翻倍**（例如 101 点变成 201 点），且过渡带的滚降速度会略微变缓。"
      ],
      "formula": {
        "expr": "h_combined[n] = (h * h)[n]   ⇔   H_combined(f) = [H(f)]²",
        "explain": "h[n] 为原始滤波器核，* 代表离散卷积；时域做一次核的自卷积，等效于频域响应 H(f) 取平方，从而使分贝表示的阻带衰减直接翻倍（如 -74 dB → -148 dB）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：从强干扰中捞出微弱信号（自卷积与浮点精度噪声）",
      "instruction": "观察 f = 0.30 处强干扰的衰减深度：先试着开启「自卷积级联」，再对比开启「双精度浮点」消除单精度舍入噪声底，并点击播放听辨 330 Hz 微弱信号中 2400 Hz 干扰啸叫的消失过程。",
      "controls": [
        {
          "type": "slider",
          "id": "fc",
          "label": "截止频率 fc",
          "min": 0.08,
          "max": 0.35,
          "step": 0.01,
          "value": 0.14,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "selfConv",
          "label": "开启自卷积级联 (h * h)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "doublePrec",
          "label": "使用双精度浮点 (64-bit)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波听感对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width, H = lab.height;\nvar ac = null, sigOsc = null, intOsc = null, intGain = null, masterGain = null;\nvar lastAttAtInt = 0.0002;\n\nfunction computeSpectrum() {\n  var M = 100;\n  var fc = lab.values.fc;\n  var useDouble = lab.values.doublePrec;\n  var doSelf = lab.values.selfConv;\n  var h = new Float64Array(M + 1);\n  var sum = 0;\n  for (var i = 0; i <= M; i++) {\n    var k = i - M / 2;\n    var v = (k === 0) ? (2 * Math.PI * fc) : (Math.sin(2 * Math.PI * fc * k) / k);\n    v *= (0.42 - 0.5 * Math.cos(2 * Math.PI * i / M) + 0.08 * Math.cos(4 * Math.PI * i / M));\n    h[i] = v;\n    sum += v;\n  }\n  for (var i = 0; i <= M; i++) {\n    h[i] = useDouble ? (h[i] / sum) : Math.fround(h[i] / sum);\n  }\n  var kernel = h;\n  if (doSelf) {\n    var len2 = 2 * M + 1;\n    var h2 = new Float64Array(len2);\n    for (var i = 0; i <= M; i++) {\n      for (var j = 0; j <= M; j++) {\n        var prod = useDouble ? (h[i] * h[j]) : Math.fround(h[i] * h[j]);\n        h2[i + j] = useDouble ? (h2[i + j] + prod) : Math.fround(h2[i + j] + prod);\n      }\n    }\n    kernel = h2;\n  }\n  var L = kernel.length;\n  var mid = (L - 1) / 2;\n  var nPts = 260;\n  var freqs = new Float64Array(nPts);\n  var dbs = new Float64Array(nPts);\n  var maxStopDb = -200;\n  var intMag = 0;\n  for (var p = 0; p < nPts; p++) {\n    var f = 0.5 * p / (nPts - 1);\n    freqs[p] = f;\n    var acc = kernel[mid];\n    for (var k = 1; k <= mid; k++) {\n      var c = Math.cos(2 * Math.PI * f * k);\n      var term = kernel[mid + k] * 2 * (useDouble ? c : Math.fround(c));\n      acc = useDouble ? (acc + term) : Math.fround(acc + Math.fround(term));\n    }\n    var mag = Math.abs(acc);\n    if (!useDouble) {\n      var pseudoNoise = Math.abs(Math.sin(p * 12.9898 + fc * 78.233) * 43758.5453 % 1) * 1.4e-6;\n      mag = Math.max(mag, pseudoNoise);\n    }\n    var db = 20 * Math.log10(Math.max(mag, 1e-10));\n    if (db < -200) db = -200;\n    dbs[p] = db;\n    if (f > fc + 0.05 && db > maxStopDb) maxStopDb = db;\n    if (Math.abs(f - 0.30) < 0.002) intMag = mag;\n  }\n  // Exact check at f = 0.30\n  var accInt = kernel[mid];\n  for (var k = 1; k <= mid; k++) {\n    var cInt = Math.cos(2 * Math.PI * 0.30 * k);\n    var tInt = kernel[mid + k] * 2 * (useDouble ? cInt : Math.fround(cInt));\n    accInt = useDouble ? (accInt + tInt) : Math.fround(accInt + Math.fround(tInt));\n  }\n  intMag = Math.abs(accInt);\n  if (!useDouble) intMag = Math.max(intMag, 1.0e-6);\n  lastAttAtInt = intMag;\n  return { freqs: freqs, dbs: dbs, kernelLen: L, maxStopDb: maxStopDb, intDb: 20 * Math.log10(Math.max(intMag, 1e-10)) };\n}\n\nfunction updateAudio() {\n  if (!lab.values.play) {\n    if (masterGain && ac && ac.state !== 'closed') {\n      masterGain.gain.setTargetAtTime(0, ac.currentTime, 0.02);\n    }\n    return;\n  }\n  ac = lab.getAudioContext();\n  if (!ac || ac.state === 'closed') return;\n  if (ac.state === 'suspended') ac.resume();\n  if (!masterGain) {\n    masterGain = ac.createGain();\n    masterGain.gain.value = 0;\n    masterGain.connect(ac.destination);\n    sigOsc = ac.createOscillator();\n    sigOsc.type = 'sine';\n    sigOsc.frequency.value = 330;\n    var sigGain = ac.createGain();\n    sigGain.gain.value = 0.08;\n    sigOsc.connect(sigGain);\n    sigGain.connect(masterGain);\n    intOsc = ac.createOscillator();\n    intOsc.type = 'sine';\n    intOsc.frequency.value = 2400;\n    intGain = ac.createGain();\n    intGain.gain.value = 0;\n    intOsc.connect(intGain);\n    intGain.connect(masterGain);\n    sigOsc.start();\n    intOsc.start();\n  }\n  masterGain.gain.setTargetAtTime(0.85, ac.currentTime, 0.02);\n  var rawIntAmp = 80.0;\n  var leaked = Math.min(0.16, rawIntAmp * lastAttAtInt);\n  intGain.gain.setTargetAtTime(leaked, ac.currentTime, 0.02);\n}\n\nfunction draw() {\n  var res = computeSpectrum();\n  ctx.clearRect(0, 0, W, H);\n  var padL = 56, padR = 24, padT = 18, padB = 30;\n  var pw = W - padL - padR, ph = H - padT - padB;\n  function xOf(f) { return padL + (f / 0.5) * pw; }\n  function yOf(db) { return padT + ((20 - db) / 220) * ph; }\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  for (var db = 20; db >= -200; db -= 40) {\n    var y = yOf(db);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(db + ' dB', padL - 6, y + 4);\n  }\n  for (var f = 0; f <= 0.501; f += 0.1) {\n    var x = xOf(f);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(f.toFixed(1), x, H - 10);\n  }\n\n  // -120 dB target line (1mV / 120V)\n  var y120 = yOf(-120);\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(padL, y120); ctx.lineTo(W - padR, y120); ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.textAlign = 'left';\n  ctx.fillText('-120 dB 目标线 (1mV vs 120V)', padL + 8, y120 - 5);\n\n  // Interference marker at f = 0.30\n  var xInt = xOf(0.30), yInt = yOf(Math.max(-200, res.intDb));\n  ctx.save();\n  ctx.setLineDash([3, 3]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(xInt, padT); ctx.lineTo(xInt, H - padB); ctx.stroke();\n  ctx.restore();\n\n  // Frequency response curve\n  ctx.strokeStyle = lab.values.selfConv ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i < res.freqs.length; i++) {\n    var x = xOf(res.freqs[i]);\n    var y = yOf(res.dbs[i]);\n    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Interference dot\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath(); ctx.arc(xInt, yInt, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('强干扰点 f=0.30 (' + res.intDb.toFixed(1) + ' dB)', xInt + 8, Math.min(H - padB - 8, Math.max(padT + 14, yInt + 4)));\n\n  if (!lab.values.doublePrec && lab.values.selfConv) {\n    ctx.fillStyle = 'rgba(248,250,252,0.8)';\n    ctx.fillText('↑ 单精度舍入噪声底 (~ -120 dB)', xOf(0.32), yOf(-118) + 14);\n  }\n\n  lab.setReadout('核长: ' + res.kernelLen + ' 点 | 精度: ' + (lab.values.doublePrec ? '双精度 64-bit' : '单精度 32-bit') + ' | 0.30 处衰减: ' + res.intDb.toFixed(1) + ' dB' + (res.intDb <= -120 ? ' (已达标 ✓)' : ' (未达 -120dB ✗)'));\n  updateAudio();\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "2. 单精度的隐藏瓶颈与 32,001 点的超级滚降",
      "paragraphs": [
        "在把性能推向 -100 dB 以上的极致时，你会撞上一堵看不见的墙：**单精度浮点数的舍入噪声（Round-off Noise）**。正如你在上一个实验中所见，32 位单精度浮点数只有约 24 位有效尾数，通带内信号运算时产生的微弱舍入误差，会随机泄漏到阻带里，形成一片徘徊在 **-100 dB 到 -120 dB** 之间的噪声平台。因此，想要真正发挥自卷积带来的 -148 dB 甚至更深的抑制能力，必须切换为**双精度（Double Precision）**计算，它能把精度极限再向外推进**一百万倍**。",
        "除了阻带深度，窗函数 Sinc 滤波器还能把**滚降陡峭度（Roll-off）**推向不可思议的境地。原书图 16-7b 展示了一个拥有 **32,001 个采样点** 的低通滤波器核，其过渡带宽度仅有采样率的 **0.000125**！这是什么概念？换算成模拟世界：它能将 DC 到 1000 Hz 的信号以小于 **0.02%** 的幅值波动完美放行，同时将 1001 Hz 以上的频率死死挡在 **0.02%** 残留以下——在模拟电子学里，这样的电路是物理不可能存在的。"
      ],
      "formula": {
        "expr": "BW ≈ 4 / M",
        "explain": "对黑曼窗（Blackman window）而言，过渡带宽度 BW（占采样率的比例）与核点数参数 M 成反比。当 M = 32,000（32,001 点）时，BW ≈ 4 / 32000 = 0.000125。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：核长 M 推向 32,001 点——超陡峭滚降与算力代价",
      "instruction": "向右拖动「核长尺度」滑块直到 32,001 点，打开「超级放大过渡带」开关，亲眼见证 fc = 0.2 处 0.000125 宽度的垂直砖墙滚降与运算量暴涨。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "核长尺度 (51 ~ 32,001 点)",
          "min": 1,
          "max": 10,
          "step": 0.2,
          "value": 3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "zoom",
          "label": "超级放大过渡带 (0.1995 ~ 0.2005)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showCost",
          "label": "显示标准卷积算力代价",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width, H = lab.height;\n\nfunction draw() {\n  var kScale = lab.values.k;\n  var M = 2 * Math.round(25 * Math.pow(640, (kScale - 1) / 9));\n  var half = M / 2;\n  var fc = 0.2;\n  var zoom = lab.values.zoom;\n  var fMin = zoom ? 0.1995 : 0.0;\n  var fMax = zoom ? 0.2005 : 0.5;\n\n  // Build symmetric half-kernel exact Blackman windowed-sinc\n  var hk = new Float64Array(half + 1);\n  hk[0] = 2 * Math.PI * fc;\n  var sum = hk[0];\n  for (var n = 1; n <= half; n++) {\n    var w = 0.42 + 0.5 * Math.cos(2 * Math.PI * n / M) + 0.08 * Math.cos(4 * Math.PI * n / M);\n    var v = (Math.sin(2 * Math.PI * fc * n) / n) * w;\n    hk[n] = v;\n    sum += 2 * v;\n  }\n  hk[0] /= sum;\n  for (var n = 1; n <= half; n++) {\n    hk[n] = (2 * hk[n]) / sum;\n  }\n\n  var nPts = 180;\n  var amps = new Float64Array(nPts);\n  for (var p = 0; p < nPts; p++) {\n    var f = fMin + (fMax - fMin) * p / (nPts - 1);\n    var omega = 2 * Math.PI * f;\n    var cw = Math.cos(omega), sw = Math.sin(omega);\n    var re = 1.0, im = 0.0;\n    var acc = hk[0];\n    for (var n = 1; n <= half; n++) {\n      var nr = re * cw - im * sw;\n      im = re * sw + im * cw;\n      re = nr;\n      acc += hk[n] * re;\n    }\n    amps[p] = acc;\n  }\n\n  ctx.clearRect(0, 0, W, H);\n  var padL = 52, padR = 24, padT = 20, padB = 32;\n  var pw = W - padL - padR, ph = H - padT - padB;\n  function xOf(f) { return padL + ((f - fMin) / (fMax - fMin)) * pw; }\n  function yOf(a) { return padT + ((1.2 - a) / 1.25) * ph; }\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  var yTicks = [0.0, 0.5, 1.0];\n  for (var t = 0; t < yTicks.length; t++) {\n    var y = yOf(yTicks[t]);\n    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(W - padR, y); ctx.stroke();\n    ctx.textAlign = 'right';\n    ctx.fillText(yTicks[t].toFixed(1), padL - 6, y + 4);\n  }\n  var xSteps = 4;\n  for (var s = 0; s <= xSteps; s++) {\n    var fv = fMin + (fMax - fMin) * s / xSteps;\n    var x = xOf(fv);\n    ctx.beginPath(); ctx.moveTo(x, padT); ctx.lineTo(x, H - padB); ctx.stroke();\n    ctx.textAlign = 'center';\n    ctx.fillText(zoom ? fv.toFixed(4) : fv.toFixed(2), x, H - 10);\n  }\n\n  // Transition band highlight\n  var bw = 4 / M;\n  var xLeft = Math.max(padL, xOf(fc - bw / 2));\n  var xRight = Math.min(W - padR, xOf(fc + bw / 2));\n  if (xRight > xLeft) {\n    ctx.fillStyle = 'rgba(245,158,11,0.14)';\n    ctx.fillRect(xLeft, padT, xRight - xLeft, ph);\n  }\n\n  // Cutoff fc = 0.2 line\n  var xFc = xOf(fc);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(xFc, padT); ctx.lineTo(xFc, H - padB); ctx.stroke();\n  ctx.restore();\n\n  // Amplitude curve\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var p = 0; p < nPts; p++) {\n    var f = fMin + (fMax - fMin) * p / (nPts - 1);\n    var x = xOf(f), y = yOf(amps[p]);\n    if (p === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n  }\n  ctx.stroke();\n\n  // Cost card\n  if (lab.values.showCost) {\n    var macsPer10k = ((M + 1) * 10000);\n    var macLabel = macsPer10k >= 1e8 ? (macsPer10k / 1e8).toFixed(2) + ' 亿次' : (macsPer10k / 1e4).toFixed(1) + ' 万次';\n    ctx.fillStyle = 'rgba(15,23,42,0.82)';\n    ctx.fillRect(W - padR - 235, padT + 6, 228, 58);\n    ctx.strokeStyle = 'rgba(56,189,248,0.45)';\n    ctx.strokeRect(W - padR - 235, padT + 6, 228, 58);\n    ctx.fillStyle = '#38bdf8';\n    ctx.textAlign = 'left';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('核长: ' + (M + 1) + ' 点 | BW ≈ ' + bw.toFixed(6), W - padR - 225, padT + 26);\n    ctx.fillStyle = (M > 4000) ? '#ec4899' : '#f8fafc';\n    ctx.fillText('1万点标准卷积: ' + macLabel + '乘加', W - padR - 225, padT + 48);\n  }\n\n  lab.setReadout('当前核长: ' + (M + 1) + ' 点 | 理论过渡带宽 BW ≈ ' + bw.toFixed(6) + ' (' + (zoom ? '局部放大 0.1995~0.2005' : '全频段 0~0.5') + ')');\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "3. 唯一短板与工程取舍：执行时间 vs “最优”滤波器",
      "paragraphs": [
        "既然窗函数 Sinc 滤波器性能如此逆天，它唯一的致命短板是什么？答案是**执行时间（Execution Time）**。如果在拥有数万个点的超长滤波器核上硬跑标准的时域卷积（每个输出采样点都要做几万次乘加），运算耗时将慢到无法接受。在工程实践中，遇到这种长核需求，应当改用第 18 章介绍的高速 **FFT 卷积（FFT Convolution）** 算法，或者改用第 19 章的**递归滤波器（Recursive Filters / IIR）**作为高速替代方案。",
        "最后，作者提出了一个发人深省的工程问题：**窗函数 Sinc 是分离频率的最优滤波器核吗？并不是。** 更高级的数学设计方法（如等波纹切比雪夫逼近）确实能算出略微更短的滤波器核来达到同样指标，从而略微加快一点运行速度。但请先停下来问问自己：既然窗函数 Sinc 已经能以极简的公式和代码，给你提供**任何你可能需要的高性能**，那么一头扎进深奥繁复的最优滤波器数学理论里，究竟能换回多少实际收益？在绝大多数工程场景下，投入产出比往往低得不划算。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "阻带不够深就做自卷积：将滤波器核与自身卷积（或让信号连过两级滤波），分贝级阻带衰减直接翻倍（-74 dB → -148 dB），代价是核长约翻倍、滚降略微变缓。",
        "超深阻带必须上双精度：单精度浮点的通带舍入噪声会在 -100 dB ~ -120 dB 处形成“噪声地板”，阻带指标要求高于 100 dB 时务必使用 `double`（64 位浮点）。",
        "算力瓶颈切勿硬刚标准卷积：当为了追求极窄过渡带而把核长拉到上千乃至上万点时，标准时域卷积的 O(N·M) 算力会直接爆表，必须切换至 FFT 卷积或评估递归滤波器。",
        "警惕过度设计：更复杂的最优滤波器算法通常只能缩短一点点核长，窗函数 Sinc 在“实现简单、绝无意外”与“极限性能”之间已经取得了极佳平衡。"
      ]
    }
  ]
});
