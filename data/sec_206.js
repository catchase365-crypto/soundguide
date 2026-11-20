window.__BOOK_REGISTER_SECTION__("sec_206", {
  "title": "数字信号处理器市场与产业生态 (The Digital Signal Processor Market)",
  "intuition": "决定 DSP 芯片形态、价格与性能演进的，不只是硅片上的算法，更是消费电子百亿美元市场与批量成本博弈下的工程权衡。",
  "blocks": [
    {
      "type": "concept",
      "heading": "百亿美元级市场与消费电子的飞轮效应",
      "paragraphs": [
        "数字信号处理器（DSP）并非小众科研器材，而是一个庞大且高速扩张的半导体市场。根据原书图 28-14 的产业预测，在世纪之交（2000 年），全球 DSP 市场规模将达到 **每年 80 至 100 亿美元**，并且保持着 **每年 30%–40%** 的惊人复合增长率。",
        "驱动这股爆发性增长的核心引擎，并不是高精尖但出货量有限的科学仪器，而是大众对更优质、更廉价消费电子产品的无尽需求——典型代表包括 **蜂窝移动电话（Cellular Telephones）**、**多媒体计算机（Multimedia Computers）** 以及 **高保真音乐播放设备**。",
        "在商业规律下，这些高营收的大众应用塑造了整个 DSP 技术演进的方向（例如极致的功耗控制、片上集成度与压低单颗芯片成本），而科学仪器等利润空间较小的专业领域，则相当于“搭上技术浪潮的顺风车”（riding the wave of technology），直接享受消费级芯片规模化带来的红利。"
      ],
      "formula": {
        "expr": "M(t) = M_1995 × (1 + r)^(t - 1995)",
        "explain": "M(t) 表示第 t 年的全球 DSP 市场总规模（十亿美元），M_1995 为 1995 年的市场基数（约 18 亿美元），r 为年复合增长率（书中估算约 0.30 至 0.40）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：DSP 市场指数增长与“世纪之交”预测模拟器 (复现 Fig. 28-14)",
      "instruction": "拖动年复合增长率与基数滑块，观察 1995–2002 年 DSP 市场规模的指数级扩张，并与原书 Fig. 28-14 的基准曲线对比。",
      "controls": [
        {
          "type": "slider",
          "id": "growth",
          "label": "年复合增长率",
          "min": 15,
          "max": 50,
          "step": 1,
          "value": 37,
          "unit": " %"
        },
        {
          "type": "slider",
          "id": "base1995",
          "label": "1995年基数",
          "min": 1,
          "max": 3,
          "step": 0.1,
          "value": 1.8,
          "unit": " B$"
        },
        {
          "type": "toggle",
          "id": "showBook",
          "label": "叠加原书 Fig. 28-14 估算趋势",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  var r = lab.values.growth / 100;\n  var base = lab.values.base1995;\n  var showBook = lab.values.showBook;\n\n  var years = [1995, 1996, 1997, 1998, 1999, 2000, 2001, 2002];\n  var bookRef = [1.8, 2.4, 3.5, 4.7, 6.5, 9.0, 12.2, 16.5];\n  var vals = [];\n  for (var i = 0; i < years.length; i++) {\n    vals.push(base * Math.pow(1 + r, i));\n  }\n\n  var maxVal = Math.max(20, Math.ceil(vals[7] / 5) * 5);\n  var padL = 56, padR = 26, padT = 30, padB = 34;\n  var plotW = w - padL - padR;\n  var plotH = h - padT - padB;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n\n  var ticks = 4;\n  for (var t = 0; t <= ticks; t++) {\n    var yVal = (maxVal / ticks) * t;\n    var yPos = padT + plotH - (yVal / maxVal) * plotH;\n    ctx.beginPath();\n    ctx.moveTo(padL, yPos);\n    ctx.lineTo(w - padR, yPos);\n    ctx.stroke();\n    ctx.fillText(yVal.toFixed(0) + 'B', padL - 8, yPos);\n  }\n\n  var bandW = plotW / years.length;\n  var barW = bandW * 0.56;\n\n  for (var i = 0; i < years.length; i++) {\n    var cx = padL + i * bandW + bandW / 2;\n    var barH = (vals[i] / maxVal) * plotH;\n    var x = cx - barW / 2;\n    var y = padT + plotH - barH;\n\n    var is2000 = years[i] === 2000;\n    if (is2000) {\n      ctx.fillStyle = (vals[i] >= 8 && vals[i] <= 10) ? '#10b981' : '#ec4899';\n    } else {\n      ctx.fillStyle = '#38bdf8';\n    }\n    ctx.fillRect(x, y, barW, barH);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'bottom';\n    ctx.fillText(vals[i].toFixed(1), cx, y - 4);\n\n    ctx.fillStyle = is2000 ? '#10b981' : '#cbd5e1';\n    ctx.textBaseline = 'top';\n    ctx.fillText(String(years[i]), cx, padT + plotH + 8);\n  }\n\n  if (showBook) {\n    ctx.save();\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 2;\n    ctx.setLineDash([5, 4]);\n    ctx.beginPath();\n    for (var i = 0; i < years.length; i++) {\n      var cx = padL + i * bandW + bandW / 2;\n      var py = padT + plotH - (bookRef[i] / maxVal) * plotH;\n      if (i === 0) ctx.moveTo(cx, py);\n      else ctx.lineTo(cx, py);\n    }\n    ctx.stroke();\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    for (var i = 0; i < years.length; i++) {\n      var cx = padL + i * bandW + bandW / 2;\n      var py = padT + plotH - (bookRef[i] / maxVal) * plotH;\n      ctx.beginPath();\n      ctx.arc(cx, py, 3.5, 0, Math.PI * 2);\n      ctx.fill();\n    }\n    ctx.restore();\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'middle';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillRect(padL, 10, 10, 10);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('模型预测 (2000年高亮)', padL + 16, 15);\n  if (showBook) {\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillRect(padL + 170, 13, 14, 3);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText('原书 Fig.28-14 基准趋势', padL + 190, 15);\n  }\n\n  var inRange = (vals[5] >= 8 && vals[5] <= 10) ? ' [符合原书 8-10B 区间]' : ' [偏离原书 8-10B 区间]';\n  lab.setReadout('2000年市场预测: $' + vals[5].toFixed(1) + 'B' + inRange + ' | 2002年市场预测: $' + vals[7].toFixed(1) + 'B');\n});"
    },
    {
      "type": "concept",
      "heading": "DSP 的三种采购形态：内核、芯片与板卡",
      "paragraphs": [
        "在工程采购中，DSP 并非只有“买一颗芯片”这一种形式，而是可以按集成深度与定制自由度分为三种形态：**内核（Core）**、**完整处理器（Processor）** 和 **板级产品（Board-level Product）**。",
        "1. **购买处理器芯片（Processor，最常见形式）**：在 DSP 术语中，**内核（Core）** 指负责执行核心运算的模块，包括数据寄存器、乘法器、算术逻辑单元（ALU）、地址发生器和程序定序器；将内核与片上存储器（Memory）及外部接口（Interfaces）组合并制造在同一块硅片上，就构成了完整的 **处理器芯片**。例如制造蜂窝电话时，工程师通常会直接采购如 **SHARC ADSP-21060**（240 引脚 Metric PQFP 封装，尺寸仅 `35×35×4 mm`）这样的独立集成电路，将其焊接到自研的印制电路板（PCB）上使用。",
        "2. **购买内核授权（Core，高度定制 ASIC）**：如果你所在的公司拥有自己的半导体芯片制造产线，你可能不需要成品处理器，而是向原厂购买 **内核设计授权**。签订授权协议后，公司可以根据特定产品需求，自由裁剪片上内存容量、定制数据收发接口与封装形式，流片生产高度专用化的定制芯片。这种模式正成为 DSP 市场中越来越重要的一环。",
        "3. **购买板级产品（Board-level，快速原型与小批量）**：市面上有数十家被称为 **第三方开发者（Third Party Developers）** 的公司，专门出售已经把 DSP 焊接在电路板上的成品模块。这些板卡通常自带扩展内存、A/D 与 D/A 转换器、EPROM 插座甚至多颗并联处理器，既可作为独立计算机运行，也常通过总线插进个人电脑（PC）主机中工作。寻找这类第三方开发商最直接的方法，就是去对应 DSP 芯片原厂的官网查询合作列表，或直接发电子邮件询问原厂。"
      ],
      "formula": {
        "expr": "Cost_total(N) = NRE + N × Cost_unit",
        "explain": "Cost_total 为总硬件成本；NRE 为一次性前期投入（包括第三方驱动适配、PCB 制版费，或高昂的内核授权与芯片流片掩膜费）；N 为产品量产台数；Cost_unit 为单套硬件的边际物料成本。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：三种 DSP 采购形态的量产成本与盈亏平衡沙盘",
      "instruction": "拖动量产规模对数滑块（从 10 台科研样机到 100 万台消费电子），观察板卡、处理器芯片与内核授权三者的单台摊销成本如何发生交叉反转。",
      "controls": [
        {
          "type": "slider",
          "id": "logVol",
          "label": "量产规模 log10(台数)",
          "min": 1,
          "max": 6,
          "step": 0.1,
          "value": 4.3,
          "unit": " 次方"
        },
        {
          "type": "slider",
          "id": "coreNre",
          "label": "Core 授权+流片 NRE",
          "min": 200,
          "max": 1000,
          "step": 50,
          "value": 500,
          "unit": " k$"
        },
        {
          "type": "slider",
          "id": "boardPrice",
          "label": "第三方板卡单价",
          "min": 200,
          "max": 800,
          "step": 20,
          "value": 400,
          "unit": " $"
        },
        {
          "type": "toggle",
          "id": "perUnit",
          "label": "纵轴显示单台摊销成本 (关闭则显示总成本)",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  var logVol = lab.values.logVol;\n  var curN = Math.round(Math.pow(10, logVol));\n  var coreNre = lab.values.coreNre * 1000;\n  var boardUnit = lab.values.boardPrice;\n  var perUnit = lab.values.perUnit;\n\n  var plans = [\n    { name: '板级产品 (Board)', nre: 1000, unit: boardUnit, color: '#ec4899' },\n    { name: '处理器芯片 (Processor)', nre: 25000, unit: 25, color: '#38bdf8' },\n    { name: '内核授权 (Core ASIC)', nre: coreNre, unit: 5, color: '#10b981' }\n  ];\n\n  var padL = 62, padR = 24, padT = 30, padB = 34;\n  var plotW = w - padL - padR;\n  var plotH = h - padT - padB;\n\n  var minLogX = 1, maxLogX = 6;\n  var minLogY = perUnit ? 0 : 3;\n  var maxLogY = perUnit ? 5 : 7;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  ctx.font = '11px monospace';\n  ctx.fillStyle = '#94a3b8';\n\n  ctx.textAlign = 'right';\n  ctx.textBaseline = 'middle';\n  for (var ly = minLogY; ly <= maxLogY; ly++) {\n    var py = padT + plotH - ((ly - minLogY) / (maxLogY - minLogY)) * plotH;\n    ctx.beginPath();\n    ctx.moveTo(padL, py);\n    ctx.lineTo(w - padR, py);\n    ctx.stroke();\n    var lbl = Math.pow(10, ly) >= 1000 ? ('$' + (Math.pow(10, ly) / 1000) + 'k') : ('$' + Math.pow(10, ly));\n    if (ly >= 6) lbl = '$' + (Math.pow(10, ly) / 1000000) + 'M';\n    ctx.fillText(lbl, padL - 8, py);\n  }\n\n  ctx.textAlign = 'center';\n  ctx.textBaseline = 'top';\n  for (var lx = minLogX; lx <= maxLogX; lx++) {\n    var px = padL + ((lx - minLogX) / (maxLogX - minLogX)) * plotW;\n    ctx.beginPath();\n    ctx.moveTo(px, padT);\n    ctx.lineTo(px, padT + plotH);\n    ctx.stroke();\n    var xTxt = lx >= 4 ? (Math.pow(10, lx - 4) + '万') : String(Math.pow(10, lx));\n    ctx.fillText(xTxt, px, padT + plotH + 8);\n  }\n\n  function calcCost(p, n) {\n    var tot = p.nre + n * p.unit;\n    return perUnit ? (tot / n) : tot;\n  }\n\n  for (var k = 0; k < plans.length; k++) {\n    var p = plans[k];\n    ctx.strokeStyle = p.color;\n    ctx.lineWidth = 2.4;\n    ctx.beginPath();\n    var steps = 60;\n    for (var s = 0; s <= steps; s++) {\n      var lx = minLogX + (s / steps) * (maxLogX - minLogX);\n      var n = Math.pow(10, lx);\n      var val = calcCost(p, n);\n      var ly = Math.log(val) / Math.LN10;\n      var px = padL + ((lx - minLogX) / (maxLogX - minLogX)) * plotW;\n      var py = padT + plotH - ((ly - minLogY) / (maxLogY - minLogY)) * plotH;\n      py = Math.max(padT, Math.min(padT + plotH, py));\n      if (s === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n  }\n\n  var curX = padL + ((logVol - minLogX) / (maxLogX - minLogX)) * plotW;\n  ctx.save();\n  ctx.strokeStyle = 'rgba(248, 250, 252, 0.55)';\n  ctx.setLineDash([4, 4]);\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(curX, padT);\n  ctx.lineTo(curX, padT + plotH);\n  ctx.stroke();\n  ctx.restore();\n\n  var bestPlan = plans[0];\n  var bestVal = Infinity;\n  var summaryParts = [];\n  for (var k = 0; k < plans.length; k++) {\n    var p = plans[k];\n    var val = calcCost(p, curN);\n    var unitVal = (p.nre + curN * p.unit) / curN;\n    if (unitVal < bestVal) {\n      bestVal = unitVal;\n      bestPlan = p;\n    }\n    var ly = Math.log(val) / Math.LN10;\n    var py = padT + plotH - ((ly - minLogY) / (maxLogY - minLogY)) * plotH;\n    py = Math.max(padT, Math.min(padT + plotH, py));\n    ctx.fillStyle = p.color;\n    ctx.beginPath();\n    ctx.arc(curX, py, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    summaryParts.push(p.name.split(' ')[0] + ': $' + unitVal.toFixed(0) + '/台');\n  }\n\n  ctx.font = '12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'middle';\n  for (var k = 0; k < plans.length; k++) {\n    var lxPos = padL + k * 195;\n    ctx.fillStyle = plans[k].color;\n    ctx.fillRect(lxPos, 10, 12, 10);\n    ctx.fillStyle = '#f8fafc';\n    ctx.fillText(plans[k].name, lxPos + 18, 15);\n  }\n\n  lab.setReadout('产量 ' + curN.toLocaleString() + ' 台 | ' + summaryParts.join(' | ') + ' → 经济最优: ' + bestPlan.name);\n});"
    },
    {
      "type": "concept",
      "heading": "四大厂商格局、命名密码与“去边界化”的未来",
      "paragraphs": [
        "在 1998 年成书时，全球 DSP 市场主要由四家半导体巨头主导，它们各自有一套代表数据位宽与定点/浮点架构的产品编号规则：",
        "1. **Analog Devices** (`www.analog.com/dsp`)：`ADSP-21xx` 为 16 位定点；`ADSP-21xxx` 为 32 位浮点与定点。\n2. **Lucent Technologies（朗讯科技）** (`www.lucent.com`)：`DSP16xxx` 为 16 位定点；`DSP32xx` 为 32 位浮点。\n3. **Motorola（摩托罗拉）** (`www.mot.com`)：`DSP561xx` 为 16 位定点；`DSP560xx` 为 24 位定点；`DSP96002` 为 32 位浮点。\n4. **Texas Instruments（德州仪器）** (`www.ti.com`)：`TMS320Cxx` 家族涵盖 16 位定点与 32 位浮点系列。",
        "值得注意的是，**DSP 与传统通用微处理器之间的界线正在变得越来越模糊**。例如英特尔（Intel）在描述 Pentium 处理器的 **MMX 技术** 时写道：“Intel 工程师新增了 57 条专门用于高效处理视频、音频与图形数据的强大指令；这些指令面向多媒体运算中常见的 **高度并行、重复性的序列（highly parallel, repetitive sequences）**。”随着互联网与多媒体应用爆发，未来会有越来越多 DSP 特性融入传统微处理器与微控制器中；作者甚至预言，二十年之后，“数字信号处理器”本身就可能成为“传统微处理器”的新常态。",
        "最后，如何在这个日新月异的领域保持信息敏锐？书中给出了非常务实的工程建议：坚持阅读免费发行的行业贸易期刊，如 **EDN**（Electronic Design News, `www.ednmag.com`）与 **ECN**（Electronic Component News, `www.ecnmag.com`）；加入多家 DSP 厂商的邮件列表以获取新品公告、报价、免费软件及低成本评估板优惠；关注周期性技术通讯（如 Analog Devices 每季度出版一次的 **Analog Dialogue**），并善用官网与电子邮件直接向原厂索取技术资料。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "实验 3：标量微处理器 vs DSP/MMX 并行媒体指令流水线动画",
      "instruction": "调节 DSP/MMX 单指令并行路数（模拟 57 条多媒体并行指令的吞吐优势），实时对比处理同一段音视频采样序列所需的时钟周期数。",
      "controls": [
        {
          "type": "slider",
          "id": "simdWidth",
          "label": "DSP/MMX 并行路数",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 4,
          "unit": " 路"
        },
        {
          "type": "slider",
          "id": "dataLen",
          "label": "音视频采样序列长度",
          "min": 8,
          "max": 32,
          "step": 4,
          "value": 16,
          "unit": " 样本"
        },
        {
          "type": "toggle",
          "id": "paused",
          "label": "暂停动画",
          "value": false
        }
      ],
      "jsCode": "var simTime = 0;\n\nfunction renderPipeline() {\n  var ctx = lab.ctx;\n  var w = lab.width;\n  var h = lab.height;\n  ctx.clearRect(0, 0, w, h);\n\n  var simd = lab.values.simdWidth;\n  var total = lab.values.dataLen;\n  var parCycles = Math.ceil(total / simd);\n  var loopPeriod = total + 5;\n  var curCycle = Math.floor(simTime * 3.5) % loopPeriod;\n\n  var scalarDone = Math.min(total, curCycle);\n  var parDone = Math.min(total, curCycle * simd);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 40; gx < w; gx += 40) {\n    ctx.beginPath();\n    ctx.moveTo(gx, 0);\n    ctx.lineTo(gx, h);\n    ctx.stroke();\n  }\n\n  var padL = 24, padR = 24;\n  var boxAreaW = w - padL - padR;\n  var gap = 4;\n  var cellW = (boxAreaW - gap * (total - 1)) / total;\n  var cellH = 34;\n\n  function drawRow(title, yTop, doneCount, activeWidth, accentColor, isDoneAll) {\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'left';\n    ctx.textBaseline = 'bottom';\n    ctx.fillText(title, padL, yTop - 8);\n\n    ctx.font = '12px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillStyle = isDoneAll ? '#10b981' : accentColor;\n    var statusTxt = isDoneAll ? ('已完成 (' + total + '/' + total + ')') : ('处理中: ' + doneCount + '/' + total);\n    ctx.fillText(statusTxt, w - padR, yTop - 8);\n\n    for (var i = 0; i < total; i++) {\n      var x = padL + i * (cellW + gap);\n      var isDone = i < doneCount;\n      var isActive = !isDoneAll && i >= doneCount && i < doneCount + activeWidth;\n      if (isDone) {\n        ctx.fillStyle = '#10b981';\n      } else if (isActive) {\n        ctx.fillStyle = '#f59e0b';\n      } else {\n        ctx.fillStyle = 'rgba(255,255,255,0.1)';\n      }\n      ctx.fillRect(x, yTop, cellW, cellH);\n      if (cellW >= 16) {\n        ctx.fillStyle = (isDone || isActive) ? '#0f172a' : '#94a3b8';\n        ctx.font = '10px monospace';\n        ctx.textAlign = 'center';\n        ctx.textBaseline = 'middle';\n        ctx.fillText(String(i + 1), x + cellW / 2, yTop + cellH / 2);\n      }\n    }\n  }\n\n  drawRow('传统标量微处理器 (每次 1 个样本)', 46, scalarDone, 1, '#ec4899', scalarDone >= total);\n  drawRow('DSP / MMX 并行指令引擎 (单周期 ' + simd + ' 路并行)', 136, parDone, simd, '#38bdf8', parDone >= total);\n\n  var barY = 200;\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(padL, barY, boxAreaW, 24);\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.textAlign = 'left';\n  ctx.textBaseline = 'middle';\n  var speedup = (total / parCycles).toFixed(2);\n  ctx.fillText('当前周期: ' + curCycle + '  |  标量总耗时: ' + total + ' 周期  |  并行总耗时: ' + parCycles + ' 周期  |  理论加速比: ' + speedup + 'x', padL + 10, barY + 12);\n\n  lab.setReadout('序列长度 ' + total + ' 样本 | 标量耗时 ' + total + ' 周期 vs ' + simd + '路并行耗时 ' + parCycles + ' 周期 (加速 ' + speedup + 'x)');\n}\n\nlab.onUpdate(function() {\n  renderPipeline();\n});\n\nlab.onLoop(function(dt) {\n  if (!lab.values.paused) {\n    simTime += dt;\n    renderPipeline();\n  }\n});"
    },
    {
      "type": "summary",
      "heading": "工程选型与行业观察避坑速记",
      "items": [
        "借势消费级芯片红利：科学仪器或小众工业项目通常不必从零定制专用芯片，直接选用因手机/多媒体市场大规模量产而降价的成熟 DSP，性价比最高。",
        "按产量选采购形态：科研原型或极小批量优先向“第三方开发者”购买板级产品（省去高速 PCB 与模拟前端设计风险）；中大批量消费产品购买标准处理器芯片；百万级以上且功耗/体积受限的巨头产品才考虑购买 Core 内核授权做定制 ASIC。",
        "快速识别四大家族位宽代号：看到 `ADSP-21xx`、`DSP16xxx`、`DSP561xx` 多为 16 位定点；`DSP560xx` 是独特的 24 位定点（常用于高保真音频）；`ADSP-21xxx`、`DSP32xx`、`DSP96002` 与浮点版 `TMS320Cxx` 面向 32 位浮点高精度场景。",
        "紧跟架构融合与一手资料：通用 CPU 不断吸收 DSP 的并行 MAC 与 SIMD 指令（如 MMX），选型时应评估现有微控制器扩展指令是否已够用；同时多利用 EDN/ECN 期刊与原厂邮件列表获取免费开发工具与低价评估套件。"
      ]
    }
  ]
});
