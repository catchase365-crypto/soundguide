window.__BOOK_REGISTER_SECTION__("sec_030", {
  "title": "信号与底层随机过程 (Signal vs. Underlying Process)",
  "intuition": "统计学描述“你手头采到的那段有限数据”，而概率论刻画“幕后生成数据的永恒规律”；有限采样带来的随机误差，迫使我们用 N-1 修正标准差，并警惕非平稳漂移对统计量的污染。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 统计学与概率论的分野：有限信号 vs. 幕后过程",
      "paragraphs": [
        "在数字信号处理中，**统计学 (Statistics)** 用于解读实际采集到的数值数据（即**已获取信号，acquired signal**），而**概率论 (Probability)** 则用于理解生成这些信号的**底层过程 (underlying process)**。两者虽然紧密相关，但分清它们是掌握诸多 DSP 算法的关键。",
        "想象一个经典的抛硬币实验：连续抛 1000 次硬币来构造一个 1000 点的信号，正面朝上记为 `1`，反面朝上记为 `0`。生成这个信号的**底层过程**由概率决定（50% 正面、50% 反面），因此过程的理论均值精确等于 `0.5`。然而，你实际采集到的这 1000 点信号，其均值几乎不可能恰好是 `0.5`——每次重复实验，0 和 1 的数量都会略有出入。这种真实数据中的随机不规则性，被称为**统计变差 (statistical variation)**、**统计涨落 (statistical fluctuation)** 或**统计噪声 (statistical noise)**。",
        "这就带来一个常见困惑：当文献中出现 **均值 (mean)** 和 **标准差 (standard deviation)** 这两个词时，作者指的究竟是“某个具体信号的统计量”，还是“底层过程的概率特征”？很遗憾，这两个术语在统计和概率中混用，**只能依靠上下文来判断**（不像下一节要讲的直方图 *histogram* 与概率质量函数 *probability mass function* 那样拥有各自独立的名称）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "2. 典型误差、大数定律与 N-1 修正的真正原因",
      "paragraphs": [
        "现在我们终于可以揭开标准差公式（Eq. 2-2）中为何要除以 `N - 1` 而不是 `N` 的谜底了。假设我们想测定某个信号生成过程的均值 `μ` 与标准差 `σ`。我们从该过程中采集 `N` 个样本，先算出这 `N` 个点的样本均值，以此作为底层过程均值 `μ` 的估计值。由于统计噪声的存在，样本均值与过程真实均值之间必然存在误差。",
        "对于随机信号，随着采样点数 `N` 增大，统计噪声会逐渐缩小。概率论中的里程碑——**大数强定律 (Strong Law of Large Numbers)** 保证了当 `N` 趋近于无穷大时，这个估计误差会收敛至零。",
        "问题出在下一步：当我们计算标准差时，本应使用底层过程的真实均值 `μ`，但我们并不知道 `μ`，只能拿带有统计噪声的“样本均值”来代替。因为样本均值本身已经顺应了这 `N` 个点的随机偏移，它到样本点的距离总比真实均值 `μ` 更近一点，这就导致算出来的标准差**系统性偏小**。为了补偿这个低估偏差，工程上把分母 `N` 替换为 `N - 1`。当 `N` 很大时两者差别微乎其微；当 `N` 很小时，除以 `N - 1` 能提供对**底层过程标准差**更准确的估计（而除以 `N` 得到的仅仅是手头这段**已获取信号本身**的标准差）。"
      ],
      "formula": {
        "expr": "Typical error = σ / N^(1/2)",
        "explain": "Equation 2-4：用有限个样本 N 估计底层过程均值时的典型误差。其中 σ 为底层过程的标准差，N 为样本总数。误差按样本数的平方根倒数衰减：想把误差减小到 1/10，需要采集 100 倍的样本。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：抛硬币大数定律与 N-1 修正可视化",
      "instruction": "拖动「样本点数 N」观察累积均值如何收敛进 σ/√N 典型误差漏斗；在 N 较小时切换「实验批次」，直观对比除以 N 与除以 N-1 对过程标准差 σ=0.5 的估计差异。",
      "controls": [
        {
          "type": "slider",
          "id": "nSamples",
          "label": "样本点数 N",
          "min": 3,
          "max": 500,
          "step": 1,
          "value": 40,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "trial",
          "label": "随机实验批次",
          "min": 1,
          "max": 30,
          "step": 1,
          "value": 1,
          "unit": " 号"
        },
        {
          "type": "toggle",
          "id": "showBand",
          "label": "显示 ±σ/√N 典型误差带",
          "value": true
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n\n  function seededRand(seed) {\n    var x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;\n    return x - Math.floor(x);\n  }\n\n  function getSamples(maxN, trial) {\n    var arr = [];\n    for (var i = 0; i < maxN; i++) {\n      var r = seededRand(trial * 1000 + i + 1);\n      arr.push(r < 0.5 ? 0 : 1);\n    }\n    return arr;\n  }\n\n  function draw() {\n    var N = lab.values.nSamples;\n    var trial = lab.values.trial;\n    var showBand = lab.values.showBand;\n\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    var samples = getSamples(N, trial);\n\n    var plotX = 48;\n    var plotY = 24;\n    var plotW = 420;\n    var plotH = 186;\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var g = 0; g <= 4; g++) {\n      var gy = plotY + (plotH * g) / 4;\n      ctx.beginPath();\n      ctx.moveTo(plotX, gy);\n      ctx.lineTo(plotX + plotW, gy);\n      ctx.stroke();\n    }\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText('1.0', plotX - 6, plotY + 4);\n    ctx.fillText('0.5', plotX - 6, plotY + plotH / 2 + 4);\n    ctx.fillText('0.0', plotX - 6, plotY + plotH + 4);\n    ctx.textAlign = 'center';\n    ctx.fillText('样本点数 k (1 -> ' + N + ')', plotX + plotW / 2, H - 8);\n\n    var midY = plotY + plotH / 2;\n    ctx.save();\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(plotX, midY);\n    ctx.lineTo(plotX + plotW, midY);\n    ctx.stroke();\n    ctx.restore();\n\n    if (showBand) {\n      ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';\n      ctx.beginPath();\n      for (var k = 1; k <= N; k++) {\n        var px = plotX + ((k - 1) / Math.max(1, N - 1)) * plotW;\n        var err = 0.5 / Math.sqrt(k);\n        var yTop = plotY + (1 - Math.min(1, 0.5 + err)) * plotH;\n        if (k === 1) ctx.moveTo(px, yTop);\n        else ctx.lineTo(px, yTop);\n      }\n      for (var k = N; k >= 1; k--) {\n        var px = plotX + ((k - 1) / Math.max(1, N - 1)) * plotW;\n        var err = 0.5 / Math.sqrt(k);\n        var yBot = plotY + (1 - Math.max(0, 0.5 - err)) * plotH;\n        ctx.lineTo(px, yBot);\n      }\n      ctx.closePath();\n      ctx.fill();\n\n      ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';\n      ctx.lineWidth = 1;\n      ctx.beginPath();\n      for (var k = 1; k <= N; k++) {\n        var px = plotX + ((k - 1) / Math.max(1, N - 1)) * plotW;\n        var err = 0.5 / Math.sqrt(k);\n        var yTop = plotY + (1 - Math.min(1, 0.5 + err)) * plotH;\n        if (k === 1) ctx.moveTo(px, yTop);\n        else ctx.lineTo(px, yTop);\n      }\n      ctx.stroke();\n\n      ctx.beginPath();\n      for (var k = 1; k <= N; k++) {\n        var px = plotX + ((k - 1) / Math.max(1, N - 1)) * plotW;\n        var err = 0.5 / Math.sqrt(k);\n        var yBot = plotY + (1 - Math.max(0, 0.5 - err)) * plotH;\n        if (k === 1) ctx.moveTo(px, yBot);\n        else ctx.lineTo(px, yBot);\n      }\n      ctx.stroke();\n    }\n\n    var sum = 0;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      sum += samples[i];\n      var runMean = sum / (i + 1);\n      var px = plotX + (i / Math.max(1, N - 1)) * plotW;\n      var py = plotY + (1 - runMean) * plotH;\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    var finalMean = sum / N;\n    var sqDev = 0;\n    for (var i = 0; i < N; i++) {\n      var d = samples[i] - finalMean;\n      sqDev += d * d;\n    }\n    var sdN = Math.sqrt(sqDev / N);\n    var sdN1 = Math.sqrt(sqDev / (N - 1));\n    var typErr = 0.5 / Math.sqrt(N);\n\n    ctx.textAlign = 'left';\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('--- 过程真均值 μ = 0.500', plotX + 8, plotY + 14);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('— 样本累积均值: ' + finalMean.toFixed(3), plotX + 8, plotY + 30);\n\n    var rx = 495;\n    var rw = 205;\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.strokeRect(rx, plotY, rw, plotH);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('标准差估计对比 (真值 σ=0.5)', rx + rw / 2, plotY + 18);\n\n    var bars = [\n      { label: '过程真值 σ', val: 0.5, color: '#10b981' },\n      { label: '除以 N-1', val: sdN1, color: '#38bdf8' },\n      { label: '除以 N', val: sdN, color: '#ec4899' }\n    ];\n\n    var barBaseY = plotY + plotH - 28;\n    var maxBarH = 108;\n    for (var b = 0; b < bars.length; b++) {\n      var bx = rx + 22 + b * 60;\n      var bw = 38;\n      var bh = Math.min(maxBarH * 1.25, (bars[b].val / 0.65) * maxBarH);\n      ctx.fillStyle = bars[b].color;\n      ctx.fillRect(bx, barBaseY - bh, bw, bh);\n\n      ctx.fillStyle = '#f8fafc';\n      ctx.font = '11px monospace';\n      ctx.fillText(bars[b].val.toFixed(3), bx + bw / 2, barBaseY - bh - 6);\n\n      ctx.fillStyle = '#cbd5e1';\n      ctx.font = '10px sans-serif';\n      ctx.fillText(bars[b].label, bx + bw / 2, barBaseY + 15);\n    }\n\n    lab.setReadout('N=' + N + ' | 样本均值=' + finalMean.toFixed(3) + ' (偏差 ' + (finalMean - 0.5 >= 0 ? '+' : '') + (finalMean - 0.5).toFixed(3) + ') | 典型误差 σ/√N=±' + typErr.toFixed(3) + ' | SD(÷N)=' + sdN.toFixed(3) + ' vs SD(÷N-1)=' + sdN1.toFixed(3));\n  }\n\n  lab.onUpdate(draw);\n})();"
    },
    {
      "type": "concept",
      "heading": "3. 平稳过程 vs. 非平稳过程：隐藏在趋势中的计算陷阱",
      "paragraphs": [
        "在前面的讨论中，我们默认底层过程的统计特性是恒定不变的，这种过程称为**平稳过程 (stationary process)**，此时信号中的所有起伏都纯粹源于统计噪声。但在现实世界（例如原书 Fig. 2-3）中，信号背后的过程常常会随时间发生改变——均值在漂移，或者噪声强度在起伏。这种底层特性随时间变化的过程称为**非平稳过程 (nonstationary process)**。",
        "非平稳信号会带来一个极其隐蔽的工程陷阱：以原书 Fig. 2-3b 为例，信号在任意短时间窗口内的真实标准差恒定为 `1.0`，但它的均值却从 `0` 缓慢爬升到了 `2`。如果我们不加区分地对整段信号直接套用标准差公式，缓慢变化的均值就会严重干扰方差计算，算出来的全局标准差会膨胀到 `1.16`！",
        "如何解决这个难题？工程上最通用的分析技巧就是**分段计算 (short-segment analysis)**：把长信号切分成足够短的片段，在每个短片段内信号近似平稳，分别计算各段的均值与标准差；如果最终仍需要一个单一数值来衡量噪声水平，只需将各个短片段的标准差求平均即可消除漂移误差。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验二：复现 Fig. 2-3 非平稳陷阱与分段消除实验室",
      "instruction": "保持标准差波动为 0、均值漂移为 2.0（对应原书 Fig. 2-3b），观察「分段数量=1」时全局标准差如何被污染到 1.16；逐步增加分段数，观察平均局部标准差如何恢复至真实噪声水平 1.00，并可开启声音监听均值漂移（音高）与标准差起伏（噪声音量）。",
      "controls": [
        {
          "type": "slider",
          "id": "drift",
          "label": "均值漂移幅度 (0→Δ)",
          "min": 0,
          "max": 3,
          "step": 0.1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sdMod",
          "label": "标准差调制幅度",
          "min": 0,
          "max": 1.5,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "segments",
          "label": "分段统计数量",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 1,
          "unit": " 段"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 监听非平稳动态",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var N = 512;\n\n  var baseNoise = [];\n  function seeded(s) {\n    var x = Math.sin(s * 91.3458 + 14.23) * 47453.5453;\n    return x - Math.floor(x);\n  }\n  var rawSum = 0;\n  for (var i = 0; i < N; i++) {\n    var u1 = Math.max(1e-6, seeded(i * 2 + 1));\n    var u2 = seeded(i * 2 + 2);\n    var z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);\n    baseNoise.push(z);\n    rawSum += z;\n  }\n  var rawMean = rawSum / N;\n  var rawSq = 0;\n  for (var i = 0; i < N; i++) {\n    baseNoise[i] -= rawMean;\n    rawSq += baseNoise[i] * baseNoise[i];\n  }\n  var rawSd = Math.sqrt(rawSq / (N - 1));\n  for (var i = 0; i < N; i++) {\n    baseNoise[i] /= rawSd;\n  }\n\n  var audioState = {\n    ac: null,\n    master: null,\n    noiseGain: null,\n    osc: null,\n    active: false,\n    phase: 0\n  };\n\n  function ensureAudio() {\n    if (audioState.ac) return audioState.ac;\n    var ac = lab.getAudioContext();\n    if (!ac) return null;\n    var bufLen = ac.sampleRate * 2;\n    var buf = ac.createBuffer(1, bufLen, ac.sampleRate);\n    var ch = buf.getChannelData(0);\n    for (var i = 0; i < bufLen; i++) ch[i] = Math.random() * 2 - 1;\n\n    var noiseSrc = ac.createBufferSource();\n    noiseSrc.buffer = buf;\n    noiseSrc.loop = true;\n\n    var noiseGain = ac.createGain();\n    noiseGain.gain.value = 0.05;\n\n    var osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = 200;\n\n    var oscGain = ac.createGain();\n    oscGain.gain.value = 0.035;\n\n    var master = ac.createGain();\n    master.gain.value = 0;\n\n    noiseSrc.connect(noiseGain);\n    noiseGain.connect(master);\n    osc.connect(oscGain);\n    oscGain.connect(master);\n    master.connect(ac.destination);\n\n    noiseSrc.start();\n    osc.start();\n\n    audioState.ac = ac;\n    audioState.master = master;\n    audioState.noiseGain = noiseGain;\n    audioState.osc = osc;\n    return ac;\n  }\n\n  function computeSignal() {\n    var drift = lab.values.drift;\n    var sdMod = lab.values.sdMod;\n    var sig = [];\n    for (var i = 0; i < N; i++) {\n      var mu = drift * (i / (N - 1));\n      var s = Math.max(0.15, 1.0 + 0.6 * sdMod * Math.cos((i / (N - 1)) * Math.PI * 2.5));\n      sig.push(mu + s * baseNoise[i]);\n    }\n    return sig;\n  }\n\n  function calcStats(arr, start, end) {\n    var len = end - start;\n    var sum = 0;\n    for (var i = start; i < end; i++) sum += arr[i];\n    var m = sum / len;\n    var sq = 0;\n    for (var i = start; i < end; i++) {\n      var d = arr[i] - m;\n      sq += d * d;\n    }\n    return { mean: m, sd: Math.sqrt(sq / Math.max(1, len - 1)) };\n  }\n\n  function draw(playIdx) {\n    var drift = lab.values.drift;\n    var sdMod = lab.values.sdMod;\n    var segs = lab.values.segments;\n    var sig = computeSignal();\n\n    ctx.clearRect(0, 0, W, H);\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(0, 0, W, H);\n\n    var plotX = 48;\n    var plotY = 20;\n    var plotW = 648;\n    var plotH = 192;\n    var yMin = -4;\n    var yMax = 7;\n\n    function toY(val) {\n      return plotY + ((yMax - val) / (yMax - yMin)) * plotH;\n    }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    var ticks = [-4, -2, 0, 2, 4, 6];\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'right';\n    for (var t = 0; t < ticks.length; t++) {\n      var ty = toY(ticks[t]);\n      ctx.beginPath();\n      ctx.moveTo(plotX, ty);\n      ctx.lineTo(plotX + plotW, ty);\n      ctx.stroke();\n      ctx.fillText(ticks[t].toString(), plotX - 6, ty + 3);\n    }\n\n    var zeroY = toY(0);\n    ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n    ctx.beginPath();\n    ctx.moveTo(plotX, zeroY);\n    ctx.lineTo(plotX + plotW, zeroY);\n    ctx.stroke();\n\n    // Waveform\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (var i = 0; i < N; i++) {\n      var px = plotX + (i / (N - 1)) * plotW;\n      var py = toY(sig[i]);\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    // Global stats\n    var globalStats = calcStats(sig, 0, N);\n\n    // Segment stats\n    var segMeanSumSD = 0;\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2.2;\n    for (var s = 0; s < segs; s++) {\n      var s0 = Math.floor((s * N) / segs);\n      var s1 = Math.floor(((s + 1) * N) / segs);\n      var st = calcStats(sig, s0, s1);\n      segMeanSumSD += st.sd;\n\n      var x0 = plotX + (s0 / (N - 1)) * plotW;\n      var x1 = plotX + ((s1 - 1) / (N - 1)) * plotW;\n      var my = toY(st.mean);\n\n      ctx.beginPath();\n      ctx.moveTo(x0, my);\n      ctx.lineTo(x1, my);\n      ctx.stroke();\n\n      if (s > 0) {\n        ctx.save();\n        ctx.setLineDash([4, 4]);\n        ctx.strokeStyle = 'rgba(236, 72, 153, 0.55)';\n        ctx.lineWidth = 1;\n        ctx.beginPath();\n        ctx.moveTo(x0, plotY);\n        ctx.lineTo(x0, plotY + plotH);\n        ctx.stroke();\n        ctx.restore();\n      }\n    }\n    var avgSegSD = segMeanSumSD / segs;\n\n    if (playIdx >= 0 && playIdx < N) {\n      var cx = plotX + (playIdx / (N - 1)) * plotW;\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(cx, plotY);\n      ctx.lineTo(cx, plotY + plotH);\n      ctx.stroke();\n    }\n\n    ctx.textAlign = 'left';\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('— 采集信号 (512点)', plotX + 10, plotY + 14);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('— 分段估计局部均值 (当前 ' + segs + ' 段)', plotX + 145, plotY + 14);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText('样本序号 (0 -> 511)', plotX + plotW / 2 - 50, H - 5);\n\n    lab.setReadout('全局SD(未分段)=' + globalStats.sd.toFixed(2) + ' | 分段(' + segs + '段)平均局部SD=' + avgSegSD.toFixed(2) + ' | 局部漂移范围: 0.0 -> ' + drift.toFixed(1));\n  }\n\n  lab.onUpdate(function() {\n    var play = lab.values.play;\n    if (play) {\n      var ac = ensureAudio();\n      if (ac) {\n        if (ac.state === 'suspended') ac.resume();\n        audioState.master.gain.setTargetAtTime(0.85, ac.currentTime, 0.03);\n        audioState.active = true;\n      }\n    } else {\n      audioState.active = false;\n      if (audioState.master && audioState.ac) {\n        audioState.master.gain.setTargetAtTime(0, audioState.ac.currentTime, 0.03);\n      }\n    }\n    draw(audioState.active ? Math.floor(audioState.phase * (N - 1)) : -1);\n  });\n\n  lab.onLoop(function(dt) {\n    if (!audioState.active || !audioState.ac) return;\n    audioState.phase = (audioState.phase + dt * 0.25) % 1;\n    var idx = Math.floor(audioState.phase * (N - 1));\n    var drift = lab.values.drift;\n    var sdMod = lab.values.sdMod;\n    var mu = drift * (idx / (N - 1));\n    var s = Math.max(0.15, 1.0 + 0.6 * sdMod * Math.cos((idx / (N - 1)) * Math.PI * 2.5));\n    audioState.osc.frequency.setTargetAtTime(200 + mu * 120, audioState.ac.currentTime, 0.02);\n    audioState.noiseGain.gain.setTargetAtTime(0.05 * s, audioState.ac.currentTime, 0.02);\n    draw(idx);\n  });\n})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【分清 ÷N 与 ÷(N-1)】：在写代码求标准差时，如果你只关心手头这段有限数据的离散程度，分母用 `N`；如果你想通过有限样本去反推物理/随机过程本身的真实波动 `σ`，必须用 `N - 1` 来抵消未知真均值带来的低估偏差。",
        "【敬畏 √N 律】：要让均值估计的随机误差减半，采样点数 `N` 必须翻 4 倍；小样本下千万不要过度解读小数点后几位的统计波动。",
        "【先验平稳性，再算标准差】：对包含直流漂移、基线偏移或缓变趋势的非平稳信号直接求全局标准差，会把趋势能量误算成噪声能量（例如 1.0 虚高成 1.16）；工程上务必先做去趋势或分段短时统计。"
      ]
    }
  ]
});
