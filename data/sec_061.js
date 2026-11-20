window.__BOOK_REGISTER_SECTION__("sec_061", {
  "title": "傅里叶分解：用正弦与余弦积木拆解世界 (Fourier Decomposition)",
  "intuition": "无论多复杂的离散信号，都能精确拆解成一组“频率固定、只有振幅不同”的正弦波和余弦波之和——只要把它们加回去，原信号就会分毫不差地复原。",
  "blocks": [
    {
      "type": "concept",
      "heading": "把任意信号拆进“固定频率”的余弦与正弦库",
      "paragraphs": [
        "如果说脉冲分解是“每次只看一个采样点”，那么**傅里叶分解（Fourier Decomposition）**就是换了个完全相反的维度：它把信号看作一连串不同频率的波叠加而成，既非常数学化，初看也并不直观。",
        "根据原书图 5-16 的规律，任意一个长度为 `N` 点的离散信号 `x[n]`，都可以被分解为 **`N + 2` 个分量信号**（其中一半是余弦波，另一半是正弦波，每个分量同样有 `N` 个采样点）。它们的频率是**彻底固定死**的，依据 `N` 个采样点内包含的“完整周期数”依次排列：",
        "- **直流分量 `x_C0[n]`**：最低频的余弦波，在 `N` 个点内包含 **0 个完整周期**，也就是一条平直的直流（DC）信号；而对应的 `x_S0[n]` 因为 `sin(0) = 0`，全为 0。\n- **基波与各次谐波**：紧接着的余弦分量 `x_C1[n]`、`x_C2[n]`、`x_C3[n]` 分别在 `N` 个点内完成 **1、2、3 个完整周期**；正弦分量 `x_S1[n]`、`x_S2[n]`、`x_S3[n]` 也遵循完全相同的周期递增规律，一直持续到最高频 `N/2` 周期（如 `N=16` 时对应图中的 `x_C8[n]` 与 `x_S8[n]`）。",
        "最关键的一点在于：**因为每个分量的频率都是固定不变的，不同信号在分解后唯一会改变的，仅仅是每一路正弦波和余弦波的振幅（Amplitude）。**"
      ],
      "formula": {
        "expr": "x[n] = Σ ( a_k · cos(2πkn / N) + b_k · sin(2πkn / N) ) ,  k = 0, 1, ..., N/2",
        "explain": "x[n] 是原始 N 点离散信号；k 代表在 N 个采样点内包含的完整周期数（频率编号）；cos(...) 和 sin(...) 是频率固定的“标准积木”；a_k 和 b_k 则是决定每块积木高矮（甚至正负翻转）的振幅系数。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：固定频率基波拆解与原信号精确重构",
      "instruction": "拖动下方滑块改变直流分量与 1~3 倍频正余弦波的振幅，观察右侧离散信号 x[n] 如何由左侧分量直接相加而成；可切换“振幅谱视图”并点击播放收听合成音色。",
      "controls": [
        {
          "type": "slider",
          "id": "c0",
          "label": "直流 x_C0 (0周期)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "c1",
          "label": "余弦 x_C1 (1周期)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.8,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "s1",
          "label": "正弦 x_S1 (1周期)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "c2",
          "label": "余弦 x_C2 (2周期)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": -0.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "s3",
          "label": "正弦 x_S3 (3周期)",
          "min": -1,
          "max": 1,
          "step": 0.1,
          "value": 0.3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showParts",
          "label": "显示各分量波形 (关=振幅柱状图)",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放合成音色",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 16;\nvar ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioCtx = null;\nvar osc = null;\nvar gainNode = null;\n\nfunction stopAudio() {\n  if (osc) {\n    try { osc.stop(); } catch (e) {}\n    try { osc.disconnect(); } catch (e) {}\n    osc = null;\n  }\n  if (gainNode) {\n    try { gainNode.disconnect(); } catch (e) {}\n    gainNode = null;\n  }\n}\n\nfunction updateAudio() {\n  var v = lab.values;\n  if (!v.play) {\n    stopAudio();\n    return;\n  }\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n  }\n  if (audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n  var real = new Float32Array(5);\n  var imag = new Float32Array(5);\n  var energy = v.c1 * v.c1 + v.s1 * v.s1 + v.c2 * v.c2 + v.s3 * v.s3;\n  if (energy < 0.0001) {\n    real[1] = 0.001;\n  } else {\n    real[1] = v.c1;\n    imag[1] = v.s1;\n    real[2] = v.c2;\n    imag[3] = v.s3;\n  }\n  var wave = audioCtx.createPeriodicWave(real, imag);\n  if (!osc) {\n    osc = audioCtx.createOscillator();\n    gainNode = audioCtx.createGain();\n    osc.frequency.value = 220;\n    osc.connect(gainNode);\n    gainNode.connect(audioCtx.destination);\n    osc.start();\n  }\n  osc.setPeriodicWave(wave);\n  var targetGain = energy < 0.0001 ? 0 : Math.min(0.22, 0.1 * Math.sqrt(energy));\n  gainNode.gain.setTargetAtTime(targetGain, audioCtx.currentTime, 0.03);\n}\n\nfunction draw() {\n  var v = lab.values;\n  ctx.clearRect(0, 0, W, H);\n\n  var comps = [\n    { name: 'x_C0 (DC)', amp: v.c0, color: '#f59e0b', fn: function(n) { return v.c0; } },\n    { name: 'x_C1 (1cyc)', amp: v.c1, color: '#38bdf8', fn: function(n) { return v.c1 * Math.cos(2 * Math.PI * 1 * n / N); } },\n    { name: 'x_S1 (1cyc)', amp: v.s1, color: '#10b981', fn: function(n) { return v.s1 * Math.sin(2 * Math.PI * 1 * n / N); } },\n    { name: 'x_C2 (2cyc)', amp: v.c2, color: '#ec4899', fn: function(n) { return v.c2 * Math.cos(2 * Math.PI * 2 * n / N); } },\n    { name: 'x_S3 (3cyc)', amp: v.s3, color: '#f8fafc', fn: function(n) { return v.s3 * Math.sin(2 * Math.PI * 3 * n / N); } }\n  ];\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(v.showParts ? '左侧：固定频率的 5 个基波分量 (N=16)' : '左侧：固定频率分量的振幅大小', 18, 18);\n  ctx.fillText('右侧：逐点相加精确重构 x[n] = Σ 分量', 385, 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(362, 12);\n  ctx.lineTo(362, H - 12);\n  ctx.stroke();\n\n  var lx0 = 92;\n  var lw = 248;\n  if (v.showParts) {\n    for (var i = 0; i < comps.length; i++) {\n      var c = comps[i];\n      var cy = 44 + i * 40;\n      ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n      ctx.beginPath();\n      ctx.moveTo(lx0, cy);\n      ctx.lineTo(lx0 + lw, cy);\n      ctx.stroke();\n\n      ctx.fillStyle = c.color;\n      ctx.font = '11px monospace';\n      ctx.fillText(c.name, 16, cy + 4);\n\n      ctx.strokeStyle = c.color;\n      ctx.lineWidth = 1.2;\n      ctx.beginPath();\n      for (var n = 0; n < N; n++) {\n        var px = lx0 + (n / (N - 1)) * lw;\n        var py = cy - c.fn(n) * 14;\n        if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n      }\n      ctx.stroke();\n\n      for (var n = 0; n < N; n++) {\n        var px = lx0 + (n / (N - 1)) * lw;\n        var py = cy - c.fn(n) * 14;\n        ctx.fillStyle = c.color;\n        ctx.beginPath();\n        ctx.arc(px, py, 2.3, 0, Math.PI * 2);\n        ctx.fill();\n      }\n    }\n  } else {\n    var zeroX = 210;\n    ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n    ctx.beginPath();\n    ctx.moveTo(zeroX, 32);\n    ctx.lineTo(zeroX, H - 18);\n    ctx.stroke();\n    for (var i = 0; i < comps.length; i++) {\n      var c = comps[i];\n      var cy = 48 + i * 38;\n      ctx.fillStyle = c.color;\n      ctx.font = '11px monospace';\n      ctx.fillText(c.name, 16, cy + 4);\n      var barW = c.amp * 110;\n      ctx.fillStyle = c.color;\n      ctx.fillRect(barW >= 0 ? zeroX : zeroX + barW, cy - 8, Math.abs(barW), 16);\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillText((c.amp >= 0 ? '+' : '') + c.amp.toFixed(1), 322, cy + 4);\n    }\n  }\n\n  var rx0 = 392;\n  var rw = 304;\n  var rcy = 128;\n  var rScale = 36;\n\n  for (var g = -2; g <= 2; g++) {\n    var gy = rcy - g * rScale;\n    ctx.strokeStyle = g === 0 ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(rx0, gy);\n    ctx.lineTo(rx0 + rw, gy);\n    ctx.stroke();\n  }\n  for (var n = 0; n < N; n += 4) {\n    var gx = rx0 + (n / (N - 1)) * rw;\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.beginPath();\n    ctx.moveTo(gx, 36);\n    ctx.lineTo(gx, 220);\n    ctx.stroke();\n  }\n\n  var maxAbs = 0;\n  var sums = [];\n  for (var n = 0; n < N; n++) {\n    var s = 0;\n    for (var i = 0; i < comps.length; i++) s += comps[i].fn(n);\n    sums.push(s);\n    if (Math.abs(s) > maxAbs) maxAbs = Math.abs(s);\n  }\n\n  ctx.strokeStyle = 'rgba(56, 189, 248, 0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = rx0 + (n / (N - 1)) * rw;\n    var py = Math.max(32, Math.min(224, rcy - sums[n] * rScale));\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var px = rx0 + (n / (N - 1)) * rw;\n    var py = Math.max(32, Math.min(224, rcy - sums[n] * rScale));\n    ctx.strokeStyle = 'rgba(16, 185, 129, 0.55)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, rcy);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(px, py, 3.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '11px monospace';\n  ctx.fillText('n=0', rx0 - 8, 234);\n  ctx.fillText('n=15', rx0 + rw - 18, 234);\n\n  lab.setReadout('N=16 | C0=' + v.c0.toFixed(1) + ' | C1=' + v.c1.toFixed(1) + ', S1=' + v.s1.toFixed(1) + ' | C2=' + v.c2.toFixed(1) + ' | S3=' + v.s3.toFixed(1) + ' | 重构峰值=' + maxAbs.toFixed(2));\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  draw();\n});\ndraw();"
    },
    {
      "type": "concept",
      "heading": "为什么傅里叶分解是数字信号处理的“半壁江山”？",
      "paragraphs": [
        "为什么要费这么大劲，把好端端的时域信号拆成一大堆正弦波和余弦波？作者在书中精辟地给出了**三大核心原因**：",
        "1. **自然界许多信号本身就是正弦波的叠加**：最典型的例子就是**声音与音频信号**。人声、乐器声的音色与音高，物理本质上就是基频和各次谐波正弦波的叠加。傅里叶分解能直接把这些信号里隐藏的“信息成分”剥离出来进行分析。",
        "2. **线性系统对正弦波有独一无二的响应特性**：如果你把一个正弦波输入任何线性系统，**输出的必然还是同频率的正弦波**！线性系统绝对不会无中生有地变出新频率，它唯一能做的，只是改变这个正弦波的**振幅（放大/衰减）**和**相位（超前/滞后）**。只要把输入信号分解成正弦波，再查表算出系统对每个频率的“振幅缩放”与“相移”，最后加起来就能得到系统输出！",
        "3. **现代 DSP 数学王座的基石**：傅里叶分解是通往更宏大数学体系——**傅里叶分析（Fourier Analysis）**，以及更高级的**拉普拉斯变换（Laplace Transform）**与 **z 变换（z-transform）**的起点。当今绝大多数尖端 DSP 算法都建立在这些技术的某个侧面之上。"
      ],
      "formula": {
        "expr": "A · cos(ωn)  ──[ 线性系统 H ]──▶  (G · A) · cos(ωn + φ)",
        "explain": "输入一个频率为 ω、振幅为 A 的纯正弦/余弦波，经过线性系统 H 后，频率 ω 纹丝不动；系统只需用两个数来刻画：对当前频率的增益 G（改变振幅）和相移 φ（改变波形左右偏移）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：线性系统的“正弦不变性”与谐波对比",
      "instruction": "调节基波频率、系统增益与相移，观察单个正弦波通过线性系统后如何保持“纯正弦”形态；尝试开启“叠加 3 次谐波”或“非线性削波”，感受为何线性系统偏爱正弦分解。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "输入基波周期数",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " 周期"
        },
        {
          "type": "slider",
          "id": "gain",
          "label": "系统对基波增益 G",
          "min": 0.2,
          "max": 1.4,
          "step": 0.1,
          "value": 1,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "phase",
          "label": "系统相移 φ",
          "min": -180,
          "max": 180,
          "step": 15,
          "value": 60,
          "unit": "°"
        },
        {
          "type": "toggle",
          "id": "addThird",
          "label": "叠加 3 次谐波 (合成复合波)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "nonlinear",
          "label": "开启非线性削波 (对比破坏)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听系统输出声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 32;\nvar ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar audioCtx = null;\nvar osc1 = null;\nvar osc3 = null;\nvar g1 = null;\nvar g3 = null;\nvar shaper = null;\nvar masterGain = null;\n\nfunction makeCurve(isNL) {\n  var k = 256;\n  var c = new Float32Array(k);\n  for (var i = 0; i < k; i++) {\n    var x = (i * 2) / (k - 1) - 1;\n    c[i] = isNL ? Math.max(-0.35, Math.min(0.35, x * 2.8)) : x;\n  }\n  return c;\n}\n\nfunction stopAudio() {\n  [osc1, osc3, g1, g3, shaper, masterGain].forEach(function(node) {\n    if (node) {\n      try { if (node.stop) node.stop(); } catch (e) {}\n      try { node.disconnect(); } catch (e) {}\n    }\n  });\n  osc1 = null; osc3 = null; g1 = null; g3 = null; shaper = null; masterGain = null;\n}\n\nfunction updateAudio() {\n  var v = lab.values;\n  if (!v.play) {\n    stopAudio();\n    return;\n  }\n  if (!audioCtx) audioCtx = lab.getAudioContext();\n  if (audioCtx.state === 'suspended') audioCtx.resume();\n\n  if (!osc1) {\n    osc1 = audioCtx.createOscillator();\n    osc3 = audioCtx.createOscillator();\n    g1 = audioCtx.createGain();\n    g3 = audioCtx.createGain();\n    shaper = audioCtx.createWaveShaper();\n    masterGain = audioCtx.createGain();\n    osc1.type = 'sine';\n    osc3.type = 'sine';\n    osc1.connect(g1);\n    osc3.connect(g3);\n    g1.connect(shaper);\n    g3.connect(shaper);\n    shaper.connect(masterGain);\n    masterGain.connect(audioCtx.destination);\n    osc1.start();\n    osc3.start();\n  }\n  var baseHz = 110 * v.freq;\n  osc1.frequency.setTargetAtTime(baseHz, audioCtx.currentTime, 0.02);\n  osc3.frequency.setTargetAtTime(baseHz * 3, audioCtx.currentTime, 0.02);\n  g1.gain.setTargetAtTime(0.35 * v.gain, audioCtx.currentTime, 0.02);\n  g3.gain.setTargetAtTime(v.addThird ? 0.14 * v.gain : 0, audioCtx.currentTime, 0.02);\n  shaper.curve = makeCurve(v.nonlinear);\n  masterGain.gain.setTargetAtTime(0.32, audioCtx.currentTime, 0.02);\n}\n\nfunction drawPanel(x0, y0, pw, ph, title, samples, sub1, sub2, mainColor) {\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(title, x0, y0 - 10);\n\n  var cy = y0 + ph / 2;\n  var yScale = ph * 0.36;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var row = -1; row <= 1; row++) {\n    var gy = cy - row * yScale;\n    ctx.beginPath();\n    ctx.moveTo(x0, gy);\n    ctx.lineTo(x0 + pw, gy);\n    ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.beginPath();\n  ctx.moveTo(x0, cy);\n  ctx.lineTo(x0 + pw, cy);\n  ctx.stroke();\n\n  if (sub1 && sub2) {\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';\n    ctx.beginPath();\n    for (var n = 0; n < N; n++) {\n      var px = x0 + (n / (N - 1)) * pw;\n      var py = cy - sub1[n] * yScale;\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)';\n    ctx.beginPath();\n    for (var n = 0; n < N; n++) {\n      var px = x0 + (n / (N - 1)) * pw;\n      var py = cy - sub2[n] * yScale;\n      if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  ctx.strokeStyle = mainColor;\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var px = x0 + (n / (N - 1)) * pw;\n    var py = cy - samples[n] * yScale;\n    if (n === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var px = x0 + (n / (N - 1)) * pw;\n    var py = cy - samples[n] * yScale;\n    ctx.fillStyle = '#f8fafc';\n    ctx.beginPath();\n    ctx.arc(px, py, 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n}\n\nfunction draw() {\n  var v = lab.values;\n  ctx.clearRect(0, 0, W, H);\n\n  var inArr = [], in1 = [], in3 = [];\n  var outArr = [], out1 = [], out3 = [];\n  var rad = v.phase * Math.PI / 180;\n\n  for (var n = 0; n < N; n++) {\n    var w = 2 * Math.PI * v.freq * n / N;\n    var s1 = Math.sin(w);\n    var s3 = v.addThird ? 0.45 * Math.sin(3 * w) : 0;\n    in1.push(s1);\n    in3.push(s3);\n    inArr.push(s1 + s3);\n\n    var o1 = v.gain * Math.sin(w + rad);\n    var o3 = v.addThird ? (v.gain * 0.4) * 0.45 * Math.sin(3 * w + 1.5 * rad) : 0;\n    var sumOut = o1 + o3;\n    if (v.nonlinear) {\n      sumOut = Math.max(-0.65, Math.min(0.65, sumOut * 1.8));\n    }\n    out1.push(o1);\n    out3.push(o3);\n    outArr.push(sumOut);\n  }\n\n  drawPanel(20, 34, 305, 186, '输入信号 x[n]' + (v.addThird ? ' (基波 + 3次谐波)' : ' (纯正弦波)'), inArr, v.addThird ? in1 : null, v.addThird ? in3 : null, '#38bdf8');\n\n  ctx.fillStyle = v.nonlinear ? '#ec4899' : '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(v.nonlinear ? '非线性' : '线性系统', 336, 114);\n  ctx.strokeStyle = v.nonlinear ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  ctx.moveTo(334, 126);\n  ctx.lineTo(382, 126);\n  ctx.lineTo(374, 120);\n  ctx.moveTo(382, 126);\n  ctx.lineTo(374, 132);\n  ctx.stroke();\n\n  var outTitle = v.nonlinear ? '输出 y[n] (削波畸变：不再是纯正弦!)' : ('输出 y[n]' + (v.addThird ? ' (各分量仍为纯正弦，叠加变形)' : ' (依然是同频纯正弦!)'));\n  drawPanel(395, 34, 305, 186, outTitle, outArr, (!v.nonlinear && v.addThird) ? out1 : null, (!v.nonlinear && v.addThird) ? out3 : null, v.nonlinear ? '#ec4899' : '#10b981');\n\n  lab.setReadout('状态: ' + (v.nonlinear ? '非线性削波 (产生额外失真频率)' : '线性系统 (单频输入必得同频正弦输出)') + ' | 基波=' + v.freq + '周期 (' + (110 * v.freq) + 'Hz) | 增益=' + v.gain.toFixed(1) + 'x | 相移=' + v.phase + '°');\n}\n\nlab.onUpdate(function() {\n  updateAudio();\n  draw();\n});\ndraw();"
    },
    {
      "type": "concept",
      "heading": "把复杂计算留给第 8 章，先牢记“精确重构”的底层承诺",
      "paragraphs": [
        "看到这里，你脑海里一定会冒出三个非常尖锐的问题：为什么任意形状的信号居然都能拆成正弦和余弦波？面对一个具体信号，到底怎么算出每一路正余弦波的振幅 `a_k` 和 `b_k`？利用这套技术又能设计出什么样的神奇系统？",
        "作者在书中坦诚表示，由于傅里叶分解的数学细节过于深入，在这个第 5 章的概览里暂不展开（它们将在**第 8 章**被彻底揭开）。",
        "现阶段，你只需要牢牢记住一个最核心的底层承诺：**当所有被分解出来的正弦波和余弦波分量重新相加在一起时，原始信号将被分毫不差地精确重构（Exact Reconstruction）。** 没有丢掉哪怕一丝一毫的信息，这正是它能作为数字信号处理可靠基石的前提。"
      ],
      "formula": {
        "expr": "x_reconstructed[n] = x_C0[n] + x_C1[n] + x_S1[n] + ... + x_C(N/2)[n] + x_S(N/2)[n] ≡ x[n]",
        "explain": "将分解得到的 N+2 个固定频率正弦与余弦分量在每个采样点 n 逐点相加，必然精确等于原始信号 x[n]（其中 x_S0[n] 与 x_S(N/2)[n] 恒为零，负责补齐对称形式）。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "坑点澄清（为什么 N 点信号会拆成 N+2 个分量）：当 N 为偶数（如 N=16）时，从 0 周期到 N/2 周期共有 N/2+1 个余弦波和 N/2+1 个正弦波，加起来正好 N+2 个信号。但其中 0 周期的正弦波 x_S0[n] 和最高频正弦波 x_S(N/2)[n] 在所有整数采样点上都恒等于 0，因此真正有效的独立信息依然是 N 个自由度，不会凭空多出信息。",
        "频率不动、只变振幅：在离散傅里叶分解的框架里，基波的频率格子（0, 1, 2, ..., N/2 个完整周期）在信号长度 N 确定后就彻底固定了；不同信号的差异完全体现在每个频率格子对应的振幅系数上。",
        "只有“线性系统”才享受正弦不变性红利：在实验 2 中可以看到，一旦出现削波等非线性操作，纯正弦输入会瞬间裂变出大量原本不存在的新频率，直接让基于单个频率增益/相移的分析方法失效。",
        "先拆解、再各自处理、最后精确合成：这就是整本教材最核心的 DSP 分治思想——把复杂的时域信号拆成简单的正余弦波，逐个算出线性系统对它们的放大与相移，再把结果相加就能得到完整输出。"
      ]
    }
  ]
});
