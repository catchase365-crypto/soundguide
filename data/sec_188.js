window.__BOOK_REGISTER_SECTION__("sec_188", {
  "title": "神经网络架构：从生物脉冲到三层全连接网络 (Neural Network Architecture)",
  "intuition": "神经网络不需要你手写一步步的判断规则——它只用一套极简的“输入-隐藏-输出”三层全连接结构，把所有识别与决策能力浓缩在一组权重数字里。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、三层经典架构：被动输入层与主动隐藏/输出层",
      "paragraphs": [
        "人类与动物依靠大脑中数以万亿计的神经元（通过名为动作电位的电脉冲交换信息）处理复杂任务。计算机科学中模仿这一机制的算法正式名称为**人工神经网络 (Artificial Neural Networks)**，但在工程实践中通常简称为**神经网络**。研究它的两大核心动机是：理解人脑工作机理，以及让计算机胜任传统算法极其吃力的模糊问题（例如语音理解、人脸识别）。",
        "尽管生物学家和数学家尝试过各种拓扑结构（如带反馈回路的网络），但工程中最经典、最通用的结构是如原书 Fig. 26-5 所示的**三层前馈全连接架构**：信息严格从左向右单向流动，依次经过**输入层 (Input Layer)**、**隐藏层 (Hidden Layer)** 和**输出层 (Output Layer)**。",
        "这三层节点的分工截然不同：**输入层节点是“被动的 (Passive)”**，它们不做任何数学运算，只负责接收外部数据（如图像像素、音频采样点、股价序列，或直径/亮度等提取出的特征），原封不动地复制并分发给下一层的每一个节点；而**隐藏层与输出层节点是“主动的 (Active)”**，每个节点都会对收到的所有数据执行加权、求和与非线性压缩，从而完成特征的组合与决策。"
      ],
      "formula": {
        "expr": null,
        "explain": "工程经验尺度：多数应用采用三层结构，输入节点通常不超过几百个；隐藏层节点数一般约为输入层大小的 10%；若是单纯的目标检测（有/无），输出层只需 1 个节点，对其输出值设置阈值即可给出正/负判定。"
      }
    },
    {
      "type": "concept",
      "heading": "二、主动节点的解剖：加权求和与 Sigmoid 平滑阈值",
      "paragraphs": [
        "在全连接结构中，输入层的每个值都会被复制并送往**所有**隐藏层节点。如原书 Fig. 26-6 和 Table 26-1 的程序所示，进入某个主动节点的每一路信号，都会先乘以一个预先存储在程序中的数字——**权重 (Weights)**，接着把所有加权结果相加（用符号 $\\Sigma$ 表示），汇总成一个单一数值。",
        "在离开节点之前，这个汇总值还必须经过一个名为 **Sigmoid** 的非线性数学函数。它是一条“S”形的平滑曲线，负责把从 $-\\infty$ 到 $+\\infty$ 的任意输入数值，温柔地压缩限制在 `0` 到 `1` 之间。",
        "为什么不用简单粗暴的“硬阈值”（大于 0 输出 1，小于 0 输出 0）？因为硬阈值在 0 点处发生突变、不可导；而 Sigmoid 虽然起着相同的“阈值开关”作用，却处处平滑可微。尽管前向推理时用不到它的导数，但在后续寻找最佳权重的训练算法中，导数是至关重要的核心工具。更妙的是，Sigmoid 的一阶导数可以直接用函数值自身算出来，极大简化了代数运算。"
      ],
      "formula": {
        "expr": "s(x) = 1 / (1 + e^(-x))    |    s'(x) = s(x) * [1 - s(x)]",
        "explain": "x 为节点内所有输入与权重的加权求和结果；s(x) 是输出在 (0, 1) 之间的平滑激活值；s'(x) 是它的斜率（一阶导数），当 x=0 时 s(0)=0.5，导数取得最大值 0.25。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：主动节点内部解剖——权重、偏置 (Bias) 与 Sigmoid 曲线",
      "instruction": "拖动输入 X1、权重 W1 与偏置 Bias 滑块，观察左侧节点内数值变化，以及右侧 Sigmoid 曲线如何左右平移（可切换导数与硬阈值对比）。",
      "controls": [
        {
          "type": "slider",
          "id": "x1",
          "label": "输入信号 X1",
          "min": -4,
          "max": 4,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "w1",
          "label": "连接权重 W1",
          "min": -3,
          "max": 3,
          "step": 0.1,
          "value": 1.5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "bias",
          "label": "偏置权重 (Bias)",
          "min": -5,
          "max": 5,
          "step": 0.1,
          "value": 0,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showDeriv",
          "label": "叠加一阶导数 s'(x)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "hardStep",
          "label": "对比硬阈值阶跃函数",
          "value": false
        }
      ],
      "jsCode": "var sig = function(v) { return 1 / (1 + Math.exp(-v)); };\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var x1 = lab.values.x1;\n  var w1 = lab.values.w1;\n  var bias = lab.values.bias;\n  var showDeriv = lab.values.showDeriv;\n  var hardStep = lab.values.hardStep;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var u = x1 * w1;\n  var z = u + bias;\n  var y = sig(z);\n  var dy = y * (1 - y);\n\n  // Left Panel: Active Node Diagram\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(10, 10, 285, 220);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('主动节点内部流向 (Fig. 26-6)', 20, 30);\n\n  // Connections\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(52, 82); ctx.lineTo(148, 122); ctx.stroke();\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.moveTo(52, 165); ctx.lineTo(148, 128); ctx.stroke();\n\n  ctx.strokeStyle = '#f8fafc';\n  ctx.beginPath(); ctx.moveTo(182, 125); ctx.lineTo(208, 125); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(256, 125); ctx.lineTo(286, 125); ctx.stroke();\n\n  // Input Node X1\n  ctx.fillStyle = '#0f172a';\n  ctx.strokeStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(38, 82, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('X1', 31, 86);\n  ctx.fillText(x1.toFixed(1), 26, 62);\n\n  // Weight W1 badge\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(68, 82, 58, 20);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.strokeRect(68, 82, 58, 20);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('x ' + w1.toFixed(1), 75, 96);\n\n  // Bias Node (constant 1)\n  ctx.fillStyle = '#0f172a';\n  ctx.strokeStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(38, 165, 15, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('1', 34, 169);\n  ctx.fillText('Bias', 23, 193);\n\n  // Bias Weight badge\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(68, 142, 58, 20);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.strokeRect(68, 142, 58, 20);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('x ' + bias.toFixed(1), 75, 156);\n\n  // Sum circle\n  ctx.fillStyle = '#0f172a';\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(165, 125, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 16px serif';\n  ctx.fillText('Σ', 159, 131);\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('z=' + z.toFixed(2), 143, 158);\n\n  // Sigmoid box\n  ctx.fillStyle = '#0f172a';\n  ctx.strokeStyle = '#10b981';\n  ctx.fillRect(208, 105, 48, 40);\n  ctx.strokeRect(208, 105, 48, 40);\n  ctx.beginPath();\n  for (var px = 0; px <= 36; px++) {\n    var sx = (px - 18) / 4;\n    var sy = sig(sx);\n    var gx = 214 + px;\n    var gy = 139 - sy * 28;\n    if (px === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('y=' + y.toFixed(3), 215, 96);\n\n  // Right Panel: Sigmoid & Derivative Plot\n  var px0 = 335, py0 = 25, pw = 360, ph = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gxIdx = -6; gxIdx <= 6; gxIdx += 2) {\n    var vx = px0 + ((gxIdx + 7) / 14) * pw;\n    ctx.beginPath(); ctx.moveTo(vx, py0); ctx.lineTo(vx, py0 + ph); ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.font = '10px monospace';\n    ctx.fillText(gxIdx.toString(), vx - 5, py0 + ph + 14);\n  }\n  for (var gyIdx = 0; gyIdx <= 4; gyIdx++) {\n    var valY = gyIdx * 0.25;\n    var vy = py0 + ph - valY * ph;\n    ctx.beginPath(); ctx.moveTo(px0, vy); ctx.lineTo(px0 + pw, vy); ctx.stroke();\n    ctx.fillStyle = '#64748b';\n    ctx.fillText(valY.toFixed(2), px0 - 30, vy + 3);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('净信号输入 u = X1·W1 (中心偏移至 u0 = -Bias)', px0 + 45, py0 + ph + 30);\n\n  // Center dashed line u = -bias\n  var centerU = -bias;\n  if (centerU >= -7 && centerU <= 7) {\n    var cx = px0 + ((centerU + 7) / 14) * pw;\n    ctx.save();\n    ctx.setLineDash([4, 4]);\n    ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n    ctx.beginPath(); ctx.moveTo(cx, py0); ctx.lineTo(cx, py0 + ph); ctx.stroke();\n    ctx.restore();\n  }\n\n  // Hard Step curve\n  if (hardStep) {\n    ctx.save();\n    ctx.setLineDash([5, 4]);\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i <= 180; i++) {\n      var uVal = -7 + (i / 180) * 14;\n      var hVal = (uVal + bias) >= 0 ? 1 : 0;\n      var sxPos = px0 + (i / 180) * pw;\n      var syPos = py0 + ph - hVal * ph;\n      if (i === 0) ctx.moveTo(sxPos, syPos); else ctx.lineTo(sxPos, syPos);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  // Derivative curve\n  if (showDeriv) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    for (var i = 0; i <= 180; i++) {\n      var uVal = -7 + (i / 180) * 14;\n      var sVal = sig(uVal + bias);\n      var dVal = sVal * (1 - sVal);\n      var sxPos = px0 + (i / 180) * pw;\n      var syPos = py0 + ph - dVal * ph;\n      if (i === 0) ctx.moveTo(sxPos, syPos); else ctx.lineTo(sxPos, syPos);\n    }\n    ctx.stroke();\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(\"s'(z) 导数(峰值0.25)\", px0 + 8, py0 + 14);\n  }\n\n  // Sigmoid curve\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (var i = 0; i <= 180; i++) {\n    var uVal = -7 + (i / 180) * 14;\n    var sVal = sig(uVal + bias);\n    var sxPos = px0 + (i / 180) * pw;\n    var syPos = py0 + ph - sVal * ph;\n    if (i === 0) ctx.moveTo(sxPos, syPos); else ctx.lineTo(sxPos, syPos);\n  }\n  ctx.stroke();\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('s(z) Sigmoid', px0 + pw - 85, py0 + 14);\n\n  // Operating point marker\n  var clampU = Math.max(-7, Math.min(7, u));\n  var opX = px0 + ((clampU + 7) / 14) * pw;\n  var opY = py0 + ph - y * ph;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(opX, opY, 6, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  if (showDeriv) {\n    var opDY = py0 + ph - dy * ph;\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath(); ctx.arc(opX, opDY, 4.5, 0, Math.PI * 2); ctx.fill();\n  }\n\n  lab.setReadout('净输入 u = X1×W1 = ' + u.toFixed(2) + ' | 偏置后总和 z = ' + z.toFixed(2) + ' | Sigmoid输出 y = ' + y.toFixed(4) + ' | 一阶导数 s\\'(z) = ' + dy.toFixed(4));\n});"
    },
    {
      "type": "concept",
      "heading": "三、偏置节点 (Bias Node) 与“无非线性坍塌”定理",
      "paragraphs": [
        "如果 Sigmoid 函数永远以 $x = 0$ 为中心，网络的灵活性就会大受限制。工程上的解法非常巧妙：在输入层额外增加一个永远输入常数 `1` 的节点，称为**偏置节点 (Bias Node)**。它和其他输入节点一样与隐藏层全连接，当常数 `1` 乘以对应权重后，就为每个 Sigmoid 提供了独立的直流偏置 (DC Offset)，相当于把 S 曲线自由地向左或向右平移。",
        "接下来是一个直击神经网络本质的灵魂拷问：**如果去掉 Sigmoid（或类似的非线性函数），只做加权求和，三层神经网络还能工作吗？** 答案是：不能！一旦拿掉非线性函数，三层网络就会在数学上**坍塌 (Collapse) 成只有两层**。",
        "原因在于线性运算的叠加依然是线性的：隐藏层的加权求和与输出层的加权求和可以直接合并成一次单一的矩阵/权重乘法。也就是说，无论你堆叠多少层没有激活函数的“深度”网络，在划分参数空间的能力上，永远等价于最简单的两层单步线性分类器（只能画一条直线）。",
        "正因为有了多层结构与非线性激活函数，神经网络才能以极简的通用代码（如 Table 26-1 仅用 30 行 BASIC 程序）解决千变万化的复杂问题。例如面对 1000 个采样点的声纳回波：传统 DSP 需要设计相关运算或频谱分析等显式算法；而神经网络只需把 1000 个采样点直接喂给输入层，通过选择不同的权重，同一套架构就能直接输出“潜艇/鲸鱼/海底山脉”、“金属/非金属”或“敌/友”等判定——**没有显式算法、没有人工规则，一切关系全由权重决定**。"
      ],
      "formula": {
        "expr": "X3[j] = s( Σ WO[j, i] · X2[i] ) ,   其中 X2[i] = s( Σ WH[i, k] · X1[k] )",
        "explain": "对应原书 Table 26-1 的核心双循环：WH 为隐藏层权重矩阵，WO 为输出层权重矩阵。若去掉内层 Sigmoid 函数 s(·)，X3 将直接退化为 X1 的单层线性加权组合。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：三层网络前向推理与“线性坍塌”实时对比",
      "instruction": "拖动输入特征 (X1, X2) 观察左侧三层网络各节点实时激活亮度，再点击切换“开启隐藏层 Sigmoid”开关，亲眼见证右侧二维决策边界如何瞬间坍塌成一条死板的直线！",
      "controls": [
        {
          "type": "slider",
          "id": "x1",
          "label": "输入特征 X1",
          "min": -2.5,
          "max": 2.5,
          "step": 0.1,
          "value": -0.4,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "x2",
          "label": "输入特征 X2",
          "min": -2.5,
          "max": 2.5,
          "step": 0.1,
          "value": 1,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "wScale",
          "label": "隐藏层权重增益",
          "min": 1,
          "max": 5,
          "step": 0.1,
          "value": 3,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "useSigmoid",
          "label": "开启隐藏层 Sigmoid (防线性坍塌)",
          "value": true
        }
      ],
      "jsCode": "var sig = function(v) { return 1 / (1 + Math.exp(-Math.max(-30, Math.min(30, v)))); };\nlab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var x1 = lab.values.x1;\n  var x2 = lab.values.x2;\n  var ws = lab.values.wScale;\n  var useSig = lab.values.useSigmoid;\n\n  ctx.clearRect(0, 0, W, H);\n\n  var evalNet = function(a, b) {\n    var z1 = ws * (1.0 * a + 0.5 * b + 0.8);\n    var z2 = ws * (1.0 * a + 0.5 * b - 0.8);\n    var z3 = ws * (-0.5 * a + 1.0 * b - 0.7);\n    var h1 = useSig ? sig(z1) : z1;\n    var h2 = useSig ? sig(z2) : z2;\n    var h3 = useSig ? sig(z3) : z3;\n    var zOut = 1.8 * h1 - 1.8 * h2 + 2.0 * h3 - 2.7;\n    var y = sig(useSig ? (5.0 * zOut) : zOut);\n    return { h: [h1, h2, h3], y: y, zOut: zOut };\n  };\n\n  var res = evalNet(x1, x2);\n\n  // Left side: 3-Layer Topology\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('三层前馈结构 (输入→隐藏→输出)', 18, 22);\n\n  var inPos = [{x: 65, y: 65, lbl: 'X1', val: x1}, {x: 65, y: 125, lbl: 'X2', val: x2}, {x: 65, y: 185, lbl: 'Bias=1', val: 1}];\n  var hidPos = [{x: 205, y: 58, lbl: 'H1'}, {x: 205, y: 125, lbl: 'H2'}, {x: 205, y: 192, lbl: 'H3'}];\n  var outPos = {x: 345, y: 125, lbl: '目标概率'};\n\n  var wh = [\n    [1.0, 0.5, 0.8],\n    [1.0, 0.5, -0.8],\n    [-0.5, 1.0, -0.7]\n  ];\n  var wo = [1.8, -1.8, 2.0];\n\n  // Draw Input -> Hidden lines\n  for (var i = 0; i < 3; i++) {\n    for (var j = 0; j < 3; j++) {\n      var w = wh[j][i];\n      ctx.strokeStyle = w >= 0 ? 'rgba(56,189,248,0.45)' : 'rgba(236,72,153,0.45)';\n      ctx.lineWidth = Math.max(1, Math.abs(w) * 2);\n      ctx.beginPath(); ctx.moveTo(inPos[i].x, inPos[i].y); ctx.lineTo(hidPos[j].x, hidPos[j].y); ctx.stroke();\n    }\n  }\n\n  // Draw Hidden -> Output lines\n  for (var j = 0; j < 3; j++) {\n    var w = wo[j];\n    ctx.strokeStyle = w >= 0 ? 'rgba(16,185,129,0.75)' : 'rgba(236,72,153,0.75)';\n    ctx.lineWidth = Math.abs(w) * 1.5;\n    ctx.beginPath(); ctx.moveTo(hidPos[j].x, hidPos[j].y); ctx.lineTo(outPos.x, outPos.y); ctx.stroke();\n  }\n\n  // Draw Input Nodes\n  for (var i = 0; i < 3; i++) {\n    var p = inPos[i];\n    ctx.fillStyle = '#0f172a';\n    ctx.strokeStyle = i === 2 ? '#f59e0b' : '#38bdf8';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.arc(p.x, p.y, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '10px monospace';\n    ctx.fillText(p.val.toFixed(1), p.x - 10, p.y + 4);\n    ctx.fillStyle = i === 2 ? '#f59e0b' : '#94a3b8';\n    ctx.fillText(p.lbl, p.x - 18, p.y - 19);\n  }\n\n  // Draw Hidden Nodes\n  for (var j = 0; j < 3; j++) {\n    var p = hidPos[j];\n    var act = useSig ? res.h[j] : Math.max(0, Math.min(1, 0.5 + res.h[j] * 0.1));\n    ctx.fillStyle = 'rgba(16,185,129,' + (0.15 + 0.75 * act).toFixed(2) + ')';\n    ctx.strokeStyle = useSig ? '#10b981' : '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.arc(p.x, p.y, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '10px monospace';\n    ctx.fillText(res.h[j].toFixed(2), p.x - 12, p.y + 4);\n    ctx.fillStyle = '#94a3b8';\n    ctx.fillText(p.lbl, p.x - 6, p.y - 20);\n  }\n\n  // Draw Output Node\n  ctx.fillStyle = res.y > 0.5 ? 'rgba(16,185,129,0.85)' : 'rgba(15,23,42,0.95)';\n  ctx.strokeStyle = res.y > 0.5 ? '#10b981' : '#f8fafc';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath(); ctx.arc(outPos.x, outPos.y, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText(res.y.toFixed(2), outPos.x - 13, outPos.y + 4);\n  ctx.fillStyle = res.y > 0.5 ? '#10b981' : '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(res.y > 0.5 ? '目标: YES' : '目标: NO', outPos.x - 24, outPos.y + 36);\n\n  // Right side: 2D Parameter Space Decision Map\n  var mx = 440, my = 26, mw = 240, mh = 188;\n  var cols = 48, rows = 38;\n  var cw = mw / cols, ch = mh / rows;\n\n  for (var r = 0; r < rows; r++) {\n    var py = 2.5 - ((r + 0.5) / rows) * 5.0;\n    for (var c = 0; c < cols; c++) {\n      var px = -2.5 + ((c + 0.5) / cols) * 5.0;\n      var v = evalNet(px, py).y;\n      if (v >= 0.5) {\n        ctx.fillStyle = 'rgba(16,185,129,' + (0.25 + (v - 0.5) * 1.4).toFixed(2) + ')';\n      } else {\n        ctx.fillStyle = 'rgba(56,189,248,' + ((0.5 - v) * 0.45).toFixed(2) + ')';\n      }\n      ctx.fillRect(mx + c * cw, my + r * ch, cw + 0.5, ch + 0.5);\n    }\n  }\n\n  // Map border & axes\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(mx, my, mw, mh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(mx + mw / 2, my); ctx.lineTo(mx + mw / 2, my + mh); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(mx, my + mh / 2); ctx.lineTo(mx + mw, my + mh / 2); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(useSig ? '非线性分割空间 (三层生效)' : '线性坍塌！退化为直线分割', mx + 25, my - 8);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px monospace';\n  ctx.fillText('X1 (-2.5 ~ +2.5)', mx + 72, my + mh + 14);\n\n  // Current sample point\n  var ptX = mx + ((x1 + 2.5) / 5.0) * mw;\n  var ptY = my + ((2.5 - x2) / 5.0) * mh;\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(ptX, ptY, 6, 0, Math.PI * 2); ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  lab.setReadout((useSig ? '[Sigmoid 开启] 完整三层非线性划分' : '[Sigmoid 关闭] 发生线性坍塌，等效于两层单直线分类器') + ' | 当前输入(' + x1.toFixed(1) + ', ' + x2.toFixed(1) + ') → 输出概率: ' + (res.y * 100).toFixed(1) + '%');\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "区分节点性质：输入层节点是“被动”的，仅负责分发数据；隐藏层与输出层才是“主动”的，执行加权求和 + Sigmoid 变换。",
        "隐藏层规模经验法则：经典三层网络输入节点通常在几百个以内，隐藏层节点数一般设为输入层大小的 10% 左右；单目标检测输出层只需 1 个节点。",
        "千万别漏掉 Bias 偏置节点：固定输入为 1 的偏置节点允许 Sigmoid 阈值曲线左右自由平移，否则所有超平面只能死死穿过原点。",
        "非线性是深度的灵魂：一旦隐藏层缺少 Sigmoid 等非线性激活函数，无论网络有多少层，在数学上都会坍塌成等价的“两层单直线分类器”。",
        "范式转换：传统 DSP 靠数学推导写规则（如相关、FFT），神经网络则用统一的极简拓扑，把全部智慧存储在权重矩阵 WH 和 WO 中。"
      ]
    }
  ]
});
