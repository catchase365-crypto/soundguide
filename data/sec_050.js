window.__BOOK_REGISTER_SECTION__("sec_050", {
  "title": "程序执行速度：核心编程优化技巧 (Execution Speed: Programming Tips)",
  "intuition": "硬件和编程语言无法天天更换，但只要改用整数运算、避免超越函数、预存查表法（LUT）并远离逐字节/打印等慢速 I/O 陷阱，就能把程序速度提升十倍甚至上千倍。",
  "blocks": [
    {
      "type": "concept",
      "heading": "第一条铁律：能用整数，绝不用浮点数（警惕整数除法陷阱）",
      "paragraphs": [
        "计算机硬件和编程语言固然决定了性能上限，但它们并不是你每天都能随意更换的东西；相比之下，**你的编程写法随时可以改变**，而且对运行耗时有立竿见影的影响。",
        "在可能的情况下，尽量使用**整型变量（Integer）**替代**浮点型变量（Floating Point）**。在常规微处理器（如个人电脑 CPU）上，整数运算比浮点运算快 **10 到 20 倍**；而在没有硬件数学协处理器（FPU）的嵌入式系统上，两者的速度差距甚至高达 **200 比 1**。",
        "**但有一个致命例外：整数除法！** 在许多系统和编译器中，整数除法底层是通过先将操作数转换为浮点数、做完除法再转回整数来实现的。这使得整数除法相比加、减、乘等其他整数运算慢得令人发指（参见原书 Table 4-6）。因此在关键循环中，应尽量避免直接做除法。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "第二条铁律：远离 sin(x)、log(x)、y^x 等超越函数",
      "paragraphs": [
        "尽量避免在高频循环中调用 `sin(x)`、`log(x)`、`y^x` 等函数。这类**超越函数（Transcendental Functions）**在计算机底层并不是一步算出的，而是展开成一长串加法、减法和乘法的无穷级数来逼近——最典型的就是**麦克劳林幂级数（Maclaurin Power Series）**。",
        "虽然级数理论上是无限长的，但后面的高次项会迅速变小直到可以忽略（例如 `sin(1) = 1 - 0.166666 + 0.008333 - 0.000198 + 0.000002 - ...`）。即便如此，计算一次超越函数的耗时大约仍是单次加法或乘法的 **10 倍左右**。",
        "更糟糕的是，大多数编程语言只直接提供少数基础超越函数（如 `ATN`、`LOG`、`EXP`、`SIN`、`COS`、`TAN`、`SQR`），像正割 `Secant`、反正弦 `Arc Sine`、双曲函数 `Hyperbolic` 或 `LOG10(X)` 等罕见函数，都需要通过三角/对数恒等式（原书 Table 4-7）由基础函数推导组合出来，例如 `Arc Sine(X) = ATN(X/SQR(1-X*X))`，速度会**慢上加慢**。",
        "**实用绕过技巧**：能用乘法展开就别用幂函数，例如 `x^3` 直接写成 `x * x * x`；当 `x` 很小时，直接利用小角度近似 `sin(x) ≈ x`；利用奇偶对称性 `sin(-x) = -sin(x)` 避免重复计算。"
      ],
      "formula": {
        "expr": "sin(x) = x - x³/3! + x⁵/5! - x⁷/7! + x⁹/9! - ...  |  cos(x) = 1 - x²/2! + x⁴/4! - ...  |  e^x = 1 + x + x²/2! + x³/3! + ...",
        "explain": "x 为输入弧度（或指数），n! 为阶乘。计算机必须逐项累乘与加减，直到新增项小到不影响精度为止，这就是它比单次乘加慢约 10 倍的根本原因。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：麦克劳林级数逼近与小角度近似误差分析",
      "instruction": "拖动「输入弧度 x」与「级数展开项数 N」，观察绿线（级数逼近）如何贴合蓝线（精确 sin(x)），并对比虚线（小角度近似 sin(x)≈x）在零点附近的适用范围。",
      "controls": [
        {
          "type": "slider",
          "id": "xVal",
          "label": "输入弧度 x",
          "min": -3.14,
          "max": 3.14,
          "step": 0.02,
          "value": 1,
          "unit": " rad"
        },
        {
          "type": "slider",
          "id": "terms",
          "label": "级数展开项数 N",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 3,
          "unit": " 项"
        },
        {
          "type": "toggle",
          "id": "showLinear",
          "label": "显示小角度近似 (sin x ≈ x)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction fact(n) {\n  let r = 1;\n  for (let i = 2; i <= n; i++) r *= i;\n  return r;\n}\n\nfunction maclaurinSin(x, nTerms) {\n  let sum = 0;\n  for (let k = 0; k < nTerms; k++) {\n    const p = 2 * k + 1;\n    const sign = (k % 2 === 0) ? 1 : -1;\n    sum += sign * Math.pow(x, p) / fact(p);\n  }\n  return sum;\n}\n\nfunction draw() {\n  const xCur = lab.values.xVal;\n  const nTerms = Math.round(lab.values.terms);\n  const showLinear = lab.values.showLinear;\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const padL = 55, padR = 25, padT = 24, padB = 28;\n  const plotW = W - padL - padR;\n  const plotH = H - padT - padB;\n  const xMin = -Math.PI, xMax = Math.PI;\n  const yMin = -1.6, yMax = 1.6;\n\n  const toX = x => padL + ((x - xMin) / (xMax - xMin)) * plotW;\n  const toY = y => padT + ((yMax - y) / (yMax - yMin)) * plotH;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = -3; gx <= 3; gx++) {\n    const px = toX(gx);\n    ctx.beginPath(); ctx.moveTo(px, padT); ctx.lineTo(px, padT + plotH); ctx.stroke();\n  }\n  for (let gy = -1.5; gy <= 1.5; gy += 0.5) {\n    const py = toY(gy);\n    ctx.beginPath(); ctx.moveTo(padL, py); ctx.lineTo(padL + plotW, py); ctx.stroke();\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.beginPath();\n  ctx.moveTo(padL, toY(0)); ctx.lineTo(padL + plotW, toY(0));\n  ctx.moveTo(toX(0), padT); ctx.lineTo(toX(0), padT + plotH);\n  ctx.stroke();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.55)';\n  ctx.font = '11px monospace';\n  ctx.fillText('1.0', 22, toY(1) + 4);\n  ctx.fillText('0.0', 22, toY(0) + 4);\n  ctx.fillText('-1.0', 16, toY(-1) + 4);\n  ctx.fillText('-π', toX(-Math.PI) - 6, H - 8);\n  ctx.fillText('0', toX(0) - 3, H - 8);\n  ctx.fillText('+π', toX(Math.PI) - 8, H - 8);\n\n  if (showLinear) {\n    ctx.save();\n    ctx.setLineDash([5, 5]);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.lineWidth = 1.8;\n    ctx.beginPath();\n    let started = false;\n    for (let i = 0; i <= 200; i++) {\n      const xv = xMin + (i / 200) * (xMax - xMin);\n      if (xv >= yMin && xv <= yMax) {\n        const px = toX(xv), py = toY(xv);\n        if (!started) { ctx.moveTo(px, py); started = true; }\n        else ctx.lineTo(px, py);\n      }\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  for (let i = 0; i <= 240; i++) {\n    const xv = xMin + (i / 240) * (xMax - xMin);\n    const yv = Math.sin(xv);\n    const px = toX(xv), py = toY(yv);\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  let penDown = false;\n  for (let i = 0; i <= 240; i++) {\n    const xv = xMin + (i / 240) * (xMax - xMin);\n    const yv = maclaurinSin(xv, nTerms);\n    if (yv < yMin - 0.5 || yv > yMax + 0.5) {\n      penDown = false;\n      continue;\n    }\n    const px = toX(xv), py = toY(yv);\n    if (!penDown) { ctx.moveTo(px, py); penDown = true; }\n    else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const trueY = Math.sin(xCur);\n  const approxY = maclaurinSin(xCur, nTerms);\n  const clampedApprox = Math.max(yMin, Math.min(yMax, approxY));\n  const pxCur = toX(xCur);\n\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(pxCur, toY(trueY));\n  ctx.lineTo(pxCur, toY(clampedApprox));\n  ctx.stroke();\n\n  ctx.fillStyle = '#38bdf8';\n  ctx.beginPath(); ctx.arc(pxCur, toY(trueY), 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = '#10b981';\n  ctx.beginPath(); ctx.arc(pxCur, toY(clampedApprox), 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.font = '12px sans-serif';\n  ctx.fillStyle = '#38bdf8'; ctx.fillText('— 精确值 sin(x)', 66, 18);\n  ctx.fillStyle = '#10b981'; ctx.fillText('— 麦克劳林 ' + nTerms + ' 项近似', 185, 18);\n  if (showLinear) {\n    ctx.fillStyle = '#f59e0b'; ctx.fillText('-- 小角度近似 y = x', 340, 18);\n  }\n  ctx.fillStyle = '#ec4899'; ctx.fillText('误差线', 495, 18);\n\n  const err = Math.abs(trueY - approxY);\n  const linErr = Math.abs(trueY - xCur);\n  const ops = nTerms === 1 ? 0 : (nTerms * 2 + 1);\n  lab.setReadout(\n    `x = ${xCur.toFixed(2)} rad | 精确 sin(x) = ${trueY.toFixed(6)} | ${nTerms}项级数 = ${approxY.toFixed(6)} | 级数误差 = ${err.toExponential(2)} | 线性误差 = ${linErr.toFixed(4)} | 约需 ${ops} 次乘加`\n  );\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "空间换时间的终极武器：查找表（Look-Up Table, LUT）",
      "paragraphs": [
        "对付慢速复杂函数的另一种经典做法，是**事先把所有可能的结果算好，存进查找表（LUT）里**。系统运行时不再做任何数学计算，而是直接把输入值当作数组下标去“查答案”。",
        "以原书中的工程实例说明：假设你有一个 **8-bit 数据采集系统**，用来持续监测电阻两端的电压，而你真正关心的是电阻消耗的**功率** `P = V² / R`。由于 8-bit 采样值只有 `0` 到 `255` 这 **256 种**可能结果，你完全可以在程序初始化时，先把这 256 个电压对应的功率全部算好存入一个长度为 256 的数组 `LUT[0..255]` 中。",
        "当系统实时运行时，采集到的数字电压直接作为下标去索引 `LUT[V]`，瞬间得到功率值，彻底省去了平方和除法运算。在实时 DSP 系统中，**查找表法比直接现场计算快上数百倍**！"
      ],
      "formula": {
        "expr": "P = V² / R   ==>   P = LUT[ V_digital ]  (V_digital ∈ 0..255)",
        "explain": "V_digital 是 8-bit ADC 采样得到的整数（0~255），R 为已知电阻。预先计算 256 个功率值存入内存数组 LUT，运行时只需 O(1) 内存寻址即可完成计算。"
      }
    },
    {
      "type": "concept",
      "heading": "第三条铁律：摸清当前系统的「快操作」与「慢操作」（I/O 与图形陷阱）",
      "paragraphs": [
        "最后一条建议是：**通过实战经验和性能测试，搞清楚你当前所用系统的哪些指令快、哪些指令慢**——因为结果往往会让你大吃一惊。尤其需要重点盯防**图形绘制指令**和**输入/输出（I/O）操作**，同一个目标通常有多种写法，速度却天差地别：",
        "1. **批量内存传输 vs 逐字节读取**：例如在 BASIC 中，使用 `BLOAD` 命令可以将整个数据文件直接高速映射到一段内存中；如果换成自己写循环逐字节（byte-by-byte）读取同一个文件，耗时可能会慢 **100 倍**。",
        "2. **硬件/系统加速绘图 vs 逐像素描点**：用 BASIC 的 `LINE` 命令直接在屏幕上画一个彩色矩形框，速度极快；如果用循环逐像素（pixel-by-pixel）填充同一个框，耗时同样会暴涨 **100 倍**。",
        "3. **绝对不要在循环里放 `print` 语句！** 很多人为了监控循环进度，喜欢在循环体内部顺手加一句屏幕打印输出。这种高频 I/O 阻塞会把整个程序的执行速度拖慢**成千上万倍**！"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：8-bit ADC 功率查表法 (LUT) 与系统慢操作耗时赛跑",
      "instruction": "左侧拖动「8-bit ADC 电压读数」与「电阻阻值 R」体验 O(1) 内存索引查表；右侧实时动画直观对比 1x（查表/批量操作）、15x（超越函数）、100x（逐字节/逐像素）与 1000x（循环内 Print）的执行速度鸿沟。",
      "controls": [
        {
          "type": "slider",
          "id": "adc",
          "label": "8-bit ADC 电压读数 (0~255)",
          "min": 0,
          "max": 255,
          "step": 1,
          "value": 160,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "res",
          "label": "电阻阻值 R",
          "min": 10,
          "max": 100,
          "step": 5,
          "value": 50,
          "unit": " Ω"
        },
        {
          "type": "toggle",
          "id": "showTraps",
          "label": "开启 100x I/O 与 1000x Print 慢速陷阱对比",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet lut = new Float32Array(256);\nlet lastR = -1;\nlet animTime = 0;\n\nfunction rebuildLut(R) {\n  for (let i = 0; i < 256; i++) {\n    lut[i] = (i * i) / R;\n  }\n  lastR = R;\n}\n\nfunction render() {\n  const adc = Math.round(lab.values.adc);\n  const R = lab.values.res;\n  const showTraps = lab.values.showTraps;\n\n  if (R !== lastR) rebuildLut(R);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.fillStyle = '#0f172a';\n  ctx.fillRect(0, 0, W, H);\n\n  const lx = 48, ly = 28, lw = 285, lh = 172;\n  const maxP = (255 * 255) / R;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let i = 0; i <= 4; i++) {\n    const gy = ly + (i / 4) * lh;\n    ctx.beginPath(); ctx.moveTo(lx, gy); ctx.lineTo(lx + lw, gy); ctx.stroke();\n    const gx = lx + (i / 4) * lw;\n    ctx.beginPath(); ctx.moveTo(gx, ly); ctx.lineTo(gx, ly + lh); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('8-bit 功率查表法: P = LUT[ADC]', lx, 18);\n\n  for (let i = 0; i < 256; i += 4) {\n    const bx = lx + (i / 255) * lw;\n    const bh = (lut[i] / maxP) * lh;\n    ctx.fillStyle = Math.abs(i - adc) < 4 ? '#f59e0b' : 'rgba(16, 185, 129, 0.35)';\n    ctx.fillRect(bx, ly + lh - bh, 3.2, bh);\n  }\n\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let i = 0; i < 256; i++) {\n    const px = lx + (i / 255) * lw;\n    const py = ly + lh - (lut[i] / maxP) * lh;\n    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);\n  }\n  ctx.stroke();\n\n  const curP = lut[adc];\n  const ax = lx + (adc / 255) * lw;\n  const ay = ly + lh - (curP / maxP) * lh;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  ctx.moveTo(ax, ly + lh); ctx.lineTo(ax, ay);\n  ctx.lineTo(lx, ay);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath(); ctx.arc(ax, ay, 5, 0, Math.PI * 2); ctx.fill();\n\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '11px monospace';\n  ctx.fillText('0', lx - 4, ly + lh + 14);\n  ctx.fillText('Index: ' + adc, Math.min(lx + lw - 65, Math.max(lx + 10, ax - 24)), ly + lh + 14);\n  ctx.fillText('255', lx + lw - 18, ly + lh + 14);\n  ctx.fillText(Math.round(maxP) + 'W', 6, ly + 8);\n  ctx.fillText('0W', 16, ly + lh + 4);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(356, 14); ctx.lineTo(356, H - 14); ctx.stroke();\n\n  const rx = 374, rw = 326;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('执行耗时直观对比 (完成同批任务进度)', rx, 18);\n\n  const items = [\n    { name: '整数查表 LUT / BLOAD / LINE (1x)', speed: 0.45, color: '#10b981', tag: '极快 1x' },\n    { name: '浮点运算 / 超越函数 sin(x) (慢15x)', speed: 0.45 / 15, color: '#38bdf8', tag: '慢 15x' }\n  ];\n  if (showTraps) {\n    items.push({ name: '逐字节读取 / 逐像素绘图 (慢100x)', speed: 0.45 / 100, color: '#f59e0b', tag: '慢 100x' });\n    items.push({ name: '循环内加 Print 调试输出 (慢1000x)', speed: 0.45 / 1000, color: '#ec4899', tag: '慢 1000x' });\n  }\n\n  for (let i = 0; i < items.length; i++) {\n    const it = items[i];\n    const rowY = 42 + i * 46;\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px sans-serif';\n    ctx.fillText(it.name, rx, rowY);\n\n    ctx.fillStyle = it.color;\n    ctx.font = 'bold 11px monospace';\n    ctx.fillText(it.tag, rx + rw - 62, rowY);\n\n    const barY = rowY + 8;\n    const barH = 14;\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(rx, barY, rw, barH);\n\n    const prog = (animTime * it.speed) % 1;\n    ctx.fillStyle = it.color;\n    ctx.fillRect(rx, barY, Math.max(2, prog * rw), barH);\n  }\n\n  lab.setReadout(\n    `ADC索引 = ${adc} | 电阻 R = ${R} Ω | LUT[${adc}] = ${curP.toFixed(1)} | 查表仅需 1 次内存寻址 (省去平方与除法)`\n  );\n}\n\nlab.onUpdate(() => {\n  render();\n});\n\nlab.onLoop((dt) => {\n  animTime += dt;\n  render();\n});"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "整数优先，但严防整数除法：整型比浮点快 10~20 倍（无协处理器时可达 200 倍），但很多系统做整数除法会暗中转浮点，慢到怀疑人生。",
        "能乘不幂，能查表不算级数：sin(x)、log(x) 等超越函数底层靠麦克劳林级数硬算（慢 ~10 倍），衍生函数更慢；小角度用 sin(x)≈x，固定量化输入（如 8-bit ADC）直接上 LUT 查表法提速数百倍。",
        "警惕 I/O 与调试输出黑洞：优先用块传输（如 BLOAD）和硬件原语（如 LINE）代替逐字节/逐像素循环（差距 100 倍）；严禁在高频核心循环内留 print 语句（可拖慢上千倍）。"
      ]
    }
  ]
});
