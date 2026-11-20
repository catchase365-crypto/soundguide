window.__BOOK_REGISTER_SECTION__("sec_137", {
  "title": "滑动平均滤波器的“亲戚”们 (Relatives of the Moving Average Filter)",
  "intuition": "单遍滑动平均虽然平滑快，但频域阻带漏得像筛子；通过多次迭代平滑、高斯核或布莱克曼窗等“亲戚”，我们能以可控的算力代价换取几十 dB 的强力高频抑制。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么需要滑动平均的“亲戚”？——混合域信号的困境",
      "paragraphs": [
        "在理想世界里，工程师只需处理纯粹的**时域信息**（关心波形形状）或纯粹的**频域信息**（关心频谱分布）。但在现实工程中，大量信号同时跨越两个领域：时域波形承载着有效信息，而干扰或传输限制却发生在频域。",
        "原书举了两个经典案例：第一是**电视视频信号**——图像的明暗变化编码在时域波形中，但传输时必须按频域处理（总带宽、伴音与色度载波、直流分量消除与恢复）；第二是**电磁干扰（EMI）**——科学实验中的温度传感器信号虽然在时域读取，却极易混入 `60 Hz` 工频电网嗡声、`30 kHz` 开关电源噪声或 `1320 kHz` 调幅广播信号。",
        "单遍滑动平均（1-pass Moving Average）在时域去噪是一把好手，但在频域却是个极其糟糕的低通滤波器：滚降缓慢，且阻带衰减惨不忍睹（第一旁瓣仅约 `-13 dB`）。为了在这类**混合域应用**中既保住时域平滑效果，又把特定频段的干扰彻底压制下去，我们需要请出它的“亲戚”们。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "多遍滑动平均：时域卷自己，频域乘自己",
      "paragraphs": [
        "最直接且巧妙的改进，就是**多遍滑动平均（Multiple-pass moving average）**——把信号连续通过同一个滑动平均滤波器两次、四次甚至更多次。",
        "从时域滤波核（Filter kernel）的演变来看，这背后藏着一条极其优美的数学规律：",
        "1. **1 遍滤波**：滤波核是一个平坦的矩形脉冲，其阶跃响应是一条生硬的直线斜坡。",
        "2. **2 遍滤波**：相当于矩形核与自身做卷积，等效滤波核变成了一个**三角形**。",
        "3. **4 遍及以上滤波**：根据**中心极限定理（Central Limit Theorem）**，多个矩形不断自我卷积后，等效滤波核会迅速逼近光滑的**高斯钟形曲线（Gaussian）**，而阶跃响应也从生硬直线变成圆润的 **S 形曲线**。",
        "更惊人的是频域的变化：时域做一次卷积，等价于频域做一次频谱相乘。因此，经过 `k` 遍滤波后，整体频响恰好是单遍频响的 `k` 次方！在对数（dB）坐标下，原本 `-13 dB` 的第一旁瓣衰减会直接翻倍到 `-26 dB`（2 遍）和 `-52 dB`（4 遍）。"
      ],
      "formula": {
        "expr": "H_k[f] = ( sin(π f M) / (M sin(π f)) )^k",
        "explain": "f 为归一化频率（0 到 0.5，f=0 时 H=1），M 为单遍滑动窗口点数，k 为滤波遍数。每次串联滤波都让频域衰减以指数级增强。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：多遍滑动平均的核演化、S形响应与阻带飞跃",
      "instruction": "拖动「滤波遍数」观察矩形核如何变成三角形与高斯核，并切换「dB 对数刻度」对比阻带旁瓣是如何被成倍压低的。",
      "controls": [
        {
          "type": "slider",
          "id": "passes",
          "label": "滤波遍数 (k)",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": " 遍"
        },
        {
          "type": "slider",
          "id": "points",
          "label": "单遍窗口点数 (M)",
          "min": 3,
          "max": 15,
          "step": 2,
          "value": 7,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "showStep",
          "label": "时域视图：阶跃响应 (关=滤波核)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "dbScale",
          "label": "频域视图：dB 对数刻度 (关=线性)",
          "value": true
        }
      ],
      "jsCode": "function convolve(a, b) {\n  var res = [];\n  for (var i = 0; i < a.length + b.length - 1; i++) res.push(0);\n  for (var i = 0; i < a.length; i++) {\n    for (var j = 0; j < b.length; j++) res[i + j] += a[i] * b[j];\n  }\n  return res;\n}\nfunction freq1(f, M) {\n  if (f < 1e-6) return 1.0;\n  return Math.abs(Math.sin(Math.PI * f * M) / (M * Math.sin(Math.PI * f)));\n}\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var k = Math.round(lab.values.passes);\n  var M = Math.round(lab.values.points);\n  var showStep = lab.values.showStep;\n  var dbScale = lab.values.dbScale;\n  ctx.clearRect(0, 0, W, H);\n  var h1 = [];\n  for (var i = 0; i < M; i++) h1.push(1.0 / M);\n  var hk = h1.slice();\n  for (var p = 1; p < k; p++) hk = convolve(hk, h1);\n  var s1 = [], sk = [], acc = 0;\n  for (var i = 0; i < h1.length; i++) { acc += h1[i]; s1.push(acc); }\n  acc = 0;\n  for (var i = 0; i < hk.length; i++) { acc += hk[i]; sk.push(acc); }\n  var Lx = 46, Ltop = 28, Lw = 286, Lh = 178;\n  var Rx = 402, Rtop = 28, Rw = 294, Rh = 178;\n  function drawGrid(x, y, w, h, cols, rows) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var i = 0; i <= cols; i++) {\n      var gx = x + (w * i) / cols;\n      ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke();\n    }\n    for (var j = 0; j <= rows; j++) {\n      var gy = y + (h * j) / rows;\n      ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n    ctx.strokeRect(x, y, w, h);\n  }\n  drawGrid(Lx, Ltop, Lw, Lh, 4, 4);\n  drawGrid(Rx, Rtop, Rw, Rh, 5, 5);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText(showStep ? '时域：阶跃响应 (Step Response)' : '时域：等效滤波核 (Filter Kernel)', Lx, 18);\n  ctx.fillText(dbScale ? '频域：幅度响应 (dB)' : '频域：幅度响应 (线性)', Rx, 18);\n  var halfSpan = Math.max(10, Math.floor(hk.length / 2) + 2);\n  var yMaxL = showStep ? 1.15 : Math.max(0.22, (1.0 / M) * 1.2);\n  function mapLX(n) { return Lx + ((n + halfSpan) / (2 * halfSpan)) * Lw; }\n  function mapLY(v) { return Ltop + Lh - (v / yMaxL) * Lh; }\n  ctx.save();\n  ctx.beginPath(); ctx.rect(Lx, Ltop, Lw, Lh); ctx.clip();\n  var c1 = (h1.length - 1) / 2;\n  var ck = (hk.length - 1) / 2;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var n = -halfSpan; n <= halfSpan; n++) {\n    var val;\n    if (showStep) {\n      var idx = n + c1;\n      val = idx < 0 ? 0 : (idx >= s1.length ? 1 : s1[idx]);\n    } else {\n      var idx = n + c1;\n      val = (idx >= 0 && idx < h1.length) ? h1[idx] : 0;\n    }\n    var px = mapLX(n), py = mapLY(val);\n    if (n === -halfSpan) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var n = -halfSpan; n <= halfSpan; n++) {\n    var val;\n    if (showStep) {\n      var idx = n + ck;\n      val = idx < 0 ? 0 : (idx >= sk.length ? 1 : sk[idx]);\n    } else {\n      var idx = n + ck;\n      val = (idx >= 0 && idx < hk.length) ? hk[idx] : 0;\n    }\n    var px = mapLX(n), py = mapLY(val);\n    if (n === -halfSpan) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  for (var n = -halfSpan; n <= halfSpan; n++) {\n    var idx = n + ck;\n    if (idx >= 0 && idx < hk.length) {\n      var val = showStep ? sk[idx] : hk[idx];\n      ctx.beginPath(); ctx.arc(mapLX(n), mapLY(val), 2.3, 0, Math.PI * 2); ctx.fill();\n    }\n  }\n  ctx.restore();\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px monospace';\n  ctx.fillText('-' + halfSpan, Lx - 4, Ltop + Lh + 14);\n  ctx.fillText('0', Lx + Lw / 2 - 3, Ltop + Lh + 14);\n  ctx.fillText('+' + halfSpan + ' 样本', Lx + Lw - 36, Ltop + Lh + 14);\n  ctx.fillText(yMaxL.toFixed(2), Lx - 36, Ltop + 10);\n  ctx.fillText('0.0', Lx - 28, Ltop + Lh);\n  function mapRX(f) { return Rx + (f / 0.5) * Rw; }\n  function mapRY(val, isDb) {\n    if (isDb) {\n      var clamped = Math.max(-120, Math.min(10, val));\n      return Rtop + ((10 - clamped) / 130) * Rh;\n    }\n    return Rtop + Rh - (Math.min(1.15, val) / 1.15) * Rh;\n  }\n  ctx.save();\n  ctx.beginPath(); ctx.rect(Rx, Rtop, Rw, Rh); ctx.clip();\n  var steps = 250;\n  var maxStop1 = 0, maxStopK = 0;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath();\n  for (var i = 0; i <= steps; i++) {\n    var f = (0.5 * i) / steps;\n    var m1 = freq1(f, M);\n    if (f >= 1.0 / M && m1 > maxStop1) maxStop1 = m1;\n    var yv = dbScale ? 20 * Math.log10(Math.max(m1, 1e-6)) : m1;\n    var px = mapRX(f), py = mapRY(yv, dbScale);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var i = 0; i <= steps; i++) {\n    var f = (0.5 * i) / steps;\n    var m1 = freq1(f, M);\n    var mk = Math.pow(m1, k);\n    if (f >= 1.0 / M && mk > maxStopK) maxStopK = mk;\n    var yv = dbScale ? 20 * Math.log10(Math.max(mk, 1e-6)) : mk;\n    var px = mapRX(f), py = mapRY(yv, dbScale);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.fillText('0', Rx - 3, Rtop + Lh + 14);\n  ctx.fillText('0.25', Rx + Rw * 0.5 - 12, Rtop + Lh + 14);\n  ctx.fillText('0.5 (Nyquist)', Rx + Rw - 64, Rtop + Lh + 14);\n  if (dbScale) {\n    ctx.fillText('0dB', Rx - 30, mapRY(0, true) + 4);\n    ctx.fillText('-60', Rx - 26, mapRY(-60, true) + 4);\n    ctx.fillText('-120', Rx - 32, mapRY(-120, true) + 4);\n  } else {\n    ctx.fillText('1.0', Rx - 26, mapRY(1.0, false) + 4);\n    ctx.fillText('0.0', Rx - 26, mapRY(0.0, false) + 4);\n  }\n  ctx.fillStyle = '#f59e0b'; ctx.fillRect(Lx + Lw - 115, Ltop + 8, 12, 3);\n  ctx.fillStyle = '#f8fafc'; ctx.fillText('1 遍基准', Lx + Lw - 98, Ltop + 13);\n  ctx.fillStyle = '#10b981'; ctx.fillRect(Lx + Lw - 115, Ltop + 22, 12, 3);\n  ctx.fillStyle = '#f8fafc'; ctx.fillText(k + ' 遍滤波', Lx + Lw - 98, Ltop + 27);\n  var db1 = 20 * Math.log10(Math.max(maxStop1, 1e-6));\n  var dbK = 20 * Math.log10(Math.max(maxStopK, 1e-6));\n  var shapeName = k === 1 ? '矩形 (Rectangular)' : (k === 2 ? '三角形 (Triangular)' : (k >= 4 ? '近似高斯 (Gaussian-like)' : '平滑过渡核'));\n  lab.setReadout('核形状: ' + shapeName + ' | 总长度: ' + hk.length + ' 点 | 第一旁瓣峰值: ' + dbK.toFixed(1) + ' dB (单遍基准 ' + db1.toFixed(1) + ' dB)');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "高斯核、布莱克曼窗与三大真实权衡",
      "paragraphs": [
        "除了多次迭代滑动平均，工程上还有两位重量级“亲戚”：**纯高斯核（Gaussian）**与**布莱克曼窗核（Blackman window）**。纯高斯核的傅里叶变换依然是高斯函数（理论上完全没有旁瓣振铃！），它也是光纤脉冲色散等许多自然系统的脉冲响应，并在图像处理中因可分离性实现快速二维卷积。而布莱克曼窗（这里的“窗”只是这条曲线的传统名称）外观与高斯非常相似，同样能提供极深的阻带衰减。",
        "相比普通滑动平均，这些“亲戚”到底强在哪里？原书精准总结了三条：**第一（也是最重要的），阻带衰减远强于单遍滑动平均**；第二，滤波核两端逐渐衰减（taper），距离当前点越远的样本权重越小；第三，阶跃响应是光滑曲线而非生硬斜坡（后两条只在少数特定场合有实际意义）。",
        "关于降噪与上升时间（Risetime）：所有这些滤波器在“抑制随机白噪声并保持陡峭阶跃响应”的综合能力上**几乎完全打平**。如果按 `0% 到 100%` 测上升时间，单遍滑动平均占优；如果按 `10% 到 90%` 测，布莱克曼窗占优——作者称之为纯属“理论扯皮（theoretical squabbling）”，工程上直接把它们视为同等水平即可。",
        "**真正拉开天壤之别的，是执行速度！** 单遍滑动平均配合递归算法（下一节详解）是人类已知最快的数字滤波器；多遍滑动平均虽然慢了 `k` 倍，但依然飞快。相比之下，高斯核和布莱克曼窗必须使用**标准卷积**逐点相乘累加。由于乘法比加法慢约 10 倍，一个 `M` 点的卷积慢了大约 `10 × M` 倍——这意味着一个 **100 点的高斯滤波器，比递归滑动平均慢整整 1000 倍！**"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验二：混合域抗干扰波形与听觉对比 (1-Pass vs 4-Pass vs Blackman)",
      "instruction": "打开「播放滤波后声音」，拖动「高频干扰频率」对准旁瓣区域，切换滤波器类型（1=单遍MA, 2=4遍MA, 3=Blackman），亲耳听出高频啸叫如何彻底消失！",
      "controls": [
        {
          "type": "slider",
          "id": "filterType",
          "label": "滤波器类型 (1=单遍MA, 2=4遍MA, 3=Blackman)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "points",
          "label": "等效平滑宽度 (M)",
          "min": 5,
          "max": 21,
          "step": 2,
          "value": 11,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "interfFreq",
          "label": "高频干扰频率",
          "min": 1500,
          "max": 10000,
          "step": 250,
          "value": 5500,
          "unit": " Hz"
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波后声音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ac = null, srcNode = null, gainNode = null, lastKey = '';\nfunction convolve(a, b) {\n  var r = [];\n  for (var i = 0; i < a.length + b.length - 1; i++) r.push(0);\n  for (var i = 0; i < a.length; i++) {\n    for (var j = 0; j < b.length; j++) r[i + j] += a[i] * b[j];\n  }\n  return r;\n}\nfunction buildKernel(type, M) {\n  if (type === 1) {\n    var h = [];\n    for (var i = 0; i < M; i++) h.push(1.0 / M);\n    return h;\n  }\n  if (type === 2) {\n    var mSub = Math.max(2, Math.round(M * 0.52));\n    var h1 = [];\n    for (var i = 0; i < mSub; i++) h1.push(1.0 / mSub);\n    var h = h1.slice();\n    for (var p = 1; p < 4; p++) h = convolve(h, h1);\n    return h;\n  }\n  var L = 2 * M + 1;\n  var w = [], sum = 0;\n  for (var i = 0; i < L; i++) {\n    var v = 0.42 - 0.5 * Math.cos((2 * Math.PI * i) / (L - 1)) + 0.08 * Math.cos((4 * Math.PI * i) / (L - 1));\n    w.push(v); sum += v;\n  }\n  for (var i = 0; i < L; i++) w[i] /= sum;\n  return w;\n}\nfunction evalKernelH(h, fNorm) {\n  var c = (h.length - 1) / 2;\n  var re = 0;\n  for (var i = 0; i < h.length; i++) {\n    re += h[i] * Math.cos(2 * Math.PI * fNorm * (i - c));\n  }\n  return re;\n}\nfunction updateAudio(type, M, fInt, h) {\n  if (!lab.values.play) {\n    if (srcNode) { try { srcNode.stop(); srcNode.disconnect(); } catch (e) {} srcNode = null; }\n    lastKey = '';\n    return;\n  }\n  try {\n    if (!ac) ac = lab.getAudioContext();\n    if (ac.state === 'suspended') ac.resume();\n    var fs = ac.sampleRate;\n    var key = type + '_' + M + '_' + fInt + '_' + fs;\n    if (key === lastKey && srcNode) return;\n    var dur = 0.5;\n    var N = Math.round(fs * dur);\n    var buf = ac.createBuffer(1, N, fs);\n    var ch = buf.getChannelData(0);\n    var g1 = evalKernelH(h, 220 / fs);\n    var g2 = evalKernelH(h, 440 / fs);\n    var gInt = evalKernelH(h, fInt / fs);\n    for (var i = 0; i < N; i++) {\n      var t = i / fs;\n      ch[i] = g1 * 0.24 * Math.sin(2 * Math.PI * 220 * t) + g2 * 0.07 * Math.sin(2 * Math.PI * 440 * t) + gInt * 0.22 * Math.sin(2 * Math.PI * fInt * t);\n    }\n    if (srcNode) { try { srcNode.stop(); srcNode.disconnect(); } catch (e) {} }\n    if (!gainNode) { gainNode = ac.createGain(); gainNode.gain.value = 0.65; gainNode.connect(ac.destination); }\n    srcNode = ac.createBufferSource();\n    srcNode.buffer = buf;\n    srcNode.loop = true;\n    srcNode.connect(gainNode);\n    srcNode.start(0);\n    lastKey = key;\n  } catch (e) {}\n}\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width, H = lab.height;\n  var type = Math.round(lab.values.filterType);\n  var M = Math.round(lab.values.points);\n  var fInt = lab.values.interfFreq;\n  var h = buildKernel(type, M);\n  updateAudio(type, M, fInt, h);\n  var fs = ac ? ac.sampleRate : 48000;\n  ctx.clearRect(0, 0, W, H);\n  var Lx = 36, Ltop = 28, Lw = 298, Lh = 178;\n  var Rx = 398, Rtop = 28, Rw = 298, Rh = 178;\n  function drawGrid(x, y, w, h, cols, rows) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (var i = 0; i <= cols; i++) { var gx = x + (w * i) / cols; ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx, y + h); ctx.stroke(); }\n    for (var j = 0; j <= rows; j++) { var gy = y + (h * j) / rows; ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x + w, gy); ctx.stroke(); }\n    ctx.strokeStyle = 'rgba(255,255,255,0.28)'; ctx.strokeRect(x, y, w, h);\n  }\n  drawGrid(Lx, Ltop, Lw, Lh, 4, 4);\n  drawGrid(Rx, Rtop, Rw, Rh, 5, 5);\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('时域对比：带干扰输入 (橙虚线) vs 滤波输出 (绿)', Lx, 18);\n  ctx.fillText('频域阻带对比：干扰频率处实际衰减', Rx, 18);\n  var winSamples = Math.round(fs * (2.5 / 220));\n  var pad = h.length;\n  var raw = [];\n  for (var i = -pad; i < winSamples + pad; i++) {\n    var t = i / fs;\n    raw.push(0.55 * Math.sin(2 * Math.PI * 220 * t) + 0.16 * Math.sin(2 * Math.PI * 440 * t) + 0.45 * Math.sin(2 * Math.PI * fInt * t));\n  }\n  var mid = Math.floor(h.length / 2);\n  ctx.save(); ctx.beginPath(); ctx.rect(Lx, Ltop, Lw, Lh); ctx.clip();\n  function mapTY(v) { return Ltop + Lh * 0.5 - v * (Lh * 0.42); }\n  ctx.strokeStyle = 'rgba(245, 158, 11, 0.55)'; ctx.lineWidth = 1.2; ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  for (var i = 0; i < winSamples; i++) {\n    var px = Lx + (i / (winSamples - 1)) * Lw;\n    var py = mapTY(raw[i + pad]);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke(); ctx.setLineDash([]);\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2.3;\n  ctx.beginPath();\n  for (var i = 0; i < winSamples; i++) {\n    var acc = 0;\n    for (var k = 0; k < h.length; k++) acc += h[k] * raw[i + pad - k + mid];\n    var px = Lx + (i / (winSamples - 1)) * Lw;\n    var py = mapTY(acc);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke(); ctx.restore();\n  ctx.save(); ctx.beginPath(); ctx.rect(Rx, Rtop, Rw, Rh); ctx.clip();\n  function mapFX(f) { return Rx + (f / 0.5) * Rw; }\n  function mapFdB(db) { var c = Math.max(-100, Math.min(10, db)); return Rtop + ((10 - c) / 110) * Rh; }\n  ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 260; i++) {\n    var f = (0.5 * i) / 260;\n    var mag = Math.abs(evalKernelH(h, f));\n    var db = 20 * Math.log10(Math.max(mag, 1e-5));\n    var px = mapFX(f), py = mapFdB(db);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  var fNormInt = Math.min(0.499, fInt / fs);\n  var magInt = Math.abs(evalKernelH(h, fNormInt));\n  var dbInt = 20 * Math.log10(Math.max(magInt, 1e-5));\n  var mx = mapFX(fNormInt), my = mapFdB(dbInt);\n  ctx.strokeStyle = '#ec4899'; ctx.lineWidth = 1.6; ctx.setLineDash([4, 3]);\n  ctx.beginPath(); ctx.moveTo(mx, Rtop); ctx.lineTo(mx, Rtop + Rh); ctx.stroke(); ctx.setLineDash([]);\n  ctx.fillStyle = '#ec4899'; ctx.beginPath(); ctx.arc(mx, my, 4.5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px monospace';\n  var labelX = mx > Rx + Rw - 75 ? mx - 68 : mx + 6;\n  ctx.fillText(dbInt.toFixed(1) + ' dB', labelX, Math.max(Rtop + 14, Math.min(Rtop + Rh - 6, my - 6)));\n  ctx.restore();\n  ctx.fillStyle = 'rgba(248,250,252,0.65)'; ctx.font = '11px monospace';\n  ctx.fillText('0', Rx - 3, Rtop + Rh + 14);\n  ctx.fillText('0.25', Rx + Rw * 0.5 - 12, Rtop + Rh + 14);\n  ctx.fillText('0.5 (fs/2)', Rx + Rw - 50, Rtop + Rh + 14);\n  ctx.fillText('0dB', Rx - 26, mapFdB(0) + 4);\n  ctx.fillText('-50', Rx - 26, mapFdB(-50) + 4);\n  ctx.fillText('-100', Rx - 32, mapFdB(-100) + 4);\n  ctx.fillText('时间 (约 11.4 ms)', Lx + Lw / 2 - 42, Ltop + Lh + 14);\n  var names = ['', '1-Pass 滑动平均', '4-Pass 滑动平均', 'Blackman 窗核'];\n  var speedHint = type === 1 ? '极快 (可递归，O(1)加法)' : (type === 2 ? '很快 (4次递归加法)' : '极慢 (需 ' + h.length + ' 点乘法卷积)');\n  lab.setReadout('当前: ' + names[type] + ' (核长 ' + h.length + ' 点) | 干扰 ' + fInt + ' Hz 衰减: ' + dbInt.toFixed(1) + ' dB | 速度估算: ' + speedHint);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "混合域信号不能只看时域平滑：遇到工频/开关电源/射频串扰时，单遍滑动平均的 `-13 dB` 旁瓣根本挡不住高频泄漏。",
        "性价比之王是「多遍滑动平均」：连续跑 4 遍就能借助中心极限定理获得高斯级阻带衰减（`-50 dB` 以上）与光滑 S 形阶跃响应，同时保留递归算法的极速优势。",
        "警惕卷积的性能陷阱：纯高斯核或布莱克曼窗虽然阻带极深，但无法直接用加减法递归实现；100 点卷积核的耗时往往是递归滑动平均的 1000 倍！",
        "别在上升时间指标上钻牛角尖：在同等噪声抑制下，单遍、多遍、高斯与布莱克曼的阶跃锐度基本一致（0-100% 与 10-90% 口径差异纯属理论扯皮），优先按「阻带要求 + 算力预算」选型。"
      ]
    }
  ]
});
