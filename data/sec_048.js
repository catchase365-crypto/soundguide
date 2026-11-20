window.__BOOK_REGISTER_SECTION__("sec_048", {
  "title": "执行速度：编程语言的抽象阶梯与性能权衡 (Execution Speed: Program Language)",
  "intuition": "编程语言越高级，开发越省心，但与硬件之间隔的“中间商”就越多——汇编直控寄存器最快，编译型语言居中，解释器与图形工具包则用执行效率换取开发便利。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、微处理器底座与编程语言的三重抽象阶梯",
      "paragraphs": [
        "在对比任何编程语言的速度之前，必须先看清微处理器的真实面貌。所有微处理器内部都围绕一组**二进制寄存器（Binary Registers）**工作——它们本质上是一排存储 0 和 1 的触发器（Flip-flops）。以早期 IBM PC 的核心 **8088 微处理器**为例，它内部只有 4 个 16 位通用寄存器（`AX`、`BX`、`CX`、`DX`）和 9 个专用寄存器（`SI`、`DI`、`SP`、`BP`、`CS`、`DS`、`SS`、`ES`、`IP`），其中指令指针 `IP`（Instruction Pointer）专门负责追踪下一条指令存放在内存的哪个地址。",
        "直接用 0 和 1 指挥硬件工作的语言叫**机器码（Machine Code）**，例如比特序列 `00000011 11000011` 会让 8088 将 `BX` 寄存器的 16 位二进制数加到 `AX` 中并存回 `AX`。由于直接读写二进制极易让人崩溃，工程师为每条指令起个助记符（如 `ADD AX, BX`），这就是第一层抽象——**汇编语言（Assembly）**。汇编源代码通过**汇编器（Assembler）**一一对应地翻译成机器码（即目标代码/可执行代码），开发前提是你必须对芯片内部寄存器和内存地址了如指掌。",
        "再往上跨一大步，就是第二层抽象——**编译型高级语言（Compiled / High-level Languages）**，如 C、BASIC、FORTRAN、PASCAL 等。程序员只需操纵 `A`、`B`、`C` 这类抽象变量，完全不必关心芯片里有哪些寄存器。最高一层则是第三层抽象——**专用应用软件包（Applications Packages）**，常见于芯片厂商配套的图形化 DSP 开发环境：你只需在屏幕上连接信号通路图标、配置滤波器和模拟 I/O 参数，软件会自动把整套算法转成底层机器码。"
      ],
      "formula": {
        "expr": "机器码 (0/1比特) ⇄ 汇编 (硬件寄存器) → 编译型语言 (抽象变量) → 应用软件包 (完整算法模块)",
        "explain": "三层抽象的本质区别在于“你直接操纵的对象是什么”：(1) 硬件寄存器与内存；(2) 抽象变量；(3) 完整的过程与信号处理算法。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：同一道加法题 (1234 + 4321) 在三层语言与 8088 硬件中的透视",
      "instruction": "切换「抽象层级」滑块对比汇编、BASIC 与图形应用包的代码形态，拖动「执行步进」观察 8088 寄存器 AX/BX/CX 与内存 DS 的实时数值变化。",
      "controls": [
        {
          "type": "slider",
          "id": "level",
          "label": "抽象层级 (1汇编 2编译 3应用包)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 1,
          "unit": " 级"
        },
        {
          "type": "slider",
          "id": "step",
          "label": "执行步进 (IP 指令指针)",
          "min": 0,
          "max": 6,
          "step": 1,
          "value": 6,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "showBin",
          "label": "显示对应二进制机器码",
          "value": true
        }
      ],
      "jsCode": "function draw() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var level = lab.values.level;\n  var step = lab.values.step;\n  var showBin = lab.values.showBin;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var states = [\n    { cx: 0, ax: 0, bx: 0, ds0: 0, ds2: 0, ds4: 0, ip: '0000H', desc: '初始复位：寄存器与内存均清零' },\n    { cx: 1234, ax: 0, bx: 0, ds0: 0, ds2: 0, ds4: 0, ip: '0003H', desc: '将 1234 装入通用寄存器 CX' },\n    { cx: 1234, ax: 0, bx: 0, ds0: 1234, ds2: 0, ds4: 0, ip: '0007H', desc: '将 CX 转存至内存地址 DS:[0]' },\n    { cx: 4321, ax: 0, bx: 0, ds0: 1234, ds2: 0, ds4: 0, ip: '000AH', desc: '将 4321 装入通用寄存器 CX' },\n    { cx: 4321, ax: 0, bx: 0, ds0: 1234, ds2: 4321, ds4: 0, ip: '000EH', desc: '将 CX 转存至内存地址 DS:[2]' },\n    { cx: 4321, ax: 1234, bx: 4321, ds0: 1234, ds2: 4321, ds4: 0, ip: '0016H', desc: '把 DS:[0] 与 DS:[2] 载入 AX 和 BX' },\n    { cx: 4321, ax: 5555, bx: 4321, ds0: 1234, ds2: 4321, ds4: 5555, ip: '001CH', desc: 'ADD AX,BX 求和 5555 并写入 DS:[4]' }\n  ];\n  var st = states[step];\n\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(16, 14, 340, 212);\n  ctx.strokeStyle = 'rgba(56,189,248,0.35)';\n  ctx.strokeRect(16, 14, 340, 212);\n\n  ctx.font = 'bold 13px monospace';\n  ctx.fillStyle = '#38bdf8';\n  var titles = ['', '第1级：汇编语言 + 机器码 (Table 4-3/4-4)', '第2级：编译型 BASIC 语言 (Table 4-5)', '第3级：专用 DSP 图形应用包'];\n  ctx.fillText(titles[level], 26, 36);\n\n  if (level === 1) {\n    var lines = [\n      { code: 'MOV CX,1234', bin: '10111001 11010010 00000100' },\n      { code: 'MOV DS:[0],CX', bin: '10001001 00001110 00000000' },\n      { code: 'MOV CX,4321', bin: '10111001 11100001 00010000' },\n      { code: 'MOV DS:[2],CX', bin: '10001001 00001110 00000010' },\n      { code: 'MOV AX,[0] / BX,[2]', bin: '10100001 ... 10001011 ...' },\n      { code: 'ADD AX,BX / MOV [4],AX', bin: '00000011 11000011 ...' }\n    ];\n    for (var i = 0; i < lines.length; i++) {\n      var y = 62 + i * 26;\n      var active = (step === i + 1);\n      if (active) {\n        ctx.fillStyle = 'rgba(16,185,129,0.22)';\n        ctx.fillRect(22, y - 14, 328, 22);\n      }\n      ctx.font = active ? 'bold 12px monospace' : '12px monospace';\n      ctx.fillStyle = active ? '#10b981' : (i + 1 < step ? '#f8fafc' : '#64748b');\n      ctx.fillText((active ? '▶ ' : '  ') + lines[i].code, 26, y);\n      if (showBin) {\n        ctx.font = '10px monospace';\n        ctx.fillStyle = active ? '#f59e0b' : '#475569';\n        ctx.fillText(lines[i].bin, 190, y);\n      }\n    }\n  } else if (level === 2) {\n    var blines = [\n      { code: '100 A = 1234', minStep: 1, maxStep: 2, mem: '分配4字节->A' },\n      { code: '110 B = 4321', minStep: 3, maxStep: 4, mem: '分配4字节->B' },\n      { code: '120 C = A + B', minStep: 5, maxStep: 6, mem: '编译拆解+存C' },\n      { code: '130 END', minStep: 99, maxStep: 99, mem: '程序结束' }\n    ];\n    for (var j = 0; j < blines.length; j++) {\n      var by = 70 + j * 34;\n      var bAct = (step >= blines[j].minStep && step <= blines[j].maxStep);\n      if (bAct) {\n        ctx.fillStyle = 'rgba(56,189,248,0.22)';\n        ctx.fillRect(22, by - 16, 328, 26);\n      }\n      ctx.font = bAct ? 'bold 13px monospace' : '13px monospace';\n      ctx.fillStyle = bAct ? '#38bdf8' : '#e2e8f0';\n      ctx.fillText((bAct ? '▶ ' : '  ') + blines[j].code, 28, by);\n      ctx.font = '11px sans-serif';\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText(blines[j].mem, 185, by);\n    }\n    ctx.font = '11px sans-serif';\n    ctx.fillStyle = '#f59e0b';\n    ctx.fillText('编译器已自动接管左侧硬件寄存器与地址分配', 28, 212);\n  } else {\n    var boxes = [\n      { x: 32, y: 78, w: 72, h: 46, txt: '常量 A', val: step >= 1 ? '1234' : '---', act: step >= 1 && step <= 2 },\n      { x: 32, y: 142, w: 72, h: 46, txt: '常量 B', val: step >= 3 ? '4321' : '---', act: step >= 3 && step <= 4 },\n      { x: 148, y: 110, w: 76, h: 48, txt: 'SUM 模块', val: step >= 6 ? '+' : '...', act: step >= 5 },\n      { x: 266, y: 110, w: 74, h: 48, txt: '输出 C', val: step >= 6 ? '5555' : '---', act: step >= 6 }\n    ];\n    ctx.strokeStyle = '#38bdf8'; ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(104, 101); ctx.lineTo(148, 128); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(104, 165); ctx.lineTo(148, 140); ctx.stroke();\n    ctx.beginPath(); ctx.moveTo(224, 134); ctx.lineTo(266, 134); ctx.stroke();\n    for (var k = 0; k < boxes.length; k++) {\n      var b = boxes[k];\n      ctx.fillStyle = b.act ? 'rgba(236,72,153,0.22)' : '#0f172a';\n      ctx.fillRect(b.x, b.y, b.w, b.h);\n      ctx.strokeStyle = b.act ? '#ec4899' : '#64748b';\n      ctx.lineWidth = 1.5;\n      ctx.strokeRect(b.x, b.y, b.w, b.h);\n      ctx.font = 'bold 11px sans-serif'; ctx.fillStyle = '#f8fafc';\n      ctx.fillText(b.txt, b.x + 8, b.y + 18);\n      ctx.font = 'bold 12px monospace'; ctx.fillStyle = '#10b981';\n      ctx.fillText(b.val, b.x + 8, b.y + 36);\n    }\n    ctx.font = '11px sans-serif'; ctx.fillStyle = '#ec4899';\n    ctx.fillText('完全屏蔽底层硬件：只操纵信号通路与算法图标', 28, 212);\n  }\n\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(374, 14, 330, 212);\n  ctx.strokeStyle = level === 1 ? 'rgba(16,185,129,0.5)' : 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(374, 14, 330, 212);\n\n  ctx.font = 'bold 13px monospace';\n  ctx.fillStyle = level === 1 ? '#10b981' : '#94a3b8';\n  ctx.fillText(level === 1 ? '8088 硬件透视 (程序员直接操控)' : '8088 硬件透视 (已由工具自动接管)', 386, 36);\n\n  var regs = [\n    { name: 'AX', val: st.ax, x: 388, y: 54, hl: step >= 5 },\n    { name: 'BX', val: st.bx, x: 468, y: 54, hl: step >= 5 },\n    { name: 'CX', val: st.cx, x: 548, y: 54, hl: step >= 1 && step <= 4 },\n    { name: 'IP', val: st.ip, x: 628, y: 54, hl: true }\n  ];\n  for (var r = 0; r < regs.length; r++) {\n    var rg = regs[r];\n    ctx.fillStyle = rg.hl ? 'rgba(16,185,129,0.18)' : '#0f172a';\n    ctx.fillRect(rg.x, rg.y, 68, 46);\n    ctx.strokeStyle = rg.hl ? '#10b981' : '#475569';\n    ctx.strokeRect(rg.x, rg.y, 68, 46);\n    ctx.font = 'bold 11px monospace'; ctx.fillStyle = '#94a3b8';\n    ctx.fillText(rg.name, rg.x + 6, rg.y + 16);\n    ctx.font = 'bold 13px monospace'; ctx.fillStyle = '#f8fafc';\n    ctx.fillText('' + rg.val, rg.x + 6, rg.y + 36);\n  }\n\n  ctx.font = 'bold 12px monospace'; ctx.fillStyle = '#38bdf8';\n  ctx.fillText('内存数据段 (RAM)', 388, 124);\n  var mems = [\n    { addr: 'DS:[0] (A)', val: st.ds0, x: 388, hl: step === 2 },\n    { addr: 'DS:[2] (B)', val: st.ds2, x: 492, hl: step === 4 },\n    { addr: 'DS:[4] (C)', val: st.ds4, x: 596, hl: step === 6 }\n  ];\n  for (var m = 0; m < mems.length; m++) {\n    var mm = mems[m];\n    ctx.fillStyle = mm.hl ? 'rgba(245,158,11,0.2)' : '#0f172a';\n    ctx.fillRect(mm.x, 134, 94, 48);\n    ctx.strokeStyle = mm.hl ? '#f59e0b' : '#475569';\n    ctx.strokeRect(mm.x, 134, 94, 48);\n    ctx.font = '11px monospace'; ctx.fillStyle = '#94a3b8';\n    ctx.fillText(mm.addr, mm.x + 6, 152);\n    ctx.font = 'bold 14px monospace'; ctx.fillStyle = mm.val === 5555 ? '#10b981' : '#f8fafc';\n    ctx.fillText('' + mm.val, mm.x + 6, 173);\n  }\n\n  ctx.font = '11px sans-serif'; ctx.fillStyle = '#f59e0b';\n  ctx.fillText('当前动作：' + st.desc, 388, 210);\n\n  lab.setReadout('第 ' + level + ' 级抽象 | 步进 ' + step + '/6 | AX=' + st.ax + ' BX=' + st.bx + ' CX=' + st.cx + ' | 结果 DS:[4]=' + st.ds4);\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "二、编译器、解释器与“抽象税”的代价",
      "paragraphs": [
        "当你用 BASIC 写下 `100 A = 1234` 时，**编译器（Compiler）**会在后台默默替你完成两件苦差事：第一，内存分配——它识别出 `A` 是一个单精度浮点数变量，于是划出 4 个字节的硬件内存专供 `A` 读写；第二，算式拆解——因为微处理器本身只会加、减、乘、除这四种基本算术，编译器必须把诸如 `Y = LOG(X^COS(Z))` 这样的复杂数学表达式，拆解成一长串四则运算指令。",
        "绝大多数编译器会先把**整份源代码**一次性翻译成机器码再执行。但有一种特例叫**解释器（Interpreter）**，典型代表是早期的解释型 BASIC。它读一行源代码、翻译成机器码、立刻执行这一行，然后再去读下一行。虽然这带来了很好的交互调试体验，但运行速度慢得惊人——通常要慢上**大约 100 倍**！",
        "此外，抽象层级之间并没有绝对的楚河汉界（例如 C 语言也能直接操作硬件指针，而配齐了 DSP 函数库的高级语言也十分接近应用软件包）。但你必须记住一条铁律：当你使用编译器或应用软件包时，你其实是在**押注编译器作者或软件包的作者比你更懂底层硬件和 DSP 优化**。然而，他们从未见过你手头正在解决的具体问题，无法针对性裁剪优化。因此，编程层级越高，最终生成的机器码在**内存占用、运行速度和计算精度**上就越容易产生“抽象税”——效率往往不如人工精雕细琢的底层代码。"
      ],
      "formula": {
        "expr": "Y = LOG(X^COS(Z))  ──(编译器拆解)──▶  一系列 { +, -, ×, ÷ } 基本微处理器指令",
        "explain": "微处理器硬件只认识加减乘除；一切对数、三角函数、指数幂都必须由编译器或库函数拆解为四则运算序列。"
      }
    },
    {
      "type": "concept",
      "heading": "三、语言选型、速度争论与混合编程的黄金法则",
      "paragraphs": [
        "既然 C/C++ 兼具强大功能、灵活性与模块化，为什么还会有人用其他语言写 DSP？作者给出了三个现实原因：第一，**历史惯性**——DSP 发展太快，许多军工与科研机构仍大量遗留 FORTRAN 或 PASCAL 代码；第二，**极限压榨**——部分实时性极高的场景必须用汇编换取“多做很多工作只为多提一点速”；第三，**学习门槛**——C 语言对偶尔才用一次 DSP 做实验的科学家和工程师来说并不友好，许多人会转投简单直观的 BASIC（本书也为了聚焦算法逻辑而选用带行号的 BASIC 作教学伪代码，方便说清“第 100 行干了什么”）。",
        "关于“汇编到底比 C 快多少”，软件工程师与硬件工程师历来争执不休：偏向高级语言的人说汇编只快 50%、开发却麻烦 5 倍；偏向汇编的人则反唇相讥说汇编快 5 倍、只麻烦 50%。拨开立场偏见，工程经验法则是：**同一段子程序，用汇编编写通常比高级语言快 1.5 到 3.0 倍**（具体差距唯有实测才能确定）。按个人电脑算力每年增长约 40% 估算，把关键算法写成汇编，相当于白白赚来了大约**两年的硬件技术跨越**。",
        "然而，专业程序员依然排斥用汇编或 BASIC 写大型工程，因为它们弱结构化的特点会破坏好代码的三大标准：**可移植性（Portable）**、**模块化（Modular）**和**易读性（Easy to understand）**。聪明的工程师从不做极端二选一，而是采用混合编程的黄金法则：**用 C 语言搭建大型程序的主体框架，而把最耗时的核心信号处理循环，交给汇编编写的高性能 DSP 函数库去执行。**正所谓“哪怕最纯粹的软件洁癖者，只要不用自己亲手写，也照样乐于调用汇编库”。"
      ],
      "formula": {
        "expr": "Speed(汇编) ≈ (1.5 ~ 3.0) × Speed(C语言)   |   1.4² ≈ 1.96 ≈ 2年硬件演进红利",
        "explain": "汇编通常能带来 1.5~3 倍的实测提速；若硬件性能每年提升 40%，约 2 倍提速等同于提前用上两年后的新硬件。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：实时 DSP 算力竞速与音频掉帧听感模拟",
      "instruction": "拖动「每帧 DSP 运算负荷」观察绿色汇编条与蓝色编译型 C 条何时跨过 100% 实时红线；打开「试听实时处理音质」可对比算力充足时的纯净正弦音与超时掉帧时的卡顿爆音！",
      "controls": [
        {
          "type": "slider",
          "id": "asmRatio",
          "label": "汇编相对 C 提速倍数",
          "min": 1.5,
          "max": 3,
          "step": 0.1,
          "value": 2.2,
          "unit": "x"
        },
        {
          "type": "slider",
          "id": "ops",
          "label": "每帧 DSP 运算负荷 (以 C 为基准)",
          "min": 20,
          "max": 160,
          "step": 5,
          "value": 85,
          "unit": "%"
        },
        {
          "type": "toggle",
          "id": "useInterp",
          "label": "加入解释型 BASIC 对比 (慢100倍)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听实时处理音质",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "var audioCtx = null;\nvar osc = null;\nvar gainNode = null;\nvar phase = 0;\nvar glitchTimer = 0;\n\nfunction ensureAudio() {\n  if (!audioCtx) {\n    audioCtx = lab.getAudioContext();\n    if (audioCtx) {\n      osc = audioCtx.createOscillator();\n      gainNode = audioCtx.createGain();\n      osc.type = 'sine';\n      osc.frequency.value = 330;\n      gainNode.gain.value = 0;\n      osc.connect(gainNode);\n      gainNode.connect(audioCtx.destination);\n      osc.start();\n    }\n  }\n  if (audioCtx && audioCtx.state === 'suspended') {\n    audioCtx.resume();\n  }\n}\n\nfunction updateAudio(overloaded) {\n  if (!lab.values.play) {\n    if (gainNode && audioCtx) {\n      gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02);\n    }\n    return;\n  }\n  ensureAudio();\n  if (!gainNode || !audioCtx) return;\n  if (!overloaded) {\n    gainNode.gain.setTargetAtTime(0.12, audioCtx.currentTime, 0.02);\n  } else {\n    var chop = (Math.sin(glitchTimer * 28) > 0.15) ? 0.14 : 0.0;\n    gainNode.gain.setTargetAtTime(chop, audioCtx.currentTime, 0.005);\n  }\n}\n\nfunction drawFrame(dt) {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var asmRatio = lab.values.asmRatio;\n  var ops = lab.values.ops;\n  var useInterp = lab.values.useInterp;\n\n  var asmLoad = ops / asmRatio;\n  var cLoad = ops;\n  var cOver = cLoad > 100;\n  var asmOver = asmLoad > 100;\n  var years = Math.log(asmRatio) / Math.log(1.4);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx <= W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 0; gy <= H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  var barX0 = 24;\n  var maxBarW = 240;\n  var deadlineX = barX0 + maxBarW;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('单帧采样周期内的 CPU 耗时对比', 24, 26);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.setLineDash([5, 4]);\n  ctx.beginPath(); ctx.moveTo(deadlineX, 38); ctx.lineTo(deadlineX, 206); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('100% 实时截止线', deadlineX - 42, 222);\n\n  var bars = [\n    { label: '汇编语言 (Assembly)', pct: asmLoad, color: asmOver ? '#ec4899' : '#10b981', y: 54 },\n    { label: '编译型 C 语言 (Compiled)', pct: cLoad, color: cOver ? '#ec4899' : '#38bdf8', y: 108 }\n  ];\n  if (useInterp) {\n    bars.push({ label: '解释型 BASIC (慢100倍)', pct: cLoad * 100, color: '#f59e0b', y: 162, capped: true });\n  }\n\n  for (var i = 0; i < bars.length; i++) {\n    var b = bars[i];\n    ctx.font = '12px sans-serif';\n    ctx.fillStyle = '#e2e8f0';\n    ctx.fillText(b.label, barX0, b.y);\n\n    ctx.fillStyle = 'rgba(255,255,255,0.07)';\n    ctx.fillRect(barX0, b.y + 8, maxBarW + 140, 22);\n\n    var w = Math.min((b.pct / 100) * maxBarW, maxBarW + 140);\n    ctx.fillStyle = b.color;\n    ctx.fillRect(barX0, b.y + 8, w, 22);\n\n    ctx.font = 'bold 11px monospace';\n    ctx.fillStyle = '#0f172a';\n    if (w > 56) {\n      ctx.fillText(b.pct.toFixed(1) + '%', barX0 + 8, b.y + 23);\n    } else {\n      ctx.fillStyle = '#f8fafc';\n      ctx.fillText(b.pct.toFixed(1) + '%', barX0 + w + 6, b.y + 23);\n    }\n    if (b.pct > 100) {\n      ctx.fillStyle = '#ec4899';\n      ctx.fillText(b.capped ? '严重超时 (×100)' : '超时掉帧!', barX0 + maxBarW + 8, b.y + 23);\n    }\n  }\n\n  if (!useInterp) {\n    ctx.fillStyle = 'rgba(16,185,129,0.12)';\n    ctx.fillRect(24, 162, 355, 40);\n    ctx.strokeStyle = 'rgba(16,185,129,0.4)';\n    ctx.strokeRect(24, 162, 355, 40);\n    ctx.font = '12px sans-serif';\n    ctx.fillStyle = '#10b981';\n    ctx.fillText('汇编提速 ' + asmRatio.toFixed(1) + 'x ≈ 提前赢得 ' + years.toFixed(1) + ' 年硬件升级红利', 34, 186);\n  }\n\n  var wx = 416;\n  var wy = 42;\n  var ww = 286;\n  var wh = 166;\n  ctx.fillStyle = '#1e293b';\n  ctx.fillRect(wx, wy, ww, wh);\n  ctx.strokeStyle = 'rgba(255,255,255,0.18)';\n  ctx.strokeRect(wx, wy, ww, wh);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('实时信号输出波形 (汇编 vs C/解释器)', wx + 10, wy + 20);\n\n  var cy = wy + 100;\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(wx + 8, cy); ctx.lineTo(wx + ww - 8, cy); ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 1.6;\n  ctx.beginPath();\n  for (var x = 0; x <= ww - 20; x += 2) {\n    var s1 = Math.sin(phase + x * 0.055) * 40;\n    if (x === 0) ctx.moveTo(wx + 10 + x, cy - s1); else ctx.lineTo(wx + 10 + x, cy - s1);\n  }\n  ctx.stroke();\n\n  var overloaded = useInterp || cOver;\n  ctx.strokeStyle = overloaded ? '#ec4899' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  var held = 0;\n  for (var x2 = 0; x2 <= ww - 20; x2 += 2) {\n    var val = Math.sin(phase + x2 * 0.055) * 40;\n    if (overloaded) {\n      var block = Math.floor((x2 + phase * 18) / (useInterp ? 36 : 22));\n      if (block % 2 === 1) {\n        val = held;\n      } else {\n        held = val;\n      }\n    }\n    if (x2 === 0) ctx.moveTo(wx + 10 + x2, cy - val); else ctx.lineTo(wx + 10 + x2, cy - val);\n  }\n  ctx.stroke();\n\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('绿线: 汇编无丢帧', wx + 10, wy + 156);\n  ctx.fillStyle = overloaded ? '#ec4899' : '#38bdf8';\n  ctx.fillText(overloaded ? '粉线: 算力超时导致缓冲卡顿!' : '蓝线: C 语言实时顺畅', wx + 130, wy + 156);\n\n  updateAudio(overloaded);\n  lab.setReadout('汇编耗时 ' + asmLoad.toFixed(1) + '% | 编译 C 耗时 ' + cLoad.toFixed(1) + '% | ' + (overloaded ? '警告：已突破 100% 实时截止线，出现音频掉帧！' : '状态正常：在采样周期内完成处理（等效硬件跨越 ' + years.toFixed(1) + ' 年）'));\n}\n\nlab.onLoop(function(dt) {\n  phase += dt * 4.2;\n  glitchTimer += dt;\n  drawFrame(dt);\n});\n\nlab.onUpdate(function() {\n  drawFrame(0.016);\n});\n\ndrawFrame(0.016);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "编程语言的三层本质：汇编操纵「硬件寄存器与内存」，编译型语言操纵「抽象变量」，应用软件包操纵「完整过程与算法模块」。",
        "汇编相比 C 语言的常规提速在 1.5 到 3.0 倍之间（约等于白赚两年的硬件换代红利），切忌幻想“随便重写就能快十倍”。",
        "解释器逐行翻译执行，速度比编译器慢约 100 倍，只适合交互式教学或简单脚本，切勿用于高采样率实时 DSP 流水线。",
        "抽象层级越高，工具作者越不了解你的具体问题，生成的机器码在速度、内存和精度上越容易出现冗余损耗。",
        "工程最优解不是全盘手写汇编（难以维护且无法跨平台），而是「C 语言写主干架构 + 调用汇编优化好的 DSP 核心算法库」。"
      ]
    }
  ]
});
