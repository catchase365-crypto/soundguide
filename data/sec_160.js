window.__BOOK_REGISTER_SECTION__("sec_160", {
  "title": "对决 #3：滑动平均 vs. 单极点递归滤波器 (Match #3: Moving Average vs. Single Pole)",
  "intuition": "在时域平滑滤波器的对决中，滑动平均与双向单极点递归在滤波性能上难分伯仲；真正的胜负手在于‘快速开发（浮点运算）’与‘极致运行速度（定点整数）’之间的工程权衡。",
  "blocks": [
    {
      "type": "concept",
      "heading": "第一回合：对决双方登场与频率响应交锋（0 : 0 平局）",
      "paragraphs": [
        "在前两场对决聚焦于频域分离之后，第三场比赛是一场纯粹的**时域滤波器（Time-domain filters）**内战。对阵双方分别是：**9 点滑动平均滤波器（Nine-point moving average filter）**，以及采用**双向零相移技术（Bidirectional technique）的单极点递归滤波器（Single pole recursive filter）**。",
        "为了在同一起跑线上对比两者的性能，单极点递归滤波器的样本间衰减系数被设定为 `x = 0.70`。所谓双向技术，就是先从左到右进行一次正向递归滤波，再将结果翻转从右到左进行一次反向递归滤波，从而彻底抵消单极点滤波固有的相位滞后，使其脉冲响应对称。",
        "第一回合比拼**频率响应**（对应原书 Fig. 21-6）：滑动平均的幅频曲线呈现典型的 $\\text{sinc}$ 旁瓣起伏（在 `0.111`、`0.222` 等频率处出现零点，但阻带衰减很差）；单极点递归虽然曲线平滑没有旁瓣突起，但过渡带滚降极其缓慢。作者对此的判词非常干脆：**两者都不算惊艳，但频域分离本来就不是这类时域滤波器的工作**。因此本回合双方均不得分（0 : 0）。"
      ],
      "formula": {
        "expr": "MA: y[n] = (1/M) Σ x[n-k]  |  双向单极点: |H(f)| = (1-x)² / (1 - 2x·cos(2πf) + x²)",
        "explain": "M 为滑动平均窗口点数（本节为 9）；x 为单极点滤波器的样本衰减系数（本节为 0.70）；f 为归一化频率（0 到 0.5）；双向滤波使单极点的幅频响应相当于单次滤波的平方。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复现 Fig. 21-6 与 Fig. 21-7 —— 频响与阶跃响应实时对比",
      "instruction": "拖动滑块调整滑动平均点数 M 与单极点衰减系数 x，观察左侧频域滚降与右侧时域阶跃曲线的对应变化；可关闭‘双向零相移’开关对比单向递归的相位滞后。",
      "controls": [
        {
          "type": "slider",
          "id": "points",
          "label": "滑动平均点数 (M)",
          "min": 3,
          "max": 19,
          "step": 2,
          "value": 9,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "decay",
          "label": "单极点衰减系数 (x)",
          "min": 0.3,
          "max": 0.9,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "bidir",
          "label": "单极点启用双向零相移滤波",
          "value": true
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nfunction draw() {\n  var M = lab.values.points;\n  var x = lab.values.decay;\n  var bidir = lab.values.bidir;\n  ctx.clearRect(0, 0, W, H);\n  var lx = 46, ly = 34, lw = 286, lh = 166;\n  var rx = 398, ry = 34, rw = 294, rh = 166;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 5; g++) {\n    var gy = ly + lh - (g / 5.5) * lh;\n    if (gy >= ly) {\n      ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n      ctx.beginPath(); ctx.moveTo(rx, gy); ctx.lineTo(rx + rw, gy); ctx.stroke();\n    }\n    var gxL = lx + (g / 5) * lw;\n    ctx.beginPath(); ctx.moveTo(gxL, ly); ctx.lineTo(gxL, ly + lh); ctx.stroke();\n  }\n  for (var gs = 0; gs <= 4; gs++) {\n    var gxR = rx + (gs / 4) * rw;\n    ctx.beginPath(); ctx.moveTo(gxR, ry); ctx.lineTo(gxR, ry + rh); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(lx, ly, lw, lh);\n  ctx.strokeRect(rx, ry, rw, rh);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('频率响应对比 (Fig. 21-6)', lx + lw / 2, 20);\n  ctx.fillText('阶跃响应对比 (Fig. 21-7)', rx + rw / 2, 20);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  for (var fi = 0; fi <= 5; fi++) {\n    ctx.fillText((fi * 0.1).toFixed(1), lx + (fi / 5) * lw, ly + lh + 14);\n  }\n  ctx.fillText('归一化频率', lx + lw / 2, ly + lh + 28);\n  for (var si = -20; si <= 20; si += 10) {\n    ctx.fillText(String(si), rx + ((si + 20) / 40) * rw, ry + rh + 14);\n  }\n  ctx.fillText('样本序号 n', rx + rw / 2, ry + rh + 28);\n  ctx.textAlign = 'right';\n  for (var yi = 0; yi <= 10; yi += 2) {\n    var val = yi / 10;\n    var yPos = ly + lh - (val / 1.1) * lh;\n    ctx.fillText(val.toFixed(1), lx - 5, yPos + 3);\n    ctx.fillText(val.toFixed(1), rx - 5, yPos + 3);\n  }\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  for (var p = 0; p <= 200; p++) {\n    var f = (p / 200) * 0.5;\n    var magMA = f < 1e-6 ? 1.0 : Math.abs(Math.sin(Math.PI * f * M) / (M * Math.sin(Math.PI * f)));\n    var px = lx + (f / 0.5) * lw;\n    var py = ly + lh - (Math.min(1.1, magMA) / 1.1) * lh;\n    if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  for (var p2 = 0; p2 <= 200; p2++) {\n    var f2 = (p2 / 200) * 0.5;\n    var denom = 1 - 2 * x * Math.cos(2 * Math.PI * f2) + x * x;\n    var magSP = bidir ? ((1 - x) * (1 - x) / denom) : ((1 - x) / Math.sqrt(denom));\n    var px2 = lx + (f2 / 0.5) * lw;\n    var py2 = ly + lh - (Math.min(1.1, magSP) / 1.1) * lh;\n    if (p2 === 0) ctx.moveTo(px2, py2); else ctx.lineTo(px2, py2);\n  }\n  ctx.stroke();\n  var PAD = 100, LEN = 201;\n  var u = new Array(LEN), yf = new Array(LEN), yb = new Array(LEN);\n  for (var i = 0; i < LEN; i++) u[i] = (i - PAD >= 0) ? 1 : 0;\n  yf[0] = 0;\n  for (var i2 = 1; i2 < LEN; i2++) yf[i2] = (1 - x) * u[i2] + x * yf[i2 - 1];\n  yb[LEN - 1] = 1.0;\n  for (var i3 = LEN - 2; i3 >= 0; i3--) yb[i3] = (1 - x) * yf[i3] + x * yb[i3 + 1];\n  var spArr = bidir ? yb : yf;\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(rx, ry + rh);\n  ctx.lineTo(rx + rw * 0.5, ry + rh);\n  ctx.lineTo(rx + rw * 0.5, ry + rh - (1 / 1.1) * rh);\n  ctx.lineTo(rx + rw, ry + rh - (1 / 1.1) * rh);\n  ctx.stroke();\n  ctx.restore();\n  var half = (M - 1) / 2;\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  var maPts = [];\n  for (var n = -20; n <= 20; n++) {\n    var sum = 0;\n    for (var j = -half; j <= half; j++) sum += u[PAD + n + j];\n    var vMA = sum / M;\n    var sx = rx + ((n + 20) / 40) * rw;\n    var sy = ry + rh - (vMA / 1.1) * rh;\n    maPts.push([sx, sy]);\n    if (n === -20) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  for (var k1 = 0; k1 < maPts.length; k1++) {\n    ctx.beginPath(); ctx.arc(maPts[k1][0], maPts[k1][1], 2.2, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  var spPts = [];\n  var riseCount = 0;\n  for (var n2 = -20; n2 <= 20; n2++) {\n    var vSP = spArr[PAD + n2];\n    if (vSP > 0.1 && vSP < 0.9) riseCount++;\n    var sx2 = rx + ((n2 + 20) / 40) * rw;\n    var sy2 = ry + rh - (vSP / 1.1) * rh;\n    spPts.push([sx2, sy2]);\n    if (n2 === -20) ctx.moveTo(sx2, sy2); else ctx.lineTo(sx2, sy2);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  for (var k2 = 0; k2 < spPts.length; k2++) {\n    ctx.beginPath(); ctx.arc(spPts[k2][0], spPts[k2][1], 2.2, 0, Math.PI * 2); ctx.fill();\n  }\n  ctx.textAlign = 'left';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('■ 滑动平均 (' + M + '点)', 406, 48);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('■ 单极点递归 (x=' + x.toFixed(2) + (bidir ? ', 双向' : ', 单向滞后') + ')', 406, 64);\n  lab.setReadout('滑动平均过渡样本: ' + M + ' 点 (直线跃迁)  |  单极点 10%~90% 过渡: 约 ' + riseCount + ' 点 (' + (bidir ? '对称S型平滑' : '存在向右相移滞后') + ')');\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "第二回合与终极决胜：阶跃响应（1 : 1）与开发/运行时间权衡",
      "paragraphs": [
        "第二回合比拼**阶跃响应（Step Response）**（对应原书 Fig. 21-7）：在信号从一个电平跳变到另一个电平时，**滑动平均滤波器**的阶跃响应是一条完美的直线，这是在给定过渡宽度下从一个电平移动到另一个电平**最迅速**的方式；而**双向单极点递归滤波器**的阶跃响应是一条优雅的 S 型曲线，过渡更柔和圆滑，在视觉或某些物理控制应用中表现更佳。各具优势，因此双方各得 1 分，总分战成 1 : 1 平。",
        "既然性能势均力敌，真正的选型依据就落在**开发时间（Development time）与运行时间（Execution time）**的工程权衡上，原书给出了两个截然相反的决胜场景：",
        "**场景一：追求极短开发时间，容忍较慢运行速度**。例如你只需一次性处理几千个数据点，整个程序几秒钟就能跑完，完全没必要花费精力去优化算法，直接用**浮点数（Floating point）**编写即可。此时若用普通**卷积**实现滑动平均，对比单极点递归滤波器，**胜出者是单极点递归滤波器**——它代码极简、参数极易修改，且运行速度远快于直接卷积。",
        "**场景二：追求极致运行速度，愿意投入额外开发时间**。例如该滤波器要放进商业产品中，未来将被运行数百万次，你几乎一定会使用**定点整数（Integers）**来榨干硬件性能。此时若用**递归滑动和（Moving average by recursion）**实现滑动平均，对比用查表法或整数算术实现的单极点递归，**胜出者是滑动平均滤波器**——它不仅执行更快，而且**完全免疫整数算术带来的截断漂移与开发陷阱**。"
      ],
      "formula": {
        "expr": "递归滑动平均: y[i] = y[i-1] + (x[i+p] - x[i-q]) / M  |  单极点整数迭代: y[i] = ⌊((1-x)·in[i] + x·y[i-1])⌋",
        "explain": "递归滑动平均只需维护整数累加和（一加一减），仅在最后做一次除法，不会累积误差；而单极点递归每次迭代都要做乘除法并截断取整，极易卡死在目标值附近（死区误差）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：定点整数截断陷阱与实时音频平滑听感对比",
      "instruction": "开启‘模拟定点整数截断误差’开关，观察蓝色单极点曲线在平台期出现的致命‘卡死’掉高现象；点击播放按钮可实时对比两种滤波器在噪声信号下的听感差异。",
      "controls": [
        {
          "type": "slider",
          "id": "noise",
          "label": "输入信号噪声强度",
          "min": 0,
          "max": 0.6,
          "step": 0.05,
          "value": 0.25,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "strength",
          "label": "平滑强度 (对应 M 与 x)",
          "min": 1,
          "max": 5,
          "step": 1,
          "value": 3,
          "unit": " 档"
        },
        {
          "type": "toggle",
          "id": "intMath",
          "label": "模拟定点整数截断误差 (8-bit)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "audioMA",
          "label": "音频监听滑动平均 (关=听单极点递归)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放滤波后测试音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar srcNode = null;\nfunction pseudoNoise(i) {\n  var v = Math.sin(i * 12.9898 + 78.233) * 43758.5453;\n  return (v - Math.floor(v)) * 2 - 1;\n}\nfunction stopAudio() {\n  if (srcNode) {\n    try { srcNode.stop(); srcNode.disconnect(); } catch (e) {}\n    srcNode = null;\n  }\n}\nfunction update() {\n  var noise = lab.values.noise;\n  var strength = lab.values.strength;\n  var intMath = lab.values.intMath;\n  var audioMA = lab.values.audioMA;\n  var play = lab.values.play;\n  var M = 2 * strength + 3;\n  var xArr = [0.50, 0.60, 0.70, 0.80, 0.88];\n  var x = xArr[strength - 1];\n  var N = 140;\n  var raw = new Array(N), inInt = new Array(N);\n  for (var i = 0; i < N; i++) {\n    var base = (i >= 30 && i < 100) ? 1.0 : 0.0;\n    raw[i] = base + noise * pseudoNoise(i);\n    inInt[i] = Math.round(raw[i] * 100);\n  }\n  var half = (M - 1) / 2;\n  var ma = new Array(N);\n  for (var i2 = 0; i2 < N; i2++) {\n    var sum = 0;\n    for (var j = -half; j <= half; j++) {\n      var idx = Math.max(0, Math.min(N - 1, i2 + j));\n      sum += intMath ? inInt[idx] : raw[idx];\n    }\n    ma[i2] = intMath ? (Math.floor(sum / M) / 100) : (sum / M);\n  }\n  var yf = new Array(N), sp = new Array(N);\n  if (intMath) {\n    var aInt = Math.round((1 - x) * 256);\n    var bInt = 256 - aInt;\n    var curF = 0;\n    for (var i3 = 0; i3 < N; i3++) {\n      curF = Math.floor((aInt * inInt[i3] + bInt * curF) / 256);\n      yf[i3] = curF;\n    }\n    var curB = yf[N - 1];\n    for (var i4 = N - 1; i4 >= 0; i4--) {\n      curB = Math.floor((aInt * yf[i4] + bInt * curB) / 256);\n      sp[i4] = curB / 100;\n    }\n  } else {\n    var curF2 = 0;\n    for (var i5 = 0; i5 < N; i5++) {\n      curF2 = (1 - x) * raw[i5] + x * curF2;\n      yf[i5] = curF2;\n    }\n    var curB2 = yf[N - 1];\n    for (var i6 = N - 1; i6 >= 0; i6--) {\n      curB2 = (1 - x) * yf[i6] + x * curB2;\n      sp[i6] = curB2;\n    }\n  }\n  var maMean = 0, spMean = 0;\n  for (var m = 55; m < 85; m++) { maMean += ma[m]; spMean += sp[m]; }\n  maMean /= 30; spMean /= 30;\n  ctx.clearRect(0, 0, W, H);\n  var px0 = 46, py0 = 24, pw = 648, ph = 180;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gy = 0; gy <= 4; gy++) {\n    var yy = py0 + (gy / 4) * ph;\n    ctx.beginPath(); ctx.moveTo(px0, yy); ctx.lineTo(px0 + pw, yy); ctx.stroke();\n  }\n  for (var gx = 0; gx <= 7; gx++) {\n    var xx = px0 + (gx / 7) * pw;\n    ctx.beginPath(); ctx.moveTo(xx, py0); ctx.lineTo(xx, py0 + ph); ctx.stroke();\n  }\n  function mapY(v) { return py0 + ph * 0.78 - v * (ph * 0.56); }\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  ctx.moveTo(px0, mapY(1.0)); ctx.lineTo(px0 + pw, mapY(1.0));\n  ctx.stroke();\n  ctx.restore();\n  ctx.beginPath();\n  ctx.strokeStyle = 'rgba(248,250,252,0.28)';\n  ctx.lineWidth = 1.2;\n  for (var r = 0; r < N; r++) {\n    var rx = px0 + (r / (N - 1)) * pw;\n    var ry = mapY(raw[r]);\n    if (r === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);\n  }\n  ctx.stroke();\n  ctx.beginPath();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.2;\n  for (var r1 = 0; r1 < N; r1++) {\n    var rx1 = px0 + (r1 / (N - 1)) * pw;\n    var ry1 = mapY(ma[r1]);\n    if (r1 === 0) ctx.moveTo(rx1, ry1); else ctx.lineTo(rx1, ry1);\n  }\n  ctx.stroke();\n  ctx.beginPath();\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.2;\n  for (var r2 = 0; r2 < N; r2++) {\n    var rx2 = px0 + (r2 / (N - 1)) * pw;\n    var ry2 = mapY(sp[r2]);\n    if (r2 === 0) ctx.moveTo(rx2, ry2); else ctx.lineTo(rx2, ry2);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'right';\n  ctx.fillText('1.0', px0 - 6, mapY(1.0) + 3);\n  ctx.fillText('0.0', px0 - 6, mapY(0.0) + 3);\n  ctx.textAlign = 'left';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.fillText('--- 含噪输入', 54, 16);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('— 滑动平均 (M=' + M + ')', 142, 16);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('— 单极点递归 (x=' + x.toFixed(2) + ')', 275, 16);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('--- 理想目标 1.00', 430, 16);\n  if (intMath && spMean < 0.96) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('⚠ 定点截断死区：单极点卡在 ' + spMean.toFixed(2) + ' 无法到达 1.00！', 210, 222);\n  }\n  stopAudio();\n  if (play) {\n    var actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    var sr = actx.sampleRate || 44100;\n    var bufLen = sr;\n    var buf = actx.createBuffer(1, bufLen, sr);\n    var ch = buf.getChannelData(0);\n    var rawA = new Float32Array(bufLen);\n    for (var s = 0; s < bufLen; s++) {\n      var sq = Math.sin(2 * Math.PI * 160 * s / sr) >= 0 ? 0.55 : -0.55;\n      rawA[s] = sq + noise * (Math.random() * 2 - 1);\n    }\n    if (audioMA) {\n      var runSum = 0;\n      for (var s1 = 0; s1 < bufLen; s1++) {\n        var addV = intMath ? Math.round(rawA[s1] * 60) : rawA[s1];\n        var subIdx = s1 - M;\n        var subV = subIdx >= 0 ? (intMath ? Math.round(rawA[subIdx] * 60) : rawA[subIdx]) : 0;\n        runSum += addV - subV;\n        var outV = intMath ? (Math.round(runSum / M) / 60) : (runSum / M);\n        ch[s1] = Math.max(-0.35, Math.min(0.35, outV * 0.25));\n      }\n    } else {\n      var a2 = Math.round((1 - x) * 256);\n      var b2 = 256 - a2;\n      var prev = 0;\n      for (var s2 = 0; s2 < bufLen; s2++) {\n        if (intMath) {\n          var inS = Math.round(rawA[s2] * 60);\n          prev = Math.floor((a2 * inS + b2 * prev) / 256);\n          ch[s2] = Math.max(-0.35, Math.min(0.35, (prev / 60) * 0.25));\n        } else {\n          prev = (1 - x) * rawA[s2] + x * prev;\n          ch[s2] = Math.max(-0.35, Math.min(0.35, prev * 0.25));\n        }\n      }\n    }\n    srcNode = actx.createBufferSource();\n    srcNode.buffer = buf;\n    srcNode.loop = true;\n    srcNode.connect(actx.destination);\n    srcNode.start();\n  }\n  lab.setReadout('平台期均值(目标1.00) -> 滑动平均: ' + maMean.toFixed(3) + ' | 单极点递归: ' + spMean.toFixed(3) + (intMath ? ' [整数截断模式]' : ' [浮点精确模式]') + (play ? ' | 正在播放: ' + (audioMA ? '滑动平均' : '单极点递归') : ''));\n}\nlab.onUpdate(update);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（千万别用定点整数硬写单极点递归）：在整数算术下，递归项乘以小于 1 的系数后向下取整，会导致输出在接近目标值时因增量不足 1 个 LSB 而永久“卡死”（Deadband），还会引入直流偏移与谐波失真。",
        "避坑 2（时域滤波器别强求频域陡峭度）：9 点滑动平均与双向单极点递归（x=0.70）的频响都很平庸，它们的主战场是时域降噪与波形平滑——需要最快的直线阶跃过渡选滑动平均，需要圆滑 S 型过渡选双向单极点。",
        "选型口诀：一次性浮点脚本图省事、跑得快 $\\rightarrow$ 选单极点递归；商业级定点整数高频调用榨干性能 $\\rightarrow$ 选递归实现的滑动平均（只做整数加减，免疫定点误差）。"
      ]
    }
  ]
});
