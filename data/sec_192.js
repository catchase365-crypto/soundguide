window.__BOOK_REGISTER_SECTION__("sec_192", {
  "title": "迭代法设计自定义递归滤波器 (Recursive Filter Design)",
  "intuition": "抛开繁琐的 z 变换解析推导，借用神经网络的梯度下降思想，从单位冲激系统出发，一步步“捏”出任意自定义形状频响的 IIR 递归滤波器。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么用“神经网络思维”来设计 IIR 滤波器？",
      "paragraphs": [
        "传统教材教我们用巴特沃斯、切比雪夫等公式设计标准的高通、低通或带通递归滤波器（IIR）。但如果实际工程中需要一个**形状奇特的自定义频率响应**——比如为了抵消数模转换器零阶保持效应的 `1/sinc(x)` 补偿曲线，或者带有尖锐深谷的异形响应——传统 z 变换数学推导会变得极其痛苦。",
        "Steven Smith 在本章提出了一个绝妙的跨界思路：**把递归滤波器的系数 `A[ ]` 和 `B[ ]` 当作神经网络的“权重”**。我们先在数组 `T[0..N/2]` 中手工画出理想的幅频响应曲线（仅控制幅度，**相位不加限制**，随它自然形成），然后通过计算机迭代微调系数，让滤波器实际的幅频响应一步步逼近目标。",
        "这里有一条**铁律**：初始化递归系数时，**绝对不能像神经网络那样填随机数！** 随机的反馈系数 `B[ ]` 极易把极点扔到单位圆外，导致滤波器一开局就发散振荡。标准做法是将其初始化为**单位系统（Identity System）**，即令 `A[0] = 1`，其余所有 `A` 和 `B` 系数全为 `0`。此时滤波器输出等于输入，百分百稳定。"
      ],
      "formula": {
        "expr": "y[n] = Σ(j=0..NP) A[j]·x[n-j] + Σ(j=1..NP) B[j]·y[n-j]",
        "explain": "x[n] 为输入（设计时用偏移到第 12 位的单位冲激），y[n] 为输出的冲激响应，NP 为极点阶数。初始令 A[0]=1、其余全 0，保证系统从绝对稳定的直通状态起步。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 核心引擎：有限差分求斜率与自适应步长 MU",
      "paragraphs": [
        "要像训练神经网络一样做**最速下降（Steepest Descent）**，每轮迭代必须知道两件事：当前误差有多大（子程序 `3000`），以及每个系数往哪个方向调能降误差（子程序 `2000`）。",
        "**如何算当前误差 `ER`？** 程序先将第 12 号采样置 1 形成偏移冲激（避开数组负下标），用当前 `A[ ]`、`B[ ]` 算出系统的冲激响应 `REX[ ]`，再调用 `N%` 点 FFT（必须为 2 的幂，书中取 256）将其变到频域，计算每个正频率点的幅度 `MAG`，最后求出与目标曲线 `T[ ]` 的均方根误差 `ER`。",
        "**如何求每个系数的斜率？** 在神经网络里可以用链式法则直接求导，但这里误差跨越了离散傅里叶变换（DFT），解析求导极难。于是作者祭出了简单粗暴却极有效的**有限差分法**：把某一个系数临时加上一个极小扰动 `DELTA = 0.00001`，重算一次误差 `ER`，用 `(ER - EOLD) / DELTA` 当作该系数的误差斜率，随后再把 `DELTA` 减回去。",
        "算完所有斜率后，系数沿负梯度方向更新：`系数 = 系数 - 斜率 * MU`。为了兼顾收敛速度与最终精度，程序还设计了**自适应步长**：起初设较大的 `MU = 0.2` 猛冲；一旦某轮更新后新误差 `ENEW > EOLD`（说明步子迈大了冲过头），主循环第 370 行立刻将 `MU` 减半，从而平滑逼近最优解。"
      ],
      "formula": {
        "expr": "SA[p] = (ER_perturbed - EOLD) / DELTA,   A[p] ← A[p] - SA[p] · MU",
        "explain": "DELTA 为极小扰动量 (1e-5)，EOLD 为扰动前的均方根误差，SA[p] 为第 p 个系数对总误差的灵敏度斜率，MU 为自适应迭代步长。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：实时观察 IIR 滤波器“迭代生长”与阻带加权听感",
      "instruction": "拖动“迭代步数”滑块观察滤波器如何从平坦的单位系统逐步长成低通曲线；调高“阻带误差权重”体验图 26-13(b) 的波纹权衡，并点击播放按钮对比滤波后的白噪声听感。",
      "controls": [
        {
          "type": "slider",
          "id": "iter",
          "label": "迭代步数 (Iteration)",
          "min": 0,
          "max": 80,
          "step": 1,
          "value": 45,
          "unit": " 步"
        },
        {
          "type": "slider",
          "id": "poles",
          "label": "滤波器极点数 (NP)",
          "min": 2,
          "max": 8,
          "step": 2,
          "value": 8,
          "unit": " 阶"
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "目标截止频率",
          "min": 0.15,
          "max": 0.4,
          "step": 0.05,
          "value": 0.3,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "stopWeight",
          "label": "阻带误差权重",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 1,
          "unit": " x"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听滤波后白噪声",
          "activeLabel": "⏸ 暂停噪声"
        }
      ],
      "jsCode": "(function() {\n  var N = 128, halfN = 64, MAX_ITER = 80, DELTA = 1e-5;\n  var cacheKey = '', snapshots = [];\n  var audioCtx = null, srcNode = null, gainNode = null, noiseSeed = null;\n\n  function getRawNoise(len) {\n    if (noiseSeed && noiseSeed.length === len) return noiseSeed;\n    noiseSeed = new Float32Array(len);\n    var s = 1234567;\n    for (var i = 0; i < len; i++) {\n      s = (s * 1664525 + 1013904223) >>> 0;\n      noiseSeed[i] = (s / 4294967296) * 2 - 1;\n    }\n    return noiseSeed;\n  }\n\n  function fft(rex, imx, n) {\n    var i, j = 0, m, l, half, k, start, idx1, idx2;\n    var tr, ti, ang, wStepR, wStepI, wr, wi, nwr;\n    for (i = 0; i < n; i++) {\n      if (i < j) {\n        tr = rex[i]; rex[i] = rex[j]; rex[j] = tr;\n        ti = imx[i]; imx[i] = imx[j]; imx[j] = ti;\n      }\n      m = n >> 1;\n      while (m >= 1 && j >= m) { j -= m; m >>= 1; }\n      j += m;\n    }\n    for (l = 2; l <= n; l <<= 1) {\n      half = l >> 1;\n      ang = -2 * Math.PI / l;\n      wStepR = Math.cos(ang); wStepI = Math.sin(ang);\n      for (start = 0; start < n; start += l) {\n        wr = 1; wi = 0;\n        for (k = 0; k < half; k++) {\n          idx1 = start + k; idx2 = idx1 + half;\n          tr = rex[idx2] * wr - imx[idx2] * wi;\n          ti = rex[idx2] * wi + imx[idx2] * wr;\n          rex[idx2] = rex[idx1] - tr;\n          imx[idx2] = imx[idx1] - ti;\n          rex[idx1] += tr;\n          imx[idx1] += ti;\n          nwr = wr * wStepR - wi * wStepI;\n          wi = wr * wStepI + wi * wStepR;\n          wr = nwr;\n        }\n      }\n    }\n  }\n\n  function buildTarget(cutoff) {\n    var T = new Float64Array(halfN + 1);\n    for (var i = 0; i <= halfN; i++) {\n      T[i] = (i / N <= cutoff + 1e-9) ? 1.0 : 0.0;\n    }\n    return T;\n  }\n\n  function calcER(A, B, np, T, cutoff, stopWeight) {\n    var rex = new Float64Array(N);\n    var imx = new Float64Array(N);\n    var i, j, sum;\n    for (i = 12; i < N; i++) {\n      sum = 0;\n      for (j = 0; j <= np; j++) {\n        if (i - j === 12) sum += A[j];\n        if (j >= 1) sum += B[j] * rex[i - j];\n      }\n      if (!isFinite(sum) || Math.abs(sum) > 40) {\n        return { er: 1e9, mag: null, unstable: true };\n      }\n      rex[i] = sum;\n    }\n    fft(rex, imx, N);\n    var mag = new Float64Array(halfN + 1);\n    var sumSq = 0, m, err;\n    for (i = 0; i <= halfN; i++) {\n      m = Math.sqrt(rex[i] * rex[i] + imx[i] * imx[i]);\n      mag[i] = m;\n      err = m - T[i];\n      if (i / N > cutoff + 1e-9) err *= stopWeight;\n      sumSq += err * err;\n    }\n    return { er: Math.sqrt(sumSq / (halfN + 1)), mag: mag, unstable: false };\n  }\n\n  function ensureSnapshots(np, cutoff, stopWeight) {\n    var key = np + '_' + cutoff.toFixed(2) + '_' + stopWeight;\n    if (key === cacheKey && snapshots.length === MAX_ITER + 1) return;\n    cacheKey = key;\n    snapshots = [];\n    var T = buildTarget(cutoff);\n    var A = new Float64Array(np + 1);\n    var B = new Float64Array(np + 1);\n    A[0] = 1.0;\n    var mu = 0.2;\n    var curr = calcER(A, B, np, T, cutoff, stopWeight);\n    snapshots.push({ A: A.slice(), B: B.slice(), mag: curr.mag, er: curr.er, mu: mu });\n    var sa = new Float64Array(np + 1);\n    var sb = new Float64Array(np + 1);\n    for (var step = 1; step <= MAX_ITER; step++) {\n      var eOld = curr.er;\n      var p, resP;\n      for (p = 0; p <= np; p++) {\n        A[p] += DELTA;\n        resP = calcER(A, B, np, T, cutoff, stopWeight);\n        sa[p] = resP.unstable ? 0 : (resP.er - eOld) / DELTA;\n        A[p] -= DELTA;\n      }\n      for (p = 1; p <= np; p++) {\n        B[p] += DELTA;\n        resP = calcER(A, B, np, T, cutoff, stopWeight);\n        sb[p] = resP.unstable ? 0 : (resP.er - eOld) / DELTA;\n        B[p] -= DELTA;\n      }\n      var newA = A.slice(), newB = B.slice();\n      for (p = 0; p <= np; p++) newA[p] -= sa[p] * mu;\n      for (p = 1; p <= np; p++) newB[p] -= sb[p] * mu;\n      var resNew = calcER(newA, newB, np, T, cutoff, stopWeight);\n      if (resNew.unstable || resNew.er > eOld * 2.2) {\n        mu *= 0.5;\n      } else {\n        A = newA; B = newB; curr = resNew;\n        if (resNew.er > eOld) mu *= 0.5;\n      }\n      snapshots.push({ A: A.slice(), B: B.slice(), mag: curr.mag, er: curr.er, mu: mu });\n    }\n  }\n\n  function updateAudio(snap, np) {\n    if (!lab.values.play) {\n      if (srcNode) {\n        try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n        srcNode = null;\n      }\n      return;\n    }\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    if (!gainNode) {\n      gainNode = audioCtx.createGain();\n      gainNode.gain.value = 0.22;\n      gainNode.connect(audioCtx.destination);\n    }\n    var len = 24000, warm = 200, total = len + warm;\n    var raw = getRawNoise(total);\n    var y = new Float32Array(total);\n    var A = snap.A, B = snap.B;\n    for (var n = 0; n < total; n++) {\n      var sum = 0;\n      for (var j = 0; j <= np; j++) {\n        if (n - j >= 0) {\n          sum += A[j] * raw[n - j];\n          if (j >= 1) sum += B[j] * y[n - j];\n        }\n      }\n      if (!isFinite(sum)) sum = 0;\n      if (sum > 4) sum = 4; else if (sum < -4) sum = -4;\n      y[n] = sum;\n    }\n    var buf = audioCtx.createBuffer(1, len, audioCtx.sampleRate);\n    var ch = buf.getChannelData(0);\n    for (var i = 0; i < len; i++) {\n      var val = y[warm + i] * 0.45;\n      if (i < 128) val *= i / 128;\n      if (i > len - 128) val *= (len - i) / 128;\n      ch[i] = Math.max(-0.95, Math.min(0.95, val));\n    }\n    var nextSrc = audioCtx.createBufferSource();\n    nextSrc.buffer = buf;\n    nextSrc.loop = true;\n    nextSrc.playbackRate.value = 0.25;\n    nextSrc.connect(gainNode);\n    if (srcNode) {\n      try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    }\n    nextSrc.start(0);\n    srcNode = nextSrc;\n  }\n\n  function draw() {\n    var ctx = lab.ctx, W = lab.width, H = lab.height;\n    var iter = Math.round(lab.values.iter);\n    var np = Math.round(lab.values.poles);\n    var cutoff = Number(lab.values.cutoff);\n    var stopWeight = Math.round(lab.values.stopWeight);\n    ensureSnapshots(np, cutoff, stopWeight);\n    var snap = snapshots[iter];\n    var T = buildTarget(cutoff);\n    updateAudio(snap, np);\n\n    ctx.clearRect(0, 0, W, H);\n    var px = 46, py = 20, pw = 420, ph = 185;\n    var cx = 515, cy = 20, cw = 185, ch = 185;\n\n    if (stopWeight > 1) {\n      var cutX = px + (cutoff / 0.5) * pw;\n      ctx.fillStyle = 'rgba(236,72,153,0.08)';\n      ctx.fillRect(cutX, py, px + pw - cutX, ph);\n      ctx.fillStyle = '#ec4899';\n      ctx.font = '11px sans-serif';\n      ctx.fillText('阻带加权 ' + stopWeight + 'x', cutX + 6, py + 15);\n    }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var g = 0; g <= 3; g++) {\n      var gy = py + ph - (g * 0.5 / 1.5) * ph;\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n      ctx.fillText((g * 0.5).toFixed(1), px - 28, gy + 4);\n    }\n    for (var f = 0; f <= 5; f++) {\n      var fx = px + (f / 5) * pw;\n      ctx.beginPath(); ctx.moveTo(fx, py); ctx.lineTo(fx, py + ph); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n      ctx.fillText((f * 0.1).toFixed(1), fx - 9, py + ph + 16);\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.strokeRect(px, py, pw, ph);\n\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.65)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var k = 0; k <= halfN; k++) {\n      var x = px + (k / halfN) * pw;\n      var y = py + ph - Math.min(1.5, T[k]) / 1.5 * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var k = 0; k <= halfN; k++) {\n      var x = px + (k / halfN) * pw;\n      var y = py + ph - Math.min(1.5, Math.max(0, snap.mag[k])) / 1.5 * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc'; ctx.font = '12px sans-serif';\n    ctx.fillText('幅频响应 (虚线=目标, 绿线=当前 ' + np + ' 阶 IIR)', px, py - 6);\n    ctx.fillText('误差 ER 收敛曲线', cx, cy - 6);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.strokeRect(cx, cy, cw, ch);\n    var maxER = snapshots[0].er * 1.08 + 1e-6;\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var s = 0; s <= MAX_ITER; s++) {\n      var sx = cx + (s / MAX_ITER) * cw;\n      var sy = cy + ch - Math.min(1, snapshots[s].er / maxER) * (ch - 12) - 4;\n      if (s === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n    }\n    ctx.stroke();\n\n    var curX = cx + (iter / MAX_ITER) * cw;\n    var curY = cy + ch - Math.min(1, snap.er / maxER) * (ch - 12) - 4;\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(curX, curY, 4.5, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n    ctx.fillText('0', cx, cy + ch + 16);\n    ctx.fillText('80 步', cx + cw - 30, cy + ch + 16);\n\n    lab.setReadout('步数: ' + iter + '/' + MAX_ITER + '  |  均方根误差 ER: ' + snap.er.toFixed(4) + '  |  当前步长 MU: ' + snap.mu.toFixed(4) + '  |  A[0]=' + snap.A[0].toFixed(3) + ', B[1]=' + (snap.B[1] || 0).toFixed(3));\n  }\n\n  lab.onUpdate(draw);\n  draw();\n})();"
    },
    {
      "type": "concept",
      "heading": "3. 进阶实战：误差塑形、频段忽略与“起始点”陷阱",
      "paragraphs": [
        "迭代法最大的威力，在于**你可以像雕塑家一样任意修改“误差函数 `ER`”的规则**，去换取工程最关心的指标：",
        "**（1）对重点频段加权**：如实验 1 所示，在图 26-13(b) 中把阻带误差乘以 8，算法就会拼命压低阻带波纹，代价是通带波纹略微变大——这就是典型的频域性能置换。",
        "**（2）干脆忽略不关心的频段**：在图 26-13(c) 的 2 阶 `1/sinc(x)` 补偿滤波器中，理想曲线在 `0 ~ 0.5` 之间向上翘起，而 2 阶滤波器的自由度有限。作者只把误差累加范围限制在 `0 ~ 0.45`，放弃 `0.45 ~ 0.5` 的高频边角，结果在有效信号带宽内获得了几乎完美的贴合。",
        "**（3）深谷响应必须换起始点**：在图 26-13(d) 的 6 阶自定义频响中，曲线中段突然出现一个极窄的深谷。如果仍从平坦的单位系统（`A[0]=1`）出发，狭窄深谷在总误差里占比太小，梯度下降很容易被宽阔平缓的通带带偏，卡在局部极小值里“挖不出坑”。解决之道是：**先用常规方法算一个中心频率相近的 2 阶陷波器（Notch Filter）作为初始系数**，相当于先在地面刨出一个坑，再让迭代算法去修整周围的起伏！"
      ],
      "formula": {
        "expr": "ER = √[ (1 / M) · Σ(i=0..K_max) W[i] · (|H(f_i)| - T[f_i])² ]",
        "explain": "W[i] 为自定义频率权重系数（如阻带取 8），K_max 为误差统计上限频点（如只算到 0.45 fs）。改变 W[i] 与 K_max 即可精准控制误差资源的分配。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：1/sinc(x) 频段忽略与“深谷陷波”初始值陷阱",
      "instruction": "先在默认 1/sinc(x) 模式下拖动“误差统计上限”从 0.50 降到 0.45，观察有效区贴合度提升；再打开“自定义深谷模式”，切换“使用陷波器初始化”对比能否成功挖出深谷。",
      "controls": [
        {
          "type": "toggle",
          "id": "modeDip",
          "label": "模式切换：关闭=1/sinc(x)补偿，开启=自定义深谷",
          "value": false
        },
        {
          "type": "slider",
          "id": "maxFreq",
          "label": "误差统计上限 (f_max)",
          "min": 0.3,
          "max": 0.5,
          "step": 0.01,
          "value": 0.45,
          "unit": " fs"
        },
        {
          "type": "toggle",
          "id": "goodInit",
          "label": "使用预置陷波器初始化 (深谷模式生效)",
          "value": true
        },
        {
          "type": "slider",
          "id": "muInit",
          "label": "初始步长 (MU)",
          "min": 0.05,
          "max": 0.4,
          "step": 0.05,
          "value": 0.2,
          "unit": ""
        }
      ],
      "jsCode": "(function() {\n  var N = 128, halfN = 64, DELTA = 1e-5;\n\n  function fft(rex, imx, n) {\n    var i, j = 0, m, l, half, k, start, idx1, idx2;\n    var tr, ti, ang, wStepR, wStepI, wr, wi, nwr;\n    for (i = 0; i < n; i++) {\n      if (i < j) {\n        tr = rex[i]; rex[i] = rex[j]; rex[j] = tr;\n        ti = imx[i]; imx[i] = imx[j]; imx[j] = ti;\n      }\n      m = n >> 1;\n      while (m >= 1 && j >= m) { j -= m; m >>= 1; }\n      j += m;\n    }\n    for (l = 2; l <= n; l <<= 1) {\n      half = l >> 1;\n      ang = -2 * Math.PI / l;\n      wStepR = Math.cos(ang); wStepI = Math.sin(ang);\n      for (start = 0; start < n; start += l) {\n        wr = 1; wi = 0;\n        for (k = 0; k < half; k++) {\n          idx1 = start + k; idx2 = idx1 + half;\n          tr = rex[idx2] * wr - imx[idx2] * wi;\n          ti = rex[idx2] * wi + imx[idx2] * wr;\n          rex[idx2] = rex[idx1] - tr;\n          imx[idx2] = imx[idx1] - ti;\n          rex[idx1] += tr;\n          imx[idx1] += ti;\n          nwr = wr * wStepR - wi * wStepI;\n          wi = wr * wStepI + wi * wStepR;\n          wr = nwr;\n        }\n      }\n    }\n  }\n\n  function buildTarget(modeDip) {\n    var T = new Float64Array(halfN + 1);\n    for (var i = 0; i <= halfN; i++) {\n      var f = i / N;\n      if (!modeDip) {\n        T[i] = (f < 1e-6) ? 1.0 : (Math.PI * f) / Math.sin(Math.PI * f);\n      } else {\n        var base = (f < 0.36) ? (1.0 + 0.22 * Math.sin(Math.PI * f / 0.30)) : 0.82;\n        var notch = 1.0 - 0.56 * Math.exp(-Math.pow((f - 0.375) / 0.017, 2));\n        T[i] = base * notch;\n      }\n    }\n    return T;\n  }\n\n  function calcER(A, B, np, T, maxFreq) {\n    var rex = new Float64Array(N);\n    var imx = new Float64Array(N);\n    var i, j, sum;\n    for (i = 12; i < N; i++) {\n      sum = 0;\n      for (j = 0; j <= np; j++) {\n        if (i - j === 12) sum += A[j];\n        if (j >= 1) sum += B[j] * rex[i - j];\n      }\n      if (!isFinite(sum) || Math.abs(sum) > 40) {\n        return { er: 1e9, mag: null, unstable: true };\n      }\n      rex[i] = sum;\n    }\n    fft(rex, imx, N);\n    var mag = new Float64Array(halfN + 1);\n    var sumSq = 0, count = 0;\n    for (i = 0; i <= halfN; i++) {\n      var m = Math.sqrt(rex[i] * rex[i] + imx[i] * imx[i]);\n      mag[i] = m;\n      if (i / N <= maxFreq + 1e-9) {\n        var err = m - T[i];\n        sumSq += err * err;\n        count++;\n      }\n    }\n    return { er: Math.sqrt(sumSq / Math.max(1, count)), mag: mag, unstable: false };\n  }\n\n  function solve(modeDip, maxFreq, goodInit, muInit) {\n    var np = modeDip ? 6 : 2;\n    var steps = modeDip ? 90 : 75;\n    var T = buildTarget(modeDip);\n    var A = new Float64Array(np + 1);\n    var B = new Float64Array(np + 1);\n    if (modeDip && goodInit) {\n      var w0 = 2 * Math.PI * 0.375, r = 0.88;\n      var cw = Math.cos(w0);\n      var scale = (1 + r * r - 2 * r * cw) / (2 - 2 * cw);\n      A[0] = scale; A[1] = -2 * cw * scale; A[2] = scale;\n      B[1] = 2 * r * cw; B[2] = -(r * r);\n    } else {\n      A[0] = 1.0;\n    }\n    var mu = muInit;\n    var initRes = calcER(A, B, np, T, maxFreq);\n    var curr = initRes;\n    var sa = new Float64Array(np + 1), sb = new Float64Array(np + 1);\n    for (var s = 0; s < steps; s++) {\n      var eOld = curr.er, p, resP;\n      for (p = 0; p <= np; p++) {\n        A[p] += DELTA;\n        resP = calcER(A, B, np, T, maxFreq);\n        sa[p] = resP.unstable ? 0 : (resP.er - eOld) / DELTA;\n        A[p] -= DELTA;\n      }\n      for (p = 1; p <= np; p++) {\n        B[p] += DELTA;\n        resP = calcER(A, B, np, T, maxFreq);\n        sb[p] = resP.unstable ? 0 : (resP.er - eOld) / DELTA;\n        B[p] -= DELTA;\n      }\n      var newA = A.slice(), newB = B.slice();\n      for (p = 0; p <= np; p++) newA[p] -= sa[p] * mu;\n      for (p = 1; p <= np; p++) newB[p] -= sb[p] * mu;\n      var resNew = calcER(newA, newB, np, T, maxFreq);\n      if (resNew.unstable || resNew.er > eOld * 2.2) {\n        mu *= 0.5;\n      } else {\n        A = newA; B = newB; curr = resNew;\n        if (resNew.er > eOld) mu *= 0.5;\n      }\n    }\n    return { T: T, initMag: initRes.mag, finalMag: curr.mag, er: curr.er, A: A, B: B, np: np, mu: mu };\n  }\n\n  function draw() {\n    var ctx = lab.ctx, W = lab.width, H = lab.height;\n    var modeDip = !!lab.values.modeDip;\n    var maxFreq = Number(lab.values.maxFreq);\n    var goodInit = !!lab.values.goodInit;\n    var muInit = Number(lab.values.muInit);\n\n    var res = solve(modeDip, maxFreq, goodInit, muInit);\n    var yMax = modeDip ? 1.5 : 2.0;\n    var px = 46, py = 22, pw = 430, ph = 184;\n    var cx = 500, cy = 22, cw = 200, ch = 184;\n\n    ctx.clearRect(0, 0, W, H);\n\n    if (maxFreq < 0.499) {\n      var mx = px + (maxFreq / 0.5) * pw;\n      ctx.fillStyle = 'rgba(245,158,11,0.10)';\n      ctx.fillRect(mx, py, px + pw - mx, ph);\n      ctx.fillStyle = '#f59e0b'; ctx.font = '11px sans-serif';\n      ctx.fillText('忽略区', mx + 4, py + 15);\n    }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    var stepsY = modeDip ? 3 : 4;\n    for (var g = 0; g <= stepsY; g++) {\n      var valY = g * 0.5;\n      var gy = py + ph - (valY / yMax) * ph;\n      ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px + pw, gy); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n      ctx.fillText(valY.toFixed(1), px - 28, gy + 4);\n    }\n    for (var f = 0; f <= 5; f++) {\n      var fx = px + (f / 5) * pw;\n      ctx.beginPath(); ctx.moveTo(fx, py); ctx.lineTo(fx, py + ph); ctx.stroke();\n      ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace';\n      ctx.fillText((f * 0.1).toFixed(1), fx - 9, py + ph + 16);\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.strokeRect(px, py, pw, ph);\n\n    ctx.save();\n    ctx.setLineDash([2, 3]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.25)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath();\n    for (var k = 0; k <= halfN; k++) {\n      var x = px + (k / halfN) * pw;\n      var y = py + ph - Math.min(yMax, res.initMag[k]) / yMax * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.save();\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.75)';\n    ctx.lineWidth = 1.6;\n    ctx.beginPath();\n    for (var k = 0; k <= halfN; k++) {\n      var x = px + (k / halfN) * pw;\n      var y = py + ph - Math.min(yMax, res.T[k]) / yMax * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.strokeStyle = modeDip ? '#38bdf8' : '#10b981';\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    for (var k = 0; k <= halfN; k++) {\n      var x = px + (k / halfN) * pw;\n      var y = py + ph - Math.min(yMax, Math.max(0, res.finalMag[k])) / yMax * ph;\n      if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc'; ctx.font = '12px sans-serif';\n    var titleStr = modeDip ? ('6 阶自定义深谷 (' + (goodInit ? '陷波初值' : '单位系统初值') + ')') : '2 阶 1/sinc(x) 补偿器';\n    ctx.fillText(titleStr + '  (浅灰=初值, 虚线=目标)', px, py - 6);\n    ctx.fillText('最终收敛系数 (' + res.np + ' 阶)', cx, cy - 6);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.03)';\n    ctx.fillRect(cx, cy, cw, ch);\n    ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n    ctx.strokeRect(cx, cy, cw, ch);\n\n    ctx.fillStyle = '#cbd5e1'; ctx.font = '11px monospace';\n    var rowY = cy + 18;\n    var maxShow = Math.min(res.np, 3);\n    for (var i = 0; i <= maxShow; i++) {\n      ctx.fillText('a' + i + ' = ' + (res.A[i] >= 0 ? ' ' : '') + res.A[i].toFixed(5), cx + 10, rowY);\n      rowY += 16;\n    }\n    rowY += 4;\n    for (var i = 1; i <= maxShow; i++) {\n      ctx.fillText('b' + i + ' = ' + (res.B[i] >= 0 ? ' ' : '') + res.B[i].toFixed(5), cx + 10, rowY);\n      rowY += 16;\n    }\n    if (res.np > 3) {\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText('... (共 ' + res.np + ' 阶)', cx + 10, rowY);\n    }\n\n    lab.setReadout((modeDip ? '自定义深谷' : '1/sinc(x)') + '  |  有效区(0~' + maxFreq.toFixed(2) + ')均方根误差 ER: ' + res.er.toFixed(4) + '  |  最终步长 MU: ' + res.mu.toFixed(4));\n  }\n\n  lab.onUpdate(draw);\n  draw();\n})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【严禁随机初始化】递归滤波器带有反馈环路，绝不能像神经网络那样用随机数初始化系数，否则极大概率直接发散；常规设计必须从单位系统（A[0]=1，其余为 0）出发。",
        "【FFT 长度与相位取舍】算法基于 FFT 计算频响（长度必须为 2 的幂），且优化目标只看幅频响应大小，相位完全顺其自然、不受控制；计算冲激响应时要把脉冲向后偏移（如第 12 点）以防递推数组越界。",
        "【学会做误差权衡】通过给不同频段乘权重（如阻带乘 8）或截断高频误差统计（如 1/sinc(x) 只算到 0.45 fs），可以在有限阶数下把精度集中到最关键的频段。",
        "【奇异目标用贴近的初值】当目标频响存在极其尖锐的陷波深谷时，从平坦的单位系统出发很容易陷入局部极小值，必须先用常规公式预置一个大致的陷波器作为起点。"
      ]
    }
  ]
});
