window.__BOOK_REGISTER_SECTION__("sec_202", {
  "title": "数字信号处理器的内部架构 (Architecture of the Digital Signal Processor)",
  "intuition": "DSP 之所以能比通用 CPU 快几十倍，核心秘密在于用多总线、指令缓存、硬件循环缓冲和影子寄存器，把“取指令、取数据、乘法、累加、改指针”全部压缩到同一个时钟周期内并行完成。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 内存瓶颈与三大总线架构演进：冯·诺依曼、哈佛与超级哈佛",
      "paragraphs": [
        "在执行卷积或滤波等 DSP 算法时，最大的性能瓶颈往往不是算术计算本身，而是**在处理器（CPU）与内存之间搬运信息**。每次执行一次最简单的乘法操作（例如计算信号样本与滤波器系数的乘积），CPU 都必须从内存中取出 **3 个二进制值**：两个待相乘的数据（输入样本 `x[n]` 和滤波器系数 `h[k]`），以及一条告诉 CPU 该做什么的**程序指令**。",
        "**冯·诺依曼架构（Von Neumann Architecture）**：传统微处理器采用单一内存和单一总线同时存放并传输数据与指令。要完成一次两数相乘，单条总线必须分时复用，至少花费 **3 个时钟周期**才能把指令和两个操作数全部取到 CPU 中（这里还不算结果写回，因为累加结果通常留在 CPU 内部）。对于串行任务这很经济，但面对实时信号处理则过于缓慢。",
        "**哈佛架构（Harvard Architecture）**：为突破单总线瓶颈，哈佛架构将**程序内存**（只存指令）和**数据内存**（只存数据）物理分离，并配备两套完全独立的总线（PM 总线和 DM 总线）。这样 CPU 可以在同一个时钟周期内**同时**抓取一条指令和一个数据，绝大多数现代 DSP 都以此为基础。",
        "**超级哈佛架构（Super Harvard Architecture，简称 SHARC®）**：Analog Devices 在 ADSP-2106x / ADSP-211xx 系列中进一步升级了哈佛架构。基础哈佛架构的痛点在于“数据总线比程序总线忙”（乘法需要 2 个数据、仅 1 条指令）。SHARC 巧妙地把部分数据（如滤波器系数，称为**辅助数据 secondary data**）搬到程序内存中，同时在 CPU 内部加入了**指令缓存（Instruction Cache，可存约 32 条最近指令）**和专用 **I/O 控制器**。由于 DSP 核心运算总是在循环中重复执行相同的几条指令，除了首次进入循环外，后续每次循环的指令都直接从缓存读取——于是在**单个时钟周期**内，DM 总线取输入样本、PM 总线取系数、指令缓存送出指令，三路齐发！这就是极高的**存储器访问带宽**。"
      ],
      "formula": {
        "expr": "T_fetch(VN) = 3N  |  T_fetch(Harvard) = 2N  |  T_fetch(SHARC) = 2 + (N - 1) = N + 1",
        "explain": "对于 N 阶 FIR 滤波循环：冯·诺依曼每次乘加需 3 次串行总线传输；哈佛架构因数据总线需传 2 个数仍需 2 周期/次；SHARC 仅第 1 次循环因 PM 总线冲突耗时 2 周期，随后 N-1 次全部命中指令缓存，实现 1 周期/次！"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：三大处理器总线与指令缓存流水线仿真",
      "instruction": "切换架构模式（1: 冯·诺依曼 / 2: 哈佛 / 3: SHARC）与滤波器抽头数 N，观察数据与指令数据包在总线上的并发搬运与总周期加速比。",
      "controls": [
        {
          "type": "slider",
          "id": "arch",
          "label": "架构模式 (1:冯·诺依曼 2:哈佛 3:SHARC)",
          "min": 1,
          "max": 3,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "taps",
          "label": "FIR 滤波器抽头数 N",
          "min": 4,
          "max": 100,
          "step": 4,
          "value": 32,
          "unit": " 阶"
        },
        {
          "type": "toggle",
          "id": "useCache",
          "label": "SHARC 启用指令缓存与系数重定位",
          "value": true
        },
        {
          "type": "toggle",
          "id": "animate",
          "label": "开启总线数据包动画",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet phase = 0;\n\nfunction drawGrid() {\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < W; x += 24) {\n    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();\n  }\n  for (let y = 0; y < H; y += 24) {\n    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();\n  }\n}\n\nfunction drawBox(x, y, w, h, title, sub, strokeCol, fillCol) {\n  ctx.fillStyle = fillCol || 'rgba(15, 23, 42, 0.9)';\n  ctx.strokeStyle = strokeCol;\n  ctx.lineWidth = 1.8;\n  ctx.fillRect(x, y, w, h);\n  ctx.strokeRect(x, y, w, h);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, x + w / 2, y + h / 2 - (sub ? 4 : -4));\n  if (sub) {\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText(sub, x + w / 2, y + h / 2 + 12);\n  }\n}\n\nfunction drawBus(x1, y1, x2, y2, label, col, active, pktT, pktText) {\n  ctx.strokeStyle = active ? col : 'rgba(148,163,184,0.3)';\n  ctx.lineWidth = active ? 2.8 : 1.5;\n  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();\n  const dir = x2 >= x1 ? 1 : -1;\n  ctx.fillStyle = active ? col : 'rgba(148,163,184,0.4)';\n  ctx.beginPath();\n  ctx.moveTo(x2, y2);\n  ctx.lineTo(x2 - dir * 7, y2 - 4);\n  ctx.lineTo(x2 - dir * 7, y2 + 4);\n  ctx.closePath();\n  ctx.fill();\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(label, (x1 + x2) / 2, y1 - 8);\n  if (active && pktT >= 0 && pktT <= 1) {\n    const px = x1 + (x2 - x1) * pktT;\n    const py = y1 + (y2 - y1) * pktT;\n    ctx.fillStyle = col;\n    ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();\n    ctx.fillStyle = '#0f172a';\n    ctx.font = 'bold 9px sans-serif';\n    ctx.fillText(pktText, px, py - 10);\n  }\n}\n\nfunction render() {\n  const arch = Math.round(lab.values.arch);\n  const taps = Math.round(lab.values.taps);\n  const useCache = !!lab.values.useCache;\n  const anim = !!lab.values.animate;\n\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n  drawGrid();\n\n  const t = anim ? (phase % 1) : 0.55;\n  const stepInt = Math.floor(phase);\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  const titles = ['', 'a. 冯·诺依曼架构 (单内存 / 单总线)', 'b. 哈佛架构 (双内存 / 双总线)', 'c. 超级哈佛架构 SHARC (缓存 + DMA)'];\n  ctx.fillText(titles[arch], 16, 22);\n\n  if (arch === 1) {\n    const sub = stepInt % 3;\n    const labels = ['Inst指令', '样本 x[n]', '系数 h[k]'];\n    const cols = ['#ec4899', '#38bdf8', '#f59e0b'];\n    drawBox(24, 65, 130, 96, '统一内存 Memory', '程序指令 + 数据混存', '#94a3b8');\n    drawBox(300, 75, 130, 76, 'CPU 核心', '串行等待取数', '#38bdf8');\n    drawBus(154, 113, 300, 113, '单一共享总线 (周期 ' + (sub + 1) + '/3)', cols[sub], true, t, labels[sub]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('瓶颈：每做1次乘法，单总线必须分 3 个周期依次搬运！', 24, 195);\n  } else if (arch === 2) {\n    const sub = stepInt % 2;\n    drawBox(20, 62, 110, 88, '程序内存 PM', '仅存放程序指令', '#ec4899');\n    drawBox(182, 62, 100, 88, 'CPU 核心', '双总线并行', '#38bdf8');\n    drawBox(344, 62, 110, 88, '数据内存 DM', '样本x + 系数h', '#f59e0b');\n    drawBus(130, 106, 182, 106, 'PM 总线', '#ec4899', sub === 0, t, 'Inst');\n    drawBus(344, 106, 282, 106, 'DM 总线', '#38bdf8', true, t, sub === 0 ? 'x[n]' : 'h[k]');\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(sub === 0 ? '周期 1/2：PM 取指令 与 DM 取样本 x[n] 同时发生' : '周期 2/2：PM 闲置，DM 继续搬运第二个操作数 h[k]', 20, 185);\n  } else {\n    const cachedPass = useCache && (stepInt % 4 !== 0);\n    const firstPassSub = stepInt % 2;\n    drawBox(18, 56, 112, 86, '程序内存 PM', useCache ? '指令 + 系数 h[k]' : '仅指令', '#ec4899');\n    drawBox(178, 48, 116, 60, 'CPU 核心', '并行乘加单元', '#10b981');\n    drawBox(178, 112, 116, 40, '指令缓存 Cache', cachedPass ? '命中! (32条)' : (useCache ? '首次加载' : '未启用'), cachedPass ? '#10b981' : '#64748b');\n    drawBox(342, 56, 112, 62, '数据内存 DM', useCache ? '仅样本 x[n]' : 'x[n] + h[k]', '#38bdf8');\n    drawBox(342, 134, 112, 46, 'I/O 控制器 (DMA)', '240MB/s 直传', '#f59e0b');\n    ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(398, 134); ctx.lineTo(398, 118); ctx.stroke();\n    if (useCache) {\n      if (cachedPass) {\n        drawBus(130, 82, 178, 82, 'PM总线', '#f59e0b', true, t, 'h[k]');\n        drawBus(342, 82, 294, 82, 'DM总线', '#38bdf8', true, t, 'x[n]');\n        ctx.fillStyle = '#10b981';\n        ctx.font = 'bold 11px sans-serif';\n        ctx.fillText('单周期满载！Cache送指令 + PM送系数 + DM送样本 同时完成', 18, 204);\n      } else {\n        drawBus(130, 82, 178, 82, 'PM冲突', '#ec4899', true, t, firstPassSub === 0 ? 'Inst' : 'h[k]');\n        drawBus(342, 82, 294, 82, 'DM总线', '#38bdf8', firstPassSub === 0, t, 'x[n]');\n        ctx.fillStyle = '#f59e0b';\n        ctx.font = '11px sans-serif';\n        ctx.fillText('首次进入循环：指令须走 PM 总线，与系数发生冲突 (仅第1次)', 18, 204);\n      }\n    } else {\n      drawBus(130, 82, 178, 82, 'PM总线', '#ec4899', firstPassSub === 0, t, 'Inst');\n      drawBus(342, 82, 294, 82, 'DM总线', '#38bdf8', true, t, firstPassSub === 0 ? 'x[n]' : 'h[k]');\n      ctx.fillStyle = '#94a3b8';\n      ctx.font = '11px sans-serif';\n      ctx.fillText('关闭缓存后，性能退化为普通双总线哈佛架构 (2 周期/抽头)', 18, 204);\n    }\n  }\n\n  const cVN = 3 * taps;\n  const cHV = 2 * taps;\n  const cSH = useCache ? (taps + 1) : (2 * taps);\n  const curC = arch === 1 ? cVN : (arch === 2 ? cHV : cSH);\n\n  ctx.fillStyle = 'rgba(30, 41, 59, 0.75)';\n  ctx.fillRect(474, 16, 232, 208);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.strokeRect(474, 16, 232, 208);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'left';\n  ctx.fillText('取指取数周期对比 (' + taps + ' 阶循环)', 486, 38);\n\n  const bars = [\n    { name: '冯·诺依曼', val: cVN, col: '#ec4899', act: arch === 1 },\n    { name: '哈佛架构', val: cHV, col: '#38bdf8', act: arch === 2 },\n    { name: 'SHARC', val: cSH, col: '#10b981', act: arch === 3 }\n  ];\n  const maxV = cVN;\n  bars.forEach((b, i) => {\n    const by = 58 + i * 48;\n    ctx.fillStyle = b.act ? '#f8fafc' : '#94a3b8';\n    ctx.font = b.act ? 'bold 11px sans-serif' : '11px sans-serif';\n    ctx.fillText(b.name + ': ' + b.val + ' 周期', 488, by);\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(488, by + 6, 200, 14);\n    const bw = Math.max(4, (b.val / maxV) * 200);\n    ctx.fillStyle = b.col;\n    ctx.globalAlpha = b.act ? 1.0 : 0.45;\n    ctx.fillRect(488, by + 6, bw, 14);\n    ctx.globalAlpha = 1.0;\n  });\n\n  const speedup = (cVN / curC).toFixed(2);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('当前总线加速比：' + speedup + 'x', 488, 210);\n\n  lab.setReadout('当前架构=' + (arch === 1 ? '冯·诺依曼' : arch === 2 ? '哈佛' : 'SHARC') + ' | ' + taps + '阶取指取数耗时=' + curC + ' 周期 (比冯·诺依曼快 ' + speedup + ' 倍)');\n}\n\nlab.onUpdate(() => { render(); });\nlab.onLoop((dt) => {\n  if (lab.values.animate) {\n    phase += Math.min(dt || 0.016, 0.1) * 1.15;\n  }\n  render();\n});"
    },
    {
      "type": "concept",
      "heading": "2. 高速 I/O、DMA 与 SHARC CPU 内部并行硬件引擎",
      "paragraphs": [
        "DSP 的最高使命只有一句话：**在下一个采样点到达之前，把数据搬进来、算完、再送出去**。为此，SHARC 配备了强大的 **I/O 控制器与直接内存访问（DMA）**：例如在 40 MHz 时钟下，拥有 2 个 40 Mbits/s 串行口和 6 个各 40 Mbytes/s 的并行口（合计 **240 Mbytes/s**，2 毫秒就能传完一整本厚书的文字！）。DMA 让数据流不经过 CPU 寄存器直接进出内存，**不偷走 CPU 哪怕一个时钟周期**；部分 DSP 还将 ADC/DAC 集成在片上，称为**混合信号（Mixed Signal）**器件。",
        "钻进 SHARC CPU 内部（图 28-5），你会看到专为实时滤波与变换打造的四大并行利器：",
        "1. **双数据地址生成器（DAG）与硬件循环缓冲**：PM 和 DM 各配一个 DAG，专门负责生成读写地址。每个 DAG 可硬件管理 **8 个循环缓冲区（Circular Buffers）**，无需 CPU 软件判断边界回绕（零开销），还能为快速傅里叶变换（FFT）直接生成**位反转（bit-reversed）地址**。",
        "2. **16 个 40 位通用数据寄存器 + 三大独立数学单元**：算术区被拆分为**乘法器**（内置 80 位累加器以消除定点连乘舍入误差）、**算术逻辑单元（ALU）**和**桶形移位器（Barrel Shifter）**。最惊艳的是，乘法器与 ALU 可以**在单周期内并行访问**：寄存器 `R0–R7` 送入乘法器，同时 `R8–R15` 送入 ALU，两路结果同时写回任意寄存器。",
        "3. **影子寄存器（Shadow Registers）实现单周期中断切换**：传统 CPU 遇到中断必须把所有寄存器逐个压栈保存；SHARC 为所有关键寄存器配备了影子副本，中断一来只需**1 个时钟周期**就能全体切换，处理完毕 1 周期恢复。",
        "综合所有并行能力：对于一个 **100 阶 FIR 滤波器**，SHARC 在单周期内就能同步完成乘法、加法、2 次数据搬运、2 个循环指针更新和循环控制，每样本总耗时仅约 **105～110 个时钟周期**（100 次循环 + 极少量首尾开销），而传统微处理器则需要数千个周期！"
      ],
      "formula": {
        "expr": "T_FIR(100-tap) ≈ 100 (单周期并行循环) + 5~10 (首尾开销) = 105 ~ 110 cycles/sample",
        "explain": "在单周期内同时并发执行：步骤 11(乘) + 步骤 12(加) + 步骤 7/9(双数据移动) + 步骤 8/10(双指针更新) + 步骤 6(循环控制)。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：双 DAG 循环缓冲与并行乘加 / 影子寄存器仿真",
      "instruction": "调节循环缓冲区长度 N 与推进速度，观察双 DAG 指针如何零开销回绕驱动并行乘加；点击“触发中断”开关体验传统压栈阻塞与 SHARC 影子寄存器单周期切换的天壤之别（可开启声音听时钟节拍）。",
      "controls": [
        {
          "type": "slider",
          "id": "bufSize",
          "label": "循环缓冲区长度 N",
          "min": 4,
          "max": 16,
          "step": 1,
          "value": 8,
          "unit": " 点"
        },
        {
          "type": "slider",
          "id": "speed",
          "label": "仿真时钟速率",
          "min": 1,
          "max": 8,
          "step": 1,
          "value": 3,
          "unit": " Hz"
        },
        {
          "type": "toggle",
          "id": "interrupt",
          "label": "触发采样就绪中断 (对比压栈 vs 影子寄存器)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 开启时钟节拍与回绕提示音",
          "activeLabel": "⏸ 暂停声音"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nlet accumTime = 0;\nlet stepIdx = 0;\nlet lastAudioStep = -1;\n\nfunction beep(freq, dur, gainVal) {\n  try {\n    const ac = lab.getAudioContext();\n    if (!ac) return;\n    if (ac.state === 'suspended') ac.resume();\n    const now = ac.currentTime;\n    const osc = ac.createOscillator();\n    const g = ac.createGain();\n    osc.type = 'sine';\n    osc.frequency.setValueAtTime(freq, now);\n    g.gain.setValueAtTime(gainVal, now);\n    g.gain.exponentialRampToValueAtTime(0.0005, now + dur);\n    osc.connect(g);\n    g.connect(ac.destination);\n    osc.start(now);\n    osc.stop(now + dur + 0.01);\n  } catch (e) {}\n}\n\nfunction drawRing(cx, cy, r, N, activeIdx, title, prefix, col) {\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(title, cx, cy - r - 18);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();\n\n  for (let i = 0; i < N; i++) {\n    const ang = -Math.PI / 2 + (i / N) * Math.PI * 2;\n    const nx = cx + Math.cos(ang) * r;\n    const ny = cy + Math.sin(ang) * r;\n    const isAct = (i === activeIdx);\n    ctx.fillStyle = isAct ? col : '#1e293b';\n    ctx.strokeStyle = isAct ? '#f8fafc' : col;\n    ctx.lineWidth = isAct ? 2 : 1;\n    ctx.beginPath(); ctx.arc(nx, ny, isAct ? 10 : 7, 0, Math.PI * 2); ctx.fill(); ctx.stroke();\n    ctx.fillStyle = isAct ? '#090d16' : '#cbd5e1';\n    ctx.font = isAct ? 'bold 9px sans-serif' : '8px sans-serif';\n    ctx.fillText(i, nx, ny + 3);\n\n    if (isAct) {\n      ctx.strokeStyle = col;\n      ctx.lineWidth = 2;\n      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(nx * 0.72 + cx * 0.28, ny * 0.72 + cy * 0.28); ctx.stroke();\n    }\n  }\n  ctx.fillStyle = col;\n  ctx.font = 'bold 10px sans-serif';\n  ctx.fillText(prefix + '[' + activeIdx + ']', cx, cy + 4);\n}\n\nfunction render() {\n  const N = Math.round(lab.values.bufSize);\n  const idx = stepIdx % N;\n  const intr = !!lab.values.interrupt;\n\n  ctx.fillStyle = '#090d16';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x < W; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y < H; y += 24) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  drawRing(92, 122, 56, N, idx, 'DM DAG 循环缓冲 (x)', 'x', '#38bdf8');\n  drawRing(248, 122, 56, N, idx, 'PM DAG 循环缓冲 (h)', 'h', '#f59e0b');\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('指针模 ' + N + ' 硬件自动回绕 (0额外周期)', 170, 214);\n\n  ctx.strokeStyle = 'rgba(16, 185, 129, 0.5)';\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';\n  ctx.fillRect(342, 34, 174, 178);\n  ctx.strokeRect(342, 34, 174, 178);\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('单周期并行运算引擎', 429, 52);\n\n  ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';\n  ctx.fillRect(354, 64, 150, 42);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.strokeRect(354, 64, 150, 42);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.fillText('乘法器 (R0-R7)', 429, 80);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('P = x[' + idx + '] * h[' + idx + ']', 429, 96);\n\n  ctx.fillStyle = 'rgba(245, 158, 11, 0.16)';\n  ctx.fillRect(354, 118, 150, 42);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.strokeRect(354, 118, 150, 42);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('ALU 单元 (R8-R15)', 429, 134);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('Acc += P (80位累加)', 429, 150);\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('✓ 乘+加+双移+双指针 1周期完成', 429, 196);\n\n  ctx.fillStyle = 'rgba(30, 41, 59, 0.78)';\n  ctx.fillRect(530, 34, 176, 178);\n  ctx.strokeStyle = intr ? '#ec4899' : 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = intr ? 2 : 1;\n  ctx.strokeRect(530, 34, 176, 178);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('中断上下文切换监视', 618, 52);\n\n  if (!intr) {\n    ctx.fillStyle = '#10b981';\n    ctx.font = '11px sans-serif';\n    ctx.fillText('当前：主循环流畅运行', 618, 92);\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('主寄存器组：激活中', 618, 120);\n    ctx.fillText('影子寄存器组：待命备份', 618, 140);\n    ctx.fillText('可开启上方开关模拟中断', 618, 175);\n  } else {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px sans-serif';\n    ctx.fillText('⚡ 采样就绪中断到来！', 618, 76);\n    ctx.textAlign = 'left';\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '10px sans-serif';\n    ctx.fillText('传统 CPU (逐个压栈):', 542, 102);\n    ctx.fillStyle = '#ec4899';\n    ctx.fillRect(542, 108, 150, 14);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 9px sans-serif';\n    ctx.fillText('阻塞 16+ 周期 (逐一入栈)', 546, 118);\n\n    ctx.font = '10px sans-serif';\n    ctx.fillText('SHARC (影子寄存器):', 542, 146);\n    ctx.fillStyle = '#10b981';\n    ctx.fillRect(542, 152, 16, 14);\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 10px sans-serif';\n    ctx.fillText('1 周期瞬间切换！', 564, 163);\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '9px sans-serif';\n    ctx.fillText('全套副本一键对调，零压栈开销', 542, 192);\n  }\n\n  lab.setReadout('当前循环指针 idx=' + idx + '/' + (N - 1) + (idx === 0 ? ' (已自动回绕!)' : '') + ' | 并行执行: x[' + idx + ']*h[' + idx + '] & Acc累加 | 中断状态: ' + (intr ? '影子寄存器1周期切换' : '正常'));\n}\n\nlab.onUpdate(() => {\n  if (lab.values.play) {\n    const ac = lab.getAudioContext();\n    if (ac && ac.state === 'suspended') ac.resume();\n  }\n  render();\n});\n\nlab.onLoop((dt) => {\n  const safeDt = Math.min(dt || 0.016, 0.1);\n  accumTime += safeDt * lab.values.speed;\n  const newStep = Math.floor(accumTime);\n  if (newStep !== stepIdx) {\n    stepIdx = newStep;\n    if (lab.values.play && stepIdx !== lastAudioStep) {\n      lastAudioStep = stepIdx;\n      const N = Math.round(lab.values.bufSize);\n      const isWrap = (stepIdx % N) === 0;\n      if (lab.values.interrupt) {\n        beep(isWrap ? 880 : 523.25, 0.05, 0.045);\n      } else {\n        beep(isWrap ? 784 : 440, 0.035, 0.04);\n      }\n    }\n  }\n  render();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1：哈佛架构并不等于“绝对单周期”。若将输入样本和滤波器系数都塞进数据内存（DM），数据总线仍需 2 个周期；必须配合把系数重定位到程序内存（PM）以及 CPU 指令缓存，才能实现 SHARC 级别的 1 周期/抽头峰值带宽。",
        "避坑 2：不要把高主频等同于高 DSP 吞吐量。传统通用 CPU 即使主频高，若缺乏硬件循环缓冲（DAG）、并行乘加和 DMA，做一次 100 阶 FIR 仍需数千周期（指针越界判断和中断压栈就会吃掉大量时间）。",
        "核心速记 1：冯·诺依曼 = 单内存单总线（3 周期取数）；哈佛 = 双内存双总线；SHARC（超级哈佛）= 双内存 + 指令缓存 + DMA + 双 DAG 循环缓冲 + 影子寄存器。",
        "核心速记 2：在 SHARC 上写紧凑循环时，尽量让算法核心循环控制在指令缓存容量（约 32 条指令）以内，这样除首次迭代外，后续循环几乎都能跑满 100% 硬件并行度。"
      ]
    }
  ]
});
