window.__BOOK_REGISTER_SECTION__("sec_190", {
  "title": "训练神经网络：误差反传与最速下降 (Training the Neural Network)",
  "intuition": "把图像识别变成调整 1020 个旋钮的“黑夜下山”游戏：算清每个旋钮对总误差的斜率，沿下坡方向小步快跑，就能让网络自己学会认出元音字母。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 数据集构建、三层架构与权重初始化的秘密",
      "paragraphs": [
        "在进入算法前，先把问题变成计算机能吞下的数字。书中构建了一个经典的文字识别任务：将 26 个大写字母 A–Z 各打印 50 遍（共 1300 张图），扫描切成 `10×10` 像素、256 级灰度（8 bit/像素）的小图，存成 1.3 MB 的数据库。前 **260 张**（每个字母 10 张）拿来**训练**网络权重，剩下的 1040 张留作**测试**。本次实验设定了一个高度抽象的目标：**判断图像里是不是元音字母（A, E, I, O, U）**。",
        "网络采用经典的三层全连接架构（对应表 26-2）：输入层有 **101 个节点**（`X1[1]` 到 `X1[100]` 存像素灰度值，外加 `X1[101] = 1` 作为恒定偏置项 Bias）；隐藏层有 **10 个节点**（`X2[1..10]`）；输出层有 **1 个节点**（`X3`，期望元音接近 `1`，辅音接近 `0`）。隐藏层权重 `WH[10,101]` 与输出层权重 `WO[10]` 加起来，总共定义了 **1020 个可调参数**。",
        "程序一上来（第 190–240 行）用随机数初始化权重，但隐藏层和输出层的初始范围相差整整 **1000 倍**：`WO` 在 `[-0.5, 0.5]`，而 `WH` 却在 `[-0.0005, 0.0005]`。这不是拍脑袋，而是由三个硬指标决定的：(1) 输入像素典型值约为 `100`；(2) 每个隐藏节点要对 `101` 个输入求和；(3) Sigmoid 激活函数只在输入 `-5 < x < 5` 范围内敏感活跃。算一笔账：`101 × 100 × 0.0002 ≈ 2`，正好落入 Sigmoid 的黄金活跃区；若盲目把 `WH` 也设为 `0.5`，求和结果高达 `5000`，Sigmoid 会瞬间饱和卡死。"
      ],
      "formula": {
        "expr": "ACC ≈ N_in × X1_typical × W_typical ∈ (-5, 5)",
        "explain": "N_in 为输入节点数 (101)，X1_typical 为输入信号典型量级 (~100)，W_typical 为初始权重典型值 (~0.0002)；乘积落入 (-5, 5) 才能避免 Sigmoid 饱和。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：权重初始化量级与 Sigmoid 饱和区透视",
      "instruction": "拖动「隐藏层权重尺度」和「典型像素值」滑块，观察求和输入 ACC 如何移动，以及权重过大时导数（SLOPE，橙线）如何归零。",
      "controls": [
        {
          "type": "slider",
          "id": "inputLevel",
          "label": "典型像素输入 X1",
          "min": 10,
          "max": 255,
          "step": 5,
          "value": 100,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "weightScale",
          "label": "隐藏层权重尺度 (×0.0001)",
          "min": 1,
          "max": 40,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showActiveBand",
          "label": "高亮 Sigmoid 活跃区间 (-5 < x < 5)",
          "value": true
        }
      ],
      "jsCode": "(function() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  function sigmoid(x) { return 1 / (1 + Math.exp(-x)); }\n  function draw() {\n    const inp = lab.values.inputLevel;\n    const wScale = lab.values.weightScale * 0.0001;\n    const showBand = lab.values.showActiveBand;\n    const acc = 101 * inp * wScale;\n    const yVal = sigmoid(acc);\n    const slope = yVal * (1 - yVal);\n\n    ctx.clearRect(0, 0, W, H);\n    const padL = 54, padR = 24, padT = 24, padB = 34;\n    const plotW = W - padL - padR, plotH = H - padT - padB;\n    const xMin = -15, xMax = 15;\n    function toX(x) { return padL + ((x - xMin) / (xMax - xMin)) * plotW; }\n    function toY(y) { return padT + (1 - y) * plotH; }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let gx = -15; gx <= 15; gx += 5) {\n      const px = toX(gx);\n      ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT + plotH); ctx.stroke();\n    }\n    for (let gy = 0; gy <= 1; gy += 0.25) {\n      const py = toY(gy);\n      ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL + plotW, py); ctx.stroke();\n    }\n\n    if (showBand) {\n      const x1 = toX(-5), x2 = toX(5);\n      ctx.fillStyle = 'rgba(16, 185, 129, 0.10)';\n      ctx.fillRect(x1, padT, x2 - x1, plotH);\n      ctx.strokeStyle = 'rgba(16, 185, 129, 0.45)';\n      ctx.setLineDash([4, 4]);\n      ctx.beginPath();\n      ctx.moveTo(x1, padT); ctx.lineTo(x1, padT + plotH);\n      ctx.moveTo(x2, padT); ctx.lineTo(x2, padT + plotH);\n      ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = '#10b981';\n      ctx.font = '11px sans-serif';\n      ctx.textAlign = 'center';\n      ctx.fillText('Sigmoid 活跃区 (-5 < x < 5)', (x1 + x2) / 2, padT + 14);\n    }\n\n    ctx.strokeStyle = 'rgba(248, 250, 252, 0.35)';\n    ctx.beginPath();\n    ctx.moveTo(padL, toY(0)); ctx.lineTo(padL + plotW, toY(0));\n    ctx.moveTo(toX(0), padT); ctx.lineTo(toX(0), padT + plotH);\n    ctx.stroke();\n\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const x = xMin + (i / 240) * (xMax - xMin);\n      const s = sigmoid(x);\n      const d = s * (1 - s) * 4;\n      const px = toX(x), py = toY(d);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (let i = 0; i <= 240; i++) {\n      const x = xMin + (i / 240) * (xMax - xMin);\n      const s = sigmoid(x);\n      const px = toX(x), py = toY(s);\n      if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n\n    const clampedAcc = Math.max(xMin, Math.min(xMax, acc));\n    const opX = toX(clampedAcc);\n    const opY = toY(yVal);\n    const dY = toY(slope * 4);\n\n    ctx.strokeStyle = 'rgba(236, 72, 153, 0.65)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(opX, toY(0)); ctx.lineTo(opX, opY);\n    ctx.stroke();\n    ctx.setLineDash([]);\n\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(opX, opY, 6, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n    ctx.fillStyle = '#f59e0b';\n    ctx.beginPath(); ctx.arc(opX, dY, 4.5, 0, Math.PI * 2); ctx.fill();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'center';\n    for (let gx = -15; gx <= 15; gx += 5) {\n      ctx.fillText(String(gx), toX(gx), padT + plotH + 16);\n    }\n    ctx.textAlign = 'right';\n    ctx.fillText('1.0', padL - 8, toY(1) + 4);\n    ctx.fillText('0.5', padL - 8, toY(0.5) + 4);\n    ctx.fillText('0.0', padL - 8, toY(0) + 4);\n\n    ctx.textAlign = 'left';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('— 输出 X2 = Sigmoid(ACC)', padL + 8, padT + 14);\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('— 4×SLOPE (放大便于对比)', padL + 8, padT + 30);\n\n    const status = Math.abs(acc) <= 5 ? '处于活跃区 (梯度充沛)' : '已进入饱和区 (导数趋零，学习停滞!)';\n    lab.setReadout('典型权重=' + wScale.toFixed(4) + ' | 求和 ACC=' + acc.toFixed(2) + (acc > 15 ? ' (已超出右界)' : '') + ' | X2=' + yVal.toFixed(4) + ' | SLOPE=' + slope.toFixed(4) + ' | ' + status);\n  }\n  lab.onUpdate(draw);\n  draw();\n})();"
    },
    {
      "type": "concept",
      "heading": "2. 迭代循环、ESUM 监控与“偏心”的误差加权",
      "paragraphs": [
        "刚初始化的随机权重表现跟瞎猜没区别。训练通过外层的 800 轮迭代循环（`FOR ITER% = 1 TO 800`）逐步把权重扭向正确方向。每一轮里，内层循环遍历全部 260 张训练图：调用 `GOSUB 1000` 读入像素与标准答案 `CORRECT`（元音为 1，非元音为 0）；接着调用 `GOSUB 2000` 进行前向传播算出网络输出 `X3`，并计算单张图的误差 `ELET = CORRECT - X3`。",
        "为了用一个**单一数字**衡量全盘训练进展，程序在每轮开始时清零累加器 `ESUM = 0`，然后把 260 张图的误差平方全部加起来（`ESUM = ESUM + ELET^2`），并在每轮结束时打印 `ESUM` 到屏幕。随着训练推进，`ESUM` 会从高位逐渐滑落并趋于平缓，一旦停止下降就意味着收敛到极限。",
        "注意子程序 2000 第 2220 行一个极其聪明的工程选项：`IF CORRECT = 1 THEN ELET = ELET * 5`。这相当于人为规定**漏掉一个目标（假阴性）的代价是误报一个非目标（假阳性）的 5 倍**！就像癌症筛查宁可多复查几个健康人，也绝不能放过一个真病人。在训练集中元音只占少数，这种非对称加权强迫网络优先把元音找准，哪怕以稍微牺牲辅音的精度为代价。"
      ],
      "formula": {
        "expr": "ESUM = Σ (ELET)²,  ELET = (CORRECT - X3) × (5 if CORRECT=1 else 1)",
        "explain": "ESUM 是整个训练集的总平方误差；ELET 是单张图的带权重误差，正负代表需要把输出往大调还是往小调，绝对值越大调整力度越猛。"
      }
    },
    {
      "type": "concept",
      "heading": "3. 黑夜伞兵下山：从随机进化到解析最速下降 (Backpropagation)",
      "paragraphs": [
        "全书最核心的子程序 `GOSUB 3000` 负责修改权重。作者用一个绝妙的**黑夜伞兵**比喻来解释优化算法：伞兵空降在伸手不见五指的敌后山坡，命令是尽快走到最近山谷的最低点。海拔高度就是网络总误差 `ESUM`，伞兵的水平坐标 `(x, y)` 就是那 1020 个权重。",
        "第一种笨办法叫**进化算法（Evolution）**：伞兵随机往某个方向跳一步，海拔变低就留下，变高就骂一句退回原位重跳。虽然最终能到谷底，但效率极低——原本几分钟的事要跑上好几天。第二种聪明办法叫**最速下降法（Steepest Descent）**：先测出往北走一步降多少、往东走一步降多少，然后沿每个坐标轴移动**与该轴斜率成正比**的距离，直接沿着最陡的下坡线俯冲。",
        "求某个权重的斜率 `ΔX3/Δw`，笨办法是给权重加上微小增量 `Δw` 再重算一遍网络看输出变了多少；但因为 Sigmoid **处处可微**（导数直接等于 `X·(1-X)`），我们可以用链式法则一步写出解析斜率公式（式 26-3、26-4），根本不用挨个微扰！算出斜率 `DX3DW` 后，按式 26-5 更新权重：斜率决定方向与灵敏度，`ELET` 决定“病得重不重（误差大就多改，没错就不改）”，而常数 `MU`（步长/学习率，本例取 `0.000005`，通常在 `10⁻⁶` 到 `0.1` 之间）控制每次迈步多大——`MU` 太小像蜗牛爬，太大则会像伞兵一步迈出 1000 米直接越过谷底，在山谷两侧剧烈震荡甚至发散。"
      ],
      "formula": {
        "expr": "w_new = w_old + (ΔX3 / Δw) × ELET × MU",
        "explain": "输出层斜率 ΔX3/Δw = X2[H]·SLOPE_O；隐藏层斜率 ΔX3/Δw = X1[I]·SLOPE_H·WO[H]·SLOPE_O，其中 SLOPE = X·(1 - X)。MU 为控制步幅的学习率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：黑夜伞兵下山——步长 MU 与进化/最速下降对比",
      "instruction": "拖动「学习步长 MU」观察伞兵如何从龟速爬行变为顺滑下谷，再调大触发“越过谷底的剧烈震荡”；也可切换「随机进化」或「起点 Trial B」对比不同山谷结局。",
      "controls": [
        {
          "type": "slider",
          "id": "mu",
          "label": "学习步长 MU (×0.01)",
          "min": 1,
          "max": 60,
          "step": 1,
          "value": 15,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "evoMode",
          "label": "切换为随机进化算法 (关闭=最速下降)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "altStart",
          "label": "切换初始权重起点 (Trial B)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "paused",
          "label": "暂停迭代动画",
          "value": false
        }
      ],
      "jsCode": "(function() {\n  const ctx = lab.ctx, W = lab.width, H = lab.height;\n  const mapX = 16, mapY = 26, mapW = 336, mapH = 192;\n  const plotX = 396, plotY = 26, plotW = 308, plotH = 192;\n  const xMin = -2.6, xMax = 2.6, yMin = -1.6, yMax = 1.6;\n\n  function calcE(x, y) {\n    const t = x * x - 1.5;\n    return 0.28 * t * t + 1.75 * y * y + 0.18 * x + 0.25;\n  }\n  function calcGrad(x, y) {\n    return {\n      dx: 1.12 * x * (x * x - 1.5) + 0.18,\n      dy: 3.5 * y\n    };\n  }\n  function toMapX(x) { return mapX + ((x - xMin) / (xMax - xMin)) * mapW; }\n  function toMapY(y) { return mapY + (1 - (y - yMin) / (yMax - yMin)) * mapH; }\n\n  let px = -2.1, py = 1.25;\n  let trail = [];\n  let errHist = [];\n  let rejected = null;\n  let stepCount = 0;\n  let lastAlt = lab.values.altStart;\n  let lastEvo = lab.values.evoMode;\n  let accumTime = 0;\n\n  function resetSim() {\n    if (lab.values.altStart) {\n      px = 2.1; py = -1.2;\n    } else {\n      px = -2.1; py = 1.25;\n    }\n    trail = [{ x: px, y: py }];\n    errHist = [calcE(px, py)];\n    rejected = null;\n    stepCount = 0;\n  }\n\n  function stepOnce() {\n    const lr = lab.values.mu * 0.01;\n    const evo = lab.values.evoMode;\n    const curE = calcE(px, py);\n    if (evo) {\n      const jump = 0.22 + lr * 0.6;\n      const nx = Math.max(xMin, Math.min(xMax, px + (Math.random() - 0.5) * 2 * jump));\n      const ny = Math.max(yMin, Math.min(yMax, py + (Math.random() - 0.5) * 2 * jump));\n      const ne = calcE(nx, ny);\n      if (ne < curE) {\n        px = nx; py = ny;\n        rejected = null;\n      } else {\n        rejected = { x: nx, y: ny };\n      }\n    } else {\n      const g = calcGrad(px, py);\n      px = Math.max(-3.0, Math.min(3.0, px - lr * g.dx));\n      py = Math.max(-2.0, Math.min(2.0, py - lr * g.dy));\n      rejected = null;\n    }\n    stepCount++;\n    trail.push({ x: px, y: py });\n    if (trail.length > 140) trail.shift();\n    errHist.push(calcE(px, py));\n    if (errHist.length > 140) errHist.shift();\n  }\n\n  function draw() {\n    ctx.clearRect(0, 0, W, H);\n\n    const cols = 48, rows = 28;\n    const cw = mapW / cols, ch = mapH / rows;\n    for (let i = 0; i < cols; i++) {\n      for (let j = 0; j < rows; j++) {\n        const vx = xMin + ((i + 0.5) / cols) * (xMax - xMin);\n        const vy = yMax - ((j + 0.5) / rows) * (yMax - yMin);\n        const e = calcE(vx, vy);\n        const norm = Math.min(1, Math.sqrt(e / 5.5));\n        const r = Math.round(12 + norm * 48);\n        const g = Math.round(28 + (1 - norm) * 45 + norm * 16);\n        const b = Math.round(52 + (1 - norm) * 58);\n        ctx.fillStyle = 'rgb(' + r + ',' + g + ',' + b + ')';\n        ctx.fillRect(mapX + i * cw, mapY + j * ch, cw + 0.6, ch + 0.6);\n      }\n    }\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(mapX, mapY, mapW, mapH);\n\n    ctx.fillStyle = 'rgba(16, 185, 129, 0.85)';\n    ctx.beginPath(); ctx.arc(toMapX(-1.25), toMapY(0), 4, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';\n    ctx.beginPath(); ctx.arc(toMapX(1.18), toMapY(0), 4, 0, Math.PI * 2); ctx.fill();\n\n    if (trail.length > 1) {\n      ctx.strokeStyle = lab.values.evoMode ? '#f59e0b' : '#38bdf8';\n      ctx.lineWidth = 2;\n      ctx.beginPath();\n      for (let k = 0; k < trail.length; k++) {\n        const sx = Math.max(mapX, Math.min(mapX + mapW, toMapX(trail[k].x)));\n        const sy = Math.max(mapY, Math.min(mapY + mapH, toMapY(trail[k].y)));\n        if (k === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);\n      }\n      ctx.stroke();\n    }\n\n    const curSX = Math.max(mapX, Math.min(mapX + mapW, toMapX(px)));\n    const curSY = Math.max(mapY, Math.min(mapY + mapH, toMapY(py)));\n\n    if (rejected) {\n      const rx = toMapX(rejected.x), ry = toMapY(rejected.y);\n      ctx.strokeStyle = 'rgba(236, 72, 153, 0.75)';\n      ctx.setLineDash([3, 3]);\n      ctx.lineWidth = 1.5;\n      ctx.beginPath(); ctx.moveTo(curSX, curSY); ctx.lineTo(rx, ry); ctx.stroke();\n      ctx.setLineDash([]);\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath(); ctx.arc(rx, ry, 3, 0, Math.PI * 2); ctx.fill();\n    }\n\n    ctx.fillStyle = '#ec4899';\n    ctx.beginPath(); ctx.arc(curSX, curSY, 5.5, 0, Math.PI * 2); ctx.fill();\n    ctx.strokeStyle = '#f8fafc'; ctx.lineWidth = 1.5; ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('黑夜山谷误差地形 (绿点=深谷 / 橙点=浅谷)', mapX, mapY - 8);\n    ctx.fillText('ESUM 实时收敛曲线 (对应 Fig. 26-9)', plotX, plotY - 8);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n    ctx.lineWidth = 1;\n    for (let g = 0; g <= 4; g++) {\n      const gy = plotY + (g / 4) * plotH;\n      ctx.beginPath(); ctx.moveTo(plotX, gy); ctx.lineTo(plotX + plotW, gy); ctx.stroke();\n    }\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.strokeRect(plotX, plotY, plotW, plotH);\n\n    const maxE = 5.0;\n    if (errHist.length > 1) {\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 2.2;\n      ctx.beginPath();\n      for (let k = 0; k < errHist.length; k++) {\n        const gx = plotX + (k / Math.max(1, errHist.length - 1)) * plotW;\n        const val = Math.min(maxE, errHist[k]);\n        const gy = plotY + (1 - val / maxE) * plotH;\n        if (k === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);\n      }\n      ctx.stroke();\n    }\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.textAlign = 'right';\n    ctx.fillText('5.0', plotX - 6, plotY + 6);\n    ctx.fillText('2.5', plotX - 6, plotY + plotH / 2 + 3);\n    ctx.fillText('0.0', plotX - 6, plotY + plotH + 3);\n\n    const curE = calcE(px, py);\n    const algoName = lab.values.evoMode ? '随机进化' : '最速下降';\n    const lr = (lab.values.mu * 0.01).toFixed(2);\n    lab.setReadout('算法: ' + algoName + ' | 步长 MU=' + lr + ' | 迭代步数=' + stepCount + ' | 当前 ESUM=' + curE.toFixed(3));\n  }\n\n  resetSim();\n  draw();\n  lab.onUpdate(function() {\n    if (lab.values.altStart !== lastAlt || lab.values.evoMode !== lastEvo) {\n      lastAlt = lab.values.altStart;\n      lastEvo = lab.values.evoMode;\n      resetSim();\n    }\n    draw();\n  });\n\n  lab.onLoop(function(dt) {\n    if (lab.values.paused) return;\n    accumTime += Math.min(dt || 0.016, 0.1);\n    if (accumTime >= 0.07) {\n      accumTime = 0;\n      stepOnce();\n      draw();\n    }\n  });\n})();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "初始权重绝不能乱填同一量级：必须根据“输入信号幅值 × 输入节点数”来缩放，保证加权和落入 Sigmoid 的活跃区 (-5 < x < 5)，否则梯度直接归零、网络彻底学不动。",
        "一定要把偏置项 Bias（恒为 1 的节点）带进输入层，且绝对不能拿测试集参与权重更新，否则测试精度毫无意义。",
        "业务代价不对称时，直接在误差 ELET 上乘惩罚系数（如漏报目标乘 5），比硬改网络结构更直接有效。",
        "训练时必须实时盯紧总误差 ESUM：若下降如蜗牛就调大 MU；若出现乱跳或震荡就立刻停机调小 MU；且务必用不同随机起点多跑几轮，挑出落入“最深山谷”的那一组权重作为最终方案。"
      ]
    }
  ]
});
