window.__BOOK_REGISTER_SECTION__("sec_213", {
  "title": "复数系统 (The Complex Number System)",
  "intuition": "复数通过一个符号捆绑“实部”与“虚部”两个独立自由度，将二维平面上的几何位置与代数的四则运算融为一体，是化简频域分析与正交信号处理的底层基石。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从“无解的物理问题”到虚数 j 的诞生",
      "paragraphs": [
        "为了直觉理解复数，想象一个孩子竖直向上抛球：初速度为 `9.8 m/s`，重力加速度为 `9.8 m/s²`。球在 `1` 秒时到达最高点 `4.9` 米，随后下落并在 `2` 秒时回到手中。如果我们反过来问“球在什么时候经过某个高度 `h`”，物理方程会给出两个时刻解。",
        "只要问题符合现实（例如问何时到达 `3` 米），根号内为正，方程就能给出 `0.38` 秒（上升）和 `1.62` 秒（下落）两个合理答案。但如果我们问一个**违背现实的问题**：球什么时候能到达 `10` 米？代入公式后，根号内出现了负数 `√(-1.041)`。16 世纪意大利数学家卡尔达诺（Cardano）首次在多项式方程中严肃对待这种“不存在的数”，两个世纪后德国数学家高斯（Gauss）正式命名了**复数（Complex Numbers）**。",
        "为了标准化，所有负数的平方根都被拆解为一个实数乘以“负一的平方根” `√(-1)`。例如 `1 + √(-1.041)` 写成 `1 + 1.02√(-1)`。数学家通常用 `i` 表示 `√(-1)`，但**电气工程与 DSP 领域统一使用 `j`**，因为 `i` 已经被电流（current）占用了。"
      ],
      "formula": {
        "expr": "t = 1 ± √(1 - h / 4.9)",
        "explain": "t 为时间（秒），h 为球离地高度（米）。当 h ≤ 4.9 时，根号内非负，得到两个实数时间；当 h > 4.9 时，根号内为负，解裂变为一对共轭复数 1 ± j√(h/4.9 - 1)。"
      }
    },
    {
      "type": "lab",
      "heading": "实验一：抛球高度与根在复平面上的“裂变”",
      "instruction": "拖动“目标高度 h”滑块，观察当 h 越过物理极限 4.9 米时，左侧抛物线交点如何消失，同时右侧复平面上的两个根如何碰撞并垂直“裂变”进虚数轴方向。",
      "controls": [
        {
          "type": "slider",
          "id": "h",
          "label": "目标高度 h",
          "min": 0,
          "max": 10,
          "step": 0.1,
          "value": 3,
          "unit": " m"
        },
        {
          "type": "toggle",
          "id": "showLocus",
          "label": "显示根轨迹辅助线",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var h = lab.values.h;\n  var showLocus = lab.values.showLocus;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var lx0 = 42, lx1 = 330, ly0 = 212, ly1 = 26;\n  var mapT = function(t) { return lx0 + ((t + 0.15) / 2.3) * (lx1 - lx0); };\n  var mapH = function(val) { return ly0 - (val / 10.5) * (ly0 - ly1); };\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var g = 0; g <= 10; g += 2) {\n    var gy = mapH(g);\n    ctx.beginPath(); ctx.moveTo(lx0, gy); ctx.lineTo(lx1, gy); ctx.stroke();\n  }\n  for (var gt = 0; gt <= 2; gt += 0.5) {\n    var gx = mapT(gt);\n    ctx.beginPath(); ctx.moveTo(gx, ly1); ctx.lineTo(gx, ly0); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.4)';\n  ctx.beginPath();\n  ctx.moveTo(lx0, ly0); ctx.lineTo(lx1, ly0);\n  ctx.moveTo(mapT(0), ly0); ctx.lineTo(mapT(0), ly1);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('物理空间: 高度 h(t)', lx0, 16);\n  ctx.fillText('t (s)', lx1 - 24, ly0 + 16);\n  ctx.fillText('4.9m', lx0 - 34, mapH(4.9) + 4);\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var t = 0; t <= 2.001; t += 0.02) {\n    var hv = -4.9 * t * t + 9.8 * t;\n    var px = mapT(t), py = mapH(hv);\n    if (t === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  var targetY = mapH(h);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath(); ctx.moveTo(lx0, targetY); ctx.lineTo(lx1, targetY); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('h = ' + h.toFixed(1) + 'm', lx1 - 56, targetY - 6);\n\n  var rx0 = 385, rx1 = 695, ry0 = 212, ry1 = 26;\n  var mapRe = function(re) { return rx0 + ((re + 0.5) / 3.0) * (rx1 - rx0); };\n  var mapIm = function(im) { return (ry0 + ry1) / 2 - (im / 1.4) * ((ry0 - ry1) / 2); };\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var reG = -0.5; reG <= 2.501; reG += 0.5) {\n    var rgx = mapRe(reG);\n    ctx.beginPath(); ctx.moveTo(rgx, ry1); ctx.lineTo(rgx, ry0); ctx.stroke();\n  }\n  for (var imG = -1.2; imG <= 1.201; imG += 0.4) {\n    var igy = mapIm(imG);\n    ctx.beginPath(); ctx.moveTo(rx0, igy); ctx.lineTo(rx1, igy); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.45)';\n  ctx.beginPath();\n  ctx.moveTo(rx0, mapIm(0)); ctx.lineTo(rx1, mapIm(0));\n  ctx.moveTo(mapRe(0), ry1); ctx.lineTo(mapRe(0), ry0);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('复平面: 时间根 t = Re(t) + j·Im(t)', rx0, 16);\n  ctx.fillText('Real', rx1 - 26, mapIm(0) - 6);\n  ctx.fillText('Imag', mapRe(0) + 6, ry1 + 10);\n\n  if (showLocus) {\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.setLineDash([3, 3]);\n    ctx.beginPath();\n    ctx.moveTo(mapRe(0), mapIm(0)); ctx.lineTo(mapRe(2), mapIm(0));\n    ctx.moveTo(mapRe(1), mapIm(-1.3)); ctx.lineTo(mapRe(1), mapIm(1.3));\n    ctx.stroke();\n    ctx.setLineDash([]);\n  }\n\n  var disc = 1 - h / 4.9;\n  if (disc >= 0) {\n    var d = Math.sqrt(disc);\n    var t1 = 1 - d, t2 = 1 + d;\n    ctx.fillStyle = '#10b981';\n    [t1, t2].forEach(function(tv) {\n      ctx.beginPath(); ctx.arc(mapT(tv), targetY, 5, 0, Math.PI * 2); ctx.fill();\n      ctx.beginPath(); ctx.arc(mapRe(tv), mapIm(0), 6, 0, Math.PI * 2); ctx.fill();\n    });\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('t1=' + t1.toFixed(2), mapRe(t1) - 18, mapIm(0) + 18);\n    ctx.fillText('t2=' + t2.toFixed(2), mapRe(t2) - 18, mapIm(0) - 12);\n    lab.setReadout('实数解 (h ≤ 4.9m): t₁ = ' + t1.toFixed(3) + ' s,  t₂ = ' + t2.toFixed(3) + ' s  (虚部 = 0)');\n  } else {\n    var im = Math.sqrt(-disc);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('无真实交点（进入复数域）', lx0 + 75, targetY - 8);\n    [im, -im].forEach(function(iv) {\n      ctx.beginPath(); ctx.arc(mapRe(1), mapIm(iv), 6, 0, Math.PI * 2); ctx.fill();\n    });\n    ctx.fillText('1 + ' + im.toFixed(2) + 'j', mapRe(1) + 10, mapIm(im) + 4);\n    ctx.fillText('1 - ' + im.toFixed(2) + 'j', mapRe(1) + 10, mapIm(-im) + 4);\n    lab.setReadout('复数共轭解 (h > 4.9m): t = 1 ± ' + im.toFixed(3) + ' j  (球无法到达该高度)');\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "复平面、单变量简写与 Re / Im 提取算子",
      "paragraphs": [
        "每个复数都可以写成标准直角坐标形式 `a + bj`，其中 `a` 是**实部（real part）**，`b` 是**虚部（imaginary part）**。普通的实数（如 `2` 或 `-1.414`）其实就是虚部为 `0` 的复数（`2 + 0j`）。",
        "就像实数对应一维数轴上的点，所有复数都在一个被称为**复平面（Complex Plane）**的二维坐标系中拥有唯一位置：横轴是实轴（Real axis，即普通的实数轴），纵轴是虚轴（Imaginary axis）。例如原书图 30-1 中的三个点 `A = 2 + 6j`、`B = -4 - 1.5j`、`C = 3 - 7j`，在工程公式中都只需要用 `A`、`B`、`C` 单个字母表示。",
        "这种单变量记法带来了**极强的简洁性优势**——一个字母同时封装两个变量，使 DSP 方程大幅缩短；但它也有一个**不容忽视的缺点**：你必须时刻在脑子里记住哪个字母是复数变量，哪个字母只是普通实数。",
        "要从复数变量中拆出实部与虚部，数学上使用 `Re( )` 和 `Im( )` 两个算子。请务必注意一个常见初学者陷阱：**`Im( )` 算子返回的是虚部前面的实数系数，本身不包含 `j`**！例如 `Im(3 + 4j)` 的结果是 `4`，而不是 `4j`。"
      ],
      "formula": {
        "expr": "Re(a + bj) = a ,   Im(a + bj) = b",
        "explain": "Re() 提取实轴坐标 a，Im() 提取虚轴坐标数值 b（注意返回值 b 是实数，不带虚数单位 j）。"
      }
    },
    {
      "type": "concept",
      "heading": "复数四则运算与两大代数魔法（j² = -1 与共轭复数）",
      "paragraphs": [
        "好消息是，复数完全遵循普通实数的代数运算法则（交换律 `AB = BA`、结合律 `(A+B)+C = A+(B+C)`、分配律 `A(B+C) = AB + AC` 统统成立），你只需把 `j` 当成一个普通符号常量来展开括号即可。加减法就是“实部归实部，虚部归虚部”：`Re(A±B) = Re(A)±Re(B)`，`Im(A±B) = Im(A)±Im(B)`。",
        "在乘法和除法中，全书重点总结了两个化简“魔法”：",
        "**魔法一：逢 `j²` 必换为 `-1`**。展开 `(a + bj)(c + dj)` 会得到 `ac + adj + bcj + bd·j²`。由定义 `j = √(-1)` 可知 `j² = -1`，于是最后一项变成实数 `-bd`，乘积化简为 `(ac - bd) + j(bc + ad)`。",
        "**魔法二：共轭消分母**。在做复数除法 `(a + bj) / (c + dj)` 时，分母里混着讨厌的 `j`。把虚部反号的操作称为取**共轭复数（Complex Conjugate）**，记作右上角带星号 `Z* = a - bj`。只要分子和分母同时乘以分母的共轭复数 `c - dj`，分母就变成了 `(c + dj)(c - dj) = c² + d²`，所有虚数项全部抵消，只剩一个干净的实数分母！"
      ],
      "formula": {
        "expr": "(a + bj) / (c + dj) = (ac + bd) / (c² + d²) + j · (bc - ad) / (c² + d²)",
        "explain": "分子分母同乘以分母的共轭复数 (c - dj)，利用 j² = -1 消除分母中的所有 j 项，从而分离出商的实部与虚部。"
      }
    },
    {
      "type": "lab",
      "heading": "实验二：复数乘除与共轭去分母交互工作台",
      "instruction": "调节复数 A = a + bj 与 B = c + dj 的实虚部，切换乘法 (A×B) 或除法 (A/B)，并开启“显示共轭复数 B*”观察乘法旋转缩放与除法共轭有理化过程。",
      "controls": [
        {
          "type": "slider",
          "id": "a",
          "label": "Re(A) = a",
          "min": -4,
          "max": 4,
          "step": 0.5,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "b",
          "label": "Im(A) = b",
          "min": -4,
          "max": 4,
          "step": 0.5,
          "value": 3,
          "unit": "j"
        },
        {
          "type": "slider",
          "id": "c",
          "label": "Re(B) = c",
          "min": -4,
          "max": 4,
          "step": 0.5,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "d",
          "label": "Im(B) = d",
          "min": -4,
          "max": 4,
          "step": 0.5,
          "value": -1,
          "unit": "j"
        },
        {
          "type": "toggle",
          "id": "isDiv",
          "label": "运算模式：开启为除法 A/B（关闭为乘法 A×B）",
          "value": true
        },
        {
          "type": "toggle",
          "id": "showConj",
          "label": "在复平面显示 B 的共轭复数 B*",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var a = lab.values.a;\n  var b = lab.values.b;\n  var c = lab.values.c;\n  var d = lab.values.d;\n  var isDiv = lab.values.isDiv;\n  var showConj = lab.values.showConj;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var denom = c * c + d * d;\n  var resRe = 0, resIm = 0, valid = true;\n  if (!isDiv) {\n    resRe = a * c - b * d;\n    resIm = b * c + a * d;\n  } else {\n    if (denom === 0) {\n      valid = false;\n    } else {\n      resRe = (a * c + b * d) / denom;\n      resIm = (b * c - a * d) / denom;\n    }\n  }\n\n  var maxMag = Math.max(4.5, Math.hypot(a, b), Math.hypot(c, d), valid ? Math.hypot(resRe, resIm) : 4.5);\n  var cx = 210, cy = 120;\n  var scale = Math.min(24, 96 / maxMag);\n\n  ctx.save();\n  ctx.beginPath();\n  ctx.rect(10, 10, 400, 220);\n  ctx.clip();\n\n  var step = maxMag > 10 ? 4 : (maxMag > 6 ? 2 : 1);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var u = -Math.ceil(maxMag + 4); u <= Math.ceil(maxMag + 4); u += step) {\n    var px = cx + u * scale;\n    var py = cy - u * scale;\n    ctx.beginPath(); ctx.moveTo(px, 10); ctx.lineTo(px, 230); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(10, py); ctx.lineTo(410, py); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.4)';\n  ctx.beginPath();\n  ctx.moveTo(10, cy); ctx.lineTo(410, cy);\n  ctx.moveTo(cx, 10); ctx.lineTo(cx, 230);\n  ctx.stroke();\n\n  var drawVec = function(re, im, color, label, dashed) {\n    var tx = cx + re * scale;\n    var ty = cy - im * scale;\n    ctx.strokeStyle = color;\n    ctx.fillStyle = color;\n    ctx.lineWidth = dashed ? 1.5 : 2.5;\n    if (dashed) ctx.setLineDash([4, 4]);\n    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(tx, ty); ctx.stroke();\n    ctx.setLineDash([]);\n    var ang = Math.atan2(ty - cy, tx - cx);\n    if (Math.hypot(tx - cx, ty - cy) > 6) {\n      ctx.beginPath();\n      ctx.moveTo(tx, ty);\n      ctx.lineTo(tx - 8 * Math.cos(ang - 0.35), ty - 8 * Math.sin(ang - 0.35));\n      ctx.lineTo(tx - 8 * Math.cos(ang + 0.35), ty - 8 * Math.sin(ang + 0.35));\n      ctx.closePath(); ctx.fill();\n    } else {\n      ctx.beginPath(); ctx.arc(tx, ty, 4, 0, Math.PI * 2); ctx.fill();\n    }\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(label, tx + 6, ty - 4);\n  };\n\n  drawVec(a, b, '#38bdf8', 'A', false);\n  drawVec(c, d, '#f59e0b', 'B', false);\n  if (showConj) {\n    drawVec(c, -d, '#ec4899', 'B*', true);\n  }\n  if (valid) {\n    drawVec(resRe, resIm, '#10b981', isDiv ? 'A/B' : 'A×B', false);\n  }\n  ctx.restore();\n\n  var fmtC = function(re, im) {\n    var s = im >= 0 ? ' + ' : ' - ';\n    return re.toFixed(2) + s + Math.abs(im).toFixed(2) + 'j';\n  };\n\n  ctx.fillStyle = 'rgba(255,255,255,0.05)';\n  ctx.fillRect(425, 16, 280, 208);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(425, 16, 280, 208);\n\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(isDiv ? '共轭消除分母计算过程 (A / B)' : '展开与 j² = -1 化简 (A × B)', 440, 40);\n\n  ctx.font = '12px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('A  = ' + fmtC(a, b), 440, 68);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('B  = ' + fmtC(c, d), 440, 88);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('B* = ' + fmtC(c, -d), 440, 108);\n\n  ctx.fillStyle = '#cbd5e1';\n  if (!isDiv) {\n    ctx.fillText('实部 ac - bd = ' + (a * c).toFixed(2) + ' - (' + (b * d).toFixed(2) + ')', 440, 138);\n    ctx.fillText('虚部 bc + ad = ' + (b * c).toFixed(2) + ' + (' + (a * d).toFixed(2) + ')', 440, 158);\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText('A×B = ' + fmtC(resRe, resIm), 440, 192);\n    lab.setReadout('乘法结果: (' + fmtC(a, b) + ') × (' + fmtC(c, d) + ') = ' + fmtC(resRe, resIm));\n  } else if (!valid) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillText('错误: 分母 B = 0 + 0j，不能除以零！', 440, 150);\n    lab.setReadout('错误: B = 0 + 0j，分母 c² + d² = 0 无法执行除法。');\n  } else {\n    ctx.fillText('分子 A·B* = ' + fmtC(a * c + b * d, b * c - a * d), 440, 138);\n    ctx.fillText('实数分母 B·B* = c²+d² = ' + denom.toFixed(2), 440, 158);\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText('A/B = ' + fmtC(resRe, resIm), 440, 192);\n    lab.setReadout('除法结果: (' + fmtC(a, b) + ') / (' + fmtC(c, d) + ') = ' + fmtC(resRe, resIm) + '  (分母已化为实数 ' + denom.toFixed(2) + ')');\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "符号约定避坑：DSP 与电子工程中习惯用 j 表示 √(-1)，纯数学文献多用 i，阅读代码和论文时切勿把复数单位 j 与电流变量 i 混淆。",
        "Im() 算子返回值不含 j：Im(3 + 4j) 等于实数 4 而非 4j。在 C/Python/MATLAB 等编程语言中提取虚部函数（如 imag()）同样只返回实数标量。",
        "单字母复变量的隐性心智负担：用单个字母 Z 代表复数固然让公式简短，但写代码时必须严格标注类型，防止把复数变量误当成普通实数去比较大小。",
        "手推公式两板斧：遇到 j² 立刻替换成 -1；遇到分母带 j 立刻上下同乘分母的共轭复数 (c - dj)，分母就会坍缩为纯实数平方和 c² + d²。"
      ]
    }
  ]
});
