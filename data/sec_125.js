window.__BOOK_REGISTER_SECTION__("sec_125", {
  "title": "连续信号卷积：积分视角与工程求解策略 (Convolution)",
  "intuition": "连续卷积把离散的“乘加求和”推广为“乘积积分”：在物理上它是输入信号无数个微元脉冲在系统中的响应叠加，在数学上则是翻转平移后的系统冲激响应对输入信号的加权扫描。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、输入侧 vs. 输出侧：连续卷积的双重视角",
      "paragraphs": [
        "与离散信号完全类似，连续信号的卷积 `y(t) = x(t) * h(t)` 也可以从**输入侧**和**输出侧**两个视角来理解，二者分别对应“物理直觉”和“数学计算”。",
        "**输入侧视角（最佳概念图景）**：把连续输入信号 `x(t)` 切分成无数个宽度极窄的矩形柱。当宽度趋近于无穷小时，每个微元就等价于一个按幅值缩放、且在时间上平移了的冲激（Delta 函数）。线性系统对每个微元冲激都会产生一个缩放并平移后的冲激响应 `h(t)`，最终输出 `y(t)` 就是所有这些个体响应的连续叠加（积分）。",
        "**输出侧视角（直接用于列式计算）**：聚焦于输出信号在某一个特定时刻 `t` 的瞬时值 `y(t)` 是如何由输入信号决定的。为了避免变量冲突，先将自变量 `t` 替换为哑变量 `τ`（希腊字母 tau），把冲激响应左右翻转为 `h(-τ)` 并平移到时刻 `t` 得到 `h(t - τ)`，再用它去加权（相乘）输入信号 `x(τ)`，最后从负无穷到正无穷积分，就得到了连续卷积积分。"
      ],
      "formula": {
        "expr": "y(t) = ∫_{-∞}^{+∞} x(τ) · h(t - τ) dτ",
        "explain": "x(τ) 为输入信号；t 为正在求解的输出时刻（积分过程中视为常数）；τ 为扫描积分变量；h(t - τ) 为左右翻转并向右平移了 t 后的系统冲激响应。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：卷积积分几何扫描与 RC 滤波器响应",
      "instruction": "拖动“当前时刻 t”滑块（或开启自动扫描），观察左图中翻转平移后的冲激响应 h(t-τ) 如何扫过方波输入 x(τ)，以及右图输出 y(t) 的三段式变化。",
      "controls": [
        {
          "type": "slider",
          "id": "tPos",
          "label": "当前时刻 t",
          "min": -0.8,
          "max": 3,
          "step": 0.02,
          "value": 0.7,
          "unit": " s"
        },
        {
          "type": "slider",
          "id": "alpha",
          "label": "RC 衰减率 α=1/(RC)",
          "min": 0.5,
          "max": 5,
          "step": 0.1,
          "value": 1.8,
          "unit": " /s"
        },
        {
          "type": "toggle",
          "id": "autoScan",
          "label": "自动扫描时间 t",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showArea",
          "label": "高亮乘积积分面积",
          "value": true
        }
      ],
      "jsCode": "var curT = lab.values.tPos;\nfunction evalY(t, a) {\n  if (t < 0) return 0;\n  if (t <= 1) return 1 - Math.exp(-a * t);\n  return Math.exp(-a * (t - 1)) - Math.exp(-a * t);\n}\nfunction render(tVal) {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var a = lab.values.alpha;\n  var showArea = lab.values.showArea;\n  ctx.clearRect(0, 0, W, H);\n  var lx0 = 38, lx1 = 344, lyBase = 202, lyTop = 30;\n  var rx0 = 398, rx1 = 702, ryBase = 202, ryTop = 30;\n  var maxYL = Math.max(1.6, a * 1.15);\n  var maxYR = 1.25;\n  function mapLX(tau) { return lx0 + ((tau + 1.2) / 4.0) * (lx1 - lx0); }\n  function mapLY(v) { return lyBase - (v / maxYL) * (lyBase - lyTop); }\n  function mapRX(tt) { return rx0 + ((tt + 0.8) / 3.8) * (rx1 - rx0); }\n  function mapRY(v) { return ryBase - (v / maxYR) * (ryBase - ryTop); }\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var i;\n  for (i = -1; i <= 2; i++) {\n    var gx = mapLX(i);\n    ctx.beginPath(); ctx.moveTo(gx, lyTop); ctx.lineTo(gx, lyBase); ctx.stroke();\n  }\n  for (i = 0; i <= 3; i++) {\n    var rx = mapRX(i);\n    ctx.beginPath(); ctx.moveTo(rx, ryTop); ctx.lineTo(rx, ryBase); ctx.stroke();\n  }\n  for (i = 1; i <= Math.floor(maxYL); i++) {\n    var gy = mapLY(i);\n    ctx.beginPath(); ctx.moveTo(lx0, gy); ctx.lineTo(lx1, gy); ctx.stroke();\n  }\n  for (i = 1; i <= 2; i++) {\n    var rgy = mapRY(i * 0.5);\n    ctx.beginPath(); ctx.moveTo(rx0, rgy); ctx.lineTo(rx1, rgy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.beginPath();\n  ctx.moveTo(lx0, lyBase); ctx.lineTo(lx1, lyBase);\n  ctx.moveTo(mapLX(0), lyTop); ctx.lineTo(mapLX(0), lyBase);\n  ctx.moveTo(rx0, ryBase); ctx.lineTo(rx1, ryBase);\n  ctx.moveTo(mapRX(0), ryTop); ctx.lineTo(mapRX(0), ryBase);\n  ctx.stroke();\n  if (showArea && tVal > 0) {\n    var ovEnd = Math.min(tVal, 1.0);\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.35)';\n    ctx.beginPath();\n    ctx.moveTo(mapLX(0), mapLY(0));\n    var steps = 60;\n    for (i = 0; i <= steps; i++) {\n      var tauA = (i / steps) * ovEnd;\n      var valA = a * Math.exp(-a * (tVal - tauA));\n      ctx.lineTo(mapLX(tauA), mapLY(valA));\n    }\n    ctx.lineTo(mapLX(ovEnd), mapLY(0));\n    ctx.closePath();\n    ctx.fill();\n  }\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.4;\n  ctx.beginPath();\n  ctx.moveTo(mapLX(-1.2), mapLY(0));\n  ctx.lineTo(mapLX(0), mapLY(0));\n  ctx.lineTo(mapLX(0), mapLY(1));\n  ctx.lineTo(mapLX(1), mapLY(1));\n  ctx.lineTo(mapLX(1), mapLY(0));\n  ctx.lineTo(mapLX(2.8), mapLY(0));\n  ctx.stroke();\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2.2;\n  ctx.beginPath();\n  var hSteps = 120;\n  var tClamped = Math.min(tVal, 2.8);\n  var started = false;\n  for (i = 0; i <= hSteps; i++) {\n    var tauH = -1.2 + (i / hSteps) * (tClamped + 1.2);\n    if (tauH > tVal) break;\n    var hVal = a * Math.exp(-a * (tVal - tauH));\n    var px = mapLX(tauH);\n    var py = mapLY(hVal);\n    if (!started) { ctx.moveTo(px, py); started = true; } else { ctx.lineTo(px, py); }\n  }\n  if (tVal >= -1.2 && tVal <= 2.8) {\n    ctx.lineTo(mapLX(tVal), mapLY(0));\n    ctx.lineTo(mapLX(2.8), mapLY(0));\n  }\n  ctx.stroke();\n  if (tVal >= -1.2 && tVal <= 2.8) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.4;\n    ctx.beginPath();\n    ctx.moveTo(mapLX(tVal), lyTop); ctx.lineTo(mapLX(tVal), lyBase);\n    ctx.stroke();\n    ctx.restore();\n  }\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (i = 0; i <= 150; i++) {\n    var tt = -0.8 + (i / 150) * 3.8;\n    var yy = evalY(tt, a);\n    if (i === 0) ctx.moveTo(mapRX(tt), mapRY(yy)); else ctx.lineTo(mapRX(tt), mapRY(yy));\n  }\n  ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = 'rgba(16, 185, 129, 0.16)';\n  ctx.beginPath();\n  ctx.moveTo(mapRX(-0.8), mapRY(0));\n  for (i = 0; i <= 150; i++) {\n    var tFill = -0.8 + (i / 150) * (tVal + 0.8);\n    ctx.lineTo(mapRX(tFill), mapRY(evalY(tFill, a)));\n  }\n  ctx.lineTo(mapRX(tVal), mapRY(0));\n  ctx.closePath();\n  ctx.fill();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  for (i = 0; i <= 150; i++) {\n    var tCur = -0.8 + (i / 150) * (tVal + 0.8);\n    if (i === 0) ctx.moveTo(mapRX(tCur), mapRY(evalY(tCur, a))); else ctx.lineTo(mapRX(tCur), mapRY(evalY(tCur, a)));\n  }\n  ctx.stroke();\n  var yNow = evalY(tVal, a);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.4;\n  ctx.beginPath();\n  ctx.moveTo(mapRX(tVal), ryTop); ctx.lineTo(mapRX(tVal), ryBase);\n  ctx.stroke();\n  ctx.restore();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(mapRX(tVal), mapRY(yNow), 5, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('τ 域扫描：x(τ) [蓝] 与 h(t-τ) [粉]', lx0, 18);\n  ctx.fillText('t 域输出：y(t) = ∫ x(τ)h(t-τ) dτ [绿]', rx0, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  for (i = -1; i <= 2; i++) { ctx.fillText(String(i), mapLX(i) - 3, lyBase + 15); }\n  ctx.fillText('τ', lx1 - 6, lyBase + 15);\n  for (i = 0; i <= 3; i++) { ctx.fillText(String(i), mapRX(i) - 3, ryBase + 15); }\n  ctx.fillText('t', rx1 - 6, ryBase + 15);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('t', Math.min(lx1 - 10, Math.max(lx0, mapLX(tVal) + 4)), lyTop + 12);\n  var stage = tVal < 0 ? '阶段(a) 无重叠 t < 0' : (tVal <= 1 ? '阶段(b) 部分重叠 0 ≤ t ≤ 1（电容充电）' : '阶段(c) 完全重叠 t > 1（指数放电）');\n  lab.setReadout(stage + '  |  t = ' + tVal.toFixed(2) + ' s  |  y(t) = ' + yNow.toFixed(4));\n}\nlab.onUpdate(function() {\n  curT = lab.values.tPos;\n  render(curT);\n});\nlab.onLoop(function(dt) {\n  if (lab.values.autoScan) {\n    curT += dt * 0.75;\n    if (curT > 3.0) curT = -0.8;\n    render(curT);\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "二、分段信号实战：RC 低通滤波器的三段式解析",
      "paragraphs": [
        "在工程实际中，信号往往不是单一公式，而是像方波脉冲和单边指数那样**按区间分段定义**的。例如一个由单个电阻 `R` 和电容 `C` 组成的模拟低通滤波器，其冲激响应为单边指数：`h(t) = 0 (t < 0)`，`h(t) = α·e^(-αt) (t ≥ 0)`，其中 `α = 1 / (RC)`。",
        "当单位方波脉冲 `x(t) = 1 (0 ≤ t ≤ 1)` 进入该系统时，千万不能盲目直接代积分公式，**必须先画草图**确定 `x(τ)` 与 `h(t - τ)` 的重叠区域，再分段积分：",
        "1. **无重叠区 (`t < 0`)**：`h(t - τ)` 完全位于 `τ = 0` 左侧，与方波毫无交集，乘积恒为零，故 `y(t) = 0`（符合因果律：激励还没到达，响应必须为零）。\n2. **部分重叠区 (`0 ≤ t ≤ 1`)**：非零交集为 `τ ∈ [0, t]`，对 `α·e^(-α(t - τ))` 从 `0` 积到 `t`，恰好得到经典的 RC 电容充电曲线 `1 - e^(-αt)`。\n3. **完全重叠区 (`t > 1`)**：交集固定为整个方波区间 `τ ∈ [0, 1]`，积分上下限变为 `0` 到 `1`，输出转入指数放电衰减 `(e^α - 1)·e^(-αt)`。"
      ],
      "formula": {
        "expr": "y(t) = { 0 (t<0);  1 - e^(-αt) (0≤t≤1);  (e^α - 1)e^(-αt) (t>1) }",
        "explain": "方波脉冲通过一阶 RC 低通滤波器后的完整三段式解析输出，分别对应脉冲前零响应、上升后指数充电、脉冲结束后指数放电。"
      }
    },
    {
      "type": "concept",
      "heading": "三、拒绝硬算：微分-卷积-积分秘籍与离散近似",
      "paragraphs": [
        "遇到复杂波形时，死算连续积分极易陷入数学泥潭。动手前应优先评估三种高阶求解策略：",
        "**策略 1（线性叠加分解）**：把复杂信号拆解成若干个更简单的信号之和，分别卷积后再相加。\n**策略 2（先微分、再卷积、后积分）**：对某一个信号做线性变换使卷积变简单，算完再做逆变换还原。例如对方波 `x(t)` 求导，瞬间得到两个极易卷积的冲激：`x'(t) = δ(t) - δ(t - 1)`。任意信号与冲激卷积只需平移缩放，因此一步即可写出输出的导数 `y'(t) = h(t) - h(t - 1)`，最后积分一次便得 `y(t)`！这一招对所有**分段多项式**信号（求多次导数化成冲激，最后做多次积分）同样有效。但需警惕一个坑：**求导会丢失输入信号的直流（DC）分量**，积分时必须通过边界稳态行为人工补齐正确的积分常数。\n**策略 3（计算机离散近似）**：在动手硬算前先反问自己——**我真的需要闭式数学表达式吗，还是只要一张波形图就够了？** 如果只需要波形结果，直接把连续信号按足够密的采样点离散化，交给计算机跑离散卷积，往往比手算积分快得多、稳得多。"
      ],
      "formula": {
        "expr": "y'(t) = x'(t) * h(t) = h(t) - h(t - 1)",
        "explain": "利用线性系统的微积分交换性质：方波求导变为正负一对冲激，与 h(t) 卷积直接得到响应的平移差，积分即可还原 y(t)（需留意校正 DC 积分常数）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：连续 RC 卷积滤波听感与离散采样近似对比",
      "instruction": "调节 RC 衰减率 α 改变平滑程度并点击播放，对比原方波与滤波后的听感差异；拖动“采样点数 N”观察离散卷积如何随分辨率提高逼近连续解析解。",
      "controls": [
        {
          "type": "slider",
          "id": "alpha",
          "label": "RC 衰减率 α=1/(RC)",
          "min": 200,
          "max": 4000,
          "step": 50,
          "value": 800,
          "unit": " /s"
        },
        {
          "type": "slider",
          "id": "samples",
          "label": "离散近似采样数 N",
          "min": 8,
          "max": 64,
          "step": 2,
          "value": 20,
          "unit": " 点/周期"
        },
        {
          "type": "toggle",
          "id": "filtered",
          "label": "播放 RC 滤波后波形（关闭听原方波）",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放对比音 (220 Hz)",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var activeSrc = null;\nvar activeGain = null;\nvar lastAudioKey = '';\nvar f0 = 220;\nvar T = 1.0 / f0;\nfunction evalPeriodicRC(t, a) {\n  var tm = ((t % T) + T) % T;\n  var halfT = T * 0.5;\n  var eHalf = Math.exp(-a * halfT);\n  var vMin = eHalf / (1 + eHalf);\n  var vMax = 1 - vMin;\n  if (tm < halfT) {\n    return 1 - (1 - vMin) * Math.exp(-a * tm);\n  }\n  return vMax * Math.exp(-a * (tm - halfT));\n}\nfunction computeDiscreteRC(N, a) {\n  var dt = T / N;\n  var out = [];\n  var n, m;\n  var M = N * 8;\n  for (n = 0; n < N; n++) {\n    var sum = 0;\n    for (m = 0; m < M; m++) {\n      var idx = ((n - m) % N + N) % N;\n      var xVal = idx < (N / 2) ? 1 : 0;\n      var hVal = a * Math.exp(-a * m * dt) * dt;\n      sum += xVal * hVal;\n    }\n    out.push(sum);\n  }\n  return out;\n}\nfunction stopAudio() {\n  if (activeSrc) {\n    try { activeSrc.stop(); } catch (e) {}\n    try { activeSrc.disconnect(); } catch (e) {}\n    activeSrc = null;\n  }\n  if (activeGain) {\n    try { activeGain.disconnect(); } catch (e) {}\n    activeGain = null;\n  }\n}\nfunction syncAudio() {\n  var play = lab.values.play;\n  var a = lab.values.alpha;\n  var filtered = lab.values.filtered;\n  var key = play + '|' + a + '|' + filtered;\n  if (!play) {\n    stopAudio();\n    lastAudioKey = key;\n    return;\n  }\n  if (key === lastAudioKey && activeSrc) return;\n  lastAudioKey = key;\n  try {\n    var actx = lab.getAudioContext();\n    if (actx.state === 'suspended') actx.resume();\n    stopAudio();\n    var sr = actx.sampleRate;\n    var len = Math.max(32, Math.round(sr / f0));\n    var buf = actx.createBuffer(1, len, sr);\n    var data = buf.getChannelData(0);\n    var i;\n    for (i = 0; i < len; i++) {\n      var tt = (i / len) * T;\n      var v = filtered ? evalPeriodicRC(tt, a) : (tt < T * 0.5 ? 1 : 0);\n      data[i] = (v - 0.5) * 0.28;\n    }\n    var src = actx.createBufferSource();\n    src.buffer = buf;\n    src.loop = true;\n    var gain = actx.createGain();\n    gain.gain.value = 0.85;\n    src.connect(gain);\n    gain.connect(actx.destination);\n    src.start();\n    activeSrc = src;\n    activeGain = gain;\n  } catch (e) {}\n}\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var a = lab.values.alpha;\n  var N = Math.round(lab.values.samples);\n  var filtered = lab.values.filtered;\n  ctx.clearRect(0, 0, W, H);\n  var x0 = 46, x1 = 696, yBot = 200, yTop = 34;\n  var tMax = 2 * T;\n  function mapX(tt) { return x0 + (tt / tMax) * (x1 - x0); }\n  function mapY(v) { return yBot - v * (yBot - yTop); }\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  var i;\n  for (i = 0; i <= 4; i++) {\n    var gx = mapX((i / 4) * tMax);\n    ctx.beginPath(); ctx.moveTo(gx, yTop); ctx.lineTo(gx, yBot); ctx.stroke();\n  }\n  for (i = 0; i <= 4; i++) {\n    var gy = mapY(i * 0.25);\n    ctx.beginPath(); ctx.moveTo(x0, gy); ctx.lineTo(x1, gy); ctx.stroke();\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n  ctx.beginPath();\n  ctx.moveTo(x0, yBot); ctx.lineTo(x1, yBot);\n  ctx.moveTo(x0, yTop); ctx.lineTo(x0, yBot);\n  ctx.stroke();\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = filtered ? 'rgba(248, 250, 252, 0.35)' : '#38bdf8';\n  ctx.lineWidth = filtered ? 1.6 : 2.5;\n  ctx.beginPath();\n  ctx.moveTo(mapX(0), mapY(0));\n  ctx.lineTo(mapX(0), mapY(1));\n  ctx.lineTo(mapX(0.5 * T), mapY(1));\n  ctx.lineTo(mapX(0.5 * T), mapY(0));\n  ctx.lineTo(mapX(T), mapY(0));\n  ctx.lineTo(mapX(T), mapY(1));\n  ctx.lineTo(mapX(1.5 * T), mapY(1));\n  ctx.lineTo(mapX(1.5 * T), mapY(0));\n  ctx.lineTo(mapX(2 * T), mapY(0));\n  ctx.stroke();\n  ctx.restore();\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.6;\n  ctx.beginPath();\n  var cSteps = 260;\n  for (i = 0; i <= cSteps; i++) {\n    var tt = (i / cSteps) * tMax;\n    var yy = evalPeriodicRC(tt, a);\n    if (i === 0) ctx.moveTo(mapX(tt), mapY(yy)); else ctx.lineTo(mapX(tt), mapY(yy));\n  }\n  ctx.stroke();\n  var disc = computeDiscreteRC(N, a);\n  var dt = T / N;\n  var errSq = 0;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (i = 0; i < 2 * N; i++) {\n    var tStart = i * dt;\n    var tEnd = (i + 1) * dt;\n    var valD = disc[i % N];\n    if (i < N) {\n      var diff = valD - evalPeriodicRC(tStart, a);\n      errSq += diff * diff;\n    }\n    var px1 = mapX(tStart);\n    var px2 = mapX(Math.min(tEnd, tMax));\n    var py = mapY(valD);\n    if (i === 0) ctx.moveTo(px1, py); else ctx.lineTo(px1, py);\n    ctx.lineTo(px2, py);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  for (i = 0; i < 2 * N; i++) {\n    var tPt = i * dt;\n    ctx.beginPath();\n    ctx.arc(mapX(tPt), mapY(disc[i % N]), 2.6, 0, Math.PI * 2);\n    ctx.fill();\n  }\n  var rmse = Math.sqrt(errSq / N);\n  var fc = a / (2 * Math.PI);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('周期方波输入 [虚线/蓝]  |  连续 RC 卷积解析解 [绿]  |  离散采样近似 [琥珀阶梯]', x0, 18);\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('0 ms', mapX(0) - 8, yBot + 15);\n  ctx.fillText((T * 1000).toFixed(2) + ' ms (1T)', mapX(T) - 24, yBot + 15);\n  ctx.fillText((2 * T * 1000).toFixed(2) + ' ms (2T)', mapX(2 * T) - 28, yBot + 15);\n  ctx.fillText('1.0', x0 - 22, mapY(1) + 4);\n  ctx.fillText('0.5', x0 - 22, mapY(0.5) + 4);\n  ctx.fillText('0.0', x0 - 22, mapY(0) + 4);\n  var audioTag = lab.values.play ? (filtered ? '正在播放：RC 滤波后平滑音' : '正在播放：未滤波原方波') : '声音已暂停';\n  lab.setReadout('截止频率 fc ≈ ' + fc.toFixed(0) + ' Hz  |  采样间隔 Δt = ' + (dt * 1000).toFixed(3) + ' ms  |  离散近似均方根误差 RMSE = ' + rmse.toFixed(4) + '  |  ' + audioTag);\n}\nlab.onUpdate(function() {\n  draw();\n  syncAudio();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分两个时间变量：输出时刻 `t` 在积分过程中是固定不动的常数，扫描移动的是积分哑变量 `τ`，绝不能把 `h(t - τ)` 里的 `t` 拿去参与积分。",
        "分段信号先画图再积分：只要输入或冲激响应是分段函数，必须先按 `t` 的取值范围画出重叠区域草图，找准非零积分上下限，避免算错区间。",
        "用微分简化卷积必查 DC 项：将信号求导成冲激后，原信号的直流分量信息已丢失；积分还原 `y(t)` 后，务必结合物理稳态（如 `t → ∞` 时的趋势）补上正确的积分常数。",
        "波形够用就选离散近似：除非明确需要解析公式推导，否则在工程中直接对连续信号高密度采样并调用离散卷积，精度可控且完全免除手算积分的烦恼。"
      ]
    }
  ]
});
