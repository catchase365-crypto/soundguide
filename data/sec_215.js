window.__BOOK_REGISTER_SECTION__("sec_215", {
  "title": "利用“替换法”应用复数 (Using Complex Numbers by Substitution)",
  "intuition": "把两个互不干扰的物理维度分别塞进复数的实部和虚部，就能直接借用复数运算的“现成工具箱”一键打包处理；但前提是该物理世界的规律必须严丝合缝地吻合复数运算法则。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 为什么“现实中不存在的数”能解决工程问题？",
      "paragraphs": [
        "在前面的学习中，我们已经知道复数源于对负数开平方（`j = √(-1)`），它代表常规世界里“不存在”的解。但无论写成直角坐标形式 `a + bj` 还是极坐标指数形式 `M·e^(jθ)`，**单个复数都天然捆绑了两份独立信息**（`a` 与 `b`，或者模长 `M` 与相位 `θ`），并且遵循与普通实数几乎完全一致的加减乘除法则。",
        "既然数学家已经把复数的运算工具磨得锋利无比，工程师面临实际问题时的哲学就是：**“如果你手里的工具是一把锤子，那就把问题变成钉子。”** 将现实中的物理问题转化为复数形式，用复数规则算完，再转换回物理答案。",
        "在信号处理中，将物理问题映射为复数主要有两条路线：**替换法（Substitution）** 与 **数学等价法（Mathematical Equivalence）**。本节聚焦于最直观的**替换法**：挑出两个真实的物理参数，一个放进实部，另一个乘上 `j` 放进虚部，把它们捆绑成单一实体进行计算，算完后再**直接丢掉 `j`**，分别读回实部和虚部的物理意义。"
      ],
      "formula": {
        "expr": "Z = X_物理 + j · Y_物理  ⇄  (物理量 X, 物理量 Y)",
        "explain": "X_物理：填入实部的第1个真实物理维度（如东西方向力）；Y_物理：填入虚部的第2个独立物理维度（如南北方向力）；j：仅作为区分两个维度的“标签占位符”，还原物理答案时直接舍去。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 正面教材：用复数加法秒解帆船受力合成",
      "paragraphs": [
        "在基础物理中，**矢量（Vector）** 可以同时描述力、速度或加速度的大小与方向。设想一艘帆船同时受到两个力的推动：风向对它施加的推力矢量 `A`，以及洋流对它施加的推力矢量 `B`。根据平行四边形法则，船受到的合外力 `C` 就是两个矢量的矢量和。",
        "利用替换法，我们规定：**东西方向（东正西负）放入实部，南北方向（北正南负）放入虚部**。假设风力 `A` 为“向东 2 份、向北 6 份”，写成复数就是 `2 + 6j`；洋流 `B` 为“向东 4 份、向南 3 份”，写成复数就是 `4 - 3j`。",
        "接下来直接调用复数加法（实部加实部，虚部加虚部）：`C = (2 + 6j) + (4 - 3j) = 6 + 3j`。算完之后把 `j` 丢掉，立刻翻译回物理答案：帆船最终受到的合力是**向东 6 份、向北 3 份**。复数在这里充当了一个高度规范化的“双通道记账本”。"
      ],
      "formula": {
        "expr": "C = A + B = (a_东 + b_东) + j(a_北 + b_北)",
        "explain": "A、B：代表风力与洋流的二维复数；a_东, b_东：各自的东西分量；a_北, b_北：各自的南北分量；C：合力复数，丢掉虚数单位 j 即为物理合力坐标。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：复平面帆船受力合成（复数加法即平行四边形法则）",
      "instruction": "拖动风力 A 与洋流 B 的东西/南北分量滑块，观察右侧复数代数加法如何与左侧复平面的矢量合成完全同步。",
      "controls": [
        {
          "type": "slider",
          "id": "ax",
          "label": "风力 A 东西分量 (实部)",
          "min": -6,
          "max": 6,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "ay",
          "label": "风力 A 南北分量 (虚部)",
          "min": -6,
          "max": 6,
          "step": 1,
          "value": 6,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bx",
          "label": "洋流 B 东西分量 (实部)",
          "min": -6,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "by",
          "label": "洋流 B 南北分量 (虚部)",
          "min": -6,
          "max": 6,
          "step": 1,
          "value": -3,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showPara",
          "label": "显示平行四边形辅助线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var ax = lab.values.ax, ay = lab.values.ay;\n  var bx = lab.values.bx, by = lab.values.by;\n  var cxSum = ax + bx, cySum = ay + by;\n  var showPara = lab.values.showPara;\n\n  var ox = 175, oy = 120, scale = 8.2;\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var i = -12; i <= 12; i += 2) {\n    var gx = ox + i * scale;\n    var gy = oy - i * scale;\n    ctx.beginPath(); ctx.moveTo(gx, oy - 12 * scale); ctx.lineTo(gx, oy + 12 * scale); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(ox - 12 * scale, gy); ctx.lineTo(ox + 12 * scale, gy); ctx.stroke();\n  }\n\n  // Axes\n  ctx.strokeStyle = 'rgba(248,250,252,0.35)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(ox - 12.5 * scale, oy); ctx.lineTo(ox + 12.5 * scale, oy); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(ox, oy - 12.5 * scale); ctx.lineTo(ox, oy + 12.5 * scale); ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('北 (+j)', ox, 14);\n  ctx.fillText('南 (-j)', ox, H - 5);\n  ctx.textAlign = 'left';\n  ctx.fillText('东 (+实)', ox + 12.8 * scale, oy + 4);\n  ctx.textAlign = 'right';\n  ctx.fillText('西 (-实)', ox - 12.8 * scale, oy + 4);\n\n  function toPx(x, y) { return [ox + x * scale, oy - y * scale]; }\n  function drawArrow(x1, y1, x2, y2, color, lw) {\n    var dx = x2 - x1, dy = y2 - y1;\n    var len = Math.hypot(dx, dy);\n    ctx.strokeStyle = color; ctx.fillStyle = color; ctx.lineWidth = lw;\n    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();\n    if (len < 3) return;\n    var ang = Math.atan2(dy, dx), head = 8;\n    ctx.beginPath();\n    ctx.moveTo(x2, y2);\n    ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));\n    ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));\n    ctx.closePath(); ctx.fill();\n  }\n\n  var pA = toPx(ax, ay), pB = toPx(bx, by), pC = toPx(cxSum, cySum);\n\n  if (showPara) {\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n    ctx.lineWidth = 1.2;\n    ctx.beginPath(); ctx.moveTo(pA[0], pA[1]); ctx.lineTo(pC[0], pC[1]); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(pB[0], pB[1]); ctx.lineTo(pC[0], pC[1]); ctx.stroke();\n    ctx.restore();\n  }\n\n  drawArrow(ox, oy, pA[0], pA[1], '#38bdf8', 2.4);\n  drawArrow(ox, oy, pB[0], pB[1], '#f59e0b', 2.4);\n  drawArrow(ox, oy, pC[0], pC[1], '#10b981', 3.0);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  if (ax !== 0 || ay !== 0) { ctx.fillStyle = '#38bdf8'; ctx.fillText('A', pA[0] + 5, pA[1] - 4); }\n  if (bx !== 0 || by !== 0) { ctx.fillStyle = '#f59e0b'; ctx.fillText('B', pB[0] + 5, pB[1] + 12); }\n  if (cxSum !== 0 || cySum !== 0) { ctx.fillStyle = '#10b981'; ctx.fillText('C = A+B', pC[0] + 6, pC[1] + 4); }\n\n  // Right info panel\n  var rx = 355;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.roundRect(rx, 16, 345, 208, 8); ctx.fill(); ctx.stroke();\n\n  function fmtC(r, i) {\n    return r + (i >= 0 ? ' + ' + i + 'j' : ' - ' + Math.abs(i) + 'j');\n  }\n  function fmtDir(r, i) {\n    var ew = r === 0 ? '东西 0' : (r > 0 ? '向东 ' + r : '向西 ' + (-r));\n    var ns = i === 0 ? '南北 0' : (i > 0 ? '向北 ' + i : '向南 ' + (-i));\n    return ew + '，' + ns;\n  }\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('复数打包运算  ⇄  真实物理意义', rx + 16, 42);\n\n  ctx.font = '13px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('风力 A = ' + fmtC(ax, ay), rx + 16, 74);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';\n  ctx.fillText('(' + fmtDir(ax, ay) + ')', rx + 185, 74);\n\n  ctx.font = '13px monospace';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('洋流 B = ' + fmtC(bx, by), rx + 16, 106);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';\n  ctx.fillText('(' + fmtDir(bx, by) + ')', rx + 185, 106);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(rx + 16, 124); ctx.lineTo(rx + 329, 124); ctx.stroke();\n\n  ctx.font = 'bold 14px monospace';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('合力 C = ' + fmtC(cxSum, cySum), rx + 16, 152);\n  ctx.font = '12px sans-serif';\n  ctx.fillText('丢掉 j 还原: ' + fmtDir(cxSum, cySum), rx + 16, 178);\n\n  var mag = Math.hypot(cxSum, cySum).toFixed(2);\n  var deg = (Math.atan2(cySum, cxSum) * 180 / Math.PI).toFixed(1);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('极坐标推力大小 |C| = ' + mag + '，方向角 = ' + deg + '°', rx + 16, 204);\n\n  lab.setReadout('C = A + B = (' + fmtC(cxSum, cySum) + ')  |  实际合力：' + fmtDir(cxSum, cySum) + '，总推力=' + mag);\n});"
    },
    {
      "type": "concept",
      "heading": "3. 致命陷阱：什么时候替换法会彻底失效？",
      "paragraphs": [
        "看到帆船例子如此优雅，你可能会想：是不是随便找两个物理量塞进复数就能算？**绝对不行！** 问题的关键在于：我们怎么知道复数数学的运算法则，恰好与原本物理问题的客观规律完全一致？在大多数工程领域，我们之所以敢用，是因为前辈数学家已经严谨证明并发表过结论。",
        "让我们看一个**替换法彻底失灵**的反面教材：假设你去买水果，苹果 5 元一箱，橙子 10 元一箱，你把它打包成价格复数 `5 + 10j`；这周你买了 6 箱苹果和 2 箱橙子，打包成数量复数 `6 + 2j`。",
        "按常理，总价等于各自单价乘以数量：苹果应花 `5 × 6 = 30` 元，橙子应花 `10 × 2 = 20` 元。但如果你直接做**复数乘法**：`(5 + 10j)(6 + 2j) = (30 - 20) + (10 + 60)j = 10 + 70j`！按照复数结果读数，苹果只花 10 元，橙子却要花 70 元——**答案荒谬透顶！**",
        "原因在于：复数乘法不仅产生了“苹果单价 × 橙子数量”这种跨物种的交叉项，还因为 **`j² = -1`** 把橙子的开销变成负数，强行从苹果总价里扣除了！复数乘法的代数结构并不匹配独立商品计价的物理规则。"
      ],
      "formula": {
        "expr": "(p₁ + j·p₂)(q₁ + j·q₂) = (p₁q₁ - p₂q₂) + j(p₁q₂ + p₂q₁)",
        "explain": "p₁, p₂：苹果与橙子单价；q₁, q₂：购买箱数。正确账单应是相互独立的 p₁q₁ 与 p₂q₂，但复数乘法强行引入了 -p₂q₂（因 j²=-1 导致倒扣）以及两个交叉混算项 p₁q₂ + p₂q₁。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：为什么“买水果乘法”会算错？—— 复数乘法交叉污染透视",
      "instruction": "调节苹果与橙子的单价和箱数，对比左侧真实账单与复数乘法结果的巨大偏差，并观察右侧 j²=-1 与交叉项如何“污染”计算结果。",
      "controls": [
        {
          "type": "slider",
          "id": "pApple",
          "label": "苹果单价 p₁ (元/箱)",
          "min": 1,
          "max": 15,
          "step": 1,
          "value": 5,
          "unit": "元"
        },
        {
          "type": "slider",
          "id": "pOrange",
          "label": "橙子单价 p₂ (元/箱)",
          "min": 1,
          "max": 15,
          "step": 1,
          "value": 10,
          "unit": "元"
        },
        {
          "type": "slider",
          "id": "qApple",
          "label": "苹果数量 q₁ (箱)",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 6,
          "unit": "箱"
        },
        {
          "type": "slider",
          "id": "qOrange",
          "label": "橙子数量 q₂ (箱)",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 2,
          "unit": "箱"
        },
        {
          "type": "toggle",
          "id": "showTerms",
          "label": "显示交叉干扰项拆解",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx, W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  var p1 = lab.values.pApple, p2 = lab.values.pOrange;\n  var q1 = lab.values.qApple, q2 = lab.values.qOrange;\n  var showTerms = lab.values.showTerms;\n\n  var realApple = p1 * q1;\n  var realOrange = p2 * q2;\n  var compReal = p1 * q1 - p2 * q2;\n  var compImag = p1 * q2 + p2 * q1;\n\n  // Left side: horizontal bar comparison\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('金额对比：真实物理账单 vs 复数乘法结果', 18, 24);\n\n  var x0 = 190, scale = 0.48;\n  // Zero axis line\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath(); ctx.moveTo(x0, 38); ctx.lineTo(x0, 218); ctx.stroke();\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px sans-serif'; ctx.textAlign = 'center';\n  ctx.fillText('0元', x0, 232);\n\n  var bars = [\n    { label: '实际苹果 (p₁·q₁)', val: realApple, color: '#10b981', y: 50 },\n    { label: '复数实部 (错当苹果)', val: compReal, color: '#ec4899', y: 92 },\n    { label: '实际橙子 (p₂·q₂)', val: realOrange, color: '#38bdf8', y: 142 },\n    { label: '复数虚部 (错当橙子)', val: compImag, color: '#f59e0b', y: 184 }\n  ];\n\n  for (var i = 0; i < bars.length; i++) {\n    var b = bars[i];\n    ctx.fillStyle = '#e2e8f0';\n    ctx.font = '11px sans-serif';\n    ctx.textAlign = 'right';\n    ctx.fillText(b.label, x0 - 10, b.y + 15);\n\n    var bw = b.val * scale;\n    ctx.fillStyle = b.color;\n    if (bw >= 0) {\n      ctx.fillRect(x0, b.y, Math.max(2, bw), 22);\n      ctx.textAlign = 'left';\n      ctx.fillText(b.val + ' 元', x0 + Math.max(2, bw) + 6, b.y + 15);\n    } else {\n      ctx.fillRect(x0 + bw, b.y, -bw, 22);\n      ctx.textAlign = 'right';\n      ctx.fillText(b.val + ' 元', x0 + bw - 6, b.y + 15);\n    }\n  }\n\n  // Right side: algebraic cross-contamination box\n  var rx = 382;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.roundRect(rx, 16, 322, 208, 8); ctx.fill(); ctx.stroke();\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('错误根源：(' + p1 + ' + ' + p2 + 'j)(' + q1 + ' + ' + q2 + 'j) 展开项', rx + 14, 40);\n\n  if (showTerms) {\n    ctx.font = '12px monospace';\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('① p₁·q₁       = +' + realApple + '     (唯一正常项)', rx + 14, 72);\n\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('② (p₂j)(q₂j)  = -' + realOrange + '     (j²=-1 导致倒扣!)', rx + 14, 102);\n\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('③ p₁·(q₂j)    = +' + (p1 * q2) + 'j   (苹果价×橙子数!)', rx + 14, 132);\n    ctx.fillText('④ (p₂j)·q₁    = +' + (p2 * q1) + 'j   (橙子价×苹果数!)', rx + 14, 160);\n\n    ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n    ctx.beginPath(); ctx.moveTo(rx + 14, 176); ctx.lineTo(rx + 308, 176); ctx.stroke();\n\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('最终错账: ' + compReal + (compImag >= 0 ? ' + ' : ' - ') + Math.abs(compImag) + 'j  (实部甚至可能变负数!)', rx + 14, 202);\n  } else {\n    ctx.fillStyle = '#94a3b8'; ctx.font = '12px sans-serif';\n    ctx.fillText('开启上方“显示交叉干扰项拆解”开关，', rx + 14, 105);\n    ctx.fillText('查看复数乘法是如何把苹果和橙子搅在一起的。', rx + 14, 128);\n  }\n\n  lab.setReadout('真实花费: 苹果' + realApple + '元 + 橙子' + realOrange + '元 = ' + (realApple + realOrange) + '元  |  复数乘法错误输出: ' + compReal + ' + ' + compImag + 'j');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "替换法的本质是“双通道打包”：把两个实物理参数分别装进实部和虚部，借助复数运算规则统一处理，最后直接舍去 j 还原为物理量。",
        "并非所有物理问题都能套用复数！只有当物理世界的合成/变换规律与复数加减乘除的代数结构完全一致时（如二维矢量合成、后续的交流电/正弦波相量分析），替换法才有效。",
        "警惕 j² = -1 与交叉项：如果两个物理量在逻辑上需要“各自独立相乘、互不串门”（如苹果和橙子分别计价），直接做复数乘法必然导致严重的交叉污染与符号反转错误。"
      ]
    }
  ]
});
