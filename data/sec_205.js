window.__BOOK_REGISTER_SECTION__("sec_205", {
  "title": "DSP 到底有多快？从时钟周期、吞吐率到多核并行 (How Fast are DSPs?)",
  "intuition": "别被芯片厂商的 MIPS/MFLOPS 跑分忽悠，评估 DSP 速度的唯一硬道理是：用「时钟主频 ÷ 单样本所需时钟周期数」算出真实吞吐率，再与音视频的采样需求对表。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 跑分陷阱：为什么 MIPS 和 MFLOPS 常常骗人？",
      "paragraphs": [
        "使用 DSP 而非传统微处理器的核心原因只有一个——**速度**：即把采样数据搬入芯片、完成数学运算并输出结果的能力。为了量化速度，厂商常在规格书里标注 **基准测试（Benchmarks）** 跑分：定点芯片常用 `MIPS`（每秒百万条整数指令），浮点芯片常用 `MFLOPS`（每秒百万次浮点运算）。",
        "但正如英国首相本杰明·迪斯雷利的名言：「世界上有三种谎言：谎言、该死的谎言和统计学。」如果他活在现代半导体行业，一定会把 **基准跑分（Benchmarks）** 列为第四种。跑分试图用单一数字分出高下，但不同架构各有所长——就像问「凯迪拉克和法拉利哪辆更好」一样，完全取决于你的用途。电子行业还有句老话：**「规格书撰写者从一颗芯片里榨出的性能，永远是工程师实际能跑出来的两倍。」**",
        "因此，最可靠的做法不是看宣传跑分，而是**针对你要执行的特定算法，查出它精确消耗的时钟周期数（Clock Cycles）**。由于处理器速度大约每三年翻一倍，具体数字很快会过时，但下面这套**「周期计数评估法」**永远有效。"
      ],
      "formula": {
        "expr": "Throughput (samples/sec) = f_clk / Cycles_per_sample",
        "explain": "Throughput 为算法实时数据吞吐率（每秒处理样本数）；f_clk 为 DSP 时钟主频（例如 SHARC 为 40 MHz）；Cycles_per_sample 为处理单个样本所需的平均时钟周期数。"
      }
    },
    {
      "type": "concept",
      "heading": "2. SHARC 实测账本：四大核心算法的速度与「60 阶分水岭」",
      "paragraphs": [
        "以本书主角 Analog Devices 的 **ADSP-2106x SHARC**（40 MHz 主频）为例，它能在**单个时钟周期内完成一次乘加（MAC）运算**，因此执行时间非常透明：",
        "• **FIR 滤波器（标准卷积）**：通常使用 `25 ~ 400` 个系数，即每个样本约需 `25 ~ 400` 个时钟周期（大循环下首尾开销可忽略）。在 40 MHz 下，吞吐率为 `100k ~ 1.6M` 样本/秒。\n• **IIR 滤波器（递归滤波）**：通常仅需 `5 ~ 17` 个系数，因循环很短需加上约 `3` 周期的循环开销，共需 `8 ~ 20` 周期/样本。在 40 MHz 下，实测吞吐率为 `1.8M ~ 3.1M` 样本/秒。\n• **快速傅里叶变换（FFT）**：厂商提供的汇编优化库极快。1024 点复数 FFT 仅需 `18,221` 周期（约 0.46 ms，合 `17.8` 周期/样本）；256 点约 `14.2` 周期/样本，4096 点约 `21.4` 周期/样本；实数 FFT 还能再快约 40%。所有 FFT 总体落在 `10 ~ 22` 周期/样本，吞吐率高达 `1.8M ~ 3.3M` 样本/秒。",
        "• **FFT 卷积（一维与二维）**：利用「512 点输入补 512 个零 → 1024 点 FFT → 频域相乘 → 1024 点逆 FFT → 重叠相加」来加速长 FIR 滤波。每 512 样本开销约等于单次 512 点实数 FFT（12 周期/样本）的 5 倍，即约 `60` 周期/样本（40 MHz 下约 `660k` 样本/秒）。这就产生了一个黄金分水岭：**滤波器少于 60 阶时直接卷积更快；超过 60 阶时 FFT 卷积胜出**，且其耗时仅随阶数的对数缓慢增长（4096 阶卷积核只比 512 阶慢约 30%）。若推广到 **2D 图像处理**（将 800×600 图像补零到 1024×1024 做行/列双向 FFT 卷积），则约需 `150` 周期/像素，吞吐率约 `260k` 样本/秒。",
        "综合图 28-11 可得一条极其实用的经验法则：**几乎所有常见 DSP 算法每样本都消耗 4 ~ 400 条指令（周期）**。因此一颗 40 MHz SHARC 的处理能力就清晰地锚定在 **100k ~ 10M 样本/秒** 区间内。"
      ],
      "formula": {
        "expr": "N_taps < 60 => 标准 FIR 卷积胜出;  N_taps > 60 => FFT 卷积胜出 (复杂度 O(log N))",
        "explain": "N_taps 为 FIR 滤波器抽头（系数）个数。60 阶是时域直接卷积与频域 FFT 卷积的速度交叉点。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：SHARC 吞吐率雷达图（复刻 Fig 28-11）与 60 阶交叉点",
      "instruction": "拖动「FIR 阶数」滑块观察左侧对数吞吐率条与右侧交叉曲线的变化；提高「DSP 主频」查看算力演进对音视频需求的覆盖能力。",
      "controls": [
        {
          "type": "slider",
          "id": "clockMHz",
          "label": "DSP 时钟主频",
          "min": 20,
          "max": 200,
          "step": 10,
          "value": 40,
          "unit": " MHz"
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "FIR 滤波器阶数",
          "min": 10,
          "max": 400,
          "step": 5,
          "value": 60,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "showDemand",
          "label": "叠加显示音视频吞吐率需求线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  var clkMHz = lab.values.clockMHz;\n  var taps = lab.values.taps;\n  var showDemand = lab.values.showDemand;\n  var scale = clkMHz / 40;\n\n  var lx = 48, lw = 310, ty = 22, bh = 188;\n  function yLog(val) {\n    var lg = Math.log10(Math.max(1000, Math.min(1e9, val)));\n    return ty + bh - ((lg - 3) / 6) * bh;\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '10px monospace';\n  ctx.fillStyle = '#94a3b8';\n  var ticks = [1e3, 1e4, 1e5, 1e6, 1e7, 1e8, 1e9];\n  var labels = ['1K', '10K', '100K', '1M', '10M', '100M', '1G'];\n  for (var i = 0; i < ticks.length; i++) {\n    var yy = yLog(ticks[i]);\n    ctx.beginPath(); ctx.moveTo(lx, yy); ctx.lineTo(lx + lw, yy); ctx.stroke();\n    ctx.fillText(labels[i], 8, yy + 3);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(lx, ty, lw, bh);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('各算法吞吐率 (samples/s @ ' + clkMHz + ' MHz)', lx, 14);\n\n  var firRate = (clkMHz * 1e6) / taps;\n  var firMin = 100e3 * scale, firMax = 1.6e6 * scale;\n  var iirMin = 1.8e6 * scale, iirMax = 3.1e6 * scale;\n  var fftMin = 1.8e6 * scale, fftMax = 3.3e6 * scale;\n  var conv1D = 660e3 * scale;\n  var conv2D = 260e3 * scale;\n\n  var bars = [\n    { name: 'FIR', min: firMin, max: firMax, cur: firRate, color: '#38bdf8' },\n    { name: 'IIR', min: iirMin, max: iirMax, color: '#10b981' },\n    { name: 'FFT', min: fftMin, max: fftMax, color: '#a855f7' },\n    { name: '1D Conv', min: conv1D * 0.85, max: conv1D * 1.15, cur: conv1D, color: '#f59e0b' },\n    { name: '2D Conv', min: conv2D * 0.85, max: conv2D * 1.15, cur: conv2D, color: '#ec4899' }\n  ];\n\n  for (var b = 0; b < bars.length; b++) {\n    var item = bars[b];\n    var bx = lx + 18 + b * 58;\n    var yTop = yLog(item.max);\n    var yBot = yLog(item.min);\n    ctx.fillStyle = item.color;\n    ctx.globalAlpha = 0.78;\n    ctx.fillRect(bx, yTop, 28, Math.max(4, yBot - yTop));\n    ctx.globalAlpha = 1;\n    ctx.strokeStyle = '#f8fafc';\n    ctx.strokeRect(bx, yTop, 28, Math.max(4, yBot - yTop));\n    if (item.cur) {\n      var yc = yLog(item.cur);\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillRect(bx - 3, yc - 2, 34, 4);\n    }\n    ctx.fillStyle = '#e2e8f0';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(item.name, bx - 2, ty + bh + 14);\n  }\n\n  if (showDemand) {\n    var demands = [\n      { name: 'Voice (8k)', val: 8000, col: '#94a3b8' },\n      { name: 'Hi-Fi (88.2k)', val: 88200, col: '#10b981' },\n      { name: 'VideoPhone (9.1M)', val: 9.1e6, col: '#f59e0b' },\n      { name: 'HDTV (186M)', val: 186e6, col: '#ec4899' }\n    ];\n    ctx.setLineDash([4, 3]);\n    for (var d = 0; d < demands.length; d++) {\n      var dy = yLog(demands[d].val);\n      ctx.strokeStyle = demands[d].col;\n      ctx.beginPath(); ctx.moveTo(lx, dy); ctx.lineTo(lx + lw, dy); ctx.stroke();\n      ctx.fillStyle = demands[d].col;\n      ctx.font = '9px sans-serif';\n      ctx.fillText(demands[d].name, lx + lw - 92, dy - 3);\n    }\n    ctx.setLineDash([]);\n  }\n\n  var rx = 405, rw = 290, ry = 22, rh = 188;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var g = 0; g <= 4; g++) {\n    var gy = ry + (g / 4) * rh;\n    ctx.beginPath(); ctx.moveTo(rx, gy); ctx.lineTo(rx + rw, gy); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.fillText(String(400 - g * 100), rx - 26, gy + 3);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('时钟周期对比：FIR vs FFT 卷积 (60阶分水岭)', rx, 14);\n\n  function mapX(n) { return rx + (n / 400) * rw; }\n  function mapY(c) { return ry + rh - (c / 400) * rh; }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(mapX(10), mapY(10)); ctx.lineTo(mapX(400), mapY(400)); ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(mapX(10), mapY(60)); ctx.lineTo(mapX(400), mapY(60)); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.beginPath(); ctx.arc(mapX(60), mapY(60), 4, 0, Math.PI * 2); ctx.fill();\n  ctx.font = '10px sans-serif';\n  ctx.fillText('交叉点 (60阶, 60周期)', mapX(68), mapY(60) - 6);\n\n  var cx = mapX(taps);\n  ctx.strokeStyle = 'rgba(248,250,252,0.55)';\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(cx, ry); ctx.lineTo(cx, ry + rh); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(cx, mapY(taps), 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(cx, mapY(60), 4.5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('10', rx, ry + rh + 14);\n  ctx.fillText('200', rx + rw * 0.48, ry + rh + 14);\n  ctx.fillText('400 阶', rx + rw - 28, ry + rh + 14);\n\n  var winner = taps < 60 ? '标准 FIR 更快' : (taps > 60 ? 'FFT 卷积更快' : '两者速度持平');\n  var fmtFir = firRate >= 1e6 ? (firRate / 1e6).toFixed(2) + 'M/s' : Math.round(firRate / 1e3) + 'k/s';\n  var fmtConv = conv1D >= 1e6 ? (conv1D / 1e6).toFixed(2) + 'M/s' : Math.round(conv1D / 1e3) + 'k/s';\n  lab.setReadout('当前 ' + taps + ' 阶 FIR: ' + fmtFir + ' (' + taps + ' 周期) | 1D FFT 卷积: ' + fmtConv + ' (60 周期) → 胜出方: ' + winner);\n});"
    },
    {
      "type": "concept",
      "heading": "3. 音频与视频的千倍鸿沟：单核不够，多核来凑",
      "paragraphs": [
        "算清了 DSP **能跑多快**，还要看应用**需要多快**。在音频领域：电话级语音只需保留 `100 Hz ~ 3.2 kHz` 频段，采样率仅约 **8k 样本/秒**；高保真（Hi-Fi）音乐需覆盖人耳完整的 `20 Hz ~ 20 kHz` 听觉范围，左右双声道均按 `44.1 kHz` 采样，总数据率为 **88.2k 样本/秒**。对比图 28-11，单颗 40 MHz SHARC 不仅能轻松跑满 Hi-Fi 音频处理，甚至能同时处理**几十路**语音通话。",
        "但视频信号完全是另一个量级——它需要约**音频一千倍**的数据率！即使是低画质的 CIF 可视电话标准（`352×288` 像素 × `3` 色彩通道 × `30` 帧/秒），数据率也高达 **9.1M 样本/秒**；而高画质 HDTV 高清电视（`1920×1080` × `3` 色 × `30` 帧/秒）更突破了 **186M 样本/秒**。雷达、声纳、导弹制导等军工任务同样面临如此恐怖的吞吐需求，早已超出单颗 SHARC 的能力极限。",
        "为攻克高算力任务，必须将多颗 DSP 联手组成 **多处理（Multiprocessing / Parallel Processing）** 系统。SHARC 在芯片内部就集成了总线仲裁逻辑，无需外部胶合逻辑即可并联外部总线，还自带 4-bit 并行 **链路端口（Link Ports）**。常见三种拓扑（图 28-12、28-13）：\n1. **数据流式（Data flow）**：用链路端口点对点串联，像流水线一样将算法拆成多步依次接力；\n2. **集群式（Cluster）**：多颗处理器通过外部并行总线共享同一块全局 **大容量内存（BULK MEMORY）**；\n3. **二维/三维网格（2D/3D Mesh）**：将大量处理器纵横互联成阵列，是雷达成像等海量并行任务的最高效架构。",
        "更妙的是，SHARC 采用了 **统一地址空间（Unified Address Space）**——将 32 位地址总线可寻址的 `4 Gigaword` 空间划分给协同工作的各颗处理器。程序员只需像读写本地内存一样读写对应地址，内部硬件便会自动以高达 **240 Mbytes/sec（40 MHz 下）** 的速率完成核间数据搬运。"
      ],
      "formula": {
        "expr": "Video_Rate = Width × Height × Colors × FPS",
        "explain": "视频总采样率等于水平像素 × 垂直像素 × 每像素颜色数（通常为 RGB 3 色）× 每秒帧数。例如 HDTV: 1920×1080×3×30 ≈ 186.6M 样本/秒。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：音质带宽听觉对比 & 多核 SHARC 并行算力实验室",
      "instruction": "点击播放测试音并切换「Hi-Fi 高保真 vs 电话语音」开关，亲耳对比 3.2 kHz 窄带语音与 20 kHz 全频音乐的听感差异，同时拖动「SHARC 核心数」观察多核集群对视频流的支持能力。",
      "controls": [
        {
          "type": "toggle",
          "id": "hifi",
          "label": "音质模式：关闭=电话语音 (8k) / 开启=Hi-Fi (88.2k)",
          "value": false
        },
        {
          "type": "slider",
          "id": "cycles",
          "label": "单样本算法复杂度",
          "min": 4,
          "max": 400,
          "step": 4,
          "value": 60,
          "unit": " cycles"
        },
        {
          "type": "slider",
          "id": "cores",
          "label": "并行 SHARC 数量",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 1,
          "unit": " 颗"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放带宽对比测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "function syncAudio() {\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (!lab._aud) {\n    lab._aud = { active: false, oscs: [], hp: null, lp: null, master: null };\n  }\n  var a = lab._aud;\n  var wantPlay = !!lab.values.play;\n  var isHifi = !!lab.values.hifi;\n\n  if (wantPlay && !a.active) {\n    if (ac.state === 'suspended') { ac.resume(); }\n    var hp = ac.createBiquadFilter();\n    hp.type = 'highpass';\n    var lp = ac.createBiquadFilter();\n    lp.type = 'lowpass';\n    var master = ac.createGain();\n    master.gain.value = 0.14;\n    hp.connect(lp);\n    lp.connect(master);\n    master.connect(ac.destination);\n\n    var freqs = [130.81, 261.63, 659.25, 3951.07, 7902.13];\n    var gains = [0.35, 0.30, 0.22, 0.14, 0.10];\n    var oscs = [];\n    for (var i = 0; i < freqs.length; i++) {\n      var osc = ac.createOscillator();\n      osc.type = i < 2 ? 'triangle' : 'sine';\n      osc.frequency.value = freqs[i];\n      var g = ac.createGain();\n      g.gain.value = gains[i];\n      osc.connect(g);\n      g.connect(hp);\n      osc.start();\n      oscs.push(osc);\n    }\n    a.hp = hp; a.lp = lp; a.master = master; a.oscs = oscs; a.active = true;\n  }\n\n  if (a.active) {\n    a.hp.frequency.setTargetAtTime(isHifi ? 20 : 280, ac.currentTime, 0.03);\n    a.lp.frequency.setTargetAtTime(isHifi ? 18000 : 3200, ac.currentTime, 0.03);\n  }\n\n  if (!wantPlay && a.active) {\n    for (var j = 0; j < a.oscs.length; j++) {\n      try { a.oscs[j].stop(); a.oscs[j].disconnect(); } catch (e) {}\n    }\n    try { a.master.disconnect(); } catch (e) {}\n    a.oscs = []; a.active = false;\n  }\n}\n\nfunction drawScene(tSec) {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  var isHifi = !!lab.values.hifi;\n  var cycles = lab.values.cycles;\n  var cores = lab.values.cores;\n  var playing = !!lab.values.play;\n  var totalRate = cores * (40e6 / cycles);\n\n  var sx = 24, sw = 315, sy = 26, sh = 185;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var gx = 0; gx <= 3; gx++) {\n    var xx = sx + (gx / 3) * sw;\n    ctx.beginPath(); ctx.moveTo(xx, sy); ctx.lineTo(xx, sy + sh); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(sx, sy, sw, sh);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(isHifi ? 'Hi-Fi 全频带宽 (20Hz-20kHz, 88.2k/s)' : '电话语音窄带 (100Hz-3.2kHz, 8k/s)', sx, 16);\n\n  function xFreq(f) {\n    return sx + ((Math.log10(f) - Math.log10(20)) / 3) * sw;\n  }\n  var xLow = xFreq(isHifi ? 20 : 100);\n  var xHigh = xFreq(isHifi ? 20000 : 3200);\n  ctx.fillStyle = isHifi ? 'rgba(16,185,129,0.16)' : 'rgba(245,158,11,0.18)';\n  ctx.fillRect(xLow, sy, xHigh - xLow, sh);\n  ctx.strokeStyle = isHifi ? '#10b981' : '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(xLow, sy, xHigh - xLow, sh);\n\n  var harmFreqs = [131, 262, 659, 1320, 2400, 3951, 7902, 14000];\n  for (var k = 0; k < harmFreqs.length; k++) {\n    var f = harmFreqs[k];\n    var fx = xFreq(f);\n    var inBand = isHifi ? (f >= 20 && f <= 20000) : (f >= 100 && f <= 3200);\n    var pulse = playing ? (0.82 + 0.18 * Math.sin(tSec * 5 + k)) : 1;\n    var barH = (inBand ? (135 - k * 9) : 22) * pulse;\n    ctx.fillStyle = inBand ? (isHifi ? '#10b981' : '#f59e0b') : 'rgba(148,163,184,0.3)';\n    ctx.fillRect(fx - 6, sy + sh - barH, 12, barH);\n  }\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('20Hz', sx, sy + sh + 14);\n  ctx.fillText('200Hz', xFreq(200) - 12, sy + sh + 14);\n  ctx.fillText('3.2k', xFreq(3200) - 10, sy + sh + 14);\n  ctx.fillText('20kHz', sx + sw - 28, sy + sh + 14);\n\n  var rx = 372, rw = 324, ry = 26, rh = 185;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(rx, ry, rw, rh);\n  var topoName = cores === 1 ? '单核 SHARC' : (cores <= 4 ? '数据流 / 集群并行' : '2D Mesh 阵列互联');\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('多核集群 (' + cores + ' 颗 @ 40MHz) - ' + topoName, rx, 16);\n\n  var cols = Math.min(4, cores);\n  var rows = Math.ceil(cores / 4);\n  var boxW = 34, boxH = 16, gapX = 12, gapY = 8;\n  var startX = rx + 18, startY = ry + 12;\n  for (var c = 0; c < cores; c++) {\n    var col = c % 4;\n    var row = Math.floor(c / 4);\n    var cx = startX + col * (boxW + gapX);\n    var cy = startY + row * (boxH + gapY);\n    ctx.fillStyle = 'rgba(56,189,248,0.22)';\n    ctx.fillRect(cx, cy, boxW, boxH);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(cx, cy, boxW, boxH);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '9px monospace';\n    ctx.fillText('DSP' + (c + 1), cx + 5, cy + 11);\n    if (col < cols - 1 && c + 1 < cores) {\n      var pkt = (tSec * 2 + c * 0.3) % 1;\n      ctx.strokeStyle = 'rgba(16,185,129,0.6)';\n      ctx.beginPath(); ctx.moveTo(cx + boxW, cy + 8); ctx.lineTo(cx + boxW + gapX, cy + 8); ctx.stroke();\n      ctx.fillStyle = '#10b981';\n      ctx.fillRect(cx + boxW + pkt * (gapX - 3), cy + 6, 3, 4);\n    }\n  }\n\n  var my = ry + 112;\n  var audioNeed = isHifi ? 88200 : 8000;\n  var audioCh = Math.floor(totalRate / audioNeed);\n  var cifPct = Math.min(100, (totalRate / 9.1e6) * 100);\n  var hdtvPct = Math.min(100, (totalRate / 186e6) * 100);\n\n  var meters = [\n    { label: (isHifi ? 'Hi-Fi 流 (88.2k): ' : '语音通话 (8k): ') + audioCh + ' 路', pct: Math.min(100, audioCh > 0 ? 100 : 10), col: '#10b981' },\n    { label: 'CIF 可视电话 (9.1M/s): ' + (totalRate / 9.1e6).toFixed(2) + 'x', pct: cifPct, col: cifPct >= 100 ? '#38bdf8' : '#f59e0b' },\n    { label: 'HDTV 高清 (186M/s): ' + ((totalRate / 186e6) * 100).toFixed(1) + '%', pct: hdtvPct, col: '#ec4899' }\n  ];\n  for (var m = 0; m < meters.length; m++) {\n    var yy2 = my + m * 23;\n    ctx.fillStyle = '#e2e8f0';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(meters[m].label, rx + 14, yy2 + 8);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx + 180, yy2, 128, 10);\n    ctx.fillStyle = meters[m].col;\n    ctx.fillRect(rx + 180, yy2, 128 * (meters[m].pct / 100), 10);\n  }\n\n  var fmtTotal = totalRate >= 1e6 ? (totalRate / 1e6).toFixed(2) + 'M/s' : Math.round(totalRate / 1e3) + 'k/s';\n  lab.setReadout('集群总吞吐率: ' + fmtTotal + ' | 可并发处理 ' + audioCh + (isHifi ? ' 路 Hi-Fi 立体声' : ' 路电话语音') + ' | 核间共享内存最高搬运速率: 240 MB/s');\n}\n\nlab.onUpdate(function() {\n  syncAudio();\n  drawScene(0);\n});\n\nlab.onLoop(function(dt, tSec) {\n  drawScene(tSec);\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【避坑第一条】不要轻信宣传单上的 MIPS / MFLOPS 综合跑分，直接查目标算法（FIR、IIR、FFT）的真实「时钟周期数/样本」，用 主频 ÷ 周期数 算出真实数据吞吐率。",
        "【60 阶算法分水岭】FIR 抽头少于 60 阶时，时域直接卷积最快；超过 60 阶后，果断切到频域 FFT 卷积（耗时仅呈对数级增长，4096 阶只比 512 阶慢约 30%）。",
        "【4 到 400 经验法则】绝大部分 DSP 技巧的开销都在每样本 4 ~ 400 个时钟周期之间；单颗 40 MHz SHARC 的算力窗口约为 100k ~ 10M 样本/秒。",
        "【千倍算力鸿沟】音频（语音 8k、Hi-Fi 88.2k）对 DSP 来说游刃有余；但视频（CIF 9.1M、HDTV 186M+）高出三个数量级，必须借助数据流、共享内存集群或 2D/3D Mesh 多核并行架构。"
      ]
    }
  ]
});
