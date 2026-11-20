window.__BOOK_REGISTER_SECTION__("sec_174", {
  "title": "图像扭曲与空间变换 (Warping)",
  "intuition": "通过逆向追踪每个目标像素在原图中的“来源地址”，并利用双线性插值消除亚像素取整带来的锯齿，将球面弯曲、斜视畸变或特效变形的图像精准重塑。",
  "blocks": [
    {
      "type": "concept",
      "heading": "为什么需要图像扭曲？从行星摄影到硬件校正",
      "paragraphs": [
        "用望远镜或卫星拍摄行星表面时，球形表面的曲率会带来明显的空间畸变。当你把行星正对镜头的一小块方形区域拍下来（正视图，Normal View），几小时后行星自转，这块区域转到地平线边缘，再拍下来就会呈现严重的拉伸与弯曲（斜视图，Oblique View）。",
        "虽然这两张照片看起来形状迥异，但它们包含的地理信息其实是等价的，只是观察视角不同。**图像扭曲 (Warping)** 就是实现这种空间几何变换的核心技术：既可以把几千张从正上方俯拍的局部照片扭曲拼接成完整的行星全貌（如金星全球拼图），也可以把气象卫星斜向拍到的飓风画面反向矫正为垂直俯视的视角。",
        "除了航天摄影，Warping 在工业与影视领域同样无处不在。早期的真空管成像器件（如军用夜视仪、医疗 X 光探测器）存在固有的空间几何畸变，需要通过**数字反扭曲 (Dewarping)** 来还原真实几何比例；而电影特效中的**渐变变形 (Morphing)**，本质上也是把一个物体在连续多帧中逐渐扭曲映射成另一个物体（例如人变狼人）。"
      ],
      "formula": null
    },
    {
      "type": "concept",
      "heading": "核心算法：逆向映射与“来源地址 (Comes-from Address)”",
      "paragraphs": [
        "在代码实现上，Warping 接收一张二维数组形式的**原始图像**，并生成另一张二维数组形式的**扭曲图像**。初学者最容易掉进的坑是“正向映射”——遍历原图每个像素并计算它飞到新图的哪里去。这样做往往会在新图上留下大量没有像素落入的“空洞”。",
        "工程上的标准做法是**逆向映射**：遍历**输出（扭曲）图像**中的每一个像素 `(r_dst, c_dst)`，然后反问一句：“这个位置应该填原图里的哪一个像素值？”通过几何变换方程算出它在原图中对应的坐标，在图像处理术语中，这个原图坐标被称为**来源地址 (comes-from address)**。",
        "把像素值从原图搬运到扭曲图像非常简单，真正的难点在于求解每个像素对应的来源地址方程。对于简单的水平或垂直拉伸，来源地址只是行号或列号的简单乘法缩放；但对于球面投影或镜头去畸变，这往往是一个相当复杂的纯数学几何问题。"
      ],
      "formula": {
        "expr": "(r_src, c_src) = f(r_dst, c_dst)  ⇒  Output[r_dst, c_dst] = Input[r_src, c_src]",
        "explain": "r_dst, c_dst 是目标扭曲图像当前正在计算的整数行号与列号；f(...) 是空间逆变换几何方程；r_src, c_src 是算出来的原图“来源地址”（通常是浮点数）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验室 1：球面斜视扭曲与“来源地址”逆向追踪",
      "instruction": "拖动“行星自转斜视角”观察方形地表如何向地平线弯曲，移动目标探测像素坐标观察它在原图中的来源地址，并可开启“反扭曲矫正模式”体验从斜视图还原俯视图。",
      "controls": [
        {
          "type": "slider",
          "id": "rotAngle",
          "label": "行星自转斜视角",
          "min": 0,
          "max": 60,
          "step": 1,
          "value": 36,
          "unit": "°"
        },
        {
          "type": "slider",
          "id": "sampleR",
          "label": "目标行 r_dst",
          "min": 0,
          "max": 7,
          "step": 1,
          "value": 3,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "sampleC",
          "label": "目标列 c_dst",
          "min": 0,
          "max": 7,
          "step": 1,
          "value": 5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "dewarp",
          "label": "反扭曲矫正模式 (斜视 → 俯视)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction pattern(u, v) {\n  if (Math.abs(u) > 1 || Math.abs(v) > 1) return null;\n  const d = Math.hypot(u - 0.15, v + 0.12);\n  let val = 65 + 35 * Math.sin(u * 4.2 + v * 2.8);\n  if (Math.abs(u + 0.65 * v - 0.08) < 0.17) val += 105;\n  if (d < 0.44 && d > 0.25) val += 80;\n  return Math.max(25, Math.min(240, val));\n}\n\nfunction invMap(u, v, k) {\n  const vTmp = v + 0.18 * k * (1 - u * u) - 0.1 * k * u;\n  const v0 = vTmp / (1 - 0.2 * k);\n  const u0 = (u - 0.18 * k * vTmp) / (1 - 0.42 * k + 0.15 * k * vTmp);\n  return [u0, v0];\n}\n\nfunction fwdMap(u0, v0, k) {\n  const vTmp = v0 * (1 - 0.2 * k);\n  const u = u0 * (1 - 0.42 * k + 0.15 * k * vTmp) + 0.18 * k * vTmp;\n  const v = vTmp - 0.18 * k * (1 - u * u) + 0.1 * k * u;\n  return [u, v];\n}\n\nfunction drawPatch(cx, cy, size, mode, k) {\n  const N = 32;\n  const step = size / N;\n  const xStart = cx - size / 2;\n  const yStart = cy - size / 2;\n  for (let r = 0; r < N; r++) {\n    for (let c = 0; c < N; c++) {\n      const u = ((c + 0.5) / N) * 2 - 1;\n      const v = ((r + 0.5) / N) * 2 - 1;\n      let val = null;\n      if (mode === 0) {\n        val = pattern(u, v);\n      } else if (mode === 1) {\n        const p = invMap(u, v, k);\n        val = pattern(p[0], p[1]);\n      } else {\n        const q = fwdMap(u, v, k);\n        if (Math.abs(q[0]) <= 1 && Math.abs(q[1]) <= 1) {\n          const p = invMap(q[0], q[1], k);\n          val = pattern(p[0], p[1]);\n        }\n      }\n      if (val !== null) {\n        const g = Math.round(val);\n        ctx.fillStyle = 'rgb(' + g + ',' + Math.round(g * 0.95) + ',' + Math.round(g * 0.85) + ')';\n        ctx.fillRect(xStart + c * step, yStart + r * step, step + 0.6, step + 0.6);\n      }\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.12)';\n  ctx.lineWidth = 1;\n  const gStep = size / 8;\n  for (let i = 0; i <= 8; i++) {\n    ctx.beginPath();\n    ctx.moveTo(xStart + i * gStep, yStart);\n    ctx.lineTo(xStart + i * gStep, yStart + size);\n    ctx.stroke();\n    ctx.beginPath();\n    ctx.moveTo(xStart, yStart + i * gStep);\n    ctx.lineTo(xStart + size, yStart + i * gStep);\n    ctx.stroke();\n  }\n}\n\nfunction render() {\n  const angle = lab.values.rotAngle;\n  const k = Math.sin(angle * Math.PI / 180) * 0.9;\n  const sr = lab.values.sampleR;\n  const sc = lab.values.sampleC;\n  const dewarp = lab.values.dewarp;\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const size = 160;\n  const lx = 155, ly = 128;\n  const rx = 565, ry = 128;\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(dewarp ? '输入：斜视畸变图像 (Oblique)' : '输入：原始俯视图像 (Normal)', lx, 26);\n  ctx.fillText(dewarp ? '输出：反扭曲还原图像 (Dewarped)' : '输出：球面斜视扭曲图像 (Warped)', rx, 26);\n\n  drawPatch(lx, ly, size, dewarp ? 1 : 0, k);\n  drawPatch(rx, ry, size, dewarp ? 2 : 1, k);\n\n  const uDst = ((sc + 0.5) / 8) * 2 - 1;\n  const vDst = ((sr + 0.5) / 8) * 2 - 1;\n  const srcUV = dewarp ? fwdMap(uDst, vDst, k) : invMap(uDst, vDst, k);\n  const uSrc = srcUV[0];\n  const vSrc = srcUV[1];\n  const inBounds = Math.abs(uSrc) <= 1 && Math.abs(vSrc) <= 1;\n\n  const cellSize = size / 8;\n  const dstPxX = rx - size / 2 + (sc + 0.5) * cellSize;\n  const dstPxY = ry - size / 2 + (sr + 0.5) * cellSize;\n  ctx.strokeStyle = '#38bdf8';\n  ctx.lineWidth = 2.5;\n  ctx.strokeRect(dstPxX - cellSize / 2, dstPxY - cellSize / 2, cellSize, cellSize);\n\n  const srcColF = ((uSrc + 1) / 2) * 8 - 0.5;\n  const srcRowF = ((vSrc + 1) / 2) * 8 - 0.5;\n  const srcPxX = lx - size / 2 + ((uSrc + 1) / 2) * size;\n  const srcPxY = ly - size / 2 + ((vSrc + 1) / 2) * size;\n\n  if (inBounds) {\n    ctx.fillStyle = '#10b981';\n    ctx.beginPath();\n    ctx.arc(srcPxX, srcPxY, 5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.strokeStyle = '#f8fafc';\n    ctx.lineWidth = 1.5;\n    ctx.stroke();\n  }\n\n  ctx.save();\n  ctx.setLineDash([5, 4]);\n  ctx.strokeStyle = inBounds ? '#f59e0b' : '#ec4899';\n  ctx.lineWidth = 2;\n  ctx.beginPath();\n  ctx.moveTo(dstPxX, dstPxY);\n  ctx.quadraticCurveTo((dstPxX + srcPxX) / 2, 48, srcPxX, srcPxY);\n  ctx.stroke();\n  ctx.restore();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = '12px sans-serif';\n  ctx.fillText('逆向查询 comes-from 地址', 360, 118);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.fillText(inBounds ? ('r_src=' + srcRowF.toFixed(2) + ', c_src=' + srcColF.toFixed(2)) : '超出原图有效边界', 360, 138);\n\n  const modeStr = dewarp ? '反扭曲矫正' : '正向球面扭曲';\n  const srcStr = inBounds ? ('(r_src=' + srcRowF.toFixed(2) + ', c_src=' + srcColF.toFixed(2) + ')') : '越界 (填背景黑)';\n  lab.setReadout(modeStr + ' | 倾角: ' + angle + '° | 目标像素 (r=' + sr + ', c=' + sc + ') -> 来源地址: ' + srcStr);\n}\n\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "concept",
      "heading": "亚像素插值：最近邻取整 vs 双线性插值 (Bilinear Interpolation)",
      "paragraphs": [
        "由于逆向映射方程通常涉及浮点运算，算出来的来源地址几乎不可能是整数。例如，我们要计算扭曲图像中第 10 行第 20 列的像素值，代入方程后得到的来源地址可能是 `comes-from row = 20.2`，`comes-from column = 14.5`。原图只在整数网格上有像素值，那小数位置的值该怎么取？",
        "最省事的方法是**最近邻算法 (Nearest Neighbor)**：直接把浮点坐标四舍五入取整（例如 `(20.2, 14.5)` 取整为 `(20, 15)`）。这种方法计算极快，但代价很明显——物体边缘会出现严重的颗粒感和锯齿，某些像素看起来像是错位了一样。",
        "质量高得多的方案是**双线性插值 (Bilinear Interpolation)**。它利用浮点坐标周围最近的四个整数像素来按权重混合，分两步完成：假设第 20、21 行与第 14、15 列的四个像素值分别为 `91, 210`（第20行）和 `162, 95`（第21行）。第一步先在**水平方向**（列 `14` 到 `15`，偏移 `dx = 0.5`）进行线性插值，得到第 20 行的中间值 `150.5` 与第 21 行的中间值 `128.5`；第二步再在这两个中间值之间沿**垂直方向**（行 `20` 到 `21`，偏移 `dy = 0.2`）做一次线性插值，算出最终像素值 `150.5×0.8 + 128.5×0.2 = 146.1`（若 `dy = 0.5` 则正好为 `139.5`）。先水平再垂直，还是先垂直再水平？数学上完全等价，结果一模一样。"
      ],
      "formula": {
        "expr": "P(dy, dx) = (1-dy)·[(1-dx)·P00 + dx·P01] + dy·[(1-dx)·P10 + dx·P11]",
        "explain": "P00, P01, P10, P11 分别是来源地址周围 2×2 的四个整数像素值；dx 和 dy 是来源列号与行号的小数部分（范围 0 到 1）。"
      }
    },
    {
      "type": "lab",
      "heading": "交互实验室 2：双线性插值图解（复现图 23-16）与抗锯齿对比",
      "instruction": "拖动来源行/列的小数坐标，观察左侧 2×2 像素网格中水平与垂直两步插值的精确计算过程；切换“最近邻算法”对比右侧斜边扭曲时的锯齿颗粒感。",
      "controls": [
        {
          "type": "slider",
          "id": "rowFrac",
          "label": "来源行地址 (row)",
          "min": 20,
          "max": 21,
          "step": 0.05,
          "value": 20.2,
          "unit": ""
        },
        {
          "type": "slider",
          "id": "colFrac",
          "label": "来源列地址 (col)",
          "min": 14,
          "max": 15,
          "step": 0.05,
          "value": 14.5,
          "unit": ""
        },
        {
          "type": "toggle",
          "id": "useNearest",
          "label": "切换为最近邻算法 (Nearest Neighbor)",
          "value": false
        }
      ],
      "jsCode": "const ctx = lab.ctx;\nconst W = lab.width;\nconst H = lab.height;\n\nfunction render() {\n  const rowF = lab.values.rowFrac;\n  const colF = lab.values.colFrac;\n  const useNearest = lab.values.useNearest;\n\n  const dy = rowF - 20;\n  const dx = colF - 14;\n  const p00 = 91, p01 = 210, p10 = 162, p11 = 95;\n\n  const topMid = p00 * (1 - dx) + p01 * dx;\n  const botMid = p10 * (1 - dx) + p11 * dx;\n  const bilinearVal = topMid * (1 - dy) + botMid * dy;\n\n  const nearR = dy < 0.5 ? 20 : 21;\n  const nearC = dx < 0.5 ? 14 : 15;\n  const nearVal = (nearR === 20) ? (nearC === 14 ? p00 : p01) : (nearC === 14 ? p10 : p11);\n\n  ctx.fillStyle = '#0b1120';\n  ctx.fillRect(0, 0, W, H);\n\n  const x0 = 75, y0 = 52, bw = 185, bh = 140;\n  const sub = 10;\n  const cols = Math.floor(bw / sub);\n  const rows = Math.floor(bh / sub);\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      const fx = (c + 0.5) / cols;\n      const fy = (r + 0.5) / rows;\n      let v;\n      if (useNearest) {\n        v = (fy < 0.5) ? (fx < 0.5 ? p00 : p01) : (fx < 0.5 ? p10 : p11);\n      } else {\n        const t = p00 * (1 - fx) + p01 * fx;\n        const b = p10 * (1 - fx) + p11 * fx;\n        v = t * (1 - fy) + b * fy;\n      }\n      const g = Math.round(v);\n      ctx.fillStyle = 'rgb(' + g + ',' + g + ',' + g + ')';\n      ctx.fillRect(x0 + c * sub, y0 + r * sub, sub + 0.5, sub + 0.5);\n    }\n  }\n\n  ctx.strokeStyle = 'rgba(255,255,255,0.45)';\n  ctx.lineWidth = 1.5;\n  ctx.strokeRect(x0, y0, bw, bh);\n\n  const px = x0 + dx * bw;\n  const py = y0 + dy * bh;\n\n  if (!useNearest) {\n    ctx.save();\n    ctx.setLineDash([4, 3]);\n    ctx.strokeStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.moveTo(px, y0);\n    ctx.lineTo(px, y0 + bh);\n    ctx.stroke();\n    ctx.strokeStyle = '#10b981';\n    ctx.beginPath();\n    ctx.moveTo(x0, py);\n    ctx.lineTo(px, py);\n    ctx.stroke();\n    ctx.restore();\n\n    ctx.fillStyle = '#38bdf8';\n    ctx.beginPath();\n    ctx.arc(px, y0, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n    ctx.beginPath();\n    ctx.arc(px, y0 + bh, 4.5, 0, Math.PI * 2);\n    ctx.fill();\n\n    ctx.font = 'bold 11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(topMid.toFixed(1), px, y0 - 10);\n    ctx.fillText(botMid.toFixed(1), px, y0 + bh + 18);\n  } else {\n    const nx = x0 + (nearC - 14) * bw;\n    const ny = y0 + (nearR - 20) * bh;\n    ctx.strokeStyle = '#ec4899';\n    ctx.lineWidth = 2;\n    ctx.beginPath();\n    ctx.moveTo(px, py);\n    ctx.lineTo(nx, ny);\n    ctx.stroke();\n  }\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.beginPath();\n  ctx.arc(px, py, 6, 0, Math.PI * 2);\n  ctx.fill();\n  ctx.strokeStyle = '#0b1120';\n  ctx.lineWidth = 1.5;\n  ctx.stroke();\n\n  ctx.fillStyle = '#f59e0b';\n  ctx.font = 'bold 12px monospace';\n  ctx.textAlign = 'left';\n  const showVal = useNearest ? nearVal : bilinearVal.toFixed(1);\n  ctx.fillText('= ' + showVal, Math.min(px + 10, x0 + bw - 36), Math.max(y0 + 18, py - 8));\n\n  function drawCorner(cx, cy, txt, ax, ay) {\n    ctx.fillStyle = '#0f172a';\n    ctx.fillRect(cx - 16, cy - 9, 32, 18);\n    ctx.strokeStyle = '#94a3b8';\n    ctx.lineWidth = 1;\n    ctx.strokeRect(cx - 16, cy - 9, 32, 18);\n    ctx.fillStyle = '#f8fafc';\n    ctx.font = 'bold 11px monospace';\n    ctx.textAlign = 'center';\n    ctx.fillText(txt, cx, cy + 4);\n  }\n  drawCorner(x0, y0, String(p00));\n  drawCorner(x0 + bw, y0, String(p01));\n  drawCorner(x0, y0 + bh, String(p10));\n  drawCorner(x0 + bw, y0 + bh, String(p11));\n\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px monospace';\n  ctx.textAlign = 'center';\n  ctx.fillText('col 14', x0, y0 - 16);\n  ctx.fillText('col 15', x0 + bw, y0 - 16);\n  ctx.textAlign = 'right';\n  ctx.fillText('row 20', x0 - 22, y0 + 4);\n  ctx.fillText('row 21', x0 - 22, y0 + bh + 4);\n  ctx.fillStyle = '#10b981';\n  ctx.fillText(rowF.toFixed(2), x0 - 22, py + 4);\n\n  ctx.fillStyle = '#f8fafc';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText('图 23-16 局部 2×2 像素插值', x0 + bw / 2, 22);\n\n  const rx = 365, ry = 46, rw = 320, rh = 160;\n  const gc = 24, gr = 12;\n  const cw = rw / gc, ch = rh / gr;\n  const cosA = Math.cos(0.36), sinA = Math.sin(0.36);\n\n  function sharpBar(x, y) {\n    const dist = Math.abs(x * sinA + y * cosA);\n    return dist < 1.35 ? 235 : 32;\n  }\n\n  for (let r = 0; r < gr; r++) {\n    for (let c = 0; c < gc; c++) {\n      const sx = (c - gc / 2) * 0.65;\n      const sy = (r - gr / 2) * 0.65;\n      let outV;\n      if (useNearest) {\n        outV = sharpBar(Math.round(sx), Math.round(sy));\n      } else {\n        const ix = Math.floor(sx), iy = Math.floor(sy);\n        const fx = sx - ix, fy = sy - iy;\n        const v00 = sharpBar(ix, iy);\n        const v01 = sharpBar(ix + 1, iy);\n        const v10 = sharpBar(ix, iy + 1);\n        const v11 = sharpBar(ix + 1, iy + 1);\n        const top = v00 * (1 - fx) + v01 * fx;\n        const bot = v10 * (1 - fx) + v11 * fx;\n        outV = top * (1 - fy) + bot * fy;\n      }\n      const gg = Math.round(outV);\n      ctx.fillStyle = 'rgb(' + gg + ',' + Math.round(gg * 0.98) + ',' + Math.round(gg * 0.92) + ')';\n      ctx.fillRect(rx + c * cw, ry + r * ch, cw - 0.8, ch - 0.8);\n    }\n  }\n  ctx.strokeStyle = 'rgba(255,255,255,0.2)';\n  ctx.strokeRect(rx, ry, rw, rh);\n\n  ctx.fillStyle = useNearest ? '#ec4899' : '#10b981';\n  ctx.font = 'bold 13px sans-serif';\n  ctx.textAlign = 'center';\n  ctx.fillText(useNearest ? '斜边放大对比：最近邻（明显锯齿颗粒）' : '斜边放大对比：双线性插值（平滑抗锯齿）', rx + rw / 2, 22);\n  ctx.fillStyle = '#94a3b8';\n  ctx.font = '11px sans-serif';\n  ctx.fillText('白色斜带经过空间旋转扭曲后的像素栅格效果', rx + rw / 2, ry + rh + 18);\n\n  if (useNearest) {\n    lab.setReadout('最近邻算法 | 四舍五入坐标: (row=' + nearR + ', col=' + nearC + ') | 取值 = ' + nearVal + ' | 与双线性结果误差: ' + Math.abs(nearVal - bilinearVal).toFixed(1));\n  } else {\n    lab.setReadout('双线性插值 | 水平中间值: 行20=' + topMid.toFixed(1) + ', 行21=' + botMid.toFixed(1) + ' | 垂直插值最终结果 (' + rowF.toFixed(2) + ', ' + colF.toFixed(2) + ') = ' + bilinearVal.toFixed(1));\n  }\n}\n\nlab.onUpdate(render);\nrender();"
    },
    {
      "type": "summary",
      "heading": "工程直觉与避坑速记",
      "items": [
        "永远优先写“逆向映射”：遍历输出图像素并反推原图 comes-from 地址，能彻底避免正向映射造成的输出图像“空洞”和重采样遗漏。",
        "越界保护不能少：反算出的来源地址经常会落到原图矩形之外（如球面边缘外侧），代码中务必做好边界判断并填入背景默认值。",
        "不要用最近邻算法糊弄边缘：最近邻取整虽然快，但在倾斜边界处会产生严重的锯齿与颗粒感；双线性插值只需 4 个邻近像素的加权平均，就能显著提升视觉质量，且先水平还是先垂直结果完全一致。"
      ]
    }
  ]
});
