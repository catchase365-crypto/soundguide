window.__BOOK_REGISTER_SECTION__("sec_184", {
  "title": "形态学图像处理 (Morphological Image Processing)",
  "intuition": "把灰度图变成非黑即白的二值轮廓后，用一套“按邻域规则削皮或增肥”的局部逻辑手术，去噪点、填孔洞、抽骨架、提矢量。",
  "blocks": [
    {
      "type": "concept",
      "heading": "一、从灰度到二值：形态学处理的“积木化”战场",
      "paragraphs": [
        "在图像中识别目标（例如红外图中的坦克、太空照片里的小行星、X 光片里的疑似肿瘤）是非常困难的。简化问题最直接的手段，就是通过**阈值分割（Thresholding）**把灰度图像变成**二值图像（Binary Image）**：大于阈值的像素设为 `1`（或 `255`），小于阈值的设为 `0`。为了避免光线不均导致分割失败，工程上通常会在阈值化之前先做**光照平坦化（Illumination Flattening）**等线性预处理。",
        "二值图像的处理常被称为**斑点分析（Blob Analysis）**、**连通性分析（Connectivity Analysis）**或**形态学图像处理（Morphological Image Processing，源自希腊语 morphe，意为形状或形态）**。虽然它的数学根基是严谨的集合论，但在实际工程中几乎用不到那么高深的理论——绝大多数形态学算法都是极其直观、甚至带点“经验试错（ad hoc）”色彩的局部逻辑操作，更像是一门靠“工具箱技巧”打磨的手艺。"
      ],
      "formula": {
        "expr": "B[r, c] = (I[r, c] > T) ? 1 : 0",
        "explain": "I[r, c] 为线性预处理后的灰度像素值，T 为人工或自适应选定的分割阈值，B[r, c] 为最终的非黑即白二值像素。"
      }
    },
    {
      "type": "concept",
      "heading": "二、四大基本手术：腐蚀、膨胀、开运算与闭运算",
      "paragraphs": [
        "所有复杂形态学操作都建立在最基础的“剥皮”与“长肉”之上：**腐蚀（Erosion）**是指让每一个“紧挨着背景像素的目标像素”变成背景像素——它会让目标变小，甚至把粘连的一个物体拆成多个；**膨胀（Dilation）**则正好相反，让每一个“紧挨着目标像素的背景像素”变成目标像素——它会让目标变大，并把断开的邻近目标合并成一个。",
        "单独用腐蚀或膨胀会改变物体原本的尺寸，因此工程上常把它们串联使用：**开运算（Opening）**定义为“先腐蚀，再膨胀”，它能精准抹除背景中孤立的**目标像素小岛（噪点）和细长毛刺**，同时大致保持主体大小不变；**闭运算（Closing）**定义为“先膨胀，再腐蚀”，它能巧妙填平目标内部的**背景小孔洞（Holes）与细窄裂缝**，并让目标轮廓变得平滑。"
      ],
      "formula": {
        "expr": "Opening(X) = Dilation(Erosion(X)) ,  Closing(X) = Erosion(Dilation(X))",
        "explain": "X 代表二值目标集合；开运算先瘦身再复原，专治“体外孤立白噪点”；闭运算先增肥再瘦身，专治“体内黑孔洞与缺口”。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：四大形态学算子与去噪手术台",
      "instruction": "拖动“形态学操作”滑块切换原图/腐蚀/膨胀/开运算/闭运算，调节“噪点与孔洞强度”，观察绿色新增像素与粉色被削去像素的变化，并对比 8 邻域与 4 邻域的差异。",
      "controls": [
        {
          "type": "slider",
          "id": "op",
          "label": "形态学操作 (0原图 1腐蚀 2膨胀 3开 4闭)",
          "min": 0,
          "max": 4,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "noise",
          "label": "随机噪点与孔洞数量",
          "min": 0,
          "max": 12,
          "step": 1,
          "value": 6,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "conn8",
          "label": "使用 8 邻域 (包含对角线接触)",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst COLS = 20;\nconst ROWS = 14;\nconst CELL = 11;\n\nconst baseShape = [\n  '00000000000000000000',\n  '00000111111110000000',\n  '00001111111111000000',\n  '00001111001111100000',\n  '00000000000111110000',\n  '00000011111111110000',\n  '00000111111111100000',\n  '00000000001111110000',\n  '00000000000111110000',\n  '00001111001111100000',\n  '00001111111111000000',\n  '00000111111110000000',\n  '00000000000000000000',\n  '00000000000000000000'\n];\n\nconst islands = [[1,2],[2,17],[4,2],[6,18],[10,1],[12,16],[1,15],[8,2],[12,3],[3,1],[11,18],[7,1]];\nconst holes = [[2,7],[5,11],[6,9],[10,8],[1,9],[5,13],[8,13],[10,11],[3,12],[6,7],[11,9],[4,13]];\n\nfunction makeGrid(noiseLevel) {\n  const g = [];\n  for (let r = 0; r < ROWS; r++) {\n    const row = [];\n    for (let c = 0; c < COLS; c++) {\n      row.push(baseShape[r][c] === '1' ? 1 : 0);\n    }\n    g.push(row);\n  }\n  for (let i = 0; i < noiseLevel; i++) {\n    if (i < islands.length) g[islands[i][0]][islands[i][1]] = 1;\n    if (i < holes.length) g[holes[i][0]][holes[i][1]] = 0;\n  }\n  return g;\n}\n\nfunction cloneGrid(g) {\n  return g.map(r => r.slice());\n}\n\nfunction stepMorph(g, mode, use8) {\n  const out = cloneGrid(g);\n  const dirs4 = [[-1,0],[1,0],[0,-1],[0,1]];\n  const dirs8 = [[-1,-1],[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1]];\n  const dirs = use8 ? dirs8 : dirs4;\n  for (let r = 0; r < ROWS; r++) {\n    for (let c = 0; c < COLS; c++) {\n      if (mode === 'erode' && g[r][c] === 1) {\n        let touchBg = false;\n        for (let k = 0; k < dirs.length; k++) {\n          const nr = r + dirs[k][0], nc = c + dirs[k][1];\n          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || g[nr][nc] === 0) {\n            touchBg = true; break;\n          }\n        }\n        if (touchBg) out[r][c] = 0;\n      } else if (mode === 'dilate' && g[r][c] === 0) {\n        let touchObj = false;\n        for (let k = 0; k < dirs.length; k++) {\n          const nr = r + dirs[k][0], nc = c + dirs[k][1];\n          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && g[nr][nc] === 1) {\n            touchObj = true; break;\n          }\n        }\n        if (touchObj) out[r][c] = 1;\n      }\n    }\n  }\n  return out;\n}\n\nfunction drawGrid(x0, y0, grid, refGrid, title) {\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(title, x0, y0 - 10);\n  for (let r = 0; r < ROWS; r++) {\n    for (let c = 0; c < COLS; c++) {\n      const x = x0 + c * CELL;\n      const y = y0 + r * CELL;\n      const val = grid[r][c];\n      const ref = refGrid ? refGrid[r][c] : val;\n      if (val === 1 && ref === 1) {\n        ctx.fillStyle = '#38bdf8';\n      } else if (val === 1 && ref === 0) {\n        ctx.fillStyle = '#10b981';\n      } else if (val === 0 && ref === 1) {\n        ctx.fillStyle = 'rgba(236, 72, 153, 0.28)';\n      } else {\n        ctx.fillStyle = '#0f172a';\n      }\n      ctx.fillRect(x, y, CELL - 1, CELL - 1);\n      if (val === 0 && ref === 1) {\n        ctx.strokeStyle = '#ec4899';\n        ctx.lineWidth = 1;\n        ctx.strokeRect(x + 0.5, y + 0.5, CELL - 2, CELL - 2);\n      } else {\n        ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n        ctx.lineWidth = 0.5;\n        ctx.strokeRect(x, y, CELL, CELL);\n      }\n    }\n  }\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  const op = Math.round(lab.values.op);\n  const noise = Math.round(lab.values.noise);\n  const use8 = !!lab.values.conn8;\n  const orig = makeGrid(noise);\n  let res = cloneGrid(orig);\n  const names = ['原图 (无操作)', '腐蚀 Erosion', '膨胀 Dilation', '开运算 Opening (先腐蚀后膨胀)', '闭运算 Closing (先膨胀后腐蚀)'];\n  if (op === 1) res = stepMorph(orig, 'erode', use8);\n  else if (op === 2) res = stepMorph(orig, 'dilate', use8);\n  else if (op === 3) res = stepMorph(stepMorph(orig, 'erode', use8), 'dilate', use8);\n  else if (op === 4) res = stepMorph(stepMorph(orig, 'dilate', use8), 'erode', use8);\n\n  drawGrid(34, 42, orig, null, '输入：含噪点与孔洞的二值图像');\n  drawGrid(466, 42, res, orig, '输出：' + names[op]);\n\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(276, 118);\n  ctx.lineTo(442, 118);\n  ctx.lineTo(432, 112);\n  ctx.moveTo(442, 118);\n  ctx.lineTo(432, 124);\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  const pipeText = op === 0 ? '直通输出' : op === 1 ? '单次腐蚀' : op === 2 ? '单次膨胀' : op === 3 ? '腐蚀 -> 膨胀' : '膨胀 -> 腐蚀';\n  ctx.fillText(pipeText, 359, 106);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText(use8 ? '判定窗口: 3x3 (8邻域)' : '判定窗口: 十字 (4邻域)', 359, 138);\n  ctx.textAlign = 'left';\n\n  let added = 0, removed = 0, total = 0;\n  for (let r = 0; r < ROWS; r++) {\n    for (let c = 0; c < COLS; c++) {\n      if (res[r][c] === 1) total++;\n      if (res[r][c] === 1 && orig[r][c] === 0) added++;\n      if (res[r][c] === 0 && orig[r][c] === 1) removed++;\n    }\n  }\n  ctx.fillStyle = '#10b981'; ctx.fillRect(466, 210, 10, 10);\n  ctx.fillStyle = '#cbd5e1'; ctx.font = '11px sans-serif'; ctx.fillText('新增目标像素(填补)', 480, 219);\n  ctx.fillStyle = '#ec4899'; ctx.fillRect(596, 210, 10, 10);\n  ctx.fillStyle = '#cbd5e1'; ctx.fillText('被擦除像素(去噪)', 610, 219);\n\n  lab.setReadout('当前模式: ' + names[op] + ' | 有效目标像素: ' + total + ' | 粉色擦除: ' + removed + ' | 绿色新增: ' + added);\n}\n\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "三、指纹骨架化：两阶段标记与“四条铁律”",
      "paragraphs": [
        "在指纹比对等任务中，粗细不一的脊线需要被提纯为**仅单像素宽的骨架（Skeletonization）**。如果扫描图像时边判定边直接把黑色目标（`0`）改写为白色背景（`255`），就会因为“从上到下、从左到右”的扫描顺序导致脊线单侧偏心腐蚀。为此，教材表 25-1 展示了一个精妙的**两阶段标记机制**：第一遍扫描只把满足删除条件的黑像素临时标记为 `1`（在逻辑上仍视为黑像素参与邻居判定）；整幅图评估完后，第二遍扫描再统一把所有 `1` 改为 `255`。这样就能确保粗脊线从四面八方**各向同性地均匀变细**，通常迭代 6 次即可成型。",
        "那么，一个像素 `[R, C]` 到底能不能被安全剥离呢？表 25-2 的子程序规定必须同时满足**四条规则**：\n1. **规则一（自身是黑）**：当前像素必须是目标像素（`0`），若已是背景（`255`）则跳过。\n2. **规则二（至少挨着一个白近邻）**：像素的 8 个邻居中，上下左右（编号 `2,4,6,8`）叫**近邻（Close Neighbors）**，对角线（编号 `1,3,5,7`）叫**远邻（Distant Neighbors）**。规则要求至少有一个近邻是白色，确保只从外表面剥皮。至于为何只查近邻而不查全部 8 个邻居，答案很工程——跑实验对比发现这样效果更好！\n3. **规则三（不能是线头）**：8 个邻居中至少有 2 个黑像素。如果只有 1 个黑邻居，说明它是线条的端点，绝不能删。\n4. **规则四（不能扯断连通性）**：剥离它之后，原本互相连通的黑邻居不能分裂成两截！判断方法极具巧思：顺时针绕着 8 个邻居走一圈，统计**“黑变白（Black-to-White）”跳变的次数**。若跳变次数为 `0` 或 `1`，说明黑邻居抱成一团（连通），可以删；若大于 `1`，说明会造成断裂，禁止删除！（注意细节：当从近邻 `2,4,6,8` 顺时针往下走时，只有当紧挨着的对角远邻和下一个近邻**同时为白**，才算一次有效断裂跳变，因为对角线上的两个近邻本身就可以斜向相连。）"
      ],
      "formula": {
        "expr": "Transitions_CW(N1..N8) <= 1  =>  Connected",
        "explain": "按顺时针方向（1→2→3→4→5→6→7→8→1）统计周围 8 个邻居的“黑到白”跳变总数：总数 <= 1 表示所有黑邻居连通成单一群体，总数 > 1 表示已分裂成多组。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：骨架化逐次迭代与规则四“连通性跳变”探针",
      "instruction": "左侧拖动“骨架化迭代次数”观察粗脊线如何逐轮被均匀剥离为单像素骨架（橙色为当前轮被标记为 1 的待擦除像素）；右侧切换“规则四测试案例”，观察顺时针黑白跳变数如何决定连通性。",
      "controls": [
        {
          "type": "slider",
          "id": "iter",
          "label": "骨架化迭代轮次 (Iter)",
          "min": 0,
          "max": 6,
          "step": 1,
          "value": 1,
          "unit": " 轮"
        },
        {
          "type": "toggle",
          "id": "showMark",
          "label": "高亮本轮标记为 1 的待擦除像素",
          "value": true
        },
        {
          "type": "slider",
          "id": "probe",
          "label": "右侧规则四 3x3 测试案例",
          "min": 0,
          "max": 5,
          "step": 1,
          "value": 3,
          "unit": ""
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\nconst ROWS = 14;\nconst COLS = 20;\nconst CELL = 11;\n\nconst ridgeMap = [\n  '00000000000000000000',\n  '00111111100000000000',\n  '00111111111000000000',\n  '00111100111100011100',\n  '00111000011111111100',\n  '00111000011111111000',\n  '00111100111111100000',\n  '00111111111100000000',\n  '00011111111110000000',\n  '00000000111111000000',\n  '00000000011111100000',\n  '00000000001111110000',\n  '00000000000111100000',\n  '00000000000000000000'\n];\n\nconst probeCases = [\n  { name: '案例 A: 连通 (1次跳变)', n: [1,1,0,0,0,0,0,1] },\n  { name: '案例 B: 连通 (斜向相连, 1次跳变)', n: [1,0,0,1,1,1,0,1] },\n  { name: '案例 C: 连通 (单侧贴合, 1次跳变)', n: [0,1,1,1,1,0,0,0] },\n  { name: '案例 D: 不连通 (2次跳变, 断开)', n: [1,0,0,1,1,0,0,1] },\n  { name: '案例 E: 不连通 (3次跳变, 三岔中心)', n: [0,1,0,1,1,0,1,0] },\n  { name: '案例 F: 不连通 (2次跳变, 对角孤岛)', n: [1,0,1,0,1,1,0,0] }\n];\n\nfunction countTransitions(n) {\n  // n = [n1, n2, n3, n4, n5, n6, n7, n8], 1=black(0), 0=white(255)\n  const marks = [false,false,false,false,false,false,false,false];\n  if (n[0] === 1 && n[1] === 0) marks[0] = true;\n  if (n[1] === 1 && n[2] === 0 && n[3] === 0) marks[1] = true;\n  if (n[2] === 1 && n[3] === 0) marks[2] = true;\n  if (n[3] === 1 && n[4] === 0 && n[5] === 0) marks[3] = true;\n  if (n[4] === 1 && n[5] === 0) marks[4] = true;\n  if (n[5] === 1 && n[6] === 0 && n[7] === 0) marks[5] = true;\n  if (n[6] === 1 && n[7] === 0) marks[6] = true;\n  if (n[7] === 1 && n[0] === 0 && n[1] === 0) marks[7] = true;\n  let cnt = 0;\n  for (let i = 0; i < 8; i++) if (marks[i]) cnt++;\n  return { cnt, marks };\n}\n\nfunction isRemovable(g, r, c) {\n  if (g[r][c] !== 0) return false;\n  const n1 = g[r-1][c-1] < 255 ? 1 : 0;\n  const n2 = g[r-1][c]   < 255 ? 1 : 0;\n  const n3 = g[r-1][c+1] < 255 ? 1 : 0;\n  const n4 = g[r][c+1]   < 255 ? 1 : 0;\n  const n5 = g[r+1][c+1] < 255 ? 1 : 0;\n  const n6 = g[r+1][c]   < 255 ? 1 : 0;\n  const n7 = g[r+1][c-1] < 255 ? 1 : 0;\n  const n8 = g[r][c-1]   < 255 ? 1 : 0;\n  // Rule 2: at least one close neighbor (2,4,6,8) is white\n  if (n2 === 1 && n4 === 1 && n6 === 1 && n8 === 1) return false;\n  // Rule 3: more than 1 black neighbor\n  const blackNeighbors = n1 + n2 + n3 + n4 + n5 + n6 + n7 + n8;\n  if (blackNeighbors <= 1) return false;\n  // Rule 4: connected (transitions <= 1)\n  const res = countTransitions([n1, n2, n3, n4, n5, n6, n7, n8]);\n  if (res.cnt > 1) return false;\n  return true;\n}\n\nfunction buildSkeleton(iters) {\n  const g = [];\n  for (let r = 0; r < ROWS; r++) {\n    const row = [];\n    for (let c = 0; c < COLS; c++) row.push(ridgeMap[r][c] === '1' ? 0 : 255);\n    g.push(row);\n  }\n  for (let it = 0; it < iters; it++) {\n    for (let r = 1; r < ROWS - 1; r++) {\n      for (let c = 1; c < COLS - 1; c++) {\n        if (isRemovable(g, r, c)) g[r][c] = 1;\n      }\n    }\n    for (let r = 0; r < ROWS; r++) {\n      for (let c = 0; c < COLS; c++) {\n        if (g[r][c] === 1) g[r][c] = 255;\n      }\n    }\n  }\n  // Mark next iteration removable pixels as 1 for preview\n  let markCount = 0;\n  for (let r = 1; r < ROWS - 1; r++) {\n    for (let c = 1; c < COLS - 1; c++) {\n      if (isRemovable(g, r, c)) { g[r][c] = 1; markCount++; }\n    }\n  }\n  return { g, markCount };\n}\n\nfunction render() {\n  ctx.clearRect(0, 0, W, H);\n  const iters = Math.round(lab.values.iter);\n  const showMark = !!lab.values.showMark;\n  const pIdx = Math.round(lab.values.probe);\n\n  const { g, markCount } = buildSkeleton(iters);\n  const x0 = 24, y0 = 38;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('表25-2 脊线骨架化进程 (第 ' + iters + ' 轮后)', x0, 24);\n\n  let fgCount = 0;\n  for (let r = 0; r < ROWS; r++) {\n    for (let c = 0; c < COLS; c++) {\n      const x = x0 + c * CELL;\n      const y = y0 + r * CELL;\n      const v = g[r][c];\n      if (v === 0) {\n        ctx.fillStyle = '#38bdf8'; fgCount++;\n      } else if (v === 1) {\n        fgCount++;\n        ctx.fillStyle = showMark ? '#f59e0b' : '#38bdf8';\n      } else {\n        ctx.fillStyle = '#0f172a';\n      }\n      ctx.fillRect(x, y, CELL - 1, CELL - 1);\n      ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n      ctx.lineWidth = 0.5;\n      ctx.strokeRect(x, y, CELL, CELL);\n    }\n  }\n  ctx.fillStyle = '#38bdf8'; ctx.fillRect(24, 204, 10, 10);\n  ctx.fillStyle = '#cbd5e1'; ctx.font = '11px sans-serif'; ctx.fillText('保留脊线(0)', 38, 213);\n  ctx.fillStyle = '#f59e0b'; ctx.fillRect(120, 204, 10, 10);\n  ctx.fillStyle = '#cbd5e1'; ctx.fillText('下轮待擦除(标记1)', 134, 213);\n\n  // Divider\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.beginPath(); ctx.moveTo(276, 16); ctx.lineTo(276, 224); ctx.stroke();\n\n  // Right panel: Probe 3x3\n  const pc = probeCases[pIdx];\n  const { cnt, marks } = countTransitions(pc.n);\n  const rx = 304, ry = 46, S = 44;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText('图25-12 顺时针跳变探针: ' + pc.name, rx, 24);\n\n  const coords = [\n    [0,0],[0,1],[0,2],\n    [1,2],[2,2],[2,1],\n    [2,0],[1,0]\n  ];\n  for (let i = 0; i < 8; i++) {\n    const gr = coords[i][0], gc = coords[i][1];\n    const bx = rx + gc * S, by = ry + gr * S;\n    ctx.fillStyle = pc.n[i] === 1 ? '#38bdf8' : '#1e293b';\n    ctx.fillRect(bx, by, S - 2, S - 2);\n    ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n    ctx.strokeRect(bx, by, S - 2, S - 2);\n    ctx.fillStyle = pc.n[i] === 1 ? '#0f172a' : '#94a3b8';\n    ctx.font = 'bold 12px sans-serif';\n    ctx.fillText(String(i + 1), bx + 6, by + 16);\n  }\n  // Center pixel [R,C]\n  ctx.fillStyle = '#475569';\n  ctx.fillRect(rx + S, ry + S, S - 2, S - 2);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(rx + S + 1, ry + S + 1, S - 4, S - 4);\n  ctx.lineWidth = 1;\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 11px sans-serif';\n  ctx.fillText('[R,C]', rx + S + 7, ry + S + 25);\n\n  // Draw * at transition positions\n  const starPos = [\n    [S, 0], [2*S, 0], [2*S + S - 2, S],\n    [2*S + S - 2, 2*S], [2*S, 2*S + S - 2], [S, 2*S + S - 2],\n    [0, 2*S], [0, S]\n  ];\n  for (let i = 0; i < 8; i++) {\n    if (marks[i]) {\n      const sx = rx + starPos[i][0], sy = ry + starPos[i][1];\n      ctx.fillStyle = '#ec4899';\n      ctx.beginPath(); ctx.arc(sx, sy, 9, 0, Math.PI * 2); ctx.fill();\n      ctx.fillStyle = '#f8fafc';\n      ctx.font = 'bold 15px sans-serif';\n      ctx.fillText('*', sx - 4, sy + 6);\n    }\n  }\n\n  // Explanation box on far right\n  const ix = 468;\n  ctx.fillStyle = '#cbd5e1';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('规则四判定细节：', ix, 62);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('黑邻居中若出现“黑→白”跳变，', ix, 84);\n  ctx.fillText('说明外围环路被白色背景打断。', ix, 102);\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 14px sans-serif';\n  ctx.fillText('COUNT% = ' + cnt + ' 次跳变', ix, 134);\n  ctx.fillStyle = cnt <= 1 ? '#10b981' : '#ec4899';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(cnt <= 1 ? '结论：连通 (允许删除 [R,C])' : '结论：不连通 (禁止删除，防断裂)', ix, 160);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('粉色圆点 * 标出每次黑→白跳变位置', ix, 192);\n\n  lab.setReadout('迭代: ' + iters + ' 轮 | 当前剩余前景: ' + fgCount + ' 像素 | 下轮可安全剥离(标记1): ' + markCount + ' 像素 | 探针跳变: ' + cnt + ' 次');\n}\n\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "四、后处理收尾：剪除“毛刺”与位图转矢量",
      "paragraphs": [
        "表 25-2 的骨架化算法虽然简单高效，但有一个明显缺点：它容易在主脊线侧面残留大量**毛刺（Fuzz）**——也就是短短的小分叉。最偷懒的办法是遍历全图删掉所有“只有 1 个黑邻居”的端点，但这样做的代价是会把原本正确的长脊线也一并剪短！",
        "更优雅的工程做法是去寻找**分支像素（Branch Pixels，即黑邻居数大于 2 的交叉点）**，从每个分支像素出发沿每条支路数像素个数；如果某条分支长度小于设定阈值（比如 `5` 个像素），就判定为毛刺并全部擦白，从而在不损伤主干的前提下完美修剪毛刺。最后，为了赋予每条指纹脊线独立的身份，还可以将**位图（Bitmap）转换为矢量映射格式（Vector Mapped Format）**：扫描找出所有线的端点（仅 1 个黑邻居），顺着连通像素一路追踪到另一端，把整条轨迹打包成一个独立“对象”供后续特征匹配使用。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【先平光照再二值化】在把灰度图变成 0/1 二值图之前，先做光照平坦化等线性预处理，比死磕阈值本身更能决定形态学成败。",
        "【开闭运算别搞反】记住“开（先腐后膨）除体外白噪点与细丝，闭（先膨后腐）填体内黑孔洞与缺口”。",
        "【两阶段标记防偏心】写骨架化代码时，千万别边扫描边直接把 0 改成 255，必须先标记为临时值 1，全图扫完再统一转白，否则脊线会往扫描方向歪斜。",
        "【去毛刺看分支长度】直接削端点会让正常线条越剪越短，工程上要从 >2 邻居的分叉点出发，按支路长度阈值（如 <5 像素）精准剔除短毛刺。"
      ]
    }
  ]
});
