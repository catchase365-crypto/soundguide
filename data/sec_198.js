window.__BOOK_REGISTER_SECTION__("sec_198", {
  "title": "JPEG 图像压缩与离散余弦变换 (JPEG Transform Compression)",
  "intuition": "JPEG 先将图像切成 8×8 小块做离散余弦变换，把决定轮廓的低频能量和无关紧要的高频细节彻底分离，再借助量化表狠砍高频、通过蛇形扫描把零值打包压缩，从而实现数十倍的体积瘦身。",
  "blocks": [
    {
      "type": "concept",
      "heading": "1. 变换压缩的底层逻辑：为什么不直接丢像素？",
      "paragraphs": [
        "最粗暴的有损压缩方法是**粗采样与粗量化 (CS&Q)**——比如直接降低采样率或减少每个像素的比特数。但这种方法在图像上效果极差，画面会迅速变得模糊或出现严重的色阶断层，因为**在空间域里，每个像素点承载的信息重要性几乎是均等的**，直接丢弃任何像素都会造成明显失真。",
        "**变换压缩 (Transform Compression)** 换了一个完全不同的思路：先把信号送入傅里叶或类似的正交变换域，让数据在“信息承载能力”上不再平等。图像中的大片背景、缓慢过渡的明暗轮廓都集中在**低频分量**中，而尖锐边缘与随机噪点才属于**高频分量**。实验表明，把高频分量的比特数砍掉 50%，可能仅仅损失了 5% 的有效信息。",
        "JPEG（联合图像专家组标准）正是变换压缩的典范。在本章的灰度图像示例（图 27-9）中，每个像素占 1 字节（0~255）。JPEG 首先把整幅图切割成互不重叠的 **8×8 像素块**（每块原始大小 64 字节）并独立压缩，最终每块只需 **2~20 字节** 就能记录；解压时只需逆变换并拼接回去。之所以选定 8×8 而不是 16×16，主要是当年制定标准时集成电路硬件算力的上限使然，但事实证明 8×8 的尺寸在压缩率与局部适应性上表现极佳。"
      ],
      "formula": {
        "expr": null,
        "explain": ""
      }
    },
    {
      "type": "concept",
      "heading": "2. 为什么 JPEG 选择了 DCT，而不是傅里叶变换？",
      "paragraphs": [
        "在筛选变换算法时，**K-L 变换 (Karhunen-Loeve Transform)** 理论压缩率最高但极难工程实现；经典的**傅里叶变换 (DFT)** 实现简单但压缩率不够理想。最终胜出的是傅里叶的近亲——**离散余弦变换 (DCT)**。",
        "DCT 的物理本质非常巧妙：假设我们有一段 129 点的信号（样本 0~128），我们把样本 1~127 镜像复制到末尾（样本 255~130），拼成一段 **256 点的偶对称信号**。对偶对称信号做傅里叶变换，频谱的虚部（正弦分量）全为零！也就是说，我们输入 129 点实数，只得到 129 点纯实数的余弦波幅度，彻底告别复数运算。",
        "更深层的原因在于图像本身的统计特性（原书图 27-10 与图 27-15 后段）：真实图像中充满了亮度**缓慢单调渐变**的区域。傅里叶变换的最低非零频率基函数是一个**完整周期**（先升后降再升），拟合单调斜坡很吃力；而 DCT 的最低非零频率基函数 `[0,1]` 和 `[1,0]` 恰好是**半个余弦周期**，像缓坡一样从一侧平滑过渡到另一侧，与图像渐变完美匹配，因此能用极少的系数逼近原图。",
        "计算 8×8 正向 DCT 时，只需将 8×8 像素块分别与这 64 个基函数逐点相乘再求和，最后做两步归一化：**先把第 0 行和第 0 列的 15 个频谱值除以 2（其中 `[0,0]` 直流分量其实因同时处于第 0 行与第 0 列而被除两次，即除以 4），再把全部 64 个值除以 16**。这样处理后，计算**逆 DCT** 时就无需任何额外系数，直接把频谱振幅乘回各自基函数再相加即可完美复原。"
      ],
      "formula": {
        "expr": "b[x,y] = cos[(2x + 1)uπ / 16] · cos[(2y + 1)vπ / 16]",
        "explain": "8×8 DCT 的 64 个二维基函数。x, y ∈ [0, 7] 为空间域像素行列坐标；u, v ∈ [0, 7] 为频谱域频率下标。[0,0] 位于左上角代表直流分量（平均亮度），[7,7] 位于右下角代表最高空间频率。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 1：低频系数截断与 8×8 图像块重建 (复刻图 27-11 与 27-12)",
      "instruction": "拖动“保留低频系数数量 (K)”滑块（从 64 拖到 15 甚至 3），切换眼睛/眉毛测试块，观察只用不到 1/4 的低频 DCT 系数就能如何精准还原图像，以及丢失的高频误差为何酷似随机噪声。",
      "controls": [
        {
          "type": "slider",
          "id": "coeffs",
          "label": "保留低频系数数量 (K)",
          "min": 1,
          "max": 64,
          "step": 1,
          "value": 15,
          "unit": " 个"
        },
        {
          "type": "toggle",
          "id": "useEyebrow",
          "label": "切换测试块 (关: 眼睛 Eye / 开: 眉毛 Eyebrow)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showNums",
          "label": "显示像素/误差数值",
          "value": false
        }
      ],
      "jsCode": "const EYE = [\n  [42,28,35,28,42,49,35,42],\n  [49,49,35,28,35,35,35,42],\n  [42,21,21,28,42,35,42,28],\n  [21,35,35,42,42,28,28,14],\n  [56,70,77,84,91,28,28,21],\n  [70,126,133,147,161,91,35,14],\n  [126,203,189,182,175,175,35,21],\n  [49,189,245,210,182,84,21,35]\n];\nconst EYEBROW = [\n  [231,224,224,217,217,203,189,196],\n  [210,217,203,189,203,224,217,224],\n  [196,217,210,224,203,203,196,189],\n  [210,203,196,203,182,203,182,189],\n  [203,224,203,217,196,175,154,140],\n  [182,189,168,161,154,126,119,112],\n  [175,154,126,105,140,105,119,84],\n  [154,98,105,98,105,63,112,84]\n];\nconst ZIGZAG = [];\nfor (let s = 0; s <= 14; s++) {\n  const rMin = Math.max(0, s - 7), rMax = Math.min(7, s);\n  if (s % 2 === 0) {\n    for (let r = rMax; r >= rMin; r--) ZIGZAG.push([r, s - r]);\n  } else {\n    for (let c = rMax; c >= rMin; c--) ZIGZAG.push([s - c, c]);\n  }\n}\nfunction dct2d(img) {\n  const spec = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  for (let u = 0; u < 8; u++) {\n    for (let v = 0; v < 8; v++) {\n      let sum = 0;\n      for (let x = 0; x < 8; x++) {\n        const cx = Math.cos(((2 * x + 1) * u * Math.PI) / 16);\n        for (let y = 0; y < 8; y++) {\n          sum += img[x][y] * cx * Math.cos(((2 * y + 1) * v * Math.PI) / 16);\n        }\n      }\n      let div = 16;\n      if (u === 0) div *= 2;\n      if (v === 0) div *= 2;\n      spec[u][v] = sum / div;\n    }\n  }\n  return spec;\n}\nfunction idct2d(spec) {\n  const out = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  for (let x = 0; x < 8; x++) {\n    for (let y = 0; y < 8; y++) {\n      let sum = 0;\n      for (let u = 0; u < 8; u++) {\n        const cx = Math.cos(((2 * x + 1) * u * Math.PI) / 16);\n        for (let v = 0; v < 8; v++) {\n          if (spec[u][v] !== 0) {\n            sum += spec[u][v] * cx * Math.cos(((2 * y + 1) * v * Math.PI) / 16);\n          }\n        }\n      }\n      out[x][y] = Math.max(0, Math.min(255, Math.round(sum)));\n    }\n  }\n  return out;\n}\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  const K = lab.values.coeffs;\n  const isBrow = lab.values.useEyebrow;\n  const showNums = lab.values.showNums;\n  const orig = isBrow ? EYEBROW : EYE;\n  const fullSpec = dct2d(orig);\n  const mask = Array.from({ length: 8 }, () => new Array(8).fill(false));\n  const keptSpec = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  let totalEnergy = 0, keptEnergy = 0;\n  for (let u = 0; u < 8; u++) {\n    for (let v = 0; v < 8; v++) {\n      if (u !== 0 || v !== 0) totalEnergy += fullSpec[u][v] * fullSpec[u][v];\n    }\n  }\n  for (let i = 0; i < K; i++) {\n    const [u, v] = ZIGZAG[i];\n    mask[u][v] = true;\n    keptSpec[u][v] = fullSpec[u][v];\n    if (u !== 0 || v !== 0) keptEnergy += fullSpec[u][v] * fullSpec[u][v];\n  }\n  const recon = idct2d(keptSpec);\n  let sqErr = 0, maxErr = 0;\n  const errMat = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const d = orig[r][c] - recon[r][c];\n      errMat[r][c] = d;\n      sqErr += d * d;\n      if (Math.abs(d) > maxErr) maxErr = Math.abs(d);\n    }\n  }\n  const rmse = Math.sqrt(sqErr / 64);\n  const cell = 18;\n  const topY = 44;\n  const xs = [24, 196, 368, 540];\n  const titles = [\n    isBrow ? '原始 8×8 (眉毛)' : '原始 8×8 (眼睛)',\n    '重建图像 (保留 ' + K + '/64)',\n    '误差 |原图 - 重建|',\n    'DCT 频谱掩码 (Zig-Zag)'\n  ];\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  for (let p = 0; p < 4; p++) {\n    ctx.fillStyle = p === 1 ? '#38bdf8' : p === 2 ? '#f59e0b' : p === 3 ? '#10b981' : '#f8fafc';\n    ctx.fillText(titles[p], xs[p] + 4 * cell, 26);\n  }\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const v0 = orig[r][c];\n      ctx.fillStyle = `rgb(${v0},${v0},${v0})`;\n      ctx.fillRect(xs[0] + c * cell, topY + r * cell, cell, cell);\n      const v1 = recon[r][c];\n      ctx.fillStyle = `rgb(${v1},${v1},${v1})`;\n      ctx.fillRect(xs[1] + c * cell, topY + r * cell, cell, cell);\n      const ae = Math.abs(errMat[r][c]);\n      const eNorm = Math.min(1, ae / 40);\n      ctx.fillStyle = ae === 0 ? 'rgba(255,255,255,0.04)' : (errMat[r][c] > 0 ? `rgba(245,158,11,${0.15 + 0.85 * eNorm})` : `rgba(236,72,153,${0.15 + 0.85 * eNorm})`);\n      ctx.fillRect(xs[2] + c * cell, topY + r * cell, cell, cell);\n      const active = mask[r][c];\n      const mag = Math.min(1, Math.log1p(Math.abs(fullSpec[r][c])) / Math.log1p(180));\n      if (active) {\n        ctx.fillStyle = (r === 0 && c === 0) ? '#38bdf8' : `rgba(16,185,129,${0.25 + 0.75 * mag})`;\n      } else {\n        ctx.fillStyle = 'rgba(255,255,255,0.05)';\n      }\n      ctx.fillRect(xs[3] + c * cell, topY + r * cell, cell, cell);\n      for (let p = 0; p < 4; p++) {\n        ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n        ctx.lineWidth = 0.7;\n        ctx.strokeRect(xs[p] + c * cell, topY + r * cell, cell, cell);\n      }\n      if (showNums) {\n        ctx.font = '8px monospace';\n        ctx.textAlign = 'center';\n        ctx.textBaseline = 'middle';\n        ctx.fillStyle = v0 > 130 ? '#0f172a' : '#f8fafc';\n        ctx.fillText(String(v0), xs[0] + c * cell + cell / 2, topY + r * cell + cell / 2);\n        ctx.fillStyle = v1 > 130 ? '#0f172a' : '#f8fafc';\n        ctx.fillText(String(v1), xs[1] + c * cell + cell / 2, topY + r * cell + cell / 2);\n        ctx.fillStyle = ae > 15 ? '#0f172a' : '#f8fafc';\n        ctx.fillText(String(errMat[r][c]), xs[2] + c * cell + cell / 2, topY + r * cell + cell / 2);\n      }\n    }\n  }\n  ctx.textBaseline = 'alphabetic';\n  ctx.font = '11px sans-serif';\n  ctx.fillStyle = 'rgba(248,250,252,0.65)';\n  ctx.textAlign = 'center';\n  ctx.fillText('空域灰度 0~255', xs[0] + 72, 208);\n  ctx.fillText('仅用 ' + (K * 100 / 64).toFixed(1) + '% 频谱', xs[1] + 72, 208);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('橙: 正误差  粉: 负误差', xs[2] + 72, 208);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('左上 DC [0,0] → 右下高频 [7,7]', xs[3] + 72, 208);\n  const acPct = totalEnergy > 0 ? (keptEnergy * 100 / totalEnergy).toFixed(1) : '100.0';\n  lab.setReadout(`图块: ${isBrow ? '眉毛(缓变)' : '眼睛(高对比)'} | 保留系数: ${K}/64 (${(K * 100 / 64).toFixed(1)}%) | 交流能量保留: ${acPct}% | 均方根误差 RMSE: ${rmse.toFixed(2)} (最大误差 ${maxErr})`);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "concept",
      "heading": "3. JPEG 完整六步流水线：量化表、蛇形扫描与熵编码",
      "paragraphs": [
        "JPEG 并非只靠某一种技巧，而是将变换、有损量化与无损编码有机串联成**六个核心步骤**，把压缩率推向极致：",
        "**第一步：8×8 分块。** 将整幅图像切分为独立的 8×8 像素块；**第二步：二维 DCT。** 对每块计算 8×8 实数频谱（直流 DC 范围为 0~255，其余交流系数为 -127~127）。",
        "**第三步：查量化表除法并取整（唯一的有损压缩步骤）。** 频谱中的每个系数都要除以一张预设的 **8×8 量化表 (Quantization Table)** 中的对应数值，再**四舍五入取整**（见原书图 27-13）。量化表左上角 `[0,0]` 的除数通常是 `1`，保证平均亮度 DC 分量完全无损；越往右下角高频区，除数越大——在“低压缩表”中右下角为 `16`（将 -127~127 压缩到 -7~7，精度从 8 位降为 4 位），而在“高压缩表”中右下角高达 `256`，直接把对应的高频分量**清零抹除**！",
        "**第四步：蛇形（Z 字形 / Serpentine）扫描。** 如原书图 27-14 所示，按照斜向往返的 Z 字形路径，把二维 8×8 量化频谱拉直成 64 个数的一维序列。这一步的妙处在于把所有被量化清零的高频分量**全部赶到序列末尾**，形成超长的连续零值区。",
        "**第五步：游程编码 (RLE) + 第六步：霍夫曼/算术编码。** 先用游程编码把末尾和中间的大段连续零压缩成极短的“零个数+非零值”描述，最后送入霍夫曼或算术编码生成最终压缩文件。当采用 **45:1** 极高压缩比时（图 27-15c），每个 8×8 像素块平均只剩不到 **12 比特**（大约只有 6 个最低频基函数得以保留），图像就会出现标志性的 **8×8 块状马赛克失真 (Blocking Artifacts)**。"
      ],
      "formula": {
        "expr": "Q_spec[u,v] = round( S[u,v] / Table[u,v] )",
        "explain": "量化步骤公式：将 DCT 频谱系数 S[u,v] 除以量化表对应位置的大整数 Table[u,v] 并四舍五入。高频区 Table[u,v] 极大（如 128、256），因此大量高频系数直接归零。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验 2：量化表压缩、Z 字形扫描与一维零游程透视 (复刻图 27-13 & 27-14)",
      "instruction": "调节“量化强度倍率”或切换“高压缩量化表”，观察 8×8 DCT 频谱如何大面积归零、Z 字形路径如何把非零值挤到左侧，并在右侧直方图中形成可供 RLE 压缩的末尾连续零游程。",
      "controls": [
        {
          "type": "slider",
          "id": "qScale",
          "label": "量化强度倍率",
          "min": 0.5,
          "max": 5,
          "step": 0.5,
          "value": 1,
          "unit": "×"
        },
        {
          "type": "toggle",
          "id": "highTable",
          "label": "使用高压缩量化表 (图 27-13b)",
          "value": false
        },
        {
          "type": "toggle",
          "id": "showZigzag",
          "label": "叠加 Z 字形扫描路径",
          "value": true
        }
      ],
      "jsCode": "const EYE = [\n  [42,28,35,28,42,49,35,42],\n  [49,49,35,28,35,35,35,42],\n  [42,21,21,28,42,35,42,28],\n  [21,35,35,42,42,28,28,14],\n  [56,70,77,84,91,28,28,21],\n  [70,126,133,147,161,91,35,14],\n  [126,203,189,182,175,175,35,21],\n  [49,189,245,210,182,84,21,35]\n];\nconst Q_LOW = [\n  [1,1,1,1,1,2,2,4],\n  [1,1,1,1,1,2,2,4],\n  [1,1,1,1,2,2,2,4],\n  [1,1,1,1,2,2,4,8],\n  [1,1,2,2,2,2,4,8],\n  [2,2,2,2,2,4,8,8],\n  [2,2,2,4,4,8,8,16],\n  [4,4,4,4,8,8,16,16]\n];\nconst Q_HIGH = [\n  [1,2,4,8,16,32,64,128],\n  [2,4,4,8,16,32,64,128],\n  [4,4,8,16,32,64,128,128],\n  [8,8,16,32,64,128,128,256],\n  [16,16,32,64,128,128,256,256],\n  [32,32,64,128,128,256,256,256],\n  [64,64,128,128,256,256,256,256],\n  [128,128,128,256,256,256,256,256]\n];\nconst ZIGZAG = [];\nfor (let s = 0; s <= 14; s++) {\n  const rMin = Math.max(0, s - 7), rMax = Math.min(7, s);\n  if (s % 2 === 0) {\n    for (let r = rMax; r >= rMin; r--) ZIGZAG.push([r, s - r]);\n  } else {\n    for (let c = rMax; c >= rMin; c--) ZIGZAG.push([s - c, c]);\n  }\n}\nfunction dct2d(img) {\n  const spec = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  for (let u = 0; u < 8; u++) {\n    for (let v = 0; v < 8; v++) {\n      let sum = 0;\n      for (let x = 0; x < 8; x++) {\n        const cx = Math.cos(((2 * x + 1) * u * Math.PI) / 16);\n        for (let y = 0; y < 8; y++) {\n          sum += img[x][y] * cx * Math.cos(((2 * y + 1) * v * Math.PI) / 16);\n        }\n      }\n      let div = 16;\n      if (u === 0) div *= 2;\n      if (v === 0) div *= 2;\n      spec[u][v] = sum / div;\n    }\n  }\n  return spec;\n}\nfunction idct2d(spec) {\n  const out = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  for (let x = 0; x < 8; x++) {\n    for (let y = 0; y < 8; y++) {\n      let sum = 0;\n      for (let u = 0; u < 8; u++) {\n        const cx = Math.cos(((2 * x + 1) * u * Math.PI) / 16);\n        for (let v = 0; v < 8; v++) {\n          if (spec[u][v] !== 0) {\n            sum += spec[u][v] * cx * Math.cos(((2 * y + 1) * v * Math.PI) / 16);\n          }\n        }\n      }\n      out[x][y] = Math.max(0, Math.min(255, Math.round(sum)));\n    }\n  }\n  return out;\n}\nconst eyeSpec = dct2d(EYE);\nfunction draw() {\n  const ctx = lab.ctx;\n  const W = lab.width, H = lab.height;\n  ctx.clearRect(0, 0, W, H);\n  const qScale = lab.values.qScale;\n  const useHigh = lab.values.highTable;\n  const showZZ = lab.values.showZigzag;\n  const table = useHigh ? Q_HIGH : Q_LOW;\n  const qInt = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  const deqSpec = Array.from({ length: 8 }, () => new Array(8).fill(0));\n  let nonZero = 0;\n  for (let u = 0; u < 8; u++) {\n    for (let v = 0; v < 8; v++) {\n      const step = table[u][v] * qScale;\n      const qv = Math.round(eyeSpec[u][v] / step);\n      qInt[u][v] = qv;\n      deqSpec[u][v] = qv * step;\n      if (qv !== 0) nonZero++;\n    }\n  }\n  const seq = ZIGZAG.map(([r, c]) => qInt[r][c]);\n  let trailingZeros = 0;\n  for (let i = 63; i >= 0; i--) {\n    if (seq[i] === 0) trailingZeros++;\n    else break;\n  }\n  const recon = idct2d(deqSpec);\n  let sqErr = 0;\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const d = EYE[r][c] - recon[r][c];\n      sqErr += d * d;\n    }\n  }\n  const rmse = Math.sqrt(sqErr / 64);\n  const cell = 19, topY = 42, qX = 18, imgX = 196;\n  ctx.font = 'bold 12px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#10b981';\n  ctx.fillText('量化后 8×8 DCT 频谱', qX + 4 * cell, 25);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('反量化重建 (眼睛)', imgX + 4 * cell, 25);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('1D 蛇形序列 (0 → 63) 与末尾零游程', 540, 25);\n  for (let r = 0; r < 8; r++) {\n    for (let c = 0; c < 8; c++) {\n      const qv = qInt[r][c];\n      const x0 = qX + c * cell, y0 = topY + r * cell;\n      ctx.fillStyle = qv !== 0 ? (r === 0 && c === 0 ? 'rgba(56,189,248,0.35)' : 'rgba(16,185,129,0.28)') : 'rgba(255,255,255,0.04)';\n      ctx.fillRect(x0, y0, cell, cell);\n      ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n      ctx.lineWidth = 0.7;\n      ctx.strokeRect(x0, y0, cell, cell);\n      ctx.font = '9px monospace';\n      ctx.textAlign = 'center';\n      ctx.textBaseline = 'middle';\n      ctx.fillStyle = qv !== 0 ? '#f8fafc' : 'rgba(255,255,255,0.28)';\n      ctx.fillText(String(qv), x0 + cell / 2, y0 + cell / 2);\n      const px = recon[r][c];\n      const ix = imgX + c * cell;\n      ctx.fillStyle = `rgb(${px},${px},${px})`;\n      ctx.fillRect(ix, y0, cell, cell);\n      ctx.strokeStyle = 'rgba(255,255,255,0.1)';\n      ctx.strokeRect(ix, y0, cell, cell);\n    }\n  }\n  if (showZZ) {\n    ctx.save();\n    ctx.beginPath();\n    ctx.strokeStyle = 'rgba(245,158,11,0.75)';\n    ctx.lineWidth = 1.4;\n    for (let i = 0; i < 64; i++) {\n      const [r, c] = ZIGZAG[i];\n      const px = qX + c * cell + cell / 2;\n      const py = topY + r * cell + cell / 2;\n      if (i === 0) ctx.moveTo(px, py);\n      else ctx.lineTo(px, py);\n    }\n    ctx.stroke();\n    ctx.restore();\n  }\n  const chartX = 376, chartY = 42, chartW = 324, chartH = 152;\n  ctx.fillStyle = 'rgba(255,255,255,0.03)';\n  ctx.fillRect(chartX, chartY, chartW, chartH);\n  ctx.strokeStyle = 'rgba(255,255,255,0.14)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(chartX, chartY, chartW, chartH);\n  const baseLine = chartY + chartH * 0.62;\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.beginPath();\n  ctx.moveTo(chartX, baseLine);\n  ctx.lineTo(chartX + chartW, baseLine);\n  ctx.stroke();\n  const barW = chartW / 64;\n  if (trailingZeros > 0) {\n    const runStart = chartX + (64 - trailingZeros) * barW;\n    const runW = trailingZeros * barW;\n    ctx.save();\n    ctx.fillStyle = 'rgba(16,185,129,0.12)';\n    ctx.fillRect(runStart, chartY + 4, runW, chartH - 8);\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#10b981';\n    ctx.strokeRect(runStart, chartY + 4, runW, chartH - 8);\n    ctx.restore();\n    ctx.font = 'bold 11px sans-serif';\n    ctx.textAlign = 'center';\n    ctx.textBaseline = 'alphabetic';\n    ctx.fillStyle = '#10b981';\n    if (runW > 65) {\n      ctx.fillText('RLE 连续零: ' + trailingZeros + ' 个', runStart + runW / 2, chartY + 22);\n    }\n  }\n  const maxMag = Math.max(10, Math.abs(seq[0]));\n  for (let i = 0; i < 64; i++) {\n    const v = seq[i];\n    const bx = chartX + i * barW + 0.6;\n    if (v !== 0) {\n      const bh = (Math.abs(v) / maxMag) * (chartH * 0.52);\n      ctx.fillStyle = i === 0 ? '#38bdf8' : '#f59e0b';\n      if (v > 0) ctx.fillRect(bx, baseLine - bh, Math.max(2, barW - 1.2), bh);\n      else ctx.fillRect(bx, baseLine, Math.max(2, barW - 1.2), Math.min(chartH * 0.34, bh));\n    } else {\n      ctx.fillStyle = 'rgba(255,255,255,0.18)';\n      ctx.fillRect(bx, baseLine - 1, Math.max(2, barW - 1.2), 2);\n    }\n  }\n  ctx.textBaseline = 'alphabetic';\n  ctx.font = '11px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillText('非零系数: ' + nonZero + ' / 64', qX + 4 * cell, 212);\n  ctx.fillStyle = 'rgba(248,250,252,0.7)';\n  ctx.fillText('RMSE 失真: ' + rmse.toFixed(2), imgX + 4 * cell, 212);\n  ctx.fillStyle = '#38bdf8';\n  ctx.fillText('蓝: DC   橙: AC 非零   绿框: 末尾 RLE 连续零游程', chartX + chartW / 2, 212);\n  lab.setReadout(`量化表: ${useHigh ? '高压缩表' : '低压缩表'} (${qScale.toFixed(1)}×) | 非零频谱: ${nonZero}/64 | 末尾连续零: ${trailingZeros} 个 | 重建均方根误差 RMSE: ${rmse.toFixed(2)}`);\n}\nlab.onUpdate(draw);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "**能量重排才是核心**：DCT 本身没有任何压缩作用（64 个字节输入输出还是 64 个实数），但它把弥散在全块的能量高度集中到左上角少数几个低频系数上，从而为后续大胆“砍高频”创造了条件。",
        "**半周期余弦决定胜负**：相比傅里叶变换的完整周期基函数，DCT 的 `[0,1]` 和 `[1,0]` 基函数只跨越半个周期，天然契合现实照片中大面积平滑渐变的明暗区域，压缩效率远胜 DFT。",
        "**找准有损的唯一源头**：在 JPEG 六步流水线中，**只有第 3 步“量化表除法 + 四舍五入”是有损的**；第 4~6 步的 Z 字形扫描、游程编码和霍夫曼编码全都是严格无损的压缩。",
        "**警惕 8×8 块效应 (Blocking Artifacts)**：由于每个 8×8 图像块独立进行变换和量化，当压缩比拉高到 30:1~45:1（每块不足十几个比特）时，高频系数几乎全军覆没，块与块边界的亮度跳变无法对齐，就会出现肉眼可见的方格马赛克。"
      ]
    }
  ]
});
