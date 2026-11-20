window.__BOOK_REGISTER_SECTION__("sec_197", {
  "title": "LZW 无损压缩算法 (LZW Compression)",
  "intuition": "把重复出现的字节序列动态编进一本双方默契共建的“12位密码本”，既不提前传输字典，又能把一长串字符替换成单个 12-bit 代码实现无损压缩。",
  "blocks": [
    {
      "type": "concept",
      "heading": "核心矛盾：为什么 8 位变 12 位反而能压缩文件？",
      "paragraphs": [
        "**LZW 压缩**（以开发者 A. Lempel、J. Ziv 与改进者 Terry A. Welch 命名）是通用无损数据压缩的基石之一。它被强制用于 **GIF** 图像格式，也是 **TIFF** 和 **PostScript** 的可选压缩方案（曾获美国专利 4,558,302）。对于普通文本或可执行代码，LZW 通常能压缩至原体积的约 **1/2**；而面对表格数字、源代码或采集信号等高冗余数据时，压缩比常可达 **5:1**。",
        "LZW 的核心是一张**码表 (Code Table)**。工程上最常见的选择是 **4096 个条目**，这意味着压缩文件里全是 **12-bit 编码**（因为 2^12 = 4096）。其中前 **0–255** 号编码固定代表输入文件中的单个字节，而 **256–4095** 号编码则用来代表**多字节序列**（例如编码 523 可能代表 `231 124 234` 三个字节）。",
        "这里藏着一个反直觉的陷阱：如果只使用前 256 个单字节编码，原本 8-bit 的每个字节都会变成 12-bit 输出，文件体积反而会**膨胀 50%**！LZW 之所以能赚回空间并实现压缩，全靠编码 **256–4095** 用短短 12-bit 代替更长的重复序列。序列越长、重复越频繁，压缩率就越高。"
      ],
      "formula": {
        "expr": "R_base = 12 bit / 8 bit = 1.50 (纯单字节时体积膨胀 50%)",
        "explain": "当码表中只有 0–255 单字节条目被命中时，输出比特数变为原始的 1.5 倍；只有当 256–4095 的多字节序列（长度 ≥ 2 字节，即 ≥ 16 bit）被反复命中时，12-bit 输出才开始净赚体积。"
      }
    },
    {
      "type": "concept",
      "heading": "绝妙的设计：如何做到“不传码表”却能完美还原？",
      "paragraphs": [
        "基于码表的压缩面临两大工程难题：（1）如何决定把哪些字节序列放进码表？（2）解压端怎样才能拿到和压缩端一模一样的码表？如果把庞大的码表附在文件头一起发送，小文件的压缩收益可能瞬间被抵消。",
        "LZW 用一个极其优雅的机制同时解决了这两个问题：**压缩从序列“第二次”出现时才真正开始**。程序启动时，码表只初始化 0–255 单字节，256–4095 全为空白。每当遇到一个新序列时，LZW **先将其拆解为已知的更短编码（最初就是 0–255 单字节）写入压缩流，然后才把这个新序列注册到码表中**。",
        "正因为“先输出旧编码、后登记新条目”，解压端只需从头读取压缩流，就能严格滞后一步、分毫不差地**从压缩数据本身动态重构出同一张码表**，完全无需额外传输字典！"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：LZW 压缩状态机与码表实时推演 (复现原书 Table 27-3)",
      "instruction": "拖动“算法执行步数”滑块，逐字节观察原书例句 the/rain/in/Spain/falls/mainly/on/the/plain/ 的贪心匹配与建表过程；也可切换“高冗余文本”对比压缩率剧变。",
      "controls": [
        {
          "type": "slider",
          "id": "step",
          "label": "算法执行步数 (Step)",
          "min": 1,
          "max": 45,
          "step": 1,
          "value": 12,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "highRedun",
          "label": "切换高冗余重复文本 (对比 5:1 极高压缩)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst BOOK_STR = 'the/rain/in/Spain/falls/mainly/on/the/plain/';\nconst REDUN_STR = 'the/the/the/the/the/the/the/the/the/the/the/t';\n\nfunction simulateLZW(text, targetStep) {\n  const dict = {};\n  const added = [];\n  const outputs = [];\n  let str = text[0];\n  let info = { step: 1, char: text[0], combo: text[0], hit: null, outCode: null, newEntry: null, strStart: 0, charIdx: 0 };\n  let strStart = 0;\n  for (let i = 1; i <= text.length; i++) {\n    const stepNum = i + 1;\n    if (stepNum > targetStep) break;\n    if (i === text.length) {\n      const outCode = str.length === 1 ? str.charCodeAt(0) : dict[str];\n      outputs.push({ code: outCode, text: str });\n      info = { step: stepNum, char: 'EOF', combo: str, hit: 'EOF', outCode: outCode, newEntry: null, strStart: strStart, charIdx: text.length };\n      break;\n    }\n    const ch = text[i];\n    const combo = str + ch;\n    if (dict[combo] !== undefined) {\n      const hitCode = dict[combo];\n      str = combo;\n      info = { step: stepNum, char: ch, combo: combo, hit: hitCode, outCode: null, newEntry: null, strStart: strStart, charIdx: i };\n    } else {\n      const outCode = str.length === 1 ? str.charCodeAt(0) : dict[str];\n      outputs.push({ code: outCode, text: str });\n      const newCode = 256 + added.length;\n      dict[combo] = newCode;\n      const entry = { code: newCode, str: combo };\n      added.push(entry);\n      info = { step: stepNum, char: ch, combo: combo, hit: false, outCode: outCode, newEntry: entry, strStart: strStart, charIdx: i };\n      str = ch;\n      strStart = i;\n    }\n  }\n  return { info, added, outputs, curStr: str };\n}\n\nfunction draw() {\n  const step = Math.min(45, Math.max(1, Math.round(lab.values.step)));\n  const text = lab.values.highRedun ? REDUN_STR : BOOK_STR;\n  const res = simulateLZW(text, step);\n  const info = res.info;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 40; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  ctx.font = 'bold 11px monospace';\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('输入字节流 (44 Bytes + EOF):', 14, 18);\n\n  const startX = 14;\n  const cellW = 15.2;\n  for (let i = 0; i < text.length; i++) {\n    const x = startX + i * cellW;\n    const isChar = (i === info.charIdx && step > 1);\n    const inStr = (i >= info.strStart && i < info.charIdx) || (step === 1 && i === 0);\n    if (isChar) {\n      ctx.fillStyle = 'rgba(245,158,11,0.28)';\n      ctx.fillRect(x - 1, 24, 14, 20);\n      ctx.strokeStyle = '#f59e0b';\n      ctx.strokeRect(x - 1, 24, 14, 20);\n    } else if (inStr) {\n      ctx.fillStyle = 'rgba(56,189,248,0.22)';\n      ctx.fillRect(x - 1, 24, 14, 20);\n    }\n    ctx.font = 'bold 13px monospace';\n    ctx.fillStyle = isChar ? '#f59e0b' : (inStr ? '#38bdf8' : (i < info.strStart ? '#475569' : '#cbd5e1'));\n    ctx.fillText(text[i], x + 2, 39);\n  }\n  if (info.char === 'EOF') {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 10px monospace';\n    ctx.fillText('EOF', startX + text.length * cellW, 38);\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(14, 54, 366, 120);\n  ctx.strokeRect(14, 54, 366, 120);\n\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('当前步骤 #' + info.step + '  |  CHAR = ' + (info.char === 'EOF' ? 'EOF' : '\"' + info.char + '\"'), 24, 74);\n\n  ctx.font = 'bold 13px monospace';\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('STRING + CHAR = \"' + info.combo + '\"', 24, 98);\n\n  if (info.step === 1) {\n    ctx.fillStyle = '#94a3b8';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('Box 1: 读入首字符存入 STRING，暂不查表输出', 24, 126);\n  } else if (info.hit === 'EOF') {\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('Box 9 (EOF): 输入结束，输出末尾 STRING 编码 ' + info.outCode, 24, 126);\n  } else if (info.hit !== false) {\n    ctx.fillStyle = 'rgba(16,185,129,0.2)';\n    ctx.fillRect(22, 110, 348, 26);\n    ctx.fillStyle = '#10b981';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('Box 3 -> YES! 命中码表 #' + info.hit + ' (贪心延长 STRING)', 28, 127);\n  } else {\n    ctx.fillStyle = 'rgba(236,72,153,0.18)';\n    ctx.fillRect(22, 110, 348, 26);\n    ctx.fillStyle = '#ec4899';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText('Box 3 -> NO! 未命中，触发输出与建表', 28, 127);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = '11px monospace';\n    ctx.fillText('Box 4 输出编码: ' + info.outCode + '  |  Box 5 新增: ' + info.newEntry.code + ' = \"' + info.newEntry.str + '\"', 24, 155);\n  }\n  ctx.fillStyle = '#38bdf8';\n  ctx.font = '11px monospace';\n  ctx.fillText('更新后 New STRING = \"' + res.curStr + '\"', 24, 168);\n\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(390, 54, 316, 120);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.strokeRect(390, 54, 316, 120);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('动态新建码表 (共 ' + res.added.length + ' 条扩展项)', 400, 74);\n\n  const showAdded = res.added.slice(-10);\n  ctx.font = '11px monospace';\n  for (let j = 0; j < showAdded.length; j++) {\n    const item = showAdded[j];\n    const col = j < 5 ? 0 : 1;\n    const row = j % 5;\n    const tx = 400 + col * 154;\n    const ty = 94 + row * 16;\n    const isNew = info.newEntry && info.newEntry.code === item.code;\n    const isHit = info.hit === item.code;\n    ctx.fillStyle = isNew ? '#ec4899' : (isHit ? '#10b981' : '#cbd5e1');\n    ctx.fillText(item.code + ' = \"' + item.str + '\"', tx, ty);\n  }\n\n  ctx.fillStyle = 'rgba(15,23,42,0.9)';\n  ctx.fillRect(14, 182, 692, 50);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.strokeRect(14, 182, 692, 50);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('已输出 12-bit 编码流 (' + res.outputs.length + ' 个):', 24, 200);\n\n  const recentOut = res.outputs.slice(-15);\n  let ox = 24;\n  if (res.outputs.length > 15) {\n    ctx.fillStyle = '#64748b';\n    ctx.font = '11px monospace';\n    ctx.fillText('...', ox, 220);\n    ox += 24;\n  }\n  for (let k = 0; k < recentOut.length; k++) {\n    const o = recentOut[k];\n    ctx.fillStyle = o.code >= 256 ? '#10b981' : '#38bdf8';\n    ctx.font = 'bold 11px monospace';\n    const label = String(o.code);\n    ctx.fillText(label, ox, 220);\n    ox += label.length * 7.2 + 9;\n  }\n\n  const processedBytes = Math.min(text.length, step);\n  const rawBits = processedBytes * 8;\n  const compBits = res.outputs.length * 12;\n  const ratio = compBits > 0 ? (rawBits / compBits).toFixed(2) : '—';\n  lab.setReadout('步数 ' + step + '/45 | 已处理 ' + processedBytes + ' 字节 (' + rawBits + ' bits) -> 输出 ' + res.outputs.length + ' 个 12-bit 码 (' + compBits + ' bits) | 当前压缩比: ' + ratio + ':1');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "压缩流程图解析：STRING 与 CHAR 的“贪心最长匹配”",
      "paragraphs": [
        "LZW 压缩算法（原书 Fig. 27-7）只需两个核心变量：`CHAR`（单个当前字节，0–255）和 `STRING`（可变长度的当前前缀字符串）。算法启动后（Box 1），先读取文件第一个字节存入 `STRING`，随后进入主循环：",
        "每次读取下一字节存入 `CHAR`（Box 2），并拼接出 `STRING + CHAR`，查询码表中是否已有对应编码（Box 3）：",
        "1. **如果未命中 (NO)**：执行三连动作——将当前 `STRING` 对应的 12-bit 编码写入压缩文件（Box 4）；为 `STRING + CHAR` 分配下一个空闲编码并写入码表（Box 5）；重置 `STRING = CHAR` 重新开始积累（Box 6）。例如例句前 10 个字节均未命中，逐个建出 256=`th` 到 264=`/i`。",
        "2. **如果命中 (YES)**：只做一件事——令 `STRING = STRING + CHAR`（Box 7），**不输出任何编码**！这是“贪心最长匹配”的精髓：既然 `in` 已经在表里了，就继续往后看有没有更长的 `in/` 或 `ainl` 也在表里，直到匹配失败时才输出当前能找到的最长序列编码。文件读完后（Box 9），把留在 `STRING` 里的最后一段编码输出收尾。"
      ],
      "formula": {
        "expr": "若 (STRING + CHAR) ∈ Table ⇒ STRING ← STRING + CHAR；否则 Output(Code(STRING)) 并登记 (STRING + CHAR)",
        "explain": "LZW 压缩的状态转移核心：只要能匹配到更长的串就继续吞并 CHAR，直到失配才输出最长已知前缀的编码并登记新扩展串。"
      }
    },
    {
      "type": "concept",
      "heading": "解压的唯一漏洞：当收到“码表里还不存在的编码”时怎么办？",
      "paragraphs": [
        "解压算法（原书 Fig. 27-8）使用 `OCODE`（上一个旧编码）和 `NCODE`（当前新读入编码）。开局先读入第一个编码存入 `OCODE` 并直接查表输出；随后每读入一个 `NCODE`，查出其翻译文本 `STRING` 并输出，取 `STRING` 的**首字符** `CHAR`，在本地码表补登一条 `OCODE + CHAR`，最后令 `OCODE = NCODE`。",
        "由于压缩端总是“先输出旧码、后建新码”，绝大多数情况下，解压端收到 `NCODE` 时，该编码一定已经在前一步被同步建出来了。**但存在一种特殊的边界漏洞（Contingency，Fig. 27-8 的 Box 4–6）**：当输入数据出现形如 `abababa`（通用模式 `KwKwK`）的连续交错重复时，压缩端刚登记完新码（比如 `258 = aba`），紧接着下一个窗口就立刻匹配并输出了 `258`！",
        "此时解压端收到 `NCODE = 258` 时，由于它滞后一步，码表里根本还没有 258！破解之道极其巧妙：之所以压缩端能立刻用到刚建出的 `258`，说明新编码的内容必定等于**上一个编码的译文加上它自己的首字符**，即 `STRING = translation(OCODE) + CHAR`（其中 `CHAR` 是上一步留下的 `translation(OCODE)` 的首字符）。补全这一步后，输出 `STRING` 并顺理成章把 `258` 补进码表，完美化险为夷！"
      ],
      "formula": {
        "expr": "当 NCODE ∉ Table 时：STRING = Translation(OCODE) + FirstChar(Translation(OCODE))",
        "explain": "解压缺码漏洞的自救公式：新收到的未知编码一定是刚生成的“前串 + 前串首字符”模式（如 OCODE='ab' 衍生出 'aba'）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：LZW 解压“缺码漏洞”复现与压缩率边界实验",
      "instruction": "开启“缺码边界用例”并将解压步数拖到第 4 步，观察 NCODE=258 未命中时 Box 5-6 如何自救；拖动“数据冗余度”观察右侧 50% 体积膨胀陷阱与 5:1 压缩极限。",
      "controls": [
        {
          "type": "slider",
          "id": "decStep",
          "label": "解压推进步数 (Step)",
          "min": 1,
          "max": 6,
          "step": 1,
          "value": 4,
          "unit": " 步"
        },
        {
          "type": "toggle",
          "id": "edgeCase",
          "label": "触发解压缺码边界用例 (ababababab)",
          "value": true
        },
        {
          "type": "slider",
          "id": "redundancy",
          "label": "右侧曲线：输入数据冗余度",
          "min": 0,
          "max": 100,
          "step": 5,
          "value": 60,
          "unit": "%"
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nconst EDGE_CODES = [97, 98, 256, 258, 257, 98];\nconst NORM_CODES = [105, 110, 47, 256, 258, 257];\n\nfunction runDecode(codes, maxStep) {\n  const table = {};\n  for (let i = 0; i < 256; i++) table[i] = String.fromCharCode(i);\n  const added = [];\n  let ocode = codes[0];\n  let str = table[ocode];\n  let ch = str[0];\n  let out = str;\n  let state = { step: 1, ocode: null, ncode: ocode, inTable: true, str: str, added: null, out: out };\n  for (let s = 2; s <= maxStep && s <= codes.length; s++) {\n    const ncode = codes[s - 1];\n    let hit = true;\n    if (table[ncode] !== undefined) {\n      str = table[ncode];\n    } else {\n      hit = false;\n      str = table[ocode] + ch;\n    }\n    out += str;\n    ch = str[0];\n    const newCode = 256 + added.length;\n    const newVal = table[ocode] + ch;\n    table[newCode] = newVal;\n    added.push({ code: newCode, val: newVal });\n    state = { step: s, ocode: ocode, ncode: ncode, inTable: hit, str: str, char: ch, added: { code: newCode, val: newVal }, out: out };\n    ocode = ncode;\n  }\n  return { state, added, table };\n}\n\nfunction draw() {\n  const decStep = Math.min(6, Math.max(1, Math.round(lab.values.decStep)));\n  const isEdge = lab.values.edgeCase;\n  const redun = lab.values.redundancy / 100;\n  const codes = isEdge ? EDGE_CODES : NORM_CODES;\n  const res = runDecode(codes, decStep);\n  const st = res.state;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.06)';\n  ctx.lineWidth = 1;\n  for (let gx = 40; gx < W; gx += 40) { ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke(); }\n  for (let gy = 40; gy < H; gy += 40) { ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke(); }\n\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(12, 10, 404, 220);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.strokeRect(12, 10, 404, 220);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('LZW 解压重建 (Fig 27-8)  |  输入码流:', 22, 28);\n\n  let cx = 22;\n  for (let i = 0; i < codes.length; i++) {\n    const active = (i === decStep - 1);\n    const past = (i < decStep - 1);\n    ctx.fillStyle = active ? (st.inTable ? '#38bdf8' : '#ec4899') : (past ? '#10b981' : '#64748b');\n    if (active) {\n      ctx.fillRect(cx - 3, 35, 34, 18);\n      ctx.fillStyle = '#0b1120';\n    }\n    ctx.font = 'bold 12px monospace';\n    ctx.fillText(String(codes[i]), cx, 48);\n    cx += 42;\n  }\n\n  if (st.step === 1) {\n    ctx.fillStyle = '#38bdf8';\n    ctx.font = '12px sans-serif';\n    ctx.fillText('Box 1-2: 读入首个编码 OCODE=' + st.ncode + ' -> 输出 \"' + st.str + '\"', 22, 82);\n  } else {\n    ctx.fillStyle = '#cbd5e1';\n    ctx.font = '12px monospace';\n    ctx.fillText('OCODE = ' + st.ocode + ' (\"' + res.table[st.ocode] + '\")   |   NCODE = ' + st.ncode, 22, 78);\n    if (!st.inTable) {\n      ctx.fillStyle = 'rgba(236,72,153,0.22)';\n      ctx.fillRect(20, 88, 386, 48);\n      ctx.strokeStyle = '#ec4899';\n      ctx.strokeRect(20, 88, 386, 48);\n      ctx.fillStyle = '#ec4899';\n      ctx.font = 'bold 12px sans-serif';\n      ctx.fillText('警告 Box 4->NO: NCODE=' + st.ncode + ' 尚未建表!', 28, 106);\n      ctx.fillStyle = '#f8fafc';\n      ctx.font = '11px monospace';\n      ctx.fillText('Box 5-6 自救: STRING = 表[' + st.ocode + '] + \"' + st.char + '\" = \"' + st.str + '\"', 28, 126);\n    } else {\n      ctx.fillStyle = 'rgba(16,185,129,0.16)';\n      ctx.fillRect(20, 88, 386, 48);\n      ctx.fillStyle = '#10b981';\n      ctx.font = 'bold 12px sans-serif';\n      ctx.fillText('Box 4->YES: NCODE=' + st.ncode + ' 在表中找到 -> \"' + st.str + '\"', 28, 108);\n      ctx.fillStyle = '#cbd5e1';\n      ctx.font = '11px monospace';\n      ctx.fillText('Box 8-9: 输出 \"' + st.str + '\"，提取首字符 CHAR = \"' + st.char + '\"', 28, 126);\n    }\n    ctx.fillStyle = '#f59e0b';\n    ctx.font = '11px monospace';\n    ctx.fillText('Box 10 重建字典: 新增 ' + st.added.code + ' = \"' + st.added.val + '\"', 22, 156);\n  }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('解码端同步重建码表:', 22, 178);\n  let tx = 140;\n  ctx.font = '11px monospace';\n  for (let k = 0; k < res.added.length; k++) {\n    const a = res.added[k];\n    ctx.fillStyle = (st.added && st.added.code === a.code) ? '#f59e0b' : '#cbd5e1';\n    ctx.fillText(a.code + ':' + a.val, tx, 178);\n    tx += 66;\n  }\n\n  ctx.fillStyle = '#10b981';\n  ctx.font = 'bold 13px monospace';\n  ctx.fillText('还原输出: \"' + st.out + '\"', 22, 210);\n\n  ctx.fillStyle = 'rgba(15,23,42,0.85)';\n  ctx.fillRect(426, 10, 282, 220);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.strokeRect(426, 10, 282, 220);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.fillText('体积倍率 (压缩后 / 原始 8-bit)', 438, 28);\n\n  const px = 456, py = 46, pw = 236, ph = 148;\n  ctx.strokeStyle = 'rgba(255,255,255,0.15)';\n  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px, py + ph); ctx.lineTo(px + pw, py + ph); ctx.stroke();\n\n  const yBase10 = py + ph - (1.0 / 1.65) * ph;\n  const yTrap15 = py + ph - (1.5 / 1.65) * ph;\n  ctx.setLineDash([4, 4]);\n  ctx.strokeStyle = '#94a3b8';\n  ctx.beginPath(); ctx.moveTo(px, yBase10); ctx.lineTo(px + pw, yBase10); ctx.stroke();\n  ctx.strokeStyle = '#ec4899';\n  ctx.beginPath(); ctx.moveTo(px, yTrap15); ctx.lineTo(px + pw, yTrap15); ctx.stroke();\n  ctx.setLineDash([]);\n\n  ctx.font = '10px monospace';\n  ctx.fillStyle = '#ec4899';\n  ctx.fillText('1.5x (+50%膨胀)', px + 4, yTrap15 - 4);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('1.0x (原体积)', px + 4, yBase10 - 4);\n\n  const targetSteady = 1.5 / (1 + 6.5 * Math.pow(redun, 1.35));\n  ctx.strokeStyle = targetSteady > 1.0 ? '#ec4899' : '#10b981';\n  ctx.lineWidth = 2.5;\n  ctx.beginPath();\n  let endRatio = 1.5;\n  for (let i = 0; i <= 50; i++) {\n    const t = i / 50;\n    const ratio = targetSteady + (1.5 - targetSteady) * Math.exp(-4.5 * t * (0.25 + redun));\n    if (i === 50) endRatio = ratio;\n    const gx = px + t * pw;\n    const gy = py + ph - (Math.min(1.6, ratio) / 1.65) * ph;\n    if (i === 0) ctx.moveTo(gx, gy); else ctx.lineTo(gx, gy);\n  }\n  ctx.stroke();\n  ctx.lineWidth = 1;\n\n  const compRate = (1 / endRatio).toFixed(2);\n  ctx.fillStyle = endRatio > 1.0 ? '#ec4899' : '#10b981';\n  ctx.font = 'bold 12px monospace';\n  ctx.fillText(endRatio > 1.0 ? '最终体积 ' + (endRatio * 100).toFixed(0) + '% (反增)' : '最终压缩比 ' + compRate + ':1', px + 48, py + ph + 20);\n  ctx.fillStyle = '#64748b';\n  ctx.font = '10px sans-serif';\n  ctx.fillText('0 KB', px, py + ph + 12);\n  ctx.fillText('4 KB', px + pw - 24, py + ph + 12);\n\n  lab.setReadout('解压 Step ' + decStep + '/6 | 输出=\"' + st.out + '\" | ' + (!st.inTable ? '触发 Box 5-6 缺码自救!' : '正常查表还原') + ' | 冗余度 ' + lab.values.redundancy + '% -> 稳态压缩比 ' + compRate + ':1');\n}\n\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "商业级工程优化：如何省下内存并把查表加速百倍？",
      "paragraphs": [
        "最基础的 LZW 算法只需要几十行代码就能跑通，但要把码表管理得既省内存又飞快，才是商业软件的核心壁垒（也是诸多压缩软件专利护城河所在）：",
        "1. **内存优化——用“前驱编码 + 单字符”替代完整字符串**：如果直接为 4096 个条目保存可变长度的字符串，你事先根本不知道字符串会长到多少字节，内存开销极难控制。利用码表自身的冗余树状结构，**每一个新编码都可以表示为“某一个已有旧编码 + 一个新字符”**。例如表 27-3 第 29 行 `278 = ainl`，只需存储为 `code 269 + 'l'`；而 `269 = ain` 本身又存储为 `code 261 + 'n'`。每个条目体积固定、极度紧凑。",
        "2. **速度优化——拒绝全表遍历，改用哈希/分桶索引**：压缩过程最耗时的操作是在 4096 个条目中查找 `STRING + CHAR` 是否存在。如果顺序遍历全表，就像拿着一本**按电话号码排序的电话簿**去找朋友的名字一样痛苦。高效实现不会把 4096 个条目按编号顺序塞进数组，而是根据 `CHAR` 或 `(prefix_code, CHAR)` 的哈希函数直接定位内存桶（类似按首字母分区的电话簿），实现接近常数时间的快速查找。"
      ],
      "formula": {
        "expr": "Entry[k] = (PrefixCode, CHAR)  |  BucketIndex = Hash(PrefixCode, CHAR)",
        "explain": "树状前缀表示法将任意长字符串压缩为定长二元组 (前驱编码, 尾字符)；哈希分桶则用 (前驱编码, 尾字符) 直接算出查找起点，避免 O(4096) 的线性扫描。"
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "避坑 1（50% 膨胀陷阱）：LZW 输出固定 12-bit 编码。如果对已经加密、压缩过或纯随机的高熵数据强行套用 LZW，几乎只会命中 0–255 单字节，结果文件体积不降反增 50%！",
        "避坑 2（贪心延迟输出）：遇到 `STRING + CHAR` 命中时千万别急着输出，必须继续吞并下一个字节尝试更长匹配；循环结束后也别忘了在 EOF 处吐出留在 `STRING` 里的最后一段编码。",
        "避坑 3（解压缺码边界）：自己手写 LZW 解码器时，必须实现 `NCODE ∉ Table` 的自救分支（`STRING = 表[OCODE] + 表[OCODE][0]`），否则遇到 `abababa` 这类交错重复串必然崩溃。",
        "核心工程口诀：压缩端“先吐旧码、后建新表”是免传字典的根基；“前驱码 + 单字符”省内存，哈希分桶索引提速度。"
      ]
    }
  ]
});
