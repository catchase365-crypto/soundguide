window.__BOOK_REGISTER_SECTION__("sec_130", {
  "title": "时域滤波器性能指标 (Time Domain Parameters)",
  "intuition": "在时间域处理信号（如心电图或脉冲检测）时，评价滤波器好坏不看频谱，而看它的阶跃响应是否够快、无过冲且上下对称。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么死磕“阶跃响应”，而不是脉冲响应？",
      "paragraphs": [
        "虽然**阶跃响应（Step Response）**、**脉冲响应（Impulse Response）**和**频率响应（Frequency Response）**包含的信息本质上是完全一样的，只是排列方式不同，但时域分析偏偏最看重阶跃响应。原因在于**人类大脑理解信号的方式**。",
        "当你拿到一段未知信号时，大脑会自动把信号切分成若干特征相似的区间：哪一段平滑、哪一段有剧烈峰值、哪一段充满噪声。这种“分段”动作的本质，就是寻找不同特征区间之间的**分界点**。而**阶跃函数（Step Function）**正是最纯粹的分界线——它标出了事件的起点或终点，告诉你“左边和右边不一样”。因此，阶跃响应直接决定了滤波器会如何篡改信号中事件的起止边界。",
        "为了分辨信号中接连发生的事件，第一个核心指标就是**过渡速度（Transition Speed）**，即尽量缩短**上升时间（Risetime）**——工程上通常定义为信号从终值的 **10% 上升到 90% 所经历的样本数**。阶跃响应的持续时间必须短于事件之间的间隔，才能把两个事件区分开。之所以不能无限制地追求极快上升时间，是因为我们还要兼顾降噪、采集硬件极限以及防止混叠（Aliasing）等现实约束。"
      ],
      "formula": {
        "expr": "s[n] = Σ h[k]  (k 从 -∞ 到 n) ；  Risetime = n(90%) - n(10%)",
        "explain": "s[n] 是系统对单位阶跃信号的响应（即脉冲响应 h[k] 的累加和）；Risetime 衡量边界从 10% 爬升到 90% 幅度所需的样本跨度，越短代表时间分辨力越强。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：阶跃响应三大核心指标实验室",
      "instruction": "拖动下方滑块改变上升时间、过冲幅度与相位非线性度，观察图 14-2 中的六种好坏波形形态与 10%-90% 标尺变化。",
      "controls": [
        {
          "type": "slider",
          "id": "risetime",
          "label": "上升时间 (Risetime)",
          "min": 2,
          "max": 24,
          "step": 1,
          "value": 6,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "overshoot",
          "label": "过冲/振铃 (Overshoot)",
          "min": 0,
          "max": 35,
          "step": 1,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "nonlinearity",
          "label": "相位非线性度 (Asymmetry)",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "showGuides",
          "label": "显示 10%-90% 上升时间标尺",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\n\nfunction draw() {\n  var rtTarget = lab.values.risetime;\n  var ov = lab.values.overshoot / 100;\n  var nl = lab.values.nonlinearity / 100;\n  var showGuides = lab.values.showGuides;\n\n  var N = 64;\n  var y = new Array(N + 1);\n  var w = rtTarget / 2.1972;\n  var tau = rtTarget / 2.1972;\n  var ringFreq = Math.PI / Math.max(2.6, rtTarget * 0.55);\n  var decay = 4.5 + rtTarget * 0.35;\n\n  var maxY = -10;\n  var minY = 10;\n  for (var n = 0; n <= N; n++) {\n    var sSym = 0.5 * (1 + Math.tanh((n - 32) / w));\n    var sAsym = n < 32 ? 0 : 1 - Math.exp(-(n - 32) / tau);\n    var base = (1 - nl) * sSym + nl * sAsym;\n\n    var ringSym = ov * 1.35 * Math.sin((n - 32) * ringFreq) * Math.exp(-Math.abs(n - 32) / decay);\n    var ringAsym = n < 32 ? 0 : ov * 1.35 * Math.sin((n - 32) * ringFreq) * Math.exp(-(n - 32) / decay);\n    var val = base + (1 - nl) * ringSym + nl * ringAsym;\n    y[n] = val;\n    if (val > maxY) maxY = val;\n    if (val < minY) minY = val;\n  }\n\n  var n10 = null;\n  var n90 = null;\n  for (var i = 1; i <= N; i++) {\n    if (n10 === null && y[i] >= 0.1 && y[i - 1] < 0.1) {\n      n10 = (i - 1) + (0.1 - y[i - 1]) / (y[i] - y[i - 1]);\n    }\n    if (n90 === null && y[i] >= 0.9 && y[i - 1] < 0.9) {\n      n90 = (i - 1) + (0.9 - y[i - 1]) / (y[i] - y[i - 1]);\n    }\n  }\n  var actualRT = (n10 !== null && n90 !== null) ? (n90 - n10) : rtTarget;\n  var actualOv = Math.max(0, (maxY - 1.0) * 100);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var padL = 56, padR = 26, padT = 22, padB = 34;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var yMin = -0.5, yMax = 1.5;\n\n  function toX(nVal) { return padL + (nVal / N) * plotW; }\n  function toY(aVal) { return padT + ((yMax - aVal) / (yMax - yMin)) * plotH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  var yTicks = [-0.5, 0.0, 0.5, 1.0, 1.5];\n  for (var t = 0; t < yTicks.length; t++) {\n    var py = toY(yTicks[t]);\n    ctx.beginPath();\n    ctx.moveTo(padL, py);\n    ctx.lineTo(W - padR, py);\n    ctx.stroke();\n    ctx.fillText(yTicks[t].toFixed(1), padL - 8, py);\n  }\n\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  var xTicks = [0, 16, 32, 48, 64];\n  for (var xk = 0; xk < xTicks.length; xk++) {\n    var px = toX(xTicks[xk]);\n    ctx.beginPath();\n    ctx.moveTo(px, padT);\n    ctx.lineTo(px, H - padB);\n    ctx.stroke();\n    ctx.fillText(String(xTicks[xk]), px, H - padB + 6);\n  }\n\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.fillText('样本序号 (Sample number)', padL + plotW / 2, H - 15);\n\n  if (showGuides) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.55)';\n    ctx.beginPath();\n    ctx.moveTo(padL, toY(0.1));\n    ctx.lineTo(W - padR, toY(0.1));\n    ctx.moveTo(padL, toY(0.9));\n    ctx.lineTo(W - padR, toY(0.9));\n    ctx.stroke();\n    if (n10 !== null && n90 !== null) {\n      ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n      ctx.beginPath();\n      ctx.moveTo(toX(n10), toY(0.1));\n      ctx.lineTo(toX(n10), H - padB);\n      ctx.moveTo(toX(n90), toY(0.9));\n      ctx.lineTo(toX(n90), H - padB);\n      ctx.stroke();\n    }\n    ctx.restore();\n    ctx.fillStyle = '#f59e0b';\n    ctx.textAlign = 'left';\n    ctx.textBaseline = 'bottom';\n    ctx.fillText('90%', padL + 4, toY(0.9) - 2);\n    ctx.fillText('10%', padL + 4, toY(0.1) - 2);\n  }\n\n  if (actualOv > 0.5) {\n    ctx.fillStyle = 'rgba(236,72,153,0.16)';\n    ctx.beginPath();\n    ctx.moveTo(toX(0), toY(1.0));\n    for (var k = 0; k <= N; k++) {\n      var clipped = Math.max(1.0, y[k]);\n      ctx.lineTo(toX(k), toY(clipped));\n    }\n    ctx.lineTo(toX(N), toY(1.0));\n    ctx.closePath();\n    ctx.fill();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var m = 0; m <= N; m++) {\n    var sx = toX(m);\n    var sy = toY(y[m]);\n    if (m === 0) ctx.moveTo(sx, sy);\n    else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n\n  for (var d = 0; d <= N; d++) {\n    var dx = toX(d);\n    var dy = toY(y[d]);\n    ctx.fillStyle = (y[d] > 1.015 || y[d] < -0.015) ? '#ec4899' : '#f8fafc';\n    ctx.fillRect(dx - 2, dy - 2, 4, 4);\n  }\n\n  var isGood = actualRT <= 6.5 && actualOv <= 1.5 && nl <= 0.05;\n  ctx.fillStyle = isGood ? 'rgba(16,185,129,0.2)' : 'rgba(236,72,153,0.2)';\n  ctx.fillRect(W - 148, padT + 6, 114, 24);\n  ctx.strokeStyle = isGood ? '#10b981' : '#ec4899';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(W - 148, padT + 6, 114, 24);\n  ctx.fillStyle = isGood ? '#10b981' : '#ec4899';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n  ctx.fillText(isGood ? 'GOOD 时域表现' : 'POOR 存在失真', W - 91, padT + 18);\n\n  var symText = nl === 0 ? '线性相位 (上下对称)' : '非线性相位 (不对称 ' + lab.values.nonlinearity + '%)';\n  lab.setReadout('实测 10%-90% 上升时间: ' + actualRT.toFixed(1) + ' 样本  |  实测峰值过冲: ' + actualOv.toFixed(1) + '%  |  ' + symText);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "幅度的“伪造者”与边沿的“对称美学”",
      "paragraphs": [
        "第二个核心指标是**过冲（Overshoot）**。在时域滤波器中，过冲通常必须彻底消除。为什么？因为它会直接篡改信号样本的真实幅度，属于对时域信息最根本的歪曲。书中给出了一句极其经典的灵魂拷问：**“你观测到的这个过冲尖峰，究竟来自被测物理对象本身，还是来自你设计的滤波器？”**（例如在心电图 EKG 中，滤波器造成的虚假过冲可能会被医生误诊为心律异常尖峰。）",
        "第三个核心指标是**相位线性度（Phase Linearity）**。在阶跃响应曲线上，它表现为**上半部分（0.5 到 1.0）与下半部分（0.0 到 0.5）完全对称**。之所以需要这种对称性，是为了让信号中的**上升沿（Rising Edges）与下降沿（Falling Edges）看起来一模一样**。如果相位是非线性的，一个原本左右对称的矩形脉冲穿过滤波器后，就会变成前陡后缓、歪斜畸变的形状。之所以称之为“线性相位”，是因为它对应在频域中具有一条直线形状的相位响应。"
      ],
      "formula": {
        "expr": "h[M - k] = h[M + k]",
        "explain": "当有限长脉冲响应 h[k] 围绕中心点 M 左右对称时，滤波器具有严格的线性相位；其对应的阶跃响应上下两半必将完美对称，上升沿与下降沿形状一致。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：双脉冲分辨力、过冲伪峰与波形听感",
      "instruction": "调节两个相邻矩形脉冲的间距，再改变滤波器的上升时间、过冲与相位线性度；点击“监听滤波后音色”感受边沿变钝与振铃造成的听觉差异。",
      "controls": [
        {
          "type": "slider",
          "id": "spacing",
          "label": "双脉冲间距",
          "min": 2,
          "max": 28,
          "step": 1,
          "value": 10,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "risetime",
          "label": "滤波上升时间",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 3,
          "unit": " 样本"
        },
        {
          "type": "slider",
          "id": "overshoot",
          "label": "滤波过冲强度",
          "min": 0,
          "max": 30,
          "step": 1,
          "value": 0,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "nonlinear",
          "label": "切换为非线性相位 (边沿不对称)",
          "value": false
        },
        {
          "type": "audio",
          "id": "playAudio",
          "label": "▶ 监听滤波后音色",
          "activeLabel": "⏸ 停止监听"
        }
      ],
      "jsCode": "var ctx = lab.ctx;\nvar W = lab.width;\nvar H = lab.height;\nvar activeSrc = null;\nvar activeGain = null;\n\nfunction stopAudio() {\n  if (activeSrc) {\n    try { activeSrc.stop(); activeSrc.disconnect(); } catch (e) {}\n    activeSrc = null;\n  }\n  if (activeGain) {\n    try { activeGain.disconnect(); } catch (e) {}\n    activeGain = null;\n  }\n}\n\nfunction updateAudio(yArr) {\n  if (!lab.values.playAudio) {\n    stopAudio();\n    return;\n  }\n  var actx = lab.getAudioContext();\n  if (!actx) return;\n  if (actx.state === 'suspended') actx.resume();\n\n  var sr = actx.sampleRate || 44100;\n  var len = Math.max(64, Math.round(sr / 145));\n  var buf = actx.createBuffer(1, len, sr);\n  var data = buf.getChannelData(0);\n  var N = yArr.length;\n  var mean = 0;\n  for (var i = 0; i < N; i++) mean += yArr[i];\n  mean /= N;\n\n  for (var j = 0; j < len; j++) {\n    var pos = (j / len) * (N - 1);\n    var idx = Math.floor(pos);\n    var frac = pos - idx;\n    var nextIdx = Math.min(N - 1, idx + 1);\n    var sample = yArr[idx] * (1 - frac) + yArr[nextIdx] * frac;\n    data[j] = (sample - mean) * 0.3;\n  }\n\n  stopAudio();\n  var src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  var gain = actx.createGain();\n  gain.gain.value = 0.2;\n  src.connect(gain);\n  gain.connect(actx.destination);\n  src.start();\n  activeSrc = src;\n  activeGain = gain;\n}\n\nfunction run() {\n  var spacing = lab.values.spacing;\n  var rt = lab.values.risetime;\n  var ov = lab.values.overshoot / 100;\n  var nl = lab.values.nonlinear;\n\n  var N = 128;\n  var pw = 12;\n  var totalSpan = 2 * pw + spacing;\n  var p1Start = Math.floor((N - totalSpan) / 2);\n  var p1End = p1Start + pw;\n  var p2Start = p1End + spacing;\n  var p2End = p2Start + pw;\n\n  var x = new Array(N);\n  for (var n = 0; n < N; n++) {\n    x[n] = ((n >= p1Start && n < p1End) || (n >= p2Start && n < p2End)) ? 1.0 : 0.0;\n  }\n\n  var M = 24;\n  var K = 2 * M + 1;\n  var s = new Array(K);\n  var w = Math.max(0.45, rt / 2.1972);\n  var ringFreq = Math.PI / Math.max(2.2, rt * 0.55);\n  var decay = 3.8 + rt * 0.35;\n\n  for (var m = 0; m < K; m++) {\n    var k = m - M;\n    var base = nl ? (k < 0 ? 0 : 1 - Math.exp(-k / w)) : 0.5 * (1 + Math.tanh(k / w));\n    var ring = nl\n      ? (k < 0 ? 0 : ov * 1.3 * Math.sin(k * ringFreq) * Math.exp(-k / decay))\n      : (ov * 1.3 * Math.sin(k * ringFreq) * Math.exp(-Math.abs(k) / decay));\n    s[m] = base + ring;\n  }\n  s[0] = 0;\n  s[K - 1] = 1;\n\n  var h = new Array(K);\n  for (var m2 = 0; m2 < K; m2++) {\n    h[m2] = m2 === 0 ? 0 : s[m2] - s[m2 - 1];\n  }\n\n  var y = new Array(N);\n  var maxOut = -10;\n  for (var idx = 0; idx < N; idx++) {\n    var sum = 0;\n    for (var j = 0; j < K; j++) {\n      var xi = idx - (j - M);\n      if (xi >= 0 && xi < N) sum += h[j] * x[xi];\n    }\n    y[idx] = sum;\n    if (sum > maxOut) maxOut = sum;\n  }\n\n  var valleyMin = 10;\n  for (var v = p1End; v < p2Start; v++) {\n    if (v >= 0 && v < N && y[v] < valleyMin) valleyMin = y[v];\n  }\n  if (p1End >= p2Start) valleyMin = 1.0;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  var padL = 52, padR = 24, padT = 28, padB = 30;\n  var plotW = W - padL - padR;\n  var plotH = H - padT - padB;\n  var yMin = -0.35, yMax = 1.45;\n\n  function toX(nVal) { return padL + (nVal / (N - 1)) * plotW; }\n  function toY(aVal) { return padT + ((yMax - aVal) / (yMax - yMin)) * plotH; }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = 'rgba(248,250,252,0.5)';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  var yGrid = [0.0, 0.5, 1.0];\n  for (var g = 0; g < yGrid.length; g++) {\n    var gy = toY(yGrid[g]);\n    ctx.beginPath();\n    ctx.moveTo(padL, gy);\n    ctx.lineTo(W - padR, gy);\n    ctx.stroke();\n    ctx.fillText(yGrid[g].toFixed(1), padL - 8, gy);\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var a = 0; a < N; a++) {\n    var ax = toX(a), ay = toY(x[a]);\n    if (a === 0) ctx.moveTo(ax, ay);\n    else ctx.lineTo(ax, ay);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  for (var b = 0; b < N; b++) {\n    var bx = toX(b), by = toY(y[b]);\n    if (b === 0) ctx.moveTo(bx, by);\n    else ctx.lineTo(bx, by);\n  }\n  ctx.stroke();\n\n  if (valleyMin > 0.45) {\n    var midX = toX((p1End + p2Start) / 2);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText('事件混叠粘连!', midX, toY(valleyMin) - 12);\n  }\n\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.fillText('--- 原始双脉冲事件', padL + 8, 14);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 滤波输出波形', padL + 135, 14);\n\n  var resolveStatus = valleyMin <= 0.25 ? '清晰分辨两个事件' : (valleyMin <= 0.55 ? '事件边界开始模糊' : '严重粘连无法分辨');\n  lab.setReadout('谷底残留幅度: ' + (valleyMin * 100).toFixed(0) + '% (' + resolveStatus + ')  |  输出峰值: ' + maxOut.toFixed(2) + ' (真实值 1.00)');\n  updateAudio(y);\n}\n\nlab.onUpdate(run);\nrun();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "时域与频域鱼和熊掌不可兼得：做心电、脉冲、边沿检测等时域任务时，放弃追求陡峭的频域截止，死磕阶跃响应三大指标。",
        "上升时间（10%-90% 样本数）必须小于信号相邻事件的间隔，否则两个独立事件会糊成一团。",
        "见到信号尖峰先自问：这是物理世界的真实幅度，还是滤波器过冲（Overshoot）造的假？",
        "对称边沿靠线性相位：只有阶跃响应上下半对称，信号的上升沿与下降沿才不会出现前陡后缓的畸变。"
      ]
    }
  ]
});
