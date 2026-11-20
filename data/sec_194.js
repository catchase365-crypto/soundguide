window.__BOOK_REGISTER_SECTION__("sec_194", {
  "title": "游程编码 (Run-Length Encoding, RLE)",
  "intuition": "与其在数据流里一遍遍重复唠叨“零、零、零、零”，不如直接报出“4个零”——用“数值 + 重复次数”把连续冗余的信号或字符瞬间折叠。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么需要游程编码？零值游程与“膨胀陷阱”",
      "paragraphs": [
        "在真实的数字文件与采样信号中，同一个数值连续重复出现（称为一个**游程 / Run**）是非常普遍的现象。例如：文本文件用大量空格来对齐表格和缩进；夜空图像中大片纯黑背景对应着连绵不断的相同像素值；而在数字化音乐中，两首曲子之间的静音间隙就是一长串连续的 `0`。",
        "最经典的**单字符游程编码**（如教材图 27-1 所示）专门针对频繁出现的 `0` 进行压缩：每当编码器在输入流中遇到 `0`，就向输出文件写入**两个值**——第一个值依然是 `0`（作为标志位 Flag，告诉解码器“接下来开始游程压缩了”），第二个值则是这段连续 `0` 的个数。",
        "例如原始序列 `17 8 54 0 0 0 97 5 16 0 45 23` 会被编码为 `17 8 54 0 3 97 5 16 0 1 45 23`。注意看中间那个孤立的单个 `0`：它被替换成了 `0 1`，反而多占用了 1 个字节！因此，游程编码并非稳赚不赔——只有当 `0` 的**平均游程长度大于 2** 时，整体文件体积才会真正缩小；如果数据中充满大量孤立的单个 `0`，编码后反而会发生**文件膨胀**。"
      ],
      "formula": {
        "expr": "N_out = N_non_zero + 2 × K_runs",
        "explain": "N_out 为编码后总字节数；N_non_zero 为非零数据个数；K_runs 为零游程的段数。由于每段零游程固定消耗 2 个输出字节（标志位 0 + 计数值），只有当各段零的总数大于 2 × K_runs（即平均游程长度 > 2）时，N_out 才小于原始长度。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 1：零值游程压缩比与静音信号听感对比",
      "instruction": "拖动“连续零的游程长度”滑块观察压缩率变化，开启“插入孤立单零”体验文件膨胀陷阱；点击播放按钮可实时收听信号（非零发出音调，零游程对应静音）。",
      "controls": [
        {
          "type": "slider",
          "id": "runLen",
          "label": "连续零的游程长度",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": " 个零"
        },
        {
          "type": "slider",
          "id": "numRuns",
          "label": "零游程出现组数",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 3,
          "unit": " 组"
        },
        {
          "type": "toggle",
          "id": "singleZeros",
          "label": "插入孤立单零 (触发文件膨胀)",
          "value": false
        },
        {
          "type": "audio",
          "id": "play",
          "label": "▶ 播放数字信号音频",
          "activeLabel": "⏸ 停止播放"
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\nvar stream = [], encoded = [], links = [];\nvar playhead = 0, wasPlaying = false;\nvar audioCtx = null, osc = null, gainNode = null;\n\nfunction buildData() {\n  var runLen = Math.round(lab.values.runLen);\n  var numRuns = Math.round(lab.values.numRuns);\n  var addSingles = !!lab.values.singleZeros;\n  var nonZeros = [17, 54, 97, 45, 67, 82, 33, 28, 76];\n  stream = [];\n  for (var r = 0; r < numRuns; r++) {\n    stream.push(nonZeros[(r * 2) % nonZeros.length]);\n    if (addSingles) {\n      stream.push(0);\n      stream.push(nonZeros[(r * 2 + 1) % nonZeros.length]);\n    }\n    for (var z = 0; z < runLen; z++) stream.push(0);\n  }\n  stream.push(nonZeros[numRuns % nonZeros.length]);\n\n  encoded = [];\n  links = [];\n  var i = 0;\n  while (i < stream.length) {\n    if (stream[i] === 0) {\n      var startIdx = i;\n      var cnt = 0;\n      while (i < stream.length && stream[i] === 0) { cnt++; i++; }\n      var encStart = encoded.length;\n      encoded.push({ val: 0, type: 'flag' });\n      encoded.push({ val: cnt, type: 'count' });\n      links.push({ s0: startIdx, s1: i - 1, e0: encStart, e1: encStart + 1, cnt: cnt });\n    } else {\n      encoded.push({ val: stream[i], type: 'data' });\n      i++;\n    }\n  }\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  var maxLen = Math.max(stream.length, encoded.length);\n  var padX = 24;\n  var gap = 4;\n  var cellW = Math.min(30, Math.floor((W - padX * 2 - (maxLen - 1) * gap) / maxLen));\n  if (cellW < 12) cellW = 12;\n  var step = cellW + gap;\n\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'left';\n  ctx.fillText('原始数据流 (Original Stream, ' + stream.length + ' 字节)', padX, 24);\n\n  var y1 = 36, boxH = 34;\n  for (var i = 0; i < stream.length; i++) {\n    var x = padX + i * step;\n    var isZero = stream[i] === 0;\n    ctx.fillStyle = isZero ? 'rgba(245,158,11,0.16)' : 'rgba(56,189,248,0.18)';\n    ctx.strokeStyle = isZero ? '#f59e0b' : '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(x, y1, cellW, boxH);\n    ctx.strokeRect(x, y1, cellW, boxH);\n    ctx.fillStyle = isZero ? '#f59e0b' : '#f8fafc';\n    ctx.textAlign = 'center';\n    ctx.font = 'bold ' + (cellW < 18 ? 10 : 12) + 'px monospace';\n    ctx.fillText(String(stream[i]), x + cellW / 2, y1 + 21);\n  }\n\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'left';\n  ctx.fillText('RLE 编码流 (Encoded Stream, ' + encoded.length + ' 字节)', padX, 152);\n\n  var y2 = 164;\n  for (var j = 0; j < encoded.length; j++) {\n    var x2 = padX + j * step;\n    var item = encoded[j];\n    if (item.type === 'flag') {\n      ctx.fillStyle = 'rgba(245,158,11,0.22)';\n      ctx.strokeStyle = '#f59e0b';\n    } else if (item.type === 'count') {\n      ctx.fillStyle = 'rgba(16,185,129,0.25)';\n      ctx.strokeStyle = '#10b981';\n    } else {\n      ctx.fillStyle = 'rgba(56,189,248,0.18)';\n      ctx.strokeStyle = '#38bdf8';\n    }\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(x2, y2, cellW, boxH);\n    ctx.strokeRect(x2, y2, cellW, boxH);\n    ctx.fillStyle = item.type === 'flag' ? '#f59e0b' : (item.type === 'count' ? '#10b981' : '#f8fafc');\n    ctx.textAlign = 'center';\n    ctx.font = 'bold ' + (cellW < 18 ? 10 : 12) + 'px monospace';\n    ctx.fillText(String(item.val), x2 + cellW / 2, y2 + 21);\n  }\n\n  for (var k = 0; k < links.length; k++) {\n    var lk = links[k];\n    var sx0 = padX + lk.s0 * step;\n    var sx1 = padX + lk.s1 * step + cellW;\n    var smid = (sx0 + sx1) / 2;\n    var ex0 = padX + lk.e0 * step;\n    var ex1 = padX + lk.e1 * step + cellW;\n    var emid = (ex0 + ex1) / 2;\n    var col = lk.cnt === 1 ? '#ec4899' : '#10b981';\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 1.5;\n    ctx.beginPath();\n    ctx.moveTo(sx0 + 2, y1 + boxH + 4);\n    ctx.lineTo(sx0 + 2, y1 + boxH + 10);\n    ctx.lineTo(sx1 - 2, y1 + boxH + 10);\n    ctx.lineTo(sx1 - 2, y1 + boxH + 4);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(smid, y1 + boxH + 10);\n    ctx.lineTo(emid, y2 - 14);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(ex0 + 2, y2 - 4);\n    ctx.lineTo(ex0 + 2, y2 - 10);\n    ctx.lineTo(ex1 - 2, y2 - 10);\n    ctx.lineTo(ex1 - 2, y2 - 4);\n    ctx.stroke();\n  }\n\n  if (lab.values.play) {\n    var curIdx = Math.floor(playhead);\n    if (curIdx >= stream.length) curIdx = stream.length - 1;\n    var px = padX + curIdx * step + cellW / 2;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath(); ctx.moveTo(px, y1 - 8); ctx.lineTo(px, y1 + boxH + 8); ctx.stroke();\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 11px monospace';\n    ctx.textAlign = 'left';\n    ctx.fillText(stream[curIdx] === 0 ? '状态: 静音 (0)' : '状态: 发声 (' + stream[curIdx] + ')', W - 155, 24);\n  }\n\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'left';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('● 绿线: 成功压缩 (游程 ≥ 2)', padX, 222);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('● 粉线: 单零膨胀 (1字节变2字节)', padX + 210, 222);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('■ 橙框: 标志位 0', padX + 460, 222);\n\n  var ratio = (encoded.length / stream.length * 100).toFixed(0);\n  var msg = encoded.length < stream.length ? '成功压缩' : (encoded.length > stream.length ? '发生体积膨胀!' : '体积无变化');\n  lab.setReadout('原始: ' + stream.length + ' 字节  |  编码后: ' + encoded.length + ' 字节  |  体积占比: ' + ratio + '% (' + msg + ')');\n}\n\nlab.onUpdate(function() {\n  buildData();\n  draw();\n});\n\nlab.onLoop(function(dt) {\n  var playing = !!lab.values.play;\n  if (playing) {\n    if (!wasPlaying) {\n      playhead = 0;\n      wasPlaying = true;\n      try {\n        if (!audioCtx) audioCtx = lab.getAudioContext();\n        if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();\n        if (audioCtx && !osc) {\n          osc = audioCtx.createOscillator();\n          gainNode = audioCtx.createGain();\n          osc.type = 'triangle';\n          gainNode.gain.value = 0;\n          osc.connect(gainNode);\n          gainNode.connect(audioCtx.destination);\n          osc.start();\n        }\n      } catch (e) {}\n    }\n    playhead += dt * 4.5;\n    if (playhead >= stream.length) playhead = 0;\n    var idx = Math.floor(playhead);\n    var val = stream[idx] || 0;\n    if (audioCtx && osc && gainNode) {\n      try {\n        var now = audioCtx.currentTime;\n        if (val > 0) {\n          osc.frequency.setTargetAtTime(240 + val * 4, now, 0.015);\n          gainNode.gain.setTargetAtTime(0.12, now, 0.015);\n        } else {\n          gainNode.gain.setTargetAtTime(0, now, 0.015);\n        }\n      } catch (e) {}\n    }\n    draw();\n  } else if (wasPlaying) {\n    wasPlaying = false;\n    playhead = 0;\n    if (audioCtx && gainNode) {\n      try { gainNode.gain.setTargetAtTime(0, audioCtx.currentTime, 0.02); } catch (e) {}\n    }\n    draw();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "通用游程编码：PackBits 9 位符号法与 ASCII 第 8 位巧思",
      "paragraphs": [
        "只压缩 `0` 显然太局限了。通用的游程编码可以针对**任意重复字符**，处理单位既可以是单个字节，也可以是浮点数等多字节组合。Macintosh 早期广泛使用的 **PackBits** 就是通用游程编码的经典代表。",
        "PackBits 的核心思路是**升维扩位**：输入文件中的每个字节是 8 位无符号数（范围 `0 ~ 255`），编码后扩展为 **9 位**——多出来的第 9 位用来表示**正负号**（范围变成 `-255 ~ 255`）。非游程数据直接原样搬运为正数；一旦遇到连续重复的数据（例如 `1, 2, 3, 4, 2, 2, 2, 2, 4` 中的四个 `2`），编码器就输出两个数：`2, -3`。第一个数 `2` 表示重复的字符值，第二个数 `-3` 表示重复次数（取绝对值再加 1，即 `|-3| + 1 = 4` 个 `2`）。同理，`4, -2` 解码为 `4, 4, 4`，`21, -4` 解码为五个 `21`。",
        "然而 PackBits 有个工程上的麻烦：**9 位字长与计算机标准的 8 位字节不对齐**，存储和传输前必须把每 8 个 9-bit 数据重新拆分打包成 9 个 8-bit 字节。如果输入数据受限于纯 **ASCII 文本**，就可以用极巧妙的方法规避这个问题：标准 ASCII 码只定义了 `0 ~ 127`（仅占用 7 个比特），而最高位（第 8 位，即 `128 ~ 255`）在标准文本中完全闲置！因此我们可以直接借用这**第 8 位作为游程编码标志位**，无需扩张到 9 位，完美契合 8-bit 字节存储。"
      ],
      "formula": {
        "expr": "L = |C_count| + 1   (当 C_count < 0 时)",
        "explain": "在 PackBits 编码流中，若某 9-bit 数值 C_count 为负数（第 9 位符号位为 1），代表它不是普通数据，而是紧跟在前一个字符后的游程计数；其绝对值加 1 即为该字符的实际连续重复次数 L。"
      }
    },
    {
      "type": "lab",
      "heading": "交互微实验 2：PackBits 编码透视镜 & 7-bit ASCII 比特复用",
      "instruction": "调节重复字符值与连续重复次数，观察 PackBits 如何将连续序列折叠为“数值 + 负计数”；切换“ASCII 第 8 位复用优化”对比 9-bit 与 8-bit 的比特级结构差异。",
      "controls": [
        {
          "type": "slider",
          "id": "repeatVal",
          "label": "重复数值 (ASCII 码)",
          "min": 32,
          "max": 126,
          "step": 1,
          "value": 65,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "runCount",
          "label": "连续重复次数",
          "min": 1,
          "max": 9,
          "step": 1,
          "value": 4,
          "unit": " 次"
        },
        {
          "type": "toggle",
          "id": "asciiMode",
          "label": "启用 7-bit ASCII 第8位复用优化",
          "value": false
        }
      ],
      "jsCode": "var ctx = lab.ctx, W = lab.width, H = lab.height;\n\nfunction toBin(n, bits) {\n  var s = '';\n  for (var b = bits - 1; b >= 0; b--) s += ((n >> b) & 1);\n  return s;\n}\n\nfunction drawWordBits(x, y, bitsStr, flagColor, dataColor, labelTop, labelBot) {\n  var bw = 24, bh = 26, gap = 2;\n  ctx.font = 'bold 11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'left';\n  ctx.fillText(labelTop, x, y - 8);\n\n  for (var i = 0; i < bitsStr.length; i++) {\n    var bx = x + i * (bw + gap);\n    var isFlag = (i === 0);\n    var col = isFlag ? flagColor : dataColor;\n    ctx.fillStyle = isFlag ? 'rgba(236,72,153,0.22)' : 'rgba(56,189,248,0.16)';\n    if (flagColor === '#10b981' && isFlag) ctx.fillStyle = 'rgba(16,185,129,0.22)';\n    ctx.strokeStyle = col;\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(bx, y, bw, bh);\n    ctx.strokeRect(bx, y, bw, bh);\n    ctx.fillStyle = '#f8fafc';\n    ctx.textAlign = 'center';\n    ctx.font = 'bold 13px monospace';\n    ctx.fillText(bitsStr[i], bx + bw / 2, y + 18);\n  }\n  ctx.font = '11px monospace';\n  ctx.fillStyle = flagColor;\n  ctx.textAlign = 'left';\n  ctx.fillText(labelBot, x, y + bh + 16);\n}\n\nfunction draw() {\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (var gx = 0; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (var gy = 0; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  var val = Math.round(lab.values.repeatVal);\n  var cnt = Math.round(lab.values.runCount);\n  var asciiMode = !!lab.values.asciiMode;\n  var ch = val === 32 ? 'Space' : String.fromCharCode(val);\n\n  var inputSeq = [1, 2, 3];\n  for (var r = 0; r < cnt; r++) inputSeq.push(val);\n  inputSeq.push(4);\n\n  var outSeq = [1, 2, 3];\n  if (cnt >= 2) {\n    outSeq.push({ text: String(val), kind: 'runVal' });\n    if (asciiMode) {\n      outSeq.push({ text: 'Flag:' + (cnt - 1), kind: 'asciiFlag' });\n    } else {\n      outSeq.push({ text: String(-(cnt - 1)), kind: 'negCount' });\n    }\n  } else {\n    outSeq.push({ text: String(val), kind: 'normal' });\n  }\n  outSeq.push(4);\n\n  var padX = 24;\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'left';\n  ctx.fillText('输入序列 (字符 \"' + ch + '\" = ' + val + ', 重复 ' + cnt + ' 次):', padX, 20);\n\n  var boxW = 36, boxH = 26, step = 40;\n  for (var i = 0; i < inputSeq.length; i++) {\n    var x = padX + i * step;\n    var isRun = (i >= 3 && i < 3 + cnt);\n    ctx.fillStyle = isRun ? 'rgba(245,158,11,0.2)' : 'rgba(56,189,248,0.16)';\n    ctx.strokeStyle = isRun ? '#f59e0b' : '#38bdf8';\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(x, 28, boxW, boxH);\n    ctx.strokeRect(x, 28, boxW, boxH);\n    ctx.fillStyle = isRun ? '#f59e0b' : '#f8fafc';\n    ctx.textAlign = 'center';\n    ctx.font = 'bold 12px monospace';\n    ctx.fillText(String(inputSeq[i]), x + boxW / 2, 45);\n  }\n\n  ctx.font = 'bold 12px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.textAlign = 'left';\n  ctx.fillText((asciiMode ? '8-bit ASCII 游程输出:' : '9-bit PackBits 输出:'), padX, 74);\n\n  var curX = padX;\n  for (var j = 0; j < outSeq.length; j++) {\n    var el = outSeq[j];\n    var text = typeof el === 'number' ? String(el) : el.text;\n    var kind = typeof el === 'number' ? 'normal' : el.kind;\n    var w = text.length > 4 ? 62 : 36;\n    if (kind === 'runVal') { ctx.fillStyle = 'rgba(245,158,11,0.22)'; ctx.strokeStyle = '#f59e0b'; }\n    else if (kind === 'negCount') { ctx.fillStyle = 'rgba(236,72,153,0.22)'; ctx.strokeStyle = '#ec4899'; }\n    else if (kind === 'asciiFlag') { ctx.fillStyle = 'rgba(16,185,129,0.22)'; ctx.strokeStyle = '#10b981'; }\n    else { ctx.fillStyle = 'rgba(56,189,248,0.16)'; ctx.strokeStyle = '#38bdf8'; }\n    ctx.lineWidth = 1.5;\n    ctx.fillRect(curX, 82, w, boxH);\n    ctx.strokeRect(curX, 82, w, boxH);\n    ctx.fillStyle = kind === 'negCount' ? '#ec4899' : (kind === 'asciiFlag' ? '#10b981' : (kind === 'runVal' ? '#f59e0b' : '#f8fafc'));\n    ctx.textAlign = 'center';\n    ctx.font = 'bold 12px monospace';\n    ctx.fillText(text, curX + w / 2, 99);\n    curX += w + 4;\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(padX, 124); ctx.lineTo(W - padX, 124); ctx.stroke();\n\n  if (!asciiMode) {\n    drawWordBits(padX, 152, '0' + toBin(val, 8), '#38bdf8', '#38bdf8', '第1个输出字 (9 bits): 重复值 ' + val, '符号位=0 (正数) + 8-bit 原始字节');\n    if (cnt >= 2) {\n      drawWordBits(360, 152, '1' + toBin(cnt - 1, 8), '#ec4899', '#38bdf8', '第2个输出字 (9 bits): 负计数 -' + (cnt - 1), '符号位=1 (负数标志) -> 解码: |-' + (cnt - 1) + '| + 1 = ' + cnt + '次');\n    } else {\n      ctx.fillStyle = '#94a3b8';\n      ctx.font = '12px monospace';\n      ctx.textAlign = 'left';\n      ctx.fillText('重复次数为 1：未构成游程，仅原样输出 1 个 9-bit 字', 360, 168);\n    }\n    lab.setReadout('模式: 9-bit PackBits  |  输入: ' + inputSeq.length + ' 字节  |  输出: ' + outSeq.length + ' 个 9-bit 字 (共 ' + (outSeq.length * 9) + ' bits，需重打包为 ' + Math.ceil(outSeq.length * 9 / 8) + ' 字节)');\n  } else {\n    drawWordBits(padX, 152, '0' + toBin(val, 7), '#10b981', '#38bdf8', '第1个输出字 (8 bits): ASCII \"' + ch + '\" (' + val + ')', '第8位=0 (普通ASCII) + 7-bit 字符编码');\n    if (cnt >= 2) {\n      drawWordBits(360, 152, '1' + toBin(cnt - 1, 7), '#10b981', '#38bdf8', '第2个输出字 (8 bits): 游程计数 (' + (cnt - 1) + ')', '第8位=1 (RLE进行标志) -> 完美对齐 1 Byte!');\n    } else {\n      ctx.fillStyle = '#94a3b8';\n      ctx.font = '12px monospace';\n      ctx.textAlign = 'left';\n      ctx.fillText('重复次数为 1：未构成游程，直接输出标准 8-bit ASCII', 360, 168);\n    }\n    lab.setReadout('模式: 8-bit ASCII 复用  |  输入: ' + inputSeq.length + ' 字节  |  输出: ' + outSeq.length + ' 字节 (共 ' + (outSeq.length * 8) + ' bits，零位对齐开销)');\n  }\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（警惕文件膨胀）：游程编码不是无条件省空间的。对于“标志位 + 计数值”方案，只有平均游程长度严格大于 2 才能实现压缩；面对白噪声或随机高熵数据（游程几乎全为 1），编码后体积甚至可能翻倍。",
        "避坑 2（字节对齐开销）：像 PackBits 这样扩展出第 9 个符号位的方案，在落盘前需要复杂的位打包（bit-packing）才能塞回 8-bit 字节流。如果数据类型本身有冗余比特（例如 ASCII 只用 7 位），优先借用闲置的高位做标志位。",
        "工程直觉：游程编码极其适合信号空白期、二值图像背景、纯色色块等“局部高度平稳”的数据；在现代压缩标准（如传真机编码、BMP/TIFF、JPEG 量化后的高频零系数）中常作为最后一步折叠大量连续的 0。"
      ]
    }
  ]
});
