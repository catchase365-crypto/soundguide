window.__BOOK_REGISTER_SECTION__("sec_212", {
  "title": "高级 DSP 软件工具：C 编译器、IDE 与硬件仿真器 (Advanced Software Tools)",
  "intuition": "如果说汇编语言是手搓精密零件，那么 C 语言 DSP 优化库 + VisualDSP 集成环境 + JTAG 硬件仿真器，就是把 DSP 开发升级为带实时仪表盘和自动化流水线的现代工厂。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 告别“土法炼钢”：为什么严肃的 DSP 开发需要 C 编译器与专用库？",
      "paragraphs": [
        "在前一节的入门示例里，我们用记事本、汇编器、链接器和下载器这些各自独立的命令行小工具，一步步把程序跑起来。对于简单测试这没问题，但一旦进入真正的工程项目，这种手工作坊式的流程就会极其低效。",
        "现代 DSP（如 Analog Devices 的 SHARC 系列）通常采用 **C 语言与汇编混合编程**。很多人以为用 C 语言会变慢，但实际上它拥有一个杀手锏——**高度优化的 DSP C 函数库（如 Table 29-3）**。它不仅提供标准的数学运算（`sin`、`cos`、`exp`、`sqrt`、矩阵加乘 `matadd`/`matmul`）和硬件控制（中断定义 `interrupt`、处理器休眠 `idle`、定时器控制 `timer_set`），更内置了核心的**信号处理算法库**：如 FIR/IIR 滤波器（`fir`、`iir`、`biquad`）、实数/复数快速傅里叶变换（`rfftN`、`cfftN`、`iffN`）、自相关/互相关以及均值和均方根（`mean`、`rms`）。",
        "最关键的工程秘密在于：**这些 C 语言信号处理库函数的底层全都是用纯汇编精心手写优化的**！这意味着你既享受了 C 语言的高可读性和快速开发效率，又在核心算力上获得了汇编级别的极速与极低内存开销。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "2. 实战剖析：用 C 写一个基于硬件环形缓冲区的实时回声程序 (CIRCBUF.C)",
      "paragraphs": [
        "为了展示 C 语言如何直接驾驭 DSP 的底层硬件特性，原书 Table 29-4 给出了运行在 ADSP-21061 EZ-KIT Lite 上的经典回声程序 `CIRCBUF.C`。它通过在 C 中调用 `<macros.h>` 提供的 `CIRCULAR_BUFFER`、`BASE` 和 `LENGTH` 宏，直接将变量映射到 SHARC 处理器专用的数据地址发生器寄存器（DAG1 的 `b1`、`i1`、`L1`），实现零软件判界开销的硬件环形寻址。",
        "程序采用**中断驱动 + 休眠等待**的经典实时架构：主循环 `while(1)` 调用 `idle()` 让处理器低功耗等待；每当采样中断 `SIG_IRQ3` 到来，中断函数 `process_input` 立刻用当前输入 `in_port` 覆盖缓冲区第 $n$ 个位置（即刚过期的最旧数据），且不移动指针（`CIRC_WRITE(echo, 0, in_port, dm)`）。",
        "随后主循环被唤醒，先用 `CIRC_READ(echo, 1, newest, dm)` 读出刚刚写入的第 $n$ 个最新采样并**将指针前移 1 格到 $n+1$**；此时 $n+1$ 恰恰存放着队列里最老的采样（延迟了 `BUFF_LENGTH` 个采样），再用步长为 0 的读取指令将其取出放入 `oldest`（注意原书印刷代码此处有 `CIR_READ` 笔误，实际应为 `CIRC_READ`），最后相加输出实现回声。书中也特别提醒了一个经典工程坑：`data_buff[BUFF_LENGTH]` 是在 `main()` 内分配的局部数组，千万不能把 `BUFF_LENGTH` 设得比系统栈（Stack）还大！"
      ],
      "formula": {
        "expr": "y[n] = x[n] + α · x[n - L]",
        "explain": "y[n] 为输出端口 out_port 的当前回声信号；x[n] 为最新输入样本 newest；x[n - L] 为环形缓冲区指针 n+1 处存放的 L 步前最老样本 oldest（书中原代码 α=1，实际工程常乘以小于 1 的衰减系数 α 防止溢出）。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 1：CIRCBUF.C 环形缓冲区指针与实时回声听觉对比",
      "instruction": "拖动「缓冲区长度」与「旧采样衰减系数」，观察左侧硬件环形指针 n（写/读最新值）与 n+1（读最旧值）的追逐过程，点击播放键对比不同延迟的回声听感。",
      "controls": [
        {
          "type": "slider",
          "id": "buffLen",
          "label": "缓冲区长度 (L)",
          "min": 8,
          "max": 32,
          "step": 1,
          "value": 16,
          "unit": " 采样"
        },
        {
          "type": "slider",
          "id": "echoMix",
          "label": "旧采样衰减系数 (α)",
          "min": 0,
          "max": 1,
          "step": 0.05,
          "value": 0.7,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "paused",
          "label": "暂停指针步进",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放脉冲回声对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var buf = [];\nvar nIdx = 0;\nvar tick = 0;\nvar inHist = [];\nvar outHist = [];\nvar histMax = 64;\nvar simAcc = 0;\nvar audioTimer = 0;\nvar activeGain = null;\n\nfunction resetHist() {\n  inHist = [];\n  outHist = [];\n  for (var i = 0; i < histMax; i++) {\n    inHist.push(0);\n    outHist.push(0);\n  }\n}\nresetHist();\n\nfunction syncBufferLen(L) {\n  if (buf.length !== L) {\n    var next = [];\n    for (var i = 0; i < L; i++) {\n      next.push(i < buf.length ? buf[i] : 0);\n    }\n    buf = next;\n    nIdx = nIdx % L;\n  }\n}\n\nfunction stepSample() {\n  var L = Math.round(lab.values.buffLen);\n  syncBufferLen(L);\n  var alpha = lab.values.echoMix;\n  var phase = tick % 36;\n  var x = 0;\n  if (phase === 0) x = 1.0;\n  else if (phase === 1) x = 0.55;\n  else if (phase === 2) x = -0.35;\n  else if (phase === 3) x = 0.15;\n\n  nIdx = (nIdx + 1) % L;\n  var oldest = buf[nIdx];\n  buf[nIdx] = x;\n  var newest = buf[nIdx];\n  var y = newest + alpha * oldest;\n\n  inHist.push(x);\n  if (inHist.length > histMax) inHist.shift();\n  outHist.push(y);\n  if (outHist.length > histMax) outHist.shift();\n  tick++;\n}\n\nfunction triggerEchoSound() {\n  if (!lab.values.play) return;\n  var ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') ac.resume();\n\n  var now = ac.currentTime;\n  var L = Math.round(lab.values.buffLen);\n  var alpha = lab.values.echoMix;\n  var delaySec = L * 0.015;\n\n  function playBurst(startTime, gainVal, freq) {\n    if (gainVal <= 0.01) return;\n    var osc = ac.createOscillator();\n    var g = ac.createGain();\n    osc.type = 'triangle';\n    osc.frequency.setValueAtTime(freq, startTime);\n    osc.frequency.exponentialRampToValueAtTime(freq * 0.65, startTime + 0.06);\n    g.gain.setValueAtTime(0.0001, startTime);\n    g.gain.linearRampToValueAtTime(0.28 * gainVal, startTime + 0.005);\n    g.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.075);\n    osc.connect(g);\n    g.connect(ac.destination);\n    osc.start(startTime);\n    osc.stop(startTime + 0.085);\n    activeGain = g;\n  }\n\n  playBurst(now + 0.01, 1.0, 680);\n  playBurst(now + 0.01 + delaySec, alpha, 540);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var L = Math.round(lab.values.buffLen);\n  var alpha = lab.values.echoMix;\n  syncBufferLen(L);\n  var nextIdx = (nIdx + 1) % L;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 268; gx <= 704; gx += 43.6) {\n    ctx.beginPath(); ctx.moveTo(gx, 32); ctx.lineTo(gx, 224); ctx.stroke();\n  }\n  for (var gy = 35; gy <= 225; gy += 35) {\n    ctx.beginPath(); ctx.moveTo(268, gy); ctx.lineTo(704, gy); ctx.stroke();\n  }\n\n  ctx.beginPath();\n  ctx.moveTo(246, 12); ctx.lineTo(246, H - 12);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('环形缓冲区 data_buff[L=' + L + ']', 14, 22);\n\n  var cx = 123, cy = 126, R = 74;\n  ctx.beginPath();\n  ctx.arc(cx, cy, R, 0, Math.PI * 2);\n  ctx.strokeStyle = 'rgba(148,163,184,0.22)';\n  ctx.lineWidth = 2;\n  ctx.stroke();\n\n  for (var i = 0; i < L; i++) {\n    var ang = -Math.PI / 2 + (i / L) * Math.PI * 2;\n    var px = cx + Math.cos(ang) * R;\n    var py = cy + Math.sin(ang) * R;\n    var val = Math.abs(buf[i]);\n    var cellR = L > 22 ? 6.5 : 8.5;\n    ctx.beginPath();\n    ctx.arc(px, py, cellR, 0, Math.PI * 2);\n    if (i === nIdx) {\n      ctx.fillStyle = '#10b981';\n    } else if (i === nextIdx) {\n      ctx.fillStyle = '#f59e0b';\n    } else if (val > 0.05) {\n      ctx.fillStyle = 'rgba(56,189,248,' + (0.3 + 0.7 * Math.min(1, val)) + ')';\n    } else {\n      ctx.fillStyle = '#1e293b';\n    }\n    ctx.fill();\n    ctx.strokeStyle = (i === nIdx || i === nextIdx) ? '#f8fafc' : 'rgba(255,255,255,0.25)';\n    ctx.lineWidth = (i === nIdx || i === nextIdx) ? 1.8 : 1;\n    ctx.stroke();\n  }\n\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 11px monospace';\n  ctx.fillText('n = ' + nIdx + ' (newest)', cx, cy - 10);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('n+1 = ' + nextIdx + ' (oldest)', cx, cy + 8);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('硬件自动回绕寻址', cx, cy + 25);\n  ctx.textAlign = 'left';\n\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(14, 218, 10, 10);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('写入/最新(n)', 28, 227);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(118, 218, 10, 10);\n  ctx.fillStyle = '#cbd5e1';\n  ctx.fillText('读取最旧(n+1)', 132, 227);\n\n  function drawWave(arr, baseY, scaleY, color, label) {\n    ctx.fillStyle = color;\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText(label, 268, baseY - 46);\n    ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n    ctx.beginPath();\n    ctx.moveTo(268, baseY); ctx.lineTo(704, baseY);\n    ctx.stroke();\n\n    ctx.strokeStyle = color;\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    var stepX = 436 / (histMax - 1);\n    for (var k = 0; k < histMax; k++) {\n      var wx = 268 + k * stepX;\n      var wy = baseY - arr[k] * scaleY;\n      if (k === 0) ctx.moveTo(wx, wy);\n      else ctx.lineTo(wx, wy);\n    }\n    ctx.stroke();\n  }\n\n  drawWave(inHist, 72, 34, '#38bdf8', '输入信号 in_port : x[n]（周期脉冲）');\n  drawWave(outHist, 178, 26, '#10b981', '输出信号 out_port : x[n] + ' + alpha.toFixed(2) + ' * x[n - ' + L + ']（直达声 + 延迟回声）');\n\n  var delayMs = Math.round(L * 15);\n  lab.setReadout('L = ' + L + ' 采样 | 写指针 n = ' + nIdx + ' | 读旧指针 (n+1)%L = ' + nextIdx + ' | 回声延迟(音频演示) ≈ ' + delayMs + ' ms | α = ' + alpha.toFixed(2));\n}\n\nlab.onUpdate(function() {\n  if (!lab.values.play && activeGain) {\n    try { activeGain.gain.value = 0; } catch (e) {}\n    activeGain = null;\n    audioTimer = 0;\n  }\n  if (lab.values.play && audioTimer === 0) {\n    triggerEchoSound();\n    audioTimer = 0.001;\n  }\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  if (!lab.values.paused) {\n    simAcc += dt;\n    if (simAcc >= 0.13) {\n      simAcc = 0;\n      stepSample();\n      draw();\n    }\n  }\n  if (lab.values.play) {\n    audioTimer += dt;\n    if (audioTimer >= 1.15) {\n      audioTimer = 0.001;\n      triggerEchoSound();\n    }\n  }\n});\n\nfor (var s = 0; s < 12; s++) stepSample();\ndraw();"
    },
    {
      "type": "concept",
      "heading": "3. 一体化开发舱：VisualDSP 集成开发环境 (IDE)",
      "paragraphs": [
        "拥有了 C 编译器之后，下一步就是把零散的编辑、编译、汇编、链接、模拟、调试、下载以及烧写 PROM 全部整合进同一个图形界面——这就是 **集成开发环境 (Integrated Development Environment, IDE)**，Analog Devices 为 SHARC 提供的代表产品就是 **VisualDSP**（如图 29-7）。",
        "VisualDSP 的编辑器专门针对 DSP 开发做了深度定制：它能理解 C 与汇编的语法，用不同颜色高亮区分关键字，支持同时打开并管理多文件工程（大型 DSP 程序必然是多文件链接而成的），还允许你在同一个 C 源文件中直接用 `asm(\"...\")` 混写汇编语句来极致压榨性能。",
        "此外，它还内置了书签快速跳转与实时编译构建结果窗口，让工程师可以在「编写代码（Edit）— 构建工程（Build）— 单步排错（Debug）」三个动作之间无缝切换。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "4. 调试双雄：软件模拟器 (Simulator) vs. 硬件仿真器 (Emulator) 与性能剖析",
      "paragraphs": [
        "在 VisualDSP 的统一调试界面（图 29-8）下，你可以同时把 C 源码和编译后的汇编指令穿插对照查看，自定义寄存器监视窗口、追踪总线与内存活动，还能用内置的 **代码剖析器 (Profiler)** 统计每个函数占用的执行百分比（`Exec %`）和精确时钟周期数（`Exec Cycles`），一眼揪出拖慢实时系统的性能瓶颈。",
        "这一套界面背后连接着两种截然不同的调试工具：首先是 **模拟器 (Simulator)**。它完全运行在你的 PC 电脑上，通过软件虚拟出 DSP 芯片的内部架构、数据流、中断和 I/O，**甚至不需要桌面上接有真实的 DSP 硬件**。因此它几乎总是写完代码后的第一步逻辑排错工具。",
        "当代码通过模拟验证后，就需要请出 **硬件仿真器 (Emulator，例如 Analog Devices 的 EZ-ICE)**。它直接把程序跑在**真实的 DSP 芯片硬件上**！为了能让 PC 上的调试软件实时“透视”芯片内部电信号与寄存器状态，SHARC DSP 专门在芯片上集成了 **IEEE 1149.1 JTAG 测试访问端口**（注：原书此处印为 1140.1），让外部硬件设备可以无损追踪处理器的真实全速运行。最后，书中也建议工程师在玩转评估板和工具链后，多参加芯片厂商（如 ADI）举办的 3 天线下实战培训课，快速吸收专家的一线工程经验。"
      ],
      "formula": {
        "expr": "Budget_cycles = (f_clk / f_s) × N",
        "explain": "在实时 DSP 系统中，处理 N 个采样点一帧数据的最大可用时钟周期预算 Budget_cycles，等于芯片主频 f_clk（如 40 MHz）除以采样率 f_s 后再乘以帧长 N。一旦剖析器测得的实际周期数超过此预算，系统就会丢帧崩溃。"
      }
    },
    {
      "type": "lab",
      "heading": "微实验 2：VisualDSP 代码性能剖析器 (Profiler) 与 JTAG 仿真对比",
      "instruction": "调节帧长 N 与采样率，切换「纯 C 循环 vs Table 29-3 汇编库」观察各模块周期耗时与 40 MHz SHARC 实时预算是否爆表；切换「模拟器 vs JTAG 仿真器」观察调试速度差异。",
      "controls": [
        {
          "type": "slider",
          "id": "nSize",
          "label": "处理帧长 (N)",
          "min": 64,
          "max": 1024,
          "step": 64,
          "value": 256,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "sampleRate",
          "label": "实时采样率 (fs)",
          "min": 8,
          "max": 96,
          "step": 8,
          "value": 48,
          "unit": " kHz"
        },
        {
          "type": "toggle",
          "id": "useAsmLib",
          "label": "启用 Table 29-3 汇编优化库 (cfftN / fir)",
          "value": true
        },
        {
          "type": "toggle",
          "id": "useEmulator",
          "label": "目标模式：PC 模拟器(关) / JTAG 硬件仿真(开)",
          "value": false
        }
      ],
      "jsCode": "var pulsePhase = 0;\n\nfunction computeMetrics() {\n  var N = lab.values.nSize;\n  var fs = lab.values.sampleRate * 1000;\n  var asm = lab.values.useAsmLib;\n  var log2N = Math.round(Math.log(N) / Math.LN2);\n\n  var c_io = (asm ? 4 : 12) * N;\n  var c_fft = Math.round((asm ? 3.5 : 42) * (N / 2) * log2N);\n  var c_fir = Math.round((asm ? 1.2 : 12) * 64 * N);\n  var c_math = (asm ? 15 : 90) * N;\n  var total = c_io + c_fft + c_fir + c_math;\n  var budget = Math.round((40000000 / fs) * N);\n  var util = (total / budget) * 100;\n\n  return {\n    N: N,\n    fsK: lab.values.sampleRate,\n    asm: asm,\n    c_io: c_io,\n    c_fft: c_fft,\n    c_fir: c_fir,\n    c_math: c_math,\n    total: total,\n    budget: budget,\n    util: util\n  };\n}\n\nfunction fmtCycles(v) {\n  if (v >= 1000000) return (v / 1000000).toFixed(2) + 'M';\n  if (v >= 1000) return (v / 1000).toFixed(1) + 'k';\n  return String(v);\n}\n\nfunction draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var m = computeMetrics();\n  var emu = lab.values.useEmulator;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var x = 140; x <= 380; x += 60) {\n    ctx.beginPath(); ctx.moveTo(x, 38); ctx.lineTo(x, 198); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('VisualDSP Profile 窗口（函数周期剖析）', 14, 22);\n  ctx.fillStyle = m.asm ? '#10b981' : '#f59e0b';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(m.asm ? '模式: 汇编优化库' : '模式: 未优化纯 C 循环', 278, 22);\n\n  var items = [\n    { name: 'fir (64-tap)', val: m.c_fir, color: '#ec4899' },\n    { name: 'cfftN (FFT)', val: m.c_fft, color: '#38bdf8' },\n    { name: 'math (rms/sin)', val: m.c_math, color: '#f59e0b' },\n    { name: 'IRQ + CIRC_IO', val: m.c_io, color: '#10b981' }\n  ];\n\n  var maxScale = Math.max(m.total, m.budget, 100000);\n  for (var i = 0; i < items.length; i++) {\n    var it = items[i];\n    var y = 46 + i * 38;\n    var pct = (it.val / m.total) * 100;\n    var barW = Math.max(4, Math.min(235, (it.val / m.total) * 235));\n\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '11px monospace';\n    ctx.fillText(it.name, 14, y + 14);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.06)';\n    ctx.fillRect(140, y, 235, 20);\n\n    ctx.fillStyle = it.color;\n    ctx.fillRect(140, y, barW, 20);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.fillText(pct.toFixed(1) + '% (' + fmtCycles(it.val) + ')', 381, y + 14);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('瓶颈提示: fir 滤波占总算力 ' + ((m.c_fir / m.total) * 100).toFixed(1) + '%，是汇编优化的核心靶点', 14, 218);\n\n  ctx.beginPath();\n  ctx.moveTo(454, 12); ctx.lineTo(454, H - 12);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('40 MHz SHARC 实时预算与调试通道', 468, 22);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.08)';\n  ctx.fillRect(468, 40, 236, 24);\n\n  var gaugeFrac = Math.min(1, m.util / 100);\n  var statusColor = m.util > 100 ? '#ec4899' : (m.util > 75 ? '#f59e0b' : '#10b981');\n  ctx.fillStyle = statusColor;\n  ctx.fillRect(468, 40, Math.round(236 * gaugeFrac), 24);\n  ctx.strokeStyle = 'rgba(255,255,255,0.28)';\n  ctx.strokeRect(468, 40, 236, 24);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('CPU 负载: ' + m.util.toFixed(1) + '%', 474, 56);\n\n  ctx.fillStyle = statusColor;\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(m.util > 100 ? '⚠ 算力溢出！实时音频必然丢帧' : '✓ 满足实时要求，余量充足', 468, 84);\n\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '11px monospace';\n  ctx.fillText('消耗: ' + fmtCycles(m.total) + ' / 预算: ' + fmtCycles(m.budget) + ' 周期', 468, 102);\n\n  ctx.fillStyle = emu ? 'rgba(16,185,129,0.12)' : 'rgba(56,189,248,0.12)';\n  ctx.fillRect(468, 118, 236, 106);\n  ctx.strokeStyle = emu ? '#10b981' : '#38bdf8';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(468, 118, 236, 106);\n\n  ctx.fillStyle = emu ? '#10b981' : '#38bdf8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText(emu ? 'EZ-ICE JTAG 硬件仿真器 (真实芯片)' : 'VisualDSP PC 模拟器 (纯软件虚拟)', 478, 138);\n\n  ctx.fillStyle = '#e2e8f0';\n  ctx.font = '11px sans-serif';\n  if (emu) {\n    ctx.fillText('• 接口: IEEE 1149.1 JTAG 测试口', 478, 160);\n    ctx.fillText('• 时钟: 40 MHz 真实硬件全速运行', 478, 178);\n    ctx.fillText('• 作用: 抓取真实外设/中断电信号', 478, 196);\n  } else {\n    ctx.fillText('• 硬件需求: 无需实体 DSP 开发板', 478, 160);\n    ctx.fillText('• 速度: PC 软件模拟 (~1/200x 速度)', 478, 178);\n    ctx.fillText('• 作用: 写完代码第一步逻辑排错', 478, 196);\n  }\n\n  var scanX = 478 + ((Math.sin(pulsePhase) + 1) * 0.5) * 210;\n  ctx.fillStyle = emu ? '#10b981' : '#38bdf8';\n  ctx.beginPath();\n  ctx.arc(scanX, 212, 3.5, 0, Math.PI * 2);\n  ctx.fill();\n\n  lab.setReadout('N=' + m.N + ' | fs=' + m.fsK + 'kHz | 总周期=' + m.total.toLocaleString() + ' / 预算=' + m.budget.toLocaleString() + ' | 负载=' + m.util.toFixed(1) + '% | ' + (emu ? 'JTAG全速' : 'PC模拟'));\n}\n\nlab.onUpdate(draw);\nlab.onLoop(function(dt) {\n  var speed = lab.values.useEmulator ? 8.0 : 1.4;\n  pulsePhase += dt * speed;\n  draw();\n});\ndraw();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "C 与汇编并不是对立的：在 C 程序中调用官方信号处理库（`fir`、`iir`、`cfftN`、`rms` 等），底层会自动执行手写级汇编指令，兼顾开发效率与极限性能。",
        "栈溢出大坑：像 `CIRCBUF.C` 示例里直接在 `main()` 中声明 `float data_buff[BUFF_LENGTH]` 时，数组占用的是系统栈（Stack）空间，切勿把延迟长度设得超过栈大小。",
        "环形读写指针口诀：写入新值覆盖当前指针 $n$ 处且不移动指针；主循环读取最新值时指针步进 $+1$ 指向 $n+1$（恰为最旧样本），随后以步长 `0` 读出最旧值，指针原地待命迎接下一次中断。",
        "先模拟，后仿真：写完代码先用不依赖硬件的 PC Simulator 跑通逻辑和边界条件，再通过芯片上的 IEEE 1149.1 JTAG 接口接上 EZ-ICE 硬件仿真器做全速实时实测与 Profiler 瓶颈调优。"
      ]
    }
  ]
});
