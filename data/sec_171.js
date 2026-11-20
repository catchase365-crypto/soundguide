window.__BOOK_REGISTER_SECTION__("sec_171", {
  "title": "其他图像采集与显示技术 (Other Image Acquisition and Display)",
  "intuition": "用采集时间换取传感器硬件的极度简化（线扫与点扫），用空间微点阵欺骗人眼以绕开打印机的物理局限（半色调网点）。",
  "blocks": [
    {
      "type": "concept",
      "heading": "降维采集：线阵扫描 (Line Scanning) 与逐点采集 (Point-by-Point)",
      "paragraphs": [
        "并不是所有数字图像都需要像相机 CCD 那样，在一瞬间把整幅二维画面同时拍下来。在工业与科研领域，**以时间换取传感器结构的简化**是非常核心的设计哲学。",
        "第一种常见方式是**线阵扫描 (Line Scanning)**：探测器不再是二维面阵，而只是一条细长的一维像素阵列（例如 `2048 × 1` 像素）。当被测物体匀速穿过探测器前方（如传真机、机场 X 光行李安检仪），或者探测器搭载在移动平台上扫过静止目标（如侦察机对地航拍）时，图像便被一行接一行地拼接出来。虽然扫描一页纸可能需要几秒钟，但只用极低成本的一维传感器就能轻松获得数千行、数千列的超高分辨率图像。",
        "如果把传感器进一步简化到极致，就是**逐点采集 (Point-by-Point Acquisition)**——每次只测量一个像素。例如人类早期绘制金星表面的微波雷达图像就是逐像素拼出来的；另一个震撼的例子是**扫描探针显微镜 (Scanning Probe Microscope, SPM)**，它甚至能给单个原子成像！其探针尖端往往只有一个原子大小，当它极其逼近样品表面时，会利用量子力学效应（如隧道电流）精确感知与表面的距离。控制系统让探针一边在表面水平移动，一边始终保持与样品表面恒定的微观间距，沿着原子的波峰与波谷上下起伏。最终生成的数字图像中，每个像素值直接对应样品表面该位置的**海拔高度**。"
      ],
      "formula": {
        "expr": "T_acq = (W * H / K) * t_step",
        "explain": "T_acq 为采集整幅图像的总耗时；W 与 H 分别为图像的列数与行数（总像素数 W*H）；K 为传感器同时工作的感光单元数（整帧面阵 K = W*H，线阵 K = H，单点探针 K = 1）；t_step 为单次采样驻留时间。K 越小硬件越简单，但耗时成倍拉长。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验一：线阵扫描 vs 逐点采集——硬件复杂度与速度的博弈",
      "instruction": "切换“扫描模式”开关，调节网格分辨率与步进速率，观察传感器如何一步步重建隐藏的表面图像，对比 1D 线阵与 0D 单点探针的耗时差距。",
      "controls": [
        {
          "type": "toggle",
          "id": "pointMode",
          "label": "切换为逐点扫描 (关闭=线阵扫描)",
          "value": false
        },
        {
          "type": "slider",
          "id": "gridSize",
          "label": "图像网格分辨率 (N×N)",
          "min": 8,
          "max": 24,
          "step": 4,
          "value": 16,
          "unit": " px"
        },
        {
          "type": "slider",
          "id": "speed",
          "label": "扫描步进速率",
          "min": 1,
          "max": 10,
          "step": 1,
          "value": 3,
          "unit": "x"
        },
        {
          "type": "toggle",
          "id": "running",
          "label": "运行/暂停扫描",
          "value": true
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\nlet stepIdx = 0;\nlet accum = 0;\nlet pauseTimer = 0;\nlet lastN = -1;\nlet lastPoint = null;\n\nfunction getSample(r, c, N) {\n  const x = (c + 0.5) / N - 0.5;\n  const y = (r + 0.5) / N - 0.5;\n  const p1 = Math.exp(-((x + 0.18) * (x + 0.18) + (y + 0.15) * (y + 0.15)) / 0.045);\n  const p2 = 0.75 * Math.exp(-((x - 0.2) * (x - 0.2) + (y - 0.18) * (y - 0.18)) / 0.035);\n  const wave = 0.15 * Math.sin(x * 16) * Math.cos(y * 16) + 0.15;\n  return Math.max(0, Math.min(1, p1 + p2 + wave));\n}\n\nfunction drawScene() {\n  const N = lab.values.gridSize;\n  const isPoint = lab.values.pointMode;\n  const totalSteps = isPoint ? N * N : N;\n  ctx.clearRect(0, 0, W, H);\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  const boxSize = 176;\n  const leftX = 24, topY = 36, midX = 236;\n  const cell = boxSize / N;\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('样品表面真实高度场 (原子起伏)', leftX, 24);\n  ctx.fillText('已采集重建的灰度图像', midX, 24);\n  ctx.fillText('传感器结构与时间代价对比', 448, 24);\n\n  for (let r = 0; r < N; r++) {\n    for (let c = 0; c < N; c++) {\n      const v = getSample(r, c, N);\n      const g = Math.round(v * 235 + 15);\n      ctx.fillStyle = 'rgb(' + Math.round(g * 0.22) + ',' + Math.round(g * 0.85) + ',' + Math.round(g * 0.98) + ')';\n      ctx.fillRect(leftX + c * cell, topY + r * cell, cell + 0.5, cell + 0.5);\n\n      const idx = r * N + c;\n      const acquired = isPoint ? (idx < stepIdx) : (c < stepIdx);\n      ctx.fillStyle = acquired ? ('rgb(' + g + ',' + g + ',' + g + ')') : 'rgba(15, 23, 42, 0.88)';\n      ctx.fillRect(midX + c * cell, topY + r * cell, cell - 0.5, cell - 0.5);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.22)';\n  ctx.strokeRect(leftX, topY, boxSize, boxSize);\n  ctx.strokeRect(midX, topY, boxSize, boxSize);\n\n  if (stepIdx < totalSteps) {\n    if (!isPoint) {\n      const sx = leftX + stepIdx * cell;\n      ctx.fillStyle = 'rgba(245, 158, 11, 0.28)';\n      ctx.fillRect(sx, topY, cell, boxSize);\n      ctx.strokeStyle = '#f59e0b';\n      ctx.lineWidth = 2;\n      ctx.strokeRect(sx, topY, cell, boxSize);\n    } else {\n      const curR = Math.floor(stepIdx / N);\n      const curC = stepIdx % N;\n      const sx = leftX + curC * cell;\n      const sy = topY + curR * cell;\n      ctx.fillStyle = 'rgba(236, 72, 153, 0.35)';\n      ctx.fillRect(sx, sy, cell, cell);\n      ctx.strokeStyle = '#ec4899';\n      ctx.lineWidth = 2;\n      ctx.strokeRect(sx, sy, cell, cell);\n    }\n  }\n\n  const infoX = 448;\n  ctx.fillStyle = 'rgba(15, 23, 42, 0.65)';\n  ctx.fillRect(infoX, topY, 248, boxSize);\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(infoX, topY, 248, boxSize);\n\n  ctx.fillStyle = isPoint ? '#ec4899' : '#f59e0b';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.fillText(isPoint ? '当前: 逐点扫描 (0D 单探针)' : '当前: 线阵扫描 (1D 像素条)', infoX + 12, topY + 24);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('探测器感光单元: ' + (isPoint ? '1 个 (单点)' : N + ' 个 (N×1 阵列)'), infoX + 12, topY + 48);\n  ctx.fillText('完成整幅所需步数: ' + totalSteps + ' 步', infoX + 12, topY + 68);\n\n  const pct = Math.min(1, stepIdx / totalSteps);\n  ctx.fillStyle = 'rgba(255,255,255,0.1)';\n  ctx.fillRect(infoX + 12, topY + 82, 224, 14);\n  ctx.fillStyle = isPoint ? '#ec4899' : '#10b981';\n  ctx.fillRect(infoX + 12, topY + 82, 224 * pct, 14);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('扫描进度: ' + Math.round(pct * 100) + '% (' + stepIdx + '/' + totalSteps + ')', infoX + 12, topY + 114);\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('总耗时比 (线阵=1x, 逐点=' + N + 'x):', infoX + 12, topY + 136);\n  ctx.fillStyle = '#f59e0b';\n  ctx.fillRect(infoX + 12, topY + 144, Math.max(8, 224 / N), 8);\n  ctx.fillStyle = '#ec4899';\n  ctx.fillRect(infoX + 12, topY + 158, 224, 8);\n\n  lab.setReadout((isPoint ? '逐点扫描 (0D)' : '线阵扫描 (1D)') + ' | 分辨率: ' + N + '×' + N + ' | 传感器单元: ' + (isPoint ? 1 : N) + ' | 进度: ' + stepIdx + '/' + totalSteps + ' 步');\n}\n\nlab.onUpdate(function() {\n  const N = lab.values.gridSize;\n  const isPoint = lab.values.pointMode;\n  if (N !== lastN || isPoint !== lastPoint) {\n    stepIdx = 0;\n    accum = 0;\n    pauseTimer = 0;\n    lastN = N;\n    lastPoint = isPoint;\n  }\n  drawScene();\n});\n\nlab.onLoop(function(dt) {\n  if (!lab.values.running) return;\n  const N = lab.values.gridSize;\n  const isPoint = lab.values.pointMode;\n  const totalSteps = isPoint ? N * N : N;\n  if (stepIdx >= totalSteps) {\n    pauseTimer += dt;\n    if (pauseTimer > 1.2) {\n      stepIdx = 0;\n      pauseTimer = 0;\n      accum = 0;\n      drawScene();\n    }\n    return;\n  }\n  const stepsPerSec = lab.values.speed * 3.5;\n  accum += dt * stepsPerSec;\n  if (accum >= 1) {\n    const inc = Math.floor(accum);\n    accum -= inc;\n    stepIdx = Math.min(totalSteps, stepIdx + inc);\n    drawScene();\n  }\n});"
    },
    {
      "type": "concept",
      "heading": "打印图像的视觉魔术：灰度图 (Grayscale) vs 半色调 (Halftone)",
      "paragraphs": [
        "图像采集进来之后，如果是要在纸张上打印输出，就会遇到一个物理难题：普通激光打印机或复印机喷出的墨粉/墨水只有两种状态——要么在纸上印一个**纯黑点**，要么留白变成**纯白点**，它们无法像冲印照片那样在单一点上调出不同浓度的灰色。因此，印刷图像被划分为截然不同的两大类：**灰度图 (Grayscale)** 与 **半色调图 (Halftone)**。",
        "在灰度图（例如传统银盐照片）中，每一个像素本身就是介于纯黑与纯白之间的某一种实实在在的灰色；而在半色调图像中，**每一个“逻辑像素”其实是由大量非黑即白的微观物理网点拼成的**。通过控制这组微点阵中黑点与白点的数量比例，就能欺骗人眼产生灰度的错觉。",
        "举个经典工程账：一台标称分辨率为 `600 dpi`（每英寸 600 个物理墨点）的激光打印机，如果想要还原出 256 个亮度等级，就必须把每 `16 × 16` 个可打印墨点划归为 1 个“图像像素”（因为 `16 × 16 = 256`）。全黑像素就把这 256 个点全部涂黑；全白像素就全部留白；中灰像素则是一半黑、一半白。只要单个物理墨点足够微小，在正常视距下人眼就相当于一个**空间低通滤波器**，会把黑白网点平均成柔和的灰色。半色调极大降低了打印机和复印机的硬件难度，代价则是牺牲了有效空间分辨率——打印画质往往不如真正的连续灰度图细腻。"
      ],
      "formula": {
        "expr": "Levels = M^2 + 1 ,   PPI_image = DPI_printer / M",
        "explain": "M 为单个图像像素所占用的边长微点数（构成 M×M 点阵）；Levels 为可表达的亮度级数（从全黑 0 个白点到全白 M² 个白点）；DPI_printer 为打印机物理点密度，除以 M 之后才是真正不糊的等效图像像素密度 PPI_image。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验二：半色调网点实验室——用纯黑白点“骗”出连续灰度",
      "instruction": "拖动灰度滑块观察 M×M 微点阵中黑白点的比例变化；再把“模拟人眼观察距离”拉远（或切换分散抖动排布），亲眼见证纯黑白点如何在视觉上融合为顺滑的灰度渐变。",
      "controls": [
        {
          "type": "slider",
          "id": "brightness",
          "label": "目标像素灰度值 (0=黑, 255=白)",
          "min": 0,
          "max": 255,
          "step": 1,
          "value": 128,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "matrixSize",
          "label": "单像素微点阵尺寸 (M×M)",
          "min": 4,
          "max": 16,
          "step": 4,
          "value": 8,
          "unit": "×M"
        },
        {
          "type": "toggle",
          "id": "dispersed",
          "label": "分散抖动排布 (关闭=中心聚类网点)",
          "value": false
        },
        {
          "type": "slider",
          "id": "viewDist",
          "label": "模拟人眼观察距离 (缩放点径)",
          "min": 1,
          "max": 4,
          "step": 1,
          "value": 1,
          "unit": "x"
        }
      ],
      "jsCode": "const ctx = lab.ctx, W = lab.width, H = lab.height;\n\nfunction getRankedCells(M, dispersed) {\n  const cells = [];\n  const mid = (M - 1) / 2;\n  for (let r = 0; r < M; r++) {\n    for (let c = 0; c < M; c++) {\n      let score = 0;\n      if (!dispersed) {\n        const dx = c - mid, dy = r - mid;\n        score = dx * dx + dy * dy + (r * M + c) * 0.0001;\n      } else {\n        const x = Math.floor((c * 16) / M);\n        const y = Math.floor((r * 16) / M);\n        let v = 0;\n        for (let b = 3; b >= 0; b--) {\n          const xb = (x >> b) & 1;\n          const yb = (y >> b) & 1;\n          v = (v << 2) | ((xb ^ yb) << 1) | yb;\n        }\n        score = v + (r * M + c) * 0.0001;\n      }\n      cells.push({ r: r, c: c, score: score });\n    }\n  }\n  cells.sort(function(a, b) { return a.score - b.score; });\n  const rankMap = [];\n  for (let r = 0; r < M; r++) rankMap.push(new Array(M));\n  for (let i = 0; i < cells.length; i++) rankMap[cells[i].r][cells[i].c] = i;\n  return rankMap;\n}\n\nfunction drawHalftone() {\n  const b = lab.values.brightness;\n  const M = lab.values.matrixSize;\n  const dispersed = lab.values.dispersed;\n  const dist = lab.values.viewDist;\n  const totalDots = M * M;\n  const whiteCount = Math.round((b / 255) * totalDots);\n  const rankMap = getRankedCells(M, dispersed);\n\n  ctx.clearRect(0, 0, W, H);\n  ctx.strokeStyle = 'rgba(255,255,255,0.08)';\n  ctx.lineWidth = 1;\n  for (let x = 0; x <= W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }\n  for (let y = 0; y <= H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('1. 理想连续灰度像素', 24, 24);\n  ctx.fillStyle = 'rgb(' + b + ',' + b + ',' + b + ')';\n  ctx.fillRect(24, 38, 120, 120);\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(24, 38, 120, 120);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('目标亮度: ' + b + ' / 255', 24, 178);\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('单点直接呈现灰色', 24, 196);\n\n  const mx = 178, my = 38, mSize = 144;\n  const dotW = mSize / M;\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('2. 半色调微点阵 (' + M + '×' + M + ')', mx, 24);\n  for (let r = 0; r < M; r++) {\n    for (let c = 0; c < M; c++) {\n      const isWhite = rankMap[r][c] < whiteCount;\n      ctx.fillStyle = isWhite ? '#f8fafc' : '#0f172a';\n      ctx.fillRect(mx + c * dotW, my + r * dotW, dotW, dotW);\n      ctx.strokeStyle = 'rgba(56, 189, 248, 0.22)';\n      ctx.lineWidth = 0.5;\n      ctx.strokeRect(mx + c * dotW, my + r * dotW, dotW, dotW);\n    }\n  }\n  ctx.strokeStyle = '#10b981';\n  ctx.lineWidth = 2;\n  ctx.strokeRect(mx, my, mSize, mSize);\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('白点: ' + whiteCount + ' / 黑点: ' + (totalDots - whiteCount), mx, 200);\n\n  const gx = 356, gy = 38, gw = 340, gh = 64;\n  ctx.fillStyle = '#94a3b8';\n  ctx.fillText('3. 渐变对比 (上: 真灰度 | 下: 纯黑白半色调网点)', gx, 24);\n\n  for (let x = 0; x < gw; x++) {\n    const gVal = Math.round((x / (gw - 1)) * 255);\n    ctx.fillStyle = 'rgb(' + gVal + ',' + gVal + ',' + gVal + ')';\n    ctx.fillRect(gx + x, gy, 1, gh);\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.25)';\n  ctx.lineWidth = 1;\n  ctx.strokeRect(gx, gy, gw, gh);\n\n  const gy2 = gy + gh + 16;\n  const dotPx = 5 - dist;\n  const cellPx = M * dotPx;\n  const imgData = ctx.createImageData(gw, gh);\n  const data = imgData.data;\n  for (let py = 0; py < gh; py++) {\n    const mr = Math.floor(py / dotPx) % M;\n    for (let px = 0; px < gw; px++) {\n      const dc = Math.floor(px / dotPx);\n      const mc = dc % M;\n      const logicalCol = Math.floor(dc / M);\n      const pxCenter = Math.min(gw - 1, logicalCol * cellPx + cellPx * 0.5);\n      const gVal = (pxCenter / (gw - 1)) * 255;\n      const wc = Math.round((gVal / 255) * totalDots);\n      const isW = rankMap[mr][mc] < wc;\n      const idx = (py * gw + px) * 4;\n      data[idx] = isW ? 248 : 15;\n      data[idx + 1] = isW ? 250 : 23;\n      data[idx + 2] = isW ? 252 : 42;\n      data[idx + 3] = 255;\n    }\n  }\n  ctx.putImageData(imgData, gx, gy2);\n  ctx.strokeStyle = '#f59e0b';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(gx, gy2, gw, gh);\n\n  const markX = gx + (b / 255) * gw;\n  ctx.strokeStyle = '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath(); ctx.moveTo(markX, gy - 4); ctx.lineTo(markX, gy2 + gh + 4); ctx.stroke();\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.fillText('视距缩放: ' + dist + 'x (物理点径 ' + dotPx + 'px) | 可分辨灰阶: ' + (totalDots + 1) + ' 级', gx, gy2 + gh + 20);\n\n  const pct = Math.round((whiteCount / totalDots) * 100);\n  lab.setReadout('灰度 ' + b + '/255 | 点阵 ' + M + '×' + M + ' (' + (totalDots + 1) + ' 级灰度) | 白点占比: ' + pct + '% | 排布: ' + (dispersed ? '分散抖动' : '中心聚类'));\n}\n\nlab.onUpdate(drawHalftone);"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "【传感器降维权衡】二维面阵贵且难做大（尤其在 X 光、微波或原子级探测波段）；工程上常退而求其次采用 1D 线阵扫描或 0D 逐点扫描，代价是必须有稳定的相对机械运动（移动物体或移动探头），且采集时间按 N 倍或 N² 倍增加。",
        "【像素值不只是光强】图像像素的物理意义取决于传感器类型——在扫描探针显微镜 (SPM) 中，像素灰度直接编码了纳米/原子尺度的表面海拔高度，而非传统反射光亮度。",
        "【别被打印机的 DPI 忽悠】打印机的 DPI 指的是最小纯黑墨点密度，不等于彩色/灰度图像的清晰度 PPI。要在二值设备上用 M×M 半色调网点凑出 256 级灰度（M=16），有效空间分辨率会直接缩水到原本 DPI 的 1/16。"
      ]
    }
  ]
});
