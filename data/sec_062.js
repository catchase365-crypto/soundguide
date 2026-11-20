window.__BOOK_REGISTER_SECTION__("sec_062", {
  "title": "非线性系统的线性化策略 (Alternatives to Linearity)",
  "intuition": "现实世界到处是非线性，但人类并没有通用的非线性分析工具——唯一有效的破局之道，就是想办法把非线性系统“伪装”成线性系统来对待。",
  "blocks": [
    {
      "type": "concept",
      "heading": "面对非线性的唯一总策略，与策略一：忽略微小非线性",
      "paragraphs": [
        "为什么上一节花费如此大篇幅强调线性系统与叠加原理？因为面对**非线性系统（Nonlinear Systems）**，信号处理领域其实只有**唯一一种**通用的宏观分析策略：**让非线性系统看起来尽可能像一个线性系统**。",
        "实现这一策略的第一种常见做法最简单粗暴——**直接忽略非线性（Ignore the nonlinearity）**。如果系统的非线性畸变足够小，我们就可以直接把它近似为线性系统来建模和设计滤波器。",
        "当然，忽略并不代表误差真的消失了。由“线性假设”带来的残余偏差依然存在，但在工程上只要它足够小，我们就可以把它当作背景**噪声（Noise）**来容忍，或者干脆忽略不计。"
      ],
      "formula": {
        "expr": "y[n] = T{x[n]} ≈ L{x[n]} + e[n]",
        "explain": "T{·} 是真实的非线性系统，L{·} 是我们近似用的线性系统，e[n] 是非线性带来的残余误差；当 |e[n]| 远小于信号本身时，可直接把它当噪声处理。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：小信号近似与非线性失真听觉对比",
      "instruction": "拖动“输入信号幅度”和“非线性强度”，观察红色工作窗口如何决定波形是否削顶失真；点击播放按钮，亲耳对比小信号时的纯净正弦波与大信号时的刺耳谐波失真。",
      "controls": [
        {
          "type": "slider",
          "id": "amp",
          "label": "输入信号幅度 (微弱信号 → 大信号)",
          "min": 0.05,
          "max": 2,
          "step": 0.05,
          "value": 1.2,
          "unit": " V"
        },
        {
          "type": "slider",
          "id": "nonlin",
          "label": "系统非线性强度 k",
          "min": 0,
          "max": 4,
          "step": 0.1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "normalize",
          "label": "等比例放大对比小信号",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比测试音 (220Hz)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nvar audioCtx = null;\nvar osc = null;\nvar shaper = null;\nvar masterGain = null;\nvar audioReady = false;\n\nfunction nlFunc(u, k) {\n  if (k < 0.001) return u;\n  return Math.tanh(k * u) / k;\n}\n\nfunction buildCurve(amp, k) {\n  var len = 1025;\n  var curve = new Float32Array(len);\n  for (var i = 0; i < len; i++) {\n    var u = (i * 2) / (len - 1) - 1;\n    var x = amp * u;\n    curve[i] = nlFunc(x, k) / amp;\n  }\n  return curve;\n}\n\nfunction ensureAudio() {\n  if (audioReady) return;\n  audioCtx = lab.getAudioContext();\n  osc = audioCtx.createOscillator();\n  osc.type = 'sine';\n  osc.frequency.value = 220;\n  shaper = audioCtx.createWaveShaper();\n  shaper.oversample = '4x';\n  masterGain = audioCtx.createGain();\n  masterGain.gain.value = 0.0;\n  osc.connect(shaper);\n  shaper.connect(masterGain);\n  masterGain.connect(audioCtx.destination);\n  osc.start();\n  audioReady = true;\n}\n\nfunction render() {\n  var amp = lab.values.amp;\n  var k = lab.values.nonlin;\n  var norm = lab.values.normalize;\n  var playing = lab.values.play;\n\n  if (playing) {\n    ensureAudio();\n    if (audioCtx.state === 'suspended') audioCtx.resume();\n    shaper.curve = buildCurve(amp, k);\n    masterGain.gain.setTargetAtTime(0.16, audioCtx.currentTime, 0.02);\n  } else if (audioReady) {\n    masterGain.gain.setTargetAtTime(0.0, audioCtx.currentTime, 0.02);\n    shaper.curve = buildCurve(amp, k);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  var boxX = 24, boxY = 24, boxS = 190;\n  var cx = boxX + boxS / 2;\n  var cy = boxY + boxS / 2;\n  var range = 2.2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = -2; g <= 2; g++) {\n    var gx = cx + (g / range) * (boxS / 2);\n    var gy = cy - (g / range) * (boxS / 2);\n    ctx.beginPath(); ctx.moveTo(gx, boxY); ctx.lineTo(gx, boxY + boxS); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(boxX, gy); ctx.lineTo(boxX + boxS, gy); ctx.stroke();\n  }\n\n  var bandW = (amp / range) * (boxS / 2);\n  ctx.fillStyle = 'rgba(236,72,153,0.14)';\n  ctx.fillRect(cx - bandW, boxY, bandW * 2, boxS);\n  ctx.strokeStyle = 'rgba(236,72,153,0.5)';\n  ctx.beginPath(); ctx.moveTo(cx - bandW, boxY); ctx.lineTo(cx - bandW, boxY + boxS); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(cx + bandW, boxY); ctx.lineTo(cx + bandW, boxY + boxS); ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath();\n  ctx.moveTo(boxX, boxY + boxS);\n  ctx.lineTo(boxX + boxS, boxY);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var px = 0; px <= boxS; px += 2) {\n    var ux = ((px / boxS) * 2 - 1) * range;\n    var uy = nlFunc(ux, k);\n    var py = cy - (uy / range) * (boxS / 2);\n    if (px === 0) ctx.moveTo(boxX + px, py); else ctx.lineTo(boxX + px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(boxX, boxY, boxS, boxS);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('传递曲线 y=f(x) 与工作区间', boxX, 16);\n\n  var wx = 248, wy = 24, ww = 448, wh = 190;\n  var wcy = wy + wh / 2;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = 0; i <= 4; i++) {\n    var yy = wy + (i / 4) * wh;\n    ctx.beginPath(); ctx.moveTo(wx, yy); ctx.lineTo(wx + ww, yy); ctx.stroke();\n  }\n  for (var j = 0; j <= 8; j++) {\n    var xx = wx + (j / 8) * ww;\n    ctx.beginPath(); ctx.moveTo(xx, wy); ctx.lineTo(xx, wy + wh); ctx.stroke();\n  }\n  ctx.strokeRect(wx, wy, ww, wh);\n\n  var scaleY = norm ? (1 / amp) : (1 / 2.2);\n  var N = 256;\n  var sumY2 = 0;\n  var sumB1 = 0;\n  var sumErr2 = 0;\n  var sumX2 = 0;\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var n = 0; n <= N; n++) {\n    var ph = (n / N) * 2 * Math.PI * 2;\n    var xv = amp * Math.sin(ph);\n    var pyIn = wcy - xv * scaleY * (wh * 0.42);\n    var pxIn = wx + (n / N) * ww;\n    if (n === 0) ctx.moveTo(pxIn, pyIn); else ctx.lineTo(pxIn, pyIn);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var n2 = 0; n2 <= N; n2++) {\n    var ph2 = (n2 / N) * 2 * Math.PI * 2;\n    var x2 = amp * Math.sin(ph2);\n    var y2 = nlFunc(x2, k);\n    var pyOut = wcy - y2 * scaleY * (wh * 0.42);\n    var pxOut = wx + (n2 / N) * ww;\n    if (n2 === 0) ctx.moveTo(pxOut, pyOut); else ctx.lineTo(pxOut, pyOut);\n    if (n2 < N) {\n      sumY2 += y2 * y2;\n      sumB1 += y2 * Math.sin(ph2);\n      var d = y2 - x2;\n      sumErr2 += d * d;\n      sumX2 += x2 * x2;\n    }\n  }\n  ctx.stroke();\n\n  var b1 = (2 / N) * sumB1;\n  var rmsY = Math.sqrt(sumY2 / N);\n  var rmsFund = Math.abs(b1) / Math.SQRT2;\n  var rmsHarm = Math.sqrt(Math.max(0, rmsY * rmsY - rmsFund * rmsFund));\n  var thd = rmsFund > 1e-6 ? (rmsHarm / rmsFund) * 100 : 0;\n  var gainDrop = amp > 1e-6 ? (1 - Math.abs(b1) / amp) * 100 : 0;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(norm ? '时域波形对比 (已按输入幅度等比例放大)' : '时域波形对比 (原始绝对幅度)', wx, 16);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('-- 理想线性输出', wx + 18, H - 8);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 实际非线性输出', wx + 138, H - 8);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('■ 信号工作区间: ±' + amp.toFixed(2) + 'V', boxX, H - 8);\n\n  lab.setReadout('谐波失真 THD: ' + thd.toFixed(2) + '%  |  非线性增益压缩: ' + Math.max(0, gainDrop).toFixed(1) + '%  |  结论: ' + (thd < 1.5 ? '近似完美线性' : (thd < 8 ? '轻微失真' : '严重饱和削波'))); \n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "策略二：把信号压到极小（晶体管与运放的“线性魔法”）",
      "paragraphs": [
        "第二种策略叫做**保持信号极小（Keep the signals very small）**。只要一条曲线在局部是光滑的，当你用放大镜无限放大其中极小的一段时，任何弯曲的曲线都会退化成一条笔直的斜线。",
        "电子工程把这一思想发挥到了极致。例如**晶体管（Transistors）**在全量程范围内其实是高度非线性的，但只要我们把输入信号幅度控制在**几个毫伏（millivolts）**以内，它就能提供相当精准的线性放大。",
        "而**运算放大器（Operational Amplifiers, Op-Amp）**更是把这一技巧推向了巅峰：它利用极高的开环增益（Open-loop gain）配合**负反馈（Negative feedback）**，把运放两个输入端（反相端与同相端）之间的真实压差死死按在**几微伏（microvolts）**的量级。正是这微不足道的输入信号，让一个内部极其“狰狞”的非线性电路，对外表现出近乎完美的线性度。"
      ],
      "formula": {
        "expr": "Δy = f(x₀ + Δx) - f(x₀) ≈ f'(x₀) · Δx   (|Δx| ≪ 1)",
        "explain": "x₀ 是静态偏置点，Δx 是微小的输入信号变化量，f'(x₀) 是该点处切线的斜率（即小信号线性增益）。只要 |Δx| 足够小，非线性高次项就会迅速趋近于零。"
      }
    },
    {
      "type": "concept",
      "heading": "策略三：线性化变换——同态信号处理 (Homomorphic Processing)",
      "paragraphs": [
        "如果非线性本身非常剧烈，信号又不能缩到极小，我们还有第三张王牌：**施加线性化变换（Apply a linearizing transform）**。",
        "最经典的例子是两个信号**相乘**：`a[n] = b[n] × c[n]`。乘法是一种典型的非线性混合操作，普通的线性滤波器根本无法把乘在一起的两个成分干净拆开。但只要我们对信号取**对数（Logarithm）**，乘法瞬间就会被“翻译”成线性的**加法**：`log(a[n]) = log(b[n]) + log(c[n])`。这套先取对数、做线性处理、再取指数还原的方法，有一个很酷的名字——**同态信号处理（Homomorphic signal processing）**。",
        "在图像处理中，同态滤波极为常见：相机拍到的一张照片，本质上是**场景反射率（Reflectivity）**（代表物体本身的纹理与颜色）与**环境光照（Ambient illumination）**（代表明暗不均的光影分布）逐像素**相乘**的结果。通过取对数将两者变成加法后，光照就成了缓慢变化的“低频加法分量”，用线性高通滤波器压制它，就能把阴影处变亮、强光处压暗，让整张照片的光照瞬间变得均匀！"
      ],
      "formula": {
        "expr": "log(a[n]) = log(b[n] × c[n]) = log(b[n]) + log(c[n])",
        "explain": "a[n] 是观测到的乘性混合信号，b[n] 与 c[n] 是相乘的两个原始信号（如图像中的“反射率”与“光照”）；log(·) 变换把棘手的乘法变成了可被线性滤波器直接拆分的加法。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：同态滤波实战——用对数拯救“阴阳脸”阴影图像",
      "instruction": "调大“光照不均强度”观察右侧条纹如何被阴影压扁；切换“开启对数同态处理”，对比普通线性滤波与同态滤波（log → 线性滤波 → exp）还原条纹对比度的巨大差异。",
      "controls": [
        {
          "type": "slider",
          "id": "shadow",
          "label": "光照不均强度 (左侧强光→右侧阴影)",
          "min": 0.1,
          "max": 0.9,
          "step": 0.05,
          "value": 0.75,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "cutoff",
          "label": "低频光照剥离强度",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.9,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "homomorphic",
          "label": "开启对数同态处理 (关闭=普通线性滤波)",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction smoothLpf(arr) {\n  var N = arr.length;\n  var out = new Float64Array(N);\n  var half = 20;\n  for (var n = 0; n < N; n++) {\n    var acc = 0;\n    for (var k = -half; k < half; k++) {\n      var idx = n + k;\n      if (idx < 0) idx = -idx;\n      if (idx >= N) idx = 2 * N - 2 - idx;\n      acc += arr[idx];\n    }\n    out[n] = acc / (half * 2);\n  }\n  return out;\n}\n\nfunction render() {\n  var shadow = lab.values.shadow;\n  var cutoff = lab.values.cutoff;\n  var homo = lab.values.homomorphic;\n\n  var N = 240;\n  var r = new Float64Array(N);\n  var illum = new Float64Array(N);\n  var a = new Float64Array(N);\n  var logA = new Float64Array(N);\n\n  for (var n = 0; n < N; n++) {\n    var t = n / (N - 1);\n    var pat = Math.tanh(3.5 * Math.cos(2 * Math.PI * 6 * t));\n    r[n] = 0.575 + 0.325 * pat;\n    illum[n] = 1.0 - shadow * (0.5 - 0.5 * Math.cos(Math.PI * t));\n    a[n] = r[n] * illum[n];\n    logA[n] = Math.log(Math.max(1e-4, a[n]));\n  }\n\n  var out = new Float64Array(N);\n  if (homo) {\n    var estLogI = smoothLpf(logA);\n    var maxLogI = -1e9;\n    for (var n1 = 0; n1 < N; n1++) {\n      if (estLogI[n1] > maxLogI) maxLogI = estLogI[n1];\n    }\n    for (var n2 = 0; n2 < N; n2++) {\n      var logOut = logA[n2] - cutoff * (estLogI[n2] - maxLogI);\n      out[n2] = Math.min(1.05, Math.exp(logOut));\n    }\n  } else {\n    var estI = smoothLpf(a);\n    var maxI = -1e9;\n    for (var n3 = 0; n3 < N; n3++) {\n      if (estI[n3] > maxI) maxI = estI[n3];\n    }\n    for (var n4 = 0; n4 < N; n4++) {\n      out[n4] = Math.max(0, Math.min(1.05, a[n4] - cutoff * (estI[n4] - maxI)));\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  var px = 56, pw = 640;\n  var strip1Y = 18, stripH = 22;\n  var strip2Y = 50;\n\n  for (var i = 0; i < N; i++) {\n    var x0 = px + (i / N) * pw;\n    var bw = Math.ceil(pw / N) + 1;\n    var g1 = Math.round(Math.max(0, Math.min(1, a[i])) * 255);\n    ctx.fillStyle = 'rgb(' + g1 + ',' + g1 + ',' + g1 + ')';\n    ctx.fillRect(x0, strip1Y, bw, stripH);\n\n    var g2 = Math.round(Math.max(0, Math.min(1, out[i])) * 255);\n    ctx.fillStyle = 'rgb(' + g2 + ',' + g2 + ',' + g2 + ')';\n    ctx.fillRect(x0, strip2Y, bw, stripH);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(px, strip1Y, pw, stripH);\n  ctx.strokeRect(px, strip2Y, pw, stripH);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('原图', 14, strip1Y + 15);\n  ctx.fillStyle = homo ? '#10b981' : '#f59e0b';\n  ctx.fillText(homo ? '同态后' : '线性后', 14, strip2Y + 15);\n\n  var gy = 86, gh = 122;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  for (var rline = 0; rline <= 4; rline++) {\n    var yy = gy + (rline / 4) * gh;\n    ctx.beginPath(); ctx.moveTo(px, yy); ctx.lineTo(px + pw, yy); ctx.stroke();\n  }\n  for (var cline = 0; cline <= 8; cline++) {\n    var xx = px + (cline / 8) * pw;\n    ctx.beginPath(); ctx.moveTo(xx, gy); ctx.lineTo(xx, gy + gh); ctx.stroke();\n  }\n  ctx.strokeRect(px, gy, pw, gh);\n\n  function plotArr(arr, color, width, dashed) {\n    ctx.strokeStyle = color;\n    ctx.lineWidth = width;\n    if (dashed) ctx.setLineDash([5, 4]); else ctx.setLineDash([]);\n    ctx.beginPath();\n    for (var k = 0; k < N; k++) {\n      var vx = px + (k / (N - 1)) * pw;\n      var vy = gy + gh - Math.min(1.05, Math.max(0, arr[k])) * gh * 0.92 - 4;\n      if (k === 0) ctx.moveTo(vx, vy); else ctx.lineTo(vx, vy);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  plotArr(illum, '#f59e0b', 1.8, true);\n  plotArr(a, '#38bdf8', 1.5, false);\n  plotArr(out, '#10b981', 2.4, false);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('-- 环境光照 i[n]', px, H - 8);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 观测图像 a[n]=r[n]×i[n]', px + 115, H - 8);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 处理后输出 r̂[n]', px + 295, H - 8);\n\n  var leftMin = 1, leftMax = 0, rightMin = 1, rightMax = 0;\n  for (var m = 0; m < 45; m++) {\n    if (out[m] < leftMin) leftMin = out[m];\n    if (out[m] > leftMax) leftMax = out[m];\n  }\n  for (var m2 = N - 45; m2 < N; m2++) {\n    if (out[m2] < rightMin) rightMin = out[m2];\n    if (out[m2] > rightMax) rightMax = out[m2];\n  }\n  var cLeft = leftMax - leftMin;\n  var cRight = rightMax - rightMin;\n  var ratio = cLeft > 1e-4 ? (cRight / cLeft) * 100 : 0;\n\n  lab.setReadout('亮区条纹对比度: ' + cLeft.toFixed(2) + '  |  阴影区条纹对比度: ' + cRight.toFixed(2) + ' (恢复比例: ' + ratio.toFixed(0) + '%)  |  ' + (homo ? '对数同态成功还原阴影细节' : '普通线性滤波无法恢复乘性压缩的对比度'));\n}\n\nlab.onUpdate(render);"
    },
    {
      "type": "concept",
      "heading": "全章总纲：数字信号处理 (DSP) 的三步核心哲学",
      "paragraphs": [
        "学到这里，整个第 5 章关于线性系统与信号分解的底层逻辑已经完全闭合。在接下来的章节中，我们将正式进入信号处理最核心的两大技术——**卷积（Convolution）**与**傅里叶分析（Fourier analysis）**。",
        "无论公式多么复杂，它们本质上都严格遵循本章建立的同一个“分而治之”的线性系统黄金三步法：",
        "**(1) 分解**：把复杂的原始信号拆解成简单的可加性分量（如脉冲分量或正弦波分量）；**(2) 处理**：让线性系统分别对每一个简单分量做有益的加工；**(3) 合成**：把加工后的分量重新相加，得到最终输出。**这就是 DSP 的全部精髓**。"
      ],
      "formula": {
        "expr": "x[n]  --(分解)-->  ∑ x_k[n]  --(线性处理)-->  ∑ y_k[n]  --(合成)-->  y[n]",
        "explain": "输入信号 x[n] 被分解为多个简单分量 x_k[n]，各自独立通过线性系统变为 y_k[n]，最后叠加合成为输出 y[n]。线性系统的叠加性保证了这一流程与直接处理原信号完全等价。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（小信号前提）：用“小信号线性化”或“忽略非线性”时，必须盯紧系统的最大动态峰值；一旦瞬态冲击把信号推入饱和区，线性假设立刻崩塌，THD 失真会呈指数级飙升。",
        "避坑 2（对数定义域）：写同态滤波代码执行 `Math.log(x)` 前，务必确保输入信号严格大于零（如图像像素先加一个极小偏置 `eps` 或限定在正区间），否则负值或零值会直接产生 `NaN` 或 `-Infinity` 导致整个流水线崩溃。",
        "核心结论：遇到非线性系统别硬刚，按顺序自查三板斧——① 误差够小就忽略；② 能压幅值就用小信号；③ 遇乘性/幂次混合就上对数等线性化变换。"
      ]
    }
  ]
});
