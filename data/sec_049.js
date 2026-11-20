window.__BOOK_REGISTER_SECTION__("sec_049", {
  "title": "执行速度：硬件架构与系统瓶颈 (Execution Speed: Hardware)",
  "intuition": "计算机的真实算力并不只取决于 CPU 主频有多高，而是受限于各子系统自身速度、子系统间的数据搬运带宽、缓存命中率、数学协处理器以及向后兼容总线等硬件木桶效应。",
  "blocks": [
    {
      "type": "concept",
      "heading": "算力狂飙与决定系统速度的两大核心因素",
      "paragraphs": [
        "计算机硬件的演进速度令人惊叹。1981 年推出的初代 IBM PC 采用 8088 微处理器，主频仅为 **4.77 MHz**、数据总线宽度为 **8 位**；此后每隔 3 到 4 年便迎来一次换代（`8088 → 80286 → 80386 → 80486 → 80586/Pentium`），每一代都将算力提升约 **5 倍**。到 1996 年，主频已达到 **200 MHz**、数据总线扩展至 **32 位**，在短短 15 年间实现了接近 **1000 倍** 的算力飞跃（原始计算速度大约每两年翻一番以上）。",
        "然而，当我们从底层架构去剖析 **执行速度 (Execution Speed)** 时（如图 4-5 所示），整个计算机由多个子系统协同构成。完成一项计算任务所需的时间主要取决于两个基本因素：**第一，各个独立子系统自身的运行速度；第二，数据在这些子系统之间传输搬运的速率。**"
      ],
      "formula": {
        "expr": "T_task = T_subsystem + T_transfer",
        "explain": "任务总执行时间等于各硬件子系统（如 CPU、协处理器、内存）的计算处理时间与它们之间来回传输数据所耗费的时间之和；任一环节过慢都会成为整机性能瓶颈。"
      }
    },
    {
      "type": "concept",
      "heading": "CPU、数学协处理器与浮点运算的十倍鸿沟",
      "paragraphs": [
        "**中央处理器 (CPU)** 是系统的心脏，内部通常包含十几个 32 位寄存器以及用于位移动和 **定点整数运算 (Fixed-point Arithmetic)** 的基础数字电路。但涉及复杂的浮点数学计算时，CPU 需要将数据送往专门的硬件电路——**数学协处理器 (Math Coprocessor，又称算术逻辑单元 ALU)**。",
        "例如执行两个 32 位浮点数的加法时，CPU 必须先向协处理器传输 **8 字节**（两个操作数各 4 字节）以及数个控制字节来指明运算类型；经过短暂计算后，协处理器再将 **4 字节** 的求和结果传回 CPU。协处理器既可以集成在 CPU 内部（如 `80486DX`），也可以作为独立芯片存在，而低端机型甚至没有配备协处理器（如 `80486SX`）。",
        "在没有数学协处理器的系统上，编译器只能用软件将复杂的数学函数拆解为 CPU 可直接执行的大量基础二进制操作。虽然结果相同，但执行速度会暴跌 **10 到 20 倍**！文字处理软件（主要是内存搬运）或纯整数运算几乎不受协处理器影响；但对于依赖大量浮点运算的 **DSP 算法** 而言，有无协处理器会导致整整一个数量级以上的性能落差。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "存储墙、缓存 (Cache) 机制与向后兼容的总线诅咒",
      "paragraphs": [
        "理想情况下，我们希望 **主存 (Main Memory)** 既极其庞大又极度高速，但高昂的成本使两者不可兼得，CPU 与独立主存芯片之间的数据读写因此成为最常见的速度瓶颈。工程上的破局之道是引入 **内存缓存 (Memory Cache)**——在 CPU 与主存之间放置一小块极高速的缓冲存储器（通常几百 KB）。当 CPU 请求某个地址的数据时，高速电路会将该地址周边的一整块区域一并拷贝进缓存；由于程序倾向于访问相邻地址的数据（空间局部性原理），CPU 后续大概率能直接从缓存中极速取数，从而将整体性能提升数倍。",
        "数据传输速率还取决于并行数据线数量及信号频率：**同一芯片内部** 的传输最快，**芯片之间** 次之，而需要穿过电气接插件到达另一块电路板（即 **总线结构 Bus**）的路径最慢——这也是芯片厂商拼命把更多模块塞进 CPU 内部的原因。",
        "更隐蔽的硬件杀手是 **向后兼容 (Backward Compatibility)**。厂商为了占领最大市场，必须让新设备兼容老旧系统。例如，在一台 200 MHz 的奔腾电脑上插一块基于 **ISA 总线**（兼容 80 年代初的早期标准）的 I/O 数据采集卡，即便你用纯汇编语言编写采集程序，实测最大传输速率也只有约 **100,000 字节/秒**——比微处理器时钟频率整整慢了一千倍以上！"
      ],
      "formula": {
        "expr": "T_mem_eff = h * T_cache + (1 - h) * T_main",
        "explain": "有效内存访问时间取决于缓存命中率 h：命中时只需极短的缓存访问时间 T_cache；一旦未命中 (1-h)，就必须承受漫长的主存等待时间 T_main。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验一：硬件瓶颈与 Table 4-6 真实运算耗时仿真",
      "instruction": "切换处理器型号（对应原书 Table 4-6 实测数据）、调节缓存命中率，或开关数学协处理器与 ISA 总线，观察数据流动态与各类浮点运算耗时的剧变。",
      "controls": [
        {
          "type": "slider",
          "id": "arch",
          "label": "处理器型号 (0=286, 1=486, 2=Pentium, 3=TMS320C40)",
          "min": 0,
          "max": 3,
          "step": 1,
          "value": 2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "cacheHit",
          "label": "内存缓存命中率",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 85,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "coproc",
          "label": "启用数学协处理器 / 硬件浮点",
          "value": true
        },
        {
          "type": "toggle",
          "id": "isaBus",
          "label": "经由 ISA 总线外设传输 (8字节)",
          "value": false
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar names = ['80286 (12MHz)', '80486 (33MHz)', 'Pentium (100MHz)', 'TMS320C40 DSP (40MHz)'];\nvar baseTimes = [\n  [33, 35, 49, 262],\n  [2.5, 2.5, 4.5, 30],\n  [0.50, 0.50, 0.87, 6.6],\n  [0.10, 0.10, 0.80, 1.1]\n];\nvar opLabels = ['A = B + C', 'A = B * C', 'A = B / C', 'A = SIN(B)'];\nvar opColors = ['#10b981', '#38bdf8', '#f59e0b', '#ec4899'];\nvar phase = 0;\n\nfunction computeStats() {\n  var v = lab.values;\n  var idx = Math.round(v.arch);\n  var hit = v.cacheHit / 100;\n  var hasCoproc = v.coproc || idx === 3;\n  var coprocPenalty = hasCoproc ? 1 : 15;\n  var memPenalty = 1 + (1 - hit) * 3.0;\n  var isaWait = v.isaBus ? 80.0 : 0;\n  var times = baseTimes[idx].map(function(t) {\n    return t * coprocPenalty * memPenalty;\n  });\n  return { idx: idx, hit: hit, hasCoproc: hasCoproc, coprocPenalty: coprocPenalty, memPenalty: memPenalty, isaWait: isaWait, times: times };\n}\n\nfunction drawBox(x, y, w, h, title, sub, color, active) {\n  ctx.fillStyle = active ? 'rgba(15, 23, 42, 0.9)' : 'rgba(15, 23, 42, 0.5)';\n  ctx.strokeStyle = color;\n  ctx.lineWidth = active ? 2 : 1;\n  ctx.beginPath();\n  ctx.roundRect ? ctx.roundRect(x, y, w, h, 6) : ctx.rect(x, y, w, h);\n  ctx.fill();\n  ctx.stroke();\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, x + w / 2, y + 17);\n  ctx.fillStyle = color;\n  ctx.font = '10px monospace';\n  ctx.fillText(sub, x + w / 2, y + 32);\n}\n\nfunction drawPacket(x1, y1, x2, y2, t, color) {\n  var px = x1 + (x2 - x1) * t;\n  var py = y1 + (y2 - y1) * t;\n  ctx.fillStyle = color;\n  ctx.beginPath();\n  ctx.arc(px, py, 3.5, 0, Math.PI * 2);\n  ctx.fill();\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  var st = computeStats();\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 360; gx <= 700; gx += 68) {\n    ctx.beginPath(); ctx.moveTo(gx, 36); ctx.lineTo(gx, 205); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('系统子系统数据流 (' + names[st.idx] + ')', 16, 22);\n  ctx.fillText('浮点运算耗时对比 (微秒 us, 对数刻度)', 360, 22);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(118, 60); ctx.lineTo(155, 60); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(210, 82); ctx.lineTo(210, 114); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(210, 154); ctx.lineTo(210, 178); ctx.stroke();\n  if (lab.values.isaBus) {\n    ctx.strokeStyle = '#ec4899';\n    ctx.beginPath(); ctx.moveTo(118, 134); ctx.lineTo(155, 134); ctx.stroke();\n  }\n\n  drawBox(16, 40, 102, 42, '数学协处理器', st.idx === 3 ? '片内集成' : (lab.values.coproc ? '硬件开启' : '缺失(软件模拟)'), lab.values.coproc || st.idx === 3 ? '#10b981' : '#ec4899', lab.values.coproc || st.idx === 3);\n  drawBox(155, 40, 118, 42, 'CPU 核心', st.idx === 3 ? 'RISC / Harvard' : 'CISC 寄存器', '#38bdf8', true);\n  drawBox(155, 114, 118, 40, 'Cache 缓存', '命中率 ' + lab.values.cacheHit + '%', st.hit >= 0.7 ? '#10b981' : '#f59e0b', true);\n  drawBox(155, 178, 118, 40, '主内存 Main Mem', '延迟因子 x' + st.memPenalty.toFixed(1), '#94a3b8', st.hit < 0.99);\n  if (lab.values.isaBus) {\n    drawBox(16, 114, 102, 40, 'ISA 总线 I/O', '上限 100 KB/s', '#ec4899', true);\n  } else {\n    drawBox(16, 114, 102, 40, '片内高速通道', '无老旧总线限制', 'rgba(255,255,255,0.2)', false);\n  }\n\n  var speedFactor = (st.idx + 1) * 0.6;\n  var p1 = (phase * speedFactor) % 1;\n  var p2 = (phase * speedFactor * (0.4 + st.hit * 0.8)) % 1;\n  drawPacket(155, 60, 118, 60, p1, (lab.values.coproc || st.idx === 3) ? '#10b981' : '#ec4899');\n  drawPacket(210, 114, 210, 82, p2, '#38bdf8');\n  if (st.hit < 0.99) {\n    drawPacket(210, 178, 210, 154, (phase * 0.45) % 1, '#f59e0b');\n  }\n  if (lab.values.isaBus) {\n    drawPacket(16, 134, 155, 134, (phase * 0.12) % 1, '#ec4899');\n  }\n\n  var maxLog = Math.log10(4500 * 10 + 1);\n  var barY = 44;\n  for (var i = 0; i < 4; i++) {\n    var t = st.times[i];\n    var w = (Math.log10(t * 10 + 1) / maxLog) * 260;\n    ctx.fillStyle = 'rgba(255,255,255,0.06)';\n    ctx.fillRect(435, barY, 260, 22);\n    ctx.fillStyle = opColors[i];\n    ctx.fillRect(435, barY, Math.max(4, w), 22);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText(opLabels[i], 428, barY + 15);\n    ctx.textAlign = 'left';\n    ctx.fillText(t.toFixed(2) + ' us', 442 + Math.max(4, w), barY + 15);\n    barY += 34;\n  }\n\n  ctx.fillStyle = st.isaWait > 0 ? '#ec4899' : 'rgba(255,255,255,0.35)';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText('ISA I/O等待', 428, 195);\n  ctx.fillStyle = 'rgba(255,255,255,0.06)';\n  ctx.fillRect(435, 180, 260, 22);\n  if (st.isaWait > 0) {\n    var iw = (Math.log10(st.isaWait * 10 + 1) / maxLog) * 260;\n    ctx.fillStyle = '#ec4899';\n    ctx.fillRect(435, 180, iw, 22);\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'left';\n    ctx.fillText('+80.00 us (严重瓶颈!)', 442 + iw, 195);\n  } else {\n    ctx.fillStyle = 'rgba(255,255,255,0.45)';\n    ctx.textAlign = 'left';\n    ctx.fillText('0.00 us (已旁路)', 442, 195);\n  }\n\n  var totalLoop = st.times[1] + st.times[0] + st.isaWait;\n  var kops = 1000 / totalLoop;\n  lab.setReadout('架构: ' + names[st.idx] + ' | 浮点乘加耗时: ' + (st.times[0] + st.times[1]).toFixed(2) + ' us | SIN(B): ' + st.times[3].toFixed(2) + ' us | 综合速率: ' + kops.toFixed(1) + ' kOps/s');\n}\n\nlab.onUpdate(render);\nlab.onLoop(function(dt) {\n  phase += dt;\n  render();\n});"
    },
    {
      "type": "concept",
      "heading": "通用处理器 (CISC) 与 DSP 专用芯片 (RISC / Harvard)",
      "paragraphs": [
        "奔腾处理器之所以远胜 80286，归功于四大改进：**更高的时钟频率、更宽的数据总线、新增内存缓存，以及更高效的内部设计（每条指令消耗更少的时钟周期）**。但如果说奔腾是舒适豪华的凯迪拉克，那么像德州仪器 **TMS320C40** 这样的专用处理器就是为了极致速度而生的法拉利。",
        "这类专为加速数字信号处理算法而生的芯片（还包括 `Intel i860`、`AT&T DSP3210`、`Motorola DSP96002`、`Analog Devices ADSP-2171` 等）常被称为 **DSP 微处理器** 或 **RISC (精简指令集计算机)**——通过精简汇编指令种类来换取极致的执行速度；而像奔腾这样指令繁杂的传统芯片则被称为 **CISC (复杂指令集计算机)**。DSP 芯片既可以作为受控于常规电脑的从属协处理模块，也可以直接嵌入到手机等专用设备中工作。",
        "为了压榨出惊人的速度，DSP 芯片在内部采用了四大核心架构：**（1）芯片内部集成大容量超高速缓存；（2）哈佛架构 (Harvard Architecture)——将程序总线与数据总线完全分离，允许同时读取指令与数据；（3）芯片内部直接集成高速硬件数学运算单元；（4）流水线设计 (Pipeline Design)。**"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "流水线架构 (Pipeline)：单周期吞吐的魔法与编程代价",
      "paragraphs": [
        "**流水线架构** 将完成一项任务所需的硬件拆分为若干个连续的阶段。以两数相加为例，可以划分为三级流水线：**第一级** 专门从内存取数；**第二级** 专门执行相加运算；**第三级** 专门把结果存回内存。如果每个阶段耗时 1 个时钟周期，那么任何一对数字从头到尾依然需要 **3 个时钟周期** 才能算完。",
        "流水线的精妙之处在于 **并行重叠**：当第一对数字在第一个周期结束后进入第二级去相加时，闲下来的第一级立刻就能开始读取第二对数字！因此，面对海量连续运算时，系统表现出的稳态吞吐率高达 **每个时钟周期完成一次加法**（加速了 K 倍）。",
        "但流水线也是一把双刃剑——它极难编程。由于前一次计算的结果可能还“滞留”在流水线后半段尚未写回，编译器或程序员必须精心编排算法，确保新发起的计算不依赖前面尚未出炉的中间结果（即规避数据相关性停顿）。"
      ],
      "formula": {
        "expr": "N_cycles = K + (N - 1)",
        "explain": "在 K 级流水线中连续执行 N 条相互独立的操作，总共仅需 K + N - 1 个时钟周期；当 N 远大于 K 时，平均每条指令趋近于 1 个时钟周期（而非串行的 K * N 个周期）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验二：哈佛架构与流水线 (Pipeline) 并行时空图",
      "instruction": "调节流水线级数 K 与连续指令数 N，并对比关闭“哈佛双总线”或开启“数据依赖停顿”时，指令在时间轴上如何产生阻塞气泡 (Stall)。",
      "controls": [
        {
          "type": "slider",
          "id": "stages",
          "label": "流水线级数 (K)",
          "min": 2,
          "max": 5,
          "step": 1,
          "value": 3,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "ops",
          "label": "连续运算指令数 (N)",
          "min": 2,
          "max": 9,
          "step": 1,
          "value": 6,
          "unit": " 条"
        },
        {
          "type": "toggle",
          "id": "harvard",
          "label": "哈佛双总线 (程序与数据并行读取)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "hazard",
          "label": "引入数据依赖停顿 (流水线气泡)",
          "value": false
        }
      ],
      "jsCode": "var W = lab.width, H = lab.height, ctx = lab.ctx;\nvar stageColors = ['#38bdf8', '#10b981', '#f59e0b', '#ec4899', '#a855f7'];\nvar stageNames = ['取指/数', '译码', '运算', '访存', '写回'];\nvar animTime = 0;\n\nfunction buildSchedule() {\n  var K = Math.round(lab.values.stages);\n  var N = Math.round(lab.values.ops);\n  var harvard = lab.values.harvard;\n  var hazard = lab.values.hazard;\n  var starts = [0];\n  var stalls = [];\n  for (var i = 1; i < N; i++) {\n    var step = harvard ? 1 : 2;\n    if (!harvard) {\n      stalls.push({ op: i, cycle: starts[i - 1] + 1, reason: '总线冲突' });\n    }\n    if (hazard && (i % 2 === 1)) {\n      stalls.push({ op: i, cycle: starts[i - 1] + step, reason: '数据依赖' });\n      step += 1;\n    }\n    starts.push(starts[i - 1] + step);\n  }\n  var pipeCycles = starts[N - 1] + K;\n  var serialCycles = N * (K + (harvard ? 0 : 1));\n  return { K: K, N: N, harvard: harvard, hazard: hazard, starts: starts, stalls: stalls, pipeCycles: pipeCycles, serialCycles: serialCycles };\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  var sc = buildSchedule();\n  var x0 = 64, y0 = 32, gridW = 636, gridH = 148;\n  var cols = Math.max(sc.pipeCycles, 14);\n  var cw = gridW / cols;\n  var ch = Math.min(22, gridH / sc.N);\n  var activeCycle = Math.floor(animTime * 2.2) % sc.pipeCycles;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('流水线时空图 (横向=时钟周期, 纵向=指令序号)', x0, 18);\n\n  for (var s = 0; s < sc.K; s++) {\n    var lx = 400 + s * 64;\n    ctx.fillStyle = stageColors[s];\n    ctx.fillRect(lx, 9, 10, 10);\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('S' + (s + 1) + ':' + stageNames[s], lx + 14, 18);\n  }\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.10)';\n  ctx.fillRect(x0 + activeCycle * cw, y0, cw, sc.N * ch);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var c = 0; c <= cols; c++) {\n    var cx = x0 + c * cw;\n    ctx.beginPath(); ctx.moveTo(cx, y0); ctx.lineTo(cx, y0 + sc.N * ch); ctx.stroke();\n    if (c < cols) {\n      ctx.fillStyle = c === activeCycle ? '#38bdf8' : 'rgba(255,255,255,0.45)';\n      ctx.font = '10px monospace';\n      ctx.textAlign = 'center';\n      ctx.fillText('T' + (c + 1), cx + cw / 2, y0 + sc.N * ch + 13);\n    }\n  }\n\n  for (var i = 0; i < sc.N; i++) {\n    var ry = y0 + i * ch;\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px monospace';\n    ctx.textAlign = 'right';\n    ctx.fillText('Op ' + (i + 1), x0 - 8, ry + ch * 0.68);\n    for (var s = 0; s < sc.K; s++) {\n      var cyc = sc.starts[i] + s;\n      var bx = x0 + cyc * cw + 2;\n      var by = ry + 2;\n      var isNow = cyc === activeCycle;\n      ctx.fillStyle = stageColors[s];\n      ctx.globalAlpha = isNow ? 1.0 : 0.72;\n      ctx.fillRect(bx, by, cw - 4, ch - 4);\n      ctx.globalAlpha = 1.0;\n      if (isNow) {\n        ctx.strokeStyle = '#f8fafc';\n        ctx.lineWidth = 1.5;\n        ctx.strokeRect(bx, by, cw - 4, ch - 4);\n      }\n      if (cw > 22) {\n        ctx.fillStyle = '#0f172a';\n        ctx.font = 'bold 10px monospace';\n        ctx.textAlign = 'center';\n        ctx.fillText('S' + (s + 1), bx + (cw - 4) / 2, by + (ch - 4) * 0.7);\n      }\n    }\n  }\n\n  for (var j = 0; j < sc.stalls.length; j++) {\n    var st = sc.stalls[j];\n    var sx = x0 + st.cycle * cw + 2;\n    var sy = y0 + st.op * ch + 2;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 1.2;\n    ctx.strokeRect(sx, sy, cw - 4, ch - 4);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = '9px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText('停', sx + (cw - 4) / 2, sy + (ch - 4) * 0.72);\n  }\n\n  var barTop = 204;\n  var maxRef = Math.max(sc.serialCycles, 1);\n  var pipeW = (sc.pipeCycles / maxRef) * 440;\n  var serW = 440;\n  ctx.textAlign = 'left';\n  ctx.font = '10px sans-serif';\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('无流水线串行:', 16, barTop + 10);\n  ctx.fillStyle = 'rgba(255,255,255,0.22)';\n  ctx.fillRect(105, barTop, serW, 11);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(sc.serialCycles + ' 周期', 105 + serW + 8, barTop + 10);\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('当前流水线:', 16, barTop + 26);\n  ctx.fillRect(105, barTop + 16, pipeW, 11);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText(sc.pipeCycles + ' 周期 (加速 ' + (sc.serialCycles / sc.pipeCycles).toFixed(2) + 'x)', 105 + pipeW + 8, barTop + 26);\n\n  var tp = (sc.N / sc.pipeCycles).toFixed(2);\n  lab.setReadout('当前周期 T' + (activeCycle + 1) + ' | 流水线总耗时: ' + sc.pipeCycles + ' 周期 | 串行对比: ' + sc.serialCycles + ' 周期 | 加速比: ' + (sc.serialCycles / sc.pipeCycles).toFixed(2) + 'x | 平均吞吐: ' + tp + ' 条/周期');\n}\n\nlab.onUpdate(render);\nlab.onLoop(function(dt) {\n  animTime += dt;\n  render();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "不要被 CPU 主频数字迷惑：DSP 任务的实际耗时由“子系统运算时间 + 数据搬运时间”共同决定，外部总线（如老旧 ISA 总线）造成的 I/O 瓶颈可能比 CPU 时钟慢上千倍。",
        "实时信号处理必须关注数学协处理器与编译选项：无硬件浮点时用软件模拟浮点计算会慢 10～20 倍；若目标芯片仅支持定点运算，请务必避免在核心循环中使用浮点数。",
        "顺应缓存局部性（Cache Locality）：尽量让数组与滤波器系数在内存中连续存放并按顺序遍历，这能极大提高缓存命中率，白捡数倍的整体速度提升。",
        "理解专用 DSP 芯片（如 TMS320C40）的威力来源：片内大缓存 + 哈佛双总线（指令与数据同时取）+ 硬件乘加器 + 多级流水线；编写底层循环时注意减少前后指令间的数据依赖，才能让流水线跑满“每周期一条运算”的极限吞吐率。",
        "纸上谈兵不如实测：不同编译器、芯片与缓存策略差异巨大，最可靠的评估方法是在目标硬件上直接写一个执行百万次的循环并用秒表实测耗时。"
      ]
    }
  ]
});
