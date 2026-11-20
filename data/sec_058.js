window.__BOOK_REGISTER_SECTION__("sec_058", {
  "title": "阶跃分解 (Step Decomposition)",
  "intuition": "把任意复杂的离散信号拆解成 N 个错位“台阶”的叠加：用相邻采样点之间的变化量（差分）来刻画信号，从而把线性系统的分析转化为研究系统如何响应输入的“变化”。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心思想：从“看单点”到“看变化”",
      "paragraphs": [
        "在脉冲分解中，我们每次只取出信号中的一个采样点来观察；而**阶跃分解（Step Decomposition）**换了一个视角：它把一个长度为 `N` 的离散信号 `x[n]` 分解为 `N` 个同样长度为 `N` 的分量信号 `x_0[n], x_1[n], ..., x_{N-1}[n]`。",
        "每一个分量信号都是一个**阶跃函数（Step Function）**——也就是前面若干个点全为 `0`，从某个下标开始突然跳变并一直保持某个恒定常数。具体来说，对于第 `k` 个分量 `x_k[n]`（`k ≥ 1`），它在下标 `0` 到 `k-1` 处的值全为 `0`，而从下标 `k` 到 `N-1` 的所有剩余点都等于相邻两点的差值：`x[k] - x[k-1]`。",
        "例如原书给出的第 5 个分量 `x_5[n]`：它的第 `0` 到第 `4` 个点全为 `0`，从第 `5` 个点开始到末尾一直保持常数 `x[5] - x[4]`（即原信号第 4 点与第 5 点之间的差值）。至于第 0 个分量 `x_0[n]` 则是一个**特殊情况**：因为前面没有点可以作差，它的所有采样点 `0` 到 `N-1` 都直接等于初始值 `x[0]`，相当于整个信号的基准偏置台阶。"
      ],
      "formula": {
        "expr": "x_k[n] = (x[k] - x[k-1]) · u[n - k]  (k ≥ 1),   x_0[n] = x[0]",
        "explain": "x[n] 为 N 点原信号；x_k[n] 是第 k 个阶跃分量；u[n-k] 表示在 n < k 时为 0、在 n ≥ k 时恒为 1 的单位阶跃；台阶高度 x[k] - x[k-1] 物理上代表第 k 时刻信号相对于前一时刻的瞬时跳变量。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：逐级台阶解剖与原信号重构",
      "instruction": "拖动“查看第 k 个分量”观察右侧单独的阶跃信号 x_k[n]（默认 k=5 对应教材示例），再拖动“累加前 M 个分量”看台阶如何从左向右逐点拼出原信号。",
      "controls": [
        {
          "type": "slider",
          "id": "k",
          "label": "查看第 k 个分量",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "reconM",
          "label": "累加前 M 个分量",
          "min": 1,
          "max": 16,
          "step": 1,
          "value": 6,
          "unit": " 个"
        },
        {
          "type": "slider",
          "id": "waveType",
          "label": "信号形状 (0波动 1平顶阶梯 2斜坡)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDiff",
          "label": "高亮 Δ = x[k] - x[k-1]",
          "value": true
        }
      ],
      "jsCode": "var N = 16;\nvar signals = [\n  [0.40, 0.20, -0.30, -0.70, -0.80, -0.30, 0.40, 0.85, 0.90, 0.40, -0.20, -0.60, -0.50, 0.10, 0.60, 0.70],\n  [0.20, 0.20, 0.20, 0.80, 0.80, 0.80, 0.80, -0.40, -0.40, -0.40, -0.40, 0.50, 0.50, 0.50, -0.20, -0.20],\n  [-0.80, -0.70, -0.60, -0.50, -0.40, -0.30, -0.20, -0.10, 0.00, 0.10, 0.20, 0.30, 0.40, 0.50, 0.60, 0.70]\n];\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var k = Math.round(lab.values.k);\n  var M = Math.round(lab.values.reconM);\n  var wType = Math.round(lab.values.waveType);\n  var showDiff = !!lab.values.showDiff;\n  var x = signals[wType] || signals[0];\n\n  ctx.clearRect(0, 0, W, H);\n\n  var leftX = 28, panelW = 310, rightX = 382;\n  var cy = 126, scaleY = 74;\n\n  function drawGrid(px, pw, title) {\n    ctx.fillStyle = \"#f8fafc\";\n    ctx.font = \"bold 12px sans-serif\";\n    ctx.fillText(title, px, 20);\n\n    ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n    ctx.lineWidth = 1;\n    var yLevels = [-0.8, -0.4, 0, 0.4, 0.8];\n    for (var yi = 0; yi < yLevels.length; yi++) {\n      var yy = cy - yLevels[yi] * scaleY;\n      ctx.beginPath();\n      ctx.moveTo(px, yy);\n      ctx.lineTo(px + pw, yy);\n      ctx.stroke();\n    }\n    ctx.strokeStyle = \"rgba(255,255,255,0.22)\";\n    ctx.beginPath();\n    ctx.moveTo(px, cy);\n    ctx.lineTo(px + pw, cy);\n    ctx.stroke();\n\n    for (var n = 0; n < N; n++) {\n      var xx = px + 10 + (n / (N - 1)) * (pw - 20);\n      ctx.strokeStyle = \"rgba(255,255,255,0.06)\";\n      ctx.beginPath();\n      ctx.moveTo(xx, 34);\n      ctx.lineTo(xx, 214);\n      ctx.stroke();\n      if (n % 5 === 0 || n === N - 1) {\n        ctx.fillStyle = \"rgba(248,250,252,0.45)\";\n        ctx.font = \"10px monospace\";\n        ctx.fillText(String(n), xx - 3, 228);\n      }\n    }\n  }\n\n  drawGrid(leftX, panelW, \"原信号 x[n] (白虚线) vs 前 M=\" + M + \" 阶累加 (青绿)\");\n  drawGrid(rightX, panelW, \"第 k=\" + k + \" 个阶跃分量 x_\" + k + \"[n]\");\n\n  var recon = [];\n  for (var n = 0; n < N; n++) {\n    var sum = 0;\n    for (var j = 0; j < M; j++) {\n      if (j === 0) {\n        sum += x[0];\n      } else if (n >= j) {\n        sum += (x[j] - x[j - 1]);\n      }\n    }\n    recon.push(sum);\n  }\n\n  ctx.strokeStyle = \"rgba(248,250,252,0.45)\";\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var xx = leftX + 10 + (n / (N - 1)) * (panelW - 20);\n    var yy = cy - x[n] * scaleY;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (var n = 0; n < N; n++) {\n    var xx = leftX + 10 + (n / (N - 1)) * (panelW - 20);\n    var yy = cy - x[n] * scaleY;\n    ctx.fillStyle = \"rgba(248,250,252,0.6)\";\n    ctx.beginPath();\n    ctx.arc(xx, yy, 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  ctx.strokeStyle = \"#10b981\";\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var xx = leftX + 10 + (n / (N - 1)) * (panelW - 20);\n    var yy = cy - recon[n] * scaleY;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var xx = leftX + 10 + (n / (N - 1)) * (panelW - 20);\n    var yy = cy - recon[n] * scaleY;\n    ctx.fillStyle = \"#10b981\";\n    ctx.beginPath();\n    ctx.arc(xx, yy, 3.2, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var stepAmp = (k === 0) ? x[0] : (x[k] - x[k - 1]);\n\n  if (showDiff) {\n    var xkPos = leftX + 10 + (k / (N - 1)) * (panelW - 20);\n    var ykPos = cy - x[k] * scaleY;\n    ctx.fillStyle = \"#f59e0b\";\n    ctx.beginPath();\n    ctx.arc(xkPos, ykPos, 5, 0, Math.PI * 2);\n    ctx.fill();\n    if (k > 0) {\n      var xPrevPos = leftX + 10 + ((k - 1) / (N - 1)) * (panelW - 20);\n      var yPrevPos = cy - x[k - 1] * scaleY;\n      ctx.fillStyle = \"#f59e0b\";\n      ctx.beginPath();\n      ctx.arc(xPrevPos, yPrevPos, 4, 0, Math.PI * 2);\n      ctx.fill();\n\n      ctx.strokeStyle = \"#f59e0b\";\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      ctx.moveTo(xkPos, yPrevPos);\n      ctx.lineTo(xkPos, ykPos);\n      ctx.stroke();\n\n      ctx.strokeStyle = \"rgba(245,158,11,0.45)\";\n      ctx.setLineDash([2, 2]);\n      ctx.beginPath();\n      ctx.moveTo(xPrevPos, yPrevPos);\n      ctx.lineTo(xkPos, yPrevPos);\n      ctx.stroke();\n      ctx.setLineDash([]);\n    }\n  }\n\n  var stepColor = stepAmp >= 0 ? \"#38bdf8\" : \"#ec4899\";\n  var kxPos = rightX + 10 + (k / (N - 1)) * (panelW - 20);\n  ctx.strokeStyle = \"rgba(245,158,11,0.4)\";\n  ctx.setLineDash([3, 3]);\n  ctx.beginPath();\n  ctx.moveTo(kxPos, 34);\n  ctx.lineTo(kxPos, 214);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  for (var n = 0; n < N; n++) {\n    var val = (k === 0) ? x[0] : (n >= k ? stepAmp : 0);\n    var xx = rightX + 10 + (n / (N - 1)) * (panelW - 20);\n    var yy = cy - val * scaleY;\n    var active = (k === 0) || (n >= k);\n\n    ctx.strokeStyle = active ? stepColor : \"rgba(255,255,255,0.2)\";\n    ctx.lineWidth = active ? 2 : 1;\n    ctx.beginPath();\n    ctx.moveTo(xx, cy);\n    ctx.lineTo(xx, yy);\n    ctx.stroke();\n\n    ctx.fillStyle = active ? stepColor : \"rgba(255,255,255,0.3)\";\n    ctx.beginPath();\n    ctx.arc(xx, yy, active ? 3.5 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  if (k === 0) {\n    lab.setReadout(\"特殊分量 x_0[n]: 全体样本均为 x[0]=\" + x[0].toFixed(2) + \" | 前 \" + M + \" 阶累加已精确还原 n=0..\" + (M - 1));\n  } else {\n    var signStr = stepAmp >= 0 ? \"+\" : \"\";\n    lab.setReadout(\"x[\" + k + \"]=\" + x[k].toFixed(2) + \", x[\" + (k - 1) + \"]=\" + x[k - 1].toFixed(2) + \" -> x_\" + k + \"[n] 台阶高度=\" + signStr + stepAmp.toFixed(2) + \" (0..\" + (k - 1) + \"为0) | 累加 M=\" + M + \" 阶\");\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "无损还原与线性系统的“阶跃响应”视角",
      "paragraphs": [
        "把全部 `N` 个阶跃分量加在一起为什么能分毫不差地还原出原信号？秘密在于**裂项相消（Telescoping Sum）**：在任意位置 `n`，只有下标 `k ≤ n` 的阶跃分量已经“起跳”，于是累加结果等于 `x[0] + (x[1]-x[0]) + (x[2]-x[1]) + ... + (x[n]-x[n-1])`，中间项前后抵消，最终精确剩下 `x[n]`。",
        "这种分解对研究**线性系统（Linear Systems）**有着极其直观的物理意义：正如脉冲分解把信号拆成一个个孤立的点、从而用系统的“脉冲响应”来计算输出；阶跃分解则是通过相邻样本的差值来刻画信号，因此它用系统对输入**变化（阶跃）**的响应——即**阶跃响应（Step Response）**——来完整刻画系统特性。",
        "你会发现，当信号处于平坦不变的区间（例如实验一里的平顶阶梯波 `1`）时，相邻样本差值为 `0`，对应的阶跃分量整条为零；只有当信号发生剧烈跳变时，才会产生幅度很大的阶跃分量。换言之，阶跃分解天然把信号“哪里没变、哪里在变”剥离得一清二楚。"
      ],
      "formula": {
        "expr": "x[n] = Σ_{k=0}^{N-1} x_k[n] = x[0] + Σ_{k=1}^{n} (x[k] - x[k-1])",
        "explain": "左侧代表将全部分解后的阶跃信号叠加（Synthesis）；右侧表明在时刻 n，所有 k > n 的阶跃分量此时值仍为 0，只有 k ≤ n 的台阶参与累加并相互抵消中间项，最终无损还原 x[n]。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：阶跃变化量感知与音频听觉对比",
      "instruction": "点击播放声音，分别切换“方波 / 三角波 / 正弦波”并打开“仅输出阶跃变化量”开关，同时观察上方原信号与下方相邻差值 Δx[k] 的声画对应关系。",
      "controls": [
        {
          "type": "slider",
          "id": "waveType",
          "label": "波形 (0方波 1三角波 2正弦波)",
          "min": 0,
          "max": 2,
          "step": 1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "freq",
          "label": "信号基频",
          "min": 110,
          "max": 440,
          "step": 10,
          "value": 220,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "listenDiff",
          "label": "声音切换：仅听阶跃变化量 Δx[k]",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放音频对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var N = 32;\nvar scanK = 0;\nvar audioState = { src: null, gain: null, lastKey: \"\" };\n\nfunction getWave(wType) {\n  var arr = [];\n  for (var n = 0; n < N; n++) {\n    if (wType === 0) {\n      arr.push((n >= 8 && n < 24) ? 0.8 : -0.8);\n    } else if (wType === 1) {\n      var t = n / N;\n      var tri = t < 0.25 ? (4 * t) : (t < 0.75 ? (2 - 4 * t) : (4 * t - 4));\n      arr.push(0.8 * tri);\n    } else {\n      arr.push(0.85 * Math.sin((2 * Math.PI * n) / N));\n    }\n  }\n  return arr;\n}\n\nfunction updateAudio(x) {\n  var play = !!lab.values.play;\n  if (!play) {\n    if (audioState.src) {\n      try { audioState.src.stop(); audioState.src.disconnect(); } catch (e) {}\n      audioState.src = null;\n    }\n    audioState.lastKey = \"\";\n    return;\n  }\n\n  var wType = Math.round(lab.values.waveType);\n  var freq = Math.round(lab.values.freq);\n  var listenDiff = !!lab.values.listenDiff;\n  var key = wType + \"_\" + freq + \"_\" + listenDiff;\n\n  if (key === audioState.lastKey && audioState.src) return;\n\n  var actx = lab.getAudioContext();\n  if (actx.state === \"suspended\") {\n    actx.resume();\n  }\n  if (audioState.src) {\n    try { audioState.src.stop(); audioState.src.disconnect(); } catch (e) {}\n    audioState.src = null;\n  }\n  if (!audioState.gain) {\n    audioState.gain = actx.createGain();\n    audioState.gain.gain.value = 0.14;\n    audioState.gain.connect(actx.destination);\n  }\n\n  var len = Math.max(32, Math.round(actx.sampleRate / freq));\n  var buf = actx.createBuffer(1, len, actx.sampleRate);\n  var ch = buf.getChannelData(0);\n\n  var srcWave = [];\n  if (!listenDiff) {\n    srcWave = x;\n  } else {\n    var maxAbs = 0;\n    for (var k = 0; k < N; k++) {\n      var dv = x[k] - x[(k + N - 1) % N];\n      srcWave.push(dv);\n      if (Math.abs(dv) > maxAbs) maxAbs = Math.abs(dv);\n    }\n    var norm = maxAbs > 1e-6 ? (0.85 / maxAbs) : 1;\n    for (var k = 0; k < N; k++) {\n      srcWave[k] *= norm;\n    }\n  }\n\n  for (var i = 0; i < len; i++) {\n    var idx = Math.floor((i * N) / len);\n    ch[i] = srcWave[idx];\n  }\n\n  var src = actx.createBufferSource();\n  src.buffer = buf;\n  src.loop = true;\n  src.connect(audioState.gain);\n  src.start();\n  audioState.src = src;\n  audioState.lastKey = key;\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var wType = Math.round(lab.values.waveType);\n  var freq = Math.round(lab.values.freq);\n  var listenDiff = !!lab.values.listenDiff;\n  var x = getWave(wType);\n\n  var d = [];\n  var maxD = 0.001;\n  for (var k = 0; k < N; k++) {\n    var val = (k === 0) ? x[0] : (x[k] - x[k - 1]);\n    d.push(val);\n    if (k > 0 && Math.abs(val) > maxD) maxD = Math.abs(val);\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  var left = 36, right = 694, pw = right - left;\n  var topCy = 66, topScale = 36;\n  var botCy = 180, botScale = 36 / Math.max(0.2, maxD);\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.08)\";\n  ctx.lineWidth = 1;\n  for (var n = 0; n < N; n++) {\n    var xx = left + (n / (N - 1)) * pw;\n    ctx.beginPath();\n    ctx.moveTo(xx, 24);\n    ctx.lineTo(xx, 224);\n    ctx.stroke();\n  }\n\n  ctx.strokeStyle = \"rgba(255,255,255,0.2)\";\n  ctx.beginPath();\n  ctx.moveTo(left, topCy);\n  ctx.lineTo(right, topCy);\n  ctx.moveTo(left, botCy);\n  ctx.lineTo(right, botCy);\n  ctx.stroke();\n\n  ctx.fillStyle = listenDiff ? \"rgba(248,250,252,0.55)\" : \"#38bdf8\";\n  ctx.font = \"bold 12px sans-serif\";\n  ctx.fillText(\"原信号 x[n] (32点)\" + (listenDiff ? \"\" : \"  [当前发声]\"), left, 18);\n\n  ctx.fillStyle = listenDiff ? \"#10b981\" : \"rgba(248,250,252,0.65)\";\n  ctx.fillText(\"相邻阶跃变化量 Δx[k] = x[k] - x[k-1]\" + (listenDiff ? \"  [当前发声]\" : \"\"), left, 132);\n\n  var scanX = left + (scanK / (N - 1)) * pw;\n  ctx.fillStyle = \"rgba(245,158,11,0.12)\";\n  ctx.fillRect(scanX - 6, 24, 12, 200);\n\n  var activeAmp = d[scanK];\n  ctx.strokeStyle = \"rgba(245,158,11,0.55)\";\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var xx = left + (n / (N - 1)) * pw;\n    var sv = (scanK === 0) ? x[0] : (n >= scanK ? activeAmp : 0);\n    var yy = topCy - Math.max(-1.1, Math.min(1.1, sv)) * topScale;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = listenDiff ? \"rgba(56,189,248,0.45)\" : \"#38bdf8\";\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var n = 0; n < N; n++) {\n    var xx = left + (n / (N - 1)) * pw;\n    var yy = topCy - x[n] * topScale;\n    if (n === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);\n  }\n  ctx.stroke();\n\n  for (var n = 0; n < N; n++) {\n    var xx = left + (n / (N - 1)) * pw;\n    var yy = topCy - x[n] * topScale;\n    ctx.fillStyle = (n === scanK) ? \"#f59e0b\" : (listenDiff ? \"rgba(56,189,248,0.6)\" : \"#f8fafc\");\n    ctx.beginPath();\n    ctx.arc(xx, yy, (n === scanK) ? 4 : 2.5, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  for (var k = 0; k < N; k++) {\n    var xx = left + (k / (N - 1)) * pw;\n    var val = (k === 0) ? 0 : d[k];\n    var yy = botCy - val * botScale;\n    var col = (k === scanK) ? \"#f59e0b\" : (k === 0 ? \"rgba(255,255,255,0.25)\" : (val >= 0 ? \"#10b981\" : \"#ec4899\"));\n    ctx.strokeStyle = col;\n    ctx.lineWidth = (k === scanK) ? 2.5 : 2;\n    ctx.beginPath();\n    ctx.moveTo(xx, botCy);\n    ctx.lineTo(xx, yy);\n    ctx.stroke();\n    ctx.fillStyle = col;\n    ctx.beginPath();\n    ctx.arc(xx, yy, (k === scanK) ? 3.8 : 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n\n  var wNames = [\"方波(变化集中于跳变沿)\", \"三角波(斜率恒定->变化量为方波)\", \"正弦波(变化量呈余弦分布)\"];\n  lab.setReadout(\"波形: \" + wNames[wType] + \" | 基频: \" + freq + \" Hz | 扫描点 k=\" + scanK + (scanK === 0 ? \" (x[0]=\" + x[0].toFixed(2) + \")\" : \" (Δx[\" + scanK + \"]=\" + d[scanK].toFixed(2) + \")\"));\n}\n\nlab.onUpdate(function() {\n  var wType = Math.round(lab.values.waveType);\n  updateAudio(getWave(wType));\n  draw();\n});\n\nlab.onLoop(function(dt, timeSec) {\n  scanK = Math.floor(timeSec * 6) % N;\n  draw();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "切勿漏掉第 0 个特例分量：写代码实现阶跃分解时，k ≥ 1 的台阶高度是 x[k] - x[k-1]，而 k = 0 没有前驱点，必须令 x_0[n] 全程等于 x[0]，否则重构出的整个波形都会丢失直流基线偏置。",
        "注意下标边界：第 k 个阶跃分量在前 k 个点（下标 0 到 k-1）必须严格为 0，在下标 k 处才发生跳变并保持到 N-1。",
        "一句话记住物理本质：脉冲分解把信号拆成“点”，用脉冲响应描述系统；阶跃分解把信号拆成“相邻变化量”，用系统对突变（阶跃）的响应来刻画系统。"
      ]
    }
  ]
});
