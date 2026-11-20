window.__BOOK_REGISTER_SECTION__("sec_044", {
  "title": "计算机中的数字表示 (Computer Numbers)",
  "intuition": "计算机用有限的比特位表示无限的连续世界，理解“范围 (Range)”与“精度 (Precision)”的分配法则，就能看穿舍入误差与大数吃小数的底层根源。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么计算机存不准一个数？有限比特的离散宿命",
      "paragraphs": [
        "数字计算机非常擅长存储与读取数字，但这个过程并非毫无误差。比如你让计算机存储 `1.41421356`，它只能尽力存下最接近的可表示数值 `1.41421354`。在很多场景下这种微小偏差无关紧要，但在另一些精密计算中却可能引发灾难性后果。",
        "这种现象的根源在于：计算机为每个数字分配了**固定数量的比特位（Bits）**，通常是 8、16、32 或 64 位。以最简单的 **8 位**变量为例，每一位只有 `0` 和 `1` 两种状态，因此总共只能组合出有限个不同的比特模式（Bit Patterns）。变量只能取这有限个离散值之一——这是物理硬件的根本限制，任何软件技巧都无法突破。",
        "我们唯一能掌控的自由度，是**规定每一个比特模式究竟代表什么数值**。例如 8 位的 256 种模式，既可以按线性规律依次代表 `0 ~ 255` 或 `-127 ~ 128`，也可以按指数规律代表 `1, 10, 100, ..., 10^255`。只要所有读取该数据的人和程序遵守同一套映射公式或转换算法，这串 `0` 和 `1` 就有了明确的数学含义。"
      ],
      "formula": {
        "expr": "M = 2^N",
        "explain": "N 为分配给单个数值的比特位宽（如 8、16、32、64）；M 为这些比特位所能表示的互不相同的离散状态总数（如 8 位对应 256 个状态）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：比特位宽与编码映射实验室",
      "instruction": "拖动「比特位宽」与「目标输入值」，观察有限的 2^N 个离散刻度如何量化连续输入；开启「指数映射」对比线性与非均匀编码的精度差异。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "比特位宽 (N)",
          "min": 2,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": " bit"
        },
        {
          "type": "slider",
          "id": "target",
          "label": "目标输入值 (位置比例)",
          "min": 0,
          "max": 100,
          "step": 1,
          "value": 37,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "expMode",
          "label": "切换为指数映射 (10^k)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var N = lab.values.bits;\n  var targetPct = lab.values.target;\n  var expMode = lab.values.expMode;\n  var M = Math.pow(2, N);\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, w, h);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 60; gx < w; gx += 60) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();\n  }\n  for (var gy = 40; gy < h; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();\n  }\n\n  var levels = [];\n  for (var k = 0; k < M; k++) {\n    if (expMode) {\n      levels.push(Math.pow(10, (k / (M - 1)) * 3));\n    } else {\n      levels.push(k);\n    }\n  }\n\n  var minVal = levels[0];\n  var maxVal = levels[M - 1];\n  var realVal = minVal + (targetPct / 100) * (maxVal - minVal);\n\n  var bestK = 0;\n  var bestDist = Infinity;\n  for (var i = 0; i < M; i++) {\n    var d = Math.abs(levels[i] - realVal);\n    if (d < bestDist) {\n      bestDist = d;\n      bestK = i;\n    }\n  }\n\n  var storedVal = levels[bestK];\n  var err = Math.abs(realVal - storedVal);\n  var localGap = bestK < M - 1 ? (levels[bestK + 1] - levels[bestK]) : (levels[bestK] - levels[bestK - 1]);\n\n  var padL = 50;\n  var padR = 50;\n  var axisW = w - padL - padR;\n  var axisY = 128;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText(expMode ? '非均匀指数编码 (1 ~ 1000)：小数值密集，大数值稀疏' : '均匀线性编码 (0 ~ ' + (M - 1) + ')：全域间隙完全相等', 24, 28);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px monospace';\n  ctx.fillText('可选状态总数 2^' + N + ' = ' + M + ' 个', 24, 48);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.35)';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(padL, axisY);\n  ctx.lineTo(padL + axisW, axisY);\n  ctx.stroke();\n\n  for (var j = 0; j < M; j++) {\n    var nx = (levels[j] - minVal) / (maxVal - minVal);\n    var px = padL + nx * axisW;\n    var isBest = (j === bestK);\n    ctx.strokeStyle = isBest ? '#10b981' : '#38bdf8';\n    ctx.lineWidth = isBest ? 3 : 1.5;\n    ctx.beginPath();\n    ctx.moveTo(px, axisY - (isBest ? 18 : 10));\n    ctx.lineTo(px, axisY + (isBest ? 18 : 10));\n    ctx.stroke();\n    if (isBest) {\n      ctx.fillStyle = '#10b981';\n      ctx.beginPath();\n      ctx.arc(px, axisY, 5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n  }\n\n  var tx = padL + (targetPct / 100) * axisW;\n  var bestNx = (storedVal - minVal) / (maxVal - minVal);\n  var bestPx = padL + bestNx * axisW;\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([4, 3]);\n  ctx.beginPath();\n  ctx.moveTo(tx, axisY - 42);\n  ctx.lineTo(tx, axisY + 34);\n  ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(tx, axisY - 42, 4, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('输入 ' + (expMode ? realVal.toFixed(1) : realVal.toFixed(2)), Math.max(60, Math.min(w - 60, tx)), axisY - 52);\n\n  if (Math.abs(tx - bestPx) > 2) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(tx, axisY + 28);\n    ctx.lineTo(bestPx, axisY + 28);\n    ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '11px monospace';\n    ctx.fillText('误差 ' + err.toFixed(2), (tx + bestPx) / 2, axisY + 44);\n  }\n\n  var binStr = bestK.toString(2);\n  while (binStr.length < N) binStr = '0' + binStr;\n\n  ctx.fillStyle = 'rgba(16,185,129,0.12)';\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1;\n  ctx.fillRect(24, 184, w - 48, 40);\n  ctx.strokeRect(24, 184, w - 48, 40);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText('匹配比特模式: [' + binStr + ']  ->  存储值: ' + (expMode ? storedVal.toFixed(2) : storedVal), 40, 209);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.textAlign = 'right';\n  ctx.fillText('当前区间步长(精度间隙): ' + (expMode ? localGap.toFixed(2) : '1.00'), w - 40, 209);\n\n  lab.setReadout('位宽: ' + N + ' bit (' + M + '态) | 输入: ' + realVal.toFixed(2) + ' | 实际存储: ' + storedVal.toFixed(2) + ' | 误差: ' + err.toFixed(3) + ' | 局部步长: ' + localGap.toFixed(2));\n});"
    },
    {
      "type": "concept",
      "heading": "“大数吃小数”陷阱与两种核心格式：定点 vs 浮点",
      "paragraphs": [
        "有限精度带来的另一个经典灾难，发生在**两个数量级相差悬殊的数相加**时。比如你让计算机计算 `1 + 0.00000001`，数学上结果毫无疑问是 `1.00000001`，但计算机却可能直接回答你 `1`！这是因为为了对齐小数点，微小数值的有效数字被远远推到了计算机有效位宽的右侧边界之外，在舍入时被无情截断了。",
        "尽管比特编码方案有无数种可能，但工程界最终只普及了两种通用格式：**定点格式（Fixed Point，也称整数）**和**浮点格式（Floating Point，也称实数）**。例如在本书配套的 BASIC 示例代码中，开发者用变量名末尾的 `%` 符号来显式区分定点数（如 `I%`、`N%`、`SUM%`），而其余变量（如 `X`、`Y`、`MEAN`）则默认采用浮点数。",
        "在评估任何一种数字编码格式时，工程师必须盯紧两个核心指标：**范围（Range）**——它能表示的最大数与最小数之间的跨度；以及**精度（Precision）**——相邻两个可表示数字之间“台阶缝隙”的大小。比特总数固定时，把步长放大就能覆盖更广的范围，把步长缩小就能换取更高的局部精度，二者永远处于此消彼长的权衡之中。"
      ],
      "formula": {
        "expr": "Precision (Gap) ≈ Range / 2^N",
        "explain": "在均匀编码下，相邻两个可表示数字之间的最小缝隙（Precision）近似等于总表示范围（Range）除以可表示的状态总数（2^N）。比特数 N 固定时，范围越大，缝隙就越粗糙。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：“大数吃小数”与累加丢失模拟器",
      "instruction": "调节「有效数字位数」和「微小增量大小 (10^-k)」，观察 1 + 0.00000001 的数字对齐与尾数截断；打开「连续累加 1000 次」看微小误差如何演变为巨额失真。",
      "controls": [
        {
          "type": "slider",
          "id": "precDigits",
          "label": "有效数字位数 (精度窗口)",
          "min": 3,
          "max": 9,
          "step": 1,
          "value": 7,
          "unit": " 位"
        },
        {
          "type": "slider",
          "id": "epsExp",
          "label": "微小增量 (10^-k)",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 8,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "loopAdd",
          "label": "连续累加 1000 次轨迹对比",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  var P = lab.values.precDigits;\n  var k = lab.values.epsExp;\n  var loopAdd = lab.values.loopAdd;\n  var eps = Math.pow(10, -k);\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, w, h);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 60; gx < w; gx += 60) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, h); ctx.stroke();\n  }\n  for (var gy = 40; gy < h; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke();\n  }\n\n  var singleComp = Number((1 + eps).toPrecision(P));\n  var eaten = (singleComp === 1);\n\n  if (!loopAdd) {\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 14px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('单次加法寄存器对齐视图：1 + 10^-' + k + '  (有效精度窗口 = ' + P + ' 位)', 24, 28);\n\n    var totalCols = 10;\n    var startX = 155;\n    var colW = 46;\n\n    ctx.fillStyle = 'rgba(16,185,129,0.10)';\n    ctx.strokeStyle = '#10b981';\n    ctx.lineWidth = 2;\n    ctx.fillRect(startX - 6, 48, P * colW + 12, 92);\n    ctx.strokeRect(startX - 6, 48, P * colW + 12, 92);\n\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText('可保留的 ' + P + ' 位有效窗口', startX, 43);\n\n    if (P < totalCols) {\n      ctx.fillStyle = '#ec4899';\n      ctx.fillText('超出窗口(被舍入丢弃)', startX + P * colW + 12, 43);\n    }\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText('大数 A =', 28, 78);\n    ctx.fillText('小数 B =', 28, 120);\n\n    for (var c = 0; c < totalCols; c++) {\n      var cx = startX + c * colW;\n      var digitA = (c === 0) ? '1' : '0';\n      var digitB = (c === k) ? '1' : '0';\n      var inWin = (c < P);\n\n      ctx.fillStyle = inWin ? '#f8fafc' : 'rgba(248,250,252,0.3)';\n      ctx.font = 'bold 20px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText(digitA, cx + colW / 2, 80);\n\n      if (c === k) {\n        ctx.fillStyle = inWin ? '#38bdf8' : '#ec4899';\n      } else {\n        ctx.fillStyle = inWin ? '#94a3b8' : 'rgba(148,163,184,0.25)';\n      }\n      ctx.fillText(digitB, cx + colW / 2, 122);\n\n      if (c === 0) {\n        ctx.fillStyle = '#f59e0b';\n        ctx.fillText('.', cx + colW, 80);\n        ctx.fillText('.', cx + colW, 122);\n      }\n    }\n\n    var idealStr = (1 + eps).toFixed(Math.max(k, 2));\n    var compStr = singleComp.toFixed(Math.max(k, 2));\n\n    ctx.textAlign = 'left';\n    ctx.font = 'bold 14px monospace';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('数学理想结果: ' + idealStr, 28, 180);\n\n    ctx.fillStyle = eaten ? '#ec4899' : '#10b981';\n    ctx.fillText('计算机存储结果: ' + compStr + (eaten ? '  <-- 小数被完全吃掉！' : '  (成功保留增量)'), 28, 212);\n\n    lab.setReadout('精度: ' + P + '位 | 增量: ' + eps.toFixed(k) + ' | 理想: ' + idealStr + ' | 实际: ' + compStr + (eaten ? ' [发生大数吃小数!]' : ' [正常]'));\n  } else {\n    var steps = 1000;\n    var naive = 1;\n    var idealArr = [1];\n    var naiveArr = [1];\n    for (var s = 1; s <= steps; s++) {\n      naive = Number((naive + eps).toPrecision(P));\n      idealArr.push(1 + s * eps);\n      naiveArr.push(naive);\n    }\n    var sumSmallFirst = Number((steps * eps).toPrecision(P));\n    var smartFinal = Number((1 + sumSmallFirst).toPrecision(P));\n\n    var minY = 1;\n    var maxY = 1 + steps * eps;\n    if (maxY <= minY) maxY = minY + 1e-6;\n\n    var plotL = 90;\n    var plotR = w - 30;\n    var plotT = 46;\n    var plotB = 192;\n    var plotW = plotR - plotL;\n    var plotH = plotB - plotT;\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 14px sans-serif';\n    ctx.textAlign = 'left';\n    ctx.fillText('连续累加 1000 次 10^-' + k + '：直接累加 vs 先聚小再加大', 24, 26);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.3)';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(plotL, plotT); ctx.lineTo(plotL, plotB); ctx.lineTo(plotR, plotB);\n    ctx.stroke();\n\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (var i1 = 0; i1 <= steps; i1 += 10) {\n      var x1 = plotL + (i1 / steps) * plotW;\n      var y1 = plotB - ((idealArr[i1] - minY) / (maxY - minY)) * plotH;\n      if (i1 === 0) ctx.moveTo(x1, y1); else ctx.lineTo(x1, y1);\n    }\n    ctx.stroke();\n\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2.5;\n    ctx.beginPath();\n    for (var i2 = 0; i2 <= steps; i2 += 10) {\n      var x2 = plotL + (i2 / steps) * plotW;\n      var y2 = plotB - ((naiveArr[i2] - minY) / (maxY - minY)) * plotH;\n      if (i2 === 0) ctx.moveTo(x2, y2); else ctx.lineTo(x2, y2);\n    }\n    ctx.stroke();\n\n    ctx.fillStyle = '#10b981';\n    var smartY = plotB - ((smartFinal - minY) / (maxY - minY)) * plotH;\n    ctx.beginPath();\n    ctx.arc(plotR, Math.max(plotT, Math.min(plotB, smartY)), 6, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.font = '11px monospace';\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'right';\n    ctx.fillText(maxY.toFixed(Math.max(1, k - 2)), plotL - 8, plotT + 6);\n    ctx.fillText('1.0', plotL - 8, plotB + 4);\n\n    ctx.textAlign = 'left';\n    ctx.fillStyle = '#38bdf8';\n    ctx.fillText('--- 数学理想终点: ' + maxY.toPrecision(Math.min(9, P + 2)), 110, 66);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('--- 逐次直接累加: ' + naive.toFixed(Math.max(2, k)), 110, 86);\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('● 先聚小数再相加: ' + smartFinal.toFixed(Math.max(2, k)), 110, 106);\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.textAlign = 'center';\n    ctx.fillText('累加次数 (0 -> 1000 次)', plotL + plotW / 2, plotB + 22);\n\n    lab.setReadout('1000次累加 | 理想: ' + maxY.toFixed(k) + ' | 直接累加: ' + naive.toFixed(k) + ' | 先聚小数再加: ' + smartFinal.toFixed(k));\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "比特数决定了状态总数上限（2^N），计算机无法表示连续实数，任何存储本质上都是在离散台阶上做“就近取整”。",
        "同一串比特模式没有任何绝对含义，全靠编码约定来解释；读取二进制文件或硬件寄存器时，必须先确认其编码规则。",
        "评估数值格式永远看两个维度：范围（Range，能到多大）与精度（Precision，台阶有多细）；位宽固定时两者不可兼得。",
        "警惕“大数吃小数”陷阱：切忌把大量微小增量直接往一个大基数（如累加器或时间戳）上反复相加，应先将小数局部聚合成大数再合并。"
      ]
    }
  ]
});
