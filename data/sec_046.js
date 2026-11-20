window.__BOOK_REGISTER_SECTION__("sec_046", {
  "title": "浮点数与实数编码 (Floating Point / Real Numbers)",
  "intuition": "像科学计数法一样，把 32 个比特拆成符号、2 的指数和有效尾数，让小数点随数值大小动态‘浮动’，从而在有限位宽里同时装下原子级微小与天文级巨大的实数。",
  "blocks": [
    {
      "type": "concept",
      "heading": "从科学计数法到二进制浮点：为什么小数点需要“浮动”？",
      "paragraphs": [
        "定点数的编码规则虽然简单，但小数点位置被死死锁住，很难兼顾极大值和极小值。工程上遇到跨数量级的实数时，我们借鉴十进制的**科学计数法**：把一个数拆成**尾数 (mantissa)** 乘以基数的**指数 (exponent)** 次方，例如 `5.4321 × 10^6`。依靠指数缩放，科学计数法既能写下地球原子总数（`1.2 × 10^50`），也能写下乌龟每秒爬行距离与银河系直径之比（`2.6 × 10^-23`）。",
        "为了让表示唯一且不浪费有效数字，科学计数法必须经过**规范化 (normalized)**：通过调整指数，使小数点左侧**只保留一位非零数字**。计算机里的**浮点数 (Floating Point)** 原理完全相同，只不过把基数从十进制的 `10` 换成了二进制的 `2`。"
      ],
      "formula": {
        "expr": null,
        "explain": "核心思想：用“有效数字 × 2^指数”替代固定小数点，让分辨率随量级动态缩放。"
      }
    },
    {
      "type": "concept",
      "heading": "IEEE 754 单精度 32 位比特布局与转换公式",
      "paragraphs": [
        "工业界最通用的标准是 **ANSI/IEEE Std. 754-1985**，它定义了 32 位的**单精度 (single precision)** 和 64 位的**双精度 (double precision)** 格式。在单精度格式中，32 个比特被切分为三段：最高位 **bit 31 是符号位 `S`**；中间 **bits 23~30 共 8 位是指数位 `E`**；最低 **bits 0~22 共 23 位是尾数位 `M`**。",
        "注意指数位 `E` 的存储技巧：8 位无符号二进制能表示 `0` 到 `255` 的整数，为了能同时表示正指数和负指数，IEEE 754 采用了**偏置二进制 (offset binary)**，偏置量为 `127`。也就是说，实际指数为 `E - 127`，使指数缩放因子覆盖从 `2^-127` 到 `2^128` 的宽广范围。"
      ],
      "formula": {
        "expr": "v = (-1)^S × M × 2^(E - 127)",
        "explain": "v 为最终表示的实数；S 为符号位（0 代表正数，1 代表负数）；M 为由 23 位尾数构成的二进制小数；E 为 8 位指数无符号整数（0~255），减去偏置量 127 后得到真正的 2 的幂次。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：IEEE 754 单精度 32 位实时比特解剖台",
      "instruction": "拖动指数 E 和尾数高 6 位滑块（默认即原书例 2：S=1, E=129, 尾数 0.375 -> -5.5），观察 32 位比特分段颜色与特殊数值（±0、±∞、NaN、非规格化数）的触发条件。",
      "controls": [
        {
          "type": "toggle",
          "id": "sign",
          "label": "符号位 S (开启=1 负数 / 关闭=0 正数)",
          "value": true
        },
        {
          "type": "slider",
          "id": "exp",
          "label": "指数位 E (8位无符号)",
          "min": 0,
          "max": 255,
          "step": 1,
          "value": 129,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "mantissa",
          "label": "尾数高 6 位 (m22..m17)",
          "min": 0,
          "max": 63,
          "step": 1,
          "value": 24,
          "unit": ""
        }
      ],
      "jsCode": "lab.onUpdate(function () {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var S = lab.values.sign ? 1 : 0;\n  var E = Math.round(lab.values.exp);\n  var mTop = Math.round(lab.values.mantissa);\n\n  var bits = [];\n  bits.push(S);\n  for (var i = 7; i >= 0; i--) bits.push((E >> i) & 1);\n  for (var j = 5; j >= 0; j--) bits.push((mTop >> j) & 1);\n  for (var k = 0; k < 17; k++) bits.push(0);\n\n  var boxW = 20;\n  var boxH = 30;\n  var startX = 24;\n  var startY = 48;\n  var gapS = 8;\n  var gapE = 8;\n\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'middle';\n\n  for (var b = 0; b < 32; b++) {\n    var bitIdx = 31 - b;\n    var x = startX + b * boxW;\n    if (b >= 1) x += gapS;\n    if (b >= 9) x += gapE;\n\n    var color = '#10b981';\n    var fill = 'rgba(16,185,129,0.14)';\n    if (b === 0) {\n      color = '#ec4899';\n      fill = 'rgba(236,72,153,0.22)';\n    } else if (b <= 8) {\n      color = '#38bdf8';\n      fill = 'rgba(56,189,248,0.18)';\n    } else if (b >= 15) {\n      color = 'rgba(16,185,129,0.45)';\n      fill = 'rgba(16,185,129,0.05)';\n    }\n\n    ctx.fillStyle = fill;\n    ctx.fillRect(x, startY, boxW - 2, boxH);\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 1.2;\n    ctx.strokeRect(x, startY, boxW - 2, boxH);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText(String(bits[b]), x + (boxW - 2) / 2, startY + boxH / 2);\n\n    if (bitIdx === 31 || bitIdx === 30 || bitIdx === 23 || bitIdx === 22 || bitIdx === 17 || bitIdx === 0) {\n      ctx.fillStyle = 'rgba(248,250,252,0.55)';\n      ctx.font = '10px monospace';\n      ctx.fillText(String(bitIdx), x + (boxW - 2) / 2, startY - 10);\n    }\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('S(1位)', startX + 9, startY + boxH + 16);\n\n  ctx.fillStyle = '#38bdf8';\n  var expCenter = startX + 1 * boxW + gapS + (8 * boxW) / 2;\n  ctx.fillText('指数 E (8位: 0~255, 偏移127)', expCenter, startY + boxH + 16);\n\n  ctx.fillStyle = '#10b981';\n  var manCenter = startX + 9 * boxW + gapS + gapE + (23 * boxW) / 2;\n  ctx.fillText('尾数小数部分 (23位, 高6位可调)', manCenter, startY + boxH + 16);\n\n  var frac = mTop / 64;\n  var statusText = '';\n  var formulaLine = '';\n  var valueLine = '';\n  var badgeColor = '#10b981';\n\n  if (E === 255) {\n    if (mTop === 0) {\n      statusText = '特殊类别：无穷大 (±∞)';\n      formulaLine = 'E = 255 (全1), 尾数全0  =>  ' + (S ? '-∞' : '+∞');\n      valueLine = S ? '-Infinity' : '+Infinity';\n      badgeColor = '#f59e0b';\n    } else {\n      statusText = '特殊类别：NaN (Not a Number)';\n      formulaLine = 'E = 255 (全1), 尾数非0  =>  未定义错误数值';\n      valueLine = 'NaN';\n      badgeColor = '#ec4899';\n    }\n  } else if (E === 0) {\n    if (mTop === 0) {\n      statusText = '特殊类别：零 (±0)';\n      formulaLine = 'E = 0 (全0), 尾数全0  =>  ' + (S ? '-0.0' : '+0.0');\n      valueLine = S ? '-0' : '+0';\n      badgeColor = '#f59e0b';\n    } else {\n      statusText = '特殊类别：非规格化极小数 (Denormal)';\n      var denVal = (S ? -1 : 1) * frac * Math.pow(2, -126);\n      formulaLine = '去除隐含前导1: ' + (S ? '-1' : '+1') + ' × (0 + ' + frac.toFixed(6) + ') × 2^(-126)';\n      valueLine = denVal.toExponential(6);\n      badgeColor = '#f59e0b';\n    }\n  } else {\n    statusText = '标准规格化浮点数 (Normalized)';\n    var M = 1 + frac;\n    var p = E - 127;\n    var val = (S ? -1 : 1) * M * Math.pow(2, p);\n    formulaLine = 'v = ' + (S ? '-1' : '+1') + ' × (1 + ' + frac.toFixed(6) + ') × 2^(' + E + ' - 127) = ' + (S ? '-' : '+') + M.toFixed(6) + ' × 2^(' + p + ')';\n    if (Math.abs(val) >= 1e-4 && Math.abs(val) < 1e6) {\n      valueLine = val.toFixed(6);\n    } else {\n      valueLine = val.toExponential(6);\n    }\n  }\n\n  ctx.fillStyle = 'rgba(15,23,42,0.78)';\n  ctx.fillRect(24, 118, W - 48, 102);\n  ctx.strokeStyle = badgeColor;\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(24, 118, W - 48, 102);\n\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'alphabetic';\n  ctx.fillStyle = badgeColor;\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText(statusText, 40, 142);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '13px monospace';\n  ctx.fillText(formulaLine, 40, 169);\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 18px monospace';\n  ctx.fillText('解码结果 v = ' + valueLine, 40, 200);\n\n  lab.setReadout('S=' + S + ' | E=' + E + ' (幂次 ' + (E === 0 ? '-126*' : (E === 255 ? '保留' : (E - 127))) + ') | 尾数小数=' + frac.toFixed(4) + ' | v=' + valueLine);\n});"
    },
    {
      "type": "concept",
      "heading": "二进制尾数与“免费多赚 1 比特”的隐含前导 1",
      "paragraphs": [
        "二进制小数和十进制小数的权重要理完全一致：十进制 `2.783` 表示 `2 + 7/10 + 8/100 + 3/1000`，而二进制小数 `1.0101` 就表示 `1 + 0/2 + 1/4 + 0/8 + 1/16`。由于二进制在规范化时，小数点（称为二进制点）左边**必须有且只有一位非零数字**，而二进制世界里唯一的非零数字就是 **`1`**！",
        "这意味着规范化后，尾数的整数部分**永远是 1**，根本不需要浪费存储空间把它存进芯片里。把这 1 位冗余省下来，等于让 23 位存储空间平白无故**多获得了 1 位有效精度**（实际拥有 24 位尾数精度）。当 23 位尾数全为 `0` 时，`M = 1`；当它们全为 `1` 时，`M = 2 - 2^-23`，无限逼近但永远小于 `2`。"
      ],
      "formula": {
        "expr": "M = 1.m22 m21 m20 ... m0 = 1 + m22·2^-1 + m21·2^-2 + ... + m0·2^-23",
        "explain": "m22 到 m0 是实际存放在第 22~0 比特的尾数位，权重依次为 1/2、1/4、1/8……；最前面的“1.”是隐含的，不占存储比特。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：尾数二进制权重拼接与指数级区间缩放",
      "instruction": "拨动尾数位 m22~m19 观察分数如何拼接在“隐含前导 1”之后；再调节实际指数观察同一个 [1, 2) 刻度尺如何在实数轴上按 2 的幂次成倍拉伸或压缩。",
      "controls": [
        {
          "type": "toggle",
          "id": "m22",
          "label": "m22 (权重 1/2 = 0.5)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "m21",
          "label": "m21 (权重 1/4 = 0.25)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "m20",
          "label": "m20 (权重 1/8 = 0.125)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "m19",
          "label": "m19 (权重 1/16 = 0.0625)",
          "value": false
        },
        {
          "type": "slider",
          "id": "expBias",
          "label": "实际指数 (E - 127)",
          "min": -3,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "hideLeadingOne",
          "label": "去掉隐含前导 1 (模拟非规格化)",
          "value": false
        }
      ],
      "jsCode": "lab.onUpdate(function () {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var b22 = lab.values.m22 ? 1 : 0;\n  var b21 = lab.values.m21 ? 1 : 0;\n  var b20 = lab.values.m20 ? 1 : 0;\n  var b19 = lab.values.m19 ? 1 : 0;\n  var p = Math.round(lab.values.expBias);\n  var noOne = !!lab.values.hideLeadingOne;\n\n  var lead = noOne ? 0 : 1;\n  var frac = b22 * 0.5 + b21 * 0.25 + b20 * 0.125 + b19 * 0.0625;\n  var M = lead + frac;\n  var scale = Math.pow(2, p);\n  var val = M * scale;\n\n  var barX = 48;\n  var barY = 48;\n  var barW = 620;\n  var barH = 34;\n  var unitW = barW / 2;\n\n  ctx.textBaseline = 'alphabetic';\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('1) 尾数 M 的二进制权重拼接 (规范化时始终落在 [1, 2) 之间)', barX, 26);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.25)';\n  ctx.strokeRect(barX, barY, barW, barH);\n  ctx.fillStyle = 'rgba(248,250,252,0.6)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('0.0', barX, barY + barH + 14);\n  ctx.fillText('1.0', barX + unitW, barY + barH + 14);\n  ctx.fillText('2.0 (上限)', barX + barW, barY + barH + 14);\n\n  if (!noOne) {\n    ctx.fillStyle = 'rgba(245,158,11,0.32)';\n    ctx.fillRect(barX, barY, unitW, barH);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(barX, barY, unitW, barH);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('隐含前导 1 (免费白送的精度)', barX + unitW / 2, barY + barH / 2 + 4);\n  } else {\n    ctx.fillStyle = 'rgba(255,255,255,0.04)';\n    ctx.fillRect(barX, barY, unitW, barH);\n    ctx.fillStyle = 'rgba(248,250,252,0.4)';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('前导 1 已关闭 (退化为 0.xxxx)', barX + unitW / 2, barY + barH / 2 + 4);\n  }\n\n  var weights = [\n    { bit: b22, w: 0.5, label: '1/2' },\n    { bit: b21, w: 0.25, label: '1/4' },\n    { bit: b20, w: 0.125, label: '1/8' },\n    { bit: b19, w: 0.0625, label: '1/16' }\n  ];\n  var curX = barX + (noOne ? 0 : unitW);\n  for (var i = 0; i < weights.length; i++) {\n    var item = weights[i];\n    var segW = item.w * unitW;\n    if (item.bit === 1) {\n      ctx.fillStyle = 'rgba(16,185,129,0.42)';\n      ctx.fillRect(curX, barY, segW, barH);\n      ctx.strokeStyle = '#10b981';\n      ctx.lineWidth = 1.5;\n      ctx.strokeRect(curX, barY, segW, barH);\n      ctx.fillStyle = '#f8fafc';\n      ctx.font = 'bold 11px monospace';\n      if (segW >= 22) ctx.fillText(item.label, curX + segW / 2, barY + barH / 2 + 4);\n    } else {\n      ctx.fillStyle = 'rgba(255,255,255,0.03)';\n      ctx.fillRect(curX, barY, segW, barH);\n      ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n      ctx.lineWidth = 1;\n      ctx.strokeRect(curX, barY, segW, barH);\n      ctx.fillStyle = 'rgba(248,250,252,0.35)';\n      ctx.font = '10px monospace';\n      if (segW >= 22) ctx.fillText('0', curX + segW / 2, barY + barH / 2 + 4);\n    }\n    curX += segW;\n  }\n\n  var mPosX = barX + M * unitW;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(mPosX, barY - 6);\n  ctx.lineTo(mPosX, barY + barH + 6);\n  ctx.stroke();\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillText('M = ' + M.toFixed(4), Math.min(mPosX + 6, barX + barW - 88), barY - 8);\n\n  var lineY = 180;\n  var maxAxis = 16;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('2) 乘以 2^(' + p + ') = ' + scale + ' 后的实数轴定位 (当前区间 [' + (noOne ? 0 : scale) + ', ' + (2 * scale) + '))', barX, 134);\n\n  var intStart = noOne ? 0 : scale;\n  var intEnd = 2 * scale;\n  var xStart = barX + (intStart / maxAxis) * barW;\n  var xEnd = barX + (intEnd / maxAxis) * barW;\n  ctx.fillStyle = 'rgba(56,189,248,0.16)';\n  ctx.fillRect(xStart, lineY - 14, Math.max(2, xEnd - xStart), 28);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 1.2;\n  ctx.strokeRect(xStart, lineY - 14, Math.max(2, xEnd - xStart), 28);\n\n  ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(barX, lineY);\n  ctx.lineTo(barX + barW, lineY);\n  ctx.stroke();\n\n  var ticks = [0, 1, 2, 4, 8, 16];\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  for (var t = 0; t < ticks.length; t++) {\n    var tv = ticks[t];\n    var tx = barX + (tv / maxAxis) * barW;\n    ctx.strokeStyle = 'rgba(248,250,252,0.5)';\n    ctx.beginPath(); ctx.moveTo(tx, lineY - 6); ctx.lineTo(tx, lineY + 6); ctx.stroke();\n    ctx.fillStyle = 'rgba(248,250,252,0.7)';\n    ctx.fillText(String(tv), tx, lineY + 20);\n  }\n\n  for (var q = 0; q < 16; q++) {\n    var qVal = (lead + q / 16) * scale;\n    var qX = barX + (qVal / maxAxis) * barW;\n    ctx.strokeStyle = 'rgba(16,185,129,0.65)';\n    ctx.beginPath(); ctx.moveTo(qX, lineY - 8); ctx.lineTo(qX, lineY + 8); ctx.stroke();\n  }\n\n  var valX = barX + (val / maxAxis) * barW;\n  ctx.fillStyle = '#ec4899';\n  ctx.beginPath();\n  ctx.arc(valX, lineY, 6, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = '#f8fafc';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = 'bold 13px monospace';\n  ctx.textAlign = valX > barX + barW - 110 ? 'right' : 'left';\n  var labelOffset = valX > barX + barW - 110 ? -10 : 10;\n  ctx.fillText('v = ' + val.toFixed(4), valX + labelOffset, lineY - 20);\n\n  lab.setReadout('M = ' + lead + '.' + b22 + b21 + b20 + b19 + ' (' + M.toFixed(4) + ') × 2^(' + p + ') = ' + val.toFixed(4) + ' | 该区间相邻 1/16 步长 = ' + (scale / 16).toFixed(4));\n});"
    },
    {
      "type": "concept",
      "heading": "保留比特区（±0、±∞、非规格化数、NaN）与 64 位双精度",
      "paragraphs": [
        "如果把 8 位指数全用满，单精度理论范围是 `±(2 - 2^-23) × 2^128 ≈ ±6.8 × 10^38` 到 `±1.0 × 2^-127 ≈ ±5.9 × 10^-39`。但 IEEE 754 刻意把最两端的指数保留下来，将常规数值范围略微收缩到 `±3.4 × 10^38` 和 `±1.2 × 10^-38`，腾出的比特模式用于定义 3 个特殊类别和错误标记：",
        "1. **`±0`**：指数和尾数比特全为 `0`（因为隐含前导 `1` 会让规范化数永远无法表达真正的零）。\n2. **`±∞`**：指数比特全为 `1`（`E=255`），尾数比特全为 `0`。\n3. **非规格化数 (Unnormalized numbers)**：指数全为 `0` 但尾数非 `0`，范围覆盖 `±1.2 × 10^-38` 到 `±1.4 × 10^-45`。它们通过放弃“前导必须是 1”的限制，以降低精度为代价平滑填补接近零的空隙。\n4. **`NaN` (Not a Number)**：指数全为 `1` 且尾数非 `0` 的未分配编码，用于表示 `0/0` 或负数开方等非法运算结果。",
        "至于 64 位的**双精度 (double precision)**，只是简单地加宽了尾数和指数：bit 63 是符号位，bits 52~62 共 11 位是指数（范围 `0~2047`，偏置 `1023`，幂次从 `2^-1023` 到 `2^1024`），bits 0~51 共 52 位是尾数。它的合法范围高达 `±1.8 × 10^308` 到 `±2.2 × 10^-308`。在绝大多数数字信号处理应用中单精度已经完全够用，而双精度几乎永远不会成为你的性能或范围瓶颈。"
      ],
      "formula": {
        "expr": "Double (64-bit): 1 bit S + 11 bits E (offset 1023) + 52 bits M",
        "explain": "单精度范围 ±3.4×10^38 ~ ±1.2×10^-38（含非规格化可低至 ±1.4×10^-45）；双精度范围 ±1.8×10^308 ~ ±2.2×10^-308。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要用 `==` 直接判零或比较两个浮点数：由于 `E=0, M=0` 才代表 `±0`（甚至存在 `+0` 和 `-0` 两种比特模式），且中间运算存在舍入，应改用 `Math.abs(a - b) < eps` 判断接近程度。",
        "警惕 `NaN` 的“传染性”与 `Inf` 溢出：一旦算法中出现除零产生 `±∞` 或非法运算产生 `NaN`（`E=255`），后续所有滤波器累加和乘加都会瞬间全部变成 `NaN`。",
        "DSP 选型直觉：常规音频、传感器信号处理优先用 32 位单精度（`float`），内存减半且现代 DSP/SIMD 指令集吞吐翻倍；只有极高阶 IIR 滤波器极点对舍入极度敏感时，才需要升级到 64 位双精度（`double`）。"
      ]
    }
  ]
});
