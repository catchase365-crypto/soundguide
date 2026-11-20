window.__BOOK_REGISTER_SECTION__("sec_209", {
  "title": "设计实战：FIR 音频滤波器 (Design Example: An FIR Audio Filter)",
  "intuition": "用不到 50 行 SHARC 汇编代码，让一块 DSP 开发板实时对麦克风/音频信号做任意形状的 301 点频率整形——秘诀在于用硬件循环缓冲区消除寻址开销，并用单周期并行指令同时完成『乘、加、双内存取数』。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 从 ASCII 源码到可执行工程：拼齐外围拼图与 301 点测试核",
      "paragraphs": [
        "在熟悉了 EZ-KIT Lite 预装的演示程序后，下一步就是动手写自己的滤波器。SHARC DSP 支持 **C 语言**和**汇编语言**，且源代码都是纯 ASCII 文本，用任何标准文本编辑器就能修改。本节我们以 Table 29-2 的纯汇编 FIR 滤波器为例，把精力集中在最核心的信号处理逻辑上。",
        "但要提醒一点：仅靠主算法代码还不能直接变成一个完整的可执行文件。在实际工程中，你还需要直接从官方例程里复制三份「外围配置拼图」：**架构描述文件**（architecture description file，定义硬件配置与内存分配）、**中断向量表设置**以及 **编解码器 (codec) 初始化例程**。此外，在进入 `main:` 主程序之前，还必须定义三个核心对象与两个配置参数：",
        "- `NR_COEF`：滤波器核（Impulse Response）的抽头点数，本例为 **301**。\n- `dline[NR_COEF]`：位于**数据存储器 (Data Memory)** 的循环缓冲区，用来存放过去的输入样本。\n- `coef[NR_COEF]`：位于**程序存储器 (Program Memory)** 的循环缓冲区，用来存放滤波器系数。\n- 外加 codec 的**采样率**以及存放 301 个系数的 **ASCII 文件名**（链接时一并读入）。",
        "为了证明 FIR 滤波器几乎能实现**任意自定义频率响应**，本例直接沿用了第 17 章设计的那颗形状极其古怪的 **301 点滤波器核**（见原书 Figure 29-2）：它的频响既有低频波浪起伏、在归一化频率 0.19 处陡然飙升到 2.4 倍并垂直跌落，又在 0.27~0.30 之间挖出一个完全归零的深槽（陷波）。写好汇编源码后，只需运行 EZ-KIT Lite 自带的**汇编器 (Assembler)** 和**链接器 (Linker)**（手写汇编可跳过 C 编译器 Compiler），大约 30 秒就能把所有模块打包成可执行文件，由 PC 端的 EZ-KIT Lite Host 软件下载到板子上实时运行。"
      ],
      "formula": null
    },
    {
      "type": "lab",
      "heading": "交互实验 1：301 点古怪 FIR 滤波器频响与实时听感对比",
      "instruction": "拖动『输入测试频率』滑块观察它在古怪频响曲线上的增益变化，调节『滤波器点数 NR_COEF』观察吉布斯效应与阶数对陡峭边缘的影响，点击播放按钮可实时听出 0.19 峰值放大与 0.27~0.30 零陷波消音效果。",
      "controls": [
        {
          "type": "slider",
          "id": "freq",
          "label": "输入测试频率 (fs=8kHz)",
          "min": 100,
          "max": 3900,
          "step": 50,
          "value": 1500,
          "unit": " Hz"
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "滤波器点数 NR_COEF",
          "min": 21,
          "max": 301,
          "step": 20,
          "value": 301,
          "unit": " 点"
        },
        {
          "type": "toggle",
          "id": "bypass",
          "label": "旁路直通 (关闭滤波器)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放测试音对比",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar osc = null, gainNode = null;\nvar cachedTaps = -1, kernel = [], freqCurve = [];\n\nfunction targetMag(nu) {\n  if (nu < 0.10) return 0.5 + 0.3 * Math.sin(nu * 95);\n  if (nu < 0.19) return 0.5 + 1.9 * Math.pow((nu - 0.10) / 0.09, 1.3);\n  if (nu < 0.27) return 1.0;\n  if (nu < 0.30) return 0.0;\n  if (nu < 0.40) return 1.0;\n  return 1.0 - 0.9 * ((nu - 0.40) / 0.10);\n}\n\nfunction rebuildFilter(taps) {\n  cachedTaps = taps;\n  kernel = new Array(taps);\n  var M = (taps - 1) / 2;\n  var ns = 200, dnu = 0.5 / ns;\n  for (var n = 0; n < taps; n++) {\n    var sum = 0;\n    for (var i = 0; i < ns; i++) {\n      var nu = (i + 0.5) * dnu;\n      sum += targetMag(nu) * Math.cos(2 * Math.PI * nu * (n - M));\n    }\n    var win = 0.54 - 0.46 * Math.cos(2 * Math.PI * n / (taps - 1));\n    kernel[n] = 2 * sum * dnu * win;\n  }\n  freqCurve = [];\n  for (var j = 0; j <= 200; j++) {\n    var fnu = (j / 200) * 0.5;\n    var mag = 0;\n    for (var k = 0; k < taps; k++) {\n      mag += kernel[k] * Math.cos(2 * Math.PI * fnu * (k - M));\n    }\n    freqCurve.push({ nu: fnu, mag: Math.max(0, mag) });\n  }\n}\n\nfunction evalActualMag(nu) {\n  var M = (cachedTaps - 1) / 2;\n  var mag = 0;\n  for (var k = 0; k < cachedTaps; k++) {\n    mag += kernel[k] * Math.cos(2 * Math.PI * nu * (k - M));\n  }\n  return Math.max(0, mag);\n}\n\nfunction syncAudio(freq, activeGain) {\n  if (lab.values.play) {\n    var ac = lab.getAudioContext();\n    if (!osc) {\n      osc = ac.createOscillator();\n      gainNode = ac.createGain();\n      osc.type = 'sine';\n      osc.connect(gainNode);\n      gainNode.connect(ac.destination);\n      osc.start();\n    }\n    osc.frequency.setTargetAtTime(freq, ac.currentTime, 0.02);\n    gainNode.gain.setTargetAtTime(0.14 * activeGain, ac.currentTime, 0.02);\n  } else if (osc) {\n    var ac2 = lab.getAudioContext();\n    gainNode.gain.setTargetAtTime(0, ac2.currentTime, 0.015);\n    try { osc.stop(ac2.currentTime + 0.03); } catch (e) {}\n    osc = null; gainNode = null;\n  }\n}\n\nfunction draw() {\n  var freq = lab.values.freq;\n  var taps = lab.values.taps;\n  var bypass = lab.values.bypass;\n  if (taps !== cachedTaps) rebuildFilter(taps);\n\n  var nuCur = freq / 8000;\n  var filtGain = evalActualMag(nuCur);\n  var activeGain = bypass ? 1.0 : filtGain;\n  syncAudio(freq, activeGain);\n\n  ctx.clearRect(0, 0, W, H);\n\n  var gx1 = 44, gw1 = 300, gy = 30, gh = 175;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var yv = 0; yv <= 2.5; yv += 0.5) {\n    var py = gy + gh - (yv / 2.6) * gh;\n    ctx.beginPath(); ctx.moveTo(gx1, py); ctx.lineTo(gx1 + gw1, py); ctx.stroke();\n    if (yv === 0 || yv === 1 || yv === 2) {\n      ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.textAlign = 'right';\n      ctx.fillText(yv.toFixed(0), gx1 - 6, py + 4);\n    }\n  }\n  for (var xv = 0; xv <= 0.5; xv += 0.1) {\n    var px = gx1 + (xv / 0.5) * gw1;\n    ctx.beginPath(); ctx.moveTo(px, gy); ctx.lineTo(px, gy + gh); ctx.stroke();\n    ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.textAlign = 'center';\n    ctx.fillText(xv.toFixed(1), px, gy + gh + 15);\n  }\n\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('a. 频率响应 |H(f)| (fs=8kHz)', gx1, 18);\n\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = 'rgba(248,250,252,0.3)';\n  ctx.lineWidth = 1.2;\n  ctx.beginPath();\n  for (var i = 0; i <= 200; i++) {\n    var tnu = (i / 200) * 0.5;\n    var tx = gx1 + (tnu / 0.5) * gw1;\n    var ty = gy + gh - (targetMag(tnu) / 2.6) * gh;\n    if (i === 0) ctx.moveTo(tx, ty); else ctx.lineTo(tx, ty);\n  }\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.strokeStyle = bypass ? 'rgba(56,189,248,0.25)' : '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (var j = 0; j < freqCurve.length; j++) {\n    var cx = gx1 + (freqCurve[j].nu / 0.5) * gw1;\n    var cy = gy + gh - (freqCurve[j].mag / 2.6) * gh;\n    if (j === 0) ctx.moveTo(cx, cy); else ctx.lineTo(cx, cy);\n  }\n  ctx.stroke();\n\n  if (bypass) {\n    var byY = gy + gh - (1.0 / 2.6) * gh;\n    ctx.strokeStyle = '#10b981'; ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(gx1, byY); ctx.lineTo(gx1 + gw1, byY); ctx.stroke();\n  }\n\n  var curX = gx1 + (nuCur / 0.5) * gw1;\n  var curY = gy + gh - (activeGain / 2.6) * gh;\n  ctx.strokeStyle = 'rgba(245,158,11,0.55)'; ctx.lineWidth = 1.5;\n  ctx.beginPath(); ctx.moveTo(curX, gy); ctx.lineTo(curX, gy + gh); ctx.stroke();\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(curX, curY, 5, 0, Math.PI * 2); ctx.fill();\n  ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';\n  ctx.fillText(activeGain.toFixed(2) + 'x', Math.min(curX + 7, gx1 + gw1 - 38), Math.max(curY - 7, gy + 12));\n\n  var gx2 = 395, gw2 = 300;\n  var zeroY = gy + gh * 0.72;\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;\n  ctx.beginPath(); ctx.moveTo(gx2, gy); ctx.lineTo(gx2, gy + gh); ctx.stroke();\n  ctx.beginPath(); ctx.moveTo(gx2, gy + gh); ctx.lineTo(gx2 + gw2, gy + gh); ctx.stroke();\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath(); ctx.moveTo(gx2, zeroY); ctx.lineTo(gx2 + gw2, zeroY); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('b. 脉冲响应 (Filter Kernel, ' + taps + ' 点)', gx2, 18);\n\n  ctx.strokeStyle = '#10b981'; ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (var k = 0; k < taps; k++) {\n    var kx = gx2 + (k / (taps - 1)) * gw2;\n    var ky = zeroY - kernel[k] * (gh * 0.65);\n    if (k === 0) ctx.moveTo(kx, ky); else ctx.lineTo(kx, ky);\n  }\n  ctx.stroke();\n\n  var M = (taps - 1) / 2;\n  ctx.fillStyle = '#94a3b8'; ctx.font = '11px monospace'; ctx.textAlign = 'center';\n  ctx.fillText('0', gx2, gy + gh + 15);\n  ctx.fillText('对称中心 ' + M, gx2 + gw2 / 2, gy + gh + 15);\n  ctx.fillText(String(taps - 1), gx2 + gw2, gy + gh + 15);\n\n  lab.setReadout('输入频率: ' + freq + ' Hz (归一化 ' + nuCur.toFixed(3) + ') | 阶数: ' + taps + ' 点 (延迟 ' + M + ' 样本) | 当前增益: ' + activeGain.toFixed(2) + 'x' + (bypass ? ' [直通]' : ' [FIR滤波]'));\n}\n\nlab.onUpdate(draw);\ndraw();"
    },
    {
      "type": "concept",
      "heading": "2. 主程序骨架：DAG 硬件循环缓冲区与「翘脚等待」死循环",
      "paragraphs": [
        "看懂了外部工程结构，现在把目光聚焦到 Table 29-2 的核心汇编代码。`main:` 主程序其实只干了两件事：",
        "**第一件事（第 008~013 行）：配置数据地址生成器 (DAGs)。** 在通用 CPU 上写循环缓冲区，每次都要手动判断指针是否越界并取模回绕，极其耗时；而 SHARC 芯片内置了专门的 DAG 硬件寄存器，只要预先填好三个参数，硬件就会在每次读写时自动完成「按步长推进 + 越界自动回绕」：\n- `b0 = dline; l0 = @dline; m0 = 1;` —— 设定输入缓冲区的**起始基址 (Base)**、**长度 (Length)** 和**步长 (Modifier = 1)**。\n- `b8 = coef; l8 = @coef; m8 = 1;` —— 同理，设定滤波器系数缓冲区的基址、长度和步长（使用 `8` 号组是因为它位于程序存储器 `pm`，可以和 `0` 号组的数据存储器 `dm` 同时读取！）。",
        "**第二件事（第 017~019 行）：进入「翘脚等待 (thumb-twiddling)」死循环。** `wait: idle; jump wait;` 这几行什么也不干，就是让处理器原地待命，静静等待 codec 发来「新样本已就绪」的硬件中断。",
        "为什么主程序什么都不算？因为本程序采用的是**逐样本处理 (sample-by-sample processing)**：每从输入端采进 1 个点，就立刻触发一次中断算出 1 个输出点送给喇叭。绝大多数时域算法（如 FIR、IIR 滤波器）都采用这种模式；而与之相对的**逐帧处理 (frame-by-frame processing)** 则是先攒够一整批样本再统一运算，常见于 FFT 等频域技术。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "3. 中断服务程序三部曲：定浮点转换、单周期四合一流水线与延迟分支",
      "paragraphs": [
        "每当 ADC 采集完一个音频样本，程序就会跳进 `sample_ready:` 中断子程序，分三段极速完成整个 FIR 滤波过程：",
        "**第一段（第 029~033 行）：读取定点样本并转为浮点数。** SHARC 汇编有一个极其精妙的约定：同一组物理数据寄存器，存放**定点数**时叫 `r0, r8, r15`，存放**浮点数**时叫 `f0, f8, f15`。codec 送来的是 16 位有符号定点数，放在 32 位寄存器的低 16 位；因此第 30 行必须执行 `r0 = lshift r0 by 16;`，把它**左移 16 位推到最高位**，让符号位对齐 MSB！接着用 `r1 = -31; f0 = float r0 by r1;`（第 31~32 行）直接将其标准化为 `[-1.0, +1.0)` 范围的浮点数并覆盖写回 0 号寄存器（此时叫 `f0`）。最后 `dm(i0,m0) = f0;` 将新样本写入 `dline[ ]` 的最老位置，同时 DAG 自动把 `i0` 指针往前挪 1 格。",
        "**第二段（第 037~045 行）：全浮点 FIR 卷积核心。** 浮点运算彻底免除了定点溢出和缩放的烦恼。其中第 42 行是全书最震撼的一行代码：\n`f8 = f2*f4, f12 = f8+f12, f2 = dm(i0,m0), f4 = pm(i8,m8);`\n在**短短 1 个时钟周期**内，SHARC 同时并行了 4 件事：**乘法器算当前乘积** (`f8=f2*f4`)、**加法器累加前一拍乘积** (`f12=f8+f12`)、**从数据内存取下一个输入样本** (`dm(i0,m0)`)、**从程序内存取下一个系数** (`pm(i8,m8)`)！因为第 38~39 行提前预装（prime）了流水线前两拍，所以循环次数只需要 `NR_COEF - 2`（第 41 行 `lcntr = NR_COEF-2`），循环结束后再用第 44~45 行把流水线里剩下的最后两拍乘加收尾。",
        "**第三段（第 049~053 行）：转回定点输出与延迟分支陷阱。** 用 `r1 = 31; r8 = fix f12 by r1;` 把输出浮点数变回 32 位定点数，然后第 51 行出现了 `rti(db);`（Return from Interrupt with Delayed Branch）。带 `(db)` 后缀的指令在执行返回跳转的同时，**会顺带把紧跟在后面的第 52、53 两行指令也一起执行完**——正好利用这段流水线间隙把 `r8` 右移 16 位（`lshift r8 by -16`）塞进 `tx_buf + 1` 送往 DAC，省下两个宝贵的时钟周期！"
      ],
      "formula": {
        "expr": "y[n] = Σ_{k=0}^{NR_COEF-1} coef[k] · dline[n - k]",
        "explain": "n 为当前采样时刻；coef[k] 是通过程序总线 pm(i8,m8) 读取的固定滤波器系数；dline[n-k] 是通过数据总线 dm(i0,m0) 读取的环形历史输入样本；累加全部在 f12 浮点寄存器中完成，从而完美规避定点溢出的风险。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：SHARC 单周期四合一流水线与循环缓冲区步进模拟器",
      "instruction": "把 301 抽头微缩为 5 抽头 (NR_COEF=5, lcntr=3)，拖动『执行步数』或开启『自动单步运行』，亲眼观察 i0/i8 指针如何在环形内存中自动回绕，以及第 42 行单周期内 4 路信号同时并发的数据流。",
      "controls": [
        {
          "type": "slider",
          "id": "step",
          "label": "汇编执行步数",
          "min": 0,
          "max": 11,
          "step": 1,
          "value": 0,
          "unit": " 步"
        },
        {
          "type": "slider",
          "id": "sampleIn",
          "label": "输入 ADC 样本值 x[n]",
          "min": -0.8,
          "max": 0.8,
          "step": 0.1,
          "value": 0.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "autoPlay",
          "label": "自动单步播放流水线",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar autoTimer = 0, autoStep = 0;\n\nfunction fmt(v) {\n  if (v === null || v === undefined) return '---';\n  return (v >= 0 ? '+' : '') + v.toFixed(3);\n}\n\nfunction buildTrace(xNew) {\n  var d = [0.20, -0.30, 0.40, 0.10, -0.20];\n  var c = [0.10, 0.20, 0.40, 0.20, 0.10];\n  var hex16 = Math.round(xNew * 32767);\n  var hexStr = '0x' + ((hex16 & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, '0');\n  var shiftStr = '0x' + (((hex16 << 16) >>> 0)).toString(16).toUpperCase().padStart(8, '0');\n\n  var states = [];\n  states.push({ line: '018-019', asm: 'wait: idle; jump wait;', desc: '主循环翘脚待命，等待 codec 采样就绪中断', d: d.slice(), i0: 0, i8: 0, r0: '----', f0: null, f2: null, f4: null, f8: null, f12: null, r8: '----', ops: [] });\n  states.push({ line: '029-030', asm: 'r0=dm(rx_buf+1); r0=lshift r0 by 16;', desc: '读入16位整数 ' + hexStr + '，左移16位对齐符号位 -> ' + shiftStr, d: d.slice(), i0: 0, i8: 0, r0: shiftStr, f0: null, f2: null, f4: null, f8: null, f12: null, r8: '----', ops: ['rx->r0'] });\n  states.push({ line: '031-032', asm: 'r1=-31; f0=float r0 by r1;', desc: '将定点 r0 转为 [-1,1) 浮点数，覆盖写入 f0=' + fmt(xNew), d: d.slice(), i0: 0, i8: 0, r0: shiftStr, f0: xNew, f2: null, f4: null, f8: null, f12: null, r8: '----', ops: ['r0->f0'] });\n\n  var dW = d.slice(); dW[0] = xNew;\n  states.push({ line: '033', asm: 'dm(i0,m0)=f0;', desc: '新样本覆写最老槽位 dline[0]，DAG 自动将 i0 推进至 1', d: dW.slice(), i0: 1, i8: 0, r0: shiftStr, f0: xNew, f2: null, f4: null, f8: null, f12: null, r8: '----', ops: ['f0->dm'] });\n  states.push({ line: '037-038', asm: 'f12=0; f2=dm(i0,m0), f4=pm(i8,m8);', desc: '累加器清零，同时从 dm[1] 和 pm[0] 预取首对操作数，i0=2,i8=1', d: dW.slice(), i0: 2, i8: 1, r0: shiftStr, f0: xNew, f2: dW[1], f4: c[0], f8: null, f12: 0, r8: '----', ops: ['dm->f2', 'pm->f4'] });\n\n  var f8_1 = dW[1] * c[0];\n  states.push({ line: '039', asm: 'f8=f2*f4, f2=dm(i0,m0), f4=pm(i8,m8);', desc: '预装乘法器 f8=' + fmt(f8_1) + '，同时双取 dm[2] 与 pm[1]，i0=3,i8=2', d: dW.slice(), i0: 3, i8: 2, r0: shiftStr, f0: xNew, f2: dW[2], f4: c[1], f8: f8_1, f12: 0, r8: '----', ops: ['mul', 'dm->f2', 'pm->f4'] });\n\n  var f12_1 = 0 + f8_1;\n  var f8_2 = dW[2] * c[1];\n  states.push({ line: '042 (1/3)', asm: 'f8=f2*f4, f12=f8+f12, f2=dm(i0,m0), f4=pm(i8,m8);', desc: '单周期4路并发！累加、乘、双取 dm[3] 与 pm[2]，i0=4,i8=3', d: dW.slice(), i0: 4, i8: 3, r0: shiftStr, f0: xNew, f2: dW[3], f4: c[2], f8: f8_2, f12: f12_1, r8: '----', ops: ['mul', 'acc', 'dm->f2', 'pm->f4'] });\n\n  var f12_2 = f12_1 + f8_2;\n  var f8_3 = dW[3] * c[2];\n  states.push({ line: '042 (2/3)', asm: 'f8=f2*f4, f12=f8+f12, f2=dm(i0,m0), f4=pm(i8,m8);', desc: '单周期4路并发！i0 读取 dm[4] 后自动模5回绕至 0！', d: dW.slice(), i0: 0, i8: 4, r0: shiftStr, f0: xNew, f2: dW[4], f4: c[3], f8: f8_3, f12: f12_2, r8: '----', ops: ['mul', 'acc', 'dm->f2', 'pm->f4'] });\n\n  var f12_3 = f12_2 + f8_3;\n  var f8_4 = dW[4] * c[3];\n  states.push({ line: '042 (3/3)', asm: 'f8=f2*f4, f12=f8+f12, f2=dm(i0,m0), f4=pm(i8,m8);', desc: '循环最后一轮：取回新样本 dm[0] 与 coef[4]，i0=1, i8 自动回绕至 0', d: dW.slice(), i0: 1, i8: 0, r0: shiftStr, f0: xNew, f2: dW[0], f4: c[4], f8: f8_4, f12: f12_3, r8: '----', ops: ['mul', 'acc', 'dm->f2', 'pm->f4'] });\n\n  var f12_4 = f12_3 + f8_4;\n  var f8_5 = dW[0] * c[4];\n  states.push({ line: '044', asm: 'f8=f2*f4, f12=f8+f12;', desc: '流水线收尾第1拍：完成最后一次乘法与倒数第二次累加', d: dW.slice(), i0: 1, i8: 0, r0: shiftStr, f0: xNew, f2: dW[0], f4: c[4], f8: f8_5, f12: f12_4, r8: '----', ops: ['mul', 'acc'] });\n\n  var f12_5 = f12_4 + f8_5;\n  states.push({ line: '045', asm: 'f12=f8+f12;', desc: '流水线收尾第2拍：最终滤波输出 y[n] = ' + fmt(f12_5) + ' 就绪！', d: dW.slice(), i0: 1, i8: 0, r0: shiftStr, f0: xNew, f2: dW[0], f4: c[4], f8: f8_5, f12: f12_5, r8: '----', ops: ['acc'] });\n\n  var out16 = Math.round(Math.max(-1, Math.min(0.999, f12_5)) * 32767);\n  var outHex = '0x' + ((out16 & 0xffff) >>> 0).toString(16).toUpperCase().padStart(4, '0');\n  states.push({ line: '049-053', asm: 'fix f12; rti(db); r8=lshift -16; dm(tx_buf+1)=r8;', desc: '浮点转定点后调用延迟返回 rti(db)，顺带右移并送出 ' + outHex + '；i0停在1指向下个最老槽！', d: dW.slice(), i0: 1, i8: 0, r0: shiftStr, f0: xNew, f2: dW[0], f4: c[4], f8: f8_5, f12: f12_5, r8: outHex, ops: ['f12->tx'] });\n  return { states: states, coef: c };\n}\n\nfunction drawBox(x, y, w, h, title, val, activeColor) {\n  ctx.fillStyle = activeColor ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = activeColor || 'rgba(255,255,255,0.18)';\n  ctx.lineWidth = activeColor ? 2 : 1;\n  ctx.fillRect(x, y, w, h);\n  ctx.strokeRect(x, y, w, h);\n  ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'left';\n  ctx.fillText(title, x + 6, y + 13);\n  ctx.fillStyle = activeColor || '#f8fafc'; ctx.font = 'bold 12px monospace'; ctx.textAlign = 'center';\n  ctx.fillText(val, x + w / 2, y + 31);\n}\n\nfunction renderStep(stepIdx) {\n  var tr = buildTrace(lab.values.sampleIn);\n  var st = tr.states[stepIdx];\n  var c = tr.coef;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('数据内存循环区 dline[0..4] (DAG0)', 16, 22);\n  for (var i = 0; i < 5; i++) {\n    var bx = 16 + i * 52, by = 32;\n    var isPtr = (i === st.i0);\n    ctx.fillStyle = isPtr ? 'rgba(56,189,248,0.18)' : 'rgba(255,255,255,0.03)';\n    ctx.strokeStyle = isPtr ? '#38bdf8' : 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = isPtr ? 2 : 1;\n    ctx.fillRect(bx, by, 48, 46); ctx.strokeRect(bx, by, 48, 46);\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';\n    ctx.fillText('[' + i + ']', bx + 24, by + 13);\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px monospace';\n    ctx.fillText(fmt(st.d[i]), bx + 24, by + 32);\n    if (isPtr) {\n      ctx.fillStyle = '#38bdf8'; ctx.font = 'bold 10px monospace';\n      ctx.fillText('▲ i0=' + i, bx + 24, by + 58);\n    }\n  }\n\n  ctx.fillStyle = '#10b981'; ctx.font = 'bold 12px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText('程序内存系数区 coef[0..4] (DAG8)', 16, 120);\n  for (var j = 0; j < 5; j++) {\n    var cx = 16 + j * 52, cy = 130;\n    var isP8 = (j === st.i8);\n    ctx.fillStyle = isP8 ? 'rgba(16,185,129,0.18)' : 'rgba(255,255,255,0.03)';\n    ctx.strokeStyle = isP8 ? '#10b981' : 'rgba(255,255,255,0.16)';\n    ctx.lineWidth = isP8 ? 2 : 1;\n    ctx.fillRect(cx, cy, 48, 46); ctx.strokeRect(cx, cy, 48, 46);\n    ctx.fillStyle = '#94a3b8'; ctx.font = '10px monospace'; ctx.textAlign = 'center';\n    ctx.fillText('[' + j + ']', cx + 24, cy + 13);\n    ctx.fillStyle = '#f8fafc'; ctx.font = 'bold 11px monospace';\n    ctx.fillText(fmt(c[j]), cx + 24, cy + 32);\n    if (isP8) {\n      ctx.fillStyle = '#10b981'; ctx.font = 'bold 10px monospace';\n      ctx.fillText('▲ i8=' + j, cx + 24, cy + 58);\n    }\n  }\n\n  ctx.fillStyle = 'rgba(245,158,11,0.12)';\n  ctx.strokeStyle = 'rgba(245,158,11,0.5)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(295, 12, 410, 34); ctx.strokeRect(295, 12, 410, 34);\n  ctx.fillStyle = '#f59e0b'; ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';\n  ctx.fillText('Line ' + st.line + ' | ' + st.asm, 303, 33);\n\n  var ops = st.ops;\n  function has(k) { return ops.indexOf(k) !== -1; }\n\n  drawBox(295, 58, 92, 38, 'r0 (定点32位)', st.r0, has('rx->r0') ? '#f59e0b' : null);\n  drawBox(399, 58, 92, 38, 'f0 (浮点样本)', fmt(st.f0), (has('r0->f0') || has('f0->dm')) ? '#f59e0b' : null);\n  drawBox(503, 58, 92, 38, 'f2 (dm读取)', fmt(st.f2), has('dm->f2') ? '#38bdf8' : null);\n  drawBox(607, 58, 98, 38, 'f4 (pm读取)', fmt(st.f4), has('pm->f4') ? '#10b981' : null);\n\n  drawBox(295, 114, 126, 40, 'f8 = f2 * f4 (乘法)', fmt(st.f8), has('mul') ? '#ec4899' : null);\n  drawBox(435, 114, 136, 40, 'f12 = f8 + f12 (累加)', fmt(st.f12), has('acc') ? '#ec4899' : null);\n  drawBox(585, 114, 120, 40, 'r8 -> tx_buf (输出)', st.r8, has('f12->tx') ? '#f59e0b' : null);\n\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.fillRect(295, 168, 410, 34);\n  ctx.fillStyle = '#f8fafc'; ctx.font = '12px sans-serif'; ctx.textAlign = 'left';\n  ctx.fillText(st.desc, 303, 189);\n\n  var parCount = ops.length;\n  ctx.fillStyle = parCount >= 4 ? '#ec4899' : '#94a3b8';\n  ctx.font = 'bold 11px monospace'; ctx.textAlign = 'left';\n  ctx.fillText('本拍并发操作数: ' + parCount + (parCount >= 4 ? ' (单周期四合一极限效率!)' : ''), 16, 224);\n\n  lab.setReadout('步骤 ' + stepIdx + '/11 (Line ' + st.line + ') | i0=' + st.i0 + ', i8=' + st.i8 + ' | 累加器 f12=' + fmt(st.f12) + ' | ' + st.desc);\n}\n\nlab.onUpdate(function() {\n  if (!lab.values.autoPlay) {\n    autoStep = lab.values.step;\n    renderStep(lab.values.step);\n  } else {\n    renderStep(autoStep);\n  }\n});\n\nlab.onLoop(function(dt) {\n  if (!lab.values.autoPlay) return;\n  autoTimer += dt;\n  if (autoTimer >= 0.95) {\n    autoTimer = 0;\n    autoStep = (autoStep + 1) % 12;\n    renderStep(autoStep);\n  }\n});\n\nrenderStep(lab.values.step);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "16 位 codec 符号对齐陷阱：AD1847 送来的是 16 位定点数，而 SHARC 寄存器是 32 位，转换成浮点前必须先 `lshift r0 by 16` 左移对齐最高位（MSB），输出时再 `lshift r8 by -16` 右移还原，否则正负号和幅度全乱。",
        "r 与 f 共用物理寄存器：`r0` 和 `f0` 指的是同一个 0 号硬件寄存器！执行 `f0 = float r0 by r1;` 后，原来的整数 `r0` 已被浮点结果覆盖。",
        "为何循环次数是 `NR_COEF - 2`：因为流水线预装指令（第 38、39 行）提前吃掉了前两次取数与第一次乘法，循环结束后再用第 44~45 行完成最后两拍收尾；少写或多写 1 次都会导致结果缺项或相位错位。",
        "`rti(db)` 延迟分支的妙用与风险：带 `(db)` 的中断返回指令会先执行紧随其后的**两条**指令再跳回主程序，写代码时千万别在它后面误放下一段程序的无关指令。",
        "301 点对称滤波器等于零失真固定延迟：只要系统逐样本实时运行，对称中心在 150 的核必然带来精准的 150 样本线性相位延迟（8 kHz 下即 18.75 ms）。"
      ]
    }
  ]
});
