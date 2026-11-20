window.__BOOK_REGISTER_SECTION__("sec_195", {
  "title": "哈夫曼编码：按概率分发“长短袖”的无损压缩术 (Huffman Encoding)",
  "intuition": "别给所有字符一视同仁地发 8 比特“均码衣服”——让高频字符穿 1~2 比特的极简短码，把长码留给生僻字符，就能在毫无信息损失的前提下把文件体积狠狠压下去。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、ASCII 文本里的巨大浪费：从“5+13 朴素变长编码”说起",
      "paragraphs": [
        "在计算机里，标准 ASCII 字符通常被强行塞进一个完整的字节（**8 比特**）中存储。但只要你统计一下真实英文文本的字节直方图（如原书图 27-2 所示），就会发现惊人的“贫富差距”：**超过 96% 的文件内容仅仅由 31 个常用字符构成**——26 个小写字母、空格、逗号、句号和回车符。",
        "既然只有这 31 个字符天天出场，为什么还要让它们每次都占 8 比特呢？大卫·哈夫曼（D.A. Huffman）在 1950 年代提出了一个核心思想：**按出场概率分配码长，高频字符用短码，低频字符用长码**。",
        "我们先看一个入门级的 5 比特方案：拿出 31 个 5-bit 二进制编码分配给这 31 个高频老熟人（例如 `00000` 代表 `\"a\"`，`00001` 代表 `\"b\"`，依此类推）。这样一来，**96% 的字符体积直接缩水为原来的 5/8**。",
        "那剩下 4% 的生僻字符（如大写字母、数字、`!`、`@` 等）怎么办？我们保留最后一个 5-bit 编码 `11111` 作为**“转义警示旗帜（Escape Flag）”**：一旦解码器读到 `11111`，就知道后面紧跟着的不是常见字符，而是**标准的 8-bit 原始 ASCII 码**。因此，那 4% 的生僻字符需要占用 `5 + 8 = 13` 比特。"
      ],
      "formula": {
        "expr": "L_avg = p * k + (1 - p) * (k + 8) ,   CR = 8 / L_avg",
        "explain": "L_avg 为压缩后每个字符的平均比特数；p 为常用字符在文件里的出现概率（如 0.96）；k 为短码位宽（如 5 bits）；(k + 8) 为触发转义旗帜后的总位宽（13 bits）；CR 为最终压缩比（本例中 L_avg = 0.96×5 + 0.04×13 = 5.32 bits，压缩比约 1.5 : 1）。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 1：常用字符占比与“短码 + 转义”压缩比推演",
      "instruction": "拖动“31个常用字符占比”和“短码位宽”滑块，观察 ASCII 直方图分布变化，以及什么时候压缩比会跌破 1:1 发生“文件反向膨胀”。",
      "controls": [
        {
          "type": "slider",
          "id": "pCommon",
          "label": "常用字符占比 (p)",
          "min": 50,
          "max": 99,
          "step": 1,
          "value": 96,
          "unit": "%"
        },
        {
          "type": "slider",
          "id": "shortBits",
          "label": "短码位宽 (k)",
          "min": 4,
          "max": 7,
          "step": 1,
          "value": 5,
          "unit": " bits"
        },
        {
          "type": "toggle",
          "id": "showEscape",
          "label": "高亮转义开销 (Flag + 8bit)",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var p = lab.values.pCommon / 100;\n  var k = lab.values.shortBits;\n  var showEsc = lab.values.showEscape;\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Background grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 40; gx < W; gx += 40) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n  for (var gy = 40; gy < H; gy += 40) {\n    ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();\n  }\n\n  // Left panel: Simulated ASCII Histogram (Fig 27-2)\n  var hx = 28, hy = 200, hw = 310, hh = 155;\n  ctx.strokeStyle = 'rgba(248,250,252,0.4)';\n  ctx.beginPath(); ctx.moveTo(hx, hy - hh); ctx.lineTo(hx, hy); ctx.lineTo(hx + hw, hy); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('模拟 ASCII 字节分布直方图 (0 ~ 135)', hx, 24);\n\n  // Weights for common chars (CR=13, Space=32, comma=44, dot=46, a-z=97..122)\n  var commonWeights = {13: 0.04, 32: 0.22, 44: 0.03, 46: 0.03};\n  var azProfile = [0.06,0.015,0.025,0.035,0.10,0.02,0.018,0.045,0.055,0.005,0.008,0.035,0.022,0.055,0.06,0.018,0.003,0.048,0.05,0.07,0.025,0.01,0.018,0.004,0.016,0.003];\n  var azSum = 0;\n  for (var i = 0; i < 26; i++) azSum += azProfile[i];\n  for (var i = 0; i < 26; i++) commonWeights[97 + i] = (azProfile[i] / azSum) * 0.68;\n\n  // Draw rare bars (48..57 digits, 65..90 uppercase, 33..43 punct)\n  var rareScale = (1 - p) / 0.04;\n  var commonScale = p / 0.96;\n\n  for (var code = 0; code <= 130; code++) {\n    var bx = hx + (code / 132) * hw;\n    var bw = Math.max(2, hw / 132);\n    var hVal = 0;\n    var isCommon = false;\n    if (commonWeights[code]) {\n      isCommon = true;\n      hVal = commonWeights[code] * commonScale * 560;\n    } else if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 33 && code <= 41)) {\n      hVal = 0.0035 * rareScale * 900;\n    }\n    if (hVal > 0) {\n      var barH = Math.min(hh - 8, hVal);\n      ctx.fillStyle = isCommon ? '#10b981' : '#ec4899';\n      ctx.fillRect(bx, hy - barH, bw, barH);\n    }\n  }\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('space', hx + (32/132)*hw - 10, hy - Math.min(hh - 12, 0.22 * commonScale * 560) - 5);\n  ctx.fillText('a-z 小写字母', hx + (97/132)*hw, hy + 16);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('生僻/大写', hx + (52/132)*hw, hy + 16);\n\n  // Right panel: Bit budget comparison\n  var rx = 380, rw = 310;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('每字符平均比特开销对比 (越短越好)', rx, 24);\n\n  var commonContrib = p * k;\n  var rareContrib = (1 - p) * (k + 8);\n  var avgBits = commonContrib + rareContrib;\n  var maxBitsScale = 12;\n  var pxPerBit = rw / maxBitsScale;\n\n  // Bar 1: Standard 8-bit ASCII\n  ctx.fillStyle = 'rgba(56,189,248,0.22)';\n  ctx.fillRect(rx, 50, 8 * pxPerBit, 36);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(rx, 50, 8 * pxPerBit, 36);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('原始 ASCII 定长: 8.00 bits', rx + 8, 72);\n\n  // 8-bit reference line\n  var line8x = rx + 8 * pxPerBit;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.setLineDash([4, 4]);\n  ctx.beginPath(); ctx.moveTo(line8x, 42); ctx.lineTo(line8x, 165); ctx.stroke();\n  ctx.setLineDash([]);\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('8-bit 盈亏平衡线', line8x - 42, 178);\n\n  // Bar 2: Variable-length average\n  var wCommon = commonContrib * pxPerBit;\n  var wRare = rareContrib * pxPerBit;\n  ctx.fillStyle = '#10b981';\n  ctx.fillRect(rx, 108, wCommon, 36);\n  if (showEsc) {\n    ctx.fillStyle = '#ec4899';\n    ctx.fillRect(rx + wCommon, 108, wRare, 36);\n  } else {\n    ctx.fillStyle = 'rgba(16,185,129,0.5)';\n    ctx.fillRect(rx + wCommon, 108, wRare, 36);\n  }\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText('变长平均: ' + avgBits.toFixed(2) + ' bits', rx + 8, 130);\n\n  var cr = 8 / avgBits;\n  var saved = (1 - avgBits / 8) * 100;\n  if (avgBits > 8) {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText('警告：转义开销过高，文件反向膨胀!', rx, 206);\n  } else {\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 13px sans-serif';\n    ctx.fillText('压缩成功：体积缩小 ' + saved.toFixed(1) + '%', rx, 206);\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '11px monospace';\n  ctx.fillText('常用贡献: ' + commonContrib.toFixed(2) + 'b  |  转义贡献: ' + rareContrib.toFixed(2) + 'b', rx, 226);\n\n  lab.setReadout('p=' + Math.round(p*100) + '% | 短码=' + k + 'b / 转义=' + (k+8) + 'b | 平均码长: ' + avgBits.toFixed(2) + ' bits | 压缩比: ' + cr.toFixed(2) + ' : 1');\n});"
    },
    {
      "type": "concept",
      "heading": "二、把思想推向极致：哈夫曼编码与“无分隔符”拆包秘密",
      "paragraphs": [
        "上面的“5+13 方案”只是粗粒度两档划分，真正的**哈夫曼编码（Huffman Encoding）**把这个思想推到了数学极限：**不再只分两档，而是根据每个字符各自精确的出现概率，分配从 1 比特到十几个比特不等的定制码长**。",
        "例如，最常见的字符（如空格、`e`、`A`）可能只占 **1~2 比特**，而极少出现的字符（如 `!`、`@`、`#`、`$`）可能需要 **12 比特以上**。在信息论上，最理想的分配方案是：**每个字符分配的比特数，正比于其出现概率的对数（信息熵）**。",
        "但一个棘手的问题立刻出现了：以前每个字符死死占满 8 比特，解压器只要每 8 个比特咔嚓切一刀就能分离字符；现在大家的编码长短不一，混成一串密不透风的 `0` 和 `1` 之后，**不用空格或逗号分隔，解压器怎么知道一个字符在哪里结束、下一个字符从哪一位开始？**",
        "秘密在于哈夫曼码表的**“无歧义前缀特性（Prefix-Free Property）”**：**没有任何一个合法编码，是另一个合法编码的开头前缀**。请看原书图 27-3 给出的经典码表（`A: 1`, `B: 01`, `C: 0010`, `D: 0011`, `E: 0001`, `F: 000010`, `G: 000011`）。仔细观察会发现：每个编码都由**“若干个 0 引导一个 1，加上 1 后面可选的尾码”**构成。比如只要一读到 `1`，字符 `A` 立刻结束，绝不可能再向后延伸变成别的字符；如果读到 `0010`，这期间不会触发任何较短的编码，直到第 4 位才唯一匹配到 `C`。",
        "实际存储或传输时，这些长短不一的码流会被直接拼接，然后重新切分成标准 **8-bit 字节**（例如 `C E G A D F B E A` 编码后打包成 `byte 1` 到 `byte 4`）。字节的切分边界往往正好把某一个哈夫曼编码劈成两半，但这完全不影响解压——解压器只需把字节流还原成连续的比特串，逐比特扫描，一凑齐合法编码就吐出字符并清空缓冲重新开始。"
      ],
      "formula": {
        "expr": "L_i ≈ -log2(P_i)",
        "explain": "理想情况下，出现概率为 P_i 的字符应当分配大约 -log2(P_i) 个比特。例如概率为 1/2 (0.5) 的字符占 1 bit，概率为 1/16 (0.0625) 的字符占 4 bits。"
      }
    },
    {
      "type": "lab",
      "heading": "实验 2：哈夫曼码流打包成 8-bit 字节与逐比特无歧义解码器",
      "instruction": "拖动“解码比特游标”观察解压器如何逐位吞入比特流、如何跨过 8-bit 字节边界实现零歧义拆包；可切换“高频 A 极简流”体验极高压缩率。",
      "controls": [
        {
          "type": "slider",
          "id": "bitCursor",
          "label": "解码比特游标",
          "min": 0,
          "max": 32,
          "step": 1,
          "value": 15,
          "unit": " bit"
        },
        {
          "type": "toggle",
          "id": "highSkew",
          "label": "切换高频 A 极简流",
          "value": false
        },
        {
          "type": "toggle",
          "id": "groupBytes",
          "label": "显示 8-bit 字节打包边界",
          "value": true
        }
      ],
      "jsCode": "lab.onUpdate(function() {\n  var ctx = lab.ctx;\n  var W = lab.width;\n  var H = lab.height;\n  var skew = lab.values.highSkew;\n  var showBytes = lab.values.groupBytes;\n\n  var table = [\n    { ch: 'A', code: '1',      prob: '.154', col: '#10b981' },\n    { ch: 'B', code: '01',     prob: '.110', col: '#38bdf8' },\n    { ch: 'C', code: '0010',   prob: '.072', col: '#f59e0b' },\n    { ch: 'D', code: '0011',   prob: '.063', col: '#ec4899' },\n    { ch: 'E', code: '0001',   prob: '.059', col: '#a78bfa' },\n    { ch: 'F', code: '000010', prob: '.015', col: '#fb7185' },\n    { ch: 'G', code: '000011', prob: '.011', col: '#34d399' }\n  ];\n  var codeMap = {};\n  var revMap = {};\n  var colMap = {};\n  for (var i = 0; i < table.length; i++) {\n    codeMap[table[i].ch] = table[i].code;\n    revMap[table[i].code] = table[i].ch;\n    colMap[table[i].ch] = table[i].col;\n  }\n\n  var streamChars = skew\n    ? ['A','A','B','A','A','A','C','A','A','D','A','A','A','B','A','A']\n    : ['C','E','G','A','D','F','B','E','A'];\n\n  var bitObjs = [];\n  for (var s = 0; s < streamChars.length; s++) {\n    var c = streamChars[s];\n    var cd = codeMap[c];\n    for (var b = 0; b < cd.length; b++) {\n      bitObjs.push({ bit: cd[b], ch: c, col: colMap[c], symIdx: s });\n    }\n  }\n\n  var totalBits = bitObjs.length;\n  var cursor = Math.min(lab.values.bitCursor, totalBits);\n\n  // Decode bit-by-bit up to cursor\n  var buf = '';\n  var bufStart = 0;\n  var decoded = [];\n  for (var idx = 0; idx < cursor; idx++) {\n    if (buf === '') bufStart = idx;\n    buf += bitObjs[idx].bit;\n    if (revMap[buf]) {\n      decoded.push({ ch: revMap[buf], code: buf, col: colMap[revMap[buf]] });\n      buf = '';\n    }\n  }\n\n  ctx.clearRect(0, 0, W, H);\n\n  // Grid\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (var gx = 36; gx < W; gx += 36) {\n    ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();\n  }\n\n  // Row 1: Codebook Cards (Fig 27-3)\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('图 27-3 码表 (无任何编码互为前缀):', 18, 18);\n\n  var cardW = 94;\n  for (var i = 0; i < table.length; i++) {\n    var item = table[i];\n    var cx = 18 + i * (cardW + 4);\n    var cy = 26;\n    var isPrefixMatch = buf.length > 0 && item.code.indexOf(buf) === 0;\n    var isJustDecoded = buf === '' && decoded.length > 0 && decoded[decoded.length - 1].ch === item.ch;\n\n    ctx.fillStyle = isPrefixMatch ? 'rgba(245,158,11,0.22)' : (isJustDecoded ? 'rgba(16,185,129,0.22)' : 'rgba(255,255,255,0.05)');\n    ctx.fillRect(cx, cy, cardW, 34);\n    ctx.strokeStyle = isPrefixMatch ? '#f59e0b' : (isJustDecoded ? '#10b981' : 'rgba(255,255,255,0.14)');\n    ctx.lineWidth = isPrefixMatch || isJustDecoded ? 2 : 1;\n    ctx.strokeRect(cx, cy, cardW, 34);\n\n    ctx.fillStyle = item.col;\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText(item.ch, cx + 8, cy + 22);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '12px monospace';\n    ctx.fillText(item.code, cx + 28, cy + 22);\n  }\n\n  // Row 2: Bitstream\n  var startX = 20;\n  var bitW = Math.min(20, Math.floor((W - 40) / totalBits));\n  var bitY = 92;\n\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('连续哈夫曼比特流 (' + totalBits + ' bits vs 原始 ASCII ' + (streamChars.length * 8) + ' bits):', startX, 82);\n\n  for (var idx = 0; idx < totalBits; idx++) {\n    var x = startX + idx * bitW;\n    var bo = bitObjs[idx];\n    var isRead = idx < cursor;\n    var isInBuf = buf.length > 0 && idx >= bufStart && idx < cursor;\n\n    ctx.fillStyle = isInBuf ? 'rgba(245,158,11,0.35)' : (isRead ? 'rgba(255,255,255,0.09)' : 'rgba(255,255,255,0.02)');\n    ctx.fillRect(x + 1, bitY, bitW - 2, 28);\n\n    // Top color bar indicating true symbol boundary\n    ctx.fillStyle = isRead ? bo.col : 'rgba(248,250,252,0.18)';\n    ctx.fillRect(x + 1, bitY, bitW - 2, 4);\n\n    ctx.fillStyle = isInBuf ? '#f59e0b' : (isRead ? '#f8fafc' : 'rgba(248,250,252,0.3)');\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText(bo.bit, x + Math.floor((bitW - 8) / 2), bitY + 21);\n  }\n\n  // Cursor line\n  var curX = startX + cursor * bitW;\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(curX, bitY - 6); ctx.lineTo(curX, bitY + 34); ctx.stroke();\n\n  // 8-bit Byte brackets\n  if (showBytes) {\n    var numBytes = Math.ceil(totalBits / 8);\n    for (var byteIdx = 0; byteIdx < numBytes; byteIdx++) {\n      var bStart = byteIdx * 8;\n      var bEnd = Math.min((byteIdx + 1) * 8, totalBits);\n      var bx1 = startX + bStart * bitW + 1;\n      var bx2 = startX + bEnd * bitW - 1;\n      ctx.strokeStyle = '#38bdf8';\n      ctx.lineWidth = 1.5;\n      ctx.beginPath();\n      ctx.moveTo(bx1, bitY + 34);\n      ctx.lineTo(bx1, bitY + 42);\n      ctx.lineTo(bx2, bitY + 42);\n      ctx.lineTo(bx2, bitY + 34);\n      ctx.stroke();\n      ctx.fillStyle = '#38bdf8';\n      ctx.font = '11px monospace';\n      ctx.fillText('byte ' + (byteIdx + 1), (bx1 + bx2) / 2 - 20, bitY + 55);\n    }\n  }\n\n  // Row 3: Decoded output\n  var outY = 176;\n  ctx.fillStyle = 'rgba(248,250,252,0.75)';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('无歧义解码输出:', startX, outY - 6);\n\n  for (var d = 0; d < decoded.length; d++) {\n    var dx = startX + d * 38;\n    ctx.fillStyle = 'rgba(16,185,129,0.14)';\n    ctx.fillRect(dx, outY, 34, 38);\n    ctx.strokeStyle = decoded[d].col;\n    ctx.lineWidth = 1.5;\n    ctx.strokeRect(dx, outY, 34, 38);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 16px monospace';\n    ctx.fillText(decoded[d].ch, dx + 11, outY + 21);\n    ctx.fillStyle = decoded[d].col;\n    ctx.font = '9px monospace';\n    ctx.fillText(decoded[d].code, dx + 3, outY + 34);\n  }\n\n  // Active buffer box\n  if (buf.length > 0) {\n    var bx = startX + decoded.length * 38;\n    ctx.fillStyle = 'rgba(245,158,11,0.15)';\n    ctx.fillRect(bx, outY, 130, 38);\n    ctx.strokeStyle = '#f59e0b';\n    ctx.setLineDash([3, 3]);\n    ctx.strokeRect(bx, outY, 130, 38);\n    ctx.setLineDash([]);\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px monospace';\n    ctx.fillText('等待匹配: ' + buf + '_', bx + 8, outY + 23);\n  }\n\n  var avgB = (totalBits / streamChars.length).toFixed(2);\n  lab.setReadout('游标: ' + cursor + '/' + totalBits + ' bits | 已解码: ' + decoded.length + '/' + streamChars.length + ' 字符 | 当前缓冲: ' + (buf === '' ? '空' : buf) + ' | 平均: ' + avgB + ' bits/字符');\n});"
    },
    {
      "type": "concept",
      "heading": "三、工程实战：码表从哪来？算术编码还能再压多少？",
      "paragraphs": [
        "哈夫曼编码要能正常“压缩—解压”，最核心的前提是：**压缩端和解压端必须就“码表（Encoding Table）”达成绝对一致**。工程上通常有两种做法：",
        "1. **固定预设码表（Predefined Table）**：双方事先约定死同一张通用码表（例如专门针对标准英文文本优化的码表），压缩文件里完全不用存码表。优点是实现极简、没有头部体积开销；缺点是一旦遇到非典型数据（比如代码、二进制镜像），压缩率就会大幅缩水。",
        "2. **定制动态码表（Optimized Table）**：先扫描一遍待压缩数据，量身定做一张最优哈夫曼树/码表。由于每个文件的码表都不同，**必须把这张码表一起塞进压缩文件的头部（Header）里**，解压程序才能依葫芦画瓢还原数据。这两种策略在工业界都非常常见（例如 JPEG 和 DEFLATE/ZIP 就广泛使用了哈夫曼编码）。",
        "此外，原书还提到了哈夫曼编码的强力进化版——**算术编码（Arithmetic Encoding）**。哈夫曼编码的极限限制是“每个字符至少要占 1 个整数比特”；而算术编码打破了单个字符的边界，**把一整串字符序列（Sequences）直接映射成单个高精度编码**。这通常能比哈夫曼编码**再额外挤出 5%~10% 的压缩率**。在更高级的压缩管道里，**先用游程编码（RLE）消灭连续重复，再接哈夫曼或算术编码**，是非常经典的黄金组合。"
      ],
      "formula": null
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【小文件反向膨胀陷阱】如果采用“定制码表”，码表本身也要占几十到几百字节。拿它去压只有几十字节的短消息，最终文件反而比原来更大。",
        "【单字符 1-bit 天花板】哈夫曼编码给最高频的字符最少也得发 1 个整数比特。哪怕某个字符占了 99%（比如全零稀疏数据），单符号哈夫曼的压缩极限也卡死在 8:1，此时必须配合 RLE 或改用算术编码。",
        "【字节末尾填充坑（Padding）】变长比特流的总长度往往不是 8 的整数倍，最后一个字节多出来的几个空闲比特必须补 0 凑整。工程上必须在文件头记录“原始字符总数”或设计专门的 EOF 结束符，否则结尾补的 0 可能会被误解码成多余的假字符（如 B 或 A）。",
        "【抗误码能力极弱】一旦变长码流在传输中翻转了 1 个比特，后续所有字符的切分边界都会瞬间错位雪崩，因此有噪信道传输前必须配合纠错码或分段同步机制。"
      ]
    }
  ]
});
