window.__BOOK_REGISTER_SECTION__("sec_045", {
  "title": "定点整数编码与补码直觉 (Fixed Point / Integers)",
  "intuition": "把有限的二进制比特位想象成汽车里程表的机械齿轮：硬件只负责傻瓜式地向前或向后拨动刻度，而人类通过无符号、偏移、原码与补码四种约定，赋予同一串 0 和 1 截然不同的正负数值。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 定点数的本质与无符号整数 (Unsigned Integer)",
      "paragraphs": [
        "在数字信号处理和通用编程中，**定点数 (Fixed Point)** 专门用来存储整数（即 `..., -3, -2, -1, 0, 1, 2, 3, ...`）。之所以叫“定点”，是因为小数点的位置被隐含地固定在最右边，数字之间只有整数步长的间隔。",
        "像 C 语言或 BASIC 等高级语言，通常分配 **16 个比特 (16 bits)** 来存放一个整数。16 个比特总共能组合出 `2^16 = 65,536` 种不同的 0/1 排列图案。最直接的编码方式就是把这 65,536 种图案按顺序一对一分配给 `0` 到 `65,535`，这就是**无符号整数格式 (Unsigned Integer)**。",
        "为了看清规律，原书 Fig. 4-1 用 **4 个比特**（`2^4 = 16` 种图案）做了一个微缩模型：无符号整数把 `0000` 到 `1111` 映射成十进制的 `0` 到 `15`。数字和比特之间的转换，纯粹就是十进制和二进制（base 2）的换算。但它的致命短板很明显：**完全无法表示负数**。"
      ],
      "formula": {
        "expr": "N_patterns = 2^B,   Range_unsigned = [0, 2^B - 1]",
        "explain": "B 为比特位数（如 4 位或 16 位）；N_patterns 为可表示的状态总数；无符号整数范围从 0 到 2^B - 1（16 位即 0 ~ 65,535）。"
      }
    },
    {
      "type": "concept",
      "heading": "2. 负数的两种朴素解法：偏移二进制与符号-数值法",
      "paragraphs": [
        "为了让二进制表达负数，第一种自然想法是**偏移二进制 (Offset Binary)**：直接把无符号整数的刻度整体往下平移。在 4 比特例子中，如果给所有十进制数减去一个 `7` 的偏移量（offset），`0000 ~ 1111` 就从 `0 ~ 15` 变成了 `-7 ~ +8`；同理 16 比特通常偏移 `32,767`，得到 `-32,767 ~ 32,768`（有时也用 `32,768` 作偏移，它并非严格统一的标准）。偏移二进制在软件计算里较少直接用，但它是 **ADC（模数转换器）和 DAC（数模转换器）** 最核心的格式——例如把 `-5V ~ +5V` 的模拟电压直接映射到 12 位 ADC 的数字 `0 ~ 4095`。",
        "第二种符合人类直觉的方案叫**符号-数值法 (Sign and Magnitude，常称原码)**：把最左边的最高位单独拎出来当**符号位 (Sign Bit)**，规定 `0` 代表正数、`1` 代表负数，剩下的比特老老实实表示绝对值大小。",
        "但原码有个尴尬的浪费：零居然有两种写法！`0000` 代表正零（+0），`1000` 代表负零（-0）。这白白浪费了宝贵的一个比特图案，导致 16 比特原码的表示范围只有 `-32,767 ~ +32,767`。更糟糕的是，无论是偏移二进制还是原码，当程序里写下 `A = B + C` 时，数字硬件工程师都必须设计极其复杂的判断和借位电路才能把它们加在一起。"
      ],
      "formula": {
        "expr": "D_offset = U - Offset,   D_signMag = (-1)^S * |Magnitude|",
        "explain": "U 为纯二进制无符号值；Offset 为偏移常量（如 4 位取 7，16 位常取 32,767）；S 为最左符号位（0 为正，1 为负）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：同一串 4-bit 比特的四种平行宇宙 (复现 Fig. 4-1)",
      "instruction": "拖动「4-bit 寄存器数值」滑块遍历 0000~1111，对比同一串比特在四种编码下的真实含义；重点观察 1000 处符号-数值法的「-0 浪费」现象。",
      "controls": [
        {
          "type": "slider",
          "id": "bits",
          "label": "4-bit 寄存器状态 (0~15)",
          "min": 0,
          "max": 15,
          "step": 1,
          "value": 13,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showSign",
          "label": "高亮最左符号位与特殊边界 (-0 / -8)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction pad4(n) {\n  return (n & 15).toString(2).padStart(4, '0');\n}\n\nfunction draw() {\n  const bits = Math.round(lab.values.bits);\n  const showSign = !!lab.values.showSign;\n  const binStr = pad4(bits);\n\n  ctx.fillStyle = '#0b1220';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 0; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = 'right';\n  ctx.fillText('4-BIT 硬件寄存器:', 255, 34);\n\n  for (let i = 0; i < 4; i++) {\n    const ch = binStr[i];\n    const isOne = ch === '1';\n    const isMSB = i === 0;\n    const bx = 270 + i * 44;\n    const by = 12;\n    ctx.fillStyle = isMSB && showSign ? 'rgba(236,72,153,0.22)' : (isOne ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.05)');\n    ctx.strokeStyle = isMSB && showSign ? '#ec4899' : (isOne ? '#10b981' : 'rgba(255,255,255,0.2)');\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(bx, by, 36, 34);\n    ctx.strokeRect(bx, by, 36, 34);\n\n    ctx.fillStyle = isMSB && showSign ? '#ec4899' : (isOne ? '#10b981' : '#64748b');\n    ctx.font = 'bold 18px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(ch, bx + 18, by + 23);\n  }\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = showSign ? '#ec4899' : '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(showSign ? '← 最左位 (MSB) 在原码/补码中决定正负' : '物理触发器只有 0/1 状态', 454, 33);\n\n  const uVal = bits;\n  const oVal = bits - 7;\n  const smIsNegZero = (bits === 8);\n  const smVal = bits < 8 ? bits : (smIsNegZero ? 0 : -(bits - 8));\n  const tcVal = bits < 8 ? bits : bits - 16;\n\n  const cards = [\n    { name: '无符号整数', sub: 'Unsigned Integer', val: uVal, min: 0, max: 15, str: String(uVal), range16: '16-bit: 0 ~ 65,535', color: '#38bdf8', warn: false },\n    { name: '偏移二进制', sub: 'Offset Binary (偏7)', val: oVal, min: -7, max: 8, str: (oVal > 0 ? '+' : '') + oVal, range16: '16-bit: -32,767 ~ 32,768', color: '#10b981', warn: false },\n    { name: '符号-数值法', sub: 'Sign & Magnitude', val: smVal, min: -7, max: 7, str: smIsNegZero ? '-0 (浪费!)' : ((smVal > 0 ? '+' : '') + smVal), range16: '16-bit: -32,767 ~ 32,767', color: smIsNegZero ? '#ec4899' : '#f59e0b', warn: smIsNegZero },\n    { name: '二进制补码', sub: 'Twos Complement', val: tcVal, min: -8, max: 7, str: (tcVal > 0 ? '+' : '') + tcVal, range16: '16-bit: -32,768 ~ 32,767', color: tcVal === -8 && showSign ? '#ec4899' : '#10b981', warn: tcVal === -8 }\n  ];\n\n  const cardW = 166;\n  const gap = 10;\n  const startX = 13;\n  const cardY = 58;\n  const cardH = 168;\n\n  cards.forEach((c, idx) => {\n    const x = startX + idx * (cardW + gap);\n    ctx.fillStyle = 'rgba(255,255,255,0.04)';\n    ctx.strokeStyle = (showSign && c.warn) ? '#ec4899' : 'rgba(255,255,255,0.12)';\n    ctx.lineWidth = (showSign && c.warn) ? 2 : 1;\n    ctx.fillRect(x, cardY, cardW, cardH);\n    ctx.strokeRect(x, cardY, cardW, cardH);\n\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.fillText(c.name, x + cardW / 2, cardY + 20);\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.fillText(c.sub, x + cardW / 2, cardY + 35);\n\n    ctx.fillStyle = c.color;\n    ctx.font = (smIsNegZero && idx === 2) ? 'bold 17px monospace' : 'bold 26px monospace';\n    ctx.fillText(c.str, x + cardW / 2, cardY + 72);\n\n    const barX = x + 14;\n    const barW = cardW - 28;\n    const barY = cardY + 95;\n    const barH = 16;\n\n    ctx.fillStyle = 'rgba(255,255,255,0.08)';\n    ctx.fillRect(barX, barY, barW, barH);\n\n    const zeroRatio = (0 - c.min) / (c.max - c.min);\n    const zeroX = barX + zeroRatio * barW;\n    const valRatio = (c.val - c.min) / (c.max - c.min);\n    const valX = barX + valRatio * barW;\n\n    ctx.fillStyle = c.color;\n    const leftX = Math.min(zeroX, valX);\n    const fillW = Math.max(3, Math.abs(valX - zeroX));\n    ctx.fillRect(leftX, barY + 2, fillW, barH - 4);\n\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.beginPath(); ctx.moveTo(zeroX, barY - 4); ctx.lineTo(zeroX, barY + barH + 4); ctx.stroke();\n\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '10px monospace';\n    ctx.textAlign = 'left';\n    ctx.fillText(String(c.min), barX, barY + 30);\n    ctx.textAlign = 'right';\n    ctx.fillText(String(c.max), barX + barW, barY + 30);\n\n    ctx.textAlign = 'center';\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '10px monospace';\n    ctx.fillText(c.range16, x + cardW / 2, cardY + 154);\n  });\n\n  lab.setReadout('比特: ' + binStr + ' | 无符号: ' + uVal + ' | 偏移(偏7): ' + oVal + ' | 原码: ' + (smIsNegZero ? '-0(浪费)' : smVal) + ' | 补码: ' + tcVal);\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. 硬件工程师的真爱：二进制补码 (Two's Complement)",
      "paragraphs": [
        "现代计算机普遍采用**二进制补码 (Two's Complement)**，原因只有一个：它让加法器硬件变得极其简单。把 4 个比特想象成由 4 个触发器组成的**汽车里程表**：从 `0000` 开始向前开，数字依次变成 `0001 (1)`、`0010 (2)`、`0011 (3)`…… 如果停在 `0000` 倒车退一格，十进制里程表会跳回 `99999`，而 4 位二进制寄存器会自动回绕成 `1111 (-1)`、再退变成 `1110 (-2)`、`1101 (-3)`！",
        "正因如此，补码把加减法统一成了**纯粹的二进制无符号加法**：例如 `5 + (-3)` 只需要让硬件把 `0101` 和 `1101` 直接相加得到 `10010`，丢弃超出 4 位的最高进位 `1`，剩下的 `0010` 恰好就是 `+2`！而且最左边的比特依然充当**符号位**（`0` 代表非负，`1` 代表负数），且消除了 `-0` 的浪费，让 16 比特补码能对称偏多地覆盖 `-32,768` 到 `32,767`。",
        "那人类手算怎么把一个负数（比如 `-5`）转成 4 位补码呢？书中给出了经典四步口诀：**(1) 取绝对值**（`-5 → 5`）；**(2) 转成二进制**（`0101`）；**(3) 按位取反**，0 变 1、1 变 0（`1010`）；**(4) 末尾加 1**（`1011`）。补码虽然对人类大脑有点绕，但对数字电路来说却优雅到极致。"
      ],
      "formula": {
        "expr": "X_2comp = -b_{N-1} * 2^{N-1} + Σ_{i=0}^{N-2} b_i * 2^i",
        "explain": "N 位补码的真实数值等于：除了最高位（符号位 b_{N-1}）带着负权重 -2^{N-1} 之外，其余所有比特照常按正权重 2^i 求和。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：补码里程表加法器与溢出回绕 (Wrap-around) 听觉对比",
      "instruction": "调节加数 A 与 B，观察左侧里程表拨盘如何顺/逆时针相加；当 A + B 超过 [-8, 7] 范围时，右侧将发生危险的「溢出回绕」，开启试听可听到波形顶部瞬间跳到底部产生的刺耳失真音。",
      "controls": [
        {
          "type": "slider",
          "id": "numA",
          "label": "加数 A (4-bit 补码)",
          "min": -8,
          "max": 7,
          "step": 1,
          "value": 5,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "numB",
          "label": "加数 B (4-bit 补码)",
          "min": -8,
          "max": 7,
          "step": 1,
          "value": 4,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "showAlgo",
          "label": "展示负数「取反加一」推导",
          "value": true
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 试听当前波形与溢出失真",
          "activeLabel": "⏸ 停止试听"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nlet osc = null;\nlet preGain = null;\nlet shaper = null;\nlet outGain = null;\n\nfunction pad4(n) {\n  return (n & 15).toString(2).padStart(4, '0');\n}\n\nfunction fromBits4(b) {\n  const m = b & 15;\n  return (m & 8) ? (m - 16) : m;\n}\n\nfunction buildWrapCurve() {\n  const N = 4096;\n  const curve = new Float32Array(N);\n  for (let i = 0; i < N; i++) {\n    const x = (i * 2) / (N - 1) - 1;\n    const v = x * 16;\n    const q = Math.round(v);\n    const w = ((q + 8) % 16 + 16) % 16 - 8;\n    curve[i] = w / 8;\n  }\n  return curve;\n}\n\nfunction syncAudio(isPlaying, peakAmp) {\n  if (!isPlaying) {\n    if (osc) {\n      try { osc.stop(); } catch (e) {}\n      try { osc.disconnect(); } catch (e) {}\n      osc = null;\n    }\n    return;\n  }\n  const ac = lab.getAudioContext();\n  if (!ac) return;\n  if (ac.state === 'suspended') { ac.resume(); }\n  if (!osc) {\n    osc = ac.createOscillator();\n    osc.type = 'sine';\n    osc.frequency.value = 220;\n    preGain = ac.createGain();\n    shaper = ac.createWaveShaper();\n    shaper.curve = buildWrapCurve();\n    outGain = ac.createGain();\n    outGain.gain.value = 0.16;\n    osc.connect(preGain);\n    preGain.connect(shaper);\n    shaper.connect(outGain);\n    outGain.connect(ac.destination);\n    osc.start();\n  }\n  preGain.gain.setTargetAtTime(peakAmp / 16, ac.currentTime, 0.02);\n}\n\nfunction draw() {\n  const A = Math.round(lab.values.numA);\n  const B = Math.round(lab.values.numB);\n  const showAlgo = !!lab.values.showAlgo;\n  const isPlaying = !!lab.values.play;\n\n  const sumRaw = A + B;\n  const sumBits = ((A & 15) + (B & 15)) & 15;\n  const sumWrap = fromBits4(sumBits);\n  const isOverflow = (sumRaw > 7 || sumRaw < -8);\n\n  ctx.fillStyle = '#0b1220';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let gx = 0; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (let gy = 0; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  // Left: Circular Odometer Dial\n  const cx = 126;\n  const cy = 122;\n  const R = 82;\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();\n\n  // Overflow cliff line between +7 (idx 7) and -8 (idx 8)\n  const cliffAngle = -Math.PI / 2 + 7.5 * (Math.PI * 2 / 16);\n  ctx.save();\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(cx + Math.cos(cliffAngle) * (R - 18), cy + Math.sin(cliffAngle) * (R - 18));\n  ctx.lineTo(cx + Math.cos(cliffAngle) * (R + 22), cy + Math.sin(cliffAngle) * (R + 22));\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#ec4899';\n  ctx.font = 'bold 10px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('溢出悬崖(+7/-8)', cx + 10, cy + R + 24);\n\n  // Draw A arc and B arc\n  const stepAng = Math.PI * 2 / 16;\n  const a0 = -Math.PI / 2;\n  const aA = a0 + A * stepAng;\n  const aEnd = aA + B * stepAng;\n\n  if (A !== 0) {\n    ctx.strokeStyle = '#38bdf8';\n    ctx.lineWidth = 5;\n    ctx.beginPath();\n    ctx.arc(cx, cy, R - 10, a0, aA, A < 0);\n    ctx.stroke();\n  }\n  if (B !== 0) {\n    ctx.strokeStyle = isOverflow ? '#ec4899' : '#10b981';\n    ctx.lineWidth = 5;\n    ctx.beginPath();\n    ctx.arc(cx, cy, R - 18, aA, aEnd, B < 0);\n    ctx.stroke();\n  }\n\n  // Draw 16 ticks\n  for (let k = 0; k < 16; k++) {\n    const val = fromBits4(k);\n    const ang = a0 + k * stepAng;\n    const tx = cx + Math.cos(ang) * R;\n    const ty = cy + Math.sin(ang) * R;\n    const lx = cx + Math.cos(ang) * (R + 14);\n    const ly = cy + Math.sin(ang) * (R + 14);\n\n    const isSum = (k === sumBits);\n    const isA = (k === (A & 15));\n    ctx.fillStyle = isSum ? (isOverflow ? '#ec4899' : '#10b981') : (isA ? '#38bdf8' : (k === 0 ? '#f8fafc' : '#64748b'));\n    ctx.beginPath();\n    ctx.arc(tx, ty, isSum ? 6 : (isA || k === 0 ? 4.5 : 2.5), 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.fillStyle = isSum ? (isOverflow ? '#ec4899' : '#10b981') : (k === 0 ? '#f8fafc' : '#94a3b8');\n    ctx.font = isSum ? 'bold 12px monospace' : '10px monospace';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'middle';\n    ctx.fillText(String(val), lx, ly);\n  }\n  ctx.textBaseline = 'alphabetic';\n\n  ctx.fillStyle = isOverflow ? '#ec4899' : '#f8fafc';\n  ctx.font = 'bold 16px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText(pad4(sumBits), cx, cy - 2);\n  ctx.font = '12px monospace';\n  ctx.fillStyle = isOverflow ? '#ec4899' : '#10b981';\n  ctx.fillText('结果: ' + sumWrap, cx, cy + 16);\n\n  // Right Top: Binary Addition & Two's Complement Steps\n  const rx = 258;\n  ctx.fillStyle = 'rgba(255,255,255,0.04)';\n  ctx.strokeStyle = isOverflow ? '#ec4899' : 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = isOverflow ? 1.5 : 1;\n  ctx.fillRect(rx, 12, 448, 98);\n  ctx.strokeRect(rx, 12, 448, 98);\n\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = 'bold 14px monospace';\n  ctx.fillText('A = ' + String(A).padStart(2, ' ') + ' (' + pad4(A) + ')', rx + 14, 35);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('+  B = ' + String(B).padStart(2, ' ') + ' (' + pad4(B) + ')', rx + 165, 35);\n\n  const rawBin5 = ((A & 15) + (B & 15)).toString(2).padStart(5, '0');\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('硬件直接相加 = ' + rawBin5 + ' (截断高进位 → ' + pad4(sumBits) + ' = ' + sumWrap + ')', rx + 14, 60);\n\n  if (isOverflow) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('⚠ 发生补码溢出回绕! 理论和 ' + sumRaw + ' 超出 [-8, 7] → 硬件跳变成 ' + sumWrap, rx + 14, 83);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('✓ 运算正常未溢出：硬件结果 ' + sumWrap + ' 与十进制求和一致', rx + 14, 83);\n  }\n\n  if (showAlgo) {\n    const neg = B < 0 ? B : (A < 0 ? A : null);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px monospace';\n    if (neg !== null) {\n      const absN = Math.abs(neg);\n      const invN = (~absN) & 15;\n      ctx.fillText('负数转换(' + neg + '): |' + absN + '|=' + pad4(absN) + ' → 按位取反 ' + pad4(invN) + ' → 加1 ' + pad4(neg), rx + 14, 102);\n    } else {\n      ctx.fillStyle = '#94a3b8';\n      ctx.fillText('两数均非负，直接按标准二进制转换并相加（拖至负数可看取反加一）', rx + 14, 102);\n    }\n  }\n\n  // Right Bottom: Waveform Preview\n  const wy = 122;\n  const wh = 104;\n  const ww = 448;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.fillRect(rx, wy, ww, wh);\n  ctx.strokeRect(rx, wy, ww, wh);\n\n  const wMidY = wy + wh / 2 + 4;\n  const wScale = 36 / 8;\n\n  // +7 and -8 boundary lines\n  ctx.strokeStyle = 'rgba(236,72,153,0.35)';\n  ctx.beginPath();\n  ctx.moveTo(rx, wMidY - 7 * wScale); ctx.lineTo(rx + ww, wMidY - 7 * wScale);\n  ctx.moveTo(rx, wMidY + 8 * wScale); ctx.lineTo(rx + ww, wMidY + 8 * wScale);\n  ctx.stroke();\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('4-bit 音频波形预览 (量程 -8 ~ +7)', rx + 10, wy + 15);\n\n  const peakAmp = isOverflow ? Math.max(9, Math.abs(sumRaw)) : Math.max(2, Math.min(7, Math.abs(sumRaw)));\n\n  // Ideal sine\n  ctx.strokeStyle = 'rgba(56,189,248,0.4)';\n  ctx.lineWidth = 1.5;\n  ctx.beginPath();\n  for (let px = 0; px <= ww; px += 2) {\n    const t = (px / ww) * Math.PI * 4;\n    const val = peakAmp * Math.sin(t);\n    const py = Math.max(wy + 18, Math.min(wy + wh - 4, wMidY - val * wScale));\n    if (px === 0) ctx.moveTo(rx + px, py); else ctx.lineTo(rx + px, py);\n  }\n  ctx.stroke();\n\n  // Quantized + Wrapped 4-bit output\n  ctx.strokeStyle = isOverflow ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  for (let px = 0; px <= ww; px += 2) {\n    const t = (px / ww) * Math.PI * 4;\n    const rawV = peakAmp * Math.sin(t);\n    const q = Math.round(rawV);\n    const wrapped = ((q + 8) % 16 + 16) % 16 - 8;\n    const py = wMidY - wrapped * wScale;\n    if (px === 0) ctx.moveTo(rx + px, py); else ctx.lineTo(rx + px, py);\n  }\n  ctx.stroke();\n\n  syncAudio(isPlaying, peakAmp);\n\n  lab.setReadout('A=' + A + ' (' + pad4(A) + ') + B=' + B + ' (' + pad4(B) + ') → 硬件补码和=' + sumWrap + ' (' + pad4(sumBits) + ') | ' + (isOverflow ? '溢出回绕失真!' : '正常范围') + (isPlaying ? ' | 正在发声(220Hz)' : ''));\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "**看清接口约定**：底层通用计算与 C/DSP 定点代码（如 `int16_t`）几乎全用**二进制补码**；但只要对接 **ADC/DAC 硬件芯片**，数据手册上经常用的是**偏移二进制**（例如把 `-5V~+5V` 映射到 `0~4095`），切勿直接当补码读取，必须先减去半量程偏移。",
        "**警惕不对称的最小值**：16 位补码的范围是 `-32,768 ~ +32,767`，负数比正数多一个！在写 `abs(-32768)` 或按位取反加一时要极度小心，因为 `+32,768` 在 16 位有符号整数里根本不存在，强行取正会原地溢出成 `-32,768`。",
        "**溢出回绕是音频杀手**：默认整数加法遇到溢出时会像汽车里程表一样从 `+32,767` 瞬间跳崖回 `-32,768`（Wrap-around），在声音上表现为刺耳的爆音脉冲。做音频或控制算法时，如果用定点运算，务必留足动态余量或启用 DSP 芯片的**饱和运算 (Saturation)** 模式。"
      ]
    }
  ]
});
