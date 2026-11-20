window.__BOOK_REGISTER_SECTION__("sec_230", {
  "title": "递归系统的分析：从差分方程到零极点与频响求解 (Analysis of Recursive Systems)",
  "intuition": "把时域里“自己咬自己尾巴”的递归差分方程搬到 z 域，就能像搭积木一样用零极点直接捏出想要的频率响应，再反推出一行代码就能跑的递归系数。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 从差分方程到多项式传递函数 H[z]",
      "paragraphs": [
        "在时域中，一个递归（IIR）数字滤波器的全部行为都受**差分方程（Difference Equation）**约束：当前输出 `y[n]` 不仅取决于当前和过去的输入 `x[n], x[n-1]...`，还依赖于过去的输出 `y[n-1], y[n-2]...`。这既是程序员写循环实现滤波器的蓝图，也是决定系统脉冲响应、阶跃响应和频率响应的数学根基。",
        "我们对差分方程两边同时做 z 变换，经过代数整理把输出与输入分离，得到 `H[z] = Y[z] / X[z]`，这就是系统的**传递函数（Transfer Function）**。它的第一种标准写法是**负幂多项式形式（Eq. 33-3）**：分子直接对应前馈系数 `a`，分母直接对应反馈系数 `b`。",
        "**【致命工程坑警告】** 请死死盯住分母上的减号！在 Eq. 33-3 中，`b` 系数是以**负号**（`1 - b1*z^-1 - b2*z^-2...`）进入分母的。但现实中大约有一半的教材和滤波器设计软件会在差分方程或传递函数里把 `b` 的符号写反（全用加号）。如果你直接拿别人的系数表套进自己的代码而没核对符号定义，有 50% 的概率会让极点飞出单位圆，导致滤波器瞬间**严重发散爆炸（grossly unstable）**！",
        "为什么不用大家更习惯的正幂次（如 `z^4, z^3...`）来写通用公式呢？因为在已知阶数（例如 4 阶）时，分子分母同乘 `z^4` 确实能消去负幂次；但 Eq. 33-3 必须能表达**任意未知阶数**的递归系统，因此负幂次形式和正幂次形式在 DSP 中都极为常用，必须熟练互转。"
      ],
      "formula": {
        "expr": "H[z] = (a0 + a1*z^-1 + a2*z^-2 + ...) / (1 - b1*z^-1 - b2*z^-2 - ...)",
        "explain": "a0, a1, a2... 是作用于输入信号 x[n] 的前馈递归系数（决定零点）；b1, b2... 是作用于历史输出 y[n] 的反馈递归系数（决定极点与稳定性），注意进入分母时自带负号。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 零极点形式、共轭对称与双二阶（Biquad）陷波器设计",
      "paragraphs": [
        "传递函数的第二种核心写法是**零极点形式（Eq. 33-4）**，把分子和分母分别因式分解成根的乘积。两个方向之间的转换难度完全不对称：从零极点形式（Eq. 33-4）转回递归系数形式（Eq. 33-3），只需要把括号逐项乘开并合并同类项，电脑几微秒就能算完；但反过来从高阶多项式因式分解找零极点，在超过 2 阶后一般没有解析解，只能靠数值迭代。好在**数字滤波器设计永远是从零极点出发，以递归系数结束**。",
        "零点和极点都是复数，它们有两种表示法：**极坐标** `r * e^(jω)` 最契合 z 平面的环形几何直觉（角度 `ω` 决定频率位置，半径 `r` 决定到单位圆的距离）；**直角坐标** `σ + jω` 则最方便展开括号做代数运算。",
        "书中以**陷波滤波器（Notch Filter）**为例演示了标准四步设计法：假设想在采样率的 `0.125` 倍处（即 `ω = π/4`）精准挖掉一个干扰频点。第 1 步，在单位圆上放置一对共轭零点 `z1,2 = 1.00 * e^(±jπ/4)`（迫使该频率处增益严格归零），再在相同角度内侧紧挨着放置一对共轭极点 `p1,2 = 0.90 * e^(±jπ/4)`（把其他频率的响应迅速拉回 `1`，极点越靠近零点，陷波越尖锐）。",
        "第 2 步，代入 Eq. 33-4 展开。只要系统具有实数脉冲响应，z 平面上下半平面就必然互为镜像共轭，展开后所有带虚数 `j` 的交叉项都会**自动完美抵消**！第 3 步，分子分母同除以最高次幂 `z^2` 化为负幂次标准型：`H[z] = (1.000 - 1.414z^-1 + 1.000z^-2) / (1.000 - 1.273z^-1 + 0.810z^-2)`。第 4 步，直接读出系数：`a0=1, a1=-1.414, a2=1, b1=1.273, b2=-0.810`。对于这种两极点两零点的经典结构——**双二阶滤波器（Biquad）**，我们可以直接用 Eq. 33-5 的五条公式一步算出全部系数。"
      ],
      "formula": {
        "expr": "a0 = 1,  a1 = -2*r0*cos(ω0),  a2 = r0^2,  b1 = 2*rp*cos(ωp),  b2 = -rp^2",
        "explain": "Biquad 双二阶快捷设计公式（Eq. 33-5）：(r0, ω0) 是零点的极坐标半径与角度，(rp, ωp) 是极点的极坐标半径与角度（rp < 1 保证稳定）。只需这五个系数即可直接写出差分方程代码。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：z 平面零极点捏出陷波器 & 体验“b 符号写反”发散灾难",
      "instruction": "拖动频率、极点半径 rp 和零点半径 r0 观察零极点如何塑造时域脉冲响应与频响；点击“反转 b 系数符号”亲眼见证真实极点飞出单位圆导致系统爆炸。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "陷波中心频率 (ω / 2π)",
          "min": 0.05,
          "max": 0.45,
          "step": 0.005,
          "value": 0.125,
          "unit": " fs"
        },
        {
          "type": "slider",
          "id": "rp",
          "label": "极点半径 rp (决定陷波窄度)",
          "min": 0.5,
          "max": 0.98,
          "step": 0.01,
          "value": 0.9,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "r0",
          "label": "零点半径 r0 (1.00=彻底归零)",
          "min": 0.7,
          "max": 1,
          "step": 0.01,
          "value": 1,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "flipB",
          "label": "模拟工程踩坑：反转 b 系数符号",
          "value": false
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var freq = lab.values.freq;\n  var rp = lab.values.rp;\n  var r0 = lab.values.r0;\n  var flip = lab.values.flipB;\n  var w = 2 * Math.PI * freq;\n\n  var a0 = 1;\n  var a1 = -2 * r0 * Math.cos(w);\n  var a2 = r0 * r0;\n  var b1 = (flip ? -1 : 1) * (2 * rp * Math.cos(w));\n  var b2 = (flip ? -1 : 1) * (-rp * rp);\n\n  var disc = b1 * b1 + 4 * b2;\n  var poles = [];\n  var maxP = 0;\n  if (disc >= 0) {\n    var sq = Math.sqrt(disc);\n    var p1 = (b1 + sq) / 2;\n    var p2 = (b1 - sq) / 2;\n    poles.push({ re: p1, im: 0 });\n    poles.push({ re: p2, im: 0 });\n    maxP = Math.max(Math.abs(p1), Math.abs(p2));\n  } else {\n    var sqi = Math.sqrt(-disc) / 2;\n    poles.push({ re: b1 / 2, im: sqi });\n    poles.push({ re: b1 / 2, im: -sqi });\n    maxP = Math.sqrt((b1 * b1 - disc) / 4);\n  }\n  var unstable = maxP >= 0.9999;\n\n  // Panel 1: z-plane (x: 10..225)\n  var cx = 115, cy = 122, R = 52;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.beginPath();\n  ctx.moveTo(cx - 95, cy); ctx.lineTo(cx + 95, cy);\n  ctx.moveTo(cx, cy - 95); ctx.lineTo(cx, cy + 95);\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, 2 * Math.PI);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('a. z 平面零极点图', 16, 18);\n  ctx.fillText('Re', cx + 78, cy - 4);\n  ctx.fillText('Im', cx + 4, cy - 82);\n\n  // Draw Zeros\n  var zr = r0 * Math.cos(w), zi = r0 * Math.sin(w);\n  var zeros = [{ re: zr, im: zi }, { re: zr, im: -zi }];\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  for (var k = 0; k < zeros.length; k++) {\n    var zx = cx + zeros[k].re * R;\n    var zy = cy - zeros[k].im * R;\n    ctx.beginPath();\n    ctx.arc(zx, zy, 5, 0, 2 * Math.PI);\n    ctx.stroke();\n  }\n\n  // Draw Poles\n  ctx.strokeStyle = unstable ? '#ec4899' : '#f59e0b';\n  ctx.lineWidth = 2;\n  for (var k = 0; k < poles.length; k++) {\n    var px = cx + poles[k].re * R;\n    var py = cy - poles[k].im * R;\n    if (px < 12) px = 12;\n    if (px > 218) px = 218;\n    ctx.beginPath();\n    ctx.moveTo(px - 4.5, py - 4.5); ctx.lineTo(px + 4.5, py + 4.5);\n    ctx.moveTo(px - 4.5, py + 4.5); ctx.lineTo(px + 4.5, py - 4.5);\n    ctx.stroke();\n  }\n\n  // Panel 2: Impulse response h[n] (x: 240..470)\n  var ix0 = 248, iw = 215, iyTop = 34, iyBot = 214;\n  var iyZero = 154;\n  var iScale = 58;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = iyTop + (iyBot - iyTop) * g / 4;\n    ctx.beginPath(); ctx.moveTo(ix0, gy); ctx.lineTo(ix0 + iw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.beginPath(); ctx.moveTo(ix0, iyZero); ctx.lineTo(ix0 + iw, iyZero); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('b. 脉冲响应 h[n] (n=0..35)', ix0, 18);\n\n  var hArr = [];\n  var x1 = 0, x2 = 0, y1 = 0, y2 = 0;\n  var overflow = false;\n  for (var n = 0; n <= 35; n++) {\n    var xn = (n === 0) ? 1 : 0;\n    var yn = a0 * xn + a1 * x1 + a2 * x2 + b1 * y1 + b2 * y2;\n    x2 = x1; x1 = xn;\n    y2 = y1; y1 = yn;\n    if (Math.abs(yn) > 2.2) overflow = true;\n    hArr.push(yn);\n  }\n\n  ctx.strokeStyle = unstable ? '#ec4899' : '#10b981';\n  ctx.fillStyle = unstable ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 1.5;\n  for (var n = 0; n < hArr.length; n++) {\n    var sx = ix0 + (n / 35) * iw;\n    var val = Math.max(-1.0, Math.min(2.0, hArr[n]));\n    var sy = iyZero - val * iScale;\n    ctx.beginPath(); ctx.moveTo(sx, iyZero); ctx.lineTo(sx, sy); ctx.stroke();\n    ctx.fillRect(sx - 2, sy - 2, 4, 4);\n  }\n  if (overflow) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('! 发散爆炸 (|p|=' + maxP.toFixed(2) + ' > 1)', ix0 + 28, 48);\n  }\n\n  // Panel 3: Frequency response |H(w)| (x: 490..705)\n  var fx0 = 492, fw = 212, fyTop = 34, fyBot = 214;\n  var fScale = (fyBot - fyTop) / 1.5;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 3; g++) {\n    var gy = fyBot - g * 0.5 * fScale;\n    ctx.beginPath(); ctx.moveTo(fx0, gy); ctx.lineTo(fx0 + fw, gy); ctx.stroke();\n  }\n  for (var g = 0; g <= 5; g++) {\n    var gx = fx0 + fw * g / 5;\n    ctx.beginPath(); ctx.moveTo(gx, fyTop); ctx.lineTo(gx, fyBot); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('c. 频率响应 |H(ω)| (0 ~ 0.5 fs)', fx0, 18);\n\n  ctx.strokeStyle = unstable ? 'rgba(236,72,153,0.6)' : '#38bdf8';\n  ctx.lineWidth = 2;\n  if (unstable) ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= fw; i++) {\n    var om = Math.PI * (i / fw);\n    var c1 = Math.cos(om), s1 = Math.sin(om);\n    var c2 = Math.cos(2 * om), s2 = Math.sin(2 * om);\n    var nr = a0 + a1 * c1 + a2 * c2;\n    var ni = -a1 * s1 - a2 * s2;\n    var dr = 1 - b1 * c1 - b2 * c2;\n    var di = b1 * s1 + b2 * s2;\n    var mag = Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di + 1e-12));\n    var py = fyBot - Math.min(1.5, mag) * fScale;\n    if (i === 0) ctx.moveTo(fx0 + i, py); else ctx.lineTo(fx0 + i, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  var notchX = fx0 + (freq / 0.5) * fw;\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.beginPath(); ctx.moveTo(notchX, fyTop); ctx.lineTo(notchX, fyBot); ctx.stroke();\n\n  if (unstable) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('系统不稳定：单位圆频响已失效', fx0 + 18, 52);\n  }\n\n  lab.setReadout(\n    'a=[' + a0.toFixed(2) + ', ' + a1.toFixed(3) + ', ' + a2.toFixed(3) + '] | ' +\n    'b1=' + b1.toFixed(3) + ', b2=' + b2.toFixed(3) + ' | ' +\n    '最大极点模 |p|_max = ' + maxP.toFixed(3) + (unstable ? ' (已失稳!)' : ' (稳定)')\n  );\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "3. 求取频率响应的三条路径与“截断检验法则”",
      "paragraphs": [
        "拿到传递函数或递归系数后，如何算出它的**频率响应**？书中给出了三条截然不同的路径：一条解析数学路，两条编程计算路。",
        "**方法 1（纯数学解析法）**：令半径 `r = 1`，直接把传递函数 `H(z)` 中的每个 `z` 替换为 `e^(-jω)`，得到精确的频率响应公式 `H(ω)`。这在理论推导上最严格，但化简复数模长与相角需要极其繁琐的三角代数，几乎无法在通用滤波设计软件中自动化。",
        "**方法 2（单位圆离散采样法）**：软件在 `ω = 0` 到 `ω = π` 之间均匀取 1000 个离散频点，像蚂蚁沿着上半单位圆爬行一样，逐点把 `z = e^(jω)` 代入传递函数算出幅度和相位。这种方法简单快捷，几乎所有设计软件都在用，但它有一个**致命盲区**：它假定无限精度计算，**完全没有考虑量化舍入误差（round-off noise）对实际系统的影响**。很多时候方法 2 画出的频响完美无瑕，但系数放进定点/有限字长芯片一跑就彻底发散失稳！",
        "**方法 3（真实冲激响应 + FFT 法）**：老老实实用最终上线运行的那套递归系数，往系统里喂一个单位脉冲 `δ[n]` 算出真实的脉冲响应 `h[n]`，然后截取前 `N` 个样本做 **DFT/FFT**。这个方法能真实反映量化误差与系统稳定性，唯一的陷阱在于**截断长度 `N` 是否足够**——必须保证被丢弃的尾部样本已经衰减到微不足道。书里给出了一招比理论公式更管用的工程验证法则：**先把 `N` 设成你觉得够大的数算一遍频响，再把 `N` 翻倍算第二遍；只要两条曲线长得几乎一模一样，就证明没有发生截断失真**。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：实时音频陷波消噪 + FFT 截断翻倍检验",
      "instruction": "打开声音先听一段带有刺耳单频啸叫的音乐和弦，微调陷波频率对准干扰频率即可瞬间消噪；拖动 FFT 样本数 N，观察方法 3（绿线）何时收敛到方法 2（蓝线）。",
      "controls": [
        {
          "type": "slider",
          "id": "sigFreq",
          "label": "干扰啸叫频率",
          "min": 300,
          "max": 1500,
          "step": 10,
          "value": 750,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "notchFreq",
          "label": "陷波器中心频率",
          "min": 300,
          "max": 1500,
          "step": 10,
          "value": 750,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "rp",
          "label": "极点半径 rp (越接近1拖尾越长)",
          "min": 0.7,
          "max": 0.98,
          "step": 0.01,
          "value": 0.94,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "nSamples",
          "label": "方法3截取样本数 N",
          "min": 16,
          "max": 256,
          "step": 8,
          "value": 32,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁通滤波器（对比原始含噪声音）",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放实时陷波实验音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var audioCtx = null;\nvar procNode = null;\nvar gainNode = null;\nvar phaseSig = 0, phase1 = 0, phase2 = 0, phase3 = 0;\nvar ax1 = 0, ax2 = 0, ay1 = 0, ay2 = 0;\n\nfunction syncAudio() {\n  if (lab.values.play) {\n    if (!audioCtx) audioCtx = lab.getAudioContext();\n    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n    if (audioCtx && !procNode) {\n      procNode = audioCtx.createScriptProcessor(1024, 1, 1);\n      gainNode = audioCtx.createGain();\n      gainNode.gain.value = 0.32;\n      procNode.onaudioprocess = function(e) {\n        var out = e.outputBuffer.getChannelData(0);\n        var fs = audioCtx.sampleRate || 44100;\n        var sigF = lab.values.sigFreq;\n        var nF = lab.values.notchFreq;\n        var rpA = 1 - (1 - lab.values.rp) * 0.15;\n        var wN = 2 * Math.PI * nF / fs;\n        var a0 = 1, a1 = -2 * Math.cos(wN), a2 = 1;\n        var b1 = 2 * rpA * Math.cos(wN), b2 = -rpA * rpA;\n        var dSig = 2 * Math.PI * sigF / fs;\n        var d1 = 2 * Math.PI * 110 / fs;\n        var d2 = 2 * Math.PI * 165 / fs;\n        var d3 = 2 * Math.PI * 220 / fs;\n        var bypass = lab.values.bypass;\n        for (var i = 0; i < out.length; i++) {\n          var x = 0.36 * Math.sin(phaseSig) + 0.15 * Math.sin(phase1) + 0.12 * Math.sin(phase2) + 0.10 * Math.sin(phase3);\n          phaseSig = (phaseSig + dSig) % (2 * Math.PI);\n          phase1 = (phase1 + d1) % (2 * Math.PI);\n          phase2 = (phase2 + d2) % (2 * Math.PI);\n          phase3 = (phase3 + d3) % (2 * Math.PI);\n          var y = a0 * x + a1 * ax1 + a2 * ax2 + b1 * ay1 + b2 * ay2;\n          ax2 = ax1; ax1 = x;\n          ay2 = ay1; ay1 = y;\n          if (!isFinite(ay1)) { ax1 = 0; ax2 = 0; ay1 = 0; ay2 = 0; y = x; }\n          out[i] = bypass ? x : y;\n        }\n      };\n      procNode.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n    }\n  } else {\n    if (procNode) { try { procNode.disconnect(); } catch (err) {} procNode = null; }\n    if (gainNode) { try { gainNode.disconnect(); } catch (err) {} gainNode = null; }\n  }\n}\n\nfunction draw() {\n  syncAudio();\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var fsVis = 4000;\n  var notchFreq = lab.values.notchFreq;\n  var sigFreq = lab.values.sigFreq;\n  var rp = lab.values.rp;\n  var N = lab.values.nSamples;\n\n  var w = 2 * Math.PI * notchFreq / fsVis;\n  var a0 = 1, a1 = -2 * Math.cos(w), a2 = 1;\n  var b1 = 2 * rp * Math.cos(w), b2 = -rp * rp;\n\n  var maxN = 256;\n  var h = [];\n  var x1 = 0, x2 = 0, y1 = 0, y2 = 0;\n  for (var n = 0; n < maxN; n++) {\n    var xn = (n === 0) ? 1 : 0;\n    var yn = a0 * xn + a1 * x1 + a2 * x2 + b1 * y1 + b2 * y2;\n    x2 = x1; x1 = xn;\n    y2 = y1; y1 = yn;\n    h.push(yn);\n  }\n\n  // Left panel: Impulse response & truncation boundary (x: 16..330)\n  var lx = 18, lw = 305, lyTop = 34, lyBot = 212, lyZero = 148;\n  var lScale = 140;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = lyTop + (lyBot - lyTop) * g / 4;\n    ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.beginPath(); ctx.moveTo(lx, lyZero); ctx.lineTo(lx + lw, lyZero); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('冲激响应 h[n] 截取前 N=' + N + ' 点 (其余截断丢弃)', lx, 18);\n\n  for (var n = 0; n < maxN; n++) {\n    var sx = lx + (n / maxN) * lw;\n    var val = Math.max(-0.45, Math.min(0.85, h[n]));\n    var sy = lyZero - val * lScale;\n    ctx.strokeStyle = (n < N) ? '#10b981' : 'rgba(248,250,252,0.18)';\n    ctx.beginPath(); ctx.moveTo(sx, lyZero); ctx.lineTo(sx, sy); ctx.stroke();\n  }\n\n  var cutX = lx + (N / maxN) * lw;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(cutX, lyTop); ctx.lineTo(cutX, lyBot); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('截断线 N=' + N, Math.min(cutX + 4, lx + lw - 75), lyTop + 12);\n\n  // Right panel: Method 2 vs Method 3 Frequency Response (x: 356..704)\n  var rx = 356, rw = 344, ryTop = 34, ryBot = 212;\n  var rScale = (ryBot - ryTop) / 1.3;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 4; g++) {\n    var gy = ryBot - g * 0.3 * rScale;\n    ctx.beginPath(); ctx.moveTo(rx, gy); ctx.lineTo(rx + rw, gy); ctx.stroke();\n  }\n  for (var fMark = 0; fMark <= 2000; fMark += 500) {\n    var fx = rx + (fMark / 2000) * rw;\n    ctx.beginPath(); ctx.moveTo(fx, ryTop); ctx.lineTo(fx, ryBot); ctx.stroke();\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(fMark + 'Hz', fx - 12, ryBot + 14);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('方法2精确单位圆(蓝) vs 方法3截断FFT(绿)', rx, 18);\n\n  // Interference frequency marker\n  var sigX = rx + (sigFreq / 2000) * rw;\n  ctx.strokeStyle = 'rgba(236,72,153,0.75)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath(); ctx.moveTo(sigX, ryTop); ctx.lineTo(sigX, ryBot); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('干扰 ' + sigFreq + 'Hz', Math.min(sigX + 4, rx + rw - 72), ryTop + 12);\n\n  var bins = 172;\n  var m2Points = [];\n  var m3Points = [];\n  var maxErr = 0;\n\n  for (var b = 0; b <= bins; b++) {\n    var f = (b / bins) * 2000;\n    var om = 2 * Math.PI * f / fsVis;\n    var c1 = Math.cos(om), s1 = Math.sin(om);\n    var c2 = Math.cos(2 * om), s2 = Math.sin(2 * om);\n    var nr = a0 + a1 * c1 + a2 * c2;\n    var ni = -a1 * s1 - a2 * s2;\n    var dr = 1 - b1 * c1 - b2 * c2;\n    var di = b1 * s1 + b2 * s2;\n    var mag2 = Math.sqrt((nr * nr + ni * ni) / (dr * dr + di * di + 1e-12));\n\n    var dftR = 0, dftI = 0;\n    for (var n = 0; n < N; n++) {\n      var ang = om * n;\n      dftR += h[n] * Math.cos(ang);\n      dftI -= h[n] * Math.sin(ang);\n    }\n    var mag3 = Math.sqrt(dftR * dftR + dftI * dftI);\n    maxErr = Math.max(maxErr, Math.abs(mag2 - mag3));\n    m2Points.push(mag2);\n    m3Points.push(mag3);\n  }\n\n  // Draw Method 2 (Cyan)\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var b = 0; b <= bins; b++) {\n    var px = rx + (b / bins) * rw;\n    var py = ryBot - Math.min(1.3, m2Points[b]) * rScale;\n    if (b === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  // Draw Method 3 (Emerald)\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var b = 0; b <= bins; b++) {\n    var px = rx + (b / bins) * rw;\n    var py = ryBot - Math.min(1.3, m3Points[b]) * rScale;\n    if (b === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var tailAmp = Math.pow(rp, N);\n  var diffHz = Math.abs(sigFreq - notchFreq);\n  lab.setReadout(\n    '频率偏差: ' + diffHz + ' Hz | 截断处残余幅度 rp^N = ' + (tailAmp * 100).toFixed(1) + '% | ' +\n    '两条频响最大误差: ' + maxErr.toFixed(3) + (maxErr > 0.08 ? ' (N太小，建议翻倍!)' : ' (截断误差已收敛)')\n  );\n}\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【b 系数符号核查第一条】拿到任何第三方滤波器系数表时，第一件事不是写代码，而是确认它分母的 b 系数是正号还是负号（Eq. 33-3 带负号）；搞反有 50% 概率直接把极点甩出单位圆导致系统发散。",
        "【设计流向不可逆】高阶多项式因式分解没有通用解析解，所以工业界设计永远是从 z 平面零极点（Eq. 33-4）起步，展开合并得到递归系数（Eq. 33-3），几乎从不逆向硬解高阶根。",
        "【实脉冲响应自带实系数保证】只要零极点关于实轴上下共轭对称，展开传递函数时所有虚数 j 项必然自动抵消，最终得到纯实数递归系数。",
        "【频响双验证防坑术】单位圆采样法（方法 2）看不见量化舍入误差导致的失稳；务必用真实部署的递归系数跑冲激响应做 FFT（方法 3），并且把采样点数 N 翻倍再算一遍——两条曲线重合了才算真正安全。"
      ]
    }
  ]
});
